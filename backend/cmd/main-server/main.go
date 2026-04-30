package main

import (
	"log"
	"net/http"
	"time"

	httpadapter "github.com/araik/codex-webrtc/project/backend/internal/adapters/http"
	"github.com/araik/codex-webrtc/project/backend/internal/adapters/repository"
	"github.com/araik/codex-webrtc/project/backend/internal/application"
	"github.com/araik/codex-webrtc/project/backend/internal/config"
)

func main() {
	cfg := config.Load()
	roomRepo := repository.NewInMemoryRoomRepository()
	sessionRepo := repository.NewInMemorySessionRepository()
	clock := repository.RuntimeClock{}
	roomIDs := repository.NewHumanRoomIDGenerator()
	ids := repository.UUIDGenerator{}
	invites := application.NewHMACInviteService(cfg.InviteSecret, clock, 24*time.Hour)
	roomService := application.NewRoomService(roomRepo, sessionRepo, invites, clock, roomIDs, ids, cfg.PublicBaseURL, cfg.ICEServers)
	rms := application.NewRMSAdminClient(cfg.RMSInternalURL, cfg.RMSAdminAPIKey)
	chat := application.NewChatAdminClient(cfg.ChatInternalURL, cfg.ChatAdminAPIKey)
	server := httpadapter.NewProductServer(roomService, rms, chat)

	log.Printf("main-server listening on %s", cfg.HTTPAddr)
	if err := http.ListenAndServe(cfg.HTTPAddr, server.Handler()); err != nil {
		log.Fatal(err)
	}
}
