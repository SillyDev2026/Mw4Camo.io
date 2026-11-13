"""Regression guards for the MW4Camo v1.8 UI and personal refresh controls."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def source(filename):
    return (ROOT / filename).read_text(encoding="utf-8")


class ResponsiveUIV18Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = source("index.html")
        cls.css = source("ui-v9.css")
        cls.worker = source("service-worker.js")
        cls.refresh = source("refresh-settings.js")
        cls.app = source("app.js")
        cls.experience = source("ui-experience.js")

    def test_stylesheet_load_order(self):
        self.assertLess(self.html.index('href="ui-v8.css"'), self.html.index('href="ui-v9.css"'))
        self.assertLess(self.html.index('href="ui-v9.css"'), self.html.index('src="app.js"'))
        self.assertIn("'./ui-v9.css'", self.worker)
        self.assertIn("mw4camo-v1.8.1-patch-refresh", self.worker)

    def test_navigation_controls_still_present(self):
        for name in ("sidebar", "sidebarBackdrop", "menuToggle", "menuClose", "quickOpen", "qualityButton", "modeButton", "refreshStatus", "app"):
            with self.subTest(control=name):
                self.assertIn(f'id="{name}"', self.html)

    def test_no_user_progress_migration(self):
        self.assertIn("const STORE_KEY = 'mw4camo-io-v1'", self.app)
        self.assertIn("const KEY = 'mw4camo-refresh-interval-v1'", self.refresh)

    def test_refresh_control_markup_stays_operable(self):
        for control in ("refreshInterval", "refreshNow", "refreshLastBrowser", "refreshLastPublisher", "refreshNext", "refreshMessage"):
            with self.subTest(control=control):
                self.assertIn(f'id="{control}"', self.refresh)
        self.assertIn('for="refreshInterval"', self.refresh)
        self.assertIn('aria-live="polite"', self.refresh)
        self.assertIn("refreshCard.after(card)", self.experience)
        self.assertIn("window.MW4CamoFeed", self.app)

    def test_responsive_and_accessibility_rules(self):
        self.assertEqual(self.css.count("{"), self.css.count("}"))
        self.assertGreater(len(self.css), 9000)
        for breakpoint in (1180, 900, 700, 480, 360):
            with self.subTest(viewport=breakpoint):
                self.assertIn(f"@media(max-width:{breakpoint}px)", self.css)
        self.assertIn("@media(prefers-reduced-motion:reduce)", self.css)
        self.assertIn(":focus-visible", self.css)
        self.assertIn("refresh-details", self.css)
        self.assertIn(".sidebar.open", self.css)

    def test_no_blind_json_cache_expansion(self):
        self.assertIn("requestUrl.searchParams.has('_fresh')", self.worker)
        self.assertIn("cache:'no-store'", self.refresh)


if __name__ == "__main__":
    unittest.main()
