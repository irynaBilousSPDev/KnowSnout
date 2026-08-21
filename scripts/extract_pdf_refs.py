"""Render KnowSnout UI Kit PDFs to docs/design/refs for visual QA."""
from pathlib import Path
import pymupdf

BASE = Path(__file__).resolve().parents[1] / 'docs' / 'design'
OUT = BASE / 'refs'
OUT.mkdir(exist_ok=True)

PDFS = [
    'KnowSnout-UI-kit-v2-vkhid-perevir.pdf',
    'KnowSnout-UI-kit-v2-ulyublentsi.pdf',
    'KnowSnout-UI-kit-v2-strichka.pdf',
    'KnowSnout-UI-kit-v2-spilnota.pdf',
    'KnowSnout-UI-kit-v2-profil-sluzhbovi.pdf',
    'KnowSnout-UI-kit-v2-dovidnyky.pdf',
    'KnowSnout-UI-kit-v2-adminka.pdf',
    'KnowSnout-UI-kit-v2-klyuchovi-ekrany.pdf',
]

def main() -> None:
    for name in PDFS:
        path = BASE / name
        if not path.exists():
            print('skip missing', name)
            continue
        doc = pymupdf.open(str(path))
        stem = name.replace('KnowSnout-UI-kit-v2-', '').replace('.pdf', '')
        for i, page in enumerate(doc):
            pix = page.get_pixmap(matrix=pymupdf.Matrix(1.2, 1.2), alpha=False)
            out = OUT / f'{stem}_p{i + 1}.png'
            pix.save(str(out))
            print('saved', out.name)
        doc.close()

if __name__ == '__main__':
    main()
