#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`finnish_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fi import fold
from finnish_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY


# Read off the A1 ranking (2026-11-15).  Each with its reason.
EXCLUDE = {
    # A FORM OF A WORD THE DECK TEACHES, which Wiktionary also files as a word of its own:
    'mitä': 'the partitive of mikä ("what"), taught there; its own entry is "the ... the"',
    'sitä': 'the partitive of se, taught there; its own entry is "the ... the"',
    'naiset': 'the plural of nainen, glossed only "ladies" (an address)',
    'odota': 'the imperative of odottaa ("wait!"), taught there',
    'käy': 'a form of käydä, glossed only as the film set\'s "action!"',
    # A COUNT THAT BELONGS TO ANOTHER WORD:
    'et': 'the count is ei\'s "you (do) not"; its own entry is the ampersand',
    'niittää': 'the count is niitä, the partitive of ne ("them"); glossed "to mow"',
    # COLLOQUIAL SPELLINGS of words the deck teaches in the standard form:
    'mä': 'the spoken form of minä ("I"), which the deck teaches',
    # Read off the A2 ranking (2026-11-15).
    'sä': 'the spoken form of sinä ("you"), A1',
    'niiden': 'the genitive of ne ("their"), with no English of its own',
    'joita': 'the partitive plural of joka (A1), glossed only "whom."',
    'jolla': 'the adessive of joka (A1), glossed only "if"',
    'jota': 'the count is joka\'s partitive (A1); glossed only "iota"',
    'niistää': 'the count is niistä, the elative of ne; glossed "to blow one\'s nose"',
    'näet': 'the "you see" of nähdä (A1); its own entry is "you see, you know"',
    'kahden': 'the genitive of kaksi (A1), glossed only "between the two"',
    'miehet': 'the plural of mies (A1), glossed only "gentlemen" (an address)',
    'yötä': 'the partitive of yö (A1), glossed only "night!"',
    'päivää': 'the partitive of päivä (A1), glossed "good day"; hyvää päivää is A1',
    'senkin': 'an insult\'s opening ("you ...!")',
    'turpa': 'the count is the rude "turpa kiinni" ("shut your trap"); glossed only "muzzle"',
    # Read off the B1 ranking (2026-11-15).  Forms of words the levels below teach:
    'varo': 'the imperative of varoa ("watch out!")',
    'olkoon': 'the third-person imperative of olla (A1)',
    'kolmen': 'the genitive of kolme (A1), with no English of its own',
    'tietä': 'the partitive of tie (A1), glossed only "make way!"',
    'syömään': 'syödä\'s third infinitive (A1), glossed only "dinner\'s ready!"',
    'iltaa': 'the partitive of ilta (A1), glossed "good evening"; hyvää iltaa is A1',
    'tahdon': 'the "I" form of tahtoa (A2), glossed only "I do"',
    'monet': 'the plural of moni (A2)',
    'kaikista': 'the elative plural of kaikki (A1)',
    'johonkin': 'the illative of jokin (A1)',
    'joiden': 'the genitive plural of joka (A1)',
    'ellet': 'ellei\'s "unless you", taught on ellei', 'ellen': 'ellei\'s "unless I", taught on ellei',
    'menemään': 'mennä\'s third infinitive (A1)',
    'lue': 'the imperative of lukea (A1)', 'jatkakaa': 'the plural imperative of jatkaa (A1)',
    'tulta': 'the partitive of tuli, glossed only "fire!" (the order)',
    'tekevä': 'the present participle of tehdä (A1)', 'tietävä': 'the present participle of tietää (A1)',
    # A count that belongs to another word, a name or the subtitles' own credits:
    'henry': 'the name Henry, glossed only as the unit', 'max': 'the name Max',
    'mari': 'the name Mari, glossed only as the people', 'lee': 'the name Lee',
    'san': 'the name or the Japanese title, glossed only as a Greek letter',
    'sara': 'the name Sara, glossed only "sedge"',
    'sepä': 'the count is se + -pä ("that\'s it"), glossed only as part of a sleigh',
    'kevi': 'glossed only as a kind of electrical cable; the count is not that',
    'hra': 'an abbreviation of herra (A1)',
    'suomennos': 'the subtitles\' credit line ("Suomennos: ..."), counted once a film',
    'tekstitys': 'the subtitles\' credit line', 'oikoluku': 'the subtitles\' credit line',
    # Colloquial, exclamations and insults:
    'sun': 'the spoken form of sinun ("your"), glossed only as an old conjunction',
    'tä': 'the spoken "what?"', 'mitäs': 'the spoken "what, then?"', 'kyttä': 'slang for the police',
    'jeesus': 'an exclamation', 'jessus': 'an exclamation', 'jestas': 'an exclamation',
    'hemmetti': 'a mild curse ("dammit")', 'ämmä': 'an insult ("old hag")',
    'varokaa': 'the plural imperative of varoa', 'kuoleva': 'the present participle of kuolla (A1)',
    'tää': 'the spoken form of tämä (A1)', 'eka': 'the spoken form of ensimmäinen (A1)',
    'hyvänen': 'used only in hyvänen aika ("good heavens")',
    # Read off the B2 ranking (2026-11-15).  Forms of words the levels below teach:
    'menevä': 'the present participle of mennä (A1)', 'näkevä': 'the present participle of nähdä (A1)',
    'pitävä': 'the present participle of pitää (A1)', 'kerrottava': 'kertoa\'s passive participle (A1), glossed only "multiplicand"',
    'kultaseni': 'kultanen\'s "my" form (B1)', 'sinunlaisesi': 'a possessive form ("like you")',
    'kuuntelen': 'the "I" form of kuunnella (A1), glossed only as the radio\'s "over"',
    'tuliko': 'tulla\'s question form (A1)', 'poistu': 'the imperative of poistua (B1)',
    'liikkumatta': 'liikkua\'s abessive infinitive, glossed only "freeze!"',
    'roskaa': 'the partitive of roska (B1), glossed only "rubbish!"',
    'öitä': 'the partitive plural of yö (A1), glossed only "night!"',
    'huomiseen': 'the illative of huominen (B1), glossed only "see you tomorrow"',
    'menoksi': 'the translative of meno (B1), glossed only "let\'s go!"',
    'korkein': 'the superlative of korkea (B1), with no English of its own',
    'ellemme': 'ellei\'s "unless we", taught on ellei (B1)', 'tuhatta': 'the partitive of tuhat (A1)',
    'voihan': 'voi (A1) with -han', 'kotia': 'the spoken form of kotiin ("home")',
    'näkemä': 'glossed only "sight distance"; the count is näkemiin\'s (A1)',
    'versionumero': 'the subtitles\' credit line ("version number")',
    # Letters' names, abbreviations, names and English:
    'ää': 'the letter Ä\'s name', 'aa': 'the letter A\'s name', 'ee': 'the letter E\'s name',
    'rva': 'an abbreviation of rouva (A1)', 'in': 'English', 'show': 'English', 'house': 'English',
    'college': 'English, glossed only "sweatshirt"', 'penny': 'English', 'avenue': 'English',
    'jersey': 'English', 'gloria': 'the name Gloria', 'graham': 'the name Graham',
    'nelson': 'the name Nelson', 'maya': 'the name Maya', 'lana': 'the name Lana',
    'santa': 'the name Santa, glossed only "sand"', 'frankki': 'the name Frank',
    'ainu': 'glossed only as the people; the count is the spoken ainoa',
    # Spoken forms, curses, slang and insults:
    'tissi': 'slang ("boob")', 'perhana': 'a mild curse', 'pirun': 'a curse ("damn")',
    'pahus': 'a mild curse', 'kusettaa': 'vulgar ("to con", from kusi)', 'lesbo': 'slang',
    'beibi': 'slang ("baby")', 'viis': 'the spoken "never mind" (viis siitä)',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'vittu', 'perkele', 'saatana', 'helvetti', 'paska', 'huora', 'kyrpä', 'perse', 'pillu',
          'mulkku', 'runkata', 'kusipää', 'paskiainen', 'idiootti', 'ääliö', 'jumalauta', 'kusi',
          'paskapää', 'mulkero', 'narttu', 'homo', 'neekeri', 'hintti', 'vitun', 'saatanan',
          'perkeleen', 'helvetin', 'paskat', 'hitto', 'hiton', 'piru', 'piru', 'piruuttaan'}


def gloss_sig(L):
    return tuple(sorted({g['g'] for e in L['entries'] for g in e['glosses'] if not g['weak']}))[:4]


# A POINTER Wiktionary does not tag as a form, which `build_deck` drops, so the card would
# come out with no English -- the patterns the Hungarian set met ("first-person ... of X",
# "synonym of X", "only used in X", "verbal noun of X" bare), kept for Finnish.
POINTER = re.compile(r'^(?:(?:first|second|third)-person\b.*?|synonym) of \S+'
                     r'|^only used in\b|^verbal noun of \S+$')


def usable(L):
    """A non-weak, non-pointer gloss in the etymology the card SHOWS (`build_deck`: the
    first, unless `ETYMS` names others)."""
    first = L['entries'][0].get('etym', '') if L['entries'] else ''
    gl = [g for e in L['entries'] if e.get('etym', '') == first
          for g in e['glosses'] if not POINTER.match(g['g'])]
    return any(not g['weak'] for g in gl)


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            via = ''
            if L and 'alt_of' in L:
                # the common spelling of a word Wiktionary files under another :
                # the card prints the spelling written here and the target's meanings
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            # an inventory word whose own spelling is also a FORM of another lemma lost that
            # count in the split: it is dealt by the larger of its lemma count and its own
            # spelling's (Hungarian's rule)
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': max(L['freq'], L.get('own', 0)),
                         'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    sigs = {gloss_sig(lex[r['via']] if r['via'] else lex[r['key']]) for r in rows}
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: -kv[1]['freq']):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if len(k) < 2:
            continue
        # a MULTI-WORD lemma (jó reggelt) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        # AN ALTERNATIVE SPELLING THE LEVEL ALREADY HAS: Wiktionary sometimes gives both full
        # entries, glossed alike, so a lemma whose glosses are those of a word already chosen
        # is the same word.
        sig = gloss_sig(L)
        if sig in sigs:
            continue
        sigs.add(sig)
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
