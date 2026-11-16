import unittest
from pathlib import Path
APP=(Path(__file__).resolve().parents[1]/'app.js').read_text(encoding='utf8')
class ProgressRecoveryTests(unittest.TestCase):
 def test_atomic_helper(self):
  self.assertIn('function commitValue(table,key,value)',APP)
  self.assertIn('if(had)table[key]=before;else delete table[key];',APP)
 def test_progress_functions_guarded(self):
  for term in ('state.completed','state.accounts','state.counters','state.levels','state.buildTests'):
   self.assertIn('commitValue('+term,APP)
 def test_undo_and_measurements(self):
  self.assertIn("if(callback()!==false)notify('Last change undone')",APP)
  self.assertIn('if(!persist()){state.weaponMeasurements=previous;',APP)
 def test_patch_review_undo(self):
  self.assertIn('if(!persist()){state.reviewedPatches=before;return;}',APP)
  self.assertIn('if(!persist()){state.reviewedPatches=now;return false;}',APP)
