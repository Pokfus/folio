#!/usr/bin/env python3
"""Every Irish lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-ga.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `ga_counts.json` (wikitext.py's counts of the Irish
Wikipedia, CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once
and kept.  Swedish's extract adapted (`.claude/swedish/extract.py`).

WHY A LEMMA FREQUENCY.  The corpus counts WORD FORMS, and Irish spreads a word
over many: a noun over its genitive and plural (`teach`, `tí`, `tithe`), a verb
over its tenses, the commonest on other stems (`bí`: `tá`, `bhí`, `beidh`,
`raibh`), a preposition over its personal forms (`le`: `liom`, `leat`, `leis`,
`léi`) -- and EVERY ONE OF THEM over its initial mutations (`teach`, `theach`,
`dteach`; `athair`, `hathair`, `n-athair`).  A lemma's frequency here is the sum
of the counts of every form Wiktionary lists for it, each with its mutated
spellings (`ga.variants`), plus every entry that says it is a form of it.

HOW A TABLE CELL IS READ.  Wiktionary's Irish cells are phrases: a noun's are
`an teach`, `na dtithe`, `leis an mbean`; a verb's `bhean mé`, `a bheanann`;
an adjective's `níos mó`.  The form a cell claims is its noun's or adjective's
LAST word and its verb's FIRST, a relative `a` and a subject pronoun skipped.
A cell that is only a pronoun (`sí`, Wiktionary's "sé / sí" split in two) or
carries a parenthesis (`a (gh)ní`) claims nothing.

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- the Russian, Hindi,
Greek and Swedish rule: each shared form's count is divided among its
claimants in proportion to what each earns from the forms it holds alone, plus
one, over two rounds, with Swedish's exceptions:
  · A CLOSED-CLASS WORD'S OWN SPELLING IS ITS OWN, unless a common verb shares it;
  · A NOUN'S OWN HEADWORD IS ITS OWN against an adjective's cell, and against a
    verb's VERBAL NOUN (`déanamh`, `bheith`): Wiktionary gives the verbal noun
    an entry of its own, and the verb claims the spelling only where none exists.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name -- except the months, days and languages,
which Irish CAPITALISES (`Eanáir`, `Luan`, `Gaeilge`, `Béarla`) and Wiktionary
partly files as names (`CAPS`).  An entry whose every sense is a form or an
alternative spelling of another word is not a lemma -- its count reaches the
lemma it points to.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ga import fold, nfc, is_irish, variants

DUMP, COUNTS, OUT = 'kaikki-ga.jsonl', 'ga_counts.json', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'article'}

# Capitalised headwords a learner needs: the months, the days, the languages and the country.
CAPS = set('Eanáir Feabhra Márta Aibreán Bealtaine Meitheamh Iúil Lúnasa Samhain Nollaig '
           'Luan Máirt Céadaoin Déardaoin Aoine Satharn Domhnach '
           'Gaeilge Béarla Fraincis Gearmáinis Spáinnis Iodáilis Éire'.split()) | \
    {'Meán Fómhair', 'Deireadh Fómhair', 'Dia duit', 'Dia dhuit'}

WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'offensive', 'nonstandard',
        'misspelling', 'literary', 'euphemistic', 'Munster', 'Connacht', 'Ulster',
        'Cois-Fharraige', 'Galway', 'Kerry', 'Donegal', 'Waterford', 'Cork', 'Mayo',
        'Aran-Islands', 'Erris'}

# AN ENTRY THE EXTRACTION LOST.  English Wiktionary's page for `i` is a "mammoth page" whose
# languages live on subpages, and kaikki.org's extract (read 2026-11-12) carries no Irish `i`
# -- the commonest preposition of the language.  Its sense and its personal forms are copied
# from the Irish section of the subpage `i/languages A to L`, read the same day (CC BY-SA 4.0).
_I_FORMS = [('ionam', ['first-person', 'singular']), ('ionat', ['second-person', 'singular']),
            ('ann', ['masculine', 'singular', 'third-person']),
            ('inti', ['feminine', 'singular', 'third-person']), ('ionainn', ['first-person', 'plural']),
            ('ionaibh', ['plural', 'second-person']), ('iontu', ['plural', 'third-person'])]
SUPPLEMENT = {
    'i': {'word': 'i', 'entries': [{
        'pos': 'prep', 'etym': '', 'gender': '', 'head': {},
        'table': [{'f': f, 't': t, 'k': f} for f, t in _I_FORMS],
        'glosses': [{'g': 'in', 'weak': False, 'tags': []}]}]},
}

RARE_CELL = {'archaic', 'dated', 'rare', 'obsolete', 'dialectal', 'Munster', 'Connacht',
             'Ulster', 'literary'}
SCAFFOLD = {'table-tags', 'inflection-template', 'class'}
PRONOUNS = {'mé', 'tú', 'sé', 'sí', 'muid', 'sibh', 'siad', 'é', 'í', 'iad', 'thú', 'sinn',
            'mise', 'tusa', 'seisean', 'sise', 'sinne', 'sibhse', 'siadsan'}
PARTICLES = {'a', 'ní', 'níor', 'go', 'gur', 'nach', 'nár', 'an', 'ar', 'do', 'má', 'dá', 'cá'}


def gender_of(e):
    for h in e.get('head_templates') or []:
        a = h.get('args') or {}
        g = a.get('1', '') if h.get('name') == 'ga-noun' else a.get('g', '')
        if not g:
            continue
        pl = 'p' if g.endswith('-p') or g == 'p' else ''
        g = g.split('-')[0]
        if g in ('m', 'f'):
            g2 = (a.get('g2') or '').split('-')[0]
            return (g + g2 if g2 in ('m', 'f') and g2 != g else g) + pl
        if pl:
            return 'p'
    tags = collections.Counter(t for s in e.get('senses') or [] for t in s.get('tags') or [])
    return ''.join(g for g, t in (('m', 'masculine'), ('f', 'feminine')) if tags[t])[:2]


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|eye dialect|'
                     r'misspelling|pronunciation spelling|superseded)\b.*\b(form|spelling) of\b')
CONTRACTION = re.compile(r'^(?:contraction|clipping) of (\S+)')


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


def claim_word(cell, pos):
    """The one word a table cell claims (the module's header), or ''."""
    if '(' in cell or '/' in cell:
        return ''
    ws = cell.split()
    if pos == 'verb':
        ws = [w for w in ws if fold(w) not in PRONOUNS]
        while len(ws) > 1 and fold(ws[0]) in PARTICLES:
            ws = ws[1:]
        w = ws[0] if ws else ''
    else:
        w = ws[-1] if ws else ''
    if fold(w) in PRONOUNS and pos != 'prep':
        return ''
    return w if is_irish(w) and ' ' not in w else ''


def table_of(e):
    """The inflection table (declension, conjugation, a preposition's personal forms) and
    the mutation row.  Each row keeps the whole cell for the card (`f`) and the word it
    claims (`k`)."""
    rows = []
    for f in e.get('forms') or []:
        src = f.get('source')
        if src not in ('declension', 'conjugation', 'inflection', 'mutation'):
            continue
        tags = [t for t in f.get('tags') or [] if t != 'error-unrecognized-form']
        if set(tags) & SCAFFOLD:
            continue
        fm = nfc(f.get('form', '')).strip()
        if fm in ('-', '—', '') or not is_irish(fm.replace("'", '')):
            continue
        if fold(fm) in PRONOUNS and e.get('pos') != 'prep':
            continue
        if src == 'mutation':
            tags = tags + ['mutation']
        rows.append({'f': fm, 't': tags, 'k': claim_word(fm, e.get('pos'))})
    return rows


HEAD_KEYS = {
    ('genitive', 'singular'): 'gen', ('nominative', 'plural'): 'pl',
    ('genitive', 'masculine', 'singular'): 'gsm', ('feminine', 'genitive', 'singular'): 'gsf',
    ('plural',): 'pl', ('comparative',): 'comp',
    ('analytic', 'present'): 'pres', ('analytic', 'future'): 'fut',
    ('noun-from-verb',): 'vn', ('participle', 'past'): 'pp', ('emphatic',): 'emph',
}


def head_forms(e):
    out = {}
    for f in e.get('forms') or []:
        if f.get('source'):
            continue
        k = HEAD_KEYS.get(tuple(sorted(f.get('tags') or [])))
        fm = nfc(f.get('form', ''))
        if k and k not in out and is_irish(fm):
            out[k] = fm
    return out


def main():
    raw = json.load(open(COUNTS, encoding='utf-8'))['df']
    counts = {}
    for k, v in raw.items():
        counts[fold(k)] = counts.get(fold(k), 0) + v

    lemmas, pointers, contractions, formonly = {}, [], {}, {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if not is_irish(w):
            continue
        if w[:1] != w[:1].lower():
            if w not in CAPS:
                continue
            if pos == 'name':
                pos = 'noun'
        senses = e.get('senses') or []
        if pos == 'contraction':
            for s in senses:
                m = CONTRACTION.match((s.get('glosses') or [''])[-1])
                if m and is_irish(m.group(1)):
                    contractions.setdefault(fold(w), fold(m.group(1)))
            continue
        if pos not in KEEP_POS:
            continue
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_irish(tw):
                        pointers.append((fold(w), fold(tw)))
        if not real:
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_irish(alts[0]):
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
        ent = {'pos': pos, 'etym': e.get('etymology_number', '') or '',
               'gender': gender_of(e) if pos == 'noun' else '', 'glosses': gl,
               'table': table_of(e), 'head': head_forms(e)}
        L = lemmas.setdefault(fold(w), {'word': w, 'entries': []})
        L['entries'].append(ent)
    for k, L in SUPPLEMENT.items():
        if k not in lemmas:
            lemmas[k] = json.loads(json.dumps(L))
    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'article'}
    closed_heads = {k for k, L in lemmas.items() if any(e['pos'] in CLOSED for e in L['entries'])}
    # which lemmas claim which surface -- every form with its mutated spellings
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        if ' ' in k:
            claims[k].add(k)
            continue
        for v in variants(k):
            claims[v].add(k)
        for ent in L['entries']:
            own = [r['k'] for r in ent['table'] if r['k'] and not set(r['t']) & RARE_CELL]
            for hk, hf in ent['head'].items():
                if hk == 'vn' and fold(hf) in lemmas:
                    continue          # the verbal noun's own entry holds its count
                if hk != 'emph':
                    own.append(hf)
            for fm in own:
                # A VERB CELL NEVER CLAIMS A CLOSED-CLASS HEADWORD: Wiktionary's `déan` lists
                # the northern present `ní sé` "he does", which is the spelling of the
                # negative particle `ní`, one of the commonest words of the language
                if ent['pos'] == 'verb' and fold(fm) in closed_heads:
                    continue
                for v in variants(fm):
                    claims[v].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas and surf not in claims:
            for v in variants(surf):
                claims[v].add(tgt)
    for surf, tgt in contractions.items():
        if tgt in lemmas:
            claims[surf] = {tgt}
    verbs = {k for k, L in lemmas.items() if any(e['pos'] == 'verb' for e in L['entries'])}
    pos_of = {k: {e['pos'] for e in L['entries']} for k, L in lemmas.items()}
    alone0 = collections.Counter()
    for surf, who in claims.items():
        if len(who) == 1:
            alone0[next(iter(who))] += counts.get(surf, 0)
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 and surf not in contractions \
                and any(e['pos'] in CLOSED for e in lemmas[surf]['entries']) \
                and not any(r in verbs and alone0[r] >= counts.get(surf, 0) / 10
                            for r in claims[surf] - {surf}):
            claims[surf] = {surf}
    for surf in list(claims):
        if surf not in lemmas or len(claims[surf]) < 2 or 'noun' not in pos_of[surf]:
            continue
        if all(pos_of[r] <= {'adj'} for r in claims[surf] - {surf}):
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
            for k in sorted(who):
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
