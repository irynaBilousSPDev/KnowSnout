from pathlib import Path
import re

ROOT = Path(r"C:\Users\bilou\Documents\work\SnoutScore")
files = [
    "app/(app)/forum-thread.tsx",
    "app/(app)/forum-category.tsx",
    "app/(app)/forum-new.tsx",
    "app/(app)/forum-rules.tsx",
    "app/(app)/forum-notifications.tsx",
    "app/(app)/forum-search.tsx",
    "app/(app)/forum-author.tsx",
    "app/(app)/blog-article.tsx",
    "app/(app)/blog-bookmarks.tsx",
    "app/(app)/quiz-results.tsx",
    "app/(app)/quiz-leaderboard.tsx",
    "app/(app)/quiz-zoom.tsx",
    "app/(app)/quiz-heavier.tsx",
    "app/(app)/quiz-myth.tsx",
    "app/(app)/breed-quiz.tsx",
    "app/(app)/wiki-quiz.tsx",
    "app/(app)/trivia-quiz.tsx",
    "app/(app)/achievements.tsx",
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
