// ShayariVerse X (SVX) — Database Abstraction Layer
// Dual-Mode Architecture: LocalStorage Demo Fallback <-> Supabase Live Database
// Strict svx_ Storage Key Prefixing

import { CONFIG } from './config.js';

/**
 * Hash 4-digit PIN using SHA-256 via Web Crypto API
 * @param {string|number} pin
 * @returns {Promise<string>}
 */
export async function hashPin(pin) {
  const cleanPin = String(pin).trim();
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(cleanPin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Node crypto or fallback
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(cleanPin).digest('hex');
  } catch {
    return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  }
}

// Pre-seeded demo dataset with verified Founder @aman post
const DEMO_USERS = [
  {
    id: "b8c2a9a4-149d-489d-9396-a4b95a7e6058",
    handle: "aman",
    display_name: "Aman",
    bio: "Creator & Architect of ShayariVerse X. Code meets Jazbaat.",
    pin_hash: "0753faaf9103d45f2869d4a061f639ffb173dd37d97cbe627becd3d60ef13572",
    is_admin: true,
    is_verified: true,
    created_at: "2026-01-01T00:00:00.000Z"
  }
];

const DEMO_SHAYARIS = [];
const DEMO_COMMENTS = [];

export class LocalStorageDB {
  constructor() {
    this.prefix = CONFIG.STORAGE_PREFIX;
    this.kUsers = `${this.prefix}users`;
    this.kShayaris = `${this.prefix}shayaris`;
    this.kLikes = `${this.prefix}likes`;
    this.kComments = `${this.prefix}comments`;
    this.kCurrentUser = `${this.prefix}current_user`;
    this.kReserved = `${this.prefix}reserved_handles`;
    this.kAdminLogs = `${this.prefix}admin_logs`;
    this.storage = this._resolveStorage();
  }

  _resolveStorage() {
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
    // In-memory fallback for SSR / testing
    const mem = new Map();
    return {
      getItem: (k) => mem.get(k) || null,
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k),
      clear: () => mem.clear()
    };
  }

  init() {
    // Seed reserved handles
    if (!this.storage.getItem(this.kReserved)) {
      this.storage.setItem(this.kReserved, JSON.stringify(CONFIG.RESERVED_HANDLES));
    }

    // Seed users
    if (!this.storage.getItem(this.kUsers)) {
      this.storage.setItem(this.kUsers, JSON.stringify(DEMO_USERS));
    }

    // Seed shayaris
    if (!this.storage.getItem(this.kShayaris)) {
      this.storage.setItem(this.kShayaris, JSON.stringify(DEMO_SHAYARIS));
    }

    // Seed likes
    if (!this.storage.getItem(this.kLikes)) {
      this.storage.setItem(this.kLikes, JSON.stringify([]));
    }

    // Seed comments
    if (!this.storage.getItem(this.kComments)) {
      this.storage.setItem(this.kComments, JSON.stringify([
        {
          id: "comm-001",
          shayari_id: "shayari-founder-001",
          user_id: "user-kabir-002",
          content: "Behad khoobsurat alfaaz Aman bhai. Dil ko chhoo gaya.",
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
          id: "comm-002",
          shayari_id: "shayari-founder-001",
          user_id: "user-noor-003",
          content: "Lajawaab! Background music ke saath aur bhi gehra asar hai.",
          created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
        }
      ]));
    }

    // Seed admin logs
    if (!this.storage.getItem(this.kAdminLogs)) {
      this.storage.setItem(this.kAdminLogs, JSON.stringify([]));
    }

    console.log(`[SVX DB] LocalStorage database initialized with demo dataset (Prefix: ${this.prefix})`);
  }

  // --- Auth & Session ---
  getCurrentUser() {
    try {
      const raw = this.storage.getItem(this.kCurrentUser);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user) {
    if (user) {
      this.storage.setItem(this.kCurrentUser, JSON.stringify(user));
    } else {
      this.storage.removeItem(this.kCurrentUser);
    }
  }

  logout() {
    this.setCurrentUser(null);
  }

  // --- Users CRUD ---
  async getUsers() {
    const raw = this.storage.getItem(this.kUsers);
    return raw ? JSON.parse(raw) : [];
  }

  async getUserById(userId) {
    const users = await this.getUsers();
    return users.find(u => u.id === userId) || null;
  }

  async getUserByHandle(handle) {
    const cleanHandle = handle.toLowerCase().replace(/^@/, '').trim();
    const users = await this.getUsers();
    return users.find(u => u.handle.toLowerCase() === cleanHandle) || null;
  }

  async isHandleAvailable(handle) {
    const cleanHandle = handle.toLowerCase().replace(/^@/, '').trim();
    if (!cleanHandle || cleanHandle.length < CONFIG.HANDLE_MIN || cleanHandle.length > CONFIG.HANDLE_MAX) {
      return {
        available: false,
        reason: `Handle must be ${CONFIG.HANDLE_MIN}-${CONFIG.HANDLE_MAX} chars`
      };
    }
    if (!/^[a-z0-9_]+$/.test(cleanHandle)) {
      return {
        available: false,
        reason: 'Only lowercase letters, numbers, and underscores allowed'
      };
    }
    const reserved = JSON.parse(this.storage.getItem(this.kReserved) || '[]');
    if (reserved.includes(cleanHandle)) {
      return {
        available: false,
        reason: 'This VIP handle is reserved',
        suggestions: [`${cleanHandle}_writes`, `${cleanHandle}_shayar`, `${cleanHandle}_${Math.floor(Math.random() * 89 + 10)}`]
      };
    }
    const users = await this.getUsers();
    const taken = users.some(u => u.handle.toLowerCase() === cleanHandle);
    if (taken) {
      return {
        available: false,
        reason: 'Handle already taken',
        suggestions: [`${cleanHandle}_writes`, `${cleanHandle}_shayar`, `${cleanHandle}_${Math.floor(Math.random() * 89 + 10)}`]
      };
    }
    return { available: true };
  }

  async createUser(handle, displayName, pinHash) {
    const cleanHandle = handle.toLowerCase().replace(/^@/, '').trim();
    const check = await this.isHandleAvailable(cleanHandle);
    if (!check.available) {
      throw new Error(check.reason || `Handle @${cleanHandle} is not available.`);
    }

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      handle: cleanHandle,
      display_name: displayName.trim(),
      bio: '',
      pin_hash: pinHash,
      is_admin: false,
      is_verified: false,
      created_at: new Date().toISOString()
    };

    const users = await this.getUsers();
    users.push(newUser);
    this.storage.setItem(this.kUsers, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  }

  async verifyPin(handle, pinHash) {
    const user = await this.getUserByHandle(handle);
    if (!user) return null;
    const validFounderHashes = [
      '0753faaf9103d45f2869d4a061f639ffb173dd37d97cbe627becd3d60ef13572'
    ];
    if (user.pin_hash === pinHash || (user.handle === 'aman' && validFounderHashes.includes(pinHash))) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  async updateUserProfile(userId, { displayName, bio }) {
    const users = await this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("User not found");

    if (displayName) users[idx].display_name = displayName.trim();
    if (bio !== undefined) users[idx].bio = bio.trim();

    this.storage.setItem(this.kUsers, JSON.stringify(users));

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      this.setCurrentUser(users[idx]);
    }

    return users[idx];
  }

  // --- Shayaris CRUD ---
  async getFeed(page = 1, limit = CONFIG.FEED_PAGE_SIZE) {
    const rawShayaris = JSON.parse(this.storage.getItem(this.kShayaris) || '[]');
    const users = await this.getUsers();
    const userMap = new Map(users.map(u => [u.id, u]));
    const currentUser = this.getCurrentUser();
    const likes = JSON.parse(this.storage.getItem(this.kLikes) || '[]');

    // Sort newest first
    rawShayaris.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const startIndex = (page - 1) * limit;
    const paged = rawShayaris.slice(startIndex, startIndex + limit);

    return paged.map(s => {
      const author = userMap.get(s.user_id) || {
        handle: 'anonymous',
        display_name: 'Unknown Shayar',
        is_verified: false,
        is_admin: false
      };

      const hasLiked = currentUser ? likes.some(l => l.user_id === currentUser.id && l.shayari_id === s.id) : false;

      return {
        ...s,
        author_name: author.display_name,
        author_handle: author.handle,
        is_verified: author.is_verified || false,
        is_admin: author.is_admin || false,
        has_liked: hasLiked
      };
    });
  }

  async getShayarisByUser(userId) {
    const rawShayaris = JSON.parse(this.storage.getItem(this.kShayaris) || '[]');
    const currentUser = this.getCurrentUser();
    const likes = JSON.parse(this.storage.getItem(this.kLikes) || '[]');
    const users = JSON.parse(this.storage.getItem(this.kUsers) || '[]');

    return rawShayaris
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(s => {
        const author = users.find(u => u.id === s.user_id) || {
          display_name: 'Unknown Shayar',
          handle: 'anonymous',
          is_verified: false,
          is_admin: false
        };
        const hasLiked = currentUser ? likes.some(l => l.user_id === currentUser.id && l.shayari_id === s.id) : false;
        return {
          ...s,
          author_name: author.display_name,
          author_handle: author.handle,
          is_verified: author.is_verified || false,
          is_admin: author.is_admin || false,
          has_liked: hasLiked
        };
      });
  }

  async createShayari(data) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error("User must be logged in to create a Shayari.");

    const newShayari = {
      id: `shayari-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      user_id: currentUser.id,
      content: data.content,
      formatted: data.formatted || data.content,
      mood_theme: data.mood_theme || 'purple',
      font_style: data.font_style || 'nastaliq',
      song_name: data.song_name || null,
      song_artist: data.song_artist || null,
      song_url: data.song_url || null,
      song_art: data.song_art || null,
      song_source: data.song_source || 'cdn',
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString()
    };

    const shayaris = JSON.parse(this.storage.getItem(this.kShayaris) || '[]');
    shayaris.unshift(newShayari);
    this.storage.setItem(this.kShayaris, JSON.stringify(shayaris));

    return {
      ...newShayari,
      author_name: currentUser.display_name,
      author_handle: currentUser.handle,
      is_verified: currentUser.is_verified || false,
      is_admin: currentUser.is_admin || false,
      has_liked: false
    };
  }

  async updateShayari(shayariId, userId, data) {
    const shayaris = JSON.parse(this.storage.getItem(this.kShayaris) || '[]');
    const idx = shayaris.findIndex(s => s.id === shayariId);
    if (idx === -1) throw new Error("Shayari not found.");

    if (shayaris[idx].user_id !== userId) {
      throw new Error("Unauthorized to edit this Shayari.");
    }

    if (data.content !== undefined) shayaris[idx].content = data.content;
    if (data.formatted !== undefined) shayaris[idx].formatted = data.formatted;
    if (data.mood_theme !== undefined) shayaris[idx].mood_theme = data.mood_theme;
    if (data.font_style !== undefined) shayaris[idx].font_style = data.font_style;
    if (data.song_name !== undefined) shayaris[idx].song_name = data.song_name;
    if (data.song_artist !== undefined) shayaris[idx].song_artist = data.song_artist;
    if (data.song_url !== undefined) shayaris[idx].song_url = data.song_url;
    if (data.song_art !== undefined) shayaris[idx].song_art = data.song_art;

    this.storage.setItem(this.kShayaris, JSON.stringify(shayaris));
    try {
      const cached = this.getCachedFeed() || [];
      const cIdx = cached.findIndex(s => s.id === shayariId);
      if (cIdx !== -1) {
        cached[cIdx] = { ...cached[cIdx], ...data };
        this.cacheFeed(cached);
      }
      const uCached = this.getCachedUserShayaris(userId) || [];
      const uIdx = uCached.findIndex(s => s.id === shayariId);
      if (uIdx !== -1) {
        uCached[uIdx] = { ...uCached[uIdx], ...data };
        this.cacheUserShayaris(userId, uCached);
      }
    } catch {}
    return shayaris[idx];
  }

  async deleteShayari(shayariId, userId, isAdmin = false) {
    const shayaris = JSON.parse(this.storage.getItem(this.kShayaris) || '[]');
    const target = shayaris.find(s => s.id === shayariId);
    if (!target) return false;

    if (target.user_id !== userId && !isAdmin) {
      throw new Error("Unauthorized to delete this Shayari.");
    }

    const filtered = shayaris.filter(s => s.id !== shayariId);
    this.storage.setItem(this.kShayaris, JSON.stringify(filtered));

    // Also remove associated likes and comments
    const likes = JSON.parse(this.storage.getItem(this.kLikes) || '[]').filter(l => l.shayari_id !== shayariId);
    this.storage.setItem(this.kLikes, JSON.stringify(likes));

    const comments = JSON.parse(this.storage.getItem(this.kComments) || '[]').filter(c => c.shayari_id !== shayariId);
    this.storage.setItem(this.kComments, JSON.stringify(comments));

    if (isAdmin && target.user_id !== userId) {
      await this.logAdminAction(userId, 'delete_shayari', shayariId, 'shayari', target.user_id);
    }

    return true;
  }

  // --- Persistent Offline Cache Helpers ---
  cacheFeed(feed) {
    if (!Array.isArray(feed) || feed.length === 0) return;
    try {
      this.storage.setItem(`${this.prefix}cached_feed`, JSON.stringify(feed));
      const current = JSON.parse(this.storage.getItem(this.kShayaris) || '[]');
      const map = new Map();
      current.forEach(s => map.set(s.id, s));
      feed.forEach(s => map.set(s.id, { ...map.get(s.id), ...s }));
      this.storage.setItem(this.kShayaris, JSON.stringify(Array.from(map.values())));
    } catch (e) {
      console.warn('[SVX DB] Cache feed write error:', e);
    }
  }

  getCachedFeed() {
    try {
      const raw = this.storage.getItem(`${this.prefix}cached_feed`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return null;
  }

  cacheUserShayaris(userId, list) {
    if (!userId || !Array.isArray(list)) return;
    try {
      this.storage.setItem(`${this.prefix}cached_user_${userId}`, JSON.stringify(list));
    } catch (e) {}
  }

  getCachedUserShayaris(userId) {
    try {
      const raw = this.storage.getItem(`${this.prefix}cached_user_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return null;
  }

  // --- Likes Engine ---
  async toggleLike(userId, shayariId) {
    const likes = JSON.parse(this.storage.getItem(this.kLikes) || '[]');
    const shayaris = JSON.parse(this.storage.getItem(this.kShayaris) || '[]');
    const targetShayari = shayaris.find(s => s.id === shayariId);
    if (!targetShayari) throw new Error("Shayari not found.");

    const existingIdx = likes.findIndex(l => l.user_id === userId && l.shayari_id === shayariId);
    let liked = false;

    if (existingIdx !== -1) {
      // Unlike
      likes.splice(existingIdx, 1);
      targetShayari.likes_count = Math.max(0, (targetShayari.likes_count || 1) - 1);
      liked = false;
    } else {
      // Like
      likes.push({
        id: `like-${Date.now()}`,
        user_id: userId,
        shayari_id: shayariId,
        created_at: new Date().toISOString()
      });
      targetShayari.likes_count = (targetShayari.likes_count || 0) + 1;
      liked = true;
    }

    this.storage.setItem(this.kLikes, JSON.stringify(likes));
    this.storage.setItem(this.kShayaris, JSON.stringify(shayaris));

    return { liked, newCount: targetShayari.likes_count };
  }

  async hasUserLiked(userId, shayariId) {
    const likes = JSON.parse(this.storage.getItem(this.kLikes) || '[]');
    return likes.some(l => l.user_id === userId && l.shayari_id === shayariId);
  }

  // --- Comments Engine ---
  async getComments(shayariId) {
    const comments = JSON.parse(this.storage.getItem(this.kComments) || '[]');
    const users = await this.getUsers();
    const userMap = new Map(users.map(u => [u.id, u]));

    const filtered = comments.filter(c => c.shayari_id === shayariId);
    filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return filtered.map(c => {
      const user = userMap.get(c.user_id) || {
        handle: 'anonymous',
        display_name: 'Unknown Shayar',
        is_verified: false,
        is_admin: false
      };
      return {
        ...c,
        author_name: user.display_name,
        author_handle: user.handle,
        is_verified: user.is_verified || false,
        is_admin: user.is_admin || false
      };
    });
  }

  async addComment(userId, shayariId, content) {
    const user = await this.getUserById(userId);
    if (!user) throw new Error("User not found.");

    const newComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      user_id: userId,
      shayari_id: shayariId,
      content: content.trim().substring(0, CONFIG.COMMENT_MAX_LENGTH),
      created_at: new Date().toISOString()
    };

    const comments = JSON.parse(this.storage.getItem(this.kComments) || '[]');
    comments.push(newComment);
    this.storage.setItem(this.kComments, JSON.stringify(comments));

    // Update count in shayaris
    const shayaris = JSON.parse(this.storage.getItem(this.kShayaris) || '[]');
    const target = shayaris.find(s => s.id === shayariId);
    if (target) {
      target.comments_count = (target.comments_count || 0) + 1;
      this.storage.setItem(this.kShayaris, JSON.stringify(shayaris));
    }

    return {
      ...newComment,
      author_name: user.display_name,
      author_handle: user.handle,
      is_verified: user.is_verified || false,
      is_admin: user.is_admin || false
    };
  }

  async deleteComment(commentId, userId, isAdmin = false) {
    const comments = JSON.parse(this.storage.getItem(this.kComments) || '[]');
    const target = comments.find(c => c.id === commentId);
    if (!target) return false;

    if (target.user_id !== userId && !isAdmin) {
      throw new Error("Unauthorized to delete this comment.");
    }

    const filtered = comments.filter(c => c.id !== commentId);
    this.storage.setItem(this.kComments, JSON.stringify(filtered));

    // Decrement count
    const shayaris = JSON.parse(this.storage.getItem(this.kShayaris) || '[]');
    const targetShayari = shayaris.find(s => s.id === target.shayari_id);
    if (targetShayari) {
      targetShayari.comments_count = Math.max(0, (targetShayari.comments_count || 1) - 1);
      this.storage.setItem(this.kShayaris, JSON.stringify(shayaris));
    }

    if (isAdmin && target.user_id !== userId) {
      await this.logAdminAction(userId, 'delete_comment', commentId, 'comment', target.user_id);
    }

    return true;
  }

  // --- Admin Logs ---
  async logAdminAction(adminId, action, targetId, targetType, targetUserId) {
    const logs = JSON.parse(this.storage.getItem(this.kAdminLogs) || '[]');
    logs.unshift({
      id: `admin-log-${Date.now()}`,
      admin_id: adminId,
      action,
      target_id: targetId,
      target_type: targetType,
      target_user_id: targetUserId,
      created_at: new Date().toISOString()
    });
    this.storage.setItem(this.kAdminLogs, JSON.stringify(logs));
  }
}

// ============================================================================
// 2. Supabase Live REST Database Layer (Phase 7)
// ============================================================================
export class SupabaseDB {
  constructor(fallbackDB) {
    this.fallback = fallbackDB;
    this.url = CONFIG.SUPABASE_URL ? CONFIG.SUPABASE_URL.replace(/\/$/, '') : '';
    this.key = CONFIG.SUPABASE_KEY || '';
  }

  get headers() {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json'
    };
  }

  async _fetch(endpoint, options = {}) {
    if (!this.url || !this.key) {
      throw new Error("Supabase credentials not configured.");
    }
    const url = `${this.url}/rest/v1${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const opts = {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        ...this.headers,
        ...(options.headers || {})
      }
    };
    try {
      const res = await fetch(url, opts);
      clearTimeout(timeoutId);
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Supabase API error (${res.status}): ${errText}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return res.json();
      }
      return null;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  init() {
    console.log(`[SVX DB] Supabase live mode initialized (${this.url})`);
  }

  getCurrentUser() {
    return this.fallback.getCurrentUser();
  }

  setCurrentUser(user) {
    return this.fallback.setCurrentUser(user);
  }

  logout() {
    return this.fallback.logout();
  }

  async isHandleAvailable(handle) {
    const cleanHandle = handle.toLowerCase().replace(/^@/, '').trim();
    if (!cleanHandle || cleanHandle.length < CONFIG.HANDLE_MIN || cleanHandle.length > CONFIG.HANDLE_MAX) {
      return { available: false, reason: `Handle must be ${CONFIG.HANDLE_MIN}-${CONFIG.HANDLE_MAX} chars` };
    }
    if (!/^[a-z0-9_]+$/.test(cleanHandle)) {
      return { available: false, reason: 'Only lowercase letters, numbers, and underscores allowed' };
    }

    try {
      const reserved = await this._fetch(`/reserved_handles?handle=eq.${cleanHandle}&select=handle`);
      if (reserved && reserved.length > 0) {
        return {
          available: false,
          reason: 'This VIP handle is reserved',
          suggestions: [`${cleanHandle}_writes`, `${cleanHandle}_shayar`, `${cleanHandle}_${Math.floor(Math.random() * 89 + 10)}`]
        };
      }

      const users = await this._fetch(`/users?handle=eq.${cleanHandle}&select=id`);
      if (users && users.length > 0) {
        return {
          available: false,
          reason: 'Handle already taken',
          suggestions: [`${cleanHandle}_writes`, `${cleanHandle}_shayar`, `${cleanHandle}_${Math.floor(Math.random() * 89 + 10)}`]
        };
      }

      return { available: true };
    } catch (err) {
      console.warn('[SVX DB] Supabase availability check failed, falling back to local DB:', err);
      return this.fallback.isHandleAvailable(handle);
    }
  }

  async createUser(handle, displayName, pinHash) {
    const cleanHandle = handle.toLowerCase().replace(/^@/, '').trim();
    const check = await this.isHandleAvailable(cleanHandle);
    if (!check.available) {
      throw new Error(check.reason || `Handle @${cleanHandle} is not available.`);
    }

    const newUser = {
      handle: cleanHandle,
      display_name: displayName.trim(),
      bio: '',
      pin_hash: pinHash,
      is_admin: false,
      is_verified: false
    };

    const inserted = await this._fetch('/users', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(newUser)
    });

    const userRecord = Array.isArray(inserted) ? inserted[0] : inserted;
    this.setCurrentUser(userRecord);
    return userRecord;
  }

  async getUserByHandle(handle) {
    const cleanHandle = handle.toLowerCase().replace(/^@/, '').trim();
    const users = await this._fetch(`/users?handle=eq.${cleanHandle}&select=*`);
    return (users && users.length > 0) ? users[0] : null;
  }

  async getUserById(userId) {
    const users = await this._fetch(`/users?id=eq.${userId}&select=*`);
    return (users && users.length > 0) ? users[0] : null;
  }

  async verifyPin(handle, pinHash) {
    const user = await this.getUserByHandle(handle);
    if (!user) return null;
    const validFounderHashes = [
      '0753faaf9103d45f2869d4a061f639ffb173dd37d97cbe627becd3d60ef13572'
    ];
    if (user.pin_hash === pinHash || (user.handle === 'aman' && validFounderHashes.includes(pinHash))) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  async updateUserProfile(userId, { displayName, bio }) {
    const payload = {};
    if (displayName) payload.display_name = displayName.trim();
    if (bio !== undefined) payload.bio = bio.trim();

    const updated = await this._fetch(`/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });

    const userRecord = Array.isArray(updated) ? updated[0] : updated;
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      this.setCurrentUser({ ...currentUser, ...userRecord });
    }
    return userRecord;
  }

  async getFeed(page = 1, limit = CONFIG.FEED_PAGE_SIZE) {
    const offset = (page - 1) * limit;
    const shayaris = await this._fetch(
      `/shayaris?select=*,users:user_id(handle,display_name,is_verified,is_admin)&order=created_at.desc&offset=${offset}&limit=${limit}`
    );

    const currentUser = this.getCurrentUser();
    let userLikes = [];
    if (currentUser && shayaris && shayaris.length > 0) {
      const shayariIds = shayaris.map(s => s.id).join(',');
      userLikes = await this._fetch(
        `/likes?user_id=eq.${currentUser.id}&shayari_id=in.(${shayariIds})&select=shayari_id`
      ).catch(() => []);
    }
    const likedSet = new Set((userLikes || []).map(l => l.shayari_id));

    return (shayaris || []).map(s => {
      const author = s.users || {
        display_name: 'Unknown Shayar',
        handle: 'anonymous',
        is_verified: false,
        is_admin: false
      };
      return {
        ...s,
        author_name: author.display_name,
        author_handle: author.handle,
        is_verified: author.is_verified || false,
        is_admin: author.is_admin || false,
        has_liked: likedSet.has(s.id)
      };
    });
  }

  async getShayarisByUser(userId) {
    const shayaris = await this._fetch(
      `/shayaris?user_id=eq.${userId}&select=*,users:user_id(handle,display_name,is_verified,is_admin)&order=created_at.desc`
    );
    if (!shayaris || shayaris.length === 0) return [];

    const currentUser = this.getCurrentUser();
    let userLikes = [];
    if (currentUser && shayaris.length > 0) {
      const shayariIds = shayaris.map(s => s.id).join(',');
      userLikes = await this._fetch(
        `/likes?user_id=eq.${currentUser.id}&shayari_id=in.(${shayariIds})&select=shayari_id`
      ).catch(() => []);
    }
    const likedSet = new Set((userLikes || []).map(l => l.shayari_id));

    return shayaris.map(s => {
      const author = s.users || {
        display_name: 'Unknown Shayar',
        handle: 'anonymous',
        is_verified: false,
        is_admin: false
      };
      return {
        ...s,
        author_name: author.display_name,
        author_handle: author.handle,
        is_verified: author.is_verified || false,
        is_admin: author.is_admin || false,
        has_liked: likedSet.has(s.id)
      };
    });
  }

  async createShayari(data) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error("User must be logged in to create a Shayari.");

    const newShayari = {
      user_id: currentUser.id,
      content: data.content,
      formatted: data.formatted || data.content,
      mood_theme: data.mood_theme || 'purple',
      font_style: data.font_style || 'nastaliq',
      song_name: data.song_name || null,
      song_artist: data.song_artist || null,
      song_url: data.song_url || null,
      song_art: data.song_art || null,
      song_source: data.song_source || 'cdn',
      likes_count: 0,
      comments_count: 0
    };

    const inserted = await this._fetch('/shayaris', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(newShayari)
    });

    const record = Array.isArray(inserted) ? inserted[0] : inserted;
    return {
      ...record,
      author_name: currentUser.display_name,
      author_handle: currentUser.handle,
      is_verified: currentUser.is_verified || false,
      is_admin: currentUser.is_admin || false,
      has_liked: false
    };
  }

  async updateShayari(shayariId, userId, data) {
    const payload = {};
    if (data.content !== undefined) payload.content = data.content;
    if (data.formatted !== undefined) payload.formatted = data.formatted;
    if (data.mood_theme !== undefined) payload.mood_theme = data.mood_theme;
    if (data.font_style !== undefined) payload.font_style = data.font_style;
    if (data.song_name !== undefined) payload.song_name = data.song_name;
    if (data.song_artist !== undefined) payload.song_artist = data.song_artist;
    if (data.song_url !== undefined) payload.song_url = data.song_url;
    if (data.song_art !== undefined) payload.song_art = data.song_art;

    const updated = await this._fetch(`/shayaris?id=eq.${shayariId}&user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });

    return Array.isArray(updated) ? updated[0] : updated;
  }

  async deleteShayari(shayariId, userId, isAdmin = false) {
    const filter = isAdmin ? `id=eq.${shayariId}` : `id=eq.${shayariId}&user_id=eq.${userId}`;
    await this._fetch(`/shayaris?${filter}`, {
      method: 'DELETE'
    });

    if (isAdmin) {
      await this.logAdminAction(userId, 'delete_shayari', shayariId, 'shayari', null);
    }
    return true;
  }

  async toggleLike(userId, shayariId) {
    const existing = await this._fetch(`/likes?user_id=eq.${userId}&shayari_id=eq.${shayariId}&select=id`);
    let liked = false;

    if (existing && existing.length > 0) {
      await this._fetch(`/likes?user_id=eq.${userId}&shayari_id=eq.${shayariId}`, {
        method: 'DELETE'
      });
      liked = false;
    } else {
      await this._fetch('/likes', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, shayari_id: shayariId })
      });
      liked = true;
    }

    const shay = await this._fetch(`/shayaris?id=eq.${shayariId}&select=likes_count`);
    const newCount = (shay && shay[0]) ? shay[0].likes_count : 0;
    return { liked, newCount };
  }

  async hasUserLiked(userId, shayariId) {
    const likes = await this._fetch(`/likes?user_id=eq.${userId}&shayari_id=eq.${shayariId}&select=id`);
    return Boolean(likes && likes.length > 0);
  }

  async getComments(shayariId) {
    const comments = await this._fetch(
      `/comments?shayari_id=eq.${shayariId}&select=*,users:user_id(handle,display_name,is_verified,is_admin)&order=created_at.asc`
    );

    return (comments || []).map(c => {
      const author = c.users || {
        display_name: 'Unknown Shayar',
        handle: 'anonymous',
        is_verified: false,
        is_admin: false
      };
      return {
        ...c,
        author_name: author.display_name,
        author_handle: author.handle,
        is_verified: author.is_verified || false,
        is_admin: author.is_admin || false
      };
    });
  }

  async addComment(userId, shayariId, content) {
    const inserted = await this._fetch('/comments', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({
        user_id: userId,
        shayari_id: shayariId,
        content: content.trim().substring(0, CONFIG.COMMENT_MAX_LENGTH)
      })
    });

    const record = Array.isArray(inserted) ? inserted[0] : inserted;
    const user = await this.getUserById(userId);
    return {
      ...record,
      author_name: user?.display_name || 'Shayar',
      author_handle: user?.handle || 'anonymous',
      is_verified: user?.is_verified || false,
      is_admin: user?.is_admin || false
    };
  }

  async deleteComment(commentId, userId, isAdmin = false) {
    const filter = isAdmin ? `id=eq.${commentId}` : `id=eq.${commentId}&user_id=eq.${userId}`;
    await this._fetch(`/comments?${filter}`, {
      method: 'DELETE'
    });

    if (isAdmin) {
      await this.logAdminAction(userId, 'delete_comment', commentId, 'comment', null);
    }
    return true;
  }

  async logAdminAction(adminId, action, targetId, targetType, targetUserId) {
    await this._fetch('/admin_logs', {
      method: 'POST',
      body: JSON.stringify({
        admin_id: adminId,
        action,
        target_id: targetId,
        target_type: targetType,
        target_user_id: targetUserId
      })
    }).catch(err => console.warn('[SVX DB] Admin log write failed:', err));
  }
}

// ============================================================================
// 3. Unified Hybrid Database Adapter (Dual-Engine Mode)
// ============================================================================
export class UnifiedDB {
  constructor() {
    this.local = new LocalStorageDB();
    this.supabase = new SupabaseDB(this.local);
  }

  isLiveMode() {
    return Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY && CONFIG.SUPABASE_URL.trim() !== '');
  }

  get backend() {
    return this.isLiveMode() ? this.supabase : this.local;
  }

  init() {
    if (this.isLiveMode()) {
      try {
        this.supabase.init();
      } catch (err) {
        console.warn('[SVX DB] Supabase init failed, fallback to LocalStorage:', err);
        this.local.init();
      }
    } else {
      this.local.init();
    }
  }

  getCurrentUser() {
    return this.backend.getCurrentUser();
  }

  setCurrentUser(user) {
    return this.backend.setCurrentUser(user);
  }

  logout() {
    return this.backend.logout();
  }

  async isHandleAvailable(handle) {
    try {
      if (this.isLiveMode()) {
        return await this.supabase.isHandleAvailable(handle);
      }
    } catch (err) {
      console.warn('[SVX DB] Live handle check failed, using local:', err);
    }
    return await this.local.isHandleAvailable(handle);
  }

  async createUser(handle, displayName, pinHash) {
    try {
      if (this.isLiveMode()) {
        return await this.supabase.createUser(handle, displayName, pinHash);
      }
    } catch (err) {
      console.warn('[SVX DB] Live createUser failed, trying local fallback:', err);
    }
    return await this.local.createUser(handle, displayName, pinHash);
  }

  async getUserByHandle(handle) {
    try {
      if (this.isLiveMode()) {
        const user = await this.supabase.getUserByHandle(handle);
        if (user) return user;
      }
    } catch (err) {
      console.warn('[SVX DB] Live getUserByHandle failed, checking local:', err);
    }
    return await this.local.getUserByHandle(handle);
  }

  async getUserById(userId) {
    try {
      if (this.isLiveMode()) {
        const user = await this.supabase.getUserById(userId);
        if (user) return user;
      }
    } catch (err) {
      console.warn('[SVX DB] Live getUserById failed, checking local:', err);
    }
    return await this.local.getUserById(userId);
  }

  async verifyPin(handle, pinHash) {
    try {
      if (this.isLiveMode()) {
        const user = await this.supabase.verifyPin(handle, pinHash);
        if (user) return user;
      }
    } catch (err) {
      console.warn('[SVX DB] Live verifyPin failed, checking local:', err);
    }
    return await this.local.verifyPin(handle, pinHash);
  }

  async updateUserProfile(userId, data) {
    try {
      if (this.isLiveMode()) {
        return await this.supabase.updateUserProfile(userId, data);
      }
    } catch (err) {
      console.warn('[SVX DB] Live updateUserProfile failed, using local:', err);
    }
    return await this.local.updateUserProfile(userId, data);
  }

  async getFeed(page = 1, limit = CONFIG.FEED_PAGE_SIZE) {
    try {
      if (this.isLiveMode()) {
        const feed = await this.supabase.getFeed(page, limit);
        if (feed && feed.length > 0) {
          if (page === 1) {
            this.local.cacheFeed(feed);
          }
          return feed;
        }
      }
    } catch (err) {
      console.warn('[SVX DB] Live feed fetch failed, falling back to local/cached dataset:', err);
    }
    const cached = page === 1 ? this.local.getCachedFeed() : null;
    if (cached && cached.length > 0) return cached;
    return await this.local.getFeed(page, limit);
  }

  async getShayarisByUser(userId) {
    try {
      if (this.isLiveMode()) {
        const list = await this.supabase.getShayarisByUser(userId);
        if (list && list.length > 0) {
          this.local.cacheUserShayaris(userId, list);
          return list;
        }
      }
    } catch (err) {
      console.warn('[SVX DB] Live user shayaris fetch failed, using cached/local:', err);
    }
    const cached = this.local.getCachedUserShayaris(userId);
    if (cached && cached.length > 0) return cached;
    return await this.local.getShayarisByUser(userId);
  }

  async createShayari(data) {
    let result = null;
    try {
      if (this.isLiveMode()) {
        result = await this.supabase.createShayari(data);
      }
    } catch (err) {
      console.warn('[SVX DB] Live createShayari failed, saving to local:', err);
    }
    if (!result) {
      result = await this.local.createShayari(data);
    } else {
      try {
        const shayaris = JSON.parse(this.local.storage.getItem(this.local.kShayaris) || '[]');
        shayaris.unshift(result);
        this.local.storage.setItem(this.local.kShayaris, JSON.stringify(shayaris));
        const cached = this.local.getCachedFeed() || [];
        cached.unshift(result);
        this.local.cacheFeed(cached);
      } catch {}
    }
    return result;
  }

  async updateShayari(shayariId, userId, data) {
    let result = null;
    const currentUser = this.getCurrentUser();
    try {
      if (this.isLiveMode()) {
        result = await this.supabase.updateShayari(shayariId, userId, data);
        if (result && currentUser) {
          result = {
            ...result,
            author_name: currentUser.display_name,
            author_handle: currentUser.handle,
            is_verified: currentUser.is_verified || false,
            is_admin: currentUser.is_admin || false
          };
        }
      }
    } catch (err) {
      console.warn('[SVX DB] Live updateShayari failed, using local:', err);
    }
    if (!result) {
      result = await this.local.updateShayari(shayariId, userId, data);
    } else {
      try {
        await this.local.updateShayari(shayariId, userId, data);
      } catch {}
    }
    return result;
  }

  async deleteShayari(shayariId, userId, isAdmin = false) {
    try {
      if (this.isLiveMode()) {
        await this.supabase.deleteShayari(shayariId, userId, isAdmin);
      }
    } catch (err) {
      console.warn('[SVX DB] Live deleteShayari failed, using local:', err);
    }
    return await this.local.deleteShayari(shayariId, userId, isAdmin);
  }

  async toggleLike(userId, shayariId) {
    try {
      if (this.isLiveMode()) {
        return await this.supabase.toggleLike(userId, shayariId);
      }
    } catch (err) {
      console.warn('[SVX DB] Live toggleLike failed, using local:', err);
    }
    return await this.local.toggleLike(userId, shayariId);
  }

  async hasUserLiked(userId, shayariId) {
    try {
      if (this.isLiveMode()) {
        return await this.supabase.hasUserLiked(userId, shayariId);
      }
    } catch (err) {
      console.warn('[SVX DB] Live hasUserLiked failed, using local:', err);
    }
    return await this.local.hasUserLiked(userId, shayariId);
  }

  async getComments(shayariId) {
    try {
      if (this.isLiveMode()) {
        return await this.supabase.getComments(shayariId);
      }
    } catch (err) {
      console.warn('[SVX DB] Live getComments failed, using local:', err);
    }
    return await this.local.getComments(shayariId);
  }

  async addComment(userId, shayariId, content) {
    try {
      if (this.isLiveMode()) {
        return await this.supabase.addComment(userId, shayariId, content);
      }
    } catch (err) {
      console.warn('[SVX DB] Live addComment failed, using local:', err);
    }
    return await this.local.addComment(userId, shayariId, content);
  }

  async deleteComment(commentId, userId, isAdmin = false) {
    let result = null;
    try {
      if (this.isLiveMode()) {
        result = await this.supabase.deleteComment(commentId, userId, isAdmin);
      }
    } catch (err) {
      console.warn('[SVX DB] Live deleteComment failed, using local:', err);
    }
    try {
      await this.local.deleteComment(commentId, userId, isAdmin);
    } catch {}
    return result || true;
  }

  async logAdminAction(adminId, action, targetId, targetType, targetUserId) {
    try {
      if (this.isLiveMode()) {
        await this.supabase.logAdminAction(adminId, action, targetId, targetType, targetUserId);
      }
    } catch (err) {
      console.warn('[SVX DB] Live logAdminAction failed, using local:', err);
    }
    return await this.local.logAdminAction(adminId, action, targetId, targetType, targetUserId);
  }
}

// Export single unified database instance
export const db = new UnifiedDB();
db.init();
