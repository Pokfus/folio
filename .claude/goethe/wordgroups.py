#!/usr/bin/env python3
"""The thirteen Wortgruppen the A1 list prints before its alphabet.

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

WHAT IS DELIBERATELY LEFT OUT.  The nationality group prints a PATTERN --
"Land, Bewohner, Nationalität", with Türkei/Türke/türkisch, Finnland and Mexiko
as its `z. B.` examples -- because the country an A1 candidate has to name is
their own.  A pattern cannot be enumerated, and picking three of the world's
countries because the PDF happened to use them as illustrations would be
inventing a syllabus, so only the two the page states outright (Deutschland,
Europa) and their adjectives are taken.  The clock group's `Viertel vor zwei`
and the date group's `neunzehnhundertneunundneunzig` are read-aloud recipes for
numbers rather than words, and are left with them.
"""
import json, re, sys

from goethe_level import f as lvlf

PDF = sys.argv[1] if len(sys.argv) > 1 else 'goethe_a1.pdf'
FIRST_PAGE, LAST_PAGE = 5, 7        # the Wortgruppenliste

# (group, article, word) -- the article is the PDF's own where it prints one
GROUPS = [
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

# A word the pages spell differently from the lemma a card teaches: the list
# prints `ein Kilo(gramm)`, `1.000.000 = eine Million` and `(ein)hundert`, so
# the string to look for is not always the string to teach.
AS_PRINTED = {'Kilogramm': 'Kilo(gramm)', 'Million': 'Million', 'Milliarde': 'Milliarde',
              'hundert': 'hundert', 'tausend': 'tausend', 'Monat': 'Monat'}


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
        for art, word in words:
            look = AS_PRINTED.get(word, word)
            if look not in text:
                missing.append(f'{group}: {word}')
            entries.append({
                'display': (art + ' ' + word).strip() if art else word,
                'article': art, 'word': word, 'plural_note': '', 'sub': False,
                'page': -1, 'group': group, 'reflexive': False,
                'pluralonly': False, 'pair': '', 'speak': (art + ' ' + word).strip(),
                'lemmas': [word],
            })
    if missing:
        raise SystemExit('not printed on the Wortgruppen pages: ' + '; '.join(missing))
    print('  word groups:', len(entries), 'words in', len(GROUPS), 'groups,'
          ' every one found on the pages')
    json.dump(entries, open(lvlf('wordgroups.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
