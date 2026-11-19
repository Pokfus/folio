#!/usr/bin/env python3
"""The cards the Urdu RECORD adds: `add` in `.claude/decks/urdu-fixes.json`.

    python3 .claude/urdu/inserts.py            # rewrite the record's `add` section
    python3 .claude/urdu/inserts.py --check    # fail if it would change

The beginner pass (2026-11-19, `docs/lang-decks.md` "The Urdu beginner pass").  The
generator deals a level by frequency and cannot move a card to another level, card
a proper noun, or card a sentence; those are decisions about one card, and they are
written HERE as a list and applied by `.claude/decks/urdu-fix.js`.  This script
turns the list into the record's rows, so that nothing in a row is typed by hand:

  MOVES    a card the generator deals to a higher deck, taken down: the numbers
           (zero from B1, thirteen to nineteen and the tens from A2, the compound
           numbers twenty-one to ninety-nine from B1 and B2 into A2), the four
           months and the greeting ādāb, and the eight everyday phrases of the
           phrases deck that are spelled with A1's words.  A move row carries no
           fields: `urdu-fix.js` takes the generator's own card.  `from` is
           checked against the generator's selection for that level.

  INSERTS  a card no deck had.  Its fields are built with `build_deck.py`'s own
           functions, from the same cache:
             · the eight months English Wiktionary files as PROPER NOUNS
               (`extract.py` keeps no proper noun, so the generator never saw
               them), read from the kaikki extraction;
             · the compound numbers Wiktionary defines that no level's frequency
               fill reached, read from `lex.json` like any other word;
             · two SENTENCES of Tatoeba's, named by id, as phrase cards.  The
               meaning is Tatoeba's English sentence; the romanisation is JOINED
               from the romanisations Wiktionary gives each word (named in
               `TATOEBA`), never written here.

Needs the cache (`.claude/urdu-cache/`, a `run.py` fetch) and every level's
`selected-<level>.json`.  The record is what CI reads; this is how it is made.
"""
import importlib.util as ilu
import csv, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'urdu-cache'))
RECORD = os.path.abspath(os.path.join(HERE, '..', 'decks', 'urdu-fixes.json'))
os.environ.setdefault('URDU_LEVEL', 'a1')
sys.path.insert(0, HERE)
import build_deck as B                                    # noqa: E402
from ur import fold, nfc, plain, roman as RM, roman_norm   # noqa: E402

READ = '2026-11-19'
WIKT = f'English Wiktionary via kaikki.org (CC BY-SA 4.0), read {READ}'

# ---- what moves, and where from --------------------------------------------------------
A1_FROM_PHR = ['کیا حال ہے', 'آپ کا نام کیا ہے', 'صبح بخیر', 'شب بخیر', 'اللہ حافظ', 'سلام علیکم',
               'کوئی مسئلہ نہیں', 'میرا ایک سوال ہے']
A1_FROM_B1 = ['آداب', 'صفر', 'فروری', 'اپریل']
A1_FROM_A2 = ['تیرہ', 'چودہ', 'پندرہ', 'سولہ', 'سترہ', 'اٹھارہ', 'انیس',
              'تیس', 'چالیس', 'ساٹھ', 'ستر', 'اسی', 'نوے', 'اگست', 'اکتوبر']
MONTHS = ['جنوری', 'مارچ', 'مئی', 'جون', 'جولائی', 'ستمبر', 'نومبر', 'دسمبر']
MONTH_EN = ['January', 'March', 'May', 'June', 'July', 'September', 'November', 'December']

# Tatoeba sentences as phrase cards: (headword, Urdu sentence id, [(token, where its
# romanisation is read: 'lemma <word> <pos>' or 'form <lemma>')])
TATOEBA = [
    ('جی ہاں', '477094', [('جی', 'lemma جی particle'), ('ہاں', 'lemma ہاں particle')]),
    ('میں بھی ٹھیک ہوں', '1580444', [('میں', 'lemma میں pron'), ('بھی', 'lemma بھی *'),
                                    ('ٹھیک', 'lemma ٹھیک *'), ('ہوں', 'form ہونا')]),
]

ONES = 'one two three four five six seven eight nine'.split()
TENS = 'twenty thirty forty fifty sixty seventy eighty ninety'.split()
COMPOUND = [f'{t}-{o}' for t in TENS for o in ONES]


def load_extract():
    spec = ilu.spec_from_file_location('urdu_extract', os.path.join(HERE, 'extract.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def selected(level):
    p = os.path.join(CACHE, f'selected-{level}.json')
    if not os.path.exists(p):
        raise SystemExit(f'{p} is missing: run.py --level {level} first')
    return {plain(r['word']) for r in json.load(open(p, encoding='utf-8'))}


def card_from_lex(word, lex):
    row = {'key': fold(word), 'via': '', 'word': word, 'pos': '', 'source': 'record'}
    if row['key'] not in lex:
        row['key'] = word
    cards, _ = B.build([row], lex, {})
    if not cards:
        raise SystemExit(f'{word}: no card could be built from lex.json')
    return cards[0]['fields']


def main():
    lex = json.load(open(os.path.join(CACHE, 'lex.json'), encoding='utf-8'))
    X = load_extract()
    sel = {lv: selected(lv) for lv in ('a1', 'a2', 'b1', 'b2', 'phr')}
    kaikki = {}
    for line in open(os.path.join(CACHE, 'kaikki-ur.jsonl'), encoding='utf-8'):
        e = json.loads(line)
        kaikki.setdefault(fold(e.get('word', '')), []).append(e)

    def move(word, frm, why):
        lv = {'urdua2': 'a2', 'urdub1': 'b1', 'urdub2': 'b2', 'urphrase': 'phr'}[frm]
        if word not in sel[lv]:
            raise SystemExit(f'{word}: the generator does not deal it to {frm}')
        return {'word': word, 'from': frm, 'why': why}

    a1 = []
    for w in A1_FROM_PHR:
        a1.append(move(w, 'urphrase', 'an everyday formula spelled with A1\'s own words; the phrases deck '
                                      'is the last on the shelf'))
    for w in A1_FROM_B1:
        a1.append(move(w, 'urdub1', 'a greeting, zero or a month: dealt to B1 by its frequency, wanted by a beginner'))
    for w in A1_FROM_A2:
        a1.append(move(w, 'urdua2', 'a number to a hundred or a month: the set is kept together in A1'))

    # the months Wiktionary files as proper nouns
    for w, en in zip(MONTHS, MONTH_EN):
        es = [e for e in kaikki.get(fold(w), []) if e.get('pos') == 'name']
        es = [e for e in es if any(en in (s.get('glosses') or [''])[-1] for s in e.get('senses') or [])]
        if not es:
            raise SystemExit(f'{w}: no proper-noun entry glossed {en} in the kaikki extraction')
        e = es[0]
        ent = {'pos': 'name', 'etym': e.get('etymology_number', ''), 'roman': X.roman_of(e),
               'gender': X.gender_of(e), 'table': [], 'marked': X.marked_of(e, w),
               'glosses': [{'g': X.clean_gloss((s.get('glosses') or [''])[-1]), 'weak': False, 'tags': []}
                           for s in e.get('senses') or [] if en in (s.get('glosses') or [''])[-1]][:1]}
        if not ent['roman']:
            raise SystemExit(f'{w}: the entry has no romanisation')
        word = plain(w)
        label = B.POS_NAME['name'] + (', ' + B.GENDER[ent['gender']] if ent['gender'] in B.GENDER else '')
        fields = {'Urdu': B.ur(word), 'Roman': B.E(RM(word, ent['roman'])), 'Word': word,
                  'English': f'<div class="uc-sense"><div class="uc-pos">{B.E(label)}</div>'
                             f'<div class="uc-gl">{B.E(B.gloss_text(ent["glosses"][0]["g"]))}</div></div>',
                  'Forms': B.forms_line(ent, word), 'Table': '', 'Examples': ''}
        a1.append({'word': word, 'fields': fields,
                   'src': f'{WIKT}: the proper-noun entry {w}, its gloss and its romanisation',
                   'why': 'a month: Wiktionary defines all twelve, eight as proper nouns, which the generator '
                          'does not read'})

    # two Tatoeba sentences
    urd = {}
    for r in csv.reader(open(os.path.join(CACHE, 'urd_sentences_detailed.tsv'), encoding='utf-8'),
                        delimiter='\t', quoting=csv.QUOTE_NONE):
        urd[r[0]] = r[2]
    links = {}
    for r in csv.reader(open(os.path.join(CACHE, 'urd-eng_links.tsv'), encoding='utf-8'), delimiter='\t'):
        links.setdefault(r[0], []).append(r[1])
    want = {j for _, i, _ in TATOEBA for j in links.get(i, [])}
    eng = {}
    for line in open(os.path.join(CACHE, 'eng_sentences.tsv'), encoding='utf-8'):
        i, _, rest = line.partition('\t')
        if i in want:
            eng[i] = rest.split('\t', 1)[1].strip()
    for head, sid, parts in TATOEBA:
        sent = urd.get(sid, '')
        if fold(sent).strip(' .۔؟?!') != fold(head):
            raise SystemExit(f'Tatoeba {sid} is {sent!r}, not {head!r}')
        eid = sorted(links[sid], key=lambda j: (len(eng.get(j, '')), int(j)))[0]
        if ' '.join(t for t, _ in parts) != head:
            raise SystemExit(f'{head}: the tokens named do not spell it')
        rom = []
        for tok, how in parts:
            kind, lemma, *rest = how.split(' ')
            L = lex[fold(lemma)] if fold(lemma) in lex else lex[lemma]
            if kind == 'lemma':
                pos = rest[0]
                es = [e for e in L['entries'] if e['roman'] and (pos == '*' or e['pos'] == pos)]
                got = {RM(tok, e['roman']) for e in es[:1]}
            else:
                got = {roman_norm(t['r']) for e in L['entries'] for t in e['table'] if fold(t['f']) == fold(tok)}
            if len(got) != 1:
                raise SystemExit(f'{head}: {tok} has {len(got)} romanisations by "{how}"')
            rom.append(got.pop())
        fields = {'Urdu': B.ur(head), 'Roman': B.E(' '.join(rom)), 'Word': head,
                  'English': f'<div class="uc-sense"><div class="uc-pos">phrase</div>'
                             f'<div class="uc-gl">{B.E(eng[eid])}</div></div>',
                  'Forms': '', 'Table': '', 'Examples': ''}
        a1.append({'word': head, 'fields': fields,
                   'src': f'Tatoeba sentence {sid} (CC BY 2.0 FR) and its English translation {eid}; the '
                          f'romanisation is joined from Wiktionary\'s for each word '
                          f'({", ".join(h for _, h in parts)})',
                   'why': 'an everyday answer no dictionary entry covers'})

    # ---- A2: the compound numbers, twenty-one to ninety-nine, in order -------------------
    by_gloss = {}
    for k, es in kaikki.items():
        for e in es:
            if e.get('pos') != 'num':
                continue
            for s in e.get('senses') or []:
                g = (s.get('glosses') or [''])[-1].strip().lower().replace(' ', '-')
                if g in COMPOUND and not set(s.get('tags') or []) & {'form-of', 'alt-of'}:
                    by_gloss.setdefault(g, set()).add(plain(e['word']))
    a2 = []
    for g in COMPOUND:
        ws = sorted(by_gloss.get(g, []))
        if not ws:
            raise SystemExit(f'no numeral glossed {g}')
        if any(w in sel['a1'] or w in sel['a2'] for w in ws):
            # `بہتر` is "better" in A1 and, read bahattar, seventy-two: one spelling is one
            # card, so A1's card carries both readings (`build_deck.ETYMS`) and A2 has no row
            print(f'  {g}: carded below as', [w for w in ws if w in sel['a1'] or w in sel['a2']])
            continue
        carded = [w for w in ws if w in sel['b1'] or w in sel['b2']]
        if carded:
            if len(carded) > 1:
                raise SystemExit(f'{g}: two spellings are carded: {carded}')
            w = carded[0]
            a2.append(move(w, 'urdub1' if w in sel['b1'] else 'urdub2',
                           'a compound number: twenty-one to ninety-nine are kept together, in order'))
            continue
        ws = [w for w in ws if (fold(w) in lex or w in lex)]
        if not ws:
            raise SystemExit(f'{g}: no spelling in lex.json')
        w = sorted(ws, key=lambda w: (-(lex.get(fold(w)) or lex[w])['freq'], w))[0]
        a2.append({'word': w, 'fields': card_from_lex(w, lex),
                   'src': f'{WIKT}: the numeral entry, built by build_deck.py as any card is',
                   'why': f'{g}: every number to a hundred has a form of its own in Urdu, and the frequency '
                          f'fill reached 45 of them'})

    for i, r in enumerate(a1):
        r['id'] = 501 + i
    for i, r in enumerate(a2):
        r['id'] = 751 + i
    key = lambda r: {k: r[k] for k in ('word', 'id', 'from', 'fields', 'src', 'why') if k in r}
    add = {'urdua1': [key(r) for r in a1], 'urdua2': [key(r) for r in a2]}

    rec = json.load(open(RECORD, encoding='utf-8')) if os.path.exists(RECORD) else {}
    old = json.dumps(rec.get('add'), ensure_ascii=False, sort_keys=True)
    new = json.dumps(add, ensure_ascii=False, sort_keys=True)
    n_mv = sum(1 for d in add.values() for r in d if 'from' in r)
    n_in = sum(1 for d in add.values() for r in d if 'fields' in r)
    print(f'add: urdua1 {len(a1)}, urdua2 {len(a2)} rows; {n_mv} moves, {n_in} inserts')
    if '--check' in sys.argv:
        if old != new:
            raise SystemExit('the record\'s add section is not what inserts.py makes: run it')
        print('inserts --check: the record\'s add section is what this script makes')
        return
    out = {'_about': rec.get('_about', ''), 'add': add, 'decks': rec.get('decks', {})}
    with open(RECORD, 'w', encoding='utf-8') as fh:
        fh.write('{\n"_about": ' + json.dumps(out['_about'], ensure_ascii=False) + ',\n"add": {\n')
        fh.write(',\n'.join(
            json.dumps(d, ensure_ascii=False) + ': [\n' +
            ',\n'.join(json.dumps(r, ensure_ascii=False) for r in rows) + '\n]'
            for d, rows in add.items()))
        fh.write('\n},\n"decks": ' + json.dumps(out['decks'], ensure_ascii=False, indent=1) + '\n}\n')
    print('wrote', RECORD)


if __name__ == '__main__':
    main()
