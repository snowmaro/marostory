"""마로스토리 CI 로고(SVG)를 글꼴 윤곽에서 만든다.

- 심볼 `m.`        : Comfortaa Bold의 m을 굵게(윤곽에 같은 색 테두리) + 마침표 원
- 영문 로고 `maro.story` : Comfortaa Bold(굵게) + 같은 마침표
- 국문 로고 `마로스토리.` : 나눔스퀘어라운드 ExtraBold + 같은 마침표
- 조합: 심볼+로고 가로형·세로형(국문·영문), 앱 아이콘 타일

색 규칙: 기본(color)은 검정 + 코발트 마침표, 흑백(mono)은 전부 검정, 어두운 배경은 reverse / reverse-mono.
글꼴(OFL)은 .brand/fonts/. 결과는 브랜드 키트(~/dev/snow_design/marostory-brand/logo/svg)에 쓰고,
사이트에 필요한 파일은 assets/brand/로 복사한다. PNG는 export-brand.mjs가 만든다.

사용: python -I .site-tools/build-brand.py   (fonttools 필요)
"""
import os
import shutil
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / '.brand' / 'fonts'
KIT = Path(os.environ.get('MAROSTORY_BRAND_KIT', Path.home() / 'dev' / 'snow_design' / 'marostory-brand'))
KIT_SVG = KIT / 'logo' / 'svg'
SITE_BRAND = ROOT / 'assets' / 'brand'

INK = '#0C0D10'
COBALT = '#1F45D6'
COBALT_ON_DARK = '#8EA4FF'
WHITE = '#FFFFFF'

COLORWAYS = {
    'color': (INK, COBALT),                  # 기본: 밝은 배경
    'mono': (INK, INK),                      # 흑백: 밝은 배경
    'reverse': (WHITE, COBALT_ON_DARK),      # 어두운 배경
    'reverse-mono': (WHITE, WHITE),          # 어두운 배경 흑백
}


class Face:
    def __init__(self, file, stem, bold=0.0):
        self.font = TTFont(FONTS / file)
        self.gs = self.font.getGlyphSet()
        self.cmap = self.font.getBestCmap()
        self.stem = stem          # 원래 획 두께(units)
        self.bold = bold          # 윤곽 테두리 두께(units). 실제 획 = stem + bold

    @property
    def weight(self):
        return self.stem + self.bold

    def glyph(self, ch):
        return self.gs[self.cmap[ord(ch)]]


def ink(face, g):
    bp = BoundsPen(face.gs)
    g.draw(bp)
    return bp.bounds


def layout(face, text, tracking, dot):
    """글자와 마침표의 위치를 정한다. '•'는 마침표 원 자리이고, 직전 글자의 실제 오른쪽 끝(테두리 포함)에서 dot['before']만큼 띄운다.
    다음 글자는 원의 오른쪽 끝에서 dot['after']만큼 띄우고 그 글자의 왼쪽 여백은 무시한다."""
    items, x, last_right = [], 0.0, None
    after_dot = False
    h = face.bold / 2
    for ch in text:
        if ch == '•':
            left = last_right + dot['before']
            items.append(('dot', left))
            x = left + dot['d'] + dot['after']
            after_dot = True
            continue
        g = face.glyph(ch)
        b = ink(face, g)
        if after_dot and b:
            x -= b[0] - h  # 왼쪽 여백 무시
            after_dot = False
        items.append(('glyph', x, g, b))
        if b:
            last_right = x + b[2] + h
        x += g.width + face.bold + tracking
    return items


class Mark:
    """좌상단이 (0,0)이고 y가 아래로 커지는 로컬 좌표의 그림. baseline은 글자 기준선의 y."""

    def __init__(self, inner, w, h, baseline):
        self.inner, self.w, self.h, self.baseline = inner, w, h, baseline


def mark(face, text, tracking, dot, color, dot_color):
    paths, circles = [], []
    xmin = ymin = float('inf')
    xmax = ymax = float('-inf')
    h = face.bold / 2
    for it in layout(face, text, tracking, dot):
        if it[0] == 'dot':
            r = dot['d'] / 2
            cx, cy = it[1] + r, r - dot.get('drop', 0)
            circles.append((cx, cy))
            xmin, xmax = min(xmin, cx - r), max(xmax, cx + r)
            ymin, ymax = min(ymin, cy - r), max(ymax, cy + r)
        else:
            _, x, g, b = it
            pen = SVGPathPen(face.gs)
            g.draw(TransformPen(pen, (1, 0, 0, 1, x, 0)))
            paths.append(pen.getCommands())
            if b:
                xmin, xmax = min(xmin, x + b[0] - h), max(xmax, x + b[2] + h)
                ymin, ymax = min(ymin, b[1] - h), max(ymax, b[3] + h)
    stroke = f' stroke="{color}" stroke-width="{face.bold:.0f}" stroke-linejoin="round"' if face.bold else ''
    inner = (f'<g transform="matrix(1 0 0 -1 {-xmin:.1f} {ymax:.1f})">'
             f'<g fill="{color}"{stroke}>' + ''.join(f'<path d="{d}"/>' for d in paths) + '</g>'
             + ''.join(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{dot["d"] / 2:.1f}" fill="{dot_color}"/>' for cx, cy in circles)
             + '</g>')
    return Mark(inner, xmax - xmin, ymax - ymin, ymax)


def place(m, x, y, s):
    return f'<g transform="translate({x:.1f} {y:.1f}) scale({s:.5f})">{m.inner}</g>'


def svg_doc(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{body}</svg>\n')


def single(m, title):
    return svg_doc(m.w, m.h, m.inner, title)


def horizontal(sym, word, title, align):
    """심볼 + 로고 가로형. align='baseline'이면 심볼 바닥을 로고 기준선에 맞추고 기준선 위 높이를 같게,
    'box'면 로고 전체 높이에 맞춘다(한글은 글자가 기준선 아래로 내려오므로)."""
    if align == 'baseline':
        s = word.baseline / sym.baseline
    else:
        s = word.h / sym.h
    sw = sym.w * s
    gap = sym.h * s * 0.42
    h = max(word.h, sym.h * s)
    body = place(sym, 0, 0, s) + place(word, sw + gap, 0, 1)
    return svg_doc(sw + gap + word.w, h, body, title)


def vertical(sym, word, title):
    """심볼 + 로고 세로형: 심볼을 위에 두고 로고 너비의 45%로 맞춘다."""
    s = word.w * 0.45 / sym.w
    sw, sh = sym.w * s, sym.h * s
    gap = sh * 0.32
    w = max(word.w, sw)
    body = place(sym, (w - sw) / 2, 0, s) + place(word, (w - word.w) / 2, sh + gap, 1)
    return svg_doc(w, sh + gap + word.h, body, title)


def tile(sym, bg, title, fill=0.62, radius=0.225):
    side = max(sym.w, sym.h) / fill
    body = (f'<rect width="{side:.0f}" height="{side:.0f}" rx="{side * radius:.0f}" fill="{bg}"/>'
            + place(sym, (side - sym.w) / 2, (side - sym.h) / 2, 1))
    return svg_doc(side, side, body, title)


def main():
    KIT_SVG.mkdir(parents=True, exist_ok=True)
    SITE_BRAND.mkdir(parents=True, exist_ok=True)
    latin = Face('Comfortaa-Bold.ttf', stem=102, bold=54)       # 획 156: H2 시안의 굵기
    symbol = Face('Comfortaa-Bold.ttf', stem=102, bold=52)      # 획 154: E2 시안의 굵기
    hangul = Face('NanumSquareRoundEB.ttf', stem=128)

    def dot_for(face, before, after=0, ratio=1.15):
        # 마침표 원: 지름 = 획 × ratio, 바닥은 글자 기준선(테두리 포함)에 맞춘다
        return {'d': face.weight * ratio, 'before': before, 'after': after, 'drop': face.bold / 2}

    specs = {
        'symbol': (symbol, 'm•', 0, dot_for(symbol, before=symbol.weight * 0.45)),
        'wordmark-en': (latin, 'maro•story', -10, dot_for(latin, before=latin.weight * 0.4, after=latin.weight * 0.4)),
        'wordmark-ko': (hangul, '마로스토리•', -40, dot_for(hangul, before=hangul.weight * 0.75, ratio=1.6)),
    }
    files = {}
    for way, (color, dot_color) in COLORWAYS.items():
        m = {k: mark(f, t, tr, d, color, dot_color) for k, (f, t, tr, d) in specs.items()}
        files[f'symbol-{way}'] = single(m['symbol'], 'maro.story')
        files[f'wordmark-en-{way}'] = single(m['wordmark-en'], 'maro.story')
        files[f'wordmark-ko-{way}'] = single(m['wordmark-ko'], '마로스토리')
        files[f'lockup-horizontal-en-{way}'] = horizontal(m['symbol'], m['wordmark-en'], 'maro.story', 'baseline')
        files[f'lockup-horizontal-ko-{way}'] = horizontal(m['symbol'], m['wordmark-ko'], '마로스토리', 'box')
        files[f'lockup-vertical-en-{way}'] = vertical(m['symbol'], m['wordmark-en'], 'maro.story')
        files[f'lockup-vertical-ko-{way}'] = vertical(m['symbol'], m['wordmark-ko'], '마로스토리')

    # 앱 아이콘·파비콘·SNS 프로필 타일
    f, t, tr, d = specs['symbol']
    files['app-icon'] = tile(mark(f, t, tr, d, WHITE, COBALT_ON_DARK), INK, 'maro.story')        # 기본
    files['app-icon-cobalt'] = tile(mark(f, t, tr, d, WHITE, WHITE), COBALT, 'maro.story')
    files['app-icon-mono'] = tile(mark(f, t, tr, d, WHITE, WHITE), INK, 'maro.story')
    files['app-icon-square'] = tile(mark(f, t, tr, d, WHITE, COBALT_ON_DARK), INK, 'maro.story', radius=0)  # iOS·스토어용(플랫폼이 모서리를 깎음)

    for old in KIT_SVG.glob('*.svg'):
        old.unlink()
    for name, doc in files.items():
        (KIT_SVG / f'{name}.svg').write_text(doc)

    # 사이트에서 쓰는 파일만 복사
    for old in SITE_BRAND.glob('*.svg'):
        old.unlink()
    for name in ['lockup-horizontal-ko-color', 'wordmark-en-color', 'wordmark-ko-color', 'symbol-color', 'app-icon']:
        shutil.copy(KIT_SVG / f'{name}.svg', SITE_BRAND / f'{name}.svg')
    print(f'{len(files)} SVG → {KIT_SVG}')


if __name__ == '__main__':
    main()
