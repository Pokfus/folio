"""What every stage needs to know about Turkish text and about the dictionary.

THE DOTTED AND DOTLESS I.  Turkish has four letters, I ı İ i, and Python's
`str.lower()` maps `I` to `i` and `İ` to `i` + a combining dot.  Every case fold
in this generator goes through `fold`, which maps `İ -> i` and `I -> ı` first.
`key` / `strip_circ` drop the circumflex (`rüzgâr` / `rüzgar`, `hala` / `hâlâ` are
written both ways in the subtitle corpus); they are a FALLBACK lookup only (`select.py` says why), never shown.
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "turkish-cache")

CIRC = str.maketrans("âîû", "aiu")


def fold(s):
    return s.replace("İ", "i").replace("I", "ı").lower()


def strip_circ(s):
    return s.translate(CIRC)


def key(s):
    return strip_circ(fold(s))


WORD_RE = re.compile(r"[a-zçğıöşüâîû]+(?:'[a-zçğıöşüâîû]+)?")


def tokens(s):
    """Folded word tokens of a sentence (an apostrophe suffix kept on its word: `Ali'nin`)."""
    return WORD_RE.findall(fold(s))


# Senses carrying one of these are not taught.  `informal` is NOT here: `sen`
# and the familiar imperative are standard Turkish (the Indonesian lesson about
# `aku` and `kamu`).
NONSTANDARD = {"colloquial", "slang", "dialectal", "archaic", "obsolete", "vulgar", "nonstandard",
               "misspelling", "offensive", "Internet", "Ottoman-Turkish", "historical", "rare",
               "proscribed", "pejorative", "derogatory", "euphemistic", "childish"}
FORM_TAGS = {"form-of", "alt-of", "abbreviation", "clipping", "initialism", "acronym"}
TEACH_POS = {"noun", "verb", "adj", "adv", "pron", "num", "postp", "conj", "det", "intj", "particle",
             "classifier"}       # `tane` "piece", the counter word, is filed under it
# (case-insensitive, hyphen or space, a target of up to three words: `yemin et` is "Second person singular
# imperative tense of yemin etmek.")
# A gloss that only names a grammatical relation is a pointer, even untagged: `ağrısı` is glossed
# "third-person singular single-possession possessive of ağrı" with no form-of tag at all.
GRAM_PREFIX = (r"(?i)^(?:(?:first|second|third)(?:/(?:first|second|third))?[- ]person|plural|accusative|dative|locative|ablative|genitive|"
               r"inflection|definite|possessive)\b[^;]* of (\S+(?: \S+){0,2}?)[.:]?")
GRAM_GLOSS = re.compile(GRAM_PREFIX + "$")
# ...and a gloss may carry the pointer AND the meaning, joined by a semicolon:
# `hepimiz` "first-person plural single-possession of hep; all of us" -- the meaning is kept, the pointer cut.
GRAM_HEAD = re.compile(GRAM_PREFIX + r";\s*")
# A letter's name is not the word's meaning: `ve` opened on "The name of the Latin script letter V/v".
# And Wiktionary files the Arabic letters' names as nouns too (`nun`, `be`, `ha`).
LETTER_GLOSS = re.compile(r"name of the Latin(?:-script)? (?:script )?letter|^letter of the \w+ alphabet", re.I)
META_FORMS = {"no-table-tags"}


def pointer(s):
    """The word a sense points at, if it is only a pointer (form-of, alt-of, or a grammatical gloss)."""
    if s.get("f"):
        return s["f"][0]
    m = GRAM_GLOSS.match(s["g"][-1].strip())
    return m.group(1) if m else None


def sense_ok(s):
    t = set(s.get("t") or [])
    if s.get("f") or t & FORM_TAGS or pointer(s) or LETTER_GLOSS.search(s["g"][-1]):
        return False
    if t & NONSTANDARD and "formal" not in t:
        return False
    return True


def live(entry):
    return entry["pos"] in TEACH_POS and any(sense_ok(s) for s in entry["senses"])


def table_forms(entry, word=None):
    """[(form, tags)] of an entry's inflection table, template rows dropped, ORDER kept.

    Given the headword, a cell that is shorter than two letters or does not begin with the headword's
    first letter is dropped too: Turkish suffixes never touch the first letter, and `santur`'s table
    carries a bare `u` that made a Persian dulcimer one of the commonest words of the subtitles."""
    out = [(f, t) for f, t in entry["forms"]
           if f and f not in META_FORMS and "inflection-template" not in t and "table-tags" not in t]
    if word:
        out = [(f, t) for f, t in out if len(f) > 1 and fold(f)[0] == fold(word)[0]]
    return out


def load_dict():
    with open(os.path.join(CACHE, "dict.json"), encoding="utf-8") as fh:
        return json.load(fh)
