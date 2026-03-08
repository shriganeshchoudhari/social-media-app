# Database schema (current)

## Source of truth
- Flyway migrations: `backend/src/main/resources/db/migration/` (repo currently has V1 through V11)

## Key tables (by feature)
- Users/auth: `users` (includes `role`, `private_account`, denormalized counters)
- Posts: `posts` (includes `privacy`, optional `group_id`), `post_likes`, `comments`, `bookmarks`
- Follows: `follows` (includes `status` for private-account flows)
- Messaging: `conversations`, `conversation_participants`, `messages`
- Notifications: `notifications`, `notification_preferences`
- Groups (schema present; API not wired yet): `social_groups`, `group_members`, `group_invitations`

## Notes
- Trigram indexes rely on `pg_trgm` (see `deploy/init.sql`).
- Treat `docs/database_schema_doc.md` as reference only unless it is brought up to date; migrations remain authoritative.

