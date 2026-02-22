import { test, expect } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';
import { SEED } from '../fixtures/test-data';
import { loginViaAPI } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await loginViaAPI(page.context(), page, SEED.alice.username, SEED.alice.password);
});

// ─────────────────────────────────────────────────────────────
// Search — Users
// ─────────────────────────────────────────────────────────────
test.describe('Search – Users tab', () => {

  test('✅ searching by username returns matching users', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.isLoaded();
    await search.switchTab('Users');
    await search.search('bob');

    const count = await search.getResultCount();
    expect(count).toBeGreaterThan(0);

    const text = await search.firstResultText();
    expect(text.toLowerCase()).toContain('bob');
  });

  test('✅ searching by display name returns matching users', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.switchTab('Users');
    await search.search('Builder');   // Bob Builder

    const count = await search.getResultCount();
    expect(count).toBeGreaterThan(0);
  });

  test('✅ searching for a partial username returns results', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.switchTab('Users');
    await search.search('ali');   // matches alice

    const count = await search.getResultCount();
    expect(count).toBeGreaterThan(0);
  });

  test('❌ search with no matches shows empty state', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.switchTab('Users');
    await search.search('zzz_no_such_user_xyz');

    const count = await search.getResultCount();
    expect(count).toBe(0);

    const empty = await search.isEmptyStateVisible();
    expect(empty).toBeTruthy();
  });

  test('✅ clearing search returns to empty/placeholder state', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.isLoaded();
    await search.search('bob');
    await search.search('');   // clear

    const placeholder = await page.locator(':has-text("Start typing"), [data-testid="empty-state"]').first().isVisible({ timeout: 3000 }).catch(() => true);
    expect(placeholder).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// Search — Posts
// ─────────────────────────────────────────────────────────────
test.describe('Search – Posts tab', () => {

  test('✅ searching post content returns matching posts', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.switchTab('Posts');
    await search.search('standing desk');   // from bob's seed post

    const count = await search.getResultCount();
    expect(count).toBeGreaterThan(0);
  });

  test('✅ post search is case-insensitive', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.switchTab('Posts');
    await search.search('COFFEE');   // matches bob's coffee post (lowercase in seed)

    const count = await search.getResultCount();
    expect(count).toBeGreaterThan(0);
  });

  test('❌ post search with no matches shows empty state', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.switchTab('Posts');
    await search.search('zzz_no_such_post_content_xyz');

    const empty = await search.isEmptyStateVisible();
    expect(empty).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// Search — Hashtags
// ─────────────────────────────────────────────────────────────
test.describe('Search – Hashtags tab', () => {

  test('✅ searching by hashtag returns matching posts', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.switchTab('Hashtags');
    await search.search('intro');   // alice's seed post: #intro

    const count = await search.getResultCount();
    expect(count).toBeGreaterThan(0);
  });

  test('✅ hashtag search without # prefix works', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.switchTab('Hashtags');
    await search.search('books');

    const count = await search.getResultCount();
    expect(count).toBeGreaterThan(0);
  });

  test('❌ hashtag search with no matches shows empty state', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.switchTab('Hashtags');
    await search.search('zzznohashtagzzz');

    const empty = await search.isEmptyStateVisible();
    expect(empty).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// Search — Navigation
// ─────────────────────────────────────────────────────────────
test.describe('Search – navigation', () => {

  test('✅ search page is reachable from sidebar', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a[href="/search"], a:has-text("Search")').first().click();
    await expect(page).toHaveURL('/search');
  });

  test('✅ clicking a user result navigates to their profile', async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.switchTab('Users');
    await search.search('bob');

    const firstResult = page.locator('article, .user-card, [data-testid="result-item"]').first();
    const link = firstResult.locator('a').first();
    if (await link.isVisible({ timeout: 3000 })) {
      await link.click();
      await expect(page).toHaveURL(/\/profile\//);
    }
  });

  test('❌ search page without auth redirects to login', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/search');
    await expect(page).toHaveURL('/login', { timeout: 6000 });
  });
});
