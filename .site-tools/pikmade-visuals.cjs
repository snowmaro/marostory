// Uses an existing Playwright installation; no dependency is added to the website.
const { chromium } = require('playwright');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const lang of ['ko', 'en']) {
    await page.goto('http://127.0.0.1:4173/project/pikmade');
    await page.setContent(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
      *{box-sizing:border-box}body{margin:0;background:#faf9f6;color:#222722;font-family:'Avenir Next',-apple-system,'Apple SD Gothic Neo',sans-serif;width:1200px;height:630px;overflow:hidden}.canvas{position:relative;width:1200px;height:630px;padding:45px 55px}.logo{width:200px;display:block}.eyebrow{margin:48px 0 18px;font-size:12px;letter-spacing:2.2px;color:#68725f}h1{font-size:${lang==='ko'?'68':'71'}px;line-height:1.16;letter-spacing:-4px;margin:0;font-weight:650}h1 em{font-style:${lang==='ko'?'normal':'italic'};font-family:${lang==='ko'?'inherit':'Georgia,serif'};color:#c8462a;font-weight:${lang==='ko'?'650':'400'}}.sub{font-size:17px;color:#6c7066;margin:24px 0;line-height:1.8}.url{position:absolute;left:55px;bottom:38px;font-size:11px;letter-spacing:1px}.card{position:absolute;padding:9px;background:#fff;box-shadow:0 16px 40px #22272220;width:224px}.card img{width:100%;display:block}.paper{right:190px;top:103px;transform:rotate(-10deg);z-index:3}.figure{right:23px;top:38px;transform:rotate(11deg);width:215px;z-index:2}.crayon{right:58px;bottom:38px;transform:rotate(8deg);width:207px;z-index:4}.original{position:absolute;width:90px;height:90px;border-radius:50%;border:5px solid #faf9f6;right:350px;bottom:84px;z-index:5}.ring{position:absolute;width:480px;height:480px;border:1px solid #d8decd;border-radius:50%;right:1px;top:67px}.star{color:#c8462a;font-size:55px;position:absolute;right:360px;top:50px}
      </style></head><body><div class="canvas"><img class="logo" src="http://127.0.0.1:4173/assets/pikmade/wordmark.svg"><p class="eyebrow">ONE PHOTO. A WHOLE NEW YOU.</p><h1>${lang==='ko'?'사진 한 장,<br><em>새로운 나.</em>':'One photo.<br><em>So many you.</em>'}</h1><p class="sub">${lang==='ko'?'취향대로 고르고, 나답게 만들어요.':'Pick a style. Make it yours.'}</p><span class="url">MAROSTORY.COM/PROJECT/PIKMADE</span><div class="ring"></div><span class="star">✳</span>${['paper','figure','crayon'].map(name=>`<div class="card ${name}"><img src="http://127.0.0.1:4173/assets/pikmade/${name}.webp"></div>`).join('')}<img class="original" src="http://127.0.0.1:4173/assets/pikmade/original.webp"></div></body></html>`);
    if (lang === 'en') await page.locator('h1 em').evaluate(el => { el.textContent = 'A new you.'; });
    await page.locator('.sub').evaluate((el, lang) => { el.textContent = lang === 'ko' ? '사진 스타일 변환 · 옛 사진 복원' : 'Photo styles. Old memories, restored.'; }, lang);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
    await page.screenshot({ path: path.join(root, 'assets/pikmade', `og-${lang}.jpg`), type:'jpeg', quality:92 });
  }
  await browser.close();
  console.log('Created 1200×630 Korean and English social preview images.');
})();
