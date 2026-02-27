# E2E Test Cases — API & Playwright
## ConnectHub Social Media Platform

**Version:** 1.0  
**Date:** February 26, 2026  
**Status:** Ready for Implementation  
**Base URL (Test):** `http://localhost:8080/api/v1`  
**Frontend URL (Test):** `http://localhost:3000`

---

## Table of Contents

1. [Overview & Setup](#1-overview--setup)
2. [API Test Cases — Authentication](#2-api-test-cases--authentication)
3. [API Test Cases — Users & Profiles](#3-api-test-cases--users--profiles)
4. [API Test Cases — Posts](#4-api-test-cases--posts)
5. [API Test Cases — Feed & Pagination](#5-api-test-cases--feed--pagination)
6. [API Test Cases — Likes & Comments](#6-api-test-cases--likes--comments)
7. [API Test Cases — Follows](#7-api-test-cases--follows)
8. [API Test Cases — Search](#8-api-test-cases--search)
9. [API Test Cases — Notifications](#9-api-test-cases--notifications)
10. [API Test Cases — Messaging](#10-api-test-cases--messaging)
11. [API Test Cases — Bookmarks](#11-api-test-cases--bookmarks)
12. [API Test Cases — Admin Panel](#12-api-test-cases--admin-panel)
13. [API Test Cases — Settings & Password](#13-api-test-cases--settings--password)
14. [Playwright Test Cases — Authentication Flows](#14-playwright-test-cases--authentication-flows)
15. [Playwright Test Cases — Post Creation & Feed](#15-playwright-test-cases--post-creation--feed)
16. [Playwright Test Cases — Social Interactions](#16-playwright-test-cases--social-interactions)
17. [Playwright Test Cases — Search & Discovery](#17-playwright-test-cases--search--discovery)
18. [Playwright Test Cases — Messaging](#18-playwright-test-cases--messaging)
19. [Playwright Test Cases — Settings & Profile](#19-playwright-test-cases--settings--profile)
20. [Playwright Test Cases — Admin Panel](#20-playwright-test-cases--admin-panel)
21. [Playwright Test Cases — Accessibility & Responsive](#21-playwright-test-cases--accessibility--responsive)
22. [Test Data & Fixtures](#22-test-data--fixtures)
23. [CI Integration](#23-ci-integration)

---

## 1. Overview & Setup

### 1.1 Technology Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| API Testing | REST Assured / Supertest / Postman+Newman | HTTP-level contract tests |
| E2E UI | Playwright (TypeScript) | Browser automation |
| Test Runner | JUnit 5 (backend) / Vitest (frontend) | Unit + integration |
| Fixtures | Docker Compose (test profile) | Isolated DB, Redis |
| Reporting | Allure / Playwright HTML Reporter | Results dashboard |

### 1.2 Environment Setup

```bash
# Start test environment
docker compose -f docker-compose.test.yml up -d

# Seed test database
npm run db:seed:test

# Run all API tests
npm run test:api

# Run Playwright tests (headed)
npx playwright test --headed

# Run Playwright tests (CI)
npx playwright test --reporter=html
```

### 1.3 Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run start:test',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 1.4 Shared Test Utilities

```typescript
// e2e/helpers/auth.ts
export async function loginAs(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Username or Email').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('/feed');
}

export async function getAuthToken(username: string, password: string): Promise<string> {
  const res = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  return data.token;
}
```

---

## 2. API Test Cases — Authentication

### TC-AUTH-001 · Register — Success ✅ (Positive)

**Endpoint:** `POST /auth/register`

```json
// Request
{
  "username": "testuser_001",
  "email": "testuser001@example.com",
  "password": "SecurePass123!",
  "displayName": "Test User One"
}

// Expected Response: 201 Created
{
  "token": "<JWT>",
  "user": {
    "id": "<uuid>",
    "username": "testuser_001",
    "email": "testuser001@example.com",
    "displayName": "Test User One",
    "role": "USER"
  }
}
```

**Assertions:**
- Status: `201`
- `token` is a valid JWT (3 segments, base64)
- `user.role` equals `USER`
- `user.password` NOT present in response

---

### TC-AUTH-002 · Register — Duplicate Username ❌ (Negative)

```json
// Request (username already exists)
{ "username": "testuser_001", "email": "different@example.com", "password": "SecurePass123!" }

// Expected: 409 Conflict
{ "error": "USERNAME_TAKEN", "message": "Username is already in use" }
```

**Assertions:** Status `409`, no token issued

---

### TC-AUTH-003 · Register — Duplicate Email ❌ (Negative)

```json
{ "username": "brandnewuser", "email": "testuser001@example.com", "password": "SecurePass123!" }
// Expected: 409 Conflict — { "error": "EMAIL_TAKEN" }
```

---

### TC-AUTH-004 · Register — Weak Password ❌ (Negative)

```json
{ "username": "weakuser", "email": "weak@example.com", "password": "abc" }
// Expected: 400 Bad Request
{ "error": "VALIDATION_ERROR", "details": { "password": "must be at least 8 characters" } }
```

---

### TC-AUTH-005 · Register — Missing Required Fields ❌ (Negative)

```json
{ "username": "onlyusername" }
// Expected: 400 — details list missing fields (email, password)
```

---

### TC-AUTH-006 · Register — Invalid Email Format ❌ (Negative)

```json
{ "username": "badmail", "email": "not-an-email", "password": "SecurePass123!" }
// Expected: 400 with email validation error
```

---

### TC-AUTH-007 · Login — Success ✅ (Positive)

```json
// Request
{ "username": "testuser_001", "password": "SecurePass123!" }

// Expected: 200 OK
{ "token": "<JWT>", "user": { "id": "...", "username": "testuser_001" } }
```

**Assertions:** JWT valid, not expired; decodes to correct `sub`

---

### TC-AUTH-008 · Login — Wrong Password ❌ (Negative)

```json
{ "username": "testuser_001", "password": "WrongPassword!" }
// Expected: 401 Unauthorized — { "error": "INVALID_CREDENTIALS" }
```

---

### TC-AUTH-009 · Login — Non-Existent User ❌ (Negative — Security)

```json
{ "username": "ghost_user_xyz", "password": "anything" }
// Expected: 401 — same message as TC-AUTH-008 (prevents user enumeration)
```

---

### TC-AUTH-010 · Login — With Email Address ✅ (Positive)

```json
{ "username": "testuser001@example.com", "password": "SecurePass123!" }
// Expected: 200 OK — email login must work
```

---

### TC-AUTH-011 · Protected Route — Valid Token ✅ (Positive)

```
GET /users/me
Authorization: Bearer <valid-token>
// Expected: 200 with current user profile
```

---

### TC-AUTH-012 · Protected Route — Missing Token ❌ (Negative)

```
GET /users/me
// No Authorization header
// Expected: 401 — { "error": "UNAUTHORIZED" }
```

---

### TC-AUTH-013 · Protected Route — Expired Token ❌ (Negative)

```
GET /users/me
Authorization: Bearer <expired-jwt>
// Expected: 401 — { "error": "TOKEN_EXPIRED" }
```

---

### TC-AUTH-014 · Protected Route — Malformed Token ❌ (Negative)

```
GET /users/me
Authorization: Bearer notavalidjwt
// Expected: 401
```

---

### TC-AUTH-015 · Logout ✅ (Positive)

```
POST /auth/logout
Authorization: Bearer <valid-token>
// Expected: 200 OK
```

---

## 3. API Test Cases — Users & Profiles

### TC-USER-001 · Get Own Profile ✅ (Positive)

```
GET /users/me
Authorization: Bearer <token>
// Expected: 200
{
  "id": "...",
  "username": "testuser_001",
  "displayName": "Test User One",
  "bio": null,
  "avatarUrl": null,
  "followersCount": 0,
  "followingCount": 0,
  "postsCount": 0,
  "role": "USER"
}
```

**Assertions:** All fields present, `password` absent, counts are integers >= 0

---

### TC-USER-002 · Get Another User's Public Profile ✅ (Positive)

```
GET /users/{username}
// Expected: 200 — public profile (no email, no role exposed)
```

---

### TC-USER-003 · Get Non-Existent User ❌ (Negative)

```
GET /users/this_user_does_not_exist_xyz
// Expected: 404 Not Found — { "error": "USER_NOT_FOUND" }
```

---

### TC-USER-004 · Update Profile — Success ✅ (Positive)

```
PUT /users/me
Authorization: Bearer <token>
{ "displayName": "Updated Name", "bio": "New bio", "avatarUrl": "https://example.com/avatar.jpg" }
// Expected: 200 with updated fields
```

---

### TC-USER-005 · Update Profile — DisplayName Too Long ❌ (Negative)

```
PUT /users/me
{ "displayName": "<61-character string>" }
// Expected: 400 — displayName validation error
```

---

### TC-USER-006 · Update Profile — Bio Too Long ❌ (Negative)

```
PUT /users/me
{ "bio": "<201-character string>" }
// Expected: 400
```

---

### TC-USER-007 · Update Profile — Unauthenticated ❌ (Negative)

```
PUT /users/me
// No token — Expected: 401
```

---

### TC-USER-008 · Change Password — Success ✅ (Positive)

```
PUT /users/me/password
Authorization: Bearer <token>
{ "currentPassword": "SecurePass123!", "newPassword": "NewSecurePass456!" }
// Expected: 200 — { "message": "Password updated successfully" }
```

**Post-assertion:** Login with new password succeeds; old password rejected

---

### TC-USER-009 · Change Password — Wrong Current Password ❌ (Negative)

```
PUT /users/me/password
{ "currentPassword": "WrongOldPass!", "newPassword": "NewPass123!" }
// Expected: 403 Forbidden — { "error": "INVALID_CURRENT_PASSWORD" }
```

---

### TC-USER-010 · Change Password — Weak New Password ❌ (Negative)

```
PUT /users/me/password
{ "currentPassword": "SecurePass123!", "newPassword": "abc" }
// Expected: 400
```

---

### TC-USER-011 · Change Password — New Same as Current ❌ (Negative)

```
PUT /users/me/password
{ "currentPassword": "SecurePass123!", "newPassword": "SecurePass123!" }
// Expected: 400 — cannot reuse same password
```

---

## 4. API Test Cases — Posts

### TC-POST-001 · Create Post — Text Only ✅ (Positive)

```
POST /posts
Authorization: Bearer <token>
{ "content": "Hello world! This is my first post." }

// Expected: 201 Created
{
  "id": "...",
  "content": "Hello world! This is my first post.",
  "author": { "username": "testuser_001" },
  "likesCount": 0,
  "commentsCount": 0,
  "createdAt": "<ISO-8601>"
}
```

---

### TC-POST-002 · Create Post — With Media URL ✅ (Positive)

```
POST /posts
{ "content": "Check out this photo!", "mediaUrls": ["https://example.com/photo.jpg"] }
// Expected: 201 with mediaUrls echoed
```

---

### TC-POST-003 · Create Post — Maximum Length (280 chars) ✅ (Positive)

```
POST /posts
{ "content": "<exactly-280-characters>" }
// Expected: 201
```

---

### TC-POST-004 · Create Post — Exceeds Max Length ❌ (Negative)

```
POST /posts
{ "content": "<281+ character string>" }
// Expected: 400 — { "details": { "content": "must not exceed 280 characters" } }
```

---

### TC-POST-005 · Create Post — Empty Content ❌ (Negative)

```
POST /posts
{ "content": "" }
// Expected: 400
```

---

### TC-POST-006 · Create Post — Only Whitespace ❌ (Negative)

```
POST /posts
{ "content": "     " }
// Expected: 400
```

---

### TC-POST-007 · Create Post — Unauthenticated ❌ (Negative)

```
POST /posts
{ "content": "Should fail" }
// No token — Expected: 401
```

---

### TC-POST-008 · Get Single Post ✅ (Positive)

```
GET /posts/{postId}
Authorization: Bearer <token>
// Expected: 200 with full post object including comments
```

---

### TC-POST-009 · Get Non-Existent Post ❌ (Negative)

```
GET /posts/00000000-0000-0000-0000-000000000000
// Expected: 404
```

---

### TC-POST-010 · Edit Post — Owner ✅ (Positive)

```
PUT /posts/{postId}
Authorization: Bearer <owner-token>
{ "content": "Updated post content" }
// Expected: 200 with updated content and editedAt timestamp
```

---

### TC-POST-011 · Edit Post — Non-Owner ❌ (Negative)

```
PUT /posts/{postId}
Authorization: Bearer <other-user-token>
{ "content": "Trying to edit someone else's post" }
// Expected: 403 Forbidden
```

---

### TC-POST-012 · Edit Post — After 24 Hours ❌ (Negative)

```
PUT /posts/{postId}   (post created > 24h ago)
// Expected: 403 — { "error": "EDIT_WINDOW_EXPIRED" }
```

---

### TC-POST-013 · Delete Post — Owner ✅ (Positive)

```
DELETE /posts/{postId}
Authorization: Bearer <owner-token>
// Expected: 204 No Content
// Subsequent GET on same ID: 404
```

---

### TC-POST-014 · Delete Post — Non-Owner ❌ (Negative)

```
DELETE /posts/{postId}
Authorization: Bearer <other-user-token>
// Expected: 403
```

---

### TC-POST-015 · Get User Posts — Paginated ✅ (Positive)

```
GET /users/{username}/posts?page=0&size=10
// Expected: 200 paginated list, sorted newest first
GET /users/{username}/posts?page=1&size=5
// Expected: 200 second page (or empty if < 10 total)
```

---

### TC-POST-016 · Post with @Mention Creates Notification ✅ (Integration)

```
POST /posts
{ "content": "Hey @testuser_002, check this out!" }
// Expected: 201
// GET /notifications for testuser_002 includes MENTION notification
```

---

### TC-POST-017 · Post with Hashtag Appears in Tag Feed ✅ (Integration)

```
POST /posts
{ "content": "Loving #javascript today!" }
// Expected: 201
// GET /posts/hashtag/javascript includes this post
```

---

## 5. API Test Cases — Feed & Pagination

### TC-FEED-001 · Home Feed — Authenticated ✅ (Positive)

```
GET /posts/feed?page=0&size=20
Authorization: Bearer <token>
// Expected: 200
{
  "content": [...],
  "totalElements": N,
  "totalPages": P,
  "number": 0,
  "size": 20
}
```

**Assertions:** Only posts from followed users + own posts, newest first

---

### TC-FEED-002 · Home Feed — Unauthenticated ❌ (Negative)

```
GET /posts/feed
// No token — Expected: 401
```

---

### TC-FEED-003 · Cursor-Based Feed ✅ (Positive)

```
GET /posts/feed/cursor
// First page (no cursor)
// Expected: 200 — { "posts": [...], "nextCursor": "2026-02-26T10:00:00", "hasMore": true }

GET /posts/feed/cursor?before=2026-02-26T10:00:00&size=20
// Expected: posts older than cursor, new nextCursor or "" if no more
```

---

### TC-FEED-004 · Cursor Feed — Invalid Cursor Format ❌ (Negative)

```
GET /posts/feed/cursor?before=not-a-date
// Expected: 400
```

---

### TC-FEED-005 · Cursor Feed — Size Capped at 50 ✅ (Positive)

```
GET /posts/feed/cursor?size=100
// Expected: 200 — max 50 items returned regardless of size param
```

---

### TC-FEED-006 · Hashtag Feed ✅ (Positive)

```
GET /posts/hashtag/javascript?page=0&size=10
// Expected: 200 — only posts containing #javascript
```

---

### TC-FEED-007 · Hashtag Feed — Non-Existent Tag ✅ (Positive)

```
GET /posts/hashtag/xyznonexistenttag
// Expected: 200 with empty content array (not 404)
```

---

## 6. API Test Cases — Likes & Comments

### TC-LIKE-001 · Like a Post ✅ (Positive)

```
POST /posts/{postId}/like
Authorization: Bearer <token>
// Expected: 200 — { "liked": true, "likesCount": 1 }
```

---

### TC-LIKE-002 · Unlike a Post ✅ (Positive)

```
DELETE /posts/{postId}/like
Authorization: Bearer <token>
// Expected: 200 — { "liked": false, "likesCount": 0 }
```

---

### TC-LIKE-003 · Like Already-Liked Post ❌ (Negative)

```
POST /posts/{postId}/like  (second time)
// Expected: 409 Conflict or idempotent 200
```

---

### TC-LIKE-004 · Like Non-Existent Post ❌ (Negative)

```
POST /posts/non-existent-id/like
// Expected: 404
```

---

### TC-LIKE-005 · Like — Unauthenticated ❌ (Negative)

```
POST /posts/{postId}/like
// No token — Expected: 401
```

---

### TC-COMMENT-001 · Add Comment ✅ (Positive)

```
POST /posts/{postId}/comments
Authorization: Bearer <token>
{ "content": "Great post!" }
// Expected: 201 — { "id": "...", "content": "Great post!", "author": {...} }
// POST commentsCount increments
```

---

### TC-COMMENT-002 · Add Comment — Empty Content ❌ (Negative)

```
POST /posts/{postId}/comments
{ "content": "" }
// Expected: 400
```

---

### TC-COMMENT-003 · Add Comment — Unauthenticated ❌ (Negative)

```
POST /posts/{postId}/comments
{ "content": "test" }
// No token — Expected: 401
```

---

### TC-COMMENT-004 · Delete Own Comment ✅ (Positive)

```
DELETE /posts/{postId}/comments/{commentId}
Authorization: Bearer <comment-owner-token>
// Expected: 204
```

---

### TC-COMMENT-005 · Delete Other User's Comment ❌ (Negative)

```
DELETE /posts/{postId}/comments/{commentId}
Authorization: Bearer <other-user-token>
// Expected: 403
```

---

### TC-COMMENT-006 · Post Author Deletes Comment on Own Post ✅ (Positive)

```
DELETE /posts/{postId}/comments/{commentId}
Authorization: Bearer <post-author-token>
// Expected: 204 — post author can moderate their own post
```

---

## 7. API Test Cases — Follows

### TC-FOLLOW-001 · Follow a User ✅ (Positive)

```
POST /users/{username}/follow
Authorization: Bearer <token>
// Expected: 200 — { "following": true, "followersCount": N+1 }
```

**Assertions:** Target's `followersCount` and current user's `followingCount` both increment

---

### TC-FOLLOW-002 · Unfollow a User ✅ (Positive)

```
DELETE /users/{username}/follow
Authorization: Bearer <token>
// Expected: 200 — { "following": false, "followersCount": N }
```

---

### TC-FOLLOW-003 · Follow Self ❌ (Negative)

```
POST /users/{own-username}/follow
// Expected: 400 — { "error": "CANNOT_FOLLOW_SELF" }
```

---

### TC-FOLLOW-004 · Follow Already-Followed User ❌ (Negative)

```
POST /users/{username}/follow  (second time)
// Expected: 409 or idempotent 200
```

---

### TC-FOLLOW-005 · Follow Non-Existent User ❌ (Negative)

```
POST /users/ghost_xyz_9999/follow
// Expected: 404
```

---

### TC-FOLLOW-006 · Get Followers List ✅ (Positive)

```
GET /users/{username}/followers?page=0&size=20
// Expected: 200 paginated list of follower user objects
```

---

### TC-FOLLOW-007 · Get Following List ✅ (Positive)

```
GET /users/{username}/following?page=0&size=20
// Expected: 200 paginated list of following user objects
```

---

## 8. API Test Cases — Search

### TC-SEARCH-001 · Search Users ✅ (Positive)

```
GET /search/users?q=testuser&page=0&size=10
// Expected: 200 list of matching users
```

---

### TC-SEARCH-002 · Search — Partial Match ✅ (Positive)

```
GET /search/users?q=test
// Expected: 200 — users containing "test" in username or displayName
```

---

### TC-SEARCH-003 · Search — No Results ✅ (Positive)

```
GET /search/users?q=zzznomatch999
// Expected: 200 with empty array (not 404)
```

---

### TC-SEARCH-004 · Search Posts ✅ (Positive)

```
GET /search/posts?q=javascript&page=0&size=10
// Expected: 200 posts containing "javascript"
```

---

### TC-SEARCH-005 · Search — XSS Payload 🔒 (Security)

```
GET /search/users?q=<script>alert('xss')</script>
// Expected: 200 empty results, no script execution, content sanitized
```

---

### TC-SEARCH-006 · Search — SQL Injection 🔒 (Security)

```
GET /search/users?q=' OR '1'='1
// Expected: 200 empty results — query is parameterized, no injection possible
```

---

### TC-SEARCH-007 · Mention Autocomplete — Size Param ✅ (Positive)

```
GET /search/users?q=test&size=6
// Expected: 200, max 6 results for @mention dropdown usage
```

---

## 9. API Test Cases — Notifications

### TC-NOTIF-001 · Get Notifications ✅ (Positive)

```
GET /notifications?page=0&size=20
Authorization: Bearer <token>
// Expected: 200
{
  "content": [
    { "id": "...", "type": "LIKE|COMMENT|FOLLOW|MENTION", "read": false,
      "actor": { "username": "..." }, "postId": "...", "createdAt": "..." }
  ]
}
```

---

### TC-NOTIF-002 · Mark Notification as Read ✅ (Positive)

```
PUT /notifications/{id}/read
// Expected: 200 — { "read": true }
```

---

### TC-NOTIF-003 · Mark All as Read ✅ (Positive)

```
PUT /notifications/read-all
// Expected: 200 — { "updatedCount": N }
```

---

### TC-NOTIF-004 · Get Unread Count ✅ (Positive)

```
GET /notifications/unread-count
// Expected: 200 — { "count": 3 }
```

---

### TC-NOTIF-005 · Like Creates Notification ✅ (Integration)

1. User A creates post
2. User B likes it
3. `GET /notifications` as User A → LIKE notification with actor = User B

---

### TC-NOTIF-006 · Comment Creates Notification ✅ (Integration)

1. User A creates post
2. User B comments
3. User A's notifications → COMMENT notification

---

### TC-NOTIF-007 · Follow Creates Notification ✅ (Integration)

1. User B follows User A
2. User A's notifications → FOLLOW notification

---

### TC-NOTIF-008 · No Self-Notification ❌ (Negative)

1. User likes their own post
2. Their notifications → no LIKE notification

---

## 10. API Test Cases — Messaging

### TC-MSG-001 · Send Direct Message ✅ (Positive)

```
POST /messages
Authorization: Bearer <token>
{ "recipientId": "<user-id>", "content": "Hey there!" }
// Expected: 201 — { "id": "...", "content": "Hey there!", "sender": {...}, "recipient": {...} }
```

---

### TC-MSG-002 · Send Message to Self ❌ (Negative)

```
POST /messages
{ "recipientId": "<own-user-id>", "content": "Talking to myself" }
// Expected: 400 — { "error": "CANNOT_MESSAGE_SELF" }
```

---

### TC-MSG-003 · Send Empty Message ❌ (Negative)

```
POST /messages
{ "recipientId": "<user-id>", "content": "" }
// Expected: 400
```

---

### TC-MSG-004 · Get Conversation ✅ (Positive)

```
GET /messages/conversation/{userId}?page=0&size=50
// Expected: 200 messages between current user and userId, chronological
```

---

### TC-MSG-005 · Get Conversations List ✅ (Positive)

```
GET /messages/conversations
// Expected: 200 list of conversation previews (latest message per user)
```

---

### TC-MSG-006 · Message — Unauthenticated ❌ (Negative)

```
POST /messages
// No token — Expected: 401
```

---

### TC-MSG-007 · Message Non-Existent User ❌ (Negative)

```
POST /messages
{ "recipientId": "00000000-0000-0000-0000-000000000000", "content": "test" }
// Expected: 404
```

---

## 11. API Test Cases — Bookmarks

### TC-BM-001 · Bookmark a Post ✅ (Positive)

```
POST /posts/{postId}/bookmark
// Expected: 200 — { "bookmarked": true }
```

---

### TC-BM-002 · Remove Bookmark ✅ (Positive)

```
DELETE /posts/{postId}/bookmark
// Expected: 200 — { "bookmarked": false }
```

---

### TC-BM-003 · Get Bookmarks ✅ (Positive)

```
GET /bookmarks?page=0&size=20
// Expected: 200 list of bookmarked posts
```

---

### TC-BM-004 · Bookmark Non-Existent Post ❌ (Negative)

```
POST /posts/non-existent/bookmark
// Expected: 404
```

---

### TC-BM-005 · Bookmarks Private to Owner 🔒 (Security)

```
GET /users/{username}/bookmarks
Authorization: Bearer <other-user-token>
// Expected: 403 or 404 — bookmarks not visible to other users
```

---

## 12. API Test Cases — Admin Panel

### TC-ADMIN-001 · Get Stats — Admin User ✅ (Positive)

```
GET /admin/stats
Authorization: Bearer <admin-token>
// Expected: 200
{ "totalUsers": N, "adminUsers": M, "regularUsers": N-M, "totalPosts": P }
```

---

### TC-ADMIN-002 · Get Stats — Regular User ❌ (Negative)

```
GET /admin/stats
Authorization: Bearer <regular-user-token>
// Expected: 403 Forbidden
```

---

### TC-ADMIN-003 · Get Stats — Unauthenticated ❌ (Negative)

```
GET /admin/stats
// No token — Expected: 401
```

---

### TC-ADMIN-004 · List Users — Admin ✅ (Positive)

```
GET /admin/users?page=0&size=15
Authorization: Bearer <admin-token>
// Expected: 200 paginated user list including email, role, stats
```

---

### TC-ADMIN-005 · Search Users — Admin ✅ (Positive)

```
GET /admin/users?q=test&page=0&size=15
Authorization: Bearer <admin-token>
// Expected: 200 filtered list
```

---

### TC-ADMIN-006 · Promote User to Admin ✅ (Positive)

```
PUT /admin/users/{userId}/role
Authorization: Bearer <admin-token>
{ "role": "ADMIN" }
// Expected: 200 — { "role": "ADMIN" }
// Post-assertion: user can now access admin endpoints
```

---

### TC-ADMIN-007 · Demote Admin to User ✅ (Positive)

```
PUT /admin/users/{userId}/role
{ "role": "USER" }
// Expected: 200 — user loses admin access
```

---

### TC-ADMIN-008 · Set Invalid Role ❌ (Negative)

```
PUT /admin/users/{userId}/role
{ "role": "SUPERUSER" }
// Expected: 400
```

---

### TC-ADMIN-009 · Delete User — Admin ✅ (Positive)

```
DELETE /admin/users/{userId}
Authorization: Bearer <admin-token>
// Expected: 204
// Post-assertion: deleted user can no longer login
```

---

### TC-ADMIN-010 · Admin Cannot Delete Self ❌ (Negative)

```
DELETE /admin/users/{own-admin-userId}
// Expected: 400 — { "error": "CANNOT_DELETE_SELF" }
```

---

### TC-ADMIN-011 · Role Change by Regular User ❌ (Negative)

```
PUT /admin/users/{userId}/role
Authorization: Bearer <regular-user-token>
// Expected: 403
```

---

## 13. API Test Cases — Settings & Password

### TC-SETTINGS-001 · Update Avatar URL ✅ (Positive)

```
PUT /users/me
{ "avatarUrl": "https://cdn.example.com/avatars/123.jpg" }
// Expected: 200 with updated avatarUrl
```

---

### TC-SETTINGS-002 · Update Avatar — Invalid URL ❌ (Negative)

```
PUT /users/me
{ "avatarUrl": "not-a-url" }
// Expected: 400
```

---

### TC-SETTINGS-003 · Delete Account ✅ (Positive)

```
DELETE /users/me
Authorization: Bearer <token>
{ "confirmUsername": "testuser_001" }
// Expected: 204
// Post-assertion: login returns 401
```

---

### TC-SETTINGS-004 · Delete Account — Wrong Confirmation ❌ (Negative)

```
DELETE /users/me
{ "confirmUsername": "wrongusername" }
// Expected: 400 — { "error": "CONFIRMATION_MISMATCH" }
```

---

---

## 14. Playwright Test Cases — Authentication Flows

### TC-PW-AUTH-001 · Register New User ✅ (Positive)

```typescript
test('user can register a new account', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Username').fill('playwright_user_001');
  await page.getByLabel('Email').fill('pw001@example.com');
  await page.getByLabel('Display Name').fill('Playwright User');
  await page.getByLabel('Password').fill('SecurePass123!');
  await page.getByLabel('Confirm Password').fill('SecurePass123!');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page).toHaveURL('/feed');
  await expect(page.getByText('Welcome, Playwright User')).toBeVisible();
});
```

---

### TC-PW-AUTH-002 · Register — Password Mismatch ❌ (Negative)

```typescript
test('shows error when passwords do not match', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Password').fill('SecurePass123!');
  await page.getByLabel('Confirm Password').fill('DifferentPass456!');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  await expect(page).toHaveURL('/register');
});
```

---

### TC-PW-AUTH-003 · Register — Taken Username Shows Error ❌ (Negative)

```typescript
test('shows error for taken username', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Username').fill('seeded_user');
  await page.getByLabel('Email').fill('unique@example.com');
  await page.getByLabel('Password').fill('SecurePass123!');
  await page.getByLabel('Confirm Password').fill('SecurePass123!');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByRole('alert')).toContainText(/username.*taken/i);
});
```

---

### TC-PW-AUTH-004 · Login — Success ✅ (Positive)

```typescript
test('user can log in with valid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username or Email').fill('seeded_user');
  await page.getByLabel('Password').fill('TestPass123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL('/feed');
  await expect(page.getByTestId('user-avatar')).toBeVisible();
});
```

---

### TC-PW-AUTH-005 · Login — Wrong Password ❌ (Negative)

```typescript
test('shows error for wrong password', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username or Email').fill('seeded_user');
  await page.getByLabel('Password').fill('WrongPassword!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByRole('alert')).toContainText(/invalid credentials/i);
  await expect(page).toHaveURL('/login');
});
```

---

### TC-PW-AUTH-006 · Login — Empty Fields ❌ (Negative)

```typescript
test('shows validation errors for empty fields', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByText(/username.*required/i)).toBeVisible();
  await expect(page.getByText(/password.*required/i)).toBeVisible();
});
```

---

### TC-PW-AUTH-007 · Redirect to Login When Unauthenticated ❌ (Negative)

```typescript
test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/feed');
  await expect(page).toHaveURL(/\/login/);
});
```

---

### TC-PW-AUTH-008 · Logout ✅ (Positive)

```typescript
test('user can log out', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.getByTestId('user-menu').click();
  await page.getByRole('menuitem', { name: 'Log Out' }).click();

  await expect(page).toHaveURL('/login');
  await page.goto('/feed');
  await expect(page).toHaveURL(/\/login/); // still logged out
});
```

---

### TC-PW-AUTH-009 · Session Persists on Refresh ✅ (Positive)

```typescript
test('user stays logged in after page refresh', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.reload();

  await expect(page).toHaveURL('/feed');
  await expect(page.getByTestId('user-avatar')).toBeVisible();
});
```

---

## 15. Playwright Test Cases — Post Creation & Feed

### TC-PW-POST-001 · Create Text Post ✅ (Positive)

```typescript
test('user can create a text post', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  const postContent = `Playwright test post ${Date.now()}`;
  await page.getByPlaceholder(/what.*mind/i).fill(postContent);
  await page.getByRole('button', { name: 'Post' }).click();

  await expect(page.getByText(postContent)).toBeVisible();
});
```

---

### TC-PW-POST-002 · Post Button Disabled When Over Character Limit ❌ (Negative)

```typescript
test('post button disabled when content exceeds 280 characters', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.getByPlaceholder(/what.*mind/i).fill('a'.repeat(281));

  await expect(page.getByRole('button', { name: 'Post' })).toBeDisabled();
  await expect(page.getByTestId('char-counter')).toHaveClass(/text-red/);
});
```

---

### TC-PW-POST-003 · Character Counter Updates ✅ (Positive)

```typescript
test('character counter decrements as user types', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.getByPlaceholder(/what.*mind/i).fill('Hello');
  await expect(page.getByTestId('char-counter')).toContainText('275');
});
```

---

### TC-PW-POST-004 · @Mention Dropdown Appears ✅ (Positive)

```typescript
test('mention dropdown appears when typing @username', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  const composer = page.getByPlaceholder(/what.*mind/i);
  await composer.fill('Hello @seed');

  await expect(page.getByTestId('mention-dropdown')).toBeVisible();
  await expect(page.getByTestId('mention-option').first()).toBeVisible();
});
```

---

### TC-PW-POST-005 · Select @Mention from Dropdown ✅ (Positive)

```typescript
test('clicking mention suggestion inserts @username', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  const composer = page.getByPlaceholder(/what.*mind/i);
  await composer.fill('Hey @seed');
  await page.getByTestId('mention-option').first().click();

  await expect(composer).toHaveValue(/Hey @\w+\s/);
  await expect(page.getByTestId('mention-dropdown')).not.toBeVisible();
});
```

---

### TC-PW-POST-006 · Keyboard Navigation in Mention Dropdown ✅ (Positive)

```typescript
test('arrow keys navigate and Enter selects mention', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  const composer = page.getByPlaceholder(/what.*mind/i);
  await composer.fill('Hey @seed');
  await composer.press('ArrowDown');
  await composer.press('Enter');

  await expect(composer).toHaveValue(/Hey @\w+\s/);
});
```

---

### TC-PW-POST-007 · Escape Closes Mention Dropdown ✅ (Positive)

```typescript
test('Escape key closes mention dropdown', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  const composer = page.getByPlaceholder(/what.*mind/i);
  await composer.fill('Hey @seed');
  await composer.press('Escape');

  await expect(page.getByTestId('mention-dropdown')).not.toBeVisible();
});
```

---

### TC-PW-POST-008 · Feed Shows Posts from Followed Users ✅ (Positive)

```typescript
test('feed shows posts from followed users', async ({ page }) => {
  // Fixture: user_a follows user_b, user_b has posts
  await loginAs(page, 'user_a', 'TestPass123!');
  await page.goto('/feed');

  await expect(page.getByTestId('post-card')).not.toHaveCount(0);
});
```

---

### TC-PW-POST-009 · Feed Loads More on Scroll ✅ (Positive)

```typescript
test('feed loads more posts on scroll to bottom', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/feed');

  const initialCount = await page.getByTestId('post-card').count();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  const newCount = await page.getByTestId('post-card').count();

  expect(newCount).toBeGreaterThanOrEqual(initialCount);
});
```

---

### TC-PW-POST-010 · Edit Post ✅ (Positive)

```typescript
test('post author can edit their post', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/profile/seeded_user');

  await page.getByTestId('post-menu').first().click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await page.getByTestId('post-editor').fill('Edited post content');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Edited post content')).toBeVisible();
  await expect(page.getByText(/edited/i)).toBeVisible();
});
```

---

### TC-PW-POST-011 · Delete Post ✅ (Positive)

```typescript
test('post author can delete their post', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  const content = `Delete me ${Date.now()}`;
  await page.getByPlaceholder(/what.*mind/i).fill(content);
  await page.getByRole('button', { name: 'Post' }).click();
  await expect(page.getByText(content)).toBeVisible();

  await page.getByTestId('post-menu').first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();

  await expect(page.getByText(content)).not.toBeVisible();
});
```

---

### TC-PW-POST-012 · Edit/Delete Hidden for Other User's Posts ❌ (Negative)

```typescript
test('edit and delete not available on other users posts', async ({ page }) => {
  await loginAs(page, 'user_a', 'TestPass123!');
  await page.goto('/profile/user_b');

  await page.getByTestId('post-menu').first().click();
  await expect(page.getByRole('menuitem', { name: 'Edit' })).not.toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Delete' })).not.toBeVisible();
});
```

---

## 16. Playwright Test Cases — Social Interactions

### TC-PW-SOCIAL-001 · Like a Post ✅ (Positive)

```typescript
test('user can like a post', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/feed');

  const likeBtn = page.getByTestId('like-button').first();
  const initialCount = parseInt(await page.getByTestId('like-count').first().innerText());
  await likeBtn.click();

  await expect(likeBtn).toHaveClass(/liked/);
  await expect(page.getByTestId('like-count').first()).toContainText(String(initialCount + 1));
});
```

---

### TC-PW-SOCIAL-002 · Unlike a Post ✅ (Positive)

```typescript
test('user can unlike a post', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/feed');

  const likeBtn = page.getByTestId('like-button').first();
  await likeBtn.click(); // like
  await likeBtn.click(); // unlike

  await expect(likeBtn).not.toHaveClass(/liked/);
});
```

---

### TC-PW-SOCIAL-003 · Add Comment ✅ (Positive)

```typescript
test('user can comment on a post', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/feed');

  await page.getByTestId('comment-button').first().click();
  await page.getByPlaceholder(/write a comment/i).fill('Great post!');
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByText('Great post!')).toBeVisible();
});
```

---

### TC-PW-SOCIAL-004 · Delete Own Comment ✅ (Positive)

```typescript
test('user can delete their own comment', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  // Navigate to a post with own comment
  await page.getByTestId('comment-delete').first().click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('Great post!')).not.toBeVisible();
});
```

---

### TC-PW-SOCIAL-005 · Follow a User ✅ (Positive)

```typescript
test('user can follow another user', async ({ page }) => {
  await loginAs(page, 'user_a', 'TestPass123!');
  await page.goto('/profile/user_b');

  await page.getByRole('button', { name: 'Follow' }).click();
  await expect(page.getByRole('button', { name: 'Following' })).toBeVisible();
});
```

---

### TC-PW-SOCIAL-006 · Unfollow a User ✅ (Positive)

```typescript
test('user can unfollow a followed user', async ({ page }) => {
  await loginAs(page, 'user_a', 'TestPass123!');
  await page.goto('/profile/user_b');

  await page.getByRole('button', { name: 'Following' }).click();
  await page.getByRole('button', { name: 'Unfollow' }).click();

  await expect(page.getByRole('button', { name: 'Follow' })).toBeVisible();
});
```

---

### TC-PW-SOCIAL-007 · Bookmark a Post ✅ (Positive)

```typescript
test('user can bookmark a post and find it on bookmarks page', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/feed');

  await page.getByTestId('bookmark-button').first().click();
  await expect(page.getByTestId('bookmark-button').first()).toHaveClass(/bookmarked/);

  await page.goto('/bookmarks');
  await expect(page.getByTestId('post-card')).not.toHaveCount(0);
});
```

---

### TC-PW-SOCIAL-008 · Notification Badge Updates Real-Time ✅ (Positive)

```typescript
test('notification badge updates when another user likes post', async ({ page, context }) => {
  const pageA = page;
  const pageB = await context.newPage();

  await loginAs(pageA, 'user_a', 'TestPass123!');
  await loginAs(pageB, 'user_b', 'TestPass123!');

  // User B likes User A's post
  await pageB.goto('/profile/user_a');
  await pageB.getByTestId('like-button').first().click();

  await pageA.reload();
  await expect(pageA.getByTestId('notification-badge')).toBeVisible();
  await expect(pageA.getByTestId('notification-badge')).not.toContainText('0');
});
```

---

## 17. Playwright Test Cases — Search & Discovery

### TC-PW-SEARCH-001 · Search for Users ✅ (Positive)

```typescript
test('search returns matching users', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/search');

  await page.getByPlaceholder(/search/i).fill('seed');
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('user-result')).not.toHaveCount(0);
  await expect(page.getByTestId('user-result').first()).toContainText('seed');
});
```

---

### TC-PW-SEARCH-002 · Search — No Results Shows Empty State ✅ (Positive)

```typescript
test('search shows empty state for no results', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/search');

  await page.getByPlaceholder(/search/i).fill('zzznoresult999xyz');
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('empty-state')).toBeVisible();
});
```

---

### TC-PW-SEARCH-003 · Hashtag Page Loads Posts ✅ (Positive)

```typescript
test('hashtag page shows posts with that tag', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/hashtag/javascript');

  await expect(page.getByText('#javascript')).toBeVisible();
  await expect(page.getByTestId('post-card')).not.toHaveCount(0);
});
```

---

### TC-PW-SEARCH-004 · Clicking Hashtag Navigates to Tag Feed ✅ (Positive)

```typescript
test('clicking hashtag in post navigates to hashtag page', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/feed');

  await page.getByTestId('hashtag-link').first().click();
  await expect(page).toHaveURL(/\/hashtag\//);
});
```

---

### TC-PW-SEARCH-005 · Navigate to Profile from Search ✅ (Positive)

```typescript
test('clicking user result navigates to their profile', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/search?q=seed');

  await page.getByTestId('user-result').first().click();
  await expect(page).toHaveURL(/\/profile\//);
});
```

---

## 18. Playwright Test Cases — Messaging

### TC-PW-MSG-001 · Send Direct Message ✅ (Positive)

```typescript
test('user can send a direct message', async ({ page }) => {
  await loginAs(page, 'user_a', 'TestPass123!');
  await page.goto('/messages');

  await page.getByRole('button', { name: 'New Message' }).click();
  await page.getByPlaceholder(/search users/i).fill('user_b');
  await page.getByTestId('user-option').first().click();

  await page.getByPlaceholder(/type a message/i).fill('Hello from Playwright!');
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByText('Hello from Playwright!')).toBeVisible();
});
```

---

### TC-PW-MSG-002 · Receive Message in Real Time ✅ (Positive)

```typescript
test('sent message appears for recipient without refresh', async ({ page, context }) => {
  const pageA = page;
  const pageB = await context.newPage();

  await loginAs(pageA, 'user_a', 'TestPass123!');
  await loginAs(pageB, 'user_b', 'TestPass123!');

  await pageB.goto('/messages/user_a');
  await pageA.goto('/messages/user_b');
  await pageA.getByPlaceholder(/type a message/i).fill('Real-time test!');
  await pageA.getByRole('button', { name: 'Send' }).click();

  await expect(pageB.getByText('Real-time test!')).toBeVisible({ timeout: 5000 });
});
```

---

### TC-PW-MSG-003 · Send Button Disabled for Empty Message ❌ (Negative)

```typescript
test('send button disabled for empty message', async ({ page }) => {
  await loginAs(page, 'user_a', 'TestPass123!');
  await page.goto('/messages/user_b');

  await expect(page.getByRole('button', { name: 'Send' })).toBeDisabled();
});
```

---

### TC-PW-MSG-004 · Conversations List Shows Latest Preview ✅ (Positive)

```typescript
test('conversations list shows latest message preview', async ({ page }) => {
  await loginAs(page, 'user_a', 'TestPass123!');
  await page.goto('/messages');

  await expect(page.getByTestId('conversation-item')).not.toHaveCount(0);
  await expect(page.getByTestId('conversation-preview').first()).not.toBeEmpty();
});
```

---

## 19. Playwright Test Cases — Settings & Profile

### TC-PW-SETTINGS-001 · Update Display Name ✅ (Positive)

```typescript
test('user can update their display name', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/settings');

  await page.getByLabel('Display Name').clear();
  await page.getByLabel('Display Name').fill('New Display Name');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByTestId('save-success')).toBeVisible();

  await page.goto('/profile/seeded_user');
  await expect(page.getByText('New Display Name')).toBeVisible();
});
```

---

### TC-PW-SETTINGS-002 · Bio Character Counter ✅ (Positive)

```typescript
test('bio shows character counter', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/settings');

  await page.getByLabel('Bio').fill('Hello');
  await expect(page.getByTestId('bio-counter')).toContainText('195');
});
```

---

### TC-PW-SETTINGS-003 · Save Disabled When Bio Exceeds Limit ❌ (Negative)

```typescript
test('cannot save bio longer than 200 characters', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/settings');

  await page.getByLabel('Bio').fill('a'.repeat(201));
  await expect(page.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  await expect(page.getByTestId('bio-counter')).toHaveClass(/text-red/);
});
```

---

### TC-PW-SETTINGS-004 · Change Password — Success ✅ (Positive)

```typescript
test('user can change their password', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/settings');

  await page.getByRole('tab', { name: 'Password' }).click();
  await page.getByLabel('Current Password').fill('TestPass123!');
  await page.getByLabel('New Password').fill('NewTestPass456!');
  await page.getByLabel('Confirm New Password').fill('NewTestPass456!');
  await page.getByRole('button', { name: 'Update Password' }).click();

  await expect(page.getByText(/password updated/i)).toBeVisible();
});
```

---

### TC-PW-SETTINGS-005 · Change Password — Wrong Current ❌ (Negative)

```typescript
test('shows error for incorrect current password', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/settings');

  await page.getByRole('tab', { name: 'Password' }).click();
  await page.getByLabel('Current Password').fill('WrongPassword!');
  await page.getByLabel('New Password').fill('NewPass123!');
  await page.getByLabel('Confirm New Password').fill('NewPass123!');
  await page.getByRole('button', { name: 'Update Password' }).click();

  await expect(page.getByRole('alert')).toContainText(/incorrect.*password/i);
});
```

---

### TC-PW-SETTINGS-006 · Toggle Password Visibility ✅ (Positive)

```typescript
test('eye icon toggles password field visibility', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/settings');
  await page.getByRole('tab', { name: 'Password' }).click();

  const currentPwField = page.getByLabel('Current Password');
  await expect(currentPwField).toHaveAttribute('type', 'password');

  await page.getByTestId('toggle-current-pw').click();
  await expect(currentPwField).toHaveAttribute('type', 'text');
});
```

---

### TC-PW-SETTINGS-007 · Delete Account — Correct Confirmation ✅ (Positive)

```typescript
test('user can delete account with correct confirmation', async ({ page }) => {
  await loginAs(page, 'delete_me_user', 'TestPass123!');
  await page.goto('/settings');

  await page.getByRole('tab', { name: 'Account' }).click();
  await page.getByRole('button', { name: /delete account/i }).click();
  await page.getByPlaceholder(/type your username/i).fill('delete_me_user');
  await page.getByRole('button', { name: 'Permanently Delete' }).click();

  await expect(page).toHaveURL('/login');
});
```

---

### TC-PW-SETTINGS-008 · Delete Account — Wrong Confirmation ❌ (Negative)

```typescript
test('permanently delete button disabled with wrong username', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/settings');

  await page.getByRole('tab', { name: 'Account' }).click();
  await page.getByRole('button', { name: /delete account/i }).click();
  await page.getByPlaceholder(/type your username/i).fill('wrong_name');

  await expect(page.getByRole('button', { name: 'Permanently Delete' })).toBeDisabled();
});
```

---

## 20. Playwright Test Cases — Admin Panel

### TC-PW-ADMIN-001 · Admin Link Visible Only to Admins ✅ (Positive)

```typescript
test('admin nav link visible only for ADMIN role', async ({ page }) => {
  await loginAs(page, 'admin_user', 'AdminPass123!');
  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
});

test('admin nav link hidden for regular user', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();
});
```

---

### TC-PW-ADMIN-002 · Regular User Blocked from Admin Page ❌ (Negative)

```typescript
test('regular user redirected away from /admin', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/admin');
  await expect(page).toHaveURL('/feed');
});
```

---

### TC-PW-ADMIN-003 · Admin Stats Visible ✅ (Positive)

```typescript
test('admin can see platform stats', async ({ page }) => {
  await loginAs(page, 'admin_user', 'AdminPass123!');
  await page.goto('/admin');

  await expect(page.getByTestId('stat-total-users')).toBeVisible();
  await expect(page.getByTestId('stat-total-posts')).toBeVisible();
  await expect(page.getByTestId('stat-total-users')).not.toContainText('0');
});
```

---

### TC-PW-ADMIN-004 · Search Users in Admin Panel ✅ (Positive)

```typescript
test('admin can search for users', async ({ page }) => {
  await loginAs(page, 'admin_user', 'AdminPass123!');
  await page.goto('/admin');

  await page.getByPlaceholder(/search users/i).fill('seed');
  await page.waitForTimeout(400); // debounce delay

  await expect(page.getByTestId('admin-user-row')).not.toHaveCount(0);
  await expect(page.getByTestId('admin-user-row').first()).toContainText('seed');
});
```

---

### TC-PW-ADMIN-005 · Promote User to Admin ✅ (Positive)

```typescript
test('admin can promote a user to admin role', async ({ page }) => {
  await loginAs(page, 'admin_user', 'AdminPass123!');
  await page.goto('/admin');

  await page.getByTestId('promote-user-btn').first().click();
  await page.getByRole('button', { name: 'Confirm' }).click();

  await expect(page.getByTestId('success-toast')).toContainText(/role updated/i);
  await expect(page.getByTestId('admin-badge').first()).toBeVisible();
});
```

---

### TC-PW-ADMIN-006 · Admin Cannot Modify Own Account ❌ (Negative)

```typescript
test('admin actions disabled on own account row', async ({ page }) => {
  await loginAs(page, 'admin_user', 'AdminPass123!');
  await page.goto('/admin');

  const ownRow = page.getByTestId('admin-user-row').filter({ hasText: 'admin_user' });
  await expect(ownRow.getByTestId('promote-user-btn')).toBeDisabled();
  await expect(ownRow.getByTestId('delete-user-btn')).toBeDisabled();
});
```

---

### TC-PW-ADMIN-007 · Delete User — Confirmation Required ✅ (Positive)

```typescript
test('admin can delete a user after confirmation dialog', async ({ page }) => {
  await loginAs(page, 'admin_user', 'AdminPass123!');
  await page.goto('/admin');

  await page.getByTestId('delete-user-btn').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByTestId('success-toast')).toContainText(/user deleted/i);
});
```

---

### TC-PW-ADMIN-008 · Admin Pagination ✅ (Positive)

```typescript
test('admin user list paginates correctly', async ({ page }) => {
  await loginAs(page, 'admin_user', 'AdminPass123!');
  await page.goto('/admin');

  const firstPageUsers = await page.getByTestId('admin-user-row').allTextContents();
  await page.getByRole('button', { name: 'Next' }).click();
  const secondPageUsers = await page.getByTestId('admin-user-row').allTextContents();

  expect(firstPageUsers).not.toEqual(secondPageUsers);
});
```

---

## 21. Playwright Test Cases — Accessibility & Responsive

### TC-PW-A11Y-001 · Login Page ARIA Structure ✅

```typescript
test('login page has correct ARIA roles and labels', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByLabel('Username or Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});
```

---

### TC-PW-A11Y-002 · Sidebar Nav Has aria-label ✅

```typescript
test('sidebar nav has descriptive aria-label', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await expect(page.getByRole('navigation', { name: 'Sidebar navigation' })).toBeVisible();
});
```

---

### TC-PW-A11Y-003 · Bottom Nav Has aria-label ✅

```typescript
test('bottom nav has aria-label on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
});
```

---

### TC-PW-A11Y-004 · Settings Tabs Use Correct ARIA Roles ✅

```typescript
test('settings page tabs have role=tab and role=tabpanel', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/settings');

  await expect(page.getByRole('tab', { name: 'Profile' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Password' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Account' })).toBeVisible();
  await expect(page.getByRole('tabpanel')).toBeVisible();
});
```

---

### TC-PW-A11Y-005 · Mention Dropdown ARIA Autocomplete ✅

```typescript
test('post composer has aria-autocomplete and aria-expanded', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  const composer = page.getByPlaceholder(/what.*mind/i);

  await expect(composer).toHaveAttribute('aria-autocomplete', 'list');
  await expect(composer).toHaveAttribute('aria-expanded', 'false');

  await composer.fill('Hey @seed');
  await expect(composer).toHaveAttribute('aria-expanded', 'true');
});
```

---

### TC-PW-A11Y-006 · Notification Badge ARIA Label ✅

```typescript
test('notification badge has aria-label with unread count', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  const badge = page.getByTestId('notification-badge');
  await expect(badge).toHaveAttribute('aria-label', /unread/i);
});
```

---

### TC-PW-RESP-001 · Mobile — Bottom Nav Visible ✅

```typescript
test('bottom nav is visible on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
});
```

---

### TC-PW-RESP-002 · Mobile — Sidebar Hidden ✅

```typescript
test('sidebar is hidden on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await expect(page.getByRole('navigation', { name: 'Sidebar navigation' })).not.toBeVisible();
});
```

---

### TC-PW-RESP-003 · Dark Mode Toggle ✅

```typescript
test('dark mode toggle switches theme class on html element', async ({ page }) => {
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.getByTestId('dark-mode-toggle').click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.getByTestId('dark-mode-toggle').click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});
```

---

### TC-PW-RESP-004 · Post Composer Usable on Mobile ✅

```typescript
test('post composer is usable on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAs(page, 'seeded_user', 'TestPass123!');
  await page.goto('/feed');

  await expect(page.getByPlaceholder(/what.*mind/i)).toBeVisible();
  await page.getByPlaceholder(/what.*mind/i).fill('Mobile test post');
  await expect(page.getByRole('button', { name: 'Post' })).toBeEnabled();
});
```

---

## 22. Test Data & Fixtures

### 22.1 Seeded Users

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| `seeded_user` | `TestPass123!` | USER | Main test user |
| `admin_user` | `AdminPass123!` | ADMIN | Admin panel tests |
| `user_a` | `TestPass123!` | USER | Social interaction (follower) |
| `user_b` | `TestPass123!` | USER | Social interaction (followed) |
| `delete_me_user` | `TestPass123!` | USER | Account deletion test only |

### 22.2 Seeded Data Relationships

- `user_a` follows `user_b`
- `user_b` has 5 posts (including 1 with `#javascript`, 1 liked by `user_a`)
- `seeded_user` has 3 posts (including 1 with `#coding`)
- `seeded_user` and `user_a` have 1 existing conversation with 3 messages
- `seeded_user` has 1 bookmarked post from `user_b`

### 22.3 Playwright Fixtures File

```typescript
// e2e/fixtures/index.ts
import { test as base, type Page } from '@playwright/test';
import { loginAs, getAuthToken } from '../helpers/auth';

type TestFixtures = {
  authedPage: Page;
  adminPage: Page;
  token: string;
};

export const test = base.extend<TestFixtures>({
  authedPage: async ({ page }, use) => {
    await loginAs(page, 'seeded_user', 'TestPass123!');
    await use(page);
  },
  adminPage: async ({ page }, use) => {
    await loginAs(page, 'admin_user', 'AdminPass123!');
    await use(page);
  },
  token: async ({}, use) => {
    const token = await getAuthToken('seeded_user', 'TestPass123!');
    await use(token);
  },
});

export { expect } from '@playwright/test';
```

### 22.4 Database Seed SQL

```sql
-- Passwords are bcrypt hashes of the plain-text values in the table above
INSERT INTO users (id, username, email, password_hash, display_name, role, created_at) VALUES
  (uuid_generate_v4(), 'seeded_user',   'seeded@test.com',    '$2a$10$...', 'Seeded User',   'USER',  NOW()),
  (uuid_generate_v4(), 'admin_user',    'admin@test.com',     '$2a$10$...', 'Admin User',    'ADMIN', NOW()),
  (uuid_generate_v4(), 'user_a',        'usera@test.com',     '$2a$10$...', 'User A',        'USER',  NOW()),
  (uuid_generate_v4(), 'user_b',        'userb@test.com',     '$2a$10$...', 'User B',        'USER',  NOW()),
  (uuid_generate_v4(), 'delete_me_user','deleteme@test.com',  '$2a$10$...', 'Delete Me',     'USER',  NOW());

-- Follows
INSERT INTO follows (follower_id, following_id)
SELECT u1.id, u2.id FROM users u1, users u2 WHERE u1.username='user_a' AND u2.username='user_b';

-- Posts
INSERT INTO posts (id, content, author_id, created_at) VALUES
  (uuid_generate_v4(), 'Post about #javascript from user_b', (SELECT id FROM users WHERE username='user_b'), NOW() - INTERVAL '2 hours'),
  (uuid_generate_v4(), 'Another post from user_b', (SELECT id FROM users WHERE username='user_b'), NOW() - INTERVAL '1 hour');
```

---

## 23. CI Integration

### 23.1 GitHub Actions — API Tests

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: connecthub_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: testpass
        ports: ['5432:5432']
        options: --health-cmd pg_isready --health-interval 10s --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
        options: --health-cmd "redis-cli ping" --health-interval 10s

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21', distribution: 'temurin' }
      - name: Run backend API tests
        run: ./mvnw test -Dspring.profiles.active=test -Dtest="*IntegrationTest,*ApiTest"
        working-directory: backend
      - name: Publish test results
        uses: dorny/test-reporter@v1
        if: always()
        with:
          name: JUnit Test Results
          path: backend/target/surefire-reports/*.xml
          reporter: java-junit
```

### 23.2 GitHub Actions — Playwright Tests

```yaml
# .github/workflows/playwright.yml
name: Playwright E2E Tests

on: [push, pull_request]

jobs:
  playwright:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: frontend/package-lock.json }
      - name: Install frontend dependencies
        run: npm ci
        working-directory: frontend
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium firefox
        working-directory: frontend
      - name: Start test environment
        run: docker compose -f docker-compose.test.yml up -d
      - name: Wait for services to be healthy
        run: npx wait-on http://localhost:8080/actuator/health http://localhost:3000 --timeout 60000
      - name: Run Playwright tests
        run: npx playwright test --reporter=html,list
        working-directory: frontend
        env:
          CI: true
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30
```

### 23.3 Test Coverage Summary

| Category | Positive | Negative | Security | Total |
|----------|----------|----------|----------|-------|
| API — Auth | 6 | 8 | 1 | 15 |
| API — Users | 5 | 6 | 0 | 11 |
| API — Posts | 9 | 8 | 0 | 17 |
| API — Feed | 5 | 2 | 0 | 7 |
| API — Likes/Comments | 6 | 6 | 0 | 12 |
| API — Follows | 5 | 3 | 0 | 8 |
| API — Search | 4 | 1 | 2 | 7 |
| API — Notifications | 6 | 1 | 0 | 7 |
| API — Messaging | 4 | 3 | 0 | 7 |
| API — Bookmarks | 3 | 1 | 1 | 5 |
| API — Admin | 6 | 5 | 0 | 11 |
| API — Settings | 2 | 2 | 0 | 4 |
| Playwright — Auth | 5 | 4 | 0 | 9 |
| Playwright — Posts | 9 | 3 | 0 | 12 |
| Playwright — Social | 8 | 0 | 0 | 8 |
| Playwright — Search | 5 | 1 | 0 | 6 |
| Playwright — Messaging | 3 | 1 | 0 | 4 |
| Playwright — Settings | 5 | 3 | 0 | 8 |
| Playwright — Admin | 6 | 2 | 0 | 8 |
| Playwright — A11y/Resp | 10 | 0 | 0 | 10 |
| **TOTAL** | **117** | **60** | **4** | **181** |

**Target:** 100% pass rate on all 181 test cases in CI.

---

*Document maintained by: QA & Engineering Teams*  
*Last Updated: February 26, 2026*  
*Platform Version: ConnectHub v1.3.0*  
*Coverage: All APIs (Phase 1–10), Full Playwright E2E Suite*
