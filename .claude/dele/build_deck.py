#!/usr/bin/env python3
"""Assemble one level's DELE Spanish deck."""
import json, re, html
from dele_level import LEVEL, DECK_IDS, f as lvlf

words = json.load(open(lvlf('wordlist.json')))
W = json.load(open(lvlf('wikt.json')))
BASES = json.load(open(lvlf('wikt_bases.json')))
EX = json.load(open(lvlf('examples.json')))

esc = lambda s: html.escape(s, quote=True)

# ---------------------------------------------------------------- senses
# tags that make a sense the wrong thing to teach a beginner
BAD_TAGS = {'form-of', 'alt-of', 'vulgar', 'slang', 'offensive', 'derogatory',
            'archaic', 'obsolete', 'dated', 'historical', 'uncommon', 'rare',
            'poetic', 'literary', 'euphemistic', 'abbreviation', 'ellipsis',
            'humorous', 'childish', 'dialectal', 'obscure'}

def sense_rank(s):
    """Lower is better.  A capitalised tag is a place or a register label
    (Spain, Mexico, Rioplatense, Internet); those senses are demoted rather
    than dropped, so a word whose only senses are regional still gets one."""
    # DELE is set by the Instituto Cervantes, so a peninsular sense is the one
    # the exam means: `movil` is a mobile phone in Spain and a Calder sculpture
    # everywhere else, and demoting Spain put the sculpture on the card.
    t = [x for x in s.get('tags', []) if x != 'Spain']
    n = sum(1 for x in t if x[:1].isupper())
    # `queso` is cheese, and in Spain also slang for a foot; a register label is
    # not a reason to drop a sense, but it is a reason to prefer a plain one
    n += sum(1 for x in t if x in ('colloquial', 'informal', 'figuratively', 'broadly'))
    return n

def tidy(g):
    """A card wants a translation, not a dictionary definition.

    Wiktionary glosses carry a disambiguating parenthetical that is often
    longer than the gloss -- "plant (an organism of the kingdom Plantae, and
    now specifically, ...)".  Cutting at 96 characters left the card reading
    "a living organism of the"; dropping the parenthetical leaves "plant".
    """
    g = re.sub(r'\s*\[[^\]]*\]', '', g).strip(' ;,')
    g = re.sub(r'\s*[;,]?\s*\b(fe)?male equivalent of \S+', '', g, flags=re.I)
    g = re.sub(r'^\s*(alternative (form|letter-case form)|clipping|apocopic form) of \S+\s*[;:,]?\s*',
               '', g, flags=re.I).strip(' ;,')
    if len(g) > 58 and ' (' in g:
        head = re.sub(r'\s*\([^)]*\)', '', g).strip(' ;,')
        if len(head) >= 3:
            g = head
    # A gloss is sometimes a DEFINITION rather than a translation, and then the
    # translation is its head: `carne` is glossed "flesh, the soft part of a
    # body which covers the bones", so the card said that instead of "meat" --
    # and the real sense, "an animal's meat, or by extension...", was 89
    # characters and fell off the end of the length budget.  Where the leading
    # comma-separated pieces are short and one long piece follows, the short
    # ones are the word and the long one is the explanation.
    if len(g) > 48 and ',' in g:
        parts = [x.strip() for x in g.split(',')]
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
    return g

def glosses_for(rec, limit=2):
    out = []
    # a sense carrying a form_of FIELD is a cross-reference, not a translation:
    # `santa` offered "saintess" and then "female equivalent of santo".  The
    # 'form-of' TAG alone does not catch it -- Wiktionary does not always set it.
    cands = [s for s in rec.get('senses', [])
             if not (BAD_TAGS & set(s.get('tags', [])))
             and not (s.get('form_of') or s.get('alt_of')) and s.get('glosses')]
    if any(sense_rank(s) == 0 for s in cands):
        cands = [s for s in cands if sense_rank(s) == 0]
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

from reflexives import GLOSS as REFL_GLOSS, report_missing
report_missing(words, 'build_deck.py')

# Wiktionary's entry for `gustar` is a note on how the verb is analysed rather
# than a meaning ('translated as "to like", analyzable in structure as "to
# please" [with dative...]'), which is no use on a card
# and `quizás`, whose entire Wiktionary entry is "alternative form of quizá" --
# a pointer at a word the extraction does not carry, so there is nothing to
# follow it to
# and `hecho`, whose commonest meaning by far -- "el hecho de que", "de hecho" --
# Wiktionary tags ARCHAIC, so the sense filter drops it and the card came out
# "act, deed"
AUTHORED = {'gustar': ['to like (literally: to please)'],
            'quizás': ['maybe, perhaps'],
            'hecho': ['fact', 'act, deed'],
            # "alternative form of por lo que respecta a", which the extraction
            # does not carry either -- the `quizás` shape on a phrase
            'en lo que respecta a': ['as regards, with regard to']}

# grammar words Wiktionary files as a form of another word ("muy: apocopic form
# of mucho"), which leaves the card with no meaning on it
CLOSED_GLOSS = {
    'ellos': ['they, them'], 'me': ['me, to me, myself'],
    'eso': ['that (neuter)'], 'unas': ['some, a few'],
    'muy': ['very'], 'tu': ['your'], 'su': ['his, her, its, their, your (formal)'],
    # every plain sense of the object pronoun is filed as a form of `tú`
    'te': ['you (object of a verb)', 'yourself'],
}

# and the plural-only words, which it files under a singular nobody uses
PLURAL_GLOSS = {
    'gafas': ['glasses, spectacles'], 'vacaciones': ['holiday, vacation'],
    'matemáticas': ['mathematics, maths'], 'vaqueros': ['jeans'],
    'deberes': ['homework'], 'padres': ['parents'],
}

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'num': 'numeral', 'intj': 'interjection',
            'det': 'determiner', 'prep': 'preposition', 'conj': 'conjunction',
            'article': 'article', 'particle': 'particle'}

# ---------------------------------------------------------------- gender
# a feminine noun beginning with a stressed a- takes `el` in the singular
EL_FEM = {'agua', 'aula', 'área', 'alma', 'hambre', 'águila', 'hacha', 'arma', 'ala'}

def gender_of(rec):
    ht = rec.get('head_templates') or [{}]
    a = ht[0].get('args', {})
    g = a.get('1') or a.get('g') or ''
    if g in ('es',):
        g = a.get('g', '')
    return g

# --------------------------------------------------------- male/female pairs
# A word with a distinct feminine is one word wearing two endings, not two
# words, so it is taught on one card: `el nino, la nina` over `los ninos, las
# ninas`.  NOTHING IS DERIVED HERE.  The naive rule -- swap a final -o for -a,
# add -a to a consonant -- gets `senor` wrong ("senoa"), and gets every
# suppletive pair wrong (padre/madre, rey/reina, caballo/yegua).  kaikki has
# already expanded Wiktionary's own template arguments into the record's `forms`
# list, tagged ['feminine'] and ['feminine','plural'], so the four costumes the
# argument wears -- an explicit word, `+` for the default derivation, `#` for
# the headword itself, `#a` for the headword plus -a -- have all been resolved
# before this code ever sees them.  Read the forms; never compose one.
def fem_forms(rec, word):
    """The feminine singular and plural of a record, or ('', '')."""
    mpl = ''
    fems, fpls = [], []
    for f in rec.get('forms', []):
        tg = set(f.get('tags') or [])
        s = f.get('form', '')
        if not s or s == '-' or 'table-tags' in tg:
            continue
        if 'feminine' in tg:
            (fpls if 'plural' in tg else fems).append(s)
        elif 'plural' in tg and not mpl and 'masculine' not in tg:
            mpl = s
    # a common-gender noun lists the headword itself as its own feminine
    # (`el/la cliente`), so the pair is the first form that is a different word
    fem = next((s for s in fems if s != word), '')
    if not fem:
        return '', ''
    fpl = next((s for s in fpls if s == fem + 's'), '') or \
          next((s for s in fpls if s != mpl), '')
    return fem, fpl

def merges_with(word, fem, rec, vocab):
    """Should the feminine's own card be folded into the masculine's?

    Only where the two are genuinely one entry seen from both sides, which is
    what stops `caro`/`cara` (dear/face), `medio`/`media` (half/stocking),
    `politico`/`politica` and `chino`/`china` being merged: each of those is a
    real feminine FORM of the masculine and also, separately, a noun of its own,
    and the deck teaches the noun.  Two signals separate them, and either will
    do -- the feminine's own entry points back at this word (`senora` carries
    `senor` as its masculine, `nina` carries `nino`), or this word's entry names
    the feminine outright rather than deriving it (`rey` names `reina`).  Every
    false pair above is a bare `+` derivation with no back-link.
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

# Wiktionary's record order decides which sense a card teaches, and for a
# handful of words it puts the one a beginner does not want first: `cafe` as
# "brown" rather than coffee, `periodico` as "periodic", `movil` as "mobile",
# and `guapo` as "arrowroot".
#
# THE LAST THREE ARE THE WORST OF IT AND THE EASIEST TO MISS: Wiktionary gives
# every Spanish letter a NOUN entry named after it, and files it first.  So
# `de`, `te` and `ese` -- the preposition, the object pronoun and the
# demonstrative, three of the commonest words in the language -- came out as
# `la de`, `la te` and `la ese`, glossed "the name of the Latin script letter
# D/d".  Each read as a perfectly well-formed noun card with an article and a
# plural, which is why nothing downstream complained.
#
# AND A PAST PARTICIPLE IS FILED BEFORE THE NOUN IT SHARES ITS SPELLING WITH,
# which is a whole class rather than a handful once the vocabulary gets past
# A2: `hecho` came out as "done, completed" rather than "the fact", `sentido`
# as "deeply felt", `vestido` as "dressed" rather than "a dress", `atentado`
# as "moderate, prudent" rather than "an attack".  Each is a well-formed
# adjective card carrying a real sense of the word -- and the wrong one for a
# learner, since it is the noun the inventory lists.  They are named because
# the test cannot be mechanical: `preparado`, `ocupado`, `perdido`, `mojado`
# and thirty more of the same shape genuinely want the adjective.
FORCE_POS = {'café': 'noun', 'periódico': 'noun', 'móvil': 'noun', 'chico': 'noun',
             'norte': 'noun', 'animal': 'noun', 'tarde': 'noun',
             'primero': 'adj', 'guapo': 'adj',
             'de': 'prep', 'te': 'pron', 'ese': 'det',
             # B1
             'titular': 'noun', 'hecho': 'noun', 'sentido': 'noun', 'vestido': 'noun',
             'ladrón': 'noun', 'tamaño': 'noun', 'plata': 'noun', 'ayudante': 'noun',
             'aniversario': 'noun', 'horario': 'noun', 'presupuesto': 'noun',
             'ciudadano': 'noun', 'contenedor': 'noun', 'aficionado': 'noun',
             'atentado': 'noun', 'cereza': 'noun', 'contestador': 'noun',
             'buscador': 'noun', 'sustituto': 'noun', 'cazador': 'noun',
             'pescador': 'noun', 'veterinario': 'noun', 'bailarín': 'noun',
             'vigilante': 'noun', 'perdedor': 'noun', 'ganador': 'noun',
             'voluntario': 'noun', 'diario': 'noun', 'anciano': 'noun',
             'resfriado': 'noun', 'anular': 'verb'}

def has_real_sense(r):
    return any(not (x.get('form_of') or x.get('alt_of')) for x in r.get('senses', []))

def pick_primary(word, recs):
    want = FORCE_POS.get(word)
    p = next((r for r in recs if r['pos'] == want and has_real_sense(r)), None) if want else None
    if p is None and want:
        p = next((r for r in recs if r['pos'] == want), None)
    return p or next((r for r in recs if has_real_sense(r)), recs[0] if recs else None)

def pair_for(word, recs, primary, reflexive):
    """The feminine to set beside the headword, and its plural, or ('', '').

    Read off the record the CARD teaches, never off the first one that happens
    to carry a feminine: `mano` has a masculine record meaning "bro" whose
    feminine is "mana", and the card is about the hand.
    """
    if reflexive or primary is None:
        return '', ''
    if primary['pos'] == 'adj':
        return fem_forms(primary, word)
    if primary['pos'] != 'noun':
        return '', ''
    nrec = next((r for r in recs if r['pos'] == 'noun'), None)
    if nrec is None:
        return '', ''
    g = gender_of(nrec)
    # a common-gender noun is already given as `el/la juez`, and a plural-only
    # one has no singular pair to make
    if not g.startswith('m') or g.startswith(('mf', 'm-f', 'm-p')):
        return '', ''
    return fem_forms(nrec, word)

def article(word, g):
    if g.startswith('m-p'):
        return 'los'
    if g.startswith('f-p'):
        return 'las'
    if g in ('mf', 'mfbysense', 'm-f'):
        return 'el/la'
    if g.startswith('f'):
        return 'el' if word in EL_FEM else 'la'
    if g.startswith('m'):
        return 'el'
    return ''

# ---------------------------------------------------------------- conjugation
PERSONS = [('first-person', 'singular', 'yo'),
           ('second-person', 'singular', 'tú'),
           ('third-person', 'singular', 'él, ella, usted'),
           ('first-person', 'plural', 'nosotros'),
           ('second-person', 'plural', 'vosotros'),
           ('third-person', 'plural', 'ellos, ellas, ustedes')]

TENSES = [
    ('Indicativo', 'Presente',              lambda t: 'indicative' in t and 'present' in t and 'subjunctive' not in t),
    ('Indicativo', 'Pretérito imperfecto',  lambda t: 'indicative' in t and 'imperfect' in t),
    ('Indicativo', 'Pretérito indefinido',  lambda t: 'indicative' in t and 'preterite' in t),
    ('Indicativo', 'Futuro simple',         lambda t: 'indicative' in t and 'future' in t),
    ('Indicativo', 'Condicional simple',    lambda t: 'conditional' in t),
    ('Subjuntivo', 'Presente',              lambda t: 'subjunctive' in t and 'present' in t),
    ('Subjuntivo', 'Pretérito imperfecto (-ra)', lambda t: 'subjunctive' in t and 'imperfect' in t and 'imperfect-se' not in t),
    ('Subjuntivo', 'Pretérito imperfecto (-se)', lambda t: 'subjunctive' in t and 'imperfect-se' in t),
    ('Subjuntivo', 'Futuro simple',         lambda t: 'subjunctive' in t and 'future' in t),
]

IMP_ROWS = [('tú',                     lambda t: 'second-person' in t and 'singular' in t and 'formal' not in t),
            ('usted',                  lambda t: 'formal' in t and 'singular' in t),
            ('nosotros',               lambda t: 'first-person' in t and 'plural' in t),
            ('vosotros',               lambda t: 'second-person' in t and 'plural' in t and 'formal' not in t),
            ('ustedes',                lambda t: 'formal' in t and 'plural' in t)]

CLITIC = {'yo': 'me', 'tú': 'te', 'él, ella, usted': 'se', 'nosotros': 'nos',
          'vosotros': 'os', 'ellos, ellas, ustedes': 'se'}
IMP_CLITIC = {'tú': 'te', 'usted': 'se', 'nosotros': 'nos', 'vosotros': 'os', 'ustedes': 'se'}

VOWEL_ACCENT = {'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú'}

def conj_forms(rec):
    """form list -> {tagset: [forms]} for the plain paradigm only."""
    out = []
    for f in rec.get('forms', []):
        tg = set(f.get('tags', []))
        s = f.get('form', '')
        if not s or s == '-' or f.get('source') != 'conjugation':
            continue
        if tg & {'table-tags', 'inflection-template', 'combined-form', 'vos-form'}:
            continue
        out.append((tg, s))
    return out

def pick(forms, tags_ok, extra=None):
    for tg, s in forms:
        if tags_ok(tg) and (extra is None or extra(tg)):
            return s
    return ''

def enclitic_gerund(ger, clitic):
    """hablando + se -> hablándose : the stress stays where it was, so the
    vowel of -ando/-iendo takes a written accent once a syllable is added."""
    m = re.search(r'(a|ie)ndo$', ger)
    if not m:
        return ger + clitic
    i = m.start()
    v = ger[i]
    return ger[:i] + VOWEL_ACCENT.get(v, v) + ger[i + 1:] + clitic

def conjugation_html(word, rec, reflexive, show_refl_nonfinite=None):
    forms = conj_forms(rec)
    if not forms:
        return ''
    inf = pick(forms, lambda t: 'infinitive' in t)
    ger = pick(forms, lambda t: 'gerund' in t)
    par = pick(forms, lambda t: 'participle' in t and 'past' in t and 'masculine' in t and 'singular' in t) \
          or pick(forms, lambda t: 'participle' in t and 'past' in t)
    if show_refl_nonfinite is None:
        show_refl_nonfinite = reflexive
    if show_refl_nonfinite:
        inf = word
        if ger and not ger.endswith('se'):
            ger = enclitic_gerund(ger, 'se')

    p = []
    nf = []
    if inf: nf.append(('infinitivo', inf))
    if ger: nf.append(('gerundio', ger))
    if par: nf.append(('participio', par))
    if nf:
        p.append('<div class="uc-cj-nf">' + ''.join(
            f'<span class="uc-cj-nfi"><i>{esc(a)}</i><b>{esc(b)}</b></span>' for a, b in nf) + '</div>')

    blocks_by_mood = {}
    for mood, name, test in TENSES:
        rows = []
        for per, num, label in PERSONS:
            s = pick(forms, test, lambda t, p_=per, n_=num: p_ in t and n_ in t)
            if not s:
                rows.append((label, ''))
                continue
            if reflexive:
                s = CLITIC[label] + ' ' + s
            rows.append((label, s))
        if not any(r[1] for r in rows):
            continue
        blocks_by_mood.setdefault(mood, []).append((name, rows))

    # imperative: the affirmative attaches the pronoun, the negative keeps it in
    # front, which is why the two are built separately rather than as one tense
    for neg in (False, True):
        rows = []
        for label, test in IMP_ROWS:
            s = pick(forms, lambda t: 'imperative' in t and (('negative' in t) == neg),
                     lambda t, f_=test: f_(t))
            if not s:
                rows.append((label, ''))
                continue
            if reflexive:
                cl = IMP_CLITIC[label]
                if neg:
                    s = cl + ' ' + s
                else:
                    if label == 'vosotros' and s.endswith('d'):
                        s = s[:-1] + 'os'          # levantad + os -> levantaos
                    elif label == 'nosotros' and s.endswith('s') and cl == 'nos':
                        s = add_stress(s[:-1] + 'nos')
                    else:
                        s = add_stress(s + cl)
            if neg:
                s = 'no ' + s
            rows.append((label, s))
        if any(r[1].replace('no ', '') for r in rows):
            blocks_by_mood.setdefault('Imperativo', []).append(
                ('Afirmativo' if not neg else 'Negativo', rows))

    for mood in ('Indicativo', 'Subjuntivo', 'Imperativo'):
        bl = blocks_by_mood.get(mood)
        if not bl:
            continue
        p.append(f'<div class="uc-cj-mood">{mood}</div><div class="uc-cj-grid">')
        for name, rows in bl:
            cells = ''.join(
                f'<div class="uc-cj-r"><span class="uc-cj-p">{esc(lab)}</span>'
                f'<span class="uc-cj-f">{esc(v) if v else "—"}</span></div>'
                for lab, v in rows)
            p.append(f'<div class="uc-cj-t"><div class="uc-cj-h">{esc(name)}</div>{cells}</div>')
        p.append('</div>')
    return ''.join(p)

STRESS_OK = re.compile(r'[áéíóú]')

def add_stress(s):
    """levanta + te -> levántate.  Attaching a pronoun adds a syllable without
    moving the stress, so the vowel that was stressed now needs a written
    accent.  Only applied where the word has none already."""
    if STRESS_OK.search(s):
        return s
    # the u of `que/qui` and `gue/gui` is silent and is not a vowel to count:
    # counting it accented `dedique + se` as `dediquese` rather than `dediquese`
    vowels = [i for i, c in enumerate(s)
              if c in 'aeiou'
              and not (c == 'u' and i > 0 and s[i - 1] in 'qg'
                       and i + 1 < len(s) and s[i + 1] in 'ei')]
    if len(vowels) < 3:
        return s
    i = vowels[-3]                      # the stressed vowel of the bare verb form
    return s[:i] + VOWEL_ACCENT[s[i]] + s[i + 1:]


# ---------------------------------------------------------------- meanings
def comma_parts(s):
    """Split a gloss on commas, but only where every piece stands on its own.

    "glasses, spectacles" and "to get up, to stand up" are two translations
    apiece and read better on two lines.  "leader of a business, political
    party, or other organization" is ONE, and splitting it yields the nonsense
    "political party" and "or other organization" -- so a comma only separates
    when the pieces are short, few, and none of them opens on a continuation.
    """
    parts = [x.strip() for x in s.split(',')]
    if len(parts) < 2 or len(parts) > 3:
        return [s]
    for p in parts:
        if not p or len(p) > 24 or re.match(r'(or|and|nor|but)\b', p):
            return [s]
    return parts

def meaning_lines(glosses, cap=5):
    out = []
    for g in glosses:
        for semi in g.split(';'):
            semi = semi.strip(' ;,')
            if not semi:
                continue
            for part in comma_parts(semi):
                part = part.strip(' ;,')
                if not part or part in out:
                    continue
                # a piece that is nothing BUT a parenthetical qualifies the
                # meaning before it -- "man" / "(adult male human)" is one
                # meaning split in two.  "(US) college" carries a word after
                # the bracket and is a meaning in its own right.
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
def forms_html(word, recs, primary, pair):
    """The line under the headword.  A paired word gives BOTH plurals on it --
    `los ninos, las ninas` -- since the feminine is already on the headword and
    a separate `feminine` row would say it twice."""
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
                if 'plural' in tg and 'feminine' not in tg and f.get('form') not in ('', '-'):
                    pl = f['form']; break
            # `el lunes` pluralises to `los lunes`: the noun does not change but
            # the article does, which is the half of it worth learning.  A noun
            # that is already plural (las gafas) has none to give.
            if pl and not g.startswith(('f-p', 'm-p')):
                a = ('los/las' if g.startswith(('mf', 'm-f')) else
                     'las' if g.startswith('f') else 'los' if g.startswith('m') else '')
                v = (a + ' ' if a else '') + pl
                if fem and fpl:
                    v += ', las ' + fpl
                bits.append(('plural', v))
            break
        if pos == 'adj':
            pls = ''
            for f in rec.get('forms', []):
                tg = set(f.get('tags', [])); s = f.get('form', '')
                if not s or s == '-':
                    continue
                if 'plural' in tg and 'masculine' in tg and not pls:
                    pls = s
            if pls and pls != word:
                bits.append(('plural', pls + (', ' + fpl if fem and fpl else '')))
            break
    if not bits:
        return ''
    return '<div class="uc-forms">' + ''.join(
        f'<span class="uc-fi"><span class="uc-fl">{esc(a)}</span>{esc(b)}</span>' for a, b in bits) + '</div>'

def examples_html(word, exs):
    out = []
    for e in exs:
        es, en, form = e['es'], e['en'], e['form']
        # pick the matched form out of the sentence and set it apart
        pat = re.compile(r'(?<![0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ])(' + re.escape(form) +
                         r')(?![0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ])', re.I)
        shown = pat.sub(lambda m: '<b>' + esc(m.group(1)) + '</b>', esc(es), count=1)
        out.append('<div class="uc-exi">'
                   f'<div class="uc-exz"><span class="uc-tts uc-exsay" data-say="{esc(es)}"></span>{shown}</div>'
                   f'<div class="uc-exe">{esc(en)}</div></div>')
    return ''.join(out)

# ------------------------------------------------------- pairs, in a pre-pass
# Which words are paired, and which of them lose their own card, is settled
# before any card is built: `nina` may be listed before `nino`, and whichever
# comes first must already know the other is coming.
VOCAB = set(words)

def recs_of(word):
    return [r for r in W.get(word, []) if r.get('pos') in POS_NAME]

PAIR, MERGED = {}, {}
for word in words:
    recs = recs_of(word)
    refl = word.endswith(('arse', 'erse', 'irse')) and word[:-2] in BASES
    prim = pick_primary(word, recs)
    fem, fpl = pair_for(word, recs, prim, refl)
    PAIR[word] = (fem, fpl)
    if fem and prim is not None and prim['pos'] == 'noun':
        nrec = next((r for r in recs if r['pos'] == 'noun'), None)
        if nrec is not None and merges_with(word, fem, nrec, VOCAB):
            MERGED[fem] = word
print('gendered pairs:', sum(1 for v in PAIR.values() if v[0]),
      ' folded onto one card:', ', '.join(f'{m}+{f}' for f, m in MERGED.items()) or 'none')

# ---------------------------------------------------------------- build
cards, n, idx = [], 0, 0
stats = {'noun': 0, 'verb': 0, 'conj': 0, 'article': 0, 'noexample': 0}

for word in words:
    if word in MERGED:            # taught on its masculine's card
        continue
    idx += 1
    recs = recs_of(word)
    # a verb paradigm may live on the base of a reflexive
    reflexive = word.endswith(('arse', 'erse', 'irse')) and word[:-2] in BASES
    vrec = None
    for r in recs:
        if r['pos'] == 'verb' and any(f.get('source') == 'conjugation' for f in r.get('forms', [])):
            vrec = r; break
    derived = False
    if reflexive and vrec is None:
        vrec = next((r for r in BASES[word[:-2]] if r['pos'] == 'verb'), None)
        derived = vrec is not None

    primary = pick_primary(word, recs)
    fem, fpl = PAIR[word]
    absorbed = fem if MERGED.get(fem) == word else ''

    # headword: a noun carries its article, and a word with a distinct feminine
    # carries it too -- `el nino, la nina`, `rojo, roja`
    art, headword, gender = '', word, ''
    nrec = next((r for r in recs if r['pos'] == 'noun'), None)
    if nrec is not None and not reflexive and primary is not None and primary['pos'] == 'noun':
        gender = gender_of(nrec)
        art = article(word, gender)
        if art:
            headword = art + ' ' + word
            stats['article'] += 1
    if fem:
        headword += ', ' + (article(fem, 'f') + ' ' if art else '') + fem

    # meanings
    senses = []
    if word in AUTHORED:
        senses.append((primary['pos'] if primary is not None else 'verb', AUTHORED[word]))
    elif word in REFL_GLOSS:
        senses.append(('verb', REFL_GLOSS[word]))
    elif word in CLOSED_GLOSS:
        senses.append((primary['pos'] if primary is not None else 'particle', CLOSED_GLOSS[word]))
    elif word in PLURAL_GLOSS:
        senses.append(('noun', PLURAL_GLOSS[word]))
    else:
        # the primary part of speech only: a second group is nearly always a
        # marginal record of the same string -- `tu` as an interjection,
        # `grande` as "a grandee", `pero` as "an objection"
        for r in ([primary] if primary is not None else recs):
            g = glosses_for(r)
            if g:
                senses.append((r['pos'], g))
                break
    if not senses:
        # Everything this word has is a cross-reference.  Printing it raw put
        # "alternative form of quizá" and "female equivalent of santo" on cards
        # as if they were translations, so the meaning is recovered instead:
        # from the tail of the gloss where it carries one ("female equivalent of
        # chico: girl"), else from the entry of the word it points at.
        for r in recs:
            got = []
            for sn in r.get('senses', []):
                g = (sn.get('glosses') or [''])[0]
                if not g:
                    continue
                if (sn.get('form_of') or sn.get('alt_of')):
                    if ':' in g:
                        got.append(g.split(':', 1)[1].strip())
                        continue
                    base = ((sn.get('form_of') or sn.get('alt_of'))[0] or {}).get('word', '')
                    for br in W.get(base, []):
                        bg = glosses_for(br)
                        if bg:
                            got.extend(bg); break
                    continue
                got.append(tidy(g))
            got = [x for i, x in enumerate(got) if x and x not in got[:i]][:2]
            if got:
                senses.append((r['pos'], got)); break

    # A pair that has swallowed the feminine's own card gives its meaning too --
    # `el padre, la madre` above "father" alone reads as a card that has lost
    # half of itself.  One gloss each, so the two lines answer to the two words.
    if absorbed and senses:
        fprim = pick_primary(absorbed, recs_of(absorbed))
        fg = glosses_for(fprim, limit=1) if fprim is not None else []
        if fg and fg[0] != senses[0][1][0]:
            senses[0] = (senses[0][0], [senses[0][1][0], fg[0]])

    def pos_label(p):
        lab = POS_NAME.get(p, p)
        if p == 'noun' and gender:
            g = gender
            lab += (', masculine and feminine' if fem else
                    ', masculine' if g.startswith('m') and 'f' not in g[:2] else
                    ', feminine' if g.startswith('f') else
                    ', masculine or feminine' if g.startswith(('mf', 'm-f')) else '')
        return lab

    english = ''.join(
        f'<div class="uc-sense"><div class="uc-pos">{esc(pos_label(p))}</div>'
        f'{meanings_html(g)}</div>'
        for p, g in senses)

    conj = conjugation_html(word, vrec, derived, reflexive) if vrec is not None else ''
    if conj:
        stats['conj'] += 1
    forms = forms_html(word, recs, primary, (fem, fpl)) if not conj else ''
    exs = EX.get(word, [])
    if not exs:
        stats['noexample'] += 1
    exhtml = examples_html(word, exs)
    plain = "; ".join(g for _, g in senses for g in g) if senses else ''
    plain = "; ".join(senses[0][1]) if senses else ''

    fields = {'Spanish': headword, 'Word': headword, 'English': english,
              'Forms': forms, 'Conjugation': conj, 'Examples': exhtml}

    # ONE NOTE PER WORD, TWO CARDS (Aug 2026, on request: the long-press menu's
    # "Both directions together" switch was missing on these decks and present
    # on the Mandarin ones).  A word used to be written out TWICE, once per
    # direction, as two notes in two subdecks -- and every field of the two was
    # identical, so the file was twice the size it needed to be and a definition
    # corrected on one of them drifted silently from the other.
    #
    # The switch is what forced it rather than merely rewarding it.  It gathers
    # a NOTE's cards, and `entryHasSiblings` draws it only where some note in
    # the entry makes more than one card, so a deck of one-card notes cannot
    # have it however it is arranged: direction as a `sub` is a fact about the
    # note, and two notes are two words as far as the scheduler is concerned.
    # Written as one note whose TYPE carries two templates, the two directions
    # come back as the DIRECTION ROWS app.js lists under a level (`#0` / `#1`
    # entries), so they are still separately addable and studiable -- and the
    # switch, sibling burying and a single record per word come for free.
    n += 1
    cards.append({
        # THE ID CARRIES THE DECK, and did not until Aug 2026: both levels
        # wrote `u_delea1_N`, and a file import only mints fresh ids when
        # the DECK id already exists -- which `delea2` does not -- so
        # installing A2 after A1 overwrote A1's cards in the shared store
        # one for one, silently, with both decks still on the shelf.
        'id': f'u_{DECK_IDS[LEVEL]}_{n}', 'num': str(idx),
        'category': 'DELE ' + LEVEL.upper(),
        # No subdeck: the level IS the deck, and the two directions are the
        # type's templates rather than two piles of cards.
        'sub': '',
        'question': headword,
        'answer': plain,
        'answerDate': '', 'traditional': '', 'hanzi': '', 'pinyin': '',
        'translations': '', 'abstract': '', 'citation': '',
        'answerText': plain,
        'type': 'es-en', 'fields': dict(fields),
    })

blank = [c['fields']['Spanish'] for c in cards
         if not re.sub(r'<[^>]+>', '', c['fields']['English']).strip()]
if blank:
    raise SystemExit('cards with no meaning at all: ' + ', '.join(blank))
print('cards:', len(cards), 'stats:', stats)
json.dump(cards, open(lvlf('cards.json'), 'w'), ensure_ascii=False)
