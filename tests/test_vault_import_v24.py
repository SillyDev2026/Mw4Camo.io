import unittest
from pathlib import Path
APP=(Path(__file__).resolve().parents[1]/'app.js').read_text(encoding='utf8')
class VaultImportTests(unittest.TestCase):
 def test_blueprints_reject_malformed_keys(self):
  self.assertIn("parts.length===2||(parts.length===3&&Object.hasOwn(TEMPLATES,parts[2]))",APP)
  self.assertIn("isRecord(v)&&isRecord(v.slots)",APP)
  self.assertIn("k.split('|').length===3&&validIds.has(",APP)
 def test_link_sharing_and_preview(self):
  self.assertIn('data-action="copy-saved-link"',APP)
  self.assertIn("shareLinkFor(code):code",APP)
  self.assertIn('completed camo items, ',APP)
