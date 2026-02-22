import { Page, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/register');
    await this.page.waitForSelector('input[name="username"], input[placeholder*="username"]');
  }

  async register(opts: { username: string; email: string; password: string; displayName: string }) {
    await this.page.locator('input[name="username"], input[placeholder*="username"]').first().fill(opts.username);
    await this.page.locator('input[name="email"], input[type="email"]').first().fill(opts.email);
    await this.page.locator('input[name="displayName"], input[placeholder*="display"], input[placeholder*="name"]').first().fill(opts.displayName);
    await this.page.locator('input[type="password"]').first().fill(opts.password);
    await this.page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign up"), button:has-text("Create")').first().click();
  }

  async expectErrorVisible() {
    await expect(
      this.page.locator('[role="alert"], .text-red-500, [class*="error"]').first()
    ).toBeVisible({ timeout: 5000 });
  }

  async expectRedirectedToFeed() {
    await expect(this.page).toHaveURL('/', { timeout: 8000 });
  }
}
