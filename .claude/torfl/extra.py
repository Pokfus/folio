#!/usr/bin/env python3
"""Cards for NAMED words, built by the generator's own stages -- for the record.

    python3 .claude/torfl/extra.py            (needs the cache: run.py fetches it)

Writes `.claude/torfl-cache/extra-cards.json`; `.claude/decks/russian-merge-extra.js`
copies its cards into `.claude/decks/russian-fixes.json`, where they live from
then on.  Nothing here touches a deck.

WHY IT EXISTS (Nov 2026, the Russian beginner pass -- docs/lang-decks.md).  The
levels cannot be rebuilt to add a word: a rebuild is not byte for byte, and
each level is cut against the ones below it.  But the beginner audit found
words no deck teaches at all, and one rule of `select.py` is why:

    A FUNCTION-WORD ENTRY THAT IS AN INFLECTED FORM OF ANOTHER LEMMA IS NOT A NOTE

was written for `было` and `знаешь`, and it also turned away `так` (a form of
`така`, a currency), `весь` (an imperative of `весить`), `такой`, `себя`, `чем`
(the instrumental of `что`, but also "than"), `просто`, `конечно`, `ладно`
(short forms of adjectives) -- 18 of the 100 commonest lemmas and 48 of the
commonest 300 are on no deck, at any level.  THE RULE IS LEFT AS IT IS: changing
it would change what every level's rebuild selects.  The words it cost are
written out below and built here, with exactly the functions the levels were
built with (`build_deck.py`: glosses, forms, tables, stress), so an added card
is the same card the generator would have made.

WHAT DIFFERS FROM `examples.py`, each on purpose:
  * EVERY SENTENCE IS NAMED: its Tatoeba id is kept (`src`), since a card in the
    record must say where each part came from.
  * NO SENTENCE ALREADY ON THE SHELF: anything printed on a shipped Russian deck
    is passed over.
  * A BEGINNER CAN READ IT: among a word's candidates the ones with the fewest
    words that no A1 card shows come first (then `examples.py`'s own score).
    These cards go to the head of A1; the level's own sentences were chosen
    for commonness, not for what the reader had met.
  * A SENTENCE CAN BE ASKED TO SAY SOMETHING: `need` is a pattern its English
    must hold (`его` the possessive wants "his", not "him").

`TABLES` are the All-forms panels of cards that shipped WITHOUT one: Wiktionary
keeps one declension table per spelling and the entry the note was built from
(`этот` the determiner) was not the entry that holds it (`этот` the pronoun).
`build_deck.py` now looks at every entry of the note; the shipped cards get
their panel from here.
"""
import collections, importlib.util, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'torfl-cache'))
DECKS = os.path.abspath(os.path.join(HERE, '..', '..', 'decks'))
sys.path.insert(0, HERE)
os.environ.setdefault('TORFL_LEVEL', 'a1')
from russian import fold, bare, tokens, show, paradigm   # noqa: E402


def load(name):
    spec = importlib.util.spec_from_file_location('torfl_' + name, os.path.join(HERE, name + '.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


bd, ex, sel = load('build_deck'), load('examples'), load('select')

# (word, [parts of speech, the leading one first], {options})
#   need: a pattern the English of every sentence must hold
#   only: the forms a sentence may be chosen on (default: the whole paradigm)
#   first: sentences to choose before the rest, one per entry -- a `form` the
#          sentence must show and/or a pattern (`need`) its English must hold, so
#          that a card of several senses shows more than one of them
EXTRA = [
    # the commonest lemmas no deck teaches (the rule quoted above)
    ('себя', ['pron'], {}),
    ('весь', ['det', 'pron'], {'first': [{'form': 'весь'}, {'form': 'все'}, {'form': 'всё'}]}),
    ('так', ['adv', 'conj'], {'first': [{'need': r'\bso\b'}, {'need': r'\b(like this|this way|like that|that way)\b'}]}),
    ('такой', ['det', 'adv'], {}),
    ('чем', ['conj'], {'need': r'\bthan\b'}),
    ('просто', ['adv'], {}),
    ('конечно', ['adv'], {}),
    ('ладно', ['intj'], {}),
    ('ну', ['intj'], {}),
    ('раз', ['noun'], {'need': r'\b(times?|once|twice)\b'}),
    ('правда', ['noun', 'intj'], {'first': [{'form': 'правда', 'need': r'\btruth\b'}, {'form': 'правда', 'need': r'\b(really|true)\b'}]}),
    ('больше', ['adv'], {'first': [{'need': r'\bmore\b'}, {'need': r'\b(bigger|larger)\b'}]}),
    ('лучше', ['adv'], {'need': r'\b(better|rather)\b'}),
    ('раньше', ['adv'], {}),
    ('более', ['adv'], {}),
    ('возможно', ['adv'], {}),
    ('может быть', ['adv'], {}),
    ('жаль', ['adj'], {}),
    ('действительно', ['adv'], {}),
    ('плохо', ['adv'], {'need': r'\b(bad|badly|unwell|sick|ill|poorly|wrong)\b'}),
    ('быстро', ['adv'], {}),
    ('при', ['prep'], {}),
    ('парень', ['noun'], {}),
    # courtesies Wiktionary has an entry for and no deck carded
    ('не за что', ['intj'], {}),
    ('до встречи', ['intj'], {}),
    ('большое спасибо', ['intj'], {}),
    ('добро пожаловать', ['intj'], {}),
    ('приятного аппетита', ['intj'], {}),
]
# cards that shipped with no All-forms panel although the word declines
TABLES = ['этот', 'тот', 'какой']
# cards whose three sentences showed another word: `его` "his" carried three of
# `его` "him", the accusative of `он`, which `он`'s own card teaches
RESENTENCE = [
    ('его', {'need': r'\b(his|its)\b', 'refuse': r'\bhim\b', 'before_noun': True}),
    ('её', {'need': r'\b(her|its)\b', 'before_noun': True}),
    ('их', {'need': r'\btheir\b', 'refuse': r'\bthem\b', 'before_noun': True}),
]
# sentences read and turned away (a wrong sense, a name, an oddity), by Tatoeba id
SKIP = set('''
3654649 2072422 4037208 2518191 2096817 2475310 4037204 4037205 4037206 4037207 4037209 4037210 2796254
'''.split())


def main():
    os.chdir(CACHE)
    lex = json.load(open('lex.json', encoding='utf-8'))
    by_word = collections.defaultdict(list)
    for i, e in enumerate(lex):
        by_word[fold(e['word'])].append(i)

    # ------------------------------------------------ what the shelf already has
    shelf_sents, a1_forms, a1_nouns = set(), set(), set()
    for f in sorted(os.listdir(DECKS)):
        if 'Russian' not in f or not f.endswith('.folio-deck.json'):
            continue
        d = json.load(open(os.path.join(DECKS, f), encoding='utf-8'))
        if 'torfl' not in d['meta']['types']:
            continue
        for c in d['cards']:
            for m in re.finditer(r'data-say="([^"]*)"', c['fields']['Examples']):
                shelf_sents.add(fold(' '.join(tokens(m.group(1)))))
            if d['meta']['id'] == 'torfla1':
                txt = re.sub(r'<[^>]+>', ' ', c['fields']['Table'] + ' ' + c['fields']['Forms']
                             + ' ' + c['fields']['Russian'])
                fs = {fold(t) for t in tokens(txt)} | {fold(t) for t in tokens(c['fields']['Word'])}
                a1_forms |= fs
                if '>noun' in c['fields']['English']:
                    a1_nouns |= fs

    # ------------------------------------------------ the notes
    notes = []
    for word, poss, opt in EXTRA:
        members = []
        for p in poss:
            got = [i for i in by_word.get(fold(word), ()) if lex[i]['pos'] == p
                   and sel.senses_ok(lex[i]) and not sel.letter_name(lex[i])]
            # the entry spelt exactly as written (`все` is also a spelling of `всё`)
            got.sort(key=lambda i: 0 if bare(lex[i]['word']) == word else 1)
            if not got:
                raise SystemExit(f'no {p} entry for {word}')
            members.append(got[0])
        notes.append({'word': word, 'members': members, 'opt': opt, 'kind': 'card'})
    for word, opt in RESENTENCE:
        members = [i for i in by_word[fold(word)] if lex[i]['pos'] == 'pron'][:1]
        notes.append({'word': word, 'members': members, 'opt': opt, 'kind': 'ex'})
    for n in notes:
        for m in n['members']:
            for w in [lex[m]['word']] + [x for x, _t in paradigm(lex[m])]:
                a1_forms.add(fold(w))

    # ------------------------------------------------ fields
    def all_entries(word):
        return [lex[i] for i in by_word.get(fold(word), ())]

    def table_of(word):
        for e in all_entries(word):
            t = bd.generic_table(e)
            if t:
                return f'<div class="uc-cjg">{t}</div>'
        return ''

    def headword(e):
        h = show(e['head'])
        if ' ' in e['word'] and '́' not in h and '́' in e['exp']:
            # Wiktionary's own headword line (`добро́ пожа́ловать! • (…)`), where
            # the extraction kept the bare spelling
            h = re.sub(r'[!?]+$', '', e['exp'].split(' • ')[0]).strip()
        return h

    for n in notes:
        if n['kind'] != 'card':
            continue
        members = [lex[m] for m in n['members']]
        e0 = members[0]
        blocks = []
        for m in members:
            lab, gl = bd.english_block(m, None, 4 if len(members) == 1 else 3, first=m is e0)
            had = {g for _l, gs in blocks for g in gs}
            gl = [g for g in gl if g not in had]
            if gl:
                blocks.append((lab, gl))
        forms, table = '', ''
        if e0['pos'] == 'noun':
            forms, table = bd.noun_parts(e0)
            table = f'<div class="uc-cjg">{table}</div>' if table else ''
        elif e0['pos'] not in ('verb', 'adj') or not e0['forms']:
            table = table_of(n['word']) if e0['pos'] in ('pron', 'det', 'num') else ''
        n['fields'] = {
            'Russian': f'<div class="uc-word">{bd.E(headword(e0))}</div>',
            'Word': bare(e0['word']),
            'English': bd.english_html(blocks),
            'Forms': f'<div class="uc-forms">{forms}</div>' if forms else '',
            'Table': table,
            'Examples': '',
        }

    # ------------------------------------------------ sentences
    eng = {}
    for line in open('eng_sentences.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3:
            eng[p[0]] = p[2]
    link = {}
    for line in open('rus-eng_links.tsv', encoding='utf-8'):
        a, b = line.split()[:2]
        if b in eng and (a not in link or int(b) < int(link[a])):
            link[a] = b
    count = collections.Counter()
    for line in open('ru_full.txt', encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and p[1].isdigit():
            count[fold(p[0])] += int(p[1])

    forms_of, seq_of = [], []
    for n in notes:
        fs, seq = set(), None
        if ' ' in n['word']:
            seq = [fold(x) for x in tokens(n['word'])]
        else:
            for m in n['members']:
                for w in [lex[m]['word']] + [x for x, _t in paradigm(lex[m])]:
                    if ' ' not in w:
                        fs.add(fold(w))
            if n['opt'].get('only'):
                fs = {fold(x) for x in n['opt']['only']}
        forms_of.append(fs)
        seq_of.append(seq)

    cands = collections.defaultdict(list)
    for line in open('rus_sentences_detailed.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) < 3 or p[0] not in link or p[0] in SKIP:
            continue
        ru, en = p[2].strip(), eng[link[p[0]]].strip()
        if len(ru) > ex.MAX_CHARS or re.search(r'[A-Za-z0-9]', ru):
            continue
        toks = tokens(ru)
        if not ex.MIN_T <= len(toks) <= ex.MAX_T:
            continue
        ft = [fold(t) for t in toks]
        if any(t in ex.BAD_RU for t in ft) or ex.BAD_EN.search(en):
            continue
        if fold(' '.join(toks)) in shelf_sents:
            continue
        for k, n in enumerate(notes):
            if seq_of[k]:
                L = len(seq_of[k])
                hit = next((list(range(a, a + L)) for a in range(len(ft) - L + 1)
                            if ft[a:a + L] == seq_of[k]), None)
            else:
                hit = [j for j, t in enumerate(ft) if t in forms_of[k]] or None
            if not hit:
                continue
            o = n['opt']
            if o.get('need') and not re.search(o['need'], en, re.I):
                continue
            if o.get('refuse') and re.search(o['refuse'], en, re.I):
                continue
            if o.get('before_noun') and not all(j + 1 < len(ft) and ft[j + 1] in a1_nouns for j in hit):
                continue
            unmet = sum(1 for j, t in enumerate(ft) if j not in hit and t not in a1_forms)
            s = abs(len(ft) - 6) * 0.3
            for j, t in enumerate(ft):
                if j not in hit:
                    c = count.get(t, 0)
                    s += 0 if c > 20000 else 0.5 if c > 3000 else 1.5 if c > 500 else 3
            if ex.HOUSE.search(ru) or ex.HOUSE.search(en):
                s += 2
            cands[k].append((unmet, round(s, 2), int(p[0]), ru, en, hit, ft))

    used = set()
    for k in sorted(range(len(notes)), key=lambda k: len(cands[k])):
        got = []

        def take(c):
            rest = {t for j, t in enumerate(c[6]) if j not in c[5]}
            if c[2] in used or any(len(rest & g[7]) * 2 >= min(len(rest), len(g[7])) + 1 for g in got):
                return False
            got.append(c + (rest,))
            used.add(c[2])
            return True
        for want in notes[k]['opt'].get('first', []):
            for c in sorted(cands[k]):
                if want.get('form') and not any(c[6][j] == fold(want['form']) for j in c[5]):
                    continue
                if want.get('need') and not re.search(want['need'], c[4], re.I):
                    continue
                if take(c):
                    break
        for c in sorted(cands[k]):
            if len(got) == 3:
                break
            take(c)
        n = notes[k]
        n['src'] = [c[2] for c in got]
        n['ex'] = [{'ru': c[3], 'en': c[4], 'hits': c[5]} for c in got]
        if n['kind'] == 'card':
            n['fields']['Examples'] = bd.examples_html(n['ex'])
        print(f"  {n['word']}: " + ' | '.join(f"{c[3]} — {c[4]} [{c[2]}]" for c in got))

    out = {
        'cards': [{'word': n['fields']['Word'], 'fields': n['fields'], 'src': n['src']}
                  for n in notes if n['kind'] == 'card'],
        'ex': {n['word']: [[x['ru'], x['en'], f'Tatoeba {i}', [tokens(x['ru'])[h] for h in x['hits']]]
                           for x, i in zip(n['ex'], n['src'])]
               for n in notes if n['kind'] == 'ex'},
        'tables': {w: table_of(w) for w in TABLES},
    }
    json.dump(out, open('extra-cards.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"  wrote extra-cards.json: {len(out['cards'])} cards, {len(out['ex'])} re-sentenced, "
          f"{len(out['tables'])} tables")


if __name__ == '__main__':
    main()
