# Implementation Tasks — Social Media App

This file converts the implementation plan into actionable tasks grouped by phase. Use it as the project TODO and update statuses as work progresses.

> **Last updated:** February 25, 2026
> **Overall status:** Phases 1–8 + Phase A complete. Phase 9 CI/CD shipped. Remaining: Phase 10 polish + optional features.

---

## Phase 1 — Project setup & alignment ✅ COMPLETE
- [x] Confirm stack: Java 21, Spring Boot 4.0.3, Maven (backend); React+Vite (frontend) ✅
- [x] Consolidate `docs/` content — full docs suite in `docs/` folder ✅
- [x] Create repository skeleton: `backend/`, `frontend/`, `docs/`, `deploy/` ✅
- Deliverable: `README.md` with run steps and env vars ✅

## Phase 2 — API & data model ✅ COMPLETE
- [x] Produce OpenAPI spec `docs/openapi.yaml` covering auth, users, posts, likes, feed ✅
- [x] Extend OpenAPI with comments, follow, notifications, media, messaging, bookmarks, AI ✅
- [x] Create database schema (ERD) and migration plan ✅
- Deliverable: `docs/openapi.yaml` (v1.3.0 — all endpoints), `docs/database_schema_doc.md` ✅

## Phase 3 — Core backend ✅ COMPLETE
- [x] Implement auth (register/login) with JWT; endpoints under `/api/v1/auth` ✅
- [x] Implement user profile endpoints (view/update/search) ✅
- [x] Implement posts CRUD (privacy, images) ✅
- [x] Implement post likes (like/unlike) ✅
- [x] Add global error handling and DTO mapping ✅
- Deliverable: Authentication + posts + users working APIs ✅

## Phase 4 — Social features ✅ COMPLETE
- [x] Comments: add/read/delete with counters ✅
- [x] Likes: toggle like/unlike; maintain counts ✅
- [x] Follow graph: follow/unfollow; followers/following lists ✅
- [x] Feed: paginated feed (own posts + followed users, privacy-aware) ✅
- Deliverable: Paginated feed endpoints ✅

## Phase 5 — Media, search, notifications ✅ COMPLETE
- [x] Media upload service (local disk), validation (type + size) ✅
- [x] Search endpoints for users, posts, hashtags ✅
- [x] Notification service (async Spring events) — LIKE, COMMENT, FOLLOW ✅
- Deliverable: Media + search + notification services ✅

## Phase 6 — Frontend ✅ COMPLETE
- [x] Design system + common components (Auth, Posts, Lists, Modals, Toasts) ✅
- [x] Pages: Auth, Feed, Profile, Post detail, Notifications, Search ✅
- [x] Integrated with backend APIs — pagination, optimistic like/unlike, infinite scroll ✅
- Deliverable: SPA with core flows ✅

## Phase 7 — Testing & security ✅ COMPLETE
- [x] Backend unit tests — AuthService, PostService, FollowService, UserService (Mockito) ✅
- [x] Backend integration tests — Auth, Post, User controllers (MockMvc + H2) ✅
- [x] Security hardening — rate-limit filter (120 req/min/IP), HSTS, nosniff, CSP headers ✅
- [x] Flyway migrations — V1 full DDL schema; ddl-auto switched to validate ✅
- [x] Dev seed data — DataSeeder (@Profile("dev")): 5 users, 10 posts, likes, comments, notifications ✅
- [x] TestDataFactory — reusable builder for integration test fixtures ✅
- [x] Playwright E2E — 10 test suites, ~148 test cases (86 positive / 62 negative) ✅
  - auth, feed, posts, comments, profile, follow, search, notifications, media, security
  - Page Object Models: FeedPage, LoginPage, RegisterPage, ProfilePage, PostDetailPage, SearchPage, NotificationsPage
  - Helpers: auth.ts + api.ts
  - Fixtures: test-data.ts (SEED users, INVALID payloads, SAMPLE_POSTS)
  - npm scripts: test:positive, test:negative, test:smoke, test:api-only, per-suite scripts
- [x] REST Client test file — 110+ HTTP requests covering all endpoints (API Test/api.http) ✅
- Deliverable: Automated test suites, Flyway-managed schema, seed data ✅

## Phase 8 — AI Assistant (Spark) — powered by Ollama (free, local) ✅ COMPLETE

### Phase 8a — Ollama local dev setup ✅
- [x] Install Ollama: https://ollama.com/download ✅
- [x] Pull model: `ollama pull llama3.2:3b` (~2 GB, one-time) ✅
- [x] Verify: `curl http://localhost:11434/api/version` ✅
- [x] Add Ollama config to `application.properties` ✅
- [x] Create `SETUP_GUIDE.md` with Ollama setup instructions ✅

### Phase 8b — Docker stack ✅
- [x] `docker-compose.yml` — add `ollama`, `ollama-init`, `backend`, `frontend` services ✅
- [x] `backend/Dockerfile` — multi-stage Maven + JRE 21 Alpine ✅
- [x] `frontend/Dockerfile` — Node 20 Alpine + Vite dev server ✅
- [x] Verify full stack: `docker compose up -d` starts all 6 services ✅
- [x] Verify Ollama reachable from backend: `GET /api/v1/ai/health` returns `ollamaReachable: true` ✅

### Phase 8c — Backend AI implementation ✅
- [x] `ai/AiConfig.java` — WebClient for `OLLAMA_BASE_URL` ✅
- [x] `ai/OllamaClient.java` — `POST /api/chat` NDJSON stream ✅
- [x] `ai/AiService.java` — orchestrate ContextBuilder + OllamaClient ✅
- [x] `ai/AiController.java` — `POST /api/v1/ai/chat` streaming endpoint ✅
- [x] `ai/AiController.java` — `GET /api/v1/ai/health` ✅
- [x] `ai/AiRateLimiter.java` — 60 req/user/hour sliding window ✅
- [x] `ai/ContextBuilder.java` — general, feed_summary, post_improve contexts ✅
- [x] `ai/dto/ChatRequest.java`, `OllamaRequest.java`, `OllamaMessage.java` ✅

### Phase 8d — Frontend AI implementation ✅
- [x] `store/aiSlice.js` — isOpen, messages, isStreaming, error state ✅
- [x] `api/aiApi.js` — async generator consuming NDJSON stream ✅
- [x] `components/ai/AiChatButton.jsx` — floating ⚡ button + Ctrl/Cmd+K ✅
- [x] `components/ai/AiChatPanel.jsx` — slide-over panel with streaming chat ✅
- [x] `components/ai/AiMessageBubble.jsx` — markdown rendering, streaming append ✅
- [x] `components/ai/AiSuggestionBar.jsx` — quick-prompt chips ✅
- [x] `✨ Improve with AI` button in post composer ✅
- [x] Graceful degradation when Ollama is down (retry button, 10 s polling) ✅
- [x] `AppLayout.jsx` includes AiChatButton + AiChatPanel ✅

### Phase 8e — Tests ✅
- [x] `AiServiceTest` (8 cases), `OllamaClientTest` (7 cases), `AiRateLimiterTest` (9 cases) ✅
- [x] `ContextBuilderTest` (12 cases), `AiControllerIntTest` (15 cases) ✅
- [x] E2E: `tests/ai.spec.ts` — 33 test cases; `AiPage.ts` POM; `npm run test:ai` script ✅
- Deliverable: Spark AI chat panel embedded in ConnectHub, 100% free, no API key, Docker-ready ✅

## Phase A — Real-time, Messaging & Bookmarks ✅ COMPLETE

### A1 — WebSocket / Real-time infrastructure ✅
- [x] `websocket/WebSocketConfig.java` — STOMP over SockJS at `/ws`, JWT auth interceptor ✅
- [x] `websocket/WebSocketMessageController.java` — `@MessageMapping("/send-message")` → `/topic/chat/{id}` ✅
- [x] `websocket/WebSocketNotificationService.java` — push to `/user/queue/notifications` ✅
- [x] `hooks/useWebSocket.js` — app-wide STOMP client, `subscribeToConversation()`, `sendWsMessage()`, `sendTyping()` ✅
- [x] `store/messagingSlice.js` — conversations state, `receiveWsMessage` reducer, typing indicators ✅

### A2 — Real-time notifications ✅
- [x] `useWebSocket` subscribes to `/user/queue/notifications` on connect ✅
- [x] Dispatches `addNotification()` to `notificationsSlice` on new WS frame ✅
- [x] `NotificationService` calls `webSocketNotificationService.sendToUser()` on LIKE/COMMENT/FOLLOW ✅
- [x] Polling fallback in `NotificationsPage` for offline users ✅

### A3 — Post editing ✅
- [x] `PostService.update()` — ownership check (403 if not author), updates content + privacy, sets `updatedAt` ✅
- [x] `PostController` — `PUT /api/v1/posts/{id}` endpoint ✅
- [x] `api/posts.js` — `updatePost(id, data)` ✅
- [x] `store/postsSlice.js` — `updatePostThunk` + reducer replaces post in feed on success ✅
- [x] `PostCard.jsx` — inline edit mode: pencil icon (own posts only), textarea with 2000-char counter, Ctrl+Enter to save, Esc to cancel, *(edited)* badge ✅

### A4 — Bookmarks ✅
- [x] `bookmark/Bookmark.java` — entity with user, post, unique constraint ✅
- [x] `bookmark/BookmarkRepository.java` — `findByUserAndPost()`, `existsByUserAndPost()`, `findPostsByUser()` ✅
- [x] `bookmark/BookmarkService.java` — `toggle()` returns `{bookmarked: bool}`, `getBookmarks()` paginated ✅
- [x] `bookmark/BookmarkController.java` — `POST /posts/{id}/bookmark`, `GET /users/me/bookmarks` ✅
- [x] `V3__bookmarks_schema.sql` — bookmarks table with unique constraint + indexes ✅
- [x] `api/bookmarks.js` — `toggleBookmark(postId)`, `getMyBookmarks(page, size)` ✅
- [x] `store/bookmarksSlice.js` — `bookmarkedIds` Set (fast lookup), `toggleBookmarkThunk`, `fetchBookmarks` ✅
- [x] `pages/BookmarksPage.jsx` — saved posts page at `/bookmarks` ✅
- [x] `PostCard.jsx` — bookmark icon button (fills when saved) ✅
- [x] Sidebar + BottomNav — "Saved" nav link with Bookmark icon ✅

### A5 — Messaging UI ✅
- [x] `pages/MessagesPage.jsx` — two-panel layout, user search to start conversations ✅
- [x] `components/messaging/ConversationList.jsx`, `ChatWindow.jsx`, `MessageBubble.jsx`, `TypingIndicator.jsx` ✅
- [x] `api/messages.js` — REST client for conversations + messages ✅
- [x] Routing: `/messages` route; nav links in Sidebar + BottomNav with unread badges ✅

## Phase 9 — CI/CD & Infrastructure ✅ COMPLETE

### CI/CD pipeline ✅
- [x] `.github/workflows/ci.yml` — build, test, Docker image push on main ✅
  - Job 1: Maven build + unit/integration tests, uploads Surefire + JaCoCo reports
  - Job 2: npm install + Vite production build, uploads dist artifact
  - Job 3: Docker build for backend + frontend (push to GHCR on main)
  - E2E job available (commented out — enable when needed)
- [x] `.github/workflows/postman-tests.yml` — Newman / Postman collection runner ✅

### Deployment manifests ✅
- [x] `docker-compose.yml` — full local dev stack (postgres, pgadmin, ollama, backend, frontend) ✅
- [x] `deploy/docker-compose.prod.yml` — production overlay (restart policies, env vars, health checks) ✅
- [x] `deploy/nginx.conf` — reverse proxy with TLS, WebSocket upgrade, SPA fallback ✅
- [x] `deploy/.env.example` — documented env variables template ✅
- [x] `deploy/init.sql` — PostgreSQL extensions + schema owner grants ✅

### Documentation ✅
- [x] `docs/ONBOARDING.md` — developer onboarding checklist (prereqs → running stack in <30 min) ✅
- [x] `docs/api_documentation.md` — complete API reference v1.2 ✅
- [x] `docs/database_schema_doc.md` — DB schema v3.0 ✅
- [x] `docs/tech_design_doc.md` — TDD v1.3 ✅
- [x] `docs/social_media_prd.md` — PRD v1.3 ✅
- [x] `docs/openapi.yaml` — OpenAPI 3.0 spec v1.3.0 (all endpoints) ✅
- Deliverable: CI pipeline, deployment manifests, onboarding guide, complete OpenAPI spec ✅

## Phase 10 — Iterate & polish ✅ MOSTLY COMPLETE

### Performance improvements
- [x] Redis cache — `CacheConfig.java` with per-cache TTL (posts 5m, users 10m, notif-count 60s, trending-tags 5m) ✅
- [x] `@QueryHints` (HINT_READ_ONLY + HINT_FETCH_SIZE) on all hot queries in PostRepository + UserRepository ✅
- [x] Trigram GIN indexes in `deploy/init.sql` — posts content, users username + displayName (activated) ✅
- [x] Keyset (cursor) pagination for feed — `GET /posts/feed/cursor?before=<ISO>&size=20` ✅
  - `PostRepository.findFeedBefore()`, `PostService.getFeedBefore()`, `PostController.feedCursor()`

### Accessibility & UX
- [x] WCAG 2.1 AA improvements — ARIA labels on nav, sidebar, badges, textarea autocomplete, role=tab in settings ✅
- [x] Dark mode toggle in Sidebar — `themeSlice.js` persists to localStorage, applies immediately ✅
- [x] Loading skeletons — `PostSkeleton.jsx` + `FeedSkeleton` used in FeedPage, HashtagFeedPage ✅
- [x] Optimistic comment deletion — CommentList removes immediately, restores on API error ✅

### Features completed in Phase 10
- [x] Hashtag pages — `HashtagFeedPage.jsx` + `/hashtag/:tag` route + clickable `#tag` in PostCard + CommentList ✅
- [x] User mentions autocomplete — `PostComposer` detects `@word`, debounced search, dropdown with keyboard nav (↑↓ Enter Tab Esc) ✅
  - Backend already fires `MENTION` notification events on post create/edit
- [x] Admin panel — `AdminController.java` (`/api/v1/admin/stats|users`) with `@PreAuthorize("hasRole('ADMIN')")` ✅
  - `AdminPage.jsx` — stats cards, paginated user list, search, role toggle (promote/demote), delete user
  - Admin link in Sidebar (visible only to ADMIN users)
  - `V4__user_roles.sql` migration + `User.Role` enum already in place
- [x] Settings page — `SettingsPage.jsx` at `/settings` ✅
  - Profile tab: edit displayName, bio, avatarUrl — calls `PUT /api/v1/users/me`
  - Password tab: change password with show/hide toggle — calls `PUT /api/v1/users/me/password`
  - Account tab: account info, privacy notice, danger zone (delete account confirmation flow)
  - Backend: `PUT /api/v1/users/me/password` endpoint in `UserController`
- [x] `UserResponse` now includes `role` field — frontend can gate admin UI ✅

### Optional backlog (not yet implemented)
- [ ] Email verification flow
- [ ] Password reset via email (requires email service / SMTP config)
- [ ] OAuth / social login (Google, GitHub)
- [ ] Two-factor authentication (TOTP)
- [ ] Algorithmic feed scoring (engagement-weighted)
- [ ] Stories (24-hour ephemeral content)
- [ ] Group messaging (multi-participant conversations)
- [ ] Report / moderation queue in admin panel
- [ ] Full GDPR data export endpoint

---

# Milestones & Acceptance Criteria
- **M1:** ✅ Scaffolds + OpenAPI + DB schema — validated with sample calls
- **M2:** ✅ Auth + Users + Posts CRUD + tests
- **M3:** ✅ Comments, Likes, Follow, Feed working and paginated
- **M4:** ✅ Media, search, notifications integrated
- **M5:** ✅ Frontend integrated + E2E tests
- **M6:** ✅ AI Assistant (Spark), WebSocket, Messaging, Bookmarks, Post editing
- **M7:** ✅ CI/CD pipeline, production deployment manifests, full OpenAPI spec, onboarding docs
- **M8:** ✅ Admin panel, settings page, @mention autocomplete, keyset pagination, @QueryHints, WCAG ARIA

# Run & dev commands

```powershell
# Backend build and run (dev profile)
cd backend
mvn clean spring-boot:run -Dspring-boot.run.profiles=dev

# Backend tests only
cd backend
mvn test

# Frontend dev server
cd frontend
npm install
npm run dev

# Full Docker stack (all 6 services)
docker compose up -d

# E2E tests (requires running stack at localhost:3001)
cd e2e
npm ci
npm test                # all tests
npm run test:smoke      # smoke suite only
npm run test:ai         # AI tests only
```

---

*Last updated: February 25, 2026 — update statuses as tasks progress.*
