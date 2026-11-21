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
  Send: `<svg class="svx-icon" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  Loader2: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  AlertCircle: `<svg class="svx-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  Repeat: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`,
  Repeat1: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4"/></svg>`,
  Shuffle: `<svg class="svx-icon" viewBox="0 0 24 24"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>`,
  SkipBack: `<svg class="svx-icon" viewBox="0 0 24 24"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>`,
  SkipForward: `<svg class="svx-icon" viewBox="0 0 24 24"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>`
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

  // Single-toast policy: clear any existing toasts immediately to prevent stacking
  container.innerHTML = '';

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
  card._shayari = shayari;
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
  const isFounder = currentUser && currentUser.handle === CONFIG.FOUNDER_HANDLE;
  const isGodMode = typeof localStorage !== 'undefined' && localStorage.getItem('svx_admin_god_mode') === 'true';
  const isAdmin = isFounder && (currentUser.is_admin || isGodMode);

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
      <div class="svx-author-group" data-action="view-profile" data-handle="${escapeHtml(shayari.author_handle)}">
        <div class="svx-author-avatar" aria-hidden="true">${escapeHtml(authorInitials)}</div>
        <div class="svx-author-meta">
          <div class="svx-author-name-row">
            <span class="svx-author-name">${escapeHtml(shayari.author_name)}</span>
            ${verifiedBadgeHTML}
          </div>
          <span class="svx-author-handle">@${escapeHtml(shayari.author_handle)}</span>
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
          <span class="svx-song-title">${escapeHtml(shayari.song_name || 'Shayari BGM')}</span>
          <span class="svx-song-artist">${escapeHtml(shayari.song_artist || 'Viral Audio')}</span>
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

  // Preserve in-memory shayari object for instant 0ms edits
  card._shayari = shayari;

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
 * Global 0ms Like State Synchronizer
 * Synchronizes heart glow and count simultaneously across Feed and Profile tabs
 */
export function syncLikeStateInDOM(shayariId, isLiked, count) {
  if (!shayariId) return;
  const matchingButtons = document.querySelectorAll(`.svx-feed-card[data-shayari-id="${shayariId}"] [data-action="like"]`);
  matchingButtons.forEach(btn => {
    btn.classList.toggle('liked', isLiked);
    btn.innerHTML = `${renderIcon(isLiked ? 'HeartFilled' : 'Heart')}<span class="svx-like-count">${count}</span>`;
  });
}

/**
 * Triggers SVG heart burst overlay animation and marks post as liked
 */
export async function triggerHeartBurst(cardElement, shayariId) {
  const currentUser = db.getCurrentUser();
  const isAuthenticated = currentUser && currentUser.id && currentUser.handle !== 'guest';

  // If user is not authenticated, trigger auth modal without altering like count or heart state
  if (!isAuthenticated) {
    if (globalAuthModal) {
      globalAuthModal.requireAuth(() => {
        triggerHeartBurst(cardElement, shayariId);
      });
    }
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'svx-heart-burst-overlay';
  overlay.innerHTML = `<svg class="svx-heart-burst-icon" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
  cardElement.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
  }, 800);

  const likeBtn = cardElement.querySelector('[data-action="like"]');
  const countSpan = likeBtn?.querySelector('.svx-like-count');
  const wasLiked = likeBtn?.classList.contains('liked');

  // Double-tap should always LIKE (or replay heart burst if already liked), never unlike
  if (wasLiked) {
    return;
  }

  // Optimistic 0ms update for newly liked post
  if (countSpan) {
    const currentCount = parseInt(countSpan.textContent || '0', 10);
    syncLikeStateInDOM(shayariId, true, currentCount + 1);
  }

  try {
    const result = await db.toggleLike(currentUser.id, shayariId);
    if (result && typeof result.newCount === 'number') {
      syncLikeStateInDOM(shayariId, result.liked, result.newCount);
    }
  } catch (err) {
    console.warn('[SVX] Like error:', err);
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
    this.isRefreshing = false;
    this.intersectionObserver = null;
    this.setupIntersectionObserver();
    this.setupAudioSync();
    this.setupPullToRefresh();
  }

  setupPullToRefresh() {
    const ptr = document.getElementById('svx-pull-to-refresh');
    if (!ptr) return;

    const arc = ptr.querySelector('.svx-ptr-arc');
    const arrowHead = ptr.querySelector('.svx-ptr-arrow-head');
    const CIRCUMFERENCE = 51.52; // 2 * Math.PI * 8.2

    let startY = 0;
    let startX = 0;
    let canPullToRefresh = false;
    let isPulling = false;

    // Threshold in pixels of damped displacement required to activate refresh
    const PULL_THRESHOLD = 68; // Requires ~150-160px intentional pull from top
    const DEADBAND = 14;       // Ignore first 14px of touch movement to prevent jitter

    const getScrollTop = () => {
      return window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        (document.scrollingElement ? document.scrollingElement.scrollTop : 0) ||
        0;
    };

    const resetPTR = () => {
      canPullToRefresh = false;
      isPulling = false;
      ptr.classList.remove('svx-ptr-dragging', 'svx-ptr-ready', 'svx-ptr-visible');
      ptr.style.transform = '';
      ptr.style.opacity = '';
      if (arc) {
        arc.style.strokeDashoffset = `${CIRCUMFERENCE}`;
      }
      if (arrowHead) {
        arrowHead.style.transform = 'rotate(0deg)';
        arrowHead.style.opacity = '0';
      }
    };

    window.addEventListener('touchstart', (e) => {
      // 1. Only allow on the active Feed view
      const feedView = document.getElementById('svx-view-feed');
      if (!feedView || !feedView.classList.contains('active')) {
        canPullToRefresh = false;
        return;
      }

      // 2. Do not allow if already refreshing
      if (this.isRefreshing) {
        canPullToRefresh = false;
        return;
      }

      // 3. Do not allow if any modal / overlay / sheet is open
      const hasModal = document.querySelector('.svx-modal-overlay.active, .svx-dialog-overlay.open, .svx-comments-drawer.open, .svx-auth-sheet.open');
      if (hasModal) {
        canPullToRefresh = false;
        return;
      }

      // 4. STRICT RESTING-AT-TOP GUARD:
      // Touch MUST originate when the feed is strictly at scrollTop <= 0.
      // If the user touched the screen when scrolled down (even 1px),
      // pull-to-refresh is DISABLED for the entire duration of this gesture.
      const currentScroll = getScrollTop();
      if (currentScroll > 0) {
        canPullToRefresh = false;
        isPulling = false;
        return;
      }

      if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        canPullToRefresh = true;
        isPulling = false;
      } else {
        canPullToRefresh = false;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!canPullToRefresh || this.isRefreshing) return;
      if (e.touches.length !== 1) {
        resetPTR();
        return;
      }

      // If at any moment during the drag the page scrolls down, abort PTR
      const currentScroll = getScrollTop();
      if (currentScroll > 0) {
        resetPTR();
        return;
      }

      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const diffY = touchY - startY;
      const diffX = Math.abs(touchX - startX);

      // If finger moved UP (diffY <= 0) or gesture is predominantly horizontal (diffX > diffY * 0.75):
      if (diffY <= 0 || diffX > diffY * 0.75) {
        if (isPulling) {
          resetPTR();
        }
        return;
      }

      // Below deadband: ignore tiny accidental finger movements
      if (diffY < DEADBAND) return;

      if (!isPulling) {
        isPulling = true;
        ptr.classList.add('svx-ptr-dragging', 'svx-ptr-visible');
      }

      // Damped rubber-band physics formula
      const pullDelta = diffY - DEADBAND;
      const pullDistance = Math.min(84, pullDelta * 0.44);
      const translateY = -60 + (pullDistance * 1.15);
      const scale = Math.min(1.08, 0.85 + (pullDistance / 84) * 0.2);

      ptr.style.transform = `translate(-50%, ${translateY}px) scale(${scale})`;
      ptr.style.opacity = Math.min(1, pullDistance / 24);

      // REAL-TIME PROGRESSIVE ARC FILL (Instagram Style)
      const progress = Math.min(1, pullDistance / PULL_THRESHOLD);
      const sweepAngle = progress * 280; // Sweeps up to 280 degrees at 100% threshold
      const arcLength = (sweepAngle / 360) * CIRCUMFERENCE;
      const dashoffset = Math.max(0, CIRCUMFERENCE - arcLength);

      if (arc) {
        arc.style.strokeDashoffset = `${dashoffset}`;
      }
      if (arrowHead) {
        arrowHead.style.transform = `rotate(${sweepAngle}deg)`;
        arrowHead.style.opacity = `${Math.min(1, progress * 3)}`;
      }

      if (pullDistance >= PULL_THRESHOLD) {
        if (!ptr.classList.contains('svx-ptr-ready')) {
          ptr.classList.add('svx-ptr-ready');
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(12); } catch {}
          }
        }
      } else {
        if (ptr.classList.contains('svx-ptr-ready')) {
          ptr.classList.remove('svx-ptr-ready');
        }
      }

      // Prevent native browser overscroll if cancelable
      if (e.cancelable && pullDistance > 16) {
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (!canPullToRefresh) return;
      const wasPulling = isPulling;
      const wasReady = ptr.classList.contains('svx-ptr-ready');

      canPullToRefresh = false;
      isPulling = false;

      if (wasPulling && wasReady && !this.isRefreshing) {
        this.refreshFeed();
      } else if (wasPulling) {
        resetPTR();
      }
    }, { passive: true });

    window.addEventListener('touchcancel', () => {
      resetPTR();
    }, { passive: true });
  }

  async refreshFeed() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;

    const ptr = document.getElementById('svx-pull-to-refresh');
    const iconWrap = ptr?.querySelector('.svx-ptr-icon-wrap');
    const arrowHead = ptr?.querySelector('.svx-ptr-arrow-head');

    if (ptr) {
      ptr.classList.remove('svx-ptr-dragging', 'svx-ptr-ready');
      ptr.classList.add('svx-ptr-refreshing', 'svx-ptr-visible');
      ptr.style.transform = 'translate(-50%, 14px) scale(1)';
      ptr.style.opacity = '1';
      if (arrowHead) arrowHead.style.opacity = '0';
    }

    const startTime = Date.now();

    try {
      this.page = 1;
      const latestShayaris = await db.getFeed(1, CONFIG.FEED_PAGE_SIZE);

      // Smooth visual timing (minimum 400ms so spinner feels natural, not jerky)
      const elapsed = Date.now() - startTime;
      if (elapsed < 400) {
        await new Promise(r => setTimeout(r, 400 - elapsed));
      }

      if (latestShayaris && Array.isArray(latestShayaris) && latestShayaris.length > 0) {
        this.renderFeedItems(latestShayaris);
        try {
          db.local?.setCachedFeed?.(latestShayaris);
        } catch {}
      }

      if (ptr) {
        ptr.classList.remove('svx-ptr-refreshing');
        ptr.classList.add('svx-ptr-success');
        if (iconWrap) {
          iconWrap.innerHTML = `
            <svg class="svx-icon svx-ptr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          `;
        }
      }

      await new Promise(r => setTimeout(r, 380));
    } catch (err) {
      console.warn('[SVX Feed] Refresh error:', err);
      showToast('Could not refresh feed. Check connection.', 'AlertCircle');
    } finally {
      if (ptr) {
        ptr.style.transform = 'translate(-50%, -64px) scale(0.85)';
        ptr.style.opacity = '0';
        setTimeout(() => {
          ptr.className = 'svx-pull-to-refresh';
          ptr.style.transform = '';
          ptr.style.opacity = '';
          if (iconWrap) {
            iconWrap.innerHTML = `
              <svg class="svx-ptr-svg" viewBox="0 0 24 24" fill="none">
                <circle class="svx-ptr-track" cx="12" cy="12" r="8.2" />
                <circle class="svx-ptr-arc" cx="12" cy="12" r="8.2" stroke-dasharray="51.52" stroke-dashoffset="51.52" transform="rotate(-90 12 12)" />
                <g class="svx-ptr-arrow-head" style="opacity: 0; transform-origin: 12px 12px;">
                  <polyline points="11.5,1.8 14,3.8 11.5,5.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                </g>
              </svg>
            `;
          }
          this.isRefreshing = false;
        }, 280);
      } else {
        this.isRefreshing = false;
      }
    }
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

  renderFeedItems(shayaris) {
    if (!shayaris || !Array.isArray(shayaris) || shayaris.length === 0) return false;
    let listWrapper = this.container.querySelector('.svx-feed-list');
    if (!listWrapper) {
      this.container.innerHTML = '';
      listWrapper = document.createElement('div');
      listWrapper.className = 'svx-feed-list';
      this.container.appendChild(listWrapper);
    } else {
      listWrapper.innerHTML = '';
    }

    shayaris.forEach(s => {
      const card = createFeedCardElement(s);
      listWrapper.appendChild(card);
      this.intersectionObserver?.observe(card);
    });

    this.bindCardEvents(listWrapper);
    return true;
  }

  async loadFeed() {
    if (this.loading) return;
    this.loading = true;

    // 0ms Instant startup render from offline cache (zero flash)
    if (this.page === 1) {
      try {
        const cached = db.local?.getCachedFeed();
        if (cached && cached.length > 0 && !this.container.querySelector('.svx-feed-list')) {
          this.renderFeedItems(cached);
        }
      } catch (cacheErr) {
        console.warn('[SVX Feed] Startup cache read error:', cacheErr);
      }
    }

    try {
      const shayaris = await db.getFeed(this.page, CONFIG.FEED_PAGE_SIZE);

      if (!shayaris || shayaris.length === 0) {
        if (this.container.querySelector('.svx-feed-list')?.children.length > 0) {
          return;
        }

        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
        this.container.innerHTML = `
          <div class="svx-glass-card mood-purple" style="text-align: center; padding: 48px 20px; margin-top: 16px;">
            <div class="svx-placeholder-icon" style="margin: 0 auto 16px auto;">
              ${renderIcon(isOffline ? 'WifiOff' : 'Feather', 'svx-icon-lg')}
            </div>
            <h2 class="svx-placeholder-title" style="font-size: 20px; margin-bottom: 8px;">
              ${isOffline ? 'Offline Mode' : 'A Fresh Canvas Awaits'}
            </h2>
            <p class="svx-placeholder-desc" style="max-width: 300px; margin: 0 auto 24px auto;">
              ${isOffline ? 'Please connect to the internet or mobile data to load new Shayaris.' : 'No shayaris posted yet. Be the first to express your words with music.'}
            </p>
            ${isOffline ? `
              <button class="svx-btn-post" id="svx-feed-retry-btn" type="button" style="margin: 0 auto; padding: 12px 24px; font-size: 14px;">
                ${renderIcon('RotateCcw', 'svx-icon-sm')}
                <span>Retry Connection</span>
              </button>
            ` : `
              <button class="svx-btn-post" id="svx-feed-empty-create-btn" type="button" style="margin: 0 auto; padding: 12px 24px; font-size: 14px;">
                ${renderIcon('Plus', 'svx-icon-sm')}
                <span>Compose First Shayari</span>
              </button>
            `}
          </div>
        `;
        const retryBtn = document.getElementById('svx-feed-retry-btn');
        retryBtn?.addEventListener('click', () => {
          this.loadFeed();
        });
        const createBtn = document.getElementById('svx-feed-empty-create-btn');
        createBtn?.addEventListener('click', () => {
          if (this.composerModal) {
            this.composerModal.open();
          } else {
            const router = typeof this.getRouter === 'function' ? this.getRouter() : this.getRouter;
            router?.switchView('create');
          }
        });
        return;
      }

      this.renderFeedItems(shayaris);
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
    if (!listWrapper || listWrapper._eventsBound) return;
    listWrapper._eventsBound = true;
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
          const isCurrentlyLiked = target.classList.contains('liked');
          const countSpan = target.querySelector('.svx-like-count');
          const currentCount = parseInt(countSpan?.textContent || '0', 10);
          const nextLiked = !isCurrentlyLiked;
          const nextCount = Math.max(0, currentCount + (nextLiked ? 1 : -1));

          // 0ms Optimistic UI update across both Feed and Profile
          syncLikeStateInDOM(shayariId, nextLiked, nextCount);

          try {
            const result = await db.toggleLike(user.id, shayariId);
            if (result && typeof result.newCount === 'number') {
              syncLikeStateInDOM(shayariId, result.liked, result.newCount);
            }
          } catch (err) {
            console.warn('[SVX] Like failed, reverting optimistic state:', err);
            syncLikeStateInDOM(shayariId, isCurrentlyLiked, currentCount);
            showToast('Could not update like. Check connection.', 'AlertTriangle');
          }
        };

        const modal = this.authModal || globalAuthModal;
        if (modal) {
          modal.requireAuth(handleLike);
        }
      } else if (action === 'comment' && shayariId) {
        if (this.commentModal) {
          this.commentModal.open(shayariId);
        }
      } else if (action === 'edit-shayari' && shayariId) {
        if (this.composerModal) {
          // 0ms Instant: Read directly from card memory/DOM without network lag!
          let targetShayari = card?._shayari;
          if (!targetShayari) {
            const rawText = card?.querySelector('.svx-shayari-text')?.textContent || '';
            const mood = card?.getAttribute('data-mood') || 'purple';
            const pill = card?.querySelector('.svx-audio-pill');
            targetShayari = {
              id: shayariId,
              content: rawText,
              formatted: rawText,
              mood_theme: mood,
              song_name: pill?.querySelector('.svx-song-title')?.textContent || null,
              song_artist: pill?.querySelector('.svx-song-artist')?.textContent || null,
              song_url: pill?.getAttribute('data-song-url') || null
            };
          }
          this.composerModal.openForEdit(targetShayari);
        }
      } else if (action === 'delete-shayari' && shayariId) {
        const currentUser = db.getCurrentUser();
        const isFounder = currentUser && currentUser.handle === CONFIG.FOUNDER_HANDLE;
        const isGodMode = typeof localStorage !== 'undefined' && localStorage.getItem('svx_admin_god_mode') === 'true';
        const isAdmin = isFounder && (currentUser.is_admin || isGodMode);

        const ok = await SVXDialog.confirm({
          title: "Delete Shayari?",
          message: "Are you sure you want to delete this Shayari? This action cannot be undone.",
          confirmText: "Delete",
          isDanger: true
        });
        if (ok) {
          await db.deleteShayari(shayariId, currentUser?.id || '', isAdmin);
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.92)';
          setTimeout(() => {
            card.remove();
            const remaining = listWrapper.querySelectorAll('.svx-feed-card');
            if (remaining.length === 0) {
              this.loadFeed();
            }
          }, 300);
          showToast("Shayari post deleted.", "Trash2");
        }
      } else if (action === 'share' && shayariId) {
        const card = target.closest('.svx-feed-card');
        const targetShayari = card?._shayari || {
          id: shayariId,
          content: card?.querySelector('.svx-shayari-text')?.textContent || '',
          author_name: card?.querySelector('.svx-author-name')?.textContent || 'Aman',
          author_handle: card?.querySelector('.svx-author-handle')?.textContent?.replace(/^@/, '') || 'aman',
          song_name: card?.querySelector('.svx-song-title')?.textContent || ''
        };
        if (this.shareEngine) {
          this.shareEngine.shareCard(targetShayari);
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
    this.curatedContainer = document.getElementById('svx-discover-curated-container') || document.getElementById('svx-discover-tracks-container');
    this.searchContainer = document.getElementById('svx-discover-search-container') || this.curatedContainer;
    this.curatedLoaded = false;

    // Discover Floating Mini Player Controls
    this.miniPlayer = document.getElementById('svx-discover-mini-player');
    this.miniArt = document.getElementById('svx-mini-player-art');
    this.miniTitle = document.getElementById('svx-mini-player-title');
    this.miniArtist = document.getElementById('svx-mini-player-artist');
    this.miniModeBtn = document.getElementById('svx-mini-player-mode-btn');
    this.miniPrevBtn = document.getElementById('svx-mini-player-prev-btn');
    this.miniPlayBtn = document.getElementById('svx-mini-player-play-btn');
    this.miniNextBtn = document.getElementById('svx-mini-player-next-btn');
    this.miniCloseBtn = document.getElementById('svx-mini-player-close-btn');
    this.miniSettingsBtn = document.getElementById('svx-mini-player-settings-btn');
    this.miniTrackArea = document.getElementById('svx-mini-player-track-area');
    this.miniBgPopup = document.getElementById('svx-mini-player-bg-popup');
    this.miniBgToggle = document.getElementById('svx-bg-audio-toggle');

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
    this.setupMiniPlayer();
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

      if (track) {
        this.updateMiniPlayerTrack(track, isPlaying);
      }
    });

    audioEngine.onTrackChange((track) => {
      if (track) {
        this.updateMiniPlayerTrack(track, audioEngine.isPlaying());
      }
    });
  }

  setupMiniPlayer() {
    if (!this.miniPlayer) return;

    this.miniModeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const current = audioEngine.getPlaybackMode();
      const nextMode = current === 'loop' ? 'sequential' : current === 'sequential' ? 'shuffle' : 'loop';
      audioEngine.setPlaybackMode(nextMode);

      let msg = 'Mode: Single Couplet Loop';
      let icon = 'Repeat1';
      if (nextMode === 'sequential') {
        msg = 'Mode: 1-by-1 Sequential Autoplay';
        icon = 'Repeat';
      } else if (nextMode === 'shuffle') {
        msg = 'Mode: Shuffle Random Autoplay';
        icon = 'Shuffle';
      }
      showToast(msg, icon);
      this.updateMiniPlayerModeUI(nextMode);
    });

    this.miniPrevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      audioEngine.playPrevious();
    });

    this.miniPlayBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const current = audioEngine.getCurrentTrack();
      if (current) {
        audioEngine.togglePlayPause(current.url, current);
      } else {
        const list = audioEngine.getPlaylist();
        if (list.length > 0) {
          audioEngine.play(list[0].url, list[0]);
        }
      }
    });

    this.miniNextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      audioEngine.playNext();
    });

    this.miniCloseBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      audioEngine.pause();
      if (this.miniPlayer) {
        this.miniPlayer.style.display = 'none';
      }
    });

    // --- Background Playback Quick Settings Glass Popup ---
    const toggleBgPopup = (forceState) => {
      if (!this.miniBgPopup) return;
      const isOpen = this.miniBgPopup.style.display !== 'none';
      const next = typeof forceState === 'boolean' ? forceState : !isOpen;
      this.miniBgPopup.style.display = next ? 'flex' : 'none';
    };

    if (this.miniBgToggle) {
      this.miniBgToggle.checked = audioEngine.isBackgroundPlaybackEnabled();
      this.miniBgToggle.addEventListener('change', () => {
        const enabled = this.miniBgToggle.checked;
        audioEngine.setBackgroundPlayback(enabled);
        showToast(enabled ? "Background Playback ON" : "Background Playback OFF", "Music");
      });
    }

    // Direct Settings icon tap
    this.miniSettingsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBgPopup();
    });

    // Long-Press gesture on track area (~500ms)
    let longPressTimer = null;
    let didLongPress = false;

    const startPress = () => {
      didLongPress = false;
      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        didLongPress = true;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(30); } catch {}
        }
        toggleBgPopup(true);
      }, 500);
    };

    const cancelPress = () => {
      clearTimeout(longPressTimer);
    };

    if (this.miniTrackArea) {
      this.miniTrackArea.addEventListener('pointerdown', startPress);
      this.miniTrackArea.addEventListener('pointerup', cancelPress);
      this.miniTrackArea.addEventListener('pointerleave', cancelPress);
      this.miniTrackArea.addEventListener('pointercancel', cancelPress);

      // Normal click triggers play/pause if it wasn't a long-press
      this.miniTrackArea.addEventListener('click', (e) => {
        if (didLongPress) {
          e.stopPropagation();
          didLongPress = false;
          return;
        }
        const current = audioEngine.getCurrentTrack();
        if (current) {
          audioEngine.togglePlayPause(current.url, current);
        }
      });
    }

    // Outside click dismisses the popup
    document.addEventListener('pointerdown', (e) => {
      if (this.miniBgPopup && this.miniBgPopup.style.display !== 'none') {
        if (!this.miniBgPopup.contains(e.target) && !this.miniSettingsBtn?.contains(e.target)) {
          this.miniBgPopup.style.display = 'none';
        }
      }
    });

    audioEngine.onModeChange(({ mode }) => {
      this.updateMiniPlayerModeUI(mode);
    });

    audioEngine.onBackgroundPlaybackChange(({ enabled }) => {
      if (this.miniBgToggle) {
        this.miniBgToggle.checked = enabled;
      }
    });

    this.updateMiniPlayerModeUI(audioEngine.getPlaybackMode());
  }

  updateMiniPlayerModeUI(mode) {
    if (!this.miniModeBtn) return;
    let iconName = 'Repeat1';
    let title = 'Mode: Single Couplet Loop';
    if (mode === 'sequential') {
      iconName = 'Repeat';
      title = 'Mode: 1-by-1 Sequential Autoplay';
    } else if (mode === 'shuffle') {
      iconName = 'Shuffle';
      title = 'Mode: Shuffle Random Autoplay';
    }
    this.miniModeBtn.innerHTML = renderIcon(iconName, 'svx-icon-sm');
    this.miniModeBtn.title = title;
    this.miniModeBtn.setAttribute('aria-label', title);
    this.miniModeBtn.classList.toggle('active-mode', mode !== 'loop');
  }

  updateMiniPlayerTrack(track, isPlaying) {
    if (!this.miniPlayer || !track) return;
    this.miniPlayer.style.display = 'flex';

    if (this.miniTitle) this.miniTitle.textContent = track.name || 'Shayari BGM';
    if (this.miniArtist) this.miniArtist.textContent = track.artist || 'Viral Audio';

    if (this.miniArt) {
      if (track.art) {
        this.miniArt.innerHTML = `<img src="${escapeHtml(track.art)}" alt="${escapeHtml(track.name || '')}" loading="lazy">`;
      } else {
        this.miniArt.innerHTML = renderIcon('Disc', 'svx-icon-sm');
      }
      this.miniArt.classList.toggle('playing', !!isPlaying);
    }

    if (this.miniPlayBtn) {
      this.miniPlayBtn.innerHTML = renderIcon(isPlaying ? 'Pause' : 'Play', 'svx-icon-sm');
    }
  }

  switchTab(tab) {
    if (this.activeTab === tab && this.curatedLoaded) return;
    this.activeTab = tab;

    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-discover-tab') === tab);
    });

    if (tab === 'curated') {
      if (this.searchBar) this.searchBar.style.display = 'none';
      if (this.searchContainer && this.searchContainer !== this.curatedContainer) {
        this.searchContainer.style.display = 'none';
      }
      if (this.curatedContainer) {
        this.curatedContainer.style.display = 'flex';
      }
      if (!this.curatedLoaded) {
        this.loadCuratedTab();
      }
    } else {
      if (this.searchBar) this.searchBar.style.display = 'flex';
      if (this.curatedContainer && this.curatedContainer !== this.searchContainer) {
        this.curatedContainer.style.display = 'none';
      }
      if (this.searchContainer) {
        this.searchContainer.style.display = 'flex';
        const currentQuery = this.searchInput?.value || '';
        if (currentQuery.trim()) {
          this.performSearch(currentQuery);
        } else if (!this.searchContainer.children.length) {
          this.renderSearchPrompt();
        }
      }
    }
  }

  async loadCuratedTab() {
    if (!this.curatedContainer) return;
    if (this.curatedLoaded && this.curatedContainer.children.length > 0) return;
    this.renderLoadingSkeletons();

    try {
      const categories = await audioEngine.loadCuratedBGM();
      this.curatedContainer.innerHTML = '';

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
        this.curatedContainer.appendChild(catBlock);
      });
      this.curatedLoaded = true;
    } catch (err) {
      console.error('[SVX Music] Failed to load curated BGM:', err);
    }
  }

  renderSearchPrompt() {
    if (!this.searchContainer) return;
    this.searchContainer.innerHTML = `
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
    const target = this.activeTab === 'curated' ? this.curatedContainer : this.searchContainer;
    if (!target) return;
    target.innerHTML = `
      <div class="svx-skeleton-track"></div>
      <div class="svx-skeleton-track"></div>
      <div class="svx-skeleton-track"></div>
    `;
  }

  async performSearch(query) {
    if (!this.searchContainer) return;
    const trimmed = query.trim();
    if (!trimmed) {
      this.renderSearchPrompt();
      return;
    }

    this.renderLoadingSkeletons();

    try {
      const results = await audioEngine.searchOnlineSongs(trimmed);
      this.searchContainer.innerHTML = '';

      if (results.length === 0) {
        this.searchContainer.innerHTML = `
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

      this.searchContainer.appendChild(listWrapper);
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

      if (this.handleSuggestions) {
        this.handleSuggestions.className = 'svx-suggestions-row active';
        this.handleSuggestions.innerHTML = '';

        // Smart Login Guidance Pill if handle already exists
        const loginPill = document.createElement('button');
        loginPill.type = 'button';
        loginPill.className = 'svx-suggestion-pill svx-login-pill';
        loginPill.innerHTML = `${renderIcon('Lock', 'svx-icon-sm')}<span>Already yours? Tap to Login</span>`;
        loginPill.addEventListener('click', () => {
          this.switchMode('login');
          if (this.handleInput) this.handleInput.value = handle;
          this.pinInput?.focus();
        });
        this.handleSuggestions.appendChild(loginPill);

        if (check.suggestions && check.suggestions.length > 0) {
          const tryLabel = document.createElement('span');
          tryLabel.textContent = 'Or try:';
          tryLabel.style.color = 'var(--svx-text-muted)';
          tryLabel.style.margin = '0 2px';
          this.handleSuggestions.appendChild(tryLabel);

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
    this.pendingAction = null;
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
      await SVXDialog.alert({ title: "Handle Required", message: "Please enter your @handle." });
      this.handleInput?.focus();
      return;
    }

    if (!pin || pin.length < 4 || pin.length > 10 || !/^\d{4,10}$/.test(pin)) {
      await SVXDialog.alert({ title: "PIN Required", message: "Please enter a valid secret PIN (4 to 10 numbers only)." });
      this.pinInput?.focus();
      return;
    }

    const pinHash = await hashPin(pin);

    try {
      this.submitBtn.disabled = true;

      if (this.mode === 'register') {
        const displayName = this.displayNameInput?.value.trim();
        if (!displayName || displayName.length < 2) {
          await SVXDialog.alert({ title: "Name Required", message: "Display name must be at least 2 characters." });
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
          await SVXDialog.alert({ title: "Login Failed", message: "Invalid @handle or secret PIN. Please check and retry." });
          this.pinInput?.focus();
        }
      }
    } catch (err) {
      const errMsg = err?.message || "Authentication error.";
      if (this.mode === 'register' && errMsg.toLowerCase().includes('already taken')) {
        const shouldLogin = await SVXDialog.confirm({
          title: "Handle Already Registered",
          message: `@${handle} is already registered. If this is your Shayar ID, switch to login to enter your PIN.`,
          confirmText: "Switch to Login",
          cancelText: "Change Handle",
          isDanger: false
        });
        if (shouldLogin) {
          this.switchMode('login');
          if (this.handleInput) this.handleInput.value = handle;
          this.pinInput?.focus();
          return;
        }
      }
      await SVXDialog.alert({ title: "Auth Error", message: errMsg });
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
            <span>No comments yet. Be the first to share your thoughts.</span>
          </div>
        `;
        return;
      }

      const currentUser = db.getCurrentUser();
      const isFounder = currentUser && currentUser.handle === CONFIG.FOUNDER_HANDLE;
      const isGodMode = typeof localStorage !== 'undefined' && localStorage.getItem('svx_admin_god_mode') === 'true';
      const isAdmin = isFounder && (currentUser.is_admin || isGodMode);

      this.listEl.innerHTML = comments.map(c => {
        const initials = escapeHtml((c.author_name || 'U').slice(0, 2).toUpperCase());
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
                  <span class="svx-comment-handle">@${escapeHtml(c.author_handle)}</span>
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
      // 0ms Optimistic UI Append
      const tempId = `comm-temp-${Date.now()}`;
      const initials = (user.display_name || user.handle || 'U').slice(0, 2).toUpperCase();
      const verifiedBadge = user.is_verified ? renderIcon('BadgeCheck') : '';

      // Remove empty state if present
      const emptyState = this.listEl?.querySelector('.svx-comment-empty-state');
      if (emptyState) emptyState.remove();

      const itemEl = document.createElement('div');
      itemEl.className = 'svx-comment-item';
      itemEl.setAttribute('data-comment-id', tempId);
      itemEl.innerHTML = `
        <div class="svx-comment-avatar">${initials}</div>
        <div class="svx-comment-content">
          <div class="svx-comment-header">
            <div class="svx-comment-author-info">
              <span class="svx-comment-author">${escapeHtml(user.display_name || user.handle)}</span>
              ${verifiedBadge}
              <span class="svx-comment-handle">@${user.handle}</span>
            </div>
            <div class="svx-comment-meta-right">
              <span class="svx-comment-time">just now</span>
            </div>
          </div>
          <div class="svx-comment-text">${escapeHtml(text)}</div>
        </div>
      `;

      if (this.listEl) {
        this.listEl.appendChild(itemEl);
        this.listEl.scrollTop = this.listEl.scrollHeight;
      }

      if (this.input) this.input.value = '';

      // Optimistically update counts in modal header and card
      const currentCount = this.listEl ? this.listEl.querySelectorAll('.svx-comment-item').length : 1;
      if (this.countBadge) {
        this.countBadge.textContent = `${currentCount} comment${currentCount === 1 ? '' : 's'}`;
      }
      this.onCommentChange?.(this.currentShayariId, currentCount);
      showToast("Comment posted!", "Check");

      try {
        if (this.sendBtn) this.sendBtn.disabled = true;
        const saved = await db.addComment(user.id, this.currentShayariId, text);
        if (saved && saved.id) {
          itemEl.setAttribute('data-comment-id', saved.id);
        }
      } catch (err) {
        console.warn('[SVX Comments] Post failed, removing optimistic node:', err);
        itemEl.remove();
        const revertCount = this.listEl ? this.listEl.querySelectorAll('.svx-comment-item').length : 0;
        if (this.countBadge) {
          this.countBadge.textContent = `${revertCount} comment${revertCount === 1 ? '' : 's'}`;
        }
        this.onCommentChange?.(this.currentShayariId, revertCount);
        showToast("Comment failed. Check internet connection.", "AlertTriangle");
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
    const targetShayariId = this.currentShayariId;
    if (!targetShayariId) return;

    const itemEl = this.listEl?.querySelector(`.svx-comment-item[data-comment-id="${commentId}"]`);
    const currentUser = db.getCurrentUser();
    const isGodMode = typeof localStorage !== 'undefined' && localStorage.getItem('svx_admin_god_mode') === 'true';
    const isAdmin = currentUser && (currentUser.is_admin || isGodMode);

    const ok = await SVXDialog.confirm({
      title: "Delete Comment?",
      message: "Are you sure you want to delete this comment?",
      confirmText: "Delete",
      isDanger: true
    });

    if (ok) {
      // 1. Optimistic 0ms UI removal from sheet
      if (itemEl) itemEl.remove();

      // 2. Recalculate remaining count and update sheet badge
      const remainingCount = this.listEl ? this.listEl.querySelectorAll('.svx-comment-item').length : 0;
      if (this.countBadge) {
        this.countBadge.textContent = `${remainingCount} comment${remainingCount === 1 ? '' : 's'}`;
      }
      if (remainingCount === 0 && this.listEl) {
        this.listEl.innerHTML = `
          <div class="svx-comment-empty-state">
            ${renderIcon('MessageCircle', 'svx-icon-lg')}
            <span>No comments yet. Be the first to share your thoughts.</span>
          </div>
        `;
      }

      // 3. Update all card comment counts in Feed and Profile simultaneously in 0ms!
      this.onCommentChange?.(targetShayariId, remainingCount);

      // 4. Update local cached feed so count persists across app restarts
      try {
        const cached = db.local?.getCachedFeed() || [];
        const target = cached.find(s => s.id === targetShayariId);
        if (target) {
          target.comments_count = remainingCount;
          db.local?.cacheFeed(cached);
        }
      } catch {}

      try {
        await db.deleteComment(commentId, currentUser?.id || '', isAdmin);
        showToast("Comment deleted.", "Trash2");
      } catch (err) {
        console.warn('[SVX Comments] Delete failed, reloading comments:', err);
        await this.loadComments();
        const comments = await db.getComments(targetShayariId);
        this.onCommentChange?.(targetShayariId, comments.length);
        await SVXDialog.alert({ title: "Delete Failed", message: err.message || "Failed to delete comment." });
      }
    }
  }
}

/* 7b. Custom Dark Glass Dialog Modal (Replaces browser confirm & alert) */
export class SVXDialog {
  static modal = null;
  static iconContainer = null;
  static iconEl = null;
  static titleEl = null;
  static descEl = null;
  static cancelBtn = null;
  static confirmBtn = null;
  static activeResolver = null;

  static init() {
    this.modal = document.getElementById('svx-dialog-modal');
    this.iconContainer = document.getElementById('svx-dialog-icon-container');
    this.iconEl = document.getElementById('svx-dialog-icon');
    this.titleEl = document.getElementById('svx-dialog-title');
    this.descEl = document.getElementById('svx-dialog-desc');
    this.cancelBtn = document.getElementById('svx-dialog-cancel-btn');
    this.confirmBtn = document.getElementById('svx-dialog-confirm-btn');

    this.cancelBtn?.addEventListener('click', () => this.close(false));
    this.confirmBtn?.addEventListener('click', () => this.close(true));
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close(false);
    });
  }

  static confirm({ title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', isDanger = true } = {}) {
    if (!this.modal) this.init();
    return new Promise((resolve) => {
      this.activeResolver = resolve;
      if (this.titleEl) this.titleEl.textContent = title;
      if (this.descEl) this.descEl.textContent = message;
      if (this.cancelBtn) {
        this.cancelBtn.textContent = cancelText;
        this.cancelBtn.style.display = 'block';
      }
      if (this.confirmBtn) {
        this.confirmBtn.textContent = confirmText;
        this.confirmBtn.className = isDanger ? 'svx-dialog-btn svx-dialog-btn-danger' : 'svx-dialog-btn svx-dialog-btn-confirm';
      }
      if (this.iconContainer) {
        this.iconContainer.className = isDanger ? 'svx-dialog-icon-wrap' : 'svx-dialog-icon-wrap info';
      }
      this.modal?.classList.add('open', 'active');
    });
  }

  static alert({ title = 'Notice', message = '', buttonText = 'OK' } = {}) {
    if (!this.modal) this.init();
    return new Promise((resolve) => {
      this.activeResolver = resolve;
      if (this.titleEl) this.titleEl.textContent = title;
      if (this.descEl) this.descEl.textContent = message;
      if (this.cancelBtn) {
        this.cancelBtn.style.display = 'none';
      }
      if (this.confirmBtn) {
        this.confirmBtn.textContent = buttonText;
        this.confirmBtn.className = 'svx-dialog-btn svx-dialog-btn-confirm';
      }
      if (this.iconContainer) {
        this.iconContainer.className = 'svx-dialog-icon-wrap info';
      }
      this.modal?.classList.add('open', 'active');
    });
  }

  static close(result) {
    if (this.modal) {
      this.modal.classList.remove('open', 'active');
    }
    if (this.activeResolver) {
      this.activeResolver(result);
      this.activeResolver = null;
    }
  }
}

/* 7c. In-App Update Checker (Option A) */
export class SVXUpdateChecker {
  static isChecking = false;

  static async checkForUpdates(isManual = false) {
    if (this.isChecking) return;
    this.isChecking = true;

    const checkBtn = document.getElementById('svx-profile-check-update-btn');
    const originalContent = checkBtn ? checkBtn.innerHTML : null;

    if (isManual && checkBtn) {
      checkBtn.style.pointerEvents = 'none';
      checkBtn.style.opacity = '0.5';
      checkBtn.innerHTML = `${renderIcon('Loader2', 'svx-icon-sm svx-spin')}<span>Checking...</span>`;
    }

    try {
      const res = await fetch('https://api.github.com/repos/BeginnerAman/shayariverse-x/releases/latest', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!res.ok) {
        if (isManual) showToast("Could not reach update server.", "AlertCircle");
        return;
      }
      const release = await res.json();
      const latestTag = release.tag_name || '';
      const latestVersion = latestTag.replace(/^v/, '').trim();
      const currentVersion = CONFIG.VERSION.replace(/^v/, '').trim();
      const minSupported = (CONFIG.MIN_SUPPORTED_VERSION || '1.1.4').replace(/^v/, '').trim();

      const isOutdated = this.isNewer(latestVersion, currentVersion);
      const isBelowMin = this.isNewer(minSupported, currentVersion);

      if (isOutdated) {
        const releaseUrl = release.html_url || `https://github.com/BeginnerAman/shayariverse-x/releases/tag/v${latestVersion}`;
        const apkAsset = release.assets?.find(a => a.name.endsWith('.apk'));
        const downloadUrl = apkAsset ? apkAsset.browser_download_url : releaseUrl;

        if (isBelowMin) {
          // Mandatory Force Update for versions below minimum supported
          this.lockAppForUpdate(latestVersion, downloadUrl);
          await SVXDialog.alert({
            title: `Update Required (v${latestVersion})`,
            message: `A required update to v${latestVersion} is available. Please update now to continue using ShayariVerse X.`,
            buttonText: "Update Now"
          });
          window.open(downloadUrl, '_system');
        } else {
          // Check if user already dismissed this update on startup
          const dismissedVersion = typeof localStorage !== 'undefined' ? localStorage.getItem('svx_dismissed_update') : null;
          if (!isManual && dismissedVersion === latestVersion) {
            console.log(`[SVX Update] Update v${latestVersion} previously dismissed, suppressing auto popup.`);
            return;
          }

          // Optional/Recommended update for modern versions
          const updateNow = await SVXDialog.confirm({
            title: `Update Ready! (v${latestVersion})`,
            message: `ShayariVerse X v${latestVersion} is available with fixes and enhancements. Tap "Update Now" to download.`,
            confirmText: "Update Now",
            cancelText: "Later",
            isDanger: false
          });

          if (updateNow && downloadUrl) {
            window.open(downloadUrl, '_system');
          } else {
            // Remember user dismissed this update on startup
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('svx_dismissed_update', latestVersion);
              }
            } catch {}
          }
        }
      } else if (isManual) {
        showToast(`You have the latest version (v${CONFIG.VERSION})`, "Check");
      }
    } catch (err) {
      console.warn('[SVX Update] Check error:', err);
      if (isManual) {
        showToast("Unable to check for updates right now.", "AlertCircle");
      }
    } finally {
      this.isChecking = false;
      if (isManual && checkBtn && originalContent) {
        checkBtn.style.pointerEvents = '';
        checkBtn.style.opacity = '';
        checkBtn.innerHTML = originalContent;
      }
    }
  }

  static lockAppForUpdate(latestVersion, downloadUrl) {
    let blocker = document.getElementById('svx-update-blocker');
    if (!blocker) {
      blocker = document.createElement('div');
      blocker.id = 'svx-update-blocker';
      blocker.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,20,0.96);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;user-select:none;';
      blocker.innerHTML = `
        <div style="font-size:22px;font-weight:700;margin-bottom:12px;color:#fff;">Update Required</div>
        <p style="font-size:14px;color:rgba(255,255,255,0.7);max-width:300px;margin-bottom:24px;line-height:1.5;">
          A required update (v${latestVersion}) is available. Please update ShayariVerse X to continue enjoying your Shayari feed.
        </p>
        <button id="svx-blocker-update-btn" class="svx-btn-post" style="padding:14px 32px;font-size:15px;cursor:pointer;">Update Now</button>
      `;
      document.body.appendChild(blocker);
      document.getElementById('svx-blocker-update-btn')?.addEventListener('click', () => {
        window.open(downloadUrl, '_system');
      });
    }
  }

  static isNewer(latest, current) {
    const lParts = latest.split('.').map(Number);
    const cParts = current.split('.').map(Number);
    for (let i = 0; i < Math.max(lParts.length, cParts.length); i++) {
      const l = lParts[i] || 0;
      const c = cParts[i] || 0;
      if (l > c) return true;
      if (l < c) return false;
    }
    return false;
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
    this.modal.classList.add('open', 'active');
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('open', 'active');
    this.currentUser = null;
  }

  async handleSave() {
    if (!this.currentUser) return;
    const name = this.nameInput?.value.trim();
    const bio = this.bioInput?.value.trim();

    if (!name || name.length < 2) {
      await SVXDialog.alert({ title: "Name Required", message: "Display name must be at least 2 characters." });
      this.nameInput?.focus();
      return;
    }

    if (bio && bio.length > 150) {
      await SVXDialog.alert({ title: "Bio Too Long", message: "Bio cannot exceed 150 characters." });
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
      await SVXDialog.alert({ title: "Update Failed", message: err.message || "Failed to update profile." });
    } finally {
      if (this.saveBtn) this.saveBtn.disabled = false;
    }
  }
}

/* 9. Instant Native Share Engine (Phase 6) */
export class SVXShareEngine {
  constructor() {
    this.stage = document.getElementById('svx-share-stage');
  }

  async shareCard(shayari) {
    if (!shayari) return;

    const content = (shayari.formatted || shayari.content || '').trim();
    const authorName = shayari.author_name || 'Aman';
    const authorHandle = shayari.author_handle ? `@${shayari.author_handle.replace(/^@/, '')}` : '@aman';
    const songName = shayari.song_name ? `\n♫ BGM: ${shayari.song_name}` : '';
    const downloadLink = CONFIG.APK_DOWNLOAD_URL || `https://github.com/BeginnerAman/shayariverse-x/releases/download/v${CONFIG.VERSION}/ShayariVerse-X-v${CONFIG.VERSION}.apk`;
    const brandLink = `\n\n✧ Download ShayariVerse X:\n${downloadLink}`;

    const shareText = `"${content}"\n\n— ${authorName} (${authorHandle})${songName}${brandLink}`;

    // 1. Instant Native Web Share (WhatsApp, Instagram, Telegram, SMS, etc.)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ShayariVerse X',
          text: shareText
        });
        showToast("Shared successfully!", "Check");
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // User closed the native share drawer
        console.warn('[SVX Share] Native share error, falling back to clipboard:', err);
      }
    }

    // 2. Direct Clipboard Fallback
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        showToast("Shayari copied to clipboard!", "Check");
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast("Shayari copied to clipboard!", "Check");
      }
    } catch (clipErr) {
      console.error('[SVX Share] Clipboard fallback failed:', clipErr);
      showToast("Could not share Shayari.", "AlertTriangle");
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
          listContainer.innerHTML = `<div class="svx-placeholder-desc" style="text-align: center; margin: 16px auto; padding: 24px 16px;">No Shayaris posted yet.</div>`;
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

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
            <span id="svx-secret-version-tag" class="svx-version-tag">ShayariVerse X v${CONFIG.VERSION}</span>
            <button id="svx-profile-check-update-btn" type="button" style="background: none; border: none; color: var(--svx-accent-cyan); font-size: 11.5px; cursor: pointer; display: flex; align-items: center; gap: 5px; opacity: 0.85; padding: 4px 10px;">
              ${renderIcon('Sparkles', 'svx-icon-sm')}
              <span>Check for Updates</span>
            </button>
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
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
        listContainer.innerHTML = `<div class="svx-placeholder-desc" style="text-align: center; margin: 16px auto; padding: 24px 16px;">${isOffline ? 'Offline Mode • Connect to internet to sync your Shayaris.' : "You haven't posted any Shayari yet. Tap + Create to compose your first piece."}</div>`;
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

    const checkUpdateBtn = document.getElementById('svx-profile-check-update-btn');
    checkUpdateBtn?.addEventListener('click', () => {
      SVXUpdateChecker.checkForUpdates(true);
    });

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
    if (!listWrapper || listWrapper._eventsBound) return;
    listWrapper._eventsBound = true;
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
          const isCurrentlyLiked = target.classList.contains('liked');
          const countSpan = target.querySelector('.svx-like-count');
          const currentCount = parseInt(countSpan?.textContent || '0', 10);
          const nextLiked = !isCurrentlyLiked;
          const nextCount = Math.max(0, currentCount + (nextLiked ? 1 : -1));

          // 0ms Optimistic UI update across both Feed and Profile
          syncLikeStateInDOM(shayariId, nextLiked, nextCount);

          try {
            const result = await db.toggleLike(user.id, shayariId);
            if (result && typeof result.newCount === 'number') {
              syncLikeStateInDOM(shayariId, result.liked, result.newCount);
            }
          } catch (err) {
            console.warn('[SVX Profile] Like failed, reverting optimistic state:', err);
            syncLikeStateInDOM(shayariId, isCurrentlyLiked, currentCount);
            showToast('Could not update like. Check connection.', 'AlertTriangle');
          }
        };
        const modal = this.authModal || globalAuthModal;
        if (modal) {
          modal.requireAuth(handleLike);
        }
      } else if (action === 'comment' && shayariId) {
        this.commentModal?.open(shayariId);
      } else if (action === 'share' && shayariId) {
        const card = target.closest('.svx-feed-card');
        const targetShayari = card?._shayari || {
          id: shayariId,
          content: card?.querySelector('.svx-shayari-text')?.textContent || '',
          author_name: card?.querySelector('.svx-author-name')?.textContent || 'Aman',
          author_handle: card?.querySelector('.svx-author-handle')?.textContent?.replace(/^@/, '') || 'aman',
          song_name: card?.querySelector('.svx-song-title')?.textContent || ''
        };
        if (this.shareEngine) {
          this.shareEngine.shareCard(targetShayari);
        }
      } else if (action === 'edit-shayari' && shayariId) {
        if (this.composerModal) {
          let targetShayari = card?._shayari;
          if (!targetShayari) {
            const rawText = card?.querySelector('.svx-shayari-text')?.textContent || '';
            const mood = card?.getAttribute('data-mood') || 'purple';
            const pill = card?.querySelector('.svx-audio-pill');
            targetShayari = {
              id: shayariId,
              content: rawText,
              formatted: rawText,
              mood_theme: mood,
              song_name: pill?.querySelector('.svx-song-title')?.textContent || null,
              song_artist: pill?.querySelector('.svx-song-artist')?.textContent || null,
              song_url: pill?.getAttribute('data-song-url') || null
            };
          }
          this.composerModal.openForEdit(targetShayari);
        }
      } else if (action === 'delete-shayari' && shayariId) {
        const currentUser = db.getCurrentUser();
        const isFounder = currentUser && currentUser.handle === CONFIG.FOUNDER_HANDLE;
        const isGodMode = typeof localStorage !== 'undefined' && localStorage.getItem('svx_admin_god_mode') === 'true';
        const isAdmin = isFounder && (currentUser.is_admin || isGodMode);

        const ok = await SVXDialog.confirm({
          title: "Delete Shayari?",
          message: "Are you sure you want to delete this Shayari? This action cannot be undone.",
          confirmText: "Delete",
          isDanger: true
        });

        if (ok) {
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
      await SVXDialog.alert({
        title: "Founder Access Only",
        message: "Admin God-Mode is reserved for Founder @aman. Please login as @aman with your secret PIN."
      });
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
          if (targetView === 'feed' && this.currentView === 'feed') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (typeof this.onFeedRefresh === 'function') {
              this.onFeedRefresh();
            }
          } else {
            this.switchView(targetView);
          }
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
      this.profileController.viewingHandle = null;
      this.profileController.render();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log(`[SVX] Switched to view: ${viewName}`);
  }
}

/**
 * In-Place 0ms DOM Updater for Edited Shayari
 * Updates Feed AND Profile tab instances simultaneously without scroll loss or feed teardown
 */
export function updateShayariInDOM(shayari) {
  if (!shayari || !shayari.id) return;
  try {
    const cards = document.querySelectorAll(`.svx-feed-card[data-shayari-id="${shayari.id}"]`);
    cards.forEach(card => {
      // 1. Text & typography
      const textEl = card.querySelector('.svx-shayari-text');
      if (textEl) {
        textEl.textContent = shayari.formatted || shayari.content;
        const sizeClass = getAutoFitClass(shayari.content || '');
        textEl.className = `svx-shayari-text font-${shayari.font_style || 'nastaliq'} ${sizeClass}`;
      }

      // 2. Mood theme
      if (shayari.mood_theme) {
        card.setAttribute('data-mood', shayari.mood_theme);
        card.className = `svx-glass-card svx-feed-card mood-${shayari.mood_theme}`;
      }

      // 3. Audio Pill
      let pill = card.querySelector('.svx-audio-pill');
      if (shayari.song_url) {
        if (!pill) {
          pill = document.createElement('div');
          pill.className = 'svx-audio-pill';
          const cardBody = card.querySelector('.svx-card-body');
          if (cardBody && cardBody.nextSibling) {
            card.insertBefore(pill, cardBody.nextSibling);
          }
        }
        pill.setAttribute('data-song-url', shayari.song_url);
        pill.innerHTML = `
          <div class="svx-album-art" aria-hidden="true">
            ${renderIcon('Disc')}
          </div>
          <div class="svx-audio-info">
            <span class="svx-song-title">${escapeHtml(shayari.song_name || 'Shayari BGM')}</span>
            <span class="svx-song-artist">${escapeHtml(shayari.song_artist || 'Viral Audio')}</span>
          </div>
          <div class="svx-equalizer paused" aria-hidden="true">
            <div class="svx-eq-bar"></div>
            <div class="svx-eq-bar"></div>
            <div class="svx-eq-bar"></div>
            <div class="svx-eq-bar"></div>
            <div class="svx-eq-bar"></div>
          </div>
          <button class="svx-audio-toggle-btn" data-action="toggle-audio" aria-label="Play or Pause BGM">
            ${renderIcon('Play', 'svx-icon-sm')}
          </button>
        `;
      } else if (pill) {
        pill.remove();
      }

      // Cache updated object on DOM node
      card._shayari = { ...(card._shayari || {}), ...shayari };
    });
    console.log(`[SVX] Synchronously updated shayari ${shayari.id} across ${cards.length} card(s)`);
  } catch (err) {
    console.error('[SVX] Error in updateShayariInDOM:', err);
  }
}

/**
 * Real-time Offline & Online Network Monitor
 * Manages top offline banner pill and handles seamless auto-reconnect
 */
export function initNetworkMonitor(feedController, profileController) {
  const banner = document.getElementById('svx-offline-banner');
  const retryBtn = document.getElementById('svx-offline-retry-btn');

  function updateNetworkState() {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (banner) {
      banner.classList.toggle('active', !isOnline);
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      updateNetworkState();
      showToast('Back online • Synced', 'Wifi');
      feedController?.loadFeed();
      profileController?.render();
    });

    window.addEventListener('offline', () => {
      updateNetworkState();
      showToast('Offline Mode • Showing cached posts', 'WifiOff');
    });

    retryBtn?.addEventListener('click', () => {
      if (navigator.onLine) {
        updateNetworkState();
        feedController?.loadFeed();
        profileController?.render();
        showToast('Reconnected & synced', 'Check');
      } else {
        showToast('Still offline. Check your data connection.', 'AlertTriangle');
      }
    });

    updateNetworkState();
  }
}

/**
 * Professional Android Hardware & Gesture Back Navigation
 * Dismisses active dialogs, bottom sheets, composer, and sub-views first.
 * Navigates to root Home Feed before allowing smooth OS exit.
 */
export function initBackNavigation({ authModal, commentModal, composerModal, editProfileModal, profileController, router }) {
  function handleBack() {
    // 1. Dismiss custom dialog if open
    const dialogModal = document.getElementById('svx-dialog-modal');
    if (dialogModal?.classList.contains('active')) {
      SVXDialog.close(false);
      return true;
    }

    // 2. Close Comments Bottom Sheet if open
    if (commentModal?.sheet?.classList.contains('open')) {
      commentModal.close();
      return true;
    }

    // 3. Close Composer Modal if open
    if (composerModal?.modal?.classList.contains('active')) {
      composerModal.close();
      return true;
    }

    // 4. Close Auth Modal if open
    if (authModal?.modal?.classList.contains('active')) {
      authModal.close();
      return true;
    }

    // 5. Close Edit Profile Modal if open
    if (editProfileModal?.modal?.classList.contains('active')) {
      editProfileModal.close();
      return true;
    }

    // 6. If viewing another author's profile, return to feed or own profile
    if (profileController?.viewingHandle) {
      profileController.viewingHandle = null;
      profileController.render();
      return true;
    }

    // 7. If not on Home Feed tab, switch back to Home Feed
    if (router && router.currentView !== 'feed') {
      router.switchView('feed');
      return true;
    }

    // 8. On Home Feed: return false -> allow smooth native app exit/minimize
    return false;
  }

  if (typeof window !== 'undefined') {
    // Capacitor Native Android Hardware Back Event
    const Cap = window.Capacitor;
    if (Cap?.Plugins?.App?.addListener) {
      Cap.Plugins.App.addListener('backButton', () => {
        const handled = handleBack();
        if (!handled) {
          Cap.Plugins.App.exitApp();
        }
      });
    }

    // Android WebView / Cordova Back Button fallback
    document.addEventListener('backbutton', (e) => {
      const handled = handleBack();
      if (handled) {
        e.preventDefault();
      }
    });
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
        updateShayariInDOM(newShayari);
        showToast("Shayari updated successfully!", "Check");
      } else {
        feedController?.prependCard(newShayari);
        router?.switchView('feed');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast("Shayari published!", "Check");
      }
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
  if (feedController) {
    router.onFeedRefresh = () => feedController.refreshFeed();
  }

  // 10. Real-time Offline & Online Network Monitor
  initNetworkMonitor(feedController, profileController);

  // 11. Background In-App Update Check
  setTimeout(() => {
    SVXUpdateChecker.checkForUpdates(false);
  }, 1000);

  // 12. Professional Android Hardware & Gesture Back Navigation
  initBackNavigation({
    authModal,
    commentModal,
    composerModal,
    editProfileModal,
    profileController,
    router
  });

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
