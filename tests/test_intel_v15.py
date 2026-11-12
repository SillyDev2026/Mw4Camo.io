import pathlib, json, re, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'data/intel-v15.json').read_text())
WEAPONS=json.loads((ROOT/'data/weapons.json').read_text())
class TestV15(unittest.TestCase):
    def test_asset_dependencies(self):
        h=(ROOT/'index.html').read_text()
        sw=(ROOT/'service-worker.js').read_text()
        for asset in ('ui-v7.css','data/intel-v15.js'):
            self.assertIn(asset,h)
            self.assertIn(asset,sw)
            self.assertTrue((ROOT/asset).is_file())
        self.assertLess(h.index('data/intel-v15.js'),h.index('app.js'))
    def test_verifiable_numeric_sources(self):
        ids={w['id'] for w in WEAPONS}
        self.assertTrue(DATA['verifiedWeaponStats'])
        for wid,record in DATA['verifiedWeaponStats'].items():
            self.assertIn(wid,ids)
            self.assertTrue(record['source'].startswith('https://www.callofduty.com/'))
            for f in record['facts']:
                self.assertIsInstance(f['value'],(int,float))
                self.assertNotIn(f['unit'],('ms ttk','score'))
    def test_not_inventing_game_catalog(self):
        self.assertEqual(set(DATA['options']),{'MW4','DMZ','Warzone'})
        self.assertTrue({'Incognito','Stocked','Field Medic'}.issubset(set(DATA['options']['Warzone']['perks'][0])))
        self.assertIn('Deft Hands',DATA['options']['Warzone']['perks'][1])
        self.assertIn('Wingman',DATA['options']['Warzone']['perks'][2])
        self.assertEqual(DATA['options']['MW4']['perks'],[[],[],[]])
    def test_routes_and_handlers(self):
        app=(ROOT/'app.js').read_text()
        h=(ROOT/'index.html').read_text()
        for route in ('class-builder','compare','assistant','doctor'):
            self.assertIn('data-route="'+route+'"',h)
            self.assertIn("route==='"+route+"'",app)
        for action in ('save-class','save-measures','quick-count','review-patch','assistant-complete','class-preset'):
            self.assertIn("action==='"+action+"'",app)
    def test_state_migration(self):
        app=(ROOT/'app.js').read_text()
        for key in ('weaponMeasurements','reviewedPatches','classConfigs'):
            self.assertIn(key,app)
        self.assertIn("const STORE_KEY = 'mw4camo-io-v1'",app)
    def test_existing_catalog_integrity(self):
        catalog=json.loads((ROOT/'data/attachments.json').read_text())
        self.assertEqual(len(WEAPONS),35)
        self.assertEqual(len(catalog['specs']),35)
        self.assertGreaterEqual(len(catalog['items']),190)
        self.assertEqual(len({w['id'] for w in WEAPONS}),35)
if __name__=='__main__':unittest.main()
