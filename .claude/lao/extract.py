#!/usr/bin/env python3
"""Every Lao word in Wiktionary, compacted, with a frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-lo.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `lowiki-pages-articles.xml.bz2` (the Lao Wikipedia dump,
CC BY-SA 4.0), and writes `freq.json` and `lex.json`.  Level-independent:
built once and kept.

THE FREQUENCY IS LAO WIKIPEDIA'S, COUNTED HERE.  No ready word-frequency list
of Lao was found under a licence that could be stated: hermitdave/
FrequencyWords has none (a subtitle list counts space-separated tokens, and
Lao writes none between words), PyThaiNLP's corpora are Thai, and the Leipzig
Corpora Collection's Lao download is reachable but its terms page sits behind
a bot challenge, so its licence could not be read.  So every Lao run of the
Wikipedia dump's article text is cut into words (`lo.Segmenter`, maximal
matching against every Wiktionary headword) and each headword's count is its
number of cuts, per million.  Only counts are kept; no text ships.  Wikipedia
is written, encyclopedic Lao -- "province", "district", "government" rank high
and ສະບາຍດີ "hello" low -- which is why the inventory's first-day words are
dealt first (`select.LEAD_TOPICS`).

WHAT IS KEPT, as for Thai: entries of a part of speech a vocabulary deck
teaches (classifiers included); never a letter or an affix.  Proper nouns are
kept but marked (the inventory asks for one with `:name`; the fill never takes
a word that is only a name).  An entry whose every sense is a form or an
alternative spelling of another word is kept as a POINTER.

WHAT AN ENTRY CARRIES: the romanisation `lo.romanise` reads off the Vientiane
IPA, the IPA itself, the classifiers a noun takes, its glosses, and
Wiktionary's own usage examples (Lao, romanised, translated).
"""
import bz2, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lo import fold, nfc, is_lao, romanise, Segmenter, RUN

DUMP, WIKI, OUT = 'kaikki-lo.jsonl', 'lowiki-pages-articles.xml.bz2', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'classifier', 'name'}

WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'slang', 'childish', 'morpheme', 'Buddhism', 'Hinduism', 'royal', 'ecclesiastical'}
TAGS = {'formal', 'informal', 'colloquial', 'figuratively', 'transitive', 'intransitive',
        'idiomatic', 'polite', 'humble', 'male', 'female', 'familiar'}


def vientiane(e):
    for s in e.get('sounds') or []:
        if s.get('note') == 'Vientiane' and s.get('ipa'):
            return s['ipa']
    for s in e.get('sounds') or []:
        if s.get('ipa'):
            return s['ipa']
    return ''


def classifiers(e):
    return [nfc(f['form']) for f in e.get('forms') or []
            if 'classifier' in (f.get('tags') or []) and is_lao(f.get('form', ''))]


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|eye dialect|'
                     r'misspelling|abbreviation)\b.*\b(form|spelling|of)\b')
CLF = re.compile(r'\s*\((?:[Cc]lassifi?e?rs?)\b:?\s*([^()]*)\)')
LAO_RUN = re.compile(r'[ກ-ໍໜ-ໟ]+')


def lift_classifiers(g):
    found = []

    def rep(m):
        words = LAO_RUN.findall(m.group(1))
        if not words:
            return m.group(0)
        found.extend(words)
        return ' '
    g = CLF.sub(rep, g)
    return re.sub(r'\s+', ' ', g).strip(' ;,'), found


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    g = re.sub(r'\s*⇒.*$', '', g)
    if POINTER.match(g):
        return ''
    letters = [ch for ch in g if ch.isalpha()]
    if letters and sum(1 for ch in letters if '຀' <= ch <= '໿') * 2 > len(letters):
        return ''
    return g.strip()


def examples(senses):
    out = []
    for s in senses:
        for x in s.get('examples') or []:
            t, en = nfc(x.get('text', '')), (x.get('english') or x.get('translation') or '').strip()
            if t and en and is_lao(re.sub(r'[\s\d.,!?“”"()\-–—:;…]', '', t)):
                out.append([t, '', en])
    return out


def wiki_counts(words):
    """Each Wiktionary headword's count in the article text of Lao Wikipedia, per million cuts."""
    seg = Segmenter(words)
    want = {fold(w) for w in words}
    c, tot = {}, 0
    in_text = False
    with bz2.open(WIKI, 'rt', encoding='utf-8') as fh:
        for line in fh:
            if '<text' in line:
                in_text = True
            if in_text:
                for run in RUN.findall(fold(line)):
                    cut = seg._run(run)
                    # ONLY A RUN THE DICTIONARY COVERS WHOLE is counted.  Wiktionary holds
                    # some 2,400 Lao words, so a run holding a word it lacks is cut into
                    # that word's syllables -- and a syllable that is also a headword
                    # (ປະ, ສາ, ຕາ, ກາ) took its count: counted over every run, the top
                    # sixty held nine such fragments.
                    if any(w not in want for w in cut):
                        continue
                    for w in cut:
                        tot += 1
                        c[w] = c.get(w, 0) + 1
            if '</text>' in line:
                in_text = False
    return {k: round(v * 1e6 / tot, 2) for k, v in c.items()}, tot


def main():
    raw = [json.loads(line) for line in open(DUMP, encoding='utf-8')]
    heads = {nfc(e.get('word', '')) for e in raw if is_lao(nfc(e.get('word', '')))}
    counts, tot = wiki_counts(heads)
    print(f'  Lao Wikipedia: {tot} word cuts; {len(counts)} of {len(heads)} headwords found')
    json.dump(counts, open('freq.json', 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)

    lex, pointers = {}, {}
    for e in raw:
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_lao(w):
            continue
        senses = [s for s in e.get('senses') or []
                  if not any('\n' in g for g in s.get('glosses') or [])]
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        ipa = vientiane(e)
        roman = romanise(ipa)
        if not real:
            alts = [nfc(t.get('word', '')) for s in senses
                    for t in (s.get('alt_of') or []) + (s.get('form_of') or [])]
            if alts and is_lao(alts[0]):
                pointers.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0]),
                                              'roman': [roman] if roman else []})
            continue
        gl, clf = [], classifiers(e)
        for s in real:
            tags = set(s.get('tags') or [])
            g, found = lift_classifiers(clean_gloss((s.get('glosses') or [''])[-1]))
            if g:
                weak = bool(tags & WEAK)
                gl.append({'g': g, 'weak': weak, 'tags': sorted(tags & TAGS)})
                if pos == 'noun' and not weak and len(gl) == 1:
                    clf += [c for c in found if c not in clf]
        if not gl:
            continue
        ent = {'pos': pos, 'etym': e.get('etymology_number', '') or '',
               'roman': [roman] if roman else [], 'ipa': ipa, 'clf': clf, 'glosses': gl,
               'ex': examples(real)}
        lex.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append(ent)

    out = {}
    for k, L in pointers.items():
        if k not in lex:
            L['freq'] = counts.get(k, 0)
            L['formonly'] = True
            out[k] = L
    for k, L in lex.items():
        L['freq'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted((L for L in out.values() if 'entries' in L), key=lambda L: -L['freq'])[:60]
    print(f'  {len(out)} words ({len(pointers)} pointers); commonest:',
          ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
