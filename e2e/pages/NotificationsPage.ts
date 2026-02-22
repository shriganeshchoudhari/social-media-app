import { Page, expect } from '@playwright/test';

export class NotificationsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/notifications');
  }

  async isLoaded() {
    await expect(this.page.locator('h1:has-text("Notification"), [data-testid="notifications-header"]').first()).toBeVisible({ timeout: 8000 });
  }

  async getNotificationCount(): Promise<number> {
    const items = await this.page.locator('[data-testid="notification-item"], .notification-item, li').all();
    return items.length;
  }

  async getUnreadBadgeCount(): Promise<number> {
    const badge = this.page.locator('[data-testid="unread-badge"], .badge, .unread-count').first();
    if (!await badge.isVisible()) return 0;
    return parseInt(await badge.innerText()) || 0;
  }

  async clickMarkAllRead() {
    const btn = this.page.locator('button:has-text("Mark all"), button:has-text("Mark All")').first();
    await btn.click();
    await this.page.waitForTimeout(500);
  }

  async hasUnreadItems(): Promise<boolean> {
    return this.page.locator('[class*="unread"], [data-unread="true"], .bg-blue').first().isVisible();
  }
}
