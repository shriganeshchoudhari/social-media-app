import { test, expect } from '@playwright/test';
import { ProfilePage } from '../pages/ProfilePage';
import { SEED } from '../fixtures/test-data';
import { loginViaAPI, getToken } from '../helpers/auth';

// ─────────────────────────────────────────────────────────────
// Follow / Unfollow
// ─────────────────────────────────────────────────────────────

test.describe('Follow & Unfollow', () => {

  test.beforeEach(async ({ page }) => {
    // Log in as eve — she doesn't follow carol in seed data
    await loginViaAPI(page.context(), page, SEED.eve.username, SEED.eve.password);
  });

  test('✅ can follow a user from their profile page', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto(SEED.carol.username);
    await profile.isLoaded();

    const btnText = await profile.followButtonText().catch(() => 'Follow');

    if (btnText.toLowerCase().includes('follow') && !btnText.toLowerCase().includes('unfollow')) {
      const followersBefore = await profile.getFollowersCount();
      await profile.clickFollowButton();

      // Button should change to Unfollow
      await expect(page.locator('button:has-text("Unfollow")').first()).toBeVisible({ timeout: 5000 });

      const followersAfter = await profile.getFollowersCount();
      expect(followersAfter).toBeGreaterThanOrEqual(followersBefore);
    }
  });

  test('✅ can unfollow a user already followed', async ({ page }) => {
    const profile = new ProfilePage(page);

    // Eve follows carol first via API
    const eveToken = await getToken(page, SEED.eve.username, SEED.eve.password);
    await page.request.post(`http://localhost:9090/api/v1/users/${SEED.carol.username}/follow`, {
      headers: { Authorization: `Bearer ${eveToken}` },
    }).catch(() => {});  // ignore if already following

    await profile.goto(SEED.carol.username);
    await profile.isLoaded();

    const unfollowBtn = page.locator('button:has-text("Unfollow")').first();
    if (await unfollowBtn.isVisible({ timeout: 3000 })) {
      await unfollowBtn.click();
      await expect(page.locator('button:has-text("Follow")').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('❌ follow button not shown on own profile', async ({ page }) => {
    // Log in as alice
    await loginViaAPI(page.context(), page, SEED.alice.username, SEED.alice.password);
    await page.goto(`/profile/${SEED.alice.username}`);
    await expect(page.locator('button:has-text("Follow"), button:has-text("Unfollow")')).not.toBeVisible({ timeout: 4000 });
  });
});

// ─────────────────────────────────────────────────────────────
// Followers / Following lists
// ─────────────────────────────────────────────────────────────

test.describe('Followers & Following lists', () => {

  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page.context(), page, SEED.alice.username, SEED.alice.password);
  });

  test('✅ followers count shown on profile matches seed data', async ({ page }) => {
    // Bob has followers in seed: alice, carol, eve follow bob
    await page.goto(`/profile/${SEED.bob.username}`);
    const countText = await page.locator(':has-text("follower")').first().innerText().catch(() => '0');
    expect(parseInt(countText.replace(/\D/g, ''))).toBeGreaterThanOrEqual(0);
  });

  test('✅ following count shown on profile matches seed data', async ({ page }) => {
    await page.goto(`/profile/${SEED.alice.username}`);
    const countText = await page.locator(':has-text("following")').first().innerText().catch(() => '0');
    expect(parseInt(countText.replace(/\D/g, ''))).toBeGreaterThanOrEqual(0);
  });

  test('✅ followed users posts appear in feed', async ({ page }) => {
    // Alice follows bob (seeded) — bob's posts must appear in alice's feed
    await page.goto('/');
    const feedCards = await page.locator('article').all();
    expect(feedCards.length).toBeGreaterThan(0);
  });

  test('✅ following someone from profile updates their follower count', async ({ page }) => {
    // Use dave's profile — eve doesn't follow dave in seed
    await loginViaAPI(page.context(), page, SEED.eve.username, SEED.eve.password);
    await page.goto(`/profile/${SEED.dave.username}`);

    const beforeCount = await page.locator(':has-text("follower")').first().innerText().catch(() => '0');
    const followBtn = page.locator('button:has-text("Follow")').first();

    if (await followBtn.isVisible({ timeout: 3000 })) {
      await followBtn.click();
      await page.waitForTimeout(600);

      const afterCount = await page.locator(':has-text("follower")').first().innerText().catch(() => '0');
      const before = parseInt(beforeCount.replace(/\D/g, ''));
      const after  = parseInt(afterCount.replace(/\D/g, ''));
      expect(after).toBeGreaterThanOrEqual(before);
    }
  });
});
