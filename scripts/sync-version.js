// ShayariVerse X (SVX) — Native Android Version Synchronizer
// Synchronizes android/app/build.gradle versionCode & versionName with package.json
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const pkgPath = path.join(ROOT_DIR, 'package.json');
const gradlePath = path.join(ROOT_DIR, 'android', 'app', 'build.gradle');

if (fs.existsSync(pkgPath) && fs.existsSync(gradlePath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  let content = fs.readFileSync(gradlePath, 'utf8');
  const parts = (pkg.version || '1.1.4').split('.').map(Number);
  const versionCode = (parts[0] || 1) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
  
  content = content.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  content = content.replace(/versionName\s+["'][^"']+["']/, `versionName "${pkg.version}"`);
  
  fs.writeFileSync(gradlePath, content, 'utf8');
  console.log(`[SVX Version] Successfully updated android/app/build.gradle to versionCode ${versionCode}, versionName "${pkg.version}"`);
} else {
  console.log('[SVX Version] Notice: android/app/build.gradle not present locally; will run in CI pipeline.');
}
