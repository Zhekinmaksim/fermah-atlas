import copy
import tempfile
import unittest
from pathlib import Path

from gen_weeks import build_stats, build_weeks, validate_seed, week_row


def record(handle, items, suspended=False):
    return {"display_handle": handle, "suspended": suspended, "contributions": [
        {"week_label": week, "tier": tier, "announcement_date": f"2026-10-0{week}",
         "x_url": url, **extra}
        for week, tier, url, extra in items
    ]}


class WeekTests(unittest.TestCase):
    def setUp(self):
        shared = "https://x.com/Alice/status/123"
        self.seed = {"source_summary": {"weeks": [1, 2, 3],
                     "week_dates": {str(w): f"2026-10-0{w}" for w in [1, 2, 3]}},
                     "creators": [
            record("Alice", [(1, "honourable_mention", "https://x.com/Alice/status/121", {}),
                              (2, "spotlight", shared, {"via_collab": shared}),
                              (3, "spotlight", "https://x.com/Alice/status/124", {})]),
            record("Bob", [(2, "spotlight", shared, {"via_collab": shared})]),
            record("Carol", [(2, "spotlight", "https://x.com/Carol/status/125", {}),
                              (2, "collab", shared, {"via_collab": shared})]),
            record("Gone", [(1, "spotlight", "https://x.com/Gone/status/126", {})], True),
        ]}

    def test_counts_and_runs(self):
        stats, rec = build_stats(self.seed)
        self.assertEqual((stats["creators"], stats["selections"], stats["mentions"]), (3, 4, 1))
        self.assertEqual(stats["tierup_total"], 1)
        self.assertEqual(stats["came_back"] + stats["one_timers"], stats["creators"])
        self.assertEqual(stats["selection_runs"][0]["length"], 2)
        self.assertNotIn("Gone", rec)

    def test_collab_links_and_notes(self):
        validate_seed(self.seed)
        stats, rec = build_stats(self.seed)
        with tempfile.TemporaryDirectory() as directory:
            pages = Path(directory, "c")
            pages.mkdir()
            for name in ["alice", "bob", "carol"]:
                (pages / f"{name}.html").touch()
            build_weeks(self.seed, rec, stats, directory)
            html = Path(directory, "week", "2.html").read_text()
            self.assertIn("Collab of the week", html)
            self.assertIn("up from mention", html)
            self.assertIn("../c/bob.html", html)
            self.assertIn("https://x.com/Alice/status/123", html)
            self.assertNotIn("Gone", html)

    def test_bad_post_rejected(self):
        broken = copy.deepcopy(self.seed)
        broken["creators"][0]["contributions"][0]["x_url"] = "https://x.com/https:/status/"
        with self.assertRaisesRegex(ValueError, "Invalid post URL"):
            validate_seed(broken)

    def test_avatar_and_compact_identity(self):
        entry = self.seed["creators"][0]["contributions"][0]
        html = week_row("Alice", entry, "first time", True, True)
        self.assertIn('src="../avatars/alice.jpg"', html)
        self.assertIn('class="wk-identity"', html)
        self.assertIn('class="nm" href="../c/alice.html"', html)
        fallback = week_row("Bob", entry, "", True, False)
        self.assertIn('<span>BO</span>', fallback)
        self.assertNotIn("<img", fallback)

    def test_duplicate_identity_rejected(self):
        broken = copy.deepcopy(self.seed)
        broken["creators"].append(record("ALICE", []))
        with self.assertRaisesRegex(ValueError, "duplicate handle"):
            validate_seed(broken)


if __name__ == "__main__":
    unittest.main()
