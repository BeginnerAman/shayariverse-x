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
    this.currentTrack = null;
    this._isPlaying = false;
    this.listeners = {
      playState: new Set(),
      trackChange: new Set(),
      timeUpdate: new Set(),
      error: new Set()
    };

    this._bindAudioEvents();
    this._bindVisibilityEvents();
  }

  _bindAudioEvents() {
    if (!this.audio.addEventListener) return;
    this.audio.addEventListener('play', () => {
      this._isPlaying = true;
      this._notify('playState', { isPlaying: true, track: this.currentTrack });
    });

    this.audio.addEventListener('pause', () => {
      this._isPlaying = false;
      this._notify('playState', { isPlaying: false, track: this.currentTrack });
    });

    this.audio.addEventListener('ended', () => {
      this._isPlaying = false;
      this._notify('playState', { isPlaying: false, track: this.currentTrack });
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio.duration) {
        this._notify('timeUpdate', {
          currentTime: this.audio.currentTime,
          duration: this.audio.duration,
          progress: (this.audio.currentTime / this.audio.duration) * 100
        });
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
    // Battery & Performance rule: Pause audio when tab/app is minimized
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this._isPlaying) {
          console.log('[SVX Audio] App backgrounded, auto-pausing audio to conserve battery');
          this.pause();
        }
      });
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

  async play(url, metadata = {}) {
    if (!url) {
      console.warn('[SVX Audio] No URL provided to play');
      return;
    }

    // If same track is already loaded and paused, just resume
    if (this.currentTrack && this.currentTrack.url === url) {
      try {
        await this.audio.play();
        return;
      } catch (err) {
        console.warn('[SVX Audio] Resume failed, re-loading track:', err);
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

    this._notify('trackChange', this.currentTrack);

    this.audio.src = url;
    this.audio.load();

    try {
      await this.audio.play();
    } catch (err) {
      console.warn('[SVX Audio] Play request prevented by browser autoplay policy:', err);
      this._isPlaying = false;
      this._notify('playState', { isPlaying: false, track: this.currentTrack });
    }
  }

  pause() {
    this.audio.pause();
  }

  async togglePlayPause(url, metadata = {}) {
    if (this.currentTrack && this.currentTrack.url === url) {
      if (this._isPlaying) {
        this.pause();
      } else {
        await this.audio.play();
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
              return data.categories;
            }
          }
        } catch {
          // Continue to next path
        }
      }
    }

    // Hardcoded fallback dataset if network or file fetch fails
    return [
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
