package httpadapter

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/araik/codex-webrtc/project/backend/internal/application"
)

type ProductServer struct {
	roomService *application.RoomService
	rms         *application.RMSAdminClient
	chat        *application.ChatAdminClient
}

func NewProductServer(roomService *application.RoomService, rms *application.RMSAdminClient, chat *application.ChatAdminClient) *ProductServer {
	return &ProductServer{
		roomService: roomService,
		rms:         rms,
		chat:        chat,
	}
}

func (s *ProductServer) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", s.handleHealth)
	mux.HandleFunc("/api/openapi.json", s.handleOpenAPI)
	mux.HandleFunc("/api/swagger", s.handleSwagger)
	mux.HandleFunc("/api/rooms", s.handleCreateRoom)
	mux.HandleFunc("/api/rooms/", s.handleRoomRoutes)
	return mux
}

func (s *ProductServer) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "main-server"})
}

func (s *ProductServer) handleOpenAPI(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(openAPISpec)
}

func (s *ProductServer) handleSwagger(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(swaggerHTML)
}

func (s *ProductServer) handleCreateRoom(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.NotFound(w, r)
		return
	}

	result, err := s.roomService.CreateRoomForBaseURL(r.Context(), requestBaseURL(r))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	if err := s.rms.CreateRoom(r.Context(), result.RoomID); err != nil {
		writeError(w, http.StatusBadGateway, err)
		return
	}
	if s.chat != nil {
		channelID := chatChannelID(result.RoomID)
		if err := s.chat.CreateSpace(r.Context(), result.RoomID, "Conference "+result.RoomID); err != nil {
			writeError(w, http.StatusBadGateway, err)
			return
		}
		if err := s.chat.CreateChannel(r.Context(), result.RoomID, channelID, "Conference chat"); err != nil {
			writeError(w, http.StatusBadGateway, err)
			return
		}
	}

	log.Printf("[product-http] create-room room_id=%s", result.RoomID)
	writeJSON(w, http.StatusCreated, result)
}

func (s *ProductServer) handleRoomRoutes(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/rooms/")
	parts := strings.Split(path, "/")
	if len(parts) == 0 || parts[0] == "" {
		http.NotFound(w, r)
		return
	}

	roomID := parts[0]

	if len(parts) == 1 && r.Method == http.MethodGet {
		metadata, err := s.roomService.GetRoomMetadata(r.Context(), roomID)
		if err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, application.ErrRoomNotFound) {
				status = http.StatusNotFound
			}
			writeError(w, status, err)
			return
		}
		writeJSON(w, http.StatusOK, metadata)
		return
	}

	if len(parts) == 2 && parts[1] == "join" && r.Method == http.MethodPost {
		var prefs application.PrejoinPreferences
		if err := json.NewDecoder(r.Body).Decode(&prefs); err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}

		if _, err := s.roomService.GetRoomMetadata(r.Context(), roomID); err != nil {
			writeError(w, http.StatusNotFound, err)
			return
		}

		result, err := s.rms.CreateSession(r.Context(), roomID, prefs)
		if err != nil {
			writeError(w, http.StatusBadGateway, err)
			return
		}
		if s.chat != nil {
			channelID := chatChannelID(roomID)
			if err := s.chat.CreateSpace(r.Context(), roomID, "Conference "+roomID); err != nil {
				writeError(w, http.StatusBadGateway, err)
				return
			}
			if err := s.chat.CreateChannel(r.Context(), roomID, channelID, "Conference chat"); err != nil {
				writeError(w, http.StatusBadGateway, err)
				return
			}
			chat, err := s.chat.CreateSession(r.Context(), channelID, result.ParticipantID, prefs)
			if err != nil {
				writeError(w, http.StatusBadGateway, err)
				return
			}
			result.ChatURL = chat.ChatURL
			result.ChatToken = chat.ChatToken
			result.ChatSpaceID = chat.ChatSpaceID
			result.ChatChannelID = chat.ChatChannelID
		}

		log.Printf("[product-http] join-room room_id=%s participant_id=%s role=%s", result.RoomID, result.ParticipantID, result.Role)
		writeJSON(w, http.StatusOK, result)
		return
	}

	http.NotFound(w, r)
}

func chatChannelID(roomID string) string {
	return roomID + ":conference"
}
