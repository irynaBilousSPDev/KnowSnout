"""Extract inner HTML of phone frames from KnowSnout module .dc.html."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(r"C:\Users\bilou\Documents\work\SnoutScore\docs\design\KnowSnout_project")
OUT = Path(r"C:\Users\bilou\Documents\work\SnoutScore\docs\design\html\_frames_v2")
OUT.mkdir(exist_ok=True)

path = ROOT / "KnowSnout - Вхід і Перевір.dc.html"
raw = path.read_text(encoding="utf-8", errors="replace")

# Find style block with brand overrides + component CSS used in phones
styles = re.findall(r"<style[^>]*>([\s\S]*?)</style>", raw, flags=re.I)
(OUT / "mod1_inline_styles.css").write_text("\n\n".join(styles), encoding="utf-8")
print("styles blocks", len(styles), "chars", sum(len(s) for s in styles))

# Dump chunks around each caption for structure
for caption in [
    "2 · Реєстрація",
    "3 · Онбординг",
    "6 · Хаб «Перевір»",
    "7 · Історія",
]:
    idx = raw.find(caption)
    if idx < 0:
        print("missing", caption)
        continue
    # walk back to nearby phone/open div
    start = max(0, idx - 200)
    chunk = raw[start : idx + 4500]
    safe = re.sub(r"[^\w]+", "_", caption)[:40]
    (OUT / f"mod1_chunk_{safe}.html").write_text(chunk, encoding="utf-8")
    print("wrote", safe, "at", idx)

# Also extract phone screen CSS class names
classes = sorted(set(re.findall(r'class="([^"]+)"', raw)))
(OUT / "mod1_classes.txt").write_text("\n".join(classes), encoding="utf-8")
print("classes", len(classes))
