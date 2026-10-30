"""A level's own facts, and the deck's metadata built from them.

A DESCRIPTION STATES TRUE THINGS ABOUT ITS OWN LEVEL (the UKBI lesson: levels 2
and 3 shipped calling themselves "the first and most basic level").  So every
level-specific claim comes from `SCOPE`, every number from the built deck, and
every derived clause is gated on its quantity not being zero.

THE NAMES ARE ENGLISH, on request (Oct 2026): the collection is "Turkish" and a
deck is "Turkish A1"; no Turkish exam or programme name is in a title, the
programme being a syllabus rather than an exam and the one exam, TYS,
certifying only B2 and C1.
"""
import html, re

FILE = "Turkish-%s.folio-deck.json"
PHRASES_FILE = "Turkish-Phrases-and-Expressions.folio-deck.json"
COLOR = "#780F75"   # the Turkish collection's hue, `lang-turkish` in app.js COLL_THEME

SCOPE = {
    "a1": {
        "themes": "introductions, the classroom, family and home, a daily routine, getting about a city, "
                  "shopping and food, the weather and clothes, illness and the body, invitations, and a holiday",
        "pages": "pp. 243–254",
        "listed": True,
    },
    "a2": {
        "themes": "coming back from a holiday, weekend plans, a daily routine, the news, careers and the family, "
                  "living together by rules, technology, sport and healthy eating, telling a story, and travel",
        "topics": "holiday memories, clubs, cinema and concerts, timetables, the news and the weather, "
                  "professions and the extended family, rules at school and on the road, phones and computers, "
                  "sports and food, fables and their animals, feelings, transport, tourism and camping",
        "pages": "pp. 255–264",
        "listed": False,
    },
    "b1": {
        "themes": "a new course and new friends, school life and the news, entertainment and festivals, food and "
                  "cooking, the environment, sport, technology, tales and legends, personality, and the online "
                  "world; and, for B1+, which this deck includes, friends and plans, living together, the news, "
                  "theatre and cinema, inventions, clothes, famous places, humour, holidays and celebrations, and "
                  "nature",
        "topics": "enrolment, elections and clubs, traditional entertainment and music, recipes and table manners, "
                  "pollution and recycling, competitions and fair play, manuals and complaints, legends and jokes, "
                  "character and empathy, social media and online shopping, letters, neighbours and solidarity, "
                  "the economy and health in the news, the stage and advertising, inventors, sizes and returns, "
                  "historic buildings, cartoons and riddles, festivals and ceremonies, landforms and wildlife",
        "pages": "pp. 265–274, with B1+ on pp. 275–284",
        "listed": False,
    },
    "b2": {
        "themes": "people and events that changed the world, figurative language, Anatolia as an open-air museum, "
                  "planning a career, studying in Turkey, the world of the future, an atlas of cultures, a "
                  "warming planet, books and reading, and music",
        "topics": "biographies and historical events, idioms, proverbs, poetry and folk songs, Anatolia's historic "
                  "and natural sites and travel writing, aptitude tests and the jobs of the future, the education "
                  "system, housing, applications and residence permits, artificial intelligence and consumerism, "
                  "wedding rituals and customs from birth to death, natural disasters, global warming and "
                  "renewable energy, publishing, reviews and libraries, musicians, instruments and world music",
        "pages": "pp. 285–294",
        "listed": False,
    },
    "c1": {
        "themes": "communication, education and learning to learn, health, youth, travel and migration between "
                  "countries, global warming, the economy past and present, science and technology, between "
                  "cultures, and the language of art",
        "topics": "body language and communication breakdowns, kinds of education and exam anxiety, alternative "
                  "medicine, stress and psychology, the generation gap and popular culture, migration and its "
                  "law, water resources and extinction, finance, trade routes and global capital, genetics, data "
                  "security and the ethics of science, cultural interaction and diversity, artists, poetry and "
                  "the stage",
        "pages": "pp. 295–304",
        "listed": False,
    },
}

FIELDS = ["Turkish", "Word", "English", "Forms", "Examples"]
FOLD = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
CARDS = [
    {"name": "Turkish → English", "front": "{{Turkish}}",
     "back": '{{FrontSide}}{{#Forms}}{{Forms}}{{/Forms}}<hr><div class="uc-field">{{English}}</div>' + FOLD},
    {"name": "English → Turkish",
     "front": '<div class="uc-ask">Say it in Turkish</div><div class="uc-field">{{English}}</div>',
     "back": "{{FrontSide}}<hr>{{Turkish}}{{#Forms}}{{Forms}}{{/Forms}}" + FOLD},
]


def _row(card):
    cells = re.findall(r'class="uc-fl">([^<]*)</span><b>([^<]*)</b>', card["fields"]["Forms"])
    return [html.unescape(f) for _, f in cells]


def describe(level, n, inv, stats, cards):
    lv = level.upper()
    sc = SCOPE[level]
    fill = n - inv
    s = ["Both study directions in one deck: Turkish → English (see the Turkish, recall the meaning) and "
         "English → Turkish (see an English meaning, recall the Turkish). Each direction is a card of its own "
         "with its own schedule, so recognising a word and producing it are learnt separately.",
         "%d words for level %s of the Common European Framework of Reference for Languages." % (n, lv),
         "WHERE THESE WORDS COME FROM, since it matters: the Yunus Emre Institute's Turkish Proficiency Exam "
         "(TYS) certifies only B2 and C1 and publishes no vocabulary list. The scope of this deck is taken instead from the "
         "Turkish as a Foreign Language Teaching Programme (Türkçenin Yabancı Dil Olarak Öğretimi Programı; "
         "Türkiye Maarif Foundation, 2nd edition, 2020, approved by Turkey's Ministry of National Education), "
         "a CEFR-based syllabus whose %s tables for secondary school (%s) %s %s themes: %s."
         % (lv, sc["pages"], "list vocabulary under" if sc["listed"] else "are organised in",
            "twenty" if "B1+" in sc["pages"] else "ten", sc["themes"])]
    if sc["listed"]:
        s.append("%d of the %d words are that vocabulary, together with the members of the categories it names "
                 "without listing them (the days of the week, the months, the seasons, the numbers) and the "
                 "pronouns, question words and connectives its %s grammar list names. The programme presents "
                 "its themes as suggestions rather than a fixed list, so this is not an official word list and "
                 "is not presented as one." % (inv, n, lv))
    else:
        s.append("FROM A2 UP THE PROGRAMME LISTS NO VOCABULARY AT ALL: its A2 table says the vocabulary section "
                 "was left out so as not to limit the level%s. What each theme gives instead is its suggested "
                 "topics — %s. So %d of the %d words were written for Folio for those topics, a theme at a time, and are "
                 "Folio's choice rather than the programme's%s This is not an official word list and is not "
                 "presented as one." % ("" if lv == "A2" else ", and the %s tables carry none either" % lv,
                     sc["topics"], inv - stats["grammar"], n,
                     ("; %d more are words its %s grammar list itself names (%s …)."
                      % (stats["grammar"], lv, ", ".join(stats["grammar_eg"]))) if stats["grammar"] else "."))
        s.append("No word taught in the levels below is repeated.")
    if fill:
        s.append("The other %d are the commonest words of everyday Turkish, from a frequency list built from "
                 "film and television subtitles." % fill)
    s.append("The cards are ordered by that frequency, so the words met most often come first%s." % (
        ("; the %d two-word expressions, which a list of single words cannot count, come last" % stats["phrases"]
         if stats["phrases"] > 1 else "; the one two-word expression, which a list of single words cannot count, "
         "comes last") if stats["phrases"] else ""))
    # the examples show what the sentence says cannot be guessed: a stem that changes before the suffix
    nouns = [c for c in cards if len(_row(c)) == 6 and "plural" in c["fields"]["Forms"]]
    verbs = [c for c in cards if len(_row(c)) == 4 and "present" in c["fields"]["Forms"]]
    noun = next((c for c in nouns if not _row(c)[1].startswith(c["fields"]["Word"])), nouns[0] if nouns else None)
    verb = next((c for c in verbs if not _row(c)[0].startswith(c["fields"]["Word"][:-3])), verbs[0] if verbs else None)
    morph = ["Turkish builds words by adding suffixes, and a suffix's vowel follows the vowels of the word "
             "(vowel harmony) while some stems change before it, so the card carries the forms that cannot be "
             "guessed, read from a dictionary rather than generated."]
    if stats["nouns"] and noun:
        morph.append("%d nouns show their plural and five cases — %s: %s." % (
            stats["nouns"], noun["fields"]["Word"], ", ".join(_row(noun))))
    if stats["verbs"] and verb:
        morph.append("%d verbs show the third person of the present, the aorist (the general present), the "
                     "past and the future — %s: %s — the aorist's vowel being the one a learner cannot "
                     "predict." % (stats["verbs"], verb["fields"]["Word"], ", ".join(_row(verb))))
    if stats["pron"]:
        morph.append("%d pronouns show their cases." % stats["pron"])
    morph.append("Adjectives do not inflect and carry no forms.")
    s.extend(morph)
    have = n - stats["ex0"]
    if have:
        s.append("Real example sentences come with %d of the %d words%s, with the word picked out in colour and "
                 "a speaker beside the sentence and the headword." % (
                     have, n, ", three apiece for %d" % stats["ex3"] if stats["ex3"] else ""))
    s.append("Scope: Türkçenin Yabancı Dil Olarak Öğretimi Programı, Türkiye Maarif Vakfı, 2020 "
             "(ISBN 978-605-80438-2-4). Meanings, forms and parts of speech: English Wiktionary, via the "
             "kaikki.org extraction (CC BY-SA 4.0). Frequency ordering: a word list built from OpenSubtitles "
             "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR.")
    return " ".join(s)


def meta(level, n, inv, stats, css, stamp, cards):
    lv = level.upper()
    return {
        "id": "turkish" + level,
        "title": "Turkish " + lv,
        "subtitle": "%d words · both directions, as two cards per word" % n,
        "desc": describe(level, n, inv, stats, cards),
        "author": "",
        "language": "en",
        "color": COLOR,
        "tags": ["turkish", "türkçe", level, "vocabulary"],
        "glossMode": "site",
        "types": {"turkish": {"id": "turkish", "name": "Turkish vocabulary", "speechLang": "tr-TR",
                              "fields": FIELDS, "cards": CARDS, "css": css}},
        "version": 1,
        "createdAt": stamp,
        "updatedAt": stamp,
        "forkedFrom": None,
    }


def meta_phrases(cards, in_programme, stats, css, stamp):
    """The phrases deck: not a level, so none of `SCOPE`; every number read off the built deck."""
    from collections import Counter
    c = Counter(card["sub"] for card in cards)
    n = len(cards)
    eg = {sub: [card["fields"]["Word"] for card in cards if card["sub"] == sub][:3] for sub in c}
    have = n - stats["ex0"]
    s = ["%d Turkish set phrases, idioms and proverbs, in three subdecks: %d everyday phrases, %d idioms and "
         "%d proverbs. Both study directions come as two cards of one expression — Turkish → English (see the "
         "Turkish, recall the meaning) and English → Turkish (see an English meaning, recall the Turkish) — "
         "each with a schedule of its own." % (n, c["Phrases"], c["Idioms"], c["Proverbs"]),
         "This is a companion to the five level decks, Turkish A1 to C1, and not one of them: a level is an "
         "inventory of words, and an expression is a unit a list of words cannot see. Nothing here is taught "
         "by any of the five, so the two can be studied together without repeating an entry.",
         "The PHRASES are the set phrases Wiktionary does not mark as idiomatic — mostly the everyday formulas a "
         "Turkish speaker uses as one piece (%s …), with a few sayings it files the same way. %d of them occur "
         "in the example dialogues of the Turkish as a Foreign Language Teaching Programme (Türkiye Maarif "
         "Foundation, 2020), the syllabus the level decks are scoped by. The IDIOMS are expressions whose "
         "meaning is not their words' (%s …), and the PROVERBS complete sayings with a moral (%s …)."
         % (", ".join(eg.get("Phrases", [])), in_programme, ", ".join(eg.get("Idioms", [])),
            ", ".join(eg.get("Proverbs", []))),
         "Within each subdeck the expressions are ordered by how often they occur in Tatoeba's Turkish "
         "sentences, an expression ending in a verb being counted in any form of that verb, so the ones met "
         "most often come first."]
    if have:
        s.append("Real example sentences come with %d of the %d expressions%s, with the expression picked out in "
                 "colour and a speaker beside the sentence and the headword." % (
                     have, n, ", three apiece for %d" % stats["ex3"] if stats["ex3"] else ""))
    s.append("Expressions, meanings and the idiom and proverb labels: English Wiktionary, via the kaikki.org "
             "extraction (CC BY-SA 4.0). Example sentences and the order: Tatoeba (tatoeba.org), CC BY 2.0 FR.")
    return {
        "id": "trphrase",
        "title": "Turkish Phrases and Expressions",
        "subtitle": "%d expressions · %d everyday, %d idioms, %d proverbs · both directions" % (
            n, c["Phrases"], c["Idioms"], c["Proverbs"]),
        "desc": " ".join(s),
        "author": "",
        "language": "en",
        "color": COLOR,
        "tags": ["turkish", "türkçe", "phrases", "idioms", "proverbs", "deyimler", "atasözleri", "expressions"],
        "glossMode": "site",
        "types": {"turkish": {"id": "turkish", "name": "Turkish vocabulary", "speechLang": "tr-TR",
                              "fields": FIELDS, "cards": CARDS, "css": css}},
        "version": 1,
        "createdAt": stamp,
        "updatedAt": stamp,
        "forkedFrom": None,
    }
