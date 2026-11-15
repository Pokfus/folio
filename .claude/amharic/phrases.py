#!/usr/bin/env python3
"""Write the Amharic phrases deck: `decks/Amharic-Phrases-and-Expressions.folio-deck.json`.

    python3 .claude/amharic/phrases.py      (reads .claude/amharic-cache/: kaikki-am.jsonl and Tatoeba)

Asked for on 2026-11-15 ("Add phrases").  English Wiktionary files only seven Amharic
entries as phrases and one as a proverb, so -- the Zulu arrangement -- the deck is
Wiktionary's phrases, interjections and proverb, then Tatoeba's short sentences, and it
says it is small.  Not a CEFR level.  Two subdecks:

  Phrases    Wiktionary's own phrase, interjection and proverb entries that the level decks
             do not teach, in the hand order of `PHRASES` (a greeting first).  The gloss is
             Wiktionary's; an entry Wiktionary defines only as another's variant ("feminine
             singular of እንግሊዝኛ ትችላለህ") is given that entry's gloss with who it is said to
             ("to a woman", "formal"), and the entry it varies is labelled "to a man".
  Sentences  Tatoeba's Amharic sentences with their English translation, at most NINE
             words, printed as Tatoeba has them.  Shortest first, then by Tatoeba number.

ONE ENGLISH SIDE PER CARD (the reverse card must have one answer).  Amharic marks who is
spoken to, so Tatoeba often has two or three Amharic sentences for one English one ("You
are a student": አንተ ተማሪ ነህ to a man, አንቺ ተማሪ ነሽ to a woman).  `ADDRESS` labels those
from the pronoun or the ending the sentence itself uses: አንተ / -ህ a man, አንቺ / -ሽ a
woman, እርስዎ / -ዎ formal, -ችሁ several people.  A sentence whose English is still another's
after that (an emphatic እኔ added, a second wording) is left out, the shorter kept.  A
sentence that is only a phrase above or a word a level teaches is left out too, and `DROP`
names each other sentence left out and why.

No corpus is counted, so a re-run is byte-identical whenever the cached sources are.

SOURCES: English Wiktionary via kaikki.org (CC BY-SA 4.0); Tatoeba (CC BY 2.0 FR), each
sentence's number on its card so it can be traced to its author.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from am import key, nfc, tokens
import build_deck as B

E = lambda s: html.escape(s, quote=True)
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'amharic-cache')
DECKS = os.path.join(HERE, '..', '..', 'decks')
OUT = 'Amharic-Phrases-and-Expressions.folio-deck.json'
DECK = 'amphrase'
MAX_WORDS = 9

# The hand order: greetings, the phrasebook, wishes, exclamations, the proverb.
PHRASES = ['ጤና፡ይስጥልኝ', 'ሀሎ', 'እሺ',
           'ስምህ፡ማን፡ነው', 'ስምሽ፡ማን፡ነው',
           'እንግሊዝኛ፡ትችላለህ', 'እንግሊዝኛ፡ትችያለሽ', 'እንግሊዝኛ፡ይችላሉ',
           'መልካም፡ልደት', 'መልካም፡አዲስ፡አመት',
           'ሃሌሉያ', 'ወዮ',
           'ሮም፡በአንድ፡ቀን፡አልተገነባችም']

# Wiktionary's interjection, phrase and proverb entries NOT taught here, with the reason.
LEFT_OUT = {'ይቅርታ': 'taught at A1'}

# "feminine singular of X" -> who the variant is said to
VARIANT = [(re.compile(r'^feminine (?:singular )?of '), 'to a woman'),
           (re.compile(r'^formal (?:singular )?of '), 'formal')]

# Tatoeba sentences sharing an English side, labelled by who is spoken to: the pronoun or
# the ending each sentence uses (አንተ / -ህ a man, አንቺ / -ሽ a woman, እርስዎ / -ዎ formal,
# -ችሁ several people).  By Amharic sentence number.
ADDRESS = {
    '3108373': 'to a man', '3108377': 'to a woman',                 # You are a student.
    '3108396': 'to a man', '3108391': 'to a woman',                 # Who are you?
    '3764068': 'to a man', '3764067': 'formal',                     # And you?
    '3784767': 'to a man', '3784765': 'formal',                     # I'm a student. And you?
    '3982225': 'to a man', '3982228': 'to a woman',                 # Do you love your mother?
    '12405448': 'to a man', '12405449': 'to a woman',               # I never loved you.
    '3668885': 'to a man', '3668887': 'to a woman',                 # She wants you.
    '3668889': 'formal', '3668890': 'to several people',
    '3864382': 'to a man', '3864380': 'to several people',          # Do you have a house?
}

# Tatoeba sentences left out, by Amharic sentence number, each with its reason.
DROP = {
    '9145942': 'እግዚአብሔር ይመስገን is "God be praised", not the "Thank you" Tatoeba pairs it with',
    '3642370': 'mistyped (እየተመርኩ) and its እሱም "he too" does not match "I\'m also learning Amharic"',
    '3642401': 'mistyped (እየተመርኩ for እየተማርኩ)',
    '3645250': '"Russia is big" for ሩሲያው, "the Russian": a mistranslation',
    '13192426': 'half of it is a Latin transliteration, not Amharic',
    '3982309': 'an encyclopaedic fact that dates ("currently the tallest")',
    '3642392': '"I killed him": not an everyday sentence',
    '3642397': '"I killed her": not an everyday sentence',
    '12975751': '"Tom was killed by a lion": Tatoeba\'s stock name, not an everyday sentence',
    '3206587': '"Give me the gun": not an everyday sentence',
    '3645251': '"Tom is big": Tatoeba\'s stock name; "I\'m big" and "You are big" teach it',
    '3642343': 'a second "My name is …"; John\'s is kept',
    '3642345': 'a second "My name is …"; John\'s is kept',
    '3642349': 'a second "My name is …"; John\'s is kept',
    '3642351': 'a second "My name is …"; John\'s is kept',
    '12405450': 'a second wording (በጭራሽ) of "I never loved you", which is kept',
    '12405451': 'a second wording (በጭራሽ) of "I never loved you", which is kept',
    '3864378': 'the same question with አንድ "a"; ቤት አላችሁ? is kept',
    '3864381': 'the same question with አንድ "a"; ቤት አለህ? is kept',
    '4451304': 'ምንም ሰው አየ has no negative ("he saw someone"), not the "He saw nobody" it is paired with',
    '3643013': 'mistyped (አልበልም for አልበላም)',
    '2722295': 'mistyped (ተፈልጋለህ for ትፈልጋለህ)',
    '3316515': 'mistyped (እየፍለግህ for እየፈለግህ)',
    '9145954': 'mistyped (ይህዱና for ይሂዱና)',
    '9145959': 'mistyped (ክዚህ for ከዚህ)',
    '3316038': 'mistyped (አነጋገፌ for አነጋገሬ)',
    '2722320': 'mistyped (እትምሀርት)',
}


def plain(s):
    """A phrase folded for comparison: its words' keys, no punctuation."""
    return ' '.join(key(t) for t in tokens(s.replace('፡', ' ')))


def taught():
    """Every headword the level decks teach, as SPELT: the fold would join እሺ "okay" with
    A1's ሺ "thousand" (the opening እ folds away), which are not one word."""
    out = set()
    for f in ('Amharic-A1', 'Amharic-A2', 'Amharic-B1'):
        for c in json.load(open(os.path.join(DECKS, f + '.folio-deck.json'), encoding='utf-8'))['cards']:
            out.add(c['fields']['Word'])
    return out


def wiktionary():
    """headword -> (romanisation, pos, [gloss]) for every phrase, interjection or proverb."""
    out = {}
    for line in open(os.path.join(CACHE, 'kaikki-am.jsonl'), encoding='utf-8'):
        e = json.loads(line)
        if e.get('pos') not in ('phrase', 'intj', 'proverb'):
            continue
        rom = next((f['form'] for f in e.get('forms', []) if 'romanization' in f.get('tags', [])), '')
        w = out.setdefault(nfc(e['word']), [nfc(rom), e['pos'], []])
        for s in e.get('senses', []):
            for g in s.get('glosses', []):
                w[2].append(g)
    return out


def tatoeba():
    """[(amharic id, amharic, english)] -- each sentence once, with its lowest-numbered English."""
    links = {}
    for line in open(os.path.join(CACHE, 'amh-eng_links.tsv'), encoding='utf-8'):
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
    for line in open(os.path.join(CACHE, 'amh_sentences_detailed.tsv'), encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        en = sorted((int(b) for b in links.get(p[0], []) if b in eng))
        if en:
            out.append((p[0], nfc(p[2]), eng[str(en[0])]))
    return out


def sense(pos, text):
    return f'<div class="uc-sense"><div class="uc-pos">{E(pos)}</div><div class="uc-gl">{E(text)}</div></div>'


def main():
    below = taught()
    W = wiktionary()
    for w, (_, pos, gl) in W.items():
        if w not in PHRASES and w not in LEFT_OUT:
            raise SystemExit(f'Wiktionary has a new {pos} entry, {w}: add it to PHRASES or LEFT_OUT')
    cards, seen, sides = [], set(), set()
    varied = set()
    for w in PHRASES:
        for g in W[w][2]:
            for rx, _ in VARIANT:
                if rx.match(g):
                    varied.add(nfc(re.sub(r'\s*\(.*$', '', rx.sub('', g))).replace(' ', '፡'))
    for w in PHRASES:
        rom, pos, gl = W[w]
        shown = w.replace('፡', ' ')
        assert shown not in below, w + ' is taught by a level deck'
        lab = {'intj': 'interjection', 'phrase': 'phrase', 'proverb': 'proverb'}[pos]
        g = gl[0]
        for rx, who in VARIANT:
            if rx.match(g):
                base = nfc(re.sub(r'\s*\(.*$', '', rx.sub('', g))).replace(' ', '፡')
                g, lab = W[base][2][0], lab + ' · ' + who
                break
        else:
            if w in varied:
                lab += ' · to a man'
        if pos != 'proverb':          # "Rome wasn't built in a day" keeps its capital
            g = B.lower_first(g)
        seen.add(plain(shown))
        side = sense(lab, g)
        assert side not in sides, w
        sides.add(side)
        cards.append({'sub': 'Phrases', 'fields': {
            'Amharic': f'<div class="uc-word">{E(shown)}</div>', 'Roman': E(rom),
            'Word': shown, 'English': side, 'Forms': '', 'Examples': ''}})
    n_phr = len(cards)
    sents = []
    for aid, am, en in tatoeba():
        if aid in DROP or len(am.split()) > MAX_WORDS or len(am.split()) == 0:
            continue
        p = plain(am)
        bare = re.sub(r'[^\u1200-\u135A ]', '', am).strip()
        if not p or p in seen or bare in below:
            continue
        seen.add(p)
        sents.append((len(am.split()), int(aid), am, en))
    used_en = set()
    for n_w, aid, am, en in sorted(sents):
        who = ADDRESS.get(str(aid))
        if (en, who) in used_en:
            continue                  # the same English, said to the same person: the shorter is kept
        used_en.add((en, who))
        lab = f'sentence · Tatoeba #{aid}' + (f' · {who}' if who else '')
        cards.append({'sub': 'Sentences', 'fields': {
            'Amharic': f'<div class="uc-word">{E(am)}</div>', 'Roman': '', 'Word': am,
            'English': sense(lab, en), 'Forms': '', 'Examples': ''}})
    n_sen = len(cards) - n_phr
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = B.TYPE_ID
    n = len(cards)
    desc = (
        "Amharic said whole: greetings, the phrasebook questions a visitor needs, wishes, "
        "exclamations, a proverb and a set of short everyday sentences. Both study directions, "
        "each a card of its own: Amharic → English and English → Amharic. "
        f"{n_phr} PHRASES are every phrase, interjection and proverb English Wiktionary has for "
        "Amharic that the level decks do not teach, with Wiktionary's own meaning and "
        "romanisation: ጤና ይስጥልኝ 'hello', ሀሎ on the phone, እሺ 'okay', ስምህ ማን ነው? 'what is your "
        "name?' and እንግሊዝኛ ትችላለህ? 'do you speak English?' — each in the forms Amharic uses for a "
        "man, a woman or politely — መልካም ልደት 'happy birthday', መልካም አዲስ አመት 'happy New Year', "
        "and the proverb ሮም በአንድ ቀን አልተገነባችም 'Rome wasn't built in a day'. "
        f"{n_sen} SENTENCES are Tatoeba's short Amharic sentences (nine words at most) with their "
        "English translation, printed as Tatoeba has them, each card giving the sentence's Tatoeba "
        "number. Amharic marks who is spoken to, so where two sentences share an English one the "
        "card says which is said to a man, to a woman, politely or to several people. They carry "
        "no romanisation (Tatoeba gives none): the Fidäl deck teaches the letters. "
        "THE DECK IS SMALL BECAUSE THE SOURCES ARE: Wiktionary files eight Amharic entries as "
        "phrases or proverbs, and Tatoeba holds about 250 Amharic sentences with a translation, so "
        "nothing here is invented and nothing is padded. It is not a CEFR level; ይቅርታ 'sorry' is in "
        "A1, and nothing the level decks teach is repeated. There is no speaker button: few devices "
        "have an Amharic voice. Sources: English Wiktionary, via the kaikki.org extraction "
        "(CC BY-SA 4.0); Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )
    meta = {
        'id': DECK, 'title': 'Amharic Phrases and Expressions',
        'subtitle': f'{n} phrases and sentences · {n_phr} phrases, {n_sen} sentences · both directions',
        'desc': desc, 'author': '', 'language': 'en', 'color': B.COLOR,
        'tags': ['amharic', 'phrases', 'greetings', 'sentences'],
        'glossMode': 'site',
        'types': {B.TYPE_ID: {
            'id': B.TYPE_ID, 'name': 'Amharic vocabulary', 'speechLang': 'am-ET', 'fields': B.FIELDS,
            'cards': [
                {'name': 'Amharic → English', 'front': B.FRONT_AM, 'back': B.BACK_AM},
                {'name': 'English → Amharic', 'front': B.FRONT_EN, 'back': B.BACK_EN},
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
