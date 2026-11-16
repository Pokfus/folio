#!/usr/bin/env python3
"""Stage 2 for the phrases deck: Navajo greetings, everyday phrases, exclamations, set
expressions, and short sentences.

    python3 .claude/navajo/run.py --level phr     # runs this in place of select.py

Not a CEFR level: an expression is a unit a word list cannot see.  The owner's plan
(`docs/navajo-decks-plan.md`, 2026-11-16) put it after the levels.

FIVE SUBDECKS.  The first four are English Wiktionary's own Navajo entries (its `phrase` and
`intj` headwords), so each card carries Wiktionary's meaning and, where it gives one, its IPA:
greetings and wishes, everyday phrases, exclamations, and set expressions (the many `tʼáá …`
and `tʼáadoo …` phrases, "anywhere", "without exception", "just for fun").  The fifth is short
sentences from Tatoeba (CC BY 2.0 FR), each with its own English translation, chosen from its
66 Navajo sentences: one per meaning, no sentence built round a foreign name or place, and
none whose apostrophes cannot be read as glottal stops (`ahé’hee’`, an apostrophe misplaced).  NO PROVERBS: English Wiktionary has no Navajo proverb entry and
Tatoeba none either, and one written from memory would have no source.

A Wiktionary row is written as it is SHOWN (`Haash yinílyé?`); its key is the headword. A
Tatoeba sentence is shown as Tatoeba's contributor wrote it, with one change: the glottal stop
is written ʼ, as everywhere else in the collection, where the contributor typed ' or ’.

NOTHING A LEVEL DECK TEACHES IS REPEATED (`navajo_level.words_below`; BELOW['phr'] is every band).
THE ORDER is this list's: within a subdeck, the commonest and most useful come first.
"""
import csv, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nv import norm, nfc
from navajo_level import f, words_below

SUBS = [
    ('Greetings and wishes', [
        'Yáʼátʼééh abíní.', 'Yáʼátʼééh iʼííʼą́.', 'Haa nítʼé?', 'Haʼátʼíísh baa naniná?',
        'Ąąʼ haʼíí baa naniná?', 'Haalá áńtʼé?',
        'Haash yinílyé?', 'Daash yinílyé?', 'Nizhónígo ałhééhosiilzįįd.', 'Ahéheeʼ nitsaago.',
        'Tʼáá íiyisíí ahéheeʼ.', 'Hágoshį́į́.', 'Goshį́į́.', 'Baa hózhǫ́ǫgo niʼdizhchį́.',
        'Yáʼátʼééh Késhmish.', 'Nizhónígo Késhmish Daʼdoohłeeł.', 'Nizhónígo Nináánááhai Dooleeł.',
        'Baa Hózhǫ́ǫgo Nee Nínáádoohah.', 'Háá nilyį́į́h.',
    ]),
    ('Everyday phrases', [
        'Diné bizaadísh dinitsʼaʼ?', 'Bilagáana bizaadísh dinitsʼaʼ?',
        'Diné bizaad doo shił bééhózin da.', 'Bilagáana bizaad doo shił bééhózin da.',
        'Dinékʼehjí doo diistsʼaʼ da.', 'Doo shił bééhózin da.', 'Naabeehó nishłį́.',
        'Haa dóoneʼé lá nílį́?', 'Ąąʼ háádę́ę́ʼ?', 'Háádę́ę́ʼísh íiyisíí naniná?', 'Díkwíí ninááhai kʼad?', 'Naadiin shinááhai.',
        'Áłchínísh nihee dahólǫ́?', 'Díkwíígóó oolkił?', 'Díkwíígóó oolkiłgo?', 'Haʼátʼíí átʼé?',
        'Shá yínízhí.', 'Dichin nisin.', 'Dibááʼ nisin.', 'Chʼééh déyá.', 'Shitah honeezgai.',
        'Dikos shidoolnaʼ.', 'Doo shił yáʼátʼéeh da.', 'Ayóóʼánóshʼní.', 'Shídóʼ.',
        'Naanish hanishtá.', 'ʼÁásh ńtsʼííd?', 'ʼÁh nístsʼííd.', 'ʼÁh tsʼííd.', 'Doo ákótʼée da.',
        'Doo yáʼátʼéeh da.', 'Tʼáásh aaníí?', 'Jó tʼáá aaníí.', 'Háiishąʼ dóʼ?',
        'Doo kóneʼ naʼadáa da.', 'Ahidiitʼash shį́į́?',
    ]),
    ('Exclamations', [
        'Yáadilá!', 'Yáadilá óolyé!', 'Yáah!', 'Yááh?', 'Wah!', 'Ih!', 'Sxih!', 'Héí!', 'Wóóh!',
        'Yáʼátʼóo!', 'Hóla.', 'Kʼadí!', 'Lą́ʼąąʼ.', 'Wehee.', 'Haoh.', 'Nda.', 'Nda yeeʼ!', 'Shoo.',
        'Geʼ shoo!', 'Áníłʼį́ shoo!', 'Hąh!', 'Sołtįʼ!', 'Tʼóó ádíshní.', 'Tʼáá shį́į́ áko.',
        'Tʼáá ákótʼée doo.',
    ]),
    ('Set expressions', [
        'tʼáá bíyó', 'tʼáá hayóí', 'tʼóó ahayóídi', 'tʼóó náhodiʼnahgo', 'tʼáá haaʼí da',
        'tʼáá bíhólnííh', 'tʼáá bíhólníihgóó', 'tʼáá hoolzhishgi', 'tʼáá gééd', 'tʼáá hazhóʼó',
        'tʼáá hináago', 'tʼáá bízhání', 'tʼáá bíjíkʼehgo', 'tʼáá káágóó', 'tʼáá shǫǫ', 'tʼáá tsʼííd',
        'tʼáá ákónéehee', 'tʼáá ákónéehee bá átʼé', 'tʼáá bééhózínígo átʼé', 'tʼáadoo átʼéhégóó',
        'tʼáadoo łaʼ doodahí', 'tʼáadoo nízaad nihoolzhishí', 'tʼáá bizááká', 'tʼóó bílaʼ dijool',
        'tʼóó laʼ', 'tʼáá hó ájítʼéégóó', 'chin bąąh',
    ]),
]

# Tatoeba sentences, as their contributors wrote them (the glottal stop normalised to ʼ on the card).
SENTENCES = [
    'Ahéheeʼ shimá.', 'Yáʼátʼééh shimá.', 'Hágoóneeʼ shimá.', "Yá’át’ééh, shik’is!",
    "Hágoónee', shik’is.", "Haash yit’éego naniná?",
    "Haash yit’éego naniná dííjí?", '"Haʼátʼíísh baa naniná?" "Shił hózhǫ, ahéhee\'."', 'Kii wolyé.', "Nizhónígo Nee Ado’ááł!",
    'Ayóó anííníshní nitsaago!', "Shá háchį'.", 'Chʼééh dishááh.', 'Abeʼ yistiní nisin.',
    'Béeso doo shee hólǫ́ da.', 'Mósí naaki shee hólǫ́.', 'Díí naaltsoos éí ni.', 'Tsé ndaaz.',
    'Chidí łitso.', 'Tsídii daalchííʼ.', 'Hai yíghááh.', 'Nahółtą́ą́ʼ lágo!', 'Nahółtą́ą́ʼ laanaa!',
    'Yiską́ą́go áadi diikah.', 'Mósí shaa níłteeh!', 'Chidí binaashnish.',
    "Bilagáana bizaad yíhooł'aah.", "Ha'át'íísh yíhooł'aah?", "Shí dóó ni ayóo ałk’is niidlį́.",
    'Doo óltaʼgóó dideeshááł da nisin.', 'Ahbínígo tłʼóóʼgóó chʼínáshdááh.',
    'Nínádiishʼnahgo gohwééh náshdlį́į́h.', 'Daʼ díísh Tségháhoodzánígóó atiin?',
    "Dííjį́ awéé’ azee’al’į́į́góó yideestį́.", "Łééchąą yázhí shimasaní baghandi níłtį́.",
    "Ashkii yázhí tł’iish hooghan góne’ yah ayíílá.",
    "Tł’óół tsits’aa’ biih yílá.", 'Biiʼndaʼaʼnéhégóó deetʼáázh.',
]

APOS = re.compile(r"['’‘ʻ]")


def plain(s):
    """The expression as a key: no punctuation at the ends, the glottal stop unified, lower case."""
    return norm(re.sub(r'^[\s"¡¿]+|[\s.!?,"]+$', '', s))


def tatoeba():
    nav, links, eng = {}, {}, {}
    for row in csv.reader(open('nav_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            nav[row[0]] = nfc(row[2])
    for row in csv.reader(open('nav-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in nav:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    csv.field_size_limit(10 ** 8)
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    out = {}
    for nid in sorted(links, key=int):
        en = sorted((eng[e] for e in links[nid] if e in eng), key=lambda s: (len(s), s))
        if en and nav[nid] not in out:
            out[nav[nid]] = en[0]
    return out


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))['lemmas']
    below = words_below()
    rows, seen, missing = [], set(), []
    for sub, items in SUBS:
        for shown in items:
            k = plain(shown)
            if k in below or k in seen:
                continue
            if k not in lex:
                missing.append(shown)
                continue
            seen.add(k)
            rows.append({'key': k, 'word': lex[k]['word'], 'freq': 0, 'score': 0, 'pos': '',
                         'source': 'wiktionary', 'topic': '', 'sub': sub, 'show': shown})
    tat = tatoeba()
    for s in SENTENCES:
        if s not in tat:
            missing.append(s)
            continue
        show = APOS.sub('ʼ', s)
        rows.append({'key': 'tatoeba:' + plain(s), 'word': plain(show), 'freq': 0, 'score': 0,
                     'pos': '', 'source': 'tatoeba', 'topic': '', 'sub': 'Sentences',
                     'show': show, 'en': tat[s]})
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} expressions: ' + ', '.join(
        f"{sum(1 for r in rows if r['sub'] == s)} {s.lower()}" for s, _ in SUBS + [('Sentences', 0)]))
    if missing:
        raise SystemExit('NOT FOUND (fix the list): ' + ' | '.join(missing))


if __name__ == '__main__':
    main()
