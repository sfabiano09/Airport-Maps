#!/usr/bin/env node
/* Weekly airport data build (runs in GitHub Actions).

   node scripts/build.js lookup [CODES...]   find each airport in OpenStreetMap + its official website on Wikidata → tmp/meta.json
   python scripts/overture.py                 pull Overture Maps places around each airport           → tmp/overture/CODE.json
   node scripts/build.js build  [CODES...]    OpenStreetMap terminal data + merge Overture             → data/CODE.json, data/index.json

   If an airport fails this week, its previous data file is kept rather than replaced with nothing. */
"use strict";
const fs = require("fs");
const path = require("path");
const core = require("../core.js");
const OFFICIAL = require("./official.js");

const ROOT = path.join(__dirname, "..");
const TMP = path.join(ROOT, "tmp");
const DATA = path.join(ROOT, "data");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = "AirportMaps/1.0 (personal travel app; https://github.com/)";

async function withRetry(label, fn, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) {
      if (e.notfound || i === tries - 1) throw e;
      const wait = 20000 * (i + 1);
      console.log(`  ${label}: ${e.message || e} — retrying in ${wait / 1000}s`);
      await sleep(wait);
    }
  }
}

function pickCodes(args) {
  const all = core.AIRPORTS.map(a => a.code);
  const want = args.map(s => s.toUpperCase()).filter(Boolean);
  return want.length ? all.filter(c => want.includes(c)) : all;
}

/* ---------------- Wikidata: official websites by IATA code ---------------- */
async function wikidataWebsites(codes) {
  const q = `SELECT ?iata ?site WHERE { VALUES ?iata { ${codes.map(c => `"${c}"`).join(" ")} }
    ?a wdt:P238 ?iata; wdt:P856 ?site. }`;
  const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(q);
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/sparql-results+json" } });
  if (!r.ok) throw new Error("Wikidata HTTP " + r.status);
  const j = await r.json();
  const out = {};
  for (const b of j.results.bindings) {
    const code = b.iata.value, site = b.site.value;
    // prefer https and the shortest (usually the home page, not a sub-page)
    if (!out[code] || (site.startsWith("https") && !out[code].startsWith("https")) || site.length < out[code].length) out[code] = site;
  }
  return out;
}

async function lookup(codes) {
  fs.mkdirSync(TMP, { recursive: true });
  const meta = {};
  let sites = {};
  try { sites = await wikidataWebsites(codes); console.log(`Wikidata: websites for ${Object.keys(sites).length} airports`); }
  catch (e) { console.log("Wikidata unavailable:", e.message); }
  // one request for every airport; then individual retries only for any the batch missed
  let found = {};
  try { found = await withRetry("batch lookup", () => core.lookupAerodromes(codes)); }
  catch (e) { console.log("Batch lookup failed:", e.message); }
  // reuse last week's outlines for anything still missing (airports don't move)
  let prev = {};
  try { prev = JSON.parse(fs.readFileSync(path.join(DATA, "meta.json"), "utf8")); } catch {}
  for (const code of codes) {
    let ap = found[code];
    if (!ap && prev[code]) { ap = prev[code]; console.log(`${code}: using saved outline`); }
    if (!ap) {
      try { ap = await withRetry(code, () => core.lookupAerodrome(code), 2); await sleep(2000); }
      catch (e) { console.log(`${code}: lookup failed — ${e.message}`); }
    }
    if (!ap) { console.log(`${code}: not found in OpenStreetMap`); continue; }
    ap.website = sites[code] || ap.website || "";
    ap.websiteSource = sites[code] ? "wikidata" : ap.website ? "osm" : "";
    meta[code] = ap;
  }
  fs.writeFileSync(path.join(TMP, "meta.json"), JSON.stringify(meta));
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(path.join(DATA, "meta.json"), JSON.stringify({ ...prev, ...meta }));
  console.log(`Looked up ${Object.keys(meta).length}/${codes.length} airports`);
}

async function build(codes) {
  fs.mkdirSync(DATA, { recursive: true });
  const meta = JSON.parse(fs.readFileSync(path.join(TMP, "meta.json"), "utf8"));
  let release = null;
  try { release = fs.readFileSync(path.join(TMP, "overture_release.txt"), "utf8").trim() || null; } catch {}
  const indexPath = path.join(DATA, "index.json");
  let index = { airports: {} };
  try { index = JSON.parse(fs.readFileSync(indexPath, "utf8")); } catch {}
  const now = new Date().toISOString();
  const failed = [];

  // second pass: airports that failed the first time (busy map server) get another try after a pause
  let queue = codes.slice();
  for (let pass = 1; pass <= 2 && queue.length; pass++) {
  if (pass === 2) { console.log(`Retrying ${queue.length} airports after a pause: ${queue.join(", ")}`); await sleep(120000); failed.length = 0; }
  for (const code of queue) {
    const ap = meta[code];
    if (!ap) { failed.push(code); continue; }
    try {
      const raw = await withRetry(code, () => core.overpass(core.featureQuery(ap), 180000), 2);
      const { feats, polys } = core.processOSM(raw.elements || []);
      const graph = core.buildGraph(raw.elements || []);
      let places = [], stats = null;
      const ovPath = path.join(TMP, "overture", code + ".json");
      if (fs.existsSync(ovPath)) places = JSON.parse(fs.readFileSync(ovPath, "utf8"));
      const merged = core.mergeOverture(feats, polys, places);
      // the airport's own open data, where it publishes some (see scripts/official.js)
      let official = null;
      if (OFFICIAL[code]) {
        try {
          const o = await OFFICIAL[code]();
          const m = core.mergeOfficial(merged.feats, o.places);
          merged.feats = m.feats; official = { label: o.label, ...m.stats };
          console.log(`  ${code} official listing: ${JSON.stringify(m.stats)}`);
        } catch (e) { console.log(`  ${code} official listing unavailable: ${e.message}`); }
      }
      stats = merged.stats;
      const counts = {};
      merged.feats.forEach(f => { counts[f.c] = (counts[f.c] || 0) + 1; });
      const rec = {
        code, osmName: ap.name, website: ap.website, websiteSource: ap.websiteSource,
        center: ap.center, bounds: ap.bounds, generated: now,
        sources: { osm: now.slice(0, 10), overture: fs.existsSync(ovPath) ? release : null, official: official ? official.label : null },
        stats, counts, feats: merged.feats, polys, g: graph,
      };
      fs.writeFileSync(path.join(DATA, code + ".json"), JSON.stringify(rec));
      index.airports[code] = { generated: now, counts, overture: !!rec.sources.overture, walkNodes: graph ? graph.n.length / 2 : 0 };
      console.log(`${code}: ${JSON.stringify(counts)} · overture matched ${stats.matched}, added ${stats.added} · walkway nodes ${graph ? graph.n.length / 2 : 0}`);
    } catch (e) {
      failed.push(code);
      console.log(`${code}: build failed — ${e.message} (keeping last week's file if there is one)`);
    }
    await sleep(3000);
  }
  queue = failed.slice();
  }
  index.generated = now;
  index.overtureRelease = release;
  index.failed = failed;
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 1));
  console.log(`Built ${codes.length - failed.length}/${codes.length}. Failed: ${failed.join(", ") || "none"}`);
}

(async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  const codes = pickCodes(rest);
  if (cmd === "lookup") await lookup(codes);
  else if (cmd === "build") await build(codes);
  else { console.log("usage: build.js lookup|build [CODES...]"); process.exit(2); }
})().catch(e => { console.error(e); process.exit(1); });
