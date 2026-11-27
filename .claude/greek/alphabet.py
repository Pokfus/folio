#!/usr/bin/env python3
"""Write the Greek alphabet deck: `decks/Greek-Alphabet.folio-deck.json`.

    python3 .claude/greek/alphabet.py             # write the deck (reads lex.json)
    python3 .claude/greek/alphabet.py --verify    # every sound, name and rule is in its source

The first deck of the Greek collection, sorted before A1 by `levelRank`'s
"Alphabet" rule (Hindi's arrangement).  The level decks print a romanisation
under every word, so this deck is not a gate; it is where the letters are learnt
and where the reader learns to READ: Greek spelling says the sound almost
without exception, but only to a reader who knows the two-letter spellings and
six small rules.

WHAT IS IN IT.  One note per letter, in alphabetical order, capital and small
(two cards each: letter -> sound, sound -> letter); the fourteen two-letter
spellings (ου, αι, ει, οι, υι, αυ, ευ, μπ, ντ, γκ, γγ, γχ, τσ, τζ); the two
signs, the accent and the diaeresis; and ten READING RULES of card type
`el-read`, one card each (a rule has no "sound -> letter" side): the two shapes
of sigma, the accent on a capital, the question mark, the six spellings of
[i], the two of [e] and of [o], γ κ χ before e and i, an ι that is not a
syllable, a doubled consonant, σ before a voiced consonant, and the stress that
moves between the forms of one word.

WHERE EVERY SOUND COMES FROM (the beginner pass, 2026-11-27; docs/lang-decks.md, "The
Greek beginner pass").  Until then the sound sides were the author's ("almost gargled",
"the ee of the feminine words and endings", "rare, in a few learned words") and named "the
standard description of Modern Greek", which nothing a reader can open.  Now:
  · every IPA symbol and English comparison is a CELL of Wikipedia's key, Help:IPA/Greek,
    columns "IPA", "MG" and "English approximation" (`APPROX`), the stressed letters of the
    cell in bold as the key prints them;
  · every letter's two names are the cells of the Letters table of Wikipedia's "Greek
    alphabet" (`NAMES`): the English name, which the sound side of a letter that shares its
    sound with another carries -- Modern Greek writes [i] six ways and [e] and [o] two ways
    each, so "which letter is this?" has one answer only when the letter is named -- and
    the Greek name, which the speaker says;
  · every rule is a PHRASE of one of five Wikipedia pages (`Q`), printed between double
    quotes; the plain line above it claims nothing the phrase does not.
`--verify` fetches the five revisions (a revision never changes) with curl -- Wikipedia
answers Python's default client with 429 -- and fails if a cell, a name or a phrase is not
in them.  It needs the network and is not a CI step.

THE EXAMPLE WORDS are cards of Greek A1 wherever A1 has a word with the spelling (asserted); A1 has none with γκ, τζ, υι or a diaeresis, and
those four are other Wiktionary headwords.  A word's romanisation, its IPA and its meaning
are read off its card in `decks/Greek-A1.folio-deck.json` (run `run.py` first), and for the
four from `lex.json` by the same rules, so the two decks agree; nothing about a word is typed
here.  No corpus is read, so a re-run is byte-identical whenever A1 and `lex.json` are.

IDS.  The notes are numbered here by position and `node .claude/decks/greek-fix.js` gives
each one back its pinned number (`greek-ids.json`: a letter by what its card prints, a rule
by its `Key`).  A NEW note needs a row there.
"""
import html, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gr import fold, translit

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'el-abc'
RULE_TYPE = 'el-read'
COLOR = '#6F69D2'
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'greek-cache')

# ---- the sources, each at one revision -------------------------------------------------
PAGES = {
    'help': ('Help:IPA/Greek', 1373072501),                    # 2026-09-03
    'abc': ('Greek alphabet', 1387421171),                     # 2026-11-23
    'phon': ('Modern Greek phonology', 1383354610),            # 2026-11-02
    'dia': ('Greek diacritics', 1378374654),                   # 2026-10-04
    'orth': ('Greek orthography', 1372376819),                 # 2026-08-31
}
SRC = {k: f'Wikipedia, "{t}", revision {r}' for k, (t, r) in PAGES.items()}

# IPA symbol of the key's row -> its "English approximation" cell, the bold letters in [ ]
APPROX = {
    'c': 's[k]ew', 'k': 's[c]ar', 'x': 'Scottish English lo[ch], German Ba[ch]', 'ç': '[h]ue',
    'ʝ': 'similar to [y]es', 'ɣ': 'Spanish ami[g]o', 'ɡ': 'a[g]ain', 'ɟ': 'ar[g]ue',
    'p': 's[p]y', 'f': '[f]our', 'v': '[v]et', 'b': 'a[b]out', 't': 's[t]ay',
    'θ': '[th]ought', 'ð': '[th]e', 'd': 'to[d]ay', 'l': '[l]ook', 'm': '[m]ole', 'n': '[n]o',
    'ŋ': 'si[ng]', 'r': 'similar to American English au[t]umn or Scottish [r]ule',
    's': 'between [s]ip and [sh]ip (retracted)', 'z': 'between [z]one and [g]enre (retracted)',
    'ks': 'between di[x]on and di[cti]on (retracted)',
    'ps': 'between o[ps]on and o[pti]on (retracted)',
    't͡s': 'between ca[ts] and ca[tch] (retracted)',
    'd͡z': 'between bu[ds] and bu[dg]e (retracted)',
    'a': 'Australian English f[a]ther', 'e': 'b[e]t', 'i': 'like n[ea]t', 'o': 'ch[o]re',
    'u': 'p[oo]l (short)',
}
# which spellings the key's "MG" column gives each symbol (checked by --verify)
MG = {'c': 'κ', 'k': 'κ', 'x': 'χ', 'ç': 'χ', 'ʝ': 'γ', 'ɣ': 'γ', 'ɡ': 'γκ γγ', 'ɟ': 'γγ',
      'p': 'π', 'f': 'φ', 'v': 'β', 'b': 'μπ', 't': 'τ', 'θ': 'θ', 'ð': 'δ', 'd': 'ντ',
      'l': 'λ', 'm': 'μ', 'n': 'ν', 'ŋ': 'γ', 'r': 'ρ', 's': 'σ', 'z': 'ζ', 'ks': 'ξ',
      'ps': 'ψ', 't͡s': 'τσ', 'd͡z': 'τζ', 'a': 'α', 'e': 'ε', 'i': 'ι', 'o': 'ο ω', 'u': 'ου'}
# letter -> (English name, Greek name): the Letters table of "Greek alphabet"
NAMES = {
    'Α α': ('alpha', 'άλφα'), 'Β β': ('beta', 'βήτα'), 'Γ γ': ('gamma', 'γάμμα'),
    'Δ δ': ('delta', 'δέλτα'), 'Ε ε': ('epsilon', 'έψιλον'), 'Ζ ζ': ('zeta', 'ζήτα'),
    'Η η': ('eta', 'ήτα'), 'Θ θ': ('theta', 'θήτα'), 'Ι ι': ('iota', 'ιώτα'),
    'Κ κ': ('kappa', 'κάππα'), 'Λ λ': ('lambda', 'λάμδα'), 'Μ μ': ('mu', 'μυ'),
    'Ν ν': ('nu', 'νυ'), 'Ξ ξ': ('xi', 'ξι'), 'Ο ο': ('omicron', 'όμικρον'),
    'Π π': ('pi', 'πι'), 'Ρ ρ': ('rho', 'ρο'), 'Σ σ ς': ('sigma', 'σίγμα'),
    'Τ τ': ('tau', 'ταυ'), 'Υ υ': ('upsilon', 'ύψιλον'), 'Φ φ': ('phi', 'φι'),
    'Χ χ': ('chi', 'χι'), 'Ψ ψ': ('psi', 'ψι'), 'Ω ω': ('omega', 'ωμέγα'),
}
USED_Q = []                 # every phrase a card quotes, for --verify


def Q(page, phrase):
    """A phrase of a page, quoted on the card and checked by --verify."""
    USED_Q.append((page, phrase))
    return phrase


Q_PALATAL = Q('help', 'In Modern Greek, ⟨κ; γκ, γγ; γ; χ⟩ are pronounced as palatal [c, ɟ, ʝ, ç] '
                      'before the front vowels [e i], and velar [k, ɡ, ɣ, x] in other cases.')
Q_SIGMA_Z = Q('help', '⟨σ⟩ is pronounced as voiced [z] before a voiced consonant.')
Q_NASAL = Q('help', 'In Modern Greek, ⟨μπ, ντ, γκ, γγ⟩ are pronounced as prenasalised voiced stops '
                    '[mb, nd, ɲɟ, ŋɡ] or voiced stops without nasalisation [b, d, ɟ, ɡ].')
Q_AV = Q('help', 'In Modern Greek, ⟨υ⟩, in ⟨αυ ευ ηυ⟩, is pronounced as [f] before a voiceless '
                 'consonant or at the end of the word and [v] otherwise.')
Q_MID = Q('help', 'In Modern Greek, ⟨ε, αι⟩ represent [e], and ⟨ο, ω⟩ represent [o].')
Q_IOTA = Q('help', 'In Modern Greek, ⟨η, ῃ, ει, ι, οι, υ, υι⟩ all represent [i]')
Q_DOUBLE = Q('help', 'Modern Standard Greek does not have geminate consonants')
Q_HIATUS = Q('help', 'Also ⟨άι⟩ and sometimes ⟨άϊ⟩.')
Q_TONOS = Q('abc', "It uses only a single accent mark, the acute (also known in this context as "
                   "tonos, i.e. simply 'accent'), marking the stressed syllable of polysyllabic "
                   "words, and occasionally the diaeresis to distinguish diphthongal from digraph "
                   "readings in pairs of vowel letters")
Q_FINAL = Q('abc', 'with ⟨ς⟩ being used in word-final position and ⟨σ⟩ elsewhere')
Q_NG = Q('abc', '⟨γγ⟩ and ⟨γκ⟩ are pronounced like English ⟨ng⟩ like in the word finger (not like in '
                'the word thing)')
Q_GK = Q('abc', '⟨γκ⟩ is also used to stand for [g] before vowels [a], [o] and [u], and [ɟ] before '
                '[e] and [i]')
Q_GCH = Q('abc', 'the letter ⟨γ⟩, before another velar consonant, stands for the velar nasal [ŋ]')
Q_INITIAL = Q('phon', 'Word-initially and after /r/ or /l/, they are very rarely, if ever, '
                      'prenasalised.')
Q_STRESS = Q('phon', 'Modern Greek has variable (phonologically unpredictable) stress. Every '
                     'multisyllabic word carries stress on one of its three final syllables.')
Q_MOVES = Q('phon', 'The position of the stress can vary between different inflectional forms of '
                    'the same word within its inflectional paradigm.')
Q_GLIDE = Q('phon', 'The velars also merge with a following nonsyllabic /i/ to the corresponding '
                    'palatal before the vowels /a, o, u/, e.g. χιόνι [ˈçoni]')
Q_CAPS = Q('dia', 'In uppercase (all-caps), accents and breathings are eliminated, in titlecase '
                  'they appear to the left of the letter rather than above it.')
Q_QMARK = Q('orth', 'The principal difference is the Greek question mark ⟨;⟩')


def A(ipa, where='', sym=True):
    """One sound: `[ipa]` and the key's comparison, its stressed letters in bold.  The IPA
    writes the sound of θ with the Greek letter itself, so on that letter's own sound side,
    the question of its second card, the symbol is left out (`sym`)."""
    a = re.sub(r'\[([^\]]*)\]', r'<b>\1</b>', E(APPROX[ipa]))
    return (E(where) + ' ' if where else '') + (f'[{E(ipa)}] ' if sym else '') + a


def quoted(q):
    return f' <span class="uc-q">“{E(q)}”</span>'


# (shown, romanisation, the sound side, example word).  A letter's names come from NAMES.
LETTERS = [
    ('Α α', 'a', A('a'), 'άνθρωπος'),
    ('Β β', 'v', A('v'), 'βιβλίο'),
    ('Γ γ', 'g', A('ɣ') + '; ' + A('ʝ', 'before e and i sounds'), 'γάλα'),
    ('Δ δ', 'd', A('ð'), 'δέκα'),
    ('Ε ε', 'e', A('e'), 'εδώ'),
    ('Ζ ζ', 'z', A('z'), 'ζωή'),
    ('Η η', 'i', A('i'), 'ήλιος'),
    ('Θ θ', 'th', A('θ', sym=False), 'θάλασσα'),
    ('Ι ι', 'i', A('i'), 'ιδέα'),
    ('Κ κ', 'k', A('k') + '; ' + A('c', 'before e and i sounds'), 'καφές'),
    ('Λ λ', 'l', A('l'), 'λάδι'),
    ('Μ μ', 'm', A('m'), 'μήλο'),
    ('Ν ν', 'n', A('n'), 'νερό'),
    ('Ξ ξ', 'x', A('ks'), 'ξέρω'),
    ('Ο ο', 'o', A('o'), 'όνομα'),
    ('Π π', 'p', A('p'), 'πόρτα'),
    ('Ρ ρ', 'r', A('r'), 'ρύζι'),
    ('Σ σ ς', 's', A('s'), 'σπίτι'),
    ('Τ τ', 't', A('t'), 'τρένο'),
    ('Υ υ', 'y', A('i'), 'υπάρχω'),
    ('Φ φ', 'f', A('f'), 'φίλος'),
    ('Χ χ', 'ch', A('x') + '; ' + A('ç', 'before e and i sounds'), 'χέρι'),
    ('Ψ ψ', 'ps', A('ps'), 'ψωμί'),
    ('Ω ω', 'o', A('o'), 'ώρα'),
    # two letters, one sound
    ('ου', 'ou', A('u'), 'δουλειά'),
    ('αι', 'ai', A('e') + ' · two letters, the sound of ε', 'και'),
    ('ει', 'ei', A('i') + ' · two letters, the sound of ι', 'είμαι'),
    ('οι', 'oi', A('i') + ' · two letters, the sound of ι', 'οικογένεια'),
    ('υι', 'yi', A('i') + ' · two letters, the sound of ι', 'υιοθετώ'),
    ('αυ', 'av · af', '[av], or [af]: the υ is ' + A('v') + ', or ' + A('f') + quoted(Q_AV), 'αύριο'),
    ('ευ', 'ev · ef', '[ev], or [ef]: the υ is ' + A('v') + ', or ' + A('f') + quoted(Q_AV),
     'ευχαριστώ'),
    ('μπ', 'b · mp', A('b') + ', or [mb] inside a word' + quoted(Q_NASAL), 'μπίρα'),
    ('ντ', 'nt', A('d') + ', or [nd] inside a word' + quoted(Q_NASAL) + quoted(Q_INITIAL),
     'ντομάτα'),
    ('γκ', 'gk', A('ɡ') + '; ' + A('ɟ', 'before e and i sounds') + quoted(Q_GK), 'γκρίζος'),
    ('γγ', 'ng', '[ŋɡ]: ' + A('ŋ') + ' and ' + A('ɡ') + quoted(Q_NG), 'αγγλικά'),
    ('γχ', 'nch', 'the γ is ' + A('ŋ') + ', then χ' + quoted(Q_GCH), 'συγχωρώ'),
    ('τσ', 'ts', A('t͡s'), 'τσάι'),
    ('τζ', 'tz', A('d͡z'), 'τζάμι'),
    # the signs
    ('ά έ ή ί ό ύ ώ', '´', 'the accent, in Greek the tonos: it marks the stressed syllable'
     + quoted(Q_TONOS), 'ποτέ'),
    ('ϊ ϋ', '¨', 'the diaeresis, two dots over the second of two vowel letters: the two are read '
     'one after the other, not as a pair (o-i, where οι is [i]); an accent on the FIRST of the '
     'two letters does the same (άι)' + quoted(Q_TONOS) + quoted(Q_HIATUS), 'κοροϊδεύω'),
]
# the single letters that share their sound with another: their sound side names the letter
SHARED = ('Ε ε', 'Η η', 'Ι ι', 'Υ υ', 'Ο ο', 'Ω ω')
# example words that are not cards of Greek A1, because A1 has no word with the spelling
NOT_A1 = ('υιοθετώ', 'γκρίζος', 'τζάμι', 'κοροϊδεύω')

# ---- THE READING RULES -----------------------------------------------------------------
# (key, after which block, the question, what is shown, the answer in plain words, the quote,
#  its source page, the example word).  `say` is the quote in a beginner's words and claims
# nothing the quote does not.
RULES = [
    ('rule: final sigma', 'letters', 'One letter, two small shapes. Which stands where?', 'σ ς',
     'ς at the end of a word, σ everywhere else. The capital, Σ, has one shape.',
     Q_FINAL, 'abc', 'σύζυγος'),
    ('rule: capitals', 'signs', 'The same word three ways. Where has the accent gone?',
     'όχι · Όχι · ΟΧΙ',
     'On a capital letter the accent stands to its left; a word written all in capitals has none.',
     Q_CAPS, 'dia', 'όχι'),
    ('rule: question mark', 'signs', 'What is the mark at the end?', 'Τι;',
     'A question mark. Greek writes ; where English writes ?',
     Q_QMARK, 'orth', 'τι'),
    ('rule: i', 'signs', 'Six spellings. How many sounds?', 'η ι υ ει οι υι',
     'One: every one of them is [i]. Reading is safe; which of the six a word is written with '
     'is learnt with the word.',
     Q_IOTA, 'help', 'οικογένεια'),
    ('rule: e and o', 'signs', 'Two pairs of spellings. How many sounds?', 'ε αι · ο ω',
     'Two: ε and αι are both [e], ο and ω are both [o].',
     Q_MID, 'help', 'ωραίος'),
    ('rule: palatal', 'signs', 'γ, κ and χ change before two sounds. Which, and how?',
     'γε γι · κε κι · χε χι',
     'Before an e or an i sound they are made further forward in the mouth: γ like the y of yes, '
     'κ like the k of skew, χ like the h of hue.',
     Q_PALATAL, 'help', 'χέρι'),
    ('rule: glide', 'signs', 'Two syllables or three?', 'χιόνι',
     'Two. Here the ι before a vowel is not a syllable of its own: it only changes the consonant '
     'before it.',
     Q_GLIDE, 'phon', 'χιόνι'),
    ('rule: double', 'signs', 'Two of the same consonant. Is it said twice, or longer?', 'λλ σσ νν',
     'No: a doubled consonant is said as one.',
     Q_DOUBLE, 'help', 'άλλος'),
    ('rule: sigma voiced', 'signs', 'How is the σ said here?', 'σμ',
     'As [z]: σ before a voiced consonant is voiced.',
     Q_SIGMA_Z, 'help', 'κόσμος'),
    ('rule: stress', 'signs', 'Does a word keep its stress in every form?', 'άνθρωπος · ανθρώπου',
     'No. The stress falls on one of the last three syllables and can stand on a different one '
     'in another form of the same word, so the accent is read on every form.',
     Q_STRESS + ' … ' + Q_MOVES, 'phon', 'άνθρωπος'),
]
RULE_FIELDS = ['Key', 'Ask', 'Show', 'Rule', 'Quote', 'Source', 'Example', 'Word']
# where each block of LETTERS ends: a rule is dealt after the block it needs
BLOCKS = [('letters', 'Ω ω'), ('pairs', 'τζ'), ('signs', 'ϊ ϋ')]

FIELDS = ['Letter', 'Name', 'Called', 'Sound', 'Example', 'Word']

SAY_NAME = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>'
SAY_WORD = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
LETTER = '<div class="uc-letter">{{Letter}}' + SAY_NAME + '</div>'
DETAIL = ('<div class="uc-field">{{#Called}}<div class="uc-pos">name</div><div class="uc-gl">'
          '{{Called}}</div><div class="uc-pos uc-gap">sound</div>{{/Called}}'
          '{{^Called}}<div class="uc-pos">sound</div>{{/Called}}<div class="uc-gl">{{Sound}}</div>'
          '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}'
          + SAY_WORD + '</div></div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>')
FRONT_L = LETTER
BACK_L = '{{FrontSide}}<hr>' + DETAIL
FRONT_S = ASK
BACK_S = '{{FrontSide}}<hr>' + LETTER + DETAIL
FRONT_R = '<div class="uc-ask">{{Ask}}</div><div class="uc-letter uc-show">{{Show}}</div>'
BACK_R = ('{{FrontSide}}<hr><div class="uc-field"><div class="uc-pos">how it is read</div>'
          '<div class="uc-gl">{{Rule}}</div><div class="uc-pos uc-gap">as in</div>'
          '<div class="uc-gl">{{Example}}' + SAY_WORD + '</div>'
          '<div class="uc-pos uc-gap">the source says</div>'
          '<div class="uc-gl uc-quote">“{{Quote}}”</div><div class="uc-src">{{Source}}</div></div>')

CSS = """.card {
  text-align: center;
  font-size: 17px;
  line-height: 1.6;
}
.uc-ask {
  margin-bottom: 14px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
.uc-letter {
  font-size: 60px;
  font-weight: 400;
  line-height: 1.3;
}
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
}
.uc-field {
  display: block;
  width: fit-content;
  min-width: min(300px, 100%);
  max-width: 100%;
  margin: 14px auto 0;
  padding: 11px 15px;
  border: 1px solid var(--rule, rgba(0,0,0,0.12));
  border-radius: 11px;
  text-align: left;
  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));
}
.uc-pos {
  margin-bottom: 3px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint, #6C6A63);
}
.uc-gap {
  margin-top: 10px;
}
.uc-gl {
  line-height: 1.5;
}
.uc-rm {
  font-weight: 600;
}
.uc-q {
  display: block;
  margin-top: 6px;
  font-size: 13.5px;
  opacity: 0.8;
}
.uc-ex {
  font-size: 21px;
}
.uc-exr {
  margin-left: 6px;
  font-size: 14px;
  opacity: 0.62;
}
.uc-exe {
  margin-left: 6px;
  opacity: 0.62;
}
"""
CSS_R = """.uc-show {
  font-size: 40px;
}
.uc-quote {
  font-size: 13.5px;
  opacity: 0.8;
}
.uc-src {
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.6;
}
"""


# ---- --verify --------------------------------------------------------------------------
def wikitext(key):
    title, rev = PAGES[key]
    d = os.path.join(CACHE, 'wiki')
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, f'{rev}.wiki')
    if not os.path.exists(p):
        # the revision's own wikitext.  curl, not urllib: Wikipedia answers Python's default
        # client with 429 (and its API, from a shared address, with a rate limit)
        url = f'https://en.wikipedia.org/w/index.php?action=raw&oldid={rev}'
        text = subprocess.run(['curl', '-sS', '--fail', '-A', 'deck-tooling/1.0', url],
                              capture_output=True, text=True, check=True).stdout
        assert len(text) > 5000, f'revision {rev} of {title} came back empty'
        open(p, 'w', encoding='utf-8').write(text)
    return open(p, encoding='utf-8').read()


INNER = re.compile(r'\{\{([^{}]*)\}\}')


def _tpl(m):
    parts = m.group(1).split('|')
    name = parts[0].strip().lower()
    if name in ('lang', 'wikt-lang', 'tlit', 'langx'):
        return parts[2] if len(parts) > 2 else ''
    if name in ('ipa', 'big', 'small', 'smaller', 'mono', 'char'):
        return parts[-1] if len(parts) > 1 and name != 'ipa' else (parts[1] if len(parts) > 1 else '')
    if name in ('ipa link', 'ipalink'):
        return parts[-1]
    if name in ('ipablink', 'ipaslink', 'ipaplink'):
        return ('[%s]' if name == 'ipablink' else '/%s/' if name == 'ipaslink' else '%s') % parts[-1]
    if name in ('angbr', 'angbr ipa', 'angle bracket'):
        return '⟨' + '|'.join(parts[1:]) + '⟩'
    if name in ('refn', 'efn'):          # a note: its text is the page's
        return ' ' + parts[-1] + ' '
    return ''


def flat(w, bold=False, refs=True):
    """The page as a reader sees its words: comments, reference TAGS (not their text),
    templates, links and quote marks removed.  With `bold`, '''x''' becomes [x]."""
    w = re.sub(r'<!--.*?-->', '', w, flags=re.S)
    w = re.sub(r'<ref[^>]*/>', '', w)
    if not refs:
        w = re.sub(r'<ref[^>]*>.*?</ref>', '', w, flags=re.S)
    w = re.sub(r'</?ref[^>]*>', ' ', w)
    w = re.sub(r"'''(.*?)'''", r'⟦\1⟧' if bold else r'\1', w)
    w = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', w)      # before the templates: a link's | is not a parameter's
    for _ in range(6):
        w = INNER.sub(_tpl, w)
    w = w.replace("''", '').replace('&nbsp;', ' ')
    w = re.sub(r'</?(?:u|big|small|sup|sub)>|<br ?/?>', '', w)
    w = w.replace('⟦', '[').replace('⟧', ']')
    return re.sub(r'[ \t]+', ' ', w)


def key_rows():
    """Help:IPA/Greek's rows: IPA symbol -> (the row's text, its English approximation)."""
    w = wikitext('help')
    w = w[:w.index('==See also==')]
    rows, ipa, approx = {}, None, None
    for raw in w.split('\n|-'):
        m = re.search(r'\{\{IPA link\|([^}|]*)(?:\|([^}]*))?\}\}|<big>\{\{IPA\|([^}]*)\}\}</big>'
                      r'|\|\s*\{\{IPA\|([^}\[\]]*)\}\}\s*\n', raw)
        cells = [c for c in flat(raw, bold=True, refs=False).split('\n') if c.startswith('|')]
        last = re.sub(r'^\|(?:[^|\[\]]*\|)?\s*', '', cells[-1]).strip() if cells else ''
        if m:
            ipa = next(g for g in (m.group(2), m.group(1), m.group(3), m.group(4)) if g)
            approx = None
        # a cell of Greek (the example, or the MG column) is not the approximation: the row
        # shares the one above it (rowspan)
        if last and not re.search(r'[Ͱ-Ͽἀ-῿]', last) and len(cells) > 1:
            approx = last
        if ipa:
            text, a = rows.get(ipa, ('', None))
            rows[ipa] = (text + ' ' + flat(raw), a or approx)
    return rows


def verify():
    bad = 0
    rows = key_rows()
    for ipa, want in APPROX.items():
        text, got = rows.get(ipa, ('', None))
        if got != want:
            bad += 1
            print(f'FAIL  [{ipa}]: the key says {got!r}, the deck {want!r}')
        for sp in MG[ipa].split():
            if sp not in text:
                bad += 1
                print(f'FAIL  [{ipa}]: the key does not give it the spelling {sp}')
    abc = wikitext('abc')
    table = abc[abc.index('=== Sound values ==='):abc.index('=== Digraphs and letter combinations ===')]
    for shown, (en, el) in NAMES.items():
        row = next((r for r in table.split('\n|-') if '{{lang|el|' + shown.replace(' ς', '').replace(' ', ' ') in r
                    or (shown == 'Σ σ ς' and 'Σ&nbsp;σ/ς' in r)), '')
        if not re.search(r'\[\[(?:[^\]|]*\|)?' + en + r'[\],]', row) or el not in row:
            bad += 1
            print(f'FAIL  {shown}: the Letters table does not name it {en}, {el}')
    pages = {k: flat(wikitext(k)) for k in PAGES}
    for page, phrase in USED_Q:
        if phrase not in pages[page]:
            bad += 1
            print(f'FAIL  not in {SRC[page]}: {phrase}')
    if bad:
        raise SystemExit(f'{bad} failed')
    print(f'alphabet --verify: {len(APPROX)} comparisons are cells of Help:IPA/Greek (revision '
          f'{PAGES["help"][1]}), {len(NAMES)} letters carry the names of the Letters table of '
          f'"Greek alphabet" (revision {PAGES["abc"][1]}), and {len(USED_Q)} phrases stand in '
          'their pages: ' + ', '.join(f'{t} {r}' for t, r in PAGES.values()))


# ---- the deck --------------------------------------------------------------------------
def main():
    if '--verify' in sys.argv:
        return verify()
    p = os.path.join(CACHE, 'lex.json')
    if not os.path.exists(p):
        raise SystemExit("alphabet.py reads the example words from lex.json: "
                         "run `python3 .claude/greek/run.py` once first")
    lex = json.load(open(p, encoding='utf-8'))
    deck = os.path.join(HERE, '..', '..', 'decks', 'Greek-A1.folio-deck.json')
    a1 = {c['fields']['Word']: c['fields'] for c in json.load(open(deck, encoding='utf-8'))['cards']}
    short = lambda g: re.sub(r'\s*\([^()]*\)', '', g).strip(' ;,')

    def example(word):
        """The word as its Greek A1 card prints it -- romanisation, IPA, first meaning -- or,
        for the four spellings A1 has no word for, as `lex.json` has it, by the same rules."""
        assert (word in a1) != (word in NOT_A1), f'{word}: an example is an A1 card, or is named in NOT_A1'
        if word in a1:
            F = a1[word]
            wr, ipa = html.unescape(F['Roman']).split()[-1], html.unescape(F['IPA'])
            m = re.search(r'<li>(.*?)</li>|<div class="uc-gl">(.*?)</div>', F['English'])
            g = re.sub(r'<span class="uc-eg">.*?</span>', '', m.group(1) or m.group(2))
            g = short(html.unescape(re.sub(r'<[^>]+>', '', g)))
        else:
            L = lex.get(fold(word)) or {}
            ents = [e for e in L.get('entries', []) if any(not g['weak'] for g in e['glosses'])]
            assert ents, f'{word} is not a Wiktionary headword in lex.json'
            e = ents[0]
            wr = e['roman'] or translit(word)
            ipa = e.get('ipa') or next((x['ipa'] for x in ents if x.get('ipa')), '')
            g = short(next(x['g'] for x in e['glosses'] if not x['weak']))
        return (f'<span class="uc-ex">{E(word)}</span><span class="uc-exr">{E(wr)}</span>'
                + (f'<span class="uc-exr">{E(ipa)}</span>' if ipa else '')
                + f'<span class="uc-exe">{E(g)}</span>')

    cards = []
    for shown, rom, sound, word in LETTERS:
        en, el = NAMES.get(shown, ('', ''))
        named = f' · the letter {E(en)}' if shown in SHARED else ''
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown),
            'Name': E(el or shown),
            'Called': (f'{E(en)} · {E(el)}<span class="uc-exr">{E(translit(el))}</span>' if el else ''),
            'Sound': (f'<span class="uc-rm">{E(rom)}</span> · ' if rom not in ('´', '¨') else '')
                     + sound + named,
            'Example': example(word),
            'Word': E(word),
        }, 'type': TYPE_ID})
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == len(cards), 'two letters share a sound side: the reverse card is unanswerable'
    for c in cards:      # the reverse card's question must not print its own answer
        letters = [x for x in html.unescape(c['fields']['Letter']).split() if len(c['fields']['Letter']) < 9]
        front = re.sub(r'<span class="uc-q">.*?</span>', '', c['fields']['Sound'])
        assert not any(x in html.unescape(re.sub(r'<[^>]+>', '', front)) for x in letters), \
            f'{c["fields"]["Letter"]}: its sound side prints the letter outside a quotation'
    shown_at = {html.unescape(c['fields']['Letter']): i for i, c in enumerate(cards)}
    cut, start = {}, 0
    for name, last in BLOCKS:
        cut[name] = cards[start:shown_at[last] + 1]
        start = shown_at[last] + 1
    assert start == len(cards), 'BLOCKS does not cover LETTERS'
    rules = {}
    for key, after, ask, show, say, quote, page, word in RULES:
        rules.setdefault(after, []).append({'sub': '', 'fields': {
            'Key': E(key), 'Ask': E(ask), 'Show': E(show), 'Rule': E(say), 'Quote': E(quote),
            'Source': E(SRC[page]), 'Example': example(word), 'Word': E(word),
        }, 'type': RULE_TYPE})
    cards = (cut['letters'] + rules.get('letters', []) + cut['pairs'] + rules.get('pairs', [])
             + cut['signs'] + rules.get('signs', []))
    # numbered by position here; greek-fix.js gives every note back its pinned number
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_elabc_{i}'
    n, nr = len(cards), len(RULES)
    nl = n - nr
    desc = (
        f"The Greek alphabet as Modern Greek uses it, and how it is read: {n} notes. The "
        "twenty-four letters in order, capital and small, each with its English and its Greek "
        f"name; the {len(cut['pairs'])} two-letter spellings, because Greek writes several single "
        "sounds with two letters (ου is [u], μπ is [b], ντ is [d]); the two signs, the accent and "
        f"the diaeresis; and {nr} reading rules. The first deck of the Greek collection. A letter, "
        "a pair or a sign is studied in both directions — see it and recall its sound, or see a "
        "sound and recall the letter — each a card with its own schedule; a reading rule is one "
        "card, a question and its answer. Every note gives the romanisation the level decks use, "
        "the sound, and one word that shows it with a speaker beside it: a word of Greek A1 "
        "wherever A1 has one, with the romanisation, the pronunciation and the meaning its A1 "
        "card gives (A1 has no word with γκ, τζ, υι or a diaeresis; those four examples are "
        "other dictionary words). THE ROMANISATION FOLLOWS THE SPELLING, NOT THE SOUND: it "
        "writes αι as ai, ει as ei, οι as oi, υ as y, ντ as nt and γκ as gk, so the sound is "
        "given beside it in the International Phonetic Alphabet, between square brackets, with "
        "an English word to compare. Greek spelling is regular to READ — a reader who knows "
        "these letters, pairs and rules can say any word aloud — and not to WRITE: the sound "
        "[i] is spelled six ways (η, ι, υ, ει, οι, υι) and [e] and [o] two ways each, so the "
        "sound side of those letters names the letter, and which spelling a word takes is learnt "
        "with the word. WHERE EVERY SOUND COMES FROM: each sound and English comparison is a "
        "cell of Wikipedia's pronunciation key for Greek (Help:IPA/Greek, revision "
        f"{PAGES['help'][1]}), each letter's names are those of the Letters table of Wikipedia's "
        f"article \"Greek alphabet\" (revision {PAGES['abc'][1]}), and each rule is a sentence "
        "quoted, between quotation marks, from one of those two pages or from \"Modern Greek "
        f"phonology\" (revision {PAGES['phon'][1]}), \"Greek diacritics\" (revision "
        f"{PAGES['dia'][1]}) or \"Greek orthography\" (revision {PAGES['orth'][1]}); the plain "
        "line above a quotation says the same thing in a beginner's words and nothing more. "
        "The comparisons are approximations, as the key itself says. The example words' "
        "romanisations, pronunciations and meanings are English Wiktionary's, via the kaikki.org "
        "extraction (CC BY-SA 4.0); Wikipedia's text is CC BY-SA 4.0."
    )
    meta = {
        'id': 'elabc', 'title': 'Greek Alphabet',
        'subtitle': f'{nl} letters, letter pairs and signs in both directions · {nr} reading rules',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['greek', 'alphabet'], 'glossMode': 'site',
        'types': {
            TYPE_ID: {
                'id': TYPE_ID, 'name': 'Greek letter', 'speechLang': 'el-GR',
                'fields': FIELDS,
                'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                          {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
                'css': CSS,
            },
            RULE_TYPE: {
                'id': RULE_TYPE, 'name': 'Greek reading rule', 'speechLang': 'el-GR',
                'fields': RULE_FIELDS,
                'cards': [{'name': 'Reading rule', 'front': FRONT_R, 'back': BACK_R}],
                'css': CSS + CSS_R,
            },
        },
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(HERE, '..', '..', 'decks', 'Greek-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
