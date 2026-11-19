#!/usr/bin/env python3
"""The Arabic Alphabet deck's TABLE: every sound, comparison and rule quoted from a page at a pinned revision.

    python3 .claude/arabic/alphabet_table.py            # writes .claude/arabic/arabic-alphabet.json
    python3 .claude/arabic/alphabet_table.py --check    # the committed table is what the three revisions give

WHY IT EXISTS (Nov 2026, the Arabic beginner pass).  `alphabet.py` was "hand-written, no sources read": its 31
cards described each sound in words typed for the deck ("a voiced squeeze of the throat muscles", "the sound
Arabic is named for"), and it had no card for anything but a letter — though 453 of Arabic A1's 500 headwords
carry a fatḥa, 199 a sukūn, 64 a shadda.  This replaces it.  NOTHING ON A CARD IS TYPED HERE EXCEPT WHICH CELL
OR SENTENCE TO QUOTE: the script fetches three Wikipedia pages BY REVISION ID (cached in
`.claude/arabic-cache/wp-<revid>.wiki`), reads the cells out of their tables, and refuses to write a row whose
quoted sentence is not, word for word, in the revision it names.

  ipa     Help:IPA/Arabic — the IPA value and the "English approximation" cell of each letter and vowel sign,
          and its notes on ج, ظ and the l of Allāh
  abc     Arabic alphabet — each letter's four shapes and its Arabic name (the table of basic letters), and the
          sentences on joining, lām-alif, the hamza's carriers, ة and ى, the long vowels, the short vowels,
          nunation, gemination, the sukūn, the dagger alif and the hamzat al-waṣl
  sun     Sun and moon letters — the two lists and the rule for the article

A NAME'S ROMANISATION is `ar.translit` of the vowelled name, the pipeline's own rules (the level decks' scheme:
ʔ for hamza, ʕ for ʿayn).  A quoted sentence keeps Wikipedia's own romanisation (ALA-LC: fatḥah, ʾalif).  The
example words are not in this table: build-arabic-alphabet.js takes them from the shipped A1 deck by the `pick`
rule a row carries, so every example is an A1 card with its speaker and A1's own romanisation.

The table is the builder's only input besides A1, and it is committed; this script is run when a revision is
moved on purpose.  A row's `key` is what its note id is pinned to in arabic-ids.json: a letter's key is the
letter itself, as the deck's first 31 ids were seeded.
"""
import html, json, os, re, subprocess, sys, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ar

REV = {
    "ipa": ("Help:IPA/Arabic", 1380899154),
    "abc": ("Arabic alphabet", 1386233872),
    "sun": ("Sun and moon letters", 1378024909),
}
OUT = os.path.join(ar.HERE, "arabic-alphabet.json")


def fetch(key):
    title, rev = REV[key]
    p = os.path.join(ar.CACHE, "wp-%d.wiki" % rev)
    if not os.path.exists(p):
        os.makedirs(ar.CACHE, exist_ok=True)
        url = ("https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=ids|content&rvslots=main"
               "&format=json&revids=%d" % rev)
        raw = subprocess.run(["curl", "-sSfL", "-A", "deck-builder/1.0", url], check=True, capture_output=True).stdout
        page = list(json.loads(raw)["query"]["pages"].values())[0]
        r = page["revisions"][0]
        assert r["revid"] == rev and page["title"] == title, (page["title"], r["revid"])
        open(p, "w", encoding="utf-8").write(r["slots"]["main"]["*"])
    return open(p, encoding="utf-8").read()


def _tmpl(m):
    parts = [x.strip() for x in m.group(1).split("|")]
    name, args = parts[0].lower(), [x for x in parts[1:] if x and not re.match(r"^(name|size|attribute|date|p|pp|page|pages)=", x)]
    if not args:
        return ""
    if name in ("lang", "langx", "transliteration", "transl", "script/arabic", "script", "huge", "big"):
        return ("Arabic: " if name == "langx" else "") + args[-1]
    if name == "ipa":
        return args[-1] if args[0] != "ar" else "[" + args[-1] + "]"
    if name == "ipaslink":
        return "/" + args[0] + "/"
    if name == "ipablink":
        return "[" + args[0] + "]"
    if name == "ipa link":
        return args[0]
    if name in ("angbr", "angle bracket"):
        return "⟨" + args[0] + "⟩"
    if name == "gloss":
        return "'" + args[0] + "'"
    return ""


def expand(w):
    """Wikitext with its references and comments gone and its templates and links read as their text."""
    w = re.sub(r"<!--.*?-->", "", w, flags=re.S)
    w = re.sub(r"<ref[^>]*/>", "", w)
    w = re.sub(r"<ref.*?</ref>", "", w, flags=re.S)
    for _ in range(8):
        n = re.sub(r"\{\{([^{}]*)\}\}", _tmpl, w)
        if n == w:
            break
        w = n
    w = re.sub(r"\[\[(?:[^\]|]*\|)?([^\]]*)\]\]", r"\1", w)
    w = re.sub(r"\[https?://\S+ ([^\]]*)\]", r"\1", w)
    return w


def plain(w):
    w = expand(w).replace("'''", "").replace("''", "")
    w = re.sub(r"<br\s*/?>", " ", w)
    w = html.unescape(re.sub(r"<[^>]+>", "", w))
    return re.sub(r"\s+", " ", w).strip()


def bolded(w):
    """A cell as HTML: what the page prints bold (the letter of an English word) stays bold, italics go."""
    w = re.sub(r"<br\s*/?>", " ", expand(w))
    w = html.unescape(re.sub(r"<(?!/?u>)[^>]+>", "", w)).replace("<u>", "").replace("</u>", "")
    out, on = [], False
    for tok in re.split(r"('{2,5})", w):
        if re.fullmatch(r"'{2,5}", tok):
            if len(tok) in (3, 5):
                out.append("</b>" if on else "<b>")
                on = not on
            elif len(tok) == 4:
                out.append("'")
        else:
            out.append(html.escape(tok, quote=False))
    assert not on, w
    return re.sub(r"\s+", " ", "".join(out)).strip()


def table_rows(wikitext, start):
    i = wikitext.index(start)
    t = wikitext[wikitext.index("{|", i):]
    t = t[:t.index("\n|}")]
    rows = []
    for chunk in re.split(r"\n\|-[^\n]*", t):
        cells = [re.sub(r"^[^|\[{]*\|(?!\|)", "", c, count=1) if re.match(r"^\s*(?:style|colspan|rowspan|class)", c) else c
                 for c in re.split(r"\n[|!]", "\n" + chunk.strip())[1:]]
        if cells:
            rows.append([c.strip() for c in cells])
    return rows


def main():
    W = {k: fetch(k) for k in REV}
    P = {k: plain(W[k]) for k in REV}

    def q(src, text):
        """A sentence quoted from a page: refused unless it stands there word for word."""
        if text not in P[src]:
            sys.exit("NOT IN %s (revision %d): %s" % (REV[src][0], REV[src][1], text))
        return {"text": text, "src": src}

    # ---- Help:IPA/Arabic: ipa -> the English approximation cell ----
    like = {}
    for r in table_rows(W["ipa"], '{| class="wikitable"'):
        if len(r) >= 2 and "IPA" in r[0] and "colspan" not in r[0]:
            ipa = plain(re.sub(r"\{\{efn[^{}]*\}\}", "", r[0]))
            like.setdefault(ipa, bolded(r[1]))   # θ has a second row, "see under T—W"
    efn = {m.group(1): plain(m.group(2)) for m in re.finditer(r"\{\{efn\|name=(\w+)\|((?:[^{}]|\{\{[^{}]*\}\})*)\}\}", W["ipa"])}
    for k in efn:
        efn[k] = re.sub(r"\s*\((?:; )*\)\.?$", ".", efn[k]).strip()
    need = "a aː aj aw b d dˤ dʒ ð ðˤ f h ħ i iː j k l ɫ m n q r s sˤ ʃ t tˤ θ u uː w x ~ χ ɣ ~ ʁ z ʔ ʕ"
    for ipa in re.findall(r"\S+(?: ~ \S+)?", need):
        assert ipa in like, (ipa, sorted(like))

    def fn(name, text):
        if text not in efn[name]:
            sys.exit("NOT IN Help:IPA/Arabic note %s: %s | %s" % (name, text, efn[name]))
        return {"text": text, "src": "ipa"}

    # ---- Arabic alphabet: the table of basic letters ----
    letters = []
    for r in table_rows(W["abc"], "==== Table of basic letters ===="):
        # a cell's note ({{efn…}}) follows its content; hāʾ is written with a presentation form and {{lrm}}
        cut = [unicodedata.normalize("NFKC", c.split("{{efn")[0].replace("{{lrm}}", "")) for c in r]
        ar_items = [re.sub(r"[\[\]]", "", x) for c in cut for x in re.findall(r"\{\{lang\|ar\|([^{}|]*)\}\}", c)]
        name = next((x for x in ar_items if ar.MARKS.search(x.replace("ـ", ""))), None)
        if not name or len(ar_items) < 3:
            continue
        forms = ar_items[:ar_items.index(name)]
        ipa = [m for c in r for m in re.findall(r"\{\{IPAslink\|([^{}|]*)\}\}", c)]
        letters.append({"letter": forms[0], "forms": forms, "name": name, "ipa": ipa})
    assert len(letters) == 28 and letters[0]["letter"] == "ا" and letters[-1]["letter"] == "ي", [x["letter"] for x in letters]

    JOIN = q("abc", "six letters (و ,ز ,ر ,ذ ,د ,ا) can only be linked to their preceding letter")
    NONJOIN = set("ادذرزو")
    # the IPA key of each letter's row in Help:IPA/Arabic, where it is not the letter table's own
    KEY = {"ا": "aː", "ج": "dʒ", "خ": "x ~ χ", "غ": "ɣ ~ ʁ", "و": "w", "ي": "j"}
    NOTES = {
        "ا": [q("abc", "a long ā following a consonant other than a hamza is written with a short a sign (fatḥah) on the consonant plus an ʾalif after it")],
        "ج": [fn("jim", "The letter ج represents [ɡ] in Egypt and [ʒ] in the Levant and the Maghreb")],
        "ظ": [fn("Zaa", "The letter ظ represents either [ðˤ] or [zˤ], depending on the speaker's dialect")],
        "ل": [{"text": "[ɫ] (" + re.sub(r"</?b>", "", like["ɫ"]) + ")", "html": "[ɫ] (" + like["ɫ"] + ")", "src": "ipa"},
              fn("Allah", "[ɫ] occurs only in the word Allah")],
        "و": [{"text": "/uː/: " + re.sub(r"</?b>", "", like["uː"]), "html": "/uː/ " + like["uː"], "src": "ipa"},
              q("abc", "long ū as a sign for short u (ḍammah) plus a wāw")],
        "ي": [{"text": "/iː/: " + re.sub(r"</?b>", "", like["iː"]), "html": "/iː/ " + like["iː"], "src": "ipa"},
              q("abc", "long ī is written as a sign for short i (kasrah) plus a yāʾ")],
    }
    rows = []
    D = ar.load_dict()

    def agrees(a, b):
        """every vowel mark `a` writes is the one `b` has on that letter (a sukūn says nothing)"""
        ca, cb = ar._clusters(a), ar._clusters(b)
        return len(ca) == len(cb) and all(x[0] == y[0] and set(x[1]) - {ar.SUKUN} <= set(y[1]) for x, y in zip(ca, cb))

    def named(name, hint=""):
        """A letter's or sign's name as the English Wiktionary vowels it (kaikki), found from the name the
        Arabic alphabet page prints (vowelled or not); the page's own spelling where Wiktionary has no entry."""
        if ar.bare(name) not in ar.bare(P["abc"]) and name != "مدة":   # the page romanises the madda's name only
            sys.exit("the name %s is not on the Arabic alphabet page" % name)
        es = [e for e in D.get(ar.bare(name), []) if e["pos"] in ("noun", "name") and agrees(name, e["head"])]
        if len(es) > 1:
            es = [e for e in es if hint and any(hint in g for g in e["gl"])] or es
        heads = list(dict.fromkeys(e["head"] for e in es))
        if len(heads) > 1:
            sys.exit("two Wiktionary entries for the name %s: %s" % (name, heads))
        if heads:
            return heads[0], "wiktionary"
        if not ar.MARKS.search(name):
            sys.exit("no vowelled form for the name %s" % name)
        return name, "abc"

    def row(**kw):
        kw.setdefault("notes", [])
        kw.setdefault("shapes", [])
        if kw.get("name"):
            kw["name"], kw["nameSrc"] = named(kw["name"], kw.pop("hint", ""))
            kw["roman"] = ar.translit(kw["name"])
        rows.append(kw)

    CONTENT = ["noun", "adjective", "verb"]
    for L in letters:
        c = L["letter"]
        f = L["forms"]
        shapes = f if len(f) == 4 else [f[0], f[0], f[1], f[1]]
        ipa = KEY.get(c) or next(x for x in L["ipa"] if x in like)
        notes = list(NOTES.get(c, []))
        if c in NONJOIN:
            notes.append(JOIN)
        row(key=c, kind="letter", show=c, shapes=shapes, name=L["name"], value=ar.CONS.get(c, "ā"),
            ipa=ipa.split(" ~ ")[0], like=like[ipa].split(", could")[0], notes=notes,
            pick={"re": "^%s" % c if c != "ا" else "َا", "pos": CONTENT})

    # ---- hamza, tāʾ marbūṭa, alif maqṣūra: the deck's notes 29 to 31 ----
    row(key="ء", kind="letter", show="ء", name="هَمْزة", value="ʔ", ipa="ʔ", like=like["ʔ"].split(";")[0],
        notes=[q("abc", "The hamza /ʔ/ (glottal stop) can be written either alone, as if it were a letter, or with a carrier, when it becomes a diacritic.")],
        pick={"re": "ء", "pos": CONTENT})
    row(key="ة", kind="letter", show="ة", shapes=["ة", "", "", "ـة"], name="تاء مربوطة", value="-a / -at", ipa="", like="",
        notes=[q("abc", "Used in final position only as a marker of feminine gender for nouns and adjectives."),
               q("abc", "in Modern Standard Arabic it is only pronounced as such if the word is suffixed with a case ending or it is in the construct state, otherwise it is unpronounced or pronounced as /h/")],
        pick={"re": "ة$", "pos": CONTENT})
    row(key="ى", kind="letter", show="ى", shapes=["ى", "", "", "ـى"], name="ألف مقصورة", value="ā", ipa="aː", like=like["aː"].split(",")[0] + ", " + like["aː"].split(",")[1].strip(),
        notes=[q("abc", "Used only at the end of some words as a spelling convention for etymological reasons.")],
        pick={"re": "ى$", "pos": None})

    # ---- the signs: what a fully vowelled word carries beyond its letters ----
    SHORT = q("abc", "Short vowels may be written with diacritics placed above or below the consonant that precedes them in the syllable, called ḥarakāt.")
    row(key="sign:fatha", kind="sign", show="ـَ", name="فَتْحَة", hint="vowel", value="a", ipa="a", like=like["a"].split(", could")[0], notes=[SHORT],
        pick={"re": "^[^َُِ]َ[^َُِا]َ[^َُِا]َ?$", "pos": CONTENT})
    row(key="sign:kasra", kind="sign", show="ـِ", name="كَسْرَة", hint="vowel", value="i", ipa="i", like=like["i"],
        notes=[q("abc", 'Approximated to English "I" (as in "pick")')], pick={"re": "ِ(?!ي)", "pos": CONTENT})
    row(key="sign:damma", kind="sign", show="ـُ", name="ضَمَّة", value="u", ipa="u", like=like["u"],
        notes=[q("abc", 'Approximated to English "U" (as in "put")')], pick={"re": "ُ(?!و)", "pos": CONTENT})
    row(key="sign:sukun", kind="sign", show="ـْ", name="سُكُون", value=q("abc", "no vowel with this consonant letter")["text"], ipa="∅", like="",
        notes=[q("abc", "we would instead indicate that the l is followed by no vowel by marking it with a diacritic called sukūn")],
        pick={"re": "^[^ْ]{2,3}ْ[^ْ]{1,2}$", "pos": CONTENT})
    row(key="sign:shadda", kind="sign", show="ـّ", name="شَدَّة", hint="shadda", value=q("abc", "consonant doubled/geminated")["text"], ipa="ː", like="",
        notes=[q("abc", "Gemination is the doubling of a consonant. Instead of writing the letter twice, Arabic places a W-shaped sign called shaddah above it.")],
        pick={"re": "^(?!ال)(?!اَل).*ّ", "pos": CONTENT})
    TAN = q("abc", "In written Arabic, nunation is indicated by doubling the vowel diacritic at the end of the word, e.g. شُكْرًا šukran [ʃukran] 'thank you'.")
    TAN0 = q("abc", "is the addition of a final -n to a noun or adjective. The vowel before it indicates grammatical case.")
    row(key="sign:tanwin-an", kind="sign", show="ـً", name="تنوين", value="-an", ipa="an", like="", notes=[TAN, TAN0], pick={"re": "ً", "pos": None})
    row(key="sign:tanwin-in", kind="sign", show="ـٍ", name="تنوين", value="-in", ipa="in", like="", notes=[TAN0], pick={"re": "ٍ$", "pos": None})
    row(key="sign:tanwin-un", kind="sign", show="ـٌ", name="تنوين", value="-un", ipa="un", like="", notes=[TAN0], pick={"re": "ٌ$", "pos": None})
    row(key="sign:long-a", kind="sign", show="ـَا", value="ā", ipa="aː", like=like["aː"].split(", could")[0],
        notes=NOTES["ا"], pick={"re": "َا", "pos": CONTENT})
    row(key="sign:long-u", kind="sign", show="ـُو", value="ū", ipa="uː", like=like["uː"], notes=[NOTES["و"][1]], pick={"re": "ُو(?![َُِّْ])", "pos": CONTENT})
    row(key="sign:long-i", kind="sign", show="ـِي", value="ī", ipa="iː", like=like["iː"], notes=[NOTES["ي"][1]], pick={"re": "ِي(?![َُِّْ])", "pos": CONTENT})
    DIPH = q("abc", "y with sukūn will be unambiguously read as the diphthong /aj/, and w with sukūn will be read /aw/")
    row(key="sign:ay", kind="sign", show="ـَيْ", value="ay", ipa="aj", like=like["aj"], notes=[DIPH], pick={"re": "َيْ", "pos": CONTENT})
    row(key="sign:aw", kind="sign", show="ـَوْ", value="aw", ipa="aw", like=like["aw"], notes=[DIPH], pick={"re": "َوْ", "pos": CONTENT})
    row(key="sign:madda", kind="sign", show="آ", name="مدة", hint="diacritic", value="ʔā", ipa="ʔaː", like="",
        notes=[q("abc", 'Hamzat al-madd (آ) indicates a long /ʔ/ + /aː/ sound as in آسف ʾāsif /ʔaː.sif/ "sorry"')], pick={"re": "آ", "pos": None})
    row(key="sign:dagger", kind="sign", show="ـٰ", name="أَلِف خَنْجَرِيَّة", value="ā", ipa="aː", like="",
        notes=[q("abc", "It indicates a long /aː/ sound for which alif is normally not written.")], pick={"re": "ٰ", "pos": None})
    row(key="sign:lam-alif", kind="sign", show="لا", value="lā", ipa="laː", like="",
        notes=[q("abc", "some letter combinations are written as ligatures (special shapes), notably lām-alif لا"),
               q("abc", "which is the only mandatory ligature")], pick={"re": "لَا", "pos": None})

    # ---- the rules: one card each, a question on the front ----
    sun_rows = table_rows(W["sun"], "The sun and moon letters are as follows:")
    lists = [[re.sub(r"[\[\]]", "", x) for c in r for x in re.findall(r"\{\{lang\|ar\|([^{}|]*)\}\}", c)] for r in sun_rows]
    lists = [x for x in lists if len(x) == 14]
    assert len(lists) == 2 and set(lists[0]) == ar.SUN, lists
    rows.append({"key": "rule:direction", "kind": "rule", "show": "ا ب ت", "ask": "Which way is Arabic written, and how many letters has it?",
                 "says": [q("abc", "written from right-to-left in a cursive style, and includes 28 letters"),
                          q("abc", "The Arabic alphabet is always cursive and letters vary in shape depending on their position within a word.")],
                 "pick": None})
    rows.append({"key": "rule:joining", "kind": "rule", "show": "ا د ذ ر ز و", "ask": "What do these six letters never do?",
                 "says": [q("abc", "Generally, letters in the same word are linked together on both sides by short horizontal lines, but six letters (و ,ز ,ر ,ذ ,د ,ا) can only be linked to their preceding letter.")],
                 "pick": {"re": "^[^ادذرزو]َ?[ادذرزو][َُِْ]?[^ادذرزو ]", "pos": CONTENT}})
    rows.append({"key": "rule:hamza", "kind": "rule", "show": "أ إ ؤ ئ", "ask": "What do these four have in common?",
                 "says": [q("abc", "The hamza /ʔ/ (glottal stop) can be written either alone, as if it were a letter, or with a carrier, when it becomes a diacritic.")],
                 "picks": [{"re": "أ", "pos": None}, {"re": "إ", "pos": None}, {"re": "ؤ", "pos": None}, {"re": "ئ", "pos": None}]})
    rows.append({"key": "rule:moon", "kind": "rule", "show": "الْـ", "ask": "How is the article read before a moon letter?", "letters": lists[1],
                 "says": [q("sun", "When the Arabic definite article (الْـ) is followed by a moon letter, no assimilation takes place.")],
                 "pick": {"re": "^الْ", "pos": None, "single": True}})
    rows.append({"key": "rule:sun", "kind": "rule", "show": "الشَّـ", "ask": "How is the article read before a sun letter?", "letters": lists[0],
                 "says": [q("sun", "When followed by a sun letter, the /l/ of the Arabic definite article al- assimilates to the initial consonant of the following noun, resulting in a doubled consonant."),
                          q("sun", "al-shams ('the Sun') becomes ash-shams (assimilating the lām), while al-qamar ('the Moon') remains unchanged")],
                 "pick": {"re": "^ال[تثدذرزسشصضطظلن][ًٌٍَُِ]?ّ", "pos": None, "single": True}})
    rows.append({"key": "rule:wasl", "kind": "rule", "show": "ٱ", "ask": "What does this sign over an alif say, and where is it written?",
                 "says": [q("abc", "It indicates that the ʾalif is not pronounced as a glottal stop (written as the hamza), but that the word is connected to the previous word (like liaison in French). Outside of vocalised liturgical texts, the waṣla is usually not written.")],
                 "pick": {"re": "^اِ", "pos": ["noun"]}})
    rows.append({"key": "rule:unvowelled", "kind": "rule", "show": "قلب", "ask": "Why can this be read in more than one way?",
                 "says": [q("abc", "Users of Arabic usually write long vowels but omit short ones, so readers must utilize their knowledge of the language in order to supply the missing vowels."),
                          q("abc", 'the word qalb, "heart", is written qlb, and the word qalaba "he turned around", is also written qlb'),
                          q("abc", "In the Arabic handwriting of everyday use, in general publications, and on street signs, short vowels are typically not written.")],
                 "pick": None})

    # THE ORDER THE DECK IS DEALT IN: how the script runs, the three short vowels and the sukūn (every example
    # word from here on is printed with them), the 28 letters with the joining rule after the first of the six,
    # then what the letters alone do not say.
    order = (["rule:direction", "sign:fatha", "sign:kasra", "sign:damma", "sign:sukun", "ا", "rule:joining"]
             + [x["letter"] for x in letters[1:]]
             + ["sign:long-a", "sign:long-u", "sign:long-i", "sign:ay", "sign:aw", "sign:shadda", "ء", "rule:hamza", "sign:madda",
                "ة", "ى", "sign:tanwin-an", "sign:tanwin-in", "sign:tanwin-un", "sign:lam-alif", "sign:dagger",
                "rule:moon", "rule:sun", "rule:wasl", "rule:unvowelled"])
    by = {r["key"]: r for r in rows}
    assert sorted(order) == sorted(by), set(order) ^ set(by)
    table = {
        "_": "arabic-alphabet.json — the Arabic Alphabet deck's table, written by .claude/arabic/alphabet_table.py and read by build-arabic-alphabet.js. Every `like` is the English-approximation cell of Help:IPA/Arabic for that IPA value; every note and rule is a sentence of the page its `src` names, checked word for word against the revision below; a letter's shapes and name are its row of the table of basic letters. `roman` is ar.translit of the name. Do not edit by hand: change alphabet_table.py and re-run it.",
        "sources": {k: {"title": t, "revision": r, "url": "https://en.wikipedia.org/w/index.php?title=%s&oldid=%d" % (t.replace(" ", "_"), r)} for k, (t, r) in REV.items()},
        "rows": [by[k] for k in order],
    }
    text = json.dumps(table, ensure_ascii=False, indent=1) + "\n"
    if "--check" in sys.argv:
        if open(OUT, encoding="utf-8").read() != text:
            sys.exit("FAIL  arabic-alphabet.json is not what the pinned revisions give — run alphabet_table.py")
        print("arabic-alphabet.json matches the three pinned revisions: %d rows" % len(order))
        return
    open(OUT, "w", encoding="utf-8").write(text)
    print("wrote %s: %d rows (%d letters, %d signs, %d rules)" % (OUT, len(order), sum(r["kind"] == "letter" for r in rows),
                                                             sum(r["kind"] == "sign" for r in rows), sum(r["kind"] == "rule" for r in rows)))


if __name__ == "__main__":
    main()
