// 브랜드 키트의 SVG를 PNG로 내보낸다. build-brand.py 다음에 실행한다.
// 사용: node .site-tools/export-brand.mjs
//   (playwright 필요. CHROME_PATH가 없으면 ~/Library/Caches/ms-playwright의 chromium-1234를 쓴다)
import { readFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? path.join(homedir(), 'dev/portpolio/build/node_modules/playwright'));
const KIT = process.env.MAROSTORY_BRAND_KIT ?? path.join(homedir(), 'dev/snow_design/marostory-brand');
const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const executablePath = process.env.CHROME_PATH ?? path.join(homedir(), 'Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function render(svgFile, outFile, { width, height }) {
  const svg = await readFile(svgFile, 'utf8');
  const [, , , vw, vh] = svg.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/).map(Number);
  const w = width ?? Math.round((height * vw) / vh);
  const h = height ?? Math.round((width * vh) / vw);
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${w}" height="${h}" `)}</body></html>`);
  await page.screenshot({ path: outFile, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
}

const svgDir = path.join(KIT, 'logo/svg');
const pngDir = path.join(KIT, 'logo/png');
const iconDir = path.join(KIT, 'icon');
await mkdir(pngDir, { recursive: true });
await mkdir(iconDir, { recursive: true });

for (const file of (await readdir(svgDir)).filter((f) => f.endsWith('.svg'))) {
  const name = file.replace('.svg', '');
  const size = name.startsWith('app-icon') ? { width: 1024 }
    : name.startsWith('symbol') || name.startsWith('lockup-vertical') ? { height: 800 }
    : { width: 1600 };
  await render(path.join(svgDir, file), path.join(pngDir, `${name}.png`), size);
}

// 앱 아이콘·파비콘 크기별
for (const variant of ['app-icon', 'app-icon-cobalt', 'app-icon-mono', 'app-icon-square']) {
  for (const s of [16, 32, 48, 64, 128, 180, 192, 256, 512, 1024]) {
    await render(path.join(svgDir, `${variant}.svg`), path.join(iconDir, `${variant}-${s}.png`), { width: s, height: s });
  }
}
await browser.close();

// 사이트용 아이콘
await copyFile(path.join(iconDir, 'app-icon-64.png'), path.join(SITE, 'favicon.png'));
for (const s of [192, 512]) await copyFile(path.join(iconDir, `app-icon-${s}.png`), path.join(SITE, `assets/brand/app-icon-${s}.png`));
await copyFile(path.join(iconDir, 'app-icon-square-180.png'), path.join(SITE, 'assets/brand/apple-touch-icon.png'));
console.log(`PNG → ${pngDir}, ${iconDir}; site favicon.png, assets/brand/app-icon-*.png`);
