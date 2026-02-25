import { type Page, type Locator, expect } from '@playwright/test';

/**
 * AiPage — Page Object Model for the Spark AI assistant.
 *
 * Wraps all interactions with:
 *   - The floating ⚡ AiChatButton
 *   - The AiChatPanel slide-over
 *   - The suggestion chips (AiSuggestionBar)
 *   - The "✨ Improve with AI" button in PostComposer
 *
 * Uses data-testid selectors exclusively for robustness against UI refactors.
 */
export class AiPage {
  readonly page: Page;

  // Panel elements
  readonly chatButton:    Locator;
  readonly chatPanel:     Locator;
  readonly closeButton:   Locator;
  readonly messageList:   Locator;
  readonly input:         Locator;
  readonly sendButton:    Locator;
  readonly clearButton:   Locator;

  // Banners
  readonly errorBanner:      Locator;
  readonly dismissErrorBtn:  Locator;
  readonly unavailableBanner: Locator;
  readonly retryHealthBtn:   Locator;

  // Suggestion chips
  readonly suggestionBar:    Locator;
  readonly chipFeedSummary:  Locator;
  readonly chipFollowRecs:   Locator;
  readonly chipPostIdeas:    Locator;
  readonly chipHelp:         Locator;

  // PostComposer integration
  readonly improveWithAiBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.chatButton     = page.getByTestId('ai-chat-button');
    this.chatPanel      = page.getByTestId('ai-chat-panel');
    this.closeButton    = page.getByTestId('ai-panel-close');
    this.messageList    = page.getByTestId('ai-message-list');
    this.input          = page.getByTestId('ai-input');
    this.sendButton     = page.getByTestId('ai-send-btn');
    this.clearButton    = page.getByTestId('clear-conversation-btn');

    this.errorBanner       = page.getByTestId('ai-error-banner');
    this.dismissErrorBtn   = page.getByTestId('dismiss-error-btn');
    this.unavailableBanner = page.getByTestId('ollama-unavailable-banner');
    this.retryHealthBtn    = page.getByTestId('retry-health-btn');

    this.suggestionBar    = page.getByTestId('suggestion-bar');
    this.chipFeedSummary  = page.getByTestId('chip-feed-summary');
    this.chipFollowRecs   = page.getByTestId('chip-follow-recs');
    this.chipPostIdeas    = page.getByTestId('chip-post-ideas');
    this.chipHelp         = page.getByTestId('chip-help');

    this.improveWithAiBtn = page.getByTestId('improve-with-ai-btn');
  }

  // ── Open / Close ──────────────────────────────────────────────────────────

  async openPanel() {
    await this.chatButton.click();
    await expect(this.chatPanel).toBeVisible({ timeout: 3000 });
  }

  async closePanel() {
    await this.closeButton.click();
    await expect(this.chatPanel).not.toBeVisible({ timeout: 3000 });
  }

  async openWithKeyboard() {
    // Ctrl+K on Linux/Windows, Cmd+K on Mac — Playwright uses 'Meta' for Cmd
    await this.page.keyboard.press('Control+k');
    await expect(this.chatPanel).toBeVisible({ timeout: 3000 });
  }

  async closeWithEscape() {
    await this.page.keyboard.press('Escape');
    await expect(this.chatPanel).not.toBeVisible({ timeout: 3000 });
  }

  // ── Send a message ────────────────────────────────────────────────────────

  async typeMessage(text: string) {
    await this.input.click();
    await this.input.fill(text);
  }

  async sendMessage(text: string) {
    await this.typeMessage(text);
    await this.sendButton.click();
  }

  async sendMessageWithEnter(text: string) {
    await this.typeMessage(text);
    await this.input.press('Enter');
  }

  // ── Wait for response ─────────────────────────────────────────────────────

  /**
   * Wait for the typing indicator to appear (first token not yet received).
   */
  async waitForTypingIndicator(timeout = 8000) {
    await expect(
      this.page.getByTestId('typing-indicator')
    ).toBeVisible({ timeout });
  }

  /**
   * Wait for at least one assistant message to be visible in the list.
   */
  async waitForAssistantMessage(timeout = 30_000) {
    await expect(
      this.messageList.getByTestId('assistant-message').first()
    ).toBeVisible({ timeout });
  }

  /**
   * Wait for streaming to finish (send button re-enables).
   */
  async waitForStreamingComplete(timeout = 60_000) {
    await expect(this.sendButton).toBeEnabled({ timeout });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  async getAssistantMessages(): Promise<Locator> {
    return this.messageList.getByTestId('assistant-message');
  }

  async getUserMessages(): Promise<Locator> {
    return this.messageList.getByTestId('user-message');
  }

  async getLastAssistantText(): Promise<string> {
    const msgs = this.messageList.getByTestId('assistant-message');
    const count = await msgs.count();
    if (count === 0) return '';
    return (await msgs.nth(count - 1).textContent()) ?? '';
  }

  async clearConversation() {
    await this.clearButton.click();
  }

  /**
   * Check if the suggestion bar (empty-state chips) is visible.
   */
  async expectSuggestionBarVisible() {
    await expect(this.suggestionBar).toBeVisible();
  }

  /**
   * Expect the send button to be disabled (e.g. when input is empty).
   */
  async expectSendDisabled() {
    await expect(this.sendButton).toBeDisabled();
  }

  /**
   * Expect the send button to be enabled.
   */
  async expectSendEnabled() {
    await expect(this.sendButton).toBeEnabled();
  }
}
