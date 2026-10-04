#!/usr/bin/env node
/* urlcheck.js <id> … — curl every citation URL in the drafts (card + glossary); print non-200s. */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const { S } = require("./cfg.js"); let n = 0, badN = 0; const seen = new Map();
for (const id of process.argv.slice(2)) {
  const out = JSON.parse(fs.readFileSync(path.join(S, "out", id + ".json"), "utf8"));
  const srcs = (out.patch.sources || []).concat((out.glossary && out.glossary.sources) || []);
  for (const s of srcs) {
    const u = (/(https?:\/\/\S+?)\.?(?:\s+\[[^\]]+\])*\s*$/.exec(s.replace(/<[^>]+>/g, "")) || [])[1];
    if (!u) { console.log(id + "  NO URL  " + s.slice(0, 80)); badN++; continue; }
    n++;
    if (!seen.has(u)) {
      let code = "000";
      for (let t = 0; t < 2 && !/^2/.test(code); t++) {
        const r = cp.spawnSync("curl", ["-sS", "-L", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "90",
          "-A", "Mozilla/5.0 (compatible; FolioStudyResearch/1.0)", u], { encoding: "utf8" });
        code = (r.stdout || "000").trim();
      }
      seen.set(u, code);
    }
    const c = seen.get(u);
    if (!/^2/.test(c)) { badN++; console.log(id + "  " + c + "  " + u); }
  }
}
console.log("urlcheck: " + n + " citation URL(s), " + seen.size + " distinct, " + badN + " not 2xx");
