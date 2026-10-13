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

Merge rules (`core.js` → `mergeOverture`): OpenStreetMap is the base. An Overture place with a similar name, same type, within 150 m confirms the OSM place ("confirmed by 2 sources"). Unmatched Overture places are added only with confidence ≥ 0.6, near the terminals, and are labeled *location approximate* (dashed marker). Places Overture lists as closed are flagged *may have closed*. If an airport fails to build one week, its previous file is kept.

Airports not in the list can still be looked up live by code from OpenStreetMap.

To rebuild now: **Actions → Build airport data → Run workflow** (optionally enter codes like `IND BWI`).

Missing or wrong info? Fix it on OpenStreetMap (link in each airport's ⋯ menu) and it'll show up after the next weekly build.
