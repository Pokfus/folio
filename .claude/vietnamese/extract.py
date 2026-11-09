#!/usr/bin/env python3
"""Every Vietnamese word in Wiktionary, compacted, with a WORD frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-vi.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `vi.txt.gz` (the OpenSubtitles 2018 Vietnamese monolingual
text from OPUS, the corpus hermitdave/FrequencyWords counts) and writes
`lex.json`.  Level-independent: built once and kept.

WHY NOT THE READY-MADE FREQUENCY LIST.  Vietnamese writes a space between
SYLLABLES, not between words: `học sinh` "pupil", `bác sĩ` "doctor", `cảm ơn`
"thank you" are each one word of two tokens.  hermitdave's `vi_full.txt` counts
tokens, so it holds `học` and `sinh` and never `học sinh` -- a list of
syllables, which is not what a vocabulary deck is dealt by.  So the subtitles
are SEGMENTED here, by the textbook baseline for Vietnamese: greedy longest
match, left to right, against every headword Wiktionary has (up to four
syllables), a syllable that begins no headword standing alone.  It is a
heuristic and it errs (`học sinh viên` reads `học sinh` + `viên`), but it errs
rarely on common words, and a frequency only has to ORDER a list.  The counts
are cached in `seg-counts.json` (a few minutes to build).

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches, written
in the Latin alphabet; never a letter, an affix, a Hán character or a proper
name (names still take part in the segmentation, so `Việt Nam` does not count
as `việt` + `nam`).  An entry whose every sense is an alternative form of
another word is not a lemma; it is kept as a POINTER, so an inventory word in
the commoner spelling (`cảm ơn`, filed under `cám ơn`) still resolves.
"""
import collections, gzip, json, os, re, sys
from functools import lru_cache

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vi import fold_syl, nfc, is_viet, WORD

DUMP, CORPUS, SEG, OUT = 'kaikki-vi.jsonl', 'vi.txt.gz', 'seg-counts.json', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'classifier'}
MAXN = 4
NONASCII = re.compile(r'[^\x00-\x7f]')

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'uncommon', 'historical',
        'literary', 'in-compounds', 'morpheme', 'Central', 'Hà-Tĩnh', 'Nghệ-An', 'vulgar',
        'derogatory', 'offensive', 'misspelling', 'proscribed', 'Internet', 'neologism',
        'pronunciation-spelling', 'Marxism', 'Chinese', 'no-gloss', 'nonstandard',
        'slang'}     # slang: `chuối` "banana; penis", `súng` "gun; penis", `tím` "purple; gay"

SHOW = {'Northern', 'Southern', 'colloquial', 'formal', 'informal', 'familiar', 'polite',
        'honorific', 'slang', 'figuratively', 'idiomatic', 'humorous'}

POINTER = re.compile(r'^(traditional tone placement|variant|alternative|obsolete|archaic|dated|rare|nonstandard|nôm|'
                     r'eye dialect|misspelling|reduplicant|clipping|initialism|abbreviation)\b'
                     r'.*\b(form|spelling|of)\b', re.I)
SYNONYM = re.compile(r'^synonym of ([^(“]+?)\s*(?:\(“([^”]+)”\))?\s*$')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    # "synonym of uống (“to drink”)" is a meaning by reference; the card wants the
    # meaning itself, and a synonym with no gloss given is left out
    # (an unglossed one is resolved to its target's first meaning, after the read)
    m = SYNONYM.match(g)
    if m:
        return m.group(2) or ('=' + m.group(1).strip())
    if g.lower().startswith('synonym of'):
        return ''
    return g


def is_altof(s):
    t = s.get('tags') or []
    return 'alt_of' in s or 'form_of' in s or 'alt-of' in t or 'form-of' in t


def sounds(e):
    hn = sg = ''
    for s in e.get('sounds') or []:
        ipa = s.get('ipa')
        if not ipa:
            continue
        tags = s.get('tags') or []
        if not hn and ('Hà-Nội' in tags or 'Hanoi' in tags):
            hn = ipa
        if not sg and s.get('note') == 'Saigon':
            sg = ipa
    return hn, sg


SINO = re.compile(r'Sino-Vietnamese word from ([㐀-鿿豈-﫿\U00020000-\U0002ffff]+)')


def segment_counts(keys):
    """Greedy longest-match over the subtitles: folded word -> count."""
    first = collections.defaultdict(set)      # first folded syllable -> lengths
    for k in keys:
        n = k.count(' ') + 1
        if 1 < n <= MAXN:
            first[k.split(' ', 1)[0]].add(n)
    fs = lru_cache(maxsize=None)(fold_syl)
    counts = collections.Counter()
    lines = skipped = 0
    with gzip.open(CORPUS, 'rt', encoding='utf-8', errors='replace') as fh:
        for line in fh:
            lines += 1
            # SOME SUBTITLE FILES ARE DECOMPOSED (a vowel, then its marks as separate
            # code points): read raw, `có` splits at the accent into `co`, and on the
            # first count `co`, `u`, `y`, `a`, `ca` were top-500 "words".
            line = nfc(line)
            # SUBTITLES TYPED WITHOUT TONE MARKS, and English lines, are not counted:
            # on a count they put `la`, `the` and the like among the commonest words.
            # A line of four or more syllables with no letter outside ASCII is one of
            # them (real Vietnamese that long almost never lacks every mark); a shorter
            # line is kept, since `Ai?` or `Anh ta` is ordinary Vietnamese.
            if not NONASCII.search(line) and len(WORD.findall(line)) >= 4:
                skipped += 1
                continue
            # a phrase boundary ends a word: segment each run between punctuation
            for chunk in re.split(r'[.,!?;:"“”()\[\]…\-–—]+', line):
                syl = [fs(t) for t in WORD.findall(chunk)]
                i, n = 0, len(syl)
                while i < n:
                    take = 1
                    for L in sorted(first.get(syl[i], ()), reverse=True):
                        if i + L <= n and ' '.join(syl[i:i + L]) in keys:
                            take = L
                            break
                    counts[' '.join(syl[i:i + take])] += 1
                    i += take
    print(f'  skipped {skipped} unaccented lines')
    print(f'  segmented {lines} subtitle lines into {sum(counts.values())} words')
    return counts


def main():
    lemmas, pointers, segkeys = {}, {}, set()
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if not is_viet(w):
            continue
        k = ' '.join(fold_syl(x) for x in WORD.findall(w))
        if k.count(' ') < MAXN and (pos in KEEP_POS or pos == 'name'):
            segkeys.add(k)
        if pos not in KEEP_POS or w[:1].isupper():
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_altof(s) and s.get('glosses')]
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                # a LETTER'S NAME is a sense of many short words (`chờ` "the letter Ch",
                # `ư`) and never the meaning a learner wants first
                weak = bool(tags & WEAK) or g.startswith('The name of the Latin script letter')
                gl.append({'g': g, 'weak': weak, 'tags': sorted(tags & SHOW)})
        if not gl:
            alts = [nfc(t.get('word', '')) for s in senses for t in (s.get('alt_of') or []) + (s.get('form_of') or [])]
            alts = [a for a in alts if is_viet(a)]
            if alts:
                pointers.setdefault(k, {'word': w, 'alt_of': ' '.join(fold_syl(x) for x in WORD.findall(alts[0]))})
            continue
        hn, sg = sounds(e)
        # THE CHARACTERS ONLY WHEN THEY ARE THE WHOLE WORD, one per syllable: "from
        # 不 (“not”) + 據" would otherwise give `bất cứ` the single character 不
        m = SINO.search(e.get('etymology_text') or '')
        if m and len(m.group(1)) != len(WORD.findall(w)):
            m = None
        ent = {'pos': pos, 'etym': str(e.get('etymology_number') or ''), 'glosses': gl,
               'cls': [nfc(f['form']) for f in e.get('forms') or []
                       if 'classifier' in (f.get('tags') or []) and is_viet(f.get('form', ''))],
               'sino': m.group(1) if m else '', 'hn': hn, 'sg': sg}
        lemmas.setdefault(k, {'word': w, 'entries': []})['entries'].append(ent)

    # "synonym of cuốn" with no gloss of its own (quyển, the classifier for books)
    # takes the first meaning of the word it names, in the same part of speech
    # where it has one; a target with none is dropped
    for L in lemmas.values():
        for ent in L['entries']:
            keep = []
            for g in ent['glosses']:
                if g['g'].startswith('='):
                    tk = ' '.join(fold_syl(x) for x in WORD.findall(g['g'][1:]))
                    T = lemmas.get(tk, {'entries': []})['entries']
                    T = [t for t in T if t['pos'] == ent['pos']] or T
                    tg = [x['g'] for t in T for x in t['glosses'] if not x['weak'] and not x['g'].startswith('=')]
                    if not tg:
                        continue
                    g = dict(g, g=tg[0])
                keep.append(g)
            ent['glosses'] = keep
        L['entries'] = [e for e in L['entries'] if e['glosses']]

    if os.path.exists(SEG):
        counts = json.load(open(SEG, encoding='utf-8'))
    else:
        counts = segment_counts(segkeys)
        json.dump(counts, open(SEG, 'w', encoding='utf-8'), ensure_ascii=False)

    out = {}
    for k, L in pointers.items():
        if k not in lemmas:
            L['freq'] = counts.get(k, 0)
            L['formonly'] = True
            out[k] = L
    for k, L in lemmas.items():
        if not L['entries']:
            continue
        L['freq'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted((L for L in out.values() if 'entries' in L), key=lambda L: -L['freq'])[:60]
    print(f'  {sum(1 for L in out.values() if "entries" in L)} words, {sum(1 for L in out.values() if "alt_of" in L)} pointers; commonest:',
          ' | '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
