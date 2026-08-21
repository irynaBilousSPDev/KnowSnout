from pathlib import Path
import re

root = Path(r"C:\Users\bilou\Downloads\KnowSnout UI Design Setup (2)\KnowSnout_project")
print("=== files ===")
for p in sorted(root.rglob("*")):
    if p.is_file():
        print(f"{p.relative_to(root)} ({p.stat().st_size})")

print("\n=== token hits per module HTML ===")
for path in sorted(root.glob("KnowSnout*.dc.html")):
    t = path.read_text(encoding="utf-8", errors="replace")
    styles = re.findall(r"href=['\"]([^'\"]*styles\.css)['\"]", t)
    organic = (
        t.lower().count("f5ead8")
        + t.lower().count("c67139")
        + t.count("Caprasimo")
        + t.count("Figtree")
    )
    teal = t.count("0E6E5D") + t.count("F4F3F1") + t.count("Manrope") + t.count("Inter")
    print(
        f"{path.name}: styles={styles} organic={organic} teal={teal} len={len(t)}"
    )

# compare with Downloads/knowsnout pack sizes
print("\n=== compare vs Downloads/knowsnout ===")
a = Path(r"C:\Users\bilou\Downloads\knowsnout")
b = root
for name in [
    "KnowSnout UI Kit.dc.html",
    "KnowSnout Брендбук.dc.html",
]:
    pa, pb = a / name, b / name
    print(name, "downloads", pa.exists() and pa.stat().st_size, "setup2", pb.exists() and pb.stat().st_size)

# peek CSS vars inside first module of setup2
mod = next(root.glob("KnowSnout - *.dc.html"))
t = mod.read_text(encoding="utf-8", errors="replace")
vars_ = re.findall(r"--(color-[a-z0-9-]+|font-[a-z0-9-]+)\s*:\s*([^;]+);", t)
print(f"\n=== vars sample from {mod.name} ===")
for k, v in vars_[:25]:
    print(f"--{k}: {v.strip()}")
