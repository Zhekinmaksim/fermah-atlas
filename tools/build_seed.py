#!/usr/bin/env python3
"""
Fermah Atlas — build the Spotlight seed from the community-news export.

Reads the raw channel dump, keeps only the "gFermah Creatives" Spotlight
announcements, and turns them into an X-handle-only seed.

Section headings inside each announcement decide the tier:
  "Creators for the Week #N"  -> spotlight
  "Honourable Mentions"       -> honourable_mention

Discord user IDs appear in the announcements as <@...> mentions. They are
deliberately not read and never stored - the only identity kept is the X handle
from the post URL.

    python build_seed.py --dump community_news-page-1.json --out seed.json
"""
import argparse
import json
import re
from collections import Counter

LINK = re.compile(r"https?://(?:www\.)?(?:x|twitter)\.com/([A-Za-z0-9_]+)/status/(\d+)")
WEEK_HEAD = re.compile(r"Creators\s+for\s+the\s+Week\s*#?\s*(\d+)", re.I)
MENTION_HEAD = re.compile(r"Honou?rable\s+Mentions", re.I)
IS_SPOTLIGHT = re.compile(r"gFermah\s+Creatives", re.I)


def parse(msg):
    """-> (week, date, [(handle, status_id, tier)]) or None"""
    text = msg.get("content") or ""
    if not IS_SPOTLIGHT.search(text):
        return None
    wm = WEEK_HEAD.search(text)
    if not wm:
        return None
    stated = int(wm.group(1))
    day = msg["timestamp"][:10]

    tier, rows = None, []
    for line in text.splitlines():
        if WEEK_HEAD.search(line):
            tier = "spotlight"
        elif MENTION_HEAD.search(line):
            tier = "honourable_mention"
        if tier is None:
            continue
        for handle, sid in LINK.findall(line):
            if handle.lower() in ("i", "home", "search", "intent"):
                rows.append((None, sid, tier))
            else:
                rows.append((handle, sid, tier))
    return stated, day, rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dump", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--resolve", help="csv: status_id,handle - for anonymous x.com/i/status links")
    args = ap.parse_args()

    msgs = json.load(open(args.dump))
    msgs.sort(key=lambda m: m["timestamp"])

    resolved = {}
    if args.resolve:
        import csv as _csv
        import os as _os
        if _os.path.exists(args.resolve):
            for row in _csv.reader(open(args.resolve)):
                if len(row) >= 2 and row[0].strip().isdigit():
                    resolved[row[0].strip()] = row[1].strip().lstrip("@")

    by_handle, seen, unresolved, suspended = {}, set(), [], []
    weeks = {}
    order = 0
    for m in msgs:
        p = parse(m)
        if not p:
            continue
        stated, day, rows = p
        order += 1
        week = order   # the channel labels two different announcements "Week 10"
        weeks[week] = day
        for handle, sid, tier in rows:
            handle = handle or resolved.get(sid)
            if handle and handle.upper() in ("SUSPENDED", "DELETED", "SKIP"):
                suspended.append((week, sid))
                continue
            if not handle:
                unresolved.append((week, day, sid))
                continue
            if sid in seen:
                continue
            seen.add(sid)
            by_handle.setdefault(handle, []).append({
                "x_handle": handle,
                "x_url": f"https://x.com/{handle}/status/{sid}",
                "tier": tier,
                "announcement_date": day,
                "week_label": week,
            })

    creators = []
    for handle, contribs in by_handle.items():
        contribs.sort(key=lambda c: (c["week_label"], c["tier"]))
        t = Counter(c["tier"] for c in contribs)
        creators.append({
            "display_handle": handle,
            "spotlight_count": t["spotlight"],
            "honourable_mention_count": t["honourable_mention"],
            "first_week": contribs[0]["week_label"],
            "last_week": contribs[-1]["week_label"],
            "contributions": contribs,
        })
    creators.sort(key=lambda c: (-c["spotlight_count"], -c["honourable_mention_count"],
                                 c["display_handle"].lower()))

    out = {
        "generated_for": "Fermah Atlas",
        "privacy_note": "X handles only. Discord user IDs present in the source announcements "
                        "are not parsed and never stored.",
        "source_summary": {
            "announcements": len(weeks),
            "weeks": sorted(weeks),
            "week_dates": {str(k): weeks[k] for k in sorted(weeks)},
            "spotlight_selections": sum(c["spotlight_count"] for c in creators),
            "honourable_mentions": sum(c["honourable_mention_count"] for c in creators),
            "unique_creators": len(creators),
        },
        "creators": creators,
    }
    json.dump(out, open(args.out, "w"), ensure_ascii=False, indent=1)

    s = out["source_summary"]
    print(f"announcements  {s['announcements']}  weeks {s['weeks']}")
    print(f"selections     {s['spotlight_selections']}")
    print(f"mentions       {s['honourable_mentions']}")
    print(f"creators       {s['unique_creators']}")
    print(f"suspended      {len(suspended)}  (excluded from all counts)")
    print(f"unresolved     {len(unresolved)}")
    for w, day, sid in unresolved:
        print(f"  {sid},            # week {w} ({day})  https://x.com/i/status/{sid}")


if __name__ == "__main__":
    main()
