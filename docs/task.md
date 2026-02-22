# Implementation Tasks — Social Media App

This file converts the implementation plan into actionable tasks grouped by phase. Use it as the project TODO and update statuses as work progresses.

---

## Phase 1 — Project setup & alignment
- [ ] Confirm stack: Java 21, Spring Boot 4.0.3, Maven (backend); React+Vite (frontend)
- [ ] Consolidate `docs/` content into a single README and runbook
- [ ] Create repository skeleton: `backend/`, `frontend/`, `docs/`, `deploy/`
- Deliverable: `README.md` with run steps and env vars

## Phase 2 — API & data model
- [x] Produce OpenAPI spec `docs/openapi.yaml` covering auth, users, posts, likes, feed ✅
- [ ] Extend OpenAPI with comments, follow, notifications, media
- [ ] Create database schema (ERD) and migration plan
- Deliverable: `docs/openapi.yaml`, `docs/database_schema_doc.md`

## Phase 3 — Core backend
- [x] Implement auth (register/login) with JWT; endpoints under `/api/v1/auth` ✅
- [x] Implement user profile endpoints (view/update/search) ✅
- [x] Implement posts CRUD (privacy, images) ✅
- [x] Implement post likes (like/unlike) ✅
- [x] Add global error handling and DTO mapping ✅
- Deliverable: Authentication + posts + users working APIs ✅

## Phase 4 — Social features
- [x] Comments: add/read/delete with counters ✅
- [x] Likes: toggle like/unlike; maintain counts ✅
- [x] Follow graph: follow/unfollow; followers/following lists ✅
- [x] Feed: paginated feed (own posts + followed users, privacy-aware) ✅
- Deliverable: Paginated feed endpoints ✅

## Phase 5 — Media, search, notifications
- [x] Media upload service (local disk), validation (type + size) ✅
- [x] Search endpoints for users, posts, hashtags ✅
- [x] Notification service (async Spring events) — LIKE, COMMENT, FOLLOW ✅
- Deliverable: Media + search + notification services ✅

## Phase 6 — Frontend
- [x] Design system + common components (Auth, Posts, Lists, Modals, Toasts) ✅
- [x] Pages: Auth, Feed, Profile, Post detail, Notifications, Search ✅
- [x] Integrated with backend APIs — pagination, optimistic like/unlike, infinite scroll ✅
- Deliverable: SPA with core flows ✅

## Phase 7 — Testing & security
- [x] Backend unit tests — AuthService, PostService, FollowService, UserService (Mockito) ✅
- [x] Backend integration tests — Auth, Post, User controllers (MockMvc + H2) ✅
- [x] Security hardening — rate-limit filter (120 req/min/IP), HSTS, nosniff, CSP headers ✅
- [x] Flyway migrations — V1 full DDL schema; ddl-auto switched to validate ✅
- [x] Dev seed data — DataSeeder (@Profile("dev")): 5 users, 10 posts, likes, comments, notifications ✅
- [x] TestDataFactory — reusable builder for integration test fixtures ✅
- [x] Playwright E2E — 10 test suites, ~148 test cases (86 positive / 62 negative) ✅
  - auth, feed, posts, comments (new), profile, follow, search, notifications, media (new), security (new)
  - Page Object Models: FeedPage, LoginPage, RegisterPage, ProfilePage, PostDetailPage (new), SearchPage, NotificationsPage
  - Helpers: auth.ts + api.ts (new low-level API helper)
  - Fixtures: test-data.ts (SEED users, INVALID payloads, SAMPLE_POSTS)
  - npm scripts: test:positive, test:negative, test:smoke, test:api-only, per-suite scripts
- [x] REST Client test file — 110+ HTTP requests covering all endpoints (API Test/api.http) ✅
- Deliverable: Automated test suites, Flyway-managed schema, seed data ✅

## Phase 8 — CI/CD & infra
- [ ] GitHub Actions: build, test, docker image, push
- [ ] Deployment manifests: Docker Compose and Kubernetes (optional)
- [ ] Monitoring and logs configuration
- Deliverable: CI pipeline and deployment manifests in `deploy/`

## Phase 9 — Documentation & handoff
- [ ] Finalize `docs/` (API docs, runbook, design, test plan)
- [ ] Onboarding checklist and troubleshooting guide
- Deliverable: Project handoff package

## Phase 10 — Iterate & polish
- [ ] Performance improvements: caching, indexing, background jobs
- [ ] Accessibility and UX polish
- Deliverable: Production readiness checklist

---

# Milestones & Acceptance Criteria
- **M1:** Scaffolds + OpenAPI + DB schema — validated with sample calls
- **M2:** Auth + Users + Posts CRUD + tests
- **M3:** Comments, Likes, Follow, Feed working and paginated
- **M4:** Media, search, notifications integrated
- **M5:** Frontend integrated + E2E tests

# Immediate next actions (pick one)
1. Generate `docs/openapi.yaml` skeleton now (I can do this).
2. Scaffold backend controllers/services for Auth, Users, Posts (I can implement the first endpoints).
3. Scaffold frontend routes + auth flow components.

# Run & dev commands
- Backend build and run:
```powershell
cd backend
mvn clean install
mvn spring-boot:run
```
- Frontend dev:
```bash
cd frontend
npm install
npm run dev
```

---

*Created by automation — update statuses as tasks progress.*
