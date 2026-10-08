#!/usr/bin/env node
/* fetch-sources.js — step 0 of the Atlas v2 build: pull every pinned input into src/, verified.

     node fetch-sources.js                 fetch (or verify) every entry in sources.json
     node fetch-sources.js <id> [<id>…]    only these
     node fetch-sources.js --verify        hash what is cached, download nothing
     node fetch-sources.js --list          print the table and exit

   WHY IT IS STRICT (docs/atlas-v2-design.md §2.10a, §7 "the source rule is enforced by the tooling,
   not by memory"). Two refusals are built in and neither can be switched off from the command line:

     1. A LICENCE NOT ON THE LIST is refused before a byte is fetched. The accepted identifiers are
        exactly the design's: PD, CC0, CC-BY-3.0, CC-BY-4.0 without conditions beyond credit, and
        ODbL-1.0, CC-BY-SA-4.0, GPL-3.0 only as a data file of their own. Anything else — NC, "academic",
        "educational", unstated — cannot enter the pipeline, not even for a cross-check.
     2. A HASH THAT DOES NOT MATCH deletes the download and stops. A pin is a statement about which
        bytes the data files were built from; a silent substitution would make every generated header
        a false claim.

   The cache lives in src/<id>/ (git-ignored): the archive as fetched, and, for a zip, its contents
   unpacked beside it. A cached archive whose hash matches is not fetched again. Downloads go through
   curl so the sandbox's proxy and CA bundle apply without any Node-side configuration (see
   /root/.ccr/README.md: Node's own fetch needs NODE_USE_ENV_PROXY=1 and is slower on gigabyte files).

   Exports `ensureSource(id)` for the build scripts, which call it rather than trusting that a file in
   src/ is the file sources.json names.
*/
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { spawnSync } = require("child_process");

const HERE = __dirname;
const SRC = path.join(HERE, "src");
const MANIFEST = path.join(HERE, "sources.json");

// The accepted licence identifiers and whether a derived file must stand alone (§2.10a).
const LICENCES = {
  "PD": { shareAlike: false }, "CC0": { shareAlike: false }, "CC-BY-3.0": { shareAlike: false }, "CC-BY-4.0": { shareAlike: false },
  "ODbL-1.0": { shareAlike: true }, "CC-BY-SA-4.0": { shareAlike: true }, "GPL-3.0": { shareAlike: true },
};
const REQUIRED = ["id", "name", "version", "url", "sha256", "licence", "licenceUrl", "attribution", "retrieved"];

// One entry's shape and licence. Throws with the reason; the licence refusal is the one that matters.
function validateEntry(s) {
  for (const k of REQUIRED) if (!s[k]) throw new Error(`sources.json: entry ${s.id || "?"} lacks "${k}"`);
  if (!/^[a-z0-9-]+$/.test(s.id)) throw new Error(`sources.json: id "${s.id}" is not a slug`);
  if (!/^[0-9a-f]{64}$/.test(s.sha256)) throw new Error(`sources.json: ${s.id} sha256 is not 64 hex digits`);
  if (!Object.prototype.hasOwnProperty.call(LICENCES, s.licence)) throw new Error(`sources.json: ${s.id} has licence "${s.licence}", which is not accepted (${Object.keys(LICENCES).join(", ")}) — §2.10a: nothing NC, academic, unstated or conflicting, not even as a cross-check`);
  return s;
}

function loadManifest() {
  const m = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const seen = new Set();
  for (const s of m.sources) {
    validateEntry(s);
    if (seen.has(s.id)) throw new Error(`sources.json: duplicate id ${s.id}`);
    seen.add(s.id);
  }
  return m.sources;
}

function sha256File(file) {
  const h = crypto.createHash("sha256");
  const fd = fs.openSync(file, "r"), buf = Buffer.alloc(1 << 20);
  let n;
  while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) h.update(buf.subarray(0, n));
  fs.closeSync(fd);
  return h.digest("hex");
}

function archivePath(s) { return path.join(SRC, s.id, path.basename(new URL(s.url).pathname)); }

function download(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const tmp = dest + ".part";
  const r = spawnSync("curl", ["-sS", "-L", "--fail", "--retry", "3", "--retry-delay", "2", "-o", tmp, url], { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) { try { fs.unlinkSync(tmp); } catch (e) {} throw new Error(`download failed (${r.status}): ${url}`); }
  fs.renameSync(tmp, dest);
}

function unpack(s, file) {
  if (!/\.zip$/i.test(file)) return;
  const dir = path.dirname(file);
  const r = spawnSync("unzip", ["-oq", file, "-d", dir], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`unzip failed for ${s.id}`);
}

/* Make sure src/<id>/ holds the pinned bytes; returns { entry, archive, dir }. `verifyOnly` never
   downloads. A wrong hash is fatal and the offending file is removed. */
function ensureSource(id, opts) {
  const sources = loadManifest();
  const s = sources.find((x) => x.id === id);
  if (!s) throw new Error(`no source "${id}" in sources.json`);
  const file = archivePath(s), dir = path.dirname(file);
  let have = fs.existsSync(file);
  if (!have) {
    if (opts && opts.verifyOnly) throw new Error(`${id}: not cached (run fetch-sources.js ${id})`);
    process.stdout.write(`  ${id}: fetching ${s.url}\n`);
    download(s.url, file);
    have = true;
  }
  const got = sha256File(file);
  if (got !== s.sha256) {
    fs.unlinkSync(file);
    throw new Error(`${id}: sha256 mismatch\n    pinned ${s.sha256}\n    got    ${got}\n  The download was deleted. If the publisher re-issued the file, re-pin it deliberately in a commit that says so.`);
  }
  // unpack once (a marker beside the archive says which hash was unpacked)
  const marker = file + ".unpacked";
  if (!fs.existsSync(marker) || fs.readFileSync(marker, "utf8").trim() !== got) {
    unpack(s, file);
    fs.writeFileSync(marker, got + "\n");
  }
  return { entry: s, archive: file, dir, sha256: got };
}

/* The header block every generated file carries (§2.10a): exactly the entries named, verbatim. */
function headerSources(ids) {
  const sources = loadManifest();
  return ids.map((id) => {
    const s = sources.find((x) => x.id === id);
    if (!s) throw new Error(`no source "${id}"`);
    const { id: _id, name, version, url, licence, licenceUrl, attribution, retrieved, sha256 } = s;
    return { id: _id, name, version, url, licence, licenceUrl, attribution, retrieved, sha256 };
  });
}

module.exports = { ensureSource, headerSources, loadManifest, validateEntry, LICENCES, sha256File };

if (require.main === module) {
  const argv = process.argv.slice(2);
  const verifyOnly = argv.includes("--verify"), list = argv.includes("--list");
  const ids = argv.filter((a) => !a.startsWith("--"));
  let sources;
  try { sources = loadManifest(); } catch (e) { console.error("✗ " + e.message); process.exit(1); }
  if (list) {
    for (const s of sources) console.log(`  ${s.id.padEnd(26)} ${s.licence.padEnd(13)} ${String(s.bytes || "?").padStart(10)} B  ${s.version}`);
    process.exit(0);
  }
  const want = ids.length ? ids : sources.map((s) => s.id);
  let bad = 0;
  for (const id of want) {
    try {
      const r = ensureSource(id, { verifyOnly });
      console.log(`  ✓ ${id}  ${r.entry.licence}  ${r.sha256.slice(0, 12)}…  ${path.relative(HERE, r.archive)}`);
    } catch (e) { bad++; console.error(`  ✗ ${e.message}`); }
  }
  process.exit(bad ? 1 : 0);
}
