#!/usr/bin/env python3
"""Write the Mongolian alphabet deck: `decks/Mongolian-Alphabet.folio-deck.json`.

    python3 .claude/mongolian/alphabet.py

The way into a set that has no romanisation (the Russian and Ukrainian
precedent): the level decks are in Cyrillic from their first card, so the
alphabet comes first, as its own deck, and the catalogue sorts it before A1
(`levelRank` in build-lang-decks.js).

THIRTY-FIVE LETTERS IN ALPHABETICAL ORDER, THEN THE LONG VOWEL.  Each letter's
NAME, IPA and standard romanisation (MNS 5217:2012) are READ from the table of
Wikipedia's "Mongolian Cyrillic alphabet" at a pinned revision (`REVID`, cached
in `.claude/mongolian-cache/`; the table cites Svantesson et al., The Phonology
of Mongolian, 2005, for the IPA), and the script fails if a row is missing or
reads differently.  The SOUND line describes that IPA for an English speaker in
plain words, as learner's alphabets do -- an approximation, never a second
source -- and states the article's own notes where it has them (ф and к are
loan letters often said as п and х; щ is written only in Russian words and said
as ш; a final н is "ng"; a vowel written twice is long).  Each example word is a
card of the A1 deck (or, for ы, ъ and щ, which no A1 word has, a form an A1
card shows or a Wiktionary entry), with that card's meaning.  Two cards a note:
letter -> sound, and sound -> letter.  The long vowel's name, урт эгшиг, is
Wiktionary's урт "long" and эгшиг "vowel".  A re-run is byte-identical.
"""
import html, json, os, re, urllib.request

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-16T00:00:00.000Z'
TYPE_ID = 'mn-abc'
REVID = 1380007835          # "Mongolian Cyrillic alphabet", 2026-10-13T06:27:21Z
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'mongolian-cache'))
WIKI = f'mca-{REVID}.wiki'

# (letter pair as the table writes it, the sound in English words, example word, its meaning)
LETTERS = [
    ('Аа', '"a" as in father', 'аав', 'dad'),
    ('Бб', 'a "b" said without voice, between the b of bat and the p of spin', 'би', 'I'),
    ('Вв', 'between English v and w, made with both lips', 'аав', None),
    ('Гг', '"g" as in go; in a word with а, о or у, said further back in the throat', 'гэр',
     'yurt, ger'),
    ('Дд', 'a "d" said without voice, like the t of stop', 'дүү', 'younger sibling'),
    ('Ее', '"yi" or "yö" (a y, then a short rounded vowel); after a consonant the y is not '
     'heard and the consonant is softened', 'ес', 'nine'),
    ('Ёё', '"yo" as in yonder; after a consonant the y is not heard and the consonant is '
     'softened', 'хоёр', 'two'),
    ('Жж', 'like the j of jam, but without voice: between j and ch', 'жил', 'year'),
    ('Зз', 'like the ts of cats, but without the puff of breath (romanised z or dz)', 'зун',
     'summer'),
    ('Ии', '"ee" as in meet; after a consonant it also softens it', 'ирэх', 'to come'),
    ('Йй', 'a short i, the y of boy, written after a vowel (ай, ой, үй)', 'сайн', 'good'),
    ('Кк', '"k" as in kite; a letter of borrowed words, often said as х', 'кофе', 'coffee'),
    ('Лл', 'the tongue set for an l while the breath hisses past its sides, like the Welsh ll; '
     'English has no equivalent', 'лхагва', 'Wednesday'),
    ('Мм', '"m" as in man', 'мах', 'meat'),
    ('Нн', '"n" as in no; at the end of a word, the ng of sing', 'нэг', 'one'),
    ('Оо', 'an open "o", as in British hot, held', 'ном', 'book'),
    ('Өө', 'a rounded vowel like the u of fur said with rounded lips (German ö); English has '
     'no equivalent', 'өдөр', 'day'),
    ('Пп', '"p" as in pen, with a puff of breath', 'пүрэв', 'Thursday'),
    ('Рр', 'a rolled "r", made with the tip of the tongue; English has no equivalent', 'морь',
     'horse'),
    ('Сс', '"s" as in sun', 'сүү', 'milk'),
    ('Тт', '"t" as in top, with a puff of breath', 'тэмээ', 'camel'),
    ('Уу', '"u" as in put', 'ус', 'water'),
    ('Үү', '"oo" as in food, the tongue higher and further forward than for у', 'үг', 'word'),
    ('Фф', '"f" as in fun; a letter of borrowed words, often said as п', 'оффис', 'office'),
    ('Хх', '"kh", like the ch of Scottish loch', 'хот', 'town, city'),
    ('Цц', '"ts" as in cats, with a puff of breath', 'цай', 'tea'),
    ('Чч', '"ch" as in chop, with a puff of breath', 'чих', 'ear'),
    ('Шш', '"sh" as in shop', 'шүд', 'tooth'),
    ('Щщ', 'written only in Russian words, and said as ш', 'борщ', 'borscht'),
    ('Ъъ', 'the hard sign: no sound of its own', 'авъяас', 'talent'),
    ('Ыы', '"ee" as in meet, written in the endings of a word with а, о or у', 'улсын',
     'of the country'),
    ('Ьь', 'the soft sign: no sound of its own; it softens the consonant before it', 'морь',
     None),
    ('Ээ', '"e" as in met', 'эх', 'mother'),
    ('Юю', '"yu" as in you', 'юу', 'what'),
    ('Яя', '"ya" as in yard', 'явах', 'to go'),
]
assert len(LETTERS) == 35
# a word met twice above reuses its meaning
MEANING = {w: m for _, _, w, m in LETTERS if m}
LONG = ('аа ээ оо өө уу үү', 'a vowel written twice is long: the same vowel, held',
        'аав', 'dad')

FIELDS = ['Letter', 'Name', 'Sound', 'Ipa', 'Example', 'Word']

LETTER = '<div class="uc-letter">{{Letter}}</div>'
DETAIL = ('<div class="uc-field"><div class="uc-pos">name</div><div class="uc-gl">{{Name}}</div>'
          '<div class="uc-pos uc-gap">sound</div><div class="uc-gl">{{Sound}}</div>'
          '{{#Ipa}}<div class="uc-pos uc-gap">IPA · romanised</div><div class="uc-gl">{{Ipa}}</div>{{/Ipa}}'
          '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}</div></div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>')
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
  line-height: 1.15;
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
.uc-ex {
  font-size: 19px;
}
.uc-exe {
  margin-left: 6px;
  opacity: 0.62;
}
"""


def wikitext():
    p = os.path.join(CACHE, WIKI)
    if not os.path.exists(p):
        os.makedirs(CACHE, exist_ok=True)
        u = 'https://en.wikipedia.org/w/index.php?oldid=%d&action=raw' % REVID
        req = urllib.request.Request(u, headers={'User-Agent': 'folio-deck-builder/1.0'})
        open(p, 'wb').write(urllib.request.urlopen(req, timeout=60).read())
    return open(p, encoding='utf-8').read()


def clean(c):
    c = re.sub(r'<ref[^>]*/>', '', c)
    c = re.sub(r'<ref.*?</ref>', '', c, flags=re.S)
    c = re.sub(r'\{\{IPA\|([^{}]*)\}\}', r'\1', c)
    c = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', c)
    return re.sub(r'\s+', ' ', c).strip()


def table():
    """Letter pair -> (name, IPA, MNS romanisation), read off the article's table."""
    out = {}
    for row in wikitext().split('\n|-\n'):
        if not re.match(r'\| \d+ \|\|', row):
            continue
        cells = [clean(c) for c in row.lstrip('|').split('||')]
        letter, name, ipa = cells[1], cells[3], cells[4]
        roms = []
        for c in cells[5:]:
            m = re.match(r'colspan="(\d)"[^|]*\|\s*(.*)$', c)
            roms += [m.group(2).strip()] * int(m.group(1)) if m else [c]
        # ISO 9, MNS 5217:2012, LoC, BGN/PCGN.  Row 1 types a CYRILLIC а for the Latin a
        # across all four columns; it is read as the Latin letter it stands for.
        out[letter] = (name, ipa, roms[1].replace('а', 'a'))
    return out


def main():
    T = table()
    cards = []
    for i, (pair, sound, word, meaning) in enumerate(LETTERS, 1):
        if pair not in T:
            raise SystemExit(f'{pair} is not in the table of revision {REVID}')
        name, ipa, rom = T[pair]
        ipa_txt = 'no sound' if ipa == 'none' else f'[{ipa}]'
        cards.append({'sub': '', 'fields': {
            'Letter': f'{pair[0]} {pair[1]}',
            'Name': E(name),
            'Sound': E(sound),
            'Ipa': f'{E(ipa_txt)} · {E(rom)}',
            'Example': (f'<span class="uc-ex">{E(word)}</span>'
                        f'<span class="uc-exe">{E(meaning or MEANING[word])}</span>'),
            'Word': E(word),
        }, 'id': f'u_mnabc_{i}', 'type': TYPE_ID})
    letters, sound, word, meaning = LONG
    cards.append({'sub': '', 'fields': {
        'Letter': letters, 'Name': 'урт эгшиг', 'Sound': E(sound), 'Ipa': '',
        'Example': f'<span class="uc-ex">{E(word)}</span><span class="uc-exe">{E(meaning)}</span>',
        'Word': E(word),
    }, 'id': f'u_mnabc_{len(LETTERS) + 1}', 'type': TYPE_ID})
    desc = (
        "The 35 letters of the Mongolian Cyrillic alphabet, in alphabetical order — Russian's 33 "
        "and Ө and Ү — and then the long vowel: the first deck of the Mongolian collection, since "
        "the level decks are written in Cyrillic from their first card and carry no romanisation. "
        "Both directions: see a letter and recall its sound, or see a sound and recall the letter, "
        "each a card with its own schedule. Every note gives the letter in capital and small, its "
        "name (what a Mongolian calls it when spelling a word aloud), its sound described in "
        "English words with the IPA and the standard romanisation beside it, and one everyday word "
        "that shows it. The sounds are approximations, as every learner's alphabet gives them; "
        "where English has no near equivalent, as for л, ө and the rolled р, the card says so. "
        "Several letters are not said as in Russian: б and д have no voice, ж and з are said "
        "like an unvoiced j and ts, в is between v and w, and л is a hissed l. Ф and к are "
        "letters of borrowed words, щ is written only in Russian ones, and the hard and soft signs "
        "have no sound of their own. Sources: the names, IPA and romanisation (MNS 5217:2012) are "
        f"read from the table of Wikipedia's 'Mongolian Cyrillic alphabet' (revision {REVID}, "
        "CC BY-SA 4.0), whose IPA cites Svantesson et al., The Phonology of Mongolian (2005); the "
        "example words and their meanings are cards of the A1 deck, from English Wiktionary "
        "(CC BY-SA 4.0). There is no speaker button: few devices have a Mongolian voice."
    )
    meta = {
        'id': 'mnabc', 'title': 'Mongolian Alphabet',
        'subtitle': '35 letters and the long vowel · both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': '#3C7676',
        'tags': ['mongolian', 'alphabet', 'cyrillic'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Mongolian letter', 'speechLang': 'mn-MN',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(HERE, '..', '..', 'decks', 'Mongolian-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, len(cards), 'notes,', os.path.getsize(out), 'bytes')


if __name__ == '__main__':
    main()
