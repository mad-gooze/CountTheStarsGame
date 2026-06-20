#!/usr/bin/env python3
"""Generate the Count The Stars store icon and language covers.

Outputs (into this directory):
  icon_512.png                 512x512 app icon
  cover_<lang>_800x470.png     800x470 cover per language (ru/en/tr)

Run:  python3 store/make_assets.py
"""

from asset_lib import (
    OUT_DIR, draw_glow_star, draw_text, font, make_sky, save, text_size,
)
from strings import LANGS, STRINGS


def make_icon():
    """A clean constellation of glowing stars — no text, per icon guidelines."""
    size = 512
    # A loose "constellation" so the icon reads as a star cluster at any scale.
    big = [
        (0.30, 0.28, 30),
        (0.68, 0.22, 22),
        (0.78, 0.55, 26),
        (0.50, 0.52, 40),   # bright centre
        (0.26, 0.70, 24),
        (0.62, 0.78, 20),
    ]
    img = make_sky(size, size, seed=7, n_small=140, big_stars=big)

    # Faint connecting lines to suggest a constellation.
    from PIL import ImageDraw
    d = ImageDraw.Draw(img)
    order = [(0.30, 0.28), (0.50, 0.52), (0.68, 0.22), (0.78, 0.55),
             (0.50, 0.52), (0.26, 0.70), (0.62, 0.78)]
    pts = [(x * size, y * size) for x, y in order]
    d.line(pts, fill=(255, 255, 220, 60), width=2)
    # Redraw stars on top of the lines.
    for rx, ry, r in big:
        draw_glow_star(img, rx * size, ry * size, r)

    save(img, "icon_512.png")


def make_cover(lang):
    w, h = 800, 470
    s = STRINGS[lang]
    big = [
        (0.12, 0.22, 14), (0.85, 0.18, 12), (0.90, 0.62, 16),
        (0.18, 0.78, 13), (0.72, 0.82, 11), (0.50, 0.12, 10),
    ]
    img = make_sky(w, h, seed=20 + len(lang), n_small=110, big_stars=big,
                   avoid=(0.12, 0.30, 0.88, 0.72))
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)

    title_font = font(76)
    slogan_font = font(34)

    tw, _ = text_size(draw, s["heading"], title_font)
    draw_text(draw, (w // 2, h // 2 - 28), s["heading"], title_font,
              anchor="mm")
    # A glowing star dotting the composition near the title.
    draw_glow_star(img, w // 2 + tw // 2 + 34, h // 2 - 48, 10)

    draw_text(draw, (w // 2, h // 2 + 46), s["slogan"], slogan_font,
              fill=(255, 255, 210), anchor="mm")

    save(img, f"cover_{lang}_800x470.png")


def main():
    print(f"Generating icon + covers into {OUT_DIR}")
    make_icon()
    for lang in LANGS:
        make_cover(lang)


if __name__ == "__main__":
    main()
