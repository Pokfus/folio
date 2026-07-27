/* Glossary descriptions translated into ja (slug -> text; same three-sentence rules as the English in
   glossary.js). Lazy: fetched by the `glossI18n:ja` data bundle only when the site language is ja.
   The bundle's `after` hook in app.js drains window.GLOSSARY_I18N_IN into the shipped baseline
   (PRISTINE_GLOSS_I18N) and layers any admin edits on top, producing window.GLOSSARY_I18N[slug][lang] —
   which is what glossText() reads. Grown by .claude/add-glossary.js / .claude/add-lang.js. */
(function () {
  var d = {

};
  (window.GLOSSARY_I18N_IN = window.GLOSSARY_I18N_IN || []).push({ lang: "ja", data: d });
})();
