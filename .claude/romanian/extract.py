#!/usr/bin/env python3
"""Every Romanian lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-ro.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `ro_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Romanian
spreads a noun over up to eight (`casă`, `casa`, `case`, `casele`, `casei`,
`caselor` ...) -- the definite article is a suffix -- and a verb over thirty.
A lemma's frequency is the sum of the counts of every form in its table, plus
every entry that says it is a `form of` it.  A form several lemmas share is
split in proportion to what each earns from the forms it holds alone, plus
one, over two rounds -- the Russian and Hindi pipelines' rule.

A table cell written with a particle (`să facă`, `nu face`) claims its last
word, the form a subtitle line counts.

THE BARE SPELLING YIELDS TO A COMMONER ACCENTED TWIN.  The subtitles mostly
write their diacritics (with the cedilla, folded by `ro.fold`), but not always:
`si` 1.08 million beside `şi` 4.27 million, `sa` 1.34 million beside `să`
7.86 million.  A surface written with no diacritic at all, whose accented
twins (same letters, diacritics restored) are together commoner than it, has
its count handed to those twins in proportion to their own; one commoner than
its twins keeps it (`fata` "the girl", 119 thousand, against `fată` and `față`).
Counted as written, `si` would have made "B (the musical note)" an A1 word.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix, a proper name or a Cyrillic (Moldovan Cyrillic) spelling.  An
entry whose every sense is a form or an alternative spelling of another word
is not a lemma -- its count reaches the lemma it points to.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ro import fold, bare, nfc, is_ro

DUMP, FREQ, OUT = 'kaikki-ro.jsonl', 'ro_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'article', 'contraction'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'Moldova', 'Banat', 'Transylvania', 'Oltenia', 'Maramureș', 'Aromanian',
        'Christianity', 'Biblical'}
KEEP_TAGS = {'formal', 'informal', 'colloquial', 'figuratively', 'transitive', 'intransitive',
             'reflexive', 'idiomatic', 'slang', 'familiar', 'pronominal'}


def ipa_of(e):
    for s in e.get('sounds') or []:
        if s.get('ipa') and not (s.get('tags') or []) or s.get('ipa') and 'Standard' in str(s.get('tags')):
            return s['ipa']
    return next((s['ipa'] for s in e.get('sounds') or [] if s.get('ipa')), '')


def gender_of(e):
    for h in e.get('head_templates') or []:
        g = (h.get('args') or {}).get('1', '')
        if g in ('m', 'f', 'n', 'm-p', 'f-p', 'n-p', 'mf'):
            return g[0] if g != 'mf' else 'mf'
    tags = collections.Counter(t for s in e.get('senses') or [] for t in s.get('tags') or [])
    gs = [g for g, t in (('m', 'masculine'), ('f', 'feminine'), ('n', 'neuter')) if tags[t]]
    return gs[0] if len(gs) == 1 else ('mf' if set(gs) == {'m', 'f'} else '')


def is_formof(s):
    t = s.get('tags') or []
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|'
                     r'misspelling|eye dialect|pre-reform)\b.*\b(form|spelling) of\b', re.I)


def clean_gloss(gs):
    gs = [re.sub(r'\s+', ' ', g or '').strip() for g in gs or []]
    gs = [g for g in gs if g]
    if not gs:
        return ''
    g = gs[-1]
    # A SUBSENSE THAT IS A PHRASE AND ITS TRANSLATION ("casă de schimb – bureau de
    # change") is a usage, not a meaning of the headword; its parent gloss is.
    if ' – ' in g or ' ― ' in g:
        g = gs[0] if len(gs) > 1 and ' – ' not in gs[0] else ''
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    return g


def table_rows(e):
    out = []
    for f in e.get('forms') or []:
        if f.get('source') not in ('declension', 'conjugation', 'inflection'):
            continue
        t = f.get('tags') or []
        if 'table-tags' in t or 'inflection-template' in t:
            continue
        w = nfc(f.get('form', ''))
        if not is_ro(w):
            continue
        out.append({'f': w, 't': [x for x in t if x != 'error-unrecognized-form']})
    return out


def main():
    counts = collections.Counter()
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_ro(p[0]):
            counts[fold(p[0])] += int(p[1])
    # the bare spelling yields to a commoner accented twin (see the header)
    twins = collections.defaultdict(list)
    for k in counts:
        b = bare(k)
        if b != k:
            twins[b].append(k)
    moved = 0
    for b, ks in twins.items():
        c = counts.get(b, 0)
        tot = sum(counts[k] for k in ks)
        if c and tot > c:
            for k in ks:
                counts[k] += c * counts[k] / tot
            moved += c
            counts[b] = 0
    print(f'  {len(counts)} surfaces; {moved:,.0f} bare-spelled tokens credited to their accented twins')

    lemmas, pointers, formonly = {}, [], {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_ro(w) or w[:1].isupper() or w.startswith('-') or w.endswith('-'):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_ro(tw):
                        pointers.append((fold(w), fold(tw)))
        if not real:
            # NOT A LEMMA -- but kept as a pointer for the inventory: an ALTERNATIVE
            # SPELLING that is the common one, and a closed-class FORM a beginner
            # learns as a word (`meu` "my", `mine` "me").
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_ro(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0])})
            elif pos in ('pron', 'det', 'article'):
                gl = [{'g': g, 'weak': False, 'tags': []}
                      for g in (clean_gloss(s.get('glosses')) for s in senses) if g]
                L = formonly.setdefault(fold(w), {'word': w, 'entries': []})
                if 'entries' in L:
                    L['entries'].append({'pos': pos, 'etym': '', 'ipa': ipa_of(e), 'gender': '',
                                         'glosses': gl, 'table': [], 'head': {}})
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss(s.get('glosses'))
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK), 'tags': sorted(tags & KEEP_TAGS)})
        head = {}
        for f in e.get('forms') or []:
            t = f.get('tags') or []
            if f.get('source') or not is_ro(f.get('form', '')):
                continue
            if 'plural' in t and 'plural' not in head:
                head['plural'] = nfc(f['form'])
            elif 'participle' in t and 'participle' not in head:
                head['participle'] = nfc(f['form'])
            elif 'feminine' in t and 'singular' in t and 'feminine' not in head:
                head['feminine'] = nfc(f['form'])
            elif 'canonical' in t and 'conjugation' in f['form'] and 'conj' not in head:
                head['conj'] = re.sub(r'^.*?(\d)\w* conjugation.*$', r'\1', f['form'])
        lemmas.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append({
            'pos': pos, 'etym': e.get('etymology_number', ''), 'ipa': ipa_of(e),
            'gender': gender_of(e) if pos == 'noun' else '', 'glosses': gl,
            'table': table_rows(e), 'head': head})
    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        for ent in L['entries']:
            for row in ent['table']:
                f = fold(row['f'])
                if ' ' not in k and ' ' in f:
                    first, _, rest = f.partition(' ')
                    if first in ('să', 'nu', 'a') and ' ' not in rest:
                        f = rest
                    else:
                        continue
                if ' ' in k and ' ' not in f:
                    continue
                claims[f].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    # AN INDECLINABLE WORD'S OWN SPELLING IS ITS OWN (the Hindi rule): `bine` "well"
    # and `și` "and" have no other form to earn a weight from, and a noun or verb
    # whose table happens to hold the same letters must not take them.
    CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'article'}
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 \
                and (any(e['pos'] in CLOSED for e in lemmas[surf]['entries'])
                     or all(e['pos'] == 'adj' and not e['table'] for e in lemmas[surf]['entries'])):
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
            L['freq'] = round(freq.get(L['alt_of'], 0) if 'alt_of' in L else counts.get(k, 0), 2)
            L['own'] = counts.get(k, 0)
            L['formonly'] = True
            out[k] = L
    for k, L in lemmas.items():
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = round(counts.get(k, 0))
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted(out.values(), key=lambda L: -L['freq'])[:60]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
