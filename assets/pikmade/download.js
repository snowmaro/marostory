(() => {
  'use strict';
  const ua = navigator.userAgent || '';
  // Preserve the landing page for crawlers that execute JavaScript too.
  const isPreview = /bot|crawler|spider|facebookexternalhit|facebot|kakaotalk-scrap|kakaostory-og-reader|pinterest/i.test(ua) || /^WhatsApp\/[\d.]+(?:\s|$)/i.test(ua);
  const platform = navigator.userAgentData?.platform || '';
  const android = /android/i.test(platform) || /android/i.test(ua);
  // iPadOS can report a desktop Mac user agent; touch capability distinguishes it.
  const ios = /iPhone|iPad|iPod/i.test(ua) || /ios/i.test(platform) ||
    (/Macintosh|MacIntel/i.test(ua + ' ' + (navigator.platform || '')) && navigator.maxTouchPoints > 1);
  const target = !isPreview && (android ? 'play-store' : ios ? 'app-store' : null);
  const english = !/^ko\b/i.test(navigator.language || 'ko');
  const status = document.getElementById('status');
  if (english) {
    document.documentElement.lang = 'en';
    document.getElementById('headline').innerHTML = 'One photo.<br><em>A new you.</em>';
    status.textContent = 'Choose a store to download Pikmade.';
    document.getElementById('help').textContent = 'If you are not redirected, tap a store button. If your in-app browser cannot open the store, try Safari or Chrome.';
    document.getElementById('intro').textContent = 'Discover Pikmade →';
    document.getElementById('intro').href = '/project/pikmade/en';
  }
  if (!target) return;
  const link = document.getElementById(target);
  const store = target === 'app-store' ? 'App Store' : 'Google Play';
  status.textContent = english ? `Opening ${store}…` : `${store}로 연결하고 있어요…`;
  // No server redirect or meta refresh: sharing services receive full static metadata.
  // replace() also avoids a redirect loop when navigating back from a store.
  const timer = setTimeout(() => {
    status.textContent = english ? 'If the store did not open, tap a button below.' : '스토어가 열리지 않았다면 아래 버튼을 눌러주세요.';
    window.location.replace(link.href);
  }, 450);
  document.querySelectorAll('a').forEach(anchor => anchor.addEventListener('click', () => clearTimeout(timer)));
})();
