// 공통 헤더: 스크롤 표시, 2depth 메뉴, 모바일 메뉴, 앱 웹뷰의 약관 링크 처리
(() => {
  const header = document.querySelector('.ms-header');
  if (!header) return;
  const desktop = matchMedia('(min-width: 961px)');
  const hover = matchMedia('(hover: hover)');

  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 4);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  // 2depth: 데스크톱에서 hover·클릭·키보드로 연다
  const groups = [...header.querySelectorAll('.ms-nav-group')];
  const setGroup = (g, open) => {
    g.classList.toggle('is-open', open);
    g.querySelector('.ms-nav-top').setAttribute('aria-expanded', String(open));
  };
  const closeAll = (except) => groups.forEach((g) => g !== except && setGroup(g, false));
  groups.forEach((g) => {
    const top = g.querySelector('.ms-nav-top');
    let timer;
    top.addEventListener('click', () => {
      if (!desktop.matches) return;
      const open = !g.classList.contains('is-open');
      closeAll(g);
      setGroup(g, open);
    });
    g.addEventListener('mouseenter', () => {
      if (!desktop.matches || !hover.matches) return;
      clearTimeout(timer);
      closeAll(g);
      setGroup(g, true);
    });
    g.addEventListener('mouseleave', () => {
      if (!desktop.matches || !hover.matches) return;
      timer = setTimeout(() => setGroup(g, false), 120);
    });
    g.addEventListener('focusout', (e) => { if (!g.contains(e.relatedTarget)) setGroup(g, false); });
  });
  document.addEventListener('click', (e) => { if (!header.contains(e.target)) closeAll(); });

  // 모바일 메뉴
  const toggle = header.querySelector('.ms-menu-toggle');
  const nav = header.querySelector('.ms-nav');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { setMenu(false); closeAll(); }));
  desktop.addEventListener('change', () => { setMenu(false); closeAll(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = groups.find((g) => g.classList.contains('is-open'));
    if (open) { setGroup(open, false); open.querySelector('.ms-nav-top').focus(); }
    setMenu(false);
  });

  // 상세 페이지: 아래로 스크롤하면 헤더를 숨기고, 위로 올리면 다시 보여 준다.
  // --ms-offset은 헤더 아래에 붙는 제품 메뉴의 top 값으로 쓴다.
  if (header.classList.contains('ms-header--auto')) {
    const root = document.documentElement;
    let lastY = scrollY;
    const setHidden = (hidden) => {
      header.classList.toggle('is-hidden', hidden);
      root.style.setProperty('--ms-offset', hidden ? '0px' : `${header.offsetHeight}px`);
    };
    setHidden(false);
    addEventListener('scroll', () => {
      const y = Math.max(0, scrollY);
      const dy = y - lastY;
      if (Math.abs(dy) < 6) return;
      lastY = y;
      if (header.classList.contains('is-open') || groups.some((g) => g.classList.contains('is-open'))) return;
      setHidden(dy > 0 && y > header.offsetHeight);
    }, { passive: true });
    addEventListener('resize', () => setHidden(header.classList.contains('is-hidden')));
    header.addEventListener('focusin', () => setHidden(false));
  }

  // 앱 안 웹뷰로 열렸을 때 약관·개인정보 링크를 네이티브 브리지(openLegalPage)로 넘긴다
  const isWebView = navigator.userAgent.includes('wv') || window.webkit?.messageHandlers || window.Android;
  if (!isWebView) return;
  document.querySelectorAll('.legal-links a').forEach((link) => {
    link.addEventListener('click', (e) => {
      const payload = { url: link.href, type: link.textContent.trim() };
      if (window.webkit?.messageHandlers?.openLegalPage) {
        e.preventDefault();
        window.webkit.messageHandlers.openLegalPage.postMessage(payload);
      } else if (window.Android?.openLegalPage) {
        e.preventDefault();
        window.Android.openLegalPage(payload.url, payload.type);
      }
    });
  });
})();
