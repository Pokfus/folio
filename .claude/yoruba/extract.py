#!/usr/bin/env python3
"""Every Yoruba word in Wiktionary, by its TONED spelling, with a frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-yo.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `yo_counts.json` (wikitext.py's counts of the Yoruba
Wikipedia) and writes `lex.json`.  Level-independent: built once and kept.

ONE LEMMA PER TONED SPELLING.  Wiktionary titles a Yoruba page without its tones
(`ti`) and puts on it every word spelt so, each with its toned headword (tí
"which", ti the perfect particle, tì "to push").  Those are different words, so
they are read off by the headword (`yo-pos` / `head`): a lemma is a toned
spelling, its entries every part of speech Wiktionary gives that spelling (jẹ́
"to be" and jẹ́ "to answer" are one card, as a reader meets one written word).

THE FREQUENCY (`share`).  About half of the Yoruba Wikipedia's words carry their
tones.  A word's count is the article count of its KEY (`yo.key`: no tones, no
dots), over every article read, multiplied by the word's share of that key in the
CAREFULLY MARKED articles alone (`wikitext.py`), where an unmarked `ti` is the
mid-tone particle and not a careless tí.  A key no marked article uses is split
evenly among the lemmas that share it.  A multi-word lemma takes its rarest
word's count, halved (the Amharic rule).

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter (the letter-name senses of `ní`, `tí` ... are dropped), an affix or a
proper name.  An entry whose every sense is a form of or an alternative to
another word is a POINTER only, which the inventory may resolve through.  A
sense filed under a dialect (Ekiti), or rare, archaic, offensive ... is WEAK: it
is shown only after a lemma's ordinary senses, and a lemma of weak senses alone
is never dealt by the fill.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from yo import key, nfc, is_yoruba, strip_tones

DUMP, COUNTS, OUT = 'kaikki-yo.jsonl', 'yo_counts.json', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'prep', 'prep_phrase', 'pron',
            'conj', 'particle', 'det', 'num'}

WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'slang', 'euphemistic', 'offensive', 'slur', 'proscribed', 'Ekiti', 'ethnic',
        'Internet', 'neologism'}

KEEP_TAGS = {'transitive', 'intransitive', 'ditransitive', 'stative', 'auxiliary',
             'formal', 'informal', 'figuratively', 'idiomatic', 'interrogative', 'relative'}

# A SENSE THAT IS A PLANT'S OR AN ANIMAL'S SCIENTIFIC NAME, or a sexual one, is weak too: the
# spelling's everyday word comes first (ọ̀kan "one" before Sorindeia juglandifolia; le "to be
# hard" before its sexual sense), and such a sense is shown only where nothing else is.
TAXON = re.compile(r'^(?:[Tt]he (?:tree|herb|plant|shrub) )?[A-Z][a-z]+ [a-z]{3,}(?: \(|$|,)|\(syn\. |'
                   r'\([A-Z][a-z]+ [a-z]{3,}\)|\b[Tt]he (?:tree|herb|plant|shrub) [A-Z][a-z]+ [a-z]+')
SEXUAL = re.compile(r'\b(?:erection|penis|vagina|vulva|sexual|intercourse|copulate|testicle)', re.I)

LETTER = re.compile(r'^the name of the latin(?: script)? letter|^the (?:first|\w+) letter of the yoruba',
                    re.I)


def is_formof(s):
    t = s.get('tags') or []
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    g = re.sub(r'\s*[.;:,]\s*$', '', g)
    return g


def headword(e):
    """The toned spelling: the headword line's `head`, else the page title.  A phrase's
    closing mark is not part of it (`ó dàbọ̀!`)."""
    hd = ''
    for h in e.get('head_templates') or []:
        hd = (h.get('args') or {}).get('head') or ''
        if hd:
            break
    if not hd:
        for f in e.get('forms') or []:
            if 'canonical' in (f.get('tags') or []):
                hd = f['form']
                break
    return re.sub(r'[!?.,]+$', '', nfc(hd or e.get('word', ''))).strip()


def alternatives(e):
    """Wiktionary's other STANDARD spellings (a dialect's, Ekiti's, and archaic ones left out)."""
    out = []
    for f in e.get('forms') or []:
        t = f.get('tags') or []
        fm = nfc(f.get('form', ''))
        if t == ['alternative'] and is_yoruba(fm) and fm not in out:
            out.append(fm)
    return out


def ipa(e):
    for s in e.get('sounds') or []:
        if s.get('ipa') and not s.get('tags'):
            return nfc(s['ipa'])
    return ''


def main():
    C = json.load(open(COUNTS, encoding='utf-8'))
    df, marked = C['df'], C['marked']

    lemmas, pointers = {}, {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        page = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_yoruba(page):
            continue
        head = headword(e)
        if strip_tones(head).lower() != page.lower() or not is_yoruba(head):
            head = page                        # a headword line that is not this page's word
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')
                and not ({'morpheme', 'letter', 'no-gloss'} & set(s.get('tags') or []))
                and not LETTER.match(s['glosses'][-1])]
        if not real:
            for s in senses:
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_yoruba(tw) and tw.lower() != head.lower():
                        pointers.setdefault(head.lower(), tw)
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                weak = bool(tags & WEAK) or bool(TAXON.search(g)) or bool(SEXUAL.search(g))
                gl.append({'g': g, 'weak': weak, 'tags': sorted(tags & KEEP_TAGS)})
        if not gl:
            continue
        ex = []
        for s_ in real:
            for x in s_.get('examples') or []:
                en = (x.get('english') or x.get('translation') or '').strip()
                tx = nfc(x.get('text', ''))
                if tx and en and x.get('type') != 'quotation' and len(tx) <= 160:
                    spans = [[a, b] for a, b in (x.get('bold_text_offsets') or [])]
                    ex.append([tx, en, spans, x.get('text', '')])
        ent = {'pos': pos, 'word': head, 'page': page, 'alts': alternatives(e), 'ipa': ipa(e),
               'glosses': gl, 'ex': ex}
        L = lemmas.setdefault(head.lower(), {'word': head, 'entries': []})
        L['entries'].append(ent)

    # ---- the frequency ----
    tot_df = collections.Counter()
    tot_mk = collections.Counter()
    for s, c in df.items():
        tot_df[key(s)] += c
    for s, c in marked.items():
        tot_mk[key(s)] += c
    by_key = collections.defaultdict(list)
    for h in lemmas:
        if ' ' not in h:
            by_key[key(h)].append(h)
    for h, L in lemmas.items():
        if ' ' in h:
            continue
        k = key(h)
        if tot_mk[k]:
            L['freq'] = round(tot_df[k] * marked.get(h, 0) / tot_mk[k], 2)
        else:
            L['freq'] = round(tot_df[k] / len(by_key[k]), 2)
    for h, L in lemmas.items():
        if ' ' in h:
            parts = [lemmas[p]['freq'] if p in lemmas else df.get(p, 0) for p in h.split()]
            L['freq'] = round(min(parts) / 2, 2)

    json.dump({'lemmas': lemmas, 'pointers': pointers}, open(OUT, 'w', encoding='utf-8'),
              ensure_ascii=False, sort_keys=True)
    print(f'  {len(lemmas)} lemmas, {len(pointers)} pointers')


if __name__ == '__main__':
    main()
