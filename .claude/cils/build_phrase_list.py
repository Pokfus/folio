#!/usr/bin/env python3
"""Derive the word list for the `phrases` level, which has no published list at all.

Every other level here reads a list somebody else wrote: six read a band off a
web page, `core` reads De Mauro's published reference work.  A PHRASE LIST has no
equivalent -- no exam board and no reference work publishes "the common Italian
expressions" -- so this one is derived, and the derivation is the content
decision.  It writes `phrases.words.txt` for `parse_cils` to read, in the same
shape as the file `core` reads, so nothing downstream knows the difference.

**WHY THE OTHER SEVEN DECKS CANNOT COVER THIS.**  All seven are built from lists
of SINGLE WORDS -- the six bands carry 67 multiword entries between them and the
core deck carries none at all, its source being a lemma list.  So the layer of
the language that is neither grammar nor vocabulary, and that a learner needs
first, is missing from all of them: `per favore`, `di solito`, `in bocca al
lupo`, `come si chiama`, `non lo so`.

WHERE THEY COME FROM.  English Wiktionary files an Italian expression as a real
entry with a real definition, which is the same authority the seven decks
already take their meanings from -- so this invents nothing and adds no source.
Of the dump's 14,247 multiword Italian records, the ones that are EXPRESSIONS are
picked by part of speech, and two large classes are refused:

  · **`noun` (9,234) is not a phrase**, it is compound and technical vocabulary
    -- `vapore acqueo`, `smerigliatrice angolare`, `panda minore` -- plus the
    plurals of compounds (`carri merci`).  Taken in, it would be three quarters
    of the deck and none of it what was asked for.
  · **`name` (1,016) is surnames and places** -- `De Crescenzo`, `Certosa di San
    Martino`.

WHAT COUNTS AS COMMON, and it is measured rather than asserted.  A phrase cannot
be looked up in a frequency list at all: those are built by segmenting text into
single words, so `di solito` is not in one and never can be.  What CAN be done is
counting it in a corpus of whole sentences, which is the method the Spanish decks
settled on and which this pipeline already uses for the handful of phrases in the
six bands.  Each candidate is counted in the Tatoeba Italian corpus (981,765
sentences) and `PHRASE_MIN` occurrences are required.

**THE COUNT IS EVIDENCE, NOT A RANKING, AND THE DIFFERENCE MATTERS HERE.**
Tatoeba is a translation corpus, so it over-represents whatever its contributors
happened to translate: `fare carriera` appears 1,442 times against `per favore`'s
4,068, a ratio of about 3 where real speech is nearer 100.  Measured, not
assumed -- the corpus holds 981,765 sentences and not one duplicate.  So the
threshold is doing the work it can (a phrase seen twice is attested) and the
ordering it produces is honest about being approximate.  The deck says so.

AND THE SENSE THE LIST IS ADMITTED ON IS THE SENSE THE CARD WILL SHOW, which is
the one rule here that is about not lying rather than about picking.  A phrase is
taken only when its FIRST living sense -- the one `build_deck` will print -- is a
current, idiomatic meaning.  Three kinds are refused:

  · **Wiktionary's non-idiomatic placeholder**, "Used other than figuratively or
    idiomatically: see in, mano." -- which is the dictionary saying outright that
    this is not an expression.  113 multiword entries open on it.
  · **An archaic, obsolete, dated, rare, historical or poetic sense.**  `la luna`
    is a Romanesco archaism meaning "not at all", and its 207 corpus hits are all
    the moon.  A deck of COMMON phrases must not teach it.
  · **A regional sense**, which Wiktionary marks in the gloss's own label rather
    than in its tags, so the label is read.

Not part of the site.
"""
import collections, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from cils_level import PHRASE_FILE, PHRASE_MIN
from italian import phrase_in

DUMP = 'kaikki-it.jsonl'
CORPUS = 'ita_sentences_detailed.tsv'

# an expression, rather than a compound noun or a name
KEEP_POS = {'phrase', 'proverb', 'intj', 'prep_phrase', 'adv', 'verb', 'adj',
            'conj', 'pron', 'prep'}

# a sense that points at another word rather than saying anything
DEAD_TAG = {'form-of', 'alt-of'}
POINTER = re.compile(r'^(plural|feminine|masculine|singular|alternative|synonym|'
                     r'past participle|present participle|inflection|obsolete form|'
                     r'misspelling|eye dialect|third-person|first-person|second-person)\b',
                     re.I)
# the dictionary saying this is not an expression at all
SEE = re.compile(r'^Used other than figuratively or idiomatically', re.I)
# not COMMON, whatever else it is
OLD_TAG = {'archaic', 'obsolete', 'dated', 'historical', 'rare', 'poetic'}
# …and the regional labels, which sit in the gloss's own label and never in tags
REGION = re.compile(r'^\([^)]*\b(?:Romanesco|Tuscan|Neapolitan|Sicilian|Milanese|'
                    r'Venetian|Sardinian|regional|dialectal|Switzerland|Ticino)\b',
                    re.I)

# a pronoun or determiner tagged plural is an inflected form of one (`i suoi`,
# `le sue`), which the pointer test cannot see because the gloss is written out
INFLECTED_CLOSED = {'pron', 'det'}


def first_living_sense(rec):
    """The sense a card would show, or None if the entry has none worth showing."""
    for s in rec.get('senses') or []:
        gs = s.get('glosses') or []
        if not gs:
            continue
        gloss = gs[0]
        tags = set(s.get('tags') or [])
        raw = (s.get('raw_glosses') or [''])[0] or ''
        if s.get('form_of') or s.get('alt_of') or (tags & DEAD_TAG):
            continue
        if POINTER.match(gloss) or SEE.match(gloss):
            continue
        if (tags & OLD_TAG) or REGION.match(raw):
            return None            # the FIRST real sense is not a current one
        if rec.get('pos') in INFLECTED_CLOSED and 'plural' in tags:
            return None
        return gloss
    return None


def candidates():
    out, why = {}, collections.Counter()
    for line in open(DUMP, encoding='utf-8'):
        try:
            r = json.loads(line)
        except Exception:
            continue
        if r.get('lang_code') != 'it':
            continue
        w = (r.get('word') or '').strip()
        if ' ' not in w:
            continue
        if r.get('pos') not in KEEP_POS:
            why[r.get('pos') or '?'] += 1
            continue
        g = first_living_sense(r)
        if g is None:
            why['no current sense of its own'] += 1
            continue
        # **KEYED LOWER, WRITTEN AS THE DUMP SPELLS IT.**  The key folds case so
        # two records of one phrase meet; the value keeps the dictionary's own
        # spelling, because that is the lemma the next stage looks up.  Written
        # lower-cased, `buon Natale`, `se Dio vuole` and five more were asked for
        # under a spelling Wiktionary does not have and were dropped -- and
        # `parse_cils`' capital rule cannot recover them, since it offers
        # `Buon natale` and the capital is on the second word.
        out.setdefault(w.lower(), (w, r.get('pos'), g))
    return out, why


def corpus_counts(words):
    """How many of the corpus's sentences each phrase appears in.

    **THE SAME RULE `select` ORDERS BY**, deliberately shared rather than
    reimplemented: this decides which phrases are IN the deck and that decides
    where they COME in it, so two different notions of "appears in" would set a
    threshold on one measurement and sort on another.

    Indexed by first word so one pass tests them all -- the alternative is every
    phrase against every sentence, 1.4 billion tests at this scale.  The index is
    only a shortlist: `phrase_in` still decides.
    """
    byfirst = collections.defaultdict(list)
    for p in words:
        byfirst[p.split(' ', 1)[0]].append(p)
    tok = re.compile(r"[a-zà-öø-ÿ']+")
    count = collections.Counter()
    n = 0
    for line in open(CORPUS, encoding='utf-8'):
        parts = line.split('\t')
        if len(parts) < 3:
            continue
        n += 1
        low = parts[2].lower()
        # the shortlist first, as a SET: a sentence counts once per phrase,
        # however often the phrase occurs in it, which is what `select` does
        maybe = set()
        for m in tok.finditer(low):
            maybe.update(byfirst.get(m.group(0), ()))
        for p in maybe:
            if phrase_in(low, p):
                count[p] += 1
    return count, n


def main():
    cands, why = candidates()
    print(f'  multiword entries that are expressions: {len(cands)}')
    drop = ', '.join(f'{k} {v}' for k, v in why.most_common(4))
    print(f'  refused: {drop}')

    count, n = corpus_counts(cands)
    print(f'  counted in {n:,} Tatoeba sentences')
    keep = sorted((p for p in cands if count[p] >= PHRASE_MIN),
                  key=lambda p: (-count[p], p))
    seen = sum(1 for p in cands if count[p])
    print(f'  attested at all: {seen}; at least {PHRASE_MIN}: {len(keep)}')

    spelt = [cands[p][0] for p in keep]
    with open(PHRASE_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(spelt) + '\n')
    print(f'  wrote {PHRASE_FILE}: {len(spelt)} phrases')
    print('  commonest five:', ', '.join(spelt[:5]))
    print('  rarest five:', ', '.join(spelt[-5:]))


if __name__ == '__main__':
    main()
