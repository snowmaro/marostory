// 홈(ko·en)과 앱·게임 상세 페이지를 정적 HTML로 만든다. 픽메이드 상세는 build-pikmade.mjs가 따로 만든다.
// 사용: node .site-tools/build-site.mjs
import { writeFile } from 'node:fs/promises';
import { SITE, EMAIL, apps, games, copy, productPath } from './site-content.mjs';
import { shellHead, shellHeader, shellMore, shellFooter, iconLinks } from './site-shell.mjs';

const root = new URL('../', import.meta.url);
const V = '20261029b';
const IMG = '/assets/site/img/';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const br = (s) => esc(s).replace(/\n/g, '<br>');
const flat = (s) => s.replace(/\n/g, ' ');
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const out = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ext = 'target="_blank" rel="noopener noreferrer"';
const isGame = (p) => games.includes(p);
const shotSrc = (name) => (name.startsWith('/') ? name : `${IMG}${name}.webp`);
const shotsFor = (p, lang) => (lang === 'en' && p.shotsEn) || p.shots;
const local = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] : v);
const heroOf = (p, lang) => (local(p.heroShots, lang) ?? shotsFor(p, lang)).slice(0, 3);
const icon = (slug, alt, size = 64) => `<img class="app-icon" src="${IMG}icon-${slug}.webp" alt="${esc(alt)}" width="${size}" height="${size}" loading="lazy">`;
const phone = (name, alt = '', extra = '') => `<img class="phone" src="${shotSrc(name)}" alt="${esc(alt)}" width="600" height="1300" ${extra}>`;

function storeButtons(lang, { ios, android }) {
  const c = copy[lang].store;
  return `<div class="stores">${ios ? `<a class="store" href="${ios}" ${ext}><span class="store-os">iOS</span>${c.ios}${out}</a>` : ''}${android ? `<a class="store" href="${android}" ${ext}><span class="store-os">Android</span>${c.android}${out}</a>` : ''}</div>`;
}
const storesOf = (p) => (isGame(p) ? { android: p.android } : p.stores);

function head(lang, { title, description, path, alt, image, schema }) {
  const url = SITE + path;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#ffffff">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="ko" href="${SITE + alt.ko}">
<link rel="alternate" hreflang="en" href="${SITE + alt.en}">
<link rel="alternate" hreflang="x-default" href="${SITE + alt.ko}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="MaroStory">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${copy[lang].locale}">
<meta property="og:image" content="${SITE}${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}${image}">
${iconLinks()}
${shellHead()}
<link rel="stylesheet" href="/assets/site/site.css?v=${V}">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
<a class="skip" href="#main">${copy[lang].skip}</a>`;
}
const end = (lang, current) => `${current ? shellMore(lang, current) : ''}
${shellFooter(lang)}
</body>
</html>
`;

/* ---------- Home ---------- */
function home(lang) {
  const c = copy[lang];
  const alt = { ko: '/', en: '/en' };
  const [lead, ...rest] = apps;
  const schema = { '@context': 'https://schema.org', '@type': 'Organization', name: 'MaroStory', alternateName: ['maro.story', '마로스토리'], url: SITE, logo: `${SITE}/assets/brand/app-icon-512.png`, email: EMAIL };

  const appCard = (a) => {
    const t = a[lang];
    return `<article class="app-card" style="--brand:${a.color};--brand-ink:${a.ink}">
        <div class="app-card-body">
          <div class="app-id">${icon(a.slug, t.name, 56)}<div><h3>${esc(t.name)}</h3><p class="app-sub">${esc(t.short)}</p></div></div>
          <p class="app-tagline">${br(t.tagline)}</p>
          <p class="app-summary">${esc(t.summary)}</p>
          <div class="app-actions"><a class="more" href="${productPath(a, lang)}">${c.detail.more}${arrow}</a>${storeButtons(lang, a.stores)}</div>
        </div>
        <a class="app-card-stage" href="${productPath(a, lang)}" tabindex="-1" aria-hidden="true">${phone(a.card?.[lang] ?? shotsFor(a, lang)[0], '', 'loading="lazy"')}</a>
      </article>`;
  };

  const gameBand = (g, i) => {
    const t = g[lang];
    const shots = heroOf(g, lang);
    return `<article class="game-band${i % 2 ? ' is-flip' : ''}" style="--brand:${g.color};--brand-ink:${g.ink}">
        <div class="game-band-copy">
          <div class="app-id">${icon(g.slug, t.name, 64)}<div><h3>${esc(t.name)}</h3><p class="app-sub">${esc(t.genre)}</p></div></div>
          <p class="game-hook">${br(t.tagline)}</p>
          <p class="game-summary">${esc(t.summary)}</p>
          <div class="app-actions"><a class="more" href="${productPath(g, lang)}">${c.detail.more}${arrow}</a>${storeButtons(lang, { android: g.android })}</div>
        </div>
        <a class="game-band-stage" href="${productPath(g, lang)}" tabindex="-1" aria-hidden="true">${shots.map((s) => phone(s, '', 'loading="lazy"')).join('')}</a>
      </article>`;
  };

  return `${head(lang, { title: c.title, description: c.description, path: alt[lang], alt, image: `/assets/site/og-${lang}.jpg`, schema })}
${shellHeader(lang, alt, { onHome: true })}
<main id="main">
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <h1>${br(c.hero.title)}</h1>
        <p class="hero-lead">${br(c.hero.lead)}</p>
        <div class="hero-cta"><a class="btn btn-dark" href="#apps">${c.hero.apps}</a><a class="btn btn-line" href="#games">${c.hero.games}</a></div>
      </div>
      <ul class="icon-wall">
        ${[...apps, ...games].map((p, i) => `<li style="--i:${i};--brand:${p.color}"><a href="${productPath(p, lang)}" aria-label="${esc(p[lang].name)}"><img src="${IMG}icon-${p.slug}.webp" alt="" width="128" height="128"></a></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="section" id="apps">
    <div class="wrap">
      <div class="section-head"><p class="eyebrow">${c.apps.eyebrow}</p><h2>${br(c.apps.title)}</h2><p class="section-lead">${esc(c.apps.lead)}</p></div>
      <div class="app-feature">${appCard(lead)}</div>
      <div class="app-grid">
      ${rest.map(appCard).join('\n      ')}
      </div>
    </div>
  </section>

  <section class="section section-tint" id="games">
    <div class="wrap">
      <div class="section-head"><p class="eyebrow">${c.games.eyebrow}</p><h2>${br(c.games.title)}</h2><p class="section-lead">${esc(c.games.lead)}</p></div>
      <div class="game-bands">
      ${games.map(gameBand).join('\n      ')}
      </div>
    </div>
  </section>

  <section class="section section-dark" id="studio">
    <div class="wrap studio-grid">
      <div class="section-head"><p class="eyebrow">${c.studio.eyebrow}</p><h2>${br(c.studio.title)}</h2></div>
      <div class="studio-body">${c.studio.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </div>
    <div class="wrap">
      <ol class="values">
        ${c.studio.values.map(([h, p], i) => `<li><span class="num">0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('\n        ')}
      </ol>
    </div>
  </section>

  <section class="section" id="contact">
    <div class="wrap">
      <div class="section-head"><p class="eyebrow">${c.contact.eyebrow}</p><h2>${br(c.contact.title)}</h2></div>
      <ul class="contact-grid">
        ${c.contact.items.map(([h, p, label, href]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p><a class="more" href="${href}"${href.startsWith('http') ? ` ${ext}` : ''}>${esc(label)}${href.startsWith('http') ? out : arrow}</a></li>`).join('\n        ')}
      </ul>
    </div>
  </section>
</main>
${end(lang)}`;
}

/* ---------- Product page (apps & games) ---------- */
function product(p, lang) {
  const c = copy[lang], t = p[lang], d = c.detail, game = isGame(p);
  const alt = { ko: productPath(p, 'ko'), en: productPath(p, 'en') };
  const shots = shotsFor(p, lang);
  const title = `${t.name}${lang === 'ko' ? ` ${p.en.name}` : ''} — ${flat(t.tagline)} | MaroStory`;
  const schema = game
    ? { '@context': 'https://schema.org', '@type': 'VideoGame', name: t.name, alternateName: p.en.name, gamePlatform: 'Android', operatingSystem: 'Android', genre: t.genre, description: t.summary, url: SITE + alt[lang], downloadUrl: p.android, publisher: { '@type': 'Organization', name: 'MaroStory', url: SITE } }
    : { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: t.name, alternateName: p.en.name, operatingSystem: 'iOS, Android', applicationCategory: 'LifestyleApplication', description: t.summary, url: SITE + alt[lang], downloadUrl: [p.stores.ios, p.stores.android], publisher: { '@type': 'Organization', name: 'MaroStory', url: SITE } };
  const region = lang === 'en' && p.regionEn ? `<p class="region">${esc(p.regionEn)}</p>` : '';
  const sections = [['intro', game ? d.story : d.intro], ['features', d.features], ['how', game ? d.play : d.how], ['faq', d.faq]];
  const heroShots = heroOf(p, lang);

  return `${head(lang, { title, description: t.summary, path: alt[lang], alt, image: p.og ? p.og : `/assets/site/og-${lang}.jpg`, schema })}
${shellHeader(lang, alt, { current: p.slug, autoHide: true })}
<div class="local-nav" style="--brand:${p.color};--brand-ink:${p.ink}">
  <div class="wrap local-nav-row">
    <a class="local-id" href="#main">${icon(p.slug, '', 32)}<strong>${esc(t.name)}</strong></a>
    <nav class="local-links" aria-label="${esc(t.name)}">${sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</nav>
    <a class="local-cta" href="#download">${game ? d.getGame : d.getApp}</a>
  </div>
</div>
<main id="main" class="product${game ? ' is-game' : ''}" style="--brand:${p.color};--brand-ink:${p.ink};--brand-soft:${p.soft ?? 'color-mix(in srgb, var(--brand) 10%, #fff)'}">
  <section class="p-hero">
    <div class="wrap p-hero-grid">
      <div class="p-hero-copy">
        <div class="app-id">${icon(p.slug, t.name, 72)}<div><p class="p-name">${esc(t.name)}</p><p class="app-sub">${esc(game ? t.genre : t.short)}</p></div></div>
        <h1>${br(t.tagline)}</h1>
        <p class="p-lead">${esc(t.summary)}</p>
        ${storeButtons(lang, storesOf(p))}
        ${region}
      </div>
      <div class="p-hero-art${heroShots.length > 2 ? ' is-trio' : ''}">${heroShots.map((s, i) => phone(s, i === 0 ? t.name : '', i === 0 ? 'fetchpriority="high"' : 'loading="lazy"')).join('')}</div>
    </div>
  </section>

  <section class="section p-intro" id="intro">
    <div class="wrap">
      ${game
        ? `<p class="eyebrow">${d.story}</p><div class="story">${t.story.map((s) => `<p>${esc(s)}</p>`).join('')}</div>`
        : `<div class="ps-grid"><div class="ps"><p class="eyebrow">${d.problem}</p><p class="ps-text">${esc(t.problem)}</p></div><div class="ps"><p class="eyebrow">${d.solution}</p><p class="ps-text">${esc(t.solution)}</p></div></div>`}
    </div>
  </section>

  <section class="section section-tint" id="features">
    <div class="wrap">
      <div class="section-head"><p class="eyebrow">${d.features}</p><h2>${br(t.featuresTitle)}</h2></div>
      <div class="feature-rows">
        ${t.features.map((f, i) => `<article class="feature-row${i % 2 ? ' is-flip' : ''}">
          <div class="feature-copy"><span class="num">0${i + 1}</span><h3>${esc(f[0])}</h3><p>${esc(f[1])}</p></div>
          <div class="feature-stage">${phone(local(f[2], lang) ?? shots[i % shots.length], f[0], 'loading="lazy"')}</div>
        </article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section" id="how">
    <div class="wrap">
      <div class="section-head"><p class="eyebrow">${game ? d.play : d.how}</p><h2>${br(t.stepsTitle)}</h2></div>
      <ol class="steps">
        ${t.steps.map(([h, s], i) => `<li><span class="step-no">${i + 1}</span><h3>${esc(h)}</h3><p>${esc(s)}</p></li>`).join('\n        ')}
      </ol>
    </div>
  </section>

  <section class="p-download" id="download">
    <div class="wrap p-download-inner">
      ${icon(p.slug, '', 96)}
      <h2>${br(t.cta)}</h2>
      ${storeButtons(lang, storesOf(p))}
      ${region}
    </div>
  </section>

  <section class="section" id="faq">
    <div class="wrap faq-grid">
      <div class="section-head"><p class="eyebrow">${d.faq}</p><h2>${br(d.faqTitle)}</h2><a class="more" href="${p.support}"${p.support.startsWith('http') ? ` ${ext}` : ''}>${d.ask}${arrow}</a></div>
      <div class="faq-list">
        ${t.faq.map(([q, a]) => `<details><summary>${esc(q)}<span aria-hidden="true"></span></summary><p>${esc(a)}</p></details>`).join('\n        ')}
      </div>
    </div>
  </section>
</main>
${end(lang, p.slug)}`;
}

const files = [['index.html', home('ko')], ['index_en.html', home('en')]];
for (const p of [...apps.filter((a) => !a.page), ...games]) {
  files.push([`project/${p.slug}.html`, product(p, 'ko')], [`project/${p.slug}-en.html`, product(p, 'en')]);
}
for (const [name, html] of files) {
  await writeFile(new URL(name, root), html);
  console.log(`wrote ${name}`);
}
