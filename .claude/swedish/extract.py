#!/usr/bin/env python3
"""Every Swedish lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-sv.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `sv_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Swedish spreads
a word over several: a noun over its indefinite and definite forms in both
numbers (`hus`, `huset`, `husen`), an adjective over its neuter and plural
(`stor`, `stort`, `stora`), a verb over its present, past and supine, its past
often on another stem (`äta`, `äter`, `åt`, `ätit`).  A lemma's frequency here
is the sum of the counts of every form Wiktionary lists for it -- its
declension or conjugation table, plus every entry that says it is a form of it
("past indicative of äta").

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- the Russian, Hindi and
Greek rule: each shared form's count is divided among its claimants in
proportion to what each earns from the forms it holds alone, plus one, over two
rounds.  The exceptions, each found on reading the ranking
(`docs/swedish-decks-plan.md`):
  · A CLOSED-CLASS WORD'S OWN SPELLING IS ITS OWN (the Hindi rule) -- `mycket`
    "much" is not split with the neuter of `mycken`, `för` "for" not with the
    present of `föra` "to lead" (split, `föra` was dealt as the 16th commonest
    word), `när` "when" not with the present of `nära` "to nourish" -- EXCEPT
    AGAINST A COMMON VERB: `går` is "goes" and, in `i går`, "yesterday";
    `var` is "was" and "where"; given the closed word, `går` "yesterday"
    took 176,000 of `gå`'s uses.  So where a rival verb earns, from the forms
    it holds alone, at least a tenth of the shared spelling's count, the count
    is split as any other (the adverb then gets little: it is the inventory's
    to place, not the ranking's);
  · A NOUN'S OWN HEADWORD IS ITS OWN against an adjective's cell (the Greek
    rule);
  · AN -S VERB OWNS ITS FORMS.  `finnas` "to exist", `hoppas` "to hope",
    `andas` "to breathe" are verbs of their own, and `finna`, `hoppa`, `anda`
    list the same spellings as their passives; split, `finnas` (`finns` is the
    93rd commonest form) was dealt at a count of 13.  Where the -s infinitive
    is a verb headword, the active verb's passive cells claim nothing;
  · A PLURAL-ONLY NOUN'S HEADWORD IS ITS OWN against another noun's cell
    (`pengar` "money" against the plural of `peng` "coin"; the Greek rule);
  · A PERSONAL PRONOUN'S TABLE CLAIMS NOTHING.  Wiktionary gives `jag`, `du`,
    `han`, `hon`, `den`, `vi` ... ONE shared table of every personal pronoun,
    so each would claim the others' counts; a pronoun is counted by its own
    spelling and the forms its own row of that table gives (`jag`: mig, mej,
    min, mitt, mina).

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name, and no capitalised headword (Swedish writes
its days, months and languages in lower case, so a capital is a name or an
abbreviation).  An entry whose every sense is a form or an alternative
spelling of another word is not a lemma -- its count reaches the lemma it
points to.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sv import fold, nfc, is_swedish

DUMP, FREQ, OUT = 'kaikki-sv.jsonl', 'sv_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'article', 'postp'}

# The months, which Wiktionary files as proper names (only `juli`, so far) although
# Swedish writes them in lower case: kept as nouns.
CAL = set('januari februari mars april maj juni juli augusti september oktober november '
          'december måndag tisdag onsdag torsdag fredag lördag söndag'.split())

# AN ENTRY THE EXTRACTION LOST.  English Wiktionary's page for `i` is a "mammoth page"
# whose languages live on subpages, and kaikki.org's extract (read 2026-11-09) carries
# no Swedish `i` at all -- the commonest preposition of the language.  Its senses here
# are copied from the Swedish section of that subpage, `i/languages M to Z`, read the
# same day (CC BY-SA 4.0); the Piteå-dialect pronoun and the intensifying verb
# particle are left out, as the WEAK rule would leave them.
SUPPLEMENT = {
    'i': {'word': 'i', 'entries': [{
        'pos': 'prep', 'etym': '1', 'gender': '', 'head': {}, 'table': [],
        'glosses': [{'g': g, 'weak': False, 'tags': []} for g in (
            'in; located inside',
            'in; specifies a place, a region or a country',
            'to (telling the time: kvart i åtta, "quarter to eight")',
            'for (a duration: i flera timmar, "for several hours")')]}]},
}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'offensive', 'nonstandard',
        'misspelling', 'literary', 'euphemistic', 'Finland', 'Gotland', 'Skåne'}

# a table cell with one of these is a real form, but too rare to claim a count from a commoner word
RARE_CELL = {'archaic', 'dated', 'rare', 'obsolete', 'dialectal', 'subjunctive'}

# the table's own scaffolding rows, which are not forms
SCAFFOLD = {'table-tags', 'inflection-template', 'class'}

# the person, number and gender tags that pick a personal pronoun's row out of the shared table
PRON_KEY = ('first-person', 'second-person', 'third-person', 'singular', 'plural', 'masculine',
            'feminine', 'common-gender', 'neuter', 'gender-neutral', 'reflexive')


def gender_of(e):
    if any('plural-only' in (s.get('tags') or []) for s in e.get('senses') or []) and \
            not any(h.get('name') == 'sv-noun' for h in e.get('head_templates') or []):
        return 'p'
    for h in e.get('head_templates') or []:
        a = h.get('args') or {}
        g = a.get('g', '') or (a.get('1', '') if h.get('name') == 'sv-noun' else '')
        pl = 'p' if g.endswith('-p') or g == 'p' else ''      # a plural-only noun (pengar)
        g = g.split('-')[0]
        if g in ('c', 'n'):
            g2 = (a.get('g2') or '').split('-')[0]
            return (g + g2 if g2 in ('c', 'n') and g2 != g else g) + pl
        if pl:
            return 'p'
    if any('plural-only' in (s.get('tags') or []) for s in e.get('senses') or []):
        return 'p'                                            # pengar, filed as a "noun form"
    tags = collections.Counter(t for s in e.get('senses') or [] for t in s.get('tags') or [])
    gs = [g for g, t in (('c', 'common-gender'), ('n', 'neuter')) if tags[t]]
    return ''.join(gs[:2])


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|eye dialect|'
                     r'misspelling|pronunciation spelling)\b.*\b(form|spelling) of\b')
CONTRACTION = re.compile(r'^(?:contraction|clipping) of (\S+)')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    return g


def sense_gloss(s, shown):
    """A sense's gloss.  A NESTED sense (["to be", "to exist"]) is given as its
    parent ("to be") once, its children then saying nothing new; a top-level
    sense as its own text."""
    gl = s.get('glosses') or []
    if not gl:
        return ''
    if len(gl) > 1:
        if gl[0] in shown:
            return ''
        shown.add(gl[0])
        return clean_gloss(gl[0])
    return clean_gloss(gl[-1])


def table_of(e):
    """The FIRST inflection table only.  Wiktionary sometimes adds a second, dialectal
    one (`barn` -> `barne`, `barna`), which the card must not show as Swedish."""
    rows, blocks = [], 0
    for f in e.get('forms') or []:
        if f.get('source') not in ('declension', 'conjugation', 'inflection'):
            continue
        tags = f.get('tags') or []
        if 'inflection-template' in tags:
            blocks += 1
            if blocks > 1:
                break
            continue
        if set(tags) & SCAFFOLD:
            continue
        fm = nfc(f.get('form', ''))
        if fm in ('-', '') or not is_swedish(fm):
            continue
        rows.append({'f': fm, 't': tags})
    return rows


def pron_row(word, table):
    """A personal pronoun's own row of the shared table: the person, number and gender
    of the cell that IS the headword, then every cell carrying exactly those."""
    me = [r for r in table if fold(r['f']) == fold(word) and 'nominative' in r['t']] or \
         [r for r in table if fold(r['f']) == fold(word)]
    if not me:
        return []
    key = {t for t in me[0]['t'] if t in PRON_KEY}
    return [r for r in table if {t for t in r['t'] if t in PRON_KEY} == key]


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_swedish(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas = {}              # fold(word) -> {word, entries:[...]}
    pointers = []            # (surface fold, target fold, kind) from form-of entries
    contractions = {}
    formonly = {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if not is_swedish(w) or w[:1] != w[:1].lower():
            continue
        senses = e.get('senses') or []
        if pos == 'contraction':
            for s in senses:
                m = CONTRACTION.match((s.get('glosses') or [''])[-1])
                if m and is_swedish(m.group(1)):
                    contractions.setdefault(fold(w), fold(m.group(1)))
            continue
        if pos == 'name' and w in CAL:
            pos = 'noun'
        if pos not in KEEP_POS:
            continue
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_swedish(tw):
                        pointers.append((fold(w), fold(tw), 'alt' if 'alt_of' in s else 'form'))
        if not real:
            # NOT A LEMMA -- but an ALTERNATIVE SPELLING is kept as a pointer for the
            # inventory; the fill never takes one, `select.py` resolves through it.
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_swedish(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0])})
            continue
        gl, shown = [], set()
        for s in real:
            tags = set(s.get('tags') or [])
            g = sense_gloss(s, shown)
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK),
                           'tags': sorted(tags & {'formal', 'informal', 'colloquial', 'figuratively',
                                                  'transitive', 'intransitive', 'idiomatic', 'slang',
                                                  'familiar', 'plural', 'in-plural', 'reflexive'})})
        table = table_of(e)
        personal = pos == 'pron' and sum(1 for r in table if 'personal' in r['t']) > 8
        if personal:
            table = pron_row(w, table)
        head_forms = {}
        for f in e.get('forms') or []:
            if f.get('source'):
                continue
            for t in f.get('tags') or []:
                if t in ('present', 'preterite', 'supine', 'imperative', 'comparative',
                         'superlative', 'neuter', 'plural', 'definite') \
                        and is_swedish(f.get('form', '')) and t not in head_forms:
                    head_forms[t] = nfc(f['form'])
        ent = {'pos': pos, 'etym': e.get('etymology_number', '') or '',
               'gender': gender_of(e) if pos == 'noun' else '', 'glosses': gl,
               'table': table, 'head': head_forms}
        if personal:
            ent['personal'] = True
        L = lemmas.setdefault(fold(w), {'word': w, 'entries': []})
        L['entries'].append(ent)
    for k, L in SUPPLEMENT.items():
        if k not in lemmas:
            lemmas[k] = json.loads(json.dumps(L))
    for k, L in lemmas.items():
        # a MULTI-WORD lemma (tycka om) is not in a list of single words; it is dealt
        # by its rarest word's count, halved, so it sits near its words.
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    # which lemmas claim which surface
    verbs = {k for k, L in lemmas.items() if any(e['pos'] == 'verb' for e in L['entries'])}
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        if ' ' in k:
            continue
        for ent in L['entries']:
            sverb = ent['pos'] == 'verb' and any(
                fold(r['f']) in verbs and fold(r['f']) != k
                for r in ent['table'] if {'infinitive', 'passive'} <= set(r['t']))
            for row in ent['table']:
                if ' ' in row['f'] or set(row['t']) & RARE_CELL:
                    continue
                if sverb and 'passive' in row['t']:
                    continue
                claims[fold(row['f'])].add(k)
    # a form-of entry's pointer claims only a spelling NO table lists: the tables are
    # the authority, and a pointer would undo the -s verb rule (`finns` is filed as
    # "present passive of finna" as well as being a cell of `finnas`)
    for surf, tgt, kind in pointers:
        if tgt in lemmas and surf not in lemmas and surf not in claims:
            claims[surf].add(tgt)
    for surf, tgt in contractions.items():
        if tgt in lemmas:
            claims[surf] = {tgt}
    pos_of = {k: {e['pos'] for e in L['entries']} for k, L in lemmas.items()}
    # A CLOSED-CLASS WORD'S OWN SPELLING IS ITS OWN, unless a common verb shares it.
    alone0 = collections.Counter()
    for surf, who in claims.items():
        if len(who) == 1:
            alone0[next(iter(who))] += counts.get(surf, 0)
    CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'article', 'postp'}
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 and surf not in contractions \
                and (any(e['pos'] in CLOSED for e in lemmas[surf]['entries'])
                     or all(e['pos'] == 'adj' and not e['table'] for e in lemmas[surf]['entries'])) \
                and not any(r in verbs and alone0[r] >= counts.get(surf, 0) / 10
                            for r in claims[surf] - {surf}):
            claims[surf] = {surf}
    # A NOUN'S OWN HEADWORD IS ITS OWN against an adjective's inflected cell (the Greek rule).
    for surf in list(claims):
        if surf not in lemmas or len(claims[surf]) < 2 or surf in contractions:
            continue
        if 'noun' not in pos_of[surf]:
            continue
        rivals = claims[surf] - {surf}
        plural_only = any(e['gender'].endswith('p') for e in lemmas[surf]['entries']
                          if e['pos'] == 'noun')
        if all(pos_of[r] <= ({'adj', 'noun'} if plural_only else {'adj'}) for r in rivals):
            claims[surf] = {surf}
    alone = collections.Counter()
    for surf, who in claims.items():
        if len(who) == 1:
            alone[next(iter(who))] += counts.get(surf, 0)
    freq = collections.Counter(alone)
    for _ in range(2):
        nxt = collections.Counter(alone)
        for surf, who in claims.items():
            if len(who) < 2:
                continue
            c = counts.get(surf, 0)
            if not c:
                continue
            wts = {k: freq[k] + 1 for k in who}
            tot = sum(wts.values())
            for k in who:
                nxt[k] += c * wts[k] / tot
        freq = nxt

    out = {}
    for k, L in formonly.items():
        if k not in lemmas:
            L['freq'] = round(freq.get(L['alt_of'], 0), 2)
            L['own'] = counts.get(k, 0)
            L['formonly'] = True
            out[k] = L
    for k, L in lemmas.items():
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    top = sorted((L for L in out.values() if 'entries' in L and ' ' not in L['word']), key=lambda L: (-L['freq'], L['word']))[:150]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
