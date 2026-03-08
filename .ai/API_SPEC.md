# API spec (where it lives and what is special)

## Source of truth
- OpenAPI: `docs/openapi.yaml`
- Controllers: `backend/src/main/java/com/socialmedia/*/*Controller.java`

## Auth
- Bearer JWT: `Authorization: Bearer <token>`
- Public endpoints are configured in `backend/src/main/java/com/socialmedia/config/SecurityConfig.java`.

## Special protocols

### AI streaming (NDJSON)
- `POST /api/v1/ai/chat`
- Response: `application/x-ndjson`
  - token: `{"delta":"..."}`
  - done: `{"done":true}`
  - in-stream error: `{"error":"rate_limit"|"ai_unavailable", ...}`

### WebSocket (STOMP over SockJS)
- Handshake: `/ws`
- Subscribe: `/user/queue/notifications`, `/topic/chat/{id}`, `/topic/typing/{id}`
- Publish: `/app/send-message`, `/app/typing`

## Updating the spec
- If you add/change controllers or DTOs, update `docs/openapi.yaml` in the same PR.

