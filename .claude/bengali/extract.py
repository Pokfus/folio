#!/usr/bin/env python3
"""Every Bengali lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-bn.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `bn_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Bengali
spreads a word over many: a noun over its cases and its definite and plural
endings (`বই` / `বইটা` / `বইগুলো` / `বইয়ের`), a verb over thirty-odd forms
(`করি`, `করছে`, `করলাম`, `করেছিল`, `করবে` ...).  A lemma's frequency here is the
sum of the counts of every form Wiktionary lists for it -- its declension or
conjugation table, plus every entry that says it is a `form of` it (`আছে` is
an entry of its own, "third-person of আছ-").

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE.  `করে` is a form of
`করা` "to do" and the locative of a noun spelt `কর`; `খেলে` is `খাওয়া`'s
conditional and `খেলা`'s third person.  Each shared form's count is divided among its
claimants in proportion to what each earns from the forms it holds alone,
plus one, over two rounds -- the Russian pipeline's rule (`.claude/torfl/`).

All matching goes through `bn.fold` (NFC, khanda ta, the joiners, কী / কি).

THE SADHU TABLES ARE SKIPPED.  Wiktionary gives many verbs a second
conjugation in sadhu bhasha, the literary register of the nineteenth century
(`করিতেছে`, `করিয়াছিল`); a learner's card is the modern colloquial (cholito)
standard, so every row after a `.../sadhu` template is left out.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name.  An entry whose every sense is a form or
an alternative spelling of another word is not a lemma, and is dropped -- its
count reaches the lemma it points to.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bn import fold, nfc, is_bengali, BENG as BENG_CH

DUMP, FREQ, OUT = 'kaikki-bn.jsonl', 'bn_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'postp'}

NAME_OK = {'বাংলা'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'Jainism', 'Buddhism', 'vulgar', 'derogatory',
        'nonstandard', 'misspelling', 'Varendra', 'Vanga', 'Rarhi', 'Kamrupi', 'Manbhumi',
        'Sylheti', 'Chittagonian'}

# a romanisation is kept only when it is ONE clean word: kaikki's parse of the noun
# tables runs the colloquial and formal cells together ("(boiṭa (colloquial), ...").
CLEAN_ROMAN = re.compile(r"^[^\s,/()]+$")


def clean_roman(r):
    r = (r or '').strip()
    return r if CLEAN_ROMAN.match(r) else ''


LEAD_RUN = re.compile(r'^([\u0980-\u09ff\u200c\u200d]+)\s*[(,]')
# a cell of the y-stem noun template on a word ENDING in য় (সময়, বিষয়) comes out as
# সময়য়ের / সময়র; the genitive is সময়ের.  A doubled য় is never Bengali spelling, and a
# য়র ending is the same template's slip, so both cells are dropped, not mended.
BAD_CELL = re.compile('\u09af\u09bc\u09af\u09bc|\u09af\u09bc\u09b0$')


def cell_form(f):
    """A table cell's spelling.  kaikki sometimes runs the slot's romanisations into
    the form ("বাড়িগুলো (baṛigula (colloquial), baṛigulo (formal))", "মনগুলো ,
    mongulo (formal))"): the Bengali before the bracket or comma is the cell."""
    s = nfc(f.get('form', '')).strip()
    m = LEAD_RUN.match(s)
    if m:
        s = m.group(1)
    return s if is_bengali(s) and ' ' not in s and not BAD_CELL.search(s) else ''


def roman_of(e):
    for f in e.get('forms') or []:
        if 'romanization' in (f.get('tags') or []):
            return f.get('form', '')
    # a few entries write the romanisation as the headword line's `canonical` form
    # (ছোট: "chōṭo (comparative আরও ছোট ...)"); kept when it is Latin, not Bengali
    for f in e.get('forms') or []:
        if 'canonical' in (f.get('tags') or []) and f.get('form') and not is_bengali(f['form']) \
                and not any(BENG_CH.match(ch) for ch in f['form']):
            return f['form']
    return ''


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|'
                     r'eye dialect|misspelling|sadhu)\b.*\b(form|spelling) of\b')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)         # stray wiki brackets: "[essential]]"
    # A POINTER SENSE MIXED INTO A REAL ENTRY ("alternative form of ...") is not a
    # meaning; where Wiktionary leaves one untagged it goes by text.
    if POINTER.match(g):
        return ''
    return g


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_bengali(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas = {}              # fold(word) -> {word, entries:[...]}
    pointers = []            # (surface fold, target fold) from form-of entries
    formonly = {}            # pointers kept for the inventory (see below)
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        # A LANGUAGE'S NAME is a proper noun in Wiktionary, and the fill never takes one;
        # `বাংলা` is kept, for the inventory, as Hindi kept `हिंदी`.
        if pos == 'name' and w in NAME_OK and e.get('etymology_number') in (None, '1'):
            pos = 'name'
        elif pos not in KEEP_POS or not is_bengali(w):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_bengali(tw):
                        pointers.append((fold(w), fold(tw), 'alt' if 'alt_of' in s else 'form'))
        if not real:
            # NOT A LEMMA -- but it is kept as a POINTER for the inventory, which
            # resolves a word through it: an ALTERNATIVE SPELLING that is the common
            # one (`নেই`, filed under `নাই`), and a FORM a beginner learns as a word
            # -- `আছে` "there is; has", Wiktionary's "third-person of আছ-", the stem
            # of a defective verb no learner meets bare.  The card prints the
            # spelling the inventory wrote, its own romanisation, and the target's
            # meanings.  The fill never takes a pointer.
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            fos = [nfc(t.get('word', '')) for s in senses for t in s.get('form_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_bengali(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0]),
                                              'roman': roman_of(e)})
            elif fos and is_bengali(fos[0]) and pos not in ('pron', 'det', 'postp'):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(fos[0]),
                                              'roman': roman_of(e)})
            elif pos in ('pron', 'det', 'postp'):
                gl = [{'g': clean_gloss((s.get('glosses') or [''])[-1]), 'weak': False, 'tags': []}
                      for s in senses if s.get('glosses')]
                L = formonly.setdefault(fold(w), {'word': w, 'entries': []})
                if 'entries' in L:
                    L['entries'].append({'pos': pos, 'roman': roman_of(e), 'gender': '',
                                         'glosses': gl, 'table': [], 'urdu': '', 'formal_alt': []})
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK),
                           'tags': sorted(tags & {'formal', 'informal', 'colloquial', 'figuratively',
                                                  'transitive', 'intransitive', 'idiomatic', 'slang',
                                                  'Hinduism', 'Islam', 'honorific', 'familiar'})})
        table, sadhu = [], False
        for f in e.get('forms') or []:
            tg = f.get('tags') or []
            if 'inflection-template' in tg:
                sadhu = 'sadhu' in f.get('form', '')
                continue
            if sadhu or 'table-tags' in tg:
                continue
            if f.get('source') in ('declension', 'conjugation', 'inflection'):
                cf = cell_form(f)
                if cf:
                    table.append({'f': cf, 'r': clean_roman(f.get('roman')) if cf == nfc(f['form']) else '',
                                  't': tg})
            # a pronoun's case forms are in its HEADWORD line, not a table (তোমাকে, তোমার)
            elif not f.get('source') and pos in ('pron', 'det') and cell_form(f) \
                    and set(tg) & {'objective', 'possessive', 'genitive', 'locative'}:
                table.append({'f': nfc(f['form']), 'r': clean_roman(f.get('roman')),
                              't': ['genitive' if t == 'possessive' else t for t in tg]})
        ent = {'pos': pos, 'etym': e.get('etymology_number', ''), 'roman': roman_of(e), 'gender': '', 'glosses': gl,
               'table': table,
               'urdu': next((f['form'] for f in e.get('forms') or [] if 'Urdu' in (f.get('tags') or [])), ''),
               'formal_alt': [nfc(f['form']) for f in e.get('forms') or []
                              if 'alternative' in (f.get('tags') or []) and is_bengali(f.get('form', ''))]}
        lemmas.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append(ent)
    for k, L in lemmas.items():
        # a MULTI-WORD lemma (জন্য দেওয়া, কথা বলা) is not in a list of single words; it is
        # dealt by its rarest word's count, halved, so it sits near its words.
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    # which lemmas claim which surface
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        for ent in L['entries']:
            for row in ent['table']:
                t = set(row['t'])
                # a multi-word lemma's table does not claim a single word
                if ' ' in k and ' ' not in row['f']:
                    continue
                claims[fold(row['f'])].add(k)
    for surf, tgt, kind in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    # A SURFACE THAT IS AN INDECLINABLE WORD'S OWN SPELLING IS THAT WORD'S -- the
    # Hindi pipeline's rule, found there by reading the ranking (`.claude/hindi/extract.py`):
    # an adverb or a postposition has no other form to earn a weight from, so split
    # proportionally it loses its own spelling to any noun or verb whose form it is.
    # Only for a closed-class or adverb entry, or an adjective with no table.
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
    top = sorted((L for L in out.values() if not L.get('formonly')), key=lambda L: -L['freq'])[:40]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
