package repository

import (
	"regexp"
	"testing"
)

func TestHumanRoomIDGeneratorFormat(t *testing.T) {
	generator := NewHumanRoomIDGenerator()

	roomID := generator.NewID()

	pattern := regexp.MustCompile(`^[a-z]+-[a-z]+-\d{2}$`)
	if !pattern.MatchString(roomID) {
		t.Fatalf("expected room id %q to match adjective-noun-number format", roomID)
	}
}

