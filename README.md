# MW4Camo.io — MW4 & Warzone Camo Tracker / Loadout Lab

[![Daily patch refresh](https://github.com/SillyDev2026/Mw4Camo.io/actions/workflows/sync-patches.yml/badge.svg)](https://github.com/SillyDev2026/Mw4Camo.io/actions/workflows/sync-patches.yml)

MW4Camo.io is a **free, local-first fan tracker** for Call of Duty: Modern Warfare 4 / Warzone, hosted on GitHub Pages. It tracks camos and your actual progress, allows individual objective-oriented loadout presets, and maintains an indexed archive of official patch notes.

**Live website:** https://sillydev2026.github.io/Mw4Camo.io/  
**Official patch notes:** https://www.callofduty.com/patchnotes

## Features in v1.2

- **Weapon Arsenal:** 35 current MW4 weapons (33 at launch plus Cronen Osprey and CSG-35); searchable and filterable by class, progress, and favorites.
- **Camo Tracker:** 8 Military, 3 Special, 3 Completionist, and 4 Weapon Prestige slots per weapon. Tracks additional account-wide mastery. Each challenge has a provenance label where possible.
- **Challenge Counters:** on Special and Completionist tiles, enter a manual **Done** count and **Target** count; the counter is informative and does not automatically mark the camo as unlocked.
- **Grind Planner:** highlights a focus weapon, recommends nine next missions, and lets you filter all weapons by proximity to Gold, favorites, or no progress.
- **Loadout Lab:** nine tactical objectives (Balanced, Fast TTK, Low Recoil, Aggressive, Long Range, Hipfire, Stealth, Quickscope, Squad Support); individual saves by game mode, weapon, and profile.
- **Goal Comparison:** compare the intended tuning *priorities* of different builds. The 1–5 priority values are editorial, **not** measured weapon statistics.
- **Patch Intelligence:** dedicated MW4 and Warzone changelogs, searchable by weapon/date/patch bullet, with categorized sections and source links.
- **Automatic Daily Refresh:** GitHub Actions fetches official MW4 and Warzone patch article pages and discovers newly linked official sources. It preserves existing data on source failure, writes status data, and fails when it cannot verify any official source.
- **Personal Vault:** no account required; progress is saved in browser localStorage, supports JSON export/import, and refreshes when another tab changes the data.
- **Installable & Responsive:** fluid `%` / `clamp()` layouts, app manifest, accessible mobile navigation, animation with reduced-motion support, service-worker offline shell.

## Quick start

### Live GitHub Pages

The GitHub repository's `main` branch is published to GitHub Pages. Open the [live website](https://sillydev2026.github.io/Mw4Camo.io/) to begin.

### Local development

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

No build step, API key, server, or npm dependencies are required for the site. `app.js`, `styles.css`, `ui-v2.css`, and `ui-v3.css` are plain browser assets.

### Running tests

```bash
python -m unittest discover -s tests -v
node --check app.js
```

## Daily patch updates

Workflow: `.github/workflows/sync-patches.yml`  
Updater: `scripts/sync_patches.py`

Runs on a UTC schedule and can be started manually from GitHub Actions → **Daily MW4 and Warzone official patch refresh** → Run workflow.

The action discovers official patch-note pages from the Call of Duty hub, checks existing official article sources, and updates `data/patches.json`, `data/patches.js`, `data/update-status.json`, `data/update-status.js`, and `data/source-state.json` when changes are detected. Source checks fall back to a public reader mirror of the **same official URL** if the publisher times out.

**Limitations:** this is a monitored patch archive, not an official API. Text parsing can miss details or require manual verification. Newly announced weapons and updated camo requirements are **not** auto-added to `data/weapons.json` without source review.

## Data integrity

- Data is stored in `localStorage` under `mw4camo-io-v1`. The v1 key and v1 backup schema are kept intentionally so earlier users retain existing progress.
- New optional fields: `counters` (per challenge manual progress and target) and `focusWeapon`.
- Selecting a weapon level does **not** check off Military camo: only manually checked tiles count as completed.
- Import validates known weapon IDs, camo IDs, build slots, modes and numeric fields. Export before clearing browser data.
- There is no Activision account linkage or cross-device cloud sync; data remains on your device unless exported.
- “Fast TTK” and “Low Recoil” prioritize sensible attachment attributes but do **not** guarantee a measured fastest TTK or zero recoil. Check attachment availability and performance in the current game patch.

## Repo layout

```text
index.html
app.js
styles.css
ui-v2.css
ui-v3.css
manifest.webmanifest
service-worker.js
assets/favicon.svg
data/weapons.json  # weapon catalog (reviewed manually)
data/weapons.js
data/builds.json   # sourced baseline configurations
/data/patches.json # generated + manually curated patch archive
scripts/sync_patches.py
tests/
.github/workflows/sync-patches.yml
```

## Official sources & licensing

See [ATTRIBUTION.md](ATTRIBUTION.md) for third-party source and attribution details. This is an independent fan project and is not affiliated with Activision, Infinity Ward, or Raven Software. The website's source code is covered by the included license; external game names, product names, artwork and other protected marks remain with their owners.
