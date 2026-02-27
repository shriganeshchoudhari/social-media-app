-- V4: Add user roles for admin panel support
-- Adds a 'role' column to users (USER or ADMIN).
-- Defaults to 'USER' for all existing accounts.

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- Create an index for fast admin queries filtering by role
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
