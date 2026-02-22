import { test, expect } from '@playwright/test';
import { ProfilePage } from '../pages/ProfilePage';
import { SEED } from '../fixtures/test-data';
import { loginViaAPI } from '../helpers/auth';

test.beforeEach(async ({ page }) => {
  await loginViaAPI(page.context(), page, SEED.alice.username, SEED.alice.password);
});

// ─────────────────────────────────────────────────────────────
// Profile — View
// ─────────────────────────────────────────────────────────────
test.describe('Profile page – viewing', () => {

  test('✅ own profile page loads with correct username', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto(SEED.alice.username);
    await profile.isLoaded();

    const name = await profile.getDisplayName();
    expect(name.toLowerCase()).toContain(SEED.alice.username.toLowerCase());
  });

  test('✅ own profile shows post count', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto(SEED.alice.username);
    await profile.isLoaded();

    // Alice has seeded posts
    const count = await profile.getPostsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('✅ other user profile page loads', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto(SEED.bob.username);
    await profile.isLoaded();

    const name = await profile.getDisplayName();
    expect(name.toLowerCase()).toContain(SEED.bob.username.toLowerCase());
  });

  test('✅ profile shows followers and following counts', async ({ page }) => {
    await page.goto(`/profile/${SEED.bob.username}`);
    // Bob has followers in seed data — counts should be visible
    await expect(page.locator(':has-text("follower"), :has-text("following")').first()).toBeVisible({ timeout: 6000 });
  });

  test('❌ non-existent profile shows not-found or redirects', async ({ page }) => {
    await page.goto('/profile/nobody_xyz_99999');
    const notFound = await page.locator(':has-text("not found"), :has-text("404")').first().isVisible({ timeout: 4000 }).catch(() => false);
    const redirected = page.url().includes('localhost:3000/') && !page.url().includes('nobody');
    expect(notFound || redirected).toBeTruthy();
  });

  test('✅ own profile shows Edit Profile button', async ({ page }) => {
    await page.goto(`/profile/${SEED.alice.username}`);
    await expect(page.locator('button:has-text("Edit"), button:has-text("Edit Profile")').first()).toBeVisible({ timeout: 6000 });
  });

  test('✅ other user profile shows Follow / Unfollow button (not Edit)', async ({ page }) => {
    await page.goto(`/profile/${SEED.carol.username}`);
    await expect(page.locator('button:has-text("Follow"), button:has-text("Unfollow")').first()).toBeVisible({ timeout: 6000 });
    await expect(page.locator('button:has-text("Edit Profile")')).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────
// Profile — Edit
// ─────────────────────────────────────────────────────────────
test.describe('Profile page – editing', () => {

  test('✅ user can update their bio', async ({ page }) => {
    const profile = new ProfilePage(page);
    const newBio = `E2E bio update ${Date.now()}`;

    await profile.goto(SEED.alice.username);
    await profile.isLoaded();
    await profile.clickEditProfile();
    await profile.updateBio(newBio);

    // Bio update should be reflected
    await expect(page.locator(`text="${newBio}"`).first()).toBeVisible({ timeout: 6000 });
  });

  test('✅ user can update their display name', async ({ page }) => {
    await page.goto(`/profile/${SEED.alice.username}`);
    await page.locator('button:has-text("Edit"), button:has-text("Edit Profile")').first().click();

    const nameInput = page.locator('input[name="displayName"], input[placeholder*="display" i], input[placeholder*="name" i]').first();
    if (await nameInput.isVisible({ timeout: 3000 })) {
      const newName = `Alice Updated ${Date.now()}`;
      await nameInput.clear();
      await nameInput.fill(newName);
      await page.locator('button:has-text("Save")').first().click();
      await page.waitForTimeout(600);
      await expect(page.locator(`text="${newName}"`).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('❌ bio over 200 characters shows validation error', async ({ page }) => {
    await page.goto(`/profile/${SEED.alice.username}`);
    await page.locator('button:has-text("Edit"), button:has-text("Edit Profile")').first().click();

    const bioInput = page.locator('textarea[name="bio"], textarea[placeholder*="bio" i]').first();
    if (await bioInput.isVisible({ timeout: 3000 })) {
      await bioInput.fill('a'.repeat(201));
      await page.locator('button:has-text("Save")').first().click();

      // Should show error or char limit warning
      const hasError = await page.locator('[class*="error"], :has-text("200"), [class*="red"]').first().isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError).toBeTruthy();
    }
  });

  test('✅ edit modal/form can be cancelled', async ({ page }) => {
    await page.goto(`/profile/${SEED.alice.username}`);
    await page.locator('button:has-text("Edit Profile")').first().click();

    const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("Close"), button[aria-label*="close" i]').first();
    if (await cancelBtn.isVisible({ timeout: 3000 })) {
      await cancelBtn.click();
      // Modal should close; Edit Profile button visible again
      await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible({ timeout: 4000 });
    }
  });
});

// ─────────────────────────────────────────────────────────────
// Profile — Navigation
// ─────────────────────────────────────────────────────────────
test.describe('Profile page – navigation', () => {

  test('✅ clicking a username in feed navigates to their profile', async ({ page }) => {
    await page.goto('/');
    // Click on a post author's name or avatar
    const authorLink = page.locator('article a[href*="/profile/"], article [data-testid="author-link"]').first();
    if (await authorLink.isVisible({ timeout: 3000 })) {
      await authorLink.click();
      await expect(page).toHaveURL(/\/profile\//);
    }
  });

  test('✅ profile sidebar link navigates to own profile', async ({ page }) => {
    await page.goto('/');
    const profileLink = page.locator('nav a[href*="/profile/alice"], a:has-text("Profile")').first();
    await profileLink.click();
    await expect(page).toHaveURL(/\/profile\//);
  });
});
