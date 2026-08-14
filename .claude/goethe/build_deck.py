#!/usr/bin/env python3
"""Assemble the cards: articles, plurals, feminines, comparatives, conjugations.

ONE NOTE PER WORD, TWO CARDS.  The deck is written in the shape the Mandarin
decks use rather than the one the DELE decks use: a word is a single record
carrying both directions as card TEMPLATES, not two records differing only in
which field is on the front.  It halves the file, it means a corrected gloss is
corrected in both directions at once, and each direction still keeps a schedule
of its own -- recognising `die Entschuldigung` is easy long before producing it
is.  See the reverse-cards bullet in CLAUDE.md.

WHAT IS BUILT FOR EACH PART OF SPEECH, and why each is worth the room:

  · A NOUN CARRIES ITS ARTICLE AND ITS PLURAL, because German gender is not
    derivable and is the single thing a learner most needs attached to the word
    from the first meeting: `das Haus` above `die Häuser`.  The article is
    coloured by gender -- der blue, die red, das green -- which is the oldest
    trick in German teaching and costs nothing here.
  · A NOUN NAMING A PERSON ALSO CARRIES ITS FEMININE, on the Goethe-Institut's
    own instruction: "Weibliche Formen werden in der Regel nicht zusätzlich
    aufgelistet, neben der Lehrer ist beispielsweise auch die Lehrerin Teil des
    geforderten Wortschatzes" -- the feminine is required vocabulary that the
    list does not print.  NOTHING IS DERIVED: -in looks like a rule and is not
    (der Beamte/die Beamtin, der Kollege/die Kollegin, and never *Herrin for
    Herr), so the form is READ from Wiktionary's own `feminine` row or not
    shown at all.
  · A VERB CARRIES ITS PARADIGM: present, Präteritum, Perfekt and the
    imperative, plus the infinitive, the participle and which auxiliary it takes.
    The Perfekt is the point -- it is how a German speaker talks about the past,
    and it needs haben or sein, which is a fact about the verb that has to be
    learnt with it.
  · AN ADJECTIVE CARRIES ITS COMPARATIVE AND SUPERLATIVE, since German umlauts
    them unpredictably: groß/größer/am größten, gut/besser/am besten.

THE Sie-IMPERATIVE IS COMPOSED, AND IT IS THE ONLY COMPOSED FORM HERE.
Wiktionary gives the du and ihr imperatives and not the polite one, which is the
one an A1 candidate will actually use.  It is not guessed: the Sie-imperative is
the third-person plural of the KONJUNKTIV I plus `Sie`, which is a rule of the
language rather than a pattern, and taking it from there rather than from the
present indicative is what makes it right for `sein` as well -- Seien Sie ruhig,
never *Sind Sie ruhig.  Every other form on every card is read.
"""
import json, re
from collections import Counter

from goethe_level import f as lvlf

entries = json.load(open(lvlf('entries.json')))
W = json.load(open(lvlf('wikt.json')))
EX = json.load(open(lvlf('examples.json')))

# the same subtitle counts `select` orders the deck by; here they answer a
# different question -- see `feminine_of`
FREQ = {}
for _ln in open('de_50k.txt', encoding='utf-8'):
    _p = _ln.split()
    if len(_p) == 2:
        FREQ.setdefault(_p[0], int(_p[1]))

esc = lambda s: (str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))

# ---------------------------------------------------------------- senses
BAD_TAGS = {'obsolete', 'archaic', 'dated', 'vulgar', 'slang', 'offensive',
            'derogatory', 'ethnic-slur', 'rare', 'dialectal', 'regional',
            'Switzerland', 'Austria', 'Luxembourg', 'humorous', 'poetic'}


def real_senses(r):
    return [s for s in r.get('senses', [])
            if s.get('glosses') and not (s.get('form_of') or s.get('alt_of'))]


def sense_rank(s):
    """WIKTIONARY'S OWN ORDER IS THE SIGNAL, and sorting by anything else loses
    it.  The DELE stage ranks a sense by how SHORT its gloss is, which is a fair
    proxy in Spanish and is wrong here often enough to matter: `das Haus` came
    out glossed "theatre" (the shortest of its three senses), `gehen` as "to
    leave" before "to go", `groß` as "tall" before "big".  A commoner sense is
    not a shorter one.  So the only reordering is to push a sense Wiktionary has
    labelled obsolete, dialectal or vulgar behind the plain ones; Python's sort
    is stable, so everything else keeps the order the entry was written in.

    THE ONE OTHER DEMOTION IS A GLOSS THAT DESCRIBES A GRAMMATICAL FUNCTION
    RATHER THAN TRANSLATING, which is the fault the AUTHORED table already
    records for `sein` -- "forms the present perfect …", no use to anybody at A1
    -- met on a verb nothing caught, because `haben` HAS an entry and so nothing
    forced a gloss to be written by hand: its card opened `forms the perfect
    aspect` and gave `to have` second.  THE TAG `auxiliary` IS THE WRONG TEST
    AND WAS TRIED: on the modals the auxiliary sense IS the meaning, so demoting
    it gave `müssen` Wiktionary's mangled intransitive reading ("to have to do
    something implied") ahead of "must".  What separates them is the GLOSS: one
    says what the word means, the other what it does to a sentence.  Measured
    over the whole deck, the rule moves exactly one card -- every other such
    gloss is already buried by Wiktionary's own order -- which is the reassuring
    outcome rather than a disappointing one.  Demoted and not dropped: that a
    verb builds the Perfekt is worth knowing, at the foot of the list."""
    if set(s.get('tags') or []) & BAD_TAGS:
        return 2
    g = (s.get('glosses') or [''])[0].strip()
    # `forms` needs its s: `das Formular` glosses "form (document to be filled)".
    # `used` needs none: swept over the deck, all 21 glosses opening on it are
    # usage notes ("Used for emphasis", "Used to indicate a preference") and not
    # one is a meaning a card should lead with.
    return 1 if re.match(r'(forms|used|indicates?|expresses?)\b', g, re.I) else 0


def tidy(g):
    """Trim a Wiktionary gloss down to the part a card should show."""
    g = re.sub(r'\s+', ' ', g).strip()
    # a leading usage label -- "[with dative] in, inside" -- and the bracketed
    # grammar notes German entries are full of
    g = re.sub(r'^\[[^\]]*\]\s*', '', g)
    g = re.sub(r'\s*\[[^\]]*\]', '', g)
    # "(indicates directionality)" after the translation is a note on it; the
    # translation itself is what the card is for
    g = re.sub(r'\s*\((?:[^()]|\([^()]*\))*\)\s*$', '', g).strip()
    g = re.sub(r'\s+', ' ', g).strip(' ;:,.')
    return g


def sense_gloss(s_, article):
    """What a single Wiktionary sense contributes to the card, or ''.

    A SENSE THAT POINTS AT ANOTHER WORD STILL OFTEN CARRIES THE MEANING, after a
    colon: `die Karte` files map, menu and ticket as ellipses of Landkarte,
    Speisekarte and Eintrittskarte, and `der Lehrer` has nothing BUT "agent noun
    of lehren: one who teaches, teacher".  Dropping those left `die Karte`
    glossed "card; coordinate chart" -- the mathematical sense -- with every
    meaning an A1 candidate needs thrown away, and left fourteen words with no
    meaning at all.  So the tail is taken where there is one, and a sense that
    is nothing but a pointer ("inflection of Erwachsener:") is skipped.

    AND THE WORD `female` COMES OFF WITH IT.  Five of the nominalised adjectives
    -- Erwachsene, Bekannte, Beamte, Jugendliche, Verwandte -- are filed under
    the feminine, so the tail reads "female adult" on a card the Goethe list
    prints as `der Erwachsene`.  The qualifier goes unless the card's own
    article is `die`.
    """
    g = (s_.get('glosses') or [''])[-1]
    if not g:
        return ''
    if s_.get('form_of') or s_.get('alt_of'):
        parts = re.split(r'[:;]', g, 1)
        if len(parts) < 2 or not parts[1].strip():
            return ''
        g = parts[1]
        if article != 'die':
            g = FEMALE_RX.sub('', g)
    g = tidy(g)
    return '' if g.endswith(':') else g


def glosses_for(rec, article='', limit=2):
    if rec is None:
        return []
    out = []
    for s_ in sorted(rec.get('senses', []), key=sense_rank):
        g = sense_gloss(s_, article)
        if g and g not in out:
            out.append(g)
        if len(out) >= limit:
            break
    return out


FEMALE_RX = re.compile(r'\bfemale\s+', re.I)


# THE RECORD ORDER IS WIKTIONARY'S AND IS SOMETIMES THE WRONG READING FOR AN A1
# CANDIDATE.  Which reading the Goethe list means is settled by the list's own
# example sentence, which is what those sentences are for: `Er kommt AUS
# Brasilien` is the preposition, not the adjective "over, finished"; `Nicht so
# LAUT!` is the adjective, not the preposition "according to".  Each row below
# was read off the PDF's own example rather than guessed, and the whole
# multi-part-of-speech set (83 entries) was gone through, not just the ones that
# looked wrong.  The nastiest are the two that read as perfectly good cards:
# `sieben` came out as the verb "to sift" rather than the number seven, and
# `zu`, `in`, `an`, `auf`, `über`, `um` -- six of the commonest prepositions in
# the language -- all came out as adjectives.
FORCE_POS = {
    'ab': 'prep', 'an': 'prep', 'auf': 'prep', 'aus': 'prep', 'durch': 'prep',
    'in': 'prep', 'mit': 'prep', 'nach': 'prep', 'ohne': 'prep', 'über': 'prep',
    'um': 'prep', 'zu': 'prep',
    'was': 'pron', 'man': 'pron', 'ihr/ihm/ihn': 'pron',
    'der, die, das': 'article', 'ein-': 'article',
    'jed-': 'det', 'welch-': 'det',
    'eins': 'num', 'sieben': 'num', 'acht': 'num',
    'zusammen': 'adv', 'gerade': 'adv', 'bar': 'adv', 'besser': 'adj',
    'wollen': 'verb', 'gefallen': 'verb',
}

# and the closed classes the Wortgruppenliste prints, where the group settles it
GROUP_POS = {'numbers': ('num', 'adj', 'det'), 'colours': ('adj',),
             'countries': ('name', 'adj', 'noun')}

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'prep': 'preposition', 'conj': 'conjunction', 'pron': 'pronoun',
            'det': 'determiner', 'article': 'article', 'num': 'number',
            'intj': 'interjection', 'particle': 'particle', 'name': 'name',
            'postp': 'postposition', 'phrase': 'phrase'}

# WHAT WIKTIONARY CANNOT SAY, written here.  Six of the eight are the same
# problem: the Goethe list teaches `an sein`, `auf sein`, `aus sein`, `zu sein`
# and `weg sein` as everyday phrases, and Wiktionary has no entry for any of
# them, so each would have taken the gloss of `sein` itself -- which opens
# "forms the present perfect and past perfect tenses of certain verbs", the
# auxiliary reading, and is no use to anybody at A1.
AUTHORED = {
    'sein': ['to be'],
    'an sein': ['to be on (a light, a machine)'],
    'auf sein': ['to be open', 'to be up, out of bed'],
    'aus sein': ['to be off, switched off', 'to be over, finished'],
    'zu sein': ['to be shut, closed'],
    'weg sein': ['to be gone, away'],
    'was für ein': ['what kind of', 'what a'],
    'der, die, das': ['the'],
    'dort, -her, -hin': ['there', 'dorther: from there', 'dorthin: to there'],
    'Feier-': ['celebration-, holiday- (der Feiertag, der Feierabend)'],
    'Lieblings-': ['favourite- (das Lieblingsessen, der Lieblingsfilm)'],
    'Grad (Celsius)': ['degree (Celsius)'],
    'Achtung': ['attention, look out', 'respect, esteem'],
    # four whose cross-reference leads to a word that means something else: the
    # A1 sense of `möchten` is not `mögen`, and `geboren` is not `gebären`.
    # Each is read off the Goethe list's own example sentence -- Was möchten Sie
    # trinken?, Ich bin in Zagreb geboren, ich dusche lieber, Dieser
    # Lastkraftwagen ist sehr groß.
    'möchten': ['would like (to)'],
    'geboren': ['born'],
    'lieber': ['rather, preferably'],
    'der Lkw': ['lorry, truck'],
    # and one where the list and the dictionary mean different senses of the same
    # word, settled the same way.  Wiktionary opens `werden` on the future
    # auxiliary -- "will", "to be going to" -- and the Goethe list's own example
    # is `Mein Sohn will Arzt werden`, which is the lexical verb.  No rule about
    # glosses separates those (see `sense_rank`: the `auxiliary` TAG is the wrong
    # test, and neither "will" nor "to be going to" describes a function), so it
    # is written down.  The future use is kept, at the end, where a learner who
    # meets `ich werde kommen` will still find it.
    'werden': ['to become', 'to get, turn', 'will (forms the future tense)'],

    # --- A2 ---
    # A2 TEACHES A CLASS OF PHRASE A1 HAS ALMOST NONE OF: an adjective or an
    # adverb with `sein`, which is what a B-level candidate is expected to
    # produce and which no dictionary carries as a headword.  Mapping them to
    # `sein` -- the obvious move, and what A1 does with `an sein` -- gives every
    # one of them the gloss "to be", so each is written out.  The meaning is read
    # off the Goethe list's own example sentence in each case.
    'fertig sein': ['to be ready', 'to be finished, done'],
    'fit sein': ['to be fit, in good shape'],
    'gültig sein': ['to be valid'],
    'erlaubt sein': ['to be allowed, permitted'],
    'unterwegs sein': ['to be out, on the way'],
    'verabredet sein': ['to have arranged to meet someone'],
    'einverstanden sein': ['to agree, be in agreement'],
    'dabei (sein)': ['to be there, be present', 'to be taking part'],
    'dafür/dagegen sein': ['to be in favour of it / against it'],
    'an sein / aus sein': ['to be on / to be off (a light, a machine)'],
    'recht haben': ['to be right'],
    'auf jeden/keinen Fall': ['in any case, definitely', 'on no account'],
    # a word that is a particle, a multiplier and a noun, and the list prints all
    # three in one row; Wiktionary's `Mal` covers only the last
    'mal / das Mal': ['times (in multiplication)', 'once, sometime',
                      'das Mal: time, occasion'],
    # THE ABBREVIATIONS ARE THE ONE GROUP WHOSE CARDS TEACH WHAT A STRING STANDS
    # FOR rather than what a word means, so the expansion is given with the
    # gloss.  A2's Abkürzungen group; A1 has none of these but `ca.`, which it
    # prints as `circa/ca.` and which is therefore a different key.
    'z.B.': ['e.g., for example (zum Beispiel)'],
    'd.h.': ['i.e., that is (das heißt)'],
    'usw.': ['etc., and so on (und so weiter)'],
    'ca.': ['approx., about (circa)'],
    'ICE': ['InterCity Express, the German high-speed train'],
    'Lkw': ['lorry, truck'],
    # three compounds the dump does not carry.  A2's Vorwort says derivable
    # compounds are left off the list unless the compound means something new,
    # so the ones it does print are exactly the ones a dictionary is likeliest
    # to be missing.
    'Antwortbogen': ['answer sheet'],
    'Klassenfahrt': ['school trip'],
    'der Prüfer, die Prüferin': ['examiner'],
    'die Fundsachen': ['lost property'],
    # THE LAST TWO ARE THE CROSS-REFERENCE PROBLEM WITH NO TAIL TO RECOVER, and
    # they are written down rather than given a rule because a rule cannot reach
    # them.  `sense_gloss` already follows a pointer that carries its own gloss
    # after a colon -- "female equivalent of Bekannter: female acquaintance" --
    # and fifteen A2 words take that path.  These two point at a bare word:
    # `Partnerin` at `Partner` and `geehrt` at `ehren`, neither of which is in
    # the dump this build fetched, since nothing on either list asked for them.
    # So the fallback would have nothing to follow the pointer TO.
    'die Partnerin': ['partner (female)'],
    # …and `geehrt-` would be the wrong gloss even if `ehren` were there: the
    # list prints the stem for the letter-opening `Sehr geehrte Damen und
    # Herren`, which is what an A2 candidate has to write, and "past participle
    # of ehren" does not say so.
    'geehrt-': ['dear (in a formal letter: Sehr geehrte Damen und Herren)'],
}


def pick_pos(e):
    recs = [r for r in W.get(e['lemma'], []) if real_senses(r)] or W.get(e['lemma'], [])
    if not recs:
        return None, e['pos_hint'], []
    want = FORCE_POS.get(e['key']) or FORCE_POS.get(e['word'])
    order = ([want] if want else []) + list(GROUP_POS.get(e['group'], ())) + [e['pos_hint']]
    for p in order:
        same = [r for r in recs if r.get('pos') == p]
        if same:
            same = by_article(same, e.get('article', ''))
            return same[0], p, same
    p = recs[0].get('pos', e['pos_hint'])
    return recs[0], p, by_article([r for r in recs if r.get('pos') == p],
                                  e.get('article', ''))


def by_article(same, article):
    """Where two records differ in GENDER, the list's own article picks between.

    `merged_glosses` below merges every record of the chosen part of speech, and
    that is deliberate: a German homograph is two Wiktionary entries and the
    Goethe list means both of them.  It is right for `die Bank`, which is the
    bench and the bank under one gender, and WRONG the moment the two records are
    two different words -- `der See` is the lake and `die See` is the sea, the
    list prints them as two entries, and merged they came out as one card printed
    twice, both labelled masculine and both glossed "lake, sea, ocean".  It cost
    A1 the same way, quietly: `der Moment` carried "momentum", which is `das
    Moment`, and `der Reis` carried "twig", which is `das Reis`.

    A RECORD TAGGED WITH TWO GENDERS ANSWERS TO BOTH, and testing only its first
    tag is what made `das Viertel` worse rather than better: its three records
    are `mn`, `n` and `n`, and reading the first as masculine narrowed the card
    to the two glossing a quarter-litre measure and a city district, throwing
    away the "quarter, fourth" every reader wants.  So the test is MEMBERSHIP,
    and a two-gender record is kept whichever of its genders the list printed --
    which also means such a record never counts as a disagreement.

    AND THE NARROWED SET MUST STILL CARRY A MEANING, which is the guard that
    keeps this off the nominalised adjectives.  `der Erwachsene` has a masculine
    record and a feminine one, and it is the FEMININE that Wiktionary glosses --
    "female equivalent of Erwachsener: female adult", from which `sense_gloss`
    already recovers "adult" whenever the card's own article is not `die`.
    Narrowing on gender alone therefore threw the meaning away and left five A1
    cards and three A2 cards with no gloss at all.  So the narrowing is offered
    and taken only where it costs nothing.
    """
    want = ARTICLE_G.get(article.split('/')[0].strip())
    if not want or len(same) < 2:
        return same
    hit = [r for r in same if want in gender_of(r)]
    if len(hit) == len(same) or not hit:
        return same
    if not any(glosses_for(r, article, limit=1) for r in hit):
        return same
    return hit


def merged_glosses(same, article=''):
    """The senses of every record that shares the chosen part of speech.

    A GERMAN HOMOGRAPH IS TWO ENTRIES, NOT TWO SENSES OF ONE: `die Bank` is the
    bench and the bank, `der Ball` the ball and the dance, and Wiktionary files
    each under its own etymology -- so reading the first record alone teaches
    half the word.  The Goethe list means both: it prints two example sentences
    for Bank, one about four o'clock closing and one about sitting in the park.
    """
    out = glosses_for(same[0], article, limit=3) if same else []
    for r in same[1:]:
        for g in glosses_for(r, article, limit=1):
            if g not in out:
                out.append(g)
    return out[:3]


# ---------------------------------------------------------------- nouns
GENDER_TAG = {'masculine': 'm', 'feminine': 'f', 'neuter': 'n'}


def gender_of(rec):
    """m / f / n, from the sense tags Wiktionary carries the gender on."""
    seen = []
    for s in rec.get('senses', []):
        for t in (s.get('tags') or []):
            if t in GENDER_TAG and GENDER_TAG[t] not in seen:
                seen.append(GENDER_TAG[t])
    return ''.join(seen[:2]) if seen else ''


ARTICLE = {'m': 'der', 'f': 'die', 'n': 'das'}


def forms_tagged(rec, want, without=()):
    out = []
    for f in rec.get('forms', []):
        tg = set(f.get('tags') or [])
        s = (f.get('form') or '').strip()
        if not s or s in ('-', '—') or f.get('source') == 'declension':
            continue
        if want <= tg and not (tg & set(without)):
            if s not in out:
                out.append(s)
    return out


def plural_of(rec):
    pl = forms_tagged(rec, {'plural'}, without={'feminine', 'diminutive'})
    return pl[0] if pl else ''


# A FEMININE IS READ AND THEN CHECKED, because Wiktionary lists a feminine
# wherever German CAN make one and not only where it uses one.  Read straight,
# `der Mann` came out with `die Männin` beside it -- which is in the Luther
# Bible and nowhere a learner will meet it -- and `der Fisch` with `die
# Fischin`.  Nothing in the tags separates those from `die Lehrerin`: all five
# are a bare ['feminine'], and the entry for Männin carries an ordinary gloss
# (its only marks are a `Bible` CATEGORY on one sense and `rare` on the other).
#
# What does separate them is currency, measured on the frequency list the
# ordering already uses: A FEMININE OF A COMMON MASCULINE THAT APPEARS NOT ONCE
# IN 50,000 WORDS IS NOT A WORD IN USE.  Mann 222,707/Männin 0, Fisch 6,038/
# Fischin 0, Gast 5,053/Gästin 0 all fall; every real one survives, Doktorin at
# 64 hits included.  The threshold only bites where the masculine is itself well
# attested, so `die Absenderin` and `die Empfängerin` -- ordinary words whose
# masculines are too rare for the list to say anything about either -- are kept.
# TWO MORE GO FOR REASONS THAT ARE NOT ABOUT FREQUENCY AT ALL: a feminine equal
# to the headword is not a feminine (Wiktionary gives `Mensch` its own name,
# meaning the neuter `das Mensch`, which is a different and insulting word), and
# a STEM entry has no feminine (`Lieblings-` yielded `die Lieblingin`).
FEM_MASC_COMMON = 2000


def feminine_of(rec, head, freq):
    fe = forms_tagged(rec, {'feminine'}, without={'plural', 'diminutive'})
    if not fe:
        return ''
    fem = fe[0]
    if fem == head or head.endswith('-'):
        return ''
    if not freq.get(fem.lower(), 0) and freq.get(head.lower(), 0) >= FEM_MASC_COMMON:
        return ''
    return fem


# ---------------------------------------------------------------- conjugation
PERSONS = [('ich', {'first-person', 'singular'}, 'mich'),
           ('du', {'second-person', 'singular'}, 'dich'),
           ('er/sie/es', {'third-person', 'singular'}, 'sich'),
           ('wir', {'first-person', 'plural'}, 'uns'),
           ('ihr', {'second-person', 'plural'}, 'euch'),
           ('sie/Sie', {'third-person', 'plural'}, 'sich')]

TENSES = [('Präsens', {'indicative', 'present'}, {'subjunctive'}),
          ('Präteritum', {'indicative', 'preterite'}, {'subjunctive'}),
          ('Perfekt', {'indicative', 'perfect'}, {'subjunctive'})]


def pick_form(rec, tags, without=()):
    for f in rec.get('forms', []):
        tg = set(f.get('tags') or [])
        s = (f.get('form') or '').strip()
        if not s or s in ('-', '—'):
            continue
        if tags <= tg and not (tg & set(without)):
            return s
    return ''


def with_pronoun(form, pron):
    """Put a reflexive pronoun where German puts it: after the finite verb.

    `freue` -> `freue mich`, and `habe gefreut` -> `habe mich gefreut`, since in
    a compound tense the pronoun follows the AUXILIARY and not the participle.
    """
    parts = form.split(' ')
    return ' '.join([parts[0], pron] + parts[1:])


def conjugation_html(rec, reflexive):
    if rec is None or not any(f.get('source') == 'conjugation' for f in rec.get('forms', [])):
        return ''
    inf = pick_form(rec, {'infinitive'}, without={'infinitive-zu'})
    part = pick_form(rec, {'participle', 'past'})
    aux = [f['form'] for f in rec.get('forms', [])
           if 'auxiliary' in (f.get('tags') or []) and f.get('form') in ('haben', 'sein')]
    aux = sorted(set(aux), key=lambda x: x != 'haben')

    head = []
    if inf:
        head.append(('infinitive', ('sich ' + inf) if reflexive else inf))
    if part:
        head.append(('past participle', part))
    if aux:
        head.append(('auxiliary', ' or '.join(aux)))

    blocks = []
    for name, tags, without in TENSES:
        rows = []
        for label, ptags, pron in PERSONS:
            f = pick_form(rec, tags | ptags, without)
            if not f:
                continue
            rows.append((label, with_pronoun(f, pron) if reflexive else f))
        if rows:
            blocks.append((name, rows))

    # the imperative: du and ihr are Wiktionary's, the polite one is the
    # Konjunktiv I third plural plus Sie (see the module docstring)
    imp = []
    du = pick_form(rec, {'imperative', 'second-person', 'singular'})
    ihr = pick_form(rec, {'imperative', 'second-person', 'plural'})
    sie = pick_form(rec, {'subjunctive-i', 'third-person', 'plural'})
    if du:
        imp.append(('du', with_pronoun(du, 'dich') if reflexive else du))
    if ihr:
        imp.append(('ihr', with_pronoun(ihr, 'euch') if reflexive else ihr))
    if sie:
        # a separable verb's form is written `fahren ab`, and Sie goes between
        parts = sie.split(' ')
        polite = ' '.join([parts[0], 'Sie'] + (['sich'] if reflexive else []) + parts[1:])
        imp.append(('Sie', polite))
    if imp:
        blocks.append(('Imperativ', imp))

    if not blocks:
        return ''
    out = []
    if head:
        out.append('<div class="uc-cj-nf">' + ''.join(
            f'<span class="uc-cj-nfi"><i>{esc(a)}</i><b>{esc(b)}</b></span>'
            for a, b in head) + '</div>')
    out.append('<div class="uc-cj-grid">')
    for name, rows in blocks:
        out.append('<div class="uc-cj-b"><div class="uc-cj-h">' + esc(name) + '</div>' +
                   ''.join(f'<div class="uc-cj-r"><span class="uc-cj-p">{esc(p)}</span>'
                           f'<span class="uc-cj-f">{esc(f)}</span></div>' for p, f in rows) +
                   '</div>')
    out.append('</div>')
    return ''.join(out)


# --------------------------------------------------- declension (nouns, adjs)
# EVERY WORD CLASS THAT INFLECTS GETS ITS WHOLE PARADIGM, in the same collapsed
# panel the verbs already use.  A verb had its four tenses from the start and a
# noun had only its plural, which is the one form a German noun has that a
# learner cannot work out -- but it is not the only one they need, and the case
# endings are exactly what an A2 candidate is being examined on.
#
# WIKTIONARY'S DECLENSION TABLE IS A SEPARATE SOURCE FROM ITS HEADWORD FORMS,
# and `forms_tagged` above skips it (`source == 'declension'`) deliberately: the
# headline `['plural']` form is the one a plural line should print, and reading
# the table instead would offer `die Häuser` four times over.  So the table is
# read by its own function rather than by loosening that filter, which would
# quietly change every plural, feminine and comparative on every card.
CASES = [('Nominativ', 'nominative'), ('Akkusativ', 'accusative'),
         ('Dativ', 'dative'), ('Genitiv', 'genitive')]

# The definite article, declined.  COMPOSED, and it is the second composed thing
# on a card after the Sie-imperative, on the same ground: this is a closed rule
# of the language rather than a pattern read off a word, and a bare `Hauses` in
# a genitive row teaches half of what `des Hauses` teaches.
DEF_ART = {('m', 'nominative'): 'der', ('m', 'accusative'): 'den',
           ('m', 'dative'): 'dem', ('m', 'genitive'): 'des',
           ('f', 'nominative'): 'die', ('f', 'accusative'): 'die',
           ('f', 'dative'): 'der', ('f', 'genitive'): 'der',
           ('n', 'nominative'): 'das', ('n', 'accusative'): 'das',
           ('n', 'dative'): 'dem', ('n', 'genitive'): 'des',
           ('p', 'nominative'): 'die', ('p', 'accusative'): 'die',
           ('p', 'dative'): 'den', ('p', 'genitive'): 'der'}


def decl_forms(rec, want, without=()):
    """Every form in the DECLENSION table carrying these tags, in order."""
    out = []
    for f in rec.get('forms', []):
        tg = set(f.get('tags') or [])
        s = (f.get('form') or '').strip()
        if not s or s in ('-', '—') or f.get('source') != 'declension':
            continue
        if want <= tg and not (tg & set(without)):
            if s not in out:
                out.append(s)
    return out


def table_html(head, rows):
    """A small grid: a row label, then one cell per column.

    THE COLUMN COUNT IS A CLASS AND NOT AN INLINE STYLE, which is not a matter of
    taste: Folio's sanitizer keeps only `color` out of a `style` attribute on
    anything a deck supplies, so a `--uc-dtc:4` written there is dropped on
    ingest and the grid falls back to its default of two.  The adjective's
    five-cell rows then wrapped onto two lines apiece and the table read as a
    column of loose words -- while every assertion still passed, because they
    read the DOM and the fault was in the layout.  Found by looking at the card.
    """
    n = len(head)
    out = [f'<div class="uc-dt uc-dt{n}">',
           '<div class="uc-dtr uc-dth"><span class="uc-dtl"></span>' +
           ''.join(f'<span class="uc-dtc">{esc(h)}</span>' for h in head) + '</div>']
    for label, cells in rows:
        out.append('<div class="uc-dtr"><span class="uc-dtl">' + esc(label) + '</span>' +
                   ''.join(f'<span class="uc-dtc">{esc(c) if c else "—"}</span>'
                           for c in cells) + '</div>')
    out.append('</div>')
    return ''.join(out)


def noun_decl_html(rec, gender, pluralonly):
    """der Mann / des Mannes / dem Mann / den Mann, and the plural beside it.

    The gender may be TWO letters (`der/das Blog`), and there the article of the
    first is used rather than both printed in every cell -- the label above the
    card already says the word takes either.
    """
    if rec is None:
        return ''
    g = (gender or 'm')[:1]
    cols, rows = [], []
    sing = not pluralonly and any(decl_forms(rec, {c, 'singular'}) for _, c in CASES)
    plur = any(decl_forms(rec, {c, 'plural'}) for _, c in CASES)
    if not plur and not sing:
        return ''
    if sing:
        cols.append('Singular')
    if plur:
        cols.append('Plural')
    for name, case in CASES:
        cells = []
        if sing:
            f = decl_forms(rec, {case, 'singular'})
            cells.append((DEF_ART.get((g, case), '') + ' ' + '/'.join(f[:2])).strip()
                         if f else '')
        if plur:
            f = decl_forms(rec, {case, 'plural'})
            cells.append((DEF_ART.get(('p', case), '') + ' ' + '/'.join(f[:2])).strip()
                         if f else '')
        rows.append((name, cells))
    if not any(any(c for c in cs) for _, cs in rows):
        return ''
    return table_html(cols, rows)


def decl_panel(blocks):
    """Wrap titled tables in the same grid the conjugation panel already uses."""
    blocks = [(t, b) for t, b in blocks if b]
    if not blocks:
        return ''
    # a four-column paradigm takes the panel's whole width; a two-column one is
    # happy beside its neighbour
    wide = ' uc-dtw' if any('uc-dt4' in b for _, b in blocks) else ''
    return ('<div class="uc-cj-grid uc-dtg">' + ''.join(
        '<div class="uc-cj-b' + wide + '"><div class="uc-cj-h">' + esc(t) + '</div>' + b +
        '</div>' for t, b in blocks) + '</div>')


# The three ways a German adjective declines, by the article in front of it.
# Wiktionary tags them `strong`/`weak`/`mixed`, and the weak and mixed forms
# come with their article attached (`der gute`, `ein guter`), which is what makes
# the table teach the thing it is for.
ADJ_DECL = [('after der / die / das', {'weak'}),
            ('after ein / kein / mein', {'mixed'}),
            ('with no article', {'strong'})]
ADJ_COLS = [('Maskulinum', 'masculine'), ('Femininum', 'feminine'),
            ('Neutrum', 'neuter'), ('Plural', 'plural')]


def adj_decl_html(rec):
    """The full 4x4 for each of the three paradigms, positive degree only.

    THE COMPARATIVE AND SUPERLATIVE DECLINE TOO, and they are deliberately left
    out: Wiktionary carries all three degrees in the same table, so taking them
    all would print 144 cells where the German a learner is taught is 48.  The
    comparative and superlative are on the card already, in the forms line above.
    """
    if rec is None:
        return ''
    out = []
    for title, tags in ADJ_DECL:
        rows = []
        for name, case in CASES:
            cells = []
            for _, gcol in ADJ_COLS:
                want = tags | {case, gcol}
                if gcol != 'plural':
                    want = want | {'singular'}
                f = decl_forms(rec, want,
                               without={'comparative', 'superlative', 'negative'})
                cells.append(f[0] if f else '')
            rows.append((name, cells))
        if any(any(c for c in cs) for _, cs in rows):
            out.append((title, table_html([n for n, _ in ADJ_COLS], rows)))
    if not out:
        return ''
    pred = decl_forms(rec, {'predicative'})
    head = ('<div class="uc-cj-nf"><span class="uc-cj-nfi"><i>predicative</i>'
            f'<b>{esc(pred[0])}</b></span></div>') if pred else ''
    return head + decl_panel(out)


# ---------------------------------------------------------------- meanings
def comma_parts(s):
    if '(' in s:              # a comma inside a bracket is not a list comma
        return [s]
    parts = [x.strip() for x in s.split(',')]
    if len(parts) < 2 or len(parts) > 4:
        return [s]
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


def meanings_html(glosses):
    lines = meaning_lines(glosses)
    if len(lines) <= 1:
        return f'<div class="uc-gl">{esc(lines[0] if lines else "")}</div>'
    return ('<ul class="uc-gls">' +
            ''.join(f'<li>{esc(x)}</li>' for x in lines) + '</ul>')


# ---------------------------------------------------------------- other forms
def forms_html(e, rec, pos):
    bits = []
    if pos == 'noun' and rec is not None:
        if e['pluralonly']:
            bits.append(('plural only', ''))
        else:
            pl = plural_of(rec)
            if pl:
                bits.append(('plural', 'die ' + pl))
            fem = feminine_of(rec, e['lemma'], FREQ)
            if fem and not e.get('pair'):
                frec = next((r for r in W.get(fem, []) if r.get('pos') == 'noun'), None)
                fpl = plural_of(frec) if frec is not None else ''
                bits.append(('feminine', 'die ' + fem + (', die ' + fpl if fpl else '')))
            elif e.get('pair'):
                prec = next((r for r in W.get(e['pair_lemma'], []) if r.get('pos') == 'noun'), None)
                ppl = plural_of(prec) if prec is not None else ''
                if ppl:
                    bits[-1] = ('plural', bits[-1][1] + ', die ' + ppl) if bits else ('plural', 'die ' + ppl)
    if pos == 'adj' and rec is not None:
        comp = pick_form(rec, {'comparative'})
        sup = pick_form(rec, {'superlative'})
        if comp:
            bits.append(('comparative', comp))
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
        de, en, form = x['de'], x['en'], x['form']
        pat = re.compile(r'(?<![^\W\d_])(' + re.escape(form) + r')(?![^\W\d_])',
                         re.I | re.UNICODE)
        shown = pat.sub(lambda m: '<b>' + esc(m.group(1)) + '</b>', esc(de), count=1)
        out.append('<div class="uc-exi">'
                   f'<div class="uc-exz"><span class="uc-tts uc-exsay" data-say="{esc(de)}"></span>{shown}</div>'
                   f'<div class="uc-exe">{esc(en)}</div></div>')
    return ''.join(out)


# ---------------------------------------------------------------- build
GENDER_CLASS = {'m': 'uc-m', 'f': 'uc-f', 'n': 'uc-n'}


def headword_html(e, gender):
    """The word as it is printed on the card, with the article coloured."""
    parts = []
    for half in e['display'].split(', '):
        m = re.match(r'^((?:der|die|das)(?:/(?:der|die|das))?)\s+(.*)$', half)
        if m:
            g = gender if half == e['display'].split(', ')[0] else ''
            # a two-article headword has no ONE gender to colour, so it takes the
            # ink the rest of the word is set in rather than one of the three
            cls = GENDER_CLASS.get(ARTICLE_G.get(m.group(1), g), '')
            parts.append(f'<span class="{("uc-art " + cls).strip()}">'
                         f'{esc(m.group(1))}</span> {esc(m.group(2))}')
        else:
            parts.append(esc(half))
    return ', '.join(parts)


ARTICLE_G = {'der': 'm', 'die': 'f', 'das': 'n'}
GENDER_NAME = {'m': 'masculine', 'f': 'feminine', 'n': 'neuter'}


def gender_from_article(art):
    """`der` -> `m`, and `der/das` -> `mn`, which the label spells out in full.

    A2 prints a slash between two articles for a noun that may be either gender
    (`der/das Blog`) and for a nominalised adjective that takes the gender of the
    person (`der/die Bekannte`), and both are one word rather than a pair -- see
    `ART` in parse_goethe.py, which is what tells those from `der Schüler / die
    Schülerin`.
    """
    out = []
    for a in art.split('/'):
        g = ARTICLE_G.get(a.strip())
        if g and g not in out:
            out.append(g)
    return ''.join(out)


cards, stats = [], Counter()
for i, e in enumerate(entries, 1):
    rec, pos, same_pos = pick_pos(e)
    gender = gender_of(rec) if (rec is not None and pos == 'noun') else ''

    # the article the deck prints is the list's own where it prints one, and
    # Wiktionary's where it does not (`Satz`, `Achtung`)
    art = e['article'] or (ARTICLE.get(gender, '') if pos == 'noun' and
                           e['word'][:1].isupper() and not e['pluralonly'] else '')
    if art and not e['article'] and not e.get('pair'):
        e['display'] = art + ' ' + e['display']
        e['speak'] = e['display']
        stats['article added'] += 1
    # THE LABEL FOLLOWS THE ARTICLE THE CARD PRINTS, and the two contradicting
    # each other is the worst thing this deck can do -- the article's colour IS
    # the gender lesson, so `der Erwachsene` under "noun, feminine" teaches the
    # opposite of what it shows.  Wiktionary's tags are the fallback and not the
    # authority: it files the nominalised adjectives under the feminine, and it
    # marks a two-gender noun with both tags, which reached the card as the raw
    # code `noun, mn`.  Sixteen A1 cards shipped with one of those two faults.
    if art:
        gender = gender_from_article(art) or gender

    if e['key'] in AUTHORED:
        glosses = AUTHORED[e['key']]
    elif e['word'] in AUTHORED:
        glosses = AUTHORED[e['word']]
    else:
        glosses = merged_glosses(same_pos, e['article'])
    if not glosses:
        stats['no gloss'] += 1

    label = POS_NAME.get(pos, pos)
    # a plural-only noun's `die` is the plural article and says nothing about
    # gender, so `die Eltern` is "noun, plural" rather than "noun, feminine"
    if e['pluralonly']:
        gender = ''
    if pos == 'noun' and gender:
        label += ', ' + ' or '.join(GENDER_NAME.get(g, g) for g in gender)
    if e['pluralonly']:
        label += ', plural'
    if e['reflexive']:
        label = 'reflexive ' + label

    english = ('<div class="uc-sense"><div class="uc-pos">' + esc(label) + '</div>' +
               meanings_html(glosses) + '</div>')
    # THE PANEL IS ONE PANEL WHATEVER THE WORD CLASS IS, so a reader who has
    # learnt to open it on a verb finds the same thing on a noun.  A word class
    # that does not inflect simply contributes nothing and the panel is not
    # drawn -- the template only renders it when the field is non-empty.
    if pos == 'verb':
        conj = conjugation_html(rec, e['reflexive'])
    elif pos == 'noun':
        blocks = [(e['word'] if e.get('pair') else 'Declension',
                   noun_decl_html(rec, gender, e['pluralonly']))]
        # a pair is two words and declines twice; each block is then headed by
        # its own word rather than by the bare label
        if e.get('pair'):
            prec = next((r for r in W.get(e['pair_lemma'], []) if r.get('pos') == 'noun'), None)
            blocks.append((e['pair'],
                           noun_decl_html(prec, ARTICLE_G.get(e.get('pair_article', ''), 'f'),
                                          False)))
        conj = decl_panel([(t, b) for t, b in blocks if b])
    elif pos in ('adj', 'pron', 'det', 'num'):
        conj = adj_decl_html(rec)
    else:
        conj = ''
    forms = forms_html(e, rec, pos)
    exs = EX.get(e['key'], [])
    stats['verbs with a paradigm'] += bool(conj and pos == 'verb')
    stats['nouns declined'] += bool(conj and pos == 'noun')
    stats['adjectives declined'] += bool(conj and pos == 'adj')
    stats['nouns with a plural'] += bool(pos == 'noun' and 'plural</span>' in forms)
    stats['with a feminine'] += 'feminine</span>' in forms
    stats['no examples'] += not exs

    plain = '; '.join(meaning_lines(glosses, cap=3))
    cards.append({
        'id': f'u_{{DECK}}_{i}', 'num': str(i), 'category': 'Goethe A1',
        'sub': '', 'question': e['display'], 'answer': plain,
        'answerDate': '', 'traditional': '', 'hanzi': '', 'pinyin': '',
        'translations': '', 'abstract': '', 'citation': '', 'answerText': plain,
        'type': '{TYPE}',
        'fields': {
            'German': headword_html(e, gender),
            'Word': e['speak'],
            'English': english,
            'Forms': forms,
            'Conjugation': conj,
            'Examples': examples_html(exs),
        },
    })

# THE GUARD HAS TO LOOK AT THE MEANING AND NOT AT THE FIELD, which always
# carries the part-of-speech label and so is never empty: `besser` shipped as a
# card reading "verb" and nothing else -- Wiktionary files it first as an
# inflection of `bessern`, to improve -- and this test passed it.
blank = [c['question'] for c in cards if not c['answerText'].strip()]
if blank:
    raise SystemExit('cards with no meaning at all: ' + ', '.join(blank))
print('  cards:', len(cards), dict(stats))
json.dump(cards, open(lvlf('cards.json'), 'w'), ensure_ascii=False)
