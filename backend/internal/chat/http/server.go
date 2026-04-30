package http

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	chatapp "github.com/araik/codex-webrtc/project/backend/internal/chat/application"
	"github.com/araik/codex-webrtc/project/backend/internal/chat/cache"
	chatdomain "github.com/araik/codex-webrtc/project/backend/internal/chat/domain"
	"github.com/araik/codex-webrtc/project/backend/internal/chat/protocol"
	"github.com/gorilla/websocket"
)

type Server struct {
	service     *chatapp.Service
	tokens      *chatapp.ChatTokenService
	adminAPIKey string
	publicURL   string
	hub         *Hub
	redis       *cache.RedisCache
	upgrader    websocket.Upgrader
}

func NewServer(service *chatapp.Service, tokens *chatapp.ChatTokenService, adminAPIKey, publicURL string, hub *Hub) *Server {
	return &Server{
		service:     service,
		tokens:      tokens,
		adminAPIKey: adminAPIKey,
		publicURL:   publicURL,
		hub:         hub,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(*http.Request) bool { return true },
		},
	}
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", s.handleHealth)
	mux.HandleFunc("/admin/v1/spaces", s.handleAdminSpaces)
	mux.HandleFunc("/admin/v1/spaces/", s.handleAdminSpaceRoutes)
	mux.HandleFunc("/admin/v1/channels/", s.handleAdminChannelRoutes)
	mux.HandleFunc("/v1/connect", s.handleConnect)
	mux.HandleFunc("/v1/channels/", s.handleChannelRoutes)
	mux.HandleFunc("/v1/messages/", s.handleMessageRoutes)
	mux.HandleFunc("/v1/attachments/uploads", s.handleAttachmentUploads)
	mux.HandleFunc("/v1/attachments/", s.handleAttachmentRoutes)
	return mux
}

func (s *Server) Publish(event chatapp.Event) {
	s.hub.Broadcast(event.SpaceID, EnvelopeForEvent(event))
}

func (s *Server) SetRedisCache(redisCache *cache.RedisCache) {
	s.redis = redisCache
}

type LocalEventSink struct {
	hub *Hub
}

func NewLocalEventSink(hub *Hub) *LocalEventSink {
	return &LocalEventSink{hub: hub}
}

func (s *LocalEventSink) Publish(event chatapp.Event) {
	s.hub.Broadcast(event.SpaceID, EnvelopeForEvent(event))
}

func EnvelopeForEvent(event chatapp.Event) protocol.Envelope {
	return protocol.MustEnvelope(event.Type, event.Payload)
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "chat"})
}

func (s *Server) handleAdminSpaces(w http.ResponseWriter, r *http.Request) {
	if !s.authorizeAdmin(w, r) {
		return
	}
	if r.Method != http.MethodPost {
		http.NotFound(w, r)
		return
	}
	var request struct {
		SpaceID string `json:"spaceId"`
		Title   string `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	if request.SpaceID == "" {
		writeError(w, http.StatusBadRequest, errors.New("missing spaceId"))
		return
	}
	space, err := s.service.CreateSpace(r.Context(), request.SpaceID, fallbackTitle(request.Title, request.SpaceID))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"spaceId": space.ID})
}

func (s *Server) handleAdminSpaceRoutes(w http.ResponseWriter, r *http.Request) {
	if !s.authorizeAdmin(w, r) {
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/admin/v1/spaces/")
	parts := strings.Split(path, "/")
	if len(parts) == 0 || parts[0] == "" {
		http.NotFound(w, r)
		return
	}
	spaceID := parts[0]
	if len(parts) == 2 && parts[1] == "channels" && r.Method == http.MethodPost {
		var request struct {
			ChannelID string `json:"channelId"`
			Title     string `json:"title"`
			Kind      string `json:"kind"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		if request.ChannelID == "" {
			writeError(w, http.StatusBadRequest, errors.New("missing channelId"))
			return
		}
		channel, err := s.service.CreateChannel(r.Context(), spaceID, request.ChannelID, fallbackTitle(request.Title, request.ChannelID), request.Kind)
		if err != nil {
			writeError(w, statusForError(err), err)
			return
		}
		writeJSON(w, http.StatusCreated, map[string]string{"channelId": channel.ID})
		return
	}
	if len(parts) == 2 && parts[1] == "diagnostics" && r.Method == http.MethodGet {
		writeJSON(w, http.StatusOK, map[string]any{"spaceId": spaceID, "service": "chat", "runtime": "in-memory"})
		return
	}
	if len(parts) == 1 && r.Method == http.MethodDelete {
		if err := s.service.DeleteSpace(r.Context(), spaceID); err != nil {
			writeError(w, statusForError(err), err)
			return
		}
		writeJSON(w, http.StatusAccepted, map[string]string{"status": "accepted"})
		return
	}
	http.NotFound(w, r)
}

func (s *Server) handleAdminChannelRoutes(w http.ResponseWriter, r *http.Request) {
	if !s.authorizeAdmin(w, r) {
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/admin/v1/channels/")
	parts := strings.Split(path, "/")
	if len(parts) != 2 || parts[0] == "" || parts[1] != "sessions" || r.Method != http.MethodPost {
		http.NotFound(w, r)
		return
	}
	channelID := parts[0]
	var request struct {
		ParticipantID string `json:"participantId"`
		DisplayName   string `json:"displayName"`
		Role          string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	participant := chatdomain.Participant{ID: request.ParticipantID, DisplayName: request.DisplayName, Role: chatdomain.ParticipantRole(request.Role)}
	channel, err := s.service.CreateSession(r.Context(), channelID, participant)
	if err != nil {
		writeError(w, statusForError(err), err)
		return
	}
	token, err := s.tokens.Create(channel.SpaceID, []string{channel.ID}, participant.ID, participant.DisplayName, string(participant.Role))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"chatUrl":       s.publicURL,
		"chatToken":     token,
		"chatSpaceId":   channel.SpaceID,
		"chatChannelId": channel.ID,
	})
}

func (s *Server) handleConnect(w http.ResponseWriter, r *http.Request) {
	claims, ok := s.authorizeBrowser(w, r)
	if !ok {
		return
	}
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	if s.redis != nil {
		s.redis.SetPresence(r.Context(), claims.SpaceID, claims.ParticipantID)
	}
	s.hub.Register(claims.SpaceID, claims.ParticipantID, conn)
	defer func() {
		s.hub.Unregister(claims.SpaceID, claims.ParticipantID, conn)
		if s.redis != nil {
			s.redis.ClearPresence(context.Background(), claims.SpaceID, claims.ParticipantID)
		}
		_ = conn.Close()
	}()
	snapshot, err := s.service.Snapshot(r.Context(), claims)
	if err != nil {
		_ = conn.WriteJSON(protocol.MustEnvelope(protocol.TypeError, protocol.ErrorPayload{Message: err.Error()}))
		return
	}
	_ = conn.WriteJSON(protocol.MustEnvelope(protocol.TypeSnapshot, snapshot))
	log.Printf("[chat-ws] connected space_id=%s participant_id=%s", claims.SpaceID, claims.ParticipantID)
	for {
		var envelope protocol.Envelope
		if err := conn.ReadJSON(&envelope); err != nil {
			return
		}
		if envelope.Type == protocol.TypeHeartbeatPing {
			_ = conn.WriteJSON(protocol.MustEnvelope(protocol.TypeHeartbeatPong, map[string]string{"status": "ok"}))
		}
	}
}

func (s *Server) handleChannelRoutes(w http.ResponseWriter, r *http.Request) {
	claims, ok := s.authorizeBrowser(w, r)
	if !ok {
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/v1/channels/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[0] == "" {
		http.NotFound(w, r)
		return
	}
	channelID := parts[0]
	switch {
	case len(parts) == 2 && parts[1] == "messages" && r.Method == http.MethodGet:
		limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
		messages, err := s.service.ListMessages(r.Context(), claims, channelID, limit, r.URL.Query().Get("before"), r.URL.Query().Get("after"))
		if err != nil {
			writeError(w, statusForError(err), err)
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"messages": messages})
	case len(parts) == 2 && parts[1] == "messages" && r.Method == http.MethodPost:
		var request struct {
			Markdown    string                  `json:"markdown"`
			ReplyToID   string                  `json:"replyToId"`
			Attachments []chatdomain.Attachment `json:"attachments"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		if !s.allow(r.Context(), claims.ParticipantID+":send", 40, time.Minute) {
			writeError(w, http.StatusTooManyRequests, errors.New("chat send rate limit exceeded"))
			return
		}
		message, err := s.service.SendMessage(r.Context(), claims, channelID, request.Markdown, request.ReplyToID, request.Attachments, r.Header.Get("Idempotency-Key"))
		if err != nil {
			writeError(w, statusForError(err), err)
			return
		}
		writeJSON(w, http.StatusCreated, message)
	case len(parts) == 2 && parts[1] == "read-cursor" && r.Method == http.MethodPost:
		var request struct {
			LastReadMessageID string `json:"lastReadMessageId"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		cursor, err := s.service.MarkRead(r.Context(), claims, channelID, request.LastReadMessageID, r.Header.Get("Idempotency-Key"))
		if err != nil {
			writeError(w, statusForError(err), err)
			return
		}
		writeJSON(w, http.StatusOK, cursor)
	default:
		http.NotFound(w, r)
	}
}

func (s *Server) handleMessageRoutes(w http.ResponseWriter, r *http.Request) {
	claims, ok := s.authorizeBrowser(w, r)
	if !ok {
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/v1/messages/")
	parts := strings.Split(path, "/")
	if len(parts) == 0 || parts[0] == "" {
		http.NotFound(w, r)
		return
	}
	messageID := parts[0]
	if len(parts) == 1 && r.Method == http.MethodPatch {
		var request struct {
			Markdown string `json:"markdown"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			writeError(w, http.StatusBadRequest, err)
			return
		}
		message, err := s.service.EditMessage(r.Context(), claims, messageID, request.Markdown, r.Header.Get("Idempotency-Key"))
		if err != nil {
			writeError(w, statusForError(err), err)
			return
		}
		writeJSON(w, http.StatusOK, message)
		return
	}
	if len(parts) == 1 && r.Method == http.MethodDelete {
		message, err := s.service.DeleteMessage(r.Context(), claims, messageID, r.Header.Get("Idempotency-Key"))
		if err != nil {
			writeError(w, statusForError(err), err)
			return
		}
		writeJSON(w, http.StatusOK, message)
		return
	}
	if len(parts) == 3 && parts[1] == "reactions" && (r.Method == http.MethodPut || r.Method == http.MethodDelete) {
		if !s.allow(r.Context(), claims.ParticipantID+":reaction", 120, time.Minute) {
			writeError(w, http.StatusTooManyRequests, errors.New("chat reaction rate limit exceeded"))
			return
		}
		message, err := s.service.ToggleReaction(r.Context(), claims, messageID, parts[2], r.Header.Get("Idempotency-Key"))
		if err != nil {
			writeError(w, statusForError(err), err)
			return
		}
		writeJSON(w, http.StatusOK, message)
		return
	}
	http.NotFound(w, r)
}

func (s *Server) handleAttachmentUploads(w http.ResponseWriter, r *http.Request) {
	claims, ok := s.authorizeBrowser(w, r)
	if !ok {
		return
	}
	if r.Method != http.MethodPost {
		http.NotFound(w, r)
		return
	}
	var request struct {
		FileName    string `json:"fileName"`
		ContentType string `json:"contentType"`
		SizeBytes   int64  `json:"sizeBytes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	attachment, uploadURL, err := s.service.CreateAttachmentUpload(r.Context(), claims, request.FileName, request.ContentType, request.SizeBytes)
	if err != nil {
		writeError(w, statusForError(err), err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"attachment": attachment, "uploadUrl": uploadURL})
}

func (s *Server) handleAttachmentRoutes(w http.ResponseWriter, r *http.Request) {
	claims, ok := s.authorizeBrowser(w, r)
	if !ok {
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/v1/attachments/")
	parts := strings.Split(path, "/")
	if len(parts) == 0 || parts[0] == "" {
		http.NotFound(w, r)
		return
	}
	attachmentID := parts[0]
	if len(parts) == 2 && parts[1] == "complete" && r.Method == http.MethodPost {
		attachment, err := s.service.CompleteAttachment(r.Context(), claims, attachmentID, r.Header.Get("Idempotency-Key"))
		if err != nil {
			writeError(w, statusForError(err), err)
			return
		}
		writeJSON(w, http.StatusOK, attachment)
		return
	}
	if len(parts) == 1 && r.Method == http.MethodGet {
		attachment, err := s.service.GetAttachment(r.Context(), claims, attachmentID)
		if err != nil {
			writeError(w, statusForError(err), err)
			return
		}
		writeJSON(w, http.StatusOK, attachment)
		return
	}
	http.NotFound(w, r)
}

func (s *Server) allow(ctx context.Context, key string, limit int, window time.Duration) bool {
	if s.redis == nil {
		return true
	}
	return s.redis.Allow(ctx, key, limit, window)
}

func (s *Server) authorizeAdmin(w http.ResponseWriter, r *http.Request) bool {
	if s.adminAPIKey == "" || r.Header.Get("X-Chat-Admin-Key") != s.adminAPIKey {
		writeError(w, http.StatusUnauthorized, errors.New("invalid chat admin key"))
		return false
	}
	return true
}

func (s *Server) authorizeBrowser(w http.ResponseWriter, r *http.Request) (chatapp.ChatTokenClaims, bool) {
	token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	if token == "" {
		token = r.URL.Query().Get("token")
	}
	claims, err := s.tokens.Parse(token)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err)
		return chatapp.ChatTokenClaims{}, false
	}
	return claims, true
}

type Hub struct {
	mu      sync.RWMutex
	clients map[string]map[string]map[*websocket.Conn]struct{}
}

func NewHub() *Hub {
	return &Hub{clients: map[string]map[string]map[*websocket.Conn]struct{}{}}
}

func (h *Hub) Register(spaceID, participantID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.clients[spaceID] == nil {
		h.clients[spaceID] = map[string]map[*websocket.Conn]struct{}{}
	}
	if h.clients[spaceID][participantID] == nil {
		h.clients[spaceID][participantID] = map[*websocket.Conn]struct{}{}
	}
	h.clients[spaceID][participantID][conn] = struct{}{}
}

func (h *Hub) Unregister(spaceID, participantID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.clients[spaceID] == nil || h.clients[spaceID][participantID] == nil {
		return
	}
	delete(h.clients[spaceID][participantID], conn)
}

func (h *Hub) Broadcast(spaceID string, envelope protocol.Envelope) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, connections := range h.clients[spaceID] {
		for conn := range connections {
			_ = conn.WriteJSON(envelope)
		}
	}
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, err error) {
	writeJSON(w, status, map[string]string{"error": err.Error()})
}

func statusForError(err error) int {
	switch {
	case errors.Is(err, chatapp.ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, chatapp.ErrForbidden):
		return http.StatusForbidden
	case errors.Is(err, chatapp.ErrInvalidBody), errors.Is(err, chatapp.ErrFileTooLarge):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

func fallbackTitle(title, fallback string) string {
	if strings.TrimSpace(title) != "" {
		return title
	}
	return fallback
}

var _ chatapp.EventSink = (*Server)(nil)
var _ chatapp.EventSink = (*LocalEventSink)(nil)
var _ = context.Background
