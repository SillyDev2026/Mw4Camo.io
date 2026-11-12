"""Regression checks for animation restoration, LOD, command navigation and data preservation."""
import pathlib
import unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class V14Regression(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html=(ROOT/'index.html').read_text()
        cls.app=(ROOT/'app.js').read_text()
        cls.experience=(ROOT/'ui-experience.js').read_text()
        cls.css=(ROOT/'ui-v6.css').read_text()
        cls.sw=(ROOT/'service-worker.js').read_text()
    def test_assets_all_referenced_and_cached(self):
        for f in ('ui-v6.css','ui-experience.js'):
            self.assertIn(f,self.html)
            self.assertIn(f,self.sw)
            self.assertTrue((ROOT/f).is_file())
        self.assertIn('mw4camo-v1.6.1-reliability',self.sw)
    def test_data_format_untouched(self):
        self.assertIn("const STORE_KEY = 'mw4camo-io-v1';",self.app)
        self.assertIn('v1.6.1',self.html)
    def test_quality_modes_and_reduced_motion(self):
        for v in ('auto','full','lite'):
            self.assertIn(v,self.experience)
        self.assertIn('prefers-reduced-motion: reduce',self.experience)
        self.assertIn('data-quality="lite"',self.css)
        self.assertIn('@keyframes page-sweep',self.css)
        self.assertIn('@media(prefers-reduced-motion:reduce)',self.css)
    def test_shortcuts_and_undo(self):
        self.assertIn('quickSearch',self.html)
        self.assertIn('backTop',self.html)
        self.assertIn('notifyUndo',self.app)
        self.assertIn('Ctrl K',self.experience)
    def test_core_functions_preserved(self):
        for name in ('renderBuild','renderWeapon','renderPatches','validatedImport','rerenderBuilderPreservePosition'):
            self.assertIn('function '+name+'(',self.app)
if __name__=='__main__':unittest.main()
