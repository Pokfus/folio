/* WHICH CC-CEDICT ENTRIES ARE PHRASES, AND WHICH ARE IDIOMS. Shared by the two builders so the decks
   cannot come to overlap or to disagree about what they are for, and kept apart from them so the rule can
   be read without the markup around it.

   Nothing here is a list of favourites. The candidates are CC-CEDICT's own entries; whether an entry is an
   IDIOM is CC-CEDICT's own judgement, written in the gloss as "(idiom)"; and how common it is comes from
   two real corpora, both measured rather than guessed:

     · OpenSubtitles 2018, via hermitdave/FrequencyWords (CC BY-SA 4.0) — 766,612 word forms with their
       counts. It is SEGMENTED, so it counts a four-character idiom, which every segmenter treats as one
       token, and cannot see a free phrase like 对我来说, which it splits into three.
     · Tatoeba's Mandarin–English pairs, the corpus the example sentences come from. It counts a phrase by
       looking for it in running text, so it sees exactly what the frequency list cannot — at a hundredth
       of the size.

   The two therefore do different jobs and neither replaces the other: the idioms are ranked on the first
   and the phrases have to satisfy either. */

const HAN = /[一-鿿]/;

/* An entry marked (old), (archaic), (dialect) or (Tw) is not what "common phrases and expressions" means,
   however often it is written: 我等 for "we" is Literary Chinese and 阿拉 is Shanghainese. A NEOLOGISM is
   excluded on the same ground — CC-CEDICT dates several to a particular year, and a 2014 internet coinage
   is not a phrase to teach. Slang is deliberately KEPT: 哥们 is how people talk. */
const REGISTER_OUT = /\((old|archaic|literary|dialect|Wu dialect|Cantonese|Hokkien|Tw|Taiwan|neologism|obsolete|erhua variant|variant of|abbr\. for)/i;

/* A PHRASE IS NOT A WORD, and the test is on the FIRST sense alone. Testing every sense lets a lexical item
   in on a marginal one: 奶油 is "cream" and carries "(coll.) effeminate" third, 礼拜 is "to attend a
   religious service" and carries "(coll.) Sunday". A first sense opening "to …", "a …" or "the …" is a
   verb or a noun and is a word however conversational its other senses are. */
const LEXICAL = /^(?:\([^)]*\)\s*)*(to |a |an |the )/i;

/* THE PRONOUN TEST IS CASE-SENSITIVE, and that is not fussiness. Run case-blind it matched the "US" in
   "United States; USA; US" and the "i" in "i.e.", so 美国, 美元, 夏威夷, 阿拉斯加 and 二次 all came through
   as conversational formulas. English capitalises exactly one pronoun and it is the one this needs.

   AND A BARE "I" HAS TO BE FOLLOWED BY A VERB, or the Roman numeral answers it: "World War I (1914–1918)"
   brought 一战 in as a conversational formula. So the pronoun is matched as "I'm/I've/I'd/I'll" or as "I"
   with a lowercase word after it, which is what a pronoun does and what a numeral does not. */
const PRONOUN = /(\bI '?(?:m|ve|d|ll)\b|\bI'(?:m|ve|d|ll)\b|\bI [a-z]|\bme\b|\bmy\b|\bwe\b|\bus\b|\bour\b|\byou\b|\byour\b|\byourself\b|it's|that's|there's|don't|doesn't|isn't|won't|can't)/;

const senses = (e) => e.senses.join("; ");
const isIdiom = (e) => e.senses.some((s) => /\(idiom/.test(s));
const multi = (e) => [...e.simp].length >= 2 && [...e.simp].every((c) => HAN.test(c));

/* A CORPUS OF FILM SUBTITLES IS FOUL-MOUTHED, and ranking on it puts 他妈的 third. CC-CEDICT marks most of
   these itself; where it does not, the English gloss says it in plain words, so a short list of those words
   is the rest of the rule. This is a bar on what a study deck should TEACH FIRST and not a judgement that
   the words are unimportant — a learner will meet them, and CC-CEDICT is a click away. */
const COARSE = /\((taboo|vulgar|derog\.|derogatory|offensive|obscene)|\b(fuck|fucking|shit|bitch|bastard|cunt|prick|testicles|penis|whore|slut)\b/i;

/* A sense that could only be SAID rather than looked up: it exclaims, it asks, or it has somebody in it. */
const formulaSense = (s) => /[!?]$/.test(s) || PRONOUN.test(s);

/* LENGTH DOES NOT TELL A FORMULA FROM A WORD, and this is the measurement that decided the deck's size.
   The two-character glosses are the hard case — "cream", "dude", "rookie", "maternal aunt" are words, and
   "no problem" is not, and no test on the English separates them, all four being short, verbless and
   article-less. So the obvious rule was tried: a two-character headword is overwhelmingly a WORD, a
   three-character one is more often a construction (好久不見, 沒問題, 太好了, 對我來說), so admit anything
   from three characters up whose first sense is not plainly lexical. **It went from 472 candidates to
   37,681.** Chinese has an enormous stock of three-character NOUNS, and they came in by the thousand:
   意大利, 洛杉磯, 科學家, 陌生人, 年輕人, 弗蘭克, 詹姆斯, LeBron James. The premise was simply false.

   So the rule stays strict, and its recall is stated rather than guessed at. Against a probe list of
   thirty-six expressions a beginner meets: 24 are already carded in the HSK decks — which is the brief's
   own point, since the syllabus covers the common formulas — 5 are not in CC-CEDICT at all, 2 are idioms,
   and of the remaining 5 this rule takes 4 (一路平安, 恭喜發財, 請多關照, 慢走) and misses 好久不見, 沒問題
   and 太好了, each a complete utterance whose gloss is two or three words with nothing in it to say so. A
   deck that is precise and says what it misses beats one that is large and has Los Angeles in it. */
function isPhrase(e) {
  const all = senses(e);
  if (REGISTER_OUT.test(all) || COARSE.test(all)) return false;
  const s = String(e.senses[0] || "").trim();
  if (!s) return false;
  /* A first sense reading "to …" / "a …" / "the …" is a verb or a noun — unless a LATER sense exclaims or
     names somebody, which is 一路平安's "to have a pleasant journey; Bon voyage!" and is a pure gain. */
  if (LEXICAL.test(s)) return e.senses.slice(1).some(formulaSense);
  return formulaSense(s);
}

module.exports = { HAN, isIdiom, isPhrase, multi, senses, REGISTER_OUT, LEXICAL, PRONOUN };
