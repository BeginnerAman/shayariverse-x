// ShayariVerse X (SVX) — Smart Shayari Composer
// Auto-Format Couplet Engine, Dynamic Auto-Fit Font Scaling, and Live Glass Preview

import { CONFIG } from './config.js';
import { db } from './db.js';
import { renderIcon } from './ui.js';

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
    this.previewText = document.getElementById('svx-composer-preview-text');
    this.previewSongTitle = document.getElementById('svx-composer-song-title');
    this.previewSongArtist = document.getElementById('svx-composer-song-artist');
    this.previewAudioPill = document.getElementById('svx-composer-audio-pill');
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
    this.attachedSong = {
      name: "Tum Hi Ho (Slowed + Reverb)",
      artist: "Arijit Singh",
      url: "https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/slowed-reverb-tum-hi-ho.mp3",
      source: "cdn"
    };

    this.initEvents();
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
    this.textarea?.focus();
    this.updateLivePreview();
  }

  openForEdit(shayari) {
    this.editingShayariId = shayari.id;
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
    }
    const submitText = this.submitBtn?.querySelector('span');
    if (submitText) submitText.textContent = 'Update';
    this.open();
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
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
    this.attachedSong = song;
    if (this.previewSongTitle) this.previewSongTitle.textContent = song.name;
    if (this.previewSongArtist) this.previewSongArtist.textContent = song.artist;
    if (this.previewAudioPill) {
      this.previewAudioPill.style.display = song.url ? 'flex' : 'none';
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
      this.autoFitBadge.textContent = `${fit.category.toUpperCase()} • ${fit.fontSize}`;
    }

    // Update preview text content (prevent XSS via textContent)
    if (this.previewText) {
      this.previewText.textContent = rawVal.trim() ? rawVal : "Apni Shayari yahan likhein... auto-format aur mood preview live dekhein.";
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
    if (!currentUser) {
      // Default to Founder @aman for immediate testability if no user session
      currentUser = await db.getUserByHandle('aman');
      if (currentUser) {
        db.setCurrentUser(currentUser);
      } else {
        currentUser = {
          id: 'guest-shayar-001',
          handle: 'shayar',
          display_name: 'Shayar',
          is_verified: false,
          is_admin: false
        };
        db.setCurrentUser(currentUser);
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
