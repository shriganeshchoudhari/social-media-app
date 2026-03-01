-- ============================================================
-- V1 — Initial schema for ConnectHub
-- Matches all JPA entities exactly (column names, types, constraints)
-- ============================================================

-- ── pg_trgm extension (required for trigram/ILIKE search indexes) ──
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id               BIGSERIAL PRIMARY KEY,
    username         VARCHAR(30)  NOT NULL UNIQUE,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    display_name     VARCHAR(60),
    bio              VARCHAR(200),
    avatar_url       VARCHAR(500),
    followers_count  INT          NOT NULL DEFAULT 0,
    following_count  INT          NOT NULL DEFAULT 0,
    posts_count      INT          NOT NULL DEFAULT 0,
    created_at       TIMESTAMP    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);

-- Trigram index for fast ILIKE search (requires pg_trgm extension)
CREATE INDEX IF NOT EXISTS idx_users_username_trgm    ON users USING gin (username    gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_display_name_trgm ON users USING gin (display_name gin_trgm_ops);

-- ── posts ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
    id             BIGSERIAL PRIMARY KEY,
    content        VARCHAR(2000) NOT NULL,
    image_url      VARCHAR(500),
    privacy        VARCHAR(20)   NOT NULL DEFAULT 'PUBLIC',
    author_id      BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    likes_count    INT           NOT NULL DEFAULT 0,
    comments_count INT           NOT NULL DEFAULT 0,
    created_at     TIMESTAMP     NOT NULL,
    updated_at     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_author    ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created   ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_privacy   ON posts (privacy);
-- Trigram index for content search
CREATE INDEX IF NOT EXISTS idx_posts_content_trgm ON posts USING gin (content gin_trgm_ops);

-- ── comments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id         BIGSERIAL PRIMARY KEY,
    content    VARCHAR(1000) NOT NULL,
    post_id    BIGINT        NOT NULL REFERENCES posts(id)    ON DELETE CASCADE,
    author_id  BIGINT        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    created_at TIMESTAMP     NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_post   ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments (author_id);

-- ── post_likes ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_likes (
    id      BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_post_likes UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes (post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes (user_id);

-- ── follows ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
    id           BIGSERIAL PRIMARY KEY,
    follower_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMP NOT NULL,
    CONSTRAINT uq_follows UNIQUE (follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower  ON follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows (following_id);

-- ── notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id           BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id     BIGINT                REFERENCES users(id) ON DELETE SET NULL,
    type         VARCHAR(20)  NOT NULL,
    reference_id BIGINT,
    message      VARCHAR(500) NOT NULL,
    read_flag    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notif_recipient ON notifications (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notif_read      ON notifications (read_flag);
CREATE INDEX IF NOT EXISTS idx_notif_created   ON notifications (created_at DESC);
