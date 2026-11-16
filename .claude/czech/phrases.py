#!/usr/bin/env python3
"""Stage 2 for the phrases deck: Czech set phrases, idioms and proverbs.

    python3 .claude/czech/phrases.py          (run.py --level phr runs it in place of select.py)

Writes `.claude/czech-cache/wordlist-phr.json` in the shape `select.py` writes for a level, with one more
field per word, `sub`.

NOT A CEFR LEVEL: an expression is a unit a frequency list of words cannot see, which is why the level decks
teach so few of them.  Four subdecks, the Indonesian, Turkish and Hindi arrangement (`docs/lang-decks.md`,
"THE PHRASES DECK"):

  Phrases   an entry of more than one word that Wiktionary files as a phrase or an interjection and does NOT
            tag idiomatic -- mostly the everyday formulas;
  Idioms    an entry of more than one word with a taught sense Wiktionary TAGS idiomatic, of any part of
            speech (`mít máslo na hlavě`, `čas od času`);
  Expressions  a multi-word adverb, verb, preposition or conjunction not tagged idiomatic (Czech only: see
            `EXPRESSION_POS`);
  Proverbs  Wiktionary's part of speech `proverb`.
One subdeck per expression: a proverb outranks an idiom outranks an expression or a phrase.

WHICH ONES.  Wiktionary carries far more multi-word Czech entries of those kinds than a deck -- far more than a deck
-- so an expression is taken when it OCCURS: in at least one of Tatoeba's Czech sentences (MIN_HITS),
counted the way `examples.py` matches it for this deck (an idiom that is a verb with its verb in any form:
`mít v hlavě` is found in `má v hlavě`).  That is the test of being in use that a word
deck gets from its frequency list.  A proverb is kept on one sentence too; Tatoeba is where Czech proverbs
are most often written down whole.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`cs_level.taught_below`), every sense goes through the level
decks' filter (`cs.gloss`: no vulgar, dated, regional … sense makes an expression), and `EXCLUDE` names the
rest, each with its reason.

THE ORDER, within each subdeck: how many Tatoeba sentences contain the expression, then its spelling.
"""
import argparse, json, os, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cs, cs_level, examples

ORDER = ["Phrases", "Expressions", "Idioms", "Proverbs"]
PHRASE_POS = {"phrase", "intj"}
# THE EXPRESSIONS SUBDECK (Czech, 2026-11-16; Irish's arrangement): Czech Wiktionary tags few senses idiomatic
# (132, against Polish's thousands), but carries some 220 multi-word adverbs, verbs, prepositions and conjunctions
# -- fixed adverbials, verb phrases, compound prepositions -- that a list of single words cannot teach either.
# Multi-word nouns and adjectives (2,500, `hlavní město`) are compound terms, not expressions, and stay out.
EXPRESSION_POS = {"adv", "verb", "prep", "conj", "prep_phrase", "particle"}
MIN_HITS = 1

# Never taught, whatever the source says.  Each line says why (filled by reading the deck).
PHRASEBOOK = "a phrasebook sentence built from level words, not a set phrase (the Turkish and Hindi rule)"
LITERAL = "its Tatoeba sentences are the literal reading, not the idiom its card teaches"
EXCLUDE = {
    # PHRASEBOOK SENTENCES: a statement about oneself, or a request, made of words the levels teach (Polish's
    # rule: `lubię cię`, `jestem Kanadyjczykiem`, `wyjdź za mnie`).  The questions and formulas a learner needs
    # whole stay (`jak se máš`, `jmenuji se`, `kolik to stojí`).
    "jsem z": "a template (\"I'm from …\"), not an expression",
    "miluji tě": PHRASEBOOK, "mám žízeň": PHRASEBOOK, "jsem Čech": PHRASEBOOK, "jsem Češka": PHRASEBOOK,
    "vezmeš si mě": PHRASEBOOK, "to je vtip": PHRASEBOOK,
    # the count is another reading's
    "na druhou stranu": LITERAL + ' ("to the other side", not "on the other hand")',
    "jít po": LITERAL + ' ("to walk along", not "to go after")',
    "jako prase": LITERAL + ' ("like a pig", not "as hell")',
    "co do": "its one sentence is another phrase (mít co do činění, \"to have to do with\")",
    # not an expression
    "abych byl": "a verb form (\"that I be\"), not an expression",
    "vyser si voko": "vulgar, though Wiktionary leaves it untagged",
}


def taught(e):
    return [s for s in e["senses"] if cs.gloss(s) or cs.parent(s)]


def classify(D):
    rows = {}
    for w, entries in D.items():
        if " " not in w or w != w.strip() or "..." in w or "…" in w or w[0] in "-(" or w[-1] in "-)":
            continue
        for e in entries:
            S = taught(e)
            if not S:
                continue
            if e["pos"] == "proverb":
                sub = "Proverbs"
            elif any("idiomatic" in (s.get("t") or []) for s in S):
                sub = "Idioms"
            elif e["pos"] in PHRASE_POS:
                sub = "Phrases"
            elif e["pos"] in EXPRESSION_POS:
                sub = "Expressions"
            else:
                continue
            if w not in rows or ORDER.index(sub) > ORDER.index(rows[w]):
                rows[w] = sub
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="phr")
    a = ap.parse_args()
    assert a.level == "phr", "phrases.py builds the phrases deck only (run.py --level phr)"
    D = cs.load_dict()
    below = cs_level.taught_below("phr")
    rows = {w: s for w, s in classify(D).items() if w not in below and w not in EXCLUDE}
    pool = examples.load_pool()
    index = examples.index_of(pool)
    out = []
    for w, sub in rows.items():
        hit_of, keys = examples.phrase_matcher(D, w, True)
        n = sum(1 for i in examples.candidates(index, keys) if hit_of(pool[i][2]))
        if n >= MIN_HITS:
            out.append({"word": w, "lemma": w, "sub": sub, "count": n})
    out.sort(key=lambda x: (ORDER.index(x["sub"]), -x["count"], x["word"]))
    by = {s: sum(1 for x in out if x["sub"] == s) for s in ORDER}
    with open(os.path.join(cs.CACHE, "wordlist-phr.json"), "w", encoding="utf-8") as fh:
        json.dump({"level": "phr", "inventory": 0, "fill": 0, "unresolved": [], "candidates": len(rows),
                   "words": out}, fh, ensure_ascii=False, indent=1)
    print("wordlist-phr.json: %d of %d candidates occur in Tatoeba: %s"
          % (len(out), len(rows), ", ".join("%d %s" % (by[s], s.lower()) for s in ORDER)), file=sys.stderr)


if __name__ == "__main__":
    main()
