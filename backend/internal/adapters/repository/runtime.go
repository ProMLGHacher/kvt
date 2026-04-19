package repository

import (
	"crypto/rand"
	"encoding/binary"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type RuntimeClock struct{}

func (RuntimeClock) Now() time.Time {
	return time.Now().UTC()
}

type UUIDGenerator struct{}

func (UUIDGenerator) NewID() string {
	return uuid.NewString()
}

type HumanRoomIDGenerator struct{}

func NewHumanRoomIDGenerator() HumanRoomIDGenerator {
	return HumanRoomIDGenerator{}
}

func (HumanRoomIDGenerator) NewID() string {
	adjectives := []string{
		"amber", "bright", "calm", "clear", "cool", "gentle", "golden", "grand",
		"mellow", "misty", "quiet", "rapid", "silver", "smooth", "soft", "steady",
	}
	nouns := []string{
		"brook", "cloud", "dawn", "field", "forest", "harbor", "meadow", "moon",
		"river", "sky", "stone", "sun", "trail", "wave", "wind", "wood",
	}

	seed := secureUint64()
	adjective := adjectives[int(seed%uint64(len(adjectives)))]
	noun := nouns[int((seed/uint64(len(adjectives)))%uint64(len(nouns)))]
	number := int((seed/uint64(len(adjectives)*len(nouns)))%90) + 10

	return adjective + "-" + noun + "-" + twoDigits(number)
}

func secureUint64() uint64 {
	var bytes [8]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return uint64(time.Now().UnixNano())
	}

	return binary.BigEndian.Uint64(bytes[:])
}

func twoDigits(value int) string {
	return fmt.Sprintf("%02d", value)
}
