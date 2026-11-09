#!/usr/bin/env python3
"""Every Hausa word in Wiktionary, plus the hand glosses, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-ha.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0), `hand.py` (Folio's own glosses for the core words Wiktionary
lacks) and `hau_sentences_detailed.tsv` (Tatoeba, CC BY 2.0 FR) and writes
`lex.json`.  Level-independent: built once and kept.

THE FREQUENCY IS COUNTED FROM TATOEBA'S HAUSA SENTENCES (about 21,850 sentences,
190,000 words), because there is no published Hausa frequency list: the
subtitle lists every other set on the shelf used (hermitdave/FrequencyWords)
have no Hausa file.  It is small, and it is the translation of English Tatoeba
sentences, so it is a frequency of everyday conversational Hausa as a corpus of
short sentences has it, not of the press or of the Qur'anic register; the
deck's description says where it comes from.

WHY A LEMMA FREQUENCY.  A Hausa noun takes the genitive linker and the
possessive pronouns as suffixes (`gida`, `gidan`, `gidana`, `gidansa`) and a
plural that is often its own word (`mutum` / `mutane`).  A lemma's count is the
sum of every surface that is its own: the headword, the plural, the feminine and
the possessed form Wiktionary lists, and a token that is one of those with a
suffix taken off (`ha.stems`).  A surface two words share is split in proportion
to what each earns alone, plus one, over two rounds (the TORFL / Hindi rule).
Hooks dropped in the corpus are matched only as a fallback (`ha.py`).
"""
import collections, csv, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ha import nfc, norm, loose, untone, is_hausa, tokens, stems
from hand import HAND

DUMP, SENTS, OUT = 'kaikki-ha.jsonl', 'hau_sentences_detailed.tsv', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'name'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'euphemistic'}

csv.field_size_limit(10 ** 8)


def head_of(e):
    """Wiktionary's toned headword: the `canonical` form, else the head template's `head`."""
    for f in e.get('forms') or []:
        if 'canonical' in (f.get('tags') or []):
            return nfc(f.get('form', ''))
    for h in e.get('head_templates') or []:
        a = h.get('args') or {}
        if a.get('head'):
            return nfc(a['head'])
        if h.get('name') in ('ha-noun', 'ha-verb', 'ha-adj') and a.get('2'):
            return nfc(a['2'])
    return ''


def gender_of(e):
    for h in e.get('head_templates') or []:
        if h.get('name') == 'ha-noun':
            g = (h.get('args') or {}).get('1', '')
            if g in ('m', 'f'):
                return g
            if g in ('m-f', 'mf', 'm/f', 'f-m'):
                return 'mf'
    for f in e.get('forms') or []:
        t = set(f.get('tags') or [])
        if 'canonical' in t:
            if 'masculine' in t and 'feminine' in t:
                return 'mf'
            if 'masculine' in t:
                return 'm'
            if 'feminine' in t:
                return 'f'
    return ''


def grade_of(e):
    for h in e.get('head_templates') or []:
        if h.get('name') == 'ha-verb':
            return (h.get('args') or {}).get('1', '')
    return ''


def forms_of(e):
    """The plural(s), feminine and possessed form, each {f: plain, t: toned, k: kind}."""
    out = []
    for f in e.get('forms') or []:
        t = set(f.get('tags') or [])
        if 'canonical' in t:
            continue
        kind = ('plural' if 'plural' in t else 'feminine' if 'feminine' in t
                else 'possessed' if 'possessed-form' in t else '')
        form = nfc(f.get('form', ''))
        if not kind or not is_hausa(form):
            continue
        plain = next((nfc(l[1]) for l in f.get('links') or [] if len(l) > 1 and is_hausa(l[1])),
                     '') or untone(form)
        out.append({'f': plain.split('#')[0], 't': form, 'k': kind})
    return out


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


# A SPELLING POINTER LEFT AS A SENSE INSIDE A REAL ENTRY ("Niger standard spelling of
# 'ya", "alternative letter-case form of aboki") is not a meaning; cut by text.
POINTER = re.compile(r"(standard spelling|alternative (letter-case )?(form|spelling)|"
                     r"alternative case form) of\b", re.I)


FEMEQ = re.compile(r'^female equivalent of [^:]+:\s*(.+)$')


def clean(g):
    g = ' '.join((g or '').split()).strip()
    return '' if POINTER.search(g) else g


def main():
    lemmas, pointers = {}, []
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos, w = e.get('pos'), nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_hausa(w) or w.startswith('-') or w.endswith('-'):
            continue
        senses = e.get('senses') or []
        for s in senses:
            for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                if is_hausa(t.get('word', '')):
                    pointers.append((norm(w), norm(t['word'])))
        # "female equivalent of yārṑ: girl, young woman" is filed as a form-of sense, but
        # what follows its colon is a meaning: keep it, without the pointer.
        real = [s for s in senses if not is_formof(s) and s.get('glosses')] + \
            [{'glosses': [FEMEQ.match((s.get('glosses') or [''])[-1]).group(1)], 'tags': []}
             for s in senses if is_formof(s) and FEMEQ.match((s.get('glosses') or [''])[-1])]
        if not real:
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK),
                           'tags': sorted(tags & {'transitive', 'intransitive', 'figuratively',
                                                  'colloquial', 'informal', 'formal', 'Islam',
                                                  'idiomatic', 'slang'})})
        ent = {'pos': pos, 'etym': e.get('etymology_number') or '', 'src': 'wiktionary',
               'toned': head_of(e), 'gender': gender_of(e) if pos == 'noun' else '',
               'grade': grade_of(e), 'glosses': gl, 'forms': forms_of(e)}
        L = lemmas.setdefault(norm(w), {'word': w, 'entries': []})
        L['entries'].append(ent)
        # the card prints the COMMON word's spelling: `gajere` "short", not the name `Gajere`
        if pos != 'name' and L['word'] != w and L['word'][:1].isupper():
            L['word'] = w

    # THE HAND GLOSSES: Folio's own, for core words Wiktionary does not have (`hand.py`).
    for w, items in HAND.items():
        k = norm(w)
        L = lemmas.setdefault(k, {'word': w, 'entries': []})
        for it in items:
            pos, gls = it[0], it[1]
            gender = it[2] if len(it) > 2 else ''
            plural = it[3] if len(it) > 3 else ''
            L['entries'].append({
                'pos': pos, 'etym': 'hand', 'src': 'hand', 'toned': '', 'gender': gender,
                'grade': '', 'glosses': [{'g': g.strip(), 'weak': False, 'tags': []}
                                         for g in gls.split(';') if g.strip()],
                'forms': [{'f': p, 't': '', 'k': 'plural'} for p in plural.split(',') if p.strip()]})

    # ---- the frequency --------------------------------------------------------------------
    raw = collections.Counter()
    for row in csv.reader(open(SENTS, encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            for t in tokens(row[2]):
                raw[norm(t)] += 1

    claims = collections.defaultdict(set)
    nominal = set()                        # lemmas that take the noun suffixes
    for k, L in lemmas.items():
        claims[k].add(k)
        for ent in L['entries']:
            if ent['pos'] in ('noun', 'adj', 'verb', 'num'):
                nominal.add(k)
            for fm in ent['forms']:
                claims[norm(fm['f'])].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    loose_of = collections.defaultdict(set)
    for surf in claims:
        loose_of[loose(surf)].add(surf)

    def resolve(key):
        if key in claims:
            return [key]
        for st in stems(key):
            if st in claims and claims[st] & nominal:
                return [st]
        # the hook fallback only for a word of four letters or more: `ya` "he" is
        # not `'ya` "daughter", nor `da` "and" `ɗa` "son"
        if len(key) < 4:
            return []
        cands = sorted(loose_of.get(loose(key), ()))
        if cands:
            return cands
        for st in stems(key):
            cands = sorted(s for s in loose_of.get(loose(st), ()) if claims[s] & nominal)
            if cands:
                return cands
        return []

    counts = collections.Counter()
    for key, c in raw.items():
        r = resolve(key)
        for s in r:
            counts[s] += c / len(r)

    alone = collections.Counter()
    for surf, who in claims.items():
        if len(who) == 1:
            alone[next(iter(who))] += counts.get(surf, 0)
    freq = collections.Counter(alone)
    for _ in range(2):
        nxt = collections.Counter(alone)
        for surf, who in claims.items():
            if len(who) < 2 or not counts.get(surf):
                continue
            wts = {k: freq[k] + 1 for k in who}
            tot = sum(wts.values())
            for k in sorted(who):
                nxt[k] += counts[surf] * wts[k] / tot
        freq = nxt

    for k, L in lemmas.items():
        L['freq'] = round(freq.get(k, 0), 2)
        L['own'] = raw.get(k, 0)
    json.dump(lemmas, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    top = sorted(lemmas.values(), key=lambda L: (-L['freq'], L['word']))[:60]
    print(f'  {len(lemmas)} words ({sum(1 for L in lemmas.values() if any(e["src"] == "hand" for e in L["entries"]))} '
          f'with a hand gloss); {sum(raw.values())} corpus tokens; commonest:',
          ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
