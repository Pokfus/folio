#!/usr/bin/env python3
"""Turn each settled entry into a card: article, forms, paradigm, meanings.

WHAT AN ITALIAN CARD HAS TO CARRY that a German or Spanish one does not, and
why each of these is a decision rather than a field:

  · **THE ARTICLE, BECAUSE IT IS FOUR WORDS AND THE SPELLING PICKS ONE.**  A
    German noun's article is its gender; an Italian noun's is its gender AND the
    sounds it starts with -- `il libro`, `lo studente`, `lo zio`, `l'amico` --
    so it is derived by `italian.article` rather than looked up, and the
    derivation is the thing being taught.  See that module's header.

  · **THE PLURAL, BECAUSE IT CARRIES THE GENDER WHERE THE SINGULAR DOES NOT.**
    `l'` elides in both genders, so `l'amico` and `l'amica` look alike; `gli
    amici` and `le amiche` do not.  Every noun therefore shows its plural WITH
    that plural's own article, which is the one place a vowel-initial noun's
    gender is legible.

  · **THE AUXILIARY, BECAUSE `essere` OR `avere` IS THE FACT ABOUT AN ITALIAN
    VERB.**  It is not derivable and it has to be learnt with the verb: `ho
    parlato` but `sono andato`.  So the passato prossimo is built out in all six
    persons rather than named, and for an `essere` verb the participle is shown
    AGREEING (`sono andato/a`, `siamo andati/e`), which is the other half of the
    same rule and the half a learner forgets.

  · **A PARTICIPLE AGREES ONLY WHERE IT REGULARLY CAN.**  `italian.agree`
    derives the four endings of an `-o` participle and returns anything else
    unchanged, so an irregular participle is shown as the dictionary states it
    rather than inflected on a guess.

WHAT IS NOT DONE, deliberately: no plural, feminine or adjective form is ever
DERIVED where the dictionary states one, and the regular derivation that exists
refuses the `-co` / `-go` / `-cia` classes outright rather than guessing at a
spelling change it would get right about twice in three.  A form on a card is
one somebody wrote down.
"""
import html as _html
import json, re
from collections import Counter

from cils_level import LEVEL, f as lvlf
from italian import (article, with_article, indefinite, agree,
                     adj_forms_regular, clean_form, destress, fold)
from wikt import real_senses, letter_name, pointer_targets

entries = json.load(open(lvlf('entries.json')))
W = json.load(open(lvlf('wikt.json')))
EX = json.load(open(lvlf('examples.json')))


def esc(s):
    return _html.escape(s or '', quote=True)


# ---------------------------------------------------------------- senses
BAD_TAGS = {'obsolete', 'archaic', 'dated', 'vulgar', 'slang', 'offensive',
            'derogatory', 'ethnic-slur', 'rare', 'dialectal', 'regional',
            'poetic', 'literary', 'humorous'}


# A gloss that describes what the word DOES to a sentence rather than saying
# what it means.  Italian function-word entries are full of them.
_NOTE_RX = re.compile(
    r'(forms|used|indicates?|expresses?|denotes|most commonly|without any|see )\b', re.I)


def sense_rank(s):
    """Wiktionary's own order is the signal -- the Goethe stage's finding, and it
    holds here.  The only reordering is to push a sense labelled obsolete or
    dialectal behind the plain ones, and to demote a gloss that describes a
    grammatical FUNCTION rather than translating ("used to form the …"), which
    on the Italian function words is otherwise what a card opens on.

    It ranks THE STRING THE CARD WILL ACTUALLY SHOW, by asking `sense_gloss` for
    it.  Reading `glosses[0]` while the card showed `glosses[-1]` is what let
    `essere` rank its "to exist, there be" sense as a clean translation and then
    print the sub-note hanging off it.
    """
    if set(s.get('tags') or []) & BAD_TAGS:
        return 2
    g = sense_gloss(s)
    return 1 if (not g or _NOTE_RX.match(g)) else 0


def tidy(g, head=''):
    g = re.sub(r'\s+', ' ', g).strip()
    # A CROSS-REFERENCE TO THE WIKI IS NOT A MEANING.  `avere` glosses "to have
    # (done something); See Category:Italian transitive verbs and Category:…",
    # which shipped whole -- the reader is told to go and look at a category
    # page on a site the card never names.
    g = re.sub(r'[;,.]?\s*(?:see|cf\.?|compare)\b[^;.]*(?:Category|Appendix|Thesaurus):[^;.]*',
               '', g, flags=re.I)
    g = re.sub(r'^\[[^\]]*\]\s*', '', g)
    g = re.sub(r'\s*\[[^\]]*\]', '', g)
    # A TRAILING PARENTHETICAL IS USUALLY A USAGE NOTE AND OCCASIONALLY THE WHOLE
    # MEANING, and which it is shows in what is left without it.  Wiktionary
    # glosses a place as `Marche (an administrative region in central Italy)`,
    # and stripped that reads "Marche" -- a card whose English side is its own
    # Italian side, which taught fifteen of them nothing at all.  `Russia` and
    # `Siena` gloss themselves too and are simply correct; the test cannot be
    # "is it a proper noun", it has to be whether the sentence still says
    # something.
    cut = re.sub(r'\s*\((?:[^()]|\([^()]*\))*\)\s*$', '', g).strip()
    if not cut or (head and fold(cut) == fold(head)):
        cut = g.strip()
    return re.sub(r'\s+', ' ', cut).strip(' ;:,.')


def sense_gloss(s_, head=''):
    """What one sense contributes, or ''.

    A SENSE THAT POINTS AT ANOTHER WORD STILL OFTEN CARRIES THE MEANING after a
    colon -- and in this band that is not a corner case but a whole class, since
    a lemmatised frequency list prints participles as headwords: `aperto` is
    filed as "past participle of aprire: open, opened", `interessato` as one of
    `interessare`.  Dropping those would leave several dozen words with no
    meaning at all.

    **`glosses` IS A HIERARCHY, NOT A LIST OF ALTERNATIVES, AND THE MEANING IS
    USUALLY FIRST.**  The German stage reads the LAST element, because there the
    deeper gloss is the more specific translation.  Italian entries use the
    second element for a NOTE about the first: `essere` files
    `['to exist, there be', 'Most commonly with ci or vi, see the appropriate
    entries at esserci and esservi…']`, and reading the last threw away "to
    exist" and printed the cross-reference.  Every element is cleaned and the
    first that is a translation rather than a note is the one that ships -- so
    a sense whose only gloss is a note still contributes something, and a sense
    that has a real meaning anywhere in its hierarchy shows that.
    """
    gs = [g for g in (s_.get('glosses') or []) if g and g.strip()]
    if not gs:
        return ''
    g = gs[0]
    if s_.get('form_of') or s_.get('alt_of'):
        # **THE POINTER OFTEN STATES THE TARGET'S MEANING IN A FIELD OF ITS OWN**,
        # and reading it is strictly better than following the pointer.  An
        # absolute superlative is the class that made this visible: `altissimo`
        # is glossed "superlative degree of alto (“highest”)" with
        # `form_of: [{word: alto, extra: highest}]`, so chasing the pointer gives
        # `alto` -> "high" and the card loses the superlative altogether.  Taken
        # from `extra` it reads "highest", which is what the word means.  Prose
        # is not parsed for it -- the parenthetical is a rendering of this field,
        # and the field is unambiguous where the prose is not.
        for k in ('form_of', 'alt_of'):
            for f_ in (s_.get(k) or []):
                x = (f_ or {}).get('extra') if isinstance(f_, dict) else None
                if x and x.strip():
                    return tidy(x, head)
        # THE SEPARATOR IS A FULL STOP AS WELL AS A COLON, which the German
        # stage did not need: Italian entries write `clitic accusative of io.
        # me` where German writes `agent noun of lehren: teacher`.  Reading only
        # the colon left `mi` with nothing but "Used as ethical dative" -- both
        # of its real meanings are behind a full stop.
        parts = re.split(r'[:;.]\s+', g, 1)
        if len(parts) < 2 or not parts[1].strip():
            return ''
        return tidy(parts[1], head)

    # A GLOSS MAY OPEN ON A USAGE NOTE AND THEN TRANSLATE: `essere` is glossed
    # "Used as a copula. to be", and taken whole that is what the card leads
    # with.  The note is dropped and the translation kept.
    def clean(x):
        m = re.match(r'(?:used|denotes|indicates?|expresses?)\b[^.;:]*[.;:]\s+(.+)',
                     x, re.I)
        out = tidy(m.group(1) if m else x, head)
        return '' if out.endswith(':') else out

    cands = [c for c in (clean(x) for x in gs) if c]
    for c in cands:
        if not _NOTE_RX.match(c):
            return c
    return cands[0] if cands else ''


def glosses_for(rec, limit=3, head=''):
    """The meanings a card shows, best first.

    A USAGE NOTE IS SHOWN ONLY WHERE THE WORD HAS NO PLAIN MEANING.  Ranking
    demotes one behind the translations, which is enough when there are some --
    but `mai` glosses "never", "ever, always" and "used as an intensifier", and
    with a limit of three the note came along anyway.  Grouping by rank and
    taking the best band that has anything in it keeps `mai` to its two real
    meanings and still leaves a word whose every sense is a note (`ecco`) with
    something on its card rather than nothing.
    """
    if rec is None:
        return []
    bands = {}
    for s_ in rec.get('senses', []):
        g = sense_gloss(s_, head)
        if not g:
            continue
        bands.setdefault(sense_rank(s_), [])
        if g not in bands[sense_rank(s_)]:
            bands[sense_rank(s_)].append(g)
    for r in (0, 1, 2):
        if bands.get(r):
            return bands[r][:limit]
    return []


# A word Wiktionary cannot gloss is AUTHORED rather than dropped -- the Goethe
# stage's rule.  These are the entries in this band whose record is missing or
# is nothing but a pointer; each was read before it was written.
#
# `(part of speech, gloss)`, or `(part of speech, gloss, gender)` for a noun that
# should carry its article -- the gender cannot be read off a record that is not
# there, and `il tour` teaches more than a bare `tour`.
AUTHORED = {
    'new york': ('name', 'New York'),
    'stati uniti': ('name', 'the United States'),
    'prima di': ('phrase', 'before'),
    # a truncated determiner: Wiktionary files `nessun` and `alcun` as bare
    # apocopated forms of `nessuno` / `alcuno` with no gloss of their own, so
    # there is nothing to take a tail off and the card would otherwise be dropped
    'nessun': ('det', 'no, not any'),
    'alcun': ('det', 'any, some'),
    # every sense of `ecco` is a usage note, in both of its records: the word is
    # a presentative and has no translation, only an equivalent
    'ecco': ('intj', 'here is, here are; there you go'),
    # A2.  The same three shapes as A1's: a multiword expression the dictionary
    # files under its parts, a proper noun, and an apocopated determiner.
    'in grado di': ('phrase', 'able to, capable of'),
    'per quanto riguarda': ('phrase', 'as regards, as for, concerning'),
    'vicino a': ('phrase', 'near, close to'),
    'fuori da': ('phrase', 'out of, outside'),
    'gran bretagna': ('name', 'Great Britain'),
    'ciascun': ('det', 'each, every'),
    # a colloquial contraction of `va bene`, which Wiktionary carries with no
    # gloss of its own
    'vabbè': ('intj', 'oh well; all right, fine'),
    # an abbreviation of `chilometro`, read aloud as the word it stands for
    'km': ('noun', 'kilometre (abbreviation of chilometro)', 'm'),
    # B1.  Four initialisms, which Italian borrows whole and genders by the word
    # they stand for (la televisione, il compact disc, il personal computer)
    'tv': ('noun', 'TV, television', 'f'),
    'cd': ('noun', 'CD, compact disc', 'm'),
    'pc': ('noun', 'PC, computer', 'm'),
    # Italian Wiktionary carries no entry for the ordinary borrowing at all --
    # only `Tour`, the cycling race, which is what the card was glossed with
    'tour': ('noun', 'tour, trip, excursion', 'm'),
    # filed as a bare variant of `olivo`, with no gloss of its own
    'ulivo': ('noun', 'olive tree', 'm'),
    'lontano da': ('phrase', 'far from'),
    'invece di': ('phrase', 'instead of'),
    'sino a': ('phrase', 'up to, until, as far as'),
    'unione sovietica': ('name', 'the Soviet Union'),
    # B2.  Five English borrowings Italian takes whole and genders by sense, two
    # more abbreviations, four phrases, and two words whose only record belongs
    # to somebody else -- see `mila` and `g` below.
    'band': ('noun', 'band (musical group)', 'f'),
    'network': ('noun', 'network', 'm'),
    'master': ("noun", "master's degree; postgraduate course", 'm'),
    'punk': ('noun', 'punk', 'm'),
    'aids': ('noun', 'AIDS', 'm'),
    'cm': ('noun', 'centimetre (abbreviation of centimetro)', 'm'),
    'dietro a': ('phrase', 'behind'),
    'a fianco': ('phrase', 'beside, alongside'),
    'nel quadro di': ('phrase', 'within the framework of, as part of'),
    'nel contempo': ('phrase', 'at the same time, meanwhile'),
    'nazioni unite': ('name', 'the United Nations'),
    # filed as a bare participle of `rivedere`, with no gloss of its own
    'rivisto': ('adj', 'revised, reviewed'),
    # Italian Wiktionary's only lower-case `mila` is a pointer ("plural of
    # mille"), so the lemma search falls through to `Mila`, a given name -- and
    # the card came out headed `Mila` and glossed "a surname; a female given
    # name".  It is the `mila` of `duemila`.
    'mila': ('num', 'thousand (in compounds: duemila, tremila)'),
    # `usa` is the one word `says_something`'s pointer rule costs: its lower-case
    # entry is a real form of `usare`, so the lemma search now stops there and the
    # card would read "he/she uses" for a list entry that means the country
    'usa': ('name', 'the USA, the United States'),
    # `g` for gram, the third of these after `km` and `cm` -- and the only one
    # whose spelling is also a letter of the alphabet, which is the record the
    # dictionary offers and the gloss the card had
    'g': ('noun', 'gram (abbreviation of grammo)', 'm'),
    # C1.  Nine borrowings Italian takes whole and one native compound, none of
    # which English Wiktionary carries an Italian entry for at all.  **EACH WAS
    # MEASURED BEFORE IT WAS WRITTEN, against the subtitle frequency list and the
    # Tatoeba corpus this pipeline already downloads**, because "I am fairly sure
    # that is a word" is exactly what this table must not be built out of: every
    # one below is in real Italian use (`vivavoce` 741 subtitle hits, `eros` 459,
    # `offshore` 464, `mousse` in De Mauro's basic vocabulary), and three words
    # that failed the same test are refused instead -- see REFUSED.
    'ultimatum': ('noun', 'ultimatum', 'm'),
    'auditorium': ('noun', 'auditorium, concert hall', 'm'),
    'cannabis': ('noun', 'cannabis', 'f'),
    'mantra': ('noun', 'mantra', 'm'),
    'mousse': ('noun', 'mousse', 'f'),
    'noir': ('noun', 'noir (film or literary genre)', 'm'),
    'eros': ('noun', 'eros, erotic love', 'm'),
    'offshore': ('adj', 'offshore'),
    # Wiktionary carries this one, as a bare pointer to `viva voce` -- which it
    # does not carry either, so the pointer chase has nowhere to go
    'vivavoce': ('noun', 'speakerphone, hands-free', 'm'),
    # C2.  Nine more the dictionary has no Italian entry for, measured the same
    # way -- and two of them refine the test.  **ASK THE PLURAL BEFORE CONCLUDING
    # A NOUN IS UNATTESTED**: `feromone` and `maceria` come back zero in both
    # corpora and would have been refused on C1's rule, while `feromoni` has 286
    # subtitle hits and `macerie` 788, is in De Mauro's basic vocabulary and has
    # a dictionary entry of its own.  Italian simply does not use either
    # singular; the word is real and the lemma the list prints is the right one.
    'chakra': ('noun', 'chakra', 'm'),
    'graal': ('noun', 'grail; the Holy Grail', 'm'),
    'ossicodone': ('noun', 'oxycodone', 'm'),
    'continuum': ('noun', 'continuum', 'm'),
    'interim': ('noun', 'interim, the period between two appointments', 'm'),
    'corpus': ('noun', 'corpus, a body of texts', 'm'),
    'feromone': ('noun', 'pheromone', 'm'),
    # transcribed from the dictionary's own entry for the plural `macerie`
    'maceria': ('noun', 'rubble, wreckage, debris', 'f'),
    # no dictionary entry anywhere, and 302 subtitle hits: a science-fiction
    # coinage from dubbed television, transparently sub- + `spaziale`.  Attested,
    # so it is carded rather than refused -- REFUSED is for what is not.
    'subspaziale': ('adj', 'subspace'),
}

# **A WORD THIS DECK WILL NOT TEACH, and why.**  A drop is otherwise silent: the
# run prints a count, the deck builds, and only a reader counting the cards ever
# finds out.  Everything here was looked up in the Wiktionary dump and in both
# corpora first, and each falls into one of two kinds.
#
# NOT ITALIAN.  The list is a frequency band built from a subtitle corpus, so it
# has swept in proper nouns and English words that are frequent in Italian
# subtitles without being Italian: `metropolis` (Italian is `metropoli`, which
# the band also lists), `paranoid` (`paranoico`), and three names -- `faust`,
# `faber`, `graves`.  Each has 260-470 subtitle hits, which is what a title or a
# surname looks like, and none has a dictionary entry.
#
# NOT ATTESTED.  `stupidire`, `autodifendere` and `interrogatore` are all
# plausible Italian and all three come back ZERO in the subtitle list, zero in
# Tatoeba, absent from De Mauro and absent from the dictionary.  Plausible is not
# evidence, and a deck that invents a headword is worse than one that is three
# words short of a list it did not write.  (`autodifesa`, the noun, has 790
# subtitle hits -- which is the shape of the thing: the noun is the word and the
# verb is not.)
REFUSED = {
    'metropolis': 'the English word; Italian is `metropoli`, also in this band',
    'paranoid': 'the English word; Italian is `paranoico`',
    'faust': 'a name',
    'faber': 'a name',
    'graves': 'a name',
    'stupidire': 'no dictionary entry and no corpus attestation',
    'autodifendere': 'no dictionary entry and no corpus attestation',
    'interrogatore': 'no dictionary entry and no corpus attestation',
    # C2.  The same two kinds, and the band is small enough that they are a
    # twelfth of it.  `fulcrum` and `vogue` are the sharpest illustration of what
    # the list is: Italian has `fulcro` and `voga`, both in the dictionary and
    # both glossed with exactly these English words, and what put the English
    # spellings in a band of Italian vocabulary is that `Fulcrum` is the NATO
    # reporting name for the MiG-29 and `Vogue` is a magazine.
    'fulcrum': 'the English word; Italian is `fulcro`',
    'vogue': 'the English word; Italian is `voga`',
    'capere': 'Latin; the Italian verb is `capire`',
    'ultro': 'a Latin adverb',
    # 532 and 429 subtitle hits between them and no dictionary entry, no corpus
    # sentence and no reading anyone here could put to them.  A high subtitle
    # count is not evidence that a string is a word -- see `faust` above.
    'trofobico': 'no dictionary entry and no identifiable meaning',
    'supersimo': 'no dictionary entry and no identifiable meaning',
    'divisare': 'no dictionary entry and no corpus attestation',
    'indettare': 'no dictionary entry and no corpus attestation',
}

# A NAME THE DICTIONARY DOES NOT CARRY IS SPELT HERE, since `select`'s
# recasing can only read a spelling off a record that exists.  Keyed by the
# lower-case surface the list prints, exactly as AUTHORED is.
AUTHORED_DISPLAY = {
    'new york': 'New York',
    'stati uniti': 'Stati Uniti',
    'gran bretagna': 'Gran Bretagna',
    'unione sovietica': 'Unione Sovietica',
    'nazioni unite': 'Nazioni Unite',
    'aids': 'AIDS',
    # `select` recased this one on the dictionary's word: its only lower-case
    # record is a pointer, so the corpus refusal (which needs the lower-case
    # spelling to have NO record) could not reach it.  Forced back here rather
    # than by loosening that rule, which protects `Usa` -- whose lower-case
    # spelling is likewise a pointer, to `usare`, and which really is the name.
    'mila': 'mila',
    'usa': 'Usa',
    # C2.  A proper noun in Italian, printed bare by the list, and with no
    # record of its own for the recasing to read a spelling off -- the corpus
    # writes it capitalised ("I banditi hanno rubato il Sacro Graal").
    'graal': 'Graal',
}

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'prep': 'preposition', 'conj': 'conjunction',
            'num': 'number', 'intj': 'interjection', 'det': 'determiner',
            'article': 'article', 'particle': 'particle', 'name': 'proper noun',
            'phrase': 'phrase', 'character': 'letter', 'other': ''}


def pointer_gender(recs):
    """The gender a form-of sense states about ITSELF, or ''.

    Read off the pointer rather than off the word it points at, because those
    disagree exactly where it matters: `esperta` is "female equivalent of
    esperto", and `esperto` is masculine.  The sense's own tags say `feminine`,
    which is a fact about `esperta`.
    """
    for r in recs:
        for s in (r.get('senses') or []):
            if not (s.get('form_of') or s.get('alt_of')):
                continue
            tags = set(s.get('tags') or [])
            if 'feminine' in tags:
                return 'f'
            if 'masculine' in tags:
                return 'm'
    return ''


def pick_record(recs, pos):
    """The best record in a list for a given part of speech.

    Shared with `rec_for` so that a record reached through a pointer is chosen by
    the same rules as one reached directly -- including the letter-name refusal,
    which is what keeps a one-letter target from glossing as the alphabet.
    """
    def usable(r):
        return any(sense_gloss(s) for s in (r.get('senses') or []))

    same = [r for r in recs if r.get('pos') == pos]
    for pool in (same, recs):
        for test in (lambda r: real_senses(r) and not letter_name(r),
                     lambda r: usable(r) and not letter_name(r)):
            for r in pool:
                if test(r):
                    return r
    return same[0] if same else (recs[0] if recs else None)


def rec_for(e):
    """The record the card is built from: this entry's part of speech, preferring
    one that actually carries meanings."""
    recs = W.get(e['lemma']) or []
    same = [r for r in recs if r.get('pos') == e['pos']]

    # THE LETTER-NAME RECORD IS REFUSED HERE TOO, and it has to be: `select`
    # already declined it when it chose the part of speech, and a builder that
    # then takes the first record of that part of speech undoes the decision.
    # `ti` came out a noun meaning "the name of the Latin script letter T/t"
    # because its pronoun senses are all pointers and its two noun records are
    # the letter and the musical note.
    #
    # AND A RECORD WHOSE SENSES ARE ALL POINTERS IS STILL USABLE, which is the
    # other half of the same card.  `real_senses` is the strict test -- no
    # `form_of` -- but `sense_gloss` reads the meaning out of a pointer's tail
    # ("accusative/dative of tu; you" gives "you"), so a part of speech chosen
    # deliberately must be tried with THAT test before the search widens to
    # another one.  Ranked strictly, `ti` skipped its own pronoun record and
    # came back glossed as the musical note B.
    def usable(r):
        return any(sense_gloss(s) for s in (r.get('senses') or []))

    for test in (lambda r: real_senses(r) and not letter_name(r),
                 lambda r: usable(r) and not letter_name(r)):
        for r in same:
            if test(r):
                return r
    for test in (lambda r: real_senses(r) and not letter_name(r),
                 lambda r: usable(r) and not letter_name(r),
                 lambda r: not letter_name(r)):
        for r in recs:
            if test(r):
                return r
    return same[0] if same else (recs[0] if recs else None)


# ---------------------------------------------------------------- nouns
def gender_of(rec, lemma):
    """'m', 'f', 'mf' or ''.

    Read from the SENSE tags, which is where kaikki puts it for Italian, with
    the head template as a fallback -- `head_templates[0].expansion` opens
    `casa f (plural case…)`.  A noun tagged both ways (`il/la turista`) comes
    back 'mf' rather than being forced to one, since both articles are real.
    """
    tags = set()
    for s_ in rec.get('senses', []) if rec else []:
        tags |= set(s_.get('tags') or [])
    m, f = 'masculine' in tags, 'feminine' in tags
    if not (m or f):
        for h in (rec.get('head_templates') or [] if rec else []):
            exp = h.get('expansion') or ''
            if re.search(r'\bm\b', exp):
                m = True
            if re.search(r'\bf\b', exp):
                f = True
    return 'mf' if (m and f) else 'm' if m else 'f' if f else ''


def is_invariable(rec):
    for s_ in rec.get('senses', []) if rec else []:
        if 'invariable' in set(s_.get('tags') or []):
            return True
    for h in (rec.get('head_templates') or [] if rec else []):
        if 'invariable' in (h.get('expansion') or ''):
            return True
    return False


def forms_tagged(rec, want, without=()):
    """Every form carrying all of `want` and none of `without`, destressed."""
    out = []
    for f in (rec.get('forms') or []) if rec else []:
        tg = set(f.get('tags') or [])
        if want <= tg and not (tg & set(without)):
            s = clean_form(f.get('form'))
            if s and s not in out and s not in ('-', '—'):
                out.append(s)
    return out


def plural_of(rec):
    pl = forms_tagged(rec, {'plural'}, {'feminine', 'masculine', 'diminutive',
                                        'augmentative', 'superlative', 'table-tags'})
    return pl[0] if pl else ''


def feminine_of(rec):
    fe = forms_tagged(rec, {'feminine'}, {'plural', 'diminutive', 'augmentative',
                                          'superlative', 'table-tags'})
    return fe[0] if fe else ''


# ---------------------------------------------------------------- verbs
PERSONS = [('io', {'first-person', 'singular'}),
           ('tu', {'second-person', 'singular'}),
           ('lui/lei', {'third-person', 'singular'}),
           ('noi', {'first-person', 'plural'}),
           ('voi', {'second-person', 'plural'}),
           ('loro', {'third-person', 'plural'})]

# The two auxiliaries' present tense, written out.  They are two verbs and they
# never change, and building the passato prossimo out of the dump would mean
# carrying `essere` and `avere` through every stage for the sake of twelve
# forms that every Italian course prints on its first page.
AUX_PRESENT = {
    'avere': ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'],
    'essere': ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
}

TENSES = [
    ('Presente', {'indicative', 'present'}, {'subjunctive', 'imperative', 'negative'}),
    ('Imperfetto', {'indicative', 'imperfect'}, {'subjunctive', 'negative'}),
    ('Futuro semplice', {'indicative', 'future'}, {'subjunctive', 'negative'}),
    ('Condizionale', {'conditional'}, {'negative'}),
    ('Congiuntivo presente', {'subjunctive', 'present'}, {'imperfect', 'negative'}),
]

# The imperative's persons are not the indicative's: there is no `io`, and the
# polite form is a third-person subjunctive that Wiktionary tags `formal`.
IMPERATIVE = [('(tu)', {'imperative', 'second-person', 'singular'}, {'negative', 'formal'}),
              ('(Lei)', {'imperative', 'formal', 'singular'}, {'negative'}),
              ('(noi)', {'imperative', 'first-person', 'plural'}, {'negative'}),
              ('(voi)', {'imperative', 'second-person', 'plural'}, {'negative', 'formal'})]


def pick_form(rec, want, without=()):
    fs = forms_tagged(rec, want, without)
    return fs[0] if fs else ''


def auxiliary_of(rec):
    """`avere` or `essere`, off the form row Wiktionary writes it in.

    A verb taking BOTH (`correre`, `vivere`) lists two; the first is kept and
    the other is named on the card, because which auxiliary a verb takes is
    exactly the fact the card exists to teach and a verb that takes either is
    worth saying so about.
    """
    aux = [a for a in forms_tagged(rec, {'auxiliary'}) if a in AUX_PRESENT]
    return aux


def participle_of(rec):
    return pick_form(rec, {'participle', 'past'}, {'table-tags'})


def conj_block(head, rows):
    if not any(f for _, f in rows):
        return ''
    out = [f'<div class="uc-cj"><div class="uc-cjh">{esc(head)}</div>']
    for p, f in rows:
        if not f:
            continue
        out.append(f'<div class="uc-cjr"><span class="uc-cj-p">{esc(p)}</span>'
                   f'<span class="uc-cj-f">{esc(f)}</span></div>')
    out.append('</div>')
    return ''.join(out)


def conjugation_html(e, rec):
    """The paradigm panel: the tenses a candidate is examined on, in order."""
    if rec is None:
        return ''
    blocks = []

    inf = clean_form(e['lemma'])
    ger = pick_form(rec, {'gerund'})
    part = participle_of(rec)
    aux = auxiliary_of(rec)
    head = [('infinito', inf)]
    if part:
        head.append(('participio', part))
    if ger:
        head.append(('gerundio', ger))
    if aux:
        head.append(('ausiliare', ' / '.join(aux)))
    blocks.append(conj_block('Forme base', head))

    for name, want, without in TENSES:
        rows = [(p, pick_form(rec, want | tags, without)) for p, tags in PERSONS]
        blocks.append(conj_block(name, rows))

    # PASSATO PROSSIMO, built rather than looked up.  It is the tense Italian
    # actually speaks the past in, and the dump does not carry compound tenses
    # as forms -- it carries the auxiliary and the participle, which is exactly
    # what a learner has to put together.
    if part and aux:
        a = aux[0]
        rows = []
        for i, (p, _tags) in enumerate(PERSONS):
            av = AUX_PRESENT[a][i]
            if a == 'essere':
                plural = i >= 3
                # **THE AGREEMENT GOES ON THE PARTICIPLE, NOT ON THE END OF THE
                # PHRASE.**  A phrasal verb's participle field is the participle
                # and then the rest of the expression (`andato a letto`), and
                # inflecting that whole string puts the ending on the wrong word:
                # `andare a letto` came out `noi siamo andato a letti/e`, which
                # pluralises the bed and leaves the participle singular.  Split,
                # agreed and rejoined it is `siamo andati/e a letto`.
                # Inert on a single word, where the tail is empty.
                head, _, tail = part.partition(' ')
                m = agree(head, 'm', plural)
                f = agree(head, 'f', plural)
                pp = f'{m}/{f[-1]}' if f != m and len(f) > 1 else m
                if tail:
                    pp += ' ' + tail
            else:
                pp = part
            rows.append((p, f'{av} {pp}'))
        blocks.append(conj_block('Passato prossimo', rows))

    rows = [(p, pick_form(rec, want, without)) for p, want, without in IMPERATIVE]
    blocks.append(conj_block('Imperativo', rows))

    blocks = [b for b in blocks if b]
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>' if len(blocks) > 1 else ''


# ---------------------------------------------------------------- adjectives
def adj_forms(rec, word):
    """feminine / masculine plural / feminine plural, from the dictionary where it
    states them and from the regular rule only where the class is unambiguous."""
    f = pick_form(rec, {'feminine'}, {'plural', 'superlative', 'diminutive'})
    mp = pick_form(rec, {'masculine', 'plural'}, {'superlative'})
    fp = pick_form(rec, {'feminine', 'plural'}, {'superlative'})
    # **AN EXPRESSION HAS NO REGULAR AGREEMENT AND THE RULE MUST NOT BE GUESSED
    # AT.**  `adj_forms_regular` is written for a single adjective and inflects
    # the last letters it is given, so on a phrase it invents Italian: `in grado`
    # came out with a feminine `in grada` and a plural `in gradi`, `senza parole`
    # with `senza paroli`, `a due` with `a dui`.  86 cards carried forms that do
    # not exist.  Where Wiktionary STATES a phrase's forms they are still shown --
    # that is `pick_form` above, and it is reading rather than deriving.
    if not (f and mp and fp) and ' ' not in word:
        reg = adj_forms_regular(word)
        if reg:
            f = f or reg['f']
            mp = mp or reg['mp']
            fp = fp or reg['fp']
    return f, mp, fp


# ---------------------------------------------------------------- meanings
def comma_parts(s):
    if '(' in s:
        return [s]
    parts = [x.strip() for x in s.split(',')]
    if len(parts) < 2:
        return [s]
    # A LONG LIST OF SYNONYMS IS CUT RATHER THAN SHOWN WHOLE.  Wiktionary glosses
    # `casa` "family, dynasty, descent, stock, lineage, birth, origin", which as
    # one line is wider than the card and as seven lines is a thesaurus.  The
    # first three carry the sense; the rest are what a dictionary is for.
    if len(parts) > 4:
        parts = parts[:3]
    for p in parts:
        if not p or len(p) > 26 or re.match(r'(or|and|nor|but)\b', p):
            return [s]
    return parts


def meaning_lines(glosses, cap=4):
    out = []
    for g in glosses:
        for semi in (re.split(r';(?![^(]*\))', g) if '(' in g else g.split(';')):
            semi = semi.strip(' ;,')
            if not semi:
                continue
            for part in comma_parts(semi):
                part = part.strip(' ;,')
                if not part or part in out:
                    continue
                if re.fullmatch(r'\([^)]*\)', part) and out:
                    out[-1] += ' ' + part
                    continue
                out.append(part)
    return out[:cap]


def meanings_html(glosses, label):
    lines = meaning_lines(glosses)
    lab = f'<div class="uc-pos">{esc(label)}</div>' if label else ''
    if len(lines) <= 1:
        return lab + f'<div class="uc-gl">{esc(lines[0] if lines else "")}</div>'
    return lab + ('<ul class="uc-gls">' +
                  ''.join(f'<li>{esc(x)}</li>' for x in lines) + '</ul>')


# ---------------------------------------------------------------- headword
GENDER_CLASS = {'m': 'uc-m', 'f': 'uc-f'}
GENDER_NAME = {'m': 'masculine', 'f': 'feminine', 'mf': 'masculine or feminine'}


def art_html(word, gender, plural=False):
    """The article, coloured by the gender it marks.

    Both are shown on a noun that is either (`il/la turista`), which is the
    honest rendering: the word really does take both and a card that picked one
    would be teaching half a fact.
    """
    gs = ['m', 'f'] if gender == 'mf' else [gender]
    seen, out = [], []
    for g in gs:
        a = article(word, g, plural)
        if not a or a in seen:
            continue
        seen.append(a)
        out.append(f'<span class="uc-art {GENDER_CLASS[g]}">{esc(a)}</span>')
    if not out:
        return ''
    joined = '<span class="uc-art">/</span>'.join(out)
    sep = '' if seen[-1].endswith("'") and len(seen) == 1 else ' '
    return joined + sep


def headword_html(e, gender, pos):
    w = e['display']
    if pos == 'noun' and gender:
        return f'<div class="uc-word">{art_html(w, gender)}{esc(w)}</div>'
    return f'<div class="uc-word">{esc(w)}</div>'


def say_text(e, gender, pos):
    """What the speaker button pronounces -- the noun WITH its article, since
    that is how the word is learnt and how it is said.

    A COMMON-GENDER NOUN IS THE EXCEPTION, and `gender == 'mf'` is not by itself
    the test (Aug 2026, on a bug report about the articles not being read out).
    The card draws `il/la complice` for one that takes either, and there is no
    way to say that aloud: a speaker would pronounce the slash, and picking one
    of the two would assert a gender the card is deliberately declining to -- so
    the bare noun is the least wrong thing to say and it stays.  But where the
    article ELIDES, both genders collapse to a single `l'` and the display shows
    ONE article (`l'assistente`, `l'erede`), which is perfectly speakable and was
    being dropped with the rest: 34 nouns across the six levels and the core deck.

    So the test is the DISPLAY rather than the gender -- exactly one article span
    means one article, whatever gender produced it -- which also means the spoken
    form cannot drift from the written one, since it is derived from it.
    """
    if pos != 'noun' or not gender:
        return e['display']
    art = art_html(e['display'], gender)
    if art.count('<span class="uc-art') != 1:
        return e['display']
    # unescaped: `art_html` escapes for the page and `l'` comes back as `l&#x27;`, which a speaker
    # would read out as the entity. `display` is the raw word, so the two halves have to match.
    return _html.unescape(re.sub(r'<[^>]+>', '', art)) + e['display']


# ---------------------------------------------------------------- other forms
def forms_html(e, rec, pos, gender):
    bits = []
    if pos == 'noun' and rec is not None and gender:
        if is_invariable(rec):
            g = 'm' if gender in ('m', 'mf') else 'f'
            bits.append(('plural', with_article(e['display'], g, True) + ' (invariable)'))
        else:
            pl = plural_of(rec)
            if pl:
                g = 'm' if gender in ('m', 'mf') else 'f'
                bits.append(('plural', with_article(pl, g, True)))
        fem = feminine_of(rec)
        if fem and gender == 'm':
            bits.append(('feminine', with_article(fem, 'f')))
        indef = indefinite(e['display'], 'm' if gender in ('m', 'mf') else 'f')
        if indef:
            sep = '' if indef.endswith("'") else ' '
            bits.append(('a, an', indef + sep + e['display']))
    if pos == 'adj' and rec is not None:
        f, mp, fp = adj_forms(rec, e['display'])
        shown = [x for x in (f, mp, fp) if x]
        if shown and len(set(shown + [e['display']])) > 1:
            if f and f != e['display']:
                bits.append(('feminine', f))
            # an `-e` adjective has ONE plural for both genders (`grandi`), and
            # printing it twice with a slash says there are two
            pl = [x for x in dict.fromkeys((mp, fp)) if x]
            if pl:
                bits.append(('plural', ' / '.join(pl)))
        sup = pick_form(rec, {'superlative'})
        if sup:
            bits.append(('superlative', sup))
    if not bits:
        return ''
    return '<div class="uc-forms">' + ''.join(
        f'<span class="uc-fi"><span class="uc-fl">{esc(a)}</span>{esc(b)}</span>'
        for a, b in bits) + '</div>'


def examples_html(exs):
    out = []
    for x in exs:
        it, en, form = x['it'], x['en'], x['form']
        pat = re.compile(r'(?<![^\W\d_])(' + re.escape(form) + r')(?![^\W\d_])',
                         re.I | re.UNICODE)
        shown = pat.sub(lambda m: '<b>' + esc(m.group(1)) + '</b>', esc(it), count=1)
        out.append('<div class="uc-exi">'
                   f'<div class="uc-exz"><span class="uc-tts uc-exsay" data-say="{esc(it)}"></span>{shown}</div>'
                   f'<div class="uc-exe">{esc(en)}</div></div>')
    return ''.join(out)


# ---------------------------------------------------------------- build
cards, stats = [], Counter()
no_meaning, refused = [], []

for e in entries:
    if e['word'].lower() in REFUSED:
        refused.append(e['display'])
        continue
    rec = rec_for(e)
    pos = e['pos']
    gender = gender_of(rec, e['lemma']) if pos == 'noun' else ''

    e['display'] = AUTHORED_DISPLAY.get(e['word'].lower(), e['display'])

    auth = AUTHORED.get(e['word'].lower())
    if auth:
        pos, gl = auth[0], [auth[1]]
        if len(auth) > 2:
            gender = auth[2]     # the record it would be read from is not there
    else:
        gl = glosses_for(rec, head=e['display'])
        # …AND IF THIS ENTRY IS NOTHING BUT A POINTER, THE MEANING IS AT THE
        # OTHER END OF IT.  See `pointer_targets`: the upper bands list feminine
        # adjectives, participles and superlatives as headwords, and Wiktionary
        # glosses each only as "feminine singular of stupendo".  The gender is
        # re-read from the target too, since a feminine noun filed as the "female
        # equivalent of" a masculine one carries none of its own.
        if not gl:
            own = W.get(e['lemma']) or []
            for t in pointer_targets(own):
                trec = pick_record(W.get(t) or [], pos)
                gl = glosses_for(trec, head=e['display'])
                if gl:
                    if pos == 'noun' and not gender:
                        gender = pointer_gender(own) or gender_of(trec, t)
                    if rec is None:
                        rec = trec
                    break

    if not gl:
        no_meaning.append(e['display'])
        continue

    label = POS_NAME.get(pos, pos)
    if pos == 'noun' and gender:
        label = f'{label}, {GENDER_NAME[gender]}'
    if pos == 'verb' and rec is not None:
        aux = auxiliary_of(rec)
        if aux:
            label = f'{label} ({" / ".join(aux)})'

    conj = conjugation_html(e, rec) if pos == 'verb' else ''
    forms = forms_html(e, rec, pos, gender)

    stats['noun'] += pos == 'noun'
    stats['verb'] += pos == 'verb'
    stats['adj'] += pos == 'adj'
    stats['article'] += bool(gender) and pos == 'noun'
    stats['plural'] += pos == 'noun' and 'plural</span>' in forms
    stats['feminine'] += pos == 'noun' and 'feminine</span>' in forms
    stats['adjforms'] += pos == 'adj' and bool(forms)
    stats['paradigm'] += bool(conj)
    stats['aux'] += pos == 'verb' and bool(auxiliary_of(rec))

    cards.append({
        'sub': '',
        'fields': {
            'Italian': headword_html(e, gender, pos),
            'Word': say_text(e, gender, pos),
            'English': meanings_html(gl, label),
            'Forms': forms,
            'Conjugation': conj,
            'Examples': examples_html(EX.get(e['key'], [])),
        },
    })

if no_meaning:
    show = ', '.join(no_meaning[:20]) + (' …' if len(no_meaning) > 20 else '')
    print(f'  no meaning to card, dropped: {len(no_meaning)} -- {show}')
if refused:
    print(f'  refused, each with a reason in REFUSED: {len(refused)} -- '
          + ', '.join(f"{w} ({REFUSED[w.lower()]})" for w in refused))
print(f'  cards {len(cards)} | nouns {stats["noun"]} ({stats["article"]} with an article, '
      f'{stats["plural"]} with a plural, {stats["feminine"]} with a feminine) | '
      f'verbs {stats["verb"]} ({stats["aux"]} with an auxiliary, {stats["paradigm"]} '
      f'with a paradigm) | adjectives {stats["adj"]} ({stats["adjforms"]} with their forms)')

json.dump(cards, open(lvlf('cards.json'), 'w'), ensure_ascii=False)
