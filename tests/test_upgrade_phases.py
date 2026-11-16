"""Phased MW4Camo regression checks."""
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(name): return (ROOT/name).read_text(encoding="utf8")
class UpgradePhaseTests(unittest.TestCase):
    def test_storage_and_routes_preserved(self):
        app=read("app.js")
        self.assertIn("const STORE_KEY = 'mw4camo-io-v1'",app)
        for route in ("dashboard","weapons","planner","mastery","loadouts","hub","class-builder","compare","assistant","doctor","my-builds","patches","settings"):
            self.assertIn("route==='"+route+"'",app)
    def test_storage_validation_preserves_legacy(self):
        app=read("app.js")
        self.assertIn("parts.length===2||(parts.length===3&&Object.hasOwn(TEMPLATES,parts[2]))",app)
        self.assertIn("WEAPONS.some(w=>w.id===parts[0])",app)
        self.assertIn("isRecord(build)&&isRecord(build.slots)",app)
    def test_backup_null_validation_and_clipboard(self):
        app=read("app.js")
        self.assertIn("!isRecord(data.completed)||!isRecord(data.accounts)||!isRecord(data.levels)",app)
        self.assertIn("finally{el.remove();}",app)
    def test_v193_blueprint_vault(self):
        app=read("app.js")
        for marker in ("blueprintSearch","blueprintMode","blueprintSort","blueprintResults","data-blueprint-card","updateBlueprintList","copy-saved-code"):
            self.assertIn(marker,app)
        self.assertIn("window.MW4_SHARE.encode({weapon,mode,goal",app)
        self.assertIn("ui-v10.css",read("index.html"))
        self.assertIn("./ui-v10.css",read("service-worker.js"))
    def test_cache_and_assets(self):
        self.assertIn("mw4camo-v1.9.3",read("service-worker.js"))
        self.assertIn("No login required · v1.9.3",read("index.html"))
        for name in ("data/weapons.js","data/patches.js","data/attachments.js","share-codes.js","ui-v9.css"):
            self.assertIn("./"+name,read("service-worker.js"))
if __name__=="__main__": unittest.main()
