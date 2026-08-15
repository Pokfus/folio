#!/usr/bin/env python3
"""Assemble the cards: articles, plurals, feminines, conjugations, pronunciation.

ONE NOTE PER WORD, TWO CARDS -- the shape the Mandarin and Goethe decks use
rather than the DELE decks': a word is a single record carrying both directions
as card TEMPLATES, not two records differing only in which field is on the front.
It halves the file, a corrected gloss is corrected both ways at once, and each
direction still keeps a schedule of its own.

WHAT IS BUILT FOR EACH PART OF SPEECH, and why each earns its room:

  · A NOUN CARRIES ITS ARTICLE, because French gender is not derivable and is
    the one thing a learner most needs attached to the word from the first
    meeting.  The article is coloured -- le blue, la red -- which is the German
    deck's trick and costs nothing here.
  · AND WHERE THE ARTICLE ELIDES, THE INDEFINITE ONE IS GIVEN AS WELL.  This is
    the French problem the German deck never had: `le` and `la` both become `l'`
    before a vowel, so `l'arbre` and `l'année` print the same article and teach
    nothing at all -- and the words it happens to are not marginal, they are
    `l'eau`, `l'homme`, `l'école`, `l'hôtel`, `l'argent`.  `un` and `une` do not
    elide, so the indefinite form is what recovers the lesson, and it is shown on
    exactly the words that need it rather than on all of them.
  · A NOUN'S PLURAL IS SHOWN ONLY WHERE IT IS IRREGULAR.  French makes the
    plural by adding -s to almost everything, and printing `les livres` under
    `le livre` teaches a rule the reader already has.  What has to be learnt is
    `journal`/`journaux`, `œil`/`yeux`, and it is READ from Wiktionary rather
    than derived -- -aux looks like a rule and is not (`bal`/`bals`).
  · A NOUN NAMING A PERSON CARRIES ITS FEMININE, read and never derived: -e
    looks like a rule and is not (`serveur`/`serveuse`, `copain`/`copine`).
  · AN ADJECTIVE CARRIES ITS FEMININE, which is the single most useful thing to
    know about a French adjective and is wildly irregular: `blanc`/`blanche`,
    `beau`/`belle`, `vieux`/`vieille`, `long`/`longue`.  Where it has one it also
    carries the BEFORE-VOWEL masculine -- `bel`, `vieil`, `nouvel` -- which is a
    fact about three or four words that a learner meets in the first month
    (`un bel homme`) and cannot deduce.
  · A VERB CARRIES ITS PARADIGM: the présent, the passé composé, the imparfait,
    the futur simple and the impératif, each in all six persons.  The passé
    composé is the point -- it is how a French speaker talks about the past, and
    WHICH AUXILIARY a verb takes is a fact about that verb that has to be learnt
    with it, exactly as haben/sein is in German.

THREE FORMS ARE COMPOSED, AND THEY ARE THE ONLY ONES.  Wiktionary gives the
simple tenses and not the compound ones, so the passé composé is built here from
the auxiliary's own présent and the past participle; the pronominal verbs' finite
forms are built by putting the pronoun in front of the read form; and their
imperative is built by putting it after with a hyphen (`lève-toi`).  Each is a
rule of the language rather than a pattern -- which auxiliary is read off
Wiktionary's own `avoir + past participle` row, and `te` becomes `toi` after the
verb because that is what French does.  Every other form on every card is read.
"""
import json, re
from collections import Counter

from delf_level import f as lvlf

entries = json.load(open(lvlf('entries.json')))
W = json.load(open(lvlf('wikt.json')))
EX = json.load(open(lvlf('examples.json')))

FREQ = {}
for _ln in open('fr_50k.txt', encoding='utf-8'):
    _p = _ln.split()
    if len(_p) == 2:
        FREQ.setdefault(_p[0], int(_p[1]))

esc = lambda s: (str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))

# See `spelled` in examples.py: kaikki interleaves the PRONUNCIATION into the
# conjugation tables with the same tags as the spelling (`paʁl` beside `parle`),
# and the naive test -- look for IPA characters -- also throws away `sœurs` and
# `œufs`, because `œ` is a French letter.  So the test is positive.
FR_ALPHA = set("abcdefghijklmnopqrstuvwxyzàâäçéèêëîïôöùûüÿœæ-' ")


def spelled(s):
    return bool(s) and set(s.lower()) <= FR_ALPHA


# ---------------------------------------------------------------- senses
BAD_TAGS = {'obsolete', 'archaic', 'dated', 'vulgar', 'slang', 'offensive',
            'derogatory', 'ethnic-slur', 'rare', 'dialectal', 'regional',
            'Louisiana', 'Quebec', 'Acadian', 'Switzerland', 'Belgium',
            'humorous', 'poetic', 'informal-'}


def real_senses(r):
    return [s for s in r.get('senses', [])
            if s.get('glosses') and not (s.get('form_of') or s.get('alt_of'))]


def sense_rank(s):
    """WIKTIONARY'S OWN ORDER IS THE SIGNAL, and sorting by anything else loses
    it -- the German build records why ranking a sense by how SHORT its gloss is
    goes wrong, and French would go wrong the same way (`le temps` would come out
    "tense" before "time, weather").  So the only reordering is to push a sense
    Wiktionary has labelled obsolete, regional or vulgar behind the plain ones,
    and to demote a gloss that describes a grammatical FUNCTION rather than
    translating -- which in French is a real family rather than a curiosity, the
    articles and clitics being glossed "used to indicate ..." far more often than
    German's are.  Python's sort is stable, so everything else keeps the order the
    entry was written in."""
    if set(s.get('tags') or []) & BAD_TAGS:
        return 2
    g = (s.get('glosses') or [''])[0].strip()
    return 1 if re.match(r'(forms|used|indicates?|expresses?|marks?)\b', g, re.I) else 0


def tidy(g):
    """Trim a Wiktionary gloss down to the part a card should show."""
    g = re.sub(r'\s+', ' ', g).strip()
    g = re.sub(r'^\[[^\]]*\]\s*', '', g)
    g = re.sub(r'\s*\[[^\]]*\]', '', g)
    g = re.sub(r'\s*\((?:[^()]|\([^()]*\))*\)\s*$', '', g).strip()
    g = re.sub(r'\s+', ' ', g).strip(' ;:,.')
    return g


FEMALE_RX = re.compile(r'\bfemale\s+', re.I)


def sense_gloss(s_, want_fem=False):
    """What a single Wiktionary sense contributes to the card, or ''.

    A SENSE THAT POINTS AT ANOTHER WORD STILL OFTEN CARRIES THE MEANING, after a
    colon -- and this list needs that far more than the German one did, because
    it prints nine plurals and inflected forms as headwords in their own right
    (`les`, `des`, `ces`, `mes`, `ils`, `elles`, `chaussettes`, `sandales`,
    `devoirs`).  So the tail is taken where there is one, and a sense that is
    nothing but a pointer is skipped.
    """
    g = (s_.get('glosses') or [''])[-1]
    if not g:
        return ''
    if s_.get('form_of') or s_.get('alt_of'):
        parts = re.split(r'[:;]', g, 1)
        if len(parts) < 2 or not parts[1].strip():
            return ''
        g = parts[1]
        if not want_fem:
            g = FEMALE_RX.sub('', g)
    g = tidy(g)
    return '' if g.endswith(':') else g


def glosses_for(rec, limit=2, want_fem=False, reflexive=False):
    """The senses of one record, best first.

    A PRONOMINAL VERB'S MEANING IS IN THE SENSES TAGGED `reflexive`, AND THE
    ENTRY'S FIRST SENSE IS USUALLY THE OPPOSITE OF IT.  French files `se lever`
    under `lever`, and `lever` is a transitive verb meaning to raise or lift
    something -- so read plainly, the card for `se lever` came out glossed "to
    raise, lift" when the word means to get up.  Wiktionary marks the reflexive
    senses and they say exactly the right thing: "to rise, stand up", "to get up
    (out of bed)".  Measured over the five pronominal entries here, four have
    such senses and `brosser` has none, so that one falls back to the transitive
    reading ("to brush") -- which is honest, since `se brosser` really is that
    verb turned on oneself, and is noted in the run.

    ...AND THE RULE HAS TO RUN THE OTHER WAY TOO, which the A2 list is what
    showed: it prints `promener` AND `se promener`, and `sentir` AND `se
    sentir`, so both members of each pair get a card.  Wiktionary files the
    pronominal senses under the bare infinitive, and on `promener` it files the
    reflexive one FIRST -- so the bare card opened "to walk (leisurely), to go
    for a walk, to stroll", which is what `se promener` means and not what
    `promener` means, and a reader met the same English line twice under two
    different French words.  A sense tagged `reflexive` or `pronominal` belongs
    to the pronominal card and is dropped from the plain one.  It is a filter
    rather than a preference, and it falls back rather than emptying a card: an
    entry whose every sense is tagged that way still has to gloss something.
    """
    if rec is None:
        return []
    senses = rec.get('senses', [])
    if rec.get('pos') == 'verb':
        def is_refl(s_):
            return bool({'reflexive', 'pronominal'} & set(s_.get('tags') or ()))
        refl = [s for s in senses if is_refl(s)]
        plain = [s for s in senses if not is_refl(s)]
        senses = (refl or senses) if reflexive else (plain or senses)
    out = []
    for s_ in sorted(senses, key=sense_rank):
        g = sense_gloss(s_, want_fem)
        if g and g not in out:
            out.append(g)
        if len(out) >= limit:
            break
    return out


# WHICH READING THE LIST MEANS, settled by hand and only where the evidence says
# it must be.  The whole multi-record set was gone through rather than the ones
# that looked wrong, which is how the quiet ones were found: `lit` came out as a
# form of `lire` rather than a bed, `porte` and `montre` and `danse` as verb
# forms rather than a door, a watch and a dance, and `pas` as a footstep rather
# than the second half of `ne ... pas`.  French collides far harder than German
# here, because so many of its nouns are also the first-person present of a verb.
#
# A row is only written where the two readings are DIFFERENT WORDS.  Where they
# are the same word in two classes -- `orange` the fruit and the colour, `neuf`
# nine and new -- the group hint has already chosen and both meanings reach the
# card through `merged_glosses`.
FORCE_POS = {
    # a noun that is also a verb form
    'lit': 'noun', 'porte': 'noun', 'montre': 'noun', 'danse': 'noun',
    'livre': 'noun', 'sourire': 'noun', 'travail': 'noun', 'jus': 'noun',
    'entrée': 'noun', 'été': 'noun', 'plat': 'noun', 'part': 'noun',
    'sel': 'noun', 'vol': 'noun', 'cours': 'noun', 'pays': 'noun',
    'fils': 'noun', 'temps': 'noun', 'poste': 'noun', 'tour': 'noun',
    'sortie': 'noun', 'somme': 'noun', 'gomme': 'noun', 'lampe': 'noun',
    # …and two where Wiktionary leads with an adjective nobody uses: `journal`
    # opens "That is relative to each day" and `menu` "slim, small, fine", where
    # the list plainly means the newspaper and the menu.  Found by reading all
    # 102 multi-record entries rather than the ones that looked wrong.
    'journal': 'noun', 'menu': 'noun',
    'chaise': 'noun', 'joie': 'noun', 'neige': 'noun', 'pluie': 'noun',
    'question': 'noun', 'réponse': 'noun', 'classe': 'noun', 'toilette': 'noun',
    'serviette': 'noun', 'station': 'noun', 'addition': 'noun',
    # an adjective that is also a verb form or a noun
    'court': 'adj', 'sale': 'adj', 'fatigué': 'adj', 'occupé': 'adj',
    'propre': 'adj', 'simple': 'adj', 'favori': 'adj', 'lent': 'adj',
    'long': 'adj', 'grand': 'adj', 'petit': 'adj', 'jeune': 'adj',
    'chaud': 'adj', 'froid': 'adj', 'beau': 'adj', 'nouveau': 'adj',
    'vieux': 'adj', 'bon': 'adj', 'heureux': 'adj', 'triste': 'adj',
    'malade': 'adj', 'autre': 'adj',
    # the grammar words, which Wiktionary files under whichever class it wrote
    # first and which the list plainly means as the everyday one
    'pas': 'adv', 'plus': 'adv', 'très': 'adv', 'trop': 'adv', 'bien': 'adv',
    'beaucoup': 'adv', 'peu': 'adv', 'moins': 'adv', 'encore': 'adv',
    'aussi': 'adv', 'souvent': 'adv', 'toujours': 'adv', 'jamais': 'adv',
    'maintenant': 'adv', 'demain': 'adv', 'hier': 'adv', 'ici': 'adv',
    'tard': 'adv', 'tôt': 'adv', 'ensemble': 'adv', 'dedans': 'adv',
    'dehors': 'adv', 'rien': 'pron', 'tout': 'det',
    'le': 'article', 'la': 'article', 'les': 'article', 'un': 'article',
    'une': 'article', 'des': 'article',
    'mon': 'det', 'ma': 'det', 'mes': 'det', 'ton': 'det', 'ta': 'det',
    'son': 'det', 'sa': 'det', 'notre': 'det', 'votre': 'det', 'leur': 'det',
    'ce': 'det', 'ces': 'det', 'cette': 'det',
    'je': 'pron', 'tu': 'pron', 'il': 'pron', 'elle': 'pron', 'ils': 'pron',
    'elles': 'pron', 'nous': 'pron', 'vous': 'pron', 'me': 'pron', 'te': 'pron',
    'se': 'pron', 'qui': 'pron', 'que': 'conj', 'quoi': 'pron',
    'à': 'prep', 'de': 'prep', 'en': 'prep', 'dans': 'prep', 'sur': 'prep',
    'sous': 'prep', 'avec': 'prep', 'sans': 'prep', 'pour': 'prep',
    'par': 'prep', 'entre': 'prep', 'avant': 'prep', 'après': 'prep',
    'devant': 'prep', 'derrière': 'prep', 'près': 'adv', 'vers': 'prep',
    'et': 'conj', 'ou': 'conj', 'mais': 'conj', 'car': 'conj',
    'où': 'adv', 'quand': 'conj', 'comment': 'adv', 'pourquoi': 'adv',
    'combien': 'adv',
    # `oui` and `non` are NOT forced: Wiktionary leads both with the adverb and
    # glosses them "yes" and "no", which is exactly right, and an earlier attempt
    # to force them to `particle` named a class the dump has no record for.
    'merci': 'intj', 'pardon': 'intj',
    'bonjour': 'intj', 'bonsoir': 'intj', 'allô': 'intj', 'au revoir': 'intj',

    # ------------------------------------------------------------------ A2
    # Read the same way, over all 159 of that list's multi-record entries.  What
    # the sweep showed is that the pipeline ALREADY handles the family this file
    # most feared -- a form of another word filed first -- because a record whose
    # every gloss is a form-of pointer loses to the next: `produit`, `tapis`,
    # `fermé`, `amusant`, `pressé`, `bruyant`, `surprise` and `droite` all come
    # out right untouched, and none of them is in this table.  Ten do not, and
    # they divide into two shapes.
    #
    # A DEVERBAL NOUN FILED AHEAD OF ITS VERB.  `devenir` glosses "future" and
    # `toucher` "the act of touching, a way of touching, the sense of touch" --
    # perfectly real nouns, and not what a learner meeting either word means by
    # it.  These are not form-of records, so nothing structural separates them
    # from a word that genuinely is a noun first; they were found by reading.
    'devenir': 'verb', 'toucher': 'verb',
    # AND A RARE SENSE FILED AHEAD OF THE EVERYDAY ONE, which is the A1 table's
    # own shape (`journal`, `menu`) at greater length.  `pendant` leads with the
    # participle-turned-adjective "hanging" where the word is the preposition
    # *during*; `parti` with a heraldic adjective and "drunk" where it is the
    # political party; `cher` with the vocative noun "dear, honey, hon" where it
    # is *expensive*; `reçu` with the adjective "accomplished" where it is a
    # receipt; `général` with the military rank where the list means *general*;
    # and `devoir` with the noun "duty, homework" -- which A1 already teaches as
    # `devoirs`, so at A2 the word left to learn is the verb *must*.
    'pendant': 'prep', 'parti': 'noun', 'cher': 'adj', 'reçu': 'noun',
    'général': 'adj', 'devoir': 'verb', 'vidéo': 'noun',
    # `voisin` leads with the adjective "neighbouring"; the list also prints
    # `voisine`, which is merged into it (see REPAIRS), so the card has to be the
    # noun or the merge would file a feminine noun under an adjective.
    'voisin': 'noun',

    # ------------------------------------------------------------------ B1
    # A PAST PARTICIPLE USED AS AN ADJECTIVE, WHERE WIKTIONARY HAS NO ADJECTIVE
    # RECORD FOR IT.  The B1 list carries twenty of these -- `déçu`, `étonné`,
    # `stressé`, `réservé`, `motivé`, `isolé`, `concerné` and the rest -- and
    # nine come out right untouched, because a record whose every gloss is a
    # form-of pointer already loses to the next and those nine have an adjective
    # record to lose to.  Eleven have ONLY the participle, so the pointer-follower
    # walks through to the base verb and the card came out labelled `verb`,
    # glossed "to balance" and carrying `équilibrer`'s whole paradigm -- which is
    # a different word from the one the list prints.  Forced to `adj`, which the
    # dump has no record for, so each meaning is written out below; every one is
    # the base verb's own gloss put into the participle and nothing more.
    'reconnu': 'adj', 'lié': 'adj', 'énervé': 'adj', 'guéri': 'adj',
    'examiné': 'adj', 'soulagé': 'adj', 'amélioré': 'adj', 'estimé': 'adj',
    'équilibré': 'adj', 'dominé': 'adj', 'découragé': 'adj',

    # ------------------------------------------------------------------ B2
    # THE SAME CLASS AT THE SAME RATE, which is the useful measurement rather
    # than the count: 27 of B2's 1,671 entries have nothing but a pointer, and
    # after the merges and the repairs in `REPAIRS_BY_LEVEL` fourteen are left,
    # every one a participle standing as an adjective.  Two are PRESENT
    # participles (`contrastant`, `convergent`), which B1 had none of and which
    # need the same treatment for the same reason — `convergent` is also the
    # third-person plural of `converger`, and a vocabulary list means the
    # adjective.
    'accru': 'adj', 'approfondi': 'adj', 'averti': 'adj', 'berné': 'adj',
    'contrastant': 'adj', 'contrasté': 'adj', 'convergent': 'adj',
    'élaboré': 'adj', 'embrouillé': 'adj', 'fragmenté': 'adj',
    'impliqué': 'adj', 'intégré': 'adj', 'stéréotypé': 'adj',
    'vérifié': 'adj',

    # ------------------------------------------------------------------ C1
    # THE SAME CLASS AGAIN AND IT SCALES: 71 of C1's 3,220 entries have nothing
    # but a pointer, against B2's 27 of 1,673 and B1's 11 of 893 -- 2.2%, 1.6%
    # and 1.2%, so it grows a little faster than the list does.  After the
    # merges and the corrections in `REPAIRS_BY_LEVEL` these forty-six are
    # left, every one a participle standing as an adjective, and the reason
    # they cannot simply be merged into their verbs is that the verb is a
    # DIFFERENT CARD: `bannir` is to banish and `banni` is banished, and
    # thirteen of the forty-six have their verb on the page as well.
    'abouti': 'adj', 'banni': 'adj', 'bouilli': 'adj', 'ciblé': 'adj',
    'conféré': 'adj', 'congédié': 'adj', 'conquis': 'adj', 'constitué': 'adj',
    'damné': 'adj', 'déclarant': 'adj', 'défiguré': 'adj', 'désorienté': 'adj',
    'déterré': 'adj', 'disqualifié': 'adj', 'dissimulé': 'adj',
    'distingué': 'adj', 'doté': 'adj', 'écœurant': 'adj', 'enflammé': 'adj',
    'engagé': 'adj', 'enrichi': 'adj', 'ensorcelé': 'adj', 'envisagé': 'adj',
    'épanoui': 'adj', 'étranglé': 'adj', 'exagéré': 'adj', 'exercé': 'adj',
    'forgé': 'adj', 'habilité': 'adj', 'honoré': 'adj', 'immatriculé': 'adj',
    'implanté': 'adj', 'incarcéré': 'adj', 'intitulé': 'adj',
    'maîtrisé': 'adj', 'neutralisé': 'adj', 'opprimé': 'adj',
    'orchestré': 'adj', 'pénétré': 'adj', 'ravagé': 'adj', 'refoulé': 'adj',
    'réputé': 'adj', 'tourmenté': 'adj', 'tracé': 'adj', 'voué': 'adj',
    # `visée` chains through a participle to `viser` and comes out with no
    # meaning at all; the noun — someone's aims, their designs — is what a
    # vocabulary list means by it and is what the dictionary has not got.
    'visée': 'noun',

    # ------------------------------------------------------------------ C2
    # `ferment` is only the third-person plural of `fermer` in the dump, so the
    # card came out glossed "to close"; the noun — a leaven, and figuratively a
    # source of unrest — is the word, and is what has no record.
    'ferment': 'noun',
}

# WHERE WIKTIONARY HAS NO USABLE MEANING, IT IS WRITTEN OUT.  Each of these was
# read off the entry first and written only because the entry gives a learner
# nothing: a gloss that explains a grammatical function rather than translating
# ("used to indicate the definite article"), or one buried under a form-of
# pointer with no tail to recover.  Everything else on every card is read.
AUTHORED = {
    'un': ['a, an', 'one'],
    'une': ['a, an', 'one'],
    'le': ['the', 'him, it'],
    'la': ['the', 'her, it'],
    'les': ['the', 'them'],
    'des': ['some, of the', 'the plural of un and une'],
    'de': ['of', 'from', 'some'],
    'à': ['to', 'at', 'in'],
    'se': ['himself, herself, itself, themselves'],
    'me': ['me, to me', 'myself'],
    'te': ['you, to you', 'yourself'],
    'que': ['that', 'than', 'what'],
    'ce': ['this, that'],
    'ces': ['these, those'],
    'cette': ['this, that'],
    'pas': ['not'],
    'ne': ['not'],
    'plus': ['more', 'no more, not any more (with ne)'],
    'nous': ['we', 'us, to us', 'ourselves'],
    'vous': ['you', 'to you', 'yourself, yourselves'],
    'en': ['in', 'to', 'of it, of them'],
    # THE POSSESSIVES, which Wiktionary glosses correctly and then follows with a
    # note about how to address a superior officer -- "Followed by rank,
    # obligatory way of addressing a (male) superior officer within the military"
    # -- that no trimming rule can tell from a translation, because it is short
    # enough to look like one.  They are unambiguous words, so they are written.
    'mon': ['my'], 'ma': ['my'], 'mes': ['my'],
    'ton': ['your'], 'ta': ['your'],
    'son': ['his, her, its'], 'sa': ['his, her, its'],
    'notre': ['our'], 'votre': ['your'], 'leur': ['their', 'to them'],
    # THE ONE PRONOMINAL VERB WITH NO REFLEXIVE SENSE TO READ.  Wiktionary gives
    # `brosser` three transitive senses and no reflexive one, so `se brosser`
    # came out "to brush, to whip, to beat, to play truant" -- the last two being
    # a different verb entirely.  What the list means is the everyday one.
    'se brosser': ['to brush (one’s hair, teeth)'],
    # …AND THE SECOND ONE, FROM B1.  `préparer` likewise carries no reflexive
    # sense, so `se préparer` came out glossed "to prepare, to prepare for" —
    # word for word what its own bare verb says, on the card beside it.
    'se préparer': ['to get ready, to prepare oneself'],
    # A POINTER WRITTEN AS PROSE, which nothing can follow.  Wiktionary's only
    # sense for `weekend` is the string "post-1990 spelling of week-end", with no
    # `alt_of` field on it -- so `pointed_glosses` has nothing to walk and the
    # card offered a note about French spelling reform as the word's meaning.
    'weekend': ['weekend'],
    'tout': ['all, every', 'everything'],
    # A REAL PHRASE THE DICTIONARY HAS NO ENTRY FOR, which is a different thing
    # from a defect in the list and must not be repaired as one.  `faire du
    # sport` is ordinary French and English Wiktionary simply does not card it;
    # `faire`, `du` and `sport` are each there and their meanings do not add up
    # to it, which is what makes it worth teaching as a unit.  Written out, and
    # the run reports it beside the words that genuinely have no record so the
    # difference between the two is visible rather than assumed.
    'faire du sport': ['to do sport, to exercise'],
    # THE ELEVEN PARTICIPLES FORCE_POS SENDS HERE, each read off its base verb's
    # own gloss and put into the participle.  Wiktionary writes one of them out
    # itself — `past participle of équilibrer (balanced)` — and the other ten are
    # the same operation on the gloss beside it.
    'reconnu':   ['recognised, acknowledged'],
    'lié':       ['linked, connected', 'related'],
    'énervé':    ['annoyed, irritated', 'worked up'],
    'guéri':     ['cured, healed', 'better, recovered'],
    'examiné':   ['examined'],
    'soulagé':   ['relieved'],
    'amélioré':  ['improved'],
    'estimé':    ['estimated', 'esteemed, well regarded'],
    'équilibré': ['balanced, well-balanced'],
    'dominé':    ['dominated'],
    'découragé': ['discouraged, disheartened'],
    # AND B2's FOURTEEN, the same operation.  `impliqué` is the one worth
    # reading twice: the verb means to imply AND to involve, and the participle
    # standing as an adjective carries only the second.
    'accru':       ['increased, greater'],
    'approfondi':  ['thorough, in-depth'],
    'averti':      ['informed, well-informed', 'forewarned'],
    'berné':       ['fooled, duped'],
    'contrastant': ['contrasting'],
    'contrasté':   ['contrasting', 'high-contrast'],
    'convergent':  ['convergent, converging'],
    'élaboré':     ['elaborate, sophisticated'],
    'embrouillé':  ['muddled, confused', 'tangled'],
    'fragmenté':   ['fragmented'],
    'impliqué':    ['involved', 'implicated'],
    'intégré':     ['integrated', 'built-in'],
    'stéréotypé':  ['stereotyped, formulaic'],
    'vérifié':     ['verified, checked'],
    # THREE MORE REAL PHRASES THE DICTIONARY HAS NO ENTRY FOR, `faire du
    # sport`'s case at B2.  Each is ordinary French whose parts do not add up
    # to it, which is what makes it worth a card.
    'mettre en perspective': ['to put into perspective'],
    'mettre en relief':      ['to highlight, to bring out'],
    'tendre vers':           ['to tend towards, to approach'],
    # AND C1's FORTY-SIX, each the base verb's own gloss put into the
    # participle.  Where the verb has two senses far apart the participle
    # usually carries only one, and that is the judgement in each line:
    # `engager` is to pledge AND to hire, and `engagé` is committed.
    'abouti':      ['successful, fully realised'],
    'banni':       ['banished, banned'],
    'bouilli':     ['boiled'],
    'ciblé':       ['targeted'],
    'conféré':     ['conferred, bestowed'],
    'congédié':    ['dismissed, laid off'],
    'conquis':     ['conquered', 'won over'],
    'constitué':   ['made up, constituted'],
    'damné':       ['damned'],
    'déclarant':   ['declaring', 'the declarant, the person making the declaration'],
    'défiguré':    ['disfigured'],
    'désorienté':  ['disoriented, bewildered'],
    'déterré':     ['dug up, unearthed'],
    'disqualifié': ['disqualified'],
    'dissimulé':   ['hidden, concealed'],
    'distingué':   ['distinguished'],
    'doté':        ['endowed, equipped (with)'],
    'écœurant':    ['sickening, nauseating', 'sickly (of food)'],
    'enflammé':    ['inflamed', 'ablaze', 'impassioned'],
    'engagé':      ['committed, engaged', 'hired'],
    'enrichi':     ['enriched'],
    'ensorcelé':   ['bewitched, spellbound'],
    'envisagé':    ['envisaged, contemplated'],
    'épanoui':     ['fulfilled, flourishing', 'in full bloom'],
    'étranglé':    ['strangled', 'choked, constricted'],
    'exagéré':     ['exaggerated', 'excessive'],
    'exercé':      ['trained, practised'],
    'forgé':       ['forged', 'fabricated, made up'],
    'habilité':    ['authorised, empowered'],
    'honoré':      ['honoured'],
    'immatriculé': ['registered (of a vehicle)'],
    'implanté':    ['established, set up', 'implanted'],
    'incarcéré':   ['imprisoned, incarcerated'],
    'intitulé':    ['entitled, titled'],
    'maîtrisé':    ['mastered', 'under control'],
    'neutralisé':  ['neutralised'],
    'opprimé':     ['oppressed'],
    'orchestré':   ['orchestrated'],
    'pénétré':     ['penetrated', 'imbued (with)'],
    'ravagé':      ['ravaged, devastated'],
    'refoulé':     ['repressed', 'turned away'],
    'réputé':      ['renowned, reputed'],
    'tourmenté':   ['tormented', 'troubled'],
    'tracé':       ['drawn, plotted', 'the route, the layout'],
    'voué':        ['devoted, dedicated', 'doomed (to)'],
    'visée':       ['aim, objective', 'designs, intentions'],
    # AND TWO REAL FRENCH WORDS THE DUMP SIMPLY HAS NOT GOT, `faire du sport`'s
    # case again.  `infiltrer` is an ordinary verb with no record at all in the
    # extraction, and `débriefing` an ordinary borrowing; neither is a fault in
    # the list, so neither is repaired as one.
    'infiltrer':   ['to infiltrate'],
    'débriefing':  ['debriefing'],
    # AND C2's TWO, the same case.
    'ferment':     ['ferment, leaven', 'a source of unrest'],
    'transpondeur': ['transponder'],
}

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'num': 'number', 'intj': 'interjection',
            'particle': 'particle', 'article': 'article', 'phrase': 'phrase',
            'name': 'proper noun'}


def pick_pos(e):
    """The record to build from, the part of speech, and every record sharing it.

    A FORCED CLASS WINS EVEN WHERE THE DICTIONARY HAS NO ENTRY FOR IT, and this
    is not a nicety: `une` is the indefinite article, and Wiktionary files that
    under `un` as a bare form-of with no senses of its own -- so the only record
    for `une` carrying a real sense is the NOUN, `la une`, the front page of a
    newspaper.  Read with the forced class as a mere preference, the entry fell
    through to that noun, took the feminine article, elided it, and the card came
    out reading `l'une` with a forms row offering `une une`.  The table is
    hand-written and each row was read off the page before it was added; where it
    names a class the dump has no record for, the class stands and the meaning
    comes from AUTHORED.
    """
    all_recs = W.get(e['lemma'], [])
    recs = [r for r in all_recs if real_senses(r)] or all_recs
    want = FORCE_POS.get(e['key'])
    if want:
        same = ([r for r in recs if r.get('pos') == want] or
                [r for r in all_recs if r.get('pos') == want])
        return (same[0] if same else None), want, same
    if not recs:
        return None, e['pos_hint'], []
    same = [r for r in recs if r.get('pos') == e['pos_hint']]
    if same:
        return same[0], e['pos_hint'], same
    p = recs[0].get('pos', e['pos_hint'])
    return recs[0], p, [r for r in recs if r.get('pos') == p]


def merged_glosses(same, want_fem=False, reflexive=False):
    """The senses of every record that shares the chosen part of speech.

    A HOMOGRAPH IS TWO ENTRIES, NOT TWO SENSES OF ONE: `chat` is the animal and
    the online conversation, `livre` the book and the pound, and Wiktionary files
    each under its own etymology -- so reading the first record alone teaches half
    the word.
    """
    out = glosses_for(same[0], 3, want_fem, reflexive) if same else []
    for r in same[1:]:
        for g in glosses_for(r, 1, want_fem, reflexive):
            if g not in out:
                out.append(g)
    return out[:3]


def pointed_glosses(same, want_fem=False):
    """The meaning at the far end of a pointer, where the word has none itself.

    Nine of this list's entries are inflected forms with no meaning of their own
    -- `les` ("plural of le"), `chaussettes` ("plural of chaussette"), `elles`
    ("feminine plural of il").  Followed only when there is nothing else, so a
    word with a meaning of its own is untouched.
    """
    for r in same:
        if r is None:
            continue
        for s_ in sorted(r.get('senses', []), key=sense_rank):
            for k in ('form_of', 'alt_of'):
                for f_ in (s_.get(k) or []):
                    w_ = f_.get('word') if isinstance(f_, dict) else f_
                    for base in W.get((w_ or '').strip(), []):
                        g = merged_glosses([base], want_fem)
                        if g:
                            return g
    return []


# ---------------------------------------------------------------- forms
def forms_tagged(rec, want, without=()):
    out = []
    for f in rec.get('forms', []) if rec else []:
        tg = set(f.get('tags') or [])
        s = (f.get('form') or '').strip()
        if not s or s in ('-', '—') or not spelled(s):
            continue
        if tg & set(without) or (tg & BAD_TAGS):
            continue
        if want <= tg and s not in out:
            out.append(s)
    return out


GENDER_TAG = {'masculine': 'm', 'feminine': 'f'}


def gender_of(rec):
    """m / f, from the sense tags Wiktionary carries a French noun's gender on."""
    seen = []
    for s in (rec.get('senses', []) if rec else []):
        for t in (s.get('tags') or []):
            if t in GENDER_TAG and GENDER_TAG[t] not in seen:
                seen.append(GENDER_TAG[t])
    return ''.join(seen[:2]) if seen else ''


def plural_of(rec):
    pl = forms_tagged(rec, {'plural'}, without={'feminine', 'masculine'})
    if not pl:
        pl = forms_tagged(rec, {'plural'}, without={'feminine'})
    return pl[0] if pl else ''


FEM_MASC_COMMON = 2000


def feminine_of(rec, head):
    """A FEMININE IS READ AND THEN CHECKED, on the German build's rule and for the
    same reason: Wiktionary lists a feminine wherever French CAN make one and not
    only where it uses one.  `ami` carries `amise` (Louisiana), `amille` and
    `amiliée` beside the real `amie`; the tag filter takes the first two and a
    currency test on the frequency list takes the rest -- a feminine of a common
    masculine that appears not once in 50,000 words is not a word in use."""
    fe = forms_tagged(rec, {'feminine'}, without={'plural'})
    if not fe:
        return ''
    fem = fe[0]
    if fem == head:
        return ''
    if not FREQ.get(fem.lower(), 0) and FREQ.get(head.lower(), 0) >= FEM_MASC_COMMON:
        return ''
    return fem


# ---------------------------------------------------------------- articles
# `œ` AND `æ` ARE VOWELS, and leaving them out of this set is how `le œuf`
# reached a card.  They are single letters in French rather than the two-letter
# sequences they look like, so a set written out of the ASCII vowels plus the
# accents misses them -- and `œuf`, `œil` and `sœur` are exactly the words a
# beginners' list carries.
VOWEL = set('aeiouyàâäéèêëîïôöùûüœæ')

# WHERE `le`/`la` DOES NOT ELIDE BEFORE A VOWEL OR AN h.  French has a class of
# words beginning with an "aspirated" h that block elision -- `le héros`, `le
# hall`, `la hausse` -- and there is no rule for which they are; it is a fact
# about each word.  MEASURED OVER THIS LIST, NOT ONE OF ITS NOUNS IS ONE: every
# h-initial noun here (heure, histoire, hiver, homme, hôpital, hôtel) takes `l'`.
# So the table is inert at A1 and is written for the levels above, where `héros`
# and `haricot` arrive; anything it fires on is reported.
ASPIRATE_H = {'héros', 'hall', 'hasard', 'haut', 'hauteur', 'hausse', 'haricot',
              'honte', 'hockey', 'hamburger', 'handicap', 'harpe', 'hibou',
              'hollandais', 'homard', 'hors', 'huit', 'huitième'}


def elides(word):
    """Does the definite article contract to `l'` in front of this word?"""
    if word in ASPIRATE_H:
        return False
    c = word[:1].lower()
    return c in VOWEL or c == 'h'


DEF_ART = {'m': 'le', 'f': 'la'}
INDEF_ART = {'m': 'un', 'f': 'une'}


# A MONTH AND A DAY ARE NAMED WITHOUT AN ARTICLE, and printing one is wrong in
# two different ways.  `le janvier` is not French at all -- a month takes no
# article, you say `en janvier` -- and `le lundi` IS French but means "on
# Mondays", so an article there changes the thing the card is teaching from the
# name of the day into a habit.  The gender is not lost: the label line under the
# word still says `noun, masculine`.  The SEASONS keep their article, because
# that is how they are said (`le printemps`, `l'été`).
NO_ARTICLE_GROUPS = {'months', 'days'}


def article_for(word, gender, plural_only, group=''):
    """The article the card prints, and whether it elides."""
    if group in NO_ARTICLE_GROUPS:
        return '', False
    if plural_only:
        return 'les', False
    g = gender[:1]
    if not g:
        return '', False
    if elides(word):
        return "l'", True
    return DEF_ART[g], False


# ---------------------------------------------------------------- conjugation
# THE LEFT COLUMN IS THE ENGLISH PERSON AND THE RIGHT IS THE WHOLE FRENCH FORM,
# which is not the German deck's arrangement and is forced by elision.  There the
# row is `ich | freue mich`: the subject pronoun labels the row and the verb sits
# beside it.  French will not divide there -- `je` and `aime` are written `j'aime`
# -- so a row split that way either prints a dangling `j'` in the label column or
# repeats the pronoun in both.  Labelling the row in ENGLISH instead costs
# nothing, removes the repetition, and tells a beginner which person each line is.
#
# (subject, English label, tags, pronominal pronoun, stressed form after an
# imperative)
PERSONS = [('je', 'I', {'first-person', 'singular'}, 'me', 'moi'),
           ('tu', 'you', {'second-person', 'singular'}, 'te', 'toi'),
           ('il/elle', 'he/she', {'third-person', 'singular'}, 'se', ''),
           ('nous', 'we', {'first-person', 'plural'}, 'nous', 'nous'),
           ('vous', 'you (pl.)', {'second-person', 'plural'}, 'vous', 'vous'),
           ('ils/elles', 'they', {'third-person', 'plural'}, 'se', '')]

TENSES = [('Présent', {'indicative', 'present'}, {'subjunctive', 'imperfect',
                                                  'future', 'historic', 'conditional'}),
          ('Imparfait', {'indicative', 'imperfect'}, {'subjunctive', 'conditional'}),
          ('Futur simple', {'indicative', 'future'}, {'subjunctive', 'conditional',
                                                      'perfect'})]


def pick_form(rec, tags, without=()):
    got = forms_tagged(rec, tags, without)
    return got[0] if got else ''


def elide(pron, word):
    """`je` + `ai` -> `j'ai`, and the same for me / te / se.

    The apostrophe closes up against the word, which is what French prints; the
    pronouns that do not elide (`nous`, `vous`, `il`) fall through untouched.
    """
    if pron in ('je', 'me', 'te', 'se') and word and (word[0].lower() in VOWEL or
                                                      (word[0].lower() == 'h' and
                                                       word not in ASPIRATE_H)):
        return pron[:-1] + "'" + word
    return pron + ' ' + word


def aux_of(rec, reflexive):
    """`avoir` or `être`, READ off Wiktionary's own compound-infinitive row.

    The conjugation table carries a row `avoir + past participle` or `être + past
    participle` tagged as a multiword infinitive, which is the auxiliary stated
    outright -- so the fact a learner has to memorise is not guessed at here.
    A PRONOMINAL VERB ALWAYS TAKES être whatever its plain form takes (`laver`
    takes avoir, `se laver` takes être), which is a rule of the language.
    """
    if reflexive:
        return 'être'
    for f in (rec.get('forms', []) if rec else []):
        tg = set(f.get('tags') or [])
        s = (f.get('form') or '')
        if 'infinitive' in tg and 'multiword-construction' in tg:
            if s.startswith('être'):
                return 'être'
            if s.startswith('avoir'):
                return 'avoir'
    return 'avoir'


def aux_present():
    """The présent of avoir and of être, read from their own records.

    Read rather than written down, because they are ordinary entries in the dump
    -- and looked up here rather than being assumed present in the deck, since
    from A2 upwards both words have already been taught by a lower level and are
    not in `entries` at all.  `run.py` puts them in the lookup for that reason.
    """
    out = {}
    for lemma in ('avoir', 'être'):
        rec = next((r for r in W.get(lemma, []) if r.get('pos') == 'verb'), None)
        out[lemma] = [pick_form(rec, tags | {'indicative', 'present'},
                                without={'subjunctive', 'imperfect', 'future',
                                         'historic', 'conditional'})
                      for _, _, tags, _, _ in PERSONS]
    return out


AUX_PRESENT = aux_present()


def finite(subject, refl, form, reflexive):
    """One finite form as it is actually written, subject pronoun and all.

    Only ONE elision can apply: the pronominal pronoun stands between the subject
    and the verb, so `je` meets `me` (a consonant) and never elides -- `je
    m'appelle`, not `j'me appelle`.  Where there is no pronominal pronoun the
    subject meets the verb directly and elides against it, `j'aime`.
    """
    if reflexive:
        return subject + ' ' + elide(refl, form)
    return elide(subject, form)


def conj_rows(rec, reflexive, tags, without):
    """One tense, as (English person, written form) rows."""
    rows = []
    for subject, label, ptags, refl, _ in PERSONS:
        form = pick_form(rec, tags | ptags, without)
        if not form:
            return []
        rows.append((label, finite(subject, refl, form, reflexive)))
    return rows


def passe_compose(reflexive, part, aux):
    """THE ONE COMPOSED TENSE, and the reason the panel is worth opening.

    Wiktionary gives the simple tenses; the passé composé is the auxiliary's own
    présent plus the past participle, which is a rule rather than a pattern.  The
    agreement is printed the way a textbook prints it -- `je suis allé(e)` -- so
    the bracket teaches the rule instead of hiding it; a verb taking `avoir`
    agrees with nothing here and gets no bracket.
    """
    if not part:
        return []
    rows = []
    for i, (subject, label, _, refl, _) in enumerate(PERSONS):
        a = AUX_PRESENT.get(aux, [''] * 6)[i]
        if not a:
            return []
        p = part + (('(e)s' if i >= 3 else '(e)') if aux == 'être' else '')
        rows.append((label, finite(subject, refl, a, reflexive) + ' ' + p))
    return rows


def imperative_rows(rec, reflexive):
    """tu / nous / vous, and the pronoun goes AFTER with a hyphen when pronominal.

    `lève-toi`, `levons-nous`, `levez-vous` -- and `te` becomes `toi` there, which
    is a rule of the language and the third of this file's composed forms.
    """
    want = [('you', {'second-person', 'singular'}, 'toi'),
            ('we', {'first-person', 'plural'}, 'nous'),
            ('you (pl.)', {'second-person', 'plural'}, 'vous')]
    rows = []
    for label, tags, stressed in want:
        form = pick_form(rec, tags | {'imperative'}, without={'subjunctive'})
        if not form:
            continue
        rows.append((label, form + '-' + stressed if reflexive else form))
    return rows


def tense_block(head, rows):
    if not rows:
        return ''
    return ('<div><div class="uc-cj-h">' + esc(head) + '</div>' +
            ''.join(f'<div class="uc-cj-r"><span class="uc-cj-p">{esc(p)}</span>'
                    f'<span class="uc-cj-f">{esc(v)}</span></div>' for p, v in rows) +
            '</div>')


def conjugation_html(e, rec, reflexive):
    if rec is None:
        return ''
    inf = e['word']
    part = pick_form(rec, {'participle', 'past'}, without={'multiword-construction'})
    ger = pick_form(rec, {'participle', 'present'},
                    without={'multiword-construction', 'past'})
    aux = aux_of(rec, reflexive)

    nf = [('infinitive', inf)]
    if part:
        nf.append(('past participle', part))
    if ger:
        nf.append(('present participle', ger))
    nf.append(('auxiliary', aux))
    head = ('<div class="uc-cj-nf">' + ''.join(
        f'<span class="uc-cj-nfi"><i>{esc(a)}</i><b>{esc(b)}</b></span>'
        for a, b in nf) + '</div>')

    blocks = []
    for name, tags, without in TENSES:
        blocks.append(tense_block(name, conj_rows(rec, reflexive, tags, without)))
        if name == 'Présent':
            blocks.append(tense_block('Passé composé',
                                      passe_compose(reflexive, part, aux)))
    blocks.append(tense_block('Impératif', imperative_rows(rec, reflexive)))
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return head + '<div class="uc-cj-grid">' + ''.join(blocks) + '</div>'


# ------------------------------------------------------- adjective paradigm
def adj_table_html(rec):
    """masculine / feminine against singular / plural, which is the whole of a
    French adjective's agreement and is what the reader has to produce."""
    if rec is None:
        return ''
    fem = pick_form(rec, {'feminine'}, without={'plural'})
    mpl = pick_form(rec, {'masculine', 'plural'})
    fpl = pick_form(rec, {'feminine', 'plural'})
    if not (fem or mpl or fpl):
        return ''
    rows = [('singulier', ['—', fem or '—']), ('pluriel', [mpl or '—', fpl or '—'])]
    out = ['<div class="uc-dt uc-dt2">',
           '<div class="uc-dtr uc-dth"><span class="uc-dtl"></span>'
           '<span class="uc-dtc">masculin</span><span class="uc-dtc">féminin</span></div>']
    for label, cells in rows:
        out.append(f'<div class="uc-dtr"><span class="uc-dtl">{esc(label)}</span>' +
                   ''.join(f'<span class="uc-dtc">{esc(c)}</span>' for c in cells) +
                   '</div>')
    out.append('</div>')
    return ''.join(out)


def adj_panel(e, rec):
    body = adj_table_html(rec)
    if not body:
        return ''
    # the masculine singular cell is the headword itself, filled in here so the
    # table reads as a paradigm rather than as a table with a hole in it
    body = body.replace('<span class="uc-dtc">—</span>',
                        f'<span class="uc-dtc">{esc(e["word"])}</span>', 1)
    return ('<div class="uc-cj-grid"><div class="uc-dtw"><div class="uc-cj-h">'
            'Accord</div>' + body + '</div></div>')


# ---------------------------------------------------------------- meanings
def comma_parts(s):
    if '(' in s:
        return [s]
    parts = [x.strip() for x in s.split(',')]
    if len(parts) < 2 or len(parts) > 4:
        return [s]
    for p in parts:
        if not p or len(p) > 26 or re.match(r'(or|and|nor|but)\b', p):
            return [s]
    return parts


# A TRANSLATION IS SHORT AND A DEFINITION IS LONG, and Wiktionary writes both in
# the same field.  `l'eau` came out glossed "water, a liquid that is transparent,
# colorless, odorless, and tasteless in its pure form, the primary constituent
# of ...", which is a dictionary's job and not a flashcard's; `la madame`, `le
# gâteau`, `la pomme` and fourteen more did the same.  Measured over the deck,
# only 15 of 508 leading glosses run past 80 characters, so the rule bites where
# it should and nowhere else.
MAX_LINE = 48      # past this, it has stopped being a translation
MAX_HEAD = 30      # and this is how short the salvaged head has to be


# A SUB-SENSE OPENS ON A DISCOURSE MARKER, AND THE COMMA AFTER IT IS NOT A LIST
# COMMA.  Wiktionary writes `l'eau`'s second sense as "In particular, rain",
# which `comma_parts` split into two lines -- so the card offered "water", "In
# particular" and "rain" as three meanings, one of which is not a word.  The
# marker is stripped and what it introduces is kept.
DISCOURSE_RX = re.compile(
    r'^(?:in particular|particularly|especially|specifically|by extension|'
    r'figuratively|more generally|generally|broadly|loosely|hence)\s*[,:]\s*',
    re.I)


def head_of(part):
    """The translation at the front of a definition, or ''.

    `water, a liquid that is ...` -> `water`; `a sponge cake, i.e. a cake made
    with ...` -> `a sponge cake`; `A form of address ... : Miss` -> `Miss`, since
    Wiktionary puts the gloss proper after the colon when it writes one.
    """
    m = re.search(r':\s*([^:;]{2,%d})$' % MAX_HEAD, part)
    if m:
        return m.group(1).strip()
    head = re.split(r',\s|\s\(', part, 1)[0].strip()
    return head if 2 <= len(head) <= MAX_HEAD else ''


def meaning_lines(glosses, cap=4):
    out = []
    for g in glosses:
        for semi in (re.split(r';(?![^(]*\))', g) if '(' in g else g.split(';')):
            semi = DISCOURSE_RX.sub('', semi.strip(' ;,'))
            if not semi:
                continue
            for part in comma_parts(semi):
                part = part.strip(' ;,')
                if not part or part in out:
                    continue
                if re.fullmatch(r'\([^)]*\)', part) and out:
                    out[-1] += ' ' + part
                    continue
                if len(part) > MAX_LINE:
                    # salvage the translation at its head; drop the definition
                    # outright where the card already has a meaning to show
                    part = head_of(part)
                    if not part or part in out:
                        continue
                out.append(part)
    if not out:
        # nothing survived the trim -- keep the first gloss whole rather than
        # ship a card with no meaning at all
        out = [g.strip() for g in glosses if g.strip()][:1]
    return out[:cap]


def meanings_html(glosses):
    lines = meaning_lines(glosses)
    if len(lines) <= 1:
        return f'<div class="uc-gl">{esc(lines[0] if lines else "")}</div>'
    return ('<ul class="uc-gls">' +
            ''.join(f'<li>{esc(x)}</li>' for x in lines) + '</ul>')


# ---------------------------------------------------------------- other forms
def forms_html(e, rec, pos, gender, elided):
    bits = []
    if pos == 'noun' and rec is not None:
        if elided:
            # THE LESSON THE ELIDED ARTICLE SWALLOWS.  `l'` is the same string for
            # both genders, so on these words the indefinite article is what says
            # which one it is.
            art = INDEF_ART.get(gender[:1])
            if art:
                bits.append(('with un/une', art + ' ' + e['word']))
        pl = plural_of(rec)
        # only where it is not the regular +s: printing `les livres` under
        # `le livre` teaches a rule the reader already has
        if pl and pl.lower() != (e['word'].lower() + 's'):
            bits.append(('plural', 'les ' + pl))
        fem = feminine_of(rec, e['lemma'])
        if fem:
            # THE FEMININE TAKES ITS OWN ARTICLE, NOT THE HEADWORD'S.  Written
            # `'la ' + fem` this row printed `la étudiante`, `la amie` and `la
            # employée` -- ungrammatical French, on a card whose whole subject
            # is which article a word takes, under a headword correctly reading
            # `l'étudiant`.  The elision is a property of the word it stands in
            # front of and has to be recomputed for the feminine, which begins
            # with the same letter as its masculine and so gets it right often
            # enough for the fault to look like an exception rather than a rule.
            bits.append(('feminine', ("l'" if elides(fem) else 'la ') + fem))
    if pos == 'adj' and rec is not None:
        fem = pick_form(rec, {'feminine'}, without={'plural'})
        if fem:
            bits.append(('feminine', fem))
        bv = pick_form(rec, {'before-vowel', 'masculine', 'singular'})
        if bv:
            bits.append(('before a vowel', bv))
    if not bits:
        return ''
    return '<div class="uc-forms">' + ''.join(
        f'<span class="uc-fi"><span class="uc-fl">{esc(a)}</span>{esc(b)}</span>'
        for a, b in bits) + '</div>'


def examples_html(exs):
    out = []
    for x in exs:
        fr, en, form = x['fr'], x['en'], x['form']
        pat = re.compile(r'(?<![^\W\d_])(' + re.escape(form) + r')(?![^\W\d_])',
                         re.I | re.UNICODE)
        shown = pat.sub(lambda m: '<b>' + esc(m.group(1)) + '</b>', esc(fr), count=1)
        out.append('<div class="uc-exi">'
                   f'<div class="uc-exz"><span class="uc-tts uc-exsay" data-say="{esc(fr)}"></span>{shown}</div>'
                   f'<div class="uc-exe">{esc(en)}</div></div>')
    return ''.join(out)


def ipa_of(recs):
    """The transcription to print, preferring the European standard.

    A REGION TAG ON A PRONUNCIATION IS NOT THE SAME THING AS ONE ON A SENSE, and
    treating them alike is how `le chien` shipped with no pronunciation at all.
    A sense tagged `Belgium` is a regionalism to push down the card; a
    PRONUNCIATION tagged `Belgium, France` is the ordinary European one, marked
    only because Wiktionary is distinguishing it from Quebec's.  So nothing is
    rejected here -- an untagged transcription is preferred, then one that names
    France, then whatever there is.
    """
    got = []
    for r in recs or []:
        for s in (r.get('sounds') or []):
            if s.get('ipa'):
                got.append((set(s.get('tags') or []), s['ipa']))
    for tags, ip in got:
        if not tags:
            return ip
    for tags, ip in got:
        if 'France' in tags:
            return ip
    return got[0][1] if got else ''


# ---------------------------------------------------------------- build
GENDER_CLASS = {'m': 'uc-m', 'f': 'uc-f'}
GENDER_NAME = {'m': 'masculine', 'f': 'feminine'}

# A PLURAL THAT IS HOW THE WORD IS MET, which is what tells A1's `chaussettes`
# from B1's `aspects`: a word in here cards as `les chaussettes` and one outside
# it as `l'aspects`.  Hand-written because the question is about the WORD rather
# than about its record -- both have a single Wiktionary sense reading `plural
# of X` and nothing else -- and it is read off the word, never derived.
# `déchets` is B2's one: French says `les déchets` for waste, and the list
# prints no singular, so it stays and is carded in the plural.
PLURAL_ONLY = {'les', 'des', 'ces', 'mes', 'ils', 'elles', 'chaussettes',
               'sandales', 'devoirs', 'gens', 'vêtements', 'parents',
               'déchets',
               # C1's three, each repaired from a singular the list printed and
               # the dictionary has no record of: mumps, bones and talks are
               # plurals in French the way `les gens` is.
               'oreillons', 'ossements', 'pourparlers'}

cards, stats, forced_missing = [], Counter(), []
for i, e in enumerate(entries, 1):
    rec, pos, same_pos = pick_pos(e)
    # A FORCED CLASS THE DUMP HAS NO RECORD FOR IS REPORTED RATHER THAN LEFT TO
    # BE DISCOVERED.  It is legitimate -- `une` is exactly that -- but it means
    # the card's meaning has to come from AUTHORED, and where it does not the
    # build stops at the blank-meaning guard below with no clue as to why.
    if e['key'] in FORCE_POS and not same_pos:
        forced_missing.append(f"{e['key']} ({FORCE_POS[e['key']]})")
    recs_all = W.get(e['lemma'], [])
    gender = gender_of(rec) if (rec is not None and pos == 'noun') else ''
    plural_only = pos == 'noun' and e['word'] in PLURAL_ONLY

    art, elided = ('', False)
    if pos == 'noun':
        art, elided = article_for(e['word'], gender, plural_only, e['group'])
        if art:
            e['display'] = art + ('' if elided else ' ') + e['word']
            stats['nouns with an article'] += 1

    if e['key'] in AUTHORED:
        glosses = AUTHORED[e['key']]
    else:
        glosses = merged_glosses(same_pos, gender == 'f', e['reflexive'])
        if not glosses:
            glosses = pointed_glosses(same_pos or [rec], gender == 'f')
    # A PROPER NOUN NEEDS ONE MEANING AND NOT THREE.  `France` came out glossed
    # "France; a female given name; a French surname" -- the last two true of the
    # string and useless on a card about the country.
    if pos == 'name':
        glosses = glosses[:1]
    if not glosses:
        stats['no gloss'] += 1

    label = POS_NAME.get(pos, pos)
    if pos == 'noun' and gender and not plural_only:
        label += ', ' + ' or '.join(GENDER_NAME.get(g, g) for g in gender)
    if plural_only:
        label += ', plural'
    if e['reflexive']:
        label = 'pronominal ' + label

    english = ('<div class="uc-sense"><div class="uc-pos">' + esc(label) + '</div>' +
               meanings_html(glosses) + '</div>')

    if pos == 'verb':
        conj = conjugation_html(e, rec, e['reflexive'])
    elif pos == 'adj':
        conj = adj_panel(e, rec)
    else:
        conj = ''
    forms = forms_html(e, rec, pos, gender, elided)
    exs = EX.get(e['key'], [])
    stats['verbs with a paradigm'] += bool(conj and pos == 'verb')
    stats['adjectives with agreement'] += bool(conj and pos == 'adj')
    stats['irregular plurals'] += 'plural</span>' in forms
    stats['feminines'] += 'feminine</span>' in forms
    stats['elided articles'] += bool(elided)
    stats['no examples'] += not exs

    plain = '; '.join(meaning_lines(glosses, cap=3))
    # the headword, with the article coloured by gender -- `l'` closes up against
    # the word, `le` and `la` take a space
    if art:
        french = (f'<span class="uc-art {GENDER_CLASS.get(gender[:1], "")}">{esc(art)}</span>'
                  + ('' if elided else ' ') + esc(e['word']))
    else:
        french = esc(e['display'])

    cards.append({
        'id': f'u_{{DECK}}_{i}', 'num': str(i), 'category': 'DELF ' + e.get('lvl', ''),
        'sub': '', 'question': e['display'], 'answer': plain,
        'answerDate': '', 'traditional': '', 'hanzi': '', 'pinyin': '',
        'translations': '', 'abstract': '', 'citation': '', 'answerText': plain,
        'type': '{TYPE}',
        'fields': {
            'French': french,
            'Word': e['word'],
            'Ipa': ipa_of(recs_all),
            'English': english,
            'Forms': forms,
            'Conjugation': conj,
            'Examples': examples_html(exs),
        },
    })

if forced_missing:
    print('  FORCE_POS names a class the dump has no record for, so the meaning must'
          ' come from AUTHORED:', ', '.join(forced_missing))
blank = [c['question'] for c in cards if not c['answerText'].strip()]
if blank:
    raise SystemExit('cards with no meaning at all: ' + ' | '.join(blank) +
                     '\n  -- give each one an AUTHORED gloss, or drop it from FORCE_POS'
                     ' so it falls back to the class Wiktionary leads with')
print('  cards:', len(cards), dict(stats))
json.dump(cards, open(lvlf('cards.json'), 'w'), ensure_ascii=False)
