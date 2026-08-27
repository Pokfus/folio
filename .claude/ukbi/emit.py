#!/usr/bin/env python3
"""Write the .folio-deck.json file."""
import json, os

from ukbi_level import (LEVEL, f as lvlf, TITLES, DECK_IDS, DECK_FILES,
                        PREDICATES, TARGET, SCOPE)

cards = json.load(open(lvlf('cards.json'), encoding='utf-8'))
entries = json.load(open(lvlf('entries.json'), encoding='utf-8'))

from deck_type import (TYPE_ID, STAMP, WORD, FIELDS, CSS,
                       FRONT_ID, BACK_ID, FRONT_EN, BACK_EN)


DECK = DECK_IDS[LEVEL]
for i, c in enumerate(cards, 1):
    c['id'] = f'u_{DECK}_{i}'
    c['type'] = TYPE_ID

# ---------------------------------------------------------------- the numbers
n = len(cards)
fams = sum(1 for c in cards if c['fields']['Forms'])
phrases = sum(1 for e in entries if ' ' in e['word'])
ex3 = sum(1 for e in entries if e['examples'] == 3)
ex0 = sum(1 for e in entries if e['examples'] == 0)

# HOW THIN THE FREQUENCY EVIDENCE IS, which the higher levels have to say out
# loud.  The subtitle list holds 11,206 dictionary headwords, and only 5,770 of
# them are used often enough (200+ times) for the count to rank anything --
# almost exactly what levels 1 to 5 consume between them, at 5,750.  So the
# ordering is well founded to about there and increasingly is not below it: the
# median count falls 22,238 / 5,640 / 2,042 / 720 / 250 / 76 across the six
# levels, and the share of words counted under 100 goes 4, 4, 5, 8, 10 and then
# 68 per cent.  That is a cliff rather than a slope, and a deck whose ordering
# has stopped meaning much should say so rather than repeat the sentence a level
# with good data can honestly print.
_freq = json.load(open(lvlf('wordlist.json'), encoding='utf-8')).get('freq', {})
thin = sum(1 for e in entries if _freq.get(e['word'], 0) < 100)
THIN_PCT = round(100 * thin / n) if n else 0
passives = sum(1 for e in entries
               if any(l == 'passive' for _f, l in e['forms']))
# A FULL FAMILY IS ROOT + ACTIVE + PASSIVE, and whether the level has ONE AT ALL
# is a categorical fact where the per-card ratio is not: that ratio falls
# smoothly from 13% at level 1 to 2.8% at level 6, so any cutoff on it would be a
# number picked to separate two levels rather than a measurement.  Full families
# number 42, 62, 70, 59, 42 and 29 at levels 1-6 and **zero** at level 7, whose
# words are the derived forms themselves.  That is the cliff, and `check-ukbi.js`
# draws the same line for the same reason -- see `WANT` there.
full_fams = sum(1 for e in entries
                if len(e['forms']) >= 3
                and any(l == 'passive' for _f, l in e['forms']))
# THE EXAMPLES ARE THIS DECK'S OWN, taken in the deck's own order (commonest
# first), not four phrases typed out for level 1 -- which is the same fault
# `SCOPE` records one field up, and it would name `terima kasih` in a deck that
# does not contain it.
PHRASE_EG = ', '.join([e['word'] for e in entries if ' ' in e['word']][:4])

NAME, PERINGKAT, BAND = PREDICATES[LEVEL]
# EVERY CLAIM THE DESCRIPTION MAKES ABOUT THE LEVEL COMES FROM HERE, not from a
# sentence typed once for level 1; see the note on `SCOPE` in `ukbi_level.py` for
# what shipped before it did.
SC = SCOPE[LEVEL]
from_inv = json.load(open(lvlf('wordlist.json'),
                          encoding='utf-8')).get('from_inventory', 0)

EX_NOTE = (f'Every word also carries three real example sentences'
           if ex0 == 0 and ex3 == n else
           f'Real example sentences come with {n - ex0} of the {n} words, three apiece '
           f'for {ex3} of them'
           + (f'; the sentence corpus has nothing at all for the other {ex0}, which are '
              'kept because a word is chosen for being worth knowing and not for being '
              'well covered by a sentence bank' if ex0 else ''))

DESC = (
    "Both study directions in one deck: Indonesian → English (see the Indonesian, "
    "recall the meaning) and English → Indonesian (see an English meaning, recall the "
    "Indonesian). Each direction is a card of its own with its own schedule, so "
    f"recognising a word and producing it are learnt separately. {n} words for "
    f"{NAME}, a predicate of the UKBI, the Uji Kemahiran Berbahasa Indonesia — "
    "the Indonesian language proficiency test set by the Badan Pengembangan dan "
    "Pembinaan Bahasa. "
    f"UKBI reports a score from 251 to 800 and one of seven predicates; {NAME} is "
    f"{SC['rank']}, peringkat {PERINGKAT}, a score of {BAND}, and its official "
    f"descriptor — the phrase it turns on is '{SC['quote']}' — describes a candidate "
    f"here as {SC['gloss']}. "
    + ("The words already taught by the level"
       + ("s" if int(LEVEL) > 2 else "")
       + " below this one are left out, so nothing here repeats them. "
       if int(LEVEL) > 1 else "")
    # A LEVEL SMALLER THAN THE ONE BELOW IT HAS TO EXPLAIN ITSELF, or a reader
    # comparing the two reads it as a claim that this predicate needs less
    # vocabulary, which is the opposite of true.  Derived from the TARGET table
    # rather than written for level 7, on the rule the two clauses below already
    # follow: a claim about a level comes from a measurement, never from its
    # number.  It has fired only at level 7 so far, where both sources run out.
    + (f"This deck is smaller than the one for {PREDICATES[str(int(LEVEL) - 1)][0]} "
       "below it, which is a fact about the sources rather than about the predicate: "
       "the two things this list is assembled from both run out here. Everything "
       "either of them can still supply is in it. "
       if int(LEVEL) > 1
       and TARGET.get(LEVEL, 0) < TARGET.get(str(int(LEVEL) - 1), 0) else "") +
    "WHERE THESE WORDS COME FROM, since it matters and since it is not what the other "
    "exam decks do: UKBI publishes no vocabulary list. It is a proficiency test rather "
    "than a syllabus, and the Badan Bahasa describes what a candidate at each predicate "
    "can do rather than which words they should know; the BIPA competency standards "
    "(Permendikbud 27/2017) are written the same way. So this word list is not an "
    "official one and is not presented as one. It was assembled from two things that "
    f"can be stated. {from_inv} of the {n} come from a vocabulary written to the "
    f"level's own descriptor — {SC['topics']} — and the other {n - from_inv} are the "
    "commonest words of everyday Indonesian, taken from a frequency list built from "
    "film and television subtitles. The cards are ordered by that frequency, so the "
    "words you meet most often come first. "
    # THE CAVEAT GETS HEAVIER AS THE LEVELS CLIMB, and it has to say so.  The
    # inventory is written to a descriptor and runs out; the corpus does not, so
    # the higher the level the more of the list the subtitles choose -- 122 of 500
    # at level 1 against 1,357 of 1,500 at level 4.  The sentence above is true at
    # every level and stops being the whole truth once the corpus is choosing most
    # of the words, because a subtitle corpus is an accurate record of what people
    # say in films and a poor guide to what a candidate needs.  Fires on the
    # measurement rather than on the level number.
    + ("A frequency list of subtitles is an accurate record of what people say in "
       "films and a rougher guide to what a candidate needs, and at this level it "
       f"chooses {round(100 * (n - from_inv) / n)} per cent of the words, so expect "
       "some of what films talk about among them. "
       if n - from_inv > from_inv else "")
    # …AND WHERE THE LIST HAS RUN OUT, THAT IS A SEPARATE ADMISSION.  See the
    # measurement above `THIN_PCT`: the caveat directly above is about WHICH
    # words the subtitles choose, and this one is about whether the count behind
    # them still ranks anything.  Fires on the measurement, so it is silent at
    # every level whose data is sound.
    + (f"A caution about the order at this level: {THIN_PCT} per cent of these words "
       "are used fewer than a hundred times in that subtitle list, which is too few for "
       "the count to rank one against another with any confidence. They are here because "
       "they are worth knowing at this level rather than because the list can place them, "
       "so treat the sequence as a rough guide and not a ranking. "
       if THIN_PCT >= 50 else "") +
    "Everything here is standard Indonesian, bahasa baku, because that is what UKBI "
    "tests: where a colloquial form is far commoner in speech the standard one is what "
    "is taught — tidak rather than nggak, tetapi rather than tapi, and di mana as two "
    "words rather than the dimana that the test marks wrong. "
    + ("The familiar-but-standard pronouns aku and kamu are taught alongside the formal "
       "saya and Anda, because Indonesian chooses its pronoun by who is being spoken "
       "to. " if LEVEL == '1' else "") +
    f"Indonesian has no gender, no plural agreement and no verb conjugation, so a card "
    "carries none. What it carries instead is the affix family, which is the part of the "
    f"language that cannot be guessed: {fams} of the words show their relatives labelled "
    f"— lihat, melihat, dilihat as root, active and passive — and {passives} of them show "
    "a passive, which Indonesian uses far more readily than English does. The prefix "
    "assimilates and swallows the root's first consonant, so tulis becomes menulis while "
    "nanti stays menanti, and there is no rule a learner can apply; the forms are read "
    "from a dictionary rather than derived. "
    # A LEVEL WHOSE WORDS *ARE* THE DERIVED FORMS HAS ALMOST NO FAMILIES TO SHOW,
    # and the paragraph above would otherwise present the card's centrepiece as
    # though this deck were full of it.  Gated on `full_fams` -- see the note
    # beside it for why a count of ZERO is the honest test and a ratio is not.
    + ("Few of this level's words show one, and that is what the level is: its "
       "vocabulary is the derived morphology itself — the -isme, -itas, ke-…-an "
       "and peN-…-an forms — rather than the roots those are built on, and those "
       "roots are in the decks below. " if not full_fams else "")
    # A COUNT THAT CAN REACH ZERO NEEDS THE SENTENCE GATED ON IT, which is the
    # `SCOPE` fault in miniature: this read "0 of the entries are phrases rather
    # than single words —  — which a list of single words cannot see at all" the
    # first time a level had none.  Every multi-word entry the dictionary carries
    # is taught by level 5 or below, so level 6 is the first with nothing to say
    # here and simply says nothing.
    + (f"{phrases} of the entries are phrases rather than single words — {PHRASE_EG} — "
       "which a list of single words cannot see at all. " if phrases else "")
    + EX_NOTE +
    ", with the word picked out in colour and a speaker beside the sentence and the "
    "headword. "
    "Level: UKBI predicate descriptors, ukbi.kemendikdasmen.go.id. Meanings, affix "
    "families and parts of speech: English Wiktionary, via the kaikki.org extraction "
    "(CC BY-SA 4.0). Frequency ordering: a word list built from OpenSubtitles "
    "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba "
    "(tatoeba.org), CC BY 2.0 FR; English Wiktionary's own usage examples "
    "(CC BY-SA 4.0); and Global Voices news articles via the OPUS collection "
    "(CC BY 3.0), which are human translations aligned sentence by sentence "
    "automatically, so a few of the sentences taken from them may not line up "
    "exactly with their English. They are used only where the other two sources "
    "have nothing."
)

meta = {
    'id': DECK,
    'title': TITLES[LEVEL],
    'subtitle': f'{n} words · both directions, as two cards per word',
    'desc': DESC,
    'author': '',
    'language': 'en',
    'color': '#B32821',
    'tags': ['indonesian', 'bahasa indonesia', 'ukbi', NAME.lower(),
             f'level {LEVEL}', 'vocabulary'],
    'glossMode': 'site',
    'types': {
        TYPE_ID: {
            'id': TYPE_ID, 'name': 'Indonesian vocabulary', 'speechLang': 'id-ID',
            'fields': FIELDS,
            'cards': [
                {'name': 'Indonesian → English', 'front': FRONT_ID, 'back': BACK_ID},
                {'name': 'English → Indonesian', 'front': FRONT_EN, 'back': BACK_EN},
            ],
            'css': CSS,
        },
    },
    'version': 1,
    'createdAt': STAMP,
    'updatedAt': STAMP,
    'forkedFrom': None,
}

deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta,
        'cards': cards, 'gloss': {}}

# **EVERY ENGLISH SIDE UNIQUE, LAST OF ALL.** A note is asked backwards as well as forwards,
# and that direction is only answerable if its English side names one word -- which across the
# shelf it often did not (Indonesian among them). The labelling is a pass over the FINISHED deck for
# `merge-directions.py`'s reason: a third of the shelf was supplied ready-made and nothing here
# can rebuild it, so calling the same pass is what keeps a pipeline run and a shipped file the
# same shape. See `.claude/dedupe-glosses.py`.
import importlib.util as _dgu
_dgp = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py')
_dgs = _dgu.spec_from_file_location('dedupe_glosses', _dgp)
_dg = _dgu.module_from_spec(_dgs)
_dgs.loader.exec_module(_dg)
_dgst = _dg.dedupe(deck, 'Indonesian')
if _dgst['groups']:
    print('  labelled %d notes in %d groups that shared an English side' % (_dgst['labelled'], _dgst['groups']))

# **A GENDERED NOUN'S FORMS ARE A TABLE, LAST OF ALL.** `plural`, `feminine` and `a, an` set in
# one horizontal run leaves the reader to work out that two of them differ in NUMBER and two in
# GENDER; as a grid the two axes are the two axes. Another pass over the FINISHED deck, for
# `merge-directions.py`'s reason. See `.claude/gender-tables.py`.
import importlib.util as _gtu
_gtp = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'gender-tables.py')
_gts = _gtu.spec_from_file_location('gender_tables', _gtp)
_gt = _gtu.module_from_spec(_gts)
_gts.loader.exec_module(_gt)
_gtst = _gt.tables(deck)
if _gtst['nouns']:
    print('  gridded %d of %d gendered nouns (%d left as a row)'
          % (_gtst['gridded'], _gtst['nouns'], _gtst['skipped']))

out = os.path.abspath(os.path.join('..', '..', 'decks', DECK_FILES[LEVEL]))
with open(out, 'w', encoding='utf-8') as fh:
    json.dump(deck, fh, ensure_ascii=False)
print('  wrote', out)
print(f'  notes {n} = cards {n * 2} | affix families {fams} | with a passive {passives}'
      f' | phrases {phrases} | three sentences {ex3} | none {ex0}')
print('  bytes', os.path.getsize(out))
