/* Airport Maps — shared core.
   Used by the app in the browser and by scripts/build.js in GitHub Actions,
   so the phone and the weekly data build categorize and merge places identically. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.AirportCore = factory();
})(typeof self !== "undefined" ? self : this, function () {
"use strict";

const AIRPORT_DATA = `
ABQ|Albuquerque Sunport|Albuquerque|NM|1
ALB|Albany Intl|Albany|NY|1
AMA|Rick Husband Amarillo Intl|Amarillo|TX|1
ANC|Ted Stevens Anchorage Intl|Anchorage|AK|1
ATL|Hartsfield–Jackson Atlanta Intl|Atlanta|GA|1
AUS|Austin–Bergstrom Intl|Austin|TX|1
BDL|Bradley Intl|Hartford|CT|1
BHM|Birmingham–Shuttlesworth Intl|Birmingham|AL|1
BNA|Nashville Intl|Nashville|TN|1
BOI|Boise Airport|Boise|ID|1
BOS|Logan Intl|Boston|MA|1
BUF|Buffalo Niagara Intl|Buffalo|NY|1
BUR|Hollywood Burbank|Burbank|CA|1
BWI|Baltimore/Washington Intl|Baltimore|MD|1
BZN|Bozeman Yellowstone Intl|Bozeman|MT|1
CHS|Charleston Intl|Charleston|SC|1
CLE|Cleveland Hopkins Intl|Cleveland|OH|1
CLT|Charlotte Douglas Intl|Charlotte|NC|1
CMH|John Glenn Columbus Intl|Columbus|OH|1
COS|Colorado Springs Airport|Colorado Springs|CO|1
CRP|Corpus Christi Intl|Corpus Christi|TX|1
CVG|Cincinnati/Northern Kentucky Intl|Cincinnati|KY|1
DAL|Dallas Love Field|Dallas|TX|1
DCA|Reagan Washington National|Washington|VA|1
DEN|Denver Intl|Denver|CO|1
DSM|Des Moines Intl|Des Moines|IA|1
DTW|Detroit Metro Wayne County|Detroit|MI|1
ECP|Northwest Florida Beaches Intl|Panama City|FL|1
ELP|El Paso Intl|El Paso|TX|1
EUG|Eugene Airport|Eugene|OR|1
FAT|Fresno Yosemite Intl|Fresno|CA|1
FLL|Fort Lauderdale–Hollywood Intl|Fort Lauderdale|FL|1
GEG|Spokane Intl|Spokane|WA|1
GRR|Gerald R. Ford Intl|Grand Rapids|MI|1
GSP|Greenville–Spartanburg Intl|Greenville|SC|1
HDN|Yampa Valley Regional|Hayden / Steamboat|CO|1
HNL|Daniel K. Inouye Intl|Honolulu|HI|1
HOU|William P. Hobby|Houston|TX|1
HRL|Valley Intl|Harlingen|TX|1
ICT|Wichita Eisenhower National|Wichita|KS|1
IND|Indianapolis Intl|Indianapolis|IN|1
ISP|Long Island MacArthur|Islip|NY|1
ITO|Hilo Intl|Hilo|HI|1
JAN|Jackson–Medgar Wiley Evers Intl|Jackson|MS|1
JAX|Jacksonville Intl|Jacksonville|FL|1
KOA|Kona Intl|Kailua-Kona|HI|1
LAS|Harry Reid Intl|Las Vegas|NV|1
LAX|Los Angeles Intl|Los Angeles|CA|1
LBB|Lubbock Preston Smith Intl|Lubbock|TX|1
LGA|LaGuardia|New York|NY|1
LGB|Long Beach Airport|Long Beach|CA|1
LIH|Lihue Airport|Lihue|HI|1
LIT|Clinton National|Little Rock|AR|1
MAF|Midland Intl|Midland / Odessa|TX|1
MCI|Kansas City Intl|Kansas City|MO|1
MCO|Orlando Intl|Orlando|FL|1
MDW|Chicago Midway Intl|Chicago|IL|1
MEM|Memphis Intl|Memphis|TN|1
MHT|Manchester–Boston Regional|Manchester|NH|1
MIA|Miami Intl|Miami|FL|1
MKE|Milwaukee Mitchell Intl|Milwaukee|WI|1
MSP|Minneapolis–St. Paul Intl|Minneapolis|MN|1
MSY|Louis Armstrong New Orleans Intl|New Orleans|LA|1
MTJ|Montrose Regional|Montrose|CO|1
MYR|Myrtle Beach Intl|Myrtle Beach|SC|1
OAK|Oakland San Francisco Bay|Oakland|CA|1
OGG|Kahului Airport|Kahului, Maui|HI|1
OKC|Will Rogers Intl|Oklahoma City|OK|1
OMA|Eppley Airfield|Omaha|NE|1
ONT|Ontario Intl|Ontario|CA|1
ORF|Norfolk Intl|Norfolk|VA|1
PBI|Palm Beach Intl|West Palm Beach|FL|1
PDX|Portland Intl|Portland|OR|1
PHL|Philadelphia Intl|Philadelphia|PA|1
PHX|Phoenix Sky Harbor Intl|Phoenix|AZ|1
PIT|Pittsburgh Intl|Pittsburgh|PA|1
PNS|Pensacola Intl|Pensacola|FL|1
PSP|Palm Springs Intl|Palm Springs|CA|1
PVD|Rhode Island T. F. Green Intl|Providence|RI|1
PWM|Portland Intl Jetport|Portland|ME|1
RDU|Raleigh–Durham Intl|Raleigh / Durham|NC|1
RIC|Richmond Intl|Richmond|VA|1
RNO|Reno–Tahoe Intl|Reno|NV|1
ROC|Greater Rochester Intl|Rochester|NY|1
RSW|Southwest Florida Intl|Fort Myers|FL|1
SAN|San Diego Intl|San Diego|CA|1
SAT|San Antonio Intl|San Antonio|TX|1
SAV|Savannah/Hilton Head Intl|Savannah|GA|1
SBA|Santa Barbara Airport|Santa Barbara|CA|1
SDF|Louisville Muhammad Ali Intl|Louisville|KY|1
SEA|Seattle–Tacoma Intl|Seattle|WA|1
SFO|San Francisco Intl|San Francisco|CA|1
SJC|San Jose Mineta Intl|San Jose|CA|1
SJU|Luis Muñoz Marín Intl|San Juan|PR|1
SLC|Salt Lake City Intl|Salt Lake City|UT|1
SMF|Sacramento Intl|Sacramento|CA|1
SNA|John Wayne Airport|Santa Ana / Orange County|CA|1
SRQ|Sarasota–Bradenton Intl|Sarasota|FL|1
STL|St. Louis Lambert Intl|St. Louis|MO|1
STS|Charles M. Schulz–Sonoma County|Santa Rosa|CA|1
STT|Cyril E. King|St. Thomas|VI|1
TPA|Tampa Intl|Tampa|FL|1
TUL|Tulsa Intl|Tulsa|OK|1
TUS|Tucson Intl|Tucson|AZ|1
TYS|McGhee Tyson|Knoxville|TN|1
VPS|Destin–Fort Walton Beach|Destin / Fort Walton|FL|1
DFW|Dallas/Fort Worth Intl|Dallas / Fort Worth|TX|0
EWR|Newark Liberty Intl|Newark|NJ|0
IAD|Washington Dulles Intl|Washington|VA|0
IAH|George Bush Intercontinental|Houston|TX|0
JFK|John F. Kennedy Intl|New York|NY|0
ORD|Chicago O'Hare Intl|Chicago|IL|0
AUA|Queen Beatrix Intl|Oranjestad|Aruba|1
NAS|Lynden Pindling Intl|Nassau|Bahamas|1
BZE|Philip S. W. Goldson Intl|Belize City|Belize|1
GCM|Owen Roberts Intl|Grand Cayman|Cayman Islands|1
LIR|Guanacaste Airport|Liberia|Costa Rica|1
SJO|Juan Santamaría Intl|San José|Costa Rica|1
HAV|José Martí Intl|Havana|Cuba|1
PUJ|Punta Cana Intl|Punta Cana|Dominican Republic|1
MBJ|Sangster Intl|Montego Bay|Jamaica|1
CUN|Cancún Intl|Cancún|Mexico|1
PVR|Gustavo Díaz Ordaz Intl|Puerto Vallarta|Mexico|1
SJD|Los Cabos Intl|San José del Cabo|Mexico|1
SXM|Princess Juliana Intl|Philipsburg|Sint Maarten|1
PLS|Providenciales Intl|Providenciales|Turks and Caicos|1
CDG|Charles de Gaulle|Paris|France|0
AMS|Amsterdam Schiphol|Amsterdam|Netherlands|0
FRA|Frankfurt Airport|Frankfurt|Germany|0
FCO|Leonardo da Vinci–Fiumicino|Rome|Italy|0
LHR|London Heathrow|London|United Kingdom|0
DUB|Dublin Airport|Dublin|Ireland|0
BER|Berlin Brandenburg|Berlin|Germany|0
MXP|Milan Malpensa|Milan|Italy|0
LIN|Milan Linate|Milan|Italy|0
EDI|Edinburgh Airport|Edinburgh|United Kingdom|0
MUC|Munich Airport|Munich|Germany|0
BCN|Barcelona–El Prat|Barcelona|Spain|0
`;

const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
];

function meters(a, b) {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toR, dLon = (b.lon - a.lon) * toR;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

async function overpass(query, timeoutMs = 120000) {
  let lastErr;
  for (const url of OVERPASS) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const r = await fetch(url, { method: "POST", body: new URLSearchParams({ data: query }), signal: ctl.signal });
      clearTimeout(timer);
      if (r.status === 429 || r.status === 504) { lastErr = new Error("busy"); lastErr.busy = true; continue; }
      if (!r.ok) { lastErr = new Error("HTTP " + r.status); continue; }
      return await r.json();
    } catch (e) { clearTimeout(timer); lastErr = e; }
  }
  throw lastErr || new Error("Map server unreachable");
}

async function lookupAerodrome(code, run = overpass) {
  const q = `[out:json][timeout:30];nwr["aeroway"="aerodrome"]["iata"="${code}"];out tags bb;`;
  const j = await run(q, 25000);
  const els = (j.elements || []).filter(e => e.tags);
  if (!els.length) return null;
  // prefer the polygon (way/relation) over a bare node
  const area = e => e.bounds ? (e.bounds.maxlat - e.bounds.minlat) * (e.bounds.maxlon - e.bounds.minlon) : 0;
  els.sort((a, b) => area(b) - area(a));
  const e = els[0];
  let b = e.bounds;
  const c = e.center || (e.lat != null ? { lat: e.lat, lon: e.lon } : null);
  if (!b && c) b = { minlat: c.lat - 0.02, maxlat: c.lat + 0.02, minlon: c.lon - 0.025, maxlon: c.lon + 0.025 };
  if (!b) return null;
  return {
    name: e.tags.name || code,
    website: e.tags.website || e.tags["contact:website"] || "",
    bounds: b,
    center: c || { lat: (b.minlat + b.maxlat) / 2, lon: (b.minlon + b.maxlon) / 2 },
  };
}

function bboxStr(b, padM = 0) {
  const dLat = padM / 111320;
  const dLon = padM / (111320 * Math.cos(((b.minlat + b.maxlat) / 2) * Math.PI / 180));
  return [b.minlat - dLat, b.minlon - dLon, b.maxlat + dLat, b.maxlon + dLon].map(n => n.toFixed(5)).join(",");
}

function featureQuery(ap, opts = {}) {
  const IN = bboxStr(ap.bounds, 150), OUT = bboxStr(ap.bounds, 1600);
  return `[out:json][timeout:150][maxsize:200000000];
(
  nwr["aeroway"~"^(gate|terminal)$"](${IN});
  nwr["building"="terminal"](${IN});
  nwr["amenity"~"^(restaurant|cafe|fast_food|bar|pub|food_court|ice_cream|toilets|lounge)$"](${IN});
  nwr["shop"~"^(coffee|bakery|deli)$"](${IN});
  nwr["lounge"](${IN});
  nwr["name"~"lounge|club|centurion|sapphire|polaris|security|checkpoint|tsa|baggage|bag claim|rideshare|ride share|ride app|uber|lyft|ticketing",i](${IN});
  way["indoor"~"^(area|corridor)$"](${IN});
  nwr["amenity"~"^(car_rental|taxi|bus_station)$"](${OUT});
  nwr["railway"~"^(station|halt)$"](${OUT});
  nwr["public_transport"="station"](${OUT});
  nwr["amenity"="parking"]["name"](${OUT});
  nwr["amenity"="parking"]["parking"="multi-storey"](${OUT});
);
out geom${opts.meta === false ? "" : " meta"} qt;`;
}

/* ---------------- Processing raw OSM → app features ---------------- */
const FOOD = new Set(["restaurant", "cafe", "fast_food", "bar", "pub", "food_court", "ice_cream", "biergarten"]);
const FOOD_LABEL = { restaurant: "Restaurant", cafe: "Café", fast_food: "Quick bite", bar: "Bar", pub: "Pub", food_court: "Food court", ice_cream: "Ice cream", biergarten: "Beer garden" };
const LOUNGE_RE = /(lounge|admirals club|sky ?club|united club|centurion|polaris|flagship|priority pass|\bthe club\b|delta one|capital ?one|sapphire|\buso\b|amex|clubhouse|plaza premium|escape|airspace|aspire)/i;
const RIDE_RE = /(ride ?share|ride app|\buber\b|\blyft\b|\btnc\b|app-based)/i;

function categorize(t) {
  const name = t.name || "";
  if (t.aeroway === "gate") return ["gate", "Gate"];
  if (t.amenity === "toilets") {
    const bits = [];
    if (t.female === "yes" && t.male !== "yes") bits.push("Women");
    else if (t.male === "yes" && t.female !== "yes") bits.push("Men");
    if (t.unisex === "yes" || t.gender === "unisex") bits.push("All-gender");
    if (t.changing_table === "yes") bits.push("changing table");
    if (t.wheelchair === "yes") bits.push("accessible");
    return ["restroom", bits.length ? bits.join(" · ") : "Restroom"];
  }
  const isFood = FOOD.has(t.amenity) || ["coffee", "bakery", "deli"].includes(t.shop);
  if (t.amenity === "lounge" || t.lounge || (!isFood && !t.shop && !t.tourism && LOUNGE_RE.test(name))) {
    return ["lounge", t.operator || (t.access === "customers" ? "Members / ticketed" : "Lounge")];
  }
  if (isFood) {
    const cuisine = (t.cuisine || "").split(";")[0].replace(/_/g, " ");
    const base = FOOD_LABEL[t.amenity] || (t.shop === "coffee" ? "Coffee" : t.shop === "bakery" ? "Bakery" : "Food");
    return ["food", cuisine ? `${base} · ${cuisine[0].toUpperCase()}${cuisine.slice(1)}` : base];
  }
  if (t.amenity === "car_rental") return ["ground", "Rental car"];
  if (RIDE_RE.test(name)) return ["ground", "Rideshare pickup"];
  if (t.amenity === "taxi") return ["ground", "Taxi stand"];
  if (t.amenity === "bus_station") return ["ground", "Bus / shuttle"];
  if (t.railway === "station" || t.railway === "halt" || t.public_transport === "station") {
    if (t.aerialway || t.station === "monorail" || /people ?mover|skylink|skytrain|plane ?train|airtrain|tram/i.test(name)) return ["ground", "Airport train"];
    return ["ground", t.station === "subway" ? "Subway" : t.station === "light_rail" ? "Light rail" : "Train / transit"];
  }
  if (t.amenity === "parking") return ["ground", t.parking === "multi-storey" ? "Parking garage" : "Parking"];
  if (/security|checkpoint|\btsa\b/i.test(name)) return ["landmark", "Security"];
  if (/baggage|bag claim/i.test(name)) return ["landmark", "Baggage claim"];
  if (/ticketing/i.test(name)) return ["landmark", "Ticketing"];
  return null;
}

function centerOf(e) {
  if (e.lat != null) return { lat: e.lat, lon: e.lon };
  if (e.center) return e.center;
  if (e.bounds) return { lat: (e.bounds.minlat + e.bounds.maxlat) / 2, lon: (e.bounds.minlon + e.bounds.maxlon) / 2 };
  if (e.geometry && e.geometry.length) {
    let la = 0, lo = 0, n = 0;
    for (const p of e.geometry) if (p) { la += p.lat; lo += p.lon; n++; }
    if (n) return { lat: la / n, lon: lo / n };
  }
  return null;
}
const ringOf = g => (g || []).filter(Boolean).map(p => [+p.lat.toFixed(6), +p.lon.toFixed(6)]);

function gateRefs(t) {
  const raw = t.ref || (t.name || "").replace(/^gate\s*/i, "");
  return raw.split(/[;,]/).map(s => s.trim()).filter(Boolean);
}

function processOSM(elements) {
  const feats = [], polys = [];
  for (const e of elements) {
    const t = e.tags || {};
    const isTerminal = t.aeroway === "terminal" || t.building === "terminal";
    if (isTerminal && (e.geometry || e.members)) {
      const rings = e.type === "relation"
        ? (e.members || []).filter(m => m.role !== "inner" && m.geometry).map(m => ringOf(m.geometry))
        : [ringOf(e.geometry)];
      rings.filter(r => r.length > 2).forEach(r => polys.push({ k: "terminal", n: t.name || "", r }));
      continue;
    }
    if (t.indoor && e.geometry && !t.amenity && !t.shop) {
      const r = ringOf(e.geometry);
      if (r.length > 2) polys.push({ k: "indoor", r });
      continue;
    }
    const cat = categorize(t);
    if (!cat) continue;
    const c = centerOf(e);
    if (!c) continue;
    const f = {
      id: e.type[0] + e.id, c: cat[0], s: cat[1], n: t.name || "",
      lat: +c.lat.toFixed(6), lon: +c.lon.toFixed(6),
      lv: t.level || t["level:ref"] || "",
      src: "osm",
    };
    if (e.timestamp) f.u = e.timestamp.slice(0, 10);
    if (t.opening_hours) f.h = t.opening_hours;
    if (cat[0] === "gate") { f.refs = gateRefs(t); if (!f.refs.length) continue; f.n = f.refs.join(" / "); }
    if (cat[0] === "ground" && t.operator && !t.name) f.n = t.operator;
    if (cat[0] === "ground" && t.brand && !f.n) f.n = t.brand;
    if (t.wheelchair === "yes" && cat[0] !== "restroom") f.w = 1;
    feats.push(f);
  }

  // Drop food/restrooms/lounges/landmarks that aren't near the terminals or gates
  // (the airport bounding box also catches hotels and nearby businesses).
  const anchors = [];
  feats.forEach(f => { if (f.c === "gate") anchors.push(f); });
  polys.forEach(p => { if (p.k === "terminal") { const step = Math.max(1, Math.floor(p.r.length / 40)); for (let i = 0; i < p.r.length; i += step) anchors.push({ lat: p.r[i][0], lon: p.r[i][1] }); } });
  const near = f => anchors.some(a => meters(a, f) < 260);
  const kept = anchors.length ? feats.filter(f => f.c === "gate" || f.c === "ground" || near(f)) : feats;

  // Ground transport: drop unnamed generic parking lots, keep one per name
  const seen = new Set();
  const final = kept.filter(f => {
    if (f.c !== "ground") return true;
    if (f.s === "Parking" && !f.n) return false;
    const key = f.s + "|" + (f.n || f.id);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  return { feats: final, polys };
}


/* ---------------- Overture Maps places → app features ---------------- */
// Overture category ids (snake_case). We match on substrings so renamed/sub-categories still land.
function categorizeOverture(cat, name) {
  const c = (cat || "").toLowerCase(), n = name || "";
  if (!c && !n) return null;
  if (/lounge/.test(c) && !/(cocktail|hookah|bar)/.test(c)) return ["lounge", "Lounge"];
  if (LOUNGE_RE.test(n) && !/(restaurant|bar|cafe|coffee|food)/.test(c)) return ["lounge", "Lounge"];
  if (/car_rental|car_hire|rent_a_car/.test(c)) return ["ground", "Rental car"];
  if (/taxi/.test(c)) return ["ground", "Taxi stand"];
  if (/parking/.test(c)) return ["ground", /garage|structure/i.test(n) ? "Parking garage" : "Parking"];
  if (/(train_station|metro_station|light_rail|subway|bus_station|transit)/.test(c)) return ["ground", /bus/.test(c) ? "Bus / shuttle" : "Train / transit"];
  if (/(public_toilet|restroom|toilet)/.test(c)) return ["restroom", "Restroom"];
  if (/coffee|cafe|tea_room|juice|smoothie/.test(c)) return ["food", "Café"];
  if (/bakery|donut|bagel|dessert|ice_cream|frozen_yogurt/.test(c)) return ["food", "Quick bite"];
  if (/fast_food|burger|sandwich|pizza|deli|hot_dog|food_court|food_stand|chicken_wings|taco|mexican_restaurant/.test(c)) return ["food", /food_court/.test(c) ? "Food court" : "Quick bite"];
  if (/(^|_)(bar|pub|brewery|wine_bar|sports_bar|beer|cocktail)(_|$)|brewpub|gastropub/.test(c)) return ["food", "Bar"];
  if (/restaurant|steakhouse|grill|diner|bistro|eatery|sushi|seafood|barbecue|bbq/.test(c)) {
    const cuisine = c.replace(/_restaurant$/, "").replace(/^restaurant$/, "").replace(/_/g, " ");
    return ["food", cuisine ? `Restaurant · ${cuisine[0].toUpperCase()}${cuisine.slice(1)}` : "Restaurant"];
  }
  return null;
}

// Normalize a business name for matching: "Starbucks Coffee - Terminal B" → "starbucks"
const STOP = new Set(["the", "and", "of", "at", "co", "company", "inc", "llc", "coffee", "cafe", "restaurant", "bar", "grill",
  "kitchen", "airport", "terminal", "concourse", "gate", "gates", "intl", "international", "express", "to", "go"]);
function nameTokens(n) {
  return String(n || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w && !STOP.has(w) && !/^[a-z]?\d+$/.test(w));
}
function sameName(a, b) {
  const A = nameTokens(a), B = nameTokens(b);
  if (!A.length || !B.length) return false;
  const sa = A.join(""), sb = B.join("");
  if (sa === sb || sa.includes(sb) || sb.includes(sa)) return true;
  const setB = new Set(B), shared = A.filter(w => setB.has(w)).length;
  return shared / Math.min(A.length, B.length) >= 0.6;
}

/* Merge Overture places into OSM features.
   places: [{id, name, cat, lat, lon, conf, status, u, website, phone, hours?}]
   Rules:
   - OSM is the base: it has gates, levels and building outlines; Overture never moves an OSM place.
   - An Overture place matching an OSM place (same category, similar name, within 150 m) confirms it:
     src becomes "osm+ovt", and its newer update date / website are kept.
   - Unmatched Overture places are added when confidence >= MIN_CONF, flagged approximate (ap: 1),
     and only if they sit near the terminals (food, restrooms, lounges) or the airport (ground).
   - Places Overture marks closed remove nothing from OSM, but are reported so a matched OSM place is flagged. */
const MIN_CONF = 0.6;
function mergeOverture(feats, polys, places) {
  const out = feats.slice();
  const stats = { overture: places.length, matched: 0, added: 0, skippedLowConf: 0, skippedFar: 0, closedFlags: 0 };
  const anchors = anchorPoints(out, polys);
  const nearTerminal = p => !anchors.length || anchors.some(a => meters(a, p) < 260);
  for (const p of places) {
    const cat = categorizeOverture(p.cat, p.name);
    if (!cat || !p.name) continue;
    const closed = /closed/i.test(p.status || "");
    let best = null, bestD = 1e9;
    for (const f of out) {
      if (f.c !== cat[0] || !f.n) continue;
      const d = meters(f, p);
      if (d < 150 && d < bestD && sameName(f.n, p.name)) { best = f; bestD = d; }
    }
    if (best) {
      if (closed) { best.cl = 1; stats.closedFlags++; continue; }
      if (best.src === "osm") { best.src = "osm+ovt"; stats.matched++; }
      if (p.u && (!best.u || p.u > best.u)) best.u = p.u;
      if (p.website && !best.web) best.web = p.website;
      continue;
    }
    if (closed) continue;
    if ((p.conf ?? 0) < MIN_CONF) { stats.skippedLowConf++; continue; }
    if (cat[0] !== "ground" && !nearTerminal(p)) { stats.skippedFar++; continue; }
    const f = { id: "o" + String(p.id).slice(-12), c: cat[0], s: cat[1], n: p.name,
      lat: +(+p.lat).toFixed(6), lon: +(+p.lon).toFixed(6), lv: "", src: "ovt", ap: 1 };
    if (p.u) f.u = p.u;
    if (p.website) f.web = p.website;
    out.push(f); stats.added++;
  }
  return { feats: out, stats };
}
function anchorPoints(feats, polys) {
  const anchors = [];
  feats.forEach(f => { if (f.c === "gate") anchors.push(f); });
  polys.forEach(p => { if (p.k === "terminal") { const step = Math.max(1, Math.floor(p.r.length / 40)); for (let i = 0; i < p.r.length; i += step) anchors.push({ lat: p.r[i][0], lon: p.r[i][1] }); } });
  return anchors;
}

/* Which lounge network a lounge belongs to, from its name/operator — so "Sky Club" shows as Delta,
   "Centurion" as Amex, etc. Only names the program; access rules change too often to hard-code. */
const LOUNGE_PROGRAMS = [
  [/delta one/i, "Delta One Lounge"], [/sky ?club/i, "Delta Sky Club"],
  [/centurion/i, "Amex Centurion Lounge"], [/sapphire/i, "Chase Sapphire Lounge"], [/capital ?one/i, "Capital One Lounge"],
  [/flagship/i, "American Flagship Lounge"], [/admirals/i, "American Admirals Club"],
  [/polaris/i, "United Polaris Lounge"], [/united club/i, "United Club"], [/alaska/i, "Alaska Lounge"],
  [/priority pass/i, "Priority Pass"], [/escape/i, "Escape Lounge"], [/airspace/i, "Airspace Lounge"],
  [/plaza premium/i, "Plaza Premium Lounge"], [/aspire/i, "Aspire Lounge"], [/\buso\b/i, "USO (military)"],
  [/british airways|galleries|concorde room/i, "British Airways"], [/virgin|clubhouse/i, "Virgin Atlantic Clubhouse"],
  [/air france|\bsalon\b/i, "Air France"], [/lufthansa|senator/i, "Lufthansa"], [/klm|crown lounge/i, "KLM Crown Lounge"],
  [/aer lingus/i, "Aer Lingus"], [/star alliance/i, "Star Alliance"], [/oneworld/i, "oneworld"],
  [/^the club\b/i, "The Club"],
];
function loungeProgram(name, operator) {
  const s = `${name || ""} ${operator || ""}`;
  for (const [re, label] of LOUNGE_PROGRAMS) if (re.test(s)) return label;
  return "";
}

const AIRPORTS = AIRPORT_DATA.trim().split("\n").map(l => {
  const [code, name, city, st, wn] = l.split("|");
  return { code, name, city, st, wn: wn === "1" };
});

return { loungeProgram, AIRPORT_DATA, AIRPORTS, OVERPASS, meters, overpass, lookupAerodrome, bboxStr, featureQuery,
  categorize, processOSM, categorizeOverture, sameName, mergeOverture, anchorPoints, MIN_CONF };
});
