"""Class and Blueprint Vault transactional safety checks."""
import unittest
from pathlib import Path
APP=(Path(__file__).resolve().parents[1]/"app.js").read_text(encoding="utf8")
class ClassRecoveryTests(unittest.TestCase):
    def test_class_operations_rollback(self):
        for value in ("Duplicate not saved; original class is preserved.","Class deletion not saved; original class is preserved.","Class not saved. Your editor is preserved.","classDrafts[mode]=load"):
            self.assertIn(value,APP)
    def test_blueprint_deletion_and_example_restore(self):
        for value in ("Blueprint deletion not saved; original remains available.","Example restoration not saved; your blueprint is unchanged.","state.reviewedPatches=previousReviews"):
            self.assertIn(value,APP)
    def test_open_saved_draft(self):
        self.assertIn("Discard this unsaved draft and open the saved blueprint?",APP)
        self.assertIn("delete builderDrafts[draftKey];",APP)
