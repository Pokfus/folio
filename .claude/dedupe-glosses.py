"""EVERY ENGLISH SIDE UNIQUE WITHIN ITS DECK — so a reverse card has one answer.

Aug 2026, on a bug report: "In all language decks, ensure that every english translations section
is unique within its deck; for example, currently in Italian 'il' and 'la' both simply have the word
'the' as translation, but this makes it impossible to know which is intended when studying
English>Italian. It could say for example 'the (singular female)' but instead of parentheses put
that label above it, as we already do on other cards within the deck."

A deck's cards are one note with two templates, so every note is also asked BACKWARDS — English
first, the word recalled. That direction is only answerable if the English side identifies one word,
and measured over the whole shelf it does not: **1,169 notes in 567 groups share their English side
byte for byte**, across 47 of the 52 decks.

WHAT THE MEASUREMENT FOUND, and it is what decides the shape of this pass. Only a small minority of
those groups are one lexeme listed twice — 45 notes where a sibling's own `Forms` names this headword
as its feminine or its plural, plus 38 closed-class groups (articles, possessives, demonstratives).
**The rest are genuine synonyms**: `fino` and `delgado` for *thin*, `tabir` and `gorden` for *curtain*,
`减退` `衰落` `推辞` `下滑` for *decline*, six Portuguese euphemisms for *to die*. Nothing in the deck
distinguishes them and nothing outside it could without inventing a semantic difference the sources
do not carry — which is the one thing a content pass here may not do.

SO THE LABEL IS DERIVED IN THREE LAYERS, each stating only what is already known:

  1. AN INFLECTION THE DECK ITSELF NAMES. Where a sibling's `Forms` lists this headword under a label
     ("feminine", "plural"), that label is the answer, read out of the deck rather than composed.
  2. A CLOSED CLASS, from `GRAM` below. Articles, possessives, demonstratives and personal pronouns
     are a fixed handful per language and a deck states nothing about them, so the twenty-odd entries
     needed are written down. Each is a fact of grammar of exactly the kind the decks already assert
     in their own part-of-speech lines ("noun, feminine"), and the table is exactly as large as the
     collisions measured on the shelf — it is evidence, not a dictionary.
  3. OTHERWISE, THE SIBLINGS ARE NAMED. `preposition, not fra` is the only truthful thing left: it
     makes the side unique, it makes the card answerable, it invents nothing, and it tells a learner
     something worth knowing — that the language has another word for this.

WHERE THE LABEL GOES — INTO THE PART-OF-SPEECH LINE THE CARD ALREADY PRINTS, in every layer.
`article` becomes `article, feminine singular` and `preposition` becomes `preposition, not fra`,
which is the deck's own existing register ("noun, feminine") worn by a qualifier of another kind. It
was a line of its own for an hour and folding it is strictly better: one label rather than two
stacked bands of small capitals, and — the part that matters when a change touches fifty-two files —
**no new CSS class, so not one type's stylesheet is rewritten**.

IT IS A PASS OVER FINISHED DECK FILES, for `merge-directions.py`'s reason: a third of the shelf was
supplied ready-made and no pipeline here can rebuild it, so the transformation has to exist as a pass
whatever else happens — and each generator therefore calls this as its last step rather than building
the labels itself, which is what keeps a fresh pipeline run and a shipped file the same shape.

IT REFUSES TO RUN TWICE (a deck whose English sides are already all distinct has nothing to do), and
it ASSERTS ITS OWN RESULT: every group must come out with distinct English sides, or the deck is not
written.
"""

import json
import re
import sys

# ---- layer 2: closed classes, one line per collision measured on the shelf -------------------
# key: (language, headword) -> the label folded into the part-of-speech line
GRAM = {
    "Italian": {
        "il": "masculine singular", "la": "feminine singular", "le": "feminine plural",
        "me stesso": "masculine", "me stessa": "feminine",
        "te stesso": "masculine", "te stessa": "feminine",
        "voi stessi": "masculine", "voi stesse": "feminine",
        "loro stessi": "masculine", "loro stesse": "feminine",
    },
    "Portuguese": {
        "meu": "masculine", "minha": "feminine",
        "seu": "masculine", "sua": "feminine",
        "este": "masculine", "esta": "feminine",
        "teu": "masculine", "tua": "feminine",
        "aquele": "masculine", "aquela": "feminine",
        "algum": "masculine", "alguma": "feminine",
        "nós": "subject", "nos": "object",
    },
    "Spanish": {
        "ellos": "masculine", "ellas": "feminine",
        "tuyo": "singular", "vuestro": "plural",
    },
    "French": {
        "un": "masculine", "une": "feminine",
        "ce": "masculine singular", "cette": "feminine singular",
        "mon": "masculine singular", "ma": "feminine singular", "mes": "plural",
        "ton": "masculine singular", "ta": "feminine singular", "votre": "formal or plural",
        "son": "masculine singular", "sa": "feminine singular",
    },
    "Mandarin Chinese": {
        "他们": "of a mixed or male group", "她们": "of a female group",
    },
}

# the reflexive particle, where a deck writes the reflexive verb as a headword of its own
REFLEX = {
    "Portuguese": (" se",), "Spanish": ("se",), "Italian": ("si",),
    "French": (" se", " s'"), "German": (" sich",),
}

POS_RX = re.compile(r'(<div class="uc-pos">)([^<]*)(</div>)')


def _text(h):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]*>", " ", h or "")).strip()


def _forms(html):
    """{form: label} out of a note's Forms field, splitting the alternatives a cell may hold."""
    out = {}
    for label, cell in re.findall(r'class="uc-fl">([^<]*)</span>([^<]*)</span>', html or ""):
        for one in re.split(r"[/,]", _text(cell)):
            one = one.strip()
            if one:
                out[one] = _text(label).strip()
    return out


def _fold(eng, label):
    """Fold a grammatical label into the part-of-speech line the card already prints."""
    def rep(m):
        return m.group(1) + (m.group(2).rstrip() + ", " + label if m.group(2).strip() else label) + m.group(3)
    new, n = POS_RX.subn(rep, eng, count=1)
    if n:
        return new
    return '<div class="uc-pos">' + label + "</div>" + eng


def dedupe(deck, lang):
    meta = deck["meta"]
    types = meta.get("types") or {}
    if not types:
        raise SystemExit("dedupe-glosses: the deck declares no card types")
    head = list(types.values())[0]["fields"][0]

    cards = [c for c in deck.get("cards", []) if "English" in (c.get("fields") or {})]
    groups = {}
    for c in cards:
        groups.setdefault(c["fields"]["English"], []).append(c)
    dup = [v for v in groups.values() if len(v) > 1]
    if not dup:
        return {"groups": 0, "labelled": 0}

    table = GRAM.get(lang, {})
    refl = REFLEX.get(lang, ())
    counts = {"gram": 0, "inflection": 0, "reflexive": 0, "named": 0}

    for members in dup:
        heads = [_text(c["fields"].get(head, "")) for c in members]
        forms = [_forms(c["fields"].get("Forms", "")) for c in members]
        for i, c in enumerate(members):
            h, eng = heads[i], c["fields"]["English"]
            label = table.get(h)
            kind = "gram"
            if not label:
                for j, f in enumerate(forms):
                    if j != i and h in f:
                        label, kind = f[h], "inflection"
                        break
            if not label:
                for p in refl:
                    if any(h == other + p or h == other + p.strip() for other in heads if other != h):
                        label, kind = "reflexive", "reflexive"
                        break
            if not label:
                label, kind = "not " + ", ".join(x for x in heads if x != h), "named"
            c["fields"]["English"] = _fold(eng, label)
            counts[kind] += 1

    # the whole point: assert it worked rather than hoping
    seen = {}
    for c in cards:
        seen.setdefault(c["fields"]["English"], []).append(_text(c["fields"].get(head, "")))
    left = {k: v for k, v in seen.items() if len(v) > 1}
    if left:
        raise SystemExit("dedupe-glosses: %d groups still share an English side (e.g. %r)"
                         % (len(left), list(left.values())[0]))

    return {"groups": len(dup), "labelled": sum(counts.values()), **counts}


if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) < 2:
        raise SystemExit("usage: dedupe-glosses.py <deck.json> <Language>")
    path, lang = args[0], args[1]
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    st = dedupe(d, lang)
    if st["groups"]:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False)
        print("%s: %d groups, %d labelled (%d grammar, %d inflection, %d reflexive, %d named)"
              % (path, st["groups"], st["labelled"], st["gram"], st["inflection"],
                 st["reflexive"], st["named"]))
    else:
        print("%s: every English side already unique" % path)
