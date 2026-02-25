# ConnectHub — Setup Guide

Complete step-by-step instructions for running the full ConnectHub stack locally, with or without Docker.

---

## Option A — Manual Local Setup (recommended for development)

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Java | 21+ | https://adoptium.net |
| Maven | 3.9+ | https://maven.apache.org |
| Node.js | 20+ | https://nodejs.org |
| Docker + Compose | Latest | https://www.docker.com |
| Ollama | Latest | https://ollama.com/download |

---

### Step 1 — Start PostgreSQL (via Docker)

```bash
# From the project root
docker compose up -d postgres pgadmin
```

- **Postgres:** `localhost:5432` (DB: `socialmedia`, user: `socialmedia`, pass: `secret`)
- **pgAdmin:** http://localhost:5050 (email: `admin@connecthub.local`, pass: `admin`)

---

### Step 2 — Install and start Ollama (free local AI)

**macOS:**
```bash
brew install ollama
# Ollama starts automatically as a background service
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve   # starts the server in background
```

**Windows:**
Download and run the installer from https://ollama.com/download — Ollama runs as a system tray app.

**Pull the AI model (one-time, ~2 GB download):**
```bash
ollama pull llama3.2:3b
```

**Verify Ollama is running:**
```bash
curl http://localhost:11434/api/version
# Expected: {"version":"0.x.x"}
```

> The AI assistant works without a GPU. CPU inference is ~3–8 s per response.
> If you have an NVIDIA or Apple Silicon GPU, Ollama uses it automatically for sub-second responses.

**Alternative models (optional):**
```bash
ollama pull llama3.2:1b   # faster, ~1 GB, for low-RAM machines
ollama pull llama3.1:8b   # higher quality, ~5 GB, needs 16+ GB RAM
ollama pull mistral:7b    # alternative, ~4 GB
```
To switch models, set `AI_MODEL=llama3.1:8b` before starting the backend.

---

### Step 3 — Run the Backend

```bash
cd backend

# Basic run (connects to postgres, Ollama auto-discovered at localhost:11434)
mvn spring-boot:run

# With seed demo data (5 users: alice/bob/carol/dave/eve, all password: Password1!)
mvn spring-boot:run -Dspring-boot.run.profiles=postgres,dev
```

Backend is available at **http://localhost:9090**

Flyway automatically runs `V1__create_schema.sql` on first start.

**Demo accounts (with dev profile):**

| Username | Email           | Password   |
|----------|-----------------|------------|
| alice    | alice@demo.com  | Password1! |
| bob      | bob@demo.com    | Password1! |
| carol    | carol@demo.com  | Password1! |
| dave     | dave@demo.com   | Password1! |
| eve      | eve@demo.com    | Password1! |

**Verify the backend and AI are healthy:**
```bash
curl http://localhost:9090/api/v1/ai/health
# Expected: { "status": "ok", "ollamaReachable": true, "model": "llama3.2:3b" }
```

---

### Step 4 — Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend is available at **http://localhost:3001**

All `/api` calls are proxied to `localhost:9090` by Vite's dev server proxy.

---

### Step 5 — Try the AI assistant

1. Open http://localhost:3001 and log in (e.g. `alice` / `Password1!`)
2. Click the **⚡ Ask Spark** button in the bottom-right corner
3. Or press `Ctrl + K` (Windows/Linux) or `Cmd + K` (macOS)
4. Type a message and get a response from your local AI

No API key, no account, no cost — the AI runs entirely on your machine.

---

## Option B — Full Docker Compose Stack

Run everything — database, AI, backend, and frontend — in Docker. No local installations needed except Docker itself.

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- ~5 GB free disk space (for images + the AI model)

### Step 1 — Start the full stack

```bash
# From the project root
docker compose up -d
```

Docker will start all 6 services. On the **first run**, `ollama-init` will download the `llama3.2:3b` model (~2 GB). Watch the progress:

```bash
docker compose logs -f ollama-init
# You will see download progress bars
# Wait until the log shows "success" and the container exits
```

### Step 2 — Wait for services to be healthy

```bash
docker compose ps
# All services should show "healthy" or "running"
```

This may take 1–3 minutes on first start (model pull + Spring Boot JVM warm-up).

### Step 3 — Open the app

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3001 | alice / Password1! |
| **Backend API** | http://localhost:9090 | — |
| **pgAdmin** | http://localhost:5050 | admin@connecthub.local / admin |
| **Ollama API** | http://localhost:11434 | — |

### Step 4 — Try the AI assistant

Same as Option A Step 5 — click ⚡ or press `Ctrl/Cmd + K`.

### Stopping the stack

```bash
docker compose down          # stop containers, keep data volumes
docker compose down -v       # stop AND wipe all data (including AI model cache)
```

### Changing the AI model in Docker

```bash
# Pull the new model into the ollama container
docker compose run --rm ollama-init ollama pull llama3.1:8b

# Update the model used by the backend
# Edit docker-compose.yml → backend → environment → AI_MODEL: llama3.1:8b
docker compose up -d backend
```

---

## Environment Variables

All variables have sensible defaults — no configuration is required to get started.

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `socialmedia` | Database name |
| `DB_USER` | `socialmedia` | Database username |
| `DB_PASSWORD` | `secret` | Database password |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL (auto-set to `http://ollama:11434` in Docker) |
| `AI_MODEL` | `llama3.2:3b` | Ollama model name |
| `AI_MAX_TOKENS` | `1024` | Max tokens per AI response |
| `AI_RATE_LIMIT_PER_HOUR` | `60` | Max AI requests per user per hour |
| `AI_MAX_CONCURRENT` | `3` | Max simultaneous Ollama requests |
| `SPRING_PROFILES_ACTIVE` | `postgres` | Use `postgres,dev` for seed data |

> **No API key is required for the AI assistant.** Ollama runs locally and is completely free.

---

## Running Tests

### Backend unit + integration tests

```bash
cd backend
mvn test
```

Tests use H2 in-memory database. Flyway is disabled. The Ollama client is mocked — no Ollama instance needed for tests.

### Playwright E2E tests

```bash
# Ensure backend and frontend are running (either manually or via docker compose)
cd e2e
npm install
npm test            # run all ~148 test cases
npm run test:ai     # run just the Spark AI test suite
```

E2E tests mock Ollama responses — they do not require Ollama to be running.

---

## Troubleshooting

### "AI assistant is starting up" message in the chat

Ollama is not running or not reachable. Check:
```bash
# Local:
curl http://localhost:11434/api/version

# If that fails, start Ollama:
ollama serve

# Docker:
docker compose logs ollama
docker compose ps ollama   # should show "healthy"
```

### AI responds very slowly (CPU mode)

This is normal without a GPU — Llama3.2:3b takes 3–8 s per response on CPU.

Options:
- Switch to the 1B model (faster): `ollama pull llama3.2:1b` then `export AI_MODEL=llama3.2:1b`
- If you have a GPU: Ollama detects it automatically, no config needed

### "Model not found" error from backend

You need to pull the model first:
```bash
ollama pull llama3.2:3b

# Verify it is available
ollama list
```

### Port conflicts

If any port is already in use:

| Port | Service | Fix |
|------|---------|-----|
| 5432 | PostgreSQL | Stop local Postgres or change port in docker-compose.yml |
| 5050 | pgAdmin | Change `"5050:80"` to another port |
| 9090 | Backend | Change `server.port` in application.properties |
| 3001 | Frontend | Change port in vite.config.js and playwright.config.ts |
| 11434 | Ollama | Change port in docker-compose.yml and `OLLAMA_BASE_URL` |

### Backend fails to connect to Postgres

Ensure Postgres is healthy:
```bash
docker compose ps postgres
# Should show "healthy"

# Or connect directly:
docker compose exec postgres psql -U socialmedia -d socialmedia -c "SELECT 1"
```

### Flyway migration errors

```bash
# Reset the database (WARNING: deletes all data)
docker compose down -v
docker compose up -d postgres
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=postgres,dev
```

---

## Project Structure

```
social-media-app/
├── backend/
│   ├── Dockerfile                    # Multi-stage backend Docker image
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/socialmedia/
│       │   ├── ai/                   # AI assistant (OllamaClient, AiService, etc.)
│       │   ├── controller/
│       │   ├── service/
│       │   ├── entity/
│       │   └── config/
│       └── main/resources/
│           ├── application.properties # Includes Ollama config
│           └── db/migration/
├── frontend/
│   ├── Dockerfile                    # Vite dev server Docker image
│   ├── vite.config.js                # Port 3001, proxy to backend
│   └── src/
│       ├── components/ai/            # AiChatPanel, AiChatButton, etc.
│       ├── store/aiSlice.js
│       └── api/aiApi.js
├── e2e/                              # Playwright E2E tests
│   └── tests/ai.spec.ts              # Spark AI test suite
├── docs/
│   ├── ai_assistant.md               # Full AI design document (Ollama-based)
│   └── ...
├── deploy/
│   └── init.sql
└── docker-compose.yml                # Full stack: postgres + pgadmin + ollama + backend + frontend
```
