#!/usr/bin/env python3
"""Write the Zulu noun classes deck: `decks/Zulu-Noun-Classes.folio-deck.json`.

    python3 .claude/zulu/classes.py      (reads .claude/zulu-cache/lex.json)

Asked for by the owner on 2026-11-09 ("Noun classes + clicks"): the first deck
of the Zulu collection, the counterpart of Hindi's alphabet deck.  Zulu is
written in the Latin alphabet, so what a beginner needs before the word decks
is not a script but the two things the word decks keep naming:

  · THE NOUN CLASSES.  Every Zulu noun belongs to a class marked by its prefix
    (umuntu class 1, abantu class 2, isitolo class 7 ...), and the verb, the
    adjective and the pronoun that go with it echo that class.  One note per
    class -- 1, 2, 1a, 2a, 3 to 11, 14, 15 and 17 (Zulu has no 12, 13 or 16)
    -- with its prefix, what kind of noun it usually holds, the class its
    plural moves to, its subject concord, the form "goes" takes with it
    (-hamba, read off Wiktionary's own table), and an example noun.
  · THE CLICKS AND THE OTHER SOUNDS ENGLISH LACKS.  Three clicks (c, q, x),
    each in five kinds (plain, ch qh xh with breath, gc gq gx voiced, nc nq nx
    nasal, ngc ngq ngx voiced and nasal), then hl, dl, the two b's, the
    breathy hh, kl, and the difference between ph th kh and p t k.

WHERE THE CONTENT COMES FROM.  The classes' prefixes, meanings and concords are
those of Wikipedia's "Zulu grammar" (its noun class table cites Ngcobo 2010,
"Zulu noun classes revisited", South African Journal of African Languages 30(1),
11-21), and the sounds' descriptions those of Wikipedia's "Zulu language" §
Phonology (both read 2026-11-09, CC BY-SA 4.0), put into plain English as
learner's guides give them, never IPA.  Every example word is an entry of
English Wiktionary (`lex.json`), with its meaning from there; the -hamba form
is checked against Wiktionary's table and left out if it is not there.  No
corpus is read, so a re-run is byte-identical whenever `lex.json` is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zu import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'zu-classes'
COLOR = '#6D67D1'
OUT = 'Zulu-Noun-Classes.folio-deck.json'

# (class, full prefix, usual content, plural class or singular class, subject concord,
#  example noun, its partner (plural or singular) or '')
CLASSES = [
    ('1', 'um(u)-', 'people', 'plural in class 2', 'u-', 'umuntu', 'abantu'),
    ('2', 'aba-', 'the plural of class 1: people', 'singular in class 1', 'ba-', 'abantu', 'umuntu'),
    ('1a', 'u-', 'names, kinship words (my father, my mother), personifications',
     'plural in class 2a', 'u-', 'ubaba', 'obaba'),
    ('2a', 'o-', 'the plural of class 1a', 'singular in class 1a', 'ba-', 'obaba', 'ubaba'),
    ('3', 'um(u)-', 'plants, body parts, rivers', 'plural in class 4', 'u-', 'umuthi', 'imithi'),
    ('4', 'imi-', 'the plural of class 3', 'singular in class 3', 'i-', 'imithi', 'umuthi'),
    ('5', 'i(li)-', 'fruit, body parts, loanwords', 'plural in class 6', 'li-', 'igama', 'amagama'),
    ('6', 'ama-', 'the plural of class 5, and liquids and masses (amanzi, water)',
     'singular in class 5', 'a-', 'amagama', 'igama'),
    ('7', 'isi-', 'things, kinds of person, customs and languages (isiZulu)',
     'plural in class 8', 'si-', 'isitolo', 'izitolo'),
    ('8', 'izi-', 'the plural of class 7', 'singular in class 7', 'zi-', 'izitolo', 'isitolo'),
    ('9', 'i(n)-', 'animals, loanwords; the n becomes m before b, f, p, v (impilo) and drops '
     'before m and n (imali)', 'plural in class 10', 'i-', 'inja', 'izinja'),
    ('10', 'izi(n)-', 'the plural of class 9 and of class 11', 'singular in class 9 or 11', 'zi-',
     'izinja', 'inja'),
    ('11', 'u(lu)-', 'long or thin things', 'plural in class 10', 'lu-', 'ulimi', 'izilimi'),
    ('14', 'ubu-', 'abstract ideas and qualities', 'usually none', 'bu-', 'ubusuku', ''),
    ('15', 'uku-', 'the infinitive of every verb (ukuhamba, to go) and nouns made from it',
     'usually none', 'ku-', 'ukudla', ''),
    ('17', 'uku-', 'a few old nouns of place, and the "it" of a verb with no particular subject',
     'usually none', 'ku-', 'ukunene', ''),
]

# (letters, kind, the sound in English words, example word, its key in lex.json)
SOUNDS = [
    ('c', 'click, at the teeth', 'the "tsk tsk" of disapproval: the tip of the tongue is sucked '
     'away from the back of the upper front teeth', 'cula'),
    ('q', 'click, at the roof of the mouth', 'a hollow pop, like a bottle top coming off: the '
     'tongue is pulled sharply down from the ridge behind the teeth', 'qala'),
    ('x', 'click, at the side', 'the click used to urge a horse on: the side of the tongue is '
     'pulled away from the side teeth', 'xoxa'),
    ('ch', 'click with breath', 'the c click followed by a puff of breath', 'chitha'),
    ('qh', 'click with breath', 'the q click followed by a puff of breath', 'qhubeka'),
    ('xh', 'click with breath', 'the x click followed by a puff of breath', 'xhumana'),
    ('gc', 'voiced click', 'the c click with the voice behind it, slack and breathy; it lowers '
     'the pitch of the syllable', 'gcina'),
    ('gq', 'voiced click', 'the q click with the voice behind it, slack and breathy; it lowers '
     'the pitch of the syllable', 'gqoka'),
    ('gx', 'voiced click', 'the x click with the voice behind it, slack and breathy; it lowers '
     'the pitch of the syllable', 'gxila'),
    ('nc', 'nasal click', 'the c click made while humming through the nose', 'ncane'),
    ('nq', 'nasal click', 'the q click made while humming through the nose', 'nqoba'),
    ('nx', 'nasal click', 'the x click made while humming through the nose', 'nxusa'),
    ('ngc', 'voiced nasal click', 'the c click hummed through the nose with a slack, breathy '
     'voice and a lowered pitch', 'ngcwele'),
    ('ngq', 'voiced nasal click', 'the q click hummed through the nose with a slack, breathy '
     'voice and a lowered pitch', 'ungqongqoshe'),
    ('ngx', 'voiced nasal click', 'the x click hummed through the nose with a slack, breathy '
     'voice and a lowered pitch', 'ingxenye'),
    ('hl', 'lateral fricative', 'like the Welsh ll: the tongue set for an l, and air blown out '
     'past its sides with no voice', 'hlala'),
    ('dl', 'voiced lateral fricative', 'hl with the voice on: the tongue set for an l, air '
     'buzzing past its sides', 'dla'),
    ('b', 'implosive b', 'a b made by drawing the air slightly inwards as the lips open, '
     'softer than the English b', 'bona:verb'),
    ('bh', 'breathy b', 'close to an English b, with a slack, breathy voice that lowers the '
     'pitch', 'bhala'),
    ('hh', 'breathy h', 'an h with the voice on, as between the vowels of English "ahead" said '
     'slowly', 'ihhashi'),
    ('kl', 'k with a lateral release', 'a k released through the sides of the tongue, close '
     'to the hl sound', 'umklomelo'),
    ('ph th kh', 'with breath', 'p, t and k with a puff of breath, as at the start of English '
     '"pin", "tin", "kin"', 'phuza'),
    ('p t k', 'without breath', 'p, t and k with no puff of breath and a tight throat, as in '
     'English "spin", "stop", "skin" or tighter', 'ikati'),
]


def gloss(lex, key, cls='', pos=''):
    ents = lex[key]['entries']
    e = next((x for x in ents if (not cls or x['cls'] == cls) and (not pos or x['pos'] == pos)), ents[0])
    return e['glosses'][0]['g']


def hamba_form(lex, concord):
    """The class's present of -hamba ('goes'), only if Wiktionary's own table lists it."""
    tb = [t['f'] for e in lex['hamba']['entries'] if e['pos'] == 'verb' for t in e['table']]
    want = concord.rstrip('-') + 'yahamba'
    return want if any(fold(f) == want for f in tb) else ''


CARD = '<div class="uc-word">{{Item}}</div>{{#Sub}}<div class="uc-tone">{{Sub}}</div>{{/Sub}}'
ASK = '<div class="uc-ask">{{Kind}}</div><div class="uc-field">{{Ask}}</div>'
SAY = '{{#Say}}<span class="uc-tts uc-exsay" data-say="{{Say}}"></span>{{/Say}}'
DETAIL = '<div class="uc-field">{{Detail}}</div><div class="uc-exs uc-exi"><div class="uc-exz">' + SAY + \
         '{{Example}}</div></div>'
FRONT_1 = '<div class="uc-ask">{{Kind}}</div>' + CARD
BACK_1 = '{{FrontSide}}<hr>' + DETAIL
FRONT_2 = ASK
BACK_2 = '{{FrontSide}}<hr>' + CARD + DETAIL
FIELDS = ['Item', 'Sub', 'Kind', 'Ask', 'Detail', 'Example', 'Say', 'Word']


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    lex = json.load(open(os.path.join(here, '..', 'zulu-cache', 'lex.json'), encoding='utf-8'))['lemmas']
    cards = []
    for cls, pre, what, partner, sc, ex, other in CLASSES:
        hf = hamba_form(lex, sc)
        plural_class = ex not in lex
        lab, val = partner.split(' in ', 1) if ' in ' in partner else ('plural', partner.replace(' plural', ''))
        detail = (f'<div class="uc-pos">noun class {E(cls)}</div><div class="uc-gl">{E(what)}</div>'
                  f'<div class="uc-forms"><span class="uc-fi"><span class="uc-fl">{E(lab)}</span>'
                  f'{E(val)}</span><span class="uc-fi"><span class="uc-fl">subject concord</span>'
                  f'{E(sc)}</span>'
                  + (f'<span class="uc-fi"><span class="uc-fl">goes</span>{E(hf)}</span>' if hf else '')
                  + '</div>')
        if plural_class:
            example = f'<b>{E(ex)}</b> — the plural of {E(other)}, “{E(gloss(lex, other))}”'
        else:
            example = (f'<b>{E(ex)}</b>' + (f' · plural {E(other)}' if other else '')
                       + f' — {E(gloss(lex, ex, cls=cls))}')
        cards.append({'Item': E(pre), 'Sub': E(ex), 'Kind': 'Noun class prefix',
                      'Ask': E(f'Noun class {cls}: {what}'), 'Detail': detail,
                      'Example': example, 'Say': E(ex), 'Word': f'class {cls}'})
    for letters, kind, sound, key in SOUNDS:
        key, _, pos = key.partition(':')
        w = lex[key]['word']
        e = next((x for x in lex[key]['entries'] if not pos or x['pos'] == pos), lex[key]['entries'][0])
        shown = ('-' if e['canon'].startswith('-') else '') + w
        detail = (f'<div class="uc-pos">{E(kind)}</div><div class="uc-gl">{E(sound)}</div>')
        example = f'<b>{E(shown)}</b> — {E(gloss(lex, key, pos=pos))}'
        cards.append({'Item': E(letters), 'Sub': '', 'Kind': 'Zulu sound',
                      'Ask': E(f'{kind}: {sound}'), 'Detail': detail, 'Example': example,
                      'Say': E(w), 'Word': letters})
    seen = set()
    for c in cards:
        assert c['Ask'] not in seen, c['Ask']
        seen.add(c['Ask'])
    deck_cards = [{'id': f'u_zuclasses_{i}', 'type': TYPE_ID, 'sub': '', 'fields': c}
                  for i, c in enumerate(cards, 1)]
    n = len(cards)
    nc, ns = len(CLASSES), len(SOUNDS)
    desc = (
        "Start here. Two things the Zulu word decks keep naming, learnt before them. "
        f"{nc} NOUN CLASSES: every Zulu noun belongs to a class marked by its prefix — umuntu "
        "'person' is class 1, abantu 'people' class 2, isitolo 'shop' class 7 — and the verb, "
        "adjective and pronoun that go with it echo that class, as an adjective echoes gender in "
        "French or Hindi. Each note gives the prefix, the kind of noun the class usually holds, "
        "the class its plural moves to, its subject concord (the prefix a verb takes with it) and "
        "the present of -hamba 'go' with that concord, with an example noun; the classes are "
        "numbered as across the Bantu languages, so Zulu has no 12, 13 or 16. "
        f"{ns} SOUNDS: the three clicks — c at the teeth, q at the roof of the mouth, x at the "
        "side — each in five kinds (with breath, voiced, nasal, voiced and nasal), and the other "
        "sounds English lacks: hl and dl, the two b's, hh, kl, and the difference between ph th "
        "kh and p t k. Each is described in English words, never phonetic symbols, with a word "
        "that has it. Both directions are asked: see the prefix or the letters and recall what "
        "they are, or see the description and recall the prefix or the letters. Sources: the noun "
        "class table and concords of Wikipedia's 'Zulu grammar' (which cites Ngcobo 2010, 'Zulu "
        "noun classes revisited', South African Journal of African Languages 30(1)) and the "
        "sounds of Wikipedia's 'Zulu language', both CC BY-SA 4.0; example words, their meanings "
        "and the -hamba forms from English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    css = open(os.path.join(here, 'card.css'), encoding='utf-8').read()
    meta = {
        'id': 'zuclasses', 'title': 'Zulu Noun Classes and Sounds',
        'subtitle': f'{nc} noun classes and {ns} sounds · both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['zulu', 'isizulu', 'noun classes', 'clicks', 'pronunciation'],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Zulu noun classes and sounds', 'speechLang': 'zu-ZA',
            'fields': FIELDS,
            'cards': [{'name': 'Prefix or letters → what it is', 'front': FRONT_1, 'back': BACK_1},
                      {'name': 'What it is → prefix or letters', 'front': FRONT_2, 'back': BACK_2}],
            'css': css,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': deck_cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(here, '..', '..', 'decks', OUT))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out)
    print(f'  notes {n} = cards {n * 2} | bytes {os.path.getsize(out)}')


if __name__ == '__main__':
    main()
