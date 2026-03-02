-- ============================================================
-- V10 — Notification preferences table
--
-- Creates a per-user, per-type opt-in/opt-out table.
-- One row per (user_id, type) pair.
-- inApp = true  → notification is delivered in-app (default).
-- inApp = false → notification is suppressed for that user/type.
--
-- Existing users get default rows (all types enabled = true)
-- inserted in bulk. New users get rows created on-demand by the
-- application (NotificationPreferenceService).
-- ============================================================

-- Ensure table exists with proper defaults (idempotent)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(30) NOT NULL,
    in_app     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_notif_pref_user_type UNIQUE (user_id, type)
);
CREATE INDEX IF NOT EXISTS idx_notif_pref_user ON notification_preferences (user_id);

-- Repair pre-existing rows/columns from earlier attempts
ALTER TABLE notification_preferences
    ALTER COLUMN in_app     SET DEFAULT TRUE,
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();
UPDATE notification_preferences
SET in_app     = COALESCE(in_app, TRUE),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW());
ALTER TABLE notification_preferences
    ALTER COLUMN in_app     SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

-- ── Seed default preferences for all existing users ──────────
-- For each existing user, insert one row per notification type
-- with inApp = TRUE. ON CONFLICT DO NOTHING makes this idempotent.

INSERT INTO notification_preferences (user_id, type, in_app)
SELECT u.id, t.type, TRUE
FROM users u
CROSS JOIN (
    VALUES
        ('LIKE'),
        ('COMMENT'),
        ('REPLY'),
        ('FOLLOW'),
        ('FOLLOW_REQUEST'),
        ('FOLLOW_ACCEPTED'),
        ('MENTION'),
        ('SHARE')
) AS t(type)
ON CONFLICT (user_id, type) DO NOTHING;

-- ── Add private_account column to users ──────────────────────
-- Supports the FOLLOW_REQUEST flow for private accounts.
ALTER TABLE users ADD COLUMN IF NOT EXISTS private_account BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Add status column to follows table ───────────────────────
-- ACCEPTED = normal follow; PENDING = awaiting approval (private accounts).
ALTER TABLE follows ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACCEPTED';
