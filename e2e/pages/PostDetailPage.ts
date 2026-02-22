import { Page, expect } from '@playwright/test';

/**
 * Page Object for /posts/:id (PostDetailPage.jsx)
 *
 * Provides typed accessors for all interactive elements on the post
 * detail page — post content, likes, comment list, and comment form.
 */
export class PostDetailPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ──────────────────────────────────────────────

  async goto(postId: number) {
    await this.page.goto(`/posts/${postId}`);
    await this.isLoaded();
  }

  async isLoaded() {
    // Either the post content area or the comment section should be present
    await expect(
      this.page.locator(
        'article, [data-testid="post-detail"], main p, .post-content'
      ).first()
    ).toBeVisible({ timeout: 8000 });
  }

  // ── Post content ────────────────────────────────────────────

  async getPostContent(): Promise<string> {
    return this.page.locator(
      '[data-testid="post-content"], .post-content, article p'
    ).first().innerText();
  }

  async getLikeCount(): Promise<number> {
    const text = await this.page.locator(
      '[data-testid="like-count"], .like-count, button[aria-label*="like" i]'
    ).first().innerText().catch(() => '0');
    return parseInt(text.replace(/\D/g, '')) || 0;
  }

  async getCommentCount(): Promise<number> {
    const text = await this.page.locator(
      '[data-testid="comment-count"], :has-text("comment")'
    ).first().innerText().catch(() => '0');
    return parseInt(text.replace(/\D/g, '')) || 0;
  }

  // ── Like ────────────────────────────────────────────────────

  likeButton() {
    return this.page.locator(
      'button[aria-label*="like" i], button:has-text("Like"), [data-testid="like-btn"]'
    ).first();
  }

  async clickLike() {
    await this.likeButton().click();
    await this.page.waitForTimeout(400);
  }

  // ── Comments ────────────────────────────────────────────────

  commentInput() {
    return this.page.locator(
      'input[placeholder*="comment" i], textarea[placeholder*="comment" i], [data-testid="comment-input"]'
    ).first();
  }

  async addComment(text: string) {
    await this.commentInput().fill(text);
    await this.commentInput().press('Enter');
    await this.page.waitForTimeout(800);
  }

  async addCommentViaButton(text: string) {
    await this.commentInput().fill(text);
    const submitBtn = this.page.locator(
      'button:has-text("Comment"), button[data-testid="comment-submit"]'
    ).first();
    if (await submitBtn.isVisible({ timeout: 1000 })) {
      await submitBtn.click();
    } else {
      await this.commentInput().press('Enter');
    }
    await this.page.waitForTimeout(800);
  }

  async getCommentItems() {
    return this.page.locator(
      '[data-testid="comment-item"], .comment-item, li:has(> .comment)'
    ).all();
  }

  async isCommentVisible(text: string): Promise<boolean> {
    return this.page.locator(`text="${text}"`).first().isVisible({ timeout: 5000 });
  }

  async deleteComment(commentText: string) {
    const commentEl = this.page.locator(`text="${commentText}"`).locator('..');
    const deleteBtn = commentEl.locator(
      'button:has-text("Delete"), button[aria-label*="delete" i]'
    ).first();
    if (await deleteBtn.isVisible({ timeout: 2000 })) {
      await deleteBtn.click();
      // Confirm if dialog appears
      const confirm = this.page.locator(
        'button:has-text("Yes"), button:has-text("Confirm")'
      ).first();
      if (await confirm.isVisible({ timeout: 1500 })) await confirm.click();
      await this.page.waitForTimeout(600);
    }
  }

  // ── Navigation ──────────────────────────────────────────────

  async clickBack() {
    await this.page.locator(
      'button:has-text("Back"), a:has-text("Back"), button[aria-label*="back" i]'
    ).first().click();
  }

  async clickAuthorName() {
    await this.page.locator(
      '[data-testid="author-link"], article a[href*="/profile/"]'
    ).first().click();
  }
}
