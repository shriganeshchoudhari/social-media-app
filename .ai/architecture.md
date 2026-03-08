# Architecture (current implementation)

## High level
ConnectHub is a monolith-first app:
- React SPA (Vite) on port 3001
- Spring Boot API on port 9090
- PostgreSQL + Flyway for persistence
- Redis for caching (Spring Cache)
- STOMP over SockJS at `/ws` for realtime chat and notifications
- Ollama for local LLM inference (Spark AI assistant)

## Docker compose services (local)
- `postgres` (5432): primary DB
- `redis` (6379): cache store
- `ollama` (11434): LLM runtime
- `ollama-init`: one-time model pull
- `backend` (9090): Spring Boot
- `frontend` (3001): Vite dev server

## Backend package map
All backend code lives under `backend/src/main/java/com/socialmedia/`:
- `auth/`: register/login, JWT filter/service
- `user/`: profiles, settings, password change, account delete
- `post/`: posts CRUD, feed (page + cursor), likes, shares
- `comment/`: post comments
- `follow/`: follow graph and follow-request accept flow
- `bookmark/`: saved posts
- `messaging/`: REST messaging and persistence
- `notification/`: notifications + preferences + async events
- `media/`: upload + serving
- `admin/`: admin-only endpoints
- `ai/`: Spark AI controller/service + Ollama HTTP client
- `websocket/`: STOMP config and message/typing handlers
- `config/`: security, caching, seed data, rate limiting

## Key flows

### Authenticated REST
1. Frontend attaches `Authorization: Bearer <jwt>` (Axios in `frontend/src/api/client.js`)
2. Backend validates JWT and populates the security context
3. Controller -> Service -> Repository

### WebSocket (STOMP over SockJS)
- Handshake: `/ws`
- STOMP CONNECT includes `Authorization: Bearer <jwt>`
- Subscriptions:
  - `/user/queue/notifications`
  - `/topic/chat/{conversationId}`
  - `/topic/typing/{conversationId}`
- Publishes:
  - `/app/send-message`
  - `/app/typing`

### AI streaming (NDJSON)
- Frontend calls `POST /api/v1/ai/chat`
- Backend streams `application/x-ndjson` via `StreamingResponseBody`
- Backend calls Ollama `/api/chat` and relays token deltas as NDJSON lines

