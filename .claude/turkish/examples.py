#!/usr/bin/env python3
"""Stage 3: three Tatoeba sentences for each word.

    python3 .claude/turkish/examples.py --level a1

Reads the Turkish and English Tatoeba exports and their links (cached by
`run.py`), and writes `.claude/turkish-cache/examples-<level>.json`:
word -> [{tr, en, hit}], `hit` being the token that matched, for the markup.

A WORD IS FOUND BY ITS OWN FORMS.  The forms are the dictionary's table for
the entries the card teaches (so `kitap` is found in `kitabı`, `gitmek` in
`gidiyorum`), matched as whole tokens after the Turkish fold -- never by
prefix, since Turkish words are long and a prefix match finds `ev` in `evet`.
A compound (`meyve suyu`) is matched as consecutive tokens, and an expression
ending in a verb (`ziyaret etmek`) with that verb in any of its forms.

WHICH THREE.  Shortest first between 3 and 12 words, then by Tatoeba id so a
re-run is identical; one sentence per Turkish text, and no two sharing an
English text, nor two opening with the same two words (Tatoeba carries
long runs of "Bunlar benim kitaplarım" / "Bunlar bizim kitaplarımız").  A sentence whose English is more than three times the length
of the Turkish, or less than a third, is skipped as a likely mismatch.
"""
import argparse, bz2, json, os, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tr

MIN_W, MAX_W, PER = 3, 12, 3


def read_tsv(name):
    with bz2.open(os.path.join(tr.CACHE, name), "rt", encoding="utf-8") as fh:
        for line in fh:
            yield line.rstrip("\n").split("\t")


OWN, PRON_CELLS = set(), {}


def others(D):
    """The spellings that belong to another word: every live lower-case headword's own spelling, and
    every cell of a pronoun's table (with the pronoun it is a cell of)."""
    if not OWN:
        for w, entries in D.items():
            if w != tr.fold(w) or " " in w:
                continue
            for e in entries:
                if tr.live(e):
                    OWN.add(w)
                    if e["pos"] == "pron":
                        for f, _ in tr.table_forms(e, w):
                            PRON_CELLS.setdefault(tr.fold(f), set()).add(w)
    return OWN, PRON_CELLS


def forms_of(D, word, strict=False):
    """The spellings a sentence may show the word in.

    `strict` (a single word's own card, since the beginner pass of Nov 2026): A FORM THAT IS ANOTHER
    WORD'S SPELLING FINDS NO SENTENCE.  Measured on A1 as shipped: `demek` "to say" carried `Ben de
    gittim` ("I also went": `de`, "too", is demek's imperative as well), `on` "ten" three sentences of
    `onu / onun / ondan` ("him, his, from him": cells of `o`), `varmak` "to arrive" three of `var`
    "there is", `iç` "inside" two of `için` "for", `ay` "moon" a bear (`ayı`), `mart` a seagull.  So a
    table form other than the word's own spelling is dropped when it is the spelling of another live
    headword, or a cell of a pronoun's table; and a verb whose bare stem is a word of its own (`var`,
    `et`, `geç`) loses every form that word's table also carries (`vardı` is "there was" far oftener
    than "arrived").  A pronoun's own card keeps every cell (`benim` has an entry of its own, and is
    `ben`'s all the same -- `select.py` says so for the count).  It costs a verb the sentences of a form that is also a noun
    (`okur` "reader", `girdi` "input", `bak` "look!") and never a card its sentences: a verb has
    hundreds of other cells.  What no rule here sees is a word whose OWN spelling is ambiguous: `bin`
    "thousand" still finds `Bir otobüse bin` ("take a bus"), `hala` "aunt" a `hâlâ` written plain."""
    me = tr.fold(word)
    out = {me}
    own, cells = others(D) if strict else (set(), {})
    is_pron = any(e["pos"] == "pron" and tr.live(e) for e in D.get(word, []))
    for e in D.get(word, []):
        if tr.live(e):
            # a pronoun's table carries its plural as cells (`ben` -> `biz`, `bizim`), and those are
            # other cards' words; a noun's plural is its own word's plural and stays
            out |= {tr.fold(f) for f, t in tr.table_forms(e, word)
                    if " " not in f and not (e["pos"] == "pron" and "plural" in t)}
    if strict and not is_pron:
        out = {f for f in out if f == me or not (f in own or cells.get(f, set()) - {word})}
        stem = me[:-3]
        if me.endswith(("mak", "mek")) and stem in own and any(e["pos"] == "verb" for e in D.get(word, [])):
            out -= {tr.fold(f) for e in D[stem] if tr.live(e) for f, _ in tr.table_forms(e, stem)} - {me}
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    a = ap.parse_args()
    D = tr.load_dict()
    words = [x["word"] for x in json.load(open(os.path.join(tr.CACHE, "wordlist-%s.json" % a.level)))["words"]]

    tur = {r[0]: r[2] for r in read_tsv("tur_sentences.tsv.bz2") if len(r) >= 3}
    links = defaultdict(list)
    for r in read_tsv("tur-eng_links.tsv.bz2"):
        if len(r) >= 2 and r[0] in tur:
            links[r[0]].append(r[1])
    need = {e for v in links.values() for e in v}
    eng = {r[0]: r[2] for r in read_tsv("eng_sentences.tsv.bz2") if len(r) >= 3 and r[0] in need}

    pool = []                          # (n_tokens, int id, tokens, tr, en)
    for sid, text in tur.items():
        en = [eng[e] for e in sorted(links.get(sid, []), key=int) if e in eng]
        if not en:
            continue
        toks = tr.tokens(text)
        toks = [t.split("'")[0] for t in toks]
        # a set phrase is often a whole sentence of two words ("Bol şans!"), so the phrases deck admits them
        # ...and so do the record's added cards (`inserts.py`, level `ins`): `Merhaba, nasılsın?`
        if not ((2 if a.level in ("phr", "ins") else MIN_W) <= len(toks) <= MAX_W):
            continue
        r = len(en[0]) / max(1, len(text))
        if r > 3 or r < 1 / 3:
            continue
        pool.append((len(toks), int(sid), toks, text, en[0]))
    pool.sort(key=lambda x: (x[0], x[1]))
    index = defaultdict(list)
    for i, (_, _, toks, _, _) in enumerate(pool):
        for t in set(toks):
            index[t].append(i)

    out, none = {}, []
    for w in words:
        parts = tr.tokens(w) if " " in w else [tr.fold(w)]   # `bir varmış, bir yokmuş`: no comma kept
        if len(parts) > 1:
            # AN EXPRESSION THAT ENDS IN A VERB is met inflected (`Fransız kaldım` for `Fransız kalmak`,
            # `ziyaret ettik`), so its last token may be any cell of that verb's table; the hit is the
            # tokens actually matched, which is what the markup looks for
            last = {parts[-1]}
            # ...only when the expression IS a verb: `ne demek` ("you're welcome") is not `demek` inflected
            if parts[-1].endswith(("mak", "mek")) and parts[-1] in D and \
                    any(e["pos"] == "verb" for e in D.get(w, [])):
                last = forms_of(D, parts[-1])
            head = parts[:-1]
            cand = sorted(set(index.get(parts[0], [])))

            def hit_of(toks, head=head, last=last, n=len(parts)):
                for i in range(len(toks) - n + 1):
                    if toks[i:i + n - 1] == head and toks[i + n - 1] in last:
                        return " ".join(toks[i:i + n])
                return None
        else:
            fs = forms_of(D, w, strict=True)
            cand = sorted({i for f in fs for i in index.get(f, [])})
            hit_of = lambda toks: next((t for t in toks if t in fs), None)
        got, seen_tr, seen_en, seen_frame = [], set(), set(), set()
        for i in cand:
            _, _, toks, text, en = pool[i]
            h = hit_of(toks)
            frame = tuple("_" if t == h else t for t in toks)      # the sentence with its hit blanked
            frame = (frame, len(toks)) if len(toks) > 3 else (tuple(toks),)
            if not h or text in seen_tr or en in seen_en or frame[0][:2] in seen_frame:
                continue
            seen_tr.add(text); seen_en.add(en); seen_frame.add(frame[0][:2])
            got.append({"tr": text, "en": en, "hit": h})
            if len(got) == PER:
                break
        out[w] = got
        if not got:
            none.append(w)
    with open(os.path.join(tr.CACHE, "examples-%s.json" % a.level), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print("examples-%s.json: %d of %d words have a sentence (pool %d); none for: %s"
          % (a.level, len(words) - len(none), len(words), len(pool), ", ".join(none) or "-"), file=sys.stderr)


if __name__ == "__main__":
    main()
