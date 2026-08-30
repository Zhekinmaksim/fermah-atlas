#!/usr/bin/env python3
"""
Fermah Atlas — pixel brand assets.

The mark is a pixel A — for Atlas. It is deliberately NOT the Fermah pi: this
archive is unofficial, so its identity has to be its own. The wordmarks are Space Grotesk, pixelated on the
same 16-row grid, so nothing here is traced from Fermah's logo files.

    python atlas_mark.py            # writes atlas-brand/
"""
import os

import cairosvg

NAVY, TEAL, WHITE, OFF_LIGHT = "#001030", "#06C19D", "#FFFFFF", "#0B1E40"
GAP_RATIO = 0.16
WORD_GAP = 6          # empty cells between FERMAH and ATLAS in the lockup

PI_GRID = [
    "......T......",
    ".....TTT.....",
    ".....TTT.....",
    "....TT.TT....",
    "....TT.TT....",
    "...TT...TT...",
    "...TT...TT...",
    "..TT.....TT..",
    "..TTTTTTTTT..",
    ".TTT.....TTT.",
    ".TT.......TT.",
    "TTT.......TTT",
    "TTT.......TTT",
    "TTTT.....TTTT",
]

FERMAH_WORD = [
    "WWWWWWWWWW..WWWWWWWWWW..WWWWWWWWW.....WWWWW......WWWWWW.....WWWWWW.....WWW......WWW",
    "WWWWWWWWWW..WWWWWWWWWW..WWWWWWWWWWW...WWWWW......WWWWWW.....WWWWWW.....WWW......WWW",
    "WWWWWWWWWW..WWWWWWWWWW..WWWWWWWWWWW...WWWWWW.....WWWWWW....WWW.WWW.....WWW......WWW",
    "WWW.........WWW.........WWW.....WWWW..WWWWWW....WWW.WWW....WWW.WWW.....WWW......WWW",
    "WWW.........WWW.........WWW.....WWWW..WWWWWW....WWW.WWW....WWW..WWW....WWW......WWW",
    "WWW.........WWW.........WWW......WWW..WWWWWW....WWW.WWW....WWW..WWW....WWW......WWW",
    "WWW.........WWW.........WWW.....WWW...WWW.WW....WWW.WWW...WWW...WWW....WWW.....WWWW",
    "WWWWWWWWWW..WWWWWWWWW...WWWWWWWWWW....WWW.WWW...WW..WWW...WWW...WWW....WWWWWWWWWWWW",
    "WWWWWWWWWW..WWWWWWWWW...WWWWWWWWWW....WWW.WWW..WWW..WWW...WWW....WWW...WWWWWWWWWWWW",
    "WWW.........WWW.........WWWWWWWWWWW...WWW.WWW..WWW..WWW...WWW....WWW...WWW.....WWWW",
    "WWW.........WWW.........WWW.....WWW...WWW.WWW..WWW..WWW..WWWWWWWWWWW...WWW......WWW",
    "WWW.........WWW.........WWW.....WWW...WWW..WW..WWW..WWW..WWWWWWWWWWW...WWW......WWW",
    "WWW.........WWW.........WWW.....WWW...WWW..WWW.WW...WWW..WWWWWWWWWWWW..WWW......WWW",
    "WWW.........WWWWWWWWWW..WWW.....WWW...WWW..WWWWWW...WWW..WWW......WWW..WWW......WWW",
    "WWW.........WWWWWWWWWW..WWW.....WWW...WWW..WWWWWW...WWW.WWW.......WWW..WWW......WWW",
    "WWW.........WWWWWWWWWW..WWW.....WWW...WWW..WWWWWW...WWW.WWW.......WWW..WWW......WWW",
]

ATLAS_GRID = [
    "....WWWWW.....WWWWWWWWWWW..WWW...........WWWWW........WWWWW....",
    "....WWWWW....WWWWWWWWWWWW..WWW...........WWWWWW.....WWWWWWWWW..",
    "...WWWWWWW...WWWWWWWWWWWW..WWW...........WWWWWW.....WWWWWWWWWW.",
    "...WWW.WWW........WWW......WWW..........WWW.WWW....WWW.....WWW.",
    "...WWW.WWW........WWW......WWW..........WWW.WWW....WWW.....WWW.",
    "...WWW..WWW.......WWW......WWW..........WWW..WWW...WWWW.....WW.",
    "..WWW...WWW.......WWW......WWW.........WWW...WWW....WWWWW......",
    "..WWW...WWW.......WWW......WWW.........WWW...WWW....WWWWWWWW...",
    "..WWW...WWW.......WWW......WWW.........WWW...WWW......WWWWWWWW.",
    "..WWW...WWWW......WWW......WWW.........WWW...WWWW.........WWWW.",
    ".WWWWWWWWWWW......WWW......WWW........WWWWWWWWWWW..WWW......WWW",
    ".WWWWWWWWWWW......WWW......WWW........WWWWWWWWWWW..WWW......WWW",
    ".WWW.....WWW......WWW......WWW........WWW.....WWW..WWW.....WWWW",
    ".WWW......WWW.....WWW......WWWWWWWWWW.WWW......WWW..WWWWWWWWWW.",
    "WWW.......WWW.....WWW......WWWWWWWWWWWWW.......WWW..WWWWWWWWW..",
    "WWW.......WWW.....WWW......WWWWWWWWWWWWW.......WWW....WWWWWW...",
]


MARK_INLINE = [
    ".............",
    "......T......",
    ".....TTT.....",
    ".....TTT.....",
    "....TT.TT....",
    "....TT.TT....",
    "...TT...TT...",
    "...TT...TT...",
    "..TT.....TT..",
    "..TTTTTTTTT..",
    ".TTT.....TTT.",
    ".TT.......TT.",
    "TTT.......TTT",
    "TTT.......TTT",
    "TTTT.....TTTT",
    ".............",
]

TLAS_WORD = [
    "TTTTTTTTTTTT..TT............TTTTT.......TTTTTT...",
    "TTTTTTTTTTTT.TTT...........TTTTTT......TTTTTTTT..",
    "TTTTTTTTTTTT.TTT...........TTTTTT.....TTTTTTTTTT.",
    "....TTT......TTT...........TTT.TTT....TTT....TTTT",
    "....TTT......TTT...........TT..TTT....TTT.....TTT",
    "....TTT......TTT..........TTT..TTT....TTT.....TTT",
    "....TTT......TTT..........TTT..TTT....TTTTTT.....",
    "....TTT......TTT..........TTT...TTT....TTTTTTTT..",
    "....TTT......TTT..........TT....TTT......TTTTTTT.",
    "....TTT......TTT.........TTTT...TTT.........TTTTT",
    "....TTT......TTT.........TTTTTTTTTT..TTT......TTT",
    "....TTT......TTT.........TTTTTTTTTTT.TTT......TTT",
    "....TTT......TTT........TTTT.....TTT..TTT.....TTT",
    "....TTT......TTTTTTTTTT.TTT......TTT..TTTTTTTTTTT",
    "....TTT......TTTTTTTTTT.TTT......TTTT..TTTTTTTTT.",
    ".....TT.......TTTTTTTTT.TTT.......TTT....TTTTT...",
]


def cells(grid, x, y, cell, gap, force=None, off=None):
    out = []
    for r, row in enumerate(grid):
        for c, ch in enumerate(row):
            fill = off if ch == "." else (force or (TEAL if ch == "T" else WHITE))
            if fill is None:
                continue
            out.append(
                f'<rect x="{x + c * (cell + gap):.2f}" y="{y + r * (cell + gap):.2f}" '
                f'width="{cell:.2f}" height="{cell:.2f}" fill="{fill}"/>'
            )
    return "".join(out)


def mark_svg(size=520, bg=None, inset=0.0, force=None, gap_ratio=GAP_RATIO):
    """Square pi mark."""
    n = len(PI_GRID)
    inner = size * (1 - inset * 2)
    cell = inner / (n + (n - 1) * gap_ratio)
    gap = cell * gap_ratio
    o = (size - (n * cell + (n - 1) * gap)) / 2
    back = f'<rect width="{size}" height="{size}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
            f'viewBox="0 0 {size} {size}">{back}{cells(PI_GRID, o, o, cell, gap, force)}</svg>')


def lockup_svg(cell=7.0, bg=None, atlas=True, pad=0):
    """FERMAH ATLAS, where the A of ATLAS is the Atlas mark itself."""
    gap = cell * GAP_RATIO
    u = cell + gap
    rows = len(FERMAH_WORD)
    w1, wm, w2 = len(FERMAH_WORD[0]), len(MARK_INLINE[0]), len(TLAS_WORD[0])
    total_c = w1 + (WORD_GAP + wm + 1 + w2 if atlas else 0)
    W = total_c * u - gap + pad * 2
    H = rows * u - gap + pad * 2

    parts = [f'<rect width="{W:.1f}" height="{H:.1f}" fill="{bg}"/>'] if bg else []
    parts.append(cells(FERMAH_WORD, pad, pad, cell, gap, force=WHITE))
    if atlas:
        xa = pad + (w1 + WORD_GAP) * u
        parts.append(cells(MARK_INLINE, xa, pad, cell, gap, force=TEAL))
        parts.append(cells(TLAS_WORD, xa + (wm + 1) * u, pad, cell, gap, force=TEAL))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W:.1f}" height="{H:.1f}" '
            f'viewBox="0 0 {W:.1f} {H:.1f}">{"".join(parts)}</svg>')


def banner_svg(w=1500, h=500, cell=None, tagline=None, mark=False):
    """X header. Same lockup, centred, clear of the avatar corner."""
    rows = len(FERMAH_WORD)
    w1, wm, w2 = len(FERMAH_WORD[0]), len(MARK_INLINE[0]), len(TLAS_WORD[0])
    total_c = w1 + WORD_GAP + wm + 1 + w2
    if cell is None:
        cell = (w * 0.62) / (total_c * (1 + GAP_RATIO))
    gap = cell * GAP_RATIO
    u = cell + gap
    x0 = (w - (total_c * u - gap)) / 2
    block = rows * u - gap + (cell * 8.6 if tagline else 0)
    y0 = (h - block) / 2

    parts = [f'<rect width="{w}" height="{h}" fill="{NAVY}"/>',
             cells(FERMAH_WORD, x0, y0, cell, gap, force=WHITE)]
    xa = x0 + (w1 + WORD_GAP) * u
    parts.append(cells(MARK_INLINE, xa, y0, cell, gap, force=TEAL))
    parts.append(cells(TLAS_WORD, xa + (wm + 1) * u, y0, cell, gap, force=TEAL))
    if tagline:
        parts.append(
            f'<text x="{w / 2:.0f}" y="{y0 + rows * u + cell * 7.2:.0f}" text-anchor="middle" '
            f'font-family="JetBrains Mono" font-size="{cell * 1.7:.0f}" letter-spacing="{cell * 0.6:.1f}" '
            f'fill="#55627F">{tagline}</text>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}">{"".join(parts)}</svg>')


def main(out="atlas-brand"):
    os.makedirs(out, exist_ok=True)
    files = {
        "fermah-pi-mark.svg": mark_svg(520),
        "fermah-pi-on-navy.svg": mark_svg(520, bg=NAVY),
        "lockup-fermah-atlas.svg": lockup_svg(),
        "lockup-fermah-atlas-on-navy.svg": lockup_svg(bg=NAVY, pad=24),
        "lockup-fermah.svg": lockup_svg(atlas=False),
        "atlas-avatar.svg": mark_svg(1000, bg=NAVY, inset=0.17),
        "x-banner.svg": banner_svg(),
        "x-banner-tagline.svg": banner_svg(tagline="UNOFFICIAL COMMUNITY ARCHIVE"),
    }
    for name, svg in files.items():
        open(os.path.join(out, name), "w").write(svg)

    # X accepts up to 2048px; render from a large source so the pixel edges stay crisp
    for px in (2048, 1500, 1000, 400):
        cairosvg.svg2png(bytestring=mark_svg(4096, bg=NAVY, inset=0.17).encode(),
                         write_to=f"{out}/atlas-avatar-{px}.png", output_width=px, output_height=px)
    cairosvg.svg2png(bytestring=mark_svg(4096, inset=0.17).encode(),
                     write_to=f"{out}/atlas-avatar-2048-transparent.png",
                     output_width=2048, output_height=2048)
    for px in (32, 64, 180):
        cairosvg.svg2png(bytestring=mark_svg(px * 8, bg=NAVY, inset=0.08).encode(),
                         write_to=f"{out}/atlas-icon-{px}.png", output_width=px, output_height=px)
    cairosvg.svg2png(bytestring=lockup_svg(bg=NAVY, pad=24).encode(),
                     write_to=f"{out}/lockup-fermah-atlas.png", output_width=1600)
    for name, svg in (("x-banner", banner_svg()),
                      ("x-banner-tagline", banner_svg(tagline="UNOFFICIAL COMMUNITY ARCHIVE")),
                      ("x-banner-tagline2", banner_svg(tagline="FERMAHATLAS.XYZ"))):
        cairosvg.svg2png(bytestring=svg.encode(), write_to=f"{out}/{name}.png",
                         output_width=1500, output_height=500)
    print("wrote", out)


if __name__ == "__main__":
    main()
