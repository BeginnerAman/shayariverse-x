// ShayariVerse X (SVX) — Native Android Version Synchronizer & Permissions Injector
// Synchronizes android/app/build.gradle versionCode & versionName with package.json
import fs from 'fs';
import path from 'path';
import { applyMediaSessionPatch } from './patch-media-session.js';

const ROOT_DIR = process.cwd();
const pkgPath = path.join(ROOT_DIR, 'package.json');
const gradlePath = path.join(ROOT_DIR, 'android', 'app', 'build.gradle');

// Apply plugin patches first
try {
  applyMediaSessionPatch();
} catch (err) {
  console.warn('[SVX Version] Warning applying media session patch:', err.message);
}

if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  // 1. Sync js/config.js and dist/js/config.js
  const configFiles = [
    path.join(ROOT_DIR, 'js', 'config.js'),
    path.join(ROOT_DIR, 'dist', 'js', 'config.js')
  ];
  configFiles.forEach(cfgPath => {
    if (fs.existsSync(cfgPath)) {
      let cfgContent = fs.readFileSync(cfgPath, 'utf8');
      cfgContent = cfgContent.replace(/VERSION:\s*['"][^'"]+['"]/, `VERSION: '${pkg.version}'`);
      cfgContent = cfgContent.replace(/ShayariVerse-X-v[0-9.]+\.apk/g, `ShayariVerse-X-v${pkg.version}.apk`);
      fs.writeFileSync(cfgPath, cfgContent, 'utf8');
      console.log(`[SVX Version] Successfully synchronized ${path.basename(cfgPath)} to VERSION '${pkg.version}'`);
    }
  });

  if (fs.existsSync(gradlePath)) {
    let content = fs.readFileSync(gradlePath, 'utf8');
    const parts = (pkg.version || '1.1.4').split('.').map(Number);
    const versionCode = (parts[0] || 1) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
    
    content = content.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
    content = content.replace(/versionName\s+["'][^"']+["']/, `versionName "${pkg.version}"`);
    
    fs.writeFileSync(gradlePath, content, 'utf8');
    console.log(`[SVX Version] Successfully updated android/app/build.gradle to versionCode ${versionCode}, versionName "${pkg.version}"`);

    // Inject required permissions for Android 14 Foreground Audio Service
    const manifestPath = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
    if (fs.existsSync(manifestPath)) {
      let manifest = fs.readFileSync(manifestPath, 'utf8');
      const requiredPermissions = [
        'android.permission.WAKE_LOCK',
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK'
      ];
      let modified = false;
      for (const perm of requiredPermissions) {
        if (!manifest.includes(perm)) {
          manifest = manifest.replace(
            '<application',
            `    <uses-permission android:name="${perm}" />\n    <application`
          );
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(manifestPath, manifest, 'utf8');
        console.log('[SVX Version] Injected required audio permissions to AndroidManifest.xml');
      }
    }
  } else {
    console.log('[SVX Version] Notice: android/app/build.gradle not present locally; will run in CI pipeline.');
  }
}
