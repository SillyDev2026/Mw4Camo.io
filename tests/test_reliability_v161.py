from pathlib import Path
import json
import re

ROOT=Path(__file__).resolve().parents[1]
APP=(ROOT/'app.js').read_text()
UI=(ROOT/'ui-experience.js').read_text()
SW=(ROOT/'service-worker.js').read_text()
INDEX=(ROOT/'index.html').read_text()


def test_new_version_assets_loaded():
    assert 'v1.6.1' in INDEX
    assert 'v1.6.1' in SW
    for name in ['ui-experience.js','app.js','data/weapons.js','data/patches.js','data/intel-v15.js','ui-v8.css']:
        assert name in SW
        assert (ROOT/name).is_file()


def test_unrecorded_weapon_metrics_are_null_not_zero():
    assert "record[key]!==null&&record[key]!==''" in APP
    assert "Number.isFinite(Number(record[key]))" in APP


def test_class_duplicate_checks_capacity_before_write():
    assert "if(classList(state.mode).length>=40)" in APP
    assert 'state.classLibrary[state.mode]=[...classList(state.mode),copy];' in APP


def test_backup_import_and_reset_clear_unsaved_drafts():
    for name in ['classDrafts','builderDrafts','measurementDrafts']:
        assert APP.count('Object.keys('+name+')')>=2


def test_unsaved_gunsmith_survives_navigation():
    assert "if(previous[0]==='build'&&destination!==lastRenderedPath)" in APP
    assert "stashDraft(w);" in APP


def test_search_covers_whole_patch_catalog():
    assert 'patches.map(p=>' in UI
    assert 'patches.slice(0,25)' not in UI


def test_expected_data_files_and_workflow_preserved():
    assert (ROOT/'.github/workflows/sync-patches.yml').exists()
    assert len(json.loads((ROOT/'data/weapons.json').read_text()))==35
    assert len(json.loads((ROOT/'data/patches.json').read_text()))>=6


def test_persistent_storage_warning_is_wired():
    assert 'id="storageWarning"' in INDEX
    assert "if(warning)warning.hidden=false" in APP
    assert "if(warning)warning.hidden=true" in APP
    assert '.storage-warning:not([hidden])' in (ROOT/'ui-v8.css').read_text()
