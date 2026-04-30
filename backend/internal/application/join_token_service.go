package application

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/araik/codex-webrtc/project/backend/internal/domain"
)

var ErrInvalidJoinToken = errors.New("invalid join token")

type JoinTokenClaims struct {
	Issuer        string                 `json:"iss"`
	ExpiresAt     int64                  `json:"exp"`
	SessionID     string                 `json:"sessionId"`
	RoomID        string                 `json:"roomId"`
	ParticipantID string                 `json:"participantId"`
	DisplayName   string                 `json:"displayName"`
	Role          domain.ParticipantRole `json:"role"`
	AllowedSlots  []domain.SlotKind      `json:"allowedSlots"`
}

type JoinTokenService struct {
	secret []byte
	issuer string
	clock  Clock
	ttl    time.Duration
}

func NewJoinTokenService(secret []byte, issuer string, clock Clock, ttl time.Duration) *JoinTokenService {
	return &JoinTokenService{
		secret: secret,
		issuer: issuer,
		clock:  clock,
		ttl:    ttl,
	}
}

func (s *JoinTokenService) Create(session *domain.PeerSession, participant *domain.Participant) (string, error) {
	return s.Sign(JoinTokenClaims{
		Issuer:        s.issuer,
		ExpiresAt:     s.clock.Now().Add(s.ttl).Unix(),
		SessionID:     session.ID,
		RoomID:        session.RoomID,
		ParticipantID: session.ParticipantID,
		DisplayName:   participant.DisplayName,
		Role:          participant.Role,
		AllowedSlots:  domain.StableSlotKinds,
	})
}

func (s *JoinTokenService) Sign(claims JoinTokenClaims) (string, error) {
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

func (s *JoinTokenService) Parse(token string) (JoinTokenClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return JoinTokenClaims{}, ErrInvalidJoinToken
	}

	unsigned := parts[0] + "." + parts[1]
	if !hmac.Equal([]byte(parts[2]), []byte(s.sign(unsigned))) {
		return JoinTokenClaims{}, ErrInvalidJoinToken
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return JoinTokenClaims{}, ErrInvalidJoinToken
	}

	var claims JoinTokenClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return JoinTokenClaims{}, ErrInvalidJoinToken
	}
	if claims.Issuer != s.issuer || claims.ExpiresAt < s.clock.Now().Unix() || claims.SessionID == "" {
		return JoinTokenClaims{}, ErrInvalidJoinToken
	}

	return claims, nil
}

func (s *JoinTokenService) sign(unsigned string) string {
	mac := hmac.New(sha256.New, s.secret)
	_, _ = mac.Write([]byte(unsigned))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
