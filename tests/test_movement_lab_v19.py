"""v1.9 regression guards for movement-oriented loadouts and personal test data."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def source(path):
    return (ROOT / path).read_text(encoding="utf-8")

class MovementLabV19Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = source("app.js")
        cls.share = source("share-codes.js")
        cls.css = source("ui-v9.css")

    def test_preserves_existing_storage_and_two_new_goals(self):
        self.assertIn("const STORE_KEY = 'mw4camo-io-v1'", self.app)
        for goal in ("Max Speed", "Speed + Control"):
            self.assertIn("'" + goal + "':", self.app)
            self.assertIn("'" + goal + "'", self.share)

    def test_measured_speed_and_handling_inputs(self):
        for metric in ("walkMps", "sprintMps", "tacSprintMps", "adsMoveMps",
                       "adsMs", "sprintFireMs", "reloadMs", "recoil"):
            self.assertIn("id:'" + metric + "'", self.app)
        self.assertIn('data-performance=', self.app)
        self.assertIn("Measured build performance saved", self.app)

    def test_exact_attachment_fingerprint_and_retest_guard(self):
        self.assertIn("function performanceSignature", self.app)
        self.assertIn("Object.entries(b.slots||{})", self.app)
        self.assertIn("Different attachment", self.app) if "Different attachment" in self.app else self.assertIn("Attachments have changed", self.app)
        self.assertIn("prior?.signature===performanceSignature(w,b)", self.app)
        self.assertIn("record.signature===performanceSignature(w,state.builds[key])", self.app)

    def test_backup_import_and_local_reload(self):
        self.assertIn("buildTests:{}", self.app)
        self.assertIn("safe.buildTests=Object.fromEntries", self.app)
        self.assertIn("buildTests:Object.fromEntries(Object.entries(data.buildTests||{})", self.app)
        self.assertIn("function cleanPerformance", self.app)

    def test_comparison_and_responsive_styles(self):
        self.assertIn("renderPerformanceComparisons(w,b,matching,values)", self.app)
        self.assertIn("MEASURED BUILD COMPARISONS", self.app)
        for name in (".perf-grid", ".perf-results", ".perf-comparison", ".perf-delta-row"):
            self.assertIn(name, self.css)
        self.assertIn("@media(max-width:480px)", self.css)

if __name__ == "__main__":
    unittest.main()
