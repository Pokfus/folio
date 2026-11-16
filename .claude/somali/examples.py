#!/usr/bin/env python3
"""Example sentences for each word: its own Wiktionary examples, then Tatoeba's.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, the level's lexicon and the Tatoeba exports
(`som_sentences_detailed.tsv`, `som-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Somali sentence as HTML, English] rows, the word in bold.

THERE ARE FEW, AND THE DECK SAYS SO.  Tatoeba holds about 125 Somali sentences
with an English translation and Wiktionary about 30 usage examples, so most
cards have none.  Nothing is generated to fill the gap, and a dated QUOTATION is
never used: only Wiktionary's plain usage examples (`extract.py`).

THE WORD'S OWN WIKTIONARY EXAMPLES COME FIRST, with the word in bold where
Wiktionary bolds it; then Tatoeba sentences in which a token is the word's
ordinary spelling, compared in lower case -- the word as written, never one of
its suffixed forms, so a sentence is shown only where the card's own spelling
stands in it.  The choice is deterministic -- the shorter first, then the lower
id -- so a re-run is byte-identical, and a Tatoeba sentence is used at most once
per deck.
"""
import csv, html, json, os, sys, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from so import nfc, tokens
from somali_level import f, LEX

csv.field_size_limit(10 ** 8)
E = lambda s: html.escape(s, quote=False)


def load():
    som = {}
    for row in csv.reader(open('som_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            som[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('som-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in som:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for yid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(yid), som[yid], en[0]))
    pairs.sort()
    return pairs


def letter(ch):
    return bool(ch) and (ch.isalpha() or unicodedata.combining(ch) > 0)


def wikt_html(raw, spans):
    """Wiktionary's example with its bold spans (offsets into the text as Wiktionary has it).
    A SPAN THAT IS NOT A WHOLE WORD IS DROPPED: for a short word the extraction marks every
    place the letters occur (the a of àgbàlagbà, of máa, under `a` "we")."""
    out, at = [], 0
    for a, b in sorted(spans):
        if a < at or b > len(raw) or letter(raw[a - 1:a]) or letter(raw[b:b + 1]):
            continue
        out.append(E(raw[at:a]))
        out.append(f'<b>{E(raw[a:b])}</b>')
        at = b
    out.append(E(raw[at:]))
    return nfc(''.join(out))


def tatoeba_html(sentence, word):
    """The sentence with every run of tokens that spells the word in bold, or None."""
    want = [t.lower() for t in tokens(word)]
    toks = list(__import__('so').TOKEN.finditer(sentence))
    low = [m.group(0).lower() for m in toks]
    hits = [i for i in range(len(low) - len(want) + 1) if low[i:i + len(want)] == want]
    if not hits:
        return None
    out, at = [], 0
    for i in hits:
        a, b = toks[i].start(), toks[i + len(want) - 1].end()
        if a < at:
            continue
        out.append(E(sentence[at:a]))
        out.append(f'<b>{E(sentence[a:b])}</b>')
        at = b
    out.append(E(sentence[at:]))
    return ''.join(out)


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open(LEX, encoding='utf-8'))['lemmas']
    pairs = load()
    used, out = set(), {}
    for row in rows:
        L = lex[row['key']]
        ents = sorted(L['entries'], key=lambda e: bool(row['pos']) and e['pos'] != row['pos'])
        got, seen = [], set()
        for e in ents:
            for tx, en, spans, raw in e.get('ex', []):
                if tx in seen:
                    continue
                seen.add(tx)
                got.append([wikt_html(raw, spans), en])
        for pid, so_, en in pairs:
            if len(got) >= 3:
                break
            if pid in used:
                continue
            h = tatoeba_html(so_, L['word'])
            if h and en not in {g[1] for g in got}:      # one English, once a card (Burj Khalifa x2)
                used.add(pid)
                got.append([h, en])
        if got:
            out[row['key']] = got[:3]
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False,
              sort_keys=True)
    print(f'  sentences for {len(out)} of {len(rows)} words')


if __name__ == '__main__':
    main()
