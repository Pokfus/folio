#!/usr/bin/env python3
"""Stage 2 for the phrases deck: Polish set phrases, idioms and proverbs.

    python3 .claude/polish/phrases.py          (run.py --level phr runs it in place of select.py)

Writes `.claude/polish-cache/wordlist-phr.json` in the shape `select.py` writes for a level, with one more
field per word, `sub`.

NOT A CEFR LEVEL: an expression is a unit a frequency list of words cannot see, which is why the level decks
teach so few of them.  Three subdecks, the Indonesian, Turkish and Hindi arrangement (`docs/lang-decks.md`,
"THE PHRASES DECK"):

  Phrases   an entry of more than one word that Wiktionary files as a phrase or an interjection and does NOT
            tag idiomatic -- mostly the everyday formulas (`nie ma za co`, `wszystko jedno`);
  Idioms    an entry of more than one word with a taught sense Wiktionary TAGS idiomatic, of any part of
            speech (`mieć głowę na karku`, `od czasu do czasu`, `biały kruk`);
  Proverbs  Wiktionary's part of speech `proverb`.
One subdeck per expression: a proverb outranks an idiom outranks a phrase.

WHICH ONES.  Wiktionary carries some 5,500 multi-word Polish entries of those kinds -- far more than a deck
-- so an expression is taken when it OCCURS: in at least one of Tatoeba's Polish sentences (MIN_HITS),
counted the way `examples.py` matches it for this deck (an idiom that is a verb with its verb in any form:
`mieć głowę na karku` is found in `ma głowę na karku`).  That is the test of being in use that a word
deck gets from its frequency list.  A proverb is kept on one sentence too; Tatoeba is where Polish proverbs
are most often written down whole.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`pl_level.taught_below`), every sense goes through the level
decks' filter (`pl.gloss`: no vulgar, dated, regional … sense makes an expression), and `EXCLUDE` names the
rest, each with its reason.

THE ORDER, within each subdeck: how many Tatoeba sentences contain the expression, then its spelling.
"""
import argparse, json, os, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pl, pl_level, examples

ORDER = ["Phrases", "Idioms", "Proverbs"]
PHRASE_POS = {"phrase", "intj"}
MIN_HITS = 1

# Never taught, whatever the source says.  Each line says why.
PHRASEBOOK = "a phrasebook sentence built from level words, not a set phrase (the Turkish and Hindi rule)"
LITERAL = "its Tatoeba sentences are the literal reading, not the idiom its card teaches"
EXCLUDE = {
    # PHRASEBOOK SENTENCES: a statement about oneself, or a request, made of words the levels teach.  The
    # questions and formulas a learner needs whole stay (`która godzina`, `nazywam się`, `jak masz na imię`).
    "jestem z": "a template (\"I'm from …\"), not an expression",
    "nie mam pieniędzy": PHRASEBOOK, "nie jem mięsa": PHRASEBOOK, "nie jem ryb": PHRASEBOOK,
    "nie jem wieprzowiny": PHRASEBOOK, "nie mówię po angielsku": PHRASEBOOK, "nie mówię po polsku": PHRASEBOOK,
    "jestem gejem": PHRASEBOOK, "jestem lesbijką": PHRASEBOOK, "jestem biseksualny": PHRASEBOOK,
    "jestem wegetarianinem": PHRASEBOOK, "jestem Kanadyjczykiem": PHRASEBOOK, "jestem Brytyjką": PHRASEBOOK,
    "lubię cię": PHRASEBOOK, "oparzyłem się": PHRASEBOOK, "pocałuj mnie": PHRASEBOOK,
    "miał miejsce wypadek": PHRASEBOOK, "czy masz chłopaka": PHRASEBOOK, "czy mnie kochasz": PHRASEBOOK,
    "proszę, podaj mi sól": PHRASEBOOK, "wyjdź za mnie": PHRASEBOOK, "zadzwonię na policję": PHRASEBOOK,
    "zadzwoń na policję": PHRASEBOOK,
    # the count is another reading's
    "czy go": "a call to geese; its count is the words `czy go` (\"whether him\")",
    "to jest": LITERAL + ' ("this is", not "namely")',
    "być w domu": LITERAL + ' ("to be at home", not "to understand")',
    "z domu": LITERAL + ' ("from home", not "née")',
    "w sobie": LITERAL, "ale to": LITERAL, "na kolanach": LITERAL, "stare miasto": LITERAL + " (A2's finding)",
    "w tym": LITERAL + ' ("in this", not "including")', "do tego": LITERAL + ' ("to that", not "besides")',
    "za to": LITERAL + ' ("for this", not "whereas")', "dlaczego nie": LITERAL + ' ("why didn\'t …")',
    "nie mów": LITERAL + ' ("don\'t say", not "my word")', "coś takiego": LITERAL + ' ("such a thing")',
    "z Bogiem": LITERAL + ' ("with God", not "Godspeed")', "tak jest": LITERAL + ' ("it is so", not "aye aye")',
    "jak leci": 'Wiktionary teaches only "as you go"; its sentences are "how\'s it going"',
    # not an expression
    "tym samym": "its first senses are pointers (\"masculine/neuter instrumental …\" of ten sam)",
    "Jezu Chryste": "an oath",
}


def taught(e):
    return [s for s in e["senses"] if pl.gloss(s) or pl.parent(s)]


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
    D = pl.load_dict()
    below = pl_level.taught_below("phr")
    rows = {w: s for w, s in classify(D).items() if w not in below and w not in EXCLUDE}
    pool = examples.load_pool()
    index = examples.index_of(pool)
    out = []
    for w, sub in rows.items():
        hit_of, keys = examples.phrase_matcher(D, w, True)
        n = sum(1 for i in examples.candidates(index, keys) if hit_of(pool[i][2]))
        if n >= MIN_HITS:
            out.append({"word": w, "sub": sub, "count": n})
    out.sort(key=lambda x: (ORDER.index(x["sub"]), -x["count"], x["word"]))
    by = {s: sum(1 for x in out if x["sub"] == s) for s in ORDER}
    with open(os.path.join(pl.CACHE, "wordlist-phr.json"), "w", encoding="utf-8") as fh:
        json.dump({"level": "phr", "inventory": 0, "fill": 0, "unresolved": [], "candidates": len(rows),
                   "words": out}, fh, ensure_ascii=False, indent=1)
    print("wordlist-phr.json: %d of %d candidates occur in Tatoeba: %s"
          % (len(out), len(rows), ", ".join("%d %s" % (by[s], s.lower()) for s in ORDER)), file=sys.stderr)


if __name__ == "__main__":
    main()
