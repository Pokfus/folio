#!/usr/bin/env node
/* add-lang.js — THE TOOL IS RETIRED AND REFUSES. It does nothing but explain why.

   It used to backfill ONE site language into the existing content, in batches, writing five places
   at once: i18n/ui-<lang>.js (chrome), i18n/games-<lang>.js, i18n/places-<lang>.js,
   i18n/gloss-<lang>.js and the per-card / per-node `i18n` blocks in data.js.

   EVERY ONE OF THOSE TARGETS IS NOW DELETED.

     · 2026-08-08, on request — the card `i18n` blocks and every i18n/gloss-<lang>.js. 2.06 MB of the
       EAGER path (58% of data.js) plus 3.1 MB of lazy files, none of it reachable since MULTILANG
       went false.
     · Sep 2026, on request — i18n/ui-, games- and places-<lang>.js, the whole i18n/ directory, and
       the 44 tree-node title blocks in data.js. A further 2.1 MB, better than a QUARTER of which
       translated English strings app.js no longer contains, so it could not have been correct even
       if a reader could have reached it.

   IT IS A REFUSAL RATHER THAN A DELETED FILE, and that is the point. This tool's writers call
   `fs.mkdirSync(DIR, { recursive: true })`, so running it does not fail — it silently recreates the
   directory the removal took away and reintroduces one language's worth of files that nothing loads
   and nothing checks. A tool that half-restores a deliberate deletion is worse than one that is gone,
   because the next session reads the new files as evidence the removal was reverted. Refusing says so
   out loud, at the moment somebody reaches for it.

   WHAT A REVIVAL ACTUALLY NEEDS, now that no table survives behind any of the nine languages:
     1. Regenerate the chrome, games and places families per language BEFORE `MULTILANG` moves in
        app.js — the flag is no longer the whole of the switch, because there is nothing behind it.
     2. Re-register the bundles: `langBundle` is deleted, and `loadLangData` / `gamesI18nPending` are
        stubs kept as the named seams to fill in.
     3. Re-add the ingest hooks the bundles' `after` handlers called — `glossI18nIngest`,
        `gamesI18nIngest` and `placeI18nIngest` are deleted; `GAMES_I18N` and `PLACE_I18N` survive as
        permanently empty tables whose readers already fall back to English.
     4. Regenerate the card and glossary translations from nothing. There is no partial state to
        top up.

   Not part of the site. */
"use strict";

console.error([
  "",
  "  add-lang.js is RETIRED and writes nothing.",
  "",
  "  Every file it targeted is deleted: the card and glossary translations on 2026-08-08, and the",
  "  chrome, games and places families plus the tree-node titles in Sep 2026 — all on request, with",
  "  MULTILANG staying false. Running this would recreate the i18n/ directory (its writers mkdir on",
  "  the way down) and leave one language's files that nothing loads and nothing checks.",
  "",
  "  Reviving the languages is a deliberate decision. Read this file's header for what it now costs:",
  "  there is no table left behind any of the nine, so it is a regeneration rather than a flag flip.",
  "",
].join("\n"));
process.exit(1);
