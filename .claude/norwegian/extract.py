#!/usr/bin/env python3
"""Every Norwegian Bokmål lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-nb.jsonl` (the kaikki.org extraction of English Wiktionary's
Norwegian Bokmål entries, CC BY-SA 4.0) and `no_full.txt` (hermitdave/
FrequencyWords, OpenSubtitles 2018, CC BY-SA 4.0) and writes `lex.json`.
Level-independent: built once and kept.  The Swedish extract
(`.claude/swedish/extract.py`) adapted; what differs is said here.

THE FORMS ARE THE HEAD LINE'S, NOT A TABLE.  Swedish Wiktionary entries carry a
declension or conjugation table; Bokmål entries almost never do (324 table cells
in the whole extract, read 2026-11-15) -- a word's forms are the ones its head
line lists: a noun's definite singular, indefinite plural and definite plural
(`bilen`, `biler`, `bilene`), an adjective's neuter and definite/plural (`stort`,
`store`), comparative and superlative, a verb's present, past, past participle,
imperative and passive (`spiser`, `spiste`, `spist`).  Those rows are this
extract's `table`.  A row tagged `alternative` (a second spelling, often
Nynorsk's) or `noun-from-verb` is not a form of the word and is left out.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS; a lemma's frequency
here is the sum of the counts of every form Wiktionary lists for it, plus every
entry that says it is a form of it ("past of spise").  A FORM SEVERAL LEMMAS
SHARE IS SPLIT, NOT COUNTED TWICE, in proportion to what each earns from the
forms it holds alone, plus one, over two rounds -- with the Swedish exceptions:
  · A CLOSED-CLASS WORD'S OWN SPELLING IS ITS OWN, except against a common verb
    (one earning a tenth of the shared count from forms it holds alone);
  · A NOUN'S OWN HEADWORD IS ITS OWN against an adjective's form, and a
    plural-only noun's (`penger`) against another noun's (`penge` "coin");
  · AN -S VERB OWNS ITS FORMS: `synes`, `finnes`, `trives` are verbs of their
    own, and `syne`, `finne`, `trive` list the same spellings as passives.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name, and no capitalised headword (Norwegian writes
its days, months and languages in lower case).  An entry whose every sense is a
form or an alternative spelling of another word is not a lemma -- its count
reaches the lemma it points to, and the object pronouns (`meg`, `deg`, `henne`),
which Wiktionary files only as forms of the subject, are kept as pointers the
inventory may name.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nb import fold, nfc, is_norwegian

DUMP, FREQ, OUT = 'kaikki-nb.jsonl', 'no_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'article', 'postp'}

CAL = set('januar februar mars april mai juni juli august september oktober november '
          'desember mandag tirsdag onsdag torsdag fredag lørdag søndag'.split())

# AN ENTRY THE EXTRACTION LOST.  English Wiktionary's page for `i` is a "mammoth page"
# whose languages live on subpages, and kaikki.org's extract (read 2026-11-15) carries no
# Bokmål `i` -- the commonest preposition of the language, as with Swedish.  Its senses
# are copied from the Norwegian Bokmål section of the subpage `i/languages M to Z`, read
# 2026-11-15 (CC BY-SA 4.0); the letter and its noun are left out.
SUPPLEMENT = {
    'i': {'word': 'i', 'entries': [{
        'pos': 'prep', 'etym': '', 'gender': '', 'table': [],
        'glosses': [{'g': g, 'weak': False, 'tags': []} for g in (
            'in, inside of (a place)',
            'for, in, during (a duration: i mange år, "for many years"; i dag, "today")',
            'in (a condition or state: i fred, "in peace")',
            'in (a means or method: betale i gull, "to pay in gold")')]}]},
}

# A SPELLING WHOSE COUNT IS THE CLOSED-CLASS WORD'S, whatever verb shares it: `når`
# "when" is also the present of `nå` "to reach", and the common-verb exception handed
# `nå` its whole count -- `når` was dealt at 0.49.  The subtitles' `når` is "when".
OWN = {'når'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'offensive', 'nonstandard',
        'misspelling', 'literary', 'euphemistic', 'Nynorsk', 'Riksmål'}

# a form row with one of these is not a form of THIS word in Bokmål
NOT_FORM = {'alternative', 'noun-from-verb', 'canonical', 'Nynorsk', 'table-tags',
            'inflection-template', 'error-unrecognized-form', 'romanization', 'class'}
RARE_CELL = {'archaic', 'dated', 'rare', 'obsolete', 'dialectal'}


def gender_of(e):
    """'m', 'f', 'n', 'mf' (a common-gender noun, en or ei), or 'p' (plural only)."""
    hs = e.get('head_templates') or []
    for h in hs:
        a = h.get('args') or {}
        if a.get('g') == 'p' or a.get('1') == 'p':
            return 'p'
    tags = collections.Counter(t for s in e.get('senses') or [] for t in s.get('tags') or []
                               if not s.get('form_of'))
    if any('plural-only' in (s.get('tags') or []) for s in e.get('senses') or []):
        return 'p'
    for h in hs:
        n = h.get('name', '')
        m = re.match(r'nb-noun-([mfnc])', n)
        if m:
            return {'m': 'm', 'f': 'f', 'n': 'n', 'c': 'mf'}[m.group(1)]
        if n == 'nb-noun':
            a = h.get('args') or {}
            g = (a.get('1') or a.get('g') or '')[:1]
            g2 = (a.get('g2') or '')[:1]
            if g == 'f' and g2 == 'm' or g == 'm' and g2 == 'f':
                return 'mf'
            if g in ('m', 'f', 'n'):
                return g
        if n == 'head':
            g = ((h.get('args') or {}).get('g') or '')[:1]
            if g in ('m', 'f', 'n'):
                return g
    if tags['masculine'] and tags['feminine']:
        return 'mf'
    for g, t in (('n', 'neuter'), ('m', 'masculine'), ('f', 'feminine')):
        if tags[t]:
            return g
    return ''


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|eye dialect|'
                     r'misspelling|pronunciation spelling)\b.*\b(form|spelling) of\b', re.I)


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    return g


def sense_gloss(s, shown):
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
    """The head line's forms (and the first conjugation table where one exists)."""
    rows, blocks = [], 0
    for f in e.get('forms') or []:
        tags = f.get('tags') or []
        if 'inflection-template' in tags:
            blocks += 1
            if blocks > 1:
                break
            continue
        if set(tags) & NOT_FORM or not tags:
            continue
        fm = nfc(f.get('form', ''))
        if fm in ('-', '') or not is_norwegian(fm) or fm.startswith('-') or fm.endswith('-'):
            continue
        row = {'f': fm, 't': tags}
        if row not in rows:
            rows.append(row)
    return rows


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_norwegian(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas, pointers, formonly = {}, [], {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if not is_norwegian(w) or w[:1] != w[:1].lower():
            continue
        senses = e.get('senses') or []
        if pos == 'name' and w in CAL:
            pos = 'noun'
        if pos not in KEEP_POS:
            continue
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_norwegian(tw):
                        pointers.append((fold(w), fold(tw)))
        if not real:
            # NOT A LEMMA -- kept as a pointer the inventory may name (`meg` -> `jeg`,
            # an alternative spelling -> its main one); the fill never takes one.
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            tg = alts or [nfc(t.get('word', '')) for s in senses for t in s.get('form_of') or []]
            if tg and is_norwegian(tg[0]):
                formonly.setdefault(fold(w), {
                    'word': w, 'alt_of': fold(tg[0]), 'kind': 'alt' if alts else 'form',
                    'pos': pos, 'note': (senses[0].get('glosses') or [''])[-1]})
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
        ent = {'pos': pos, 'etym': e.get('etymology_number', '') or '',
               'gender': gender_of(e) if pos == 'noun' else '', 'glosses': gl,
               'table': table_of(e)}
        L = lemmas.setdefault(fold(w), {'word': w, 'entries': []})
        L['entries'].append(ent)
    for k, L in SUPPLEMENT.items():
        if k not in lemmas:
            lemmas[k] = json.loads(json.dumps(L))
    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    verbs = {k for k, L in lemmas.items() if any(e['pos'] == 'verb' for e in L['entries'])}
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        if ' ' in k:
            continue
        for ent in L['entries']:
            for row in ent['table']:
                if ' ' in row['f'] or set(row['t']) & RARE_CELL:
                    continue
                # AN -S VERB OWNS ITS FORMS
                if ent['pos'] == 'verb' and 'passive' in row['t'] and fold(row['f']) in verbs \
                        and fold(row['f']) != k:
                    continue
                claims[fold(row['f'])].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas and surf not in claims:
            claims[surf].add(tgt)
    pos_of = {k: {e['pos'] for e in L['entries']} for k, L in lemmas.items()}
    alone0 = collections.Counter()
    for surf, who in claims.items():
        if len(who) == 1:
            alone0[next(iter(who))] += counts.get(surf, 0)
    CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'article', 'postp'}
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 \
                and (any(e['pos'] in CLOSED for e in lemmas[surf]['entries'])
                     or all(e['pos'] == 'adj' and not e['table'] for e in lemmas[surf]['entries'])) \
                and not any(r in verbs and alone0[r] >= counts.get(surf, 0) / 10
                            for r in claims[surf] - {surf}):
            claims[surf] = {surf}
    for surf in OWN:
        claims[surf] = {surf}
    for surf in list(claims):
        if surf not in lemmas or len(claims[surf]) < 2 or 'noun' not in pos_of[surf]:
            continue
        rivals = claims[surf] - {surf}
        plural_only = any(e['gender'] == 'p' for e in lemmas[surf]['entries'] if e['pos'] == 'noun')
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
    top = sorted((L for L in out.values() if 'entries' in L and ' ' not in L['word']),
                 key=lambda L: (-L['freq'], L['word']))[:200]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
