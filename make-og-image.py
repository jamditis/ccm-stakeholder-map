#!/usr/bin/env python3
"""Generate the social-preview image (docs/og-image.png, 1200x630).

The card is drawn from the site palette (see the Tailwind config in index.html)
and echoes the favicon's node cluster, so the OG image actually depicts what the
tool does: a small relationship map plus the six stakeholder categories. Text is
rendered with the system DejaVu fonts and rasterized with rsvg-convert, so the
output is deterministic and needs no browser.

Run after changing the title, palette, or categories (works from any directory;
the output path is resolved relative to this file):

    python3 make-og-image.py

Requires rsvg-convert and the DejaVu fonts the card is drawn with -- rsvg
silently substitutes another font if they are absent, which would change the
rendering (Debian/Ubuntu: `sudo apt install librsvg2-bin fonts-dejavu-core`).
"""
import html
import os
import subprocess
import tempfile

W, H = 1200, 630
PAPER = "#faf9f7"
INK = "#1a1a1a"
MUTED = "#6b6660"
STONE = "#d8d3cc"

# name -> color, mirroring the category palette in index.html's Tailwind config.
CATS = [
    ("Ally", "#2d9d5d"),
    ("Advocate", "#4a7fc7"),
    ("Decision-maker", "#8b5fc7"),
    ("Obstacle", "#cf5858"),
    ("Dependency", "#d4874c"),
    ("Opportunity", "#c4a82e"),
]

# A small relationship map (bottom-right), echoing favicon.svg. Each node is
# (x, y, radius, fill); edges connect node indices. Hand-placed for balance and
# kept clear of the title/description above and the legend to its left.
NODES = [
    (660, 320, 30, "#2d9d5d"),
    (800, 285, 20, "#1a1a1a"),
    (950, 320, 34, "#4a7fc7"),
    (720, 430, 26, "#8b5fc7"),
    (880, 452, 30, "#c4a82e"),
    (1030, 430, 20, "#d4874c"),
    (835, 372, 16, "#cf5858"),
]
EDGES = [(0, 1), (1, 2), (0, 3), (3, 4), (4, 5), (1, 6), (6, 4), (2, 5), (3, 6)]

OUT = os.path.join(os.path.dirname(__file__), "docs", "og-image.png")


def build_svg():
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">']
    p.append(f'<rect width="{W}" height="{H}" fill="{PAPER}"/>')
    p.append(f'<rect x="16" y="16" width="{W - 32}" height="{H - 32}" fill="none" stroke="{STONE}" stroke-width="2"/>')

    for a, b in EDGES:
        x1, y1 = NODES[a][0], NODES[a][1]
        x2, y2 = NODES[b][0], NODES[b][1]
        p.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{STONE}" stroke-width="3"/>')
    for x, y, r, fill in NODES:
        p.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"/>')

    p.append(f'<text x="80" y="150" font-family="DejaVu Serif" font-weight="bold" font-size="82" fill="{INK}">Stakeholder map</text>')
    p.append(f'<text x="82" y="205" font-family="DejaVu Sans" font-size="31" fill="{MUTED}">Map the allies, obstacles, and relationships around a decision.</text>')

    top = 300
    for i, (name, color) in enumerate(CATS):
        y = top + i * 33
        p.append(f'<circle cx="90" cy="{y - 9}" r="11" fill="{color}"/>')
        p.append(f'<text x="112" y="{y}" font-family="DejaVu Sans" font-size="27" fill="{INK}">{html.escape(name, quote=True)}</text>')

    p.append(f'<line x1="80" y1="505" x2="{W - 80}" y2="505" stroke="{STONE}" stroke-width="2"/>')
    p.append(f'<text x="80" y="551" font-family="DejaVu Sans" font-size="25" fill="{MUTED}">Center for Cooperative Media   ·   jamditis.github.io/ccm-stakeholder-map</text>')

    p.append("</svg>")
    return "\n".join(p)


def main():
    svg = build_svg()
    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as f:
        f.write(svg)
        svg_path = f.name
    try:
        subprocess.run(["rsvg-convert", "-w", str(W), "-h", str(H), svg_path, "-o", OUT], check=True)
    finally:
        os.unlink(svg_path)
    print(f"wrote {OUT} ({W}x{H})")


if __name__ == "__main__":
    main()
