# ConnectHub — Social Media App

A full-stack social media platform built with **Spring Boot 4** (backend) and **React + Vite** (frontend).

---

## Tech Stack

| Layer      | Technology                                               |
|------------|----------------------------------------------------------|
| Backend    | Java 21, Spring Boot 4.0.3, Spring Security, JPA        |
| Database   | PostgreSQL 16 (production), H2 (tests)                  |
| Migrations | Flyway — versioned SQL under `db/migration/`            |
| Auth       | JWT (jjwt 0.12.6), BCrypt passwords                     |
| Frontend   | React 18, Vite, Redux Toolkit, Tailwind CSS, Axios      |
| Testing    | JUnit 5, Mockito, MockMvc, Spring Security Test         |

---

## Quick Start

### Prerequisites
- Java 21+, Maven 3.9+
- Node.js 20+, npm
- Docker + Docker Compose (for Postgres)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

Postgres is available at `localhost:5432` with:
- Database: `socialmedia`
- Username: `socialmedia`
- Password: `secret`

pgAdmin is available at `http://localhost:5050` (admin@connecthub.local / admin).

### 2. Run the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on **http://localhost:9090**.

Flyway automatically runs `V1__create_schema.sql` on first boot.

#### With dev seed data (5 demo users + sample posts)

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=postgres,dev
```

Demo login credentials (all share the same password):

| Username | Email            | Password    |
|----------|------------------|-------------|
| alice    | alice@demo.com   | Password1!  |
| bob      | bob@demo.com     | Password1!  |
| carol    | carol@demo.com   | Password1!  |
| dave     | dave@demo.com    | Password1!  |
| eve      | eve@demo.com     | Password1!  |

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend is available at **http://localhost:3000**. API calls are proxied to `localhost:9090`.

---

## Environment Variables

| Variable      | Default       | Description                   |
|---------------|---------------|-------------------------------|
| `DB_HOST`     | `localhost`   | PostgreSQL host               |
| `DB_PORT`     | `5432`        | PostgreSQL port               |
| `DB_NAME`     | `socialmedia` | Database name                 |
| `DB_USER`     | `socialmedia` | Database username             |
| `DB_PASSWORD` | `secret`      | Database password (**change in prod**) |

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

All authenticated endpoints require: `Authorization: Bearer <jwt>`

---

## Security

- JWT authentication (stateless)
- BCrypt password hashing (cost 10)
- Rate limiting: 120 requests/minute/IP (configurable via `app.ratelimit.requests-per-minute`)
- HSTS, `X-Content-Type-Options: nosniff` response headers
- Input validation via Jakarta Bean Validation on all request DTOs
- Flyway migrations prevent accidental schema drift
