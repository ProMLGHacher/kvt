FROM golang:1.26-alpine AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
ARG SERVICE_CMD=server
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/${SERVICE_CMD}

FROM alpine:3.22

RUN apk add --no-cache ca-certificates wget ffmpeg

WORKDIR /app
COPY --from=builder /out/server /app/server

EXPOSE 8080
CMD ["/app/server"]
