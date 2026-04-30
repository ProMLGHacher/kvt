package domain

import "time"

type Space struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"createdAt"`
}

type Channel struct {
	ID        string    `json:"id"`
	SpaceID   string    `json:"spaceId"`
	Title     string    `json:"title"`
	Kind      string    `json:"kind"`
	CreatedAt time.Time `json:"createdAt"`
}

type ParticipantRole string

const (
	RoleHost        ParticipantRole = "host"
	RoleParticipant ParticipantRole = "participant"
)

type Participant struct {
	ID          string          `json:"id"`
	DisplayName string          `json:"displayName"`
	Role        ParticipantRole `json:"role"`
}

type Attachment struct {
	ID          string `json:"id"`
	FileName    string `json:"fileName"`
	ContentType string `json:"contentType"`
	SizeBytes   int64  `json:"sizeBytes"`
	URL         string `json:"url"`
	ObjectKey   string `json:"objectKey,omitempty"`
	PreviewURL  string `json:"previewUrl,omitempty"`
	PosterURL   string `json:"posterUrl,omitempty"`
	Kind        string `json:"kind"`
	Status      string `json:"status"`
	Width       int    `json:"width,omitempty"`
	Height      int    `json:"height,omitempty"`
	DurationMs  int64  `json:"durationMs,omitempty"`
}

type LinkPreview struct {
	URL         string `json:"url"`
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	ImageURL    string `json:"imageUrl,omitempty"`
	SiteName    string `json:"siteName,omitempty"`
	Status      string `json:"status"`
}

type Message struct {
	ID           string              `json:"id"`
	ChannelID    string              `json:"channelId"`
	Author       Participant         `json:"author"`
	BodyMarkdown string              `json:"bodyMarkdown"`
	BodyPlain    string              `json:"bodyPlain"`
	Mentions     []string            `json:"mentions"`
	ReplyToID    string              `json:"replyToId,omitempty"`
	Attachments  []Attachment        `json:"attachments"`
	LinkPreviews []LinkPreview       `json:"linkPreviews"`
	Reactions    map[string][]string `json:"reactions"`
	CreatedAt    time.Time           `json:"createdAt"`
	EditedAt     *time.Time          `json:"editedAt,omitempty"`
	DeletedAt    *time.Time          `json:"deletedAt,omitempty"`
}

type ReadCursor struct {
	ChannelID         string    `json:"channelId"`
	ParticipantID     string    `json:"participantId"`
	LastReadMessageID string    `json:"lastReadMessageId"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

type Snapshot struct {
	SpaceID         string         `json:"spaceId"`
	Participant     Participant    `json:"participant"`
	Channels        []Channel      `json:"channels"`
	Messages        []Message      `json:"messages"`
	ReadCursors     []ReadCursor   `json:"readCursors"`
	UnreadByChannel map[string]int `json:"unreadByChannel"`
}
