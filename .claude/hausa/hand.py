#!/usr/bin/env python3
"""Folio's own glosses, for the core Hausa words English Wiktionary does not have.

English Wiktionary holds about 2,000 Hausa words (the kaikki.org extraction, Nov
2026), and among the words it lacks are some of the commonest in the language:
`yi` "do", `tafi` "go", `zo` "come", `gani` "see", `da` "and, with", `ba` "not",
`abinci` "food", `dare` "night".  A beginner's deck without them is not a
beginner's deck, so the owner chose (2026-11-09) to gloss them by hand and say
so; this file is that hand.  Every meaning here is the standard one a Hausa
course or dictionary gives; nothing is dealt from it but what the inventory
(`inventory.py`) names.

A HAND ENTRY CARRIES NO TONED FORM.  The card's second line is Wiktionary's
toned spelling and nothing else -- a tone or a vowel length typed here from
memory would be a claim with no source -- so a hand-glossed word shows the
ordinary spelling alone, and the deck's description says how many do.

A row is `word: [(part of speech, 'gloss; gloss', gender, 'plural'), ...]`;
gender ('m' / 'f') and plural are given only for nouns and only where they are
the standard ones.  Glosses are separated by `;`, plurals by `,`.  Where Wiktionary HAS the
spelling but only with another meaning (`tana` "earthworm" for the continuous
"she is …-ing", `daga` "bangle-charm" for "from"), the hand entry leads the card
and `build_deck.ETYMS` says which of Wiktionary's entries, if any, stay.
"""

HAND = {
    # pronouns
    'ke': [('pron', 'you (to a woman)')],
    'ku': [('pron', 'you (plural)')],
    # the continuous: the person-aspect pronoun of the continuous, which comes before a
    # verb's -ing (`ina zuwa` "I am coming") or before a noun as "is at, has" (`yana gida`)
    'ina': [('adv', 'where?'), ('pron', 'I am …-ing (the continuous)')],
    'kana': [('pron', 'you (a man) are …-ing (the continuous)')],
    'kina': [('pron', 'you (a woman) are …-ing (the continuous)')],
    'yana': [('pron', 'he is …-ing, it is …-ing (the continuous)')],
    'tana': [('pron', 'she is …-ing (the continuous)')],
    'muna': [('pron', 'we are …-ing (the continuous)')],
    'kuna': [('pron', 'you (plural) are …-ing (the continuous)')],
    'suna': [('pron', 'they are …-ing (the continuous)')],
    # the completive: the person-aspect pronoun of a completed action (`ya zo` "he came")
    'ka': [('pron', 'you, a man (the completive: ka zo, you came)')],
    'kin': [('pron', 'you, a woman (the completive: kin zo, you came)')],
    'ya': [('pron', 'he, it (the completive: ya zo, he came)')],
    'ta': [('pron', 'she (the completive: ta zo, she came)'), ('prep', 'of (after a feminine noun); by way of, through')],
    'mun': [('pron', 'we (the completive: mun zo, we came)')],
    'kun': [('pron', 'you, plural (the completive: kun zo, you came)')],
    'sun': [('pron', 'they (the completive: sun zo, they came)')],
    # the future
    'zan': [('pron', 'I will, I am going to (the future)')],
    'zai': [('pron', 'he will, it will (the future)')],
    'za': [('particle', 'will, going to: the future, before a pronoun (za ka, za ta, za mu)')],
    # this and that
    'wancan': [('det', 'that (over there), that one')],
    'nan': [('adv', 'here; this (after a noun: gidan nan, this house)')],
    'can': [('adv', 'there, over there; that (after a noun: gidan can, that house)')],
    # questions
    'me': [('pron', 'what?')],
    'wa': [('pron', 'who?')],
    'yaya': [('adv', 'how?'), ('noun', 'elder brother or sister', 'mf')],
    'yaushe': [('adv', 'when?')],
    'nawa': [('adv', 'how much?, how many?'), ('pron', 'mine (of a masculine thing)')],
    'wane': [('det', 'which? (before a masculine noun)')],
    'wace': [('det', 'which? (before a feminine noun)')],
    # prepositions
    'a': [('prep', 'at, in (a gida, at home)'), ('pron', 'one, people (impersonal: an ce, it was said)')],
    'da': [('prep', 'with; by means of'), ('conj', 'and; who, which, that (mutumin da ya zo, the man who came)')],
    'na': [('prep', 'of (after a masculine or plural noun)'), ('pron', 'I (the completive: na zo, I came)')],
    'ga': [('prep', 'to, for; at'), ('intj', 'here is, look (ga shi, here it is)')],
    'daga': [('prep', 'from')],
    'cikin': [('prep', 'in, inside; among')],
    'kan': [('prep', 'on, on top of; about (a subject)')],
    'bisa': [('prep', 'on, upon; according to (bisa ga)')],
    'ƙarƙashin': [('prep', 'under, beneath')],
    'gaban': [('prep', 'in front of, before')],
    'tare': [('adv', 'together (tare da, together with)')],
    'wajen': [('prep', 'towards; near; at (someone\'s place)')],
    'don': [('conj', 'because; so that, in order to'), ('prep', 'for, for the sake of')],
    # conjunctions and particles
    'kuma': [('conj', 'and, and also; too; again')],
    'ko': [('conj', 'or; whether'), ('particle', 'even (ko da, even if)')],
    'sai': [('conj', 'then, so; except, only; until (sai gobe, until tomorrow)')],
    'kamar': [('prep', 'like, as; about, approximately')],
    'cewa': [('conj', 'that (after say, know, think: na san cewa …, I know that …)')],
    'ne': [('particle', 'is, it is (after a masculine or plural noun: Musa ne, it is Musa)')],
    'ce': [('particle', 'is, it is (after a feminine noun)'), ('verb', 'to say (ya ce, he said)')],
    'ba': [('particle', 'not (ba … ba, around what is denied)'), ('verb', 'to give (ba ni, give me)')],
    'babu': [('verb', 'there is no, there is not; without')],
    'akwai': [('verb', 'there is, there are')],
    'i': [('intj', 'yes')],
    "a'a": [('intj', 'no')],
    'to': [('intj', 'well, OK, all right')],
    'kawai': [('adv', 'only, just')],
    'ma': [('particle', 'even; also, too')],
    'dai': [('particle', 'just, anyway, really (for emphasis)')],
    'fa': [('particle', 'what about? (kai fa?, and you?); then, indeed (for emphasis)')],
    # greetings and politeness
    'yauwa': [('intj', 'good!, well done!, fine')],
    'godiya': [('noun', 'thanks, gratitude', 'f')],
    'gode': [('verb', 'to thank (na gode, thank you)')],
    'haƙuri': [('noun', 'patience (yi haƙuri, sorry, be patient)', 'm')],
    # numbers
    'rabi': [('noun', 'half', 'm')],
    # time
    'dare': [('noun', 'night', 'm')],
    'yau': [('adv', 'today')],
    'gobe': [('adv', 'tomorrow')],
    'jiya': [('adv', 'yesterday')],
    # family
    "ɗan'uwa": [('noun', 'brother; relative', 'm', "'yan'uwa")],
    'ƙane': [('noun', 'younger brother', 'm')],
    'ƙanwa': [('noun', 'younger sister', 'f')],
    'namiji': [('noun', 'man, male', 'm', 'maza')],
    'mata': [('noun', 'wife; women (the plural of mace)', 'f')],
    'jika': [('noun', 'grandchild', 'm')],
    # food and drink
    'abinci': [('noun', 'food', 'm')],
    'madara': [('noun', 'milk', 'f')],
    'wake': [('noun', 'beans, cowpeas', 'm')],
    'burodi': [('noun', 'bread', 'm')],
    'gishiri': [('noun', 'salt', 'm')],
    'mai': [('noun', 'owner of, having, one who (mai gida, a householder)')],
    # shopping and money
    'shago': [('noun', 'shop, store', 'm')],
    'saya': [('verb', 'to buy')],
    'sayar': [('verb', 'to sell (sayar da)')],
    'tsada': [('noun', 'expensiveness, a high price (da tsada, expensive)')],
    'arha': [('noun', 'cheapness (da arha, cheap)')],
    'farashi': [('noun', 'price', 'm')],
    # the home
    'ɗaki': [('noun', 'room; hut', 'm')],
    'ƙofa': [('noun', 'door, doorway; gate', 'f')],
    'waya': [('noun', 'telephone; wire', 'f')],
    # the town and getting about
    'tasha': [('noun', 'station, stop (for buses or trains)', 'f')],
    'otal': [('noun', 'hotel', 'm')],
    'banki': [('noun', 'bank', 'm')],
    'hagu': [('noun', 'left (the side)', 'm')],
    'dama': [('noun', 'right (the side); the right hand', 'f')],
    # the body and feeling ill
    'zazzaɓi': [('noun', 'fever', 'm')],
    # weather
    'yanayi': [('noun', 'weather; nature, condition', 'm')],
    'sanyi': [('noun', 'cold, coldness', 'm')],
    'ruwan sama': [('noun', 'rain (literally, water of the sky)', 'm')],
    # describing
    'mummuna': [('adj', 'ugly; bad')],
    'sauƙi': [('noun', 'ease; relief (da sauƙi, easy or cheap)', 'm')],
    'duk': [('det', 'all, every, whole')],
    'kaɗan': [('adv', 'a little, few')],
    'sosai': [('adv', 'very, very much; properly')],
    'komai': [('pron', 'everything; anything')],
    # everyday verbs
    'yi': [('verb', 'to do, to make')],
    'tafi': [('verb', 'to go, to go away')],
    'je': [('verb', 'to go (to a place)')],
    'zo': [('verb', 'to come')],
    'dawo': [('verb', 'to come back, to return')],
    'tashi': [('verb', 'to get up, to rise; to set off')],
    'tsaya': [('verb', 'to stand; to stop')],
    'gani': [('verb', 'to see')],
    'faɗi': [('verb', 'to say, to tell (something); to fall')],
    'gane': [('verb', 'to understand; to recognise')],
    'so': [('verb', 'to want, to like, to love')],
    'iya': [('verb', 'to be able to, can; to know how to')],
    'zama': [('verb', 'to become; to be; to live (in a place)')],
    'fara': [('verb', 'to begin, to start')],
    'kawo': [('verb', 'to bring')],
    'ɗauka': [('verb', 'to pick up, to carry; to take')],
    'bayar': [('verb', 'to give, to hand over (bayar da)')],
    'nema': [('verb', 'to look for, to seek; to ask for')],
    'samu': [('verb', 'to get, to obtain; to find')],
    'buɗe': [('verb', 'to open')],
    'rufe': [('verb', 'to close, to shut; to cover')],
    'gaya': [('verb', 'to tell (gaya mini, tell me)')],
    'koya': [('verb', 'to learn; to teach (koya wa)')],
    'gama': [('verb', 'to finish; to join together')],
    'sa': [('verb', 'to put, to place; to make (someone do something); to put on (clothes)')],
    'shiga': [('verb', 'to enter, to go in, to get into')],
    'fita': [('verb', 'to go out, to come out, to leave')],
    'koma': [('verb', 'to go back, to return; to move (house)')],
    'hau': [('verb', 'to climb, to go up; to get on, to ride (a horse, a vehicle)')],
    'sake': [('verb', 'to do again; to change; to let go of, to release')],
    'riga': [('verb', 'to have already (done): ya riga ya tafi, he has already gone')],
    'kada': [('particle', "don't, do not (kada ka tafi, don't go); lest, so that … not")],
}
