import { Page, expect } from '@playwright/test';

export class FeedPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForURL('/');
  }

  async isLoaded() {
    // Either the composer or a post card should be visible
    await expect(
      this.page.locator('textarea, [placeholder*="What"], [placeholder*="post"], [data-testid="composer"]').first()
    ).toBeVisible({ timeout: 8000 });
  }

  async createPost(content: string, privacy: 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE' = 'PUBLIC') {
    const textarea = this.page.locator('textarea').first();
    await textarea.click();
    await textarea.fill(content);

    // Change privacy if needed
    if (privacy !== 'PUBLIC') {
      const privacyBtn = this.page.locator('button:has-text("Public"), select[name="privacy"], [data-testid="privacy-selector"]').first();
      if (await privacyBtn.isVisible()) {
        await privacyBtn.click();
        const option = this.page.locator(`[role="option"]:has-text("${privacy === 'FOLLOWERS_ONLY' ? 'Followers' : 'Private'}")`, );
        if (await option.isVisible()) await option.click();
      }
    }

    await this.page.locator('button:has-text("Post"), button[type="submit"]:near(textarea)').first().click();
    // Wait for the post to appear in the feed
    await this.page.waitForTimeout(800);
  }

  async getPostCards() {
    return this.page.locator('article, [data-testid="post-card"], .post-card').all();
  }

  async firstPostContent(): Promise<string> {
    const card = this.page.locator('article, [data-testid="post-card"]').first();
    return card.innerText();
  }

  async clickLikeOnFirstPost() {
    const likeBtn = this.page.locator('button[aria-label*="like" i], button:has([data-testid="heart"]), button:has-text("Like")').first();
    await likeBtn.click();
  }

  async getFirstPostLikeCount(): Promise<number> {
    const text = await this.page.locator('article, [data-testid="post-card"]').first().locator('[data-testid="like-count"], .like-count').first().innerText();
    return parseInt(text) || 0;
  }

  async clickDeleteOnFirstPost() {
    // Open post menu
    const menuBtn = this.page.locator('article').first().locator('button[aria-label*="menu" i], button[aria-label*="more" i], button:has([data-testid="dots"])').first();
    if (await menuBtn.isVisible()) await menuBtn.click();

    // Click delete
    await this.page.locator('button:has-text("Delete"), [role="menuitem"]:has-text("Delete")').first().click();

    // Confirm if dialog appears
    const confirmBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete"):visible').first();
    if (await confirmBtn.isVisible({ timeout: 1500 })) await confirmBtn.click();
  }
}
