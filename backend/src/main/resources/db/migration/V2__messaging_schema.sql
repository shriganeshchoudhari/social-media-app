-- ============================================================
-- V2 — Messaging: conversations + messages
-- ============================================================

-- ── conversations ─────────────────────────────────────────────
-- A conversation is a 1:1 thread between exactly two users.
CREATE TABLE IF NOT EXISTS conversations (
    id         BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()   -- bumped on each new message
);

-- ── conversation_participants ─────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON conversation_participants (user_id);

-- ── messages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT       NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       BIGINT       NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
    content         VARCHAR(2000) NOT NULL,
    message_type    VARCHAR(20)  NOT NULL DEFAULT 'text',
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread       ON messages (conversation_id, is_read)
    WHERE is_read = FALSE;
