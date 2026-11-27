#!/usr/bin/env python3
"""Build the cards the Greek record ADDS to A1, with the generator's own code.

    python3 .claude/greek/inserts.py            # write `add` in .claude/decks/greek-fixes.json
    python3 .claude/greek/inserts.py --check    # the record's cards are what this builds (needs the cache)

WHY (the beginner pass, 2026-11-27; docs/lang-decks.md, "The Greek beginner pass").  A1 is 500
words, 313 from a topic inventory and 187 by frequency, and its single words cannot hold a
first conversation: γεια was a card and γεια σου was not, τι κάνεις, με λένε and πώς σε λένε
stood in one example sentence each, zero was on no card, and the numbers stopped at twelve and
skipped forty and sixty to ninety.  English Wiktionary HAS an entry for each of these, so each
is built exactly as `run.py` builds a card -- `build_deck.build` for the fields, `examples.pick`
for the sentences, from the same cache -- and nothing in a card is typed here.  Only the LIST
is a decision, which is why it is a record's and not the inventory's: A1 is cut at 500, so a
word added to `inventory.py` would push a frequency word out of the deck and renumber the
rest.  These cards are numbered from 501, above anything the generator deals.

THE SENTENCES.  `examples.pick` is run first over the generator's own 500 rows, so the
sentences those cards hold are used up exactly as in the deck, then over the list below in
order: an added card takes the best sentences no card of the deck already shows.  Each row's
`src` names its Tatoeba sentence ids.

A FEW SENTENCES ARE CHOSEN BY HAND (a fifth element: Tatoeba ids, or none), because the
picker matches a phrase's words and Greek uses the same words otherwise: τι κάνεις is "how are
you?" and also "what are you doing?", and the three shortest matches were the second.  A
chosen sentence is still Tatoeba's pair, built by the same code; one a card of the deck
already shows is refused.

Not a CI step (it reads the 370 MB cache).  `node .claude/decks/greek-fix.js` applies the
record; the place of each card in the deck is `greek-order.js`'s.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'greek-cache'))
RECORD = os.path.abspath(os.path.join(HERE, '..', 'decks', 'greek-fixes.json'))
os.environ['GREEK_LEVEL'] = 'a1'
sys.path.insert(0, HERE)
os.chdir(CACHE)

import build_deck, examples                     # noqa: E402
from gr import fold                             # noqa: E402

READ = '2026-11-27'
WIKT = f'English Wiktionary via kaikki.org (CC BY-SA 4.0), read {READ}'

FIRST = 'a first conversation: the phrase is a Wiktionary entry and was a card of no deck'
TRAVEL = 'a phrase a traveller needs on the first day: a Wiktionary entry, on no deck'
NUMBER = 'A1 counted one to twelve, then twenty, thirty, fifty: this number was on no deck'
# (the number in the card's id, the headword as Wiktionary spells it, its part of speech where
#  the spelling has two, why)
INSERTS = [
    (501, 'γεια σου', '', FIRST, [1123840, 2684025, 2051830]),   # three that differ; the picker's were one sentence three ways
    (502, 'γεια σας', '', FIRST),
    (503, 'τι κάνεις', '', FIRST, [1370120, 3013946, 4269857]),  # the greeting, not "what are you doing?"
    (504, 'τι κάνετε', '', FIRST, [3579741]),                    # the same
    (505, 'με λένε', '', FIRST, [948453, 7776356, 2570818]),     # "my name is", the sense the card leads with
    (506, 'πώς σε λένε', '', FIRST),
    (507, 'πώς σας λένε', '', FIRST),
    (508, 'χαίρω πολύ', '', FIRST),
    (509, 'τα λέμε', '', FIRST),
    (510, 'ευχαριστώ πολύ', '', FIRST),
    (511, 'δεν καταλαβαίνω', '', TRAVEL),
    (512, 'δεν ξέρω', '', TRAVEL),
    (513, 'πόσο κάνει', '', TRAVEL),
    (514, 'τι ώρα είναι', '', TRAVEL),
    (515, 'καλή όρεξη', '', TRAVEL),
    (516, 'στην υγειά σου', '', TRAVEL),
    (517, 'μηδέν', 'num', NUMBER),
    (518, 'δεκατρία', 'num', NUMBER),
    (519, 'δεκατέσσερα', 'num', NUMBER, []),                     # Tatoeba's two are an idiom ("keep your eyes peeled")
    (520, 'δεκαπέντε', 'num', NUMBER),
    (521, 'δεκαέξι', 'num', NUMBER),
    (522, 'δεκαεπτά', 'num', NUMBER),
    (523, 'δεκαοκτώ', 'num', NUMBER),
    (524, 'δεκαεννέα', 'num', NUMBER),
    (525, 'σαράντα', 'num', NUMBER),
    (526, 'εξήντα', 'num', NUMBER),
    (527, 'εβδομήντα', 'num', NUMBER),
    (528, 'ογδόντα', 'num', NUMBER),
    (529, 'ενενήντα', 'num', NUMBER),
]


def build():
    lex = json.load(open('lex.json', encoding='utf-8'))
    selected = json.load(open('selected-a1.json', encoding='utf-8'))
    have = {fold(r['word']) for r in selected}
    rows = []
    for num, word, pos, why, *_ in INSERTS:
        L = lex.get(fold(word))
        if not L or 'entries' not in L:
            raise SystemExit(f'{word}: not a Wiktionary lemma in lex.json')
        if L['word'] != word:
            raise SystemExit(f'{word}: Wiktionary spells it {L["word"]}')
        if fold(word) in have:
            raise SystemExit(f'{word}: the generator already deals it to A1')
        rows.append({'key': fold(word), 'via': '', 'word': word, 'pos': pos, 'source': 'record'})
    toks, index = examples.index_pairs(examples.load())
    used, ids = set(), {}
    examples.pick(selected, lex, toks, index, used)          # the deck's own sentences, used up
    by_id = {t[0]: i for i, t in enumerate(toks)}
    chosen = {}
    for (num, word, pos, why, *hand), row in zip(INSERTS, rows):
        if not hand:
            continue
        chosen[row['key']] = []
        for pid in hand[0]:
            i = by_id.get(pid)
            if i is None:
                raise SystemExit(f'{word}: Tatoeba {pid} is not a Greek sentence with an English pair')
            if i in used:
                raise SystemExit(f'{word}: Tatoeba {pid} is already on a card of the deck')
            want = fold(word).split() if ' ' in word else examples.forms_of(row, lex)
            hits = sorted({t for t in toks[i][3] if t in want})
            if not hits:
                raise SystemExit(f'{word}: Tatoeba {pid} does not hold it')
            used.add(i)
            chosen[row['key']].append([toks[i][1], toks[i][2], hits])
            ids.setdefault(row['key'], []).append(pid)
    exs = examples.pick([r for r in rows if r['key'] not in chosen], lex, toks, index, used, ids)
    exs.update(chosen)
    cards, _ = build_deck.build(rows, lex, exs)
    if len(cards) != len(rows):
        raise SystemExit('a row built no card')
    out = []
    for (num, word, pos, why, *_), card in zip(INSERTS, cards):
        sent = ids.get(fold(word), [])
        src = WIKT + ('; sentences: Tatoeba ' + ', '.join(str(i) for i in sent) + ' (CC BY 2.0 FR)'
                      if sent else '; no Tatoeba sentence holds it')
        out.append({'word': word, 'id': num, 'why': why, 'src': src, 'fields': card['fields']})
    return out


def main():
    rows = build()
    rec = json.load(open(RECORD, encoding='utf-8'))
    if '--check' in sys.argv:
        if rec.get('add', {}).get('greeka1') != rows:
            raise SystemExit('inserts.py --check: greek-fixes.json `add` is not what the generator '
                             'builds -- run python3 .claude/greek/inserts.py')
        print(f'inserts.py --check: the record\'s {len(rows)} added cards are what the generator builds')
        return
    rec.setdefault('add', {})['greeka1'] = rows
    with open(RECORD, 'w', encoding='utf-8') as fh:
        json.dump(rec, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    for r in rows:
        F = r['fields']
        print(f"  {r['id']} {r['word']} | {F['Roman']} {F['IPA']} | "
              + build_deck.re.sub(r'<[^>]+>', ' ', F['English']).strip()[:90])
        for m in build_deck.re.finditer(r'data-say="([^"]*)"></span>.*?<div class="uc-exe">(.*?)</div>',
                                        F['Examples']):
            print('        ', m.group(1), '—', m.group(2))
    print(f'  wrote {len(rows)} cards to {RECORD}')


if __name__ == '__main__':
    main()
