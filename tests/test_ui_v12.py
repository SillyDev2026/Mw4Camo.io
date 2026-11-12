"""Lightweight build-time checks for the v1.2 static website."""
import pathlib
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]

class UIv12(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html=(ROOT/'index.html').read_text()
        cls.js=(ROOT/'app.js').read_text()
        cls.css=(ROOT/'ui-v3.css').read_text()

    def test_entrypoint_assets(self):
        self.assertIn('ui-v3.css',self.html)
        self.assertTrue((ROOT/'ui-v3.css').is_file())
        self.assertIn('data-route="planner"',self.html)
        self.assertIn('id="sidebarBackdrop"',self.html)
        self.assertIn('id="skipLink"',self.html)

    def test_existing_save_contract(self):
        self.assertIn("const STORE_KEY = 'mw4camo-io-v1';",self.js)
        self.assertIn("counters:{},focusWeapon:null",self.js)
        self.assertIn('validKeys.has(k)',self.js)
        self.assertIn('focusWeapon:validIds.has(data.focusWeapon)',self.js)

    def test_no_auto_camo_from_level(self):
        self.assertIn('Weapon level saved. Only mark camo challenges once earned in-game.',self.js)
        self.assertNotIn("state.completed[w.id+'|military-'+(i+1)]=true",self.js)

    def test_controls(self):
        for name in ('mission-filter','focus','patchSearch','compareGoal','data-counter','renderGoalComparison'):
            self.assertIn(name,self.js)
        self.assertIn('prefers-reduced-motion',self.css)
        self.assertIn(':focus-visible',self.css)

if __name__=='__main__': unittest.main()
