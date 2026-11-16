# v2.5.0 — Cross-Tab Draft Recovery and Mobile Accessibility (2026-11-16)

Patch 3 of the third sequential upgrade. Another browser tab's storage updates no longer erase unsaved Gunsmith draft changes, Complete Loadout class edits, or personal weapon comparison drafts. The currently edited Gunsmith form is compared to the prior selected build so unmodified pages do not create false dirty drafts. Saved blueprints have larger touch targets and responsive 2-column/1-column action buttons on phone screens. The keyboard Quick Jump now exposes combobox/listbox semantics, selection to screen readers and correct open/close state. Added CSS v11 to HTML and offline cache, responsive browser tests at 320px and 390px, cross-tab sync tests and accessibility assertions.

**Third release series: v2.3.0 → v2.4.0 → v2.5.0.** Existing camo progress, loadouts, patches, attachments, share-code compatibility and `mw4camo-io-v1` data remain preserved. Publisher automation remains unchanged.

---

# v2.4.0 — Safer Imports and Shareable Blueprint Vault (2026-11-16)

Third phased upgrade, patch 2. Backup import now rejects phantom blueprint records with extra key segments, unknown goals, unrecognized weapon IDs, invalid modes, and non-object slots. Legacy 2-segment keys still import. Active-goal and measured-build key validation is strengthened. Backup confirmation shows the actual imported camo, blueprint, and class counts. Saved Blueprints now provide **COPY SHARE LINK**, derived only from the existing verified MW4C2 website encoder. This is a website sharing link, not an in-game MW4 import code. Added browser and Python regression tests. Existing local storage keys and working features remain unchanged.

---

# v2.3.0 — Progress Write Protection (2026-11-16)

Third phased upgrade, patch 1. Camo completion and Undo, mastery, assistant counters, focus, favorites, weapon levels, tested build metrics, weapon comparison results, class selection, patch-review flags and mode switching now roll back in-memory changes when browser storage fails. Undo cannot report success after a rejected write. Comparison measurement drafts survive quota failures. Added Chromium failure/retry/undo coverage and Python regression checks. Storage key and existing features are preserved.

---

# v2.2.0 — Class Library and Blueprint Workflow Hardening (2026-11-16)

Phase 3 of the second upgrade. Complete Loadouts preserves earlier class data and current editor fields when saving, duplicating or deleting fails due to unavailable/full browser storage. New/clear class actions avoid phantom state updates. Saved Blueprint deletion and restoring published examples are transactional, retaining old data after failed writes. Opening a saved blueprint detects a lingering unsaved Gunsmith draft and asks before discarding it, ensuring **Edit** loads the actual saved version rather than an old draft. Browser tests cover failed writes and successful retries.

Second full release sequence: **v2.0.1 → v2.1.0 → v2.2.0**. Existing player progress, weapon catalogs, patch sources, publisher workflows and website share-code compatibility remain unchanged. Browser data is still stored under `mw4camo-io-v1`.

---

# v2.1.0 — Patch Feed Integrity Guard (2026-11-16)

Phase 2 of the second upgrade. Reject malformed publisher articles (invalid sections/points, duplicate IDs, non-official source links, invalid dates) and inconsistent timestamps or record counts before applying live patch snapshots. An incomplete publisher archive cannot remove already known patch records. Existing data stays usable on a rejected refresh. The independent guard has Node unit tests and Chromium checks for malformed network responses; the existing per-device refresh schedule and official source automation are unchanged.

---

# v2.0.1 — Transactional Save Recovery (2026-11-16)

Phase 1 of the second three-version upgrade. Failed browser storage writes no longer produce false successful resets or imports; the previous tracker state survives. Failed blueprint writes restore prior saved configuration, patch-review acknowledgments and legacy data, while keeping the unsaved editor draft. User-supplied game-code writes also roll back on quota failure. Chromium regression tests simulate quota failures for save, reset, and import and verify successful retry. Storage key remains `mw4camo-io-v1`.

---

# v2.0.0 — Offline and End-to-End Release Hardening (2026-11-16)

Phase 3: PWA caching is constrained to the declared app-shell assets rather than every same-origin GET. Publisher refreshes carrying `_fresh` bypass all caches; query-string share links can still fall back to the offline application shell without generating unbounded cache keys. Active navigation exposes `aria-current=page` to assistive technology. Added simulated service-worker unit tests and Chromium end-to-end checks for Blueprint Vault search, mode filters, sorting, sharing, viewport overflow and page errors.

Version sequence: **v1.9.2 → v1.9.3 → v2.0.0**, each validated before work on the next phase. The browser data key remains `mw4camo-io-v1`. No live weapon metadata was invented or altered, and website share codes are not in-game MW4 Gunsmith codes.

---

# v1.9.3 — Searchable Blueprint Vault (2026-11-16)

Phase 2: Saved Blueprints includes instant search across weapon, saved name, mode, and goal; mode filtering, newest-first/weapon-name sorting, and matching counts. Compatible builds offer one-click **Copy Website Code**; unverified or mismatched attachments are never fabricated as game codes. Responsive Vault controls support narrow devices. The v1 local save key and all previously saved configurations remain intact.

---

# v1.9.2 — Reliability and Backup Guardrails (2026-11-16)

Phase 1: saved-blueprint keys are validated, keeping legacy two-segment and modern three-segment entries. Null backup fields are rejected early. Legacy clipboard copy failures are handled. App and service worker cache versions are aligned. CI runs the complete Python unittest suite, website share-code tests, and JavaScript syntax checks. The browser storage key stays `mw4camo-io-v1`; no catalogs or known-working workflows are removed.

---

# v1.6.1 — Full Reliability Patch (2026-11-11)

A focused, backwards-compatible bugfix release for the existing Operator Hub, Camo Assistant, Gunsmith, Weapon Compare, Complete Loadouts, Patch Doctor, and mobile navigation.

### Fixed

- Weapon Compare no longer turns unsupplied null numeric metrics into 0 when saving a different field. Unknown values stay untested; comparisons never fabricate 0 ms TTK.
- The Complete Loadouts duplicate button correctly refuses a 41st saved class and keeps the selected class valid.
- Unsaved Gunsmith names/attachments survive navigation to other pages and back, not only game-mode switching.
- Partially corrupt local state is handled defensively rather than throwing an exception during page rendering.
- Storage/quota write failures are flagged in a persistent, accessible warning with backup instructions.
- Import, local reset and cross-tab storage updates clear old unsaved editor drafts.
- Camo Assistant manual counter/Undo operations preserve the current scroll location.
- Quick Jump can find older patch records past the first 25 entries.
- Service worker asset version bumped so old cached shell resources are retired.

### Validation

- `node --check app.js` and `node --check ui-experience.js` passed.
- 47 automated Python regression tests passed, including daily patch-sync tests.
- Prior v1.5 and v1.6 Chromium interaction suites passed.
- New v1.6.1 Chromium scenarios passed: null metric values, unsaved Gunsmith drafts, 40-class limit, malformed data, Camo Assistant Undo, storage errors, and 90 responsive page/viewport checks.
- Offline service-worker behavior was not directly verified; the local browser environment blocked HTTP-origin navigation.

**Compatibility:** no save-key migration; the `mw4camo-io-v1` format and existing live patch database remain unchanged.

---

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
