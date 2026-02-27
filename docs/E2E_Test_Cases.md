# E2E Test Cases — ConnectHub Social Media Platform
## API Testing & Playwright End-to-End Scenarios

**Version:** 1.0  
**Date:** February 25, 2026  
**Base API URL:** `http://localhost:9090/api/v1`  
**Frontend URL:** `http://localhost:3001`  
**Test Runner:** Playwright v1.50  
**Status:** Complete — all features through Phase 10

---

## Table of Contents

1. [Overview & Conventions](#1-overview--conventions)
2. [Test Infrastructure](#2-test-infrastructure)
3. [Authentication](#3-authentication)
4. [Feed](#4-feed)
5. [Posts](#5-posts)
6. [Comments](#6-comments)
7. [Likes & Bookmarks](#7-likes--bookmarks)
8. [Follow / Unfollow](#8-follow--unfollow)
9. [User Profile](#9-user-profile)
10. [Search & Discovery](#10-search--discovery)
11. [Notifications](#11-notifications)
12. [Direct Messaging](#12-direct-messaging)
13. [Media Upload](#13-media-upload)
14. [Mentions Autocomplete](#14-mentions-autocomplete)
15. [Admin Panel](#15-admin-panel)
16. [Settings Page](#16-settings-page)
17. [Cursor / Keyset Pagination](#17-cursor--keyset-pagination)
18. [AI Assistant (Spark)](#18-ai-assistant-spark)
19. [Security](#19-security)
20. [Coverage Matrix](#20-coverage-matrix)

---

## 1. Overview & Conventions

### 1.1 Test Types in this Document

This document specifies two complementary layers of test coverage for every feature:

**API Tests** — exercise the Spring Boot REST backend directly using Playwright's `APIRequestContext`. These tests are fast, isolated, and validate request/response contracts, HTTP status codes, authorization rules, and data integrity. They run without a browser.

**Playwright UI Tests** — drive the React frontend in a real Chromium/Firefox/mobile browser. They validate end-to-end user flows, optimistic UI updates, real-time WebSocket events, navigation, and accessibility.

### 1.2 Scenario Labels

| Label | Meaning |
|-------|---------|
| `✅ positive` | Happy path — valid input, expected success |
| `❌ negative` | Error path — bad input, wrong state, or unauthorized action |

### 1.3 Seed Users

All tests that need existing accounts use these dev-seed users (created automatically when the backend runs with the `dev` Spring profile):

| Username | Email | Password | Role | Follows |
|----------|-------|----------|------|---------|
| alice | alice@demo.com | Password1! | USER | bob |
| bob | bob@demo.com | Password1! | USER | alice, carol |
| carol | carol@demo.com | Password1! | USER | bob |
| dave | dave@demo.com | Password1! | USER | — |
| eve | eve@demo.com | Password1! | USER | — |

### 1.4 Shared Helpers Reference

```typescript
// fixtures/test-data.ts
SEED.alice / SEED.bob / SEED.carol / SEED.dave / SEED.eve
newUser(suffix)       // generates a unique user object for registration tests
INVALID.*             // shortPassword, badEmail, emptyString, etc.

// helpers/auth.ts
loginViaUI(page, username, password)
loginViaAPI(context, page, username, password)   // faster — injects JWT into localStorage
getToken(page, username, password)               // returns JWT string
logout(page)

// helpers/api.ts
createPost(request, token, content, privacy, imageUrl?)
deletePost(request, token, postId)
likePost / unlikePost(request, token, postId)
addComment / deleteComment(request, token, postId, commentId)
follow / unfollow(request, token, username)
getUnreadCount(request, token)
getUser(request, token, username)
updateProfile(request, token, update)
```

---

## 2. Test Infrastructure

### 2.1 Playwright Configuration Summary

```typescript
// e2e/playwright.config.ts
baseURL:    'http://localhost:3001'
testDir:    './tests'
workers:    1              // sequential — tests share seed data
timeout:    30_000
retries:    1 (CI only)

projects:
  - chromium (Desktop Chrome)
  - firefox  (Desktop Firefox)
  - mobile-chrome (Pixel 5)
```

### 2.2 NPM Test Scripts

```bash
npm test                          # run full suite
npm run test:auth                 # auth suite only
npm run test:positive             # all ✅ tests (grep '✅')
npm run test:negative             # all ❌ tests (grep '❌')
npm run test:smoke                # login + register + feed
npm run test:ui                   # interactive Playwright UI mode
npm run test:headed               # run in visible browser
npm run test:chromium / :firefox / :mobile   # per browser
```

### 2.3 Prerequisites

Before running any test, ensure:
- Backend is running on port 9090 (`spring-boot:run -Dspring-boot.run.profiles=postgres,dev`)
- Frontend is running on port 3001 (`npm run dev` inside `/frontend`)
- PostgreSQL is running and connected
- Redis is running on port 6379
- Backend `dev` profile has seeded the five seed users and their posts

---

## 3. Authentication

### 3.1 API Tests — Registration

**TC-AUTH-API-001 ✅ POST /auth/register — valid new user**
```
Request:
  POST /api/v1/auth/register
  { username: "newuser_<ts>", email: "new_<ts>@test.com",
    password: "Password1!", displayName: "New User" }

Expected:
  Status:  200 or 201
  Body:    { token: <jwt-string>, user: { id, username, ... } }
  token must be a non-empty string
```

**TC-AUTH-API-002 ❌ POST /auth/register — duplicate username**
```
Request:
  { username: "alice", email: "another@test.com", password: "Password1!" }

Expected:
  Status:  409 Conflict
  Body contains error message referencing duplicate / already exists
```

**TC-AUTH-API-003 ❌ POST /auth/register — duplicate email**
```
Request:
  { username: "uniqueuser99", email: "alice@demo.com", password: "Password1!" }

Expected:
  Status:  409 Conflict
```

**TC-AUTH-API-004 ❌ POST /auth/register — password too short**
```
Request:
  { username: "shortpw", email: "sp@test.com", password: "abc" }

Expected:
  Status:  400 Bad Request
```

**TC-AUTH-API-005 ❌ POST /auth/register — invalid email format**
```
Request:
  { username: "bademail", email: "not-an-email", password: "Password1!" }

Expected:
  Status:  400 Bad Request
```

**TC-AUTH-API-006 ❌ POST /auth/register — blank username**
```
Request:
  { username: "", email: "blank@test.com", password: "Password1!" }

Expected:
  Status:  400 Bad Request
```

**TC-AUTH-API-007 ❌ POST /auth/register — username with spaces**
```
Request:
  { username: "user name", email: "sp@test.com", password: "Password1!" }

Expected:
  Status:  400 Bad Request
```

**TC-AUTH-API-008 ❌ POST /auth/register — username too long (>30 chars)**
```
Request:
  { username: "a".repeat(31), email: "long@test.com", password: "Password1!" }

Expected:
  Status:  400 Bad Request
```

---

### 3.2 API Tests — Login

**TC-AUTH-API-010 ✅ POST /auth/login — valid username + password**
```
Request:
  POST /api/v1/auth/login
  { usernameOrEmail: "alice", password: "Password1!" }

Expected:
  Status:  200
  Body:    { token: <jwt>, user: { id, username: "alice", email: "alice@demo.com", ... } }
  token is a valid JWT (3 dot-separated segments)
```

**TC-AUTH-API-011 ✅ POST /auth/login — valid email + password**
```
Request:
  { usernameOrEmail: "alice@demo.com", password: "Password1!" }

Expected:
  Status:  200
  Body:    { token: <jwt>, user: ... }
```

**TC-AUTH-API-012 ❌ POST /auth/login — wrong password**
```
Request:
  { usernameOrEmail: "alice", password: "WrongPassword!" }

Expected:
  Status:  401 Unauthorized
  No token in body
```

**TC-AUTH-API-013 ❌ POST /auth/login — non-existent user**
```
Request:
  { usernameOrEmail: "nobody_xyz_99999", password: "Password1!" }

Expected:
  Status:  401 Unauthorized
```

**TC-AUTH-API-014 ❌ POST /auth/login — blank credentials**
```
Request:
  { usernameOrEmail: "", password: "" }

Expected:
  Status:  400 Bad Request
```

---

### 3.3 API Tests — Protected Routes Without Token

**TC-AUTH-API-020 ❌ GET /users/me — no Authorization header → 401**
**TC-AUTH-API-021 ❌ GET /posts/feed — no token → 401**
**TC-AUTH-API-022 ❌ POST /posts — no token → 401**
**TC-AUTH-API-023 ❌ GET /notifications — no token → 401**
**TC-AUTH-API-024 ❌ PUT /users/me — no token → 401**
**TC-AUTH-API-025 ❌ POST /users/alice/follow — no token → 401**

All of the above:
```
Expected:
  Status:  401 Unauthorized
  Body:    error message referencing authentication / unauthorized
```

---

### 3.4 Playwright UI Tests — Registration

**TC-AUTH-UI-001 ✅ New user can register and is redirected to feed**
```
Steps:
  1. Navigate to /register (or click "Sign up" link from /login)
  2. Fill: username=testuser_<ts>, email=testuser_<ts>@playwright.test,
           password=Password1!, displayName=Test User
  3. Click Submit

Expected:
  - Page URL becomes "/"
  - Feed page is visible (post composer textarea present)
  - No error message shown
```

**TC-AUTH-UI-002 ❌ Register with duplicate username shows inline error**
```
Steps:
  1. Navigate to /register
  2. Fill: username=alice (already exists), email=new@playwright.test
  3. Submit

Expected:
  - URL stays on /register
  - Error text visible on page (references duplicate / taken)
  - No redirect to feed
```

**TC-AUTH-UI-003 ❌ Register with duplicate email shows error**
```
Steps:
  1. Fill: username=uniqueabc, email=alice@demo.com
  2. Submit

Expected:
  - Error visible, no redirect
```

**TC-AUTH-UI-004 ❌ Register with short password shows validation error**
```
Steps:
  1. Fill password field with "abc" (< 8 chars)
  2. Submit

Expected:
  - Inline error on password field
  - Form not submitted
```

**TC-AUTH-UI-005 ❌ Register with invalid email format shows error**
```
Steps:
  1. Fill email with "not-an-email"
  2. Submit

Expected:
  - Inline error on email field
```

**TC-AUTH-UI-006 ❌ Register with blank username shows error**
```
Steps:
  1. Leave username empty, fill other fields
  2. Submit (or browser prevents — either is acceptable)

Expected:
  - Error visible or form does not submit
```

---

### 3.5 Playwright UI Tests — Login

**TC-AUTH-UI-010 ✅ Login with username redirects to feed**
```
Steps:
  1. Navigate to /login
  2. Fill username="alice", password="Password1!"
  3. Click Login

Expected:
  - URL becomes "/"
  - Feed page visible
  - Alice's name or username visible in sidebar / header
```

**TC-AUTH-UI-011 ✅ Login with email redirects to feed**
```
Steps:
  1. Fill usernameOrEmail="alice@demo.com", password="Password1!"
  2. Submit

Expected:
  - Redirected to "/"
```

**TC-AUTH-UI-012 ✅ Unauthenticated user visiting / is redirected to /login**
```
Steps:
  1. Clear localStorage
  2. Navigate to "/"

Expected:
  - URL becomes "/login" within 6 seconds
```

**TC-AUTH-UI-013 ✅ Logout clears session and redirects to /login**
```
Steps:
  1. Login as alice
  2. Click Logout button (sidebar)

Expected:
  - URL becomes "/login"
  - localStorage key "token" is null
```

**TC-AUTH-UI-014 ✅ After logout, navigating to / redirects back to /login**
```
Steps:
  1. Login, logout
  2. Navigate to "/"

Expected:
  - Redirected to "/login"
```

**TC-AUTH-UI-015 ❌ Login with wrong password shows error, no redirect**
```
Steps:
  1. Fill: username="alice", password="WrongPassword!"
  2. Submit

Expected:
  - Error message visible
  - URL stays on "/login"
```

**TC-AUTH-UI-016 ❌ Login with non-existent user shows error**
```
Steps:
  1. Fill: username="nobody_xyz_99999", password="Password1!"
  2. Submit

Expected:
  - Error message visible
```

**TC-AUTH-UI-017 ❌ Login with blank credentials shows error**
```
Steps:
  1. Leave both fields empty, submit

Expected:
  - Error or browser prevents submission
```

**TC-AUTH-UI-018 ✅ Removing token from localStorage causes redirect to /login on next navigation**
```
Steps:
  1. Login via API
  2. page.evaluate(() => localStorage.removeItem('token'))
  3. Navigate to /notifications

Expected:
  - URL becomes "/login"
```

**TC-AUTH-UI-019 ✅ Replacing token with garbage causes redirect to /login**
```
Steps:
  1. Login via API
  2. page.evaluate(() => localStorage.setItem('token', 'this.is.garbage'))
  3. Navigate to /

Expected:
  - Page shows login or redirects to /login (API calls fail → auth guard fires)
```

---

## 4. Feed

### 4.1 API Tests

**TC-FEED-API-001 ✅ GET /posts/feed — returns paginated posts for authenticated user**
```
Request:
  GET /api/v1/posts/feed?page=0&size=20
  Authorization: Bearer <alice-token>

Expected:
  Status:  200
  Body:    { content: [...], page: { number: 0, size: 20, totalElements: N, totalPages: P } }
  content is an array of post objects
  Each post has: id, content, author { username, displayName }, likesCount, commentsCount, createdAt
```

**TC-FEED-API-002 ✅ Feed contains posts from followed users (not strangers)**
```
Alice follows bob. Alice's feed must contain bob's posts.
Alice does NOT follow dave. Dave's posts must NOT appear in alice's feed
(unless they are trending / explore — for the home feed endpoint specifically).

Verify:
  - At least one post in alice's feed is from bob
  - No posts from dave (who alice does not follow)
```

**TC-FEED-API-003 ✅ GET /posts/feed — pagination works correctly**
```
Request: GET /posts/feed?page=0&size=5
Response page 0 has ≤5 posts.

Request: GET /posts/feed?page=1&size=5
Response page 1 has different post IDs than page 0.
```

**TC-FEED-API-004 ❌ GET /posts/feed — no token → 401**
```
Request:
  GET /api/v1/posts/feed  (no auth header)

Expected:
  Status:  401
```

**TC-FEED-API-005 ✅ GET /posts/feed/cursor — keyset pagination returns first page**
```
Request:
  GET /api/v1/posts/feed/cursor?size=10
  Authorization: Bearer <alice-token>

Expected:
  Status:  200
  Body:    { posts: [...], nextCursor: "<ISO-8601 string>", hasMore: true | false }
  posts array length ≤ 10
  nextCursor is a valid ISO-8601 datetime string (if hasMore=true)
```

**TC-FEED-API-006 ✅ GET /posts/feed/cursor — passing cursor returns older posts**
```
Step 1: GET /posts/feed/cursor?size=5 → note nextCursor
Step 2: GET /posts/feed/cursor?size=5&before=<nextCursor>

Expected for Step 2:
  All returned posts have createdAt < the cursor datetime
  No post IDs overlap with Step 1's response
```

**TC-FEED-API-007 ✅ GET /posts/feed/cursor — when no more posts, hasMore is false**
```
Request: GET /posts/feed/cursor?size=1000  (larger than total post count)

Expected:
  hasMore = false
  nextCursor = "" or absent
```

**TC-FEED-API-008 ❌ GET /posts/feed/cursor — invalid before param is handled gracefully**
```
Request:
  GET /api/v1/posts/feed/cursor?before=not-a-date

Expected:
  Status: 400 Bad Request  OR  ignores param and returns first page
  Must NOT return 500
```

---

### 4.2 Playwright UI Tests

**TC-FEED-UI-001 ✅ Authenticated user sees the feed page with posts**
```
Steps:
  1. loginViaAPI as alice
  2. Navigate to "/"

Expected:
  - URL is "/"
  - At least one article/post-card element is visible
  - Post composer textarea is visible
```

**TC-FEED-UI-002 ✅ Feed shows post author name and username**
```
Expected:
  - First post card contains text (author name/username)
```

**TC-FEED-UI-003 ✅ New public post appears on feed after submission**
```
Steps:
  1. Login as alice
  2. Fill composer textarea with unique text "E2E public post <ts>"
  3. Click Post button

Expected:
  - Post content visible on page within 8 seconds
  - No error toast shown
```

**TC-FEED-UI-004 ✅ Post button is disabled when textarea is empty**
```
Steps:
  1. Login, go to "/"
  2. Clear textarea
  3. Inspect Post button

Expected:
  - Button has disabled attribute
```

**TC-FEED-UI-005 ✅ Character counter decrements as user types**
```
Steps:
  1. Type "Hello" (5 chars) in composer

Expected:
  - Counter shows remaining chars decreased by 5
```

**TC-FEED-UI-006 ✅ Followers-only post is created without error**
```
Steps:
  1. Select privacy = FOLLOWERS_ONLY in composer
  2. Submit post

Expected:
  - URL stays on "/"
  - No error toast
```

**TC-FEED-UI-007 ✅ Private post is created without error**
```
Steps:
  1. Select privacy = PRIVATE
  2. Submit post

Expected:
  - URL stays on "/"
```

**TC-FEED-UI-008 ✅ Deleting own post removes it from feed**
```
Steps:
  1. Create post "Delete me <ts>"
  2. Locate post card, click Delete / "..." menu → Delete
  3. Confirm if dialog shown

Expected:
  - Post content no longer visible on page
```

**TC-FEED-UI-009 ❌ Submitting empty post is prevented**
```
Steps:
  1. Don't type anything in composer
  2. Click Post button (if somehow enabled)

Expected:
  - Post count does not increase
  - No network POST /posts made with empty content
```

**TC-FEED-UI-010 ❌ Unauthenticated user visiting feed is redirected to /login**
```
Steps:
  1. Clear localStorage
  2. Navigate to "/"

Expected:
  - Redirected to "/login"
```

---

## 5. Posts

### 5.1 API Tests — CRUD

**TC-POST-API-001 ✅ POST /posts — create public post**
```
Request:
  POST /api/v1/posts
  Authorization: Bearer <alice-token>
  { content: "Hello world! #e2etest", privacy: "PUBLIC" }

Expected:
  Status:  201 or 200
  Body:    { id: <number>, content: "Hello world! #e2etest",
             privacy: "PUBLIC", author: { username: "alice" },
             likesCount: 0, commentsCount: 0, createdAt: <iso> }
```

**TC-POST-API-002 ✅ POST /posts — create followers-only post**
```
Request:
  { content: "Followers only", privacy: "FOLLOWERS_ONLY" }

Expected:
  Status:  201 or 200
  Body:    { privacy: "FOLLOWERS_ONLY", ... }
```

**TC-POST-API-003 ✅ POST /posts — create private post**
```
Request:
  { content: "Private post", privacy: "PRIVATE" }

Expected:
  Status:  201 or 200
  Body:    { privacy: "PRIVATE", ... }
```

**TC-POST-API-004 ✅ GET /posts/{id} — retrieve own post**
```
Request:
  GET /api/v1/posts/<post-id>
  Authorization: Bearer <alice-token>

Expected:
  Status:  200
  Body:    post object with correct id and content
```

**TC-POST-API-005 ✅ GET /posts/{id} — retrieve public post of another user**
```
Request (as alice viewing bob's public post):
  GET /api/v1/posts/<bob-post-id>

Expected:
  Status:  200
  author.username = "bob"
```

**TC-POST-API-006 ✅ PUT /posts/{id} — edit own post content**
```
Request:
  PUT /api/v1/posts/<alice-post-id>
  Authorization: Bearer <alice-token>
  { content: "Updated content", privacy: "PUBLIC" }

Expected:
  Status:  200
  Body:    { id: same, content: "Updated content", updatedAt: <different-from-createdAt> }
```

**TC-POST-API-007 ✅ PUT /posts/{id} — change post privacy**
```
Request:
  PUT /api/v1/posts/<alice-post-id>
  { content: "Same content", privacy: "PRIVATE" }

Expected:
  Status:  200
  Body:    { privacy: "PRIVATE" }
```

**TC-POST-API-008 ✅ DELETE /posts/{id} — delete own post**
```
Request:
  DELETE /api/v1/posts/<alice-post-id>
  Authorization: Bearer <alice-token>

Expected:
  Status:  200 or 204
  Subsequent GET /posts/<id> returns 404
```

**TC-POST-API-009 ❌ POST /posts — no token → 401**
```
Request:
  POST /api/v1/posts  (no auth)
  { content: "Hello" }

Expected:
  Status:  401
```

**TC-POST-API-010 ❌ POST /posts — empty content → 400**
```
Request:
  POST /api/v1/posts
  { content: "", privacy: "PUBLIC" }

Expected:
  Status:  400 Bad Request
```

**TC-POST-API-011 ❌ POST /posts — content over max length → 400**
```
Request:
  { content: "a".repeat(5001), privacy: "PUBLIC" }

Expected:
  Status:  400 Bad Request
```

**TC-POST-API-012 ❌ PUT /posts/{id} — edit another user's post → 403**
```
Request (alice tries to edit bob's post):
  PUT /api/v1/posts/<bob-post-id>
  Authorization: Bearer <alice-token>
  { content: "Hijacked" }

Expected:
  Status:  403 Forbidden
```

**TC-POST-API-013 ❌ DELETE /posts/{id} — delete another user's post → 403**
```
Request (bob tries to delete alice's post):
  DELETE /api/v1/posts/<alice-post-id>
  Authorization: Bearer <bob-token>

Expected:
  Status:  403 Forbidden
  Alice's post is still retrievable via GET
```

**TC-POST-API-014 ❌ GET /posts/{id} — non-existent post → 404**
```
Request:
  GET /api/v1/posts/99999999

Expected:
  Status:  404 Not Found
```

**TC-POST-API-015 ❌ GET /posts/{id} — private post of another user → 403 or 404**
```
Alice creates PRIVATE post. Bob attempts GET.

Expected:
  Status:  403 or 404 (must not return 200 with content)
```

---

### 5.2 Playwright UI Tests — Post Detail

**TC-POST-UI-001 ✅ Clicking a post card opens its detail page**
```
Steps:
  1. Login as alice, go to "/"
  2. Click on an article card

Expected:
  - URL matches /posts/<number>
```

**TC-POST-UI-002 ✅ Post detail page shows the correct content**
```
Steps:
  1. Create post via API with unique content "Detail page test <ts>"
  2. Navigate to /posts/<id>

Expected:
  - Unique content text is visible on the page
```

**TC-POST-UI-003 ✅ Post detail shows comment input section**
```
Expected:
  - An input or textarea with placeholder mentioning "comment" is visible
```

**TC-POST-UI-004 ✅ Back navigation leaves post detail page**
```
Steps:
  1. Navigate from feed to post detail
  2. Click Back button

Expected:
  - URL is no longer /posts/<id>
```

**TC-POST-UI-005 ✅ Edited post shows (edited) badge**
```
Steps:
  1. Create post via API
  2. Edit post via PUT /posts/<id>
  3. Navigate to /posts/<id>

Expected:
  - Post shows an "edited" label or badge
```

**TC-POST-UI-006 ❌ Navigating to non-existent post shows 404 message or redirects**
```
Steps:
  1. Navigate to /posts/99999999

Expected:
  - "Not found" text visible OR redirect to "/"
```

---

## 6. Comments

### 6.1 API Tests

**TC-CMT-API-001 ✅ POST /posts/{id}/comments — add comment**
```
Request:
  POST /api/v1/posts/<post-id>/comments
  Authorization: Bearer <alice-token>
  { content: "Great post!" }

Expected:
  Status:  201 or 200
  Body:    { id: <number>, content: "Great post!",
             author: { username: "alice" }, createdAt: <iso> }
```

**TC-CMT-API-002 ✅ GET /posts/{id}/comments — lists comments after adding one**
```
Steps:
  1. Add comment (TC-CMT-API-001)
  2. GET /posts/<id>/comments

Expected:
  Status:  200
  Body:    { content: [ { id, content: "Great post!", author: ... } ], ... }
  At least one comment in the list matching the one just added
```

**TC-CMT-API-003 ✅ DELETE /posts/{id}/comments/{commentId} — author deletes own comment**
```
Request:
  DELETE /api/v1/posts/<post-id>/comments/<comment-id>
  Authorization: Bearer <alice-token>  (alice is comment author)

Expected:
  Status:  200 or 204
  Subsequent GET /comments does not include that comment ID
```

**TC-CMT-API-004 ✅ Comment count on post increments after adding a comment**
```
Steps:
  1. GET /posts/<id> → note commentsCount = N
  2. POST /posts/<id>/comments { content: "New comment" }
  3. GET /posts/<id> → note commentsCount

Expected:
  commentsCount = N + 1
```

**TC-CMT-API-005 ❌ POST /posts/{id}/comments — empty content → 400**
```
Request:
  { content: "" }

Expected:
  Status:  400 Bad Request
```

**TC-CMT-API-006 ❌ POST /posts/{id}/comments — no token → 401**
```
Request:
  POST /posts/<id>/comments  (no auth)

Expected:
  Status:  401
```

**TC-CMT-API-007 ❌ POST /posts/{id}/comments — comment on non-existent post → 404**
```
Request:
  POST /api/v1/posts/99999999/comments
  Authorization: Bearer <alice-token>
  { content: "Comment on nothing" }

Expected:
  Status:  404 Not Found
```

**TC-CMT-API-008 ❌ DELETE /posts/{id}/comments/{id} — delete another user's comment → 403**
```
Steps:
  1. Alice adds comment to a post
  2. Bob sends DELETE for alice's comment ID

Expected:
  Status:  403 Forbidden
  Comment still exists in GET /comments
```

---

### 6.2 Playwright UI Tests

**TC-CMT-UI-001 ✅ Typing and submitting a comment shows it in the list**
```
Steps:
  1. Create post via API, navigate to /posts/<id>
  2. Fill comment input with "My E2E comment <ts>"
  3. Press Enter or click submit button

Expected:
  - Comment text visible in comment list within 6 seconds
```

**TC-CMT-UI-002 ✅ Comment count increments after adding a comment**
```
Expected:
  - Comment count label on post shows ≥ 1 after submission
```

**TC-CMT-UI-003 ✅ Author can delete their own comment**
```
Steps:
  1. Add comment
  2. Click Delete button on that comment

Expected:
  - Comment disappears from list
```

**TC-CMT-UI-004 ❌ Submitting empty comment is prevented**
```
Steps:
  1. Leave comment input empty
  2. Press Enter

Expected:
  - No new comment appears
  - Comment count unchanged
```

**TC-CMT-UI-005 ❌ Delete button not visible on other users' comments**
```
Steps:
  1. Login as alice, view a post by bob with bob's comment
  2. Inspect bob's comment

Expected:
  - No delete button visible on bob's comment as alice
```

---

## 7. Likes & Bookmarks

### 7.1 API Tests — Likes

**TC-LIKE-API-001 ✅ POST /posts/{id}/like — like a post**
```
Request:
  POST /api/v1/posts/<post-id>/like
  Authorization: Bearer <alice-token>

Expected:
  Status:  200
  Body:    { likedByCurrentUser: true, likesCount: N+1 }  (or equivalent)
```

**TC-LIKE-API-002 ✅ Unlike — like count decrements**
```
Steps:
  1. Like post → likesCount = N+1
  2. DELETE /posts/<id>/like → Expected: Status 200, likesCount = N
```

**TC-LIKE-API-003 ✅ GET /posts/{id} after liking — isLiked / likedByCurrentUser = true**
```
Expected:
  Body:    { likedByCurrentUser: true, ... }
```

**TC-LIKE-API-004 ❌ Like same post twice → 409 Conflict**
```
Steps:
  1. POST /posts/<id>/like  → 200
  2. POST /posts/<id>/like  → Expected: 409 Conflict
```

**TC-LIKE-API-005 ❌ Like non-existent post → 404**
```
Request:
  POST /api/v1/posts/99999999/like

Expected:
  Status:  404 Not Found
```

**TC-LIKE-API-006 ❌ Like without token → 401**
```
Expected: Status 401
```

---

### 7.2 API Tests — Bookmarks

**TC-BKM-API-001 ✅ POST /posts/{id}/bookmark — bookmarks a post (toggle on)**
```
Request:
  POST /api/v1/posts/<post-id>/bookmark
  Authorization: Bearer <alice-token>

Expected:
  Status:  200
  Body:    { bookmarked: true }
```

**TC-BKM-API-002 ✅ GET /users/me/bookmarks — returns bookmarked posts**
```
Steps:
  1. Bookmark a post (TC-BKM-API-001)
  2. GET /users/me/bookmarks

Expected:
  Status:  200
  Body contains post object that was just bookmarked (matching id)
```

**TC-BKM-API-003 ✅ POST /posts/{id}/bookmark (second call) — unbookmarks (toggle off)**
```
Steps:
  1. Bookmark post → { bookmarked: true }
  2. POST again (same endpoint)

Expected:
  Status:  200
  Body:    { bookmarked: false }
  Post no longer appears in GET /users/me/bookmarks
```

**TC-BKM-API-004 ✅ GET /users/me/bookmarks — paginated, newest bookmark first**
```
Request:
  GET /api/v1/users/me/bookmarks?page=0&size=20

Expected:
  Status:  200
  Body:    { content: [...], page: { number: 0, ... } }
```

**TC-BKM-API-005 ❌ GET /users/me/bookmarks — no token → 401**

**TC-BKM-API-006 ❌ POST /posts/{id}/bookmark — non-existent post → 404**

---

### 7.3 Playwright UI Tests — Likes

**TC-LIKE-UI-001 ✅ Clicking heart/like button increments count**
```
Steps:
  1. Login, create a post, navigate to its detail
  2. Note initial like count (0)
  3. Click like button

Expected:
  - Like count becomes 1
  - Button icon/color changes (filled heart)
```

**TC-LIKE-UI-002 ✅ Clicking liked button again toggles like off**
```
Steps:
  1. Like the post (TC-LIKE-UI-001)
  2. Click like button again

Expected:
  - Count returns to 0
  - Icon returns to unfilled state
```

---

### 7.4 Playwright UI Tests — Bookmarks

**TC-BKM-UI-001 ✅ Bookmarking a post adds it to the saved list**
```
Steps:
  1. Find a post, click bookmark icon
  2. Navigate to /bookmarks or profile bookmarks tab

Expected:
  - The bookmarked post appears in the list
```

**TC-BKM-UI-002 ✅ Un-bookmarking removes post from saved list**
```
Steps:
  1. Bookmark a post
  2. Click bookmark icon again

Expected:
  - Icon shows unbookmarked state
  - Post no longer in /bookmarks list
```

---

## 8. Follow / Unfollow

### 8.1 API Tests

**TC-FOLLOW-API-001 ✅ POST /users/{username}/follow — follow a user**
```
Request:
  POST /api/v1/users/carol/follow
  Authorization: Bearer <eve-token>

Expected:
  Status:  200
  Body:    { following: true, ... }  (or equivalent)
  GET /users/carol → followerCount incremented by 1
```

**TC-FOLLOW-API-002 ✅ DELETE /users/{username}/follow — unfollow**
```
Steps:
  1. Follow carol as eve
  2. DELETE /users/carol/follow as eve

Expected:
  Status:  200
  GET /users/carol → followerCount decremented
```

**TC-FOLLOW-API-003 ✅ After following, followed user's posts appear in follower's feed**
```
Steps:
  1. Eve follows dave (not previously followed)
  2. Dave creates a public post
  3. GET /posts/feed as eve

Expected:
  Dave's new post is in eve's feed response
```

**TC-FOLLOW-API-004 ❌ Follow self → 403 Forbidden**
```
Request:
  POST /api/v1/users/alice/follow
  Authorization: Bearer <alice-token>

Expected:
  Status:  403 Forbidden
```

**TC-FOLLOW-API-005 ❌ Follow same user twice → 409 Conflict**
```
Steps:
  1. POST /users/carol/follow → 200
  2. POST /users/carol/follow → Expected: 409 Conflict
```

**TC-FOLLOW-API-006 ❌ Follow non-existent user → 404**
```
Request:
  POST /api/v1/users/nobody_xyz_99999/follow

Expected:
  Status:  404 Not Found
```

**TC-FOLLOW-API-007 ❌ Follow without token → 401**

---

### 8.2 Playwright UI Tests

**TC-FOLLOW-UI-001 ✅ Can follow a user from their profile page**
```
Steps:
  1. Login as eve
  2. Navigate to /profile/carol
  3. Click Follow button

Expected:
  - Button changes to "Unfollow" or "Following"
  - Follower count increments (or stays ≥ previous value)
```

**TC-FOLLOW-UI-002 ✅ Can unfollow a user already followed**
```
Steps:
  1. Follow carol via API
  2. Navigate to /profile/carol
  3. Click Unfollow

Expected:
  - Button changes back to "Follow"
```

**TC-FOLLOW-UI-003 ❌ Follow/Unfollow button not shown on own profile**
```
Steps:
  1. Login as alice
  2. Navigate to /profile/alice

Expected:
  - No Follow or Unfollow button visible
  - Edit Profile button is visible instead
```

**TC-FOLLOW-UI-004 ✅ Following someone causes their posts to appear in feed**
```
Steps:
  1. Login as eve (not following dave)
  2. Note feed post count
  3. Follow dave
  4. Dave creates a post
  5. Refresh feed

Expected:
  - Dave's new post visible in feed
```

**TC-FOLLOW-UI-005 ✅ Follower/following counts are displayed on profiles**
```
Steps:
  1. Navigate to /profile/bob

Expected:
  - Text referencing "followers" and "following" is visible with numeric values
```

---

## 9. User Profile

### 9.1 API Tests

**TC-PROF-API-001 ✅ GET /users/{username} — retrieve own profile**
```
Request:
  GET /api/v1/users/alice
  Authorization: Bearer <alice-token>

Expected:
  Status:  200
  Body:    { id, username: "alice", displayName: "Alice Wonderland",
             followersCount: N, followingCount: M, postsCount: P, role: "USER" }
```

**TC-PROF-API-002 ✅ GET /users/{username} — retrieve another user's public profile**
```
Request:
  GET /api/v1/users/bob  (as alice)

Expected:
  Status:  200
  Body:    bob's profile data visible
```

**TC-PROF-API-003 ✅ GET /users/me — returns currently authenticated user**
```
Request:
  GET /api/v1/users/me
  Authorization: Bearer <bob-token>

Expected:
  Status:  200
  Body:    { username: "bob", ... }
```

**TC-PROF-API-004 ✅ PUT /users/me — update display name**
```
Request:
  PUT /api/v1/users/me
  { displayName: "Alice Updated" }

Expected:
  Status:  200
  Body:    { displayName: "Alice Updated", ... }
```

**TC-PROF-API-005 ✅ PUT /users/me — update bio**
```
Request:
  PUT /api/v1/users/me
  { bio: "My new bio" }

Expected:
  Status:  200
  Body:    { bio: "My new bio", ... }
```

**TC-PROF-API-006 ✅ PUT /users/me — update avatar URL**
```
Request:
  { avatarUrl: "https://example.com/avatar.jpg" }

Expected:
  Status:  200
```

**TC-PROF-API-007 ✅ GET /users/{username}/posts — returns user's public posts**
```
Request:
  GET /api/v1/users/alice/posts?page=0&size=20

Expected:
  Status:  200
  All posts in content[].author.username === "alice"
```

**TC-PROF-API-008 ❌ GET /users/{username} — non-existent username → 404**
```
Request:
  GET /api/v1/users/nobody_xyz_99999

Expected:
  Status:  404 Not Found
```

**TC-PROF-API-009 ❌ PUT /users/me — bio over 200 chars → 400**
```
Request:
  PUT /api/v1/users/me
  { bio: "a".repeat(201) }

Expected:
  Status:  400 Bad Request
```

**TC-PROF-API-010 ❌ PUT /users/me — no token → 401**

---

### 9.2 Playwright UI Tests

**TC-PROF-UI-001 ✅ Own profile page loads with correct username and stats**
```
Steps:
  1. Login as alice
  2. Navigate to /profile/alice

Expected:
  - alice or Alice Wonderland visible
  - Follower/following/post count stats visible
  - Edit Profile button visible
```

**TC-PROF-UI-002 ✅ Other user's profile shows Follow/Unfollow button, not Edit Profile**
```
Steps:
  1. Navigate to /profile/carol

Expected:
  - Follow or Unfollow button visible
  - No Edit Profile button
```

**TC-PROF-UI-003 ✅ User can update their bio**
```
Steps:
  1. Navigate to own profile
  2. Click Edit Profile
  3. Update bio with "E2E bio update <ts>"
  4. Save

Expected:
  - New bio visible on profile
```

**TC-PROF-UI-004 ✅ User can update their display name**
```
Steps:
  1. Edit Profile
  2. Change displayName field

Expected:
  - New name visible on profile
```

**TC-PROF-UI-005 ✅ Edit profile form can be cancelled without saving**
```
Steps:
  1. Open Edit Profile
  2. Make a change
  3. Click Cancel

Expected:
  - Original data still shown
  - Modal closed
```

**TC-PROF-UI-006 ❌ Bio over 200 characters shows validation error**
```
Steps:
  1. Open Edit Profile
  2. Fill bio with 201 characters
  3. Save

Expected:
  - Error or char-limit warning visible
  - Data not saved
```

**TC-PROF-UI-007 ❌ Navigating to non-existent profile shows 404 / redirects**
```
Steps:
  1. Navigate to /profile/nobody_xyz_99999

Expected:
  - "Not found" text OR redirect to "/"
```

**TC-PROF-UI-008 ✅ Clicking username in feed navigates to their profile**
```
Steps:
  1. On feed, click author link of any post

Expected:
  - URL matches /profile/<username>
```

---

## 10. Search & Discovery

### 10.1 API Tests

**TC-SRCH-API-001 ✅ GET /users/search?q=bob — returns matching users**
```
Request:
  GET /api/v1/users/search?q=bob
  Authorization: Bearer <alice-token>

Expected:
  Status:  200
  Body:    array (or paginated) containing user with username "bob"
  Each result has: id, username, displayName
```

**TC-SRCH-API-002 ✅ GET /users/search — partial match (ali → alice)**
```
Request:
  GET /api/v1/users/search?q=ali

Expected:
  Response includes alice
```

**TC-SRCH-API-003 ✅ GET /users/search — case-insensitive match**
```
Request: q=BOB → should still return bob
```

**TC-SRCH-API-004 ✅ GET /search/posts?q=<keyword> — returns matching posts**
```
Request:
  GET /api/v1/search/posts?q=standing+desk

Expected:
  Status:  200
  Results contain posts with "standing desk" in content
```

**TC-SRCH-API-005 ✅ GET /hashtag/{tag}/posts — returns posts with that hashtag**
```
Request:
  GET /api/v1/hashtag/intro/posts
  (alice's seed post uses #intro)

Expected:
  Status:  200
  At least one post with #intro in content
```

**TC-SRCH-API-006 ❌ GET /users/search — no token → 401**

**TC-SRCH-API-007 ✅ GET /users/search — query with no matches returns empty array**
```
Request:
  q=zzz_no_such_user_xyz

Expected:
  Status:  200
  Body:    [] or { content: [] }
```

**TC-SRCH-API-008 ✅ GET /users/search — mention autocomplete (size=6)**
```
Request:
  GET /api/v1/users/search?q=al&page=0&size=6

Expected:
  Status:  200
  Response length ≤ 6
  Results include alice
```

---

### 10.2 Playwright UI Tests

**TC-SRCH-UI-001 ✅ Searching by username on Users tab returns matching results**
```
Steps:
  1. Login as alice
  2. Navigate to /search
  3. Switch to Users tab
  4. Type "bob"

Expected:
  - At least one result containing "bob" appears
```

**TC-SRCH-UI-002 ✅ Partial username search returns results**
```
Steps:
  1. Type "ali" on Users tab

Expected:
  - Results include alice
```

**TC-SRCH-UI-003 ✅ Searching posts by keyword returns results**
```
Steps:
  1. Switch to Posts tab
  2. Type "standing desk" (exists in bob's seed post)

Expected:
  - At least one post result visible
```

**TC-SRCH-UI-004 ✅ Hashtag search returns matching posts**
```
Steps:
  1. Switch to Hashtags tab
  2. Type "intro"

Expected:
  - Results visible
```

**TC-SRCH-UI-005 ✅ Search result link navigates to user profile**
```
Steps:
  1. Search users "bob"
  2. Click first result link

Expected:
  - URL matches /profile/bob
```

**TC-SRCH-UI-006 ❌ Search with no matches shows empty state**
```
Steps:
  1. Type "zzz_no_such_user_xyz"

Expected:
  - "No results" or empty state indicator visible
```

**TC-SRCH-UI-007 ❌ Search page without auth redirects to /login**
```
Steps:
  1. Clear localStorage
  2. Navigate to /search

Expected:
  - Redirected to /login
```

**TC-SRCH-UI-008 ✅ Search is accessible from sidebar navigation**
```
Steps:
  1. From feed, click Search nav link

Expected:
  - URL becomes /search
```

---

## 11. Notifications

### 11.1 API Tests

**TC-NOTIF-API-001 ✅ GET /notifications — returns list of notifications**
```
Request:
  GET /api/v1/notifications?page=0&size=20
  Authorization: Bearer <bob-token>
  (bob has seed notifications from alice's activity)

Expected:
  Status:  200
  Body:    { content: [ { id, type, message, isRead, createdAt }, ... ], ... }
```

**TC-NOTIF-API-002 ✅ GET /notifications/unread-count — returns numeric count**
```
Request:
  GET /api/v1/notifications/unread-count

Expected:
  Status:  200
  Body:    { count: N }  or  { unreadCount: N }  (N ≥ 0)
```

**TC-NOTIF-API-003 ✅ Like on another user's post creates LIKE notification for the post author**
```
Steps:
  1. Alice creates post
  2. GET /notifications/unread-count as alice → N
  3. Carol likes alice's post via POST /posts/<id>/like
  4. GET /notifications/unread-count as alice → N+1
  5. GET /notifications as alice → first item type = "LIKE" or "like"
```

**TC-NOTIF-API-004 ✅ Following a user creates FOLLOW notification for the followee**
```
Steps:
  1. GET /notifications/unread-count as dave → N
  2. Eve follows dave
  3. GET /notifications/unread-count as dave → N+1
```

**TC-NOTIF-API-005 ✅ PATCH /notifications/read-all — marks all as read**
```
Steps:
  1. Ensure bob has unread notifications
  2. PATCH /notifications/read-all
  3. GET /notifications/unread-count

Expected:
  count = 0
```

**TC-NOTIF-API-006 ✅ PUT /notifications/{id}/read — marks single notification as read**
```
Steps:
  1. GET /notifications → note first notification id
  2. PUT /notifications/<id>/read

Expected:
  Status:  200
  Subsequent GET /notifications → that notification's isRead = true
```

**TC-NOTIF-API-007 ❌ GET /notifications — no token → 401**

**TC-NOTIF-API-008 ✅ No self-notification when user likes their own post**
```
Steps:
  1. Alice creates post
  2. GET /notifications/unread-count as alice → N
  3. Alice likes her own post
  4. GET /notifications/unread-count as alice → still N (unchanged)
```

**TC-NOTIF-API-009 ✅ Comment on a post creates COMMENT notification for post author**
```
Steps:
  1. Alice creates post, unread count = N
  2. Bob comments on alice's post
  3. Alice's unread count = N+1
```

---

### 11.2 Playwright UI Tests

**TC-NOTIF-UI-001 ✅ Notifications page loads with notification items**
```
Steps:
  1. Login as bob (has seed notifications)
  2. Navigate to /notifications

Expected:
  - At least one notification item visible
```

**TC-NOTIF-UI-002 ✅ Mark all as read clears unread indicators**
```
Steps:
  1. If unread items exist, click "Mark all as read"

Expected:
  - Unread badge/indicators disappear
```

**TC-NOTIF-UI-003 ✅ Mark all read button is visible on notifications page**
```
Expected:
  - Button with text "Mark all" or "Mark All" visible
```

**TC-NOTIF-UI-004 ✅ Notifications page is accessible from sidebar nav**
```
Steps:
  1. Click Notifications link in sidebar

Expected:
  - URL = /notifications
```

**TC-NOTIF-UI-005 ❌ Notifications page without auth redirects to /login**
```
Steps:
  1. Clear localStorage, navigate to /notifications

Expected:
  - Redirected to /login
```

---

## 12. Direct Messaging

### 12.1 API Tests

**TC-MSG-API-001 ✅ POST /messages — send a message to another user**
```
Request:
  POST /api/v1/messages
  Authorization: Bearer <alice-token>
  { recipientId: <bob-id>, content: "Hello Bob!" }

Expected:
  Status:  200 or 201
  Body:    { id, conversationId, senderId, content: "Hello Bob!",
             isRead: false, createdAt: <iso> }
```

**TC-MSG-API-002 ✅ POST /messages — sending again to same user reuses existing conversation**
```
Steps:
  1. POST /messages to bob → conversationId = C1
  2. POST /messages to bob again → conversationId = C1 (same conversation)
```

**TC-MSG-API-003 ✅ GET /messages/conversations — returns conversations list**
```
Request:
  GET /api/v1/messages/conversations
  Authorization: Bearer <alice-token>

Expected:
  Status:  200
  Body:    array of conversations, each with:
           { id, otherUser: { username }, lastMessage: { content, isRead }, updatedAt }
```

**TC-MSG-API-004 ✅ GET /messages/conversations/{id}/messages — returns message history**
```
Request:
  GET /api/v1/messages/conversations/<conversation-id>/messages?page=0&size=40

Expected:
  Status:  200
  Body:    { content: [ { id, senderId, content, isRead, createdAt } ], ... }
  Messages include the one from TC-MSG-API-001
```

**TC-MSG-API-005 ✅ PUT /messages/conversations/{id}/read — marks conversation as read**
```
Steps:
  1. Alice sends bob a message (bob has unread)
  2. Bob calls PUT /conversations/<id>/read

Expected:
  Status:  200
  Subsequent GET messages → all messages.isRead = true
```

**TC-MSG-API-006 ✅ Sent message appears in both users' conversation lists**
```
Steps:
  1. Alice sends message to bob
  2. GET /messages/conversations as alice → includes conversation with bob
  3. GET /messages/conversations as bob → includes conversation with alice
```

**TC-MSG-API-007 ❌ POST /messages — no token → 401**

**TC-MSG-API-008 ❌ POST /messages — message to self → 400 or 403**
```
Request:
  { recipientId: <alice-id>, content: "Self message" }
  (alice sending to herself)

Expected:
  Status:  400 or 403
```

**TC-MSG-API-009 ❌ POST /messages — empty content → 400**
```
Request:
  { recipientId: <bob-id>, content: "" }

Expected:
  Status:  400 Bad Request
```

**TC-MSG-API-010 ❌ POST /messages — recipient does not exist → 404**
```
Request:
  { recipientId: 99999999, content: "Hello" }

Expected:
  Status:  404 Not Found
```

**TC-MSG-API-011 ❌ GET /messages/conversations/{id}/messages — conversation belonging to another user → 403**
```
Steps:
  1. Alice and bob have conversation id C1
  2. Carol calls GET /messages/conversations/C1/messages

Expected:
  Status:  403 Forbidden
```

---

### 12.2 Playwright UI Tests

**TC-MSG-UI-001 ✅ Messages page is accessible from sidebar**
```
Steps:
  1. Login as alice
  2. Click Messages / DM link in sidebar

Expected:
  - URL matches /messages or /conversations
```

**TC-MSG-UI-002 ✅ Can start a new conversation and send a message**
```
Steps:
  1. Navigate to messages
  2. Click "New Message" or compose button
  3. Search for "bob"
  4. Select bob
  5. Type "Hello Bob from E2E <ts>"
  6. Send

Expected:
  - Message appears in conversation view
  - Conversation with bob visible in list
```

**TC-MSG-UI-003 ✅ Sent message appears in conversation thread**
```
Expected:
  - Message text visible in chat view
  - Alice's name/avatar associated with message
```

**TC-MSG-UI-004 ✅ Unread conversation shows unread indicator**
```
Steps:
  1. Bob sends message to alice (via API)
  2. Login as alice, navigate to messages

Expected:
  - Unread badge or dot on conversation with bob
```

**TC-MSG-UI-005 ✅ Opening conversation marks it as read**
```
Steps:
  1. Bob sends unread message
  2. Alice opens the conversation

Expected:
  - Unread indicator disappears after opening
```

---

## 13. Media Upload

### 13.1 API Tests — Valid Files

**TC-MEDIA-API-001 ✅ POST /media/upload — PNG file returns 200 with URL**
```
Request:
  POST /api/v1/media/upload
  Authorization: Bearer <alice-token>
  Multipart: file (image/png, minimal 1×1 PNG buffer)

Expected:
  Status:  200
  Body:    contains one of: { url }, { fileUrl }, or { mediaUrl }
```

**TC-MEDIA-API-002 ✅ POST /media/upload — JPEG file returns 200**
```
Multipart: file (image/jpeg)

Expected:  Status 200
```

**TC-MEDIA-API-003 ✅ POST /media/upload — GIF file returns 200**
```
Multipart: file (image/gif)

Expected:  Status 200
```

**TC-MEDIA-API-004 ✅ Uploaded file is accessible at the returned URL**
```
Steps:
  1. Upload PNG → note returned URL
  2. GET <url> (expand relative to base if needed)

Expected:
  Status:  200
  Response Content-Type contains "image"
```

**TC-MEDIA-API-005 ✅ Two uploads by same user return different URLs**
```
Steps:
  1. Upload file A → url1
  2. Upload file B → url2

Expected:
  url1 ≠ url2
```

**TC-MEDIA-API-006 ✅ Upload response contains at least one of: url, fileUrl, mediaUrl, filename**

---

### 13.2 API Tests — Invalid Files / Requests

**TC-MEDIA-API-010 ❌ POST /media/upload — no token → 401**

**TC-MEDIA-API-011 ❌ POST /media/upload — PDF file → 400 / 415**
```
Multipart: file (application/pdf)

Expected:  Status 400 or 415 (Unsupported Media Type)
```

**TC-MEDIA-API-012 ❌ POST /media/upload — plain text file → 400 / 415**
```
Multipart: file (text/plain)

Expected:  Status 400 or 415
```

**TC-MEDIA-API-013 ❌ POST /media/upload — empty multipart (no file) → 400**
```
Multipart: {}

Expected:  Status 400 or 415 or 500
```

**TC-MEDIA-API-014 ❌ GET /media/files/<non-existent> → 404**
```
Request:
  GET /api/v1/media/files/does_not_exist_xyz_12345.jpg

Expected:  Status 404
```

**TC-MEDIA-API-015 ❌ Path traversal attempt in media URL → 400 or 404**
```
Request:
  GET /api/v1/media/files/..%2F..%2Fetc%2Fpasswd

Expected:  Status 400 or 404 — must NOT return 200 with file content
```

**TC-MEDIA-API-016 ❌ Spoofed MIME: PDF bytes declared as image/png**
```
Multipart: file (name: evil.png, mimeType: image/png, content: PDF bytes)

Expected:
  Status:  200 (if backend trusts MIME) or 400 (if backend validates magic bytes)
  Must NOT serve the file as an executable regardless of outcome
```

---

### 13.3 Playwright UI Tests

**TC-MEDIA-UI-001 ✅ Post created with imageUrl renders image on feed**
```
Steps:
  1. Create post via API with imageUrl pointing to a stable external image
  2. Navigate to feed

Expected:
  - img tag with that URL visible in feed
```

**TC-MEDIA-UI-002 ✅ Image visible on post detail page**
```
Steps:
  1. Create post with imageUrl
  2. Navigate to /posts/<id>

Expected:
  - img element visible on detail page
```

---

## 14. Mentions Autocomplete

### 14.1 API Tests

**TC-MENTION-API-001 ✅ GET /users/search?q=al&size=6 — returns ≤ 6 users for autocomplete**
```
Request:
  GET /api/v1/users/search?q=al&page=0&size=6
  Authorization: Bearer <alice-token>

Expected:
  Status:  200
  Response length ≤ 6
  Results include alice
```

**TC-MENTION-API-002 ✅ GET /users/search?q=<1-char> — returns results**
```
Request:
  GET /api/v1/users/search?q=a&size=6

Expected:
  Status:  200
  Some results returned
```

**TC-MENTION-API-003 ✅ GET /users/search?q=<exact-username> — returns exact match**
```
Request:
  GET /api/v1/users/search?q=bob&size=6

Expected:
  Results include user with username "bob"
```

---

### 14.2 Playwright UI Tests

**TC-MENTION-UI-001 ✅ Typing @al in post composer opens mention dropdown**
```
Steps:
  1. Login, go to "/"
  2. Click on post composer textarea
  3. Type "@al"

Expected:
  - Mention dropdown appears with user results
  - Results include alice
```

**TC-MENTION-UI-002 ✅ Clicking a mention suggestion inserts it into the text**
```
Steps:
  1. Type "@al" in composer
  2. Click "alice" in dropdown

Expected:
  - "@alice " inserted at cursor position
  - Dropdown closes
  - Composer still focused
```

**TC-MENTION-UI-003 ✅ Keyboard navigation works in mention dropdown**
```
Steps:
  1. Type "@b" → dropdown appears
  2. Press ArrowDown to move to next item
  3. Press Enter to select

Expected:
  - Selected username inserted into composer
```

**TC-MENTION-UI-004 ✅ Escape key closes mention dropdown without inserting**
```
Steps:
  1. Type "@al" → dropdown opens
  2. Press Escape

Expected:
  - Dropdown closes
  - Text remains "@al" (not replaced)
```

**TC-MENTION-UI-005 ✅ Tab key selects current dropdown item**
```
Steps:
  1. Type "@ali"
  2. Press Tab

Expected:
  - First/highlighted suggestion inserted
```

**TC-MENTION-UI-006 ❌ Typing @ with no following text shows no dropdown**
```
Steps:
  1. Type a single "@" with no characters after

Expected:
  - No dropdown visible (query too short)
```

**TC-MENTION-UI-007 ❌ Typing @<non-matching> shows no results in dropdown**
```
Steps:
  1. Type "@zzznouser"

Expected:
  - Dropdown shows "No users found" or closes
```

---

## 15. Admin Panel

### 15.1 API Tests

**TC-ADMIN-API-001 ✅ GET /admin/stats — admin user gets platform statistics**
```
Request:
  GET /api/v1/admin/stats
  Authorization: Bearer <admin-token>
  (Seed an ADMIN role user or promote alice via DB)

Expected:
  Status:  200
  Body:    { totalUsers: N, adminUsers: M, regularUsers: L, totalPosts: P }
  All values are non-negative integers
```

**TC-ADMIN-API-002 ✅ GET /admin/users — returns paginated user list**
```
Request:
  GET /api/v1/admin/users?page=0&size=15

Expected:
  Status:  200
  Body:    paginated response with user objects containing id, username, email, role, stats
```

**TC-ADMIN-API-003 ✅ GET /admin/users?q=alice — returns matching users**
```
Request:
  GET /api/v1/admin/users?q=alice

Expected:
  Status:  200
  Results include alice
```

**TC-ADMIN-API-004 ✅ PUT /admin/users/{id}/role — change user role to ADMIN**
```
Request:
  PUT /api/v1/admin/users/<user-id>/role
  Authorization: Bearer <admin-token>
  { role: "ADMIN" }

Expected:
  Status:  200
  GET /admin/users → user's role = "ADMIN"
```

**TC-ADMIN-API-005 ✅ PUT /admin/users/{id}/role — demote ADMIN back to USER**
```
Request:
  { role: "USER" }

Expected:
  Status:  200
  User role updated to USER
```

**TC-ADMIN-API-006 ✅ DELETE /admin/users/{id} — admin can delete a user account**
```
Request:
  DELETE /api/v1/admin/users/<target-user-id>
  Authorization: Bearer <admin-token>

Expected:
  Status:  200 or 204
  GET /admin/users → deleted user no longer in list
```

**TC-ADMIN-API-007 ❌ GET /admin/stats — non-admin user gets 403**
```
Request:
  GET /api/v1/admin/stats
  Authorization: Bearer <alice-token>  (alice has role USER)

Expected:
  Status:  403 Forbidden
```

**TC-ADMIN-API-008 ❌ GET /admin/users — non-admin user gets 403**
```
Expected:  Status 403
```

**TC-ADMIN-API-009 ❌ PUT /admin/users/{id}/role — non-admin gets 403**
```
Expected:  Status 403
```

**TC-ADMIN-API-010 ❌ DELETE /admin/users/{id} — non-admin gets 403**
```
Expected:  Status 403
```

**TC-ADMIN-API-011 ❌ GET /admin/stats — no token → 401**

**TC-ADMIN-API-012 ❌ PUT /admin/users/{id}/role — invalid role value → 400**
```
Request:
  { role: "SUPERUSER" }   (not a valid enum value)

Expected:
  Status:  400 Bad Request
```

**TC-ADMIN-API-013 ❌ DELETE /admin/users/{id} — non-existent user → 404**
```
Expected:  Status 404
```

---

### 15.2 Playwright UI Tests

**TC-ADMIN-UI-001 ✅ Admin panel is accessible at /admin for admin users**
```
Prerequisites: User with ADMIN role exists and token available

Steps:
  1. Login as admin user
  2. Navigate to /admin

Expected:
  - Page loads with admin dashboard visible
  - Stats cards visible (Total Users, Admins, Regular, Posts)
```

**TC-ADMIN-UI-002 ✅ Admin panel shows user management table**
```
Expected:
  - Table or list of users visible
  - Columns include username, email, role badge
```

**TC-ADMIN-UI-003 ✅ Admin can search users by username**
```
Steps:
  1. Type "alice" in admin search input

Expected:
  - Results filtered to show alice
```

**TC-ADMIN-UI-004 ✅ Admin can toggle user role**
```
Steps:
  1. Find a regular user in admin panel
  2. Click Crown/Role toggle button

Expected:
  - Role badge changes between USER and ADMIN
  - Success toast visible
```

**TC-ADMIN-UI-005 ✅ Admin can delete a user with confirmation**
```
Steps:
  1. Click Delete button on a user
  2. Confirm deletion in dialog

Expected:
  - User removed from the table
  - Success toast visible
```

**TC-ADMIN-UI-006 ✅ Admin Shield icon visible in sidebar only for admin users**
```
Steps:
  1. Login as admin user

Expected:
  - Purple Shield "Admin" link visible in sidebar

Steps (as regular user):
  - Shield/Admin link NOT visible in sidebar
```

**TC-ADMIN-UI-007 ❌ Non-admin user visiting /admin is redirected**
```
Steps:
  1. Login as alice (role USER)
  2. Navigate to /admin

Expected:
  - Redirected to "/" or shows access denied
```

**TC-ADMIN-UI-008 ❌ Admin delete button is disabled for own account (cannot self-delete)**
```
Steps:
  1. Login as admin
  2. Find own account row in admin panel

Expected:
  - Delete button disabled or absent for own row
```

**TC-ADMIN-UI-009 ❌ Admin role toggle is disabled for own account (cannot self-demote)**
```
Expected:
  - Role toggle disabled on admin's own row
```

---

## 16. Settings Page

### 16.1 API Tests — Password Change

**TC-SETTINGS-API-001 ✅ PUT /users/me/password — valid current + new password**
```
Request:
  PUT /api/v1/users/me/password
  Authorization: Bearer <alice-token>
  { currentPassword: "Password1!", newPassword: "NewPassword1!" }

Expected:
  Status:  200
  POST /auth/login with newPassword: "NewPassword1!" → succeeds
  POST /auth/login with old password: "Password1!" → 401
```

**TC-SETTINGS-API-002 ❌ PUT /users/me/password — wrong current password → 403**
```
Request:
  { currentPassword: "WrongOldPassword!", newPassword: "NewPassword1!" }

Expected:
  Status:  403 Forbidden
  Password NOT changed (old password still works)
```

**TC-SETTINGS-API-003 ❌ PUT /users/me/password — new password too short → 400**
```
Request:
  { currentPassword: "Password1!", newPassword: "short" }

Expected:
  Status:  400 Bad Request
```

**TC-SETTINGS-API-004 ❌ PUT /users/me/password — missing newPassword field → 400**
```
Request:
  { currentPassword: "Password1!" }  (no newPassword)

Expected:
  Status:  400 Bad Request
```

**TC-SETTINGS-API-005 ❌ PUT /users/me/password — no token → 401**

---

### 16.2 Playwright UI Tests — Profile Tab

**TC-SETTINGS-UI-001 ✅ Settings page is accessible at /settings**
```
Steps:
  1. Login as alice
  2. Navigate to /settings (or click Settings in sidebar)

Expected:
  - Settings page loads with tab interface
  - Profile, Password, and Account tabs visible
```

**TC-SETTINGS-UI-002 ✅ Profile tab is the default active tab**
```
Expected:
  - Profile tab content visible (avatar URL, display name, bio inputs)
```

**TC-SETTINGS-UI-003 ✅ Profile tab lets user update display name**
```
Steps:
  1. Go to /settings (Profile tab)
  2. Change display name input to "Alice New Name <ts>"
  3. Click Save

Expected:
  - "Saved!" feedback shown
  - No error message
```

**TC-SETTINGS-UI-004 ✅ Bio field shows character counter (max 200)**
```
Steps:
  1. Focus bio textarea
  2. Type some text

Expected:
  - Character counter visible (e.g. "50/200")
```

**TC-SETTINGS-UI-005 ✅ Avatar URL preview updates live as user types**
```
Steps:
  1. Clear avatar URL input
  2. Paste a valid image URL

Expected:
  - img preview updates to show new avatar
```

---

### 16.3 Playwright UI Tests — Password Tab

**TC-SETTINGS-UI-010 ✅ Password tab is accessible**
```
Steps:
  1. Click Password tab on /settings

Expected:
  - Three password inputs visible (current, new, confirm)
```

**TC-SETTINGS-UI-011 ✅ Password visibility toggle shows/hides password text**
```
Steps:
  1. Fill current password field
  2. Click eye icon toggle

Expected:
  - Input type changes from "password" to "text" (text visible)
  - Click again → type reverts to "password"
```

**TC-SETTINGS-UI-012 ✅ Valid password change shows success feedback**
```
Steps:
  1. Fill: current = "Password1!", new = "NewPass1!", confirm = "NewPass1!"
  2. Click Save

Expected:
  - "Password updated!" or similar success message visible
  - No error message
```

**TC-SETTINGS-UI-013 ❌ Password change with wrong current password shows error**
```
Steps:
  1. Fill: current = "WrongPassword!", new = "NewPass1!", confirm = "NewPass1!"
  2. Click Save

Expected:
  - Error message visible (references incorrect / current password)
```

**TC-SETTINGS-UI-014 ❌ Mismatched new and confirm passwords shows client-side error**
```
Steps:
  1. Fill: new = "NewPass1!", confirm = "DifferentPass1!"
  2. Click Save (or blur confirm field)

Expected:
  - Error: "Passwords do not match" (client-side, before API call)
```

**TC-SETTINGS-UI-015 ❌ New password shorter than 8 characters shows error**
```
Steps:
  1. Fill: new = "abc", confirm = "abc"
  2. Click Save

Expected:
  - Error about minimum password length
```

---

### 16.4 Playwright UI Tests — Account Tab

**TC-SETTINGS-UI-020 ✅ Account tab shows user information**
```
Steps:
  1. Click Account tab

Expected:
  - Username, email, role, and join date visible in info table
```

**TC-SETTINGS-UI-021 ✅ Danger zone section is visible**
```
Expected:
  - "Danger" or "Delete account" section visible with warning text
```

**TC-SETTINGS-UI-022 ❌ Delete account requires username confirmation**
```
Steps:
  1. Click Delete Account button
  2. Enter wrong username in confirmation input
  3. Confirm

Expected:
  - Delete is prevented
  - Error: username must match exactly
```

**TC-SETTINGS-UI-023 ❌ Settings page without auth redirects to /login**
```
Steps:
  1. Clear localStorage
  2. Navigate to /settings

Expected:
  - Redirected to /login
```

---

## 17. Cursor / Keyset Pagination

### 17.1 API Tests

**TC-CURSOR-API-001 ✅ First page has no before param and returns up to size posts**
```
Request:
  GET /api/v1/posts/feed/cursor?size=5
  Authorization: Bearer <alice-token>

Expected:
  Status:  200
  posts array length ≤ 5
  nextCursor: non-empty ISO string (if more posts exist)
  hasMore: true
```

**TC-CURSOR-API-002 ✅ Second page using cursor returns posts older than cursor**
```
Steps:
  1. GET /posts/feed/cursor?size=3 → posts[0..2], cursor=T1
  2. GET /posts/feed/cursor?size=3&before=T1 → posts[3..5]

Expected:
  - All posts in step 2 have createdAt < T1
  - No ID overlap between step 1 and step 2
```

**TC-CURSOR-API-003 ✅ When fewer posts than size remain, hasMore=false**
```
Request:
  GET /posts/feed/cursor?size=1000

Expected:
  hasMore = false
  nextCursor = "" or not present
```

**TC-CURSOR-API-004 ✅ size param is capped at 50**
```
Request:
  GET /posts/feed/cursor?size=200

Expected:
  posts array length ≤ 50
```

**TC-CURSOR-API-005 ❌ Invalid before datetime → 400 or graceful fallback**
```
Request:
  GET /posts/feed/cursor?before=not-a-date

Expected:
  Status:  400  OR  returns first page (treats as missing param)
  Must NOT return 500
```

**TC-CURSOR-API-006 ❌ No token → 401**

---

## 18. AI Assistant (Spark)

### 18.1 API Tests

**TC-AI-API-001 ✅ GET /ai/health — returns health object when Ollama is up**
```
Request:
  GET /api/v1/ai/health
  Authorization: Bearer <alice-token>

Expected:
  Status:  200
  Body:    { status: "ok", ollamaReachable: true, model: "llama3.2:3b", ollamaUrl: <string> }
```

**TC-AI-API-002 ✅ GET /ai/health — returns degraded when Ollama is down**
```
(Mock Ollama being unavailable)

Expected:
  Status:  503
  Body:    { status: "degraded", ollamaReachable: false, message: <string mentioning ollama> }
```

**TC-AI-API-003 ✅ POST /ai/chat — valid message returns NDJSON stream**
```
Request:
  POST /api/v1/ai/chat
  Authorization: Bearer <alice-token>
  { message: "Hello", conversationHistory: [], context: "general" }

Expected:
  Status:  200
  Content-Type:  application/x-ndjson  (or text/event-stream)
  Body lines: JSON objects with "delta" key and a final { "done": true } line
```

**TC-AI-API-004 ❌ POST /ai/chat — no token → 401**

**TC-AI-API-005 ❌ POST /ai/chat — message over 1000 chars → 400**
```
Request:
  { message: "a".repeat(1001) }

Expected:
  Status:  400 Bad Request
  Error message references character limit
```

**TC-AI-API-006 ❌ POST /ai/chat — empty message → 400**
```
Request:
  { message: "" }

Expected:
  Status:  400
```

**TC-AI-API-007 ❌ POST /ai/chat — rate limit exceeded → 429 (or error in stream)**
```
Send 61 requests in rapid succession (limit = 60/hour)

Expected on 61st:
  Status:  429  OR  Status 200 with NDJSON error line:
  { error: "rate_limit", message: <string>, resetAt: <iso> }
```

---

### 18.2 Playwright UI Tests — Panel Visibility

**TC-AI-UI-001 ✅ Floating Ask Spark button is visible on the feed page**
```
Steps:
  1. Login, go to "/"
  (Mock health endpoint to return ok)

Expected:
  - data-testid="ai-chat-button" or ⚡ Ask Spark button visible
```

**TC-AI-UI-002 ✅ Clicking the button opens the chat panel**
```
Expected:
  - Chat panel dialog/overlay becomes visible
  - Panel contains "Spark" branding text
```

**TC-AI-UI-003 ✅ Clicking close button hides the panel**
```
Expected:
  - Panel no longer visible
```

**TC-AI-UI-004 ✅ Pressing Escape closes the panel**
```
Steps:
  1. Open panel
  2. Press Escape

Expected:
  - Panel hidden
```

**TC-AI-UI-005 ✅ Ctrl+K opens the panel (keyboard shortcut)**
```
Steps:
  1. Ensure panel is closed
  2. Press Ctrl+K

Expected:
  - Panel becomes visible
```

**TC-AI-UI-006 ✅ Ctrl+K again closes the panel (toggle)**

**TC-AI-UI-007 ✅ Panel is accessible via aria-label**
```
Expected:
  - getByRole('dialog', { name: /spark/i }) is visible
```

---

### 18.3 Playwright UI Tests — Sending Messages

**TC-AI-UI-010 ✅ Typing a message enables the send button**
```
Steps:
  1. Open panel
  2. Type "Hello Spark!"

Expected:
  - Send button becomes enabled
```

**TC-AI-UI-011 ✅ Sending a message shows it in the conversation**
```
Steps:
  1. Mock chat endpoint with canned response
  2. Type and send "What can you do?"

Expected:
  - "What can you do?" visible in message list
  - User message on right side
```

**TC-AI-UI-012 ✅ Assistant reply appears after sending**
```
Expected:
  - At least one assistant message visible after send
```

**TC-AI-UI-013 ✅ Pressing Enter sends the message**
```
Steps:
  1. Type message
  2. Press Enter (not Shift+Enter)

Expected:
  - Message sent, user message count = 1
```

**TC-AI-UI-014 ✅ Shift+Enter inserts newline, does not send**
```
Steps:
  1. Type "Line one"
  2. Press Shift+Enter
  3. Type "Line two"

Expected:
  - No user message in list yet
  - Input contains both lines
```

**TC-AI-UI-015 ✅ Clear conversation removes all messages**
```
Steps:
  1. Send a message, receive reply
  2. Click clear button

Expected:
  - User and assistant messages both = 0
```

**TC-AI-UI-016 ✅ Send button re-enables after streaming completes**

---

### 18.4 Playwright UI Tests — Degraded State

**TC-AI-UI-020 ✅ No health banner when Ollama reachable**
**TC-AI-UI-021 ✅ Degraded banner shown when Ollama unreachable**
**TC-AI-UI-022 ✅ Degraded banner has Retry button**
**TC-AI-UI-023 ✅ Retry clears banner when Ollama recovers**

---

### 18.5 Playwright UI Tests — Post Composer Integration

**TC-AI-UI-030 ✅ "Improve with AI" button hidden when composer is empty**
**TC-AI-UI-031 ✅ "Improve with AI" button appears when user types in composer**
**TC-AI-UI-032 ✅ Clicking "Improve with AI" opens AI panel**
**TC-AI-UI-033 ✅ Draft text is pre-filled in AI panel and sent automatically**

---

### 18.6 Playwright UI Tests — Input Validation (Negative)

**TC-AI-UI-040 ❌ Send button disabled on empty input**
**TC-AI-UI-041 ❌ Send button disabled on whitespace-only input**
```
Steps:
  1. Type "     " (spaces only)

Expected:
  - Send still disabled
```

**TC-AI-UI-042 ❌ Input respects 1000 character limit**
```
Steps:
  1. Fill input with 1100 characters

Expected:
  - input.value.length ≤ 1000
```

**TC-AI-UI-043 ❌ Error banner shown when Ollama returns ai_unavailable mid-stream**
```
Steps:
  1. Mock chat to return { error: "ai_unavailable", ... }
  2. Send any message

Expected:
  - Error banner visible with text matching /unavailable|try again/i
```

**TC-AI-UI-044 ❌ Error banner shown when rate limit exceeded**
```
Steps:
  1. Mock chat to return rate_limit error
  2. Send any message

Expected:
  - Error banner mentioning rate limit
```

**TC-AI-UI-045 ❌ Error banner can be dismissed**
```
Expected:
  - Clicking dismiss removes the error banner
```

**TC-AI-UI-046 ❌ Unauthenticated user sees login page, not AI panel**
```
Steps:
  1. Clear localStorage
  2. Navigate to /

Expected:
  - Redirected to /login
  - ai-chat-button not visible
```

---

## 19. Security

### 19.1 JWT Boundary Tests

**TC-SEC-API-001 ❌ All protected endpoints return 401 without token**

Endpoints to test (expected status 401 for all):
```
GET    /users/me
GET    /posts/feed
GET    /notifications
GET    /notifications/unread-count
POST   /posts
PUT    /users/me
POST   /users/alice/follow
POST   /media/upload
GET    /messages/conversations
POST   /messages
GET    /admin/stats
```

**TC-SEC-API-010 ❌ Invalid token formats all return 401**

Tokens to test:
```
"not.a.jwt"
"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGljZSJ9.invalidsignature"
"eyJ...<expired-looking token>"
""  (empty)
"Bearer"  (keyword only)
```

All requests to `GET /users/me` with these tokens must return 401.

---

### 19.2 Authorization / Ownership

**TC-SEC-API-020 ❌ User cannot delete another user's post → 403**
```
Alice creates post. Bob sends DELETE → 403. Post still exists.
```

**TC-SEC-API-021 ❌ User cannot edit another user's post → 403**
```
Alice creates post. Bob sends PUT → 403. Content unchanged.
```

**TC-SEC-API-022 ❌ User cannot delete another user's comment → 403**
```
Alice comments. Bob sends DELETE on alice's comment → 403.
```

**TC-SEC-API-023 ❌ User cannot follow themselves → 403**
```
Alice sends POST /users/alice/follow → 403.
```

**TC-SEC-API-024 ✅ GET /users/me returns caller's own identity**
```
Bob's token → /users/me returns { username: "bob" }, NOT alice.
```

**TC-SEC-API-025 ❌ Non-admin cannot access /admin/* endpoints → 403**
```
Regular user token → GET /admin/stats → 403.
Regular user token → GET /admin/users → 403.
Regular user token → PUT /admin/users/<id>/role → 403.
Regular user token → DELETE /admin/users/<id> → 403.
```

---

### 19.3 Input Injection

**TC-SEC-API-030 ✅ XSS payload in post content stored and returned raw (no server error)**
```
Request:
  POST /posts { content: '<script>alert("xss")</script>', privacy: "PRIVATE" }

Expected:
  Status:  200 or 201
  body.content === '<script>alert("xss")</script>'  (stored verbatim)
  No 500 error
  (Escaping is the frontend's responsibility)
```

**TC-SEC-API-031 ✅ SQL injection in search query returns 200 (not 500)**
```
Request:
  GET /users/search?q=' OR '1'='1

Expected:
  Status:  200 (empty results or valid results — parameterized queries used)
  Must NOT return 500 or expose stack trace
```

**TC-SEC-API-032 ✅ SQL injection in post search returns 200**
```
Request:
  GET /search/posts?q='; DROP TABLE posts; --

Expected:
  Status:  200  AND  posts table still intact
```

**TC-SEC-API-033 ✅ XSS in bio field stored without server error**
```
Request:
  PUT /users/me { bio: '<img src=x onerror=alert(1)>' }

Expected:
  Status:  200 or 400 (validation reject)
  Must NOT be 500
```

**TC-SEC-UI-001 ❌ XSS payload in post content does NOT execute in browser (SPA escaping)**
```
Steps:
  1. Create post via API with content: '<script>window.__XSS__ = true</script>'
  2. Navigate to /posts/<id>
  3. page.evaluate(() => window.__XSS__)

Expected:
  window.__XSS__ is falsy (script did not execute)
```

---

### 19.4 Response Headers & Info Exposure

**TC-SEC-API-040 ✅ API responses include X-Content-Type-Options: nosniff**
```
Request:
  GET /users/me (authenticated)

Expected:
  Response header x-content-type-options = "nosniff"
```

**TC-SEC-API-041 ✅ API does NOT expose stack traces in error responses**
```
Request:
  GET /posts/99999999 (not found)

Expected:
  Response body does NOT contain:
    "at com.socialmedia"
    "at org.springframework"
    "NullPointerException"
    "StackTrace"
```

**TC-SEC-API-042 ✅ Rate-limit headers present on API responses**
```
Expected:
  x-ratelimit-limit: integer > 0
  x-ratelimit-remaining: integer ≥ 0
  (If backend sends these; if not, endpoint returns 200 — test is advisory)
```

---

### 19.5 Idempotency & Duplicate Actions

**TC-SEC-API-050 ❌ Liking same post twice returns 409 on second attempt**
**TC-SEC-API-051 ❌ Following same user twice returns 409 on second attempt**
**TC-SEC-API-052 ❌ Duplicate registration with same username returns 409**

---

### 19.6 Auth State in Browser (UI)

**TC-SEC-UI-010 ✅ Removing token from localStorage triggers redirect to /login on next navigation**
**TC-SEC-UI-011 ✅ Corrupted token in localStorage causes redirect to /login (UI guard)**

---

## 20. Coverage Matrix

### 20.1 API Endpoint Coverage

| Endpoint | Method | ✅ Positive | ❌ Negative | Total |
|----------|--------|-------------|-------------|-------|
| /auth/register | POST | 2 | 6 | 8 |
| /auth/login | POST | 2 | 3 | 5 |
| /posts | POST | 3 | 3 | 6 |
| /posts/{id} | GET | 2 | 3 | 5 |
| /posts/{id} | PUT | 2 | 2 | 4 |
| /posts/{id} | DELETE | 1 | 2 | 3 |
| /posts/{id}/like | POST+DELETE | 3 | 3 | 6 |
| /posts/{id}/bookmark | POST | 3 | 2 | 5 |
| /users/me/bookmarks | GET | 1 | 1 | 2 |
| /posts/{id}/comments | POST+GET+DELETE | 4 | 4 | 8 |
| /posts/feed | GET | 3 | 1 | 4 |
| /posts/feed/cursor | GET | 4 | 2 | 6 |
| /users/{username} | GET | 2 | 1 | 3 |
| /users/me | GET+PUT | 3 | 3 | 6 |
| /users/me/password | PUT | 1 | 4 | 5 |
| /users/{username}/follow | POST+DELETE | 3 | 3 | 6 |
| /users/search | GET | 4 | 2 | 6 |
| /search/posts | GET | 2 | 1 | 3 |
| /hashtag/{tag}/posts | GET | 1 | 0 | 1 |
| /notifications | GET | 2 | 1 | 3 |
| /notifications/unread-count | GET | 2 | 1 | 3 |
| /notifications/read-all | PATCH | 1 | 0 | 1 |
| /notifications/{id}/read | PUT | 1 | 0 | 1 |
| /messages | POST | 3 | 4 | 7 |
| /messages/conversations | GET | 2 | 0 | 2 |
| /messages/conversations/{id}/messages | GET | 1 | 1 | 2 |
| /messages/conversations/{id}/read | PUT | 1 | 0 | 1 |
| /media/upload | POST | 6 | 7 | 13 |
| /admin/stats | GET | 1 | 2 | 3 |
| /admin/users | GET | 2 | 2 | 4 |
| /admin/users/{id}/role | PUT | 2 | 3 | 5 |
| /admin/users/{id} | DELETE | 1 | 2 | 3 |
| /ai/health | GET | 2 | 0 | 2 |
| /ai/chat | POST | 1 | 3 | 4 |
| **Security (cross-cutting)** | | 12 | 22 | 34 |
| **TOTALS** | | **≈ 90** | **≈ 100** | **≈ 190** |

---

### 20.2 Playwright UI Suite Coverage

| Feature | Spec File | ✅ | ❌ | Total |
|---------|-----------|----|----|-------|
| Registration | auth.spec.ts | 2 | 5 | 7 |
| Login / Logout | auth.spec.ts | 8 | 3 | 11 |
| Feed display + compose | feed.spec.ts | 7 | 2 | 9 |
| Post detail | posts.spec.ts | 5 | 1 | 6 |
| Comments | comments.spec.ts | 3 | 2 | 5 |
| Likes | posts.spec.ts | 2 | 0 | 2 |
| Bookmarks | (feed/profile) | 2 | 0 | 2 |
| Follow / Unfollow | follow.spec.ts | 5 | 1 | 6 |
| User Profile | profile.spec.ts | 8 | 2 | 10 |
| Search | search.spec.ts | 8 | 3 | 11 |
| Notifications | notifications.spec.ts | 5 | 1 | 6 |
| Messages | messaging.spec.ts | 5 | 0 | 5 |
| Media | media.spec.ts | 4 | 2 | 6 |
| Mentions autocomplete | (feed.spec.ts) | 5 | 2 | 7 |
| Admin panel | admin.spec.ts | 6 | 3 | 9 |
| Settings — Profile tab | settings.spec.ts | 5 | 0 | 5 |
| Settings — Password tab | settings.spec.ts | 3 | 3 | 6 |
| Settings — Account tab | settings.spec.ts | 2 | 2 | 4 |
| AI Assistant (Spark) | ai.spec.ts | 21 | 8 | 29 |
| Security (UI layer) | security.spec.ts | 8 | 14 | 22 |
| **TOTALS** | | **≈ 119** | **≈ 56** | **≈ 175** |

---

### 20.3 Feature → Spec File Mapping

| Feature / Page | API Tests | Playwright Spec |
|----------------|-----------|-----------------|
| Authentication | Section 3.1–3.3 | `auth.spec.ts` |
| Feed | Section 4.1 | `feed.spec.ts` |
| Posts (CRUD) | Section 5.1 | `posts.spec.ts` |
| Comments | Section 6.1 | `comments.spec.ts` |
| Likes + Bookmarks | Section 7.1–7.2 | `posts.spec.ts`, `feed.spec.ts` |
| Follow / Unfollow | Section 8.1 | `follow.spec.ts` |
| User Profile | Section 9.1 | `profile.spec.ts` |
| Search | Section 10.1 | `search.spec.ts` |
| Notifications | Section 11.1 | `notifications.spec.ts` |
| Messaging | Section 12.1 | `messaging.spec.ts` |
| Media Upload | Section 13.1–13.2 | `media.spec.ts` |
| Mentions Autocomplete | Section 14.1 | `feed.spec.ts` |
| Admin Panel | Section 15.1 | `admin.spec.ts` |
| Settings Page | Section 16.1 | `settings.spec.ts` |
| Cursor Pagination | Section 17 | `feed.spec.ts` |
| AI Assistant | Section 18.1 | `ai.spec.ts` |
| Security | Section 19 | `security.spec.ts` |

---

### 20.4 Scenario Summary

| Category | ✅ Positive | ❌ Negative | Total |
|----------|-------------|-------------|-------|
| API Tests | ~90 | ~100 | ~190 |
| Playwright UI Tests | ~119 | ~56 | ~175 |
| **Grand Total** | **~209** | **~156** | **~365** |

---

## Appendix A — Test Execution Cheat Sheet

```bash
# Run full suite (all browsers, sequential)
cd e2e && npm test

# Run just the smoke test (fast — auth + feed)
npm run test:smoke

# Run all positive scenarios only
npm run test:positive

# Run all negative (error path) scenarios only
npm run test:negative

# Run a specific feature suite
npm run test:auth
npm run test:posts
npm run test:security
npm run test:ai
npm run test:admin       # (once admin.spec.ts is created)
npm run test:settings    # (once settings.spec.ts is created)

# Run in headed browser (watch what happens)
npm run test:headed

# Open interactive Playwright UI
npm run test:ui

# Run on mobile viewport only
npm run test:mobile

# Generate test code by clicking
npm run codegen
```

---

## Appendix B — New Spec Files Needed (Phase 10 Features)

The following spec files were defined in Phase 10 but need to be created inside `e2e/tests/`:

**`admin.spec.ts`** — Admin panel UI tests (Section 15.2)
- Covers: TC-ADMIN-UI-001 through TC-ADMIN-UI-009
- Prerequisite: A seed admin user with `ADMIN` role; or promote alice via SQL before tests run

**`settings.spec.ts`** — Settings page UI tests (Section 16.2–16.4)
- Covers: TC-SETTINGS-UI-001 through TC-SETTINGS-UI-023
- Note: Password change tests reset alice's password — restore in afterEach or use a dedicated test user

**`messaging.spec.ts`** — Direct messaging UI tests (Section 12.2)
- Covers: TC-MSG-UI-001 through TC-MSG-UI-005

**`comments.spec.ts`** — Dedicated comment tests (Section 6.2)
- Some comment tests exist in `posts.spec.ts`; this file consolidates and expands them

Also consider adding mention tests to `feed.spec.ts` (Section 14.2) and cursor pagination tests (Section 17).

---

## Appendix C — Page Object Models Needed

Existing page objects in `e2e/pages/`:
- `LoginPage.ts`, `RegisterPage.ts`, `FeedPage.ts`
- `ProfilePage.ts`, `SearchPage.ts`
- `NotificationsPage.ts`, `AiPage.ts`

New page objects to create for Phase 10 features:
- `AdminPage.ts` — stats cards, user table, search, role toggle, delete
- `SettingsPage.ts` — tab navigation, profile/password/account form helpers
- `MessagingPage.ts` — conversation list, message thread, send message

---

**Document Version:** 1.0  
**Coverage Milestone:** Phase 10 complete (Admin, Settings, Mentions, Keyset Pagination, AI, Security)  
**Total Scenarios Specified:** ~365 (209 positive + 156 negative)  
**Status:** ✅ Ready for test implementation
