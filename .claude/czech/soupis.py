#!/usr/bin/env python3
"""The official A1 and A2 word list, read from the exam board's own search tool.

    python3 .claude/czech/soupis.py        # fetches into .claude/czech-cache/soupis/, writes soupis.json

WHAT IT IS.  The National Pedagogical Institute of the Czech Republic (NPI ČR) runs the
Czech exam for permanent residence and publishes, as an appendix to its *Referenční popis
češtiny pro účely zkoušky z českého jazyka pro trvalý pobyt v ČR – úrovně A1, A2*, the
"Soupis lexikálních jednotek": every word, phrase (`fráze`), collocation (`sousloví`) and
government pattern (`vazba`) of levels A1 and A2, each with its level, part of speech,
gender, number and aspect.  It is published as a search tool at
https://cestina-pro-cizince.cz/trvaly-pobyt/pro-ucitele/soupis-lexikalnich-jednotek/
whose AJAX endpoint answers a level and a type with the whole table in one page.

WHAT IS TAKEN.  The entries and their columns -- the exam's SCOPE -- and nothing else (the
Goethe line, `.claude/goethe/parse_goethe.py`): meanings come from Wiktionary, sentences
from Tatoeba.  `vazba` entries (`čekat na`, `chtít + infinitiv`) are patterns, not
headwords, and are read but not taught.

THE TABLE'S OWN NOTATION, kept raw here and resolved in `select.py`:
  * a parenthesis is the sense meant -- `jazyk (část těla)` and `jazyk (řeč)`, "tongue"
    and "language", are two rows of one headword;
  * a slash is alternatives -- `kuchyň/kuchyně`, `nerad/a/i` (the feminine and plural
    endings);
  * a reflexive verb is written with its clitic -- `bát se`, `dát si`.
"""
import html, json, os, re, subprocess, sys, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "czech-cache")
ENDPOINT = ("https://cestina-pro-cizince.cz/trvaly-pobyt/wp-content/themes/newspotrika/inc/"
            "soupis-lexikalnich-jednotek/rejstrikAjax.php")
LEVELS = ("a1", "a2")
TYPES = ("slovo", "fráze", "sousloví", "vazba")
COLS = ("text", "level", "type", "pos", "gender", "number", "aspect", "chapters")
ROW = re.compile(r"<tr><td>(.*?)</td><td>(.*?)</td><td>(.*?)</td><td>(.*?)</td><td>(.*?)</td>"
                 r"<td>(.*?)</td><td>(.*?)</td><td>(.*?)</td></tr>", re.S)


def page(level, typ):
    d = os.path.join(CACHE, "soupis")
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, "%s-%s.html" % (level, typ))
    if not os.path.exists(p):
        q = urllib.parse.urlencode({"action": "hint", "typ_hledani": "", "slovo": "", "varianta": level,
                                    "typ": typ, "p": ""})
        print("== fetch soupis %s %s" % (level, typ), file=sys.stderr)
        subprocess.run(["curl", "-sSf", "-o", p, ENDPOINT + "?" + q], check=True)
    return open(p, encoding="utf-8").read()


def clean(c):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", c))).strip()


def main():
    out = {}
    for lv in LEVELS:
        rows = []
        for typ in TYPES:
            got = [dict(zip(COLS, (clean(c) for c in r))) for r in ROW.findall(page(lv, typ))]
            # the endpoint answers the level asked; a row of another level would mean the query was not honoured
            bad = [r["text"] for r in got if r["level"].lower() != lv]
            if bad or not got:
                raise SystemExit("soupis %s %s: %d rows, %d of another level" % (lv, typ, len(got), len(bad)))
            rows.extend(got)
        out[lv] = rows
        print("soupis %s: %d rows (%s)" % (lv, len(rows), ", ".join(
            "%s %d" % (t, sum(r["type"] == t for r in rows)) for t in TYPES)), file=sys.stderr)
    with open(os.path.join(CACHE, "soupis.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=0)


if __name__ == "__main__":
    main()
