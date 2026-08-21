from pathlib import Path
import re

ROOT = Path(r"C:\Users\bilou\Documents\work\SnoutScore\docs\design\KnowSnout_project")
OUT = Path(r"C:\Users\bilou\Documents\work\SnoutScore\docs\design\html\_frames_v2")
raw = (ROOT / "KnowSnout - Стрічка.dc.html").read_text(encoding="utf-8", errors="replace")

# find all phone labels
labels = re.findall(r'class="phone-label">([^<]+)<', raw)
print("labels:", labels)

for caption in labels:
    idx = raw.find(caption)
    safe = re.sub(r"[^\w]+", "_", caption)[:50]
    (OUT / f"mod3_chunk_{safe}.html").write_text(
        raw[max(0, idx - 40) : idx + 5000], encoding="utf-8"
    )
    print("wrote", safe, "at", idx)
