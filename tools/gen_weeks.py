#!/usr/bin/env python3
"""
Fermah Atlas — season statistics and one page per week.

Everything here is computed from site/data/seed.json, so it rebuilds itself every
time a week is added:

    python gen_weeks.py --site site

Writes:
  site/data/stats.js      window.STATS, read by stats.html
  site/week/<n>.html      one static page per announcement, with its own og tags
  sitemap.xml             re-written to include the week pages
"""
import argparse
import json
import os
import re
from collections import Counter, defaultdict
from datetime import date
from html import escape

DOMAIN = "https://fermahatlas.xyz"
MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]


def day(iso):
    _, m, d = (int(p) for p in iso.split("-"))
    return f"{MONTHS[m - 1]} {d}"


# --------------------------------------------------------------------------- #
#  statistics                                                                  #
# --------------------------------------------------------------------------- #
def build_stats(seed):
    weeks = seed["source_summary"]["weeks"]
    dates = seed["source_summary"]["week_dates"]
    last = max(weeks)

    rec = {}                                     # handle -> {week: tier}
    for c in seed["creators"]:
        if c.get("suspended"):
            continue
        d = {}
        for x in c["contributions"]:
            prev = d.get(x["week_label"])
            # a selection outranks a mention outranks a collab credit
            rank = {"spotlight": 3, "honourable_mention": 2, "collab": 1}
            if prev is None or rank[x["tier"]] > rank[prev]:
                d[x["week_label"]] = x["tier"]
        rec[c["display_handle"]] = d

    def runs(d, want):
        """All maximal runs of consecutive weeks where want(tier) holds."""
        out, cur = [], []
        for w in weeks:
            if w in d and want(d[w]):
                cur.append(w)
            else:
                if cur:
                    out.append(cur)
                cur = []
        if cur:
            out.append(cur)
        return out

    sel_runs, any_runs, gaps, tierups = [], [], [], []
    for h, d in rec.items():
        for r in runs(d, lambda t: t == "spotlight"):
            sel_runs.append({"handle": h, "length": len(r), "from": r[0], "to": r[-1],
                             "active": r[-1] == last})
        for r in runs(d, lambda t: True):
            any_runs.append({"handle": h, "length": len(r), "from": r[0], "to": r[-1],
                             "active": r[-1] == last})
        present = sorted(d)
        for a, b in zip(present, present[1:]):
            if b - a > 1:
                gaps.append({"handle": h, "weeks": b - a - 1, "from": a, "back": b})
        for w in present:
            if d[w] == "spotlight" and d.get(w - 1) == "honourable_mention":
                tierups.append({"handle": h, "week": w})

    sel_runs.sort(key=lambda r: (-r["length"], -r["to"]))
    any_runs.sort(key=lambda r: (-r["length"], -r["to"]))
    gaps.sort(key=lambda g: (-g["weeks"], -g["back"]))
    tierups.sort(key=lambda t: -t["week"])

    seen, per_week = set(), []
    for w in weeks:
        here = [h for h, d in rec.items() if w in d]
        new = [h for h in here if h not in seen]
        sel = [h for h in here if rec[h][w] == "spotlight"]
        men = [h for h in here if rec[h][w] == "honourable_mention"]
        per_week.append({"week": w, "date": dates[str(w)], "selected": len(sel),
                         "mentioned": len(men), "new": len(new), "returning": len(here) - len(new)})
        seen.update(here)

    leaders = sorted(
        ({"handle": h, "selected": sum(1 for t in d.values() if t == "spotlight"),
          "weeks": len(d)} for h, d in rec.items()),
        key=lambda x: (-x["selected"], -x["weeks"], x["handle"].lower()))

    spread = Counter(len(d) for d in rec.values())
    one_timers = spread.get(1, 0)

    # retention: how many creators came back at least once after their first week
    came_back = sum(1 for d in rec.values() if len(d) > 1)

    return {
        "last_week": last,
        "last_date": dates[str(last)],
        "creators": len(rec),
        "selections": sum(x["selected"] for x in per_week),
        "mentions": sum(x["mentioned"] for x in per_week),
        "per_week": per_week,
        "selection_runs": sel_runs[:10],
        "active_selection_runs": [r for r in sel_runs if r["active"]][:6],
        "appearance_runs": any_runs[:10],
        "active_appearance_runs": [r for r in any_runs if r["active"]][:6],
        "gaps": gaps[:8],
        "tierups": tierups[:12],
        "tierup_total": len(tierups),
        "leaders": leaders[:12],
        "spread": {str(k): v for k, v in sorted(spread.items())},
        "one_timers": one_timers,
        "came_back": came_back,
    }, rec


# --------------------------------------------------------------------------- #
#  week pages                                                                  #
# --------------------------------------------------------------------------- #
WEEK_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Week {wk} — Fermah Community Spotlight | Fermah Atlas</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="Fermah Community Spotlight — Week {wk}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{domain}/brand/x-banner.png">
<meta property="og:url" content="{domain}/week/{wk}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{domain}/week/{wk}">
<meta name="theme-color" content="#001030">
<link rel="icon" href="../brand/atlas-icon-64.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/site.css">
</head>
<body class="week-page">

<section class="wrap" style="padding-block:clamp(64px,8vh,104px) clamp(28px,4vh,44px)">
  <p class="eyebrow">Community Spotlight · {date}</p>
  <h1>Week {wk}.</h1>
  <p class="lede">{lede}</p>
  <div class="stats">
    <span><b class="teal">{n_sel}</b>SELECTED</span>
    <span><b>{n_men}</b>MENTIONED</span>
    <span><b>{n_new}</b>NEW TO THE ARCHIVE</span>
  </div>
</section>

<hr class="rule">

<section class="wrap">
  <p class="eyebrow">Selected</p>
  <div class="wk-list">{sel}</div>
  {collab}
</section>

<hr class="rule">

<section class="wrap">
  <p class="eyebrow">Honourable mentions</p>
  <div class="wk-list two">{men}</div>
</section>

<hr class="rule">

<section class="wrap">
  <div class="wk-nav">
    {prev}
    <a class="btn" href="../stats.html">Season statistics</a>
    {next}
  </div>
  <p class="hint" style="margin-top:22px;max-width:70ch">Rebuilt from the official announcement —
    X handles only. Collab credits name only creators the team itself identified by X handle
    in an earlier announcement.</p>
</section>

<script src="../data/seed.js"></script>
<script src="../assets/atlas.js"></script>
<script src="../assets/assistant.js"></script>
<script src="../assets/music.js"></script>
<script>
try {{ mountChrome("stats.html", "../"); }} catch (e) {{}}
try {{ mountFreshness(window.SEED); }} catch (e) {{}}
</script>
</body>
</html>
"""


def week_row(h, entry, note, has_page):
    link = f'../c/{h.lower()}.html' if has_page else None
    name = (f'<a href="{link}">@{escape(h)}</a>' if link else f'@{escape(h)}')
    post = (f'<a class="post" href="{escape(entry["x_url"], quote=True)}" target="_blank" rel="noopener">post ↗</a>'
            if entry and not entry.get("suspended") else "")
    tag = f'<span class="wk-tag">{escape(note)}</span>' if note else ""
    return f'<div class="wk-row"><span class="nm">{name}</span>{tag}{post}</div>'


def build_weeks(seed, rec, stats, site_dir):
    os.makedirs(os.path.join(site_dir, "week"), exist_ok=True)
    weeks = seed["source_summary"]["weeks"]
    dates = seed["source_summary"]["week_dates"]
    by = {c["display_handle"]: c for c in seed["creators"]}
    pages_dir = os.path.join(site_dir, "c")
    seen = set()

    for i, w in enumerate(weeks):
        sel, men, collab = [], [], []
        collab_urls = {x["via_collab"] for c in by.values() for x in c["contributions"]
                       if x["week_label"] == w and x.get("via_collab")}
        for h, d in rec.items():
            if w not in d:
                continue
            entries = [x for x in by[h]["contributions"] if x["week_label"] == w]
            tier_entries = [x for x in entries if x["tier"] == d[w]]
            e = next((x for x in tier_entries if x["x_url"] not in collab_urls),
                     tier_entries[0] if tier_entries else None)
            collaboration = next((x for x in entries if x["x_url"] in collab_urls), None)
            if collaboration:
                collab.append((h, collaboration))
            if d[w] == "spotlight" and e["x_url"] not in collab_urls:
                sel.append((h, e))
            elif d[w] == "honourable_mention":
                men.append((h, e))
            elif d[w] == "collab" and not collaboration:
                collab.append((h, e))

        def note(h):
            d = rec[h]
            if h not in seen and min(d) == w:
                return "first time"
            if d.get(w) == "spotlight" and d.get(w - 1) == "honourable_mention":
                return "up from mention"
            run = 0
            for ww in range(w, 0, -1):
                if d.get(ww) == "spotlight":
                    run += 1
                else:
                    break
            if run >= 2 and d.get(w) == "spotlight":
                return f"{run} in a row"
            prev = [x for x in d if x < w]
            if prev and w - max(prev) > 3:
                return f"back after {w - max(prev) - 1} weeks"
            return ""

        has = lambda h: os.path.exists(os.path.join(pages_dir, h.lower() + ".html"))
        sel_html = "".join(week_row(h, e, note(h), has(h)) for h, e in sel)
        men_html = "".join(week_row(h, e, note(h), has(h)) for h, e in men)
        collab_html = ""
        if collab:
            collab_html = ('<p class="eyebrow wk-collab">Collab of the week</p>'
                           '<div class="wk-list">' +
                           "".join(week_row(h, e, note(h), has(h)) for h, e in collab) + "</div>"
                           '<p class="hint">Only participants with an officially identified X handle are credited.</p>')

        here = [h for h in rec if w in rec[h]]
        new_here = [h for h in here if h not in seen]
        seen.update(here)

        pw = stats["per_week"][i]
        lede = (f"{pw['selected']} selected creators, {pw['mentioned']} mentioned. "
                f"{pw['new']} of {len(here)} names appear in the archive for the first time"
                + ("." if pw["new"] else " — every name had been here before."))
        prev = (f'<a class="btn" href="{weeks[i-1]}.html">← Week {weeks[i-1]}</a>' if i > 0 else "")
        nxt = (f'<a class="btn" href="{weeks[i+1]}.html">Week {weeks[i+1]} →</a>'
               if i < len(weeks) - 1 else "")

        html = WEEK_PAGE.format(
            wk=w, date=day(dates[str(w)]), desc=escape(lede), lede=escape(lede), domain=DOMAIN,
            n_sel=pw["selected"], n_men=pw["mentioned"], n_new=pw["new"],
            sel=sel_html or '<p class="hint">No selections recorded.</p>',
            men=men_html or '<p class="hint">No mentions recorded.</p>',
            collab=collab_html, prev=prev, next=nxt)
        html = "\n".join(line.rstrip() for line in html.splitlines()) + "\n"
        with open(os.path.join(site_dir, "week", f"{w}.html"), "w") as output:
            output.write(html)
    return len(weeks)


def write_sitemap(seed, site_dir):
    pages = ["", "powered", "built-with", "fermafia", "operators", "play",
             "flashcast-season-01", "stats"]
    urls = [f"{DOMAIN}/{p}" for p in pages]
    urls += [f"{DOMAIN}/week/{w}" for w in seed["source_summary"]["weeks"]]
    urls += [f"{DOMAIN}/c/{c['display_handle'].lower()}" for c in seed["creators"]]
    body = "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls)
    with open(os.path.join(site_dir, "sitemap.xml"), "w") as output:
        output.write('<?xml version="1.0" encoding="UTF-8"?>\n'
                     '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "</urlset>\n")
    return len(urls)


def validate_seed(seed):
    weeks = seed["source_summary"]["weeks"]
    if weeks != sorted(set(weeks)):
        raise ValueError("Weeks must be unique and ordered")
    seen = set()
    for creator in seed["creators"]:
        handle = creator["display_handle"]
        if not re.fullmatch(r"[A-Za-z0-9_]{1,15}", handle) or handle.lower() in seen:
            raise ValueError(f"Invalid or duplicate handle: {handle}")
        seen.add(handle.lower())
        for entry in creator["contributions"]:
            if entry["week_label"] not in weeks or entry["tier"] not in {"spotlight", "honourable_mention", "collab"}:
                raise ValueError(f"Invalid recognition for {handle}")
            date.fromisoformat(entry["announcement_date"])
            if entry["announcement_date"] != seed["source_summary"]["week_dates"][str(entry["week_label"])]:
                raise ValueError(f"Announcement date mismatch for {handle}")
            if not re.fullmatch(r"https://(?:www\.)?(?:x|twitter)\.com/[A-Za-z0-9_]+/status/\d+", entry["x_url"]):
                raise ValueError(f"Invalid post URL for {handle}: {entry['x_url']}")


def update_stats_fallback(stats, site_dir):
    file = os.path.join(site_dir, "stats.html")
    with open(file) as source:
        html = source.read()
    for field, value in {"weeks": len(stats["per_week"]), "creators": stats["creators"],
                         "sel": stats["selections"], "men": stats["mentions"]}.items():
        html, count = re.subn(f'(id="s-{field}">)[^<]+', rf'\g<1>{value}', html)
        if count != 1:
            raise ValueError(f"Missing stats counter: {field}")
    with open(file, "w") as output:
        output.write(html)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", default="site")
    a = ap.parse_args()
    with open(os.path.join(a.site, "data", "seed.json")) as source:
        seed = json.load(source)
    validate_seed(seed)
    stats, rec = build_stats(seed)
    with open(os.path.join(a.site, "data", "seed.js"), "w") as output:
        output.write("window.SEED = " + json.dumps(seed, ensure_ascii=False, separators=(",", ":")) + ";\n")
    with open(os.path.join(a.site, "data", "stats.js"), "w") as output:
        output.write("window.STATS = " + json.dumps(stats, ensure_ascii=False, indent=1) + ";\n")
    with open(os.path.join(a.site, "data", "stats.json"), "w") as output:
        json.dump(stats, output, ensure_ascii=False, indent=1)
    update_stats_fallback(stats, a.site)
    n = build_weeks(seed, rec, stats, a.site)
    u = write_sitemap(seed, a.site)
    print(f"stats.js written | {n} week pages | sitemap {u} urls")
    print("longest selection run:", stats["selection_runs"][0])
    print("active selection runs:", stats["active_selection_runs"])
    print("longest gap:", stats["gaps"][0])
    print("creators who came back at least once:", stats["came_back"], "of", stats["creators"])
