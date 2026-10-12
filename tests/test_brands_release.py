"""Check public routing and deployed assets without submitting any leads."""
import hashlib
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / "vercel.json").read_text())


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
        self.assertEqual(len(manifest["files"]), 11)
        for name, digest in manifest["files"].items():
            self.assertEqual(hashlib.sha256((ROOT / name).read_bytes()).hexdigest(), digest)

    def test_correct_brands_form_and_local_assets(self):
        html = (ROOT / "brands.html").read_text()
        self.assertIn('content="247667002"', html)
        self.assertIn('content="3b46342c-bda0-4017-982a-16db64d732bc"', html)
        self.assertNotIn("f166a53d-7e49-4209-961a-74af4f7d38fe", html)
        for asset in re.findall(r'["\'](/brand-(?:dashboard|guides)/[^"\']+)["\']', html):
            self.assertTrue((ROOT / asset.lstrip("/")).is_file(), asset)


if __name__ == "__main__":
    unittest.main()
