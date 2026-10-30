#!/usr/bin/env python3
"""Stage 2 for the phrases deck: Turkish set phrases, idioms and proverbs.

    python3 .claude/turkish/phrases.py          # writes wordlist-phr.json; run.py --level phr runs it

Not a CEFR level, and not built from the programme's vocabulary columns: an expression is a unit a list
of words cannot see, which is why the level decks teach so few of them.  Three subdecks, as the
Indonesian phrases deck has:

  Phrases   the everyday formulas -- `afiyet olsun`, `geçmiş olsun`, `kolay gelsin` -- which Wiktionary
            files as interjections and phrases of more than one word, not tagged idiomatic;
  Idioms    an expression of more than one word whose meaning is not its words' (`Fransız kalmak`,
            "to be clueless"): an entry Wiktionary TAGS `idiomatic`;
  Proverbs  a complete saying with a moral, Wiktionary's part of speech `proverb`.

THE PROGRAMME IS THE SCOPE OF THE FIRST.  Its tables' "Dil İfadeleri" columns are example dialogues, and
a phrase that occurs in them is a phrase the syllabus expects a learner to use; the count is stated in
the description.  The document is read for that test only and nothing of it is copied.

NOTHING A LEVEL DECK TEACHES IS REPEATED (`hoş geldiniz`, `sağ ol`, `boş ver` are B1 and B2 cards), and
every sense goes through the same register and pointer filters as the level decks.

THE ORDER is how often the expression occurs in Tatoeba's Turkish sentences, with an expression that ends
in a verb counted in any of that verb's forms (the same matching as `examples.py`); ties by spelling.
"""
import bz2, json, os, sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tr

LEVEL_FILES = ["A1", "A2", "B1", "B2", "C1"]
PHRASE_POS = {"intj", "phrase"}
IDIOM_POS = {"verb", "adv", "adj", "noun", "phrase", "prep_phrase"}
# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    "Allahu ekber",              # a religious formula in Arabic rather than a Turkish phrase
    "seni seviyorum", "sana âşığım", "senden nefret ediyorum",  # phrasebook sentences, not set phrases:
    "bilmiyorum", "anlamıyorum",  # a verb in one person is a sentence a learner builds, not one to learn
    "dindar değilim", "benimle evlenir misin", "ben Türk'üm",  # the same: personal sentences
    "Tanrı uludur", "sallallahu aleyhi ve sellem", "aleyhissalatu vesselam", "radıyallahu anh",
    "rahmetullahi aleyh", "la ilahe illallah",  # Arabic religious formulas and honorifics, as above
    "anası mezar dikecekmiş", "fıstıkçı şahap", "Türkiye Cumhuriyeti futbol takımı sahada şut attı",
    "Afyonkarahisarlılaştıramadıklarımızdan mısınız", "pijamalı hasta Yağız şoföre çabucak güvendi",
                                 # grammar mnemonics, a tongue-twister and a pangram, not things people say
    "boş yok", "herkese, her keseye",  # advertising slogans
    "hayat başladı", "ne ten", "önce sen aç", "güzellik mi çirkinlik mi",  # an internet meme ("we're so
                                 # Barack"), a gloss that is only a literal translation, a joke, a game's name
    "ananın amı", "yalancıyı sikmiyorlar tabii", "kılavuzu karga olanın burnu boktan kalkmaz",
    "Allah belasını versin", "zıkkımın kökü",  # vulgarities and curses
    "ne demek!",                 # the same entry as `ne demek`, with its exclamation mark
}


def taught():
    out = set()
    root = os.path.join(tr.HERE, "..", "..", "decks")
    for lv in LEVEL_FILES:
        with open(os.path.join(root, "Turkish-%s.folio-deck.json" % lv), encoding="utf-8") as fh:
            out |= {c["fields"]["Word"] for c in json.load(fh)["cards"]}
    return out


def senses_taught(entry):
    return [s for s in entry["senses"] if tr.sense_ok(s)]


def classify(D):
    rows = {}
    for w, entries in D.items():
        if w in EXCLUDE or "..." in w or "…" in w:     # "... yaşındayım" is a template, not a phrase
            continue
        for e in entries:
            good = senses_taught(e)
            if not good:
                continue
            tags = {t for s in good for t in s["t"]}
            if e["pos"] == "proverb":
                sub = "Proverbs"
            elif " " not in w:
                continue
            elif "idiomatic" in tags and e["pos"] in IDIOM_POS:
                sub = "Idioms"
            elif e["pos"] in PHRASE_POS:
                sub = "Phrases"
            else:
                continue
            # one subdeck per expression: a proverb outranks an idiom outranks a phrase
            rank = ["Phrases", "Idioms", "Proverbs"].index(sub)
            if w not in rows or rank > rows[w][1]:
                rows[w] = (sub, rank)
    return {w: sub for w, (sub, _) in rows.items()}


def forms_of(D, word):
    out = {tr.fold(word)}
    for e in D.get(word, []):
        if tr.live(e):
            out |= {tr.fold(f) for f, t in tr.table_forms(e, word) if " " not in f}
    return out


def counter(D, phrases):
    """How many Tatoeba sentences contain each expression (a final verb in any form)."""
    with bz2.open(os.path.join(tr.CACHE, "tur_sentences.tsv.bz2"), "rt", encoding="utf-8") as fh:
        sents = [[t.split("'")[0] for t in tr.tokens(line.split("\t", 2)[2])] for line in fh
                 if line.count("\t") >= 2]
    first = defaultdict(list)
    for i, toks in enumerate(sents):
        for t in set(toks):
            first[t].append(i)
    out = Counter()
    for w in phrases:
        parts = [tr.fold(p) for p in w.replace(",", " ").split()]
        is_verb = parts[-1].endswith(("mak", "mek")) and any(e["pos"] == "verb" for e in D.get(w, []))
        last = forms_of(D, parts[-1]) if is_verb else {parts[-1]}
        n = len(parts)
        for i in first.get(parts[0], []):
            toks = sents[i]
            if any(toks[j:j + n - 1] == parts[:-1] and toks[j + n - 1] in last
                   for j in range(len(toks) - n + 1)):
                out[w] += 1
    return out


def in_programme(phrases):
    """The expressions that occur in the programme's text (its example dialogues are where they are)."""
    p = os.path.join(tr.CACHE, "programme.txt")
    if not os.path.exists(p):
        os.system("pdftotext %s %s" % (os.path.join(tr.CACHE, "programme.pdf"), p))
    text = " " + " ".join(tr.tokens(open(p, encoding="utf-8").read())) + " "
    return {w for w in phrases if " %s " % " ".join(tr.tokens(w)) in text}


def main():
    D = tr.load_dict()
    seen = taught()
    subs = {w: s for w, s in classify(D).items() if w not in seen and tr.fold(w) not in seen}
    counts = counter(D, subs)
    prog = in_programme([w for w, s in subs.items() if s == "Phrases"])
    order = ["Phrases", "Idioms", "Proverbs"]
    words = [{"word": w, "sub": s, "count": counts.get(w, 0), "programme": w in prog}
             for w, s in subs.items()]
    words.sort(key=lambda x: (order.index(x["sub"]), -x["count"], x["word"]))
    with open(os.path.join(tr.CACHE, "wordlist-phr.json"), "w", encoding="utf-8") as fh:
        json.dump({"level": "phr", "words": words, "inventory": 0, "fill": 0, "unresolved": []},
                  fh, ensure_ascii=False, indent=1)
    c = Counter(x["sub"] for x in words)
    print("wordlist-phr.json: %d expressions (%s); %d phrases occur in the programme's text"
          % (len(words), ", ".join("%d %s" % (c[s], s.lower()) for s in order), len(prog)), file=sys.stderr)


if __name__ == "__main__":
    main()
