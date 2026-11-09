#!/usr/bin/env python3
"""The Korean card type: its fields, its two templates and its CSS.

ONE DEFINITION for every Korean deck (the three stages, the phrases and the alphabet's word cards), for
`jlpt/deck_type.py`'s reason: a copy per emitter would drift unseen.

Card 1 is KOREAN -> ENGLISH.  Its front is the word in hangul and nothing else -- except where the NIKL list
carries two words spelled alike (눈 "eye", 눈 "snow"), when the front adds the cue that tells them apart: the
hanja of a Sino-Korean word, else the phrase the list itself gives (눈이 내리다).  Its back gives the Revised
Romanization, the pronunciation in hangul where it differs from the spelling (학교 is said [학꾜]), the hanja,
the meanings, a verb's or adjective's three commonest forms, one row per hanja and a fold of real sentences.
Card 2 is ENGLISH -> KOREAN.
"""
import os

TYPE_ID = 'korean'
FIELDS = ['Word', 'Cue', 'Roman', 'Also', 'English', 'Forms', 'Hanja', 'Examples']

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
HEAD = ('<div class="uc-word">{{Word}}' + SAY + '</div>'
        '{{#Roman}}<div class="uc-romaji">{{Roman}}</div>{{/Roman}}'
        '{{#Also}}<div class="uc-also">{{Also}}</div>{{/Also}}'
        '{{#Forms}}{{Forms}}{{/Forms}}')
TAIL = ('{{#Hanja}}<div class="uc-kanji">{{Hanja}}</div>{{/Hanja}}'
        '{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')

FRONT_KO = '<div class="uc-word uc-front">{{Word}}</div>{{#Cue}}<div class="uc-cue">{{Cue}}</div>{{/Cue}}'
# THE BACK RENDERS {{FrontSide}}, which tells the study shell not to draw the question a second time, and the
# CSS hides it (`.uc-back`) so the headword with its speaker stands in its place rather than under a copy.
BACK_KO = '<div class="uc-back">{{FrontSide}}</div>' + HEAD + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = '<div class="uc-ask">Say it in Korean</div><div class="uc-field">{{English}}</div>'
BACK_EN = '{{FrontSide}}<hr>' + HEAD + TAIL

CARDS = [{'name': 'Korean → English', 'front': FRONT_KO, 'back': BACK_KO},
         {'name': 'English → Korean', 'front': FRONT_EN, 'back': BACK_EN}]

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'), encoding='utf-8').read()


def type_def(name='Korean vocabulary'):
    return {'id': TYPE_ID, 'name': name, 'speechLang': 'ko-KR', 'fields': FIELDS, 'cards': CARDS, 'css': CSS}
