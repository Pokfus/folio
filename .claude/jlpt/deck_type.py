#!/usr/bin/env python3
"""The Japanese card type: its fields, its two templates and its CSS.

ONE DEFINITION for every Japanese deck, for `ukbi/deck_type.py`'s reason: the JLPT levels, the phrases and
the idioms put the same card type in their files, and a copy per emitter would drift unseen.

Card 1 is JAPANESE -> ENGLISH.  Its front is the word AS A JAPANESE READER WRITES IT -- kanji where the
dictionary does not mark the word "usually written in kana", kana where it does -- with no reading, so
the card asks what the word is.  Its back puts the reading over the kanji as furigana (<ruby>) and the
Hepburn romaji under it, always: the reading is the answer's first half.  Card 2 is ENGLISH -> JAPANESE.

AT N5 AND N4 THE FRONT IS IN KANA where the word's kanji are not yet that level's (Nov 2026, `build_level.py`):
the back still writes it in kanji with its furigana.
"""

TYPE_ID = 'jlpt'
FIELDS = ['Word', 'Furigana', 'Reading', 'Romaji', 'Also', 'English', 'Prompt', 'More', 'Conj', 'Kanji', 'Compounds',
          'Examples', 'Say']

# WHAT THE SPEAKER SAYS is its own field (Nov 2026), the reading for every word but two: the particles は and へ
# are written with the kana for "ha" and "he" and said "wa" and "e", and a speech engine handed the bare kana
# reads the letter, not the particle.
SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
HEAD = ('<div class="uc-word">{{Furigana}}' + SAY + '</div>'
        '{{#Romaji}}<div class="uc-romaji">{{Romaji}}</div>{{/Romaji}}'
        '{{#Also}}<div class="uc-also">{{Also}}</div>{{/Also}}')
# A VERB'S FOUR EVERYDAY FORMS (Nov 2026) stand under its meaning: the dictionary form is what the card asks, and
# not one example sentence in ten uses it.
CONJ = '{{#Conj}}<div class="uc-conj">{{Conj}}</div>{{/Conj}}'
TAIL = ('{{#Kanji}}<div class="uc-kanji">{{Kanji}}</div>{{/Kanji}}'
        '{{#Compounds}}<div class="uc-cmp">{{Compounds}}</div>{{/Compounds}}'
        '{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')

FRONT_JA = '<div class="uc-word uc-front">{{Word}}</div>'
# THE BACK RENDERS {{FrontSide}}, which is what tells the study shell not to draw the question a second time,
# and the CSS hides that bare word inside it (`.uc-back .uc-front`) so the furigana headword stands in its place
# rather than beneath a copy of itself.
BACK_JA = ('<div class="uc-back">{{FrontSide}}</div>' + HEAD + '<hr><div class="uc-field">{{English}}</div>'
           + CONJ + TAIL)
# THE ENGLISH -> JAPANESE CARD ASKS WITH THE FIRST SENSE ALONE (`Prompt`, Nov 2026).  Three senses on the question
# -- この was asked as "this / last (couple of years) / you (as in "you liar")" -- are three questions, and the
# second and third are the ones a learner does not yet have.  The other senses are on the back (`More`).
FRONT_EN = '<div class="uc-ask">Say it in Japanese</div><div class="uc-field">{{Prompt}}</div>'
BACK_EN = ('{{FrontSide}}<hr>' + HEAD
           + '{{#More}}<div class="uc-field uc-more"><div class="uc-morelab">also</div>{{More}}</div>{{/More}}'
           + CONJ + TAIL)

CARDS = [{'name': 'Japanese → English', 'front': FRONT_JA, 'back': BACK_JA},
         {'name': 'English → Japanese', 'front': FRONT_EN, 'back': BACK_EN}]

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
  font-size: 40px;
  font-weight: 400;
  line-height: 1.5;
}
.uc-front {
  font-size: 46px;
}
.uc-back .uc-front {
  display: none;
}
/* FURIGANA.  Small enough to sit over the kanji without crowding the line, never so faint it cannot be read:
   the reading is half of the answer. */
.uc-word rt {
  font-size: 0.4em;
  letter-spacing: 0.04em;
  opacity: 0.75;
}
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
}
.uc-romaji {
  margin-top: 2px;
  font-size: 15px;
  letter-spacing: 0.04em;
  font-style: italic;
  opacity: 0.7;
}
.uc-also {
  margin-top: 4px;
  font-size: 13px;
  opacity: 0.62;
}
.uc-field {
  display: block;
  width: fit-content;
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
/* A HOMOGRAPH'S KANJI, small beside a front two kana words share (いる "to be" / いる "to need"). */
.uc-hint {
  margin-left: 6px;
  font-size: 0.42em;
  opacity: 0.6;
}
.uc-inf {
  font-size: 0.86em;
  opacity: 0.66;
}
.uc-more {
  margin-top: 10px;
  opacity: 0.85;
}
.uc-morelab {
  margin-bottom: 3px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint, #6C6A63);
}
/* A VERB'S FORMS: label over form, four across where there is room. */
.uc-conj {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 18px;
  margin-top: 12px;
}
.uc-cj {
  text-align: center;
  font-size: 17px;
  line-height: 1.9;
}
.uc-cj rt {
  font-size: 0.5em;
  opacity: 0.7;
}
.uc-cjl {
  display: block;
  font-size: 9px;
  line-height: 1.2;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.55;
}
.uc-cjr {
  display: block;
  font-size: 11.5px;
  line-height: 1.2;
  font-style: italic;
  opacity: 0.62;
}
/* ONE ROW PER KANJI: the character, its meanings, its on and kun readings, and the parts it is drawn from. */
.uc-kanji {
  margin-top: 14px;
  text-align: left;
}
.uc-kj {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 7px 0;
}
.uc-kj + .uc-kj {
  border-top: 1px solid var(--rule, rgba(0,0,0,0.10));
}
.uc-kjc {
  font-size: 30px;
  line-height: 1.15;
  min-width: 1.15em;
  text-align: center;
}
.uc-kjm {
  font-size: 14px;
  line-height: 1.45;
}
.uc-kjr {
  font-size: 13px;
  opacity: 0.75;
}
.uc-kjl {
  margin-right: 4px;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.55;
}
.uc-kjp {
  font-size: 12.5px;
  opacity: 0.7;
}
.uc-kjp b {
  font-weight: 500;
}
.uc-cmp {
  margin-top: 12px;
  text-align: left;
}
.uc-cmplab {
  display: block;
  margin-bottom: 4px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
  text-align: center;
}
.uc-cmpi {
  display: flex;
  flex-wrap: wrap;
  gap: 0 10px;
  padding: 3px 0;
  font-size: 14px;
}
.uc-cmpw b {
  color: var(--zh, #C8453C);
  font-weight: 600;
}
.uc-cmpp {
  opacity: 0.7;
}
.uc-cmpg {
  opacity: 0.62;
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
  font-size: 18px;
  line-height: 2;
}
.uc-exz rt {
  font-size: 0.5em;
  opacity: 0.7;
}
.uc-exz b {
  font-weight: 600;
  color: var(--zh, #C8453C);
}
.uc-exe {
  margin-top: 1px;
  font-size: 13px;
  opacity: 0.62;
}
.uc-exsay {
  margin-right: 7px;
}
"""


def type_def(name='Japanese vocabulary'):
    return {'id': TYPE_ID, 'name': name, 'speechLang': 'ja-JP', 'fields': FIELDS, 'cards': CARDS, 'css': CSS}
