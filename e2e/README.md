# ConnectHub — Playwright E2E Test Suite

End-to-end tests for the ConnectHub social media platform.

---

## Directory structure

```
e2e/
├── fixtures/
│   └── test-data.ts          # Seed user constants, invalid payloads, sample post templates
├── helpers/
│   ├── auth.ts               # loginViaUI, loginViaAPI, logout, registerAndLogin, getToken, createPostViaAPI
│   └── api.ts                # Low-level API helpers: createPost, addComment, follow, likePost, …
├── pages/                    # Page Object Models
│   ├── FeedPage.ts
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── ProfilePage.ts
│   ├── PostDetailPage.ts
│   ├── SearchPage.ts
│   └── NotificationsPage.ts
├── tests/
│   ├── auth.spec.ts          # Register + Login (17 tests)
│   ├── feed.spec.ts          # Feed display + create post from feed (14 tests)
│   ├── posts.spec.ts         # Post detail, likes, comments via UI (13 tests)
│   ├── comments.spec.ts      # Dedicated comment CRUD, validation, pagination (18 tests)
│   ├── profile.spec.ts       # Profile view + edit + navigation (14 tests)
│   ├── follow.spec.ts        # Follow/unfollow, counters, feed updates (9 tests)
│   ├── search.spec.ts        # Users / Posts / Hashtags tabs (15 tests)
│   ├── notifications.spec.ts # Notification list, mark-read, triggers (10 tests)
│   ├── media.spec.ts         # Upload (PNG/JPEG/GIF), type rejection, URL serving (16 tests)
│   └── security.spec.ts      # JWT boundaries, authorization, injection, headers (22 tests)
├── playwright.config.ts
├── package.json
└── README.md  ← you are here
```

**Total: ~148 E2E test cases**  
**Positive scenarios: ~86 (✅)**  
**Negative scenarios: ~62 (❌)**

---

## Prerequisites

Both services must be running before you start any test run.

### Backend (with seed data)
```bash
cd backend
DB_PASSWORD=secret mvn spring-boot:run -Dspring-boot.run.profiles=postgres,dev
```
Backend: `http://localhost:9090`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: `http://localhost:3001`

### Install Playwright browsers (first time only)
```bash
cd e2e
npm install
npm run install-browsers
```

---

## Running tests

```bash
cd e2e

# Run everything (headless)
npm test

# Run with Playwright UI (watch mode)
npm run test:ui

# Run a specific suite
npm run test:auth
npm run test:comments
npm run test:security
npm run test:media

# Run only positive or negative scenarios
npm run test:positive
npm run test:negative

# Run smoke tests (login / register / feed)
npm run test:smoke

# Cross-browser
npm run test:chromium
npm run test:firefox
npm run test:mobile

# Open HTML report after a run
npm run report

# Generate test code by interacting with the app
npm run codegen
```

---

## Test design decisions

| Decision | Rationale |
|----------|-----------|
| `loginViaAPI` for most tests | Fast setup; only `auth.spec.ts` tests the actual login form |
| `@Transactional` / seed data | Tests rely on DataSeeder; never mutate seed users' usernames/emails |
| `test.beforeEach` vs `test.beforeAll` | `beforeEach` for UI state; `beforeAll` for shared read-only API tokens |
| API helpers for negative tests | Backend validation is best verified at the API layer, not by fighting the UI |
| Unique content via `Date.now()` | Prevents test pollution when tests run in the same database session |
| `test:negative` / `test:positive` grep | Allows quick regression runs on either scenario type |

---

## Seed users (DataSeeder — `postgres,dev` profile)

| Username | Email            | Password    | Follow relationships        |
|----------|------------------|-------------|-----------------------------|
| alice    | alice@demo.com   | Password1!  | follows bob, carol          |
| bob      | bob@demo.com     | Password1!  | follows alice               |
| carol    | carol@demo.com   | Password1!  | follows alice, bob          |
| dave     | dave@demo.com    | Password1!  | follows alice               |
| eve      | eve@demo.com     | Password1!  | follows bob                 |

---

## CI integration

Add to your GitHub Actions workflow:

```yaml
- name: Install Playwright browsers
  run: cd e2e && npm ci && npx playwright install --with-deps chromium

- name: Run E2E tests
  run: cd e2e && npm test
  env:
    CI: true

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: e2e/playwright-report/
```
