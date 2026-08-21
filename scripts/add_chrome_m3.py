from pathlib import Path
import re

ROOT = Path(r"C:\Users\bilou\Documents\work\SnoutScore")
files = [
    "app/(app)/spotlight-apply.tsx",
    "app/(app)/spotlight-ranking.tsx",
    "app/(app)/spotlight-rules.tsx",
    "app/(app)/spotlight-winners.tsx",
    "app/(app)/spotlight-won.tsx",
    "app/(app)/walk-plan.tsx",
    "app/(app)/search.tsx",
    "app/(app)/user-profile.tsx",
    "app/(app)/friend-search.tsx",
    "app/(app)/friend-requests.tsx",
    "app/(app)/friend-invite.tsx",
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
                tag = tag.replace("<AppScreen ", "<AppScreen edges={['bottom']} ", 1)
        return f"{tag}\n      <AppChromeHeader />"

    text2, n = re.subn(r"<AppScreen[^>]*>", repl, text, count=1)
    if n == 0:
        print("NO_TAG", rel)
        continue
    p.write_text(text2, encoding="utf-8")
    print("OK", rel)
