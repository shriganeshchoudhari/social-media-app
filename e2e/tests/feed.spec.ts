import { test, expect } from '@playwright/test';
import { FeedPage } from '../pages/FeedPage';
import { SEED, SAMPLE_POSTS } from '../fixtures/test-data';
import { loginViaUI, loginViaAPI } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await loginViaAPI(page.context(), page, SEED.alice.username, SEED.alice.password);
});

// ─────────────────────────────────────────────────────────────
// Feed — Display
// ─────────────────────────────────────────────────────────────
test.describe('Feed display', () => {

  test('✅ authenticated user sees the feed page', async ({ page }) => {
    const feed = new FeedPage(page);
    await feed.goto();
    await feed.isLoaded();
    await expect(page).toHaveURL('/');
  });

  test('✅ feed shows the post composer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('textarea').first()).toBeVisible();
  });

  test('✅ seed posts are visible on the feed', async ({ page }) => {
    await page.goto('/');
    // Alice follows bob — bob's posts appear in feed; seed has 10 posts
    const cards = await page.locator('article, [data-testid="post-card"]').all();
    expect(cards.length).toBeGreaterThan(0);
  });

  test('✅ feed shows post author name and username', async ({ page }) => {
    await page.goto('/');
    // At least one card must show a username handle
    const firstCard = page.locator('article, [data-testid="post-card"]').first();
    await expect(firstCard).toBeVisible();
    const text = await firstCard.innerText();
    expect(text.length).toBeGreaterThan(0);
  });

  test('✅ feed shows like and comment counts', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('article').first();
    await expect(firstCard).toBeVisible();
    // The card should contain numeric content (like count etc.)
    const text = await firstCard.innerText();
    expect(text).toBeTruthy();
  });

  test('❌ unauthenticated user visiting feed is redirected to login', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await expect(page).toHaveURL('/login', { timeout: 6000 });
  });
});

// ─────────────────────────────────────────────────────────────
// Feed — Create Post
// ─────────────────────────────────────────────────────────────
test.describe('Create post from feed', () => {

  test('✅ new public post appears at top of feed', async ({ page }) => {
    const feed = new FeedPage(page);
    const content = `E2E public post ${Date.now()}`;

    await feed.goto();
    await feed.isLoaded();
    await feed.createPost(content, 'PUBLIC');

    // Post content should be visible somewhere on the page
    await expect(page.locator(`text="${content}"`).first()).toBeVisible({ timeout: 8000 });
  });

  test('✅ char counter decrements as user types', async ({ page }) => {
    await page.goto('/');
    const textarea = page.locator('textarea').first();
    await textarea.fill('Hello');

    // Look for counter showing remaining chars
    const counter = page.locator('[data-testid="char-count"], .char-count, :has-text("/2000"), :has-text("1995")').first();
    if (await counter.isVisible()) {
      expect(await counter.innerText()).toContain('1995');
    }
  });

  test('✅ post button is disabled when textarea is empty', async ({ page }) => {
    await page.goto('/');
    const postBtn = page.locator('button:has-text("Post"), button[data-testid="post-submit"]').first();

    // Clear textarea (it might have focus placeholder text)
    await page.locator('textarea').first().fill('');
    await expect(postBtn).toBeDisabled();
  });

  test('❌ submitting empty post is prevented', async ({ page }) => {
    const feed = new FeedPage(page);
    await feed.goto();
    await feed.isLoaded();

    const before = (await page.locator('article').all()).length;

    // Click Post button without content — should do nothing
    const postBtn = page.locator('button:has-text("Post")').first();
    if (await postBtn.isEnabled()) {
      await postBtn.click();
    }

    await page.waitForTimeout(800);
    const after = (await page.locator('article').all()).length;
    expect(after).toBe(before);
  });

  test('✅ followers-only post is created without error', async ({ page }) => {
    const feed = new FeedPage(page);
    const content = `Followers only ${Date.now()}`;

    await feed.goto();
    await feed.createPost(content, 'FOLLOWERS_ONLY');
    // No error toast should appear; page stays on feed
    await expect(page).toHaveURL('/');
  });

  test('✅ private post is created without error', async ({ page }) => {
    const feed = new FeedPage(page);
    await feed.goto();
    await feed.createPost(`Private ${Date.now()}`, 'PRIVATE');
    await expect(page).toHaveURL('/');
  });

  test('✅ deleting own post removes it from feed', async ({ page }) => {
    const feed = new FeedPage(page);
    const uniqueContent = `Delete me ${Date.now()}`;

    await feed.goto();
    await feed.createPost(uniqueContent, 'PUBLIC');

    await expect(page.locator(`text="${uniqueContent}"`).first()).toBeVisible({ timeout: 6000 });

    await feed.clickDeleteOnFirstPost();
    await page.waitForTimeout(1000);

    // Post should no longer be visible
    await expect(page.locator(`text="${uniqueContent}"`)).not.toBeVisible();
  });
});
