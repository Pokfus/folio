#!/usr/bin/env python3
"""Write the Yoruba phrases deck: `decks/Yoruba-Phrases-and-Expressions.folio-deck.json`.

    python3 .claude/yoruba/phrases.py      (reads .claude/yoruba-cache/: kaikki-yo.jsonl and Tatoeba)

Asked for on 2026-11-16, in place of a B2 ("Add B2": after B1, English Wiktionary had about
280 counted Yoruba words left, so the owner chose this deck instead -- the Hausa precedent).
Not a CEFR level.  Five subdecks (the card's `sub`), each in the hand order of its list:

  Greetings and wishes   the greetings of the time of day and of what someone is doing
                         (káàárọ̀, kúuṣẹ́ ...), thanks, wishes and blessings
  Everyday phrases       short phrases and exclamations (ebi ń pa mí, tóò, yéè ...)
  Idioms and similes     Wiktionary's idiomatic entries and its "as ... as" similes
                         (dùn bí oyin "as sweet as honey")
  Proverbs               all of Wiktionary's Yoruba proverbs but one variant
  Sentences              Tatoeba's Yoruba sentences with an English translation, at most
                         NINE words, printed as Tatoeba has them, shortest first

THE ENGLISH IS WIKTIONARY'S, never Folio's (the collection's rule): its senses, and where it
gives the LITERAL reading of a proverb or an idiom (`qualifier: literal`), that reading under
the label "literally".  Its usage examples go under "In a sentence", the phrase in bold.

WHAT IS LEFT OUT, each with its reason (`LEFT_OUT`, `DROP`): an entry a level deck teaches; a
dialect's entry (Ekiti, Ìjẹ̀bú) or a spelling variant of a taught one; a society's ritual
formula (Ifá, Ògbóni); an offensive or derogatory entry; an "idiomatic" entry that is only a
compound noun (ìmọ̀ ìjìnlẹ̀ "science"); and a Tatoeba sentence written without its tone marks or
misspelt, one that repeats a phrase above, or one whose English another sentence has.

No corpus is counted, so a re-run is byte-identical whenever the cached sources are.

SOURCES: English Wiktionary via kaikki.org (CC BY-SA 4.0); Tatoeba (CC BY 2.0 FR), each
sentence's number on its card so it can be traced to its author.
"""
import html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'yoruba-cache')
DECKS = os.path.join(HERE, '..', '..', 'decks')
sys.path.insert(0, HERE)
os.environ.setdefault('YORUBA_LEVEL', 'a1')            # examples / build_deck read a level at import
from yo import nfc, tokens
import build_deck as B
from examples import wikt_html
from extract import headword, is_formof

E = lambda s: html.escape(s, quote=False)
OUT = 'Yoruba-Phrases-and-Expressions.folio-deck.json'
DECK = 'yophrase'
MAX_WORDS = 9

LISTS = [
    ('Greetings and wishes', [
        'káàárọ̀', 'kúùyálẹ̀ta', 'káàsán', 'kúùrọ̀lẹ́', 'káalẹ́', 'báwo ni', 'a dúpẹ́', 'kò tọ́pẹ́',
        'a ò kí ń dúpẹ́ ará ẹni', 'kúulé', 'kúuṣẹ́', 'káre', 'kúùjókòó', 'kúùkàlẹ̀', 'kú ọjọ́ mẹ́ta',
        'ó dìgbòóṣe', 'kára ó le', 'kú ọdún tuntun', 'kú ọdún Kérésìmesì', 'kú ewu ọmọ',
        'kúùkúnra', 'kúùdárò', 'kúùrọ́jú', 'báríkà', 'àmí', 'Kábíyèsí']),
    ('Everyday phrases', [
        'ebi ń pa mí', 'òǹgbẹ ń gbẹ mí', 'òjò ń rọ̀', 'nílé', 'lọ́jọ́ iwájú', 'ẹn', 'ẹ̀n', 'tóò', 'àgò',
        'abájọ', 'àkíìkà', 'àgbẹdọ̀', 'má làágùn jìnnà', 'jèbùrẹ́ awo olùgbẹ́bẹ̀', 'yéè', 'hà',
        'músò', 'sáàfúlà', 'ẹ̀rín kèékèé', 'wàláhì', 'kóò', 'ṣírí pàkè']),
    ('Idioms and similes', [
        'ọwọ́ àlàáfíà', 'fọ́ létí', 'gbéra ga', 'gbaná jẹ', 'kógbá wọlé', 'bá ẹsẹ̀ sọ̀rọ̀', 'júbà ehoro',
        'forí jálé agbọ́n', 'forí gbálẹ̀', 'jẹ àgbọ̀nrín èṣí lọ́bẹ̀', 'ejò lọ́wọ́ nínú',
        'àgbàrá ya ṣọ́ọ̀bù', 'mẹ́wàá ń ṣẹlẹ̀', 'filẹ̀ ṣaṣọ bora', 'jáde layé',
        'dùn bí oyin', 'korò bí ewúro', 'ga bí ọ̀pẹ', 'ga bí òmìrán', 'kúrú bí kùkùté',
        'pọ̀ bí iyanrìn', 'rẹwà bí egbin', 'dúdú bí kóró iṣin', 'le koko bí ojú ẹja',
        'pirọrọ bí ẹja òjíjí', 'bìjàwàrà bí ẹkùn', 'jó bí òkòtó', 'lówó bí ṣẹ̀kẹ̀rẹ̀', 'lù bí aṣọ òfì']),
    ('Proverbs', [
        'ọ̀nà kan ò wọjà', 'bí agbada ò bá gbóná, àgbàdo ò lè ta', 'ọbẹ̀ tó dùn, owó ló pa á',
        'àìsí-ńlé ẹkùn, ajá ń gbó', 'ajá kì í rorò kó ṣọ́ ojúlé méjì', 'ká rìn ká pọ̀, yíyẹ ní ń yẹni',
        'ààrò kì í gbóná kalẹ́', 'àjò kì í dùn kónílé má relé', 'bí ewé bá pẹ́ lára ọṣẹ, á dọṣẹ',
        'bí iná bá jó lóko, màjàlà á fò wá sílé', 'omi tuntun ti rú, ẹja tuntun ti wọ̀ ọ́',
        'èpè la fi ń wo èpè sàn', 'ìṣe ènìyàn nìṣe ẹranko', 'ṣágo ń búgò', 'dì ẹ́ǹdì lòpin sinimá',
        'ọsán já, ọrun dọ̀pá']),
]

# Wiktionary's phrase, interjection, proverb and idiom entries NOT taught here, with the reason.
LEFT_OUT = {
    'ẹ ṣé': 'a spelling of ẹ ṣeun "thank you", taught at A1',
    'o ṣeun': 'a spelling of o ṣé "thank you", taught at A1',
    'òdío': 'a second "hail the king"; Kábíyèsí is the everyday one',
    'sáákì': 'a hail for a monarch, as Kábíyèsí is',
    'lógun ọfẹ': 'a hail for a warlord, from the oríkì',
    'okun': 'a regional greeting; the standard language greets by the time of day',
    'ẹ̀wẹ̀ so': 'an Ìjẹ̀bú greeting',
    'àbọrú àbọyè àbọṣíṣẹ': 'a ritual greeting of Ifá initiates',
    'ogbó atọ́ àsúre ìwòrìwòfún': 'a ritual greeting of Ifá initiates',
    'eríwo yàà': 'a slogan of the Ògbóni society',
    'éèpà': 'an utterance of Ògbóni priests',
    'bí iná bá jó lóko, màjàlà á ṣòfófó': 'a variant of the proverb with "fò wá sílé", kept',
    'dọ̀tí bí ẹlẹ́dẹ̀': 'offensive, as Wiktionary files it',
    'ẹdun arinlẹ̀': 'derogatory, as Wiktionary files it',
    'ẹ̀rín kk': 'an abbreviation of ẹ̀rín kèékèé, kept',
    'kásàn-án': 'a rare spelling of káàsán, kept',
    # compound nouns Wiktionary tags "idiomatic", not expressions
    'ìmọ̀ ìjìnlẹ̀': 'a compound noun ("science"), not an expression',
    'afárá oyin': 'a compound noun ("honeycomb"), not an expression',
    'ọba òpójẹ̀': 'a compound noun ("coronary artery"), not an expression',
    'olóògùn ebi': 'a compound noun ("farmer"), not an expression',
    'ẹni tí ọkàn mi yàn': 'a compound noun ("sweetheart"), not an expression',
    'ẹlẹ́yinjú àánú': 'a compound noun ("benefactor"), not an expression',
    'fi hàn': 'a verb ("to show"), not an expression',
}

# Tatoeba sentences left out, by Yoruba sentence number, each with its reason.
DROP = {
    '3179086': 'written without its tone marks (Agogo mejila ọsan)',
    '3348007': 'written without its tone marks; báwo ni is in Greetings',
    '3808207': 'written without its tone marks (Mo nifẹẹ rẹ)',
    '4266589': 'written without its tone marks and misspelt (agbar, gbògbó ayè)',
    '10739589': 'written without its tone marks (Tom ko fó nkan kan)',
    '10726770': 'wahála written without its tone marks',
    '3197736': 'titun written without its tone marks',
    '4641859': 'written without its tone marks (Gidi gan)',
    '10739593': 'Kaabo written without its tone marks',
    '3633484': 'ilé-ẹ́kọ́ mis-marked (ẹ̀kọ́)',
    '4536797': 'only bẹ́ẹ̀ni "yes", taught at A1',
    '10963871': 'only ẹ ṣé "thanks"; ẹ ṣeun is taught at A1',
    '10963734': 'káàárọ̀ "good morning" is in Greetings (and here spelt with a caron, káǎrọ̀)',
    '10963735': 'káàárọ̀ "good morning" is in Greetings (and here spelt with a caron, káǎrọ̀)',
    '11207164': 'Ẹ káàárọ̀ "good morning": káàárọ̀ is in Greetings',
    '4535812': 'its English is 10963865\'s (My name is Jack), kept',
    '14106759': 'its English is 14106751\'s (What time does the store close?), kept',
    '4536795': 'àna "in-law" for àná "yesterday"',
    '11864625': 'ìbéèré mis-marked (ìbéèrè)',
    '3714005': 'arákunrin without its low tone (arákùnrin)',
    '3143489': 'Onísègùn for oníṣègùn, taught at A2',
    '3143491': 'Onísègùn for oníṣègùn, taught at A2',
    '3143493': 'Onísègùn for oníṣègùn, taught at A2',
    '3143498': 'Onísègùn for oníṣègùn, taught at A2',
    '3143500': 'Onísègùn for oníṣègùn, taught at A2',
    '3143503': 'Onísègùn for oníṣègùn, taught at A2',
}


def entries():
    """head (lower case) -> Wiktionary's entries for that spelling, in file order."""
    out = {}
    for line in open(os.path.join(CACHE, 'kaikki-yo.jsonl'), encoding='utf-8'):
        e = json.loads(line)
        h = headword(e)
        out.setdefault(h.lower(), []).append(e)
    return out


def english(ents):
    """Wiktionary's senses, a part of speech at a time; a literal reading under "literally"."""
    parts, seen = [], set()
    for e in ents:
        gl, lit = [], []
        for s in e.get('senses') or []:
            if is_formof(s) or not s.get('glosses'):
                continue
            g = B.tidy(s['glosses'][-1].strip().rstrip('.'))
            if g.lower().startswith('ajami spelling of'):     # the same word in Arabic script
                continue
            g = re.sub(r'; (To|An|A|The) ', lambda m: '; ' + m.group(1).lower() + ' ', g)
            raw = ' '.join(s.get('raw_glosses') or [])
            literal = s.get('qualifier') == 'literal' or raw.startswith('(literal')
            if g and g.lower() not in seen:
                seen.add(g.lower())
                (lit if literal else gl).append(B.lower_first(g))
        if not gl and not lit:
            continue
        label = {'intj': 'interjection', 'prep_phrase': 'adverbial phrase'}.get(e['pos'], e['pos'])
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl[:3]) + '</ol>') if gl else ''
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
        for x in lit[:1]:
            parts.append(f'<div class="uc-sense"><div class="uc-pos">literally</div>'
                         f'<div class="uc-gl">{E(x)}</div></div>')
    return ''.join(parts)


def examples(ents):
    got = []
    for e in ents:
        for s in e.get('senses') or []:
            for x in s.get('examples') or []:
                en = (x.get('english') or x.get('translation') or '').strip()
                if x.get('text') and en and x.get('type') != 'quotation' and len(got) < 3:
                    got.append(f'<div class="uc-exi"><div class="uc-exz">'
                               f'{wikt_html(x["text"], x.get("bold_text_offsets") or [])}</div>'
                               f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(got)


def taught():
    out = set()
    for lvl in ('A1', 'A2', 'B1'):
        p = os.path.join(DECKS, f'Yoruba-{lvl}.folio-deck.json')
        out |= {c['fields']['Word'].lower() for c in json.load(open(p, encoding='utf-8'))['cards']}
    return out


def tatoeba():
    os.chdir(CACHE)
    from examples import load
    return load()


def main():
    ents = entries()
    levels = taught()
    cards, missing = [], []
    for sub, heads in LISTS:
        for h in heads:
            es = ents.get(nfc(h).lower())
            if not es:
                missing.append(h)
                continue
            assert h.lower() not in levels, f'{h} is taught by a level deck'
            assert h not in LEFT_OUT
            word = headword(es[0])
            cards.append({'sub': sub, 'fields': {
                'Yoruba': E(word), 'Word': word, 'English': english(es), 'Forms': '',
                'Examples': examples(es)}})
    if missing:
        raise SystemExit('not in Wiktionary: ' + ', '.join(missing))
    shown = {c['fields']['Word'].lower() for c in cards}
    sents = []
    for pid, yo, en in tatoeba():
        if str(pid) in DROP or len(tokens(yo)) > MAX_WORDS:
            continue
        if yo.lower().rstrip('.!?') in shown | levels:
            raise SystemExit(f'Tatoeba #{pid} repeats a word or phrase: name it in DROP')
        sents.append((len(yo), pid, yo, en))
    ens = set()
    for _, pid, yo, en in sorted(sents):
        assert en not in ens, f'Tatoeba #{pid}: its English is another sentence\'s; name it in DROP'
        ens.add(en)
        cards.append({'sub': 'Sentences', 'fields': {
            'Yoruba': E(yo), 'Word': yo,
            'English': (f'<div class="uc-sense"><div class="uc-pos">sentence · Tatoeba #{pid}</div>'
                        f'<div class="uc-gl">{E(en)}</div></div>'),
            'Forms': '', 'Examples': ''}})
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = B.TYPE_ID
    n = len(cards)
    count = {s: sum(1 for c in cards if c['sub'] == s) for s, _ in LISTS + [('Sentences', 0)]}
    ex_any = sum(1 for c in cards if c['fields']['Examples'])
    desc = (
        "Both study directions in one deck: Yoruba → English and English → Yoruba, each a card of "
        f"its own with its own schedule. {n} phrases and sentences in five parts: "
        f"{count['Greetings and wishes']} greetings and wishes (Yoruba greets by the time of day and "
        "by what someone is doing — kúuṣẹ́ to someone at work, kúùjókòó to someone sitting), "
        f"{count['Everyday phrases']} everyday phrases and exclamations, {count['Idioms and similes']} "
        f"idioms and similes ('as sweet as honey'), {count['Proverbs']} proverbs, each with its "
        f"meaning and its literal reading, and {count['Sentences']} short sentences. Not a level: it "
        "follows the Yoruba A1, A2 and B1 decks and teaches none of their words again. WHERE THESE "
        "COME FROM: the phrases, idioms and proverbs are English Wiktionary's own entries, with its "
        "meanings and, where it gives one, its literal reading — none is written or translated by "
        f"Folio — and {ex_any} have Wiktionary's usage example; the sentences are Tatoeba's, at most "
        "nine words, printed as Tatoeba has them, each with its number. Both sources are small for "
        "Yoruba: Wiktionary has 17 Yoruba proverbs and Tatoeba about 60 translated sentences, so "
        "this deck is short. Left out: dialect greetings (Ekiti, Ìjẹ̀bú), the ritual formulas of "
        "the Ifá and Ògbóni societies, entries Wiktionary marks offensive, and sentences written "
        "without their tone marks or misspelt. There is no speaker button: few devices have a Yoruba voice. "
        "Sources: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0); Tatoeba "
        "(tatoeba.org), CC BY 2.0 FR."
    )
    meta = {
        'id': DECK, 'title': 'Yoruba Phrases and Expressions',
        'subtitle': f'{n} phrases, proverbs and sentences · both directions',
        'desc': desc, 'author': '', 'language': 'en', 'color': B.COLOR,
        'tags': ['yoruba', 'phrases', 'idioms', 'proverbs'], 'glossMode': 'site',
        'types': {B.TYPE_ID: {
            'id': B.TYPE_ID, 'name': 'Yoruba vocabulary', 'speechLang': 'yo-NG',
            'fields': B.FIELDS,
            'cards': [
                {'name': 'Yoruba → English', 'front': B.FRONT_YO, 'back': B.BACK_YO},
                {'name': 'English → Yoruba', 'front': B.FRONT_EN, 'back': B.BACK_EN},
            ],
            'css': B.CSS,
        }},
        'version': 1, 'createdAt': B.STAMP, 'updatedAt': B.STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': B.STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    # EVERY ENGLISH SIDE UNIQUE (kò tọ́pẹ́ and a ò kí ń dúpẹ́ ará ẹni are both "you're welcome")
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('dedupe_glosses', os.path.join(HERE, '..', 'dedupe-glosses.py'))
    dg = ilu.module_from_spec(spec)
    spec.loader.exec_module(dg)
    st = dg.dedupe(deck, 'Yoruba')
    if st['groups']:
        print('  labelled %d notes in %d groups that shared an English side' % (st['labelled'], st['groups']))
    out = os.path.abspath(os.path.join(DECKS, OUT))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes', count)


if __name__ == '__main__':
    main()
