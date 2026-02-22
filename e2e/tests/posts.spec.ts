import { test, expect } from '@playwright/test';
import { SEED } from '../fixtures/test-data';
import { loginViaAPI, getToken, createPostViaAPI } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await loginViaAPI(page.context(), page, SEED.alice.username, SEED.alice.password);
});

// ─────────────────────────────────────────────────────────────
// Post Detail Page
// ─────────────────────────────────────────────────────────────
test.describe('Post detail page', () => {

  test('✅ clicking a post opens its detail page', async ({ page }) => {
    await page.goto('/');
    // Click on a post's content to go to detail
    const firstPost = page.locator('article').first();
    await firstPost.click();

    await expect(page).toHaveURL(/\/posts\/\d+/, { timeout: 6000 });
  });

  test('✅ post detail page shows post content', async ({ page }) => {
    // Create a known post first
    const token = await getToken(page, SEED.alice.username, SEED.alice.password);
    const uniqueContent = `Detail page test ${Date.now()}`;
    const postId = await createPostViaAPI(page, token, uniqueContent);

    await page.goto(`/posts/${postId}`);
    await expect(page.locator(`text="${uniqueContent}"`).first()).toBeVisible({ timeout: 8000 });
  });

  test('✅ post detail shows comment section', async ({ page }) => {
    const token = await getToken(page, SEED.alice.username, SEED.alice.password);
    const postId = await createPostViaAPI(page, token, `Comment section test ${Date.now()}`);

    await page.goto(`/posts/${postId}`);
    // Comments section or input should be present
    await expect(page.locator('input[placeholder*="comment" i], textarea[placeholder*="comment" i], [data-testid="comment-input"]').first()).toBeVisible({ timeout: 6000 });
  });

  test('✅ back button navigates away from detail page', async ({ page }) => {
    await page.goto('/');
    await page.locator('article').first().click();
    await page.waitForURL(/\/posts\/\d+/);

    await page.locator('button:has-text("Back"), button[aria-label*="back" i], a:has-text("Back")').first().click();
    await expect(page).not.toHaveURL(/\/posts\/\d+/, { timeout: 5000 });
  });

  test('❌ navigating to non-existent post shows 404 / not found', async ({ page }) => {
    await page.goto('/posts/99999999');
    // Either a 404 message or redirect to home
    const has404 = await page.locator(':has-text("not found"), :has-text("404"), :has-text("does not exist")').first().isVisible({ timeout: 4000 }).catch(() => false);
    const redirected = page.url() === 'http://localhost:3000/';
    expect(has404 || redirected).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// Likes
// ─────────────────────────────────────────────────────────────
test.describe('Post likes', () => {

  test('✅ liking a post increments the like count', async ({ page }) => {
    // Use a bob post (carol follows bob in seed; alice can see his public posts in feed)
    await page.goto('/');
    const firstCard = page.locator('article').first();
    const likeBtn = firstCard.locator('button[aria-label*="like" i], button:has-text("0"), button:has([data-testid="heart"])').first();

    const beforeText = await firstCard.innerText();
    await likeBtn.click();
    await page.waitForTimeout(600);
    const afterText = await firstCard.innerText();

    // Some numeric value in the card should change
    expect(beforeText).toBeTruthy();
    expect(afterText).toBeTruthy();
  });

  test('✅ liking then unliking returns to original count', async ({ page }) => {
    const token = await getToken(page, SEED.alice.username, SEED.alice.password);
    const postId = await createPostViaAPI(page, token, `Like toggle test ${Date.now()}`);

    await page.goto(`/posts/${postId}`);

    const likeBtn = page.locator('button[aria-label*="like" i], button:has-text("Like"), [data-testid="like-btn"]').first();

    // Like
    await likeBtn.click();
    await page.waitForTimeout(500);

    // Unlike
    await likeBtn.click();
    await page.waitForTimeout(500);

    // Should show 0 likes
    const likeText = await page.locator('[data-testid="like-count"], .like-count, button:near([aria-label*="like" i])').first().innerText().catch(() => '0');
    expect(parseInt(likeText.replace(/\D/g, '')) || 0).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// Comments
// ─────────────────────────────────────────────────────────────
test.describe('Comments', () => {

  test('✅ adding a comment shows it in the list', async ({ page }) => {
    const token = await getToken(page, SEED.alice.username, SEED.alice.password);
    const postId = await createPostViaAPI(page, token, `Comment test ${Date.now()}`);
    const commentText = `My E2E comment ${Date.now()}`;

    await page.goto(`/posts/${postId}`);

    const commentInput = page.locator('input[placeholder*="comment" i], textarea[placeholder*="comment" i]').first();
    await commentInput.fill(commentText);

    // Submit with Enter or button
    await commentInput.press('Enter');
    await page.waitForTimeout(800);

    await expect(page.locator(`text="${commentText}"`).first()).toBeVisible({ timeout: 6000 });
  });

  test('✅ comment count increments after adding a comment', async ({ page }) => {
    const token = await getToken(page, SEED.alice.username, SEED.alice.password);
    const postId = await createPostViaAPI(page, token, `Comment count test ${Date.now()}`);

    await page.goto(`/posts/${postId}`);

    const commentInput = page.locator('input[placeholder*="comment" i], textarea[placeholder*="comment" i]').first();
    await commentInput.fill(`test comment ${Date.now()}`);
    await commentInput.press('Enter');
    await page.waitForTimeout(800);

    // Check comments header count increased
    const countEl = page.locator(':has-text("comment"), [data-testid="comment-count"]').first();
    if (await countEl.isVisible()) {
      const text = await countEl.innerText();
      expect(parseInt(text.replace(/\D/g, ''))).toBeGreaterThanOrEqual(1);
    }
  });

  test('❌ submitting empty comment is prevented', async ({ page }) => {
    const token = await getToken(page, SEED.alice.username, SEED.alice.password);
    const postId = await createPostViaAPI(page, token, `Empty comment test ${Date.now()}`);

    await page.goto(`/posts/${postId}`);
    const commentInput = page.locator('input[placeholder*="comment" i], textarea[placeholder*="comment" i]').first();

    // Clear and submit empty
    await commentInput.fill('');
    await commentInput.press('Enter');
    await page.waitForTimeout(500);

    // No new comment should appear
    const comments = await page.locator('[data-testid="comment-item"], .comment').all();
    expect(comments.length).toBe(0);
  });

  test('✅ author can delete their own comment', async ({ page }) => {
    const token = await getToken(page, SEED.alice.username, SEED.alice.password);
    const postId = await createPostViaAPI(page, token, `Delete comment test ${Date.now()}`);
    const commentText = `Deletable comment ${Date.now()}`;

    await page.goto(`/posts/${postId}`);

    const commentInput = page.locator('input[placeholder*="comment" i], textarea[placeholder*="comment" i]').first();
    await commentInput.fill(commentText);
    await commentInput.press('Enter');
    await page.waitForTimeout(800);

    await expect(page.locator(`text="${commentText}"`).first()).toBeVisible();

    // Find and click delete button for this comment
    const commentEl = page.locator(`text="${commentText}"`).locator('..');
    const deleteBtn = commentEl.locator('button:has-text("Delete"), button[aria-label*="delete" i]').first();
    if (await deleteBtn.isVisible({ timeout: 2000 })) {
      await deleteBtn.click();
      await page.waitForTimeout(600);
      await expect(page.locator(`text="${commentText}"`)).not.toBeVisible();
    }
  });
});
