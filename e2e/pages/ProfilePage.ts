import { Page, expect } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(username: string) {
    await this.page.goto(`/profile/${username}`);
  }

  async isLoaded() {
    await expect(this.page.locator('h1, h2, [data-testid="profile-name"], .profile-name').first()).toBeVisible({ timeout: 8000 });
  }

  async getDisplayName(): Promise<string> {
    return this.page.locator('h1, h2, [data-testid="profile-name"]').first().innerText();
  }

  async getFollowersCount(): Promise<number> {
    const text = await this.page.locator('[data-testid="followers-count"], :has-text("followers")').first().innerText();
    return parseInt(text.replace(/\D/g, '')) || 0;
  }

  async clickFollowButton() {
    await this.page.locator('button:has-text("Follow"), button:has-text("Unfollow")').first().click();
    await this.page.waitForTimeout(500);
  }

  async followButtonText(): Promise<string> {
    return this.page.locator('button:has-text("Follow"), button:has-text("Unfollow")').first().innerText();
  }

  async clickEditProfile() {
    await this.page.locator('button:has-text("Edit profile"), button:has-text("Edit Profile")').first().click();
  }

  async updateBio(newBio: string) {
    const bioInput = this.page.locator('textarea[name="bio"], textarea[placeholder*="bio"]').first();
    await bioInput.clear();
    await bioInput.fill(newBio);
    await this.page.locator('button:has-text("Save"), button[type="submit"]:has-text("Save")').first().click();
    await this.page.waitForTimeout(600);
  }

  async getPostsCount(): Promise<number> {
    const text = await this.page.locator('[data-testid="posts-count"], :has-text("post")').first().innerText();
    return parseInt(text.replace(/\D/g, '')) || 0;
  }
}
