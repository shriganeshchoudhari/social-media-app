import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { SEED, INVALID, newUser } from '../fixtures/test-data';
import { loginViaUI, logout } from '../helpers/auth';

// ─────────────────────────────────────────────────────────────
// Auth — Register
// ─────────────────────────────────────────────────────────────
test.describe('Register', () => {

  test('✅ new user can register successfully and is redirected to feed', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = newUser();

    await registerPage.goto();
    await registerPage.register(user);
    await registerPage.expectRedirectedToFeed();
    // Feed is accessible — URL is "/"
    await expect(page).toHaveURL('/');
  });

  test('✅ register page link is visible on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('a:has-text("Register"), a:has-text("Sign up"), a:has-text("Create account")').first()).toBeVisible();
  });

  test('❌ register with duplicate username shows error', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    // alice is a seed user — always exists
    await registerPage.goto();
    await registerPage.register({
      username: SEED.alice.username,
      email: 'newalice@playwright.test',
      password: SEED.alice.password,
      displayName: 'Alice Dup',
    });

    await registerPage.expectErrorVisible();
    // Must NOT navigate to feed
    await expect(page).not.toHaveURL('/');
  });

  test('❌ register with duplicate email shows error', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register({
      username: 'uniqueuser999',
      email: SEED.alice.email,   // alice@demo.com already taken
      password: 'Password1!',
      displayName: 'Unique User',
    });

    await registerPage.expectErrorVisible();
  });

  test('❌ register with short password shows validation error', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register({
      username: 'shortpwuser',
      email: 'shortpw@playwright.test',
      password: INVALID.shortPassword,
      displayName: 'Short PW',
    });

    await registerPage.expectErrorVisible();
  });

  test('❌ register with invalid email shows validation error', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register({
      username: 'bademailuser',
      email: INVALID.badEmail,
      password: 'Password1!',
      displayName: 'Bad Email',
    });

    await registerPage.expectErrorVisible();
  });

  test('❌ register with blank username shows validation error', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register({
      username: INVALID.emptyString,
      email: 'blank@playwright.test',
      password: 'Password1!',
      displayName: 'Blank User',
    });

    await registerPage.expectErrorVisible();
  });
});

// ─────────────────────────────────────────────────────────────
// Auth — Login
// ─────────────────────────────────────────────────────────────
test.describe('Login', () => {

  test('✅ login with username redirects to feed', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(SEED.alice.username, SEED.alice.password);
    await loginPage.expectRedirectedToFeed();
  });

  test('✅ login with email redirects to feed', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(SEED.alice.email, SEED.alice.password);
    await loginPage.expectRedirectedToFeed();
  });

  test('✅ after login, user name is visible in sidebar/header', async ({ page }) => {
    await loginViaUI(page, SEED.alice.username, SEED.alice.password);

    await expect(
      page.locator(`:has-text("${SEED.alice.username}"), :has-text("${SEED.alice.displayName}")`).first()
    ).toBeVisible();
  });

  test('❌ login with wrong password shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(SEED.alice.username, 'WrongPassword!');
    await loginPage.expectErrorVisible();
    await expect(page).not.toHaveURL('/');
  });

  test('❌ login with non-existent user shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(INVALID.nonExistentUser, 'Password1!');
    await loginPage.expectErrorVisible();
  });

  test('❌ login with blank credentials shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(INVALID.emptyString, INVALID.emptyString);
    await loginPage.expectErrorVisible();
  });

  test('✅ unauthenticated user visiting / is redirected to /login', async ({ page }) => {
    // Ensure no token in storage
    await page.goto('/');
    await expect(page).toHaveURL('/login', { timeout: 6000 });
  });

  test('✅ logout clears session and redirects to login', async ({ page }) => {
    await loginViaUI(page, SEED.alice.username, SEED.alice.password);

    // Click logout — look for logout button in sidebar
    await page.locator('button:has-text("Logout"), button:has-text("Log out"), button:has-text("Sign out")').first().click();
    await expect(page).toHaveURL('/login', { timeout: 6000 });

    // Verify storage cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('✅ after logout, navigating to / redirects back to login', async ({ page }) => {
    await loginViaUI(page, SEED.alice.username, SEED.alice.password);
    await logout(page);
    await page.goto('/');
    await expect(page).toHaveURL('/login', { timeout: 6000 });
  });

  test('✅ login page link to register is visible', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.locator('a:has-text("Register"), a:has-text("Sign up"), a:has-text("Create")').first()
    ).toBeVisible();
  });
});
