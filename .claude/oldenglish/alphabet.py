#!/usr/bin/env python3
"""Write the Old English alphabet deck: `decks/Old-English-Alphabet.folio-deck.json`.

    python3 .claude/oldenglish/alphabet.py             # write the deck (reads Level 1's deck file)
    python3 .claude/oldenglish/alphabet.py --verify    # every sound and rule is in its source

The first deck of the Old English collection, sorted before Level 1 by
`levelRank`'s "Alphabet" rule.  It is how to READ the level decks: their
headwords carry an editor's macrons and dots (stān, iċ, ġēar) and a line of IPA,
and there is no speaker, so this deck is the only place the sounds are taught --
and it is where a reader learns what the SENTENCES print differently, since half
of them are Ælfric's in Thorpe's 1844 text: no macron, no dot, ð as often as þ,
an acute here and there, y where the card has ie.

WHAT IS IN IT.  One note per letter or spelling, two cards each (letter -> sound,
sound -> letter), in the order a primer teaches them: the vowels short and long,
the diphthongs, the consonants that differ from modern English, three things that
hold for every word (every letter is said, a double consonant is long, ġe- is
unstressed), the consonants that do not differ, and the scribes' letters (wynn,
insular g, the abbreviations for þæt and for and).  Then EIGHT READING RULES of
card type `oe-read`, one card each (a rule has no "sound -> letter" side), dealt
after the block they need: the macron, the IPA line, ie against y, the dots,
þ against ð, f s þ between voiced sounds, the stress, and Thorpe's acute.

WHERE EVERY SOUND COMES FROM (the beginner pass, 2026-11-27; docs/lang-decks.md, "The Old
English beginner pass").  Until then the sound sides were the author's own comparisons and
named "Sweet's Primer, 'Sounds'", which says none of them: "like German See", "like Dutch
g", "as in Italian or in bookcase", "a trilled or tapped r", "as in British hot but with
rounder lips".  Now:
  · every IPA symbol and English comparison is a ROW of Wikipedia's key, Help:IPA/Old
    English, columns "IPA" and "Modern English approximation" (`APPROX`), the stressed
    letters of the cell in bold as the key prints them, and the letter given each symbol is
    one the key's "Examples" cell prints in bold for it (`SPELL`);
  · every rule is a PHRASE of the key's notes, of "Old English phonology" or of the
    Orthography section of "Old English" (`Q`), printed between double quotes; the plain
    line above it claims nothing the phrase does not.
`--verify` fetches the three revisions (a revision never changes) with curl -- Wikipedia
answers Python's default client with 429 -- and fails if a cell or a phrase is not in them.
It needs the network (or the cache) and is not a CI step.

THE CARD'S OWN FIGURES.  Two rule cards say something about this collection's cards rather
than about Old English -- that the level cards join a diphthong's vowels with a tie and
put the length mark after both, and that the sentences from Thorpe's Ælfric carry no macron
and no dot.  Those are asserted against Level 1's deck file here, every run.

THE EXAMPLE WORDS are cards of Level 1 (asserted), and a word's IPA and meaning are read off
its card in `decks/Old-English-Level-1.folio-deck.json` (run `run.py` first), so the two
decks agree; nothing about a word is typed here.  A re-run is byte-identical whenever
Level 1 is.

IDS.  The notes are numbered here by position and `node .claude/decks/oldenglish-fix.js`
gives each one back its pinned number (`oldenglish-ids.json`: a letter by what its card
prints, a rule by its `Key`).  A NEW note needs a row there.
"""
import html, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'oe-abc'
RULE_TYPE = 'oe-read'
COLOR = '#004E30'
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'oldenglish-cache')
L1 = os.path.join(HERE, '..', '..', 'decks', 'Old-English-Level-1.folio-deck.json')

# ---- the sources, each at one revision -------------------------------------------------
PAGES = {
    'help': ('Help:IPA/Old English', 1355663743),
    'phon': ('Old English phonology', 1364038675),
    'oe': ('Old English', 1388030632),
}
SRC = {k: f'Wikipedia, "{t}", revision {r}' for k, (t, r) in PAGES.items()}

# IPA symbol of the key's row -> its "Modern English approximation" cell, the bold letters in [ ]
APPROX = {
    'b': '[b]usy', 'ç': '[h]ue', 'd': '[d]o', 'dʒ': '[j]am', 'ð': 'o[th]er', 'f': '[f]ather',
    'ɡ': '[g]ood', 'h': '[h]eaven', 'j': '[y]ear', 'k': '[k]ing', 'l': '[l]eaf',
    'l̥': 'whispered [l]eaf', 'm': '[m]other', 'n': '[n]ear', 'n̥': 'whispered [n]ear',
    'ŋ': 'you[ng]', 'p': '[p]ath', 'r': '[r]ead', 'rˠ': '[ru]ff', 'r̥': 'whispered [r]ead',
    's': '[s]un', 'ʃ': '[sh]adow', 't': 's[t]and', 'tʃ': '[ch]eese', 'θ': '[th]rough',
    'v': 'o[v]er', 'ɣ': 'Spanish fue[g]o', 'w': '[w]ife', 'ʍ': '[wh]at (some speakers)',
    'x': 'lo[ch] (Scottish English)', 'z': 'bu[s]y',
    'ɑ': 'c[o]t (American English)', 'ɑː': 'f[a]ther', 'æ': 'c[a]t', 'æː': 'd[a]d',
    'e': 'Spanish t[e]', 'eː': 'similar to m[a]de', 'i': 'f[ee]t', 'iː': 'n[ee]d',
    'o': 'sh[o]rt', 'oː': 'd[oo]r', 'u': 'p[u]ll', 'uː': 'p[oo]l',
    'y': 'y[ou]th (some dialects); French t[u]', 'yː': 'y[ou] (some dialects); German D[ü]rer',
    'æɑ': 'm[ou]th (Cockney)', 'æːɑ': 'n[ow] (Cockney)', 'eo': 'b[e]d + r[o]d',
    'eːo': 'sn[ail] (MLE)', 'iy': 'f[ee]t + French t[u]', 'iːy': 'n[ee]d + French t[u]',
}
# the spelling this deck gives each symbol: one the key's Examples cell prints in bold for it
SPELL = {
    'b': 'b', 'ç': 'h', 'd': 'd', 'dʒ': 'ġ ċġ', 'ð': 'þ', 'f': 'f', 'ɡ': 'g', 'h': 'h', 'j': 'ġ',
    'k': 'c', 'l': 'l', 'l̥': 'hl', 'm': 'm', 'n': 'n', 'n̥': 'hn', 'ŋ': 'n', 'p': 'p', 'r': 'r',
    'rˠ': 'r', 'r̥': 'hr', 's': 's', 'ʃ': 'sċ', 't': 't', 'tʃ': 'ċ', 'θ': 'þ', 'v': 'f', 'ɣ': 'g',
    'w': 'ƿ', 'ʍ': 'hƿ', 'x': 'h', 'z': 's',
    'ɑ': 'a', 'ɑː': 'ā', 'æ': 'æ', 'æː': 'ǣ', 'e': 'e', 'eː': 'ē', 'i': 'i', 'iː': 'ī', 'o': 'o',
    'oː': 'ō', 'u': 'u', 'uː': 'ū', 'y': 'y', 'yː': 'ȳ', 'æɑ': 'ea', 'æːɑ': 'ēa', 'eo': 'eo',
    'eːo': 'ēo', 'iy': 'ie', 'iːy': 'īe',
}
USED_Q = []                 # every phrase a card quotes, for --verify


def Q(page, phrase):
    """A phrase of a page, quoted on the card and checked by --verify."""
    USED_Q.append((page, phrase))
    return phrase


Q_DOT = Q('help', '⟨ċ ċġ sċ⟩, with a dot above, represent postalveolar [tʃ dʒ ʃ] in modern '
                  'editions; ⟨ġ⟩ usually represents the palatal approximant [j] but represents '
                  '[dʒ] after ⟨n⟩.')
Q_VOICE = Q('help', '⟨s f ð/þ⟩ represented voiceless fricatives [s f θ] at the beginning and the '
                    'end of a word or when doubled in the middle but represented voiced '
                    'fricatives [z v ð] when single between voiced sounds.')
Q_AITCH = Q('help', 'it was pronounced [h] word-initially, [ç] when it was single and after a '
                    'front vowel, and [x] otherwise.')
Q_HW = Q('help', 'The sonorants /r l n w/ had voiceless versions [l̥ r̥ n̥ ʍ], which developed '
                 'from the earlier consonant clusters /xl xr xn xw/.')
Q_LONG = Q('help', 'Old English had geminate (double) consonants, which were pronounced longer '
                   'than single consonants.')
Q_LEN = Q('help', 'Long monophthongs are marked by placing the length symbol ⟨ː⟩ after the vowel '
                  'symbol')
Q_MARK = Q('help', 'stress mark (placed right before the stressed syllable)')
Q_R = Q('help', 'The exact nature of the rhotic /r/ is unknown.')
Q_X = Q('help', '⟨x⟩ represented the cluster /ks/, as Modern English still does.')
Q_IE = Q('help', 'The diphthongs ⟨ie īe⟩ occurred in West Saxon and may have been pronounced '
                 '/ie iːe/ or /iy iːy/.')
Q_W = Q('help', 'The letter ⟨w⟩ did not exist in the Early Middle Ages, when Old English was '
                'spoken.')
Q_MACRON = Q('oe', 'Macrons are used to indicate long vowels, where usually no distinction was '
                   'made between long and short vowels in the originals.')
Q_ACUTE = Q('oe', 'In some older editions an acute accent mark was used for consistency with Old '
                  'Norse conventions.')
Q_DOTS = Q('oe', 'modern editions often distinguish between velar and palatal ⟨c⟩ and ⟨g⟩ by '
                 'placing dots above the palatals: ⟨ċ⟩, ⟨ġ⟩.')
Q_C = Q('oe', 'Word-initially before another consonant, the pronunciation of ⟨c⟩ is always /k/; '
              'before ⟨i⟩, it is usually /tʃ/.')
Q_CG = Q('oe', 'in modern editions, the palatal geminate is sometimes written ⟨ċġ⟩ to distinguish '
               'it from velar ⟨cg⟩.')
Q_SC = Q('oe', 'At the start of a word, the usual pronunciation is palatalised sċ /ʃ/.')
Q_NG = Q('oe', 'The allophone [ŋ] occurred before a velar plosive ([k] or [ɡ]).')
Q_BOTH = Q('oe', 'Both ⟨þ⟩ and ⟨ð⟩ could represent either allophone of /θ/, voiceless [θ] or '
                 'voiced [ð], but some texts show a tendency to use ⟨þ⟩ at the start of words and '
                 '⟨ð⟩ in the middle or at the end of a word.')
Q_SILENT = Q('oe', 'There were not usually any silent letters – in the word cniht, for example, '
                   'both the ⟨c⟩ and ⟨h⟩ were pronounced')
Q_WYNN = Q('oe', 'Old English manuscripts typically represented the sound /w/ with the letter ⟨ƿ⟩, '
                 'called wynn and derived from the rune of the same name.')
Q_INSULAR = Q('oe', 'In Old English manuscripts, this letter usually took its insular form ⟨ᵹ⟩.')
Q_THAT = Q('oe', 'A common scribal abbreviation was a thorn with a stroke ⟨ꝥ⟩, which was used for '
                 'the pronoun þæt (that).')
Q_AND = Q('oe', 'Also used was the Tironian note ⟨⁊⟩ (a character similar to the digit ⟨7⟩) for '
                'the conjunction and.')
Q_ASH = Q('oe', '⟨æ⟩ (æsc, modern ash)')
Q_EWS = Q('phon', 'The diphthong ⟨ie⟩ ie, īe was found exclusively in Early West Saxon.')
Q_LWS = Q('phon', 'This "unstable ī̆" sound typically corresponds to ȳ̆ in Late West Saxon, as in '
                  "gelȳfan for earlier gelīefan and gelīfan ('to believe').")
Q_STRESS = Q('phon', 'Stress typically could be found only on the first or leftmost syllable of '
                     'a root morpheme.')
Q_PREFIX = Q('phon', 'The prefixes ġe- and be- were always fully unstressed, and the prefix for- '
                     'was nearly always unstressed.')
Q_PHONEMIC = Q('phon', "the phoneme /θ/ was pronounced as the voiced sound [ð] in the words eorðe "
                       "'earth' and fæþm 'fathom', which can be phonemically transcibed as "
                       "/ˈe͝orθe/, /ˈfæθm/ and phonetically transcribed as [ˈe͝orðe], [ˈfæðm].")


def A(ipa, where=''):
    """One sound: `[ipa]` and the key's comparison, its stressed letters in bold."""
    a = re.sub(r'\[([^\]]*)\]', r'<b>\1</b>', E(APPROX[ipa]))
    return (E(where) + ' ' if where else '') + f'[{E(ipa)}] ' + a


def quoted(*qs):
    return ''.join(f' <span class="uc-q">“{E(q)}”</span>' for q in qs)


# (letter(s) shown -- the pin's key, never reworded --, its name or what it is, the sound side,
#  example words).  The order is the order the deck is dealt.
LETTERS = [
    # ---- vowels: a macron marks a long vowel
    ('a', 'short a', A('ɑ'), ['habban']),
    ('ā', 'long a', A('ɑː'), ['stān']),
    ('æ', 'ash (æsc)', A('æ') + quoted(Q_ASH), ['dæġ']),
    ('ǣ', 'long ash', A('æː'), ['sǣ']),
    ('e', 'short e', A('e'), ['etan']),
    ('ē', 'long e', A('eː'), ['hē']),
    ('i', 'short i', A('i'), ['iċ']),
    ('ī', 'long i', A('iː'), ['līf']),
    ('o', 'short o', A('o'), ['god']),
    ('ō', 'long o', A('oː'), ['bōc']),
    ('u', 'short u', A('u'), ['sunu']),
    ('ū', 'long u', A('uː'), ['hūs']),
    ('y', 'short y', A('y'), ['yfel']),
    ('ȳ', 'long y', A('yː'), ['fȳr']),
    # ---- diphthongs: two vowels in ONE syllable
    ('ea', 'short diphthong', A('æɑ'), ['eald']),
    ('ēa', 'long diphthong', A('æːɑ'), ['ēage']),
    ('eo', 'short diphthong', A('eo'), ['heorte']),
    ('ēo', 'long diphthong', A('eːo'), ['dēofol']),
    ('ie', 'short diphthong (early West Saxon)', A('iy') + quoted(Q_IE), ['ġiefan']),
    ('īe', 'long diphthong (early West Saxon)', A('iːy') + quoted(Q_IE), ['hīeran']),
    # ---- consonants unlike modern English
    ('c', 'c without a dot', A('k') + quoted(Q_C), ['cuman', 'cyning']),
    ('ċ', 'c with a dot', A('tʃ') + quoted(Q_DOT), ['ċild', 'iċ']),
    ('g', 'g without a dot', A('ɡ') + ', the key\'s example gōd; ' + A('ɣ')
     + ', its examples magan and dagum', ['gōd', 'āstīgan']),
    ('ġ', 'g with a dot', A('j') + '; after n, ' + A('dʒ') + quoted(Q_DOT), ['ġēar', 'dæġ']),
    ('ċġ', 'cg', A('dʒ') + ', doubled between vowels: [ddʒ]' + quoted(Q_CG), ['seċġan']),
    ('sċ', 'sc', A('ʃ') + quoted(Q_SC), ['sċulan', 'sċēap']),
    ('h', 'h', A('h') + ' at the start of a word; ' + A('ç') + ' after a front vowel; otherwise '
     + A('x') + quoted(Q_AITCH), ['hund', 'niht']),
    ('hw, hl, hn, hr', 'h before a consonant', A('ʍ') + '; ' + A('l̥') + '; ' + A('n̥') + '; '
     + A('r̥') + quoted(Q_HW), ['hwæt', 'hlāf']),
    ('f', 'f', A('f') + '; single between voiced sounds, ' + A('v') + quoted(Q_VOICE),
     ['fæder', 'heofon']),
    ('s', 's', A('s') + '; single between voiced sounds, ' + A('z') + quoted(Q_VOICE),
     ['sāwol', 'ārīsan']),
    ('þ, ð', 'thorn and eth', A('θ') + '; single between voiced sounds, ' + A('ð')
     + '. Two letters, one sound' + quoted(Q_BOTH), ['þing', 'ōþer']),
    ('r', 'r', A('r') + '; before a consonant ' + A('rˠ') + quoted(Q_R), ['rīċe', 'heorte']),
    ('x', 'x', '[ks]: ' + A('k') + ' and ' + A('s') + quoted(Q_X), ['weaxan']),
    ('ng', 'n before g', '[ŋɡ]: ' + A('ŋ') + ', then ' + A('ɡ') + quoted(Q_NG),
     ['singan', 'cyning']),
    # ---- three things that hold for every word
    ('cn, gn, wr, wl', 'two consonants at the start',
     'both are said: no letter is silent' + quoted(Q_SILENT), ['cniht', 'āwrītan']),
    ('bb, dd, ll, nn, tt …', 'double consonants',
     'a double consonant is said longer than a single one' + quoted(Q_LONG), ['habban', 'sittan']),
    ('ġe-', 'an unstressed prefix',
     '[je], ' + A('j') + ' and ' + A('e') + ': never stressed, and no more are be- and, nearly '
     'always, for-' + quoted(Q_PREFIX), ['ġesēon', 'forġiefan']),
    ('b, d, l, m, n, p, t, w', 'the rest',
     ', '.join(A(x) for x in ('b', 'd', 'l', 'm', 'n', 'p', 't', 'w')), ['mōdor', 'wīf']),
    # ---- the scribes' letters
    ('ƿ', 'wynn', 'the manuscripts\' letter for ' + A('w') + '; editions print w, and some of '
     'Tatoeba\'s sentences print ƿ' + quoted(Q_WYNN, Q_W), ['wīf']),
    ('ᵹ', 'insular g', 'the manuscripts\' shape of g, read as g or ġ; editions print g'
     + quoted(Q_INSULAR), ['ġēar']),
    ('ꝥ', 'the abbreviation for þæt', 'a thorn with a stroke: the scribes\' shorthand for þæt'
     + quoted(Q_THAT), ['þæt']),
    ('⁊', 'the abbreviation for and', 'the scribes\' sign for and, shaped like a 7'
     + quoted(Q_AND), ['and']),
]

# ---- THE READING RULES -----------------------------------------------------------------
# (key, after which note, the question, what is shown, the answer in plain words, the quotes,
#  their source page, the example word).  The answer claims nothing the quotes do not --
#  except a statement about THIS COLLECTION'S CARDS, which `card_facts` asserts.
RULES = [
    ('rule: macron', 'ȳ', 'The line over the vowel: what does it mean, and who wrote it?',
     'stān · stan',
     'A long vowel. The line, a macron, is a modern editor\'s: the manuscripts mark no length, so '
     'a text may print the same word without it.',
     [Q_MACRON], 'oe', 'stān'),
    ('rule: ipa', 'ȳ', 'Slashes or square brackets under a headword: what is the difference?',
     '/…/ · […]',
     'Square brackets give the sounds as they are said, slashes only the sounds the word is built '
     'from: an f, s or þ said [v], [z], [ð] is still /f/, /s/, /θ/ between slashes. ː marks a long '
     'sound and ˈ stands before the stressed syllable. These cards join the two vowels of a '
     'diphthong with a tie and put the length mark after both: [æ͜ɑː].',
     [Q_PHONEMIC, Q_LEN, Q_MARK], 'phon', 'heofon'),
    ('rule: ie', 'īe', 'One word, three spellings. Which is the early one, and what do later '
     'texts write?', 'ġelīefan · gelȳfan · gelīfan',
     'ie is early West Saxon, and the spelling the cards print. Late West Saxon writes y for it, '
     'or i: a word under ie on its card can stand under y in a sentence.',
     [Q_EWS, Q_LWS], 'phon', 'ġelīefan'),
    ('rule: dots', 'ng', 'c or ċ, g or ġ: who writes the dot?', 'c ċ · g ġ',
     'A modern editor, to tell the palatal sounds from the velar ones. The manuscripts print '
     'plain c and g, and so do the sentences here from Thorpe\'s Ælfric: the card\'s headword '
     'shows which it is.',
     [Q_DOTS], 'oe', 'iċ'),
    ('rule: thorn', 'ng', 'þ and ð: two sounds?', 'þ ð',
     'No: one sound, two letters, and a scribe writes either. The cards print þ; a sentence may '
     'print ð in the same word.',
     [Q_BOTH], 'oe', 'ōþer'),
    ('rule: voicing', 'ng', 'How are f, s and þ said between two voiced sounds?',
     'heofon · ārīsan · ōþer',
     'Voiced, when single: [v], [z], [ð]. At the beginning or the end of a word, or doubled, they '
     'are [f], [s], [θ].',
     [Q_VOICE], 'help', 'heofon'),
    ('rule: stress', 'ġe-', 'Where is the stress?', 'heofon · ġesēon',
     'On the first syllable of the root: the first syllable of the word, unless the word begins '
     'with an unstressed prefix — ġe- and be- always, for- nearly always.',
     [Q_STRESS, Q_PREFIX], 'phon', 'ġesēon'),
    ('rule: acute', '⁊', 'A mark the cards never print. What is it?', 'hé · hē',
     'Not another vowel. Thorpe\'s 1844 text of Ælfric prints an acute over some vowels and never '
     'a macron; older editions used the acute. Read the word as its card spells it.',
     [Q_ACUTE], 'oe', 'hē'),
]
RULE_FIELDS = ['Key', 'Ask', 'Show', 'Rule', 'Quote', 'Source', 'Example', 'Word']
FIELDS = ['Letter', 'Name', 'Sound', 'Example', 'Word']

LETTER = '<div class="uc-letter">{{Letter}}</div><div class="uc-name">{{Name}}</div>'
DETAIL = ('<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>'
          '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}</div></div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>')
FRONT_L = LETTER
BACK_L = '{{FrontSide}}<hr>' + DETAIL
FRONT_S = ASK
BACK_S = '{{FrontSide}}<hr>' + LETTER + DETAIL
FRONT_R = '<div class="uc-ask">{{Ask}}</div><div class="uc-letter uc-show">{{Show}}</div>'
BACK_R = ('{{FrontSide}}<hr><div class="uc-field"><div class="uc-pos">how it is read</div>'
          '<div class="uc-gl">{{Rule}}</div><div class="uc-pos uc-gap">as in</div>'
          '<div class="uc-gl">{{Example}}</div>'
          '<div class="uc-pos uc-gap">the source says</div>'
          '<div class="uc-gl uc-quote">{{Quote}}</div><div class="uc-src">{{Source}}</div></div>')

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
  font-size: 52px;
  font-weight: 400;
  line-height: 1.3;
}
.uc-name {
  font-size: 13px;
  letter-spacing: 0.04em;
  opacity: 0.6;
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
/* a quotation names the spelling it is about: not shown where the sound side is the QUESTION */
.uc-ask + .uc-field .uc-q {
  display: none;
}
.uc-q {
  display: block;
  margin-top: 6px;
  font-size: 13.5px;
  opacity: 0.8;
}
.uc-exw + .uc-exw {
  margin-top: 4px;
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
  font-size: 34px;
}
.uc-quote {
  font-size: 13.5px;
  opacity: 0.8;
}
.uc-quote + .uc-quote {
  margin-top: 6px;
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
    if name in ('ipa', 'big', 'small', 'smaller', 'mono', 'char', 'nobr'):
        return parts[1] if len(parts) > 1 else ''
    if name in ('ipa link', 'ipalink'):
        return parts[-1]
    if name in ('ipablink', 'ipaslink', 'ipaplink'):
        return ('[%s]' if name == 'ipablink' else '/%s/' if name == 'ipaslink' else '%s') % parts[-1]
    if name in ('angbr', 'angbr ipa', 'angle bracket', 'vr'):
        return '⟨' + '|'.join(parts[1:]) + '⟩'
    if name == 'snd':
        return ' – '
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
    w = re.sub(r'</?nowiki>', '', w)
    w = re.sub(r"'''(.*?)'''", r'⟦\1⟧' if bold else r'\1', w)
    w = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', w)      # before the templates: a link's | is not a parameter's
    for _ in range(6):
        w = INNER.sub(_tpl, w)
    w = w.replace("''", '').replace('&nbsp;', ' ')
    w = re.sub(r'</?(?:u|big|small|sup|sub)>|<br ?/?>', '', w)
    w = w.replace('⟦', '[').replace('⟧', ']')
    return re.sub(r'[ \t]+', ' ', w)


def key_rows():
    """Help:IPA/Old English's rows: IPA symbol -> (its Examples cell, its approximation cell),
    the bold letters of each in [ ]."""
    w = wikitext('help')
    w = w[w.index('==Key=='):w.index('== Notes ==')]
    rows = {}
    for raw in w.split('\n|-'):
        raw = raw.split('\n|}')[0]          # the last row of a table: nothing after its end
        m = re.search(r'<big>\{\{IPA ?link\|(?:[^}|]*\|)?([^}|]*)\}\}</big>|<big>\{\{IPA\|([^}]*)\}\}</big>', raw)
        if not m:
            continue
        cells = [re.sub(r'^\|\s*', '', c).strip()
                 for c in flat(raw, bold=True, refs=False).split('\n') if c.startswith('|')]
        if len(cells) >= 3:
            rows[m.group(1) or m.group(2)] = (cells[-2], cells[-1])
    return rows


def verify():
    bad = 0
    rows = key_rows()
    for ipa, want in APPROX.items():
        ex, got = rows.get(ipa, ('', None))
        if got != want:
            bad += 1
            print(f'FAIL  [{ipa}]: the key says {got!r}, the deck {want!r}')
        bold = set(re.findall(r'\[([^\]]*)\]', ex))
        for sp in SPELL[ipa].split():
            if sp not in bold:
                bad += 1
                print(f'FAIL  [{ipa}]: the key\'s examples do not print {sp} in bold for it ({ex})')
    for a, b in (('magan', 'ɣ'), ('dagum', 'ɣ'), ('gōd', 'ɡ')):     # the g note names the key's examples
        if a not in rows[b][0].replace('[', '').replace(']', ''):
            bad += 1
            print(f'FAIL  the key does not give {a} as an example of [{b}]')
    text = {k: re.sub(r'\s+', ' ', flat(wikitext(k))) for k in PAGES}
    for page, phrase in USED_Q:
        if re.sub(r'\s+', ' ', phrase) not in text[page]:
            bad += 1
            print(f'FAIL  not in {SRC[page]}: {phrase[:90]}')
    print(f'alphabet --verify: {len(APPROX)} comparisons and {len(USED_Q)} quoted phrases against '
          + ', '.join(f'{t} ({r})' for t, r in PAGES.values())
          + (f' — {bad} FAILED' if bad else ' — all found'))
    sys.exit(1 if bad else 0)


# ---- the deck --------------------------------------------------------------------------
def level1():
    if not os.path.exists(L1):
        raise SystemExit('alphabet.py reads its example words from Level 1\'s deck: '
                         'run `python3 .claude/oldenglish/run.py` first')
    return json.load(open(L1, encoding='utf-8'))['cards']


def example(card):
    """An example word as its Level 1 card gives it: the word, its IPA, its first meaning (to
    the first bracket or semicolon)."""
    F = card['fields']
    m = re.search(r'<(?:li|div class="uc-gl")>(.*?)</(?:li|div)>', F['English'])
    gloss = re.split(r'\s*[(;]', html.unescape(re.sub(r'<[^>]+>', '', m.group(1))))[0].strip()
    ipa = html.unescape(F['IPA'])
    return (f'<div class="uc-exw"><span class="uc-ex">{E(F["Word"])}</span>'
            + (f'<span class="uc-exr">{E(ipa)}</span>' if ipa else '')
            + f'<span class="uc-exe">{E(gloss)}</span></div>')


def card_facts(cards):
    """What two rule cards say about THIS collection's cards, checked on Level 1 itself."""
    ipas = [html.unescape(c['fields']['IPA']) for c in cards]
    assert any('æ͜ɑː' in i for i in ipas), 'no Level 1 card prints [æ͜ɑː]: the IPA rule card is wrong'
    assert not any(re.search(r'æːɑ|eːo|iːy', i) for i in ipas), 'a card puts the length mark inside a diphthong'
    aelfric = [html.unescape(re.sub(r'<[^>]+>', '', m.group(1))) for c in cards for m in re.finditer(
        r'<div class="uc-exz">((?:(?!</div>).)*)</div><div class="uc-exe">[^<]*</div>'
        r'<div class="uc-exsrc">Ælfric', c['fields']['Examples'])]
    assert aelfric, 'Level 1 has no sentence from Thorpe\'s Ælfric'
    assert not any(re.search('[āēīōūȳǣċġĀĒĪŌŪȲǢĊĠ]', s) for s in aelfric), \
        'a sentence from Thorpe prints a macron or a dot: two rule cards say none does'
    assert any('é' in s for s in aelfric) and any('ð' in s for s in aelfric)
    assert not any('ð' in c['fields']['Word'] for c in cards), 'a headword prints ð: the þ rule says none does'
    assert any('ƿ' in m.group(1) for c in cards for m in re.finditer(
        r'<div class="uc-exz">((?:(?!</div>).)*)</div><div class="uc-exe">[^<]*</div>'
        r'<div class="uc-exsrc">Tatoeba', c['fields']['Examples'])), 'no Tatoeba sentence prints ƿ'
    return len(aelfric)


def main():
    if '--verify' in sys.argv:
        verify()
    l1 = level1()
    by = {c['fields']['Word']: c for c in l1}
    card_facts(l1)

    def ex(words):
        for w in words:
            if w not in by:
                raise SystemExit(f'example word {w} is not a card of Level 1')
        return ''.join(example(by[w]) for w in words)

    after = {}
    for key, block, ask, show, say, quotes, page, word in RULES:
        if not all(any(q == u[1] and page_ok for u in USED_Q for page_ok in [True]) for q in quotes):
            raise SystemExit(f'{key}: a quote that is not a Q()')
        after.setdefault(block, []).append({'sub': '', 'fields': {
            'Key': key, 'Ask': E(ask), 'Show': E(show), 'Rule': E(say),
            'Quote': ''.join(f'<div class="uc-quote">“{E(q)}”</div>' for q in quotes),
            'Source': E('; '.join(dict.fromkeys(SRC[p] for p, ph in USED_Q if ph in quotes))),
            'Example': ex([word]), 'Word': E(word),
        }, 'type': RULE_TYPE})
    cards = []
    shown_all = {l[0] for l in LETTERS}
    for b in after:
        assert b in shown_all, f'a rule is dealt after {b}, which is no note'
    for shown, name, sound, words in LETTERS:
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown), 'Name': E(name), 'Sound': sound, 'Example': ex(words),
            'Word': E(shown),
        }, 'type': TYPE_ID})
        cards += after.get(shown, [])
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_oeabc_{i}'
        c = cards[i - 1] = {'sub': c['sub'], 'fields': c['fields'], 'id': c['id'], 'type': c['type']}
    letters = [c for c in cards if c['type'] == TYPE_ID]
    rules = [c for c in cards if c['type'] == RULE_TYPE]
    sounds = [c['fields']['Sound'] for c in letters]
    assert len(set(sounds)) == len(letters), 'two letters share a sound side: the reverse card is unanswerable'
    assert len({c['fields']['Letter'] for c in letters}) == len(letters), 'two notes share a letter side'
    assert len({c['fields']['Key'] for c in rules}) == len(rules)
    n = len(cards)
    desc = (
        f"How to read Old English: {len(letters)} letters and spellings and {len(rules)} reading "
        "rules, the first deck of the Old English collection. A letter is two cards — see it and "
        "recall its sound, see the sound and recall the letter, each with its own schedule — and a "
        "reading rule is one. The vowels short and long, the diphthongs (ea, eo, ie), the consonants "
        "that are not said as in modern English (ċ, ġ, sċ, ċġ, h after a vowel, f s and þ between "
        "voiced sounds), what holds for every word (no letter is silent, a double consonant is "
        "long, ġe- is never stressed), the letters said as today, and the scribes' own letters: "
        "wynn (ƿ), the insular g, ꝥ for þæt and ⁊ for and. The reading rules are what a text "
        "prints differently from a card: no macron and no dot, ð for þ, y for ie, an acute in "
        "Thorpe's Ælfric — and how to read the line of IPA under every headword of the level "
        "decks, which is the only sound there is, since no voice reads Old English. "
        "Sources. Every IPA symbol and every English comparison is a row of Wikipedia's key, "
        f"Help:IPA/Old English (revision {PAGES['help'][1]}); every rule is quoted from that key's "
        f"notes, from 'Old English phonology' (revision {PAGES['phon'][1]}) or from the "
        f"Orthography section of 'Old English' (revision {PAGES['oe'][1]}), CC BY-SA 4.0, and the "
        "quotation is on the card. The sounds are a scholarly reconstruction: the key itself says "
        "the nature of r is unknown and that ie is disputed. The example words are cards of Old "
        "English Level 1 with that deck's own pronunciation and meaning (English Wiktionary, via "
        "the kaikki.org extraction, CC BY-SA 4.0)."
    )
    meta = {
        'id': 'oeabc', 'title': 'Old English Alphabet and Pronunciation',
        'subtitle': f'{len(letters)} letters and spellings · {len(rules)} reading rules',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['old english', 'anglo-saxon', 'alphabet', 'pronunciation'], 'glossMode': 'site',
        'types': {
            TYPE_ID: {
                'id': TYPE_ID, 'name': 'Old English letter',
                'fields': FIELDS,
                'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                          {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
                'css': CSS,
            },
            RULE_TYPE: {
                'id': RULE_TYPE, 'name': 'Old English reading rule',
                'fields': RULE_FIELDS,
                'cards': [{'name': 'Reading rule', 'front': FRONT_R, 'back': BACK_R}],
                'css': CSS + CSS_R,
            },
        },
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(HERE, '..', '..', 'decks', 'Old-English-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', len(letters), 'letters', len(rules), 'rules')


if __name__ == '__main__':
    main()
