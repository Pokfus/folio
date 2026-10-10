# Writing Folio cards — the complete spec (also the ChatGPT prompt)

**This file is self-contained on purpose.** It is what a Claude session reads before writing a card,
and it is what you paste into ChatGPT (or any other model) to write cards when Claude usage has run
out. The output is one JSON file that `node .claude/import-batch.js <file>` loads into the site.

---

## For you (the human): how to use this with ChatGPT

1. Open the collection's plan on GitHub (`docs/<collection>-card-plan.md`) and find the next unwritten
   cards. They look like this, under a heading that names the deck id:

       ### The high empire — `rm-high-empire`
           rm-501  Trajan's Parthian campaign
           rm-502  The greatest extent of the Roman Empire

   (A Claude session can print these cheaply with `node .claude/next-cards.js rm- 10`.)
2. In ChatGPT, use the strongest model with web search or browsing switched ON. Paste **this whole
   file**, then:

   > Write cards rm-501 to rm-505 for deck `rm-high-empire`, following the spec above exactly.
   > [paste the plan lines]

   Five to ten cards per message works best. Ask it to continue in the same chat for the next batch.
3. Save its reply as a `.json` file (e.g. on GitHub: Add file → Create new file →
   `batches/rm-501-505.json`, committed to a branch).
4. Later, in a Claude session (Sonnet is fine): *"Import `batches/rm-501-505.json` with
   import-batch.js, verify every citation, fix what is refused, then commit."* That is a short, cheap
   session compared with having Claude research and write the cards itself.

**The honest limitation:** ChatGPT invents plausible citations — real-looking authors, titles, DOIs and
URLs for works that do not exist or do not say what is claimed. The importer checks the SHAPE of a
citation, not its truth. Every citation must be opened and checked before the cards go live; that is
the one step that cannot be skipped. Telling ChatGPT to cite only what it has actually opened in its
browser cuts the rate a lot but does not remove it.

---

## For the model writing the cards: the task

You are writing study flashcards for **Folio**, a spaced-repetition history and science study site.
Accuracy is the first rule: **never invent a date, name, figure, quotation, citation, author, URL or
DOI.** If you are not sure of a fact, leave it out and say so in the card's `notes`. A card with
fewer, solid claims is always better than one with a confident invented one.

Reply with **ONE JSON object and nothing else** (no prose before or after, no code fence), in exactly
this shape:

```json
{
  "cards": [ { "deck": "<deck id>", "id": "rm-501", "...": "every card field below" } ],
  "glossary": [ { "slug": "Wikipedia_Article_Slug", "...": "every term field below" } ]
}
```

Every card's answer term must also have a glossary entry in `glossary` (unless told the term already
exists).

---

## Card fields

| field | what it is |
|---|---|
| `deck` | the deck id from the plan heading (e.g. `rm-high-empire`) |
| `id` | the plan id, e.g. `rm-501` |
| `num` | the number as a string, e.g. `"501"` |
| `category` | the collection's name, e.g. `"Ancient Rome"` |
| `question` | the clue — see **Questions** |
| `questions` | an array of EXACTLY 2 more phrasings of the clue, same rules |
| `answer` | the answer term, plain, **no leading "the", "a" or "an"** |
| `answerText` | the same term again as plain text |
| `answerDate` | the date line — see **Date line** — or `""` if the term has no date |
| `abstract` | the background — see **Background** |
| `sources` | 5 to 8 citations — see **Sources** |
| `tags` | 3–8 lowercase tags — see **Tags** |
| `difficulty` | integer 1–5 — see **Difficulty** |
| `why` | 3 "think it through" questions with answers — see **Why** |
| `undatable` | `true` or `false` — see **Undatable** (required in some cases) |
| `locator` | optional — see **Locator** |
| `places` | optional — see **Places**; normally derived, not written |
| `notes` | optional — a list of strings: anything you were unsure of or left out |
| `traditional`, `hanzi`, `pinyin`, `translations`, `citation` | always `""` (except Chinese terms: `hanzi`/`traditional`/`pinyin` may be filled; `translations` stays `""`) |

### Questions (`question` and both `questions`)

- ONE sentence of **20–34 words** (aim ~28). The blank counts as one word.
- The answer term is replaced by exactly `<span class=\"blank\">_____</span>` (in JSON the quotes are
  escaped as shown).
- **The blank sits in the MIDDLE of the sentence** — the sentence must carry on after it, never end on it.
- The clue must be answerable from what the past was, **never from who studied it**: **never name a
  modern scholar, researcher or excavator** in a question. Ancient authors (Herodotus, Livy, Sima Qian)
  are fine. (Exception: Psychology `ps-` and Philosophy `ph-` cards may name researchers.)
- The three phrasings must approach the term from **genuinely different angles** (a place, a date, a
  consequence, a function), each answerable from the background.
- Read each phrasing back with the answer put in the blank. The answer never carries "the", so put
  "the" before the blank wherever the term needs one ("the founding of the _____").
- Use `<i>…</i>` for titles of works. No other markup.

### Background (`abstract`)

- **Exactly 10 sentences, 270–330 words (aim ~300), in two blocks of five** joined by ` <br><br> `
  (space, two `<br>`, space). Sentences 1–5: what the term is, in general. Sentences 6–10: the point
  this card's question is about.
- The first mention of the answer term opens the background and is the ONLY bold:
  `The <b>Eleusinian Mysteries</b> were …` — the article goes OUTSIDE the `<b>`.
- **Cover the whole term**, not only the best-documented part of it. If the evidence is lopsided,
  say so.
- Every sentence ends with a footnote marker pointing at the source that supports it:
  `<sup class=\"fn\" data-fn=\"2\"></sup>` — written EMPTY, number = position in `sources` (1-based).
  Two sources on one claim: two markers side by side. Every source must be pointed at at least once.
  Put the marker after the full stop.
- **At most 2 of the 10 sentences may be about modern discovery or excavation**, and at most 3 about
  modern scholarly debate. The card is about the past, not the people who study it. Prefer "the older
  view that…" to "Smith argues that…".
- Do not end a sentence on a lone capital letter or abbreviation ("the letters A and N."); reword.
- Never put a double space inside the background.

### Style (every text field)

- Reading level: **a bright 17-year-old** — precise, upper-secondary vocabulary, never academic,
  never childish. Gloss genuinely specialist words briefly on first use. Keep hedges on contested
  facts ("scholars still disagree about…").
- **British spelling** (colour, civilisation, centre, defence, practise as a verb).
- **BCE / CE, never BC / AD**; the numeral leads ("301 CE").
- **Centuries are numerals**: "11th century", "2nd millennium BCE".
- **Non-round numbers above 20 are numerals** ("27 chapters"); round ones may be words ("thirty
  kings"). Write "32,000", never "32 thousand".
- **Measurements metric first, imperial in brackets**, rounded to the source's precision:
  "about 2,400 kilometres (1,500 miles)". Temperatures as `−4 °C (25 °F)` (use the − sign, not
  "minus"). A temperature DIFFERENCE converts ×1.8 with no +32. This is the ONLY allowed use of
  parentheses — **no other parenthetical asides**.
- Titles of works in `<i>…</i>`. A word mentioned as a word, or a translation of a name, goes in
  single quotes: "its name means 'hollow rock'".
- No glossary links, no other HTML than `<b>` (once), `<i>`, `<br><br>`, `<sup class="fn">`, and the
  blank span.

### Date line (`answerDate`)

A short list of the dates worth remembering, not a sentence. At most 4 rows; label ≤16 characters;
value ≤64 characters and ≤10 words; every labelled row contains a number. Format:

```html
<div class="dt"><span class="dt-k">Built</span><span class="dt-v">447 – 432 BCE</span><span class="dt-k">Destroyed</span><span class="dt-v">1687 CE</span></div>
```

- The label says WHAT the date is (Born, Died, Reigned, Built, In use, Fought, Founded, Written), never
  the card's category, and never the date of an excavation unless the card is about the dig itself.
- **Write `BCE` or `CE` on every year before 1000**, and on both halves of "X or Y" ("1188 BCE or
  1177 BCE"). Put `c.` at the front of a range (`c. 668 – 631 BCE`), not in the middle.
- Write a century as the span it means (`c. 700 – 600 BCE`), never "7th century" alone — the site
  sorts cards by the year it can read here. Never "1930s".
- Deep time: `c. 4.2 – 2 Mya`, `115,000 – 11,700 BP`.
- No date at all → `""`.

### Sources

- **5 to 8** citations, Chicago **note** form, each **ending in a URL** the reader can open, as plain
  text, then optionally ` [Open access]` or ` [Paywalled]`.
- Real scholarship: a journal article (DOI link), a museum or excavation report, an open-access book,
  an ancient author in a published translation (Perseus, LacusCurtius, archive.org), a peer-reviewed
  encyclopedia that cites its own sources (e.g. the Stanford Encyclopedia of Philosophy). **Never
  Wikipedia.** No author should appear in more than 2 of one card's sources.
- **Cite only works you have actually opened, at a URL you have actually seen work.** Never compose a
  DOI or URL from a pattern; never expand an author's initials into a guessed first name. If you
  cannot find 5 real sources, give fewer and say so in `notes` — never pad.
- A translated ancient work is cited by its ancient author:
  `Livy, <i>The History of Rome</i> 2.1, trans. Canon Roberts (London: Dent, 1905), https://….`
- A non-English source keeps its own title and adds ` [in French]` (or the language) before the
  access tag.
- Examples of the form:
  - `Author Name, “Article Title,” <i>Journal</i> 12, no. 3 (2017): 289–92, https://doi.org/10.xxxx/yyyy. [Open access]`
  - `Author Name, <i>Book Title</i> (Place: Publisher, 2012), 84–86, https://archive.org/details/xxxx. [Open access]`

### Tags

3–8 lowercase tags. **Tag 1 is the KIND** and must be one other cards also use: `era`, `event`,
`battle`, `war`, `person`, `ruler`, `place`, `city`, `state`, `dynasty`, `empire`, `people`,
`culture`, `object`, `building`, `text`, `concept`, `practice`, `institution`, `deity`, `creature`,
`religion`, `technology`, `animal`, `plant`, `fossil`, `industry`, `theory`, `title`. Then subject
areas (`history`, `archaeology`, `religion`, `warfare`, `politics`, `science`, `art`, `geography`,
`literature`, `philosophy`, …), then specifics (a country or region, a period: `rome`, `greece`,
`china`, `athens`, `republic`, `bronze age`). Always include the collection's own place tag where it
has one (`rome`, `greece`, `china`, `united states`, …).

### Difficulty

How well known the **answer term** is to the general public — not how hard the card is:
**1** household name (Sparta, Homer, Stone Age) · **2** familiar from school (Neolithic, Knossos,
phalanx) · **3** known to the interested (Linear B, hoplite, helots) · **4** specialist (Gravettian,
megaron) · **5** obscure (Nichoria, Iguvine Tables). Most cards are 3–5.

### Undatable

`true` when the term is not located at a moment in time (a concept, a material, a practice found in
every age, a god, a river, an office). **Required** (true or false) whenever `difficulty` is 1 or 2
AND tag 1 is one of: concept, practice, deity, creature, religion, title, place, animal, plant,
school of thought, technology, object, people, institution. Otherwise omit it.

### Why (`why`)

Exactly 3 items `{ "q": "Why …?", "a": "Because …" }`. Each `q` is 4–24 words and ends in `?`; each
`a` is 12–60 words and is not a question. The three ask about different things. **Answers say only
what the card's own background says** — no new claims.

### Locator (optional)

If there is a place a reader could stand on for this card (where it happened, where it was found,
where a people lived), give the English Wikipedia article whose coordinates should be used — the
importer fetches the real coordinates, so **never write coordinates**:

```json
"locator": { "title": "Eleusis", "zoom": 8 }
```

- `name` (optional) is the map label if it differs from the article title; it must be a PLACE, never
  the card's answer term, and must not start with "The".
- For a battle add `"kind": "battle"`; for a river `"kind": "river"`. Leave regions and ranges out
  (they need hand-drawn shapes).
- A concept, a technique or a word gets no locator.

### Places (optional)

`places` is the Atlas v2 field (Phase 3a): a sorted list of ids into the **places registry** — the gazetteer
(`atlas/data/gazetteer.js`: `adm0:…` countries, `adm1:…` provinces, `city:…`, `sea:…`, `lake:…`, `river:…`,
`reg:…`), the places the cards need beyond it (`atlas/data/places.js`: `pl:q<Wikidata number>` — ancient
cities and sites, caves, battlefields, mountains, historical regions) and the polity entities of the history
file (`pol:<key>`: Rome, the Ottoman Empire…). It is a heavy field (data-extra/) and nothing reads it until
Phase 3b, when the Personal Atlas is derived from it by id instead of by name-matching.

**Do not write it in a batch.** It is DERIVED from the card's `locator`, `war` and `map` by
`node .claude/migrate-places.js` (additive, idempotent, Wikidata-checked; its report is
`docs/atlas-places-report.md`), and corrected per card with the tool:

```
node .claude/add-places.js --find "Knossos"              # which ids exist for a name
node .claude/add-places.js gr-008 pl:q173527             # add a place to a card
node .claude/add-places.js gr-008 -pl:q173527            # remove one (a derived place cannot be removed)
node .claude/add-places.js gr-008 --list
```

A place the registry lacks is added first, by its Wikidata item, with a reason — the coordinate and the kind
come from the service, never from a keyboard:

```
node .claude/atlas-build/add-place.js --qid Q121378 --kind island --reason "Corfu: gr-612's temple is on it"
```

An id that resolves to nothing fails `check-cards.js` (rule 9) and `migrate-places.js --check` in CI.

---

## Glossary entry fields

Every card's answer term gets one, keyed by its English Wikipedia article slug.

| field | what it is |
|---|---|
| `slug` | the Wikipedia article slug, spaces → underscores, diacritics kept (`Eleusinian_Mysteries`) |
| `description` | **exactly 3 sentences, 90–110 words**, each ending with a footnote marker |
| `date` | optional — a lifespan or span like `"c. 145–86 BCE"` or `"1644–1912"` |
| `tags` | at least 3, same vocabulary as card tags |
| `aliases` | optional — other spellings or the card's exact answer if it differs from the title |
| `sources` | at least 2 citations, same rules as card sources; every one pointed at by a marker |

The description must be **impartial and self-contained**: define the term on its own, as a neutral
encyclopedia would — never in terms of a particular card, never by comparing it to another glossary
term ("unlike X", "the opposite of X"). A general term (a tool, a concept) is described generally,
with no single country attached. Same style rules as cards.

---

## A worked example (a real shipped card, lightly trimmed)

```json
{
  "cards": [
    {
      "deck": "gr-cult",
      "id": "gr-990",
      "num": "990",
      "category": "Ancient Greece",
      "question": "Open to any Greek who wished, women and slaves included, the <span class=\"blank\">_____</span> promised the initiate a better lot after death.",
      "questions": [
        "A dust cloud and the cry of Iacchus rose from an empty Eleusis before Salamis, a sign of the <span class=\"blank\">_____</span> that Herodotus reports.",
        "Men accused in 415 of performing the <span class=\"blank\">_____</span> in mockery in private houses helped bring down Alcibiades on the eve of the Sicilian expedition."
      ],
      "answer": "Eleusinian Mysteries",
      "answerText": "Eleusinian Mysteries",
      "answerDate": "<div class=\"dt\"><span class=\"dt-k\">In Herodotus</span><span class=\"dt-v\">c. 430 BCE</span><span class=\"dt-k\">Profaned</span><span class=\"dt-v\">415 BCE</span></div>",
      "abstract": "The <b>Eleusinian Mysteries</b> were the annual initiation rites of Demeter and Persephone at their sanctuary at Eleusis in Attica, the most famous and the longest-lived of all the Greek mystery cults.<sup class=\"fn\" data-fn=\"4\"></sup> They were open to any Greek who wished, women and slaves included, which made them far wider in reach than most of the cults of a Greek city.<sup class=\"fn\" data-fn=\"2\"></sup> What the initiate gained was a better lot after death, and the promise is already stated in the <i>Homeric Hymn to Demeter</i>.<sup class=\"fn\" data-fn=\"1\"></sup> The goddess teaches her rites to Triptolemus, Diocles, Eumolpus and Celeus, awful mysteries which no one may transgress or pry into or utter.<sup class=\"fn\" data-fn=\"1\"></sup> Happy is he among men upon earth who has seen them, the hymn says, while the uninitiate has no share of like good things once he is dead.<sup class=\"fn\" data-fn=\"1\"></sup> <br><br> The secret held for a thousand years, and nothing certain is known of what was said, shown or done on the final night inside the great hall built to hold the initiates.<sup class=\"fn\" data-fn=\"4\"></sup> Initiates walked the twenty-odd kilometres (fourteen miles) of road from Athens to Eleusis in procession, crying the name Iacchus as they went.<sup class=\"fn\" data-fn=\"2\"></sup> Herodotus makes that cry the centre of a story told after the invasion, in which a dust cloud and the Iacchus shout rise from empty Eleusis and move towards Salamis.<sup class=\"fn\" data-fn=\"2\"></sup> He has an exile explain to a Spartan that the Athenians hold the festival every year for the Mother and the Maiden, and that any Greek who wishes may be initiated.<sup class=\"fn\" data-fn=\"2\"></sup> How seriously Athens took the secret is clear from 415, when men were accused of performing the mysteries in mockery in private houses and the charge helped to ruin Alcibiades.<sup class=\"fn\" data-fn=\"3\"></sup><sup class=\"fn\" data-fn=\"5\"></sup>",
      "sources": [
        "<i>Homeric Hymn</i> 2, <i>To Demeter</i> 473–482, trans. Hugh G. Evelyn-White, Loeb Classical Library (London: William Heinemann, 1914), Perseus Digital Library, https://www.perseus.tufts.edu/hopper/text?doc=HH%202.470. [Open access]",
        "Herodotus, <i>The Histories</i> 8.65, trans. A. D. Godley, Loeb Classical Library (Cambridge, MA: Harvard University Press, 1920), Perseus Digital Library, https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0126%3Abook%3D8%3Achapter%3D65. [Open access]",
        "Thucydides, <i>The History of the Peloponnesian War</i> 6.28, trans. Thomas Hobbes (London: Bohn, 1843), Perseus Digital Library, https://www.perseus.tufts.edu/hopper/text?doc=Thuc.%206.28. [Open access]",
        "Dobrinka Chiekova, review of <i>Greek Mysteries: The Archaeology and Ritual of Ancient Greek Secret Cults</i>, ed. Michael B. Cosmopoulos, Bryn Mawr Classical Review 2004.06.35, https://bmcr.brynmawr.edu/2004/2004.06.35/. [Open access]",
        "Corinne Bonnet, review of <i>Polytheism and Society at Athens</i>, by Robert Parker, Bryn Mawr Classical Review 2007.07.34, https://bmcr.brynmawr.edu/2007/2007.07.34/. [Open access]"
      ],
      "tags": ["event", "religion", "history", "greece", "athens"],
      "difficulty": 2,
      "why": [
        { "q": "Why were the rites open to slaves and women?", "a": "Because what they offered was individual rather than civic. Initiation promised a better lot after death to the person initiated, and that promise did not depend on citizenship, property or sex." },
        { "q": "Why did the secret hold for so long?", "a": "Because breaking it was a capital matter and everyone with knowledge had sworn. The prosecutions of 415, when men were accused of mocking the rites at private parties, show what the city was prepared to do about a breach." },
        { "q": "Why does Herodotus tell the story of the cry from Eleusis?", "a": "Because it lets a divine intervention be reported at second hand. An exile hears the Iacchus shout rise from an empty country and reads it as the goddesses going to help their people." }
      ],
      "locator": { "title": "Eleusis", "zoom": 8 },
      "traditional": "", "hanzi": "", "pinyin": "", "translations": "", "citation": ""
    }
  ],
  "glossary": [
    {
      "slug": "Eleusinian_Mysteries",
      "description": "The Eleusinian Mysteries were the initiation rites of Demeter and Persephone at Eleusis in Attica, the most famous of the Greek mystery cults.<sup class=\"fn\" data-fn=\"2\"></sup> Admission was open to any Greek who wished, women and slaves included, and what the initiate was promised was a better lot after death, a promise already stated in the <i>Homeric Hymn to Demeter</i>.<sup class=\"fn\" data-fn=\"1\"></sup> Nothing certain is known of what was shown on the final night, since the rites were kept secret for about a thousand years and ancient writers report the festival without describing it.<sup class=\"fn\" data-fn=\"2\"></sup>",
      "tags": ["event", "religion", "history", "greece", "athens"],
      "sources": [
        "<i>Homeric Hymn</i> 2, <i>To Demeter</i> 473–482, trans. Hugh G. Evelyn-White, Loeb Classical Library (London: William Heinemann, 1914), Perseus Digital Library, https://www.perseus.tufts.edu/hopper/text?doc=HH%202.470. [Open access]",
        "Dobrinka Chiekova, review of <i>Greek Mysteries: The Archaeology and Ritual of Ancient Greek Secret Cults</i>, ed. Michael B. Cosmopoulos, Bryn Mawr Classical Review 2004.06.35, https://bmcr.brynmawr.edu/2004/2004.06.35/. [Open access]"
      ]
    }
  ]
}
```

---

## Checklist before replying

- [ ] Valid JSON, nothing outside it; every `"` inside an HTML string escaped as `\"`.
- [ ] Each question: one sentence, 20–34 words, blank mid-sentence, no modern scholar named.
- [ ] Exactly 2 extra `questions`, each from a different angle.
- [ ] `answer` has no leading article; bold in the background is the term only, article outside.
- [ ] Background: 10 sentences, 5 + ` <br><br> ` + 5, 270–330 words, a marker on every sentence.
- [ ] 5–8 sources, each ending in a URL you have actually opened; every source pointed at; no
      Wikipedia; nothing invented.
- [ ] Date line ≤4 rows, every year before 1000 marked BCE/CE, or `""`.
- [ ] 3–8 tags, kind first; difficulty 1–5; `undatable` set where required.
- [ ] 3 `why` items drawn only from the background.
- [ ] One glossary entry per answer term: 3 sentences, 90–110 words, ≥2 sources, markers.
- [ ] British spelling, BCE/CE, metric first, numerals for centuries, no parentheses except
      measurements.
- [ ] Anything uncertain listed in `notes`.
