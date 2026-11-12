# v1.6.0 — Operator Hub and Workflows

- Added a connected Operator Hub with fast links to Patch Doctor, Camo Assistant, Weapon Compare and Full Loadouts.
- Complete Loadouts now supports multiple named classes per game mode, duplicate/edit/delete, notes, session drafts, and links to primary/secondary Gunsmith configurations. Keeps v1.5 class data readable.
- Patch Doctor now separates game-mode context, matches named equipped attachments where present, supports individual/bulk review with Undo, and links to official source pages. It does not assume confirmed nerfs/buffs.
- Camo Assistant now has a weapon picker, editable targets, direct +1/-1 counters and progress indicators.
- Weapon Compare now displays personal-test deltas, supports copying results, maintains unsaved input drafts during selections, and validates submissions before writing either weapon.
- New ui-v8.css responsive styling, updated PWA cache and documentation. v1 storage format remains backwards compatible.

## Limitations

Missing official attachments, weapon TTK figures and mode-specific challenge requirements are still not invented; published entries include appropriate provenance. A source-text match is a review suggestion, not proof that a build must change. Data remains local to the browser unless exported.

---

# MW4Camo.io v1.5.0 — Smart Arsenal Intel

**Release date:** November 11, 2026

### New features

- Source-aware side-by-side weapon comparison with optional personal game-test measurements (TTK, ADS, recoil and range), clearly separated from verified publisher data.
- Patch-aware Loadout Doctor with per-build review queue and acknowledgements. Matching patch text is informational, not an automatic nerf or meta claim.
- Camo Assistant with three-objective plan, manual counter increments, completion marking and Undo.
- Complete class builder with primary/secondary slots and official Warzone Season 1 perk slots, lethal/tactical lists, three one-click Warzone playstyle presets, and mode-separated local saves.
- Gunsmith advisor: explains selected attachment source quality and strategy match, with patch review shortcuts.
- Extended Ctrl+K Quick Jump and main sidebar navigation for the four new pages.
- v1.5 responsive styles and versioned offline assets. Existing local browser key remains compatible.

### Fixes and safeguards

- v1 legacy blueprint import preserves valid save timestamps, allowing precise patch review dating.
- Edited blueprints reset previous patch acknowledgements for that specific build, so new revisions can be checked.
- Numeric input validation rejects out-of-range personal measurements; unmeasured fields remain unavailable, never zero.
- Camo Assistant recommends a mix of level and trackable challenges rather than displaying only the first three Military camos.
- Duplicate weapon comparison is rejected.
- Mode-specific class loadouts and personal measurements cannot overwrite each other's data.
- Official patch-feed updater and dynamically refreshed patch archive are not overwritten by the release commit.

### Data-source limitations

- Warzone equipment/perk catalog is official for Season 1. MW4/DMZ equipment options remain partial and are displayed as such.
- Only the Rezi 12 has publisher-verified weapon-specific numerical values in the curated dataset; unsupported weapon TTK/damage/recoil values are **not estimated**.
- Class builder covers the MW4 roster, not legacy Warzone guns, and does not link to Activision accounts.
- The Doctor identifies note matches, not true balance effect size or perfect attachment compatibility.

### Tests

- 35 regression tests in the Python stdlib suite.
- Chromium test harness: 14 routes at 320, 390, 768 and 1440px with primary save, measurement, camo +1 and Undo, and Gunsmith save behavior.

---

# MW4Camo.io v1.4.0 — HUD Motion, LOD & UX Reliability

**Release date:** November 11, 2026

## Bug fixes

- Fixed inconsistent animation visibility on touch devices by introducing real route-entry, primary-panel and status animations rather than relying only on desktop hover states.
- Avoided repeating page-entry animations whenever a checkbox or Gunsmith selection rerenders a page.
- Made the Undo action tappable despite the older toast system's `pointer-events: none` default.
- Preserve in-progress, unsaved Gunsmith draft fields when switching MW4 and Warzone modes.
- Refreshed the PWA cache key and asset list; clean only caches owned by MW4Camo.
- Consolidated spacing/interaction overrides into `ui-v6.css` rather than changing the weapon and attachment databases.

## Quality of life and level of detail

- Visuals menu: Auto / Full / Lite, with data-saver and low-capability detection. Preferences are saved locally and do not overwrite camo progress.
- Full: page entrance and HUD panel transitions, progress bar movement, button press response, and status pulses.
- Lite: reduced decorative layers, no expensive backdrop blur or infinite pulse animations, no page transitions.
- System reduced-motion preferences always disable decorative animations.
- Ctrl+K / Cmd+K / `/` Quick Jump for pages, weapons, recently visited weapons and selected patch articles.
- Undo on accidental camo and mastery completion toggles, keyboard-accessible search dialog and back-to-top control.
- Offscreen browser content-visibility optimization for weapon, patch and planner lists when supported.

## Compatibility

- Browser data key remains `mw4camo-io-v1`. Existing local camo checkmarks, goals, blueprints, weapon levels and exported backups stay compatible.
- Patch-feed automation and gameplay data are unchanged.
- Goal-priority scores remain editorial recommendations, not verified weapon recoil or TTK measurements.

## Validation

- Static regression suite and functional browser tests for mobile and desktop navigation, command search, all nine build goals, undo, motion modes, reduced-motion and overflow.

---

## v1.3.1 — UI navigation and spacing repair

- Fixed mobile sidebar/menu hit-testing: the overlay no longer covers navigation links.
- Added a visible close button, Escape and backdrop dismissal, tab-loop keyboard navigation, and accurate expanded state.
- Sidebar cannot receive keyboard focus while offscreen; opening the drawer locks background scrolling.
- Aligned the mobile/desktop navigation breakpoint at 900px and improved responsive header, menu, cards, and tap target spacing.
- No weapon catalogs, camo progression, loadout logic, or patch synchronization data were changed.

# MW4Camo.io v1.3.0 — Real Gunsmith Controls & UI Overhaul

**Release date:** November 11, 2026

## Features

- Replaced manual attachment-name text fields with **weapon-specific attachment-category and named-attachment dropdowns**.
- Added **199 distinct named catalog items** with source type and reported compatible weapon IDs. Names may be incomplete or community-reported; see in-app source links and ATTRIBUTION.md.
- Mapped official Gunsmith categories for **28 launch weapons**, marked **two Season 1 weapons as provisional**, and disabled the traditional attachment workbench for **five launchers/melee**.
- Introduced **Build for [goal]** recommendations for all **nine** goals. Recommendations remain a *strategy* and do not assert measured recoil/TTK improvements.
- Enforced **five standard attachments**, a single selection per category, and weapon-specific Apex category conflicts. Adding, changing, replacing and clearing attachments are all selectable without typing names.
- Preserved saved builds and imported legacy manual attachment selections with clear unverified labels.
- Redesigned the Gunsmith using compact, responsive slot rows, clearer category/source indicators, better spacing, fluid layouts and keyboard/mobile focus improvements.
- Updated the service worker asset manifest and application version to v1.3.0.

## Checks

- `node --check app.js`
- `python -m unittest discover -s tests -q` (**21 tests passed**)
- Browser smoke tests for 16 views at 320, 390, 900 and 1440px, covering navigation, nine goals, option selection, Apex restrictions, save/load and no-Gunsmith weapons; no page-level JavaScript exceptions or horizontal overflow found in the tested cases.

## Known limitations

- Community-report mappings and unverified names are **not** proof that a particular attachment is currently selectable in game.
- Not all attachment categories have documented names for all weapons. The app leaves categories without sourced names empty instead of generating fake ones.
- The two Season 1 weapons are on a provisional slot map until their official categories are verified.
- Patch intelligence updates automatically; the weapon and attachment databases require separate reviews when an official content drop changes them.
