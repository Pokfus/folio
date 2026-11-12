# The Thai language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Thai deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped, Hindi's above all (`docs/hindi-decks-plan.md`);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Thai language collection."

**STATUS (2026-11-12): the alphabet deck and all five levels, A1 to C1, are built** (`.claude/thai/`,
§6–§10). The phrases deck is not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one (merged into the day's Hindi line)
because it also changed the APP — the shelf's hue in `app.js`.

## 1. The decisions (2026-11-09)

The request named no word source, script deck or romanisation. Hindi's owner had answered all three for the
same request earlier the same day, and the session took the same answers rather than ask again — **they are
the owner's to overturn**:

1. **Word source: CEFR A1–C1, assembled** (the Hindi / UKBI / TORFL arrangement). Thailand's proficiency test
   for foreigners (CU-TFL, Chulalongkorn University) publishes no graded word list, so each level is a
   hand-written topic inventory (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up
   with the commonest remaining words. Each deck's description says so. Sizes as Hindi's: **A1 500 · A2 750 ·
   B1 1,000 · B2 1,500 · C1 1,500 notes**, then a phrases deck.
2. **A Thai script deck, first in the collection.**
3. **Romanisation on every word card, in Paiboon** — the system that writes the TONE (à low, â falling, á high,
   ǎ rising, no mark mid). The Royal Institute system Thailand uses on road signs leaves tones out, and a word
   said on the wrong tone is another word (ใกล้ glâi "near", ไกล glai "far").
4. **This session: plan + alphabet + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Thai Alphabet — built | `Thai-Alphabet.folio-deck.json` | 92 |
| Thai A1 Beginner — built | `Thai-A1.folio-deck.json` | 500 |
| Thai A2 Elementary — built | `Thai-A2.folio-deck.json` | 750 |
| Thai B1 Intermediate — built | `Thai-B1.folio-deck.json` | 1,000 |
| Thai B2 Upper Intermediate — built | `Thai-B2.folio-deck.json` | 1,500 |
| Thai C1 Advanced — built | `Thai-C1.folio-deck.json` | 1,500 |
| Thai Phrases and Expressions | `Thai-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, romanisation (Paiboon), classifiers, some examples | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Thai.jsonl`, 51 MB, 21,085 entries) | CC BY-SA 4.0 |
| frequency | PyThaiNLP's `tnc_freq.txt` (Thai National Corpus) and `ttc_freq.txt` (Thai Textbook Corpus), pinned to commit `dac9ca80` | CC0 (PyThaiNLP's corpus licence) |
| example sentences | Tatoeba `tha` exports (≈4,800 Thai–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 27 million, Ethnologue 28th ed., via Wikipedia's infobox, read 2026-11-09 | — |

**hermitdave/FrequencyWords, every other deck's frequency source, has no Thai list** — a subtitle list counts
space-separated tokens and Thai writes none — which is why the counts come from two hand-segmented corpora.

## 3. The card

One note, two templates (Thai → English, English → Thai), `speechLang: 'th-TH'`. Fields: `Thai` (the
headword), `Roman` (Paiboon), `Word` (what the speaker reads), `English` (meanings by part of speech),
`Forms` (a noun's CLASSIFIER, the word it is counted with — บ้าน: หลัง lǎng — where Wiktionary names one, in
the head template or inside a gloss), `Examples` (up to three; a Wiktionary example also shows its
romanisation). **No forms table: Thai does not inflect.** The CSS is `.claude/thai/card.css` (Hindi's minus
the paradigm grid, with taller line-heights: Thai stacks a vowel and a tone mark above a letter).

## 4. What Thai needs that no earlier set did — the findings

- **NO SPACES BETWEEN WORDS** (`th.Segmenter`). A Tatoeba sentence is cut into words by maximal matching
  against every Wiktionary headword and every corpus word, and a word matches only where it starts and ends
  on a cut — a plain substring search finds มา "come" in หมา "dog". A compound the dictionary holds whole
  (กินข้าว "to have a meal") is cut once more so ข้าว is still found, ranked second — but **only a true
  compound**, every part a dictionary word of two letters or more: re-cut, ตาย "to die" is ตา "eye" + a stray
  ย, and "Did Tom die?" had become the example for "eye". No library: the generator needs none.
- **TWO CORPORA, THE GEOMETRIC MEAN** (`extract.py`). Ranked by the Thai National Corpus alone (written Thai:
  news, law, academic prose) the first 170 words of A1 held มาตรา "section of a law", กฎหมาย "law", สังคม
  "society", พัฒนา "to develop". The Textbook Corpus reads like a primer but keeps its texts' literary register
  (ข้าพเจ้า, a formal "I"). The geometric mean of the two rates per million ranks a word high only where both
  agree. No lemma arithmetic: Thai words have one form.
- **THE FIRST DAY'S WORDS LEAD** (`select.LEAD_TOPICS`). Both corpora are written, where สวัสดี "hello" and
  ขอบคุณ "thank you" are rare: by frequency they were dealt about 450th of 500. The inventory's greetings and
  particles are dealt first, then everything by frequency.
- **WIKTIONARY LISTS SENSES AND ETYMOLOGIES IN HISTORICAL ORDER**, so the everyday one is often not first:
  กับ opened on "trap", จาก on "nipa palm", คำ on "gold", ต่อ on "wasp", หนังสือ on "letter; script" (book is
  sixth), ต้อง on a literary "to touch". Three hand tables in `build_deck.py`, each line with its reason:
  `ETYMS` (which etymology, in what order), `LEAD` (which gloss leads), `PREFER` (which part of speech leads);
  and a weak (rare, archaic, slang …) sense shows only when nothing else does.
- **COMPOUNDS WIKTIONARY LACKS** (`select.COMPOSE`): the days (วันจันทร์ = วัน "day" + จันทร์), ภาษาไทย,
  ภาษาอังกฤษ, คนไทย, ฝนตก. Each is romanised from its parts' own Paiboon readings; only the English is written
  by hand. The months are proper nouns in Wiktionary and are asked for with `:name`.
- **POINTERS KEEP THEIR OWN SOUND**: ล่ะ is filed as a form of เล่า; the card prints ล่ะ's reading (lâ), not
  เล่า's (lâo). A pointer with no reading of its own is not carded.
- **EXTRACTION ARTEFACTS**: a "sense" whose gloss is an example sentence (สี) is dropped (a line break, or
  mostly Thai letters); "⇒ all nouns using this classifier" and "Abbreviation: …" tails are cut.

**Known, left.** Some first glosses are Wiktionary's definitional wording rather than the plain word (ไข่ is
"roundish reproductive body", เมือง "any polity, as district, town, city …"). 34 of A1's 500 words have no
example sentence (Tatoeba's Thai is a fifth of Hindi's). The fill carries written-Thai vocabulary
(ลักษณะ "characteristic", พิจารณา "to consider") the two corpora agree on. The Tatoeba sentences carry no
romanisation.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 to C1, one level per session: write the
level's inventory into `inventory.py` and its `SCOPE` into `thai_level.py`, run, read every card, extend the
three tables. **Phase 3** — the phrases deck (`phrase` / `proverb` entries). **Phase 4** — a combined file,
gitignored.

## 6. As built (2026-11-09): the alphabet and A1

`python3 .claude/thai/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/thai-cache/` (gitignored, ~165 MB);
`python3 .claude/thai/alphabet.py` writes the alphabet deck (reads `lex.json` for the example words'
romanisations). `node .claude/thai/check-thai.js` is the check. **A re-run is byte-identical** (verified for
A1). A1: 500 notes, 341 from the inventory and 159 by frequency; 76 show a classifier; sentences for 466, three
for 430. The alphabet: 92 notes — 44 consonants (class, name word, initial and final sound; the name is on the
sound side, since five letters say k and six say t), 28 vowels and vowel signs on ◌, 4 tone marks and 3 other
signs, the 3 class rules, 10 digits; every sound side unique (asserted). The shelf's hue is measured:
`#014764`, 16.0 from its nearest of 56 (re-swept at the merge: Arabic had taken a green 5.1 from the first
sweep's `#0B791D`).

## 7. As built (2026-11-12): A2

On request ("Add Thai A2"). `python3 .claude/thai/run.py --level a2`. 750 notes: 508 from the A2 inventory
(22 topics, `inventory.py` `A2`), 242 by frequency; A1's 500 words are not repeated. 124 show a classifier;
sentences for 599, three for 375. The A1 deck re-runs byte-identical after these changes (verified).

- **Twelve more ETYMS, ten more LEAD, one PREFER**, read off every A2 card: เบื่อ had opened on "to poison",
  ไอ on "vapour", ซัก on "to interrogate", ลา on "donkey", กล้า on "rice seedling", ซอย on "to mince", หวัด on
  "carelessly", สลัด on "pirate", โทร on "tele-"; ผีเสื้อ on "tutelar spirit", กล้อง on "pipe", เจ้านาย on
  "royal person", สมัคร on "to want", and เบา's "light (in weight)" was its fourth sense, cut off.
- **`DROP`, new** (`build_deck.py`): a gloss never shown — two vulgar senses Wiktionary leaves untagged (so
  they were not weak, and showed under ยิ้ม "to smile" and งู "snake") and แต่ง's gloss with a Thai
  cross-reference fused onto it.
- **Inventory parts of speech**: เบา:adj, ช้อน:noun, เกม:noun, ชั่ง:verb, สงกรานต์:name (its noun entries are
  "sea worms" and an astronomical sense; the festival is the proper noun).
- **Nine more COMPOSE rows**: ปีหน้า, ปีที่แล้ว, อาทิตย์หน้า, เนื้อวัว, คนอื่น, ขับรถ, จ่ายเงิน, แปรงฟัน,
  มีความสุข.
- **Left out, with the reason**: ผู้จัดการ (Wiktionary's only sense is an estate's administrator, not
  "manager"); ตักบาตร and มอเตอร์ไซค์ (defined only as synonyms of ใส่บาตร and จักรยานยนต์); หน้าร้อน, หน้าฝน,
  หน้าหนาว (the colloquial doublets of ฤดูร้อน etc., which share their English side). Not in Wiktionary and
  dropped by `select.py`: ใครๆ คนรู้จัก ปู่ย่าตายาย คนแก่ ต่อราคา เก็บเงิน คอนโด วีซ่า ดวงจันทร์ ฟ้าใส ก่อนที่
  มะรืนนี้ เมื่อวานซืน น้อยกว่า จริงๆ ถึงแม้ หรือว่า ถ้าหาก เสียงดัง ใกล้ๆ ไกลๆ ร่ำรวย อยู่อาศัย หวีผม.
- **Known, left**: the fill again carries written-Thai words (มาตรา, กฎหมาย, รัฐบาล, ราชการ, สมเด็จ) the two
  corpora agree on; some glosses stay definitional (หมา "canine: any animal of the family Canidae, as dog …").

## 8. As built (2026-11-12): B1

On request ("Add B1"). `python3 .claude/thai/run.py --level b1`. 1,000 notes: 436 from the B1 inventory
(18 topics, `inventory.py` `B1`), 564 by frequency; sentences for 548, three for 228 (Tatoeba's Thai thins out
at this level: 452 words have none). A re-run is byte-identical; A1 is unchanged; **A2 changed in two cards**,
for the better, through the generic rules below (ความคิด loses a bare "abstract noun of คิด", ความรู้สึก shows
"feeling; emotion" without the pointer in front).

- **The inventory gave only 386 at first**: 95 of its words are compounds Wiktionary has no entry for. 50 were
  worth a card and are now `COMPOSE` rows (ตกงาน, ค่าใช้จ่าย, ผิดกฎหมาย, โลกร้อน, ล้างจาน, ส่วนใหญ่, เพิ่มขึ้น,
  อย่างไรก็ตาม, นอกจากนี้ …); the rest were dropped (the list is printed by `select.py`).
- **`COMPOSE` now also overrides an entry Wiktionary HAS** but defines with no meaning: การค้า, การรักษา,
  ความตั้งใจ, ความรัก ("abstract noun of X" alone), กลับบ้าน ("to go" plus a pointer), ผู้ใช้ (only "abettor").
- **Generic gloss rules** (`build_deck.english`): "synonym of หมา (mǎa, “dog”)" shows the quoted meaning, so
  สุนัข, the formal word for a dog, is carded as "dog"; "abstract noun of X (…): meaning" shows the meaning;
  a bare "abstract noun of X (…)" and "Used other than figuratively or idiomatically" are dropped where the
  entry has anything else.
- **The fill skips a word defined only by pointer** (`select.pointer_only`: ปรกติ, an old spelling of ปกติ).
- **Twenty-one more ETYMS, nine more LEAD, two more PREFER** (ปรับ had opened on "to tell", ลับ on "to whet",
  จ้าง on "plain zongzi", หัด on "measles", ชิน on an amulet alloy, สบู่ on the Jatropha plant, คม on a royal
  "to wai", เสี่ยง on "section", กลอน on "rafter", มือถือ on "handheld"); parts of speech on ten inventory words.
- **`EXCLUDE` grew**, each with its reason: syllable counts that carded a rare homograph (กระ "hawksbill turtle",
  ระ, ตะ, ดา, กร, ริ), the letter เอ, อ้าย (only "used in อุ้ยอ้าย"), เมีย (its "wife" sense is tagged weak, so
  the card taught only "female"), พลัง (shares "energy" with พลังงาน). โทรศัพท์มือถือ left out beside มือถือ.
- **Known, left**: more of the fill is written or royal register (ถวาย, ตรัส, ทูล, พระราชทาน, รัชกาล) — the two
  corpora agree on it, and a reader of Thai meets it; some glosses stay long and definitional.

## 9. As built (2026-11-12): B2

On request ("Add B2"). `python3 .claude/thai/run.py --level b2`. 1,500 notes: 346 from the B2 inventory
(14 topics, `inventory.py` `B2`), 1,154 by frequency; sentences for 492, three for 175 — **1,008 words have no
example sentence**: Tatoeba's ≈4,800 Thai sentences are spent by B2. A re-run is byte-identical; A1, A2 and B1
are unchanged by every rule added here.

- **The inventory resolves thinly at this level**: much of it is already taught below (อาชีพ, สังคม, ประชาธิปไตย …)
  and about 110 of its words are compounds Wiktionary lacks. 38 are now `COMPOSE` rows (ลงคะแนน, อัตราแลกเปลี่ยน,
  ธนาคารกลาง, ต้นทุน, ข้อสรุป, หมอกควัน, อุทยานแห่งชาติ, ใกล้สูญพันธุ์, โรคซึมเศร้า, ข่าวปลอม, จุดอ่อน, ภาพรวม,
  องค์ประกอบ, ขอบเขต …), and 9 more override an entry that is "abstract noun of X" alone (การปกครอง, ความเสมอภาค,
  ความเหลื่อมล้ำ …).
- **A new generic rule** (`build_deck.LISTITEM`): a "sense" that is a Thai word with a quoted gloss — มาร's list
  of the five māras, "กิเลสมาร (“passion”)" — is a list item Wiktionary set as a sense, and is dropped.
- **Seventeen more ETYMS, twelve more LEAD, four more PREFER**, read off every card (กบ opened on a phonetics
  term before "frog", จอ on "Year of the Dog" before "screen", มูล on "feces" before "base, origin", สละ on a
  porcupine's quill, บุก on konjac, ซ้อม on "to pound rice", ขวัญ on "cowlick", วลี on "fold of the skin"); the
  inventory's อุทธรณ์ and ปฏิรูป say `:verb`.
- **Fifteen more `EXCLUDE` rows**: syllable counts and Latin letters (โม, จัน, กัง, เส, ชะ, กง, ยอ, คุ, ยู, โด, พี),
  โขง (the count is the Mekong; the entry is "rancid"), ท้าว and สิริ (every usable sense weak or a pointer),
  ผู้จัดการ (an estate's administrator only); วนเวียน, สมมุติ, อินทร์ beside a word with the same English side.
- **Known, left**: by B2 the frequency fill is largely literary, royal and Buddhist register (เสวย, ทอดพระเนตร,
  มหาราช, ภิกษุ, ภพ, ชาดก) — the corpora's agreement, and what a reader of Thai prose meets — and the deck's
  description says the fill is by frequency. Some glosses stay definitional.

## 10. As built (2026-11-12): C1

On request ("Add C1"). `python3 .claude/thai/run.py --level c1`. 1,500 notes: 340 from the C1 inventory
(12 topics, `inventory.py` `C1`), 1,160 by frequency; sentences for 315, three for 100 — **1,185 words have no
example sentence**. A re-run is byte-identical; A1 to B2 are unchanged.

- **Wiktionary is thinnest exactly where C1 lives**: about 265 inventory words — the Pali and Sanskrit
  vocabulary of philosophy, Buddhism, scholarship and law (อภิปรัชญา, อรหันต์, บูรณาการ, ปริทัศน์ …) — have no
  entry. A maximal-matching pass over `lex.json` split each into known words; **the 151 kept as `COMPOSE` rows
  are only those whose parts join with no linking vowel**, so the parts' Paiboon readings ARE the compound's
  (ปัจเจกบุคคล bpàt-jèek-bùk-kon, ทวิภาคี tá-wí-paa-kii). Left out on purpose: compounds that insert one
  (จิตเวช jìt-dtà-wêet, กรรมพันธุ์, วรรณศิลป์, every พระราช- word, ภูมิรัฐศาสตร์), splits that are not word
  boundaries (โคลง as โค + ลง, สมถะ, โวหาร, ประหนึ่ง), and pairs whose English would collide (โดยนัย beside
  โดยปริยาย). The English of each is written by hand, as every `COMPOSE` row's is.
- **`SYN` now also reads a pointer with no romanisation** ("synonym of เทปกาว (“adhesive tape”)").
- **Four more ETYMS, ten more LEAD, four more PREFER** (กำพร้า had opened on "epidermis" before "orphaned",
  พิภพ on "nonexistence" before "world", อากร on "body; mass" before "duty (tax)", แฟ้ม on a dried-food
  container before "folder", กฐิน on an embroidery hoop before the Kathina festival); บรรทม left the inventory
  (Wiktionary has only "alternative form of ผทม").
- **`EXCLUDE` grew by about thirty**: syllable, letter and name counts (มาน, จี, ยี่, นนท์, บ, กน, วดี …);
  เน็ต, แป๊ะ, เชย, คอม (the everyday sense is a name-pointer, tagged weak or missing); ยวน; ปิดบัง, ขาดใจ,
  เส้นเลือด beside a word with the same English; คงคา and มหาธาตุ (their only gloss opens on a Thai form list).
  ฉิบหาย, used mostly as a curse, joined `SWEARS`.
- **Known, left**: at C1 the frequency fill is mostly literary, royal and Buddhist register and the names of
  plants and animals (เถาวัลย์, ไคล, ปิศาจ), which is what the two corpora agree on next; the topic inventory
  carries the academic and civic words. Most cards have no sentence: Tatoeba has nothing more to give, and a
  sentence is never invented.
