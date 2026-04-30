package protocol

import "encoding/json"

const (
	TypeSnapshot        = "chat.snapshot"
	TypeMessageCreated  = "chat.message.created"
	TypeMessageEdited   = "chat.message.edited"
	TypeMessageDeleted  = "chat.message.deleted"
	TypeReactionUpdated = "chat.reaction.updated"
	TypeReadUpdated     = "chat.read.updated"
	TypeError           = "chat.error"
	TypeHeartbeatPing   = "heartbeat.ping"
	TypeHeartbeatPong   = "heartbeat.pong"
)

type Envelope struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

type ErrorPayload struct {
	Message string `json:"message"`
}

func MustEnvelope(messageType string, payload any) Envelope {
	data, err := json.Marshal(payload)
	if err != nil {
		panic(err)
	}
	return Envelope{Type: messageType, Payload: data}
}
