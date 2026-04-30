package application

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

var ErrInvalidChatToken = errors.New("invalid chat token")

type Clock interface {
	Now() time.Time
}

type ChatTokenClaims struct {
	Issuer        string   `json:"iss"`
	ExpiresAt     int64    `json:"exp"`
	SpaceID       string   `json:"spaceId"`
	ChannelIDs    []string `json:"channelIds"`
	ParticipantID string   `json:"participantId"`
	DisplayName   string   `json:"displayName"`
	Role          string   `json:"role"`
	Permissions   []string `json:"permissions"`
}

type ChatTokenService struct {
	secret []byte
	issuer string
	clock  Clock
	ttl    time.Duration
}

func NewChatTokenService(secret []byte, issuer string, clock Clock, ttl time.Duration) *ChatTokenService {
	return &ChatTokenService{secret: secret, issuer: issuer, clock: clock, ttl: ttl}
}

func (s *ChatTokenService) Create(spaceID string, channelIDs []string, participantID, displayName, role string) (string, error) {
	return s.Sign(ChatTokenClaims{
		Issuer:        s.issuer,
		ExpiresAt:     s.clock.Now().Add(s.ttl).Unix(),
		SpaceID:       spaceID,
		ChannelIDs:    channelIDs,
		ParticipantID: participantID,
		DisplayName:   displayName,
		Role:          role,
		Permissions:   []string{"message:send", "message:edit:self", "message:delete:self", "reaction:toggle", "read:update", "attachment:create"},
	})
}

func (s *ChatTokenService) Sign(claims ChatTokenClaims) (string, error) {
	header, err := json.Marshal(map[string]string{"alg": "HS256", "typ": "JWT"})
	if err != nil {
		return "", err
	}
	payload, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	unsigned := base64.RawURLEncoding.EncodeToString(header) + "." + base64.RawURLEncoding.EncodeToString(payload)
	return unsigned + "." + s.sign(unsigned), nil
}

func (s *ChatTokenService) Parse(token string) (ChatTokenClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return ChatTokenClaims{}, ErrInvalidChatToken
	}
	unsigned := parts[0] + "." + parts[1]
	if !hmac.Equal([]byte(parts[2]), []byte(s.sign(unsigned))) {
		return ChatTokenClaims{}, ErrInvalidChatToken
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return ChatTokenClaims{}, ErrInvalidChatToken
	}
	var claims ChatTokenClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return ChatTokenClaims{}, ErrInvalidChatToken
	}
	if claims.Issuer != s.issuer || claims.ExpiresAt < s.clock.Now().Unix() || claims.SpaceID == "" || claims.ParticipantID == "" {
		return ChatTokenClaims{}, ErrInvalidChatToken
	}
	return claims, nil
}

func (s *ChatTokenService) sign(unsigned string) string {
	mac := hmac.New(sha256.New, s.secret)
	_, _ = mac.Write([]byte(unsigned))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
