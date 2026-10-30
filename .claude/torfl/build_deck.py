#!/usr/bin/env python3
"""Turn the selected notes into card fields.

Reads `selected-<level>.json`, `examples-<level>.json` and `lex.json`; writes
`cards-<level>.json` (the notes, fields only) and `entries-<level>.json` (what
`emit.py` counts for the description).

WHAT A RUSSIAN CARD CARRIES (docs/russian-decks-plan.md §4):

  · THE HEADWORD WITH ITS STRESS, as Wiktionary marks it (`кни́га`), and an aspect
    pair as one headword, imperfective first (`де́лать / сде́лать`).  The `Word`
    field is the same without stress marks (`делать, сделать`): it is what the
    speaker reads and what the next level's exclusion reads.
  · ONE LINE OF FORMS beside the word -- the ones a learner needs to use it: a
    noun's genitive singular and nominative plural (from which the rest of its
    declension follows), a verb's я and ты forms (which fix its conjugation and
    show a moving stress), an adjective's short forms.
  · THE WHOLE PARADIGM in a fold: six cases by number for a noun, by gender for
    an adjective; present or future, past and imperative for each verb of a pair.
  · THREE SENTENCES, the note's own forms in bold.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from russian import fold, bare, show, PRONOUN_CASES, CASE_NAMES
from torfl_level import f as lvlf

E = lambda s: html.escape(s, quote=True)

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'prep': 'preposition', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'numeral',
            'det': 'determiner', 'phrase': 'phrase', 'prep_phrase': 'phrase',
            'postp': 'postposition', 'proverb': 'proverb'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'n': 'neuter'}
JUNK_TAGS = {'obsolete', 'archaic', 'dated', 'rare', 'dialectal', 'abbreviation',
             'initialism', 'letter', 'vulgar', 'offensive', 'derogatory',
             'historical', 'nonstandard', 'Internet', 'slang', 'pre-reform'}
CASES = ('nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'prepositional')
PERSONS = [('first-person', 'singular', 'я'), ('second-person', 'singular', 'ты'),
           ('third-person', 'singular', 'он, она'), ('first-person', 'plural', 'мы'),
           ('second-person', 'plural', 'вы'), ('third-person', 'plural', 'они')]

# GLOSSES WIKTIONARY WRITES AS AN ESSAY.  A function word's entry often opens on
# a usage note ("Generic demonstrative pronoun. Translated as …"), which is right
# for a dictionary and unreadable on a card.  These are the plain glosses, for
# the notes where the first sense is such a note; each says no more than the
# entry's own senses do.
GLOSS = {
    'это|pron': ['this, that', 'it (as the subject: это мой дом, this is my house)'],
    'это': ['this, that', 'it (as the subject: это мой дом, this is my house)'],
    'этот': ['this, these (pointing to something near)'],
    'тот': ['that, those (pointing to something further away)', 'the one (тот, кто…, the one who…)'],
    'бы': ['would (with the past tense: я бы хотел, I would like)'],
    'же': ['(stresses the word before it) really, after all', 'the same (тот же)'],
    'ли': ['whether, if (asks a question: знаешь ли ты…, do you know…)'],
    'вот': ['here is, there is (pointing)', 'that is, so (summing up)'],
    'ведь': ['after all, you know (appeals to what is known)'],
    'ни': ['not a (single), not even', 'neither… nor (ни… ни…)'],
    'не': ['not'],
    'да': ['yes', 'and, but (joining words, informal)'],
    'нет': ['no', 'there is no, there are no (with the genitive)'],
    'себя': ['oneself: myself, yourself, himself … (refers back to the subject)'],
    'свой': ["one's own: my, your, his, her … (refers back to the subject)"],
    'который': ['which, that, who (joins a clause to a noun)'],
    'должен': ['must, have to, should', 'owing (money)'],
    'пока|intj': ['bye, see you (informal goodbye)'],
    'пока|adv': ['for now, for the time being'],
    'пока|conj': ['while', 'until (пока не…)'],
    'есть|verb': ['to eat'],
    'я': ['I'], 'ты': ['you (one person you know well)'], 'он': ['he', 'it (a masculine noun)'],
    'она': ['she', 'it (a feminine noun)'], 'оно': ['it (a neuter noun)'], 'мы': ['we'],
    'вы': ['you (more than one person, or one person politely)'], 'они': ['they'],
    'что|pron': ['what'],
    'что|conj': ['that (я знаю, что…, I know that…)'],
    'как|adv': ['how'], 'как|conj': ['as, like'],
    'и|conj': ['and'], 'и|particle': ['too, even (stressing a word)'],
    'а|conj': ['and, but (setting one thing against another: я дома, а он на работе)'],
    'а|intj': ['oh!, ah!'],
    'но|conj': ['but'],
    'знать': ['to know'],
    'хорошо': ['well', 'good, all right, OK'],
    'два': ['two'],
    'мама': ['mum, mother'],
    'спать': ['to sleep'],
    'помощь': ['help, assistance'],
    'имя': ['name, first name'],
    'куда': ['where to (asks about direction)'],
    'очень|adv': ['very, very much'],
    'быть': ['to be', 'there is, there are (in the past and future: был, будет)'],
    'твой': ['your, yours (to one person you know well)'],
    'ваш': ['your, yours (to several people, or to one politely)'],
    'чтобы': ['so that, in order to', 'that (after wanting and asking: я хочу, чтобы…)'],
    'номер': ['number', 'room (in a hotel)', 'size (of clothes or shoes)'],
    'нельзя': ['it is not allowed, one must not', 'it is impossible, one cannot'],
    'пора': ['it is time (пора идти, it is time to go)', 'time, season, period'],
    'откуда': ['where from'],
    'подруга': ['female friend', 'girlfriend'],
    'полагать': ['to suppose, to think, to believe'],
    'задание': ['task, assignment', 'homework (домашнее задание)'],
    'согласный': ['agreeing (я согласен, I agree)', 'consonant (a speech sound)'],
    'неприятность': ['trouble, unpleasantness'],
    'водитель': ['driver'],
    'апельсин': ['orange (the fruit)'],
    'мечта': ['dream (something hoped for)', 'daydream'],
    'подружка': ['girlfriend, (female) friend'],
    'холодильник': ['fridge, refrigerator'],
    # THE PREPOSITIONS, WITH THE CASE EACH SENSE TAKES.  Wiktionary splits a
    # preposition's senses under headings ("[with prepositional]") that do not
    # survive as glosses, and the case IS the lesson: в + prepositional is where,
    # в + accusative is where to.
    'в': ['in, at (+ prepositional: where)', 'into, to (+ accusative: where to)',
          'on, at (+ accusative: days and times — в среду, on Wednesday)'],
    'на': ['on, at (+ prepositional: where)', 'onto, to (+ accusative: where to)',
           'for (+ accusative: a length of time or a purpose)'],
    'о': ['about, of (+ prepositional)'],
    'по': ['along, around, through (+ dative)', 'by, on (+ dative: по телефону, on the phone)',
           'on (+ dative, repeated days: по средам, on Wednesdays)'],
    'за': ['behind (+ instrumental)', 'for (+ accusative: in exchange for, in favour of)',
           'in, within (+ accusative: за неделю, in a week)'],
    'от': ['from (+ genitive)'],
    'у': ['by, at (+ genitive)', 'у меня есть…: I have… (literally "by me there is")'],
    'с|prep': ['with (+ instrumental)', 'from, off (+ genitive)',
               'since (+ genitive: с утра, since the morning)'],
    'к|prep': ['to, towards (+ dative)', 'by (+ dative, a time: к вечеру, by evening)'],
    'из': ['from, out of (+ genitive)'],
    'до|prep': ['until, up to, as far as (+ genitive)', 'before (+ genitive)'],
    'без': ['without (+ genitive)'],
    'после|prep': ['after (+ genitive)'],
    'через': ['through, across (+ accusative)', 'in (+ accusative, time: через час, in an hour)'],
    'перед': ['in front of, before (+ instrumental)'],
    'под': ['under (+ instrumental: where; + accusative: where to)'],
    'для': ['for (+ genitive)'],
}
GLOSS_POS = {'это': 'pron', 'этот': None, 'тот': None}


def override(e):
    w = fold(e['word'])
    if f"{w}|{e['pos']}" in GLOSS:
        return GLOSS[f"{w}|{e['pos']}"]
    if w in GLOSS and not any(k.startswith(w + '|') for k in GLOSS):
        return GLOSS[w]
    return None


# WHOLE WORDS: a bare `ass\w*` matched "assistance", "assemble" and "assent", and turned
# away `помощь`, `собираться` and `согласиться` (found at A2, Oct 2026).
COARSE = re.compile(r'\b(fuck\w*|shit\w*|cunts?|dicks?|cocks?|pricks?|arse|arsehole|ass|asshole|'
                    r'bitch\w*|whores?|sluts?|piss\w*|bollocks|wank\w*|screw(ing)?|bang(ing)?|'
                    r'sex(ual)?|genital\w*|vagina|vulva|penis|syphilis|lesbian|homosexual)\b', re.I)


def clean_gloss(g):
    """One gloss line out of a Wiktionary sense's gloss list."""
    label = ''
    if len(g) > 1 and g[0].startswith('[') and g[0].endswith(']'):
        label = g[0][1:-1]
    text = g[-1]
    if text.startswith('[') and ']' in text:
        label = label or text[1:text.index(']')]
        text = text[text.index(']') + 1:].strip()
    text = re.sub(r'\s+', ' ', text).strip().rstrip('.')
    # a reflexive verb's derived senses name their base verb: `passive of пыта́ть
    # (pytátʹ)` says nothing a learner can use, and `reflexive of учи́ть (učítʹ);
    # to study` keeps only what follows the semicolon
    if re.match(r'^(passive|reflexive) of ', text):
        text = text.split(';', 1)[1].strip() if ';' in text else ''
    # a feminine noun's gloss names its masculine first: `female equivalent of
    # внук (vnuk): granddaughter` -> `granddaughter`
    text = re.sub(r'^female equivalent of [^:]*:\s*', '', text)
    # Wiktionary's editorial asides: `(perfective поговорить)`, `one (1)`
    text = re.sub(r'\s*\((?:im)?perfective [^)]*\)|\s*\(\d+\)|\s*\(verbal noun of [^)]*\)+',
                  '', text).strip()
    # a construction note in square brackets, often cut off by the length limit
    text = re.sub(r'\s*\[[^\]]*(\]|$)', '', text).strip()
    text = re.sub(r'^(diminutive|augmentative|endearing form|pejorative) of [^:]*:\s*', '', text)
    if len(text) > 90:
        first = re.split(r'(?<=[a-z\)])[.;] ', text)[0]
        text = first if len(first) <= 90 else text[:87].rsplit(' ', 1)[0] + '…'
    if label:
        label = label.replace('with ', '+ ')
        text = f'{text} ({label})' if text else label
    return text


def glosses(e, key=None, limit=4, fallback=True):
    ss = [s for s in e['senses'] if not (set(s['t']) & JUNK_TAGS)] or e['senses']
    if key:
        ss = sorted(ss, key=lambda s: 0 if any(key.lower() in g.lower() for g in s['g']) else 1)
    out = []
    for s in ss:
        t = clean_gloss(s['g'])
        # a later sense that is a proper name (`Otvet (Russian anti-submarine
        # missile)`) or a letter's old name
        if out and (re.match(r'[A-Z][a-z]+ \(', t) or 'name of the letter' in t):
            continue
        if COARSE.search(t) or re.fullmatch(r'\+ \w+( or \w+)?', t):
            continue          # a heading left as a gloss: `+ prepositional`
        if len(t) > 60 and out:
            continue
        if t and t not in out and not t.lower().startswith(
                ('alternative', 'used ', 'synonym', 'same as', 'filler', 'expresses', 'also ')):
            out.append(t)
        if len(out) >= limit:
            break
    if not out and fallback:
        out = [clean_gloss(ss[0]['g'])]
    return out


def gram(e):
    return e['gram'] + [{'masculine': 'm', 'feminine': 'f', 'neuter': 'n',
                         'imperfective': 'impf', 'perfective': 'pf',
                         'plural': 'pl'}.get(t, t) for t in e['htags']]


def aspect(e):
    g = gram(e)
    if 'impf' in g and 'pf' in g:
        return 'both aspects'
    return 'perfective' if 'pf' in g else 'imperfective'


def noun_label(e):
    g = e['gram']
    genders = [GENDER[x] for x in g if x in GENDER]
    genders = list(dict.fromkeys(genders))
    lab = 'noun'
    if 'pl' in g:
        lab += ', plural only'
    elif genders:
        lab += ', ' + ' or '.join(genders)
    if 'indeclinable' in e['exp']:
        lab += ', indeclinable'
    return lab


def form(e, *want, exclude=()):
    """The first form carrying every tag in `want` and none in `exclude`."""
    for w, t in e['forms']:
        if set(want) <= set(t) and not (set(exclude) & set(t)):
            return w
    return None


def fi(label, value):
    return (f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(value)}</span>')


def block(head, rows):
    rows = [(p, v) for p, v in rows if v]
    if not rows:
        return ''
    return (f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>'
            + ''.join(f'<div class="uc-cjr"><span class="uc-cj-p">{E(p)}</span>'
                      f'<span class="uc-cj-f">{E(v)}</span></div>' for p, v in rows)
            + '</div>')


def all_forms(e, *want, exclude=()):
    seen = []
    for w, t in e['forms']:
        if set(want) <= set(t) and not (set(exclude) & set(t)):
            w = show(w)
            if w not in seen:
                seen.append(w)
    return ', '.join(seen)


def case_rows(e, extra, exclude=()):
    rows = []
    for c in CASES:
        if c == 'accusative':
            inan = all_forms(e, c, *extra, 'inanimate', exclude=exclude)
            anim = all_forms(e, c, *extra, 'animate', exclude=exclude)
            if inan or anim:
                v = inan if inan == anim or not anim else (
                    anim if not inan else f'{inan} / {anim}')
                rows.append((c, v))
                continue
        rows.append((c, all_forms(e, c, *extra, exclude=exclude)))
    return rows


# ------------------------------------------------------------ per part of speech
def noun_parts(e):
    forms = []
    gen = form(e, 'genitive', 'singular') or form(e, 'genitive', exclude=('plural',))
    pl = form(e, 'nominative', 'plural')
    if 'indeclinable' in e['exp']:
        return '', ''
    if gen and 'pl' not in e['gram']:
        forms.append(fi('genitive', show(gen)))
    if pl and 'pl' not in e['gram']:
        forms.append(fi('plural', show(pl)))
    tbl = ''
    sg = case_rows(e, ('singular',))
    plr = case_rows(e, ('plural',))
    if any(v for _p, v in sg + plr):
        tbl = block('singular', sg) + block('plural', plr)
    return ''.join(forms), tbl


def adj_parts(e):
    forms = []
    short = [form(e, 'short-form', g, exclude=('plural',)) for g in ('masculine', 'feminine', 'neuter')]
    short.append(form(e, 'short-form', 'plural'))
    # only a full set: an adjective Wiktionary gives short forms for but no
    # masculine (`взро́слый`, `кра́йний`) has no short form in use
    if short[0] and not bare(e['word']).endswith(('щий', 'щийся')):
        forms.append(fi('short', ', '.join(show(x) for x in short if x)))
    # the comparative a learner says is the adverbial one in -е (`лу́чше`), not
    # the adjective in -ий that Wiktionary may list first (`лу́чший`)
    comps = [re.sub(r'^\([^)]*\)', '', w) for w, t in e['forms'] if 'comparative' in t]
    comps.sort(key=lambda w: 0 if bare(w).endswith('е') else 1)
    if comps:
        forms.append(fi('comparative', show(comps[0])))
    tbl = ''.join(block(lab, case_rows(e, tags, exclude=ex)) for lab, tags, ex in [
        ('masculine', ('masculine',), ('plural', 'short-form')),
        ('neuter', ('neuter',), ('plural', 'short-form')),
        ('feminine', ('feminine',), ('plural', 'short-form')),
        ('plural', ('plural',), ('short-form',))])
    return ''.join(forms), tbl


def verb_tables(e):
    asp = aspect(e)
    tense = 'future' if asp == 'perfective' or fold(e['word']) == 'быть' else 'present'
    rows = [(lab, all_forms(e, p, n, tense)) for p, n, lab in PERSONS]
    rows = [(l, v) for l, v in rows if v and ' ' not in v]
    past = [(lab, all_forms(e, 'past', *t)) for lab, t in [
        ('он', ('masculine', 'singular')), ('она', ('feminine', 'singular')),
        ('оно', ('neuter', 'singular')), ('они', ('plural',))]]
    imp = [('ты', all_forms(e, 'imperative', 'singular')),
           ('вы', all_forms(e, 'imperative', 'plural'))]
    hw = show(e['head'])
    return (block(f'{hw} — {tense}', rows) + block(f'{hw} — past', past)
            + block(f'{hw} — imperative', imp))


def verb_forms(members):
    cells = []
    for p, n, lab in PERSONS[:2]:
        vals = []
        for e in members:
            tense = 'future' if aspect(e) == 'perfective' else 'present'
            v = form(e, p, n, tense)
            if fold(e['word']) == 'быть':
                v = form(e, p, n, 'future')     # its present is a bare `есть`
            if v and ' ' not in v:
                vals.append(show(v))
        if vals:
            cells.append(fi(lab, ' / '.join(vals)))
    return ''.join(cells)


def generic_table(e):
    """A closed-class word that declines (этот, мой, один, сколько …)."""
    if e['pos'] == 'pron' and fold(e['word']) in PRONOUN_CASES:
        row = PRONOUN_CASES[fold(e['word'])]
        return block('cases', [(c, row[k]) for k, c in enumerate(CASE_NAMES)])
    if not any(set(t) & set(CASES) for _w, t in e['forms']):
        return ''
    genders = [g for g in ('masculine', 'neuter', 'feminine')
               if any(g in t for _w, t in e['forms'])]
    if genders:
        out = ''.join(block(g, case_rows(e, (g,), exclude=('plural',))) for g in genders)
        if any('plural' in t for _w, t in e['forms']):
            out += block('plural', case_rows(e, ('plural',), exclude=tuple(genders)))
        return out
    return block('cases', case_rows(e, ()))


# ------------------------------------------------------------ the note
def english_block(e, key, limit, first=True):
    # a second part of speech whose every sense is a usage note is left off,
    # where the note's FIRST block must say something
    gl = override(e) or glosses(e, key, limit, fallback=first)
    if e['pos'] == 'adj' and not e['forms']:
        lab = 'predicative'
    elif e['pos'] == 'noun':
        lab = noun_label(e)
    elif e['pos'] == 'verb':
        lab = 'verb, ' + aspect(e)
    else:
        lab = POS_NAME.get(e['pos'], e['pos'])
    return lab, gl


def english_html(blocks):
    def one(lab, gl):
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ul class="uc-gls">' + ''.join(f'<li>{E(g)}</li>' for g in gl) + '</ul>')
        return f'<div class="uc-pos">{E(lab)}</div>{body}'
    if len(blocks) == 1:
        return one(*blocks[0])
    return ''.join(f'<div class="uc-sense">{one(l, g)}</div>' for l, g in blocks)


def examples_html(xs):
    out = []
    for x in xs:
        parts = re.split(r'([А-Яа-яЁё́̀]+(?:-[А-Яа-яЁё́̀]+)*)', x['ru'])
        k, buf = 0, []
        for p in parts:
            if re.fullmatch(r'[А-Яа-яЁё́̀]+(?:-[А-Яа-яЁё́̀]+)*', p or '-'):
                buf.append(f'<b>{E(p)}</b>' if k in x['hits'] else E(p))
                k += 1
            else:
                buf.append(E(p))
        say = E(bare(x['ru']))
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{say}"></span>{"".join(buf)}</div>'
                   f'<div class="uc-exe">{E(x["en"])}</div></div>')
    # adjacent bold words of one phrase read as one: <b>до</b> <b>свидания</b>
    return re.sub(r'</b>(\s+)<b>', r'\1', ''.join(out))


def main():
    units = json.load(open(lvlf('selected.json'), encoding='utf-8'))
    exs = json.load(open(lvlf('examples.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    cards, entries = [], []
    for n, u in enumerate(units):
        members = [lex[m] for m in u['entries']]
        e0 = members[0]
        heads = [show(m['head']) for m in members]
        if u['pair']:
            headword = ' / '.join(heads)
            word = ', '.join(bare(m['word']) for m in members)
        else:
            headword = heads[0]
            word = bare(e0['word'])
        blocks, forms, table = [], '', ''
        if u['pair']:
            gl = glosses(e0, u.get('key'), 4)
            blocks.append(('verb, imperfective / perfective', gl))
            forms = verb_forms(members)
            table = ''.join(verb_tables(m) for m in members)
        else:
            limit = 4 if len(members) == 1 else 3
            for m in members:
                lab, gl = english_block(m, u.get('key') if m is e0 else None, limit,
                                        first=m is e0)
                # a second part of speech that only repeats the first (`не` the
                # particle "not", `не` the interjection "not") adds nothing
                had = {g for _l, gs in blocks for g in gs}
                gl = [g for g in gl if g not in had]
                if gl:
                    blocks.append((lab, gl))
            if e0['pos'] == 'noun':
                forms, table = noun_parts(e0)
            elif e0['pos'] == 'adj' and e0['forms']:
                forms, table = adj_parts(e0)
            elif e0['pos'] == 'verb':
                forms = verb_forms([e0])
                table = verb_tables(e0)
            else:
                table = generic_table(e0)
        fields = {
            'Russian': f'<div class="uc-word">{E(headword)}</div>',
            'Word': word,
            'English': english_html(blocks),
            'Forms': f'<div class="uc-forms">{forms}</div>' if forms else '',
            'Table': f'<div class="uc-cjg">{table}</div>' if table else '',
            'Examples': examples_html(exs.get(str(n), [])),
        }
        cards.append({'sub': '', 'fields': fields})
        entries.append({'word': word, 'head': headword, 'pos': e0['pos'],
                        'pair': u['pair'], 'source': u['source'], 'sec': u['sec'],
                        'freq': u['freq'], 'examples': len(exs.get(str(n), [])),
                        'phrase': ' ' in e0['word']})
    json.dump(cards, open(lvlf('cards.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    json.dump(entries, open(lvlf('entries.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'  {len(cards)} notes built')


if __name__ == '__main__':
    main()
