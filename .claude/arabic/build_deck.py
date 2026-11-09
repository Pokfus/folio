#!/usr/bin/env python3
"""Stage 4: the cards, and the deck file.

    python3 .claude/arabic/build_deck.py --level a1

Reads the word list and the examples, writes `decks/Arabic-<LEVEL>.folio-deck.json`.

THE HEADWORD is Wiktionary's vowelled canonical form, printed in full — an A1
learner reads by the short vowels — except where that form is not clean
Arabic (kaikki carries `قَبْلَ Audio:` and `أَهْلًا وَ سَهْلًا` with a stray
space): then, and for every multi-word greeting, the inventory's own spelling.
Every Arabic string on a card is wrapped `dir="rtl" lang="ar"`, so the page lays
it out right to left and picks an Arabic face, inside cards that are otherwise
English.

THE ROMANISATION is Wiktionary's (its standard scheme: ā ī ū for the long
vowels, ʔ for hamza, ʕ for ʿayn, ḥ ḵ ḏ š ṣ ḍ ṭ ẓ ḡ for the emphatic and
fricative letters), shown under the word on the back — the decks do not hide
the script behind it, they give a reader a check on what the letters say.

THE MEANING is the inventory's English (`inventory.py`), never Wiktionary's
dictionary glosses.

THE FORMS ROW, read from Wiktionary's tables, never derived:
  * noun: its gender and its plural(s) — Arabic plurals are mostly "broken"
    (كِتَاب → كُتُب) and cannot be guessed, so they are learnt with the noun;
  * adjective: the feminine, the plural, and the elative (كَبِير → أَكْبَر);
  * verb: the present (non-past) third person, the verbal noun and the verb's
    form (I–X), with a past and present table of eight persons behind the
    All forms fold.
"""
import argparse, html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ar, ar_level

E = lambda s: html.escape(s, quote=True)
STAMP = "2026-11-09T00:00:00.000Z"
CLEAN = re.compile("^[ء-ٰٟٱـ]+$")
POS_NAME = {"noun": "noun", "name": "noun", "verb": "verb", "adj": "adjective", "adv": "adverb",
            "pron": "pronoun", "prep": "preposition", "conj": "conjunction", "num": "number",
            "particle": "particle", "intj": "interjection", "phrase": "phrase", "det": "determiner"}
PERSONS = [("أَنَا", "f|m|s"), ("أَنْتَ", "s|m|s"), ("أَنْتِ", "s|f|s"), ("هُوَ", "t|m|s"),
           ("هِيَ", "t|f|s"), ("نَحْنُ", "f|m|p"), ("أَنْتُمْ", "s|m|p"), ("هُمْ", "t|m|p")]
REPORT = []
# nouns that work as determiners — "every", "some", "other than", "someone", "like", "self": a gender and
# a plural on their card describe a use an A1 learner does not meet
NOFORMS = {"كُلّ", "بَعْض", "غَيْر", "أَحَد", "مِثْل"}


def A(s, cls=""):
    """Arabic text, escaped, in its own right-to-left span."""
    return '<span%s dir="rtl" lang="ar">%s</span>' % (' class="%s"' % cls if cls else "", E(s))


def headword(w):
    h = w["e"]["head"]
    if " " in w["head"] or not CLEAN.match(h):
        if h != w["head"]:
            REPORT.append("headword: %s printed as the inventory's %s" % (h, w["head"]))
        return w["head"]
    return h


def forms_html(w):
    e, pos = w["e"], w["e"]["pos"]
    items = []
    if w["head"] in NOFORMS:
        return ""
    if pos in ("noun", "name") and " " not in w["head"]:
        if e.get("g"):
            items.append(("gender", {"m": "masculine", "f": "feminine"}[e["g"]], False))
        pl = [p for p in e.get("pl", []) if CLEAN.match(p)][:2]
        if pl:
            items.append(("plural", "، ".join(pl), True))
    elif pos == "adj":
        if e.get("fem"):
            items.append(("feminine", e["fem"][0], True))
        if e.get("apl"):
            items.append(("plural", "، ".join(e["apl"][:2]), True))
        if e.get("elat") and e["elat"][0] != e["head"]:
            items.append(("more", e["elat"][0], True))
    elif pos == "verb":
        if e.get("np"):
            items.append(("present", e["np"][0], True))
        vn = [v for v in dict.fromkeys(e.get("vn", [])) if CLEAN.match(v)]
        if vn:
            items.append(("verbal noun", vn[0], True))
        if e.get("form"):
            items.append(("form", e["form"], False))
    if not items:
        return ""
    return '<div class="uc-forms">' + "".join('<span class="uc-fi"><span class="uc-fl">%s</span>%s</span>' % (
        l, A(v) if ar_ else E(v)) for l, v, ar_ in items) + "</div>"


def table_html(w):
    e = w["e"]
    if e["pos"] != "verb" or not e.get("past") or not e.get("pres"):
        return ""
    blocks = []
    for name, key in (("past", "past"), ("present", "pres")):
        rows = "".join('<div class="uc-cjr"><span class="uc-cj-p">%s</span><span class="uc-cj-f">%s</span></div>'
                       % (A(p), A(e[key][k])) for p, k in PERSONS if e[key].get(k))
        blocks.append('<div class="uc-cj"><div class="uc-cjh">%s</div>%s</div>' % (name, rows))
    return '<div class="uc-cjg">%s</div>' % "".join(blocks)


def mark(text, hit):
    i = text.find(hit)
    if i < 0:
        return E(text)
    return E(text[:i]) + "<b>" + E(hit) + "</b>" + E(text[i + len(hit):])


def examples_html(exs):
    return "".join(
        '<div class="uc-exi"><div class="uc-exz" dir="rtl" lang="ar"><span class="uc-tts uc-exsay" data-say="%s"></span>%s</div>'
        '<div class="uc-exe">%s</div></div>' % (E(x["ar"]), mark(x["ar"], x["hit"]), E(x["en"])) for x in exs)


def english_html(w):
    pos = POS_NAME.get(w["pos"], w["pos"])
    if w["e"]["pos"] in ("noun", "name") and w["pos"] == "noun" and " " in w["head"]:
        pos = "phrase" if w["topic"] == "greetings and politeness" else "noun"
    return '<div class="uc-pos">%s</div><div class="uc-gl">%s</div>' % (E(pos), E(w["en"]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    a = ap.parse_args()
    lv = a.level
    wl = json.load(open(os.path.join(ar.CACHE, "wordlist-%s.json" % lv), encoding="utf-8"))
    ex = json.load(open(os.path.join(ar.CACHE, "examples-%s.json" % lv), encoding="utf-8"))
    deck_id = "arabic" + lv
    cards = []
    stats = {"nouns_pl": 0, "verbs": 0, "adjs": 0, "ex3": 0, "ex0": 0, "roman": 0}
    for i, w in enumerate(wl["words"]):
        h = headword(w)
        roman = w["e"].get("roman", "")
        forms = forms_html(w)
        stats["nouns_pl"] += 'uc-fl">plural' in forms and w["e"]["pos"] in ("noun", "name")
        stats["verbs"] += w["e"]["pos"] == "verb"
        stats["adjs"] += w["e"]["pos"] == "adj"
        stats["roman"] += bool(roman)
        e = ex.get(str(i), [])
        stats["ex3"] += len(e) == 3
        stats["ex0"] += not e
        cards.append({
            "sub": "",
            "fields": {
                "Arabic": '<div class="uc-word" dir="rtl" lang="ar">%s</div>' % E(h),
                "Word": h,
                "Roman": E(roman),
                "English": english_html(w),
                "Forms": forms,
                "Table": table_html(w),
                "Examples": examples_html(e),
            },
            "id": "u_%s_%d" % (deck_id, len(cards) + 1),
            "type": "arabic",
        })
    css = open(os.path.join(ar.HERE, "card.css"), encoding="utf-8").read()
    meta = ar_level.meta(lv, cards, wl, stats, css, STAMP)
    deck = {"folioDeck": 1, "exportedAt": STAMP, "meta": meta, "cards": cards, "gloss": {}}
    out = os.path.abspath(os.path.join(ar.DECKS, ar_level.FILE % lv.upper()))
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(deck, fh, ensure_ascii=False)
    for r in REPORT:
        print("  ! " + r)
    print("  wrote %s: %d notes = %d cards | %s | bytes %d" % (out, len(cards), 2 * len(cards), stats,
                                                              os.path.getsize(out)))


if __name__ == "__main__":
    main()
