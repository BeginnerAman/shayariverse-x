// ShayariVerse X (SVX) — Smart Shayari Composer
// Auto-Format Couplet Engine, Dynamic Auto-Fit Font Scaling, and Live Glass Preview

import { CONFIG } from './config.js';
import { db } from './db.js';
import { renderIcon } from './ui.js';
import { audioEngine } from './audio-engine.js';

/**
 * 1. Auto-Format Couplet Engine
 * Transforms messy raw input into clean, centered Urdu/Hindi poetic couplets (Sher/Stanzas)
 * @param {string} rawText
 * @returns {string}
 */
export function autoFormat(rawText) {
  if (!rawText || !rawText.trim()) return '';

  // Step 1: Replace forward slashes, pipes, or semicolons used as line dividers with newlines
  let text = rawText
    .replace(/\s*[\/|;]\s*/g, '\n')
    .replace(/\r\n/g, '\n');

  // Step 2: Split by lines, strip excess whitespace per line
  let lines = text
    .split('\n')
    .map(l => l.trim().replace(/\s+/g, ' '))
    .filter(l => l.length > 0);

  // If input was a single long line with commas separating clauses, split on commas after 4+ words
  if (lines.length === 1 && lines[0].includes(',')) {
    const parts = lines[0].split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      lines = parts;
    }
  }

  // Step 3: Capitalize first character of each line
  lines = lines.map(line => {
    return line.charAt(0).toUpperCase() + line.slice(1);
  });

  // Step 4: Group lines into couplets (pairs of 2 lines separated by an empty stanza line)
  const couplets = [];
  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      couplets.push(`${lines[i]}\n${lines[i + 1]}`);
    } else {
      couplets.push(lines[i]);
    }
  }

  return couplets.join('\n\n');
}

/**
 * 2. Dynamic Text Auto-Sizing (Auto-Fit Engine)
 * Scales font size based on line count and character count to ensure the glass card never overflows
 * @param {string} text
 * @returns {{ fontSize: string, fontWeight: number, lineHeight: number, category: string, className: string }}
 */
export function calculateAutoFit(text) {
  if (!text || !text.trim()) {
    return {
      fontSize: CONFIG.AUTO_FIT.SHORT.fontSize,
      fontWeight: CONFIG.AUTO_FIT.SHORT.fontWeight,
      lineHeight: CONFIG.AUTO_FIT.SHORT.lineHeight,
      category: 'short',
      className: 'size-short'
    };
  }

  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const charCount = text.length;

  if (lines.length <= CONFIG.AUTO_FIT.SHORT.maxLines && charCount <= CONFIG.AUTO_FIT.SHORT.maxChars) {
    return {
      fontSize: CONFIG.AUTO_FIT.SHORT.fontSize,
      fontWeight: CONFIG.AUTO_FIT.SHORT.fontWeight,
      lineHeight: CONFIG.AUTO_FIT.SHORT.lineHeight,
      category: 'short',
      className: 'size-short'
    };
  } else if (lines.length <= CONFIG.AUTO_FIT.MEDIUM.maxLines && charCount <= CONFIG.AUTO_FIT.MEDIUM.maxChars) {
    return {
      fontSize: CONFIG.AUTO_FIT.MEDIUM.fontSize,
      fontWeight: CONFIG.AUTO_FIT.MEDIUM.fontWeight,
      lineHeight: CONFIG.AUTO_FIT.MEDIUM.lineHeight,
      category: 'medium',
      className: 'size-medium'
    };
  } else {
    return {
      fontSize: CONFIG.AUTO_FIT.LONG.fontSize,
      fontWeight: CONFIG.AUTO_FIT.LONG.fontWeight,
      lineHeight: CONFIG.AUTO_FIT.LONG.lineHeight,
      category: 'long',
      className: 'size-long'
    };
  }
}

/**
 * 3. Smart Shayari Composer Modal Controller
 */
export class SVXComposerModal {
  constructor(options = {}) {
    this.onPostCreated = options.onPostCreated || null;
    this.onOpenMusicPicker = options.onOpenMusicPicker || null;
    this.modal = document.getElementById('svx-composer-modal');
    this.textarea = document.getElementById('svx-composer-textarea');
    this.previewCard = document.getElementById('svx-composer-preview-card');
    this.previewAvatar = document.getElementById('svx-composer-preview-avatar');
    this.previewName = document.getElementById('svx-composer-preview-name');
    this.previewHandle = document.getElementById('svx-composer-preview-handle');
    this.previewText = document.getElementById('svx-composer-preview-text');
    this.previewSongTitle = document.getElementById('svx-composer-song-title');
    this.previewSongArtist = document.getElementById('svx-composer-song-artist');
    this.previewAudioPill = document.getElementById('svx-composer-audio-pill');
    this.removeBgmBtn = document.getElementById('svx-composer-remove-bgm-btn');
    this.noAudioWrap = document.getElementById('svx-composer-no-audio-wrap');
    this.addBgmBtn = document.getElementById('svx-composer-add-bgm-btn');
    this.charCountEl = document.getElementById('svx-composer-char-count');
    this.autoFitBadge = document.getElementById('svx-composer-autofit-badge');
    this.autoFormatBtn = document.getElementById('svx-composer-autoformat-btn');
    this.closeBtn = document.getElementById('svx-composer-close-btn');
    this.submitBtn = document.getElementById('svx-composer-submit-btn');
    this.changeBgmBtn = document.getElementById('svx-composer-change-bgm-btn');
    this.editingShayariId = null;

    // State
    this.selectedMood = 'purple';
    this.selectedFont = 'nastaliq';
    this.attachedSong = this.getRandomTrack();
    this.setAttachedSong(this.attachedSong);
    this.updateUserIdentity();

    this.initEvents();
  }

  updateUserIdentity() {
    const user = db.getCurrentUser();
    if (user) {
      const name = user.display_name || user.handle || 'Shayar';
      const handle = `@${user.handle || 'shayar'}`;
      let initials = user.avatar_initials;
      if (!initials) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
          initials = (parts[0][0] + parts[1][0]).toUpperCase();
        } else if (name.length >= 2) {
          initials = name.slice(0, 2).toUpperCase();
        } else {
          initials = name.toUpperCase() || 'SV';
        }
      }
      if (this.previewAvatar) this.previewAvatar.textContent = initials;
      if (this.previewName) this.previewName.textContent = name;
      if (this.previewHandle) this.previewHandle.textContent = handle;
    } else {
      if (this.previewAvatar) this.previewAvatar.textContent = 'SV';
      if (this.previewName) this.previewName.textContent = 'Shayar';
      if (this.previewHandle) this.previewHandle.textContent = '@shayar';
    }
  }

  getRandomTrack() {
    if (audioEngine.playlist && audioEngine.playlist.length > 0) {
      const idx = Math.floor(Math.random() * audioEngine.playlist.length);
      return audioEngine.playlist[idx];
    }
    const fallbackTracks = [
      {
        id: "tr-alfaaz",
        name: "Alfaaz",
        artist: "Hamza Malik & Zain Zohaib",
        url: "https://raw.githubusercontent.com/BeginnerAman/shayariverse-x/main/bgm/tracks/alfaaz-hamza-malik-zain-zohaib.mp3",
        source: "cdn"
      },
      {
        id: "tr-phir-le-aaya",
        name: "Phir Le Aaya Dil",
        artist: "Arijit Singh",
        url: "https://raw.githubusercontent.com/BeginnerAman/shayariverse-x/main/bgm/tracks/phir-le-aaya-dil.mp3",
        source: "cdn"
      },
      {
        id: "tr-kahani-suno",
        name: "Kahani Suno",
        artist: "Kaifi Khalil",
        url: "https://raw.githubusercontent.com/BeginnerAman/shayariverse-x/main/bgm/tracks/kahani-suno-mujhe-pyaar-hua-tha.mp3",
        source: "cdn"
      },
      {
        id: "tr-afreen",
        name: "Afreen Afreen (Slowed)",
        artist: "Rahat Fateh Ali Khan & Momina",
        url: "https://raw.githubusercontent.com/BeginnerAman/shayariverse-x/main/bgm/tracks/afreen-afreen-slowed.mp3",
        source: "cdn"
      },
      {
        id: "tr-rabba",
        name: "Rabba Lakh Lakh Shukar Manaawa",
        artist: "Nusrat Fateh Ali Khan",
        url: "https://raw.githubusercontent.com/BeginnerAman/shayariverse-x/main/bgm/tracks/rabba-lakh-lakh-shukar-manaawa-nfak.mp3",
        source: "cdn"
      }
    ];
    return fallbackTracks[Math.floor(Math.random() * fallbackTracks.length)];
  }

  initEvents() {
    if (!this.modal) return;

    // Close button
    this.closeBtn?.addEventListener('click', () => this.close());

    // Change BGM button
    this.changeBgmBtn?.addEventListener('click', () => {
      this.close();
      if (this.onOpenMusicPicker) {
        this.onOpenMusicPicker();
      }
    });

    // Tap on preview audio pill to Play / Pause preview song
    this.previewAudioPill?.addEventListener('click', (e) => {
      if (e.target.closest('#svx-composer-remove-bgm-btn')) return;
      if (this.attachedSong && this.attachedSong.url) {
        audioEngine.togglePlayPause(this.attachedSong.url, this.attachedSong);
      }
    });

    // Remove BGM button
    this.removeBgmBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (audioEngine.isPlaying && this.attachedSong && audioEngine.currentTrack?.url === this.attachedSong.url) {
        audioEngine.pause();
      }
      this.setAttachedSong(null);
    });

    // Re-add BGM button inside placeholder
    this.addBgmBtn?.addEventListener('click', () => {
      this.close();
      if (this.onOpenMusicPicker) {
        this.onOpenMusicPicker();
      }
    });

    // Live typing listener
    this.textarea?.addEventListener('input', () => {
      this.updateLivePreview();
    });

    // Auto-Format Couplets action
    this.autoFormatBtn?.addEventListener('click', () => {
      if (this.textarea) {
        const formatted = autoFormat(this.textarea.value);
        this.textarea.value = formatted;
        this.updateLivePreview();
      }
    });

    // Mood Theme selector
    const moodButtons = this.modal.querySelectorAll('[data-composer-mood]');
    moodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mood = btn.getAttribute('data-composer-mood');
        if (mood) {
          this.setMoodTheme(mood);
        }
      });
    });

    // Font Style selector
    const fontButtons = this.modal.querySelectorAll('[data-composer-font]');
    fontButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const font = btn.getAttribute('data-composer-font');
        if (font) {
          this.setFontStyle(font);
        }
      });
    });

    // Submit / Post button
    this.submitBtn?.addEventListener('click', () => {
      this.handlePostSubmit();
    });
  }

  open() {
    if (!this.modal) return;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Sync author identity on live card preview
    this.updateUserIdentity();
    // If opening for a fresh post and no song attached yet, pick a random track from catalog
    if (!this.editingShayariId && (!this.attachedSong || !this.attachedSong.url)) {
      this.setAttachedSong(this.getRandomTrack());
    }
    this.textarea?.focus();
    this.updateLivePreview();
  }

  openForEdit(shayari) {
    this.editingShayariId = shayari.id;
    this.updateUserIdentity();
    if (this.textarea) this.textarea.value = shayari.content;
    this.setMoodTheme(shayari.mood_theme || 'purple');
    this.setFontStyle(shayari.font_style || 'nastaliq');
    if (shayari.song_url) {
      this.setAttachedSong({
        name: shayari.song_name,
        artist: shayari.song_artist,
        url: shayari.song_url,
        art: shayari.song_art,
        source: shayari.song_source
      });
    } else {
      this.setAttachedSong(null);
    }
    const submitText = this.submitBtn?.querySelector('span');
    if (submitText) submitText.textContent = 'Update';
    this.open();
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    // Pause audio preview if it was playing
    if (audioEngine.isPlaying && this.attachedSong && audioEngine.currentTrack?.url === this.attachedSong.url) {
      audioEngine.pause();
    }
    this.editingShayariId = null;
    const submitText = this.submitBtn?.querySelector('span');
    if (submitText) submitText.textContent = 'Post';
  }

  setMoodTheme(mood) {
    this.selectedMood = mood;
    const moodButtons = this.modal.querySelectorAll('[data-composer-mood]');
    moodButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-composer-mood') === mood);
    });

    if (this.previewCard) {
      this.previewCard.setAttribute('data-mood', mood);
      this.previewCard.className = `svx-glass-card svx-feed-card mood-${mood}`;
    }
  }

  setFontStyle(font) {
    this.selectedFont = font;
    const fontButtons = this.modal.querySelectorAll('[data-composer-font]');
    fontButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-composer-font') === font);
    });

    if (this.previewText) {
      this.previewText.className = `svx-shayari-text font-${font} ${calculateAutoFit(this.textarea?.value || '').className}`;
    }
  }

  setAttachedSong(song) {
    this.attachedSong = (song && song.url) ? song : null;
    if (!this.attachedSong) {
      if (this.previewAudioPill) {
        this.previewAudioPill.style.display = 'none';
        this.previewAudioPill.removeAttribute('data-song-url');
      }
      if (this.noAudioWrap) {
        this.noAudioWrap.style.display = 'flex';
      }
      return;
    }

    if (this.noAudioWrap) {
      this.noAudioWrap.style.display = 'none';
    }
    if (this.previewSongTitle) this.previewSongTitle.textContent = this.attachedSong.name;
    if (this.previewSongArtist) this.previewSongArtist.textContent = this.attachedSong.artist;
    if (this.previewAudioPill) {
      this.previewAudioPill.style.display = 'flex';
      this.previewAudioPill.setAttribute('data-song-url', this.attachedSong.url);
    }
  }

  updateLivePreview() {
    const rawVal = this.textarea?.value || '';
    const length = rawVal.length;

    // Character counter
    if (this.charCountEl) {
      this.charCountEl.textContent = `${length}/2000`;
    }

    // Auto-Fit Calculation
    const fit = calculateAutoFit(rawVal);
    if (this.autoFitBadge) {
      this.autoFitBadge.textContent = fit.fontSize;
    }

    // Update preview text content (prevent XSS via textContent)
    if (this.previewText) {
      this.previewText.textContent = rawVal.trim() ? rawVal : "Write your Shayari here... preview updates in real-time.";
      this.previewText.className = `svx-shayari-text font-${this.selectedFont} ${fit.className}`;
    }

    // Enable / disable submit button
    if (this.submitBtn) {
      const isValid = rawVal.trim().length >= 5;
      this.submitBtn.disabled = !isValid;
      this.submitBtn.style.opacity = isValid ? '1' : '0.5';
    }
  }

  async handlePostSubmit() {
    const content = this.textarea?.value.trim();
    if (!content || content.length < 5) {
      return;
    }

    const formatted = autoFormat(content);

    // Current user session check
    let currentUser = db.getCurrentUser();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!currentUser || !currentUser.id || !uuidRegex.test(currentUser.id)) {
      if (currentUser?.handle && db.isLiveMode()) {
        try {
          const liveUser = await db.getUserByHandle(currentUser.handle);
          if (liveUser && liveUser.id && uuidRegex.test(liveUser.id)) {
            currentUser = liveUser;
            db.setCurrentUser(liveUser);
          }
        } catch {}
      }
      if (!currentUser || !currentUser.id || !uuidRegex.test(currentUser.id)) {
        // Fall back to Founder @aman for valid cloud UUID
        const founder = await db.getUserByHandle('aman');
        if (founder && founder.id && uuidRegex.test(founder.id)) {
          currentUser = founder;
          db.setCurrentUser(founder);
        }
      }
    }

    try {
      this.submitBtn.disabled = true;

      if (this.editingShayariId) {
        const updated = await db.updateShayari(this.editingShayariId, currentUser.id, {
          content,
          formatted,
          mood_theme: this.selectedMood,
          font_style: this.selectedFont,
          song_name: this.attachedSong?.name || null,
          song_artist: this.attachedSong?.artist || null,
          song_url: this.attachedSong?.url || null,
          song_art: this.attachedSong?.art || null
        });

        console.log('[SVX Composer] Shayari updated:', updated);
        if (this.textarea) this.textarea.value = '';
        this.close();

        if (this.onPostCreated) {
          this.onPostCreated(updated, true);
        }
      } else {
        const newShayari = await db.createShayari({
          content,
          formatted,
          mood_theme: this.selectedMood,
          font_style: this.selectedFont,
          song_name: this.attachedSong?.name || null,
          song_artist: this.attachedSong?.artist || null,
          song_url: this.attachedSong?.url || null,
          song_art: this.attachedSong?.art || null,
          song_source: this.attachedSong?.source || 'cdn'
        });

        console.log('[SVX Composer] New Shayari published:', newShayari);
        if (this.textarea) this.textarea.value = '';
        this.close();

        if (this.onPostCreated) {
          this.onPostCreated(newShayari, false);
        }
      }
    } catch (err) {
      console.error('[SVX Composer] Error saving shayari:', err);
    } finally {
      if (this.submitBtn) this.submitBtn.disabled = false;
    }
  }
}
