import unittest,json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'data/attachments.json').read_text());WEAPONS=json.loads((ROOT/'data/weapons.json').read_text());BUILDS=json.loads((ROOT/'data/builds.json').read_text())
class GunsmithTest(unittest.TestCase):
 def test_weapon_coverage(self):
  self.assertEqual(len(DATA['specs']),35);self.assertEqual(sum(bool(x['types']) for x in DATA['specs'].values()),30)
 def test_catalog(self):
  self.assertGreaterEqual(len(DATA['items']),190);self.assertEqual(len({(x['type'],x['name'].lower()) for x in DATA['items']}),len(DATA['items']))
 def test_attachment_compatibility(self):
  for item in DATA['items']:
   self.assertTrue(item['weapons']);self.assertTrue(item['source'].startswith('https://'))
   for wid in item['weapons']:self.assertIn(item['type'],DATA['specs'][wid]['types'])
 def test_all_launch_weapon_types_official(self):
  for w in WEAPONS:
   if w['season']=='Launch':self.assertEqual(DATA['specs'][w['id']]['source'],'official')
 def test_apex(self):
  for w in WEAPONS:
   s=DATA['specs'][w['id']];self.assertEqual(len(s['types']),len(set(s['types'])))
   self.assertTrue(set(s['blocked']).issubset(set(s['types'])))
   if w['category'] in ('Launchers','Melee'):
    self.assertFalse(s['apex']);self.assertFalse(s['types'])
 def test_special_types(self):
  self.assertIn('Fire Mods',DATA['specs']['ppsh-41']['types']);self.assertNotIn('Rear Grip',DATA['specs']['ppsh-41']['types'])
  self.assertIn('Cylinder',DATA['specs']['mojave-357']['types']);self.assertNotIn('Magazine',DATA['specs']['mojave-357']['types'])
  self.assertIn('Guard',DATA['specs']['rezi-12']['types']);self.assertNotIn('Magazine',DATA['specs']['rezi-12']['types'])
 def test_seed_choices_available(self):
  for s in BUILDS:
   for typ,name in s['slots'].items():
    self.assertIn(typ,DATA['specs'][s['weapon']]['types'])
    self.assertTrue(any(x['type']==typ and x['name'].lower()==name.lower() and s['weapon'] in x['weapons'] for x in DATA['items']),(s['weapon'],typ,name))
 def test_page_load_order_and_cache(self):
  h=(ROOT/'index.html').read_text();self.assertLess(h.index('data/attachments.js'),h.index('app.js'))
  sw=(ROOT/'service-worker.js').read_text();self.assertIn('ui-v4.css',sw);self.assertIn('data/attachments.js',sw)
if __name__=='__main__':unittest.main()
