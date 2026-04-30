package config

import (
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/araik/codex-webrtc/project/backend/internal/application"
)

type MediaConfig struct {
	PublicIP   string
	UDPPortMin uint16
	UDPPortMax uint16
}

type Config struct {
	HTTPAddr            string
	PublicBaseURL       *url.URL
	InviteSecret        []byte
	RMSInternalURL      string
	RMSPublicURL        string
	RMSAdminAPIKey      string
	RMSJoinSecret       []byte
	ChatInternalURL     string
	ChatPublicURL       string
	ChatAdminAPIKey     string
	ChatJoinSecret      []byte
	ChatStorage         string
	ChatAutoMigrate     bool
	ChatPostgresDSN     string
	ChatRedisURL        string
	ChatKafkaBrokers    []string
	ChatS3Endpoint      string
	ChatS3Region        string
	ChatS3Bucket        string
	ChatS3AccessKey     string
	ChatS3SecretKey     string
	ChatS3PublicBaseURL string
	ICEServers          []application.ICEConfig
	Media               MediaConfig
}

func Load() Config {
	publicBaseURL, _ := url.Parse(getEnv("PUBLIC_BASE_URL", "http://localhost:5173"))
	rmsPublicURL := getEnv("RMS_PUBLIC_URL", publicBaseURL.String())
	chatPublicURL := getEnv("CHAT_PUBLIC_URL", publicBaseURL.String())
	return Config{
		HTTPAddr:            getEnv("HTTP_ADDR", ":8080"),
		PublicBaseURL:       publicBaseURL,
		InviteSecret:        []byte(getEnv("INVITE_SECRET", "local-dev-secret")),
		RMSInternalURL:      getEnv("RMS_INTERNAL_URL", "http://localhost:8081"),
		RMSPublicURL:        rmsPublicURL,
		RMSAdminAPIKey:      getEnv("RMS_ADMIN_API_KEY", "local-rms-admin-key"),
		RMSJoinSecret:       []byte(getEnv("RMS_JOIN_SECRET", "local-rms-join-secret")),
		ChatInternalURL:     getEnv("CHAT_INTERNAL_URL", "http://localhost:8082"),
		ChatPublicURL:       chatPublicURL,
		ChatAdminAPIKey:     getEnv("CHAT_ADMIN_API_KEY", "local-chat-admin-key"),
		ChatJoinSecret:      []byte(getEnv("CHAT_JOIN_SECRET", "local-chat-join-secret")),
		ChatStorage:         getEnv("CHAT_STORAGE", "postgres"),
		ChatAutoMigrate:     getEnvBool("CHAT_AUTO_MIGRATE", true),
		ChatPostgresDSN:     getEnv("CHAT_POSTGRES_DSN", "postgres://kvatum:kvatum@localhost:5432/kvatum?sslmode=disable"),
		ChatRedisURL:        getEnv("CHAT_REDIS_URL", "redis://localhost:6379/0"),
		ChatKafkaBrokers:    splitCSV(getEnv("CHAT_KAFKA_BROKERS", "")),
		ChatS3Endpoint:      getEnv("CHAT_S3_ENDPOINT", "http://localhost:9000"),
		ChatS3Region:        getEnv("CHAT_S3_REGION", "us-east-1"),
		ChatS3Bucket:        getEnv("CHAT_S3_BUCKET", "kvatum-chat"),
		ChatS3AccessKey:     getEnv("CHAT_S3_ACCESS_KEY", "minioadmin"),
		ChatS3SecretKey:     getEnv("CHAT_S3_SECRET_KEY", "minioadmin"),
		ChatS3PublicBaseURL: getEnv("CHAT_S3_PUBLIC_BASE_URL", "http://localhost:9000/kvatum-chat"),
		ICEServers: []application.ICEConfig{
			{
				URLs:       []string{getEnv("TURN_URL", "turn:localhost:3478?transport=udp")},
				Username:   getEnv("TURN_USERNAME", "voice"),
				Credential: getEnv("TURN_PASSWORD", "voice-secret"),
			},
			{
				URLs:       []string{getEnv("TURN_TLS_URL", "turns:localhost:5349?transport=tcp")},
				Username:   getEnv("TURN_USERNAME", "voice"),
				Credential: getEnv("TURN_PASSWORD", "voice-secret"),
			},
		},
		Media: MediaConfig{
			PublicIP:   getEnv("ICE_PUBLIC_IP", ""),
			UDPPortMin: getEnvUint16("ICE_UDP_PORT_MIN", 0),
			UDPPortMax: getEnvUint16("ICE_UDP_PORT_MAX", 0),
		},
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func getEnvUint16(key string, fallback uint16) uint16 {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		return fallback
	}

	parsed, err := strconv.ParseUint(value, 10, 16)
	if err != nil {
		return fallback
	}

	return uint16(parsed)
}

func getEnvBool(key string, fallback bool) bool {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if item := strings.TrimSpace(part); item != "" {
			result = append(result, item)
		}
	}
	return result
}
