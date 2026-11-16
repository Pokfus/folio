# The Burmese language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Burmese deck in `decks/`.** It is the plan for a
language set in the shape of the ones already shipped (Thai, Amharic, Hindi …); `docs/lang-decks.md` is the
record of how those were built, and every rule there applies here unless this file says otherwise. Asked for
on 2026-11-15: "Add a Burmese language collection." The owner was not asked: the Thai and Amharic owners'
answers to the same questions were taken — **they are the owner's to overturn**.

**STATUS (2026-11-16): the collection is complete** — the alphabet deck, A1, A2, B1 and, asked for afterwards,
B2 and a phrases deck (`.claude/burmese/`, §6–§10).

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for a later deck this plan produces. The collection's first commit carried a line and a bump because it also
changed the APP (the shelf's hue in `app.js`) — the Hebrew, Zulu and Amharic precedent.

## 1. The decisions (2026-11-15, taken from the Thai and Amharic owners)

1. **Levels: CEFR A1–B1, assembled, at 500 / 750 / 1,000 notes** — the Thai sizes. No exam board publishes a
   graded Burmese word list, so each level is a hand-written topic inventory (`inventory.py`) scoped to the
   CEFR global descriptor, topped up by frequency. English Wiktionary has 7,629 Burmese lemmas (§4), enough
   for a B2 as well, which was asked for on 2026-11-16 (1,500 notes, the Thai size; §9).
2. **An alphabet deck first** (Thai, Amharic): Burmese is written in the Myanmar script.
3. **A reading on every card: Wiktionary's IPA**, which marks the four tones. Wiktionary's other romanisation,
   MLCTS, spells the letters (စား "ca:" for /sá/) and is not printed (§3).
4. **The spoken register** (§4): A1 teaches တယ်, ရဲ့, နဲ့, ဒီ, not the literary သည်, ၏, နှင့်, ဤ.
5. **No hand glosses** (Zulu, Amharic): a word Wiktionary lacks is listed in `inventory.py` and not taught.
6. **No speaker button** (Hausa, Amharic): few devices carry a Burmese voice.
7. **This session: plan + generator + the alphabet deck + A1 + the shelf entry**; A2 and B1 one per session.

| deck | file | notes |
|---|---|---|
| Burmese Alphabet — built | `Burmese-Alphabet.folio-deck.json` | 79 |
| Burmese A1 Beginner — built | `Burmese-A1.folio-deck.json` | 500 |
| Burmese A2 Elementary — built | `Burmese-A2.folio-deck.json` | 750 |
| Burmese B1 Intermediate — built | `Burmese-B1.folio-deck.json` | 1,000 |
| Burmese B2 Upper Intermediate — built, asked for 2026-11-16 | `Burmese-B2.folio-deck.json` | 1,500 |
| Burmese Phrases and Expressions — built, asked for 2026-11-16 | `Burmese-Phrases-and-Expressions.folio-deck.json` | 373 |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule; "Alphabet" sorts first.

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, IPA, classifiers, alternative forms, usage examples | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Burmese.jsonl`, 19 MB, 10,505 entries) | CC BY-SA 4.0 |
| frequency | the Burmese Wikipedia, `mywiki-20261101-pages-articles.xml.bz2` (115,477 articles, 25.5 M words once cut), pinned | CC BY-SA 4.0 |
| example sentences | Tatoeba `mya` exports (592 sentences) | CC BY 2.0 FR |
| the alphabet deck's letters, names, sounds, spellings, rhymes | Wikipedia, "Burmese alphabet", and "Burmese language" § Tones, read 2026-11-15 | CC BY-SA 4.0 |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 33 million L1 (32.9, 2019), 10 million L2, Ethnologue 27th ed., via Wikipedia's infobox, read 2026-11-15 | — |

Checked and unusable: hermitdave/FrequencyWords has no Burmese list (404); Tatoeba is too small to count.

## 3. The card

One note, two templates (Burmese → English, English → Burmese), `speechLang: 'my-MM'`. Fields: `Burmese`
(the headword), `Roman` (the reading: Wiktionary's IPA without its slashes), `Word` (the plain headword; the
check and the next level's de-duplication read it), `English` (meanings by part of speech, with the register
where Wiktionary gives one — spoken, literary, formal, polite, a man's or a woman's word), `Forms` (a noun's
CLASSIFIER, "counted with", where Wiktionary names one; the induced creaky "possessive" form, မြန်မာ → မြန်မာ့;
"other forms", Wiktionary's alternative forms), `Examples` (up to three, no reading: Tatoeba gives none). The
CSS is Amharic's with taller lines (Burmese stacks marks above and below a letter, as Thai does).

- **THE READING IS IPA, NOT A ROMANISATION.** Burmese spelling is conservative: the finals -k -t -p -c are all
  said as a glottal stop, -n -m -ng as a nasalised vowel, and a consonant is voiced inside a word without the
  spelling changing (ချိတ် is tɕʰeɪʔ "to link" and dʑeɪʔ "hook"). MLCTS follows the letters; the IPA follows
  the sound and writes the four tones (à low, á high, a̰ creaky, aʔ checked), which the alphabet deck teaches.
- **NO SPEAKER BUTTON.** `check-burmese.js` fails on one.

## 4. What Burmese needs that no earlier set did — the findings

- **NO SPACES BETWEEN WORDS** (`my.syllables`, `my.Cutter`). Burmese spaces phrases, not words. A run is cut
  into syllables (a syllable starts at a consonant or an independent vowel unless that letter is a final, with
  the asat ် or ္ after it, or the lower half of a stack), then into words by forward maximal matching against
  every Burmese headword of English Wiktionary, names included. No library. A sentence matches a word only
  where the cut found it, so နေ "sun" is not found in နေကောင်းလား "how are you?".
- **A ONE-SYLLABLE COUNT CANNOT BE TRUSTED.** Every syllable the cut could not place — a piece of a name, of a
  compound Wiktionary lacks, the noun prefix အ-, the title ဦး "U" — counts as a one-syllable word, so အ "to be
  mute", တ "to yearn" and ပ "to shine" ranked among the commonest. **The fill takes words of two syllables or
  more**; the everyday one-syllable words (most verbs) come through the inventory, which names them.
- **THE CORPUS IS BOT-WRITTEN VILLAGE STUBS AND LITERARY.** Most of the Burmese Wikipedia's articles are
  stubs on villages and townships: ကိုးကား ("References"), the census lines (သန်းခေါင်စာရင်း, ကျား "male"),
  ကျေးရွာအုပ်စု "village tract", မြို့နယ် "township" top the counts. And it is written in the LITERARY register,
  so သည်, ၏, ၌, နှင့် lead. `select.EXCLUDE` names each with its reason; the Western months, counted from the
  dates, are left for A2 as a set. 439 of 1,075,566 paragraphs were in the Zawgyi encoding and are skipped
  (`my.zawgyi`).
- **A SHORT WORD IS SEVERAL WORDS** and Wiktionary lists them historically: ကို is a form of address, the object
  particle and "to"; က "to dance" before the subject particle; တစ် "to cut" before "one"; ငါး "fish" and
  "five". The inventory names the part of speech it teaches (`ကို:particle+postp`) and the card shows only
  those entries; `build_deck.ONLY` narrows further where one part of speech holds several words (ကား, the
  noun: a cloth, a plank, a car; အင်္ဂါ: a body part and Tuesday). `LEAD` puts the everyday gloss first.
- **WIKTIONARY'S "ALTERNATIVE FORMS" ARE NOT ALL SPELLINGS.** A form tagged literary, formal, obsolete … is
  another register's word (သည် "literary" under the spoken တယ်) and is not shown; an untagged one is shown as
  "other forms", since for a particle it is an alternant (သ for တယ်) rather than a spelling.
- **A SPOKEN WORD FILED AS A POINTER** (မနက် "morning", an alternative of the formal နံနက်; မနက်ဖြန်
  "tomorrow" of နက်ဖြန်): the card the inventory asks for heads with the spoken spelling and its own reading
  (`ptr_ipa`), takes the lemma's meanings without its register label, and names the lemma under "other forms".

**Known, left.** Words A1 would have and English Wiktionary does not (ဖေဖေ "dad", ယောက်ျားလေး "boy", ကုတင်
"bed", ရေချိုးခန်း "bathroom", ဆိုင်ကယ် "motorcycle", ဘာကြောင့် "why", ဒါကြောင့် "so"; the full list is in
`inventory.py`). Maximal matching takes the longest dictionary word, so a word inside a longer compound
Wiktionary has is not counted there. 236 of A1's 500 words have an example sentence. Some fill words carry
literary or formal labels (အလွန် "very", အချို့ "some"), and the fill reads encyclopaedic in places. A few
first glosses keep Wiktionary's wording (မျက်လုံး "eyeball").

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet deck, A1. **Phase 3 (done)** — a phrases deck, asked for on 2026-11-16 (§10). **Phase 2 (done)** — A2, then B1, then B2 (asked for afterwards): write the
level's inventory into `inventory.py` and its topics into `burmese_level.SCOPE`, run, read every card, extend
`EXCLUDE`, `ONLY` and `LEAD`. A level from A2 on may teach the literary particles A1 leaves out.

## 6. As built (2026-11-15)

`python3 .claude/burmese/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `wikitext.py` → `extract.py`
→ `select.py` → `examples.py` → `build_deck.py`, caching in `.claude/burmese-cache/` (gitignored, ~230 MB);
`python3 .claude/burmese/alphabet.py` writes the alphabet deck (reads `lex.json` and the A1 deck).
`node .claude/burmese/check-burmese.js` is the check. **A re-run is byte-identical** (verified for both decks,
from a clean `--re-extract`).

- **A1**: 500 notes, 416 from the inventory (19 topics) and 84 by frequency; 61 with forms, 236 with sentences.
  Every inventory word was found in Wiktionary.
- **The alphabet deck**: 79 notes — the 33 consonants in the traditional order (sound, name, group, an example
  word that begins with the letter and is SAID with its sound: ဘုရား is pʰəjá, so not ဘ's), the four tones on
  ခါ ခါး ခ ခတ် (the front shows the set with the tone's word in bold, since ခ alone is the consonant), the seven
  vowels in their three tones on က, the four medials, the eight checked and seven nasal rhymes, the asat, the
  anusvara, the stacking sign, the independent vowels, the ten digits (each with A1's number word), the
  punctuation and the literary signs ၏ ၍ ၌ ၎င်း. Every letter side and every sound side unique (asserted).
- **The shelf's hue** is measured: `#363B7F`, a deep indigo, 14.2 from its nearest of 74 (the comment at
  `lang-burmese` in `app.js`).

## 7. As built (2026-11-16): A2

On request ("Add A2"). `python3 .claude/burmese/run.py --level a2`: 750 notes, 375 from the A2 inventory (17
topics, `inventory.py` `A2`) and 375 by frequency; A1's 500 words are not repeated. 52 with forms, 119 with
sentences. A re-run is byte-identical, and A1 and the alphabet deck rebuild byte-identical alongside (verified).
The inventory carries both calendars' months (the Western ones Myanmar uses day to day, and the twelve Burmese
months the festivals are named by); the words English Wiktionary lacks are listed in `inventory.py`. The fill is
the Wikipedia's written vocabulary — government, history, the faith, the arts — as the description says.
What reading the A2 cards added, each a rule FROM A2 ON or a hand line, so A1 stands:
- **"Synonym of" glosses are resolved** (`build_deck.resolve_synonym`, from A2 on): Wiktionary defines many
  compounds only as "synonym of ရှာ (hra, “to seek, search”)", and six fill words (ရှာဖွေ, နည်းလမ်း, ကျွမ်းကျင်,
  ခန့်မှန်း, ကျော်ကြား, လူမှုရေး) had no card at all; the card now takes the quoted gloss. A synonym with no quoted
  gloss stays a pointer.
- **"Taught below" follows the pointers** (`select`): A1 taught "morning" under the spoken spelling မနက်, a pointer
  to နံနက်, so နံနက် counted as untaught and A2 would have taught it again.
- **`ONLY` grew by 21** for A2's homographs (မတ် March, not a brother-in-law; ကုတ် a coat, not a lever; ဘဲ a duck;
  ချင်း ginger; ဆန် uncooked rice; ကြော် "to fry", not "to shout"; ဖိတ် "to invite", not "to spill" …); `LEAD` puts
  လက်မှတ်'s "ticket" first; a Burmese month's name keeps its capital (Wiktionary writes "tagu, the first month").
- **"Induced creaky tone form of" is a pointer**, never a gloss (မြန်မာ့ was picked by the fill and is excluded).
- **`EXCLUDE` grew by 15**: names behind other glosses (ရာမ, glossed as a drug, counted from Rama; ရခိုင်, glossed
  as a banana, counted from Rakhine; the name elements သီရိ and ရာဇ) and the literary conjunctions and particles
  (ယနေ့, ယခင်, ထို့ပြင်, ထို့အပြင်, သို့ရာတွင်, လိမ့်မည်, ဟူသည်, နှင့်တကွ, အကယ်၍, များသောအားဖြင့်).
- **Left out of the inventory for their entries**: ထီး (only the royal parasol, not "umbrella") and အန္တရာယ်
  "danger" (no reading).

## 8. As built (2026-11-16): B1

On request ("Add B1"). `python3 .claude/burmese/run.py --level b1`: 1,000 notes, 111 from the B1 inventory (13
topics) and 889 by frequency; A1's and A2's words are not repeated. 20 with forms, 83 with sentences. A re-run
is byte-identical, and A1, A2 and the alphabet deck rebuild byte-identical alongside (verified).
- **THE LEVEL OPENS WITH THE WRITTEN LANGUAGE**: the literary particles and words A1 and A2 held back (သည်, ၏,
  နှင့်, သော, သည့်, ဤ, ထို, တွင်, သို့, ဖြင့်, ၌, လျှင်, ၍, သို့သော်, သို့မဟုတ်, လည်းကောင်း, မိမိ, ယခု, ယနေ့,
  စသည်, ခြင်း) — a B1 reader meets them on every line of a newspaper. The inventory ignores `EXCLUDE`, so they
  are taught here while the fill still leaves the rest of the literary register alone. The deck's description
  says so (the A1 and A2 wording is unchanged).
- **THE INVENTORY IS SHORT**: English Wiktionary has comparatively few of B1's everyday words (no "temperature",
  "unemployed", "website", "crime", "possible", "easy", "difficult", "modern" …; the list is in `inventory.py`),
  so the fill — the Wikipedia's written vocabulary — is most of the level.
- **A dictionary citation kept as a sense is dropped** (`build_deck.CITATION`): အရေးယူ carried "“အရေးယူ” in
  Myanmar–English Dictionary (Myanmar Language Commission 1993) …" as a second gloss; `check-burmese.js` fails on
  one. The only such gloss in the extract.
- **`ONLY` and `LEAD`**: ထင် "to think" (not "to be visible"), ခိုး "to steal", ကျိုး "to break", သော the particle
  (not "to joke"), အိမ်စာ "homework" (not the house sparrow); ဘွဲ့ leads with "academic degree". "Latin" and
  "Soviet" get their capitals back.
- **`EXCLUDE` grew by 7**: ဗမာ့ (only a possessive form of a name), ကုလား (a word for people of South Asian
  descent that is widely held to be offensive), ထားဝယ် (a people's name), ဓနု (a sign of the zodiac), and ပုဒ်မ,
  အသတ်, တံခွန် (glossed only as names of marks the Alphabet deck teaches).
- **Left out of the inventory**: မီးပူတိုက် "to iron" (Wiktionary's IPA covers two of its three syllables), and
  မည်, ကာ, မဲ, ဝတ္ထု, သဒ္ဒါ for their entries.

## 9. As built (2026-11-16): B2

On request ("Add B2"). `burmese_level` gained the band (`b2`, "Upper Intermediate", 1,500 notes, the CEFR B2
descriptor). `python3 .claude/burmese/run.py --level b2`: 1,500 notes, 103 from the B2 inventory (6 topics) and
1,397 by frequency (the fill reaches down to an article count of about 40); A1's, A2's and B1's words are not
repeated. 64 with forms, 76 with sentences. A re-run is byte-identical, and A1, A2, B1 and the alphabet deck
rebuild byte-identical alongside (verified).
- **THE INVENTORY IS THE ONE-SYLLABLE WORDS** the fill can never take (§4): about 1,000 one-syllable lemmas were
  left after B1, many of them everyday verbs — ထုတ် "to take out", ရော "to mix", ကူး "to cross", ထိ "to touch",
  ရိုက် "to hit", ဖမ်း "to catch", တူး "to dig", ကယ် "to save", ရှောင် "to avoid", ပိုင် "to own", ချုပ် "to sew",
  ကန် "to kick" — and nouns of the house and the workshop (အပ် "needle", အုတ် "brick", သံ "iron", ဖန် "glass").
  The deck's description says so.
- **A LEMMA WHOSE EVERY GLOSS ONLY POINTS AT ANOTHER WORD IS NOT DEALT** (`select.POINTER_ONLY`, from B2 on): the
  induced creaky forms (ရှင့်, ကျွန်တော့်, ဘယ်သူ့) and "synonym of X" with no quoted gloss reached the fill and
  got no card, so the deck came out five short. A1 to B1 named such words in `EXCLUDE` instead and stand.
- **`ONLY` grew by 8** (ကန် "to kick", not "to designate"; သံ iron, not an envoy; ချေ "to sneeze"; တူး "to dig";
  စိန် diamond, not arsenic; ကယ် "to save"; ခဲ "to freeze"; ဝါး "to chew"); "Islam" and "Spanish" get their
  capitals back.
- **`EXCLUDE` grew by 10**: second spellings of words taught (ရော်ဘာ of ရာဘာ "rubber" — the two would have shared
  an English side the uniqueness pass cannot separate; အသျှင် of A2's အရှင်; အကို of A1's အစ်ကို), a dialect form
  (ကြီးကြီး), a name and a title (ဗညား), a people's name (ရာမည), two signs of the zodiac (မိဿ, မေထုန်), and two
  anatomical words (the Amharic precedent).
- **The description** says the literary particles were taught at B1 and that this level's list is the
  one-syllable words (A1's, A2's and B1's descriptions are unchanged).

## 10. As built (2026-11-16): the phrases deck

On request ("Add a phrases deck"). `python3 .claude/burmese/phrases.py`: 373 notes in three subdecks, the Amharic
arrangement with a third subdeck, because English Wiktionary has about forty Burmese proverbs. A re-run is
byte-identical. Not a CEFR level; nothing a level deck teaches is repeated (compared as spelt: မင်္ဂလာပါ,
ရပါတယ်, ဆောရီး, တာ့တာ … are A1's and are left out).
- **Phrases (37)**: every phrase and interjection Wiktionary has that the levels do not teach, in a hand order
  (`PHRASES`: greetings first — စားပြီးပြီလား "have you eaten?", the everyday hello — then the phrasebook, the
  wishes, the exclamations), with Wiktionary's gloss (two senses at most), its IPA and its register. Where two
  share an English meaning, `LABEL` says what Wiktionary says of each: plain or polite (မသိဘူး / မသိပါဘူး),
  said by a man or a woman (ကျွန်တော် / ကျွန်မ မြန်မာပါ), familiar or formal (the four "are you married?").
  ကိစ္စမရှိဘူး, defined only as an alternative form, takes its polite form's gloss. A new Wiktionary entry stops
  the script until it is placed. **Left out** (`LEFT_OUT`): ကျေးဇူးပြု၍ (no gloss), ဗိုက်ဆာတယ် (Wiktionary glosses
  it "I'm thirsty", ရေငတ်တယ်'s gloss — it means "I'm hungry"), a vulgar interjection, an abbreviation of a vulgar
  insult, derogatory internet slang, and နိုင်းကျော်တယ် (no reading).
- **Proverbs (28)**: Wiktionary's, in its order, with its explanation and literal meaning. Left out
  (`PROVERBS_LEFT_OUT`): မိုးရွာတုန်း ရေခံ (its gloss is လသာတုန်း ဗိုင်းငင်'s, "make hay while the sun shines") and
  the three that turn on ကုလား (B1's exclusion). A proverb's IPA can carry the Burmese comma ၊ between its halves;
  the reading takes a Latin comma (`check-burmese.js` fails on Myanmar script in a reading).
- **Sentences (308)**: Tatoeba's Burmese sentences of at most fifteen syllables (of 502 with an English
  translation, 434 are that short), as written, each with its Tatoeba number; no reading. Where several share
  one English sentence and differ by their first-person pronoun, the card says who is speaking (`SPEAKER`:
  ကျွန်တော် / ကျနော် a man, ကျွန်မ / ကျမ a woman, ငါ familiar); otherwise the shorter is kept. **`DROP` names 42**,
  each read off the list with its reason: seventeen mistyped (ကျွန်တောတို့, ကျောင်သား, ကျေးဇူးပြပြီး, ပြော့ for
  ပျော့ …), eleven mistranslated (နက်ဖြန် "tomorrow" paired with "now" three times; ပြုံးမယ် "I will smile" with
  "Smile."; "always" where the English asks "ever" …), one incomplete, a slang wording, a book title, the
  ကုလား proverb, and the curses, "Shoot!", "Attack!" and the sentences about dying, which are not everyday.
- **`check-burmese.js`** checks the deck's three subdecks, Myanmar script on every front, a reading on every
  phrase and proverb, a Tatoeba number on every sentence and unique English sides.
