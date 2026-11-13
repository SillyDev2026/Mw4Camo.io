import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'scripts'))
import sync_patches as sync

HUB = '''<main><a href="/patchnotes/2026/11/call-of-duty-modern-warfare-4-season-1-patch-notes">MW4 Updates</a>
<a href="https://www.callofduty.com/patchnotes/2027/01/call-of-duty-mw4-warzone-season-2-patch-notes">Warzone Season 2</a>
<a href="https://evil.example.com/patchnotes/2027/01/warzone-season-3">Invalid</a>
<a href="https://www.callofduty.com/patchnotes/2027/01/other-game-season">Not MW4</a></main>'''
ARTICLE = '''<main><h1>Patch Notes</h1><h2>January 9, 2027</h2><h3>Weapons</h3>
<ul><li>Weapon recoil tuning was improved for a number of assault rifles.</li></ul>
<h3>UI / UX</h3><p>Fixed a display issue for loadout attachments in the lobby.</p></main>'''

class TestSync(unittest.TestCase):
    def test_url_filter_and_future_discovery(self):
        urls=sync.discover_sources(HUB)
        self.assertEqual(len(urls), 2)
        self.assertIn('https://www.callofduty.com/patchnotes/2027/01/call-of-duty-mw4-warzone-season-2-patch-notes', urls)
        self.assertIsNone(sync.valid_url('https://untrusted.example/patchnotes/2027/01/warzone'))
        self.assertIsNone(sync.valid_url('javascript:alert(1)'))

    def test_2027_date_and_headings(self):
        rows=sync.parse_updates(ARTICLE,'Warzone','https://www.callofduty.com/patchnotes/2027/01/call-of-duty-mw4-warzone-season-2-patch-notes')
        self.assertEqual(len(rows),1)
        self.assertEqual(rows[0]['date'],'2027-01-09')
        self.assertEqual(len(rows[0]['sections']),2)
        self.assertTrue(rows[0]['fingerprint'])

    def test_failure_does_not_wipe_patches(self):
        original=json.loads(sync.PATCH_JSON.read_text())
        def fail(_url): raise RuntimeError('temporary outage')
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            for name,data in [('patches.json',original),('update-status.json',{'lastSuccessfulAt':'2026-11-11T00:00:00+00:00'}),('source-state.json',{})]:
                (root/name).write_text(json.dumps(data))
            with patch.multiple(sync,PATCH_JSON=root/'patches.json',PATCH_JS=root/'patches.js',STATE_JSON=root/'source-state.json',STATUS_JSON=root/'update-status.json',STATUS_JS=root/'update-status.js'):
                result=sync.update(fetcher=fail)
                self.assertEqual(result['lastSuccessfulAt'],'2026-11-11T00:00:00+00:00')
                self.assertEqual(result['newEntries'],0)
                self.assertEqual(json.loads((root/'patches.json').read_text()),original)

    def test_partial_current_season_failure_preserves_stale_status(self):
        def fake(url):
            if url == sync.HUB: return HUB
            if url == sync.PINNED['Warzone']: raise RuntimeError('temporary Warzone outage')
            return ARTICLE
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            (root/'patches.json').write_text('[]')
            (root/'status.json').write_text(json.dumps({'lastSuccessfulAt':'2026-11-11T00:00:00+00:00'}))
            with patch.multiple(sync,PATCH_JSON=root/'patches.json',PATCH_JS=root/'patches.js',STATE_JSON=root/'state.json',STATUS_JSON=root/'status.json',STATUS_JS=root/'status.js'):
                result=sync.update(fetcher=fake)
                self.assertFalse(result['activeSourcesHealthy'])
                self.assertEqual(result['lastSuccessfulAt'],'2026-11-11T00:00:00+00:00')
                self.assertGreaterEqual(result['patchCount'],1)
                self.assertTrue(result['latestPatchDate'])

    def test_dry_run_never_writes(self):
        def fake(url): return HUB if url==sync.HUB else ARTICLE
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            (root/'patches.json').write_text('[]')
            with patch.multiple(sync,PATCH_JSON=root/'patches.json',PATCH_JS=root/'patches.js',STATE_JSON=root/'state.json',STATUS_JSON=root/'status.json',STATUS_JS=root/'status.js'):
                result=sync.update(dry_run=True,fetcher=fake)
                self.assertGreaterEqual(result['discoveredSources'],2)
                self.assertFalse((root/'status.json').exists())
                self.assertFalse((root/'state.json').exists())
                self.assertEqual((root/'patches.json').read_text(),'[]')

if __name__=='__main__': unittest.main()
