# ConnectHub project context (repo-local)

Use this as the "fast orientation" for this repository. When repo docs disagree, prefer code and the sources listed below.

## What this repo is
- Backend: Java 21 + Spring Boot 4.0.3 (Maven) in `backend/`
- Frontend: React 18 + Vite (port 3001) in `frontend/`
- Database: PostgreSQL (local/prod) + H2 (tests); Flyway migrations in `backend/src/main/resources/db/migration/`
- Cache: Redis (Spring Cache) configured in `backend/src/main/java/com/socialmedia/config/CacheConfig.java`
- Realtime: STOMP over SockJS at `/ws` with JWT auth on STOMP CONNECT
- AI assistant ("Spark"): streams NDJSON from `POST /api/v1/ai/chat`, backed by local Ollama

## Ports and URLs (local dev)
- Frontend: `http://localhost:3001`
- Backend API base: `http://localhost:9090/api/v1`
- WebSocket handshake: `http://localhost:9090/ws` (SockJS)
- Ollama base: `http://localhost:11434` (local) or `http://ollama:11434` (Docker network)
- Postgres: `localhost:5432` (Docker compose)
- Redis: `localhost:6379` (Docker compose)

## Repo layout
- `backend/`: Spring Boot app under `com.socialmedia.*`
- `frontend/`: SPA; routes in `frontend/src/App.jsx`
- `docs/`: OpenAPI and design docs (see "source of truth")
- `deploy/`: docker/prod overlays, nginx config, init SQL
- `e2e/`: Playwright tests

## Source of truth (when docs disagree)
1. Backend code and Flyway migrations
2. `docs/openapi.yaml` for endpoint inventory (should match controllers)
3. `README.md` and `SETUP_GUIDE.md` for run instructions

## Implemented features (high level)
- Auth: JWT register/login (`/api/v1/auth/*`)
- Users: profile, update, password change, delete account (`/api/v1/users/*`)
- Posts: CRUD, like/unlike, share, feeds (page + cursor) (`/api/v1/posts/*`)
- Comments: list/create/delete (`/api/v1/posts/{id}/comments/*`)
- Follow graph: follow/unfollow + accept follow request (private accounts supported by schema)
- Search: users/posts/hashtags (`/api/v1/search/*`)
- Notifications: list/unread + realtime push over WebSocket
- Messaging: 1:1 conversations over REST + realtime WS topics
- Media: upload + serve files from local disk (`backend/uploads/`)
- Admin: stats + user management (`/api/v1/admin/*`, ROLE_ADMIN)
- AI (Spark): streaming NDJSON chat (`/api/v1/ai/chat`) + health (`/api/v1/ai/health`)

## Dev seed data
`backend/src/main/java/com/socialmedia/config/DataSeeder.java` seeds these accounts when the `dev` profile is active:
- `admin` / `Password1!` (ROLE_ADMIN)
- `alice`, `bob`, `carol`, `dave`, `eve` / `Password1!`

## Partially implemented / in progress
- Groups: DB schema exists (`V11__groups_schema.sql`) and entities/repositories exist in `backend/src/main/java/com/socialmedia/group/`, but there are no REST controllers/services wired yet.

## Known doc drift (callouts)
- `docs/ONBOARDING.md` demo credentials do not match `DataSeeder` (use `DataSeeder` as truth).
- `docs/database_schema_doc.md` lists only early migrations; repo currently contains migrations V1 through V11.
- `docs/Deployment_Operations_Manual.md` describes a different stack (Next.js/Node/Express, Kafka, etc.) and is not authoritative unless updated.
- AI model defaults differ by environment: Docker compose sets `AI_MODEL=llama3.2:3b`, while `backend/src/main/resources/application.properties` defaults `ai.model` to `llama3.2:1b`.
