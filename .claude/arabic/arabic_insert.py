#!/usr/bin/env python3
"""The cards an Arabic deck gains that its generator has not got: written into arabic-fixes.json's `insert`.

    python3 .claude/arabic/arabic_insert.py        # needs the generator's cache (run.py); then arabic-fix.js

WHY NOT THE INVENTORY (Nov 2026, the Arabic beginner pass).  A word added to `inventory.py` becomes a
competitor in every level above it: `مارس` "March" would share its spelling's count with B1's مَارَسَ "to
practise" and, by the homograph rule, take that card's bare sentences away.  So a card a level gains after
it shipped is a RECORD, rendered once and applied by arabic-fix.js — and nothing on it is typed:

  * the vowelled headword, the romanisation and the gender are the English Wiktionary's (kaikki.org, the
    generator's own `dict.json`), the entry named by its page, its part of speech and a word of its gloss;
    a headword Wiktionary prints with the wasla, a question mark or a stray space is cleaned by rule
    (ٱ → ا, no punctuation, a lone كَ joined to its word), and a headword it leaves unromanised, or one
    printed differently from its romanisation, is romanised by `ar.translit`;
  * each sentence is a Tatoeba sentence named by its id (`src`), read before it was listed here, under
    the corpus pin `examples.TATOEBA_MAX`; the highlighted word is found, not typed;
  * the markup is build_deck.py's own functions.

A MOVED card (`MOVES`) is not rendered at all: its seven fields are copied byte for byte from the deck it
leaves, on the first run, and kept as they stand in the record ever after (the deck it left no longer has
it — arabic-fix.js `dropDup`).

The English is written here, as `inventory.py` writes every other card's.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ar, build_deck, examples

FIXES = os.path.join(ar.HERE, "arabic-fixes.json")

# deck id, note number, Wiktionary page, part of speech there, a word of its gloss, the card's part of
# speech, the English, the Tatoeba sentence ids, why
GREG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
NEW = [
    ("arabica1", 506, "اسمي", "phrase", "my name is", "phrase", "my name is …", [7215531, 2423788, 383374],
     "The first thing a learner says, and no deck had it. Wiktionary's phrase entry اِسْمِي ..."),
    ("arabica1", 507, "ما اسمك", "phrase", "what is your name", "phrase", "what is your name? (to a man)", [332223],
     "The question that اِسْمِي answers. Wiktionary's phrase entry, whose second headword is the form said to a woman."),
]
_G = [("يناير", [448349]), ("فبراير", [383051]), ("مارس", [4940308, 371571, 373046]), ("أبريل", [1594420, 1932976, 672562]),
      ("مايو", [1054194, 1573397, 832728]), ("يونيو", [3659815, 7316984]), ("يوليو", [1901566, 376343]), ("أغسطس", [6129369]),
      ("سبتمبر", [376355, 6984186]), ("أكتوبر", [4923365, 13222173, 13554318]), ("نوفمبر", [1580682, 12173086]), ("ديسمبر", [8372719])]
for i, (page, ids) in enumerate(_G):
    NEW.append(("arabica1", 508 + i, page, "name|noun", GREG[i], "noun", GREG[i], ids,
                "A1's topics name \"time, days and months\" and no Arabic deck carded a month. The name used in Egypt, "
                "Sudan and Yemen (Wikipedia, \"Arabic names of Gregorian months\", revision 1351495669)."))
_L = [("كانون الثاني", []), ("شباط", []), ("آذار", [5297675]), ("نيسان", []), ("أيار", []), ("حزيران", []), ("تموز", [4954042]),
      ("آب", []), ("أيلول", [2604818]), ("تشرين الأول", [4122480]), ("تشرين الثاني", []), ("كانون الأول", [])]
for i, (page, ids) in enumerate(_L):
    NEW.append(("arabica2", 601 + i, page, "name", GREG[i], "noun", GREG[i] + " (the name used in Iraq and the Levant)", ids,
                "The second set of month names, \"used primarily in Iraq, Syria, Jordan, Lebanon and Palestine\" (Wikipedia, "
                "\"Arabic names of Gregorian months\", revision 1351495669); A1 has the other twelve."))

# deck it leaves, its headword there, deck it joins, its note number there, why
MOVES = [
    ("arabicphrase", "صَبَاح النُّور", "arabica1", 501, "The reply to A1's صَبَاحُ الْخَيْرِ, which a learner needs the day they learn the greeting; the phrases deck is the last on the shelf."),
    ("arabicphrase", "مَسَاء النُّور", "arabica1", 502, "The reply to A1's مَسَاءُ الْخَيْرِ."),
    ("arabicphrase", "شُكْرًا جَزِيلًا", "arabica1", 503, "A1 has شُكْرًا; this is the form a learner hears beside it."),
    ("arabicphrase", "إِلَى اللِّقَاءِ", "arabica1", 504, "A1 had one goodbye, مَعَ السَّلَامَةِ, said to the one leaving."),
    ("arabicphrase", "تَشَرَّفْنَا", "arabica1", 505, "The close of a first exchange of names."),
]


def clean(head):
    """Wiktionary's headword as the decks print one: the plain alif for the wasla, no punctuation, no
    ellipsis, and a lone attached pronoun joined to its word (kaikki splits مَا ٱسْمُ كَ؟)."""
    h = head.replace("ٱ", "ا").replace("؟", "").replace("...", "").replace("ىٰ", "ى")
    words = h.split()
    out = []
    for w in words:
        if out and w in ("كَ", "كِ"):
            out[-1] += w
        else:
            out.append(w)
    return " ".join(out)


def entry_of(D, page, pos, hint):
    es = [e for e in D.get(ar.bare(page), []) if e["pos"] in pos.split("|") and any(hint.lower() in g.lower() for g in e["gl"])]
    if len(es) != 1:
        sys.exit("%s: %d Wiktionary entries match %s / %s" % (page, len(es), pos, hint))
    return es[0]


def hit_of(sentence, head, e):
    """the word as the sentence writes it: its tokens in a row, the first allowed a clitic"""
    want = [ar.fold(x) for x in head.split()]
    forms = set(e.get("folded", [])) | {want[0]}
    toks = ar.tokens(sentence)
    for i in range(len(toks) - len(want) + 1):
        f = [ar.fold(t) for t in toks[i:i + len(want)]]
        first_ok = any(f[0] == p + x for p in ar.PREFIXES for x in (forms if len(want) == 1 else {want[0]}))
        if first_ok and f[1:] == want[1:]:
            a = sentence.index(toks[i])
            b = a
            for t in toks[i:i + len(want)]:
                b = sentence.index(t, b) + len(t)
            return sentence[a:b]
    sys.exit("no form of %s in the sentence %s" % (head, sentence))


def main():
    D = ar.load_dict()
    rec = json.load(open(FIXES, encoding="utf-8")) if os.path.exists(FIXES) else {}
    ins = rec.setdefault("insert", {})
    ara = {r[0]: r[2] for r in examples.read_tsv("ara_sentences.tsv.bz2") if len(r) >= 3}
    links = {}
    for r in examples.read_tsv("ara-eng_links.tsv.bz2"):
        if len(r) >= 2:
            links.setdefault(r[0], []).append(r[1])
    want_en = {e for deck, n, page, pos, hint, cpos, en, ids, why in NEW for i in ids for e in links.get(str(i), [])}
    eng = {r[0]: r[2] for r in examples.read_tsv("eng_sentences.tsv.bz2") if len(r) >= 3 and r[0] in want_en}

    def put(deck, entry):
        lst = ins.setdefault(deck, [])
        for i, x in enumerate(lst):
            if x["id"] == entry["id"]:
                lst[i] = entry
                return
        lst.append(entry)

    for src, head, deck, n, why in MOVES:
        have = next((x for x in ins.get(deck, []) if x["id"] == n), None)
        d = json.load(open(os.path.join(ar.DECKS, [f for f in os.listdir(ar.DECKS) if f.startswith("Arabic-Phrases")][0]), encoding="utf-8"))
        card = next((c for c in d["cards"] if c["fields"]["Word"] == head), None)
        if card:
            put(deck, {"word": head, "id": n, "from": "%s/%s" % (src, head), "why": why, "fields": card["fields"]})
        elif not have or have["word"] != head:
            sys.exit("%s is neither in %s nor in the record" % (head, src))
    for deck, n, page, pos, hint, cpos, en, ids, why in NEW:
        e = entry_of(D, page, pos, hint)
        head = clean(e["head"])
        if not build_deck.CLEAN.match(head.replace(" ", "")):
            sys.exit("%s: not clean Arabic after the rules: %s" % (page, head))
        roman = e.get("roman", "").replace("?", "").replace("...", "").strip()
        by_rule = not roman or " " in head and ar.translit(head).replace("-", "").replace(" ", "") != roman.replace("-", "").replace(" ", "")
        if by_rule:
            roman = ar.translit(head)
        w = {"head": head, "pos": cpos, "en": en, "topic": "time, days and months" if cpos == "noun" else "greetings and politeness",
             "key": ar.bare(page), "e": dict(e, head=head)}
        exs = []
        for sid in ids:
            s = ara.get(str(sid))
            ens = [eng[x] for x in sorted(links.get(str(sid), []), key=int) if x in eng]
            if not s or not ens:
                sys.exit("%s: Tatoeba %d has no Arabic sentence or no English one (is it above TATOEBA_MAX?)" % (head, sid))
            exs.append({"ar": s, "en": ens[0], "hit": hit_of(s, head, e)})
        put(deck, {"word": head, "id": n, "why": why,
                   "wiktionary": "%s (%s)%s" % (page, e["pos"], "; romanised by ar.translit" if by_rule else ""),
                   "src": ids,
                   "fields": {
                       "Arabic": '<div class="uc-word" dir="rtl" lang="ar">%s</div>' % build_deck.E(head),
                       "Word": head, "Roman": build_deck.E(roman), "English": build_deck.english_html(w),
                       "Forms": build_deck.forms_html(w), "Table": "", "Examples": build_deck.examples_html(exs)}})
        print("  %s %d  %s  [%s]%s  %s  %d sentence(s)" % (deck, n, head, roman, " (by rule)" if by_rule else "", en, len(exs)))
    for deck in ins:
        ins[deck].sort(key=lambda x: x["id"])
    json.dump(rec, open(FIXES, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("arabic-fixes.json: %s" % ", ".join("%s %d inserts" % (k, len(v)) for k, v in ins.items()))


if __name__ == "__main__":
    main()
