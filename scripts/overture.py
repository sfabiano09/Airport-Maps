#!/usr/bin/env python3
"""Pull Overture Maps places (restaurants, cafés, lounges, rental cars, parking, transit…) around each airport.

Reads tmp/meta.json (airport bounding boxes from build.js lookup) and writes tmp/overture/CODE.json
plus tmp/overture_release.txt. Uses DuckDB to read Overture's public GeoParquet straight from S3;
the files are spatially sorted, so a bounding-box filter only downloads the pieces it needs.

Overture's schema evolves between releases, so the query checks which columns exist first.
Set OVERTURE_PATH to test against a local parquet file.
"""
import json, math, os, re, sys, time, urllib.request
import duckdb

ROOT = os.path.join(os.path.dirname(__file__), "..")
TMP = os.path.join(ROOT, "tmp")
BUCKET = "https://overturemaps-us-west-2.s3.amazonaws.com"
PAD_M = 1600  # same padding build.js uses for ground transport


def latest_release():
    xml = urllib.request.urlopen(f"{BUCKET}/?list-type=2&prefix=release/&delimiter=/", timeout=60).read().decode()
    rels = re.findall(r"<Prefix>release/([^/<]+)/</Prefix>", xml)
    if not rels:
        raise RuntimeError("no Overture releases listed")
    return sorted(rels)[-1]


def pad(b, m):
    dlat = m / 111320
    dlon = m / (111320 * math.cos(math.radians((b["minlat"] + b["maxlat"]) / 2)))
    return b["minlon"] - dlon, b["minlat"] - dlat, b["maxlon"] + dlon, b["maxlat"] + dlat


def main():
    codes = [c.upper() for c in sys.argv[1:]]
    meta = json.load(open(os.path.join(TMP, "meta.json")))
    out_dir = os.path.join(TMP, "overture")
    os.makedirs(out_dir, exist_ok=True)

    con = duckdb.connect()
    local = os.environ.get("OVERTURE_PATH")
    if local:
        release, src = "local-test", f"read_parquet('{local}')"
    else:
        release = latest_release()
        con.sql("INSTALL httpfs; LOAD httpfs; SET s3_region='us-west-2'; SET enable_object_cache=true;")
        src = f"read_parquet('s3://overturemaps-us-west-2/release/{release}/theme=places/type=place/*', hive_partitioning=1)"
    print("Overture release:", release, flush=True)

    schema = {r[0]: r[1] for r in con.sql(f"DESCRIBE SELECT * FROM {src}").fetchall()}
    has = lambda c: c in schema
    cat_parts = []
    # most specific first: "fast_food_restaurant" beats the coarse basic_category "restaurant"
    if has("taxonomy") and "primary" in schema["taxonomy"]: cat_parts.append("taxonomy.primary")
    if has("categories"): cat_parts.append("categories.primary")
    if has("basic_category"): cat_parts.append("basic_category")
    cat = f"coalesce({', '.join(cat_parts)})" if cat_parts else "NULL"
    status = "operating_status" if has("operating_status") else "NULL"
    web = "websites[1]" if has("websites") else "NULL"
    upd = "sources[1].update_time" if has("sources") and "update_time" in schema["sources"] else "NULL"
    conf = "confidence" if has("confidence") else "1.0"
    sql = f"""
      SELECT id, names.primary AS name, {cat} AS cat,
             (bbox.ymin + bbox.ymax) / 2 AS lat, (bbox.xmin + bbox.xmax) / 2 AS lon,
             {conf} AS conf, {status} AS status, {web} AS website, CAST({upd} AS VARCHAR) AS u
      FROM {src}
      WHERE bbox.xmin BETWEEN ? AND ? AND bbox.ymin BETWEEN ? AND ?
        AND names.primary IS NOT NULL"""

    done = 0
    for code, ap in meta.items():
        if codes and code not in codes:
            continue
        x0, y0, x1, y1 = pad(ap["bounds"], PAD_M)
        t = time.time()
        try:
            rows = con.execute(sql, [x0, x1, y0, y1]).fetchall()
        except Exception as e:  # one bad airport shouldn't sink the run
            print(f"{code}: Overture query failed — {e}", flush=True)
            continue
        places = [{
            "id": r[0], "name": r[1], "cat": r[2], "lat": r[3], "lon": r[4],
            "conf": None if r[5] is None else round(float(r[5]), 3),
            "status": r[6], "website": r[7], "u": (r[8] or "")[:10] or None,
        } for r in rows]
        json.dump(places, open(os.path.join(out_dir, f"{code}.json"), "w"))
        done += 1
        print(f"{code}: {len(places)} places ({time.time() - t:.0f}s)", flush=True)

    open(os.path.join(TMP, "overture_release.txt"), "w").write(release if done else "")
    print(f"Overture done for {done} airports", flush=True)


if __name__ == "__main__":
    main()
