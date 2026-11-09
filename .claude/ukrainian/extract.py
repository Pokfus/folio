#!/usr/bin/env python3
"""Every Ukrainian lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-uk.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `uk_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS, and Ukrainian
spreads a noun over up to fourteen and a verb over thirty.  A lemma's frequency
is the sum of the counts of every form in its declension or conjugation table,
plus every entry that says it is a `form of` it.  A FORM SEVERAL LEMMAS SHARE
IS SPLIT, NOT COUNTED TWICE, in proportion to what each claimant earns from
the forms it holds alone, over two rounds -- the Russian rule (`.claude/torfl/`).
A closed-class word's own spelling is its own (the Hindi finding: an adverb has
no other form to earn a weight from, so it lost its spelling to any noun whose
oblique case it happens to be).

THE SUBTITLE LIST IS PART RUSSIAN.  Ukrainian subtitles are often machine- or
fan-made from Russian ones, and the list carries `что` (rank 12), `ты`, `это`
and `меня` beside their Ukrainian equivalents.  A form with a letter Ukrainian
does not have (ы э ъ ё) is dropped at the door (`uk.NOT_UK`); a Russian word
spelt only with shared letters (`он`, `как`, `нет`) can only reach a Ukrainian
lemma it collides with, and those are cut by hand in `select.EXCLUDE`, each with
its reason.  The list also drops the apostrophe (`пять` for `п'ять`), which
`uk.fold` drops on both sides.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name.  An entry whose every sense is a form or an
alternative spelling of another word is not a lemma; its count reaches the lemma
it points to.  Personal pronouns get their written-out paradigms
(`uk.PRONOUN_CASES`), since Wiktionary gives them one shared table.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uk import fold, nfc, is_ukrainian, NOT_UK, pronoun_forms

DUMP, FREQ, OUT = 'kaikki-uk.jsonl', 'uk_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'Russianism', 'Surzhyk', 'Galicia', 'Western', 'obscene', 'offensive'}
KEEP_TAGS = {'formal', 'informal', 'colloquial', 'figuratively', 'transitive', 'intransitive',
             'idiomatic', 'slang', 'familiar', 'perfective', 'imperfective', 'impersonal'}
SKIP_FORM_TAGS = {'table-tags', 'inflection-template', 'class', 'romanization',
                  'error-unrecognized-form'}

POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|'
                     r'eye dialect|misspelling)\b.*\b(form|spelling) of\b')


def is_formof(s):
    t = s.get('tags') or []
    if t and set(t) & set(AFFECT) and 'form-of' not in t:
        return False
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


AFFECT = {'diminutive': 'diminutive', 'endearing': 'affectionate', 'augmentative': 'augmentative'}


def affect_sense(s):
    """A DIMINUTIVE OR ENDEARING FORM IS A WORD A LEARNER LEARNS (`дідусь` "grandad",
    `бабуся`), but Wiktionary files it as a `form of` the base word, which would drop it.
    Such a sense becomes a real one, glossed with the base word's meaning as the entry
    itself gives it (`дід (did, "grandfather")`) and the kind in brackets."""
    t = set(s.get('tags') or [])
    kinds = [AFFECT[k] for k in AFFECT if k in t]
    if not kinds or 'form_of' not in s:
        return None
    m = re.search(r'“([^”]+)”', (s['form_of'][0].get('extra') or ''))
    if not m:
        return None
    out = {k: v for k, v in s.items() if k != 'form_of'}
    return dict(out, glosses=[f'{m.group(1)} ({kinds[0]})'], tags=sorted(t - {'form-of'}))


LETTER_NAME = re.compile(r'^The name of the (Cyrillic|Latin)|letter of the Ukrainian alphabet')
SYNONYM = re.compile(r'^synonym of [^“]*“([^”]+)”\)?$')


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    # "synonym of лі́кар m (líkar, “doctor”)" is a pointer that carries its meaning
    m = SYNONYM.match(g)
    if m:
        return m.group(1)
    # a letter's name (`о` "The name of the Cyrillic script letter О.") is not a word's meaning
    if LETTER_NAME.search(g):
        return ''
    return '' if POINTER.match(g) else g


def head_of(e):
    """The stressed headword: the head line's own (`кни́га • (knýha) f inan …`)."""
    w = nfc(e.get('word', ''))
    for h in e.get('head_templates') or []:
        x = nfc((h.get('expansion') or '').split(' • ')[0].strip())
        if x and fold(x) == fold(w):
            return x
    for f in e.get('forms') or []:
        if 'canonical' in (f.get('tags') or []) and fold(f.get('form', '')) == fold(w):
            return nfc(f['form'])
    return w


def gender_of(e):
    tags = set()
    for f in e.get('forms') or []:
        if 'canonical' in (f.get('tags') or []):
            tags |= set(f['tags'])
    for h in e.get('head_templates') or []:
        if 'plural only' in (h.get('expansion') or ''):
            tags.add('plural only')
        m = re.search(r'\)\s+((?:[mfn](?:-p)?(?: or [mfn])?)\b(?: (?:in)?an| pers)?)',
                      h.get('expansion') or '')
        if m:
            g = m.group(1)
            for k, v in (('m', 'masculine'), ('f', 'feminine'), ('n', 'neuter')):
                if re.search(r'\b' + k + r'\b', g):
                    tags.add(v)
            if 'pers' in g or re.search(r'\ban\b', g):
                tags.add('animate')
    for s in e.get('senses') or []:
        tags |= set(s.get('tags') or []) & {'masculine', 'feminine', 'neuter'}
    # A PLURALE TANTUM (`гро́ші`, `две́рі`) is labelled so; Wiktionary's `m` on гро́ші is the
    # gender of a singular that is no longer used.
    gs = ['plural only'] if 'plural only' in tags else \
        [g for g in ('masculine', 'feminine', 'neuter') if g in tags]
    return {'gender': '/'.join(gs), 'animate': 'animate' in tags or 'person' in tags}


def aspect_of(e):
    asp, partner = '', []
    for f in e.get('forms') or []:
        t = f.get('tags') or []
        if f.get('source'):
            continue
        if 'canonical' in t:
            asp = 'perfective' if 'perfective' in t else 'imperfective' if 'imperfective' in t else ''
        elif t in (['perfective'], ['imperfective']) and is_ukrainian(f.get('form', '')):
            partner.append(nfc(f['form']))
    if not asp:
        for h in e.get('head_templates') or []:
            a = (h.get('args') or {}).get('2', '')
            asp = {'impf': 'imperfective', 'pf': 'perfective', 'both': 'both'}.get(a, '')
    return asp, partner


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_ukrainian(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas, pointers, formonly = {}, [], {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_ukrainian(w):
            continue
        senses = [affect_sense(s) or s for s in e.get('senses') or []]
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_ukrainian(tw):
                        pointers.append((fold(w), fold(tw)))
        if not real:
            # NOT A LEMMA -- but an ALTERNATIVE SPELLING is kept as a pointer, so an
            # inventory word written the common way resolves to its entry.
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_ukrainian(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'head': head_of(e), 'alt_of': fold(alts[0])})
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK), 'tags': sorted(tags & KEEP_TAGS)})
        table = []
        pf = pronoun_forms(w) if pos == 'pron' else None
        if pf is None:
            for f in e.get('forms') or []:
                t = f.get('tags') or []
                if f.get('source') not in ('declension', 'conjugation', 'inflection'):
                    continue
                if set(t) & SKIP_FORM_TAGS or set(t) & WEAK:
                    continue
                fm = nfc(f.get('form', ''))
                if not is_ukrainian(fm):
                    continue
                table.append({'f': fm, 't': t})
            # A TABLE THAT DOES NOT CONTAIN ITS OWN HEADWORD IS ANOTHER WORD'S: Wiktionary's
            # `озимина` "winter crops" carries the forms of `мама`, and claimed its count.
            if table and fold(w) not in {fold(r['f']) for r in table}:
                table = []
        else:
            table = [{'f': x, 't': ['pronoun-case']} for x in pf]
        g = gender_of(e)
        asp, partner = aspect_of(e) if pos == 'verb' else ('', [])
        ent = {'pos': pos, 'etym': e.get('etymology_number', ''), 'head': head_of(e),
               'gender': g['gender'] if pos == 'noun' else '', 'animate': g['animate'],
               'aspect': asp, 'partner': partner, 'glosses': gl, 'table': table,
               'comparative': [nfc(f['form']) for f in e.get('forms') or []
                               if (f.get('tags') or []) == ['comparative'] and is_ukrainian(f['form'])]}
        lemmas.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append(ent)
    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        claims[k].add(k)
        for ent in L['entries']:
            for row in ent['table']:
                if ' ' in k and ' ' not in row['f']:
                    continue
                # an analytic form (`бу́ду роби́ти`, `найбі́льш нови́й`) claims none of its words
                if ' ' in row['f'] and ' ' not in k:
                    continue
                claims[fold(row['f'])].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj'}
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 \
                and any(e['pos'] in CLOSED for e in lemmas[surf]['entries']):
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
            L['formonly'] = True
            out[k] = L
    for k, L in lemmas.items():
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    top = sorted(out.values(), key=lambda L: -L['freq'])[:80]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
