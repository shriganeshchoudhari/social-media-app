import { Page, expect } from '@playwright/test';

export class SearchPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/search');
  }

  async isLoaded() {
    await expect(this.page.locator('input[type="search"], input[placeholder*="Search"]').first()).toBeVisible({ timeout: 8000 });
  }

  async search(query: string) {
    const input = this.page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await input.clear();
    await input.fill(query);
    // Debounce delay in the app
    await this.page.waitForTimeout(500);
  }

  async switchTab(tab: 'Posts' | 'Users' | 'Hashtags') {
    await this.page.locator(`button:has-text("${tab}"), [role="tab"]:has-text("${tab}")`).first().click();
    await this.page.waitForTimeout(300);
  }

  async getResultCount(): Promise<number> {
    const results = await this.page.locator('article, .user-card, [data-testid="result-item"]').all();
    return results.length;
  }

  async firstResultText(): Promise<string> {
    return this.page.locator('article, .user-card, [data-testid="result-item"]').first().innerText();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.locator(':has-text("No results"), :has-text("Start typing"), [data-testid="empty-state"]').first().isVisible();
  }
}
