-- ============================================================
-- V8 — Add role column to users table (guaranteed execution)
-- Root cause: Hibernate's ddl-auto=update silently failed to
-- add `role` as NOT NULL because existing rows had NULL values.
-- PostgreSQL rejects adding a NOT NULL column without a DEFAULT
-- when the table already has rows that would violate it.
-- V6/V7 were already marked applied in flyway_schema_history
-- so they were skipped. This V8 is guaranteed to run fresh.
-- ============================================================

-- Step 1: Add column as nullable first (always succeeds, even with existing rows)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20);

-- Step 2: Backfill every NULL or empty value to 'USER'
UPDATE users SET role = 'USER' WHERE role IS NULL OR role = '';

-- Step 3: Now safe to enforce NOT NULL (no NULLs remain)
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- Step 4: Set DEFAULT so all future INSERTs get 'USER' automatically
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';

-- Verify bookmarks table also exists (belt-and-suspenders)
CREATE TABLE IF NOT EXISTS bookmarks (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    post_id    BIGINT    NOT NULL REFERENCES posts(id)  ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bookmarks_user_post UNIQUE (user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON bookmarks (post_id);
