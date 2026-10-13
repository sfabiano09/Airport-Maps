/* Official airport listings that are free and openly licensed, merged into the weekly build.
   Each source returns places in the shape core.mergeOfficial expects.

   LAX — "Los Angeles International Airport - Terminal Concession Locations", City of Los Angeles open data
         (data.lacity.org, dataset j6u4-c4yh), Creative Commons Attribution 4.0. */
"use strict";

function laxCategory(cat) {
  const c = String(cat || "").toUpperCase();
  if (/LOUNGE|CLUB/.test(c)) return ["lounge", "Lounge"];
  if (/FOOD|BEVERAGE|RESTAURANT|BAR\b|COFFEE|CAFE/.test(c)) return ["food", "Food"];
  if (/RENTAL CAR|CAR RENTAL/.test(c)) return ["ground", "Rental car"];
  if (/DUTY FREE/.test(c)) return ["shop", "Duty free"];
  if (/NEWS|GIFT/.test(c)) return ["shop", "News & gifts"];
  if (/SHOP|STORE|RETAIL|BOUTIQUE|SPECIALTY|ELECTRONIC|BOOK|APPAREL|JEWEL|SPA/.test(c)) return ["shop", "Shop"];
  return null;
}
const clean = v => (v == null || v === "Not provided" ? "" : String(v).trim());

async function lax() {
  const url = "https://data.lacity.org/resource/j6u4-c4yh.json?$limit=5000";
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error("LAX open data HTTP " + r.status);
  const rows = await r.json();
  const places = [];
  for (const row of rows) {
    const cat = laxCategory(row.categories);
    if (!cat) continue;
    const name = clean(row.companyname);
    if (!name) continue;
    const lat = parseFloat(clean(row.lat)), lon = parseFloat(clean(row.long));
    const where = [clean(row.terminal), clean(row.location)].filter(Boolean).join(" · ");
    places.push({ id: clean(row.companylocationid) || name, name, cat: cat[0], sub: cat[1],
      lat: isFinite(lat) ? lat : undefined, lon: isFinite(lon) ? lon : undefined, where,
      u: clean(row.companylocationlastupdated).slice(0, 10) || undefined });
  }
  return { label: "LAX official concessions list (City of Los Angeles open data, CC BY 4.0)", places };
}

module.exports = { LAX: lax };
