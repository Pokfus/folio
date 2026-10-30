#!/usr/bin/env python3
"""Choose the level's notes: the inventory, then the commonest remaining words.

Reads `lex.json` (extract_kaikki.py) and the Tatoeba Russian sentences; writes
`selected-<level>.json`, a list of notes in the order they are dealt.

A NOTE IS A UNIT, NOT AN ENTRY, in three ways:

  · AN ASPECT PAIR IS ONE NOTE.  `делать` names `сделать` as its perfective and
    `сделать` names `делать` back; the two are one verb to a learner and one
    note here, imperfective first, its frequency the sum of the two.  Only a
    MUTUAL pairing is taken -- `говорить` lists `сказать` and `поговорить`, and
    `сказать` lists `говорить`, so the pair is говорить / сказать -- because a
    one-sided listing is where Wiktionary's editors disagree.  The verbs of
    motion that go round trips (`ходить`, `ездить` …) are never paired: their
    listed "perfective" (`сходить`) is a different verb, and the contrast with
    `идти` / `ехать` is the thing being learnt.
  · CLOSED-CLASS HOMOGRAPHS ARE ONE NOTE.  `что` is a pronoun and a conjunction,
    `как` an adverb and a conjunction, `пока` "while" and "bye".  A learner
    meets one word and Wiktionary files it twice; the note carries each part of
    speech as its own block.
  · AN OPEN-CLASS HOMOGRAPH OF A FUNCTION WORD IS NOT A CANDIDATE.  `и` is also a
    noun (the letter's name), `в` a noun (volt), `тут` a noun (a dialect word),
    and since `extract_kaikki` gives a headword's whole count to every entry
    spelt that way, each would arrive at the top of the list.  Likewise a noun
    whose headword is an inflected form of a far commoner word: `том` (a volume)
    is mostly the prepositional of `тот`, `лёт` (flight) mostly the genitive
    plural of `год`.  The inventory can still name such a word explicitly.

THE ORDER IS FREQUENCY.  Single words by the lemma frequency `extract_kaikki`
computed; a phrase (`до свидания`) has no row in a segmented list, so it is
counted in Tatoeba on word boundaries and put on the subtitle scale through the
single words both corpora count -- CAPLE's arrangement.
"""
import collections, json, os, re, statistics, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from russian import fold, tokens, bare
from torfl_level import LEVEL, TARGET, f as lvlf, words_below
from supplement import inventory

CLOSED = {'adv', 'pron', 'conj', 'particle', 'prep', 'intj', 'det', 'num',
          'phrase', 'prep_phrase', 'postp', 'proverb'}
OPEN = {'noun', 'verb', 'adj'}
JUNK_TAGS = {'obsolete', 'archaic', 'dated', 'rare', 'dialectal', 'abbreviation',
             'initialism', 'letter', 'vulgar', 'offensive', 'derogatory',
             'historical', 'nonstandard', 'Internet', 'slang', 'pre-reform'}
# VERBS LEFT UNPAIRED although Wiktionary pairs them mutually: the listed
# partner is the по- verb of "doing it for a while" (`постоять`, to stand for a
# bit), not the perfective a learner is taught beside the verb.
NO_PAIR = {'стоять', 'держать', 'бояться', 'надеяться', 'искать', 'сидеть',
           'лежать', 'гулять', 'работать', 'спать', 'жить', 'играть', 'болеть',
           'любить', 'помнить', 'знать', 'хотеть', 'мочь', 'бежать',
           'волноваться', 'означать', 'существовать', 'дышать', 'бороться'}
# and pairs whose "perfective" is the verb of STARTING (`закричать`, to cry out;
# `замолчать`, to fall silent) -- a real verb, but not the one paired with the
# imperfective in a textbook
NO_PAIR |= {'кричать', 'молчать', 'злиться', 'общаться', 'плакать', 'смеяться'}
# and the по- delimitatives the A2 read found (`курить / покурить`, to have a
# smoke), and a "pair" that is two verbs (`мешать` to hinder, `смешать` to mix)
NO_PAIR |= {'мечтать', 'курить', 'участвовать', 'путешествовать', 'мешать'}
# …AND PAIRS WIKTIONARY DOES NOT LIST BOTH WAYS, or lists behind a rarer verb
# (`видеть` reaches `завидеть`, "to catch sight of", before `увидеть`).  Each is
# the pair every textbook gives.
PAIRS = {'видеть': 'увидеть', 'просить': 'попросить', 'ждать': 'подождать',
         'нравиться': 'понравиться'}
ROUND_TRIP = {'летать', 'ходить', 'ездить', 'бегать', 'летать', 'плавать', 'носить',
              'водить', 'возить', 'бродить', 'лазить', 'катать', 'таскать', 'гонять'}

# WORDS THE FREQUENCY FILL MAY NOT TAKE, each with its reason.  The inventory
# is not bound by this; it is the subtitle corpus's own vocabulary that needs
# turning away.
REFUSED = {
    'убить': 'film violence; a beginner does not need "to kill" before "to buy"',
    'убийство': 'film violence (murder)',
    'умереть': 'film violence; "to die" is taught later',
    'чёрт': 'an oath ("devil, damn"), common only as an exclamation',
    'бог': 'common only inside exclamations (боже мой, слава богу)',
    'мистер': 'dubbing\'s rendering of English "Mister"',
    'сэр': 'dubbing\'s rendering of English "sir"',
    'парень': 'kept for A2 with the other informal words for people',
    'полиция': 'film and television plot vocabulary',
    'кровь': 'film violence',
    'смерть': 'film violence',
    'ну': 'its verb entry is a dialect word; the particle is too vague to gloss for A1',
    'эй': 'an exclamation, not vocabulary',
    'ребята': 'a plural noun with its own entry; ребёнок is taught',
    'лет': 'the genitive plural of год, taught on год\'s card',
    'об': 'a spelling of о before a vowel, taught on о\'s card',
    'потому': 'taught inside потому что',
    'лучше': 'the comparative of хороший and хорошо, taught on their cards',
    'больше': 'the comparative of большой and много',
    'раньше': 'the comparative of рано',
    'более': 'a comparative of много, for the written register',
    'лучшее': 'the superlative of хороший used as a noun',
    'такое': 'a form of такой',
    'том': 'mostly the prepositional of тот',
    'капитан': 'film and television plot vocabulary',
    'ненавидеть': 'film vocabulary; "to hate" is not a first-year verb',
    'миссис': 'dubbing\'s rendering of English "Mrs"',
    'мисс': 'dubbing\'s rendering of English "Miss"',
    'мёртвый': 'film violence',
}


# …AND THE SAME TURNED AWAY BY THEME, once the corpus starts choosing (A2, Oct
# 2026): with the commonest 500 words gone, a subtitle list's next few hundred
# are what crime drama is made of.  Each group has one reason; a word here is
# not banned from the set, only from being chosen BY FREQUENCY -- a later
# level's inventory can name `суд` or `война` where its scope reaches them.
for _reason, _words in [
    ('crime-drama vocabulary, which a subtitle corpus over-counts',
     'убийца убивать жертва тюрьма стрелять агент суд преступление пистолет свидетель '
     'офицер детектив адвокат полицейский наркотик бомба погибать уничтожать сделка '
     'война оружие умирать заложник труп пуля охрана коп расследование арестовывать '
     'арестовать приказ враг нападать бить ударять удар убираться обвинение судить '
     'армия солдат военный сержант лейтенант преступник улика подозреваемый отпечаток '
     'генерал'),
    ('coarse or slang', 'задница мужик идиот детка чёртов затыкаться ад секс член дерьмо '
     'сука придурок урод дурак ублюдок сексуальный'),
    ('dubbing\'s rendering of an English form of address, or of an American thing',
     'мэм леди босс сэр шеф окей штат доллар ник колледж генри месье величество вау '
     'эрика джим'),
    ('a hesitation sound, not vocabulary', 'эм хм ох'),
    ('an inflected form Wiktionary also files as an entry, taught on its lemma\'s card',
     'стал начал смог вся минуту секунду милая черта придти постоять рада'),
    ('taught inside a set phrase (добро пожаловать, welcome)', 'жаловать'),
]:
    for _w in _words.split():
        REFUSED.setdefault(_w, _reason)


# WHOLE WORDS: a bare `ass\w*` matched "assistance", "assemble" and "assent", and turned
# away `помощь`, `собираться` and `согласиться` (found at A2, Oct 2026).
COARSE = re.compile(r'\b(fuck\w*|shit\w*|cunts?|dicks?|cocks?|pricks?|arse|arsehole|ass|asshole|'
                    r'bitch\w*|whores?|sluts?|piss\w*|bollocks|wank\w*|screw(ing)?|bang(ing)?|'
                    r'sex(ual)?|genital\w*|vagina|vulva|penis|syphilis|lesbian|homosexual)\b', re.I)


def closed(e):
    """A function word -- or a PREDICATIVE, which Wiktionary files as an `adj`
    with no forms (`можно`, `жарко` "it is hot", `холодно` "one is cold").  A
    predicative and its adverb (`жарко` "hotly") are one spelling and one note,
    the predicative first, since "it is hot" is the sense a beginner says."""
    return e['pos'] in CLOSED or (e['pos'] == 'adj' and not e['forms'])


def senses_ok(e):
    """An entry worth teaching has at least one sense not marked as marginal."""
    return any(not (set(s['t']) & JUNK_TAGS) for s in e['senses'])


def letter_name(e):
    """A letter's name -- or a given name, which Wiktionary may list in lower
    case as an ordinary entry (`генри`, `эрика`, caught at A2)."""
    if any('letter' in g.lower() and ('script' in g.lower() or 'cyrillic' in g.lower()
                                      or 'roman' in g.lower())
           for s in e['senses'] for g in s['g']):
        return True
    return all(re.search(r'\b(male|female|a) given name|\bsurname\b', s['g'][-1].lower())
               for s in e['senses'])


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    by_word = collections.defaultdict(list)
    for i, e in enumerate(lex):
        by_word[fold(e['word'])].append(i)

    # which folded forms each lemma's paradigm holds, for the homograph rule
    form_of = collections.defaultdict(list)
    for i, e in enumerate(lex):
        for w, _t in e['forms']:
            x = fold(w)
            if x != fold(e['word']):
                form_of[x].append(i)

    def shadowed(i):
        """An open-class entry spelt like a function word or a commoner form."""
        e = lex[i]
        w = fold(e['word'])
        if any(closed(lex[j]) for j in by_word[w] if j != i):
            return 'spelt like a function word'
        for j in form_of.get(w, ()):
            if lex[j]['freq'] > 5 * e['freq'] and j != i:
                return f'mostly a form of {lex[j]["word"]}'
        return None

    # ---------------------------------------------------------------- phrases
    tat = collections.Counter()
    sent_toks = []
    for line in open('rus_sentences_detailed.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) < 3:
            continue
        t = [fold(x) for x in tokens(p[2])]
        sent_toks.append(t)
        tat.update(t)
    # the subtitle-to-Tatoeba ratio, taken over the commonest single words both
    # corpora count
    sub = {fold(e['word']): e['own'] for e in lex if e['own']}
    ratios = [sub[w] / c for w, c in tat.most_common(3000) if sub.get(w)]
    SCALE = statistics.median(ratios) if ratios else 1.0
    print(f'  phrase scale: {SCALE:.1f} subtitle hits per Tatoeba hit '
          f'({len(ratios)} words)')

    def phrase_freq(words):
        ws = [fold(x) for x in tokens(words)]
        n, k = 0, len(ws)
        for t in sent_toks:
            for a in range(len(t) - k + 1):
                if t[a:a + k] == ws:
                    n += 1
                    break
        return n * SCALE

    # ---------------------------------------------------------------- units
    used = set()

    def mutual_partner(i):
        e = lex[i]
        if fold(e['word']) in ROUND_TRIP or fold(e['word']) in NO_PAIR:
            return None
        if fold(e['word']) in PAIRS:
            for j in by_word.get(PAIRS[fold(e['word'])], ()):
                if lex[j]['pos'] == 'verb' and j not in used:
                    return j
        for w, asp in e['partners']:
            for j in by_word.get(fold(w), ()):
                if lex[j]['pos'] != 'verb' or j in used:
                    continue
                if fold(lex[j]['word']) in NO_PAIR:
                    continue
                back = {fold(x) for x, _a in lex[j]['partners']}
                if fold(e['word']) in back:
                    return j
        return None

    def aspect(i):
        g = lex[i]['gram'] + lex[i]['htags']
        if 'impf' in g and 'pf' in g or ('imperfective' in g and 'perfective' in g):
            return 'both'
        if 'pf' in g or 'perfective' in g:
            return 'pf'
        return 'impf'

    def unit_of(i, key=None):
        """The note entry i belongs to, as a dict; marks its entries used."""
        e = lex[i]
        if e['pos'] == 'verb':
            j = mutual_partner(i)
            members = [i]
            if j is not None and aspect(i) != 'both' and aspect(j) != 'both':
                members = [i, j] if aspect(i) == 'impf' else [j, i]
            used.update(members)
            return {'entries': members, 'pair': len(members) == 2,
                    'freq': sum(lex[m]['freq'] for m in members), 'key': key}
        if closed(e):
            # every closed-class entry of this spelling, the asked-for one first
            members = [i] + [j for j in by_word[fold(e['word'])]
                             if j != i and closed(lex[j]) and j not in used
                             and senses_ok(lex[j]) and not letter_name(lex[j])]
            # the predicative first only where it is the "it is…" sense a beginner
            # says (`жарко`, it is hot) -- not `очень`'s `не очень`, "not very good"
            if key is None:
                members.sort(key=lambda m: 0 if lex[m]['pos'] == 'adj' and re.match(
                    r"(it is|it's|one is|one can|one must)", lex[m]['senses'][0]['g'][-1]) else 1)
            used.update(members)
            fr = max(lex[m]['freq'] for m in members)
            if ' ' in e['word']:
                fr = phrase_freq(e['word'])
            return {'entries': members, 'pair': False, 'freq': fr, 'key': key}
        used.add(i)
        # a multi-word noun (`день рождения`) has no row in a segmented list
        fr = phrase_freq(e['word']) if ' ' in e['word'] else e['freq']
        return {'entries': [i], 'pair': False, 'freq': fr, 'key': key}

    below = words_below()
    units, missing = [], []
    for sec, word, pos, key in inventory():
        cands = [i for i in by_word.get(fold(word), ())
                 if (pos is None or lex[i]['pos'] == pos)
                 and not letter_name(lex[i])]
        if key:
            cands = [i for i in cands
                     if any(key.lower() in g.lower() for s in lex[i]['senses'] for g in s['g'])]
        if pos is None:
            # an unqualified word means its open-class or principal entry, not
            # the letter's name or an abbreviation spelt the same way
            good = [i for i in cands if senses_ok(lex[i]) and lex[i]['word'] == lex[i]['word'].lower()]
            cands = good or cands
        # ё IS FOLDED TO MATCH, SO PREFER THE SPELLING AS WRITTEN: `небо` (sky)
        # and `нёбо` (palate) fold alike, and the inventory means the one it wrote
        cands.sort(key=lambda i: 0 if bare(lex[i]['word']).lower() == word.lower() else 1)
        if not cands:
            missing.append(f'{sec}: {word}' + (f':{pos}' if pos else '') + (f'#{key}' if key else ''))
            continue
        i = cands[0]
        if i in used or fold(lex[i]['word']) in below:
            continue
        u = unit_of(i, key)
        u['source'], u['sec'] = 'inventory', sec
        units.append(u)
    if missing:
        raise SystemExit('the inventory names entries Wiktionary does not have:\n  '
                         + '\n  '.join(missing))
    n_inv = len(units)
    taken = {fold(lex[m]['word']) for u in units for m in u['entries']}

    refused_seen = []
    REFUSED_F = {fold(x) for x in REFUSED}
    order = sorted(range(len(lex)), key=lambda i: -lex[i]['freq'])
    for i in order:
        if len(units) >= TARGET[LEVEL]:
            break
        e = lex[i]
        w = e['word']
        if i in used or fold(w) in below or w != w.lower() or ' ' in w:
            continue
        if not senses_ok(e) or letter_name(e) or len(w) < 2 and e['pos'] in OPEN:
            continue
        if e['pos'] in OPEN and not closed(e) and shadowed(i):
            continue
        if e['pos'] in ('proverb', 'phrase'):
            continue
        # a word whose FIRST sense is coarse (`шлюха`, untagged in Wiktionary) --
        # the same pattern build_deck.py filters glosses with
        if COARSE.search(e['senses'][0]['g'][-1]):
            refused_seen.append(w)
            continue
        # an `adj` entry glossed as a verb (`звучать` "to sound right") is a
        # mis-filed sense, and the verb is its own entry
        if e['pos'] == 'adj' and e['senses'][0]['g'][-1].startswith('to '):
            continue
        # ONE NOTE PER SPELLING ACROSS THE DECK: `пора` the noun and `пора` "it is
        # time" both rank, and two notes with one front is two schedules for a
        # question the reader cannot tell apart.
        if fold(w) in taken:
            continue
        # A FUNCTION-WORD ENTRY THAT IS AN INFLECTED FORM OF ANOTHER LEMMA IS NOT
        # A NOTE.  Wiktionary gives `было`, `знаешь`, `давай`, `себе`, `того`,
        # `всего`, `лучше` entries of their own (as particles, interjections,
        # adverbs), and each ranks on the count of the form; but each is taught on
        # its lemma's card -- in the table and in the examples -- and a note of
        # its own would teach the same thing twice.  The inventory can still name
        # one (`это`, which a learner needs as itself on the first day).
        if closed(e) and any(lex[j]['pos'] in OPEN | {'pron', 'det', 'num'}
                                      for j in form_of.get(fold(w), ())):
            continue
        # one entry per spelling and part of speech: the first, which is
        # Wiktionary's principal etymology (`есть` "to eat" before `есть` "there is")
        if any(j < i and lex[j]['pos'] == e['pos'] and j not in used
               for j in by_word[fold(w)]):
            continue
        if fold(w) in REFUSED_F:
            refused_seen.append(w)
            used.add(i)
            continue
        u = unit_of(i)
        if any(fold(lex[m]['word']) in below for m in u['entries']):
            continue
        # a refused verb can arrive as the SECOND member of a pair (`затыкаться /
        # заткнуться` reaches the list through `заткнуться`)
        bad = [lex[m]['word'] for m in u['entries'] if fold(lex[m]['word']) in REFUSED_F]
        if bad:
            refused_seen.extend(bad)
            continue
        u['source'], u['sec'] = 'frequency', ''
        units.append(u)
        taken.update(fold(lex[m]['word']) for m in u['entries'])

    units.sort(key=lambda u: -u['freq'])
    for u in units:
        u['words'] = [lex[m]['word'] for m in u['entries']]
    json.dump(units, open(lvlf('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    pairs = sum(u['pair'] for u in units)
    print(f'  {len(units)} notes: {n_inv} from the inventory, {len(units) - n_inv} by '
          f'frequency; {pairs} aspect pairs')
    print('  pairs: ' + ', '.join(' / '.join(u['words']) for u in units if u['pair']))
    print(f'  refused on the way: {", ".join(refused_seen)}')
    print('  by frequency: ' + ', '.join(' / '.join(u['words']) for u in units
                                          if u['source'] == 'frequency'))


if __name__ == '__main__':
    main()
