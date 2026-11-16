// ShayariVerse X (SVX) — Configuration Constants
// Single Source of Truth for runtime settings, CDN endpoints, and storage prefixes

export const CONFIG = {
  APP_NAME: 'ShayariVerse X',
  APP_SHORT: 'SVX',
  VERSION: '1.1.5',
  MIN_SUPPORTED_VERSION: '1.1.4',
  APK_DOWNLOAD_URL: 'https://github.com/BeginnerAman/shayariverse-x/releases/download/v1.1.5/ShayariVerse-X-v1.1.5.apk',
  RELEASE_URL: 'https://github.com/BeginnerAman/shayariverse-x/releases/latest',
  REPO_URL: 'https://github.com/BeginnerAman/shayariverse-x',

  // Supabase (Dual-Mode Live Cloud DB)
  SUPABASE_URL: 'https://avkpoodioywyseuzeyhi.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2a3Bvb2Rpb3l3eXNldXpleWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MTY0NDAsImV4cCI6MjExMDI5MjQ0MH0.GsguOqoKNDYm3-01yiFndT1DhRLb-zurbG8fW5sKOR4',

  // Audio CDN
  CDN_BASE: 'https://cdn.jsdelivr.net/gh/beginneraman/shayariverse-x@main/bgm/',
  SONGS_JSON: 'preloaded-songs.json',

  // Music Search APIs
  JIOSAAVN_API: 'https://www.jiosaavn.com/api.php',
  ITUNES_API: 'https://itunes.apple.com/search',
  SEARCH_DEBOUNCE_MS: 400,
  ITUNES_COUNTRY: 'IN',
  ITUNES_LIMIT: 12,

  // Storage Prefix — Strictly isolated from legacy apps
  STORAGE_PREFIX: 'svx_',

  // Identity & Admin Rules
  FOUNDER_HANDLE: 'aman',
  RESERVED_HANDLES: ['aman', 'beginneraman', 'admin', 'founder', 'shayariversex', 'svx'],
  ADMIN_PASSKEY_TAPS: 5, // Number of secret taps to unlock admin mode

  // Composer Dynamic Auto-Fit Rules
  AUTO_FIT: {
    SHORT:  { maxLines: 2, maxChars: 80,  fontSize: '24px', fontWeight: 700, lineHeight: 1.6 },
    MEDIUM: { maxLines: 4, maxChars: 200, fontSize: '19px', fontWeight: 500, lineHeight: 1.5 },
    LONG:   {                              fontSize: '15px', fontWeight: 400, lineHeight: 1.45 }
  },

  // Performance & Mobile Limits
  MAX_BACKDROP_FILTERS: 4,
  FEED_PAGE_SIZE: 15,
  COMMENT_MAX_LENGTH: 500,
  BIO_MAX_LENGTH: 150,
  HANDLE_MIN: 3,
  HANDLE_MAX: 20,
  DISPLAY_NAME_MIN: 2,
  DISPLAY_NAME_MAX: 30
};
