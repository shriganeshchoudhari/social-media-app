-- ============================================================
-- V7 — Fix NULL role values in users table
-- Root cause: The role column was added by V4 without a DEFAULT,
-- so existing rows have NULL. Hibernate's update mode cannot
-- enforce NOT NULL on a column that already contains NULLs.
-- This migration backfills NULLs and ensures the constraint holds.
-- ============================================================

-- Step 1: Add role column if it somehow doesn't exist yet (safety)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20);

-- Step 2: Backfill any NULL role values to 'USER'
UPDATE users SET role = 'USER' WHERE role IS NULL;

-- Step 3: Now safe to enforce NOT NULL
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- Step 4: Set default so future rows get 'USER' automatically
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';

-- Step 5: Also ensure the bookmarks table exists (catch-all)
CREATE TABLE IF NOT EXISTS bookmarks (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    post_id    BIGINT    NOT NULL REFERENCES posts(id)  ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bookmarks_user_post UNIQUE (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON bookmarks (post_id);
