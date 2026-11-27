#!/usr/bin/env python3
"""The cards the Latin record ADDS: which move down a level, and the fields of the ones no deck had.

    python3 .claude/latin/inserts.py            # rewrites `add` in .claude/decks/latin-fixes.json
    python3 .claude/latin/inserts.py --check    # fails if `add` is not what this script builds (needs the cache; not in CI)

The beginner pass of Nov 2026 (docs/lang-decks.md, "The Latin beginner pass").  The record's `add` is
WRITTEN HERE, NEVER BY HAND: the lists below are the decisions, and everything else is computed.

A MOVE is a row with `from`: the generator deals the card to that deck, and `latin-fix.js` takes it out of
there whole and puts it in the target, so a generator fix reaches it.  Nothing of the card is stored.

AN INSERT is a card no deck had.  Its eight fields are built by `build_deck.py`'s own functions from the
English Wiktionary's entry (the kaikki.org extraction in the cache), read through `extract.entry` -- the
headword's macrons, the dictionary entry, the meanings, the table -- so nothing in a field is typed.  THE
LIST NAMES A WIKTIONARY PAGE (which has no macrons: `gratias ago`) and a part of speech; the headword the
card prints (`grātiās agō`) is the entry's own.

WHY THE GENERATOR NEVER DEALT THEM, in three kinds:
  · thirteen words of the DCC Latin Core Vocabulary that `select.py` drops in silence, because the DCC list
    and Wiktionary name their part of speech differently (`alius` is an adjective there and a determiner
    here; `nihil` a noun there, a pronoun here; `uterque`, `tot`, `quā`, `ecce`, `quasi` likewise) or
    because Wiktionary files the word as a participle (`falsus`, `rēctus`, `praesēns`).  The guard is right
    for the words it was written for (`ā`, the letter) and stays; its casualties are here, each on the
    level its DCC rank belongs to;
  · the enclitics `-que`, `-ne` and `-ve`, which `extract.py` leaves out as affixes: `-que` is the fourth
    commonest word of the DCC list, and A1's sentences ask questions with `-ne`;
  · the formulas of a first exchange, which Wiktionary files as phrases of several words (`grātiās agō`,
    `quid agis`, `ita vērō`, `amābō tē`, `ut valēs`) and the months, whose headwords are capitals.

THE SENTENCES are Tatoeba's, chosen as `examples.py` chooses a level's (the headword's own spelling first,
four to ten words, the shorter, the lower id), with three differences an added card needs: a sentence the
target deck already shows is not used again; a form another card of the target deck owns proves nothing,
the headword's own spelling included (so `quā`, which is also the ablative of `quī`, has no sentence
rather than a wrong one); an enclitic is found on a word that is otherwise a form A1 shows and is not
itself a word (`estne`, `vīsne`, never `bene` or `neque`); and a formula of several words is found where
all its words stand in one sentence (`Gratias tibi ago`).

THE NUMBER in a row's `id` is the next free one above every number the deck has ever held (pinned or
retired), in the order of the lists; a row already in the record keeps its number, so add to the END of a
list.
"""
import argparse, html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.environ['LATIN_LEVEL'] = 'c1'          # the whole lexicon (lex.json and the classical count's)
import la, extract, examples, build_deck, latin_level
from la import fold, nfc, tidy, tokens

CACHE = os.path.abspath(os.path.join(HERE, '..', 'latin-cache'))
REC = os.path.join(HERE, '..', 'decks', 'latin-fixes.json')
PIN = os.path.join(HERE, '..', 'decks', 'latin-ids.json')
DECKS = os.path.join(HERE, '..', '..', 'decks')
SRC = ("English Wiktionary via kaikki.org (CC BY-SA 4.0), read 2026-11-27: the headword, the dictionary "
       "entry, the senses and the table of the entry `%s`; sentences: Tatoeba (CC BY 2.0 FR), chosen by "
       "inserts.py")

# target deck -> [(headword as printed, the deck the generator deals it to, why)]
MOVES = {
    'latina1': [
        ('mālō', 'latina2', 'the third of volō, nōlō, mālō; A2\'s note 211'),
    ],
    'latina2': [
        ('kalendae', 'latinc1', 'the first day of a Roman month: a date cannot be read without it; C1\'s note 408'),
        ('nōnae', 'latinc1', 'the nones; C1\'s note 1485'),
        ('īdūs', 'latinb2', 'the ides; B2\'s note 1269'),
    ],
}

DCC = 'rank %d of the DCC Latin Core Vocabulary and on no card: select.py drops it because %s'
MONTH = 'a month: Wiktionary\'s headword is a capital, which extract.py does not read'
FORMULA = 'a formula of a first exchange, which Wiktionary files as %s; no stage read it'
# target deck -> [(Wiktionary page, parts of speech kept in this order, why, options)]
#   options: `gloss` -- a regular expression a sense must match to be kept (a month's adjective is also
#   "of the Julian gens"), `lead` -- the part of speech that leads where entries_for would lead otherwise
INSERTS = {
    'latina1': [
        ('nihil', ('pron', 'adv'), DCC % (55, 'the list calls it a noun and Wiktionary a pronoun'), {}),
        ('alius', ('det',), DCC % (37, 'the list calls it an adjective and Wiktionary a determiner'), {}),
        ('alter', ('det',), DCC % (148, 'the list calls it an adjective and Wiktionary a determiner'), {}),
        ('ullus', ('det',), DCC % (178, 'the list calls it an adjective and Wiktionary a determiner'), {}),
        ('uterque', ('pron',), DCC % (243, 'the list files it under conjunctions and Wiktionary as a pronoun'), {}),
        ('tot', ('det',), DCC % (259, 'the list calls it an adverb and Wiktionary a determiner'), {}),
        ('qua', ('adv',), DCC % (336, 'the list calls it a pronoun and Wiktionary an adverb'), {}),
        ('ecce', ('intj',), DCC % (643, 'the list calls it an adverb and Wiktionary an interjection')
         + '; six words of A1\'s own sentences', {}),
        ('-que', ('conj',), 'rank 4 of the DCC Latin Core Vocabulary and on no card: extract.py leaves out an enclitic', {}),
        ('-ne', ('particle',), 'the question particle, on 24 words of A1\'s sentences (estne, vīsne, esne) and on no card: an enclitic', {}),
        ('-ve', ('conj',), 'rank 307 of the DCC Latin Core Vocabulary and on no card: an enclitic', {}),
        ('gratias ago', ('verb',), FORMULA % 'a verb of two words', {}),
        ('quid agis', ('phrase',), FORMULA % 'a phrase'
         + '. It was the phrases deck\'s note 417 in Wikipedia\'s wording ("What are you doing?"), which the record drops', {}),
        ('ut vales', ('intj',), FORMULA % 'an interjection of two words', {}),
        ('ita vero', ('phrase',), FORMULA % 'a phrase', {}),
        ('amabo te', ('phrase',), FORMULA % 'a phrase', {'gloss': r'^please'}),
    ],
    'latina2': [
        ('adversus', ('prep', 'adv'), DCC % (460, 'Wiktionary files the adjective as a participle of advertō'), {}),
        ('falsus', ('verb',), DCC % (633, 'Wiktionary files it as a participle'), {}),
        ('praesens', ('verb',), DCC % (822, 'Wiktionary files it as a participle'), {}),
        ('rectus', ('verb',), DCC % (823, 'Wiktionary files it as a participle'), {}),
        ('Ianuarius', ('adj',), MONTH, {'gloss': r'\bJanuary\b'}),
        ('Februarius', ('adj',), MONTH, {'gloss': r'\bFebruary\b'}),
        ('Martius', ('adj',), MONTH, {'gloss': r'\bMarch\b'}),
        ('Aprilis', ('adj',), MONTH, {'gloss': r'\bApril\b'}),
        ('Maius', ('adj',), MONTH, {'gloss': r'\bMay\b'}),
        ('Iunius', ('adj',), MONTH, {'gloss': r'\bJune\b'}),
        ('Iulius', ('adj',), MONTH, {'gloss': r'\bJuly\b'}),
        ('Augustus', ('adj',), MONTH, {'gloss': r'\bAugust\b'}),
        ('September', ('adj',), MONTH, {'gloss': r'\bSeptember\b'}),
        ('October', ('adj',), MONTH, {'gloss': r'\bOctober\b'}),
        ('November', ('adj',), MONTH, {'gloss': r'\bNovember\b'}),
        ('December', ('adj',), MONTH, {'gloss': r'\bDecember\b'}),
    ],
    'latinb1': [
        ('quasi', ('conj',), DCC % (938, 'the list calls it an adverb and Wiktionary a conjunction'), {}),
    ],
}
FILES = {'latina1': 'Latin-A1', 'latina2': 'Latin-A2', 'latinb1': 'Latin-B1', 'latinb2': 'Latin-B2',
         'latinc1': 'Latin-C1'}
ENCLITIC = re.compile(r'^-')


def canon(e):
    """The headword as Wiktionary displays it.  `extract.canonical` compares the head line with the
    page title letter for letter, and a head line that ends in a question mark (`ut valēs?`) fails
    that and falls back to the title, which has no macrons; the form tagged canonical is the same
    headword without the mark."""
    x = extract.canonical(e)
    if x != e['word']:
        return x
    for f in e.get('forms') or []:
        if 'canonical' in (f.get('tags') or []):
            y = tidy(f['form']).rstrip('?!')
            if fold(y) == fold(e['word']):
                return y
    return x


def read_entries(pages):
    """page title -> [entry as lex.json would hold it], straight from the dump."""
    out = {p: [] for p in pages}
    probes = {p: '"word": ' + json.dumps(p, ensure_ascii=False) for p in pages}
    for line in open(os.path.join(CACHE, 'kaikki-la.jsonl'), encoding='utf-8'):
        hit = [p for p, s in probes.items() if s in line]
        if not hit:
            continue
        e = json.loads(line)
        if e.get('word') not in out:
            continue
        real = [s for s in e.get('senses') or [] if not extract.is_formof(s, e['pos']) and s.get('glosses')]
        gl = extract.glosses(real)
        if not gl:
            continue
        ent = extract.entry(e, real, gl)
        ent['canon'] = canon(e)
        out[e['word']].append(ent)
    return out


def deck_cards(deck_id):
    return json.load(open(os.path.join(DECKS, FILES[deck_id] + '.folio-deck.json'), encoding='utf-8'))['cards']


def shown_forms(cards):
    """fold -> how many cards of the deck show it (headword, dictionary entry, forms row, table)."""
    owners = {}
    for c in cards:
        F = c['fields']
        text = ' '.join([F['Latin'], re.sub(r'<span class="uc-cls">.*?</span>', '', F['Parts']), F['Forms'],
                         ' '.join(re.findall(r'<span class="uc-cj-f">(.*?)</span>', F['Table']))])
        for t in {fold(t) for t in tokens(html.unescape(re.sub(r'<[^>]+>', ' ', text)))}:
            owners[t] = owners.get(t, 0) + 1
    return owners


# a sentence an added card does not need (`Ecce vir raptator tibi`); the level decks drop a sexual
# sense of a word by the same test (`build_deck.NOT_A_MEANING`)
COARSE = re.compile(r'\b(?:rap(?:e|ed|es|ist)|sex|sexual|penis|fuck\w*|shit\w*)\b', re.I)


def pick(key, ents, pairs_tok, index, owners, used, all_forms, en_rx=None):
    """Up to three sentences for an added card (the module docstring says how)."""
    cands = []
    if ENCLITIC.match(key):
        suf = key[1:]
        for i, (_, _, _, ft) in enumerate(pairs_tok):
            hit = [t for t in ft if t.endswith(suf) and len(t) > len(suf) + 1
                   and t[:-len(suf)] in owners and t not in all_forms]
            if hit:
                cands.append((i, 0, hit))
    elif ' ' in key:
        # a verb of two words takes its object between them (`Gratias tibi ago`) and is found in its
        # other persons; any other formula is found only as it stands, word after word
        verb = ents[0]['pos'] == 'verb'
        forms = [key.split()] + [fold(t['f']).split() for e in ents for t in e['table'] if ' ' in t['f']]
        seen = set()
        for ws in forms:
            for i in index.get(ws[0], []):
                ft = pairs_tok[i][3]
                if i in seen:
                    continue
                if (all(w in ft for w in ws) if verb else
                        any(ft[j:j + len(ws)] == ws for j in range(len(ft)))):
                    seen.add(i)
                    cands.append((i, 0 if ws == forms[0] else 1, ws))
    else:
        # a cell that is ONLY a vocative is left out: `rēcte`, the vocative of `rēctus`, is in running
        # text the adverb `rēctē`, another word
        cases = {'nominative', 'genitive', 'dative', 'accusative', 'ablative', 'locative'}
        forms = {key} | {fold(t['f']) for e in ents for t in e['table'] if ' ' not in t['f']
                         and not ('vocative' in t['t'] and not cases & set(t['t']))}
        forms |= {fold(t['f']) for e in ents for t in e['table'] if ' ' not in t['f'] and
                  any(fold(u['f']) == fold(t['f']) and cases & set(u['t']) for u in e['table'])}
        own = {f for f in forms if not owners.get(f)}
        seen = set()
        for fm in own:
            for i in index.get(fm, []):
                if i not in seen:
                    seen.add(i)
                    hit = [t for t in pairs_tok[i][3] if t in forms]
                    # A MONTH is a capital and its English names it: `maius` is also "bigger", `Iulius`
                    # a man and `Augustus` an emperor
                    if en_rx and not (en_rx.search(pairs_tok[i][2]) and any(
                            fold(t) in forms and t[:1].isupper() for t in tokens(pairs_tok[i][1]))):
                        continue
                    cands.append((i, 0 if key in hit else 1, hit))

    def rank(c):
        i, first, _ = c
        n = len(pairs_tok[i][3])
        return (first, 0 if 4 <= n <= 10 else 1, len(pairs_tok[i][1]), pairs_tok[i][0])
    picked, shapes = [], set()
    for i, _, hit in sorted(cands, key=rank):
        _, lat, en, ft = pairs_tok[i]
        shape = tuple(sorted(ft))
        if lat in used or shape in shapes or COARSE.search(en):
            continue
        used.add(lat)
        shapes.add(shape)
        picked.append([lat, en, sorted(set(hit))])
        if len(picked) == 3:
            break
    return picked


def build_inserts():
    pages = [p for rows in INSERTS.values() for p, _, _, _ in rows]
    found = read_entries(pages)
    os.chdir(CACHE)
    lex = latin_level.load_lex()
    all_forms = set(lex)
    for L in lex.values():
        for e in L['entries']:
            for t in e['table']:
                all_forms.add(fold(t['f']))
    pairs = examples.load()
    pairs_tok = [(pid, lat, en, [fold(t) for t in tokens(lat)]) for pid, lat, en in pairs]
    index = {}
    for i, (_, _, _, ft) in enumerate(pairs_tok):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    dccv = build_deck.dcc_variants()
    rec = json.load(open(REC, encoding='utf-8'))
    out = {}
    for target, rows in INSERTS.items():
        # the deck as the GENERATOR dealt it: without the record's own cards
        mine = {r['word'] for r in rec.get('add', {}).get(target, [])}
        cards = [c for c in deck_cards(target) if c['fields']['Latin'] not in mine]
        owners = shown_forms(cards)
        used = {html.unescape(s) for c in cards
                for s in re.findall(r'data-say="(.*?)"', c['fields']['Examples'])}
        taken = {c['fields']['Key'] for c in cards}
        for page, poses, why, opt in rows:
            ents = [e for pos in poses for e in found[page] if e['pos'] == pos]
            if opt.get('gloss'):
                rx = re.compile(opt['gloss'])
                ents = [dict(e, glosses=[g for g in e['glosses'] if rx.search(g['g'])]) for e in ents]
                ents = [e for e in ents if e['glosses']]
            if not ents:
                raise SystemExit('insert %s: Wiktionary has no %s entry with a sense to teach' % (page, '/'.join(poses)))
            word = ents[0]['canon']
            key = fold(word)
            if key in taken:
                raise SystemExit('insert %s: %s is already a card of %s' % (page, word, target))
            mini = {key: {'word': page, 'entries': ents, 'dcc': 0, 'dcc_rows': [], 'tat': 0}}
            r = {'key': key, 'word': word, 'canon': [word], 'pos': '', 'dccpos': [], 'source': 'insert'}
            es = build_deck.entries_for(r, mini)
            main = es[0]
            tab = next((e for e in es if e['table']), main)
            ex = pick(key, ents, pairs_tok, index, owners, used, all_forms,
                      re.compile(opt['gloss']) if page[:1].isupper() else None)
            fields = {
                'Latin': build_deck.E(word),
                'Parts': build_deck.parts_html(main),
                'Key': key,
                # the speaker is not given the hyphen of an enclitic
                'Word': la.macronless(word).lstrip('-'),
                'English': build_deck.english(es, word),
                'Forms': build_deck.forms_line(main, [], dccv.get(key, set()) - taken),
                'Table': build_deck.table_html(tab),
                'Examples': build_deck.examples_html(ex),
            }
            if not fields['English']:
                raise SystemExit('insert %s: no meaning survived' % page)
            out[(target, page)] = (word, fields)
            print('  %-9s %-14s %-28s %s | %d sentences' % (
                target, word, re.sub(r'<[^>]+>', ' ', fields['Parts']).strip()[:28],
                re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', fields['English'])).strip()[:70], len(ex)))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    here = os.getcwd()
    built = build_inserts()
    os.chdir(here)
    rec = json.load(open(REC, encoding='utf-8'))
    pin = json.load(open(PIN, encoding='utf-8'))
    old = {(t, r['word']): r for t, rows in rec.get('add', {}).items() for r in rows}
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
        for page, _, why, _ in INSERTS.get(target, []):
            word, fields = built[(target, page)]
            rows.append({'word': word, 'id': 0, 'fields': fields, 'src': SRC % page, 'why': why})
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
            raise SystemExit('FAIL  latin-fixes.json `add` is not what inserts.py builds — run it without --check')
        print('inserts --check: the record\'s added cards are what the generator\'s code builds')
        return
    rec['add'] = add
    with open(REC, 'w', encoding='utf-8') as fh:
        json.dump(rec, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    print('latin-fixes.json: ' + ', '.join('%s +%d (%d moved, %d new)' % (
        t, len(r), sum('from' in x for x in r), sum('fields' in x for x in r)) for t, r in add.items()))


if __name__ == '__main__':
    main()
