# ShayariVerse X — AI Workflow Rules & Agent Protocol

> **Single Source of Truth** — This document defines how the AI agent (you) must operate in all upcoming implementation turns to maintain consistency, save tokens, and prevent drift for **ShayariVerse X (SVX)**.

---

## 1. Read-First Protocol

> [!IMPORTANT]
> Before writing **any** code in any turn, you MUST read the following files first:

### Mandatory Pre-Read (Every Turn)

1. **`specs/progress-tracker.md`** — Check which phase/step is next. Never skip ahead.
2. **The relevant spec file** for the current phase:

| Phase | Primary Spec File | Secondary Spec File |
|---|---|---|
| Phase 1 (Shell + CSS) | `specs/ui-context.md` | `specs/code-standards.md` |
| Phase 2 (Feed + Audio) | `specs/ui-context.md` | `specs/architecture.md` |
| Phase 3 (Composer) | `specs/ui-context.md` | `specs/code-standards.md` |
| Phase 4 (Music Picker) | `specs/architecture.md` | `specs/ui-context.md` |
| Phase 5 (Auth + Admin) | `specs/project-overview.md` | `specs/architecture.md` |
| Phase 6 (Profile + Share) | `specs/project-overview.md` | `specs/ui-context.md` |
| Phase 7 (Supabase + APK) | `specs/architecture.md` | `specs/code-standards.md` |

### Why Read First?

- Prevents hallucinating features that don't exist in the spec.
- Prevents using wrong naming, wrong prefixes, or wrong API endpoints.
- Saves tokens by avoiding back-and-forth corrections.
- Ensures incremental progress (no phase skipping).

---

## 2. Phase-by-Phase Execution Protocol

### 2.1 One Phase at a Time

- Complete **one phase** fully before moving to the next.
- Within a phase, complete **one step** at a time.
- After completing each step, update `specs/progress-tracker.md` by changing `[ ]` to `[x]`.

### 2.2 Phase Entry Checklist

Before starting a new phase:

1. Verify the **previous phase** is fully marked `[x]` in `progress-tracker.md`.
2. Read the relevant spec files (see table above).
3. List the files you will create or modify.
4. Only touch files relevant to the current phase.

### 2.3 Phase Exit Checklist

After completing a phase:

1. Run the Self-Audit Checklist (Section 4 below).
2. Mark all steps in the phase as `[x]` in `progress-tracker.md`.
3. Stop and wait for user confirmation before starting the next phase.

---

## 3. Surgical Edit Rules — Token Conservation

### 3.1 Minimize File Touches

- Only modify files that are **directly required** by the current phase.
- Never refactor or "improve" files from previous phases unless fixing a bug.
- Never rewrite an entire file when a targeted edit suffices.

### 3.2 New Files vs. Edits

| Phase | Creates | Edits |
|---|---|---|
| Phase 1 | `index.html`, `style.css`, `js/config.js`, `js/ui.js` | — |
| Phase 2 | `js/db.js` (LocalStorage layer), `js/audio-engine.js` | `index.html`, `style.css`, `js/ui.js` |
| Phase 3 | `js/composer.js` | `index.html`, `style.css`, `js/ui.js` |
| Phase 4 | — | `js/audio-engine.js`, `js/ui.js`, `style.css`, `index.html` |
| Phase 5 | — | `js/db.js`, `js/ui.js`, `style.css`, `index.html`, `js/config.js` |
| Phase 6 | `lib/html2canvas.min.js` (vendor) | `js/ui.js`, `style.css`, `index.html` |
| Phase 7 | `supabase-setup.sql`, `.github/workflows/supabase-ping.yml`, `capacitor.config.json` | `js/db.js`, `js/config.js`, `package.json` |

### 3.3 Avoid These Token-Wasting Patterns

- Re-outputting an entire file when only 5 lines changed.
- Generating code that was already written in a previous phase.
- Explaining code that is self-documenting.
- Generating test data that already exists in the spec.

---

## 4. Self-Audit Checklist — Run Before Every Response

> [!CAUTION]
> Before submitting your response in any coding turn, mentally verify every item below. If any check fails, fix it immediately before responding.

### 4.1 Branding & Identity

- [ ] Used **"ShayariVerse X"** (not "ShayariVerse" alone) in all user-facing strings.
- [ ] Used **`svx_`** prefix on all LocalStorage keys (not `sv_`, `shayari_`, or no prefix).
- [ ] Used **`com.beginneraman.shayariversex`** as the package ID.
- [ ] Used **`shayariverse-x-db`** as the Supabase project reference.
- [ ] CDN URLs point to **`beginneraman/shayariverse-x@main/bgm/`**.

### 4.2 Iconography — Zero Emoji

- [ ] **Zero native emoji** in any HTML, JS string, CSS content, alert, modal, toast, or placeholder.
- [ ] Every icon is a **Lucide SVG** with `stroke-width: 1.75px`.
- [ ] Badge next to @aman uses **Lucide `BadgeCheck`** (SVG), not emoji.
- [ ] Music notes use **Lucide `Music`** or **`Disc`** (SVG), not emoji.

### 4.3 Dual-Mode Compatibility

- [ ] Feature works in **LocalStorage demo mode** (empty `SUPABASE_URL`).
- [ ] Feature works in **Supabase mode** (with valid credentials).
- [ ] `db.js` API is called (not raw `localStorage` or raw Supabase calls from `ui.js`).

### 4.4 Security

- [ ] PIN is **SHA-256 hashed** before storage or comparison.
- [ ] User content rendered via **`textContent`** (not `innerHTML`).
- [ ] Handle validation uses regex: `/^[a-z0-9_]{3,20}$/`.
- [ ] Admin actions check `is_admin` flag from database, not client-side only.

### 4.5 Performance

- [ ] Song search input is **debounced (400ms)**.
- [ ] Audio auto-pauses on **`visibilitychange`**.
- [ ] Max **4** `backdrop-filter` layers visible simultaneously.
- [ ] Feed uses **pagination** (15 items per page).
- [ ] Off-screen cards have `backdrop-filter` disabled via Intersection Observer.

### 4.6 Progress Tracking

- [ ] **Updated `specs/progress-tracker.md`** after completing the step/phase.

---

## 5. Error Recovery Protocol

### 5.1 If a Bug Is Found in a Previous Phase

1. Fix the bug with a **minimal, surgical edit** to the affected file.
2. Note the fix in `progress-tracker.md` under a "Fixes" section for the current phase.
3. Do NOT rewrite or refactor the entire file.

### 5.2 If a Spec Is Ambiguous

1. State the ambiguity clearly.
2. Propose the most reasonable interpretation.
3. Proceed with the proposed interpretation unless the user corrects it.
4. Document the decision in `progress-tracker.md`.

### 5.3 If a Phase Has Dependencies Not Yet Built

1. Use a placeholder or stub (e.g., `// TODO: Phase 5 - implement auth check`).
2. Do NOT build ahead to satisfy the dependency.
3. The stub will be replaced when the dependency's phase is reached.

---

## 6. Communication Protocol

### 6.1 Response Format for Coding Turns

```
## Phase X, Step Y: [Step Title]

### Files Modified:
- `path/to/file.ext` — [brief description of changes]

### What Was Done:
[2-3 sentence summary]

### What's Next:
[Next step from progress-tracker.md]
```

### 6.2 When to Stop and Wait

- After completing **all steps in a phase**, stop and wait for user confirmation.
- After encountering an **ambiguous requirement**, stop and ask.
- After making a **design decision** not explicitly covered in specs, stop and confirm.

---

## 7. Naming Constants Quick Reference

For quick copy-paste during implementation:

```javascript
// App Identity
'ShayariVerse X'                                           // App name (user-facing)
'SVX'                                                       // Short name
'com.beginneraman.shayariversex'                           // Android package ID
'shayariverse-x-db'                                        // Supabase project ref

// URLs
'https://github.com/beginneraman/shayariverse-x'           // GitHub repo
'https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/'  // CDN base
'https://saavn.dev/api/search/songs'                       // JioSaavn API
'https://itunes.apple.com/search'                          // iTunes API

// Storage
'svx_'                                                     // LocalStorage prefix
'svx_users'                                                // Users key
'svx_shayaris'                                             // Shayaris key
'svx_likes'                                                // Likes key
'svx_comments'                                             // Comments key
'svx_current_user'                                         // Session key
'svx_admin_logs'                                           // Admin logs key
'svx_reserved_handles'                                     // Reserved handles key

// VIP Handles
['aman', 'beginneraman', 'admin', 'founder', 'shayariversex', 'svx']

// Founder
{ handle: 'aman', display_name: 'Aman', is_admin: true, is_verified: true }
```

---

*Last updated: 2026-11-15 — Phase 0*
