#!/usr/bin/env python3
"""Stage 4: the cards, and the deck file.

    python3 .claude/turkish/build_deck.py --level a1

Reads the word list and the examples, and writes
`decks/Turkish-<LEVEL>.folio-deck.json`.

THE MEANING is every taught sense of every live entry of the word, grouped by
part of speech, from Wiktionary.  A sense that only points at another word
("synonym of X") is shown by the English its own gloss carries in brackets
(`synonym of beri ("to give")`), else dropped -- a card is never defined in
Turkish (the 62 Indonesian cards).  A word left with no sense is refused and
reported.

THE FORMS ROW is the part of Turkish a learner cannot guess -- suffixes under
vowel harmony and consonant change -- READ from the dictionary's table, never
derived:
  * noun: plural, accusative, dative, locative, ablative, genitive
    (`kitaplar kitabı kitaba kitapta kitaptan kitabın`);
  * pronoun: the same cases, no plural (its plural is another card's word);
  * verb: present, aorist, past and future, third person singular
    (`gidiyor gider gitti gidecek`).  THE VERB TABLE'S PERSON TAGS ARE SHIFTED
    BY ONE ROW in this extraction (`giderim` is tagged third person), so a
    tense's cell is the THIRD row of that tense's first block, found by its
    tense tag, and every cell is checked against the shape its tense must have
    (`-yor`, `-r`, `-DI`, `-AcAk`) before it is printed.  A cell that fails is
    dropped and reported rather than shown wrong.
An adjective or adverb has no row: Turkish adjectives do not inflect.
"""
import argparse, html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tr, tr_level

POS_NAME = {"noun": "noun", "verb": "verb", "adj": "adjective", "adv": "adverb", "pron": "pronoun",
            "num": "numeral", "postp": "postposition", "conj": "conjunction", "det": "determiner",
            "intj": "interjection", "particle": "particle", "classifier": "counter word"}
MAX_SENSES = 5
XREF = re.compile(r"^(?:synonym|alternative form|(?:\w+ )?spelling|variant) of (\S+)(?:\s*\(“([^”]+)”\))?", re.I)
DROP_GLOSS = re.compile(r"^(only used in|used in the form|used in|\(used in)", re.I)
STAMP = 1793318400000                  # 2026-10-30, fixed so a re-run is byte-identical
E = lambda s: html.escape(s, quote=True)
REPORT = []
DATED_TERMS = {"Negro", "negro"}


def senses_of(word, D):
    """[(pos, [gloss])] for the live entries of the word, dictionary order, glosses de-duplicated."""
    out = []
    for e in D.get(word, []):
        if not tr.live(e):
            continue
        gl = []
        for s in e["senses"]:
            if not tr.sense_ok(s):
                continue
            g = tr.GRAM_HEAD.sub("", s["g"][-1].strip())
            m = XREF.match(g)
            if m:
                if not m.group(2):
                    continue
                g = m.group(2)
            if DROP_GLOSS.match(g) or tr.LETTER_GLOSS.search(g):
                continue
            # a dated English term inside an otherwise sound gloss is dropped, not shown: `siyahi` (the
            # neutral Turkish word) is glossed "black person of African descent, Negro"
            g = ", ".join(x for x in g.split(", ") if x not in DATED_TERMS)
            if g and g not in gl:
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


CASES = [("plural", {"nominative", "plural"}, {"possessive"}),
         ("accusative", {"accusative", "definite", "singular"}, {"possessive"}),
         ("dative", {"dative", "singular"}, {"possessive"}),
         ("locative", {"locative", "singular"}, {"possessive"}),
         ("ablative", {"ablative", "singular"}, {"possessive"}),
         ("genitive", {"genitive", "singular"}, {"possessive"})]
VERB = [("present", "continuative", lambda f: f.endswith("yor")),
        ("aorist", "aorist", lambda f: f.endswith("r")),
        ("past", "past", lambda f: re.search(r"[dt][ıiuü]$", f) is not None),
        ("future", "future", lambda f: re.search(r"(cak|cek)$", f) is not None)]
OTHER_TENSES = {"aorist", "continuative", "past", "future", "inferential", "progressive", "necessitative",
                "conditional", "optative", "imperative", "negative", "potential", "subjunctive"}


VOWEL_END = set("aeıioöuü")
# A vowel-final noun takes a buffer consonant before a case vowel: kapı-y-ı, kapı-y-a, kapı-n-ın -- and
# `n` after a lexicalised possessive (havalimanı-n-ı, birisi-n-e), `y` in `suyun`.  Wiktionary's table
# drops it altogether now and then (`belirtii`, `ezgii`): such a cell is dropped and reported.  A first
# version demanded the regular consonant and refused every lexicalised possessive.
BUFFER = {"accusative", "dative", "genitive"}


def cell_ok(word, label, f):
    if label not in BUFFER or word[-1] not in VOWEL_END or not f.startswith(word) or len(f) == len(word):
        return True
    return f[len(word)] not in VOWEL_END


def noun_row(word, e, pron=False):
    t = tr.table_forms(e, word)
    cells = []
    for label, need, avoid in CASES:
        if pron and label == "plural":
            continue
        hit = next((f for f, tg in t if need <= set(tg) and not set(tg) & avoid), None)
        if hit and hit != word:
            if not cell_ok(word, label, hit):
                REPORT.append("%s: %s cell %r lacks its buffer consonant, dropped" % (word, label, hit))
                continue
            cells.append((label, hit))
    return cells


FREQ = {}
AORIST_IR = {"al", "bil", "bul", "dur", "gel", "gör", "kal", "ol", "öl", "san", "var", "ver", "vur"}


VERB_CELLS = {}


def other_verbs_cell(form, word):
    """Whether `form` is a cell of another verb's table: `inceler` is incelemek's aorist, so it says nothing
    against incelmek's `incelir` (the first draft of this check dropped that correct cell)."""
    if not VERB_CELLS:
        for w, entries in tr.load_dict().items():
            for e in entries:
                if e["pos"] == "verb" and tr.live(e):
                    for f, _ in tr.table_forms(e, w):
                        VERB_CELLS.setdefault(tr.fold(f), set()).add(w)
    return bool(VERB_CELLS.get(tr.fold(form), set()) - {word})


def aorist_doubtful(f, word=""):
    """THE AORIST'S VOWEL IS THE ONE CELL A LEARNER CANNOT PREDICT, so it is checked against the corpus.
    `değmek`'s table gives `değir` (5 in the subtitles) where Turkish says `değer` (20,762); an aorist is
    dropped when it is rare (under 50) and the same stem with the other vowel is ten times commoner."""
    if not FREQ:
        with open(os.path.join(tr.CACHE, "tr_full.txt"), encoding="utf-8") as fh:
            for i, line in enumerate(fh):
                if i >= 300000:
                    break
                w, n = line.rsplit(" ", 1)
                FREQ[tr.fold(w)] = int(n)
    m = re.match(r"(.*)([aeıiuü])r$", f)
    if not m:
        return False
    other = {"a": "ı", "e": "i", "ı": "a", "i": "e", "u": "a", "ü": "e"}[m.group(2)]
    alt = m.group(1) + other + "r"
    if FREQ.get(f, 0) >= 50 or other_verbs_cell(alt, word):
        return False
    # A SECOND WITNESS, THE RULE: a one-syllable consonant stem takes -Ar, except a closed set of thirteen
    # that take -Ir.  `burmak`'s table gives `burır`, which neither the rule nor the corpus supports.
    stem = word[:-3]
    rule_says_ir = None
    if sum(c in VOWEL_END for c in stem) == 1 and stem[-1] not in VOWEL_END:
        rule_says_ir = stem in AORIST_IR
    rule_disagrees = rule_says_ir is not None and rule_says_ir != (m.group(2) in "ıiuü")
    return FREQ.get(alt, 0) > 10 * max(1, FREQ.get(f, 0)) or rule_disagrees


def verb_row(word, e):
    t = tr.table_forms(e, word)
    cells = []
    for label, tense, shape in VERB:
        # the block's first row: this tense's tag and no other tense's (`past` alone is the simple past;
        # `aorist`+`past` is the past habitual)
        start = next((i for i, (f, tg) in enumerate(t) if set(tg) & OTHER_TENSES == {tense}), None)
        if start is None or start + 2 >= len(t):
            REPORT.append("%s: no %s block" % (word, label))
            continue
        f = t[start + 2][0]
        if not shape(f) or f[0] != word[0]:
            REPORT.append("%s: %s cell %r has the wrong shape, dropped" % (word, label, f))
            continue
        if label == "aorist" and aorist_doubtful(f, word):
            REPORT.append("%s: aorist %r is rare in the corpus beside its other vowel, dropped" % (word, f))
            continue
        cells.append((label, f))
    return cells


CLOSED = {"adv", "postp", "conj", "det", "pron", "num", "intj", "particle", "classifier"}


def forms_html(word, D):
    """The row from the word's MAIN entry only -- the first live one, in the dictionary's order.

    Taking it from any entry with a table showed the declension of a homograph: `hayır` "no" got the
    cases of `hayır` "charity", `en` (the superlative) those of `en` "width".  And a noun's row is
    shown only where the word has no closed-class reading at all (`önce`, `sonra`, `yarın`, `karşı`,
    `olur` are nouns too, and their cases are not what a learner meets them as).  A compound's table
    is generated by Wiktionary and one is wrong (`diş ağrısıları`), so a compound has no row.
    The one exception to "main entry only" is a verb whose first entry has no table (below).
    """
    L = [e for e in D.get(word, []) if tr.live(e)]
    if not L or " " in word:
        return "", None
    e = L[0]
    if e["pos"] == "verb" and len(tr.table_forms(e, word)) < 20:
        # a verb's first entry may carry only its head (`dokunmak`); two verbs spelled alike share a stem
        # and conjugate alike, so the first verb entry with a table is used
        e = next((x for x in L if x["pos"] == "verb" and len(tr.table_forms(x, word)) >= 20), e)
    if e["pos"] == "verb":
        cells = verb_row(word, e)
    elif e["pos"] == "pron":
        cells = noun_row(word, e, pron=True)
    elif e["pos"] == "noun" and not any(x["pos"] in CLOSED for x in L):
        cells = noun_row(word, e)
    else:
        return "", None
    cells = [(l, f) for l, f in cells if f.strip("- ")]       # Wiktionary writes "-" for "no such form"
    if not cells:
        return "", None
    return ('<div class="uc-forms">%s</div>' % "".join(
        '<span class="uc-fi"><span class="uc-fl">%s</span><b>%s</b></span>' % (l, E(f)) for l, f in cells),
        e["pos"])


TOKEN = re.compile(r"[A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû]+")


def mark(text, hit):
    """The sentence, escaped, with the matched word (or compound) in <b>."""
    parts = hit.split()
    toks = [(m.start(), m.end(), tr.fold(m.group())) for m in TOKEN.finditer(text)]
    for i in range(len(toks) - len(parts) + 1):
        if [x[2] for x in toks[i:i + len(parts)]] == parts:
            a, b = toks[i][0], toks[i + len(parts) - 1][1]
            return E(text[:a]) + "<b>" + E(text[a:b]) + "</b>" + E(text[b:])
    return E(text)


def examples_html(exs):
    return "".join(
        '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="%s"></span>%s</div>'
        '<div class="uc-exe">%s</div></div>' % (E(x["tr"]), mark(x["tr"], x["hit"]), E(x["en"])) for x in exs)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    a = ap.parse_args()
    lv = a.level
    D = tr.load_dict()
    wl = json.load(open(os.path.join(tr.CACHE, "wordlist-%s.json" % lv), encoding="utf-8"))
    ex = json.load(open(os.path.join(tr.CACHE, "examples-%s.json" % lv), encoding="utf-8"))
    deck_id = "turkish" + lv
    cards, refused = [], []
    stats = {"nouns": 0, "verbs": 0, "pron": 0, "ex3": 0, "ex0": 0, "phrases": 0, "grammar": 0}
    for x in wl["words"]:
        w = x["word"]
        senses = senses_of(w, D)
        if not senses:
            refused.append(w)
            continue
        forms, fpos = forms_html(w, D)
        if fpos:
            stats[{"noun": "nouns", "verb": "verbs", "pron": "pron"}[fpos]] += 1
        if " " in w:
            stats["phrases"] += 1
        e = ex.get(w, [])
        stats["ex3"] += len(e) == 3
        stats["ex0"] += not e
        cards.append({
            "fields": {
                "Turkish": '<div class="uc-word">%s<span class="uc-tts uc-say" data-say="%s"></span></div>' % (E(w), E(w)),
                "Word": w,
                "English": english_html(senses),
                "Forms": forms,
                "Examples": examples_html(e),
            },
            "id": "u_%s_%d" % (deck_id, len(cards) + 1),
            "type": "turkish",
        })
    n = len(cards)
    inv = sum(1 for x in wl["words"] if "page" in x and x["word"] not in refused)
    gram = [x["word"] for x in wl["words"] if x.get("theme") == "grammar list" and x["word"] not in refused]
    stats["grammar"] = len(gram)
    stats["grammar_eg"] = [x["word"] for x in sorted((y for y in wl["words"] if y["word"] in gram),
                                                     key=lambda y: -y["count"])][:5]
    meta = tr_level.meta(lv, n, inv, stats, open(os.path.join(tr.HERE, "card.css"), encoding="utf-8").read(), STAMP, cards)
    deck = {"folioDeck": 1, "exportedAt": STAMP, "meta": meta, "cards": cards, "gloss": {}}

    # EVERY ENGLISH SIDE UNIQUE, as on every deck of the shelf: the shared pass, last of all.
    import importlib.util as iu
    spec = iu.spec_from_file_location("dedupe_glosses", os.path.join(tr.HERE, "..", "dedupe-glosses.py"))
    dg = iu.module_from_spec(spec)
    spec.loader.exec_module(dg)
    st = dg.dedupe(deck, "Turkish")
    if st["groups"]:
        print("  labelled %d notes in %d groups that shared an English side" % (st["labelled"], st["groups"]))

    out = os.path.abspath(os.path.join(tr.HERE, "..", "..", "decks", tr_level.FILE % lv.upper()))
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(deck, fh, ensure_ascii=False)
    for r in REPORT:
        print("  ! " + r)
    if refused:
        print("  ! refused, no taught sense: " + ", ".join(refused))
    stats.pop("grammar_eg", None)
    print("  wrote %s: %d notes = %d cards | %s | bytes %d" % (out, n, 2 * n, stats, os.path.getsize(out)))


if __name__ == "__main__":
    main()
