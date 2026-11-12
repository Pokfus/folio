#!/usr/bin/env python3
"""Every Hebrew lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-he.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `he_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and writes `lex.json`, keyed by the folded full spelling
(`he.fold`).  Level-independent: built once and kept.

ONE KEY, SEVERAL WORDS.  Unpointed Hebrew is full of homographs: `ספר` is
sefer "book", safar "he counted", sapar "barber" and sfar "border"; `כתב` is
katav "he wrote", ktav "handwriting" and katav "reporter".  Each is an ENTRY of
its own under the one key, with its own POINTED form (`p`) -- and a card
teaches ONE pointed word (`build_deck.entries_for`), never the noise.

A VERB IS FILED UNDER ITS PAST "HE" FORM (`כתב` katav, "he wrote"), as every
Hebrew dictionary and Wiktionary file it; the card shows the infinitive
(`לכתוב`) and the present beside it.

WHY A LEMMA FREQUENCY.  The subtitle list counts WORD FORMS -- `כתבתי`, `כותב`,
`יכתוב`, `לכתוב` for `כתב`, `ילדים`, `הילד` for `ילד` -- and joins the seven
prefix words to the word after them (`ובבית`, `שהוא`, `לילד`).  A lemma's
frequency is the sum of the counts of every surface that is one of its forms,
or, when the whole surface is no form of anything, one of its forms behind a
prefix chain (`he.strips`).  Wiktionary's tables are POINTED; the full spelling
each form is matched in is `plene` below.

A SURFACE SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- in proportion to
what each earns from the surfaces it holds alone, plus one, over two rounds
(the Russian pipeline's rule, `.claude/torfl/`, as Persian has it).  A
closed-class word's own spelling is its own: `לך` is "to you", not the
imperative of `הלך` "go!"; `של` is "of".

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
root, a letter, an affix or a proper name (but the country and its language,
NAME_OK).  An entry whose every sense is a form or an alternative spelling of
another word is not a lemma -- its count reaches the lemma it points to.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from he import fold, nfc, is_hebrew, unpoint, pointed, strips

DUMP, FREQ, OUT = 'kaikki-he.jsonl', 'he_full.txt', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'contraction', 'adv_phrase'}
CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'contraction'}

NAME_OK = {'ישראל', 'עברית', 'אנגלית', 'ירושלים', 'תל אביב',
           'ראש השנה', 'פורים', 'פסח', 'חנוכה', 'יום כיפור', 'סוכות'}   # A2's festivals (2026-11-12)

# THE MONTHS (A2, 2026-11-12).  Wiktionary files the twelve Gregorian months, which Israel uses day to day,
# as proper names; the sense "January (the first month of the Gregorian calendar …)" is kept, as a noun,
# and every other `name` entry of the spelling (יוני the given name Yoni) stays out.
MONTH = re.compile(r'^(January|February|March|April|May|June|July|August|September|October|November|December)\b')

# WORDS ONLY AN INVENTORY TEACHES (A2, 2026-11-12): the months, the festivals and the feminine numbers
# were let in for A2, and each claims nothing in the count -- its own spelling's count is its frequency,
# and the forms it shares go where they went before -- and the fill never deals one (`select.py`), so
# adding them changed no word, no order and no sentence of the shipped A1.
INVENTORY_ONLY = {'ראש השנה', 'פורים', 'פסח', 'חנוכה', 'יום כיפור', 'סוכות',
                  'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'תשע'}

# Words every sense of which Wiktionary writes as a form of another, but which a beginner
# learns as words of their own (`זאת` "this", filed as the feminine of `זה`); kept, and
# glossed by hand (`build_deck.GLOSS`).
FORM_OK = {'זאת', 'אלה',
           # A2: the feminine numbers, which are also the numbers Israelis COUNT with
           'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'תשע'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'literary', 'Biblical-Hebrew', 'biblical', 'Mishnaic-Hebrew', 'Talmudic', 'hapax',
        'proscribed', 'Aramaic', 'Rabbinic', 'offensive', 'ethnic', 'slur', 'Medieval-Hebrew',
        'Judaism'}

POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|defective|'
                     r'eye dialect|misspelling|dialectal|plene|pausal)\b.*\b(form|spelling) of\b', re.I)


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if POINTER.match(g):
        return ''
    return g


def is_formof(s):
    t = s.get('tags') or []
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


def link_word(f):
    for ln in f.get('links') or []:
        t = (ln[1] if len(ln) > 1 else '').split('#')[0]
        if t and is_hebrew(t) and not pointed(t):
            return nfc(t)
    return ''


def plene(f, prev=None):
    """The full spelling of one pointed form: the unpointed row Wiktionary writes before it with
    the same tags (`דיברתי` before `דִּבַּרְתִּי`), else the page it links to (`הולך`), else the
    pointed form stripped."""
    p = nfc(f.get('form', ''))
    if not pointed(p):
        return p
    if prev is not None and not pointed(prev.get('form', '')) \
            and sorted(prev.get('tags') or []) == sorted(f.get('tags') or []):
        return nfc(prev['form'])
    w = link_word(f)
    if w and fold(w).replace('ו', '').replace('י', '') == fold(p).replace('ו', '').replace('י', ''):
        return w
    return unpoint(p)


def pairs(forms):
    """A list of kaikki forms as {p, w, t} pairs: an unpointed row followed by its pointed twin is
    one pair; a lone unpointed row stands for itself."""
    out = []
    for i, f in enumerate(forms):
        x = nfc(f.get('form', ''))
        if not is_hebrew(x.replace('־', '')) or x.startswith('אַל +'):
            continue
        tags = f.get('tags') or []
        if not pointed(x):
            nxt = forms[i + 1] if i + 1 < len(forms) else None
            if nxt and pointed(nxt.get('form', '')) and sorted(nxt.get('tags') or []) == sorted(tags):
                continue      # its pointed twin follows and takes it as its full spelling
            out.append({'p': '', 'w': x.rstrip('־'), 't': tags})
            continue
        prev = forms[i - 1] if i else None
        out.append({'p': x.rstrip('־'), 'w': plene(f, prev).rstrip('־'), 't': tags})
    return out


# ROMANISATION.  Wiktionary's Hebrew entries mostly give the modern Israeli reading with the
# stress marked (`shalóm`, `katáv`), but some give a Biblical or scholarly one (`ʕālā`, `qɔm`,
# `raʕăyōn`, `kaḥól`).  The modern reading is preferred where an entry gives both; otherwise the
# scholarly letters are written the modern way (q -> k, ḥ -> kh, ɔ -- the qamats -- -> a), and what still carries
# a Biblical mark is left to `build_deck.ROMAN_BY_HAND`.  `ch` and `tz` are written `kh` and
# `ts`, so one card spells as its neighbour does.
SCHOLARLY = re.compile('[ʕʿʾāēīōūăĕŏəɔḥṭṣšḇḡḏḵp̄ṯ]')


# (A2) Biblical and scholarly letters with a plain modern equivalent: the ayin and alef signs as an
# apostrophe, š as sh, a long-vowel mark dropped.
PLAIN = str.maketrans({'ʿ': "'", 'ʾ': "'", 'ʕ': "'", 'ā': 'a', 'ă': 'a', 'ē': 'e', 'ĕ': 'e',
                       'ī': 'i', 'ō': 'o', 'ŏ': 'o', 'ū': 'u'})


def modern(r, w=''):
    r = r.translate(PLAIN).replace('š', 'sh')
    if re.search("צ['׳]", w):
        r = r.replace('kh', 'ch')       # the extraction of `צ׳` -- ch as in church -- is kept
        return r.replace('ḥ', 'kh').replace('ɔ', 'a').replace('q', 'k').replace('tz', 'ts')
    r = r.replace('ḥ', 'kh').replace('ɔ', 'a').replace('q', 'k').replace('tz', 'ts')
    return re.sub(r'(?<![tsTS])ch', 'kh', r)


def roman_of(e):
    rs = [f.get('form', '').split(' / ')[0].strip() for f in e.get('forms') or []
          if 'romanization' in (f.get('tags') or [])]
    for h in e.get('head_templates') or []:
        rs.append((h.get('args') or {}).get('tr', ''))
    rs = [r for r in rs if r and r != '-']
    if not rs:
        return ''
    w = e.get('word', '')
    clean = [modern(r, w) for r in rs if not SCHOLARLY.search(modern(r, w))]
    return clean[0] if clean else modern(rs[0], w)


def canon(e, w):
    """The pointed form of the headword."""
    for f in e.get('forms') or []:
        if 'canonical' in (f.get('tags') or []) and pointed(f.get('form', '')):
            return nfc(f['form'])
    for h in e.get('head_templates') or []:
        a = h.get('args') or {}
        if a.get('wv') and pointed(a['wv']):
            return nfc(a['wv'])
    return ''


GENDER = {'m': 'masculine', 'f': 'feminine', 'm-p': 'masculine plural', 'f-p': 'feminine plural',
          'mf': 'masculine or feminine', 'm-d': 'masculine dual', 'f-d': 'feminine dual'}


def main():
    counts = {}
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_hebrew(p[0]):
            k = fold(p[0])
            counts[k] = counts.get(k, 0) + int(p[1])

    lemmas, pointers, formonly = {}, [], {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        month = pos == 'name' and any(MONTH.match((x.get('glosses') or [''])[0])
                                      for x in e.get('senses') or [])
        if month:
            pos = 'noun'
            e = dict(e, senses=[x for x in e['senses'] if MONTH.match((x.get('glosses') or [''])[0])])
        elif pos == 'name' and w in NAME_OK:
            pass
        elif pos not in KEEP_POS or not is_hebrew(w):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if (not is_formof(s) or w in FORM_OK) and s.get('glosses')]
        for s in senses:
            if is_formof(s):
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_hebrew(tw):
                        pointers.append((fold(w), fold(tw)))
        if not real:
            alts = [nfc(t.get('word', '')) for s in senses for t in s.get('alt_of') or []]
            if alts and all('alt_of' in s for s in senses) and is_hebrew(alts[0]):
                formonly.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0])})
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK),
                           'tags': sorted(tags & {'formal', 'informal', 'colloquial', 'figuratively',
                                                  'transitive', 'intransitive', 'idiomatic', 'slang',
                                                  'Judaism', 'military', 'law', 'plural'})})
        forms = e.get('forms') or []
        table_src = [f for f in forms if f.get('source') in ('declension', 'conjugation', 'inflection')
                     and 'table-tags' not in (f.get('tags') or [])
                     and 'inflection-template' not in (f.get('tags') or [])]
        table = pairs(table_src)
        # the infinitive: kaikki tags it `error-unrecognized-form` in the conjugation table
        for t in table:
            if 'error-unrecognized-form' in t['t'] and (t['w'] or t['p']).startswith('ל'):
                t['t'] = ['infinitive']
        table = [t for t in table if 'error-unrecognized-form' not in t['t']]
        # a noun's "feminine counterpart" (`ילדה` beside `ילד`) is a word of its own, not a form
        head = pairs([f for f in forms if not f.get('source')
                      and not {'canonical', 'romanization', 'class'} & set(f.get('tags') or [])
                      and not (pos == 'noun' and set(f.get('tags') or []) in ({'feminine'}, {'masculine'}))])
        binyan = ''
        for s in real:
            for t in s.get('tags') or []:
                if t.startswith('construction-'):
                    binyan = t[len('construction-'):]
        g = ''
        for h in e.get('head_templates') or []:
            g = (h.get('args') or {}).get('g', '') or g
        ent = {
            'pos': pos, 'etym': e.get('etymology_number') or '', 'roman': roman_of(e),
            'p': canon(e, w), 'g': GENDER.get(g, ''), 'binyan': binyan,
            'glosses': gl, 'table': table, 'head': head,
        }
        if month or w in INVENTORY_ONLY:
            ent['inv_only'] = True
        lemmas.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append(ent)

    # every surface (folded full spelling) a lemma claims: its own, its table's, its head forms'
    late = {k for k, L in lemmas.items() if all(e.get('inv_only') for e in L['entries'])}
    own = collections.defaultdict(set)
    for k, L in lemmas.items():
        if k in late:
            continue
        own[k].add(k)
        for ent in L['entries']:
            for row in ent['table'] + ent['head']:
                if ' ' in row['w'] or not row['w']:
                    continue
                own[fold(row['w'])].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and (surf not in lemmas or surf in late):
            own[surf].add(tgt)
    for k, L in formonly.items():
        if L['alt_of'] in lemmas and (k not in lemmas or k in late):
            own[k].add(L['alt_of'])
    for surf in list(own):
        if surf in lemmas and surf not in late and len(own[surf]) > 1 \
                and any(e['pos'] in CLOSED for e in lemmas[surf]['entries']):
            own[surf] = {surf}

    # a counted surface that is no form of anything: read behind a prefix chain
    claims = collections.defaultdict(set)
    for surf in counts:
        if surf in own:
            claims[surf] = own[surf]
            continue
        for rest in strips(surf):
            if rest in own:
                claims[surf] = {k for k in own[rest]
                                if not any(e['pos'] in CLOSED for e in lemmas[k]['entries'])
                                or rest == k}
                break
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
            wts = {k: freq[k] + 1 for k in who}
            tot = sum(wts.values())
            for k in who:
                nxt[k] += c * wts[k] / tot
        freq = nxt
    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    # EACH ENTRY'S OWN SCORE: what the surfaces only it holds under its key earn (`כתבתי`,
    # `כותב` for katav "he wrote"; `כתבים` is ktav's and katav-the-reporter's both, so neither's).
    # It chooses which of a key's words a card teaches when nothing else says (`build_deck`).
    for k, L in lemmas.items():
        held = collections.Counter()
        for ent in L['entries']:
            for s in {fold(r['w']) for r in ent['table'] + ent['head'] if r['w'] and ' ' not in r['w']}:
                held[s] += 1
        for ent in L['entries']:
            mine = {fold(r['w']) for r in ent['table'] + ent['head'] if r['w'] and ' ' not in r['w']}
            ent['score'] = sum(counts.get(s, 0) for s in mine if held[s] == 1 and s != k)

    out = {}
    for k, L in formonly.items():
        if k not in lemmas:
            L['freq'] = round(freq.get(L['alt_of'], 0), 2)
            L['own'] = counts.get(k, 0)
            L['formonly'] = True
            out[k] = L
    for k, L in lemmas.items():
        if k in late:
            L['freq'] = counts.get(k, 0)
            L['inv_only'] = True
            L.pop('multi', None)
        else:
            L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted(out.values(), key=lambda L: -L['freq'])[:80]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
