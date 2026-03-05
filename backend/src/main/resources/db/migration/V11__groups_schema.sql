-- ============================================================
-- V11 — Groups Feature
-- Tables: social_groups, group_members, group_invitations
-- Extends: posts (add group_id FK)
-- ============================================================

-- ── social_groups ─────────────────────────────────────────────
-- Table name uses 'social_groups' to avoid the reserved keyword 'groups'
CREATE TABLE IF NOT EXISTS social_groups (
    id              BIGSERIAL    PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    rules           VARCHAR(1000),
    privacy         VARCHAR(20)  NOT NULL DEFAULT 'PUBLIC'
                        CHECK (privacy IN ('PUBLIC', 'PRIVATE')),
    creator_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_image_url VARCHAR(500),
    created_at      TIMESTAMP    NOT NULL,
    updated_at      TIMESTAMP    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_groups_creator    ON social_groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_social_groups_privacy    ON social_groups(privacy);
CREATE INDEX IF NOT EXISTS idx_social_groups_created_at ON social_groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_groups_name_trgm  ON social_groups USING gin (name gin_trgm_ops);

-- ── group_members ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_members (
    id        BIGSERIAL   PRIMARY KEY,
    group_id  BIGINT      NOT NULL REFERENCES social_groups(id) ON DELETE CASCADE,
    user_id   BIGINT      NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
    role      VARCHAR(20) NOT NULL DEFAULT 'MEMBER'
                  CHECK (role IN ('ADMIN', 'MODERATOR', 'MEMBER')),
    joined_at TIMESTAMP   NOT NULL,
    CONSTRAINT uq_group_member UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user  ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role  ON group_members(group_id, role);

-- ── group_invitations ──────────────────────────────────────────
-- Covers both admin-sent INVITE and user-initiated JOIN_REQUEST flows
CREATE TABLE IF NOT EXISTS group_invitations (
    id         BIGSERIAL   PRIMARY KEY,
    group_id   BIGINT      NOT NULL REFERENCES social_groups(id) ON DELETE CASCADE,
    inviter_id BIGINT               REFERENCES users(id)          ON DELETE SET NULL,
    invitee_id BIGINT      NOT NULL REFERENCES users(id)          ON DELETE CASCADE,
    type       VARCHAR(20) NOT NULL CHECK (type   IN ('INVITE', 'JOIN_REQUEST')),
    status     VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    created_at TIMESTAMP   NOT NULL,
    updated_at TIMESTAMP   NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_group_invitations_group         ON group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_invitee       ON group_invitations(invitee_id, status);
CREATE INDEX IF NOT EXISTS idx_group_invitations_type_status   ON group_invitations(type, status);

-- ── posts: add optional group scope ───────────────────────────
ALTER TABLE posts ADD COLUMN IF NOT EXISTS group_id BIGINT
    REFERENCES social_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_group_id ON posts(group_id, created_at DESC);

-- ── notifications: widen type column for new GROUP_* values ───
ALTER TABLE notifications ALTER COLUMN type TYPE VARCHAR(30);
