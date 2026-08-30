#!/usr/bin/env python3
"""
Fermah Atlas — per-creator pages, sitemap and robots.

One page per creator at /c/<handle>.html. Each carries its own title and its own
og:image, so when someone posts their link X unfurls their card instead of the
generic banner. Also writes sitemap.xml and robots.txt covering every page.

    python gen_pages.py --seed site/data/seed.json --site site
"""

import argparse
import json
import os
import re
from html import escape

DOMAIN = "https://fermahatlas.xyz"
MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
          "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>@{handle} — Community Spotlight record | Fermah Atlas</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="@{handle} — Fermah Community Spotlight record">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{domain}/cards/{slug}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="{domain}/c/{slug}">
<meta property="og:type" content="profile">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="@{handle} — Fermah Community Spotlight record">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{domain}/cards/{slug}.png">
<link rel="canonical" href="{domain}/c/{slug}">
<meta name="theme-color" content="#001030">
<link rel="icon" href="../brand/atlas-icon-64.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/site.css">
</head>
<body>

<section class="wrap" style="padding-block:clamp(56px,7vh,96px) clamp(32px,4vh,56px)">
  <p class="eyebrow">Community Spotlight record</p>
  <div class="creator-head">{avatar}
    <h1 style="font-size:clamp(30px,4.6vw,60px);margin:14px 0 10px">@{handle}</h1></div>
  <p class="lede">{summary}</p>
</section>

<section class="wrap" style="padding-block:0 clamp(40px,5vh,72px)">
  <div class="creator-split">
    <div>
      <img class="creator-card" src="../cards/{slug}.png"
           alt="Community Spotlight card for @{handle}" width="1200" height="630">
      <div class="acts">
        {actions}
      </div>
    </div>
    <aside class="panelbox">
      <div class="head"><span>THE RECORD</span><b>{big}</b></div>
      <ol class="record">{items}</ol>
      <a class="foot" href="../fermafia.html">ALL CREATORS →</a>
    </aside>
  </div>
</section>

<section class="wrap" style="padding-block:0 clamp(48px,6vh,80px)">
  <p class="hint" style="max-width:70ch">Rebuilt from the official Community Spotlight
    announcements — X handles only, nothing self-reported. Something wrong, or want this page
    gone? <a href="../fermafia.html#feedback" style="color:var(--teal)">Tell me</a> and it is
    fixed or removed, no questions.</p>
</section>

<script src="../data/seed.js"></script>
<script src="../assets/atlas.js"></script>
<script src="../assets/assistant.js"></script>
<script src="../assets/music.js"></script>
<script>
try {{ mountChrome("fermafia.html", "../"); }} catch (e) {{ console.error(e); }}
try {{ mountFreshness(window.SEED); }} catch (e) {{}}
</script>
</body>
</html>
"""


def day(iso):
    _, m, d = (int(p) for p in iso.split("-"))
    return f"{MONTHS[m - 1]} {d}"


def summary_of(c):
    bits = []
    if c["spotlight_count"]:
        bits.append(f'selected {c["spotlight_count"]}x')
    if c["honourable_mention_count"]:
        bits.append(f'mentioned {c["honourable_mention_count"]}x')
    weeks = sorted({x["week_label"] for x in c["contributions"]})
    return (", ".join(bits) or "in the archive") + \
           f' in the Fermah Community Spotlight, across {len(weeks)} ' + \
           ("week" if len(weeks) == 1 else "weeks") + \
           f' (week {weeks[0]} to week {weeks[-1]}).'


def build(seed_path, site_dir):
    seed = json.load(open(seed_path))
    out_dir = os.path.join(site_dir, "c")
    os.makedirs(out_dir, exist_ok=True)

    written = []
    for c in seed["creators"]:
        handle = c["display_handle"]
        slug = handle.lower()
        contribs = sorted(c["contributions"], key=lambda x: x["week_label"])
        desc = summary_of(c)
        big = (f'{c["spotlight_count"]}x SELECTED' if c["spotlight_count"]
               else f'{c["honourable_mention_count"]}x MENTIONED')

        suspended = bool(c.get("suspended"))
        items = "".join(
            f'<li><span class="sq{"" if x["tier"] == "spotlight" else " hm"}"></span>'
            f'<span class="wk">W{x["week_label"]:02d}</span>'
            f'<span class="dt">{day(x["announcement_date"])}</span>'
            + ('<span style="margin-left:auto;color:#37456A">post unavailable</span></li>'
               if suspended else
               f'<a href="{x["x_url"]}" target="_blank" rel="noopener">post ↗</a></li>')
            for x in contribs)

        tweet_bits = []
        if c["spotlight_count"]:
            tweet_bits.append(f'{c["spotlight_count"]}x Community Spotlight')
        if c["honourable_mention_count"]:
            tweet_bits.append(f'{c["honourable_mention_count"]}x honourable mention')
        tweet = ("My @fermah_xyz Community Spotlight record: " + " · ".join(tweet_bits) +
                 f"\n\n{DOMAIN}/c/{slug}")
        tweet = tweet.replace("&", "%26").replace("#", "%23").replace("\n", "%0A") \
                     .replace(" ", "%20").replace("·", "%C2%B7")

        av_path = os.path.join(site_dir, "avatars", slug + ".jpg")
        avatar = (f'<img class="creator-avatar" src="../avatars/{slug}.jpg" alt="">'
                  if os.path.exists(av_path) else "")
        actions = (f'<a class="btn" download href="../cards/{slug}.png">Download card</a>'
                   '<span class="btn" style="cursor:default;opacity:.6">Account suspended</span>'
                   if suspended else
                   f'<a class="btn primary" target="_blank" rel="noopener" '
                   f'href="https://twitter.com/intent/tweet?text={tweet}">Post on X</a>'
                   f'<a class="btn" download href="../cards/{slug}.png">Download card</a>'
                   f'<a class="btn" target="_blank" rel="noopener" '
                   f'href="https://x.com/{handle}">Profile ↗</a>')

        html = PAGE.format(handle=escape(handle), slug=slug, desc=escape(desc),
                           avatar=avatar, actions=actions,
                           summary=escape(desc[0].upper() + desc[1:]), big=big,
                           items=items, tweet=tweet, domain=DOMAIN)
        open(os.path.join(out_dir, slug + ".html"), "w").write(html)
        written.append(slug)

    # sitemap + robots
    pages = ["", "powered", "built-with", "fermafia", "operators", "play"]
    urls = [f"{DOMAIN}/{p}" for p in pages] + [f"{DOMAIN}/c/{s}" for s in written]
    body = "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls)
    open(os.path.join(site_dir, "sitemap.xml"), "w").write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "</urlset>\n")
    open(os.path.join(site_dir, "robots.txt"), "w").write(
        f"User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n")

    print(f"{len(written)} creator pages -> {out_dir}/")
    print(f"sitemap.xml: {len(urls)} urls")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", default="site/data/seed.json")
    ap.add_argument("--site", default="site")
    a = ap.parse_args()
    build(a.seed, a.site)
