package main

import (
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/araik/codex-webrtc/project/backend/internal/adapters/repository"
	chatapp "github.com/araik/codex-webrtc/project/backend/internal/chat/application"
	"github.com/araik/codex-webrtc/project/backend/internal/chat/cache"
	"github.com/araik/codex-webrtc/project/backend/internal/chat/events"
	chathttp "github.com/araik/codex-webrtc/project/backend/internal/chat/http"
	chatobject "github.com/araik/codex-webrtc/project/backend/internal/chat/storage/object"
	chatpostgres "github.com/araik/codex-webrtc/project/backend/internal/chat/storage/postgres"
	"github.com/araik/codex-webrtc/project/backend/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()
	clock := repository.RuntimeClock{}
	hub := chathttp.NewHub()
	var store chatapp.Store
	var objectStorage chatapp.ObjectStorage
	if strings.EqualFold(cfg.ChatStorage, "postgres") {
		pool, err := pgxpool.New(ctx, cfg.ChatPostgresDSN)
		if err != nil {
			log.Fatal(err)
		}
		defer pool.Close()
		if cfg.ChatAutoMigrate {
			if err := chatpostgres.Migrate(ctx, pool); err != nil {
				log.Fatal(err)
			}
		}
		store = chatpostgres.NewStore(pool)
		log.Printf("chat storage: postgres")
	} else {
		log.Printf("chat storage: in-memory")
	}
	if cfg.ChatS3Bucket != "" && cfg.ChatS3Endpoint != "" {
		s3Storage, err := chatobject.NewS3ObjectStorage(ctx, chatobject.S3Config{
			Endpoint:      cfg.ChatS3Endpoint,
			Region:        cfg.ChatS3Region,
			Bucket:        cfg.ChatS3Bucket,
			AccessKey:     cfg.ChatS3AccessKey,
			SecretKey:     cfg.ChatS3SecretKey,
			PublicBaseURL: cfg.ChatS3PublicBaseURL,
		})
		if err != nil {
			log.Fatal(err)
		}
		objectStorage = s3Storage
	}
	var eventSink chatapp.EventSink
	if len(cfg.ChatKafkaBrokers) > 0 && !strings.EqualFold(cfg.ChatKafkaBrokers[0], "disabled") {
		kafkaBus := events.NewKafkaBus(cfg.ChatKafkaBrokers)
		defer kafkaBus.Close()
		eventSink = kafkaBus
		go events.RunBroadcastConsumer(ctx, cfg.ChatKafkaBrokers, "chat-server", func(event chatapp.Event) {
			hub.Broadcast(event.SpaceID, chathttp.EnvelopeForEvent(event))
		})
		log.Printf("chat events: kafka")
	}
	if eventSink == nil {
		eventSink = chathttp.NewLocalEventSink(hub)
	}
	var redisCache *cache.RedisCache
	if cfg.ChatRedisURL != "" {
		if created, err := cache.NewRedisCache(cfg.ChatRedisURL); err == nil {
			redisCache = created
			defer redisCache.Close()
		} else {
			log.Printf("chat redis disabled: %v", err)
		}
	}
	service := chatapp.NewServiceWithStore(clock, store, objectStorage, eventSink)
	tokens := chatapp.NewChatTokenService(cfg.ChatJoinSecret, "kvatum-chat", clock, 24*time.Hour)
	server := chathttp.NewServer(service, tokens, cfg.ChatAdminAPIKey, cfg.ChatPublicURL, hub)
	server.SetRedisCache(redisCache)

	log.Printf("chat-server listening on %s", cfg.HTTPAddr)
	if err := http.ListenAndServe(cfg.HTTPAddr, server.Handler()); err != nil {
		log.Fatal(err)
	}
}
