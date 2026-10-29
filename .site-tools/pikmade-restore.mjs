export const restoreCopy = {
  ko: {
    nav: '사진 복원', title: '오래된 사진,<br><em>다시 가까이.</em>',
    lead: '앨범 속 흑백 사진도, 빛바랜 추억도.<br>사진 한 장과 복원 방식 하나로 다시 만나보세요.',
    color: '컬러로', colorText: '흑백·바랜 사진에 자연스러운 색을 더해요.',
    clean: '깨끗하게', cleanText: '사진의 원래 색감을 살리며 긁힘·먼지·흐림을 정리해요.',
    before: '원본', after: '컬러 복원 예시', range: '복원 전후 비교', hint: '예시를 고르고 핸들을 움직여 복원 전후를 살펴보세요',
    examples: ['가족 · 컬러로', '가족 · 깨끗하게', '인물 · 깨끗하게'], cleanAfter: '깨끗하게 복원한 예시',
    note: 'AI 복원 결과는 원본의 상태에 따라 달라집니다. 특히 작거나 손상이 심한 얼굴은 달라질 수 있어요. 컬러는 AI가 추정한 색상이며 실제 당시 색을 보장하지 않습니다.',
    credit: 'Pikmade 복원 예시. 각 원본과 해당 사진의 AI 복원 결과를 비교합니다.',
    action: '앱에서 사진 복원해보기', version: '최신 버전의 ‘복원’ 탭에서 이용할 수 있어요.',
    faq: ['옛날 사진도 복원할 수 있나요?', '최신 버전의 복원 탭에서 ‘컬러로’ 또는 ‘깨끗하게’를 고를 수 있어요. 인화 사진은 반사 없이 평평하게, 사진 부분이 꽉 차도록 찍어주세요. AI가 색상과 세부를 추정하므로 원래 모습과 차이가 생길 수 있어요. 스타일 만들기와 복원은 같은 무료 횟수와 이용권을 함께 사용합니다.'],
  },
  en: {
    nav: 'Restore', title: 'Old photos.<br><em>New warmth.</em>',
    lead: 'Black-and-white portraits. Faded memories.<br>Bring them closer with a photo and a restoration mode.',
    color: 'In color', colorText: 'Add natural-looking color to black-and-white or faded photos.',
    clean: 'Clean up', cleanText: 'Reduce scratches, dust and blur while keeping the photo’s own colors.',
    before: 'Original', after: 'Colorized example', range: 'Compare original and restored photo', hint: 'Choose an example, then slide to compare before and after',
    examples: ['Family · In color', 'Family · Clean up', 'Portrait · Clean up'], cleanAfter: 'Cleaned-up example',
    note: 'AI restoration results depend on the original. Small or badly damaged faces may change. Colors are estimated by AI and may differ from the original historical colors.',
    credit: 'Pikmade restoration examples. Each original is paired with its AI-restored result.',
    action: 'Restore a photo in the app', version: 'Available in the Restore tab in the latest app version.',
    faq: ['Can I restore old photos?', 'In the latest app version, open Restore and choose In color or Clean up. When photographing a print, keep it flat, avoid glare and fill the frame with the photo. AI estimates colors and details, so results may differ from the original. Styles and restoration share the same daily free allowance and passes.'],
  },
};
export function restorationMarkup(lang) {
  const c = restoreCopy[lang];
  const examples = [
    { key: 'family-color', before: 'family-original', label: c.after },
    { key: 'family-clean', before: 'family-original', label: c.cleanAfter },
    { key: 'woman-clean', before: 'woman-original', label: c.cleanAfter },
  ];
  return `<section class="restore-section" id="restore"><div class="section-wrap restore-inner">
    <div class="restore-copy"><p class="eyebrow">03 / BRING YOUR MEMORIES CLOSER</p><h2>${c.title}</h2><p class="body-copy">${c.lead}</p>
      <div class="restore-methods"><article><span>01</span><div><h3>${c.color}</h3><p>${c.colorText}</p></div></article><article><span>02</span><div><h3>${c.clean}</h3><p>${c.cleanText}</p></div></article></div>
      <a class="pill-button" href="/project/pikmade/download">${c.action} ↗</a><p class="micro-copy restore-version">${c.version}</p><p class="micro-copy">${c.note}</p>
    </div>
    <div class="restore-visual"><div class="style-options restore-options" role="group" aria-label="${c.range}">${examples.map((example, i) => `<button data-restore="${example.key}" data-before="${example.before}" data-result-label="${example.label}" data-original-label="${c.before}" data-range-label="${c.range}" aria-pressed="${i === 0}">${c.examples[i]}</button>`).join('')}</div><div class="compare-frame restore-frame" style="--split:50%">
      <img id="restore-result" src="/assets/pikmade/restore-family-color.webp" width="720" height="900" alt="${c.examples[0]} — ${c.after}" loading="lazy">
      <div class="compare-original"><img id="restore-source" src="/assets/pikmade/restore-family-original.webp" width="720" height="900" alt="${c.examples[0]} — ${c.before}" loading="lazy"></div>
      <span class="compare-label before">${c.before}</span><span id="restore-result-label" class="compare-label after" aria-live="polite">${c.after}</span><div class="compare-line" aria-hidden="true"><span>↔</span></div>
      <input id="restore-range" type="range" min="0" max="100" value="50" aria-label="${c.range}">
    </div><p class="compare-caption">↔ ${c.hint}</p><p class="micro-copy restore-credit">${c.credit}</p></div>
  </div></section>`;
}
