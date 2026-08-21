from pathlib import Path

p = Path(r"C:\Users\bilou\Documents\work\SnoutScore\app\(app)\(tabs)\stories.tsx")
t = p.read_text(encoding="utf-8")
t = t.replace(
    "post.liked ? brand.score.poor : brand.navy",
    "post.liked ? brand.rose : brand.muted",
)
repls = [
    ("border-forest-100", "border-sand-300"),
    ("text-forest-900", "text-snout-ink"),
    ("text-forest-800", "text-snout-ink"),
    ("text-forest-700", "text-snout-navy"),
    ("text-forest-600", "text-snout-muted"),
    ("text-forest-500", "text-snout-muted"),
    ("bg-forest-100", "bg-sand-200"),
    ("bg-forest-50", "bg-sand-50"),
    ("border-forest-200", "border-sand-300"),
]
for a, b in repls:
    t = t.replace(a, b)
p.write_text(t, encoding="utf-8")
print("ok", t.count("text-snout-ink"))
