# Technical Design Document (TDD)
## Social Media Clone Application

**Version:** 1.3 | **Date:** February 25, 2026 | **Status:** Active

---

## 1. SYSTEM ARCHITECTURE

### 1.1 Architecture Overview
**Pattern:** Monolith-first, evolving toward service extraction

**Core Components:**
```
+------------------------------------------------------+
|                  Client Layer                         |
|  Web App (React) | Mobile Apps | Third-Party Clients |
+--------------------+---------------------------------+
                     |
+--------------------v---------------------------------+
|            Spring Boot Backend (Port 9090)            |
|  Authentication | Rate Limiting | REST API            |
+--------------------+---------------------------------+
                     |
    +----------------+-------------------+
    |         Data Layer                  |
    +-------------------------------------+
    | PostgreSQL | Redis (future)          |
    | Flyway Migrations | H2 (test)        |
    +-------------------------------------+
                     |
    +----------------+-------------------+
    |         AI Layer (Spark)            |
    +-------------------------------------+
    | Ollama (local LLM, llama3.2:3b)    |
    | Port 11434 — free, no API key       |
    +-------------------------------------+
```

### 1.2 Service Overview

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| **Spring Boot Backend** | 9090 | PostgreSQL + H2 | Auth, Users, Posts, Feed, Comments, Likes, Follow, Notifications, Search, Media, Messaging, Bookmarks, AI |
| **React Frontend** | 3001 | — | SPA client |
| **PostgreSQL** | 5432 | — | Primary datastore |
| **pgAdmin** | 5050 | — | DB admin UI |
| **Ollama** | 11434 | — | Local LLM (Spark AI) |

---

## 2. DATABASE DESIGN

### 2.1 PostgreSQL Schema (Flyway-managed)

#### Core Tables:

**users**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(60),
    bio VARCHAR(200),
    avatar_url VARCHAR(500),
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    posts_count INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

**posts**
```sql
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    content VARCHAR(2000) NOT NULL,
    image_url VARCHAR(500),
    privacy VARCHAR(20) DEFAULT 'PUBLIC',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

**follows**
```sql
CREATE TABLE follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    following_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);
```

**post_likes, comments, notifications** — see `docs/database_schema_doc.md`

### 2.2 Redis Cache Strategy (Phase 9)
```
user:{id}            -> UserDTO           (5 min)
post:{id}            -> PostDTO           (10 min)
feed:{userId}        -> List<PostDTO>     (15 min)
ratelimit:{userId}   -> count             (1 min)
```

---

## 3. API DESIGN

### 3.1 RESTful API Standards

**Base URL**: `http://localhost:9090/api/v1`

**Authentication**: JWT Bearer Token
```
Authorization: Bearer <token>
```

**Response Format**:
```json
{
  "status": "success|error",
  "data": {},
  "message": "string",
  "timestamp": "ISO8601"
}
```

### 3.2 Implemented Endpoints

**Authentication** (`/api/v1/auth`)
```
POST   /auth/register          - User registration (201)
POST   /auth/login             - User login, returns JWT (200)
```

**Users** (`/api/v1/users`)
```
GET    /users/me               - Own profile
PUT    /users/me               - Update profile
GET    /users/{username}       - Get user profile
GET    /users/{username}/posts - User's posts
GET    /users/{username}/followers  - Followers list
GET    /users/{username}/following  - Following list
GET    /users/{username}/is-following - Follow status
GET    /users/search?q=        - Search users
POST   /users/{username}/follow     - Follow user
DELETE /users/{username}/follow     - Unfollow user
```

**Posts** (`/api/v1/posts`)
```
GET    /posts/feed                  - Home feed (paginated)
POST   /posts                       - Create post
GET    /posts/{id}                  - Get post
PUT    /posts/{id}                  - Edit post (author only; sets updated_at)
DELETE /posts/{id}                  - Delete post (own only)
POST   /posts/{id}/like             - Like post
DELETE /posts/{id}/like             - Unlike post
GET    /posts/{id}/comments         - Get comments
POST   /posts/{id}/comments         - Add comment
DELETE /posts/{id}/comments/{cid}   - Delete comment (own only)
POST   /posts/{id}/bookmark         - Toggle bookmark (saves or removes)
```

**Bookmarks** (`/api/v1/users`)
```
GET    /users/me/bookmarks           - Saved posts for current user (paginated)
```

**Messaging** (`/api/v1/messages`)
```
GET    /messages/conversations                         - All conversations for current user
POST   /messages                                       - Send message (creates conversation if needed)
GET    /messages/conversations/{id}/messages            - Message history (paginated, newest-first)
PUT    /messages/conversations/{id}/read               - Mark conversation as read
```

**Search** (`/api/v1/search`)
```
GET    /search/users?q=        - Search users
GET    /search/posts?q=        - Search post content
GET    /search/hashtags?q=     - Search hashtags
```

**Notifications** (`/api/v1/notifications`)
```
GET    /notifications          - List notifications (paginated)
GET    /notifications/unread-count - Unread count
PATCH  /notifications/read-all - Mark all read
PATCH  /notifications/{id}/read - Mark one read
```

**Media** (`/api/v1/media`)
```
POST   /media/upload           - Upload image/video (multipart)
GET    /media/files/{filename} - Serve uploaded file (public)
```

**AI Assistant** (`/api/v1/ai`)
```
POST   /ai/chat                - Streaming chat (NDJSON, auth required)
GET    /ai/health              - Ollama health check
```

### 3.3 Rate Limits
```
Global:    100 req/min per IP  (RateLimitFilter)
AI chat:    60 req/hour per user (AiRateLimiter)
```

### 3.4 WebSocket / Real-time (STOMP over SockJS)

**Connection URL**: `ws://localhost:9090/ws`  
**Auth**: JWT passed as STOMP connect header (`Authorization: Bearer <token>`)  
**Library**: `@stomp/stompjs` + `sockjs-client`

```
SUBSCRIBE  /topic/chat/{conversationId}      - Incoming messages for a conversation
SUBSCRIBE  /user/queue/notifications          - Personal real-time notifications
SEND       /app/send-message                 - Broadcast a new message to a conversation
SEND       /app/typing                       - Emit typing indicator
```

**Typing indicator topic**: `/topic/typing/{conversationId}`  
Messages sent to `/app/send-message` are broadcast to `/topic/chat/{conversationId}` so all participants receive them in real time.

---

## 4. SECURITY ARCHITECTURE

### 4.1 Authentication Flow
```
1. User -> POST /auth/login {usernameOrEmail, password}
2. Server -> Validate credentials (BCrypt)
3. Server -> Generate JWT (access token, 7-day expiry)
4. Server -> Return {token, user}
5. Client -> Store token (localStorage)
6. Client -> Authorization: Bearer <token>
```

**JWT Claims**:
```json
{
  "sub": "alice",
  "iat": 1706400000,
  "exp": 1707004800
}
```

### 4.2 Security Measures

**Data Protection**:
- BCrypt password hashing (strength 10)
- JWT with HS384 signing

**API Security**:
- JWT validation on every request (JwtAuthFilter)
- Input validation (Jakarta Validation)
- SQL injection prevention (JPA/Hibernate)
- XSS protection (Content Security Policy headers)
- CORS configured for frontend origin
- Rate limiting (RateLimitFilter — 100 req/min/IP)

**Security Headers**:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security` (HTTPS)

### 4.3 Prompt Injection Prevention (AI)
- User-supplied content sanitised before injection into Ollama system prompt
- `---` delimiters replaced to prevent context escape
- HTML escaped (`<` -> `&lt;`)
- Null bytes stripped

---

## 5. PERFORMANCE & SCALABILITY

### 5.1 Caching Strategy
Current: no cache (Phase 1)
Phase 9: Redis cache for feed, profiles, trending

**Cache Invalidation**:
```
- On update: Delete specific cache keys
- On post creation: Invalidate author's profile, followers' feeds
- Lazy invalidation for low-priority data
```

### 5.2 Database Optimization

**Indexing Strategy**:
```sql
-- Applied via Flyway V1__create_schema.sql
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

**Connection Pooling** (HikariCP defaults):
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 30000
```

### 5.3 Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (P95) | < 200ms |
| Feed Load Time | < 1s |
| AI First Token | < 3s (CPU) |
| Database Query (P95) | < 50ms |

---

## 6. AI ASSISTANT (SPARK)

### 6.1 Architecture

```
Frontend (React)
  -> POST /api/v1/ai/chat (NDJSON stream)
  -> AiController.java
  -> AiService.java (rate-limit + context)
  -> OllamaClient.java
  -> Ollama HTTP API (localhost:11434)
  -> llama3.2:3b model
```

### 6.2 Ollama Integration

**Model**: llama3.2:3b (default, ~2 GB)
**API**: POST http://ollama:11434/api/chat
**Protocol**: NDJSON streaming
**Cost**: Free — runs on local hardware

**Stream Format**:
```
Token: {"delta":"<text>"}
End:   {"done":true}
Error: {"error":"rate_limit"|"ai_unavailable","message":"..."}
```

### 6.3 Context Modes

| Mode | Description |
|------|-------------|
| `general` | Injects user profile (name, bio, followers) |
| `feed_summary` | Injects latest 20 public feed posts |
| `post_improve` | Instructions for draft improvement |

### 6.4 Rate Limiting
- 60 requests per user per hour (in-memory sliding window)
- Purpose: protect local Ollama from overload (not cost-based)

---

## 7. DEPLOYMENT ARCHITECTURE

### 7.1 Docker Compose Stack

```yaml
services:
  postgres:     image: postgres:16-alpine, port 5432
  pgadmin:      image: dpage/pgadmin4, port 5050
  ollama:       image: ollama/ollama:latest, port 11434
  ollama-init:  pulls llama3.2:3b on first run
  backend:      builds ./backend/Dockerfile, port 9090
  frontend:     builds ./frontend/Dockerfile, port 3001
```

### 7.2 Dockerfiles

**Backend** (multi-stage):
```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS builder
# ... build ...
FROM eclipse-temurin:21-jre-alpine
# Non-root user, health check on /actuator/health
```

**Frontend**:
```dockerfile
FROM node:20-alpine
# Vite dev server with --host 0.0.0.0
```

### 7.3 CI/CD Pipeline (Phase 9)

```
1. Code Commit (GitHub)
2. GitHub Actions triggered
3. mvn clean test (unit + integration)
4. docker build
5. Push to DockerHub/GHCR
6. Deploy to staging
7. Playwright E2E tests
8. Deploy to production
```

---

## 8. MONITORING & OBSERVABILITY

### 8.1 Health Checks
- `GET /api/v1/health` — backend health (public)
- `GET /api/v1/ai/health` — Ollama reachability
- `/actuator/health` — Spring Boot actuator (Docker health check)

### 8.2 Logging
```
Format: structured console (logback-spring.xml)
Levels: ERROR, WARN, INFO, DEBUG
AI errors: logged with user context, no message content
```

### 8.3 Future: Prometheus + Grafana (Phase 9)
```
- Request count by endpoint
- Response time (P50, P95, P99)
- AI response latency
- Cache hit/miss ratio
- Active users
```

---

## 9. TECHNOLOGY STACK

### 9.1 Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Spring Boot | 4.0.3 |
| Language | Java | 21 |
| Build | Maven | 3.9 |
| Security | Spring Security | 7.0.3 |
| JWT | jjwt | 0.12.6 |
| Database ORM | Spring Data JPA / Hibernate | 7.x |
| Migrations | Flyway | — |
| Validation | Jakarta Validation | — |
| Async | Spring @Async | — |
| HTTP Client | Java 21 HttpClient (Ollama) | built-in |

### 9.2 Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18.x |
| Build | Vite | 5.x |
| State | Redux Toolkit | 2.x |
| Routing | React Router | 6.x |
| HTTP | Fetch API | native |
| Styling | Tailwind CSS | 3.x |
| Icons | Lucide React | 0.x |

### 9.3 AI

| Component | Technology |
|-----------|-----------|
| LLM Runner | Ollama |
| Default Model | llama3.2:3b |
| Protocol | NDJSON streaming |
| Docker | ollama/ollama:latest |

### 9.4 Infrastructure

| Component | Technology |
|-----------|-----------|
| Database | PostgreSQL 16 |
| DB Admin | pgAdmin 4 |
| Containers | Docker + Docker Compose |
| Test DB | H2 in-memory |
| E2E Tests | Playwright |
| API Tests | OkHttp MockWebServer |

---

## 10. APPENDICES

### 10.1 Design Patterns Used

- **Repository Pattern**: All data access via Spring Data JPA repositories
- **Service Layer**: Business logic isolated from controllers
- **DTO Pattern**: Request/Response objects separate from JPA entities
- **Streaming**: `StreamingResponseBody` for AI NDJSON output
- **Async Events**: `@EventListener` + `@Async` for notifications
- **Builder**: Lombok `@Builder` on entities and DTOs

### 10.2 Code Quality Standards

- **Coverage Target**: > 80% unit test coverage
- **Style**: Google Java Style Guide
- **Test Framework**: JUnit 5 + Mockito + AssertJ
- **Integration Tests**: MockMvc + H2 + `@Transactional` rollback

### 10.3 References

- Spring Boot Docs: https://spring.io/projects/spring-boot
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Ollama Docs: https://github.com/ollama/ollama/blob/main/docs/api.md
- Playwright Docs: https://playwright.dev/docs/intro

---

**Document Owner**: Technical Lead
**Last Review**: February 25, 2026
**Next Review**: March 25, 2026
