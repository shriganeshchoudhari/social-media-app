-- ============================================================
-- V3 — Bookmarks
-- ============================================================

CREATE TABLE IF NOT EXISTS bookmarks (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    post_id    BIGINT    NOT NULL REFERENCES posts(id)  ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bookmarks_user_post UNIQUE (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON bookmarks (post_id);
