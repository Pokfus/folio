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
COLOR = "#6B7493"   # the Polish collection's hue, `lang-polish` in app.js COLL_THEME

SCOPE = {
    "a1": {
        "topics": "people and the family, daily life, free time, the home, places in town, transport and "
                  "directions, work and school, food, shopping and money, health, the seasons and the weather, "
                  "and the basic names of plants and animals",
    },
}


def taught_below(level):
    """Headwords already in the shipped decks of the levels below (none for A1)."""
    out = set()
    root = os.path.join(HERE, "..", "..", "decks")
    for lv in BANDS[:BANDS.index(level)]:
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
         "topics the %s exam is described as covering — %s — together with the numbers, days, months and "
         "colours and the pronouns, question words, prepositions and conjunctions every sentence is built "
         "from. They are Folio's choice, not the Commission's, and this is not an official word list."
         % (C(inv), C(n), lv, sc["topics"])]
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
        morph.append("%s personal pronouns show their cases." % C(stats["pron"]))
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


def meta(level, n, inv, stats, css, stamp, cards):
    lv = level.upper()
    return {
        "id": "polish" + level,
        "title": "Polish " + lv,
        "subtitle": "%s words · both directions, as two cards per word" % C(n),
        "desc": describe(level, n, inv, stats, cards),
        "author": "",
        "language": "en",
        "color": COLOR,
        "tags": ["polish", "polski", level, "vocabulary"],
        "glossMode": "site",
        "types": {"polish": {"id": "polish", "name": "Polish vocabulary", "speechLang": "pl-PL",
                             "fields": FIELDS, "cards": CARDS, "css": css}},
        "version": 1,
        "createdAt": stamp,
        "updatedAt": stamp,
        "forkedFrom": None,
    }
