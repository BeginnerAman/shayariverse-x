<p align="center">
  <img src="assets/icon.svg" width="112" height="112" alt="ShayariVerse X Logo" />
</p>

<h1 align="center">ShayariVerse X</h1>

<p align="center">
  <b>Dark Liquid Glassmorphism Social Shayari & Music Application for Android</b><br />
  <i>Connecting expressive poetry with curated audio melodies in real time.</i>
</p>

<p align="center">
  <a href="https://github.com/BeginnerAman/shayariverse-x/releases/latest">
    <img src="https://img.shields.io/github/v/release/BeginnerAman/shayariverse-x?style=flat-square&labelColor=161b22&color=238636&label=Version" alt="Latest Release" />
  </a>
  <a href="https://github.com/BeginnerAman/shayariverse-x/releases">
    <img src="https://img.shields.io/github/downloads/BeginnerAman/shayariverse-x/total?style=flat-square&labelColor=161b22&color=0ea5e9&label=Downloads" alt="Total Downloads" />
  </a>
  <a href="https://github.com/BeginnerAman/shayariverse-x/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/BeginnerAman/shayariverse-x/build-apk.yml?style=flat-square&labelColor=161b22&color=1f6feb&label=Build" alt="Build Status" />
  </a>
  <img src="https://img.shields.io/badge/Platform-Android-388bfd?style=flat-square&labelColor=161b22" alt="Platform Android" />
  <img src="https://img.shields.io/badge/Capacitor-v6.1.2-1f6feb?style=flat-square&labelColor=161b22" alt="Capacitor" />
  <img src="https://img.shields.io/badge/Database-Supabase-238636?style=flat-square&labelColor=161b22" alt="Supabase" />
  <img src="https://img.shields.io/badge/License-MIT-30363d?style=flat-square&labelColor=161b22" alt="MIT License" />
</p>

<p align="center">
  <a href="https://github.com/BeginnerAman/shayariverse-x/releases/download/v1.1.7/ShayariVerse-X-v1.1.7.apk">
    <img src="https://img.shields.io/badge/Download_APK-v1.1.7_Release-1f6feb?style=for-the-badge&logo=android&logoColor=white&labelColor=0d1117" alt="Download APK" />
  </a>
</p>

---

## Overview

**ShayariVerse X (SVX)** is a dedicated social poetry platform built for Android. Featuring a custom **Dark Liquid Glassmorphism** interface, SVX empowers writers and readers to compose poetry, attach curated background scores, engage in community discussions, and export high-resolution quote cards for social media sharing.

Engineered with a **0ms optimistic data pipeline**, ShayariVerse X delivers native touch response and instantaneous feed rendering without framework bloat.

---

## Core Capabilities

- **Liquid Glassmorphism Interface:** Deep space tinted surfaces, specular top highlights, subtle ambient glow themes (Purple, Cyan, Sunset, Emerald, Midnight), and Nastaliq typography support.
- **Background Music Engine:** Attach slowed, reverb, and acoustic melodies to couplets. Includes an organic 5-bar audio frequency equalizer that synchronizes in real time with audio playback.
- **0ms Synchronous Feed:** Instant cached feed rendering on app launch, coupled with seamless background synchronization to the Supabase cloud layer.
- **Discussion Stream:** High-performance community comments with real-time optimistic posting and count management.
- **Tactile Heart Feedback:** Immediate 0ms double-tap heart animations with bidirectional like glow synchronization across feed and profile views.
- **Couplet Composer:** Real-time preview rendering, automated stanza detection, responsive typography auto-sizing, and integrated viral audio selector.
- **Quote Card Export:** Single-tap generation of branded, publication-ready cards optimized for Instagram Stories, WhatsApp, and social channels.
- **Automated Update Engine:** In-app update notifications ensuring clients remain synchronized with the latest platform releases.

---

## Technical Stack

| Layer | Component | Details |
|---|---|---|
| **Runtime Architecture** | Vanilla ES6 Modules | Zero external UI dependencies; lightweight footprint |
| **Native Bridge** | Capacitor 6 | Native Android runtime with hardware navigation and system bar controls |
| **Cloud & Storage** | Supabase | Real-time PostgreSQL database with local caching fallback |
| **Audio Processing** | HTML5 Audio + Web Audio API | Singleton audio engine with background auto-pause for battery conservation |
| **Styling & Layout** | Pure CSS3 Engine | Hardware-accelerated transitions and `content-visibility: auto` viewport isolation |
| **Continuous Integration** | GitHub Actions & Gradle | Headless Android APK compilation and persistent release distribution |

---

## Installation & Download

### Download Pre-built APK

The latest production APK is available directly via GitHub Releases:

1. Download **[ShayariVerse-X-v1.1.5.apk](https://github.com/BeginnerAman/shayariverse-x/releases/download/v1.1.5/ShayariVerse-X-v1.1.5.apk)**.
2. Open the `.apk` file on your Android device and confirm installation.
3. Launch **ShayariVerse X**.

---

### Local Development

To clone, build, and run the project locally:

```bash
# Clone the repository
git clone https://github.com/BeginnerAman/shayariverse-x.git
cd shayariverse-x

# Install local build dependencies
npm install

# Compile web assets into distribution bundle
npm run build

# Synchronize assets with Capacitor Android container
npx cap sync android

# Open project in Android Studio
npx cap open android
```

---

## Repository Layout

```text
shayariverse-x/
├── .github/
│   └── workflows/
│       └── build-apk.yml          # Android APK compilation pipeline
├── assets/
│   └── icon.svg                   # Vector application icon
├── bgm/
│   └── preloaded-songs.json       # Preloaded audio metadata catalog
├── js/
│   ├── config.js                  # Global configuration parameters
│   ├── db.js                      # Dual-mode database layer
│   ├── audio-engine.js            # Audio playback controller
│   ├── composer.js                # Couplet editor modal logic
│   └── ui.js                      # View controllers and navigation
├── scripts/
│   ├── build.js                   # Web bundle compiler
│   └── sync-version.js            # Native Android version synchronization
├── index.html                     # Core application markup
├── style.css                      # Liquid Glassmorphism design system
├── capacitor.config.json          # Capacitor Android configuration
└── package.json                   # Project metadata and build scripts
```

---

## Founder & Author

**Aman** (`@aman`)  
Creator & Architect of ShayariVerse X  
GitHub: [@BeginnerAman](https://github.com/BeginnerAman)

---

## License

This project is open-source and distributed under the [MIT License](LICENSE).
