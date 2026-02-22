# Database Schema Document
## Social Media Clone Application

**Version:** 1.0  
**Date:** February 07, 2026  
**Database:** PostgreSQL 15+, Redis 7+, Elasticsearch 8+

---

## Table of Contents

1. [Database Overview](#1-database-overview)
2. [PostgreSQL Schema](#2-postgresql-schema)
3. [Entity Relationships](#3-entity-relationships)
4. [Indexes & Constraints](#4-indexes--constraints)
5. [Database Triggers](#5-database-triggers)
6. [Redis Cache Schema](#6-redis-cache-schema)
7. [Elasticsearch Indexes](#7-elasticsearch-indexes)
8. [Data Migration Strategy](#8-data-migration-strategy)
9. [Backup & Recovery](#9-backup--recovery)
10. [Query Optimization](#10-query-optimization)

---

## 1. Database Overview

### 1.1 Database Strategy

| Database Type | Technology | Purpose | Justification |
|--------------|------------|---------|---------------|
| **Primary** | PostgreSQL 15 | Relational data | ACID compliance, complex queries, relationships |
| **Cache** | Redis 7 | Session, cache | In-memory speed, TTL support, pub/sub |
| **Search** | Elasticsearch 8 | Full-text search | Advanced search, analytics, aggregations |
| **Storage** | AWS S3 | Media files | Scalable object storage, CDN integration |

### 1.2 Database Distribution

**Auth Service**: PostgreSQL (users, tokens, oauth_connections)  
**User Service**: PostgreSQL + Redis (profiles, follows, user_stats)  
**Post Service**: PostgreSQL + Redis (posts, post_media, hashtags)  
**Interaction Service**: PostgreSQL (likes, comments, shares, bookmarks)  
**Messaging Service**: PostgreSQL (conversations, messages, participants)  
**Notification Service**: PostgreSQL + Redis (notifications, preferences)  
**Search Service**: Elasticsearch (indexed data)  
**Media Service**: PostgreSQL + S3 (metadata + files)  
**Admin Service**: PostgreSQL (reports, moderation_logs, analytics)

### 1.3 Naming Conventions

- **Tables**: Lowercase, plural nouns (e.g., `users`, `posts`)
- **Columns**: Lowercase with underscores (e.g., `user_id`, `created_at`)
- **Primary Keys**: `id` (BIGSERIAL)
- **Foreign Keys**: `{table}_id` (e.g., `user_id`, `post_id`)
- **Indexes**: `idx_{table}_{column(s)}` (e.g., `idx_users_email`)
- **Constraints**: `{table}_{constraint_type}` (e.g., `users_email_check`)

---

## 2. PostgreSQL Schema

### 2.1 Core Tables

#### 2.1.1 Users Table

```sql
CREATE TABLE users (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Authentication
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(100),
    bio TEXT,
    profile_picture_url VARCHAR(500),
    cover_photo_url VARCHAR(500),
    
    -- Additional Info
    location VARCHAR(100),
    website VARCHAR(255),
    birth_date DATE,
    
    -- Status Flags
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_private BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$'),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT birth_date_valid CHECK (birth_date <= CURRENT_DATE - INTERVAL '13 years')
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_is_verified ON users(is_verified) WHERE is_verified = TRUE;
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_active = TRUE;

-- Comments
COMMENT ON TABLE users IS 'Core user accounts and profile information';
COMMENT ON COLUMN users.username IS 'Unique username, 3-30 alphanumeric characters';
COMMENT ON COLUMN users.is_verified IS 'Verified badge for notable accounts';
COMMENT ON COLUMN users.is_private IS 'Private profile requires follow approval';
```

#### 2.1.2 User Settings Table

```sql
CREATE TABLE user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Privacy Settings
    profile_visibility VARCHAR(20) DEFAULT 'public',
    posts_visibility VARCHAR(20) DEFAULT 'public',
    show_followers BOOLEAN DEFAULT TRUE,
    show_following BOOLEAN DEFAULT TRUE,
    allow_messages_from VARCHAR(20) DEFAULT 'everyone',
    allow_mentions_from VARCHAR(20) DEFAULT 'everyone',
    
    -- Notification Preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    notification_likes BOOLEAN DEFAULT TRUE,
    notification_comments BOOLEAN DEFAULT TRUE,
    notification_follows BOOLEAN DEFAULT TRUE,
    notification_messages BOOLEAN DEFAULT TRUE,
    notification_mentions BOOLEAN DEFAULT TRUE,
    
    -- Display Preferences
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT visibility_check CHECK (profile_visibility IN ('public', 'followers', 'private')),
    CONSTRAINT theme_check CHECK (theme IN ('light', 'dark', 'auto'))
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

COMMENT ON TABLE user_settings IS 'User privacy and notification preferences';
```

#### 2.1.3 OAuth Connections Table

```sql
CREATE TABLE oauth_connections (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    
    UNIQUE(provider, provider_user_id),
    CONSTRAINT provider_check CHECK (provider IN ('google', 'github', 'facebook', 'apple'))
);

CREATE INDEX idx_oauth_user_id ON oauth_connections(user_id);
CREATE INDEX idx_oauth_provider ON oauth_connections(provider, provider_user_id);

COMMENT ON TABLE oauth_connections IS 'OAuth2 social login connections';
```

#### 2.1.4 User Stats Table

```sql
CREATE TABLE user_stats (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    posts_count INT DEFAULT 0,
    likes_received INT DEFAULT 0,
    comments_received INT DEFAULT 0,
    shares_received INT DEFAULT 0,
    profile_views INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT non_negative_counts CHECK (
        followers_count >= 0 AND 
        following_count >= 0 AND 
        posts_count >= 0 AND
        likes_received >= 0 AND
        comments_received >= 0 AND
        shares_received >= 0 AND
        profile_views >= 0
    )
);

CREATE INDEX idx_user_stats_followers ON user_stats(followers_count DESC);
CREATE INDEX idx_user_stats_posts ON user_stats(posts_count DESC);

COMMENT ON TABLE user_stats IS 'Aggregated user statistics for performance';
```

---

#### 2.1.5 Posts Table

```sql
CREATE TABLE posts (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Author
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    
    -- Metadata
    privacy_level VARCHAR(20) DEFAULT 'public',
    location VARCHAR(100),
    
    -- Edit Info
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    
    -- Engagement Counts
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT privacy_level_check CHECK (privacy_level IN ('public', 'followers', 'private')),
    CONSTRAINT content_length CHECK (LENGTH(content) BETWEEN 1 AND 5000),
    CONSTRAINT non_negative_counts CHECK (
        likes_count >= 0 AND 
        comments_count >= 0 AND 
        shares_count >= 0 AND
        views_count >= 0
    )
);

-- Indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_privacy ON posts(privacy_level);
CREATE INDEX idx_posts_engagement ON posts((likes_count + comments_count * 2 + shares_count * 3) DESC);

-- Full-text search index
CREATE INDEX idx_posts_content_search ON posts USING GIN(to_tsvector('english', content));

COMMENT ON TABLE posts IS 'User posts/updates with content and metadata';
COMMENT ON COLUMN posts.privacy_level IS 'Visibility: public, followers only, or private';
```

#### 2.1.6 Post Media Table

```sql
CREATE TABLE post_media (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    
    -- Media Info
    media_type VARCHAR(20) NOT NULL,
    media_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    
    -- Display Order
    media_order INT DEFAULT 0,
    
    -- File Metadata
    width INT,
    height INT,
    file_size BIGINT,
    duration INT, -- for videos in seconds
    mime_type VARCHAR(100),
    
    -- CDN URLs
    cdn_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT media_type_check CHECK (media_type IN ('image', 'video', 'gif')),
    CONSTRAINT dimensions_check CHECK (width > 0 AND height > 0),
    CONSTRAINT file_size_check CHECK (file_size > 0)
);

CREATE INDEX idx_post_media_post_id ON post_media(post_id, media_order);
CREATE INDEX idx_post_media_type ON post_media(media_type);

COMMENT ON TABLE post_media IS 'Media attachments for posts (images, videos, gifs)';
```

#### 2.1.7 Hashtags Table

```sql
CREATE TABLE hashtags (
    id BIGSERIAL PRIMARY KEY,
    tag VARCHAR(100) UNIQUE NOT NULL,
    normalized_tag VARCHAR(100) UNIQUE NOT NULL,
    usage_count INT DEFAULT 0,
    trending_score DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT tag_format CHECK (tag ~ '^[a-zA-Z0-9_]+$'),
    CONSTRAINT usage_count_check CHECK (usage_count >= 0)
);

CREATE INDEX idx_hashtags_tag ON hashtags(normalized_tag);
CREATE INDEX idx_hashtags_trending ON hashtags(trending_score DESC);
CREATE INDEX idx_hashtags_usage ON hashtags(usage_count DESC);

COMMENT ON TABLE hashtags IS 'Hashtag registry with trending scores';
COMMENT ON COLUMN hashtags.normalized_tag IS 'Lowercase version for case-insensitive matching';
```

#### 2.1.8 Post Hashtags (Junction Table)

```sql
CREATE TABLE post_hashtags (
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id BIGINT REFERENCES hashtags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (post_id, hashtag_id)
);

CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags(hashtag_id, created_at DESC);

COMMENT ON TABLE post_hashtags IS 'Many-to-many relationship between posts and hashtags';
```

#### 2.1.9 Mentions Table

```sql
CREATE TABLE mentions (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    mentioned_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    position INT, -- position in text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(post_id, mentioned_user_id)
);

CREATE INDEX idx_mentions_user ON mentions(mentioned_user_id, created_at DESC);
CREATE INDEX idx_mentions_post ON mentions(post_id);

COMMENT ON TABLE mentions IS 'User mentions (@username) in posts';
```

---

#### 2.1.10 Follows Table

```sql
CREATE TABLE follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'accepted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_self_follow CHECK (follower_id != following_id),
    CONSTRAINT status_check CHECK (status IN ('pending', 'accepted', 'rejected')),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_status ON follows(status);
CREATE INDEX idx_follows_composite ON follows(follower_id, following_id, status);

COMMENT ON TABLE follows IS 'Follow relationships between users';
COMMENT ON COLUMN follows.status IS 'pending for private accounts, accepted for public';
```

#### 2.1.11 Blocks Table

```sql
CREATE TABLE blocks (
    id BIGSERIAL PRIMARY KEY,
    blocker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id),
    UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);

COMMENT ON TABLE blocks IS 'Blocked users to prevent all interactions';
```

#### 2.1.12 Mutes Table

```sql
CREATE TABLE mutes (
    id BIGSERIAL PRIMARY KEY,
    muter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    muted_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mute_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_self_mute CHECK (muter_id != muted_id),
    UNIQUE(muter_id, muted_id)
);

CREATE INDEX idx_mutes_muter ON mutes(muter_id);

COMMENT ON TABLE mutes IS 'Muted users to hide content without blocking';
```

---

#### 2.1.13 Likes Table

```sql
CREATE TABLE likes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, post_id)
);

CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id, created_at DESC);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

COMMENT ON TABLE likes IS 'Post likes from users';
```

#### 2.1.14 Comments Table

```sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    
    -- Engagement
    likes_count INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    
    -- Edit Info
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT content_length CHECK (LENGTH(content) BETWEEN 1 AND 2000),
    CONSTRAINT non_negative_counts CHECK (likes_count >= 0 AND replies_count >= 0)
);

CREATE INDEX idx_comments_post_id ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

COMMENT ON TABLE comments IS 'Comments on posts with nested reply support';
```

#### 2.1.15 Comment Likes Table

```sql
CREATE TABLE comment_likes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_id BIGINT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, comment_id)
);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id);

COMMENT ON TABLE comment_likes IS 'Likes on comments';
```

#### 2.1.16 Shares Table

```sql
CREATE TABLE shares (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    share_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT share_message_length CHECK (LENGTH(share_message) <= 500)
);

CREATE INDEX idx_shares_post_id ON shares(post_id);
CREATE INDEX idx_shares_user_id ON shares(user_id, created_at DESC);

COMMENT ON TABLE shares IS 'Post shares/reposts with optional message';
```

#### 2.1.17 Bookmarks Table

```sql
CREATE TABLE bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    collection_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, post_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id, created_at DESC);
CREATE INDEX idx_bookmarks_collection ON bookmarks(user_id, collection_name);

COMMENT ON TABLE bookmarks IS 'Saved posts organized in collections';
```

---

#### 2.1.18 Conversations Table

```sql
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) DEFAULT 'direct',
    name VARCHAR(100),
    description TEXT,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    
    CONSTRAINT type_check CHECK (type IN ('direct', 'group'))
);

CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

COMMENT ON TABLE conversations IS 'Chat conversations (direct or group)';
```

#### 2.1.19 Conversation Participants Table

```sql
CREATE TABLE conversation_participants (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    notification_enabled BOOLEAN DEFAULT TRUE,
    
    UNIQUE(conversation_id, user_id),
    CONSTRAINT role_check CHECK (role IN ('admin', 'member'))
);

CREATE INDEX idx_conv_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id);

COMMENT ON TABLE conversation_participants IS 'Users participating in conversations';
```

#### 2.1.20 Messages Table

```sql
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    
    -- Media
    media_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    
    -- Status
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    
    CONSTRAINT message_type_check CHECK (message_type IN ('text', 'image', 'video', 'gif', 'file')),
    CONSTRAINT content_required CHECK (content IS NOT NULL OR media_url IS NOT NULL)
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

COMMENT ON TABLE messages IS 'Chat messages in conversations';
```

#### 2.1.21 Message Reads Table

```sql
CREATE TABLE message_reads (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(message_id, user_id)
);

CREATE INDEX idx_message_reads_message ON message_reads(message_id);
CREATE INDEX idx_message_reads_user ON message_reads(user_id);

COMMENT ON TABLE message_reads IS 'Read receipts for messages';
```

---

#### 2.1.22 Notifications Table

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Info
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    content TEXT,
    
    -- Reference
    reference_id BIGINT,
    reference_type VARCHAR(50),
    
    -- Actor (who triggered the notification)
    actor_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT type_check CHECK (type IN (
        'follow', 'follow_request', 'follow_accepted',
        'like', 'comment', 'mention', 'reply',
        'message', 'share', 'post_mention'
    ))
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_actor ON notifications(actor_id);
CREATE INDEX idx_notifications_reference ON notifications(reference_type, reference_id);

COMMENT ON TABLE notifications IS 'User notifications for various activities';
```

#### 2.1.23 Reports Table

```sql
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Reported Content
    reported_type VARCHAR(50) NOT NULL,
    reported_id BIGINT NOT NULL,
    reported_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    
    -- Report Details
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    resolution TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT reported_type_check CHECK (reported_type IN ('post', 'comment', 'user', 'message')),
    CONSTRAINT status_check CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed'))
);

CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_type ON reports(reported_type, reported_id);
CREATE INDEX idx_reports_user ON reports(reported_user_id);

COMMENT ON TABLE reports IS 'Content and user reports for moderation';
```

#### 2.1.24 Moderation Logs Table

```sql
CREATE TABLE moderation_logs (
    id BIGSERIAL PRIMARY KEY,
    moderator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id BIGINT NOT NULL,
    target_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT action_check CHECK (action IN (
        'delete_post', 'delete_comment', 'suspend_user', 
        'verify_user', 'warn_user', 'remove_content'
    ))
);

CREATE INDEX idx_moderation_logs_moderator ON moderation_logs(moderator_id);
CREATE INDEX idx_moderation_logs_target ON moderation_logs(target_type, target_id);
CREATE INDEX idx_moderation_logs_created ON moderation_logs(created_at DESC);

COMMENT ON TABLE moderation_logs IS 'Audit log of moderation actions';
```

---

## 3. Entity Relationships

### 3.1 ER Diagram (Text Representation)

```
USERS (1) ──────────< (M) POSTS
  │                          │
  │                          ├──< POST_MEDIA (M)
  │                          ├──< POST_HASHTAGS (M) ──> HASHTAGS
  │                          ├──< MENTIONS (M)
  │                          ├──< LIKES (M)
  │                          ├──< COMMENTS (M)
  │                          ├──< SHARES (M)
  │                          └──< BOOKMARKS (M)
  │
  ├──< USER_SETTINGS (1:1)
  ├──< USER_STATS (1:1)
  ├──< OAUTH_CONNECTIONS (M)
  ├──< FOLLOWS (M) [follower_id, following_id]
  ├──< BLOCKS (M) [blocker_id, blocked_id]
  ├──< MUTES (M) [muter_id, muted_id]
  ├──< CONVERSATIONS (M) via CONVERSATION_PARTICIPANTS
  ├──< MESSAGES (M)
  ├──< NOTIFICATIONS (M)
  └──< REPORTS (M)

CONVERSATIONS (1) ──< (M) MESSAGES
      │
      └──< (M) CONVERSATION_PARTICIPANTS ──> USERS

COMMENTS (1) ──< (M) COMMENT_LIKES
      │
      └──< (M) COMMENTS [parent_comment_id - self-referencing]
```

### 3.2 Key Relationships

**One-to-One**:
- users ↔ user_settings
- users ↔ user_stats

**One-to-Many**:
- users → posts
- users → comments
- users → messages
- posts → post_media
- posts → comments
- conversations → messages

**Many-to-Many** (via junction tables):
- users ↔ users (follows)
- posts ↔ hashtags (post_hashtags)
- users ↔ posts (likes, bookmarks, shares)
- users ↔ conversations (conversation_participants)

**Self-Referencing**:
- comments.parent_comment_id → comments.id (nested comments)

---

## 4. Indexes & Constraints

### 4.1 Index Strategy

**Primary Indexes** (automatically created):
```sql
-- All tables have primary key indexes on 'id'
```

**Foreign Key Indexes**:
```sql
-- Critical for JOIN performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

**Composite Indexes** (for common queries):
```sql
-- User's posts ordered by date
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- Follower relationship lookup
CREATE INDEX idx_follows_composite ON follows(follower_id, following_id, status);

-- User's notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

-- Conversation messages
CREATE INDEX idx_messages_conv_created ON messages(conversation_id, created_at DESC);
```

**Partial Indexes** (for filtered queries):
```sql
-- Only active users
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- Only verified users
CREATE INDEX idx_users_verified ON users(is_verified) WHERE is_verified = TRUE;

-- Only accepted follows
CREATE INDEX idx_follows_accepted ON follows(follower_id, following_id) 
WHERE status = 'accepted';
```

**Full-Text Search Indexes**:
```sql
-- Search post content
CREATE INDEX idx_posts_content_fts ON posts USING GIN(to_tsvector('english', content));

-- Search user profiles
CREATE INDEX idx_users_search_fts ON users USING GIN(
    to_tsvector('english', coalesce(display_name, '') || ' ' || coalesce(bio, ''))
);
```

### 4.2 Unique Constraints

```sql
-- Prevent duplicate data
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE hashtags ADD CONSTRAINT hashtags_tag_unique UNIQUE (normalized_tag);
ALTER TABLE follows ADD CONSTRAINT follows_unique UNIQUE (follower_id, following_id);
ALTER TABLE likes ADD CONSTRAINT likes_unique UNIQUE (user_id, post_id);
ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_unique UNIQUE (user_id, post_id);
```

### 4.3 Check Constraints

```sql
-- Validation rules
ALTER TABLE users ADD CONSTRAINT username_length 
    CHECK (LENGTH(username) BETWEEN 3 AND 30);

ALTER TABLE posts ADD CONSTRAINT content_not_empty 
    CHECK (LENGTH(TRIM(content)) > 0);

ALTER TABLE follows ADD CONSTRAINT no_self_follow 
    CHECK (follower_id != following_id);

ALTER TABLE comments ADD CONSTRAINT content_length 
    CHECK (LENGTH(content) BETWEEN 1 AND 2000);

ALTER TABLE user_stats ADD CONSTRAINT non_negative_stats 
    CHECK (followers_count >= 0 AND following_count >= 0 AND posts_count >= 0);
```

### 4.4 Foreign Key Constraints

```sql
-- Cascade deletes for dependent data
ALTER TABLE posts ADD CONSTRAINT fk_posts_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE comments ADD CONSTRAINT fk_comments_post 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE likes ADD CONSTRAINT fk_likes_post 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- Set NULL for optional references
ALTER TABLE conversations ADD CONSTRAINT fk_conversations_creator 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
```

---

## 5. Database Triggers

### 5.1 Auto-Update Timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

### 5.2 Update Post Counts

```sql
-- Update likes_count when like is added/removed
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_likes_count
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_comments_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Update shares_count
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET shares_count = GREATEST(0, shares_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_shares_count
    AFTER INSERT OR DELETE ON shares
    FOR EACH ROW EXECUTE FUNCTION update_post_shares_count();
```

### 5.3 Update User Stats

```sql
-- Update follower/following counts
CREATE OR REPLACE FUNCTION update_user_follow_counts()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
        -- Increment following count for follower
        UPDATE user_stats SET following_count = following_count + 1 
        WHERE user_id = NEW.follower_id;
        -- Increment followers count for following
        UPDATE user_stats SET followers_count = followers_count + 1 
        WHERE user_id = NEW.following_id;
        
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
        -- Decrement following count for follower
        UPDATE user_stats SET following_count = GREATEST(0, following_count - 1) 
        WHERE user_id = OLD.follower_id;
        -- Decrement followers count for following
        UPDATE user_stats SET followers_count = GREATEST(0, followers_count - 1) 
        WHERE user_id = OLD.following_id;
        
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        -- Follow request accepted
        UPDATE user_stats SET following_count = following_count + 1 
        WHERE user_id = NEW.follower_id;
        UPDATE user_stats SET followers_count = followers_count + 1 
        WHERE user_id = NEW.following_id;
    END IF;
    RETURN NULL;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_follow_counts
    AFTER INSERT OR UPDATE OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_user_follow_counts();

-- Update posts count
CREATE OR REPLACE FUNCTION update_user_posts_count()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_stats SET posts_count = posts_count + 1 WHERE user_id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_stats SET posts_count = GREATEST(0, posts_count - 1) WHERE user_id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_posts_count
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_user_posts_count();
```

### 5.4 Update Hashtag Usage

```sql
-- Update hashtag usage count
CREATE OR REPLACE FUNCTION update_hashtag_usage()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE hashtags SET 
            usage_count = usage_count + 1,
            last_used_at = CURRENT_TIMESTAMP
        WHERE id = NEW.hashtag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE hashtags SET 
            usage_count = GREATEST(0, usage_count - 1)
        WHERE id = OLD.hashtag_id;
    END IF;
    RETURN NULL;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hashtag_usage
    AFTER INSERT OR DELETE ON post_hashtags
    FOR EACH ROW EXECUTE FUNCTION update_hashtag_usage();
```

### 5.5 Initialize User Stats

```sql
-- Create user_stats entry when user is created
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER AS $
BEGIN
    INSERT INTO user_stats (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initialize_user_stats
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION initialize_user_stats();

-- Create user_settings entry when user is created
CREATE OR REPLACE FUNCTION initialize_user_settings()
RETURNS TRIGGER AS $
BEGIN
    INSERT INTO user_settings (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initialize_user_settings
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION initialize_user_settings();
```

---

## 6. Redis Cache Schema

### 6.1 Cache Keys & TTLs

**User Cache**:
```
user:{userId}                    → UserDTO (TTL: 5 minutes)
user:profile:{userId}            → ProfileDTO (TTL: 5 minutes)
user:stats:{userId}              → UserStatsDTO (TTL: 1 minute)
user:settings:{userId}           → SettingsDTO (TTL: 10 minutes)
user:followers:{userId}          → Set<userId> (TTL: 5 minutes)
user:following:{userId}          → Set<userId> (TTL: 5 minutes)
```

**Post Cache**:
```
post:{postId}                    → PostDTO (TTL: 10 minutes)
post:likes:{postId}              → Set<userId> (TTL: 5 minutes)
post:comments:{postId}           → List<CommentDTO> (TTL: 3 minutes)
post:user:{userId}               → List<PostDTO> (TTL: 5 minutes)
```

**Feed Cache**:
```
feed:{userId}                    → List<PostDTO> (TTL: 15 minutes)
feed:trending                    → List<PostDTO> (TTL: 30 minutes)
feed:explore                     → List<PostDTO> (TTL: 1 hour)
feed:hashtag:{tag}               → List<PostDTO> (TTL: 10 minutes)
```

**Session Cache**:
```
session:{sessionId}              → SessionDTO (TTL: 30 days)
session:user:{userId}            → Set<sessionId> (TTL: 30 days)
jwt:blacklist:{token}            → true (TTL: 24 hours)
refresh:token:{token}            → userId (TTL: 30 days)
```

**Rate Limiting**:
```
ratelimit:{userId}:{endpoint}    → count (TTL: 1 minute)
ratelimit:ip:{ipAddress}         → count (TTL: 1 minute)
ratelimit:global:{endpoint}      → count (TTL: 1 second)
```

**Real-time Data**:
```
online:users                     → Set<userId> (TTL: 5 minutes)
typing:{conversationId}:{userId} → timestamp (TTL: 10 seconds)
presence:{userId}                → status (TTL: 5 minutes)
```

**Trending & Analytics**:
```
trending:hashtags                → SortedSet<tag, score> (TTL: 1 hour)
trending:posts                   → SortedSet<postId, score> (TTL: 30 minutes)
trending:users                   → SortedSet<userId, score> (TTL: 1 hour)
analytics:daily:{date}           → JSONB (TTL: 7 days)
```

**Notification Queue**:
```
notifications:queue:{userId}     → List<NotificationDTO> (TTL: 1 hour)
notifications:unread:{userId}    → count (TTL: 5 minutes)
```

### 6.2 Cache Invalidation Strategy

**On User Update**:
```
DELETE user:{userId}
DELETE user:profile:{userId}
DELETE user:stats:{userId}
```

**On Post Creation**:
```
DELETE feed:{authorId}
DELETE feed:* (for all followers)
DELETE user:stats:{authorId}
INCR post:count:{authorId}
```

**On Like**:
```
INCR post:likes:count:{postId}
SADD post:likes:{postId} {userId}
DELETE feed:* (if count changed significantly)
```

**On Follow**:
```
SADD user:followers:{followingId} {followerId}
SADD user:following:{followerId} {followingId}
DELETE user:stats:{followerId}
DELETE user:stats:{followingId}
DELETE feed:{followerId}
```

### 6.3 Redis Data Structures

**Strings** (for simple values):
```redis
SET user:123 '{"id":123,"username":"john"}'
GET user:123
```

**Sets** (for unique collections):
```redis
SADD post:likes:456 123 789 234
SMEMBERS post:likes:456
SISMEMBER post:likes:456 123
```

**Sorted Sets** (for rankings):
```redis
ZADD trending:posts 95.5 post:123 92.3 post:456
ZREVRANGE trending:posts 0 9 WITHSCORES
```

**Lists** (for feeds, queues):
```redis
LPUSH feed:123 post:456
LRANGE feed:123 0 19
```

**Hashes** (for structured data):
```redis
HSET user:stats:123 followers 1500 following 300 posts 45
HGETALL user:stats:123
```

---

## 7. Elasticsearch Indexes

### 7.1 Users Index

```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2,
    "analysis": {
      "analyzer": {
        "username_analyzer": {
          "type": "custom",
          "tokenizer": "keyword",
          "filter": ["lowercase"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "long" },
      "username": { 
        "type": "text",
        "analyzer": "username_analyzer",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "display_name": { 
        "type": "text",
        "analyzer": "standard"
      },
      "bio": { 
        "type": "text",
        "analyzer": "standard"
      },
      "follower_count": { "type": "integer" },
      "following_count": { "type": "integer" },
      "posts_count": { "type": "integer" },
      "is_verified": { "type": "boolean" },
      "is_active": { "type": "boolean" },
      "created_at": { "type": "date" },
      "profile_picture_url": { "type": "keyword", "index": false }
    }
  }
}
```

### 7.2 Posts Index

```json
{
  "settings": {
    "number_of_shards": 4,
    "number_of_replicas": 2,
    "analysis": {
      "analyzer": {
        "hashtag_analyzer": {
          "type": "pattern",
          "pattern": "#([a-zA-Z0-9_]+)",
          "group": 1
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "long" },
      "user_id": { "type": "long" },
      "author_username": { "type": "keyword" },
      "author_display_name": { "type": "text" },
      "content": { 
        "type": "text",
        "analyzer": "standard"
      },
      "hashtags": { 
        "type": "keyword"
      },
      "mentions": { 
        "type": "keyword"
      },
      "privacy_level": { "type": "keyword" },
      "likes_count": { "type": "integer" },
      "comments_count": { "type": "integer" },
      "shares_count": { "type": "integer" },
      "engagement_score": { 
        "type": "float",
        "index": true
      },
      "created_at": { "type": "date" },
      "has_media": { "type": "boolean" },
      "media_type": { "type": "keyword" }
    }
  }
}
```

### 7.3 Hashtags Index

```json
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 2
  },
  "mappings": {
    "properties": {
      "id": { "type": "long" },
      "tag": { 
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "normalized_tag": { "type": "keyword" },
      "usage_count": { "type": "integer" },
      "trending_score": { "type": "float" },
      "created_at": { "type": "date" },
      "last_used_at": { "type": "date" }
    }
  }
}
```

### 7.4 Search Queries

**Search Users**:
```json
{
  "query": {
    "multi_match": {
      "query": "john doe",
      "fields": ["username^3", "display_name^2", "bio"],
      "type": "best_fields",
      "fuzziness": "AUTO"
    }
  },
  "sort": [
    { "is_verified": "desc" },
    { "follower_count": "desc" },
    "_score"
  ]
}
```

**Search Posts**:
```json
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "content": "spring boot tutorial"
          }
        }
      ],
      "filter": [
        { "term": { "privacy_level": "public" } }
      ]
    }
  },
  "sort": [
    { "engagement_score": "desc" },
    { "created_at": "desc" }
  ]
}
```

**Trending Hashtags**:
```json
{
  "query": {
    "match_all": {}
  },
  "sort": [
    { "trending_score": "desc" }
  ],
  "size": 20
}
```

---

## 8. Data Migration Strategy

### 8.1 Migration Tools

**Flyway Configuration**:
```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    validate-on-migrate: true
```

### 8.2 Migration File Naming

```
V1__Initial_schema.sql
V2__Add_user_settings.sql
V3__Add_notifications.sql
V4__Add_messaging.sql
V5__Add_indexes.sql
V6__Add_triggers.sql
```

### 8.3 Sample Migration Script

**V1__Initial_schema.sql**:
```sql
-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

### 8.4 Rollback Strategy

```sql
-- Flyway doesn't support automatic rollbacks
-- Create manual rollback scripts

-- R__Rollback_V5.sql
DROP TRIGGER IF EXISTS trigger_post_likes_count ON likes;
DROP INDEX IF EXISTS idx_posts_engagement;
```

---

## 9. Backup & Recovery

### 9.1 Backup Strategy

**Full Backup** (Daily at 2 AM):
```bash
#!/bin/bash
pg_dump -h localhost -U admin -d social_media \
  -F c -b -v -f /backups/full_backup_$(date +%Y%m%d).dump
```

**Incremental Backup** (Every 6 hours):
```bash
# Using WAL archiving
archive_command = 'cp %p /archive/%f'
```

**Backup Retention**:
- Daily backups: 30 days
- Weekly backups: 12 weeks
- Monthly backups: 12 months

### 9.2 Recovery Procedures

**Full Recovery**:
```bash
pg_restore -h localhost -U admin -d social_media_new \
  -v /backups/full_backup_20260207.dump
```

**Point-in-Time Recovery (PITR)**:
```bash
# Restore base backup
pg_restore -h localhost -d social_media /backups/base.dump

# Apply WAL logs up to specific time
restore_command = 'cp /archive/%f %p'
recovery_target_time = '2026-02-07 14:30:00'
```

### 9.3 Disaster Recovery Plan

**RTO (Recovery Time Objective)**: 4 hours  
**RPO (Recovery Point Objective)**: 1 hour

**Steps**:
1. Identify failure (automated monitoring)
2. Assess damage (data loss extent)
3. Activate failover database
4. Restore from latest backup
5. Apply transaction logs
6. Verify data integrity
7. Redirect application traffic
8. Monitor system health

---

## 10. Query Optimization

### 10.1 Common Query Patterns

**Get User Feed** (Optimized):
```sql
-- Without optimization (N+1 problem)
SELECT * FROM posts WHERE user_id IN (
    SELECT following_id FROM follows WHERE follower_id = ?
)
ORDER BY created_at DESC LIMIT 20;

-- Optimized with JOIN
SELECT p.*, u.username, u.profile_picture_url
FROM posts p
INNER JOIN follows f ON p.user_id = f.following_id
INNER JOIN users u ON p.user_id = u.id
WHERE f.follower_id = ? 
  AND f.status = 'accepted'
  AND p.privacy_level IN ('public', 'followers')
ORDER BY p.created_at DESC
LIMIT 20;

-- Further optimized with materialized view
CREATE MATERIALIZED VIEW user_feed_cache AS
SELECT f.follower_id, p.*
FROM posts p
INNER JOIN follows f ON p.user_id = f.following_id
WHERE f.status = 'accepted';

CREATE INDEX idx_feed_cache_follower ON user_feed_cache(follower_id, created_at DESC);
```

**Get Post with Engagement Data**:
```sql
-- Optimized single query
SELECT 
    p.*,
    u.username,
    u.profile_picture_url,
    (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
    EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
    EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
FROM posts p
INNER JOIN users u ON p.user_id = u.id
WHERE p.id = ?;
```

**Search Users with Pagination**:
```sql
-- Efficient pagination with keyset
SELECT * FROM users
WHERE (created_at, id) < (?, ?)
  AND username ILIKE ?
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### 10.2 Query Performance Tips

1. **Use EXPLAIN ANALYZE** to identify slow queries
2. **Avoid SELECT \*** - fetch only needed columns
3. **Use JOINs** instead of subqueries when possible
4. **Index foreign keys** used in JOINs
5. **Use LIMIT** for pagination
6. **Cache frequently accessed data** in Redis
7. **Use connection pooling** (HikariCP)
8. **Partition large tables** by date (posts, messages)

### 10.3 Database Partitioning

**Posts Table Partitioning** (by date):
```sql
-- Create partitioned table
CREATE TABLE posts_partitioned (
    id BIGSERIAL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE posts_2026_01 PARTITION OF posts_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE posts_2026_02 PARTITION OF posts_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Auto-create future partitions
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    start_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'posts_' || TO_CHAR(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF posts_partitioned
                    FOR VALUES FROM (%L) TO (%L)',
                   partition_name, start_date, end_date);
END;
$ LANGUAGE plpgsql;
```

---

## 11. Data Dictionary

### 11.1 Table Summary

| Table | Rows (Est.) | Purpose | Partition |
|-------|-------------|---------|-----------|
| users | 1M | User accounts | No |
| user_settings | 1M | User preferences | No |
| user_stats | 1M | Aggregated stats | No |
| posts | 50M | User posts | Yes (by date) |
| post_media | 100M | Media files | Yes (by date) |
| hashtags | 500K | Hashtag registry | No |
| post_hashtags | 150M | Post-hashtag links | Yes (by date) |
| follows | 10M | Follow relationships | No |
| likes | 500M | Post likes | Yes (by date) |
| comments | 200M | Post comments | Yes (by date) |
| messages | 100M | Chat messages | Yes (by date) |
| notifications | 50M | User notifications | Yes (by date) |

### 11.2 Column Descriptions

**users.is_verified**:
- Purpose: Indicates verified/notable accounts
- Values: TRUE/FALSE
- Default: FALSE
- Updated by: Admin panel

**posts.privacy_level**:
- Purpose: Controls post visibility
- Values: 'public', 'followers', 'private'
- Default: 'public'
- Business Rule: 'followers' only visible to accepted followers

**follows.status**:
- Purpose: Tracks follow request state
- Values: 'pending', 'accepted', 'rejected'
- Default: 'accepted' (public profiles), 'pending' (private profiles)

---

## Appendix

### A. Database Schema Version

**Current Version**: 1.0  
**Last Migration**: V6__Add_triggers.sql  
**Next Planned**: V7__Add_stories_table.sql

### B. Performance Benchmarks

| Query Type | Target | Actual | Status |
|------------|--------|--------|--------|
| User lookup by ID | < 10ms | 5ms | ✓ |
| Feed generation | < 200ms | 150ms | ✓ |
| Post creation | < 50ms | 30ms | ✓ |
| Search query | < 300ms | 250ms | ✓ |
| Follow operation | < 30ms | 20ms | ✓ |

### C. References

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Redis Documentation: https://redis.io/docs/
- Elasticsearch Guide: https://www.elastic.co/guide/
- Flyway Migrations: https://flywaydb.org/documentation/

---

**Document Prepared By**: Database Team  
**Last Updated**: February 07, 2026  
**Status**: Approved for Implementation