#!/usr/bin/env python3
"""The cards the Swahili record ADDS: which move down to A1, and the fields of the ones no deck had.

    python3 .claude/swahili/inserts.py            # rewrites `add` in .claude/decks/swahili-fixes.json
    python3 .claude/swahili/inserts.py --check    # fails if `add` is not what this script builds (needs the cache; not in CI)

The beginner pass of Nov 2026 (docs/lang-decks.md, "The Swahili beginner pass").  The record's `add` is
WRITTEN HERE, NEVER BY HAND: the lists below are the decisions, and everything else is computed.

A MOVE is a row with `from`: the generator deals the card to that deck, and `swahili-fix.js` takes it out
of there whole and puts it in the target, so a generator fix reaches it.  Nothing of the card is stored.

AN INSERT is a card no deck had.  Its five fields are built by `build_deck.build` -- the function that
builds every other card -- from the same cache: the meaning is the English Wiktionary's (kaikki), the forms
are its table's, the sentences are Tatoeba's, found by `examples.pick` AFTER A1's own 500 rows have taken
theirs (a sentence is used once in a deck).  Nothing in a field is typed.  Four of the five are entries the
level stages could not reach: `-a`, "of", which `select.py` excludes from the frequency fill by name (its
count is wa / ya / la / cha / za: the reason stands for a count, and a card can show the five); `-wili`,
"two", whose n-class form `mbili` is the card A1 has; `sijambo`, the answer to `hujambo`, which the corpora
never use; and `kumi na moja`, eleven, a spelled-out number (the phrases stage leaves those to the levels and
the levels' fill takes no entry of several words).  The fifth, `si`, "is not", has one sense in Wiktionary
and it is worded as a pointer -- "negative present (all persons, numbers, and classes) of -wa" -- which
`extract.py` cuts, rightly, for the hundred entries that are a form of another card.  Here the wording IS
the meaning, and the card prints it as Wiktionary has it (`RAW`).

THE NUMBER in a row's `id` is the next free one above every number the deck has ever held (pinned or
retired), in the order of the lists; a row already in the record keeps its number, so add to the END of a
list.
"""
import argparse, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'swahili-cache'))
REC = os.path.join(HERE, '..', 'decks', 'swahili-fixes.json')
PIN = os.path.join(HERE, '..', 'decks', 'swahili-ids.json')
SRC = ('English Wiktionary via kaikki.org (CC BY-SA 4.0), read 2026-11-27: the entry\'s senses and the cells '
       'of its table; sentences: Tatoeba (CC BY 2.0 FR), chosen by examples.pick')

PHR = 'an everyday formula; the phrases deck is the last on the shelf'
NUM = 'a ten: A1 held twenty and fifty and no other'
MONTH = 'a month: A1\'s own description names the days and months, and it held the days; A2 dealt the months last'
# target deck -> [(headword as the card's Word field has it, the deck the generator deals it to, why)]
MOVES = {
    'swahilia1': [
        ('asante sana', 'swahiliphr', PHR),
        ('habari gani', 'swahiliphr', PHR),
        ('habari ya asubuhi', 'swahiliphr', PHR),
        ('habari ya jioni', 'swahiliphr', PHR),
        ('usiku mwema', 'swahiliphr', PHR),
        ('lala salama', 'swahiliphr', PHR),
        ('siku njema', 'swahiliphr', PHR),
        ('jina langu ni', 'swahiliphr', PHR),
        ('jina lako nani', 'swahiliphr', PHR),
        ('unatoka wapi', 'swahiliphr', PHR),
        ('ni saa ngapi', 'swahiliphr', PHR + ', spelled with three A1 cards'),
        ('tuonane baadaye', 'swahiliphr', PHR),
        ('safari njema', 'swahiliphr', PHR),
        ('karibu tena', 'swahiliphr', PHR),
        ('nina njaa', 'swahiliphr', PHR + '; nina is a cell of kuwa na\'s row'),
        ('nina kiu', 'swahiliphr', PHR + '; as nina njaa'),
        ('sijui', 'swahilia2', 'I don\'t know; A2\'s note 57'),
        ('polepole', 'swahilia2', 'slowly, which a beginner asks for; A2\'s note 595'),
        ('hujambo', 'swahilib1', 'the greeting of every first lesson; B1\'s note 236'),
        ('thelathini', 'swahilib1', NUM),
        ('a bluu', 'swahilib1', 'a colour: A1 held five'),
        ('sifuri', 'swahilib2', 'zero: A1 holds one to ten; B2\'s note 541'),
        ('arobaini', 'swahilib2', NUM),
        ('sitini', 'swahilib2', NUM),
        ('sabini', 'swahilib2', NUM),
        ('tisini', 'swahilib2', NUM),
        ('robo', 'swahilib2', 'a quarter: the clock is A1\'s (saa, dakika, nusu)'),
        ('kasoro', 'swahilib2', 'less: "to" the hour, as robo'),
        ('themanini', 'swahilic1', NUM),
    ] + [(m, 'swahilia2', MONTH) for m in ('Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai',
                                           'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba')],
}
# target deck -> [(the entry's Wiktionary headword, its part of speech in kaikki, why)]
INSERTS = {
    'swahilia1': [
        ('a', 'particle', '"of": ya, wa, za, cha and vya are 488 words of A1\'s sentences and were on no card; '
                          'select.py excludes it from the frequency fill by name'),
        ('si', 'verb', '"is not", beside ni: si and sio are 38 words of A1\'s sentences and were on no card'),
        ('sijambo', 'intj', 'the answer to hujambo; the corpora never use it, so no level dealt it'),
        ('wili', 'num', 'two, as it agrees (watu wawili, vitabu viwili): A1\'s card is mbili, its n-class form'),
        ('kumi na moja', 'num', 'eleven: the pattern of every number from 11 to 19, and of the tens with their units'),
    ],
}
# an insert whose one sense Wiktionary words as a pointer: printed as it stands (see the header)
RAW = {'si'}


def raw_entry(word, pos):
    """A lex.json entry for a word `extract.py` leaves out, its glosses Wiktionary's own words."""
    for line in open(os.path.join(CACHE, 'kaikki-sw.jsonl'), encoding='utf-8'):
        e = json.loads(line)
        if e.get('word') != word or e.get('pos') != pos:
            continue
        gl = []
        for s in e.get('senses') or []:
            tags = s.get('tags') or []
            if 'form-of' in tags or 'alt-of' in tags or not s.get('glosses'):
                continue
            g = re.sub(r'\s+', ' ', s['glosses'][-1]).strip()
            gl.append({'g': g, 'weak': False, 'tags': []})
        if gl:
            return {'word': word, 'freq': 0, 'own': 0, 'entries': [{
                'pos': pos, 'etym': e.get('etymology_number') or '', 'glosses': gl, 'cls': '',
                'anim': False, 'plonly': False, 'plural': [], 'inf': '', 'neginf': '', 'canon': '',
                'agree': [], 'proper': False, 'bare': True}]}
    raise SystemExit('insert %s: kaikki has no %s entry with a sense of its own' % (word, pos))


def build_inserts(specs):
    """word (the card's `Word`) -> its five fields, by the generator's own code."""
    os.environ['SWAHILI_LEVEL'] = 'a1'
    sys.path.insert(0, HERE)
    os.chdir(CACHE)
    import build_deck, examples
    import importlib.util as ilu             # the generator's `select.py`, not the standard library's
    spec = ilu.spec_from_file_location('swahili_select', os.path.join(HERE, 'select.py'))
    select = ilu.module_from_spec(spec)
    spec.loader.exec_module(select)
    lex = json.load(open('lex.json', encoding='utf-8'))
    a1 = json.load(open('selected-a1.json', encoding='utf-8'))
    if len(a1) != 500:
        raise SystemExit('selected-a1.json is not A1\'s 500 rows: run run.py --level a1 first')
    rows = []
    for key, pos, _ in specs:
        if key in RAW:
            if key in lex:
                raise SystemExit('insert %s: lex.json has the entry now; take it out of RAW' % key)
            lex[key] = raw_entry(key, pos)
        if key not in lex or not any(e['pos'] == pos for e in lex[key]['entries']):
            raise SystemExit('insert %s: the dictionary has no %s entry for it' % (key, pos))
        rows.append({'key': key, 'word': lex[key]['word'], 'say': select.say_of(lex[key], pos),
                     'freq': 0, 'pos': pos, 'source': 'inventory', 'topic': ''})
    toks, index = examples.corpus()
    used = set()
    examples.pick(a1, lex, toks, index, used)                       # A1's own rows take theirs first
    says = {examples.norm(r['say']).lstrip('-'): r['key'] for r in a1}
    exs = examples.pick(rows, lex, toks, index, used, says)
    cards, _ = build_deck.build(rows, lex, exs)
    if len(cards) != len(rows):
        raise SystemExit('an insert built no card')
    return {r['key']: c['fields'] for r, c in zip(rows, cards)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    rec = json.load(open(REC, encoding='utf-8'))
    pin = json.load(open(PIN, encoding='utf-8'))
    old = {(t, r['word']): r for t, rows in rec.get('add', {}).items() for r in rows}
    fields = build_inserts([s for rows in INSERTS.values() for s in rows])
    add = {}
    for target in sorted(set(MOVES) | set(INSERTS)):
        used = set(pin.get(target, {}).values()) | set(pin.get('_retired', {}).get(target, {}).values())
        used |= {r['id'] for (t, _), r in old.items() if t == target}
        nxt = max(used) + 1
        rows = []
        for word, src, why in MOVES.get(target, []):
            if word not in pin.get(src, {}) and word not in pin.get('_retired', {}).get(src, {}):
                raise SystemExit('move %s: %s never held it' % (word, src))
            rows.append({'word': word, 'id': 0, 'from': src, 'why': why})
        for key, pos, why in INSERTS.get(target, []):
            f = fields[key]
            rows.append({'word': f['Word'], 'id': 0, 'fields': f, 'src': SRC, 'why': why})
        for row in rows:
            have = old.get((target, row['word']))
            if have:
                row['id'] = have['id']
            else:
                row['id'] = nxt
                nxt += 1
        add[target] = rows
    if a.check:
        if json.dumps(rec.get('add', {}), ensure_ascii=False, sort_keys=True) != json.dumps(add, ensure_ascii=False, sort_keys=True):
            raise SystemExit('FAIL  swahili-fixes.json `add` is not what inserts.py builds — run it without --check')
        print('inserts --check: the record\'s added cards are what the generator\'s code builds')
        return
    rec['add'] = add
    with open(REC, 'w', encoding='utf-8') as fh:
        json.dump(rec, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    print('swahili-fixes.json: ' + ', '.join('%s +%d (%d moved, %d new)' % (
        t, len(r), sum('from' in x for x in r), sum('fields' in x for x in r)) for t, r in add.items()))


if __name__ == '__main__':
    main()
