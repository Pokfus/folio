#!/usr/bin/env python3
"""Every Persian lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-fa.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `fa_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Persian
spreads a verb over dozens (`رفتم`, `رفت`, `میرفت`, `رفته` ... for `رفتن`) and
a noun over its plural and its possessives (`کتابم`, `کتابها`).  A lemma's
frequency here is the sum of the counts of every form Wiktionary lists for it
-- its conjugation or inflection table, its plurals, its SPOKEN forms, plus
every entry that says it is a `form of` it.

THE SPOKEN FORMS ARE COUNTED FOR THE WRITTEN WORD, and for Persian that is not
a detail.  The subtitles are spoken Tehrani Persian: they write `خونه` for
`خانه` "house", `یه` for `یک` "one", `اون` for `آن` "that", `رو` for `را`.
Wiktionary lists each as an `alternative`, `colloquial` form of the written
word, or as an entry "Spoken form of X", so both become claims of X; a card
teaches the written word and shows the spoken one beside it.

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- in proportion to
what each earns from the forms it holds alone, plus one, over two rounds (the
Russian pipeline's rule, `.claude/torfl/`, as Hindi has it).  A closed-class
word's or an adverb's own spelling is its own (Hindi's rule 1): `رو` is both
the spoken `را` and the present stem of `رفتن`; `که` "that" is never split.

All matching goes through `fa.fold` (Arabic ي ك, the short-vowel marks and
the joiner ignored), since the subtitles write `اين` where Wiktionary writes
`این`.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name (but `فارسی` and `ایران`, NAME_OK).  An
entry whose every sense is a form or an alternative spelling of another word
is not a lemma, and is dropped -- its count reaches the lemma it points to.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fa import fold, nfc, is_persian, zwnj

DUMP, FREQ, OUT = 'kaikki-fa.jsonl', 'fa_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'postp'}

NAME_OK = {'فارسی', 'ایران', 'نوروز'}   # نوروز: B1's festivals (2026-11-12)

# THE MONTHS (A2, 2026-11-12).  Wiktionary files the twelve solar months as proper
# names, beside other `name` entries of the same spelling that gloss them as
# Gregorian months (فروردین "January") -- wrong for Iran, where Farvardin begins on
# 21 March.  Only the sense "X (the Nth solar month of the Persian calendar)" is
# kept, as a noun; every other `name` entry of the word stays out.
MONTH = re.compile(r'^\S+ \(the \w+ solar month of the Persian calendar\)$')

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'literary', 'Classical-Persian', 'Dari', 'Tajik', 'Afghanistan', 'Early-New-Persian',
        'Shiraz', 'Kabuli', 'Hazaragi'}

# ROMANISATION.  Wiktionary gives Classical and Iranian readings side by side
# (`kitāb` / `ketâb`); the Iranian one, with â for the long a, is the one these
# decks teach, as the speaker does (`fa-IR`), and it is listed LAST.
MACRON = str.maketrans({'ā': 'â', 'ī': 'i', 'ū': 'u', 'ē': 'i', 'ō': 'u', 'ê': 'i'})


HEAD_ROMAN = re.compile(r'• \(((?:[^()]|\([^()]*\))*)\)')


def roman_of(e):
    rs = [f.get('form', '') for f in e.get('forms') or [] if 'romanization' in (f.get('tags') or [])]
    rs = [r.split(' /')[0].strip() for r in rs if r and r not in ('-',)]
    if not rs:
        # no romanisation of the word itself (هفته): its plural's, less the plural ending
        for f in e.get('forms') or []:
            if set(f.get('tags') or []) == {'plural'} and (f.get('roman') or '').endswith('-hâ'):
                return f['roman'].split(' / ')[-1][:-3]
        # nor a plural's: the headword line's own reading (B1, 2026-11-12), which the
        # extraction does not tag -- `گرد • (gird / gerd)`, `تله • (tale or talle)`,
        # `پیرمرد • (pir(e)-mard)`: the Iranian one (after the slash), the first of
        # several, its long vowels the Iranian way
        for h in e.get('head_templates') or []:
            m = HEAD_ROMAN.search(h.get('expansion') or '')
            if m:
                r = m.group(1).split('/')[-1].split(' or ')[0].split(', ')[0].strip()
                if r and not is_persian(r):
                    return r.translate(MACRON)
        return ''
    # Only a Classical reading given (īn for این): its long vowels written the Iranian way,
    # which for the long vowels is exact (ī -> i, ū -> u, ē -> i, ō -> u, ā -> â).
    return rs[-1].translate(MACRON)


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|spoken|colloquial|'
                     r'eye dialect|misspelling|dialectal|unhamzated)\b.*\b(form|spelling) of\b', re.I)


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    return g


# A TABLE CELL is either one form (`رفتم`, roman `ráftam`) or the written and the
# spoken form together, the romanisations in brackets: `خانهها، خانها (xâne-hấ,
# xâneấ^△)`.  The first is the written form; a variant marked ^△ is spoken.


def cells(f):
    form, roman = f.get('form', ''), f.get('roman', '') or ''
    i = form.find(' (')
    if i > 0 and form.endswith(')') and not roman:
        # split at the FIRST bracket: a romanisation may hold one of its own, xâné-(y)emân
        fs = [x.strip() for x in form[:i].split('،')]
        rs = [x.strip() for x in form[i + 2:-1].split(',')]
    else:
        fs = [x.strip() for x in form.split('،')]
        rs = [roman] + [''] * (len(fs) - 1)
    out = []
    for i, x in enumerate(fs):
        x = x.replace('^△', '').strip()
        r = rs[i] if i < len(rs) else ''
        spoken = '^△' in r or '^△' in fs[i]
        r = r.replace('^△', '').strip()
        if x and is_persian(x):
            out.append((nfc(x), r, spoken))
    return out


def bare(s):
    """Without the short-vowel marks Wiktionary writes on some head forms (بِهْتَر)."""
    return re.sub('[\u064B-\u0652]', '', s)


def suffix_zwnj(form, w):
    """خوبتر -> خوب‌تر: the comparative's -تر and -ترین stand apart from the word."""
    if form.startswith(w) and form[len(w):] in ('تر', 'ترین'):
        return w + '\u200c' + form[len(w):]
    return form


def plurals(e, head, w):
    """Every plural Wiktionary gives: the head line's `pl`, `pl2` ... (with their `pltr`) and the
    tagged plural forms -- `کتب` (the Arabic plural) and `کتابها` both, for `کتاب`."""
    out, seen = [], set()
    def add(f, r):
        f = zwnj(bare(nfc(f)), r or '-h', w)
        # a suffix after a final silent ه always stands apart: میوه‌جات, not میوهجات
        if w.endswith('ه') and f.startswith(w) and len(f) > len(w) and f[len(w)] != '\u200c':
            f = w + '\u200c' + f[len(w):]
        if f and is_persian(f) and f not in seen:
            seen.add(f)
            out.append({'f': f, 'r': (r or '').split(' / ')[-1].replace('kitāb', 'ketâb')})
    for f in head:
        if set(f.get('tags') or []) == {'plural'}:
            add(f.get('form', ''), f.get('roman', ''))
    for h in e.get('head_templates') or []:
        a = h.get('args') or {}
        for k in ('pl', 'pl2', 'pl3'):
            if a.get(k):
                add(a[k], a.get(k + 'tr', '') if k != 'pl' else a.get('pltr', ''))
    return out


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_persian(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas, pointers, formonly = {}, [], {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        month = pos == 'name' and any(MONTH.match((x.get('glosses') or [''])[-1])
                                      for x in e.get('senses') or [])
        if month:
            pos = 'noun'
            e = dict(e, senses=[x for x in e['senses'] if MONTH.match((x.get('glosses') or [''])[-1])])
        elif pos == 'name' and w in NAME_OK:
            pass
        elif pos not in KEEP_POS or not is_persian(w):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_persian(tw):
                        pointers.append((fold(w), fold(tw)))
        if not real:
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_persian(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0])})
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK),
                           'tags': sorted(tags & {'formal', 'informal', 'colloquial', 'figuratively',
                                                  'transitive', 'intransitive', 'idiomatic', 'slang',
                                                  'Islam', 'honorific', 'familiar', 'Iran'})})
        table, spoken = [], []
        for f in e.get('forms') or []:
            if f.get('source') in ('declension', 'conjugation', 'inflection'):
                for x, r, sp in cells(f):
                    if sp:
                        spoken.append({'f': x, 'r': r, 't': f.get('tags') or []})
                    else:
                        table.append({'f': zwnj(x, r, w), 'r': r, 't': f.get('tags') or []})
        tags_of = lambda f: set(f.get('tags') or [])
        head = [f for f in e.get('forms') or [] if not f.get('source')]
        ent = {
            'pos': pos, 'etym': e.get('etymology_number') or '', 'roman': roman_of(e),
            'glosses': gl, 'table': table, 'spoken_cells': spoken,
            'plural': plurals(e, head, w),
            'stems': [{'f': nfc(f['form']), 'r': f.get('roman', ''),
                       't': 'present' if 'present' in tags_of(f) else 'past'}
                      for f in head if {'stem'} <= tags_of(f) and is_persian(f.get('form', ''))],
            'compar': [{'f': suffix_zwnj(bare(nfc(f['form'])), w), 'r': (f.get('roman') or '').split(' / ')[-1],
                        't': 'comparative' if 'comparative' in tags_of(f) else 'superlative'}
                       for f in head if tags_of(f) & {'comparative', 'superlative'}
                       and is_persian(f.get('form', ''))],
            # the SPOKEN form of the word itself (خونه for خانه), Tehrani colloquial
            'colloq': [{'f': nfc(f['form']), 'r': f.get('roman', '')} for f in head
                       if 'alternative' in tags_of(f) and 'colloquial' in tags_of(f)
                       and tags_of(f) & {'Tehrani', 'Tehran', 'Iran'}
                       and is_persian(f.get('form', '')) and '\u0640' not in f['form']],
        }
        lemmas.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append(ent)
    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        for ent in L['entries']:
            rows = ent['table'] + ent['spoken_cells'] + ent['plural'] + ent['colloq']
            for row in rows:
                if 'stem' in row.get('t', []) or 'participle' in row.get('t', []):
                    continue          # a bare stem (رو, رفت) is not a word on its own; `رو` is spoken را
                if ' ' in row['f'] and ' ' not in k:
                    continue          # a periphrastic form (دارم میروم, رفته بودم) is two tokens
                if ' ' in k and ' ' not in row['f']:
                    continue
                claims[fold(row['f'])].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    for k, L in formonly.items():
        if L['alt_of'] in lemmas and k not in lemmas:
            claims[k].add(L['alt_of'])
    CLOSED = {'adv', 'prep', 'postp', 'conj', 'particle', 'pron', 'det', 'num', 'intj'}
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

    out = {}
    for k, L in formonly.items():
        if k not in lemmas:
            L['freq'] = round(freq.get(L['alt_of'], 0), 2)
            L['own'] = counts.get(k, 0)
            L['formonly'] = True
            out[k] = L
    for k, L in lemmas.items():
        for ent in L['entries']:
            ent.pop('spoken_cells', None)
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted(out.values(), key=lambda L: -L['freq'])[:60]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
