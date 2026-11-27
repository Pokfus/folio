#!/usr/bin/env python3
"""Up to three Tatoeba sentences for each word, matched on its forms.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`swh_sentences_detailed.tsv`, `swh-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Swahili, English, [matched tokens]] triples.

A sentence matches a word when one of its tokens is the word, one of the forms
its CARD shows (a plural, an infinitive, a command, an agreeing form of the five
class pairs), or -- for a verb -- a token the verb parser reads as prefix + the
verb's stem (`nilisoma`, `hatutasoma`: `sw.VerbParser`); never a spelling that is
another card's own headword (`forms_of`, the beginner pass of Nov 2026).  A
multi-word entry matches its words in sequence; `-wa na`, to have, by the cells
of its table (`nina`, `hana`, `kuna`).  The choice is deterministic: the headword's own spelling first, then
sentences of four to ten words, then the shorter, then the lower sentence id --
so a re-run is byte-identical.  A sentence with several English translations
takes the shortest.  Each sentence is used at most once per deck.

Tatoeba holds only about 4,500 Swahili sentences, so many words get fewer than
three, and some none; the deck's description counts them.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sw import norm, tokens, VerbParser, infinitive, shown_forms
from swahili_level import f, LEVEL

csv.field_size_limit(10 ** 8)


def load():
    swh = {}
    for row in csv.reader(open('swh_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            swh[row[0]] = row[2].strip()
    links = {}
    for row in csv.reader(open('swh-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in swh:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for sid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(sid), swh[sid], en[0]))
    pairs.sort()
    return pairs


def shown_entries(row, lex):
    """The entries of a lemma that its CARD shows (`build_deck.entries_for`: one etymology
    unless named, three parts of speech at most)."""
    from build_deck import entries_for
    return entries_for(row, lex)


def forms_of(row, lex, others):
    """The spellings that show a one-word card in a sentence, and a verb parser if it is a
    verb.  THE BEGINNER PASS (Nov 2026) made three rules of this, each for a fault read on
    A1's cards:
      · ONLY THE ENTRIES THE CARD SHOWS.  `unga` is "flour" on its card and also the verb
        "to join", an etymology the card leaves out: its sentences were `kujiunga`.
      · A VERB'S BARE STEM IS A FORM ONLY WHERE IT IS ITS COMMAND.  `soma` is "read!"; but the
        command of `-wa` is `kuwa` and of `-la` is `kula`, and the bare `wa` and `la` of a
        sentence are the genitive, "of": all three sentences of `kuwa`, to be, were `watu wa
        ajabu`.  The commands the card shows (`nenda`, `njoo`, `someni`) are forms.
      · A SPELLING THAT IS ANOTHER CARD'S OWN HEADWORD IS THAT CARD'S (`others`): `kwamba`
        "that" is not a sentence of `amba`, nor `kwenye` "at" of `-enye`, nor `kidogo` "a
        little" of `-dogo`."""
    k = row['key']
    forms, verb, stem_ok = {norm(row['say']).lstrip('-')}, False, False
    ents = [e for e in shown_entries(row, lex) if not row['pos'] or e['pos'] == row['pos']]
    for e in ents:
        forms.update(x for x in e['plural'] + [e['neginf']] if x)
        # an agreeing word: the cells its card shows, where its table can be read; a stem
        # that is never said bare (`-a`, "of") is no form of itself
        cells = shown_forms(e) if e['pos'] != 'verb' else set()
        forms.update(cells or e['agree'])
        if cells and e['canon'] and k not in cells:
            forms.discard(k)
            continue
        if e['pos'] == 'verb':
            forms.add(infinitive(k, e))
            verb = True
            imp = (e.get('conj') or {}).get('imperative') or []
            forms.update(imp)
            stem_ok = stem_ok or not imp or imp[0] == k
        else:
            stem_ok = True
    if stem_ok:
        forms.add(k)
    forms -= others
    parser = None
    if verb:
        parser = VerbParser()
        parser.add(k)
    return forms, parser


def have_cells(row, lex, taken):
    """The one-word forms of `-wa na` (nina, una, ana ... sina, hana ... kuna, hakuna), less
    any that is another card's headword or plural (`wana` is also "children")."""
    out = set()
    for e in lex[row['key']]['entries']:
        c = e.get('conj') or {}
        if 'there' not in c:
            continue
        out.update(c.get('present', {}).values())
        out.update(c.get('negative', {}).values())
        out.update([c['there'], c.get('there_not', '')])
    return {x for x in out if x and ' ' not in x} - taken


def corpus():
    pairs = load()
    toks = [(pid, s, en, tokens(s)) for pid, s, en in pairs]
    index = {}
    for i, (_, _, _, ft) in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    return toks, index


def pick(rows, lex, toks, index, used=None, says=None):
    """Up to three sentences for each row.  `used` holds the sentences already given out (a
    sentence is used once per deck), and `says` the deck's headwords -- both are passed in
    by `inserts.py`, which finds the sentences of the cards the record adds to A1 after
    A1's own rows have taken theirs."""
    used = set() if used is None else used
    out = {}
    infinitives = {e['inf'] for L in lex.values() for e in L['entries'] if e['inf']}
    # every headword of the deck, as spoken, and every plural a noun card shows
    says = dict(says or {})
    says.update({norm(r['say']).lstrip('-'): r['key'] for r in rows})
    taken = set(says)
    for r in rows:
        for e in shown_entries(r, lex):
            taken.update(e['plural'])
    for row in rows:
        others = {w for w, k in says.items() if k != row['key']}
        words = row['key'].split()
        cands = []
        if len(words) > 1:
            # THE PHRASES DECK'S VERB PHRASES match with the head conjugated (`alipiga simu`),
            # as select.phrase_counts counts them; the levels keep the exact sequence.
            head = None
            if LEVEL == 'phr' and any(e['pos'] == 'verb' for e in lex[row['key']]['entries']):
                head = VerbParser()
                head.add(words[0])
            starts = (index.get(words[0], []) if head is None else
                      sorted({i for t, ids in index.items()
                              if t == words[0] or words[0] in head.lemmas(t)
                              or (t[:2] in ('ku', 'kw') and t[2:] == words[0]) for i in ids}))
            for i in starts:
                ft = toks[i][3]
                for j in range(len(ft) - len(words) + 1):
                    first = ft[j]
                    if ft[j + 1:j + len(words)] == words[1:] and (
                            first == words[0] or (head is not None and (
                                words[0] in head.lemmas(first)
                                or (first[:2] in ('ku', 'kw') and first[2:] == words[0])))):
                        cands.append((i, 0, ft[j:j + len(words)]))
                        break
        else:
            k = row['key']
            forms, parser = forms_of(row, lex, others)
            seen = set()
            for t, ids in index.items():
                if t in forms or (parser and t not in others and k in parser.lemmas(t)):
                    for i in ids:
                        if i in seen:
                            continue
                        seen.add(i)
                        hit = [x for x in toks[i][3] if x in forms
                               or (parser and x not in others and k in parser.lemmas(x))]
                        cands.append((i, 0 if norm(row['say']) in hit or k in hit else 1, hit))
        if not cands and len(words) > 1:
            # `-wa na`, to have, is never written as its words in sequence: it is `nina`, `ana`,
            # `hana`, `kuna` -- the cells of its table, which its card shows since the beginner pass
            cells = have_cells(row, lex, taken)
            for i, (_, _, _, ft) in enumerate(toks):
                # `Papa ana kula samaki` is `anakula` written as two words, not "has"
                hit = [x for j, x in enumerate(ft) if x in cells
                       and not (j + 1 < len(ft) and ft[j + 1] in infinitives)]
                if hit:
                    cands.append((i, 0, hit))

        def rank(c):
            i, own, _ = c
            n = len(toks[i][3])
            return (own, 0 if 4 <= n <= 10 else 1, len(toks[i][1]), toks[i][0])
        picked = []
        for c in sorted(cands, key=rank):
            if c[0] in used:
                continue
            used.add(c[0])
            _, s, en, _ = toks[c[0]]
            picked.append([s, en, sorted(set(c[2]))])
            if len(picked) == 3:
                break
        out[row['key']] = picked
    return out


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    toks, index = corpus()
    out = pick(rows, lex, toks, index)
    pairs = toks
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  {len(pairs)} sentence pairs; three sentences for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
