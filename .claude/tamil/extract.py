#!/usr/bin/env python3
"""Every Tamil lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-ta.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `ta_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Tamil, being
agglutinative, spreads a word over very many: a noun over its cases (`வீடு`,
`வீட்டை`, `வீட்டுக்கு`, `வீட்டில்` ...), a verb over persons, tenses and
participles (`போகிறேன்`, `போனான்`, `போக`, `போய்` ...).  A lemma's frequency
here is the sum of the counts of every form Wiktionary's table lists for it,
plus every entry that says it is a `form of` it.  A token carrying a SANDHI
consonant (`வீட்டுக்குப்`) is counted for the form without it (`ta.bare`).

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- divided among its
claimants in proportion to what each earns from the forms it holds alone, plus
one, over two rounds: the Russian pipeline's rule, as Hindi's.  And, as in
Hindi, AN INDECLINABLE WORD'S OWN SPELLING IS ITS OWN (see below).

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name.  An entry whose every sense is a form or an
alternative spelling of another word is not a lemma, and is dropped -- its count
reaches the lemma it points to -- except the closed-class forms the inventory
needs as words (`என்` "my"), kept as pointers.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ta import fold, nfc, is_tamil, bare

DUMP, FREQ, OUT = 'kaikki-ta.jsonl', 'ta_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'postp'}

# A LANGUAGE'S OR A COUNTRY'S NAME is a proper noun in Wiktionary, and the fill never
# takes one; these three are A1 words (Hindi's `NAME_OK`).
NAME_OK = {'தமிழ்', 'ஆங்கிலம்', 'இந்தியா'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'Jainism', 'Buddhism', 'vulgar', 'derogatory',
        'nonstandard', 'misspelling', 'literary', 'Sri-Lanka', 'euphemistic'}


def roman_of(e):
    for f in e.get('forms') or []:
        if 'romanization' in (f.get('tags') or []):
            return f.get('form', '')
    return ''


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|colloquial|'
                     r'eye dialect|misspelling)\b.*\b(form|spelling) of\b', re.I)


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)         # stray wiki brackets
    if POINTER.match(g):
        return ''
    return g


def main():
    raw = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_tamil(p[0]):
            k = fold(p[0])
            raw[k] = raw.get(k, 0) + int(p[1])

    lemmas = {}              # fold(word) -> {word, entries:[...]}
    pointers = []            # (surface fold, target fold, kind) from form-of entries
    formonly = {}            # pointers kept for the inventory
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos == 'name' and w in NAME_OK:
            pass
        elif pos not in KEEP_POS or not is_tamil(w):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')
                and clean_gloss((s.get('glosses') or [''])[-1])]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_tamil(tw):
                        pointers.append((fold(w), fold(tw), 'alt' if 'alt_of' in s else 'form'))
        if not real:
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_tamil(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0]), 'roman': roman_of(e)})
            elif pos in ('pron', 'det', 'postp'):
                gl = [{'g': clean_gloss((s.get('glosses') or [''])[-1]), 'weak': False, 'tags': []}
                      for s in senses if s.get('glosses')]
                L = formonly.setdefault(fold(w), {'word': w, 'entries': []})
                if 'entries' in L:
                    L['entries'].append({'pos': pos, 'etym': '', 'roman': roman_of(e),
                                         'glosses': gl, 'table': [], 'cls': ''})
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK),
                           'tags': sorted(tags & {'formal', 'informal', 'colloquial', 'figuratively',
                                                  'transitive', 'intransitive', 'idiomatic', 'slang',
                                                  'honorific', 'familiar', 'auxiliary'})})
        table, cls = [], ''
        for f in e.get('forms') or []:
            if 'class' in (f.get('tags') or []):
                cls = f.get('form', '')
            if f.get('source') in ('declension', 'conjugation', 'inflection') \
                    and is_tamil(f.get('form', '')):
                table.append({'f': nfc(f['form']), 'r': f.get('roman', '') or '', 't': f.get('tags') or []})
        ent = {'pos': pos, 'etym': e.get('etymology_number') or '', 'roman': roman_of(e),
               'glosses': gl, 'table': table, 'cls': cls}
        lemmas.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append(ent)

    # every surface a table or a pointer names
    known = set(lemmas) | set(formonly) | {s for s, _, _ in pointers}
    for L in lemmas.values():
        for ent in L['entries']:
            known.update(fold(r['f']) for r in ent['table'])
    counts = collections.Counter()
    for k, c in raw.items():
        counts[k if k in known or bare(k) not in known else bare(k)] += c

    for k, L in lemmas.items():
        # a MULTI-WORD lemma is dealt by its rarest word's count, halved
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        for ent in L['entries']:
            for row in ent['table']:
                if ' ' in row['f'] and ' ' not in k:
                    continue          # a periphrastic cell (போகாமல் இருக்க) claims no single word
                if ' ' in k and ' ' not in row['f']:
                    continue
                claims[fold(row['f'])].add(k)
    for surf, tgt, kind in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    # AN INDECLINABLE WORD'S OWN SPELLING IS ITS OWN (Hindi's rule 1): an adverb, a
    # postposition, a pronoun's citation form or an adjective with no table has no
    # other form to earn a weight from, and split proportionally it loses its own
    # spelling to any verb or noun whose form it happens to be.
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
            wts = {k: freq[k] + 1 for k in who}
            tot = sum(wts.values())
            for k in who:
                nxt[k] += c * wts[k] / tot
        freq = nxt

    out = {}
    for k, L in formonly.items():
        if k not in lemmas:
            L['freq'] = round(freq.get(L.get('alt_of', k), 0) if 'alt_of' in L else counts.get(k, 0), 2)
            L['own'] = counts.get(k, 0)
            L['formonly'] = True
            out[k] = L
    for k, L in lemmas.items():
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted(out.values(), key=lambda L: -L['freq'])[:60]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
