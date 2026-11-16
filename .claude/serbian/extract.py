#!/usr/bin/env python3
"""Every Serbian lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-sh.jsonl` (the kaikki.org extraction of English Wiktionary's
Serbo-Croatian, CC BY-SA 4.0) and `sr_full.txt` (hermitdave/FrequencyWords,
OpenSubtitles 2018, CC BY-SA 4.0) and writes `lex.json`.  Level-independent:
built once and kept.

THE LATIN ENTRY IS THE LEMMA.  Wiktionary files every Serbo-Croatian word
twice, a Latin entry and a Cyrillic one with the same senses and tables; the
Latin entry names its Cyrillic spelling (a form tagged `Cyrillic`, accented:
`ку̏ћа`), which is what the card prints.  Everything is keyed by `sr.fold`
(Latin, no accent marks, lower case), so the Cyrillic entries add nothing and
are skipped.

SERBIAN, NOT CROATIAN OR BOSNIAN.  Wiktionary's Serbo-Croatian is the whole
language, and a sense can carry the countries it is used in.  A sense tagged
with countries none of which is Serbia (`kruh` "bread", Croatia), or with a
dialect (Kajkavian, Chakavian, Torlakian, Ikavian) or as Ijekavian, is WEAK:
it never opens a card, and a lemma with nothing else is never dealt by the
fill.  AN IJEKAVIAN LEMMA (one naming an "alternative Ekavian" form:
`vrijeme` -> `vreme`) is not kept at all, and its count goes to its Ekavian
partner, since the subtitle list carries both pronunciations.

WHY A LEMMA FREQUENCY, AND HOW A SHARED FORM IS SPLIT: the Ukrainian rule
(`.claude/ukrainian/extract.py`).  A lemma's frequency is the sum of the
counts of every form in its table, plus every entry that says it is a `form
of` it; a form several lemmas share is split in proportion to what each earns
from the forms it holds alone, over two rounds; a closed-class word's own
spelling is its own.

THE TABLES are stored without accent marks (Wiktionary marks some cells and
not others).  The past participle (`radio m`, `radila f`) is filed under an
unrecognised tag in the extraction; the first six such cells are the active
participle, which is the past tense's, and are re-tagged `l-participle`.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sr import fold, nfc, bare, lat, is_serbian, is_cyr, pronoun_forms

DUMP, FREQ, OUT = 'kaikki-sh.jsonl', 'sr_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase'}

WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'obscene', 'offensive', 'Kajkavian', 'Chakavian', 'Torlakian', 'Ikavian', 'Ijekavian',
        'literary', 'Internet'}
# Weak UNLESS Serbia is named beside them: `kafa` "coffee" is tagged regional, Serbia.
REGIONAL = {'regional', 'Dalmatia'}
COUNTRIES = {'Croatia', 'Croatian', 'Bosnia', 'Bosnian', 'Serbia', 'Serbian', 'Montenegro'}
SERBIA = {'Serbia', 'Serbian'}
KEEP_TAGS = {'formal', 'informal', 'colloquial', 'figuratively', 'transitive', 'intransitive',
             'idiomatic', 'slang', 'familiar', 'perfective', 'imperfective', 'reflexive'}
SKIP_FORM_TAGS = {'table-tags', 'inflection-template', 'class', 'romanization',
                  'error-unrecognized-form', 'noun-from-verb'}

ASPECT_OF = re.compile(r'^(im)?perfective form of \S+$')
POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|'
                     r'eye dialect|misspelling)\b.*\b(form|spelling) of\b')


def weak(tags):
    t = set(tags)
    if t & WEAK:
        return True
    if t & SERBIA:
        return False
    return bool(t & (COUNTRIES | REGIONAL))


def is_formof(s):
    t = s.get('tags') or []
    if t and set(t) & set(AFFECT) and 'form-of' not in t:
        return False
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


AFFECT = {'diminutive': 'diminutive', 'endearing': 'affectionate', 'augmentative': 'augmentative'}


def affect_sense(s):
    """A diminutive is a word a learner learns (`baka` beside `baba`); Wiktionary files it as
    a `form of`, which would drop it -- the Ukrainian rule."""
    t = set(s.get('tags') or [])
    kinds = [AFFECT[k] for k in AFFECT if k in t]
    if not kinds or 'form_of' not in s:
        return None
    m = re.search(r'“([^”]+)”', (s['form_of'][0].get('extra') or ''))
    if not m:
        return None
    out = {k: v for k, v in s.items() if k != 'form_of'}
    return dict(out, glosses=[f'{m.group(1)} ({kinds[0]})'], tags=sorted(t - {'form-of'}))


LETTER_NAME = re.compile(r'^The name of the (Cyrillic|Latin)|letter of the .* alphabet')
SYNONYM = re.compile(r'^synonym of [^“]*“([^”]+)”\)?$')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    m = SYNONYM.match(g)
    if m:
        return m.group(1)
    if LETTER_NAME.search(g):
        return ''
    return '' if POINTER.match(g) else g


def cyr_head(e, w):
    """The accented Cyrillic headword the Latin entry names (`ку̏ћа`)."""
    for f in e.get('forms') or []:
        if 'Cyrillic' in (f.get('tags') or []) and is_cyr(f.get('form', '')) \
                and fold(f['form']) == fold(w):
            return nfc(f['form'])
    return ''


def lat_head(e, w):
    for f in e.get('forms') or []:
        if 'canonical' in (f.get('tags') or []) and fold(f.get('form', '')) == fold(w):
            return nfc(f['form'])
    return w


def gender_of(e):
    tags = set()
    for f in e.get('forms') or []:
        if 'canonical' in (f.get('tags') or []):
            tags |= set(f['tags'])
    for s in e.get('senses') or []:
        tags |= set(s.get('tags') or []) & {'masculine', 'feminine', 'neuter'}
    gs = [g for g in ('masculine', 'feminine', 'neuter') if g in tags]
    g = '/'.join(gs)
    if 'plural' in tags and e.get('pos') == 'noun':
        g = (g + ' ' if g else '') + 'plural only'
    return {'gender': g, 'animate': 'animate' in tags}


def aspect_of(e):
    for f in e.get('forms') or []:
        t = f.get('tags') or []
        if 'canonical' in t:
            if 'imperfective' in t and 'perfective' in t:
                return 'both'
            if 'perfective' in t:
                return 'perfective'
            if 'imperfective' in t:
                return 'imperfective'
    return ''


PART = re.compile(r'^(\S+) ([mfn])$')


def table_of(e):
    rows, part = [], 0
    for f in e.get('forms') or []:
        t = f.get('tags') or []
        if f.get('source') not in ('declension', 'conjugation', 'inflection'):
            continue
        fm = bare(nfc(f.get('form', '')))
        m = PART.match(fm)
        if 'error-unrecognized-form' in t and m:
            part += 1
            if part <= 6:      # the active participle; cells 7-12 are the passive one
                g = {'m': 'masculine', 'f': 'feminine', 'n': 'neuter'}[m.group(2)]
                num = 'plural' if 'plural' in t else 'singular'
                rows.append({'f': m.group(1), 't': ['l-participle', g, num]})
            continue
        if set(t) & SKIP_FORM_TAGS or weak(t):
            continue
        if not is_serbian(fm):
            continue
        rows.append({'f': fm, 't': t})
    return rows


def add_lemma(e, w, pos, real, lemmas, cyrillic=False):
    if cyrillic:
        ch = lat_head(e, w)
        head = next((nfc(f['form']) for f in e.get('forms') or []
                     if 'romanization' in (f.get('tags') or [])), lat(bare(w)))
    else:
        head, ch = lat_head(e, w), cyr_head(e, w)
    gl = []
    for s in real:
        tags = set(s.get('tags') or [])
        g = clean_gloss((s.get('glosses') or [''])[-1])
        if g:
            gl.append({'g': g, 'weak': weak(tags), 'tags': sorted(tags & KEEP_TAGS)})
    pf = pronoun_forms(w) if pos == 'pron' else None
    if pf is None:
        table = table_of(e)
        if table and fold(w) not in {fold(r['f']) for r in table} and pos != 'verb':
            table = []
    else:
        table = [{'f': x, 't': ['pronoun-case']} for x in pf]
    g = gender_of(e)
    ent = {'pos': pos, 'etym': e.get('etymology_number') or '', 'head': head, 'cyr': ch,
           'gender': g['gender'] if pos == 'noun' else '', 'animate': g['animate'],
           'aspect': aspect_of(e) if pos == 'verb' else '', 'glosses': gl, 'table': table,
           'comparative': [bare(nfc(f['form'])) for f in e.get('forms') or []
                           if (f.get('tags') or []) == ['comparative']
                           and is_serbian(f['form'])]}
    lemmas.setdefault(fold(w), {'word': lat(w), 'entries': []})['entries'].append(ent)


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_serbian(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas, pointers, formonly, ijek, cyr_only, aspectual = {}, [], {}, {}, {}, {}

    def entries():
        for line in open(DUMP, encoding='utf-8'):
            yield json.loads(line)
        for k in sorted(cyr_only):
            if k not in lemmas and k not in formonly:
                for e in cyr_only[k]:
                    yield dict(e, _cyr=True)

    for e in entries():
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if e.get('_cyr'):
            # the Cyrillic entry stands in for its missing Latin one
            ek = [1 for f in e.get('forms') or [] if 'Ekavian' in (f.get('tags') or [])]
            heads = ' '.join(h.get('expansion') or '' for h in e.get('head_templates') or [])
            if (ek and '(Ekavian)' not in heads) or '(Ijekavian)' in heads:
                continue
            senses = [s for s in e.get('senses') or [] if not is_formof(s) and s.get('glosses')]
            if not senses:
                continue
            add_lemma(e, w, pos, senses, lemmas, cyrillic=True)
            continue
        if pos not in KEEP_POS or not is_serbian(w):
            continue
        # A CYRILLIC ENTRY is kept aside, used only where the Latin one is missing from the
        # extraction (the Latin `i` "and" is: its page is shared by every language)
        if is_cyr(w):
            cyr_only.setdefault(fold(w), []).append(e)
            continue
        # AN IJEKAVIAN LEMMA names its Ekavian partner: its count goes there
        # (an Ekavian entry may name an Ekavian variant too: `deda` lists `ded`, so an entry
        # marked Ekavian, in its head line or a sense, is never taken for an Ijekavian one)
        ek = [fold(f['form']) for f in e.get('forms') or []
              if set(f.get('tags') or []) >= {'alternative', 'Ekavian'} and is_serbian(f['form'])]
        heads = ' '.join(h.get('expansion') or '' for h in e.get('head_templates') or [])
        ekav = '(Ekavian)' in heads or any('Ekavian' in (s.get('tags') or [])
                                           for s in e.get('senses') or [])
        if (ek and not ekav) or '(Ijekavian)' in heads:
            if ek:
                ijek.setdefault(fold(w), ek[0])
            continue
        senses = [affect_sense(s) or s for s in e.get('senses') or []]
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_serbian(tw):
                        pointers.append((fold(w), fold(tw)))
        # AN ASPECT PARTNER FILED AS A FORM ("imperfective form of báciti"): Wiktionary gives
        # most derived imperfectives no senses of their own (`bacati`, `vraćati`), so read
        # strictly they are not lemmas.  They are words a learner learns, so they are kept
        # aside and added AFTER the counts are split (`aspectual` below), which leaves every
        # other lemma's frequency -- and so the shipped A1 -- exactly as it was.
        if not real and pos == 'verb' and senses and all(
                ASPECT_OF.match((s.get('glosses') or [''])[-1]) for s in senses):
            base = fold((senses[0].get('form_of') or [{}])[0].get('word', ''))
            if base:
                aspectual.setdefault(fold(w), (e, w, base))
        if not real:
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_serbian(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'head': lat_head(e, w),
                                              'alt_of': fold(alts[0])})
            continue
        add_lemma(e, w, pos, real, lemmas)
    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        for ent in L['entries']:
            for row in ent['table']:
                if ' ' in row['f']:
                    continue          # an analytic form (`radio sam`, `radiću`) claims nothing
                claims[fold(row['f'])].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj'}
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 \
                and any(e['pos'] in CLOSED for e in lemmas[surf]['entries']):
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
    # THE IJEKAVIAN COUNT: what the subtitles say as `vrijeme` is the Ekavian lemma's too.
    # Only the forms no kept lemma claims are added (`lijepo` but never a shared spelling).
    ij_forms = collections.Counter()
    for line in open(DUMP, encoding='utf-8'):
        if '"Ekavian"' not in line:
            continue
        e = json.loads(line)
        w = fold(e.get('word', ''))
        if w not in ijek or ijek[w] not in lemmas:
            continue
        for f in {w} | {fold(r['f']) for r in table_of(e) if ' ' not in r['f']}:
            if f not in claims:
                ij_forms[(ijek[w], f)] = counts.get(f, 0)
    for (k, _f), c in ij_forms.items():
        freq[k] += c

    # THE ASPECT PARTNERS: meanings from the verb they partner, a count from the forms of
    # their own table no other lemma claims (and their own spelling).
    n_asp = 0
    for k, (e, w, base) in sorted(aspectual.items()):
        B = lemmas.get(base)
        if k in lemmas or not B:
            continue
        bents = [x for x in B['entries'] if x['pos'] == 'verb']
        if not bents:
            continue
        glosses = [dict(g) for g in bents[0]['glosses']]
        tmp = {}
        add_lemma(e, w, 'verb', [{'glosses': ['x']}], tmp)
        ent = tmp[fold(w)]['entries'][0]
        ent['glosses'] = glosses
        ent['aspect_of'] = base
        own = {fold(r['f']) for r in ent['table'] if ' ' not in r['f']} | {k}
        f_ = sum(counts.get(x, 0) for x in own if x not in claims or x == k)
        lemmas[k] = {'word': lat(w), 'entries': [ent], 'aspect_of': base, 'multi': 0}
        freq[k] = f_
        n_asp += 1

    out = {}
    for k, L in formonly.items():
        if k not in lemmas:
            L['freq'] = round(freq.get(L['alt_of'], 0), 2)
            L['formonly'] = True
            out[k] = L
    for k, L in lemmas.items():
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    # the Ijekavian forms, for examples.py to keep Ijekavian sentences off an Ekavian deck
    ijf = sorted({f for (_k, f) in ij_forms} | {f for f in ijek})
    json.dump(ijf, open('ijekavian-forms.json', 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted(out.values(), key=lambda L: -L['freq'])[:80]
    print(f'  {len(out)} lemmas ({len(ijek)} Ijekavian folded in, {n_asp} aspect partners); commonest:',
          ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
