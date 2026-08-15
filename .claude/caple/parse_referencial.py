#!/usr/bin/env python3
"""Turn this level's Referencial Camões PLE inventory into candidate lemmas.

WHERE THE WORDS COME FROM.  CAPLE publishes no word list -- checked page by
page: the ACESSO page carries no PDF at all, the FAQ never mentions vocabulary,
and the site's one PDF is a 126-page brochure of page images that yields a
single character of text.  What CAPLE's own Recursos page DOES link to is the
Referencial Camões PLE, the Instituto Camões' reference-level description for
Portuguese, and that is what this reads.  It is the same relationship the DELE
pipeline has with the Instituto Cervantes' Plan curricular -- the body that
describes the language for the exam board, rather than the exam board itself --
with the difference that here the exam board points at it.

WHAT IS TAKEN AND WHAT IS NOT.  The inventory of words is the level's scope and
that is what is read.  The Referencial's authored prose -- its worked example
sentences, its explanations of usage, its grammatical commentary -- is NOT
reproduced anywhere in the deck; the meanings come from Wiktionary and the
example sentences from Tatoeba.  That is the line the Goethe pipeline already
draws with the Goethe-Institut's Wortliste, and it is drawn the same way here.

THE CELLS ARE NOT A WORD LIST, which is the whole difficulty.  The Noções
inventory lists NOTIONS, so a bullet may be any of:

    ser                                 a word
    com, sem                            two words on one bullet
    pequeno(a)                           a word with its feminine ending
    vermelho/encarnado                   two words that mean the same thing
    (falar) alto/baixo                   a frame with the vocabulary inside it
    (sala de) aula                       a word with an optional qualifier
    segunda(-feira)                      a word whose hyphenated half is optional
    metro (m), quilómetro (km)           words with their symbols
    nomes dos meses: — janeiro — ...     a labelled sublist, which IS vocabulary
    números cardinais: — um a cem        a labelled RANGE, which is not
    estar (pres. ind.) a + infinitivo    a grammatical frame, not vocabulary
    A Cláudia come o chocolate.          a worked example sentence

Everything here is about separating those.  It errs on the side of ADMITTING a
candidate, because `select.py` validates every one of them against Wiktionary
and orders what survives by frequency -- a word that is not a word simply finds
no record and drops out, where a word wrongly rejected here can never come back.
"""
import html as _html
import json
import re

from caple_level import LEVEL, f as lvlf

LEV = LEVEL.upper()
SRC = 'referencial.html'
h = open(SRC, encoding='utf-8', errors='replace').read()


def sections(kind):
    """The leaf content blocks of one section of this level, with their titles.

    The page is a nest of Bootstrap accordions: every node carries
    `id="nivel<LEVEL>-<kind>-<path>"` and a leaf holds one padded div of
    bullets.  Reading the ids rather than the headings is what keeps A1 apart
    from A2 -- the whole document is one file and the six levels are siblings
    in it, so a text search finds all six at once.
    """
    titles = {m.group(1): _html.unescape(re.sub(r'\s+', ' ', m.group(2))).strip()
              for m in re.finditer(
                  r'href="#(nivel%s-%s[^"]*)"[^>]*>(.*?)</a>' % (LEV, kind), h, re.S)}
    out = []
    for m in re.finditer(
            r'id="(nivel%s-%s[^"]*)"[^>]*>\s*<div class="accordion-inner">\s*'
            r'<div style="padding[^"]*">(.*?)</div>' % (LEV, kind), h, re.S):
        bid, body = m.group(1), m.group(2)
        txt = _html.unescape(re.sub(r'<[^>]+>', ' ', body))
        out.append((bid, titles.get(bid, ''), re.sub(r'\s+', ' ', txt).strip()))
    return out


# ------------------------------------------------------------------ cleaning
CAP = r'[A-ZÁÂÃÀÉÊÍÓÔÕÚÇ]'

# A bullet that is a grammatical frame rather than vocabulary.  Each of these is
# metalanguage: a tense named in an abbreviation, a slot marked with `+`, or a
# reference to another part of the document.
FRAME_RX = re.compile(
    r'\b(pres\.|ind\.|conj\.|inf\.|part\.|pret\.|imp\.|vd\.|cf\.)|'
    r'\+\s*(infinitivo|nome|adjetivo|verbo)|'
    r'\b(infinitivo|gerúndio|particípio|indicativo|conjuntivo|imperativo|'
    r'singular|plural|masculino|feminino|invariáve|variação|concordância|'
    r'forma[s]?\b|uso\s*/\s*valor|analítico|superlativo absoluto)\b', re.I)

# A label that introduces a sublist and is not itself a word.  The sublist after
# it IS vocabulary and is kept -- `nomes dos meses: — janeiro — fevereiro` gives
# twelve real words -- so only the label is dropped.
LABEL_RX = re.compile(
    r'^(nomes?|tipos?|níveis|graus|estabelecimentos|divisões|peças|utensílios|'
    r'equipamentos|espaços|características|comodidades|filiação|estado civil|'
    r'meios|geografia|adjetivos|formas|pesos|números|eletrodomésticos)\b', re.I)

# A sublist item that is a RANGE or a description rather than a word.
NOTWORD_RX = re.compile(r'\b(a cem|a mil|etc)\b|^\W*$|\d')


def strip_examples(t):
    """Cut a worked example sentence off the end of a bullet.

    An example starts on a capitalised word and carries sentence punctuation.
    A bullet that merely opens on a capital, or carries a capitalised proper
    noun with no sentence after it, is left alone -- cutting there would take
    real vocabulary with it.
    """
    for m in re.finditer(CAP, t):
        i = m.start()
        if i == 0:
            continue
        if re.search(r'[.?!]', t[i:]):
            return t[:i]
    return t


def unparen(t):
    """Resolve the parentheses, which mean four different things here.

    `segunda(-feira)` is one word whose second half is optional and the LONG
    reading is the word a learner needs, so the brackets are simply removed.
    `(sala de) aula` and `metro (m)` are a qualifier and a symbol, and the SHORT
    reading is the word.  `pequeno(a)` is a masculine with its feminine ending
    and the short reading is again the lemma -- but `irmã(o)` is the same shape
    meaning the opposite, a FEMININE with its masculine ending, where the short
    reading is `irmã` and the word this deck teaches is `irmão`.

    Nothing in the bracket says which of those two it is, so BOTH readings are
    returned and Wiktionary decides: `irmão` is a word and is kept, `pequenoa`
    is not and finds no record.  That is the whole reason this stage is
    permissive -- a candidate wrongly admitted here costs nothing, and one
    wrongly rejected can never come back.

    It cannot just call `re.sub(r'\\([^)]*\\)', '', t)` the way the DELE parser
    does: that turns `segunda(-feira)` into `segunda`, which is an ordinal
    number rather than a day of the week.
    """
    t = re.sub(r'\((-[^)]*)\)', r'\1', t)      # segunda(-feira) -> segunda-feira
    short = re.sub(r'\([^)]*\)', ' ', t)
    # the joined reading, for a bracket that is a short ENDING on the word
    joined = re.sub(r'(\w)\(([a-zà-ÿ]{1,3})\)', r'\1\2', t)
    joined = re.sub(r'\([^)]*\)', ' ', joined)
    return [short] if joined == short else [short, joined]


def items_of(block):
    """One bullet -> the candidate strings in it."""
    out = []
    for bullet in block.split('▪'):
        b = bullet.strip()
        if not b:
            continue
        # a labelled sublist: keep what follows each dash, drop the label
        if '—' in b or '–' in b:
            head, _, tail = re.split(r'([—–])', b, 1)[0], '—', b
            parts = re.split(r'\s*[—–]\s*', b)
            label = parts[0]
            rest = parts[1:]
            if rest and (LABEL_RX.match(label.strip()) or label.rstrip().endswith(':')):
                out.extend(rest)
                continue
            # not a labelled list: a dash inside a bullet is an example or an
            # aside, so only what comes before it is vocabulary
            b = label
        out.append(b)
    return out


SCAFFOLD = {
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos',
    'das', 'no', 'na', 'nos', 'nas', 'ao', 'à', 'aos', 'às', 'em', 'e', 'ou',
    'que', 'se', 'para', 'por', 'com', 'sem', 'ser', 'estar', 'ter', 'ir',
}


def segments(t):
    """Split a cleaned bullet into candidate items, keeping multi-word units."""
    out = []
    for part in re.split(r'[,;:]', t):
        part = part.strip()
        if not part:
            continue
        for alt in part.split('/'):
            alt = alt.strip(' .·-')
            if alt:
                out.append(alt)
    return out


# Metalanguage: the words the Referencial uses to DESCRIBE Portuguese rather
# than words of Portuguese.  They are frequent in the Gramática section and
# several are ordinary words as well (`forma`, `número`, `pessoa`, `tempo`), so
# they are dropped only from the sections that are written ABOUT the language.
META = {
    'forma', 'formas', 'variação', 'género', 'genero', 'número', 'numero',
    'singular', 'plural', 'masculino', 'feminino', 'invariável', 'invariáveis',
    'uso', 'valor', 'concordância', 'frase', 'oração', 'sujeito', 'predicado',
    'complemento', 'direto', 'indireto', 'modificador', 'determinante',
    'pronome', 'pronomes', 'artigo', 'artigos', 'nome', 'nomes', 'verbo',
    'verbos', 'adjetivo', 'adjetivos', 'advérbio', 'advérbios', 'preposição',
    'preposições', 'conjunção', 'conjunções', 'quantificador',
    'quantificadores', 'interrogativo', 'interrogativos', 'demonstrativo',
    'demonstrativos', 'possessivo', 'possessivos', 'numeral', 'numerais',
    'indicativo', 'conjuntivo', 'imperativo', 'infinitivo', 'presente',
    'pretérito', 'futuro', 'condicional', 'simples', 'composto', 'perfeito',
    'imperfeito', 'gerúndio', 'particípio', 'flexão', 'conjugação',
    'coordenada', 'subordinada', 'afirmativa', 'negativa', 'interrogativa',
    'declarativa', 'exclamativa', 'entoação', 'escrita', 'pessoa', 'pessoal',
    'designado', 'designação', 'exprimir', 'expressa', 'apresenta', 'introduz',
    'seguido', 'antes', 'depois', 'ausência', 'presença', 'alteração', 'ordem',
    'básica', 'obrigatória', 'ponto', 'interrogação', 'exemplo', 'vd',
}

# THE THREE SECTIONS ARE NOT EQUAL EVIDENCE, and that is what the source tag is
# for.  Noções is an inventory of vocabulary and is read as one -- a bullet is
# an item, and multi-word units are kept whole.  Funções and Gramática are
# written in PROSE, as worked examples and grammatical description, so only the
# individual words are taken from them and the metalanguage above is dropped.
# `select.py` prefers a Noções word to a Funções one, so the two never compete.
#
# Reading all three is what supplies the closed classes and the courtesy
# formulas the Noções inventory never writes out: `obrigado`, `olá`, `adeus`,
# `desculpe`, `por favor`, `poder`, `sim` and `já` are every one of them in the
# A1 Funções section, checked, and the DELE pipeline has to hand-write its
# equivalents because the Cervantes inventory has no such section to read.
cands = {}
kept = dropped = 0
counts = {}
for kind in ('nocoes', 'funcoes', 'gramatica'):
    blocks = sections(kind)
    counts[kind] = len(blocks)
    prose = kind != 'nocoes'
    for bid, title, block in blocks:
        for raw in items_of(block):
            t = strip_examples(raw)
            if FRAME_RX.search(t) and not prose:
                dropped += 1
                continue
            readings = [re.sub(r'\s+', ' ', re.sub(r'[«»"]', ' ', x)).strip()
                        for x in unparen(t)]
            for seg in [s for r in readings if r for s in segments(r)]:
                seg = seg.lower().strip(' .!?')
                if not seg or NOTWORD_RX.search(seg) or len(seg) < 2:
                    continue
                if LABEL_RX.match(seg):
                    continue
                kept += 1
                if not prose:
                    cands.setdefault(seg, set()).add(kind)
                # also offer the individual words, in case the segment is a
                # frame rather than a unit: `ter tempo livre` -> tempo, livre
                ws = [w for w in re.split(r'\s+', seg)
                      if w and w not in SCAFFOLD and len(w) > 1
                      and not (prose and w in META)]
                if prose or len(ws) > 1 or (len(ws) == 1 and ws[0] != seg):
                    for w in ws:
                        cands.setdefault(w, set()).add(kind)

print('  {} sections: {}'.format(
    LEV, ', '.join(f'{k} {v}' for k, v in counts.items())))
print(f'  bullets kept {kept}, dropped as grammatical frames {dropped}')
print('  candidates   :', len(cands),
      '(Noções', sum(1 for v in cands.values() if 'nocoes' in v), end=')\n')
print('  multi-word   :', sum(1 for c in cands if ' ' in c))
json.dump({k: sorted(v) for k, v in sorted(cands.items())},
          open(lvlf('referencial_candidates.json'), 'w'),
          ensure_ascii=False, indent=0)
