(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 761px)');
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const styleButtons = $$('[data-style]');
  const range = $('#compare-range');
  const frame = $('.compare-frame');
  const hero = $('.hero');
  const transform = $('.transform-section');
  const download = $('#download');
  const cards = $$('[data-depth]');
  const steps = $$('[data-step]');
  let activeStyle = 'paper', manualStyle = false, activeStep = 0, manualStep = false;
  let scrollPending = false, toastTimer;

  function chooseStyle(key, manual = false) {
    const button = styleButtons.find(button => button.dataset.style === key);
    if (!button) return;
    if (manual) manualStyle = true;
    if (activeStyle === key) return;
    activeStyle = key;
    $('#compare-result').src = `/assets/pikmade/${key}.webp?v=20261011`;
    $('#compare-source').src = `/assets/pikmade/${key === 'paper' ? 'original' : `original-${key}`}.webp?v=20261011`;
    $('#active-style-name').textContent = button.textContent;
    const index = styleButtons.indexOf(button) + 1;
    $('.style-number').textContent = `0${index}`;
    $('#compare-index').textContent = `0${index} — 03`;
    styleButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }
  styleButtons.forEach(button => button.addEventListener('click', () => chooseStyle(button.dataset.style, true)));
  $$('[data-pick]').forEach(button => button.addEventListener('click', () => {
    chooseStyle(button.dataset.pick, true);
    transform.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
  }));
  range.addEventListener('input', () => {
    frame.style.setProperty('--split', `${range.value}%`);
    manualStyle = true;
  });
  $('#restore-range').addEventListener('input', event => {
    $('.restore-frame').style.setProperty('--split', `${event.target.value}%`);
  });
  $$('[data-restore]').forEach(button => button.addEventListener('click', () => {
    const source = $('#restore-source'), result = $('#restore-result');
    source.src = `/assets/pikmade/restore-${button.dataset.before}.webp`;
    result.src = `/assets/pikmade/restore-${button.dataset.restore}.webp`;
    source.alt = `${button.textContent} — ${button.dataset.originalLabel}`;
    result.alt = `${button.textContent} — ${button.dataset.resultLabel}`;
    $('#restore-result-label').textContent = button.dataset.resultLabel;
    $('#restore-range').setAttribute('aria-label', `${button.textContent} — ${button.dataset.rangeLabel}`);
    $$('[data-restore]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  function selectStep(index, manual = false) {
    if (manual) manualStep = true;
    if (index === activeStep) return;
    activeStep = index;
    steps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
      step.setAttribute('aria-pressed', String(i === index));
    });
    $$('[data-screen]').forEach((image, i) => {
      image.classList.toggle('active', i === index);
      image.setAttribute('aria-hidden', String(i !== index));
    });
  }
  steps.forEach((step, index) => step.addEventListener('click', () => {
    selectStep(index, true);
    if (!desktop.matches) $('.phone-stage').scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
  }));
  function updateScroll() {
    scrollPending = false;
    const viewport = innerHeight;
    const maxScroll = document.documentElement.scrollHeight - viewport;
    $('.reading-progress').style.transform = `scaleX(${clamp(scrollY / Math.max(1, maxScroll))})`;
    const heroRect = hero.getBoundingClientRect();
    const downloadRect = download.getBoundingClientRect();
    $('.mobile-download').classList.toggle('visible', heroRect.bottom < 80 && !(downloadRect.top < viewport && downloadRect.bottom > 0));
    if (!motion.matches) {
      for (const card of cards) {
        const section = card.closest('section');
        const rect = section.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > viewport + 100) continue;
        const amount = clamp(-rect.top, -viewport, viewport) * Number(card.dataset.depth) * (desktop.matches ? 1 : .4);
        card.style.setProperty('--py', `${amount.toFixed(1)}px`);
      }
      const rect = transform.getBoundingClientRect();
      if (desktop.matches && !manualStyle && rect.top < 130 && rect.bottom > viewport * .7) {
        const progress = clamp((86 - rect.top) / Math.max(1, rect.height - viewport + 86));
        chooseStyle(styleButtons[Math.min(2, Math.floor(progress * 3))].dataset.style);
      }
    }
    if (!manualStep) {
      const distances = steps.map(step => Math.abs(step.getBoundingClientRect().top + step.offsetHeight / 2 - viewport * .55));
      selectStep(distances.indexOf(Math.min(...distances)));
    }
  }
  function scheduleScroll() { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); } }
  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll, { passive: true });
  addEventListener('load', scheduleScroll);
  motion.addEventListener('change', () => {
    if (motion.matches) cards.forEach(card => { card.style.removeProperty('--py'); card.style.removeProperty('--mx'); });
    scheduleScroll();
  });
  scheduleScroll();

  const art = $('.hero-art');
  art.addEventListener('pointermove', event => {
    if (motion.matches || event.pointerType !== 'mouse') return;
    const rect = art.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 16;
    $$('.art-card', art).forEach((card, i) => card.style.setProperty('--mx', `${x * (i % 2 ? -.6 : 1)}px`));
  });
  art.addEventListener('pointerleave', () => $$('.art-card', art).forEach(card => card.style.setProperty('--mx', '0px')));

  const grid = $('.art-grid');
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    grid.classList.toggle('is-filtered', filter !== 'all');
    $$('[data-category]').forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
  }));
  const artDialog = $('#art-dialog');
  $$('[data-art]').forEach(button => button.addEventListener('click', () => {
    $('#dialog-image').src = `/assets/pikmade/${button.dataset.art}.webp?v=20261011`;
    $('#dialog-image').alt = button.dataset.title;
    $('#art-title').textContent = button.dataset.title;
    $('#art-description').textContent = button.dataset.description;
    artDialog.showModal();
    document.body.style.overflow = 'hidden';
  }));
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
  });
  $('.pill-button', artDialog).addEventListener('click', () => artDialog.close());
  function showToast(text) {
    const toast = $('#toast');
    toast.textContent = text;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }
  const shareDialog = $('#share-dialog');
  const url = $('link[rel=canonical]').href;
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      if (shareDialog.open) shareDialog.close();
      showToast(document.body.dataset.copied);
    } catch {
      if (!shareDialog.open) shareDialog.showModal();
      const input = $('input', shareDialog);
      input.focus(); input.select();
    }
  }
  $$('.share-button').forEach(button => button.addEventListener('click', async () => {
    if (navigator.share) {
      try { await navigator.share({ title: document.title, text: $('meta[name=description]').content, url }); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    await copyLink();
  }));
  $('.copy-link').addEventListener('click', copyLink);
})();
