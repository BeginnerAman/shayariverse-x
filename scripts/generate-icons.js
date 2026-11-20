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

  // 2. Generate Notification Brand Assets in assets/
  await sharp(svgBuffer).resize(256, 256).png().toFile(path.resolve('assets/svx_cover.png'));
  
  const statIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="#ffffff"/>
  </svg>`;
  await sharp(Buffer.from(statIconSvg)).png().toFile(path.resolve('assets/ic_stat_music.png'));
  console.log('[IconGen] Generated assets/svx_cover.png & assets/ic_stat_music.png');

  if (!fs.existsSync(resDir)) {
    console.log('[IconGen] android/app/src/main/res does not exist yet. Run cap add android first.');
    return;
  }

  // 3. Write notification icons into android/app/src/main/res/drawable/
  const drawableDir = path.join(resDir, 'drawable');
  if (!fs.existsSync(drawableDir)) {
    fs.mkdirSync(drawableDir, { recursive: true });
  }
  await sharp(svgBuffer).resize(256, 256).png().toFile(path.join(drawableDir, 'svx_cover.png'));
  await sharp(Buffer.from(statIconSvg)).png().toFile(path.join(drawableDir, 'ic_stat_music.png'));
  console.log('[IconGen] Rendered svx_cover.png and ic_stat_music.png to res/drawable');

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
