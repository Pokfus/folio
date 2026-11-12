#!/usr/bin/env python3
"""Every Hungarian lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-hu.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `hu_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Hungarian, an
agglutinating language, spreads one word over dozens: a noun over eighteen cases,
two numbers and a dozen possessive forms (`ház`, `házban`, `házak`, `házam`), a
verb over two conjugations, three moods and the past (`lát`, `látok`, `látom`,
`láttam`, `lásson`).  A lemma's frequency is the sum of the counts of every form
Wiktionary lists for it -- its declension table, or the verb blocks
`hu.verb_table` reads -- plus every entry that says it is a form of it.

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- the Russian, Hindi and
Greek rule: each shared form's count is divided among its claimants in
proportion to what each earns from the forms it holds alone, plus one, over two
rounds.  Two exceptions, Greek's:
  · AN INDECLINABLE WORD'S OWN SPELLING IS ITS OWN (closed classes and adverbs):
    `itt` "here" is not split with a case form of anything else;
  · A NOUN'S OWN HEADWORD IS ITS OWN against an adjective's inflected cell.

All matching goes through `hu.fold`, which keeps the accents and repairs the
subtitle list's Latin-1 spellings (`nõ` -> `nő`).

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix, an abbreviation or a proper name (the days and months are
nouns in Hungarian and lower case already).  An entry whose every sense is a
form or an alternative spelling of another word is not a lemma -- its count
reaches the lemma it points to.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hu import fold, nfc, is_hu, verb_table

DUMP, FREQ, OUT = 'kaikki-hu.jsonl', 'hu_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'postp', 'pron',
            'conj', 'particle', 'det', 'proverb', 'article', 'prep'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'offensive', 'nonstandard',
        'misspelling', 'literary', 'euphemistic', 'Transylvania', 'slang'}

CASE_TAGS = {'nominative', 'accusative', 'dative', 'instrumental', 'causal-final', 'translative',
             'terminative', 'essive-formal', 'essive-modal', 'inessive', 'superessive', 'adessive',
             'illative', 'sublative', 'allative', 'elative', 'delative', 'ablative', 'possessive'}


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|eye dialect|'
                     r'misspelling|informal|colloquial)\b.*\b(form|spelling) of\b')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    return g


def sense_gloss(s, shown):
    """A NESTED sense is given as its parent once; a top-level sense as its own text."""
    gl = s.get('glosses') or []
    if not gl:
        return ''
    if len(gl) > 1:
        if gl[0] in shown:
            return ''
        shown.add(gl[0])
        return clean_gloss(gl[0])
    return clean_gloss(gl[-1])


VN = re.compile(r'^verbal noun of [^\s,:(]+\s*(.*)$')


def verbal_noun_gloss(g):
    """The meaning in a "verbal noun of X" sense, which Wiktionary writes three ways:
    "verbal noun of lop: stealing, theft", "verbal noun of utazik ("travelling,
    travel"), the act of travelling", "verbal noun of ír, the act of writing".
    None when the sense names only its verb."""
    m = VN.match(g or '')
    if not m:
        return None
    rest = m.group(1).strip()
    if rest.startswith(':'):
        rest = rest[1:].strip()
    elif rest.startswith('(\u201c'):
        rest = rest[2:].split('\u201d')[0].strip()
    elif rest.startswith(','):
        rest = rest[1:].strip()
    else:
        return None
    return clean_gloss(rest) or None


def decl_table(e):
    """A noun's, adjective's, pronoun's or numeral's declension cells: [{f, t}]."""
    out = []
    for f in e.get('forms') or []:
        if f.get('source') != 'declension':
            continue
        tags = [t for t in f.get('tags') or [] if t != 'error-unrecognized-form']
        fm = nfc(f.get('form', '')).strip()
        if not set(tags) & CASE_TAGS or not is_hu(fm) or ' ' in fm:
            continue
        out.append({'f': fm, 't': tags})
    return out


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_hu(p[0].translate(str.maketrans('õôûÕÔÛ', 'őőűŐŐŰ'))):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas = {}              # fold(word) -> {word, entries:[...]}
    pointers = []            # (surface fold, target fold) from form-of entries
    formonly = {}
    vnouns = {}              # fold(word) -> a verbal noun Wiktionary files only as a form (`lopás`)
    nverb, badverb = 0, collections.Counter()
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_hu(w):
            continue
        if w[:1] != w[:1].lower():
            continue                    # a name, an abbreviation (Hungarian days and months are lower case)
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')
                and 'abbreviation' not in (s.get('tags') or [])]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_hu(tw):
                        pointers.append((fold(w), fold(tw)))
        if not real:
            vn = [verbal_noun_gloss(g) for sn in senses for g in (sn.get('glosses') or [])[:1]]
            vn = [g for g in vn if g]
            if vn and pos == 'noun':
                vnouns.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append(
                    {'pos': 'noun', 'etym': e.get('etymology_number', '') or '',
                     'glosses': [{'g': g, 'weak': False, 'tags': []} for g in vn],
                     'table': decl_table(e), 'head': {}})
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_hu(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0])})
            continue
        gl, shown = [], set()
        for s in real:
            tags = set(s.get('tags') or [])
            g = sense_gloss(s, shown)
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK),
                           'tags': sorted(tags & {'formal', 'informal', 'colloquial', 'figuratively',
                                                  'transitive', 'intransitive', 'idiomatic',
                                                  'familiar', 'plural', 'in-plural'})})
        ent = {'pos': pos, 'etym': e.get('etymology_number', '') or '', 'glosses': gl}
        if pos == 'verb':
            vt, bad = verb_table(e.get('forms') or [], w)
            if any(f.get('source') == 'conjugation' for f in e.get('forms') or []):
                nverb += 1
                for b in bad:
                    badverb[b] += 1
            ent['verb'] = vt
            ent['table'] = []
        else:
            ent['table'] = decl_table(e)
        ent['head'] = {t: nfc(f['form']) for f in e.get('forms') or [] if not f.get('source')
                       for t in (f.get('tags') or []) if t in ('plural', 'comparative', 'superlative')
                       and is_hu(f.get('form', ''))}
        L = lemmas.setdefault(fold(w), {'word': w, 'entries': []})
        L['entries'].append(ent)
    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    def forms_of(ent):
        out = {r['f'] for r in ent['table']}
        for blk in (ent.get('verb') or {}).values():
            for cell in blk:
                out.update(cell if isinstance(cell, list) else [cell])
        return out

    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        if ' ' in k:
            continue
        for ent in L['entries']:
            for fm in forms_of(ent):
                claims[fold(fm)].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    CLOSED = {'adv', 'postp', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'article', 'prep'}
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 \
                and any(e['pos'] in CLOSED for e in lemmas[surf]['entries']):
            claims[surf] = {surf}
    pos_of = {k: {e['pos'] for e in L['entries']} for k, L in lemmas.items()}
    for surf in list(claims):
        if surf not in lemmas or len(claims[surf]) < 2:
            continue
        if 'noun' not in pos_of[surf]:
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
    # THE VERBAL NOUNS, added AFTER the count so no other lemma's frequency moves (the
    # shipped A1 and A2 decks rebuild byte-identical): each is counted by its own
    # declension's forms, and flagged `vn` -- `select.py` deals them from B1 up.
    for k, L in vnouns.items():
        if k in out:
            continue
        fs = {k} | {fold(r['f']) for ent in L['entries'] for r in ent['table']}
        L['freq'] = sum(counts.get(x, 0) for x in fs)
        L['own'] = counts.get(k, 0)
        L['vn'] = True
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted((L for L in out.values() if 'entries' in L), key=lambda L: -L['freq'])[:80]
    print(f'  {len(out)} lemmas; {nverb} conjugated verbs, blocks refused: {dict(badverb)}')
    print('  commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
