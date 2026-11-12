#!/usr/bin/env python3
"""Write the Zulu phrases deck: `decks/Zulu-Phrases.folio-deck.json`.

    python3 .claude/zulu/phrases.py      (reads .claude/zulu-cache/: kaikki-zu.jsonl and Tatoeba)

Asked for on 2026-11-12 ("Add a phrases deck").  The plan had said no phrases deck,
because English Wiktionary files only 15 Zulu entries as phrases.  Counting its
interjections as well gives 31 more, and Tatoeba has about a hundred Zulu sentences with
English, so the deck is small and says so.  Not a CEFR level.  Two subdecks:

  Phrases    Wiktionary's own phrase and interjection entries: greetings and their
             answers, the goodbyes (to one person or several, the one leaving or the one
             staying), the phrasebook formulas (my name is, how old are you, I don't
             understand), apologies, exclamations, a sign, and the one proverb Wiktionary
             has, umuntu ngumuntu ngabantu.  Each gloss is Wiktionary's, never rewritten.
  Sentences  Tatoeba's Zulu sentences with their English translation, short (at most
             NINE words) and everyday.  `DROP` names each sentence left out and why.

NOTHING A LEVEL DECK TEACHES IS REPEATED (A1, A2 and B1 are read off their shipped files).
The interjections B1's first build had taken as words moved here, where they are taught
whole (`select.py` keeps every interjection and phrase out of the fill from B1 on).
A sentence that is only one taught word or phrase (Sawubona!, Unjani?) is left out too.

THE ORDER is the hand order of `PHRASES` (the first things a visitor says come first),
then the sentences, shortest first, then by Tatoeba id.  No corpus is counted, so a
re-run is byte-identical whenever the cached sources are.

SOURCES: English Wiktionary via kaikki.org (CC BY-SA 4.0); Tatoeba (CC BY 2.0 FR), each
sentence's number on its card so it can be traced to its author.
"""
import html, json, os, re, sys, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zu import fold
import build_deck as B

E = lambda s: html.escape(s, quote=True)
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'zulu-cache')
DECKS = os.path.join(HERE, '..', '..', 'decks')
OUT = 'Zulu-Phrases.folio-deck.json'
DECK = 'zuphrase'
MAX_WORDS = 9

# The hand order: greetings, goodbyes, the phrasebook, apologies, exclamations, a sign, the proverb.
PHRASES = [
    'unjani', 'ninjani', 'ngiyaphila', 'ngikhona', 'ngiyabonga',
    'hamba kahle', 'hambani kahle', 'sala kahle', 'salani kahle', 'lala kahle', 'lalani kahle',
    'ngubani igama lakho', 'igama lami ngu-', 'uneminyaka emingaki', 'ngineminyaka engu-',
    'ukhuluma isiZulu na', 'ukhuluma isiNgisi na', 'angikhulumi isiZulu', 'angiqondi', 'angazi',
    'sithini isikhathi',
    'ngiyaxolisa', 'phephisa', 'nxephepha',
    'musa', 'musani', 'hawu', 'maye', 'wololo', 'halala', 'bayede',
    'akubhenywa',
    'umuntu ngumuntu ngabantu',
]

# Wiktionary's interjection and phrase entries NOT taught here, each with its reason.
LEFT_OUT = {
    'sawubona': 'taught at A1', 'sanibonani': 'taught at A1', 'cha': 'taught at A1',
    'kahle': 'its interjection senses ("hold on", "don\'t") would teach a second kahle beside A1\'s',
    'kanti': 'taught at A1 (the adverb; its interjection sense "so what?" is a second sense of the same word)',
    'kahleni': 'only "plural of kahle"', 'sanibona': 'only "alternative form of sanibonani"',
    'uhambe kahle': 'glossed exactly as hamba kahle, so the English side would have two answers',
    'nihambe kahle': 'glossed exactly as hambani kahle', 'usale kahle': 'glossed exactly as sala kahle',
    'nisale kahle': 'glossed exactly as salani kahle', 'ulale kahle': 'the subjunctive of lala kahle, same English',
    'nilale kahle': 'the subjunctive of lalani kahle, same English',
}

# Tatoeba sentences left out, by Zulu sentence number, each with its reason.
DROP = {
    '14096557': 'Tatoeba\'s stock names (Tom and Mary), not an everyday sentence',
    '2888674': 'Tatoeba talking about itself ("Emily wrote the sentence")',
    '14096574': 'a line from Pinocchio, not everyday speech',
    '4805150': 'an encyclopaedic fact that dates ("currently the tallest")',
    '14096575': 'an old English idiom ("told on my stomach") rendered word for word',
    '9210380': '"the meter is set at zero": a technical line, oddly rendered',
    '14096558': 'a statement of a person\'s ancestry, not a phrase to learn',
    '9204545': 'a textbook exercise\'s instruction ("can you find the signs ...")',
    '9204337': 'a textbook exercise\'s instruction ("can you find all of Niki\'s books")',
}

LABEL = {'addressee-singular': 'to one person', 'addressee-plural': 'to several people'}


def plain(s):
    """A sentence folded for comparison: no marks, no punctuation, lower case."""
    return re.sub(r'[^a-z ]', '', fold(s)).strip()


def taught():
    out = set()
    for f in ('Zulu-A1', 'Zulu-A2', 'Zulu-B1'):
        for c in json.load(open(os.path.join(DECKS, f + '.folio-deck.json'), encoding='utf-8'))['cards']:
            out.add(fold(c['fields']['Word'].lstrip('-')))
    return out


def wiktionary():
    """headword -> (canonical tone form or '', [(tags, gloss)]) for every phrase or interjection."""
    out = {}
    for line in open(os.path.join(CACHE, 'kaikki-zu.jsonl'), encoding='utf-8'):
        e = json.loads(line)
        if e.get('pos') not in ('phrase', 'intj'):
            continue
        canon = next((f['form'] for f in e.get('forms', []) if 'canonical' in f.get('tags', [])), '')
        w = out.setdefault(e['word'], [canon, [], e['pos']])
        for s in e.get('senses', []):
            for g in s.get('glosses', []):
                w[1].append((tuple(s.get('tags') or ()), g))
    return out


def tatoeba():
    """[(zulu id, zulu, english)] -- each Zulu sentence once, with its lowest-numbered English."""
    links = {}
    for line in open(os.path.join(CACHE, 'zul-eng_links.tsv'), encoding='utf-8'):
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
    for line in open(os.path.join(CACHE, 'zul_sentences_detailed.tsv'), encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        en = sorted((int(b) for b in links.get(p[0], []) if b in eng))
        if en:
            out.append((p[0], unicodedata.normalize('NFC', p[2]), eng[str(en[0])]))
    return out


def sense(pos, body):
    return f'<div class="uc-sense"><div class="uc-pos">{E(pos)}</div>{body}</div>'


def main():
    below = taught()
    W = wiktionary()
    cards, seen = [], set()
    for w in PHRASES:
        canon, gls, pos = W[w]
        assert fold(w) not in below, w + ' is taught by a level deck'
        tags = next((t for t, _ in gls if set(t) & set(LABEL)), ())
        lab = 'interjection' if pos == 'intj' else 'phrase'
        lab += ''.join(' · ' + LABEL[t] for t in tags if t in LABEL)
        texts = list(dict.fromkeys(g for _, g in gls))[:3]
        body = (f'<div class="uc-gl">{E(texts[0])}</div>' if len(texts) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in texts) + '</ol>')
        tone = canon if canon and canon != w else ''
        seen.add(plain(w))
        cards.append({'sub': 'Phrases', 'fields': {
            'Zulu': f'<div class="uc-word">{E(w)}</div>', 'Tone': E(tone),
            'Word': w, 'Say': E(w.rstrip('-')), 'English': sense(lab, body),
            'Forms': '', 'Table': '', 'Examples': ''}})
    n_phr = len(cards)
    sents = []
    for zid, zu, en in tatoeba():
        if zid in DROP or len(zu.split()) > MAX_WORDS:
            continue
        p = plain(zu)
        if p in seen or p in below or p.replace(' ', '') in below:
            continue
        seen.add(p)
        sents.append((len(zu.split()), int(zid), zu, en))
    for _, zid, zu, en in sorted(sents):
        cards.append({'sub': 'Sentences', 'fields': {
            'Zulu': f'<div class="uc-word">{E(zu)}</div>', 'Tone': '', 'Word': zu, 'Say': E(zu),
            'English': sense(f'sentence · Tatoeba #{zid}', f'<div class="uc-gl">{E(en)}</div>'),
            'Forms': '', 'Table': '', 'Examples': ''}})
    n_sen = len(cards) - n_phr
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = B.TYPE_ID
    n = len(cards)
    desc = (
        "Zulu said whole: the greetings and their answers, the goodbyes, the phrasebook formulas a "
        "visitor needs and a handful of everyday sentences. Both study directions, each a card of "
        "its own: Zulu → English and English → Zulu. "
        f"{n_phr} PHRASES are every phrase and interjection English Wiktionary has for Zulu that the "
        "level decks do not teach, with Wiktionary's own meaning: unjani 'how are you?' (to one "
        "person) and ninjani (to several), the goodbyes — hamba kahle 'go well' to the one leaving, "
        "sala kahle 'stay well' to the one staying, each with its plural — ngubani igama lakho "
        "'what is your name?', angiqondi 'I don't understand', the exclamations hawu and maye, and "
        "the saying umuntu ngumuntu ngabantu, 'a person is a person through other people'. "
        f"{n_sen} SENTENCES are Tatoeba's short Zulu sentences (nine words at most) with their "
        "English translation, each card giving the sentence's Tatoeba number. "
        "THE DECK IS SMALL BECAUSE THE SOURCES ARE: Wiktionary files 46 Zulu entries as phrases or "
        "interjections and Tatoeba holds about a hundred Zulu sentences, so nothing here is "
        "invented and nothing is padded. It is not a CEFR level. sawubona 'hello', yebo and cha "
        "are in A1, and nothing the level decks teach is repeated here. A speaker reads each card "
        "where the device has a Zulu voice. Sources: English Wiktionary, via the kaikki.org "
        "extraction (CC BY-SA 4.0); Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )
    meta = {
        'id': DECK, 'title': 'Zulu Phrases',
        'subtitle': f'{n} phrases and sentences · {n_phr} phrases, {n_sen} sentences · both directions',
        'desc': desc, 'author': '', 'language': 'en', 'color': B.COLOR,
        'tags': ['zulu', 'isizulu', 'phrases', 'greetings', 'sentences'],
        'glossMode': 'site',
        'types': {B.TYPE_ID: {
            'id': B.TYPE_ID, 'name': 'Zulu vocabulary', 'speechLang': 'zu-ZA', 'fields': B.FIELDS,
            'cards': [
                {'name': 'Zulu → English', 'front': B.FRONT_ZU, 'back': B.BACK_ZU},
                {'name': 'English → Zulu', 'front': B.FRONT_EN, 'back': B.BACK_EN},
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
