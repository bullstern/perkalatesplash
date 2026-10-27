"""Keep public brand count and reward-funded pricing aligned with the deck."""
import re
import unittest
from pathlib import Path


class BrandsMessagingTests(unittest.TestCase):
    def setUp(self):
        page = (Path(__file__).resolve().parents[1] / "brands.html").read_text()
        self.text = " ".join(re.sub(r"<[^>]*>", " ", page).split())

    def test_current_brand_count_is_specific_and_consistent(self):
        self.assertIn("108 brands are already on Perkalate.", self.text)
        self.assertNotRegex(self.text, r"(?:100\+|87) brands")

    def test_pricing_does_not_imply_a_later_platform_fee(self):
        self.assertIn("No platform fee.", self.text)
        self.assertNotIn("free to start", self.text.lower())
        self.assertNotIn("Perkalate fee to start", self.text)

    def test_revenue_share_does_not_invent_a_rate(self):
        self.assertIn("Perkalate earns a share of reward funding", self.text)
        self.assertIn("rate agreed before launch", self.text)


if __name__ == "__main__":
    unittest.main()
