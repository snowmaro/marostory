// 홈 공유 이미지(assets/site/og-ko.jpg, og-en.jpg, 1200×630)를 만든다. 로고는 assets/brand의 SVG를 쓴다.
// 사용: node .site-tools/build-og.mjs   (playwright 필요, export-brand.mjs와 같은 경로 규칙)
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { apps, games } from './site-content.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? path.join(homedir(), 'dev/portpolio/build/node_modules/playwright'));
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const executablePath = process.env.CHROME_PATH ?? path.join(homedir(), 'Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const FONT = 'https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css';

const copy = { ko: ['일상의 작은 불편은 앱으로,', '잠깐의 틈은 게임으로.'], en: ['Apps for the little things.', 'Games for the in-between.'] };
const dataUri = async (file, type) => `data:${type};base64,${(await readFile(path.join(ROOT, file))).toString('base64')}`;
const icons = await Promise.all([...apps, ...games].map((p) => dataUri(`assets/site/img/icon-${p.slug}.webp`, 'image/webp')));

const browser = await chromium.launch({ executablePath });
for (const lang of ['ko', 'en']) {
  const logo = await readFile(path.join(ROOT, `assets/brand/wordmark-${lang}-color.svg`), 'utf8');
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(`<html><head><link rel="stylesheet" href="${FONT}"><style>
  *{margin:0;box-sizing:border-box} body{width:1200px;height:630px;font-family:"Wanted Sans Variable";background:#fff;display:grid;grid-template-columns:1.25fr 1fr;align-items:center;padding:0 72px;gap:40px;word-break:keep-all}
  .logo svg{height:${lang === 'ko' ? 40 : 44}px;width:auto;display:block;margin-bottom:48px}
  h1{font-size:${lang === 'ko' ? 54 : 50}px;line-height:1.2;letter-spacing:-.035em;font-weight:800;color:#000}
  .u{margin-top:28px;font-size:22px;color:#1f45d6;font-weight:650}
  ul{list-style:none;display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:0}
  li{aspect-ratio:1;border-radius:24%;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.06),0 10px 24px -12px rgba(0,0,0,.35)}
  li:nth-child(1){grid-column:2} li:nth-child(4n+2),li:nth-child(4n+4){transform:translateY(22px)} img{width:100%;height:100%;display:block}
  </style></head><body><div><div class="logo">${logo}</div><h1>${copy[lang].join('<br>')}</h1><div class="u">marostory.com</div></div>
  <ul>${icons.map((src) => `<li><img src="${src}"></li>`).join('')}</ul></body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(ROOT, `assets/site/og-${lang}.jpg`), type: 'jpeg', quality: 88 });
  await page.close();
}
await browser.close();
console.log('assets/site/og-ko.jpg, og-en.jpg');
