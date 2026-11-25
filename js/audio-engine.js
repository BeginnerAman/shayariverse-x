// ShayariVerse X (SVX) — Singleton Audio Engine
// Mobile Performance & Battery Rules: Auto-pause on background/minimize, single audio instance

import { CONFIG } from './config.js';

class AudioEngine {
  constructor() {
    const createPlayer = () => {
      return typeof Audio !== 'undefined' ? new Audio() : {
        addEventListener() {},
        play() { return Promise.resolve(); },
        pause() {},
        load() {}
      };
    };

    // Dual-Engine Players for true, zero-gap overlapping crossfade
    this.audioA = createPlayer();
    this.audioB = createPlayer();
    this.audio = this.audioA; // Points to current active player
    this.activePlayerId = 'A'; // 'A' | 'B'

    if (this.audioA) this.audioA.loop = true;
    if (this.audioB) this.audioB.loop = true;

    this.playbackMode = 'loop'; // 'loop' | 'sequential' | 'shuffle'
    this.playlist = [];
    this.currentIndex = -1;
    this.currentTrack = null;
    this._isPlaying = false;
    this._curatedCache = null;
    this._fadeTimer = null;
    this._sleepFadeTimer = null;
    this._crossfadeTimer = null;
    this._isCrossfading = false;
    this._prebufferedTrack = null;
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

    this._bindPlayerEvents(this.audioA, 'A');
    this._bindPlayerEvents(this.audioB, 'B');
    this._bindVisibilityEvents();
  }

  _bindPlayerEvents(player, id) {
    if (!player || !player.addEventListener) return;

    player.addEventListener('play', () => {
      if (this.activePlayerId === id || this._isCrossfading) {
        this._isPlaying = true;
        this._acquireWakeLock();
        this._notify('playState', { isPlaying: true, track: this.currentTrack });
      }
    });

    player.addEventListener('pause', () => {
      // If crossfading between players, do not release wake lock or notify paused
      if (this._isCrossfading) return;
      if (this.activePlayerId === id) {
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
      }
    });

    player.addEventListener('ended', () => {
      if (this.activePlayerId === id && !this._isCrossfading) {
        if (this.playbackMode === 'sequential' || this.playbackMode === 'shuffle') {
          this.playNext({ autoNext: true });
        } else {
          this._isPlaying = false;
          this._releaseWakeLock();
          const nativeMS = this._getNativeMediaSession();
          if (nativeMS) {
            nativeMS.setPlaybackState({ playbackState: 'none' }).catch(() => {});
          }
          this._notify('playState', { isPlaying: false, track: this.currentTrack });
        }
      }
    });

    player.addEventListener('timeupdate', () => {
      if (this.activePlayerId === id && player.duration) {
        this._notify('timeUpdate', {
          currentTime: player.currentTime,
          duration: player.duration,
          progress: (player.currentTime / player.duration) * 100
        });

        // Discover ambient pre-buffering and True Overlapping Crossfade
        const remainingTime = player.duration - player.currentTime;
        const isDiscover = this.currentTrack && (
          this.currentTrack.source === 'discover' || 
          this.currentTrack.source === 'cdn' || 
          this.currentTrack.source === 'jiosaavn' || 
          this.currentTrack.source === 'itunes'
        );

        if (isDiscover && (this.playbackMode === 'sequential' || this.playbackMode === 'shuffle') && !this._isSleepFading) {
          // 1. Pre-buffer incoming track 8 seconds before end (0ms network delay later)
          if (remainingTime <= 8 && !this._prebufferedTrack && !this._isCrossfading) {
            const nextInfo = this._peekNextTrack();
            if (nextInfo && nextInfo.track) {
              this._prebufferedTrack = nextInfo;
              const standbyPlayer = this.activePlayerId === 'A' ? this.audioB : this.audioA;
              standbyPlayer.src = nextInfo.track.url;
              standbyPlayer.preload = 'auto';
              standbyPlayer.load();
              standbyPlayer.volume = 0.05; // 5% whisper floor keeps Android pipeline alive
              console.log('[SVX Audio] Pre-buffered next track for zero-gap crossfade:', nextInfo.track.name);
            }
          }

          // 2. Start True Overlapping Crossfade at 2.2 seconds before end
          if (remainingTime <= 2.2 && remainingTime > 0.1 && !this._isCrossfading) {
            this._startOverlappingCrossfade();
          }
        }

        // Update Android lock screen notification progress bar if supported
        if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
          try {
            navigator.mediaSession.setPositionState({
              duration: player.duration || 0,
              playbackRate: player.playbackRate || 1,
              position: player.currentTime || 0
            });
          } catch {}
        }

        const nativeMS = this._getNativeMediaSession();
        if (nativeMS) {
          nativeMS.setPositionState({
            duration: player.duration || 0,
            playbackRate: player.playbackRate || 1,
            position: player.currentTime || 0
          }).catch(() => {});
        }
      }
    });

    player.addEventListener('error', (e) => {
      if (this.activePlayerId === id) {
        console.warn(`[SVX Audio] Playback error on player ${id}:`, e);
        this._isPlaying = false;
        this._releaseWakeLock();
        const nativeMS = this._getNativeMediaSession();
        if (nativeMS) {
          nativeMS.setPlaybackState({ playbackState: 'none' }).catch(() => {});
        }
        this._notify('playState', { isPlaying: false, track: this.currentTrack });
        this._notify('error', e);
      }
    });
  }

  _bindVisibilityEvents() {
    // Background Playback / Battery rule
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          document.body?.classList.add('svx-screen-off');

          // Check if current track is Discover or Post/Reel
          const isDiscover = this.currentTrack && (
            this.currentTrack.source === 'discover' || 
            this.currentTrack.source === 'cdn' || 
            this.currentTrack.source === 'jiosaavn' || 
            this.currentTrack.source === 'itunes'
          );

          // Reels or Post audio: NEVER play in background!
          if (!isDiscover || !this.backgroundPlaybackEnabled) {
            console.log('[SVX Audio] App backgrounded, auto-pausing non-discover audio:', this.currentTrack?.source);
            this.pause(true);
            return;
          }

          // Discover music: maintain continuous background stream
          console.log('[SVX Audio] App backgrounded, maintaining persistent Discover background playback stream...');
          const activePlayer = this.audio || (this.activePlayerId === 'A' ? this.audioA : this.audioB);
          if (!this._isCrossfading && !this._fadeTimer && !this._isSleepFading && activePlayer) {
            activePlayer.volume = this.DEFAULT_VOLUME || 0.95;
          }
          this._acquireWakeLock();

          // Verify playback continuity: if Android WebView paused activePlayer, immediately resume
          if (this._isPlaying && activePlayer && activePlayer.paused) {
            activePlayer.play().catch(() => {});
          }
        } else {
          document.body?.classList.remove('svx-screen-off');
          const activePlayer = this.audio || (this.activePlayerId === 'A' ? this.audioA : this.audioB);
          if (!this._isCrossfading && !this._fadeTimer && !this._isSleepFading && activePlayer) {
            activePlayer.volume = this.DEFAULT_VOLUME || 0.95;
          }

          // When returning to foreground: restore Discover continuity if paused
          const isDiscover = this.currentTrack && (
            this.currentTrack.source === 'discover' || 
            this.currentTrack.source === 'cdn' || 
            this.currentTrack.source === 'jiosaavn' || 
            this.currentTrack.source === 'itunes'
          );
          if (isDiscover && this._isPlaying && activePlayer && activePlayer.paused && this.backgroundPlaybackEnabled) {
            console.log('[SVX Audio] Restoring Discover audio continuity on foreground return...');
            activePlayer.play().catch(() => {});
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
    if (this.audioA) this.audioA.loop = mode === 'loop';
    if (this.audioB) this.audioB.loop = mode === 'loop';
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

  _peekNextTrack() {
    if (!this.playlist || this.playlist.length === 0) {
      if (this._curatedCache && Array.isArray(this._curatedCache)) {
        const allTracks = this._curatedCache.flatMap(cat => cat.tracks || []);
        if (allTracks.length > 0) {
          this.setPlaylist(allTracks);
        }
      }
    }
    if (!this.playlist || this.playlist.length === 0) return null;
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
    const track = this.playlist[nextIndex];
    if (!track) return null;
    return { track, index: nextIndex };
  }

  /**
   * True Overlapping Dual-Player Studio DJ Crossfade strictly for Discover music
   * Outgoing player fades down (0.95 -> 0.05) while incoming standby player blooms up (0.05 -> 0.95)
   * Both run simultaneously over 2000ms with zero silent gap (0ms dead air)
   */
  async _startOverlappingCrossfade() {
    if (this._isCrossfading || this._isSleepFading) return;
    this._isCrossfading = true;

    let nextInfo = this._prebufferedTrack;
    if (!nextInfo || !nextInfo.track) {
      nextInfo = this._peekNextTrack();
    }
    if (!nextInfo || !nextInfo.track) {
      this._isCrossfading = false;
      return;
    }

    const outgoingId = this.activePlayerId;
    const incomingId = outgoingId === 'A' ? 'B' : 'A';
    const outgoingPlayer = outgoingId === 'A' ? this.audioA : this.audioB;
    const incomingPlayer = incomingId === 'A' ? this.audioA : this.audioB;

    console.log('[SVX Audio] Starting True Dual-Player Overlapping Crossfade to:', nextInfo.track.name);

    if (!incomingPlayer.src || !incomingPlayer.src.includes(nextInfo.track.url)) {
      incomingPlayer.src = nextInfo.track.url;
      incomingPlayer.load();
    }

    incomingPlayer.loop = (this.playbackMode === 'loop');
    incomingPlayer.volume = 0.05; // 5% whisper floor keeps Android decoding pipeline active

    try {
      await incomingPlayer.play();
    } catch (err) {
      console.warn('[SVX Audio] Standby player autoplay error, fallback to sequential:', err);
      this._isCrossfading = false;
      this._prebufferedTrack = null;
      return;
    }

    const durationMs = 2000;
    const startTime = Date.now();
    const maxVolume = this.DEFAULT_VOLUME || 0.95;
    const minFloor = 0.05;

    clearInterval(this._crossfadeTimer);
    this._crossfadeTimer = setInterval(() => {
      try {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, Math.max(0, elapsed / durationMs));

        // Simultaneous volume ramps: zero gap, true overlap
        const outVol = Math.max(minFloor, maxVolume - (maxVolume - minFloor) * progress);
        const inVol = Math.min(maxVolume, minFloor + (maxVolume - minFloor) * progress);

        outgoingPlayer.volume = outVol;
        incomingPlayer.volume = inVol;

        if (progress >= 1) {
          clearInterval(this._crossfadeTimer);
          this._crossfadeTimer = null;

          try {
            outgoingPlayer.pause();
            outgoingPlayer.currentTime = 0;
            outgoingPlayer.volume = maxVolume;
            outgoingPlayer.loop = (this.playbackMode === 'loop');
          } catch {}

          incomingPlayer.volume = maxVolume;

          this.activePlayerId = incomingId;
          this.audio = incomingPlayer;
          this.currentIndex = nextInfo.index;
          this.currentTrack = {
            ...nextInfo.track,
            source: 'discover'
          };
          this._prebufferedTrack = null;
          this._isCrossfading = false;

          this._acquireWakeLock();
          this._updateMediaSession(this.currentTrack);
          this._notify('trackChange', this.currentTrack);
          this._notify('playState', { isPlaying: true, track: this.currentTrack });
          console.log('[SVX Audio] Dual-Player Crossfade complete. Active player is now:', this.activePlayerId);
        }
      } catch (err) {
        clearInterval(this._crossfadeTimer);
        this._crossfadeTimer = null;
        this._isCrossfading = false;
      }
    }, 40);

    setTimeout(() => {
      if (this._isCrossfading && this._crossfadeTimer) {
        clearInterval(this._crossfadeTimer);
        this._crossfadeTimer = null;
        try {
          outgoingPlayer.pause();
          outgoingPlayer.currentTime = 0;
          outgoingPlayer.volume = maxVolume;
        } catch {}
        incomingPlayer.volume = maxVolume;
        this.activePlayerId = incomingId;
        this.audio = incomingPlayer;
        this.currentIndex = nextInfo.index;
        this.currentTrack = {
          ...nextInfo.track,
          source: 'discover'
        };
        this._prebufferedTrack = null;
        this._isCrossfading = false;
        this._acquireWakeLock();
        this._updateMediaSession(this.currentTrack);
        this._notify('trackChange', this.currentTrack);
        this._notify('playState', { isPlaying: true, track: this.currentTrack });
      }
    }, durationMs + 250);
  }

  async playNext(options = {}) {
    if (!this.playlist || this.playlist.length === 0) {
      await this.loadCuratedBGM();
    }
    if (!this.playlist || this.playlist.length === 0) return;
    if (this._isCrossfading) return;

    const nextInfo = this._peekNextTrack();
    if (!nextInfo || !nextInfo.track) return;

    this.currentIndex = nextInfo.index;
    this.play(nextInfo.track.url, { ...nextInfo.track, source: 'discover' }, {
      fadeOutMs: 300,
      fadeInMs: 400
    });
  }

  async playPrevious(options = {}) {
    if (!this.playlist || this.playlist.length === 0) {
      await this.loadCuratedBGM();
    }
    if (!this.playlist || this.playlist.length === 0) return;
    if (this._isCrossfading) return;

    let prevIndex;
    if (this.playbackMode === 'shuffle') {
      prevIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    }

    this.currentIndex = prevIndex;
    const prevTrack = this.playlist[prevIndex];
    if (prevTrack) {
      this.play(prevTrack.url, { ...prevTrack, source: 'discover' }, {
        fadeOutMs: 300,
        fadeInMs: 400
      });
    }
  }

  /**
   * Smoothly fades out audio volume before pausing using wall-clock time
   * @param {number} durationMs - Duration in ms (default 200ms)
   * @returns {Promise<void>}
   */
  async fadeOut(durationMs = 200) {
    const activePlayer = this.audio || (this.activePlayerId === 'A' ? this.audioA : this.audioB);
    if (!this._isPlaying || !activePlayer || !activePlayer.pause) {
      if (activePlayer) {
        try { activePlayer.pause(); } catch {}
        activePlayer.volume = this.DEFAULT_VOLUME || 0.95;
      }
      return;
    }

    clearInterval(this._fadeTimer);
    const startVolume = activePlayer.volume || this.DEFAULT_VOLUME || 0.95;
    const totalDuration = Math.max(40, durationMs);
    const startTime = Date.now();

    return new Promise((resolve) => {
      this._fadeTimer = setInterval(() => {
        try {
          const elapsed = Date.now() - startTime;
          const fraction = Math.min(1, Math.max(0, elapsed / totalDuration));
          const nextVol = Math.max(0, startVolume * (1 - fraction));

          if (activePlayer && fraction < 1 && nextVol > 0.02) {
            activePlayer.volume = nextVol;
          } else {
            clearInterval(this._fadeTimer);
            this._fadeTimer = null;
            if (activePlayer) {
              activePlayer.volume = 0;
              try { activePlayer.pause(); } catch {}
              activePlayer.volume = this.DEFAULT_VOLUME || 0.95;
            }
            resolve();
          }
        } catch {
          clearInterval(this._fadeTimer);
          this._fadeTimer = null;
          if (activePlayer) {
            try { activePlayer.pause(); } catch {}
            activePlayer.volume = this.DEFAULT_VOLUME || 0.95;
          }
          resolve();
        }
      }, 40);

      setTimeout(() => {
        if (this._fadeTimer) {
          clearInterval(this._fadeTimer);
          this._fadeTimer = null;
          if (activePlayer) {
            try { activePlayer.pause(); } catch {}
            activePlayer.volume = this.DEFAULT_VOLUME || 0.95;
          }
          resolve();
        }
      }, totalDuration + 200);
    });
  }

  /**
   * Smoothly fades in audio volume on start/resume using wall-clock time
   * @param {number} durationMs - Duration in ms (default 220ms)
   */
  fadeIn(durationMs = 220) {
    const activePlayer = this.audio || (this.activePlayerId === 'A' ? this.audioA : this.audioB);
    if (!activePlayer) return;
    clearInterval(this._fadeTimer);
    this._fadeTimer = null;

    const targetVolume = this.DEFAULT_VOLUME || 0.95;
    const minAudibleVolume = 0.05;
    const totalDuration = Math.max(80, durationMs);
    const startTime = Date.now();

    try {
      activePlayer.volume = minAudibleVolume;
    } catch {}

    this._fadeTimer = setInterval(() => {
      try {
        if (!activePlayer || this._isSleepFading) {
          clearInterval(this._fadeTimer);
          this._fadeTimer = null;
          return;
        }

        const elapsed = Date.now() - startTime;
        const fraction = Math.min(1, Math.max(0, elapsed / totalDuration));
        const nextVol = Math.min(targetVolume, minAudibleVolume + (targetVolume - minAudibleVolume) * fraction);

        activePlayer.volume = nextVol;

        if (fraction >= 1 || activePlayer.volume >= targetVolume) {
          activePlayer.volume = targetVolume;
          clearInterval(this._fadeTimer);
          this._fadeTimer = null;
        }
      } catch {
        if (activePlayer) activePlayer.volume = targetVolume;
        clearInterval(this._fadeTimer);
        this._fadeTimer = null;
      }
    }, 40);

    setTimeout(() => {
      if (activePlayer && !this._isSleepFading) {
        if (this._fadeTimer) {
          clearInterval(this._fadeTimer);
          this._fadeTimer = null;
        }
        activePlayer.volume = targetVolume;
      }
    }, totalDuration + 250);
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
    const activePlayer = this.audio || (this.activePlayerId === 'A' ? this.audioA : this.audioB);
    if (activePlayer && this.currentTrack) {
      try {
        this._isSleepFading = false;
        clearInterval(this._fadeTimer);
        this._fadeTimer = null;
        if (this._sleepFadeTimer) {
          clearInterval(this._sleepFadeTimer);
          this._sleepFadeTimer = null;
        }
        const isDiscover = this.currentTrack && (
          this.currentTrack.source === 'discover' || 
          this.currentTrack.source === 'cdn' || 
          this.currentTrack.source === 'jiosaavn' || 
          this.currentTrack.source === 'itunes'
        );
        if (isDiscover) {
          if (this.audioA) this.audioA.loop = (this.playbackMode === 'loop');
          if (this.audioB) this.audioB.loop = (this.playbackMode === 'loop');
        }
        await activePlayer.play();
        this._isPlaying = true;
        this._acquireWakeLock();
        this.fadeIn(isDiscover ? 400 : 200);
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

    const reqId = ++this._playRequestId;

    // Strict boundary: reels and post audio never crossfade and never use dual players
    const isReelOrPost = metadata.source === 'reel' || metadata.source === 'post';
    if (isReelOrPost) {
      this._isCrossfading = false;
      clearInterval(this._crossfadeTimer);
      this._crossfadeTimer = null;
      this._prebufferedTrack = null;

      const standbyPlayer = this.activePlayerId === 'A' ? this.audioB : this.audioA;
      if (standbyPlayer) {
        try { standbyPlayer.pause(); standbyPlayer.currentTime = 0; } catch {}
      }

      this.currentTrack = {
        url,
        name: metadata.name || 'Post Audio',
        artist: metadata.artist || 'ShayariVerse X',
        art: metadata.art || null,
        source: metadata.source
      };

      if (this.audio) {
        this.audio.loop = (metadata.source === 'reel');
        this.audio.volume = this.DEFAULT_VOLUME || 0.95;

        // If same audio URL was already set on player, rewind and play directly without network reload
        if (this.audio.src === url || (this.audio.src && this.audio.src.endsWith(url))) {
          try {
            this.audio.currentTime = 0;
            await this.audio.play();
            this._isPlaying = true;
            this._acquireWakeLock();
            this._notify('trackChange', this.currentTrack);
            this._notify('playState', { isPlaying: true, track: this.currentTrack });
            return;
          } catch (e) {
            // Fall through to re-assign if needed
          }
        }

        try { this.audio.pause(); } catch {}
        this.audio.src = url;
        this.audio.currentTime = 0;
        try {
          await this.audio.play();
          this._isPlaying = true;
          this._acquireWakeLock();
          this._notify('trackChange', this.currentTrack);
          this._notify('playState', { isPlaying: true, track: this.currentTrack });
        } catch (err) {
          this._isPlaying = false;
          this._notify('playState', { isPlaying: false, track: this.currentTrack });
        }
      }
      return;
    }

    // Discover Music
    const isDiscover = true;

    // Enforce playback mode loop setting across both players for non-reel tracks
    if (this.audioA) this.audioA.loop = (this.playbackMode === 'loop');
    if (this.audioB) this.audioB.loop = (this.playbackMode === 'loop');

    // Same track already playing: resume or update
    if (this.currentTrack && this.currentTrack.url === url) {
      const activePlayer = this.audio || (this.activePlayerId === 'A' ? this.audioA : this.audioB);
      if (this._isPlaying && activePlayer && !activePlayer.paused) {
        return;
      }
      try {
        this._isSleepFading = false;
        clearInterval(this._fadeTimer);
        this._fadeTimer = null;
        activePlayer.loop = (this.playbackMode === 'loop');
        await activePlayer.play();
        this._isPlaying = true;
        this._acquireWakeLock();
        this.fadeIn(400);
        return;
      } catch (err) {
        console.warn('[SVX Audio] Resume failed, re-loading track:', err);
      }
    }

    // Zero-gap simultaneous switch if another Discover track is currently playing
    const activePlayer = this.audio || (this.activePlayerId === 'A' ? this.audioA : this.audioB);
    const standbyPlayer = this.activePlayerId === 'A' ? this.audioB : this.audioA;
    const standbyId = this.activePlayerId === 'A' ? 'B' : 'A';

    if (this._isPlaying && activePlayer && !activePlayer.paused && !options.immediate && standbyPlayer) {
      this._isCrossfading = true;
      standbyPlayer.src = url;
      standbyPlayer.loop = (this.playbackMode === 'loop');
      standbyPlayer.volume = 0.05; // 5% whisper floor keeps Android pipeline active

      try {
        await standbyPlayer.play();

        const durationMs = 350; // quick studio DJ crossfade for manual click
        const startTime = Date.now();
        const maxVol = this.DEFAULT_VOLUME || 0.95;
        const minFloor = 0.05;

        clearInterval(this._crossfadeTimer);
        this._crossfadeTimer = setInterval(() => {
          try {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, Math.max(0, elapsed / durationMs));
            const outVol = Math.max(minFloor, maxVol - (maxVol - minFloor) * progress);
            const inVol = Math.min(maxVol, minFloor + (maxVol - minFloor) * progress);

            activePlayer.volume = outVol;
            standbyPlayer.volume = inVol;

            if (progress >= 1) {
              clearInterval(this._crossfadeTimer);
              this._crossfadeTimer = null;
              try {
                activePlayer.pause();
                activePlayer.currentTime = 0;
                activePlayer.volume = maxVol;
                activePlayer.loop = (this.playbackMode === 'loop');
              } catch {}
              standbyPlayer.volume = maxVol;

              this.activePlayerId = standbyId;
              this.audio = standbyPlayer;
              this.currentTrack = {
                url,
                name: metadata.name || 'Unknown Track',
                artist: metadata.artist || 'Unknown Artist',
                art: metadata.art || null,
                source: metadata.source || 'discover'
              };
              if (this.playlist.length > 0) {
                const idx = this.playlist.findIndex(t => t.url === url);
                if (idx !== -1) this.currentIndex = idx;
              }
              this._prebufferedTrack = null;
              this._isCrossfading = false;
              this._acquireWakeLock();
              this._updateMediaSession(this.currentTrack);
              this._notify('trackChange', this.currentTrack);
              this._notify('playState', { isPlaying: true, track: this.currentTrack });
            }
          } catch {
            clearInterval(this._crossfadeTimer);
            this._crossfadeTimer = null;
            this._isCrossfading = false;
          }
        }, 30);
        return;
      } catch (e) {
        // Standby play failed, fall through to activePlayer
        this._isCrossfading = false;
      }
    }

    // Default single-player start
    clearInterval(this._fadeTimer);
    this._fadeTimer = null;
    if (this.audio) {
      try { this.audio.pause(); } catch {}
    }

    this.currentTrack = {
      url,
      name: metadata.name || 'Unknown Track',
      artist: metadata.artist || 'Unknown Artist',
      art: metadata.art || null,
      source: metadata.source || 'discover'
    };

    if (this.playlist.length > 0) {
      const idx = this.playlist.findIndex(t => t.url === url);
      if (idx !== -1) this.currentIndex = idx;
    }

    this.audio.loop = (this.playbackMode === 'loop');
    this.audio.volume = 0.05;
    this.audio.src = url;

    try {
      await this.audio.play();
      this._isPlaying = true;
      this._acquireWakeLock();
      this.fadeIn(400);
      this._updateMediaSession(this.currentTrack);
      this._notify('trackChange', this.currentTrack);
      this._notify('playState', { isPlaying: true, track: this.currentTrack });
    } catch (err) {
      console.warn('[SVX Audio] Play request error:', err);
      this._isPlaying = false;
      this._notify('playState', { isPlaying: false, track: this.currentTrack });
    }
  }

  pause(immediate = false) {
    this._isCrossfading = false;
    clearInterval(this._crossfadeTimer);
    this._crossfadeTimer = null;
    this._prebufferedTrack = null;

    const standbyPlayer = this.activePlayerId === 'A' ? this.audioB : this.audioA;
    if (standbyPlayer) {
      try { standbyPlayer.pause(); standbyPlayer.currentTime = 0; } catch {}
    }

    if (immediate) {
      clearInterval(this._fadeTimer);
      if (this.audio) {
        try { this.audio.pause(); } catch {}
        this.audio.volume = this.DEFAULT_VOLUME || 0.95;
      }
      return;
    }
    const isDiscover = this.currentTrack && (
      this.currentTrack.source === 'discover' || 
      this.currentTrack.source === 'cdn' || 
      this.currentTrack.source === 'jiosaavn' || 
      this.currentTrack.source === 'itunes'
    );
    this.fadeOut(isDiscover ? 300 : 200);
  }

  stop() {
    this._isCrossfading = false;
    clearInterval(this._crossfadeTimer);
    this._crossfadeTimer = null;
    this._prebufferedTrack = null;
    clearInterval(this._fadeTimer);
    this._fadeTimer = null;
    if (this._sleepFadeTimer) {
      clearInterval(this._sleepFadeTimer);
      this._sleepFadeTimer = null;
    }
    this._isSleepFading = false;

    [this.audioA, this.audioB].forEach(p => {
      if (p) {
        try {
          p.pause();
          p.currentTime = 0;
          p.volume = this.DEFAULT_VOLUME || 0.95;
        } catch {}
      }
    });

    this._isPlaying = false;
    this._releaseWakeLock();
    const nativeMS = this._getNativeMediaSession();
    if (nativeMS) {
      nativeMS.setPlaybackState({ playbackState: 'none' }).catch(() => {});
    }
    this._notify('playState', { isPlaying: false, track: this.currentTrack });
  }

  async togglePlayPause(url, metadata = {}, options = {}) {
    if (this.currentTrack && this.currentTrack.url === url) {
      const isDiscover = this.currentTrack && (
        this.currentTrack.source === 'discover' || 
        this.currentTrack.source === 'cdn' || 
        this.currentTrack.source === 'jiosaavn' || 
        this.currentTrack.source === 'itunes'
      );
      if (this._isPlaying) {
        await this.fadeOut(isDiscover ? 300 : 200);
      } else {
        await this.resume();
      }
    } else {
      await this.play(url, metadata, options);
    }
  }

  // --- Audio Sleep Timer Engine (Smart Battery & Gentle Sleep) ---

  /**
   * Sets the audio sleep timer for a specified duration in minutes (clamped between 1m and 720m / 12h).
   * Automatically executes a gentle 6-second soft decay before pausing.
   * @param {number} minutes - Duration in minutes (1 to 720)
   */
  setSleepTimer(minutes) {
    this.clearSleepTimer();
    const parsed = Number(minutes);
    if (!parsed || isNaN(parsed) || parsed <= 0) return;

    // Hard boundary: minimum 1 minute, maximum 720 minutes (12 hours)
    const mins = Math.max(1, Math.min(720, Math.round(parsed)));

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
    const v = Math.max(0, Math.min(1, Number(level) || 0));
    this.DEFAULT_VOLUME = v;
    if (this.audioA) this.audioA.volume = v;
    if (this.audioB) this.audioB.volume = v;
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
      if (!this.playlist || this.playlist.length === 0) {
        const allTracks = this._curatedCache.flatMap(cat => cat.tracks || []);
        if (allTracks.length > 0) {
          this.setPlaylist(allTracks);
        }
      }
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
    if (!this.playlist || this.playlist.length === 0) {
      const allTracks = fallback.flatMap(cat => cat.tracks || []);
      if (allTracks.length > 0) {
        this.setPlaylist(allTracks);
      }
    }
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
