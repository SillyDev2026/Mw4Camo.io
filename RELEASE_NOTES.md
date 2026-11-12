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