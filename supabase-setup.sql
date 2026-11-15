-- ============================================================
-- ShayariVerse X — Supabase Production Database Schema
-- Project Reference: shayariverse-x-db
-- Strict Zero-Cost Hybrid Cloud Architecture
-- ============================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle          VARCHAR(20) UNIQUE NOT NULL,          -- @handle (lowercase, alphanumeric + underscore)
    display_name    VARCHAR(30) NOT NULL,                 -- Non-unique display name
    bio             VARCHAR(150) DEFAULT '',              -- Profile bio (max 150 chars)
    pin_hash        VARCHAR(64) NOT NULL,                 -- SHA-256 hash of 4-digit PIN
    is_admin        BOOLEAN DEFAULT FALSE,                -- Admin God-Mode flag
    is_verified     BOOLEAN DEFAULT FALSE,                -- Verified Founder Badge flag
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast handle lookups & availability checks
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_handle ON users (handle);

-- ============================================================
-- 2. TABLE: shayaris
-- ============================================================
CREATE TABLE IF NOT EXISTS shayaris (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,                        -- Raw Shayari text
    formatted       TEXT,                                 -- Auto-formatted poetic text
    mood_theme      VARCHAR(20) DEFAULT 'purple',        -- purple | cyan | rose | amber
    font_style      VARCHAR(20) DEFAULT 'nastaliq',      -- nastaliq | elegant | clean
    song_name       VARCHAR(100),                        -- Attached song display name
    song_artist     VARCHAR(100),                        -- Song artist name
    song_url        TEXT,                                 -- Audio source URL (jsDelivr CDN or API preview)
    song_art        TEXT,                                 -- Album art URL
    song_source     VARCHAR(20) DEFAULT 'cdn',           -- 'cdn' | 'jiosaavn' | 'itunes'
    likes_count     INTEGER DEFAULT 0,                   -- Denormalized like counter
    comments_count  INTEGER DEFAULT 0,                   -- Denormalized comment counter
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for feed ordering (newest first)
CREATE INDEX IF NOT EXISTS idx_shayaris_created_at ON shayaris (created_at DESC);
-- Index for author profile page (all posts by a user)
CREATE INDEX IF NOT EXISTS idx_shayaris_user_id ON shayaris (user_id, created_at DESC);

-- ============================================================
-- 3. TABLE: likes
-- ============================================================
CREATE TABLE IF NOT EXISTS likes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shayari_id      UUID NOT NULL REFERENCES shayaris(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, shayari_id)                          -- One like per user per shayari
);

-- Index for checking if current user liked a post
CREATE INDEX IF NOT EXISTS idx_likes_user_shayari ON likes (user_id, shayari_id);
-- Index for counting likes on a post
CREATE INDEX IF NOT EXISTS idx_likes_shayari_id ON likes (shayari_id);

-- ============================================================
-- 4. TABLE: comments
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shayari_id      UUID NOT NULL REFERENCES shayaris(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,                        -- Comment text (max 300 chars)
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for loading comments on a shayari (oldest first)
CREATE INDEX IF NOT EXISTS idx_comments_shayari_id ON comments (shayari_id, created_at ASC);

-- ============================================================
-- 5. TABLE: reserved_handles (VIP handle lock)
-- ============================================================
CREATE TABLE IF NOT EXISTS reserved_handles (
    handle          VARCHAR(20) PRIMARY KEY,
    reason          VARCHAR(50) DEFAULT 'VIP Reserved',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. TABLE: admin_logs (Audit trail for admin actions)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id        UUID NOT NULL REFERENCES users(id),
    action          VARCHAR(50) NOT NULL,                 -- 'delete_shayari' | 'delete_comment'
    target_id       TEXT NOT NULL,                        -- ID of deleted shayari or comment
    target_type     VARCHAR(20) NOT NULL,                -- 'shayari' | 'comment'
    target_user_id  TEXT,                                -- Owner of the deleted content
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. SEED DATA: VIP Reserved Handles
-- ============================================================
INSERT INTO reserved_handles (handle, reason) VALUES
    ('aman', 'Founder Account'),
    ('beginneraman', 'Founder GitHub / Alias'),
    ('admin', 'System Reserved'),
    ('founder', 'System Reserved'),
    ('shayariversex', 'App Name Reserved'),
    ('svx', 'App Short Name Reserved')
ON CONFLICT (handle) DO NOTHING;

-- ============================================================
-- 8. SEED DATA: Pre-registered Founder Account (@aman)
-- Pre-seeded with Founder Verified & Admin flags enabled
-- Founder Authentication Hash
-- ============================================================
INSERT INTO users (handle, display_name, bio, pin_hash, is_admin, is_verified) VALUES (
    'aman',
    'Aman',
    'Creator & Architect of ShayariVerse X. Code meets Jazbaat.',
    '0753faaf9103d45f2869d4a061f639ffb173dd37d97cbe627becd3d60ef13572',
    TRUE,
    TRUE
)
ON CONFLICT (handle) DO NOTHING;

-- ============================================================
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shayaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserved_handles ENABLE ROW LEVEL SECURITY;

-- ---------------------
-- USERS Policies
-- ---------------------
DROP POLICY IF EXISTS "users_select_public" ON users;
CREATE POLICY "users_select_public" ON users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "users_insert_public" ON users;
CREATE POLICY "users_insert_public" ON users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "users_update_public" ON users;
CREATE POLICY "users_update_public" ON users
    FOR UPDATE USING (true);

-- ---------------------
-- SHAYARIS Policies
-- ---------------------
DROP POLICY IF EXISTS "shayaris_select_public" ON shayaris;
CREATE POLICY "shayaris_select_public" ON shayaris
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "shayaris_insert_public" ON shayaris;
CREATE POLICY "shayaris_insert_public" ON shayaris
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "shayaris_update_public" ON shayaris;
CREATE POLICY "shayaris_update_public" ON shayaris
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "shayaris_delete_public" ON shayaris;
CREATE POLICY "shayaris_delete_public" ON shayaris
    FOR DELETE USING (true);

-- ---------------------
-- LIKES Policies
-- ---------------------
DROP POLICY IF EXISTS "likes_select_public" ON likes;
CREATE POLICY "likes_select_public" ON likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "likes_insert_public" ON likes;
CREATE POLICY "likes_insert_public" ON likes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "likes_delete_public" ON likes;
CREATE POLICY "likes_delete_public" ON likes
    FOR DELETE USING (true);

-- ---------------------
-- COMMENTS Policies
-- ---------------------
DROP POLICY IF EXISTS "comments_select_public" ON comments;
CREATE POLICY "comments_select_public" ON comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "comments_insert_public" ON comments;
CREATE POLICY "comments_insert_public" ON comments
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "comments_delete_public" ON comments;
CREATE POLICY "comments_delete_public" ON comments
    FOR DELETE USING (true);

-- ---------------------
-- ADMIN_LOGS Policies
-- ---------------------
DROP POLICY IF EXISTS "admin_logs_select" ON admin_logs;
CREATE POLICY "admin_logs_select" ON admin_logs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_logs_insert" ON admin_logs;
CREATE POLICY "admin_logs_insert" ON admin_logs
    FOR INSERT WITH CHECK (true);

-- ---------------------
-- RESERVED_HANDLES Policies
-- ---------------------
DROP POLICY IF EXISTS "reserved_handles_select_public" ON reserved_handles;
CREATE POLICY "reserved_handles_select_public" ON reserved_handles
    FOR SELECT USING (true);

-- ============================================================
-- 10. DATABASE TRIGGERS: Denormalized Counter Sync
-- ============================================================

-- Function: Increment likes_count on shayaris
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shayaris SET likes_count = likes_count + 1 WHERE id = NEW.shayari_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_likes ON likes;
CREATE TRIGGER trigger_increment_likes
    AFTER INSERT ON likes
    FOR EACH ROW EXECUTE FUNCTION increment_likes_count();

-- Function: Decrement likes_count on shayaris
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shayaris SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.shayari_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_likes ON likes;
CREATE TRIGGER trigger_decrement_likes
    AFTER DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION decrement_likes_count();

-- Function: Increment comments_count on shayaris
CREATE OR REPLACE FUNCTION increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shayaris SET comments_count = comments_count + 1 WHERE id = NEW.shayari_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_comments ON comments;
CREATE TRIGGER trigger_increment_comments
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION increment_comments_count();

-- Function: Decrement comments_count on shayaris
CREATE OR REPLACE FUNCTION decrement_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shayaris SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.shayari_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_comments ON comments;
CREATE TRIGGER trigger_decrement_comments
    AFTER DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION decrement_comments_count();

-- ============================================================
-- 11. DATABASE FUNCTIONS: Handle Availability
-- ============================================================
CREATE OR REPLACE FUNCTION is_handle_available(check_handle VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM users WHERE LOWER(handle) = LOWER(check_handle)
    ) AND NOT EXISTS (
        SELECT 1 FROM reserved_handles WHERE LOWER(handle) = LOWER(check_handle)
    );
END;
$$ LANGUAGE plpgsql;
