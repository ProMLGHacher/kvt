# Backend

The backend is split into four Go processes:

- `cmd/main-server`: product-facing room API and RMS orchestration.
- `cmd/rms-server`: Realtime Media Service for signaling, WebRTC media routing and volatile participant state.
- `cmd/chat-server`: Kvatum Chat Service for chat channels, messages, reactions, read cursors and chat WebSocket fanout.
- `cmd/chat-worker`: async chat worker for attachment/link-preview jobs.

RMS is built around Pion WebRTC.

Responsibilities:

- product room lifecycle in `main-server`;
- realtime room/session lifecycle in `rms-server`;
- chat space/channel/session lifecycle in `chat-server`;
- REST API;
- WebSocket signaling in RMS;
- WebSocket chat events in Chat Service;
- media publisher/subscriber orchestration in RMS;
- OpenAPI/Swagger documentation;
- health checks.

## Source layout

```text
backend/
  cmd/main-server/            product API process entrypoint
  cmd/rms-server/             Realtime Media Service process entrypoint
  cmd/chat-server/            Kvatum Chat Service process entrypoint
  cmd/chat-worker/            async Chat Service worker entrypoint
  cmd/server/                 legacy combined process entrypoint
  internal/config/            environment loading
  internal/domain/            room and media domain models
  internal/application/       use cases and coordinators
  internal/adapters/http/     REST, Swagger, OpenAPI
  internal/adapters/media/    Pion SFU adapter
  internal/adapters/signaling WebSocket hub
  internal/adapters/repository in-memory repositories
  internal/protocol/          signaling message contracts
  internal/chat/              chat domain, application service, HTTP/WS protocol
```

## Local commands

From repository root:

```bash
npm run test:backend
```

Or directly:

```bash
cd backend
go test ./...
go run ./cmd/server
```

Direct `go run` is useful for backend-only work, but full WebRTC testing is easier through Docker
Compose because it also starts nginx and TURN.

## API docs

With the stack running:

```text
http://localhost:8023/api/swagger
http://localhost:8023/api/openapi.json
```

Swagger documents:

- REST endpoints;
- WebSocket endpoint;
- client-to-server signaling messages;
- server-to-client signaling messages.

## Health check

```text
GET /healthz
```

Through local gateway:

```bash
curl -I http://localhost:8023/healthz
```

Inside Docker network, nginx checks backend directly:

```text
http://backend:8080/healthz
```

## Runtime model

Product rooms and RMS realtime rooms are still volatile in v1. Chat Service now has a production
storage path:

- `CHAT_STORAGE=postgres` is the default Docker path;
- `CHAT_STORAGE=inmemory` remains available for tests/dev fallback;
- Postgres stores spaces/channels/messages/reactions/read cursors/attachments/link previews;
- Redis is used for presence and REST rate-limit counters;
- Kafka broadcasts chat events across chat-server instances;
- MinIO/S3 stores attachment objects through presigned upload URLs.

That means:

- product rooms disappear after main-server restart;
- realtime rooms and participant sessions disappear after RMS restart;
- chat messages persist after Chat Service restart when `CHAT_STORAGE=postgres`;
- media/link preview processing is isolated in `chat-worker`, so heavy async work does not block REST/WS paths.

Room-not-found states must be handled by UI because a refresh after restart can point to a room that
no longer exists.

## WebRTC topology

The client uses:

- one publisher PeerConnection for local audio/camera/screen;
- one subscriber PeerConnection for all remote room media.

RMS keeps stable media slots:

- `audio`;
- `camera`;
- `screen`.
- `screenAudio`.

This is designed so camera/screen changes can renegotiate without dropping the audio path.

## Logs

Backend logs are available through Docker:

```bash
cd deploy
docker compose logs --tail=200 backend
```

For WebRTC issues, collect both:

- backend logs;
- exported client logs from the UI.
