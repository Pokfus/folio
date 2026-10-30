#!/usr/bin/env python3
"""Stage 2: the level's words, in frequency order.

    python3 .claude/turkish/select.py --level a1

Writes `.claude/turkish-cache/wordlist-<level>.json`.

WHERE THE WORDS COME FROM.  Two inputs, both stated in the deck's description:
  1. the level's INVENTORY -- `supplement.py`, read from the programme's
     vocabulary columns -- every word of which the dictionary can teach;
  2. the FILL, up to the level's size: the commonest dictionary words of a
     subtitle frequency list (hermitdave/FrequencyWords, OpenSubtitles 2018)
     that no level below has taught.
The deck is then ORDERED by frequency, inventory and fill together, so the words
met most often come first; inventory words the corpus never saw go last.

THE FREQUENCY LIST IS SURFACE FORMS AND TURKISH IS AGGLUTINATIVE: `gidiyorum`,
`gitti` and `gideceğiz` are three rows.  Each surface form is credited to the
dictionary word(s) it belongs to, found by INVERTING the dictionary's own
inflection tables -- never by stripping suffixes, since voicing and vowel loss
(`kitabı`, `ağzı`) are lexical.  A surface form that is itself a live headword
counts for that headword too.  A surface claimed by several words is SPLIT IN PROPORTION TO EACH WORD'S
UNAMBIGUOUS COUNT (the count from surfaces only it claims), iterated a few times.
An equal split was tried first and is wrong in a way that matters: `bana` ("to
me", the dative of `ben`) is also an optative of `banmak` "to dip", and `var`
an imperative of `varmak`, so an equal split made "to dip" one of the hundred
commonest words of the language.  Proportional allocation gives a word that is
never seen unambiguously next to nothing of a homograph's count.

AND A WORD'S OWN SPELLING IS THAT WORD'S FIRST.  A surface that is a live
headword's citation form is credited to that headword (or headwords) only, and
other words' tables are not asked: `var` ("there is") went to `varmak` ("to
arrive"), `eğer` ("if") to `eğmek` ("to bend") and `ile` ("with") to `ilmek`,
because a verb's bare stem and its aorist are table forms that collide with
the commonest particles.  The cost is that `gider` counts for the noun
"expense" and not for `gitmek`, which has plenty of other forms.

THE CIRCUMFLEX IS FOLDED ONLY AS A FALLBACK.  Subtitles write `rüzgar` for
`rüzgâr`, so a surface with no exact headword or table form is tried without
it; folding unconditionally made `ama` ("but") a count for `âmâ` ("blind").
"""
import argparse, json, os, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tr, supplement

SIZE = {"a1": 500, "a2": 600, "b1": 1000}
TOP_SURFACES = 80000

# An inventory entry the dictionary does not carry, mapped to what it does, with the reason.
SUBSTITUTE = {
    "konaklama": "konaklamak",   # the verbal noun has no entry; its verb does
    "manzaralı": "manzara",      # "with a view": the -lI adjective has no entry; its noun does
    "şekerli": None,             # "sugared": no entry; şeker is already taught
}

# Never taught, whatever their frequency.  Each line says why.
EXCLUDE = {
    "mi", "mı", "mu", "mü",      # the question particle is grammar, written apart but not a word to gloss
    "de", "da",                  # the clitic "too / also" -- glossed, it reads as the locative suffix
    "ki",                        # the relative/emphatic particle: a grammar point, not vocabulary
    "ora", "nere", "bura",       # bound stems: never said alone, only as ora-da, nere-de, bura-sı
    "misin", "misiniz", "musun", "mısın",  # the question particle with a person ending: grammar
    "in",                        # "lair": its count is inmek's imperative "get off!" and English "in"
    "bok", "ulan", "kahretmek", "lanet",  # swearing: its count is dubbed-film dialogue, and `bok`'s
                                 # one standard sense left is "slag" (the `kejam` shape)
    "azı",                       # "molar": its count is `az`'s accusative, "the little" (en azı, "at least")
    "un",                        # "flour": its count is the French and Spanish `un` in the subtitles
    "bırak",                     # "let alone": its count is the imperative "leave it!" of bırakmak (A1)
    "sensin",                    # "it's you": `sen` with the copula, a form rather than a word
    "adamım",                    # "my man": subtitle slang, the possessive of adam (A1)
    "karı",                      # "wife": pejorative in modern use (except in karı koca), untagged in the source
    "piç", "fahişe", "zenci", "kıç", "defolmak",  # offensive (zenci is a slur in modern use); untagged in the source
    "sara", "han", "ten", "don", "tan", "is",  # their counts are names and English words in the subtitles
    "etmen",                     # "factor": its count is `etmen lazım`, "you need to do" (etmek)
    "gider",                     # "expense": its count is gitmek's aorist "goes"
    "hakim",                     # "wise": its count is hâkim "judge" written without the circumflex (A2)
    "şûra", "âmâ",               # "council", "blind": counts from unaccented `şura` "there" and `ama` "but"
    "verici",                    # "transmitter": its count is `heyecan verici`, "exciting", and the like
    "yapılanmak",                # its count is `yapılan`, the participle of yapılmak "to be done"
    "biriyle", "şeyle",          # "with someone / something": biri and şey with the instrumental
    "hal",                       # "covered market": its count is hâl "state" written without the circumflex
    "aşık",                      # "anklebone": its count is âşık "in love" without the circumflex
    "geleni",                    # "ground squirrel": its count is `geleni`, "the one who comes"
    "yumak",                     # "ball of yarn": its count is not the yarn's (the yumak/yummak stem)
    "dahil", "açılmak", "vurulmak",  # the dictionary carries only a rare sense (involvement; to leave
                                 # port; to fall in love) of a word whose count is its common one
    "nerde",                     # a spoken spelling of nerede (A1), filed as an adverb so no rule reaches it
    "tabi",                      # "subject to": its count is the subtitles' misspelling of `tabii`, "of course"
}


def read_frequency():
    rows = []
    with open(os.path.join(tr.CACHE, "tr_full.txt"), encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            if i >= TOP_SURFACES:
                break
            w, n = line.rsplit(" ", 1)
            rows.append((tr.fold(w), int(n)))
    return rows


def lemma_counts(D, freq):
    surfaces = {s for s, _ in freq}
    plain = {tr.strip_circ(s) for s in surfaces}
    exact = defaultdict(set)           # folded spelling -> headwords claiming it (itself or a table form)
    for w, entries in D.items():
        if w != tr.fold(w):            # a capitalised headword is a name
            continue
        for e in entries:
            if tr.live(e):
                exact[tr.fold(w)].add(w)
                for f, _ in tr.table_forms(e, w):
                    k = tr.fold(f)
                    if k in surfaces or tr.strip_circ(k) in plain:
                        exact[k].add(w)
            for s_ in e["senses"]:     # `bana` is glossed "dative of ben": the pointer is a claim too
                for target in s_.get("f") or []:
                    if target in D and target == tr.fold(target) and any(tr.live(x) for x in D[target]):
                        exact[tr.fold(w)].add(target)
    # AN INFLECTED PRONOUN IS ITS PRONOUN: `bana`, `beni`, `benim` carry entries of their own, but
    # they are cells of `ben`'s table and that card shows them, so their spelling is `ben`'s claim.
    pron_cells = defaultdict(set)
    for w, entries in D.items():
        for e in entries:
            if e["pos"] == "pron" and tr.live(e):
                for f, _ in tr.table_forms(e, w):
                    if tr.fold(f) != tr.fold(w):
                        pron_cells[tr.fold(f)].add(w)
    for k, owners in pron_cells.items():
        if k in D and all(e["pos"] == "pron" for e in D[k] if tr.live(e)):
            exact[k] = (exact.get(k, set()) - {k}) | owners
    loose = defaultdict(set)
    for k, ws in exact.items():
        loose[tr.strip_circ(k)] |= ws
    def claim(s):
        c = exact.get(s) or loose.get(tr.strip_circ(s)) or set()
        own = {w for w in c if tr.fold(w) == s}
        return own or c                # a word's own spelling is that word's, before any table's
    claims = [(claim(s), n) for s, n in freq]
    base = defaultdict(float)
    for c, n in claims:
        if len(c) == 1:
            base[next(iter(c))] += n
    counts = base
    for _ in range(3):
        nxt = defaultdict(float)
        for c, n in claims:
            if not c:
                continue
            if len(c) == 1:
                nxt[next(iter(c))] += n
                continue
            tot = sum(counts.get(w, 0) + 1 for w in c)
            for w in c:
                nxt[w] += n * (counts.get(w, 0) + 1) / tot
        counts = nxt
    return counts, exact


def taught_below(level):
    """Headwords already in the shipped decks of the levels below (none for A1)."""
    order = ["a1", "a2", "b1", "b2", "c1"]
    out = set()
    root = os.path.join(tr.HERE, "..", "..", "decks")
    for lv in order[:order.index(level)]:
        p = os.path.join(root, "Turkish-%s.folio-deck.json" % lv.upper())
        with open(p, encoding="utf-8") as fh:
            for c in json.load(fh)["cards"]:
                out.add(c["fields"]["Word"])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    a = ap.parse_args()
    D = tr.load_dict()
    freq = read_frequency()
    counts, exact = lemma_counts(D, freq)
    below = taught_below(a.level)

    def resolve(h):
        if h in D and any(tr.live(e) for e in D[h]):
            return [h]
        if h in SUBSTITUTE:
            return [SUBSTITUTE[h]] if SUBSTITUTE[h] else []
        if " " in h:                   # a compound the dictionary lacks: its words, each as its dictionary word
            out = []
            for w in h.split():
                if w in D and any(tr.live(e) for e in D[w]):
                    out.append(w)
                    continue
                # `kulak ağrısı` -> `ağrısı` is only "possessive of ağrı": teach `ağrı`
                t = next((tr.pointer(s_) for e in D.get(w, []) for s_ in e["senses"] if tr.pointer(s_)), None)
                if t in D and any(tr.live(e) for e in D[t]):
                    out.append(t)
            return out
        return []

    inventory, unresolved, seen = [], [], set(below)
    for h, page, theme in supplement.headwords(a.level):
        got = resolve(h)
        if not got:
            unresolved.append(h)
        for w in got:
            if w not in seen and w not in EXCLUDE:
                seen.add(w)
                inventory.append({"word": w, "page": page, "theme": theme, "from": h})
    if unresolved:
        print("! the dictionary does not carry (dropped): " + ", ".join(unresolved), file=sys.stderr)

    # A FILL WORD MAY NOT BE A FORM OF A COMMONER WORD SAID AS A WHOLE.  `gitme`, `yapma`, `bak`, `oldu`,
    # `değilim`, `gelen`, `neyi` carry entries of their own (a verbal noun, an interjection) and are also
    # an imperative, a past, a predicative, a participle or a pronoun's case of `gitmek`, `yapmak`,
    # `bakmak`, `olmak`, `değil`, `gelmek`, `ne`; their count is mostly that word's, so ranking them on it
    # teaches a form as a word.  THE SLOT DECIDES, not the count alone: the first version skipped any cell
    # of a commoner table and lost `işte` (a locative of `iş`), `bile` and `diye` (optatives), `olarak`,
    # `gerek` and `getirmek` -- particles and words in their own right.  So a word with an adverb,
    # conjunction, postposition, determiner or numeral entry is lexicalised and kept, and only the slots
    # below shadow.  The inventory is not filtered: a word the level names is taught.
    SHADOW_SLOTS = {"imperative", "past", "participle", "predicative"}
    # A NOUN THAT IS A CASE OF A COMMONER NOUN is the same fault one class over: `kanı` "opinion" is
    # counted from `kan` "blood"'s accusative, `testi` "water jug" from `test`'s, `hale` "halo" from
    # `hal`'s dative, `bayanlar` "mesdames" is bayan's plural.  So a word whose live entries are all
    # nouns is shadowed by ANY cell of a commoner noun's table -- and a spelling listed as another
    # word's "alternative" (`nerde` for nerede) by that word, whatever its class.
    LEXICAL = {"adv", "conj", "postp", "det", "num"}
    slot_owners = defaultdict(set)
    noun_owners = defaultdict(set)
    for o, entries in D.items():
        for e in entries:
            if not tr.live(e) or o != tr.fold(o):
                continue
            for f, tg in tr.table_forms(e, o):
                k = tr.fold(f)
                if k != tr.fold(o) and (e["pos"] == "pron" or set(tg) & SHADOW_SLOTS or "alternative" in tg):
                    slot_owners[k].add(o)
                elif k != tr.fold(o) and e["pos"] == "noun" and tg:
                    noun_owners[k].add(o)
    shadowed = []
    fill = []
    for w, n in sorted(counts.items(), key=lambda x: (-x[1], x[0])):
        if len(inventory) + len(fill) >= SIZE[a.level]:
            break
        if w in seen or w in EXCLUDE or len(w) < 2 and w != "o":
            continue
        own_pos = {e["pos"] for e in D.get(w, []) if tr.live(e)}
        if ((not own_pos & LEXICAL and any(counts.get(o, 0) > n for o in slot_owners.get(tr.fold(w), ())))
                or (own_pos <= {"noun"} and any(counts.get(o, 0) > n for o in noun_owners.get(tr.fold(w), ())))):
            shadowed.append(w)
            continue
        seen.add(w)
        fill.append({"word": w})
    print("  fill skipped as forms of a commoner word: %d (e.g. %s)" % (len(shadowed), ", ".join(shadowed[:12])),
          file=sys.stderr)
    words = inventory + fill
    for x in words:
        x["count"] = round(counts.get(x["word"], 0))
    words.sort(key=lambda x: (-x["count"], x["word"]))
    out = {"level": a.level, "inventory": len(inventory), "fill": len(fill),
           "unresolved": unresolved, "words": words}
    with open(os.path.join(tr.CACHE, "wordlist-%s.json" % a.level), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print("wordlist-%s.json: %d words (%d inventory, %d frequency)" % (a.level, len(words), len(inventory), len(fill)),
          file=sys.stderr)


if __name__ == "__main__":
    main()
