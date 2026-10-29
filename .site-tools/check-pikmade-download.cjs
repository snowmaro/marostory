const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const vm = require('node:vm');
const path = require('node:path');
const base = process.env.PIKMADE_PREVIEW_URL || 'http://127.0.0.1:4173';
const route = '/project/pikmade/download';
const apple = 'https://apps.apple.com/app/id6808832990';
const google = 'https://play.google.com/store/apps/details?id=com.marostory.pikmade';
const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
const android = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36';
const mac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';
const cases = [
  ['iPhone', {userAgent:iphone}, apple],
  ['iPad', {userAgent:iphone.replace('iPhone', 'iPad')}, apple],
  ['iPod', {userAgent:'iPod touch'}, apple],
  ['iPad desktop mode', {userAgent:mac, platform:'MacIntel', maxTouchPoints:5}, apple],
  ['Android', {userAgent:android}, google],
  ['Android tablet', {userAgent:android.replace('Mobile ', '')}, google],
  ['Android client hints', {userAgent:'Mozilla/5.0', userAgentData:{platform:'Android'}}, google],
  ['Mac desktop', {userAgent:mac, platform:'MacIntel', maxTouchPoints:0}, null],
  ['Windows touch', {userAgent:'Mozilla/5.0 (Windows NT 10.0)', maxTouchPoints:10}, null],
  ['Unknown device', {userAgent:''}, null],
  ['Kakao iOS browser', {userAgent:iphone+' KAKAOTALK 11.0'}, apple],
  ['Facebook Android browser', {userAgent:android+' [FBAN/FB4A;FBAV/500.0;]'}, google],
  ['Google mobile crawler', {userAgent:android+' Googlebot/2.1'}, null],
  ['Facebook preview', {userAgent:iphone+' facebookexternalhit/1.1'}, null],
  ['Kakao preview', {userAgent:'kakaotalk-scrap/1.0'}, null],
  ['X preview', {userAgent:'Twitterbot/1.0'}, null],
  ['WhatsApp preview', {userAgent:'WhatsApp/2.24.1 A'}, null],
  ['WhatsApp Android browser', {userAgent:android+' WhatsApp/2.24.1'}, google],
];
(async () => {
  const source = await fs.readFile(path.join(__dirname,'../assets/pikmade/download.js'), 'utf8');
  for (const [name, device, expected] of cases) {
    let destination = null, scheduled;
    const nodes = { 'app-store':{href:apple}, 'play-store':{href:google} };
    vm.runInNewContext(source, {
      navigator:{language:'ko-KR', maxTouchPoints:0, ...device},
      document:{documentElement:{}, getElementById:id=>nodes[id] ||= {}, querySelectorAll:()=>[]},
      window:{location:{replace:url=>destination=url}},
      setTimeout:callback=>{scheduled=callback;return 1;}, clearTimeout:()=>{},
    });
    scheduled?.();
    assert.equal(destination, expected, name);
  }
  console.log(`PASS: ${cases.length} device and preview-bot routing cases`);
  await fs.mkdir('/tmp/pikmade-download-preview', {recursive:true});
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch({headless:true});
    try {
      for (const [name, device, expected] of [cases[0],cases[3],cases[4],cases[7],cases[10],cases[13]]) {
        const context = await browser.newContext({userAgent:device.userAgent,viewport:{width:390,height:844},locale:'ko-KR'});
        await context.addInitScript(device => {
          Object.defineProperty(navigator,'platform',{get:()=>device.platform || ''});
          Object.defineProperty(navigator,'maxTouchPoints',{get:()=>device.maxTouchPoints || 0});
          Object.defineProperty(navigator,'userAgentData',{get:()=>undefined});
        }, device);
        const page = await context.newPage();
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        // Verify navigation without interacting with actual store/account state.
        await page.route('https://apps.apple.com/**',r=>r.fulfill({contentType:'text/html',body:'App Store destination'}));
        await page.route('https://play.google.com/**',r=>r.fulfill({contentType:'text/html',body:'Google Play destination'}));
        const response = await page.goto(base+route);
        assert.equal(response.status(),200);
        const html = await response.text();
        assert(html.includes('property="og:image"') && html.includes('name="twitter:card"'));
        if(expected) await page.waitForURL(expected);
        else {
          await page.waitForTimeout(700);
          assert.equal(page.url(),base+route);
          assert.equal(await page.locator('.stores a').count(),2);
        }
        assert.deepEqual(errors,[]);
        await context.close();
      }
      const context = await browser.newContext({javaScriptEnabled:false,userAgent:iphone,viewport:{width:320,height:740}});
      const page = await context.newPage();
      await page.goto(base+route);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://marostory.com'+route);
      assert.equal(await page.locator('#app-store').getAttribute('href'),apple);
      assert.equal(await page.locator('#play-store').getAttribute('href'),google);
      assert(await page.locator('noscript').isVisible());
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:`/tmp/pikmade-download-preview/${engine.name()}-mobile.png`,fullPage:true});
      await context.close();
      const desktop = await browser.newPage({viewport:{width:1280,height:900},locale:'en-US'});
      await desktop.goto(base+route);
      await desktop.waitForTimeout(700);
      assert.equal(await desktop.locator('html').getAttribute('lang'),'en');
      assert.equal(desktop.url(),base+route);
      await desktop.screenshot({path:`/tmp/pikmade-download-preview/${engine.name()}-desktop.png`});
      console.log(`PASS: ${engine.name()}, actual browser redirects, PC fallback, no-JS, metadata, mobile layout`);
    } finally { await browser.close(); }
  }
})().catch(error=>{console.error(error);process.exit(1)});
