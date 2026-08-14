#!/usr/bin/env node
/* ============================================================
   GENERATE STYLISED ARTEFACT ART
   ============================================================
   Standalone Node helper, zero dependencies, resumable, safe to re-run. Not part of the site.

     node .claude/gen-artefact-art.js --pilot --dry-run
     node .claude/gen-artefact-art.js --pilot
     node .claude/gen-artefact-art.js --pilot --exemplar=art/artefacts/mask-of-tutankhamun.png --round=2
     node .claude/gen-artefact-art.js --ids=roman-denarius,ulfberht-sword --force
     node .claude/gen-artefact-art.js --all

   It reads `artefacts.js`, takes each artefact's EXISTING Commons photograph as the structural
   reference, and asks an image model to restyle it per .claude/artefact-art/style.js. It writes:

     art/artefacts/<id>.png            the piece  (committed — this is what the site will serve)
     .claude/artefact-art/manifest.json  the recipe per id (committed — see WHY below)
     .claude/artefact-art/ref/<id>.<ext> the cached reference photo (gitignored)

   WHY A MANIFEST. A generated image with no record of how it was generated is an image nobody
   can regenerate. The manifest records the provider, the model, the exact prompt, the exemplar
   and the source photograph for every piece, so a single artefact can be re-run in a year and
   come back matching its neighbours instead of matching whatever the fashion is by then. It is
   committed for the same reason `books/<id>.js` is: the output is the artefact, the manifest is
   the proof of where it came from.

   THREE THINGS THAT ARE DELIBERATE.

   · A PIECE WITH NO REFERENCE PHOTOGRAPH IS SKIPPED, never generated from its name alone. That
     is rule 1 of the style contract and it is the whole basis of the accuracy claim. Exactly one
     artefact is affected today (`sipan-ear-ornaments`, which Commons has no free photograph of)
     and it keeps its rarity-coloured placeholder.

   · IT NEVER TOUCHES artefacts.js. Generating and adopting are separate steps on purpose — you
     look at a contact sheet between them. `.claude/add-artefact-art.js` is what writes the field.

   · IT WRITES PNG AND STOPS THERE unless `sharp` is importable. Normalising to a uniform square
     WebP is worth doing and needs an image library, which must NOT be installed into this repo
     (the zero-dependency rule). Install it in a scratch folder the way Playwright is handled:
         mkdir -p ~/scratch && cd ~/scratch && npm i sharp
         NODE_PATH=~/scratch/node_modules node .claude/gen-artefact-art.js --pilot
     Without it you get raw provider PNGs, which are perfectly reviewable — the normalisation is
     a consistency pass, not a correctness one.

   PROVIDERS. `--provider=openai` (default) or `--provider=gemini`. Both take the reference photo
   as an input image; both are called with plain `fetch`, no SDK. The key comes from the
   environment (OPENAI_API_KEY / GEMINI_API_KEY) and is never written to the manifest or logged.
   Adding a third is one entry in PROVIDERS below: give it `send(parts, prompt)` returning a
   Buffer, where `parts` is the array of input images (the reference first, the exemplar second).
   ============================================================================================ */

"use strict";

const fs = require("fs");
const path = require("path");
const STYLE = require("./artefact-art/style.js");

const ROOT = path.join(__dirname, "..");
const ART_DIR = path.join(ROOT, "art", "artefacts");
const WORK = path.join(__dirname, "artefact-art");
const REF_DIR = path.join(WORK, "ref");
const MANIFEST = path.join(WORK, "manifest.json");

/* ---------- argv ---------- */
const argv = process.argv.slice(2);
const flag = (n) => argv.includes("--" + n);
const opt = (n, d) => {
  const hit = argv.find((a) => a.startsWith("--" + n + "="));
  return hit ? hit.slice(n.length + 3) : d;
};

const DRY = flag("dry-run");
const FORCE = flag("force");
const PROVIDER = opt("provider", "openai");
const SIZE = opt("size", "1024x1024");
const QUALITY = opt("quality", "high");
const ROUND = Number(opt("round", "1")) || 1;
const EXEMPLAR = opt("exemplar", "");
const ONLY = opt("ids", "").split(",").map((s) => s.trim()).filter(Boolean);

/* ---------- the artefacts ---------- */
global.window = {};
require(path.join(ROOT, "artefacts.js"));
const ALL = global.window.ARTEFACTS || [];
const BY_ID = new Map(ALL.map((a) => [a.id, a]));

/* Which pieces this run covers. --pilot is the eight in the style contract; --all is everything
   that has a reference photograph; --ids is an explicit list. */
function targets() {
  if (ONLY.length) {
    return ONLY.map((id) => {
      const p = STYLE.PILOT.find((x) => x.id === id);
      return { id, hint: (p && p.hint) || "default", hazard: (p && p.hazard) || "" };
    });
  }
  if (flag("all")) return ALL.map((a) => ({ id: a.id, hint: "default", hazard: "" }));
  return STYLE.PILOT;
}

/* ---------- manifest ---------- */
function readManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST, "utf8")); } catch { return {}; }
}
function writeManifest(m) {
  const sorted = {};
  Object.keys(m).sort().forEach((k) => { sorted[k] = m[k]; });
  fs.mkdirSync(WORK, { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
}

/* ---------- the reference photograph ----------
   Cached, because a re-run over eight pieces should not re-fetch eight files from Commons, and
   because the reference must not silently change under a regeneration — a piece re-run in a year
   is re-run against the same photograph it was built from. Wikimedia refuses a request with no
   User-Agent, so one is sent. */
async function reference(a) {
  const src = a.image && a.image.src;
  if (!src) return null;
  fs.mkdirSync(REF_DIR, { recursive: true });
  const ext = (src.match(/\.(jpe?g|png|webp|gif)(?:$|\?)/i) || [, "jpg"])[1].toLowerCase();
  const file = path.join(REF_DIR, a.id + "." + ext);
  if (fs.existsSync(file)) return { file, src, mime: mimeOf(file) };

  /* Backs off and retries rather than recording a 429 as "no photograph" — the lesson
     .claude/fetch-place-coords.js already carries. Fetching ninety-nine files in a row IS rate
     limited by Wikimedia (measured: the first --refs run lost five to 429s), and the failure is
     the dangerous shape, since a piece whose reference "could not be fetched" reads exactly like
     a piece that never had one and is silently skipped by the generator. */
  const UA = { "User-Agent": "Folio artefact-art/1.0 (https://github.com/pokfus/folio; static study site)" };
  let last = 0;
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt) await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
    const r = await fetch(src, { headers: UA });
    if (r.ok) {
      fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
      await new Promise((res) => setTimeout(res, 120));   // be a polite neighbour between files
      return { file, src, mime: mimeOf(file) };
    }
    last = r.status;
    if (r.status !== 429 && r.status < 500) break;        // a 404 will not improve with waiting
  }
  throw new Error("reference photo " + last + " for " + a.id + " — " + src);
}

function mimeOf(f) {
  const e = path.extname(f).toLowerCase();
  return e === ".png" ? "image/png" : e === ".webp" ? "image/webp" : e === ".gif" ? "image/gif" : "image/jpeg";
}

/* ---------- providers ----------
   Each `send` takes the input images (reference first, exemplar second if there is one) and the
   prompt, and returns a PNG Buffer. Errors carry the response body: a 400 from an image API is
   almost always a sentence saying exactly what is wrong, and swallowing it turns a two-minute fix
   into an afternoon. */
const PROVIDERS = {
  openai: {
    model: "gpt-image-1",
    env: "OPENAI_API_KEY",
    async send(parts, prompt) {
      const form = new FormData();
      form.append("model", "gpt-image-1");
      form.append("prompt", prompt);
      form.append("size", SIZE);
      form.append("quality", QUALITY);
      form.append("n", "1");
      for (const p of parts) {
        form.append("image[]", new Blob([fs.readFileSync(p.file)], { type: p.mime }), path.basename(p.file));
      }
      const r = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY },
        body: form,
      });
      const txt = await r.text();
      if (!r.ok) throw new Error("openai " + r.status + ": " + txt.slice(0, 600));
      const j = JSON.parse(txt);
      const b64 = j.data && j.data[0] && j.data[0].b64_json;
      if (!b64) throw new Error("openai returned no image: " + txt.slice(0, 400));
      return Buffer.from(b64, "base64");
    },
  },

  gemini: {
    model: "gemini-2.5-flash-image",
    env: "GEMINI_API_KEY",
    async send(parts, prompt) {
      const bits = [{ text: prompt }].concat(
        parts.map((p) => ({
          inline_data: { mime_type: p.mime, data: fs.readFileSync(p.file).toString("base64") },
        }))
      );
      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        PROVIDERS.gemini.model + ":generateContent";
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({ contents: [{ parts: bits }] }),
      });
      const txt = await r.text();
      if (!r.ok) throw new Error("gemini " + r.status + ": " + txt.slice(0, 600));
      const j = JSON.parse(txt);
      const out = ((j.candidates && j.candidates[0] && j.candidates[0].content &&
                    j.candidates[0].content.parts) || [])
        .map((p) => p.inline_data || p.inlineData)      // the API has answered in both casings
        .filter(Boolean)[0];
      if (!out || !out.data) throw new Error("gemini returned no image: " + txt.slice(0, 400));
      return Buffer.from(out.data, "base64");
    },
  },
};

/* ---------- normalisation ----------
   Optional, and the difference between "eight images" and "one set". Same square, same output
   size, same encoder — which closes most of the residual drift a prompt cannot. Silent no-op
   when sharp is not importable; the run says so once at the end rather than per piece. */
let sharp = null;
try { sharp = require("sharp"); } catch { /* optional, see the header */ }

async function normalise(buf, id) {
  fs.mkdirSync(ART_DIR, { recursive: true });
  if (!sharp) {
    const f = path.join(ART_DIR, id + ".png");
    fs.writeFileSync(f, buf);
    return { file: f, normalised: false };
  }
  const f = path.join(ART_DIR, id + ".webp");
  await sharp(buf).resize(640, 640, { fit: "cover" }).webp({ quality: 82 }).toFile(f);
  // A 256px tile variant, because the Reliquary grid renders every owned artefact at once and
  // pulling 40 full-size plates to draw 40 thumbnails is the one performance trap this adds.
  await sharp(buf).resize(256, 256, { fit: "cover" }).webp({ quality: 78 })
    .toFile(path.join(ART_DIR, id + "-256.webp"));
  return { file: f, normalised: true };
}

function existing(id) {
  for (const ext of [".webp", ".png"]) {
    const f = path.join(ART_DIR, id + ext);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

/* ---------- the reference audit ----------
   `--refs` warms the cache for every artefact and generates nothing. It exists because of what
   the very first pilot run turned up: `ulfberht-sword`'s shipped photograph is a picture of US
   Marines pitching a tent in Norway, the picture pass having matched *Exercise White Ulfberht*, a
   NATO exercise, rather than the Viking sword. That is the failure mode the picture pipeline's own
   header warns about — `gladius` matching the swordfish, a palaeoanthropologist matching a
   congressman of the same name — and one got through review.

   It matters more here than it did there. A wrong photograph on a plate is a picture a reader can
   see is wrong. A wrong photograph fed to THIS is a beautifully rendered, stylistically consistent
   painting of the wrong object, which looks exactly as authoritative as the ninety-nine correct
   ones — and it is generated from the wrong thing with total confidence.

   So: audit the references by eye BEFORE generating. One pass over a grid of ninety-nine
   thumbnails costs ten minutes and is the cheapest check in this pipeline.
       node .claude/gen-artefact-art.js --refs
       node .claude/artefact-art-sheet.js --audit && open .claude/artefact-art/sheet.html */
async function refsOnly() {
  let got = 0, cached = 0, none = [], failed = [];
  for (const a of ALL) {
    if (!(a.image && a.image.src)) { none.push(a.id); continue; }
    const before = fs.existsSync(REF_DIR) && fs.readdirSync(REF_DIR).some((f) => f.replace(/\.[^.]+$/, "") === a.id);
    try {
      await reference(a);
      if (before) cached++; else { got++; process.stdout.write("."); }
    } catch (e) { failed.push(a.id + " — " + e.message); }
  }
  console.log("");
  console.log("fetched " + got + ", already cached " + cached + ", no photograph " + none.length + ", failed " + failed.length);
  if (none.length) console.log("no photograph: " + none.join(", "));
  failed.forEach((f) => console.log("  !!  " + f));
  console.log("");
  console.log("Now LOOK at them — this is the step that catches a reference that is not the object:");
  console.log("  node .claude/artefact-art-sheet.js --audit && open " + path.join(WORK, "sheet.html"));
}

/* ---------- run ---------- */
(async () => {
  if (flag("refs")) { await refsOnly(); return; }

  const prov = PROVIDERS[PROVIDER];
  if (!prov) { console.error("unknown --provider=" + PROVIDER + " (have: " + Object.keys(PROVIDERS).join(", ") + ")"); process.exit(1); }
  if (!DRY && !process.env[prov.env]) {
    console.error("no " + prov.env + " in the environment. Export it, or pass --dry-run to see the prompts.");
    process.exit(1);
  }

  let exemplar = null;
  if (EXEMPLAR) {
    const f = path.isAbsolute(EXEMPLAR) ? EXEMPLAR : path.join(ROOT, EXEMPLAR);
    if (!fs.existsSync(f)) { console.error("--exemplar not found: " + f); process.exit(1); }
    exemplar = { file: f, mime: mimeOf(f) };
  }

  const list = targets();
  const manifest = readManifest();
  let made = 0, skipped = 0, failed = 0, noref = 0;

  console.log("provider " + PROVIDER + " (" + prov.model + ")  ·  round " + ROUND +
              (exemplar ? "  ·  exemplar " + path.basename(exemplar.file) : "  ·  NO exemplar (round 1)") +
              (DRY ? "  ·  DRY RUN" : ""));
  console.log("");

  for (const t of list) {
    const a = BY_ID.get(t.id);
    if (!a) { console.log("  ??  " + t.id + " — not in artefacts.js"); failed++; continue; }

    const done = existing(t.id);
    if (done && !FORCE && !DRY) { console.log("  ··  " + t.id + " — already made (" + path.basename(done) + "), --force to redo"); skipped++; continue; }

    let ref;
    try { ref = await reference(a); }
    catch (e) { console.log("  !!  " + t.id + " — " + e.message); failed++; continue; }
    if (!ref) { console.log("  --  " + t.id + " — no reference photograph, skipped (see rule 1)"); noref++; continue; }

    const parts = exemplar ? [ref, exemplar] : [ref];
    let prompt = STYLE.promptFor(a, t.hint, t.note);
    if (exemplar) prompt += "\n\n" + STYLE.EXEMPLAR_CLAUSE;

    if (DRY) {
      console.log("  ══  " + t.id + (t.hazard ? "   [" + t.hazard + "]" : ""));
      console.log("      ref: " + ref.src);
      console.log("      inputs: " + parts.length + "   size: " + SIZE + "   quality: " + QUALITY);
      console.log(prompt.split("\n").map((l) => "      | " + l).join("\n"));
      console.log("");
      continue;
    }

    try {
      const t0 = Date.now();
      const buf = await prov.send(parts, prompt);
      const out = await normalise(buf, t.id);
      manifest[t.id] = {
        provider: PROVIDER,
        model: prov.model,
        size: SIZE,
        quality: QUALITY,
        round: ROUND,
        exemplar: exemplar ? path.relative(ROOT, exemplar.file).replace(/\\/g, "/") : null,
        reference: ref.src,
        referenceCredit: (a.image && a.image.credit) || "",
        prompt,
        file: path.relative(ROOT, out.file).replace(/\\/g, "/"),
        normalised: out.normalised,
        generated: new Date().toISOString(),
      };
      writeManifest(manifest);
      made++;
      console.log("  ok  " + t.id.padEnd(26) + " " + ((Date.now() - t0) / 1000).toFixed(1) + "s  → " +
                  path.relative(ROOT, out.file) + (t.hazard ? "   [" + t.hazard + "]" : ""));
    } catch (e) {
      failed++;
      console.log("  !!  " + t.id + " — " + e.message);
    }
  }

  console.log("");
  console.log("made " + made + ", skipped " + skipped + ", no reference " + noref + ", failed " + failed);
  if (!DRY && made && !sharp) {
    console.log("");
    console.log("NOTE: sharp was not importable, so these are raw provider PNGs at whatever size the");
    console.log("model returned. That is fine for review. For a uniform set, install it OUTSIDE the repo");
    console.log("and re-run with --force:   mkdir -p ~/scratch && cd ~/scratch && npm i sharp");
    console.log("                           NODE_PATH=~/scratch/node_modules node .claude/gen-artefact-art.js --pilot --force");
  }
  if (made) {
    console.log("");
    console.log("Now look at them:   node .claude/artefact-art-sheet.js && open .claude/artefact-art/sheet.html");
  }
})();
