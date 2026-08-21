from pathlib import Path
import re

ROOT = Path(r"C:\Users\bilou\Documents\work\SnoutScore")

# Screens still missing AppChromeHeader (user-facing, not auth redirects)
ORPHANS = [
    "app/(app)/care-hub.tsx",
    "app/(app)/contest-entry.tsx",
    "app/(app)/contests.tsx",
    "app/(app)/dm/[userId].tsx",
    "app/(app)/friend-invite-accept.tsx",
    "app/(app)/pet-calendar.tsx",
    "app/(app)/pet-form.tsx",
    "app/(app)/pet-habits.tsx",
    "app/(app)/pet-passport.tsx",
    "app/(app)/pet-travel-wizard.tsx",
    "app/(app)/pet-travel.tsx",
    "app/(app)/plant-safety.tsx",
    "app/(app)/play-guides.tsx",
    "app/(app)/result.tsx",
    "app/(app)/spotlight-guest-vote.tsx",
    "app/(app)/trivia-quiz.tsx",
    "app/(app)/wiki-quiz.tsx",
    "app/(app)/breed-quiz.tsx",
    "app/spotlight-vote.tsx",
    "app/+not-found.tsx",
]


def ensure_chrome_import(text: str) -> str:
    if "AppChromeHeader" in text:
        return text
    # Prefer after AppScreen import
    if "from '@/src/components/AppScreen'" in text:
        return text.replace(
            "import { AppScreen } from '@/src/components/AppScreen';",
            "import { AppChromeHeader } from '@/src/components/AppChromeHeader';\n"
            "import { AppScreen } from '@/src/components/AppScreen';",
            1,
        )
    # After first @/src/components import
    m = re.search(r"import .+ from '@/src/components/[^']+';\n", text)
    if m:
        insert_at = m.end()
        return (
            text[:insert_at]
            + "import { AppChromeHeader } from '@/src/components/AppChromeHeader';\n"
            + text[insert_at:]
        )
    # Fallback: after react-native import block
    m = re.search(r"from 'react-native';\n", text)
    if m:
        return (
            text[: m.end()]
            + "\nimport { AppChromeHeader } from '@/src/components/AppChromeHeader';\n"
            + text[m.end() :]
        )
    return text


def inject_chrome_after_open(text: str) -> tuple[str, str]:
    """Inject <AppChromeHeader /> after first AppScreen or SafeAreaView open."""
    if "<AppChromeHeader" in text:
        return text, "already"

    # AppScreen path
    m = re.search(r"<AppScreen([^>]*)>", text)
    if m:
        tag = m.group(0)
        attrs = m.group(1)
        if "edges=" not in attrs:
            if tag == "<AppScreen>":
                new_tag = "<AppScreen edges={['bottom']}>"
            else:
                new_tag = f"<AppScreen edges={{['bottom']}}{attrs}>"
        else:
            new_tag = tag
        repl = f"{new_tag}\n      <AppChromeHeader />"
        return text[: m.start()] + repl + text[m.end() :], "appscreen"

    # SafeAreaView path (custom shells)
    m = re.search(r"<SafeAreaView([^>]*)>", text)
    if m:
        repl = f"{m.group(0)}\n      <AppChromeHeader />"
        return text[: m.start()] + repl + text[m.end() :], "safe"

    return text, "none"


for rel in ORPHANS:
    p = ROOT / rel
    if not p.exists():
        print("MISS", rel)
        continue
    text = p.read_text(encoding="utf-8")
    text = ensure_chrome_import(text)
    text2, how = inject_chrome_after_open(text)
    if how == "none":
        print("SKIP", rel)
        continue
    if how == "already":
        print("HAS", rel)
        continue
    p.write_text(text2, encoding="utf-8")
    print("OK", how, rel)
