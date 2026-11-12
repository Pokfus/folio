"""The Arabic decks' titles, templates and descriptions.

Every number in a description is read off the built deck (`stats`, the cards),
never typed, so a rebuilt deck cannot come to disagree with what it says.
"""

FILE = "Arabic-%s.folio-deck.json"
COLOR = "#2A8424"   # the Arabic collection's hue, `lang-arabic` in app.js COLL_THEME
C = lambda x: "{:,}".format(x)
FIELDS = ["Arabic", "Word", "Roman", "English", "Forms", "Table", "Examples"]
SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '<div class="uc-wordrow">{{Arabic}}' + SAY + '</div>'
ROM = '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}'
FOLDS = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
         '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
         '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
         '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
CARDS = [
    {"name": "Arabic → English", "front": WORD,
     "back": "{{FrontSide}}" + ROM + '{{#Forms}}{{Forms}}{{/Forms}}<hr><div class="uc-field">{{English}}</div>' + FOLDS},
    {"name": "English → Arabic",
     "front": '<div class="uc-ask">Say it in Arabic</div><div class="uc-field">{{English}}</div>',
     "back": "{{FrontSide}}<hr>" + WORD + ROM + "{{#Forms}}{{Forms}}{{/Forms}}" + FOLDS},
]

SCOPE = {
    "a1": {
        "title": "Arabic A1",
        "cefr": ("Can understand and use familiar everyday expressions and very basic phrases aimed at the "
                 "satisfaction of needs of a concrete type"),
    },
    "a2": {
        "title": "Arabic A2",
        "cefr": ("Can understand sentences and frequently used expressions related to areas of most immediate "
                 "relevance (e.g. very basic personal and family information, shopping, local geography, "
                 "employment)"),
    },
    "b1": {
        "title": "Arabic B1",
        "cefr": ("Can understand the main points of clear standard input on familiar matters regularly "
                 "encountered in work, school, leisure, etc."),
    },
}


def describe(level, cards, wl, stats):
    n = len(cards)
    import inventory
    used = {w["topic"] for w in wl["words"]}
    # the inventory's own order, which is the order a course meets them; its catch-all is not a topic
    topics = [t for t, _ in inventory.topics(level) if t in used and t != "more words for the level"]
    have = n - stats["ex0"]
    s = [
        "Both study directions in one deck: Arabic → English (see the Arabic, recall the meaning) and "
        "English → Arabic (see an English meaning, recall the Arabic). Each direction is a card of its own with "
        "its own schedule, so recognising a word and producing it are learnt separately.",
        "%s words of Modern Standard Arabic — the written and formal language shared across the Arab world, "
        "not any one country's spoken dialect — for level %s of the Common European Framework of Reference, "
        "whose global descriptor begins '%s'." % (C(n), level.upper(), SCOPE[level]["cefr"]),
        "WHERE THESE WORDS COME FROM, since it matters: no Arabic examination publishes an open graded word list, "
        "so this deck is not an exam board's vocabulary and does not claim to be. Every word was chosen for the "
        "level's topics — %s — and the cards are dealt by how often each word occurs in a frequency list built "
        "from Arabic film and television subtitles, the greetings first, so the words you meet most often come "
        "early." % "; ".join(topics),
    ]
    if level != "a1":
        s.append("It builds on the levels below it: no word an earlier Arabic deck teaches is taught again here, "
                 "so start with %s if you have not." % " and ".join(
                     SCOPE[lv]["title"] for lv in inventory.LEVELS[:inventory.LEVELS.index(level)]))
    if inventory.LEVELS.index(level) >= 2:
        s.append("The words the earlier decks' lists held but left out as less common compete for a place "
                 "here, so none of them is lost between levels.")
    s += [
        "Every headword is printed WITH its short vowels, as books for learners print them, because Arabic is "
        "normally written without them and nothing in the bare spelling says how كتب is read. The example "
        "sentences are printed as they were written, which is mostly without vowels — the way Arabic is met in "
        "the world. Under every word on the back is its romanisation, in Wiktionary's scheme (ā ī ū for the "
        "long vowels, ʔ for hamza, ʕ for ʿayn, a dot under the emphatic letters), as a check on what the letters "
        "say rather than a substitute for them; the Arabic Alphabet deck teaches the letters first.",
        "%s of the nouns show their plural, which in Arabic is mostly 'broken' (كِتَاب, كُتُب) and has to be "
        "learnt with the noun, and their gender; the %s adjectives show their feminine, their plural and their "
        "comparative; the %s verbs are named, as every Arabic dictionary names them, by the past tense "
        "'he did' (كَتَبَ, 'to write'), with the present, the verbal noun and the verb's form (I–X) beside it, and "
        "a past and present table of eight persons behind the All forms fold." % (
            C(stats["nouns_pl"]), C(stats["adjs"]), C(stats["verbs"])),
    ]
    if have:
        s.append("Real example sentences come with %s of the %s words, three apiece for %s, with the word picked "
                 "out in colour and a speaker beside the sentence and the headword. A sentence is matched by the "
                 "word's own forms, with the little words Arabic writes joined to the front of a word (و 'and', "
                 "بِ 'with', لِ 'for', the article الـ) allowed for; where two words of the deck share a "
                 "spelling, a sentence is used only if its vowels say which one it is." % (
                     C(have), C(n), C(stats["ex3"])))
    s.append("Vowelled forms, romanisation, plurals and conjugations: English Wiktionary, via the kaikki.org "
             "extraction (CC BY-SA 4.0). The English meanings were written for this deck. Example sentences: "
             "Tatoeba (tatoeba.org), CC BY 2.0 FR. The order: Hermit Dave's FrequencyWords, from OpenSubtitles "
             "(CC BY-SA 4.0).")
    return " ".join(s)


def meta(level, cards, wl, stats, css, stamp):
    return {
        "id": "arabic" + level,
        "title": SCOPE[level]["title"],
        "subtitle": "%s words · Modern Standard Arabic · both directions" % C(len(cards)),
        "desc": describe(level, cards, wl, stats),
        "author": "",
        "language": "en",
        "color": COLOR,
        "tags": ["arabic", "العربية", "msa", level, "vocabulary"],
        "glossMode": "site",
        "types": {"arabic": {"id": "arabic", "name": "Arabic vocabulary", "speechLang": "ar",
                             "fields": FIELDS, "cards": CARDS, "css": css}},
        "version": 1,
        "createdAt": stamp,
        "updatedAt": stamp,
        "forkedFrom": None,
    }
