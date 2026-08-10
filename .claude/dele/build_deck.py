#!/usr/bin/env python3
"""Assemble the DELE A1 Spanish deck."""
import json, re, html

words = json.load(open('wordlist500.json'))
W = json.load(open('wikt.json'))
BASES = json.load(open('wikt_bases.json'))
EX = json.load(open('examples.json'))

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
    return sum(1 for x in t if x[:1].isupper())

def tidy(g):
    """A card wants a translation, not a dictionary definition.

    Wiktionary glosses carry a disambiguating parenthetical that is often
    longer than the gloss -- "plant (an organism of the kingdom Plantae, and
    now specifically, ...)".  Cutting at 96 characters left the card reading
    "a living organism of the"; dropping the parenthetical leaves "plant".
    """
    g = re.sub(r'\s*\[[^\]]*\]', '', g).strip(' ;,')
    if len(g) > 58 and ' (' in g:
        head = re.sub(r'\s*\([^)]*\)', '', g).strip(' ;,')
        if len(head) >= 3:
            g = head
    if len(g) > 92:
        cut = g.rfind(';', 0, 92)
        g = (g[:cut] if cut > 24 else g[:92].rsplit(' ', 1)[0]).rstrip(' ;,(')
    return g

def glosses_for(rec, limit=2):
    out = []
    cands = [s for s in rec.get('senses', [])
             if not (BAD_TAGS & set(s.get('tags', []))) and s.get('glosses')]
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

# Wiktionary files a reflexive as a form of its base verb and gives it no
# meaning of its own, so these are authored.
# Wiktionary's entry for `gustar` is a note on how the verb is analysed rather
# than a meaning ('translated as "to like", analyzable in structure as "to
# please" [with dative...]'), which is no use on a card
AUTHORED = {'gustar': ['to like (literally: to please)']}

REFL_GLOSS = {
    'llamarse':    ['to be called, to be named'],
    'levantarse':  ['to get up, to stand up'],
    'ducharse':    ['to have a shower, to shower'],
    'lavarse':     ['to wash (oneself)'],
    'bañarse':     ['to have a bath, to bathe'],
    'despertarse': ['to wake up'],
    'dedicarse':   ['to work as, to devote oneself to'],
}
# grammar words Wiktionary files as a form of another word ("muy: apocopic form
# of mucho"), which leaves the card with no meaning on it
CLOSED_GLOSS = {
    'ellos': ['they, them'], 'me': ['me, to me, myself'],
    'eso': ['that (neuter)'], 'unas': ['some, a few'],
    'muy': ['very'], 'tu': ['your'], 'su': ['his, her, its, their, your (formal)'],
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
                if part and part not in out:
                    out.append(part)
    return out[:cap]

def meanings_html(glosses):
    lines = meaning_lines(glosses)
    if len(lines) <= 1:
        return f'<div class="uc-gl">{esc(lines[0] if lines else "")}</div>'
    return ('<ul class="uc-gls">' +
            ''.join(f'<li>{esc(x)}</li>' for x in lines) + '</ul>')

# ---------------------------------------------------------------- other forms
def forms_html(word, recs, art, primary):
    bits = []
    for rec in recs:
        pos = rec['pos']
        if primary is not None and pos != primary['pos']:
            continue
        if pos == 'noun':
            g = gender_of(rec)
            pl = ''
            for f in rec.get('forms', []):
                if 'plural' in f.get('tags', []) and f.get('form') not in ('', '-'):
                    pl = f['form']; break
            # `el lunes` pluralises to `los lunes`: the noun does not change but
            # the article does, which is the half of it worth learning.  A noun
            # that is already plural (las gafas) has none to give.
            if pl and not g.startswith(('f-p', 'm-p')):
                a = ('los/las' if g.startswith(('mf', 'm-f')) else
                     'las' if g.startswith('f') else 'los' if g.startswith('m') else '')
                bits.append(('plural', (a + ' ' if a else '') + pl))
            break
        if pos == 'adj':
            fem = pls = ''
            for f in rec.get('forms', []):
                tg = set(f.get('tags', [])); s = f.get('form', '')
                if not s or s == '-':
                    continue
                if 'feminine' in tg and 'plural' not in tg and not fem:
                    fem = s
                if 'plural' in tg and 'masculine' in tg and not pls:
                    pls = s
            if fem and fem != word:
                bits.append(('feminine', fem))
            if pls and pls != word:
                bits.append(('plural', pls))
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

# ---------------------------------------------------------------- build
cards, n = [], 0
stats = {'noun': 0, 'verb': 0, 'conj': 0, 'article': 0, 'noexample': 0}

for idx, word in enumerate(words, 1):
    recs = [r for r in W.get(word, []) if r.get('pos') in POS_NAME]
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

    # Wiktionary's record order decides which sense a card teaches, and for a
    # handful of words it puts the one a beginner does not want first: `cafe`
    # as "brown" rather than coffee, `periodico` as "periodic", `movil` as
    # "mobile", and `guapo` as "arrowroot".  Nine words, so they are named.
    NOUN_FIRST = {'café', 'periódico', 'móvil', 'chico', 'norte', 'animal', 'tarde'}
    ADJ_FIRST = {'primero', 'guapo'}

    def has_real_sense(r):
        return any(not (x.get('form_of') or x.get('alt_of')) for x in r.get('senses', []))
    want = 'noun' if word in NOUN_FIRST else 'adj' if word in ADJ_FIRST else None
    primary = (next((r for r in recs if r['pos'] == want and has_real_sense(r)), None) if want else None)
    if primary is None:
        primary = next((r for r in recs if has_real_sense(r)), recs[0] if recs else None)

    # headword: a noun carries its article
    art, headword, gender = '', word, ''
    nrec = next((r for r in recs if r['pos'] == 'noun'), None)
    if nrec is not None and not reflexive and primary is not None and primary['pos'] == 'noun':
        gender = gender_of(nrec)
        art = article(word, gender)
        if art:
            headword = art + ' ' + word
            stats['article'] += 1

    # meanings
    senses = []
    if word in AUTHORED:
        senses.append((primary['pos'] if primary is not None else 'verb', AUTHORED[word]))
    elif word in REFL_GLOSS:
        senses.append(('verb', REFL_GLOSS[word]))
    elif word in CLOSED_GLOSS:
        senses.append((next((r['pos'] for r in recs), 'particle'), CLOSED_GLOSS[word]))
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
        for r in recs:
            g = [s['glosses'][0] for s in r.get('senses', []) if s.get('glosses')][:2]
            if g:
                senses.append((r['pos'], g)); break

    def pos_label(p):
        lab = POS_NAME.get(p, p)
        if p == 'noun' and gender:
            g = gender
            lab += (', masculine' if g.startswith('m') and 'f' not in g[:2] else
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
    forms = forms_html(word, recs, art, primary) if not conj else ''
    exs = EX.get(word, [])
    if not exs:
        stats['noexample'] += 1
    exhtml = examples_html(word, exs)
    plain = "; ".join(g for _, g in senses for g in g) if senses else ''
    plain = "; ".join(senses[0][1]) if senses else ''

    fields = {'Spanish': headword, 'Word': headword, 'English': english,
              'Forms': forms, 'Conjugation': conj, 'Examples': exhtml}

    for direction, sub, typ in (('es', 'Spanish → English', 'es-to-en'),
                                ('en', 'English → Spanish', 'en-to-es')):
        n += 1
        cards.append({
            'id': f'u_delea1_{n}', 'num': str(idx), 'category': 'DELE A1',
            'sub': sub,
            'question': headword if direction == 'es' else plain,
            'answer': plain if direction == 'es' else headword,
            'answerDate': '', 'traditional': '', 'hanzi': '', 'pinyin': '',
            'translations': '', 'abstract': '', 'citation': '',
            'answerText': plain if direction == 'es' else headword,
            'type': typ, 'fields': dict(fields),
        })

print('cards:', len(cards), 'stats:', stats)
json.dump(cards, open('cards.json', 'w'), ensure_ascii=False)
