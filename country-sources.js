/* Atlas source footnotes — the scholarship behind the place panel's prose.

   COUNTRY_SOURCES       <lowercased place name> -> [ "<Chicago note-form citation>", … ]
                         the works behind the state's GENERAL description (countries.js), which is
                         constant across map-years.
   COUNTRY_YEAR_SOURCES  <lowercased place name> -> { "<map-year>": [ … ] }
                         the works behind that year's paragraph (country-years.js).

   The panel merges the two into ONE numbered list, general first, de-duplicated — a work behind both
   paragraphs is one footnote, not two. A place with no entry simply shows no Sources fold; a missing
   citation is never invented.

   Keyed exactly like countries.js / country-years.js: the name as it appears on the map, lowercased and
   whitespace-collapsed (present-day name, or the era iteration's name).

   Citations are NOT translated — a citation names an edition that exists in one language.

   Lazy: part of the `atlas` data bundle (see DATA_BUNDLES in app.js).
   Written by `node .claude/add-country-sources.js <batch.json>` — see CLAUDE.md. */
window.COUNTRY_SOURCES = Object.assign(window.COUNTRY_SOURCES || {}, {
});

window.COUNTRY_YEAR_SOURCES = Object.assign(window.COUNTRY_YEAR_SOURCES || {}, {
});
