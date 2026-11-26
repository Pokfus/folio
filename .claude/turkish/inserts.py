#!/usr/bin/env python3
"""The cards the Turkish record ADDS: which move down a deck, and the fields of the ones no deck had.

    python3 .claude/turkish/inserts.py            # rewrites `add` in .claude/decks/turkish-fixes.json
    python3 .claude/turkish/inserts.py --check    # fails if `add` is not what this script builds (needs the cache; not in CI)

The beginner pass of Nov 2026 (docs/lang-decks.md, "The Turkish beginner pass").  The record's `add` is
WRITTEN HERE, NEVER BY HAND: the lists below are the decisions, and everything else is computed.

A MOVE is a row with `from`: the generator deals the card to that deck, and `turkish-fix.js` takes it out of
there whole and puts it in the target, so a generator fix reaches it.  Nothing of the card is stored.

AN INSERT is a card no deck had.  Its five fields are built by `build_deck.py`'s own functions from the same
cache -- the meaning is the English Wiktionary's (kaikki), the sentences are Tatoeba's, found by
`examples.py` exactly as a level's are -- so nothing in a field is typed.  The one-word formulas
(`nasılsın`, `görüşürüz`) are entries Wiktionary files as phrases, which `phrases.py` never reads because it
wants more than one word, and the level decks never read because a phrase is not a part of speech they
teach; `mi` and `de` are words `select.py` excludes by name (its reasons stand for the frequency fill: a
count cannot tell `de` from a suffix -- a card can gloss it).

THE NUMBER in a row's `id` is the next free one above every number the deck has ever held (pinned or
retired), in the order of the lists; a row already in the record keeps its number, so add to the END of a
list.
"""
import argparse, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import tr, build_deck

REC = os.path.join(HERE, "..", "decks", "turkish-fixes.json")
PIN = os.path.join(HERE, "..", "decks", "turkish-ids.json")
SRC = ("English Wiktionary via kaikki.org (CC BY-SA 4.0), read 2026-11-26: the entry's senses; "
       "sentences: Tatoeba (CC BY 2.0 FR), chosen by examples.py")

PHR = "an everyday formula; the phrases deck is the last on the shelf"
# target deck -> [(headword, the deck the generator deals it to, why)]
MOVES = {
    "turkisha1": [
        ("teşekkür ederim", "trphrase", PHR),
        ("rica ederim", "trphrase", PHR),
        ("bir şey değil", "trphrase", PHR),
        ("iyi günler", "trphrase", PHR),
        ("iyi akşamlar", "trphrase", PHR),
        ("iyi geceler", "trphrase", PHR),
        ("hoşça kal", "trphrase", PHR),
        ("güle güle", "trphrase", PHR),
        ("iyiyim, teşekkürler", "trphrase", PHR + " (the answer to nasılsın; Wiktionary has no entry for iyiyim alone)"),
        ("benim adım", "trphrase", PHR),
        ("adınız ne", "trphrase", PHR),
        ("memnun oldum", "trphrase", PHR),
        ("hoş bulduk", "trphrase", PHR + " (the answer to hoş geldiniz)"),
        ("kolay gelsin", "trphrase", PHR),
        ("afiyet olsun", "trphrase", PHR),
        ("geçmiş olsun", "trphrase", PHR),
        ("saat kaç", "trphrase", PHR + ", spelled with two A1 cards"),
        ("selam", "turkisha2", "a greeting; A2's note 18"),
        ("günaydın", "turkisha2", "a greeting; A2's note 313"),
        ("affedersiniz", "turkisha2", "excuse me; A2's note 381"),
        ("pardon", "turkisha2", "sorry; A2's note 376"),
        ("ad", "turkisha2", "name: benim adım and adınız ne are made with it"),
        ("su", "turkisha2", "water, which a beginner asks for; meyve suyu is an A1 card"),
        ("içmek", "turkisha2", "to drink, beside yemek"),
        ("sağ ol", "turkishb1", "thank you, the everyday one; B1's note 133"),
        ("buyurun", "turkishb1", "said by every shopkeeper and waiter; B1's note 143"),
        ("hoş geldiniz", "turkishb2", "welcome; B2's note 167"),
        ("sıfır", "turkishb2", "zero: A1 holds every other number to ten; B2's note 249"),
        ("dördüncü", "turkishb2", "an ordinal: A1 holds first to third, and its grammar list names the ordinals"),
        ("beşinci", "turkishb2", "an ordinal, as dördüncü"),
        ("kahverengi", "turkishb2", "a colour: A1 holds nine others"),
        ("gri", "turkishb2", "a colour, as kahverengi"),
    ],
}
# target deck -> [(headword, why)]
INSERTS = {
    "turkisha1": [
        ("mi", "the question particle, in 64 words of A1's sentences (mi, mı, misin, musun, miyim …) and on no card; "
               "select.py excludes it from the frequency fill by name"),
        ("de", "\"too, also\", written apart: 11 words of A1's sentences and on no card; excluded from the fill by name"),
        ("nasılsın", "how are you (to sen); a one-word entry Wiktionary files as a phrase, which no stage read"),
        ("nasılsınız", "how are you (to siz); as nasılsın"),
        ("görüşürüz", "see you; as nasılsın"),
        ("ne kadar", "how much: a two-word determiner the frequency list cannot count"),
        ("özür dilemek", "to apologize: Wiktionary has no entry for özür dilerim, and this verb's sentences are that formula"),
    ],
}


def build_inserts(words):
    """The five fields of each word, by the generator's own code."""
    with open(os.path.join(tr.CACHE, "wordlist-ins.json"), "w", encoding="utf-8") as fh:
        json.dump({"level": "ins", "words": [{"word": w} for w in words]}, fh, ensure_ascii=False)
    subprocess.run([sys.executable, os.path.join(HERE, "examples.py"), "--level", "ins"], check=True)
    ex = json.load(open(os.path.join(tr.CACHE, "examples-ins.json"), encoding="utf-8"))
    D = tr.load_dict()
    build_deck.PHRASE_POS.update({"phrase"})         # the one-word formulas are filed as phrases
    out = {}
    for w in words:
        senses = build_deck.senses_of(w, D)
        if not senses:
            raise SystemExit("insert %s: the dictionary gives it no taught sense" % w)
        forms, _ = build_deck.forms_html(w, D)
        E = build_deck.E
        out[w] = {
            "Turkish": '<div class="uc-word">%s<span class="uc-tts uc-say" data-say="%s"></span></div>' % (E(w), E(w)),
            "Word": w,
            "English": build_deck.english_html(senses),
            "Forms": forms,
            "Examples": build_deck.examples_html(ex.get(w, [])),
        }
    for r in build_deck.REPORT:
        print("  ! " + r)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    rec = json.load(open(REC, encoding="utf-8"))
    pin = json.load(open(PIN, encoding="utf-8"))
    old = {(t, r["word"]): r for t, rows in rec.get("add", {}).items() for r in rows}
    fields = build_inserts([w for rows in INSERTS.values() for w, _ in rows])
    add = {}
    for target in sorted(set(MOVES) | set(INSERTS)):
        used = set(pin.get(target, {}).values()) | set(pin.get("_retired", {}).get(target, {}).values())
        used |= {r["id"] for (t, _), r in old.items() if t == target}
        # a number the record gave is the card's for good; a new row takes the next free one
        nxt = max(used) + 1
        rows = []
        for word, src, why in MOVES.get(target, []):
            if word not in pin.get(src, {}) and word not in pin.get("_retired", {}).get(src, {}):
                raise SystemExit("move %s: %s never held it" % (word, src))
            row = {"word": word, "id": 0, "from": src, "why": why}
            rows.append(row)
        for word, why in INSERTS.get(target, []):
            rows.append({"word": word, "id": 0, "fields": fields[word], "src": SRC, "why": why})
        for row in rows:
            have = old.get((target, row["word"]))
            if have:
                row["id"] = have["id"]
            else:
                row["id"] = nxt
                nxt += 1
        add[target] = rows
    if a.check:
        if json.dumps(rec.get("add", {}), ensure_ascii=False, sort_keys=True) != json.dumps(add, ensure_ascii=False, sort_keys=True):
            raise SystemExit("FAIL  turkish-fixes.json `add` is not what inserts.py builds — run it without --check")
        print("inserts --check: the record's added cards are what the generator's code builds")
        return
    rec["add"] = add
    with open(REC, "w", encoding="utf-8") as fh:
        json.dump(rec, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    print("turkish-fixes.json: " + ", ".join("%s +%d (%d moved, %d new)" % (
        t, len(r), sum("from" in x for x in r), sum("fields" in x for x in r)) for t, r in add.items()))


if __name__ == "__main__":
    main()
