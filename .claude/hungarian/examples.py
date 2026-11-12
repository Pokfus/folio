#!/usr/bin/env python3
"""Three Tatoeba sentences for each word, matched on its forms (from .claude/greek/examples.py).

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`hun_sentences_detailed.tsv`, `hun-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Hungarian, English, [matched tokens]] triples.

A sentence matches a word when one of its tokens is the word or a form in its
table or its verb blocks (`ettem`, `egyél` for `eszik`), compared through
`hu.fold`.  A multi-word entry (jó reggelt) matches its words in sequence.  Among the matches the choice is
deterministic: a sentence whose matched words belong to this word alone first
(`ért` is "understands" and the past of `ér` "reaches"; `követ` "follows" is also
"a stone") or whose English translation uses one of the word's own glosses, then
the headword's own spelling, then sentences of four to
ten words, then the shorter, then the lower sentence id -- so a re-run is
byte-identical.  A Hungarian sentence with several English translations takes the
shortest.  Each sentence is used at most once per deck, so three cards do not
share one sentence.  A sentence with a swear word in it, or in its English, is never used (`SWEAR`, `SWEAR_EN`).
"""
import csv, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hu import fold, nfc, tokens
from hungarian_level import LEVEL, f

csv.field_size_limit(10 ** 8)

# Read off the A1 sentences (2026-11-09): two of them had been dealt for `falu` and `hely`.
SWEAR = ('kurv', 'fos', 'szar', 'basz', 'bassz', 'geci', 'picsa', 'fasz', 'segg', 'buzi',
         'köcsög', 'pöcs', 'pina', 'kibasz')


# THE ENGLISH SIDE TOO (2026-11-12, reading B1): a Hungarian sentence with no swear word
# can be translated with one ("Mi az ördög ez?" "What the fuck is that?"), and A1 and A2
# had shipped four such sentences (`isten`, `művel`, `bőr`, `udvarias`).
SWEAR_EN = re.compile(r'\b(fuck|shit|bitch|asshole|cunt|motherf|cock\b|dick\b|pussy)', re.I)


def clean(text, en=''):
    # every word, a capitalised one included (`tokens` skips those, for matching): C1 had
    # been dealt "A Faszbuk lesz hamarosan ..." for `erkölcs`
    words = re.findall(r'\w+', nfc(text).lower())
    return not any(fold(w).startswith(SWEAR) for w in words) and not SWEAR_EN.search(en)


def load():
    hin = {}
    for row in csv.reader(open('hun_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            hin[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('hun-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in hin:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for hid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng and not SWEAR_EN.search(eng[e])),
                    key=lambda s: (len(s), s))
        if en and clean(hin[hid], en[0]):
            pairs.append((int(hid), hin[hid], en[0]))
    pairs.sort()
    return pairs


def forms_of(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    out = {fold(row['word'])}
    for e in L.get('entries', []):
        if row['pos'] and e['pos'] != row['pos']:
            continue
        for t in e['table']:
            out.add(fold(t['f']))
        for blk in (e.get('verb') or {}).values():
            for cell in blk:
                for fm in (cell if isinstance(cell, list) else [cell]):
                    out.add(fold(fm))
    return out


def owners(lex):
    """How many words list each form (folded): a form two words share is ambiguous.  A word
    is a lemma's ETYMOLOGY, not the lemma, so `hat` "six" and `hat` "to affect" -- one
    headword, two words -- are two owners of `hat`."""
    n = {}
    for k, L in lex.items():
        if 'entries' not in L:
            continue
        groups = {}
        for e in L['entries']:
            mine = groups.setdefault(e.get('etym', ''), {k})
            mine.update(fold(t['f']) for t in e['table'])
            for blk in (e.get('verb') or {}).values():
                for cell in blk:
                    mine.update(fold(x) for x in (cell if isinstance(cell, list) else [cell]))
        for mine in groups.values():
            for fm in mine:
                n[fm] = n.get(fm, 0) + 1
    return n


STOP = {'to', 'a', 'an', 'the', 'be', 'of', 'in', 'on', 'one', 'something', 'someone', 'up', 'out'}


def gloss_words(L, pos):
    """The English words of the glosses the CARD shows (its etymologies, `build_deck.ETYMS`):
    a sentence whose translation uses one of them is about THIS word (`hat` "six" against
    `hat` "to affect"; `követ` "to follow", not the noun `követ` "envoy")."""
    from build_deck import ETYMS, GLOSS
    ents = [e for e in L.get('entries', []) if any(not g['weak'] for g in e['glosses'])]
    keep = ETYMS.get(L.get('word'), [next((e['etym'] for e in ents if not pos or e['pos'] == pos),
                                          ents[0]['etym'] if ents else '')])
    out = set()
    for e in ents:
        if (pos and e['pos'] != pos) or e['etym'] not in keep:
            continue
        texts = GLOSS.get(L.get('word'), {}).get(e['pos']) or [g['g'] for g in e['glosses'][:4]]
        for g in texts:
            for w in re.findall(r"[a-z]+", re.sub(r'\([^)]*\)', '', g.lower())):
                if w not in STOP and len(w) > 2:
                    out.add(w)
    return out


# THE PHRASES DECK'S MATCHING (`--level phr` only; the level decks keep their exact
# matching, so they rebuild byte-identical).  An idiom that is a verb is matched with its
# verb in ANY form (`szemet huny` -> `szemet hunyt`), and a two-word one in EITHER ORDER, for
# Hungarian puts the verb first under negation and focus (`nem huny szemet`).  Any other
# expression is matched as written.
def phrase_parts(row, lex):
    """One set of accepted tokens per position of the expression, and whether it is a verb."""
    words = [fold(t) for t in tokens(row['word'])]
    sets = [{w} for w in words]
    L = lex.get(row['key'], {})
    if not any(e['pos'] == 'verb' for e in L.get('entries', [])):
        return sets, False
    for i in reversed(range(len(words))):
        V = lex.get(words[i], {})
        vents = [e for e in V.get('entries', []) if e['pos'] == 'verb']
        if vents:
            for e in vents:
                for blk in (e.get('verb') or {}).values():
                    for cell in blk:
                        sets[i].update(fold(x) for x in (cell if isinstance(cell, list) else [cell])
                                       if ' ' not in x)
            return sets, True
    return sets, True


def seq_hit(ft, sets):
    n = len(sets)
    for j in range(len(ft) - n + 1):
        if all(ft[j + k] in sets[k] for k in range(n)):
            return ft[j:j + n]
    return None


def phrase_hits(row, lex, toks, index):
    """{sentence index: the matched tokens} for one expression; `toks` is a list of folded
    token lists (or tuples whose last item is one), `index` token -> sentence indexes."""
    sets, verb = phrase_parts(row, lex)
    orders = [sets] + ([sets[::-1]] if verb and len(sets) == 2 else [])
    out = {}
    for ss in orders:
        for w0 in sorted(ss[0]):
            for i in index.get(w0, []):
                if i in out:
                    continue
                ft = toks[i][-1] if isinstance(toks[i], tuple) else toks[i]
                hit = seq_hit(ft, ss)
                if hit:
                    out[i] = hit
    return out


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    shared = owners(lex)
    pairs = load()
    toks = [(pid, hi, en, [fold(t) for t in tokens(hi)]) for pid, hi, en in pairs]
    index = {}
    for i, (_, _, _, ft) in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    used, out = set(), {}
    for row in rows:
        words = fold(row['word']).split()
        cands = []
        if LEVEL == 'phr' and len(words) > 1:
            cands = [(i, 0, hit) for i, hit in sorted(phrase_hits(row, lex, toks, index).items())]
        elif len(words) > 1:
            for i in index.get(words[0], []):
                ft = toks[i][3]
                for j in range(len(ft) - len(words) + 1):
                    if ft[j:j + len(words)] == words:
                        cands.append((i, 0, words))
                        break
        else:
            forms = forms_of(row, lex)
            seen = set()
            for fm in forms:
                for i in index.get(fm, []):
                    if i in seen:
                        continue
                    seen.add(i)
                    hit = [t for t in toks[i][3] if t in forms]
                    cands.append((i, 0 if words[0] in hit else 1, hit))
        gw = gloss_words(lex[row['via']] if row.get('via') else lex[row['key']], row['pos'])

        def rank(c):
            i, own, hit = c
            n = len(toks[i][3])
            amb = 1 if any(shared.get(h, 1) > 1 for h in hit) else 0
            if amb and gw & set(re.findall(r"[a-z]+", toks[i][2].lower())):
                amb = 0         # a shared form, but the translation says it is this word
            return (amb, own, 0 if 4 <= n <= 10 else 1, len(toks[i][1]), toks[i][0])
        picked = []
        for c in sorted(cands, key=rank):
            if c[0] in used:
                continue
            used.add(c[0])
            _, hi, en, _ = toks[c[0]]
            picked.append([hi, en, sorted(set(c[2]))])
            if len(picked) == 3:
                break
        out[row['key']] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  {len(pairs)} sentence pairs; three sentences for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
