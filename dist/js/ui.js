// ShayariVerse X (SVX) — UI System, Feed Cards, Lucide Icons, Dual Music & Auth
// Strict Zero-Emoji Rule: All icons rendered as Lucide SVGs (stroke-width: 1.75px)

import { CONFIG } from './config.js';
import { db, hashPin } from './db.js';
import { audioEngine } from './audio-engine.js';
import { SVXComposerModal } from './composer.js';

/* 1. Lucide SVG Icon Catalog */
export const ICONS = {
  Home: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  Plus: `<svg class="svx-icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  Compass: `<svg class="svx-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  User: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  Heart: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  HeartFilled: `<svg class="svx-icon svx-icon-filled" viewBox="0 0 24 24" style="fill: currentColor; stroke: currentColor;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  MessageCircle: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
  Share2: `<svg class="svx-icon" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  Disc: `<svg class="svx-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/></svg>`,
  Music: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  Pencil: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
  Feather: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>`,
  Trash2: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  BadgeCheck: `<svg class="svx-icon svx-verified-badge" viewBox="0 0 24 24"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  Crown: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>`,
  Search: `<svg class="svx-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  Sparkles: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  Volume2: `<svg class="svx-icon" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  VolumeX: `<svg class="svx-icon" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>`,
  ShieldAlert: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  Check: `<svg class="svx-icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  X: `<svg class="svx-icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  ChevronLeft: `<svg class="svx-icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`,
  MoreVertical: `<svg class="svx-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
  Lock: `<svg class="svx-icon" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  AlertTriangle: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  Clock: `<svg class="svx-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  Play: `<svg class="svx-icon" viewBox="0 0 24 24" style="fill: currentColor;"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  Pause: `<svg class="svx-icon" viewBox="0 0 24 24" style="fill: currentColor;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  Send: `<svg class="svx-icon" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`
};

/**
 * Returns a Lucide SVG string with optional custom class or style
 */
export function renderIcon(iconName, extraClass = '') {
  const icon = ICONS[iconName];
  if (!icon) {
    console.warn(`[SVX] Missing icon: ${iconName}`);
    return '';
  }
  if (!extraClass) return icon;
  return icon.replace('class="svx-icon', `class="svx-icon ${extraClass}`);
}

/* 2. Formatters & Helpers */
export function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth}mo ago`;
}

export function getAutoFitClass(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const charCount = text.length;

  if (lines.length <= CONFIG.AUTO_FIT.SHORT.maxLines && charCount <= CONFIG.AUTO_FIT.SHORT.maxChars) {
    return 'size-short';
  } else if (lines.length <= CONFIG.AUTO_FIT.MEDIUM.maxLines && charCount <= CONFIG.AUTO_FIT.MEDIUM.maxChars) {
    return 'size-medium';
  } else {
    return 'size-long';
  }
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function showToast(message, iconName = 'Sparkles', duration = 3000) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('svx-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'svx-toast';
  toast.innerHTML = `${renderIcon(iconName, 'svx-icon-sm')}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.9)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Global reference for auth modal trigger in standalone helper functions
let globalAuthModal = null;

/* 3. Feed Card Renderer Engine */
export function createFeedCardElement(shayari) {
  const card = document.createElement('article');
  card.className = `svx-glass-card svx-feed-card mood-${shayari.mood_theme || 'purple'}`;
  card.setAttribute('data-mood', shayari.mood_theme || 'purple');
  card.setAttribute('data-shayari-id', shayari.id);

  const authorInitials = (shayari.author_name || 'U').slice(0, 2);
  const fontClass = `font-${shayari.font_style || 'nastaliq'}`;
  const sizeClass = getAutoFitClass(shayari.content);
  const isPlayingCurrent = audioEngine.isPlaying() && audioEngine.getCurrentTrack()?.url === shayari.song_url;

  // Header HTML & Founder Verified Badge
  const verifiedBadgeHTML = shayari.is_verified ? renderIcon('BadgeCheck') : '';

  // Equalizer HTML
  const eqPausedClass = isPlayingCurrent ? '' : 'paused';

  // Owner Controls & Admin God-Mode Check
  const currentUser = db.getCurrentUser();
  const isOwner = currentUser && currentUser.id === shayari.user_id;
  const isGodMode = typeof localStorage !== 'undefined' && localStorage.getItem('svx_admin_god_mode') === 'true';
  const isAdmin = currentUser && (currentUser.is_admin || isGodMode);

  let ownerControlsHTML = '';
  if (isOwner || isAdmin) {
    ownerControlsHTML = `
      <div class="svx-card-owner-actions">
        ${isOwner ? `
          <button class="svx-btn-card-ctrl edit-btn" data-action="edit-shayari" aria-label="Edit Shayari">
            ${renderIcon('Pencil', 'svx-icon-sm')}
          </button>
        ` : ''}
        ${(isOwner || isAdmin) ? `
          <button class="svx-btn-card-ctrl delete-btn" data-action="delete-shayari" aria-label="Delete Shayari">
            ${renderIcon('Trash2', 'svx-icon-sm')}
          </button>
        ` : ''}
      </div>
    `;
  }

  card.innerHTML = `
    <header class="svx-card-header">
      <div class="svx-author-group" data-action="view-profile" data-handle="${shayari.author_handle}">
        <div class="svx-author-avatar" aria-hidden="true">${authorInitials}</div>
        <div class="svx-author-meta">
          <div class="svx-author-name-row">
            <span class="svx-author-name">${shayari.author_name}</span>
            ${verifiedBadgeHTML}
          </div>
          <span class="svx-author-handle">@${shayari.author_handle}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        ${ownerControlsHTML}
        <div class="svx-card-time">
          ${renderIcon('Clock', 'svx-icon-sm')}
          <span>${formatTimeAgo(shayari.created_at)}</span>
        </div>
      </div>
    </header>

    <div class="svx-card-body">
      <div class="svx-quote-mark svx-quote-open">&ldquo;</div>
      <div class="svx-shayari-text ${fontClass} ${sizeClass}"></div>
      <div class="svx-quote-mark svx-quote-close">&rdquo;</div>
    </div>

    ${shayari.song_url ? `
      <div class="svx-audio-pill" data-song-url="${shayari.song_url}">
        <div class="svx-album-art ${isPlayingCurrent ? 'playing' : ''}" aria-hidden="true">
          ${renderIcon('Disc')}
        </div>
        <div class="svx-audio-info">
          <span class="svx-song-title">${shayari.song_name || 'Shayari BGM'}</span>
          <span class="svx-song-artist">${shayari.song_artist || 'Viral Audio'}</span>
        </div>
        <div class="svx-equalizer ${eqPausedClass}" aria-hidden="true">
          <div class="svx-eq-bar"></div>
          <div class="svx-eq-bar"></div>
          <div class="svx-eq-bar"></div>
          <div class="svx-eq-bar"></div>
          <div class="svx-eq-bar"></div>
        </div>
        <button class="svx-audio-toggle-btn" data-action="toggle-audio" aria-label="Play or Pause BGM">
          ${renderIcon(isPlayingCurrent ? 'Pause' : 'Play', 'svx-icon-sm')}
        </button>
      </div>
    ` : ''}

    <footer class="svx-card-actions">
      <button class="svx-action-btn ${shayari.has_liked ? 'liked' : ''}" data-action="like" aria-label="Like Shayari">
        ${renderIcon(shayari.has_liked ? 'HeartFilled' : 'Heart')}
        <span class="svx-like-count">${shayari.likes_count || 0}</span>
      </button>

      <button class="svx-action-btn" data-action="comment" aria-label="Comments">
        ${renderIcon('MessageCircle')}
        <span class="svx-comment-count">${shayari.comments_count || 0}</span>
      </button>

      <button class="svx-action-btn" data-action="share" aria-label="Share as Image">
        ${renderIcon('Share2')}
      </button>
    </footer>
  `;

  // Safely inject user-generated text via textContent to prevent XSS
  const textContainer = card.querySelector('.svx-shayari-text');
  if (textContainer) {
    textContainer.textContent = shayari.formatted || shayari.content;
  }

  // Double-tap heart burst handler
  let lastTap = 0;
  card.addEventListener('pointerup', (e) => {
    if (e.target.closest('button') || e.target.closest('.svx-author-group')) return;

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 320 && tapLength > 0) {
      triggerHeartBurst(card, shayari.id);
      e.preventDefault();
    }
    lastTap = currentTime;
  });

  return card;
}

/**
 * Triggers SVG heart burst overlay animation and marks post as liked
 */
export async function triggerHeartBurst(cardElement, shayariId) {
  const overlay = document.createElement('div');
  overlay.className = 'svx-heart-burst-overlay';
  overlay.innerHTML = `<svg class="svx-heart-burst-icon" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
  cardElement.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
  }, 800);

  const likeBtn = cardElement.querySelector('[data-action="like"]');
  const countSpan = likeBtn?.querySelector('.svx-like-count');

  const executeLike = async (user) => {
    try {
      const result = await db.toggleLike(user.id, shayariId);
      if (likeBtn && countSpan) {
        likeBtn.classList.toggle('liked', result.liked);
        likeBtn.innerHTML = `${renderIcon(result.liked ? 'HeartFilled' : 'Heart')}<span class="svx-like-count">${result.newCount}</span>`;
      }
    } catch (err) {
      console.error('[SVX] Like error:', err);
    }
  };

  if (globalAuthModal) {
    globalAuthModal.requireAuth(executeLike);
  } else {
    let currentUser = db.getCurrentUser();
    if (!currentUser) {
      currentUser = { id: 'guest-user', handle: 'guest', display_name: 'Guest Shayar' };
      db.setCurrentUser(currentUser);
    }
    executeLike(currentUser);
  }
}

/* 4. Feed Controller */
export class SVXFeedController {
  constructor(containerElement, composerModal = null, authModal = null, commentModal = null, shareEngine = null, profileController = null, getRouter = null) {
    this.container = containerElement;
    this.composerModal = composerModal;
    this.authModal = authModal;
    this.commentModal = commentModal;
    this.shareEngine = shareEngine;
    this.profileController = profileController;
    this.getRouter = getRouter;
    this.page = 1;
    this.loading = false;
    this.intersectionObserver = null;
    this.setupIntersectionObserver();
    this.setupAudioSync();
  }

  setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('offscreen', !entry.isIntersecting);
      });
    }, { rootMargin: '150px' });
  }

  setupAudioSync() {
    audioEngine.onPlayStateChange(({ isPlaying, track }) => {
      document.querySelectorAll('.svx-audio-pill').forEach(pill => {
        const pillUrl = pill.getAttribute('data-song-url');
        const isThisTrack = track && track.url === pillUrl;
        const art = pill.querySelector('.svx-album-art');
        const eq = pill.querySelector('.svx-equalizer');
        const btn = pill.querySelector('.svx-audio-toggle-btn');

        if (isThisTrack && isPlaying) {
          art?.classList.add('playing');
          eq?.classList.remove('paused');
          if (btn) btn.innerHTML = renderIcon('Pause', 'svx-icon-sm');
        } else {
          art?.classList.remove('playing');
          eq?.classList.add('paused');
          if (btn) btn.innerHTML = renderIcon('Play', 'svx-icon-sm');
        }
      });
    });
  }

  async loadFeed() {
    if (this.loading) return;
    this.loading = true;

    try {
      const shayaris = await db.getFeed(this.page, CONFIG.FEED_PAGE_SIZE);
      this.container.innerHTML = '';

      const listWrapper = document.createElement('div');
      listWrapper.className = 'svx-feed-list';

      shayaris.forEach(s => {
        const card = createFeedCardElement(s);
        listWrapper.appendChild(card);
        this.intersectionObserver?.observe(card);
      });

      this.container.appendChild(listWrapper);
      this.bindCardEvents(listWrapper);
      console.log(`[SVX] Loaded ${shayaris.length} cards into feed`);
    } catch (err) {
      console.error('[SVX] Failed to load feed:', err);
    } finally {
      this.loading = false;
    }
  }

  prependCard(shayari) {
    let listWrapper = this.container.querySelector('.svx-feed-list');
    if (!listWrapper) {
      this.container.innerHTML = '';
      listWrapper = document.createElement('div');
      listWrapper.className = 'svx-feed-list';
      this.container.appendChild(listWrapper);
      this.bindCardEvents(listWrapper);
    }

    const card = createFeedCardElement(shayari);
    listWrapper.insertBefore(card, listWrapper.firstChild);
    this.intersectionObserver?.observe(card);
    card.style.animation = 'svx-fade-in 0.4s ease-out';
  }

  bindCardEvents(listWrapper) {
    listWrapper.addEventListener('click', async (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.getAttribute('data-action');
      const card = target.closest('.svx-feed-card');
      const shayariId = card?.getAttribute('data-shayari-id');

      if (action === 'toggle-audio') {
        const pill = target.closest('.svx-audio-pill');
        const songUrl = pill?.getAttribute('data-song-url');
        const songTitle = pill?.querySelector('.svx-song-title')?.textContent;
        const songArtist = pill?.querySelector('.svx-song-artist')?.textContent;

        if (songUrl) {
          audioEngine.togglePlayPause(songUrl, { name: songTitle, artist: songArtist });
        }
      } else if (action === 'like' && shayariId) {
        const handleLike = async (user) => {
          const result = await db.toggleLike(user.id, shayariId);
          target.classList.toggle('liked', result.liked);
          target.innerHTML = `${renderIcon(result.liked ? 'HeartFilled' : 'Heart')}<span class="svx-like-count">${result.newCount}</span>`;
        };

        if (this.authModal) {
          this.authModal.requireAuth(handleLike);
        } else {
          let currentUser = db.getCurrentUser() || { id: 'guest-user', handle: 'guest', display_name: 'Guest Shayar' };
          handleLike(currentUser);
        }
      } else if (action === 'comment' && shayariId) {
        if (this.commentModal) {
          this.commentModal.open(shayariId);
        }
      } else if (action === 'edit-shayari' && shayariId) {
        if (this.composerModal) {
          const shayaris = await db.getFeed(1, 100);
          const targetShayari = shayaris.find(s => s.id === shayariId);
          if (targetShayari) {
            this.composerModal.openForEdit(targetShayari);
          }
        }
      } else if (action === 'delete-shayari' && shayariId) {
        const currentUser = db.getCurrentUser();
        const isGodMode = typeof localStorage !== 'undefined' && localStorage.getItem('svx_admin_god_mode') === 'true';
        const isAdmin = currentUser && (currentUser.is_admin || isGodMode);

        if (confirm("Are you sure you want to delete this Shayari post?")) {
          await db.deleteShayari(shayariId, currentUser?.id || '', isAdmin);
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.92)';
          setTimeout(() => card.remove(), 300);
          showToast("Shayari post deleted.", "Trash2");
        }
      } else if (action === 'share' && shayariId) {
        if (this.shareEngine) {
          const shayaris = await db.getFeed(1, 100);
          const targetShayari = shayaris.find(s => s.id === shayariId);
          if (targetShayari) {
            this.shareEngine.shareCard(targetShayari);
          }
        }
      } else if (action === 'view-profile') {
        const handle = target.closest('[data-action="view-profile"]')?.getAttribute('data-handle');
        if (handle && this.getRouter && this.profileController) {
          const router = typeof this.getRouter === 'function' ? this.getRouter() : this.getRouter;
          router?.switchView('profile');
          this.profileController.viewAuthor(handle);
        }
      }
    });
  }
}

/* 5. Dual Music Engine Controller (Phase 4) */
export class SVXMusicController {
  constructor(options = {}) {
    this.onTrackSelected = options.onTrackSelected || null;
    this.activeTab = 'curated';
    this.debounceTimer = null;
    this.tabButtons = document.querySelectorAll('[data-discover-tab]');
    this.searchBar = document.getElementById('svx-music-search-bar');
    this.searchInput = document.getElementById('svx-music-search-input');
    this.searchClear = document.getElementById('svx-music-search-clear');
    this.tracksContainer = document.getElementById('svx-discover-tracks-container');

    this.init();
  }

  init() {
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-discover-tab');
        if (tab) this.switchTab(tab);
      });
    });

    this.searchInput?.addEventListener('input', (e) => {
      const q = e.target.value;
      if (this.searchClear) {
        this.searchClear.style.display = q ? 'flex' : 'none';
      }

      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.performSearch(q);
      }, CONFIG.SEARCH_DEBOUNCE_MS);
    });

    this.searchClear?.addEventListener('click', () => {
      if (this.searchInput) {
        this.searchInput.value = '';
        this.searchClear.style.display = 'none';
        this.performSearch('');
        this.searchInput.focus();
      }
    });

    this.setupAudioSync();
    this.loadCuratedTab();
  }

  setupAudioSync() {
    audioEngine.onPlayStateChange(({ isPlaying, track }) => {
      document.querySelectorAll('.svx-track-card').forEach(card => {
        const cardUrl = card.getAttribute('data-track-url');
        const isThisTrack = track && track.url === cardUrl;
        const art = card.querySelector('.svx-track-thumbnail');
        const playBtn = card.querySelector('[data-action="preview-track"]');

        if (isThisTrack && isPlaying) {
          art?.classList.add('playing');
          if (playBtn) playBtn.innerHTML = renderIcon('Pause', 'svx-icon-sm');
        } else {
          art?.classList.remove('playing');
          if (playBtn) playBtn.innerHTML = renderIcon('Play', 'svx-icon-sm');
        }
      });
    });
  }

  switchTab(tab) {
    this.activeTab = tab;

    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-discover-tab') === tab);
    });

    if (tab === 'curated') {
      if (this.searchBar) this.searchBar.style.display = 'none';
      this.loadCuratedTab();
    } else {
      if (this.searchBar) this.searchBar.style.display = 'flex';
      this.searchInput?.focus();
      const currentQuery = this.searchInput?.value || '';
      if (currentQuery.trim()) {
        this.performSearch(currentQuery);
      } else {
        this.renderSearchPrompt();
      }
    }
  }

  async loadCuratedTab() {
    if (!this.tracksContainer) return;
    this.renderLoadingSkeletons();

    try {
      const categories = await audioEngine.loadCuratedBGM();
      this.tracksContainer.innerHTML = '';

      categories.forEach(cat => {
        const catBlock = document.createElement('div');
        catBlock.className = 'svx-category-block';

        const catHeader = document.createElement('div');
        catHeader.className = 'svx-category-header';
        catHeader.innerHTML = `${renderIcon(cat.icon || 'Disc', 'svx-icon-sm')}<span>${cat.name}</span>`;
        catBlock.appendChild(catHeader);

        const catList = document.createElement('div');
        catList.className = 'svx-track-list';

        cat.tracks.forEach(track => {
          const card = this.createTrackCardElement({ ...track, source: 'cdn' });
          catList.appendChild(card);
        });

        catBlock.appendChild(catList);
        this.tracksContainer.appendChild(catBlock);
      });
    } catch (err) {
      console.error('[SVX Music] Failed to load curated BGM:', err);
    }
  }

  renderSearchPrompt() {
    if (!this.tracksContainer) return;
    this.tracksContainer.innerHTML = `
      <div class="svx-glass-card" style="text-align: center; padding: 32px 16px;">
        <div class="svx-placeholder-icon" style="margin: 0 auto 12px auto;">
          ${renderIcon('Search', 'svx-icon-lg')}
        </div>
        <h3 class="svx-placeholder-title">Live Indian & Bollywood Music Search</h3>
        <p class="svx-placeholder-desc" style="margin: 0 auto;">
          Search Bollywood, Slowed+Reverb, and Lofi tracks via JioSaavn & iTunes without any API keys.
        </p>
      </div>
    `;
  }

  renderLoadingSkeletons() {
    if (!this.tracksContainer) return;
    this.tracksContainer.innerHTML = `
      <div class="svx-skeleton-track"></div>
      <div class="svx-skeleton-track"></div>
      <div class="svx-skeleton-track"></div>
    `;
  }

  async performSearch(query) {
    if (!this.tracksContainer) return;
    const trimmed = query.trim();
    if (!trimmed) {
      this.renderSearchPrompt();
      return;
    }

    this.renderLoadingSkeletons();

    try {
      const results = await audioEngine.searchOnlineSongs(trimmed);
      this.tracksContainer.innerHTML = '';

      if (results.length === 0) {
        this.tracksContainer.innerHTML = `
          <div class="svx-glass-card" style="text-align: center; padding: 32px 16px;">
            <div class="svx-placeholder-icon" style="margin: 0 auto 12px auto;">
              ${renderIcon('VolumeX', 'svx-icon-lg')}
            </div>
            <h3 class="svx-placeholder-title">No Tracks Found</h3>
            <p class="svx-placeholder-desc" style="margin: 0 auto;">
              Try searching with another song title, singer, or keyword.
            </p>
          </div>
        `;
        return;
      }

      const listWrapper = document.createElement('div');
      listWrapper.className = 'svx-track-list';

      results.forEach(track => {
        const card = this.createTrackCardElement(track);
        listWrapper.appendChild(card);
      });

      this.tracksContainer.appendChild(listWrapper);
    } catch (err) {
      console.error('[SVX Music] Search failed:', err);
    }
  }

  createTrackCardElement(track) {
    const card = document.createElement('div');
    card.className = 'svx-track-card';
    card.setAttribute('data-track-url', track.url);

    const isCurrent = audioEngine.isPlaying() && audioEngine.getCurrentTrack()?.url === track.url;
    const sourceClass = (track.source || 'cdn').toLowerCase();
    const sourceLabel = track.source === 'jiosaavn' ? 'JioSaavn' : track.source === 'itunes' ? 'iTunes' : 'Viral BGM';

    card.innerHTML = `
      <div class="svx-track-thumbnail ${isCurrent ? 'playing' : ''}" aria-hidden="true">
        ${track.art ? `<img src="${track.art}" alt="${track.name}" loading="lazy">` : renderIcon('Disc')}
      </div>
      <div class="svx-track-meta">
        <div class="svx-track-title-row">
          <span class="svx-track-title">${track.name}</span>
          <span class="svx-source-badge ${sourceClass}">${sourceLabel}</span>
        </div>
        <span class="svx-track-artist">${track.artist}</span>
      </div>
      <div class="svx-track-actions">
        <button class="svx-btn-track-action" data-action="preview-track" aria-label="Preview track">
          ${renderIcon(isCurrent ? 'Pause' : 'Play', 'svx-icon-sm')}
        </button>
        <button class="svx-btn-track-action select-btn" data-action="select-track" aria-label="Use in Shayari">
          ${renderIcon('Check', 'svx-icon-sm')}
        </button>
      </div>
    `;

    const previewBtn = card.querySelector('[data-action="preview-track"]');
    previewBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      audioEngine.togglePlayPause(track.url, {
        name: track.name,
        artist: track.artist,
        art: track.art,
        source: track.source
      });
    });

    const selectBtn = card.querySelector('[data-action="select-track"]');
    selectBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onTrackSelected) {
        this.onTrackSelected(track);
      }
    });

    return card;
  }
}

/* 6. "Hybrid Magic" 3-Second Shayar ID Auth Modal (Phase 5) */
export class SVXAuthModal {
  constructor(options = {}) {
    this.onAuthSuccess = options.onAuthSuccess || null;
    this.modal = document.getElementById('svx-auth-sheet');
    this.closeBtn = document.getElementById('svx-auth-close-btn');
    this.modalTitle = document.getElementById('svx-auth-modal-title');
    this.modalSub = document.getElementById('svx-auth-modal-sub');
    this.displayNameGroup = document.getElementById('svx-auth-group-name');
    this.displayNameInput = document.getElementById('svx-auth-display-name');
    this.handleInput = document.getElementById('svx-auth-handle');
    this.handleStatus = document.getElementById('svx-handle-status');
    this.handleSuggestions = document.getElementById('svx-handle-suggestions');
    this.pinInput = document.getElementById('svx-auth-pin');
    this.submitBtn = document.getElementById('svx-auth-submit-btn');
    this.submitText = document.getElementById('svx-auth-submit-text');
    this.modeToggle = document.getElementById('svx-auth-mode-toggle');

    this.mode = 'register';
    this.pendingAction = null;
    this.debounceTimer = null;

    this.init();
  }

  init() {
    this.closeBtn?.addEventListener('click', () => this.close());

    this.modeToggle?.addEventListener('click', () => {
      this.switchMode(this.mode === 'register' ? 'login' : 'register');
    });

    this.handleInput?.addEventListener('input', (e) => {
      const handle = e.target.value.toLowerCase().replace(/^@/, '').trim();
      clearTimeout(this.debounceTimer);

      if (!handle || this.mode === 'login') {
        this.clearHandleFeedback();
        return;
      }

      this.debounceTimer = setTimeout(() => {
        this.checkHandleAvailability(handle);
      }, CONFIG.SEARCH_DEBOUNCE_MS);
    });

    const form = document.getElementById('svx-auth-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  switchMode(mode) {
    this.mode = mode;
    this.clearHandleFeedback();

    if (mode === 'login') {
      if (this.displayNameGroup) this.displayNameGroup.style.display = 'none';
      if (this.modalTitle) this.modalTitle.textContent = 'Welcome Back, Shayar';
      if (this.modalSub) this.modalSub.textContent = 'Enter your @handle and 4-digit PIN to login';
      if (this.submitText) this.submitText.textContent = 'Login to ShayariVerse X';
      if (this.modeToggle) this.modeToggle.textContent = 'New Shayar? Create 3-Second Shayar ID';
    } else {
      if (this.displayNameGroup) this.displayNameGroup.style.display = 'flex';
      if (this.modalTitle) this.modalTitle.textContent = '3-Second Shayar ID';
      if (this.modalSub) this.modalSub.textContent = 'Create your poetic identity to post, like & comment';
      if (this.submitText) this.submitText.textContent = 'Create Shayar ID (3 Seconds)';
      if (this.modeToggle) this.modeToggle.textContent = 'Already a Shayar? Enter @handle & PIN to login';
    }
  }

  async checkHandleAvailability(handle) {
    const check = await db.isHandleAvailable(handle);
    if (!this.handleStatus) return;

    if (check.available) {
      this.handleStatus.className = 'svx-handle-feedback valid';
      this.handleStatus.innerHTML = `${renderIcon('Check', 'svx-icon-sm')}<span>Available</span>`;
      if (this.handleSuggestions) {
        this.handleSuggestions.className = 'svx-suggestions-row';
        this.handleSuggestions.innerHTML = '';
      }
    } else {
      this.handleStatus.className = 'svx-handle-feedback invalid';
      this.handleStatus.innerHTML = `${renderIcon('AlertTriangle', 'svx-icon-sm')}<span>${check.reason || 'Unavailable'}</span>`;

      if (this.handleSuggestions && check.suggestions) {
        this.handleSuggestions.className = 'svx-suggestions-row active';
        this.handleSuggestions.innerHTML = `<span>Try:</span>`;
        check.suggestions.forEach(sug => {
          const pill = document.createElement('button');
          pill.type = 'button';
          pill.className = 'svx-suggestion-pill';
          pill.textContent = `@${sug}`;
          pill.addEventListener('click', () => {
            if (this.handleInput) {
              this.handleInput.value = sug;
              this.checkHandleAvailability(sug);
            }
          });
          this.handleSuggestions.appendChild(pill);
        });
      }
    }
  }

  clearHandleFeedback() {
    if (this.handleStatus) {
      this.handleStatus.className = 'svx-handle-feedback';
      this.handleStatus.innerHTML = '';
    }
    if (this.handleSuggestions) {
      this.handleSuggestions.className = 'svx-suggestions-row';
      this.handleSuggestions.innerHTML = '';
    }
  }

  open(prefillHandle = '') {
    if (!this.modal) return;
    this.modal.classList.add('active');
    if (prefillHandle && this.handleInput) {
      this.handleInput.value = prefillHandle;
      this.switchMode('login');
      this.pinInput?.focus();
    } else {
      this.displayNameInput?.focus();
    }
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    this.clearHandleFeedback();
  }

  requireAuth(actionCallback) {
    const user = db.getCurrentUser();
    if (user && user.id && user.handle !== 'guest') {
      actionCallback(user);
    } else {
      this.pendingAction = actionCallback;
      this.open();
    }
  }

  async handleSubmit() {
    const handle = this.handleInput?.value.toLowerCase().replace(/^@/, '').trim();
    const pin = this.pinInput?.value.trim();

    if (!handle) {
      alert("Please enter your @handle.");
      this.handleInput?.focus();
      return;
    }

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      alert("Please enter a valid 4-digit PIN (numbers only).");
      this.pinInput?.focus();
      return;
    }

    const pinHash = await hashPin(pin);

    try {
      this.submitBtn.disabled = true;

      if (this.mode === 'register') {
        const displayName = this.displayNameInput?.value.trim();
        if (!displayName || displayName.length < 2) {
          alert("Display name must be at least 2 characters.");
          this.displayNameInput?.focus();
          return;
        }

        const newUser = await db.createUser(handle, displayName, pinHash);
        console.log('[SVX Auth] User registered successfully:', newUser);
        this.close();
        if (this.onAuthSuccess) this.onAuthSuccess(newUser);

        if (this.pendingAction) {
          const action = this.pendingAction;
          this.pendingAction = null;
          action(newUser);
        }
      } else {
        const user = await db.verifyPin(handle, pinHash);
        if (user) {
          console.log('[SVX Auth] User logged in:', user);
          this.close();
          if (this.onAuthSuccess) this.onAuthSuccess(user);

          if (this.pendingAction) {
            const action = this.pendingAction;
            this.pendingAction = null;
            action(user);
          }
        } else {
          alert("Invalid @handle or 4-digit PIN. Please check and retry.");
          this.pinInput?.focus();
        }
      }
    } catch (err) {
      alert(err.message || "Authentication error.");
    } finally {
      if (this.submitBtn) this.submitBtn.disabled = false;
    }
  }
}

/* 7. Comment Bottom-Sheet Drawer (Phase 6) */
export class SVXCommentModal {
  constructor(options = {}) {
    this.sheet = document.getElementById('svx-comment-sheet');
    this.closeBtn = document.getElementById('svx-comment-close-btn');
    this.backdrop = this.sheet?.querySelector('.svx-sheet-backdrop');
    this.listEl = document.getElementById('svx-comments-list');
    this.countBadge = document.getElementById('svx-comment-count-badge');
    this.form = document.getElementById('svx-comment-form');
    this.input = document.getElementById('svx-comment-input');
    this.sendBtn = document.getElementById('svx-comment-send-btn');
    this.authModal = options.authModal || null;
    this.onCommentChange = options.onCommentChange || null;
    this.currentShayariId = null;

    this.init();
  }

  init() {
    this.closeBtn?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', () => this.close());

    this.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.listEl?.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-action="delete-comment"]');
      if (delBtn) {
        const commentId = delBtn.getAttribute('data-comment-id');
        if (commentId) this.handleDelete(commentId);
      }
    });
  }

  open(shayariId) {
    if (!this.sheet) return;
    this.currentShayariId = shayariId;
    this.sheet.classList.add('open');
    if (this.input) this.input.value = '';
    this.loadComments();
    setTimeout(() => this.input?.focus(), 300);
  }

  close() {
    if (!this.sheet) return;
    this.sheet.classList.remove('open');
    this.currentShayariId = null;
  }

  async loadComments() {
    if (!this.currentShayariId || !this.listEl) return;
    this.listEl.innerHTML = `<div class="svx-skeleton-track" style="height: 56px; margin: 4px 0; border-radius: 8px;"></div>`;

    try {
      const comments = await db.getComments(this.currentShayariId);
      const count = comments.length;
      if (this.countBadge) {
        this.countBadge.textContent = `${count} comment${count === 1 ? '' : 's'}`;
      }

      if (count === 0) {
        this.listEl.innerHTML = `
          <div class="svx-comment-empty-state">
            ${renderIcon('MessageCircle', 'svx-icon-lg')}
            <span>Pehla alfaaz aapka ho sakta hai... Guftagu shuru karein.</span>
          </div>
        `;
        return;
      }

      const currentUser = db.getCurrentUser();
      const isGodMode = typeof localStorage !== 'undefined' && localStorage.getItem('svx_admin_god_mode') === 'true';
      const isAdmin = currentUser && (currentUser.is_admin || isGodMode);

      this.listEl.innerHTML = comments.map(c => {
        const initials = (c.author_name || 'U').slice(0, 2).toUpperCase();
        const isOwner = currentUser && currentUser.id === c.user_id;
        const canDelete = isOwner || isAdmin;
        const verifiedBadge = c.is_verified ? renderIcon('BadgeCheck') : '';

        return `
          <div class="svx-comment-item" data-comment-id="${c.id}">
            <div class="svx-comment-avatar">${initials}</div>
            <div class="svx-comment-content">
              <div class="svx-comment-header">
                <div class="svx-comment-author-info">
                  <span class="svx-comment-author">${escapeHtml(c.author_name)}</span>
                  ${verifiedBadge}
                  <span class="svx-comment-handle">@${c.author_handle}</span>
                </div>
                <div class="svx-comment-meta-right">
                  <span class="svx-comment-time">${formatTimeAgo(c.created_at)}</span>
                  ${canDelete ? `
                    <button class="svx-comment-delete-btn" data-action="delete-comment" data-comment-id="${c.id}" aria-label="Delete Comment">
                      ${renderIcon('Trash2', 'svx-icon-sm')}
                    </button>
                  ` : ''}
                </div>
              </div>
              <div class="svx-comment-text">${escapeHtml(c.content)}</div>
            </div>
          </div>
        `;
      }).join('');

      this.listEl.scrollTop = this.listEl.scrollHeight;
    } catch (err) {
      console.error('[SVX Comments] Load error:', err);
      this.listEl.innerHTML = `<div class="svx-comment-empty-state">Failed to load comments.</div>`;
    }
  }

  async handleSubmit() {
    const text = this.input?.value.trim();
    if (!text || !this.currentShayariId) return;

    const postComment = async (user) => {
      try {
        if (this.sendBtn) this.sendBtn.disabled = true;
        await db.addComment(user.id, this.currentShayariId, text);
        if (this.input) this.input.value = '';
        await this.loadComments();

        // Notify feed
        const comments = await db.getComments(this.currentShayariId);
        this.onCommentChange?.(this.currentShayariId, comments.length);
        showToast("Alfaaz darj ho gaye!", "Check");
      } catch (err) {
        alert(err.message || "Failed to post comment.");
      } finally {
        if (this.sendBtn) this.sendBtn.disabled = false;
      }
    };

    if (this.authModal) {
      this.authModal.requireAuth(postComment);
    } else {
      let user = db.getCurrentUser() || { id: 'guest-user', handle: 'guest', display_name: 'Guest Shayar' };
      postComment(user);
    }
  }

  async handleDelete(commentId) {
    const currentUser = db.getCurrentUser();
    const isGodMode = typeof localStorage !== 'undefined' && localStorage.getItem('svx_admin_god_mode') === 'true';
    const isAdmin = currentUser && (currentUser.is_admin || isGodMode);

    if (confirm("Are you sure you want to delete this comment?")) {
      try {
        await db.deleteComment(commentId, currentUser?.id || '', isAdmin);
        await this.loadComments();
        const comments = await db.getComments(this.currentShayariId);
        this.onCommentChange?.(this.currentShayariId, comments.length);
        showToast("Comment deleted.", "Trash2");
      } catch (err) {
        alert(err.message || "Failed to delete comment.");
      }
    }
  }
}

/* 8. Edit Profile Modal (Phase 6) */
export class SVXEditProfileModal {
  constructor(options = {}) {
    this.modal = document.getElementById('svx-edit-profile-modal');
    this.closeBtn = document.getElementById('svx-edit-profile-close-btn');
    this.saveBtn = document.getElementById('svx-edit-profile-save-btn');
    this.nameInput = document.getElementById('svx-edit-display-name');
    this.bioInput = document.getElementById('svx-edit-bio');
    this.bioCharCount = document.getElementById('svx-bio-char-count');
    this.onSaveSuccess = options.onSaveSuccess || null;
    this.currentUser = null;

    this.init();
  }

  init() {
    this.closeBtn?.addEventListener('click', () => this.close());
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    this.bioInput?.addEventListener('input', () => {
      const len = this.bioInput.value.length;
      if (this.bioCharCount) {
        this.bioCharCount.textContent = `${len}/150`;
      }
    });

    this.saveBtn?.addEventListener('click', () => this.handleSave());
  }

  open(user) {
    if (!this.modal || !user) return;
    this.currentUser = user;
    if (this.nameInput) this.nameInput.value = user.display_name || '';
    if (this.bioInput) {
      this.bioInput.value = user.bio || '';
      if (this.bioCharCount) this.bioCharCount.textContent = `${(user.bio || '').length}/150`;
    }
    this.modal.classList.add('open');
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('open');
    this.currentUser = null;
  }

  async handleSave() {
    if (!this.currentUser) return;
    const name = this.nameInput?.value.trim();
    const bio = this.bioInput?.value.trim();

    if (!name || name.length < 2) {
      alert("Display name must be at least 2 characters.");
      this.nameInput?.focus();
      return;
    }

    if (bio && bio.length > 150) {
      alert("Bio cannot exceed 150 characters.");
      this.bioInput?.focus();
      return;
    }

    try {
      if (this.saveBtn) this.saveBtn.disabled = true;
      const updated = await db.updateUserProfile(this.currentUser.id, {
        displayName: name,
        bio: bio || ''
      });
      showToast("Profile updated successfully!", "Check");
      this.close();
      this.onSaveSuccess?.(updated);
    } catch (err) {
      alert(err.message || "Failed to update profile.");
    } finally {
      if (this.saveBtn) this.saveBtn.disabled = false;
    }
  }
}

/* 9. HD Status Image Share Engine via html2canvas (Phase 6) */
export class SVXShareEngine {
  constructor() {
    this.stage = document.getElementById('svx-share-stage');
    this.cardEl = document.getElementById('svx-share-render-card');
    this.avatarEl = document.getElementById('svx-share-author-avatar');
    this.nameEl = document.getElementById('svx-share-author-name');
    this.badgeEl = document.getElementById('svx-share-verified-badge');
    this.handleEl = document.getElementById('svx-share-author-handle');
    this.textEl = document.getElementById('svx-share-text');
    this.audioPillEl = document.getElementById('svx-share-audio-pill');
    this.songTitleEl = document.getElementById('svx-share-song-title');
    this.songArtistEl = document.getElementById('svx-share-song-artist');
    this.watermarkSongEl = document.getElementById('svx-watermark-song-name');
  }

  async shareCard(shayari) {
    if (!this.cardEl || !shayari) return;

    showToast("Preparing HD Status Card...", "Sparkles");

    // Populate render template
    this.cardEl.className = `svx-share-render-card mood-${shayari.mood_theme || 'purple'}`;
    const initials = (shayari.author_name || 'SV').slice(0, 2).toUpperCase();
    if (this.avatarEl) this.avatarEl.textContent = initials;
    if (this.nameEl) this.nameEl.textContent = shayari.author_name || 'Shayar';
    if (this.handleEl) this.handleEl.textContent = `@${shayari.author_handle || 'shayar'}`;

    if (this.badgeEl) {
      this.badgeEl.innerHTML = shayari.is_verified ? renderIcon('BadgeCheck') : '';
      this.badgeEl.style.display = shayari.is_verified ? 'inline-flex' : 'none';
    }

    if (this.textEl) {
      const sizeClass = getAutoFitClass(shayari.formatted || shayari.content);
      this.textEl.className = `svx-shayari-text font-${shayari.font_style || 'nastaliq'} ${sizeClass}`;
      this.textEl.textContent = shayari.formatted || shayari.content;
    }

    if (shayari.song_url && shayari.song_name) {
      if (this.audioPillEl) this.audioPillEl.style.display = 'flex';
      if (this.songTitleEl) this.songTitleEl.textContent = shayari.song_name;
      if (this.songArtistEl) this.songArtistEl.textContent = shayari.song_artist || 'Viral Audio';
      if (this.watermarkSongEl) this.watermarkSongEl.textContent = shayari.song_name;
    } else {
      if (this.audioPillEl) this.audioPillEl.style.display = 'none';
      if (this.watermarkSongEl) this.watermarkSongEl.textContent = 'Poetic Soul';
    }

    try {
      if (typeof window.html2canvas !== 'function') {
        throw new Error("html2canvas library is not loaded.");
      }

      const canvas = await window.html2canvas(this.cardEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#07070d',
        logging: false
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast("Could not generate image.", "AlertTriangle");
          return;
        }

        const filename = `shayariverse-x-${Date.now()}.png`;
        const file = new File([blob], filename, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'ShayariVerse X',
              text: `"${shayari.formatted || shayari.content}"\n— @${shayari.author_handle} on ShayariVerse X`,
              files: [file]
            });
            showToast("Shared to Status!", "Check");
            return;
          } catch (shareErr) {
            if (shareErr.name === 'AbortError') return;
            console.warn('[SVX Share] Web Share API failed, falling back to download:', shareErr);
          }
        }

        // Direct Download fallback
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast("HD Status Card downloaded!", "Check");
      }, 'image/png');

    } catch (err) {
      console.error('[SVX Share] Export failed:', err);
      // Fallback: share text
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'ShayariVerse X',
            text: `"${shayari.formatted || shayari.content}"\n— @${shayari.author_handle} on ShayariVerse X (${CONFIG.REPO_URL})`
          });
          showToast("Shared as text!", "Check");
        } catch {}
      } else {
        showToast("Export failed. Please retry.", "AlertTriangle");
      }
    }
  }
}

/* 10. Profile Controller & Author Drilldown (Phase 5 & 6) */
export class SVXProfileController {
  constructor(options = {}) {
    this.container = document.getElementById('svx-profile-container');
    this.editProfileModal = options.editProfileModal || null;
    this.commentModal = options.commentModal || null;
    this.shareEngine = options.shareEngine || null;
    this.composerModal = options.composerModal || null;
    this.authModal = options.authModal || null;
    this.onAuthRequested = options.onAuthRequested || null;
    this.onFeedRefresh = options.onFeedRefresh || null;
    this.onBackToFeed = options.onBackToFeed || null;
    this.versionTapCount = 0;
    this.versionTapResetTimer = null;
    this.viewingHandle = null;
  }

  async viewAuthor(handle) {
    this.viewingHandle = handle ? handle.toLowerCase().replace(/^@/, '').trim() : null;
    await this.render();
  }

  async render() {
    if (!this.container) return;
    const currentUser = db.getCurrentUser();
    const isGodMode = typeof localStorage !== 'undefined' && localStorage.getItem('svx_admin_god_mode') === 'true';

    // If viewing another author's profile
    if (this.viewingHandle && (!currentUser || currentUser.handle !== this.viewingHandle)) {
      const author = await db.getUserByHandle(this.viewingHandle);
      if (!author) {
        this.container.innerHTML = `
          <div class="svx-glass-card mood-purple svx-profile-card">
            <p class="svx-placeholder-desc">Author @${this.viewingHandle} not found.</p>
            <button class="svx-btn-back-feed" data-action="back-to-feed">
              ${renderIcon('ChevronLeft', 'svx-icon-sm')}
              <span>Back to Feed</span>
            </button>
          </div>
        `;
        this.bindEvents();
        return;
      }

      const authorShayaris = await db.getShayarisByUser(author.id);
      const totalLikes = authorShayaris.reduce((acc, s) => acc + (s.likes_count || 0), 0);
      const initials = (author.display_name || 'U').slice(0, 2).toUpperCase();

      this.container.innerHTML = `
        <div class="svx-profile-wrapper">
          <button class="svx-btn-back-feed" data-action="back-to-feed" type="button">
            ${renderIcon('ChevronLeft', 'svx-icon-sm')}
            <span>Back to Feed</span>
          </button>

          <div class="svx-glass-card mood-purple svx-profile-card">
            <div class="svx-profile-avatar-lg" aria-hidden="true">${initials}</div>
            
            <div>
              <div class="svx-author-name-row" style="justify-content: center; gap: 6px;">
                <h2 class="svx-author-name" style="font-size: 20px;">${escapeHtml(author.display_name)}</h2>
                ${author.is_verified ? renderIcon('BadgeCheck') : ''}
              </div>
              <span class="svx-author-handle">@${author.handle}</span>
            </div>

            <p class="svx-placeholder-desc" style="margin: 0 auto; font-style: italic;">
              ${escapeHtml(author.bio || "Words meet music in ShayariVerse X.")}
            </p>

            <div class="svx-profile-stats-row">
              <div class="svx-profile-stat-box">
                <span class="svx-stat-num">${authorShayaris.length}</span>
                <span class="svx-stat-label">Shayaris</span>
              </div>
              <div class="svx-profile-stat-box">
                <span class="svx-stat-num">${totalLikes}</span>
                <span class="svx-stat-label">Likes Earned</span>
              </div>
            </div>
          </div>

          <div class="svx-author-feed-header">
            ${renderIcon('Feather', 'svx-icon-sm')}
            <span>Shayaris by @${author.handle}</span>
          </div>

          <div class="svx-author-shayari-list" id="svx-author-cards-container"></div>
        </div>
      `;

      const listContainer = document.getElementById('svx-author-cards-container');
      if (listContainer) {
        if (authorShayaris.length === 0) {
          listContainer.innerHTML = `<div class="svx-placeholder-desc" style="text-align: center; padding: 24px;">No Shayaris posted yet.</div>`;
        } else {
          authorShayaris.forEach(s => {
            const card = createFeedCardElement({
              ...s,
              author_name: author.display_name,
              author_handle: author.handle,
              is_verified: author.is_verified,
              is_admin: author.is_admin
            });
            listContainer.appendChild(card);
          });
          this.bindCardEvents(listContainer);
        }
      }

      this.bindEvents();
      return;
    }

    // Otherwise render Own / Logged-in Profile
    this.viewingHandle = null;

    if (!currentUser || currentUser.handle === 'guest') {
      this.container.innerHTML = `
        <div class="svx-glass-card mood-purple svx-profile-card">
          <div class="svx-profile-avatar-lg" aria-hidden="true">
            ${renderIcon('User', 'svx-icon-lg')}
          </div>
          <h2 class="svx-author-name" style="font-size: 20px;">Guest Shayar</h2>
          <p class="svx-placeholder-desc" style="margin: 0 auto;">
            Create your 3-Second Shayar ID to unlock your author profile, post Shayaris, and collect likes.
          </p>
          <button id="svx-profile-login-btn" class="svx-btn-auth-submit" type="button" style="margin: 8px auto 0 auto; max-width: 280px;">
            ${renderIcon('Sparkles', 'svx-icon-sm')}
            <span>Create Shayar ID (Free)</span>
          </button>
          <div>
            <span id="svx-secret-version-tag" class="svx-version-tag">ShayariVerse X v${CONFIG.VERSION}</span>
          </div>
        </div>
      `;

      const loginBtn = document.getElementById('svx-profile-login-btn');
      loginBtn?.addEventListener('click', () => {
        if (this.onAuthRequested) this.onAuthRequested();
      });

      this.bindVersionSecretTap();
      return;
    }

    // Authenticated user profile
    const userShayaris = await db.getShayarisByUser(currentUser.id);
    const totalLikes = userShayaris.reduce((acc, s) => acc + (s.likes_count || 0), 0);
    const initials = (currentUser.display_name || 'U').slice(0, 2).toUpperCase();

    this.container.innerHTML = `
      <div class="svx-profile-wrapper">
        <div class="svx-glass-card mood-purple svx-profile-card">
          <div class="svx-profile-avatar-lg" aria-hidden="true">${initials}</div>
          
          <div>
            <div class="svx-author-name-row" style="justify-content: center; gap: 6px;">
              <h2 class="svx-author-name" style="font-size: 20px;">${escapeHtml(currentUser.display_name)}</h2>
              ${currentUser.is_verified ? renderIcon('BadgeCheck') : ''}
            </div>
            <span class="svx-author-handle">@${currentUser.handle}</span>
          </div>

          ${isGodMode ? `
            <div>
              <span class="svx-admin-badge">
                ${renderIcon('ShieldAlert', 'svx-icon-sm')}
                ADMIN GOD-MODE ACTIVE
              </span>
            </div>
          ` : ''}

          <p class="svx-placeholder-desc" style="margin: 0 auto; font-style: italic;">
            ${escapeHtml(currentUser.bio || "Words meet music in ShayariVerse X.")}
          </p>

          <div class="svx-profile-actions-row">
            <button class="svx-btn-edit-profile" data-action="edit-profile" type="button">
              ${renderIcon('Pencil', 'svx-icon-sm')}
              <span>Edit Profile</span>
            </button>
          </div>

          <div class="svx-profile-stats-row">
            <div class="svx-profile-stat-box">
              <span class="svx-stat-num">${userShayaris.length}</span>
              <span class="svx-stat-label">Shayaris</span>
            </div>
            <div class="svx-profile-stat-box">
              <span class="svx-stat-num">${totalLikes}</span>
              <span class="svx-stat-label">Likes Earned</span>
            </div>
          </div>

          <button id="svx-profile-logout-btn" class="svx-action-btn" type="button" style="margin: 0 auto; color: var(--svx-error); border: 1px solid rgba(244, 67, 54, 0.3);">
            ${renderIcon('X', 'svx-icon-sm')}
            <span>Log Out</span>
          </button>

          <div>
            <span id="svx-secret-version-tag" class="svx-version-tag">ShayariVerse X v${CONFIG.VERSION}</span>
          </div>
        </div>

        <div class="svx-author-feed-header">
          ${renderIcon('Feather', 'svx-icon-sm')}
          <span>Your Shayaris</span>
        </div>

        <div class="svx-author-shayari-list" id="svx-author-cards-container"></div>
      </div>
    `;

    const listContainer = document.getElementById('svx-author-cards-container');
    if (listContainer) {
      if (userShayaris.length === 0) {
        listContainer.innerHTML = `<div class="svx-placeholder-desc" style="text-align: center; padding: 24px;">You haven't posted any Shayari yet. Tap + Create to compose your first piece.</div>`;
      } else {
        userShayaris.forEach(s => {
          const card = createFeedCardElement({
            ...s,
            author_name: currentUser.display_name,
            author_handle: currentUser.handle,
            is_verified: currentUser.is_verified,
            is_admin: currentUser.is_admin
          });
          listContainer.appendChild(card);
        });
        this.bindCardEvents(listContainer);
      }
    }

    const logoutBtn = document.getElementById('svx-profile-logout-btn');
    logoutBtn?.addEventListener('click', () => {
      db.logout();
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('svx_admin_god_mode');
      }
      this.render();
      if (this.onFeedRefresh) this.onFeedRefresh();
    });

    this.bindEvents();
    this.bindVersionSecretTap();
  }

  bindEvents() {
    this.container.querySelectorAll('[data-action]').forEach(btn => {
      const act = btn.getAttribute('data-action');
      if (act === 'back-to-feed') {
        btn.addEventListener('click', () => {
          this.viewingHandle = null;
          if (this.onBackToFeed) this.onBackToFeed();
        });
      } else if (act === 'edit-profile') {
        btn.addEventListener('click', () => {
          const currentUser = db.getCurrentUser();
          if (currentUser && this.editProfileModal) {
            this.editProfileModal.open(currentUser);
          }
        });
      }
    });
  }

  bindCardEvents(listWrapper) {
    listWrapper.addEventListener('click', async (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.getAttribute('data-action');
      const card = target.closest('.svx-feed-card');
      const shayariId = card?.getAttribute('data-shayari-id');

      if (action === 'toggle-audio') {
        const pill = target.closest('.svx-audio-pill');
        const songUrl = pill?.getAttribute('data-song-url');
        const songTitle = pill?.querySelector('.svx-song-title')?.textContent;
        const songArtist = pill?.querySelector('.svx-song-artist')?.textContent;
        if (songUrl) {
          audioEngine.togglePlayPause(songUrl, { name: songTitle, artist: songArtist });
        }
      } else if (action === 'like' && shayariId) {
        const handleLike = async (user) => {
          const result = await db.toggleLike(user.id, shayariId);
          target.classList.toggle('liked', result.liked);
          target.innerHTML = `${renderIcon(result.liked ? 'HeartFilled' : 'Heart')}<span class="svx-like-count">${result.newCount}</span>`;
        };
        if (this.authModal) {
          this.authModal.requireAuth(handleLike);
        } else {
          let currentUser = db.getCurrentUser() || { id: 'guest-user', handle: 'guest', display_name: 'Guest Shayar' };
          handleLike(currentUser);
        }
      } else if (action === 'comment' && shayariId) {
        this.commentModal?.open(shayariId);
      } else if (action === 'share' && shayariId) {
        if (this.shareEngine) {
          const shayaris = await db.getFeed(1, 100);
          const targetShayari = shayaris.find(s => s.id === shayariId);
          if (targetShayari) {
            this.shareEngine.shareCard(targetShayari);
          }
        }
      } else if (action === 'edit-shayari' && shayariId) {
        if (this.composerModal) {
          const shayaris = await db.getFeed(1, 100);
          const targetShayari = shayaris.find(s => s.id === shayariId);
          if (targetShayari) {
            this.composerModal.openForEdit(targetShayari);
          }
        }
      } else if (action === 'delete-shayari' && shayariId) {
        const currentUser = db.getCurrentUser();
        const isGodMode = typeof localStorage !== 'undefined' && localStorage.getItem('svx_admin_god_mode') === 'true';
        const isAdmin = currentUser && (currentUser.is_admin || isGodMode);

        if (confirm("Are you sure you want to delete this Shayari post?")) {
          await db.deleteShayari(shayariId, currentUser?.id || '', isAdmin);
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.92)';
          setTimeout(() => {
            card.remove();
            this.render();
          }, 300);
          showToast("Shayari post deleted.", "Trash2");
        }
      }
    });
  }

  bindVersionSecretTap() {
    const versionEl = document.getElementById('svx-secret-version-tag');
    if (!versionEl) return;

    versionEl.addEventListener('click', () => {
      this.versionTapCount++;
      clearTimeout(this.versionTapResetTimer);

      this.versionTapResetTimer = setTimeout(() => {
        this.versionTapCount = 0;
      }, 2000);

      if (this.versionTapCount >= CONFIG.ADMIN_PASSKEY_TAPS) {
        this.versionTapCount = 0;
        this.triggerAdminGodMode();
      }
    });
  }

  async triggerAdminGodMode() {
    const user = db.getCurrentUser();
    if (!user || user.handle !== CONFIG.FOUNDER_HANDLE) {
      alert("Admin God-Mode is reserved for Founder @aman. Please login as @aman with your secret PIN.");
      if (this.onAuthRequested) {
        this.onAuthRequested(CONFIG.FOUNDER_HANDLE);
      }
      return;
    }

    const currentMode = localStorage.getItem('svx_admin_god_mode') === 'true';
    const newMode = !currentMode;
    localStorage.setItem('svx_admin_god_mode', String(newMode));

    showToast(newMode 
      ? "Admin God-Mode Activated. 1-tap delete unlocked for any Shayari or comment in the feed." 
      : "Admin God-Mode Deactivated.",
      newMode ? "ShieldAlert" : "Check"
    );

    this.render();
    if (this.onFeedRefresh) this.onFeedRefresh();
  }
}

/* 11. SPA View Router */
export class SVXRouter {
  constructor(composerModal = null, authModal = null, profileController = null) {
    this.currentView = 'feed';
    this.composerModal = composerModal;
    this.authModal = authModal;
    this.profileController = profileController;
    this.navItems = document.querySelectorAll('[data-nav-view]');
    this.viewSections = document.querySelectorAll('.svx-view-section');
    this.init();
  }

  init() {
    this.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetView = item.getAttribute('data-nav-view');
        if (targetView) {
          this.switchView(targetView);
        }
      });
    });

    const createBtn = document.getElementById('svx-nav-create-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        if (this.authModal) {
          this.authModal.requireAuth(() => {
            this.composerModal?.open();
          });
        } else if (this.composerModal) {
          this.composerModal.open();
        } else {
          this.switchView('create');
        }
      });
    }
  }

  switchView(viewName) {
    this.currentView = viewName;

    this.navItems.forEach(item => {
      const match = item.getAttribute('data-nav-view') === viewName;
      item.classList.toggle('active', match);
    });

    this.viewSections.forEach(section => {
      const isTarget = section.id === `svx-view-${viewName}`;
      section.classList.toggle('active', isTarget);
    });

    if (viewName === 'profile' && this.profileController) {
      this.profileController.render();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log(`[SVX] Switched to view: ${viewName}`);
  }
}

/* 12. Initialize Shell UI */
export function initUI() {
  console.log(`[SVX] Initializing ${CONFIG.APP_NAME} (${CONFIG.APP_SHORT}) v${CONFIG.VERSION}`);

  // 1. Initialize Auth Modal
  const authModal = new SVXAuthModal({
    onAuthSuccess: () => {
      feedController?.loadFeed();
      profileController?.render();
    }
  });
  globalAuthModal = authModal;

  // 2. Initialize Edit Profile Modal
  const editProfileModal = new SVXEditProfileModal({
    onSaveSuccess: () => {
      profileController?.render();
      feedController?.loadFeed();
    }
  });

  // 3. Initialize Comment Drawer
  const commentModal = new SVXCommentModal({
    authModal,
    onCommentChange: (shayariId, newCount) => {
      document.querySelectorAll(`.svx-feed-card[data-shayari-id="${shayariId}"] .svx-comment-count`).forEach(el => {
        el.textContent = newCount;
      });
    }
  });

  // 4. Initialize HD Share Engine
  const shareEngine = new SVXShareEngine();

  // 5. Initialize Composer Modal
  let router = null;
  const composerModal = new SVXComposerModal({
    onPostCreated: (newShayari, isUpdate) => {
      if (isUpdate) {
        feedController?.loadFeed();
      } else {
        feedController?.prependCard(newShayari);
      }
      router?.switchView('feed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onOpenMusicPicker: () => {
      router?.switchView('discover');
    }
  });

  // 6. Initialize Profile Controller
  let feedController = null;
  const profileController = new SVXProfileController({
    editProfileModal,
    commentModal,
    shareEngine,
    composerModal,
    authModal,
    onAuthRequested: (prefillHandle) => {
      authModal.open(prefillHandle);
    },
    onFeedRefresh: () => {
      feedController?.loadFeed();
    },
    onBackToFeed: () => {
      router?.switchView('feed');
    }
  });

  // 7. Initialize Feed Controller
  const feedContainer = document.getElementById('svx-view-feed');
  if (feedContainer) {
    feedController = new SVXFeedController(
      feedContainer,
      composerModal,
      authModal,
      commentModal,
      shareEngine,
      profileController,
      () => router
    );
    feedController.loadFeed();
  }

  // 8. Initialize Dual Viral Music Controller
  const musicController = new SVXMusicController({
    onTrackSelected: (track) => {
      composerModal.setAttachedSong(track);
      authModal.requireAuth(() => {
        composerModal.open();
      });
    }
  });

  // 9. Initialize Router
  router = new SVXRouter(composerModal, authModal, profileController);

  return {
    router,
    feedController,
    composerModal,
    musicController,
    authModal,
    profileController,
    commentModal,
    editProfileModal,
    shareEngine
  };
}

// Auto-run on DOM ready in browser environment
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
}
