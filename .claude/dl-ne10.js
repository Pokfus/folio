// Dev-only: download the Natural Earth 10m admin-0 countries geojson (high detail). Not part of the site.
const fs = require("fs");
const path = require("path");
const url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson";
(async () => {
  console.log("fetching", url);
  const r = await fetch(url);
  console.log("HTTP", r.status);
  if (!r.ok) process.exit(1);
  const buf = Buffer.from(await r.arrayBuffer());
  const out = path.join(__dirname, "ne_10m.geojson");
  fs.writeFileSync(out, buf);
  console.log("saved", out, "bytes=", buf.length, "(" + (buf.length / 1048576).toFixed(1) + " MB)");
  const gj = JSON.parse(buf.toString("utf8"));
  console.log("features=", gj.features.length);
  const p = gj.features[0].properties;
  console.log("ISO fields on feature[0]:", ["ISO_A2", "ISO_A2_EH", "ISO_A3", "ISO_A3_EH", "WB_A2", "NAME", "LABEL_X", "LABEL_Y"].map((k) => k + "=" + p[k]).join(" | "));
})().catch((e) => { console.log("ERR", e.message); process.exit(1); });
