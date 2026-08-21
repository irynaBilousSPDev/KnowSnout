from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(r"C:\Users\bilou\Documents\work\SnoutScore")
SRC = ROOT / "assets" / "brand" / "logo-icon-transparent.png"
BRAND = ROOT / "assets" / "brand"
IMG = ROOT / "assets" / "images"

NAVY = (0x12, 0x2A, 0x4C, 255)
NAVY_DEEP = (0x0C, 0x1C, 0x33, 255)
FOREST = (0x2F, 0x52, 0x33, 255)
ROSE = (0xE8, 0x87, 0x9A, 255)
SURFACE = (0xF7, 0xF1, 0xED, 255)
WHITE = (255, 255, 255, 255)
FOREST_TINT = (0xE3, 0xE9, 0xDF, 255)
ROSE_TINT = (0xF4, 0xDA, 0xDF, 255)


def is_mark_pixel(r: int, g: int, b: int, a: int) -> bool:
    if a < 20:
        return False
    bright = r + g + b
    if bright < 40:
        return False
    mx, mn = max(r, g, b), min(r, g, b)
    sat = mx - mn
    if sat > 25 and bright > 50:
        return True
    if g > 80 and g >= r - 10 and bright > 60:
        return True
    if b > 100 and g > 80 and bright > 80:
        return True
    return False


def extract_mask(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    mask = Image.new("L", (w, h), 0)
    mp = mask.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_mark_pixel(r, g, b, a):
                mp[x, y] = a if a > 0 else 255
    return mask


def paint_mark(mask: Image.Image, color: tuple[int, int, int, int]) -> Image.Image:
    out = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    layer = Image.new("RGBA", mask.size, color)
    return Image.composite(layer, out, mask)


def rounded_tile(
    bg: tuple[int, int, int, int],
    mark_img: Image.Image,
    tile: int = 1024,
    radius_ratio: float = 0.30,
    mark_ratio: float = 0.70,
) -> Image.Image:
    tile_im = Image.new("RGBA", (tile, tile), (0, 0, 0, 0))
    radius = int(tile * radius_ratio)
    rect = Image.new("RGBA", (tile, tile), (0, 0, 0, 0))
    draw = ImageDraw.Draw(rect)
    draw.rounded_rectangle([0, 0, tile - 1, tile - 1], radius=radius, fill=bg)
    tile_im = Image.alpha_composite(tile_im, rect)
    mark_size = int(tile * mark_ratio)
    mark = mark_img.copy()
    mark.thumbnail((mark_size, mark_size), Image.Resampling.LANCZOS)
    mx = (tile - mark.width) // 2
    my = (tile - mark.height) // 2
    tile_im.alpha_composite(mark, (mx, my))
    return tile_im


def save(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG")
    print("saved", path.relative_to(ROOT), im.size)


def main() -> None:
    src = Image.open(SRC)
    mask = extract_mask(src)
    bbox = mask.getbbox()
    mask_c = mask.crop(bbox) if bbox else mask

    navy_mark = paint_mark(mask_c, NAVY)
    white_mark = paint_mark(mask_c, WHITE)
    forest_mark = paint_mark(mask_c, FOREST)
    rose_mark = paint_mark(mask_c, ROSE)

    logo_icon_t = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    nm = navy_mark.copy()
    nm.thumbnail((720, 720), Image.Resampling.LANCZOS)
    logo_icon_t.alpha_composite(nm, ((1024 - nm.width) // 2, (1024 - nm.height) // 2))
    save(logo_icon_t, BRAND / "logo-icon-transparent.png")
    save(logo_icon_t, IMG / "brand-logo-icon.png")
    save(logo_icon_t, IMG / "brand-logo-watermark.png")
    save(logo_icon_t, BRAND / "logo-full-transparent.png")
    save(logo_icon_t, IMG / "brand-logo-full.png")

    logo_icon_surface = Image.new("RGBA", (1024, 1024), SURFACE)
    logo_icon_surface.alpha_composite(logo_icon_t)
    save(logo_icon_surface, BRAND / "logo-icon.png")
    save(logo_icon_surface, BRAND / "logo-full.png")

    app_icon = rounded_tile(NAVY, white_mark, 1024)
    save(app_icon, IMG / "icon.png")
    save(app_icon, IMG / "splash-icon.png")
    save(app_icon.resize((48, 48), Image.Resampling.LANCZOS), IMG / "favicon.png")

    fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    wm = white_mark.copy()
    wm.thumbnail((680, 680), Image.Resampling.LANCZOS)
    fg.alpha_composite(wm, ((1024 - wm.width) // 2, (1024 - wm.height) // 2))
    save(fg, IMG / "android-icon-foreground.png")
    save(Image.new("RGBA", (1024, 1024), NAVY), IMG / "android-icon-background.png")

    mono = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    mm = white_mark.copy()
    mm.thumbnail((680, 680), Image.Resampling.LANCZOS)
    mono.alpha_composite(mm, ((1024 - mm.width) // 2, (1024 - mm.height) // 2))
    save(mono, IMG / "android-icon-monochrome.png")

    tiles = BRAND / "tiles"
    save(rounded_tile(WHITE, navy_mark), tiles / "tile-white-navy.png")
    save(rounded_tile(FOREST_TINT, forest_mark), tiles / "tile-mint-forest.png")
    save(rounded_tile(ROSE_TINT, rose_mark), tiles / "tile-rose.png")
    save(rounded_tile(NAVY, white_mark), tiles / "tile-navy-white.png")
    save(rounded_tile(FOREST, white_mark), tiles / "tile-forest-white.png")
    save(rounded_tile(NAVY_DEEP, rose_mark), tiles / "tile-deep-rose.png")

    coverage = sum(1 for p in mask.getdata() if p > 0)
    print("mask bbox", bbox, "coverage", coverage)


if __name__ == "__main__":
    main()
