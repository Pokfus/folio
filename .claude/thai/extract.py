#!/usr/bin/env python3
"""Every Thai word in Wiktionary, compacted, with a frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-th.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0), `tnc_freq.txt` and `ttc_freq.txt` (word frequencies from the
Thai National Corpus and the Thai Textbook Corpus, as distributed by PyThaiNLP
under CC0) and writes `lex.json`.  Level-independent: built once and kept.

TWO CORPORA, BECAUSE EACH ALONE DEALT THE WRONG WORDS.  The Thai National
Corpus is written Thai -- news, academic prose, law -- and ranked alone it put
มาตรา "section (of a law)", กฎหมาย "law", สังคม "society" and พัฒนา "to
develop" into the first 170 words of a beginner's deck.  The Textbook Corpus
reads like a primer (นก "bird", เรือ "boat", ช้าง "elephant", หมา "dog") but
carries the old literary register of its texts (ข้าพเจ้า, a formal "I"; หล่อน, a
dated "she").  A word's frequency here is the GEOMETRIC MEAN of its rate per
million words in the two, so a word ranks high only where both agree it is
common, and a word one corpus lacks has none (the fill never takes it; an
inventory word is still taught, dealt last).

NO LEMMA ARITHMETIC.  Every other language on the shelf needed its frequency
summed over a word's forms (Hindi, Turkish, Russian) because those languages
inflect; Thai does not -- a word has one spelling whatever its tense, number
or person -- so a word's frequency is simply the corpus's count of it.  The
corpus list is already cut into words (TNC is segmented by hand), which is
what a raw subtitle list for an unspaced script could never be: that is why
hermitdave/FrequencyWords, every other deck's source, has no Thai list.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches
(classifiers included -- Thai counts nouns with them); never a letter or an
affix.  PROPER NOUNS ARE KEPT but marked: Wiktionary files the months
(มกราคม "January") and เสาร์ (the Saturn of วันเสาร์ "Saturday") as names,
and the inventory asks for them by name (`:name`); the fill never takes a
word that is only a name, and a card shows a name entry only when it has
nothing else.  An entry whose every sense is a form or an
alternative spelling of another word is not a word of its own: it is kept as
a POINTER for the inventory and the fill never takes it.

WHAT AN ENTRY CARRIES.  The Paiboon romanisation (Wiktionary gives several
systems; Paiboon is the one that writes the TONE, which a Thai learner cannot
do without -- the Royal Institute system leaves tones out), the IPA, the
classifiers a noun takes, its glosses, and Wiktionary's own usage examples
(Thai, romanised, translated), which `examples.py` falls back on when Tatoeba
has nothing.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from th import fold, nfc, is_thai

DUMP, FREQS, OUT = 'kaikki-th.jsonl', ('tnc_freq.txt', 'ttc_freq.txt'), 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'classifier', 'name'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'slang', 'childish', 'morpheme', 'Buddhism', 'Hinduism', 'royal', 'ecclesiastical'}
TAGS = {'formal', 'informal', 'colloquial', 'figuratively', 'transitive', 'intransitive',
        'idiomatic', 'polite', 'humble', 'male', 'female', 'familiar'}


def paiboon(e):
    out = []
    for s in e.get('sounds') or []:
        if 'Paiboon' in (s.get('raw_tags') or []) and s.get('roman'):
            r = s['roman'].strip()
            if r not in out:
                out.append(r)
    if not out:
        for f in e.get('forms') or []:
            if 'romanization' in (f.get('tags') or []):
                out.append(f.get('form', ''))
                break
    return out


def ipa(e):
    for s in e.get('sounds') or []:
        if s.get('ipa'):
            return s['ipa']
    return ''


def classifiers(e):
    return [nfc(f['form']) for f in e.get('forms') or []
            if 'classifier' in (f.get('tags') or []) and is_thai(f.get('form', ''))]


def is_formof(s):
    return 'form_of' in s or 'alt_of' in s or 'form-of' in (s.get('tags') or []) \
        or 'alt-of' in (s.get('tags') or [])


POINTER = re.compile(r'^(alternative|obsolete|archaic|dated|rare|nonstandard|eye dialect|'
                     r'misspelling|abbreviation)\b.*\b(form|spelling|of)\b')


# A CLASSIFIER NAMED INSIDE A GLOSS -- "rain (Classifier: หยด)", "(classifier ข้าง)
# hand", "chair (Classifier: ตัว)" -- is the same fact the head template states for
# บ้าน, written where the editor happened to put it.  It is lifted out of the
# gloss into the entry's classifiers (`clean_gloss` returns it), so the card says
# it once, in its own line.  A parenthesis about classifiers that names none
# ("Classifier changes according to its container") stays in the gloss.
CLF = re.compile(r'\s*\((?:[Cc]lassifi?e?rs?)\b:?\s*([^()]*)\)')
ABBR = re.compile(r'\s*\(?Abbreviation: [^()]*(?:\([^()]*\))?\)?')
THAI_RUN = re.compile(r'[\u0E01-\u0E4E]+')


def lift_classifiers(g):
    found = []

    def rep(m):
        words = THAI_RUN.findall(m.group(1))
        if not words:
            return m.group(0)
        found.extend(words)
        return ' '
    g = CLF.sub(rep, g)
    return re.sub(r'\s+', ' ', g).strip(' ;,'), found


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    # "Classifier for animals. ⇒ all nouns using this classifier": the arrow is
    # a link to a category page, not part of the meaning
    g = re.sub(r'\s*⇒.*$', '', g)
    g = ABBR.sub('', g)
    # "water; any liquid or fluid (Classifier changes according to the container)"
    # stays; a gloss that IS a pointer does not
    if POINTER.match(g):
        return ''
    # A GLOSS THAT IS A THAI SENTENCE is an example the extraction filed as a sense
    # (สี: "สีแดงเป็นสีมงคลของชาวจีน").  A real gloss may name a Thai word -- "(พระ~)
    # favour", "as in คนไข้ (kon-kâi)" -- but is mostly English.
    letters = [ch for ch in g if ch.isalpha()]
    if letters and sum(1 for ch in letters if '\u0E01' <= ch <= '\u0E4E') * 2 > len(letters):
        return ''
    return g.strip()


def examples(senses):
    out = []
    for s in senses:
        for x in s.get('examples') or []:
            t, en = nfc(x.get('text', '')), (x.get('english') or x.get('translation') or '').strip()
            if t and en and is_thai(re.sub(r'[\s\d.,!?“”"()\-–—:;…]', '', t)):
                out.append([t, x.get('roman', '') or '', en])
    return out


def rates(path):
    c = {}
    for line in open(path, encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) == 2 and is_thai(p[0]):
            k = fold(p[0])
            c[k] = c.get(k, 0) + int(p[1])
    tot = sum(c.values())
    return {k: v * 1e6 / tot for k, v in c.items()}


def combined():
    a, b = (rates(p) for p in FREQS)
    return {k: round((a[k] * b[k]) ** 0.5, 2) for k in a if k in b}


def main():
    counts = combined()
    json.dump(counts, open('freq.json', 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)

    lex = {}
    pointers = {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_thai(w):
            continue
        # A SENSE WHOSE GLOSS IS AN EXAMPLE is an extraction artefact (สี's second
        # "sense" is the sentence สีแดงเป็นสีมงคลของชาวจีน with its romanisation and
        # translation run together on three lines): a real gloss has no line break.
        senses = [s for s in e.get('senses') or []
                  if not any('\n' in g for g in s.get('glosses') or [])]
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        if not real:
            alts = [nfc(t.get('word', '')) for s in senses
                    for t in (s.get('alt_of') or []) + (s.get('form_of') or [])]
            if alts and is_thai(alts[0]):
                # the pointer's OWN romanisation: ล่ะ (lâ) points at เล่า (lâo), and
                # the card must not print the target's sound under the pointer's word
                pointers.setdefault(fold(w), {'word': w, 'alt_of': fold(alts[0]),
                                              'roman': paiboon(e)})
            continue
        gl, clf = [], classifiers(e)
        for s in real:
            tags = set(s.get('tags') or [])
            g, found = lift_classifiers(clean_gloss((s.get('glosses') or [''])[-1]))
            if g:
                weak = bool(tags & WEAK)
                gl.append({'g': g, 'weak': weak, 'tags': sorted(tags & TAGS)})
                # only the FIRST meaning's: อาทิตย์ is "Sunday (Classifier: วัน)",
                # then "week (Classifier: อาทิตย์)", then "sun (Classifier: ดวง)"
                if pos == 'noun' and not weak and len(gl) == 1:
                    clf += [c for c in found if c not in clf]
        if not gl:
            continue
        ent = {'pos': pos, 'etym': e.get('etymology_number', '') or '', 'roman': paiboon(e),
               'ipa': ipa(e), 'clf': clf, 'glosses': gl, 'ex': examples(real)}
        lex.setdefault(fold(w), {'word': w, 'entries': []})['entries'].append(ent)

    out = {}
    for k, L in pointers.items():
        if k not in lex:
            L['freq'] = counts.get(k, 0)
            L['formonly'] = True
            out[k] = L
    for k, L in lex.items():
        L['freq'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted((L for L in out.values() if 'entries' in L), key=lambda L: -L['freq'])[:40]
    print(f'  {len(out)} words ({len(pointers)} pointers); commonest:',
          ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
