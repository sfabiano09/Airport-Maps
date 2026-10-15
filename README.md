# Airport Maps

iPhone web app for finding your way around airports: gate search, food, restrooms, lounges, and ground transport (rental cars, rideshare, taxis, transit, parking). Works offline once an airport is saved.

**Open on iPhone:** https://sfabiano09.github.io/Airport-Maps/ → Share → *Add to Home Screen*.

## Where the data comes from

A GitHub Action (`.github/workflows/build-data.yml`) runs every Monday and rebuilds `data/CODE.json` for each airport:

| Source | Used for |
|---|---|
| [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL) | Terminal outlines, gates, floor levels, restrooms, food, lounges, ground transport |
| [Overture Maps](https://overturemaps.org) places (CDLA-Permissive / ODbL) | Extra restaurants, cafés, lounges and rental cars from business listings; confirms or flags OSM places |
| [Wikidata](https://www.wikidata.org) (CC0) | Each airport's official website |
| [LAX Terminal Concession Locations](https://catalog.data.gov/dataset/los-angeles-international-airport-terminal-concession-locations), City of Los Angeles open data (CC BY 4.0) | LAX only: official restaurant/shop locations; moves "approximate" places to their official spot (`scripts/official.js`) |

Merge rules (`core.js` → `mergeOverture`): OpenStreetMap is the base. An Overture place with a similar name, same type, within 150 m confirms the OSM place ("confirmed by 2 sources"). Unmatched Overture places are added only with confidence ≥ 0.6, near the terminals, and are labeled *location approximate* (dashed marker). Places Overture lists as closed are flagged *may have closed*. If an airport fails to build one week, its previous file is kept.

Airports not in the list can still be looked up live by code from OpenStreetMap.

To rebuild now: **Actions → Build airport data → Run workflow** (optionally enter codes like `IND BWI`).

Missing or wrong info? Fix it on OpenStreetMap (link in each airport's ⋯ menu) and it'll show up after the next weekly build.

## Developer mode (fixing places in the field)

In the app: ⋯ menu → **Developer mode**. Tap any place to **Drag pin**, use **I'm here** (GPS), confirm **Spot's right**, set its **Level**, or mark it **Gone**; **+ Add place** drops a new one. Edits apply instantly on the phone (offline too) and sync to `corrections/CODE.json` using a fine-grained GitHub token (this repo only, Contents read/write) stored in the phone's browser. The app loads those files for every visitor, and the weekly build bakes them into `data/`. Corrected places show "✓ Verified in person".
