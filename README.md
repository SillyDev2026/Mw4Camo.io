# MW4Camo.io — MW4 + Warzone Camo Tracker & Gunsmith

[![Daily patch refresh](https://github.com/SillyDev2026/Mw4Camo.io/actions/workflows/sync-patches.yml/badge.svg)](https://github.com/SillyDev2026/Mw4Camo.io/actions/workflows/sync-patches.yml)

**[Open the live site](https://sillydev2026.github.io/Mw4Camo.io/)** · **[Official patch notes](https://www.callofduty.com/patchnotes)**

A free, local-first, unofficial fan tracker for Modern Warfare 4 and Warzone. Track camo unlocks and challenges, plan your next grind, assemble compatible loadouts from dropdowns, compare nine tactical goals, and browse the official patch-note archive. No account, API key, npm, or backend is required.

### v1.7.1 — Season 1 guns complete

Added 62 reported standard-attachment choices for the Cronen Osprey and 39 for the CSG-35 (63 and 40 total including their separate Apex attachments). Official levels, Apex names, and weapon-type categories are recorded. The community lists an additional Guard category for the CSG-35, shown provisionally. Corrected the CSG-35's unsupported Barrel slot. Named attachments remain third-party reported until verified in-game. No existing camo progress or blueprint storage is reset.

## v1.7.0 — Arsenal expansion

The site retains all 35 weapons and all saved progress. The Gunsmith now accepts a validated local snapshot of 615 community-reported attachments, organized by weapon and attachment slot, plus existing curated attachments. Names and mappings are unverified and not official Activision data. The original curated choices remain when offline or before snapshot sync. The Apex + five-standard-slot rules remain unchanged. A separate daily GitHub Actions sync refreshes `data/attachments-community.json` from the public COD Loadout source; the existing official patch sync remains independent. Use `python -m unittest discover -s tests -p 'test_arsenal_v17.py'` for catalog checks.

## v1.6.1 — Comprehensive stability and data-correctness patch

- **Weapon Compare:** fixed an important false-zero bug: missing personal ADS, TTK, recoil, and range values now remain **Not tested** after saving one field, instead of appearing as `0`.
- **Gunsmith draft preservation:** changing navigation routes no longer silently discards unsaved attachment and blueprint-name edits. Mode-switch preservation remains intact.
- **Class library limit:** the Duplicate action now enforces 40 saved classes per mode and never creates a ghost selection at the limit.
- **Recovery from malformed local data:** invalid field types and broken blueprint records no longer crash the dashboard, class builder, or other routes; compatible saved camo data is retained. Existing `mw4camo-io-v1` storage is preserved.
- **Storage failure warning:** blocked/full browser storage creates a persistent, visible warning with a link to backup settings instead of letting a success toast conceal failed persistence. The banner clears when saving works again.
- **Import/reset/sync:** temporary, unsaved editors are cleared on backup replacement, local reset, and external-tab saved-state updates, avoiding stale drafts overriding restored data.
- **Camo Assistant:** +1/-1 counters and Undo now preserve scroll position; Quick Jump searches the entire patch archive instead of only its first 25 entries.
- **PWA asset refresh:** cache version bumped to v1.6.1 to retire stale v1.6 assets. The existing daily patch-sync workflow and historical patch database are not replaced by the release commit.
- **Validation:** 47 automated Python tests, prior v1.5/v1.6 Playwright smoke tests, and 90 page/viewport checks in the new bug-regression harness. Offline service worker behavior could not be fully tested in this environment because local HTTP navigation was blocked.

Run `python tests/browser_v161_regression.py` to exercise the new regressions (requires Playwright and Chromium). Test results reduce risk but do not prove that all possible bugs are absent.

## v1.6 — Operator Hub, multi-class library and connected tools

- **Operator Hub** (`#/hub`) connects the four most-used workflows. Live local counters show pending patch reviews, saved classes, measured weapon/mode pairs and your current focus weapon.
- **Complete Loadouts 2.0** (`#/class-builder`) saves **up to 40 named classes per mode** with primary and secondary weapons, perks, equipment and notes. Create, edit, switch, duplicate, delete, reset unsaved fields and copy a complete class. Saved weapon-specific Gunsmith setups are linked in place. Previously saved v1.5 single-class records are visible as legacy classes and migrate on the next save.
- **Patch Loadout Doctor 2.0** (`#/doctor`) checks weapon names, equipped attachment names and explicit global weapon-change language in source-linked patch summaries. Filters are based on the saved blueprint's mode; review a note, review all pending notes for a build, and undo acknowledgments. A match means **needs review**, not an automatic buff/nerf verdict.
- **Camo Assistant 2.0** (`#/assistant`) includes a weapon focus picker, manual counter and target inputs per task, ±1 buttons with Undo, and a progress indicator without falsely marking an unlock.
- **Weapon Compare 2.0** (`#/compare`) displays head-to-head differences **only** for personal values entered for both weapons in the current mode. Unmeasured statistics remain blank. Save test data atomically, retain temporary edits while switching compared weapons, and copy results.
- **Compatibility and caching**: all existing progress uses the unchanged `mw4camo-io-v1` key. Backup export/import now covers the class library and active class ID; existing single-mode class saves, measurements, camo progress and patch review markers are preserved. Offline cache version updated to v1.6.1 and includes `ui-v8.css`.
- **Verified behavior**: local automated and headless browser regression tests cover the menu, four modules, class actions, manual camo counts, comparison deltas, responsive layouts, and legacy saves. These tests do not establish complete game data accuracy.

## v1.5 — Smart Arsenal Intelligence & full loadouts

- **Patch Loadout Doctor** (`#/doctor`): cross-references saved weapon blueprints against source-linked MW4 and Warzone patch records since a blueprint was saved. Review each matching record and mark it acknowledged. It never presumes a buff/nerf from ambiguous language and does not automatically rewrite loadouts.
- **Weapon Compare** (`#/compare`): side-by-side selected weapons, their game category, maximum level and attachment-catalog coverage. Publisher-confirmed numeric values are displayed with dates and links **only when sourced**; otherwise shown as unavailable. Optional user-entered TTK (ms), ADS (ms), recoil (0–10) and effective range (m) are saved separately per weapon and active mode and explicitly marked personal measurements, not official stats.
- **Full Loadout Creator** (`#/class-builder`): select a primary and secondary from the 35 MW4 weapons and Warzone's source-verified perk slots and tactical/lethal equipment; save classes independently for Warzone, MW4 and DMZ. Includes one-click Warzone Aggressive, Stealth and Squad Support perk/equipment presets sourced from the same official choices. When no official option list is available in a mode, empty slots are shown without invented items. Add field upgrades where names have been verified. Attachments remain weapon-specific in the separate Gunsmith page.
- **Camo Assistant** (`#/assistant`): dynamic personal objectives using checked camo milestones, pinned focus and manual challenge counters. Mark unlocks and increment challenge counts with an Undo action. A counter increment never auto-marks a camo complete.
- **Gunsmith Advisor**: each weapon builder now explains the compatibility and reported goal match for selected attachments, and links to pending patch review.
- **Quality, responsiveness & safety**: `ui-v7.css` adds predictable spacing, constrained cards and tap targets. All new state uses the existing `mw4camo-io-v1` storage key; v1 backup import/export includes class configs, patch acknowledgements and personal test numbers. Core weapon and attachment data and the daily official patch sync workflow are unchanged.

The Warzone perks/equipment options were cross-checked against the [official 2026 Season 1 Warzone patch notes](https://www.callofduty.com/patchnotes/2026/11/call-of-duty-mw4-warzone-season-1-patch-notes). The Rezi 12 damage/range facts are cited to the [official MW4 Season 1 notes](https://www.callofduty.com/patchnotes/2026/11/call-of-duty-modern-warfare-4-season-1-patch-notes). Availability, unlocked status and numeric performance should be verified in-game. No unofficial data is represented as measured TTK.

## v1.4 — restored animations, performance modes & quality-of-life

- **UI animations restored:** route-entry fades and slide-in HUD cards, small button presses, progress-bar filling, navigation highlight, status glow, and an animated notification. Page-entry animation only fires when changing routes, not on every camo checkbox update.
- **Adaptive UI detail:** Auto (hardware/data-saver aware), Full (enhanced motion), and Lite (fewer effects and GPU layers), adjustable from Settings → Visuals & Performance. System reduced-motion preferences override decorative movement.
- **Quick Jump:** Ctrl+K / Cmd+K or `/` opens searchable navigation for pages, weapons and patch entries. Mobile header has a search icon. Use arrow keys/Enter, Escape to close, and choose a recent weapon.
- **Undo progress:** after checking/unchecking a camo or account-mastery item, a temporary notification offers an Undo button.
- **Preserve unsaved Gunsmith edits:** mode switching now stashes the active draft so toggling MW4 and Warzone does not silently discard edits.
- **Scroll assistance:** back-to-top control appears on long pages. The PWA asset cache is versioned to load the updated styles/scripts, without clearing unrelated service-worker caches.
- **Performance and accessibility:** offscreen card rendering optimization, keyboard-accessible search, meaningful dialog labels, consistent spacing, touch feedback and reduced animation on slow devices.

## v1.3 — Choose your Gunsmith attachments

- **Per-weapon dropdowns:** choose a weapon, game mode and one of **nine goals**: Balanced, Fast TTK, Low Recoil, Aggressive, Long Range, Hipfire, Stealth, Quickscope and Squad Support. Choose a compatible attachment category, then an available **named attachment**—no manual name entry required.
- **Catalog:** 35 tracked MW4 weapons. 28 launch weapons have the official Gunsmith category map, two Season 1 weapons have **provisional** category maps, and five launchers/melee weapons correctly show **no traditional Gunsmith**. There are 199 distinct named attachment options in the curated catalog, cross-referenced to particular weapons where a source reports compatibility; this is **not** a complete or guaranteed in-game item list.
- **Correct constraints:** one attachment per category; up to five standard attachments. Optional weapon-specific Apex attachments, where reported, impose any applicable category restrictions and do not count as a standard slot.
- **One-click suggestions:** a Build for [goal] action proposes named selections matching that strategy, limited by the available compatible choices. Clear or replace individual selections, and save multiple builds per weapon/mode/goal.
- **Source transparency:** official slot rules are distinguished from community-reported attachment names and compatibility. When specific names are unknown, no fictional names appear. Season 1 weapon inventories remain unverified.
- **Legacy-friendly:** previously saved blueprints with manually entered attachments remain visible as **legacy/unverified selections**. Existing local camo progress and challenge counters continue to use the same browser storage key.
- **UI polish:** tighter page, cards, fields and mobile spacing; consistent responsive grids, buttons, touch controls and builder transitions; motion-reduction preferences respected.

## Other working features

- Searchable 35-weapon arsenal, favorites, per-weapon challenges and manual completion checkmarks.
- Special/Completionist challenge counters, mastery progression and account-wide camo milestones.
- Grind Planner with pin-to-focus weapon and next challenge recommendations.
- Loadout strategy comparison (editorial priority rankings, **not measured stats**), saved build vault and sourced starter examples.
- Searchable MW4 + Warzone patch archive with separate patch detail pages, official links and status information.
- Daily GitHub Actions patch refresh, source-failure protection, local save/export/import, installable PWA shell.

## Running locally

```bash
python -m http.server 8000
```

Visit `http://localhost:8000/`. All frontend JavaScript is plain browser code. The main files are `index.html`, `app.js`, `styles.css`, `ui-v2.css`, `ui-v3.css`, `ui-v4.css`, `ui-v5.css`, `ui-v6.css`, `ui-v7.css`, `ui-v8.css`, `ui-experience.js`, `data/intel-v15.js`, `data/weapons.js` and `data/attachments.js`.

## Testing

```bash
python -m unittest discover -s tests -v
node --check app.js
node --check ui-experience.js
python tests/browser_v16_smoke.py
python tests/browser_v161_regression.py
```

The test suite covers catalogs, constraints, daily synchronization, source fallbacks, and saved-build compatibility. The browser regression suite exercises desktop, tablet and mobile widths.

## Automated patch refresh

GitHub Actions workflow: `.github/workflows/sync-patches.yml`. The script `scripts/sync_patches.py` discovers and checks official patch articles on a daily UTC cron and can also be started manually. On success it updates the patch JSON/JS archives and the source-health file; on failed source reads, cached records are retained. **New game weapons, challenge requirements and compatibility data are not automatically invented or added;** these still require source review. GitHub Pages automatically deploys changes to the main branch.

## Data & limitations

- Browser storage key `mw4camo-io-v1` is deliberately unchanged for upgrades. Use Settings → Export Backup before clearing browsing data.
- No Activision sign-in or cloud sync. Saved data does not automatically follow you to another device.
- **Fast TTK** and **Low Recoil** refer to selection priorities, not proven fastest TTK or physically zero recoil. Gun statistics can change after patches. There is no fabricated numeric stat simulation.
- Reported item names/weapon fit may be incomplete or wrong; confirm in-game. Official slot rules are mapped for launch weapons only; two Season 1 weapons are provisional; five launchers/melee have no conventional attachment builder.
- This tool is independently developed and not affiliated with Activision or its studios. See [ATTRIBUTION.md](ATTRIBUTION.md) for original sources and license notes.

## File map

```text
index.html                  Main application shell
app.js                      Navigation, camo tracker and Gunsmith interactions
styles.css, ui-v*.css       Responsive styles, adaptive detail and animations
ui-experience.js             Quick Jump, quality modes, back-to-top and recent weapons
data/weapons.json / .js     MW4 weapon/camo records
data/attachments.json / .js Named weapon attachment catalog and category rules
data/builds.json            Published starter configurations
data/patches.json / .js     Official patch archive (updated by GitHub Actions)
data/update-status.*       Patch watcher health
scripts/sync_patches.py    Official source monitor
.github/workflows/         Daily cron
service-worker.js          Offline shell cache
manifest.webmanifest       Installable app metadata
tests/                      Regression suite
```

### v1.3.1 interface fix
The left navigation drawer is interactive on narrow screens. Use the top-left menu control to open it; close with ×, the dark backdrop, Escape, or a navigation selection. No game data was changed.

## v1.5 development checks

```bash
node --check app.js
python -m unittest discover -s tests -p 'test_*.py' -q
# Optional interactive Chromium smoke test (requires Playwright and Chromium):
python tests/browser_v15_smoke.py
```

The browser smoke harness injects local assets into a sandboxed page to run without external network dependencies. Production use is through HTTPS/GitHub Pages.
