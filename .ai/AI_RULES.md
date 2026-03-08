# ConnectHub AI rules (how to make changes safely)

## General
- Keep API routes under `/api/v1/**`.
- Keep docs in sync for behavior changes: update `docs/openapi.yaml` alongside controller changes.
- Prefer ASCII in docs committed to this repo (avoids encoding/mojibake issues).

## Backend (Spring Boot)
- Layering: Controller -> Service -> Repository -> Entity. Keep controllers thin.
- DTOs: use request/response DTOs for controllers; do not expose entities from controllers.
- Validation: add Jakarta Bean Validation on request DTOs; use `@Valid` at the boundary.
- Migrations: Flyway is authoritative. Never edit old `V*__*.sql` files; add a new migration.
- Security:
  - Default: everything authenticated unless explicitly permitted in `SecurityConfig`.
  - Admin-only endpoints must use role checks (e.g. `@PreAuthorize("hasRole('ADMIN')")`).
- Streaming (AI): NDJSON (`application/x-ndjson`), one JSON object per line, newline-terminated.
- WebSocket: authenticate STOMP CONNECT with the JWT and keep destinations consistent with the frontend.

## Frontend (React)
- API access: use `frontend/src/api/client.js` and keep endpoint wrappers in `frontend/src/api/*.js`.
- Auth: token + user are stored in `localStorage`; rely on the 401 interceptor in `client.js`.
- State: Redux Toolkit slices in `frontend/src/store/`.
- Realtime: use `frontend/src/hooks/useWebSocket.js` (do not create per-page STOMP clients).
- Styling: Tailwind (avoid inline styles unless there is a strong reason).

