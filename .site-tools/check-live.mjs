import assert from 'node:assert/strict';
const base = 'https://marostory.com';
for (const [path, lang] of [['/project/pikmade', 'ko'], ['/project/pikmade/en', 'en'], ['/project/pikmade/download', 'ko']]) {
  for (const agent of ['Mozilla/5.0', 'facebookexternalhit/1.1', 'Twitterbot/1.0', 'kakaotalk-scrap/1.0']) {
    const response = await fetch(base + path, { headers: { 'User-Agent': agent } });
    assert.equal(response.status, 200, `${path} ${agent}`);
    const html = await response.text();
    assert(html.includes(`<html lang="${lang}">`));
    assert(html.includes(`rel="canonical" href="${base + path}"`));
    assert(html.includes(`property="og:image" content="${base}/assets/pikmade/og-${lang}.jpg?v=20261011"`));
    assert(html.includes('name="twitter:card" content="summary_large_image"'));
    assert(html.includes('id6808832990') && html.includes('com.marostory.pikmade'));
  }
  console.log(`PASS: ${path}, server-rendered metadata for browser, Facebook and X user agents`);
}
for (const [path, destination] of [
  ['/project/pikmade.html', '/project/pikmade'],
  ['/project/pikmade/', '/project/pikmade'],
  ['/project/pikmade-en.html', '/project/pikmade/en'],
  ['/project/pikmade/en/', '/project/pikmade/en'],
  ['/project/pikmade-download.html', '/project/pikmade/download'],
  ['/project/pikmade/download/', '/project/pikmade/download'],
]) {
  const response = await fetch(base + path, { redirect: 'manual' });
  assert.equal(response.status, 301, path);
  assert.equal(new URL(response.headers.get('location'), base).pathname, destination);
  console.log(`PASS: ${path} redirects to ${destination}`);
}
for (const path of ['/assets/pikmade/og-ko.jpg', '/assets/pikmade/og-en.jpg', '/assets/pikmade/page.css', '/assets/pikmade/page.js', '/assets/pikmade/download.css', '/assets/pikmade/download.js', '/assets/pikmade/qr-ko.svg', '/robots.txt', '/sitemap.xml', '/']) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  console.log(`PASS: ${path}: ${response.headers.get('content-type')}`);
}
for (const path of ['/.git/HEAD', '/.site-tools/build-pikmade.mjs']) {
  const response = await fetch(base + path);
  assert.equal(response.status, 404, `Private file should not be published: ${path}`);
}
console.log('PASS: private Git and authoring files are not published.');
