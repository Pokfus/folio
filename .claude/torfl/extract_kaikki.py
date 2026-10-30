#!/usr/bin/env python3
"""Every Russian lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract_kaikki.py         (run from the cache directory, by run.py)

Reads `kaikki-ru.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `ru_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: every level reads the
same file, so it is built once and kept.

WHY A LEMMA FREQUENCY AND NOT THE LIST'S OWN RANK.  The subtitle list counts
WORD FORMS, and Russian scatters one lemma over a dozen of them: `книгу`
(accusative) ranks 1,375 and the headword `книга` 1,789; `книге` 3,333,
`книгой` 11,254 (measured 2026-10-30).  Ranked on the headword's own row, every
noun and verb is understated, and unevenly -- a word met mostly in an oblique
case sinks furthest.  So a lemma's frequency here is the SUM of the counts of
every form of its paradigm, which Wiktionary lists in full.

A FORM TWO LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE.  `стали` is a form of the
verb `стать` and of the noun `сталь`; counted whole for both, steel would ride
into a beginner's deck on the back of "became".  Each shared form's count is
divided among its claimants in proportion to what each earns from the forms it
holds ALONE (`стал`, `станет` … against `сталью`), plus one so that a lemma
with no form of its own still gets an equal share rather than nothing.  Two
rounds of that settle it.  It is an estimate, and `select.py` prints the
cases where it decided most.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck can teach; never a
letter, a symbol, an affix or a proper name.  An entry whose every sense is a
`form of` another is an inflected form, not a lemma, and is dropped -- its
counts reach its lemma through the lemma's own paradigm.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from russian import fold, nfc, is_russian, OLD_LETTERS

DUMP, FREQ, OUT = 'kaikki-ru.jsonl', 'ru_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'postp'}

# What makes a listed form part of THIS lemma's paradigm.  A form carrying none
# of these is a relative -- the aspect partner, a diminutive, the relational
# adjective, the verbal noun -- and counts for its own lemma, not this one.
INFL = {'nominative', 'genitive', 'dative', 'accusative', 'instrumental',
        'prepositional', 'locative', 'vocative', 'partitive', 'present', 'past',
        'future', 'imperative', 'infinitive', 'participle', 'short-form',
        'comparative', 'superlative', 'first-person', 'second-person',
        'third-person', 'canonical', 'singular', 'plural'}
RELATIVE = {'romanization', 'table-tags', 'inflection-template', 'class',
            'diminutive', 'augmentative', 'pejorative', 'relational',
            'noun-from-verb', 'adjective', 'alternative', 'hypocoristic',
            'endearing', 'expressive', 'obsolete', 'archaic', 'dated',
            'nonstandard', 'colloquial', 'rare', 'dialectal', 'poetic'}
CASES = ('nominative', 'genitive', 'dative', 'accusative', 'instrumental',
         'prepositional')


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or [])


def compact(d):
    pos = d['pos']
    forms, partners, canon_tags, head = [], [], [], None
    for fm in d.get('forms') or []:
        t = fm.get('tags') or []
        # `него́ ²`: Wiktionary footnotes a cell with a superscript digit
        w = nfc(re.sub(r'[\s\d¹²³⁴⁵⁶⁷⁸⁹⁰*]+$', '', fm.get('form', '')))
        if not w or not is_russian(w) or w in ('-', '—'):
            continue
        if 'canonical' in t:
            if head is None:
                head, canon_tags = w, t
            continue
        st = set(t)
        if st & {'perfective', 'imperfective'} and st <= {'perfective', 'imperfective',
                                                        'suppletive'}:
            partners.append([w, 'perfective' if 'perfective' in st else 'imperfective'])
            continue
        if st & RELATIVE or not (st & INFL):
            continue
        forms.append([w, sorted(st)])
    senses = []
    for s in d.get('senses') or []:
        if is_formof(s):
            continue
        g = s.get('glosses') or []
        if not g:
            continue
        senses.append({'g': g, 't': s.get('tags') or [],
                       'q': s.get('qualifier') or ''})
    if not senses:
        return None
    exp = ((d.get('head_templates') or [{}])[0] or {}).get('expansion', '')
    if head is None:
        # some entries carry no `canonical` form; the paradigm's own citation
        # cell is the stressed headword then
        want = {'verb': {'infinitive'}, 'noun': {'nominative', 'singular'},
                'adj': {'nominative', 'masculine', 'singular'}}.get(pos)
        for w, st in forms:
            if want and want <= set(st) and fold(w) == fold(d['word']):
                head = w
                break
    # the grammar the headword line states: `m inan`, `f`, `impf`, `pf`,
    # `impf or pf`, `m or n` -- read off the line, since `canonical` tags are
    # missing exactly where `head` is
    m = re.search(r'\)\s+((?:(?:m|f|n|impf|pf|inan|anim|pl|sg|or)\s*)+)', exp)
    gram = m.group(1).split() if m else []
    return {'word': nfc(d['word']), 'pos': pos, 'head': head or nfc(d['word']),
            'htags': canon_tags, 'gram': gram, 'exp': exp, 'forms': forms,
            'partners': partners, 'senses': senses}


def main():
    entries = []
    for line in open(DUMP, encoding='utf-8'):
        d = json.loads(line)
        if d.get('lang_code') != 'ru' or d.get('pos') not in KEEP_POS:
            continue
        if not is_russian(nfc(d.get('word', ''))):
            continue
        e = compact(d)
        if e:
            entries.append(e)
    print(f'  {len(entries)} lemma entries')

    count = collections.Counter()
    for line in open(FREQ, encoding='utf-8'):
        parts = line.split()
        if len(parts) == 2 and parts[1].isdigit():
            count[fold(parts[0])] += int(parts[1])

    # each entry's own single-word forms, folded
    owns = []
    claim = collections.defaultdict(list)
    for i, e in enumerate(entries):
        fs = {fold(e['word'])} | {fold(w) for w, _t in e['forms']}
        fs = {x for x in fs if x and ' ' not in x}
        owns.append(fs)
        for x in fs:
            claim[x].append(i)

    head_of = collections.defaultdict(list)
    for i, e in enumerate(entries):
        head_of[fold(e['word'])].append(i)
    alone = [1.0] * len(entries)
    for x, ids in claim.items():
        if len(ids) == 1:
            alone[ids[0]] += count.get(x, 0)
    freq = [0.0] * len(entries)
    for x, ids in claim.items():
        c = count.get(x, 0)
        if not c:
            continue
        # A FORM THAT IS SOME LEMMA'S HEADWORD BELONGS TO THAT LEMMA.  `так` is
        # the adverb, not the genitive plural of `та́ка` (Bangladesh's currency);
        # `для` is the preposition, not a form of `длить`.  Only a form that is no
        # entry's headword (`стали`) is shared out among the paradigms holding it.
        ids = head_of.get(x) or ids
        tot = sum(alone[i] for i in ids)
        for i in ids:
            freq[i] += c * alone[i] / tot
    # AND A LEMMA WHOSE OWN HEADWORD IS RARE CANNOT BE COMMON ON ITS OBLIQUE
    # FORMS ALONE.  The rule above still leaves an oblique form no headword owns
    # with whichever rare paradigm happens to hold it -- `таки` (the particle,
    # which has no entry of its own) is `та́ка`'s nominative plural.  A real
    # word's paradigm earns at most some fifteen times its headword (`рука́`,
    # met mostly as `руки` and `руку`, is the highest measured among common
    # nouns), so the sum is capped at forty times the headword's own count.
    capped = 0
    for i, e in enumerate(entries):
        own = count.get(fold(e['word']), 0)
        e['own'] = own
        cap = 40 * own + 200
        if freq[i] > cap:
            capped += 1
        e['freq'] = round(min(freq[i], cap), 1)
    print(f'  {capped} lemmas capped at forty times their headword')
    json.dump(entries, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'  wrote {OUT}: {os.path.getsize(OUT) // 1_000_000} MB')


if __name__ == '__main__':
    main()
