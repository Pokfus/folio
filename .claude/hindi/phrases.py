#!/usr/bin/env python3
"""The phrases deck's words: Hindi set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the Tatoeba Hindi sentences, writes `selected-phr.json` -- the
same rows `select.py` writes for a level, each with a `sub`.  Not a CEFR level: an
expression is a unit a word list cannot see, and the level decks' frequency fill never
takes a multi-word lemma (`select.py`), so these are what the levels leave.  Three
subdecks, the Indonesian and Turkish arrangement (`.claude/turkish/phrases.py`):

  Phrases   the everyday formulas (`जी हाँ`, `ख़ुदा हाफ़िज़`, `बाप रे`) and the fixed
            expressions of more than one word (`आराम से`, `के मुताबिक़`, `फिर भी`):
            Wiktionary's phrases, interjections and multi-word adverbs, conjunctions,
            postpositions and pronouns, NOT tagged idiomatic;
  Idioms    an expression of more than one word whose meaning is not its words'
            (`मक्खन लगाना` "to flatter"): a sense Wiktionary TAGS `idiomatic`;
  Proverbs  a complete saying, Wiktionary's part of speech `proverb`.

A multi-word NOUN or VERB that is not idiomatic (`अनुवाद करना`, `मौसम विज्ञान`) is a
compound a learner builds from its words, and is not taken.

NOTHING A LEVEL DECK TEACHES IS REPEATED (`words_below`: A1 to C1, and their
alternative spellings).

THE ORDER is how often the expression occurs in Tatoeba's Hindi sentences, its words in
sequence, an expression that IS a verb counted with its last word in any form of that
verb (`दाल में कुछ काला है`); ties by spelling.  Shown in `freq`.
"""
import csv, json, os, sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hi import fold, nfc, tokens
from hindi_level import f, words_below

csv.field_size_limit(10 ** 8)

PHRASE_POS = {'phrase', 'intj', 'prep_phrase', 'adv', 'conj', 'postp', 'pron'}
IDIOM_POS = {'verb', 'noun', 'adj', 'adv', 'phrase', 'postp', 'intj', 'prep_phrase'}
ORDER = ['Phrases', 'Idioms', 'Proverbs']

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    'के बारे',                    # a fragment of के बारे में, which A2 teaches
    'अल्लाहो अकबर', 'अहल ईमान',    # Arabic religious formulas rather than Hindi phrases
    'सहीफ़ा ख़्वाँ',                # "Reader of Quran", a title, filed as an adverb
    'इंक़िलाब ज़िंदाबाद', 'दिल्ली चलो', 'दुनिया के मजदूरों एक हो जाओ',
    'विश्व के कार्यकर्ताओं एकजुट हो जाओ', 'लाल सलाम', 'जय श्री राम', 'जय सिया राम',
                                 # political and religious slogans, not things said in passing
    'वन्दे मातरम्', 'सत्यमेव जयते', 'वसुधैव कुटुम्बकम्',  # national mottos and a scriptural motto
    'कल आना',                     # an inscription to ward off a witch, not a phrase anyone says
    'भाड़ में जाओ', 'दफ़ा हो जा',     # oaths (A1 excluded भाड़ for the same reason)
    'के परे', 'से परे', 'अतिथिदेवो भव',  # no romanisation in Wiktionary, and none is invented
    'दूर के ढोल सुहावने लगते हैं', 'दूर के ढोल सुहावने होते हैं',
                                 # two wordings of दूर के ढोल सुहावने, which carries the card
}

# A PHRASEBOOK SENTENCE is not a set phrase: Wiktionary files "I love you" in eighteen
# persons, genders and registers (मैं तुझ से प्यार करता हूँ …), "I'm Hindu", "I'm a
# girl", "where do you live?" in six forms -- sentences a learner builds from the level
# decks' words.  A non-idiomatic phrase of three or more words with a personal pronoun
# in it is one (the Turkish deck's hand list, as a rule); पहले आप "after you" and
# कैसे हो "how are you?" are not.
PRONOUNS = {fold(w) for w in 'मैं मुझे मेरा मेरी मेरे हम हमें हमारा तुम तुम्हें तुम्हारा तुम्हारी '
            'तुम्हारे तू तुझे तेरा तेरी आप आपका आपकी आपके आपको वह वे उसका उसकी उनका उनकी'.split()}
# ...except a set expression that happens to hold one ("your wish is my command")
PHRASEBOOK_KEEP = {'आपका हुक्म सर आँखों पर'}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak']]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if 'entries' not in L or L.get('formonly') or L['word'] in EXCLUDE:
            continue
        if '...' in k or '…' in k:          # a template, not a phrase
            continue
        multi = ' ' in k.strip()
        for e in L['entries']:
            gl = good(e)
            if not gl:
                continue
            idiom = any('idiomatic' in g['tags'] for g in gl)
            if e['pos'] == 'proverb':
                sub = 'Proverbs'
            elif multi and idiom and e['pos'] in IDIOM_POS:
                sub = 'Idioms'
            elif e['pos'] == 'phrase' or (multi and e['pos'] in PHRASE_POS):
                words = [fold(t) for t in tokens(L['word'])]
                if e['pos'] == 'phrase' and len(words) >= 3 and set(words) & PRONOUNS \
                        and L['word'] not in PHRASEBOOK_KEEP:
                    continue
                sub = 'Phrases'
            else:
                continue
            # one subdeck per expression: a proverb outranks an idiom outranks a phrase
            if k not in rows or ORDER.index(sub) > ORDER.index(rows[k][0]):
                rows[k] = (sub, e['pos'])
    return rows


def sentences():
    out = []
    for row in csv.reader(open('hin_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            out.append([fold(t) for t in tokens(nfc(row[2]))])
    return out


def verb_forms(L):
    """The last word's forms, for an expression that is a verb (`मक्खन लगाना` -> लगाया, लगाते …)."""
    out = set()
    for e in L['entries']:
        if e['pos'] == 'verb':
            for t in e['table']:
                parts = fold(t['f']).split()
                if parts:
                    out.add(parts[-1])
    return out


def count(lex, rows, sents):
    first = {}
    for i, toks in enumerate(sents):
        for t in set(toks):
            first.setdefault(t, []).append(i)
    out = Counter()
    for k, (sub, pos) in rows.items():
        parts = [fold(p) for p in tokens(lex[k]['word'])]
        if not parts:
            continue
        last = {parts[-1]}
        if pos == 'verb' and parts[-1].endswith('ना'):
            last |= verb_forms(lex[k])
        n = len(parts)
        for i in first.get(parts[0], []):
            toks = sents[i]
            if any(toks[j:j + n - 1] == parts[:-1] and toks[j + n - 1] in last
                   for j in range(len(toks) - n + 1)):
                out[k] += 1
    return out


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    below |= {lex[k]['alt_of'] for k in below if k in lex and 'alt_of' in lex[k]}
    rows = {k: v for k, v in classify(lex).items() if k not in below}
    n = count(lex, rows, sentences())
    out = [{'key': k, 'via': '', 'word': lex[k]['word'], 'freq': n.get(k, 0), 'pos': pos,
            'source': 'phrases', 'topic': '', 'sub': sub} for k, (sub, pos) in rows.items()]
    out.sort(key=lambda r: (ORDER.index(r['sub']), -r['freq'], r['key']))
    json.dump(out, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    c = Counter(r['sub'] for r in out)
    print(f'  {len(out)} expressions: ' + ', '.join(f'{c[s]} {s.lower()}' for s in ORDER)
          + f'; {sum(1 for r in out if r["freq"])} occur in Tatoeba')


if __name__ == '__main__':
    main()
