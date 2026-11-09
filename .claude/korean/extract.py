#!/usr/bin/env python3
"""Stage 1: the raw downloads in .claude/korean-cache/src/ -> the JSON every builder reads.

    PYTHONPATH=<xlrd + kiwipiepy, installed outside the repo> python3 extract.py [nikl] [dict] [hanja] [krdict] [tatoeba]

Writes  nikl.json     the NIKL list's rows: [rank, headword, pos, note, grade]
        dict.json     word -> its Wiktionary entries, compacted (only the words a deck can ask for)
        hanja.json    character -> {d: Unihan's English definition, e: Wiktionary's eumhun "배울 학"}
        krdict.json   word -> its KRDict entries: part of speech, hanja origin, pronunciation, English per sense
        tatoeba.json  Korean sentences that have an English translation, with the lemmas Kiwi finds in them
"""
import bz2, csv, json, os, re, sys, tarfile, unicodedata
from collections import defaultdict
from ko import SRC, save, load, c, is_hanja

KAIKKI = os.path.join(SRC, 'kaikki.org-dictionary-Korean.jsonl')


def nikl():
    # THE RANK IS BLANK on 68 rows (the place names, the numerals above ten, the contractions): the list's own
    # frequency rank comes from a corpus count these were added beside, so they carry None and sort last.
    import xlrd
    sh = xlrd.open_workbook(os.path.join(SRC, 'nikl.xls')).sheet_by_index(0)
    rows = []
    for r in range(1, sh.nrows):
        rank, word, pos, note, grade = [sh.cell_value(r, k) for k in range(5)]
        # the NFC fold turns the list's KS X 1001 compatibility ideographs (金 U+F90A) into the unified ones
        rows.append([int(rank) if rank != '' else None, word.strip(), pos.strip(),
                     unicodedata.normalize('NFC', str(note).strip()), grade.strip()])
    return rows


# The parts of speech a deck can carry.  `character` and `syllable` are hanja and hangul-syllable entries
# (read for the eumhun only), `name` is a proper noun (the list has 63 place names), `root` and the affixes
# are never a card's meaning.
KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'pron', 'num', 'det', 'intj', 'particle', 'counter', 'name',
            'phrase', 'proverb', 'contraction', 'conj', 'suffix', 'prefix'}
# The conjugated forms a verb or adjective card shows, and the ones the example finder searches for: the whole
# table goes into `ft` (forms text), the labelled few into `fl`.
FORM_TAGS = {
    'polite': {'indicative', 'informal', 'non-past', 'polite'},
    'past': {'indicative', 'informal', 'past', 'polite'},
    'formal': {'formal', 'indicative', 'non-past', 'polite'},
}


def compact(e):
    out = {'pos': e['pos']}
    roman = [f['form'] for f in e.get('forms', []) if f.get('tags') == ['romanization']]
    if roman:
        out['r'] = roman[0]
    hanja = [f['form'] for f in e.get('forms', []) if 'hanja' in (f.get('tags') or []) and any(is_hanja(ch) for ch in f['form'])]
    for t in e.get('head_templates', []):
        h = (t.get('args') or {}).get('hanja')
        if h and h not in hanja and any(is_hanja(ch) for ch in h):
            hanja.append(h)
    if hanja:
        out['h'] = hanja
    for s in e.get('sounds') or []:
        if s.get('hangeul') and 'p' not in out:
            out['p'] = s['hangeul']
    ety = e.get('etymology_text') or ''
    if ety:
        out['ety'] = ety[:300]
    senses = []
    for s in e.get('senses', []):
        g = s.get('glosses') or []
        if not g:
            continue
        ex = []
        for x in s.get('examples') or []:
            if x.get('text') and (x.get('english') or x.get('translation')):
                ex.append({'t': x['text'], 'e': x.get('english') or x.get('translation'),
                           'b': x.get('bold_text_offsets') or []})
        senses.append({'g': g[-1], 'tags': sorted(set((s.get('tags') or []) + (s.get('raw_tags') or []))),
                       'ex': ex, 'alt': [a['word'] for a in s.get('alt_of') or []] + [a['word'] for a in s.get('form_of') or []]})
    out['s'] = senses
    if e['pos'] in ('verb', 'adj'):
        fl, ft = {}, []
        for f in e.get('forms', []):
            if f.get('source') != 'conjugation' or not f.get('form'):
                continue
            tags = set(f.get('tags') or [])
            if tags & {'table-tags', 'inflection-template', 'class'}:
                continue
            ft.append(f['form'])
            for lab, want in FORM_TAGS.items():
                if tags == want and lab not in fl:
                    fl[lab] = f['form']
        if fl:
            out['fl'] = fl
        if ft:
            out['ft'] = sorted(set(ft))
    return out


def dictionary(want):
    D = defaultdict(list)
    eum = {}
    phrases = []
    with open(KAIKKI, encoding='utf-8') as fh:
        for line in fh:
            e = json.loads(line)
            w, pos = e.get('word', ''), e.get('pos')
            if pos == 'character' and len(w) == 1 and is_hanja(w):
                for f in e.get('forms', []):
                    if 'eumhun' in (f.get('tags') or []) and w not in eum:
                        eum[w] = f['form']
                continue
            if pos not in KEEP_POS:
                continue
            idiom = any('idiomatic' in (s.get('tags') or []) for s in e.get('senses', []))
            if w in want or pos in ('phrase', 'proverb') or (idiom and ' ' in w):
                D[w].append(compact(e))
                if (pos in ('phrase', 'proverb') or (idiom and ' ' in w)) and w not in phrases:
                    phrases.append(w)
    return D, eum, phrases


def hanja(eum):
    out = {}
    with open(os.path.join(SRC, 'Unihan_Readings.txt'), encoding='utf-8') as fh:
        for line in fh:
            if line.startswith('#') or '\tkDefinition\t' not in line:
                continue
            cp, _k, d = line.rstrip('\n').split('\t', 2)
            ch = chr(int(cp[2:], 16))
            out[ch] = {'d': d}
    for ch, e in eum.items():
        out.setdefault(ch, {})['e'] = e
    # VARIANTS, so a join on hanja does not fail on a spelling: the NIKL list writes 强調 where Wiktionary
    # writes 強調, and 秘密 where it writes 祕密
    with open(os.path.join(SRC, 'Unihan_Variants.txt'), encoding='utf-8') as fh:
        for line in fh:
            if line.startswith('#') or not line.strip():
                continue
            cp, _k, vs = line.rstrip('\n').split('\t', 2)
            ch = chr(int(cp[2:], 16))
            for v in vs.split():
                v = chr(int(v.split('<')[0][2:], 16))
                if v != ch:
                    out.setdefault(ch, {}).setdefault('v', []).append(v)
                    out.setdefault(v, {}).setdefault('v', []).append(ch)
    for rec in out.values():
        if 'v' in rec:
            rec['v'] = sorted(set(rec['v']))
    return out


def krdict():
    """KRDict (한국어기초사전, NIKL, CC BY-SA 2.0 KR) -> word -> [{pos, o (hanja origin), lv, hn, p, s: [english]}].

    The fallback dictionary: a row Wiktionary has no entry for is looked up here (`resolve.py`).  Only the
    English equivalent of each sense is read (its `lemma`); the Korean definitions and example sentences have no
    English beside them and are not used."""
    L = lambda v: v if isinstance(v, list) else [v]

    def feats(o):
        out = {}
        for f in L(o.get('feat', [])):
            if 'att' in f and 'val' in f:
                out.setdefault(f['att'], []).append(f['val'])
        return out
    D = defaultdict(list)
    PH = []                                 # the idioms (관용구) and proverbs (속담), for the phrases deck
    d = os.path.join(SRC, 'krdict')
    for fn in sorted(os.listdir(d)):
        for e in json.load(open(os.path.join(d, fn), encoding='utf-8'))['LexicalResource']['Lexicon']['LexicalEntry']:
            lem = [feats(x).get('writtenForm', [''])[0] for x in L(e['Lemma'])]
            f = feats(e)
            senses, defs = [], []
            for sn in L(e.get('Sense', [])):
                for q in L(sn.get('Equivalent', [])):
                    q = feats(q)
                    if q.get('language') == ['영어'] and q.get('lemma'):
                        senses.append(q['lemma'][0].strip())
                        defs.append((q.get('definition') or [''])[0].strip())
            lu = (f.get('lexicalUnit') or [''])[0]
            if lu in ('관용구', '속담'):
                PH.append({'w': lem[0].replace('^', ' '), 'kind': lu, 's': senses, 'd': defs})
                continue
            pron = ''
            for wf in L(e.get('WordForm', [])):
                g = feats(wf)
                if g.get('type') == ['발음'] and g.get('pronunciation'):
                    pron = g['pronunciation'][0]
                    break
            rec = {'pos': (f.get('partOfSpeech') or [''])[0], 'o': (f.get('origin') or [''])[0],
                   'lv': (f.get('vocabularyLevel') or [''])[0], 'hn': (f.get('homonym_number') or ['0'])[0],
                   'p': pron, 's': senses}
            for w in lem:
                if w:
                    D[w.replace('-', '').replace('^', ' ')].append(rec)
    return D, PH


def tatoeba():
    from kiwipiepy import Kiwi, Match
    kiwi = Kiwi()
    kor, eng = {}, {}
    for line in bz2.open(os.path.join(SRC, 'kor_sentences.tsv.bz2'), 'rt', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3:
            kor[p[0]] = p[2]
    for line in bz2.open(os.path.join(SRC, 'eng_sentences.tsv.bz2'), 'rt', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3:
            eng[p[0]] = p[2]
    links = defaultdict(list)
    with tarfile.open(os.path.join(SRC, 'links.tar.bz2')) as tf:
        fh = tf.extractfile([m for m in tf.getmembers() if m.name.endswith('links.csv')][0])
        for raw in fh:
            a, b = raw.decode('utf-8').rstrip('\n').split('\t')
            if a in kor and b in eng:
                links[a].append(b)
    rows = []
    for i in sorted(links, key=int):
        t = kor[i]
        toks = kiwi.tokenize(t, match_options=Match.ALL | Match.JOIN_V_SUFFIX)
        # [form, tag, start, end] -- the offsets let a builder put the <b> round the right characters
        rows.append({'id': int(i), 'ko': t, 'en': eng[min(links[i], key=int)],
                     't': [[x.form, x.tag, x.start, x.start + x.len] for x in toks]})
    return rows


if __name__ == '__main__':
    what = sys.argv[1:] or ['nikl', 'dict', 'hanja', 'krdict', 'tatoeba']
    if 'nikl' in what:
        rows = nikl(); save('nikl.json', rows); print('nikl rows', len(rows))
    if 'dict' in what or 'hanja' in what:
        rows = load('nikl.json')
        want = {re.sub(r'\d+$', '', r[1]) for r in rows}
        D, eum, phrases = dictionary(want)
        save('dict.json', D); save('phrases.json', phrases)
        print('dict words', len(D), 'of', len(want), 'listed | phrases', len(phrases), '| eumhun', len(eum))
        H = hanja(eum); save('hanja.json', H); print('hanja', len(H))
    if 'krdict' in what:
        K, PH = krdict(); save('krdict.json', K); save('krdict-phrases.json', PH)
        print('krdict headwords', len(K), '| idioms and proverbs', len(PH))
    if 'tatoeba' in what:
        rows = tatoeba(); save('tatoeba.json', rows); print('tatoeba sentences with English', len(rows))
