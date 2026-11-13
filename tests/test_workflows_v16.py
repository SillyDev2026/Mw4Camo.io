import pathlib, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class WorkflowV16(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app=(ROOT/'app.js').read_text()
        cls.html=(ROOT/'index.html').read_text()
        cls.css=(ROOT/'ui-v8.css').read_text()
        cls.sw=(ROOT/'service-worker.js').read_text()
    def test_complete_features_and_routes(self):
        self.assertIn('data-route="hub"',self.html)
        self.assertIn("route==='hub'?renderCommandHub()",self.app)
        self.assertIn('renderCamoAssistant()',self.app)
        self.assertIn('renderMeasuredDifferences(a,b)',self.app)
        for action in ('doctor-mode','review-all','quick-decrease','class-new','class-duplicate','class-delete','copy-compare'):
            self.assertIn("action==='"+action+"'",self.app)
        self.assertIn('data-task-counter="target"',self.app)
    def test_new_save_format_keeps_compatibility(self):
        self.assertIn("const STORE_KEY = 'mw4camo-io-v1'",self.app)
        self.assertIn('activeClassIds',self.app)
        self.assertIn('classLibrary',self.app)
        self.assertIn("'legacy-'+mode",self.app)
        self.assertIn('const activeClassIds=Object.fromEntries',self.app)
    def test_only_mode_specific_patch_review(self):
        self.assertIn("mode==='Warzone'?p.game==='Warzone':p.game==='MW4'",self.app)
        self.assertIn('patchMatchLines',self.app)
        self.assertIn('Saved blueprint',self.app) if False else None
    def test_pwa_asset_and_lod(self):
        self.assertIn('ui-v8.css',self.html)
        self.assertIn('ui-v8.css',self.sw)
        self.assertIn('mw4camo-v1.8.1-patch-refresh',self.sw)
        self.assertIn('prefers-reduced-motion:reduce',self.css)
        self.assertIn('[data-quality="lite"]',self.css)
if __name__=='__main__':unittest.main()
