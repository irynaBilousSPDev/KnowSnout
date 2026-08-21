from pathlib import Path
from collections import Counter
import re

html_dir = Path(r"C:\Users\bilou\Documents\work\SnoutScore\docs\design\html")
out = Path(r"C:\Users\bilou\Documents\work\SnoutScore\docs\design\html\_extract")
out.mkdir(exist_ok=True)

modules = [
    "KnowSnout - Вхід і Перевір.dc.html",
    "KnowSnout - Улюбленці.dc.html",
    "KnowSnout - Стрічка.dc.html",
    "KnowSnout - Спільнота.dc.html",
    "KnowSnout - Профіль і Службові.dc.html",
    "KnowSnout - Довідники.dc.html",
    "KnowSnout - Адмінка.dc.html",
    "KnowSnout Brandbook 12 Petrol Forest.dc.html",
]

for name in modules:
    p = html_dir / name
    if not p.exists():
        print("MISSING", name)
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    stem = re.sub(r"[^\w\-]+", "_", name.replace(".dc.html", ""))[:60]
    # colors
    cols = Counter(re.findall(r"#[0-9A-Fa-f]{3,8}\b", t)).most_common(30)
    fonts = sorted(set(re.findall(r"font-family:\s*([^;}\n]+)", t)))[:30]
    # visible text chunks that look like UI labels
    texts = []
    for m in re.findall(r">([^<>]{2,80})<", t):
        s = " ".join(m.split())
        if not s or s.startswith("{") or "http" in s:
            continue
        if re.search(r"[А-Яа-яІіЇїЄєҐґA-Za-z]", s):
            texts.append(s)
    # unique preserve order
    seen = set()
    uniq = []
    for s in texts:
        if s not in seen and len(s) < 70:
            seen.add(s)
            uniq.append(s)
    report = []
    report.append(f"# {name}\nlen={len(t)}\n")
    report.append("## Colors\n")
    for c, n in cols:
        report.append(f"{c} x{n}\n")
    report.append("\n## Fonts\n")
    for f in fonts:
        report.append(f"{f.strip()}\n")
    report.append("\n## Texts (sample)\n")
    for s in uniq[:120]:
        report.append(f"- {s}\n")
    (out / f"{stem}.md").write_text("".join(report), encoding="utf-8")
    print("wrote", stem, "colors", len(cols), "texts", len(uniq))

# brandbook 12 detail
bp = html_dir / "KnowSnout Brandbook 12 Petrol Forest.dc.html"
if bp.exists():
    t = bp.read_text(encoding="utf-8", errors="replace")
    print("brandbook12 len", len(t))
    for c, n in Counter(re.findall(r"#[0-9A-Fa-f]{3,8}\b", t)).most_common(20):
        print(c, n)
