#!/usr/bin/env python3
"""Every Danish lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-da.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `da_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.
Swedish's extractor (`.claude/swedish/extract.py`) adapted; the plan is
`docs/danish-decks-plan.md`.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Danish spreads
a word over several: a noun over its indefinite and definite forms in both
numbers (`hus`, `huset`, `huse`, `husene`), an adjective over its neuter and
its e-form (`stor`, `stort`, `store`), a verb over its present, past and
participle, the past often on another stem (`gå`, `går`, `gik`, `gået`).  A
lemma's frequency here is the sum of the counts of every form Wiktionary lists
for it -- its declension or conjugation table, plus every entry that says it
is a form of it ("present tense of skulle").

WHERE DANISH WIKTIONARY KEEPS ITS FORMS (read off the extract, 2026-11-15):
  · a NOUN and a VERB have a table, as in Swedish -- but the verb's past
    participle is written as one cell with its auxiliary, `(have /havde)
    spist`, `(er /var) gået`, which is split here into the participle and the
    auxiliary it takes (`aux-have`, `aux-være`);
  · an ADJECTIVE's table is unreadable (its cells are tagged
    `error-unrecognized-form`) and a PRONOUN has none, so for both the forms
    on the HEADWORD LINE are the table (`stort`, `store`, `større`, `størst`;
    `mig`, `min`).

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- Swedish's rules,
each kept: a closed-class word's own spelling is its own except against a
common verb (`var` "was" and "where"); a noun's own headword is its own
against an adjective's cell; an -s verb owns its forms (`findes`, `synes`,
`mødes` are deponent verbs of their own, and `finde`, `syne`, `møde` list the
same spellings as their passives); a plural-only noun's headword is its own.
And one of Danish's own: A VERB'S IMPERATIVE CLAIMS NOTHING WHERE ANOTHER LEMMA
HEADS THE SPELLING.  It is the bare stem, and the stem is constantly another word -- `men` "but" (of `mene`), `far`
"father" (of `fare`), `end` "than" (of `ende`), `klar` "clear" (of `klare`);
claiming, `mene` was dealt as the 17th commonest word of the language and
`fare` above `far`.  The cost is the other way: where the imperative is the
commoner use (`tag` "take!" against the noun "roof", `lad` "let!" against the
adjective "lazy"), the other lemma takes the count, and `select.EXCLUDE` keeps
it out of the fill.
And where a closed-class word's spelling IS shared with a common verb (`så`
"so, then" and the past of `se` "saw"; `ved` "at, by" and the present of
`vide` "knows"), Swedish's split by what each earns alone handed the closed
word -- which earns nothing alone -- almost nothing: `så` was dealt 497th of
A1's 500.  Here THE CLOSED WORD TAKES HALF and the verbs split the other half,
a plain guess stated as one, which puts both near where a reader meets them.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name, and no capitalised headword (Danish writes
its days, months and languages in lower case, so a capital is a name or an
abbreviation) -- except the pronoun `I` "you (plural)", which Danish always
writes with a capital, kept under the key `I` (`da.fold`).
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from da import fold, nfc, is_danish

DUMP, FREQ, OUT = 'kaikki-da.jsonl', 'da_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'article', 'postp'}

# The days and months, should Wiktionary file one as a proper name: Danish writes them in
# lower case, so they are kept as nouns.
CAL = set('januar februar marts april maj juni juli august september oktober november '
          'december mandag tirsdag onsdag torsdag fredag lørdag søndag'.split())

# AN ENTRY THE EXTRACTION LOST.  English Wiktionary's page for `i` is a "mammoth page"
# whose languages live on subpages, and kaikki.org's extract (read 2026-11-15) carries
# no Danish `i` at all -- the commonest preposition of the language.  Its senses here
# are copied from the Danish section of that subpage, `i/languages A to L`, read the
# same day (CC BY-SA 4.0); the exponent sense is left out, and the dialectal adverb
# "always" (etymology 2) with it, as the WEAK rule would leave it.
SUPPLEMENT = {
    'i': {'word': 'i', 'entries': [{
        'pos': 'prep', 'etym': '1', 'gender': '', 'head': {}, 'table': [],
        'glosses': [{'g': g, 'weak': False, 'tags': []} for g in (
            'in, inside',
            'for (a duration: i tre år, "for three years")',
            'to (telling the time: fem minutter i tolv, "five minutes to twelve")',
            'on, last (a past day: i mandags, "on Monday, last Monday")')]}]},
}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'offensive', 'nonstandard',
        'misspelling', 'literary', 'euphemistic', 'proscribed', 'Jutland', 'Bornholm'}

# a table cell with one of these is a real form, but too rare to claim a count from a commoner word
RARE_CELL = {'archaic', 'dated', 'rare', 'obsolete', 'dialectal', 'subjunctive'}

# the table's own scaffolding rows, which are not forms
SCAFFOLD = {'table-tags', 'inflection-template', 'class'}

# the person, number and gender tags that pick a personal pronoun's row out of the shared table
PRON_KEY = ('first-person', 'second-person', 'third-person', 'singular', 'plural', 'masculine',
            'feminine', 'common-gender', 'neuter', 'gender-neutral', 'reflexive')


def gender_of(e):
    if any('plural-only' in (s.get('tags') or []) for s in e.get('senses') or []) and \
            not any(h.get('name') == 'da-noun' for h in e.get('head_templates') or []):
        return 'p'
    for h in e.get('head_templates') or []:
        a = h.get('args') or {}
        # the gender is the `head` template's g; `da-noun`'s first argument is its
        # declension class (en, et, n, r ...), never a gender
        g = a.get('g', '')
        pl = 'p' if g.endswith('-p') or g == 'p' else ''      # a plural-only noun (penge)
        g = g.split('-')[0]
        if g in ('c', 'n'):
            g2 = (a.get('g2') or '').split('-')[0]
            return (g + g2 if g2 in ('c', 'n') and g2 != g else g) + pl
        if pl:
            return 'p'
    if any('plural-only' in (s.get('tags') or []) for s in e.get('senses') or []):
        return 'p'                                            # a plural-only noun filed as a "noun form"
    tags = collections.Counter(t for s in e.get('senses') or [] for t in s.get('tags') or [])
    gs = [g for g, t in (('c', 'common-gender'), ('n', 'neuter')) if tags[t]]
    return ''.join(gs[:2])


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|eye dialect|'
                     r'misspelling|pronunciation spelling)\b.*\b(form|spelling) of\b')
CONTRACTION = re.compile(r'^(?:contraction|clipping) of (\S+)')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    return g


def sense_gloss(s, shown):
    """A sense's gloss.  A NESTED sense (["to be", "to exist"]) is given as its
    parent ("to be") once, its children then saying nothing new; a top-level
    sense as its own text."""
    gl = s.get('glosses') or []
    if not gl:
        return ''
    if len(gl) > 1:
        if gl[0] in shown:
            return ''
        shown.add(gl[0])
        return clean_gloss(gl[0])
    return clean_gloss(gl[-1])


AUXW = r'(?:have|havde|er|var)'
PARTICIPLE = re.compile(rf'^\(({AUXW}(?: ?/ ?{AUXW})*)\) (\S+)$')
HEAD_SKIP = {'alternative', 'canonical', 'dialectal', 'archaic', 'obsolete', 'rare', 'table-tags',
             'inflection-template', 'romanization', 'perfect', 'infinitive'}


def table_of(e):
    """The FIRST inflection table only (Wiktionary sometimes adds a second, dialectal
    one) -- except a VERB's, whose table is always two boxes, the finite forms and
    the participles; cutting the second lost every participle.  A verb's past
    participle cell, `(have /havde) spist`, `(have /havde /er /var) fulgt`, is split
    into the participle and its auxiliaries.  An ADJECTIVE's and a PRONOUN's table is the forms
    of its headword line (the module docstring says why)."""
    rows, blocks = [], 0
    if e.get('pos') in ('adj', 'pron', 'det'):
        for f in e.get('forms') or []:
            tags = f.get('tags') or []
            fm = nfc(f.get('form', ''))
            if f.get('source') or set(tags) & HEAD_SKIP or not is_danish(fm):
                continue
            rows.append({'f': fm, 't': tags})
        return rows
    for f in e.get('forms') or []:
        if f.get('source') not in ('declension', 'conjugation', 'inflection'):
            continue
        tags = f.get('tags') or []
        if 'inflection-template' in tags:
            blocks += 1
            if blocks > 1 and e.get('pos') != 'verb':
                break
            continue
        if set(tags) & SCAFFOLD:
            continue
        fm = nfc(f.get('form', ''))
        m = PARTICIPLE.match(fm)
        if m:
            aux = m.group(1)
            fm = m.group(2)
            aw = set(re.findall(r'\w+', aux))
            tags = tags + (['aux-have'] if aw & {'have', 'havde'} else []) + \
                (['aux-være'] if aw & {'er', 'var'} else [])
        if fm in ('-', '') or not is_danish(fm):
            continue
        rows.append({'f': fm, 't': tags})
    return rows


def pron_row(word, table):
    """A personal pronoun's own row of the shared table: the person, number and gender
    of the cell that IS the headword, then every cell carrying exactly those."""
    me = [r for r in table if fold(r['f']) == fold(word) and 'nominative' in r['t']] or \
         [r for r in table if fold(r['f']) == fold(word)]
    if not me:
        return []
    key = {t for t in me[0]['t'] if t in PRON_KEY}
    return [r for r in table if {t for t in r['t'] if t in PRON_KEY} == key]


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_danish(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas = {}              # fold(word) -> {word, entries:[...]}
    pointers = []            # (surface fold, target fold, kind) from form-of entries
    contractions = {}
    formonly = {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if not is_danish(w) or (w[:1] != w[:1].lower() and not (w == 'I' and pos == 'pron')):
            continue
        senses = e.get('senses') or []
        if pos == 'contraction':
            for s in senses:
                m = CONTRACTION.match((s.get('glosses') or [''])[-1])
                if m and is_danish(m.group(1)):
                    contractions.setdefault(fold(w), fold(m.group(1)))
            continue
        if pos == 'name' and w in CAL:
            pos = 'noun'
        if pos not in KEEP_POS:
            continue
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_danish(tw):
                        pointers.append((fold(w), fold(tw), 'alt' if 'alt_of' in s else 'form'))
        if not real:
            # NOT A LEMMA -- but an ALTERNATIVE SPELLING is kept as a pointer for the
            # inventory; the fill never takes one, `select.py` resolves through it.
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_danish(alts[0]):
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
                                                  'familiar', 'plural', 'in-plural', 'reflexive'})})
        table = table_of(e)
        personal = pos == 'pron' and sum(1 for r in table if 'personal' in r['t']) > 8
        if personal:
            table = pron_row(w, table)
        head_forms = {}
        for f in e.get('forms') or []:
            if f.get('source'):
                continue
            for t in f.get('tags') or []:
                if t in ('present', 'past', 'perfect', 'participle', 'imperative', 'comparative',
                         'superlative', 'neuter', 'plural', 'definite') \
                        and (is_danish(f.get('form', '')) or t == 'perfect') and t not in head_forms:
                    head_forms[t] = nfc(f['form'])
        ent = {'pos': pos, 'etym': e.get('etymology_number', '') or '',
               'gender': gender_of(e) if pos == 'noun' else '', 'glosses': gl,
               'table': table, 'head': head_forms}
        if personal:
            ent['personal'] = True
        L = lemmas.setdefault(fold(w), {'word': w, 'entries': []})
        L['entries'].append(ent)
    for k, L in SUPPLEMENT.items():
        if k not in lemmas:
            lemmas[k] = json.loads(json.dumps(L))
    for k, L in lemmas.items():
        # a MULTI-WORD lemma (holde af) is not in a list of single words; it is dealt
        # by its rarest word's count, halved, so it sits near its words.
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    # which lemmas claim which surface
    verbs = {k for k, L in lemmas.items() if any(e['pos'] == 'verb' for e in L['entries'])}
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        if ' ' in k:
            continue
        for ent in L['entries']:
            sverb = ent['pos'] == 'verb' and any(
                fold(r['f']) in verbs and fold(r['f']) != k
                for r in ent['table'] if {'infinitive', 'passive'} <= set(r['t']))
            for row in ent['table']:
                if ' ' in row['f'] or set(row['t']) & RARE_CELL:
                    continue
                if sverb and 'passive' in row['t']:
                    continue
                if 'imperative' in row['t'] and ent['pos'] == 'verb' \
                        and fold(row['f']) != k and fold(row['f']) in lemmas:
                    continue
                claims[fold(row['f'])].add(k)
    # a form-of entry's pointer claims only a spelling NO table lists: the tables are
    # the authority, and a pointer would undo the -s verb rule (`finns` is filed as
    # "present passive of finna" as well as being a cell of `finnas`)
    for surf, tgt, kind in pointers:
        if tgt in lemmas and surf not in lemmas and surf not in claims:
            claims[surf].add(tgt)
    for surf, tgt in contractions.items():
        if tgt in lemmas:
            claims[surf] = {tgt}
    pos_of = {k: {e['pos'] for e in L['entries']} for k, L in lemmas.items()}
    # A CLOSED-CLASS WORD'S OWN SPELLING IS ITS OWN, unless a common verb shares it.
    alone0 = collections.Counter()
    for surf, who in claims.items():
        if len(who) == 1:
            alone0[next(iter(who))] += counts.get(surf, 0)
    CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'article', 'postp'}
    halves = set()
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 and surf not in contractions \
                and (any(e['pos'] in CLOSED for e in lemmas[surf]['entries'])
                     or all(e['pos'] == 'adj' and not e['table'] for e in lemmas[surf]['entries'])) \
                and not any(r in verbs and alone0[r] >= counts.get(surf, 0) / 10
                            for r in claims[surf] - {surf}):
            claims[surf] = {surf}
        elif surf in lemmas and len(claims[surf]) > 1 and surf not in contractions \
                and any(e['pos'] in CLOSED for e in lemmas[surf]['entries']):
            halves.add(surf)
    # A NOUN'S OWN HEADWORD IS ITS OWN against an adjective's inflected cell (the Greek rule).
    for surf in list(claims):
        if surf not in lemmas or len(claims[surf]) < 2 or surf in contractions:
            continue
        if 'noun' not in pos_of[surf]:
            continue
        rivals = claims[surf] - {surf}
        plural_only = any(e['gender'].endswith('p') for e in lemmas[surf]['entries']
                          if e['pos'] == 'noun')
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
            if surf in halves:
                # HALF TO THE CLOSED WORD, the rest split among the verbs (see below)
                nxt[surf] += c / 2
                c, who = c / 2, who - {surf}
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
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    top = sorted((L for L in out.values() if 'entries' in L and ' ' not in L['word']), key=lambda L: (-L['freq'], L['word']))[:150]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
