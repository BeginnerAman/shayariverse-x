import fs from 'fs';
import path from 'path';

const SVG_PATH = path.resolve('assets/icon.svg');

const TARGETS = [
  { dir: 'mipmap-mdpi', size: 48, fg: 108 },
  { dir: 'mipmap-hdpi', size: 72, fg: 162 },
  { dir: 'mipmap-xhdpi', size: 96, fg: 216 },
  { dir: 'mipmap-xxhdpi', size: 144, fg: 324 },
  { dir: 'mipmap-xxxhdpi', size: 192, fg: 432 }
];

async function generate() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error('[IconGen] assets/icon.svg not found!');
    return;
  }

  let sharp;
  try {
    const mod = await import('sharp');
    sharp = mod.default || mod;
  } catch (err) {
    console.warn('[IconGen] sharp is not installed, skipping icon PNG generation:', err.message);
    return;
  }

  const svgBuffer = fs.readFileSync(SVG_PATH);
  const resDir = path.resolve('android/app/src/main/res');

  if (!fs.existsSync(path.resolve('assets'))) {
    fs.mkdirSync(path.resolve('assets'), { recursive: true });
  }

  // 1. Write 512x512 master app icon
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.resolve('assets/icon.png'));
  console.log('[IconGen] Generated assets/icon.png (512x512)');

  if (!fs.existsSync(resDir)) {
    console.log('[IconGen] android/app/src/main/res does not exist yet. Run cap add android first.');
    return;
  }

  for (const t of TARGETS) {
    const outDir = path.join(resDir, t.dir);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // Standard square launcher
    await sharp(svgBuffer).resize(t.size, t.size).png().toFile(path.join(outDir, 'ic_launcher.png'));
    // Round launcher
    await sharp(svgBuffer).resize(t.size, t.size).png().toFile(path.join(outDir, 'ic_launcher_round.png'));
    // Adaptive foreground
    await sharp(svgBuffer).resize(t.fg, t.fg).png().toFile(path.join(outDir, 'ic_launcher_foreground.png'));

    console.log(`[IconGen] Successfully rendered Android icons for ${t.dir} (${t.size}px / fg: ${t.fg}px)`);
  }
}

generate().catch(err => {
  console.error('[IconGen] Error generating icons:', err);
});
