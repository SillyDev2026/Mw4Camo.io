"""Protect local backups on failed writes."""
import unittest
from pathlib import Path
APP=(Path(__file__).resolve().parents[1]/"app.js").read_text(encoding="utf8")
class SaveSafetyTests(unittest.TestCase):
    def test_reset_is_atomic(self):
        self.assertIn("const previous=state;state=defaultState();",APP)
        self.assertIn("if(!persist()){state=previous;render();notify('Reset cancelled:",APP)
    def test_import_is_atomic(self):
        self.assertIn("const previous=state;state=data;",APP)
        self.assertIn("if(!persist()){state=previous;render();notify('Import cancelled:",APP)
    def test_editor_survives_failure(self):
        for marker in ("Blueprint not saved. Your draft is preserved","builderDrafts[key]={...b,userSaved:false};","state.reviewedPatches=oldReviews;","In-game code could not be saved"):
            self.assertIn(marker,APP)
    def test_storage_key_unchanged(self):
        self.assertIn("const STORE_KEY = 'mw4camo-io-v1';",APP)
