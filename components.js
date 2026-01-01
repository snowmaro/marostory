// MaroStory Common Components
// This file manages shared header and footer across all language pages

// Header Component
function createHeader(currentLang = 'ko') {
    const langConfig = {
        ko: { active: 'index.html', label: 'KO' },
        en: { active: 'index_en.html', label: 'EN' },
        ja: { active: 'index_ja.html', label: 'JA' }
    };

    return `
    <div class="container">
      <div class="logo">MaroStory</div>
      <button class="mobile-menu-toggle" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="main-nav">
        <a href="#about">ABOUT</a>
        <a href="#team">TEAM</a>
        <a href="#contact">CONTACT</a>
        <div class="lang-nav">
          <a href="index.html" class="${currentLang === 'ko' ? 'active' : ''}">KO</a>
          <a href="index_en.html" class="${currentLang === 'en' ? 'active' : ''}">EN</a>
          <a href="index_ja.html" class="${currentLang === 'ja' ? 'active' : ''}">JA</a>
        </div>
      </nav>
    </div>
    <div class="mobile-menu-overlay"></div>
  `;
}

// Footer Component
function createFooter(currentLang = 'ko') {
    const footerConfig = {
        ko: {
            terms: { href: 'terms.html', text: '이용약관' },
            privacy: { href: 'privacy.html', text: '개인정보처리방침' },
            businessInfo: `
        <span>대표 : 민순오</span>
        <span>사업자등록번호 : 791-76-00469</span>
        <span>통신판매업 : 준비중</span>
        <br>
        <span>주소 : 우) 16978 경기도 용인시 기흥구 강남동로 6, 501-444호 (구갈동, 그랜드프라자)</span>
      `
        },
        en: {
            terms: { href: 'terms_en.html', text: 'Terms of Service' },
            privacy: { href: 'privacy_en.html', text: 'Privacy Policy' },
            businessInfo: `
        <span>Representative: Soon-O Min</span>
        <span>Business Registration: 791-76-00469</span>
        <span>Mail Order Business: In Preparation</span>
        <br>
        <span>Address: 501-444, 6 Gangnamdong-ro, Giheung-gu, Yongin-si, Gyeonggi-do, 16978, South Korea</span>
      `
        },
        ja: {
            terms: { href: 'terms_ja.html', text: '利用規約' },
            privacy: { href: 'privacy_ja.html', text: 'プライバシーポリシー' },
            businessInfo: `
        <span>代表者：ミン・スンオ</span>
        <span>事業者登録番号：791-76-00469</span>
        <span>通信販売業：準備中</span>
        <br>
        <span>住所：〒16978 京畿道龍仁市器興区江南洞路6、501-444号（九葛洞、グランドプラザ）</span>
      `
        }
    };

    const config = footerConfig[currentLang];

    return `
    <div class="container">
      <div class="footer-content">
        <div class="logo" style="font-size: 1.2rem;">MaroStory</div>
        <div class="legal-links">
          <a href="${config.terms.href}" target="_blank" rel="noopener noreferrer">${config.terms.text}</a>
          <a href="${config.privacy.href}" target="_blank" rel="noopener noreferrer">${config.privacy.text}</a>
        </div>
      </div>
      <div class="copyright">
        ⓒ 2025 MaroStory. All Rights Reserved.
      </div>
      <div class="footer-business">
        ${config.businessInfo}
      </div>
    </div>
  `;
}

// Initialize components when DOM is loaded
function initializeComponents(currentLang = 'ko') {
    // Insert header
    const headerElement = document.querySelector('header');
    if (headerElement) {
        headerElement.innerHTML = createHeader(currentLang);
    }

    // Insert footer
    const footerElement = document.querySelector('footer');
    if (footerElement) {
        footerElement.innerHTML = createFooter(currentLang);
    }

    // Initialize mobile menu after components are loaded
    initializeMobileMenu();
    initializeLegalLinks();
    initializeSmoothScroll();
}

// Mobile Menu Toggle
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const navLinks = document.querySelectorAll('.main-nav a');

    if (!menuToggle || !mainNav || !menuOverlay) return;

    // Toggle menu
    menuToggle.addEventListener('click', function () {
        this.classList.toggle('active');
        mainNav.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking overlay
    menuOverlay.addEventListener('click', function () {
        menuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        this.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Legal Links Handler for WebView
function initializeLegalLinks() {
    const legalLinks = document.querySelectorAll('.legal-links a');

    legalLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const isWebView = window.navigator.userAgent.includes('wv') ||
                window.webkit?.messageHandlers ||
                window.Android;

            if (isWebView) {
                e.preventDefault();
                const url = this.href;

                // iOS WebView
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.openLegalPage) {
                    window.webkit.messageHandlers.openLegalPage.postMessage({
                        url: url,
                        type: this.textContent.trim()
                    });
                }
                // Android WebView
                else if (window.Android && window.Android.openLegalPage) {
                    window.Android.openLegalPage(url, this.textContent.trim());
                }
                // Generic WebView
                else {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            }
        });
    });
}

// Smooth Scroll
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
