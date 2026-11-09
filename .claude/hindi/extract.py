#!/usr/bin/env python3
"""Every Hindi lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-hi.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `hi_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Hindi spreads
a word over several: `खाना` / `खाने` / `खानों`, and a verb over a dozen
(`खाता`, `खाती`, `खाया`, `खाएगा` ...).  A lemma's frequency here is the sum of
the counts of every form Wiktionary lists for it -- its declension or
conjugation table, plus every entry that says it is a `form of` it (`हूँ`,
`है` are entries of their own, each "inflection of होना").

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE.  `की` is the feminine
of the postposition `का` and a past form of `करना`; `के` is a form of `का`
and a dialect spelling of `कि`.  Each shared form's count is divided among its
claimants in proportion to what each earns from the forms it holds alone,
plus one, over two rounds -- the Russian pipeline's rule (`.claude/torfl/`).

All matching goes through `hi.fold` (nukta and chandrabindu ignored), since
the subtitles write `हूं` where Wiktionary writes `हूँ`.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name.  An entry whose every sense is a form or
an alternative spelling of another word is not a lemma, and is dropped -- its
count reaches the lemma it points to.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hi import fold, nfc, is_hindi

DUMP, FREQ, OUT = 'kaikki-hi.jsonl', 'hi_full.txt', 'lex.json'
# THE SECOND SOURCE (C1's ranking): wordfreq's Hindi list, read from the pinned wheel
# by `wordfreq_hi.py`.  Its lemma frequency is computed by the SAME rules as the
# subtitles' and stored beside it as `wf` (per billion words); `freq` is untouched.
WHEEL = 'wordfreq-3.1.1-py3-none-any.whl'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'postp'}

NAME_OK = {'हिंदी'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'Jainism', 'Buddhism', 'vulgar', 'derogatory',
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


POINTER = re.compile(r'^(nuqtaless|alternative|obsolete|archaic|dated|rare|nonstandard|'
                     r'eye dialect|misspelling)\b.*\b(form|spelling) of\b')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)         # stray wiki brackets: "[essential]]"
    # A POINTER SENSE MIXED INTO A REAL ENTRY ("nuqtaless form of ज़रूरत") is not a
    # meaning; Wiktionary leaves it untagged on many nukta words, so it goes by text.
    if POINTER.match(g):
        return ''
    return g


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_hindi(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    named = set()            # spellings Wiktionary also files as a proper noun (C1's rule)
    lemmas = {}              # fold(word) -> {word, entries:[...]}
    pointers = []            # (surface fold, target fold) from form-of entries
    formonly = {}            # pointers kept for the inventory (see below)
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos == 'name':
            named.add(fold(w))
        # A LANGUAGE'S NAME is a proper noun in Wiktionary, and the fill never takes one;
        # `हिंदी` without it is "an Indian; Indian", which is not what an A1 card means.
        if pos == 'name' and w in NAME_OK and e.get('etymology_number') in (None, '1'):
            pos = 'name'
        elif pos not in KEEP_POS or not is_hindi(w):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_hindi(tw):
                        pointers.append((fold(w), fold(tw), 'alt' if 'alt_of' in s else 'form'))
        if not real:
            # NOT A LEMMA -- but two kinds are kept as pointers for the inventory:
            # a closed-class FORM a beginner learns as a word (मेरा "genitive of
            # मैं; my, mine", वे "they"), and an ALTERNATIVE SPELLING that is the
            # common one (कुर्सी for कुरसी, गरम for गर्म).  The fill never takes
            # either; `select.py` resolves an inventory word through them.
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_hindi(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0])})
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
        table = []
        for f in e.get('forms') or []:
            if f.get('source') in ('declension', 'conjugation', 'inflection') and is_hindi(f.get('form', '')):
                table.append({'f': nfc(f['form']), 'r': f.get('roman', ''), 't': f.get('tags') or []})
        ent = {'pos': pos, 'etym': e.get('etymology_number', ''), 'roman': roman_of(e), 'gender': gender_of(e), 'glosses': gl,
               'table': table,
               'urdu': next((f['form'] for f in e.get('forms') or [] if 'Urdu' in (f.get('tags') or [])), ''),
               'formal_alt': [nfc(f['form']) for f in e.get('forms') or []
                              if 'alternative' in (f.get('tags') or []) and is_hindi(f.get('form', ''))]}
        lemmas.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append(ent)

    # which lemmas claim which surface
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        for ent in L['entries']:
            for row in ent['table']:
                t = set(row['t'])
                # A VERB'S FEMININE INFINITIVE CLAIMS NOTHING: `पानी` "water" is also the
                # feminine infinitive of `पाना` "to get", and split by the rule below the
                # commonest noun of A1 came out with a count of 0.45 and was dealt last.
                # The cell is real Hindi (मुझे चिट्ठी लिखनी है) but rare beside any noun
                # it collides with; the agentive and adjectival cells likewise.
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
    # A SURFACE THAT IS AN INDECLINABLE WORD'S OWN SPELLING IS THAT WORD'S.  Split
    # proportionally, `फिर` "again" made `फिरना` "to turn" a top-100 word and `पीछे`
    # "behind" made `पीछा` "pursuit": an adverb or a postposition has no other form
    # to earn a weight from, so it lost its own spelling to any verb whose stem or
    # noun whose oblique it happens to be.  ONLY for a closed-class or adverb entry:
    # given to every headword (Turkish's rule 2 as written), the rule handed `कर`
    # to "hand; tax", `दिया` to "lamp", `सकता` to "apoplexy" and `दी` to "elder
    # sister" -- nouns whose spelling is a commoner verb form.  An INDECLINABLE
    # adjective is in the adverb's position (`सही` "right" was feeding `सहना`).
    CLOSED = {'adv', 'postp', 'conj', 'particle', 'pron', 'det', 'num', 'intj'}
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 \
                and (any(e['pos'] in CLOSED for e in lemmas[surf]['entries'])
                     or all(e['pos'] == 'adj' and not e['table'] for e in lemmas[surf]['entries'])):
            claims[surf] = {surf}
    def lemma_freq(counts):
        """A surface-form count list -> {lemma: frequency}, by the rules above."""
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
        # a MULTI-WORD lemma (के लिए, के साथ) is not in a list of single words; it is
        # dealt by its rarest word's count, halved, so it sits near its words.  Kept
        # apart from `freq`: an alternative spelling pointing at one reads `freq` (0).
        multi = {}
        for k in lemmas:
            if ' ' in k:
                parts = [counts.get(p, 0) for p in k.split()]
                multi[k] = min(parts) / 2 if parts else 0
        return freq, multi

    freq, multi = lemma_freq(counts)
    wf = None
    if os.path.exists(WHEEL):
        import wordfreq_hi
        wcounts = {}
        for w, c in wordfreq_hi.load(WHEEL).items():
            if is_hindi(w):
                wcounts[fold(w)] = wcounts.get(fold(w), 0) + c
        wf, wmulti = lemma_freq(wcounts)

    out = {}
    for k, L in formonly.items():
        if k not in lemmas:
            L['freq'] = round(freq.get(L.get('alt_of', k), 0) if 'alt_of' in L else counts.get(k, 0), 2)
            if wf is not None:
                L['wf'] = round(wf.get(L.get('alt_of', k), 0) if 'alt_of' in L else wcounts.get(k, 0), 2)
            L['own'] = counts.get(k, 0)
            L['formonly'] = True
            out[k] = L
    for k, L in lemmas.items():
        L['freq'] = round(multi.get(k, 0) or freq.get(k, 0), 2)
        if wf is not None:
            L['wf'] = round(wmulti.get(k, 0) or wf.get(k, 0), 2)
        # A SPELLING THAT IS ALSO A PROPER NOUN (मोदी, अखिलेश, इंदिरा, असम): wordfreq's news
        # and Twitter count it as the name.  Marked, and only C1's fill reads the mark.
        if k in named:
            L['named'] = True
        L['own'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted(out.values(), key=lambda L: -L['freq'])[:40]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
