/**
 * helpers/api.ts
 *
 * Low-level API helpers for E2E test setup/teardown.
 * All functions accept a bearer token and call the backend directly
 * (bypassing the UI) so tests can set up state quickly.
 */
import { Page, APIRequestContext } from '@playwright/test';

const BASE = 'http://localhost:9090/api/v1';

// ── Types ──────────────────────────────────────────────────────

export interface ApiPost {
  id: number;
  content: string;
  privacy: 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';
  likesCount: number;
  commentsCount: number;
}

export interface ApiComment {
  id: number;
  content: string;
  author: { username: string };
}

export interface ApiUser {
  id: number;
  username: string;
  displayName: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

// ── Auth ───────────────────────────────────────────────────────

/**
 * Registers a new user and returns their JWT token.
 * Throws if registration fails.
 */
export async function registerUser(
  request: APIRequestContext,
  opts: { username: string; email: string; password: string; displayName?: string }
): Promise<string> {
  const resp = await request.post(`${BASE}/auth/register`, {
    data: { displayName: opts.username, ...opts },
  });
  if (!resp.ok()) throw new Error(`Register failed ${resp.status()}: ${await resp.text()}`);
  return (await resp.json()).token as string;
}

/**
 * Logs in and returns the JWT token.
 */
export async function login(
  request: APIRequestContext,
  username: string,
  password: string
): Promise<string> {
  const resp = await request.post(`${BASE}/auth/login`, {
    data: { usernameOrEmail: username, password },
  });
  if (!resp.ok()) throw new Error(`Login failed ${resp.status()}: ${await resp.text()}`);
  return (await resp.json()).token as string;
}

// ── Posts ──────────────────────────────────────────────────────

/**
 * Creates a post via API and returns the full post object.
 */
export async function createPost(
  request: APIRequestContext,
  token: string,
  content: string,
  privacy: 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE' = 'PUBLIC',
  imageUrl?: string
): Promise<ApiPost> {
  const resp = await request.post(`${BASE}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { content, privacy, ...(imageUrl ? { imageUrl } : {}) },
  });
  if (!resp.ok()) throw new Error(`createPost failed ${resp.status()}: ${await resp.text()}`);
  return resp.json();
}

/**
 * Deletes a post. Resolves even if 403/404 (idempotent for test teardown).
 */
export async function deletePost(
  request: APIRequestContext,
  token: string,
  postId: number
): Promise<void> {
  await request.delete(`${BASE}/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Likes a post. Returns false if already liked (409).
 */
export async function likePost(
  request: APIRequestContext,
  token: string,
  postId: number
): Promise<boolean> {
  const resp = await request.post(`${BASE}/posts/${postId}/like`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.ok();
}

/**
 * Unlikes a post. Returns false if not liked (409).
 */
export async function unlikePost(
  request: APIRequestContext,
  token: string,
  postId: number
): Promise<boolean> {
  const resp = await request.delete(`${BASE}/posts/${postId}/like`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.ok();
}

/**
 * Gets a post by ID. Returns null on 404.
 */
export async function getPost(
  request: APIRequestContext,
  token: string,
  postId: number
): Promise<ApiPost | null> {
  const resp = await request.get(`${BASE}/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (resp.status() === 404) return null;
  return resp.json();
}

// ── Comments ───────────────────────────────────────────────────

/**
 * Adds a comment to a post and returns the comment object.
 */
export async function addComment(
  request: APIRequestContext,
  token: string,
  postId: number,
  content: string
): Promise<ApiComment> {
  const resp = await request.post(`${BASE}/posts/${postId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { content },
  });
  if (!resp.ok()) throw new Error(`addComment failed ${resp.status()}: ${await resp.text()}`);
  return resp.json();
}

/**
 * Deletes a comment. Resolves even if not found.
 */
export async function deleteComment(
  request: APIRequestContext,
  token: string,
  postId: number,
  commentId: number
): Promise<void> {
  await request.delete(`${BASE}/posts/${postId}/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Lists comments on a post (page 0, size 50).
 */
export async function getComments(
  request: APIRequestContext,
  token: string,
  postId: number
): Promise<ApiComment[]> {
  const resp = await request.get(`${BASE}/posts/${postId}/comments?page=0&size=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await resp.json();
  return body.content ?? body;
}

// ── Follow ─────────────────────────────────────────────────────

/**
 * Follows a user. Returns false if already following (409).
 */
export async function follow(
  request: APIRequestContext,
  token: string,
  username: string
): Promise<boolean> {
  const resp = await request.post(`${BASE}/users/${username}/follow`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.ok();
}

/**
 * Unfollows a user. Returns false if not following (409).
 */
export async function unfollow(
  request: APIRequestContext,
  token: string,
  username: string
): Promise<boolean> {
  const resp = await request.delete(`${BASE}/users/${username}/follow`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.ok();
}

// ── Notifications ──────────────────────────────────────────────

/**
 * Returns the unread notification count for the given token holder.
 */
export async function getUnreadCount(
  request: APIRequestContext,
  token: string
): Promise<number> {
  const resp = await request.get(`${BASE}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await resp.json();
  return body.count ?? body.unreadCount ?? 0;
}

/**
 * Marks all notifications as read.
 */
export async function markAllRead(
  request: APIRequestContext,
  token: string
): Promise<void> {
  await request.patch(`${BASE}/notifications/read-all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Users ──────────────────────────────────────────────────────

/**
 * Gets a user profile by username. Returns null if 404.
 */
export async function getUser(
  request: APIRequestContext,
  token: string,
  username: string
): Promise<ApiUser | null> {
  const resp = await request.get(`${BASE}/users/${username}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (resp.status() === 404) return null;
  return resp.json();
}

/**
 * Updates own profile. Returns updated user.
 */
export async function updateProfile(
  request: APIRequestContext,
  token: string,
  update: { displayName?: string; bio?: string; avatarUrl?: string }
): Promise<ApiUser> {
  const resp = await request.put(`${BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    data: update,
  });
  return resp.json();
}

// ── Page-level helpers (need `page` for localStorage injection) ──

/**
 * Injects token into localStorage and navigates to a route.
 * Use this after loginViaAPI when you need to change route.
 */
export async function navigateAuthenticated(
  page: Page,
  token: string,
  userJson: string,
  route: string
): Promise<void> {
  await page.evaluate(([t, u]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }, [token, userJson] as [string, string]);
  await page.goto(route);
}
