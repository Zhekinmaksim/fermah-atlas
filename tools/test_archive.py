import json
import re
import struct
import unittest
import xml.etree.ElementTree as ET
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

from gen_weeks import build_stats, validate_seed

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.metadata = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for name in ["href", "src"]:
            if attrs.get(name):
                self.urls.append(attrs[name])
        if tag == "meta" and attrs.get("property"):
            self.metadata[attrs["property"]] = attrs.get("content")


class ArchiveTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.seed = json.loads((SITE / "data/seed.json").read_text())
        cls.stats = json.loads((SITE / "data/stats.json").read_text())

    def test_summary_matches_records(self):
        validate_seed(self.seed)
        stats, _ = build_stats(self.seed)
        self.assertEqual(stats, self.stats)
        active = [c for c in self.seed["creators"] if not c.get("suspended")]
        summary = self.seed["source_summary"]
        self.assertEqual(len(active), summary["unique_creators"])
        self.assertEqual(stats["selections"], summary["spotlight_selections"])
        self.assertEqual(stats["mentions"], summary["honourable_mentions"])
        self.assertEqual(stats["one_timers"] + stats["came_back"], len(active))
        for creator in self.seed["creators"]:
            counts = Counter(x["tier"] for x in creator["contributions"])
            self.assertEqual(creator["spotlight_count"], counts["spotlight"])
            self.assertEqual(creator["honourable_mention_count"], counts["honourable_mention"])
            self.assertEqual(creator.get("collab_count", 0), counts["collab"])

    def test_identity_corrections_preserved(self):
        people = {c["display_handle"].lower(): c for c in self.seed["creators"]}
        self.assertNotIn("percy_szn", people)
        self.assertNotIn("bolajiusman000", people)
        self.assertEqual(people["b0laji_0"]["honourable_mention_count"], 4)
        self.assertEqual({x["week_label"] for x in people["prince_swago"]["contributions"]}, {1, 4, 18, 21})
        self.assertIn("0xmerajj", people)
        self.assertIn("0xmerajjj", people)
        self.assertFalse(re.search(r"<@!?\d+>", json.dumps(self.seed)))

    def test_pages_cards_and_local_links(self):
        html_files = list(SITE.glob("*.html")) + list((SITE / "c").glob("*.html")) + list((SITE / "week").glob("*.html"))
        for file in html_files:
            parser = Links()
            parser.feed(file.read_text())
            for raw in parser.urls:
                url = urlparse(raw)
                if url.scheme or url.netloc or not url.path:
                    continue
                local = (SITE / unquote(url.path.lstrip("/"))) if url.path.startswith("/") else file.parent / unquote(url.path)
                self.assertTrue(local.exists() or local.with_suffix(".html").exists(), f"Missing link in {file}: {raw}")
        for creator in self.seed["creators"]:
            slug = creator["display_handle"].lower()
            self.assertTrue((SITE / "c" / f"{slug}.html").exists())
            card = (SITE / "cards" / f"{slug}.png").read_bytes()
            self.assertEqual(card[:8], b"\x89PNG\r\n\x1a\n")
            self.assertEqual(struct.unpack(">II", card[16:24]), (1200, 630))

    def test_weeks_and_sitemap(self):
        for week in self.seed["source_summary"]["weeks"]:
            parser = Links()
            parser.feed((SITE / "week" / f"{week}.html").read_text())
            self.assertEqual(parser.metadata["og:url"], f"https://fermahatlas.xyz/week/{week}")
            self.assertEqual(parser.metadata["og:title"], f"Fermah Community Spotlight — Week {week}")
        tree = ET.parse(SITE / "sitemap.xml")
        urls = [el.text for el in tree.findall(".//{*}loc")]
        self.assertEqual(len(urls), len(set(urls)))
        self.assertIn("https://fermahatlas.xyz/stats", urls)
        for week in self.seed["source_summary"]["weeks"]:
            self.assertIn(f"https://fermahatlas.xyz/week/{week}", urls)


if __name__ == "__main__":
    unittest.main()
