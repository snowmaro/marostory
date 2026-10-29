// 브랜드 키트의 이메일 서명과 명함을 만든다. build-brand.py → export-brand.mjs 다음에 실행한다.
// 사용: node .site-tools/build-brand-collateral.mjs
// 결과: ~/dev/snow_design/marostory-brand/{email-signature,business-card}/, 사이트 assets/brand/email/ (서명 이미지 호스팅용)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? path.join(homedir(), 'dev/portpolio/build/node_modules/playwright'));
const KIT = process.env.MAROSTORY_BRAND_KIT ?? path.join(homedir(), 'dev/snow_design/marostory-brand');
const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const executablePath = process.env.CHROME_PATH ?? path.join(homedir(), 'Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const FONT = 'https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css';
const svg = (name) => readFile(path.join(KIT, 'logo/svg', `${name}.svg`), 'utf8');

const person = {
  ko: { name: '민순오', title: '대표', sub: 'Soon-O Min · CEO' },
  en: { name: 'Soon-O Min', title: 'CEO', sub: 'MaroStory' },
  email: 'snow@marostory.com',
  web: 'marostory.com',
};

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ deviceScaleFactor: 2 });

/* ---------- 이메일 서명 ---------- */
// 메일 프로그램은 SVG·웹폰트를 지원하지 않으므로 표 + 인라인 스타일 + 호스팅된 PNG를 쓴다.
const EMAIL_IMG = 'https://marostory.com/assets/brand/email';
await mkdir(path.join(SITE, 'assets/brand/email'), { recursive: true });
await mkdir(path.join(KIT, 'email-signature'), { recursive: true });
async function png(svgText, out, height) {
  const [, , , vw, vh] = svgText.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/).map(Number);
  const w = Math.round((height * vw) / vh);
  await page.setViewportSize({ width: w, height });
  await page.setContent(`<body style="margin:0">${svgText.replace('<svg ', `<svg width="${w}" height="${height}" `)}</body>`);
  await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: w, height } });
  return w;
}
// 2배 해상도로 만들고 HTML에서 절반 크기로 표시한다.
const logoEnW = await png(await svg('wordmark-en-color'), path.join(SITE, 'assets/brand/email/wordmark-en.png'), 40);
const logoKoW = await png(await svg('wordmark-ko-color'), path.join(SITE, 'assets/brand/email/wordmark-ko.png'), 36);
await png(await svg('app-icon'), path.join(SITE, 'assets/brand/email/app-icon.png'), 96);

const sigFont = "-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic','Segoe UI',Arial,sans-serif";
function signature(lang) {
  const p = person[lang];
  const [logo, w, h] = lang === 'ko' ? ['wordmark-ko.png', logoKoW / 2, 18] : ['wordmark-en.png', logoEnW / 2, 20];
  return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:${sigFont};color:#0C0D10">
  <tr>
    <td style="padding:0 16px 0 0;vertical-align:top"><a href="https://${person.web}" style="text-decoration:none"><img src="${EMAIL_IMG}/app-icon.png" width="48" height="48" alt="maro.story" style="display:block;border:0;border-radius:11px"></a></td>
    <td style="padding:0 0 0 16px;border-left:2px solid #1F45D6;vertical-align:top">
      <div style="font-size:15px;line-height:20px;font-weight:700;color:#0C0D10">${p.name} <span style="font-weight:400;color:#8A8F97">${p.title}</span></div>
      <div style="font-size:12px;line-height:18px;color:#8A8F97">${p.sub}</div>
      <div style="padding:10px 0 8px"><img src="${EMAIL_IMG}/${logo}" width="${Math.round(w)}" height="${h}" alt="${lang === 'ko' ? '마로스토리' : 'maro.story'}" style="display:block;border:0"></div>
      <div style="font-size:12px;line-height:18px;color:#464B53"><a href="mailto:${person.email}" style="color:#464B53;text-decoration:none">${person.email}</a><span style="color:#C3C7CE">&nbsp;&nbsp;|&nbsp;&nbsp;</span><a href="https://${person.web}" style="color:#1F45D6;text-decoration:none;font-weight:600">${person.web}</a></div>
    </td>
  </tr>
</table>`;
}
for (const lang of ['ko', 'en']) {
  const html = signature(lang);
  await writeFile(path.join(KIT, 'email-signature', `signature-${lang}.html`), `<!-- maro.story 이메일 서명 (${lang}). 브라우저에서 열어 서명 영역을 복사해 메일 설정에 붙여 넣는다. 이미지는 marostory.com에 호스팅된 PNG를 쓴다. -->\n${html}\n`);
  await page.setViewportSize({ width: 520, height: 140 });
  // 미리보기는 배포 전에도 보이도록 이미지를 data URI로 넣는다.
  let preview = html;
  for (const f of ['app-icon.png', 'wordmark-en.png', 'wordmark-ko.png']) {
    preview = preview.replaceAll(`${EMAIL_IMG}/${f}`, `data:image/png;base64,${(await readFile(path.join(SITE, 'assets/brand/email', f))).toString('base64')}`);
  }
  await page.setContent(`<body style="margin:0;padding:24px;background:#fff">${preview}</body>`);
  const box = await page.$('table');
  await box.screenshot({ path: path.join(KIT, 'email-signature', `signature-${lang}.png`) });
}

/* ---------- 명함 90×50mm (재단 여백 2mm 포함 94×54mm) ---------- */
await mkdir(path.join(KIT, 'business-card'), { recursive: true });
const sym = (await svg('symbol-reverse')).replace('<svg ', '<svg class="sym" ');
const wordKo = (await svg('wordmark-ko-color')).replace('<svg ', '<svg class="word" ');
// 정보면 오른쪽: 옅은 m + 코발트 마침표로 크게 깐다
const symTint = (await svg('symbol-color')).replaceAll('#0C0D10', '#ECEEF2').replace('<svg ', '<svg class="mark" ');
const p = person.ko;
const card = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONT}"><style>
@page { size: 94mm 54mm; margin: 0 }
* { margin: 0; box-sizing: border-box }
body { font-family: "Wanted Sans Variable", sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact }
.side { width: 94mm; height: 54mm; position: relative; overflow: hidden; page-break-after: always }
.front { background: #0C0D10; display: flex; align-items: center; justify-content: center }
.front .sym { height: 13mm; width: auto }
.back { background: #fff; padding: 2mm }
.safe { position: absolute; inset: 6mm; display: flex; flex-direction: column; justify-content: space-between }
.back .word { height: 4.4mm; width: auto; display: block }
.name { font-size: 12pt; font-weight: 750; color: #0C0D10; letter-spacing: -.02em }
.name span { font-size: 8pt; font-weight: 500; color: #8A8F97; margin-left: 1.6mm }
.sub { font-size: 7pt; color: #8A8F97; margin-top: .8mm; letter-spacing: .01em }
.contact { margin-top: 3.2mm; font-size: 7.2pt; line-height: 1.6; color: #464B53 }
.contact b { color: #1F45D6; font-weight: 650 }
.back .mark { position: absolute; right: 7mm; bottom: 7.2mm; height: 21mm; width: auto }
.back .safe { z-index: 1 }
</style></head><body>
<section class="side front">${sym}</section>
<section class="side back">${symTint}<div class="safe"><div>${wordKo}</div>
<div><p class="name">${p.name}<span>${p.title}</span></p><p class="sub">${p.sub}</p>
<p class="contact">${person.email}<br><b>${person.web}</b></p></div></div></section>
</body></html>`;
await writeFile(path.join(KIT, 'business-card', 'business-card.html'), card);
await page.setContent(card, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: path.join(KIT, 'business-card', 'business-card-print.pdf'), width: '94mm', height: '54mm', printBackground: true });
// 미리보기(재단선 안쪽 90×50만 보이게)
await page.setViewportSize({ width: 1200, height: 800 });
const sides = await page.$$('.side');
for (const [i, el] of sides.entries()) {
  const b = await el.boundingBox();
  const mm = b.width / 94;
  await page.screenshot({ path: path.join(KIT, 'business-card', `business-card-${i === 0 ? 'front' : 'back'}.png`), clip: { x: b.x + 2 * mm, y: b.y + 2 * mm, width: 90 * mm, height: 50 * mm } });
}
await browser.close();
console.log(`email-signature/, business-card/ → ${KIT}; site assets/brand/email/`);
