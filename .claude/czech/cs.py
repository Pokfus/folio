"""What every stage needs to know about Czech text and about the dictionary.

THE FOLD IS PLAIN `lower()`.  Czech's diacritics (á č ď é ě í ň ó ř š ť ú ů ý ž)
are LETTERS, never folded away: `byt` ("flat") is not `být` ("to be"), `sál`
("hall") is not `sal`.  A subtitle written without them simply misses, which
costs a little count and never a wrong word.

THE POLISH PIPELINE ADAPTED (`.claude/polish/pl.py`), with what Czech changes:
  * a reflexive sense is shown "(se/si) …": Wiktionary files `bát se`, `jmenovat
    se` and `dát si` under the base verb, tagged `reflexive`, and the tag does not
    say which clitic -- so both are named rather than one guessed;
  * the only capitalised tag that is not a place or a period is `Czech` itself
    (`Common-Czech`, the spoken koiné, is colloquial and is dropped with it).
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "czech-cache")


def fold(s):
    return s.lower()


WORD_RE = re.compile(r"[a-záčďéěíňóřšťúůýž]+")


def tokens(s):
    return WORD_RE.findall(fold(s))


# Senses carrying one of these are not taught.  `informal` is NOT here: `ty`, `ahoj` and the familiar
# imperative are standard Czech.
NONSTANDARD = {"colloquial", "slang", "dialectal", "archaic", "obsolete", "vulgar", "nonstandard",
               "misspelling", "offensive", "Internet", "historical", "rare", "proscribed", "pejorative",
               "derogatory", "euphemistic", "childish", "humorous", "ironic", "regional", "obsolescent",
               "dated", "nonce-word", "jargon", "Middle", "Old", "error-unrecognized-form", "Common-Czech",
               "expressive"}
# `phrase` too, unlike Polish: the official list names formulas (`dobrou noc`, `na zdraví`) that Wiktionary
# files as phrases, and only a multi-word headword can be one.
TEACH_POS = {"noun", "verb", "adj", "adv", "pron", "num", "prep", "conj", "det", "intj", "particle", "phrase"}
POINTER_GLOSS = re.compile(
    r"(?i)^(?:(?:old|archaic|obsolete|dated|rare|poetic|nonstandard) )?(?:(?:first|second|third)[- ]person|singular|plural|nominative|genitive|dative|accusative|"
    r"instrumental|locative|vocative|masculine|feminine|neuter|animate|inanimate|imperative|inflection|"
    r"past|present|future|comparative|superlative|diminutive|augmentative|verbal noun|gerund|iterative|"
    r"(?:active|passive|adverbial|contemporary|anterior|short)[a-z ]*(?:participle|form)|clitic)\b[^;]* of (\S+(?: \S+)?|\S+ /\S+(?: /\S+)*|\S+ and \S+)[.:]?$")
QUOTED = re.compile(r"(?i)^(?:female equivalent|male equivalent|synonym|alternative form|alternative spelling|"
                    r"(?:\w+ )?form|ellipsis|clipping|abbreviation|diminutive|augmentative|iterative|"
                    r"(?:imperfective|perfective)(?: form)?) of \S+(?: \S+)? \(“([^”]+)”\)\s*(.*)$")
BARE_XREF = re.compile(r"(?i)^(?:female equivalent|male equivalent|synonym|alternative form|alternative spelling|"
                       r"(?:alternative|obsolete|archaic|dated|nonstandard|rare) form|ellipsis|clipping|abbreviation|"
                       r"diminutive|augmentative|iterative|(?:imperfective|perfective)(?: form)?|(?:\w+ )?spelling|variant"
                       r") of\b|^(?:only )?used in\b")
LETTER_GLOSS = re.compile(r"name of the Latin(?:-script)? (?:script )?letter|^letter of the \w+ alphabet|"
                          r"^the (?:\w+ )?letter\b", re.I)
META_FORMS = {"no-table-tags"}


def regional(t):
    """A capitalised tag other than the language's own name is a place or a period (`Moravian`, `Prague`)."""
    return any(x[:1].isupper() and x not in ("Czech",) for x in t)


def parent(s):
    """The PARENT gloss of a sub-sense, which kaikki never emits as a sense of its own (Polish finding 2)."""
    if len(s["g"]) < 2:
        return None
    g = s["g"][0].strip()
    if g.endswith(":") or QUOTED.match(g) or POINTER_GLOSS.match(g) or BARE_XREF.match(g) or LETTER_GLOSS.search(g):
        return None
    return g


# The registers a word on the OFFICIAL LIST may be taught in, marked: the list names `kafe`, `tamhle`, `chleba`
# and `benzinka` at A1, and Wiktionary tags every sense of each colloquial.  Spoken Czech is the learner's Czech,
# so such a sense is taught -- for a list word with no standard sense only -- and says so: "(colloquial) coffee".
COLLOQUIAL = {"colloquial", "Common-Czech", "expressive", "informal"}
# "nominative/accusative/vocative neuter singular of ten: it, this, that" -- the English after the colon IS the
# meaning (`to`); "inflection of zpráva:" with nothing after it is a pointer and nothing else.
TAIL = re.compile(r"^.*\bof \S+: (.+)$")


def gloss(s, reflexive_mark=True, colloquial=False):
    """The English a sense teaches, or None when it is only a pointer, nonstandard or a letter's name."""
    t = set(s.get("t") or [])
    mark = ""
    bad = (t & NONSTANDARD) - {"formal"} if "formal" not in t else set()
    if bad and colloquial and bad <= COLLOQUIAL and not regional(t):
        mark, bad = "(colloquial) ", set()
    if bad or regional(t):
        return None
    # "to send [with accusative ‘’] and": a grammar note whose example Wiktionary left empty (`poslat`, `vážit`)
    g = re.sub(r"\s*\[with \w+ ‘’\](?: and| or)?", "", s["g"][-1]).strip()
    # an editor's note ("importance (TODO:disambiguation)", `význam`) and a valency label at the head of a gloss
    # ("(transitive) to look through", `prohlédnout`) are not meanings
    g = re.sub(r"\s*\(TODO[^)]*\)", "", g)
    g = re.sub(r"^\((?:transitive|intransitive)\)\s*", "", g).strip()
    if g.startswith(("The meaning of this term is uncertain", "Used other than figuratively")):
        return None
    m = QUOTED.match(g)
    if m:
        rest = m.group(2).strip()
        return mark + (m.group(1) + (" " + rest if rest else "")).strip()
    m = TAIL.match(g)
    if m and POINTER_GLOSS.match(g.rsplit(":", 1)[0]):
        return mark + m.group(1).strip()
    # `oni /ony /ona` is ONE target, written with spaces ("accusative of oni /ony /ona", `je`)
    if any(" " not in x or " /" in x or " and " in x for x in s.get("f") or []) or POINTER_GLOSS.match(g) or BARE_XREF.match(g) or LETTER_GLOSS.search(g):
        return None
    if "reflexive" in t and reflexive_mark:
        return mark + "(se/si) " + g
    return mark + g


ASPECT_OR_ALT = {"imperfective", "perfective", "alt-of", "alternative"}


def target(entries):
    """Where a word whose every sense is a pointer points: (kind, word) or None.  `začínat` is "imperfective
    form of začít" and `brzo` "alternative form of brzy" -- a word in its own right whose MEANING is its
    partner's ("via"); `děti` is "plural of dítě" and `mladší` "comparative degree of mladý" -- a FORM, whose
    card is the lemma's (the Polish rule for plurals)."""
    for e in entries:
        if e["pos"] not in TEACH_POS:
            continue
        for s_ in e["senses"]:
            if gloss(s_) is not None:
                return None
            fo = [x for x in s_.get("f") or [] if " " not in x]
            if fo:
                kind = "via" if set(s_.get("t") or []) & ASPECT_OR_ALT and not set(s_.get("t") or []) & {
                    "plural", "genitive", "dative", "accusative", "locative", "instrumental", "vocative",
                    "participle", "comparative", "superlative"} else "form"
                return kind, fo[0]
    return None


def sense_ok(s):
    return gloss(s) is not None or parent(s) is not None


def live(entry):
    return entry["pos"] in TEACH_POS and any(sense_ok(s) for s in entry["senses"])


def table_forms(entry):
    """[(form, tags)] of an entry's table, ORDER kept: no template rows, no analytic forms, no dash for "no
    such form", no clitic suffix (`-s`, `-ň`), no cell tagged with a register."""
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
