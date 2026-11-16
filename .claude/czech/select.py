#!/usr/bin/env python3
"""Stage 2: the level's words, in frequency order.

    python3 .claude/czech/select.py --level a1

Writes `.claude/czech-cache/wordlist-<level>.json`.

THERE IS NOTHING TO CHOOSE, FOR THE MOST PART (the Goethe line): the exam board
publishes the list (`soupis.py`), and this settles which Wiktionary LEMMA each entry
is, resolving the list's notation --
  * `jazyk (část těla)`: the parenthesis is the sense meant, and is dropped; the two
    rows of `jazyk` are one card, which carries both meanings;
  * `kuchyň/kuchyně`: alternatives, the first the dictionary carries is the card;
    `nerad/a/i`: endings, dropped (`nerad`);
  * `bát se`, `dát si`: a reflexive verb, taught under its own headword with the
    base verb's reflexive senses (Wiktionary files them there, tagged `reflexive`);
  * a row with a blank, a `+`, an `X` or a comma (`být rád/a/rádi, že`, `linku číslo
    X, prosím`) is a pattern, not a headword, and is reported and dropped, as is
    every `vazba` row;
  * a multi-word entry is taught only where Wiktionary has it as one entry.
-- and orders the result by frequency.

THE ONE CHOICE (A1 only): the SUPPLEMENT.  The list is the lexicon of the reference
description's thematic and functional chapters; its grammar chapters, not its list,
carry the personal and possessive pronouns, most prepositions and conjunctions and
several numbers -- `ty`, `on`, `můj`, `s`, `pro` are on neither level's list.  An A1
deck without "you" and "he" teaches nobody, so A1 adds the commonest CLOSED-CLASS
words (every live entry a pronoun, determiner, preposition, conjunction, particle
or numeral) of the frequency list that are on neither list, up to `SUPPLEMENT_N`
of them; the description says so in those words.  A word the list puts at A2 (`s`,
`že`, `k`, `o`) stays at A2.

FREQUENCY: Polish's counting, unchanged (`.claude/polish/select.py`): each surface
form of the subtitle list is credited to the dictionary words whose own table carries
it, a form several claim split in proportion, iterated.
"""
import argparse, json, os, re, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cs, cs_level

TOP_SURFACES = 80000
SUPPLEMENT_N = 45
# SETS A BEGINNER NEEDS WHOLE, taken whatever their count: the personal pronouns, the possessives and the
# cardinals one to ten.  The list names `já`, `vy`, `jeden`, `dva`, `tři` and `deset` and leaves the rest to the
# grammar chapters; counted, `jeho` "his" is shadowed by on's genitive and `ono` "it" by its rarity in dialogue.
WHOLE = ("já ty on ona ono my vy oni ony můj tvůj jeho její náš váš jejich svůj "
         "jeden dva tři čtyři pět šest sedm osm devět deset").split()
CLOSED = {"pron", "det", "prep", "conj", "particle", "num"}
ENDING = re.compile(r"^[a-záéíý]{1,3}$")       # `rád/a/i`, `neboj/te`: an ending after a slash, not a word
REFLEXIVE = re.compile(r"^(\S+) (se|si)$")

# LIST ENTRIES NOT TAUGHT, each with its reason: Wiktionary's only sense is not the one the list means.
EXCLUDE = {
    "přestoupit",     # "to change (trains)" on the list; Wiktionary's one sense is "to transgress"
    "objednat se",    # "to make an appointment" (at the doctor's); Wiktionary has no reflexive sense, only "to order"
    "scházet se",     # "to meet"; Wiktionary has no reflexive sense, only "to be absent, to be missing"
    "zapsat se", "zapisovat se",   # "to enrol, to register"; Wiktionary has only "to write down"
    "lux",            # colloquial "vacuum cleaner"; Wiktionary has only the unit of illuminance
}
# The list's part of speech, as Wiktionary names it.  An entry is read in that part of speech where Wiktionary
# has it: `moc` is listed as an adverb ("very, a lot"), and Wiktionary's noun "power" came first; `jak` "how"
# also carried the noun "yak", `starší` "older" a church elder.
POS = {"substantivum": {"noun"}, "verbum": {"verb"}, "adjektivum": {"adj"}, "adverbium": {"adv"},
       "numerále": {"num", "det", "adj", "noun"}, "pronomen": {"pron", "det"}, "konjunkce": {"conj"},
       "partikule": {"particle", "intj", "adv"}, "interjekce": {"intj"}, "prepozice": {"prep"}}

# Never added by the supplement, whatever their count -- each with its reason.
NOT_SUPPLEMENT = {
    "jo",       # colloquial "yeah": on the A2 list, as is `ano` at A1 (the list's choice of register)
    "ve", "ze", "ke",       # the vocalised forms of v, z, k ("alternative form of v"), taught with them
    "tys", "žes",           # fused forms (ty + jsi, že + jsi), not words
    "onen", "jenž",         # literary "that" and "who, which": the written language's, not a beginner's
    "jménem",               # "on behalf of": its count is jméno's instrumental
}


def read_frequency():
    rows = []
    with open(os.path.join(cs.CACHE, "cs_full.txt"), encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            if i >= TOP_SURFACES:
                break
            w, n = line.rsplit(" ", 1)
            rows.append((cs.fold(w), int(n)))
    return rows


def lemma_counts(D, freq):
    """Polish's counting, unchanged -- see `.claude/polish/select.py`."""
    surfaces = {s for s, _ in freq}
    exact = defaultdict(set)
    for w, entries in D.items():
        if w != cs.fold(w) or " " in w:
            continue
        for e in entries:
            if cs.live(e):
                exact[w].add(w)
                for f, _ in cs.table_forms(e):
                    k = cs.fold(f)
                    if k in surfaces:
                        exact[k].add(w)
            for s_ in e["senses"]:
                if "form-of" not in (s_.get("t") or []) or set(s_.get("t") or []) & {"abbreviation", "alt-of"}:
                    continue
                for target in s_.get("f") or []:
                    if target in D and target == cs.fold(target) and any(cs.live(x) for x in D[target]):
                        exact[w].add(target)
    pron_cells = defaultdict(set)
    for w, entries in D.items():
        for e in entries:
            if e["pos"] == "pron" and cs.live(e):
                for f, _ in cs.table_forms(e):
                    if cs.fold(f) != w:
                        pron_cells[cs.fold(f)].add(w)
    # ...unless the spelling is a pronoun of its own: `oni` "they" is also a cell of literary `onen`, and the
    # Polish rule, applied blind, handed `onen` the count of "they" and left `oni` out of the deck.
    for k, owners in pron_cells.items():
        if k in D and all(e["pos"] == "pron" for e in D[k] if cs.live(e)) and cs.target(D[k]):
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


def live_word(D, w, colloquial=False):
    return w in D and any(e["pos"] in cs.TEACH_POS and any(cs.gloss(s_, colloquial=colloquial) or cs.parent(s_)
                                                            for s_ in e["senses"]) for e in D[w])


def resolve(D, text, pos=None):
    """{word, lemma, via?} for a list entry, or None.  `word` is the card's headword, `lemma` the dictionary
    word whose table gives the forms row, `via` the word whose senses give the meaning where the headword's
    own are pointers (`začínat` -> začít).  A list word may be taught in a colloquial sense (`cs.COLLOQUIAL`)."""
    t = re.sub(r"\s*\([^)]*\)", "", text).strip()
    # a slash in a multi-word row is a choice of forms (`neboj/te se`, `můžeš/můžete mi to hláskovat`), not
    # alternatives: read as one, the first was cut off and taught as `bát` and `moci`
    if not t or re.search(r"[+…,?!]|\bX\b", t) or (" " in t and "/" in t) or text in EXCLUDE:
        return None
    parts = t.split("/")
    alts = [parts[0]] + [p for p in parts[1:] if not ENDING.match(p)]
    for a in alts:
        a = a.strip()
        m = REFLEXIVE.match(a)
        if m and any(e["pos"] == "verb" for e in D.get(m.group(1), [])):
            base = m.group(1)
            if live_word(D, base, True):
                return {"word": a, "lemma": base}
            tg = cs.target(D.get(base, []))
            if tg and tg[0] == "via" and live_word(D, tg[1], True):
                return {"word": a, "lemma": base, "via": tg[1]}
        # A FORM IN THE LIST'S PART OF SPEECH: `starší` is listed as an adjective, "older", and Wiktionary's live
        # entry is a noun (a church elder); its adjective entry is "comparative degree of starý" -- a form, whose
        # card is the lemma's (the Polish rule for comparatives).
        # Adjectives only: `děkuju` is listed as a verb and is a form of děkovat, but its interjection "thank
        # you" is the formula the list means.
        if pos == {"adj"} and live_word(D, a, True) and not any(e["pos"] in pos and cs.live(e) for e in D[a]):
            tg = cs.target([e for e in D[a] if e["pos"] in pos])
            if tg and tg[0] == "form" and live_word(D, tg[1], True):
                return {"word": tg[1], "lemma": tg[1]}
        if live_word(D, a, True):
            return {"word": a, "lemma": a}
        tg = cs.target(D.get(a, []))
        if tg and live_word(D, tg[1], True):
            return {"word": a, "lemma": a, "via": tg[1]} if tg[0] == "via" else {"word": tg[1], "lemma": tg[1]}
        # BOTH SPELLINGS ARE CODIFIED: the list writes `benzin`, `vitamin`, `balon`, `vagon`, which the Czech rules
        # allow beside `benzín`, `vitamín`, `balón`, `vagón` -- the only spelling Wiktionary has an entry for.  The
        # card keeps the list's spelling and reads the other's meaning and table.
        if " " not in a and a not in D:
            for i, ch in enumerate(a):
                v = a[:i] + {"i": "í", "o": "ó", "u": "ú"}.get(ch, ch) + a[i + 1:]
                if v != a and live_word(D, v):
                    return {"word": a, "lemma": v, "via": v}
    return None


def pos_of(r):
    out = set()
    for p in r.get("pos", "").split(","):
        out |= POS.get(p.strip(), set())
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    a = ap.parse_args()
    D = cs.load_dict()
    S = json.load(open(os.path.join(cs.CACHE, "soupis.json"), encoding="utf-8"))
    counts = lemma_counts(D, read_frequency())
    below = cs_level.taught_below(a.level)

    words, unresolved, seen = [], [], set(below)
    for r in S[a.level]:
        if r["type"] == "vazba":
            continue
        got = resolve(D, r["text"], pos_of(r))
        if not got:
            unresolved.append(r["text"])
            continue
        if got["word"] in seen:
            prev = next((w for w in words if w["word"] == got["word"]), None)
            if prev and prev.get("pos") is not None:          # `ráno` is listed as a noun and as an adverb
                prev["pos"] = sorted(set(prev["pos"]) | pos_of(r))
            continue
        seen.add(got["word"])
        words.append(dict(got, official=r["type"], pos=sorted(pos_of(r))))
    # THE VERB OF A COLLOCATION.  `dělat` "to do" is on neither list as a word -- A1 names it only inside
    # `dělat sport`, A2 inside `dělat rád` and `dělat si`.  A multi-word row that is not itself a card, and whose
    # first word is a verb the list does not name as a word at this level or below, teaches that verb.
    from_coll = []
    for r in S[a.level]:
        # not a reflexive verb (`najíst se`: its base is not in the dictionary, and `objednat se` is excluded for
        # its meaning -- neither is a collocation) and not an excluded row
        if r["type"] == "vazba" or r["text"] not in unresolved or r["text"] in EXCLUDE or REFLEXIVE.match(r["text"]):
            continue
        head = re.sub(r"\s*\([^)]*\)", "", r["text"]).split(" ")[0].split("/")[0]
        if " " in r["text"] and not {head, head + " se", head + " si"} & seen and any(e["pos"] == "verb" and cs.live(e) for e in D.get(head, [])):
            seen.add(head)
            words.append({"word": head, "lemma": head, "official": "collocation", "pos": ["verb"],
                          "from": re.sub(r"\s*\([^)]*\)", "", r["text"])})
            from_coll.append("%s (%s)" % (head, r["text"]))
    print("  verbs taught from a collocation: %s" % (", ".join(from_coll) or "-"), file=sys.stderr)
    print("! not a card (a pattern, or not in the dictionary as one entry): %d -- %s"
          % (len(unresolved), " | ".join(unresolved)), file=sys.stderr)

    supplement = []
    pron_owner = defaultdict(set)
    for o, entries in D.items():
        for e in entries:
            if e["pos"] == "pron" and cs.live(e):
                for f, _ in cs.table_forms(e):
                    if cs.fold(f) != o:
                        pron_owner[cs.fold(f)].add(o)
    if a.level == "a1":
        listed = {x["word"] for lv in S for r in S[lv] for x in [resolve(D, r["text"])] if x}
        for w, n in sorted(counts.items(), key=lambda x: (-x[1], x[0])):
            if len(supplement) >= SUPPLEMENT_N:
                break
            pos = {e["pos"] for e in D.get(w, []) if cs.live(e)}
            if w in listed or w in seen or w in NOT_SUPPLEMENT or not pos or not pos <= CLOSED or cs.target(D[w]):
                continue
            # A CASE OF A COMMONER PRONOUN IS NOT A WORD: `mě`, `mně` and `ti` carry glossed entries of their own
            # ("me (accusative case)") and are cells of já's and ty's tables.  A rarer owner does not shadow:
            # `oni` "they" is also a cell of literary `onen`.
            # And a pronoun with a declension of its own is its own word: `ty` "you" is also a cell of ten's table.
            own_table = any(e["pos"] == "pron" and cs.live(e) and cs.table_forms(e) for e in D[w])
            if not own_table and any(counts.get(o, 0) > n for o in pron_owner.get(w, ())):
                continue
            seen.add(w)
            supplement.append({"word": w, "lemma": w, "supplement": True})
        for w in WHOLE:
            if w not in listed and w not in seen and live_word(D, w):
                seen.add(w)
                supplement.append({"word": w, "lemma": w, "supplement": True})
        print("  supplement: %s" % ", ".join(x["word"] for x in supplement), file=sys.stderr)
    words += supplement
    # A WORD WHOSE COUNT WENT TO ANOTHER is ordered by its own spelling's rows: `všechno` "everything" is a
    # cell of všechen's table, which took its count, and it sorted with the zero-count words at the end.
    raw = {}
    for w_, n_ in read_frequency():
        raw[w_] = raw.get(w_, 0) + n_
    for x in words:
        x["count"] = 0 if " " in x["lemma"] else round(max(counts.get(x["lemma"], 0), raw.get(x["word"], 0)))
    words.sort(key=lambda x: (" " in x["word"] and not REFLEXIVE.match(x["word"]), -x["count"], x["word"]))
    out = {"level": a.level, "official": len(words) - len(supplement), "supplement": len(supplement),
           "unresolved": unresolved, "words": words}
    with open(os.path.join(cs.CACHE, "wordlist-%s.json" % a.level), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print("wordlist-%s.json: %d words (%d official, %d supplement)" % (
        a.level, len(words), out["official"], len(supplement)), file=sys.stderr)


if __name__ == "__main__":
    main()
