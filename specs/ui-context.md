# ShayariVerse X — UI Design System & Visual Context

> **Single Source of Truth** — This document defines the complete visual design language, component specifications, auto-formatting engine, iconography rules, and responsive behavior for **ShayariVerse X (SVX)**.

---

## 1. Design Language: "Dark Glassmorphism / Liquid Frosted Glass"

ShayariVerse X employs a premium dark glassmorphism aesthetic inspired by modern music apps and liquid glass UI trends.

### 1.1 Canvas — Ambient Dark Background

```css
:root {
  --svx-bg-deep: #06060b;
  --svx-bg-surface: #0d0d16;
}

body {
  background: var(--svx-bg-deep);
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}
```

**Floating Ambient Orbs** — Slow-floating, heavily blurred color orbs drift behind the viewport to create a living, breathing background:

| Orb | Color | Position | Size | Blur |
|---|---|---|---|---|
| Cyber Purple | `rgba(138, 43, 226, 0.15)` | Top-left drift | 300–400px | 120px |
| Midnight Cyan | `rgba(0, 210, 255, 0.10)` | Center-right drift | 250–350px | 100px |
| Warm Rose | `rgba(255, 64, 129, 0.08)` | Bottom-center drift | 200–300px | 80px |

```css
.svx-orb {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  animation: svx-orb-float 20s ease-in-out infinite alternate;
}

@keyframes svx-orb-float {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(30px, -20px) scale(1.1); }
  66%  { transform: translate(-20px, 15px) scale(0.95); }
  100% { transform: translate(10px, -10px) scale(1.05); }
}
```

---

## 2. Liquid Glass Card System

### 2.1 Base Glass Card Token

```css
:root {
  /* Glass tokens */
  --svx-glass-bg: rgba(255, 255, 255, 0.05);
  --svx-glass-blur: 24px;
  --svx-glass-saturate: 180%;
  --svx-glass-border: rgba(255, 255, 255, 0.14);
  --svx-glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --svx-glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  --svx-glass-radius: 20px;
}

.svx-glass-card {
  background: var(--svx-glass-bg);
  backdrop-filter: blur(var(--svx-glass-blur)) saturate(var(--svx-glass-saturate));
  -webkit-backdrop-filter: blur(var(--svx-glass-blur)) saturate(var(--svx-glass-saturate));
  border: 1px solid var(--svx-glass-border);
  border-radius: var(--svx-glass-radius);
  box-shadow: var(--svx-glass-shadow), var(--svx-glass-highlight);
  padding: 20px;
  position: relative;
  overflow: hidden;
}
```

### 2.2 Mood Theme Glow Variants

Each Shayari card can have one of 4 glass border/glow mood themes:

| Theme | ID | Border Glow Color | Shadow Accent |
|---|---|---|---|
| **Cyber Purple** | `purple` | `rgba(138, 43, 226, 0.35)` | `0 0 20px rgba(138, 43, 226, 0.15)` |
| **Midnight Cyan** | `cyan` | `rgba(0, 210, 255, 0.35)` | `0 0 20px rgba(0, 210, 255, 0.15)` |
| **Crimson Rose** | `rose` | `rgba(255, 64, 129, 0.35)` | `0 0 20px rgba(255, 64, 129, 0.15)` |
| **Golden Amber** | `amber` | `rgba(255, 193, 68, 0.35)` | `0 0 20px rgba(255, 193, 68, 0.15)` |

```css
.svx-glass-card[data-mood="purple"] {
  border-color: rgba(138, 43, 226, 0.35);
  box-shadow: var(--svx-glass-shadow), var(--svx-glass-highlight),
              0 0 20px rgba(138, 43, 226, 0.15);
}

.svx-glass-card[data-mood="cyan"] {
  border-color: rgba(0, 210, 255, 0.35);
  box-shadow: var(--svx-glass-shadow), var(--svx-glass-highlight),
              0 0 20px rgba(0, 210, 255, 0.15);
}

.svx-glass-card[data-mood="rose"] {
  border-color: rgba(255, 64, 129, 0.35);
  box-shadow: var(--svx-glass-shadow), var(--svx-glass-highlight),
              0 0 20px rgba(255, 64, 129, 0.15);
}

.svx-glass-card[data-mood="amber"] {
  border-color: rgba(255, 193, 68, 0.35);
  box-shadow: var(--svx-glass-shadow), var(--svx-glass-highlight),
              0 0 20px rgba(255, 193, 68, 0.15);
}
```

---

## 3. Typography System

### 3.1 Font Stack

```css
:root {
  --svx-font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --svx-font-poetic: 'Amiri', 'Noto Nastaliq Urdu', serif;
  --svx-font-display: 'Playfair Display', 'Merriweather', serif;
  --svx-font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 3.2 Font Style Options (Card Customization)

| Style ID | Font Family | Use Case |
|---|---|---|
| `nastaliq` | Amiri / Noto Nastaliq Urdu | Traditional Urdu/Shayari feel |
| `elegant` | Playfair Display | Modern literary elegance |
| `clean` | Inter | Contemporary, clean readability |

### 3.3 Text Color Palette

```css
:root {
  --svx-text-primary: rgba(255, 255, 255, 0.95);
  --svx-text-secondary: rgba(255, 255, 255, 0.65);
  --svx-text-muted: rgba(255, 255, 255, 0.40);
  --svx-text-accent: rgba(138, 43, 226, 0.9);
}
```

---

## 4. Strict Zero-Emoji Rule

> [!CAUTION]
> **MANDATORY — Native system emojis are STRICTLY FORBIDDEN anywhere in the ShayariVerse X UI.**

### 4.1 What Is Banned

The following are **never** allowed in any UI element, button label, modal, alert, toast, placeholder, watermark, or rendered content:

- Native Unicode emojis: ❤️ 👑 🎵 ✏️ 🗑️ 📲 🔥 ✨ 💜 🎶 ✅ ⚠️ etc.
- Emoji shortcodes rendered as native emoji.
- Any character from Unicode Emoji blocks (U+1F600–U+1F64F, U+1F300–U+1F5FF, U+1F680–U+1F6FF, U+1F900–U+1F9FF, U+2600–U+26FF, U+2700–U+27BF, etc.).

### 4.2 What to Use Instead — Lucide SVG Icons

**Every** icon in the UI must be a [Lucide](https://lucide.dev/) SVG icon with the following consistent styling:

```css
.svx-icon {
  width: 20px;
  height: 20px;
  stroke-width: 1.75px;
  stroke: currentColor;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.15));
}
```

### 4.3 Complete Icon Map

| UI Element | Lucide Icon Name | Usage |
|---|---|---|
| Like button | `Heart` | Feed card like action |
| Like (active/filled) | `Heart` (filled) | Liked state |
| Comment button | `MessageCircle` | Open comment sheet |
| Share button | `Share2` | Export & share card image |
| Now Playing indicator | `Disc` | Spinning album art pill |
| Music/Song | `Music` | Music tab, song items |
| Create new post | `Plus` | Bottom nav create button |
| Edit post | `Pencil` | Owner edit action |
| Delete post/comment | `Trash2` | Owner/admin delete action |
| Verified Founder badge | `BadgeCheck` | Next to @aman's name |
| Admin crown | `Crown` | Admin profile indicator |
| Profile/User | `User` | Profile tab, author avatar |
| Search | `Search` | Song search input |
| Sparkle/magic | `Sparkles` | Composer auto-format indicator |
| Volume on | `Volume2` | Audio playing state |
| Volume muted | `VolumeX` | Audio muted state |
| Admin shield | `ShieldAlert` | Admin God-Mode indicator |
| Checkmark | `Check` | Handle available confirmation |
| Close/dismiss | `X` | Modal close button |
| Back navigation | `ChevronLeft` | Back arrow in sub-screens |
| Settings/menu | `MoreVertical` | Overflow menu on cards |
| Feed/Home | `Home` | Bottom nav home tab |
| Discover/Explore | `Compass` | Bottom nav discover tab |
| Pin/Lock | `Lock` | PIN entry indicator |
| Alert/Warning | `AlertTriangle` | Error/warning states |
| Calendar/Time | `Clock` | Timestamp display |
| Equalizer bars | Custom CSS | Animated bars (not an icon) |

---

## 5. Smart Shayari Composer — Auto-Format & Auto-Fit Engine

### 5.1 Auto-Format Engine

When a user types or pastes Shayari text into the composer, the engine automatically formats it into clean, centered poetic couplets:

**Transformations:**

1. **Strip excess whitespace**: Remove leading/trailing spaces, collapse multiple spaces into one.
2. **Normalize line breaks**:
   - Convert `/` (forward slash) into a line break (`\n`).
   - Convert `,` at natural pause points into a line break (when followed by a capital letter or after 4+ words).
   - Collapse 3+ consecutive `\n` into exactly `\n\n` (stanza break).
3. **Couplet grouping**: Group lines into pairs (Sher — traditional Urdu couplet form). Each pair is separated by a stanza break.
4. **Vector quote accents**: Wrap the formatted text with subtle decorative quote marks (SVG, not emoji):
   - Opening: A thin, elegant `"` rendered as an SVG path at the top-left of the card.
   - Closing: Matching `"` at the bottom-right.
5. **Center alignment**: All formatted text is `text-align: center`.

**Example:**

```
INPUT:  "zindagi mein kuch log / aise aate hain / jo dil ke har zakham pe / marham lagate hain"

OUTPUT:
   Zindagi mein kuch log
   Aise aate hain

   Jo dil ke har zakham pe
   Marham lagate hain
```

### 5.2 Dynamic Text Auto-Sizing (Auto-Fit)

The composer calculates line count and character count in real time to dynamically scale the font size so the glass card **always looks balanced without overflow or cramped text**:

| Category | Line Count | Char Count | Font Size | Font Weight | Line Height |
|---|---|---|---|---|---|
| **Short** | 1–2 lines | < 80 chars | `24px` | Bold (700) | 1.6 |
| **Medium** | 3–4 lines | 80–200 chars | `19px` | Medium (500) | 1.5 |
| **Long** | 5+ lines / Ghazal | > 200 chars | `15px` | Regular (400) | 1.45 |

```javascript
function calculateAutoFit(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const charCount = text.length;

  if (lines.length <= 2 && charCount < 80) {
    return { fontSize: '24px', fontWeight: 700, lineHeight: 1.6, category: 'short' };
  } else if (lines.length <= 4 && charCount < 200) {
    return { fontSize: '19px', fontWeight: 500, lineHeight: 1.5, category: 'medium' };
  } else {
    return { fontSize: '15px', fontWeight: 400, lineHeight: 1.45, category: 'long' };
  }
}
```

### 5.3 Card Customization Options (Composer Modal)

| Option | Choices |
|---|---|
| **Mood Theme** | Cyber Purple, Midnight Cyan, Crimson Rose, Golden Amber |
| **Font Style** | Nastaliq (Amiri), Elegant (Playfair Display), Clean (Inter) |
| **Music** | Select from Viral BGM or search online |

---

## 6. Component Specifications

### 6.1 Shayari Feed Card

```
┌─────────────────────────────────────────────┐
│ ┌──┐  Aman  @aman  [BadgeCheck]     3m ago │  ← Header row
│ └──┘                              [···]     │
│                                              │
│        "Zindagi mein kuch log                │  ← Auto-formatted Shayari
│         Aise aate hain                       │
│                                              │
│         Jo dil ke har zakham pe              │
│         Marham lagate hain"                  │
│                                              │
│  ┌─────────────────────────────────┐        │
│  │  ◉ ═══  Tum Hi Ho (Slowed)     │        │  ← Spinning album art + song info
│  │        Arijit Singh       ▶/❚❚  │        │
│  └─────────────────────────────────┘        │
│                                              │
│  [Heart] 42    [MessageCircle] 3   [Share2] │  ← Action bar
└─────────────────────────────────────────────┘
```

**Specifications:**
- Card width: 100% minus padding (16px each side).
- Card max-width: 480px (centered on larger screens).
- Card margin-bottom: 16px.
- Header: 40px avatar circle (gradient placeholder, initials), display name (bold), @handle (muted), badge (if verified), relative time.
- Shayari text: Centered, auto-sized per Auto-Fit rules.
- Audio pill: Glass sub-card with spinning circular art (40px), song name, artist, play/pause button.
- Action bar: Heart + count, MessageCircle + count, Share2 icon. Spaced evenly with `justify-content: space-between`.

### 6.2 Bottom Navigation Bar

```
┌─────────────────────────────────────────────┐
│                                              │
│   [Home]     [Plus]     [Compass]   [User]  │
│   Feed      Create     Discover    Profile   │
│                                              │
└─────────────────────────────────────────────┘
```

**Specifications:**
- Position: `fixed` at bottom, full-width.
- Height: 64px + safe-area-inset-bottom.
- Background: Glass effect (`rgba(10, 10, 20, 0.85)`, `backdrop-filter: blur(20px)`).
- Border-top: `1px solid rgba(255, 255, 255, 0.08)`.
- 4 tabs: Feed (Home), Create (Plus — larger, accent-colored), Discover (Compass), Profile (User).
- Active tab: Accent color with subtle glow underline.
- The Create button (`Plus`) is visually elevated: larger icon (28px), accent background circle, subtle scale animation on tap.

### 6.3 Spinning Album Art Pill (Mini Player)

```css
.svx-album-art {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.15);
  animation: svx-spin 4s linear infinite;
  animation-play-state: paused;
}

.svx-album-art.playing {
  animation-play-state: running;
}

@keyframes svx-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 6.4 Animated CSS Equalizer Bars

```css
.svx-equalizer {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.svx-eq-bar {
  width: 3px;
  border-radius: 1.5px;
  background: var(--svx-text-accent);
  animation: svx-eq-bounce 0.8s ease-in-out infinite alternate;
}

.svx-eq-bar:nth-child(1) { height: 40%; animation-delay: 0s; }
.svx-eq-bar:nth-child(2) { height: 70%; animation-delay: 0.15s; }
.svx-eq-bar:nth-child(3) { height: 50%; animation-delay: 0.3s; }
.svx-eq-bar:nth-child(4) { height: 80%; animation-delay: 0.1s; }
.svx-eq-bar:nth-child(5) { height: 60%; animation-delay: 0.25s; }

@keyframes svx-eq-bounce {
  0%   { height: 20%; }
  100% { height: 100%; }
}

/* Pause equalizer when audio is paused */
.svx-equalizer.paused .svx-eq-bar {
  animation-play-state: paused;
}
```

### 6.5 Double-Tap Heart Burst Animation

When a user double-taps a Shayari card:
1. A large SVG Heart icon (Lucide `Heart`, filled, 80px) appears centered on the card.
2. It scales up from 0 to 1.2 with a spring-like bounce, then fades out.
3. Small heart particles burst outward (6–8 mini hearts).
4. Total animation duration: ~800ms.

```css
@keyframes svx-heart-burst {
  0%   { transform: scale(0); opacity: 1; }
  50%  { transform: scale(1.3); opacity: 1; }
  70%  { transform: scale(0.95); opacity: 0.9; }
  85%  { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 0; }
}
```

### 6.6 Comment Bottom-Sheet Drawer

- Slides up from the bottom of the screen.
- Glass background with heavier blur (32px).
- Drag handle at top (thin pill-shaped bar, 40px wide, 4px height).
- Max height: 70vh (scrollable if more comments).
- Input field at bottom (sticky) with a Send button (Lucide `Send` icon).

### 6.7 Verified Founder Badge

```css
.svx-verified-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  color: #ffc144;
  filter: drop-shadow(0 0 6px rgba(255, 193, 68, 0.6));
  animation: svx-badge-pulse 3s ease-in-out infinite;
}

@keyframes svx-badge-pulse {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(255, 193, 68, 0.4)); }
  50%      { filter: drop-shadow(0 0 8px rgba(255, 193, 68, 0.8)); }
}
```

---

## 7. Share Image Watermark

When exporting a Shayari card as an HD PNG via `html2canvas`:

### 7.1 Watermark Footer Layout

```
┌─────────────────────────────────────────────┐
│                                              │
│    [Formatted Shayari Card Content]          │
│                                              │
├─────────────────────────────────────────────┤
│  ShayariVerse X  •  Tum Hi Ho (Slowed)      │  ← Vector watermark footer
└─────────────────────────────────────────────┘
```

### 7.2 Watermark Specifications

- Height: 40px.
- Background: `rgba(0, 0, 0, 0.6)`.
- Text: "ShayariVerse X" (left, bold, 12px) + bullet separator + Song Name (right, regular, 11px).
- Font: Inter (clean sans-serif).
- Color: `rgba(255, 255, 255, 0.7)`.
- **No emoji** — all text is rendered as SVG/canvas text.
- Optional: Tiny SVG app icon (Lucide `Sparkles`) before the app name.

---

## 8. Responsive & Mobile Ergonomics

### 8.1 Core Mobile Rules

```css
/* Disable text selection on UI chrome (not on Shayari content) */
.svx-app-shell {
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Allow text selection on Shayari content (for copy) */
.svx-shayari-text {
  -webkit-user-select: text;
  user-select: text;
}

/* Hide browser scrollbars */
::-webkit-scrollbar {
  display: none;
}

* {
  scrollbar-width: none;
}

/* Safe area padding for notched phones */
.svx-bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Prevent overscroll bounce */
html, body {
  overscroll-behavior: none;
}
```

### 8.2 Touch Targets

- Minimum touch target: 44px x 44px (WCAG compliance).
- Buttons: min-height 48px with 12px padding.
- Card action icons: 40px tap area with 8px padding.

### 8.3 Breakpoints

| Breakpoint | Width | Layout Adjustment |
|---|---|---|
| Mobile (primary) | < 480px | Full-width cards, 16px side padding |
| Small Tablet | 480–768px | Cards max-width 480px, centered |
| Large (fallback) | > 768px | Content area max-width 520px, centered |

---

## 9. Animation Performance Budget

> [!WARNING]
> To maintain **60fps scrolling** on mid-range Android devices (4GB RAM):

| Rule | Limit |
|---|---|
| Active `backdrop-filter` layers in viewport | Max 4 simultaneous |
| CSS animations running concurrently | Max 6 |
| `box-shadow` repaints | Use `will-change: transform` on animated elements |
| Floating orbs | Use `transform` only (no `left`/`top` animation) |
| Heart burst animation | Destroy DOM node after animation ends |
| Equalizer bars | Pause when audio is paused or element is off-screen |

```css
/* GPU-accelerate glass cards during scroll */
.svx-glass-card {
  will-change: transform;
  transform: translateZ(0);
}
```

---

## 10. Color Reference (Complete Palette)

```css
:root {
  /* Background */
  --svx-bg-deep: #06060b;
  --svx-bg-surface: #0d0d16;
  --svx-bg-elevated: #141422;

  /* Glass */
  --svx-glass-bg: rgba(255, 255, 255, 0.05);
  --svx-glass-border: rgba(255, 255, 255, 0.14);
  --svx-glass-border-hover: rgba(255, 255, 255, 0.22);

  /* Accent - Mood Themes */
  --svx-accent-purple: #8a2be2;
  --svx-accent-cyan: #00d2ff;
  --svx-accent-rose: #ff4081;
  --svx-accent-amber: #ffc144;

  /* Text */
  --svx-text-primary: rgba(255, 255, 255, 0.95);
  --svx-text-secondary: rgba(255, 255, 255, 0.65);
  --svx-text-muted: rgba(255, 255, 255, 0.40);
  --svx-text-disabled: rgba(255, 255, 255, 0.20);

  /* Semantic */
  --svx-success: #4caf50;
  --svx-error: #f44336;
  --svx-warning: #ff9800;

  /* Interaction */
  --svx-like-active: #ff4081;
  --svx-verified-gold: #ffc144;
}
```

---

*Last updated: 2026-11-15 — Phase 0*
