/* AMERICAN SPELLINGS IN THE DECKS' OWN ENGLISH — report only, exit 0.
   `node .claude/decks/check-british.js [--list]`

   WHY THIS IS A FAULT AT ALL, since the site has a spelling switch: `applySpelling` returns
   IMMEDIATELY under `en-GB`, the authored system, and converts to American only for a reader who asks
   for it. So an American spelling written INTO deck content is never corrected for anybody — it is
   simply what both readers see. The decks are authored British for that reason, and this measures how
   far they are from it.

   THE TABLE IS SLICED OUT OF `app.js` BY TEXT AND THE RUN STOPS IF THE SLICE FAILS. A second copy of a
   147-row word list goes stale on a change made in a file nobody editing a deck has reason to open —
   the same rule `spanish-fix.js`'s `exBritish` follows, and the same scar `add-card-tags.js` left.

   TWO THINGS MAKE THIS A REPORT RATHER THAN A `--fix`, and neither can be patterned away.

   1. THE ONE-WAY ROWS ARE EXCLUDED, and app.js already knows which: it builds its own American→British
      map with `if (!oneWay)` precisely because storey→story is safe and the reverse catastrophic.
      Reversing them turns every narrative STORY into a storey (106 in this corpus), the noun PRACTICE
      into the verb practise (56), a LICENSE into a licence and a computer PROGRAM into a television
      programme. A first run of this sweep reported 713 because it did not honour the flag; honouring it
      gives 489.

   2. A PROPER NOUN IS NOT A SPELLING. Pearl Harbor, the World Trade Center, an Australian Labor Party
      and the Indian Reorganization Act are names, and this corpus carries 8 `harbor`, 11 `center` and 9
      `labor`. Every one read so far is an ordinary noun, but a mechanical pass has no way to know that.

   AND FIVE FORMS ARE EXCLUDED BY NAME because the reverse mapping is not English at all: the `-our`
   rows list `ous` and `ary` in their suffix strings, where real English DROPS the u before those
   endings — humour/humorous, labour/laborious, honour/honorary, clamour/clamorous, odour/odorous. That
   is a latent fault in app.js's own table rather than in the decks (its only consumer is `gradeCloze`,
   and no shipped answer carries one of the five), and it is recorded in `docs/mandarin-review.md`. */
const fs = require("fs");
const src = fs.readFileSync("app.js", "utf8");
const i = src.indexOf("const SPELL_PAIRS = [");
if (i < 0) { console.error("SPELL_PAIRS not found in app.js — slice failed"); process.exit(2); }
const j = src.indexOf("\n  ];", i);
if (j < 0) { console.error("SPELL_PAIRS end not found — slice failed"); process.exit(2); }
const PAIRS = new Function("return " + src.slice(i + "const SPELL_PAIRS = ".length, j + 4).replace(/;\s*$/, ""))();
console.log("SPELL_PAIRS rows sliced from app.js: " + PAIRS.length);
/* the American form of every row, with its suffixes, longest first */
/* THE ONE-WAY ROWS ARE EXCLUDED, and that is the whole safety of this sweep: app.js builds its own
   US→GB map with `if (!oneWay)`, because storey→story is safe and the reverse catastrophic. Reversing
   them here would "correct" every narrative story to a storey, the noun practice to a verb, and a
   computer program to a television programme. */
const BAD = new Set(["humourous", "labourious", "honourary", "clamourous", "odourous"]);
const forms = [];
for (const [gb, us, sfx, oneWay] of PAIRS) {
  if (oneWay) continue;
  for (const s of String(sfx || "").split("|")) if (!BAD.has(gb + s)) forms.push([us + s, gb + s]);
}
forms.sort((a, b) => b[0].length - a[0].length);
const rx = new RegExp("(?<![\\p{L}\\p{N}_])(" + forms.map((f) => f[0]).join("|") + ")(?![\\p{L}\\p{N}_])", "giu");
const back = new Map(forms.map(([u, g]) => [u.toLowerCase(), g]));
const deesc = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const hits = [];
for (const fn of fs.readdirSync("decks").filter((x) => /^Mandarin-.*\.folio-deck\.json$/.test(x))) {
  const d = JSON.parse(fs.readFileSync("decks/" + fn, "utf8"));
  const lvl = fn.replace(/^Mandarin-|\.folio-deck\.json$/g, "");
  for (const c of d.cards || []) {
    const fl = c.fields;
    const look = (what, text) => {
      const t = deesc(String(text || "").replace(/<[^>]*>/g, " "));
      for (const m of t.matchAll(rx)) hits.push([lvl, fl.Simplified, what, m[1], back.get(m[1].toLowerCase()), t.trim()]);
    };
    look("gloss", fl.English);
    String(fl.Examples || "").split(/(?=<div class="uc-exi)/).forEach((b, k) => {
      const m = /<div class="uc-exe">([\s\S]*?)<\/div>/.exec(b); if (m) look("e" + (k + 1), m[1]);
    });
    /* THE THREE FIELDS THIS CHECKER READ NOTHING OF FOR THIRTY BATCHES (batch 139). A Mandarin card
       has more English on it than its gloss and its example translations: the `Characters` panel
       glosses each component, `Compounds` glosses each compound, and the Idioms deck's `Literally`
       line is English outright. Measured before they were added here: 547 American spellings in
       `Characters` over 475 notes, one in `Compounds` and one in `Literally` — while this checker
       reported 0, truthfully, about the two fields it was looking at. A checker's reading of zero is
       only ever a statement about what it reads. Each is scanned where its English lives, so a
       component's pinyin in `uc-ptp` and a compound's in `uc-cmpp` are never put through a word list. */
    String(fl.Characters || "").replace(/<i>([\s\S]*?)<\/i>/g, (m, g) => { look("chars", g); return m; });
    String(fl.Compounds || "").replace(/<span class="uc-cmpg">([\s\S]*?)<\/span>/g, (m, g) => { look("compound", g); return m; });
    look("literally", fl.Literally);
  }
}
const by = new Map();
for (const h of hits) by.set(h[3].toLowerCase(), (by.get(h[3].toLowerCase()) || 0) + 1);
console.log("\nAmerican spellings found: " + hits.length + " over " + by.size + " distinct words\n");
[...by.entries()].sort((a, b) => b[1] - a[1]).forEach(([w, n]) => console.log("   " + String(n).padStart(3) + "  " + w + " → " + back.get(w)));
if (process.argv[2] === "--list") { console.log(""); hits.forEach((h) => console.log("   " + h[0] + "  " + h[1] + "  " + h[2] + "  [" + h[3] + "]  " + h[5])); }
