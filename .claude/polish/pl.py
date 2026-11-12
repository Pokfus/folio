"""What every stage needs to know about Polish text and about the dictionary.

THE FOLD IS PLAIN `lower()`.  Polish has no dotted/dotless i, and its
diacritics (ą ć ę ł ń ó ś ź ż) are LETTERS, never folded away: `zle` is not
`źle`, `laska` ("stick") is not `łaska` ("grace").  A subtitle written without
diacritics simply misses, which costs a little count and never a wrong word.
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "polish-cache")


def fold(s):
    return s.lower()


WORD_RE = re.compile(r"[a-ząćęłńóśźż]+")


def tokens(s):
    return WORD_RE.findall(fold(s))


# Senses carrying one of these are not taught.  `informal` is NOT here: `ty`, `cześć` and the familiar
# imperative are standard Polish (the Indonesian lesson about `aku` and `kamu`).
NONSTANDARD = {"colloquial", "slang", "dialectal", "archaic", "obsolete", "vulgar", "nonstandard",
               "misspelling", "offensive", "Internet", "historical", "rare", "proscribed", "pejorative",
               "derogatory", "euphemistic", "childish", "humorous", "ironic", "regional", "obsolescent",
               "dated", "nonce-word", "jargon", "Middle", "Old", "error-unrecognized-form"}
TEACH_POS = {"noun", "verb", "adj", "adv", "pron", "num", "prep", "conj", "det", "intj", "particle"}
POINTER_GLOSS = re.compile(
    r"(?i)^(?:(?:old|archaic|obsolete|dated|rare|poetic|nonstandard) )?(?:(?:first|second|third)[- ]person|singular|plural|nominative|genitive|dative|accusative|"
    r"instrumental|locative|vocative|masculine|feminine|neuter|virile|nonvirile|imperative|inflection|"
    r"past|present|future|comparative|superlative|diminutive|augmentative|verbal noun|gerund|"
    r"(?:active|passive|adverbial|contemporary|anterior)[a-z ]*participle)\b[^;]* of (\S+(?: \S+)?)[.:]?$")
# "female equivalent of pan (“woman”) (specific female person …)": the quoted English IS the meaning
QUOTED = re.compile(r"(?i)^(?:female equivalent|male equivalent|synonym|alternative form|alternative spelling|"
                    r"(?:\w+ )?form|ellipsis|clipping|abbreviation|diminutive|augmentative|"
                    r"(?:imperfective|perfective)(?: form)?) of \S+(?: \S+)? \(“([^”]+)”\)\s*(.*)$")
BARE_XREF = re.compile(r"(?i)^(?:female equivalent|male equivalent|synonym|alternative form|alternative spelling|"
                       r"(?:alternative|obsolete|archaic|dated|nonstandard|rare) form|ellipsis|clipping|abbreviation|"
                       r"diminutive|augmentative|(?:imperfective|perfective)(?: form)?|(?:\w+ )?spelling|variant"
                       r") of\b|^(?:only )?used in\b")
LETTER_GLOSS = re.compile(r"name of the Latin(?:-script)? (?:script )?letter|^letter of the \w+ alphabet|"
                          r"^the (?:\w+ )?letter\b", re.I)
META_FORMS = {"no-table-tags"}


def regional(t):
    """A capitalised tag other than the language's own name is a place or a period (`Łowicz`, `Kraków`,
    `Middle`): `mój` is "husband" only in the Łowicz dialect, and that sense carries no `dialectal` tag."""
    return any(x[:1].isupper() and x not in ("Polish",) for x in t)


def parent(s):
    """The PARENT gloss of a sub-sense, which kaikki never emits as a sense of its own.  `nos`'s first sense
    is glossed ["nose (protuberance on the face …)", "synonym of dziób (“beak, bill”)"] and tagged obsolete
    for the bird's beak alone; reading only the last gloss lost "nose" from the card for `nos`, and "tree"
    from `drzewo`, "kitchen" from `kuchnia`, "newspaper" from `gazeta` the same way."""
    if len(s["g"]) < 2:
        return None
    g = s["g"][0].strip()
    if QUOTED.match(g) or POINTER_GLOSS.match(g) or BARE_XREF.match(g) or LETTER_GLOSS.search(g):
        return None
    return g


def gloss(s):
    """The English a sense teaches, or None when it is only a pointer, nonstandard or a letter's name."""
    t = set(s.get("t") or [])
    if (t & NONSTANDARD and "formal" not in t) or regional(t):
        return None
    g = s["g"][-1].strip()
    # Wiktionary's editorial notes, not meanings: "The meaning of this term is uncertain. Possibilities include:"
    # (`jeśli`, `różny`) and "Used other than figuratively or idiomatically: see …" (`stare miasto`,
    # `taki sam`).  Found by A2 (2026-11-12); A1's `jeśli` had carried the first.
    if g.startswith(("The meaning of this term is uncertain", "Used other than figuratively")):
        return None
    m = QUOTED.match(g)
    if m:
        rest = m.group(2).strip()
        return (m.group(1) + (" " + rest if rest else "")).strip()
    # a form-of target with a space in it is the extractor misreading prose ("Form of greeting or
    # farewell …" for `cześć`), not a pointer
    if any(" " not in x for x in s.get("f") or []) or POINTER_GLOSS.match(g) or BARE_XREF.match(g) or LETTER_GLOSS.search(g):
        return None
    if "reflexive" in t:
        return "(się) " + g
    return g


def sense_ok(s):
    return gloss(s) is not None or parent(s) is not None


def live(entry):
    return entry["pos"] in TEACH_POS and any(sense_ok(s) for s in entry["senses"])


def table_forms(entry):
    """[(form, tags)] of an entry's table, ORDER kept: no template rows, no analytic forms (`będę robił`,
    `-(e)m robił`), no dash for "no such form", no cell tagged with a register."""
    out = []
    for f, t in entry["forms"]:
        if (not f or f in META_FORMS or "inflection-template" in t or "table-tags" in t or " " in f
                or f.startswith("-") or f == "-" or set(t) & NONSTANDARD):
            continue
        out.append((f, t))
    return out


def load_dict():
    with open(os.path.join(CACHE, "dict.json"), encoding="utf-8") as fh:
        return json.load(fh)
