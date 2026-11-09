#!/usr/bin/env python3
"""Every Greek lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-el.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `el_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Greek spreads a
word over many: a noun over four cases and two numbers (`σπίτι`, `σπιτιού`,
`σπίτια`), an adjective over three genders as well, and a verb over a dozen
tenses and persons, its past often on another stem (`τρώω`, `έφαγα`, `φάω`).
A lemma's frequency here is the sum of the counts of every form Wiktionary lists
for it -- its declension or conjugation table, plus every entry that says it is
a form of it ("first-person singular simple past of τρώω").

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- the Russian and Hindi
rule: each shared form's count is divided among its claimants in proportion to
what each earns from the forms it holds alone, plus one, over two rounds.  Three
exceptions, each found on reading the ranking (`docs/greek-decks-plan.md`):
  · AN INDECLINABLE WORD'S OWN SPELLING IS ITS OWN (the Hindi rule): `καλά`
    "well" is not split with the neuter plural of `καλός`, nor `πολύ` "very"
    with `πολύς`'s neuter;
  · A CONTRACTION (`στο` = σε + το) gives its count to the preposition it opens
    with, never the article -- `σε` is the word the learner meets.

All matching goes through `gr.fold` (lower case, final sigma), which KEEPS the
accent, so `η` "the" and `ή` "or", `που` "that" and `πού` "where" stay apart.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name.  An entry whose every sense is a form or an
alternative spelling of another word is not a lemma -- its count reaches the
lemma it points to -- except the closed-class forms a beginner learns as words
(`μου` is its own lemma in Wiktionary already; `τον` "him" too).
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gr import fold, nfc, is_greek, translit, roman_clean

DUMP, FREQ, OUT = 'kaikki-el.jsonl', 'el_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'article'}

CAL = set('Δευτέρα Τρίτη Τετάρτη Πέμπτη Παρασκευή Σάββατο Κυριακή Ιανουάριος Φεβρουάριος '
          'Μάρτιος Απρίλιος Μάιος Ιούνιος Ιούλιος Αύγουστος Σεπτέμβριος Οκτώβριος Νοέμβριος '
          'Δεκέμβριος'.split())

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'offensive', 'nonstandard',
        'misspelling', 'Katharevousa', 'literary', 'Cyprus', 'Ancient', 'euphemistic'}

# a table cell with one of these is a real form, but too rare to claim a count from a commoner word
RARE_CELL = {'archaic', 'dated', 'rare', 'obsolete', 'Katharevousa', 'dialectal'}


def roman_of(e):
    for f in e.get('forms') or []:
        if 'romanization' in (f.get('tags') or []):
            return roman_clean(f.get('form', ''))
    return translit(e.get('word', ''))


def gender_of(e):
    for h in e.get('head_templates') or []:
        a = h.get('args') or {}
        g = a.get('g', '') or (a.get('1', '') if h.get('name') == 'el-noun' else '')
        pl = 'p' if g.endswith('-p') else ''          # a plural-only noun (τα λεφτά)
        g = g.split('-')[0]
        if g in ('m', 'f', 'n'):
            g2 = (a.get('g2') or '').split('-')[0]
            return (g + g2 if g2 in ('m', 'f', 'n') and g2 != g else g) + pl
    tags = collections.Counter(t for s in e.get('senses') or [] for t in s.get('tags') or [])
    gs = [g for g, t in (('m', 'masculine'), ('f', 'feminine'), ('n', 'neuter')) if tags[t]]
    return ''.join(gs[:2])


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|polytonic|Katharevousa|'
                     r'eye dialect|misspelling|monotonic)\b.*\b(form|spelling) of\b')
CONTRACTION = re.compile(r'^contraction of (\S+)')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    return g


def sense_gloss(s, shown):
    """A sense's gloss.  A NESTED sense (["to eat", "to chew and swallow food"]) is
    given as its parent ("to eat") once, its children then saying nothing new; a
    top-level sense as its own text."""
    gl = s.get('glosses') or []
    if not gl:
        return ''
    if len(gl) > 1:
        if gl[0] in shown:
            return ''
        shown.add(gl[0])
        return clean_gloss(gl[0])
    return clean_gloss(gl[-1])


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_greek(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lower = set()            # every lower-case Greek headword, folded
    for line in open(DUMP, encoding='utf-8'):
        w = nfc(json.loads(line).get('word', ''))
        if w[:1] == w[:1].lower() and is_greek(w):
            lower.add(fold(w))
    lemmas = {}              # fold(word) -> {word, entries:[...]}
    pointers = []            # (surface fold, target fold, kind) from form-of entries
    contractions = {}        # στο -> σε
    formonly = {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos == 'contraction' and is_greek(w):
            for s in e.get('senses') or []:
                m = CONTRACTION.match((s.get('glosses') or [''])[-1])
                if m and is_greek(m.group(1)):
                    contractions.setdefault(fold(w), fold(m.group(1)))
            continue
        if pos == 'name' and w in CAL:
            pos = 'noun'
        if pos not in KEEP_POS or not is_greek(w):
            continue
        # A CAPITALISED headword is a day or a month (`Δευτέρα`, `Μάιος` -- the months
        # are filed as names), or a numeral letter or an abbreviation (`Η` "eight").
        # Folded, it takes the key of a lower-case word: a day or a month wins it (the
        # subtitles' `Δευτέρα` is Monday, not `δευτέρα`), anything else capitalised is
        # kept only where no lower-case headword at all folds the same.
        cap = w[:1] != w[:1].lower()
        have = lemmas.get(fold(w))
        if w in CAL:
            if have and not have.get('cal'):
                del lemmas[fold(w)]
                have = None
        elif cap and (fold(w) in lower or (have and not have.get('cap'))):
            continue
        elif have and (have.get('cal') or (have.get('cap') and not cap)):
            if have.get('cal'):
                continue
            del lemmas[fold(w)]
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_greek(tw):
                        pointers.append((fold(w), fold(tw), 'alt' if 'alt_of' in s else 'form'))
        if not real:
            # NOT A LEMMA -- but an ALTERNATIVE SPELLING is kept as a pointer for the
            # inventory; the fill never takes one, `select.py` resolves through it.
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_greek(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0])})
            continue
        gl, shown = [], set()
        for s in real:
            tags = set(s.get('tags') or [])
            g = sense_gloss(s, shown)
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK),
                           'tags': sorted(tags & {'formal', 'informal', 'colloquial', 'figuratively',
                                                  'transitive', 'intransitive', 'idiomatic', 'slang',
                                                  'familiar', 'plural', 'in-plural'})})
        table = []
        for f in e.get('forms') or []:
            fm = nfc(f.get('form', ''))
            if f.get('source') in ('declension', 'conjugation', 'inflection') and is_greek(fm):
                r = roman_clean(f.get('roman', '')) or ' '.join(translit(x) for x in fm.split())
                table.append({'f': fm, 'r': r, 't': f.get('tags') or []})
        head_forms = {t: nfc(f['form']) for f in e.get('forms') or [] if not f.get('source')
                      for t in (f.get('tags') or []) if t in ('past', 'feminine', 'neuter', 'plural',
                                                              'genitive', 'passive')
                      and is_greek(f.get('form', ''))}
        ent = {'pos': pos, 'etym': e.get('etymology_number', '') or '', 'roman': roman_of(e),
               'gender': gender_of(e) if pos == 'noun' else '', 'glosses': gl,
               'table': table, 'head': head_forms}
        L = lemmas.setdefault(fold(w), {'word': w, 'entries': []})
        if cap:
            L['cap'] = True
        if w in CAL:
            L['cal'] = True
        L['entries'].append(ent)
    for k, L in lemmas.items():
        # a MULTI-WORD lemma (καλή όρεξη) is not in a list of single words; it is dealt
        # by its rarest word's count, halved, so it sits near its words.
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    # which lemmas claim which surface
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        if ' ' in k:
            continue
        for ent in L['entries']:
            for row in ent['table']:
                if ' ' in row['f'] or set(row['t']) & RARE_CELL:
                    continue
                claims[fold(row['f'])].add(k)
    for surf, tgt, kind in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    for surf, tgt in contractions.items():
        if tgt in lemmas:
            claims[surf] = {tgt}
    # AN INDECLINABLE WORD'S OWN SPELLING IS ITS OWN -- only for a closed-class or adverb
    # entry, or an adjective with no table (the Hindi rule and its reasons).
    CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'article'}
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 and surf not in contractions \
                and (any(e['pos'] in CLOSED for e in lemmas[surf]['entries'])
                     or all(e['pos'] == 'adj' and not e['table'] for e in lemmas[surf]['entries'])):
            claims[surf] = {surf}
    # A NOUN'S OWN HEADWORD IS ITS OWN against an adjective's inflected cell
    # (2026-11-09): split, `μωρό` "baby" lost its spelling to the neuter of `μωρός`
    # "stupid", `λεπτό` "minute" to `λεπτός` "thin" and `κρύο` "cold" to `κρύος` --
    # A1 nouns dealt last and the adjectives dealt in their place.  Against ANOTHER
    # NOUN's cell only when it is plural-only (`λεφτά` "money" had gone to `λεφτάς`
    # "moneybags"): given to every noun, it handed the plural of `παιδί` "child" to
    # `παιδιά` "game".  Never against a verb's cell, the Hindi lesson.
    pos_of = {k: {e['pos'] for e in L['entries']} for k, L in lemmas.items()}
    for surf in list(claims):
        if surf not in lemmas or len(claims[surf]) < 2 or surf in contractions:
            continue
        nouns = [e for e in lemmas[surf]['entries'] if e['pos'] == 'noun']
        if not nouns:
            continue
        rivals = claims[surf] - {surf}
        plural_only = any(e['gender'].endswith('p') for e in nouns)
        if all(pos_of[r] <= ({'adj', 'noun'} if plural_only else {'adj'}) for r in rivals):
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
        L.pop('cap', None)
        L.pop('cal', None)
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted((L for L in out.values() if 'entries' in L), key=lambda L: -L['freq'])[:80]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
