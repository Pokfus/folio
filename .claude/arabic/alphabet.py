#!/usr/bin/env python3
"""The Arabic Alphabet deck: the 28 letters and the three spellings a beginner meets at once.

    python3 .claude/arabic/alphabet.py

HAND-WRITTEN, NO SOURCES READ: the alphabet, its letter names, its joining forms
and the sound of each letter are the common knowledge of every Arabic primer; the
example words are A1 words of the level deck.  Writes
`decks/Arabic-Alphabet.folio-deck.json`.

ORDER is the standard modern (hijāʾī) order, letters grouped by shape (ب ت ث,
ج ح خ …), then hamza, tāʾ marbūṭa and alif maqṣūra, which are not letters of the
28 but are on the first page of every A1 text.

THE FOUR SHAPES.  An Arabic letter takes a different shape alone, at the start,
in the middle and at the end of a word; six letters (ا د ذ ر ز و) never join to
the letter after them, so they have two shapes only.  Every note shows all of
them, the tatweel ـ standing for the neighbouring letters.

THE ROMANISATION is the level decks' (Wiktionary's): ṯ ḵ ḏ š ṣ ḍ ṭ ẓ ḡ for the
letters English has no single letter for, ʕ for ʿayn and ʔ for hamza.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ar, ar_level

E = lambda s: html.escape(s, quote=True)
STAMP = "2026-11-09T00:00:00.000Z"

# isolated, initial, medial, final | name | roman name | roman letter | sound | example | its English
LETTERS = [
    ("ا", "ا", "ـا", "ـا", "أَلِف", "alif", "ā", "a long \"a\" as in father; at the start of a word it carries a hamza or a short vowel", "بَاب", "door"),
    ("ب", "بـ", "ـبـ", "ـب", "بَاء", "bāʔ", "b", "\"b\" as in bed", "بَيْت", "house"),
    ("ت", "تـ", "ـتـ", "ـت", "تَاء", "tāʔ", "t", "\"t\" as in ten", "تَمْر", "dates (the fruit)"),
    ("ث", "ثـ", "ـثـ", "ـث", "ثَاء", "ṯāʔ", "ṯ", "\"th\" as in think", "ثَلْج", "snow"),
    ("ج", "جـ", "ـجـ", "ـج", "جِيم", "jīm", "j", "\"j\" as in jam (in Egypt a hard \"g\" as in go)", "جَمَل", "camel"),
    ("ح", "حـ", "ـحـ", "ـح", "حَاء", "ḥāʔ", "ḥ", "a strong, breathy \"h\" pushed from deep in the throat — English has no near equivalent", "حَلِيب", "milk"),
    ("خ", "خـ", "ـخـ", "ـخ", "خَاء", "ḵāʔ", "ḵ", "\"ch\" as in Scottish loch or German Bach", "خُبْز", "bread"),
    ("د", "د", "ـد", "ـد", "دَال", "dāl", "d", "\"d\" as in dog", "دَرْس", "lesson"),
    ("ذ", "ذ", "ـذ", "ـذ", "ذَال", "ḏāl", "ḏ", "\"th\" as in this", "ذَهَبَ", "to go"),
    ("ر", "ر", "ـر", "ـر", "رَاء", "rāʔ", "r", "a tapped or rolled \"r\", as in Spanish pero", "رَأْس", "head"),
    ("ز", "ز", "ـز", "ـز", "زَاي", "zāy", "z", "\"z\" as in zoo", "زَوْج", "husband"),
    ("س", "سـ", "ـسـ", "ـس", "سِين", "sīn", "s", "\"s\" as in sun", "سَمَك", "fish"),
    ("ش", "شـ", "ـشـ", "ـش", "شِين", "šīn", "š", "\"sh\" as in ship", "شَمْس", "sun"),
    ("ص", "صـ", "ـصـ", "ـص", "صَاد", "ṣād", "ṣ", "an emphatic \"s\": said with the back of the tongue raised, which darkens the vowels beside it", "صَبَاح", "morning"),
    ("ض", "ضـ", "ـضـ", "ـض", "ضَاد", "ḍād", "ḍ", "an emphatic \"d\" — the sound Arabic is named for, \"the language of the ḍād\"", "ضَيْف", "guest"),
    ("ط", "طـ", "ـطـ", "ـط", "طَاء", "ṭāʔ", "ṭ", "an emphatic \"t\"", "طَعَام", "food"),
    ("ظ", "ظـ", "ـظـ", "ـظ", "ظَاء", "ẓāʔ", "ẓ", "an emphatic \"th\" as in this (in much of the Arab world said as an emphatic \"z\")", "ظُهْر", "noon"),
    ("ع", "عـ", "ـعـ", "ـع", "عَيْن", "ʕayn", "ʕ", "a voiced squeeze of the throat muscles — English has no near equivalent", "عَيْن", "eye"),
    ("غ", "غـ", "ـغـ", "ـغ", "غَيْن", "ḡayn", "ḡ", "a gargled sound like the French \"r\" in Paris", "غُرْفَة", "room"),
    ("ف", "فـ", "ـفـ", "ـف", "فَاء", "fāʔ", "f", "\"f\" as in fish", "فَم", "mouth"),
    ("ق", "قـ", "ـقـ", "ـق", "قَاف", "qāf", "q", "a \"k\" said further back, against the uvula", "قَلَم", "pen"),
    ("ك", "كـ", "ـكـ", "ـك", "كَاف", "kāf", "k", "\"k\" as in kite", "كِتَاب", "book"),
    ("ل", "لـ", "ـلـ", "ـل", "لَام", "lām", "l", "\"l\" as in lamp", "لَيْل", "night"),
    ("م", "مـ", "ـمـ", "ـم", "مِيم", "mīm", "m", "\"m\" as in moon", "مَاء", "water"),
    ("ن", "نـ", "ـنـ", "ـن", "نُون", "nūn", "n", "\"n\" as in noon", "نَار", "fire"),
    ("ه", "هـ", "ـهـ", "ـه", "هَاء", "hāʔ", "h", "\"h\" as in house — said even at the end of a word", "هَاتِف", "telephone"),
    ("و", "و", "ـو", "ـو", "وَاو", "wāw", "w / ū", "\"w\" as in wet; after a consonant, often the long vowel \"oo\" as in moon", "وَلَد", "boy"),
    ("ي", "يـ", "ـيـ", "ـي", "يَاء", "yāʔ", "y / ī", "\"y\" as in yes; after a consonant, often the long vowel \"ee\" as in machine", "يَد", "hand"),
    ("ء", "", "", "", "هَمْزَة", "hamza", "ʔ", "the catch in the throat in the middle of \"uh-oh\"; written alone or on a seat — أ إ ؤ ئ", "سُؤَال", "question"),
    ("ة", "", "", "ـة", "تَاء مَرْبُوطَة", "tāʔ marbūṭa", "-a / -at", "found only at the end of a word, mostly a feminine one: said \"a\", and \"t\" when a word follows it closely", "مَدِينَة", "city"),
    ("ى", "", "", "ـى", "أَلِف مَقْصُورَة", "alif maqṣūra", "ā", "found only at the end of a word: a long \"a\" spelt with a yāʔ that has lost its dots", "عَلَى", "on"),
]
NON_JOINING = "اد ذرزو".replace(" ", "")

SAY = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>'
CARDS = [
    {"name": "Letter → sound",
     "front": '<div class="uc-letter" dir="rtl" lang="ar">{{Letter}}' + SAY + "</div>",
     "back": "{{FrontSide}}{{#Shapes}}{{Shapes}}{{/Shapes}}<hr><div class=\"uc-field\"><div class=\"uc-pos\">name</div>"
             "<div class=\"uc-gl\"><span dir=\"rtl\" lang=\"ar\">{{Name}}</span> <span class=\"uc-rom\">{{Roman}}</span></div>"
             "<div class=\"uc-pos uc-gap\">sound</div><div class=\"uc-gl\">{{Sound}}</div>"
             "<div class=\"uc-pos uc-gap\">as in</div><div class=\"uc-gl\">{{Example}}"
             "<span class=\"uc-tts uc-say\" data-say=\"{{Word}}\"></span></div></div>"},
    {"name": "Sound → letter",
     "front": "<div class=\"uc-ask\">Which letter is this?</div><div class=\"uc-field\"><div class=\"uc-pos\">name</div>"
              "<div class=\"uc-gl\"><span class=\"uc-rom\">{{Roman}}</span></div>"
              "<div class=\"uc-pos uc-gap\">sound</div><div class=\"uc-gl\">{{Sound}}</div></div>",
     "back": "{{FrontSide}}<hr><div class=\"uc-letter\" dir=\"rtl\" lang=\"ar\">{{Letter}}" + SAY + "</div>"
             "{{#Shapes}}{{Shapes}}{{/Shapes}}<div class=\"uc-field\"><div class=\"uc-pos\">name</div>"
             "<div class=\"uc-gl\"><span dir=\"rtl\" lang=\"ar\">{{Name}}</span></div><div class=\"uc-pos uc-gap\">as in</div><div class=\"uc-gl\">{{Example}}"
             "<span class=\"uc-tts uc-say\" data-say=\"{{Word}}\"></span></div></div>"},
]
CSS = """.card {
  text-align: center;
  font-size: 17px;
  line-height: 1.6;
}
[dir="rtl"] {
  font-family: "Noto Naskh Arabic", "Geeza Pro", "Arabic Typesetting", "Traditional Arabic", "Amiri", serif;
}
.uc-ask {
  margin-bottom: 14px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
.uc-letter {
  font-size: 76px;
  font-weight: 400;
  line-height: 1.5;
}
.uc-say {
  margin-right: 14px;
  vertical-align: middle;
  font-size: 15px;
}
/* the four shapes, read right to left as the script is: alone, first, middle, last */
.uc-shapes {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 6px;
}
.uc-sh {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.uc-shf {
  font-size: 34px;
  line-height: 1.5;
}
.uc-shl {
  font-family: system-ui, sans-serif;
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.5;
}
.uc-field {
  display: block;
  width: fit-content;
  min-width: min(300px, 100%);
  max-width: 100%;
  margin: 14px auto 0;
  padding: 11px 15px;
  border: 1px solid var(--rule, rgba(0,0,0,0.12));
  border-radius: 11px;
  text-align: left;
  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));
}
.uc-pos {
  margin-bottom: 3px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint, #6C6A63);
}
.uc-gap {
  margin-top: 10px;
}
.uc-gl {
  line-height: 1.5;
}
.uc-gl [dir="rtl"] {
  font-size: 22px;
}
.uc-rom {
  font-style: italic;
  opacity: 0.75;
}
.uc-ex {
  font-size: 24px;
}
.uc-exe {
  margin-left: 8px;
  opacity: 0.62;
}
.uc-gl .uc-say {
  margin-right: 0;
  margin-left: 10px;
}
"""


def A(s, cls=""):
    return '<span%s dir="rtl" lang="ar">%s</span>' % (' class="%s"' % cls if cls else "", E(s))


def shapes(iso, ini, med, fin):
    cells = [("alone", iso), ("start", ini), ("middle", med), ("end", fin)]
    cells = [(l, f) for l, f in cells if f]
    if len(cells) < 2:
        return ""
    # right to left, as the script reads: the flex row is laid out rtl
    return '<div class="uc-shapes" dir="rtl">' + "".join(
        '<span class="uc-sh"><span class="uc-shf" lang="ar">%s</span><span class="uc-shl" dir="ltr">%s</span></span>'
        % (E(f), l) for l, f in cells) + "</div>"


def main():
    cards = []
    for iso, ini, med, fin, name, rname, rlet, sound, ex, exen in LETTERS:
        note = sound
        if iso in NON_JOINING:
            note += "; it never joins to the letter after it"
        cards.append({
            "sub": "",
            "fields": {
                "Letter": E(iso),
                "Shapes": shapes(iso, ini, med, fin),
                # PLAIN TEXT, not a span: the template puts {{Name}} into the speaker's data-say attribute
                "Name": E(name),
                "Roman": E("%s — %s" % (rname, rlet)),
                "Sound": E(note),
                "Example": A(ex, "uc-ex") + '<span class="uc-exe">%s</span>' % E(exen),
                "Word": ex,
            },
            "id": "u_arabc_%d" % (len(cards) + 1),
            "type": "ar-abc",
        })
    meta = {
        "id": "arabc",
        "title": "Arabic Alphabet",
        "subtitle": "%d letters and signs · both directions, as two cards per letter" % len(cards),
        "desc": ("The 28 letters of the Arabic alphabet in their standard order, followed by the three spellings "
                 "every first text uses — hamza (ء), tāʔ marbūṭa (ة) and alif maqṣūra (ى) — the first deck of the "
                 "Arabic collection. Both directions: see a letter and recall its name and sound, or see its name "
                 "and sound and recall the letter, each a card with its own schedule. Arabic is written right to "
                 "left, and a letter changes shape with its place in the word, so every note shows the letter alone "
                 "and at the start, in the middle and at the end of a word; six letters (ا د ذ ر ز و) never join "
                 "to the letter after them and have two shapes only. Every note gives the letter's name as an Arab "
                 "says it when spelling a word aloud, with its romanisation in the scheme the level decks use, its "
                 "sound described in English words, and one everyday word from the A1 deck that shows it, printed "
                 "with its short vowels and with a speaker beside it. The sounds are approximations, as every "
                 "learner's alphabet gives them; where English has no near equivalent, as for ح and ع, the card "
                 "says so. The short vowels themselves are small marks above and below the letters and are not "
                 "letters of the alphabet, so they are not cards here; the level decks print them on every word."),
        "author": "",
        "language": "en",
        "color": ar_level.COLOR,
        "tags": ["arabic", "alphabet", "العربية"],
        "glossMode": "site",
        "types": {"ar-abc": {"id": "ar-abc", "name": "Arabic letter", "speechLang": "ar",
                             "fields": ["Letter", "Shapes", "Name", "Roman", "Sound", "Example", "Word"],
                             "cards": CARDS, "css": CSS}},
        "version": 1, "createdAt": STAMP, "updatedAt": STAMP, "forkedFrom": None,
    }
    deck = {"folioDeck": 1, "exportedAt": STAMP, "meta": meta, "cards": cards, "gloss": {}}
    out = os.path.join(ar.DECKS, "Arabic-Alphabet.folio-deck.json")
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print("wrote %s: %d notes = %d cards, %d bytes" % (out, len(cards), 2 * len(cards), os.path.getsize(out)))


if __name__ == "__main__":
    main()
