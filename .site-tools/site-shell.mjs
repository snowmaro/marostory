// 모든 페이지가 함께 쓰는 공통 헤더(2depth 메뉴)·푸터·다른 제품 섹션. 스타일은 assets/site/shell.css.
// 픽메이드 페이지(build-pikmade.mjs)도 이 모듈을 쓰므로 클래스는 ms- 접두사로 분리한다.
import { EMAIL, apps, games, copy, productPath } from './site-content.mjs';

export const SHELL_V = '20261029e';
export const FONT_CSS = 'https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css';
const IMG = '/assets/site/img/';
// 로고(브랜드 키트 ~/dev/snow_design/marostory-brand에서 복사). 기본 표기는 코발트 마침표(color).
const LOGO = {
  en: { src: '/assets/brand/wordmark-en-color.svg', alt: 'maro.story', ratio: 5932 / 1015 },
  ko: { src: '/assets/brand/wordmark-ko-color.svg', alt: '마로스토리', ratio: 4519 / 874 },
  lockup: { src: '/assets/brand/lockup-horizontal-ko-color.svg', alt: '마로스토리', ratio: 6428 / 874 }, // 헤더·푸터: 심볼+국문 로고 가로형
};
const logo = (kind, h) => `<img src="${LOGO[kind].src}" alt="${LOGO[kind].alt}" width="${Math.round(h * LOGO[kind].ratio)}" height="${h}">`;
/** <head>의 파비콘·홈 화면 아이콘 */
export const iconLinks = () => `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/assets/brand/app-icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">`;
const ext = 'target="_blank" rel="noopener noreferrer"';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const chevron = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** <head>에 넣을 공통 리소스 */
export const shellHead = () => `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="${FONT_CSS}">
<link rel="stylesheet" href="/assets/site/shell.css?v=${SHELL_V}">
<script src="/assets/site/shell.js?v=${SHELL_V}" defer></script>`;

function group(lang, key, items, current) {
  const c = copy[lang];
  return `<div class="ms-nav-group">
      <button class="ms-nav-top" type="button" aria-expanded="false" aria-controls="ms-sub-${key}">${c.nav[key]}${chevron}</button>
      <div class="ms-sub" id="ms-sub-${key}">
        <div class="ms-wrap ms-sub-inner">
          <ul class="ms-sub-list">
            ${items.map((p) => `<li><a href="${productPath(p, lang)}"${p.slug === current ? ' aria-current="page"' : ''}><img src="${IMG}icon-${p.slug}.webp" alt="" width="44" height="44"><span><strong>${esc(p[lang].name)}</strong><small>${esc(p[lang].short)}</small></span></a></li>`).join('\n            ')}
          </ul>
          <a class="ms-sub-all" href="${c.home}#${key}">${c.nav.all[key]}${arrow}</a>
        </div>
      </div>
    </div>`;
}

/**
 * @param {'ko'|'en'} lang
 * @param {{ko:string,en:string}} alt 언어 전환 링크
 * @param {{current?:string, onHome?:boolean, autoHide?:boolean}} opts autoHide: 아래로 스크롤하면 숨고 위로 올리면 다시 나온다(제품 메뉴가 있는 상세 페이지용)
 */
export function shellHeader(lang, alt, { current, onHome = false, autoHide = false } = {}) {
  const c = copy[lang];
  const h = onHome ? '' : c.home;
  return `<header class="ms-header${autoHide ? ' ms-header--auto' : ''}">
  <div class="ms-wrap ms-header-row">
    <a class="ms-wordmark" href="${c.home}" aria-label="${c.homeLabel}">${logo('lockup', 26)}</a>
    <button class="ms-menu-toggle" type="button" aria-expanded="false" aria-controls="ms-nav" aria-label="${c.menu}"><span></span><span></span></button>
    <nav class="ms-nav" id="ms-nav" aria-label="${c.navLabel}">
    ${group(lang, 'apps', apps, current)}
    ${group(lang, 'games', games, current)}
      <a class="ms-nav-link" href="${h}#studio">${c.nav.studio}</a>
      <a class="ms-nav-link" href="${h}#contact">${c.nav.contact}</a>
      <span class="ms-lang"><a href="${alt.ko}"${lang === 'ko' ? ' aria-current="true"' : ''} hreflang="ko" lang="ko">KO</a><a href="${alt.en}"${lang === 'en' ? ' aria-current="true"' : ''} hreflang="en" lang="en">EN</a></span>
    </nav>
  </div>
</header>`;
}

/** 상세 페이지 하단: 같은 종류의 다른 제품 */
export function shellMore(lang, current) {
  const isGame = games.some((g) => g.slug === current);
  const list = (isGame ? games : apps).filter((p) => p.slug !== current);
  const c = copy[lang];
  return `<section class="ms-more">
  <div class="ms-wrap">
    <h2 class="ms-more-title">${isGame ? c.more.games : c.more.apps}</h2>
    <ul class="ms-more-list">
      ${list.map((p) => `<li><a href="${productPath(p, lang)}"><img src="${IMG}icon-${p.slug}.webp" alt="" width="56" height="56" loading="lazy"><span><strong>${esc(p[lang].name)}</strong><small>${esc(p[lang].short)}</small></span>${arrow}</a></li>`).join('\n      ')}
    </ul>
  </div>
</section>`;
}

export function shellFooter(lang) {
  const f = copy[lang].footer;
  return `<footer class="ms-footer">
  <div class="ms-wrap">
    <div class="ms-footer-top">
      <a class="ms-wordmark" href="${copy[lang].home}" aria-label="${copy[lang].homeLabel}">${logo('lockup', 24)}</a>
      <nav class="ms-legal legal-links"><a href="${f.terms[1]}" ${ext}>${f.terms[0]}</a><a href="${f.privacy[1]}" ${ext}>${f.privacy[0]}</a></nav>
    </div>
    <p class="ms-business">${f.business.map((s) => `<span>${esc(s)}</span>`).join('')}<span><a href="https://www.ftc.go.kr/www/selectBizCommList.do?key=254" ${ext}>${f.verify}</a></span></p>
    <p class="ms-business"><span>${esc(f.address)}</span><span>${f.email} : <a href="mailto:${EMAIL}">${EMAIL}</a></span></p>
    <p class="ms-copyright">© 2026 MaroStory. All Rights Reserved.</p>
  </div>
</footer>`;
}
