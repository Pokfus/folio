#!/usr/bin/env python3
"""Every Icelandic lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-is.jsonl` (the kaikki.org extraction of English Wiktionary's
Icelandic entries, CC BY-SA 4.0) and `is_full.txt` (hermitdave/FrequencyWords,
OpenSubtitles 2018, CC BY-SA 4.0) and writes `lex.json`.  Level-independent:
built once and kept.  The Norwegian extract (`.claude/norwegian/extract.py`)
adapted; what differs is said here.

THE TABLES ARE CLEAN AND TAGGED.  An Icelandic noun carries its whole
declension -- four cases, two numbers, indefinite and definite (`hestur`,
`hestinn`, `hestinum`, `hestsins` ...) -- each cell tagged, so a form is read by
its tags.  Only the FIRST table is kept (`ég`'s page goes on to tabulate every
personal pronoun).  A verb's head line gives its principal parts -- the past
("he") form, the past plural and the supine (`fór`, `fóru`, `farið`) -- and
then its past participle declined, but NO PRESENT TENSE: the extraction carries
no conjugation table for Icelandic.  The present is read instead off the
FORM-OF ENTRIES Wiktionary writes for the commoner verbs ("fer: first-person
singular present indicative of fara"): each such entry becomes a row of its
lemma's table (`FORM_OF_POS`), tagged as Wiktionary tags the sense.  A verb with
no such entries shows no present, rather than a guessed one.

THE PRESENT TENSE FROM BÍN.  Where the Database of Icelandic Morphology
(Beygingarlýsing íslensks nútímamáls, the Árni Magnússon Institute for Icelandic
Studies, author and editor Kristín Bjarnadóttir, https://bin.arnastofnun.is,
CC BY-SA 4.0; `SHsnid.csv`, the basic format) has the verb, its six present
indicative forms and its imperative are taken from there instead (`bin_verbs`),
tagged `bin`, and the form-of rows of the present are dropped.  A lemma BÍN lists
more than once is matched by its past: the BÍN entry whose "he" past is
Wiktionary's.  Its other finite forms -- the past and subjunctive in every
person, the question forms (`ertu` "are you", `ferðu`) -- are not shown, but are
kept as `x`, forms that CLAIM their spelling for the lemma's count and that a
sentence may match: `væri` and `ertu` are among the commonest words of the
subtitles, and they are `vera`'s.  That is the only use made of BÍN: no
meaning, gender or noun form is read from it.

THE SUBTITLE LIST IS MIS-ENCODED and its words are mapped back before counting
(`isl.subs_fold`): `ađ` and `að` are one word.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS; a lemma's frequency
here is the sum of the counts of every form its table lists, plus every entry
that says it is a form of it.  A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED
TWICE, in proportion to what each earns from the forms it holds alone, plus one,
over two rounds, with Norwegian's exceptions (a closed-class word's own
spelling is its own except against a common verb; a noun's headword is its own
against an adjective's form).  UNLIKE NORWEGIAN, a form-of entry claims its
spelling even where the spelling is also a lemma of its own: `er` is "which"
(a relative pronoun) and "of a place" (a conjunction), and it is also the
present of `vera` "to be", which is what the subtitles' 270,000 `er` are.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name, and no capitalised headword (Icelandic
writes its days, months and languages in lower case).  An entry whose every
sense is a form or an alternative spelling of another word is not a lemma -- its
count reaches the lemma it points to, and the object pronouns (`mig`, `þig`),
which Wiktionary files as forms of the subject, are kept as pointers the
inventory may name.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from isl import fold, nfc, is_icelandic, subs_fold

DUMP, FREQ, OUT, BIN = 'kaikki-is.jsonl', 'is_full.txt', 'lex.json', 'SHsnid.csv'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'article', 'postp'}

CAL = set('janúar febrúar mars apríl maí júní júlí ágúst september október nóvember '
          'desember sunnudagur mánudagur þriðjudagur miðvikudagur fimmtudagur föstudagur '
          'laugardagur'.split())

# AN ENTRY THE EXTRACTION LOST (none found yet for Icelandic; Norwegian's and Swedish's `i`
# was missing, Icelandic's `í` "in" is present).
SUPPLEMENT = {}

# A SPELLING WHOSE COUNT IS THE CLOSED-CLASS WORD'S, whatever else shares it: `það` "it",
# `þá` "then", `því` "because" and `þess` are also cases of the demonstrative `sá` "that",
# and `sá` is also a verb ("to sow"; the past of sjá), so the closed-class rule's common-verb
# exception handed `sá` a share of all four -- it was dealt third, above `að` and `þú`.
OWN = {'það', 'þá', 'því', 'þess'}

# A form-of entry of one of these parts of speech becomes a row of its lemma's table (the
# verbs' present tense, which the extraction carries in no table).
FORM_OF_POS = {'verb'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'offensive', 'nonstandard',
        'misspelling', 'literary', 'euphemistic'}

# a form row with one of these is not a form of THIS word
NOT_FORM = {'alternative', 'canonical', 'table-tags', 'inflection-template',
            'error-unrecognized-form', 'romanization', 'class', 'archaic', 'obsolete'}
RARE_CELL = {'archaic', 'dated', 'rare', 'obsolete', 'dialectal'}


def gender_of(e):
    """'m', 'f', 'n', or 'p' (plural only): the declension table's own gender row, else the
    head line's (`hestur m (genitive singular hests ...)`), else the senses' tags."""
    for f in e.get('forms') or []:
        if 'table-tags' in (f.get('tags') or []) and f.get('form') in ('masculine', 'feminine', 'neuter'):
            return f['form'][0]
    for h in e.get('head_templates') or []:
        m = re.match(r'^[^()]*? ([mfn])(?: (pl))?(?: \(|$)', h.get('expansion', '') or '')
        if m:
            return 'p' if m.group(2) else m.group(1)
    if any('plural-only' in (s.get('tags') or []) for s in e.get('senses') or []):
        return 'p'
    tags = collections.Counter(t for s in e.get('senses') or [] for t in s.get('tags') or []
                               if not s.get('form_of'))
    for g, t in (('n', 'neuter'), ('m', 'masculine'), ('f', 'feminine')):
        if tags[t]:
            return g
    return ''


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|eye dialect|'
                     r'misspelling|pronunciation spelling)\b.*\b(form|spelling) of\b', re.I)


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    return g


def sense_gloss(s, shown):
    gl = s.get('glosses') or []
    if not gl:
        return ''
    if len(gl) > 1:
        if gl[0] in shown:
            return ''
        shown.add(gl[0])
        return clean_gloss(gl[0])
    return clean_gloss(gl[-1])


def table_of(e):
    """The head line's forms (and the first conjugation table where one exists)."""
    rows, blocks = [], 0
    for f in e.get('forms') or []:
        tags = f.get('tags') or []
        if 'inflection-template' in tags:
            blocks += 1
            if blocks > 1:
                break
            continue
        if 'table-tags' in tags and blocks:
            # a second table with no template row (`no-table-tags`): kept, it is the same word's
            continue
        if set(tags) & NOT_FORM or not tags:
            continue
        fm = nfc(f.get('form', ''))
        if fm in ('-', '') or not is_icelandic(fm.replace(' ', '')) or fm.startswith('-') or fm.endswith('-'):
            continue
        row = {'f': fm, 't': tags}
        if row not in rows:
            rows.append(row)
    return rows


# BÍN's tags for the forms a card shows (present indicative, the imperative) ...
BIN_SHOW = {f'GM-FH-NT-{p}P-{n}': ['present', 'indicative', pp, nn, 'bin']
            for p, pp in (('1', 'first-person'), ('2', 'second-person'), ('3', 'third-person'))
            for n, nn in (('ET', 'singular'), ('FT', 'plural'))}
BIN_SHOW['GM-BH-ET'] = ['imperative', 'singular', 'bin']
# a MIDDLE-VOICE verb (`ferðast` "to travel", `komast` "to get there") is its own lemma in both
# Wiktionary and BÍN, conjugated in BÍN's MM- forms only: its MM- tags count as its GM- ones
MM = re.compile(r'^MM-')
# ... and the finite forms that only CLAIM (the past and subjunctive, the question forms)
BIN_CLAIM = re.compile(r'^(?:SP-)?GM-(?:FH|VH)-(?:NT|ÞT)-[123]P-(?:ET|FT)$|^GM-BH-')


def bin_verbs(verbs):
    """{lemma fold: {bin id: [(form, tag)]}} for the Wiktionary verbs, from BÍN."""
    out = collections.defaultdict(lambda: collections.defaultdict(list))
    if not os.path.exists(BIN):
        raise SystemExit(f'{BIN} is missing: run.py fetches it from bin.arnastofnun.is')
    for line in open(BIN, encoding='utf-8'):
        p = line.rstrip('\n').split(';')
        if len(p) != 6 or p[2] != 'so':
            continue
        k = fold(p[0])
        tag = MM.sub('GM-', p[5]) if k.endswith('st') else p[5]
        if k in verbs and (tag in BIN_SHOW or BIN_CLAIM.match(tag)):
            out[k][p[1]].append((nfc(p[4]), tag))
    return out


PERSON = ('first-person', 'second-person', 'third-person', 'singular', 'plural',
          'masculine', 'feminine', 'neuter')


SUBJECTS = {'ég', 'þú', 'hann', 'hún', 'það', 'við', 'þið', 'þeir', 'þær', 'þau'}


def verb_rows(rows):
    """A verb's rows without the subject pronouns some conjugation tables were extracted as
    (`skulu` lists `hann`, `hún`, `þeir` as cells, and `ég skal` with its pronoun)."""
    return [r for r in rows if ' ' not in r['f'] and fold(r['f']) not in SUBJECTS]


def own_person(rows, w):
    """A PERSONAL PRONOUN'S TABLE IS EVERY PERSONAL PRONOUN'S: Wiktionary's `l-self` table on
    `þú`, `mig`, `hann` tabulates ég, þú, hann, hún, það, við, þið, þeir, þær and þau alike, and
    every one of them would claim the others' counts.  Kept: the rows of the headword's own
    person, number and gender (`þú` -> þú, þig, þér, þín; `mig` -> ég, mig, mér, mín)."""
    if not any('personal' in r['t'] for r in rows):
        return rows
    me = next((r for r in rows if fold(r['f']) == fold(w) and 'personal' in r['t']), None)
    if not me:
        return [r for r in rows if 'personal' not in r['t']]
    if 'nominative' not in me['t']:
        return []          # an object pronoun's table is its subject's (`mig` is ég's)
    key = {t for t in me['t'] if t in PERSON}
    return [r for r in rows if 'personal' in r['t'] and {t for t in r['t'] if t in PERSON} == key]


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_icelandic(subs_fold(p[0])):
            k = subs_fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas, pointers, formonly, xrows = {}, [], {}, []
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if not is_icelandic(w) or w[:1] != w[:1].lower():
            continue
        senses = e.get('senses') or []
        if pos == 'name' and w in CAL:
            pos = 'noun'
        if pos not in KEEP_POS:
            continue
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_icelandic(tw):
                        pointers.append((fold(w), fold(tw)))
                        if pos in FORM_OF_POS and s.get('form_of'):
                            tg = sorted(set(s.get('tags') or []) - {'form-of'})
                            if not set(tg) & RARE_CELL:
                                xrows.append((fold(tw), pos, w, tg))
        if not real:
            # NOT A LEMMA -- kept as a pointer the inventory may name (`meg` -> `jeg`,
            # an alternative spelling -> its main one); the fill never takes one.
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            tg = alts or [nfc(t.get('word', '')) for s in senses for t in s.get('form_of') or []]
            if tg and is_icelandic(tg[0]):
                formonly.setdefault(fold(w), {
                    'word': w, 'alt_of': fold(tg[0]), 'kind': 'alt' if alts else 'form',
                    'pos': pos, 'note': (senses[0].get('glosses') or [''])[-1]})
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
        ent = {'pos': pos, 'etym': e.get('etymology_number', '') or '',
               'gender': gender_of(e) if pos == 'noun' else '', 'glosses': gl,
               'table': own_person(table_of(e), w) if pos == 'pron' else
               verb_rows(table_of(e)) if pos == 'verb' else table_of(e)}
        L = lemmas.setdefault(fold(w), {'word': w, 'entries': []})
        L['entries'].append(ent)
    # THE FORM-OF ENTRIES AS TABLE ROWS (the verbs' present tense): onto the lemma's first
    # entry of that part of speech, after its own rows, in the dump's order.
    for tgt, pos, w, tg in xrows:
        L = lemmas.get(tgt)
        if not L:
            continue
        ent = next((e for e in L['entries'] if e['pos'] == pos), None)
        if ent is None:
            continue
        row = {'f': w, 't': tg + ['form-of']}
        if row not in ent['table']:
            ent['table'].append(row)
    # THE PRESENT AND THE IMPERATIVE FROM BÍN, where it has the verb (matched by its past)
    vents = {k: next(e for e in L['entries'] if e['pos'] == 'verb') for k, L in lemmas.items()
             if any(e['pos'] == 'verb' for e in L['entries']) and ' ' not in k}
    bins = bin_verbs(set(vents))
    nbin = 0
    for k, ent in vents.items():
        cands = bins.get(k)
        if not cands:
            continue
        past = {fold(r['f']) for r in ent['table'] if {'past', 'third-person', 'singular'} <= set(r['t'])
                and 'form-of' not in r['t']}
        ids = sorted(cands)
        if len(ids) > 1:
            ids = [i for i in ids if any(t == 'GM-FH-ÞT-3P-ET' and fold(f) in past for f, t in cands[i])]
            if len(ids) != 1:
                continue
        rows = cands[ids[0]]
        ent['table'] = [r for r in ent['table'] if not ('form-of' in r['t'] and
                                                        ('present' in r['t'] or 'imperative' in r['t']))]
        for fm, tag in rows:
            if tag in BIN_SHOW:
                row = {'f': fm, 't': BIN_SHOW[tag]}
                if row not in ent['table']:
                    ent['table'].append(row)
        ent['x'] = sorted({fm for fm, tag in rows if BIN_CLAIM.match(tag)
                           and fold(fm) not in {fold(r['f']) for r in ent['table']}})
        nbin += 1
    print(f'  BÍN gave the present of {nbin} of {len(vents)} verbs')
    for k, L in SUPPLEMENT.items():
        if k not in lemmas:
            lemmas[k] = json.loads(json.dumps(L))
    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    verbs = {k for k, L in lemmas.items() if any(e['pos'] == 'verb' for e in L['entries'])}
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        if ' ' in k:
            continue
        for ent in L['entries']:
            for fm in ent.get('x', []):
                if ' ' not in fm:
                    claims[fold(fm)].add(k)
            for row in ent['table']:
                if ' ' in row['f'] or set(row['t']) & RARE_CELL:
                    continue
                # AN -S VERB OWNS ITS FORMS
                if ent['pos'] == 'verb' and 'passive' in row['t'] and fold(row['f']) in verbs \
                        and fold(row['f']) != k:
                    continue
                claims[fold(row['f'])].add(k)
    for surf, tgt in pointers:
        # unlike Norwegian, a pointer claims its spelling even where that spelling is a
        # lemma too (`er`, the present of vera)
        if tgt in lemmas and surf != tgt:
            claims[surf].add(tgt)
    pos_of = {k: {e['pos'] for e in L['entries']} for k, L in lemmas.items()}
    alone0 = collections.Counter()
    for surf, who in claims.items():
        if len(who) == 1:
            alone0[next(iter(who))] += counts.get(surf, 0)
    CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'article', 'postp'}
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 \
                and (any(e['pos'] in CLOSED for e in lemmas[surf]['entries'])
                     or all(e['pos'] == 'adj' and not e['table'] for e in lemmas[surf]['entries'])) \
                and not any(r in verbs and alone0[r] >= counts.get(surf, 0) / 10
                            for r in claims[surf] - {surf}):
            claims[surf] = {surf}
    for surf in OWN:
        claims[surf] = {surf}
    for surf in list(claims):
        if surf not in lemmas or len(claims[surf]) < 2 or 'noun' not in pos_of[surf]:
            continue
        rivals = claims[surf] - {surf}
        plural_only = any(e['gender'] == 'p' for e in lemmas[surf]['entries'] if e['pos'] == 'noun')
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
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    top = sorted((L for L in out.values() if 'entries' in L and ' ' not in L['word']),
                 key=lambda L: (-L['freq'], L['word']))[:200]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
