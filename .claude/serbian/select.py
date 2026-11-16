#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`serbian_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, dialectal, Croatian or Bosnian
    only, Ijekavian ...);
  · a form of a personal pronoun (`me`, `ga`, `njega`, `tobom`): Wiktionary
    gives many their own entries, and the pronoun's card already shows them;
  · a one-letter lemma that is not a word (`u`, `s`, `i`, `a`, `o` are);
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sr import fold, pronoun_forms, PRONOUN_CASES
from serbian_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-16).  Each with its reason.
EXCLUDE = {
    'je': "the third-person present of biti ('is'), on biti's card",
    'si': "the second-person present of biti, on biti's card",
    'jeste': "the emphatic third-person present of biti, on biti's card",
    'bilo': "the neuter past participle of biti ('was'), on biti's card",
    'sam': "counted mostly as biti's 'I am'; the adjective 'alone' is a minor share",
    'deca': "the plural of dete, on dete's card",
    'ljudi': "the plural of čovek, on čovek's card",
    'svi': "the plural of sav, on sav's card",
    'one': "the feminine plural of on, on the pronoun cards",
    'puta': "the genitive of put ('times'), on put's card",
    'god': "the particle of kad god, ko god ('-ever'), counted from those phrases",
    'nem': "'mute', whose count is nema 'there is no'",
    'tko': "the Croatian 'who'; Serbian says ko, on A1",
    'kući': "'home(wards)', the dative of kuća, on kuća's card",
    'mnom': "the instrumental of ja, on ja's card",
    'te': "counted as the clitic of ti ('you'), on ti's card; the conjunction is a minor share",
    'red': "'order, row', counted from u redu 'all right'",
    's': "the short form of sa 'with', on A1",
    'sad': "the short form of sada 'now', on A1",
    'koga': "the genitive and accusative of ko, on ko's card",
    'čemu': "the dative of šta, on šta's card",
    'nikada': "the long form of nikad, on A1",
    'treba': "'girl, chick', whose count is treba 'it is needed', the third person of trebati (on A1)",
    'kada': "'bathtub', whose count is kada 'when', the long form of kad (on A1)",
    'drago': "the neuter of drag, counted from drago mi je 'I'm glad', on drag's card",
    # Read off the A2 ranking (2026-11-16).
    'sama': "the feminine of sam, counted from sama 'alone'",
    'čega': "the genitive of šta, on šta's card",
    'kome': "the dative of ko, on ko's card",
    'nitko': "the Croatian 'nobody'; Serbian says niko, on A1",
    'ured': "the Croatian 'office'; Serbian says kancelarija, which the fill takes",
    'bok': "'side', whose count is the Croatian greeting bok 'hi'",
    'no': "a dated 'than', whose count is no 'but' (Croatian) and English 'no'",
    'ran': "'early', whose count is rana 'wound' (A2) and rano 'early' (A2)",
    'vod': "'conduit', whose own forms count little: the rest are voda's (A1)",
    'kos': "'slanting', whose count is kosa 'hair' (A2)",
    'kim': "'caraway', whose count is the name Kim",
    'vesti': "'to embroider', whose count is vesti 'news', the plural of vest",
    'bit': "'essence', whose count is bit, the short infinitive of biti in bit će",
    'ded': "a variant of deda 'grandfather', on A1",
    'prav': "'straight', whose count is pravo (A1) and prava 'rights'",
    'cura': "a Croatian and Bosnian colloquial 'girl'; Serbian says devojka, on A1",
    # Read off the B1 ranking (2026-11-16).
    'toj': "a Torlakian dialect 'he', whose count is toj, the dative of ta (taj, on A1)",
    'kog': "the genitive of ko, on ko's card",
    'čime': "the instrumental of šta, on šta's card",
    'kuca': "'doggy', whose count is kuca 'knocks', the third person of kucati",
    'bob': "'broad bean', whose count is the name Bob",
    'pol': "'pole', whose count is the name Paul and pola 'half' (A1)",
    'celiti': "'to heal', whose count is cela, celo, the forms of ceo 'whole' (A1)",
    'videlo': "'daylight', whose count is videlo, the neuter past of videti (A1)",
    'go': "'naked', whose count is English 'go' in the subtitles",
    'kom': "'skin', whose count is kom, the short form of kome 'to whom'",
    'los': "'moose', whose count is the Los of Los Angeles",
    'skot': "'litter', whose count is the name Scott",
    'goriv': "'combustible', whose count is gori 'burns', a form of goreti",
    'zena': "'pupil of the eye', whose count is žena 'woman' (A1) typed without its caron",
    'bas': "'bass', whose count is baš (A1) typed without its caron",
    'top': "'cannon', whose count is English 'top' in the subtitles",
    'gđa': "an abbreviation of gospođa, on A1",
    'zrak': "the Croatian 'air'; Serbian says vazduh",
    'kava': "the Croatian 'coffee'; Serbian says kafa, on A1",
    'doma': "the Croatian 'at home'; Serbian says kod kuće",
    'vani': "the Croatian 'outside'; Serbian says napolju, which the fill takes",
    'kamo': "the Croatian 'where to'; Serbian says kuda, on A1",
    'ponovno': "the Croatian form of ponovo, on A1",
    'shvaćati': "the Croatian form of shvatati, on A2",
    'viti': "'to twist', whose own spelling counts 107 of its 9,456: the rest are forms it shares",
    'crnac': "a word for a Black person that is now widely felt as offensive",
    # Read off the B2 ranking (2026-11-16).
    'odel': "'department', whose own spelling counts 131 of its 9,044: the rest is odelo 'suit' (A2)",
    'hiljadu': 'the accusative of hiljada, on A1',
    'gđica': 'an abbreviation of gospođica, on B1',
    'buk': "'rapids', whose own spelling counts 104 of its 8,968: the rest is buka 'noise'",
    'liz': "'a lick', whose count is the name Liz",
    'kris': "'kris (a dagger)', whose count is the name Chris",
    'han': "'inn', whose count is the name Han",
    'rosa': "'dew', whose count is the name Rosa",
    'lisa': "'blaze (on a horse)', whose count is the name Lisa",
    'indij': "'indium', whose count is Indija 'India'",
    'vijesti': "the Ijekavian 'news'; Serbian says vesti (novost on this level)",
    'cesta': "the Croatian 'road'; Serbian says put, on A1",
    'mobitel': "the Croatian 'mobile phone'",
    'lečnik': "a rare 'physician'; Serbian says lekar, on A1",
    'tat': "'thief', whose own spelling counts 237 of its 6,390: the rest is tata 'dad' (A1)",
    'klas': "'ear (of grain)', whose count is English 'class' and klasa",
    'mudo': "a crude word for 'testicle'",
    'veriti': "'to betroth', whose count is veri, the dative of vera 'faith' (B1)",
    'tkati': "'to weave', whose own spelling counts 28 of its 7,731",
    'kinuti': "'to sneeze', whose own spelling counts 27 of its 6,177",
    'meden': "'honeyed', whose own spelling counts 109 of its 6,337",
    'dina': "'dune', whose count is the name Dina",
    'rika': "'roar', whose count is the name Rika",
    'nevjerojatno': "the Croatian (and Ijekavian) 'incredibly'",
    'pozornik': 'a Croatian military rank',
    'itko': "the Croatian 'anybody'; Serbian says iko, on B1",
    'brus': "'whetstone', whose count is the name Bruce",
    'ar': "'are (a unit of area)', counted from other words",
    'alfa': 'the Greek letter alpha',
    'beta': 'the Greek letter beta',
    'norman': 'a Norman, whose count is the name Norman',
    'ren': "'horseradish', whose count is the name Ren",
    'but': "'thigh', whose count is English 'but' in the subtitles",
    'kila': "'hernia', whose count is kila, colloquial for kilo",
    'dušica': "'wick', whose count is dušo 'darling', the vocative of duša (A1)",
    'tur': "'aurochs', whose count is tura 'round'",
    'ada': "'river island', whose count is the name Ada",
    'santa': "'iceberg', whose count is Santa (Claus)",
    'tara': "'tare', whose count is the name Tara",
    'kal': "'mud', whose count is the name Cal",
    'stroj': "the Croatian 'machine'; Serbian says mašina, on B1",
    'ovisiti': "the Croatian 'to depend'; Serbian says zavisiti, on B1",
    'riskirati': 'the Croatian form; Serbian says rizikovati',
    'pogreška': "the Croatian 'mistake'; Serbian says greška, on A2",
    'kolovoz': "'carriageway', whose count is the Croatian kolovoz 'August'",
    'juli': "a variant of jul 'July', on A1",
    'uzet': "'paralytic', whose count is uzet, the passive participle of uzeti (A1)",
    'sena': "a variant of senka 'shadow', which this level's fill takes",
    'minuti': "'to pass by', whose count is minuti 'minutes', the plural of minut (A1)",
}

SWEARS = {'sranje', 'jebati', 'kurac', 'pička', 'govno', 'kurva', 'pizda', 'drkati', 'jebeni',
          'kučka', 'peder', 'seronja', 'debil', 'idiot', 'kreten', 'budala', 'glupan', 'dupe',
          'guzica', 'šupak', 'sisa', 'kurvin'}

ONE_LETTER = {'u', 's', 'i', 'a', 'o', 'k'}


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    pron = set()
    for p in PRONOUN_CASES:
        pron |= {fold(x) for x in pronoun_forms(p)} - {p}
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
                via = L['alt_of']
                for _ in range(3):         # `ćerka` -> `kćerka` -> `kći`
                    if 'alt_of' not in lex.get(via, {}):
                        break
                    via = lex[via]['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if L and L.get('aspect_of') and LEVEL == 'a1':
                L = None              # (A1 was built before the aspect partners: see extract.py)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])) \
                    or not usable(L):
                missing.append(item)
                continue
            seen.add(k)
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        # THE ASPECT PARTNERS (`bacati`, `vraćati`) joined at A2, so A1 rebuilds as it shipped
        if L.get('aspect_of') and LEVEL == 'a1':
            continue
        if k in seen or k in below or k in swears or k in excl or k in pron:
            continue
        if len(k) < 2 and k not in ONE_LETTER:
            continue
        if ' ' in k or '-' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY, OR NOT SERBIAN THERE (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
