"""Check public routing and deployed assets without submitting any leads."""
import hashlib
import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / "vercel.json").read_text())


class FormParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.forms = []

    def handle_starttag(self, tag, attrs):
        if tag == "form":
            self.forms.append(dict(attrs))


class PolicyTextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def policy_text(value):
    parser = PolicyTextParser()
    parser.feed(value)
    return " ".join(" ".join(parser.parts).split())


def destination(path):
    for rule in CONFIG["rewrites"]:
        pattern = rule["source"].replace(":path*", "(.*)")
        match = re.fullmatch(pattern, path)
        if match:
            result = rule["destination"]
            if ":path*" in result:
                result = result.replace(":path*", match.group(1))
            for i, value in enumerate(match.groups(), 1):
                result = result.replace(f"${i}", value)
            return result
    return path  # Vercel's filesystem fallback


class BrandsReleaseTests(unittest.TestCase):
    def test_public_privacy_date_matches_the_approved_location_update(self):
        self.assertTrue("Last modified: October 15, 2026" in
                        policy_text((ROOT / "privacy.html").read_text()),
                        "Public policy date must match the approved location update")

    def test_public_location_disclosures_match_the_approved_wording(self):
        page = (ROOT / "privacy.html").read_text()
        passages = re.findall(r"<li>\s*<strong>Location Information\.</strong>.*?</li>",
                              page, re.S)
        passages += re.findall(r"<p>\s*We (?:may use|use) location information.*?</p>",
                               page, re.S)
        self.assertEqual(len(passages), 3)
        actual = sorted(hashlib.sha256(policy_text(p).encode()).hexdigest()
                        for p in passages)
        # Exact Tom-approved paragraphs in the reviewed bb02c85a native policy.
        approved = sorted([
            "d761aa25049fcc89addc17a08d9e4443ddf0486f6a57ae6bd6159f87fb68be2d",
            "4a82258c755f3afa51a76656eb8afdbea6271f2e846325b80f570935d330fe15",
            "f1f7e1655570362a556dddce792b34984894d75e3979b17e8c38a66c7ac98ecc",
        ])
        self.assertEqual(actual, approved)
        self.assertNotIn("No location information is stored or retained.", page)

    def test_location_update_preserves_the_existing_gmail_supplement(self):
        page = (ROOT / "privacy.html").read_text()
        aside = re.search(r'<aside\b[^>]*id="gmail".*?</aside>', page, re.S)
        self.assertIsNotNone(aside)
        self.assertEqual(hashlib.sha256(aside.group().encode()).hexdigest(),
                         "91bf16ad4d107d2f395f0db382156dbf001fd0edf41680046dbf75c2ae0a426e")

    def test_brands_routes_use_reviewed_static_page(self):
        for path in ("/brands", "/brands/", "/brands.html"):
            self.assertEqual(destination(path), "/brands.html")

    def test_dashboard_assets_escape_homepage_fallback(self):
        for asset in (ROOT / "brand-dashboard").glob("*.webp"):
            path = "/" + str(asset.relative_to(ROOT))
            self.assertEqual(destination(path), path)
            data = asset.read_bytes()
            self.assertEqual(data[:4], b"RIFF")
            self.assertEqual(data[8:12], b"WEBP")
        self.assertEqual(len(list((ROOT / "brand-dashboard").glob("*.webp"))), 4)

    def test_redesign_media_escape_homepage_fallback(self):
        assets = list((ROOT / "brands-media").glob("*"))
        self.assertEqual(len(assets), 16)
        self.assertEqual(sum(asset.suffix == ".webp" for asset in assets), 3)
        self.assertEqual(sum(asset.suffix == ".png" for asset in assets), 13)
        for asset in assets:
            path = "/" + str(asset.relative_to(ROOT))
            self.assertEqual(destination(path), path)
            data = asset.read_bytes()
            if asset.suffix == ".webp":
                self.assertEqual(data[:4], b"RIFF")
                self.assertEqual(data[8:12], b"WEBP")
            else:
                self.assertTrue(data.startswith(b"\x89PNG\r\n\x1a\n"))

    def test_six_guide_pdfs_escape_homepage_fallback(self):
        guides = list((ROOT / "brand-guides").glob("*.pdf"))
        self.assertEqual(len(guides), 6)
        for guide in guides:
            path = "/" + str(guide.relative_to(ROOT))
            self.assertEqual(destination(path), path)
            self.assertTrue(guide.read_bytes().startswith(b"%PDF-"))

    def test_admin_queue_still_reaches_dev_api(self):
        self.assertEqual(destination("/api/v1/brand-auth/access-requests"),
                         "https://dev.perkalate.com/api/v1/brand-auth/access-requests")

    def test_existing_consumer_and_app_routes_remain(self):
        cases = {
            "/": "/index.html",
            "/api/waitlist": "/api/waitlist",
            "/login": "https://dev.perkalate.com/login",
            "/brand/login": "https://dev.perkalate.com/brand/login",
            "/privacy": "/privacy.html",
            "/traction-proof": "/investor-traction.html",
            "/brands/existing": "https://dev.perkalate.com/brands/existing",
        }
        for path, expected in cases.items():
            self.assertEqual(destination(path), expected)

    def test_copy_matches_reviewed_source_manifest(self):
        manifest = json.loads((ROOT / "brands-source-manifest.json").read_text())
        self.assertEqual(manifest["source"],
                         "3faec871647ae66916db2f712d52284a98eec788")
        self.assertEqual(manifest["page_source"],
                         "70b87ae147305572eca31561eadc6e6aa1d1a335")
        expected = {"brands.html"}
        for folder in ("brands-media", "brand-dashboard", "brand-guides"):
            expected.update(str(path.relative_to(ROOT))
                            for path in (ROOT / folder).glob("*"))
        self.assertEqual(set(manifest["files"]), expected)
        self.assertEqual(len(expected), 27)
        for name, digest in manifest["files"].items():
            self.assertEqual(hashlib.sha256((ROOT / name).read_bytes()).hexdigest(), digest)

    def test_correct_brands_form_and_local_assets(self):
        html = (ROOT / "brands.html").read_text()
        self.assertIn('content="247667002"', html)
        self.assertIn('content="3b46342c-bda0-4017-982a-16db64d732bc"', html)
        self.assertNotIn("f166a53d-7e49-4209-961a-74af4f7d38fe", html)
        for asset in re.findall(r'["\'](/(?:brands-media|brand-dashboard|brand-guides)/[^"\']+)["\']', html):
            self.assertTrue((ROOT / asset.lstrip("/")).is_file(), asset)

    def test_signup_is_excluded_from_the_extra_collected_form(self):
        parser = FormParser()
        parser.feed((ROOT / "brands.html").read_text())
        self.assertEqual(len(parser.forms), 1)
        self.assertEqual(parser.forms[0].get("id"), "wl")
        self.assertEqual(parser.forms[0].get("data-hs-do-not-collect"), "true")

    def test_page_is_the_exact_reviewed_a_plus_source(self):
        page = (ROOT / "brands.html").read_bytes()
        marker = b' data-hs-do-not-collect="true"'
        self.assertEqual(page.count(marker), 1)
        # Exact page from twice-reviewed PR845 head 70b87ae1, unchanged in 3faec871.
        self.assertEqual(hashlib.sha256(page).hexdigest(),
                         "4599ee3f63983ea844d12fe507b3b21855e06cd4dad0525317fbd8deb14c7e0f")

    def test_original_form_and_submission_handlers_are_preserved(self):
        page = (ROOT / "brands.html").read_text()
        form = re.search(r'<form id="wl".*?</form>', page, re.S)
        self.assertIsNotNone(form)
        self.assertEqual(hashlib.sha256(form.group().encode()).hexdigest(),
                         "44c20d271bc0fc48a375da29273ed181aebbb8ae9480a793492b087e1c931e8e")
        # Independent baseline from current public main, covering both admin queue
        # and HubSpot handlers, errors, outage fallback and download handoff.
        start = page.index("  /* Two-step form")
        end = page.index("  /* Page interactions", start)
        self.assertEqual(hashlib.sha256(page[start:end].encode()).hexdigest(),
                         "6f1cc7f7466c215237b261cf97fa65e224405775f4a8ae5491e48f80f391f135")


if __name__ == "__main__":
    unittest.main()
