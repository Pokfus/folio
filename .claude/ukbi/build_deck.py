#!/usr/bin/env python3
"""Turn the chosen words into card fields.

WHAT AN INDONESIAN CARD CARRIES, AND WHAT IT DOES NOT.  The sibling decks on
this shelf spend most of their card on morphology a learner cannot guess:
German's gender and plural, Spanish's conjugation, Mandarin's character
breakdown.  Indonesian has none of that to teach -- a noun has no gender, an
adjective does not agree, and a verb is the same in every person and every
tense.  A card that simply printed the word and its meaning would be honest and
would also throw away the one thing that is genuinely hard.

What is hard is the AFFIX FAMILY, so that is what the card carries in place of a
paradigm: `lihat` / `melihat` / `dilihat`, labelled root, active and passive.
Indonesian derives rather than inflects, it uses the passive far more than
English does, and a reader who knows `lihat` and meets `dilihat` has no way to
get from one to the other by guessing -- the prefix assimilates and eats the
root's first consonant, so `tulis` becomes `menulis` while `nanti` stays
`menanti`.  See `family_forms` in `select.py` for where the labels come from;
none of it is derived by stripping affixes here.
"""
import json, re, html, collections

from ukbi_level import f as lvlf

# how a part of speech is said on the card
POS = {
    'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
    'pron': 'pronoun', 'num': 'numeral', 'prep': 'preposition',
    'conj': 'conjunction', 'intj': 'interjection', 'phrase': 'phrase',
    'classifier': 'classifier', 'particle': 'particle', 'det': 'determiner',
    'article': 'article', 'postp': 'postposition', 'name': 'proper noun',
}

NONSTANDARD = {'alt-of', 'slang', 'Jakarta', 'nonstandard', 'misspelling',
               'abbreviation', 'contraction', 'archaic', 'obsolete',
               'dialectal', 'colloquial', 'rare', 'ellipsis', 'poetic'}
# `name` IS NOT EXCLUDED HERE, though `select.py` excludes it when choosing.
# The two stages are asking different questions.  Choosing, a proper noun is
# noise -- 2,153 of the dictionary's entries are names and a frequency-ranked
# pool would fill with them.  Glossing, a word that has ALREADY been chosen may
# perfectly well carry its meaning in a proper-noun entry, and in Indonesian the
# calendar does: Wiktionary files `April`, `Mei`, `Juni` and half the days of the
# week as names.  Excluding them here refused all twelve months and two days for
# having no meaning -- a survival deck with no word for Monday in it, which is
# the exact failure `supplement.py` exists to prevent, reintroduced one stage
# further down.
NOT_A_WORD = {'prefix', 'suffix', 'infix', 'interfix', 'circumfix',
              'root', 'character', 'punct', 'symbol'}

# A GLOSS THAT IS A CROSS-REFERENCE RATHER THAN A MEANING.
#
# The leading `\w+ ` is what `aku` needed.  Its second entry is glossed "syllabic
# abbreviation of anggaran dan keuangan" and is tagged only `uncountable`, so the
# register filter has no reason to touch it -- and the pattern, anchored hard at
# the start, did not match `syllabic abbreviation` either.  The commonest word in
# the language was therefore defined on the card as a budgeting term, with the
# pronoun beneath it.  One optional modifier before the relation word covers
# `syllabic abbreviation`, `apheretic form` and `alternative letter-case form`
# alike.
REL = re.compile(r'^(?:\w+\s+)?(?:active|passive|actor focus|patient focus|plural'
                 r'|singular|alternative|contraction|abbreviation|acronym'
                 r'|initialism|clipping|ellipsis|inflection|form|spelling'
                 r'|nonstandard form|informal form|misspelling|accidental'
                 r'|basic/imperative|infinitive, imperative)\s+of\b', re.I)

# A LETTER HAS A NOUN ENTRY, AND WIKTIONARY WRITES IT OUT IN FULL.  The Spanish
# generator records the same trap one language over, where it was worse -- there
# the letter sense came FIRST and `de`, `te` and `ese` were carded as the names
# of letters.  Here it lands third, so `es` (ice) reads "ice, cold beverage, the
# name of the Latin script letter S" on a survival card.  Dropped by its own
# wording, which is fixed boilerplate.
LETTER_NAME = re.compile(r'name of the Latin[- ]script letter', re.I)

MAX_SENSES = 3
MAX_POS = 2


def clean_gloss(g):
    """Wiktionary's parenthetical qualifiers are kept; its wiki furniture is not."""
    g = re.sub(r'\s+', ' ', g).strip().rstrip(':;,')
    return g


def glosses_for(word, byword):
    """[(pos, [gloss, ...]), ...] -- the meanings, best first.

    A SENSE THAT ONLY POINTS AT ANOTHER WORD IS NOT A MEANING.  `melihat`'s own
    entry is glossed "active of lihat", which is true, is what the forms row
    already says, and would leave the card with a definition that does not
    define anything.  Those are dropped and the meaning is taken from whichever
    member of the family actually carries one -- which for an affixed headword
    is nearly always the root.
    """
    out = []
    for e in byword.get(word, []):
        if e['pos'] in NOT_A_WORD:
            continue
        gs = []
        for s in e['s']:
            if set(s.get('tags') or []) & NONSTANDARD:
                continue
            g = (s.get('glosses') or [''])[0]
            if not g or REL.match(g) or LETTER_NAME.search(g):
                continue
            g = clean_gloss(g)
            if g and g not in gs:
                gs.append(g)
        if gs:
            out.append((e['pos'], gs[:MAX_SENSES]))
    return out


def meanings(word, family, byword):
    """The card's English, taking the root's meaning where the headword's entry
    is only a cross-reference."""
    got = glosses_for(word, byword)
    if not got:
        for m in family:
            if m != word:
                got = glosses_for(m, byword)
                if got:
                    break
    merged = collections.OrderedDict()
    for pos, gs in got:
        merged.setdefault(pos, [])
        for g in gs:
            if g not in merged[pos]:
                merged[pos].append(g)
    # WIKTIONARY'S OWN ORDER IS THE SIGNAL, which is the rule the German
    # generator settled on for the same question.  A hand-written preference
    # over parts of speech was tried first and is worse: it put `aku`'s noun
    # ahead of its pronoun purely because nouns outrank pronouns in the table,
    # so the first card of the deck defined `I` as an abbreviation.  The
    # dictionary lists a word's entries in the order a lexicographer thought
    # them worth having, and that beats a rule about word classes.
    return list(merged.items())[:MAX_POS]


def english_html(word, family, byword):
    rows = []
    for pos, gs in meanings(word, family, byword):
        label = POS.get(pos, pos)
        if len(gs) == 1:
            body = f'<div class="uc-gl">{html.escape(gs[0])}</div>'
        else:
            items = ''.join(f'<li>{html.escape(g)}</li>' for g in gs)
            body = f'<ol class="uc-gls">{items}</ol>'
        rows.append(f'<div class="uc-sense"><div class="uc-pos">'
                    f'{html.escape(label)}</div>{body}</div>')
    return ''.join(rows)


def forms_html(word, forms):
    """The affix family, labelled.  The headword itself is marked so a reader
    can see at a glance which of the family they are being asked for."""
    if len(forms) < 2:
        return ''
    cells = []
    for form, label in forms:
        lab = (f'<span class="uc-fl">{html.escape(label)}</span>'
               if label else '')
        cls = 'uc-fi uc-fhead' if form == word else 'uc-fi'
        cells.append(f'<span class="{cls}">{lab}'
                     f'<b>{html.escape(form)}</b></span>')
    return f'<div class="uc-forms">{"".join(cells)}</div>'


def bold(sentence, form):
    """Pick the word out of the sentence, without touching anything inside a tag."""
    rx = re.compile(r'(?<![\w-])(' + re.escape(form) + r')(?![\w-])', re.I)
    esc = html.escape(sentence)
    return rx.sub(lambda m: f'<b>{m.group(1)}</b>', esc, count=1)


def examples_html(rows):
    if not rows:
        return ''
    out = []
    for r in rows:
        say = ('<span class="uc-tts uc-exsay" data-say="'
               + html.escape(r['id'], quote=True) + '"></span>')
        out.append(
            f'<div class="uc-exi"><div class="uc-exz">{say}'
            f'{bold(r["id"], r["form"])}</div>'
            f'<div class="uc-exe">{html.escape(r["en"])}</div></div>')
    return ''.join(out)


def main():
    wl = json.load(open(lvlf('wordlist.json'), encoding='utf-8'))
    ex = json.load(open(lvlf('examples.json'), encoding='utf-8'))
    ents = json.load(open(lvlf('wikt.json'), encoding='utf-8'))
    byword = collections.defaultdict(list)
    for e in ents:
        byword[e['w']].append(e)

    cards, entries = [], []
    no_gloss = []
    for w in wl['words']:
        family = wl['families'].get(w, [w])
        forms = wl['forms'].get(w, [[w, 'root']])
        eng = english_html(w, family, byword)
        if not eng:
            no_gloss.append(w)
            continue
        cards.append({'fields': {
            'Indonesian': f'<div class="uc-word">{html.escape(w)}'
                          f'<span class="uc-tts uc-say" data-say="{html.escape(w, quote=True)}">'
                          f'</span></div>',
            'Word': w,
            'English': eng,
            'Forms': forms_html(w, forms),
            'Examples': examples_html(ex.get(w, [])),
        }})
        entries.append({'word': w, 'family': family, 'forms': forms,
                        'examples': len(ex.get(w, []))})

    json.dump(cards, open(lvlf('cards.json'), 'w', encoding='utf-8'),
              ensure_ascii=False)
    json.dump(entries, open(lvlf('entries.json'), 'w', encoding='utf-8'),
              ensure_ascii=False)
    withforms = sum(1 for c in cards if c['fields']['Forms'])
    print(f'    cards: {len(cards)}; {withforms} carry an affix family; '
          f'{sum(1 for c in cards if c["fields"]["Examples"])} carry sentences')
    if no_gloss:
        # A CARD WITH NO MEANING IS NOT WRITTEN.  The German generator refuses
        # one for the same reason: a blank definition is indistinguishable on
        # the page from a word whose meaning is genuinely blank.
        print(f'    REFUSED for having no usable meaning ({len(no_gloss)}): '
              + ', '.join(no_gloss))


if __name__ == '__main__':
    main()
