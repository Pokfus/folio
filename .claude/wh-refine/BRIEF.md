# Brief: refine World History cards (Folio) — research + draft patch

**Another collection?** The harness takes `REFINE_PREFIX` (e.g. `rm-`; see `cfg.js`). Then read `$S/ADDENDUM.md`
after this brief: it names the collection's own rules, and where it and this brief differ, it wins.

Repo: the folio checkout. Scratch: $S = $WH_S, a directory OUTSIDE the repo holding cur/, out/, pages/, index.tsv
You draft; you do NOT write to the repo (no add-card.js, no git, no edits under /home/user/folio).
Current card + its glossary entry: $S/cur/<id>.json. One-line index of all 1000 wh- cards (id, answer,
question) for sibling checks: $S/index.tsv.

The cards were bulk-written fast: expect unsourced claims, wrong dates, citations that don't say what
they're cited for. **Re-research every claim from scratch; trust nothing on the old card, old sources
included.** Watch especially for: a modern scholar's idea presented as an ancient/prehistoric fact; a
date that belongs to a different event (discovery year vs age; one site's date given to a whole
culture); a figure no source gives. Drop or soften anything you cannot source. NEVER invent a date,
name, figure, quote, DOI, URL, page number or author first name (read names off the work itself).

## Fetching
- curl with `-sSL -A "Mozilla/5.0 (compatible; FolioStudyResearch/1.0)" --max-time 60`. Never put any
  email in a User-Agent. Wikimedia (Commons/Wikipedia API) rate-limits hard: `sleep 3` between calls.
- Good hosts: Smithsonian humanorigins.si.edu, Australian Museum, Europe PMC (full text:
  https://www.ebi.ac.uk/europepmc/webservices/rest/PMC<id>/fullTextXML), PMC, Nature open-access
  articles, PLOS, eLife, PNAS open, Science Advances, Royal Society open, Frontiers, OpenEdition,
  museum pages, university pages, Stanford Encyclopedia, archive.org full text, UNESCO is SHUT (403),
  Britannica SHUT, Wayback DOWN. NEVER cite Wikipedia (you may read it as a checklist of what a general
  account covers).
- For EVERY source you cite: save the fetched page as plain text to $S/pages/<id>-s<N>.txt (N = its
  position in your source list), e.g. `curl … | python3 -c "import sys,html,re;t=sys.stdin.read();t=re.sub(r'(?s)<(script|style).*?</\1>',' ',t);t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))" > …`.
  For a PDF use `pdftotext` if available (or python). A page that will not fetch is not citable.
- Verify a DOI resolves (curl -I https://doi.org/...) and read author names/year from Crossref
  (https://api.crossref.org/works/<doi>) — never expand initials by guesswork.

## The card rules (all hard)
- **question + questions[2]**: 3 phrasings, each ONE sentence, 20–34 words (blank counts as one), the
  blank `<span class=\"blank\">_____</span>` in the MIDDLE (sentence continues after it). **No year, century,
  millennium, decade, BCE/CE, and NO figure of years ("3 million years ago", "40,000 years", "kya")**.
  No modern scholar/excavator/discoverer named (except a card whose subject IS that person). Three
  genuinely different angles, each answerable from the background, none fitting a sibling card
  (check $S/index.tsv). Read back with the answer in the blank; supply "the" before the blank if the term
  needs it — the answer itself never carries an article. `<i>` for titles/species names only.
- **abstract**: EXACTLY 10 sentences, 5 + ` <br><br> ` + 5, **270–285 words** (count words: strip tags,
  split on spaces; imperial conversions in brackets don't count). Mean ≤ 28.5 words/sentence. Register:
  a 15-year-old new to the topic — clear, concrete, no jargon unglossed. Opens with the term in bold as
  the first mention, article outside: `The <b>Oldowan</b> is …` (only bold). Sentences 1–5: what the term
  is in general; 6–10: the substance the questions draw on. Cover the whole term (what, where, when, who,
  why it mattered, what became of it, how we know) — use its Wikipedia article as a checklist only.
  ≤ 2 sentences on modern discovery/excavation, ≤ 3 on scholarly debate; prefer "one view is…" to
  "Smith argues". Every sentence ends with an explicit marker AFTER the full stop:
  `.<sup class=\"fn\" data-fn=\"N\"></sup>` (two side by side allowed). British spelling; BCE/CE;
  metric first with imperial in brackets `about 1.05 metres (3 ft 5 in)`; NO other parentheses; centuries
  as numerals; non-round numbers > 20 as numerals; no double spaces; don't end a sentence on a lone
  capital/abbreviation. Hedge contested things.
- **sources**: count = the bar for the card's difficulty: d1 → 9, d2 → 8, d3 → 7, d4 → 6, d5 → 5
  (minimum; one or two over is fine). Chicago note form, each ENDING in a URL you actually fetched, then
  ` [Open access]` or ` [Paywalled]`. A modern author in ≤ 2 sources; an institutional author (a museum)
  counts as an author too — ≤ 2 pages from one museum. ≥ half modern scholarship (a museum page counts as
  modern). Prefer peer-reviewed articles (DOI URL, or its PMC/Europe PMC copy when the DOI is walled),
  then museum/university pages. Non-English source: at most one per language, and add ` [in French]`
  (etc.) before the access tag. Every source pointed at by ≥ 1 marker (abstract or why).
  Forms: `Author Name, “Title,” <i>Journal</i> 12, no. 3 (2017): 289–92, https://doi.org/…. [Open access]`;
  `Institution, “Page title,” accessed 1 October 2026, https://…. [Open access]`.
- **why**: exactly 3 `{q, a}`: the FAQ a newcomer would ask, usually opening "Why"; q 4–24 words ending
  "?"; a 12–60 words, not a question, written FRESH (not paraphrasing the background — aim < 25% shared
  4-word sequences); may go beyond the background, but every factual claim carries an explicit marker
  `<sup class=\"fn\" data-fn=\"N\"></sup>` into the card's own source list; none asks what the card's own
  question answers; the three ask different things.
- **answerDate**: `<div class=\"dt\"><span class=\"dt-k\">Label</span><span class=\"dt-v\">value</span>…</div>`;
  ≤ 4 rows; label ≤ 16 chars saying WHAT the date is (Lived, Made, In use, Found, Named…); every value has
  a number; era on every year < 1000; `c.` at the front of a range, never inside; deep time compact:
  `c. 3.2 Mya`, `c. 4.2 – 2 Mya`, `c. 300,000 years ago`, `115,000 – 11,700 BP`, `c. 2.6 Mya – 9700 BCE`.
  A discovery row only after the thing's own dates. Every year printed on the line must also appear in
  the abstract (same digits). The FIRST date read sets the sort year: make it the term's start. A term
  with no date: `""`. A disputed date: give the range and say whose in prose.
- **image**: keep the current one only if it is free (PD/CC0/CC BY/CC BY-SA), depicts the WHOLE term,
  has no burned-in text/watermark and is not a drawing where a photo exists; otherwise find a better
  Commons file. Get src (`thumburl` at iiurlwidth=1280), author and licence from the Commons API
  (`prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1280`), sleep 3 between calls. Download the thumb to
  $S/pages/ and LOOK at it (Read tool) before choosing. Check it is unused:
  `cd /home/user/folio && node .claude/check-image-free.js "<File name.jpg>"` (a card sharing with its OWN
  glossary term is fine). Fields: `src`, `title` (the term), `desc` (exactly what is shown; never source,
  photographer, licence, museum number or file name), `credit` = `<Author>, <Licence>, via Wikimedia
  Commons. https://commons.wikimedia.org/wiki/File:<name>` (author plain text, no HTML), `alt` (a fuller
  visual description).
- **locator**: if there is a place to stand (site, cave, findspot of a fossil), give a request
  `{ "title": "<English Wikipedia article with coordinates>", "name": "<optional place label, not the term, not starting 'The'>", "zoom": <optional> }`. Concepts, periods, species, techniques: none (`null`).
- **difficulty**: keep unless clearly wrong (1 household name … 5 obscure). Tags: keep, kind first.
- **undatable**: required (true/false) when difficulty ≤ 2 and tag 1 is concept/practice/object/people/
  technology/place/animal/…: say whether the term is located at a time.
- **glossary**: the entry in cur/<id>.json must agree with the new card (dates, figures, claims). If it
  contradicts the card or carries an unsourced claim, draft a corrected entry: description EXACTLY 3
  sentences, 90–110 words, each ending in an explicit marker, impartial, self-contained, never mentioning
  a card or a sibling term; ≥ 2 sources (same rules; may reuse card sources); keep slug, tags, aliases,
  image unless wrong. If it is fine, `"glossary": null`.

## Output (per card) — write $S/out/<id>.json
```json
{
  "patch": { "id": "wh-NNN", "question": "…", "questions": ["…","…"], "answerDate": "…", "abstract": "…",
             "sources": ["…"], "why": [{"q":"…","a":"…"}], "image": {…}, "difficulty": 3, "tags": [...],
             "undatable": false },
  "locator": null,
  "glossary": null,
  "evidence": [ { "source": 1, "url": "https://…", "file": "pages/wh-NNN-s1.txt",
                  "quotes": ["verbatim passage copied from the saved file that carries each claim cited to this source"] } ],
  "chronology": [ { "row": "Pleistocene | c. 2.58 Mya – 11,700 BP", "source": 2 } ],
  "pins": "2.58; 11,700",
  "changes": "one paragraph: what was wrong/unsourced on the old card and what you changed (be specific: old claim → why dropped/corrected)",
  "refused": "sources/pages that would not open, claims you could not source and dropped",
  "notes": "anything uncertain"
}
```
Quotes must be copied EXACTLY from the saved text file (they are checked by substring match after
whitespace normalisation), and every claim in the abstract and why answers must be covered by some quote
from the source its marker points at. Keep quotes short (one sentence each), several per source.

Before finishing, self-check each card with:
`WH_S=$S node .claude/wh-refine/precheck.js <id>`
and fix everything it reports until it says OK. Then reply with ONE short line per card (id, sources
old→new, the main correction). Keep your final reply under 150 words.

## Wikimedia is rate-limiting this IP (added after B1)
Several agents share one IP. Make at most ~10 Commons/Wikipedia calls per card, `sleep 10` between them,
and on a "too many requests" reply wait 60 s once and retry. If it still refuses: keep the card's
CURRENT image if it is acceptable (omit `image` from the patch), and say "image not re-checked" in notes.
Never cite Wikipedia. Prefer one batched API call (`titles=File:A|File:B|File:C`) over several.
Also: a date-line value never uses a decade ("1930s") — give a year a source states or drop the row.
- A question phrasing must never OPEN on a pronoun (Its, His, Her, Their, It, They) — check-questions.js refuses it.

## IMAGES ARE PAUSED (added mid-run): Wikimedia now refuses this IP outright.
Make NO Commons/Wikipedia/upload.wikimedia.org calls at all. Omit `image` from the patch (the current
picture stays), and in `notes` say in one line whether the CURRENT picture looks wrong from its
title/desc in cur/<id>.json (e.g. "image: diagram with labels, replace"). Pictures get a separate pass.
