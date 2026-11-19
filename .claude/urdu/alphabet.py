#!/usr/bin/env python3
"""Write the Urdu alphabet deck: `decks/Urdu-Alphabet.folio-deck.json`.

    python3 .claude/urdu/alphabet.py

The first deck of the Urdu collection, sorted before A1 by `levelRank`'s
"Alphabet" rule -- the Hindi collection's arrangement (the owner's decision for
Hindi, 2026-11-09, "a script deck, yes"), taken for Urdu.  The level decks
print a romanisation under every word, so this deck is not a gate; it is where
the script itself is learnt.

ONE NOTE PER LETTER, IN THE URDU ORDER -- the forty letters of the alphabet as
Urdu primers list them (alif madd beside alif, nun ghunna beside nun, the two
he's and the two ye's), then the five marks a dictionary writes and running
text leaves out (zabar, zer, pesh, tashdid, jazm), shown on ب, then the eleven
ASPIRATED pairs a consonant makes with do-chashmi he (بھ, پھ ... گھ), which a
primer teaches with the alphabet because a reader meets them on every line.
A joining letter shows its four shapes -- alone, at the start, in the middle
and at the end of a word -- since the shape changes and the reader must know
all four; a letter that joins only from the right shows two.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's
alphabets give them, never IPA, with the romanisation the level decks use
(Wiktionary's: ā ī ū, ṭ ḍ ṛ for the retroflex letters, ś, x, ġ, ź, q).  Where
English has no equivalent -- the retroflex letters, the breathy (aspirated)
consonants, the dental t and d -- the card says what to do with the tongue or
the breath instead of pretending.  Urdu writes the sounds of Arabic words with
letters that in Urdu sound alike (s: س ث ص; z: ز ذ ض ظ; t: ت ط; h: ہ ح), so
each sound side carries the letter's NAME, which is how a speaker tells them
apart ("z, written zo'e"), and the reverse card has one answer.  The examples'
romanisations are English Wiktionary's (`lex.json`), so the two decks agree.
No corpus is read for the content, so a re-run is byte-identical whenever
`lex.json` is.
"""
import html, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ur import fold, roman as RM

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'ur-abc'
COLOR = '#58288A'
ZWJ = '‍'

J, R, N, F = 'join', 'right', 'none', 'final'     # how a letter joins its neighbours

# ---- WHERE EVERY SOUND COMES FROM (the beginner pass, 2026-11-19) ----------------------
# Until this pass the sound sides were written from "the standard description of Urdu's
# alphabet and sounds", which names nothing a reader can open.  Now every English
# comparison is a CELL of Wikipedia's key, Help:IPA/Hindi and Urdu, column "English
# approximation", at the revision named here, and every rule is a PHRASE of Wikipedia's
# article "Urdu alphabet" at the revision named here, between double quotes on the card.
# `python3 .claude/urdu/alphabet.py --verify` fetches the two revisions (they never change)
# and fails if a cell or a phrase is not in them.  Nothing else is claimed: where the key has
# no comparison (the three s's are one row) the card gives the letter's name and no more.
HELP_REV = 1367857599       # Help:IPA/Hindi and Urdu, 2026-08-05
ABC_REV = 1385216687        # Urdu alphabet, 2026-11-12
# IPA symbol of the key's row -> its English approximation, the bold letters in [ ]
APPROX = {
    'b': 'ca[bb]ie', 'bʱ': 'clu[bh]ouse', 'd̪': 'wi[d]th, Spanish [d]espacito',
    'd̪ʱ': 'a[dh]ere (but dental)', 'dʒ': 'bu[dg]ing', 'dʒʱ': 'he[dgeh]og',
    'ɖ': 'American bir[d]', 'ɖʱ': 'American bir[dh]ouse', 'f': '[f]uss', 'ɡ': 'a[g]o',
    'ɡʱ': 'lo[gh]ouse', 'ʔ': 'The pause in "uh-oh!"', 'ɣ': 'Similar to the French R',
    'ɦ': 'a[h]ead', 'j': '[y]uck', 'k': 's[c]ab', 'kʰ': '[c]ab', 'l': '[l]eaf', 'm': '[m]uch',
    'n̪': 'pa[n]ther', 'ŋ': 'ba[ng]', 'p': 's[p]ot', 'pʰ': '[p]ot',
    'q': 'somewhat like [c]aught', 'r': 'Trilled [r]ing', 'ɾ': 'American a[t]om',
    'ɽ': 'American ga[rt]er',
    'ɽʱ': 'no English equivalent, a cross between a voiced retroflex flap and a breathy '
          'voiced retroflex plosive.',
    's': '[s]un', 'ʃ': '[sh]oe', 't̪': 'similar to ou[t]think, Spanish señori[t]a',
    't̪ʰ': 'Indian English pa[th,] bir[th]', 't͡ʃ': 'ca[tch]', 't͡ʃʰ': 'bea[chh]ead',
    'ʈ': 's[t]ub (but retroflex)', 'ʈʰ': '[t]ub (but retroflex)', 'ʋ': '[v]at', 'w': '[w]ell',
    'x': 'Scottish lo[ch]', 'z': '[z]oo', 'ʒ': 'plea[s]ure',
    'aː': 'f[a]ther', 'eː': 's[ay]', 'ɛː': 'f[ai]ry', 'ə': '[a]bout', 'ɪ': 's[i]t',
    'iː': 's[ea]t', 'oː': 'st[o]ry', 'ɔː': '[o]ff, but long', 'ʊ': 'f[oo]t', 'uː': 'c[oo]l',
    '◌̃': 'nasal vowel fa[un]',
}
USED_Q = []                 # every phrase a card quotes, for --verify


def A(ipa):
    """The key's own comparison for a sound, between brackets its bold letters."""
    return APPROX[ipa]


def Q(phrase):
    """A phrase of the article, quoted on the card and checked by --verify."""
    USED_Q.append(phrase)
    return '“' + phrase + '”'


# (letter, joins, its name in Urdu (spoken), name romanised, sound romanised, the sound,
#  example word, its meaning -- None: the level card's first gloss)
LETTERS = [
    ('ا', R, 'الف', 'alif', '', Q('At the beginning of a word, alif can be used to represent any of '
     'the short vowels') + ' (a, i, u); in the middle and at the end of a word it is long ā, the a of '
     + A('aː'), 'اب', 'now'),
    ('آ', R, 'الف مد', 'alif madd', 'ā', Q('For long ā at the beginning of words alif-mad is used')
     + ': the a of ' + A('aː'), 'آم', 'mango'),
    ('ب', J, 'بے', 'be', 'b', A('b'), 'بچہ', 'child'),
    ('پ', J, 'پے', 'pe', 'p', A('p') + ' — with a breath it is پھ, ' + A('pʰ'), 'پانی', 'water'),
    ('ت', J, 'تے', 'te', 't', A('t̪') + ' — the dental t', 'تین', 'three'),
    ('ٹ', J, 'ٹے', 'ṭe', 'ṭ', A('ʈ') + ' — one of the letters Urdu added '
     + Q('to represent sounds not present in Persian'), 'ٹکٹ', 'ticket'),
    ('ث', J, 'ثے', 'se', 's', A('s') + '; written se — ث, س and ص are all s', 'ثابت', 'proven, firm'),
    ('ج', J, 'جیم', 'jīm', 'j', A('dʒ'), 'جگہ', 'place'),
    ('چ', J, 'چے', 'che', 'c', A('t͡ʃ') + ' — with a breath it is چھ, ' + A('t͡ʃʰ'), 'چائے', 'tea'),
    ('ح', J, 'بڑی حے', 'baṛī he', 'h', A('ɦ') + '; written baṛī he, "big he" — ح and ہ are both h',
     'حصہ', 'part, share'),
    ('خ', J, 'خے', 'xe', 'x', A('x'), 'خوش', 'happy'),
    ('د', R, 'دال', 'dāl', 'd', A('d̪') + ' — the dental d', 'دن', 'day'),
    ('ڈ', R, 'ڈال', 'ḍāl', 'ḍ', A('ɖ') + ' — the retroflex d, a letter Urdu added', 'ڈاکٹر', 'doctor'),
    ('ذ', R, 'ذال', 'zāl', 'z', A('z') + '; written zāl — ذ, ز, ض and ظ are all z', 'ذریعہ', 'means, way'),
    ('ر', R, 'رے', 're', 'r', A('ɾ') + '; when doubled, ' + A('r'), 'رات', 'night'),
    ('ڑ', R, 'ڑے', 'ṛe', 'ṛ', A('ɽ') + ' — the retroflex flap, a letter Urdu added', 'لڑکا', 'boy'),
    ('ز', R, 'زے', 'ze', 'z', A('z') + '; written ze', 'زبان', 'tongue, language'),
    ('ژ', R, 'ژے', 'źe', 'ź', A('ʒ'), 'ٹیلی ویژن', 'television'),
    ('س', J, 'سین', 'sīn', 's', A('s') + '; written sīn', 'سال', 'year'),
    ('ش', J, 'شین', 'śīn', 'ś', A('ʃ'), 'شہر', 'city'),
    ('ص', J, 'صاد', 'svād', 's', A('s') + '; written svād', 'صبح', 'morning'),
    ('ض', J, 'ضاد', 'zvād', 'z', A('z') + '; written zvād', 'ضرورت', 'need'),
    ('ط', J, 'طوئے', "to'e", 't', A('t̪') + "; written to'e — ت and ط are both the dental t",
     'طرف', 'side, direction'),
    ('ظ', J, 'ظوئے', "zo'e", 'z', A('z') + "; written zo'e", 'ظاہر', 'clear, evident'),
    ('ع', J, 'عین', "'ain", "'", Q('in its initial and final position is silent in pronunciation and '
     'is replaced by the sound of its preceding or succeeding vowel'), 'عورت', 'woman'),
    ('غ', J, 'غین', 'ġain', 'ġ', A('ɣ'), 'غلط', 'wrong'),
    ('ف', J, 'فے', 'fe', 'f', A('f'), 'فون', 'phone'),
    ('ق', J, 'قاف', 'qāf', 'q', A('q'), 'قلم', 'pen'),
    ('ک', J, 'کاف', 'kāf', 'k', A('k') + ' — with a breath it is کھ, ' + A('kʰ'), 'کتاب', 'book'),
    ('گ', J, 'گاف', 'gāf', 'g', A('ɡ'), 'گاؤں', 'village'),
    ('ل', J, 'لام', 'lām', 'l', A('l'), 'لال', 'red'),
    ('م', J, 'میم', 'mīm', 'm', A('m'), 'ماں', 'mother'),
    ('ن', J, 'نون', 'nūn', 'n', A('n̪') + '; before g, ' + A('ŋ'), 'نام', 'name'),
    ('ں', F, 'نون غنہ', 'nūn ġunna', '̃', Q('Vowel nasalization is represented by') + ' nūn ġunna, '
     'n without its dot, after the vowel: ' + A('◌̃') + '; ' + Q('In middle form nun ghunna is written just like nun'),
     'ہاں', 'yes'),
    ('و', R, 'واؤ', "vā'o", 'v', 'the consonant v, ' + A('ʋ') + '; or a vowel — ū, ' + A('uː')
     + '; o, ' + A('oː') + '; au, ' + A('ɔː'), 'وقت', 'time'),
    ('ہ', J, 'چھوٹی ہے', 'choṭī he', 'h', A('ɦ') + '; written choṭī he, "little he", or gol he; '
     + Q('at the end of a word, it can be used to render the long "a" or the "e" vowels'),
     'ہاتھ', 'hand'),
    ('ھ', J, 'دو چشمی ہے', 'do-caśmī he', 'h', 'do-caśmī he, "two-eyed he", is written '
     + Q('in order to create the aspirate consonants') + ': a breath after the consonant before it '
     '— the eleven pairs at the end of this deck', 'بھائی', 'brother'),
    ('ء', N, 'ہمزہ', 'hamza', '', 'written alone or above a letter (ئ ؤ ۂ): Urdu writing does '
     + Q('include hamza over bari ye, gol he, and wow') + '; it is ' + Q('sometimes pronounced as')
     + ' a catch — ' + A('ʔ'), 'کئی', 'several'),
    ('ی', J, 'چھوٹی یے', 'choṭī ye', 'y', Q('It is used for the long vowel "ī" and the consonant "y"')
     + ': ' + A('j') + '; ' + A('iː') + ' — and inside a word also e and ai, which at the end of a word '
     'are written ے', 'یاد', 'memory'),
    ('ے', F, 'بڑی یے', 'baṛī ye', 'e', 'baṛī ye, "big ye", ' + Q('is used to render the vowels "e" and '
     '"ai"') + ': ' + A('eː') + '; ' + A('ɛː') + ' — and is told from choṭī ye '
     + Q('only when it comes at the end of a word'), 'آگے', 'forward'),
    # the marks a dictionary writes and running text leaves out, shown on ب
    ('بَ', N, 'زبر', 'zabar', 'a', 'zabar, the stroke above: short a, ' + A('ə'), 'اب', None),
    ('بِ', N, 'زیر', 'zer', 'i', 'zer, the stroke below: short i, ' + A('ɪ'), 'دن', None),
    ('بُ', N, 'پیش', 'peś', 'u', 'peś, the small و above: short u, ' + A('ʊ'), 'خوش', None),
    ('بّ', N, 'تشدید', 'taśdīd', '', 'taśdīd, the small w above, '
     + Q('is used to indicate a gemination') + ': the consonant is doubled', 'بچہ', None),
    ('بْ', N, 'جزم', 'jazm', '', 'jazm, the small circle above, '
     + Q('is used to indicate a consonant cluster') + ': no vowel after the letter', 'وقت', None),
    ('بً', N, 'دو زبر', 'do zabar', 'an', 'do zabar, two zabars (Arabic fathatan), one of the marks '
     + Q('found in some common Arabic loan words') + ': on the word below it is the -an of fauran',
     'فورا', None),
    ('بٰ', N, 'کھڑی زبر', 'khaṛī zabar', 'ā', 'khaṛī zabar (Arabic dagger alif), a small alif above, '
     'one of the marks found in some common Arabic loan words: on the word below it is the ā of a\'lā',
     'اعلی', None),
    ('ـِ', N, 'اضافت', 'izāfat', '-e-', 'izāfat joins two nouns: ' + Q('A short vowel "i" is used to '
     'connect these two words') + '. It may be written as zer under the last letter of the first '
     'word, ' + Q('but usually is not written at all') + '; the romanisation writes it -e-',
     'صورت حال', None),
    ('خو', N, 'خو', 'xu', 'xu', 'و after خ: ' + Q('Only when preceded by the consonant')
     + ' xe can vā\'o be the short u of ' + A('ʊ'), 'خود', None),
    # the aspirated pairs: a consonant and do-chashmi he, said as one sound with a breath
    ('بھ', N, 'بھ', 'bh', 'bh', A('bʱ'), 'بھائی', 'brother'),
    ('پھ', N, 'پھ', 'ph', 'ph', A('pʰ'), 'پھل', 'fruit'),
    ('تھ', N, 'تھ', 'th', 'th', A('t̪ʰ') + ' — the dental t with a breath', 'تھوڑا', 'a little'),
    ('ٹھ', N, 'ٹھ', 'ṭh', 'ṭh', A('ʈʰ'), 'ٹھیک', 'all right, fine'),
    ('جھ', N, 'جھ', 'jh', 'jh', A('dʒʱ'), 'جھوٹ', 'a lie'),
    ('چھ', N, 'چھ', 'ch', 'ch', A('t͡ʃʰ'), 'چھوٹا', 'small'),
    ('دھ', N, 'دھ', 'dh', 'dh', A('d̪ʱ'), 'دودھ', 'milk'),
    ('ڈھ', N, 'ڈھ', 'ḍh', 'ḍh', A('ɖʱ'), 'ڈھونڈنا', 'to look for'),
    ('ڑھ', N, 'ڑھ', 'ṛh', 'ṛh', A('ɽʱ'), 'پڑھنا', 'to read, to study'),
    ('کھ', N, 'کھ', 'kh', 'kh', A('kʰ'), 'کھانا', 'food; to eat'),
    ('گھ', N, 'گھ', 'gh', 'gh', A('ɡʱ'), 'گھر', 'house, home'),
]

# THE MARKS' EXAMPLES are written WITH the mark, on the word the level deck teaches
# without it, so the card shows where the mark goes; their meaning is the word's.
MARKED = {'زبر': ('اَب', 'now'), 'زیر': ('دِن', 'day'), 'پیش': ('خُوش', 'happy'),
          'تشدید': ('بَچّہ', 'child'), 'جزم': ('وَقْت', 'time')}
# ... and four whose marked spelling is Wiktionary's own headword line (`lex.json`, `marked`),
# with the level card's first meaning
MARKED_LEX = {'دو زبر', 'کھڑی زبر', 'اضافت', 'خو'}
# phrases of the HELP page the cards quote (the others are the article's)
HELP_Q = {'sometimes pronounced as'}

FIELDS = ['Letter', 'Joins', 'Name', 'Sound', 'Example', 'Word']

SAY_NAME = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>'
SAY_WORD = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
LETTER = ('<div class="uc-letter">{{Letter}}' + SAY_NAME + '</div>'
          '{{#Joins}}<div class="uc-joins">{{Joins}}</div>{{/Joins}}')
DETAIL = ('<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>'
          '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}'
          + SAY_WORD + '</div></div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>')
FRONT_L = LETTER
BACK_L = '{{FrontSide}}<hr>' + DETAIL
FRONT_S = ASK
BACK_S = '{{FrontSide}}<hr>' + LETTER + DETAIL

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
.uc-ex {
  font-size: 21px;
}
.uc-exr {
  margin-left: 6px;
  font-size: 14px;
  opacity: 0.62;
}
.uc-ur {
  font-family: "Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "Urdu Typesetting", "Noto Naskh Arabic", "Geeza Pro", "Segoe UI", serif;
  unicode-bidi: isolate;
}
.uc-letter {
  line-height: 2;
}
.uc-letter .uc-say {
  margin-left: 0;
  margin-right: 14px;
}
.uc-joins {
  margin-top: 2px;
  font-size: 26px;
  line-height: 2;
  opacity: 0.75;
  word-spacing: 0.5em;
}
.uc-ex {
  line-height: 2.1;
}
.uc-exe {
  margin-left: 6px;
  opacity: 0.62;
}
"""


def ur(s):
    return f'<span class="uc-ur" dir="rtl" lang="ur">{E(s)}</span>'


def joins(ch, how):
    """The letter's shapes: alone, first, middle, last -- or alone and last, for a right-joiner."""
    if how == J:
        forms = [ch, ch + ZWJ, ZWJ + ch + ZWJ, ZWJ + ch]
    elif how == R:
        forms = [ch, ZWJ + ch]
    else:
        return ''
    return ' '.join(ur(x) for x in forms)


SAME_SOUND = {'/s/': 'ثسص', '/z/': 'ذزضظ', '/t/': 'تط', '/ɦ/': 'حہ'}


def wikitext(title, rev, cache_dir):
    p = os.path.join(cache_dir, f'wp-{rev}.wiki')
    if not os.path.exists(p):
        url = ('https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content'
               f'&rvslots=main&format=json&revids={rev}')
        # curl, not urllib: Wikipedia answers Python's default client with 429
        d = json.loads(subprocess.run(['curl', '-sS', '-A', 'deck-tooling/1.0', url],
                                      check=True, capture_output=True).stdout)
        page = list(d['query']['pages'].values())[0]
        if page['title'] != title:
            raise SystemExit(f'revision {rev} is of {page["title"]}, not {title}')
        open(p, 'w', encoding='utf-8').write(page['revisions'][0]['slots']['main']['*'])
    return open(p, encoding='utf-8').read()


def flat(w, bold=False):
    """Wikitext as a reader sees it: links and templates opened, italics dropped; bold
    kept as [ ] when asked."""
    w = re.sub(r'<ref[^>]*/>', '', w)
    w = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', w)
    for _ in range(4):
        w = re.sub(r'\{\{(?:[^{}|]*\|)*([^{}|]*)\}\}', r'\1', w)
    if bold:
        w = re.sub(r"'''(.*?)'''", r'[\1]', w)
    w = w.replace("'''", '').replace("''", '')
    return re.sub(r'\s+', ' ', w)


def verify():
    """Every comparison is a cell of the key and every quoted phrase a phrase of its page,
    at the pinned revisions."""
    cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'urdu-cache')
    help_raw = wikitext('Help:IPA/Hindi and Urdu', HELP_REV, cache_dir)
    abc_raw = wikitext('Urdu alphabet', ABC_REV, cache_dir)
    bad = []
    rows = help_raw.split('\n|-')
    for ipa, approx in APPROX.items():
        hit = [r for r in rows if re.search(r'IPA ?link\|(?:[^}|]*\|)?' + re.escape(ipa) + r'(?:\|[^}]*)?\}\}', r)]
        if not any(approx in flat(r, bold=True) for r in hit):
            bad.append(f'the key has no row for [{ipa}] reading {approx!r}')
    help_flat, abc_flat = flat(help_raw), flat(abc_raw)
    for q in USED_Q:
        src = help_flat if q in HELP_Q else abc_flat
        if q not in src:
            bad.append(f'not a phrase of the {"key" if q in HELP_Q else "article"}: {q!r}')
    arows = abc_raw.split('\n|-')
    for ipa, letters in SAME_SOUND.items():
        for ch in letters:
            r = next((x for x in arows if f'[[{ch}]]' in x and 'IPA' in x), '')
            if ipa not in r:
                bad.append(f'the article\'s table does not give {ch} as {ipa}')
    for b in bad:
        print('FAIL ', b)
    if bad:
        raise SystemExit(1)
    print(f'alphabet --verify: {len(APPROX)} comparisons are cells of Help:IPA/Hindi and Urdu '
          f'(revision {HELP_REV}), {len(USED_Q)} phrases are in the pages they are quoted from '
          f'(Urdu alphabet, revision {ABC_REV}), and the letters said to sound alike share a row value')


def main():
    if '--verify' in sys.argv:
        return verify()
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'urdu-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' romanisation from lex.json: '
                         'run `python3 .claude/urdu/run.py` once first')
    cards, missing = [], []
    for i, (ch, how, name, nrom, rom, sound, word, meaning) in enumerate(LETTERS, 1):
        L = lex.get(fold(word)) or {}
        ents = L.get('entries', [])
        wr = next((RM(word, e['roman']) for e in ents if e.get('roman')), '')
        if not wr:
            missing.append(word)
        if name in MARKED:
            shown_word, meaning = MARKED[name]
        elif name in MARKED_LEX:
            # Wiktionary's own headword line, with its marks, and the level card's first meaning
            shown_word = next((e['marked'] for e in ents if e.get('marked')), '')
            meaning = re.split('[,;]', next((g['g'] for e in ents for g in e['glosses'] if g['g']), ''))[0]
            if not shown_word or not meaning:
                if name == 'خو':
                    shown_word = word
                else:
                    raise SystemExit(f'{word}: lex.json has no marked spelling or no gloss')
        else:
            shown_word = word
        head = f'<span class="uc-rm">{E(rom)}</span> · ' if rom and rom != '̃' else ''
        # a letter's own name leads its sound unless the sound already names it
        named = sound.startswith(nrom) or f'written {nrom}' in sound or nrom == rom or nrom in sound
        body = re.sub(r'\[([^\]]*)\]', r'<b>\1</b>', E(sound))
        cards.append({'sub': '', 'fields': {
            'Letter': ur(ch),
            'Joins': joins(ch, how) if how != F else ur(ZWJ + ch),
            'Name': E(name),
            'Sound': head + ('' if named else f'{E(nrom)}: ') + body,
            'Example': (f'<span class="uc-ex">{ur(shown_word)}</span>'
                        + (f'<span class="uc-exr">{E(wr)}</span>' if wr else '')
                        + f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_urabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    if missing:
        raise SystemExit('no Wiktionary romanisation for: ' + ' '.join(missing))
    days = -(-n // 5)
    desc = (
        f"The Urdu alphabet: {n} notes — the forty letters in the order Urdu primers give them "
        "(alif madd beside alif, nūn ġunna beside nūn, the two he's and the two ye's); eight "
        "signs a dictionary writes over and under the letters and everyday writing leaves out — "
        "zabar, zer and peś for the short vowels, taśdīd, jazm, do zabar, khaṛī zabar and the "
        "izāfat; the و that is a short u after خ; and the eleven breathy pairs a consonant makes "
        "with do-caśmī he (بھ, پھ … گھ), which a reader meets on every line. The first deck of the "
        "Urdu collection. WHAT THE SCRIPT DOES NOT SHOW, since it decides how you study: Urdu "
        "writes consonants and long vowels and leaves the short vowels out, so a word cannot be "
        "sounded out from its letters alone — of Urdu A1's first 500 headwords 328 have a short "
        "vowel no letter shows, and only 89 can be read off the letters with nothing else. That "
        "is why every word card in the level decks prints a romanisation beside the word and, "
        "where Wiktionary's headword line writes them, the word again with its marks. Learn the "
        "letters here; read the vowels there. Urdu is written right to left, and most letters "
        "join the next one and change shape as they do, so each card shows the letter alone and "
        "then at the start, in the middle and at the end of a word (a letter that never joins the "
        "letter after it — ا آ د ڈ ذ ر ڑ ز ژ و — shows two shapes). Both directions: see a letter "
        "and recall its sound, or see a sound and recall the letter, each a card with its own "
        "schedule. Urdu keeps the spellings of Arabic words with letters that in Urdu sound alike "
        "— three s's, four z's, two t's and two h's — so every sound side names its letter, as a "
        "speaker does when spelling a word aloud. Every note gives the romanisation the level "
        "decks use and one word that shows the letter, a card of the level decks, with a speaker "
        "beside the letter and the word (whether it speaks depends on an Urdu voice being "
        "installed on your device). THE PACE: the app gives ten new cards a day, both directions "
        f"together, which is five notes a day, so this deck is {days} days; it can be studied beside "
        "Urdu A1 rather than before it, since A1's cards carry their romanisation. The letters "
        "are drawn in your device's Urdu typeface, Nastaliq where it has one, in which a word "
        "slopes down to the left and a letter's joined shape depends on its neighbours. WHERE THE "
        "SOUNDS COME FROM: every English comparison on a sound side is a cell of the column "
        "\"English approximation\" of Wikipedia's key Help:IPA/Hindi and Urdu (revision "
        f"{HELP_REV}), with its bold letters; they are approximations, and several are American "
        "English, as the key says. Every phrase between double quotes is a phrase of Wikipedia's "
        f"article Urdu alphabet (revision {ABC_REV}), as are the letters' names and which letters "
        "share a sound. Where the key gives no comparison the card gives none. The example "
        "words' romanisations, their marked spellings and their meanings are English "
        "Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0); Wikipedia's text is CC "
        "BY-SA 4.0."
    )
    meta = {
        'id': 'urabc', 'title': 'Urdu Alphabet',
        'subtitle': f'{n} letters, signs and pairs · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['urdu', 'alphabet', 'nastaliq'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Urdu letter', 'speechLang': 'ur-PK',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Urdu-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
