"""Officially sourced multiple Apex variants with backward compatible Gunsmith saves."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def read(name):
    return (ROOT/name).read_text(encoding="utf-8")

class MultiApexTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(read("data/attachments.json"))
        cls.client = json.loads(read("data/attachments.js").split("=",1)[1].strip().rstrip(";"))
        cls.app = read("app.js")
        cls.codes = read("share-codes.js")

    def test_json_and_browser_catalog_match(self):
        self.assertEqual(self.data, self.client)
        self.assertEqual(len(self.data["specs"]),35)

    def test_all_apex_variants_are_valid(self):
        for wid, spec in self.data["specs"].items():
            choices = spec["apexOptions"]
            self.assertEqual(bool(choices),bool(spec["apex"]),wid)
            self.assertEqual(len({p["name"] for p in choices}),len(choices),wid)
            if choices:
                self.assertEqual(choices[0]["name"],spec["apex"],wid)
            for item in choices:
                self.assertTrue(item["name"] and item["source"].startswith("https://www.callofduty.com/"),wid)
                self.assertTrue(set(item["blocked"]).issubset(spec["types"]),wid)
                self.assertIsInstance(item["blockedVerified"],bool)

    def test_both_multi_apex_weapons(self):
        expected = {"hyeon-burst":{"Hyeon Auto","Hyeon Hyperburst"},"kastov-762":{"Kastov ARC","Kastov 545"}}
        multi = {wid:{x["name"] for x in spec["apexOptions"]} for wid,spec in self.data["specs"].items() if len(spec["apexOptions"])>1}
        self.assertEqual(multi,expected)
        for wid,name in [("hyeon-burst","Hyeon Auto"),("kastov-762","Kastov 545")]:
            choice=next(x for x in self.data["specs"][wid]["apexOptions"] if x["name"]==name)
            self.assertEqual(choice["unlock"],"Wager Match Event reward")
            self.assertEqual(choice["availability"],"Season 1 in-season event")
            self.assertFalse(choice["blockedVerified"])
        self.assertEqual(len(self.data["specs"]["m4"]["apexOptions"]),1)

    def test_each_apex_option_changes_build_identity(self):
        self.assertIn("activeApex(w,b)?.name||''",self.app)
        self.assertIn("function renderApexSelector",self.app)
        self.assertIn('id="gsApexSelect"',self.app)
        self.assertNotIn('id="gsApex"',self.app)
        self.assertIn("availableTypes(w,b.apex,b.apexName)",self.app)
        self.assertIn("apexName:v.apex===true",self.app)
        self.assertIn("apexName:b.apexName",self.app)

    def test_legacy_codes_still_accepted(self):
        self.assertIn("const LEGACY_PREFIX = 'MW4C1'",self.codes)
        self.assertIn("const PREFIX = 'MW4C2'",self.codes)
        self.assertIn("legacyFingerprint",self.codes)
        self.assertIn("blocked.includes(type)",self.codes)

if __name__ == "__main__":
    unittest.main()
