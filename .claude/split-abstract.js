/* Split a prehistory abstract into its 2 blocks of 5 sentences, in any of the ten languages, and
   splice footnote markers in by sentence index.

   Each returned sentence keeps its own trailing whitespace, so join("") reconstructs the block byte
   for byte — which matters for zh/ja, where sentences are NOT separated by a space.

   Guards accumulated by the batches before this one: decimals (2.6), grouped numerals, the era
   abbreviations (v. Chr., a. C., av. J.-C., н. э.), initials (J. J. A.), a day-ordinal before a month
   name, and — added in batch 17 — a bare ordinal before "Jahrhundert" and the CJK full stop, which
   carries no following space at all.

   KNOWN LIMIT, and the one to write around rather than fix: **a sentence that ENDS on an era
   abbreviation has no terminator left** once the abbreviation is held, so it merges with the sentence
   after it. "…hacia el 9000 a. C." and "…vers 9000 av. J.-C." both did exactly that in batch 17c, and
   the counts came back 4+5. The ambiguity is real — "…5300 a. C. y Ertebølle" is genuinely mid-sentence
   — so the rule for authors is simply: **do not end a sentence on the era abbreviation**; put the date
   earlier and close on ordinary words. The 5+5 assertion after marking is what catches it. */
const MONTHS = "Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|January|February|March|May|June|July";
const OPEN = "⸤", CLOSE = "⸥";   // sentinels that never occur in the data

function pieces(block) {
  let t = block;
  const held = [];
  const hold = (re) => { t = t.replace(re, (m) => { held.push(m); return OPEN + (held.length - 1) + CLOSE; }); };
  hold(/\d+[.,]\d+/g);                                     // decimals / grouped numbers
  hold(/\b(?:v|n)\.\s?Chr\./g);                             // German BCE / CE
  hold(/\ba\.\s?C\./g);                                     // Spanish / Italian BCE
  hold(/\bav\.\s?J\.-?C\./g);                               // French BCE
  hold(/\bapr\.\s?J\.-?C\./g);
  hold(/\bd\.\s?C\./g);
  hold(/н\.\s?э\./g);                                       // Russian н. э. (no \b — it is ASCII-only in JS)
  // Initials, as a WHOLE RUN. Holding each one only when another follows (the old rule) left the LAST
  // initial of the run exposed, so "R. P. Soejono" and "Frank H. H. Roberts" both broke a sentence in
  // half in every Latin language — silently, and in English, where nothing else was watching.
  // ...and in EVERY script the deck is written in, not just Latin: the same name breaks Russian on
  // "Р. П." and Arabic on "ر. ب.", and an ASCII-only class cannot see either. Arabic has no case, so
  // it needs its own clause — a single Arabic letter standing alone before a full stop.
  hold(/(?<=^|[\s(«"'([])(?:\p{Lu}\.\s?){2,}/gu);
  hold(/(?<=^|[\s(«"'([])(?:[ء-ي]\.\s?){2,}/g);
  // A LONE initial before a given name — "the archaeologist V. Gordon Childe", which the {2,} run rule
  // above cannot see because there is only one. It split the Neolithic Revolution term after the "V." in
  // English and in five translations. Narrow on purpose: the following word must be a capitalised word of
  // at least two letters, so a real sentence boundary is only ever swallowed when the previous sentence
  // ended on a single capital letter — which no prose in this project does.
  // ...and the capitalised word may itself OPEN on a capital-apostrophe prefix — "Joseph P. O'Neill",
  // "Marie C. D'Arcy" — where the letter after the capital is an apostrophe rather than a letter, so the
  // test above fails and the name splits after the initial. Found on the Asmara card, whose chargé
  // d'affaires is Joseph P. O'Neill. The guarantee is unchanged: a real boundary is only swallowed when
  // the previous sentence ended on a single capital letter, which no prose in this project does.
  hold(/(?<=^|[\s(«"'([])\p{Lu}\.\s(?=\p{Lu}(?:\p{L}|['\u2019]\p{Lu}))/gu);
  // The Arabic of the same thing. Arabic has no case, so the "followed by a capital" test above cannot
  // carry over; a lone Arabic letter standing between whitespace and a full stop is an initial for the
  // same reason — no Arabic sentence ends on one. "عالم الآثار ف. غوردون تشايلد" and "جيسون إ. لويس".
  hold(/(?<=^|[\s(«"'([])[ء-ي]\.\s(?=[ء-ي])/g);
  // An ABBREVIATED GENUS in a binomial — "S. fatalis", "H. sapiens", "A. afarensis". The two rules above
  // cannot see it: the run rule needs a second initial, and the lone-initial rule requires a CAPITALISED
  // word to follow, where a species epithet is always lowercase. It split the Smilodon term into SIX
  // sentences, in English, and it is the shape every taxon term is written in. The test is exact: a
  // sentence boundary is always followed by a capital, so a single capital letter, a full stop and a
  // LOWERCASE word can only ever be an abbreviated genus.
  hold(/(?<=^|[\s>(«"'‘\[])\p{Lu}\.\s(?=\p{Ll})/gu);
  // A TAXONOMIC RANK inside a binomial — "Zea mays ssp. parviglumis", "Panicum miliaceum subsp.
  // ruderale". The abbreviated-genus rule above cannot see these: it wants a single CAPITAL before the
  // full stop, where a rank abbreviation is lowercase. It split the maize card after "ssp." and would
  // split any card naming a subspecies. The test is the genus rule's: what follows a real sentence
  // boundary is always a capital, so a rank abbreviation followed by a LOWERCASE word is mid-binomial.
  // Keeping the lookahead is what lets "…of the genus Oryza spp. The next…" still break correctly.
  // The lookahead has to step over an opening TAG, because the epithet is italicised and the rank
  // usually is not — "<i>Zea mays</i> ssp. <i>parviglumis</i>" is the shape a binomial is written in
  // here, and a lookahead anchored straight to a letter matches none of them. (The genus rule above
  // carries the same blind spot on its lookahead; nothing in the corpus writes "H. <i>sapiens</i>" yet.)
  hold(/\b(?:ssp|subsp|var|cf|aff|sp|spp)\.\s(?=(?:<[^>]*>)*\p{Ll})/gu);
  // "Ste" is the French feminine of "St" and is the shape a scholar's surname is written in — G. E. M. de
  // Ste. Croix, cited across the Greek cards — so a card naming him split at the stop with the two halves
  // both reading as sentences. Same family as the honorifics beside it, and no sentence ends on any of them.
  hold(/\b(?:Jr|Sr|Dr|Prof|Mr|Mrs|Ms|St|Ste|Mt)\.\s?/g);
  // "Helena City Lodge No. 10" — an abbreviation whose test is what FOLLOWS rather than what precedes it:
  // a sentence boundary in this corpus is never followed by a bare numeral, and no sentence ends on the
  // word "No". It split the Helena card's first block into six. The digit in the lookahead is what makes
  // it safe, so keep it: "…said no. The next…" still breaks correctly.
  hold(/\bNos?\.\s(?=\d)/g);    // "Roberts Jr. used the name in 1940"
  // The LEGAL "v." of a case name — "Shelley v. Kraemer", "Brown v. Board of Education". Every rule above
  // it wants either a capital before the stop or a lowercase word after it, and a case citation is the one
  // shape with a LOWERCASE abbreviation between two CAPITALISED names; it split the Missouri card after
  // "Shelley v." and would split any card naming a Supreme Court decision. Narrow on purpose: the
  // abbreviation must sit between a capitalised word and a capitalised word, which no sentence boundary
  // in this project does — nothing here ends a sentence on a bare "v.". The digit-led German era
  // abbreviation ("1000 v. Chr.") is untouched, its "v." following a NUMBER rather than a name.
  hold(/(?<=\p{Lu}\p{L}+\s)vs?\.\s(?=\p{Lu})/gu);
  hold(new RegExp("\\d{1,2}\\.\\s(?=(?:" + MONTHS + "))", "g"));   // "25. August"
  hold(/\d{1,2}\.\s(?=Jahrhundert|Jh\.)/g);                 // "im frühen 19. Jahrhundert"
  // A German ordinal before any capitalised noun — "ab 1900 der 1. Baron Avebury", which split the
  // Lubbock term in half. The two clauses above name the nouns they guard and so cannot generalise; a
  // preceding DETERMINER can, because a sentence never ends on "der" and a number after one is always an
  // ordinal. Narrow on purpose: it must not swallow "…kam 1892. Der Bau begann…", where nothing precedes.
  hold(/(?<=\b(?:der|die|das|dem|den|des|ein|eine|einem|einen|eines|als|zum|zur|vom|beim|im)\s)\d{1,2}\.\s/g);
  // A REGNAL ordinal — "König Leopold II. von Belgien", "Moshoeshoe I. in den 1820er Jahren". German
  // writes a monarch's number as a Roman numeral with a trailing period, so every German translation
  // naming a monarch splits at the number; the two clauses above cannot see it, since a Roman numeral
  // is not \d and no determiner precedes it. Narrow on purpose: the numeral must follow a capitalised
  // NAME and be followed by a LOWERCASE word — which is what tells a mid-sentence regnal number from a
  // sentence that genuinely ends on one ("…the reign of Henry VIII. The next…" is left alone).
  hold(/(?<=\p{Lu}\p{L}+\s)[IVXLC]{1,6}\.\s(?=\p{Ll})/gu);
  // A sentence ends at .!? followed by whitespace, or at a CJK terminator with or without one — and a
  // footnote marker may already sit between the two, since a top-up batch re-splits an abstract that an
  // earlier batch has already marked. Without the FN clause the splitter silently returns one sentence.
  const FN = '(?:<sup class="fn"[^>]*></sup>)*';
  // the lookahead must also refuse to break immediately BEFORE a marker: in zh/ja the marker follows the
  // full stop with no space, so a bare "not whitespace" guard splits the marker off as its own sentence
  // the CJK terminator takes an OPTIONAL following space: it carries none in well-set Chinese, but a
  // dozen zh abstracts (and four ja) were written with one, and without the `\s?` the splitter returns
  // the whole block as a single sentence — silently, which is the failure mode markers must not meet
  // A quotation that closes MID-SENTENCE, which is what the clause below would otherwise break on:
  // «…to ask 'Then who was king?' twice over, and answering with…» carries a terminator inside the
  // quotation and the sentence runs on past it. The test is the one the genus and regnal rules use —
  // what follows a real sentence boundary is always a capital — so a closing quote followed by a
  // LOWERCASE word is a quotation inside a sentence. Held before the terminator clause widens, or
  // `wh-185` splits into six.
  hold(/[.!?؟][’”»›'"]\s(?=\p{Ll})/gu);
  // A sentence may CLOSE ON A QUOTATION — «…we are of this land.’ By the mid-1800s…» — and the
  // terminator then has a closing quote between it and the space, which the lookbehind above could not
  // see, so the quoted sentence merged with the one after it and the block came back 4+5. The house
  // style quotes a word-as-a-word in single curly quotes and a passage in doubles, and the other
  // languages close with » or 」, so the class holds all of them. It is safe because it is additive:
  // the pattern occurs ZERO times in the shipped corpus, so no existing split can change, and a
  // closing quote sitting immediately after a full stop is a quotation ending a sentence in any of the
  // ten languages — nothing here writes a mid-sentence quotation that closes on its own full stop.
  const QC = '[’”»›」』\'"]?';
  const parts = t.split(new RegExp('(?<=[.!?؟]' + QC + FN + '\\s|[。！？]' + QC + FN + '\\s?)(?!\\s|<sup class="fn")'));
  const restore = (s) => s.replace(new RegExp(OPEN + "(\\d+)" + CLOSE, "g"), (_, i) => held[+i]);
  return parts.filter((s) => s.length).map(restore);
}
function blocks(abstract) {
  const m = abstract.split(/(\s*<br><br>\s*)/);
  return { parts: m.filter((_, i) => i % 2 === 0), seps: m.filter((_, i) => i % 2 === 1) };
}
/* mark(abstract, { 1: [2], 4: [1,2], … }) — sentence index (1-based across both blocks) -> source numbers */
function mark(abstract, map, replace) {
  const { parts, seps } = blocks(abstract);
  let n = 0;
  const out = parts.map((b) => pieces(b).map((s) => {
    n++;
    let body = s, tail = "";
    const mt = /\s+$/.exec(body); if (mt) { tail = mt[0]; body = body.slice(0, -tail.length); }
    if (replace && replace[n] != null) body = replace[n];
    const fns = map[n] || [];
    return body + fns.map((f) => '<sup class="fn" data-fn="' + f + '"></sup>').join("") + tail;
  }).join(""));
  return out.reduce((acc, b, i) => acc + b + (seps[i] || ""), "");
}
function count(abstract) {
  return blocks(abstract).parts.map((b) => pieces(b).length);
}
module.exports = { pieces, blocks, mark, count };

/* CLI: `node .claude/split-abstract.js wh-006 wh-007` reports each card's sentence counts in all ten
   languages and whether the split round-trips byte for byte. Run it BEFORE placing markers by sentence
   index — a language that does not run 5+5 maps markers onto the wrong claims, silently. */
if (require.main === module) {
  const path = require("path");
  const g = global; g.window = {};
  require(path.join(__dirname, "..", "data.js"));
  const LANGS = ["en", "es", "fr", "de", "it", "nl", "ru", "ar", "zh", "ja"];
  const ids = process.argv.slice(2);
  if (!ids.length) { console.error("usage: node .claude/split-abstract.js <cardId> [cardId …]"); process.exit(1); }
  let bad = 0;
  for (const id of ids) {
    const c = (g.window.CARD_DATA || []).find((x) => x.id === id);
    if (!c) { console.error("no card " + id); bad++; continue; }
    console.log("=== " + id);
    for (const l of LANGS) {
      const a = l === "en" ? c.abstract : (c.i18n && c.i18n[l] || {}).abstract;
      if (!a) { console.log("  " + l.padEnd(3) + " (no translation)"); continue; }
      const counts = count(a), ok = counts.join("+") === "5+5", rt = mark(a, {}) === a;
      if (!ok || !rt) bad++;
      console.log("  " + l.padEnd(3) + " " + counts.join("+") + (ok ? "" : "  <<< NOT 5+5") + (rt ? "  exact" : "  <<< ROUNDTRIP FAIL"));
      if (!ok) blocks(a).parts.forEach((b, bi) => pieces(b).forEach((s, i) => console.log("      [" + (bi * 5 + i + 1) + "] " + s.trim().slice(0, 110))));
    }
  }
  process.exit(bad ? 1 : 0);
}
