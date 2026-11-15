#!/usr/bin/env python3
"""Every Khmer word in Wiktionary, compacted, with a frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-km.jsonl` (the kaikki.org extraction of English Wiktionary, CC BY-SA
4.0) and `km_counts.json` (wikitext.py's article counts from the Khmer Wikipedia)
and writes `lex.json`.  Level-independent: built once and kept.

A WORD'S FREQUENCY is the number of Khmer Wikipedia articles it is found in, by
`km.Segmenter`'s cut (`wikitext.py` says why Wikipedia and what the cut does).
NO LEMMA ARITHMETIC: Khmer, like Thai, does not inflect -- a word has one
spelling whatever its tense, number or person -- so a word's count is its own.
Two spellings of one glyph (subscript ta and da) and the invisible marks are one
word throughout (`km.key`).

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches (classifiers
included -- Khmer counts nouns with them, as Thai does); never a letter, a symbol
or an affix.  PROPER NOUNS ARE KEPT but marked: the fill never takes a word that
is only a name, and a card shows a name entry only when it has nothing else.  An
entry whose every sense is an alternative form of another word is not a word of
its own: it is kept as a POINTER (ឱ្យ -> ឲ្យ "to give") for the inventory, and
the fill never takes it.

WHAT AN ENTRY CARRIES.  Wiktionary's ROMANISATION -- its own phonetic
transcription of Khmer (ទឹក tɨk "water", ផ្ទះ phtĕəh "house"), written
by Wiktionary's Khmer transliteration module from the spelling and checked by
its editors; it shows the vowel each consonant series gives a letter, which
the spelling alone does not -- its glosses, and Wiktionary's own usage examples
(Khmer, romanised, translated), which `examples.py` falls back on when Tatoeba
has nothing.  Khmer Wiktionary entries carry no IPA in this extraction.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from km import nfc, key, is_khmer

DUMP, COUNTS, OUT = 'kaikki-km.jsonl', 'km_counts.json', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'classifier', 'name'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'slang', 'childish', 'morpheme', 'Hinduism', 'royal', 'ecclesiastical', 'literary',
        'offensive', 'slur', 'Internet', 'no-gloss', 'Northern', 'ethnic'}
TAGS = {'formal', 'informal', 'colloquial', 'figuratively', 'transitive', 'intransitive',
        'idiomatic', 'polite', 'humble', 'male', 'female', 'familiar', 'intimate'}
LATIN = re.compile(r'^[^ក-៿᧠-᧿]+$')


def roman(e):
    """Wiktionary's romanisation: the form tagged so, else an untagged Latin form
    (អរគុណ's interjection entry gives 'ʼɑɑ kun' with no tag)."""
    out = []
    for f in e.get('forms') or []:
        if 'romanization' in (f.get('tags') or []) and f.get('form'):
            out.append(nfc(f['form']).strip())
    if not out:
        for f in e.get('forms') or []:
            if not f.get('tags') and LATIN.match(f.get('form') or ''):
                out.append(nfc(f['form']).strip())
                break
    return list(dict.fromkeys(r for r in out if r))


def classifiers(e):
    return [nfc(f['form']) for f in e.get('forms') or []
            if 'classifier' in (f.get('tags') or []) and is_khmer(f.get('form', ''))]


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|eye dialect|'
                     r'misspelling|abbreviation)\b.*\b(form|spelling|of)\b')
KM_CH = re.compile(r'[ក-៿]')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    g = re.sub(r'\s*⇒.*$', '', g)
    if POINTER.match(g):
        return ''
    # A GLOSS THAT IS A KHMER SENTENCE is an example the extraction filed as a sense.
    # A real gloss may name a Khmer word ("a more polite word is ជូន (cuun)") but is
    # mostly English.
    letters = [ch for ch in g if ch.isalpha()]
    if letters and sum(1 for ch in letters if KM_CH.match(ch)) * 2 > len(letters):
        return ''
    return g.strip()


def examples(senses):
    out = []
    for s in senses:
        for x in s.get('examples') or []:
            t, en = nfc(x.get('text', '')), (x.get('english') or x.get('translation') or '').strip()
            if t and en and KM_CH.search(t) and \
                    is_khmer(re.sub(r'[\s\d.,!?“”"()\-–—:;…។៕៖«»]', '', t)):
                out.append([t, x.get('roman', '') or '', en])
    return out


def main():
    counts = json.load(open(COUNTS, encoding='utf-8'))['df']
    lex, pointers = {}, {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_khmer(w):
            continue
        senses = [s for s in e.get('senses') or []
                  if not any('\n' in g for g in s.get('glosses') or [])]
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        if not real:
            alts = [nfc(t.get('word', '')) for s in senses
                    for t in (s.get('alt_of') or []) + (s.get('form_of') or [])]
            if alts and is_khmer(alts[0]):
                # the pointer's OWN romanisation, so the card never prints the
                # target's sound under the pointer's spelling
                pointers.setdefault(key(w), {'word': w, 'alt_of': key(alts[0]),
                                             'roman': roman(e)})
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK), 'tags': sorted(tags & TAGS)})
        if not gl:
            continue
        ent = {'pos': pos, 'etym': str(e.get('etymology_number', '') or ''), 'roman': roman(e),
               'clf': classifiers(e), 'glosses': gl, 'ex': examples(real)}
        lex.setdefault(key(w), {'word': w, 'entries': []})['entries'].append(ent)

    out = {}
    for k, L in pointers.items():
        if k not in lex:
            L['freq'] = counts.get(k, 0)
            L['formonly'] = True
            out[k] = L
    for k, L in lex.items():
        L['freq'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    top = sorted((L for L in out.values() if 'entries' in L), key=lambda L: -L['freq'])[:40]
    print(f'  {len(out)} words ({len(pointers)} pointers); commonest:',
          ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
