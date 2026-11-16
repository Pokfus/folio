#!/usr/bin/env python3
"""Every Cantonese word the dictionaries hold, with its Jyutping, its English and a frequency.

    python3 extract.py         (run from the cache directory, by run.py)

Level-independent: built once and kept.  Writes three files:

    lex.json    traditional headword -> its readings, each {s, j, g, pos, name, src}
    freq.json   traditional headword -> {n: count, j: {jyutping: count}, pos: {jyutping: {tag: count}}}
    tat.json    the Tatoeba Cantonese-English pairs, each sentence cut into words with their Jyutping

THE DICTIONARY IS TWO, BECAUSE NEITHER ALONE IS A CANTONESE DICTIONARY.
  · CC-CEDICT (MDBG, CC BY-SA 4.0) has clean English for the whole shared Chinese vocabulary but is a
    MANDARIN dictionary: no Jyutping, and the Cantonese words it has are a few hundred, marked
    "(Cantonese)".  Its Jyutping comes from CC-Canto's companion file, `cccedict-canto-readings`
    (Pleco, CC BY-SA 3.0), which gives a Cantonese reading for each CC-CEDICT entry it knew in 2015;
    an entry is joined on (traditional, simplified, pinyin).  A CC-CEDICT entry newer than the
    readings file has no Jyutping and is left out -- a reading guessed character by character is
    wrong exactly where it matters (行 haang4 "walk" against hong4 "row").
  · CC-Canto (Pleco, CC BY-SA 3.0) is the Cantonese half: 嘢, 佢, 喺, 咗, 啲 and some 34,000 more.
    Many of its lines are CC-CEDICT's own, "adapted" -- re-split so each Jyutping reading carries
    only its own senses (嘅 ge3 is the possessive, ge2 the particle) -- and those are kept.
  A reading's glosses are merged in that order -- CC-CEDICT, adapted, CC-Canto's own -- and a gloss
  already present is not repeated.  CC-Canto's own glosses come last because measured on the core
  words they are the weaker: 啲 opened on "one's belonging", 冇 on "(adverb) 1. no".

PROPER NOUNS are marked (a capitalised pinyin, both dictionaries' convention) and never dealt by
frequency.  A SENSE THAT IS A POINTER ("variant of", "see also", "used in", "Mandarin equivalent")
is dropped; a SENSE TAGGED archaic, literary, old, dialect or vulgar is WEAK and shown only when
nothing else is.

THE FREQUENCY IS SPOKEN CANTONESE, from two sources counted the same way:
  · HKCanCor, the Hong Kong Cantonese Corpus (Luke Kang Kwong, 1997-98; CC BY 4.0, as distributed
    in PyCantonese 5.0): 125,394 hand-segmented, hand-romanised words of conversation and radio.
  · Tatoeba's Cantonese sentences, cut into words by their own Jyutping transcriptions (below).
  A word's count is the sum of its rates per million in the two, so neither corpus's size decides
  it.  Counts are kept per READING too, so a card can take the reading people actually say, and
  HKCanCor's part-of-speech tags per reading give the card its part of speech.

THE TATOEBA CUT.  Tatoeba transcribes its Cantonese sentences into Jyutping a word at a time
("Tom daat⁶ m⁴dou² Mary ..."), so the syllable count of each transcribed word says how many
characters it covers: the transcription IS a segmentation, and it carries the reading.  A sentence
whose transcription does not account for every character exactly is not cut and not used.  A
sentence written in SIMPLIFIED characters (one holding a character CC-CEDICT knows only as
simplified) is not used either: these decks are written in Hong Kong's traditional characters.
"""
import csv, glob, json, os, re, sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from yue import fold, nfc, syllables, spaced, is_cjk, all_cjk

csv.field_size_limit(10 ** 8)

LINE = re.compile(r'^(\S+) (\S+) \[([^\]]*)\](?: \{([^}]*)\})?(?: /(.*)/)?\s*(?:#.*)?$')
POINTER = re.compile(r'^(?:see also|see |Mandarin equivalent|variant of|old variant|used in|CL:|Taiwan pr|'
                     r'also pr|also written|abbr\. for|surname |\(phonetic\)|\(used in|\(onom\.\)|'
                     r'erhua variant|japanese variant|archaic variant|same as )', re.I)
WEAK = re.compile(r'\((?:archaic|literary|old|dialect|vulgar|obsolete|Buddhism|slang|derog\.?|'
                  r'classical|euphemism|Taiwan|Hokkien)\)', re.I)
REF = re.compile(r'([㐀-鿿\U00020000-\U0003134f]+)(?:\|[㐀-鿿\U00020000-\U0003134f]+)?\[[^\]]*\]')
TONEPIN = re.compile(r'([㐀-鿿\U00020000-\U0003134f]+)[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü ]+ \[[^\]]*\]')
NATIVE_POS = re.compile(r'^\(([a-z][a-z /.]*)\)\s*')
NUMBERED = re.compile(r'\s*\d+\.\s*')
CANT = re.compile(r'\s*\((?:Cantonese|Cant\.)\)\s*')


def clean(g):
    g = nfc(g).strip()
    g = re.sub(r'\s*\(Mandarin equivalent:[^)]*\)', '', g)
    g = TONEPIN.sub(r'\1', g)
    g = REF.sub(r'\1', g)
    g = CANT.sub(' ', g).strip()
    g = re.sub(r'\s+', ' ', g).strip(' ,;')
    return g


def senses(defs, native):
    """Split a dictionary's /-separated definitions into (pos, [glosses], [weak])."""
    pos, good, weak = '', [], []
    items = [d for d in (defs or '').split('/') if d.strip()]
    for d in items:
        d = d.strip()
        m = NATIVE_POS.match(d) if native else None
        parts = [d]
        if m:
            pos = pos or m.group(1).strip()
            d = d[m.end():]
            parts = [p for p in NUMBERED.split(d) if p.strip()]
            parts = [q for p in parts for q in p.split('; ')] if len(parts) > 1 else parts
        for p in parts:
            if POINTER.match(p.strip()):
                continue
            w = bool(WEAK.search(p))
            p = clean(WEAK.sub('', p))
            if not p or POINTER.match(p) or re.search(r'[㐀-鿿]', p) and len(re.sub(r'[^A-Za-z]', '', p)) < 3:
                continue
            (weak if w else good).append(p)
    return pos, good, weak


def is_name(pinyin):
    return any(s[:1].isupper() for s in pinyin.split())


def read_dicts():
    lex = defaultdict(dict)   # trad -> jp -> entry

    def add(trad, simp, jp, defs, src, native, pinyin):
        trad, simp = nfc(trad), nfc(simp)
        if not all_cjk(trad):
            return
        for one in re.split(r'\s*/\s*', jp):
            sj = spaced(one)
            if not sj or len(sj.split()) != len(trad):
                continue
            pos, good, weak = senses(defs, native)
            if not good and not weak:
                continue
            e = lex[trad].setdefault(sj, {'s': simp, 'j': sj, 'g': [], 'w': [], 'pos': '', 'name': True,
                                         'src': []})
            e['name'] = e['name'] and is_name(pinyin)
            e['pos'] = e['pos'] or pos
            for g in good:
                if g not in e['g']:
                    e['g'].append(g)
            for g in weak:
                if g not in e['w'] and g not in e['g']:
                    e['w'].append(g)
            if src not in e['src']:
                e['src'].append(src)

    # 1. CC-CEDICT joined to its Cantonese readings
    readings, by_pair, unjoined = {}, defaultdict(set), []
    for line in open('cccedict-canto-readings-150923.txt', encoding='utf-8'):
        if line.startswith('#'):
            continue
        m = LINE.match(line.strip())
        if m and m.group(4):
            readings.setdefault((m.group(1), m.group(2), pin(m.group(3))), m.group(4))
        by_pair[(m.group(1), m.group(2))].add(m.group(4))
    joined = 0
    for line in open('cedict.txt', encoding='utf-8'):
        if line.startswith('#'):
            continue
        m = LINE.match(line.strip())
        if not m:
            continue
        jp = readings.get((m.group(1), m.group(2), pin(m.group(3))))
        if not jp and len(by_pair.get((m.group(1), m.group(2)), ())) == 1:
            # the readings file knew this word under another pinyin ("also pr." -- 下面 xia4 mian4 /
            # xia4 mian5): one Cantonese reading for the pair, so it is this entry's too
            jp = next(iter(by_pair[(m.group(1), m.group(2))]))
        if jp:
            joined += 1
            add(m.group(1), m.group(2), jp, m.group(5), 'cedict', False, m.group(3))
        else:
            unjoined.append(m)
    # 2. CC-Canto: the adapted lines, then its own
    own = []
    for line in open('cccanto-webdist.txt', encoding='utf-8'):
        if line.startswith('#'):
            continue
        m = LINE.match(line.strip())
        if not m or not m.group(4):
            continue
        if 'adapted from cc-cedict' in line:
            add(m.group(1), m.group(2), m.group(4), m.group(5), 'canto', False, m.group(3))
        else:
            own.append(m)
    for m in own:
        add(m.group(1), m.group(2), m.group(4), m.group(5), 'canto-own', True, m.group(3))
    print(f'  CC-CEDICT entries with a Cantonese reading: {joined}; headwords: {len(lex)}')
    return lex, unjoined, add


def pin(p):
    return p.lower().replace('u:', 'v')


def simplified_only(lex):
    trad = set()
    simp = set()
    for line in open('cedict.txt', encoding='utf-8'):
        if line.startswith('#'):
            continue
        m = LINE.match(line.strip())
        if m:
            trad.update(m.group(1))
            simp.update(m.group(2))
    return {ch for ch in simp - trad if is_cjk(ch)}


def hkcancor():
    """(folded word, spaced jyutping, tag) for every token of the corpus."""
    out = []
    for p in sorted(glob.glob('hkcancor/*.cha')):
        ws = []
        for l in open(p, encoding='utf-8').read().replace('\n\t', ' ').split('\n'):
            if l.startswith('*'):
                ws = l.split('\t', 1)[1].split()
            elif l.startswith('%mor:'):
                ms = l.split('\t', 1)[1].split()
                if len(ms) != len(ws):
                    continue
                for w, m in zip(ws, ms):
                    if '|' not in m:
                        continue
                    tag, jp = m.split('|', 1)
                    w = fold(w)
                    sj = spaced(jp)
                    if all_cjk(w) and sj and len(sj.split()) == len(w):
                        out.append((w, sj, tag))
    return out


UNIT = re.compile(r'[A-Za-z0-9\']+|[㐀-鿿\U00020000-\U0003134f豈-﫿]')


def cut(text, trans):
    """Align a sentence with its word-by-word Jyutping: [(start, end, jyutping)] over `text`, or None."""
    units = [(m.start(), m.end(), m.group()) for m in UNIT.finditer(text)]
    out, i = [], 0
    for tok in trans.split():
        syl = syllables(tok)
        if syl:
            n = len(syl)
            span = units[i:i + n]
            if len(span) < n or not all(is_cjk(u[2]) for u in span):
                return None
            out.append((span[0][0], span[-1][1], ' '.join(syl)))
            i += n
        elif re.fullmatch(r'[A-Za-z0-9\']+', tok):
            if i >= len(units) or units[i][2].lower() != tok.lower():
                return None
            i += 1
        # anything else is punctuation in the transcription
    return out if i == len(units) else None


def tatoeba(simp_only):
    yue = {}
    for row in csv.reader(open('yue_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            yue[row[0]] = nfc(row[2])
    trans = {}
    for row in csv.reader(open('yue_transcriptions.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 5 and row[2] == 'Latn':
            trans[row[0]] = nfc(row[4])
    links = defaultdict(list)
    for row in csv.reader(open('yue-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2:
            links[row[0]].append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    tokens, pairs = [], []
    n_simp = n_fail = 0
    for sid in sorted(yue, key=int):
        text = yue[sid]
        if any(ch in simp_only for ch in text):
            n_simp += 1
            continue
        if sid not in trans:
            continue
        c = cut(text, trans[sid])
        if c is None:
            n_fail += 1
            continue
        for a, b, jp in c:
            tokens.append((fold(text[a:b]), jp))
        en = sorted((eng[e] for e in links.get(sid, []) if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append([int(sid), text, en[0], c])
    print(f'  Tatoeba: {len(yue)} sentences, {n_simp} simplified, {n_fail} not cut, '
          f'{len(tokens)} words counted, {len(pairs)} cut pairs with English')
    return tokens, pairs


def main():
    lex, unjoined, add = read_dicts()
    so = simplified_only(lex)
    hk = hkcancor()
    # A CC-CEDICT ENTRY THE READINGS FILE NEVER KNEW (it is from 2015) takes its reading from HKCanCor,
    # where the corpus's transcribers gave the word ONE reading -- 喺 hai2 "to be at", in CC-CEDICT
    # since and in neither Pleco file.  Its glosses are CC-CEDICT's; nothing is guessed.
    hk_j = defaultdict(Counter)
    for w, j, _ in hk:
        hk_j[w][j] += 1
    late = 0
    for m in unjoined:
        t = nfc(m.group(1))
        if t not in lex and len(hk_j.get(t, ())) == 1:
            add(t, m.group(2), next(iter(hk_j[t])), m.group(5), 'cedict-hk', False, m.group(3))
            late += t in lex
    print(f"  CC-CEDICT entries given HKCanCor's reading: {late}")
    tat_tokens, pairs = tatoeba(so)
    freq = {}
    for toks, tagged in ((hk, True), ([(w, j, '') for w, j in tat_tokens], False)):
        scale = 1e6 / max(1, len(toks))
        for w, j, tag in toks:
            f = freq.setdefault(w, {'n': 0.0, 'j': {}, 'pos': {}})
            f['n'] += scale
            f['j'][j] = f['j'].get(j, 0.0) + scale
            if tagged:
                f['pos'].setdefault(j, {})
                f['pos'][j][tag] = f['pos'][j].get(tag, 0) + 1
    for f in freq.values():
        f['n'] = round(f['n'], 2)
        f['j'] = {k: round(v, 2) for k, v in sorted(f['j'].items())}
    print(f'  HKCanCor: {len(hk)} words; distinct words counted: {len(freq)}')
    out = {t: [lex[t][j] for j in sorted(lex[t])] for t in sorted(lex)}
    json.dump(out, open('lex.json', 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    json.dump(freq, open('freq.json', 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    json.dump(pairs, open('tat.json', 'w', encoding='utf-8'), ensure_ascii=False)


if __name__ == '__main__':
    main()
