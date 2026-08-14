#!/usr/bin/env python3
"""The Wortgruppen a list prints before its alphabet -- eleven in A1, nineteen
in A2.

WHY THIS IS A SEPARATE STAGE.  The Wortliste has two halves.  The alphabetical
list is one word per row with an example beside it, which parse_goethe.py reads
off the page.  Before it comes a Wortgruppenliste -- the numbers, the clock, the
days, the months, the seasons, the colours, the compass, the units -- set as
tables two and three columns wide, in which a row may be `18 = achtzehn` or four
colours side by side.  Those pages cannot be read by the same rule, and they are
NOT decoration: der Tag, die Woche, der Monat, das Jahr, every month and every
weekday, every colour and every number appear in the Wortgruppen and NOWHERE in
the alphabet, so a deck built from the alphabetical list alone has no word for
Monday in it.

SO THE WORDS ARE DECLARED HERE AND CHECKED AGAINST THE PDF, which is the honest
way round: a table can be read out of the page but not reliably, while a closed
class can be written down and then proved to be the page's own.  Every word
below is asserted to appear on the Wortgruppen pages of the PDF being built
from, and the run fails naming any that does not -- so a word invented here, or
a Goethe list that changes under us, is loud rather than silent.

WHAT IS DELIBERATELY LEFT OUT.  A1's nationality group prints a PATTERN --
"Land, Bewohner, Nationalität", with Türkei/Türke/türkisch, Finnland and Mexiko
as its `z. B.` examples -- because the country an A1 candidate has to name is
their own.  A pattern cannot be enumerated, and picking three of the world's
countries because the PDF happened to use them as illustrations would be
inventing a syllabus, so only the two the page states outright (Deutschland,
Europa) and their adjectives are taken.  A2 does the opposite and NAMES five
countries, so all five are taken there -- the difference is the list's, not a
change of policy here.  The clock group's `Viertel vor zwei`, the date group's
`neunzehnhundertneunundneunzig` and A2's `14.55 = vierzehn Uhr fünfundfünfzig`
are read-aloud recipes for numbers rather than words, and are left with them:
A2's whole `Uhrzeit` and `Zeitangaben` groups are recipes and are not shelved.

A2 ALSO PRINTS ITS OCCUPATIONS AS GENDER PAIRS AND WITH NO ARTICLE -- `Arzt, ¨-e
/ Ärztin, -nen` -- where A1's groups print an article and no pairs.  So a row
here may be a 2-tuple (article, word) or a 4-tuple (article, word,
pair_article, pair_word), and the pair's articles are written down rather than
left to `build_deck`, which fills an article in from Wiktionary for a single
noun and deliberately not for a pair.
"""
import json, re, sys

from goethe_level import LEVEL, GROUP_PAGES
from goethe_level import f as lvlf

PDF = sys.argv[1] if len(sys.argv) > 1 else 'goethe_a1.pdf'
FIRST_PAGE, LAST_PAGE = GROUP_PAGES[LEVEL][0], GROUP_PAGES[LEVEL][-1]

# (group, article, word) -- the article is the PDF's own where it prints one
GROUPS_A1 = [
    ('numbers', [
        ('', 'eins'), ('', 'zwei'), ('', 'drei'), ('', 'vier'), ('', 'fünf'),
        ('', 'sechs'), ('', 'sieben'), ('', 'acht'), ('', 'neun'), ('', 'zehn'),
        ('', 'elf'), ('', 'zwölf'), ('', 'dreizehn'), ('', 'vierzehn'),
        ('', 'fünfzehn'), ('', 'sechzehn'), ('', 'siebzehn'), ('', 'achtzehn'),
        ('', 'neunzehn'), ('', 'zwanzig'), ('', 'einundzwanzig'), ('', 'dreißig'),
        ('', 'vierzig'), ('', 'fünfzig'), ('', 'sechzig'), ('', 'siebzig'),
        ('', 'achtzig'), ('', 'neunzig'), ('', 'hundert'), ('', 'tausend'),
        ('die', 'Million'), ('die', 'Milliarde'),
        ('', 'erste'), ('', 'zweite'), ('', 'dritte'), ('', 'vierte'),
        ('', 'halb'), ('das', 'Viertel'),
    ]),
    # der Monat is NOT here, and the check above is what found that out: the
    # Zeitmaße group runs Sekunde, Minute, Stunde, Tag, Woche, Jahr and stops,
    # and the word `Monat` occurs nowhere in the Wortliste as a headword -- only
    # inside three example sentences and the heading `monat/monatsnamen`, which
    # is a label for the twelve months rather than a word being taught.  So the
    # list teaches January through December without teaching `month`.  That is
    # the Goethe-Institut's gap and it is left as theirs rather than quietly
    # filled: the deck says what the exam board says.
    ('time', [
        ('die', 'Sekunde'), ('die', 'Minute'), ('die', 'Stunde'), ('der', 'Tag'),
        ('die', 'Woche'), ('das', 'Jahr'),
    ]),
    ('weekdays', [
        ('der', 'Wochentag'), ('der', 'Montag'), ('der', 'Dienstag'),
        ('der', 'Mittwoch'), ('der', 'Donnerstag'), ('der', 'Freitag'),
        ('der', 'Samstag'), ('der', 'Sonnabend'), ('der', 'Sonntag'),
        ('das', 'Wochenende'),
    ]),
    ('daytimes', [
        ('der', 'Morgen'), ('der', 'Vormittag'), ('der', 'Mittag'),
        ('der', 'Nachmittag'), ('der', 'Abend'), ('die', 'Nacht'),
    ]),
    ('months', [
        ('der', 'Januar'), ('der', 'Februar'), ('der', 'März'), ('der', 'April'),
        ('der', 'Mai'), ('der', 'Juni'), ('der', 'Juli'), ('der', 'August'),
        ('der', 'September'), ('der', 'Oktober'), ('der', 'November'),
        ('der', 'Dezember'),
    ]),
    ('seasons', [
        ('der', 'Frühling'), ('das', 'Frühjahr'), ('der', 'Sommer'),
        ('der', 'Herbst'), ('der', 'Winter'),
    ]),
    ('money', [('der', 'Euro'), ('der', 'Cent')]),
    ('measures', [
        ('der', 'Meter'), ('der', 'Zentimeter'), ('der', 'Kilometer'),
        ('der', 'Quadratmeter'), ('das', 'Prozent'), ('der', 'Liter'),
        ('das', 'Gramm'), ('das', 'Pfund'), ('das', 'Kilogramm'),
    ]),
    ('countries', [
        ('', 'Deutschland'), ('', 'deutsch'), ('', 'Europa'), ('', 'europäisch'),
    ]),
    ('colours', [
        ('', 'schwarz'), ('', 'weiß'), ('', 'grau'), ('', 'rot'), ('', 'blau'),
        ('', 'gelb'), ('', 'grün'), ('', 'braun'),
    ]),
    ('compass', [
        ('der', 'Norden'), ('der', 'Süden'), ('der', 'Westen'), ('der', 'Osten'),
    ]),
]

# A2's nineteen, transcribed from pages 5-7 of its own Wortliste.  It prints no
# articles in these tables at all, so a single noun's is left to `build_deck` to
# take from Wiktionary and only a PAIR's is written down here.
GROUPS_A2 = [
    ('abbreviations', [
        ('', 'ca.'), ('', 'd.h.'), ('', 'ICE'), ('', 'Lkw'), ('', 'PC'),
        ('', 'SMS'), ('', 'usw.'), ('', 'WC'), ('', 'z.B.'),
    ]),
    # the words the exam paper itself uses to give an instruction: a candidate
    # who cannot read `markieren` cannot answer a question they know the answer to
    ('exam', [
        ('', 'Antwortbogen'), ('', 'Aufgabe'), ('', 'Beispiel'), ('', 'Durchsage'),
        ('', 'Lösung'), ('', 'markieren'), ('der', 'Prüfer', 'die', 'Prüferin'),
        ('', 'Prüfung'), ('', 'Punkt'), ('', 'Teil'), ('', 'Test'), ('', 'Text'),
        ('', 'Wörterbuch'),
    ]),
    ('jobs', [
        ('der', 'Angestellter', 'die', 'Angestellte'),
        ('der', 'Arzt', 'die', 'Ärztin'),
        ('der', 'Auszubildender', 'die', 'Auszubildende'),
        ('der', 'Autor', 'die', 'Autorin'),
        ('', 'Babysitter'),
        ('der', 'Bäcker', 'die', 'Bäckerin'),
        ('der', 'Doktor', 'die', 'Doktorin'),
        ('der', 'Fahrer', 'die', 'Fahrerin'),
        ('der', 'Friseur', 'die', 'Friseurin'),
        ('der', 'Handwerker', 'die', 'Handwerkerin'),
        ('der', 'Hausmann', 'die', 'Hausfrau'),
        ('der', 'Journalist', 'die', 'Journalistin'),
        ('der', 'Kaufmann', 'die', 'Kauffrau'),
        ('der', 'Kellner', 'die', 'Kellnerin'),
        ('der', 'Koch', 'die', 'Köchin'),
        ('der', 'Krankenpfleger', 'die', 'Krankenschwester'),
        ('der', 'Künstler', 'die', 'Künstlerin'),
        ('der', 'Lehrer', 'die', 'Lehrerin'),
        ('der', 'Mechaniker', 'die', 'Mechanikerin'),
        ('', 'Model'),
        ('der', 'Musiker', 'die', 'Musikerin'),
        ('der', 'Polizist', 'die', 'Polizistin'),
        ('der', 'Rentner', 'die', 'Rentnerin'),
        ('der', 'Sänger', 'die', 'Sängerin'),
        ('der', 'Schauspieler', 'die', 'Schauspielerin'),
        ('der', 'Techniker', 'die', 'Technikerin'),
        ('der', 'Verkäufer', 'die', 'Verkäuferin'),
    ]),
    ('family', [
        ('', 'Bruder'), ('', 'Cousin'), ('', 'Cousine'), ('', 'Eltern'),
        ('', 'Enkel'), ('', 'Enkelin'), ('', 'Geschwister'), ('', 'Großeltern'),
        ('', 'Großmutter'), ('', 'Oma'), ('', 'Großvater'), ('', 'Opa'),
        ('', 'Kind'), ('', 'Mutter'), ('', 'Mama'), ('', 'Onkel'),
        ('', 'Schwester'), ('', 'Sohn'), ('', 'Tante'), ('', 'Tochter'),
        ('', 'Vater'), ('', 'Papa'), ('', 'Verwandte'),
    ]),
    ('marital status', [
        ('', 'ledig'), ('', 'verheiratet'), ('', 'getrennt'), ('', 'geschieden'),
    ]),
    ('colours', [
        ('', 'blau'), ('', 'braun'), ('', 'gelb'), ('', 'grau'), ('', 'grün'),
        ('', 'lila'), ('', 'orange'), ('', 'rosa'), ('', 'rot'), ('', 'schwarz'),
        ('', 'weiß'),
    ]),
    ('compass', [
        ('', 'Norden'), ('', 'Süden'), ('', 'Osten'), ('', 'Westen'),
    ]),
    ('countries', [
        ('', 'Deutschland'), ('', 'Deutsche'), ('', 'deutsch'),
        ('', 'Österreich'),
        ('der', 'Österreicher', 'die', 'Österreicherin'), ('', 'österreichisch'),
        ('die', 'Schweiz'),
        ('der', 'Schweizer', 'die', 'Schweizerin'), ('', 'schweizerisch'),
        ('', 'Luxemburg'),
        ('der', 'Luxemburger', 'die', 'Luxemburgerin'), ('', 'luxemburgisch'),
        ('', 'Europa'),
        ('der', 'Europäer', 'die', 'Europäerin'), ('', 'europäisch'),
    ]),
    ('school', [
        ('', 'Abitur'), ('', 'Direktor'), ('', 'Hausaufgabe'), ('', 'Klasse'),
        ('', 'Klassenfahrt'), ('', 'Sekretariat'), ('', 'Stundenplan'),
        ('', 'Biologie'), ('', 'Chemie'), ('', 'Deutsch'), ('', 'Englisch'),
        ('', 'Französisch'), ('', 'Geografie'), ('', 'Geschichte'),
        ('', 'Kunst'), ('', 'Latein'), ('', 'Mathematik'), ('', 'Musik'),
        ('', 'Physik'), ('', 'Religion'), ('', 'Sozialkunde'), ('', 'Sport'),
    ]),
    # the page sets four of these as SYMBOLS beside a number -- `1 cm`, `2 km`,
    # `1 %`, `1 l` -- and spells the rest out.  The symbol is what a candidate
    # meets and the word is what they have to know it says, so the word is taught
    # and the symbol is what the assertion looks for (see AS_PRINTED_A2).
    ('measures', [
        ('der', 'Euro'), ('der', 'Cent'), ('der', 'Franken'), ('der', 'Rappen'),
        ('der', 'Meter'), ('der', 'Zentimeter'), ('der', 'Kilometer'),
        ('das', 'Prozent'), ('der', 'Liter'), ('das', 'Gramm'),
        ('das', 'Kilogramm'), ('der', 'Grad'),
    ]),
    ('holidays', [
        ('', 'Karneval'), ('', 'Ostern'), ('', 'Weihnachten'), ('', 'Neujahr'),
        ('', 'Silvester'),
    ]),
    ('months', [
        ('der', 'Januar'), ('der', 'Februar'), ('der', 'März'), ('der', 'April'),
        ('der', 'Mai'), ('der', 'Juni'), ('der', 'Juli'), ('der', 'August'),
        ('der', 'September'), ('der', 'Oktober'), ('der', 'November'),
        ('der', 'Dezember'),
    ]),
    ('daytimes', [
        ('', 'Tag'), ('', 'Morgen'), ('', 'Vormittag'), ('', 'Mittag'),
        ('', 'Nachmittag'), ('', 'Abend'), ('', 'Nacht'), ('', 'Mitternacht'),
        ('', 'täglich'), ('', 'tagsüber'), ('', 'morgens'), ('', 'vormittags'),
        ('', 'mittags'), ('', 'nachmittags'), ('', 'abends'), ('', 'nachts'),
    ]),
    ('seasons', [
        ('', 'Frühling'), ('', 'Frühjahr'), ('', 'Sommer'), ('', 'Herbst'),
        ('', 'Winter'),
    ]),
    ('numbers', [
        ('', 'eins'), ('', 'zwei'), ('', 'drei'), ('', 'vier'), ('', 'fünf'),
        ('', 'sechs'), ('', 'sieben'), ('', 'acht'), ('', 'neun'), ('', 'zehn'),
        ('', 'elf'), ('', 'zwölf'), ('', 'dreizehn'), ('', 'vierzehn'),
        ('', 'fünfzehn'), ('', 'sechzehn'), ('', 'siebzehn'), ('', 'achtzehn'),
        ('', 'neunzehn'), ('', 'zwanzig'), ('', 'einundzwanzig'), ('', 'dreißig'),
        ('', 'vierzig'), ('', 'fünfzig'), ('', 'sechzig'), ('', 'siebzig'),
        ('', 'achtzig'), ('', 'neunzig'), ('', 'hundert'), ('', 'hunderteins'),
        ('', 'zweihundert'), ('', 'tausend'), ('die', 'Million'),
        ('', 'erste'), ('', 'zweite'), ('', 'dritte'), ('', 'vierte'),
        ('', 'erstens'), ('', 'zweitens'), ('', 'drittens'), ('', 'viertens'),
        ('', 'einmal'), ('', 'zweimal'), ('', 'dreimal'), ('', 'viermal'),
    ]),
    # A2 prints the weekday only inside `am Montag` and teaches the adverb beside
    # it (`montags`), where A1 prints the bare noun.  Both are taken: they are two
    # words, and the adverb is the one an A2 candidate is likelier to have to read.
    ('weekdays', [
        ('das', 'Wochenende'),
        ('der', 'Montag'), ('', 'montags'), ('der', 'Dienstag'), ('', 'dienstags'),
        ('der', 'Mittwoch'), ('', 'mittwochs'), ('der', 'Donnerstag'),
        ('', 'donnerstags'), ('der', 'Freitag'), ('', 'freitags'),
        ('der', 'Samstag'), ('', 'samstags'), ('der', 'Sonntag'), ('', 'sonntags'),
        ('der', 'Arbeitstag'), ('der', 'Werktag'), ('der', 'Feiertag'),
    ]),
    ('time', [
        ('die', 'Sekunde'), ('die', 'Minute'), ('die', 'Stunde'),
        ('die', 'Woche'), ('das', 'Jahr'),
    ]),
]

# B1 prints twenty-one groups and eleven of them are taken.  What is left out is
# left out for the reason A2's clock is: it is a RECIPE rather than a word.
# `1 € = 1 Euro`, `1 = eins`, `07:15 = sieben Uhr fünfzehn`, `heute ist der 1.
# März = der erste März` and the school-grade scales are instructions for reading
# a number aloud, and the three institution tables (Bildungseinrichtungen, the
# political offices of each country, the nationality sets) are set as a grid of
# country against institution that cannot be cut into headwords without deciding
# for the Institut which cell is a word.  The abbreviations group is a list of
# PAIRS -- `das Abo, -s = das Abonnement, -s/-e` -- and every expansion in it is
# already an entry in the alphabet, so carding the pair would teach the long form
# twice and the short one with no meaning of its own.
GROUPS_B1 = [
    ('anglicisms', [
        ('das', 'Baby'), ('der', 'Babysitter', 'die', 'Babysitterin'),
        ('die', 'Band'), ('die', 'Bar'), ('der', 'Bikini'), ('der', 'Blog'),
        ('', 'bloggen'), ('das', 'Camp'), ('', 'campen'), ('die', 'Castingshow'),
        ('der', 'CD-Player'), ('der', 'Chat'), ('', 'chatten'), ('', 'checken'),
        ('der', 'Chip'), ('die', 'City'), ('der', 'Club'), ('die', 'Cola'),
        ('der', 'Comic'), ('der', 'Computer'), ('', 'cool'), ('das', 'E-Bike'),
        ('das', 'E-Book'), ('der', 'Fan'), ('das', 'Fax'), ('', 'faxen'),
        ('das', 'Festival'), ('', 'fit'), ('die', 'Fitness'), ('', 'global'),
        ('', 'googeln'), ('der', 'Hamburger'), ('der', 'Hit'), ('die', 'Homepage'),
        ('das', 'Internet'), ('der', 'Jazz'), ('der', 'Job'), ('', 'jobben'),
        ('', 'joggen'), ('der', 'Ketchup'), ('der', 'Killer', 'die', 'Killerin'),
        ('der', 'Laptop'), ('der', 'Link'), ('', 'live'), ('die', 'Mail'),
        ('die', 'Mailbox'), ('', 'mailen'), ('der', 'Manager', 'die', 'Managerin'),
        ('die', 'Mobilbox'), ('das', 'Mountainbike'), ('', 'online'),
        ('die', 'Plattform'), ('das', 'Poster'), ('das', 'Puzzle'),
        ('das', 'Sandwich'), ('die', 'Show'), ('das', 'Smartphone'),
        ('der', 'Snack'), ('die', 'Software'), ('der', 'Song'), ('der', 'Spot'),
        ('das', 'Steak'), ('', 'surfen'), ('der', 'Swimmingpool'), ('das', 'Taxi'),
        ('das', 'Team'), ('der', 'Terminal'), ('die', 'Tour'), ('der', 'Trend'),
        ('das', 'T-Shirt'), ('', 'twittern'), ('der', 'User', 'die', 'Userin'),
    ]),
    ('subjects', [
        ('', 'Biologie'), ('', 'Chemie'), ('', 'Geografie'), ('', 'Geschichte'),
        ('', 'Mathematik'), ('', 'Musik'), ('', 'Philosophie'), ('', 'Physik'),
        ('', 'Sport'),
    ]),
    ('colours', [
        ('', 'hell-'), ('', 'dunkel-'), ('', 'blau'), ('', 'braun'), ('', 'gelb'),
        ('', 'grau'), ('', 'grün'), ('', 'lila'), ('', 'orange'), ('', 'rosa'),
        ('', 'rot'), ('', 'schwarz'), ('', 'violett'), ('', 'weiß'),
    ]),
    ('compass', [
        ('der', 'Norden'), ('der', 'Osten'), ('der', 'Süden'), ('der', 'Westen'),
        ('', 'nördlich'), ('', 'östlich'), ('', 'südlich'), ('', 'westlich'),
    ]),
    ('animals', [
        ('der', 'Affe'), ('der', 'Bär'), ('die', 'Biene'), ('der', 'Elefant'),
        ('die', 'Ente'), ('der', 'Fisch'), ('die', 'Fliege'), ('die', 'Giraffe'),
        ('der', 'Hase'), ('der', 'Hund'), ('das', 'Insekt'), ('die', 'Katze'),
        ('das', 'Krokodil'), ('die', 'Kuh'), ('der', 'Löwe'), ('die', 'Maus'),
        ('die', 'Mücke'), ('das', 'Pferd'), ('der', 'Pinguin'), ('das', 'Schaf'),
        ('die', 'Schildkröte'), ('die', 'Schlange'), ('das', 'Schwein'),
        ('der', 'Vogel'),
    ]),
    ('holidays', [
        ('', 'Neujahr'), ('', 'Ostern'), ('', 'Pfingsten'), ('', 'Weihnachten'),
        ('', 'Silvester'), ('', 'Nationalfeiertag'),
    ]),
    ('seasons', [
        ('der', 'Frühling'), ('das', 'Frühjahr'), ('der', 'Sommer'),
        ('der', 'Herbst'), ('der', 'Winter'),
    ]),
    ('months', [
        ('der', 'Januar'), ('der', 'Februar'), ('der', 'März'), ('der', 'April'),
        ('der', 'Mai'), ('der', 'Juni'), ('der', 'Juli'), ('der', 'August'),
        ('der', 'September'), ('der', 'Oktober'), ('der', 'November'),
        ('der', 'Dezember'),
    ]),
    ('dayparts', [
        ('der', 'Tag'), ('', 'täglich'), ('', 'tagsüber'), ('der', 'Morgen'),
        ('', 'morgens'), ('der', 'Vormittag'), ('', 'vormittags'),
        ('der', 'Mittag'), ('', 'mittags'), ('der', 'Nachmittag'),
        ('', 'nachmittags'), ('der', 'Abend'), ('', 'abends'), ('die', 'Nacht'),
        ('', 'nachts'), ('die', 'Mitternacht'),
    ]),
    ('weekdays', [
        ('der', 'Wochentag'), ('', 'wochentags'), ('', 'werktags'),
        ('das', 'Wochenende'), ('der', 'Montag'), ('', 'montags'),
        ('der', 'Dienstag'), ('', 'dienstags'), ('der', 'Mittwoch'),
        ('', 'mittwochs'), ('der', 'Donnerstag'), ('', 'donnerstags'),
        ('der', 'Freitag'), ('', 'freitags'), ('der', 'Samstag'), ('', 'samstags'),
        ('der', 'Sonntag'), ('', 'sonntags'),
    ]),
    ('timewords', [
        ('die', 'Sekunde'), ('die', 'Minute'), ('die', 'Stunde'), ('', 'stündlich'),
        ('der', 'Tag'), ('die', 'Woche'), ('', 'wöchentlich'), ('der', 'Monat'),
        ('', 'monatlich'), ('das', 'Jahr'), ('', 'jährlich'), ('das', 'Jahrzehnt'),
        ('das', 'Jahrhundert'), ('das', 'Jahrtausend'),
    ]),
]

GROUPS = {'a1': GROUPS_A1, 'a2': GROUPS_A2, 'b1': GROUPS_B1}[LEVEL]

# A word the pages spell differently from the lemma a card teaches: the list
# prints `ein Kilo(gramm)`, `1.000.000 = eine Million` and `(ein)hundert`, so
# the string to look for is not always the string to teach.
AS_PRINTED_A1 = {'Kilogramm': 'Kilo(gramm)', 'Million': 'Million', 'Milliarde': 'Milliarde',
                 'hundert': 'hundert', 'tausend': 'tausend', 'Monat': 'Monat'}

# A2's four measures printed only as a symbol, its two occupations whose names
# break across a line in the PDF's own text stream, and the three family words
# it prints in brackets after the formal one.  Every value below is a string that
# really is on the page, which is the whole point of the assertion: what is
# recorded here is that the word is spelled OTHERWISE there, not that the check
# may be skipped.
AS_PRINTED_A2 = {
    'Zentimeter': '1 cm', 'Kilometer': '2 km', 'Prozent': '1 %', 'Liter': '1 l',
    'Krankenschwester': 'Krankenschwes', 'Luxemburgerin': 'Luxemburgerin',
    'Oma': '(Oma)', 'Opa': '(Opa)', 'Mama': '(Mama)', 'Papa': '(Papa)',
    'Kunst': 'Kunst(erziehung)', 'Franken': 'Franke', 'Grad': 'Grad Celsius',
    'Montag': 'am Montag', 'Dienstag': 'am Dienstag', 'Mittwoch': 'am Mittwoch',
    'Donnerstag': 'am Donnerstag', 'Freitag': 'am Freitag',
    'Samstag': 'am Samstag', 'Sonntag': 'am Sonntag',
    'Wochenende': 'am Wochenende', 'Arbeitstag': 'Arbeitstag',
    'Werktag': 'Werktag', 'hundert': 'hundert', 'tausend': 'tausend',
    'Million': 'Million', 'Angestellter': 'Angestellter',
    'Auszubildender': 'Auszubildender', 'Deutsche': 'Deutsche, -n',
    # the PDF's text stream really does put a space inside this one, a kerning
    # artefact of the typesetting rather than anything about the word
    'ledig': 'l edig',
}


# B1's own eight.  Five are a word the page prints inside a bracket that offers
# both the long form and the short (`Mathe(matik)`, `Chat(room)`, `(E-)Mail`),
# and three are a compass point the page sets as a stem beside its adjective
# (`Nord-/nördlich`).  Every value is a string that really is on those pages.
AS_PRINTED_B1 = {
    'Mathematik': 'Mathe(matik)', 'Chat': 'Chat(room)', 'Mail': '(E-)Mail',
    'Ketchup': 'Ketchup/Ketschup', 'Sandwich': 'Sandwich',
    'nördlich': 'Nord-/nördlich', 'östlich': 'Ost-/östlich',
    'südlich': 'Süd-/südlich', 'westlich': 'West-/westlich',
    'samstags': 'samstags', 'Cola': 'Cola',
}

AS_PRINTED = {'a1': AS_PRINTED_A1, 'a2': AS_PRINTED_A2,
              'b1': AS_PRINTED_B1}[LEVEL]


def page_text():
    import pdfplumber
    out = []
    with pdfplumber.open(PDF) as pdf:
        for pi in range(FIRST_PAGE, LAST_PAGE + 1):
            out.append(pdf.pages[pi].extract_text() or '')
    # the pages are set with tabs between the cells of a table
    return re.sub(r'\s+', ' ', ' '.join(out))


def main():
    text = page_text()
    entries, missing = [], []
    for group, words in GROUPS:
        for row in words:
            art, word = row[0], row[1]
            pair_art, pair = (row[2], row[3]) if len(row) == 4 else ('', '')
            for w in (word, pair):
                if w and AS_PRINTED.get(w, w) not in text:
                    missing.append(f'{group}: {w}')
            disp = (art + ' ' + word).strip() if art else word
            if pair:
                disp += ', ' + (pair_art + ' ' + pair).strip()
            e = {
                'display': disp, 'article': art, 'word': word, 'plural_note': '',
                'sub': False, 'page': -1, 'group': group, 'reflexive': False,
                'pluralonly': False, 'pair': pair, 'speak': disp,
                'lemmas': [word],
            }
            if pair:
                e['pair_lemma'], e['pair_article'] = pair, pair_art
            entries.append(e)
    if missing:
        raise SystemExit('not printed on the Wortgruppen pages: ' + '; '.join(missing))
    print('  word groups:', len(entries), 'words in', len(GROUPS), 'groups,'
          ' every one found on the pages')
    json.dump(entries, open(lvlf('wordgroups.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
