-- ConnectHub – Postgres initialisation script
-- Run automatically by the Docker Compose postgres service on first start.
-- With spring.jpa.hibernate.ddl-auto=update Hibernate will create/alter
-- the tables; this script only ensures extensions & the schema exist.

-- Enable useful Postgres extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- fast LIKE / ILIKE via GIN index
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- uuid_generate_v4() helper

-- Ensure the public schema is owned by the app user
ALTER SCHEMA public OWNER TO socialmedia;
GRANT ALL ON SCHEMA public TO socialmedia;

-- ──────────────────────────────────────────────────────────────────────────
-- Performance indexes (created after Hibernate builds the tables)
-- These are idempotent – safe to run multiple times.
-- ──────────────────────────────────────────────────────────────────────────

-- posts: GIN trigram index for fast content search
-- (run AFTER Hibernate first creates the table)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_content_trgm
--     ON posts USING gin (content gin_trgm_ops);

-- users: trigram index on username + display_name for search
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_trgm
--     ON users USING gin (username gin_trgm_ops);
