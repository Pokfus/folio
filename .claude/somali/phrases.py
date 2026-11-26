#!/usr/bin/env python3
"""Write the Somali phrases deck: `decks/Somali-Phrases-and-Expressions.folio-deck.json`.

    python3 .claude/somali/phrases.py      (reads .claude/somali-cache/: kaikki-so.jsonl and Tatoeba)

Asked for on 2026-11-16, in place of a B1 (the owner's choice: after A2, Wiktionary's
Somali is used up, so a B1 would have been nearly all Folio's own glosses).  Not a CEFR
level.  Three subdecks:

  Greetings and wishes  the greetings and their answers, goodbyes, welcomes and wishes
  Everyday phrases      the phrasebook formulas, apologies, the religious formulas of
                        everyday speech, and Wiktionary's interjections
  Sentences             Tatoeba's Somali sentences with their English, at most NINE
                        words; `DROP` names each left out and why

WHERE A PHRASE COMES FROM.  English Wiktionary files almost no Somali phrases: five of
its interjections are used (`WIKT`, with Wiktionary's own gloss); its three other
multi-word "nouns" are obscenities, and its other interjections are taught by a level.
The rest (`HAND`) are Folio's glosses of the standard formulas a Somali course or
phrasebook gives, the Hausa phrases-deck arrangement; the description says how many.
A phrase Tatoeba already has as a sentence (Magacaa? "what's your name?", Hambalyo!,
Subax wanaagsan, Sidee tahay?, Xageed ka timid?) is left to the Sentences, where its
source is on the card.  Welcome is spelt as Tatoeba spells it (ku soo dhawoow, to one
person; ku soo dhawaada, to several).

A SHOWN PHRASE KEEPS ITS PUNCTUATION; `Word` is the phrase without it, which the check reads.
Nothing a level deck teaches as a word is repeated as a phrase (asserted).

THE ORDER is the hand order below, then the sentences, shortest first, then by Tatoeba
id.  No corpus is counted, so a re-run is byte-identical whenever the sources are.

SOURCES: English Wiktionary via kaikki.org (CC BY-SA 4.0); Tatoeba (CC BY 2.0 FR), each
sentence's number on its card so it can be traced to its author; Folio's own glosses.
"""
import csv, html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from so import key, nfc
import build_deck as B

csv.field_size_limit(10 ** 8)
E = lambda s: html.escape(s, quote=False)
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'somali-cache')
DECKS = os.path.join(HERE, '..', '..', 'decks')
OUT = 'Somali-Phrases-and-Expressions.folio-deck.json'
DECK = 'sophrase'
MAX_WORDS = 9
GREET, EVERY, SENT = 'Greetings and wishes', 'Everyday phrases', 'Sentences'

# (shown, subdeck, label, gloss) -- Folio's glosses, in the hand order.
HAND = [
    ('Iska warran?', GREET, 'phrase', 'how are you? (literally, give news of yourself)'),
    ('Waan fiicanahay.', GREET, 'phrase', 'I am well'),
    ('Nabad baan qabaa.', GREET, 'phrase', 'I am fine (literally, I have peace)'),
    ('Galab wanaagsan.', GREET, 'phrase', 'good afternoon'),
    ('Habeen wanaagsan.', GREET, 'phrase', 'good night'),
    ('Asalaamu calaykum.', GREET, 'phrase', 'peace be upon you (the Muslim greeting)'),
    ('Wacalaykum salaam.', GREET, 'phrase', 'and upon you be peace (the answer to the greeting)'),
    ('Ku soo dhawoow!', GREET, 'phrase · to one person', 'welcome!'),
    ('Ku soo dhawaada!', GREET, 'phrase · to several people', 'welcome! (to a group)'),
    ('Nabadgelyo.', GREET, 'phrase', 'goodbye (literally, go in peace)'),
    ('Is arag.', GREET, 'phrase', 'see you; goodbye (literally, see each other)'),
    ('Iska jir.', GREET, 'phrase', 'take care'),
    ('Ciid wanaagsan!', GREET, 'phrase', 'happy Eid!'),
    ('Mahadsanidiin.', EVERY, 'phrase · to several people', 'thank you (to a group)'),
    ('Waan ka xumahay.', EVERY, 'phrase', "I'm sorry"),
    ('Raali iga ahow.', EVERY, 'phrase', 'excuse me; forgive me'),
    ('Dhib ma leh.', EVERY, 'phrase', "no problem; it doesn't matter"),
    ('Waa hagaag.', EVERY, 'phrase', 'OK, all right'),
    ('Ma aqaan.', EVERY, 'phrase', "I don't know"),
    ('Ma fahmin.', EVERY, 'phrase', "I didn't understand"),
    ('Waa imisa?', EVERY, 'phrase', 'how much is it?'),
    ('Waxaan ka imid …', EVERY, 'phrase', 'I come from … (literally, I came from)'),
    ('Haddii Alle idmo.', EVERY, 'phrase', 'God willing (literally, if God permits)'),
    ('Alxamdulillaah.', EVERY, 'phrase', 'praise be to God'),
    ('Bismillaah.', EVERY, 'phrase', 'in the name of God (said before beginning something)'),
]
# Wiktionary's interjections, by page title: (shown, subdeck); the gloss is Wiktionary's.
WIKT = [
    ('miyaa', 'Miyaa?', EVERY),
    ('bisinka', 'Bisinka!', EVERY),
    ('warya', 'Warya!', EVERY),
    ('naya', 'Naya!', EVERY),
    ('Naxariis iyo Nabadgelyo Korkiisa Ha Ahaato', 'Naxariis iyo nabadgelyo korkiisa ha ahaato.', EVERY),
]

# Tatoeba's stock names: a sentence about Tom, Mary, Layla ... is a translation exercise, not a phrase.
STOCK = re.compile(r'\b(?:Tom|Mary|John|Layla|Sami|Mennad|Liza|Linda)\b')
# Tatoeba sentences left out, by Somali sentence number, each with its reason.
DROP = {
    '9083435': 'a killing ("I killed the man"), not a phrase to learn',
    '9811187': 'a judgement on a country ("Algeria is relatively poor") that dates',
    '5020855': 'Tatoeba talking about itself ("Welcome to Tatoeba!"); the welcome is a phrase above',
    '5020856': 'Tatoeba talking about itself; the welcome is a phrase above',
    '12801226': 'an internet meme ("Skibidi Toilet")',
    '9811324': 'a tailoring idiom ("take in my jacket") rendered word for word',
    '12977436': '"What is my name?": a translation exercise, not a question anyone asks',
    '4338014': 'an encyclopaedic fact that dates ("currently the tallest")',
    '4338021': 'the same fact again',
    '12408575': 'the same English as #9083906 ("What did he say?"), so the reverse card would have two answers',
}


def taught():
    out = set()
    for f in ('Somali-A1', 'Somali-A2'):
        for c in json.load(open(os.path.join(DECKS, f + '.folio-deck.json'), encoding='utf-8'))['cards']:
            out.add(key(c['fields']['Word']))
    return out


def bare(s):
    """The phrase without punctuation, lower case after its first letter is kept as written."""
    return re.sub(r'\s+', ' ', re.sub(r"[^\w' ]", ' ', s)).strip()


def wiktionary():
    out = {}
    for line in open(os.path.join(CACHE, 'kaikki-so.jsonl'), encoding='utf-8'):
        e = json.loads(line)
        if e.get('pos') == 'intj':
            out.setdefault(e['word'], []).extend(
                g for s in e.get('senses', []) for g in s.get('glosses', [])[-1:])
    return out


def tatoeba():
    som = {}
    for r in csv.reader(open(os.path.join(CACHE, 'som_sentences_detailed.tsv'), encoding='utf-8'),
                        delimiter='\t', quoting=csv.QUOTE_NONE):
        if len(r) >= 3:
            som[r[0]] = nfc(r[2]).replace('​', '')
    links = {}
    for r in csv.reader(open(os.path.join(CACHE, 'som-eng_links.tsv'), encoding='utf-8'),
                        delimiter='\t', quoting=csv.QUOTE_NONE):
        if len(r) >= 2 and r[0] in som:
            links.setdefault(r[0], []).append(r[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for r in csv.reader(open(os.path.join(CACHE, 'eng_sentences.tsv'), encoding='utf-8'),
                        delimiter='\t', quoting=csv.QUOTE_NONE):
        if len(r) >= 3 and r[0] in want:
            eng[r[0]] = r[2]
    out = []
    for sid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            out.append((sid, som[sid], en[0]))
    return out


def sense(label, gloss):
    return (f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>'
            f'<div class="uc-gl">{E(gloss)}</div></div>')


def card(sub, shown, word, english):
    return {'sub': sub, 'fields': {'Somali': E(shown), 'Tone': '', 'Word': word,
                                   'English': english, 'Forms': '', 'Examples': ''}}


def main():
    below = taught()
    W = wiktionary()
    rows = [(s, sub, lab, g, 'hand') for s, sub, lab, g in HAND]
    for page, shown, sub in WIKT:
        g = B.lower_first(B.tidy(W[page][0].rstrip('.')))
        rows.append((shown, sub, 'interjection', g, 'wiktionary'))
    cards, seen = [], set()
    for sub in (GREET, EVERY):
        for shown, s_, lab, g, src in rows:
            if s_ != sub:
                continue
            w = bare(shown)
            assert key(w) not in below, f'{w} is taught by a level deck'
            seen.add(key(w))
            cards.append(card(sub, shown, w, sense(lab, g)))
    n_hand, n_wikt = len(HAND), len(WIKT)
    n_phr = len(cards)
    sents = []
    for sid, so, en in tatoeba():
        if sid in DROP or STOCK.search(so + ' ' + en) or len(so.split()) > MAX_WORDS:
            continue
        k = key(bare(so))
        if k in seen or k in below:
            continue
        seen.add(k)
        sents.append((len(so.split()), int(sid), so, en))
    for _, sid, so, en in sorted(sents):
        cards.append(card(SENT, so, so, sense(f'sentence · Tatoeba #{sid}', en)))
    n_sen = len(cards) - n_phr
    eng = [c['fields']['English'] for c in cards]
    assert len(set(eng)) == len(eng), 'two cards share an English side'
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = B.TYPE_ID
    n = len(cards)
    n_g = sum(1 for c in cards if c['sub'] == GREET)
    n_e = sum(1 for c in cards if c['sub'] == EVERY)
    desc = (
        "Somali said whole: greetings and their answers, goodbyes, welcomes and wishes, the "
        "phrasebook formulas a visitor needs, and short everyday sentences. Both study directions, "
        "each a card of its own: Somali → English and English → Somali. It is not a CEFR level, "
        "and nothing the A1 and A2 decks teach as a word is repeated here. "
        f"{n_g} GREETINGS AND WISHES (iska warran? 'how are you?', nabad baan qabaa 'I am fine', "
        "asalaamu calaykum and its answer, ku soo dhawoow 'welcome', nabadgelyo 'goodbye', ciid "
        f"wanaagsan 'happy Eid') and {n_e} EVERYDAY PHRASES (waan ka xumahay 'I'm sorry', dhib ma "
        "leh 'no problem', ma aqaan 'I don't know', waa imisa? 'how much is it?', haddii Alle idmo "
        "'God willing', and the interjections warya and naya, said to get a boy's or a girl's "
        f"attention). {n_sen} SENTENCES are Tatoeba's short Somali sentences (nine words at most) "
        "with their English translation, each card giving the sentence's Tatoeba number: among them "
        "magacaa? 'what's your name?', sidee tahay? 'how are you?', subax wanaagsan 'good morning' "
        "and hambalyo! 'congratulations!'. WHERE THE PHRASES COME FROM, since it matters: English "
        f"Wiktionary files almost no Somali phrases, so {n_wikt} of the {n_phr} are its own "
        f"interjections, with its meaning, and the other {n_hand} are glossed by Folio itself with "
        "the meaning a Somali course or phrasebook gives, the literal sense in brackets where it "
        "helps. THE DECK IS SMALL BECAUSE THE SOURCES ARE: Tatoeba holds about 160 Somali "
        "sentences, and those about its stock characters (Tom, Mary, Layla …), a few that date "
        "or talk about Tatoeba itself, and the longer ones are left out; nothing is invented to "
        "fill the gap. There is no speaker button: few devices have a Somali voice. Sources: "
        "English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0); Tatoeba (tatoeba.org), "
        "CC BY 2.0 FR; Folio's own glosses."
    )
    meta = {
        'id': DECK, 'title': 'Somali Phrases and Expressions',
        'subtitle': (f'{n} expressions · {n_g} greetings, {n_e} everyday, {n_sen} sentences · '
                     'both directions'),
        'desc': desc, 'author': '', 'language': 'en', 'color': B.COLOR,
        'tags': ['somali', 'phrases', 'greetings', 'sentences'],
        'glossMode': 'site',
        'types': {B.TYPE_ID: {
            'id': B.TYPE_ID, 'name': 'Somali vocabulary', 'speechLang': 'so-SO', 'fields': B.FIELDS,
            'cards': [
                {'name': 'Somali → English', 'front': B.FRONT_SO, 'back': B.BACK_SO},
                {'name': 'English → Somali', 'front': B.FRONT_EN, 'back': B.BACK_EN},
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
    print(f'  notes {n} ({n_g} greetings, {n_e} everyday, {n_sen} sentences; {n_hand} hand-glossed)'
          f' = cards {n * 2} | bytes {os.path.getsize(out)}')


if __name__ == '__main__':
    main()
