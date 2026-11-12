#!/usr/bin/env python3
"""The phrases deck's expressions: Dutch set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with two more fields, `sub` and `count`.
Adapted from `.claude/hindi/phrases.py`; the plan is `docs/dutch-decks-plan.md`.

Not a CEFR level: an expression is a unit a frequency list of words cannot
see, which is why the level decks teach so few of them.  Three subdecks, the
Indonesian, Turkish and Hindi arrangement (`docs/lang-decks.md`, "THE PHRASES
DECK"):

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase, a prepositional phrase or an interjection and does NOT tag
            idiomatic -- the everyday formulas (`graag gedaan`, `tot nu toe`,
            `in elk geval`);
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic (`in de maling nemen`, `op de hoogte`, `af en toe`);
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.

DUTCH WORDS ONLY.  Wiktionary's Dutch section files the Latin, French and
Italian tags Dutch writing borrows (`in vitro`, `al dente`, `s'il vous
plaît`, `mea culpa`) as Dutch phrases; an expression is kept only when every
one of its words is a Dutch headword or a form in one (`_dutch`).

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`dutch_level.words_below`), a
weak sense (rare, dialectal, vulgar ...) is not a reason to include an
expression, a template (`...`) is not an expression, and `EXCLUDE` names the
rest, each with its reason.

THE ORDER is how many of Tatoeba's Dutch sentences contain the expression --
one that is a verb counted with its verb in any form and in either place
(`examples.py`'s matching for this deck) -- then the expression's own frequency
estimate (`extract.py`), then its spelling.  Most expressions occur in no
Tatoeba sentence, so the second key orders much of the deck; the description
says so.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nl import fold, tokens
from dutch_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, so the level stage is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('dutch_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SWEARS = _select().SWEARS

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj', 'proverb'}

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Turkish and Hindi rule): a sentence a learner
    # builds from the level decks' words.  The questions and formulas stay (hoe gaat het, hoe
    # laat is het, waar kom je vandaan, wat kan ik voor u doen, ik heb slaap).
    'ik ben moe': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb honger': 'a phrasebook sentence built from level words, not a set phrase',
    'ik begrijp het niet': 'a phrasebook sentence built from level words, not a set phrase',
    'ik hou van jou': 'a phrasebook sentence built from level words, not a set phrase',
    'bel de politie': 'a phrasebook sentence built from level words, not a set phrase',
    'heb je hulp nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben verdwaald': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb een vraag': 'a phrasebook sentence built from level words, not a set phrase',
    'ik spreek geen Engels': 'a phrasebook sentence built from level words, not a set phrase',
    'spreekt u Engels': 'a phrasebook sentence built from level words, not a set phrase',
    'is er iemand thuis': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb je hulp nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'ik snap het niet': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben de weg kwijt': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben ziek': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb een taxi nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ga dood': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb uw hulp nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb een dokter nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'ik bloed': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben hetero': 'a phrasebook sentence built from level words, not a set phrase',
    'ik spreek geen Nederlands': 'a phrasebook sentence built from level words, not a set phrase',
    'ik weet het echt niet': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb geld nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'heeft u hulp nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb water nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'gelooft u in God': 'a phrasebook sentence built from level words, not a set phrase',
    'ik eet geen vlees': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben homo': 'a phrasebook sentence built from level words, not a set phrase',
    'ik eet geen vis': 'a phrasebook sentence built from level words, not a set phrase',
    'spreekt hier iemand Engels': 'a phrasebook sentence built from level words, not a set phrase',
    'bel een ambulance': 'a phrasebook sentence built from level words, not a set phrase',
    'hij is bewusteloos': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb koorts': 'a phrasebook sentence built from level words, not a set phrase',
    'bel de brandweer': 'a phrasebook sentence built from level words, not a set phrase',
    'welke talen spreekt u': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben verkouden': 'a phrasebook sentence built from level words, not a set phrase',
    'ik eet geen varkensvlees': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb een plattegrond nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben vegetariër': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb suikerziekte': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb eten nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'zegt u mij na alstublieft': 'a phrasebook sentence built from level words, not a set phrase',
    'waar kan ik een hotel vinden': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb een kaart nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'gebruikt u medicijnen': 'a phrasebook sentence built from level words, not a set phrase',
    'hoe kom ik bij het station': 'a phrasebook sentence built from level words, not a set phrase',
    'hoe kom ik bij het vliegveld': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben verkracht': 'a phrasebook sentence built from level words, not a set phrase',
    'zij is bewusteloos': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben beroofd': 'a phrasebook sentence built from level words, not a set phrase',
    'hebt u een menu in het Engels': 'a phrasebook sentence built from level words, not a set phrase',
    'hoe kom ik bij de luchthaven': 'a phrasebook sentence built from level words, not a set phrase',
    'ben je allergisch voor medicijnen': 'a phrasebook sentence built from level words, not a set phrase',
    'bent u allergisch voor medicijnen': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb een gids nodig': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben allergisch voor noten': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben bestolen': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben homoseksueel': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb diabetes': 'a phrasebook sentence built from level words, not a set phrase',
    'hoe kom ik bij het busstation': 'a phrasebook sentence built from level words, not a set phrase',
    'ik heb verhoging': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben bi': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben biseksueel': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben niet godsdienstig': 'a phrasebook sentence built from level words, not a set phrase',
    'ik ben heteroseksueel': 'a phrasebook sentence built from level words, not a set phrase',
    'hoe kom ik in': 'a phrasebook sentence built from level words, not a set phrase',
    'dag moeder': 'a phrasebook sentence built from level words, not a set phrase',
    'hallo daar': 'a phrasebook sentence built from level words, not a set phrase',
    'op kantoor': 'a phrasebook sentence built from level words, not a set phrase',
    'met een baard': 'a phrasebook sentence built from level words, not a set phrase',
    # the same expression twice: one form kept
    'hoe gaat het met jou': 'hoe gaat het met je with the stressed pronoun; that form is taught',
    'er is niets nieuws onder de zon': 'niets nieuws onder de zon with er is; that form is taught',
    'veel koks bederven de brij': 'a variant of veel koks verzouten de brij, which is taught',
    'onze lieve heer heeft vreemde kostgangers': 'a variant of ... rare kostgangers, which is taught',
    'op ieder potje past een dekseltje': 'a variant of op elk potje past een deksel, which is taught',
    'nooit geschoten is altijd mis': 'a variant of niet geschoten is altijd mis, which is taught',
    'een zwaluw maakt nog geen lente': 'a variant of the proverb een zwaluw maakt nog geen zomer, which is taught',
    # the count is the literal words, never the sense taught
    'het gaat': "its sentences are the literal 'it goes / it is going to', not the reply its card teaches",
    'mijn voeten': "Wiktionary's first sense is the literal one; its sentences are all literal",
    'als in': "'as in'; two words in sequence, not a set expression",
    'bruine beer': "the animal, and a crude second sense",
    # oaths and crude words (the level decks' rule)
    'in godsnaam': 'an exclamation; godsnaam is kept out of the level decks with the swearing',
    'in hemelsnaam': 'an exclamation; hemelsnaam is kept out of the level decks with the swearing',
    'in vredesnaam': 'an exclamation; vredesnaam is kept out of the level decks with the swearing',
    'niet lullen maar poetsen': 'built on lullen, a vulgar word',
    'in de zeik nemen': 'built on zeik, a vulgar word',
    'pagga slaan': 'a sexual slang expression',
    'een bruine trui breien': 'a crude slang expression',
    'voor het zingen de kerk uitgaan': 'a sexual euphemism',
    'schiet mij maar lek': "Wiktionary's English is a crude gloss",
    'alsof er een engeltje op je tong piest': 'built on piesen, a crude word',
    # not an expression to learn
    'tot sinas': 'an eggcorn (a joking misspelling) of tot ziens',
    'scheetje beef': 'a spoonerism of beetje scheef, a joke',
    'in een lastig pakket zitten': 'an eggcorn of in een lastig parket zitten, which is taught',
    # the foreign tags the Dutch-words test lets through (each word is also a Dutch spelling)
    'crème de la crème': 'a French tag',
    'nota bene': 'a Latin tag',
    # offensive
    'het is de moriaan gewassen': 'built on a racial image ("washing the Moor white")',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}


# A SENSE THAT ONLY POINTS ELSEWHERE is not a meaning: an entry whose every sense is
# "synonym of ..." (`in elk geval` -> in ieder geval, `gelukkige feestdagen` -> fijne
# feestdagen) is the same expression as one the deck already has, and printed it was an
# empty English side.
POINTER = re.compile(r'^(?:synonym|alternative form|alternative spelling) of |^used other than figuratively', re.I)


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak'] and not POINTER.match(g['g'])]


def _dutch(lex):
    """Every spelling Wiktionary's Dutch section knows: headwords and the forms in their tables."""
    known = set()
    for k, L in lex.items():
        if k.startswith('='):
            k = k[1:].lower()
        if ' ' not in k:
            known.add(k)
        for e in L.get('entries', []):
            for t in e.get('table', []):
                if ' ' not in t['f']:
                    known.add(fold(t['f']))
            for fm in e.get('head', {}).values():
                if isinstance(fm, str) and ' ' not in fm:
                    known.add(fold(fm))
    return known


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly') or k.startswith('='):
            continue
        if '...' in k or '…' in k or k[0] == '-' or k[-1] == '-':
            continue
        for e in L['entries']:
            gl = good(e)
            if not gl:
                continue
            tags = {t for g in gl for t in g['tags']}
            if e['pos'] == 'proverb':
                sub = 'Proverbs'
            elif 'idiomatic' in tags and e['pos'] in IDIOM_POS:
                sub = 'Idioms'
            elif e['pos'] in PHRASE_POS:
                sub = 'Phrases'
            else:
                continue
            rank = ORDER.index(sub)
            if k not in rows or rank > rows[k][1]:
                rows[k] = (sub, rank, e['pos'])
    return rows


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    known = _dutch(lex)
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    rows, foreign = [], []
    for k, (sub, _, pos) in classify(lex).items():
        if k in below or k in excl:
            continue
        ws = [fold(t) for t in tokens(k)]
        if any(w in swears for w in ws):
            continue
        if not all(w in known for w in ws):
            foreign.append(k)
            continue
        L = lex[k]
        rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': pos if sub != 'Phrases' else '', 'source': 'phrases',
                     'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(nl)] for _, nl, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        rest, forms = examples.phrase_parts(r, lex)
        r['count'] = sum(1 for i in index.get(rest[0], [])
                         if examples.phrase_hit(toks[i], rest, forms))
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence; '
          f'{len(foreign)} left out as not Dutch')


if __name__ == '__main__':
    main()
