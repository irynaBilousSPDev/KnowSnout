from pathlib import Path
import re

ROOT = Path(r"C:\Users\bilou\Documents\work\SnoutScore\docs\design\KnowSnout_project")
OUT = Path(r"C:\Users\bilou\Documents\work\SnoutScore\docs\design\html\_frames_v2")
raw = (ROOT / "KnowSnout - Улюбленці.dc.html").read_text(encoding="utf-8", errors="replace")

for caption in [
    "12 · Список тварин",
    "13 · Хаб тварини",
    "14 · Догляд сьогодні",
    "17 · Профіль тварини, перегляд",
    "17b · Профіль тварини",
    "19 · Щеплення",
    "20 · Ліки та візити",
]:
    idx = raw.find(caption)
    if idx < 0:
        # fuzzy
        short = caption.split("·", 1)[0].strip()
        idx = raw.find(f"{short} ·")
    print(caption, "at", idx)
    if idx >= 0:
        safe = re.sub(r"[^\w]+", "_", caption)[:40]
        (OUT / f"mod2_chunk_{safe}.html").write_text(raw[max(0, idx - 80) : idx + 5500], encoding="utf-8")
