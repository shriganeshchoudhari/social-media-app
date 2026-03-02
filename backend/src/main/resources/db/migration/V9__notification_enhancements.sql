-- ============================================================
-- V9 — Notification enhancements
--   1. Add parent_comment_id to comments (reply threading)
--   2. Add notification_preferences table (per-user, per-type)
-- ============================================================

-- ── 1. Reply threading on comments ───────────────────────────
ALTER TABLE comments
    ADD COLUMN IF NOT EXISTS parent_comment_id BIGINT
        REFERENCES comments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_comments_parent
    ON comments (parent_comment_id);

-- ── 2. Notification preferences ──────────────────────────────
CREATE TABLE IF NOT EXISTS notification_preferences (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(30)  NOT NULL,
    in_app      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_notif_pref_user_type UNIQUE (user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_notif_pref_user ON notification_preferences (user_id);

-- ── 3. Widen the type column to support new enum values ───────
-- (V1 created it as VARCHAR(20) which is too narrow for FOLLOW_ACCEPTED etc.)
ALTER TABLE notifications
    ALTER COLUMN type TYPE VARCHAR(30);
