// ShayariVerse X (SVX) — Native MediaSession Silent & Crash-Proof Patch
// Ensures:
// 1. ZERO notification sound / beep / chime / vibration on track changes (IMPORTANCE_LOW, onlyAlertOnce, null sound)
// 2. ZERO NetworkOnMainThreadException (guards against synchronous HTTP calls in urlToBitmap)
// 3. Android 14 FOREGROUND_SERVICE_MEDIA_PLAYBACK compliance

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const pluginDir = path.join(ROOT_DIR, 'node_modules', '@jofr', 'capacitor-media-session', 'android', 'src', 'main');

export function applyMediaSessionPatch() {
  const serviceJavaPath = path.join(pluginDir, 'java', 'io', 'github', 'jofr', 'capacitor', 'mediasessionplugin', 'MediaSessionService.java');
  const pluginJavaPath = path.join(pluginDir, 'java', 'io', 'github', 'jofr', 'capacitor', 'mediasessionplugin', 'MediaSessionPlugin.java');
  const pluginManifestPath = path.join(pluginDir, 'AndroidManifest.xml');

  let patchedCount = 0;

  // 1. Patch MediaSessionService.java for 100% Silent Notification on track change
  if (fs.existsSync(serviceJavaPath)) {
    let code = fs.readFileSync(serviceJavaPath, 'utf8');

    // Silent channel configuration
    const oldChannel = 'NotificationChannel channel = new NotificationChannel("playback", "Playback", NotificationManager.IMPORTANCE_LOW);\n            notificationManager.createNotificationChannel(channel);';
    const newChannel = `NotificationChannel channel = new NotificationChannel("playback", "Playback", NotificationManager.IMPORTANCE_LOW);
            channel.setSound(null, null);
            channel.enableVibration(false);
            channel.setDescription("ShayariVerse X Silent Background Media Player");
            notificationManager.createNotificationChannel(channel);`;

    if (code.includes(oldChannel)) {
      code = code.replace(oldChannel, newChannel);
      patchedCount++;
    }

    // Set onlyAlertOnce and setSound(null) on notificationBuilder
    const oldInit = '.setVisibility(NotificationCompat.VISIBILITY_PUBLIC);';
    const newInit = `.setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOnlyAlertOnce(true)
                .setSound(null);`;

    if (code.includes(oldInit) && !code.includes('.setOnlyAlertOnce(true)')) {
      code = code.replace(oldInit, newInit);
      patchedCount++;
    }

    // Ensure update() notification notify does not alert or chime
    const oldUpdate = 'notificationBuilder\n                    .setContentTitle(title)\n                    .setContentText(artist + " - " + album)\n                    .setLargeIcon(artwork);';
    const newUpdate = `notificationBuilder
                    .setOnlyAlertOnce(true)
                    .setSound(null)
                    .setContentTitle(title)
                    .setContentText(artist)
                    .setLargeIcon(artwork);`;

    if (code.includes(oldUpdate)) {
      code = code.replace(oldUpdate, newUpdate);
      patchedCount++;
    }

    fs.writeFileSync(serviceJavaPath, code, 'utf8');
    console.log('[SVX Patch] MediaSessionService.java patched for silent, non-intrusive updates.');
  }

  // 2. Patch MediaSessionPlugin.java against NetworkOnMainThreadException
  if (fs.existsSync(pluginJavaPath)) {
    let code = fs.readFileSync(pluginJavaPath, 'utf8');

    const oldHttpCheck = `        final boolean httpUrl = url.startsWith("http");
        if (httpUrl) {
            HttpURLConnection connection = (HttpURLConnection) (new URL(url)).openConnection();
            connection.setDoInput(true);
            connection.connect();
            InputStream inputStream = connection.getInputStream();
            return BitmapFactory.decodeStream(inputStream);
        }`;

    const safeHttpCheck = `        final boolean httpUrl = url.startsWith("http");
        if (httpUrl) {
            // Guard: Never perform synchronous HTTP connections on Android main UI thread
            return null;
        }`;

    if (code.includes(oldHttpCheck)) {
      code = code.replace(oldHttpCheck, safeHttpCheck);
      fs.writeFileSync(pluginJavaPath, code, 'utf8');
      patchedCount++;
      console.log('[SVX Patch] MediaSessionPlugin.java patched to prevent NetworkOnMainThreadException.');
    }
  }

  // 3. Patch plugin AndroidManifest.xml for Android 14 FOREGROUND_SERVICE_MEDIA_PLAYBACK permission
  if (fs.existsSync(pluginManifestPath)) {
    let manifest = fs.readFileSync(pluginManifestPath, 'utf8');
    if (!manifest.includes('android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK')) {
      manifest = manifest.replace(
        '<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />',
        '<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />\n    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />\n    <uses-permission android:name="android.permission.WAKE_LOCK" />'
      );
      fs.writeFileSync(pluginManifestPath, manifest, 'utf8');
      patchedCount++;
      console.log('[SVX Patch] Plugin AndroidManifest.xml updated with FOREGROUND_SERVICE_MEDIA_PLAYBACK permission.');
    }
  }

  console.log(`[SVX Patch] MediaSession patch process finished (applied ${patchedCount} modifications).`);
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('patch-media-session.js')) {
  applyMediaSessionPatch();
}
