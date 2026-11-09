#!/usr/bin/env python3
"""Every Urdu lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-ur.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and two frequency lists, and writes `lex.json`.
Level-independent: built once and kept.

TWO FREQUENCY LISTS, AVERAGED.  The only subtitle list for Urdu
(hermitdave/FrequencyWords, OpenSubtitles 2018, `ur_full.txt`) is small --
9,592 forms over about 200,000 words of text -- so on its own it ranks the
middle of a level by noise.  It is averaged, per million words, with the
wordfreq project's Urdu list (`ur_wordfreq.txt`, CC BY-SA 4.0: Wikipedia, web
text and Twitter, 23,201 forms), which is written Urdu and much larger.  The
one is speech and the other writing; a word a learner needs scores in both.

WHY A LEMMA FREQUENCY.  Both lists count WORD FORMS, and Urdu spreads a word
over several: `لڑکا` / `لڑکے` / `لڑکوں`, and a verb over a dozen (`کھاتا`,
`کھاتی`, `کھایا`, `کھاؤں گا` ...).  A lemma's frequency here is the sum of the
counts of every form Wiktionary lists for it -- its declension or conjugation
table, plus every entry that says it is a `form of` it.

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- the Russian and
Hindi pipelines' rule; see `.claude/hindi/extract.py` for the three rules found
by reading Hindi's ranking, which hold here word for word (the grammar is one).

All matching goes through `ur.fold` (vowel marks dropped, the Arabic yeh, kaf
and heh written as Urdu's), since the dictionary's tables carry the marks
(`کِتَابیں`) and running text does not.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name.  An entry whose every sense is a form or
an alternative spelling of another word is not a lemma, and is dropped -- its
count reaches the lemma it points to.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ur import fold, nfc, is_urdu

DUMP, OUT = 'kaikki-ur.jsonl', 'lex.json'
FREQS = ('ur_full.txt', 'ur_wordfreq.txt')

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'postp'}

NAME_OK = {'اردو', 'بدھ'}     # the language; Wednesday (Wiktionary files the day as a proper noun)

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory',
        'nonstandard', 'misspelling'}


def roman_of(e):
    for f in e.get('forms') or []:
        if 'romanization' in (f.get('tags') or []):
            return f.get('form', '')
    return ''


def gender_of(e):
    for h in e.get('head_templates') or []:
        g = (h.get('args') or {}).get('1', '')
        if g in ('m', 'f', 'm-p', 'f-p', 'mf', 'm-f'):
            return {'m': 'm', 'f': 'f', 'm-p': 'm', 'f-p': 'f'}.get(g, 'mf')
    tags = collections.Counter(t for s in e.get('senses') or [] for t in s.get('tags') or [])
    if tags['masculine'] and tags['feminine']:
        return 'mf'
    if tags['masculine']:
        return 'm'
    if tags['feminine']:
        return 'f'
    return ''


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|'
                     r'eye dialect|misspelling)\b.*\b(form|spelling) of\b')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)         # stray wiki brackets: "[essential]]"
    # A POINTER SENSE MIXED INTO A REAL ENTRY ("alternative spelling of ...") is not a
    # meaning; Wiktionary leaves some untagged, so it goes by text (Hindi's finding).
    if POINTER.match(g):
        return ''
    return g


def main():
    # each list per million of its own words, then the two averaged (see above)
    counts = collections.Counter()
    for name in FREQS:
        one = collections.Counter()
        for line in open(name, encoding='utf-8'):
            p = line.rstrip('\n').split()
            if len(p) == 2 and is_urdu(p[0]):
                one[fold(p[0])] += float(p[1])
        tot = sum(one.values()) or 1
        for k, v in one.items():
            counts[k] += v * 1e6 / tot / len(FREQS)

    lemmas = {}              # fold(word) -> {word, entries:[...]}
    pointers = []            # (surface fold, target fold) from form-of entries
    formonly = {}            # pointers kept for the inventory (see below)
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        # A LANGUAGE'S NAME is a proper noun in Wiktionary, and the fill never takes one;
        # an A1 card for `اردو` means the language, and `بدھ` Wednesday is a name too.
        if pos == 'name' and w in NAME_OK and e.get('etymology_number') in (None, '1'):
            pos = 'name'
        elif pos not in KEEP_POS or not is_urdu(w):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_urdu(tw):
                        pointers.append((fold(w), fold(tw), 'alt' if 'alt_of' in s else 'form'))
        if not real:
            # NOT A LEMMA -- but two kinds are kept as pointers for the inventory:
            # a closed-class FORM a beginner learns as a word (a possessive such as
            # "genitive of میں; my, mine"), and an ALTERNATIVE SPELLING that is the
            # common one.  The fill never takes
            # either; `select.py` resolves an inventory word through them.
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_urdu(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0])})
            elif pos in ('pron', 'det', 'postp'):
                gl = [{'g': clean_gloss((s.get('glosses') or [''])[-1]), 'weak': False, 'tags': []}
                      for s in senses if s.get('glosses')]
                L = formonly.setdefault(fold(w), {'word': w, 'entries': []})
                if 'entries' in L:
                    L['entries'].append({'pos': pos, 'roman': roman_of(e), 'gender': '',
                                         'glosses': gl, 'table': [], 'hindi': ''})
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
        table = []
        for f in e.get('forms') or []:
            # a cell with NO tags is a table's header (the pronoun `میں` heading a column), not a form
            if f.get('source') in ('declension', 'conjugation', 'inflection') and f.get('tags') \
                    and is_urdu(f.get('form', '')):
                table.append({'f': nfc(f['form']), 'r': f.get('roman', ''), 't': f.get('tags') or []})
        ent = {'pos': pos, 'etym': e.get('etymology_number', ''), 'roman': roman_of(e), 'gender': gender_of(e), 'glosses': gl,
               'table': table,
               'hindi': next((f['form'] for f in e.get('forms') or [] if 'Hindi' in (f.get('tags') or [])), '')}
        lemmas.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append(ent)
    for k, L in lemmas.items():
        # a MULTI-WORD lemma (کے لیے, کے ساتھ) is not in a list of single words; it is
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
                # A VERB'S FEMININE INFINITIVE CLAIMS NOTHING: `پانی` "water" is also the
                # feminine infinitive of `پانا` "to get" (Hindi's finding, the same word);
                # the agentive and adjectival cells likewise.
                if 'infinitive' in t and t & {'feminine'}:
                    continue
                if t & {'agentive', 'adjectival'}:
                    continue
                # a multi-word lemma's table does not claim a single word
                if ' ' in k and ' ' not in row['f']:
                    continue
                claims[fold(row['f'])].add(k)
    for surf, tgt, kind in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    # A SURFACE THAT IS AN INDECLINABLE WORD'S OWN SPELLING IS THAT WORD'S, for a
    # closed-class or adverb entry or an indeclinable adjective -- Hindi's rule (1),
    # with its reasons, in `.claude/hindi/extract.py`.
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
    top = sorted(out.values(), key=lambda L: -L['freq'])[:40]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
