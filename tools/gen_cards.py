#!/usr/bin/env python3
"""
Fermah Atlas — Fermafia creator cards.

One 1200x630 OG card per creator, rendered straight from the seed. No ranking,
no rarity, no tier: every fact on the card is about that person alone.

    python gen_cards.py --seed fermah_atlas_seed_v2.json --out cards/
    python gen_cards.py --only eam__sha sn0wflakk
"""

import argparse
import base64
import json
import os
from datetime import date
from xml.sax.saxutils import escape

try:
    import cairosvg
except ImportError:
    cairosvg = None

# ---- brand tokens, from the official Fermah brand kit ------------------------
NAVY = "#001030"
TEAL = "#06C19D"
WHITE = "#FFFFFF"
GRAY = "#808898"
DIM = "#22314F"      # weeks the creator was not picked
DASH = "#2A3A5C"     # weeks with no announcement
DIMMER = "#55627F"
FAINT = "#37456A"
RULE = "#16233D"
PERF = "#223353"

DISPLAY = "Helvetica Neue, Arial, sans-serif"
MONO = "JetBrains Mono, Menlo, Consolas, monospace"

W, H = 1200, 630
SEASON_LABEL = "SEASON 01"

PAD_L = 64
MAIN_R = 814
STUB_X = 862
STUB_CX = (STUB_X + W) // 2
COL_W = MAIN_R - PAD_L

CHART_Y, CHART_H = 462, 104
CELL_GAP = 9

MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
          "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

# ---- the Atlas mark: a pixel A, this project's own -------------------------
MARK = [
    "......#......",
    ".....###.....",
    ".....###.....",
    "....##.##....",
    "....##.##....",
    "...##...##...",
    "...##...##...",
    "..##.....##..",
    "..#########..",
    ".###.....###.",
    ".##.......##.",
    "###.......###",
    "###.......###",
    "####.....####",
]


def mark_svg(x, y, cell, gap):
    out = []
    for r, row in enumerate(MARK):
        for c, ch in enumerate(row):
            if ch != ".":
                out.append(f'<rect x="{x + c * (cell + gap):.2f}" y="{y + r * (cell + gap):.2f}" '
                           f'width="{cell:.2f}" height="{cell:.2f}" fill="{TEAL}"/>')
    return "".join(out)


AVATAR_DIR = "site/avatars"


def avatar_href(handle):
    """Inline the avatar so the PNG is self-contained; None when we have none."""
    p = os.path.join(AVATAR_DIR, handle.lower() + ".jpg")
    if not os.path.exists(p):
        return None
    return "data:image/jpeg;base64," + base64.b64encode(open(p, "rb").read()).decode()


def fmt_day(iso):
    _, m, d = (int(p) for p in iso.split("-"))
    return f"{MONTHS[m - 1]} {d}"


def fit(chars, avail, cap):
    return min(cap, int(avail / (max(chars, 1) * 0.62)))


def mono_w(text, size):
    return len(text) * size * 0.6


def legend(y):
    items = [("dash", "no announcement"), ("outline", "mentioned"), ("fill", "selected")]
    out, x_right = [], MAIN_R
    for kind, label in items:
        sw_x = x_right - mono_w(label, 12) - 18
        if kind == "fill":
            out.append(f'<rect x="{sw_x:.1f}" y="{y - 9}" width="11" height="11" fill="{TEAL}"/>')
        elif kind == "outline":
            out.append(f'<rect x="{sw_x + 1:.1f}" y="{y - 8}" width="9" height="9" fill="none" '
                       f'stroke="{TEAL}" stroke-width="2"/>')
        else:
            out.append(f'<rect x="{sw_x:.1f}" y="{y - 7}" width="11" height="4" fill="{DASH}"/>')
        out.append(f'<text x="{x_right:.1f}" y="{y}" font-family="{MONO}" font-size="12" '
                   f'fill="{DIMMER}" text-anchor="end">{label}</text>')
        x_right = sw_x - 18
    return "".join(out)


def fact(x, label, value):
    return (f'<text x="{x}" y="264" font-family="{MONO}" font-size="12" letter-spacing="2.5" '
            f'fill="{DIMMER}">{label}</text>'
            f'<text x="{x}" y="296" font-family="{MONO}" font-size="24" fill="{WHITE}">{value}</text>')


def card_svg(creator, weeks, week_dates):
    handle = creator["display_handle"]
    contribs = sorted(creator["contributions"], key=lambda c: c["week_label"])
    spot = creator["spotlight_count"]
    hm = creator["honourable_mention_count"]
    total_recognitions = spot + hm

    by_week = {}
    for c in contribs:
        if by_week.get(c["week_label"]) != "spotlight":
            by_week[c["week_label"]] = c["tier"]

    longest = run = 0
    for wk in weeks:
        if by_week.get(wk) == "spotlight":
            run += 1
            longest = max(longest, run)
        else:
            run = 0

    first, last = contribs[0]["announcement_date"], contribs[-1]["announcement_date"]
    span = fmt_day(first) if first == last else f"{fmt_day(first)} — {fmt_day(last)}"
    span += f" · {first[:4]}"

    # the stub carries every recognition event: selected + honourable mention
    big = total_recognitions
    big_label = "RECOGNITION" if total_recognitions == 1 else "RECOGNITIONS"

    active = len({c["week_label"] for c in contribs})
    facts = fact(PAD_L, "MENTIONED", str(hm))
    facts += fact(PAD_L + 186, "LONGEST RUN",
                  f'{longest} {"WEEK" if longest == 1 else "WEEKS"}' if longest else "—")
    facts += fact(PAD_L + 372, "WEEKS ACTIVE", f'{active} <tspan fill="{DIMMER}">/ {len(weeks)}</tspan>')
    facts += fact(PAD_L + 558, "FIRST APPEARED", f"WEEK {contribs[0]['week_label']:02d}")

    # --- recognition log: layout adapts to how many entries there are ------
    log = [f'<text x="{PAD_L}" y="344" font-family="{MONO}" font-size="13" letter-spacing="3" '
           f'fill="{DIMMER}">RECOGNITION LOG</text>']
    total_entries = len(contribs)
    if total_entries <= 9:
        n_cols, rows_per_col, size, verbose = 3, 3, 15, True
    elif total_entries <= 16:
        n_cols, rows_per_col, size, verbose = 4, 4, 13, False
    else:
        n_cols, rows_per_col, size, verbose = 6, 4, 12, False
    cap = n_cols * rows_per_col
    col_w = COL_W / n_cols
    row_h = 22 if rows_per_col == 3 else 17

    overflow = total_entries > cap
    visible = cap - 1 if overflow else cap
    for i, ct in enumerate(contribs[:visible]):
        col, row = divmod(i, rows_per_col)
        x = PAD_L + col * col_w
        y = 372 + row * row_h
        is_spot = ct["tier"] == "spotlight"
        s = 9 if verbose else 7
        log.append(
            f'<rect x="{x}" y="{y - s}" width="{s}" height="{s}" fill="{TEAL}"/>' if is_spot else
            f'<rect x="{x + 0.5}" y="{y - s + 0.5}" width="{s - 1}" height="{s - 1}" fill="none" '
            f'stroke="{TEAL}" stroke-width="2"/>')
        tail = (f'<tspan fill="{DIMMER}">  ·  </tspan><tspan fill="{GRAY}">'
                f'{"selected" if is_spot else "mentioned"}</tspan>') if verbose else ""
        log.append(
            f'<text x="{x + s + 9}" y="{y}" font-family="{MONO}" font-size="{size}" fill="{WHITE}">'
            f'W{ct["week_label"]:02d}<tspan fill="{DIMMER}">  ·  </tspan>'
            f'<tspan fill="{GRAY}">{fmt_day(ct["announcement_date"])}</tspan>{tail}</text>')

    if overflow:                       # last slot of the grid carries the count
        col, row = divmod(visible, rows_per_col)
        log.append(f'<text x="{PAD_L + col * col_w}" y="{372 + row * row_h}" '
                   f'font-family="{MONO}" font-size="{size}" '
                   f'fill="{DIMMER}">+{total_entries - visible} more</text>')
    log = "".join(log)

    n = len(weeks)
    gap = CELL_GAP if n <= 20 else max(2.0, CELL_GAP * 20 / n)
    cell_w = (COL_W - gap * (n - 1)) / n
    tick_every = 1 if n <= 20 else (2 if n <= 34 else 4)
    base_y = CHART_Y + CHART_H          # baseline of the bars
    cells, prev_month = [], None
    running, points = 0, []
    for i, wk in enumerate(weeks):
        x = PAD_L + i * (cell_w + gap)
        cx = x + cell_w / 2
        t = by_week.get(wk)

        if t == "spotlight":
            h = CHART_H
            cells.append(f'<rect x="{x:.1f}" y="{base_y - h}" width="{cell_w:.1f}" '
                         f'height="{h}" fill="{TEAL}"/>')
        elif t == "honourable_mention":
            h = CHART_H * 0.45
            cells.append(f'<rect x="{x + 1.5:.1f}" y="{base_y - h + 1.5:.1f}" '
                         f'width="{cell_w - 3:.1f}" height="{h - 3:.1f}" fill="none" '
                         f'stroke="{TEAL}" stroke-width="3"/>')
        elif wk in week_dates:
            cells.append(f'<rect x="{x:.1f}" y="{base_y - 7}" width="{cell_w:.1f}" '
                         f'height="7" fill="{DIM}"/>')
        else:
            dw = cell_w * 0.6
            cells.append(f'<rect x="{x + (cell_w - dw) / 2:.1f}" y="{base_y - 4}" '
                         f'width="{dw:.1f}" height="3" fill="{DASH}"/>')

        running += 1 if t else 0
        points.append((cx, running))

        iso = week_dates.get(wk)
        if iso:
            d = date.fromisoformat(iso)
            if t or i % tick_every == 0:
                cells.append(f'<text x="{cx:.1f}" y="{base_y + 26:.0f}" font-family="{MONO}" '
                             f'font-size="{12 if n <= 24 else 10}" fill="{GRAY if t else FAINT}" '
                             f'text-anchor="middle">{d.day:02d}</text>')
            if d.month != prev_month:
                cells.append(f'<text x="{cx:.1f}" y="{base_y + 40:.0f}" font-family="{MONO}" '
                             f'font-size="9" letter-spacing="1.5" fill="{FAINT}" '
                             f'text-anchor="middle">{MONTHS[d.month - 1]}</text>')
                prev_month = d.month

    # cumulative step line over the bars
    total = running or 1
    def ly(v):
        return base_y - CHART_H * (v / total) * 0.86
    path, prev = [f"M {PAD_L} {ly(0):.1f}"], 0
    for cx, v in points:
        if v != prev:
            path.append(f"L {cx:.1f} {ly(prev):.1f} L {cx:.1f} {ly(v):.1f}")
            prev = v
    path.append(f"L {MAIN_R} {ly(prev):.1f}")
    cells.append(f'<path d="{" ".join(path)}" fill="none" stroke="{WHITE}" stroke-width="2" '
                 f'stroke-opacity="0.85" stroke-linejoin="round"/>')
    cells.append(f'<text x="{MAIN_R}" y="{ly(total) - 10:.1f}" font-family="{MONO}" '
                 f'font-size="13" fill="{WHITE}" text-anchor="end">{total} total</text>')
    cells.append(f'<rect x="{PAD_L}" y="{base_y}" width="{COL_W}" height="1" fill="{RULE}"/>')

    av = avatar_href(handle)
    AV = 96
    hx = PAD_L + (AV + 26 if av else 0)
    avatar = ""
    if av:
        avatar = (f'<clipPath id="av"><rect x="{PAD_L}" y="112" width="{AV}" height="{AV}" rx="2"/></clipPath>'
                  f'<image x="{PAD_L}" y="112" width="{AV}" height="{AV}" href="{av}" '
                  f'clip-path="url(#av)" preserveAspectRatio="xMidYMid slice"/>'
                  f'<rect x="{PAD_L}" y="112" width="{AV}" height="{AV}" fill="none" '
                  f'stroke="{RULE}" rx="2"/>')

    m_cell, m_gap = 8.6, 1.3
    m_side = len(MARK[0]) * m_cell + (len(MARK[0]) - 1) * m_gap

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="{W}" height="{H}" fill="{NAVY}"/>

  <text x="{PAD_L}" y="54" font-family="{MONO}" font-size="15" letter-spacing="4.5"
        fill="{GRAY}">FERMAH · COMMUNITY SPOTLIGHT</text>
  <text x="{MAIN_R}" y="54" font-family="{MONO}" font-size="15" letter-spacing="2.5"
        fill="{DIMMER}" text-anchor="end">{SEASON_LABEL}</text>

  {avatar}
  <text x="{hx}" y="180" font-family="{DISPLAY}" font-weight="700"
        font-size="{fit(len(handle) + 1, COL_W - (AV + 26 if av else 0), 66)}" letter-spacing="-1"
        fill="{WHITE}">@{escape(handle)}</text>

  <rect x="{PAD_L}" y="228" width="{COL_W}" height="1" fill="{RULE}"/>
  {facts}

  {log}

  <text x="{PAD_L}" y="447" font-family="{MONO}" font-size="13" letter-spacing="3"
        fill="{DIMMER}">SEASON TIMELINE · WEEKS 1–{n}</text>
  {legend(447)}
  {"".join(cells)}

  <line x1="{STUB_X}" y1="0" x2="{STUB_X}" y2="{H}" stroke="{PERF}" stroke-width="2"
        stroke-dasharray="10 8"/>
  {mark_svg(STUB_CX - m_side / 2, 56, m_cell, m_gap)}
  <text x="{STUB_CX}" y="380" font-family="{DISPLAY}" font-weight="700" font-size="108"
        letter-spacing="-4" fill="{WHITE}" text-anchor="middle">{big:02d}</text>
  <text x="{STUB_CX}" y="414" font-family="{MONO}" font-size="13" letter-spacing="3"
        fill="{GRAY}" text-anchor="middle">{big_label}</text>
  <text x="{STUB_CX}" y="566" font-family="{DISPLAY}" font-weight="700" font-size="16"
        letter-spacing="2" fill="{WHITE}" text-anchor="middle">FERMAH ATLAS</text>
  <text x="{STUB_CX}" y="590" font-family="{MONO}" font-size="12" fill="{DIMMER}"
        text-anchor="middle">{span}</text>
</svg>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", required=True)
    ap.add_argument("--out", default="cards")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--svg-only", action="store_true",
                    help="write SVG files without rendering PNGs")
    args = ap.parse_args()

    seed = json.load(open(args.seed))
    week_dates = {int(k): v for k, v in seed["source_summary"]["week_dates"].items()}
    weeks = sorted(week_dates)

    creators = seed["creators"]
    if args.only:
        wanted = {h.lstrip("@").lower() for h in args.only}
        creators = [c for c in creators if c["display_handle"].lower() in wanted]

    os.makedirs(args.out, exist_ok=True)
    for c in creators:
        svg = card_svg(c, weeks, week_dates)
        stem = os.path.join(args.out, c["display_handle"].lower())
        open(stem + ".svg", "w").write(svg)
        if args.svg_only:
            continue
        if cairosvg is None:
            raise SystemExit("CairoSVG is not installed; use --svg-only or install CairoSVG with native cairo")
        cairosvg.svg2png(bytestring=svg.encode(), write_to=stem + ".png",
                         output_width=W, output_height=H)
    print(f"{len(creators)} cards -> {args.out}/")


if __name__ == "__main__":
    main()
