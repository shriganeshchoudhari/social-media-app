import { Page, Locator, expect } from '@playwright/test';

export class NotificationsPage {
  readonly page: Page;

  // ── Locators ───────────────────────────────────────────────
  readonly header:           Locator;
  readonly items:            Locator;
  readonly markAllReadBtn:   Locator;
  readonly clearAllBtn:      Locator;
  readonly loadMoreBtn:      Locator;
  readonly filterTabAll:     Locator;
  readonly filterTabUnread:  Locator;
  readonly unreadDots:       Locator;
  readonly toastContainer:   Locator;

  constructor(page: Page) {
    this.page             = page;
    this.header           = page.locator('h1:has-text("Notification"), [data-testid="notifications-header"]').first();
    this.items            = page.locator('[data-testid="notification-item"]');
    this.markAllReadBtn   = page.locator('button:has-text("Mark all"), button:has-text("Mark All")').first();
    this.clearAllBtn      = page.locator('[data-testid="clear-all-btn"]');
    this.loadMoreBtn      = page.locator('[data-testid="load-more-btn"]');
    this.filterTabAll     = page.locator('[data-testid="filter-tab-all"]');
    this.filterTabUnread  = page.locator('[data-testid="filter-tab-unread"]');
    this.unreadDots       = page.locator('[data-testid="unread-dot"]');
    this.toastContainer   = page.locator('[data-testid="notification-toast-container"]');
  }

  async goto() {
    await this.page.goto('/notifications');
  }

  async isLoaded() {
    await expect(this.header).toBeVisible({ timeout: 8000 });
  }

  async getNotificationCount(): Promise<number> {
    return this.items.count();
  }

  async getUnreadCount(): Promise<number> {
    return this.unreadDots.count();
  }

  async hasUnreadItems(): Promise<boolean> {
    return (await this.unreadDots.count()) > 0;
  }

  async clickMarkAllRead() {
    await this.markAllReadBtn.click();
    await this.page.waitForTimeout(500);
  }

  async clickClearAll(confirm = true) {
    await this.clearAllBtn.click();
    if (confirm) {
      // Second click confirms
      await this.clearAllBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  async clickLoadMore() {
    await this.loadMoreBtn.click();
  }

  async switchToUnreadFilter() {
    await this.filterTabUnread.click();
    await this.page.waitForTimeout(400);
  }

  async switchToAllFilter() {
    await this.filterTabAll.click();
    await this.page.waitForTimeout(400);
  }

  async deleteFirstNotification() {
    const first = this.items.first();
    await first.hover();
    const deleteBtn = first.locator('[data-testid="delete-notification-btn"]');
    await deleteBtn.click();
    await this.page.waitForTimeout(400);
  }

  async clickFirstNotification(): Promise<void> {
    await this.items.first().click();
  }

  async waitForToast() {
    await expect(this.page.locator('[data-testid="notification-toast"]').first())
      .toBeVisible({ timeout: 6000 });
  }
}
