#!/usr/bin/env python3
"""Every Finnish lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-fi.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `fi_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Finnish spreads
one word over very many: a noun over fifteen cases, two numbers and the
possessive suffixes (`talo`, `talon`, `taloa`, `talossa`, `taloihin`,
`talossani`), a verb over persons, tenses, moods, the passive and the
participles (`syödä`, `syön`, `söi`, `syönyt`, `syötiin`).  A lemma's frequency
is the sum of the counts of every form Wiktionary lists for it -- every
single-word cell of its declension or conjugation, the possessive forms
included, and the last word of a compound cell (`syönyt` from `on syönyt`,
the connegative `syö` from `en syö`) -- plus every entry that says it is a
form of it.  Only forms the subtitle list contains are kept in memory: the
extraction is 4.7 GB, and a form nobody says counts nothing.

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- the Hungarian, Greek
and Russian rule: each shared form's count is divided among its claimants in
proportion to what each earns from the forms it holds alone, plus one, over two
rounds.  Two exceptions, Hungarian's:
  · AN INDECLINABLE WORD'S OWN SPELLING IS ITS OWN (closed classes and adverbs):
    `nyt` "now" is not split with a case form of anything else;
  · A NOUN'S OWN HEADWORD IS ITS OWN against an adjective's inflected cell.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix, an abbreviation or a proper name (the days and months are
lower case in Finnish already).  An entry whose every sense is a form or an
alternative spelling of another word is not a lemma -- its count reaches the
lemma it points to.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fi import fold, nfc, is_fi, verb_table

DUMP, FREQ, OUT = 'kaikki-fi.jsonl', 'fi_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'postp', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'offensive', 'nonstandard',
        'misspelling', 'literary', 'euphemistic', 'slang', 'Southwest-Finnish',
        'Eastern-Finnish', 'Savo', 'Ostrobothnia', 'Helsinki', 'Tampere'}

CASE_TAGS = {'nominative', 'genitive', 'partitive', 'inessive', 'elative', 'illative',
             'adessive', 'ablative', 'allative', 'essive', 'translative', 'abessive',
             'instructive', 'comitative', 'accusative'}
POSS_TAGS = {'singular-possessive', 'plural-possessive', 'possessive'}


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


def decl(e, counts):
    """A declinable word's case cells (no possessive suffix): [{f, t}], and every other
    single-word cell the subtitles contain (the possessive forms): [form]."""
    table, extra = [], set()
    for f in e.get('forms') or []:
        if f.get('source') != 'declension':
            continue
        tags = set(f.get('tags') or []) - {'error-unrecognized-form'}
        fm = nfc(f.get('form', '')).strip()
        if not tags & CASE_TAGS or not is_fi(fm) or ' ' in fm or fm == '-':
            continue
        if tags & POSS_TAGS:
            if fold(fm) in counts:
                extra.add(fm)
            continue
        if 'rare' in tags:
            continue
        table.append({'f': fm, 't': sorted(tags)})
    have = {r['f'] for r in table}
    return table, sorted(extra - have)


def conj_extra(e, counts):
    """Every word of the conjugation the subtitles contain, beyond the blocks the card shows:
    single-word cells and the last word of a compound cell (`syönyt`, the connegative)."""
    out = set()
    for f in e.get('forms') or []:
        if f.get('source') != 'conjugation':
            continue
        tags = set(f.get('tags') or [])
        if tags & {'table-tags', 'inflection-template', 'class'}:
            continue
        fm = nfc(f.get('form', '')).strip()
        if not fm or fm == '-' or not is_fi(fm):
            continue
        last = fm.split()[-1]
        if fold(last) in counts:
            out.add(last)
    return out


def verb_forms(vt):
    out = set()
    for k, blk in vt.items():
        if k == 'inf' or k == 'pass':
            out.update(x for x in blk if x and ' ' not in x)
            continue
        for cell in blk:
            for x in cell:
                out.add(x.split()[-1])
    return out


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_fi(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas = {}              # fold(word) -> {word, entries:[...]}
    allforms = {}            # fold(word) -> set of folded forms (only those the subtitles contain)
    pointers = []            # (surface fold, target fold) from form-of entries
    formonly = {}
    nverb, badverb = 0, collections.Counter()
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_fi(w) or w.startswith('-') or w.endswith('-'):
            continue
        if w[:1] != w[:1].lower():
            continue                    # a name, an abbreviation
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')
                and 'abbreviation' not in (s.get('tags') or [])]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_fi(tw):
                        pointers.append((fold(w), fold(tw)))
        if not real:
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_fi(alts[0]):
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
        ent = {'pos': pos, 'etym': str(e.get('etymology_number', '') or ''), 'glosses': gl}
        mine = allforms.setdefault(fold(w), set())
        if pos == 'verb':
            vt, bad = verb_table(e.get('forms') or [], w)
            if vt.get('pres'):
                nverb += 1
                for b in bad:
                    badverb[b] += 1
            ent['verb'] = vt
            ent['table'] = []
            ex = conj_extra(e, counts) | verb_forms(vt)
        else:
            ent['table'], ex = decl(e, counts)
            ex = set(ex) | {r['f'] for r in ent['table']}
        mine.update(fold(x) for x in ex if fold(x) in counts)
        ent['head'] = {t: nfc(f['form']) for f in e.get('forms') or [] if not f.get('source')
                       for t in (f.get('tags') or []) if t in ('plural', 'comparative', 'superlative')
                       and is_fi(f.get('form', ''))}
        L = lemmas.setdefault(fold(w), {'word': w, 'entries': []})
        L['entries'].append(ent)
    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        if ' ' in k:
            continue
        for fm in allforms.get(k, ()):
            claims[fm].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    CLOSED = {'adv', 'postp', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'prep'}
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
        # the forms a sentence may match beyond the tables (possessives, participles), kept
        # only for a word common enough to be dealt
        if L['freq'] >= 20:
            shown = {fold(r['f']) for e in L['entries'] for r in e['table']}
            L['x'] = sorted(allforms.get(k, set()) - shown - {k})
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    top = sorted((L for L in out.values() if 'entries' in L), key=lambda L: (-L['freq'], L['word']))[:80]
    print(f'  {len(out)} lemmas; {nverb} conjugated verbs, blocks missing: {dict(badverb)}')
    print('  commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
