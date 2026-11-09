#!/usr/bin/env python3
"""The parts of a Korean card that are read out of the sources: meanings, forms, hanja rows and sentences."""
import html, re
from collections import defaultdict
from ko import load, is_hanja
from resolve import ok_sense, POS_NAME, pointer_english

E = lambda s: html.escape(s, quote=True)
MAX_SENSES = 5
HANJA = load('hanja.json')


# ------------------------------------------------------------------------------------------ meanings
HANJA_HEAD = re.compile(r'^[㐀-鿿豈-﫿/]+: ')
# Wiktionary's usage notes ride inside a few glosses; a card shows the meaning
NOTE_TAIL = re.compile(r'\s*\((?:see Usage notes|see usage notes)\)')


def clean(g):
    g = pointer_english(g) or g
    g = HANJA_HEAD.sub('', g.strip())          # 隻: (counter) boat -> (counter) boat
    g = NOTE_TAIL.sub('', g)
    return g.split('\n')[0].strip()


def senses(entries, only=None):
    """[(pos name, [gloss])] from the chosen entries; `only` keeps those sense indices (one entry)."""
    out = []
    for e in entries:
        gl = []
        for k, s in enumerate(e['s']):
            if only is not None and k not in only:
                continue
            if not ok_sense(s):
                continue
            g = clean(s['g'])
            if g and g not in gl:
                gl.append(g)
        if not gl:
            continue
        pos = POS_NAME.get(e['pos'], e['pos'])
        prev = next((x for x in out if x[0] == pos), None)
        if prev:
            prev[1].extend(x for x in gl if x not in prev[1])
        else:
            out.append((pos, gl))
    return [(p, g[:MAX_SENSES]) for p, g in out]


def english_html(ss):
    parts = []
    for pos, gl in ss:
        body = ('<div class="uc-gl">%s</div>' % E(gl[0]) if len(gl) == 1 else
                '<ol class="uc-gls">%s</ol>' % ''.join('<li>%s</li>' % E(g) for g in gl))
        parts.append('<div class="uc-sense"><div class="uc-pos">%s</div>%s</div>' % (E(pos), body))
    return ''.join(parts)


# ------------------------------------------------------------------------------------------ forms
FORM_LABELS = [('polite', 'polite'), ('past', 'past'), ('formal', 'formal')]


def forms_html(entries):
    """A verb's or adjective's polite present, polite past and formal present, from Wiktionary's own table."""
    e = next((x for x in entries if x['pos'] in ('verb', 'adj') and x.get('fl')), None)
    if not e:
        return ''
    cells = [(lab, e['fl'][k]) for k, lab in FORM_LABELS if k in e['fl']]
    if not cells:
        return ''
    return '<div class="uc-forms">%s</div>' % ''.join(
        '<span class="uc-fi"><span class="uc-fl">%s</span><b>%s</b></span>' % (lab, E(f)) for lab, f in cells)


# ------------------------------------------------------------------------------------------ hanja
def hanja_def(ch):
    d = HANJA.get(ch, {}).get('d', '')
    return '; '.join(d.split('; ')[:2])


def hanja_html(hanja, others):
    """One row per hanja character: the character, Unihan's English, the eumhun, other words of the list."""
    rows = []
    seen = set()
    for ch in hanja:
        if not is_hanja(ch) or ch in seen:
            continue
        seen.add(ch)
        d = hanja_def(ch)
        eum = HANJA.get(ch, {}).get('e', '')
        if not d and not eum:
            continue
        r = '<div class="uc-kj"><div class="uc-kjc">%s</div><div class="uc-kjm">%s' % (E(ch), E(d))
        if eum:
            r += '<div class="uc-kjr"><span class="uc-kjl">eumhun</span>%s</div>' % E(eum)
        o = others.get(ch, [])
        if o:
            r += '<div class="uc-kjp"><span class="uc-kjl">also in</span>%s</div>' % ' · '.join(
                '<b>%s</b> %s' % (E(w), E(g)) for w, g in o)
        rows.append(r + '</div></div>')
    return ''.join(rows)


# ------------------------------------------------------------------------------------------ sentences
V_TAGS = ('VV', 'VA', 'VX', 'VCP', 'VCN')
N_TAGS = ('NNG', 'NNP', 'NNB', 'NR', 'NP', 'XSN', 'XPN', 'XR')


class Sentences:
    """Tatoeba's Korean sentences with an English translation, indexed by what Kiwi found in them.

    A VERB OR ADJECTIVE is found by its lemma (Kiwi gives 듣 for 들어요, so 듣다 finds it), or -- for one Kiwi
    splits, 가까워지다 being 가깝 + 어 + 지 -- by a whole word of the sentence that is one of the cells of
    Wiktionary's conjugation table for it.  ANYTHING ELSE is found as one token or a run of tokens inside one
    word of the sentence (눈 + 물 is 눈물), never as a substring: 가 is not found in 가방."""

    def __init__(self):
        self.rows = load('tatoeba.json')
        self.lemma = defaultdict(list)       # lemma -> [(row index, start, end)]
        self.surface = defaultdict(list)     # whole word of the sentence (punctuation stripped) -> [...]
        for i, r in enumerate(self.rows):
            t = r['t']
            for k, (form, tag, a, b) in enumerate(t):
                if tag.split('-')[0] in V_TAGS:
                    self.lemma[form + '다'].append((i, a, self._word_end(r['ko'], b)))
                # runs of up to three tokens inside one word
                for n in (1, 2, 3):
                    if k + n > len(t):
                        break
                    run = t[k:k + n]
                    if any(run[j + 1][2] != run[j][3] for j in range(n - 1)):
                        break
                    if all(x[1].split('-')[0] not in V_TAGS for x in run):
                        self.lemma[''.join(x[0] for x in run)].append((i, run[0][2], run[-1][3]))
            for m in re.finditer(r'\S+', r['ko']):
                w = m.group().strip('.,!?"\'“”‘’()…~')
                if w:
                    a = m.start() + m.group().index(w)
                    self.surface[w].append((i, a, a + len(w)))

    @staticmethod
    def _word_end(text, b):
        m = re.match(r'[^\s.,!?"\'“”‘’()…~]*', text[b:])
        return b + len(m.group())

    def find(self, word, forms=()):
        hits = list(self.lemma.get(word, ()))
        if not hits and forms:
            for f in forms:
                hits += self.surface.get(f, [])
        return hits

    def pick(self, word, forms=(), per=3, used_en=None):
        out, seen_ko, seen_en = [], set(), set()
        cands = []
        for i, a, b in self.find(word, forms):
            r = self.rows[i]
            nw = len(r['ko'].split())
            if not 2 <= nw <= 10:
                continue
            ratio = len(r['en']) / max(1, len(r['ko']))
            if not 0.8 <= ratio <= 6:
                continue
            cands.append((len(r['ko']), r['id'], i, a, b))
        for _l, _id, i, a, b in sorted(cands):
            r = self.rows[i]
            if r['ko'] in seen_ko or r['en'] in seen_en:
                continue
            seen_ko.add(r['ko']); seen_en.add(r['en'])
            out.append({'ko': r['ko'], 'en': r['en'], 'a': a, 'b': b})
            if len(out) == per:
                break
        return out


def wikt_examples(entries, only=None, per=3):
    """Wiktionary's own usage examples for the senses the card teaches, each with its translation."""
    out = []
    for e in entries:
        for k, s in enumerate(e['s']):
            if (only is not None and k not in only) or not ok_sense(s):
                continue
            for x in s['ex']:
                if len(out) == per:
                    return out
                t, en = x['t'].strip(), (x['e'] or '').strip()
                if not t or not en or '\n' in t or len(t) > 80 or any(o['ko'] == t for o in out):
                    continue
                b = x['b'][0] if x['b'] else [0, 0]
                out.append({'ko': t, 'en': en, 'a': b[0], 'b': b[1]})
    return out


def examples_html(exs):
    out = []
    for x in exs:
        t, a, b = x['ko'], x['a'], x['b']
        body = E(t[:a]) + '<b>' + E(t[a:b]) + '</b>' + E(t[b:]) if b > a else E(t)
        out.append('<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="%s"></span>%s</div>'
                   '<div class="uc-exe">%s</div></div>' % (E(t), body, E(x['en'])))
    return ''.join(out)
