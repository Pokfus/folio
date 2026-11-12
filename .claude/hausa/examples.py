#!/usr/bin/env python3
"""Three Tatoeba sentences for each word, matched on its forms.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`hau_sentences_detailed.tsv`, `hau-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Hausa, English, [matched keys]] triples.

A sentence matches a word when one of its tokens is the word, a form Wiktionary
or `hand.py` lists for it (a plural, a feminine, a possessed form), or one of
those with a linker or possessive suffix (`ha.stems`: `gidansa` for `gida`),
compared through `ha.norm`.  A two-word entry (`ruwan sama`) matches its words
in sequence.

THE CHOICE IS DETERMINISTIC, so a re-run is byte-identical: a token spelt exactly
as the headword is (hooks included) first, then a form or a suffixed token, then
a match only through the hook fallback (`ha.loose`, four letters or more) --
which is how the sentences that DO write the hooks come first; then sentences of
four to ten words, then the shorter, then the lower sentence id.  A Hausa
sentence with several English translations takes the shortest.  Each sentence is
used at most once per deck.
"""
import csv, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ha import nfc, norm, loose, tokens, stems
from hausa_level import LEVEL, LEX, f

csv.field_size_limit(10 ** 8)

# A SENTENCE NEVER SHOWN (A2 on, 2026-11-12): sexual or vulgar, read off its English.
# Tatoeba's Hausa has a few (`Ya kama nono na`, under kama "to catch").  Not applied to A1,
# which shipped before the rule: it would change one of A1's sentences (ƙarami's).
BLOCK_EN = re.compile(r"(?i)\b(?:breasts?|penis|sex|sexual|cocaine|fuck\w*|shit|pee|whore)\b")

# A WORD WHOSE SPELLING IN THE CORPUS IS MOSTLY ANOTHER WORD'S: Tatoeba drops the hooks
# and joins words (`bashi` is "ba shi", give him; `yaji` "ya ji", he felt; `tsani` "na
# tsani", I hate; `ɗinka` the possessive -ɗinka; `raƙuman ruwa` waves; `mayu` witches;
# `kura` ƙura, dust; `Sara` a name).  Its sentences must say the word's meaning in English.
EX_NEED = {
    'bashi': r'(?i)\b(?:debts?|loans?|owe\w*|lend\w*|borrow\w*|credit)\b',
    'yaji': r'(?i)\b(?:spic\w*|pepper\w*)\b',
    'tsani': r'(?i)\bladders?\b',
    'ɗinka': r'(?i)\b(?:sew\w*|stitch\w*|tailor\w*)\b',
    'sara': r'(?i)\b(?:chop\w*|cut\w*)\b',
    'kura': r'(?i)\bhyenas?\b',
    'mayu': r'\bMay\b',
    'raƙumi': r'(?i)\bcamels?\b',
    'bana': r'(?i)\bthis year\b',            # B1: mostly "ba na", I do not
    # B1 (2026-11-12): read off the cards, each a homograph or a joined spelling
    'tace': r'(?i)\b(?:filter\w*|strain\w*|sieve\w*)\b',
    'huce': r'(?i)\b(?:cool\w*|calm\w*)\b',
    'suma': r'(?i)\b(?:faint\w*|pass(?:ed)? out)\b',
    'daka': r'(?i)\b(?:pound\w*|mortar)\b',
    'kunshi': r'(?i)\bhenna\b',
    'wayewa': r'(?i)\b(?:civili[sz]\w*|enlighten\w*)\b',
    'raina': r'(?i)\b(?:despis\w*|look\w* down|contempt\w*|scorn\w*)\b',
    'sufuri': r'(?i)\btransport\w*\b',
    'ɗauri': r'(?i)\b(?:prison\w*|jail\w*|imprison\w*)\b',
    'fulawa': r'(?i)\bflour\b',
    'kwali': r'(?i)\b(?:box\w*|carton\w*|cardboard)\b',
    'jemage': r'(?i)\bbats\b',
    'tsinke': r'(?i)\b(?:snap\w*|broke\w*|break\w*)\b',
    'akanta': r'(?i)\baccountant\w*\b',
    'gogewa': r'(?i)\bexperience\w*\b',
    'kunsa': r'(?i)\bwrap\w*\b',
    'leda': r'(?i)\b(?:plastic|bags?)\b',
    'ƙuna': r'(?i)\bburn\w*\b',
    'juye': r'(?i)\bpour\w*\b',
    'kewaya': r'(?i)\b(?:round|around|surround\w*|orbit\w*|circl\w*)\b',
    'kitse': r'(?i)\bfat\b',
    'leshi': r'(?i)\blace\b',
    'nakasa': r'(?i)\b(?:disab\w*|handicap\w*|crippl\w*)\b',
    'ladan': r'(?i)\b(?:muezzin|call to prayer)\b',
    'saƙa': r'(?i)\b(?:weav\w*|knit\w*|wove\w*)\b',
    'kiba': r'(?i)\b(?:weight|overweight|obes\w*)\b',
}


def load():
    hau = {}
    for row in csv.reader(open('hau_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            hau[row[0]] = nfc(row[2]).strip()
    links = {}
    for row in csv.reader(open('hau-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in hau:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for hid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(hid), hau[hid], en[0]))
    pairs.sort()
    return pairs


def forms_of(row, lex):
    out = {norm(row['word'])}
    for e in lex[row['key']].get('entries', []):
        for fm in e['forms']:
            out.add(norm(fm['f']))
    return out


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open(LEX, encoding='utf-8'))
    pairs = load()
    toks = [(pid, ha, en, [norm(t) for t in tokens(ha)]) for pid, ha, en in pairs]
    index = {}
    for i, (_, _, _, nt) in enumerate(toks):
        for t in set(nt):
            index.setdefault(t, []).append(i)
            for st in stems(t):
                index.setdefault(st, []).append(i)
            if len(t) >= 4:
                index.setdefault('~' + loose(t), []).append(i)
    used, out = set(), {}
    for row in rows:
        words = norm(row['word']).split()
        cands = []
        if len(words) > 1:
            for i in index.get(words[0], []):
                nt = toks[i][3]
                for j in range(len(nt) - len(words) + 1):
                    if nt[j:j + len(words)] == words:
                        cands.append((i, 0, words))
                        break
        else:
            w = words[0]
            forms = forms_of(row, lex)
            seen = set()
            for fm in sorted(forms):
                for i in index.get(fm, []):
                    if i in seen:
                        continue
                    nt = toks[i][3]
                    hit = [t for t in nt if t in forms or any(s in forms for s in stems(t))]
                    if not hit:
                        continue
                    seen.add(i)
                    cands.append((i, 0 if w in nt else 1, hit))
            if len(w) >= 4:
                lw = {loose(x) for x in forms}
                for x in sorted(lw):
                    for i in index.get('~' + x, []):
                        if i in seen:
                            continue
                        seen.add(i)
                        hit = [t for t in toks[i][3] if loose(t) in lw]
                        cands.append((i, 2, hit))

        def rank(c):
            i, own, _ = c
            n = len(toks[i][3])
            return (own, 0 if 4 <= n <= 10 else 1, len(toks[i][1]), toks[i][0])
        picked = []
        need = re.compile(EX_NEED[row['key']]) if row['key'] in EX_NEED else None
        for c in sorted(cands, key=rank):
            if c[0] in used:
                continue
            if (LEVEL != 'a1' and BLOCK_EN.search(toks[c[0]][2])) or \
                    (need and not need.search(toks[c[0]][2])):
                continue
            used.add(c[0])
            _, ha, en, _ = toks[c[0]]
            picked.append([ha, en, sorted(set(c[2]))])
            if len(picked) == 3:
                break
        out[row['key']] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  {len(pairs)} sentence pairs; three sentences for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
