#!/usr/bin/env python3
"""Assemble one level's CAPLE Portuguese deck.

EVERYTHING HERE IS EUROPEAN PORTUGUESE, and that shows up in four places rather
than one:

  · A BRAZIL-TAGGED FORM IS DROPPED, which matters far more than it sounds.
    5,464 of the 6,511 Portuguese verbs that carry a conjugation table have at
    least one -- almost every -ar verb, because Portugal writes the first person
    plural of the preterite `falámos` and Brazil writes `falamos`.  Left in, the
    table shows both and the reader has no way to tell which is theirs.  A
    Portugal-tagged form is KEPT: there are 66 of them and they are the European
    reading by definition.

  · A BRAZIL-TAGGED SENSE IS DEMOTED AND A PORTUGAL-TAGGED ONE IS NOT.  This is
    the DELE pipeline's `Spain` rule turned around, and Portuguese needs it more:
    Wiktionary carries four times as many Brazil tags as Portugal ones (5,926
    against 1,473), so the first sense of a word is often the Brazilian one.
    `banheiro` is the case that proves it -- Brazil "bathroom", Portugal
    "lifeguard" -- and `camisola` is a camisole in Brazil and a jumper in
    Portugal.

  · THE MOOD IS THE CONJUNTIVO.  Portugal calls it that and Brazil calls it the
    subjuntivo; the same split gives Portugal `Condicional` where Brazil says
    `Futuro do pretérito`.  A table headed the Brazilian way in a deck sat for a
    Lisbon exam is a small thing that tells the reader the deck does not know
    which language it is teaching.

  · A REFLEXIVE IS THE BASE VERB'S PARADIGM UNDER AN AUTHORED GLOSS.  Spanish
    files `llamarse` as a lemma and Wiktionary carries it; Portuguese writes
    `chamar-se` and Wiktionary carries nothing at all -- checked on `chamar-se`,
    `levantar-se` and `sentar-se`, all three absent.  So the handful an A1
    candidate actually needs are glossed in `reflexives.py`, and the clitics are
    attached to the paradigm here.  European Portuguese puts them AFTER the verb
    and hyphenated (`chamo-me`), where Brazil puts them in front.
"""
import html
import json
import re

from caple_level import LEVEL, DECK_IDS, f as lvlf

words = json.load(open(lvlf('wordlist.json')))
W = json.load(open(lvlf('wikt.json')))
EX = json.load(open(lvlf('examples.json')))

esc = lambda s: html.escape(s, quote=True)

# ---------------------------------------------------------------- senses
BAD_TAGS = {'form-of', 'alt-of', 'vulgar', 'slang', 'offensive', 'derogatory',
            'archaic', 'obsolete', 'dated', 'historical', 'uncommon', 'rare',
            'poetic', 'literary', 'euphemistic', 'abbreviation', 'ellipsis',
            'humorous', 'childish', 'dialectal', 'obscure'}

# Regions whose vocabulary is not what a Lisbon exam means.  Only Brazil really
# bites: the African standards follow the European norm, so an Africa-tagged
# sense is the RIGHT reading here and must not be penalised for being regional.
OTHER_REGION = {'Brazil', 'Brazilian'}

# Regions whose usage IS the European standard, or follows it.
EURO_REGION = {'Portugal', 'Africa', 'Angola', 'Mozambique', 'Cape-Verde',
               'Guinea-Bissau', 'East-Timor', 'Macao'}


def sense_rank(s):
    """Lower is better, and a European sense can score BELOW zero.

    A capitalised tag is a place or a register label, and a regional sense is
    demoted rather than dropped, so a word whose only senses are regional still
    gets one.  What is new against the DELE pipeline's version is that the
    European tag EARNS a sense its place rather than merely not costing it one.

    `comboio` is why, and it shipped wrong before this was written.  Wiktionary
    gives it three senses: "train" tagged ['Africa', 'Portugal'], and two
    readings of "convoy" tagged with nothing at all.  Exempting `Portugal` from
    the penalty is not enough, because `Africa` is still a capitalised tag and
    still scores 1 -- so the untagged "convoy" scored 0, won, and the commonest
    noun in Portuguese transport was taught to a Lisbon exam candidate as a
    military convoy.  Scoring the European tag NEGATIVE is what puts the train
    back, and it is the right rule anyway: on a word where Portugal and Brazil
    differ, the Portugal reading is not one candidate among several, it is the
    answer.
    """
    tags = s.get('tags', [])
    n = 0
    for x in tags:
        if x in EURO_REGION:
            n -= 2                       # this is the variety being taught
        elif x in OTHER_REGION:
            n += 3                       # actively wrong here
        elif x[:1].isupper():
            n += 1                       # some other place or register label
        elif x in ('colloquial', 'informal', 'figuratively', 'broadly'):
            n += 1
    return n


def strip_parens(s):
    """Remove the bracketed matter, counting depth rather than trusting `[^)]`.

    A BRACKET CAN CONTAIN A BRACKET, and Wiktionary's do: `our (belonging to …
    of us, excluding the person(s) being addressed)` and `if (introduces a
    condition that may be (or prove to be) either true or false)`.  A regex
    ending at the FIRST `)` cuts in the middle of both, leaving `our being
    addressed)` and `if either true or false)` -- which is not a shortened
    gloss, it is a different and wrong one, and it reads as a plausible English
    phrase rather than as damage.
    """
    out, depth = [], 0
    for ch in s:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth = max(0, depth - 1)
        elif depth == 0:
            out.append(ch)
    return re.sub(r'\s+', ' ', ''.join(out)).strip(' ;,')


def tidy(g):
    """A card wants a translation, not a dictionary definition."""
    g = re.sub(r'\s*\[[^\]]*\]', '', g).strip(' ;,')
    g = re.sub(r'\s*[;,]?\s*\b(fe)?male equivalent of \S+', '', g, flags=re.I)
    g = re.sub(r'^\s*(alternative (form|letter-case form)|clipping|'
               r'apocopic form|contraction) of \S+\s*[;:,]?\s*',
               '', g, flags=re.I).strip(' ;,')
    # A CROSS-REFERENCE THAT CARRIES ITS TARGET'S MEANING IS A TRANSLATION.
    # Wiktionary glosses `duche` as `European Portuguese standard form of ducha
    # (“shower”)`, which is the whole sense -- so stripping the pointer the way
    # the rule above does would leave nothing, and keeping it whole tells a
    # learner the etymology of a word instead of what it means.  The quoted
    # target is what the card wants.  Where the pointer carries no gloss
    # (`secção` -> `seção`) it is kept as printed, which at least says that
    # this is the European spelling.
    m = re.fullmatch(r'[\w\- ]*\bform of\s+\S+\s*\(“([^”]+)”\)', g)
    if m:
        g = m.group(1)
    if len(g) > 58 and ' (' in g:
        head = strip_parens(g)
        if len(head) >= 3:
            g = head
    # A gloss is sometimes a DEFINITION rather than a translation, and then the
    # translation is its head: where the leading comma-separated pieces are
    # short and one long piece follows, the short ones are the word and the long
    # one is the explanation.
    if len(g) > 48 and ',' in g:
        parts = split_top(g, ',')
        head = []
        for x in parts:
            if len(x) > 24 or not x:
                break
            head.append(x)
        if head and len(head) < len(parts):
            g = ', '.join(head)
    if len(g) > 92:
        cut = g.rfind(';', 0, 92)
        g = (g[:cut] if cut > 24 else g[:92].rsplit(' ', 1)[0]).rstrip(' ;,(')
    return debracket(g)


def debracket(g):
    """Close the brackets, by dropping whatever is left half-open.

    EVERY CUT ABOVE CAN LAND INSIDE A PARENTHESIS -- the definition rule takes
    the leading pieces of `my (belonging to, associated with, related to the
    speaker)` and the 92-character rule simply stops -- and what reaches the
    card is then a meaning box showing `my (belonging to, associated with` with
    a bracket that never closes.  The parenthetical is a QUALIFIER, so losing it
    whole is honest where losing half of it is not; a closer with nothing
    opening it goes the same way.  Nothing else can see this: the gloss is a
    non-empty string of the right shape and the card is the right length.
    """
    out, depth, opens = [], 0, []
    for ch in g:
        if ch in '([':
            depth += 1
            opens.append(len(out))
        elif ch in ')]':
            if depth == 0:
                continue                  # a closer with no opener: drop it
            depth -= 1
            opens.pop()
        out.append(ch)
    if depth and opens:
        out = out[:opens[0]]              # cut at the outermost unclosed one
    return ''.join(out).strip(' ;,')


def glosses_for(rec, limit=2):
    out = []
    # a sense carrying a form_of FIELD is a cross-reference, not a translation.
    # The 'form-of' TAG alone does not catch it -- Wiktionary does not always
    # set it.
    cands = [s for s in rec.get('senses', [])
             if not (BAD_TAGS & set(s.get('tags', [])))
             and not (s.get('form_of') or s.get('alt_of')) and s.get('glosses')]
    # Keep the senses at the BEST rank rather than at rank zero exactly.  The
    # zero test is what hid `comboio`'s "train" behind "convoy": a European
    # sense now scores below zero, so a rule looking for zero would throw away
    # the very senses this deck exists to prefer.
    if cands:
        best = min(sense_rank(s) for s in cands)
        cands = [s for s in cands if sense_rank(s) == best]
    for s in sorted(cands, key=sense_rank):
        g = tidy(s['glosses'][0])
        if not g or g in out:
            continue
        if out and sum(len(x) for x in out) + len(g) > 96:
            break
        out.append(g)
        if len(out) == limit:
            break
    return out


POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'num': 'numeral', 'intj': 'interjection',
            'det': 'determiner', 'prep': 'preposition', 'conj': 'conjunction',
            'article': 'article', 'particle': 'particle', 'contraction': 'contraction',
            'phrase': 'phrase'}

# ---------------------------------------------------------------- reflexives
# Wiktionary has no record for any of them, so the gloss is written out in
# `reflexives.py` and the paradigm is the base verb's with the clitics attached.
from reflexives import GLOSS as REFLEXIVE, base as refl_base, report_missing

report_missing(words, 'build_deck.py')

# Words whose Wiktionary entry cannot furnish a card, and what they mean.
# `obrigado` is the one every A1 course opens with and Wiktionary files the
# adjective "obligatory" and the past participle of `obrigar` ahead of it.
AUTHORED = {
    'obrigado': ['thank you (said by a man)'],
    'obrigada': ['thank you (said by a woman)'],
    # B1.  A WORD WHOSE ENTRY IS A POINTER AND WHOSE TARGET IS NOT IN THE DUMP.
    # `vários` reads "masculine plural of vário", and `vário` has no entry at
    # all -- so the pointer cannot be followed and the meaning has to be written
    # down.  It is a real B1 headword: the Referencial lists the plural, which
    # is the only form anyone uses.  Watch for more of these as the levels go up
    # -- `build_deck` REFUSES a card with no meaning, so they announce
    # themselves rather than shipping blank, which is what this entry is.
    'vários': ['several, various'],
    # C2.  A WORD WITH TWO NOUN RECORDS WHOSE FIRST IS THE ODD SENSE, which is
    # `o comboio`'s "convoy" in the one shape the sense ranking cannot reach:
    # ranking works on TAGS, and here neither record carries one, so the pick is
    # pure Wiktionary record order and the rare textile sense is filed first.
    # `linhagem` is lineage; "burlap" is a sense almost nobody would recognise.
    # MEASURED BEFORE IT WAS TREATED AS A CLASS: 177 shipped words across the
    # six levels carry two or more noun records, and reading C2's seventeen by
    # eye this is the only one the order gets wrong -- `coração`, `bar`, `canto`,
    # `gota`, `pilha`, `teto` and the rest all lead with their central sense.
    # So it is a hand entry rather than a rule, and the next one is found the
    # same way: read the level's own multi-record nouns when adding a level.
    'linhagem': ['lineage, descent'],
    'faz favor': ['please; excuse me'],
    'se calhar': ['maybe, perhaps'],
    'de nada': ["you're welcome; not at all"],
    'por favor': ['please'],
    'bom dia': ['good morning'],
    'boa tarde': ['good afternoon'],
    'boa noite': ['good evening; good night'],
}

# ---------------------------------------------------------------- gender
def gender_of(rec):
    a = (rec.get('head_templates') or [{}])[0].get('args', {})
    g = a.get('1') or a.get('g') or ''
    if g in ('pt',):
        g = a.get('g', '')
    return g


def article(word, g):
    if word in PLURAL_ONLY:
        return 'as' if g.startswith('f') else 'os'
    if g.startswith('m-p'):
        return 'os'
    if g.startswith('f-p'):
        return 'as'
    if g in ('mf', 'mfbysense', 'm-f'):
        return 'o/a'
    if g.startswith('f'):
        return 'a'
    if g.startswith('m'):
        return 'o'
    return ''


ART_GENDER = {'o': 'm', 'a': 'f', 'os': 'm', 'as': 'f', 'o/a': ''}

# --------------------------------------------------------- male/female pairs
# NOTHING IS DERIVED HERE.  The naive rule -- swap a final -o for -a -- gets
# `o professor` wrong ("professoro") and gets every suppletive pair wrong
# (pai/mãe, homem/mulher, rei/rainha).  kaikki has already expanded
# Wiktionary's own template arguments into the record's `forms` list, tagged
# ['feminine'] and ['feminine','plural'].  Read the forms; never compose one.
def fem_forms(rec, word):
    mpl = ''
    fems, fpls = [], []
    for f in rec.get('forms', []):
        tg = set(f.get('tags') or [])
        s = f.get('form', '')
        if not s or s == '-' or 'table-tags' in tg:
            continue
        if 'Brazil' in tg:
            continue
        if 'feminine' in tg:
            (fpls if 'plural' in tg else fems).append(s)
        elif 'plural' in tg and not mpl and 'masculine' not in tg:
            mpl = s
    # a common-gender noun lists the headword itself as its own feminine
    # (`o/a estudante`), so the pair is the first form that is a different word
    fem = next((s for s in fems if s != word), '')
    if not fem:
        return '', ''
    fpl = (next((s for s in fpls if s == fem + 's'), '')
           or next((s for s in fpls if s != mpl), ''))
    return fem, fpl


def merges_with(word, fem, rec, vocab):
    """Should the feminine's own card be folded into the masculine's?

    Only where the two are genuinely one entry seen from both sides.  Two
    signals, either of which will do: the feminine's own entry points back at
    this word, or this word's entry NAMES the feminine outright rather than
    deriving it with a bare `+`.  That is what keeps a real feminine form that
    is also separately a noun from being swallowed.
    """
    if fem not in vocab:
        return False
    for rr in W.get(fem, []):
        if rr.get('pos') != 'noun':
            continue
        args = (rr.get('head_templates') or [{}])[0].get('args', {})
        if args.get('m') and any(
                f.get('form') == word and 'masculine' in (f.get('tags') or [])
                for f in rr.get('forms', [])):
            return True
    named = (rec.get('head_templates') or [{}])[0].get('args', {}).get('f', '')
    return fem in [x.strip() for x in named.split(',')]


# Wiktionary's record order decides which sense a card teaches, and Portuguese
# has the same trap Spanish does, one notch worse: EVERY LETTER OF THE ALPHABET
# HAS AN ENTRY NAMED AFTER IT, filed as `character`.  `a` carries eight records
# -- article, character, contraction, interjection, noun, preposition, pronoun,
# verb -- and `o` carries three.  Those two are the commonest words in the
# language and both would otherwise come out as the name of a letter.
#
# AND A PAST PARTICIPLE IS FILED BEFORE THE NOUN OR INTERJECTION IT SHARES ITS
# SPELLING WITH, which is the DELE pipeline's finding in another language:
# `obrigado` is "thank you" to a learner and Wiktionary leads with the adjective
# "obligatory" and then the past participle of `obrigar`.
FORCE_POS = {
    'a': 'article', 'o': 'article', 'e': 'conj', 'é': 'verb',
    'de': 'prep', 'em': 'prep', 'com': 'prep', 'por': 'prep', 'para': 'prep',
    'que': 'conj', 'se': 'conj', 'não': 'adv', 'sim': 'adv',
    'um': 'article', 'uma': 'article',
    'obrigado': 'intj', 'obrigada': 'intj', 'bom': 'adj', 'boa': 'adj',
    'café': 'noun', 'jornal': 'noun', 'telemóvel': 'noun', 'comboio': 'noun',
    'tarde': 'noun', 'noite': 'noun', 'manhã': 'noun', 'meio': 'noun',
    'primeiro': 'adj', 'segundo': 'adj',
    # A2.  Wiktionary files a noun `mesmo` "the same" ahead of the adjective and
    # the adverb, so the card came out `o mesmo` -- a masculine noun, with an
    # article and no plural -- where what the A2 inventory names, and what a
    # learner needs, is `mesmo` meaning `same` and `even`.
    'mesmo': 'adj',
}

# A PLURAL-ONLY NOUN TAKES A PLURAL ARTICLE, and Wiktionary does not always say
# that it is one: `cuecas` is tagged plainly feminine with no plural form of its
# own, so `article` reads it as a singular and writes `a cuecas`.  The tag is
# what would decide this if it were there (`f-p` gives `as` already, which is
# how `os óculos` comes out right), so the handful that are mis-tagged are named
# rather than guessed at from the final -s -- `o país` and `o mês` end in one
# too, and `o lápis` is invariable and still takes the singular article.
PLURAL_ONLY = {'cuecas', 'calças', 'férias', 'parabéns', 'meias-calças'}


def has_real_sense(r):
    return any(not (x.get('form_of') or x.get('alt_of'))
               for x in r.get('senses', []))


def pick_primary(word, recs):
    want = FORCE_POS.get(word)
    p = None
    if want:
        p = next((r for r in recs if r['pos'] == want and has_real_sense(r)), None)
        if p is None:
            p = next((r for r in recs if r['pos'] == want), None)
    return p or next((r for r in recs if has_real_sense(r)),
                     recs[0] if recs else None)


def pair_for(word, recs, primary):
    """The feminine to set beside the headword, and its plural, or ('', '')."""
    if primary is None:
        return '', ''
    if primary['pos'] == 'adj':
        return fem_forms(primary, word)
    if primary['pos'] != 'noun':
        return '', ''
    nrec = next((r for r in recs if r['pos'] == 'noun'), None)
    if nrec is None:
        return '', ''
    g = gender_of(nrec)
    if not g.startswith('m') or g.startswith(('mf', 'm-f', 'm-p')):
        return '', ''
    return fem_forms(nrec, word)


# ---------------------------------------------------------------- conjugation
# European Portuguese.  `vós` is kept in the table and labelled for what it is:
# it is genuinely archaic in Portugal outside a few northern dialects and the
# liturgy, but the paradigm has six slots and an edition that prints five is
# hiding a form rather than simplifying one.  `você`/`vocês` take the THIRD
# person, which is the single most confusing thing about the Portuguese verb for
# a beginner and is why they are named on those rows rather than left out.
PERSONS = [('first-person', 'singular', 'eu'),
           ('second-person', 'singular', 'tu'),
           ('third-person', 'singular', 'ele, ela, você'),
           ('first-person', 'plural', 'nós'),
           ('second-person', 'plural', 'vós'),
           ('third-person', 'plural', 'eles, elas, vocês')]

# The imperative has no first person singular and its rows are addressed rather
# than numbered, so it is labelled by who is being told to do the thing.
IMP_ROWS = [('tu', lambda t: 'second-person' in t and 'singular' in t),
            ('você', lambda t: 'third-person' in t and 'singular' in t),
            ('nós', lambda t: 'first-person' in t and 'plural' in t),
            ('vós', lambda t: 'second-person' in t and 'plural' in t),
            ('vocês', lambda t: 'third-person' in t and 'plural' in t)]

# (mood, name, which forms, where the clitic goes: 'enc' | 'pro' | 'meso')
#
# WHERE THE PRONOUN GOES IS A FACT ABOUT THE CLAUSE AND ABOUT THE TENSE, NOT
# ABOUT THE VERB, and it is the single most European thing in this table.
# Portugal's default is ENCLISIS -- the pronoun after the verb, hyphenated,
# `chamo-me` -- where Brazil puts it in front.  But that default is overridden
# in three ways, and all three are built into the paradigm itself:
#
#   · THE CONJUNTIVO IS SUBORDINATE BY NATURE.  It is reached through `que`,
#     `se`, `quando`, `talvez` -- and every one of those forces the pronoun in
#     front.  Nobody writes `chame-me` in `espero que se chame`; they write
#     `que eu me chame`.  Shipping the conjuntivo with enclisis, which is what
#     this table did before the rule was per-tense, puts a form on the card that
#     no European speaker would produce.
#   · A NEGATIVE IMPERATIVE carries `não`, which does the same thing:
#     `não te levantes`, never `não levanta-te`.
#   · THE FUTURE AND THE CONDITIONAL TAKE MESOCLISIS -- the pronoun goes INSIDE
#     the verb, between its infinitive stem and its ending: `chamar-me-ei`,
#     `chamar-se-á`, `chamar-nos-emos`, `chamar-me-ia`.  Those two tenses are
#     historically an infinitive with `haver` welded onto it and the pronoun
#     still sits in the join, which is why no other tense does this.  Written
#     as ordinary enclisis they come out `chamarei-me` and `chamaria-me`, which
#     are not Portuguese at all -- and the table looked perfectly regular that
#     way, twelve rows per reflexive verb, every count healthy.  See `mesoclitic`.
#
# The indicative's other tenses, the affirmative imperative and the personal
# infinitive keep enclisis, which is the citation form and what a main clause
# actually says.
TENSES = [
    ('Indicativo', 'Presente',
     lambda t: 'indicative' in t and 'present' in t and 'subjunctive' not in t, 'enc'),
    ('Indicativo', 'Pretérito imperfeito',
     lambda t: 'indicative' in t and 'imperfect' in t, 'enc'),
    ('Indicativo', 'Pretérito perfeito',
     lambda t: 'indicative' in t and 'preterite' in t, 'enc'),
    ('Indicativo', 'Pretérito mais-que-perfeito',
     lambda t: 'indicative' in t and 'pluperfect' in t, 'enc'),
    ('Indicativo', 'Futuro',
     lambda t: 'indicative' in t and 'future' in t, 'meso'),
    ('Indicativo', 'Condicional',
     lambda t: 'conditional' in t, 'meso'),
    # Portugal says CONJUNTIVO where Brazil says subjuntivo.
    ('Conjuntivo', 'Presente',
     lambda t: 'subjunctive' in t and 'present' in t, 'pro'),
    ('Conjuntivo', 'Pretérito imperfeito',
     lambda t: 'subjunctive' in t and 'imperfect' in t, 'pro'),
    ('Conjuntivo', 'Futuro',
     lambda t: 'subjunctive' in t and 'future' in t, 'pro'),
    # THE PERSONAL INFINITIVE IS THE ONE THING PORTUGUESE HAS THAT NO OTHER
    # ROMANCE LANGUAGE DOES, and a table that leaves it out has left out the
    # form a learner will meet in `antes de saírmos` and be unable to parse.
    ('Infinitivo', 'Infinitivo pessoal',
     lambda t: 'infinitive' in t and 'impersonal' not in t, 'enc'),
]

CLITIC = {'eu': 'me', 'tu': 'te', 'ele, ela, você': 'se', 'nós': 'nos',
          'vós': 'vos', 'eles, elas, vocês': 'se'}
IMP_CLITIC = {'tu': 'te', 'você': 'se', 'nós': 'nos', 'vós': 'vos',
              'vocês': 'se'}


def conj_forms(rec):
    """form list -> [(tagset, form)] for the plain European paradigm only.

    A BRAZIL-TAGGED FORM IS DROPPED HERE and this is the single most important
    line in the file: 5,464 of the 6,511 verbs carrying a table have one, so
    without it almost every -ar verb in the deck shows `falamos` beside
    `falámos` with nothing to say which is which.
    """
    out = []
    for f in rec.get('forms', []):
        tg = set(f.get('tags', []))
        s = f.get('form', '')
        if not s or s == '-' or f.get('source') != 'conjugation':
            continue
        if tg & {'table-tags', 'inflection-template', 'combined-form'}:
            continue
        if tg & OTHER_REGION:
            continue
        out.append((tg, s))
    return out


def pick(forms, tags_ok, extra=None):
    for tg, s in forms:
        if tags_ok(tg) and (extra is None or extra(tg)):
            return s
    return ''


# ------------------------------------------------------- enclisis
# EUROPEAN PORTUGUESE PUTS THE PRONOUN AFTER THE VERB.  That is the visible
# difference from Brazil (`chamo-me` against `me chamo`) and it is not a
# straight concatenation: the first person plural drops its -s before -nos
# (`chamamos` + `nos` = `chamamo-nos`), and the second person plural drops its
# -s before -vos.  A negative imperative takes PROCLISIS instead, because
# European Portuguese requires the pronoun in front after a negative -- which is
# why the two imperatives are built separately rather than as one tense.
#
# THE PRONOUN IS MARKED WITH A COLOUR RATHER THAN A HYPHEN, on request, and the
# trade is worth stating because it is a real one: the hyphen is not decoration
# a learner can do without, it is how the form is SPELLED, so a card reading
# `chamome` in one colour and `me` in another is teaching the right word in the
# wrong orthography.  What it buys is that the three parts of `chamar-me-ei`
# read as three parts at a glance instead of as a hyphenated string.  The deck's
# own description says which way round this is, so a learner meeting `chamo-me`
# in a book is not left thinking one of the two is a misprint.
#
# THE MARK IS A SENTINEL, NOT A TAG, because every one of these strings goes
# through `esc()` on its way onto the card -- a `<span>` built here would arrive
# as visible angle brackets.  Two control characters no source text can contain
# survive the escape untouched and become the span afterwards; see `clitic_html`.
CL_A, CL_B = '\x01', '\x02'


def marked(cl):
    return f'{CL_A}{cl}{CL_B}'


def clitic_html(s):
    """Escape a form and turn its sentinels into the span.  Escape FIRST."""
    return (esc(s).replace(CL_A, '<span class="uc-cl">')
                  .replace(CL_B, '</span>'))


def enclitic(form, cl):
    """The verb, then its pronoun.  ONE form loses a letter, not two.

    THE `-s` DROP BELONGS TO THE FIRST PERSON PLURAL BEFORE `nos` AND TO
    NOTHING ELSE, and this function used to apply it before `vos` as well --
    which is the affirmative imperative's rule mistaken for a general one.  The
    2pl imperative really does end in a bare `-i` (`chamai`, `arrependei`), but
    that is how the imperative is FORMED and the source hands it over already
    formed, so dropping an `-s` a second time takes it off the other tenses:
    the present became `chamai-vos` for `chamais-vos`, the personal infinitive
    `chamarde-vos` for `chamardes-vos`, and -- the one that is not merely
    archaic but wrong -- the preterite became `chamaste-vos`, which is the
    SECOND PERSON SINGULAR verb carrying a plural pronoun, and reads as an
    ordinary Portuguese word.

    MEASURED BEFORE IT WAS CHANGED, on two sources that do not know about each
    other.  In Tatoeba's Portuguese the 1pl drop is unanimous -- 129 `-mo-nos`
    against 0 `-mos-nos` -- while every `-vos` form but one is an imperative,
    whose stem has no `-s` to lose and which therefore says nothing either way;
    the single informative token, `lembrais-vos`, keeps it.  And Wiktionary's
    own generated pronominal table for `arrepender` keeps it in all four
    non-imperative tenses (`arrependeis-vos`, `arrependíeis-vos`,
    `arrependerdes-vos`) while giving `arrependei-vos` for the imperative.  It
    was found because that table is the shelf's only already-pronominal one, so
    the two conventions ended up on two cards of one deck -- see `remark`.
    """
    if cl == 'nos' and form.endswith('mos'):
        form = form[:-1]                  # chamamos -> chamamo-nos
    return form + marked(cl)


# The endings the future and the conditional are built out of, SORTED LONGEST
# FIRST -- and the sort is what makes it right rather than the order they are
# written in.  `chamarás` must lose `ás` and not `á`; `chamaríamos` `íamos` and
# not `ia`; and the one that actually bit, `chamaríeis` must lose `íeis` and not
# the future's `eis`, which gave the nonsense `chamarí-vos-eis`.
MESO_END = tuple(sorted(('emos', 'eis', 'ão', 'ei', 'ás', 'á',
                         'íamos', 'íeis', 'iam', 'ias', 'ia'),
                        key=len, reverse=True))

_meso_missed = []
_pronominal_tables = []


def mesoclitic(form, cl):
    """chamarei + me -> chamar·me·ei, the `me` coloured.  See above `TENSES`.

    The split is found by STRIPPING THE ENDING rather than by assuming the stem
    is the infinitive, because the irregular futures are irregular in the stem:
    `dizer` gives `direi`, so the pronoun goes into `dir-` and the answer is
    `dir-me-á`, not `dizer-me-á`.  A form whose ending is not one of the eleven
    is left as plain enclisis and REPORTED at the end of the run -- silently
    falling back would put `chamarei-me` on a card again with nothing to say so.
    """
    for end in MESO_END:
        if form.endswith(end) and len(form) > len(end) + 1:
            return form[:-len(end)] + marked(cl) + end
    _meso_missed.append(form)
    return enclitic(form, cl)


# ------------------------------------------- a table that is already pronominal
# A VERB THAT IS INHERENTLY PRONOMINAL HAS ITS WIKTIONARY TABLE CONJUGATED WITH
# THE PRONOUN ALREADY IN IT, and the pipeline assumed a bare one.  `arrepender`
# is only ever used as `arrepender-se`, so its `pt-conj` was generated in the
# pronominal form: every cell reads `arrependo-me`, `arrepender-me-ei`, `me
# arrependa` -- and the reflexive branch then attached a SECOND pronoun, so 29
# rows of one C1 card printed `arrependo-me` with a coloured `me` after it.
# Nothing threw, the card was the right length and the paradigm was the right
# shape; the only symptom was the word twice.  One card of 3,397 on the shelf.
#
# THE FORMS ARE RE-MARKED RATHER THAN STRIPPED AND REBUILT, which is the
# decision worth keeping.  Inverting the source's transformation means guessing
# which `-s` it dropped, and it does not drop the same ones we do -- its
# personal infinitive is `arrependerdes-vos` where our own rule gives
# `arrependerdes` + `vos` -- so an inverse would have to be right about a
# convention the source is not consistent in.  The table IS the reflexive
# paradigm; all it needs is the hyphen turned into a colour.
#
# AND THE TWO AGREE EVERYWHERE ELSE, which is worth recording as the closest
# thing to an independent check this module has: Wiktionary's generated
# pronominal table puts the pronoun after the verb, inside the future and the
# conditional, and before the verb in the conjuntivo and after `não` in the
# negative imperative -- exactly what `TENSES` says, cell for cell.
_CL = 'me|te|se|nos|vos'
_PRON_ENC = re.compile(r'^(.*)-(' + _CL + r')$')
_PRON_MESO = re.compile(r'^(.*?)-(' + _CL + r')-(.+)$')
_PRON_PRO = re.compile(r'^(não\s+)?(' + _CL + r')\s+(.+)$')
_PRON_ANY = re.compile(r'(?:^|(?<=\s))(?:' + _CL + r')(?=\s)'
                       r'|-(?:' + _CL + r')(?:-|$)')


def is_pronominal(forms):
    """Does this table already carry the pronoun in most of its cells?"""
    if not forms:
        return False
    n = sum(1 for _, s in forms if _PRON_ANY.search(s))
    return n * 2 > len(forms)


def remark(s):
    """Colour the pronoun the SOURCE put there, wherever it put it."""
    m = _PRON_MESO.match(s)
    if m:
        return m.group(1) + marked(m.group(2)) + m.group(3)
    m = _PRON_ENC.match(s)
    if m:
        return m.group(1) + marked(m.group(2))
    m = _PRON_PRO.match(s)
    if m:
        return (m.group(1) or '') + marked(m.group(2)) + ' ' + m.group(3)
    return s


def conjugation_html(word, rec, reflexive):
    forms = conj_forms(rec)
    if not forms:
        return ''
    inf = pick(forms, lambda t: 'infinitive' in t and 'impersonal' in t) \
        or pick(forms, lambda t: 'infinitive' in t)
    ger = pick(forms, lambda t: 'gerund' in t)
    par = pick(forms, lambda t: 'participle' in t and 'past' in t
               and 'masculine' in t) \
        or pick(forms, lambda t: 'participle' in t and 'past' in t)
    # a verb that is only ever used pronominally comes with the pronoun already
    # attached to every cell -- see `is_pronominal`
    pron = reflexive and is_pronominal(forms)
    if pron:
        _pronominal_tables.append(word)
    if reflexive:
        # the lemma, with its own pronoun marked like every other row's
        inf = word[:-3] + marked('se') if word.endswith('-se') else word
        if ger:
            ger = remark(ger) if pron else enclitic(ger, 'se')

    p = []
    nf = [(a, b) for a, b in (('infinitivo', inf), ('gerúndio', ger),
                              ('particípio', par)) if b]
    if nf:
        p.append('<div class="uc-cj-nf">' + ''.join(
            f'<span class="uc-cj-nfi"><i>{esc(a)}</i><b>{clitic_html(b)}</b></span>'
            for a, b in nf) + '</div>')

    by_mood = {}
    for mood, name, test, place in TENSES:
        rows = []
        for per, num, label in PERSONS:
            s = pick(forms, test,
                     lambda t, p_=per, n_=num: p_ in t and n_ in t)
            if not s:
                rows.append((label, ''))
                continue
            if pron:
                s = remark(s)
            elif reflexive:
                cl = CLITIC[label]
                s = (f'{marked(cl)} {s}' if place == 'pro'
                     else mesoclitic(s, cl) if place == 'meso'
                     else enclitic(s, cl))
            rows.append((label, s))
        if not any(r[1] for r in rows):
            continue
        by_mood.setdefault(mood, []).append((name, rows))

    for neg in (False, True):
        rows = []
        for label, test in IMP_ROWS:
            s = pick(forms,
                     lambda t: 'imperative' in t and (('negative' in t) == neg),
                     lambda t, f_=test: f_(t))
            if not s:
                rows.append((label, ''))
                continue
            if pron:
                s = remark(s)
            elif reflexive:
                cl = IMP_CLITIC[label]
                if neg:
                    # `não fales` -> `não te fales`? no: proclisis puts the
                    # pronoun between the negative and the verb, `não te levantes`
                    s = (re.sub(r'^não\s+', f'não {marked(cl)} ', s)
                         if s.startswith('não ') else f'{marked(cl)} {s}')
                else:
                    s = enclitic(s, cl)
            rows.append((label, s))
        if any(r[1] for r in rows):
            by_mood.setdefault('Imperativo', []).append(
                ('Afirmativo' if not neg else 'Negativo', rows))

    for mood in ('Indicativo', 'Conjuntivo', 'Imperativo', 'Infinitivo'):
        bl = by_mood.get(mood)
        if not bl:
            continue
        p.append(f'<div class="uc-cj-mood">{esc(mood)}</div>'
                 f'<div class="uc-cj-grid">')
        for name, rows in bl:
            cells = ''.join(
                f'<div class="uc-cj-r"><span class="uc-cj-p">{esc(lab)}</span>'
                f'<span class="uc-cj-f">{clitic_html(v) if v else "—"}</span></div>'
                for lab, v in rows)
            p.append(f'<div class="uc-cj-t"><div class="uc-cj-h">{esc(name)}'
                     f'</div>{cells}</div>')
        p.append('</div>')
    return ''.join(p)


# ---------------------------------------------------------------- meanings
def split_top(s, sep):
    """Split on `sep`, but only OUTSIDE brackets.

    A SEPARATOR INSIDE A BRACKET IS NOT A SEPARATOR, and this reached a card
    both ways.  `to feel (well, ill, tired)` is one sense with a parenthetical
    of three examples, and split on its commas it renders as three lines reading
    `to feel (well`, `ill`, `tired)`; `my (belonging to, associated with,
    related to the speaker; first-person possessive)` does the same on its
    semicolon.  Every count stays healthy, every word is still on the card, and
    the only symptom is a meaning box full of unclosed brackets.
    """
    out, depth, cur = [], 0, ''
    for ch in s:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth = max(0, depth - 1)
        if ch == sep and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += ch
    out.append(cur)
    return [x for x in (p.strip() for p in out) if x]


def comma_parts(s):
    """Split a gloss on commas, but only where every piece stands on its own."""
    parts = split_top(s, ',')
    if len(parts) < 2 or len(parts) > 3:
        return [s]
    for p in parts:
        if not p or len(p) > 24 or re.match(r'(or|and|nor|but)\b', p):
            return [s]
    return parts


def meaning_lines(glosses, cap=5):
    """The gloss lines a card shows, in order, with the repeats taken out.

    THE DUPLICATE TEST IGNORES THE PARENTHETICAL, which is not fussiness: a
    Wiktionary entry routinely gives one sense with a disambiguating bracket and
    another without, and the two arrive here as separate glosses.  `falar` is
    the plain case -- "to speak; to talk (to say words out loud)" and, four
    senses later, "to talk" -- and read literally that puts THREE lines on the
    card, of which two are the same word.  The bracketed reading is the one
    kept, because it is the one that says which "talk" is meant.
    """
    out, heads = [], set()
    for g in glosses:
        for semi in split_top(g, ';'):
            semi = semi.strip(' ;,')
            if not semi:
                continue
            for part in comma_parts(semi):
                part = part.strip(' ;,')
                if not part:
                    continue
                # a piece that is nothing BUT a parenthetical qualifies the
                # meaning before it
                if part.startswith('(') and not strip_parens(part) and out:
                    out[-1] += ' ' + part
                    heads.add(strip_parens(out[-1]))
                    continue
                head = strip_parens(part)
                if not head or head in heads:
                    continue
                heads.add(head)
                out.append(part)
    return out[:cap]


def meanings_html(glosses):
    lines = meaning_lines(glosses)
    if len(lines) <= 1:
        return f'<div class="uc-gl">{esc(lines[0] if lines else "")}</div>'
    return ('<ul class="uc-gls">'
            + ''.join(f'<li>{esc(x)}</li>' for x in lines) + '</ul>')


# ---------------------------------------------------------------- other forms
def forms_html(word, recs, primary, pair):
    """The line under the headword.  A paired word gives BOTH plurals on it."""
    fem, fpl = pair
    bits = []
    for rec in recs:
        pos = rec['pos']
        if primary is not None and pos != primary['pos']:
            continue
        if pos == 'noun':
            g = gender_of(rec)
            pl = ''
            for f in rec.get('forms', []):
                tg = set(f.get('tags') or [])
                if ('plural' in tg and 'feminine' not in tg
                        and not (tg & OTHER_REGION)
                        and f.get('form') not in ('', '-')):
                    pl = f['form']
                    break
            if pl and not g.startswith(('f-p', 'm-p')):
                a = ('os/as' if g.startswith(('mf', 'm-f')) else
                     'as' if g.startswith('f') else
                     'os' if g.startswith('m') else '')
                v = (a + ' ' if a else '') + pl
                if fem and fpl:
                    v += ', as ' + fpl
                bits.append(('plural', v))
            break
        if pos == 'adj':
            pls = comp = ''
            for f in rec.get('forms', []):
                tg = set(f.get('tags', []))
                s = f.get('form', '')
                if not s or s == '-' or (tg & OTHER_REGION):
                    continue
                if 'plural' in tg and 'masculine' in tg and not pls:
                    pls = s
                # Portuguese forms its comparative with `mais`, so the form is
                # only worth printing where it is SUPPLETIVE -- `bom` -> `melhor`,
                # `mau` -> `pior`.  `mais bonito` teaches nothing.
                if 'comparative' in tg and not comp and not s.startswith('mais '):
                    comp = s
            if pls and pls != word:
                bits.append(('plural', pls + (', ' + fpl if fem and fpl else '')))
            if comp:
                bits.append(('comparative', comp))
            break
    if not bits:
        return ''
    return '<div class="uc-forms">' + ''.join(
        f'<span class="uc-fi"><span class="uc-fl">{esc(a)}</span>{esc(b)}</span>'
        for a, b in bits) + '</div>'


def examples_html(exs):
    out = []
    for e in exs:
        pt, en, form = e['pt'], e['en'], e['form']
        pat = re.compile(r'(?<![0-9A-Za-zÀ-ÖØ-öø-ÿ])('
                         + re.escape(form)
                         + r')(?![0-9A-Za-zÀ-ÖØ-öø-ÿ])', re.I)
        shown = pat.sub(lambda m: '<b>' + esc(m.group(1)) + '</b>',
                        esc(pt), count=1)
        out.append('<div class="uc-exi">'
                   f'<div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{esc(pt)}"></span>{shown}</div>'
                   f'<div class="uc-exe">{esc(en)}</div></div>')
    return ''.join(out)


# ------------------------------------------------------- pairs, in a pre-pass
# Which words are paired, and which of them lose their own card, is settled
# before any card is built: the feminine may be listed before the masculine, and
# whichever comes first must already know the other is coming.
VOCAB = set(words)


def recs_of(word):
    return [r for r in W.get(word, []) if r.get('pos') in POS_NAME]


PAIR, MERGED = {}, {}
for word in words:
    if word in REFLEXIVE:
        PAIR[word] = ('', '')
        continue
    recs = recs_of(word)
    prim = pick_primary(word, recs)
    fem, fpl = pair_for(word, recs, prim)
    PAIR[word] = (fem, fpl)
    if fem and prim is not None and prim['pos'] == 'noun':
        nrec = next((r for r in recs if r['pos'] == 'noun'), None)
        if nrec is not None and merges_with(word, fem, nrec, VOCAB):
            MERGED[fem] = word
print('  gendered pairs:', sum(1 for v in PAIR.values() if v[0]),
      ' folded onto one card:',
      ', '.join(f'{m}+{f}' for f, m in MERGED.items()) or 'none')

GENDER_CLASS = {'m': 'uc-m', 'f': 'uc-f'}


def headword_html(headword, gender, reflexive=False, art=''):
    """The word as it is printed, with the article coloured for its gender.

    A REFLEXIVE'S OWN PRONOUN IS COLOURED HERE TOO, and it has to be: the card
    prints `chamar-se` at the top and the paradigm under it, and colouring the
    clitic in the table while hyphenating it in the headword two lines above
    shows a learner both spellings at once with nothing to say which is the
    rule.  The stored key keeps its hyphen -- this is the printed form only, and
    the word is still looked up, spoken and matched as `chamar-se`.

    IT COLOURS THE ARTICLE THE PIPELINE PUT THERE AND NEVER ONE IT FINDS IN THE
    STRING, which is a correction rather than a nicety.  Written as a regex over
    the headword it marked up any leading `a`/`o`, and the Referencial names
    several ADVERBIAL LOCUTIONS whose first word is the preposition `a`: `a fim
    de`, `a menos que`, `a não ser que`, `a distância`, `a seco`.  Five B2 cards
    therefore printed a preposition, a conjunction and an adverb with their
    first word set in the FEMININE-ARTICLE colour -- on a deck whose whole
    visual grammar is that the article's colour teaches the gender, that is the
    card contradicting its own gloss two lines below (the Goethe deck records
    the same fault the other way round, a label disagreeing with the article).
    Nothing threw, every count was right, and the only symptom was a colour.
    `art` is what the caller derived from the entry's own gender and is empty
    for everything that is not a noun, so the phrases now print plainly.
    """
    parts = []
    for i, half in enumerate(headword.split(', ')):
        if reflexive and half.endswith('-se'):
            parts.append(clitic_html(half[:-3] + marked('se')))
            continue
        m = re.match(r'^(o/a|os/as|os|as|o|a)\s+(.*)$', half) if art else None
        if m:
            g = ART_GENDER.get(m.group(1), '')
            cls = GENDER_CLASS.get(g, '')
            parts.append(f'<span class="{("uc-art " + cls).strip()}">'
                         f'{esc(m.group(1))}</span> {esc(m.group(2))}')
        else:
            parts.append(esc(half))
    return ', '.join(parts)


# ---------------------------------------------------------------- build
cards = []
stats = {'nouns with an article': 0, 'verbs with a paradigm': 0,
         'gendered pairs': 0, 'no examples': 0, 'reflexive': 0}
idx = 0

for word in words:
    if word in MERGED:            # taught on its masculine's card
        continue
    idx += 1
    reflexive = word in REFLEXIVE
    recs = recs_of(word)
    base = refl_base(word)
    if reflexive:
        recs = [r for r in W.get(base, []) if r.get('pos') in POS_NAME]

    vrec = next((r for r in recs if r['pos'] == 'verb'
                 and any(f.get('source') == 'conjugation'
                         for f in r.get('forms', []))), None)

    primary = pick_primary(word, recs) if not reflexive else vrec
    fem, fpl = PAIR.get(word, ('', ''))
    absorbed = fem if MERGED.get(fem) == word else ''

    # headword: a noun carries its article, and a word with a distinct feminine
    # carries it too -- `o professor, a professora`
    art, headword, gender = '', word, ''
    nrec = next((r for r in recs if r['pos'] == 'noun'), None)
    if (nrec is not None and not reflexive and primary is not None
            and primary['pos'] == 'noun'):
        gender = gender_of(nrec)
        art = article(word, gender)
        if art:
            headword = art + ' ' + word
            stats['nouns with an article'] += 1
    if fem:
        headword += ', ' + (article(fem, 'f') + ' ' if art else '') + fem
        stats['gendered pairs'] += 1

    # meanings
    senses = []
    if reflexive:
        senses.append(('verb', REFLEXIVE[word]))
        stats['reflexive'] += 1
    elif word in AUTHORED:
        senses.append((primary['pos'] if primary is not None else 'intj',
                       AUTHORED[word]))
    else:
        for r in ([primary] if primary is not None else recs):
            g = glosses_for(r)
            if g:
                senses.append((r['pos'], g))
                break
    if not senses:
        # Everything this word has is a cross-reference.  Printing it raw would
        # put "alternative form of X" on the card as if it were a translation,
        # so the meaning is recovered instead: from the tail of the gloss where
        # it carries one, else from the entry of the word it points at.
        for r in recs:
            got = []
            for sn in r.get('senses', []):
                g = (sn.get('glosses') or [''])[0]
                if not g:
                    continue
                if sn.get('form_of') or sn.get('alt_of'):
                    if ':' in g:
                        got.append(g.split(':', 1)[1].strip())
                        continue
                    tgt = ((sn.get('form_of') or sn.get('alt_of'))[0]
                           or {}).get('word', '')
                    for br in W.get(tgt, []):
                        bg = glosses_for(br)
                        if bg:
                            got.extend(bg)
                            break
                    continue
                got.append(tidy(g))
            got = [x for i, x in enumerate(got) if x and x not in got[:i]][:2]
            if got:
                senses.append((r['pos'], got))
                break

    # A pair that has swallowed the feminine's own card gives its meaning too --
    # `o pai, a mãe` above "father" alone reads as a card that has lost half of
    # itself.  One gloss each, so the two lines answer to the two words.
    if absorbed and senses:
        fprim = pick_primary(absorbed, recs_of(absorbed))
        fg = glosses_for(fprim, limit=1) if fprim is not None else []
        if fg and fg[0] != senses[0][1][0]:
            senses[0] = (senses[0][0], [senses[0][1][0], fg[0]])

    def pos_label(p, _g=gender, _fem=fem):
        lab = POS_NAME.get(p, p)
        if p == 'noun' and _g:
            lab += (', masculine and feminine' if _fem else
                    ', masculine or feminine' if _g.startswith(('mf', 'm-f')) else
                    ', masculine' if _g.startswith('m') else
                    ', feminine' if _g.startswith('f') else '')
        return lab

    english = ''.join(
        f'<div class="uc-sense"><div class="uc-pos">{esc(pos_label(p))}</div>'
        f'{meanings_html(g)}</div>'
        for p, g in senses)

    # THE PARADIGM BELONGS TO THE WORD THE CARD IS TEACHING, and a Portuguese
    # infinitive is very often a noun as well: `o jantar` is dinner and `jantar`
    # is to dine, `a colher` is a spoon and `colher` is to harvest, `o colar` a
    # necklace and `colar` to glue.  Emitted on the strength of a verb record
    # alone, those four cards print a noun's headword and gloss over a
    # conjugation of a different word -- and `o prazer` printed the defective
    # paradigm of `prazer` "to please" under the noun `pleasure`.  Nothing else
    # can see it: the card is well formed and the table is correct, it is simply
    # about something the card does not claim to teach.
    show_conj = reflexive or (primary is not None and primary['pos'] == 'verb')
    conj = (conjugation_html(word, vrec, reflexive)
            if vrec is not None and show_conj else '')
    if conj:
        stats['verbs with a paradigm'] += 1
    forms = forms_html(word, recs, primary, (fem, fpl)) if not conj else ''
    exs = EX.get(word, [])
    if not exs:
        stats['no examples'] += 1

    plain = '; '.join(meaning_lines(senses[0][1], cap=3)) if senses else ''
    speak = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', headword)).strip()

    cards.append({
        # ONE NOTE, TWO CARDS.  The two directions are card TEMPLATES of a
        # single type, so a corrected gloss is corrected both ways at once and
        # each direction still keeps a schedule of its own.  The id carries the
        # DECK, because a file import only mints fresh card ids when the deck id
        # already exists -- so two levels sharing an id prefix would overwrite
        # each other in the shared store, silently, with both decks on the shelf.
        'id': f'u_{DECK_IDS[LEVEL]}_{idx}', 'num': str(idx),
        'category': 'CAPLE ' + LEVEL.upper(),
        'sub': '',
        'question': headword, 'answer': plain,
        'answerDate': '', 'traditional': '', 'hanzi': '', 'pinyin': '',
        'translations': '', 'abstract': '', 'citation': '',
        'answerText': plain,
        'type': 'caple',
        'fields': {
            'Portuguese': headword_html(headword, gender, reflexive, art),
            'Word': speak,
            'English': english,
            'Forms': forms,
            'Conjugation': conj,
            'Examples': examples_html(exs),
        },
    })

# THE GUARD LOOKS AT THE MEANING AND NOT AT THE FIELD, which always carries the
# part-of-speech label and so is never empty.
blank = [c['question'] for c in cards if not c['answerText'].strip()]
if blank:
    raise SystemExit('cards with no meaning at all: ' + ' | '.join(blank))
print('  cards:', len(cards), dict(stats))
if _meso_missed:
    print(f'  ! {len(_meso_missed)} future/conditional forms took no mesoclisis '
          f'and shipped as enclisis: {" ".join(sorted(set(_meso_missed))[:12])}')
if _pronominal_tables:
    print('  already-pronominal tables, pronoun re-marked rather than added: '
          + ', '.join(sorted(set(_pronominal_tables))))
json.dump(cards, open(lvlf('cards.json'), 'w'), ensure_ascii=False)
