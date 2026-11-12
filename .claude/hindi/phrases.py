#!/usr/bin/env python3
"""The phrases deck's expressions: Hindi set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with one more field, `sub`.

Not a CEFR level: an expression is a unit a frequency list of words cannot
see, which is why the level decks teach so few of them.  Three subdecks, the
Indonesian and Turkish arrangement (`docs/lang-decks.md`, "THE PHRASES DECK"):

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase or an interjection and does NOT tag idiomatic -- mostly the
            everyday formulas (`कोई बात नहीं`, `आपका नाम क्या है`), with some
            sayings Wiktionary files the same way;
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic (`नाक में दम करना`, `दूर के ढोल सुहावने`);
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`hindi_level.words_below`), and
every sense goes through the level decks' filters: a weak sense (rare,
dialectal, vulgar ...) is not a reason to include an expression, a template
("... साल का हूँ") is not an expression, and `EXCLUDE` names the rest, each
with its reason.

THE ORDER is how many of Tatoeba's Hindi sentences contain the expression --
one ending in a verb counted in any form of that verb (`examples.py`'s
matching for this deck) -- then the expression's own frequency estimate
(`extract.py`: its rarest word's count, halved), then its spelling.  Tatoeba's
Hindi is small, so most expressions are found in no sentence and the second
key does most of the ordering; the description says so.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hi import fold, tokens
from hindi_level import LEVEL, f, words_below
import examples


def _swears():
    # `select` is also a standard-library module, already imported by the time this
    # runs, so the level stage's list is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('hindi_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.SWEARS


SWEARS = _swears()

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj'}

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Turkish rule): a verb in one person is a
    # sentence a learner builds from the level decks, not one to learn whole -- sixteen
    # spellings of "I love you" by person, gender and verb, and the personal statements
    'मैं तुमसे प्यार करता हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं तुमसे प्यार करती हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं आप से प्यार करता हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं तुम से प्यार करता हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं आप से प्यार करती हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं तुम से प्यार करती हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं आप से प्रेम करता हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं आप से प्रेम करती हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं तुम से प्रेम करता हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं तुम से प्रेम करती हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं तुझ से प्यार करता हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं तुझ से प्यार करती हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं तुझ से प्रेम करता हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं तुझ से प्रेम करती हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं तुम्हारी याद करता हूँ': 'a phrasebook sentence ("I love you" / "I miss you"), not a set phrase',
    'मैं ईसाई हूँ': 'a personal sentence built from level words, not a set phrase',
    'मैं हिंदू हूँ': 'a personal sentence built from level words, not a set phrase',
    'मैं भारतीय हूँ': 'a personal sentence built from level words, not a set phrase',
    'मैं हिंदुस्तानी हूँ': 'a personal sentence built from level words, not a set phrase',
    'मैं लड़की हूँ': 'a personal sentence built from level words, not a set phrase',
    'मैं लड़का हूँ': 'a personal sentence built from level words, not a set phrase',
    'मैं धार्मिक नहीं हूँ': 'a personal sentence built from level words, not a set phrase',
    'क्या आप शादीशुदा हैं': 'a personal sentence built from level words, not a set phrase',
    'क्या तुम मुझसे शादी करोगी': 'a personal sentence built from level words, not a set phrase',
    'वह बेहोश है': 'a personal sentence built from level words, not a set phrase',
    'मैं नहीं जानता हूँ': 'a personal sentence built from level words, not a set phrase',
    'मैं नहीं जानती हूँ': 'a personal sentence built from level words, not a set phrase',
    'मैं अंग्रेज़ी नहीं बोलता हूँ': 'a personal sentence built from level words, not a set phrase',
    'मैं अंग्रेज़ी नहीं बोलती हूँ': 'a personal sentence built from level words, not a set phrase',
    # the same expression twice
    'कौन सा दिन है आज': 'the same question as आज कौन सा दिन है, reordered',
    'आप कहाँ रहतीं हैं': 'a nonstandard spelling of the question the deck asks as आप कहाँ रहते हैं',
    'दूर के ढोल सुहावने लगते हैं': 'the proverb दूर के ढोल सुहावने with a verb added',
    'दूर के ढोल सुहावने होते हैं': 'the proverb दूर के ढोल सुहावने with a verb added',
    'जागृत हो जाना': 'जागृत होना with हो जाना, the same meaning',
    'घड़ियाल के आँसू': 'a third spelling of मगरमच्छ के आँसू (घड़ियाली आँसू is taught)',
    # slogans and religious invocations (the Turkish rule for formulas and slogans)
    'दिल्ली चलो': 'a political slogan of one march',
    'विश्व के कार्यकर्ताओं एकजुट हो जाओ': 'a political slogan',
    'दुनिया के मजदूरों एक हो जाओ': 'a political slogan',
    'इंक़िलाब ज़िंदाबाद': 'a political slogan',
    'जय श्री राम': 'a religious and political invocation',
    'जय सिया राम': 'a religious invocation',
    'हर हर महादेव': 'a religious invocation',
    'हरि बोल': 'a religious invocation',
    'हरि ॐ': 'a mantra',
    'अल्लाहो अकबर': 'a religious formula in Arabic rather than a Hindi phrase',
    'अहल ईमान': 'a Quranic form of address in Arabic, not a Hindi phrase',
    # its count is the literal "(they) say", never the attention-getter its card teaches
    'कहते हैं': 'its Tatoeba sentences are all the literal "they say", not the sense taught',
    # a curse
    'भाड़ में जाओ': 'an oath ("go to hell"); the A1 note on भाड़',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak']]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly'):
            continue
        if '...' in k or '…' in k or '-' == k[0] or '-' == k[-1]:
            continue
        for e in L['entries']:
            gl = good(e)
            if not gl:
                continue
            tags = {t for g in gl for t in g['tags']}
            if e['pos'] == 'proverb':
                sub = 'Proverbs'
            elif 'idiomatic' in tags and e['pos'] in IDIOM_POS:
                sub = 'Idioms'
            elif e['pos'] in PHRASE_POS:
                sub = 'Phrases'
            else:
                continue
            rank = ORDER.index(sub)
            if k not in rows or rank > rows[k][1]:
                rows[k] = (sub, rank, e['pos'])
    return rows


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    rows = []
    for k, (sub, _, pos) in classify(lex).items():
        if k in below or k in excl or any(w in swears for w in k.split()):
            continue
        L = lex[k]
        rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': pos if sub != 'Phrases' else '', 'source': 'phrases',
                     'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(hi)] for _, hi, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        words, last = examples.phrase_parts(r, lex)
        n = 0
        for i in index.get(words[0], []):
            if examples.seq_hit(toks[i], words, last):
                n += 1
        r['count'] = n
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
