package main

import (
	"context"
	"encoding/json"
	"log"
	"os/exec"
	"time"

	chatapp "github.com/araik/codex-webrtc/project/backend/internal/chat/application"
	"github.com/araik/codex-webrtc/project/backend/internal/chat/domain"
	"github.com/araik/codex-webrtc/project/backend/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/segmentio/kafka-go"
)

func main() {
	cfg := config.Load()
	if len(cfg.ChatKafkaBrokers) == 0 {
		log.Fatal("CHAT_KAFKA_BROKERS is required for chat-worker")
	}
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		log.Printf("chat-worker warning: ffmpeg is not installed; media previews will stay in uploaded state")
	}
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, cfg.ChatPostgresDSN)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()
	for _, topic := range []string{"chat.attachment.uploaded", "chat.link.detected"} {
		topic := topic
		go consume(ctx, cfg.ChatKafkaBrokers, topic, pool)
	}
	log.Printf("chat-worker started")
	select {}
}

func consume(ctx context.Context, brokers []string, topic string, pool *pgxpool.Pool) {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:        brokers,
		GroupID:        "chat-worker",
		Topic:          topic,
		CommitInterval: time.Second,
	})
	defer reader.Close()
	for {
		message, err := reader.ReadMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return
			}
			log.Printf("[chat-worker] consume %s failed: %v", topic, err)
			continue
		}
		var event chatapp.Event
		if err := json.Unmarshal(message.Value, &event); err != nil {
			log.Printf("[chat-worker] decode %s failed: %v", topic, err)
			continue
		}
		// Worker runtime is intentionally separate from chat-server: heavy preview/OG
		// processing must not block user-facing REST/WS paths.
		if event.Type == "chat.attachment.uploaded" {
			if err := markAttachmentReady(ctx, pool, event.Payload); err != nil {
				log.Printf("[chat-worker] attachment processing failed: %v", err)
			}
		}
		log.Printf("[chat-worker] received %s channel=%s", event.Type, event.ChannelID)
	}
}

func markAttachmentReady(ctx context.Context, pool *pgxpool.Pool, payload any) error {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	var attachment domain.Attachment
	if err := json.Unmarshal(payloadBytes, &attachment); err != nil {
		return err
	}
	_, err = pool.Exec(ctx, `update chat_attachments set status = 'ready', updated_at = now() where id = $1`, attachment.ID)
	return err
}
