<p align="center">
  <img src="assets/icon.svg" width="128" height="128" alt="ShayariVerse X Logo" />
</p>

<h1 align="center">ShayariVerse X (SVX)</h1>

<p align="center">
  <b>Dark Liquid Glassmorphism Social Shayari & Viral Music Android Application</b><br />
  <i>Where soulful poetic couplets meet curated cinematic melodies in real time.</i>
</p>

<p align="center">
  <a href="https://github.com/BeginnerAman/shayariverse-x/releases/latest">
    <img src="https://img.shields.io/github/v/release/BeginnerAman/shayariverse-x?style=flat-square&color=8a2be2&label=Latest%20Release" alt="Latest Release" />
  </a>
  <a href="https://github.com/BeginnerAman/shayariverse-x/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/BeginnerAman/shayariverse-x/build-apk.yml?style=flat-square&label=Build%20APK&color=00d2ff" alt="Build Status" />
  </a>
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20PWA-f72585?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/Capacitor-v6.1.2-118ab2?style=flat-square" alt="Capacitor" />
  <img src="https://img.shields.io/badge/Database-Supabase-06d6a0?style=flat-square" alt="Database" />
  <img src="https://img.shields.io/badge/License-MIT-ffd166?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="https://github.com/BeginnerAman/shayariverse-x/releases/download/v1.1.5/ShayariVerse-X-v1.1.5.apk">
    <img src="https://img.shields.io/badge/Direct%20Download-v1.1.5%20APK-00d2ff?style=for-the-badge&logo=android&logoColor=white" alt="Download APK" />
  </a>
</p>

---

## 🌟 Overview

**ShayariVerse X (`SVX`)** is a next-generation social poetry platform designed specifically for Android. Built with a signature **Dark Liquid Glassmorphism** design language, SVX lets writers and poetry enthusiasts craft expressive couplets, attach curated background music, interact with live discussions, and share beautifully rendered quote cards across social media.

Engineered with a **0ms optimistic interface**, ShayariVerse X delivers an instantaneous native feel without the bloat of heavy web frameworks.

---

## ✨ Key Features

- **🎨 Dark Liquid Glassmorphism UI:** Translucent frosted dark panels, specular top-lighting, neon mood glows (Purple, Cyan, Sunset, Emerald, Midnight), and Nastaliq Urdu typography.
- **🎵 Viral Audio Pairing Engine:** Attach high-fidelity lo-fi and slowed+reverb melodies directly to your couplets. Features an organic 5-bar dynamic frequency equalizer that synchronizes with playback.
- **⚡ 0ms Optimistic Feed & Offline Sync:** Dual-mode database layer that renders feeds synchronously from local cache in 0ms while seamlessly keeping state synchronized with Supabase cloud.
- **💬 Real-Time Discussion Stream:** Engaging community comment sheet with instant submission feedback and clean thread management.
- **❤️ Double-Tap Tactile Heart Burst:** Instant 0ms double-tap heart animations with cross-view synchronized like glow across Feed and Profile tabs.
- **✍️ Smart Couplet Composer:** Live visual preview, automatic couplet stanza detection, responsive font auto-fitting, and integrated background score selector.
- **📱 One-Tap Quote Sharing:** Generate high-resolution branded cards ready for Instagram Stories, WhatsApp status, and X with a single tap.
- **🔄 In-App Auto-Update System:** Built-in seamless update engine keeping devices connected to the latest releases without manual reinstallation.

---

## 🛠️ Architecture & Tech Stack

ShayariVerse X is built around lightweight, modular ES6 standards for maximum speed, minimal battery consumption, and zero cold-start latency:

| Layer | Technology | Description |
|---|---|---|
| **Frontend Runtime** | Vanilla ES6 Modules | Zero heavy framework overhead; sub-50KB core bundle |
| **Mobile Bridge** | [Capacitor 6](https://capacitorjs.com/) | Native Android runtime with hardware back navigation & status bar control |
| **Database & Cloud** | [Supabase](https://supabase.com/) | Real-time PostgreSQL database with dual-mode offline fallback |
| **Audio Pipeline** | HTML5 Audio + Web Audio API | Single-instance singleton audio player with background auto-pause rules |
| **Styling & Effects** | Pure CSS3 Liquid Glass Engine | GPU-accelerated transforms, `content-visibility: auto`, and zero render-blocking styles |
| **Build Pipeline** | GitHub Actions & Gradle | Automated headless APK compilation with persistent keystore signing |

---

## 🚀 Getting Started

### 📲 Download the Android APK

You can download and install the latest pre-built APK directly on your Android device:

1. Download **[ShayariVerse-X-v1.1.5.apk](https://github.com/BeginnerAman/shayariverse-x/releases/download/v1.1.5/ShayariVerse-X-v1.1.5.apk)**.
2. Open the downloaded `.apk` file on your phone and tap **Install**.
3. Launch **ShayariVerse X** and start exploring or posting couplets.

---

### 💻 Local Development Setup

To build and run ShayariVerse X locally:

```bash
# 1. Clone the repository
git clone https://github.com/BeginnerAman/shayariverse-x.git
cd shayariverse-x

# 2. Install dependencies
npm install

# 3. Build web distribution bundle
npm run build

# 4. Sync web bundle with Capacitor Android
npx cap sync android

# 5. Open in Android Studio or run directly
npx cap open android
```

---

## 📁 Project Structure

```text
shayariverse-x/
├── .github/
│   └── workflows/
│       └── build-apk.yml          # Automated Android APK CI/CD pipeline
├── assets/
│   └── icon.svg                   # Brand icon vector
├── bgm/
│   └── preloaded-songs.json       # Curated high-fidelity audio catalog
├── js/
│   ├── config.js                  # Central configuration & runtime constants
│   ├── db.js                      # Database abstraction layer (Dual-Mode)
│   ├── audio-engine.js            # Singleton audio controller & search engine
│   ├── composer.js                # Smart Shayari composer modal logic
│   └── ui.js                      # UI controllers, router & view management
├── scripts/
│   ├── build.js                   # Web bundle packaging script
│   └── sync-version.js            # Android Gradle version synchronization
├── index.html                     # Core application markup
├── style.css                      # Liquid Glassmorphism design system
├── capacitor.config.json          # Native Android container settings
└── package.json                   # Project metadata and dependencies
```

---

## 👨‍💻 Founder & Author

**Aman** (`@aman`)  
*Creator & Architect of ShayariVerse X*  
GitHub: [@BeginnerAman](https://github.com/BeginnerAman)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
