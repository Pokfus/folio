#!/usr/bin/env python3
"""The Indonesian card type: its fields, its two templates and its CSS.

ONE DEFINITION, because there are now two emitters.  `emit.py` writes a level's
deck and `emit_phrases.py` writes the phrases deck, and both put the same card
type in their file -- a reader studying a level and a reader studying the
phrases are looking at the same card.  Copied into each, the two would drift the
first time either was touched, and the drift would be invisible: both decks
would still import, still study and still count, and only a reader holding both
would ever see one of them rendering differently.  It is the fault
`deckcore.js` records for the Mandarin decks, where the CSS is copied into every
built file and a change there does not reach a reader until they are rebuilt.

Nothing here is level-specific.  Everything that varies -- the title, the
description, the tags -- stays with the emitter that knows about it.
"""

TYPE_ID = 'ukbi'

# A FIXED TIMESTAMP, so that re-running the generator on unchanged inputs writes
# the same bytes.  Reading the clock here would make every rebuild a diff.
STAMP = 1786665600000

# ONE NOTE, TWO CARDS.  The word is a single record and the two directions are
# card TEMPLATES, so a corrected meaning is corrected both ways at once and each
# direction still keeps a schedule of its own -- recognising `mengerti` comes
# long before producing it.  Card 1 is INDONESIAN → ENGLISH, the easier
# direction and the one a reader meets first, so it keeps the bare note id.
SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '{{Indonesian}}'
ASK = ('<div class="uc-ask">Say it in Indonesian</div>'
       '<div class="uc-field">{{English}}</div>')

# The affix family sits with the word it belongs to and above the rule that
# divides the word from its meaning: `lihat` / `melihat` / `dilihat` is one fact
# in three parts, and it is a fact about the WORD rather than about the
# translation of it.
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'

TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')

FRONT_ID = WORD
BACK_ID = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = """.card {
  text-align: center;
  font-size: 17px;
  line-height: 1.6;
}
.uc-ask {
  margin-bottom: 14px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
.uc-word {
  font-size: 38px;
  font-weight: 400;
  line-height: 1.2;
}
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
}
.uc-field {
  display: block;
  width: fit-content;
  /* A FLOOR, because Indonesian's commonest words gloss in one word.  The box
     hugs its contents, which is right for a list of three senses, and on
     `dan` -> `and` that would otherwise leave a narrow stamp adrift in the
     middle of a 680px card under a rule spanning the whole of it. */
  min-width: min(300px, 100%);
  max-width: 100%;
  margin: 14px auto 0;
  padding: 11px 15px;
  border: 1px solid var(--rule, rgba(0,0,0,0.12));
  border-radius: 11px;
  text-align: left;
  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));
}
.uc-sense + .uc-sense {
  margin-top: 9px;
}
.uc-pos {
  margin-bottom: 3px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint, #6C6A63);
}
.uc-gl {
  line-height: 1.5;
}
.uc-gls {
  margin: 0;
  padding-left: 18px;
  line-height: 1.5;
}
/* THE AFFIX FAMILY.  A row rather than a table: Indonesian has no paradigm to
   lay out in a grid -- no person, no number, no tense -- only a handful of
   derived forms, and three or four labelled words read better in a line than in
   a two-column table with two rows in it.  It wraps on a narrow screen. */
.uc-forms {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 16px;
  margin-top: 12px;
  font-size: 15px;
}
.uc-fi b {
  font-weight: 500;
}
.uc-fl {
  margin-right: 5px;
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.5;
}
/* the form the card is actually asking for, so a reader can see at a glance
   which of the family is the headword */
.uc-fhead b {
  font-weight: 700;
  color: var(--zh, #C8453C);
}
.uc-fold {
  margin-top: 14px;
  text-align: left;
}
.uc-fold summary {
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.6;
  text-align: center;
}
.uc-exs {
  margin-top: 10px;
}
.uc-exi {
  padding: 9px 0;
  text-align: center;
}
.uc-exi + .uc-exi {
  border-top: 1px solid var(--rule, rgba(0,0,0,0.10));
}
.uc-exz {
  font-size: 16px;
  line-height: 1.55;
}
.uc-exz b {
  font-weight: 600;
  color: var(--zh, #C8453C);
}
.uc-exe {
  margin-top: 3px;
  font-size: 13px;
  opacity: 0.62;
}
.uc-exsay {
  margin-right: 7px;
}
"""

FIELDS = ['Indonesian', 'Word', 'English', 'Forms', 'Examples']
