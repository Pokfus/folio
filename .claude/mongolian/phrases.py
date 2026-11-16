#!/usr/bin/env python3
"""Write the Mongolian phrases deck: `decks/Mongolian-Phrases-and-Expressions.folio-deck.json`.

    python3 .claude/mongolian/phrases.py   (reads .claude/mongolian-cache/: kaikki-mn.jsonl, Tatoeba)

Asked for on 2026-11-16 ("Add the phrases deck").  English Wiktionary files about forty
Cyrillic Mongolian entries as phrases, interjections or proverbs, so -- the Amharic and Khmer
arrangement -- the deck is Wiktionary's own, then Tatoeba's short sentences.  Not a CEFR
level.  Two subdecks:

  Phrases    Wiktionary's phrase, interjection and proverb entries the level decks do not
             teach, plus its one idiom and one simile, in the hand order of `PHRASES`
             (greetings first, the calls to the herds last).  The gloss is Wiktionary's, with
             its "formal" or "informal" in the label.  `LEFT_OUT` names every entry not
             taught and why.
  Sentences  Tatoeba's Mongolian sentences with their English translation, at most EIGHT
             words, printed as Tatoeba has them.  Shortest first, then by Tatoeba number.

ONE ENGLISH SIDE PER CARD (the reverse card must have one answer).  Mongolian has a familiar
and a polite "you" (чи, та), so Tatoeba often has two sentences for one English one; such a
pair is labelled from the pronoun the sentence itself uses (`address`: чи and its forms
"familiar", та and its forms "polite", та нар "to several people").  A sentence whose English
is still another's after that is left out, the shorter kept.  A sentence that is only a phrase
above or a word a level teaches is left out, and so is one with a Latin letter, one Tatoeba
holds twice, and one with a word Wiktionary marks vulgar.  `DROP` names any other.

No corpus is counted, so a re-run is byte-identical whenever the cached sources are.

SOURCES: English Wiktionary via kaikki.org (CC BY-SA 4.0); Tatoeba (CC BY 2.0 FR), each
sentence's number on its card so it can be traced to its author.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mn import key, nfc, tokens, is_mongolian
import build_deck as B

E = lambda s: html.escape(s, quote=True)
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'mongolian-cache')
DECKS = os.path.join(HERE, '..', '..', 'decks')
OUT = 'Mongolian-Phrases-and-Expressions.folio-deck.json'
DECK = 'mnphrase'
MAX_WORDS = 8

# The hand order: greetings and leave-takings, courtesies, the phrasebook, the weather,
# exclamations, the slogan, the proverb and the idiom, the simile, the calls to the herds.
PHRASES = [
    'сайн уу', 'өглөөний мэнд', 'юу байна', 'тавтай морилогтун', 'дараа уулзъя', 'сайн яваарай',
    'гялайлаа', 'зүгээр', 'зүгээр зүгээр', 'тийм ээ', 'сайхан хооллоорой',
    'жорлон хаана байдаг вэ', 'би монголоор ярьдаггүй', 'надад ... хэрэгтэй', 'би чамд хайртай',
    'цас орж байна', 'бороо орж байна',
    'аа', 'хүүе', 'хөөе', 'ац',
    'орон бүрийн пролетари нар нэгдэгтүн',
    'овоо босгоогүй бол шаазгай хаанаас суух вэ', 'нэг сумаар хоёр туулай буудах',
    'цас шиг цагаан',
    'чөх', 'чүү', 'тоор тоор', 'цуу цуу',
]
POS = {'нэг сумаар хоёр туулай буудах': 'idiom', 'цас шиг цагаан': 'simile'}

# Wiktionary's interjection, phrase and proverb entries NOT taught here, with the reason
# (those a level deck teaches are found and left out by `taught`).
LEFT_OUT = {
    'пизда': 'vulgar, as Wiktionary marks it',
    'лалар': 'vulgar, as Wiktionary marks it',
    'новш': 'vulgar, as Wiktionary marks it',
    'хур': 'only used in хур хар, which Wiktionary has no entry for',
    'худ': 'only used in худ худ, a sound (below)',
    'тоор': 'only used in тоор тоор, which is taught',
    'баярлаа': 'a pronunciation spelling of баярлалаа "thank you", which A1 teaches',
    'хоо': 'a cow\'s or a camel\'s sound, or a cry of wonder: a sound, not a phrase',
    'худ худ': 'the sound of a swan',
    'пид': 'the sound of an impact',
    'дүнгэр': 'a word for a distant sound',
    'би ойлгохгүй байна': 'Wiktionary glosses "I don\'t know"; the words say "I do not understand", '
                          'and a card would teach one of the two wrongly',
}

# Tatoeba sentences left out, by Mongolian sentence number, each with its reason.
DROP = {}

FAMILIAR = {'чи', 'чамайг', 'чамд', 'чиний', 'чамтай', 'чамаас', 'чинь', 'чамаар', 'чамруу'}
POLITE = {'та', 'таныг', 'танд', 'таны', 'тантай', 'танаас', 'тань'}


def address(mn):
    t = [x.lower() for x in tokens(mn)]
    if 'та' in t and 'нар' in t:
        return 'to several people'
    if any(x in FAMILIAR for x in t):
        return 'familiar'
    if any(x in POLITE for x in t):
        return 'polite'
    return ''


def plain(s):
    return ' '.join(key(t) for t in tokens(s))


def taught():
    out = set()
    for f in ('Mongolian-A1', 'Mongolian-A2', 'Mongolian-B1'):
        for c in json.load(open(os.path.join(DECKS, f + '.folio-deck.json'), encoding='utf-8'))['cards']:
            out.add(key(c['fields']['Word']))
    return out


def wiktionary():
    """headword -> (pos, [gloss], tags) for every Cyrillic phrase, interjection or proverb,
    and the idiom and simile `POS` names; and the words Wiktionary marks vulgar."""
    out, vulgar = {}, set()
    for line in open(os.path.join(CACHE, 'kaikki-mn.jsonl'), encoding='utf-8'):
        e = json.loads(line)
        w = nfc(e['word'])
        tags = {t for s in e.get('senses', []) for t in s.get('tags', [])}
        if 'vulgar' in tags and ' ' not in w:
            vulgar.add(key(w))
        if not re.search('[А-Яа-яЁёӨөҮү]', w):
            continue
        if e.get('pos') not in ('phrase', 'intj', 'proverb') and w not in POS:
            continue
        x = out.setdefault(w, [POS.get(w, e['pos']), [], set()])
        for s in e.get('senses', []):
            if w in POS and ({'figuratively'} & set(s.get('tags', []))):
                continue                  # сүү шиг цагаан's "pure as the driven snow" is not this
            x[1] += s.get('glosses', [])
            x[2] |= set(s.get('tags', []))
    return out, vulgar


def tatoeba():
    links = {}
    for line in open(os.path.join(CACHE, 'mon-eng_links.tsv'), encoding='utf-8'):
        p = line.split()
        if len(p) == 2:
            links.setdefault(p[0], []).append(p[1])
    want = {b for v in links.values() for b in v}
    eng = {}
    for line in open(os.path.join(CACHE, 'eng_sentences.tsv'), encoding='utf-8'):
        i, _, t = line.rstrip('\n').split('\t', 2)
        if i in want:
            eng[i] = t
    out = []
    for line in open(os.path.join(CACHE, 'mon_sentences_detailed.tsv'), encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        en = sorted(int(b) for b in links.get(p[0], []) if b in eng)
        if en:
            out.append((p[0], nfc(p[2]).strip(), eng[str(en[0])]))
    return out


def sense(pos, text):
    return f'<div class="uc-sense"><div class="uc-pos">{E(pos)}</div><div class="uc-gl">{E(text)}</div></div>'


def main():
    below = taught()
    W, vulgar = wiktionary()
    for w, (pos, _, _) in W.items():
        if w not in PHRASES and w not in LEFT_OUT and key(w) not in below:
            raise SystemExit(f'Wiktionary has a new {pos} entry, {w}: add it to PHRASES or LEFT_OUT')
    cards, seen, sides = [], set(), set()
    for w in PHRASES:
        pos, gl, tags = W[w]
        assert key(w) not in below, w + ' is taught by a level deck'
        lab = {'intj': 'interjection'}.get(pos, pos)
        for t in ('formal', 'informal'):
            if t in tags:
                lab += ' · ' + t
        g = B.lower_first(gl[0]) if not gl[0].startswith('I ') else gl[0]
        shown = w.replace('...', '…')
        seen.add(plain(w))
        side = sense(lab, g)
        assert side not in sides, w
        sides.add(side)
        cards.append({'sub': 'Phrases', 'fields': {
            'Mongolian': f'<div class="uc-word">{E(shown)}</div>', 'Word': shown,
            'English': side, 'Forms': '', 'Examples': ''}})
    n_phr = len(cards)
    sents, texts = [], set()
    for mid, mn, en in tatoeba():
        words = mn.split()
        if mid in DROP or not words or len(words) > MAX_WORDS:
            continue
        if re.search('[A-Za-z]', mn) or mn in texts:
            continue                      # a Latin letter (a name, a transliteration), or a repeat
        p = plain(mn)
        if not p or p in seen or p in below:
            continue
        if any(key(t) in vulgar for t in tokens(mn)):
            continue
        texts.add(mn)
        seen.add(p)
        sents.append((len(words), int(mid), mn, en))
    used = set()
    for _, mid, mn, en in sorted(sents):
        who = address(mn)
        if (en, who) in used or (en, '') in used:
            continue                      # the same English, said the same way: the shorter is kept
        used.add((en, who))
        lab = f'sentence · Tatoeba #{mid}' + (f' · {who}' if who else '')
        cards.append({'sub': 'Sentences', 'fields': {
            'Mongolian': f'<div class="uc-word">{E(mn)}</div>', 'Word': mn,
            'English': sense(lab, en), 'Forms': '', 'Examples': ''}})
    n_sen = len(cards) - n_phr
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = B.TYPE_ID
    n = len(cards)
    desc = (
        "Mongolian said whole: greetings and leave-takings, courtesies, the phrasebook questions a "
        "visitor needs, the weather, exclamations, a proverb, an idiom and the calls a herder makes "
        "to the animals, then a set of short everyday sentences. Both study directions, each a card "
        "of its own: Mongolian → English and English → Mongolian. "
        f"{n_phr} PHRASES are every phrase, interjection and proverb English Wiktionary has for "
        "Mongolian that the level decks do not teach (vulgar ones and mere sounds left out), with "
        "Wiktionary's own meaning and its 'formal' or 'informal': сайн уу 'hello' (informal; "
        "A1 teaches the formal сайн байна уу), өглөөний мэнд 'good morning', тавтай морилогтун "
        "'welcome', сайн яваарай 'bon voyage', гялайлаа 'thank you' (formal), сайхан хооллоорой "
        "'enjoy your meal', the proverb овоо босгоогүй бол шаазгай хаанаас суух вэ, given by "
        "Wiktionary as 'it takes two to tango', and the idiom нэг сумаар хоёр туулай буудах 'to "
        "kill two birds with one stone'. "
        f"{n_sen} SENTENCES are Tatoeba's short Mongolian sentences (eight words at most) with "
        "their English translation, printed as Tatoeba has them, each card giving the sentence's "
        "Tatoeba number. Mongolian has a familiar and a polite 'you' (чи, та), so where two "
        "sentences share an English one the card says which is which. Tatoeba's stock name Tom "
        "(Том) is in many of them. Nothing here is invented, and nothing the level decks teach "
        "is repeated. It is not a CEFR level. There is no speaker button: few devices have a "
        "Mongolian voice. Sources: English Wiktionary, via the kaikki.org extraction "
        "(CC BY-SA 4.0); Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )
    meta = {
        'id': DECK, 'title': 'Mongolian Phrases and Expressions',
        'subtitle': f'{n} phrases and sentences · {n_phr} phrases, {n_sen} sentences · both directions',
        'desc': desc, 'author': '', 'language': 'en', 'color': B.COLOR,
        'tags': ['mongolian', 'phrases', 'greetings', 'sentences'],
        'glossMode': 'site',
        'types': {B.TYPE_ID: {
            'id': B.TYPE_ID, 'name': 'Mongolian vocabulary', 'speechLang': 'mn-MN', 'fields': B.FIELDS,
            'cards': [
                {'name': 'Mongolian → English', 'front': B.FRONT_MN, 'back': B.BACK_MN},
                {'name': 'English → Mongolian', 'front': B.FRONT_EN, 'back': B.BACK_EN},
            ],
            'css': B.CSS,
        }},
        'version': 1, 'createdAt': B.STAMP, 'updatedAt': B.STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': B.STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(DECKS, OUT))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out)
    print(f'  notes {n} ({n_phr} phrases, {n_sen} sentences) = cards {n * 2} | bytes {os.path.getsize(out)}')


if __name__ == '__main__':
    main()
