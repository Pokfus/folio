/* Folio i18n — site-chrome translations for the language switcher (top bar).
   Loaded before app.js. English is the source language and the universal fallback: anything
   not found here simply stays English on screen.

   Three tables per language (es, fr, de, it, nl, ru, ar, zh):
     window.I18N[lang]       — exact-match text: { "English string": "translation" }.
                               Keys must equal the rendered text node, trimmed.
     window.I18N_RULES[lang] — parameterized text: [ ["^regex with (groups)$", "replacement with $1"], … ].
                               Tried in order when no exact match hits; applied to the trimmed node text.
     window.I18N_HTML[lang]  — whole prose blocks (About-page paragraphs, FAQ bodies): maps an element's
                               exact trimmed innerHTML to its translated innerHTML (inline tags included).

   The walker in app.js (localizeTree/applyLang) swaps text nodes and title/aria-label/placeholder/alt
   attributes after every render, and a MutationObserver keeps later DOM (toasts, popups, menus) localized.
   Card and glossary CONTENT is not translated here — content translations ride on the cards/glossary
   entries themselves (see CLAUDE.md, multilingual content). */
window.I18N = { es: {}, fr: {}, de: {}, it: {}, nl: {}, ru: {}, ar: {}, zh: {} };
window.I18N_RULES = { es: [], fr: [], de: [], it: [], nl: [], ru: [], ar: [], zh: [] };
window.I18N_HTML = { es: {}, fr: {}, de: {}, it: {}, nl: {}, ru: {}, ar: {}, zh: {} };
