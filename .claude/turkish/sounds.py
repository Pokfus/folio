#!/usr/bin/env python3
"""The Turkish sounds table's two ties to its sources.

    python3 .claude/turkish/sounds.py --fill      # write each example word's transcription from Wiktionary
    python3 .claude/turkish/sounds.py --verify    # every cell and quotation is in its pinned Wikipedia revision

`.claude/decks/turkish-sounds.json` is the table `build-turkish-sounds.js` turns into
`decks/Turkish-Sounds-and-Spelling.folio-deck.json`.  Nothing in it is composed, and this script is how
that is kept true (the beginner pass of Nov 2026; docs/lang-decks.md, "The Turkish beginner pass").

--fill   reads `.claude/turkish-cache/kaikki-tr.jsonl` (the generator's own cache) and sets the
         transcription beside every example word to the FIRST one the word's Turkish entry gives; a word
         with none gets "".  No transcription is typed.
--verify fetches the four revisions the table names (curl, into the cache: Wikipedia answers Python's
         default client with 429, and its API with a rate limit, so the page is read as
         index.php?oldid=<rev>&action=raw), strips the wiki markup, and checks that every `like` and
         `ipa` cell, every `name`, every quotation of every `says` and every static pair is a run of
         consecutive words of its page.  A cut is marked […] and each side of it is checked.

Both need the network or the cache, so neither is a CI step; `build-turkish-sounds.js --check` is.
"""
import argparse, json, os, re, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "turkish-cache")
TABLE = os.path.join(HERE, "..", "decks", "turkish-sounds.json")


def fill(T):
    want = {w for g in ("vowels", "consonants") for r in T[g] for row in r["rows"] for w, _ in row["words"]}
    want |= {w for r in T["rules"] for w, _ in r.get("words", [])}
    ipa = {}
    with open(os.path.join(CACHE, "kaikki-tr.jsonl"), encoding="utf-8") as fh:
        for line in fh:
            if '"ipa"' not in line:
                continue
            e = json.loads(line)
            if e.get("lang_code") == "tr" and e["word"] in want and e["word"] not in ipa:
                got = [s["ipa"] for s in e.get("sounds", []) if s.get("ipa")]
                if got:
                    ipa[e["word"]] = got[0]
    def do(words):
        for p in words:
            p[1] = ipa.get(p[0], "")
    for g in ("vowels", "consonants"):
        for r in T[g]:
            for row in r["rows"]:
                do(row["words"])
    for r in T["rules"]:
        do(r.get("words", []))
    none = sorted(w for w in want if w not in ipa)
    print("filled %d transcriptions; none in Wiktionary for: %s" % (len(ipa), ", ".join(none) or "-"))


def wikitext(rev):
    p = os.path.join(CACHE, "wp-%d.wiki" % rev)
    if not os.path.exists(p):
        time.sleep(3)
        r = subprocess.run(["curl", "-sSf", "-A", "deck-tooling/1.0",
                            "https://en.wikipedia.org/w/index.php?oldid=%d&action=raw" % rev],
                           check=True, capture_output=True)
        open(p, "wb").write(r.stdout)
    return open(p, encoding="utf-8").read()


def flat(w):
    """Wiki markup to the words a reader sees, near enough to find a quotation in."""
    w = re.sub(r"<ref[^>]*/>", "", w)
    w = re.sub(r"<ref[^>]*>.*?</ref>", "", w, flags=re.S)
    w = w.replace("<sup>4</sup>", "⁴").replace("<sup>2</sup>", "²")
    w = re.sub(r"<br\s*/?>", " ", w)
    for _ in range(6):                                   # innermost templates first
        w = re.sub(r"\{\{(?:IPAslink|IPA link)\|([^{}|]*)(?:\|[^{}]*)?\}\}", r"/\1/", w)
        w = re.sub(r"\{\{IPAblink\|([^{}|]*)(?:\|[^{}]*)?\}\}", r"[\1]", w)
        w = re.sub(r"\{\{angbr(?: IPA)?\|([^{}|]*)\}\}", r"⟨\1⟩", w)
        w = re.sub(r"\{\{(?:lang|transliteration|wikt-lang)\|[^{}|]*\|([^{}|]*)\}\}", r"\1", w)
        w = re.sub(r"\{\{IPA\|([^{}|]*)\}\}", r"\1", w)
        w = re.sub(r"\{\{(?:sfnp|Harvcoltxt|Clarify|cite|Cite|citation)[^{}]*\}\}", "", w)
        w = re.sub(r"\{\{efn\|(?:name=[^{}|]*\|)?([^{}]*)\}\}", r" \1 ", w)   # a note's text stays, in place
        w = re.sub(r"\{\{`\}\}", "'", w)
    w = re.sub(r"\[\[(?:[^\]|]*\|)?([^\]]*)\]\]", r"\1", w)
    w = re.sub(r"'{2,}", "", w)
    w = re.sub(r"<[^>]+>", "", w)
    w = re.sub(r"^\*+\s*", "", w, flags=re.M)
    w = w.replace("&nbsp;", " ")
    return re.sub(r"\s+", " ", w)


def norm(s):
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", s).strip()


def verify(T):
    pages = {k: flat(wikitext(v["revid"])) for k, v in T["sources"].items() if "revid" in v}
    bad = 0
    n = 0

    def want(what, text, src):
        nonlocal bad, n
        for part in norm(text).split("[…]"):
            # a bullet list is quoted with its bullets as semicolons: each item is checked by itself
            for item in ([part] if part.strip() in pages[src] else re.split(r"[;:] ", part)):
                item = item.strip().rstrip(".;:")
                if not item:
                    continue
                n += 1
                if item not in pages[src]:
                    bad += 1
                    print("FAIL  %s: not in %s (revision %d): %s" % (what, T["sources"][src]["title"], T["sources"][src]["revid"], item[:110]))

    for g in ("vowels", "consonants"):
        for r in T[g]:
            for row in r["rows"]:
                for cell in row["ipa"].split(", "):
                    want(r["key"] + " ipa", cell.strip("/") if cell.startswith("/") else cell, "alphabet")
                if row["like"]:
                    want(r["key"] + " like", row["like"], "alphabet")
            if r.get("name"):
                want(r["key"] + " name", r["name"], "alphabet")
            for q, src in zip(r.get("says", []), r.get("src", [])):
                want(r["key"] + " says", q, src)
    for r in T["rules"]:
        if len(r["says"]) != len(r["src"]):
            raise SystemExit(r["key"] + ": says and src differ in length")
        for q, src in zip(r["says"], r["src"]):
            want(r["key"] + " says", q, src)
        for p in r.get("pairs", []):
            want(r["key"] + " pair", p[0] + " (" + p[1] + ")", "grammar")
    if bad:
        raise SystemExit("%d of %d cells and quotations are not in their page" % (bad, n))
    print("sounds --verify: %d cells and quotations, each in its pinned revision (%s)" % (
        n, ", ".join("%s %d" % (v["title"], v["revid"]) for v in T["sources"].values() if "revid" in v)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fill", action="store_true")
    ap.add_argument("--verify", action="store_true")
    a = ap.parse_args()
    T = json.load(open(TABLE, encoding="utf-8"))
    if a.fill:
        fill(T)
        with open(TABLE, "w", encoding="utf-8") as fh:
            json.dump(T, fh, ensure_ascii=False, indent=1)
            fh.write("\n")
    if a.verify or not a.fill:
        verify(T)


if __name__ == "__main__":
    main()
