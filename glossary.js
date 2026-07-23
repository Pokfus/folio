/* Glossary tooltip descriptions, keyed by Wikipedia article slug (decoded). Add terms one at a time with
   `node .claude/add-glossary.js <entry.json>` (see CLAUDE.md). Missing terms fall back to the slug name. */
window.GLOSSARY = {
"Sima_Qian": "The Han historian (c. 145–86 BCE) regarded as the father of Chinese historiography. His <i>Records of the Grand Historian</i> set the form for the official histories of every later dynasty. He famously chose mutilation over death in order to finish his work.",
"Paleolithic": "The Paleolithic, or Old Stone Age, is the earliest and by far the longest phase of the Stone Age, spanning most of human prehistory. It began with the first use of stone tools by early humans and lasted until the end of the last Ice Age, throughout which people lived as nomadic hunter-gatherers. Stretching over millions of years, it encompasses the emergence and spread of the human species."
};

/* Optional date shown next to a term (e.g. "c. 145-86 BCE", "1644-1912"). Keyed by the same slug. */
window.GLOSSARY_DATES = Object.assign(window.GLOSSARY_DATES || {}, {
"Sima_Qian": "c. 145–86 BCE",
"Paleolithic": "c. 3.3 Mya–10,000 BCE"
});

/* Category tags per term (slug -> [tags]) — shown in the admin glossary list and filterable from its left bar. */
window.GLOSSARY_TAGS = Object.assign(window.GLOSSARY_TAGS || {}, {
"Sima_Qian": ["person","history","literature","han dynasty"],
"Paleolithic": ["era","archaeology","history"]
});
