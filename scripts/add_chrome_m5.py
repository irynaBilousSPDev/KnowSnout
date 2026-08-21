from pathlib import Path
import re

ROOT = Path(r"C:\Users\bilou\Documents\work\SnoutScore")
files = [
    "app/(app)/blocked-users.tsx",
    "app/(app)/support.tsx",
    "app/(app)/delete-account.tsx",
    "app/(app)/data-sources.tsx",
    "app/(app)/help-article.tsx",
    "app/(app)/subscription.tsx",
]

for rel in files:
    p = ROOT / rel
    if not p.exists():
        print("MISS", rel)
        continue
    text = p.read_text(encoding="utf-8")
    if "AppChromeHeader" in text:
        print("HAS", rel)
        continue
    if "from '@/src/components/AppScreen'" not in text:
        print("NO_APP_SCREEN", rel)
        continue
    text = text.replace(
        "import { AppScreen } from '@/src/components/AppScreen';",
        "import { AppChromeHeader } from '@/src/components/AppChromeHeader';\n"
        "import { AppScreen } from '@/src/components/AppScreen';",
        1,
    )

    def repl(m: re.Match[str]) -> str:
        tag = m.group(0)
        if "edges=" not in tag:
            if tag == "<AppScreen>":
                tag = "<AppScreen edges={['bottom']}>"
            else:
                tag = tag.replace(
                    "<AppScreen ", "<AppScreen edges={['bottom']} ", 1
                )
        return f"{tag}\n      <AppChromeHeader />"

    text2, n = re.subn(r"<AppScreen[^>]*>", repl, text, count=1)
    if n == 0:
        print("NO_TAG", rel)
        continue
    # also replace remaining bare AppScreen opens without chrome for multi-return
    while True:
        m = re.search(r"<AppScreen(?![^>]*edges=)[^>]*>", text2)
        if not m:
            break
        tag = m.group(0)
        if tag == "<AppScreen>":
            new = "<AppScreen edges={['bottom']}>\n      <AppChromeHeader />"
        else:
            new = tag.replace(
                "<AppScreen ", "<AppScreen edges={['bottom']} ", 1
            ) + "\n      <AppChromeHeader />"
        text2 = text2[: m.start()] + new + text2[m.end() :]
    p.write_text(text2, encoding="utf-8")
    print("OK", rel)
