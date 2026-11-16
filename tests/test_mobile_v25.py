import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class MobileV25Tests(unittest.TestCase):
 def test_cross_tab_preserves_unsaved_builds(self):
  app=(ROOT/'app.js').read_text()
  self.assertIn("if(route[0]==='build')",app)
  self.assertIn('if(fields.some(field=>JSON.stringify(edited[field])!==JSON.stringify(baseline[field])))',app)
  self.assertIn('state=loadState();render();',app)
  self.assertIn('Unsaved editor changes were kept.',app)
 def test_accessible_jump_and_offline_asset(self):
  ui=(ROOT/'ui-experience.js').read_text()
  for tag in ('aria-activedescendant','aria-controls','aria-expanded','aria-autocomplete'):
   self.assertIn(tag,ui)
  self.assertIn('ui-v11.css',(ROOT/'index.html').read_text())
  self.assertIn('./ui-v11.css',(ROOT/'service-worker.js').read_text())
