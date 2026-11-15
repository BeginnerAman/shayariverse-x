# ShayariVerse X — Project Overview & Product Vision

> **Single Source of Truth** — This document defines the complete product vision, user flows, identity rules, and core feature set for **ShayariVerse X (SVX)**.

---

## 1. Product Identity

| Key | Value |
|---|---|
| **App Name** | ShayariVerse X |
| **Short Name** | SVX |
| **Creator / Founder** | Aman (`@aman` / GitHub: `beginneraman`) |
| **Repository** | `https://github.com/beginneraman/shayariverse-x` |
| **Package ID** | `com.beginneraman.shayariversex` |
| **Supabase Ref** | `shayariverse-x-db` |
| **LocalStorage Prefix** | `svx_` |
| **jsDelivr CDN Base** | `https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/` |

---

## 2. Evolution & Zero-Clash Guarantee

ShayariVerse X is inspired by the poetic + music soul of the creator's original static web app ([ShayariVerse](https://beginneraman.github.io/ShayariVerse)). However, **SVX is a brand-new, standalone, multi-user Social Shayari & Music Android Application (.apk)**.

### Isolation Contract — Zero Conflict with Original ShayariVerse PWA

| Dimension | Original ShayariVerse | ShayariVerse X (SVX) |
|---|---|---|
| App Name | ShayariVerse | **ShayariVerse X** |
| Repository | `beginneraman/ShayariVerse` | `beginneraman/shayariverse-x` |
| Package ID | N/A (PWA) | `com.beginneraman.shayariversex` |
| Storage Prefix | (none / default) | `svx_` |
| Type | Static single-user PWA | Multi-user social Android app |
| Backend | None | Supabase (free tier) |

> [!IMPORTANT]
> Every storage key, service worker scope, cache name, and database reference **must** use the `svx_` prefix so users who already have the original ShayariVerse PWA installed experience **zero cache/storage collision**.

---

## 3. "Hybrid Magic" Onboarding & Auth — Model C

ShayariVerse X uses a **"Hybrid Magic"** authentication model: the app is instantly usable without any login, but identity is created on-demand the moment a user wants to participate.

### 3.1 Zero-Friction Guest Mode

- App opens **directly** into the live Shayari + Music feed.
- **No** login wall, **no** splash screen gate, **no** signup modal on launch.
- Guests can:
  - Browse the full Shayari feed (infinite scroll).
  - Play / preview background music on any card.
  - Search songs (both curated BGM and live online search).
  - View author profiles (read-only).
- Guests **cannot**: Create posts, Like, Comment, or access a Profile page.

### 3.2 Three-Second Shayar ID (On-Demand Registration)

Registration is triggered **only** when a guest taps one of these actions for the first time:

- **+ Create** (compose a new Shayari)
- **Like** (heart a Shayari card)
- **Comment** (open comment sheet on a card)

A lightweight bottom-sheet modal appears with **exactly 3 fields**:

| # | Field | Rules |
|---|---|---|
| 1 | **Display Name** | Free-text (e.g., "Aman"). **Non-unique** — multiple users can share a display name. Min 2 chars, max 30 chars. |
| 2 | **Unique @handle** | Strictly unique across the entire database. Lowercase alphanumeric + underscores only. Min 3 chars, max 20 chars. **Live availability check** with debounced API call (400ms). If taken, suggest alternatives (e.g., `@aman_writes`, `@aman_shayar`, `@aman_42`). |
| 3 | **4-Digit Secret PIN** | Numeric only (0000–9999). Used for instant cross-device login/recovery. **Hashed with SHA-256** (Web Crypto API) before storage. No email, no phone number, no paid SMS OTP required. |

After registration:
- The user's session is persisted in LocalStorage (`svx_current_user`).
- The user is immediately returned to the action they originally tapped (create/like/comment) with zero friction.

### 3.3 Cross-Device Login / Recovery

- A simple "Already a Shayar?" link on the registration sheet.
- User enters their `@handle` + 4-digit PIN.
- PIN hash is compared server-side; on match, session is restored.

---

## 4. Founder Identity Lock & Admin God-Mode

### 4.1 Reserved VIP Handles

The following handles are **permanently locked** and cannot be registered by any user:

```
@aman, @beginneraman, @admin, @founder, @shayariversex, @svx
```

These are pre-inserted as reserved rows in the database at setup.

### 4.2 Founder Account (@aman)

- `@aman` is **pre-registered** as the Founder account in the database seed.
- The Founder account has `is_admin = true` and `is_verified = true`.
- Whenever `@aman` (or any `is_admin = true` user) posts a Shayari or Comment, a **glowing SVG Verified Founder Badge** is rendered next to their display name.
  - Badge icon: Lucide `BadgeCheck` or `Crown` (SVG, not emoji).
  - Badge styling: Subtle golden glow (`filter: drop-shadow(0 0 6px rgba(255, 193, 68, 0.6))`), pulsing animation.
  - The badge is **non-copyable** — it is rendered server-side via the `is_verified` flag, not client-side text.

### 4.3 Admin God-Mode

- **Hidden Activation**: A secret passkey trigger in the Profile screen (e.g., long-press on version number 5 times, or tap a hidden area) unlocks Admin mode for `@aman`.
- **Capabilities** (when `is_admin = true`):
  - **Delete ANY user's Shayari post** from the feed in 1 tap (with confirmation dialog).
  - **Delete ANY user's Comment** from any thread in 1 tap.
  - **View flagged/reported content** (future scope).
- **Safety**: Admin actions are logged with timestamp and target post/comment ID.

---

## 5. Core Social & Viral Features

### 5.1 Shayari Feed (Home)

- Infinite-scroll vertical feed of Shayari cards.
- Each card displays:
  - Author's Display Name + @handle + Verified Badge (if applicable).
  - Formatted Shayari text (auto-formatted into poetic couplets).
  - Background music info (song name + artist) with play/pause control.
  - Glass card mood theme (border/glow color).
  - Like count + Comment count + Share button.
  - Timestamp (relative: "2 min ago", "3 days ago").
- **Sorting**: Latest first (chronological descending).
- **Double-tap to Like**: Tapping a card twice triggers a Like with an SVG heart burst animation overlay.

### 5.2 Author Profile Page

- Tapping any `@handle` anywhere in the app opens their Author Profile.
- Profile displays:
  - Display Name + @handle + Verified Badge (if applicable).
  - Bio (editable by the profile owner, max 150 chars).
  - **Total Shayaris Posted** (count).
  - **Total Likes Earned** (sum of likes across all posts).
  - Chronological list of all their Shayari posts.
- Profile owner can edit their own Bio and Display Name.

### 5.3 Owner Controls

- Users can **Edit** or **Delete** ONLY their own Shayari posts.
  - Edit: Opens the composer pre-filled with existing content. Updates the post in-place (preserving likes/comments).
  - Delete: Confirmation dialog, then hard-delete from database.
- Users **cannot** edit or delete other users' posts (unless Admin God-Mode).

### 5.4 Comments

- Tapping the Comment icon on a card opens a **bottom-sheet drawer**.
- Comments are displayed chronologically (oldest first).
- Each comment shows: Display Name, @handle, Verified Badge (if applicable), comment text, and relative timestamp.
- Users can delete their own comments. Admins can delete any comment.

### 5.5 Viral WhatsApp Status / Instagram Story Image Share

- **1-tap Share button** on every Shayari card.
- Uses `html2canvas` to export the Frosted Glass Shayari card as an **HD PNG image**.
- The exported image includes:
  - The full Shayari text in its styled glass card.
  - A clean **vector-branded watermark footer**: `ShayariVerse X • [Song Name]`.
  - The watermark uses SVG text (not emoji), matching the app's typography.
- The PNG is shared via the native **Web Share API** (`navigator.share()`) which triggers Android's share sheet (WhatsApp, Instagram, Telegram, etc.).
- Fallback: If Web Share API is unavailable, download the PNG directly.

---

## 6. Music System Overview

ShayariVerse X features a **Dual Viral Music Engine** with two discovery tabs:

### Tab 1 — Viral Reels BGM (Curated / Offline-Ready)

- Pre-loaded curated tracks stored in the GitHub repository under `/bgm/`.
- Served globally via jsDelivr CDN.
- Categories:
  - Slowed + Reverb
  - Sad Flute & Violin
  - Late Night Lofi
  - Royal Urdu Vibe
- Track metadata loaded from `/bgm/preloaded-songs.json`.

### Tab 2 — Live Online Song & Lofi Search

- **Primary API**: JioSaavn (via `https://saavn.dev/api/search/songs?query=...`) — no API key required, rich Bollywood/Indian music catalog.
- **Automatic Fallback**: Apple iTunes Search API (`https://itunes.apple.com/search?term=...&country=IN&media=music&limit=12`) — triggered if JioSaavn request fails or returns zero results.
- Search is debounced (400ms) for mobile performance.
- Each result shows: Song name, Artist, Album art thumbnail, and a Preview play button.

### Audio Player Behavior

- **Spinning Album Art Pill**: A persistent mini-player at the bottom of the screen with a spinning circular album art and animated CSS equalizer bars.
- Only one track plays at a time (singleton audio instance).
- Audio **auto-pauses** when:
  - The user switches to a different card's track.
  - The app is minimized or the tab loses focus (`visibilitychange` event).
  - The user navigates away from the feed.

---

## 7. Target Platform & Distribution

| Aspect | Detail |
|---|---|
| **Primary Platform** | Android (APK via CapacitorJS) |
| **Core Tech** | HTML5 + CSS3 + Vanilla ES6 JavaScript |
| **APK Wrapper** | CapacitorJS (`com.beginneraman.shayariversex`) |
| **Distribution** | Direct APK download (GitHub Releases), future: Play Store |
| **Minimum Android** | Android 7.0 (Nougat, API 24) |
| **Target Devices** | Mid-range Android phones (4GB RAM, HD+ screens) |

---

## 8. Success Metrics (V1 Goals)

- App loads in under 2 seconds on mid-range Android (3G connection).
- Zero login required to browse feed and play music.
- Registration completes in under 3 seconds (3 fields only).
- Shared Shayari image renders correctly on WhatsApp Status and Instagram Stories.
- App runs fully functional in LocalStorage demo mode (no Supabase config needed for testing).
- Total APK size under 5MB (excluding cached audio).

---

*Last updated: 2026-11-15 — Phase 0*
