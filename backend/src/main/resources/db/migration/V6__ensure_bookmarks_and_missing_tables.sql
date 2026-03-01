-- ============================================================
-- V6 — Ensure bookmarks table exists (idempotent recovery)
-- Root cause: V3/V5 may have been marked applied in Flyway
-- schema history without actually creating the bookmarks table
-- (e.g., due to a prior failed migration that was repaired).
-- This migration is fully idempotent — safe to run on any state.
-- ============================================================

-- Ensure pg_trgm extension (required by V5 indexes)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── bookmarks ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    post_id    BIGINT    NOT NULL REFERENCES posts(id)  ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bookmarks_user_post UNIQUE (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON bookmarks (post_id);

-- ── Verify all other core tables exist (safety net) ──────────

CREATE TABLE IF NOT EXISTS post_likes (
    id      BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_post_likes UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id           BIGSERIAL    PRIMARY KEY,
    recipient_id BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id     BIGINT                REFERENCES users(id) ON DELETE SET NULL,
    type         VARCHAR(20)  NOT NULL,
    reference_id BIGINT,
    message      VARCHAR(500) NOT NULL,
    read_flag    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP    NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
    id         BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id              BIGSERIAL     PRIMARY KEY,
    conversation_id BIGINT        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       BIGINT        NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
    content         VARCHAR(2000) NOT NULL,
    message_type    VARCHAR(20)   NOT NULL DEFAULT 'text',
    is_read         BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Ensure role column exists on users (added in V4)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- ── Missing indexes (idempotent) ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_post_likes_post  ON post_likes (post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user  ON post_likes (user_id);
CREATE INDEX IF NOT EXISTS idx_notif_recipient  ON notifications (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notif_read       ON notifications (read_flag);
CREATE INDEX IF NOT EXISTS idx_notif_created    ON notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON conversation_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation  ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender        ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread        ON messages (conversation_id, is_read) WHERE is_read = FALSE;
