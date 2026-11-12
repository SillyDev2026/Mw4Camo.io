"""Regression checks for restored motion, detail modes and progress preservation."""
import pathlib
import unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class ExperienceV14(unittest.TestCase):
    def test_assets(self):
        html=(ROOT/'index.html').read_text()
        sw=(ROOT/'service-worker.js').read_text()
        for name in ('ui-v6.css','ui-experience.js'):
            self.assertIn(name,html)
            self.assertIn(name,sw)
        self.assertIn('mw4camo-v1.4.0-experience',sw)
    def test_motion_and_qol(self):
        css=(ROOT/'ui-v6.css').read_text()
        js=(ROOT/'ui-experience.js').read_text()
        app=(ROOT/'app.js').read_text()
        self.assertIn('@keyframes page-sweep',css)
        self.assertIn('[data-quality="lite"]',css)
        self.assertIn('prefers-reduced-motion: reduce',js)
        self.assertIn('notifyUndo',app)
        self.assertIn("mw4camo-io-v1",app)
        self.assertIn('stashDraft(w)',app)
if __name__=='__main__':unittest.main()
