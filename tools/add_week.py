#!/usr/bin/env python3
"""
Fermah Atlas — weekly update.

Paste the new Spotlight announcement into a text file, run this, done:
the seed gains the week and every card is re-rendered (the whole season
timeline shifts by one column, so all cards change, not just the new names).

    python add_week.py --text w17.txt
    python add_week.py --text w17.txt --dry-run     # show what would change

Options:
    --week N     override the week number if the announcement doesn't say it
    --date       override the announcement date (defaults to today)
    --no-cards   update the seed only

The text can be the raw Discord message, emoji and <@mentions> included.
Only x.com links are read. Discord IDs are ignored and never stored.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from collections import Counter
from datetime import date

LINK = re.compile(r"https?://(?:www\.)?(?:x|twitter)\.com/([A-Za-z0-9_]+)/status/(\d+)")
WEEK_HEAD = re.compile(r"Creators?\s+for\s+the\s+[Ww]eek\s*#?\s*(\d+)")
MENTION_HEAD = re.compile(r"Honou?rable\s+Mentions?", re.I)
SUSPENDED = re.compile(r"suspend|deleted|not\s*found", re.I)


def parse(text, week=None, day=None):
    wm = WEEK_HEAD.search(text)
    if week is None:
        if not wm:
            sys.exit("No 'Creators for the Week #N' heading found - pass --week N")
        week = int(wm.group(1))
    day = day or date.today().isoformat()

    tier, rows, skipped = "spotlight", [], 0
    for line in text.splitlines():
        if MENTION_HEAD.search(line):
            tier = "honourable_mention"
            continue
        if WEEK_HEAD.search(line):
            tier = "spotlight"
            continue
        if SUSPENDED.search(line) and not LINK.search(line):
            skipped += 1
            continue
        for handle, sid in LINK.findall(line):
            if handle.lower() in ("i", "home", "search", "intent"):
                continue          # anonymous link - the real one is on another line
            rows.append((handle, sid, tier))
    return week, day, rows, skipped


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", required=True, help="file with the announcement text")
    ap.add_argument("--seed", default="seed.json")
    ap.add_argument("--cards", default="cards")
    ap.add_argument("--week", type=int)
    ap.add_argument("--date")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-cards", action="store_true")
    args = ap.parse_args()

    seed = json.load(open(args.seed))
    week, day, rows, skipped = parse(open(args.text, encoding="utf-8").read(),
                                     args.week, args.date)

    by_handle = {c["display_handle"]: c for c in seed["creators"]}
    seen = {LINK.search(c["x_url"]).group(2)
            for cr in seed["creators"] for c in cr["contributions"]
            if LINK.search(c["x_url"])}

    added, new_people, dupes = 0, [], 0
    for handle, sid, tier in rows:
        if sid in seen:
            dupes += 1
            continue
        seen.add(sid)
        cr = by_handle.get(handle)
        if cr is None:
            cr = {"display_handle": handle, "spotlight_count": 0,
                  "honourable_mention_count": 0, "contributions": []}
            by_handle[handle] = cr
            new_people.append(handle)
        cr["contributions"].append({
            "x_handle": handle,
            "x_url": f"https://x.com/{handle}/status/{sid}",
            "tier": tier,
            "announcement_date": day,
            "week_label": week,
        })
        added += 1

    creators = list(by_handle.values())
    for cr in creators:
        cr["contributions"].sort(key=lambda c: (c["week_label"], c["tier"]))
        t = Counter(c["tier"] for c in cr["contributions"])
        cr["spotlight_count"] = t["spotlight"]
        cr["honourable_mention_count"] = t["honourable_mention"]
        cr["first_week"] = cr["contributions"][0]["week_label"]
        cr["last_week"] = cr["contributions"][-1]["week_label"]
    creators.sort(key=lambda c: (-c["spotlight_count"], -c["honourable_mention_count"],
                                 c["display_handle"].lower()))

    ss = seed["source_summary"]
    ss["week_dates"][str(week)] = day
    ss["week_dates"] = {k: ss["week_dates"][k] for k in sorted(ss["week_dates"], key=int)}
    ss["weeks"] = sorted(int(k) for k in ss["week_dates"])
    ss["announcements"] = len(ss["weeks"])
    ss["spotlight_selections"] = sum(c["spotlight_count"] for c in creators)
    ss["honourable_mentions"] = sum(c["honourable_mention_count"] for c in creators)
    ss["unique_creators"] = len(creators)
    seed["creators"] = creators

    print(f"week {week} ({day})")
    print(f"  added        {added} recognitions")
    print(f"  new creators {len(new_people)}" + (f"  {', '.join(new_people)}" if new_people else ""))
    if dupes:
        print(f"  skipped      {dupes} already in the seed")
    if skipped:
        print(f"  suspended    {skipped} line(s) ignored")
    print(f"  season now   {ss['unique_creators']} creators, "
          f"{ss['spotlight_selections']} selections, {ss['honourable_mentions']} mentions")

    if args.dry_run:
        print("\ndry run - nothing written")
        return

    backup = args.seed + ".bak"
    if os.path.exists(args.seed):
        os.replace(args.seed, backup)
    json.dump(seed, open(args.seed, "w"), ensure_ascii=False, indent=1)
    print(f"\nwrote {args.seed}  (previous kept as {backup})")

    if not args.no_cards:
        subprocess.run([sys.executable, "gen_cards.py", "--seed", args.seed,
                        "--out", args.cards], check=True)


if __name__ == "__main__":
    main()
