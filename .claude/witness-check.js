#!/usr/bin/env node
/* A SHIPPED BOOK READ AGAINST OTHER SCANS OF ITS OWN EDITION — Sep 2026 (batch E56).
   `node .claude/witness-check.js [<book-id> …] [--all] [--limit=N]`

   Ten batches corrected the Canterbury Tales by INFERENCE — the shelf as a dictionary, the rhyme, the
   Middle English facing it — because its entry said what several entries still say: only one
   transcription exists. That was never checked. Archive.org holds EIGHT scans of the same 1912
   Macmillan volume, and reading ours against two of them settled in an afternoon what inference had
   left standing for ten batches, including two passages no amount of inference could reach: a lost
   place-name (`* ^en^s` is `At St. Denis`) and a lost phrase (`for thy father' s^sput!` is `for thy
   father's soul!`). BEFORE DECIDING A BOOK CANNOT BE CHECKED, SEARCH FOR ANOTHER SCAN OF IT.

   HOW IT WORKS, and why it is not a diff. A global diff of 264,000 tokens is both slow and useless:
   three OCRs of one printing disagree in thousands of places, nearly all of them punctuation and
   nearly all of them nobody's fault. What is decisive is much narrower — a place where BOTH witnesses
   resolve the same position, AGREE with each other, and DIFFER from us. So each of our tokens is
   looked up by its own context, the three words either side, and only unanimous disagreement is
   reported. On the Canterbury Tales that resolves 229,562 of 263,871 tokens and reports 199.

   THE FILTER THAT MAKES IT READABLE is that a source volume usually holds more than the book does.
   That one is Chaucer's complete poetical works and Folio ships the Prologue and the twenty-four
   tales, so 161 of the 199 are in matter no reader can reach. Only findings present in the SHIPPED
   chapters are reported.

   IT IS A PROXY AND EVERY ROW MUST BE READ. Two independent OCRs can agree on the same error — both
   witnesses read `heginneth` for `beginneth`, and both `LaWy` for `Law` — so a finding is a question,
   not a verdict, and six of the Canterbury Tales' 38 turned out to be the witnesses' fault or mere
   punctuation. E46 learned this about the Summa's witness and it holds here: TEACH YOURSELF WHAT THE
   WITNESS GETS WRONG BEFORE TRUSTING IT.

   And a majority is not a proof. `Prioress's` against two scans' `Prioresses` was left alone: an OCR
   dropping an apostrophe is as likely as one inventing it, ours emits a typographic apostrophe rather
   than a straight one, and the heading reads correctly either way. A reading that changes nothing for
   a reader is not worth a guess.

   Witnesses are cached under `.claude/witness-cache/` (gitignored). Report-only, exits 0 — it is a
   measure, like `card-focus.js`, not a gate. Not part of the site. */

const fs = require("fs"), path = require("path"), https = require("https");

/* WHICH SCANS ANSWER FOR WHICH BOOK. An entry is added only after the copies have been confirmed to
   be the SAME EDITION — token counts within a percent or two, and a passage read side by side. A
   different edition of the same translation is not a witness; it is another book. */
const WITNESSES = {
  "canterbury-tales": {
    cache: "canterbury-tales/en-text.txt",
    /* The 1912 Macmillan "now first put into modern English". Archive.org lists eight scans of it;
       these two read cleanly enough to be worth fetching, and their token counts come in at 263,529
       and 266,026 against our 263,871. */
    ids: ["completepoetical00chau", "completepoetica01mackgoog"],
  },
  /* THE JOURNEY TO THE WEST HAS NO WITNESS, and that is recorded here so nobody searches twice:
     archive.org's whole 1900–1935 range returns one copy of Timothy Richard's 1913 translation,
     `cu31924074502034`, which is the one this shelf already reads. Its front matter says so. */
};

/* WHAT HAS BEEN READ AND JUDGED. E53's rule, applied to this report as to book-audit's: a finding
   nobody has a reason to look past becomes noise, and noise is what hides the next real thing. These
   are still PRINTED — they are the evidence that the comparison is working — but under their own
   heading, so the list above them is only what nobody has judged yet. */
const READ = [
  ["canterbury-tales", /^Law$/, "both witnesses read `LaWy`; ours is right"],
  ["canterbury-tales", /^Bath$/, "both read `Bathy`; ours is right"],
  ["canterbury-tales", /^Prioress's$/,
   "two scans against one is the strongest evidence here and still not enough — an OCR dropping an " +
   "apostrophe is as likely as one inventing it, and the heading reads correctly either way"],
];
const judged = (id, w) => READ.find((r) => r[0] === id && r[1].test(w));

const CACHE = path.join(__dirname, "witness-cache");
const K = 3;                                   // words of context on each side

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "user-agent": "folio-witness-check" } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        r.resume(); return get(r.headers.location).then(resolve, reject);
      }
      if (r.statusCode !== 200) { r.resume(); return reject(new Error("HTTP " + r.statusCode)); }
      const c = []; r.on("data", (d) => c.push(d)); r.on("end", () => resolve(Buffer.concat(c).toString("utf8")));
    }).on("error", reject);
  });
}

async function witness(id) {
  fs.mkdirSync(CACHE, { recursive: true });
  const f = path.join(CACHE, id + ".txt");
  if (fs.existsSync(f)) return fs.readFileSync(f, "utf8");
  const t = await get("https://archive.org/download/" + id + "/" + id + "_djvu.txt");
  fs.writeFileSync(f, t);
  return t;
}

/* Words only, with the page's own line-breaking undone. A trailing apostrophe or hyphen is dropped:
   left on, it made twenty of the first run's findings differences of punctuation and nothing else. */
function toks(s) {
  s = s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  s = s.replace(/[¬-]\s*\n\s*/g, "").replace(/\s+/g, " ");
  return (s.match(/[A-Za-z][A-Za-z'-]*/g) || [])
    .map((w) => w.replace(/^['-]+/, "").replace(/['-]+$/, "")).filter(Boolean);
}

/* context → the word that stood between. A context seen twice with different words is AMBIGUOUS and
   is dropped rather than guessed at, which is what keeps a repeated formula from voting. */
function ctxMap(w) {
  const m = new Map(), lo = w.map((x) => x.toLowerCase());
  for (let i = K; i < w.length - K; i++) {
    const k = lo.slice(i - K, i).join(" ") + "|" + lo.slice(i + 1, i + 1 + K).join(" ");
    if (m.has(k)) { if (m.get(k) !== w[i]) m.set(k, null); } else m.set(k, w[i]);
  }
  return m;
}

function shippedText(id) {
  global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
  const dir = path.join(__dirname, "..", "books");
  for (const f of fs.readdirSync(dir)) require(path.join(dir, f));
  const b = [...window.FOLIO_BOOKS_IN, ...window.FOLIO_BOOK_ORIG_IN].find((x) => x.id === id);
  if (!b) return null;
  return b.chapters.map((c) => c.html || "").join("\n")
    .replace(/<[^>]*>/g, " ").replace(/[‘’]/g, "'").replace(/\s+/g, " ");
}

(async () => {
  const args = process.argv.slice(2);
  const limit = +((args.find((a) => a.startsWith("--limit=")) || "").split("=")[1] || 0);
  let ids = args.filter((a) => !a.startsWith("--"));
  if (!ids.length) ids = Object.keys(WITNESSES);
  console.log("\nFolio's books read against other scans of their own editions\n");

  for (const id of ids) {
    const spec = WITNESSES[id];
    if (!spec) { console.log("  " + id + ": no witness declared — see WITNESSES at the head of this file\n"); continue; }
    const ourRaw = fs.readFileSync(path.join(__dirname, "book-cache", spec.cache), "utf8");
    const ours = toks(ourRaw), lo = ours.map((x) => x.toLowerCase());
    const maps = [];
    for (const w of spec.ids) {
      try { maps.push({ id: w, m: ctxMap(toks(await witness(w))) }); }
      catch (e) { console.log("  could not fetch " + w + " (" + e.message + ")"); }
    }
    if (maps.length < 2) { console.log("  " + id + ": needs two witnesses to be decisive; " + maps.length + " fetched\n"); continue; }

    const shipped = shippedText(id);
    let resolved = 0, agreed = 0;
    const out = [];
    for (let i = K; i < ours.length - K; i++) {
      const k = lo.slice(i - K, i).join(" ") + "|" + lo.slice(i + 1, i + 1 + K).join(" ");
      const got = maps.map((w) => w.m.get(k));
      if (got.some((g) => g === undefined || g === null)) continue;
      resolved++;
      if (!got.every((g) => g.toLowerCase() === got[0].toLowerCase())) continue;
      agreed++;
      if (got[0].toLowerCase() === ours[i].toLowerCase()) continue;
      const before = ours.slice(i - K, i).join(" ");
      out.push({ ours: ours[i], theirs: got[0], before, after: ours.slice(i + 1, i + 1 + K).join(" "),
                 reaches: shipped ? shipped.includes(before.split(" ").slice(-2).join(" ") + " " + ours[i]) : true });
    }
    const reach = out.filter((r) => r.reaches);
    const live = reach.filter((r) => !judged(id, r.ours));
    const done = reach.filter((r) => judged(id, r.ours));
    console.log("  " + id);
    console.log("    our tokens                      " + ours.length);
    console.log("    positions both witnesses resolve " + resolved);
    console.log("    ...where the two agree           " + agreed);
    console.log("    ...and differ from ours          " + out.length);
    console.log("    ...of which a reader can reach   " + reach.length + "   (the rest are in matter this book does not ship)");
    console.log("    ...still unjudged                " + live.length + "\n");
    (limit ? live.slice(0, limit) : live).forEach((r, n) =>
      console.log("    " + String(n + 1).padStart(3) + "  " + JSON.stringify(r.ours).padEnd(16) +
        " -> " + JSON.stringify(r.theirs).padEnd(16) + "  …" + r.before + " [ ] " + r.after));
    if (!live.length) console.log("    (nothing unjudged)");
    if (done.length) {
      console.log("\n    already read and judged:");
      done.forEach((r) => console.log("      " + JSON.stringify(r.ours).padEnd(16) + " -> " +
        JSON.stringify(r.theirs).padEnd(16) + "  " + judged(id, r.ours)[2]));
    }
    console.log("\n    Read every one: two OCRs can agree on the same error. Nothing here is a verdict.\n");
  }
})().catch((e) => { console.error(e.message); process.exit(0); });
