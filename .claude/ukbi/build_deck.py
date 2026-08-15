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

# A GLOSS THAT NAMES ANOTHER INDONESIAN WORD INSTEAD OF SAYING WHAT THIS ONE
# MEANS -- and it is the commonest defect the finished decks had.
#
# `synonym of X` is not in REL above, because it is not a FORM-of relation: the
# target is a different lexeme rather than a member of this word's affix family,
# so the fallback REL relies on (walk the family, take the root's meaning) does
# not reach it.  It slipped through as a meaning, and 62 cards across the seven
# decks were therefore defined in Indonesian: `memahami` read "synonym of
# paham", `perkosaan` read "synonym of pemerkosaan", `literal` read "synonym of
# harfiah".  Eighteen of those carried no English anywhere at all -- a card that
# shows the reader a word they do not know and glosses it with another word they
# do not know.
#
# TWO THINGS ARE READ RATHER THAN COMPOSED, in this order.  Wiktionary usually
# writes the meaning into the gloss itself -- `synonym of beri (“to give”)` --
# and that parenthetical IS the English, sitting unused two characters away from
# where it was needed; SYN_ENG lifts it.  Where there is no parenthetical the
# TARGET is looked up and its own glosses are taken, which is the same move
# `meanings` already makes for a form-of pointer, one lexeme further out.
# Where neither works the sense is dropped, and a word left with nothing is
# refused by `main` -- which is the right answer for `momod` (an internet
# clipping of `moderator`) and `advisor`, and is how they left the decks.
SYN = re.compile(r'^synonyms?\s+of\s+(.+)$', re.I)
# `synonym of beri (“to give”)` CLOSES WITH TWO CHARACTERS, `”` and `)`, and a
# pattern allowing one of them matches nothing at all -- which is silent, since
# the caller then falls through to the pointer lookup and usually finds
# something.  It cost `memberikan` its meaning for a run.
SYN_ENG = re.compile(r'\(\s*[“"”]?\s*([^)“"”]+?)\s*[“"”]?\s*\)\s*$')
# `pir` is glossed "synonym of pir": the pointer names the word it is on.  A
# lookup would recurse, so a self-pointer is simply dropped.
SYN_MAX_HOP = 1

# A GLOSS THAT SAYS THE HEADWORD IS NOT USED IN THIS SENSE IS NOT A MEANING FOR
# THE HEADWORD.  `kejam` is the case: its two adjective senses (brutal, violent,
# vicious, ruthless, cruel) are both tagged `colloquial` and are refused by the
# register filter, which leaves one verb entry glossed "to close (eyes) (used in
# the form mengejamkan)" -- a sense the gloss itself says belongs to a different
# word.  The card taught a Semenjana candidate that a very common adjective
# means to close one's eyes.  It is the `tau` shape with the opposite outcome:
# there the refused sense left a Greek letter behind and the word fell out of the
# deck, here it left a rarer homograph and the word stayed with the wrong
# meaning.  Dropped, after which `kejam` has no standard meaning in this
# dictionary at all and is refused -- which is the honest reading of a source
# that tags every sense a reader wants as outside the standard language.
NOT_THIS_FORM = re.compile(r'used in the form\b', re.I)

# A LETTER HAS A NOUN ENTRY, AND WIKTIONARY WRITES IT OUT IN FULL.  The Spanish
# generator records the same trap one language over, where it was worse -- there
# the letter sense came FIRST and `de`, `te` and `ese` were carded as the names
# of letters.  Here it lands third, so `es` (ice) reads "ice, cold beverage, the
# name of the Latin script letter S" on a survival card.  Dropped by its own
# wording, which is fixed boilerplate.
#
# THE SECOND HALF IS FOR A WORD WHOSE LETTER SENSE IS THE ONLY ONE LEFT, and it
# is `tau` that needed it.  `tau` is the nineteenth of the top 19,125 words of
# the corpus -- because in speech it is the colloquial form of `tahu`, "to know"
# -- and that reading is tagged colloquial and correctly refused, which leaves
# the entry Wiktionary files for the Greek letter Τ standing alone.  So the deck
# was teaching a Greek letter on the strength of an Indonesian colloquialism's
# frequency: the `kan` / `ku` / `mu` / `nya` shape in `select.py`'s EXCLUDE, and
# the same answer -- the frequency belongs to a form the deck does not teach, and
# the surviving sense does not deserve it.  With the letter sense dropped `tau`
# has no meaning at all and the pool's meaning test refuses it, which is what
# EXCLUDE would have done by hand and covers the other 63 such entries too.
# Swept over the whole dictionary before it was widened: 31 senses are newly
# dropped and every one of them defines a letter of an alphabet.
LETTER_NAME = re.compile(r'name of the Latin[- ]script letter'
                         r'|\bletter\b[^.;]{0,40}\b(?:alphabet|abjad)\b', re.I)

MAX_SENSES = 3
MAX_POS = 2


# A CROSS-REFERENCE MAY BE A CLAUSE INSIDE A GLOSS RATHER THAN THE WHOLE OF IT,
# and the two that reach a card this way are the only two in the dictionary that
# matter: `tarian` is glossed "a dance; synonym of tari" and `gunakan` "to use;
# basic form of menggunakan".  Dropping the sense loses the English, and keeping
# it whole prints an Indonesian word the reader has no use for -- so the TAIL is
# cut and the meaning in front of it is kept.  Anchored to the separator, so a
# gloss can only lose a clause that begins as a cross-reference.
#
# `see` IS NOT ONE OF THEM, and it was, for a run.  Wiktionary does write "see
# temefos for further information" as a pointer -- but `arrivederci` is glossed
# "farewell, goodbye, see you later" and `sampai jumpa` simply "see you later",
# where those three words are the English and cutting them leaves a greeting
# card that has lost its greeting.  Swept over the whole dictionary: allowing
# `see` touches eleven glosses and gets two of them wrong, so it goes and the
# two unambiguous forms stay.
XREF_TAIL = re.compile(r'\s*[;,]\s*(?:synonyms?|basic form)\s+of\s+[^;]*$', re.I)


def clean_gloss(g):
    """Wiktionary's parenthetical qualifiers are kept; its wiki furniture is not."""
    g = re.sub(r'\s+', ' ', g).strip()
    g = XREF_TAIL.sub('', g)
    return g.strip().rstrip(':;,')


def sense_refused(s):
    """True when the sense is outside the standard language UKBI tests.

    A SENSE THE DICTIONARY ITSELF CALLS `formal` IS STANDARD, whatever else it
    carries, and that single line is what fixes the worst card in the stack.
    `beri` -- "to give", one of the first verbs anybody learns -- is tagged
    `['dialectal', 'formal']`, so the register filter refused it and the only
    surviving `beri` entry was the English loanword for a berry.  `memberi` and
    `memberikan` take their meaning from `beri`, so BOTH of them shipped on the
    500-word survival deck defined as fruit: "berry (a small succulent fruit, of
    any one of many varieties)".  Nothing threw, the cards were well formed, and
    the register filter was doing exactly what it was written to do.
    Measured over the whole dictionary before it was kept: twelve senses carry a
    nonstandard tag beside `formal`, of which half are alt-of forms that REL
    drops anyway, so this cannot reach far enough to do damage.  `formal` and
    `dialectal` together is the source disagreeing with itself; the tag that
    names the register UKBI actually examines is the one to believe.
    """
    t = set(s.get('tags') or [])
    return bool(t & NONSTANDARD) and 'formal' not in t


def gloss_of(s):
    """The sense's English, or None when it does not carry one.

    Returns the parenthetical of a `synonym of X (“…”)` gloss, since that IS the
    English; a bare `synonym of X` returns None and is resolved by the caller.
    """
    g = (s.get('glosses') or [''])[0]
    if not g or REL.match(g) or LETTER_NAME.search(g) or NOT_THIS_FORM.search(g):
        return None
    m = SYN.match(g)
    if m:
        eng = SYN_ENG.search(m.group(1))
        return clean_gloss(eng.group(1)) if eng else None
    return clean_gloss(g) or None


def syn_targets(word, byword):
    """The words a bare `synonym of X` gloss points at, in order."""
    out = []
    for e in byword.get(word, []):
        if e['pos'] in NOT_A_WORD:
            continue
        for s in e['s']:
            if sense_refused(s):
                continue
            m = SYN.match((s.get('glosses') or [''])[0])
            if not m or SYN_ENG.search(m.group(1)):
                continue
            t = clean_gloss(m.group(1)).rstrip('.')
            # LONGEST FIRST, and the target must itself be a word: the gloss may
            # name several (`synonym of celaka, sial`) or a phrase, and taking a
            # prefix of one invents a pointer -- the same rule `entry_relation`
            # applies to a multi-word base.
            for cand in (t, t.split(',')[0].strip()):
                if cand and cand != word and cand in byword and cand not in out:
                    out.append(cand)
    return out


def glosses_for(word, byword, pos_hint=None):
    """[(pos, [gloss, ...]), ...] -- the meanings, best first.

    A SENSE THAT ONLY POINTS AT ANOTHER WORD IS NOT A MEANING.  `melihat`'s own
    entry is glossed "active of lihat", which is true, is what the forms row
    already says, and would leave the card with a definition that does not
    define anything.  Those are dropped and the meaning is taken from whichever
    member of the family actually carries one -- which for an affixed headword
    is nearly always the root.

    `pos_hint` is the entry we arrived FROM, when this is a fallback lookup.
    See `meanings`.
    """
    out = []
    for e in byword.get(word, []):
        if e['pos'] in NOT_A_WORD:
            continue
        if pos_hint and e['pos'] != pos_hint:
            continue
        gs = []
        for s in e['s']:
            if sense_refused(s):
                continue
            g = gloss_of(s)
            if g and g not in gs:
                gs.append(g)
        if gs:
            out.append((e['pos'], gs[:MAX_SENSES]))
    return out


def owning_entries(word, base, byword):
    """`base`'s entries whose own paradigm names `word`, or [] if none does.

    A FAMILY MEMBER'S MEANING COMES FROM THE ENTRY THAT CLAIMS THE WORD, and
    without this the deck's two worst cards were on level 1.  `memberikan` is
    glossed "active of berikan" and falls back to `berikan`, which has three
    entries: two of them are `ber-` + `ikan` and mean "have a fish", "full of
    fish" and "to fish", and the third is `beri` + `-kan` and means to give.
    Wiktionary's own order puts the fish first, so `memberikan` -- a verb every
    beginner needs -- was defined on the survival deck as an adjective meaning
    "have a fish".
    The source separates them cleanly and the separator is already extracted:
    the third entry's head template reads `active: memberikan, passive:
    diberikan`, so the entry that names the word we came from is the entry the
    word belongs to.  `beri` does the same for `memberi` (`active: memberi`).
    Exact rather than heuristic, and no etymology parsing.
    """
    return [e for e in byword.get(base, [])
            if any(v == word for _lab, v in (e.get('pairs') or []))]


def meanings(word, family, byword):
    """The card's English, taking the root's meaning where the headword's entry
    is only a cross-reference."""
    got = glosses_for(word, byword)
    if not got:
        # the part of speech this word's own entry claims to be, so a fallback
        # cannot answer a verb with a homograph noun -- `memberi` is "active of
        # beri" and must not be glossed from `beri`'s "berry".
        hint = next((e['pos'] for e in byword.get(word, [])
                     if e['pos'] not in NOT_A_WORD), None)
        for m in family:
            if m == word:
                continue
            owner = owning_entries(word, m, byword)
            if owner:
                got = glosses_for(word, {word: owner})
                if got:
                    break
            got = glosses_for(m, byword, pos_hint=hint) or glosses_for(m, byword)
            if got:
                break
    if not got:
        # nothing in the family carries a meaning: follow a `synonym of X`
        # pointer, one hop, and take X's own glosses.
        for _hop in range(SYN_MAX_HOP):
            for t in syn_targets(word, byword):
                got = glosses_for(t, byword)
                if got:
                    break
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
    """Pick the word out of the sentence, without touching anything inside a tag.

    THE CLITIC IS PART OF THE MATCH AND SO IS PART OF THE BOLD.  `examples.py`
    accepts `peradangannya` as an occurrence of `peradangan` -- the possessive is
    written onto the word in Indonesian -- and a pattern here that demanded the
    bare form would find nothing in that sentence and mark nothing at all.  The
    two have to allow the same thing: the sentence would still render, still be
    paired, and simply stop picking the word out, which on a card whose whole
    point is to show the word in use is the quiet kind of failure.
    """
    rx = re.compile(r'(?<![\w-])(' + re.escape(form) + r'(?:ku|mu|nya)?)(?![\w-])',
                    re.I)
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
