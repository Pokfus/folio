#!/usr/bin/env python3
"""Write the Hebrew alphabet deck: `decks/Hebrew-Alphabet.folio-deck.json`.

    python3 .claude/hebrew/alphabet.py

The first deck of the Hebrew collection, sorted before A1 by `levelRank`'s
"Alphabet" rule.  The level decks print a romanisation and the pointed form
under every word, so this deck is not a gate; it is where the script itself is
learnt.

THE NOTES, IN THE ALPHABET'S ORDER -- the twenty-two letters, with the three
that change their sound when a dot (dagesh) sits in them taken one sound to a
note (בּ b and ב v, כּ k and כ kh, פּ p and פ f), and שׁ sh and שׂ s apart; then
the five FINAL forms a letter takes at the end of a word (ך ם ן ף ץ); then the
three letters with a geresh that spell sounds Hebrew borrowed (ג׳ ז׳ צ׳); then
the vowel points, shown on the letter ב, and the dagesh.  Hebrew is printed
without the points in everyday text, so each vowel card says so.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's
alphabets give them, never IPA, with the romanisation the level decks use
(Wiktionary's: kh for the rasped ח and כ, ts for צ, an apostrophe for the
catch of א and ע).  HEBREW SPELLS SOME SOUNDS WITH SEVERAL LETTERS -- t with ט
and ת, k with כּ and ק, v with ב and ו, kh with ח and כ, s with ס and שׂ, and
nothing or a catch with א and ע -- a difference kept from older Hebrew that
modern speech no longer makes.  Each such card says so, and its sound side is
told apart by the example word it asks for, so the reverse card has one
answer.  The descriptions are the standard ones of modern Israeli Hebrew; no
corpus is read, and a re-run is byte-identical whenever `lex.json` is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from he import fold
from choose import choose

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-12T00:00:00.000Z'
TYPE_ID = 'he-abc'
COLOR = '#5E6EC0'

SAME = 'said exactly as '
# (letter, its Hebrew name (what the speaker says), its English name, romanisation,
#  final form or '', sound, example word, the pointed form the example teaches, its meaning)
LETTERS = [
    ('א', 'אָלֶף', 'alef', "' ", '', 'no sound of its own: it carries the vowel that goes with it, '
     'or a light catch in the throat, as in the middle of uh-oh — ' + SAME + 'ע', 'אבא', 'אַבָּא',
     'father'),
    ('בּ', 'בֵּית', 'bet', 'b', '', '"b" as in bed — ב with the dot (dagesh) inside it', 'בית',
     'בַּיִת', 'house'),
    ('ב', 'בֵית', 'vet', 'v', '', '"v" as in van — ב without the dot; ' + SAME + 'ו', 'ערב',
     'עֶרֶב', 'evening'),
    ('ג', 'גִּימֶל', 'gimel', 'g', '', '"g" as in go', 'גדול', 'גָּדוֹל', 'big'),
    ('ד', 'דָּלֶת', 'dalet', 'd', '', '"d" as in dog', 'דלת', 'דֶּלֶת', 'door'),
    ('ה', 'הֵא', 'he', 'h', '', '"h" as in hat; at the END of a word it is silent and marks a '
     'final vowel (תודה todá)', 'הוא', 'הוּא', 'he'),
    ('ו', 'וָו', 'vav', 'v · o · u', '', '"v" as in van — ' + SAME + 'ב without the dot; also '
     'the vowel "o" (וֹ) and "u" (וּ) inside a word', 'ורד', 'וֶרֶד', 'rose'),
    ('ז', 'זַיִן', 'zayin', 'z', '', '"z" as in zoo', 'זמן', 'זְמַן', 'time'),
    ('ח', 'חֵית', 'het', 'kh', '', '"kh", rasped at the back of the mouth as in Scottish loch — '
     + SAME + 'כ without the dot', 'חלב', 'חָלָב', 'milk'),
    ('ט', 'טֵית', 'tet', 't', '', '"t" as in ten — ' + SAME + 'ת', 'טוב', 'טוֹב', 'good'),
    ('י', 'יוֹד', 'yod', 'y · i', '', '"y" as in yes; also the vowel "i" (as in see) inside a word',
     'ילד', 'יֶלֶד', 'boy, child'),
    ('כּ', 'כַּף', 'kaf', 'k', '', '"k" as in kit — כ with the dot; ' + SAME + 'ק', 'כלב',
     'כֶּלֶב', 'dog'),
    ('כ', 'כָף', 'khaf', 'kh', 'ך', '"kh" as in loch — כ without the dot; ' + SAME + 'ח',
     'אוכל', 'אֹֽכֶל', 'food'),
    ('ל', 'לָמֶד', 'lamed', 'l', '', '"l" as in leaf', 'לחם', 'לֶחֶם', 'bread'),
    ('מ', 'מֵם', 'mem', 'm', 'ם', '"m" as in man', 'מים', 'מַיִם', 'water'),
    ('נ', 'נוּן', 'nun', 'n', 'ן', '"n" as in no', 'נכון', 'נָכוֹן', 'right, correct'),
    ('ס', 'סָמֶךְ', 'samekh', 's', '', '"s" as in sun — the everyday s; ' + SAME + 'שׂ', 'ספר',
     'סֵפֶר', 'book'),
    ('ע', 'עַיִן', 'ayin', "' ", '', 'no sound of its own in most Israelis\' speech, or a catch in '
     'the throat — ' + SAME + 'א (some speakers make it deep in the throat)', 'עין', 'עַיִן',
     'eye'),
    ('פּ', 'פֵּא', 'pe', 'p', '', '"p" as in pen — פ with the dot', 'פה', 'פֶּה', 'mouth'),
    ('פ', 'פֵא', 'fe', 'f', 'ף', '"f" as in fan — פ without the dot', 'יפה', 'יָפֶה', 'beautiful'),
    ('צ', 'צָדִי', 'tsadi', 'ts', 'ץ', '"ts" as in cats', 'צבע', 'צֶבַע', 'colour'),
    ('ק', 'קוֹף', 'qof', 'k', '', '"k" as in kit — ' + SAME + 'כּ with the dot', 'קפה', 'קָפֶה',
     'coffee'),
    ('ר', 'רֵישׁ', 'resh', 'r', '', '"r" made at the back of the throat, like the French r',
     'ראש', 'רֹאשׁ', 'head'),
    ('שׁ', 'שִׁין', 'shin', 'sh', '', '"sh" as in ship — ש with the dot on the RIGHT', 'שם',
     'שָׁם', 'there'),
    ('שׂ', 'שִׂין', 'sin', 's', '', '"s" as in sun — ש with the dot on the LEFT; ' + SAME + 'ס',
     'שמח', 'שָׂמֵחַ', 'happy'),
    ('ת', 'תָּו', 'tav', 't', '', '"t" as in ten — the everyday t; ' + SAME + 'ט', 'תודה',
     'תּוֹדָה', 'thank you'),
]

# the final forms, after the letters, as the alphabet charts give them
FINALS = [
    ('ך', 'כָף סוֹפִית', 'final khaf', 'kh', '"kh" — the shape כ takes at the END of a word',
     'דרך', 'דֶּרֶךְ', 'way, road'),
    ('ם', 'מֵם סוֹפִית', 'final mem', 'm', '"m" — the shape מ takes at the END of a word',
     'שלום', 'שָׁלוֹם', 'hello, peace'),
    ('ן', 'נוּן סוֹפִית', 'final nun', 'n', '"n" — the shape נ takes at the END of a word',
     'בן', 'בֵּן', 'son'),
    ('ף', 'פֵא סוֹפִית', 'final fe', 'f', '"f" — the shape פ takes at the END of a word',
     'אף', 'אַף', 'nose'),
    ('ץ', 'צָדִי סוֹפִית', 'final tsadi', 'ts', '"ts" — the shape צ takes at the END of a word',
     'ארץ', 'אֶרֶץ', 'country, land'),
]

# letters with a geresh, for sounds Hebrew took in with borrowed words
GERESH = [
    ('ג׳', 'גִּימֶל עִם גֵּרֶשׁ', 'gimel with a geresh', 'j', '"j" as in jam — only in borrowed '
     'words and names', 'ג׳ינס', 'גִ׳ינְס', 'jeans'),
    ('ז׳', 'זַיִן עִם גֵּרֶשׁ', 'zayin with a geresh', 'zh', 'the "s" of pleasure — only in '
     'borrowed words and names', 'ז׳קט', '', 'jacket'),
    ('צ׳', 'צָדִי עִם גֵּרֶשׁ', 'tsadi with a geresh', 'ch', '"ch" as in church — only in borrowed '
     'words and names', 'צ׳יפס', 'צִ׳יפְּס', 'chips (French fries)'),
]

# the points, on ב, and the dagesh
POINTS = [
    ('בַ', 'פַּתָּח', 'patach', 'a', 'the short line under a letter: "a" as in father, short', 'בת',
     'בַּת', 'daughter'),
    ('בָ', 'קָמָץ', 'kamatz', 'a', 'the small T under a letter: "a" as in father — '
     + SAME + 'patach in modern Hebrew (in a few words, "o")', 'שם', 'שָׁם', 'there'),
    ('בֵ', 'צֵירֵי', 'tsere', 'e', 'two dots side by side under a letter: "e" as in bed', 'בן',
     'בֵּן', 'son'),
    ('בֶ', 'סֶגּוֹל', 'segol', 'e', 'three dots under a letter: "e" as in bed — ' + SAME
     + 'tsere in modern Hebrew', 'ילד', 'יֶלֶד', 'boy, child'),
    ('בִ', 'חִירִיק', 'hiriq', 'i', 'one dot under a letter: "i" as in see, often written with י '
     'after it', 'מים', 'מַיִם', 'water'),
    ('בוֹ', 'חוֹלָם', 'holam', 'o', 'a dot above a letter, or above ו: "o" as in more, short', 'טוב',
     'טוֹב', 'good'),
    ('בוּ', 'שׁוּרוּק', 'shuruk', 'u', 'ו with a dot in its side: "u" as in rule', 'הוא', 'הוּא',
     'he'),
    ('בֻ', 'קֻבּוּץ', 'kubutz', 'u', 'three slanting dots under a letter: "u" as in rule — '
     + SAME + 'shuruk; in unpointed text the word is usually written with ו', 'שולחן',
     'שֻׁלְחָן', 'table'),
    ('בְ', 'שְׁוָא', 'shva', "' · e", 'two dots one above the other under a letter: no vowel, or a '
     'very short "e" (written \' or e in the romanisation)', 'זמן', 'זְמַן', 'time'),
    ('בֲ', 'חֲטַף פַּתָּח', 'hataf patach', 'a', 'shva and patach side by side, under א ה ח ע: '
     'a short "a"', 'אבל', 'אֲבָל', 'but'),
    ('בּ', 'דָּגֵשׁ', 'dagesh', '—', 'the dot inside a letter: in בּ כּ פּ it makes b, k, p (without '
     'it v, kh, f); in other letters it once doubled the sound and is not heard in modern Hebrew',
     'אמא', 'אִמָּא', 'mother'),
]

ROMAN_BY_HAND = {'ז׳קט': "zhakét"}

FIELDS = ['Letter', 'Name', 'Shapes', 'Sound', 'Clue', 'Example', 'Word']

SAY_NAME = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>'
SAY_WORD = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
LETTER = ('<div class="uc-letter">{{Letter}}' + SAY_NAME + '</div>'
          '{{#Shapes}}<div class="uc-shapes">{{Shapes}}</div>{{/Shapes}}')
DETAIL = ('<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>'
          '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}'
          + SAY_WORD + '</div></div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div>'
       '<div class="uc-pos uc-gap">the letter in</div><div class="uc-gl">{{Clue}}</div></div>')
FRONT_L = LETTER
BACK_L = '{{FrontSide}}<hr>' + DETAIL
FRONT_S = ASK
BACK_S = '{{FrontSide}}<hr>' + LETTER + DETAIL

CSS = """.card {
  text-align: center;
  font-size: 17px;
  line-height: 1.6;
}
.uc-ask {
  margin-bottom: 14px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
.uc-letter {
  font-size: 64px;
  font-weight: 400;
  line-height: 1.3;
}
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
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
.uc-rm {
  font-weight: 600;
}
.uc-ex {
  font-size: 21px;
}
.uc-exr {
  margin-left: 6px;
  font-size: 14px;
  opacity: 0.62;
}
.uc-exe {
  margin-left: 6px;
  opacity: 0.62;
}
/* the letter's name, and its final form beneath it */
.uc-shapes {
  margin-top: 4px;
  font-size: 15px;
  opacity: 0.75;
}
.uc-fin {
  margin-top: 2px;
}
.uc-sl {
  margin-left: 5px;
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.6;
}
.uc-sf {
  margin-left: 8px;
  font-size: 24px;
  vertical-align: middle;
}
"""

def shapes(name_en, final):
    """The letter's English name, and on a line beneath it its final form where it has one."""
    out = f'<div class="uc-sl">{E(name_en)}</div>'
    if final:
        out += (f'<div class="uc-fin"><span class="uc-sl">at the end of a word</span>'
                f'<span class="uc-sf" dir="rtl" lang="he">{E(final)}</span></div>')
    return out


def main():
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hebrew-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' romanisation from lex.json: '
                         'run `python3 .claude/hebrew/run.py` once first')
    rows = [(l, n, en, r, fin, s, w, p, m) for l, n, en, r, fin, s, w, p, m in LETTERS]
    rows += [(l, n, en, r, '', s, w, p, m) for l, n, en, r, s, w, p, m in FINALS + GERESH + POINTS]
    cards, missing = [], []
    for i, (shown, name, name_en, rom, final, sound, word, pw, meaning) in enumerate(rows, 1):
        L = lex.get(fold(word)) or {}
        e = next((x for x in L.get('entries', []) if pw and x['p'] == pw), None)
        wr = ROMAN_BY_HAND.get(word, '') or (e['roman'] if e else '')
        if not wr:
            missing.append(word)
        shown_word = pw or word
        cards.append({'sub': '', 'fields': {
            'Letter': f'<span dir="rtl" lang="he">{E(shown)}</span>',
            'Name': E(name),
            'Shapes': shapes(name_en, final),
            'Sound': (f'<span class="uc-rm">{E(rom.strip())}</span> · ' if rom != '—' else '') + E(sound),
            'Clue': f'<span class="uc-rm">{E(wr)}</span><span class="uc-exe">{E(meaning)}</span>',
            'Example': (f'<span class="uc-ex" dir="rtl" lang="he">{E(shown_word)}</span>'
                        + (f'<span class="uc-exr">{E(wr)}</span>' if wr else '')
                        + f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_heabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    fronts = [c['fields']['Sound'] + c['fields']['Clue'] for c in cards]
    assert len(set(fronts)) == n, 'two notes share a sound side: the reverse card is unanswerable'
    if missing:
        raise SystemExit('no romanisation for: ' + ' '.join(missing))
    desc = (
        f"The Hebrew alphabet: {n} notes, in the alphabet's order — the twenty-two letters, with the "
        "three that change their sound when a dot sits inside them taken one sound to a card (בּ b "
        "and ב v, כּ k and כ kh, פּ p and פ f) and shin and sin apart (שׁ sh, שׂ s); then the five "
        "final forms a letter takes at the end of a word (ך ם ן ף ץ); then the three letters with a "
        "geresh that spell borrowed sounds (ג׳ j, ז׳ zh, צ׳ ch); then the vowel points and the "
        "dagesh. The first deck of the Hebrew collection. Both directions: see a letter and recall "
        "its sound, or see a sound and recall the letter, each a card with its own schedule. Hebrew "
        "is written right to left, and its letters do not join. Everyday Hebrew is printed WITHOUT "
        "the vowel points — they appear in children's books, poetry, dictionaries and for learners "
        "— which is why the level decks print each word both ways, with a romanisation beneath. "
        "Every note gives the romanisation the level decks use, the sound described in English "
        "words, and one everyday word that shows it, pointed, with a speaker beside the letter and "
        "the word. Modern Hebrew says some letters alike — t for ט and ת, k for כּ and ק, v for ב "
        "and ו, kh for ח and כ, s for ס and שׂ, and nothing (or a catch in the throat) for א and ע — "
        "so the cards say which, and the sound side names the word it asks for, so every card has "
        "one answer. The sounds are those of modern Israeli Hebrew, approximated in English as "
        "every learner's alphabet does. Sources: the standard description of modern Israeli Hebrew; "
        "the example words' pointing and romanisations are English Wiktionary's, via the kaikki.org "
        "extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'heabc', 'title': 'Hebrew Alphabet',
        'subtitle': f'{n} letters and signs · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['hebrew', 'alphabet'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Hebrew letter', 'speechLang': 'he-IL',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Hebrew-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
