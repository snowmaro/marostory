// 로컬 미리보기(preview.cjs, 127.0.0.1:4173)의 페이지를 전체 화면으로 찍는다. 레이아웃 확인용.
// 사용: node .site-tools/shoot.mjs <출력폴더> "<경로>,<너비>,<이름>" ...
import { homedir } from 'node:os';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? path.join(homedir(), 'dev/portpolio/build/node_modules/playwright'));
const executablePath = process.env.CHROME_PATH ?? path.join(homedir(), 'Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const [outDir, ...targets] = process.argv.slice(2);
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath });
for (const t of targets) {
  const [route, w, name] = t.split(',');
  const page = await browser.newPage({ viewport: { width: +w, height: 900 } });
  await page.goto('http://127.0.0.1:4173' + route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // 지연 로딩 이미지를 모두 불러온 뒤 맨 위로 돌아온다(부드러운 스크롤 없이)
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
  console.log(name, 'overflowX:', await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth));
  await page.close();
}
await browser.close();
