#!/usr/bin/env python3
"""Every Burmese lemma in Wiktionary, compacted, with a frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-my.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `my_counts.json` (wikitext.py's counts of the Burmese
Wikipedia) and writes `lex.json`.  Level-independent: built once and kept.

ONE LEMMA PER SPELLING (`my.key`), its entries (one per part of speech and
etymology) kept apart for the card to choose among.

THE FREQUENCY IS THE WORD'S OWN.  Burmese does not inflect: a noun or a verb has
one form, and its grammar is separate particles, which the word cut takes as words
of their own.  So a lemma's frequency is the number of the Wikipedia's articles
its spelling was cut out of (`df`), plus those of the spellings Wiktionary lists
as its alternatives and of the pages that point to it ("alternative form of ...").
Maximal matching takes the longest dictionary word, so a word inside a longer
compound Wiktionary has (ရေ "water" inside ရေကန် "pond") is not counted there.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix, a proverb (the phrases deck's) or a proper name.  An entry whose
every sense is a form of or an alternative to another word is not a lemma; it is
kept only as a POINTER the inventory may resolve through, with its own reading
(`ptr_ipa`): Wiktionary files the spoken မနက် "morning" as an alternative of the
formal နံနက်, and the card the inventory asks for heads with မနက် and says it.

THE READING is Wiktionary's IPA (`sounds`), which marks the four tones (à low,
á high, a̰ creaky, aʔ checked) and says the word as it is said -- Burmese spelling
is conservative (ချိတ် is both tɕʰeɪʔ "to link" and dʑeɪʔ "hook").  Wiktionary's
romanisation, MLCTS, spells the letters and is kept as `mlc` but not printed.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from my import key, norm, is_burmese

DUMP, COUNTS, OUT = 'kaikki-my.jsonl', 'my_counts.json', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'prep', 'postp', 'pron',
            'conj', 'particle', 'det', 'num', 'classifier'}

WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'slang', 'euphemistic', 'offensive', 'taboo', 'Hinduism'}
WEAK_QUAL = {'royal', 'swear word', 'classical', 'probably slang'}

# shown in the part-of-speech label when a sense carries it
KEEP_TAGS = {'transitive', 'intransitive', 'formal', 'informal', 'colloquial', 'literary',
             'honorific', 'polite', 'familiar', 'figuratively'}


def is_formof(s):
    t = s.get('tags') or []
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    g = re.sub(r'\s*[.;:,]\s*$', '', g)
    return g


def ipa(e):
    for s in e.get('sounds') or []:
        if s.get('ipa'):
            return s['ipa'].strip()
    return ''


def mlc(e):
    for f in e.get('forms') or []:
        if 'romanization' in (f.get('tags') or []):
            return norm(f['form'])
    return ''


def classifiers(e):
    out = []
    for f in e.get('forms') or []:
        if 'classifier' in (f.get('tags') or []) and is_burmese(f.get('form', '')):
            fm = norm(f['form'])
            if fm not in out:
                out.append(fm)
    return out


def creaky(e):
    """The induced creaky tone form (မြန်မာ -> မြန်မာ့ "of Burma"), from the head template."""
    for h in e.get('head_templates') or []:
        a = h.get('args') or {}
        if a.get('3') == 'induced creaky tone form' and is_burmese(a.get('4', '')):
            return norm(a['4'])
    return ''


def alternatives(e):
    """Another spelling of the same word, in the same register: a form tagged only
    `alternative`.  One tagged literary, formal, obsolete ... is another register's word
    (Wiktionary lists သည် "literary" under the spoken တယ်), not a spelling of this one."""
    return [norm(f['form']) for f in e.get('forms') or []
            if (f.get('tags') or []) == ['alternative'] and is_burmese(f.get('form', ''))]


def is_burmese_text(t):
    return bool(re.search('[က-အ]', t or ''))


def main():
    df = json.load(open(COUNTS, encoding='utf-8'))['df']

    lemmas, pointers, ptr_ipa = {}, {}, {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = norm(e.get('word', ''))
        if pos not in KEEP_POS or not is_burmese(w):
            continue
        k = key(w)
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')
                and not {'morpheme', 'letter', 'no-gloss', 'empty-gloss'} & set(s.get('tags') or [])]
        if not real:
            for s in senses:
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = norm(t.get('word', ''))
                    if is_burmese(tw) and key(tw) != k:
                        pointers.setdefault(k, key(tw))
                        if ipa(e):
                            ptr_ipa.setdefault(k, ipa(e))
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            q = s.get('qualifier') or ''
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK) or q in WEAK_QUAL,
                           'tags': sorted(tags & KEEP_TAGS),
                           'q': q if q in ("women's speech", "men's speech") else ''})
        if not gl:
            continue
        ex = []
        for s_ in real:
            for x in s_.get('examples') or []:
                en = x.get('english') or x.get('translation') or ''
                if x.get('text') and en and is_burmese_text(x['text']):
                    ex.append([norm(x['text']), en.strip()])
        ent = {'pos': pos, 'word': w, 'ipa': ipa(e), 'mlc': mlc(e), 'cls': classifiers(e),
               'creaky': creaky(e), 'alts': alternatives(e), 'glosses': gl, 'ex': ex,
               'etym': e.get('etymology_number', '') or ''}
        L = lemmas.setdefault(k, {'word': w, 'entries': []})
        L['entries'].append(ent)

    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        for ent in L['entries']:
            for a in ent['alts']:
                claims[key(a)].add(k)
    for p, target in pointers.items():
        if target in lemmas:
            claims[p].add(target)
    for k, L in lemmas.items():
        L['freq'] = 0
    for form, ks in claims.items():
        c = df.get(form, 0)
        if not c:
            continue
        if form in lemmas:               # a spelling that is a lemma counts for itself only
            lemmas[form]['freq'] += c
            continue
        for k in ks:
            lemmas[k]['freq'] += c / len(ks)
    for L in lemmas.values():
        L['freq'] = round(L['freq'], 2)

    json.dump({'lemmas': lemmas, 'pointers': pointers, 'ptr_ipa': ptr_ipa}, open(OUT, 'w', encoding='utf-8'),
              ensure_ascii=False, sort_keys=True)
    tot = sum(df.values())
    hit = sum(c for f, c in df.items() if f in claims)
    print(f'  {len(lemmas)} lemmas, {len(pointers)} pointers; '
          f'{100 * hit / tot:.0f}% of the counted words are a lemma or its spelling')


if __name__ == '__main__':
    main()
