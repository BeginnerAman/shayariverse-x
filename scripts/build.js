// ShayariVerse X (SVX) — APK Build Script
// Packages web assets into dist/ for Capacitor Android APK packaging

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

console.log('[SVX Build] Packaging assets for Android APK into dist/...');

// Clean dist
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Copy essential web assets
const filesToCopy = ['index.html', 'style.css'];
filesToCopy.forEach(file => {
  const src = path.join(ROOT_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST_DIR, file));
    console.log(`[SVX Build] Copied ${file}`);
  }
});

const dirsToCopy = ['js', 'lib', 'assets'];
dirsToCopy.forEach(dir => {
  const src = path.join(ROOT_DIR, dir);
  if (fs.existsSync(src)) {
    copyRecursiveSync(src, path.join(DIST_DIR, dir));
    console.log(`[SVX Build] Copied directory: ${dir}/`);
  }
});

// Copy bgm metadata to dist, keeping heavy audio tracks on jsDelivr CDN so APK remains ultra-lightweight (~4.5MB)
const bgmDist = path.join(DIST_DIR, 'bgm');
fs.mkdirSync(bgmDist, { recursive: true });
fs.copyFileSync(path.join(ROOT_DIR, 'bgm', 'preloaded-songs.json'), path.join(bgmDist, 'preloaded-songs.json'));
console.log('[SVX Build] Bundled bgm/preloaded-songs.json (tracks streamed via high-speed jsDelivr CDN)');

console.log('[SVX Build] APK web bundle ready in dist/! Capacitor can now sync and build the Android APK.');
