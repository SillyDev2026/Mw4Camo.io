# MW4Camo.io — MW4 + Warzone Camo Tracker & Gunsmith

[![Daily patch refresh](https://github.com/SillyDev2026/Mw4Camo.io/actions/workflows/sync-patches.yml/badge.svg)](https://github.com/SillyDev2026/Mw4Camo.io/actions/workflows/sync-patches.yml)

**[Open the live site](https://sillydev2026.github.io/Mw4Camo.io/)** · **[Official patch notes](https://www.callofduty.com/patchnotes)**

A free, local-first, unofficial fan tracker for Modern Warfare 4 and Warzone. Track camo unlocks and challenges, plan your next grind, assemble compatible loadouts from dropdowns, compare nine tactical goals, and browse the official patch-note archive. No account, API key, npm, or backend is required.

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

Visit `http://localhost:8000/`. All frontend JavaScript is plain browser code. The main files are `index.html`, `app.js`, `styles.css`, `ui-v2.css`, `ui-v3.css`, `ui-v4.css`, `ui-v5.css`, `ui-v6.css`, `ui-v7.css`, `ui-experience.js`, `data/intel-v15.js`, `data/weapons.js` and `data/attachments.js`.

## Testing

```bash
python -m unittest discover -s tests -v
node --check app.js
node --check ui-experience.js
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
