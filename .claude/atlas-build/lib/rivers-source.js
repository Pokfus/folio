/* lib/rivers-source.js — the `sources` header of rivers.js and rivers/*.js (Atlas v2 Phase 5; docs/atlas-v2-phase5-plan.md §4, task 4 of the brief).

   The three river files still SHIP: a river locator's window draws its own river from them (atlas/atlas-windows.js, `wantsOwnRiver`), so the credits page must list their source. They are built by
   .claude/build-rivers.js and .claude/build-hires-rivers.js, which read Natural Earth's GitHub mirror directly rather than the pinned zip of sources.json (they predate it) — the same product (the
   10 m rivers and lake centerlines, public domain), a release nobody recorded. This returns the pinned entry for the licence, the terms link and the attribution, with the two fields it cannot claim
   — the version and the retrieval date — said as exactly as they can be: no fetch date was kept, so the date is the day the file was committed, and the version line says so. */
"use strict";
const { headerSources } = require("../fetch-sources.js");
function riversSources(retrieved) {
  const [s] = headerSources(["ne-10m-rivers"]);
  return [Object.assign({}, s, {
    name: "Natural Earth 1:10m Physical Vectors — Rivers + Lake Centerlines (the world set, and for the hi-res frames the European supplement), as read by Folio's river locator windows",
    version: "as fetched by .claude/build-rivers.js / build-hires-rivers.js from the Natural Earth GitHub mirror (the release was not recorded; the date below is the day the file was committed)",
    url: "https://github.com/nvkelso/natural-earth-vector",
    retrieved, sha256: null,
  })];
}
module.exports = { riversSources };
