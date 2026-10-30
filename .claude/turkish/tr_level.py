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
COLOR = "#780F75"   # the Turkish collection's hue, `lang-turkish` in app.js COLL_THEME

SCOPE = {
    "a1": {
        "themes": "introductions, the classroom, family and home, a daily routine, getting about a city, "
                  "shopping and food, the weather and clothes, illness and the body, invitations, and a holiday",
        "pages": "pp. 243–254",
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
         "a CEFR-based syllabus whose %s tables for secondary school (%s) list vocabulary under ten themes: %s."
         % (lv, sc["pages"], sc["themes"])]
    s.append("%d of the %d words are that vocabulary, together with the members of the categories it names "
             "without listing them (the days of the week, the months, the seasons, the numbers) and the "
             "pronouns, question words and connectives its %s grammar list names. The programme presents its "
             "themes as suggestions rather than a fixed list, so this is not an official word list and is not "
             "presented as one." % (inv, n, lv))
    if fill:
        s.append("The other %d are the commonest words of everyday Turkish, from a frequency list built from "
                 "film and television subtitles." % fill)
    s.append("The cards are ordered by that frequency, so the words met most often come first%s." % (
        "; the %d two-word expressions, which a list of single words cannot count, come last" % stats["phrases"]
        if stats["phrases"] else ""))
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
