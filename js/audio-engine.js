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
    this._sleepFadeTimer = null;
    this._playRequestId = 0;
    this._mediaSessionWired = false;
    this._nativeMediaActionsWired = false;
    this._wakeLock = null;
    this.DEFAULT_VOLUME = 0.95;

    // Sleep Timer state
    this._sleepTimerDuration = 0; // in minutes
    this._sleepTimerEndTime = 0;  // timestamp ms
    this._sleepTimerInterval = null;
    this._isSleepFading = false;

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
      sleepTimerUpdate: new Set(),
      error: new Set()
    };

    this._bindAudioEvents();
    this._bindVisibilityEvents();
  }

  _bindAudioEvents() {
    if (!this.audio.addEventListener) return;
    this.audio.addEventListener('play', () => {
      this._isPlaying = true;
      this._acquireWakeLock();
      this._updateMediaSession(this.currentTrack);
      this._notify('playState', { isPlaying: true, track: this.currentTrack });
    });

    this.audio.addEventListener('pause', () => {
      this._isPlaying = false;
      this._releaseWakeLock();
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      const nativeMS = this._getNativeMediaSession();
      if (nativeMS) {
        nativeMS.setPlaybackState({ playbackState: 'paused' }).catch(() => {});
      }
      this._notify('playState', { isPlaying: false, track: this.currentTrack });
    });

    this.audio.addEventListener('ended', () => {
      this._isPlaying = false;
      this._notify('playState', { isPlaying: false, track: this.currentTrack });

      if (this.playbackMode === 'sequential' || this.playbackMode === 'shuffle') {
        this.playNext();
      } else {
        this._releaseWakeLock();
        const nativeMS = this._getNativeMediaSession();
        if (nativeMS) {
          nativeMS.setPlaybackState({ playbackState: 'none' }).catch(() => {});
        }
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

        const nativeMS = this._getNativeMediaSession();
        if (nativeMS) {
          nativeMS.setPositionState({
            duration: this.audio.duration || 0,
            playbackRate: this.audio.playbackRate || 1,
            position: this.audio.currentTime || 0
          }).catch(() => {});
        }
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('[SVX Audio] Playback error or network failure:', e);
      this._isPlaying = false;
      this._releaseWakeLock();
      const nativeMS = this._getNativeMediaSession();
      if (nativeMS) {
        nativeMS.setPlaybackState({ playbackState: 'none' }).catch(() => {});
      }
      this._notify('playState', { isPlaying: false, track: this.currentTrack });
      this._notify('error', e);
    });
  }

  _bindVisibilityEvents() {
    // Background Playback / Battery rule
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          document.body?.classList.add('svx-screen-off');
          if (this._isPlaying) {
            if (!this.backgroundPlaybackEnabled) {
              console.log('[SVX Audio] App backgrounded, auto-pausing audio (Background Playback is OFF)');
              this.pause(true);
            } else {
              console.log('[SVX Audio] App backgrounded, maintaining persistent background playback stream...');
              this._acquireWakeLock();
            }
          }
        } else {
          document.body?.classList.remove('svx-screen-off');
          // When returning to foreground: verify playback continuity
          if (this._isPlaying && this.audio && this.audio.paused && this.backgroundPlaybackEnabled) {
            console.log('[SVX Audio] Restoring audio continuity on foreground return...');
            this.audio.play().catch(() => {});
          }
        }
      });
    }
  }

  async _acquireWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        if (!this._wakeLock) {
          this._wakeLock = await navigator.wakeLock.request('screen');
          this._wakeLock.addEventListener('release', () => {
            this._wakeLock = null;
          });
        }
      } catch {}
    }
  }

  _releaseWakeLock() {
    if (this._wakeLock) {
      try {
        this._wakeLock.release();
      } catch {}
      this._wakeLock = null;
    }
  }

  _getNativeMediaSession() {
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.MediaSession) {
      return window.Capacitor.Plugins.MediaSession;
    }
    return null;
  }

  async _updateMediaSession(track) {
    if (!track) return;
    const trackTitle = track.name || 'Shayari BGM';
    const trackArtist = track.artist || 'ShayariVerse X';

    // 1. Browser MediaSession API (Desktop / Web browsers)
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        const artUrl = track.art || 'https://raw.githubusercontent.com/BeginnerAman/shayariverse-x/main/assets/icon.png';
        navigator.mediaSession.metadata = new MediaMetadata({
          title: trackTitle,
          artist: trackArtist,
          album: 'ShayariVerse X',
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
        console.warn('[SVX Audio] Web MediaSession notice:', e);
      }
    }

    // 2. Native Android MediaSession Foreground Service (100% Silent, Continuous Playback)
    const nativeMS = this._getNativeMediaSession();
    if (nativeMS) {
      try {
        await nativeMS.setMetadata({
          title: trackTitle,
          artist: trackArtist,
          album: 'ShayariVerse X',
          artwork: [] // Silent, lightweight, zero main-thread network blocking
        });
        await nativeMS.setPlaybackState({ playbackState: this._isPlaying ? 'playing' : 'paused' });

        if (!this._nativeMediaActionsWired) {
          this._nativeMediaActionsWired = true;

          // 1. Official Capacitor event bus listener (persistent and indestructible)
          if (typeof nativeMS.addListener === 'function') {
            nativeMS.addListener('mediaAction', (data) => {
              this._handleMediaAction(data?.action);
            }).catch(() => {});
            nativeMS.addListener('play', () => this._handleMediaAction('play')).catch(() => {});
            nativeMS.addListener('pause', () => this._handleMediaAction('pause')).catch(() => {});
            nativeMS.addListener('nexttrack', () => this._handleMediaAction('nexttrack')).catch(() => {});
            nativeMS.addListener('previoustrack', () => this._handleMediaAction('previoustrack')).catch(() => {});
            nativeMS.addListener('stop', () => this._handleMediaAction('stop')).catch(() => {});
          }

          // 2. Register setActionHandler for direct callback hooks
          if (typeof nativeMS.setActionHandler === 'function') {
            ['play', 'pause', 'nexttrack', 'previoustrack', 'stop'].forEach(action => {
              nativeMS.setActionHandler({ action }, (data) => {
                this._handleMediaAction(data?.action || action);
              }).catch(() => {});
            });
          }
        }
      } catch (err) {
        console.warn('[SVX Audio] Native MediaSession notice:', err);
      }
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
   * @param {number} durationMs - Duration in ms (default 200ms)
   * @returns {Promise<void>}
   */
  async fadeOut(durationMs = 200) {
    if (!this._isPlaying || !this.audio || !this.audio.pause) {
      if (this.audio) {
        try { this.audio.pause(); } catch {}
      }
      return;
    }

    clearInterval(this._fadeTimer);
    const startVolume = this.audio.volume || this.DEFAULT_VOLUME || 0.95;
    const steps = 10;
    const stepTime = Math.max(10, Math.floor(durationMs / steps));
    const volumeStep = startVolume / steps;

    return new Promise((resolve) => {
      this._fadeTimer = setInterval(() => {
        try {
          if (this.audio && this.audio.volume > volumeStep) {
            this.audio.volume = Math.max(0, this.audio.volume - volumeStep);
          } else {
            clearInterval(this._fadeTimer);
            this._fadeTimer = null;
            if (this.audio) {
              this.audio.volume = 0;
              try { this.audio.pause(); } catch {}
              this.audio.volume = this.DEFAULT_VOLUME || 0.95; // restore base volume
            }
            resolve();
          }
        } catch {
          clearInterval(this._fadeTimer);
          this._fadeTimer = null;
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Smoothly fades in audio volume on start/resume
   * @param {number} durationMs - Duration in ms (default 220ms)
   */
  fadeIn(durationMs = 220) {
    if (!this.audio) return;
    clearInterval(this._fadeTimer);
    const targetVolume = this.DEFAULT_VOLUME || 0.95;
    try {
      this.audio.volume = 0;
    } catch {}
    const steps = 11;
    const stepTime = Math.max(10, Math.floor(durationMs / steps));
    const volumeStep = targetVolume / steps;

    this._fadeTimer = setInterval(() => {
      try {
        if (this.audio && this.audio.volume + volumeStep < targetVolume) {
          this.audio.volume = Math.min(targetVolume, this.audio.volume + volumeStep);
        } else {
          if (this.audio) {
            this.audio.volume = targetVolume;
          }
          clearInterval(this._fadeTimer);
          this._fadeTimer = null;
        }
      } catch {
        clearInterval(this._fadeTimer);
        this._fadeTimer = null;
      }
    }, stepTime);
  }

  _handleMediaAction(action) {
    console.log('[SVX Audio] Remote Media Action received:', action);
    const act = (action || '').toLowerCase();
    if (act === 'play') {
      this.resume();
    } else if (act === 'pause') {
      this.pause(true);
    } else if (act === 'nexttrack' || act === 'next') {
      this.playNext();
    } else if (act === 'previoustrack' || act === 'previous') {
      this.playPrevious();
    } else if (act === 'stop') {
      this.pause(true);
    }
  }

  async resume() {
    if (this.audio && this.currentTrack) {
      try {
        this._isSleepFading = false;
        clearInterval(this._fadeTimer);
        if (this._sleepFadeTimer) {
          clearInterval(this._sleepFadeTimer);
          this._sleepFadeTimer = null;
        }
        await this.audio.play();
        this.fadeIn(200);
      } catch (err) {
        console.warn('[SVX Audio] Resume error:', err);
      }
    }
  }

  async play(url, metadata = {}, options = {}) {
    if (!url) {
      if (this.currentTrack) {
        return this.resume();
      }
      console.warn('[SVX Audio] No URL provided to play');
      return;
    }

    // Reset fallback retry flag for each new play attempt
    this._retriedRaw = false;

    // If same track is already loaded:
    if (this.currentTrack && this.currentTrack.url === url) {
      if (this._isPlaying && this.audio && !this.audio.paused) {
        return; // Continuous playback without stutter
      }
      try {
        this._isSleepFading = false;
        clearInterval(this._fadeTimer);
        if (this._sleepFadeTimer) {
          clearInterval(this._sleepFadeTimer);
          this._sleepFadeTimer = null;
        }
        await this.audio.play();
        const resumeFadeIn = typeof options.fadeInMs === 'number' ? options.fadeInMs : 200;
        this.fadeIn(resumeFadeIn);
        return;
      } catch (err) {
        console.warn('[SVX Audio] Resume failed, re-loading track:', err);
      }
    }

    // Monotonic request counter to prevent race conditions during rapid skipping
    const reqId = ++this._playRequestId;

    const fadeOutDuration = typeof options.fadeOutMs === 'number' ? options.fadeOutMs : 180;
    const fadeInDuration = typeof options.fadeInMs === 'number' ? options.fadeInMs : 220;

    // Smooth micro fade-out of old track if currently playing
    if (this._isPlaying && this.audio && !this.audio.paused && !options.immediate) {
      if (fadeOutDuration > 0) {
        await this.fadeOut(fadeOutDuration);
        if (reqId !== this._playRequestId) return; // Superseded by a newer play request
      } else {
        clearInterval(this._fadeTimer);
        if (this.audio) {
          try { this.audio.pause(); } catch {}
        }
      }
    } else {
      clearInterval(this._fadeTimer);
      if (this.audio) {
        try { this.audio.pause(); } catch {}
      }
    }

    if (this._isSleepFading) {
      this._isSleepFading = false;
      if (this._sleepFadeTimer) {
        clearInterval(this._sleepFadeTimer);
        this._sleepFadeTimer = null;
      }
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
      try {
        this.audio.volume = 0; // Prepare for silky micro fade-in
      } catch {}
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
        this.audio.play().then(() => {
          if (fadeInDuration > 0) {
            this.fadeIn(fadeInDuration);
          } else if (this.audio) {
            this.audio.volume = this.DEFAULT_VOLUME || 0.95;
          }
        }).catch(() => {});
      }
    };

    try {
      await this.audio.play();
      if (fadeInDuration > 0) {
        this.fadeIn(fadeInDuration);
      } else if (this.audio) {
        this.audio.volume = this.DEFAULT_VOLUME || 0.95;
      }
    } catch (err) {
      console.warn('[SVX Audio] Play request prevented by browser autoplay policy:', err);
      this._isPlaying = false;
      this._notify('playState', { isPlaying: false, track: this.currentTrack });
    }
  }

  pause(immediate = false) {
    if (immediate) {
      clearInterval(this._fadeTimer);
      if (this.audio) {
        try { this.audio.pause(); } catch {}
        this.audio.volume = this.DEFAULT_VOLUME || 0.95;
      }
      return;
    }
    this.fadeOut(200);
  }

  stop() {
    clearInterval(this._fadeTimer);
    this._fadeTimer = null;
    if (this._sleepFadeTimer) {
      clearInterval(this._sleepFadeTimer);
      this._sleepFadeTimer = null;
    }
    this._isSleepFading = false;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.volume = this.DEFAULT_VOLUME || 0.95;
    }
    this._isPlaying = false;
    this._releaseWakeLock();
    const nativeMS = this._getNativeMediaSession();
    if (nativeMS) {
      nativeMS.setPlaybackState({ playbackState: 'none' }).catch(() => {});
    }
    this._notify('playState', { isPlaying: false, track: this.currentTrack });
  }

  async togglePlayPause(url, metadata = {}) {
    if (this.currentTrack && this.currentTrack.url === url) {
      if (this._isPlaying) {
        await this.fadeOut(200);
      } else {
        await this.audio.play();
        this.fadeIn(200);
      }
    } else {
      await this.play(url, metadata);
    }
  }

  // --- Audio Sleep Timer Engine (Smart Battery & Gentle Sleep) ---

  /**
   * Sets the audio sleep timer for a specified duration in minutes.
   * Automatically executes a gentle 6-second soft decay before pausing.
   * @param {number} minutes - Duration in minutes (e.g. 15, 30, 45, 60 or custom)
   */
  setSleepTimer(minutes) {
    this.clearSleepTimer();
    const mins = Number(minutes);
    if (!mins || mins <= 0) return;

    this._sleepTimerDuration = mins;
    this._sleepTimerEndTime = Date.now() + Math.round(mins * 60 * 1000);
    this._isSleepFading = false;

    this._tickSleepTimer();

    this._sleepTimerInterval = setInterval(() => {
      this._tickSleepTimer();
    }, 1000);

    console.log(`[SVX Audio] Sleep timer set for ${mins}m with 6s gentle soft decay`);
  }

  _tickSleepTimer() {
    if (!this._sleepTimerEndTime) return;
    const now = Date.now();
    const remainingMs = this._sleepTimerEndTime - now;

    if (remainingMs <= 0) {
      console.log('[SVX Audio] Sleep timer finished. Gracefully pausing playback...');
      this.clearSleepTimer();
      this.pause(true);
      if (this.audio) {
        this.audio.volume = this.DEFAULT_VOLUME || 0.95;
      }
      return;
    }

    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

    // Gentle 6-second soft decay so sleep is never abruptly interrupted
    if (remainingSeconds <= 6 && !this._isSleepFading && this._isPlaying && this.audio) {
      this._isSleepFading = true;
      this._fadeSleepTimer(remainingSeconds * 1000);
    }

    this._notify('sleepTimerUpdate', {
      active: true,
      durationMinutes: this._sleepTimerDuration,
      remainingSeconds,
      remainingText: this._formatSleepRemaining(remainingSeconds)
    });
  }

  _fadeSleepTimer(durationMs) {
    if (this._sleepFadeTimer) {
      clearInterval(this._sleepFadeTimer);
      this._sleepFadeTimer = null;
    }
    if (!this.audio || !this._isPlaying) return;

    const startVolume = this.audio.volume || this.DEFAULT_VOLUME || 0.95;
    const steps = 24; // 24 smooth steps over 6 seconds
    const stepTime = Math.max(40, Math.floor(durationMs / steps));
    const volumeStep = startVolume / steps;

    this._sleepFadeTimer = setInterval(() => {
      try {
        if (this.audio && this.audio.volume > volumeStep) {
          this.audio.volume = Math.max(0, this.audio.volume - volumeStep);
        } else {
          clearInterval(this._sleepFadeTimer);
          this._sleepFadeTimer = null;
          if (this.audio) {
            this.audio.volume = 0;
          }
        }
      } catch {
        clearInterval(this._sleepFadeTimer);
        this._sleepFadeTimer = null;
      }
    }, stepTime);
  }

  _formatSleepRemaining(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  clearSleepTimer() {
    if (this._sleepTimerInterval) {
      clearInterval(this._sleepTimerInterval);
      this._sleepTimerInterval = null;
    }
    if (this._sleepFadeTimer) {
      clearInterval(this._sleepFadeTimer);
      this._sleepFadeTimer = null;
    }
    const hadTimer = this._sleepTimerEndTime > 0;
    this._sleepTimerEndTime = 0;
    this._sleepTimerDuration = 0;
    if (this._isSleepFading && this.audio) {
      try {
        this.audio.volume = this.DEFAULT_VOLUME || 0.95;
      } catch {}
    }
    this._isSleepFading = false;

    if (hadTimer) {
      console.log('[SVX Audio] Sleep timer cleared.');
      this._notify('sleepTimerUpdate', {
        active: false,
        durationMinutes: 0,
        remainingSeconds: 0,
        remainingText: ''
      });
    }
  }

  getSleepTimerState() {
    if (!this._sleepTimerEndTime) {
      return { active: false, durationMinutes: 0, remainingSeconds: 0, remainingText: '' };
    }
    const remainingSeconds = Math.max(0, Math.ceil((this._sleepTimerEndTime - Date.now()) / 1000));
    return {
      active: true,
      durationMinutes: this._sleepTimerDuration,
      remainingSeconds,
      remainingText: this._formatSleepRemaining(remainingSeconds)
    };
  }

  onSleepTimerUpdate(callback) {
    if (typeof callback !== 'function') return () => {};
    this.listeners.sleepTimerUpdate.add(callback);
    callback(this.getSleepTimerState());
    return () => this.listeners.sleepTimerUpdate.delete(callback);
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
