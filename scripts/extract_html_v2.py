from pathlib import Path
from collections import Counter
import re

html_dir = Path(r"C:\Users\bilou\Documents\work\SnoutScore\docs\design\html")
out = html_dir / "_extract_v2"
out.mkdir(exist_ok=True)

files = [
    "KnowSnout Брендбук.dc.html",
    "KnowSnout UI Kit.dc.html",
    "KnowSnout Мапа додатку.dc.html",
    "KnowSnout - Вхід і Перевір.dc.html",
    "KnowSnout - Улюбленці.dc.html",
    "KnowSnout - Стрічка.dc.html",
    "KnowSnout - Спільнота.dc.html",
    "KnowSnout - Профіль і Службові.dc.html",
    "KnowSnout - Довідники.dc.html",
    "KnowSnout - Адмінка.dc.html",
    "KnowSnout Логотип.dc.html",
]

for name in files:
    p = html_dir / name
    if not p.exists():
        print("MISSING", name)
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    stem = re.sub(r"[^\w\-]+", "_", name.replace(".dc.html", ""))[:50]
    cols = Counter(re.findall(r"#[0-9A-Fa-f]{3,8}\b", t)).most_common(40)
    fonts = sorted(set(re.findall(r"font-family:\s*([^;}\n]+)", t)))[:40]
    # CSS vars
    vars_ = re.findall(r"--([a-zA-Z0-9\-]+)\s*:\s*([^;]+);", t)
    texts = []
    seen = set()
    for m in re.findall(r">([^<>]{2,80})<", t):
        s = " ".join(m.split())
        if s and s not in seen and re.search(r"[А-Яа-яA-Za-z]", s) and "http" not in s:
            seen.add(s)
            texts.append(s)
    lines = [f"# {name}\nlen={len(t)}\n\n## Colors\n"]
    for c, n in cols:
        lines.append(f"{c} x{n}\n")
    lines.append("\n## Fonts\n")
    for f in fonts:
        lines.append(f"{f.strip()}\n")
    lines.append("\n## CSS vars (sample)\n")
    for k, v in vars_[:60]:
        lines.append(f"--{k}: {v.strip()}\n")
    lines.append("\n## Texts\n")
    for s in texts[:150]:
        lines.append(f"- {s}\n")
    (out / f"{stem}.md").write_text("".join(lines), encoding="utf-8")
    print("OK", name, "colors", len(cols), "vars", len(vars_), "texts", len(texts))
