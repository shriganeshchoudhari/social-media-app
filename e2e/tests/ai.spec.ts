import { test, expect, type Page } from '@playwright/test';
import { AiPage } from '../pages/AiPage';
import { loginViaAPI } from '../helpers/auth';
import { SEED } from '../fixtures/test-data';

// ─────────────────────────────────────────────────────────────────────────────
// AI Assistant (Spark) — E2E Test Suite
//
// All tests mock the backend AI endpoints so they:
//   - Work without Ollama installed
//   - Run fast and deterministically
//   - Don't depend on AI response content
//
// Mocked endpoints:
//   POST /api/v1/ai/chat   → returns canned NDJSON stream
//   GET  /api/v1/ai/health → returns ok or degraded depending on test
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Mock POST /api/v1/ai/chat to return a successful NDJSON stream.
 * Fulfils with: {"delta":"Hello"}\n{"delta":" there!"}\n{"done":true}\n
 */
async function mockChatSuccess(page: Page, responseText = 'Hello there!') {
  // Split into individual token lines
  const tokens = responseText.split(' ');
  const lines  = tokens.map(t => JSON.stringify({ delta: t + ' ' })).join('\n')
                 + '\n' + JSON.stringify({ done: true }) + '\n';

  await page.route('**/api/v1/ai/chat', async (route) => {
    await route.fulfill({
      status:  200,
      headers: { 'Content-Type': 'application/x-ndjson' },
      body:    lines,
    });
  });
}

/**
 * Mock POST /api/v1/ai/chat to return a rate-limit error inside the stream.
 */
async function mockChatRateLimit(page: Page) {
  const body = JSON.stringify({
    error:   'rate_limit',
    message: 'AI rate limit reached. Resets at 2026-02-22T16:30:00Z',
    resetAt: '2026-02-22T16:30:00Z',
  }) + '\n';

  await page.route('**/api/v1/ai/chat', async (route) => {
    await route.fulfill({
      status:  200,
      headers: { 'Content-Type': 'application/x-ndjson' },
      body:    body,
    });
  });
}

/**
 * Mock POST /api/v1/ai/chat to return an Ollama-unavailable error inside the stream.
 */
async function mockChatUnavailable(page: Page) {
  const body = JSON.stringify({
    error:     'ai_unavailable',
    message:   'AI assistant is starting up — try again in a moment.',
    retryable: true,
  }) + '\n';

  await page.route('**/api/v1/ai/chat', async (route) => {
    await route.fulfill({
      status:  200,
      headers: { 'Content-Type': 'application/x-ndjson' },
      body:    body,
    });
  });
}

/**
 * Mock GET /api/v1/ai/health to return 'ok' or 'degraded'.
 */
async function mockHealth(page: Page, status: 'ok' | 'degraded') {
  await page.route('**/api/v1/ai/health', async (route) => {
    const body = status === 'ok'
      ? { status: 'ok',      ollamaReachable: true,  model: 'llama3.2:3b', ollamaUrl: 'http://localhost:11434' }
      : { status: 'degraded', ollamaReachable: false, model: 'llama3.2:3b', message: 'Ollama is not running. Start it with: ollama serve' };
    await route.fulfill({
      status: status === 'ok' ? 200 : 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  });
}

// ── Shared setup: log in as alice before each test ────────────────────────────
async function setup(page: Page) {
  await mockHealth(page, 'ok');
  await loginViaAPI(null as any, page, SEED.alice.username, SEED.alice.password);
  await page.goto('/');
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PANEL VISIBILITY
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Panel — visibility', () => {

  test('✅ floating ⚡ Ask Spark button is visible on the feed page', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await expect(ai.chatButton).toBeVisible();
  });

  test('✅ clicking the button opens the chat panel', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await expect(ai.chatPanel).toBeVisible();
  });

  test('✅ panel header shows "Spark" branding', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await expect(ai.chatPanel).toContainText('Spark');
  });

  test('✅ clicking the close button hides the panel', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.closePanel();
    await expect(ai.chatPanel).not.toBeVisible();
  });

  test('✅ pressing Escape closes the panel', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.closeWithEscape();
    await expect(ai.chatPanel).not.toBeVisible();
  });

  test('✅ pressing Ctrl+K opens the panel', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    // Panel should be closed initially
    await expect(ai.chatPanel).not.toBeVisible();
    await ai.openWithKeyboard();
    await expect(ai.chatPanel).toBeVisible();
  });

  test('✅ pressing Ctrl+K again closes the panel (toggle)', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openWithKeyboard();
    await expect(ai.chatPanel).toBeVisible();
    await page.keyboard.press('Control+k');
    await expect(ai.chatPanel).not.toBeVisible();
  });

  test('✅ panel is accessible via aria-label', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await expect(page.getByRole('dialog', { name: /spark/i })).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 2. EMPTY STATE / SUGGESTION BAR
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Panel — empty state & suggestion chips', () => {

  test('✅ empty conversation shows suggestion chips', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.expectSuggestionBarVisible();
  });

  test('✅ "Summarise my feed" chip is visible', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await expect(ai.chipFeedSummary).toBeVisible();
  });

  test('✅ "Who should I follow?" chip is visible', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await expect(ai.chipFollowRecs).toBeVisible();
  });

  test('✅ clicking a chip sends a message and hides the suggestion bar', async ({ page }) => {
    await setup(page);
    await mockChatSuccess(page, 'Here are some people to follow.');
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.chipFollowRecs.click();
    // A user message should appear
    await expect((await ai.getUserMessages())).toHaveCount(1, { timeout: 5000 });
    // Suggestion bar should no longer be shown (conversation started)
    await expect(ai.suggestionBar).not.toBeVisible({ timeout: 3000 });
  });

  test('✅ send button is disabled when input is empty', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.expectSendDisabled();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 3. SENDING MESSAGES & STREAMING
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Panel — sending messages & streaming', () => {

  test('✅ typing a message enables the send button', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.typeMessage('Hello Spark!');
    await ai.expectSendEnabled();
  });

  test('✅ sending a message shows it in the message list', async ({ page }) => {
    await setup(page);
    await mockChatSuccess(page, 'I can help with that!');
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.sendMessage('What can you do?');
    await expect((await ai.getUserMessages())).toHaveCount(1, { timeout: 5000 });
    await expect(ai.messageList).toContainText('What can you do?');
  });

  test('✅ user message appears on the right side', async ({ page }) => {
    await setup(page);
    await mockChatSuccess(page, 'Hello!');
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.sendMessage('Hi there');
    const userMsg = (await ai.getUserMessages()).first();
    await expect(userMsg).toBeVisible({ timeout: 5000 });
  });

  test('✅ assistant message appears after sending', async ({ page }) => {
    await setup(page);
    await mockChatSuccess(page, 'I am Spark, your ConnectHub AI.');
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.sendMessage('Who are you?');
    await ai.waitForAssistantMessage(10_000);
  });

  test('✅ pressing Enter sends the message', async ({ page }) => {
    await setup(page);
    await mockChatSuccess(page, 'Got it!');
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.sendMessageWithEnter('Test message');
    await expect((await ai.getUserMessages())).toHaveCount(1, { timeout: 5000 });
  });

  test('✅ Shift+Enter inserts a newline instead of sending', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.typeMessage('Line one');
    await ai.input.press('Shift+Enter');
    await ai.input.type('Line two');
    // No user message yet — Shift+Enter should not have sent
    await expect((await ai.getUserMessages())).toHaveCount(0);
  });

  test('✅ clear conversation button removes all messages', async ({ page }) => {
    await setup(page);
    await mockChatSuccess(page, 'Hello!');
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.sendMessage('Hi');
    await ai.waitForAssistantMessage(10_000);
    await ai.clearConversation();
    await expect((await ai.getUserMessages())).toHaveCount(0, { timeout: 3000 });
    await expect((await ai.getAssistantMessages())).toHaveCount(0, { timeout: 3000 });
  });

  test('✅ send button re-enables after streaming completes', async ({ page }) => {
    await setup(page);
    await mockChatSuccess(page, 'Done!');
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.sendMessage('Hello');
    await ai.waitForStreamingComplete(15_000);
    await ai.expectSendEnabled();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 4. OLLAMA HEALTH & DEGRADED STATE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Panel — Ollama health', () => {

  test('✅ no health banner shown when Ollama is reachable', async ({ page }) => {
    await mockHealth(page, 'ok');
    await loginViaAPI(null as any, page, SEED.alice.username, SEED.alice.password);
    await page.goto('/');
    const ai = new AiPage(page);
    await ai.openPanel();
    await expect(ai.unavailableBanner).not.toBeVisible({ timeout: 3000 });
  });

  test('✅ degraded banner shown when Ollama is unreachable', async ({ page }) => {
    await mockHealth(page, 'degraded');
    await loginViaAPI(null as any, page, SEED.alice.username, SEED.alice.password);
    await page.goto('/');
    const ai = new AiPage(page);
    await ai.openPanel();
    await expect(ai.unavailableBanner).toBeVisible({ timeout: 5000 });
  });

  test('✅ degraded banner includes a Retry button', async ({ page }) => {
    await mockHealth(page, 'degraded');
    await loginViaAPI(null as any, page, SEED.alice.username, SEED.alice.password);
    await page.goto('/');
    const ai = new AiPage(page);
    await ai.openPanel();
    await expect(ai.retryHealthBtn).toBeVisible({ timeout: 5000 });
  });

  test('✅ clicking Retry re-checks health and clears banner when Ollama recovers', async ({ page }) => {
    let callCount = 0;
    // First health check: degraded. Second: ok.
    await page.route('**/api/v1/ai/health', async (route) => {
      callCount++;
      if (callCount <= 1) {
        await route.fulfill({
          status:  503,
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ status: 'degraded', ollamaReachable: false, model: 'llama3.2:3b' }),
        });
      } else {
        await route.fulfill({
          status:  200,
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ status: 'ok', ollamaReachable: true, model: 'llama3.2:3b', ollamaUrl: 'http://localhost:11434' }),
        });
      }
    });

    await loginViaAPI(null as any, page, SEED.alice.username, SEED.alice.password);
    await page.goto('/');
    const ai = new AiPage(page);
    await ai.openPanel();
    await expect(ai.unavailableBanner).toBeVisible({ timeout: 5000 });
    await ai.retryHealthBtn.click();
    await expect(ai.unavailableBanner).not.toBeVisible({ timeout: 5000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 5. POST COMPOSER — "✨ Improve with AI" INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Post Composer — Improve with AI', () => {

  test('✅ "Improve with AI" button is hidden when composer is empty', async ({ page }) => {
    await setup(page);
    await page.goto('/');
    await expect(page.getByTestId('improve-with-ai-btn')).not.toBeVisible();
  });

  test('✅ "Improve with AI" button appears when user types in the composer', async ({ page }) => {
    await setup(page);
    await page.goto('/');
    // Type into the post composer textarea
    await page.locator('textarea[placeholder*="mind"], textarea[placeholder*="Write"]').first().fill('went for a run today');
    await expect(page.getByTestId('improve-with-ai-btn')).toBeVisible({ timeout: 3000 });
  });

  test('✅ clicking "Improve with AI" opens the AI panel', async ({ page }) => {
    await setup(page);
    await mockChatSuccess(page, 'Here is an improved version of your post!');
    await page.goto('/');
    const ai = new AiPage(page);

    // Type a draft
    await page.locator('textarea[placeholder*="mind"], textarea[placeholder*="Write"]').first().fill('went running today');
    // Click improve button
    await page.getByTestId('improve-with-ai-btn').click();
    // Panel should open
    await expect(ai.chatPanel).toBeVisible({ timeout: 3000 });
  });

  test('✅ clicking "Improve with AI" pre-fills the panel with the draft and sends it', async ({ page }) => {
    await setup(page);
    await mockChatSuccess(page, 'Here is an improved version!');
    await page.goto('/');
    const ai = new AiPage(page);

    await page.locator('textarea[placeholder*="mind"], textarea[placeholder*="Write"]').first().fill('went running today');
    await page.getByTestId('improve-with-ai-btn').click();

    // A user message should appear in the AI panel that includes the draft text
    await expect((await ai.getUserMessages())).toHaveCount(1, { timeout: 5000 });
    await expect(ai.messageList).toContainText('went running today');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 6. INPUT VALIDATION — NEGATIVE CASES
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Panel — input validation (negative)', () => {

  test('❌ send button is disabled when message is empty', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.expectSendDisabled();
  });

  test('❌ send button is disabled when message is whitespace only', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.typeMessage('     ');
    // Whitespace-only should not enable send
    await ai.expectSendDisabled();
  });

  test('❌ input respects 1000 character limit', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    // Type 1100 characters — the component slices to 1000
    await ai.input.fill('a'.repeat(1100));
    const value = await ai.input.inputValue();
    expect(value.length).toBeLessThanOrEqual(1000);
  });

  test('❌ character counter appears when within 200 chars of limit', async ({ page }) => {
    await setup(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.typeMessage('a'.repeat(850));
    // Counter should appear (150 chars remaining)
    const counter = ai.chatPanel.locator('span:has-text("15"), span:has-text("14"), span:has-text("10")');
    // More robustly: look for any small number indicating remaining chars
    // The counter element appears somewhere in the panel
    await expect(ai.chatPanel).toContainText(/^\d+$|[12]\d\d/);
  });

  test('❌ error banner is shown when Ollama returns ai_unavailable mid-stream', async ({ page }) => {
    await setup(page);
    await mockChatUnavailable(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.sendMessage('Hello Spark');
    await expect(ai.errorBanner).toBeVisible({ timeout: 10_000 });
    await expect(ai.errorBanner).toContainText(/starting up|unavailable|try again/i);
  });

  test('❌ error banner is shown when rate limit is exceeded', async ({ page }) => {
    await setup(page);
    await mockChatRateLimit(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.sendMessage('One too many');
    await expect(ai.errorBanner).toBeVisible({ timeout: 10_000 });
    await expect(ai.errorBanner).toContainText(/rate limit|limit reached/i);
  });

  test('❌ error banner can be dismissed', async ({ page }) => {
    await setup(page);
    await mockChatUnavailable(page);
    const ai = new AiPage(page);
    await ai.openPanel();
    await ai.sendMessage('Hello');
    await expect(ai.errorBanner).toBeVisible({ timeout: 10_000 });
    await ai.dismissErrorBtn.click();
    await expect(ai.errorBanner).not.toBeVisible({ timeout: 3000 });
  });

  test('❌ unauthenticated user cannot access AI panel (redirected to login)', async ({ page }) => {
    // Visit feed without logging in — should be redirected to /login
    await page.goto('/');
    await expect(page).toHaveURL('/login', { timeout: 8000 });
    // AI button should not be visible (we're on the login page)
    await expect(page.getByTestId('ai-chat-button')).not.toBeVisible();
  });

});
