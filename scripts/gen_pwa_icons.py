"""Generate PWA icon PNGs from the same geometry as components/sections/
Logo.tsx (viewBox 22x22: ink rounded-square base + two candle bars, green
buy / red sell). Placeholder mark per Logo.tsx's own comment — swap this
script's output whenever the real logo is ready; keeps regenerating all
icon sizes a one-command job instead of hand-editing five PNGs.

Run: python scripts/gen_pwa_icons.py
"""
from PIL import Image, ImageDraw

INK = (11, 11, 16, 255)       # #0b0b10
BORDER = (255, 255, 255, 26)  # white/10
GREEN = (0, 255, 163, 255)    # #00ffa3
RED = (255, 56, 96, 255)      # #ff3860

OUT = {
    "public/icon-512.png": (512, "rounded"),
    "public/icon-512-maskable.png": (512, "maskable"),
    "public/icon-192.png": (192, "rounded"),
    "app/apple-icon.png": (180, "square"),
    "app/icon.png": (32, "rounded"),
}


def draw_candles(draw: ImageDraw.ImageDraw, ox: float, oy: float, unit: float):
    """Draw the two candle bars at (ox, oy) origin, `unit` px per SVG unit."""
    def rect(x, y, w, h, color, radius=0):
        x0, y0 = ox + x * unit, oy + y * unit
        x1, y1 = ox + (x + w) * unit, oy + (y + h) * unit
        if radius > 0:
            draw.rounded_rectangle([x0, y0, x1, y1], radius=radius * unit, fill=color)
        else:
            draw.rectangle([x0, y0, x1, y1], fill=color)

    rect(6, 5, 3, 8, GREEN, radius=1)
    rect(6.9, 3, 1.2, 12, GREEN)
    rect(13, 9, 3, 8, RED, radius=1)
    rect(13.9, 7, 1.2, 12, RED)


def make_icon(size: int, style: str) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if style == "rounded":
        draw.rounded_rectangle([0, 0, size - 1, size - 1],
                               radius=size * 6 / 22, fill=INK, outline=BORDER, width=max(1, size // 200))
        draw_candles(draw, 0, 0, size / 22)
    elif style == "square":
        # iOS applies its own corner mask — ship a full-bleed square, no
        # alpha (iOS renders transparent pixels as black).
        draw.rectangle([0, 0, size - 1, size - 1], fill=INK)
        draw_candles(draw, 0, 0, size / 22)
        img = img.convert("RGB")
    elif style == "maskable":
        # Maskable icons get clipped to arbitrary shapes (circle, squircle,
        # ...) by the OS — keep all art inside the centered ~80% "safe
        # zone" per the W3C maskable-icon spec, full-bleed background so
        # no edge shows through whatever mask is applied.
        draw.rectangle([0, 0, size - 1, size - 1], fill=INK)
        safe = size * 0.8
        pad = (size - safe) / 2
        draw_candles(draw, pad, pad, safe / 22)

    return img


if __name__ == "__main__":
    import os
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for rel_path, (size, style) in OUT.items():
        img = make_icon(size, style)
        out_path = os.path.join(root, rel_path)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        img.save(out_path)
        print(f"  {rel_path}: {size}x{size} ({style}) -> {img.mode}")
    print("done")
