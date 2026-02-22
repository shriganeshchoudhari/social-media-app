import { Page, BrowserContext } from '@playwright/test';

const BASE_URL = 'http://localhost:9090/api/v1';

/**
 * Logs into the app via the UI and waits for the feed to load.
 */
export async function loginViaUI(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.locator('input[name="usernameOrEmail"], input[type="text"]').first().fill(username);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
  await page.waitForURL('/', { timeout: 10000 });
}

/**
 * Logs in directly via API, stores the JWT in localStorage, then reloads.
 * Faster than UI login; use for tests that don't need to test the login form itself.
 */
export async function loginViaAPI(context: BrowserContext, page: Page, username: string, password: string) {
  const response = await page.request.post(`${BASE_URL}/auth/login`, {
    data: { usernameOrEmail: username, password },
  });

  const body = await response.json();
  const token: string = body.token;
  const user = body.user;

  // Inject token and user into localStorage
  await page.goto('/login');
  await page.evaluate(([t, u]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }, [token, JSON.stringify(user)] as [string, string]);

  await page.goto('/');
  await page.waitForURL('/');
}

/**
 * Registers a new user via API and logs them in via localStorage injection.
 */
export async function registerAndLogin(
  page: Page,
  opts: { username: string; email: string; password: string; displayName: string }
) {
  const regResp = await page.request.post(`${BASE_URL}/auth/register`, { data: opts });
  const body = await regResp.json();
  const token: string = body.token;
  const user = body.user;

  await page.goto('/login');
  await page.evaluate(([t, u]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }, [token, JSON.stringify(user)] as [string, string]);

  await page.goto('/');
  await page.waitForURL('/');
}

/**
 * Clears auth state (localStorage) and navigates to login page.
 */
export async function logout(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  });
  await page.goto('/login');
}

/**
 * Creates a post directly via API for test setup.
 */
export async function createPostViaAPI(
  page: Page,
  token: string,
  content: string,
  privacy: 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE' = 'PUBLIC'
): Promise<number> {
  const resp = await page.request.post(`${BASE_URL}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { content, privacy },
  });
  const body = await resp.json();
  return body.id as number;
}

/**
 * Gets a JWT token for a user via API (for test setup only).
 */
export async function getToken(page: Page, username: string, password: string): Promise<string> {
  const resp = await page.request.post(`${BASE_URL}/auth/login`, {
    data: { usernameOrEmail: username, password },
  });
  const body = await resp.json();
  return body.token as string;
}
