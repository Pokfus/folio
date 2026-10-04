# Addendum for wh-301 – wh-400 (read AFTER BRIEF.md; where they differ, this wins)

1. **No Commons, Wikipedia or upload.wikimedia.org calls at all.** Omit `image` from the patch. Put ONE notes
   line: "image: ok" or "image: replace — <why>", judged from the current image's title/desc in cur/<id>.json.
2. `precheck.js` is the ONLY repo tool you run. Never run add-card.js, add-glossary.js or anything that writes.
   Never edit files under /home/user/folio.
3. pmc.ncbi.nlm.nih.gov serves a CAPTCHA: cite the Europe PMC full-text URL
   (https://www.ebi.ac.uk/europepmc/webservices/rest/PMC<id>/fullTextXML). A publisher DOI that answers 403
   gets its Europe PMC copy instead.
4. A scanned PDF with no text layer is not citable unless OCR'd and the OCR text is saved as the page.
5. Never cite a journal title, volume or page range you have not seen on the work itself or its Crossref record.
6. Date line:
   - a century alone is never a value: write the span (`c. 600 – 500 BCE`) and put the same digits in the prose;
   - no row for another event's date (a king's reign on a building card, a dynasty on a text card);
   - a concept with no real start gets `""` and `"undatable": true`.
7. Never a numeral in a question; write "more than a hundred".
8. British spelling; no spelled-out ordinal millennia ("first millennium BCE" → "1st millennium BCE").
9. A building, city, site, battle, place or state card needs a locator request
   (`{"title": "<English Wikipedia article>", "zoom": N}`; battles add `"kind": "battle"`). If the card
   ALREADY has a locator in cur/<id>.json, it stays: `"locator": null`.
10. A precheck G.date or G.none FAIL caused by the OLD glossary entry is expected while you draft a new one;
    say so in notes.
11. Glossary markers number the entry's OWN sources list (1…n), never the card's. Before proposing a NEW slug,
    `grep -n` glossary.js for the term AND for a key that differs only in form (plural, "of X", a dynasty
    qualifier, "New Kingdom" vs "New_Kingdom_of_Egypt"); if one exists, reuse that key and add an alias.
    Never draft a slug that duplicates an existing key under a different form.
12. Where the gr- (Greece), rm- (Rome), cnh- (China) or in- (India) collection covers the same subject, read
    that card and note any disagreement in notes. Never edit those cards. Helper (run from /home/user/folio):
    `node .claude/wh-refine/related.js "<regex>"` lists matching cards with their date lines;
    `node .claude/wh-refine/related.js --card gr-381` prints one in full.
13. Ancient writers (Herodotus, Thucydides, Xenophon, Livy, Plutarch, Polybius, Sima Qian…) are sources for
    what they REPORT, not proof that it happened: write "Herodotus says…". Where archaeology or other texts
    differ, say so and whose.
14. Hosts that blocked this sandbox before: UCL Digital Egypt, Met Heilbrunn essays, British Museum,
    Smarthistory, Theban Mapping Project, OpenEdition, JAEI, Persée (first page only), UCLA Encyclopedia HTML
    (its .../content/qt<ID>/qt<ID>.pdf URL works), Britannica, UNESCO, Wayback. Hosts that answered:
    Europe PMC, Nature/Sci Rep, PLOS, Frontiers, ISAC (Chicago) PDFs, archive.org, Project Gutenberg,
    Livius.org, Perseus, LacusCurtius (penelope.uchicago.edu), Bryn Mawr Classical Review, Encyclopaedia
    Iranica (iranicaonline.org — check it answers), government museum pages, Stanford Encyclopedia.
15. Siblings: check $WH_S/index.tsv so each of the three phrasings fits ONLY this card (not a neighbour in
    the deck, and not another wh- card anywhere).
16. Final reply ≤ 120 words, one line per card.
17. The three faults to hunt FIRST on the old card: a modern scholar's idea stated as ancient fact; a date
    that belongs to a different event; a figure no source gives. Never invent a date, name, figure, DOI or page.
