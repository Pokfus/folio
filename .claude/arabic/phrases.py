#!/usr/bin/env python3
"""The Arabic Phrases and Expressions deck: set phrases, idioms and proverbs.

    python3 .claude/arabic/phrases.py

Writes `decks/Arabic-Phrases-and-Expressions.folio-deck.json`.  Needs the cache the level decks build
(`run.py`): kaikki's extract, Tatoeba, and every level's `wordlist-<lv>.json`.

Not a CEFR level: an expression is a unit a list of words cannot see.  Three subdecks, as the Turkish and
Indonesian phrases decks have — PHRASES (the everyday formulas: a greeting's reply, thanks, wishes,
condolences, "God knows", "no problem"), IDIOMS (a meaning that is not its words': "to save face", "the tip
of the iceberg") and PROVERBS (a complete saying with a moral).

THE SOURCE IS WIKTIONARY, THE SELECTION AND THE ENGLISH ARE FOLIO'S.  Every row of `ROWS` below must be an
Arabic entry of kaikki's extract — a phrase, an interjection, an entry tagged idiomatic, or a proverb — and
the build stops on one that is not.  Wiktionary's Arabic phrases (321 candidates, Nov 2026) were read whole
and a row was written only for an expression a learner of Modern Standard Arabic meets and uses.  Left out,
each for a reason the deck's description repeats:
  * formulas of worship and honorifics (the shahada, the basmala, the blessings said after the Prophet's or a
    companion's name), and Christian formulas — the everyday sayings of religious origin that any speaker
    uses socially (الله أعلم "who knows", لا بأس, إنا لله وإنا إليه راجعون on hearing of a death) are in;
  * political slogans ("from the river to the sea", "free Palestine", "workers of the world, unite");
  * phrasebook sentences, which a learner builds rather than learns ("do you speak English?", "I am Arab");
  * dialect, Classical-only and archaic entries, misspellings and alternative forms, a mnemonic, onomatopoeia
    (laughter, shepherds' calls), and near-duplicates (three idioms for "to play a role" keep one);
  * anything a level deck already teaches (السلام عليكم, صباح الخير, إن شاء الله … are A1 and A2 cards).
The English is written for a learner, with the literal sense in brackets where it helps an idiom stick.

THE HEADWORD is written here, vowelled as Wiktionary vowels it but with the clitics joined to their word
(Wiktionary spaces some: `بِ إِذْنِ`), the plain alif for the wasla and no punctuation.  THE ROMANISATION is
Wiktionary's where the entry has one, else `ar.translit` (its scheme, scored against every Arabic phrase
Wiktionary romanises: 196 of 213 the same, the rest Wiktionary's own inconsistencies); the build prints which.

THE ORDER, within each subdeck, is how many Tatoeba sentences contain the expression (its words in a row,
the first allowed the clitics `ar.PREFIXES`); ties by spelling.  Up to three sentences come with each, chosen
as `examples.py` chooses (3–12 tokens, shortest first), through the same refusal lists from A2 to C1.
"""
import bz2, html, json, os, re, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ar, examples, ar_level

E = lambda s: html.escape(s, quote=True)
STAMP = "2026-11-13T06:00:00.000Z"
FILE = "Arabic-Phrases-and-Expressions.folio-deck.json"
SUBS = ["Phrases", "Idioms", "Proverbs"]
# An expression's first word is found with و or ف before it, never the article: `الاف` "thousands" is not أُفٍّ.
FIRST = ["", "و", "ف"]
# Every Tatoeba hit is another word or another sense, so these take no sentence and count nothing:
# تُرَى "I wonder" is every form of رَأَى "to see"; أُفٍّ is أَلْف; يَعْنِي is the verb "it means"; الْمُهِمّ
# is the adjective "the important"; يُتْبَعُ "to be continued" is "he follows"; مِنْ جَدِيدٍ is "anything new?".
NO_SENTENCES = {"تُرَى", "أُفٍّ", "يَعْنِي", "الْمُهِمّ", "يُتْبَعُ", "مِنْ جَدِيدٍ"}
# Sentences refused for one expression (English substrings): the literal sense, or a death.
REFUSE_EN = {"بَيْنِي وَبَيْنَكَ": ["difference"], "فِي نِهَايَةِ الْمَطَافِ": ["dead"]}
# Romanisations neither Wiktionary nor `ar.translit` gets right: يَا لَلْهَوْلِ has the لَ of exclamation.
ROMAN_FIX = {"يَا لَلْهَوْلِ": "yā la-l-hawli"}
POS = {"Phrases": "phrase", "Idioms": "idiom", "Proverbs": "proverb"}

# headword | subdeck (P, I, V) | English
ROWS = """
اَللّٰهُ أَعْلَمُ | P | God knows; who knows?
سُبْحَانَ اللّٰهِ | P | glory be to God! (also: how amazing!)
لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ | P | there is no power but God's (said in the face of misfortune)
إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ | P | we belong to God and to Him we return (said on hearing of a death)
أَسْتَغْفِرُ اللّٰهَ | P | God forgive me (also a modest "not at all")
مَعَاذَ اللّٰهِ | P | God forbid!
بِإِذْنِ اللّٰهِ | P | God willing (literally, by God's leave)
رَحِمَهُ اللّٰهُ | P | God rest his soul
جَزَاكَ اللّٰهُ | P | thank you (literally, may God reward you)
عِيد مُبَارَك | P | Eid Mubarak, a blessed feast
عِيد مِيلَاد سَعِيد | P | happy birthday!
كُلُّ عَامٍ وَأَنْتُمْ بِخَيْرٍ | P | many happy returns (said at feasts, birthdays and the new year)
أَلَيْسَ كَذٰلِكَ | P | isn't it? isn't that so?
صَبَاح النُّور | P | good morning (the reply to صَبَاحُ الْخَيْرِ)
مَسَاء النُّور | P | good evening (the reply to مَسَاءُ الْخَيْرِ)
بِالْهَنَاءِ وَالشِّفَاءِ | P | enjoy it, and good health (said over food)
شَهِيَّة طَيِّبَة | P | bon appétit
فُرْصَة سَعِيدَة | P | pleased to meet you
تَشَرَّفْنَا | P | nice to meet you (literally, we are honoured)
إِلَى اللِّقَاءِ | P | goodbye, see you
وَدَاعًا | P | farewell
أَرَاكَ لَاحِقًا | P | see you later (to a man)
لَيْلَة سَعِيدَة وَأَحْلَام لَذِيذَة | P | good night and sweet dreams
شُكْرًا جَزِيلًا | P | thank you very much
الْعَفْو | P | don't mention it
عُذْرًا | P | sorry, my apologies
لَا بَأْسَ | P | no problem; it's all right
بِالتَّوْفِيقِ | P | good luck!
بِكُلِّ تَأْكِيدٍ | P | certainly, absolutely
لَا جَرَمَ | P | no doubt, certainly
لَا بُدَّ | P | it's a must; inevitably
عَارٌ عَلَيْكَ | P | shame on you!
بَيْنِي وَبَيْنَكَ | P | between you and me
مَا الْمَسْؤُولُ بِأَعْلَمَ مِنَ السَّائِلِ | P | your guess is as good as mine
ثُمَّ مَاذَا | P | so what? and then what?
لَعَلَّ وَعَسَى | P | let's hope so
أَضْعَف الْإِيمَان | P | the very least one can do
مَا أَدْرَاكَ | P | how would you know?
كَائِنًا مَا كَانَ | P | whatever it may be
كَائِنًا مَنْ كَانَ | P | whoever it may be
حَبَّذَا لَوْ | P | how good it would be if …
يَا لَلْهَوْلِ | P | how awful! good grief!
مِنَ الْآنَ فَصَاعِدًا | P | from now on
وَمَا إِلَى ذٰلِكَ | P | and the like, and so on
وَهٰكَذَا دَوَالَيْكَ | P | and so on, round and round
مِنْ جَدِيدٍ | P | all over again
شَاءَ مَنْ شَاءَ وَأَبَى مَنْ أَبَى | P | like it or not
عَارٍ عَنِ الصِّحَّةِ | P | groundless, untrue
فِي وَضَحِ النَّهَارِ | P | in broad daylight
وَاللّٰهِ | P | by God!; really?
يَعْنِي | P | I mean; that is to say
الْمُهِمّ | P | anyway; the main thing is …
آلُو | P | hello? (on the telephone)
تُرَى | P | I wonder … (before a question)
صَهْ | P | hush! shh!
آهِ | P | ah! ouch!
أُفٍّ | P | ugh! (in annoyance)
يُتْبَعُ | P | to be continued
بَيْنَ الْمِطْرَقَةِ وَالسَّنْدَانِ | I | between a rock and a hard place (literally, between the hammer and the anvil)
حَفِظَ مَاءَ الْوَجْهِ | I | to save face
بَلَغَ السَّيْلُ الزُّبَى | I | things have gone too far
طَفَحَ الْكَيْلُ | I | enough is enough (literally, the measure has overflowed)
الْقَشَّةُ الَّتِي قَصَمَتْ ظَهْرَ الْبَعِيرِ | I | the straw that broke the camel's back
كَشَفَ النِّقَابَ | I | to lift the veil (on), to reveal
زَادَ الطِّينَ بِلَّةً | I | to make matters worse
لَيْتَ شِعْرِي | I | I wish I knew
وَهَلُمَّ جَرًّا | I | and so on and so forth
بَيْنَ لَيْلَةٍ وَضُحَاهَا | I | overnight, all of a sudden
ذُو وَجْهَيْنِ | I | two-faced
لَا يُسْمِنُ وَلَا يُغْنِي مِنْ جُوعٍ | I | useless (literally, it neither fattens nor stills hunger)
أَذَّنَ فِي مَالْطَا | I | to talk to deaf ears (literally, to call to prayer in Malta)
خِيَارَانِ أَحْلَاهُمَا مُرّ | I | a choice between two evils (literally, the sweeter of the two is bitter)
فُلَان وَفُلَان | I | so-and-so and so-and-so
لَا نَاقَةَ لَهُ فِيهِ وَلَا جَمَلَ | I | to have nothing to do with it
بَسَطَ يَدَهُ | I | to be generous (literally, to open one's hand)
أَضْحَكَ الثَّكْلَى | I | to be utterly absurd
وَضَعَتِ الْحَرْبُ أَوْزَارَهَا | I | the war is over
اِنْقَلَبَ عَلَى عَقِبَيْهِ | I | to turn on one's heel, to turn back
شَمَّرَ عَنْ سَاعِدِ الْجِدِّ | I | to roll up one's sleeves
كُلُّ مَنْ هَبَّ وَدَبَّ | I | every Tom, Dick and Harry
أَتَى عَلَى الْأَخْضَرِ وَالْيَابِسِ | I | to destroy everything in its path
ذَهَبَ أَدْرَاجَ الرِّيَاحِ | I | to come to nothing (literally, to go the way of the winds)
جُنَّ جُنُونًا | I | to go mad
رَشَّ الْمِلْحَ عَلَى الْجُرْحِ | I | to rub salt in the wound
اللَّفّ وَالدَّوَرَان | I | beating about the bush
قَضَى نَحْبَهُ | I | to pass away
بَيْنَ شِقَّيِ الرَّحَى | I | caught between two pressures (literally, between the two millstones)
لَعِبَ عَلَى الْحَبْلَيْنِ | I | to play both sides
رَجَعَ بِخُفَّيْ حُنَيْنٍ | I | to come back empty-handed
خَيْرُهَا بِغَيْرِهَا | I | better luck next time
عَلَى خَيْرِ مَا يُرَامُ | I | couldn't be better
مِنْ سَابِعِ الْمُسْتَحِيلَاتِ | I | next to impossible
خَبَطَ خَبْطَ عَشْوَاءَ | I | to act blindly, at random
لَقِيَ حَتْفَهُ | I | to meet one's end
بِأَبْهَى حُلَّةٍ | I | at its finest
صَالَ وَجَالَ | I | to have free rein
لَعِبَ دَوْرًا | I | to play a role
بِشَقِّ الْأَنْفُسِ | I | with great difficulty
دُونَ أَنْ يَرِفَّ لَهُ جَفْنٌ | I | without batting an eyelid
إِبْرَةٌ فِي كَوْمَةِ قَشٍّ | I | a needle in a haystack
أَرْضِيَّةٌ مُلَائِمَةٌ | I | fertile ground (for something to grow)
حَارَبَ طَوَاحِينَ الْهَوَاءِ | I | to tilt at windmills
عَلَى مَرْأًى وَمَسْمَعٍ | I | in full view and hearing (of)
ثَقِيل الدَّم | I | tiresome, unpleasant (of a person)
قَيْدَ شَعْرَةٍ | I | (not) a hair's breadth, (not) an inch
جَعْجَعَةٌ بِلَا طِحْنٍ | I | much ado about nothing (literally, grinding noise and no flour)
أُسْطُوَانَة مَشْرُوخَة | I | a broken record
عَادَ أَدْرَاجَهُ | I | to go back the way one came
الْأَيَّامُ بَيْنَنَا | I | time will tell
أَبًا عَنْ جَدٍّ | I | from father to son, for generations
اِبْتَلَعَ الطُّعْمَ | I | to swallow the bait
كَالَ بِمِكْيَالَيْنِ | I | to apply double standards
فِي نِهَايَةِ الْمَطَافِ | I | in the end, at the end of the day
أَكَلَ الدَّهْرُ عَلَيْهِ وَشَرِبَ | I | old and worn out, outdated
ضَرْبٌ مِنْ ضُرُوبِ الْخَيَالِ | I | a pipe dream
سَابَقَ الزَّمَنَ | I | to race against time
سَبَقَ عَصْرَهُ | I | to be ahead of one's time
غَيْض مِنْ فَيْض | I | the tip of the iceberg
سَيْفٌ ذُو حَدَّيْنِ | I | a double-edged sword
مَا أَنْزَلَ اللّٰهُ بِهِ مِنْ سُلْطَانٍ | I | unheard of, without any basis
كَلِمَةُ حَقٍّ يُرَادُ بِهَا بَاطِلٌ | I | a truth used to serve a falsehood
أَبَى إِلَّا | I | to insist on (literally, to refuse anything but)
بَلَغَتِ الْقُلُوبُ الْحَنَاجِرَ | I | to be terrified (literally, hearts reached the throats)
جَعَلَ عَالِيَ الشَّيْءِ سَافِلَهُ | I | to turn something upside down
مِنَ الْمَهْدِ إِلَى اللَّحْدِ | I | from the cradle to the grave
لِلّٰهِ فِي خَلْقِهِ شُؤُونٌ | I | God works in mysterious ways
أَنَا الْغَرِيقُ فَمَا خَوْفِي مِنَ الْبَلَلِ | V | I'm already drowning, so why fear getting wet?
سَلَامَةُ الْإِنْسَانِ فِي حِفْظِ اللِّسَانِ | V | a guarded tongue keeps you safe
الْغَايَةُ تُبَرِّرُ الْوَسِيلَةَ | V | the end justifies the means
ثَبِّتِ الْعَرْشَ ثُمَّ انْقُشْ | V | establish the facts before you draw conclusions
نَاقِلُ الْكُفْرِ لَيْسَ بِكَافِرٍ | V | repeating a claim is not endorsing it
فَسَّرَ الْمَاءَ بَعْدَ الْجُهْدِ بِالْمَاءِ | V | to state the obvious at great length
عَدُوُّ عَدُوِّي صَدِيقِي | V | the enemy of my enemy is my friend
وَرَاءَ كُلِّ رَجُلٍ عَظِيمٍ امْرَأَةٌ | V | behind every great man there is a woman
كُلٌّ يَبْكِي عَلَى لَيْلَاهُ | V | each to his own (literally, everyone weeps for his own Layla)
لِكُلِّ قَاعِدَةٍ شَوَاذُّ | V | every rule has its exceptions
مَنْ حَفَرَ حُفْرَةً لِأَخِيهِ وَقَعَ فِيهَا | V | he who digs a pit for his brother falls into it
رِضَا النَّاسِ غَايَةٌ لَا تُدْرَكُ | V | you can't please everyone
لَا تَجْعَلِ الْحَبَّةَ قُبَّةً | V | don't make a mountain out of a molehill
لِأَجْلِ عَيْنٍ أَلْفُ عَيْنٍ تُكْرَمُ | V | for the sake of one you love, a thousand are honoured
الصَّدِيقُ وَقْتَ الضِّيقِ | V | a friend in need is a friend indeed
مَا حَكَّ جِلْدَكَ مِثْلُ ظُفْرِكَ | V | if you want something done, do it yourself
مَا فَاتَ قَدْ مَاتَ | V | what's done is done
عَيْنُ الرِّضَا عَنْ كُلِّ عَيْبٍ كَلِيلَةٌ | V | love is blind to faults
مَصَائِبُ قَوْمٍ عِنْدَ قَوْمٍ فَوَائِدُ | V | one man's loss is another man's gain
تَجْرِي الرِّيَاحُ بِمَا لَا تَشْتَهِي السُّفُنُ | V | things don't always go as planned
مَا هٰكَذَا يَا سَعْدُ تُورَدُ الْإِبِلُ | V | that's not the way to do it
أَهْلُ مَكَّةَ أَدْرَى بِشِعَابِهَا | V | locals know their own ground best
لِلنَّجَاحِ أَلْفُ أَبٍ وَلِلْهَزِيمَةِ وَلَدٌ يَتِيمٌ | V | success has many fathers, failure is an orphan
يَا طَبِيبُ طُبَّ لِنَفْسِكَ | V | physician, heal thyself
لَا تَنْهَ عَنْ خُلُقٍ وَتَأْتِيَ مِثْلَهُ | V | practise what you preach
لِكُلِّ امْرِئٍ مِنِ اسْمِهِ نَصِيبٌ | V | everyone lives up to his name a little
مَنْ أَكْثَرَ النَّوْمَ سَبَقَهُ الْقَوْمُ | V | sleep too much and others overtake you
مَنِ اغْتَرَّ بِالْأَمَلِ تَرَكَ الْعَمَلَ | V | wishful thinking stops the work
مَنْ لَزِمَ الرُّقَادَ حُرِمَ الْمُرَادَ | V | no pain, no gain (literally, who keeps to his bed misses his goal)
مَنْ تَأَنَّى نَالَ مَا تَمَنَّى | V | slow and steady wins the race
اِسْتَجَارَ مِنَ الرَّمْضَاءِ بِالنَّارِ | V | out of the frying pan into the fire
الطَّبْعُ يَغْلِبُ التَّطَبُّعَ | V | a leopard can't change its spots
أَعْطِ الْقَوْسَ بَارِيَهَا | V | leave it to the experts
كَمَا تَدِينُ تُدَانُ | V | as you sow, so shall you reap
لِلْحِيطَانِ آذَانٌ وَلِلشَّوَارِعِ أَلْسِنَةٌ | V | walls have ears (and streets have tongues)
الْغُرْمُ بِالْغُنْمِ | V | no gain without its cost
الْبَحْرُ يُحِبُّ الزِّيَادَةَ | V | the more you have, the more you want (literally, the sea loves to grow)
الْعَيْنُ بِالْعَيْنِ | V | an eye for an eye
"""


def rows():
    out = []
    for line in ROWS.strip().splitlines():
        h, s, en = [x.strip() for x in line.split("|")]
        out.append({"head": h, "sub": {"P": "Phrases", "I": "Idioms", "V": "Proverbs"}[s], "en": en})
    return out


def key(s):
    """A phrase's matching key: folded, no punctuation, the clitics Wiktionary spaces joined, and the plain
    alif wasla it sometimes writes with a stray fatha (`ٱَلبَحْرُ`)."""
    s = re.sub(r"[؟?!،.,…]", "", s.replace("ٱ", "ا"))
    s = re.sub(r"(^|\s)([وفبلك])\s+", r"\1\2", ar.bare(s))
    s = re.sub(r"\s+(ك|ه|ها|نا|ي|كم|هم)(?=\s|$)", r"\1", s)
    return " ".join(ar.fold(s).split())


def vowels(s):
    """The vowelled spelling, normalised as `key` normalises the bare one: the comparison that decides
    whether Wiktionary's romanisation describes the printed headword."""
    s = re.sub(r"[؟?!،.,…]", "", s.replace("ٱ", "ا"))
    s = re.sub(r"(^|\s)([وفبلك][\u064B-\u0652]?)\s+", r"\1\2", s)
    return " ".join(s.split())


def candidates():
    """Wiktionary's Arabic phrases, idioms, proverbs and interjections: key -> (canonical, romanisation)."""
    out = {}
    with open(os.path.join(ar.CACHE, "kaikki-ar.jsonl"), encoding="utf-8") as fh:
        for line in fh:
            e = json.loads(line)
            if e.get("lang_code") != "ar":
                continue
            tags = {t for s in e.get("senses") or [] for t in (s.get("tags") or [])}
            if not (e["pos"] in ("phrase", "intj", "proverb") or ("idiomatic" in tags and " " in e["word"])):
                continue
            forms = e.get("forms") or []
            canon = [f["form"] for f in forms if "canonical" in (f.get("tags") or [])]
            rom = [f["form"] for f in forms if (f.get("tags") or []) == ["romanization"]]
            k = key(canon[0] if canon else e["word"])
            if k not in out or (rom and not out[k][1]):
                out[k] = (canon[0] if canon else e["word"], rom[0] if rom else "")
            out.setdefault(key(e["word"]), out[k])
    return out


def taught():
    out = set()
    for lv in ["a1", "a2", "b1", "b2", "c1"]:
        for w in json.load(open(os.path.join(ar.CACHE, "wordlist-%s.json" % lv), encoding="utf-8"))["words"]:
            out.add(key(w["head"]))
    return out


def main():
    D = ar.load_dict()
    C = candidates()
    T = taught()
    R = rows()
    bad = [r["head"] for r in R if key(r["head"]) not in C]
    if bad:
        raise SystemExit("not an Arabic phrase, idiom, proverb or interjection on Wiktionary: " + ", ".join(bad))
    dup = [r["head"] for r in R if key(r["head"]) in T]
    if dup:
        raise SystemExit("taught by a level deck: " + ", ".join(dup))
    seen_k, seen_e = set(), set()
    for r in R:
        if key(r["head"]) in seen_k or r["en"] in seen_e:
            raise SystemExit("twice: " + r["head"] + " / " + r["en"])
        seen_k.add(key(r["head"]))
        seen_e.add(r["en"])
    made = []
    for r in R:
        canon, rom = C[key(r["head"])]
        # Wiktionary's own, when the vowels it romanised are the ones printed (else its roman could say
        # -un where the card shows none) and it is not a stray letter (`t`)
        same = vowels(canon) == vowels(r["head"])
        if r["head"] in ROMAN_FIX:
            r["roman"] = ROMAN_FIX[r["head"]]
        elif len(rom) > 2 and same:
            r["roman"] = rom.rstrip("?!").replace(" ...", "").strip().replace("ʿ", "ʕ").replace("ʾ", "ʔ")
        else:
            r["roman"] = ar.translit(r["head"], D)
            made.append(r["head"])

    # ---- Tatoeba: the count and the sentences ----
    ara = {x[0]: x[2] for x in examples.read_tsv("ara_sentences.tsv.bz2") if len(x) >= 3}
    links = defaultdict(list)
    for x in examples.read_tsv("ara-eng_links.tsv.bz2"):
        if len(x) >= 2 and x[0] in ara:
            links[x[0]].append(x[1])
    need = {e for v in links.values() for e in v}
    eng = {x[0]: x[2] for x in examples.read_tsv("eng_sentences.tsv.bz2") if len(x) >= 3 and x[0] in need}
    refuse_any = examples.REFUSE_ANY_EN_A2 + examples.REFUSE_ANY_EN_B1 + examples.REFUSE_ANY_EN_B2 + \
        examples.REFUSE_ANY_EN_C1
    sents = []
    for sid, text in ara.items():
        toks = ar.tokens(text)
        en = [eng[e] for e in sorted(links.get(sid, []), key=int) if e in eng]
        sents.append((len(toks), int(sid), toks, [ar.fold(t) for t in toks], text, en[0] if en else ""))
    sents.sort(key=lambda x: (x[0], x[1]))
    first = defaultdict(list)
    for i, s_ in enumerate(sents):
        for f in set(s_[3]):
            first[f].append(i)

    def find(parts, s_):
        n = len(parts)
        for j in range(len(s_[3]) - n + 1):
            head = s_[3][j]
            if any(p + parts[0] == head for p in FIRST) and s_[3][j + 1:j + n] == parts[1:]:
                return " ".join(s_[2][j:j + n])
        return None

    for r in R:
        parts = key(r["head"]).split()
        cand = sorted({i for p in FIRST for i in first.get(p + parts[0], [])})
        if r["head"] in NO_SENTENCES:
            cand = []
        hits = [(i, find(parts, sents[i])) for i in cand]
        hits = [(i, h) for i, h in hits if h]
        r["count"] = len(hits)
        got, seen_ar, seen_en = [], set(), set()
        for i, h in hits:
            s_ = sents[i]
            if not s_[5] or not (examples.MIN_W <= s_[0] <= examples.MAX_W) or s_[4] in seen_ar or s_[5] in seen_en:
                continue
            ratio = len(s_[5]) / max(1, len(s_[4]))
            if ratio > 3 or ratio < 1 / 3 or any(x in s_[4] for x in examples.REFUSE_ANY) \
                    or any(x in s_[5] for x in refuse_any) or any(x in s_[5] for x in REFUSE_EN.get(r["head"], ())):
                continue
            seen_ar.add(s_[4]); seen_en.add(s_[5])
            got.append({"ar": s_[4], "en": s_[5], "hit": h})
            if len(got) == 3:
                break
        r["ex"] = got

    R.sort(key=lambda r: (SUBS.index(r["sub"]), -r["count"], ar.bare(r["head"])))
    cards = []
    for r in R:
        exs = "".join(
            '<div class="uc-exi"><div class="uc-exz" dir="rtl" lang="ar"><span class="uc-tts uc-exsay" data-say="%s">'
            '</span>%s</div><div class="uc-exe">%s</div></div>' % (E(x["ar"]), _mark(x["ar"], x["hit"]), E(x["en"]))
            for x in r["ex"])
        cards.append({
            "sub": r["sub"],
            "fields": {
                "Arabic": '<div class="uc-word" dir="rtl" lang="ar">%s</div>' % E(r["head"]),
                "Word": r["head"],
                "Roman": E(r["roman"]),
                "English": '<div class="uc-pos">%s</div><div class="uc-gl">%s</div>' % (POS[r["sub"]], E(r["en"])),
                "Forms": "", "Table": "", "Examples": exs,
            },
            "id": "u_arabicphrase_%d" % (len(cards) + 1),
            "type": "arabic",
        })
    css = open(os.path.join(ar.HERE, "card.css"), encoding="utf-8").read()
    meta = ar_level.meta_phrases(cards, R, made, css, STAMP)
    deck = {"folioDeck": 1, "exportedAt": STAMP, "meta": meta, "cards": cards, "gloss": {}}
    out = os.path.abspath(os.path.join(ar.DECKS, FILE))
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(deck, fh, ensure_ascii=False)
    n = {s: sum(r["sub"] == s for r in R) for s in SUBS}
    print("  romanised here (Wiktionary has none): %d — %s" % (len(made), "، ".join(made)))
    print("  wrote %s: %d expressions (%s), %d with sentences, %d bytes" % (
        out, len(cards), ", ".join("%d %s" % (n[s], s.lower()) for s in SUBS), sum(bool(r["ex"]) for r in R),
        os.path.getsize(out)))


def _mark(text, hit):
    i = text.find(hit)
    if i < 0:
        return E(text)
    return E(text[:i]) + "<b>" + E(hit) + "</b>" + E(text[i + len(hit):])


if __name__ == "__main__":
    main()
