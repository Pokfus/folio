#!/usr/bin/env python3
"""Stage 4: the cards, and the deck file.

    python3 .claude/czech/build_deck.py --level a1

Reads the word list and the examples, and writes `decks/Czech-<LEVEL>.folio-deck.json`.
Polish's stage adapted (`.claude/polish/build_deck.py`); what Czech changes is said where it happens.

THE MEANING is every taught sense of every live entry of the word, grouped by part of
speech, from Wiktionary (`cs.gloss` decides what a sense teaches).  Three Czech cases:
  * a REFLEXIVE headword (`bát se`, `dát si`) reads its base verb's senses tagged
    reflexive, unmarked -- the headword already says se or si; a base verb's card marks
    them "(se/si) …";
  * a word READ THROUGH ANOTHER (`začínat`, "imperfective form of začít"; `brzo`,
    "alternative form of brzy") takes that word's senses, under its own headword and
    with its own forms row;
  * a word of the official list whose every sense is COLLOQUIAL (`kafe`, `tamhle`) is
    taught in that sense, marked "(colloquial)" (`cs.COLLOQUIAL`).

THE FORMS ROW is what a learner cannot guess, READ from the dictionary's table and never
derived -- Czech stems alternate (`pes -> psa`, `dům -> domu`, `jít -> šel`):
  * noun: its GENDER, then genitive, locative and instrumental singular and nominative
    and genitive plural (`dům`: masculine inanimate · domu · domu · domem · domy · domů).
  * verb: its ASPECT and partner (`dělat` imperfective, perfective `udělat`), then `já`,
    `on` and `oni` of the present -- a perfective verb's present forms are its future,
    and Wiktionary labels them present -- and the past of `on`.
  * adjective: its comparative and superlative, when Wiktionary gives them.
  * personal pronoun: genitive, dative, accusative, instrumental, locative (the first
    form Wiktionary gives, the stressed one: `já` -> mne, mně, mne, mnou, mně).
"""
import argparse, html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cs, cs_level

POS_NAME = {"noun": "noun", "verb": "verb", "adj": "adjective", "adv": "adverb", "pron": "pronoun",
            "num": "numeral", "prep": "preposition", "conj": "conjunction", "det": "determiner",
            "intj": "interjection", "particle": "particle", "phrase": "phrase"}
CLOSED = {"prep", "conj", "particle", "pron"}
MAX_SENSES = 5
STAMP = 1794787200000                  # 2026-11-16, fixed so a re-run is byte-identical
E = lambda s: html.escape(s, quote=True)
REPORT = []

# WHICH READING LEADS, where Wiktionary's order would put the wrong one first -- each with its reason.
# The value is a part of speech, or the opening words of the entry's first gloss.
LEAD = {}

# A SENSE NOT TAUGHT though Wiktionary carries it untagged -- each with its reason.
DROP_SENSE = {
    ("udělat", "(se/si) to ejaculate semen, cum"),    # vulgar, untagged, beside "to do"
}
# An ENTRY not taught: a rare homograph of a supplement word, which has no list part of speech to narrow it.
DROP_ENTRY = {
    ("ono", "noun"),        # Freud's "id", beside the pronoun "it"
}
# A reflexive headword whose base verb's reflexive sense is NOT the list's: `vyčistit si (zuby)` is "to brush
# (one's teeth)", a dative si, and the one sense Wiktionary tags reflexive is the sky clearing.  The base verb's
# other senses are shown instead.
REFLEXIVE_BASE = {"vyčistit si"}


def entries(word, D, pos=None):
    L = [e for e in D.get(word, []) if e["pos"] in cs.TEACH_POS and (word, e["pos"]) not in DROP_ENTRY]
    if pos:     # the official list's part of speech, where Wiktionary has a live entry in it
        narrowed = [e for e in L if e["pos"] in pos and any(cs.sense_ok(s) for s in e["senses"])]
        L = narrowed or L
    if len(word) <= 2 and any(e["pos"] in CLOSED for e in L):
        L = [e for e in L if e["pos"] not in {"noun", "adj"}]
    lead = LEAD.get(word)
    if lead:
        hit = [e for e in L if e["pos"] == lead or any((cs.gloss(s) or "").startswith(lead) for s in e["senses"][:1])]
        L = hit[:1] + [e for e in L if e not in hit[:1]]
    return L


def collect(word, L, colloquial, only_reflexive):
    out = []
    for e in L:
        gl = []
        for s in e["senses"]:
            if only_reflexive and "reflexive" not in (s.get("t") or []):
                continue
            for g in ((cs.parent(s) if not only_reflexive else None),
                      cs.gloss(s, reflexive_mark=e["pos"] == "verb" and not only_reflexive, colloquial=colloquial)):
                if g and g not in gl and (word, g) not in DROP_SENSE:
                    gl.append(g)
        if gl:
            pos = POS_NAME[e["pos"]]
            prev = next((x for x in out if x[0] == pos), None)
            if prev:
                prev[1].extend(x for x in gl if x not in prev[1])
            else:
                out.append((pos, gl))
    return out


def senses_of(x, D):
    """The card's meanings: from `via` when the word is read through another, else from the lemma; a reflexive
    headword keeps only the reflexive senses (all of them, unmarked, if none is tagged); colloquial senses only
    when there is no other."""
    src = x.get("via") or x["lemma"]
    L = entries(src, D, x.get("pos"))
    refl = bool(re.search(r" (se|si)$", x["word"])) and x["word"] not in REFLEXIVE_BASE
    if x["word"] in REFLEXIVE_BASE:
        L = [dict(e, senses=[s for s in e["senses"] if "reflexive" not in (s.get("t") or [])]) for e in L]
    if refl and not any("reflexive" in (s.get("t") or []) for e in L for s in e["senses"]):
        refl = False
        REPORT.append("%s: no sense of %s is tagged reflexive; all are shown" % (x["word"], src))
    out = collect(src, L, False, refl) or collect(src, L, True, refl)
    if refl:   # a reflexive headword is a verb: the verb's senses only
        out = [(p, g) for p, g in out if p == "verb"] or out
    return [(p, g[:MAX_SENSES]) for p, g in out]


def english_html(senses):
    parts = []
    for pos, gl in senses:
        body = ('<div class="uc-gl">%s</div>' % E(gl[0]) if len(gl) == 1 else
                '<ol class="uc-gls">%s</ol>' % "".join("<li>%s</li>" % E(g) for g in gl))
        parts.append('<div class="uc-sense"><div class="uc-pos">%s</div>%s</div>' % (pos, body))
    return "".join(parts)


GENDER = {"m-an": "masculine animate", "m-in": "masculine inanimate", "f": "feminine", "n": "neuter"}
PLURALE = {"f-p", "m-in-p", "m-an-p", "n-p", "p"}
ANIMACY = {"m-an": "animate", "m-in": "inanimate"}


def first(t, need, avoid=()):
    return next((f for f, tg in t if need <= set(tg) and not set(tg) & set(avoid)), None)


def gender_of(head):
    """`m-an,m-in` (EITHER) shows both; a plural-only noun says so."""
    gs = [g for g in (head or "").split(",") if g in GENDER or g in PLURALE]
    if not gs:
        return None
    if all(g in PLURALE for g in gs):
        return "plural only"
    gs = [g for g in gs if g in GENDER]
    if len(gs) > 1 and all(g in ANIMACY for g in gs):
        return "masculine " + " or ".join(ANIMACY[g] for g in gs)
    return " or ".join(GENDER[g] for g in gs)


def noun_row(word, e):
    t = cs.table_forms(e)
    cells = []
    g = gender_of(e.get("head"))
    if g:
        cells.append(("gender", g))
    sing = any("singular" in tg for _, tg in t)
    want = ([("genitive", {"genitive", "singular"}), ("locative", {"locative", "singular"}),
             ("instrumental", {"instrumental", "singular"})] if sing else []) + \
           [("plural", {"nominative", "plural"}), ("gen. plural", {"genitive", "plural"})]
    for label, need in want:
        f = first(t, need)
        if f:
            cells.append((label, f))
    return cells


ASPECT = {"impf": "imperfective", "pf": "perfective", "both": "imperfective and perfective",
          "biasp": "imperfective and perfective"}


def verb_row(word, e):
    t = cs.table_forms(e)
    asp = (e.get("head") or "").split(",")[0]
    cells = []
    if asp in ASPECT:
        cells.append(("aspect", ASPECT[asp]))
        by_label = {}
        for p, tg in e.get("partner", []):
            lab = next((x for x in ("perfective", "imperfective") if x in tg), None)
            if lab and p and " " not in p and p not in by_label.get(lab, []):
                by_label.setdefault(lab, []).append(p)
        for lab in ("perfective", "imperfective"):
            if by_label.get(lab):
                cells.append((lab, " / ".join(by_label[lab][:2])))
    for label, need, avoid in [("já", {"present", "indicative", "singular", "first-person"}, ()),
                               ("on", {"present", "indicative", "singular", "third-person"}, ()),
                               ("oni", {"present", "indicative", "plural", "third-person"}, ()),
                               ("past", {"past", "participle", "singular", "masculine"}, {"passive"})]:
        f = first(t, need, avoid)
        if f:
            cells.append((label, f))
    if not any(l in ("já", "on", "oni", "past") for l, _ in cells):
        REPORT.append("%s: no person cells, no row" % word)
        return []
    return cells


SEEN = set()


def adj_row(word, e):
    """A COMPARATIVE IS SHOWN ONLY WHERE IT IS IN USE: Wiktionary prints one for every adjective its template can
    form, and `první` "first" came out with prvnější, `poslední` with poslednější, `celý` with celejší.  One that
    the subtitle list never has (`SEEN`, its 80,000 commonest spellings) is left off, with its superlative."""
    cells = []
    for label in ("comparative", "superlative"):
        f = first(e["forms"], {label}, cs.NONSTANDARD)
        if f and " " not in f and f != word and (label == "superlative" or cs.fold(f) in SEEN):
            cells.append((label, f))
    if cells and cells[0][0] != "comparative":
        return []
    return cells


def pron_row(word, e):
    t = cs.table_forms(e)
    nom = [tg for f, tg in t if "nominative" in tg]
    if not nom or any(set(tg) & {"masculine", "feminine", "neuter", "animate", "inanimate"} for tg in nom) \
            or e.get("head"):          # `on`, `ona`, `oni` carry their gender in the head: a row cannot hold them
        return []
    cells = []
    for case in ("genitive", "dative", "accusative", "instrumental", "locative"):
        f = first(t, {case})
        if f and f != word:
            cells.append((case, f))
    return cells


def forms_html(x, D):
    """The row from the lemma's MAIN entry -- the first live one, in the dictionary's order -- so a homograph's
    table is never shown.  A multi-word headword has no row, a reflexive verb its verb's."""
    lemma = x["lemma"]
    L = [e for e in entries(lemma, D, x.get("pos")) if any(cs.sense_ok(s) for s in e["senses"])] or entries(lemma, D)
    if not L or " " in lemma:
        return "", None
    e = L[0]
    if e["pos"] == "verb" and len(cs.table_forms(e)) < 10:
        e = next((y for y in D.get(lemma, []) if y["pos"] == "verb" and len(cs.table_forms(y)) >= 10), e)
    if e["pos"] == "noun":
        cells = noun_row(lemma, e)
    elif e["pos"] == "verb":
        cells = verb_row(lemma, e)
    elif e["pos"] == "adj":
        cells = adj_row(lemma, e)
    elif e["pos"] == "pron":
        cells = pron_row(lemma, e)
    else:
        return "", None
    if not cells or all(l == "gender" for l, _ in cells) and e["pos"] != "noun":
        return "", None
    return ('<div class="uc-forms">%s</div>' % "".join(
        '<span class="uc-fi"><span class="uc-fl">%s</span><b>%s</b></span>' % (l, E(f)) for l, f in cells),
        e["pos"])


TOKEN = re.compile(r"[A-Za-zÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž]+")


def mark(text, hit):
    parts = hit.split()
    toks = [(m.start(), m.end(), cs.fold(m.group())) for m in TOKEN.finditer(text)]
    for i in range(len(toks) - len(parts) + 1):
        if [x[2] for x in toks[i:i + len(parts)]] == parts:
            a, b = toks[i][0], toks[i + len(parts) - 1][1]
            return E(text[:a]) + "<b>" + E(text[a:b]) + "</b>" + E(text[b:])
    return E(text)


def examples_html(exs):
    return "".join(
        '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="%s"></span>%s</div>'
        '<div class="uc-exe">%s</div></div>' % (E(x["cs"]), mark(x["cs"], x["hit"]), E(x["en"])) for x in exs)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    a = ap.parse_args()
    lv = a.level
    D = cs.load_dict()
    with open(os.path.join(cs.CACHE, "cs_full.txt"), encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            if i >= 80000:
                break
            SEEN.add(cs.fold(line.rsplit(" ", 1)[0]))
    wl = json.load(open(os.path.join(cs.CACHE, "wordlist-%s.json" % lv), encoding="utf-8"))
    ex = json.load(open(os.path.join(cs.CACHE, "examples-%s.json" % lv), encoding="utf-8"))
    deck_id = cs_level.deck_id(lv)
    cards, refused = [], []
    stats = {"noun": 0, "verb": 0, "adj": 0, "pron": 0, "ex3": 0, "ex0": 0, "phrases": 0,
             "official": 0, "supplement": 0, "collocation": 0, "coll_eg": []}
    for x in wl["words"]:
        w = x["word"]
        senses = senses_of(x, D)
        if not senses:
            refused.append(w)
            continue
        forms, fpos = forms_html(x, D)
        if fpos:
            stats[fpos] += 1
        if " " in x["lemma"]:
            stats["phrases"] += 1
        stats["supplement" if x.get("supplement") else "official"] += 1
        if x.get("official") == "collocation":
            stats["collocation"] += 1
            stats["coll_eg"].append(x["from"])
        e = ex.get(w, [])
        stats["ex3"] += len(e) == 3
        stats["ex0"] += not e
        cards.append({
            "fields": {
                "Czech": '<div class="uc-word">%s<span class="uc-tts uc-say" data-say="%s"></span></div>' % (E(w), E(w)),
                "Word": w,
                "English": english_html(senses),
                "Forms": forms,
                "Examples": examples_html(e),
            },
            "id": "u_%s_%d" % (deck_id, len(cards) + 1),
            "type": "czech",
        })
    n = len(cards)
    css = open(os.path.join(cs.HERE, "card.css"), encoding="utf-8").read()
    meta = cs_level.meta(lv, n, stats, css, STAMP, cards)
    deck = {"folioDeck": 1, "exportedAt": STAMP, "meta": meta, "cards": cards, "gloss": {}}

    # EVERY ENGLISH SIDE UNIQUE, as on every deck of the shelf: the shared pass, last of all.
    import importlib.util as iu
    spec = iu.spec_from_file_location("dedupe_glosses", os.path.join(cs.HERE, "..", "dedupe-glosses.py"))
    dg = iu.module_from_spec(spec)
    spec.loader.exec_module(dg)
    st = dg.dedupe(deck, "Czech")
    if st["groups"]:
        print("  labelled %d notes in %d groups that shared an English side" % (st["labelled"], st["groups"]))

    out = os.path.abspath(os.path.join(cs.HERE, "..", "..", "decks", cs_level.file_of(lv)))
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(deck, fh, ensure_ascii=False)
    for r in REPORT:
        print("  ! " + r)
    if refused:
        print("  ! refused, no taught sense: " + ", ".join(refused))
    print("  wrote %s: %d notes = %d cards | %s | bytes %d" % (out, n, 2 * n, stats, os.path.getsize(out)))


if __name__ == "__main__":
    main()
