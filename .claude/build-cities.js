// Dev-only: build cities.js (window.CITIES) from Natural Earth 10m populated places.
// r=0: national capital (ADM0CAP). r=2: admin-1 capital (ADM1CAP) with pop >= 100k.
// r=1: other city with pop >= 1,000,000. Each: { n:name, c:[lon,lat], r }. Run manually.
const fs = require("fs");
const path = require("path");
const URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson";
const round = (n) => Math.round(n * 100) / 100;

(async () => {
  console.log("fetching", URL);
  const r = await fetch(URL); console.log("HTTP", r.status); if (!r.ok) process.exit(1);
  const gj = JSON.parse(Buffer.from(await r.arrayBuffer()).toString("utf8"));
  console.log("features", gj.features.length);
  const key = (o, names) => { for (const n of names) if (o[n] !== undefined && o[n] !== null) return o[n]; return undefined; };
  const byName = new Map();                               // name(lower) -> best entry (national > admin > metro)
  for (const f of gj.features) {
    const p = f.properties || {};
    const fcla = (key(p, ["FEATURECLA", "featurecla"]) || "") + "";
    const adm0 = key(p, ["ADM0CAP", "adm0cap"]), adm1 = key(p, ["ADM1CAP", "adm1cap"]);
    const isNat = adm0 === 1 || adm0 === "1" || /Admin-0 capital/i.test(fcla);
    const isAdm = adm1 === 1 || adm1 === "1" || /Admin-1 capital/i.test(fcla);
    const name = key(p, ["NAME_EN", "name_en", "NAME", "name", "NAMEASCII", "nameascii"]) || "";   // prefer the English exonym (e.g. Copenhagen, not København)
    const pop = +(key(p, ["POP_MAX", "pop_max"]) || 0);
    let lon = key(p, ["LONGITUDE", "longitude"]), lat = key(p, ["LATITUDE", "latitude"]);
    if (lon == null && f.geometry && f.geometry.coordinates) { lon = f.geometry.coordinates[0]; lat = f.geometry.coordinates[1]; }
    if (!name || lon == null || lat == null) continue;
    let r, prio;                                          // prio: lower wins on name clash
    if (isNat) { r = 0; prio = 0; }                       // national capital
    else if (pop >= 1000000) { r = 1; prio = 1; }         // "Cities": any city with >= 1M people (incl. division capitals >= 1M)
    else if (isAdm) { r = 2; prio = 2; }                  // "Division capitals": 2nd-level admin centre < 1M (any population)
    else continue;
    const k = name.toLowerCase(), ex = byName.get(k);
    if (!ex || prio < ex.prio) byName.set(k, { n: name, c: [round(lon), round(lat)], r, pop, prio });
  }
  const all = [...byName.values()];
  all.sort((a, b) => (a.r === 0 ? 0 : 1) - (b.r === 0 ? 0 : 1) || b.pop - a.pop);   // capitals first, then by pop
  const out = all.map((c) => ({ n: c.n, c: c.c, r: c.r }));
  // capitals Natural Earth doesn't flag (constituent-country capitals of the UK) — added as division (admin-1) capitals
  const MANUAL = [{ n: "Edinburgh", c: [-3.19, 55.95], r: 2 }, { n: "Cardiff", c: [-3.18, 51.48], r: 2 }, { n: "Belfast", c: [-5.93, 54.60], r: 2 }];
  const have = new Set(out.map((c) => c.n.toLowerCase()));
  for (const m of MANUAL) if (!have.has(m.n.toLowerCase())) out.push(m);
  const counts = { 0: 0, 1: 0, 2: 0 }; out.forEach((c) => counts[c.r]++);
  const js = "/* Cities: r=0 national capital, r=1 city >=1M, r=2 division (admin-1) capital <1M. n=name, c=[lon,lat]. Natural Earth 10m. */\nwindow.CITIES = " + JSON.stringify(out) + ";\n";
  fs.writeFileSync(path.join(__dirname, "..", "cities.js"), js);
  console.log("national", counts[0], "admin", counts[2], "metro", counts[1], "total", out.length, "bytes", Buffer.byteLength(js));
})().catch((e) => { console.log("ERR", e.stack || e.message); process.exit(1); });
