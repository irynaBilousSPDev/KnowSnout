"""Parse KnowSnout .dc.html phone frames into screen inventory."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(r"C:\Users\bilou\Documents\work\SnoutScore\docs\design\html")
OUT = ROOT / "_frames_v2"
OUT.mkdir(exist_ok=True)

MODULES = [
    "KnowSnout - Вхід і Перевір.dc.html",
    "KnowSnout - Улюбленці.dc.html",
    "KnowSnout - Стрічка.dc.html",
    "KnowSnout - Спільнота.dc.html",
    "KnowSnout - Профіль і Службові.dc.html",
    "KnowSnout - Довідники.dc.html",
    "KnowSnout - Адмінка.dc.html",
]


def strip_tags(html: str) -> str:
    html = re.sub(r"<script[\s\S]*?</script>", " ", html, flags=re.I)
    html = re.sub(r"<style[\s\S]*?</style>", " ", html, flags=re.I)
    html = re.sub(r"<[^>]+>", "\n", html)
    html = html.replace("&nbsp;", " ").replace("&apos;", "'").replace("&amp;", "&")
    html = html.replace("&lt;", "<").replace("&gt;", ">")
    lines = []
    for line in html.splitlines():
        s = " ".join(line.split())
        if s:
            lines.append(s)
    return "\n".join(lines)


def main() -> None:
    inventory: list[str] = ["# HTML frame inventory (new pack 2026-08-21)\n"]
    for name in MODULES:
        path = ROOT / name
        if not path.exists():
            inventory.append(f"\n## MISSING {name}\n")
            continue
        raw = path.read_text(encoding="utf-8", errors="replace")
        # Split by phone-ish containers: look for captions like "N · Title"
        captions = re.findall(
            r">(\d+[a-z]?)\s*[·•]\s*([^<]{2,90})<",
            raw,
        )
        inventory.append(f"\n## {name}\n")
        inventory.append(f"- size: {len(raw)}\n")
        inventory.append(f"- caption count: {len(captions)}\n")
        for num, title in captions:
            inventory.append(f"  - {num} · {title.strip()}\n")

        # Dump readable text near each caption for first module deeply
        stem = re.sub(r"[^\w\-]+", "_", name.replace(".dc.html", ""))[:40]
        text = strip_tags(raw)
        (OUT / f"{stem}_plaintext.txt").write_text(text, encoding="utf-8")

        # Also dump chunks around captions
        chunks: list[str] = []
        for num, title in captions:
            needle = f"{num} · {title.strip()}"
            # find in plaintext (may differ slightly)
            key = f"{num}"
            chunks.append(f"\n===== {num} · {title.strip()} =====\n")
        # Better: split plaintext by lines that look like captions
        lines = text.splitlines()
        current: list[str] = []
        sections: list[tuple[str, list[str]]] = []
        for line in lines:
            if re.match(r"^\d+[a-z]?\s*[·•]\s+", line):
                if current:
                    sections.append((current[0], current[1:]))
                current = [line]
            elif current:
                current.append(line)
                if len(current) > 80:
                    # cap section body
                    pass
        if current:
            sections.append((current[0], current[1:]))

        md_parts = [f"# {name}\n\n"]
        for title, body in sections:
            md_parts.append(f"## {title}\n")
            for b in body[:60]:
                if b.startswith("KnowSnout") and "UI Kit" in b:
                    continue
                md_parts.append(f"- {b}\n")
            md_parts.append("\n")
        (OUT / f"{stem}_screens.md").write_text("".join(md_parts), encoding="utf-8")
        inventory.append(f"- screens file: _frames_v2/{stem}_screens.md\n")

    (OUT / "INVENTORY.md").write_text("".join(inventory), encoding="utf-8")
    print("Wrote", OUT / "INVENTORY.md")
    print("".join(inventory)[:4000])


if __name__ == "__main__":
    main()
