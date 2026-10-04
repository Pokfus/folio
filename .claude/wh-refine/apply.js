#!/usr/bin/env node
/* apply.js <id> [<id> …] — write verified drafts into the repo: the card (two --replace passes: text,
   then picture), the glossary entry, and one add-locators batch. Run from /home/user/folio. */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const { S } = require("./cfg.js"), REPO = require("path").resolve(__dirname, "..", "..");
const run = (args) => { const r = cp.spawnSync("node", args, { cwd: REPO, encoding: "utf8" });
  const t = (r.stdout + r.stderr).trim(); if (r.status !== 0) { console.log(t); throw new Error(args.join(" ") + " failed"); }
  return t.split("\n").filter((l) => /replaced|updated|added|locator|WARN/i.test(l)).slice(0, 4).join(" | "); };
const loc = { cards: {} };
for (const id of process.argv.slice(2)) {
  const out = JSON.parse(fs.readFileSync(path.join(S, "out", id + ".json"), "utf8"));
  const P = Object.assign({}, out.patch); const img = P.image; delete P.image;
  const f1 = path.join(S, "out", "." + id + ".text.json"); fs.writeFileSync(f1, JSON.stringify(P));
  console.log(id + " text:  " + run([".claude/add-card.js", f1, "--replace", "--no-image"]));
  if (img) {
    const f2 = path.join(S, "out", "." + id + ".img.json");
    const ip = { id, image: img }; if ("undatable" in P) ip.undatable = P.undatable;
    fs.writeFileSync(f2, JSON.stringify(ip));
    console.log(id + " image: " + run([".claude/add-card.js", f2, "--replace"]));
  }
  if (out.glossary) {
    const f3 = path.join(S, "out", "." + id + ".gloss.json"); fs.writeFileSync(f3, JSON.stringify(out.glossary));
    console.log(id + " gloss: " + run([".claude/add-glossary.js", f3, "--no-image"]));
  }
  if (out.locator) loc.cards[id] = out.locator;
}
if (Object.keys(loc.cards).length) {
  const f4 = path.join(S, "out", ".locators.json"); fs.writeFileSync(f4, JSON.stringify(loc, null, 1));
  console.log("locators: " + run([".claude/add-locators.js", f4]));
}
