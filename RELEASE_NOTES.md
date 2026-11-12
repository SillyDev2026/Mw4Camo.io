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
