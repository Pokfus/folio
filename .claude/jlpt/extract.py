#!/usr/bin/env python3
"""Stage 2: the raw downloads in .claude/jlpt-cache/ -> the JSON every builder reads.

    PYTHONPATH=<fugashi + unidic_lite, installed outside the repo> python3 extract.py

Writes  jmdict.json  (seq -> forms, readings, senses, priority)
        kanji.json   (literal -> meanings, on, kun, strokes, grade, parts)
        furigana.json ("text|reading" -> [[ruby, rt], ...])
        tatoeba.json (Japanese sentences with an English translation, tokenised)
        freq.json    (lemma -> count over that corpus)
"""
import bz2, csv, gzip, json, os, re, sys, xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from common import c, save, SRC, kata2hira

def jmdict():
    raw = gzip.open(c('JMdict_e.gz'), 'rt', encoding='utf-8').read()
    # THE ENTITIES ARE THE TAGS.  JMdict writes a part of speech as `&v5u;`, declared in its DTD, which
    # ElementTree will not resolve; keeping the entity's NAME as text is exactly what a builder wants.
    raw = re.sub(r'<!DOCTYPE.*?\]>', '', raw, flags=re.S)
    raw = re.sub(r'&([\w-]+);', lambda m: m.group(0) if m.group(1) in ('lt', 'gt', 'amp', 'quot', 'apos') else m.group(1), raw)
    root = ET.fromstring(raw)
    out = {}
    for e in root.iter('entry'):
        seq = e.findtext('ent_seq')
        k = [{'t': x.findtext('keb'), 'inf': [i.text for i in x.findall('ke_inf')],
              'pri': [p.text for p in x.findall('ke_pri')]} for x in e.findall('k_ele')]
        r = [{'t': x.findtext('reb'), 'nokanji': x.find('re_nokanji') is not None,
              'restr': [i.text for i in x.findall('re_restr')], 'inf': [i.text for i in x.findall('re_inf')],
              'pri': [p.text for p in x.findall('re_pri')]} for x in e.findall('r_ele')]
        senses, last_pos = [], []
        for s in e.findall('sense'):
            pos = [p.text for p in s.findall('pos')] or last_pos      # a sense with no pos inherits the last
            last_pos = pos
            senses.append({'pos': pos, 'misc': [m.text for m in s.findall('misc')],
                           'field': [m.text for m in s.findall('field')],
                           'stagk': [m.text for m in s.findall('stagk')],
                           'stagr': [m.text for m in s.findall('stagr')],
                           'inf': [m.text for m in s.findall('s_inf')],
                           'gloss': [g.text for g in s.findall('gloss') if g.text]})
        out[seq] = {'k': k, 'r': r, 's': senses}
    return out


def kanji():
    root = ET.fromstring(gzip.open(c('kanjidic2.xml.gz'), 'rt', encoding='utf-8').read().split('<kanjidic2>', 1)[1].join(['<kanjidic2>', '']))
    out = {}
    for ch in root.iter('character'):
        lit = ch.findtext('literal')
        misc = ch.find('misc')
        rm = ch.find('reading_meaning')
        on, kun, mean = [], [], []
        if rm is not None:
            for g in rm.findall('rmgroup'):
                on += [x.text for x in g.findall('reading') if x.get('r_type') == 'ja_on']
                kun += [x.text for x in g.findall('reading') if x.get('r_type') == 'ja_kun']
                mean += [x.text for x in g.findall('meaning') if not x.get('m_lang')]
        # SKIP codes are NOT read: they are Jack Halpern's, under his own terms (KANJIDIC2 licence §8).
        out[lit] = {'m': mean, 'on': on, 'kun': kun,
                    'sc': int(misc.findtext('stroke_count') or 0),
                    'g': int(misc.findtext('grade') or 0), 'f': int(misc.findtext('freq') or 0)}
    # A KANJI'S PARTS: the elements KanjiVG draws it from, one level down.  `kvg:original` names the full
    # form of a radical variant (⺍ is drawn from 小), which is the form a reader can look up.
    kv = os.path.join(SRC, 'kanjivg', 'kanji')
    for lit, rec in out.items():
        fn = os.path.join(kv, '%05x.svg' % ord(lit))
        if not os.path.exists(fn):
            continue
        txt = open(fn, encoding='utf-8').read()
        txt = re.sub(r'<!DOCTYPE.*?\]>', '', txt, flags=re.S).replace('kvg:', 'kvg_')
        try:
            svg = ET.fromstring(txt)
        except ET.ParseError:
            continue
        NS = '{http://www.w3.org/2000/svg}'
        top = None
        for g in svg.iter(NS + 'g'):
            if g.get('kvg_element') == lit:
                top = g; break
        if top is None:
            continue
        parts = []
        def walk(g, depth):
            for ch in g.findall(NS + 'g'):
                el = ch.get('kvg_original') or ch.get('kvg_element')
                if el and el != lit:
                    if el not in parts:
                        parts.append(el)
                elif depth < 2:
                    walk(ch, depth + 1)       # an unnamed grouping: look one level inside it
        walk(top, 0)
        if len(parts) > 1:
            rec['p'] = parts
    return out


def furigana():
    raw = open(c('JmdictFurigana.json'), encoding='utf-8-sig').read()
    out = {}
    for row in json.loads(raw):
        out[row['text'] + '|' + row['reading']] = [[f['ruby'], f.get('rt', '')] for f in row['furigana']]
    return out


def tatoeba():
    import fugashi
    tag = fugashi.Tagger()
    jpn = {}
    for line in bz2.open(c('jpn_sentences.tsv.bz2'), 'rt', encoding='utf-8'):
        i, _l, t = line.rstrip('\n').split('\t', 2)
        jpn[i] = t
    eng = {}
    for line in bz2.open(c('eng_sentences.tsv.bz2'), 'rt', encoding='utf-8'):
        i, _l, t = line.rstrip('\n').split('\t', 2)
        eng[i] = t
    links = defaultdict(list)
    with open(c('links.csv'), encoding='utf-8') as fh:
        for a, b in csv.reader(fh, delimiter='\t'):
            if a in jpn and b in eng:
                links[a].append(b)
    rows, freq = [], Counter()
    for i, t in jpn.items():
        toks = [(w.surface, w.feature.lemma or w.surface, w.feature.orthBase or w.surface,
                 w.feature.pos1 or '', kata2hira(w.feature.kana or '')) for w in tag(t)]
        for tk in toks:
            freq[tk[2]] += 1
            if tk[1] != tk[2]:
                freq[tk[1]] += 1
        if i in links:
            # THE LOWEST-NUMBERED TRANSLATION, so a rebuild picks the same English every time
            en = eng[min(links[i], key=int)]
            rows.append({'id': int(i), 'ja': t, 'en': en, 't': toks})
    rows.sort(key=lambda r: r['id'])
    return rows, freq


if __name__ == '__main__':
    what = sys.argv[1:] or ['jmdict', 'kanji', 'furigana', 'tatoeba']
    if 'jmdict' in what:
        d = jmdict(); save('jmdict.json', d); print('jmdict entries', len(d))
    if 'kanji' in what:
        d = kanji(); save('kanji.json', d); print('kanji', len(d), 'with parts', sum(1 for v in d.values() if 'p' in v))
    if 'furigana' in what:
        d = furigana(); save('furigana.json', d); print('furigana rows', len(d))
    if 'tatoeba' in what:
        rows, freq = tatoeba(); save('tatoeba.json', rows); save('freq.json', dict(freq))
        print('tatoeba sentences with English', len(rows), '| lemmas', len(freq))
