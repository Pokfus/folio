#!/usr/bin/env python3
"""Stage 1: the whole Czech Wiktionary (kaikki.org extraction), reduced.

    python3 .claude/czech/extract.py

Reads `.claude/czech-cache/kaikki-cs.jsonl` (~250 MB) and writes
`.claude/czech-cache/dict.json`: word -> [entry], each entry carrying only what
the later stages read -- part of speech, the head template's gender or aspect
(a noun's `m-an` / `m-in` / `f` / `n` / `f-p`; a verb's `impf` / `pf` / `both`),
the aspect partner(s), senses (glosses, tags, the word a form-of sense points at)
and the inflection table, in its own order.

EVERY TABLE, NOT THE FIRST (where Polish cut at the second).  A Czech verb's
conjugation is printed as several boxes -- infinitive and participles, then the
present, then the future, then the past participle -- and kaikki opens each with a
`table-tags` row; cutting at the second one lost the present tense of every verb.
No Czech entry carries a second, older table (Old Czech is a language of its own
on Wiktionary, `zlw-ocs`, and is not in this extract).
"""
import json, os, re, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "czech-cache")
SKIP_POS = {"character", "symbol", "name", "affix", "prefix", "suffix", "infix", "interfix", "abbrev",
            "romanization", "punct", "combining_form", "contraction"}


def reduce(e):
    senses = []
    for s in e.get("senses", []):
        g = s.get("glosses") or s.get("raw_glosses") or []
        if not g:
            continue
        fo = [x.get("word") for x in (s.get("form_of") or []) + (s.get("alt_of") or []) if x.get("word")]
        senses.append({"g": g, "t": s.get("tags", []), "f": fo})
    forms, tables = [], 0
    for f in e.get("forms", []):
        tg = f.get("tags", [])
        if "table-tags" in tg:
            tables += 1
            continue
        if tables == 0:
            # before the table: comparative and superlative (the rest -- diminutives, relational adjectives,
            # the aspect partner -- is read from the head template's arguments instead)
            if "comparative" in tg or "superlative" in tg:
                forms.append([f.get("form", ""), tg])
            continue
        forms.append([f.get("form", ""), tg])
    head, partner = "", []
    for h in e.get("head_templates") or []:
        a = h.get("args") or {}
        if h.get("name") == "cs-noun":
            head = a.get("1", "")
        elif h.get("name") == "cs-verb":
            head = a.get("a", "")
            for lab, key in (("perfective", "pf"), ("imperfective", "impf")):
                for p in (a.get(key) or "").split(","):
                    p = p.split("<")[0].strip()
                    if p:
                        partner.append([p, [lab]])
        elif h.get("name") == "head" and a.get("g"):
            head = a.get("g")
        if head:
            break
    # A QUALIFIED GENDER IS NOT A REGISTER OF THE WORD.  `den` is headed `m-in,m-an<l:archaic,or,literary>` --
    # inanimate, and animate only in an archaic or literary use -- and kaikki copies the qualifier's labels onto
    # EVERY sense, so "day" came out archaic and the commonest noun of the list was refused.  The qualified
    # gender is dropped from the head, and its labels from every sense that carries them all.
    quals = set()
    if "<" in head:
        keep = []
        for g in re.split(r",(?![^<]*>)", head):        # a comma inside <l:archaic,or,literary> is the label's
            m = re.match(r"^([^<]+)<(?:l|q):([^>]*)>$", g)
            if m:
                quals |= set(re.split(r"[ ,]+", m.group(2)))
            else:
                keep.append(g)
        head = ",".join(keep)
    if quals:
        for s in senses:
            if quals & set(s["t"]):
                s["t"] = [t for t in s["t"] if t not in quals]
    # A TABLE OF ANOTHER VERB.  A dozen Czech verb pages pass the wrong stem to the conjugation template:
    # `sponzorovat`'s table is jmenovat's (jmenuji, jmenoval …), `zašeptat`'s dělat's, `zkontrolovat`'s
    # kontrolovat's.  Read as they are, `jmenovat se` lost every sentence (its forms were "claimed" by sponzorovat)
    # and sponzorovat took half its count.  A verb of six letters or more of which under a fifth of the cells
    # begin as the headword does is such a table, and its cells are dropped; the short suppletive verbs (`mít`
    # mám, `číst` čtu, `jít` jdu, `být` jsem) never reach six letters.
    if e.get("pos") == "verb" and len(e.get("word", "")) >= 6 and " " not in e.get("word", ""):
        k = deaccent(e["word"])[:2]
        cells = [f for f, t in forms if "infinitive" not in t and f and not f.startswith("-") and f != "-"
                 and "inflection-template" not in t]
        if len(cells) >= 10 and sum(deaccent(f).startswith(k) for f in cells) < len(cells) / 5:
            BAD_TABLES.append(e["word"])
            forms = [x for x in forms if "infinitive" in x[1]]
    return {"pos": e.get("pos"), "head": head, "partner": partner, "senses": senses, "forms": forms}


BAD_TABLES = []


def deaccent(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if not unicodedata.combining(c))


# A WORD THE DUMP CANNOT CARRY (Polish finding 3, again).  English Wiktionary splits its largest pages across
# subpages and the kaikki extraction carries no Czech entry from them: `i` ("and, even"), a conjunction on the
# official A1 list, is missing.  Its two senses are copied from the Czech section of
# https://en.wiktionary.org/wiki/i/languages_A_to_L (read 2026-11-16), the glosses only, in Wiktionary's
# words and order; nothing is added.  Same licence as the rest of the dictionary (CC BY-SA).
SUPPLIED = {
    "i": [{"pos": "conj", "head": "", "partner": [], "forms": [],
           "senses": [{"g": [g], "t": [], "f": []} for g in ("and (also), and even", "even")]}],
}


def main():
    src = os.path.join(CACHE, "kaikki-cs.jsonl")
    out, n = {}, 0
    with open(src, encoding="utf-8") as fh:
        for line in fh:
            e = json.loads(line)
            if e.get("lang_code") != "cs" or e.get("pos") in SKIP_POS:
                continue
            r = reduce(e)
            if not r["senses"]:
                continue
            out.setdefault(e["word"], []).append(r)
            n += 1
    for w, entries in SUPPLIED.items():
        if w not in out:
            out[w] = entries
            n += len(entries)
    with open(os.path.join(CACHE, "dict.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False)
    print("dict.json: %d entries over %d words; tables of another verb dropped: %s"
          % (n, len(out), ", ".join(BAD_TABLES)), file=sys.stderr)


if __name__ == "__main__":
    main()
