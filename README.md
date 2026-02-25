# ConnectHub — Social Media App

A full-stack social media platform built with **Spring Boot 4** (backend) and **React + Vite** (frontend).

---

## Tech Stack

| Layer      | Technology                                                           |
|------------|----------------------------------------------------------------------|
| Backend    | Java 21, Spring Boot 4.0.3, Spring Security, JPA                    |
| Database   | PostgreSQL 16 (production), H2 (tests)                              |
| Migrations | Flyway — versioned SQL under `db/migration/`                        |
| Auth       | JWT (jjwt 0.12.6), BCrypt passwords                                  |
| Frontend   | React 18, Vite **port 3001**, Redux Toolkit, Tailwind CSS, Axios    |
| AI         | Ollama (`llama3.2:3b`) — Spark AI assistant, **free, runs locally, no API key** |
| Testing    | JUnit 5, Mockito, MockMvc, Spring Security Test, Playwright E2E      |

---

## Quick Start

### Prerequisites
- Java 21+, Maven 3.9+
- Node.js 20+, npm
- Docker + Docker Compose
- **Ollama** (free local AI) — https://ollama.com/download

> See **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for the full walkthrough including Docker-only setup.

### Option A — Manual (recommended for development)

**1. Start PostgreSQL**
```bash
docker compose up -d postgres pgadmin
```
Postgres: `localhost:5432` | pgAdmin: http://localhost:5050

**2. Install Ollama and pull the AI model (one-time)**
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh && ollama serve

# Pull the model (~2 GB, free, stored locally)
ollama pull llama3.2:3b
```

**3. Run the Backend**
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=postgres,dev
```
Backend: **http://localhost:9090** | AI health: http://localhost:9090/api/v1/ai/health

Demo accounts (all password: `Password1!`):

| Username | Email           |
|----------|-----------------|
| alice    | alice@demo.com  |
| bob      | bob@demo.com    |
| carol    | carol@demo.com  |
| dave     | dave@demo.com   |
| eve      | eve@demo.com    |

**4. Run the Frontend**
```bash
cd frontend
npm install
npm run dev
```
Frontend: **http://localhost:3001** (proxied to backend)

### Option B — Full Docker Compose (everything in one command)

```bash
# Start all 6 services: postgres, pgadmin, ollama, ollama-init, backend, frontend
docker compose up -d

# Watch the AI model download (first run only, ~2 GB)
docker compose logs -f ollama-init
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:9090 |
| pgAdmin | http://localhost:5050 |
| Ollama AI | http://localhost:11434 |

---

## Environment Variables

| Variable                | Default                      | Description |
|-------------------------|------------------------------|-------------|
| `DB_HOST`               | `localhost`                  | PostgreSQL host |
| `DB_PORT`               | `5432`                       | PostgreSQL port |
| `DB_NAME`               | `socialmedia`                | Database name |
| `DB_USER`               | `socialmedia`                | Database username |
| `DB_PASSWORD`           | `secret`                     | Database password (change in prod) |
| `OLLAMA_BASE_URL`       | `http://localhost:11434`     | Ollama server URL (auto-set to `http://ollama:11434` in Docker Compose) |
| `AI_MODEL`              | `llama3.2:3b`                | Ollama model name. Options: `llama3.2:1b`, `llama3.2:3b`, `llama3.1:8b`, `mistral:7b` |
| `AI_MAX_TOKENS`         | `1024`                       | Max tokens per AI response |
| `AI_RATE_LIMIT_PER_HOUR`| `60`                         | AI requests per user per hour (server protection, not cost-based) |
| `AI_MAX_CONCURRENT`     | `3`                          | Max simultaneous Ollama requests |

> **No API key is required.** The AI runs on Ollama locally — 100% free. See `docs/ai_assistant.md` and `SETUP_GUIDE.md` for details.

---

## Database Migrations (Flyway)

Migrations live in `backend/src/main/resources/db/migration/`.

| Version | File                       | Description              |
|---------|----------------------------|--------------------------|
| V1      | `V1__create_schema.sql`    | Full schema (all tables) |

To add a new migration, create `V2__your_description.sql` in the same folder.

Flyway runs automatically on application startup. Schema changes via `ddl-auto` are **disabled** — Flyway is the single source of truth.

---

## Running Tests

```bash
cd backend
mvn test
```

Tests use H2 in-memory database. Flyway is disabled in the `test` profile — H2 uses `create-drop` instead. The `TestDataFactory` bean can be autowired in any integration test to create users, posts, follows, likes, and comments with a fluent API.

---

## Project Structure

```
social-media-app/
├── backend/                  # Spring Boot application
│   ├── src/main/java/        # Application source code
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/     # Flyway SQL migrations
│   └── src/test/             # Unit + integration tests
├── frontend/                 # React + Vite SPA
├── docs/                     # Project documentation
├── deploy/                   # Docker init scripts
└── docker-compose.yml        # Local dev stack (Postgres + pgAdmin)
```

---

## API Endpoints (summary)

| Method | Path                          | Description                  |
|--------|-------------------------------|------------------------------|
| POST   | `/api/v1/auth/register`       | Register a new account       |
| POST   | `/api/v1/auth/login`          | Login and receive JWT        |
| GET    | `/api/v1/users/me`            | Get current user profile     |
| PUT    | `/api/v1/users/me`            | Update profile               |
| GET    | `/api/v1/users/{username}`    | Get user by username         |
| GET    | `/api/v1/posts/feed`          | Paginated home feed          |
| POST   | `/api/v1/posts`               | Create a post                |
| GET    | `/api/v1/posts/{id}`          | Get post by ID               |
| DELETE | `/api/v1/posts/{id}`          | Delete own post              |
| POST   | `/api/v1/posts/{id}/like`     | Like a post                  |
| DELETE | `/api/v1/posts/{id}/like`     | Unlike a post                |
| GET    | `/api/v1/posts/{id}/comments` | Get comments for a post      |
| POST   | `/api/v1/posts/{id}/comments` | Add a comment                |
| POST   | `/api/v1/users/{u}/follow`    | Follow a user                |
| DELETE | `/api/v1/users/{u}/follow`    | Unfollow a user              |
| GET    | `/api/v1/notifications`       | Get notifications (paginated)|
| GET    | `/api/v1/search/users`        | Search users                 |
| GET    | `/api/v1/search/posts`        | Search posts                 |
| POST   | `/api/v1/media/upload`        | Upload image                 |
| POST   | `/api/v1/ai/chat`             | Chat with Spark AI assistant (streaming NDJSON) |

All authenticated endpoints require: `Authorization: Bearer <jwt>`

---

## Security

- JWT authentication (stateless)
- BCrypt password hashing (cost 10)
- Rate limiting: 120 requests/minute/IP (configurable via `app.ratelimit.requests-per-minute`)
- HSTS, `X-Content-Type-Options: nosniff` response headers
- Input validation via Jakarta Bean Validation on all request DTOs
- Flyway migrations prevent accidental schema drift
