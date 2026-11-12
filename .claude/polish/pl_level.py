"""Which levels there are, their sizes, file names, and what a level's deck says about itself.

A DESCRIPTION STATES TRUE THINGS ABOUT ITS OWN LEVEL (the UKBI lesson): every
level-specific claim comes from `SCOPE`, every number from the built deck, and
every derived clause is gated on its quantity not being zero.

THE NAMES ARE ENGLISH, as for Turkish and Hindi: the collection is "Polish" and
a deck "Polish A1"; the file names carry `Polish` and the level, which is all
`.claude/build-lang-decks.js` needs to file and order them.
"""
import html, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
BANDS = ("a1", "a2", "b1", "b2", "c1", "c2")
SIZE = {"a1": 600, "a2": 750, "b1": 1000, "b2": 1200, "c1": 1200, "c2": 1200}
FILE = "Polish-%s.folio-deck.json"
PHRASE_FILE = "Polish-Phrases-and-Expressions.folio-deck.json"
COLOR = "#6B7493"   # the Polish collection's hue, `lang-polish` in app.js COLL_THEME

SCOPE = {
    "a1": {
        "topics": "people and the family, daily life, free time, the home, places in town, transport and "
                  "directions, work and school, food, shopping and money, health, the seasons and the weather, "
                  "and the basic names of plants and animals",
        "with": "the numbers, days, months and colours and the pronouns, question words, prepositions and "
                "conjunctions every sentence is built from",
    },
    # certyfikatpolski.uz.zgora.pl, "Poziom A2" (read 2026-11-12): no topic list as such, so the level's
    # description is summarised -- see inventory.py's note above A2.
    "a2": {
        "topics": "thanking, apologising, inviting, good wishes and congratulations, feelings and opinions, place, "
                  "direction and time, quantity and quality, describing and comparing people, table manners, Polish "
                  "dishes and mealtimes, name days, birthdays and visits, clothes for official occasions, renting a "
                  "flat, the telephone, the doctor, school and work, travel in Poland and Europe, and cultural and "
                  "artistic life",
        "with": "the modal words (trzeba, warto, należy), the verbs of motion, the feminine names for people "
                "(studentka beside student) and the conjunctions the level's grammar names",
    },
    # certyfikatpolski.uz.zgora.pl, "Poziom B1" (read 2026-11-12): a topic list, summarised.
    "b1": {
        "topics": "tastes and character, the family and its occasions, social life, sport, town and country and "
                  "public institutions, travel, work and the labour market, education, recipes and cooking, "
                  "shopping and ways of paying, health and way of life, the environment, the state and society "
                  "(politics, the economy, crime), science and technology, the media, culture and stereotypes",
        "with": "the words for expressing surprise, doubt, sympathy, disappointment, criticism and advice, and "
                "the connectives of an argument",
    },
    # certyfikatpolski.uz.zgora.pl, "Poziom B2" (read 2026-11-12): roles, text types and grammar, no topic list.
    "b2": {
        "topics": "sport and its fans, reading and reviews, driving, accidents, crime and witnesses, complaints, "
                  "warnings and protests, the telephone, discussion and argument, interviews and formal writing, "
                  "spelling and language, and the B1 topics taken further (work, housing, the media, law, health, "
                  "relationships, nature, the arts and travel)",
        "with": "the adjectives of countries, adjectives made from nouns (lekarski from lekarz), abstract nouns made "
                "from adjectives (dojrzałość from dojrzały), diminutives, żaden, każdy and wszyscy, and the "
                "connectives of a formal text",
    },
    # certyfikatpolski.uz.zgora.pl, "Poziom C1" (read 2026-11-12): a topic list beyond the earlier levels', summarised.
    "c1": {
        "topics": "extreme sports, the housing market and household repairs, the modern workplace, education and its "
                  "history, genetically modified food, auctions, the health-care system and insurance, natural "
                  "disasters, corruption and money laundering, the army and international relations, science and "
                  "ethics, the Church, the regions and Polish history, and the official, scientific and "
                  "journalistic styles",
        "with": "the vocabulary of the economy, the law, politics, the media, the mind, literature and philosophy, "
                "the words of irony, rhetoric and argument, and the forms the level's grammar names (habitual "
                "verbs, augmentatives, collective numerals, compounds)",
    },
}


def deck_id(level):
    return "polishphrase" if level == "phr" else "polish" + level


def file_of(level):
    return PHRASE_FILE if level == "phr" else FILE % level.upper()


def taught_below(level):
    """Headwords already in the shipped decks of the levels below (none for A1).  The phrases deck is built on
    EVERY level deck that has shipped, whichever they are: A1 to C1 when it was first built (2026-11-12)."""
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


FIELDS = ["Polish", "Word", "English", "Forms", "Examples"]
C = lambda x: "{:,}".format(x)
FOLD = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
CARDS = [
    {"name": "Polish → English", "front": "{{Polish}}",
     "back": '{{FrontSide}}{{#Forms}}{{Forms}}{{/Forms}}<hr><div class="uc-field">{{English}}</div>' + FOLD},
    {"name": "English → Polish",
     "front": '<div class="uc-ask">Say it in Polish</div><div class="uc-field">{{English}}</div>',
     "back": "{{FrontSide}}<hr>{{Polish}}{{#Forms}}{{Forms}}{{/Forms}}" + FOLD},
]


def _row(card):
    return [(l, html.unescape(f)) for l, f in
            re.findall(r'class="uc-fl">([^<]*)</span><b>([^<]*)</b>', card["fields"]["Forms"])]


def _eg(cards, word):
    c = next((c for c in cards if c["fields"]["Word"] == word and _row(c)), None)
    return "%s: %s" % (word, ", ".join(f for _, f in _row(c))) if c else None


def describe(level, n, inv, stats, cards):
    lv = level.upper()
    sc = SCOPE[level]
    fill = n - inv
    s = ["Both study directions in one deck: Polish → English (see the Polish, recall the meaning) and "
         "English → Polish (see an English meaning, recall the Polish). Each direction is a card of its own "
         "with its own schedule, so recognising a word and producing it are learnt separately.",
         "%s words for level %s of the Common European Framework of Reference for Languages." % (C(n), lv),
         "WHERE THESE WORDS COME FROM, since it matters: Poland's State Commission for the Certification of "
         "Proficiency in Polish as a Foreign Language examines at all six levels, but no official word list was "
         "found for any of them. So %s of the %s words were written for Folio, a topic at a time, for the "
         "topics the %s exam is described as covering — %s — together with %s. They are Folio's choice, not the "
         "Commission's, and this is not an official word list."
         % (C(inv), C(n), lv, sc["topics"], sc["with"])]
    if level != "a1":
        s.append("No word taught in the levels below is repeated.")
    if fill:
        s.append("The other %s are the commonest words of everyday Polish not already chosen, from a frequency "
                 "list built from film and television subtitles, each word counted over all its forms."
                 % C(fill))
    s.append("The cards are ordered by that frequency, so the words met most often come first%s." % (
        ("; the %s set phrases, which a list of single words cannot count, come last" % C(stats["phrases"])
         if stats["phrases"] > 1 else "; the one set phrase, which a list of single words cannot count, "
         "comes last") if stats["phrases"] else ""))
    morph = ["Polish changes the endings of its nouns, adjectives and verbs, and many stems change with them, "
             "so each card carries the forms that cannot be guessed, read from a dictionary rather than "
             "generated."]
    if stats["noun"]:
        eg = _eg(cards, "pies") or _eg(cards, "dom")
        morph.append("%s nouns show their gender, three cases of the singular and two of the plural%s." % (
            C(stats["noun"]), " — " + eg if eg else ""))
    if stats["verb"]:
        eg = _eg(cards, "iść") or _eg(cards, "robić")
        morph.append("%s verbs show their aspect and its partner, the forms for ja (I), on (he) and oni (they) "
                     "and the past of on%s — a perfective verb's being its future, since it has no present."
                     % (C(stats["verb"]), " — " + eg if eg else ""))
    if stats["adj"]:
        morph.append("%s adjectives show their comparative and superlative." % C(stats["adj"]))
    if stats["pron"]:
        morph.append("%s personal pronouns show their cases." % C(stats["pron"]) if stats["pron"] > 1
                     else "One pronoun shows its cases.")
    s.extend(morph)
    have = n - stats["ex0"]
    if have:
        s.append("Real example sentences come with %s of the %s words%s, with the word picked out in colour and "
                 "a speaker beside the sentence and the headword." % (
                     C(have), C(n), ", three apiece for %s" % C(stats["ex3"]) if stats["ex3"] else ""))
    s.append("Meanings, forms and parts of speech: English Wiktionary, via the kaikki.org extraction "
             "(CC BY-SA 4.0). Frequency ordering: a word list built from OpenSubtitles "
             "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR.")
    return " ".join(s)


PHR_SUBS = ("Phrases", "Idioms", "Proverbs")


def describe_phr(n, stats, cards, candidates):
    by = {s: [c for c in cards if c.get("sub") == s] for s in PHR_SUBS}
    eg = lambda s, k: ", ".join(c["fields"]["Word"] for c in by[s][:k])
    built = [lv.upper() for lv in BANDS
             if os.path.exists(os.path.join(HERE, "..", "..", "decks", FILE % lv.upper()))]
    have = n - stats["ex0"]
    s = ["%s Polish set phrases, idioms and proverbs, in three subdecks: %s everyday phrases, %s idioms and %s "
         "proverbs." % (C(n), C(len(by["Phrases"])), C(len(by["Idioms"])), C(len(by["Proverbs"]))),
         "Both study directions come as two cards of one expression — Polish → English (see the Polish, recall "
         "the meaning) and English → Polish (see an English meaning, recall the Polish) — each with a schedule "
         "of its own.",
         "This is a companion to the level decks, Polish %s to %s, and not one of them: a level is a list of words, "
         "and an expression is a unit a list of words cannot see. Nothing here is taught by any of them, so they "
         "can be studied together without repeating an entry." % (built[0], built[-1]),
         "The PHRASES are the expressions Wiktionary files as phrases or interjections and does not mark as "
         "idiomatic — the formulas a speaker uses as one piece (%s …); sentences a learner builds from the "
         "level decks' words (\"I don't eat meat\", \"I'm from …\") are left out." % eg("Phrases", 4),
         "The IDIOMS are the expressions with a sense Wiktionary marks as idiomatic, of any part of speech — set "
         "phrases like %s as much as images like %s." % (eg("Idioms", 4), ", ".join(
             c["fields"]["Word"] for c in by["Idioms"] if c["fields"]["Word"] in
             ("robić z igły widły", "bułka z masłem", "czytać między wierszami", "trzymać kciuki"))),
         "The PROVERBS are the sayings Wiktionary files as proverbs (%s …)." % eg("Proverbs", 3),
         "WHICH ONES, since there are far more than a deck: Wiktionary has %s such Polish expressions that no "
         "level teaches, and this deck takes the %s of them that occur in at least one of Tatoeba's Polish "
         "sentences with an English translation — an expression that begins with a verb being found with that "
         "verb in any form. That is a test of being in use, not an official list." % (C(candidates), C(n)),
         "Within each subdeck the expressions come in the order of how many of those sentences contain them.",
         "Real example sentences come with %s of the %s, three apiece for %s, with the expression picked out in "
         "colour and a speaker beside the sentence and the headword." % (C(have), C(n), C(stats["ex3"])),
         "Meanings and parts of speech: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Example "
         "sentences and the count that chooses and orders the expressions: Tatoeba (tatoeba.org), CC BY 2.0 FR."]
    return " ".join(s)


def meta(level, n, inv, stats, css, stamp, cards, candidates=0):
    lv = level.upper()
    if level == "phr":
        by = {s: sum(1 for c in cards if c.get("sub") == s) for s in PHR_SUBS}
        title, tags = "Polish Phrases and Expressions", ["polish", "polski", "phrases", "idioms", "proverbs"]
        subtitle = "%s expressions · %s everyday, %s idioms, %s proverbs · both directions" % (
            C(n), C(by["Phrases"]), C(by["Idioms"]), C(by["Proverbs"]))
        desc = describe_phr(n, stats, cards, candidates)
    else:
        title, tags = "Polish " + lv, ["polish", "polski", level, "vocabulary"]
        subtitle = "%s words · both directions, as two cards per word" % C(n)
        desc = describe(level, n, inv, stats, cards)
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
        "types": {"polish": {"id": "polish", "name": "Polish vocabulary", "speechLang": "pl-PL",
                             "fields": FIELDS, "cards": CARDS, "css": css}},
        "version": 1,
        "createdAt": stamp,
        "updatedAt": stamp,
        "forkedFrom": None,
    }
