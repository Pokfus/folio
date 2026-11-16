"""Which levels there are, file names, and what a level's deck says about itself.

A DESCRIPTION STATES TRUE THINGS ABOUT ITS OWN LEVEL (the UKBI lesson): every number
comes from the built deck, and every derived clause is gated on its quantity not being
zero.

THE NAMES ARE ENGLISH, as for Polish and Turkish: the collection is "Czech" and a deck
"Czech A1"; the file names carry `Czech` and the level, which is all
`.claude/build-lang-decks.js` needs to file and order them.
"""
import html, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
BANDS = ("a1", "a2", "b1", "b2", "c1")
SIZE = {"b1": 1000, "b2": 1200, "c1": 1200}          # an assembled level's size, in notes (Polish B1's)
FILE = "Czech-%s.folio-deck.json"
PHRASE_FILE = "Czech-Phrases-and-Expressions.folio-deck.json"
COLOR = "#495A5A"   # the Czech collection's hue, `lang-czech` in app.js COLL_THEME (measured)


def deck_id(level):
    return "czechphrase" if level == "phr" else "czech" + level


def file_of(level):
    return PHRASE_FILE if level == "phr" else FILE % level.upper()


def taught_below(level):
    """Headwords already in the shipped decks of the levels below (none for A1).  The phrases deck is built on
    EVERY level deck that has shipped, whichever they are (A1 to C1 when it was first built, 2026-11-16)."""
    out = set()
    root = os.path.join(HERE, "..", "..", "decks")
    below = [lv for lv in BANDS if os.path.exists(os.path.join(root, FILE % lv.upper()))] if level == "phr" \
        else BANDS[:BANDS.index(level)]
    for lv in below:
        p = os.path.join(root, FILE % lv.upper())
        if not os.path.exists(p):
            raise SystemExit("%s is built on %s, but %s is missing" % (level, lv, p))
        with open(p, encoding="utf-8") as fh:
            for c in json.load(fh)["cards"]:
                out.add(c["fields"]["Word"])
    return out


FIELDS = ["Czech", "Word", "English", "Forms", "Examples"]
C = lambda x: "{:,}".format(x)
FOLD = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
CARDS = [
    {"name": "Czech → English", "front": "{{Czech}}",
     "back": '{{FrontSide}}{{#Forms}}{{Forms}}{{/Forms}}<hr><div class="uc-field">{{English}}</div>' + FOLD},
    {"name": "English → Czech",
     "front": '<div class="uc-ask">Say it in Czech</div><div class="uc-field">{{English}}</div>',
     "back": "{{FrontSide}}<hr>{{Czech}}{{#Forms}}{{Forms}}{{/Forms}}" + FOLD},
]


def _row(card):
    return [(l, html.unescape(f)) for l, f in
            re.findall(r'class="uc-fl">([^<]*)</span><b>([^<]*)</b>', card["fields"]["Forms"])]


def _eg(cards, word):
    c = next((c for c in cards if c["fields"]["Word"] == word and _row(c)), None)
    return "%s: %s" % (word, ", ".join(f for _, f in _row(c))) if c else None


def _morph(stats, cards):
    morph = ["Czech changes the endings of its nouns, adjectives and verbs, and stems change with them, so each "
             "card carries the forms that cannot be guessed, read from a dictionary rather than generated."]
    if stats["noun"]:
        eg = _eg(cards, "pes") or _eg(cards, "dům")
        morph.append("%s nouns show their gender, three cases of the singular and two of the plural%s." % (
            C(stats["noun"]), " — " + eg if eg else ""))
    if stats["verb"]:
        eg = _eg(cards, "jít") or _eg(cards, "dělat")
        morph.append("%s verbs show their aspect and its partner, the forms for já (I), on (he) and oni (they) "
                     "and the past of on%s — a perfective verb's present forms being its future." % (
                         C(stats["verb"]), " — " + eg if eg else ""))
    if stats["adj"]:
        morph.append("%s adjectives show their comparative and superlative." % C(stats["adj"]))
    if stats["pron"]:
        morph.append("%s pronouns show their cases." % C(stats["pron"]) if stats["pron"] > 1
                     else "One pronoun shows its cases.")
    return morph


def describe_assembled(level, n, stats, cards, s):
    """A level with no official list (B1 to C1): the inventory and the fill, said as what they are."""
    lv, fill = level.upper(), n - stats["inventory"]
    lower = [b.upper() for b in BANDS[:BANDS.index(level)]]
    span = " and ".join(lower) if len(lower) == 2 else "%s to %s" % (lower[0], lower[-1])
    span_or = " or ".join(lower) if len(lower) == 2 else ", ".join(lower[:-1]) + " or " + lower[-1]
    s.append("WHERE THESE WORDS COME FROM, since it matters: no Czech exam board publishes a word list beyond A2 — "
             "the A1 and A2 decks follow the official list of the permanent-residence exam, but the B1 citizenship "
             "exam and Charles University's CCE exams publish none. So %s of the %s words were written for Folio, "
             "a topic at a time, for %s — the next layer of vocabulary beyond %s — together with the words "
             "of opinion and argument the level needs. They are Folio's choice, not an exam board's, and this is "
             "not an official word list." % (C(stats["inventory"]), C(n), SCOPE[level], span))
    if fill:
        s.append("The other %s are the commonest words of everyday Czech not already chosen, from a frequency list "
                 "built from film and television subtitles, each word counted over all its forms." % C(fill))
    s.append("No word taught in %s is repeated." % span_or)
    s.append("The cards are ordered by that frequency, so the words met most often come first%s." % (
        "; the %s multi-word expressions, which a list of single words cannot count, come last" % C(stats["phrases"])
        if stats["phrases"] > 1 else ""))
    s.extend(_morph(stats, cards))
    have = n - stats["ex0"]
    if have:
        s.append("Real example sentences come with %s of the %s words, three apiece for %s, with the word picked "
                 "out in colour and a speaker beside the sentence and the headword." % (C(have), C(n), C(stats["ex3"])))
    s.append("Meanings, forms and parts of speech: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). "
             "Frequency ordering: a word list built from OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA 4.0). "
             "Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR.")
    return " ".join(s)


SCOPE = {
    "c1": "the purposes the Common European Framework of Reference itself gives for C1 (the Council of Europe's "
          "level specifications stop at B2): demanding, longer texts and their implicit meaning, and language used "
          "flexibly for social, academic and professional purposes — the law and administration, economics and "
          "finance, politics and international relations, science, medicine and technology, the mind and society, "
          "philosophy and religion, history, literature, language and the arts, and the media and public debate, "
          "with the abstract nouns, verbs of nuance and connectives of a formal text",
    "b2": "the themes of the Council of Europe's B2 specification, Vantage (van Ek and Trim, 2001), which carries "
          "the Threshold Level's themes a level further: work and careers, the economy and money, the state, "
          "politics and society, law and crime, the media and technology, science and research, health care, the "
          "environment, culture and the arts, education and relationships",
    "b1": "the fourteen themes of the Council of Europe's Threshold Level (van Ek and Trim, 1990), the "
          "specification the CEFR's level B1 descends from: personal identification, house and home and the "
          "environment, daily life, free time and entertainment, travel, relations with other people, health and "
          "body care, education, shopping, food and drink, services, places, language and the weather",
}


def describe(level, n, stats, cards):
    lv = level.upper()
    s = ["Both study directions in one deck: Czech → English (see the Czech, recall the meaning) and "
         "English → Czech (see an English meaning, recall the Czech). Each direction is a card of its own with "
         "its own schedule, so recognising a word and producing it are learnt separately.",
         "%s words and expressions for level %s of the Common European Framework of Reference for Languages."
         % (C(n), lv)]
    if level in SIZE:
        return describe_assembled(level, n, stats, cards, s)
    s += ["WHERE THESE WORDS COME FROM: %s of them are the %s entries of the official word list of the Czech "
         "language exam for permanent residence — the Soupis lexikálních jednotek published by the National "
         "Pedagogical Institute of the Czech Republic (NPI ČR) with its reference description of Czech for "
         "levels A1 and A2 — that an English dictionary can teach. The list's grammatical patterns (\"čekat na\", "
         "\"chtít + infinitive\") and the phrases written with a blank or a choice of endings are not cards."
         % (C(stats["official"]), lv)]
    if stats["collocation"]:
        s.append(("%s of them are verbs the list names only inside a collocation (%s), taught on their own."
                  % (C(stats["collocation"]), ", ".join(stats["coll_eg"][:3])) if stats["collocation"] > 1 else
                  "One of them is a verb the list names only inside a collocation (%s), taught on its own."
                  % stats["coll_eg"][0]))
    if stats["supplement"]:
        s.append("The other %s are short grammatical words — personal and possessive pronouns, prepositions, "
                 "conjunctions and numbers — which the list leaves to the reference description's grammar "
                 "chapters rather than its word list: they were added by Folio, as the commonest such words of "
                 "everyday Czech that are on neither the A1 nor the A2 list, from a frequency list built from film "
                 "and television subtitles. They are Folio's addition, not part of the official list."
                 % C(stats["supplement"]))
    if level != "a1":
        s.append("No word taught in the levels below is repeated.")
    s.append("The cards are ordered by how often each word is met in that frequency list, each word counted over "
             "all its forms, so the commonest come first%s." % (
                 "; the %s multi-word expressions, which a list of single words cannot count, come last"
                 % C(stats["phrases"]) if stats["phrases"] else ""))
    s.extend(_morph(stats, cards))
    s.append("A reflexive verb is taught as the list writes it, with its se or si (bát se, dát si); where the "
             "dictionary's meaning says only that a sense is reflexive, it is marked (se/si).")
    have = n - stats["ex0"]
    if have:
        s.append("Real example sentences come with %s of the %s entries%s, with the word picked out in colour and "
                 "a speaker beside the sentence and the headword." % (
                     C(have), C(n), ", three apiece for %s" % C(stats["ex3"]) if stats["ex3"] else ""))
    s.append("Word list: NPI ČR, Soupis lexikálních jednotek A1, A2 (cestina-pro-cizince.cz) — the words only. "
             "Meanings, forms and parts of speech: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). "
             "Frequency ordering: a word list built from OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA 4.0). "
             "Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR.")
    return " ".join(s)


PHR_SUBS = ("Phrases", "Expressions", "Idioms", "Proverbs")


def describe_phr(n, stats, cards, candidates):
    """The phrases deck (Polish's `describe_phr`): every number from the built deck, every example a real card."""
    by = {s: [c for c in cards if c.get("sub") == s] for s in PHR_SUBS}
    eg = lambda s, k: ", ".join(c["fields"]["Word"] for c in by[s][:k])
    built = [lv.upper() for lv in BANDS
             if os.path.exists(os.path.join(HERE, "..", "..", "decks", FILE % lv.upper()))]
    have = n - stats["ex0"]
    s = ["%s Czech set phrases, expressions, idioms and proverbs, in four subdecks: %s everyday phrases, %s "
         "expressions, %s idioms and %s proverbs." % (C(n), C(len(by["Phrases"])), C(len(by["Expressions"])),
                                                     C(len(by["Idioms"])), C(len(by["Proverbs"]))),
         "Both study directions come as two cards of one expression — Czech → English (see the Czech, recall the "
         "meaning) and English → Czech (see an English meaning, recall the Czech) — each with a schedule of its own.",
         "This is a companion to the level decks, Czech %s to %s, and not one of them: a level is a list of words, "
         "and an expression is a unit a list of words cannot see. Nothing here is taught by any of them, so they "
         "can be studied together without repeating an entry." % (built[0], built[-1])]
    if by["Phrases"]:
        s.append("The PHRASES are the expressions Wiktionary files as phrases or interjections and does not mark as "
                 "idiomatic — the formulas a speaker uses as one piece (%s …)." % eg("Phrases", 4))
    if by["Expressions"]:
        s.append("The EXPRESSIONS are the fixed adverbials, verb phrases and compound prepositions and conjunctions "
                 "Wiktionary carries as entries of more than one word (%s …)." % eg("Expressions", 5))
    if by["Idioms"]:
        s.append("The IDIOMS are the expressions with a sense Wiktionary marks as idiomatic, of any part of speech "
                 "(%s …)." % eg("Idioms", 5))
    if by["Proverbs"]:
        s.append("The PROVERBS are the sayings Wiktionary files as proverbs (%s …)." % eg("Proverbs", 3))
    s += ["WHICH ONES: Wiktionary has %s such Czech expressions that "
          "no level teaches, and this deck takes the %s of them that occur in at least one of Tatoeba's Czech "
          "sentences with an English translation — an expression that begins with a verb being found with that "
          "verb in any form. That is a test of being in use, not an official list." % (C(candidates), C(n)),
          "Within each subdeck the expressions come in the order of how many of those sentences contain them."]
    if have:
        s.append("Real example sentences come with %s of the %s, three apiece for %s, with the expression picked "
                 "out in colour and a speaker beside the sentence and the headword." % (C(have), C(n), C(stats["ex3"])))
    s.append("Meanings and parts of speech: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). "
             "Example sentences and the count that chooses and orders the expressions: Tatoeba (tatoeba.org), "
             "CC BY 2.0 FR.")
    return " ".join(s)


def meta(level, n, stats, css, stamp, cards, candidates=0):
    lv = level.upper()
    if level == "phr":
        by = {s: sum(1 for c in cards if c.get("sub") == s) for s in PHR_SUBS}
        title, tags = "Czech Phrases and Expressions", ["czech", "čeština", "phrases", "expressions", "idioms",
                                                         "proverbs"]
        subtitle = "%s expressions · %s everyday, %s expressions, %s idioms, %s proverbs · both directions" % (
            C(n), C(by["Phrases"]), C(by["Expressions"]), C(by["Idioms"]), C(by["Proverbs"]))
        desc = describe_phr(n, stats, cards, candidates)
    else:
        title, tags = "Czech " + lv, ["czech", "čeština", level, "vocabulary"]
        subtitle = "%s words · both directions, as two cards per word" % C(n)
        desc = describe(level, n, stats, cards)
    return {
        "id": deck_id(level),
        "title": title,
        "subtitle": subtitle,
        "desc": desc,
        "author": "",
        "language": "en",
        "color": COLOR,
        "tags": tags,
        "glossMode": "site",
        "types": {"czech": {"id": "czech", "name": "Czech vocabulary", "speechLang": "cs-CZ",
                            "fields": FIELDS, "cards": CARDS, "css": css}},
        "version": 1,
        "createdAt": stamp,
        "updatedAt": stamp,
        "forkedFrom": None,
    }
