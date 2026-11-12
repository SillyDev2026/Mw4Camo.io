# MW4Camo.io v1.2.0 — Operations Upgrade

Release date: November 11, 2026

## New features

- **Grind Planner:** a dedicated next-objective page that ranks unfinished weapons by progress toward the eleven base camos. Recommended shows nine actionable picks; All, Favorites, Near Gold and Not Started offer alternative filters.
- **Pinned focus weapon:** choose one weapon to keep at the front of the mission queue and surface its next unchecked challenge on the home dashboard.
- **Challenge counters:** track your own numeric count and goal for Special and Completionist camo challenges without artificially marking the camo complete. These counters are manual because published targets differ by mode or are not yet verified.
- **Gunsmith strategy comparison:** compare two of nine build goals across five clearly labelled *editorial priority weights*, not simulated damage, weapon recoil or time-to-kill.
- **Searchable patch archive:** search all indexed patch titles, dates, section headings, and categorized bullets; retain MW4/Warzone filters.
- **Keyboard and mobile navigation:** accessible skip button, Escape-to-close navigation, mobile drawer backdrop, improved focus rings and responsive grids.

## Fixes

- Entering a weapon level now only saves that level; **it no longer incorrectly claims Military camos are completed.** Camo checkmarks require explicit player confirmation.
- Cross-tab changes refresh the local UI through the Storage event.
- Existing v1 state/backups remain readable. New `counters` and `focusWeapon` are optional fields on the v1 backup schema, so the export retains compatibility.
- Versioned cache includes the new stylesheet; offline-first behavior remains network-first for updates.

## Data & accuracy

- Existing 35-weapon MW4 catalogue is retained. No unsupported new weapons or verified attachment stats have been invented.
- Source-cited named loadouts remain examples. Builder performance priorities are **guidance**, not quantitative weapon TTK or no-recoil guarantees.
- The GitHub Actions patch checker runs daily, with article discovery and source-health reporting. It updates the site archive but does **not** automatically add newly released weapons to the catalogue; those require data review.
- Local ZIP contains a repository-source snapshot; the live GitHub Pages deployment includes the latest auto-generated patch catalogue.
