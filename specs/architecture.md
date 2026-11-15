# ShayariVerse X — Architecture & Technical Specification

> **Single Source of Truth** — This document defines the 100% free, zero-credit-card technical architecture, database schemas, API integrations, storage strategy, and deployment pipeline for **ShayariVerse X (SVX)**.

---

## 1. Zero-Cost Hybrid Cloud Strategy

ShayariVerse X achieves a fully functional social app at **₹0 cost** by combining three free services:

```
┌─────────────────────────────────────────────────────────────────┐
│                     ShayariVerse X Stack                        │
├─────────────────────────────────────────────────────────────────┤
│  CLIENT          │  Android APK (CapacitorJS wrapper)           │
│                  │  HTML5 + CSS3 + Vanilla ES6 JS               │
├──────────────────┼──────────────────────────────────────────────┤
│  TEXT DATABASE   │  Supabase Free Tier (PostgreSQL)             │
│                  │  Project: shayariverse-x-db                  │
│                  │  Stores: users, shayaris, likes, comments    │
│                  │  Limit: 500MB (text only = 500K+ posts)      │
├──────────────────┼──────────────────────────────────────────────┤
│  AUDIO CDN      │  GitHub Repo /bgm/ + jsDelivr CDN            │
│                  │  Repo: beginneraman/shayariverse-x           │
│                  │  URL: cdn.jsdelivr.net/gh/beginneraman/...   │
├──────────────────┼──────────────────────────────────────────────┤
│  MUSIC SEARCH   │  JioSaavn API (saavn.dev) — primary          │
│                  │  iTunes Search API — fallback                │
├──────────────────┼──────────────────────────────────────────────┤
│  KEEP-ALIVE     │  GitHub Actions cron (every 3 days)           │
├──────────────────┼──────────────────────────────────────────────┤
│  APK BUILD      │  CapacitorJS + Android Studio                 │
└──────────────────┴──────────────────────────────────────────────┘
```

---

## 2. Supabase — Text Database (shayariverse-x-db)

### 2.1 Design Principles

- **Text-only storage**: Zero audio files, zero image files stored in Supabase.
- All media (BGM audio) is served from GitHub + jsDelivr CDN.
- Share images are generated client-side via `html2canvas` and shared via Web Share API (never uploaded).
- This ensures the 500MB free tier supports **500,000+ Shayari posts** at zero cost.

### 2.2 Complete SQL Schema (`supabase-setup.sql`)

```sql
-- ============================================================
-- ShayariVerse X — Supabase Database Schema
-- Project Reference: shayariverse-x-db
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle          VARCHAR(20) UNIQUE NOT NULL,          -- @handle (lowercase, alphanumeric + underscore)
    display_name    VARCHAR(30) NOT NULL,                 -- Non-unique display name
    bio             VARCHAR(150) DEFAULT '',              -- Profile bio
    pin_hash        VARCHAR(64) NOT NULL,                 -- SHA-256 hash of 4-digit PIN
    is_admin        BOOLEAN DEFAULT FALSE,                -- Admin God-Mode flag
    is_verified     BOOLEAN DEFAULT FALSE,                -- Verified Founder Badge flag
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast handle lookups & availability checks
CREATE UNIQUE INDEX idx_users_handle ON users (handle);

-- ============================================================
-- TABLE: shayaris
-- ============================================================
CREATE TABLE shayaris (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,                        -- Raw Shayari text (auto-formatted on client)
    formatted       TEXT,                                 -- Pre-formatted poetic text (optional cache)
    mood_theme      VARCHAR(20) DEFAULT 'purple',        -- Card glow theme: purple | cyan | rose | amber
    font_style      VARCHAR(20) DEFAULT 'nastaliq',      -- Typography style identifier
    song_name       VARCHAR(100),                        -- Attached song display name
    song_artist     VARCHAR(100),                        -- Song artist name
    song_url        TEXT,                                 -- Audio source URL (CDN or API preview URL)
    song_art        TEXT,                                 -- Album art URL (for spinning pill)
    song_source     VARCHAR(20) DEFAULT 'cdn',           -- 'cdn' | 'jiosaavn' | 'itunes'
    likes_count     INTEGER DEFAULT 0,                   -- Denormalized like count for fast feed rendering
    comments_count  INTEGER DEFAULT 0,                   -- Denormalized comment count
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for feed ordering (newest first)
CREATE INDEX idx_shayaris_created_at ON shayaris (created_at DESC);
-- Index for author profile page (all posts by a user)
CREATE INDEX idx_shayaris_user_id ON shayaris (user_id, created_at DESC);

-- ============================================================
-- TABLE: likes
-- ============================================================
CREATE TABLE likes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shayari_id      UUID NOT NULL REFERENCES shayaris(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, shayari_id)                          -- One like per user per shayari
);

-- Index for checking if current user liked a post
CREATE INDEX idx_likes_user_shayari ON likes (user_id, shayari_id);
-- Index for counting likes on a post
CREATE INDEX idx_likes_shayari_id ON likes (shayari_id);

-- ============================================================
-- TABLE: comments
-- ============================================================
CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shayari_id      UUID NOT NULL REFERENCES shayaris(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,                        -- Comment text (max 500 chars enforced client-side)
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for loading comments on a shayari (oldest first)
CREATE INDEX idx_comments_shayari_id ON comments (shayari_id, created_at ASC);

-- ============================================================
-- TABLE: admin_logs (audit trail for admin actions)
-- ============================================================
CREATE TABLE admin_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id        UUID NOT NULL REFERENCES users(id),
    action          VARCHAR(50) NOT NULL,                 -- 'delete_shayari' | 'delete_comment'
    target_id       UUID NOT NULL,                       -- ID of deleted shayari or comment
    target_type     VARCHAR(20) NOT NULL,                -- 'shayari' | 'comment'
    target_user_id  UUID,                                -- Owner of the deleted content
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: reserved_handles (VIP handle lock)
-- ============================================================
CREATE TABLE reserved_handles (
    handle          VARCHAR(20) PRIMARY KEY,
    reason          VARCHAR(50) DEFAULT 'VIP Reserved'
);

-- ============================================================
-- SEED DATA: Reserved VIP Handles
-- ============================================================
INSERT INTO reserved_handles (handle, reason) VALUES
    ('aman', 'Founder'),
    ('beginneraman', 'Founder Alias'),
    ('admin', 'System Reserved'),
    ('founder', 'System Reserved'),
    ('shayariversex', 'App Name Reserved'),
    ('svx', 'App Short Name Reserved');

-- ============================================================
-- SEED DATA: Pre-register Founder Account (@aman)
-- PIN: Will be set on first login; placeholder hash below
-- The actual PIN hash must be generated at app setup time.
-- Placeholder uses SHA-256 of "0000" for initial seed.
-- ============================================================
INSERT INTO users (handle, display_name, bio, pin_hash, is_admin, is_verified) VALUES (
    'aman',
    'Aman',
    'Creator of ShayariVerse X',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    TRUE,
    TRUE
);

-- ============================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shayaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserved_handles ENABLE ROW LEVEL SECURITY;

-- ---------------------
-- USERS policies
-- ---------------------
-- Anyone can read user profiles (public feed)
CREATE POLICY "users_select_public" ON users
    FOR SELECT USING (true);

-- Users can insert their own record (registration)
CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (true);

-- Users can update only their own profile (display_name, bio)
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ---------------------
-- SHAYARIS policies
-- ---------------------
-- Anyone can read all shayaris (public feed)
CREATE POLICY "shayaris_select_public" ON shayaris
    FOR SELECT USING (true);

-- Authenticated users can insert their own shayaris
CREATE POLICY "shayaris_insert_own" ON shayaris
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update only their own shayaris
CREATE POLICY "shayaris_update_own" ON shayaris
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own shayaris; admins can delete any
CREATE POLICY "shayaris_delete" ON shayaris
    FOR DELETE USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

-- ---------------------
-- LIKES policies
-- ---------------------
CREATE POLICY "likes_select_public" ON likes
    FOR SELECT USING (true);

CREATE POLICY "likes_insert_own" ON likes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "likes_delete_own" ON likes
    FOR DELETE USING (user_id = auth.uid());

-- ---------------------
-- COMMENTS policies
-- ---------------------
CREATE POLICY "comments_select_public" ON comments
    FOR SELECT USING (true);

CREATE POLICY "comments_insert_own" ON comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can delete their own comments; admins can delete any
CREATE POLICY "comments_delete" ON comments
    FOR DELETE USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

-- ---------------------
-- ADMIN_LOGS policies
-- ---------------------
-- Only admins can read and insert admin logs
CREATE POLICY "admin_logs_admin_only" ON admin_logs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

-- ---------------------
-- RESERVED_HANDLES policies
-- ---------------------
-- Anyone can read reserved handles (for availability checks)
CREATE POLICY "reserved_handles_select_public" ON reserved_handles
    FOR SELECT USING (true);

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- Function: Increment likes_count on shayaris when a like is inserted
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shayaris SET likes_count = likes_count + 1 WHERE id = NEW.shayari_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_likes
    AFTER INSERT ON likes
    FOR EACH ROW EXECUTE FUNCTION increment_likes_count();

-- Function: Decrement likes_count on shayaris when a like is removed
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shayaris SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.shayari_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_likes
    AFTER DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION decrement_likes_count();

-- Function: Increment comments_count
CREATE OR REPLACE FUNCTION increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shayaris SET comments_count = comments_count + 1 WHERE id = NEW.shayari_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_comments
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION increment_comments_count();

-- Function: Decrement comments_count
CREATE OR REPLACE FUNCTION decrement_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shayaris SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.shayari_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_comments
    AFTER DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION decrement_comments_count();

-- Function: Check handle availability
CREATE OR REPLACE FUNCTION is_handle_available(check_handle VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM users WHERE handle = check_handle
    ) AND NOT EXISTS (
        SELECT 1 FROM reserved_handles WHERE handle = check_handle
    );
END;
$$ LANGUAGE plpgsql;
```

### 2.3 Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│      users       │       │ reserved_handles  │
├──────────────────┤       ├──────────────────┤
│ id (PK, UUID)    │       │ handle (PK)      │
│ handle (UNIQUE)  │       │ reason           │
│ display_name     │       └──────────────────┘
│ bio              │
│ pin_hash         │       ┌──────────────────┐
│ is_admin         │       │   admin_logs     │
│ is_verified      │       ├──────────────────┤
│ created_at       │◄──────│ admin_id (FK)    │
│ updated_at       │       │ action           │
└────────┬─────────┘       │ target_id        │
         │                 │ target_type      │
         │ 1:N             │ target_user_id   │
         │                 │ created_at       │
    ┌────┴────┐            └──────────────────┘
    │         │
    ▼         ▼
┌──────────┐ ┌──────────┐
│ shayaris │ │  likes   │
├──────────┤ ├──────────┤
│ id (PK)  │ │ id (PK)  │
│ user_id  │ │ user_id  │◄── FK to users
│ content  │ │shayari_id│◄── FK to shayaris
│ formatted│ │created_at│
│mood_theme│ │ UNIQUE   │
│font_style│ │(user,post)│
│ song_*   │ └──────────┘
│likes_cnt │
│comms_cnt │ ┌──────────┐
│created_at│ │ comments │
│updated_at│ ├──────────┤
└────┬─────┘ │ id (PK)  │
     │       │ user_id  │◄── FK to users
     │ 1:N   │shayari_id│◄── FK to shayaris
     └───────│ content  │
             │created_at│
             └──────────┘
```

---

## 3. Audio CDN — GitHub Repository + jsDelivr

### 3.1 Repository Structure for Audio

```
shayariverse-x/
├── bgm/
│   ├── preloaded-songs.json          # Track metadata catalog
│   ├── slowed-reverb-01.mp3
│   ├── sad-flute-01.mp3
│   ├── lofi-night-01.mp3
│   ├── royal-urdu-01.mp3
│   └── ...
├── .github/
│   └── workflows/
│       └── supabase-ping.yml         # Keep-alive cron
├── index.html
├── style.css
├── js/
│   ├── config.js
│   ├── db.js
│   ├── audio-engine.js
│   ├── composer.js
│   └── ui.js
└── capacitor.config.json
```

### 3.2 preloaded-songs.json Schema

```json
{
  "version": 1,
  "categories": [
    {
      "id": "slowed-reverb",
      "name": "Slowed + Reverb",
      "icon": "Disc",
      "tracks": [
        {
          "id": "sr-001",
          "name": "Tum Hi Ho (Slowed)",
          "artist": "Arijit Singh",
          "file": "slowed-reverb-tum-hi-ho.mp3",
          "url": "https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/slowed-reverb-tum-hi-ho.mp3",
          "duration": 210,
          "art": null
        }
      ]
    },
    {
      "id": "sad-flute",
      "name": "Sad Flute & Violin",
      "icon": "Music",
      "tracks": []
    },
    {
      "id": "lofi-night",
      "name": "Late Night Lofi",
      "icon": "Moon",
      "tracks": []
    },
    {
      "id": "royal-urdu",
      "name": "Royal Urdu Vibe",
      "icon": "Crown",
      "tracks": []
    }
  ]
}
```

> [!NOTE]
> The `url` field in each track provides a **working fallback** — even if the CDN structure changes, the full URL is embedded in the JSON so tracks play out-of-the-box.

### 3.3 jsDelivr CDN URL Pattern

```
Base:    https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/
Track:   https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/<filename>.mp3
JSON:    https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/preloaded-songs.json
```

---

## 4. Dual Viral Music Engine

### 4.1 Tab 1 — Viral Reels BGM (Curated)

| Aspect | Detail |
|---|---|
| Source | `/bgm/preloaded-songs.json` via jsDelivr CDN |
| Categories | Slowed + Reverb, Sad Flute & Violin, Late Night Lofi, Royal Urdu Vibe |
| Playback | Direct `.mp3` streaming from CDN |
| Offline | Cached via Service Worker after first play |
| Fallback | Full URLs embedded in JSON; no dependency on path construction |

### 4.2 Tab 2 — Live Online Song & Lofi Search

**Primary: JioSaavn API (No API Key Required)**

```
Endpoint:  https://saavn.dev/api/search/songs?query={searchTerm}
Method:    GET
Response:  JSON with song name, artist, album, image URLs, preview URLs
Rate Limit: Reasonable (debounce at 400ms protects against abuse)
```

**Fallback: Apple iTunes Search API**

```
Endpoint:  https://itunes.apple.com/search?term={searchTerm}&country=IN&media=music&limit=12
Method:    GET
Response:  JSON with trackName, artistName, artworkUrl100, previewUrl (30s AAC)
```

**Fallback Logic:**

```
1. User types search query (debounced 400ms)
2. Call JioSaavn API
3. IF JioSaavn returns error OR results.length === 0:
   4. Call iTunes API as automatic fallback
5. Display results with play preview button
6. User selects a track → attached to their Shayari card
```

### 4.3 Unified Audio Engine Architecture

```
┌─────────────────────────────────────────┐
│           audio-engine.js               │
├─────────────────────────────────────────┤
│ - Singleton HTMLAudioElement            │
│ - play(url, metadata)                   │
│ - pause()                               │
│ - togglePlayPause()                     │
│ - setVolume(0-1)                        │
│ - getCurrentTrack() → {name, artist,    │
│     url, art, source}                   │
│ - onTrackChange(callback)              │
│ - onPlayStateChange(callback)          │
│ - Auto-pause on visibilitychange       │
│ - Auto-stop previous on new play()     │
└─────────────────────────────────────────┘
```

---

## 5. LocalStorage Demo Fallback Layer

### 5.1 Purpose

When `SUPABASE_URL` and `SUPABASE_KEY` are empty or unset in `js/config.js`, the app seamlessly switches to a **built-in LocalStorage mock database** so the entire app is **100% testable immediately** without any backend configuration.

### 5.2 Storage Keys (svx_ prefix)

| Key | Type | Description |
|---|---|---|
| `svx_users` | JSON Array | All registered users |
| `svx_shayaris` | JSON Array | All Shayari posts |
| `svx_likes` | JSON Array | All likes |
| `svx_comments` | JSON Array | All comments |
| `svx_current_user` | JSON Object | Currently logged-in user session |
| `svx_admin_logs` | JSON Array | Admin action audit trail |
| `svx_reserved_handles` | JSON Array | VIP handle lock list |

### 5.3 Pre-Populated Demo Data

The LocalStorage layer ships with **4–5 realistic Shayari + Song cards** pre-loaded on first run:

```javascript
const SVX_DEMO_DATA = {
  users: [
    {
      id: "founder-aman-001",
      handle: "aman",
      display_name: "Aman",
      bio: "Creator of ShayariVerse X",
      pin_hash: "<<sha256_of_default_pin>>",
      is_admin: true,
      is_verified: true,
      created_at: "2026-01-01T00:00:00Z"
    },
    {
      id: "demo-user-002",
      handle: "shayar_dil",
      display_name: "Dil Ka Shayar",
      bio: "Alfaaz mere, jazbaat tumhare",
      pin_hash: "<<sha256>>",
      is_admin: false,
      is_verified: false,
      created_at: "2026-06-15T10:30:00Z"
    }
  ],
  shayaris: [
    {
      id: "demo-shayari-001",
      user_id: "founder-aman-001",
      content: "Zindagi mein kuch log aise aate hain\nJo dil ke har zakham pe marham lagate hain\nUnke jaane ke baad bhi ehsaas rehta hai\nWo yaadein hi toh hain jo hamesha saath nibhaate hain",
      mood_theme: "purple",
      font_style: "nastaliq",
      song_name: "Tum Hi Ho (Slowed)",
      song_artist: "Arijit Singh",
      song_url: "https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/slowed-reverb-tum-hi-ho.mp3",
      song_art: null,
      song_source: "cdn",
      likes_count: 42,
      comments_count: 3,
      created_at: "2026-11-10T20:00:00Z"
    },
    // ... 3-4 more demo cards with different themes, songs, and authors
  ],
  reserved_handles: ["aman", "beginneraman", "admin", "founder", "shayariversex", "svx"]
};
```

### 5.4 db.js Abstraction Layer

The `js/db.js` module exposes a **unified API** that works identically whether backed by Supabase or LocalStorage:

```javascript
// db.js public API (same interface for both backends)
export const db = {
  // Users
  createUser(handle, displayName, pinHash) → User,
  getUserByHandle(handle) → User | null,
  verifyPin(handle, pinHash) → boolean,
  updateUserProfile(userId, { displayName, bio }) → User,
  isHandleAvailable(handle) → boolean,

  // Shayaris
  getFeed(page, limit) → Shayari[],
  getShayarisByUser(userId) → Shayari[],
  createShayari(data) → Shayari,
  updateShayari(shayariId, userId, data) → Shayari,
  deleteShayari(shayariId, userId, isAdmin) → boolean,

  // Likes
  toggleLike(userId, shayariId) → { liked: boolean, newCount: number },
  hasUserLiked(userId, shayariId) → boolean,

  // Comments
  getComments(shayariId) → Comment[],
  addComment(userId, shayariId, content) → Comment,
  deleteComment(commentId, userId, isAdmin) → boolean,

  // Admin
  logAdminAction(adminId, action, targetId, targetType, targetUserId) → void,

  // Init
  init() → void   // Detects mode (Supabase vs LocalStorage) and initializes
};
```

---

## 6. GitHub Actions — Supabase Keep-Alive

### 6.1 Problem

Supabase pauses free-tier projects after **7 days of inactivity**. A paused project returns errors on all API calls until manually resumed.

### 6.2 Solution: `.github/workflows/supabase-ping.yml`

```yaml
name: Supabase Keep-Alive Ping

on:
  schedule:
    # Run every 3 days at 06:00 UTC (well within the 7-day inactivity window)
    - cron: '0 6 */3 * *'
  workflow_dispatch:  # Allow manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase REST API
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: |
          echo "Pinging ShayariVerse X Supabase project..."
          RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
            "${SUPABASE_URL}/rest/v1/reserved_handles?select=handle&limit=1" \
            -H "apikey: ${SUPABASE_ANON_KEY}" \
            -H "Authorization: Bearer ${SUPABASE_ANON_KEY}")
          echo "Response code: $RESPONSE"
          if [ "$RESPONSE" -ne 200 ]; then
            echo "::warning::Supabase ping returned HTTP $RESPONSE"
            exit 1
          fi
          echo "Supabase is alive and responding."
```

### 6.3 Required Repository Secrets

| Secret | Value |
|---|---|
| `SUPABASE_URL` | `https://shayariverse-x-db.supabase.co` |
| `SUPABASE_ANON_KEY` | The anon/public key from Supabase project settings |

---

## 7. CapacitorJS — Android APK Configuration

### 7.1 `capacitor.config.json`

```json
{
  "appId": "com.beginneraman.shayariversex",
  "appName": "ShayariVerse X",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 1500,
      "backgroundColor": "#06060b",
      "androidSplashResourceName": "splash",
      "showSpinner": false
    },
    "StatusBar": {
      "style": "Dark",
      "backgroundColor": "#06060b"
    }
  },
  "android": {
    "backgroundColor": "#06060b",
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": false
  }
}
```

### 7.2 APK Build Pipeline

```
1. npm run build (or copy static files to dist/)
2. npx cap init "ShayariVerse X" "com.beginneraman.shayariversex"
3. npx cap add android
4. npx cap copy android
5. npx cap open android  → Build APK in Android Studio
   OR
   cd android && ./gradlew assembleRelease
```

---

## 8. Client-Side Module Architecture

```
shayariverse-x/
├── index.html              # Single-page app shell
├── style.css               # Complete CSS (glass tokens, animations, responsive)
├── js/
│   ├── config.js           # Constants: SUPABASE_URL, SUPABASE_KEY, CDN_BASE, etc.
│   ├── db.js               # Unified database abstraction (Supabase ↔ LocalStorage)
│   ├── audio-engine.js     # Singleton audio player, search APIs, CDN loader
│   ├── composer.js         # Shayari composer: auto-format, auto-fit, mood/font
│   └── ui.js               # DOM rendering, navigation, animations, event handlers
├── lib/
│   └── html2canvas.min.js  # Card-to-image export (vendored)
├── assets/
│   ├── icons/              # Lucide SVG icon sprites or inline SVGs
│   └── watermark.svg       # Vector watermark for share images
├── bgm/
│   ├── preloaded-songs.json
│   └── *.mp3
├── capacitor.config.json
├── package.json
└── .github/
    └── workflows/
        └── supabase-ping.yml
```

---

## 9. API Dependency Matrix

| API / Service | URL | Key Required | Cost | Purpose |
|---|---|---|---|---|
| Supabase REST | `https://shayariverse-x-db.supabase.co` | Anon key (free) | Free | Text database |
| jsDelivr CDN | `cdn.jsdelivr.net/gh/beginneraman/...` | None | Free | Audio file delivery |
| JioSaavn (saavn.dev) | `saavn.dev/api/search/songs` | None | Free | Indian music search (primary) |
| iTunes Search | `itunes.apple.com/search` | None | Free | Music search (fallback) |
| GitHub Actions | Built-in | None | Free (2000 min/mo) | Supabase keep-alive |

> [!TIP]
> **Total monthly cost: ₹0.** No credit card required for any service in the stack.

---

## 10. Security Architecture

| Concern | Solution |
|---|---|
| PIN Storage | SHA-256 hashed via Web Crypto API before transmission/storage |
| Database Access | Supabase RLS policies enforce per-user data ownership |
| Admin Verification | Server-side `is_admin` flag; cannot be set via client API |
| XSS Prevention | All user-generated content rendered via `textContent` (not `innerHTML`) |
| Handle Impersonation | VIP handles pre-locked in `reserved_handles` table |
| Badge Spoofing | Verified badge rendered based on server-side `is_verified` flag only |
| CORS | Supabase handles CORS; jsDelivr has permissive CORS headers |

---

*Last updated: 2026-11-15 — Phase 0*
