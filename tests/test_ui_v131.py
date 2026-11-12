"""Regression checks for menu layering, focus and UI-only scope."""
import pathlib
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]

class NavigationRegression(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html=(ROOT/'index.html').read_text()
        cls.app=(ROOT/'app.js').read_text()
        cls.css=(ROOT/'ui-v5.css').read_text()
        cls.sw=(ROOT/'service-worker.js').read_text()

    def test_backdrop_in_shell_before_drawer(self):
        shell=self.html.index('<div class="shell">')
        backdrop=self.html.index('id="sidebarBackdrop"')
        sidebar=self.html.index('id="sidebar"')
        self.assertLess(shell,backdrop)
        self.assertLess(backdrop,sidebar)
        self.assertIn('z-index:44',self.css)
        self.assertIn('z-index:50',self.css)

    def test_open_close_controls(self):
        self.assertIn('id="menuClose"',self.html)
        self.assertIn('aria-controls="sidebar"',self.html)
        self.assertIn('const mobileNavigation=window.matchMedia',self.app)
        self.assertIn('menuClose.addEventListener',self.app)
        self.assertIn('sidebarBackdrop.addEventListener',self.app)
        self.assertIn("event.key==='Escape'",self.app)
        self.assertIn('sidebar.inert=mobileNavigation.matches',self.app)

    def test_cache_and_ui_scope(self):
        self.assertIn('ui-v5.css',self.html)
        self.assertIn('ui-v5.css',self.sw)
        self.assertIn('mw4camo-v1.6.0-experience',self.sw)
        self.assertTrue((ROOT/'data/weapons.json').is_file())
        self.assertTrue((ROOT/'data/attachments.json').is_file())
        self.assertIn("const STORE_KEY = 'mw4camo-io-v1';",self.app)

if __name__=='__main__':
    unittest.main()
