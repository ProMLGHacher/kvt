package httpadapter

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/araik/codex-webrtc/project/backend/internal/adapters/signaling"
	"github.com/araik/codex-webrtc/project/backend/internal/application"
	"github.com/araik/codex-webrtc/project/backend/internal/domain"
	"github.com/araik/codex-webrtc/project/backend/internal/protocol"
	"github.com/gorilla/websocket"
)

type RealtimeMediaServer struct {
	roomService  *application.RoomService
	coordinator  *application.SignalingCoordinator
	hub          *signaling.Hub
	tokens       *application.JoinTokenService
	adminAPIKey  string
	rmsPublicURL string
	upgrader     websocket.Upgrader
}

func NewRealtimeMediaServer(
	roomService *application.RoomService,
	coordinator *application.SignalingCoordinator,
	hub *signaling.Hub,
	tokens *application.JoinTokenService,
	adminAPIKey string,
	rmsPublicURL string,
) *RealtimeMediaServer {
	return &RealtimeMediaServer{
		roomService:  roomService,
		coordinator:  coordinator,
		hub:          hub,
		tokens:       tokens,
		adminAPIKey:  adminAPIKey,
		rmsPublicURL: rmsPublicURL,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(*http.Request) bool { return true },
		},
	}
}

func (s *RealtimeMediaServer) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", s.handleHealth)
	mux.HandleFunc("/admin/v1/rooms", s.handleAdminRooms)
	mux.HandleFunc("/admin/v1/rooms/", s.handleAdminRoomRoutes)
	mux.HandleFunc("/v1/connect", s.handleConnect)
	return mux
}

func (s *RealtimeMediaServer) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "rms"})
}

func (s *RealtimeMediaServer) handleAdminRooms(w http.ResponseWriter, r *http.Request) {
	if !s.authorizeAdmin(w, r) {
		return
	}
	if r.Method != http.MethodPost {
		http.NotFound(w, r)
		return
	}

	var request struct {
		RoomID string `json:"roomId"`
	}
	_ = json.NewDecoder(r.Body).Decode(&request)
	if request.RoomID == "" {
		writeError(w, http.StatusBadRequest, errors.New("missing roomId"))
		return
	}

	result, err := s.roomService.CreateRoomWithID(r.Context(), request.RoomID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"realtimeRoomId": result.RoomID})
}

func (s *RealtimeMediaServer) handleAdminRoomRoutes(w http.ResponseWriter, r *http.Request) {
	if !s.authorizeAdmin(w, r) {
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/admin/v1/rooms/")
	parts := strings.Split(path, "/")
	if len(parts) == 0 || parts[0] == "" {
		http.NotFound(w, r)
		return
	}
	roomID := parts[0]

	if len(parts) == 1 && r.Method == http.MethodGet {
		metadata, err := s.roomService.GetRoomMetadata(r.Context(), roomID)
		if err != nil {
			writeError(w, http.StatusNotFound, err)
			return
		}
		writeJSON(w, http.StatusOK, metadata)
		return
	}

	if len(parts) == 2 && parts[1] == "sessions" && r.Method == http.MethodPost {
		var prefs application.PrejoinPreferences
		if err := json.NewDecoder(r.Body).Decode(&prefs); err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}

		result, err := s.roomService.JoinRoomByID(r.Context(), roomID, prefs, requestBaseURL(r))
		if err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, application.ErrRoomNotFound) {
				status = http.StatusNotFound
			}
			writeError(w, status, err)
			return
		}

		token, err := s.tokens.Sign(application.JoinTokenClaims{
			Issuer:        "kvatum-rms",
			ExpiresAt:     time.Now().Add(10 * time.Minute).Unix(),
			SessionID:     result.SessionID,
			RoomID:        result.RoomID,
			ParticipantID: result.ParticipantID,
			DisplayName:   prefs.DisplayName,
			Role:          result.Role,
			AllowedSlots:  domain.StableSlotKinds,
		})
		if err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		result.JoinToken = token
		result.RMSURL = s.rmsPublicURL
		writeJSON(w, http.StatusOK, result)
		return
	}

	if len(parts) == 2 && (parts[1] == "end" || parts[1] == "") && r.Method == http.MethodPost {
		if err := s.roomService.DeleteRoom(r.Context(), roomID); err != nil {
			writeError(w, http.StatusNotFound, err)
			return
		}
		writeJSON(w, http.StatusAccepted, map[string]string{"status": "accepted"})
		return
	}

	if len(parts) == 1 && r.Method == http.MethodDelete {
		if err := s.roomService.DeleteRoom(r.Context(), roomID); err != nil {
			writeError(w, http.StatusNotFound, err)
			return
		}
		writeJSON(w, http.StatusAccepted, map[string]string{"status": "accepted"})
		return
	}

	http.NotFound(w, r)
}

func (s *RealtimeMediaServer) handleConnect(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	claims, err := s.tokens.Parse(token)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err)
		return
	}

	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	sessionID := claims.SessionID
	log.Printf("[rms-ws] connected session_id=%s room_id=%s participant_id=%s remote=%s", sessionID, claims.RoomID, claims.ParticipantID, r.RemoteAddr)
	s.hub.Register(sessionID, conn)
	defer func() {
		s.hub.Unregister(sessionID)
		_ = s.coordinator.OnDisconnected(context.Background(), sessionID)
		_ = conn.Close()
		log.Printf("[rms-ws] disconnected session_id=%s remote=%s", sessionID, r.RemoteAddr)
	}()

	if err := s.coordinator.OnConnected(context.Background(), sessionID); err != nil {
		_ = conn.WriteJSON(protocol.MustEnvelope(protocol.TypeError, protocol.ErrorPayload{Message: err.Error()}))
		return
	}

	for {
		_, data, err := conn.ReadMessage()
		if err != nil {
			return
		}

		envelope, err := signaling.DecodeEnvelope(data)
		if err != nil {
			_ = conn.WriteJSON(protocol.MustEnvelope(protocol.TypeError, protocol.ErrorPayload{Message: err.Error()}))
			continue
		}

		if envelope.Type == protocol.TypeHeartbeatPing {
			var payload protocol.HeartbeatPayload
			_ = json.Unmarshal(envelope.Payload, &payload)
			_ = conn.WriteJSON(protocol.MustEnvelope(protocol.TypeHeartbeatPong, payload))
			continue
		}

		if err := s.coordinator.HandleEnvelope(context.Background(), sessionID, envelope); err != nil {
			_ = conn.WriteJSON(protocol.MustEnvelope(protocol.TypeError, protocol.ErrorPayload{Message: err.Error()}))
		}
	}
}

func (s *RealtimeMediaServer) authorizeAdmin(w http.ResponseWriter, r *http.Request) bool {
	if s.adminAPIKey == "" || r.Header.Get("X-RMS-Admin-Key") == s.adminAPIKey {
		return true
	}

	writeError(w, http.StatusUnauthorized, errors.New("invalid RMS admin key"))
	return false
}
