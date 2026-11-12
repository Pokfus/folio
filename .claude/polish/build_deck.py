#!/usr/bin/env python3
"""Stage 4: the cards, and the deck file.

    python3 .claude/polish/build_deck.py --level a1

Reads the word list and the examples, and writes `decks/Polish-<LEVEL>.folio-deck.json`.

THE MEANING is every taught sense of every live entry of the word, grouped by
part of speech, from Wiktionary (`pl.gloss` decides what a sense teaches).  A
sense Wiktionary files under the verb as reflexive is shown as "(się) …", since
that is how a learner meets it: `uczyć` "to teach", `(się) to learn`.  A word of
one or two letters that is a preposition, conjunction, particle or pronoun keeps
only those readings: `a` is not also "the vowel a", `na` not "surjective".

THE FORMS ROW is what a learner cannot guess, READ from the dictionary's table
and never derived -- Polish stems alternate (`pies -> psa`, `ręka -> ręce`,
`iść -> szedł`) and no rule reproduces that:
  * noun: its GENDER, then genitive, locative and instrumental singular and
    nominative and genitive plural (`dom`: masculine inanimate · domu · domu ·
    domem · domy · domów).  Where a case has two forms the first is shown.
  * verb: its ASPECT and its aspect partner (`robić` imperfective, perfective
    `zrobić`), then `ja`, `on` and `oni` of the present (of the future, for a
    perfective verb -- it has no present) and the past of `on`.
  * adjective: its comparative and superlative, when Wiktionary gives them.
  * personal pronoun: genitive, dative, accusative, instrumental, locative.
Numerals, gendered pronouns (`ten`, `mój`) and the rest show nothing rather
than a table a row cannot hold.
"""
import argparse, html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pl, pl_level

POS_NAME = {"noun": "noun", "verb": "verb", "adj": "adjective", "adv": "adverb", "pron": "pronoun",
            "num": "numeral", "prep": "preposition", "conj": "conjunction", "det": "determiner",
            "intj": "interjection", "particle": "particle"}
CLOSED = {"prep", "conj", "particle", "pron"}
MAX_SENSES = 5
STAMP = 1794182400000                  # 2026-11-09, fixed so a re-run is byte-identical
E = lambda s: html.escape(s, quote=True)
REPORT = []


# WHICH READING LEADS, where Wiktionary's order would put the wrong one first -- each with its reason.
# The value is a part of speech, or the opening words of the entry's first gloss.
LEAD = {
    "to": "pron",            # the demonstrative "this, that, it"; Wiktionary files the copula-like `to` first
    "bez": "prep",           # "without"; Wiktionary's first entry is the elder bush
    "zbyt": "particle",      # "too"; the first entry is the noun "sale"
    "stać": "to stand",
    "za": "prep",            # "behind, for, after"; the particle "too" (`za drogo`) is filed first
    "dość": "particle",      # "quite, enough"; the interjection "enough!, stop!" is filed first      # the first entry is `stać się` "to happen" (perfective), not "to stand"
    "halo": "intj",          # "hello?" on the telephone; the noun "halo" (of the moon) is filed first
    "piec": "verb",          # "to bake", taught with the cooking verbs; the noun "oven" is filed first
    "gołąbek": "piece of gołąbki",   # the cabbage roll; "pigeon", a mushroom and an endearment are filed first
    "tchórz": "coward",      # B1: "coward"; the polecat is filed first
    "wart": "adj",           # B1: "worth"; the noun "main current of a river" is filed first
    "dosyć": "particle",     # B2: "quite, enough", as for dość; the interjection is filed first
    "stop": "intj",          # C1: "stop!", which is what its count is; the noun "alloy" is filed first
}

# A SENSE NOT TAUGHT though Wiktionary carries it untagged -- each with its reason (B1, 2026-11-12).
DROP_SENSE = {
    ("ojczyzna", "male genitalia"),   # a joke sense with no register tag, beside "homeland"
}


def entries(word, D):
    L = [e for e in D.get(word, []) if pl.live(e)]
    if len(word) <= 2 and any(e["pos"] in CLOSED for e in L):
        L = [e for e in L if e["pos"] not in {"noun", "adj"}]
    lead = LEAD.get(word)
    if lead:
        hit = [e for e in L if e["pos"] == lead or any((pl.gloss(s) or "").startswith(lead) for s in e["senses"][:1])]
        L = hit[:1] + [e for e in L if e not in hit[:1]]
    return L


DIMINUTIVE = re.compile(r"^diminutive of (\w+)(?:; (.+))?$")


def diminutive(s, D):
    """A BARE DIMINUTIVE POINTER IS A MEANING (B2, 2026-11-12): `kotek` is "diminutive of kot", which
    `pl.gloss` drops as a pointer, so its card taught only "sweetie", `synek` a weaving term and `ptaszek`
    "checkmark".  The pointer is read as its target's first gloss, marked "(diminutive)": "cat (diminutive)".
    ONLY FOR A WORD THE INVENTORY TEACHES AS A DIMINUTIVE (B2's "diminutives" topic): applied everywhere it
    led `sałatka` with "lettuce (diminutive)" before "salad", and `walizka` with "trunk"."""
    t = set(s.get("t") or [])
    m = DIMINUTIVE.match((s.get("g") or [""])[-1].strip())
    if not m or (t & pl.NONSTANDARD) or pl.regional(t):
        return None
    if m.group(2):                       # `kotek`: "diminutive of kot; kitty (small or young cat)"
        return m.group(2)
    for e in D.get(m.group(1), []):
        if pl.live(e) and e["pos"] == "noun":
            for s2 in e["senses"]:
                g = pl.gloss(s2)
                if g:
                    return re.sub(r"\s*\([^)]*\)", "", g).strip() + " (diminutive)"
    return None


def senses_of(word, D, dim=False):
    out = []
    L = entries(word, D)
    if dim:     # `synek`'s "diminutive of syn" is an entry of its own, which `pl.live` does not count as live
        L = [e for e in D.get(word, []) if e not in L and any(diminutive(s, D) for s in e["senses"])] + L
    for e in L:
        gl = []
        for s in e["senses"]:
            for g in (pl.parent(s), pl.gloss(s) or (diminutive(s, D) if dim else None)):
                if g and g not in gl and (word, g) not in DROP_SENSE:
                    gl.append(g)
        if gl:
            pos = POS_NAME[e["pos"]]
            prev = next((x for x in out if x[0] == pos), None)
            if prev:
                prev[1].extend(x for x in gl if x not in prev[1])
            else:
                out.append((pos, gl))
    return [(p, g[:MAX_SENSES]) for p, g in out]


def english_html(senses):
    parts = []
    for pos, gl in senses:
        body = ('<div class="uc-gl">%s</div>' % E(gl[0]) if len(gl) == 1 else
                '<ol class="uc-gls">%s</ol>' % "".join("<li>%s</li>" % E(g) for g in gl))
        parts.append('<div class="uc-sense"><div class="uc-pos">%s</div>%s</div>' % (pos, body))
    return "".join(parts)


GENDER = {"m-pr": "masculine personal", "m-anml": "masculine animate", "m-in": "masculine inanimate",
          "f": "feminine", "n": "neuter"}
PLURALE = {"p", "pl", "vr-p", "nv-p", "m-pr-p", "mpr-p"}


def first(t, need, avoid=()):
    return next((f for f, tg in t if need <= set(tg) and not set(tg) & set(avoid)), None)


ANIMACY = {"m-pr": "personal", "m-anml": "animate", "m-in": "inanimate"}


def gender_of(head):
    """`m-anml,m-in` (autobus) is EITHER: both are shown, never only the first."""
    gs = [g for g in (head or "").split(",") if g in GENDER or g in PLURALE]
    if not gs:
        return None
    if all(g in PLURALE for g in gs):
        return "plural only"
    if len(gs) > 1 and all(g in ANIMACY for g in gs):
        return "masculine " + " or ".join(ANIMACY[g] for g in gs)
    return GENDER.get(gs[0]) or "plural only"


def noun_row(word, e):
    t = pl.table_forms(e)
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


def verb_row(word, e, D):
    t = pl.table_forms(e)
    # `impf-det` / `impf-indet`: a verb of motion is imperfective AND determinate (`iść`, one trip in one
    # direction) or indeterminate (`chodzić`, habitual or to and fro) -- its partners are named by that tag
    asp = (e.get("head") or "").split(",")[0].split("-")[0]
    cells = []
    if asp in ("impf", "pf"):
        cells.append(("aspect", "imperfective" if asp == "impf" else "perfective"))
        by_label = {}
        for p, tg in e.get("partner", []):
            lab = next((x for x in ("determinate", "indeterminate", "perfective", "imperfective") if x in tg), None)
            if lab and p and " " not in p and p not in by_label.get(lab, []):
                by_label.setdefault(lab, []).append(p)
        for lab in ("perfective", "imperfective", "determinate", "indeterminate"):
            if by_label.get(lab):
                cells.append((lab, " / ".join(by_label[lab][:2])))
    tense = "future" if asp == "pf" else "present"
    for label, need, avoid in [("ja", {tense, "singular"}, {"third-person", "second-person", "impersonal"}),
                               ("on", {tense, "singular", "third-person"}, {"impersonal"}),
                               ("oni", {tense, "plural", "third-person"}, {"impersonal"}),
                               ("past", {"past", "singular", "third-person", "masculine"}, {"impersonal"})]:
        f = first(t, need, avoid)
        if f:
            cells.append((label, f))
    # an impersonal verb (`można`, `trzeba`) has no person at all: no row, rather than an aspect on its own
    if not any(l in ("ja", "on", "oni", "past") for l, _ in cells):
        REPORT.append("%s: no person cells, no row" % word)
        return []
    return cells


def adj_row(word, e):
    cells = []
    for label in ("comparative", "superlative"):
        f = first(e["forms"], {label}, pl.NONSTANDARD)
        if f and " " not in f and f != word:
            cells.append((label, f))
    return cells


def pron_row(word, e):
    t = pl.table_forms(e)
    nom = [tg for f, tg in t if "nominative" in tg]
    if not nom or any(set(tg) & {"masculine", "feminine", "neuter", "virile", "nonvirile"} for tg in nom):
        return []
    cells = []
    for case in ("genitive", "dative", "accusative", "instrumental", "locative"):
        f = first(t, {case})
        if f and f != word:
            cells.append((case, f))
    return cells


def forms_html(word, D):
    """The row from the word's MAIN entry -- the first live one, in the dictionary's order -- so a homograph's
    table is never shown (`jak` "how" is not given the cases of `jak` "yak").  A verb whose first entry has
    no table (`nazywać`, whose table sits on its reflexive entry) takes the first verb entry that has one."""
    L = entries(word, D)
    if not L or " " in word:
        return "", None
    e = L[0]
    if e["pos"] == "verb" and len(pl.table_forms(e)) < 10:
        # the table may sit on an entry of the same verb that teaches nothing itself (`uważać`'s is on its
        # `uważać się` entry), so any verb entry of the word is asked, live or not
        e = next((x for x in L + D.get(word, []) if x["pos"] == "verb" and len(pl.table_forms(x)) >= 10), e)
    if e["pos"] == "noun":
        cells = noun_row(word, e)
    elif e["pos"] == "verb":
        cells = verb_row(word, e, D)
    elif e["pos"] == "adj":
        cells = adj_row(word, e)
    elif e["pos"] == "pron":
        cells = pron_row(word, e)
    else:
        return "", None
    if not cells or all(l == "gender" for l, _ in cells) and e["pos"] != "noun":
        return "", None
    return ('<div class="uc-forms">%s</div>' % "".join(
        '<span class="uc-fi"><span class="uc-fl">%s</span><b>%s</b></span>' % (l, E(f)) for l, f in cells),
        e["pos"])


TOKEN = re.compile(r"[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+")


def mark(text, hit):
    parts = hit.split()
    toks = [(m.start(), m.end(), pl.fold(m.group())) for m in TOKEN.finditer(text)]
    for i in range(len(toks) - len(parts) + 1):
        if [x[2] for x in toks[i:i + len(parts)]] == parts:
            a, b = toks[i][0], toks[i + len(parts) - 1][1]
            return E(text[:a]) + "<b>" + E(text[a:b]) + "</b>" + E(text[b:])
    return E(text)


def examples_html(exs):
    return "".join(
        '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="%s"></span>%s</div>'
        '<div class="uc-exe">%s</div></div>' % (E(x["pl"]), mark(x["pl"], x["hit"]), E(x["en"])) for x in exs)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    a = ap.parse_args()
    lv = a.level
    D = pl.load_dict()
    wl = json.load(open(os.path.join(pl.CACHE, "wordlist-%s.json" % lv), encoding="utf-8"))
    ex = json.load(open(os.path.join(pl.CACHE, "examples-%s.json" % lv), encoding="utf-8"))
    deck_id = "polish" + lv
    cards, refused = [], []
    stats = {"noun": 0, "verb": 0, "adj": 0, "pron": 0, "ex3": 0, "ex0": 0, "phrases": 0}
    for x in wl["words"]:
        w = x["word"]
        senses = senses_of(w, D, x.get("topic") == "diminutives")
        if not senses:
            refused.append(w)
            continue
        forms, fpos = forms_html(w, D)
        if fpos:
            stats[fpos] += 1
        if " " in w:
            stats["phrases"] += 1
        e = ex.get(w, [])
        stats["ex3"] += len(e) == 3
        stats["ex0"] += not e
        cards.append({
            "fields": {
                "Polish": '<div class="uc-word">%s<span class="uc-tts uc-say" data-say="%s"></span></div>' % (E(w), E(w)),
                "Word": w,
                "English": english_html(senses),
                "Forms": forms,
                "Examples": examples_html(e),
            },
            "id": "u_%s_%d" % (deck_id, len(cards) + 1),
            "type": "polish",
        })
    n = len(cards)
    inv = sum(1 for x in wl["words"] if "topic" in x and x["word"] not in refused)
    css = open(os.path.join(pl.HERE, "card.css"), encoding="utf-8").read()
    meta = pl_level.meta(lv, n, inv, stats, css, STAMP, cards)
    deck = {"folioDeck": 1, "exportedAt": STAMP, "meta": meta, "cards": cards, "gloss": {}}

    # EVERY ENGLISH SIDE UNIQUE, as on every deck of the shelf: the shared pass, last of all.
    import importlib.util as iu
    spec = iu.spec_from_file_location("dedupe_glosses", os.path.join(pl.HERE, "..", "dedupe-glosses.py"))
    dg = iu.module_from_spec(spec)
    spec.loader.exec_module(dg)
    st = dg.dedupe(deck, "Polish")
    if st["groups"]:
        print("  labelled %d notes in %d groups that shared an English side" % (st["labelled"], st["groups"]))

    out = os.path.abspath(os.path.join(pl.HERE, "..", "..", "decks", pl_level.FILE % lv.upper()))
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(deck, fh, ensure_ascii=False)
    for r in REPORT:
        print("  ! " + r)
    if refused:
        print("  ! refused, no taught sense: " + ", ".join(refused))
    print("  wrote %s: %d notes = %d cards | %s | bytes %d" % (out, n, 2 * n, stats, os.path.getsize(out)))


if __name__ == "__main__":
    main()
