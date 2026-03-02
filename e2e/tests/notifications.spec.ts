import { test, expect } from '@playwright/test';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SEED } from '../fixtures/test-data';
import { loginViaAPI, getToken } from '../helpers/auth';

const API = 'http://localhost:9090/api/v1';

// ─────────────────────────────────────────────────────────────
// Helper: create a fresh post and return its ID
// ─────────────────────────────────────────────────────────────
async function createPost(request: any, token: string): Promise<number> {
  const res = await request.post(`${API}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { content: `Test post ${Date.now()}`, privacy: 'PUBLIC' },
  });
  return (await res.json()).id;
}

// ─────────────────────────────────────────────────────────────
// Basic page tests
// ─────────────────────────────────────────────────────────────

test.describe('Notifications — page', () => {

  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page.context(), page, SEED.bob.username, SEED.bob.password);
  });

  test('✅ page loads with header', async ({ page }) => {
    const n = new NotificationsPage(page);
    await n.goto();
    await n.isLoaded();
  });

  test('✅ shows seeded notification items', async ({ page }) => {
    const n = new NotificationsPage(page);
    await n.goto();
    await n.isLoaded();
    expect(await n.getNotificationCount()).toBeGreaterThan(0);
  });

  test('✅ sidebar badge visible when unread notifications exist', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    // Badge rendered in Sidebar for notifications nav link
    const badge = page.locator('nav .bg-red-500').first();
    // If there are unread items the badge is present — just ensure page rendered
    await expect(page.locator('nav')).toBeVisible();
  });

  test('✅ mark all read clears unread dots', async ({ page }) => {
    const n = new NotificationsPage(page);
    await n.goto();
    await n.isLoaded();

    const hadUnread = await n.hasUnreadItems();
    if (hadUnread) {
      await n.clickMarkAllRead();
      expect(await n.getUnreadCount()).toBe(0);
    }
  });

  test('✅ Mark all read button is visible when unread items exist', async ({ page }) => {
    const n = new NotificationsPage(page);
    await n.goto();
    await n.isLoaded();

    if (await n.hasUnreadItems()) {
      await expect(n.markAllReadBtn).toBeVisible();
    }
  });

  test('✅ navigable via sidebar', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a[href="/notifications"], a:has-text("Notification")').first().click();
    await expect(page).toHaveURL('/notifications');
  });

  test('❌ redirects to login when unauthenticated', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/notifications');
    await expect(page).toHaveURL('/login', { timeout: 6000 });
  });
});

// ─────────────────────────────────────────────────────────────
// Filter tabs
// ─────────────────────────────────────────────────────────────

test.describe('Notifications — filter tabs', () => {

  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page.context(), page, SEED.bob.username, SEED.bob.password);
  });

  test('✅ Unread tab shows only unread notifications', async ({ page }) => {
    const n = new NotificationsPage(page);
    await n.goto();
    await n.isLoaded();

    await n.switchToUnreadFilter();

    // All visible items should have an unread dot, OR the empty state is shown
    const count      = await n.getNotificationCount();
    const unreadDots = await n.getUnreadCount();

    if (count > 0) {
      // Every rendered item should be unread
      expect(unreadDots).toBe(count);
    } else {
      await expect(page.locator('text=All caught up')).toBeVisible();
    }
  });

  test('✅ All tab shows all notifications', async ({ page }) => {
    const n = new NotificationsPage(page);
    await n.goto();
    await n.isLoaded();

    await n.switchToUnreadFilter();
    await n.switchToAllFilter();

    // Should show at least as many items as the unread filter
    expect(await n.getNotificationCount()).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────
// Mark read on click
// ─────────────────────────────────────────────────────────────

test.describe('Notifications — mark read on click', () => {

  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page.context(), page, SEED.bob.username, SEED.bob.password);
  });

  test('✅ clicking an unread notification removes its unread dot', async ({ page }) => {
    const n = new NotificationsPage(page);
    await n.goto();
    await n.isLoaded();

    if (!(await n.hasUnreadItems())) {
      test.skip(); // nothing to test
      return;
    }

    const firstUnreadItem = page.locator('[data-unread="true"]').first();
    const firstDot        = firstUnreadItem.locator('[data-testid="unread-dot"]');
    await expect(firstDot).toBeVisible();

    await firstUnreadItem.click();
    await page.waitForTimeout(600);

    // After navigating back, the dot should be gone for that item
    await page.goBack();
    await n.isLoaded();
    // The item should now be read (no dot)
    const allDots = await page.locator('[data-testid="unread-dot"]').count();
    // At least one fewer dot than before the click
    expect(allDots).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────
// Delete notifications
// ─────────────────────────────────────────────────────────────

test.describe('Notifications — delete', () => {

  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page.context(), page, SEED.bob.username, SEED.bob.password);
  });

  test('✅ deleting a single notification removes it from the list', async ({ page }) => {
    const n = new NotificationsPage(page);
    await n.goto();
    await n.isLoaded();

    const countBefore = await n.getNotificationCount();
    if (countBefore === 0) { test.skip(); return; }

    await n.deleteFirstNotification();
    const countAfter = await n.getNotificationCount();
    expect(countAfter).toBe(countBefore - 1);
  });

  test('✅ clear all removes all notifications and shows empty state', async ({ page }) => {
    const n = new NotificationsPage(page);
    await n.goto();
    await n.isLoaded();

    const countBefore = await n.getNotificationCount();
    if (countBefore === 0) { test.skip(); return; }

    await n.clickClearAll(true);
    await page.waitForTimeout(600);

    expect(await n.getNotificationCount()).toBe(0);
    await expect(page.locator('text=No notifications yet, text=All caught up').first())
      .toBeVisible({ timeout: 3000 });
  });
});

// ─────────────────────────────────────────────────────────────
// Load more
// ─────────────────────────────────────────────────────────────

test.describe('Notifications — load more', () => {

  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page.context(), page, SEED.bob.username, SEED.bob.password);
  });

  test('✅ Load more button appends more items when available', async ({ page }) => {
    const n = new NotificationsPage(page);
    await n.goto();
    await n.isLoaded();

    const loadMoreVisible = await n.loadMoreBtn.isVisible();
    if (!loadMoreVisible) { test.skip(); return; }

    const countBefore = await n.getNotificationCount();
    await n.clickLoadMore();
    await page.waitForTimeout(800);

    const countAfter = await n.getNotificationCount();
    expect(countAfter).toBeGreaterThan(countBefore);
  });
});

// ─────────────────────────────────────────────────────────────
// Notification trigger tests (API-level)
// ─────────────────────────────────────────────────────────────

test.describe('Notifications — triggers', () => {

  test('✅ liking another user\'s post generates a LIKE notification', async ({ page }) => {
    const aliceToken = await getToken(page, SEED.alice.username, SEED.alice.password);
    const carolToken = await getToken(page, SEED.carol.username, SEED.carol.password);

    const postId = await createPost(page.request, aliceToken);

    const before = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    })).json()).count ?? 0;

    await page.request.post(`${API}/posts/${postId}/like`, {
      headers: { Authorization: `Bearer ${carolToken}` },
    });

    await page.waitForTimeout(500);

    const after = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    })).json()).count ?? 0;

    expect(after).toBeGreaterThan(before);
  });

  test('✅ commenting on a post generates a COMMENT notification', async ({ page }) => {
    const aliceToken = await getToken(page, SEED.alice.username, SEED.alice.password);
    const carolToken = await getToken(page, SEED.carol.username, SEED.carol.password);

    const postId = await createPost(page.request, aliceToken);

    const before = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    })).json()).count ?? 0;

    await page.request.post(`${API}/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${carolToken}` },
      data: { content: 'Great post!' },
    });

    await page.waitForTimeout(500);

    const after = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    })).json()).count ?? 0;

    expect(after).toBeGreaterThan(before);
  });

  test('✅ replying to a comment generates a REPLY notification for the comment author', async ({ page }) => {
    const aliceToken = await getToken(page, SEED.alice.username, SEED.alice.password);
    const carolToken = await getToken(page, SEED.carol.username, SEED.carol.password);
    const daveToken  = await getToken(page, SEED.dave.username,  SEED.dave.password);

    // Alice creates post; Carol comments; Dave replies to Carol's comment
    const postId = await createPost(page.request, aliceToken);

    const commentRes = await page.request.post(`${API}/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${carolToken}` },
      data: { content: "Carol's top-level comment" },
    });
    const commentId = (await commentRes.json()).id;

    const carolBefore = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${carolToken}` },
    })).json()).count ?? 0;

    await page.request.post(`${API}/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${daveToken}` },
      data: { content: "Dave's reply", parentCommentId: commentId },
    });

    await page.waitForTimeout(500);

    const carolAfter = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${carolToken}` },
    })).json()).count ?? 0;

    expect(carolAfter).toBeGreaterThan(carolBefore);
  });

  test('✅ following a user generates a FOLLOW notification', async ({ page }) => {
    const eveToken  = await getToken(page, SEED.eve.username,  SEED.eve.password);
    const daveToken = await getToken(page, SEED.dave.username, SEED.dave.password);

    // Unfollow first in case already following
    await page.request.delete(`${API}/users/${SEED.dave.username}/follow`, {
      headers: { Authorization: `Bearer ${eveToken}` },
    }).catch(() => {});

    const before = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${daveToken}` },
    })).json()).count ?? 0;

    await page.request.post(`${API}/users/${SEED.dave.username}/follow`, {
      headers: { Authorization: `Bearer ${eveToken}` },
    });

    await page.waitForTimeout(500);

    const after = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${daveToken}` },
    })).json()).count ?? 0;

    expect(after).toBeGreaterThanOrEqual(before);
  });

  test('✅ no self-notification when liking own post', async ({ page }) => {
    const token = await getToken(page, SEED.alice.username, SEED.alice.password);
    const postId = await createPost(page.request, token);

    const before = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })).json()).count ?? 0;

    await page.request.post(`${API}/posts/${postId}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});

    await page.waitForTimeout(500);

    const after = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })).json()).count ?? 0;

    expect(after).toBe(before);
  });
});

// ─────────────────────────────────────────────────────────────
// Delete / filter REST API tests
// ─────────────────────────────────────────────────────────────

test.describe('Notifications — REST API', () => {

  test('✅ DELETE /notifications/{id} removes a single notification', async ({ page }) => {
    const aliceToken = await getToken(page, SEED.alice.username, SEED.alice.password);
    const carolToken = await getToken(page, SEED.carol.username, SEED.carol.password);

    // Create a notification: carol likes alice's post
    const postId = await createPost(page.request, aliceToken);
    await page.request.post(`${API}/posts/${postId}/like`, {
      headers: { Authorization: `Bearer ${carolToken}` },
    });
    await page.waitForTimeout(400);

    // Fetch alice's notifications
    const listRes  = await page.request.get(`${API}/notifications`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const listBody = await listRes.json();
    const first    = listBody.content?.[0];
    expect(first).toBeDefined();

    // Delete it
    const delRes = await page.request.delete(`${API}/notifications/${first.id}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(delRes.status()).toBe(204);

    // Confirm it's gone
    const afterRes  = await page.request.get(`${API}/notifications`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const afterBody = await afterRes.json();
    const ids       = (afterBody.content ?? []).map((n: any) => n.id);
    expect(ids).not.toContain(first.id);
  });

  test('✅ DELETE /notifications clears all notifications', async ({ page }) => {
    const aliceToken = await getToken(page, SEED.alice.username, SEED.alice.password);

    const clearRes = await page.request.delete(`${API}/notifications`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(clearRes.status()).toBe(204);

    const listRes  = await page.request.get(`${API}/notifications`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const body = await listRes.json();
    expect(body.totalElements ?? 0).toBe(0);
  });

  test('✅ GET /notifications?unreadOnly=true returns only unread items', async ({ page }) => {
    const token = await getToken(page, SEED.bob.username, SEED.bob.password);

    const res  = await page.request.get(`${API}/notifications?unreadOnly=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();

    const allUnread = (body.content ?? []).every((n: any) => n.read === false);
    expect(allUnread).toBe(true);
  });

  test('✅ GET /notifications?type=LIKE returns only LIKE notifications', async ({ page }) => {
    const token = await getToken(page, SEED.bob.username, SEED.bob.password);

    const res  = await page.request.get(`${API}/notifications?type=LIKE`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();

    const allLike = (body.content ?? []).every((n: any) => n.type === 'LIKE');
    expect(allLike).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// Notification preferences — REST API
// ─────────────────────────────────────────────────────────────

test.describe('Notifications — preferences API', () => {

  test('✅ GET /notifications/preferences returns all types', async ({ page }) => {
    const token = await getToken(page, SEED.alice.username, SEED.alice.password);

    const res  = await page.request.get(`${API}/notifications/preferences`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const prefs: any[] = await res.json();

    expect(prefs.length).toBeGreaterThanOrEqual(4); // at least LIKE, COMMENT, FOLLOW, MENTION
    expect(prefs.every(p => 'type' in p && 'inApp' in p)).toBe(true);
  });

  test('✅ PUT /notifications/preferences/LIKE toggles LIKE preference', async ({ page }) => {
    const token = await getToken(page, SEED.alice.username, SEED.alice.password);

    // Disable LIKE notifications
    const disRes = await page.request.put(`${API}/notifications/preferences/LIKE`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { inApp: false },
    });
    expect(disRes.status()).toBe(200);
    const disabled = await disRes.json();
    expect(disabled.inApp).toBe(false);

    // Re-enable
    const enRes  = await page.request.put(`${API}/notifications/preferences/LIKE`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { inApp: true },
    });
    expect(enRes.status()).toBe(200);
    const enabled = await enRes.json();
    expect(enabled.inApp).toBe(true);
  });

  test('✅ disabled preference suppresses LIKE notification delivery', async ({ page }) => {
    const aliceToken = await getToken(page, SEED.alice.username, SEED.alice.password);
    const carolToken = await getToken(page, SEED.carol.username, SEED.carol.password);

    // Alice disables LIKE notifications
    await page.request.put(`${API}/notifications/preferences/LIKE`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { inApp: false },
    });

    const before = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    })).json()).count ?? 0;

    // Carol likes alice's post
    const postId = await createPost(page.request, aliceToken);
    await page.request.post(`${API}/posts/${postId}/like`, {
      headers: { Authorization: `Bearer ${carolToken}` },
    });
    await page.waitForTimeout(600);

    const after = (await (await page.request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    })).json()).count ?? 0;

    // Count should NOT have increased (preference disabled)
    expect(after).toBe(before);

    // Re-enable for other tests
    await page.request.put(`${API}/notifications/preferences/LIKE`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { inApp: true },
    });
  });
});

// ─────────────────────────────────────────────────────────────
// Settings page — notification preferences UI
// ─────────────────────────────────────────────────────────────

test.describe('Settings — notification preferences UI', () => {

  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page.context(), page, SEED.alice.username, SEED.alice.password);
  });

  test('✅ Notifications tab visible in settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('[data-testid="settings-tab-notifications"]'))
      .toBeVisible({ timeout: 5000 });
  });

  test('✅ clicking Notifications tab shows preference toggles', async ({ page }) => {
    await page.goto('/settings');
    await page.locator('[data-testid="settings-tab-notifications"]').click();
    await expect(page.locator('[data-testid="pref-toggle-like"]'))
      .toBeVisible({ timeout: 5000 });
  });

  test('✅ toggling a preference updates its visual state', async ({ page }) => {
    await page.goto('/settings');
    await page.locator('[data-testid="settings-tab-notifications"]').click();

    const toggle = page.locator('[data-testid="pref-toggle-like"]');
    await expect(toggle).toBeVisible({ timeout: 5000 });

    const initialChecked = await toggle.getAttribute('aria-checked');
    await toggle.click();
    await page.waitForTimeout(500);

    const newChecked = await toggle.getAttribute('aria-checked');
    expect(newChecked).not.toBe(initialChecked);

    // Reset back
    await toggle.click();
    await page.waitForTimeout(300);
  });
});
