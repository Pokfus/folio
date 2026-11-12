#!/usr/bin/env python3
"""Stage 3: three Tatoeba sentences for each word.

    python3 .claude/polish/examples.py --level a1

Writes `.claude/polish-cache/examples-<level>.json`: word -> [{pl, en, hit}],
`hit` being the token(s) that matched, for the markup.

A WORD IS FOUND BY ITS OWN FORMS -- the dictionary's table for the entries the
card teaches (`pies` is found in `psa`, `iść` in `szedł`), matched as whole
tokens, never by prefix.  A pronoun's table is its own (`ja` -> `mnie`, `mi`),
but the plural pronoun is another card's word (`ja` is not found in `my`).

A PHRASE (`dzień dobry`, `w lewo`) is matched as consecutive tokens.

WHICH THREE.  Shortest first between 3 and 12 words, then by Tatoeba id so a
re-run is identical; one sentence per Polish text, no two sharing an English
text, nor two opening with the same two words.  A pair whose English is more
than three times the length of the Polish, or under a third, is skipped as a
likely mismatch.
"""
import argparse, bz2, json, os, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pl

MIN_W, MAX_W, PER = 3, 12, 3


def read_tsv(name):
    with bz2.open(os.path.join(pl.CACHE, name), "rt", encoding="utf-8") as fh:
        for line in fh:
            yield line.rstrip("\n").split("\t")


# A SENTENCE THAT IS ANOTHER WORD'S, though the forms match -- each with the case that forced it (A2, 2026-11-12).
# `należy` has no table, so its own spelling is all it is found by, and that spelling is also należeć's
# "belongs" (`To należy do ciebie`); `piec`'s plural `piece` is the English of a manga's title.
REJECT = {
    "należy": lambda toks: "do" in toks,
    "piec": lambda toks: "one" in toks,
}

OWNERS = {}


def owners(D):
    """form -> every live headword that IS that spelling or carries it in its table."""
    if not OWNERS:
        for h, entries in D.items():
            for e in entries:
                if pl.live(e):
                    OWNERS.setdefault(pl.fold(h), set()).add(h)
                    for f, _ in pl.table_forms(e):
                        OWNERS.setdefault(pl.fold(f), set()).add(h)
    return OWNERS


def forms_of(D, word):
    """The word's own spelling, and every cell of its table that NO OTHER WORD claims.  A shared cell is
    another word's sentence as often as not: `mam` is mama's genitive plural and mieć's "I have", `wina`
    wino's genitive and the noun "fault", `nie` a case of `ono` and the negation, `lat` the plural of both
    rok and lato, `pytanie` a verbal noun of pytać and a headword of its own.  Before this rule `mama`
    was illustrated by "Nie mam usprawiedliwienia" and `ono` by "Nie lubię szkoły"."""
    O = owners(D)
    out = {pl.fold(word)}
    for e in D.get(word, []):
        if pl.live(e):
            out |= {pl.fold(f) for f, t in pl.table_forms(e)
                    if not (e["pos"] == "pron" and "plural" in t and "singular" not in t)
                    and O.get(pl.fold(f), {word}) == {word}}
    return out


def load_pool():
    """Tatoeba's Polish sentences with an English translation, filtered and ordered as the module says."""
    pol = {r[0]: r[2] for r in read_tsv("pol_sentences.tsv.bz2") if len(r) >= 3}
    links = defaultdict(list)
    for r in read_tsv("pol-eng_links.tsv.bz2"):
        if len(r) >= 2 and r[0] in pol:
            links[r[0]].append(r[1])
    need = {e for v in links.values() for e in v}
    eng = {r[0]: r[2] for r in read_tsv("eng_sentences.tsv.bz2") if len(r) >= 3 and r[0] in need}
    pool = []
    for sid, text in pol.items():
        en = [eng[e] for e in sorted(links.get(sid, []), key=int) if e in eng]
        if not en:
            continue
        toks = pl.tokens(text)
        if not (MIN_W <= len(toks) <= MAX_W):
            continue
        r = len(en[0]) / max(1, len(text))
        if r > 3 or r < 1 / 3:
            continue
        pool.append((len(toks), int(sid), toks, text, en[0]))
    pool.sort(key=lambda x: (x[0], x[1]))
    return pool


def index_of(pool):
    index = defaultdict(list)
    for i, (_, _, toks, _, _) in enumerate(pool):
        for t in set(toks):
            index[t].append(i)
    return index


def verb_forms(D, w):
    """Every spelling of `w` as a verb (itself and its table), or None when it is not a verb."""
    fs = None
    for e in D.get(w, []):
        if e["pos"] == "verb" and pl.live(e):
            fs = (fs or {w}) | {pl.fold(f) for f, _ in pl.table_forms(e)}
    return fs


def phrase_matcher(D, w, verbforms=False):
    """A matcher for a multi-word entry: its words as consecutive tokens.  With `verbforms` (THE PHRASES DECK
    ONLY, so every level deck keeps its exact matching and rebuilds unchanged) an idiom that opens with a verb
    is matched with that verb in any form: `mieć głowę na karku` in `ma głowę na karku`."""
    parts = pl.tokens(w)
    n = len(parts)
    first = (verb_forms(D, parts[0]) if verbforms else None) or {parts[0]}

    def hit_of(toks):
        for i in range(len(toks) - n + 1):
            if toks[i] in first and toks[i + 1:i + n] == parts[1:]:
                return " ".join(toks[i:i + n])
        return None
    return hit_of, first


def candidates(index, keys):
    return sorted({i for k in keys for i in index.get(k, [])})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    a = ap.parse_args()
    D = pl.load_dict()
    words = [x["word"] for x in json.load(open(os.path.join(pl.CACHE, "wordlist-%s.json" % a.level)))["words"]]
    pool = load_pool()
    index = index_of(pool)

    out, none = {}, []
    for w in words:
        parts = pl.tokens(w)
        if len(parts) > 1:
            hit_of, keys = phrase_matcher(D, w, a.level == "phr")
            cand = candidates(index, keys)
        else:
            fs = forms_of(D, w)
            cand = sorted({i for f in fs for i in index.get(f, [])})
            hit_of = lambda toks, fs=fs: next((t for t in toks if t in fs), None)
        got, seen_pl, seen_en, seen_frame = [], set(), set(), set()
        for i in cand:
            _, _, toks, text, en = pool[i]
            h = hit_of(toks)
            if not h or (w in REJECT and REJECT[w](toks)):
                continue
            frame = tuple(toks[:2])
            if text in seen_pl or en in seen_en or frame in seen_frame:
                continue
            seen_pl.add(text); seen_en.add(en); seen_frame.add(frame)
            got.append({"pl": text, "en": en, "hit": h})
            if len(got) == PER:
                break
        out[w] = got
        if not got:
            none.append(w)
    with open(os.path.join(pl.CACHE, "examples-%s.json" % a.level), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print("examples-%s.json: %d of %d words have a sentence (pool %d); none for: %s"
          % (a.level, len(words) - len(none), len(words), len(pool), ", ".join(none) or "-"), file=sys.stderr)


if __name__ == "__main__":
    main()
