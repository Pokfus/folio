#!/usr/bin/env python3
"""Build one stage of the NIKL list as a deck:  python3 build_level.py a   (a, b or c)

THE LIST.  `한국어 학습용 어휘 목록` (Korean vocabulary list for learners), National Institute of the Korean Language
(then 국립국어연구원), May 2003: 5,965 words in three stages -- A 982, B 2,111, C 2,872 -- each row with its part of
speech, a note (the hanja, a phrase it is used in, or a hint at its meaning) and its rank in the corpus count the
list was drawn from.  Published under KOGL Type 1 (공공누리 제1유형: free use, the source named).  TOPIK, the
proficiency test, publishes no word list of its own; this is the state's list for learners.

A WORD IS ONE HEADWORD OF THE LIST.  A headword listed twice (가까이 as an adverb and a noun; 갖다 as a verb and an
auxiliary) is one note, at the lower of its stages.  Each headword is joined to its Wiktionary entry by
`resolve.py`; a row the join refuses is left out rather than glossed from nowhere, and the description counts them.
The stages partition the list, so a word is carded once; `check-korean.js` asserts it across the shipped decks.
"""
import json, os, re, sys
from collections import OrderedDict
from ko import DECKS, STAMP, COLOR, load, is_hanja, is_hangul
from deck_type import TYPE_ID, type_def
from resolve import resolve, resolve_kr, base, note_hanja, POS_NAME
import words as W

STAGES = ['a', 'b', 'c']
FILE = lambda st: 'Korean-Stage-%s.folio-deck.json' % st.upper()
DECK_ID = lambda st: 'korean' + st
TITLE = lambda st: 'Korean — Stage %s' % st.upper()
ORD = {'a': 'first', 'b': 'second', 'c': 'third and last'}
INF = 10 ** 9


def all_notes():
    R = load('nikl.json')
    D = load('dict.json')
    K = load('krdict.json')
    groups = OrderedDict()
    for r in R:
        groups.setdefault(r[1], []).append(r)
    out, refused = [], []
    for k, (head, rows) in enumerate(groups.items()):
        ents, only, how = resolve(rows, D)
        if not ents and how in ('no Wiktionary entry', 'hanja disagree', 'dropped by hand'):
            kr = resolve_kr(rows, K)
            if kr:
                ents, only, how = kr, None, 'krdict'
        n = {'head': head, 'base': base(head), 'rows': rows, 'grade': min(r[4] for r in rows).lower(),
             'rank': min((r[0] for r in rows if r[0] is not None), default=INF), 'order': k,
             'note': next((r[3] for r in rows if r[3]), ''), 'how': how}
        if not ents:
            refused.append(n)
            continue
        n['entries'] = ents
        n['only'] = set(only) if only else None
        n['senses'] = W.senses(ents, n['only'])
        if not n['senses']:
            n['how'] = 'no usable sense'
            refused.append(n)
            continue
        out.append(n)
    # TWO HOMOGRAPHS OF THE LIST THAT WIKTIONARY FILES AS ONE ENTRY (뛰다01 "run" and 뛰다02 "jump" are both its
    # 뛰다) would be two notes with one meaning and one front: the word is carded once, at the lower stage.
    seen, kept = {}, []
    for n in sorted(out, key=lambda x: (x['grade'], x['rank'], x['order'])):
        key = (n['base'], json.dumps(n['senses'], ensure_ascii=False))
        if key in seen:
            n['how'] = 'one Wiktionary entry with ' + seen[key]
            refused.append(n)
            continue
        seen[key] = n['head']
        kept.append(n)
    kept.sort(key=lambda x: x['order'])
    return kept, refused


LATIN = re.compile(r"^[A-Za-z][A-Za-z .'\-]*$")


def hanja_form(n):
    """The word as written in hanja, from the list's note (외할아버지 '外-' -> 外할아버지), else from Wiktionary."""
    note, w = n['note'].split('.')[0].strip(), n['base']
    hj = note_hanja(note)
    if hj:
        core = ''.join(ch for ch in note if is_hanja(ch) or ch == '-')
        k = len(hj)
        if core.startswith('-') and not core.endswith('-') and k <= len(w):
            return w[:len(w) - k] + ''.join(hj)
        if core.endswith('-') and not core.startswith('-') and k <= len(w):
            return ''.join(hj) + w[k:]
        if '-' not in core and k == len(w):
            return ''.join(hj)
        if re.search('[A-Za-z]', note) and '-' not in note:
            return note
        return ''
    for e in n['entries']:
        for h in e.get('h', []):
            h = h.split('/')[0]
            if len(h) <= len(w) + 2 and any(is_hanja(ch) for ch in h):
                return h
    return ''


def pron(n):
    w = n['base']
    for e in n['entries']:
        p = (e.get('p') or '').replace('(ː)', '').replace('ː', '').strip()
        if p and p != w and all(is_hangul(ch) or ch in ' ' for ch in p) and len(p) == len(w):
            return p
    return ''


def roman(n):
    for e in n['entries']:
        if e.get('r'):
            return e['r']
    return ''


def short_gloss(n):
    g = n['senses'][0][1][0]
    g = re.sub(r'\s*\([^)]*\)', '', g).split(';')[0].split(',')[0].strip()
    return g


def build(st):
    notes, refused = all_notes()
    by_base = {}
    for n in notes:
        by_base.setdefault(n['base'], []).append(n)
    homo = {b for b, v in by_base.items() if len(v) > 1}

    # THE "ALSO IN" ROWS: other words of the list written with the same hanja, the lower stages and the commonest
    # first, so a stage-A card points at stage-A words.
    for n in notes:
        n['hj'] = hanja_form(n)
    by_char = {}
    for n in sorted(notes, key=lambda x: (x['grade'], x['rank'], x['order'])):
        for ch in set(c for c in n['hj'] if is_hanja(c)):
            by_char.setdefault(ch, []).append(n)

    S = W.Sentences()
    mine = [n for n in notes if n['grade'] == st]
    mine.sort(key=lambda n: (n['rank'], n['order']))
    cards = []
    stats = {'ex0': 0, 'ex3': 0, 'tat': 0, 'wik': 0, 'cue': 0, 'forms': 0, 'hanja': 0, 'noroman': 0}
    for n in mine:
        w = n['base']
        f = n['fields'] = {}
        f['Word'] = W.E(w)
        cue = ''
        if w in homo:
            note = n['note'].split('.')[-1].strip() if n['note'].count('.') else n['note']
            if n['hj']:
                cue = n['hj']
            elif '~' in note:
                cue = note.replace('~', w)
            elif note and not LATIN.match(note):
                cue = note
            stats['cue'] += bool(cue)
        f['Cue'] = W.E(cue)
        r = roman(n)
        stats['noroman'] += not r
        f['Roman'] = W.E(r)
        also = []
        p = pron(n)
        if p:
            also.append('said [%s]' % W.E(p))
        if n['hj'] and n['hj'] != cue:
            also.append(W.E(n['hj']))
        if LATIN.match(n['note']) and not n['hj']:
            also.append('from <i>%s</i>' % W.E(n['note']))
        f['Also'] = ' · '.join(also)
        f['English'] = W.english_html(n['senses'])
        f['Forms'] = W.forms_html(n['entries'])
        stats['forms'] += bool(f['Forms'])
        others = {}
        for ch in set(c for c in n['hj'] if is_hanja(c)):
            o = [x for x in by_char.get(ch, []) if x['base'] != w and x['grade'] <= st][:3]
            others[ch] = [(x['base'], short_gloss(x)) for x in o]
        f['Hanja'] = W.hanja_html(n['hj'], others)
        stats['hanja'] += bool(f['Hanja'])
        # SENTENCES: Tatoeba's, unless the word has a homograph in the list or its senses were picked by hand --
        # a corpus sentence cannot say which 눈 it means, and Wiktionary's examples sit under the sense they show
        exs = []
        if w not in homo and n['only'] is None:
            ft = sorted({x for e in n['entries'] for x in e.get('ft', [])})
            exs = S.pick(w, ft if w.endswith('다') else ())
        stats['tat'] += bool(exs)
        if len(exs) < 3:
            more = [x for x in W.wikt_examples(n['entries'], n['only']) if x['ko'] not in {y['ko'] for y in exs}]
            stats['wik'] += bool(more[:3 - len(exs)])
            exs += more[:3 - len(exs)]
        stats['ex0'] += not exs
        stats['ex3'] += len(exs) == 3
        f['Examples'] = W.examples_html(exs)
    did = DECK_ID(st)
    for i, n in enumerate(mine, 1):
        cards.append({'id': 'u_%s_%d' % (did, i), 'num': str(i), 'nikl': n['head'], 'type': TYPE_ID,
                      'fields': n['fields']})
    ref = [x for x in refused if x['grade'] == st]
    before = sum(1 for n in notes if n['grade'] < st)
    return cards, stats, ref, before


SOURCES = (
    "Word list: 한국어 학습용 어휘 목록 (Korean vocabulary list for learners), National Institute of the Korean "
    "Language, 2003, under the Korea Open Government Licence Type 1. Meanings, romanization, pronunciation, hanja, "
    "conjugated forms and the examples marked as Wiktionary's: English Wiktionary, via the kaikki.org extraction "
    "(CC BY-SA 4.0). Hanja meanings: the Unicode Unihan database (Unicode License). Example sentences: Tatoeba "
    "(tatoeba.org), CC BY 2.0 FR, found with the Kiwi morphological analyser."
)


def describe(st, n, stats, ref, before):
    why = {}
    for x in ref:
        why[x['how']] = why.get(x['how'], 0) + 1
    listed = n + len(ref)
    refused = ''
    if ref:
        eg = '、'.join(x['base'] for x in sorted(ref, key=lambda x: x['rank'])[:3])
        refused = (" %d of the stage's %d headwords are left out rather than glossed from nowhere: English Wiktionary "
                   "has no entry for them, or none for the homograph the list means (%s …) — mostly transparent "
                   "derivatives such as -되다 and -적 forms of words carded here." % (len(ref), listed, eg))
    ex = ("Every word carries example sentences" if stats['ex0'] == 0 else
          "%d of the %d words carry example sentences, up to three apiece" % (n - stats['ex0'], n))
    return (
        "Both study directions in one deck: Korean → English (see the word in hangul, recall its meaning) and "
        "English → Korean. Each word is ONE note with TWO cards, each scheduled on its own. "
        f"{n:,} words from stage {st.upper()}, the {ORD[st]} of the three stages of the National Institute of the "
        f"Korean Language's vocabulary list for learners (2003), taking you to about {before + n:,} words in all. "
        "TOPIK, the proficiency test, publishes no word list; this one is the state's own, graded by when a learner "
        f"should meet each word.{refused} The words are in the list's own order of frequency, commonest first. — "
        "The front shows the word in hangul; where the list has two words spelled alike (눈 \"eye\" and 눈 \"snow\"), "
        f"it also shows the hanja or the phrase the list gives to tell them apart ({stats['cue']} of these). The back "
        "gives the Revised Romanization, the pronunciation in hangul where it differs from the spelling, the hanja of "
        "a Sino-Korean word, the meanings, a verb's or adjective's polite, past and formal forms, one row per hanja "
        f"with its meaning, its eumhun and other words of the list written with it, and a fold of sentences. {ex}: "
        "real sentences from Tatoeba where the word has one meaning in the list, else the usage examples Wiktionary "
        "gives under the sense the card teaches, with the word picked out in colour and a speaker beside each. — "
        + SOURCES
    )


if __name__ == '__main__':
    st = (sys.argv[1:] or ['a'])[0].lower()
    if st not in STAGES:
        raise SystemExit('usage: build_level.py a|b|c')
    cards, stats, ref, before = build(st)
    n = len(cards)
    sub = ('The first %s words — start here once you can read hangul' % format(n, ',') if st == 'a' else
           '%s more words, taking you to about %s — study after Stage %s' % (
               format(n, ','), format(before + n, ','), STAGES[STAGES.index(st) - 1].upper()))
    meta = {
        'id': DECK_ID(st), 'title': TITLE(st), 'subtitle': sub,
        'desc': describe(st, n, stats, ref, before), 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['korean', '한국어', 'nikl', 'stage-' + st, 'vocabulary'], 'glossMode': 'site',
        'types': {TYPE_ID: type_def()}, 'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    import importlib.util as iu
    sp = iu.spec_from_file_location('dg', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py'))
    dg = iu.module_from_spec(sp); sp.loader.exec_module(dg)
    s = dg.dedupe(deck, 'Korean')
    if s['groups']:
        print('  labelled %d notes in %d groups that shared an English side' % (s['labelled'], s['groups']))
    out = os.path.join(DECKS, FILE(st))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote %s: %d notes / %d cards, %d bytes | %s | refused %d' % (FILE(st), n, 2 * n, os.path.getsize(out), stats, len(ref)))
    print('  refused:', ' '.join('%s(%s)' % (x['head'], x['how']) for x in ref[:60]))
