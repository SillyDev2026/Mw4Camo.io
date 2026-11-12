# MW4Camo.io · v1.1.0

**A responsive MW4 + Warzone camo tracker, gunsmith workbench, personal blueprint vault, and daily official patch intelligence monitor.** Independent fan project; no account, advertising, telemetry, API token, or npm build required.

## Screens & features

| Area | Functionality |
| --- | --- |
| Command Center | Dashboard progress, class completion, mastery overview, recent official patches and tactical briefing |
| Weapons & Camos | 35 MW4 weapons (33 launch plus two Season 1); class/status/favorite filters, weapon levels, 18 camo checkboxes per weapon |
| Mastery Roadmap | Gold, Platinum, Harmonic Break and account-wide camo goals with completion tracking |
| Loadout Lab | Weapon-specific builder for all 35 MW4 weapons and Warzone / MW4 / DMZ modes |
| Tuning profiles | **Balanced, Fast TTK, Low Recoil, Aggressive, Long Range, Hipfire, Stealth, Quickscope, Squad Support** |
| Strategy guidance | Per-slot attachment priority advice, class-specific weapon tactics and strategy emphasis meters (not fabricated performance stats) |
| Blueprint Vault | Multiple named builds **per weapon + mode + goal**, saved, edited, copied or deleted locally |
| Patch Intelligence | Separate official MW4 / Warzone patch archives, detailed change pages, categorized notes, source links and detected weapon mentions |
| Automated refresh | GitHub Actions, **daily at 16:23 UTC** plus manual button; discovers new official patch article links and checks dated revisions |
| Update health | Date of last check, date of last successful check, monitored source count and warnings in the patch feed |
| Device support | Fluid CSS `%`, `minmax`, `clamp`, `vw` and responsive grids; desktop/tablet/mobile; menu drawer, focus states and reduced-motion support |
| Offline & backup | PWA service worker, JSON import/export, localStorage save; offline after one successful HTTP(S) visit |

This initial roster intentionally contains **MW4 weapons only**, including those usable in Warzone. Older legacy Warzone guns are **not** yet indexed; adding them requires an independently verified catalog and compatible camo challenge mapping. Weapon names and camo data may change following game updates.

### Loadout performance accuracy

The nine goals help players select *types* of attachments that suit a weapon's purpose. **They do not simulate the Gunsmith or measure true TTK, recoil, handling, magazine count, or weapon performance.** Exact attachment names appear when sourced from a published build or provided by you. Sourced starter builds contain their own source/date and may become outdated after balance changes. The “Low Recoil” profile cannot guarantee zero recoil, and “Fast TTK” does not claim a mathematically optimal setup.

## Deploy to the existing GitHub repository

Repository: **`SillyDev2026/Mw4Camo.io`** (public). Put all source files in the **repository root**, keeping `.github/workflows` and the other folders. `index.html` must be at the top level.

1. In repository **Settings → Pages**, select **Deploy from a branch**, `main` and `/ (root)`. Save.
2. In **Actions**, enable scheduled workflows if prompted. Open **Daily MW4 and Warzone official patch refresh → Run workflow** to trigger the first manual check. The daily schedule is `23 16 * * *` (16:23 UTC); GitHub does not guarantee minute-exact runs. Schedule jobs may be delayed or disabled after prolonged repository inactivity.
3. Ensure **Settings → Actions → General → Workflow permissions** permit the job to write to repository contents. If organizational restrictions prevent it, request repository owner changes. Check the Actions run logs before assuming synchronization succeeded.
4. Open `https://sillydev2026.github.io/Mw4Camo.io/` after Pages finishes its deployment. A custom `mw4camo.io` address requires domain ownership and GitHub Pages DNS configuration; `CNAME.example` is not active.

For local development: `python -m http.server 8000` from the project root, then open `http://localhost:8000`.

## How the daily feed works

- `scripts/sync_patches.py` fetches the [official patch index](https://www.callofduty.com/patchnotes) and finds relevant, allowlisted MW4 and Warzone dated article URLs. It always monitors the known Season 1 articles, even if index discovery fails.
- It parses dated headings, organizes compact excerpts into sections, stores a **stable source+game+date hash**, and updates a patch entry when a dated section changes rather than endlessly duplicating revisions.
- The update job writes `data/patches.json`, `data/patches.js`, `data/source-state.json`, `data/update-status.json`, and `data/update-status.js`. The website consumes local JavaScript data for GitHub Pages compatibility. The full official article is always linked.
- When the official publisher is unreachable, the job records a warning and retains all prior entries. If a page's HTML structure changes, the parser may need maintenance. The feed does **not** automatically verify new weapon catalogs, historical legacy arsenal entries, camo challenges or untrusted loadout claims.
- No sensitive tokens are required: the workflow uses the scoped GitHub Actions `GITHUB_TOKEN` provided by the platform for the same repository.

## Data compatibility

Progress uses the original `mw4camo-io-v1` browser localStorage key, preserving v1 camo checklists, favorites, weapon levels and existing saved builds on upgrade. New per-goal blueprints use keys in the form `weapon-id|Warzone|Low Recoil`. Old two-part blueprint keys remain readable as Balanced configurations. Exported v1 backups remain importable; v1.1 exports also include active tuning goals. Deleting a blueprint requires confirmation. This app does not communicate with an Activision account.

## Files

```text
index.html                  Responsive app shell
styles.css                  Legacy foundation styles (retained for compatibility)
ui-v2.css                   Fluid, tactical responsive UI and accessible animations
app.js                      Router, trackers, nine-goal Gunsmith, blueprint vault and storage
manifest.webmanifest        Installable web app manifest
service-worker.js           Offline cache, network-first updates
data/weapons.json           Human-readable 35-weapon roster
 data/weapons.js            Browser weapon/camo catalog and starter builds
 data/builds.json           Sourced starter loadout records
 data/patches.json          Official update history
 data/patches.js            Browser patch history
 data/update-status.json    Latest check health
 data/update-status.js      Browser check health
scripts/sync_patches.py     Daily official-source monitor
.github/workflows/          Daily scheduled patch refresh
assets/favicon.svg          Original project icon
tests/                      Data integrity, patch discovery and failure tests
LICENSE, ATTRIBUTION.md     Licensing and data sources
```

## Verification

```bash
python -m pip install beautifulsoup4==4.12.3
python -m unittest discover -s tests -v
node --check app.js
python scripts/sync_patches.py --dry-run  # Requires access to official site
```

Browser smoke tests cover dashboard, the 35-weapon arsenal, a 9-profile builder, local preset saving, patch details and camo completion on desktop and mobile viewport sizes. Text sources follow `ATTRIBUTION.md`.

### Network reliability

The daily bot tries the official Call of Duty patch pages directly first. When a GitHub-hosted runner times out on that publisher, it can try a public reader mirror of the *same official URL*. It validates the mirror’s declared URL before parsing. The site continues to link to the original official source. Readers and mirrors can be unavailable or stale; the bot retains the last known patch archive and exposes health status rather than silently clearing updates. Check the Actions run and the Intelligence page for the last successful source check.
