# ConnectHub — Developer Onboarding Checklist

Welcome to ConnectHub! This guide gets a new developer from zero to a fully running local environment in under 30 minutes.

---

## Prerequisites

| Tool | Minimum version | Check |
|------|----------------|-------|
| Java (JDK) | 21 | `java -version` |
| Maven | 3.9 | `mvn -version` |
| Node.js | 20 LTS | `node -version` |
| npm | 10 | `npm -version` |
| Docker Desktop | 4.x | `docker -version` |
| Docker Compose | v2 (bundled) | `docker compose version` |
| Git | any | `git -version` |
| Ollama *(optional for AI)* | latest | `ollama -v` |

---

## Step 1 — Clone the repository

```bash
git clone https://github.com/your-org/connecthub.git
cd connecthub
```

---

## Step 2 — Start infrastructure (PostgreSQL + pgAdmin)

```bash
# Spin up only the database services (fast, no build required)
docker compose up -d postgres pgadmin
```

Wait ~10 s for Postgres to initialise, then verify:
```bash
docker compose ps        # postgres should show "healthy"
```

pgAdmin is available at http://localhost:5050  
Login: `admin@connecthub.com` / `admin`

---

## Step 3 — Start the backend

```bash
cd backend
mvn clean spring-boot:run -Dspring-boot.run.profiles=dev
```

The `dev` profile activates:
- H2 console at http://localhost:9090/h2-console *(only if using H2 test config)*
- `DataSeeder` — inserts 5 demo users, 10 posts, likes, comments, and notifications on first start
- Debug logging for SQL queries

Verify: http://localhost:9090/api/v1/health → `{"status":"UP"}`

---

## Step 4 — Start the frontend

```bash
cd frontend
npm install
npm run dev
```

App is available at http://localhost:3001

---

## Step 5 — (Optional) Start the AI Assistant (Spark)

The AI assistant requires Ollama running locally.

```bash
# Install Ollama: https://ollama.com/download
# Then pull the default model (one-time, ~2 GB):
ollama pull llama3.2:3b

# Start Ollama (if not already running as a service):
ollama serve

# Verify:
curl http://localhost:11434/api/version
```

The backend auto-detects Ollama. If it's not running, the AI chat panel shows a "Spark is starting up" message and retries every 10 s.

---

## Step 6 — Run the full Docker stack

To run everything in Docker (mirrors production):

```bash
docker compose up -d
```

This starts:
| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL 16 |
| pgadmin | 5050 | DB admin UI |
| ollama | 11434 | Local LLM runner |
| ollama-init | — | Pulls model on first run |
| backend | 9090 | Spring Boot API |
| frontend | 3001 | React + Vite |

---

## Step 7 — Verify everything works

```bash
# Backend health
curl http://localhost:9090/api/v1/health

# Register a test user
curl -s -X POST http://localhost:9090/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testdev","email":"dev@test.com","password":"Test1234!","displayName":"Test Dev"}' | jq .

# AI health (if Ollama is running)
curl -s http://localhost:9090/api/v1/ai/health | jq .
```

---

## Demo accounts (seeded by `DataSeeder` in `dev` profile)

| Username | Password | Role |
|----------|----------|------|
| alice | password123 | User |
| bob | password123 | User |
| charlie | password123 | User |
| diana | password123 | User |
| eve | password123 | User |

---

## Project structure

```
connecthub/
├── backend/                 Spring Boot API (Java 21, Maven)
│   ├── src/main/java/com/socialmedia/
│   │   ├── auth/            Registration, login, JWT
│   │   ├── user/            Profiles, search
│   │   ├── post/            CRUD, likes, feed
│   │   ├── comment/         Comments on posts
│   │   ├── follow/          Follow graph
│   │   ├── bookmark/        Saved posts
│   │   ├── messaging/       Direct messages
│   │   ├── notification/    Async notifications
│   │   ├── search/          User/post/hashtag search
│   │   ├── media/           File upload + serving
│   │   ├── ai/              Spark AI (Ollama)
│   │   ├── websocket/       STOMP real-time config
│   │   └── config/          Security, seeder, rate limiter
│   └── src/main/resources/db/migration/
│       ├── V1__create_schema.sql    Core tables
│       ├── V2__messaging_schema.sql Conversations + messages
│       └── V3__bookmarks_schema.sql Bookmarks
│
├── frontend/                React + Vite SPA
│   └── src/
│       ├── api/             REST client modules
│       ├── components/      Reusable UI components
│       ├── hooks/           useWebSocket
│       ├── pages/           Route-level pages
│       └── store/           Redux slices
│
├── e2e/                     Playwright E2E tests
├── docs/                    All project documentation
├── deploy/                  Production configs + manifests
├── .github/workflows/       GitHub Actions CI/CD
└── docker-compose.yml       Full local stack
```

---

## Useful commands

```bash
# Backend — run all tests
cd backend && mvn test

# Backend — run integration tests only
cd backend && mvn verify -Dtest=none -DfailIfNoTests=false

# Frontend — production build
cd frontend && npm run build

# E2E — run all Playwright tests (requires running stack)
cd e2e && npm test

# E2E — run smoke tests only
cd e2e && npm run test:smoke

# E2E — run AI tests only
cd e2e && npm run test:ai

# Reset DB and reseed (dev profile only)
docker compose down -v && docker compose up -d postgres && cd backend && mvn spring-boot:run
```

---

## Key documentation

| Document | Location |
|----------|----------|
| API Reference | `docs/api_documentation.md` |
| OpenAPI spec (interactive) | `docs/openapi.yaml` |
| Database schema | `docs/database_schema_doc.md` |
| Technical design | `docs/tech_design_doc.md` |
| AI Assistant (Spark) | `docs/ai_assistant.md` |
| Test plan | `docs/Test_Plan_and_Test_Cases.md` |
| Deployment + ops | `docs/Deployment_Operations_Manual.md` |
| Flyway runbook | `docs/flyway_runbook.md` |
| Setup guide | `SETUP_GUIDE.md` |
| README | `README.md` |

---

## Troubleshooting

**Backend fails to start — "Cannot load driver class: org.postgresql.Driver"**  
→ Postgres container is not running. Run `docker compose up -d postgres` first.

**`FlywaySQLException` on startup**  
→ The schema has drifted. See `docs/flyway_runbook.md` for repair steps.

**AI chat shows "Spark is starting up"**  
→ Ollama is not running. Run `ollama serve` or start the Docker service: `docker compose up -d ollama`.

**`403 Forbidden` on WebSocket connection**  
→ The JWT token is missing or expired. Re-login to get a fresh token.

**Port 9090 already in use**  
→ Kill the process: `kill $(lsof -ti:9090)` (macOS/Linux) or use Task Manager (Windows).

**npm install fails on M1/M2 Mac**  
→ Run `arch -x86_64 npm install` or ensure Rosetta 2 is installed.

---

## Getting help

- Check existing issues in GitHub Issues
- Review `docs/` — most questions are answered there
- Ask in the team Slack channel `#connecthub-dev`
