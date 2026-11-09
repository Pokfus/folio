#!/usr/bin/env python3
"""Every Dutch lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-nl.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `nl_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS: a verb spreads
over `eet`, `eten`, `at`, `aten`, `gegeten`, an adjective over `groot`, `grote`,
`groter`, `grootst`, a noun over its plural and diminutive.  A lemma's
frequency here is the sum of the counts of every form Wiktionary lists for it
-- its conjugation or declension table, the plural and diminutive on a noun's
headword line, the comparative and superlative on an adjective's -- plus every
entry that says it is a form of it.

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- the Russian, Hindi and
Greek rule: each shared form's count is divided among its claimants in
proportion to what each earns from the forms it holds alone, plus one, over two
rounds.  Two exceptions, each carried over from the Greek pipeline:
  · AN INDECLINABLE WORD'S OWN SPELLING IS ITS OWN: `goed` "well" (adverb) is
    not split away, `dat` the conjunction keeps its spelling;
  · A NOUN'S OWN HEADWORD IS ITS OWN against an adjective's inflected cell, and
    AN ADJECTIVE'S against a verb's (`klaar` "ready" against the imperative of
    `klaren` "to finish", which had dealt `klaren` into A1).  NEVER a noun's
    against a verb's cell, Greek's and Hindi's lesson again: a Dutch verb's stem
    is its first person and its imperative, and Wiktionary files most of them as
    nouns too (`kijk` "view", `vraag` "question", `hoop` "hope"), so the rule
    dealt `kijk`, `zeg`, `wacht` and `geef` into A1 with the verbs' counts.

A SEPARABLE VERB'S MAIN-CLAUSE FORMS ARE TWO WORDS (`sta op`), which a list of
single words cannot count; it earns only its joined forms (`opstaan`, `opstond`,
`opgestaan`), so it is under-ranked, and an everyday one belongs in the
inventory (`opstaan` is there).

All matching goes through `nl.fold` (NFC, lower case), which KEEPS the accents,
so `één` "one" and `een` "a" stay apart.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name.  An entry whose every sense is a form or an
alternative spelling of another word is not a lemma -- its count reaches the
lemma it points to.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nl import fold, nfc, is_dutch, ipa_of

DUMP, FREQ, OUT = 'kaikki-nl.jsonl', 'nl_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'article'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'offensive', 'nonstandard',
        'misspelling', 'literary', 'euphemistic', 'Belgium', 'Flanders', 'Suriname',
        'Brabant', 'Limburg', 'Holland', 'Southern', 'ethnic', 'slur', 'nautical'}

# a table cell with one of these is a real form, but too rare to claim a count from a commoner word
RARE_CELL = {'archaic', 'dated', 'rare', 'obsolete', 'dialectal', 'majestic', 'subjunctive'}

LANG_NAMES = {'Nederlands', 'Engels'}

GENDER_ARGS = {'m': 'm', 'f': 'f', 'n': 'n', 'c': 'c', 'p': 'p'}


def gender_of(e):
    """'m' 'f' 'n' 'c' (common), two of them ('mf', 'mn'), or 'p' (plural only)."""
    for h in e.get('head_templates') or []:
        if h.get('name') != 'nl-noun':
            continue
        a = (h.get('args') or {}).get('1', '') or ''
        if a == 'mfbysense':
            return 'mf'
        gs = [GENDER_ARGS[x] for x in re.split(r'[,\s]+', a.replace('mf', 'm,f')) if x in GENDER_ARGS]
        out = ''
        for g in gs:
            if g not in out:
                out += g
        return out[:2]
    tags = collections.Counter(t for s in e.get('senses') or [] for t in s.get('tags') or [])
    gs = [g for g, t in (('m', 'masculine'), ('f', 'feminine'), ('n', 'neuter'),
                         ('c', 'common')) if tags[t]]
    return ''.join(gs[:2])


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|superseded|'
                     r'eye dialect|misspelling|pre-\d+ spelling)\b.*\b(form|spelling) of\b', re.I)


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', (g or '').split('\nNote:')[0]).strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    return g


def sense_gloss(s, shown):
    """A sense's gloss.  A NESTED sense (["to go", "to travel"]) is given as its
    parent once, its children then saying nothing new; a top-level sense as its own."""
    gl = s.get('glosses') or []
    if not gl:
        return ''
    if len(gl) > 1:
        if gl[0] in shown:
            return ''
        shown.add(gl[0])
        return clean_gloss(gl[0])
    return clean_gloss(gl[-1])


HEAD_TAGS = ('plural', 'diminutive', 'comparative', 'superlative')


def make_entry(e, pos, real):
    """One entry, compacted: its glosses, its table cells, its headword-line forms."""
    gl, shown = [], set()
    for s in real:
        tags = set(s.get('tags') or [])
        g = sense_gloss(s, shown)
        if g:
            gl.append({'g': g, 'weak': bool(tags & WEAK),
                       'tags': sorted(tags & {'formal', 'informal', 'colloquial', 'figuratively',
                                              'transitive', 'intransitive', 'idiomatic', 'slang',
                                              'familiar', 'plural', 'in-plural', 'reflexive'})})
    table = []
    for f in e.get('forms') or []:
        fm = nfc(f.get('form', ''))
        tags = f.get('tags') or []
        if f.get('source') in ('declension', 'conjugation', 'inflection') and is_dutch(fm) \
                and 'table-tags' not in tags and 'inflection-template' not in tags:
            table.append({'f': fm, 't': tags})
    head = {}
    for f in e.get('forms') or []:
        if f.get('source'):
            continue
        fm = nfc(f.get('form', ''))
        for t in f.get('tags') or []:
            if t in HEAD_TAGS and is_dutch(fm) and t not in head:
                head[t] = fm
    ent = {'pos': pos, 'etym': str(e.get('etymology_number', '') or ''), 'ipa': ipa_of(e),
           'gender': gender_of(e) if pos == 'noun' else '', 'glosses': gl,
           'table': table, 'head': head}
    return ent


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_dutch(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lower = set()            # every lower-case headword, folded
    for line in open(DUMP, encoding='utf-8'):
        w = nfc(json.loads(line).get('word', ''))
        if w[:1] == w[:1].lower() and is_dutch(w):
            lower.add(fold(w))
    lemmas = {}              # fold(word) -> {word, entries:[...]}
    pointers = []            # (surface fold, target fold) from form-of entries
    formonly = {}
    caps = {}                # a capitalised headword a lower-case one shadows
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        # A LANGUAGE'S NAME is filed as a proper name; the two the A1 inventory teaches are
        # kept as the neuter nouns they are (het Nederlands, het Engels)
        if pos == 'name' and w in LANG_NAMES:
            pos = 'noun'
            e = dict(e, head_templates=[{'name': 'nl-noun', 'args': {'1': 'n'}}])
        if pos not in KEEP_POS or not is_dutch(w):
            continue
        # A CAPITALISED headword (`Nederlands`, `Engels`) is kept only where no
        # lower-case headword folds the same: `Was` is not `was`.
        cap = w[:1] != w[:1].lower()
        have = lemmas.get(fold(w))
        if cap and (fold(w) in lower or (have and not have.get('cap'))):
            # ...but kept under its OWN spelling (`=Engels`), where the inventory asks
            # for it by a capital: `Engels` "English" is not `engels`, a unit of mass
            caps.setdefault(w, []).append(dict(e, pos=pos))
            continue
        if have and have.get('cap') and not cap:
            del lemmas[fold(w)]
        senses = e.get('senses') or []
        # A PRONOUN'S OR DETERMINER'S FORM IS A WORD A BEGINNER LEARNS AS ONE: `ze`, `we`
        # and `me` are filed as "unstressed form of zij", `dit` as "neuter singular of
        # deze", and each is taught on a card of its own, its gloss naming its full form.
        closed_form = pos in ('pron', 'det', 'article')
        real = [s for s in senses if (closed_form or not is_formof(s)) and s.get('glosses')]
        for s in senses:
            # an ABBREVIATION's surface is not a form of its word: `m` "masculine" would
            # hand `mannelijk` the count of `'m` "him"
            if set(s.get('tags') or []) & {'abbreviation', 'initialism', 'clipping', 'acronym'}:
                continue
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_dutch(tw):
                        pointers.append((fold(w), fold(tw)))
        if not real:
            # NOT A LEMMA -- but an ALTERNATIVE SPELLING is kept as a pointer for the
            # inventory; the fill never takes one, `select.py` resolves through it.
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_dutch(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0])})
            continue
        ent = make_entry(e, pos, real)
        L = lemmas.setdefault(fold(w), {'word': w, 'entries': []})
        if cap:
            L['cap'] = True
        L['entries'].append(ent)
    for k, L in lemmas.items():
        # a MULTI-WORD lemma (tot ziens) is not in a list of single words; it is dealt
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
            for fm in ent['head'].values():
                if ' ' not in fm:
                    claims[fold(fm)].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'article'}
    for surf in list(claims):
        # (only for an entry with a meaning that is not rare or archaic: `hou` "loyal", an
        # archaic adjective with no table, had taken the whole count of `houden`'s `hou`)
        live = [e for e in lemmas[surf]['entries'] if any(not g['weak'] for g in e['glosses'])] \
            if surf in lemmas else []
        if surf in lemmas and len(claims[surf]) > 1 and live \
                and (any(e['pos'] in CLOSED for e in live)
                     or all(e['pos'] == 'adj' and not e['table'] for e in live)):
            claims[surf] = {surf}
    pos_of = {k: {e['pos'] for e in L['entries']} for k, L in lemmas.items()}
    for surf in list(claims):
        if surf not in lemmas or len(claims[surf]) < 2:
            continue
        rivals = claims[surf] - {surf}
        if 'noun' in pos_of[surf] and all(pos_of[r] <= {'adj'} for r in rivals):
            claims[surf] = {surf}
        elif 'adj' in pos_of[surf] and all(pos_of[r] <= {'verb'} for r in rivals):
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
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    # a SHADOWED capitalised headword, keyed `=Word`: never in the fill, and dealt by the
    # count of its lower-case spelling (the subtitles do not tell `Engels` from `engels`)
    for w, es in caps.items():
        ents = []
        for e in es:
            real = [s for s in e.get('senses') or [] if not is_formof(s) and s.get('glosses')]
            if real:
                ents.append(make_entry(e, e['pos'], real))
        if ents:
            out['=' + w] = {'word': w, 'entries': ents, 'freq': out.get(fold(w), {}).get('freq', 0),
                            'own': counts.get(fold(w), 0), 'formonly': True}
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted((L for L in out.values() if 'entries' in L), key=lambda L: -L['freq'])[:100]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
