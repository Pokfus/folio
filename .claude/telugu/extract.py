#!/usr/bin/env python3
"""Every Telugu lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-te.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `te_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.
The Hindi pipeline's extractor (`.claude/hindi/extract.py`) adapted; read its
header for the rules this one shares.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Telugu is
agglutinative: `ఇల్లు` "house" is also `ఇంటికి` "to the house", `ఇంటిలో` "in
the house", `ఇండ్లు` "houses".  A lemma's frequency is the sum of the counts of
every form Wiktionary lists for it -- its table where it has one, the plural and
genitive in its headword line, and every entry that says it is a form of it.
Wiktionary has a table for few Telugu words (about 150 verbs, 35 nouns), so the
count stays close to the headword's own; the level's inventory, not the count,
is the deck's core, and the plan says so.

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE (the TORFL rule), and a
closed-class word keeps its own spelling (the Hindi rule 1).

THE VERB TABLES.  Wiktionary's Telugu conjugation tables reach kaikki as three
untitled blocks of seven rows whose tags carry the PERSON but not the tense.
Only the regular shape -- exactly three blocks of seven -- is labelled, by
position, as the template prints them: present continuous, past, future.  The
rows of any other shape still count towards the lemma and still match its
sentences; they are never shown, since nothing in them says what they are.

All matching goes through `te.fold` (final -ము / -ం, ళ్ళ / ళ్ల).
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from te import fold, nfc, is_telugu

DUMP, FREQ, OUT = 'kaikki-te.jsonl', 'te_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'postp'}

# A LANGUAGE'S NAME is a proper noun in Wiktionary, and the fill never takes one.
NAME_OK = {'తెలుగు'}

WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'Jainism', 'Buddhism', 'vulgar', 'derogatory', 'literary',
        'nonstandard', 'misspelling', 'Vedic', 'Biblical', 'offensive'}

TENSES = ['present continuous', 'past', 'future']
PERSON_ROWS = ['1s', '1p', '2s', '2p', '3m', '3f', '3n']


def roman_of(e):
    for f in e.get('forms') or []:
        if 'romanization' in (f.get('tags') or []):
            return f.get('form', '')
    return ''


def gender_of(e):
    for h in e.get('head_templates') or []:
        a = h.get('args') or {}
        g = a.get('g', '') if h.get('name') == 'te-noun' else a.get('g', '')
        if g in ('m', 'f', 'n', 'm-p', 'f-p', 'n-p'):
            return g[0]
    tags = collections.Counter(t for s in e.get('senses') or [] for t in s.get('tags') or [])
    gs = [g for g, t in (('m', 'masculine'), ('f', 'feminine'), ('n', 'neuter')) if tags[t]]
    return gs[0] if len(gs) == 1 else ''


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|colloquial|'
                     r'eye dialect|misspelling)\b.*\b(form|spelling) of\b')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    return g


def table_of(e):
    """The declension / conjugation rows, each {f, r, t}; a verb's regular table labelled."""
    rows, blocks = [], []
    for f in e.get('forms') or []:
        if f.get('source') not in ('declension', 'conjugation', 'inflection'):
            continue
        t = f.get('tags') or []
        if 'table-tags' in t:
            blocks.append([])
            continue
        if 'inflection-template' in t or not is_telugu(f.get('form', '')):
            continue
        r = {'f': nfc(f['form']), 'r': f.get('roman', '') or '',
             't': [x for x in t if x != 'error-unrecognized-form']}
        rows.append(r)
        if blocks:
            blocks[-1].append(r)
    if e.get('pos') == 'verb' and len(blocks) == 3 and all(len(b) == 7 for b in blocks):
        for tense, b in zip(TENSES, blocks):
            for who, r in zip(PERSON_ROWS, b):
                r['tense'], r['who'] = tense, who
    return rows


def heads_of(e):
    """The forms in the headword line -- a noun's plural, sometimes its genitive -- no roman."""
    out = []
    for f in e.get('forms') or []:
        t = f.get('tags') or []
        if f.get('source') or 'romanization' in t or 'canonical' in t or 'alternative' in t:
            continue
        if is_telugu(f.get('form', '')) and t:
            out.append({'f': nfc(f['form']), 'r': '', 't': t})
    return out


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_telugu(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas, pointers, formonly, altsp = {}, [], {}, []
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos == 'name' and w in NAME_OK:
            pass
        elif pos not in KEEP_POS or not is_telugu(w):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_telugu(tw):
                        pointers.append((fold(w), fold(tw)))
        if not real:
            # NOT A LEMMA -- kept as a pointer for the inventory only: an ALTERNATIVE
            # spelling that is the common one, or a closed-class form a beginner learns
            # as a word.  The fill never takes either (`select.py`).
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            for a in alts[:1]:
                if is_telugu(a):
                    altsp.append((fold(a), w, roman_of(e)))
            if alts and all('alt_of' in s for s in senses) and is_telugu(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0]), 'roman': roman_of(e)})
            elif pos in ('pron', 'det', 'postp'):
                gl = [{'g': clean_gloss((s.get('glosses') or [''])[-1]), 'weak': False, 'tags': []}
                      for s in senses if s.get('glosses')]
                L = formonly.setdefault(fold(w), {'word': w, 'entries': []})
                if 'entries' in L:
                    L['entries'].append({'pos': pos, 'etym': '', 'roman': roman_of(e), 'gender': '',
                                         'glosses': gl, 'table': table_of(e), 'heads': []})
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK),
                           'tags': sorted(tags & {'formal', 'informal', 'colloquial', 'figuratively',
                                                  'transitive', 'intransitive', 'idiomatic', 'slang',
                                                  'Hinduism', 'honorific', 'familiar'})})
        ent = {'pos': pos, 'etym': e.get('etymology_number', ''), 'roman': roman_of(e),
               'gender': gender_of(e), 'glosses': gl, 'table': table_of(e), 'heads': heads_of(e)}
        lemmas.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append(ent)
    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        for ent in L['entries']:
            for row in ent['table'] + ent['heads']:
                if ' ' in k and ' ' not in row['f']:
                    continue
                claims[fold(row['f'])].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    CLOSED = {'adv', 'postp', 'conj', 'particle', 'pron', 'det', 'num', 'intj'}
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
            wts = {k: freq[k] + 1 for k in sorted(who)}
            tot = sum(wts.values())
            for k in wts:
                nxt[k] += c * wts[k] / tot
        freq = nxt

    # THE SPELLING A CARD PRINTS.  Wiktionary files most Telugu nouns under the
    # classical -ము spelling (`పుస్తకము`, `సమయము`) and the spelling everyone writes,
    # -ం (`పుస్తకం`), as its "alternative form"; it files `గుర్తు` "mark" under the old
    # `గురుతు`.  Every spelling is kept with its own romanisation (`spellings`), and
    # `spell` is the one to print: the -ం alternative of the same word, else the
    # alternative the subtitles write more often than the headword.
    for tgt, w, rom in altsp:
        L = lemmas.get(tgt)
        if not L:
            continue
        sp = L.setdefault('spellings', {L['word']: next((e['roman'] for e in L['entries'] if e['roman']), '')})
        sp.setdefault(w, rom)
        cur = L.get('spell', L['word'])
        if fold(w) == tgt:
            if w.endswith('ం') and not cur.endswith('ం'):
                L['spell'] = w
        elif counts.get(fold(w), 0) > counts.get(fold(cur), 0) and fold(cur) != tgt or \
                (fold(cur) == tgt and not cur.endswith('ం') and counts.get(fold(w), 0) > counts.get(tgt, 0)):
            L['spell'] = w

    out = {}
    for k, L in formonly.items():
        if k not in lemmas:
            L['freq'] = round(freq.get(L['alt_of'], 0) if 'alt_of' in L else counts.get(k, 0), 2)
            L['own'] = counts.get(k, 0)
            L['formonly'] = True
            out[k] = L
    for k, L in lemmas.items():
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    out = dict(sorted(out.items()))
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted(out.values(), key=lambda L: -L['freq'])[:60]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
