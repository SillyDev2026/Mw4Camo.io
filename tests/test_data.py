import json
import sys
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from sync_patches import parse_updates, date_of

class ContentIntegrity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.weapons=json.loads((ROOT/'data/weapons.json').read_text())
        cls.builds=json.loads((ROOT/'data/builds.json').read_text())
        cls.patches=json.loads((ROOT/'data/patches.json').read_text())

    def test_weapon_roster(self):
        self.assertEqual(len(self.weapons),35)
        self.assertEqual(sum(w['season']=='Launch' for w in self.weapons),33)
        self.assertEqual(sum(w['season']=='Season 1' for w in self.weapons),2)
        self.assertEqual(len({w['id'] for w in self.weapons}),35)
        self.assertEqual(len({w['category'] for w in self.weapons}),9)

    def test_camos(self):
        self.assertEqual(sum(len(w['specials']) for w in self.weapons),105)
        self.assertEqual(sum(s['confidence']=='official' for w in self.weapons for s in w['specials']),6)
        self.assertEqual(sum(s['confidence']=='community' for w in self.weapons for s in w['specials']),93)
        self.assertEqual(sum(s['confidence']=='not-published' for w in self.weapons for s in w['specials']),6)
        for weapon in self.weapons:
            self.assertEqual(len(weapon['military']),8)
            self.assertEqual(len(weapon['specials']),3)
            assert weapon['maxLevel'] is None or all(level is None or level<=weapon['maxLevel'] for level in weapon['military'])
            assert weapon['maxLevel'] is None or all(s['level'] is None or s['level']<=weapon['maxLevel'] for s in weapon['specials'])

    def test_build_references(self):
        ids={w['id'] for w in self.weapons}
        self.assertTrue(all(b['weapon'] in ids and b['source'].startswith('https://') for b in self.builds))
        self.assertEqual(len(self.builds),6)

    def test_patches(self):
        self.assertEqual(len({p['id'] for p in self.patches}),len(self.patches))
        self.assertTrue(all(p['source'].startswith('https://www.callofduty.com/patchnotes/') for p in self.patches))

    def test_parser(self):
        html='''<main><h1>Patch</h1><h2>November 11, 2026</h2><h3>WEAPONS</h3><ul><li>All ballistic weapon distances have improved significantly in this update.</li></ul><h2>TUESDAY NOVEMBER 10</h2><h3>Bug Fixes</h3><p>Fixed several situations where equipped weapons could not be modified.</p></main>'''
        res=parse_updates(html,'MW4','https://www.callofduty.com/patchnotes/foo')
        self.assertEqual(len(res),2)
        self.assertEqual({p['date'] for p in res},{'2026-11-11','2026-11-10'})
        self.assertEqual(date_of('WEDNESDAY NOVEMBER 11'),'2026-11-11')
        self.assertIsNone(date_of('Weapons'))

if __name__=='__main__':
    unittest.main()
