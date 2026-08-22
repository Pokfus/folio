"""ONE NOTE PER WORD, TWO CARDS — the shape every other language deck on this shelf already has.

Aug 2026, on a bug report: "How come the Spanish deck has different subdecks for English >Spanish
and Spanish>English while none of the others do? The Spanish deck should be structured the same way
as the others."

The seven Spanish decks were built the other way round: TWO NOTES per word, one per direction, each
with a card type of its own (`es-to-en` / `en-to-es`) and each filed in a `sub` naming its direction.
Every other language here — Italian, French, German, Portuguese, Indonesian, Mandarin — is ONE note
carrying TWO CARD TEMPLATES, which is what `uEntryTemplates` reads to draw a direction as a row under
its deck. The difference is visible on the Collections page (the Spanish decks fold open into two
subdecks nobody else has) and in the file (992 rows for 496 words, every field stored twice), and a
definition corrected on one of the two rows silently drifts from the other.

WHY THIS IS A PASS OVER THE DECK FILES RATHER THAN A CHANGE TO THE GENERATOR. Only A1–B2 come out of
`.claude/dele/`; C1, C2 and the phrases deck were supplied ready-made and no pipeline here can rebuild
them. So the transformation has to exist as a pass over a finished deck whatever else happens — and
`emit.py` therefore CALLS THIS, as its last step, instead of building the merged shape itself. That is
what makes the pipeline and the shipped files provably the same shape: they are produced by the same
code, so the standing "re-running it must reproduce the shipped deck byte for byte" check can hold.

WHAT IT REFUSES. Everything it assumes is asserted rather than hoped for: exactly two types, sharing
their CSS and their spoken language; every note pairing on `num`, exactly two to a pair, the forward
direction first; and the two notes of a pair carrying IDENTICAL fields, which is what makes dropping
one of them lossless. A deck already in the merged shape is refused too, so the pass is safe to re-run.

A NOTE COMES OUT CARRYING `sub`, `fields`, `id` AND `type` AND NOTHING ELSE, which is what every other
language's notes carry. The Spanish ones additionally held the Basic format's own fields — `num`, `category`,
`question`, `answer`, `answerText` — which a TYPED card renders from its templates and never reads, so they
were inert weight in a file every reader downloads. They were not quite inert in one place, and there they
were wrong: `cardTitle` prefers `answerText` over the first type field, so the card browser listed a Spanish
card under its ENGLISH gloss where an Italian one is listed under the Italian word. `num` is what the pairing
above is done ON, so it is read before it goes.

THE IDS ARE RENUMBERED 1..N, and that costs no reader anything: `uDeckImportText` mints fresh card ids
whenever the deck id is already installed, so a re-download is a second copy with its own schedule
however this file is numbered. What it buys is that a fresh pipeline run and a converted file agree.

THE PROSE IS REWRITTEN HERE TOO, by exact replacement with every hit asserted. The subtitle and the
first sentence of the description both describe the two-subdeck structure, so leaving them would have
seven decks stating a shape they no longer have — and doing it in `emit.py` for four decks and here for
the other three would be two implementations of one sentence.
"""

import json
import re
import sys

SUB_OLD = " · both directions, as two subdecks"
DESC_OLD = ("Both study directions in one deck, as subdecks you can add and study separately: "
            "{L} → English (see the {L}, recall the meaning) and English → {L} "
            "(see an English meaning, recall the {L}).")
DESC_NEW = ("Both study directions in one deck: {L} → English (see the {L}, recall the meaning) and "
            "English → {L} (see an English meaning, recall the {L}). Each direction is a card of its "
            "own with its own schedule, so recognising {a} {unit} and producing it are learnt separately.")


def _sub(text, old, new, what):
    n = text.count(old)
    if n != 1:
        raise SystemExit("merge-directions: expected one %s to replace, found %d" % (what, n))
    return text.replace(old, new, 1)


def merge(deck, type_id, type_name, lang, unit="word"):
    """Rewrite `deck` in place. `lang` is the language as the templates name it ("Spanish");
    `unit` is what one note teaches, for the description ("word" or "expression")."""
    meta = deck["meta"]
    types = meta.get("types") or {}
    if len(types) != 2:
        raise SystemExit("merge-directions: expected exactly two card types, found %d" % len(types))
    fwd, rev = [types[k] for k in types]
    # the FORWARD type is the one whose name reads "<language> → English"; asserting it rather than
    # trusting the key order is what keeps a renamed id from silently swapping the two templates
    if not fwd.get("name", "").startswith(lang + " "):
        fwd, rev = rev, fwd
    if not fwd.get("name", "").startswith(lang + " ") or not rev.get("name", "").startswith("English "):
        raise SystemExit("merge-directions: can't tell the two directions apart from their names")
    if fwd.get("css") != rev.get("css"):
        raise SystemExit("merge-directions: the two types style the card differently")
    if fwd.get("speechLang") != rev.get("speechLang"):
        raise SystemExit("merge-directions: the two types speak different languages")
    # The SET has to match — one merged type has one field list, so a field only the reverse type declares
    # would be a field the merged deck cannot edit. The ORDER legitimately differs (the reverse type puts
    # English first, that being the field its own editing form opens on), and the forward order is what is
    # kept, which is what every other language's merged type carries.
    if set(fwd["fields"]) != set(rev["fields"]):
        raise SystemExit("merge-directions: the two types declare different fields")

    cards = deck["cards"]
    pairs, order = {}, []
    for c in cards:
        if c.get("type") not in types:
            raise SystemExit("merge-directions: a card carries an unknown type " + repr(c.get("type")))
        k = c["num"]
        if k not in pairs:
            pairs[k] = []
            order.append(k)
        pairs[k].append(c)
    bad = [k for k in order if len(pairs[k]) != 2]
    if bad:
        raise SystemExit("merge-directions: %d entries are not a pair of notes (e.g. %r)" % (len(bad), bad[:3]))

    merged = []
    for i, k in enumerate(order):
        a, b = pairs[k]
        if a["type"] != fwd["id"] or b["type"] != rev["id"]:
            raise SystemExit("merge-directions: entry %r is not forward-then-reverse" % k)
        if a["fields"] != b["fields"]:
            raise SystemExit("merge-directions: the two notes of entry %r hold different fields" % k)
        merged.append({
            "sub": "",
            "fields": a["fields"],
            "id": "u_%s_%d" % (meta["id"], i + 1),
            "type": type_id,
        })
    deck["cards"] = merged

    meta["types"] = {type_id: {
        "id": type_id,
        "name": type_name,
        "speechLang": fwd.get("speechLang"),
        "fields": fwd["fields"],
        "cards": [
            {"name": fwd["name"], "front": fwd["front"], "back": fwd["back"]},
            {"name": rev["name"], "front": rev["front"], "back": rev["back"]},
        ],
        "css": fwd["css"],
    }}

    meta["subtitle"] = _sub(meta["subtitle"], SUB_OLD,
                            " · both directions, as two cards " +
                            ("per word" if unit == "word" else "each"), "subtitle")
    meta["desc"] = _sub(meta["desc"], DESC_OLD.format(L=lang),
                        DESC_NEW.format(L=lang, a="an" if unit[0] in "aeiou" else "a", unit=unit),
                        "description")
    return {"notes": len(merged), "dropped": len(cards) - len(merged)}


if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) < 4:
        raise SystemExit("usage: merge-directions.py <deck.json> <typeId> <typeName> <Language> [unit]")
    path, tid, tname, lang = args[:4]
    unit = args[4] if len(args) > 4 else "word"
    with open(path, encoding="utf-8") as f:
        deck = json.load(f)
    st = merge(deck, tid, tname, lang, unit)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(deck, f, ensure_ascii=False)
    print("%s: %d notes, %d rows dropped" % (path, st["notes"], st["dropped"]))
