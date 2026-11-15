#!/usr/bin/env python3
"""Write a Cantonese deck: headword, Jyutping, English, example sentences, and the .folio-deck.json.

    python3 build_deck.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json`, `freq.json` and `examples-<level>.json`; writes
`decks/Cantonese-<LEVEL>.folio-deck.json` and `entries-<level>.json` (one summary row per card,
for the description and the plan's counts).

THE CARD.  One note, two templates (Cantonese → English, English → Cantonese), `speechLang:
'zh-HK'` -- the Cantonese voice phones and browsers carry under Hong Kong's tag.  The headword in
TRADITIONAL characters, as Hong Kong writes it; under it the Jyutping, tone digits and all, because a
Cantonese syllable said on the wrong one of its six tones is another word (si1 "poem", si2 "history",
si3 "to try", si4 "time", si5 "market", si6 "yes"); and the SIMPLIFIED characters on a line of their
own where they differ, for a reader who learnt Chinese on the mainland.  No forms: Cantonese words do
not inflect.  No classifier line: CC-CEDICT's classifiers are Mandarin's, and Cantonese often uses
another (a dog is 一隻狗, not Mandarin's 一條狗), so the classifiers are taught as words instead.

THE PART OF SPEECH is HKCanCor's: the tag the corpus's annotators gave this word in this reading most
often, in plain English (`POS`).  A word the corpus lacks shows CC-Canto's own label where it has
one, and otherwise none -- CC-CEDICT gives no parts of speech.

THE ENGLISH is the dictionaries' (extract.py), cleaned: each `;`-separated gloss is its own item,
CC-CEDICT's measure-word tails (`M: 条`, `(CL:條)`) are cut, a gloss that names a place, a surname, an
ethnic group or a radical is dropped (`JUNK`), and so is a sense that is vulgar but carries no tag
saying so -- CC-Canto files 細佬 "younger brother" with a slang sense for a body part, and 比
"to compare" with a euphemistic variant of an obscenity.  At most four glosses.

`SHOW` CHOOSES, NEVER WRITES.  Both dictionaries list a character's senses in the order of its
history, Mandarin's above all, so the everyday Cantonese sense is often not first: 讀 opened on
"comma", 落 on "to leave out", 比 on "Belgium", 水 on "Shui ethnic group".  `SHOW` names, for a word,
which of ITS OWN glosses to show and in what order; a gloss it names that the dictionaries do not
hold stops the build.  A meaning the dictionaries lack altogether is `hand.py`'s, with its reason.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from yue import fold
from cantonese_level import LEVEL, TITLES, DECK_IDS, DECK_FILES, SCOPE, NAMES, TARGET, f
from hand import HAND

STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'cantonese'
COLOR = '#86522A'
FIELDS = ['Cantonese', 'Jyutping', 'Simplified', 'Word', 'English', 'Examples']

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Cantonese}}' + SAY + '</div>'
        '{{#Jyutping}}<div class="uc-rom">{{Jyutping}}</div>{{/Jyutping}}'
        '{{#Simplified}}<div class="uc-sc">simplified<b>{{Simplified}}</b></div>{{/Simplified}}')
ASK = '<div class="uc-ask">Say it in Cantonese</div><div class="uc-field">{{English}}</div>'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_YUE = WORD
BACK_YUE = '{{FrontSide}}<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'), encoding='utf-8').read()

E = html.escape

# HKCanCor's tags (the corpus's own scheme, after Peking University's), in plain English.
POS = {
    'n': 'noun', 'ng': 'noun', 'vn': 'verb', 'an': 'adjective',
    'v': 'verb', 'vd': 'verb', 'vg': 'verb', 'v1': 'verb', 'vu': 'modal verb',
    'a': 'adjective', 'ag': 'adjective', 'b': 'adjective', 'ad': 'adverb',
    'd': 'adverb', 'dg': 'adverb', 'r': 'pronoun', 'q': 'classifier', 'm': 'numeral',
    'y': 'sentence-final particle', 'y1': 'sentence-final particle', 'u': 'particle',
    'c': 'conjunction', 'p': 'preposition', 't': 'time word', 'f': 'position word',
    's': 'place word', 'e': 'interjection', 'o': 'sound word', 'l': 'expression', 'i': 'idiom',
}
# CC-Canto's own labels, where it gives one and HKCanCor has nothing.
CANTO_POS = {'noun': 'noun', 'verb': 'verb', 'adjective': 'adjective', 'adverb': 'adverb',
             'pronoun': 'pronoun', 'prep.': 'preposition', 'phrase': 'expression',
             'final particle': 'sentence-final particle', 'conjunction': 'conjunction'}

TAIL_RX = re.compile(r'\s*(?:\(CL:[^)]*\)|M: \S+|\(Taiwan pr\.[^)]*\))')
# CC-Canto's own part-of-speech label at the head of a gloss ("(noun / adverb) tomorrow"): the card
# prints the part of speech on its own line already.
LABEL_RX = re.compile(r'^\((?:noun|verb|adverb|adjective|phrase|pronoun|prep\.|adj\.|final particle)'
                      r'[^)]*\)\s*(?=\S)', re.I)
JUNK = re.compile(
    r'surname|short name for|abbreviation for \S+ Province|ethnic group|KangXi radical|'
    r'^the five Liang|^Belgi|Beijing dialect|euphemis|屄|penis|prick|shithead|\(crude\)|lewd|'
    r'pornographic|a term of gang|triad|(?-i:^Witness$)|Hyundai|^Up stair$|^\(loanword\) fan$|reactionary|'
    r'Apple \(American tech company\)|nickname of|^used in |^see |phonetic|derogatory|heroin|a disco|'
    r'-azine|^Canada \(abbr|colloquial pr\.|\(brand\)|Idesia|piss off|^\(figurative - old\)$|^\(bound form\) Japan|'
    r'anti-communist|^revolutionary$|^vulgar$|^a reptile$|^a broker$|^Spanish$|noun \(part of speech\)', re.I)

# word|jyutping -> the glosses to show, in order: each one the dictionaries' own (see the docstring).
SHOW = {
    # the greetings
    '拜拜|baai1 baai3': ['(loanword) bye-bye'],
    '早唞|zou2 tau2': ['"good night!"'],
    # the particles: the Cantonese sense, not a sound or a Mandarin use
    '啲|di1': ['some', 'few', 'a little'],
    '咩|me1': ['what?', 'final particle which transforms statements into questions that indicate doubt or surprise'],
    '咋|zaa3': ["that's it", "it's just"],
    '囉|lo1': ['a final particle to express emphasis', 'to point out something obvious'],
    '喇|laa3': ['sentence-final particle, indicating now', 'for now', 'up to now'],
    '添|tim1': ['too', 'in addition', 'a final particle conveying a sense of regret', 'to add'],
    '嗎|maa3': ['(question particle for "yes-no" questions)'],
    '過|gwo3': ['(experienced action marker)', 'to cross', 'to pass (time)', 'too much'],
    '住|zyu6': ['to live', 'to stay', 'used after a verb to indicate a continuous state or an action which has not been completed yet'],
    '返|faan1': ['to return (to)', 'to go back', "to go to one's school or office", 'to come back'],
    '得|dak1': ['to obtain', 'to allow', 'ready', 'must'],
    '左|zo2': ['left', 'opposite', 'wrong'],
    # a classifier, not a Mandarin sense
    '張|zoeng1': ['classifier for flat objects, sheet', 'sheet of paper', 'to open up'],
    '本|bun2': ['classifier for books, periodicals, files etc', 'root', 'origin', 'this'],
    '條|tiu4': ['classifier for long thin things (ribbon, river, road, trousers etc)', 'strip', 'item'],
    '間|gaan1': ['classifier for rooms', 'classifier for shops, office or buildings', 'room', 'between'],
    '架|gaa3': ['classifier for planes, large vehicles, radios etc', 'to support', 'to prop up'],
    '位|wai2': ['classifier for people (honorific)', 'seat', 'place', 'position'],
    '毫|hou4': ['currency unit', 'cents', 'one thousandth', 'fine hair'],
    '蚊|man1': ['dollar', 'money', 'mosquito'],
    # the numbers: the number, not the slang the dictionaries file under it
    '四|sei3': ['four', '4'],
    '五|ng5': ['five', '5'],
    '八|baat3': ['eight', 'all around', 'all sides'],
    '九|gau2': ['nine', '9'],
    '十|sap6': ['ten', '10', 'tenth'],
    '百|baak3': ['hundred', 'numerous', 'all kinds of'],
    '千|cin1': ['thousand', 'many', 'numerous'],
    '咳|kat1': ['cough'],
    # 度 after 呢 / 嗰 / 邊 is "place" (HKCanCor tags it f, a position word, 72 of its 87 dou6 tokens)
    '度|dou6': ['here', 'there', 'where', 'degree (angles, temperature etc)'],
    # A2: the everyday Hong Kong sense
    '天橋|tin1 kiu4': ['overhead walkway', 'pedestrian bridge', 'overpass'],
    '大方|daai6 fong1': ['generous', 'magnanimous', 'stylish'],
    '曳|jai5': ['naughty', 'mischievous', 'bad'],
    '乾|gon1': ['dry', 'dried food', 'empty'],
    '大學|daai6 hok6': ['university', 'college'],
    '婆婆|po4 po2': ['grandma', "husband's mother"],
    '公公|gung1 gung1': ['grandpa', 'grandad', "husband's father"],
    '樽|zeon1': ['bottle', 'goblet'],
    '鑊|wok6': ['large iron pot', 'pan', 'a problem'],
    '悶|mun6': ['bored', 'stuffy', 'depressed'],
    '豬|zyu1': ['pig', 'hog', 'fat'],
    '貓|maau1': ['cat'],
    '沙|saa1': ['sand', 'hoarse', 'powder'],
    '雙|soeng1': ['pair', 'double', 'both'],
    '啖|daam6': ['mouthful (a classifier)', 'to eat', 'to taste'],
    '埋|maai4': ['to move closer to', 'to settle (an account)', 'to finish up', 'to bury'],
    '部|bou6': ['classifier for works of literature, films, machines etc', 'part', 'section', 'department'],
    '座|zo6': ['classifier for large immovable objects such as buildings, mountains, bridges etc', 'seat', 'base'],
    '支|zi1': ['classifier for rods such as pens and guns, for army divisions and for songs or compositions', 'branch', 'to support'],
    '焗|guk6': ['to bake', 'stuffy', 'muggy', 'to steam'],
    '約|joek3': ['to make an appointment', 'to invite', 'approximately'],
    # A2's fill: the spoken sense, not a dynasty, a state or a bound form
    '定|ding6': ['surely', 'certainly', 'to fix', 'to decide'],
    '明|ming4': ['to understand', 'bright', '(of meaning) clear'],
    '理|lei5': ['to pay attention to', 'reason', 'logic', 'to manage'],
    '關|gwaan1': ['to close', 'to shut', 'to turn off', 'to concern'],
    '望|mong6': ['to look towards', 'to gaze (into the distance)', 'to hope', 'to expect'],
    '號|hou6': ['(bound form) mark', 'sign', 'to assign a number', '(bound form) name'],
    '齊|cai4': ['all together', 'complete', 'neat', 'even'],
    '越|jyut6': ['the more... the more', 'to exceed', 'to climb over', 'to surpass'],
    '跟|gan1': ['to follow closely', 'to go with', 'with', 'compared with'],
    '抵|dai2': ['to be equal to', 'to make up for', 'to withstand', 'to press against'],
    '底|dai2': ['bottom', 'base', 'end (of the month, year etc)', 'foundation'],
    '易|ji6': ['easy', 'simple', 'liable to', 'to change'],
    '嘩|faa1': ['wow!', 'noisy', 'to shout'],
    '衰|seoi1': ['bad', 'annoying', 'nasty-looking', 'to decline'],
    '團|tyun4': ['group', 'society', 'ball', 'lump'],
    '機|gei1': ['machine', 'engine', 'opportunity', 'mechanism'],
    '老|lou5': ['old (of people)', 'experienced', 'always', 'outdated'],
    '晚|maan5': ['evening', 'night', 'late'],
    '尾|mei5': ['tail', 'end', 'the last', 'classifier for fish'],
    '鬼|gwai2': ['ghost', 'devil', 'terrible', 'clever'],
    '升|sing1': ['to ascend', 'to rise', 'to promote', 'litre'],
    '集|zaap6': ['classifier for sections of a TV series etc: episode', 'to gather', 'to collect', 'a market'],
    '分|fan1': ['to divide', 'minute (unit of time)', 'to separate', 'to distribute'],
    '有啲|jau5 di1': ['a few', 'some', 'slightly', 'somewhat'],
    '溫|wan1': ['to review (a lesson etc)', 'warm', 'lukewarm', 'temperature'],
    '阿|aa3': ['prefix used before monosyllabic names, kinship terms etc to indicate familiarity'],
    '大佬|daai6 lou2': ['elder brother', 'big shot (leading some field or group)', 'godfather (in an organization)'],
    '字典|zi6 din2': ['(coll.) dictionary', 'Chinese character dictionary (containing entries for single characters, contrasted with a 詞典, which has entries for words of one or more characters)'],
    '教書|gaau3 syu1': ['to work as a teacher', 'to teach (in a school)'],
    '親|can1': ['relative', 'parent', 'close', 'in person'],
    '儲|cyu5': ['to save', 'to store', 'to keep in reserve'],
    # B1
    '花紅|faa1 hung4': ['bonus (extra pay, typically given at year-end)', 'gift for a wedding or other happy occasion'],
    '老爺|lou5 je4': ["honorific term for a wife to call her husband's father", '(coll.) maternal grandfather', 'master'],
    '肝|gon1': ['liver'],
    '腎|san6': ['kidney', 'gizzard'],
    '樹林|syu6 lam4': ['woods', 'grove', 'forest'],
    '相機|soeng3 gei1': ['camera (abbr. for 照相機)'],
    '兩點|loeng5 dim2': ["two o'clock", 'Two points'],
    # B2
    '郊區|gaau1 keoi1': ['suburbs', 'outskirts', 'suburban district'],
    '海灣|hoi2 waan1': ['bay', 'gulf'],
    '煙花|jin1 faa1': ['fireworks'],
    # C1
    '小說家|siu2 syut3 gaa1': ['novelist'],
    '方言|fong1 jin4': ['dialect', 'topolect'],
    '頭條|tau4 tiu4': ['lead story (on the news)'],
    # the everyday Cantonese sense, which the dictionaries list late
    '你|nei5': ['you (informal, as opposed to courteous 您)'],
    '好|hou2': ['good', '(before an adjective for exclamatory effect) so', 'all right!', '(after a form of address) hello'],
    '即係|zik1 hai6': ["'which means' or 'which is to say', usually used before explanations", 'same as', 'exactly as'],
    '要|jiu3': ['to want', 'to need', 'will', 'going to (as future auxiliary)'],
    '噉樣|gam2 joeng2': ['that way', 'in that case', 'for that reason', 'then'],
    '點|dim2': ['to order (food etc)', 'to select', 'to touch briefly', 'to light (a fire, a lamp etc)'],
    '仔|zai2': ['son', 'child', 'young male', 'small thing'],
    '邊|bin1': ['which', 'where', 'side', 'edge'],
    '人哋|jan4 dei6': ['other people', 'everybody else', 'they'],
    '衫|saam1': ['shirt', 'garment', 'gown'],
    '日|jat6': ['day', 'sun', 'day of the month', 'daytime'],
    '東|dung1': ['east', 'host (i.e. sitting on east side of guest)', 'landlord'],
    '雞|gai1': ['chicken', 'fowl'],
    '樓|lau2': ['flat', 'apartment', 'floor', 'storied building'],
    '隔離|gaak3 lei4': ['Neighbour', 'to separate', 'to isolate'],
    '出面|ceot1 min2': ['outside', 'to appear personally', 'to step in'],
    '工作|gung1 zok3': ['work', 'job', 'to work', 'task'],
    '叉|caa1': ['fork', 'to pick up with a fork', 'prong', 'cross'],
    '姓|sing3': ['family name', 'a clan name'],
    '明白|ming4 baak6': ['to understand', 'to realize', 'clear', 'obvious'],
    '太|taai3': ['too (much)', 'very', 'extremely'],
    '對|deoi3': ['right', 'correct', 'towards', 'to face'],
    '連|lin4': ['(used with 也, 都 etc) even', 'including', 'to link', 'together with'],
    '鼻|bei6': ['nose'],
    '燈|dang1': ['lamp', 'light', 'lantern'],
    '蛋|daan2': ['egg', 'oval-shaped thing'],
    '攞|lo2': ['to get', 'to fetch', 'to take', 'to ask for'],
    '上面|soeng6 min6': ['on top of', 'above-mentioned'],
    '話|waa6': ['to speak', 'to tell', 'to talk', 'spoken words'],
    '唔|m4': ['not', "don't", "doesn't"],
    '同|tung4': ['with', 'together', 'same', 'alike'],
    '讀|duk6': ['to read', 'to read out', 'to study', 'to attend school'],
    '落|lok6': ['to fall or drop', 'to lower', 'to put in', 'to write down'],
    '仲|zung6': ['still (doing something)', 'even more', 'in addition'],
    '比|bei2': ['to compare', '(particle used for comparison and "-er than")', 'ratio'],
    '涼|loeng4': ['cool', 'cold', 'to cool down'],
    '水|seoi2': ['water', 'liquid', 'beverage'],
    '雲|wan4': ['cloud'],
    '貴|gwai3': ['expensive', 'costly', 'precious', 'noble'],
    '細|sai3': ['small', 'little', 'tiny', 'fine'],
    '帶|daai3': ['to bring', 'to take along', 'to carry', 'belt'],
    '著|zoek3': ['to wear (clothes)', 'to catch fire', '(coll.) to fall asleep'],
    '企|kei5': ['to stand', 'to stand on tiptoe'],
    '搭|daap3': ['to take (boat, train)', 'to put up', 'to connect'],
    '除|ceoi4': ['take off', 'to remove', 'except', 'to divide'],
    '喊|haam3': ['to cry', 'to yell', 'to shout'],
    '走|zau2': ['to leave', 'to go away', 'to run away', 'to walk'],
    '啱|aam1': ['correct', 'suitable', 'to suit sb', 'just now'],
    '熱|jit6': ['hot (of weather)', 'heat', 'to heat up'],
    '凍|dung3': ['to feel very cold', '(of beverage) Iced', 'to freeze'],
    '答|daap3': ['to answer', 'to reply', 'to respond'],
    '跑|paau2': ['to run', 'to run away', 'to escape'],
    '房|fong2': ['room', 'house'],
    '禮拜|lai5 baai3': ['(coll.) week', '(coll.) Sunday', 'to attend a religious service'],
    '牙|ngaa4': ['tooth', 'ivory'],
    '同學|tung4 hok6': ['classmate', 'fellow student', 'to study at the same school'],
    '地方|dei6 fong1': ['place', 'region', 'local'],
    '鐘|zung1': ['clock', 'a (large) bell', 'amount of time'],
    '西|sai1': ['west', 'western', 'the West'],
    '名|meng2': ['name', 'famous', 'place (e.g. among winners)'],
    '魚|jyu2': ['fish', 'to fish'],
    '病|beng6': ['illness', 'disease', 'to fall ill'],
    '痛|tung3': ['ache', 'pain', 'sorrow'],
    '女|neoi5': ['woman', 'daughter', 'female', 'lady'],
    '手|sau2': ['hand', 'person skilled in certain types of work'],
    '識|sik1': ['to know', 'knowledge'],
}


def semis(g):
    """Split a gloss on '; ' outside brackets: '(phrase; adverb) no' is one item."""
    out, depth, cur = [], 0, ''
    i = 0
    while i < len(g):
        ch = g[i]
        depth += ch in '(['
        depth -= ch in ')]'
        if depth <= 0 and g.startswith('; ', i):
            out.append(cur)
            cur, i = '', i + 2
            continue
        cur += ch
        i += 1
    return out + [cur]


def gloss_list(e):
    def split(gs):
        out = []
        for g in gs:
            for p in semis(g):
                p = LABEL_RX.sub('', TAIL_RX.sub('', p)).strip(' .;,')
                if p and not JUNK.search(p):
                    out.append(p)
        return out
    good, weak = split(e.get('g', [])), split(e.get('w', []))
    # a TAIWANESE sense ("(Tw) to detest" under 感冒) is shown only when the word has no other:
    # 幼稚園 is CC-CEDICT's "kindergarten (Tw)", and Hong Kong says it too
    tw = lambda xs: [x for x in xs if '(Tw)' not in x] or [re.sub(r'\s*\(Tw\)\s*', ' ', x).strip() for x in xs]
    good, weak = tw(good), tw(weak)
    seen, out = set(), []
    for p in good or weak:
        k = p.lower()
        if k not in seen:
            seen.add(k)
            out.append(p)
    return out


def pos_of(row, e, freq):
    tags = ((freq.get(row['word']) or {}).get('pos') or {}).get(row['jp']) or {}
    if tags:
        t = sorted(tags.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
        if t in POS:
            return POS[t]
    p = (e or {}).get('pos', '')
    return CANTO_POS.get(p, '')


SHOW_MISSES = []


def english(row, e, freq):
    key = row['key']
    if row.get('hand'):
        gl = HAND[row['word']]['g']
        pos = HAND[row['word']].get('pos', '')
    else:
        gl = gloss_list(e)
        if key in SHOW:
            missing = [g for g in SHOW[key] if g not in gl]
            if missing:
                SHOW_MISSES.append(f'{key}: {missing} (has {gl})')
            gl = [g for g in SHOW[key] if g in gl]
        pos = pos_of(row, e, freq)
    gl = gl[:4]
    if not gl:
        return '', 0
    body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
            '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
    head = f'<div class="uc-pos">{E(pos)}</div>' if pos else ''
    return f'<div class="uc-sense">{head}{body}</div>', len(gl)


def mark(text, spans):
    out, pos = [], 0
    for a, b in sorted(spans):
        if a < pos:
            continue
        out.append(E(text[pos:a]))
        out.append(f'<b>{E(text[a:b])}</b>')
        pos = b
    out.append(E(text[pos:]))
    return ''.join(out)


def examples_html(exs):
    out = []
    for yue, en, rom, spans in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(yue)}"></span>{mark(yue, spans)}</div>'
                   + (f'<div class="uc-exr">{E(rom)}</div>' if rom else '') +
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, freq, exs):
    cards, entries = [], []
    for row in rows:
        e = None if row.get('hand') else next(x for x in lex[row['word']] if x['j'] == row['jp'])
        eng, ng = english(row, e, freq)
        if not eng:
            print('  no English, skipped:', row['key'])
            continue
        simp = '' if row.get('hand') else (e.get('s') or '')
        if simp == row['word']:
            simp = ''
        ex = exs.get(row['key'], [])
        cards.append({'sub': '', 'fields': {
            'Cantonese': E(row['word']),
            'Jyutping': E(row['jp']),
            'Simplified': E(simp),
            'Word': E(row['word']),
            'English': eng,
            'Examples': examples_html(ex),
        }})
        entries.append({'key': row['key'], 'word': row['word'], 'jp': row['jp'], 'source': row['source'],
                        'topic': row.get('topic', ''), 'examples': len(ex), 'hand': bool(row.get('hand')),
                        'simp': bool(simp), 'rom': sum(1 for x in ex if x[2])})
    return cards, entries


WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
       'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    hand = sum(1 for e in entries if e['hand'])
    SC = SCOPE[LEVEL]
    EX_NOTE = (f'Example sentences come with {n - ex0} of the {n} words, three apiece for {ex3} of '
               "them — Tatoeba's Cantonese is small, so many words have none — with the word picked out "
               'in colour, a speaker beside each sentence, and the Jyutping beneath it where every word '
               "in the sentence carries a reading the dictionaries confirm")
    return (
        "Both study directions in one deck: Cantonese → English (see the Cantonese, recall the "
        "meaning) and English → Cantonese (see an English meaning, recall the Cantonese). Each "
        "direction is a card of its own with its own schedule, so recognising a word and producing "
        f"it are learnt separately. {n} words for {WHO[LEVEL]}, aligned to {LEVEL.upper()} of the "
        "Common European Framework of Reference, whose global descriptor begins "
        f"'{SC['quote']}' — a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "THIS IS SPOKEN HONG KONG CANTONESE, the language people talk in, not the written Chinese "
        "Hong Kong reads and writes, which is close to Mandarin: 佢 for he or she, 喺 for at, 嘢 for "
        "a thing, 睇 to look, and the sentence-final particles that carry a Cantonese speaker's "
        "tone of voice. WHERE THESE WORDS COME FROM, since it matters: no examination publishes a "
        "graded word list for Cantonese, so this deck is not any examination's vocabulary and does "
        + (f"not claim to be. It is assembled from two things that can be stated. {from_inv} of the "
           f"{n} come from a vocabulary written for the level's scope — {SC['topics']} — and the other "
           f"{n - from_inv} are the commonest remaining words of spoken Cantonese, counted in the Hong "
           "Kong Cantonese Corpus (recorded conversations and radio, 1997–98). The cards are dealt by "
           "how often the words are heard there and in Tatoeba's Cantonese sentences, so the commonest "
           "come first" + (", after a first handful of greetings. " if LEVEL == 'a1' else ". ")
           if from_inv < n else
           f"not claim to be. All {n} come from a vocabulary written for the level's scope — "
           f"{SC['topics']}: by this level the Hong Kong Cantonese Corpus (recorded conversations and "
           "radio, 1997–98), which supplies the commonest words at the levels below, has none left "
           "that they have not taught. The cards are dealt by how often the words are heard in that "
           "corpus and in Tatoeba's Cantonese sentences, and the words neither has come last. ") +
        (f"THIS LEVEL IS SHORT of the {TARGET[LEVEL]:,} words planned for it: the spoken corpus has no "
         "more words that the levels below have not taught, and the rest of the level is the vocabulary "
         "written for its topics, so the deck stops where the sources do rather than take words from "
         "written Chinese or from a machine's word count. " if n < TARGET[LEVEL] else "") +
        "Every headword is printed in the traditional characters Hong Kong uses, with the "
        "simplified form beneath where it differs, and in Jyutping, the Linguistic Society of Hong "
        "Kong's romanisation, which ends every syllable with its TONE as a digit: 1 high, 2 high "
        "rising, 3 mid, 4 low falling, 5 low rising, 6 low — because a Cantonese syllable said on "
        "the wrong tone is a different word (si1 poem, si4 time, si6 yes). The Cantonese Jyutping "
        "and Tones deck, the first in this collection, teaches the sounds and the six tones. The "
        "part of speech is the one the corpus's annotators gave the word, and the classifiers a "
        "noun is counted with are taught as words of their own rather than printed on the noun. "
        + EX_NOTE + ". " +
        (f"{hand} words the dictionaries lack carry a meaning written for this deck, with the "
         "corpus's own Jyutping. " if hand else "") +
        "Sources. Level: the Common European Framework of Reference (Council of Europe), global "
        "scale. Meanings: CC-CEDICT (MDBG, CC BY-SA 4.0) and CC-Canto (Pleco, CC BY-SA 3.0). "
        "Jyutping: CC-Canto and its Cantonese readings of CC-CEDICT (Pleco, CC BY-SA 3.0), and the "
        "Hong Kong Cantonese Corpus. Frequency and parts of speech: the Hong Kong Cantonese Corpus, "
        "HKCanCor (Luke Kang Kwong; CC BY 4.0, as distributed with PyCantonese), and Tatoeba. "
        "Example sentences and their Jyutping: Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    freq = json.load(open('freq.json', encoding='utf-8'))
    exs = json.load(open(f('examples.json'), encoding='utf-8'))
    cards, entries = build(rows, lex, freq, exs)
    if SHOW_MISSES:
        raise SystemExit('SHOW names glosses the dictionaries do not hold:\n  ' + '\n  '.join(SHOW_MISSES))
    DECK = DECK_IDS[LEVEL]
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = TYPE_ID
    n = len(cards)
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': f'{n} words · both directions, as two cards per word',
        'desc': desc(entries, n), 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['cantonese', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Cantonese vocabulary', 'speechLang': 'zh-HK',
            'fields': FIELDS,
            'cards': [
                {'name': 'Cantonese → English', 'front': FRONT_YUE, 'back': BACK_YUE},
                {'name': 'English → Cantonese', 'front': FRONT_EN, 'back': BACK_EN},
            ],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}

    # EVERY ENGLISH SIDE UNIQUE, LAST OF ALL -- the shelf-wide pass (`.claude/dedupe-glosses.py`).
    import importlib.util as ilu
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py')
    spec = ilu.spec_from_file_location('dedupe_glosses', p)
    dg = ilu.module_from_spec(spec)
    spec.loader.exec_module(dg)
    st = dg.dedupe(deck, 'Cantonese')
    if st['groups']:
        print('  labelled %d notes in %d groups that shared an English side'
              % (st['labelled'], st['groups']))

    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                       '..', '..', 'decks', DECK_FILES[LEVEL]))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out)
    print(f'  notes {n} = cards {n * 2} | bytes {os.path.getsize(out)}')
    json.dump(entries, open(f('entries.json'), 'w', encoding='utf-8'), ensure_ascii=False)


if __name__ == '__main__':
    main()
