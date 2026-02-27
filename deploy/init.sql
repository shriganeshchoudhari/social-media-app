-- ConnectHub – Postgres initialisation script
-- Run automatically by the Docker Compose postgres service on first start.
-- Flyway owns the schema; this script only enables extensions and
-- creates performance indexes that must exist before queries run.

-- Enable useful Postgres extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- fast LIKE / ILIKE via GIN index
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- uuid_generate_v4() helper

-- Ensure the public schema is owned by the app user
ALTER SCHEMA public OWNER TO socialmedia;
GRANT ALL ON SCHEMA public TO socialmedia;

-- ──────────────────────────────────────────────────────────────────────────
-- Performance indexes (idempotent — safe to run multiple times)
-- Created after Flyway runs migrations and tables exist.
-- ──────────────────────────────────────────────────────────────────────────

-- posts: GIN trigram index for fast content full-text search
-- Converts O(n) LIKE queries to O(log n) index scans
CREATE INDEX IF NOT EXISTS idx_posts_content_trgm
    ON posts USING gin (content gin_trgm_ops);

-- users: trigram index on username for fast user search
CREATE INDEX IF NOT EXISTS idx_users_username_trgm
    ON users USING gin (username gin_trgm_ops);

-- users: trigram index on display_name for fast user search
CREATE INDEX IF NOT EXISTS idx_users_displayname_trgm
    ON users USING gin (display_name gin_trgm_ops);

-- posts: B-tree index on author_id + created_at for fast profile/feed queries
CREATE INDEX IF NOT EXISTS idx_posts_author_created
    ON posts (author_id, created_at DESC);

-- notifications: composite index for fast unread-count queries
CREATE INDEX IF NOT EXISTS idx_notif_recipient_unread
    ON notifications (recipient_id, read_flag)
    WHERE read_flag = false;
