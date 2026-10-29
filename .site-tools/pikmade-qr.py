"""Generate first-party QR assets with ReportLab. No external QR service."""
from pathlib import Path
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderSVG

root = Path(__file__).resolve().parents[1]
for lang in ('ko', 'en'):
    suffix = '/en' if lang == 'en' else ''
    code = QrCodeWidget('https://marostory.com/project/pikmade' + suffix, barLevel='M')
    x0, y0, x1, y1 = code.getBounds()
    drawing = Drawing(x1 - x0, y1 - y0)
    drawing.add(code)
    renderSVG.drawToFile(drawing, str(root / 'assets' / 'pikmade' / f'qr-{lang}.svg'))
