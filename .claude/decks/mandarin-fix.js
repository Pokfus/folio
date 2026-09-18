#!/usr/bin/env node
"use strict";
/*
  mandarin-fix.js — THE ONE WAY A MANDARIN DECK IS HAND-EDITED (Sep 2026). Standalone Node helper, zero
  deps. Not part of the site.

    node .claude/decks/mandarin-fix.js [--check] [--verbose]

  WHY IT EXISTS. The Mandarin decks' generator inputs (`w26-*.json`) are NOT in this repo, so unlike the
  DELE, DELF, CAPLE, Goethe and UKBI decks these nine cannot be regenerated: every correction to them is
  a hand edit on top of an artefact nobody can rebuild. Done directly, that leaves no record of WHICH of
  a deck's 11,532 notes were touched or why — and the next session, finding a card that disagrees with
  its generator, cannot tell a deliberate repair from a bug.

  SO THE EDITS LIVE IN `mandarin-fixes.json` AND THIS APPLIES THEM. The file is the record: one entry per
  note, keyed by deck id and headword (readable, and stable across a renumbering where a card id is not),
  each carrying the fields it overrides and a `why`. Running it is IDEMPOTENT — a deck already carrying
  the fixes is left byte-identical — so it is safe to re-run, and `--check` asserts exactly that without
  writing, which is what CI can hold.

  IT REWRITES THE LEGACY MIRRORS TOO. A note carries its reading three times over — `fields.Pinyin`, the
  top-level `pinyin`, and the head of `answer` — and its senses twice, in `fields.English` and again in
  `answer` in an abbreviated form (`(v.)` for `verb`). An edit that moved one and not the others is the
  shape that produced the reported `蛋糕` fault's siblings, so `answer` is REBUILT from the fields rather
  than patched: there is one source for it and it cannot drift.

  `hints` IS A SECOND, SEPARATE MAP, AND IT IS SEPARATE BECAUSE IT IS MECHANICAL. The English → Chinese
  card's front is the gloss and nothing else, so two notes sharing a gloss are one question with two
  right answers. The decks already answer that for 104 pairs, with a `not <other word>` block above the
  senses; `hints` completes it for the 251 pairs that were missing one. It is a map rather than an entry
  per note because there is no judgement in it — the other member of the pair is a fact about the corpus —
  and 502 `why` lines all saying the same thing would bury the 57 that are real editorial decisions.
  A group of THREE OR MORE is deliberately NOT hinted: naming four of five answers on the front of the
  card is worse than the ambiguity, so those are given distinguishing glosses in `notes` instead.

  `types` EDITS THE DECK'S CARD TYPE, which is how a new FIELD reaches the cards at all — a field the
  type does not declare is a field the template engine will not render, so `literally` below would be
  written into every note and shown on none. It is applied before the notes for that reason.

  `ex` ADDS EXAMPLE SENTENCES AS `[chinese, english]` PAIRS and builds the block here. Three things
  about them. They are APPENDED to whatever the note already has, up to the three the card type shows,
  and they carry `uc-exadd` so re-running strips its own additions first rather than stacking them —
  that class is the only thing that makes this idempotent. The headword is BOLDED wherever it appears,
  which is what the generator's own examples do. And they carry NO STRUCTURE LINE: that line is a
  part-of-speech gloss of every word of the sentence with the target's own bolded, and it cannot be
  derived for a sentence written for a different card — a wrong one would be worse than none.

  `exEn` REWRITES THE ENGLISH OF A SENTENCE THE DECK ALREADY SHIPS, matched on a substring of its
  Chinese. It exists because the obvious way of doing that does not work and reports nothing: naming a
  sentence in `dropEx` and re-adding the same Chinese with a better translation has the drop filter the
  record's own `ex` rows too (deliberately — see the comment beside it), so the re-add is thrown away
  and the card comes back an example short. 手机 went from three sentences to one that way. It is the
  same class of edit as `dropEx`, a permanent mutation of a generator block, and it is CHECKABLE where
  `dropEx` is not: the new English is re-asserted on every run, so a row matching nothing is always a
  typo and fails rather than being noted.

  `exStop` ADDS A TERMINAL FULL STOP TO A SENTENCE THE DECK ALREADY SHIPS, and nothing else. The
  corpus-wide punctuation pass CONVERTS marks and never adds one — whether a fragment wants a stop is
  a judgement — so it deliberately left about 150 sentences with no terminal mark at all. Most of them
  want replacing rather than punctuating, which `dropEx` + `ex` does; a few are perfectly good
  sentences whose only fault is the missing stop, and throwing one of those away to work around a gap
  in this file would put a worse sentence on the card. `exStop` is `[[chinese, mark?]]`, matched on the
  block's `data-say` EXACTLY, and it rewrites both `data-say` and the visible text so the spoken and
  the seen cannot come apart.
  It is deliberately NOT a general Chinese rewrite. A generator block carries a STRUCTURE LINE — a
  part-of-speech gloss of every word of the sentence — and its visible text is bolded around the
  headword, neither of which can be re-derived for different words; appending a mark at the end is the
  one edit that leaves both true. Anything else is `dropEx` + `ex`, which rebuilds the block.
  It is IDEMPOTENT by matching either form: a block whose `data-say` is already the sentence PLUS the
  mark is the repair already applied and is a no-op, where a row matching neither form is a typo and
  FAILS.

  `mw` IS WRITTEN AS BARE CHARACTERS AND EXPANDED FROM THE CORPUS. A measure word renders as the
  character, its traditional form where that differs, and its pinyin — three facts the decks already
  state 1,148 times over, so `["个","位"]` is expanded from their own table rather than retyped. A
  character the corpus has never used as a measure word is refused rather than guessed at.

  `compounds` LISTS THE OTHER WORDS BUILT ON A SINGLE-CHARACTER CARD'S CHARACTER, as
  `[word, pinyin, gloss]` rows expanded into the `Compounds` field below. It exists because the tap
  panel that already does this (`openCharWin` in app.js) can only search the deck the reader has
  DOWNLOADED — on Level 1, 71 of its 137 single-character cards have no other word in that deck at all
  — so for half of the cards the feature is for, it says "No other word in this deck uses it". The
  applier has no dictionary and cannot check a reading; what it CAN refuse is a row that does not
  contain the card's own character, or that merely repeats it, both of which render perfectly.

  SENSES ARE WRITTEN COMPACTLY AND EXPANDED HERE. `[["yàn","verb","to swallow"],["yān","noun","throat"]]`
  becomes the two `uc-sense` divs the card type renders, with the reading prefix only where a note
  teaches more than one — which is the shape 过, 花, 空 and 重 already use and the shape this pass gave
  the polyphones that were missing their second reading.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const FIXES = path.join(__dirname, "mandarin-fixes.json");
const CHECK = process.argv.includes("--check"), VERBOSE = process.argv.includes("--verbose");

// the abbreviations `answer` uses, derived from the 11,532 notes that already agree on them
const ABBR = {
  adjective: "adj.", adverb: "adv.", conjunction: "conj.", idiom: "idiom.", interjection: "interj.",
  "measure word": "mw.", noun: "n.", numeral: "num.", onomatopoeia: "onom.", particle: "part.",
  phrase: "phr.", prefix: "pref.", preposition: "prep.", pronoun: "pron.", suffix: "suf.", verb: "v.",
};
const abbr = (pos) => pos.split("/").map((p) => ABBR[p.trim()] || p.trim()).join("/");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const deesc = (s) => String(s).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

/* ---------- MOVING WHITESPACE AND PUNCTUATION INSIDE A GENERATOR'S OWN SENTENCE ----------
   `exStop` says in its own comment why it cannot be a general Chinese rewrite: a generator block
   carries a STRUCTURE LINE glossing every word's part of speech and BOLDS the headword inside its
   visible text, and neither can be re-derived for different words. Deleting a stray space, or turning
   an ASCII comma into a full-width one, changes NO WORD — so both stay true, by exactly the argument
   that lets `exStop` append a mark.
   THE GUARD IS WHAT MAKES THAT AN ARGUMENT RATHER THAN A HOPE: `zhSkeleton` strips every space and
   every mark from both sides of the row and REFUSES the pair unless what is left is identical. A row
   therefore cannot add, remove or change a character of the sentence itself, whatever is typed in it.
   THE BOLD IS RE-PLACED BY SKELETON INDEX, NOT BY STRING POSITION. The tags interleave with the very
   characters being edited — `<b>窗户</b> 打开 了。` — so the visible text is tokenised into tags and
   characters, each tag is recorded against the number of SKELETON characters before it, and the new
   text is emitted with the tags flushed back at the same counts. An opening tag goes before its
   skeleton character and a closing tag immediately after the previous one, which is what keeps a
   trailing mark OUTSIDE the bold rather than inside it. */
/* ---------- ONE CHARACTER FOR ANOTHER, AND ONLY A DECLARED PAIR ----------
   `exVariant` is `exSpace` one notch wider and bounded by a TABLE rather than by a shape. It exists
   because the decks carry the TRADITIONAL 著 where simplified writes 着 — the aspect particle — and
   nothing else here can reach it: `exSpace` compares the two sides with every space and mark stripped
   out and so REFUSES a character swap, correctly, that guard being what makes it safe; and `dropEx`
   would throw away a sound sentence to fix one glyph.
   EVERY DIFFERING POSITION MUST BE A DECLARED PAIR, AND THERE MAY BE MORE THAN ONE. The first cut
   allowed exactly one, which forced a sentence carrying the character twice (他倚著我的肩膀睡著了) to
   take two CHAINED rows — and chained rows are NOT IDEMPOTENT: once both have run, the first names a
   sentence the deck no longer has, so `--check` fails for ever afterwards. The guard's job is that
   every difference is a declared substitution, not that there is only one of them, so it counts PAIRS
   rather than positions.
   WHY A ONE-FOR-ONE SWAP IS SAFE WHERE A FREE REWRITE IS NOT: `exStop` and `exSpace` both argue from
   the structure line and the bolding, neither of which can be re-derived for different words. A
   substitution of the same length at a single position changes NO POSITION, so `rewriteZhVisible`
   flushes every tag back exactly where it stood and the `<b>` round the headword and the `data-say`
   both survive untouched. It is narrower than what `exSpace` already allows, which INSERTS and DELETES.
   WHAT THE TABLE IS FOR: a variant sweep cannot find 著, because 著 is also a perfectly good simplified
   character (著名, 显著, 著作, 名著, 著称, 专著) — so the repair cannot be a rule either. Every pair is
   declared here with its reason, and a row whose two sides differ anywhere else, or by more than one
   character, or by a pair not in this table, is REFUSED. Add a pair only after reading every site.
   `鉄`→`铁` is the Japanese form batch 77 found and repaired by hand; it is declared so the same fault
   found again has a mechanism. */
const VARIANT_PAIRS = {
  "著": "着", // the traditional aspect particle / verb suffix zhe, which simplified writes 着.
                      // 著 is NOT wrong in itself (著名, 显著, 著作, 名著, 著称, 专著 all keep it) —
                      // only where it stands for 着, which is why this is a declared swap and not a sweep.
  "鉄": "铁", // the Japanese form of 铁 (batch 77, 钢鉄 on three cards).
};
function variantSwap(was, now) {
  if (typeof was !== "string" || typeof now !== "string") return "not two strings";
  if (was.length !== now.length) return "the two sides are different lengths";
  let n = 0;
  for (let i = 0; i < was.length; i++) {
    if (was[i] === now[i]) continue;
    n++;
    if (VARIANT_PAIRS[was[i]] !== now[i]) {
      return "‘" + was[i] + "’ → ‘" + now[i] + "’ is not a declared variant pair";
    }
  }
  if (!n) return "the two sides are identical";
  return null;
}

const ZH_PUNCT = /[\s　 ，。、；：？！“”‘’（）《》〈〉—…·,.;:?!"'()\[\]]/;
const zhSkeleton = (t) => String(t).split("").filter((c) => !ZH_PUNCT.test(c)).join("");
function rewriteZhVisible(html, oldPlain, newPlain) {
  const toks = [];
  for (let i = 0; i < html.length; ) {
    if (html[i] === "<") { const j = html.indexOf(">", i); if (j < 0) return null; toks.push({ tag: html.slice(i, j + 1) }); i = j + 1; }
    else { toks.push({ ch: html[i] }); i++; }
  }
  const plain = deesc(toks.filter((t) => t.ch !== undefined).map((t) => t.ch).join(""));
  if (plain !== oldPlain) return null;
  const opens = new Map(), closes = new Map();
  let sk = 0;
  for (const t of toks) {
    if (t.tag !== undefined) {
      const m = /^<\//.test(t.tag) ? closes : opens;
      if (!m.has(sk)) m.set(sk, []);
      m.get(sk).push(t.tag);
    } else if (!ZH_PUNCT.test(t.ch)) sk++;
  }
  let out = "", n = 0;
  for (const ch of String(newPlain)) {
    if (!ZH_PUNCT.test(ch)) { out += (opens.get(n) || []).join(""); out += esc(ch); n++; out += (closes.get(n) || []).join(""); }
    else out += esc(ch);
  }
  if (n !== sk) return null;
  return out;
}

/* senses → the two fields that must agree. `multi` is decided by the sense list rather than passed in,
   so a note that gains a second reading gains its prefixes in both fields in the same pass. */
function renderSenses(senses) {
  const multi = senses.length > 1 && senses.every((s) => s.length === 3);
  const html = senses.map((s) => {
    // 3 = [reading, part of speech, gloss]; 2 = [part of speech, gloss]; 1 = the gloss alone, which is
    // what an idiom has — the decks give none of the 477 a part of speech
    const [rd, pos, gloss] = s.length === 3 ? s : s.length === 2 ? [null, s[0], s[1]] : [null, null, s[0]];
    return '<div class="uc-sense">' + (multi && rd ? esc(rd) + " — " : "") +
      (pos ? '<i class="uc-pos">' + esc(pos) + "</i>" : "") + esc(gloss) + "</div>";
  }).join("");
  const ans = senses.map((s) => {
    const [rd, pos, gloss] = s.length === 3 ? s : s.length === 2 ? [null, s[0], s[1]] : [null, null, s[0]];
    return (multi && rd ? rd + " — " : "") + (pos ? "(" + abbr(pos) + ") " : "") + gloss;
  }).join("; ");
  return { html, ans };
}

/* character → [traditional form (empty where it is the same), pinyin], read off every measure word the
   decks already carry. Derived rather than declared: the rendering has to match the 1,148 notes that
   already have one exactly, and a second copy of that table is a second thing to keep in step. */
const MW = (() => {
  const t = {};
  for (const f of fs.readdirSync(DIR).filter((x) => /^Mandarin-.*\.folio-deck\.json$/.test(x))) {
    const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
    for (const c of d.cards || []) {
      const raw = ((c.fields || {})["Measure word"] || "");
      for (const it of raw.split('<span class="uc-mwi">').slice(1)) {
        const ch = (/<span class="uc-mwc">([^<]*)<\/span>/.exec(it) || [])[1];
        const tr = (/<span class="uc-mwc uc-mwt">([^<]*)<\/span>/.exec(it) || [])[1] || "";
        const pi = (/<span class="uc-mwp">([^<]*)<\/span>/.exec(it) || [])[1];
        if (ch && pi && !t[ch]) t[ch] = [tr, pi];
      }
    }
  }
  return t;
})();

/* ---------- A CHINESE SENTENCE TAKES CHINESE PUNCTUATION (Sep 2026) ----------------------------
   551 of the decks' 34,596 example sentences are punctuated with ASCII marks — 我明年想学汉语. and
   你们公司几点下班? and 我们出去后, 再也没有回来。 — so a card teaching Chinese shows a beginner the
   wrong marks for it. It is a DECK-LEVEL pass rather than an entry per note for the reason the Spanish
   record's `exBritish` is one: there is no judgement in it, and a mechanical substitution written out
   per card is one that gets applied to 116 cards and forgotten on the 117th.

   IT CONVERTS A MARK AND NEVER ADDS ONE. 130 of those sentences simply stop, with no terminal at all,
   and supplying one is a claim that the sentence is COMPLETE — which a machine cannot make: `和一个只说`
   is a truncated fragment, and four of the 130 end in 吗 or 呢 and want ？ rather than 。. Those are
   left to be read and repaired by hand, batch by batch, and are listed in docs/mandarin-review.md.

   IT REWRITES BOTH COPIES. A sentence is stored twice in its block — once as the `data-say` the speaker
   is handed, once as the visible text with the headword bolded — and an edit that moved one and not the
   other is the fault this whole file exists to prevent. The visible copy needs the tags allowed for
   between the character and the mark, since `说</b>,` is the shape a bolded headword leaves behind. */
const HAN_RX = "[\\u4e00-\\u9fff\\u3400-\\u4dbf]";
const FULLWIDTH = { ",": "，", ";": "；", ":": "：", "!": "！", "?": "？" };
/* An ASCII double quote in Chinese prose is the wrong mark AND it breaks the card: the spoken copy is
   stored in a `data-say="…"` attribute, so the first embedded quote ends the attribute and the speaker
   is handed a fragment — or, where the sentence opens on one, nothing at all. Paired into “ ” only
   where the count is EVEN, since an odd one cannot be paired and a guess would leave a quote unclosed. */
const punctQuotes = (s) => {
  const n = (String(s).match(/"/g) || []).length;
  if (!n || n % 2) return String(s);
  let i = 0;
  return String(s).replace(/"/g, () => (i++ % 2 ? "\u201d" : "\u201c"));
};
/* ---------- BRITISH SPELLING, FROM app.js's OWN TABLE ----------
   The decks are authored British, because the site's switch NEVER RUNS IN THE DIRECTION THAT WOULD
   RESCUE THEM: `applySpelling` returns at once under `en-GB`, the authored system, and converts to
   American only for a reader who asks. So an American spelling written into deck content is what BOTH
   readers see, for ever.

   THE TABLE IS SLICED OUT OF `app.js` BY TEXT AND THIS FILE STOPS IF THE SLICE FAILS. A second copy of
   a 147-row word list goes stale on a change made in a file nobody editing a deck has reason to open —
   the rule `spanish-fix.js`'s own `exBritish` already follows.

   THREE THINGS BOUND WHAT IT MAY CONVERT, and none of them can be dropped.
   1. THE ONE-WAY ROWS ARE EXCLUDED, and app.js already knows which: it builds its own American→British
      map with `if (!oneWay)` precisely because storey→story is safe and the reverse catastrophic.
      Reversing them turns every narrative STORY into a storey, the noun PRACTICE into the verb, a
      LICENSE into a licence and a computer PROGRAM into a television programme.
   2. FIVE FORMS ARE EXCLUDED BY NAME because the reverse mapping is not English at all: the `-our` rows
      list `ous` and `ary` in their suffix strings where real English DROPS the u, so the map would
      otherwise hold humorous → humourous, laborious → labourious, honorary → honourary, clamorous →
      clamourous and odorous → odourous. That is a latent fault in app.js's own table (its only consumer
      there is `gradeCloze`, and no shipped card answer carries one of the five).
   3. A PROPER NOUN IS NOT A SPELLING. Pearl Harbor, the World Trade Center, an Australian Labor Party
      and the Indian Reorganization Act are names. `BRIT_KEEP` is the declared escape hatch and is
      EMPTY, which is a measurement rather than an omission: the corpus carries 8 `harbor`, 11 `center`,
      9 `labor`, 24 `organization` and 14 `theater`, every one of them was read, and not one is a name.
      All 26 capitalised hits are glosses in the Levels 7–9 deck, which capitalises its glosses.
      **Re-run `check-british.js --list` and read the capitalised hits before trusting that again.**

   The case of the word on the page is preserved — lower, Capitalised, ALL CAPS — and anything else is
   left exactly as written, which is app.js's own rule for the same reason: a mixed-case word is a name
   far more often than it is a spelling. */
const BRIT_BAD = new Set(["humourous", "labourious", "honourary", "clamourous", "odourous"]);
const BRIT_KEEP = [];   // declared proper nouns; see above — measured empty, not assumed empty
const BRIT = (() => {
  const src = fs.readFileSync(path.join(__dirname, "..", "..", "app.js"), "utf8");
  const i = src.indexOf("const SPELL_PAIRS = [");
  const j = src.indexOf("\n  ];", i);
  if (i < 0 || j < 0) { console.error("FAIL  SPELL_PAIRS could not be sliced out of app.js — refusing to guess at a spelling table"); process.exit(2); }
  const PAIRS = new Function("return " + src.slice(i + "const SPELL_PAIRS = ".length, j + 4).replace(/;\s*$/, ""))();
  const map = new Map();
  for (const [gb, us, sfx, oneWay] of PAIRS) {
    if (oneWay) continue;
    for (const t of String(sfx || "").split("|")) if (!BRIT_BAD.has(gb + t)) map.set((us + t).toLowerCase(), gb + t);
  }
  const keys = [...map.keys()].sort((a, b) => b.length - a.length);
  return { map, rx: new RegExp("(?<![\\p{L}\\p{N}_])(" + keys.join("|") + ")(?![\\p{L}\\p{N}_])", "giu") };
})();
function britCase(src, out) {
  if (src === src.toLowerCase()) return out;
  if (src === src.toUpperCase()) return out.toUpperCase();
  if (src[0] === src[0].toUpperCase() && src.slice(1) === src.slice(1).toLowerCase()) return out[0].toUpperCase() + out.slice(1);
  return src;
}
function britText(t) {
  if (!t) return t;
  BRIT.rx.lastIndex = 0;
  return String(t).replace(BRIT.rx, (m) => {
    if (BRIT_KEEP.includes(m)) return m;
    const hit = BRIT.map.get(m.toLowerCase());
    return hit ? britCase(m, hit) : m;
  });
}
/* Only the ENGLISH of a card is swept — its gloss and each example's `uc-exe` div — never the Chinese
   and never a `data-say`, which carries its own copy of the sentence. */
function britExamples(html) {
  return String(html || "").replace(/(<div class="uc-exe">)([\s\S]*?)(<\/div>)/g, (m, a, mid, b) => a + britText(mid) + b);
}
/* ---------- THE AMERICAN-WORD-CHOICE TABLE (batch 24) ----------
   `exBritish` above converts SPELLINGS, and it can do that from app.js's own table because a spelling
   is a fact about a word. A WORD CHOICE is not: `movie`, `vacation`, `elevator` and `faucet` are
   different words from film, holiday, lift and tap, no rule relates them, and app.js has no table of
   them because the site's own prose is authored British and never needed one. So the table is declared
   here, and every row in it was arrived at by READING every occurrence the nine decks contain — which
   is the only thing that makes a mechanical sweep safe, and which is why the list is so much shorter
   than the raw measurement.
   FIVE OF THE BIGGEST FINDINGS ARE NOT IN IT, and that is the useful half. `fall` (74 hits), `check`
   (73), `store` (46), `grade` (20) and `mail` (20) are ordinary English words as well as American
   ones — 71 of the 74 `fall`s are the verb, and a table row would have turned "Pride goes before a
   fall" into "Pride goes before an autumn". Those went to per-note `exEn` and `gloss` rows, where a
   human decided each one. `stove`, `vest` and `mail` are in neither: a wood stove, a sleeveless vest
   and air mail are all ordinary British English, so the finding was the sweep's and not the deck's.
   THE PHRASE ROWS COME FIRST because the table is applied longest-first, and they exist for the two
   things a word-for-word swap gets wrong: a compound whose British name is not built from the same
   parts (`movie theatre` is a cinema, not a film theatre), and an ARTICLE that has to change with the
   word after it (`an elevator` is `a lift`).
   THEY ALSO CARRY A THIRD CASE (batch 32): a ONE-WAY SPELL_PAIRS row whose American form is safe to
   sweep only inside a phrase. `licence`/`license` is one-way because British English spells the VERB
   `license`, so a bare row would make `to licence a driver`; but `driver's license` and `license plate`
   are nouns wherever they occur, and the British forms are a different phrase besides — a `driver's
   license` is a `driving licence`, which no word-for-word swap reaches. The bare word is left to a
   per-note `gloss` row, which is where the corpus's one remaining site went.
   AND A FOURTH (batch 35): A PLURAL IS A DIFFERENT KEY, AND THE TABLE HAD NONE. The regex is built
   from the literal keys with word boundaries either side, so `elevator` does not match inside
   `elevators` and the row simply never fires — measured over the nine decks, ten card-sites over six
   distinct sentences escaped that way (elevators, subways, cellphones, airplanes, trucks), every one of
   them a word the table already claims in the singular. That is a hole in the table rather than a new
   class, so the plurals are DECLARED beside their singulars.
   THE OBVIOUS GENERALISATION IS A TRAP AND THE TABLE ITSELF PROVES IT. Matching `key + s` automatically
   would fire `math` inside `maths` — the row's own TARGET, ten sites of it in these decks — and rewrite
   it to `mathss`; and an irregular plural (`truck` → `lorries`, not `lorrys`) cannot be derived from the
   singular's replacement at all. A declared row can only do what it says.
   AND `toward` IS THERE ON THE SAME REASONING AS `gotten` (batch 36): a variant FORM rather than a
   choice between two words, unambiguous in British English, and already settled by the decks
   themselves — measured, they write `towards` 33 times against 4 `toward`s. The word boundary is what
   keeps it off `untoward`.
   `anymore` IS THE SAME SHAPE AGAIN (batch 38), and the biggest of the three: British English writes
   it as TWO WORDS in this sense, and the decks carried 20 sites of the American one-word form. It is a
   spacing rather than a word choice, so no judgement is needed per site, and the replacement contains a
   space, which means it can never match itself on a re-run.
   AND `railroad` IS THE FIRST NEW WORD-CHOICE ROW SINCE batch 24 (batch 49). It is a straight American
   word for a British one with no second sense to protect: unlike `highway`, which batch 48 refused a row
   for because 公路 alone really is a highway in British legal English while 高速公路 is a motorway, a
   railroad is a railway wherever it occurs. Measured over the nine decks: SEVEN occurrences on four
   cards, against 27 `railway`s, and every one was read — not one is a proper noun, which is the check
   that matters here, an American railroad company's NAME being a name. The plural is declared beside it
   on batch 35's rule. `mall` was measured in the same pass and DELIBERATELY LEFT: 商场's own gloss is
   `shopping mall`, which is ordinary British English (Bluewater and Westfield are shopping malls), so
   the finding there is the sweep's and not the deck's — `stove` and `vest` again.
   `hometown` IS `anymore`'S SHAPE (batch 52): a SPACING rather than a word choice, so no judgement is
   needed per site, and the replacement contains a space, which means it can never match itself on a
   re-run. British style sets it as two words; the decks were split 15 one word to 11 two, across eleven
   cards, every site read and none a proper noun — and `hsk30l4/家乡` CONTRADICTED ITSELF, its gloss
   already reading `home town` over two sentences saying `hometown`.
   `cell phone` IS `railroad`'S SHAPE (batch 62): a straight American word for a British one with no
   second sense to protect — a cell phone is a mobile phone wherever it occurs, and unlike `gas`, which
   this batch measured in the same pass and REFUSED a row for, there is nothing to judge per site.
   (`gas` runs to 56 occurrences across the nine decks and about fifty of them are the SUBSTANCE —
   natural gas, coal gas, a gas leak, a gas bubble — which is British English too; only the six that
   mean PETROL are American, so that family went to per-note `exEn` rows, which is `fall` and `check`
   and `store` again.) Measured over the nine decks: NINE occurrences on nine cards, one sentence
   carried by four of them, every one read and every one 手机. The plural is declared beside it because
   both forms occur, and the replacement contains a space, so it can never match itself on a re-run.
   `parking lot` IS THE SAME SHAPE AGAIN (batch 65) and was measured in the same pass as two families
   that were REFUSED one. All SEVEN occurrences across the nine decks are the American compound for a
   car park — four of them on hsk30l4/停车场, including its own gloss — and there is no second sense to
   protect. What was refused beside it: `fill out`, because one of its nine sites is
   `The sail on the boat filled out`, which is ordinary British English and which any row on the bare
   phrase would wreck (the other eight are forms and went to per-note rows); and `dirt`, because five
   of its six sites are grime, dust or the idiom `to eat dirt`, all of them British, and only one is
   the American word for soil. Both are `gas` again: the right word depends on what the sentence is
   about, which is a judgement per site. */
const LEXIS = (() => {
  const PAIRS = [
    ["driver's license", "driving licence"],
    ["drivers license", "driving licence"],
    ["license plate", "licence plate"],
    ["movie theatre", "cinema"],
    ["movie theater", "cinema"],
    ["to the movies", "to the cinema"],
    ["a subway map", "an underground map"],
    ["an elevator", "a lift"],
    ["movies", "films"],
    ["movie", "film"],
    ["vacation", "holiday"],
    ["elevators", "lifts"],
    ["elevator", "lift"],
    ["subways", "underground trains"],
    ["subway", "underground"],
    ["cellphones", "mobile phones"],
    ["cellphone", "mobile phone"],
    ["sidewalk", "pavement"],
    ["airplanes", "aeroplanes"],
    ["airplane", "aeroplane"],
    ["soccer", "football"],
    ["faucet", "tap"],
    ["gotten", "got"],
    ["toward", "towards"],
    ["anymore", "any more"],
    ["trucks", "lorries"],
    ["truck", "lorry"],
    ["math", "maths"],
    ["parking lots", "car parks"],
    ["parking lot", "car park"],
    ["cell phones", "mobile phones"],
    ["cell phone", "mobile phone"],
    ["hometowns", "home towns"],
    ["hometown", "home town"],
    ["railroads", "railways"],
    ["railroad", "railway"],
  ];
  const map = new Map();
  for (const [us, gb] of PAIRS) map.set(us.toLowerCase(), gb);
  const keys = [...map.keys()].sort((a, b) => b.length - a.length);
  return { map, rx: new RegExp("(?<![\\p{L}\\p{N}_])(" + keys.join("|") + ")(?![\\p{L}\\p{N}_])", "giu") };
})();
function lexText(t) {
  if (!t) return t;
  LEXIS.rx.lastIndex = 0;
  return String(t).replace(LEXIS.rx, (m) => {
    const hit = LEXIS.map.get(m.toLowerCase());
    return hit ? britCase(m, hit) : m;
  });
}
function lexExamples(html) {
  return String(html || "").replace(/(<div class="uc-exe">)([\s\S]*?)(<\/div>)/g, (m, a, mid, b) => a + lexText(mid) + b);
}
const punctPlain = (s) => punctQuotes(String(s)
  .replace(new RegExp("(" + HAN_RX + ")([,;:!?]) ?", "g"), (m, a, b) => a + FULLWIDTH[b])
  .replace(new RegExp("(" + HAN_RX + ")\\.$"), "$1\u3002"));
/* THE SPOKEN COPY IS DERIVED FROM THE VISIBLE ONE RATHER THAN REPAIRED BESIDE IT. A sentence is stored
   twice in its block and an edit that moved one and not the other is the fault this file exists to
   prevent — and the quote case above proves the two really can disagree, since eight blocks shipped
   with a `data-say` cut short of the sentence beside it. Rebuilding it from the visible text makes the
   two agree by construction. The leading spans (the sense tag, the speaker) are stepped over, and the
   sentence itself carries nothing but the <b> round the headword. */
const punctExamples = (html) => String(html).replace(
  /(<div class="uc-exz">)([\s\S]*?)(<\/div>)/g, (m, open, inner, close) => {
    const cut = inner.lastIndexOf("</span>");
    const pre = cut < 0 ? "" : inner.slice(0, cut + 7), sent = cut < 0 ? inner : inner.slice(cut + 7);
    const fixed = punctPlain(sent);
    const plain = fixed.replace(/<[^>]*>/g, "");
    return open + pre.replace(/data-say="[^"]*"/, 'data-say="' + plain + '"') + fixed + close;
  });

const fixes = JSON.parse(fs.readFileSync(FIXES, "utf8"));
/* `decks` edits a deck's own METADATA rather than a note — currently only the subtitle, which is what
   the Collections page prints under a deck's title. It is here rather than hand-edited into the files
   for the reason everything else is: these decks cannot be regenerated, so an edit with no record is an
   edit the next session cannot tell from a bug. */
const deckMeta = fixes.decks || {};
let metaHit = 0;
const entries = Object.entries(fixes.notes || {});
const seen = new Set();
let hitsBrit = 0;
let hitsLex = 0;
let changed = 0, files = 0, missing = [], badGloss = [], badMW = [], badDrop = [], badEx = [], badSense = [], badCmp = [], badExEn = [], badExStop = [], badExSpace = [], badExVar = [];
let hitsPunct = 0;

const hints = Object.entries(fixes.hints || {});
const hintsByDeck = new Map();
const seenHint = new Set();
for (const [key, other] of hints) {
  const i = key.indexOf("/");
  const deck = key.slice(0, i), word = key.slice(i + 1);
  if (!hintsByDeck.has(deck)) hintsByDeck.set(deck, new Map());
  hintsByDeck.get(deck).set(word, { key, other });
}

const byDeck = new Map();
for (const [key, fix] of entries) {
  const i = key.indexOf("/");
  const deck = key.slice(0, i), word = key.slice(i + 1);
  if (!byDeck.has(deck)) byDeck.set(deck, new Map());
  byDeck.get(deck).set(word, { key, fix });
}

for (const f of fs.readdirSync(DIR).filter((x) => /^Mandarin-.*\.folio-deck\.json$/.test(x)).sort()) {
  const p = path.join(DIR, f);
  const before = fs.readFileSync(p, "utf8");
  const d = JSON.parse(before);
  const dm = deckMeta[d.meta && d.meta.id];
  if (dm) {
    Object.keys(dm).forEach((k) => { if (k !== "why" && k !== "addFields" && k !== "tpl" && k !== "css") d.meta[k] = dm[k]; });
    /* `css` APPENDS TO EVERY TYPE'S OWN SCOPED SHEET rather than setting a deck field, which is what a
       rule needs that belongs to no one field — the sense tag on an example is written into a block the
       Examples field already owns. Idempotent on the rule's first selector, like `addFields`'s. */
    if (dm.css) {
      for (const t of Object.values(d.meta.types || {})) {
        if (String(t.css || "").indexOf(dm.css.trim().split("\n")[0]) < 0) t.css = String(t.css || "") + dm.css;
      }
    }
    /* A FIELD IS ADDED IN TWO PLACES OR IN NEITHER: the type's `fields` list, and the template that
       renders it. Adding one and not the other is silent — the field is stored and never shown. */
    (dm.addFields || []).forEach((f) => {
      for (const t of Object.values(d.meta.types || {})) {
        if ((t.fields || []).indexOf(f.name) < 0) t.fields.push(f.name);
        (t.cards || []).forEach((card) => {
          if (String(card.back || "").indexOf("{{" + f.name + "}}") >= 0) return;
          card.back = String(card.back).replace(f.after, f.after + f.html);
        });
        // …and the type's own scoped CSS, or the new line renders as an unstyled paragraph
        if (f.css && String(t.css || "").indexOf(f.css.trim().split("\n")[0]) < 0) t.css = String(t.css || "") + f.css;
      }
    });
    /* Applied to every card of the deck, not to a named list, which is the whole point of putting a
       mechanical substitution in one place. Idempotent: a full-width mark is not matched again. */
    if (dm.exPunct) for (const c of d.cards || []) {
      const was = c.fields && c.fields.Examples;
      if (!was) continue;
      const now = punctExamples(was);
      if (now !== was) { c.fields.Examples = now; hitsPunct++; }
    }
    metaHit++;
  }
  const want = byDeck.get(d.meta && d.meta.id);
  const wantHint = hintsByDeck.get(d.meta && d.meta.id);
  if (!want && !wantHint && !dm) continue;
  let hits = 0;
  for (const c of d.cards || []) {
    const fl = c.fields || {};
    /* THIS FILE IS AUTHORITATIVE FOR ADDED EXAMPLES, so every block it has ever added is stripped from
       every note FIRST and only what the record still names is put back. Without that, removing an `ex`
       from the record leaves the sentence in the deck and `--check` goes on passing: the decks and their
       own record drift apart silently, which is the one failure this file exists to prevent. It also
       makes the pass idempotent for a note whose fix has been deleted outright. */
    /* AND SO IS EVERY SENSE TAG. `exSense` writes a small label into an example block — including into
       blocks this file did not create — so it has to be stripped from every note first, or a re-run
       stacks a second label and a tag removed from the record stays on the card. Same rule as the added
       examples above and for the same reason: this file is authoritative or it is drift. */
    if (String(fl.Examples || "").indexOf("uc-exsn") >= 0) {
      fl.Examples = String(fl.Examples).replace(/<span class="uc-exsn">[^<]*<\/span>/g, "");
      hits++;
    }
    if (String(fl.Examples || "").indexOf("uc-exadd") >= 0) {
      fl.Examples = String(fl.Examples).split('<div class="uc-exi').filter(Boolean)
        .map((x) => '<div class="uc-exi' + x).filter((x) => x.indexOf("uc-exadd") < 0).join("");
      hits++;
    }
    /* THE HINT IS APPLIED FIRST AND INDEPENDENTLY, so a note may take a hint and a sense rewrite in one
       pass. It is written as the card type's own `not X` block above the senses — the shape the 104
       pairs the decks already carry use — and is REPLACED rather than appended, so re-running cannot
       stack two of them. */
    const h = wantHint && wantHint.get(fl.Simplified);
    if (h) {
      seenHint.add(h.key);
      const body = String(fl.English || "").replace(/^<div class="uc-pos">not [^<]*<\/div>/, "");
      fl.English = '<div class="uc-pos">not ' + esc(h.other) + "</div>" + body;
      hits++;
    }
    const w = want && want.get(fl.Simplified);
    if (!w) continue;
    seen.add(w.key);
    let fix = w.fix;
    /* THE FIELDS THIS RECORD MAY SET, BY NAME. A whitelist rather than "copy every key", because the
       record also carries `why`, `senses`, `mw`, `ex` and the rest, which are compact forms this file
       EXPANDS rather than values to be written through. A field added to the deck's type (see
       `decks.addFields`) has to be named here too, or the column is created and never filled. */
    for (const k of ["Pinyin", "Bopomofo", "Say", "Measure word", "Literally", "Origin", "Examples", "Compounds"]) {
      if (fix[k] !== undefined) fl[k] = fix[k];
    }
    if (fix.ex || fix.dropEx) {
      let kept = String(fl.Examples || "").split('<div class="uc-exi').filter(Boolean)
        .map((x) => '<div class="uc-exi' + x);
      /* `dropEx` names Chinese sentences to REMOVE. It exists for the six cards that showed two
         near-identical sentences under one English translation — the reader sees the same example
         twice, which check-senses.js catches and a comparison of the CHINESE cannot. */
      if (fix.dropEx) {
        /* A `dropEx` THAT MATCHES NOTHING IS REPORTED BUT NOT AN ERROR, and the distinction is the
           whole of why: on the FIRST run a sentence it names should be there, and a mistyped one is a
           removal the record claims and never made — 白酒's three were transcribed by hand and matched
           nothing. On every run AFTER that the sentence is legitimately gone, because a dropped
           original cannot be restored without the generator. So it is a line to read when adding one,
           not a gate; `--check` deliberately ignores it. */
        fix.dropEx.forEach((z) => { if (!kept.some((b) => b.indexOf(z) >= 0)) badDrop.push(w.key + " → " + z); });
        kept = kept.filter((b) => !fix.dropEx.some((z) => b.indexOf(z) >= 0));
      }
      /* `dropEx` FILTERS THE RECORD'S OWN EXAMPLES TOO, not just the deck's. It began as a way to remove
         a sentence the generator had shipped, so it only ever filtered `kept` — and the moment a
         HARVESTED sentence turned out to be wrong (check-example-fit.js found dozens: 上火 illustrated
         inside 赶上火车, 人情 inside 一个人情) the drop appeared to do nothing, because the strip above
         removes the block and this list puts it straight back. Silent, and it reads as a `dropEx` that
         matched nothing. */
      const dropped = (fix.ex || []).filter(([zh]) => (fix.dropEx || []).some((z) => String(zh).indexOf(z) >= 0));
      if (dropped.length) fix.ex = (fix.ex || []).filter(([zh]) => !(fix.dropEx || []).some((z) => String(zh).indexOf(z) >= 0));
      const room = Math.max(0, 3 - kept.length);
      /* AN EXAMPLE MUST CONTAIN THE HEADWORD. A sentence that does not is a typo — a wrong character,
         or a batch row filed against the wrong note — and it renders perfectly: the card shows a
         sentence with nothing bolded in it and no reader can tell it from a sentence Folio chose. */
      (fix.ex || []).forEach(([zh, en]) => {
        if (String(zh).indexOf(fl.Simplified) < 0) badEx.push(w.key + " → " + zh);
        else if (!en || !String(en).trim()) badEx.push(w.key + " → no translation");
      });
      const add = (fix.ex || []).slice(0, room).map(([zh0, en]) => {
        /* THE RECORD'S OWN SENTENCES ARE REPUNCTUATED TOO, and they have to be: this file STRIPS and
           rebuilds every `uc-exadd` block, so a row it rebuilds would keep the ASCII marks the
           deck-level pass has just taken off every other card — which is how 14 of them survived the
           first run of that pass. */
        const zh = dm && dm.exPunct ? punctPlain(zh0) : zh0;
        const bold = zh.split(fl.Simplified).join("<b>" + fl.Simplified + "</b>");
        return '<div class="uc-exi uc-exadd"><div class="uc-exz">' +
          '<span class="uc-tts uc-exsay" data-say="' + esc(zh) + '"></span>' + bold + "</div>" +
          '<div class="uc-exe">' + esc(en) + "</div></div>";
      });
      fl.Examples = kept.join("") + add.join("");
    }
    /* ---------- REWRITING THE ENGLISH OF A SENTENCE THE DECK ALREADY SHIPS ----------
       `dropEx` plus a re-add of the SAME Chinese cannot do this, and fails silently: the drop filters
       the record's own `ex` rows as well as the deck's blocks (see the comment above it, which is
       right about why), so a row re-adding the sentence it has just dropped is thrown away and the
       card comes back with one example fewer. 手机 went from three sentences to one that way, with
       nothing reported. So the ordinary case — the Chinese is good and only its translation is wrong,
       which is what the thirteen over-colloquial renderings measured in an earlier batch all are — has
       a field of its own: `exEn` is `[[chinese, english]]`, matched on a SUBSTRING of the block's own
       Chinese and replacing that block's `uc-exe` div outright.
       IT IS THE SAME CLASS OF EDIT AS `dropEx` — a permanent mutation of a generator block that cannot
       be undone without the generator, which this repo has not got — and it is checkable where `dropEx`
       is not: the new English is re-asserted on every run, so a row matching nothing is always a typo
       rather than a repair already made, and it FAILS rather than being noted. */
    if (fix.exEn) {
      let blocks = String(fl.Examples || "").split('<div class="uc-exi').filter(Boolean)
        .map((x) => '<div class="uc-exi' + x);
      fix.exEn.forEach(([zh, en]) => {
        if (!en || !String(en).trim()) { badExEn.push(w.key + " → no translation for " + zh); return; }
        let hit = 0;
        blocks = blocks.map((b) => {
          if (b.indexOf(zh) < 0) return b;
          hit++;
          return b.replace(/<div class="uc-exe">[\s\S]*?<\/div>/, '<div class="uc-exe">' + esc(en) + "</div>");
        });
        if (!hit) badExEn.push(w.key + " → " + zh);
      });
      fl.Examples = blocks.join("");
    }
    /* ---------- ADDING A TERMINAL STOP TO A SENTENCE THE DECK ALREADY SHIPS ----------
       The deck-level punctuation pass converts marks and never adds one, so the sentences it left with
       no terminal mark at all are still bare. Where the sentence itself is good — and most are not,
       which is why this is a declared row per card rather than a sweep — the whole repair is the mark.
       Matched on `data-say` EXACTLY, so it can never catch a longer sentence containing this one, and
       written to `data-say` AND the visible text together: the spoken field carries its own copy of
       the Chinese, and a card that says one thing and shows another is the fault `check-say.js` exists
       for one directory over. Idempotent: a block already carrying the mark is a no-op. */
    if (fix.exStop) {
      let blocks = String(fl.Examples || "").split('<div class="uc-exi').filter(Boolean)
        .map((x) => '<div class="uc-exi' + x);
      fix.exStop.forEach((row) => {
        const zh = Array.isArray(row) ? row[0] : row;
        const mark = (Array.isArray(row) && row[1]) || "。";
        if (/[。！？…”]$/.test(zh)) { badExStop.push(w.key + " → already ends in a mark: " + zh); return; }
        let hit = 0, done = 0;
        blocks = blocks.map((b) => {
          const m = /data-say="([^"]*)"/.exec(b);
          if (!m) return b;
          if (m[1] === esc(zh + mark)) { done++; return b; }
          if (m[1] !== esc(zh)) return b;
          hit++;
          return b.replace('data-say="' + m[1] + '"', 'data-say="' + esc(zh + mark) + '"')
            .replace(/(<div class="uc-exz">[\s\S]*?)(<\/div>)/, "$1" + mark + "$2");
        });
        if (!hit && !done) badExStop.push(w.key + " → " + zh);
      });
      fl.Examples = blocks.join("");
    }
    /* ---------- THE SAME EDIT ONE DEGREE WIDER: STRAY WHITESPACE AND THE MARK BESIDE IT ----------
       `exSpace` is `[[shipped, fixed]]`, matched on `data-say` EXACTLY as `exStop` is, written to
       `data-say` and the visible text together, and idempotent — a block already carrying the fixed
       form is a no-op. It is a DECLARED LIST rather than a deck-level sweep because four of the
       twenty-four sentences it was written for want a COMMA where the space is rather than nothing,
       which is a judgement per sentence; the rest are mechanical and are declared beside them so one
       reading covers both. */
    if (fix.exSpace) {
      let blocks = String(fl.Examples || "").split('<div class="uc-exi').filter(Boolean)
        .map((x) => '<div class="uc-exi' + x);
      fix.exSpace.forEach(([was, now]) => {
        if (!now || zhSkeleton(was) !== zhSkeleton(now)) {
          badExSpace.push(w.key + " → changes more than spacing and punctuation: " + was); return;
        }
        let hit = 0, done = 0;
        blocks = blocks.map((b) => {
          const m = /data-say="([^"]*)"/.exec(b);
          if (!m) return b;
          if (m[1] === esc(now)) { done++; return b; }
          if (m[1] !== esc(was)) return b;
          const zd = /(<div class="uc-exz">)([\s\S]*?)(<\/div>)/.exec(b);
          if (!zd) { badExSpace.push(w.key + " → no visible text: " + was); return b; }
          const pre = /^(\s*<span class="uc-tts[^>]*><\/span>)?/.exec(zd[2])[0];
          const vis = rewriteZhVisible(zd[2].slice(pre.length), was, now);
          if (vis === null) { badExSpace.push(w.key + " → visible text does not match `data-say`: " + was); return b; }
          hit++;
          /* THE VISIBLE TEXT IS REPLACED FIRST, and that order is load-bearing: `zd[0]` was matched on
             the ORIGINAL block and carries the old `data-say` inside its own `uc-tts` span, so
             rewriting the attribute first leaves this replace with nothing to find — which fails
             SILENTLY, the spoken field moving while the words on the card stand still. */
          return b.replace(zd[0], () => zd[1] + pre + vis + zd[3])
            .replace('data-say="' + m[1] + '"', () => 'data-say="' + esc(now) + '"');
        });
        if (!hit && !done) badExSpace.push(w.key + " → " + was);
      });
      fl.Examples = blocks.join("");
    }
    /* ---------- AND ONE CHARACTER FOR ANOTHER, FROM THE DECLARED TABLE ----------
       `exVariant` is `[[shipped, fixed]]`, matched on `data-say` EXACTLY as `exSpace` is, written to
       the visible text and `data-say` together in that order, and idempotent. See `VARIANT_PAIRS`. */
    if (fix.exVariant) {
      let blocks = String(fl.Examples || "").split('<div class="uc-exi').filter(Boolean)
        .map((x) => '<div class="uc-exi' + x);
      fix.exVariant.forEach(([was, now]) => {
        const why = variantSwap(was, now);
        if (why) { badExVar.push(w.key + " → " + why + ": " + was); return; }
        let hit = 0, done = 0;
        blocks = blocks.map((b) => {
          const m = /data-say="([^"]*)"/.exec(b);
          if (!m) return b;
          if (m[1] === esc(now)) { done++; return b; }
          if (m[1] !== esc(was)) return b;
          const zd = /(<div class="uc-exz">)([\s\S]*?)(<\/div>)/.exec(b);
          if (!zd) { badExVar.push(w.key + " → no visible text: " + was); return b; }
          const pre = /^(\s*<span class="uc-tts[^>]*><\/span>)?/.exec(zd[2])[0];
          const vis = rewriteZhVisible(zd[2].slice(pre.length), was, now);
          if (vis === null) { badExVar.push(w.key + " → visible text does not match `data-say`: " + was); return b; }
          hit++;
          /* The visible text first, for the reason `exSpace` states: `zd[0]` carries the old
             `data-say` inside its own `uc-tts` span, so the attribute replace must come second. */
          return b.replace(zd[0], () => zd[1] + pre + vis + zd[3])
            .replace('data-say="' + m[1] + '"', () => 'data-say="' + esc(now) + '"');
        });
        if (!hit && !done) badExVar.push(w.key + " → " + was);
      });
      fl.Examples = blocks.join("");
    }
    if (fix.mw) {
      const bad = fix.mw.filter((ch) => !MW[ch]);
      if (bad.length) { badMW.push(w.key + " → " + bad.join(" ")); continue; }
      fl["Measure word"] = '<span class="uc-mwlab">measure word</span>' + fix.mw.map((ch) => {
        const [trad, pin] = MW[ch];
        return '<span class="uc-mwi"><span class="uc-mwc">' + ch + "</span>" +
          (trad ? '<span class="uc-mwc uc-mwt">' + trad + "</span>" : "") +
          '<span class="uc-mwp">' + pin + "</span></span>";
      }).join("");
    }
    /* ---------- THE OTHER WORDS BUILT ON A SINGLE-CHARACTER CARD'S CHARACTER (Sep 2026, on request) ----
       1,503 of the 11,532 notes are a single character, and a character is not learnt in isolation: what
       a reader wants next is the words it goes into. Tapping the character on a card already opens a
       panel (`openCharWin` / `charNeighbours` in app.js) — but that panel can only search the deck the
       reader has DOWNLOADED, and 639 of those 1,503 characters have no other word in their own deck at
       all, so for 42% of the cards it exists for it says "No other word in this deck uses it". This
       section is AUTHORED and is bounded by nothing but the language.

       IT IS WRITTEN COMPACTLY AND EXPANDED HERE, which is `mw`'s and `senses`' rule: a row is
       `[word, pinyin, gloss]` and the markup is built below, so the record stays readable and a reading
       can be checked against a dictionary without parsing HTML out of it. The headword character is
       BOLDED wherever it falls in the word, which is what the example sentences already do — it is how a
       reader sees the character doing different work in each row.

       A ROW MUST CONTAIN THE CARD'S OWN CHARACTER AND MUST NOT BE THE CARD'S OWN WORD. Both are faults
       that render perfectly: a row filed against the wrong note shows a word with nothing bolded in it,
       and a row repeating the headword teaches nothing while looking like a finished list. The applier
       has no dictionary, so it cannot check a reading — that stays an authoring job, and the `why` says
       against what it was checked. */
    if (fix.compounds) {
      const bad = fix.compounds.filter((r) => !Array.isArray(r) || r.length !== 3 ||
        String(r[0]).indexOf(fl.Simplified) < 0 || String(r[0]) === fl.Simplified ||
        !String(r[1]).trim() || !String(r[2]).trim());
      if (bad.length) badCmp.push(w.key + " → " + bad.map((r) => (Array.isArray(r) ? r[0] : String(r))).join(" "));
      else fl.Compounds = '<span class="uc-cmplab">built on this character</span>' +
        fix.compounds.map(([word, pin, gloss]) =>
          '<div class="uc-cmpi"><span class="uc-cmpw">' +
          esc(word).split(esc(fl.Simplified)).join("<b>" + esc(fl.Simplified) + "</b>") + "</span>" +
          '<span class="uc-cmpp">' + esc(pin) + "</span>" +
          '<span class="uc-cmpg">' + esc(gloss) + "</span></div>").join("");
    }
    /* `gloss` is `senses` for the common case: ONE sense whose wording changes and whose part of speech
       does not. It exists because the disambiguation pass rewrites 857 glosses and nothing else about
       those cards, and restating each one's part of speech in the record would be 857 chances to get it
       wrong — the card already knows it. A note with several senses must use `senses`, and asking for
       `gloss` on one is refused rather than silently flattening it. */
    if (fix.gloss !== undefined || fix.glossAll !== undefined) {
      const ss = String(fl.English || "").match(/<div class="uc-sense">[\s\S]*?<\/div>/g) || [];
      const m = /<i class="uc-pos">([^<]*)<\/i>/.exec(ss[0] || "");
      /* `gloss` insists on ONE sense: rewording a note that has several would have to guess which one
         it replaces. `glossAll` says outright "replace all of them with this", which is what the idiom
         pass needs — the decks split a run-on definition into four `uc-sense` divs, so "tight-lipped /
         reticent / not breathing a word" is three senses of one meaning rather than three meanings. */
      if (fix.gloss !== undefined && ss.length !== 1) { badGloss.push(w.key + " (" + ss.length + " senses)"); continue; }
      const text = fix.gloss !== undefined ? fix.gloss : fix.glossAll;
      // an idiom carries no part of speech at all, and a sense of one element renders without one
      fix = Object.assign({}, fix, { senses: [m ? [m[1], text] : [text]] });
    }
    if (fix.senses) {
      const r = renderSenses(fix.senses);
      /* A NOTE GIVEN ITS OWN DISTINGUISHING GLOSS NO LONGER NEEDS A HINT, so the `not X` block goes with
         the gloss it was compensating for. Leaving it would point at a word that no longer shares this
         note's meaning — a disambiguator disambiguating nothing, which is worse than none, since a
         reader reads it as a real distinction. `hints` is regenerated from the finished decks, so a
         note that still collides gets its block back on the next pass. */
      fl.English = r.html;
      c.answerText = r.ans;
    }
    /* ---------- WHICH SENSE AN EXAMPLE IS SHOWING (Sep 2026, on request) ----------
       A note with two real senses shows up to three sentences and never says which sense each one is
       for, so a reader meeting 天 as both "sky" and "day" has to work the mapping out themselves.
       `exSense` is a list of sense NUMBERS, one per example block in the order they are rendered, and a
       0 leaves a block untagged — which is what a sentence that shows both, or neither, gets.

       IT IS APPLIED ONLY WHERE THE SENSES ARE REALLY DIFFERENT, and that is a judgement rather than a
       rule: measured over the nine decks, 204 notes carry two or more senses AND two or more examples,
       and most of those "senses" are a dictionary's near-synonym list (没错 has five, all of them "that's
       right"). Tagging a sentence as sense 3 of 5 synonyms is noise dressed as information, so the
       record names the notes rather than the applier sweeping them.

       IT RUNS AFTER `senses`, and that ordering is load-bearing: a note whose senses this same record
       SPLITS is exactly the note worth tagging, and read before the split it counts the senses the
       deck shipped with — which is how 道's third sense tripped its own guard on the first run. */
    if (fix.exSense) {
      const blocks = String(fl.Examples || "").split('<div class="uc-exi').filter(Boolean)
        .map((x) => '<div class="uc-exi' + x);
      const senses = (String(fl.English || "").match(/<div class="uc-sense">/g) || []).length;
      fix.exSense.forEach((nsense, i) => {
        if (!nsense || !blocks[i]) return;
        if (nsense > senses) { badSense.push(w.key + " → example " + (i + 1) + " names sense " + nsense + " of " + senses); return; }
        blocks[i] = blocks[i].replace('<div class="uc-exz">',
          '<div class="uc-exz"><span class="uc-exsn">' + nsense + "</span>");
      });
      if (fix.exSense.length > blocks.length) badSense.push(w.key + " → " + fix.exSense.length + " sense tags for " + blocks.length + " examples");
      fl.Examples = blocks.join("");
      hits++;
    }
    /* THE MIRRORS ARE REBUILT, NEVER PATCHED — see the header. `answer` is "<pinyin> — <senses>" and
       `answerText` the senses alone, which is what the 11,532 untouched notes already are. */
    const gl = c.answerText || "";
    c.pinyin = fl.Pinyin;
    c.answer = fl.Pinyin + " — " + gl;
    c.question = fl.Traditional && fl.Traditional !== fl.Simplified
      ? fl.Simplified + " / " + fl.Traditional : fl.Simplified;
    c.traditional = fl.Traditional || "";
    c.hanzi = fl.Simplified;
    hits++;
  }
  /* ---------- THE BRITISH-SPELLING PASS ----------
     A deck-level pass, like `exPunct`, and for the same reason: a mechanical substitution belongs in
     ONE place where it cannot be applied to 400 cards and forgotten on the 401st. It is deliberately
     the LAST thing this file does to a deck, so that the record's OWN `ex` and `exEn` rows are swept
     with everything else — an American spelling typed into a `why`-documented repair is exactly as
     stuck as one the generator shipped.
     THE MIRRORS ARE RE-DERIVED RATHER THAN SWEPT. `c.answerText` is the senses as plain text and
     `c.answer` is "<pinyin> — <senses>"; converting `answer` directly would run an English word list
     over a romanisation for no reason, so the senses are swept once and the two mirrors rebuilt from
     the result, which is what the per-note branch above does. */
  /* ---------- THE AMERICAN-WORD-CHOICE PASS ----------
     Runs immediately BEFORE the spelling pass, on the same three targets and by the same rules, so a
     British word this table introduces is still swept for spelling afterwards and the record's own
     `ex`, `exEn` and `gloss` rows are swept by both. */
  if (dm && dm.exLexis) for (const c of d.cards || []) {
    const fl = c.fields; if (!fl) continue;
    const en = lexText(fl.English), ex = lexExamples(fl.Examples), ans = lexText(c.answerText || "");
    if (en === fl.English && ex === fl.Examples && ans === (c.answerText || "")) continue;
    fl.English = en; fl.Examples = ex; c.answerText = ans;
    c.answer = fl.Pinyin + " \u2014 " + ans;
    hitsLex++;
  }
  if (dm && dm.exBritish) for (const c of d.cards || []) {
    const fl = c.fields; if (!fl) continue;
    const en = britText(fl.English), ex = britExamples(fl.Examples), ans = britText(c.answerText || "");
    if (en === fl.English && ex === fl.Examples && ans === (c.answerText || "")) continue;
    fl.English = en; fl.Examples = ex; c.answerText = ans;
    c.answer = fl.Pinyin + " — " + ans;
    hitsBrit++;
  }
  const after = JSON.stringify(d);
  if (after !== before) {
    if (!CHECK) fs.writeFileSync(p, after);
    changed += hits; files++;
    if (VERBOSE || CHECK) console.log((CHECK ? "  WOULD CHANGE " : "  updated ") + f + "  (" + hits + " notes matched)");
  } else if (VERBOSE) console.log("  unchanged " + f + "  (" + hits + " notes already at the fix)");
}
for (const [key] of entries) if (!seen.has(key)) missing.push(key);
for (const [key] of hints) if (!seenHint.has(key)) missing.push(key + " (hint)");

if (hitsPunct) console.log("\n  " + hitsPunct + " example block set(s) repunctuated (ASCII marks after a Chinese character)");
if (hitsLex) console.log("  " + hitsLex + " card(s) put into British word choices from the declared LEXIS table");
if (hitsBrit) console.log("  " + hitsBrit + " card(s) put into British spelling from app.js's own SPELL_PAIRS");
console.log("\n" + entries.length + " fixes, " + hints.length + " reverse-card hints and " +
  (Object.keys(deckMeta).length - (deckMeta.why ? 1 : 0)) + " deck-metadata edits in mandarin-fixes.json, " +
  (seen.size + seenHint.size) + " matched a note, " + metaHit + " matched a deck");
/* A FIX THAT MATCHES NOTHING IS AN ERROR, NOT A NO-OP. It means the headword was mistyped or the deck id
   is wrong, and the correction the record claims to have made has simply not been made — which reads,
   from the file, exactly like one that has. */
if (badDrop.length && VERBOSE) {
  console.log("\n  note  " + badDrop.length + " `dropEx` sentence(s) already gone (expected after the first run;" +
    " on a NEW one, check for a typo):");
  badDrop.forEach((k) => console.log("        " + k));
}
/* A tag naming a sense the note has not got is the shape a hand pass produces when a note's senses are
   later merged or split under it — the label renders perfectly and points at nothing. */
if (badSense.length) {
  console.log("\n  FAIL  " + badSense.length + " sense tag(s) that point at a sense the note has not got:");
  badSense.forEach((k) => console.log("        " + k));
  process.exit(1);
}
/* A compound row that does not contain the card's own character is a row filed against the wrong note,
   and one that IS the card's own word is a list that teaches nothing — both render perfectly. */
if (badCmp.length) {
  console.log("\n  FAIL  " + badCmp.length + " `compounds` row(s) that do not contain the headword, or repeat it:");
  badCmp.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (badExVar.length) {
  console.log("\n  FAIL  " + badExVar.length + " `exVariant` row(s) naming a sentence the note has not got," +
    " or a swap that is not one declared character for another:");
  badExVar.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (badExSpace.length) {
  console.log("\n  FAIL  " + badExSpace.length + " `exSpace` row(s) naming a sentence the note has not got," +
    " or changing more than its spacing:");
  badExSpace.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (badExStop.length) {
  console.log("\n  FAIL  " + badExStop.length + " `exStop` row(s) naming a sentence the note has not got," +
    " or one that already ends in a mark:");
  badExStop.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (badExEn.length) {
  console.log("\n  FAIL  " + badExEn.length + " `exEn` row(s) naming a sentence the note has not got:");
  badExEn.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (badEx.length) {
  console.log("\n  FAIL  " + badEx.length + " example(s) that do not contain their own headword:");
  badEx.forEach((k) => console.log("        " + k));
  process.exit(1);
}
/* A measure word the decks have never used is refused rather than rendered from a guess at its pinyin. */
if (badMW.length) {
  console.log("\n  FAIL  " + badMW.length + " `mw` fix(es) naming a character the corpus has no measure word for:");
  badMW.forEach((k) => console.log("        " + k));
  process.exit(1);
}
/* A `gloss` on a multi-sense note would have to guess which sense it replaces, so it is refused. */
if (badGloss.length) {
  console.log("\n  FAIL  " + badGloss.length + " `gloss` fix(es) on a note that has not exactly one sense — use `senses`:");
  badGloss.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (missing.length) {
  console.log("\n  FAIL  " + missing.length + " fix(es) matched no note:");
  missing.forEach((k) => console.log("        " + k));
  process.exit(1);
}
if (CHECK) {
  if (files) { console.log("\n  FAIL  the decks do not carry their fixes — run without --check"); process.exit(1); }
  console.log("  ok    every deck already carries its fixes");
} else console.log(files ? "  " + changed + " notes written across " + files + " file(s)" : "  nothing to do");
