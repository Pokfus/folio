#!/usr/bin/env python3
"""The Korean phrases deck:  python3 build_phrases.py   (after the stage decks, whose words scope the idioms)

Three subdecks, as the Turkish deck has them:
  PHRASES   the everyday formulas English Wiktionary files as phrases (안녕하세요, 잘 먹겠습니다), picked by hand
            from its list -- slang, dialect, profanity and forum jargon left out (`PHRASES` below);
  IDIOMS    Wiktionary's idiomatic entries, then KRDict's 관용구 (idioms);
  PROVERBS  Wiktionary's proverbs, then KRDict's 속담 (proverbs).
KRDict's idioms and proverbs are many (2,227 and 657); only those every word of which is a word of the stage
decks are taken -- an expression whose words a learner has not met is not yet one they can learn -- ordered by
how common those words are (the mean of their NIKL ranks), and capped (`CAP`).  An expression KRDict writes with
optional or alternative parts ("안면(을) 바꾸다", "[뒤로 넘어져도]") is left out: its card would have no one form.

A KRDict entry's meaning is its English definition; the English equivalent it gives, often the words rendered
literally ("fasten the first button"), stands in italics beneath.
"""
import html, json, os, re
from ko import DECKS, STAMP, COLOR, load
from deck_type import TYPE_ID, type_def
from resolve import ok_sense, POS_NAME
import words as W

FILE = 'Korean-Phrases-and-Expressions.folio-deck.json'
CAP = {'Idioms': 260, 'Proverbs': 120}
PHRASES = ['안녕하세요', '안녕하십니까', '안녕히 가세요', '안녕히 계세요', '만나서 반갑습니다', '처음 뵙겠습니다',
           '어서 오세요', '어서 오십시오', '어서 와', '잘 가', '잘 있어', '살펴 가세요', '살펴 계세요', '어떻게 지내세요',
           '누구세요', '이름이 뭐예요', '저는 한국 사람이에요', '이게 뭐예요', '물론입니다', '사랑해', '잘 먹겠습니다',
           '잘 먹었습니다', '맛있게 드세요', '잘 자', '잘 자요', '잘 주무세요', '비가 와요', '새해 복 많이 받으세요',
           '메리 크리스마스', '삼가 고인의 명복을 빕니다', '영어를 못합니다', '한국어를 못합니다',
           '몇 개의 언어를 할 줄 아나요', '어떤 언어를 할 줄 아나요', '인사드려요', '다름이 아니라', '그건 그렇고',
           '그럼에도 불구하고', '예나 지금이나', '이상 무', '말을 놓다']
# Wiktionary's idioms and proverbs left out: dialect spellings, a pointer for a meaning, hanja, alternative forms
SKIP = {'둏은 나무부터 띡히구 못 쓰는 낭그느 깉는다', '어시 없이는 살아두 쉐 없이는 못 산다', '갑과 을', '無我夢中',
        '교하질쉬', '칼을 빼들다', '갗에서 좀 난다', '광에서 인심 난다', '안 봐도 블루레이', '아이와 늙은이는 괴는 데로 간다'}


def wikt():
    D = load('dict.json')
    out = []
    for w in load('phrases.json'):
        if w in SKIP:
            continue
        es = [e for e in D[w] if e['pos'] in ('phrase', 'proverb') or ' ' in w]
        ss = W.senses(es)
        if not ss:
            continue
        idi = any('idiomatic' in s['tags'] for e in es for s in e['s'] if ok_sense(s))
        if w in PHRASES:
            sub = 'Phrases'
        elif any(e['pos'] == 'proverb' for e in es):
            sub = 'Proverbs'
        elif idi:
            sub = 'Idioms'
        else:
            continue
        label = {'Phrases': 'phrase', 'Idioms': 'idiom', 'Proverbs': 'proverb'}[sub]
        ss = [(label, g) for _p, g in ss][:1] + [(label, g) for _p, g in ss][1:]
        merged = []
        for p, g in ss:
            if merged and merged[-1][0] == p:
                merged[-1][1].extend(x for x in g if x not in merged[-1][1])
            else:
                merged.append((p, list(g)))
        out.append({'w': w, 'sub': sub, 'English': W.english_html([(p, g[:W.MAX_SENSES]) for p, g in merged]),
                    'r': next((e.get('r') for e in es if e.get('r')), ''), 'ex': W.wikt_examples(es)})
    return out


def stage_words():
    rank = {}
    for st in 'ABC':
        for i, c in enumerate(json.load(open(os.path.join(DECKS, 'Korean-Stage-%s.folio-deck.json' % st),
                                            encoding='utf-8'))['cards']):
            rank.setdefault(html.unescape(c['fields']['Word']), (st, i))
    return rank


def krdict(have, rank):
    from kiwipiepy import Kiwi
    kiwi = Kiwi()
    out = {'Idioms': [], 'Proverbs': []}
    for x in load('krdict-phrases.json'):
        w = x['w'].strip()
        if w in have or w in rank or re.search(r'[\[\]()（）/]', w) or not x['d'] or not x['d'][0]:
            continue
        sub = 'Idioms' if x['kind'] == '관용구' else 'Proverbs'
        lem, ok = [], True
        for t in kiwi.tokenize(w):
            tag = t.tag.split('-')[0]
            if tag in ('VV', 'VA', 'VX'):
                lem.append(t.form + '다')
            elif tag in ('NNG', 'NNP', 'NNB', 'NP', 'NR', 'MAG', 'MM'):
                lem.append(t.form)
        if not lem:
            continue
        rs = []
        for l in lem:
            if l not in rank:
                ok = False
                break
            st, i = rank[l]
            rs.append({'A': 0, 'B': 1000, 'C': 4000}[st] + i)
        if not ok:
            continue
        out[sub].append((sum(rs) / len(rs), w, x))
    res = []
    for sub, L in out.items():
        for _m, w, x in sorted(L, key=lambda t: (t[0], t[1]))[:CAP[sub]]:
            d = x['d'][0]
            lit = x['s'][0] if x['s'] else ''
            body = '<div class="uc-gl">%s</div>' % W.E(d)
            if lit:
                body += '<div class="uc-lit">“%s”</div>' % W.E(lit)
            res.append({'w': w, 'sub': sub, 'r': '', 'ex': [],
                        'English': '<div class="uc-sense"><div class="uc-pos">%s</div>%s</div>' % (
                            'idiom' if sub == 'Idioms' else 'proverb', body)})
    return res


def main():
    items = wikt()
    have = {x['w'] for x in items}
    rank = stage_words()
    # nothing here is a headword of a stage deck (the description says so; check-korean.js asserts it)
    items = [x for x in items if x['w'] not in rank]
    items += krdict(have, rank)
    order = {'Phrases': 0, 'Idioms': 1, 'Proverbs': 2}
    pos_in_list = {w: i for i, w in enumerate(PHRASES)}
    items.sort(key=lambda x: (order[x['sub']], pos_in_list.get(x['w'], 0)))
    S = W.Sentences()
    cards, ex0 = [], 0
    for x in items:
        exs = list(x['ex'])
        # A CORPUS SENTENCE IS SOUGHT FOR A PHRASE ONLY: a formula is fixed text, but an idiom's words also occur
        # literally -- 말이 있다 "to be talked about" found "The boy has a horse"
        if len(exs) < 3 and x['sub'] == 'Phrases':
            core = re.sub(r'다$', '', x['w']) if x['w'].endswith('다') else x['w']
            for r in S.rows:
                if len(exs) == 3:
                    break
                i = r['ko'].find(core)
                if i >= 0 and len(r['ko'].split()) <= 12 and all(r['ko'] != e['ko'] for e in exs):
                    j = i + len(core)
                    m = re.match(r'[^\s.,!?"]*', r['ko'][j:])
                    exs.append({'ko': r['ko'], 'en': r['en'], 'a': i, 'b': j + len(m.group())})
        ex0 += not exs
        cards.append({'id': 'u_korphr_%d' % (len(cards) + 1), 'num': str(len(cards) + 1), 'type': TYPE_ID,
                      'sub': x['sub'], 'fields': {
                          'Word': W.E(x['w']), 'Cue': '', 'Roman': W.E(x['r']), 'Also': '',
                          'English': x['English'], 'Forms': '', 'Hanja': '', 'Examples': W.examples_html(exs)}})
    from collections import Counter
    c = Counter(card['sub'] for card in cards)
    n = len(cards)
    nk = sum(1 for x in items if not x['r'] and x['sub'] != 'Phrases')
    desc = (
        "%s Korean set phrases, idioms and proverbs, in three subdecks: %s everyday phrases, %s idioms and %s "
        "proverbs. Both study directions come as two cards of one expression — Korean → English and English → "
        "Korean — each with a schedule of its own. A companion to the stage decks and not one of them: nothing here is "
        "a headword of Stage A, B or C. — The PHRASES are everyday formulas from English Wiktionary's list (greetings, "
        "thanks, the words before and after a meal), picked by hand with its slang, dialect and profanity left out. "
        "The IDIOMS and PROVERBS are English Wiktionary's, then those of KRDict, the National Institute of the Korean "
        "Language's dictionary for learners, taking only an expression every word of which is taught in the stage "
        "decks, the commonest words first. A KRDict expression's meaning is KRDict's English definition, with its "
        "English rendering — often word for word — in italics beneath; those %s carry no romanization, KRDict giving "
        "none for an expression. %s of the %s have example sentences. — Phrases, the Wiktionary idioms and proverbs, "
        "their meanings and romanization: English Wiktionary via kaikki.org (CC BY-SA 4.0). The other idioms and "
        "proverbs: KRDict (한국어기초사전, NIKL, CC BY-SA 2.0 KR). Example sentences: Tatoeba (CC BY 2.0 FR) and "
        "Wiktionary." % (format(n, ','), c['Phrases'], c['Idioms'], c['Proverbs'], format(nk, ','),
                         format(n - ex0, ','), format(n, ',')))
    meta = {'id': 'korphr', 'title': 'Korean Phrases and Expressions',
            'subtitle': '%s expressions · %s everyday, %s idioms, %s proverbs · both directions' % (
                format(n, ','), c['Phrases'], c['Idioms'], c['Proverbs']),
            'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
            'tags': ['korean', '한국어', 'phrases', 'idioms', 'proverbs', '관용구', '속담', 'expressions'],
            'glossMode': 'site', 'types': {TYPE_ID: type_def()}, 'version': 1, 'createdAt': STAMP,
            'updatedAt': STAMP, 'forkedFrom': None}
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    import importlib.util as iu
    sp = iu.spec_from_file_location('dg', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py'))
    dg = iu.module_from_spec(sp); sp.loader.exec_module(dg)
    s = dg.dedupe(deck, 'Korean')
    if s['groups']:
        print('  labelled %d notes in %d groups that shared an English side' % (s['labelled'], s['groups']))
    out = os.path.join(DECKS, FILE)
    json.dump(deck, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
    print('  wrote %s: %d notes | %s | no examples %d | %d bytes' % (FILE, n, dict(c), ex0, os.path.getsize(out)))


if __name__ == '__main__':
    main()
