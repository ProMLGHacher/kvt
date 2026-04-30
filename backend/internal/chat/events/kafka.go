package events

import (
	"context"
	"encoding/json"
	"log"
	"strings"
	"time"

	chatapp "github.com/araik/codex-webrtc/project/backend/internal/chat/application"
	"github.com/segmentio/kafka-go"
)

const BroadcastTopic = "chat.ws.broadcast"

type KafkaBus struct {
	writer *kafka.Writer
}

func NewKafkaBus(brokers []string) *KafkaBus {
	return &KafkaBus{
		writer: &kafka.Writer{
			Addr:                   kafka.TCP(brokers...),
			AllowAutoTopicCreation: true,
			Balancer:               &kafka.Hash{},
		},
	}
}

func (b *KafkaBus) Publish(event chatapp.Event) {
	payload, err := json.Marshal(event)
	if err != nil {
		log.Printf("[chat-kafka] marshal event failed: %v", err)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	messages := []kafka.Message{
		{Topic: event.Type, Key: []byte(event.SpaceID), Value: payload},
		{Topic: BroadcastTopic, Key: []byte(event.SpaceID), Value: payload},
	}
	if err := b.writer.WriteMessages(ctx, messages...); err != nil {
		log.Printf("[chat-kafka] publish failed: %v", err)
	}
}

func (b *KafkaBus) Close() error {
	return b.writer.Close()
}

func RunBroadcastConsumer(ctx context.Context, brokers []string, groupID string, handler func(chatapp.Event)) {
	if len(brokers) == 0 {
		return
	}
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:        brokers,
		GroupID:        groupID,
		Topic:          BroadcastTopic,
		CommitInterval: time.Second,
	})
	defer reader.Close()
	for {
		message, err := reader.ReadMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return
			}
			log.Printf("[chat-kafka] broadcast consume failed: %v", err)
			continue
		}
		var event chatapp.Event
		if err := json.Unmarshal(message.Value, &event); err != nil {
			log.Printf("[chat-kafka] decode broadcast failed: %v", err)
			continue
		}
		handler(event)
	}
}

func SplitBrokers(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if broker := strings.TrimSpace(part); broker != "" {
			result = append(result, broker)
		}
	}
	return result
}

var _ chatapp.EventSink = (*KafkaBus)(nil)
