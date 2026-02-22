import { Page, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForSelector('input[name="usernameOrEmail"], input[placeholder*="username"], input[placeholder*="email"]');
  }

  async login(usernameOrEmail: string, password: string) {
    const emailInput = this.page.locator('input[name="usernameOrEmail"], input[placeholder*="username"], input[placeholder*="email"], input[type="text"]').first();
    const passwordInput = this.page.locator('input[type="password"]').first();
    const submitBtn = this.page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();

    await emailInput.fill(usernameOrEmail);
    await passwordInput.fill(password);
    await submitBtn.click();
  }

  async getErrorMessage(): Promise<string> {
    const err = this.page.locator('[role="alert"], .text-red, .error, [class*="error"]').first();
    await err.waitFor({ timeout: 5000 });
    return err.innerText();
  }

  async expectRedirectedToFeed() {
    await expect(this.page).toHaveURL('/', { timeout: 8000 });
  }

  async expectErrorVisible() {
    await expect(
      this.page.locator('[role="alert"], .text-red-500, [class*="error"]').first()
    ).toBeVisible({ timeout: 5000 });
  }
}
