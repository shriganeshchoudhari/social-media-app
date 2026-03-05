# Groups Feature — Complete Implementation Plan

**Project:** `F:\social-media-app` (ConnectHub)
**Date:** 2026-03-02
**Status:** 📋 Planning — Groups feature does NOT yet exist in this project
**Package base:** `com.socialmedia`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Project Audit](#2-current-project-audit)
3. [Feature Scope](#3-feature-scope)
4. [Database Schema — New Migrations](#4-database-schema--new-migrations)
5. [Backend Implementation Plan](#5-backend-implementation-plan)
6. [API Specification — Groups](#6-api-specification--groups)
7. [Frontend Implementation Plan](#7-frontend-implementation-plan)
8. [Test Framework & Test Cases](#8-test-framework--test-cases)
9. [Postman Collections to Update](#9-postman-collections-to-update)
10. [Documents to Update](#10-documents-to-update)
11. [Sprint Breakdown](#11-sprint-breakdown)
12. [Risk & Dependency Register](#12-risk--dependency-register)

---

## 1. Executive Summary

Groups allow users to create and participate in topic-based communities. Members can post, comment, and interact within a group context. Admins manage membership, roles, and content. This is a **net-new feature** — nothing currently exists in the codebase for Groups.

### Goals
- Users can create public or private groups
- Members post and interact within a group feed
- Role hierarchy: Creator → Admin → Moderator → Member
- Private groups use invite or join-request workflows
- Group discovery via search and category browsing
- Full test coverage: unit, integration, Postman, Playwright E2E

---

## 2. Current Project Audit

### 2.1 Existing Features (What's Already Built)

| Feature | Backend | Frontend | E2E Tests |
|---------|---------|----------|-----------|
| Auth (JWT) | ✅ | ✅ | ✅ `auth.spec.ts` |
| Users / Profiles | ✅ | ✅ | ✅ `profile.spec.ts` |
| Posts + Feed | ✅ | ✅ | ✅ `posts.spec.ts`, `feed.spec.ts` |
| Comments | ✅ | ✅ | ✅ `comments.spec.ts` |
| Likes | ✅ | ✅ | ✅ `posts.spec.ts` |
| Follow / Unfollow | ✅ | ✅ | ✅ `follow.spec.ts` |
| Bookmarks | ✅ | ✅ | — |
| Messaging (WebSocket) | ✅ | ✅ | — |
| Notifications | ✅ | ✅ | ✅ `notifications.spec.ts` |
| Notification Preferences | ✅ | ✅ | — |
| Search | ✅ | ✅ | ✅ `search.spec.ts` |
| Media Upload | ✅ | ✅ | ✅ `media.spec.ts` |
| AI Assistant (Ollama) | ✅ | ✅ | ✅ `ai.spec.ts` |
| Admin Panel | ✅ | ✅ | — |
| **Groups** | ❌ | ❌ | ❌ |

### 2.2 Relevant Existing Infrastructure to Leverage

| Component | Location | How Groups Will Use It |
|-----------|----------|------------------------|
| `Notification.java` + `NotificationService` | `notification/` | Send group notifications |
| `Post.java` + `PostService` | `post/` | Add `group_id` FK; scope posts to a group |
| `User.java` + `UserRepository` | `user/` | Look up members |
| `MediaService` | `media/` | Group cover image upload |
| `WebSocketNotificationService` | `websocket/` | Real-time group notifications |
| `RateLimitFilter` | `config/` | Apply to group creation endpoint |
| `GlobalExceptionHandler` | `exception/` | Use `ResourceNotFoundException`, `ForbiddenException`, `ConflictException` |
| `BaseIntegrationTest` + `TestDataFactory` | `test/` | Reuse for group integration tests |
| Postman collections | `postman_collections/` | Add `07_Groups.postman_collection.json` |
| Playwright `e2e/` | `e2e/tests/` | Add `groups.spec.ts` |
| Flyway migrations (up to V10) | `db/migration/` | Add V11 onwards for groups |

### 2.3 Current DB Migration State

Latest migration: `V10__notification_preferences.sql`
Next available: **V11**

---

## 3. Feature Scope

### 3.1 MVP (Sprint 1–2)

- ✅ Create / update / delete group
- ✅ Join (public) / Leave group
- ✅ Request to join (private group)
- ✅ Invite users by username (Admin/Moderator)
- ✅ Accept / reject invitation
- ✅ Approve / reject join request (Admin/Moderator)
- ✅ Group feed — paginated posts scoped to group
- ✅ Post within a group
- ✅ Role management: ADMIN / MODERATOR / MEMBER
- ✅ Remove member (Admin/Moderator)
- ✅ Group search

### 3.2 Phase 2 (Sprint 3)

- Group cover image upload (via existing `MediaService`)
- Pin post in group (Admin)
- Group categories and tags for discovery
- Group announcement banner (Admin/Moderator)
- Suggested groups (based on follows / interests)
- Group notification preferences (per-group mute)

### 3.3 Out of Scope (for now)

- Group events / calendar
- Invite link / shareable token
- Group analytics dashboard
- Group chat (separate from DM messaging)

---

## 4. Database Schema — New Migrations

### 4.1 `V11__groups_schema.sql`

```sql
-- ============================================================
-- Groups core tables
-- ============================================================

CREATE TABLE groups (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    description VARCHAR(500),
    rules       VARCHAR(1000),
    privacy     VARCHAR(20)   NOT NULL DEFAULT 'PUBLIC'
                    CHECK (privacy IN ('PUBLIC', 'PRIVATE')),
    creator_id  BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_image_url VARCHAR(500),
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_groups_creator    ON groups(creator_id);
CREATE INDEX idx_groups_privacy    ON groups(privacy);
CREATE INDEX idx_groups_created_at ON groups(created_at DESC);

-- Full-text search index on name + description
CREATE INDEX idx_groups_name_fts   ON groups USING gin(to_tsvector('english', name || ' ' || COALESCE(description,'')));


-- ============================================================
-- Group Members  (roles: ADMIN, MODERATOR, MEMBER)
-- ============================================================

CREATE TABLE group_members (
    id         BIGSERIAL PRIMARY KEY,
    group_id   BIGINT      NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id    BIGINT      NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL DEFAULT 'MEMBER'
                   CHECK (role IN ('ADMIN', 'MODERATOR', 'MEMBER')),
    joined_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, user_id)
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user  ON group_members(user_id);
CREATE INDEX idx_group_members_role  ON group_members(group_id, role);


-- ============================================================
-- Group Invitations  (covers both INVITE and JOIN_REQUEST flows)
-- ============================================================

CREATE TABLE group_invitations (
    id          BIGSERIAL PRIMARY KEY,
    group_id    BIGINT      NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    inviter_id  BIGINT      REFERENCES users(id) ON DELETE SET NULL,  -- NULL for self-initiated join requests
    invitee_id  BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(20) NOT NULL CHECK (type IN ('INVITE', 'JOIN_REQUEST')),
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, invitee_id, type, status)  -- prevent duplicate pending invites
);

CREATE INDEX idx_group_invitations_group      ON group_invitations(group_id);
CREATE INDEX idx_group_invitations_invitee    ON group_invitations(invitee_id, status);
CREATE INDEX idx_group_invitations_type_status ON group_invitations(type, status);


-- ============================================================
-- Extend posts table: optional group scope
-- ============================================================

ALTER TABLE posts ADD COLUMN group_id BIGINT REFERENCES groups(id) ON DELETE SET NULL;
CREATE INDEX idx_posts_group_id ON posts(group_id, created_at DESC);


-- ============================================================
-- Extend notifications: add new types for groups
-- (notification type is a VARCHAR — no enum change needed,
--  just new string values in application layer)
-- ============================================================

-- New types that will be used:
--   GROUP_INVITE, GROUP_JOIN_REQUEST, GROUP_JOIN_APPROVED, GROUP_JOIN_REJECTED,
--   GROUP_NEW_POST, GROUP_MEMBER_JOINED
-- No schema change needed if notification.type is already VARCHAR.
```

### 4.2 `V12__groups_phase2.sql` *(Sprint 3 — Phase 2 fields)*

```sql
-- Category and tags for discovery
ALTER TABLE groups ADD COLUMN category     VARCHAR(50);
ALTER TABLE groups ADD COLUMN tags         VARCHAR(500);  -- comma-separated
ALTER TABLE groups ADD COLUMN announcement TEXT;
ALTER TABLE groups ADD COLUMN announcement_updated_at TIMESTAMP;
ALTER TABLE groups ADD COLUMN pinned_post_id BIGINT REFERENCES posts(id) ON DELETE SET NULL;

CREATE INDEX idx_groups_category ON groups(category);

-- Per-group notification preferences
CREATE TABLE group_notification_prefs (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    group_id   BIGINT    NOT NULL REFERENCES groups(id)  ON DELETE CASCADE,
    muted      BOOLEAN   NOT NULL DEFAULT FALSE,
    muted_until TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, group_id)
);

CREATE INDEX idx_group_notif_pref_user ON group_notification_prefs(user_id);
```

### 4.3 Updated ER Diagram

```
USERS (1) ──< (M) GROUP_MEMBERS ──> GROUPS
                   (ADMIN / MODERATOR / MEMBER)

USERS (1) ──< (M) GROUP_INVITATIONS (type: INVITE | JOIN_REQUEST)
GROUPS (1) ──< (M) GROUP_INVITATIONS

GROUPS (1) ──< (M) POSTS (posts.group_id FK — nullable)

GROUPS ──< GROUP_NOTIFICATION_PREFS ──> USERS  [Phase 2]
GROUPS — pinned_post_id → POSTS                [Phase 2]
```

---

## 5. Backend Implementation Plan

### 5.1 New Package Structure

```
backend/src/main/java/com/socialmedia/group/
├── Group.java                            Entity
├── GroupMember.java                      Entity (roles: ADMIN, MODERATOR, MEMBER)
├── GroupInvitation.java                  Entity (types: INVITE, JOIN_REQUEST)
├── GroupRepository.java                  JPA repository
├── GroupMemberRepository.java            JPA repository
├── GroupInvitationRepository.java        JPA repository
├── GroupService.java                     Business logic
├── GroupController.java                  REST endpoints
└── dto/
    ├── CreateGroupRequest.java
    ├── UpdateGroupRequest.java
    ├── GroupResponse.java
    ├── GroupMemberResponse.java
    ├── InviteUsersRequest.java
    └── GroupInvitationResponse.java
```

*(Phase 2 additions)*
```
├── GroupNotifPref.java
├── GroupNotifPrefRepository.java
└── dto/
    ├── GroupAnnouncementRequest.java
    └── GroupNotifPrefRequest.java
```

### 5.2 Entity Designs

#### `Group.java`
```java
@Entity @Table(name = "groups")
public class Group {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String rules;
    @Enumerated(EnumType.STRING)
    private GroupPrivacy privacy = GroupPrivacy.PUBLIC;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;
    private String coverImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum GroupPrivacy { PUBLIC, PRIVATE }
}
```

#### `GroupMember.java`
```java
@Entity @Table(name = "group_members",
    uniqueConstraints = @UniqueConstraint(columnNames = {"group_id", "user_id"}))
public class GroupMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "group_id")
    private Group group;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id")
    private User user;
    @Enumerated(EnumType.STRING)
    private GroupRole role = GroupRole.MEMBER;
    private LocalDateTime joinedAt;

    public enum GroupRole { ADMIN, MODERATOR, MEMBER }
}
```

#### `GroupInvitation.java`
```java
@Entity @Table(name = "group_invitations")
public class GroupInvitation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "group_id")
    private Group group;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "inviter_id")
    private User inviter; // null for self-initiated join requests
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "invitee_id")
    private User invitee;
    @Enumerated(EnumType.STRING)
    private InvitationType type;
    @Enumerated(EnumType.STRING)
    private InvitationStatus status = InvitationStatus.PENDING;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum InvitationType  { INVITE, JOIN_REQUEST }
    public enum InvitationStatus { PENDING, ACCEPTED, REJECTED }
}
```

### 5.3 Modifications to Existing Files

#### `Post.java` — Add Group FK
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "group_id")
private Group group;  // nullable — null = personal/public post
```

#### `PostRepository.java` — Add Query
```java
Page<Post> findByGroupOrderByCreatedAtDesc(Group group, Pageable pageable);
```

#### `PostController.java` / `PostService.java` — Group Post Creation
When `groupId` is provided in `CreatePostRequest`:
- Verify caller is a member of the group
- Set `post.group = group`
- Trigger `GROUP_NEW_POST` notification to group members

#### `CreatePostRequest.java` — Add Optional Field
```java
private Long groupId; // optional — if set, post goes to this group
```

#### `Notification.java` / `NotificationService.java`
Add handling for new notification types:
`GROUP_INVITE`, `GROUP_JOIN_REQUEST`, `GROUP_JOIN_APPROVED`, `GROUP_JOIN_REJECTED`, `GROUP_NEW_POST`, `GROUP_MEMBER_JOINED`

### 5.4 Role-Based Permission Matrix

| Action | MEMBER | MODERATOR | ADMIN | Creator |
|--------|:------:|:---------:|:-----:|:-------:|
| View public group | ✅ | ✅ | ✅ | ✅ |
| View private group | members only | ✅ | ✅ | ✅ |
| Post in group | ✅ | ✅ | ✅ | ✅ |
| Comment / Like in group | ✅ | ✅ | ✅ | ✅ |
| Invite users | ❌ | ✅ | ✅ | ✅ |
| View pending join requests | ❌ | ✅ | ✅ | ✅ |
| Approve / reject requests | ❌ | ✅ | ✅ | ✅ |
| Remove member | ❌ | MEMBER only | ✅ | ✅ |
| Change member role | ❌ | ❌ | ✅ | ✅ |
| Update group settings | ❌ | ❌ | ✅ | ✅ |
| Set announcement | ❌ | ✅ | ✅ | ✅ |
| Pin post | ❌ | ✅ | ✅ | ✅ |
| Upload cover image | ❌ | ❌ | ✅ | ✅ |
| Delete group | ❌ | ❌ | ❌ | ✅ |

---

## 6. API Specification — Groups

### 6.1 Base URL
```
/api/groups
```

### 6.2 Full Endpoint Reference

#### Group CRUD

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/groups` | Any authenticated | Create a new group |
| `GET` | `/api/groups?page=&size=&q=` | Any authenticated | List / search all groups (paginated) |
| `GET` | `/api/groups/mine` | Any authenticated | My groups (member + created) |
| `GET` | `/api/groups/{id}` | Any authenticated | Get group details |
| `PUT` | `/api/groups/{id}` | ADMIN | Update group |
| `DELETE` | `/api/groups/{id}` | Creator only | Delete group |
| `POST` | `/api/groups/{id}/cover` | ADMIN | Upload cover image |

#### Membership

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/groups/{id}/join` | Any authenticated | Join public group |
| `DELETE` | `/api/groups/{id}/leave` | Member | Leave group |
| `GET` | `/api/groups/{id}/members?page=&size=` | Member (or public) | List members |
| `DELETE` | `/api/groups/{id}/members/{userId}` | ADMIN / MODERATOR | Remove member |
| `PATCH` | `/api/groups/{id}/members/{userId}/role` | ADMIN | Change member role |

#### Invitations & Requests

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/groups/{id}/invite` | ADMIN / MODERATOR | Invite users by username list |
| `POST` | `/api/groups/{id}/request-join` | Any authenticated | Request to join private group |
| `GET` | `/api/groups/{id}/requests` | ADMIN / MODERATOR | View pending join requests |
| `POST` | `/api/groups/requests/{requestId}/approve` | ADMIN / MODERATOR | Approve join request |
| `POST` | `/api/groups/requests/{requestId}/reject` | ADMIN / MODERATOR | Reject join request |
| `GET` | `/api/groups/invitations/pending` | Any authenticated | My pending invitations |
| `POST` | `/api/groups/invitations/{id}/accept` | Invitee | Accept invitation |
| `POST` | `/api/groups/invitations/{id}/reject` | Invitee | Reject invitation |

#### Posts

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/groups/{id}/posts?page=&size=` | Member (or public for public group) | Paginated group feed |
| `POST` | `/api/posts` | Member | Create post (pass `groupId` in body) |

#### Phase 2 Endpoints

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| `PUT` | `/api/groups/{id}/announcement` | ADMIN / MODERATOR | Set announcement text |
| `PUT` | `/api/groups/{id}/pin/{postId}` | ADMIN / MODERATOR | Pin a post |
| `DELETE` | `/api/groups/{id}/pin` | ADMIN / MODERATOR | Unpin |
| `PUT` | `/api/groups/{id}/notifications` | Member | Mute/unmute this group's notifications |

### 6.3 Request / Response Schemas

#### `POST /api/groups` — Create Group
```json
{
  "name": "Spring Boot Devs",
  "description": "A community for Spring enthusiasts",
  "rules": "Be respectful. Stay on-topic.",
  "privacy": "PUBLIC"
}
```

#### `GroupResponse`
```json
{
  "id": 1,
  "name": "Spring Boot Devs",
  "description": "A community for Spring enthusiasts",
  "rules": "Be respectful. Stay on-topic.",
  "privacy": "PUBLIC",
  "creatorUsername": "alice",
  "memberCount": 14,
  "isMember": true,
  "myRole": "ADMIN",
  "coverImageUrl": "/api/media/group_cover_1.png",
  "createdAt": "2026-03-01T09:00:00"
}
```

#### `GroupMemberResponse`
```json
{
  "id": 7,
  "userId": 3,
  "username": "bob",
  "displayName": "Bob Smith",
  "avatarUrl": "/api/media/bob.png",
  "role": "MODERATOR",
  "joinedAt": "2026-03-01T10:00:00"
}
```

#### `POST /api/groups/{id}/invite`
```json
{ "usernames": ["bob", "charlie", "diana"] }
```

#### `GroupInvitationResponse`
```json
{
  "id": 5,
  "groupId": 1,
  "groupName": "Spring Boot Devs",
  "inviterUsername": "alice",
  "type": "INVITE",
  "status": "PENDING",
  "createdAt": "2026-03-01T11:00:00"
}
```

### 6.4 Error Codes

| HTTP | Code | Scenario |
|------|------|---------|
| 400 | `ALREADY_MEMBER` | Join/invite — user already in group |
| 400 | `USE_JOIN_DIRECTLY` | Sending join request to a public group |
| 400 | `REQUEST_ALREADY_PENDING` | Duplicate join request |
| 400 | `INVITATION_NOT_PENDING` | Accepting non-pending invitation |
| 403 | `NOT_A_MEMBER` | Private group access without membership |
| 403 | `INSUFFICIENT_ROLE` | Action requires higher role |
| 403 | `CANNOT_REMOVE_CREATOR` | Trying to remove group creator |
| 403 | `CREATOR_ONLY` | Deleting group requires creator |
| 404 | `GROUP_NOT_FOUND` | Group ID not found |
| 404 | `INVITATION_NOT_FOUND` | Invitation ID not found |
| 409 | `GROUP_NAME_TAKEN` | Duplicate group name (if enforced) |

---

## 7. Frontend Implementation Plan

### 7.1 New Pages

| Page | Route | Description |
|------|-------|-------------|
| `GroupsPage.jsx` | `/groups` | Discovery: search bar, category filters, public group cards, "My Groups" section |
| `GroupDetailPage.jsx` | `/groups/:id` | Group feed + tabs: Feed / Members / Events? / Requests (admin) |
| `GroupSettingsPage.jsx` | `/groups/:id/settings` | Admin settings: name, rules, cover image, danger zone |

### 7.2 New Components

| Component | Location | Description |
|-----------|----------|-------------|
| `GroupCard.jsx` | `components/group/` | Group card for discovery list (name, cover, member count, join button) |
| `GroupCreationModal.jsx` | `components/group/` | Modal: name, description, rules, privacy |
| `GroupHeader.jsx` | `components/group/` | Cover image, group name, member count, join/leave button, admin menu |
| `GroupFeed.jsx` | `components/group/` | Paginated post list scoped to group (reuses `PostCard`) |
| `GroupMembersList.jsx` | `components/group/` | Members tab: avatar, username, role badge, admin actions |
| `GroupInviteModal.jsx` | `components/group/` | Invite by username with chips |
| `GroupInvitationsList.jsx` | `components/group/` | Pending invitations with Accept / Decline buttons |
| `GroupJoinRequestsList.jsx` | `components/group/` | Admin: pending join requests with Approve / Reject |
| `GroupAnnouncementBanner.jsx` | `components/group/` | Sticky notice at top of group feed (Phase 2) |

### 7.3 New API Client File

**`frontend/src/api/groups.js`**
```javascript
import client from './client';

export const groupsApi = {
  // CRUD
  createGroup:   (data)            => client.post('/groups', data),
  getGroups:     (params)          => client.get('/groups', { params }),
  getMyGroups:   ()                => client.get('/groups/mine'),
  getGroup:      (id)              => client.get(`/groups/${id}`),
  updateGroup:   (id, data)        => client.put(`/groups/${id}`, data),
  deleteGroup:   (id)              => client.delete(`/groups/${id}`),
  uploadCover:   (id, formData)    => client.post(`/groups/${id}/cover`, formData),

  // Membership
  joinGroup:     (id)              => client.post(`/groups/${id}/join`),
  leaveGroup:    (id)              => client.delete(`/groups/${id}/leave`),
  getMembers:    (id, params)      => client.get(`/groups/${id}/members`, { params }),
  removeMember:  (id, userId)      => client.delete(`/groups/${id}/members/${userId}`),
  changeRole:    (id, userId, role)=> client.patch(`/groups/${id}/members/${userId}/role`, { role }),

  // Invitations
  inviteUsers:   (id, usernames)   => client.post(`/groups/${id}/invite`, { usernames }),
  requestJoin:   (id)              => client.post(`/groups/${id}/request-join`),
  getRequests:   (id)              => client.get(`/groups/${id}/requests`),
  approveRequest:(reqId)           => client.post(`/groups/requests/${reqId}/approve`),
  rejectRequest: (reqId)           => client.post(`/groups/requests/${reqId}/reject`),
  getMyInvites:  ()                => client.get('/groups/invitations/pending'),
  acceptInvite:  (invId)           => client.post(`/groups/invitations/${invId}/accept`),
  rejectInvite:  (invId)           => client.post(`/groups/invitations/${invId}/reject`),

  // Posts
  getGroupPosts: (id, params)      => client.get(`/groups/${id}/posts`, { params }),

  // Phase 2
  setAnnouncement:(id, text)       => client.put(`/groups/${id}/announcement`, { text }),
  pinPost:       (id, postId)      => client.put(`/groups/${id}/pin/${postId}`),
  unpinPost:     (id)              => client.delete(`/groups/${id}/pin`),
  setNotifPref:  (id, muted)       => client.put(`/groups/${id}/notifications`, { muted }),
};
```

### 7.4 Redux Store — New Slice

**`frontend/src/store/groupsSlice.js`**

State shape:
```javascript
{
  groups: [],          // discovery list
  myGroups: [],        // groups I'm in
  currentGroup: null,  // detailed view
  members: [],
  invitations: [],     // my pending invitations
  requests: [],        // admin: pending join requests
  loading: false,
  error: null,
  pagination: { page: 0, totalPages: 0 }
}
```

Key thunks: `fetchGroups`, `fetchMyGroups`, `createGroup`, `joinGroup`, `leaveGroup`, `inviteUsers`, `acceptInvitation`, `rejectInvitation`, `fetchRequests`, `approveRequest`, `rejectRequest`

### 7.5 Navigation & Routing Updates

- Add `/groups` and `/groups/:id` and `/groups/:id/settings` to `App.jsx`
- Add Groups link to `Sidebar.jsx` and `BottomNav.jsx`
- Add Groups notification badge if pending invitations exist

---

## 8. Test Framework & Test Cases

### 8.1 Test Stack Summary

| Layer | Framework | Config |
|-------|-----------|--------|
| Backend Unit | JUnit 5 + Mockito | `src/test/java/` |
| Backend Integration | Spring Boot Test + H2 (via `BaseIntegrationTest`) | `application-test.properties` |
| API Tests | Postman / Newman | `postman_collections/07_Groups.postman_collection.json` |
| HTTP API Tests | REST Client `.http` | `API Test/api.http` (extend) |
| E2E | Playwright TypeScript | `e2e/tests/groups.spec.ts` |

### 8.2 Backend Unit Tests — `GroupServiceTest.java`

**Path:** `backend/src/test/java/com/socialmedia/group/GroupServiceTest.java`

```
TC-GS-001  createGroup — success → creator auto-added as ADMIN member
TC-GS-002  createGroup — blank name → throws validation error
TC-GS-003  joinGroup — PUBLIC group — non-member → joins as MEMBER
TC-GS-004  joinGroup — PRIVATE group → throws ForbiddenException
TC-GS-005  joinGroup — already a member → throws ConflictException
TC-GS-006  leaveGroup — regular MEMBER → removes from group
TC-GS-007  leaveGroup — last ADMIN → auto-promotes next MODERATOR (or oldest MEMBER) to ADMIN
TC-GS-008  leaveGroup — not a member → throws ResourceNotFoundException
TC-GS-009  inviteUsers — by ADMIN to PUBLIC group → creates INVITE + notification sent
TC-GS-010  inviteUsers — by ADMIN to PRIVATE group → creates INVITE + notification sent
TC-GS-011  inviteUsers — by MEMBER → throws ForbiddenException
TC-GS-012  inviteUsers — user already a member in list → skips that user silently
TC-GS-013  inviteUsers — already a PENDING invite → resends notification, no duplicate record
TC-GS-014  requestToJoin — PRIVATE group — not yet member → creates JOIN_REQUEST
TC-GS-015  requestToJoin — PUBLIC group → throws IllegalStateException (use join directly)
TC-GS-016  requestToJoin — duplicate pending request → throws ConflictException
TC-GS-017  requestToJoin — already a member → throws ConflictException
TC-GS-018  approveJoinRequest — by ADMIN → user added as MEMBER + approval notification sent
TC-GS-019  approveJoinRequest — by MODERATOR → user added as MEMBER + approval notification sent
TC-GS-020  approveJoinRequest — by MEMBER → throws ForbiddenException
TC-GS-021  approveJoinRequest — request not found → throws ResourceNotFoundException
TC-GS-022  rejectJoinRequest — by ADMIN → status set to REJECTED
TC-GS-023  acceptInvitation — valid PENDING invite → user added as MEMBER
TC-GS-024  acceptInvitation — wrong user (not the invitee) → throws ForbiddenException
TC-GS-025  acceptInvitation — already ACCEPTED/REJECTED → throws IllegalStateException
TC-GS-026  rejectInvitation — valid → sets status to REJECTED
TC-GS-027  getMyInvitations — returns only PENDING invitations for caller
TC-GS-028  updateGroup — by ADMIN → updates name/description/rules/privacy
TC-GS-029  updateGroup — by MEMBER → throws ForbiddenException
TC-GS-030  deleteGroup — by creator → cascades delete members, invitations
TC-GS-031  deleteGroup — by ADMIN non-creator → throws ForbiddenException
TC-GS-032  removeMember — ADMIN removes MEMBER → success
TC-GS-033  removeMember — ADMIN removes MODERATOR → success
TC-GS-034  removeMember — MODERATOR removes MEMBER → success
TC-GS-035  removeMember — MODERATOR tries to remove ADMIN → throws ForbiddenException
TC-GS-036  removeMember — tries to remove group creator → throws ForbiddenException
TC-GS-037  removeMember — by MEMBER → throws ForbiddenException
TC-GS-038  changeRole — ADMIN promotes MEMBER → MODERATOR
TC-GS-039  changeRole — ADMIN promotes MODERATOR → ADMIN
TC-GS-040  changeRole — MODERATOR tries to change role → throws ForbiddenException
TC-GS-041  getGroupFeed — returns paginated posts for public group
TC-GS-042  getGroupFeed — returns paginated posts for PRIVATE group when caller is member
TC-GS-043  getGroupFeed — PRIVATE group, non-member → throws ForbiddenException
TC-GS-044  getMembers — PUBLIC group — any user → returns all members with roles
TC-GS-045  getMembers — PRIVATE group — non-member → throws ForbiddenException
TC-GS-046  getPendingRequests — ADMIN → returns all PENDING JOIN_REQUESTs for group
TC-GS-047  getPendingRequests — MEMBER → throws ForbiddenException
TC-GS-048  searchGroups — by name substring → returns matching groups
TC-GS-049  getMyGroups — returns only groups where caller is a member
TC-GS-050  getAllGroups — returns all groups with isMember flag set correctly per viewer
```

### 8.3 Backend Integration Tests — `GroupControllerIntTest.java`

**Path:** `backend/src/test/java/com/socialmedia/group/GroupControllerIntTest.java`

Extends `BaseIntegrationTest`, uses `TestDataFactory` to set up users.

```
TC-GCI-001  POST /api/groups — 201 Created, response contains id, name, isMember=true, myRole=ADMIN
TC-GCI-002  POST /api/groups — 400 Bad Request when name is blank
TC-GCI-003  POST /api/groups — 401 Unauthorized when no JWT
TC-GCI-004  GET  /api/groups — 200 paginated list
TC-GCI-005  GET  /api/groups?q=spring — 200 filtered results
TC-GCI-006  GET  /api/groups/mine — 200 returns only groups caller is member of
TC-GCI-007  GET  /api/groups/{id} — 200 with correct isMember / myRole flags
TC-GCI-008  GET  /api/groups/{nonExistentId} — 404 Not Found
TC-GCI-009  PUT  /api/groups/{id} — 200 for ADMIN caller
TC-GCI-010  PUT  /api/groups/{id} — 403 for MEMBER caller
TC-GCI-011  DELETE /api/groups/{id} — 200 for creator
TC-GCI-012  DELETE /api/groups/{id} — 403 for non-creator ADMIN
TC-GCI-013  POST /api/groups/{id}/join — 200 for PUBLIC group
TC-GCI-014  POST /api/groups/{id}/join — 403 for PRIVATE group
TC-GCI-015  POST /api/groups/{id}/join — 409 when already a member
TC-GCI-016  DELETE /api/groups/{id}/leave — 200 for existing member
TC-GCI-017  GET  /api/groups/{id}/members — 200 for public group
TC-GCI-018  GET  /api/groups/{id}/members — 403 for private group, non-member
TC-GCI-019  POST /api/groups/{id}/invite — 200 for ADMIN caller
TC-GCI-020  POST /api/groups/{id}/invite — 403 for MEMBER caller
TC-GCI-021  POST /api/groups/{id}/request-join — 200 for PRIVATE group
TC-GCI-022  POST /api/groups/{id}/request-join — 400 for PUBLIC group
TC-GCI-023  GET  /api/groups/{id}/requests — 200 for ADMIN
TC-GCI-024  GET  /api/groups/{id}/requests — 403 for MEMBER
TC-GCI-025  POST /api/groups/requests/{id}/approve — 200 for ADMIN
TC-GCI-026  POST /api/groups/requests/{id}/reject — 200 for ADMIN
TC-GCI-027  GET  /api/groups/invitations/pending — 200 returns pending invites for caller
TC-GCI-028  POST /api/groups/invitations/{id}/accept — 200 — user becomes member
TC-GCI-029  POST /api/groups/invitations/{id}/reject — 200
TC-GCI-030  GET  /api/groups/{id}/posts — 200 paginated group posts
TC-GCI-031  DELETE /api/groups/{id}/members/{userId} — 200 for ADMIN
TC-GCI-032  DELETE /api/groups/{id}/members/{userId} — 403 for MEMBER
TC-GCI-033  PATCH  /api/groups/{id}/members/{userId}/role — 200 for ADMIN
TC-GCI-034  PATCH  /api/groups/{id}/members/{userId}/role — 403 for non-ADMIN
TC-GCI-035  POST /api/posts with groupId — 200, post appears in group feed
TC-GCI-036  POST /api/posts with groupId — non-member → 403
TC-GCI-037  POST /api/groups/{id}/cover — 200 for ADMIN, coverImageUrl updated
```

### 8.4 Playwright E2E Tests — `groups.spec.ts`

**Path:** `e2e/tests/groups.spec.ts`

Follows existing Playwright conventions in the project (TypeScript, Page Object Model in `e2e/pages/`).

**New Page Object:** `e2e/pages/GroupsPage.ts`

```
TC-E2E-G-001  Create public group → redirects to group detail → group visible in /groups list
TC-E2E-G-002  Second user joins public group → member count increments → isMember state updates
TC-E2E-G-003  Create post inside a group → post appears in group feed (not global feed)
TC-E2E-G-004  Leave group → isMember = false → group feed no longer accessible
TC-E2E-G-005  Create private group → second user attempts direct join → 403 error shown
TC-E2E-G-006  Private group → user2 sends join request → admin (user1) sees it in Requests tab → approves → user2 becomes member
TC-E2E-G-007  Admin invites user2 → user2 sees invitation in pending list → accepts → user2 is member
TC-E2E-G-008  Admin invites user2 → user2 declines → user2 not added to group
TC-E2E-G-009  Notification created on GROUP_INVITE → clicking notification takes user to group detail
TC-E2E-G-010  Admin promotes member to MODERATOR → role badge updates in members list
TC-E2E-G-011  Admin removes member → member no longer appears in members list
TC-E2E-G-012  Search for group by name → filtered results shown
TC-E2E-G-013  Admin updates group description → changes persisted and visible to members
TC-E2E-G-014  Non-admin accesses /groups/:id/settings → redirected or forbidden message shown
TC-E2E-G-015  Creator deletes group → group removed → redirect to /groups list
TC-E2E-G-016  Last admin leaves group → next member auto-promoted to admin
TC-E2E-G-017  Admin uploads cover image → image displayed in group header
```

### 8.5 Postman Test Cases — `07_Groups.postman_collection.json`

```
PM-G-001   Setup: register User A (admin), User B, User C
PM-G-002   User A: POST /api/groups — create public group → save {{groupId}}
PM-G-003   User B: POST /api/groups/{{groupId}}/join → 200
PM-G-004   GET /api/groups/{{groupId}} → verify memberCount = 2, privacy = PUBLIC
PM-G-005   User A: POST /api/groups/{{groupId}}/invite body: {usernames: ["{{userC}}"]} → 200
PM-G-006   User C: GET /api/groups/invitations/pending → contains invite for group
PM-G-007   User C: POST /api/groups/invitations/{{inviteId}}/accept → 200
PM-G-008   GET /api/groups/{{groupId}}/members → 3 members
PM-G-009   User A: POST /api/posts body: {content:"hello group", groupId:{{groupId}}} → 201
PM-G-010   GET /api/groups/{{groupId}}/posts → contains new post
PM-G-011   User A: PATCH /api/groups/{{groupId}}/members/{{userBId}}/role body: {role:"MODERATOR"} → 200
PM-G-012   GET /api/groups/{{groupId}}/members → User B role = MODERATOR
PM-G-013   User A: DELETE /api/groups/{{groupId}}/members/{{userCId}} → 200
PM-G-014   GET /api/groups/{{groupId}}/members → 2 members (User C removed)
PM-G-015   Setup: Create PRIVATE group → save {{privateGroupId}}
PM-G-016   User B: POST /api/groups/{{privateGroupId}}/join → 403
PM-G-017   User B: POST /api/groups/{{privateGroupId}}/request-join → 200
PM-G-018   User A: GET /api/groups/{{privateGroupId}}/requests → pending request visible
PM-G-019   User A: POST /api/groups/requests/{{requestId}}/approve → 200
PM-G-020   GET /api/groups/{{privateGroupId}}/members → User B is now member
PM-G-021   User B: DELETE /api/groups/{{groupId}}/leave → 200
PM-G-022   User B (non-creator): DELETE /api/groups/{{groupId}} → 403
PM-G-023   User A (creator): DELETE /api/groups/{{groupId}} → 200
PM-G-024   GET /api/groups/{{groupId}} → 404
```

---

## 9. Postman Collections to Update

Add new collection file:

| File | Action |
|------|--------|
| `postman_collections/07_Groups.postman_collection.json` | **Create new** — all PM-G-xxx test cases above |
| `postman_collections/README.md` | Add Groups collection to table of contents |
| `postman_collections/03_Posts_and_Feed.postman_collection.json` | **Update** — add `groupId` field to post creation tests |
| `postman_collections/05_Messaging_and_Notifications.postman_collection.json` | **Update** — add GROUP_INVITE, GROUP_JOIN_REQUEST, GROUP_JOIN_APPROVED notification types |

Also update `.postman/config.json` if it lists collection files explicitly.

---

## 10. Documents to Update

| Document | Changes Required |
|----------|-----------------|
| `docs/social_media_prd.md` | Move Groups from Phase 2 to Phase 1 scope; add sub-features list |
| `docs/api_documentation.md` | Add full Groups section (all endpoints, schemas, error codes from Section 6) |
| `docs/database_schema_doc.md` | Add `groups`, `group_members`, `group_invitations` tables; update ER diagram; document V11/V12 migrations; note `posts.group_id` FK addition |
| `docs/tech_design_doc.md` | Add Groups domain design; MODERATOR role hierarchy; notification flow for group events; caching strategy for group data |
| `docs/Test_Plan_and_Test_Cases.md` | Add Groups test module; add all TC-GS-xxx, TC-GCI-xxx test cases |
| `docs/E2E_Test_Cases.md` | Add all TC-E2E-G-001 through TC-E2E-G-017 |
| `docs/E2E_Test_Cases_-_API_and_Playwright.md` | Add Groups API section + Playwright spec reference |
| `docs/UI_UX_Design_Specifications.md` | Add Groups pages wireframe descriptions: GroupsPage, GroupDetailPage, GroupSettingsPage; add GroupCard, GroupHeader, GroupInviteModal specs |
| `docs/openapi.yaml` | Add `/groups/**` paths to OpenAPI spec |
| `docs/ONBOARDING.md` | Add Groups feature to feature overview section |
| `docs/Security_Compliance_Document.md` | Document role-based access control for groups; private group data isolation |

---

## 11. Sprint Breakdown

### Sprint 1 — Core Groups CRUD + Join/Leave (1 week)

| # | Task | Type | Priority |
|---|------|------|----------|
| 1 | Write `V11__groups_schema.sql` migration | DB | 🔴 HIGH |
| 2 | Create `Group.java`, `GroupMember.java`, `GroupInvitation.java` entities | Backend | 🔴 HIGH |
| 3 | Create `GroupRepository`, `GroupMemberRepository`, `GroupInvitationRepository` | Backend | 🔴 HIGH |
| 4 | Create `GroupService` — createGroup, joinGroup, leaveGroup, getAllGroups, getMyGroups, searchGroups | Backend | 🔴 HIGH |
| 5 | Create `GroupController` — CRUD + join/leave + members endpoints | Backend | 🔴 HIGH |
| 6 | Extend `Post.java` + `PostService` with `groupId` support | Backend | 🔴 HIGH |
| 7 | Create DTOs (Request / Response) | Backend | 🔴 HIGH |
| 8 | Unit tests TC-GS-001 to TC-GS-020 (`GroupServiceTest`) | Backend | 🔴 HIGH |
| 9 | Integration tests TC-GCI-001 to TC-GCI-018 (`GroupControllerIntTest`) | Backend | 🟡 MEDIUM |
| 10 | `GroupsPage.jsx` + `GroupCard.jsx` + `GroupCreationModal.jsx` | Frontend | 🔴 HIGH |
| 11 | `groupsSlice.js` + `groups.js` API client (CRUD + join/leave) | Frontend | 🔴 HIGH |
| 12 | Add `/groups` route and sidebar link | Frontend | 🔴 HIGH |

### Sprint 2 — Invitations, Roles, Feed (1 week)

| # | Task | Type | Priority |
|---|------|------|----------|
| 1 | GroupService — inviteUsers, requestToJoin, approveRequest, rejectRequest, acceptInvitation, rejectInvitation | Backend | 🔴 HIGH |
| 2 | GroupController — all invitation + request endpoints | Backend | 🔴 HIGH |
| 3 | GroupService — changeRole, removeMember | Backend | 🔴 HIGH |
| 4 | GroupService — getGroupFeed (paginated) | Backend | 🔴 HIGH |
| 5 | Unit tests TC-GS-021 to TC-GS-050 | Backend | 🔴 HIGH |
| 6 | Integration tests TC-GCI-019 to TC-GCI-037 | Backend | 🟡 MEDIUM |
| 7 | `GroupDetailPage.jsx` + `GroupFeed.jsx` + `GroupMembersList.jsx` | Frontend | 🔴 HIGH |
| 8 | `GroupInviteModal.jsx` + `GroupInvitationsList.jsx` + `GroupJoinRequestsList.jsx` | Frontend | 🔴 HIGH |
| 9 | Add pending invitations count badge to navbar | Frontend | 🟡 MEDIUM |
| 10 | Playwright E2E TC-E2E-G-001 to TC-E2E-G-012 (`groups.spec.ts`) | QA | 🟡 MEDIUM |
| 11 | Postman collection `07_Groups` PM-G-001 to PM-G-024 | QA | 🟡 MEDIUM |

### Sprint 3 — Phase 2 + Docs + Full Coverage (1 week)

| # | Task | Type | Priority |
|---|------|------|----------|
| 1 | `V12__groups_phase2.sql` migration | DB | 🟡 MEDIUM |
| 2 | Cover image upload using existing `MediaService` | Backend | 🟡 MEDIUM |
| 3 | Announcement + pin post endpoints | Backend | 🟡 MEDIUM |
| 4 | Group notification preferences | Backend | 🟢 LOW |
| 5 | `GroupSettingsPage.jsx` + `GroupHeader.jsx` | Frontend | 🟡 MEDIUM |
| 6 | `GroupAnnouncementBanner.jsx` + cover image upload UI | Frontend | 🟡 MEDIUM |
| 7 | E2E TC-E2E-G-013 to TC-E2E-G-017 | QA | 🟡 MEDIUM |
| 8 | Update all docs listed in Section 10 | All | 🟡 MEDIUM |
| 9 | Update Postman collections listed in Section 9 | QA | 🟡 MEDIUM |
| 10 | Update `docs/openapi.yaml` with Groups paths | Backend | 🟡 MEDIUM |

---

## 12. Risk & Dependency Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| `posts.group_id` FK addition requires careful migration — existing posts must remain null | MEDIUM | V11 uses `ALTER TABLE ... ADD COLUMN group_id BIGINT REFERENCES groups(id) ON DELETE SET NULL` — nullable by default, safe |
| Last-admin leave creates orphaned group | HIGH | Implement auto-promote logic in `leaveGroup()` before Sprint 1 ships |
| `PostService.createPost()` must enforce group membership check | HIGH | Add check in Sprint 1 alongside `groupId` support |
| Notification type enum — if `NotificationType` is a Java enum not VARCHAR, need to add new values | MEDIUM | Check `Notification.java` — if enum, add 6 new constants; if VARCHAR, no change needed |
| Private group content leakage via `GET /api/groups/{id}/posts` without membership check | HIGH | Add membership gate in `GroupService.getGroupFeed()` |
| Circular dependency: `PostService` ↔ `GroupService` if they inject each other | MEDIUM | `PostService` should only reference `GroupRepository` directly, not `GroupService` |
| Playwright tests need two authenticated users for invite/request flows | MEDIUM | Follow existing pattern in `e2e/global-setup.ts` — pre-create both users in global setup |
| `API Test/api.http` extension needs `@groupToken` variable for auth | LOW | Reuse existing `@authToken` pattern in the file |

---

*Temporary planning document — save to `docs/GROUP_FEATURE_PLAN.md`.*
*Archive once implementation is complete.*

*Generated: 2026-03-02 | Based on code audit of `F:\social-media-app`*
