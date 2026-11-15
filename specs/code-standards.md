# ShayariVerse X — Code Standards & Conventions

> **Single Source of Truth** — This document defines the coding conventions, file structure, naming rules, performance constraints, security standards, and quality gates for **ShayariVerse X (SVX)**.

---

## 1. Technology Stack — Vanilla, Modular & Zero-Bloat

| Layer | Technology | Notes |
|---|---|---|
| Markup | HTML5 | Semantic elements, single-page app shell |
| Styling | CSS3 | CSS Variables for glass design tokens, zero CSS frameworks |
| Logic | Vanilla ES6+ JavaScript | ES Modules (`import`/`export`), zero JS frameworks |
| Database | Supabase JS Client (CDN) | Loaded via `<script>` or ESM import from CDN |
| Card Export | html2canvas (vendored) | `lib/html2canvas.min.js` — single vendored dependency |
| Icons | Lucide SVG (inline) | Inline SVG strings or a sprite sheet, no icon font |
| APK Wrapper | CapacitorJS | Build-time only; not bundled in web code |

> [!IMPORTANT]
> **Zero frameworks. Zero build tools required for development.** The app runs by opening `index.html` directly. CapacitorJS is used only at APK build time.

---

## 2. File Structure & Module Map

```
shayariverse-x/
├── index.html                 # App shell (SPA, all views rendered via JS)
├── style.css                  # Complete stylesheet (glass tokens, components, animations)
├── js/
│   ├── config.js              # All constants, API URLs, feature flags
│   ├── db.js                  # Database abstraction (Supabase ↔ LocalStorage)
│   ├── audio-engine.js        # Singleton audio player, CDN loader, search APIs
│   ├── composer.js            # Auto-format engine, auto-fit, card customization
│   └── ui.js                  # DOM rendering, navigation, events, animations
├── lib/
│   └── html2canvas.min.js     # Vendored: card → PNG export
├── assets/
│   ├── icons/                 # Lucide SVG icon references (if using sprite)
│   └── watermark.svg          # Vector watermark for share images
├── bgm/
│   ├── preloaded-songs.json   # Curated BGM catalog
│   └── *.mp3                  # Audio files served via jsDelivr CDN
├── specs/                     # This documentation directory
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-context.md
│   ├── code-standards.md      # ← You are here
│   ├── ai-workflow-rules.md
│   └── progress-tracker.md
├── capacitor.config.json      # APK build configuration
├── package.json               # NPM metadata (CapacitorJS deps only)
└── .github/
    └── workflows/
        └── supabase-ping.yml  # Keep-alive cron job
```

---

## 3. Module Responsibilities

### 3.1 `js/config.js` — Configuration Constants

```javascript
// All configurable values in one place
export const CONFIG = {
  APP_NAME: 'ShayariVerse X',
  APP_SHORT: 'SVX',
  VERSION: '1.0.0',

  // Supabase (leave empty for LocalStorage demo mode)
  SUPABASE_URL: '',
  SUPABASE_KEY: '',

  // Audio CDN
  CDN_BASE: 'https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/',
  SONGS_JSON: 'preloaded-songs.json',

  // Music Search APIs
  JIOSAAVN_API: 'https://saavn.dev/api/search/songs',
  ITUNES_API: 'https://itunes.apple.com/search',
  SEARCH_DEBOUNCE_MS: 400,
  ITUNES_COUNTRY: 'IN',
  ITUNES_LIMIT: 12,

  // Storage
  STORAGE_PREFIX: 'svx_',

  // Identity
  FOUNDER_HANDLE: 'aman',
  RESERVED_HANDLES: ['aman', 'beginneraman', 'admin', 'founder', 'shayariversex', 'svx'],
  ADMIN_PASSKEY_TAPS: 5,  // Number of secret taps to unlock admin mode

  // Composer
  AUTO_FIT: {
    SHORT:  { maxLines: 2, maxChars: 80,  fontSize: '24px', fontWeight: 700, lineHeight: 1.6 },
    MEDIUM: { maxLines: 4, maxChars: 200, fontSize: '19px', fontWeight: 500, lineHeight: 1.5 },
    LONG:   {                              fontSize: '15px', fontWeight: 400, lineHeight: 1.45 }
  },

  // Performance
  MAX_BACKDROP_FILTERS: 4,
  FEED_PAGE_SIZE: 15,
  COMMENT_MAX_LENGTH: 500,
  BIO_MAX_LENGTH: 150,
  HANDLE_MIN: 3,
  HANDLE_MAX: 20,
  DISPLAY_NAME_MIN: 2,
  DISPLAY_NAME_MAX: 30
};
```

### 3.2 `js/db.js` — Database Abstraction Layer

- **Single unified API** that works identically on Supabase and LocalStorage.
- On `init()`, checks `CONFIG.SUPABASE_URL`:
  - If set → initializes Supabase client, uses REST API calls.
  - If empty → switches to LocalStorage backend with `svx_` prefixed keys.
- LocalStorage backend pre-populates demo data on first run.
- All methods return Promises for consistent async handling.

### 3.3 `js/audio-engine.js` — Audio Engine

- Manages a **singleton `HTMLAudioElement`** — only one track plays at a time.
- Loads curated tracks from `preloaded-songs.json` via CDN.
- Handles JioSaavn API search (primary) with iTunes fallback.
- Listens for `visibilitychange` to auto-pause on minimize/tab-switch.
- Exposes event callbacks: `onTrackChange`, `onPlayStateChange`.

### 3.4 `js/composer.js` — Smart Composer

- Auto-format engine: strips whitespace, normalizes line breaks, groups couplets.
- Auto-fit calculator: determines font size/weight/line-height based on text metrics.
- Card preview: real-time preview of the glass card with mood theme and font style.
- Handles edit mode (pre-filling existing Shayari content).

### 3.5 `js/ui.js` — UI Renderer & Event System

- SPA router: manages view state (Feed, Create, Discover, Profile, Author Profile).
- DOM rendering: builds card HTML using `textContent` (never `innerHTML` for user data).
- Event delegation: single event listener on app container, delegate by `data-action` attributes.
- Animation triggers: double-tap detection, heart burst, bottom-sheet gestures.
- Bottom navigation state management.

---

## 4. Naming Conventions

### 4.1 CSS

| Entity | Convention | Example |
|---|---|---|
| CSS Variables | `--svx-{category}-{property}` | `--svx-glass-blur`, `--svx-text-primary` |
| Class Names | `svx-{component}-{element}` (BEM-lite) | `svx-card-header`, `svx-nav-item` |
| Animation Names | `svx-{animation-name}` | `svx-heart-burst`, `svx-orb-float` |
| Data Attributes | `data-{property}` | `data-mood="purple"`, `data-shayari-id` |

### 4.2 JavaScript

| Entity | Convention | Example |
|---|---|---|
| Constants | `UPPER_SNAKE_CASE` | `SEARCH_DEBOUNCE_MS`, `CDN_BASE` |
| Functions | `camelCase` | `calculateAutoFit()`, `toggleLike()` |
| DOM IDs | `svx-{component}` | `svx-feed-container`, `svx-composer-modal` |
| Event handlers | `handle{Action}` | `handleDoubleTap()`, `handleShareCard()` |
| LocalStorage keys | `svx_{entity}` | `svx_users`, `svx_current_user` |
| Config object | `CONFIG` (exported) | `CONFIG.SUPABASE_URL` |

### 4.3 HTML

| Entity | Convention | Example |
|---|---|---|
| IDs | `svx-{component}` | `id="svx-feed"`, `id="svx-bottom-nav"` |
| Action buttons | `data-action="{verb}"` | `data-action="like"`, `data-action="delete"` |
| Entity refs | `data-{entity}-id` | `data-shayari-id="uuid"`, `data-user-id="uuid"` |
| View containers | `svx-view-{name}` | `id="svx-view-feed"`, `id="svx-view-profile"` |

---

## 5. Mobile Performance & Battery Rules

### 5.1 Mandatory Performance Constraints

| Rule | Specification |
|---|---|
| Continuous sensor usage | **Zero.** No gyroscope, accelerometer, or GPS. |
| Background audio pause | Auto-pause via `visibilitychange` listener when app is minimized. |
| Backdrop-filter limit | Max **4** active `backdrop-filter` layers in the visible viewport at any time. Cards scrolled off-screen should have `backdrop-filter` disabled via Intersection Observer. |
| Scroll FPS target | **60fps** on mid-range Android (Snapdragon 600-series, 4GB RAM). |
| Song search debounce | **400ms** debounce on keystroke before firing API call. |
| Feed pagination | Load **15 cards** per page; lazy-load next page on scroll near bottom. |
| Image export | `html2canvas` runs on explicit user tap only (never automatic). |
| DOM recycling | Remove card DOM nodes more than 3 screens away from viewport. |

### 5.2 GPU Optimization

```css
/* Promote glass cards to compositor layer for smooth scrolling */
.svx-glass-card {
  will-change: transform;
  transform: translateZ(0);
  contain: layout style paint;
}

/* Disable expensive effects off-screen */
.svx-glass-card.offscreen {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
```

### 5.3 Intersection Observer Pattern

```javascript
// Disable backdrop-filter on off-screen cards for performance
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('offscreen', !entry.isIntersecting);
  });
}, { rootMargin: '200px' });

// Observe every card
document.querySelectorAll('.svx-glass-card').forEach(card => observer.observe(card));
```

---

## 6. Security Standards

### 6.1 PIN Hashing

```javascript
// Hash 4-digit PIN using SHA-256 via Web Crypto API
async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

> [!IMPORTANT]
> Never store or transmit the raw PIN. Always hash first, then compare hashes.

### 6.2 XSS Prevention

```javascript
// ALWAYS use textContent for user-generated content
element.textContent = userInput;  // SAFE

// NEVER use innerHTML with user data
element.innerHTML = userInput;    // DANGEROUS — XSS vulnerability
```

**Exceptions:** Only use `innerHTML` for trusted, hardcoded HTML (e.g., Lucide SVG icon strings that are defined in your own code, never from user input).

### 6.3 Content Security

| Concern | Rule |
|---|---|
| Handle validation | Lowercase alphanumeric + underscore only: `/^[a-z0-9_]{3,20}$/` |
| Display name | 2–30 characters, stripped of HTML tags |
| Shayari content | Max 2000 characters, rendered via `textContent` |
| Comment content | Max 500 characters, rendered via `textContent` |
| Bio | Max 150 characters, rendered via `textContent` |
| PIN | Exactly 4 numeric digits: `/^\d{4}$/` |

### 6.4 Supabase RLS Enforcement

- All database access goes through Supabase RLS policies (defined in `architecture.md`).
- The client uses the **anon key** (public, safe to embed in client code).
- RLS policies ensure users can only modify their own data.
- Admin operations are validated server-side via the `is_admin` flag.

---

## 7. Code Quality Gates

### 7.1 Self-Audit Checklist (Run Before Every Commit)

- [ ] **Zero native emoji** anywhere in the UI (search for Unicode emoji ranges).
- [ ] **All icons are Lucide SVGs** with `stroke-width: 1.75px`.
- [ ] **`svx_` prefix** on every LocalStorage key.
- [ ] **"ShayariVerse X"** branding (not "ShayariVerse" without the X).
- [ ] **`textContent`** used for all user-generated content rendering.
- [ ] **PIN is hashed** before storage/comparison.
- [ ] **Debounce** on song search input (400ms).
- [ ] **`visibilitychange`** listener pauses audio.
- [ ] **Works in LocalStorage demo mode** (empty Supabase config).
- [ ] **Works in Supabase mode** (with valid config).
- [ ] **Max 4 backdrop-filter layers** visible at once.
- [ ] **Touch targets >= 44px** on all interactive elements.

### 7.2 Accessibility Minimums

| Requirement | Standard |
|---|---|
| Touch targets | Min 44px x 44px |
| Color contrast | Text on glass cards: minimum 4.5:1 ratio (white text on dark glass meets this) |
| Focus indicators | Visible focus ring on keyboard navigation (for WebView accessibility) |
| ARIA labels | All icon-only buttons must have `aria-label` |
| Reduced motion | Respect `prefers-reduced-motion`: disable floating orbs, heart burst, equalizer |

```css
@media (prefers-reduced-motion: reduce) {
  .svx-orb, .svx-album-art, .svx-eq-bar, .svx-verified-badge {
    animation: none !important;
  }
}
```

---

## 8. Git & Version Control Conventions

### 8.1 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code; CDN serves from `@main` |
| `dev` | Active development branch |
| `feature/{name}` | Feature branches (e.g., `feature/composer`, `feature/supabase`) |

### 8.2 Commit Message Format

```
[Phase X] Brief description of change

Examples:
[Phase 1] Add app shell, dark glass CSS system, bottom nav
[Phase 2] Implement feed cards, demo data, heart animation
[Phase 3] Build smart composer with auto-format engine
[Phase 5] Add Shayar ID registration, founder badge
[Fix] Correct backdrop-filter performance on scroll
```

### 8.3 .gitignore Essentials

```gitignore
node_modules/
android/
ios/
dist/
.env
*.local
.DS_Store
Thumbs.db
```

---

## 9. External Dependencies — Minimal & Vendored

| Dependency | Load Method | Purpose | Size |
|---|---|---|---|
| Supabase JS Client | CDN `<script>` / ESM | Database access | ~30KB gzipped |
| html2canvas | Vendored `lib/html2canvas.min.js` | Card → PNG export | ~40KB gzipped |
| Google Fonts (Inter, Amiri, Playfair Display) | `<link>` preload | Typography | Variable |
| Lucide Icons | Inline SVG strings in JS | All UI icons | ~0KB (inline) |

> [!TIP]
> No npm install is required for development. The app runs from a local file server or `index.html` directly. npm/Node is only needed for CapacitorJS APK builds.

---

*Last updated: 2026-11-15 — Phase 0*
