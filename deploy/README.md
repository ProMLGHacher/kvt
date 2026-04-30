# Deploy Contours

This directory contains both Docker contours for the project.

- `docker-compose.yml` - production-like contour.
- `docker-compose.dev.yml` - development override with hot reload.
- `.env` - server / production-like environment.
- `.env.dev` - ready-to-run localhost development environment.

## Services

- `nginx` - the only host-exposed gateway, published on `8023`.
- `main-server` - product HTTP API, internal-only in the Docker network.
- `rms` - Realtime Media Service: signaling, WebRTC routing and volatile realtime state.
- `chat-server` - Kvatum Chat Service: chat rooms, messages, reactions and chat WebSocket fanout.
- `chat-worker` - async attachment and link-preview worker process.
- `postgres` - default Chat Service persistence dependency.
- `redis` - chat cache/presence/rate-limit dependency.
- `kafka` in prod / `redpanda` in dev - chat async event broker.
- `minio` - S3-compatible attachment storage for local and production-like runs.
- `web` - production static build in prod contour, Vite dev server in dev contour.
- `turn` - coturn for browser relay traffic.

## Run development contour

```bash
npm run stack:dev
```

Open the app at [http://localhost:8023](http://localhost:8023).

## Run production-like contour

```bash
npm run stack:prod
```

## Stop

```bash
npm run stack:dev:down
npm run stack:prod:down
```

## Environment files

- `.env.dev` is tuned for localhost development on this machine.
- `.env` remains the server-oriented environment file.
- For LAN phone testing, start from `.env.dev` and replace host/IP values with your LAN address.

## Notes

- `nginx` remains the only HTTP entrypoint on the host.
- In dev, nginx proxies `/` to Vite on port `5173`, so frontend changes reload without rebuilding.
- For local WebRTC media checks, the stack also publishes RMS UDP ICE ports and TURN relay ports. Without those extra ports, local audio/video validation would not be realistic.
- The frontend uses same-origin requests through `nginx`, so `/api` is reverse-proxied to main-server, `/v1/connect` is reverse-proxied to RMS, and `/chat/*` is reverse-proxied to Chat Service.
- The TURN service is configured for local development and should be replaced with real certificates and a public `external-ip` in production.
- main-server and RMS still keep v1 runtime state in process memory.
- Chat Service defaults to `CHAT_STORAGE=postgres`; use `CHAT_STORAGE=inmemory` only for tests/dev fallback.
