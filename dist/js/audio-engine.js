// ShayariVerse X (SVX) — Singleton Audio Engine
// Mobile Performance & Battery Rules: Auto-pause on background/minimize, single audio instance

import { CONFIG } from './config.js';

class AudioEngine {
  constructor() {
    this.audio = typeof Audio !== 'undefined' ? new Audio() : {
      addEventListener() {},
      play() { return Promise.resolve(); },
      pause() {},
      load() {}
    };
    if (this.audio) {
      this.audio.loop = true; // Seamless endless loop for couplet background music
    }
    this.playbackMode = 'loop'; // 'loop' | 'sequential' | 'shuffle'
    this.playlist = [];
    this.currentIndex = -1;
    this.currentTrack = null;
    this._isPlaying = false;
    this._curatedCache = null;
    this._fadeTimer = null;
    this._mediaSessionWired = false;
    this._localNotifInitialized = false;

    // Background playback preference (persisted in localStorage, defaults to true)
    let storedBg = null;
    try {
      storedBg = typeof localStorage !== 'undefined' ? localStorage.getItem('svx_bg_playback') : null;
    } catch {}
    this.backgroundPlaybackEnabled = storedBg === null ? true : storedBg === 'true';

    this.listeners = {
      playState: new Set(),
      trackChange: new Set(),
      timeUpdate: new Set(),
      modeChange: new Set(),
      bgPlaybackChange: new Set(),
      error: new Set()
    };

    this._bindAudioEvents();
    this._bindVisibilityEvents();
  }

  _bindAudioEvents() {
    if (!this.audio.addEventListener) return;
    this.audio.addEventListener('play', () => {
      this._isPlaying = true;
      this._updateMediaSession(this.currentTrack);
      this._showPlaybackNotification(this.currentTrack, true);
      this._notify('playState', { isPlaying: true, track: this.currentTrack });
    });

    this.audio.addEventListener('pause', () => {
      this._isPlaying = false;
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      this._showPlaybackNotification(this.currentTrack, false);
      this._notify('playState', { isPlaying: false, track: this.currentTrack });
    });

    this.audio.addEventListener('ended', () => {
      this._isPlaying = false;
      this._notify('playState', { isPlaying: false, track: this.currentTrack });

      if (this.playbackMode === 'sequential' || this.playbackMode === 'shuffle') {
        this.playNext();
      } else {
        this._clearPlaybackNotification();
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio.duration) {
        this._notify('timeUpdate', {
          currentTime: this.audio.currentTime,
          duration: this.audio.duration,
          progress: (this.audio.currentTime / this.audio.duration) * 100
        });

        // Update Android lock screen notification progress bar if supported
        if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
          try {
            navigator.mediaSession.setPositionState({
              duration: this.audio.duration || 0,
              playbackRate: this.audio.playbackRate || 1,
              position: this.audio.currentTime || 0
            });
          } catch {}
        }
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('[SVX Audio] Playback error or network failure:', e);
      this._isPlaying = false;
      this._notify('playState', { isPlaying: false, track: this.currentTrack });
      this._notify('error', e);
    });
  }

  _bindVisibilityEvents() {
    // Background Playback / Battery rule
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this._isPlaying) {
          if (!this.backgroundPlaybackEnabled) {
            console.log('[SVX Audio] App backgrounded, auto-pausing audio (Background Playback is OFF)');
            this.pause(true);
          } else {
            console.log('[SVX Audio] App backgrounded, continuing audio playback in background (Background Playback is ON)');
          }
        }
      });
    }
  }

  _updateMediaSession(track) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !track) return;
    try {
      const artUrl = track.art || 'https://raw.githubusercontent.com/BeginnerAman/shayariverse-x/main/assets/icon.png';
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name || 'Shayari BGM',
        artist: track.artist || 'ShayariVerse X',
        album: 'ShayariVerse X Poetic Beats',
        artwork: [
          { src: artUrl, sizes: '512x512', type: 'image/png' }
        ]
      });

      if (!this._mediaSessionWired) {
        this._mediaSessionWired = true;
        navigator.mediaSession.setActionHandler('play', () => {
          if (this.currentTrack) {
            this.audio.play().catch(() => {});
          }
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          this.pause(true);
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          this.playNext();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          this.playPrevious();
        });
      }

      navigator.mediaSession.playbackState = this._isPlaying ? 'playing' : 'paused';
    } catch (e) {
      console.warn('[SVX Audio] MediaSession update error:', e);
    }
  }

  _getLocalNotifications() {
    if (typeof window === 'undefined') return null;
    return window.Capacitor?.Plugins?.LocalNotifications || null;
  }

  async _initLocalNotificationBridge() {
    if (this._localNotifInitialized) return;
    const notifs = this._getLocalNotifications();
    if (!notifs) return;

    try {
      this._localNotifInitialized = true;

      // 1. Silent dedicated notification channel for background audio playback
      if (typeof notifs.createChannel === 'function') {
        await notifs.createChannel({
          id: 'svx_bgm_channel_v2',
          name: 'Shayari BGM Player',
          description: 'Live background audio playback and interactive controls',
          importance: 3, // Level 2: Active notification tray (out of Silent) & auto-expanded on Lock Screen
          visibility: 1, // VISIBILITY_PUBLIC: shows on Android Lock Screen
          vibration: false,
          sound: undefined
        }).catch(() => {});
      }

      // 2. Register Interactive Action Types (Pause, Resume, Next Track)
      if (typeof notifs.registerActionTypes === 'function') {
        await notifs.registerActionTypes({
          types: [
            {
              id: 'SVX_AUDIO_PLAYING',
              actions: [
                { id: 'svx_pause', title: 'Pause' },
                { id: 'svx_next', title: 'Next Track' }
              ]
            },
            {
              id: 'SVX_AUDIO_PAUSED',
              actions: [
                { id: 'svx_resume', title: 'Resume' },
                { id: 'svx_next', title: 'Next Track' }
              ]
            }
          ]
        }).catch(() => {});
      }

      // 3. Listen for Action Button clicks from Notification Shade & Lock Screen
      if (typeof notifs.addListener === 'function') {
        notifs.addListener('localNotificationActionPerformed', (actionData) => {
          const actionId = actionData?.actionId;
          if (actionId === 'svx_pause') {
            this.pause(true);
          } else if (actionId === 'svx_resume') {
            if (this.currentTrack) {
              this.audio.play().catch(() => {});
            }
          } else if (actionId === 'svx_next') {
            this.playNext();
          }
        });
      }

      // 4. Request Android 13+ Notification Permission if prompted
      if (typeof notifs.checkPermissions === 'function' && typeof notifs.requestPermissions === 'function') {
        const status = await notifs.checkPermissions().catch(() => null);
        if (status?.display === 'prompt' || status?.display === 'prompt-with-rationale') {
          await notifs.requestPermissions().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[SVX Audio] Local notification bridge init error:', err);
    }
  }

  async _showPlaybackNotification(track, isPlaying = true) {
    if (!track) return;
    const notifs = this._getLocalNotifications();
    if (!notifs || typeof notifs.schedule !== 'function') return;

    await this._initLocalNotificationBridge();

    try {
      const NOTIF_ID = 7824;
      await notifs.schedule({
        notifications: [
          {
            id: NOTIF_ID,
            title: track.name || 'Shayari BGM',
            body: isPlaying
              ? `${track.artist || 'ShayariVerse X'} • Now Playing`
              : `${track.artist || 'ShayariVerse X'} • Paused (Tap to resume)`,
            channelId: 'svx_bgm_channel_v2',
            smallIcon: 'ic_stat_music',
            largeIcon: 'svx_cover',
            iconColor: '#9333ea',
            ongoing: !!isPlaying, // pinned while playing, swipeable when paused
            autoCancel: false,
            actionTypeId: isPlaying ? 'SVX_AUDIO_PLAYING' : 'SVX_AUDIO_PAUSED',
            extra: { url: track.url }
          }
        ]
      });
    } catch (err) {
      console.warn('[SVX Audio] Notification schedule error:', err);
    }
  }

  _clearPlaybackNotification() {
    const notifs = this._getLocalNotifications();
    if (notifs && typeof notifs.cancel === 'function') {
      try {
        notifs.cancel({ notifications: [{ id: 7824 }] }).catch(() => {});
      } catch {}
    }
  }

  _notify(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[SVX Audio] Listener error for ${event}:`, err);
        }
      });
    }
  }

  // --- Public API ---

  onPlayStateChange(callback) {
    this.listeners.playState.add(callback);
    return () => this.listeners.playState.delete(callback);
  }

  onTrackChange(callback) {
    this.listeners.trackChange.add(callback);
    return () => this.listeners.trackChange.delete(callback);
  }

  onTimeUpdate(callback) {
    this.listeners.timeUpdate.add(callback);
    return () => this.listeners.timeUpdate.delete(callback);
  }

  onError(callback) {
    this.listeners.error.add(callback);
    return () => this.listeners.error.delete(callback);
  }

  onModeChange(callback) {
    this.listeners.modeChange.add(callback);
    return () => this.listeners.modeChange.delete(callback);
  }

  onBackgroundPlaybackChange(callback) {
    this.listeners.bgPlaybackChange.add(callback);
    return () => this.listeners.bgPlaybackChange.delete(callback);
  }

  setBackgroundPlayback(enabled) {
    this.backgroundPlaybackEnabled = !!enabled;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('svx_bg_playback', this.backgroundPlaybackEnabled ? 'true' : 'false');
      }
    } catch {}
    this._notify('bgPlaybackChange', { enabled: this.backgroundPlaybackEnabled });
  }

  isBackgroundPlaybackEnabled() {
    return this.backgroundPlaybackEnabled;
  }

  setPlaybackMode(mode) {
    if (!['loop', 'sequential', 'shuffle'].includes(mode)) return;
    this.playbackMode = mode;
    if (this.audio) {
      this.audio.loop = mode === 'loop';
    }
    this._notify('modeChange', { mode });
  }

  getPlaybackMode() {
    return this.playbackMode;
  }

  setPlaylist(tracks = []) {
    this.playlist = Array.isArray(tracks) ? [...tracks] : [];
    if (this.currentTrack && this.playlist.length > 0) {
      const idx = this.playlist.findIndex(t => t.url === this.currentTrack.url);
      if (idx !== -1) this.currentIndex = idx;
    }
  }

  getPlaylist() {
    return this.playlist;
  }

  async playNext() {
    if (!this.playlist || this.playlist.length === 0) {
      await this.loadCuratedBGM();
    }
    if (!this.playlist || this.playlist.length === 0) return;

    let nextIndex;
    if (this.playbackMode === 'shuffle') {
      if (this.playlist.length === 1) {
        nextIndex = 0;
      } else {
        do {
          nextIndex = Math.floor(Math.random() * this.playlist.length);
        } while (nextIndex === this.currentIndex && this.playlist.length > 1);
      }
    } else {
      nextIndex = (this.currentIndex + 1) % this.playlist.length;
    }

    this.currentIndex = nextIndex;
    const nextTrack = this.playlist[nextIndex];
    if (nextTrack) {
      this.play(nextTrack.url, nextTrack);
    }
  }

  async playPrevious() {
    if (!this.playlist || this.playlist.length === 0) {
      await this.loadCuratedBGM();
    }
    if (!this.playlist || this.playlist.length === 0) return;

    let prevIndex;
    if (this.playbackMode === 'shuffle') {
      prevIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    }

    this.currentIndex = prevIndex;
    const prevTrack = this.playlist[prevIndex];
    if (prevTrack) {
      this.play(prevTrack.url, prevTrack);
    }
  }

  /**
   * Smoothly fades out audio volume before pausing (prevents abrupt click/cut)
   * @param {number} durationMs - Duration in ms (default 350ms)
   * @returns {Promise<void>}
   */
  async fadeOut(durationMs = 350) {
    if (!this._isPlaying || !this.audio || !this.audio.pause) {
      this.pause(true);
      return;
    }

    clearInterval(this._fadeTimer);
    const startVolume = this.audio.volume || 1;
    const steps = 14;
    const stepTime = Math.max(10, Math.floor(durationMs / steps));
    const volumeStep = startVolume / steps;

    return new Promise((resolve) => {
      this._fadeTimer = setInterval(() => {
        if (this.audio.volume > volumeStep) {
          this.audio.volume = Math.max(0, this.audio.volume - volumeStep);
        } else {
          clearInterval(this._fadeTimer);
          this.audio.pause();
          this.audio.volume = startVolume; // restore base volume for next playback
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Smoothly fades in audio volume on start/resume
   * @param {number} durationMs - Duration in ms (default 250ms)
   */
  fadeIn(durationMs = 250) {
    if (!this.audio) return;
    clearInterval(this._fadeTimer);
    const targetVolume = 1;
    this.audio.volume = 0;
    const steps = 12;
    const stepTime = Math.max(10, Math.floor(durationMs / steps));
    const volumeStep = targetVolume / steps;

    this._fadeTimer = setInterval(() => {
      if (this.audio.volume + volumeStep < targetVolume) {
        this.audio.volume = Math.min(targetVolume, this.audio.volume + volumeStep);
      } else {
        this.audio.volume = targetVolume;
        clearInterval(this._fadeTimer);
      }
    }, stepTime);
  }

  async play(url, metadata = {}) {
    if (!url) {
      console.warn('[SVX Audio] No URL provided to play');
      return;
    }

    // If same track is already loaded and paused, resume with smooth fade-in
    if (this.currentTrack && this.currentTrack.url === url) {
      try {
        await this.audio.play();
        this.fadeIn();
        return;
      } catch (err) {
        console.warn('[SVX Audio] Resume failed, re-loading track:', err);
      }
    }

    // If another track was currently playing, smoothly fade out before switching
    if (this._isPlaying) {
      await this.fadeOut(150);
    }

    // Switch to new track
    this.currentTrack = {
      url,
      name: metadata.name || 'Unknown Track',
      artist: metadata.artist || 'Unknown Artist',
      art: metadata.art || null,
      source: metadata.source || 'cdn'
    };

    if (this.playlist.length > 0) {
      const idx = this.playlist.findIndex(t => t.url === url);
      if (idx !== -1) {
        this.currentIndex = idx;
      }
    }

    if (this.audio) {
      this.audio.loop = (this.playbackMode === 'loop');
    }

    this._notify('trackChange', this.currentTrack);

    this.audio.src = url;
    this.audio.load();

    // Resilient CDN fallback: If jsDelivr encounters an edge issue, auto-fallback to raw GitHub
    this.audio.onerror = () => {
      if (url.includes('cdn.jsdelivr.net') && !this._retriedRaw) {
        this._retriedRaw = true;
        const rawUrl = url
          .replace('https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/', 'https://raw.githubusercontent.com/BeginnerAman/shayariverse-x/main/')
          .replace('https://cdn.jsdelivr.net/gh/BeginnerAman/shayariverse-x@main/', 'https://raw.githubusercontent.com/BeginnerAman/shayariverse-x/main/');
        console.log('[SVX Audio] CDN edge fallback to direct raw GitHub stream:', rawUrl);
        this.audio.src = rawUrl;
        this.audio.load();
        this.audio.play().catch(() => {});
      }
    };

    try {
      await this.audio.play();
      this.fadeIn();
    } catch (err) {
      console.warn('[SVX Audio] Play request prevented by browser autoplay policy:', err);
      this._isPlaying = false;
      this._notify('playState', { isPlaying: false, track: this.currentTrack });
    }
  }

  pause(immediate = false) {
    if (immediate) {
      clearInterval(this._fadeTimer);
      this.audio.pause();
      return;
    }
    this.fadeOut();
  }

  stop() {
    clearInterval(this._fadeTimer);
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this._isPlaying = false;
    this._clearPlaybackNotification();
    this._notify('playState', { isPlaying: false, track: this.currentTrack });
  }

  async togglePlayPause(url, metadata = {}) {
    if (this.currentTrack && this.currentTrack.url === url) {
      if (this._isPlaying) {
        await this.fadeOut();
      } else {
        await this.audio.play();
        this.fadeIn();
      }
    } else {
      await this.play(url, metadata);
    }
  }

  setVolume(level) {
    this.audio.volume = Math.max(0, Math.min(1, level));
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  isPlaying() {
    return this._isPlaying;
  }

  // --- Dual Viral Music Engine (Phase 4) ---

  /**
   * Tab 1: Loads Curated Viral Reels BGMs from jsDelivr CDN / local JSON
   */
  async loadCuratedBGM() {
    if (this._curatedCache && Array.isArray(this._curatedCache) && this._curatedCache.length > 0) {
      return this._curatedCache;
    }

    const paths = [
      'bgm/preloaded-songs.json',
      `${CONFIG.CDN_BASE}${CONFIG.SONGS_JSON}`
    ];

    if (typeof fetch !== 'undefined') {
      for (const p of paths) {
        try {
          const res = await fetch(p);
          if (res.ok) {
            const data = await res.json();
            if (data && data.categories) {
              this._curatedCache = data.categories;
              const allTracks = this._curatedCache.flatMap(cat => cat.tracks || []);
              if (this.playlist.length === 0) {
                this.setPlaylist(allTracks);
              }
              return this._curatedCache;
            }
          }
        } catch {
          // Continue to next path
        }
      }
    }

    // Hardcoded fallback dataset if network or file fetch fails
    const fallback = [
      {
        id: "slowed-reverb",
        name: "Slowed + Reverb",
        icon: "Disc",
        tracks: [
          {
            id: "sr-001",
            name: "Tum Hi Ho (Slowed + Reverb)",
            artist: "Arijit Singh",
            url: "https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/slowed-reverb-tum-hi-ho.mp3",
            source: "cdn"
          },
          {
            id: "sr-002",
            name: "Faasle (Slowed + Reverb)",
            artist: "Aditya Rikhari",
            url: "https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/faasle-slowed.mp3",
            source: "cdn"
          }
        ]
      },
      {
        id: "sad-flute",
        name: "Sad Flute & Violin",
        icon: "Music",
        tracks: [
          {
            id: "sf-001",
            name: "Raataan Lambiyan (Sad Flute)",
            artist: "Jubin Nautiyal",
            url: "https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/raataan-lambiyan-flute.mp3",
            source: "cdn"
          }
        ]
      },
      {
        id: "lofi-night",
        name: "Late Night Lofi",
        icon: "Disc",
        tracks: [
          {
            id: "ln-001",
            name: "Kesariya (Lofi Chill)",
            artist: "Pritam & Arijit Singh",
            url: "https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/kesariya-lofi.mp3",
            source: "cdn"
          },
          {
            id: "ln-002",
            name: "Pee Loon (Late Night Lofi)",
            artist: "Mohit Chauhan",
            url: "https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/pee-loon-lofi.mp3",
            source: "cdn"
          }
        ]
      },
      {
        id: "royal-urdu",
        name: "Royal Urdu Vibe",
        icon: "Crown",
        tracks: [
          {
            id: "ru-001",
            name: "Tajdar-e-Haram (Acoustic Sarangi)",
            artist: "Atif Aslam",
            url: "https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/tajdar-e-haram-acoustic.mp3",
            source: "cdn"
          }
        ]
      }
    ];
    this._curatedCache = fallback;
    return fallback;
  }

  /**
   * Tab 2: Live Online Song Search
   * Primary: JioSaavn API | Automatic Fallback: Apple iTunes Search API
   */
  async searchOnlineSongs(query) {
    const trimmed = (query || '').trim();
    if (!trimmed) return [];

    // 1. Primary: JioSaavn Official Engine
    if (typeof fetch !== 'undefined') {
      try {
        const saavnUrl = `${CONFIG.JIOSAAVN_API}?__call=search.getResults&q=${encodeURIComponent(trimmed)}&_format=json&_marker=0&api_version=4&ctx=web6dot0&p=1&n=15`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(saavnUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          const rawResults = json.results || json.data?.results || (Array.isArray(json.data) ? json.data : []);
          if (rawResults.length > 0) {
            const parsed = rawResults.slice(0, 15).map(item => {
              // Extract audio stream (vlink, media_preview_url, or downloadUrl array)
              let audioUrl = item.more_info?.vlink || item.media_preview_url || '';
              if (!audioUrl && Array.isArray(item.downloadUrl) && item.downloadUrl.length > 0) {
                const best = item.downloadUrl.find(d => d.quality === '320kbps' || d.quality === '160kbps') || item.downloadUrl[item.downloadUrl.length - 1];
                audioUrl = best?.url || best?.link || '';
              } else if (!audioUrl && typeof item.downloadUrl === 'string') {
                audioUrl = item.downloadUrl;
              }

              // Extract crisp album art
              let artUrl = null;
              if (typeof item.image === 'string') {
                artUrl = item.image.replace('150x150', '500x500');
              } else if (Array.isArray(item.image) && item.image.length > 0) {
                const bestArt = item.image.find(i => i.quality === '500x500' || i.quality === '150x150') || item.image[item.image.length - 1];
                artUrl = bestArt?.url || bestArt?.link || null;
              }

              // Clean title & artist strings
              const rawTitle = item.title || item.song || item.name || 'Untitled Track';
              const cleanTitle = rawTitle.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/<[^>]+>/g, '').trim();

              let rawArtist = item.primary_artists || item.more_info?.music || item.subtitle || item.artist || 'Unknown Artist';
              if (rawArtist.includes(' - ')) {
                rawArtist = rawArtist.split(' - ')[0];
              }
              const cleanArtist = rawArtist.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/<[^>]+>/g, '').trim();

              return {
                id: item.id ? `saavn-${item.id}` : `saavn-${Math.random().toString(36).substr(2, 6)}`,
                name: cleanTitle,
                artist: cleanArtist,
                url: audioUrl,
                art: artUrl,
                source: 'jiosaavn'
              };
            }).filter(t => Boolean(t.url));

            if (parsed.length > 0) {
              return parsed;
            }
          }
        }
      } catch (err) {
        console.warn('[SVX Audio] JioSaavn search error or timeout, trying iTunes fallback:', err);
      }

      // 2. Fallback: Apple iTunes Search API
      try {
        const itunesUrl = `${CONFIG.ITUNES_API}?term=${encodeURIComponent(trimmed)}&country=${CONFIG.ITUNES_COUNTRY}&media=music&limit=${CONFIG.ITUNES_LIMIT}`;
        const res = await fetch(itunesUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.results && json.results.length > 0) {
            return json.results.map(item => ({
              id: `itunes-${item.trackId}`,
              name: item.trackName,
              artist: item.artistName,
              url: item.previewUrl,
              art: item.artworkUrl100 || item.artworkUrl60 || null,
              source: 'itunes'
            })).filter(t => Boolean(t.url));
          }
        }
      } catch (err) {
        console.warn('[SVX Audio] iTunes search fallback error:', err);
      }
    }

    // 3. Fallback to local curated tracks matching the query
    try {
      const categories = await this.loadCuratedBGM();
      const q = trimmed.toLowerCase();
      const matches = [];
      for (const cat of categories) {
        for (const t of cat.tracks) {
          if (t.name.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) {
            matches.push({ ...t, source: 'cdn' });
          }
        }
      }
      return matches;
    } catch {
      return [];
    }
  }
}

export const audioEngine = new AudioEngine();
