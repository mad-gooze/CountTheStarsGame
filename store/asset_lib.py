"""Shared drawing helpers for the Count The Stars store assets.

Everything here matches the game's own look: a deep-navy-to-black diagonal sky
(`linear-gradient(to top right, #003 0%, #000 100%)`) sprinkled with faint
stars and a few large glowing ones using the in-game star gradient
(#ffc8c8 -> #e1e1e1 -> #ffffc8). Text is set in Poiret One, the game font.

Rendering is deterministic: every random choice is driven by a seeded RNG so
re-running the generators reproduces identical images.
"""

import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_PATH = os.path.join(HERE, "fonts", "PoiretOne-Regular.ttf")
OUT_DIR = HERE

# Sky gradient endpoints (bottom-left -> top-right), close to the CSS #003 -> #000.
SKY_NEAR = (8, 10, 55)   # deep navy, bottom-left
SKY_FAR = (0, 0, 0)      # black, top-right

# In-game star gradient stops.
STAR_CORE = (255, 240, 240)   # near-white pink core
STAR_GLOW = (255, 255, 200)   # pale-yellow halo

WHITE = (255, 255, 255)


# --------------------------------------------------------------------------- #
# Fonts                                                                        #
# --------------------------------------------------------------------------- #

def font(size):
    """Load Poiret One at the given pixel size."""
    return ImageFont.truetype(FONT_PATH, size)


def text_size(draw, text, fnt):
    """Return (width, height) of `text` rendered with `fnt`."""
    l, t, r, b = draw.textbbox((0, 0), text, font=fnt)
    return r - l, b - t


def draw_text(draw, xy, text, fnt, fill=WHITE, anchor="la", shadow=True):
    """Draw text with a soft dark shadow, mirroring the game's text-shadow."""
    x, y = xy
    if shadow:
        for dx, dy in ((0, 2), (2, 0), (0, -2), (-2, 0), (2, 2), (-2, -2)):
            draw.text((x + dx, y + dy), text, font=fnt, fill=(0, 0, 0, 180),
                      anchor=anchor)
    draw.text((x, y), text, font=fnt, fill=fill, anchor=anchor)


def wrap_text(draw, text, fnt, max_width):
    """Greedy word-wrap `text` to fit `max_width`; returns a list of lines."""
    words = text.split()
    lines, line = [], ""
    for word in words:
        trial = f"{line} {word}".strip()
        if text_size(draw, trial, fnt)[0] <= max_width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


# --------------------------------------------------------------------------- #
# Sky background                                                               #
# --------------------------------------------------------------------------- #

def _diagonal_gradient(w, h):
    """Navy (bottom-left) -> black (top-right) diagonal gradient.

    Rendered on a downscaled grid for speed, then resized up smoothly.
    """
    sw, sh = max(2, w // 8), max(2, h // 8)
    grad = Image.new("RGB", (sw, sh))
    px = grad.load()
    for y in range(sh):
        for x in range(sw):
            # t = 0 at bottom-left, 1 at top-right.
            t = ((x / (sw - 1)) + (1 - y / (sh - 1))) / 2
            px[x, y] = tuple(
                round(SKY_NEAR[i] + (SKY_FAR[i] - SKY_NEAR[i]) * t)
                for i in range(3)
            )
    return grad.resize((w, h), Image.BICUBIC)


def draw_glow_star(img, cx, cy, radius, intensity=1.0):
    """Draw a single glowing star (pale-yellow halo + bright core) onto `img`."""
    pad = int(radius * 6) + 4
    size = pad * 2
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    # Halo: a soft blurred disc in the glow colour.
    halo_r = radius * 3
    d.ellipse(
        [pad - halo_r, pad - halo_r, pad + halo_r, pad + halo_r],
        fill=STAR_GLOW + (int(110 * intensity),),
    )
    layer = layer.filter(ImageFilter.GaussianBlur(radius * 1.6))

    # Core: crisp bright centre with a faint pink edge.
    d = ImageDraw.Draw(layer)
    d.ellipse(
        [pad - radius, pad - radius, pad + radius, pad + radius],
        fill=STAR_CORE + (255,),
    )
    inner = max(1, int(radius * 0.45))
    d.ellipse(
        [pad - inner, pad - inner, pad + inner, pad + inner],
        fill=WHITE + (255,),
    )

    img.alpha_composite(layer, (int(cx) - pad, int(cy) - pad))


def _in_avoid(rx, ry, avoid):
    """True when relative point (rx, ry) lands inside the avoid rectangle."""
    if avoid is None:
        return False
    x0, y0, x1, y1 = avoid
    return x0 <= rx <= x1 and y0 <= ry <= y1


def make_sky(w, h, seed, n_small=None, big_stars=None, avoid=None):
    """Build an RGBA night sky: gradient + faint scattered stars + glowing ones.

    `big_stars` is an optional list of (rel_x, rel_y, radius) using 0..1
    coordinates; when omitted a pleasant default scatter is generated.

    `avoid` is an optional (x0, y0, x1, y1) relative rectangle kept clear of
    glowing stars so it doesn't compete with overlaid text. Faint dust still
    fills it, which reads fine behind copy.
    """
    rng = random.Random(seed)
    img = _diagonal_gradient(w, h).convert("RGBA")
    draw = ImageDraw.Draw(img)

    # Faint background dust (allowed everywhere; too subtle to hurt text).
    if n_small is None:
        n_small = int(w * h * 0.00018)
    for _ in range(n_small):
        x, y = rng.randint(0, w - 1), rng.randint(0, h - 1)
        r = rng.choice([0, 0, 0, 1, 1, 2])
        b = rng.randint(120, 220)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(b, b, b, rng.randint(60, 200)))

    # A scatter of small glowing stars, skipping the text-safe zone.
    placed = 0
    target = int(w * h * 0.000012)
    while placed < target:
        rx, ry = rng.random(), rng.random()
        if _in_avoid(rx, ry, avoid):
            continue
        draw_glow_star(img, rx * w, ry * h, rng.randint(2, 4), intensity=0.7)
        placed += 1

    # Prominent glowing stars.
    if big_stars is None:
        big_stars = []
        while len(big_stars) < 6:
            rx, ry = rng.uniform(0.05, 0.95), rng.uniform(0.05, 0.95)
            if _in_avoid(rx, ry, avoid):
                continue
            big_stars.append(
                (rx, ry,
                 rng.randint(int(min(w, h) * 0.012), int(min(w, h) * 0.022)))
            )
    for rx, ry, radius in big_stars:
        draw_glow_star(img, rx * w, ry * h, radius)

    return img


def save(img, name):
    """Save `img` as a 24-bit (or RGBA) PNG into the store directory."""
    path = os.path.join(OUT_DIR, name)
    img.convert("RGBA").save(path)
    print(f"  wrote {name} ({img.size[0]}x{img.size[1]})")
    return path
