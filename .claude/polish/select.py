#!/usr/bin/env python3
"""Stage 2: the level's words, in frequency order.

    python3 .claude/polish/select.py --level a1

Writes `.claude/polish-cache/wordlist-<level>.json`.

WHERE THE WORDS COME FROM.  Two inputs, both stated in the deck's description:
  1. the level's INVENTORY -- `inventory.py`, Folio's own list for the level's
     topics -- every word of which the dictionary can teach;
  2. the FILL, up to the level's size: the commonest dictionary words of a
     subtitle frequency list (hermitdave/FrequencyWords, OpenSubtitles 2018)
     that no level below has taught.
The deck is then ORDERED by frequency, inventory and fill together.

THE FREQUENCY LIST IS SURFACE FORMS AND POLISH INFLECTS: `jestem`, `jest`, `są`
and `był` are four rows of one verb, `psa` and `psy` two of `pies`.  Each
surface form is credited to the dictionary word(s) whose own table carries it
-- the tables INVERTED, never suffixes stripped, since the alternations
(`pies -> psa`, `ręka -> ręce`, `iść -> szedł`) are lexical.  A surface several
words claim is split in proportion to each word's unambiguous count, iterated
(the Turkish finding: an equal split hands a homograph half of a common word).
A word's own spelling is that word's first, before any table's: `nie` is the
particle, not a case of `ono`; `to` the pronoun, not a cell of `ten`.  And an
inflected pronoun is its pronoun: `mnie`, `go`, `jej` count for `ja`, `on`, `ona`.
"""
import argparse, json, os, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pl, inventory, pl_level

TOP_SURFACES = 80000

# Never taught, whatever their frequency.  Each line says why.
EXCLUDE = {
    "ok", "okej", "hej", "ej", "oh", "och", "ach", "aha", "hm", "eh", "uh",   # interjections of film dialogue
    "jo",                      # a dialect "yes"; its count is subtitles' Spanish and names
    "kurwa", "cholera", "kurczę", "gówno", "dupa", "pieprzyć", "jebać", "pierdolić", "chuj", "skurwysyn",
    "tato",                    # the vocative of `tata`, which the deck teaches; its own entry took the count
    "dzieje",                  # "history": its count is `dzieje się`, "is happening" (dziać się)
    "suka", "dziwka", "pieprzony", "zajebisty", "spieprzać", "spierdalać",      # swearing: dubbed-film counts
    # Found by A2 (2026-11-12): homographs whose own entry took a commoner word's form, and an exemption
    # (adverb, conjunction) kept them from being shadowed.
    "dnia",                    # adv "daily": its count is dzień's genitive
    "razy",                    # adv "times (multiplied by)": its count is raz's plural
    "bądź",                    # conj "either, or": its count is być's imperative
    "podoba",                  # noun "pattern": its count is podobać's `podoba mi się`
    "ego",                     # counted above `pomoc` and `rozmowa`: subtitle noise, not the psychological term
    # Found by B1 (2026-11-12).
    "pierwsza",                # noun "one o'clock": its count is pierwszy's feminine
    "żadnego",                 # a case of żaden (A1/A2) the dump carries as a live entry
    "człowieku",               # człowiek's vocative, entered as a particle
    "powinno",                 # adverb "as it ought": its count is powinien's neuter
    "działo",                  # noun "cannon": its count is `działo się` (dziać się)
    "frank", "tom", "henr",    # the names Frank, Tom and Henry, which a lowercase list cannot tell from the franc, a volume and the unit
    "glina",                   # "clay": its count is the slang "cop", a sense the deck does not teach
    "korekta",                 # "correction": its count is subtitle credits ("Korekta: …")
    "dupek",                   # "asshole": swearing, as above
    # Found by B2 (2026-11-12).
    "mary",                    # "bier": its count is the name Mary
    "cie",                     # an interjection to a horse: its count is ciebie's short form `cię` without the ogonek
    "dna",                     # "gout": its count is dno's genitive
    "święta",                  # "saint" (fem.): its count is święto's plural "holidays", which A2 teaches as święto
    "młoda",                   # "bride": its count is młody's feminine
    "lewa",                    # "trick" (cards): its count is lewy's feminine
    "forsa",                   # "crowd": its count is the slang "dough, cash", a sense the deck does not teach
}


def combined_only(entries):
    """`żebyś`, `gdybym`, `byś`: "Combined form of żeby + -ś" -- a conjunction with a person ending fused on,
    which the card for the conjunction already teaches.  Found by A2's fill (2026-11-12)."""
    live = [e for e in entries if pl.live(e)]
    fused = lambda s_: any("Combined form of" in g for g in (s_.get("g") or []))
    return any(fused(s_) for e in live for s_ in e["senses"]) and all(fused(s_) or e["pos"] == "intj"
                              for e in live for s_ in e["senses"])


def read_frequency():
    rows = []
    with open(os.path.join(pl.CACHE, "pl_full.txt"), encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            if i >= TOP_SURFACES:
                break
            w, n = line.rsplit(" ", 1)
            rows.append((pl.fold(w), int(n)))
    return rows


def lemma_counts(D, freq):
    surfaces = {s for s, _ in freq}
    exact = defaultdict(set)
    for w, entries in D.items():
        if w != pl.fold(w) or " " in w:      # a capitalised headword is a name; a phrase is not a surface
            continue
        for e in entries:
            if pl.live(e):
                exact[w].add(w)
                for f, _ in pl.table_forms(e):
                    k = pl.fold(f)
                    if k in surfaces:
                        exact[k].add(w)
            # `dziękuję` is glossed "first-person singular of dziękować": an INFLECTION's pointer is a claim.
            # Any other pointer is not: `sie` is "abbreviation of sierpień", and its 87,050 are the subtitles'
            # `się` typed without the ogonek -- they made August commoner than any other month by ten times.
            for s_ in e["senses"]:
                if "form-of" not in (s_.get("t") or []) or set(s_.get("t") or []) & {"abbreviation", "alt-of"}:
                    continue
                for target in s_.get("f") or []:
                    if target in D and target == pl.fold(target) and any(pl.live(x) for x in D[target]):
                        exact[w].add(target)
    pron_cells = defaultdict(set)
    for w, entries in D.items():
        for e in entries:
            if e["pos"] == "pron" and pl.live(e):
                for f, _ in pl.table_forms(e):
                    if pl.fold(f) != w:
                        pron_cells[pl.fold(f)].add(w)
    for k, owners in pron_cells.items():
        if k in D and all(e["pos"] == "pron" for e in D[k] if pl.live(e)):
            exact[k] = (exact.get(k, set()) - {k}) | owners

    def claim(s):
        c = exact.get(s) or set()
        own = {w for w in c if w == s}
        return own or c
    claims = [(claim(s), n) for s, n in freq]
    counts = defaultdict(float)
    for c, n in claims:
        if len(c) == 1:
            counts[next(iter(c))] += n
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
    return counts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    a = ap.parse_args()
    D = pl.load_dict()
    freq = read_frequency()
    counts = lemma_counts(D, freq)
    below = pl_level.taught_below(a.level)
    ok = lambda w: w in D and any(pl.live(e) for e in D[w])

    inventory_, unresolved, seen = [], [], set(below)
    for h, topic in inventory.headwords(a.level):
        if not ok(h):
            unresolved.append(h)
            continue
        if h not in seen and h not in EXCLUDE:
            seen.add(h)
            inventory_.append({"word": h, "topic": topic})
    if unresolved:
        print("! the dictionary does not carry (dropped): " + ", ".join(unresolved), file=sys.stderr)

    # A FILL WORD MAY NOT BE A FORM OF A COMMONER WORD.  `jest`, `mam`, `proszę` and `dziękuję` carry
    # entries of their own (a noun, an interjection) and are also cells of `być`, `mieć`, `prosić` and
    # `dziękować`; ranked on that count they would teach a form as a word.  So a fill word that is a cell of
    # a commoner word's table is skipped -- unless it is a closed-class word in its own right (an adverb,
    # conjunction, preposition, particle or numeral: `trochę`, `razem`, `prawie`) -- and the inventory is not
    # filtered: a word the level names is taught.
    # WHICH OWNER, WHICH EXEMPTION.  A cell of a PRONOUN's table always shadows (`nim` "before" and `im` "the
    # more" are conjunctions whose count is `on`'s and `oni`'s cases).  A cell of a VERB's shadows anything but
    # an adverb, conjunction, preposition or numeral (`musi` "probably" and `znaczy` "namely" are particles
    # counted from musieć and znaczyć; `dzieje` "history" is a noun counted from `dzieje się`).  A cell of
    # anything else shadows a word with no closed-class reading.  An interjection is never an exemption:
    # `mu` "moo", `je` "ey!" and `dzieci` "(a call to ducklings)" are counted as `on`, `ona` and `dziecko`.
    EXEMPT = {"verb": {"adv", "conj", "prep", "num"}, "other": {"adv", "conj", "prep", "particle", "num"}}
    owners = defaultdict(set)
    for o, entries in D.items():
        for e in entries:
            if pl.live(e) and o == pl.fold(o):
                for f, _ in pl.table_forms(e):
                    if pl.fold(f) != o:
                        owners[pl.fold(f)].add((o, e["pos"]))
    shadowed, fill = [], []
    for w, n in sorted(counts.items(), key=lambda x: (-x[1], x[0])):
        if len(inventory_) + len(fill) >= pl_level.SIZE[a.level]:
            break
        if w in seen or w in EXCLUDE or (len(w) < 2 and w not in "awiozu") or combined_only(D.get(w, [])):
            continue
        own_pos = {e["pos"] for e in D.get(w, []) if pl.live(e)}
        # A WORD THAT IS ONLY AN INTERJECTION OR A PARTICLE IS SHADOWED WHATEVER THE OWNER'S COUNT: a word's own
        # spelling is credited to itself first, so the verb behind `znaczy` and the noun behind `boże` look
        # rarer than the homograph that took their count.  Gating every word that way lost `życie` and `rzecz`
        # (cells of żyć and of rzec, "to say"), so a noun, an adjective or a verb is shadowed only by a
        # commoner owner.
        thin = bool(own_pos) and own_pos <= {"intj", "particle"}
        def shadows(o, pos):
            if pos == "pron":
                return True
            if own_pos & EXEMPT["verb" if pos == "verb" else "other"]:
                return False
            return thin or counts.get(o, 0) > n
        if any(shadows(o, pos) for o, pos in owners.get(w, ())):
            shadowed.append(w)
            continue
        seen.add(w)
        fill.append({"word": w})
    print("  fill skipped as forms of a commoner word: %d (e.g. %s)" % (len(shadowed), ", ".join(shadowed[:15])),
          file=sys.stderr)
    words = inventory_ + fill
    for x in words:
        x["count"] = round(counts.get(x["word"], 0))
    words.sort(key=lambda x: (-x["count"], x["word"]))
    out = {"level": a.level, "inventory": len(inventory_), "fill": len(fill), "unresolved": unresolved,
           "words": words}
    with open(os.path.join(pl.CACHE, "wordlist-%s.json" % a.level), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print("wordlist-%s.json: %d words (%d inventory, %d frequency)" % (a.level, len(words), len(inventory_), len(fill)),
          file=sys.stderr)


if __name__ == "__main__":
    main()
