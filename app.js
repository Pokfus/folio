/* ============================================================
   FOLIO — application logic (vanilla JS, no dependencies)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- data ---------- */
  const CARDS = window.CARD_DATA || [];
  const TREE = window.COLLECTION_TREE || { collections: [] };
  // collection-level metadata (blurb/total) that the rebuilt tree drops — kept so "save to files" can restore it
  const COLLECTION_META = {}; (TREE.collections || []).forEach((col) => { COLLECTION_META[col.id] = { blurb: col.blurb, total: col.total }; });
  const CARD_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));

  // recursive node registry (collection → deck → subdeck, arbitrary depth)
  const COLLECTION_BY_ID = {};
  const NODE_BY_ID = {};
  function registerNode(node, parent) {
    NODE_BY_ID[node.id] = node;
    node.parentId = parent ? parent.id : null;
    node.parentTitle = parent ? parent.title : "";
    (node.children || []).forEach((ch) => registerNode(ch, node));
  }
  TREE.collections.forEach((d) => { COLLECTION_BY_ID[d.id] = d; registerNode(d, null); });
  function nodeChildren(n) { return (n && n.children) || []; }
  function nodeIsBranch(n) { return nodeChildren(n).length > 0; }
  function subtreeCardIds(n) {
    if (!n) return [];
    if (nodeIsBranch(n)) return [...new Set(nodeChildren(n).flatMap(subtreeCardIds))];
    return n.cardIds || [];
  }
  function nodeHasCards(n) { return subtreeCardIds(n).length > 0; }
  function nodePath(n) {
    const parts = [];
    let cur = n;
    while (cur) { parts.unshift(cur.title); cur = cur.parentId ? NODE_BY_ID[cur.parentId] : null; }
    return parts;
  }
  function nodeWhere(n) { return nodePath(n).join(" · "); }
  function nodeParentPath(n) { return nodePath(n).slice(0, -1).join(" · "); }
  const ALL_CARD_IDS = TREE.collections.flatMap(subtreeCardIds);
  const LEAF_NODES = Object.values(NODE_BY_ID).filter((n) => !nodeIsBranch(n) && !COLLECTION_BY_ID[n.id]);
  // card id -> its leaf node (deck), for jumping from a study card into the admin tree
  const CARD_TO_NODE = {};
  // original order of appearance (the baseline "date added" for shipped cards)
  const ORIG_INDEX = {};
  CARDS.forEach((c, i) => { ORIG_INDEX[c.id] = i; });
  // recompute the tree-derived structures after cards are created / deleted / moved
  function rebuildDerived() {
    ALL_CARD_IDS.length = 0;
    TREE.collections.flatMap(subtreeCardIds).forEach((id) => ALL_CARD_IDS.push(id));
    Object.keys(CARD_TO_NODE).forEach((k) => delete CARD_TO_NODE[k]);
    LEAF_NODES.forEach((n) => (n.cardIds || []).forEach((id) => { CARD_TO_NODE[id] = n; }));
  }
  // rebuild the node registry (NODE_BY_ID / COLLECTION_BY_ID / LEAF_NODES) after the tree shape changes
  function rebuildNodeRegistry() {
    Object.keys(NODE_BY_ID).forEach((k) => delete NODE_BY_ID[k]);
    Object.keys(COLLECTION_BY_ID).forEach((k) => delete COLLECTION_BY_ID[k]);
    TREE.collections.forEach((d) => { COLLECTION_BY_ID[d.id] = d; registerNode(d, null); });
    LEAF_NODES.length = 0;
    Object.values(NODE_BY_ID).filter((n) => !nodeIsBranch(n) && !COLLECTION_BY_ID[n.id]).forEach((n) => LEAF_NODES.push(n));
  }
  rebuildDerived();

  // every signed year mentioned in a card's answer term (BCE negative, CE positive)
  const _SY_DASH = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g;
  function cardYears(c) {
    let t = (c && c.answerDate ? String(c.answerDate) : "")
      .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/<[^>]+>/g, " ")
      .replace(/&amp;/gi, "&").replace(/&#39;/g, "'").replace(/&quot;/gi, '"').replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ").replace(_SY_DASH, "-").trim();
    const years = [];
    t = t.replace(/(\d{1,4})\s*(BCE|BC|CE|AD)\s*-\s*(\d{1,4})\s*(BCE|BC|CE|AD)\b/gi, (m, a, e1, b, e2) => { years.push((/B/i.test(e1) ? -1 : 1) * +a, (/B/i.test(e2) ? -1 : 1) * +b); return " "; });
    t = t.replace(/(\d{1,4})\s*-\s*(\d{1,4})\s*(BCE|BC|CE|AD)\b/gi, (m, a, b, era) => { const s = /B/i.test(era) ? -1 : 1; years.push(s * +a, s * +b); return " "; });
    t = t.replace(/(\d{1,4})\s*(BCE|BC|CE|AD)\b/gi, (m, n, era) => { years.push((/B/i.test(era) ? -1 : 1) * +n); return " "; });
    t = t.replace(/\b(1\d{3}|20\d{2})\b/g, (m, n) => { years.push(+n); return " "; });
    return years;
  }
  // start year of a card's answer term (signed; BCE negative; 0 if timeless) — for chronological sort.
  // A manual per-card chronology override (set in the editor) wins over the date parsed from answerDate.
  function cardStartYear(c) {
    if (c && c.id != null && ADMIN_EDITS && ADMIN_EDITS.chrono && c.id in ADMIN_EDITS.chrono) { const ov = ADMIN_EDITS.chrono[c.id]; return ov === "none" ? 0 : ov; }   // "none" = admin set it to no year → timeless
    const y = cardYears(c); return y.length ? Math.min(...y) : 0;
  }
  // years bounding a card's historical era; etymology / coinage date lines (e.g. "Silk Road —
  // coined 1877") describe a term's origin rather than the subject's period, so they're skipped
  function cardSpanYears(c) {
    const ad = (c && c.answerDate ? String(c.answerDate) : "").replace(/<[^>]+>/g, " ").trim();
    if (/^(etymology|coined)\b/i.test(ad)) return [];
    return cardYears(c);
  }
  // full coverage span of a node: earliest to latest year across its datable cards ({lo,hi} or null)
  function nodeYearSpan(node) {
    if (!node) return null;
    let lo = Infinity, hi = -Infinity;
    subtreeCardIds(node).forEach((id) => {
      const ys = cardSpanYears(CARD_BY_ID[id]);
      for (let i = 0; i < ys.length; i++) { if (ys[i] < lo) lo = ys[i]; if (ys[i] > hi) hi = ys[i]; }
    });
    return lo === Infinity ? null : { lo, hi };
  }
  // editorial label for a year span; collapses a modern end year to "present"
  function fmtYearSpan(lo, hi) {
    const cur = new Date().getFullYear();
    const lab = (y) => (y < 0 ? -y + " BCE" : y + " CE");
    const present = hi >= cur;
    if (lo === hi && !present) return lab(lo);
    if (!present && (lo < 0) === (hi < 0)) return Math.abs(lo) + " – " + lab(hi);
    return lab(lo) + " – " + (present ? "present" : lab(hi));
  }
  // the date text shown behind a deck/collection title — a manual override (set on the edit page)
  // takes precedence over the automatic earliest→latest computation
  function nodeDateOverride(id) {
    const d = ADMIN_EDITS.tree && ADMIN_EDITS.tree.dates;
    return d && Object.prototype.hasOwnProperty.call(d, id) ? d[id] : null;
  }
  function nodeSpanText(node) {
    if (!node) return "";
    const ov = nodeDateOverride(node.id);
    if (ov != null) return ov;
    const s = nodeYearSpan(node);
    return s ? fmtYearSpan(s.lo, s.hi) : "";
  }
  function setNodeDate(id, str) {
    if (!ADMIN_EDITS.tree.dates) ADMIN_EDITS.tree.dates = {};
    if (str == null || !String(str).trim()) delete ADMIN_EDITS.tree.dates[id];
    else ADMIN_EDITS.tree.dates[id] = String(str).trim();
    saveAdminEdits();
  }

  /* ---------- admin edits: a localStorage override layer applied over the shipped data ---------- */
  const ADMIN_KEY = "folio_admin_v1";
  const CARD_FIELDS = ["num", "category", "question", "answer", "answerDate", "traditional", "hanzi", "pinyin", "translations", "abstract", "citation", "answerText"];
  // pristine copies (taken before edits are applied) so any field can be reverted to what shipped
  const PRISTINE_CARDS = Object.fromEntries(CARDS.map((c) => [c.id, Object.assign({}, c)]));
  const BASE_CARD_IDS = new Set(Object.keys(PRISTINE_CARDS));   // shipped card ids (before any admin-created cards) — used to rebuild the deck from base on undo
  const PRISTINE_GLOSS = Object.assign({}, window.GLOSSARY || {});
  window.GLOSSARY_DATES = window.GLOSSARY_DATES || {};
  window.GLOSSARY_TITLES = window.GLOSSARY_TITLES || {};   // optional per-term display-title override (key stays the Wikipedia slug)
  window.GLOSSARY_ALIASES = window.GLOSSARY_ALIASES || {}; // optional alternative background spellings that also open a term's popup (slug -> [forms])
  window.GLOSSARY_CASESENSITIVE = window.GLOSSARY_CASESENSITIVE || {}; // slugs that only auto-link when the surface matches the term's own capitalization (e.g. Heaven, not heaven)
  window.GLOSSARY_TAGS = window.GLOSSARY_TAGS || {};       // per-term category tags (slug -> [tags]) — shown in the admin glossary list and filterable from its left bar
  const PRISTINE_GLOSS_DATES = Object.assign({}, window.GLOSSARY_DATES);
  const PRISTINE_GLOSS_TITLES = Object.assign({}, window.GLOSSARY_TITLES);
  const PRISTINE_GLOSS_ALIASES = Object.assign({}, window.GLOSSARY_ALIASES);
  const PRISTINE_GLOSS_TAGS = Object.assign({}, window.GLOSSARY_TAGS);
  const PRISTINE_TREE_TITLES = {}; Object.values(NODE_BY_ID).forEach((n) => { PRISTINE_TREE_TITLES[n.id] = n.title; });
  // snapshot of the shipped tree structure (used to rebuild after create/rename/delete/move)
  const SHIPPED_NODES = [];
  (function () {
    function walk(node, parentId) {
      SHIPPED_NODES.push({ id: node.id, title: node.title, parentId: parentId, placeholder: !!node.placeholder, hanzi: node.hanzi || "", cardIds: (node.cardIds || []).slice() });
      (node.children || []).forEach((ch) => walk(ch, node.id));
    }
    TREE.collections.forEach((c) => walk(c, null));
  })();
  let ADMIN_EDITS = loadAdminEdits();
  function loadAdminEdits() {
    try {
      const o = JSON.parse(localStorage.getItem(ADMIN_KEY));
      if (o && typeof o === "object") { const t = o.tree || {}; return {
        cards: o.cards || {}, glossary: o.glossary || {}, glossaryDates: o.glossaryDates || {}, glossaryTitles: o.glossaryTitles || {}, glossaryAliases: o.glossaryAliases || {}, glossaryTags: o.glossaryTags || {}, glossaryDeleted: o.glossaryDeleted || {},
        created: o.created || {}, deleted: o.deleted || {},
        membership: o.membership || {}, meta: o.meta || {}, chrono: o.chrono || {}, cardColor: o.cardColor || {}, glossColor: o.glossColor || {}, glossOff: o.glossOff || {},
        timeline: Array.isArray(o.timeline) ? o.timeline : null,   // null = untouched (use shipped timeline.js); array = the working set of historical border eras
        tree: { renames: t.renames || {}, created: t.created || {}, deleted: t.deleted || {}, moved: t.moved || {}, order: t.order || {}, soon: t.soon || {}, dates: t.dates || {}, cardOrder: t.cardOrder || {} },
      }; }
    } catch (e) {}
    return { cards: {}, glossary: {}, glossaryDates: {}, glossaryTitles: {}, glossaryAliases: {}, glossaryTags: {}, glossaryDeleted: {}, created: {}, deleted: {}, membership: {}, meta: {}, chrono: {}, cardColor: {}, glossColor: {}, glossOff: {}, timeline: null, tree: { renames: {}, created: {}, deleted: {}, moved: {}, order: {}, soon: {}, dates: {}, cardOrder: {} } };
  }
  function writeAdminEdits() { try { localStorage.setItem(ADMIN_KEY, JSON.stringify(ADMIN_EDITS)); } catch (e) {} autoSaveWrite(); }   // autoSaveWrite is a no-op unless auto-save-to-files is armed
  let adminSaveTimer = null;
  // Immediate save (structural actions: create/delete/rename/move/reorder) — each is its own undo boundary.
  function saveAdminEdits() { if (adminSaveTimer) { clearTimeout(adminSaveTimer); adminSaveTimer = null; } adminCheckpoint(); writeAdminEdits(); }
  // Debounced save (field/metadata typing) — ONE undo boundary per burst: checkpoint the pre-burst state at the
  // burst's LEADING edge (so a Ctrl+Z mid-burst still reverts the in-flight edit and a following structural action
  // doesn't collapse it), then advance the baseline to the burst's final state when the debounce fires (no 2nd entry).
  function queueAdminSave() {
    if (!adminSaveTimer) adminCheckpoint();
    clearTimeout(adminSaveTimer);
    adminSaveTimer = setTimeout(() => { adminSaveTimer = null; if (!_adminUndoing) _adminLastSnapshot = JSON.stringify(ADMIN_EDITS); writeAdminEdits(); }, 350);
  }

  // ---- admin undo (Ctrl+Z on the editor page reverts the last edit) ----
  // Every overlay commit goes through saveAdminEdits(); adminCheckpoint() snapshots the PRE-edit overlay onto a
  // stack (debounced edits collapse into one entry). Undo restores a snapshot the same way a fresh page load does:
  // reset the in-place-mutated globals (cards + glossary) to their shipped base, then re-apply the restored overlay.
  const adminUndoStack = [];
  let _adminLastSnapshot = null;   // overlay JSON as of the last checkpoint (baseline for the next undo entry)
  let _adminUndoing = false;
  let _adminUndoReady = false;     // false until boot completes, so the load-time overlay cleanup isn't captured
  function adminCheckpoint() {
    if (_adminUndoing || !_adminUndoReady) return;
    const cur = JSON.stringify(ADMIN_EDITS);
    if (_adminLastSnapshot == null) { _adminLastSnapshot = cur; return; }
    if (cur === _adminLastSnapshot) return;
    adminUndoStack.push(_adminLastSnapshot);
    if (adminUndoStack.length > 100) adminUndoStack.shift();
    _adminLastSnapshot = cur;
  }
  function glossaryResetToPristine() {
    const reset = (live, base) => { if (!live) return; Object.keys(live).forEach((k) => { if (!(k in base)) delete live[k]; }); Object.keys(base).forEach((k) => { live[k] = base[k]; }); };
    reset(window.GLOSSARY, PRISTINE_GLOSS);
    reset(window.GLOSSARY_DATES, PRISTINE_GLOSS_DATES);
    reset(window.GLOSSARY_TITLES, PRISTINE_GLOSS_TITLES);
    reset(window.GLOSSARY_ALIASES, PRISTINE_GLOSS_ALIASES);
    reset(window.GLOSSARY_TAGS, PRISTINE_GLOSS_TAGS);
  }
  function reapplyAdminOverlay(snap) {
    glossaryResetToPristine();
    CARDS.length = 0;
    Object.keys(CARD_BY_ID).forEach((id) => delete CARD_BY_ID[id]);
    BASE_CARD_IDS.forEach((id) => { const c = Object.assign({}, PRISTINE_CARDS[id]); CARD_BY_ID[id] = c; CARDS.push(c); });
    ADMIN_EDITS = snap;
    applyAdminEdits();   // rebuilds the tree from SHIPPED_NODES, re-creates admin-made cards, re-applies field/glossary/membership/order deltas
    glossIndex = null;   // the glossary linkify memo may reference reverted aliases/titles/terms — force a rebuild
  }
  function adminUndo() {
    if (!adminUndoStack.length) { toast("Nothing to undo"); return; }
    _adminUndoing = true;
    reapplyAdminOverlay(JSON.parse(adminUndoStack.pop()));
    _adminLastSnapshot = JSON.stringify(ADMIN_EDITS);
    saveAdminEdits();
    _adminUndoing = false;
    render();   // re-render the editor at the restored state (adminState keeps the user's place)
    toast("Undid last edit");
  }
  // per-card "don't auto-gloss these terms" list — set when the editor removes a gloss link in the background, so it stays removed
  function glossOffList(id) { return (id && ADMIN_EDITS.glossOff && ADMIN_EDITS.glossOff[id]) || []; }
  function setGlossOff(id, key, off) {
    if (!id || !key) return;
    if (!ADMIN_EDITS.glossOff) ADMIN_EDITS.glossOff = {};
    let arr = ADMIN_EDITS.glossOff[id] || [];
    if (off) { if (arr.indexOf(key) < 0) arr.push(key); }
    else { arr = arr.filter((k) => k !== key); }
    if (arr.length) ADMIN_EDITS.glossOff[id] = arr; else delete ADMIN_EDITS.glossOff[id];
    queueAdminSave();
  }

  function blankCard(id) { const c = { id }; CARD_FIELDS.forEach((f) => { c[f] = ""; }); return c; }
  function isCreatedCard(id) { return !!(ADMIN_EDITS.created && ADMIN_EDITS.created[id]); }
  // chronological insertion index for a card id within an ordered array of ids (by answer start year)
  function chronoIndex(arr, id) {
    const y = cardStartYear(CARD_BY_ID[id]);
    let i = 0;
    while (i < arr.length && cardStartYear(CARD_BY_ID[arr[i]]) <= y) i++;
    return i;
  }
  // insert a card id into a leaf at its chronological position (by answer start year)
  function insertChrono(leaf, id) {
    if (!leaf.cardIds) leaf.cardIds = [];
    if (leaf.cardIds.includes(id)) return;
    leaf.cardIds.splice(chronoIndex(leaf.cardIds, id), 0, id);
  }
  // re-snapshot every saved custom card order from its live cardIds, so adding/removing/moving a card keeps the
  // order faithful instead of stranding the card at the deck's end on the next reload. LIVE edits only — never
  // call during applyAdminEdits (there the custom order hasn't been applied to cardIds yet, so this would clobber it).
  function syncAllLeafOrders() {
    const T = ADMIN_EDITS.tree; if (!T || !T.cardOrder) return;
    Object.keys(T.cardOrder).forEach((leafId) => {
      const leaf = NODE_BY_ID[leafId];
      if (leaf && leaf.cardIds) T.cardOrder[leafId] = leaf.cardIds.slice();
    });
  }
  function applyAdminEdits() {
    buildTreeStructure();
    rebuildNodeRegistry();
    if (Array.isArray(ADMIN_EDITS.timeline)) window.TIMELINE = ADMIN_EDITS.timeline;   // the working set of historical border eras overrides the shipped timeline.js
    if (!Array.isArray(window.TIMELINE)) window.TIMELINE = [];
    Object.keys(ADMIN_EDITS.cards).forEach((id) => { const c = CARD_BY_ID[id]; if (c) Object.assign(c, ADMIN_EDITS.cards[id]); });
    if (window.GLOSSARY) Object.keys(ADMIN_EDITS.glossary).forEach((k) => { if (k in window.GLOSSARY) window.GLOSSARY[k] = ADMIN_EDITS.glossary[k]; });
    Object.keys(ADMIN_EDITS.glossaryDates || {}).forEach((k) => { const v = ADMIN_EDITS.glossaryDates[k]; if (v) window.GLOSSARY_DATES[k] = v; else delete window.GLOSSARY_DATES[k]; });
    Object.keys(ADMIN_EDITS.glossaryTitles || {}).forEach((k) => { const v = ADMIN_EDITS.glossaryTitles[k]; if (v) window.GLOSSARY_TITLES[k] = v; else delete window.GLOSSARY_TITLES[k]; });
    Object.keys(ADMIN_EDITS.glossaryAliases || {}).forEach((k) => { const v = ADMIN_EDITS.glossaryAliases[k]; if (v && v.length) window.GLOSSARY_ALIASES[k] = v; else delete window.GLOSSARY_ALIASES[k]; });
    Object.keys(ADMIN_EDITS.glossaryTags || {}).forEach((k) => { const v = ADMIN_EDITS.glossaryTags[k]; if (v && v.length) window.GLOSSARY_TAGS[k] = v; else delete window.GLOSSARY_TAGS[k]; });
    // glossary deletions: drop the term from the live glossary, but only while the shipped text is unchanged.
    // If the slug was re-added or edited out-of-band (e.g. add-glossary.js rewrote glossary.js), retire the tombstone
    // so the term isn't silently re-hidden — and isn't wiped from glossary.js on the next Save to project.
    if (window.GLOSSARY) {
      let gdChanged = false;
      Object.keys(ADMIN_EDITS.glossaryDeleted || {}).forEach((k) => {
        const rec = ADMIN_EDITS.glossaryDeleted[k];
        if (!(k in window.GLOSSARY)) { delete ADMIN_EDITS.glossaryDeleted[k]; gdChanged = true; return; }   // nothing to hide
        if (rec === true || window.GLOSSARY[k] === rec) { delete window.GLOSSARY[k]; if (window.GLOSSARY_DATES) delete window.GLOSSARY_DATES[k]; if (window.GLOSSARY_TITLES) delete window.GLOSSARY_TITLES[k]; }
        else { delete ADMIN_EDITS.glossaryDeleted[k]; gdChanged = true; }   // re-added/changed → let it show again
      });
      if (gdChanged) saveAdminEdits();
    }
    // re-create admin-created cards
    Object.keys(ADMIN_EDITS.created).forEach((id) => {
      if (CARD_BY_ID[id]) return;
      const c = Object.assign(blankCard(id), ADMIN_EDITS.created[id]); c.id = id;
      CARDS.push(c); CARD_BY_ID[id] = c; PRISTINE_CARDS[id] = blankCard(id);
    });
    // membership overrides: place each card in exactly the listed leaves
    Object.keys(ADMIN_EDITS.membership).forEach((id) => {
      if (!CARD_BY_ID[id]) return;
      const want = new Set(ADMIN_EDITS.membership[id]);
      LEAF_NODES.forEach((leaf) => {
        const has = (leaf.cardIds || []).includes(id);
        if (want.has(leaf.id) && !has) insertChrono(leaf, id);
        else if (!want.has(leaf.id) && has) leaf.cardIds = leaf.cardIds.filter((x) => x !== id);
      });
    });
    // deletions: drop the card everywhere
    Object.keys(ADMIN_EDITS.deleted).forEach((id) => {
      LEAF_NODES.forEach((leaf) => { if (leaf.cardIds) leaf.cardIds = leaf.cardIds.filter((x) => x !== id); });
      const i = CARDS.findIndex((c) => c.id === id); if (i >= 0) CARDS.splice(i, 1);
      delete CARD_BY_ID[id];
    });
    // custom per-deck card order (set via drag-reorder in the editor) — reorder each leaf's cardIds to match
    const co = ADMIN_EDITS.tree.cardOrder || {};
    Object.keys(co).forEach((leafId) => {
      const leaf = NODE_BY_ID[leafId]; if (!leaf || !leaf.cardIds) return;
      const present = new Set(leaf.cardIds);
      const ordered = co[leafId].filter((id) => present.has(id));   // honour the saved order, dropping stale ids
      // place anything not covered by the saved order (e.g. a card added in another session) at its chronological
      // slot rather than the end, so it lands where the chronological default would put it
      leaf.cardIds.forEach((id) => { if (ordered.indexOf(id) < 0) ordered.splice(chronoIndex(ordered, id), 0, id); });
      leaf.cardIds.length = 0; for (let i = 0; i < ordered.length; i++) leaf.cardIds.push(ordered[i]);
    });
    rebuildDerived();
  }

  function cardLeaves(id) { return LEAF_NODES.filter((l) => (l.cardIds || []).includes(id)); }
  function touchModified(id) {
    if (!ADMIN_EDITS.meta[id]) ADMIN_EDITS.meta[id] = { created: isCreatedCard(id) ? Date.now() : ORIG_INDEX[id] };
    ADMIN_EDITS.meta[id].modified = Date.now();
  }
  function cardCreatedAt(id) {
    if (ADMIN_EDITS.meta[id] && ADMIN_EDITS.meta[id].created != null) return ADMIN_EDITS.meta[id].created;
    if (isCreatedCard(id)) return Number.MAX_SAFE_INTEGER;
    return ORIG_INDEX[id] != null ? ORIG_INDEX[id] : Number.MAX_SAFE_INTEGER;
  }
  function cardModifiedAt(id) {
    if (ADMIN_EDITS.meta[id] && ADMIN_EDITS.meta[id].modified != null) return ADMIN_EDITS.meta[id].modified;
    return cardCreatedAt(id);
  }

  function setCardEdit(id, field, value) {
    const c = CARD_BY_ID[id]; if (!c) return;
    c[field] = value; // study pages read CARD_BY_ID, so the change is live immediately
    if (isCreatedCard(id)) {
      ADMIN_EDITS.created[id][field] = value;
    } else {
      const orig = PRISTINE_CARDS[id] ? PRISTINE_CARDS[id][field] : undefined;
      if (value === orig) {
        if (ADMIN_EDITS.cards[id]) { delete ADMIN_EDITS.cards[id][field]; if (!Object.keys(ADMIN_EDITS.cards[id]).length) delete ADMIN_EDITS.cards[id]; }
      } else {
        if (!ADMIN_EDITS.cards[id]) ADMIN_EDITS.cards[id] = {};
        ADMIN_EDITS.cards[id][field] = value;
      }
    }
    touchModified(id);
    queueAdminSave();
  }
  // manual chronology (sort-year) override — overlay-only admin metadata, like deck dates
  function parseChronoYear(str) {
    const t = String(str == null ? "" : str).trim();
    if (!t) return null;
    let y = null;
    if (/^-?\d{1,4}$/.test(t)) y = +t;                          // explicit signed year ("-200", "618")
    else { let m = /\b(\d{1,4})\s*(BCE|BC)\b/i.exec(t); if (m) y = -(+m[1]);
      else { m = /\b(\d{1,4})\s*(CE|AD)\b/i.exec(t); if (m) y = +m[1];
        else { m = /\b(\d{1,4})\b/.exec(t); if (m) y = +m[1]; } } }   // bare number → read as CE; \b-anchored so "12345" is rejected, not truncated
    return y === 0 ? null : y;                                  // year 0 doesn't exist (and is the timeless sentinel) → treat as blank
  }
  function chronoLabel(y) { return y === "none" ? "no year" : (y == null ? "" : (y < 0 ? -y + " BCE" : y + " CE")); }
  function setCardChrono(id, str) {
    const t = String(str == null ? "" : str).trim().toLowerCase();
    if (/^(none|no\s*-?year|nil|n\/a|—|-)$/.test(t)) { ADMIN_EDITS.chrono[id] = "none"; queueAdminSave(); return; }   // explicit "no year" (distinct from blank = auto)
    const y = parseChronoYear(str);
    if (y == null) delete ADMIN_EDITS.chrono[id]; else ADMIN_EDITS.chrono[id] = y;
    queueAdminSave();
  }
  // admin-only colour marks — overlay-only; never shown on the study card / glossary popup
  function setCardColor(id, name) {
    if (!name) delete ADMIN_EDITS.cardColor[id]; else ADMIN_EDITS.cardColor[id] = name;
    queueAdminSave();
  }
  function cardColor(id) { return (ADMIN_EDITS.cardColor && ADMIN_EDITS.cardColor[id]) || ""; }
  function setGlossColor(k, name) {
    if (!name) delete ADMIN_EDITS.glossColor[k]; else ADMIN_EDITS.glossColor[k] = name;
    queueAdminSave();
  }
  function glossColor(k) { return (ADMIN_EDITS.glossColor && ADMIN_EDITS.glossColor[k]) || ""; }
  // cards that belong to no deck (every leaf) — shown under the admin-only "Deckless cards" node
  function decklessCardIds() { return CARDS.filter((c) => cardLeaves(c.id).length === 0).map((c) => c.id); }
  function revertCard(id) {
    const p = PRISTINE_CARDS[id]; if (!p) return;
    CARD_FIELDS.forEach((f) => { if (f in p) CARD_BY_ID[id][f] = p[f]; });
    if (isCreatedCard(id)) { ADMIN_EDITS.created[id] = {}; CARD_FIELDS.forEach((f) => { ADMIN_EDITS.created[id][f] = CARD_BY_ID[id][f]; }); }
    else delete ADMIN_EDITS.cards[id];
    if (ADMIN_EDITS.meta[id]) delete ADMIN_EDITS.meta[id].modified;
    saveAdminEdits();
  }
  function cardIsEdited(id) {
    if (isCreatedCard(id)) return true;
    return !!(ADMIN_EDITS.cards[id] && Object.keys(ADMIN_EDITS.cards[id]).length);
  }

  // create a new blank card, optionally into a leaf; returns the new id
  let _newCardSeq = 0;
  function createCard(intoLeafId) {
    let id;
    do { _newCardSeq++; id = "new-" + _newCardSeq; } while (CARD_BY_ID[id] || (ADMIN_EDITS.deleted && ADMIN_EDITS.deleted[id]));
    const c = blankCard(id);
    CARDS.push(c); CARD_BY_ID[id] = c; PRISTINE_CARDS[id] = blankCard(id);
    ADMIN_EDITS.created[id] = {}; CARD_FIELDS.forEach((f) => { ADMIN_EDITS.created[id][f] = ""; });
    ADMIN_EDITS.meta[id] = { created: Date.now(), modified: Date.now() };
    const leaves = [];
    if (intoLeafId && NODE_BY_ID[intoLeafId] && !nodeIsBranch(NODE_BY_ID[intoLeafId])) { insertChrono(NODE_BY_ID[intoLeafId], id); leaves.push(intoLeafId); }
    ADMIN_EDITS.membership[id] = leaves;
    syncAllLeafOrders(); rebuildDerived(); saveAdminEdits();
    return id;
  }
  function deleteCard(id) {
    LEAF_NODES.forEach((leaf) => { if (leaf.cardIds) leaf.cardIds = leaf.cardIds.filter((x) => x !== id); });
    const i = CARDS.findIndex((c) => c.id === id); if (i >= 0) CARDS.splice(i, 1);
    delete CARD_BY_ID[id];
    if (isCreatedCard(id)) delete ADMIN_EDITS.created[id];
    else ADMIN_EDITS.deleted[id] = true;
    delete ADMIN_EDITS.cards[id]; delete ADMIN_EDITS.membership[id]; delete ADMIN_EDITS.meta[id];
    if (ADMIN_EDITS.chrono) delete ADMIN_EDITS.chrono[id]; if (ADMIN_EDITS.cardColor) delete ADMIN_EDITS.cardColor[id]; if (ADMIN_EDITS.glossOff) delete ADMIN_EDITS.glossOff[id];   // don't strand overlay metadata (could resurrect onto a reused new-N id)
    syncAllLeafOrders(); rebuildDerived(); saveAdminEdits();
  }
  // set the exact set of leaves a card belongs to
  function setCardMembership(id, leafIds) {
    const want = new Set(leafIds);
    LEAF_NODES.forEach((leaf) => {
      const has = (leaf.cardIds || []).includes(id);
      if (want.has(leaf.id) && !has) insertChrono(leaf, id);
      else if (!want.has(leaf.id) && has) leaf.cardIds = leaf.cardIds.filter((x) => x !== id);
    });
    ADMIN_EDITS.membership[id] = [...want];
    touchModified(id);
    syncAllLeafOrders(); rebuildDerived(); queueAdminSave();
  }
  function everyCardId() { return CARDS.map((c) => c.id); }

  /* ---------- collection / deck (tree) structure edits ---------- */
  let _newNodeSeq = 0;
  function _seqOf(id) { const m = /(\d+)$/.exec(id || ""); return m ? +m[1] : 0; }
  function genNodeId(prefix) {
    let id;
    do { _newNodeSeq++; id = prefix + "-" + _newNodeSeq; } while (NODE_BY_ID[id] || ADMIN_EDITS.tree.created[id] || ADMIN_EDITS.tree.deleted[id]);
    return id;
  }
  function isCreatedNode(id) { return !!(ADMIN_EDITS.tree && ADMIN_EDITS.tree.created[id]); }
  function nodeIsEdited(id) {
    const T = ADMIN_EDITS.tree; if (!T) return false;
    return isCreatedNode(id) || T.renames[id] != null || (T.moved && (id in T.moved)) || (T.dates && (id in T.dates));
  }
  // the parent a node is pinned to by edits (created spec / move), or undefined = use shipped parent
  function _editedParentId(id) {
    const T = ADMIN_EDITS.tree;
    if (T.created[id]) return T.created[id].parentId || null;
    if (T.moved && (id in T.moved)) return T.moved[id];
    return undefined;
  }
  // rebuild TREE.collections + node objects declaratively from shipped structure + structural edits
  function buildTreeStructure() {
    const T = ADMIN_EDITS.tree || { renames: {}, created: {}, deleted: {}, moved: {}, order: {} };
    const specs = new Map();
    SHIPPED_NODES.forEach((s) => {
      if (T.deleted[s.id]) return;
      const ep = _editedParentId(s.id);
      specs.set(s.id, {
        id: s.id,
        title: T.renames[s.id] != null ? T.renames[s.id] : s.title,
        parentId: ep === undefined ? s.parentId : ep,
        placeholder: s.placeholder, hanzi: s.hanzi,
        cardIds: s.cardIds.slice(),
      });
    });
    Object.values(T.created).forEach((c) => {
      if (T.deleted[c.id]) return;
      specs.set(c.id, { id: c.id, title: c.title, parentId: c.parentId || null, placeholder: false, hanzi: "", cardIds: [] });
    });
    // drop nodes whose parent no longer exists (deleted) — and, iteratively, their descendants
    let changed = true;
    while (changed) {
      changed = false;
      specs.forEach((s, id) => { if (s.parentId && !specs.has(s.parentId)) { specs.delete(id); changed = true; } });
    }
    // break any accidental cycle by detaching the node to the top level
    specs.forEach((s) => {
      let cur = s.parentId, seen = {}, hops = 0;
      while (cur && hops++ < 9999) { if (seen[cur] || cur === s.id) { s.parentId = null; break; } seen[cur] = 1; const p = specs.get(cur); cur = p ? p.parentId : null; }
    });
    const nodeById = {};
    specs.forEach((s) => { nodeById[s.id] = { id: s.id, title: s.title, placeholder: s.placeholder, hanzi: s.hanzi, cardIds: s.cardIds, children: [] }; });
    const order = [], seen = {};
    SHIPPED_NODES.forEach((s) => { if (nodeById[s.id] && !seen[s.id]) { order.push(s.id); seen[s.id] = 1; } });
    Object.values(T.created).sort((a, b) => _seqOf(a.id) - _seqOf(b.id)).forEach((c) => { if (nodeById[c.id] && !seen[c.id]) { order.push(c.id); seen[c.id] = 1; } });
    const tops = [];
    order.forEach((id) => {
      const s = specs.get(id), node = nodeById[id], pid = s.parentId;
      if (pid && nodeById[pid]) nodeById[pid].children.push(node);
      else tops.push(node);
    });
    // apply admin custom ordering (per parent; "" = top-level). Listed children first in their order, rest appended.
    const ordMap = (T.order || {});
    function applyOrder(list, key) {
      const ord = ordMap[key]; if (!ord || !ord.length) return list;
      const idx = {}; ord.forEach((id, i) => { idx[id] = i; });
      return list.slice().sort((a, b) => {
        const ia = idx[a.id] != null ? idx[a.id] : 1e6, ib = idx[b.id] != null ? idx[b.id] : 1e6;
        return ia - ib;
      });
    }
    Object.values(nodeById).forEach((n) => { if (n.children.length) n.children = applyOrder(n.children, n.id); });
    TREE.collections = applyOrder(tops, "");
  }
  function _treeChanged() { applyAdminEdits(); saveAdminEdits(); }
  function renameNode(id, title) {
    if (!NODE_BY_ID[id]) return;
    title = (title || "").trim(); if (!title) return;
    if (isCreatedNode(id)) ADMIN_EDITS.tree.created[id].title = title;
    else if (title === (PRISTINE_TREE_TITLES[id] || "")) delete ADMIN_EDITS.tree.renames[id];
    else ADMIN_EDITS.tree.renames[id] = title;
    _treeChanged();
  }
  function createNode(parentId, title) {
    if (parentId && !NODE_BY_ID[parentId]) return null;
    title = (title || "").trim() || (parentId ? "New deck" : "New collection");
    const id = genNodeId(parentId ? "deck" : "col");
    ADMIN_EDITS.tree.created[id] = { id, title, parentId: parentId || null };
    _treeChanged();
    return id;
  }
  function deleteNode(id) {
    const n = NODE_BY_ID[id]; if (!n) return;
    const subtree = [];
    (function collect(node) { subtree.push(node.id); (node.children || []).forEach(collect); })(n);
    subtree.forEach((sid) => {
      if (isCreatedNode(sid)) delete ADMIN_EDITS.tree.created[sid];
      else ADMIN_EDITS.tree.deleted[sid] = true;
      delete ADMIN_EDITS.tree.renames[sid];
      if (ADMIN_EDITS.tree.moved) delete ADMIN_EDITS.tree.moved[sid];
    });
    _treeChanged();
  }
  // is target inside nodeId's subtree (or equal to it)? used to block invalid drags
  function isWithinSubtree(targetId, nodeId) {
    let cur = targetId;
    while (cur) { if (cur === nodeId) return true; const n = NODE_BY_ID[cur]; cur = n ? n.parentId : null; }
    return false;
  }
  // collections, branches, and empty leaves can accept children
  function nodeAcceptsChildren(id) {
    const n = NODE_BY_ID[id]; if (!n) return false;
    if (COLLECTION_BY_ID[id]) return true;
    if (nodeIsBranch(n)) return true;
    return !(n.cardIds && n.cardIds.length);
  }
  function canMoveNode(id, newParentId) {
    if (!NODE_BY_ID[id]) return false;
    if (newParentId === null) { const n = NODE_BY_ID[id]; return !!n.parentId; } // already top-level → no-op
    if (newParentId === id) return false;
    if (!NODE_BY_ID[newParentId]) return false;
    if (NODE_BY_ID[id].parentId === newParentId) return false; // already there
    if (isWithinSubtree(newParentId, id)) return false; // would create a cycle
    if (!nodeAcceptsChildren(newParentId)) return false;
    return true;
  }
  function moveNode(id, newParentId) {
    if (!canMoveNode(id, newParentId)) return false;
    if (isCreatedNode(id)) ADMIN_EDITS.tree.created[id].parentId = newParentId;
    else {
      const shipped = SHIPPED_NODES.find((s) => s.id === id);
      if (shipped && (shipped.parentId || null) === (newParentId || null)) delete ADMIN_EDITS.tree.moved[id];
      else ADMIN_EDITS.tree.moved[id] = newParentId;
    }
    _treeChanged();
    return true;
  }
  // count of cards inside a node's subtree
  function nodeCardCount(id) { const n = NODE_BY_ID[id]; return n ? subtreeCardIds(n).length : 0; }

  // A collection/deck is "coming soon" if an admin pinned it there, else automatically when it holds no cards.
  function isComingSoon(node) {
    if (!node) return false;
    const T = ADMIN_EDITS.tree;
    if (T && T.soon && (node.id in T.soon)) return !!T.soon[node.id];
    return !!node.placeholder || subtreeCardIds(node).length === 0;
  }
  // pin a node into a section (true = coming soon, false = all decks); clears the pin when it matches the automatic state
  function setNodeSoon(id, soon) {
    const n = NODE_BY_ID[id]; if (!n) return;
    const auto = !!n.placeholder || subtreeCardIds(n).length === 0;
    if (!ADMIN_EDITS.tree.soon) ADMIN_EDITS.tree.soon = {};
    if (soon === auto) delete ADMIN_EDITS.tree.soon[id];
    else ADMIN_EDITS.tree.soon[id] = soon;
  }
  // persist a custom order for a parent's children ("" = top-level collections)
  function reorderSiblings(parentKey, orderedIds) {
    if (!ADMIN_EDITS.tree.order) ADMIN_EDITS.tree.order = {};
    ADMIN_EDITS.tree.order[parentKey || ""] = orderedIds.slice();
  }
  // persist a custom order for the cards inside one leaf deck — this is the order new cards are introduced when studying
  function reorderLeafCards(leafId, orderedIds) {
    const leaf = NODE_BY_ID[leafId]; if (!leaf || !leaf.cardIds || nodeIsBranch(leaf)) return;
    const present = new Set(leaf.cardIds);
    const next = orderedIds.filter((id) => present.has(id));            // honour the dropped order…
    leaf.cardIds.forEach((id) => { if (next.indexOf(id) < 0) next.push(id); });   // …keeping any cards not shown (e.g. filtered out)
    leaf.cardIds.length = 0; for (let i = 0; i < next.length; i++) leaf.cardIds.push(next[i]);
    if (!ADMIN_EDITS.tree.cardOrder) ADMIN_EDITS.tree.cardOrder = {};
    ADMIN_EDITS.tree.cardOrder[leafId] = leaf.cardIds.slice();
    rebuildDerived(); saveAdminEdits();
  }
  // whether the current user may rearrange the library and reach the admin page.
  // Driven by the top-bar mode toggle; defaults to admin (undefined !== false) for backward compatibility.
  function isAdmin() {
    if (SUPA_PROFILE) return SUPA_PROFILE.role === "admin";   // signed in online → the server-stored role decides (set it in Supabase → Table Editor → profiles)
    const u = currentUser();
    if (u) return u.role === "admin";        // legacy local account → its role decides
    if (S && S.settings && S.settings.adminMode === false) return false;   // "preview as visitor" (guest only)
    return noAccounts();                      // guest on a fresh device → admin (the local dev machine)
  }

  function setGlossEdit(key, value) {
    if (!window.GLOSSARY) return;
    window.GLOSSARY[key] = value;
    if (value === PRISTINE_GLOSS[key]) delete ADMIN_EDITS.glossary[key];
    else ADMIN_EDITS.glossary[key] = value;
    queueAdminSave();
  }
  function setGlossDateEdit(key, value) {
    const v = (value || "").trim();
    if (v) window.GLOSSARY_DATES[key] = v; else delete window.GLOSSARY_DATES[key];
    if (v === (PRISTINE_GLOSS_DATES[key] || "")) delete ADMIN_EDITS.glossaryDates[key];
    else ADMIN_EDITS.glossaryDates[key] = v;
    queueAdminSave();
  }
  function setGlossTitleEdit(key, value) {
    const v = (value || "").trim();
    if (v) window.GLOSSARY_TITLES[key] = v; else delete window.GLOSSARY_TITLES[key];
    if (v === (PRISTINE_GLOSS_TITLES[key] || "")) delete ADMIN_EDITS.glossaryTitles[key];
    else ADMIN_EDITS.glossaryTitles[key] = v;
    queueAdminSave();
  }
  // alternative background spellings (comma-separated) that should open the same popup; plurals are handled automatically
  function setGlossAliasEdit(key, value) {
    const arr = String(value || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (arr.length) window.GLOSSARY_ALIASES[key] = arr; else delete window.GLOSSARY_ALIASES[key];
    if (JSON.stringify(arr) === JSON.stringify(PRISTINE_GLOSS_ALIASES[key] || [])) delete ADMIN_EDITS.glossaryAliases[key];
    else ADMIN_EDITS.glossaryAliases[key] = arr;
    glossIndex = null;   // rebuild the linkify index so new aliases take effect
    queueAdminSave();
  }
  // category tags (comma-separated) shown in the glossary list's second column and used by the left-bar tag filter
  function setGlossTagsEdit(key, value) {
    const arr = String(value || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (arr.length) window.GLOSSARY_TAGS[key] = arr; else delete window.GLOSSARY_TAGS[key];
    if (JSON.stringify(arr) === JSON.stringify(PRISTINE_GLOSS_TAGS[key] || [])) delete ADMIN_EDITS.glossaryTags[key];
    else ADMIN_EDITS.glossaryTags[key] = arr;
    queueAdminSave();
  }
  function glossTags(k) { return (window.GLOSSARY_TAGS && window.GLOSSARY_TAGS[k]) || []; }
  function revertGloss(key) {
    if (window.GLOSSARY && key in PRISTINE_GLOSS) window.GLOSSARY[key] = PRISTINE_GLOSS[key];
    delete ADMIN_EDITS.glossary[key];
    if (key in PRISTINE_GLOSS_DATES) window.GLOSSARY_DATES[key] = PRISTINE_GLOSS_DATES[key]; else delete window.GLOSSARY_DATES[key];
    delete ADMIN_EDITS.glossaryDates[key];
    if (key in PRISTINE_GLOSS_TITLES) window.GLOSSARY_TITLES[key] = PRISTINE_GLOSS_TITLES[key]; else delete window.GLOSSARY_TITLES[key];
    delete ADMIN_EDITS.glossaryTitles[key];
    if (key in PRISTINE_GLOSS_ALIASES) window.GLOSSARY_ALIASES[key] = PRISTINE_GLOSS_ALIASES[key]; else delete window.GLOSSARY_ALIASES[key];
    delete ADMIN_EDITS.glossaryAliases[key];
    if (key in PRISTINE_GLOSS_TAGS) window.GLOSSARY_TAGS[key] = PRISTINE_GLOSS_TAGS[key]; else delete window.GLOSSARY_TAGS[key];
    delete ADMIN_EDITS.glossaryTags[key];
    glossIndex = null;
    saveAdminEdits();
  }
  // remove a glossary term: drop it from the live glossary, clear any of its edits, and record the deletion delta
  function deleteGloss(key) {
    // remember the deleted text so the tombstone can tell a still-deleted term from one that was re-added/changed out-of-band
    const txt = (window.GLOSSARY && window.GLOSSARY[key] != null) ? window.GLOSSARY[key] : true;
    if (window.GLOSSARY) delete window.GLOSSARY[key];
    if (window.GLOSSARY_DATES) delete window.GLOSSARY_DATES[key];
    if (window.GLOSSARY_TITLES) delete window.GLOSSARY_TITLES[key];
    if (window.GLOSSARY_ALIASES) delete window.GLOSSARY_ALIASES[key];
    if (window.GLOSSARY_TAGS) delete window.GLOSSARY_TAGS[key];
    delete ADMIN_EDITS.glossary[key]; delete ADMIN_EDITS.glossaryDates[key]; delete ADMIN_EDITS.glossaryTitles[key]; delete ADMIN_EDITS.glossaryAliases[key]; delete ADMIN_EDITS.glossaryTags[key];
    if (ADMIN_EDITS.glossOff) delete ADMIN_EDITS.glossOff[key];   // don't strand a deleted term's gloss-removal list
    glossIndex = null;
    if (ADMIN_EDITS.glossColor) delete ADMIN_EDITS.glossColor[key];   // don't strand the colour mark of a deleted term
    ADMIN_EDITS.glossaryDeleted[key] = txt;
    saveAdminEdits();
  }
  // earliest signed year mentioned in a term's date line (BCE negative), or null — for the glossary "By date" sort.
  // Era-marked numbers are consumed first (and removed from the text); whatever bare years remain are read as CE,
  // so era-less forms like "618–907" or "220–280" (how these dynasties are conventionally written) sort correctly.
  function glossStartYear(k) {
    let t = ((window.GLOSSARY_DATES && window.GLOSSARY_DATES[k]) || "").replace(/[‐‑‒–—―−]/g, "-");
    if (!t) return null;
    const ys = [];
    t = t.replace(/(\d{1,4})\s*-\s*(\d{1,4})\s*(BCE|BC|CE|AD)\b/gi, (m, a, b, era) => { const s = /^b/i.test(era) ? -1 : 1; ys.push(s * +a, s * +b); return " "; });
    t = t.replace(/(\d{1,4})\s*(BCE|BC|CE|AD)\b/gi, (m, n, era) => { ys.push((/^b/i.test(era) ? -1 : 1) * +n); return " "; });
    t = t.replace(/\b(BCE|BC|CE|AD)\s*(\d{1,4})\b/gi, (m, era, n) => { ys.push((/^b/i.test(era) ? -1 : 1) * +n); return " "; });
    t.replace(/\b(\d{3,4})\b/g, (m, n) => { ys.push(+n); return " "; });   // remaining bare years are read as CE
    return ys.length ? Math.min(...ys) : null;
  }
  function glossIsEdited(key) { return key in ADMIN_EDITS.glossary || key in ADMIN_EDITS.glossaryDates || key in ADMIN_EDITS.glossaryTitles || key in ADMIN_EDITS.glossaryAliases || key in (ADMIN_EDITS.glossaryTags || {}); }
  function adminEditCount() {
    const ids = new Set([
      ...Object.keys(ADMIN_EDITS.cards), ...Object.keys(ADMIN_EDITS.created),
      ...Object.keys(ADMIN_EDITS.deleted), ...Object.keys(ADMIN_EDITS.membership),
    ]);
    const T = ADMIN_EDITS.tree || { renames: {}, created: {}, deleted: {}, dates: {} };
    const treeN = Object.keys(T.renames).length + Object.keys(T.created).length + Object.keys(T.deleted).length + Object.keys(T.dates || {}).length + Object.keys(T.cardOrder || {}).length;
    return ids.size + Object.keys(ADMIN_EDITS.glossary).length + Object.keys(ADMIN_EDITS.glossaryDates || {}).length + Object.keys(ADMIN_EDITS.glossaryTitles || {}).length + Object.keys(ADMIN_EDITS.glossaryAliases || {}).length + Object.keys(ADMIN_EDITS.glossaryTags || {}).length + Object.keys(ADMIN_EDITS.glossaryDeleted || {}).length + Object.keys(ADMIN_EDITS.chrono || {}).length + Object.keys(ADMIN_EDITS.cardColor || {}).length + Object.keys(ADMIN_EDITS.glossColor || {}).length + treeN;
  }
  applyAdminEdits();

  /* ---------- state / persistence ---------- */
  const STORE_KEY = "folio_v1";
  function defaultState() {
    return {
      user: { name: "Scholar", joined: Date.now() },
      settings: { night: false, theme: "folio", newPerDay: 3, bgCollapsed: false, trCollapsed: true, adminMode: true, reviewRandom: false, lang: "en", tts: true, ttsMuted: false, ttsVoiceEn: "", ttsVoiceZh: "", home: { name: "Netherlands", lon: 5.32, lat: 52.1 } },
      cards: {}, // id -> {reps,lapses,ease,interval,due,status,last}
      suspended: {}, // id -> true (card set aside; never shown again)
      daily: { lastPlayed: 0, best: 0, games: 0, wins: 0, podiums: 0 },
      chrono: { date: "", best: 0, plays: 0, solved: false }, // timeline game daily record
      games: {}, // minigame id ("challenge"/"chrono"/"truefalse"/"whosaid") -> { date, played, won } for today's tile checkmarks + the daily-sweep badge
      intro: { date: "", count: 0 }, // new cards introduced today
      streak: { count: 0, last: "" },
      active: ["cn-qing"], // deck/subdeck ids added to the daily review
      achievements: {}, // achievement id -> unlock timestamp
    };
  }
  let S = load();
  if (S.settings && !S.settings.home) S.settings.home = { name: "Netherlands", lon: 5.32, lat: 52.1 };   // back-fill for saves made before Home location existed (settings are shallow-merged, so an older save's settings object lacks it)
  if (S.settings && S.settings.tts === undefined) S.settings.tts = true;          // back-fill: TTS on by default for older saves
  if (S.settings && S.settings.ttsMuted === undefined) S.settings.ttsMuted = false;
  if (S.settings && S.settings.ttsVoiceEn === undefined) S.settings.ttsVoiceEn = "";   // "" = auto-pick the best available voice
  if (S.settings && S.settings.ttsVoiceZh === undefined) S.settings.ttsVoiceZh = "";
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return defaultState();
      return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) {
      return defaultState();
    }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {}
    syncProgressToAccount();   // mirror live study progress into a legacy local account (no-op normally)
    supaQueuePush();           // debounced background push to the online account (no-op when signed out/offline)
  }
  // daily minigame results — each of the 4 home games records a per-day { played, won } so the tile shows a
  // checkmark once played today and the "Clean Sweep" badge unlocks when all four are won on the same day.
  const DAILY_GAMES = ["challenge", "chrono", "truefalse", "whosaid"];
  function markGamePlayed(key, won) {
    if (!S.games) S.games = {};
    const t = todayStr();
    let g = S.games[key];
    if (!g || g.date !== t) g = { date: t, played: false, won: false };
    g.played = true;
    if (won) g.won = true;
    S.games[key] = g;
  }
  function gamePlayedToday(key) { const g = S.games && S.games[key]; return !!(g && g.date === todayStr() && g.played); }
  function gameWonToday(key) { const g = S.games && S.games[key]; return !!(g && g.date === todayStr() && g.won); }   // won = a perfect run today (gold tile)
  function allGamesWonToday(prog) {
    const g = (prog && prog.games) || {}, t = todayStr();
    return DAILY_GAMES.every((k) => g[k] && g[k].date === t && g[k].won);
  }

  /* ---------- LEGACY local accounts (superseded by the Supabase online accounts below) ----------
     Kept for: the admin page's local-user manager, the guest-progress stash helpers (extractProgress /
     applyProgress / emptyProgress), and older saves. The account page no longer signs in against this. */
  const ACCT_KEY = "folio_acct_v1";
  const PROGRESS_FIELDS = ["cards", "suspended", "daily", "chrono", "games", "intro", "streak", "active", "achievements"];
  const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  function defaultAcct() { return { users: {}, current: null, guest: null }; }
  let ACCT = (function () {
    let a;
    try { const raw = localStorage.getItem(ACCT_KEY); a = raw ? Object.assign(defaultAcct(), JSON.parse(raw)) : defaultAcct(); }
    catch (e) { a = defaultAcct(); }
    for (const k in (a.users || {})) {   // heal partial/older records so friend ops never crash
      const u = a.users[k]; if (!u) continue;
      if (!Array.isArray(u.friends)) u.friends = [];
      if (!u.requests || typeof u.requests !== "object") u.requests = { in: [], out: [] };
      if (!Array.isArray(u.requests.in)) u.requests.in = [];
      if (!Array.isArray(u.requests.out)) u.requests.out = [];
    }
    return a;
  })();
  function saveAcct() { try { localStorage.setItem(ACCT_KEY, JSON.stringify(ACCT)); } catch (e) {} }
  function uKey(name) { return (name || "").trim().toLowerCase(); }
  function currentUser() { return (typeof ACCT !== "undefined" && ACCT.current && ACCT.users[ACCT.current]) || null; }
  function isLoggedIn() { return !!currentUser(); }
  function noAccounts() { return !ACCT || Object.keys(ACCT.users).length === 0; }
  function randHex(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map((b) => b.toString(16).padStart(2, "0")).join(""); }
  function genRecovery() { const a = new Uint8Array(8); crypto.getRandomValues(a); const s = [...a].map((b) => B32[b & 31]).join(""); return s.slice(0, 4) + "-" + s.slice(4, 8); }
  async function hashPass(pw, salt) {
    const data = new TextEncoder().encode(salt + "::" + pw);
    if (window.crypto && crypto.subtle) {
      try { const buf = await crypto.subtle.digest("SHA-256", data); return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join(""); } catch (e) {}
    }
    let h = 0x811c9dc5; for (let i = 0; i < data.length; i++) { h ^= data[i]; h = Math.imul(h, 0x01000193); } // fallback (local-only)
    return (h >>> 0).toString(16) + salt;
  }
  // study progress <-> account record
  function extractProgress() { const p = {}; PROGRESS_FIELDS.forEach((k) => { p[k] = S[k]; }); return JSON.parse(JSON.stringify(p)); }
  function applyProgress(p) { const base = emptyProgress(); PROGRESS_FIELDS.forEach((k) => { S[k] = JSON.parse(JSON.stringify(p && p[k] !== undefined ? p[k] : base[k])); }); }
  function emptyProgress() { const d = defaultState(), p = {}; PROGRESS_FIELDS.forEach((k) => { p[k] = d[k]; }); return p; }
  function syncProgressToAccount() {
    const u = currentUser(); if (!u) return;
    u.progress = extractProgress();
    if (S.user) u.name = S.user.name;
    saveAcct();
  }
  function beginSession(key) {
    if (!ACCT.current) ACCT.guest = { name: S.user.name, joined: S.user.joined, progress: extractProgress() };  // stash device/guest state
    const u = ACCT.users[key];
    ACCT.current = key;
    applyProgress(u.progress || emptyProgress());
    S.user.name = u.name; S.user.joined = u.created || Date.now();
    save(); saveAcct();
  }
  async function registerUser(name, pw) {
    const key = uKey(name);
    if (key.length < 2) return { error: "Username must be at least 2 characters." };
    if (!/^[a-z0-9_.\- ]+$/i.test(name.trim())) return { error: "Use letters, numbers, spaces, . _ or - only." };
    if (ACCT.users[key]) return { error: "That username is already taken." };
    if (!pw || pw.length < 4) return { error: "Password must be at least 4 characters." };
    const first = noAccounts(), salt = randHex(8), recovery = genRecovery(), pass = await hashPass(pw, salt);
    // the very first account (the admin) inherits whatever the device has studied so far; later accounts start clean
    ACCT.users[key] = { username: name.trim(), name: name.trim(), pass, salt, recovery, role: first ? "admin" : "user", progress: first ? extractProgress() : emptyProgress(), friends: [], requests: { in: [], out: [] }, created: Date.now() };
    saveAcct();
    return { ok: true, recovery, admin: first };
  }
  async function loginUser(name, pw) {
    const key = uKey(name), u = ACCT.users[key];
    if (!u) return { error: "No account with that username." };
    if (await hashPass(pw, u.salt) !== u.pass) return { error: "Incorrect password." };
    beginSession(key);
    return { ok: true };
  }
  function logoutUser() {
    const u = currentUser();
    if (u) { u.progress = extractProgress(); u.name = S.user.name; }
    const g = ACCT.guest || { name: "Scholar", joined: Date.now(), progress: emptyProgress() };
    ACCT.current = null; ACCT.guest = null;
    applyProgress(g.progress); S.user.name = g.name; S.user.joined = g.joined || Date.now();
    save(); saveAcct();
  }
  async function setPassword(key, newPw) {
    const u = ACCT.users[key]; if (!u) return { error: "No such account." };
    if (!newPw || newPw.length < 4) return { error: "Password must be at least 4 characters." };
    u.salt = randHex(8); u.pass = await hashPass(newPw, u.salt); saveAcct(); return { ok: true };
  }
  async function resetWithRecovery(name, code, newPw) {
    const u = ACCT.users[uKey(name)]; if (!u) return { error: "No account with that username." };
    const norm = (s) => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");   // tolerate the dash being typed or not
    if (norm(code) !== norm(u.recovery)) return { error: "That recovery code doesn't match." };
    const r = await setPassword(uKey(name), newPw); if (r.error) return r;
    u.recovery = genRecovery(); saveAcct();   // rotate the code after use
    return { ok: true };
  }
  // friends
  function sendFriendReq(name) {
    const me = currentUser(), mkey = ACCT.current; if (!me) return { error: "Sign in first." };
    const tkey = uKey(name), t = ACCT.users[tkey];
    if (!t) return { error: "No account with that username." };
    if (tkey === mkey) return { error: "You can't add yourself." };
    if (me.friends.includes(tkey)) return { error: "You're already friends." };
    if ((me.requests.in || []).includes(tkey)) { acceptFriendReq(tkey); return { ok: true, accepted: true }; }
    if ((me.requests.out || []).includes(tkey)) return { error: "Request already sent." };
    me.requests.out.push(tkey); t.requests.in.push(mkey); saveAcct(); return { ok: true };
  }
  function acceptFriendReq(fromKey) {
    const me = currentUser(), mkey = ACCT.current, f = ACCT.users[fromKey]; if (!me || !f) return;
    if (!(me.requests.in || []).includes(fromKey)) return;   // only accept a real pending request
    me.requests.in = me.requests.in.filter((x) => x !== fromKey);
    f.requests.out = (f.requests.out || []).filter((x) => x !== mkey);
    if (!me.friends.includes(fromKey)) me.friends.push(fromKey);
    if (!f.friends.includes(mkey)) f.friends.push(mkey);
    saveAcct();
  }
  function declineFriendReq(fromKey) {
    const me = currentUser(), mkey = ACCT.current, f = ACCT.users[fromKey]; if (!me) return;
    me.requests.in = me.requests.in.filter((x) => x !== fromKey);
    if (f) f.requests.out = (f.requests.out || []).filter((x) => x !== mkey);
    saveAcct();
  }
  function cancelFriendReq(toKey) {
    const me = currentUser(), mkey = ACCT.current, t = ACCT.users[toKey]; if (!me) return;
    me.requests.out = me.requests.out.filter((x) => x !== toKey);
    if (t) t.requests.in = (t.requests.in || []).filter((x) => x !== mkey);
    saveAcct();
  }
  function removeFriend(key) {
    const me = currentUser(), mkey = ACCT.current, f = ACCT.users[key]; if (!me) return;
    me.friends = me.friends.filter((x) => x !== key);
    if (f) f.friends = (f.friends || []).filter((x) => x !== mkey);
    saveAcct();
  }
  // admin operations
  function acctSetRole(key, role) { const u = ACCT.users[key]; if (u) { u.role = role === "admin" ? "admin" : "user"; saveAcct(); } }
  function acctDelete(key) {
    if (!ACCT.users[key]) return;
    if (ACCT.current === key) logoutUser();
    delete ACCT.users[key];
    Object.values(ACCT.users).forEach((u) => {
      u.friends = (u.friends || []).filter((x) => x !== key);
      u.requests.in = (u.requests.in || []).filter((x) => x !== key);
      u.requests.out = (u.requests.out || []).filter((x) => x !== key);
    });
    saveAcct();
  }
  function acctRotateRecovery(key) { const u = ACCT.users[key]; if (!u) return null; u.recovery = genRecovery(); saveAcct(); return u.recovery; }

  /* ---------- Supabase: online accounts + progress sync ----------
     Plain fetch() against the project's REST + auth endpoints (no SDK — zero-dependency rule). The publishable key is
     safe to ship; security lives in the row-level-security policies (.claude/supabase-schema.sql). The app stays
     OFFLINE-FIRST: localStorage is the working copy; the server is a background sync target. Signed out = the old
     device-local behaviour, unchanged. */
  const SUPA_URL = "https://qnrnjjcjeggzndgxtyqx.supabase.co";
  const SUPA_KEY = "sb_publishable_ew3iNcUTazB89PqZG32GWw_ayFyAc4q";
  const SUPA_SESS_KEY = "folio_supa_v1";      // { access_token, refresh_token, expires_at, user:{id,email} }
  const SUPA_GUEST_KEY = "folio_supa_guest_v1"; // the device/guest state stashed while someone is signed in
  let SUPA = null;          // the live session (or null = signed out / guest)
  let SUPA_PROFILE = null;  // cached profiles row { id, username, name, role, joined }
  function supaLoggedIn() { return !!(SUPA && SUPA.user && SUPA.user.id); }
  function supaSaveSession() { try { if (SUPA) localStorage.setItem(SUPA_SESS_KEY, JSON.stringify(SUPA)); else localStorage.removeItem(SUPA_SESS_KEY); } catch (e) {} }
  function supaAdoptSession(d) {   // d = an auth response with access_token/refresh_token/expires_in/user
    SUPA = {
      access_token: d.access_token, refresh_token: d.refresh_token,
      expires_at: Date.now() + Math.max(60, (d.expires_in || 3600) - 60) * 1000,
      user: { id: d.user && d.user.id, email: d.user && d.user.email },
    };
    supaSaveSession();
  }
  async function supaFetch(path, opts) {
    opts = opts || {};
    const headers = Object.assign({ apikey: SUPA_KEY, "Content-Type": "application/json" }, opts.headers || {});
    if (opts.auth !== false && SUPA && SUPA.access_token) headers.Authorization = "Bearer " + SUPA.access_token;
    let res;
    try { res = await fetch(SUPA_URL + path, { method: opts.method || "GET", headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined }); }
    catch (e) { return { ok: false, status: 0, data: null }; }   // offline / network error
    if (res.status === 401 && opts.auth !== false && SUPA && SUPA.refresh_token && !opts._retried) {
      if (await supaRefresh()) return supaFetch(path, Object.assign({}, opts, { _retried: true }));   // expired token → refresh once, retry
    }
    let data = null;
    const txt = await res.text();
    if (txt) { try { data = JSON.parse(txt); } catch (e) { data = txt; } }
    return { ok: res.ok, status: res.status, data };
  }
  function supaErrMsg(r, fallback) {
    const d = r && r.data;
    return (d && (d.error_description || d.msg || d.message || (d.error && d.error.message))) || fallback || "Something went wrong — try again.";
  }
  async function supaRefresh() {
    if (!SUPA || !SUPA.refresh_token) return false;
    const r = await supaFetch("/auth/v1/token?grant_type=refresh_token", { method: "POST", auth: false, body: { refresh_token: SUPA.refresh_token } });
    if (r.ok && r.data && r.data.access_token) { supaAdoptSession(r.data); return true; }
    if (r.status === 400 || r.status === 401 || r.status === 403) { SUPA = null; SUPA_PROFILE = null; supaSaveSession(); }   // token revoked/stale → signed out
    return false;
  }
  async function supaLoadProfile() {
    if (!supaLoggedIn()) return null;
    const r = await supaFetch("/rest/v1/profiles?id=eq." + SUPA.user.id + "&select=id,username,name,role,joined");
    if (r.ok && Array.isArray(r.data) && r.data[0]) SUPA_PROFILE = r.data[0];
    return SUPA_PROFILE;
  }
  /* --- progress sync (debounced push on save(); pull + reconcile at boot/login) --- */
  let _supaLastSent = null, _supaPushTimer = null;
  // order-insensitive serialization for change detection — Postgres jsonb does NOT preserve key order,
  // so a plain JSON.stringify comparison against a round-tripped row would almost always "differ"
  function stableJson(x) {
    if (x === null || typeof x !== "object") return JSON.stringify(x);
    if (Array.isArray(x)) return "[" + x.map(stableJson).join(",") + "]";
    return "{" + Object.keys(x).sort().map((k) => JSON.stringify(k) + ":" + stableJson(x[k])).join(",") + "}";
  }
  async function supaPull() {
    if (!supaLoggedIn()) return null;
    const r = await supaFetch("/rest/v1/progress?user_id=eq." + SUPA.user.id + "&select=data,updated_at");
    if (!r.ok || !Array.isArray(r.data)) return null;
    if (!r.data.length) {   // the signup trigger seeds this row; recreate it if it's somehow missing
      await supaFetch("/rest/v1/progress", { method: "POST", body: { user_id: SUPA.user.id }, headers: { Prefer: "resolution=merge-duplicates" } });
      return { data: {}, updated_at: null };
    }
    return r.data[0];
  }
  async function supaPush() {
    if (!supaLoggedIn()) return false;
    const p = extractProgress(), sent = stableJson(p);
    const r = await supaFetch("/rest/v1/progress?user_id=eq." + SUPA.user.id + "&select=updated_at", { method: "PATCH", body: { data: p }, headers: { Prefer: "return=representation" } });
    if (r.ok && Array.isArray(r.data) && r.data.length) {
      _supaLastSent = sent;
      S._supaTs = r.data[0].updated_at;   // device-local sync baseline (not in PROGRESS_FIELDS, so it never syncs itself)
      try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {}   // write directly — save() would re-queue a push
      return true;
    }
    return false;
  }
  function supaQueuePush() {   // called from save(); waits for a quiet moment, skips when nothing changed
    if (!supaLoggedIn()) return;
    clearTimeout(_supaPushTimer);
    _supaPushTimer = setTimeout(() => {
      _supaPushTimer = null;
      if (stableJson(extractProgress()) !== _supaLastSent) supaPush();
    }, 6000);
  }
  window.addEventListener("online", () => supaQueuePush());   // flush anything written while offline
  /* --- auth flows --- */
  async function supaAfterSignIn() {
    await supaLoadProfile();
    try { localStorage.setItem(SUPA_GUEST_KEY, JSON.stringify({ name: S.user.name, joined: S.user.joined, progress: extractProgress() })); } catch (e) {}   // stash device state; restored on sign-out
    const row = await supaPull();
    const serverP = (row && row.data) || {};
    const serverHas = Object.keys(serverP).length > 0;
    const localHas = Object.keys(S.cards || {}).length > 0 || Object.keys(S.achievements || {}).length > 0;
    if (serverHas) { applyProgress(serverP); S._supaTs = row.updated_at; }   // the account's saved progress wins on sign-in
    else if (localHas) { await supaPush(); }                                 // first sign-in with local study history → migrate it up
    if (SUPA_PROFILE && SUPA_PROFILE.name) S.user.name = SUPA_PROFILE.name;
    if (SUPA_PROFILE && SUPA_PROFILE.joined) S.user.joined = new Date(SUPA_PROFILE.joined).getTime() || S.user.joined;
    save();
    applyMode();   // the server role may change admin visibility
  }
  async function supaSignUp(email, username, name, pw) {
    const r = await supaFetch("/auth/v1/signup", { method: "POST", auth: false, body: { email, password: pw, data: { username, name } } });
    if (!r.ok) return { error: supaErrMsg(r, "Could not create the account.") };
    if (r.data && r.data.access_token) { supaAdoptSession(r.data); await supaAfterSignIn(); return { ok: true } }
    return { ok: true, confirm: true };   // email confirmation is on: no session until the emailed link is clicked
  }
  async function supaSignIn(email, pw) {
    const r = await supaFetch("/auth/v1/token?grant_type=password", { method: "POST", auth: false, body: { email, password: pw } });
    if (!r.ok) return { error: supaErrMsg(r, "Sign-in failed — check your email and password.") };
    supaAdoptSession(r.data);
    await supaAfterSignIn();
    return { ok: true };
  }
  async function supaSignOut() {
    if (supaLoggedIn()) { clearTimeout(_supaPushTimer); _supaPushTimer = null; await supaPush(); }   // final sync of this device's progress
    supaFetch("/auth/v1/logout", { method: "POST" });   // best-effort token revoke
    SUPA = null; SUPA_PROFILE = null; supaSaveSession();
    let g = null; try { g = JSON.parse(localStorage.getItem(SUPA_GUEST_KEY) || "null"); } catch (e) {}
    try { localStorage.removeItem(SUPA_GUEST_KEY); } catch (e) {}
    const base = g || { name: "Scholar", joined: Date.now(), progress: emptyProgress() };
    applyProgress(base.progress); S.user.name = base.name; S.user.joined = base.joined || Date.now();
    delete S._supaTs; _supaLastSent = null;
    save();
    applyMode();
  }
  async function supaRecover(email) {
    const r = await supaFetch("/auth/v1/recover", { method: "POST", auth: false, body: { email } });
    return r.ok ? { ok: true } : { error: supaErrMsg(r, "Could not send the reset email.") };
  }
  async function supaSetPassword(newPw) {
    if (!newPw || newPw.length < 6) return { error: "Password must be at least 6 characters." };
    const r = await supaFetch("/auth/v1/user", { method: "PUT", body: { password: newPw } });
    return r.ok ? { ok: true } : { error: supaErrMsg(r, "Could not update the password.") };
  }
  async function supaSetName(name) {
    if (!supaLoggedIn()) return;
    const r = await supaFetch("/rest/v1/profiles?id=eq." + SUPA.user.id, { method: "PATCH", body: { name } });
    if (r.ok && SUPA_PROFILE) SUPA_PROFILE.name = name;
  }
  /* --- boot: restore the session, handle emailed links, reconcile progress --- */
  async function supaBoot() {
    // a Supabase email link (recovery / confirmation) lands with tokens in the URL hash — adopt them, clean the URL
    if (/[#&]access_token=/.test(location.hash || "") && /type=(recovery|signup|magiclink|invite)/.test(location.hash)) {
      const q = {};
      location.hash.slice(1).split("&").forEach((kv) => { const i = kv.indexOf("="); if (i > 0) q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); });
      SUPA = { access_token: q.access_token, refresh_token: q.refresh_token, expires_at: Date.now() + (parseInt(q.expires_in || "3600", 10) - 60) * 1000, user: {} };
      const u = await supaFetch("/auth/v1/user");
      if (u.ok && u.data && u.data.id) {
        SUPA.user = { id: u.data.id, email: u.data.email };
        supaSaveSession();
        await supaAfterSignIn();
        toast(q.type === "recovery" ? "Signed in — set a new password under Account" : "Email confirmed — you're signed in");
      } else { SUPA = null; supaSaveSession(); }
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      route("account");
      return;
    }
    try { SUPA = JSON.parse(localStorage.getItem(SUPA_SESS_KEY) || "null"); } catch (e) { SUPA = null; }
    if (!supaLoggedIn()) { SUPA = null; return; }
    if (Date.now() > (SUPA.expires_at || 0)) { if (!(await supaRefresh())) { applyMode(); if (current && current.name === "account") render(); return; } }
    await supaLoadProfile();
    applyMode();
    const row = await supaPull();
    if (row && row.updated_at && row.updated_at !== S._supaTs) {
      // another device wrote since this one last synced → adopt the server copy (last write wins)
      applyProgress(row.data || {});
      S._supaTs = row.updated_at;
      if (SUPA_PROFILE && SUPA_PROFILE.name) S.user.name = SUPA_PROFILE.name;
      save();
      if (current && ["home", "decks"].includes(current.name)) render();
    } else if (row && stableJson(extractProgress()) !== stableJson(row.data || {})) {
      supaPush();   // this device moved ahead while offline → send it up
    } else {
      _supaLastSent = row ? stableJson(row.data || {}) : null;   // in sync — remember it so the next save() can no-op
    }
    if (current && current.name === "account") render();   // session/profile just arrived — swap the sign-in form for the signed-in view
  }

  /* ---------- helpers ---------- */
  const DAY = 86400000;
  const now = () => Date.now();
  const todayStr = () => new Date().toISOString().slice(0, 10);
  function esc(s) {
    return (s || "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  }
  function stripHtml(s) { return (s || "").replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim(); }
  function pick(arr, n) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return n == null ? a : a.slice(0, n);
  }
  function fmtInterval(days) {
    if (days < 1 / 24) return "<10m";
    if (days < 1) return Math.max(1, Math.round(days * 24)) + "m";
    if (days < 30) return Math.round(days) + "d";
    if (days < 365) return Math.round(days / 30) + "mo";
    return (days / 365).toFixed(1) + "y";
  }
  function openLinks(root) {
    root.querySelectorAll("a[href]").forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
  }

  /* ---------- glossary tooltips for background terms ---------- */
  function fallbackSentence(k) {
    const name = (k || "").replace(/_\([^)]*\)$/, "").replace(/_/g, " ").trim();
    const low = name.toLowerCase();
    const ends = (w) => low.endsWith(w);
    if (ends("emperor") || ends("empress") || low.startsWith("empress dowager")) return name + " was a ruler or consort of imperial China.";
    if (low.startsWith("treaty of") || low.startsWith("convention of") || ends("treaty") || ends("protocol") || ends("agreement")) return name + " was a treaty or diplomatic agreement of this era.";
    if (low.startsWith("battle of") || low.startsWith("siege of")) return name + " was a military engagement of this era.";
    if (/(rebellion|uprising|revolt|incident|campaign|expedition|massacre|conference|mutiny)$/.test(low) || ends(" war") || ends("movement")) return name + " was a notable event of this era in Chinese history.";
    if (/(army|fleet|navy|clique|banners|division)$/.test(low)) return name + " was a military force or faction of this era.";
    if (/(university|academy|college)$/.test(low)) return name + " was an educational institution of this era.";
    if (ends("dynasty")) return name + " was a dynasty in Chinese history.";
    if (ends("province")) return name + " is a province of China.";
    return name + " is a person, place, or concept referenced in this card's background.";
  }
  function glossText(k) {
    const G = window.GLOSSARY || {};
    return G[k] || fallbackSentence(k);
  }
  // optional start/end dates for a glossary entry (e.g. "1644–1912", "551–479 BCE"); blank if none
  function glossDates(k) {
    const D = window.GLOSSARY_DATES || {};
    const v = D[k];
    return v ? String(v).trim() : "";
  }
  // remove a parenthetical date from the description when it's identical to the date label
  // shown beneath the title (e.g. label "202 BCE–220 CE" drops "(202 BCE–220 CE)" from the prose).
  function stripDupDates(text, label) {
    const normDate = (s) =>
      String(s).replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212-]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
    const core = label.replace(/^(?:r\.|c\.|fl\.|b\.|d\.)\s*/i, "").trim();
    const targets = new Set([normDate(label), normDate(core)]);
    return text
      .replace(/\s*\(([^)]*)\)/g, (m, inner) => {
        const ni = normDate(inner);
        const niCore = ni.replace(/^(?:r\.|c\.|fl\.|b\.|d\.)\s*/, "");
        return targets.has(ni) || targets.has(niCore) ? "" : m;
      })
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([.,;:])/g, "$1")
      .trim();
  }
  function glossKeyTitle(k) { return (k || "").replace(/_\([^)]*\)$/, "").replace(/_/g, " ").trim(); }   // humanized slug
  function glossTitle(k) { const T = window.GLOSSARY_TITLES || {}; return T[k] || glossKeyTitle(k); }     // display-title override, else the slug
  // likely English plural form(s) of a term, pluralizing its last word (e.g. "culture hero" -> "culture heroes")
  function pluralForms(name) {
    const m = String(name || "").match(/^(.*?)(\S+)$/);
    if (!m) return [];
    const pre = m[1], w = m[2], out = [];
    if (/[^aeiou]y$/i.test(w)) out.push(pre + w.slice(0, -1) + "ies");                 // city -> cities
    else if (/(s|x|z|ch|sh|o)$/i.test(w)) { out.push(pre + w + "es"); out.push(pre + w + "s"); } // hero -> heroes (also lenient +s)
    else out.push(pre + w + "s");                                                       // dragon -> dragons
    return out;
  }
  // lazily build an index of glossary display-names (+ aliases + plurals) -> keys + a matching regex
  let glossIndex = null;
  // a surface is treated case-sensitive if it looks like a proper name (has an internal capital,
  // e.g. "Great Wall of China", "United States", "NATO") — so "great walls" / "us" won't link.
  function isProperCS(surface) { return /[A-Z]/.test(String(surface || "").slice(1)); }
  function buildGlossIndex() {
    const G = window.GLOSSARY || {};
    const A = window.GLOSSARY_ALIASES || {};
    const CS = window.GLOSSARY_CASESENSITIVE || {};   // explicit per-key flags (e.g. Heaven, God, Gun)
    const byName = {};      // lowercased surface -> key (case-insensitive common nouns)
    const byNameCS = {};    // exact-case surface -> key (proper names + flagged terms)
    const names = [];
    const add = (surface, k) => {
      const s = String(surface || "").trim();
      if (s.length < 3) return;               // skip ultra-short surfaces to avoid noise
      if (CS[k] || isProperCS(s)) { if (!byNameCS[s]) { byNameCS[s] = k; names.push(s); } }   // exact case only
      else { const low = s.toLowerCase(); if (!byName[low]) { byName[low] = k; names.push(s); } }
    };
    const keys = Object.keys(G);
    // pass 1: primary term names (singular) — win any collision
    keys.forEach((k) => add(glossKeyTitle(k), k));
    // pass 2: admin-defined alias spellings (singular)
    keys.forEach((k) => (A[k] || []).forEach((al) => add(al, k)));
    // pass 3: plurals — only for case-insensitive surfaces (proper names are not pluralized/linked lowercase)
    keys.forEach((k) => {
      if (CS[k]) return;
      const t = glossKeyTitle(k);
      if (!isProperCS(t)) pluralForms(t).forEach((p) => add(p, k));
      (A[k] || []).forEach((al) => { if (!isProperCS(al)) pluralForms(al).forEach((p) => add(p, k)); });
    });
    names.sort((a, b) => b.length - a.length); // longest first so phrases win over their parts
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Unicode-aware word boundary (\b only sees ASCII \w, so terms/aliases that begin or end with a
    // diacritic letter — Æsir, Vé — would never match). Bound on letters/numbers/underscore instead.
    const re = names.length ? new RegExp("(?<![\\p{L}\\p{N}_])(" + names.map(esc).join("|") + ")(?![\\p{L}\\p{N}_])", "giu") : null;
    glossIndex = { byName, byNameCS, re };
  }
  // resolve a matched surface to a glossary key: exact-case (proper names) first, else lowercased (common nouns)
  function resolveGlossKey(surface) {
    if (!glossIndex) return null;
    return glossIndex.byNameCS[surface] || glossIndex.byName[String(surface).toLowerCase()] || null;
  }
  function escHtml(s) {
    return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  // wrap any glossary terms found in a description in clickable .ttip spans (skipping self)
  function linkifyGloss(text, selfKey) {
    if (!glossIndex) buildGlossIndex();
    const re = glossIndex && glossIndex.re;
    if (!re) return escHtml(text);
    let out = "", last = 0, m; const seen = new Set();
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      const key = resolveGlossKey(m[0]);
      out += escHtml(text.slice(last, m.index));
      if (key && key !== selfKey && !seen.has(key)) {   // link only the first occurrence of each term in the popup (case routing handled by resolveGlossKey)
        seen.add(key);
        out += '<span class="ttip" data-k="' + key + '">' + escHtml(m[0]) + "</span>";
      } else {
        out += escHtml(m[0]);
      }
      last = m.index + m[0].length;
    }
    out += escHtml(text.slice(last));
    return out.replace(/&lt;(\/?[bi])&gt;/g, "<$1>");   // allow basic <b>/<i> formatting in descriptions; everything else stays escaped
  }

  // Auto-link glossary terms inside a rendered Background element: wrap the FIRST
  // occurrence of each glossary term in a clickable .ttip span so links never have to
  // be hand-added to a card. The card's answer term is never linked, and text already
  // inside a link or inside the bold answer term is skipped.
  function autoLinkGlossary(rootEl, answerText, offKeys) {
    if (!rootEl) return;
    if (!glossIndex) buildGlossIndex();
    const idx = glossIndex;
    if (!idx || !idx.re) return;
    const answer = (answerText || "").trim().toLowerCase();
    const linked = new Set();
    const answerKey = answer ? idx.byName[answer] : null;
    if (answerKey) linked.add(answerKey);
    if (offKeys && offKeys.length) offKeys.forEach((k) => linked.add(k));   // terms the editor removed in this card's background — keep them un-linked
    // respect hand-added links already in the source: don't auto-link a term the editor linked manually
    rootEl.querySelectorAll(".ttip[data-k]").forEach((sp) => linked.add(sp.getAttribute("data-k")));
    // gather eligible text nodes in document order (skip links + the answer term)
    const nodes = [];
    const walk = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        let p = node.parentNode;
        while (p && p !== rootEl) {
          if (p.nodeName === "A") return NodeFilter.FILTER_REJECT;
          if (p.classList && (p.classList.contains("ttip") || p.classList.contains("ans-term"))) return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let nd;
    while ((nd = walk.nextNode())) nodes.push(nd);
    for (const tn of nodes) {
      const text = tn.nodeValue;
      idx.re.lastIndex = 0;
      let m, last = 0, frag = null;
      while ((m = idx.re.exec(text))) {
        const surface = m[0];
        const key = resolveGlossKey(surface);
        if (!key || linked.has(key) || surface.toLowerCase() === answer) continue;
        if (!frag) frag = document.createDocumentFragment();
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const span = document.createElement("span");
        span.className = "ttip";
        span.setAttribute("data-k", key);
        span.setAttribute("data-auto", "1");   // mark as auto-generated so processAbstract re-derives it but keeps hand-added links
        span.textContent = surface;
        frag.appendChild(span);
        last = m.index + surface.length;
        linked.add(key);
      }
      if (frag) {
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        tn.parentNode.replaceChild(frag, tn);
      }
    }
  }

  /* ---------- glossary windows (desktop: draggable, up to 4; mobile: single bottom sheet) ---------- */
  const glossWins = [];
  let glossZ = 8000;
  let glossGlobalsWired = false;
  const glossMobileMQ = window.matchMedia("(max-width: 640px)");
  const isMobileGloss = () => glossMobileMQ.matches;

  // remember which gloss popups are open (owning route + term + position) so a page reload can re-open them.
  // Uses sessionStorage: it survives an F5 / dev-server live-reload in the SAME tab, but a tab/browser CLOSE clears it,
  // so a cold restart won't resurrect stale popups. Navigation still dismisses them (render() -> closeAllGloss clears
  // the record); only a reload with popups still on screen, on the same page, restores them.
  const GLOSS_OPEN_KEY = "folio_gloss_open_v1";
  function persistGlossOpen() {
    try { sessionStorage.setItem(GLOSS_OPEN_KEY, JSON.stringify({ r: current && current.name, w: glossWins.map((w) => ({ k: w.dataset.k, l: parseFloat(w.style.left) || 0, t: parseFloat(w.style.top) || 0 })) })); } catch (e) {}
  }
  function readGlossOpen() {
    try {
      const o = JSON.parse(sessionStorage.getItem(GLOSS_OPEN_KEY) || "null");
      if (Array.isArray(o)) return { r: null, w: o };   // tolerate an older array-only record
      return o && Array.isArray(o.w) ? o : { r: null, w: [] };
    } catch (e) { return { r: null, w: [] }; }
  }
  function restoreGlossWins(saved) {
    if (!saved || !Array.isArray(saved.w) || !saved.w.length) return;
    if (saved.r && current && saved.r !== current.name) return;   // only restore popups for the page they were opened on (a study popup won't float over Home)
    const eligible = saved.w.filter((o) => o && o.k && window.GLOSSARY && (o.k in window.GLOSSARY));   // skip terms no longer in the glossary
    const list = isMobileGloss() ? eligible.slice(0, 1) : eligible;   // mobile shows one sheet at a time; opening a 2nd would destroy the 1st
    const seen = new Set();
    list.forEach((o) => {
      if (seen.has(o.k)) return;
      seen.add(o.k);
      openGlossWin(o.k, null, (isFinite(o.l) && isFinite(o.t)) ? { left: o.l, top: o.t } : null);
    });
  }

  function removeGlossWin(win, animate) {
    const i = glossWins.indexOf(win);
    if (i >= 0) glossWins.splice(i, 1);
    persistGlossOpen();
    if (animate) {
      win.classList.add("closing");
      win.classList.remove("show");
      setTimeout(() => win.remove(), 220);
    } else {
      win.remove();
    }
  }
  function closeAllGloss() {
    glossWins.slice().forEach((w) => w.remove());
    glossWins.length = 0;
    try { sessionStorage.removeItem(GLOSS_OPEN_KEY); } catch (e) {}   // navigation dismisses popups; don't resurrect them on the next reload
  }
  function focusGlossWin(win) { win.style.zIndex = ++glossZ; }
  function flashGloss(win) { win.classList.remove("flash"); void win.offsetWidth; win.classList.add("flash"); }
  function clampGlossWin(win) {
    const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    let l = parseFloat(win.style.left) || 0, t = parseFloat(win.style.top) || 0;
    l = Math.max(6, Math.min(l, vw - win.offsetWidth - 6));
    t = Math.max(6, Math.min(t, vh - 38));
    win.style.left = l + "px"; win.style.top = t + "px";
  }
  // place a window just outside the study-card (or its parent gloss-win, when nested),
  // vertically aligned to the clicked term, on whichever side is nearer the term
  function positionGlossBeside(win, triggerEl) {
    const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    const w = win.offsetWidth, h = win.offsetHeight, gap = 16;
    const ref = (triggerEl && triggerEl.closest(".gloss-win")) ||
      document.querySelector(".study-card") || document.querySelector(".cardwrap");
    if (!ref || !triggerEl) {
      win.style.left = Math.max(12, vw - w - 24) + "px";
      win.style.top = "92px"; win.style.right = "auto";
      return;
    }
    const refR = ref.getBoundingClientRect();
    const tR = triggerEl.getBoundingClientRect();
    const tCenter = tR.left + tR.width / 2;
    const putLeft = (tCenter - refR.left) <= (refR.right - tCenter);
    let left;
    if (putLeft) {
      left = refR.left - w - gap;
      if (left < 6) left = refR.right + gap; // no room on the left -> flip
    } else {
      left = refR.right + gap;
      if (left + w > vw - 6) left = refR.left - w - gap; // no room on the right -> flip
    }
    left = Math.max(6, Math.min(left, vw - w - 6));
    const top = Math.max(6, Math.min(tR.top, vh - h - 6));
    win.style.left = left + "px"; win.style.top = top + "px"; win.style.right = "auto";
  }
  function makeGlossDraggable(win, handle) {
    let sx, sy, ox, oy, dragging = false;
    handle.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".gloss-close")) return;
      dragging = true; focusGlossWin(win);
      const r = win.getBoundingClientRect();
      ox = r.left; oy = r.top; sx = e.clientX; sy = e.clientY;
      win.classList.add("dragging");
      try { handle.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });
    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      const nl = Math.max(6, Math.min(ox + (e.clientX - sx), vw - win.offsetWidth - 6));
      const nt = Math.max(6, Math.min(oy + (e.clientY - sy), vh - 38));
      win.style.left = nl + "px"; win.style.top = nt + "px"; win.style.right = "auto";
    });
    const end = (e) => {
      if (!dragging) return;
      dragging = false; win.classList.remove("dragging");
      try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
      persistGlossOpen();   // remember the moved position for reload restore
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }
  function openGlossWin(key, triggerEl, pos) {
    if (!glossGlobalsWired) {
      glossGlobalsWired = true;
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && glossWins.length) removeGlossWin(glossWins[glossWins.length - 1], true);
      });
      window.addEventListener("resize", () => { if (!isMobileGloss()) glossWins.forEach(clampGlossWin); });
    }
    const mobile = isMobileGloss();
    const existing = glossWins.find((w) => w.dataset.k === key);
    if (existing) { if (!mobile) { focusGlossWin(existing); flashGloss(existing); } return; }

    if (mobile) closeAllGloss();
    else while (glossWins.length >= 4) { glossWins.shift().remove(); }

    const win = document.createElement("div");
    win.className = "gloss-win" + (mobile ? " gloss-sheet" : "");
    win.dataset.k = key;
    win.innerHTML =
      '<div class="gloss-bar">' +
        '<span class="gloss-title"></span>' +
        (isAdmin() ? '<button class="gloss-edit" type="button" aria-label="Edit this term" title="Edit this term"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>' : "") +
        '<button class="gloss-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>' +
      '</div>' +
      '<div class="gloss-body"><span class="gloss-dates"></span><p class="gloss-desc"></p></div>';
    win.querySelector(".gloss-title").textContent = glossTitle(key);
    const dEl = win.querySelector(".gloss-dates");
    const dates = glossDates(key);
    if (dates) dEl.textContent = dates; else dEl.remove();
    let descText = glossText(key);
    if (dates) descText = stripDupDates(descText, dates); // drop a parenthetical date identical to the label
    renderGlossDesc(win.querySelector(".gloss-desc"), key, descText);   // render its HTML + auto-link other terms
    document.body.appendChild(win);
    setupTooltips(win.querySelector(".gloss-body")); // wire nested glossary terms

    if (!mobile) {
      if (pos && isFinite(pos.left) && isFinite(pos.top)) { win.style.left = pos.left + "px"; win.style.top = pos.top + "px"; win.style.right = "auto"; clampGlossWin(win); }
      else positionGlossBeside(win, triggerEl);
      focusGlossWin(win);
      makeGlossDraggable(win, win.querySelector(".gloss-bar"));
      win.addEventListener("pointerdown", () => focusGlossWin(win));
    }
    win.querySelector(".gloss-close").addEventListener("click", () => removeGlossWin(win, true));
    { const eb = win.querySelector(".gloss-edit"); if (eb) eb.addEventListener("click", () => { removeGlossWin(win, true); route("admin", { gloss: key }); }); }   // admin: jump to this term's editor
    if (ttsEnabled()) {
      // whole-window text: the title, its dates line, then the full description
      const glossParts = () => {
        const desc = win.querySelector(".gloss-desc");
        const dates = glossDates(key);
        return [{ text: glossTitle(key) + ". " + (dates ? dates + ". " : "") + (desc ? (desc.textContent || "").replace(/\s+/g, " ").trim() : "") }];
      };
      const bar = win.querySelector(".gloss-bar");
      const pb = document.createElement("button");
      pb.className = "tts-play gloss-play"; pb.type = "button";
      pb.setAttribute("aria-label", "Read this entry aloud"); pb.setAttribute("title", "Read aloud");
      pb.innerHTML = TTS_PLAY_SVG;
      bar.insertBefore(pb, bar.querySelector(".gloss-edit") || bar.querySelector(".gloss-close"));
      pb.addEventListener("click", (e) => { e.stopPropagation(); ttsPlayClick(glossParts(), pb); });
      // opening a gloss link interrupts the current read: half a second of silence, then the popup is read instead
      if (ttsActive()) ttsSay(glossParts(), 500);
    }
    glossWins.push(win);
    persistGlossOpen();
    requestAnimationFrame(() => win.classList.add("show"));
  }

  function setupTooltips(root) {
    root.querySelectorAll(".ttip").forEach((el) => {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openGlossWin(el.dataset.k, el); });
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGlossWin(el.dataset.k, el); } });
    });
  }
  function initialOf(name) {
    return (name || "S").trim().charAt(0).toUpperCase() || "S";
  }

  /* ---------- SRS (simplified SM-2) ---------- */
  function cardState(id) {
    return S.cards[id] || null;
  }
  function isSeen(id) {
    return !!S.cards[id];
  }
  function isSuspended(id) {
    return !!(S.suspended && S.suspended[id]);
  }
  function isDueNow(id) {
    const c = S.cards[id];
    return c && (c.status === "review" || c.status === "learning") && c.due <= now();
  }
  // preview next intervals (in days) for a grade, given current card
  function preview(id) {
    const c = S.cards[id];
    if (!c) return { again: 1 / 144, hard: 1 / 144, good: 1 / 144, easy: 4 }; // new: Good is a same-day learning step (grade() re-shows it), Easy graduates
    if (c.status === "learning") return { again: 1 / 144, hard: 1 / 144, good: 1, easy: 3 };   // learning: Good now graduates to 1 day
    const ease = c.ease;
    return {
      again: 1 / 144,
      hard: Math.max(1, c.interval * 1.2),
      good: Math.max(1, c.interval * ease),
      easy: Math.max(1, c.interval * ease * 1.35),
    };
  }
  // apply a grade; returns {requeue: bool} for in-session relearning
  function grade(id, g) {
    const fresh = !S.cards[id];
    let c =
      S.cards[id] ||
      { reps: 0, lapses: 0, ease: 2.5, interval: 0, due: now(), status: "new", last: 0 };

    if (c.status === "new" || c.status === "learning") {
      if (g === "again") {
        c.status = "learning";
        c.interval = 1 / 144;
        c.due = now() + 60 * 1000;
      } else if (g === "hard") {
        c.status = "learning";
        c.interval = 1 / 144;
        c.due = now() + 6 * 60 * 1000;
      } else if (g === "good") {
        if (c.status === "new") {
          // Anki-style learning step: a new card graded Good re-appears the same session/day (its due is within the
          // ~11-min requeue window below) before graduating on the next Good — instead of jumping straight to tomorrow.
          c.status = "learning";
          c.interval = 1 / 144;
          c.due = now() + 10 * 60 * 1000;
        } else {
          // a learning card completing its step graduates to review (due tomorrow)
          c.status = "review";
          c.interval = 1;
          c.reps += 1;
          c.due = now() + DAY;
        }
      } else {
        c.status = "review";
        c.interval = 4;
        c.reps += 1;
        c.due = now() + 4 * DAY;
      }
    } else {
      // review card
      if (g === "again") {
        c.lapses += 1;
        c.ease = Math.max(1.3, c.ease - 0.2);
        c.status = "learning";
        c.interval = 1 / 144;
        c.due = now() + 10 * 60 * 1000;
      } else if (g === "hard") {
        c.ease = Math.max(1.3, c.ease - 0.15);
        c.interval = Math.max(1, c.interval * 1.2);
        c.due = now() + c.interval * DAY;
        c.reps += 1;
      } else if (g === "good") {
        c.interval = Math.max(1, c.interval * c.ease);
        c.due = now() + c.interval * DAY;
        c.reps += 1;
      } else {
        c.ease = c.ease + 0.15;
        c.interval = Math.max(1, c.interval * c.ease * 1.35);
        c.due = now() + c.interval * DAY;
        c.reps += 1;
      }
    }
    c.last = now();
    S.cards[id] = c;

    // count new-card introductions per day
    if (fresh) {
      if (S.intro.date !== todayStr()) S.intro = { date: todayStr(), count: 0 };
      S.intro.count += 1;
      announceLevelUps(id);   // a newly-studied card may complete an XP bar → level up (Folio + its collection)
    }
    bumpStreak();
    save();
    checkAchievements();   // unlock study / streak / deck milestones (toasts any new badge)
    // requeue within session if it will be due again very soon (learning step)
    return { requeue: c.due - now() < 11 * 60 * 1000 };
  }
  function bumpStreak() {
    const t = todayStr();
    if (S.streak.last === t) return;
    const yest = new Date(Date.now() - DAY).toISOString().slice(0, 10);
    S.streak.count = S.streak.last === yest ? S.streak.count + 1 : 1;
    S.streak.last = t;
  }

  /* ---------- progress accounting ---------- */
  function studiedInNode(n) {
    return subtreeCardIds(n).filter((id) => isSeen(id)).length;
  }
  function activeEntryIds() {
    return (Array.isArray(S.active) ? S.active : []).filter((id) => NODE_BY_ID[id]);
  }
  function isActive(id) {
    return activeEntryIds().indexOf(id) !== -1;
  }
  function entryCardIds(id) {
    return subtreeCardIds(NODE_BY_ID[id]);
  }
  function activeCardIds() {
    const set = new Set();
    activeEntryIds().forEach((id) => entryCardIds(id).forEach((c) => set.add(c)));
    return [...set];
  }
  function addActive(id) {
    const a = activeEntryIds();
    if (a.indexOf(id) === -1) {
      a.push(id);
      S.active = a;
      save();
    }
  }
  function removeActive(id) {
    S.active = activeEntryIds().filter((x) => x !== id);
    save();
  }
  // label + card count for an active entry (deck or subdeck)
  function entryInfo(id) {
    const n = NODE_BY_ID[id];
    if (!n) return { title: id, parent: "", count: 0 };
    return { title: n.title, parent: nodeParentPath(n), count: subtreeCardIds(n).length };
  }
  function newRemainingToday() {
    const count = S.intro.date === todayStr() ? S.intro.count : 0;
    return Math.max(0, S.settings.newPerDay - count);
  }
  function reviewQueue() {
    const active = activeCardIds().filter((id) => !isSuspended(id));
    const due = active
      .filter((id) => isDueNow(id))
      .sort((a, b) => S.cards[a].due - S.cards[b].due);
    let pool = active.filter((id) => !isSeen(id));
    // Random mode: DRAW the day's new cards at random from across the selected decks, instead of taking them in the set card order.
    // Seeded by the date so the same new cards surface all day (a plain reshuffle would swap them out on every refresh).
    if (S.settings.reviewRandom) pool = seededShuffle(pool, mulberry32(hashStr("review-" + todayStr())));
    const fresh = pool.slice(0, newRemainingToday());
    return { due, fresh, all: [...due, ...fresh] };
  }
  function dueCountNow() {
    return activeCardIds().filter((id) => isDueNow(id) && !isSuspended(id)).length;
  }

  /* ============================================================
     ROUTER
     ============================================================ */
  const view = document.getElementById("view");
  let current = { name: "home", params: {} };
  const PAGES = {};

  function setActiveTab(name) {
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.route === name);
    });
  }
  function route(name, params) {
    if (name === "admin" && !isAdmin()) name = "home";
    current = { name, params: params || {} };
    location.hash = name === "home" ? "" : name;
    render();
  }
  function render() {
    hideGradeBar();
    hideWBTools();
    hideAdminEditBtn();
    ttsStop();        // navigating away silences any in-progress read-aloud
    closeCtxMenu();   // …and dismisses the selection context menu
    closeAllGloss();
    closeColorMenu();   // the colour menu lives on document.body — make sure it can't outlive its page on hashchange/back nav
    closeGlossPicker();
    closeRtColorMenu();
    closeGlossBubble();
    applyTheme();
    setActiveTab(current.name);
    document.body.classList.toggle("admin-mode", current.name === "admin");
    view.innerHTML = '<div class="page"></div>';
    const root = view.firstElementChild;
    (PAGES[current.name] || PAGES.home)(root, current.params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const THEMES = ["folio", "atlas", "press", "bloom", "tide", "clay", "garden", "synth"];
  function applyTheme() {
    const night = !!S.settings.night;
    document.body.classList.toggle("night", night);
    const theme = THEMES.includes(S.settings.theme) ? S.settings.theme : "folio";
    document.body.dataset.theme = theme;
    document.querySelectorAll("#theme-switch, #sw-night").forEach((el) => {
      el.classList.toggle("on", night);
      el.setAttribute("aria-checked", night ? "true" : "false");
    });
  }
  function setNight(night) {
    S.settings.night = !!night;
    applyTheme();
    save();
  }
  function setTheme(theme) {
    if (!THEMES.includes(theme)) return;
    S.settings.theme = theme;
    applyTheme();
    save();
  }
  // Reflect the current admin / first-time-visitor mode in the top bar and body class.
  function applyMode() {
    const admin = isAdmin();
    document.body.classList.toggle("visitor-mode", !admin);
    const editTab = document.querySelector(".tab-admin");
    if (editTab) editTab.style.display = admin ? "" : "none";   // Edit page is admin-only
    const sw = document.getElementById("mode-switch");
    if (sw) {
      // the legacy "Editor / Visitor" preview toggle only applies before accounts exist; roles govern after
      sw.style.display = noAccounts() ? "" : "none";
      sw.classList.toggle("on", admin);
      sw.setAttribute("aria-checked", admin ? "true" : "false");
      sw.title = admin
        ? "Editor view — click to preview as a first-time visitor"
        : "First-time visitor view — click to return to editing";
      const lbl = document.getElementById("mode-label");
      if (lbl) lbl.textContent = admin ? "Editor" : "Visitor";
    }
  }
  function setMode(admin) {
    S.settings.adminMode = !!admin;
    save();
    applyMode();
    // Leaving the admin page if we just dropped admin rights; otherwise re-render so
    // the library's editing affordances appear/disappear.
    if (!isAdmin() && current.name === "admin") route("home");
    else render();
  }

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }
  // in-page replacement for native prompt()/confirm() — those are silently blocked in sandboxed/embedded contexts
  // (so the New-collection/rename/delete buttons appeared dead). onOk fires only on confirm (value for prompts, true for confirms).
  function inlineModal(message, hasInput, defaultValue, onOk, okLabel) {
    const ex = document.querySelector(".inline-prompt"); if (ex) ex.remove();
    const ov = document.createElement("div"); ov.className = "inline-prompt";
    ov.innerHTML = '<div class="ip-box" role="dialog" aria-modal="true"><div class="ip-msg"></div>' +
      (hasInput ? '<input class="ip-input" type="text" spellcheck="false" />' : "") +
      '<div class="ip-actions"><button type="button" class="ip-cancel">Cancel</button><button type="button" class="ip-ok">' + (okLabel || "OK") + "</button></div></div>";
    ov.querySelector(".ip-msg").textContent = message;
    const input = ov.querySelector(".ip-input"); if (input) input.value = defaultValue == null ? "" : defaultValue;
    document.body.appendChild(ov);
    const close = () => { ov.remove(); document.removeEventListener("keydown", onKey, true); };
    const ok = () => { const v = input ? input.value : true; close(); onOk(v); };
    function onKey(e) { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); } else if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); ok(); } }
    ov.querySelector(".ip-ok").addEventListener("click", ok);
    ov.querySelector(".ip-cancel").addEventListener("click", close);
    ov.addEventListener("mousedown", (e) => { if (e.target === ov) close(); });
    document.addEventListener("keydown", onKey, true);
    setTimeout(() => { if (input) { input.focus(); input.select(); } else { const b = ov.querySelector(".ip-ok"); if (b) b.focus(); } }, 0);
  }
  function inlinePrompt(message, defaultValue, onOk) { inlineModal(message, true, defaultValue, onOk); }
  function inlineConfirm(message, onOk, okLabel) { inlineModal(message, false, null, () => onOk(), okLabel || "OK"); }
  // full-screen level-up congratulations; items = [{ title, level, zh }]. Dismissed by clicking ANYWHERE on screen or Escape.
  function congratsPopup(items) {
    if (!items || !items.length) return;
    const ex = document.querySelector(".levelup-pop"); if (ex) ex.remove();
    const ov = document.createElement("div");
    ov.className = "levelup-pop";
    const rows = items.map((it) =>
      '<div class="lu-row"><span class="lu-badge' + (it.zh ? " zh" : "") + '">' + (it.zh ? esc(cnNumeral(it.level)) : it.level) + '</span>' +
      '<span class="lu-text"><b>' + esc(it.title) + '</b> reached <b>Level ' + it.level + '</b></span></div>'
    ).join("");
    ov.innerHTML = '<div class="lu-card" role="dialog" aria-live="polite"><div class="lu-star">⭐</div>' +
      '<div class="lu-title">Level up!</div><div class="lu-rows">' + rows + '</div>' +
      '<div class="lu-hint">Click anywhere to continue</div></div>';
    document.body.appendChild(ov);
    const close = () => { ov.remove(); document.removeEventListener("keydown", onKey, true); };
    function onKey(e) { if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); close(); } }
    // defer wiring a tick so the same click that graded the card (and spawned this) doesn't instantly dismiss it
    setTimeout(() => { ov.addEventListener("click", close); document.addEventListener("keydown", onKey, true); }, 0);
    requestAnimationFrame(() => ov.classList.add("show"));
  }

  /* ---------- fixed grade bar (pinned to the bottom of the viewport, Anki-style) ---------- */
  let gradeBarEl = null;
  function ensureGradeBar() {
    if (!gradeBarEl) {
      gradeBarEl = document.createElement("div");
      gradeBarEl.id = "gradebar";
      gradeBarEl.innerHTML = '<div class="gradebar-inner"></div>';
      document.body.appendChild(gradeBarEl);
    }
    return gradeBarEl;
  }
  function showGradeBar(innerHTML, onGrade) {
    const bar = ensureGradeBar();
    const inner = bar.querySelector(".gradebar-inner");
    inner.innerHTML = innerHTML;
    inner.querySelectorAll(".grade").forEach((b) =>
      b.addEventListener("click", () => onGrade(b.dataset.g))
    );
    document.body.classList.add("grading");
    requestAnimationFrame(() => bar.classList.add("show"));
  }
  function hideGradeBar() {
    document.body.classList.remove("grading");
    if (gradeBarEl) {
      gradeBarEl.classList.remove("show");
      const inner = gradeBarEl.querySelector(".gradebar-inner");
      if (inner) inner.innerHTML = "";
    }
  }

  /* ---------- whiteboard: draw on the card (Anki-style) ---------- */
  const WB_COLORS = ["#D9544C", "#4F74C2", "#1B1A17", "#4F9D67", "#DB8B3A"];
  const WB_HL_COLORS = ["#FFE92E", "#8DFF4D", "#FF6FE0", "#FFB13D", "#4FE3FF"]; // bright highlighter: yellow, green, pink, orange, cyan
  const WB_SIZES = [2, 4, 8];
  const WB = { enabled: false, mode: "pen", penColor: WB_COLORS[0], hlColor: WB_HL_COLORS[0], color: WB_COLORS[0], size: WB_SIZES[1], canvas: null, ctx: null, drawing: false, last: null, ro: null, backup: null, hlPts: null, dirtied: false, undoStack: [], redoStack: [] };
  const WB_HIST_MAX = 20;   // cap on undo history (raster card snapshots are full-canvas bitmaps)
  let wbToolsRef = null;

  function ensureWBTools() {
    if (wbToolsRef) return wbToolsRef;
    const el = document.createElement("div");
    el.id = "wb-tools";
    el.className = "wb-tools";
    const sizeBtns = WB_SIZES.map((s, i) => {
      const d = 4 + i * 4;
      return `<button class="wb-size${i === 1 ? " sel" : ""}" data-s="${s}" aria-label="Brush size ${i + 1}"><span class="dot" style="width:${d}px;height:${d}px"></span></button>`;
    }).join("");
    el.innerHTML = `
      <div class="wb-panel">
        <div class="wb-row wb-colors-row"></div>
        <div class="wb-row">${sizeBtns}</div>
        <div class="wb-row">
          <button class="wb-btn wb-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>Mark</button>
          <button class="wb-btn wb-eraser"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H8.5L3.5 15a1.8 1.8 0 0 1 0-2.5l8-8a1.8 1.8 0 0 1 2.5 0l5 5a1.8 1.8 0 0 1 0 2.5L13 19"/></svg>Erase</button>
        </div>
        <div class="wb-row">
          <button class="wb-btn wb-undo" aria-label="Undo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>Undo</button>
          <button class="wb-btn wb-redo" aria-label="Redo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>Redo</button>
        </div>
        <div class="wb-row">
          <button class="wb-btn wb-clear"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>Clear</button>
        </div>
      </div>
      <button class="wb-toggle" aria-label="Toggle drawing on the card" title="Draw on the card"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>`;
    document.body.appendChild(el);
    const refreshModes = () => {
      el.querySelector(".wb-hl").classList.toggle("sel", WB.mode === "hl");
      el.querySelector(".wb-eraser").classList.toggle("sel", WB.mode === "erase");
    };
    // the colour swatches swap to bright highlighter colours when Mark is active
    const renderColors = () => {
      const row = el.querySelector(".wb-colors-row");
      const palette = WB.mode === "hl" ? WB_HL_COLORS : WB_COLORS;
      const current = WB.mode === "hl" ? WB.hlColor : WB.penColor;
      row.classList.toggle("hl", WB.mode === "hl");
      row.innerHTML = palette.map((c, i) =>
        `<button class="wb-color${c === current ? " sel" : ""}" data-c="${c}" style="--wc:${c}" aria-label="Colour ${i + 1}"></button>`
      ).join("");
      row.querySelectorAll(".wb-color").forEach((b) =>
        b.addEventListener("click", () => {
          if (WB.mode === "erase") WB.mode = "pen";
          if (WB.mode === "hl") WB.hlColor = b.dataset.c; else WB.penColor = b.dataset.c;
          WB.color = b.dataset.c;
          renderColors();
          refreshModes();
        })
      );
    };
    renderColors();
    el.querySelectorAll(".wb-size").forEach((b) =>
      b.addEventListener("click", () => {
        WB.size = +b.dataset.s;
        el.querySelectorAll(".wb-size").forEach((x) => x.classList.toggle("sel", x === b));
      })
    );
    el.querySelector(".wb-hl").addEventListener("click", () => {
      WB.mode = WB.mode === "hl" ? "pen" : "hl";
      WB.color = WB.mode === "hl" ? WB.hlColor : WB.penColor;
      renderColors(); refreshModes();
    });
    el.querySelector(".wb-eraser").addEventListener("click", () => {
      WB.mode = WB.mode === "erase" ? "pen" : "erase";
      if (WB.mode === "pen") WB.color = WB.penColor;
      renderColors(); refreshModes();
    });
    el.querySelector(".wb-undo").addEventListener("click", wbUndo);
    el.querySelector(".wb-redo").addEventListener("click", wbRedo);
    el.querySelector(".wb-clear").addEventListener("click", wbClear);
    el.querySelector(".wb-toggle").addEventListener("click", () => { WB.enabled = !WB.enabled; applyWBState(); if (WB.onToggle) WB.onToggle(); });
    wbToolsRef = el;
    return el;
  }
  function applyWBState() {
    if (!wbToolsRef) return;
    wbToolsRef.classList.toggle("active", WB.enabled);
    wbToolsRef.querySelector(".wb-toggle").classList.toggle("on", WB.enabled);
    if (WB.canvas) WB.canvas.classList.toggle("on", WB.enabled);
  }
  function showWBTools() { ensureWBTools().classList.add("show"); applyWBState(); wbUpdateHistBtns(); }
  function hideWBTools() {
    if (wbToolsRef) { wbToolsRef.classList.remove("show"); wbToolsRef.classList.remove("on-atlas"); }
    if (WB._onResize) { window.removeEventListener("resize", WB._onResize); WB._onResize = null; }
    if (WB.ro) { WB.ro.disconnect(); WB.ro = null; }
    if (WB.canvas && WB.canvas.parentNode) WB.canvas.parentNode.removeChild(WB.canvas);
    WB.canvas = null; WB.ctx = null; WB.drawing = false; WB.backup = null; WB.hlPts = null;
    WB.onToggle = null; WB.onClear = null; WB.onUndo = null; WB.onRedo = null; WB.onCanUndo = null; WB.onCanRedo = null; // globe (atlas) draw-mode hooks, set up per visit
    WB.undoStack.length = 0; WB.redoStack.length = 0; WB.dirtied = false;   // don't leak draw-history across pages
    WB.enabled = false; // every page entry starts with draw-mode off (don't leak across pages)
  }
  function wbClear() {
    if (WB.onClear) { WB.onClear(); wbUpdateHistBtns(); return; }  // atlas globe owns a geo-anchored stroke list
    const c = WB.canvas, ctx = WB.ctx;
    if (!c || !ctx) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); ctx.restore();
    wbSnapCard();   // clearing is an undoable step
  }
  // ---- undo / redo (shared button, two backends) ----
  // Card whiteboard is a RASTER canvas → history is a stack of full-canvas bitmap snapshots. The Atlas globe owns a VECTOR stroke
  // list and supplies its own onUndo/onRedo/onCanUndo/onCanRedo hooks (a stack of stroke-array snapshots), so undo there is geo-exact.
  function wbUpdateHistBtns() {
    if (!wbToolsRef) return;
    const u = wbToolsRef.querySelector(".wb-undo"), r = wbToolsRef.querySelector(".wb-redo");
    const canU = WB.onCanUndo ? WB.onCanUndo() : WB.undoStack.length > 1;
    const canR = WB.onCanRedo ? WB.onCanRedo() : WB.redoStack.length > 0;
    if (u) u.disabled = !canU;
    if (r) r.disabled = !canR;
  }
  function wbSnapCard() {   // push a bitmap snapshot of the card canvas onto the undo stack (invalidates redo)
    const c = WB.canvas; if (!c) return;
    const s = document.createElement("canvas"); s.width = c.width; s.height = c.height;
    if (c.width && c.height) s.getContext("2d").drawImage(c, 0, 0);
    WB.undoStack.push(s);
    while (WB.undoStack.length > WB_HIST_MAX + 1) WB.undoStack.shift();   // +1 keeps the empty base state at the bottom
    WB.redoStack.length = 0;
    wbUpdateHistBtns();
  }
  function wbRestoreCard(snap) {
    const c = WB.canvas, ctx = WB.ctx; if (!c || !ctx) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height);
    if (snap && snap.width && snap.height) ctx.drawImage(snap, 0, 0);
    ctx.restore();
  }
  function wbResetHist() { WB.undoStack.length = 0; WB.redoStack.length = 0; wbUpdateHistBtns(); }
  function wbUndo() {
    if (WB.onUndo) { WB.onUndo(); wbUpdateHistBtns(); return; }   // globe: geo-anchored strokes
    if (WB.undoStack.length <= 1) return;                         // keep the empty base state
    WB.redoStack.push(WB.undoStack.pop());
    wbRestoreCard(WB.undoStack[WB.undoStack.length - 1]);
    wbUpdateHistBtns();
  }
  function wbRedo() {
    if (WB.onRedo) { WB.onRedo(); wbUpdateHistBtns(); return; }   // globe
    if (!WB.redoStack.length) return;
    const s = WB.redoStack.pop(); WB.undoStack.push(s);
    wbRestoreCard(s);
    wbUpdateHistBtns();
  }
  function wbResize(preserve) {
    const c = WB.canvas; if (!c) return;
    const stage = c.parentElement; if (!stage) return;
    const dpr = window.devicePixelRatio || 1;
    // Read the STAGE's size (independent of the canvas) — canvas is a replaced element, so
    // we must set its display size explicitly rather than rely on inset:0 (which would make
    // its size track its own backing store and grow unboundedly).
    // Width spans the WHOLE screen: use the full viewport width and shift the canvas left so
    // it starts at the viewport's left edge (the stage itself is a centered, narrower column).
    const sr = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(document.documentElement.clientWidth));
    // cover the WHOLE visible page, not just the card content: at least the viewport height below the stage top, so you can draw on
    // the empty space below a short (question-only) card too. For long/scrolling content the taller content height wins, so strokes
    // still scroll with the card. (Canvas bottom lands at the viewport bottom → no extra scrollbar.)
    const vpH = document.documentElement.clientHeight || window.innerHeight || 0;   // viewport height (same source as the width above)
    const h = Math.max(1, Math.round(stage.clientHeight), Math.round(vpH - Math.max(0, sr.top)));
    c.style.left = Math.round(-sr.left) + "px";
    c.style.width = w + "px"; c.style.height = h + "px";
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    if (c.width === W && c.height === H) return;
    let prev = null;
    if (preserve && c.width && c.height) {
      prev = document.createElement("canvas"); prev.width = c.width; prev.height = c.height;
      prev.getContext("2d").drawImage(c, 0, 0);
    }
    c.width = W; c.height = H;
    const ctx = c.getContext("2d"); WB.ctx = ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (prev) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(prev, 0, 0); ctx.restore(); }
    if (preserve) { WB.undoStack.length = 0; WB.redoStack.length = 0; wbSnapCard(); }   // bitmap snapshots are dim-specific → on a real resize, reset history to the (preserved) current frame
  }
  function setupWhiteboard() {
    // remove any prior overlay (e.g. from the previous card) and start fresh
    if (WB.canvas && WB.canvas.parentNode) WB.canvas.parentNode.removeChild(WB.canvas);
    if (WB._onResize) { window.removeEventListener("resize", WB._onResize); WB._onResize = null; }
    if (WB.ro) { WB.ro.disconnect(); WB.ro = null; }
    const canvas = document.createElement("canvas");
    canvas.className = "draw-canvas";
    // mount inside the scrolling content container so strokes scroll & recenter with the card
    const stage = document.querySelector(".stage") || document.body;
    stage.appendChild(canvas);
    WB.canvas = canvas; WB.ctx = canvas.getContext("2d");
    WB.drawing = false; WB.backup = null; WB.hlPts = null;
    wbResize(false);
    WB.undoStack.length = 0; WB.redoStack.length = 0; WB.dirtied = false; wbSnapCard();   // base (empty) snapshot so undo can return to a blank card
    const posOf = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    canvas.addEventListener("pointerdown", (e) => {
      if (!WB.enabled) return;
      WB.drawing = true; WB.last = posOf(e);
      if (WB.mode === "hl") {
        WB.hlPts = [WB.last];
        WB.backup = document.createElement("canvas");
        WB.backup.width = canvas.width; WB.backup.height = canvas.height;
        if (canvas.width && canvas.height) WB.backup.getContext("2d").drawImage(canvas, 0, 0);
      }
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      e.preventDefault();
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!WB.enabled || !WB.drawing) return;
      WB.dirtied = true;   // an actual stroke happened → snapshot it on pointerup (for undo)
      const p = posOf(e), ctx = WB.ctx, dpr = window.devicePixelRatio || 1;
      if (WB.mode === "hl") {
        // redraw the whole stroke fresh over the pre-stroke snapshot -> even translucency, no overlap buildup
        WB.hlPts.push(p);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (WB.backup) ctx.drawImage(WB.backup, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.34;
        ctx.strokeStyle = WB.color;
        ctx.lineWidth = Math.max(13, WB.size * 5);
        const pts = WB.hlPts;
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = WB.mode === "erase" ? "destination-out" : "source-over";
        ctx.strokeStyle = WB.color;
        ctx.lineWidth = WB.mode === "erase" ? Math.max(16, WB.size * 6) : WB.size;
        ctx.beginPath(); ctx.moveTo(WB.last.x, WB.last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        WB.last = p;
      }
    });
    const end = () => { const drew = WB.drawing && WB.dirtied; WB.drawing = false; WB.backup = null; WB.hlPts = null; if (drew) { WB.dirtied = false; wbSnapCard(); } };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    if (WB._onResize) window.removeEventListener("resize", WB._onResize);
    WB._onResize = () => wbResize(true);
    window.addEventListener("resize", WB._onResize);
    // track content growth (answer reveal, expanding sections) and width changes
    if (window.ResizeObserver) {
      WB.ro = new ResizeObserver(() => wbResize(true));
      WB.ro.observe(stage);
    }
    applyWBState();
  }

  /* ---------- small icon helper for add (+) buttons ---------- */
  function addIcon(added) {
    return added
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  }
  function wireAddButton(btn, id) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const nowActive = !isActive(id);
      if (nowActive) addActive(id); else removeActive(id);
      btn.classList.toggle("added", nowActive);
      btn.innerHTML = addIcon(nowActive);
      btn.setAttribute("aria-label", nowActive ? "Remove from review" : "Add to review");
      toast(nowActive ? "Added to daily review" : "Removed from review");
    });
  }

  /* ---------- text-to-speech (Web Speech API — zero-dependency) ----------
     A slow MALE English voice reads questions / answers / backgrounds / gloss popups; a slow FEMALE Chinese
     voice reads the hanzi (the pinyin line's pronunciation). Two switches gate everything: the Settings page
     "Text-to-speech" toggle (S.settings.tts — off hides every TTS control) and the per-card mute (S.settings.ttsMuted,
     persisted so leaving a card muted keeps every future card muted until the user unmutes). */
  const TTS_RATE_EN = 0.85, TTS_RATE_ZH = 0.7;   // "slow" voices
  function ttsSupported() { return !!(window.speechSynthesis && typeof SpeechSynthesisUtterance !== "undefined"); }
  function ttsEnabled() { return ttsSupported() && S.settings.tts !== false; }
  function ttsActive() { return ttsEnabled() && !S.settings.ttsMuted; }
  let _ttsSeq = 0;   // generation counter — bumped by ttsStop() so a pending delayed read (e.g. the gloss 0.5s pause) dies
  let _ttsVoicesHook = null;   // the Settings page hangs its voice-list refresher here (mobile delivers getVoices() async)
  function ttsAllVoices() { try { return (window.speechSynthesis && speechSynthesis.getVoices()) || []; } catch (e) { return []; } }
  if (ttsSupported()) {
    ttsAllVoices();   // nudge Chrome to start loading the voice list (it arrives async)
    try { speechSynthesis.addEventListener("voiceschanged", () => { if (_ttsVoicesHook) _ttsVoicesHook(); }); } catch (e) {}
  }
  function ttsEnVoices() { return ttsAllVoices().filter((v) => /^en/i.test(v.lang)); }
  function ttsZhVoices() { return ttsAllVoices().filter((v) => /^(zh|cmn)/i.test(v.lang) || /chinese|mandarin|普通话|中文/i.test(v.name)); }
  function ttsFindVoice(setting, vs) { return setting ? (vs.find((v) => v.voiceURI === setting) || vs.find((v) => v.name === setting) || null) : null; }
  // quality-first auto-pick: neural/natural/enhanced/premium voices sound human — strongly prefer them, then the wanted
  // gender, then network ("online") voices, which beat the compact local robots. A voice chosen in Settings always wins.
  const TTS_HQ = /(natural|neural|premium|enhanced|\bhd\b|wavenet|journey|studio)/i;
  function ttsPickVoice(vs, wantRe, avoidRe, langRe) {
    let best = null, bestScore = -Infinity;
    vs.forEach((v) => {
      const id = (v.name || "") + " " + (v.voiceURI || "");
      let s = 0;
      if (TTS_HQ.test(id)) s += 8;
      if (v.localService === false) s += 2;
      if (wantRe.test(id)) s += 4;
      if (avoidRe.test(id)) s -= 3;
      if (langRe && langRe.test(v.lang)) s += 1;
      if (s > bestScore) { bestScore = s; best = v; }
    });
    return best;
  }
  function ttsVoiceEn() {
    const vs = ttsEnVoices();
    const manual = ttsFindVoice(S.settings.ttsVoiceEn, vs);
    if (manual) return manual;
    const male = /(\bmale\b|david|mark|daniel|george|guy|ryan|thomas|arthur|christopher|eric|james|brian|roger|aaron|fred|alex\b|oliver|liam|andrew|steffan|william)/i;
    const female = /(female|zira|susan|hazel|jenny|aria|libby|sonia|michelle|natasha|samantha|karen|catherine|emma|ava|joanna|salli|kimberly|ivy|kendra|moira|tessa|fiona|victoria|serena|allison|clara)/i;
    return ttsPickVoice(vs, male, female, /^en-(US|GB)/i);
  }
  function ttsVoiceZh() {
    const vs = ttsZhVoices();
    const manual = ttsFindVoice(S.settings.ttsVoiceZh, vs);
    if (manual) return manual;
    const female = /(xiaoxiao|xiaoyi|xiaohan|xiaomo|xiaoxuan|xiaorui|huihui|yaoyao|ruoxi|tingting|meijia|female|女)/i;
    const male = /(kangkang|yunyang|yunxi|yunjian|yunye|\bmale\b|男)/i;
    return ttsPickVoice(vs, female, male, /^zh-CN/i);
  }
  function ttsStop() {
    _ttsSeq++;
    if (ttsSupported()) try { speechSynthesis.cancel(); } catch (e) {}
    document.querySelectorAll(".tts-playing").forEach((b) => b.classList.remove("tts-playing"));
  }
  // split long English text into sentence-ish chunks (~220 chars) — Chrome's synthesis cuts out on very long utterances
  function ttsChunks(text) {
    const sents = String(text).split(/(?<=[.!?…])\s+/);
    const out = [];
    let cur = "";
    sents.forEach((s) => {
      if (cur && cur.length + s.length > 220) { out.push(cur); cur = s; }
      else cur = cur ? cur + " " + s : s;
    });
    if (cur) out.push(cur);
    return out;
  }
  // speak parts in order: [{ text, zh, btn }] — btn (if given) gets .tts-playing while its part reads.
  // Replaces whatever is currently reading. delayMs = silence before the first word (the gloss popup's half-second pause).
  function ttsSay(parts, delayMs) {
    if (!ttsSupported()) return;
    ttsStop();
    const gen = _ttsSeq;
    const go = () => {
      if (gen !== _ttsSeq) return;   // superseded while waiting
      (Array.isArray(parts) ? parts : [parts]).forEach((p) => {
        const text = ((p && p.text) || "").trim();
        if (!text) return;
        const chunks = p.zh ? [text] : ttsChunks(text);
        chunks.forEach((chunk, i) => {
          const u = new SpeechSynthesisUtterance(chunk);
          if (p.zh) { u.lang = "zh-CN"; u.rate = TTS_RATE_ZH; const v = ttsVoiceZh(); if (v) u.voice = v; }
          else { u.lang = "en-US"; u.rate = TTS_RATE_EN; u.pitch = 0.9; const v = ttsVoiceEn(); if (v) u.voice = v; }
          if (p.btn) {
            if (i === 0) u.onstart = () => p.btn.classList.add("tts-playing");
            if (i === chunks.length - 1) { const done = () => p.btn.classList.remove("tts-playing"); u.onend = done; u.onerror = done; }
          }
          try { speechSynthesis.speak(u); } catch (e) {}
        });
      });
    };
    setTimeout(go, Math.max(60, delayMs || 0));   // ≥60ms: Chrome can swallow a speak() issued synchronously after cancel()
  }
  // an explicit play-button press: respects the master toggle + mute (with a hint instead of silence)
  function ttsPlayClick(parts, btn) {
    if (!ttsSupported()) { toast("Speech isn't available on this device"); return; }
    if (!ttsEnabled()) { toast("Text-to-speech is turned off in Settings"); return; }
    if (S.settings.ttsMuted) { toast("Audio is muted — tap the speaker icon on the card to unmute"); return; }
    if (btn) (Array.isArray(parts) ? parts : [parts]).forEach((p) => { if (p && !p.btn) p.btn = btn; });   // keep the pressed control lit through the whole read
    ttsSay(parts, 0);
  }
  function ttsStrip(html) { const d = document.createElement("div"); d.innerHTML = html || ""; return (d.textContent || "").replace(/\s+/g, " ").trim(); }
  function ttsQuestionText(c) { return ttsStrip(String((c && c.question) || "").replace(/<span class="blank"[^>]*>[\s\S]*?<\/span>/g, " blank ")); }   // the cloze ____ is read as "blank"
  // the parts a section play-button reads (container = where the rendered .abstract lives, for the background)
  function ttsPartsFor(kind, c, container) {
    if (kind === "question") return [{ text: ttsQuestionText(c) }];
    if (kind === "answer") {
      const parts = [{ text: ttsStrip((c && (c.answerText || c.answer)) || "") }];
      if (c && c.hanzi) parts.push({ text: c.hanzi, zh: true });
      return parts;
    }
    const abs = container && container.querySelector(".abstract");
    return [{ text: abs ? (abs.textContent || "").replace(/\s+/g, " ").trim() : ttsStrip(c && c.abstract) }];
  }
  const TTS_PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="7 4 19 12 7 20"/></svg>';
  // tiny play control behind a section title; span=true renders a role=button span (for inside the .bg-head <button>)
  function ttsPlayHTML(kind, span) {
    if (!ttsEnabled()) return "";
    const aria = 'aria-label="Read this section aloud" title="Read aloud"';
    return span
      ? '<span class="tts-play" role="button" tabindex="0" data-tts="' + kind + '" ' + aria + ">" + TTS_PLAY_SVG + "</span>"
      : '<button class="tts-play" type="button" data-tts="' + kind + '" ' + aria + ">" + TTS_PLAY_SVG + "</button>";
  }
  // wire every [data-tts] play control inside container to read its section of card c
  function wireTTS(container, c) {
    if (!container) return;
    container.querySelectorAll("[data-tts]").forEach((b) => {
      if (b._ttsWired) return;
      b._ttsWired = true;
      const act = (e) => { e.stopPropagation(); ttsPlayClick(ttsPartsFor(b.dataset.tts, c, container), b); };
      b.addEventListener("click", act);
      if (b.tagName !== "BUTTON") b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(e); } });
    });
  }
  function ttsMuteIconSVG() {
    return S.settings.ttsMuted
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/><line x1="16" y1="9" x2="22" y2="15"/><line x1="22" y1="9" x2="16" y2="15"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  }
  // right-click on a selection inside the background paragraph -> Copy / Read aloud
  let ctxMenuEl = null;
  function closeCtxMenu() { if (ctxMenuEl) { ctxMenuEl.remove(); ctxMenuEl = null; } }
  function showCtxMenu(x, y, items) {
    closeCtxMenu();
    const m = document.createElement("div");
    m.className = "ctx-menu";
    items.forEach((it) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = it.label;
      b.addEventListener("click", () => { closeCtxMenu(); it.act(); });
      m.appendChild(b);
    });
    document.body.appendChild(m);
    const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    m.style.left = Math.max(4, Math.min(x, vw - m.offsetWidth - 8)) + "px";
    m.style.top = Math.max(4, Math.min(y, vh - m.offsetHeight - 8)) + "px";
    ctxMenuEl = m;
    setTimeout(() => {
      const off = (ev) => { if (ctxMenuEl && !ctxMenuEl.contains(ev.target)) closeCtxMenu(); };
      document.addEventListener("pointerdown", off, { capture: true, once: true });
      document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") closeCtxMenu(); }, { once: true });
      window.addEventListener("scroll", closeCtxMenu, { capture: true, once: true });
    }, 0);
  }
  function copySelText(t) {
    const done = () => toast("Copied");
    const legacy = () => { const ta = document.createElement("textarea"); ta.value = t; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); done(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, legacy);
    else legacy();
  }
  function wireReadAloudMenu(absEl) {
    if (!absEl || absEl._ctxWired) return;
    absEl._ctxWired = true;
    absEl.addEventListener("contextmenu", (e) => {
      if (!ttsEnabled()) return;   // TTS off -> leave the native menu alone
      const sel = window.getSelection();
      const text = sel ? String(sel).trim() : "";
      if (!text || !sel.rangeCount || !absEl.contains(sel.getRangeAt(0).commonAncestorContainer)) return;   // no in-paragraph selection -> native menu
      e.preventDefault();
      showCtxMenu(e.clientX, e.clientY, [
        { label: "Copy", act: () => copySelText(text) },
        { label: "Read aloud", act: () => ttsPlayClick([{ text }]) },
      ]);
    });
  }
  // Chinese pronunciation buttons (.tr-play) — the shared slow female Chinese voice
  function speak(text, btn) {
    if (!text) return;
    ttsPlayClick([{ text, zh: true, btn }], btn);
  }

  /* ---------- progress bar element ---------- */
  function progressBar(studied, total, zh) {
    const pct = total > 0 ? Math.min(100, (studied / total) * 100) : 0;
    const wrap = document.createElement("div");
    wrap.className = "prog" + (zh ? " zh" : "");
    wrap.innerHTML =
      '<div class="track"><div class="fill"></div></div>' +
      '<div class="count">' + studied + " / " + total + "</div>";
    requestAnimationFrame(() => {
      wrap.querySelector(".fill").style.width = pct + "%";
    });
    return wrap;
  }
  function animateProgs(root) {
    root.querySelectorAll(".prog[data-pct]").forEach((p) => {
      const f = p.querySelector(".fill");
      requestAnimationFrame(() => { f.style.width = p.dataset.pct + "%"; });
    });
    root.querySelectorAll(".xp[data-pct]").forEach((p) => {
      const f = p.querySelector(".xp-fill");
      if (f) requestAnimationFrame(() => { f.style.width = p.dataset.pct + "%"; });
    });
  }

  /* ---------- levels / XP ----------
     XP = the number of distinct cards a user has studied. Each level costs `3 × level` more cards (3, 6, 9, …),
     so the bar starts at 0/3 and the requirement grows every level. Collections have their own level (distinct
     cards studied within that collection); the whole of Folio has a general level (all distinct cards studied). */
  function levelFromXP(xp) {
    xp = Math.max(0, xp | 0);
    let level = 1, need = 3, into = xp;
    while (into >= need) { into -= need; level++; need = 3 * level; }
    return { level, into, need };   // into/need = progress within the current level toward the next
  }
  function folioXP() { return Object.keys(S.cards).length; }        // all distinct cards studied → general Folio level
  function collectionXP(node) { return studiedInNode(node); }       // distinct cards studied in a collection → its level
  function collectionXPFrom(node, cards) { return subtreeCardIds(node).filter((id) => !!(cards && cards[id])).length; }   // same, for an arbitrary progress map (e.g. a friend's)
  function cardCollections(id) { return TREE.collections.filter((c) => subtreeCardIds(c).indexOf(id) !== -1); }   // top-level collections containing a card
  // a freshly-studied card adds 1 XP globally and to each collection it belongs to — announce any level that ticks over
  // (Folio level and collection levels cross their thresholds independently). One combined toast, since toast() shows one at a time.
  function announceLevelUps(id) {
    const items = [];
    const g = Object.keys(S.cards).length;
    if (levelFromXP(g).level > levelFromXP(g - 1).level) items.push({ title: "Folio", level: levelFromXP(g).level, zh: false });
    cardCollections(id).forEach((c) => {
      const n = studiedInNode(c);
      if (levelFromXP(n).level > levelFromXP(n - 1).level) items.push({ title: c.title, level: levelFromXP(n).level, zh: c.id === "china" });
    });
    if (items.length) congratsPopup(items);   // a click-anywhere-to-dismiss popup naming each collection/Folio that leveled up
  }
  // number → Chinese numeral (一 二 三 … 十 十一 … 二十 …), good for level values
  function cnNumeral(n) {
    n = n | 0;
    const d = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    if (n <= 0) return d[0];
    if (n < 10) return d[n];
    if (n < 20) return "十" + (n % 10 ? d[n % 10] : "");
    if (n < 100) { const t = Math.floor(n / 10), o = n % 10; return d[t] + "十" + (o ? d[o] : ""); }
    return String(n);
  }
  // large level numeral shown at the left of a collection / review banner (zh → render the number as a Chinese numeral)
  function levelBadgeMarkup(xp, zh) {
    const lvl = levelFromXP(xp).level;
    // just the large numeral — the "Level N" text lives in the blue xp-bar head (xpBarMarkup) beside it, so a label here is redundant.
    return '<div class="level-badge' + (zh ? " zh" : "") + '" aria-hidden="true"><span class="lb-num">' + (zh ? cnNumeral(lvl) : lvl) + '</span></div>';
  }
  // XP progress bar toward the next level (replaces the old studied/total progress bar)
  function xpBarMarkup(xp, zh) {
    const info = levelFromXP(xp);
    const pct = info.need > 0 ? Math.min(100, (info.into / info.need) * 100) : 0;
    return '<div class="xp' + (zh ? " zh" : "") + '" data-pct="' + pct.toFixed(2) + '">' +
      '<div class="xp-head"><span class="xp-lvl">Level ' + info.level + '</span><span class="xp-count">' + info.into + ' / ' + info.need + ' cards</span></div>' +
      '<div class="xp-track"><div class="xp-fill"></div></div></div>';
  }

  /* ============================================================
     PAGE: HOME
     ============================================================ */
  // Short, public-domain reflections on learning, history and knowledge from historical thinkers.
  const QUOTES = [
    { t: "Study the past if you would define the future.", a: "Confucius" },
    { t: "Real knowledge is to know the extent of one's ignorance.", a: "Confucius" },
    { t: "By three methods we may learn wisdom: by reflection, which is noblest; by imitation, which is easiest; and by experience, which is the bitterest.", a: "Confucius" },
    { t: "The mind is not a vessel to be filled, but a fire to be kindled.", a: "Plutarch" },
    { t: "The roots of education are bitter, but the fruit is sweet.", a: "Aristotle" },
    { t: "Knowing yourself is the beginning of all wisdom.", a: "Aristotle" },
    { t: "The only true wisdom is in knowing you know nothing.", a: "Socrates" },
    { t: "It is impossible for a man to learn what he thinks he already knows.", a: "Epictetus" },
    { t: "Knowledge which is acquired under compulsion obtains no hold on the mind.", a: "Plato" },
    { t: "As long as you live, keep learning how to live.", a: "Seneca" },
    { t: "While we teach, we learn.", a: "Seneca" },
    { t: "To be ignorant of what occurred before you were born is to remain forever a child.", a: "Cicero" },
    { t: "If you have a garden and a library, you have everything you need.", a: "Cicero" },
    { t: "Look back over the past, with its changing empires that rose and fell, and you can foresee the future too.", a: "Marcus Aurelius" },
    { t: "Knowing others is wisdom; knowing yourself is enlightenment.", a: "Lao Tzu" },
    { t: "The journey of a thousand miles begins with a single step.", a: "Lao Tzu" },
    { t: "Life has a limit, but knowledge has none.", a: "Zhuangzi" },
    { t: "No man ever steps in the same river twice.", a: "Heraclitus" },
    { t: "Histories make men wise.", a: "Francis Bacon" },
    { t: "Knowledge is power.", a: "Francis Bacon" },
    { t: "Learning never exhausts the mind.", a: "Leonardo da Vinci" },
    { t: "There is no royal road to geometry.", a: "Euclid" },
    { t: "I grow old ever learning many things.", a: "Solon" },
    { t: "Teach thy tongue to say 'I do not know,' and thou shalt progress.", a: "Maimonides" },
    { t: "The life of the dead is set in the memory of the living.", a: "Cicero" },
    { t: "Wonder is the beginning of wisdom.", a: "Socrates" },
  ];
  function dailyQuoteHTML() {
    const q = QUOTES[Math.floor(Date.now() / DAY) % QUOTES.length];
    return '<figure class="daily-quote"><blockquote>' + esc(q.t) + '</blockquote><figcaption>— ' + esc(q.a) + '</figcaption></figure>';
  }

  PAGES.home = function (root) {
    const q = reviewQueue();
    const dueN = q.due.length;
    const newN = q.fresh.length;
    const activeIds = activeEntryIds();
    const trashSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    const activeHTML = (function () {
      const activeSet = new Set(activeIds);
      const show = new Set();
      activeIds.forEach((id) => { let n = NODE_BY_ID[id]; while (n) { show.add(n.id); n = n.parentId ? NODE_BY_ID[n.parentId] : null; } });
      const rows = [];
      function walk(node, depth) {
        if (!show.has(node.id)) return;
        rows.push({ node, depth, active: activeSet.has(node.id) });
        nodeChildren(node).forEach((ch) => walk(ch, depth + 1));
      }
      TREE.collections.forEach((d) => walk(d, 0));
      return rows
        .map((r) => {
          const pad = 22 + r.depth * 21;
          if (r.active) {
            const info = entryInfo(r.node.id);
            return `<div class="active-deck" data-review="${esc(r.node.id)}" role="button" tabindex="0" data-depth="${r.depth}" style="padding-left:${pad}px" title="Review just ${esc(r.node.title)}">
              <span class="ad-dot"></span>
              <div class="ad-body">
                <div class="ad-line"><span class="ad-title">${esc(r.node.title)}</span><span class="ad-count">${info.count} card${info.count === 1 ? "" : "s"}</span></div>
              </div>
              <button class="ad-trash" data-id="${esc(r.node.id)}" aria-label="Remove from review">${trashSVG}</button>
            </div>`;
          }
          return `<div class="active-deck context" data-depth="${r.depth}" style="padding-left:${pad}px">
            <span class="ad-branch"></span>
            <div class="ad-body">
              <div class="ad-line"><span class="ad-title">${esc(r.node.title)}</span></div>
            </div>
          </div>`;
        })
        .join("");
    })();
    const greeting = (() => {
      const h = new Date().getHours();
      return h < 5 ? "Late night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    })();

    const playedChallengeToday =
      !!S.daily.lastPlayed && new Date(S.daily.lastPlayed).toISOString().slice(0, 10) === todayStr();
    const playedChronoToday = !!S.chrono && S.chrono.date === todayStr();
    const playedTrueFalseToday = gamePlayedToday("truefalse");
    const playedWhoSaidToday = gamePlayedToday("whosaid");
    // perfect run today → the tile turns shining gold (won implies played: markGamePlayed sets both)
    const wonToday = { challenge: gameWonToday("challenge"), chrono: gameWonToday("chrono"), truefalse: gameWonToday("truefalse"), whosaid: gameWonToday("whosaid") };
    // Decorative background icons for the home game tiles (replace the old Han glyphs).
    // Inline stroke SVGs (viewBox 0 0 24 24) inherit the tile colour via currentColor.
    const ICON = {
      choices:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2"/><line x1="10" y1="6" x2="20" y2="6"/><circle cx="5" cy="12" r="2" fill="currentColor" stroke="none"/><line x1="10" y1="12" x2="20" y2="12"/><circle cx="5" cy="18" r="2"/><line x1="10" y1="18" x2="20" y2="18"/></svg>',
      timeline:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><circle cx="6" cy="12" r="2.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>',
      truefalse:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 13 6 17 11 8"/><line x1="15" y1="9" x2="21" y2="15"/><line x1="21" y1="9" x2="15" y2="15"/></svg>',
      whosaid:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
      review:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      help:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.2 9.3a3 3 0 0 1 5.5 1.6c0 2-3 2.5-3 4.1"/><line x1="12" y1="17.5" x2="12" y2="17.5"/></svg>',
    };
    const tile = (o) =>
      `<button class="game-tile ${o.cls || ""}${o.done ? " done" : ""}${o.won ? " won" : ""}" id="${o.id}" style="--tile:${o.color}">
        ${o.done ? '<span class="gt-done"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' : ""}
        <span class="gt-glyph${/^\s*<svg/.test(o.glyph) ? " gt-glyph-svg" : ""}">${o.glyph}</span>
        <div class="gt-body">
          ${o.eyebrow ? `<span class="gt-eyebrow">${o.eyebrow}</span>` : ""}
          <span class="gt-title">${o.title}</span>
          ${o.sub ? `<span class="gt-sub">${o.sub}</span>` : ""}
        </div>
      </button>`;
    const blankTile = (g, color) =>
      `<div class="game-tile blank" style="--tile:${color}"><span class="gt-glyph${/^\s*<svg/.test(g) ? " gt-glyph-svg" : ""}">${g}</span><div class="gt-body"><span class="gt-eyebrow">Coming soon</span><span class="gt-title">—</span></div></div>`;
    const gameGrid = `<div class="game-grid">
      ${tile({ id: "g-challenge", cls: "g-challenge", color: "#D9544C", glyph: ICON.choices, title: "Multiple Choice", sub: "Pick the answer · 5 rounds", done: playedChallengeToday, won: wonToday.challenge })}
      ${tile({ id: "g-chrono", cls: "g-chrono", color: "#4F74C2", glyph: ICON.timeline, title: "Timeline", sub: "Put the events in order", done: playedChronoToday, won: wonToday.chrono })}
      ${tile({ id: "g-truefalse", cls: "g-truefalse", color: "#4F9D67", glyph: ICON.truefalse, title: "True or False", sub: "Myth or fact? 5 rounds", done: playedTrueFalseToday, won: wonToday.truefalse })}
      ${tile({ id: "g-whosaid", cls: "g-whosaid", color: "#8257C2", glyph: ICON.whosaid, title: "Who said it?", sub: "Guess the speaker · 5 rounds", done: playedWhoSaidToday, won: wonToday.whosaid })}
      ${blankTile(ICON.help, "#DB8B3A")}
      ${blankTile(ICON.help, "#2BA6A0")}
    </div>`;

    root.innerHTML = `
      <div class="page-head">
        <span class="eyebrow">${greeting}, ${esc(S.user.name)}</span>
        <h1>Today</h1>
      </div>
      ${dailyQuoteHTML()}
      <div class="banners">
        ${gameGrid}

        <div class="review-group ${activeIds.length ? "has-active" : ""}">
        <button class="banner" id="b-review">
          ${levelBadgeMarkup(folioXP())}
          <div class="body">
            <h2 class="review-title">Daily review</h2>
            <p class="desc">${
              dueN + newN > 0
                ? "Cards scheduled for today, plus a few new ones from your active decks."
                : "Nothing due right now — start a deck to build your review pile."
            }</p>
            ${xpBarMarkup(folioXP())}
            <div class="meta">
              <div class="stat"><b>${dueN}</b><span>Due</span></div>
              <div class="stat"><b>${newN}</b><span>New</span></div>
              <div class="stat"><b>${Object.keys(S.cards).length}</b><span>Seen total</span></div>
            </div>
          </div>
          <span class="cta"><span class="btn ${dueN + newN ? "" : "ghost"}">${
      dueN + newN ? "Start review" : "Browse collections"
    }</span></span>
          <span class="glyph glyph-svg">${ICON.review}</span>
        </button>
        <button class="review-order" id="reviewOrder" type="button" title="Order your daily review by date, or shuffle it"><span class="${S.settings.reviewRandom ? "" : "on"}">Chrono</span><span class="${S.settings.reviewRandom ? "on" : ""}">Random</span></button>
        <div class="active-decks">${activeHTML}</div>
        </div>
      </div>`;

    root.querySelector("#g-challenge").addEventListener("click", () => route("challenge"));
    root.querySelector("#g-chrono").addEventListener("click", () => route("chrono"));
    root.querySelector("#g-truefalse").addEventListener("click", () => route("truefalse"));
    root.querySelector("#g-whosaid").addEventListener("click", () => route("whosaid"));
    root.querySelectorAll(".ad-trash").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeActive(btn.dataset.id);
        render();
      })
    );
    root.querySelector("#b-review").addEventListener("click", () => {
      if (dueN + newN > 0) route("study", { scope: { type: "review" } });
      else route("decks");
    });
    const reviewOrderBtn = root.querySelector("#reviewOrder");
    if (reviewOrderBtn) reviewOrderBtn.addEventListener("click", (e) => { e.stopPropagation(); S.settings.reviewRandom = !S.settings.reviewRandom; save(); render(); });
    // click a deck/subdeck in the daily-review list → review just that deck's cards (the trash button stops its own propagation)
    root.querySelectorAll(".active-deck[data-review]").forEach((el) => {
      const go = () => route("study", { scope: { type: "deck", id: el.dataset.review } });
      el.addEventListener("click", (e) => { if (e.target.closest(".ad-trash")) return; go(); });
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    animateProgs(root);
  };

  /* ============================================================
     PAGE: DECKS
     ============================================================ */
  PAGES.decks = function (root) {
    const available = TREE.collections.filter((d) => !isComingSoon(d));
    const comingSoon = TREE.collections.filter((d) => isComingSoon(d));
    const admin = isAdmin();
    const section = (label, n, slotId, count) =>
      `<div class="collection-group">
        <div class="group-head"><span class="group-label">${label}</span><span class="group-line"></span><span class="group-count">${n}</span></div>
        <div class="collection-list" id="${slotId}">${count === 0 && admin ? '<div class="lib-empty">Drag a collection here</div>' : ""}</div>
      </div>`;

    root.innerHTML = `
      <div class="page-head">
        <span class="eyebrow">Library</span>
        <h1>Collections</h1>
        <p>Curated collections. New subjects are on the way.</p>
      </div>
      ${available.length || admin ? section("All decks", available.length, "collection-list-all", available.length) : ""}
      ${comingSoon.length || admin ? section("Coming soon", comingSoon.length, "collection-list-soon", comingSoon.length) : ""}`;

    const allList = root.querySelector("#collection-list-all");
    const soonList = root.querySelector("#collection-list-soon");
    if (allList) available.forEach((d) => allList.appendChild(buildCollection(d)));
    if (soonList) comingSoon.forEach((d) => soonList.appendChild(buildCollection(d)));
    wireLibraryDnd(root);
    animateProgs(root);   // fill the collection XP bars from their data-pct
  };

  // admin drag-to-reorder on the library: reorder collections, move them between All decks / Coming soon,
  // and reorder decks within a collection. Drag starts from the grip on the very left of each banner.
  function wireLibraryDnd(root) {
    if (!isAdmin()) return;
    let dragId = null;
    const kindOf = () => (dragId && NODE_BY_ID[dragId] ? (NODE_BY_ID[dragId].parentId ? "node" : "col") : null);
    const parentOf = () => (dragId && NODE_BY_ID[dragId] ? (NODE_BY_ID[dragId].parentId || "") : "");
    function clearFx() { root.querySelectorAll(".lib-drop-before, .lib-drop-into").forEach((x) => x.classList.remove("lib-drop-before", "lib-drop-into")); }
    function endDrag() { dragId = null; clearFx(); root.querySelectorAll(".lib-dragging").forEach((x) => x.classList.remove("lib-dragging")); }

    root.querySelectorAll("[data-grip]").forEach((grip) => {
      grip.addEventListener("click", (e) => e.stopPropagation());
      grip.addEventListener("mousedown", (e) => e.stopPropagation());
      grip.addEventListener("dragstart", (e) => {
        dragId = grip.dataset.grip;
        const banner = grip.closest("[data-libitem]");
        if (banner) { banner.classList.add("lib-dragging"); try { e.dataTransfer.setDragImage(banner, 28, 18); } catch (x) {} }
        try { e.dataTransfer.setData("text/plain", dragId); e.dataTransfer.effectAllowed = "move"; } catch (x) {}
      });
      grip.addEventListener("dragend", endDrag);
    });

    // banner targets: insert the dragged item BEFORE this one
    root.querySelectorAll("[data-libitem]").forEach((el) => {
      const valid = () => {
        if (!dragId || el.dataset.libitem === dragId) return false;
        if (kindOf() === "col" && el.dataset.libkind === "col") return true;
        if (kindOf() === "node" && el.dataset.libkind === "node" && el.dataset.libparent === parentOf()) return true;
        return false;
      };
      el.addEventListener("dragover", (e) => {
        if (!valid()) return;
        e.preventDefault(); e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        clearFx(); el.classList.add("lib-drop-before");
        if (kindOf() === "col") { const list = el.closest(".collection-list"); if (list) list.classList.add("lib-drop-into"); }
      });
      el.addEventListener("dragleave", () => el.classList.remove("lib-drop-before"));
      el.addEventListener("drop", (e) => {
        if (!valid()) return;
        e.preventDefault(); e.stopPropagation();
        const tid = el.dataset.libitem;
        if (kindOf() === "col") dropTopLevel(dragId, el.closest("#collection-list-soon") ? "soon" : "all", tid);
        else dropSibling(dragId, parentOf(), tid);
      });
    });

    // section containers: append a dragged collection to that section (and move it there)
    ["collection-list-all", "collection-list-soon"].forEach((slot) => {
      const list = root.querySelector("#" + slot); if (!list) return;
      const sec = slot === "collection-list-soon" ? "soon" : "all";
      list.addEventListener("dragover", (e) => {
        if (!dragId || kindOf() !== "col") return;
        if (e.target.closest("[data-libitem]")) return; // a banner handles it
        e.preventDefault(); clearFx(); list.classList.add("lib-drop-into");
      });
      list.addEventListener("drop", (e) => {
        if (!dragId || kindOf() !== "col" || e.target.closest("[data-libitem]")) return;
        e.preventDefault(); dropTopLevel(dragId, sec, null);
      });
    });

    // pads: append a dragged deck to the end of its parent's children
    root.querySelectorAll("[data-libpad]").forEach((pad) => {
      const pid = pad.dataset.libpad;
      pad.addEventListener("dragover", (e) => {
        if (!dragId || kindOf() !== "node" || parentOf() !== pid) return;
        if (e.target.closest("[data-libitem]")) return;
        e.preventDefault(); clearFx(); pad.classList.add("lib-drop-into");
      });
      pad.addEventListener("drop", (e) => {
        if (!dragId || kindOf() !== "node" || parentOf() !== pid || e.target.closest("[data-libitem]")) return;
        e.preventDefault(); dropSibling(dragId, pid, null);
      });
    });

    function dropTopLevel(id, sec, beforeId) {
      const targetSoon = sec === "soon";
      setNodeSoon(id, targetSoon);
      const avail = [], soon = [];
      TREE.collections.forEach((c) => { if (c.id === id) return; (isComingSoon(c) ? soon : avail).push(c.id); });
      const list = targetSoon ? soon : avail;
      const i = beforeId ? list.indexOf(beforeId) : -1;
      if (i >= 0) list.splice(i, 0, id); else list.push(id);
      reorderSiblings("", avail.concat(soon));
      commitLib();
    }
    function dropSibling(id, pid, beforeId) {
      const parent = NODE_BY_ID[pid]; if (!parent) return;
      const sibs = nodeChildren(parent).map((c) => c.id).filter((x) => x !== id);
      const i = beforeId ? sibs.indexOf(beforeId) : -1;
      if (i >= 0) sibs.splice(i, 0, id); else sibs.push(id);
      reorderSiblings(pid, sibs);
      commitLib();
    }
    function commitLib() {
      // remember which collections/branches are open and the scroll position, then rebuild in place
      const openIds = [];
      root.querySelectorAll("[data-libitem]").forEach((el) => {
        if (el.dataset.libkind === "col") { const c = el.closest(".collection"); if (c && c.classList.contains("open")) openIds.push(el.dataset.libitem); }
        else if (el.classList.contains("branch")) { const g = el.closest(".node-group"); const nc = g && [...g.children].find((x) => x.classList.contains("node-children")); if (nc && nc.classList.contains("open")) openIds.push(el.dataset.libitem); }
      });
      const sy = window.scrollY;
      _treeChanged();
      view.innerHTML = '<div class="page"></div>';
      PAGES.decks(view.firstElementChild);
      reopenLib(openIds);
      window.scrollTo({ top: sy });
      toast("Library updated");
    }
    function reopenLib(openIds) {
      openIds.forEach((id) => {
        const el = view.querySelector('[data-libitem="' + id + '"]');
        if (!el) return;
        if (el.dataset.libkind === "col") {
          const coll = el.closest(".collection");
          const nc = coll && [...coll.children].find((x) => x.classList.contains("node-children"));
          const chev = coll && coll.querySelector(".collection-actions > .chev");
          if (nc && chev) openExpander(nc, chev, coll);
        } else {
          const group = el.closest(".node-group");
          const nc = group && [...group.children].find((x) => x.classList.contains("node-children"));
          const chev = el.querySelector(".chev");
          if (nc && chev) openExpander(nc, chev, group);
        }
      });
    }
  }

  function chevBtn(extra) {
    return `<button class="chev${extra ? " " + extra : ""}" aria-label="Expand"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>`;
  }
  function nodeAddHTML(node) {
    if (isComingSoon(node)) return "";
    return `<button class="node-add${isActive(node.id) ? " added" : ""}" data-id="${node.id}" aria-label="${isActive(node.id) ? "Remove from review" : "Add to review"}">${addIcon(isActive(node.id))}</button>`;
  }
  // small drag handle on the very left of a banner (admins only) — used to reorder the library
  function libGripHTML(id) {
    if (!isAdmin()) return "";
    return '<span class="lib-grip" draggable="true" data-grip="' + esc(id) + '" title="Drag to reorder" aria-hidden="true"><svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><circle cx="5" cy="3" r="1.35"/><circle cx="11" cy="3" r="1.35"/><circle cx="5" cy="8" r="1.35"/><circle cx="11" cy="8" r="1.35"/><circle cx="5" cy="13" r="1.35"/><circle cx="11" cy="13" r="1.35"/></svg></span>';
  }
  // rowClick (optional): what a click on the ROW body does — defaults to toggling the children. The chevron ALWAYS just toggles
  // (its stopPropagation keeps it from also firing rowClick), so a collection can study-on-click while its chevron still expands.
  function wireExpander(rowEl, subsEl, chevEl, containerEl, rowClick) {
    const toggle = (e) => {
      if (e) e.stopPropagation();
      const open = subsEl.classList.toggle("open");
      chevEl.classList.toggle("open", open);
      containerEl.classList.toggle("open", open);
      if (open) {
        subsEl.querySelectorAll(":scope > .node-children-inner > .node-children-pad > .node").forEach((s) => {
          s.style.animation = "none"; void s.offsetWidth; s.style.animation = "";
        });
      }
    };
    chevEl.addEventListener("click", toggle);
    const onRow = rowClick || toggle;
    rowEl.addEventListener("click", onRow);
    rowEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRow(); }
    });
  }
  function openExpander(subsEl, chevEl, containerEl) {
    subsEl.classList.add("open");
    chevEl.classList.add("open");
    containerEl.classList.add("open");
  }

  // recursive renderer for a node beneath a collection (deck/subdeck), arbitrary depth
  function buildNode(node, index) {
    const num = String(index + 1).padStart(2, "0");
    const soon = isComingSoon(node);
    const pid = node.parentId || "";
    const spanText = nodeSpanText(node);
    const nodeSpanHTML = spanText ? `<span class="node-span">${esc(spanText)}</span>` : "";

    if (nodeIsBranch(node)) {
      const group = document.createElement("div");
      group.className = "node-group";
      group.innerHTML = `
        <div class="node branch${soon ? " placeholder" : ""}" tabindex="0" role="button" data-libitem="${esc(node.id)}" data-libkind="node" data-libparent="${esc(pid)}">
          ${libGripHTML(node.id)}
          <span class="node-num">${num}</span>
          <div class="node-main">
            <div class="node-title-row">
              <span class="node-title">${esc(node.title)}</span>
              ${nodeSpanHTML}
              ${soon ? '<span class="pill soon">Coming soon</span>' : ""}
            </div>
          </div>
          ${nodeAddHTML(node)}
          ${chevBtn("chev-sm")}
        </div>
        <div class="node-children"><div class="node-children-inner"><div class="node-children-pad" data-libpad="${esc(node.id)}"></div></div></div>`;
      const aBtn = group.querySelector(".node-add");
      if (aBtn) wireAddButton(aBtn, node.id);
      const pad = group.querySelector(".node-children-pad");
      nodeChildren(node).forEach((ch, i) => pad.appendChild(buildNode(ch, i)));
      const row = group.querySelector(".node.branch");
      const childrenEl = [...group.children].find((c) => c.classList.contains("node-children"));
      const chev = row.querySelector(".chev");
      wireExpander(row, childrenEl, chev, group);
      return group;
    }

    // leaf
    const subEl = document.createElement("div");
    subEl.className = "node" + (soon ? " placeholder" : "");
    subEl.tabIndex = 0;
    subEl.style.cursor = "pointer";
    subEl.dataset.libitem = node.id; subEl.dataset.libkind = "node"; subEl.dataset.libparent = pid;
    subEl.innerHTML = `
      ${libGripHTML(node.id)}
      <span class="node-num">${num}</span>
      <div class="node-main">
        <div class="node-title-row">
          <span class="node-title">${esc(node.title)}</span>
          ${nodeSpanHTML}
          ${soon ? '<span class="pill soon">Coming soon</span>' : ""}
        </div>
      </div>
      ${nodeAddHTML(node)}`;
    const aBtn = subEl.querySelector(".node-add");
    if (aBtn) wireAddButton(aBtn, node.id);
    const go = () => { if (isComingSoon(node)) return; route("study", { scope: { type: "deck", id: node.id } }); };
    subEl.addEventListener("click", go);
    subEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
    });
    return subEl;
  }

  // Per-collection banner theme: background wash colour + sparse motif (golden on the wash).
  // Tile widths are all 120 so the diagonal drift loops seamlessly (see @keyframes collDecoScroll).
  const COLL_THEME = {
    china: { bg: "#C8453C", pat: "#EAC15C" }, // gold stars on red
    rome:  { bg: "#664C9A", pat: "#DCB652" }, // gold laurels on purple
    japan: { bg: "#C0392E", pat: "#F4EEE2" }, // pale rising-sun discs on red
  };
  function collectionDecoSVG(id) {
    const t = COLL_THEME[id]; if (!t) return "";
    const STAR = "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.7 7.1-.6z";
    if (id === "china") // a few sparse gold stars
      return "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='" + t.pat + "'><path transform='translate(20,18)' d='" + STAR + "'/><path transform='translate(80,72) scale(.62)' d='" + STAR + "'/></g></svg>";
    if (id === "japan") // one rising-sun disc per tile
      return "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='" + t.pat + "' stroke-width='2.4'><circle cx='60' cy='60' r='30'/><circle cx='60' cy='60' r='19'/></g><circle cx='60' cy='60' r='7' fill='" + t.pat + "'/></svg>";
    if (id === "rome") { // exactly two large laurel branches in a tall tile
      const laurel = (oy) => {
        let s = "<rect x='59.1' y='" + oy + "' width='1.8' height='98' rx='.9'/>";
        for (let k = 0; k < 6; k++) { const yy = oy + 9 + k * 15;
          s += "<g transform='translate(62," + yy + ") rotate(40)'><ellipse rx='4.2' ry='9.5'/></g>";
          s += "<g transform='translate(58," + (yy + 6) + ") rotate(-40)'><ellipse rx='4.2' ry='9.5'/></g>";
        }
        return s;
      };
      return "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='240' viewBox='0 0 120 240'><g fill='" + t.pat + "'>" + laurel(16) + laurel(136) + "</g></svg>";
    }
    return "";
  }
  function collectionDecoBg(id) {
    const svg = collectionDecoSVG(id);
    return svg ? 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")' : "";
  }

  function buildCollection(d) {
    const studied = studiedInNode(d);
    const total = subtreeCardIds(d).length;
    const hasSubs = nodeIsBranch(d);
    const soon = isComingSoon(d);
    const spanText = nodeDateOverride(d.id);   // collections don't show the auto start/end date of the cards inside — only decks do (buildNode). A hand-set date override still shows.
    const spanHTML = spanText ? `<span class="collection-span">${esc(spanText)}</span>` : "";

    const collEl = document.createElement("div");
    collEl.className = "collection" + (soon ? " placeholder" : "");
    collEl.innerHTML = `
        <div class="collection-row" tabindex="${hasSubs ? 0 : -1}" role="button" data-libitem="${esc(d.id)}" data-libkind="col">
          <div class="collection-deco" aria-hidden="true"></div>
          ${libGripHTML(d.id)}
          ${levelBadgeMarkup(studied, d.id === "china")}
          <div class="collection-main">
            <div class="collection-title-row">
              <span class="collection-title">${esc(d.title)}</span>
              ${spanHTML}
              ${soon ? '<span class="pill soon">Coming soon</span>' : ""}
            </div>
            ${xpBarMarkup(studied)}
          </div>
          <div class="collection-actions">
            ${!soon ? `<button class="collection-add${isActive(d.id) ? " added" : ""}" data-id="${d.id}" aria-label="${isActive(d.id) ? "Remove from review" : "Add to review"}">${addIcon(isActive(d.id))}</button>` : ""}
            ${hasSubs ? `<button class="chev" aria-label="Expand children"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>` : ""}
          </div>
        </div>
        ${hasSubs ? '<div class="node-children"><div class="node-children-inner"><div class="node-children-pad" data-libpad="' + esc(d.id) + '"></div></div></div>' : ""}`;

      const deco = collEl.querySelector(".collection-deco");
      const theme = COLL_THEME[d.id];
      if (theme && deco) {
        const rowEl0 = collEl.querySelector(".collection-row");
        rowEl0.style.setProperty("--coll-bg", theme.bg);
        rowEl0.style.setProperty("--coll-pat", collectionDecoBg(d.id));
      } else if (deco) { deco.remove(); }
      const collAddBtn = collEl.querySelector(".collection-add");
      if (collAddBtn) wireAddButton(collAddBtn, d.id);

      if (hasSubs) {
        const padEl = collEl.querySelector(".node-children-pad");
        nodeChildren(d).forEach((sd, i) => padEl.appendChild(buildNode(sd, i)));

        const chev = collEl.querySelector(".collection-actions > .chev");
        const childrenEl = [...collEl.children].find((c) => c.classList.contains("node-children"));
        const rowEl = collEl.querySelector(".collection-row");
        // clicking the collection body studies its whole subtree (the chevron still expands the decks within); a coming-soon or
        // empty collection has nothing to study, so it falls back to toggling.
        wireExpander(rowEl, childrenEl, chev, collEl, (soon || !total) ? null : () => route("study", { scope: { type: "deck", id: d.id } }));
      }

      return collEl;
  }

  /* ============================================================
     STUDY SESSION
     ============================================================ */
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function buildSession(scope) {
    let queue, where, total;
    if (scope.type === "review") {
      const q = reviewQueue();
      queue = q.all.slice();
      if (S.settings.reviewRandom) shuffle(queue);                                             // daily-review order toggle (home banner)
      else {                                                                                   // "Chrono" = the cards' order of appearance within their decks (set by drag-reordering in the editor)
        const seq = TREE.collections.flatMap(subtreeCardIds), oi = {};
        for (let i = 0; i < seq.length; i++) if (!(seq[i] in oi)) oi[seq[i]] = i;
        queue.sort((a, b) => ((oi[a] == null ? 1e9 : oi[a]) - (oi[b] == null ? 1e9 : oi[b])) || (cardStartYear(CARD_BY_ID[a]) - cardStartYear(CARD_BY_ID[b])));
      }
      where = "Review";
      total = queue.length;
    } else {
      const sd = NODE_BY_ID[scope.id];
      if (!sd) return null;
      where = nodeWhere(sd);
      const ids = subtreeCardIds(sd).filter((id) => !isSuspended(id));
      // due cards in this deck first, then new (respecting daily new limit), then any unseen if you want to push on
      const due = ids.filter((id) => isDueNow(id)).sort((a, b) => S.cards[a].due - S.cards[b].due);
      const unseen = ids.filter((id) => !isSeen(id));
      const fresh = unseen.slice(0, Math.max(newRemainingToday(), 0));   // new cards in deck (card) order — set via the editor's drag-reorder
      queue = [...due, ...fresh];
      // if nothing scheduled and no new allowance left but deck still has unseen, let the user push through extras
      total = queue.length;
      queue._sd = sd;
      queue._unseen = unseen;
    }
    return { queue, where, scope };
  }

  PAGES.study = function (root, params) {
    const sess = buildSession(params.scope);
    if (!sess) {
      root.innerHTML = emptyPlacard("Deck not found", "—", "We couldn't find that deck.", () => route("decks"), "Back to collections");
      return;
    }
    const sd = params.scope.type === "deck" ? NODE_BY_ID[params.scope.id] : null;

    // placeholder / coming-soon deck
    if (sd && isComingSoon(sd)) {
      root.innerHTML = emptyPlacard(
        sd.title,
        sd.hanzi || initialOf(sd.title),
        "This deck is coming soon. The cards are still being written — check back shortly.",
        () => route("decks"),
        "Back to collections"
      );
      return;
    }

    let queue = sess.queue.slice();
    let studiedThisSession = 0;
    let revealed = false;

    if (queue.length === 0) {
      // nothing due / no new left — offer to cram remaining unseen, or report all caught up
      const remainingUnseen = sd ? subtreeCardIds(sd).filter((id) => !isSeen(id) && !isSuspended(id)) : [];
      if (sd && remainingUnseen.length) {
        root.innerHTML = emptyPlacard(
          "Daily limit reached",
          "✓",
          "You've hit today's new-card limit for this deck (" +
            S.settings.newPerDay +
            "/day). You can study ahead anyway, or come back tomorrow.",
          null,
          null
        );
        const card = root.querySelector(".placard");
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML =
          '<button class="btn" id="cram">Study ' + remainingUnseen.length + " ahead</button>" +
          '<button class="btn ghost" id="back">Back to collections</button>';
        card.appendChild(row);
        row.querySelector("#cram").addEventListener("click", () => {
          queue = remainingUnseen.slice();
          startLoop();
        });
        row.querySelector("#back").addEventListener("click", () => route("decks"));
        return;
      }
      root.innerHTML = emptyPlacard(
        "All caught up",
        "✓",
        sess.scope.type === "review"
          ? "No cards are due right now. New cards unlock as you keep a streak going."
          : "You've studied everything available in this deck for now.",
        () => route(sess.scope.type === "review" ? "home" : "decks"),
        "Done"
      );
      return;
    }

    startLoop();

    function startLoop() {
      renderCard();
    }

    function remainingCounts() {
      let nw = 0, lr = 0, rv = 0;
      queue.forEach((id) => {
        const c = S.cards[id];
        if (!c) nw++;
        else if (c.status === "learning") lr++;
        else rv++;
      });
      return { nw, lr, rv };
    }

    function renderCard() {
      closeAllGloss();   // clear any gloss popup from the previous card (incl. before the completion screen) so it can't linger or be restored on reload
      ttsStop();         // …and stop the previous card's read-aloud
      if (queue.length === 0) return renderComplete();
      revealed = false;
      hideGradeBar();
      const id = queue[0];
      const c = CARD_BY_ID[id];
      const rc = remainingCounts();

      root.innerHTML = `
        <div class="study-shell">
          <div class="study-bar">
            <button class="backbtn" id="exit"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg> ${
              sess.scope.type === "review" ? "Home" : "Collections"
            }</button>
            <span class="study-where">${esc(sess.where)}</span>
            <div class="counts">
              <span class="cnt new">${rc.nw}</span>
              <span class="cnt learn">${rc.lr}</span>
              <span class="cnt due">${rc.rv}</span>
            </div>
          </div>
          <div class="cardwrap swap">
            <div class="study-card">
              ${ttsEnabled() ? `<button class="tts-mute${S.settings.ttsMuted ? " muted" : ""}" id="ttsMute" type="button" aria-label="${S.settings.ttsMuted ? "Unmute read-aloud" : "Mute read-aloud"}" title="Mute / unmute read-aloud">${ttsMuteIconSVG()}</button>` : ""}
              <span class="label">Question${ttsPlayHTML("question", true)}</span>
              <div class="question">${c.question}</div>
              <div class="reveal" id="reveal"><div class="reveal-inner" id="revealInner"></div></div>
            </div>
            <div class="actions" id="actions"></div>
          </div>
        </div>`;

      const cardRoot = root.querySelector(".study-card");
      openLinks(cardRoot);
      setupCloze(cardRoot.querySelector(".question"));
      setupWhiteboard();
      showWBTools();
      showAdminEditBtn(id);
      // read-aloud: mute toggle (persisted — stays muted for future cards/decks until unmuted) + the Question play control
      const muteBtn = cardRoot.querySelector("#ttsMute");
      if (muteBtn) muteBtn.addEventListener("click", () => {
        S.settings.ttsMuted = !S.settings.ttsMuted;
        save();
        if (S.settings.ttsMuted) ttsStop();   // muting stops the reading dead — unmuting does NOT resume it
        muteBtn.classList.toggle("muted", S.settings.ttsMuted);
        muteBtn.innerHTML = ttsMuteIconSVG();
        muteBtn.setAttribute("aria-label", S.settings.ttsMuted ? "Unmute read-aloud" : "Mute read-aloud");
      });
      wireTTS(cardRoot, c);
      if (ttsActive()) ttsSay(ttsPartsFor("question", c));   // the slow male voice reads the question ("blank" for the ____)
      root.querySelector("#exit").addEventListener("click", () =>
        route(sess.scope.type === "review" ? "home" : "decks")
      );
      function suspendCurrent() {
        if (!S.suspended) S.suspended = {};
        S.suspended[id] = Date.now();
        save();
        toast("Card suspended — it won't appear again");
        queue.shift();
        hideGradeBar();
        renderCard();
      }

      const actions = root.querySelector("#actions");
      actions.innerHTML = '<div class="reveal-cta"><button class="btn" id="reveal-btn">Reveal answer</button></div>';
      root.querySelector("#reveal-btn").addEventListener("click", showAnswer);

      function showAnswer() {
        if (revealed) return;
        revealed = true;
        gradeCloze(cardRoot.querySelector(".question"), c.answer);
        const inner = root.querySelector("#revealInner");
        inner.innerHTML = buildBack(c);
        openLinks(inner);
        processAbstract(inner, c);
        setupTooltips(inner);
        const bgHead = inner.querySelector(".bg-head");
        const bgToggle = inner.querySelector(".bg-toggle");
        const bgCollapse = inner.querySelector(".bg-collapse");
        if (bgHead && bgCollapse) {
          bgHead.addEventListener("click", () => {
            const collapsed = bgCollapse.classList.toggle("collapsed");
            if (bgToggle) bgToggle.classList.toggle("collapsed", collapsed);
            bgHead.setAttribute("aria-expanded", collapsed ? "false" : "true");
            S.settings.bgCollapsed = collapsed;
            save();
          });
        }
        const trToggle = inner.querySelector(".tr-toggle");
        const answerTr = inner.querySelector(".answer-tr");
        if (trToggle && answerTr) {
          trToggle.addEventListener("click", () => {
            const collapsed = answerTr.classList.toggle("collapsed");
            trToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
            S.settings.trCollapsed = collapsed;
            save();
          });
        }
        inner.querySelectorAll(".tr-play").forEach((btn) =>
          btn.addEventListener("click", () => speak(btn.dataset.say, btn))
        );
        wireTTS(inner, c);                                      // the Answer / Background section play buttons
        wireReadAloudMenu(inner.querySelector(".abstract"));    // select text in the background -> right-click -> Copy / Read aloud
        root.querySelector("#reveal").classList.add("show");
        // auto read-aloud on reveal: the answer title (male EN) -> the Chinese (female ZH) -> the background (male EN)
        if (ttsActive()) {
          const seq = ttsPartsFor("answer", c).concat(ttsPartsFor("background", c, inner));
          ttsSay(seq);
        }

        const p = preview(id);
        actions.innerHTML = "";
        showGradeBar(
          `<div class="grade-wrap">
            <button class="grade-help" type="button" aria-label="What do these buttons do?">?<span class="grade-help-bubble"><span class="ghb-title">How well did you recall it?</span><span class="ghb-row"><b>Again</b>Forgot it — the card returns within minutes.</span><span class="ghb-row"><b>Hard</b>Recalled with effort — scheduled sooner than usual.</span><span class="ghb-row"><b>Good</b>Recalled correctly — the interval grows normally.</span><span class="ghb-row"><b>Easy</b>Knew it instantly — the interval grows the most.</span><span class="ghb-row"><b>Suspend</b>Not interested — the card won’t be shown again.</span></span></button>
            <div class="grades">
              <button class="grade again" data-g="again"><span class="gl">Again</span><span class="gi">${fmtInterval(p.again)}</span><span class="gk">1</span></button>
              <button class="grade hard" data-g="hard"><span class="gl">Hard</span><span class="gi">${fmtInterval(p.hard)}</span><span class="gk">2</span></button>
              <button class="grade good" data-g="good"><span class="gl">Good</span><span class="gi">${fmtInterval(p.good)}</span><span class="gk">3</span></button>
              <button class="grade easy" data-g="easy"><span class="gl">Easy</span><span class="gi">${fmtInterval(p.easy)}</span><span class="gk">4</span></button>
            </div>
            <button class="suspendbtn gradebar-suspend" id="suspendBtn" type="button" aria-label="Suspend this card so it won't appear again"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>Suspend card</button>
          </div>`,
          (g) => doGrade(g)
        );
        const susBtn = document.getElementById("suspendBtn");
        if (susBtn) susBtn.addEventListener("click", suspendCurrent);
      }

      function doGrade(g) {
        const wasSeen = isSeen(id);
        const res = grade(id, g);
        if (!wasSeen) studiedThisSession++;
        else studiedThisSession++; // count every review as a study event for the session tally
        queue.shift();
        if (res.requeue) queue.push(id); // relearn within session
        // swap animation handled by re-render
        renderCard();
      }

      // keyboard
      cardRoot._keys = function (e) {
        const typing = document.activeElement && document.activeElement.classList && document.activeElement.classList.contains("blank-input");
        if (!revealed && e.key === "Enter") {
          e.preventDefault();
          showAnswer();
        } else if (!revealed && e.key === " " && !typing) {
          e.preventDefault();
          showAnswer();
        } else if (revealed && ["1", "2", "3", "4"].includes(e.key)) {
          e.preventDefault();
          doGrade({ 1: "again", 2: "hard", 3: "good", 4: "easy" }[e.key]);
        }
      };
      attachKeys(cardRoot._keys);
    }

    function renderComplete() {
      detachKeys();
      hideGradeBar();
      hideWBTools();
      root.innerHTML = "";
      const card = document.createElement("div");
      card.className = "placard";
      card.innerHTML = `
        <div class="big">畢</div>
        <h2>Session complete</h2>
        <p>You worked through ${studiedThisSession} card${studiedThisSession === 1 ? "" : "s"}. Your progress is saved.</p>
        <div class="row">
          <button class="btn" id="more">Keep studying</button>
          <button class="btn ghost" id="home">Back ${sess.scope.type === "review" ? "home" : "to collections"}</button>
        </div>`;
      root.appendChild(card);
      card.querySelector("#home").addEventListener("click", () =>
        route(sess.scope.type === "review" ? "home" : "decks")
      );
      card.querySelector("#more").addEventListener("click", () => route("study", params));
    }
  };

  function emptyPlacard(title, glyph, body, cb, cbLabel) {
    const html = `
      <div class="placard">
        <div class="big">${glyph}</div>
        <h2>${esc(title)}</h2>
        <p>${esc(body)}</p>
        ${cb ? '<div class="row"><button class="btn" id="pc-btn">' + esc(cbLabel) + "</button></div>" : ""}
      </div>`;
    if (cb) {
      // attach after insertion via microtask
      setTimeout(() => {
        const b = document.getElementById("pc-btn");
        if (b) b.addEventListener("click", cb);
      }, 0);
    }
    return html;
  }

  // Prepare the rendered Background: bold only the answer term (the first bold), then
  // auto-link glossary terms (first occurrence each; never the answer term). Auto-generated
  // links (data-auto) are unwrapped so they can be re-derived; hand-added links the editor
  // placed (no data-auto) are kept, except any pointing at a term that no longer exists.
  function processAbstract(container, card) {
    const abs = container.querySelector(".abstract");
    if (!abs) return;
    const first = abs.querySelector("b, strong");
    if (first) first.classList.add("ans-term");
    const G = window.GLOSSARY || {};
    abs.querySelectorAll(".ttip").forEach((el) => {
      const k = el.getAttribute("data-k");
      if (el.hasAttribute("data-auto") || !k || !G[k]) el.replaceWith(document.createTextNode(el.textContent));
    });
    abs.normalize();
    autoLinkGlossary(abs, card && card.answer, glossOffList(card && card.id));
  }

  // Turn each cloze blank in a question into a typed-answer field. Focuses the first one.
  function setupCloze(qEl) {
    if (!qEl) return;
    const blanks = qEl.querySelectorAll(".blank");
    blanks.forEach((span) => {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "blank-input";
      input.autocomplete = "off"; input.autocapitalize = "off"; input.spellcheck = false;
      input.setAttribute("autocorrect", "off");
      input.setAttribute("aria-label", "Type the missing term");
      const grow = () => { input.style.width = Math.max(4, input.value.length + 1) + "ch"; };
      input.addEventListener("input", grow);
      span.replaceWith(input);
      grow();
    });
    const first = qEl.querySelector(".blank-input");
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
  }
  // On reveal, colour each typed character green/red by direct (case-insensitive) match to the answer.
  function gradeCloze(qEl, answer) {
    if (!qEl) return;
    const ans = String(answer || ""), ansL = ans.toLowerCase();
    qEl.querySelectorAll(".blank-input").forEach((input) => {
      const typed = input.value;
      const out = document.createElement("span");
      out.className = "blank-graded";
      if (!typed) {
        out.classList.add("empty");
        out.textContent = ans || "—"; // nothing typed: just fill in the correct term
      } else {
        for (let i = 0; i < typed.length; i++) {
          const ch = document.createElement("span");
          ch.className = (i < ansL.length && typed[i].toLowerCase() === ansL[i]) ? "ch-ok" : "ch-bad";
          ch.textContent = typed[i];
          out.appendChild(ch);
        }
      }
      input.replaceWith(out);
    });
  }

  // build the back-of-card markup from deck fields (mirrors the deck's back template)
  function buildBack(c) {
    let html = "";
    if (c.answer) {
      const hasTr = !!c.hanzi;
      html += '<div class="answer"><div class="answer-main"><span class="label">Answer' + ttsPlayHTML("answer", true) + "</span>";
      html += '<div class="answer-av"><span class="val">' + c.answer + "</span>";
      html += '<div class="av-row">' + (c.answerDate || "") + "</div></div></div>";
      if (hasTr) {
        const trCol = S.settings.trCollapsed !== false; // collapsed by default
        html += '<div class="answer-tr' + (trCol ? " collapsed" : "") + '">';
        html += '<button class="tr-toggle" type="button" aria-expanded="' + (trCol ? "false" : "true") + '" aria-label="Show or hide the translation" title="Show or hide the translation">中文</button>';
        html += '<div class="tr-collapse"><div class="tr-collapse-inner"><div class="tr-list">';
        if (c.traditional)
          html += '<div class="tr-tradline"><span class="tr-trad">' + esc(c.traditional) + "</span></div>";
        html +=
          '<div class="tr-cn"><button class="tr-play" type="button" data-say="' + esc(c.hanzi) + '" aria-label="Play pronunciation">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 4 20 12 6 20 6 4"/></svg>' +
          '</button><span class="hz">' + esc(c.hanzi) + "</span></div>";
        html += c.translations || "";
        html += "</div></div></div></div>";
      }
      html += "</div>";
    }
    if (c.abstract) {
      const bgCol = !!S.settings.bgCollapsed;
      html +=
        '<button class="bg-head" type="button" aria-expanded="' + (bgCol ? "false" : "true") + '" aria-label="Show or hide background">' +
        '<span class="label">Background</span>' +
        '<span class="bg-toggle' + (bgCol ? " collapsed" : "") + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' +
        "</span>" + ttsPlayHTML("background", true) + "</button>";
      html += '<div class="bg-collapse' + (bgCol ? " collapsed" : "") + '"><div class="bg-collapse-inner">';
      if (c.abstract) html += '<p class="abstract">' + c.abstract + "</p>";
      html += "</div></div>";
    }
    return html;
  }
  // render a static, fully-expanded card preview (question + back) into a box — used by the admin editor's live preview
  function renderCardPreviewInto(box, c) {
    box.innerHTML =
      '<div class="study-card admin-pv-card">' +
        '<span class="label">Question</span>' +
        '<div class="question">' + (c.question || '<em style="color:var(--ink-faint)">(no question)</em>') + '</div>' +
        '<div class="reveal show"><div class="reveal-inner">' + buildBack(c) + '</div></div>' +
      '</div>';
    const inner = box.querySelector(".reveal-inner");
    openLinks(box);
    inner.querySelectorAll(".bg-collapse, .bg-toggle, .answer-tr").forEach((el) => el.classList.remove("collapsed"));   // expand so all edits are visible
    const bh = inner.querySelector(".bg-head"); if (bh) bh.setAttribute("aria-expanded", "true");
    const tt = inner.querySelector(".tr-toggle"); if (tt) tt.setAttribute("aria-expanded", "true");
    processAbstract(inner, c); setupTooltips(inner);
    const trToggle = inner.querySelector(".tr-toggle"), answerTr = inner.querySelector(".answer-tr");
    if (trToggle && answerTr) trToggle.addEventListener("click", () => { const col = answerTr.classList.toggle("collapsed"); trToggle.setAttribute("aria-expanded", col ? "false" : "true"); });
    const bgHead = inner.querySelector(".bg-head"), bgToggle = inner.querySelector(".bg-toggle"), bgCollapse = inner.querySelector(".bg-collapse");
    if (bgHead && bgCollapse) bgHead.addEventListener("click", () => { const col = bgCollapse.classList.toggle("collapsed"); if (bgToggle) bgToggle.classList.toggle("collapsed", col); bgHead.setAttribute("aria-expanded", col ? "false" : "true"); });
    inner.querySelectorAll(".tr-play").forEach((btn) => btn.addEventListener("click", () => speak(btn.dataset.say, btn)));
    wireTTS(inner, c);
  }

  /* ---------- global keyboard plumbing for study ---------- */
  let activeKeyHandler = null;
  function attachKeys(fn) {
    detachKeys();
    activeKeyHandler = fn;
    document.addEventListener("keydown", activeKeyHandler);
  }
  function detachKeys() {
    if (activeKeyHandler) document.removeEventListener("keydown", activeKeyHandler);
    activeKeyHandler = null;
  }

  /* ============================================================
     DAILY CHALLENGE
     ============================================================ */
  const BOTS = [
    { name: "Mei", color: "#36357A", skill: 0.78, speed: [2.5, 7] },
    { name: "Aric", color: "#B5722A", skill: 0.62, speed: [3, 9] },
    { name: "Tomas", color: "#3F7E5C", skill: 0.7, speed: [2, 8] },
  ];

  // rough type of a card's answer, so the wrong options are the SAME KIND of thing (a person → other people,
  // a dynasty → other dynasties, an event → other events) and the choice is genuinely hard rather than obvious.
  function answerType(card) {
    const s = card.answerText || "";
    if (/\b(dynasty|period|era|kingdom|age|reign|epoch|republic|states)\b/i.test(s)) return "period";
    if (/\b(battle|war|rebellion|revolt|uprising|campaign|siege|conquest|incident|massacre|flood|expedition|mutiny)\b/i.test(s)) return "event";
    if (/\b(classic|records|record|book|annals|scripture|canon|odes|rites|changes|documents)\b/i.test(s)) return "text";
    return "figure";   // default: a person / deity / named figure
  }
  function buildChallengeQuestions() {
    const poolIds = ALL_CARD_IDS.slice();
    const chosen = pick(poolIds, Math.min(5, poolIds.length)).map((id) => CARD_BY_ID[id]);
    return chosen.map((card) => {
      const correct = card.answerText, t = answerType(card);
      // prefer distractors of the same type; top up with any others if there aren't three
      const sameType = pick(CARDS.filter((c) => c.answerText && c.answerText !== correct && answerType(c) === t).map((c) => c.answerText));
      const uniq = [];
      for (const d of sameType) { if (uniq.length >= 3) break; if (!uniq.includes(d) && d !== correct) uniq.push(d); }
      if (uniq.length < 3) {
        const other = pick(CARDS.filter((c) => c.answerText && c.answerText !== correct && !uniq.includes(c.answerText)).map((c) => c.answerText));
        for (const d of other) { if (uniq.length >= 3) break; if (!uniq.includes(d)) uniq.push(d); }
      }
      const options = pick([correct, ...uniq]);
      return { card, options, correct };
    });
  }

  PAGES.challenge = function (root) {
    detachKeys();
    const Q = buildChallengeQuestions();
    if (Q.length < 2) {
      root.innerHTML = emptyPlacard("Not enough cards", "选", "Add a deck with more cards to play.", () => route("home"), "Back home");
      return;
    }
    let qi = 0, score = 0; const results = [];
    renderQuestion();

    function pips() { return `<div class="tf-pips">${Q.map((_, k) => `<span class="tf-pip ${k < qi ? (results[k] ? "ok" : "no") : (k === qi ? "cur" : "")}"></span>`).join("")}</div>`; }

    function renderQuestion() {
      const item = Q[qi];
      root.innerHTML = `
        <div class="dc-shell">
          <div class="page-head" style="margin-bottom:14px">
            <span class="eyebrow">Multiple Choice</span>
            <h1 style="font-size:28px">Question ${qi + 1} <span style="color:var(--ink-faint)">/ ${Q.length}</span></h1>
          </div>
          ${pips()}
          <div class="dc-q">
            <div class="dc-meta"><span>${esc(item.card.category)}</span><span>Pick the answer</span></div>
            <p class="qtext">${item.card.question}</p>
            <div class="opts" id="opts"></div>
            <div class="tf-reveal" id="reveal" hidden></div>
          </div>
        </div>`;
      const opts = root.querySelector("#opts");
      item.options.forEach((opt, i) => {
        const b = document.createElement("button");
        b.className = "opt";
        b.innerHTML = '<span class="key">' + "ABCD"[i] + "</span><span>" + esc(opt) + "</span>";
        b.addEventListener("click", () => choose(i, b));
        opts.appendChild(b);
      });
    }

    function choose(i) {
      const item = Q[qi], correctIdx = item.options.indexOf(item.correct), right = i === correctIdx;
      results[qi] = right; if (right) score++;
      root.querySelectorAll("#opts .opt").forEach((b, idx) => {
        b.disabled = true;
        if (idx === correctIdx) b.classList.add("correct");
        else if (idx === i) b.classList.add("wrong");
      });
      const rev = root.querySelector("#reveal"); rev.hidden = false;
      rev.innerHTML =
        '<div class="tf-verdict ' + (right ? "ok" : "no") + '">' + (right ? "Correct" : "Not quite") + " — it’s <b>" + esc(item.correct) + "</b></div>" +
        '<button class="btn" id="mc-next">' + (qi + 1 < Q.length ? "Next question" : "See results") + "</button>";
      rev.querySelector("#mc-next").addEventListener("click", next);
    }

    function next() {
      qi++;
      if (qi >= Q.length) return renderResults();
      renderQuestion();
    }

    function renderResults() {
      const won = score === Q.length;   // a perfect run counts as a win
      S.daily.games++;
      S.daily.best = Math.max(S.daily.best || 0, score);
      S.daily.lastPlayed = now();
      if (won && S.daily.winDate !== todayStr()) { S.daily.wins = (S.daily.wins || 0) + 1; S.daily.winDate = todayStr(); }   // count at most one win per day (revives Victor/Champion; "win 10 daily challenges" = 10 distinct days, not farmable by replaying)
      markGamePlayed("challenge", won);
      save();
      checkAchievements();
      const msg = score === Q.length ? "Perfect run — every one right." : score >= Q.length - 1 ? "Sharp — nearly flawless." : score >= Math.ceil(Q.length / 2) ? "Solid effort." : "Keep studying — try again.";
      root.innerHTML = `
        <div class="dc-shell">
          <div class="page-head"><span class="eyebrow">Multiple Choice</span><h1>You scored ${score} <span style="color:var(--ink-faint)">/ ${Q.length}</span></h1></div>
          <p style="color:var(--ink-soft); margin:-4px 0 18px; font-family:var(--serif)">${msg}</p>
          <div class="tf-summary">${Q.map((it, k) => `
            <div class="tf-sum-row">
              <span class="tf-sum-mark ${results[k] ? "ok" : "no"}">${results[k] ? "✓" : "✗"}</span>
              <div><p class="tf-sum-q">${it.card.question}</p><p class="tf-sum-a"><b>${esc(it.correct)}</b></p></div>
            </div>`).join("")}</div>
          <div class="tf-actions"><button class="btn" id="mc-again">Play again</button><button class="btn ghost" id="mc-home">Home</button></div>
        </div>`;
      root.querySelector("#mc-again").addEventListener("click", () => route("challenge"));
      root.querySelector("#mc-home").addEventListener("click", () => route("home"));
    }
  };

  /* ============================================================
     PAGE: TRUE OR FALSE (myth-or-fact quiz, 5 rounds)
     ============================================================ */
  PAGES.truefalse = function (root) {
    detachKeys();
    const POOL = window.TRUEFALSE || [];
    const ROUNDS = 5;
    if (POOL.length < ROUNDS) { root.innerHTML = emptyPlacard("Coming soon", "真", "Not enough statements to play yet.", () => route("home"), "Back home"); return; }
    // pick ROUNDS distinct statements at random
    const idx = POOL.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    const picks = idx.slice(0, ROUNDS).map((i) => POOL[i]);
    let r = 0, score = 0; const results = [];

    renderRound();
    function pips() { return `<div class="tf-pips">${picks.map((_, k) => `<span class="tf-pip ${k < r ? (results[k] ? "ok" : "no") : (k === r ? "cur" : "")}"></span>`).join("")}</div>`; }
    function renderRound() {
      const it = picks[r];
      root.innerHTML = `
        <div class="dc-shell">
          <div class="page-head" style="margin-bottom:14px">
            <span class="eyebrow">True or False</span>
            <h1 style="font-size:28px">Round ${r + 1} <span style="color:var(--ink-faint)">/ ${ROUNDS}</span></h1>
          </div>
          ${pips()}
          <div class="dc-q">
            <div class="dc-meta"><span>${esc(it.cat)}</span><span>Myth or fact?</span></div>
            <p class="qtext" style="font-size:21px">${esc(it.q)}</p>
            <div class="tf-opts" id="tfopts">
              <button class="opt" data-v="1"><span class="key">T</span><span>True</span></button>
              <button class="opt" data-v="0"><span class="key">F</span><span>False</span></button>
            </div>
            <div class="tf-reveal" id="tfreveal" hidden></div>
          </div>
        </div>`;
      root.querySelectorAll("#tfopts .opt").forEach((b) => b.addEventListener("click", () => answer(b.dataset.v === "1", b)));
    }
    function answer(guess, btn) {
      const it = picks[r], correct = guess === it.a; results[r] = correct; if (correct) score++;
      root.querySelectorAll("#tfopts .opt").forEach((b) => { b.disabled = true; const v = b.dataset.v === "1"; if (v === it.a) b.classList.add("correct"); else if (b === btn) b.classList.add("wrong"); });
      const rev = root.querySelector("#tfreveal"); rev.hidden = false;
      rev.innerHTML = `
        <div class="tf-verdict ${correct ? "ok" : "no"}">${correct ? "Correct" : "Not quite"} — it's <b>${it.a ? "True" : "False"}</b></div>
        <p class="tf-why">${esc(it.why)}</p>
        <button class="btn" id="tf-next">${r + 1 < ROUNDS ? "Next round" : "See results"}</button>`;
      rev.querySelector("#tf-next").addEventListener("click", () => { r++; (r < ROUNDS) ? renderRound() : renderEnd(); });
    }
    function renderEnd() {
      markGamePlayed("truefalse", score === ROUNDS); save(); checkAchievements();
      const msg = score === 5 ? "Flawless — a true myth-buster." : score >= 4 ? "Excellent — you know your history." : score >= 3 ? "Solid effort." : score >= 2 ? "Plenty of myths still got you." : "History is full of surprises — try again.";
      root.innerHTML = `
        <div class="dc-shell">
          <div class="page-head"><span class="eyebrow">True or False</span><h1>You scored ${score} <span style="color:var(--ink-faint)">/ ${ROUNDS}</span></h1></div>
          <p style="color:var(--ink-soft); margin:-4px 0 18px; font-family:var(--serif)">${msg}</p>
          <div class="tf-summary">${picks.map((it, k) => `
            <div class="tf-sum-row">
              <span class="tf-sum-mark ${results[k] ? "ok" : "no"}">${results[k] ? "✓" : "✗"}</span>
              <div><p class="tf-sum-q">${esc(it.q)}</p><p class="tf-sum-a"><b>${it.a ? "True" : "False"}.</b> ${esc(it.why)}</p></div>
            </div>`).join("")}</div>
          <div class="tf-actions"><button class="btn" id="tf-again">Play again</button><button class="btn ghost" id="tf-home">Home</button></div>
        </div>`;
      root.querySelector("#tf-again").addEventListener("click", () => route("truefalse"));
      root.querySelector("#tf-home").addEventListener("click", () => route("home"));
    }
  };

  /* ============================================================
     PAGE: WHO SAID IT? (guess the speaker of a famous quote)
     ============================================================ */
  function buildWhoSaidRounds() {
    const POOL = window.QUOTEGAME || [];
    const picks = pick(POOL, Math.min(5, POOL.length));
    const allWho = [...new Set(POOL.map((x) => x.who))];
    return picks.map((it) => {
      const distractors = pick(allWho.filter((w) => w !== it.who)).slice(0, 3);   // other real historical figures → plausible
      return { it, options: pick([it.who, ...distractors]) };
    });
  }
  PAGES.whosaid = function (root) {
    detachKeys();
    const POOL = window.QUOTEGAME || [];
    if (POOL.length < 4) { root.innerHTML = emptyPlacard("Coming soon", "言", "Not enough quotes to play yet.", () => route("home"), "Back home"); return; }
    const rounds = buildWhoSaidRounds(), ROUNDS = rounds.length;
    let r = 0, score = 0; const results = [];
    renderRound();
    function pips() { return `<div class="tf-pips">${rounds.map((_, k) => `<span class="tf-pip ${k < r ? (results[k] ? "ok" : "no") : (k === r ? "cur" : "")}"></span>`).join("")}</div>`; }
    function renderRound() {
      const { it, options } = rounds[r];
      root.innerHTML = `
        <div class="dc-shell">
          <div class="page-head" style="margin-bottom:14px">
            <span class="eyebrow">Who said it?</span>
            <h1 style="font-size:28px">Round ${r + 1} <span style="color:var(--ink-faint)">/ ${ROUNDS}</span></h1>
          </div>
          ${pips()}
          <div class="dc-q">
            <div class="dc-meta"><span>Famous words</span><span>Who said it?</span></div>
            <blockquote class="ws-quote">${esc(it.q)}</blockquote>
            <div class="opts" id="opts"></div>
            <div class="tf-reveal" id="reveal" hidden></div>
          </div>
        </div>`;
      const opts = root.querySelector("#opts");
      options.forEach((opt, i) => {
        const b = document.createElement("button");
        b.className = "opt";
        b.innerHTML = '<span class="key">' + "ABCD"[i] + "</span><span>" + esc(opt) + "</span>";
        b.addEventListener("click", () => choose(opt, i));
        opts.appendChild(b);
      });
    }
    function choose(opt, i) {
      const { it, options } = rounds[r];
      const correctIdx = options.indexOf(it.who), right = opt === it.who;
      results[r] = right; if (right) score++;
      root.querySelectorAll("#opts .opt").forEach((b, idx) => {
        b.disabled = true;
        if (idx === correctIdx) b.classList.add("correct");
        else if (idx === i) b.classList.add("wrong");
      });
      const rev = root.querySelector("#reveal"); rev.hidden = false;
      rev.innerHTML =
        '<div class="tf-verdict ' + (right ? "ok" : "no") + '">' + (right ? "Correct" : "Not quite") + " — <b>" + esc(it.who) + "</b></div>" +
        '<p class="tf-why">' + esc(it.context) + "</p>" +
        '<button class="btn" id="ws-next">' + (r + 1 < ROUNDS ? "Next round" : "See results") + "</button>";
      rev.querySelector("#ws-next").addEventListener("click", () => { r++; (r < ROUNDS) ? renderRound() : renderEnd(); });
    }
    function renderEnd() {
      markGamePlayed("whosaid", score === ROUNDS); save(); checkAchievements();
      const msg = score === ROUNDS ? "Flawless — you know your history." : score >= ROUNDS - 1 ? "Excellent." : score >= Math.ceil(ROUNDS / 2) ? "Solid effort." : "History is full of voices — try again.";
      root.innerHTML = `
        <div class="dc-shell">
          <div class="page-head"><span class="eyebrow">Who said it?</span><h1>You scored ${score} <span style="color:var(--ink-faint)">/ ${ROUNDS}</span></h1></div>
          <p style="color:var(--ink-soft); margin:-4px 0 18px; font-family:var(--serif)">${msg}</p>
          <div class="tf-summary">${rounds.map((rd, k) => `
            <div class="tf-sum-row">
              <span class="tf-sum-mark ${results[k] ? "ok" : "no"}">${results[k] ? "✓" : "✗"}</span>
              <div><p class="tf-sum-q">“${esc(rd.it.q)}”</p><p class="tf-sum-a"><b>${esc(rd.it.who)}</b> — ${esc(rd.it.context)}</p></div>
            </div>`).join("")}</div>
          <div class="tf-actions"><button class="btn" id="ws-again">Play again</button><button class="btn ghost" id="ws-home">Home</button></div>
        </div>`;
      root.querySelector("#ws-again").addEventListener("click", () => route("whosaid"));
      root.querySelector("#ws-home").addEventListener("click", () => route("home"));
    }
  };

  /* ============================================================
     PAGE: TIMELINE (daily chronological-ordering game)
     ============================================================ */
  function chronoYear(c) {
    const y = cardStartYear(c);   // honour the manual chronology override; include BCE / ancient cards, not just 1500–2099 CE
    return y ? y : null;          // 0 = timeless → excluded from the puzzle
  }
  function chronoPool() {
    return CARDS.map((c) => ({ id: c.id, name: c.answerText, year: chronoYear(c) })).filter(
      (x) => x.year != null && x.name
    );
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seededShuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function dailyChronoSet(n) {
    const rng = mulberry32(hashStr("chrono-" + todayStr()));
    const shuffled = seededShuffle(chronoPool(), rng);
    const chosen = [], years = new Set();
    for (const x of shuffled) {
      if (!years.has(x.year)) { chosen.push(x); years.add(x.year); }
      if (chosen.length >= n) break;
    }
    return chosen;
  }
  function chronoAfterEl(container, y) {
    const els = [...container.querySelectorAll(".chrono-item:not(.dragging)")];
    let closest = { offset: -Infinity, el: null };
    els.forEach((c) => {
      const b = c.getBoundingClientRect();
      const o = y - b.top - b.height / 2;
      if (o < 0 && o > closest.offset) closest = { offset: o, el: c };
    });
    return closest.el;
  }
  function setupChronoDrag(listEl, onChange) {
    let dragging = null;
    listEl.querySelectorAll(".chrono-item").forEach((item) => {
      const grip = item.querySelector(".ci-grip");
      grip.addEventListener("pointerdown", (e) => {
        dragging = item; item.classList.add("dragging");
        try { grip.setPointerCapture(e.pointerId); } catch (x) {}
        e.preventDefault();
      });
      grip.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const after = chronoAfterEl(listEl, e.clientY);
        if (after == null) listEl.appendChild(dragging);
        else listEl.insertBefore(dragging, after);
      });
      const end = () => { if (dragging) { dragging.classList.remove("dragging"); dragging = null; onChange && onChange(); } };
      grip.addEventListener("pointerup", end);
      grip.addEventListener("pointercancel", end);
    });
  }

  PAGES.chrono = function (root) {
    detachKeys();
    const N = 5;
    const set = dailyChronoSet(N);
    if (set.length < N) {
      root.innerHTML = emptyPlacard("Timeline isn't ready", "序", "There aren't enough dated cards to build today's puzzle yet.", () => route("home"), "Back home");
      return;
    }
    const byId = {}; set.forEach((x) => (byId[x.id] = x));
    const correctIndex = {};
    set.slice().sort((a, b) => a.year - b.year).forEach((x, i) => (correctIndex[x.id] = i));

    const orderRng = mulberry32(hashStr("chrono-order-" + todayStr()));
    let order = seededShuffle(set, orderRng).map((x) => x.id);
    if (order.every((id, i) => correctIndex[id] === i)) order.reverse();

    let checked = false;
    render();

    function itemHTML(id) {
      const x = byId[id];
      return `<div class="chrono-item" data-id="${esc(id)}">
        <span class="ci-grip" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg></span>
        <span class="ci-name">${esc(x.name)}</span>
        <span class="ci-year"></span>
        <div class="ci-arrows">
          <button class="ci-up" aria-label="Move earlier"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg></button>
          <button class="ci-dn" aria-label="Move later"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>
        </div>
      </div>`;
    }
    function render() {
      const best = S.chrono && S.chrono.date === todayStr() ? S.chrono.best : 0;
      root.innerHTML = `
        <div class="chrono-shell">
          <div class="page-head" style="margin-bottom:14px">
            <span class="eyebrow">Daily puzzle</span>
            <h1>Timeline</h1>
            <p>Put these events in chronological order — earliest at the top.${best ? ` Today's best: <b>${best}/${N}</b>.` : ""}</p>
          </div>
          <div class="chrono-scale"><span>Earliest</span><span>Latest</span></div>
          <div class="chrono-list" id="chrono-list">${order.map(itemHTML).join("")}</div>
          <div class="chrono-actions">
            <button class="btn" id="chrono-check">Check order</button>
            <button class="btn ghost" id="chrono-home">Back home</button>
          </div>
          <div class="chrono-result" id="chrono-result"></div>
        </div>`;
      wire();
    }
    function clearMarks() {
      if (!checked) return;
      checked = false;
      root.querySelectorAll(".chrono-item").forEach((el) => {
        el.classList.remove("correct", "wrong");
        el.querySelector(".ci-year").textContent = "";
      });
      const res = root.querySelector("#chrono-result");
      if (res) { res.className = "chrono-result"; res.innerHTML = ""; }
      const btn = root.querySelector("#chrono-check");
      if (btn) btn.textContent = "Check order";
    }
    function move(item, dir) {
      const list = item.parentElement;
      if (dir < 0 && item.previousElementSibling) list.insertBefore(item, item.previousElementSibling);
      else if (dir > 0 && item.nextElementSibling) list.insertBefore(item.nextElementSibling, item);
      clearMarks();
    }
    function wire() {
      root.querySelectorAll(".chrono-item").forEach((item) => {
        item.querySelector(".ci-up").addEventListener("click", () => move(item, -1));
        item.querySelector(".ci-dn").addEventListener("click", () => move(item, 1));
      });
      setupChronoDrag(root.querySelector("#chrono-list"), clearMarks);
      root.querySelector("#chrono-check").addEventListener("click", check);
      root.querySelector("#chrono-home").addEventListener("click", () => route("home"));
    }
    function check() {
      const ord = [...root.querySelectorAll(".chrono-item")].map((el) => el.dataset.id);
      let score = 0;
      ord.forEach((id, i) => {
        const el = root.querySelector(`.chrono-item[data-id="${id}"]`);
        const ok = correctIndex[id] === i;
        if (ok) score++;
        el.classList.toggle("correct", ok);
        el.classList.toggle("wrong", !ok);
        el.querySelector(".ci-year").textContent = chronoLabel(byId[id].year);
      });
      checked = true;
      const solved = score === N;
      if (!S.chrono || S.chrono.date !== todayStr()) S.chrono = { date: todayStr(), best: 0, plays: 0, solved: false };
      S.chrono.plays++;
      S.chrono.best = Math.max(S.chrono.best, score);
      S.chrono.solved = S.chrono.solved || solved;
      markGamePlayed("chrono", solved);
      save();
      checkAchievements();
      const res = root.querySelector("#chrono-result");
      res.className = "chrono-result show" + (solved ? " win" : "");
      res.innerHTML = solved
        ? `<div class="cr-title">Solved — perfect order!</div><div class="cr-sub">All ${N} events placed correctly. A fresh set arrives tomorrow.</div>`
        : `<div class="cr-title">${score} / ${N} in the right place</div><div class="cr-sub">Green rows sit correctly. Move the rest and check again.</div>`;
      root.querySelector("#chrono-check").textContent = "Check again";
    }
  };

  /* ============================================================
     PAGE: MAP (placeholder)
     ============================================================ */
  // the largest-ring bbox centre of a country in world.js — used as the Atlas "home" location. Module-level so both the Atlas
  // (its initial view) and Settings (the home-location picker) can compute it.
  function countryCenter(name) {
    const g = (window.WORLD_GEO || []).find((c) => c.n === name);
    if (!g || !g.p || !g.p.length) return null;
    let big = g.p[0]; for (let i = 1; i < g.p.length; i++) if (g.p[i].length > big.length) big = g.p[i];   // largest ring = the mainland, so far-flung island territories don't skew the centre
    let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    for (let i = 0; i < big.length; i++) { const p = big[i]; if (p[0] < minx) minx = p[0]; if (p[0] > maxx) maxx = p[0]; if (p[1] < miny) miny = p[1]; if (p[1] > maxy) maxy = p[1]; }
    return { lon: (minx + maxx) / 2, lat: (miny + maxy) / 2 };
  }
  // the globe's rotation + zoom persist across map setups, so a mid-interaction re-render doesn't reset the zoom to 1. The INITIAL
  // centre is the scholar's home location (Settings → Home location; the Netherlands by default).
  const _home = (S.settings && S.settings.home) || null;
  const atlasView = { rotLon: _home && isFinite(_home.lon) ? _home.lon : 90, rotLat: _home && isFinite(_home.lat) ? _home.lat : 22, zoom: 1 };
  PAGES.map = function (root) {
    const MINY = -1000, MAXY = new Date().getFullYear();
    const chevL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    const chevR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    const ticks = [
      { y: -1000, t: "1000 BCE" }, { y: 1, t: "1 CE" }, { y: 1000, t: "1000 CE" }, { y: MAXY, t: "present" },
    ];
    const tickHTML = ticks.map((k) => {
      const f = ((k.y - MINY) / (MAXY - MINY)) * 100;
      return `<span class="tl-tick" style="left:${f}%">${k.t}</span>`;
    }).join("");

    root.innerHTML = `
      <div class="atlas">
        <div class="globe-stage" id="globeStage">
          <canvas id="globe"></canvas>
          <div class="atlas-wip" id="atlasWip" role="status" aria-live="polite">
            <strong>No map for this year yet</strong>
            <span>The Atlas is a work in progress — so far only the present-day map (${MAXY} CE) has been drawn. Slide the timeline back to the present year to return to a map.</span>
          </div>
          <div class="globe-hint">Drag to rotate · scroll or +/− to zoom · v12</div>
          <div class="globe-legend" id="globeLegend" role="group" aria-labelledby="legendTitle">
            <div class="legend-head" id="legendHead">
              <span class="legend-title" id="legendTitle">Legend</span>
              <button class="legend-collapse" id="legendCollapse" type="button" aria-label="Collapse legend" aria-expanded="true">–</button>
            </div>
            <div class="legend-body" id="legendBody">
              <label class="legend-row"><input type="checkbox" id="bordersToggle" checked><span>Borders</span></label>
              <label class="legend-row"><input type="checkbox" id="countryToggle"><span>Country names</span></label>
              <label class="legend-row"><input type="checkbox" id="citiesToggle" checked><span>Capitals</span></label>
              <label class="legend-row"><input type="checkbox" id="majorToggle"><span>Cities</span></label>
              <label class="legend-row"><input type="checkbox" id="heightmapToggle"><span>Heightmap</span></label>
              <label class="legend-row"><input type="checkbox" id="riversToggle"><span>Rivers</span></label>
              <label class="legend-row"><input type="checkbox" id="riverLabelsToggle"><span>River labels</span></label>
              <label class="legend-row"><input type="checkbox" id="waterToggle"><span>Water</span></label>
            </div>
          </div>
          <div class="map-edit-bar" id="mapEditBar" hidden>
            <span class="meb-title">Editing <b id="mebYear"></b></span>
            <div class="meb-tools">
              <button class="meb-tool sel" type="button" data-tool="select">Select</button>
              <button class="meb-tool" type="button" data-tool="draw">Draw</button>
              <button class="meb-tool" type="button" data-tool="city">City</button>
              <button class="meb-tool" type="button" data-tool="capital">Capital</button>
            </div>
            <span class="meb-tip" id="mebTip"></span>
            <div class="meb-acts">
              <button class="meb-act" type="button" id="mebFinish" hidden>Finish polygon</button>
              <button class="meb-act danger" type="button" id="mebDelTerr" disabled>Delete territory</button>
              <button class="meb-done" type="button" id="mebDone">Done</button>
            </div>
          </div>
          <div class="country-pop" id="countryPop" hidden role="status" aria-live="polite">
            <button class="cp-close" id="cpClose" type="button" aria-label="Close">×</button>
            <div class="cp-cols">
              <div class="cp-main">
                <div class="cp-name" id="cpName"></div>
                <div class="cp-span" id="cpSpan"></div>
                <div class="cp-desc" id="cpDesc"></div>
              </div>
              <div class="cp-year">
                <div class="cp-year-num" id="cpYearNum"></div>
                <div class="cp-year-desc" id="cpYearDesc"></div>
              </div>
              <div class="cp-stats">
                <div class="cp-tile"><span class="cp-k">Population</span><span class="cp-v" id="cpPop" tabindex="0" data-tip="Source: Wikidata">—</span></div>
                <div class="cp-tile"><span class="cp-k">Area</span><span class="cp-v" id="cpArea" tabindex="0" data-tip="Source: Wikidata">—</span></div>
                <div class="cp-tile"><span class="cp-k">GDP</span><span class="cp-v" id="cpGdp" tabindex="0" data-tip="Source: Wikidata">—</span></div>
                <div class="cp-tile"><span class="cp-k">GDP / capita</span><span class="cp-v" id="cpGdppc" tabindex="0" data-tip="Calculated: GDP ÷ Population">—</span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="atlas-timebar">
          <div class="atlas-timeline">
            <div class="tl-track" id="tlTrack">
              <div class="tl-rail"></div>
              <div class="tl-fill" id="tlFill"></div>
              <button class="tl-pin" id="tlPin" aria-label="Drag to choose a year"><span class="tl-tip" id="tlTip"></span></button>
            </div>
            <div class="tl-ticks">${tickHTML}</div>
          </div>
          <div class="atlas-yearbox">
            <button class="ay-chev" id="ayPrev" type="button" aria-label="Previous mapped year">${chevL}</button>
            <div class="ay-display"><span class="ay-num" id="ayNum">—</span><span class="ay-era" id="ayEra"></span></div>
            <button class="ay-chev" id="ayNext" type="button" aria-label="Next mapped year">${chevR}</button>
          </div>
        </div>
      </div>`;

    /* ---------- colors from the active theme (re-read on light/night switch) ---------- */
    function hex2rgb(h) { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    function mix(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`; }
    function rgba(a, al) { const A = hex2rgb(a); return `rgba(${A[0]},${A[1]},${A[2]},${al})`; }
    let ocean, land, landWild, border, grat, rim, labelFont, riverCol, adminCol, rangeCol, waterCol, lblHaloSoft, LBL_TEXT, LBL_HALO, forestCol, forestColD, forestColT;
    function readColors() {
      const cs = getComputedStyle(document.body);
      const cv = (n) => cs.getPropertyValue(n).trim() || "#888888";
      const ink = cv("--ink"), paper = cv("--paper"), paper2 = cv("--paper-2"), indigo = cv("--indigo");
      const L = hex2rgb(paper), dark = (L[0] * 0.299 + L[1] * 0.587 + L[2] * 0.114) < 128;
      ocean = dark ? mix(paper2, indigo, 0.30) : "#b3ebff";   // bright cyan ocean in light mode
      land = mix(paper, ink, 0.10); border = mix(paper, ink, 0.46); grat = rgba(ink, 0.07); rim = mix(paper, ink, 0.32);
      // subtly darker shade for non-clickable / unclaimed land on historical eras — a gentle luminance drop.
      // (land is already an "rgb(r,g,b)" string, so parse+scale rather than mix(), whose hex2rgb can't read it.)
      { const lm = /(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(land); const f = 0.62; landWild = lm ? "rgb(" + Math.round(lm[1] * f) + "," + Math.round(lm[2] * f) + "," + Math.round(lm[3] * f) + ")" : land; }
      riverCol = ocean;                                                          // rivers drawn in the ocean colour, so they read as water continuous with the sea
      waterCol = dark ? "rgba(150,196,226,0.92)" : "rgba(18,74,118,0.82)";        // sea / ocean / lake labels (reads on the cyan ocean)
      lblHaloSoft = dark ? "rgba(8,12,20,0.82)" : "rgba(255,255,255,0.92)";       // halo for the light-coloured labels (water/river/range): dark in dark mode so the glyph reads
      adminCol = rgba(ink, 0.34);                                                 // admin-1 borders (dotted)
      rangeCol = dark ? "rgba(196,176,154,0.95)" : "rgba(122,86,54,0.92)";        // mountain ranges (peaks + labels)
      forestCol = dark ? "rgba(120,178,128,0.9)" : "rgba(46,110,60,0.85)";        // broadleaf trees (medium green)
      forestColD = dark ? "rgba(96,158,116,0.92)" : "rgba(28,92,58,0.88)";        // conifer trees (deep green)
      forestColT = dark ? "rgba(126,196,120,0.9)" : "rgba(36,124,74,0.85)";       // tropical trees (rich green)
      LBL_TEXT = dark ? "#ffffff" : "#221808"; LBL_HALO = dark ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.92)";   // country/city/river labels — night: white text + black outline; day: dark text + white outline
      labelFont = cv("--sans") || "system-ui, sans-serif";
    }
    readColors();
    // bright highlight + label colours for hover/selection (fixed so they pop on every theme)
    const HI_EDGE = "rgba(150,72,0,0.92)";
    const CITY_DOT = "#c8453c", CITY_RING = "rgba(255,255,255,0.92)", CITY_LEAD = "rgba(200,69,60,0.5)", CITY_HOLLOW = "#ffffff";

    /* ---------- globe ---------- */
    const TAU = Math.PI * 2, DEG = Math.PI / 180;
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const wrap = (d) => ((d + 180) % 360 + 360) % 360 - 180;
    const GEO = window.WORLD_GEO || [];
    let hoverIdx = -1;
    const selSet = new Set();            // multi-select: indices of chosen countries (era territories, or present-day countries)
    let subSelGeo = -1;                  // double-click drill-down inside a historical era: index of a present-day country picked WITHIN a larger era entity (a "country that is part of another"); -1 = none
    // UK constituent countries (England / Scotland / Wales / Northern Ireland; + Ireland, the whole island, for the pre-1922
    // all-Ireland UK), from uk.js. Their internal land borders (England–Scotland, England–Wales) draw light, and double-clicking
    // the UK drills into the constituent under the cursor.
    const UK = window.UK_SUBUNITS || [];
    const UKBB = UK.map((s) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const r of s.p) for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1]; });
    let subSelUK = [];                    // indices into UK currently highlighted (a drilled constituent; ≥1 entry for the pre-1922 all-Ireland selection)
    const UK_DESC = {
      "england": "England is the largest and most populous of the four constituent countries of the United Kingdom, occupying the southern and central two-thirds of the island of Great Britain. Its capital, London, is also the capital of the United Kingdom. Unlike Scotland, Wales and Northern Ireland it has no devolved legislature of its own, being governed directly by the UK Parliament at Westminster.",
      "scotland": "Scotland is a constituent country of the United Kingdom occupying the northern third of Great Britain, with Edinburgh as its capital and Glasgow its largest city. An independent kingdom until the 1707 Union with England, it retains its own legal and education systems and, since 1999, a devolved parliament at Holyrood. Its territory includes nearly 800 islands across the Hebrides, Orkney and Shetland.",
      "wales": "Wales is a constituent country of the United Kingdom on the western side of Great Britain, with Cardiff as its capital. Incorporated into the English realm by the Laws in Wales Acts of the 16th century, it gained a devolved parliament, the Senedd, in 1999. The Welsh language, a Celtic tongue, has official status alongside English.",
      "northern ireland": "Northern Ireland is a constituent country of the United Kingdom in the northeast of the island of Ireland, with Belfast as its capital. It was formed in 1921 when Ireland was partitioned and its six northeastern counties remained within the UK. Since the 1998 Good Friday Agreement it has had a devolved power-sharing assembly."
    };
    let lastTapT = 0, lastTapX = 0, lastTapY = 0, tapCount = 0;   // multi-tap detection on the globe (1 = single, 2 = double, 3 = triple)
    // On a historical GEO era a SINGLE click selects the whole empire and names it as an EMPIRE (mother "United Kingdom" → the
    // "British Empire"), not the sovereign country. Mothers already named as a state/empire (Ottoman Empire, Russian Empire, USSR,
    // Empire of Japan, Austria Hungary …) map to themselves. Descriptions for these names live in countries.js.
    const EMPIRE_NAME = { "United Kingdom": "British Empire", "France": "French colonial empire", "Germany": "German colonial empire", "Italy": "Italian colonial empire", "Netherlands": "Dutch colonial empire", "Portugal": "Portuguese Empire", "Spain": "Spanish Empire", "Belgium": "Belgian colonial empire", "Denmark": "Danish Realm", "Chinese Warlords": "Warlord-era China", "United States": "United States of America" };
    const empireName = (mother) => EMPIRE_NAME[mother] || mother;
    let cpEl = null, cpNameEl = null, cpSpanEl = null, cpDescEl = null, cpYearNumEl = null, cpYearDescEl = null, cpPopEl = null, cpAreaEl = null, cpGdpEl = null, cpGdppcEl = null;   // the country info popup (one at a time, above the timeline)
    function entityName(idx) { const ht = histTerr(), terr = ht || GEO; return (idx >= 0 && idx < terr.length) ? (terr[idx].n || "") : ""; }
    function countryDesc(name) { const k = (name || "").trim().toLowerCase().replace(/\s+/g, " "); return (window.COUNTRY_INFO || {})[k] || UK_DESC[k] || ""; }
    function countryStats(name) { const k = (name || "").trim().toLowerCase().replace(/\s+/g, " "); return (window.COUNTRY_STATS || {})[k] || null; }
    function countryStatsYear(name, yr) { const k = (name || "").trim().toLowerCase().replace(/\s+/g, " "); const o = (window.COUNTRY_STATS_YEARS || {})[k]; return (o && o[String(yr)]) || null; }   // per-state, per-year figures for a HISTORICAL map-year ({pop, area, gdp}); null → dash
    function countrySpan(name) { const k = (name || "").trim().toLowerCase().replace(/\s+/g, " "); return (window.COUNTRY_SPANS || {})[k] || ""; }   // the years this state/iteration existed, e.g. "1815 – Present" — shown thin/grey under the title
    // parse a formatted stat string ("41.45 million", "49,710", "$20.5B", "$709M") to a raw number, or NaN
    function statNum(s) {
      if (!s) return NaN; const t = String(s).toLowerCase().replace(/[$,]/g, "").trim();
      const m = /^([\d.]+)\s*(trillion|t|billion|b|million|m|thousand|k)?/.exec(t); if (!m) return NaN;
      let v = parseFloat(m[1]); if (isNaN(v)) return NaN;
      const u = m[2] || ""; v *= u === "trillion" || u === "t" ? 1e12 : u === "billion" || u === "b" ? 1e9 : u === "million" || u === "m" ? 1e6 : u === "thousand" || u === "k" ? 1e3 : 1;
      return v;
    }
    function countryYear(name, yr) { const k = (name || "").trim().toLowerCase().replace(/\s+/g, " "); const o = (window.COUNTRY_YEARS || {})[k]; return (o && o[String(yr)]) || ""; }   // a per-state, per-year paragraph (window.COUNTRY_YEARS[name][year]); "" → the popup shows a dash
    function officialName(shortName, desc) {   // the state's full legal name from the summary — else the short name
      desc = desc || "";
      let m = /\bofficially\s+(?:the\s+|known\s+as\s+|called\s+)?(.+?)\s*[,(.;:]/i.exec(desc);   // "X, officially the Y, …"
      if (m && m[1]) { const o = m[1].trim().replace(/^the\s+/i, ""); if (o.length >= 3 && o.length <= 80) return o; }
      // leading full name before ", commonly/also/sometimes known as …" (e.g. "The United Kingdom of Great Britain and Northern Ireland, commonly known as …")
      m = /^(?:The\s+)?(.+?),\s+(?:commonly|also|sometimes|formally|or\s+simply|or)\s+(?:known\s+as|called)?/i.exec(desc);
      if (m && m[1]) { const o = m[1].trim().replace(/^the\s+/i, ""), sn = (shortName || "").toLowerCase();
        const looksOfficial = o.toLowerCase().indexOf(sn) >= 0 || /\b(Republic|Kingdom|Union|Federation|Emirates|States|Commonwealth|Empire|Sultanate|Principality|Confederation|Dominion)\b/i.test(o);
        if (o.length >= 5 && o.length <= 80 && o.toLowerCase() !== sn && looksOfficial) return o;
      }
      return shortName;
    }
    // strip noise the popup duplicates elsewhere: parenthetical translations ("(German: Deutschland)") and any sentence that
    // quotes the figures already shown in the Population/Area/GDP grid — keeps the prose about the place, not its statistics.
    function stripInfoNoise(s) {
      if (!s) return "";
      s = s.replace(/\s*\([^)]*:[^)]*\)/g, "");   // drop "(Language: name)" / "(label: value)" parentheticals
      const parts = s.split(/(?<=[.!?])\s+/);
      // strip a sentence only when it quotes an ACTUAL number-grid figure — money, a population/GDP count in
      // millions/billions, or an area in km²/sq mi. Matching the bare WORDS "population"/"GDP" (as it used to) wrongly
      // dropped figure-free general sentences ("most of the population lives on the coast", "UN Conference on Population").
      const grid = /[$€£]\s?\d|\d[\d.,]*\s*(?:million|billion|trillion)\b|\d[\d.,]*\s*(?:km²|km2|sq\.?\s?mi|sq\.?\s?km|square\s?kilomet|square\s?mile)/i;
      const kept = parts.filter((t) => !grid.test(t));
      return (kept.length ? kept.join(" ") : s).replace(/\s{2,}/g, " ").trim();
    }
    function showCountryPopup(idx) { showCountryPopupName(entityName(idx)); }
    function showCountryPopupName(name, forceGeneral) {   // populate the info popup from a place name (era entity, a drilled present-day country, or — forceGeneral — a UK constituent shown with its general description)
      if (!cpEl) return;
      if (!name) { hideCountryPopup(); return; }
      const present = !!(activeEra(year) || {}).present;
      const desc = countryDesc(name), yd = countryYear(name, year);   // present-day summary + the per-year paragraph for THIS map-year
      // Title: the state's full legal official name (extracted from the summary's "officially …"), else its name. Main paragraph:
      // a GENERAL description of the state — constant across years (keyed by the entity's name; it only differs when the name does)
      // and free of any figure already shown in the number grid. Middle column: the state/events in THIS specific map-year.
      // forceGeneral (a UK constituent): just its name + its general description, no year paragraph or stats.
      cpNameEl.textContent = forceGeneral ? name : officialName(name, desc);
      if (cpSpanEl) cpSpanEl.textContent = forceGeneral ? "" : countrySpan(name);   // the years this state/iteration existed (thin grey under the title); "" → the line collapses
      const mainDesc = stripInfoNoise(desc);
      cpDescEl.textContent = mainDesc || ("No description for " + name + " yet.");
      if (mainDesc) { autoLinkGlossary(cpDescEl, name, []); setupTooltips(cpDescEl); }   // auto-link glossary terms (skip the place's own name), like card backgrounds
      cpYearNumEl.textContent = year < 0 ? (-year) + " BCE" : year + " CE";
      const colDesc = forceGeneral ? "" : stripInfoNoise(yd);   // the per-year paragraph for THIS map-year (the general description above stays constant)
      cpYearDescEl.textContent = colDesc || "—";
      if (colDesc) { autoLinkGlossary(cpYearDescEl, name, []); setupTooltips(cpYearDescEl); }
      const st = forceGeneral ? null : (present ? countryStats(name) : countryStatsYear(name, year));   // present-day figures at the present year; per-year figures (COUNTRY_STATS_YEARS) for a historical map-year
      // Each tile shows ONLY the bare figure; any parenthetical nuance/source ("(1800 census)", "(1990 int$, Maddison)", a
      // breakdown, …) moves into the hover "Source" bubble, so the grid stays clean and the detail is one hover away.
      const baseTip = present ? "Source: Wikidata" : "Source: historical estimate";
      const setStat = (el, val) => {
        const v = (val == null ? "" : String(val)).trim();
        if (!v || v === "—") { el.textContent = "—"; el.setAttribute("data-tip", baseTip); return; }
        const pi = v.indexOf("(");
        if (pi >= 0) { const num = v.slice(0, pi).trim(), nu = v.slice(pi + 1).replace(/\)\s*$/, "").trim();
          el.textContent = num || "—"; el.setAttribute("data-tip", nu ? nu + "\n" + baseTip : baseTip); }   // nuance on top, the actual source below
        else { el.textContent = v; el.setAttribute("data-tip", baseTip); }
      };
      setStat(cpPopEl, st && st.pop);
      setStat(cpAreaEl, st && st.area);
      setStat(cpGdpEl, st && st.gdp);
      const popN = st ? statNum(st.pop) : NaN, gdpN = st ? statNum(st.gdp) : NaN;   // GDP / capita is computed from GDP ÷ Population (statNum reads the leading figure, ignoring any parenthetical)
      cpGdppcEl.textContent = (popN > 0 && gdpN > 0) ? "$" + Math.round(gdpN / popN).toLocaleString("en-US") : "—";
      cpEl.hidden = false;
    }
    function hideCountryPopup() { if (cpEl) cpEl.hidden = true; }

    // ===== Map editor (Edit → Timeline → "Edit on globe"): draw/edit/delete territories + place capitals & cities, per year =====
    let mapEdit = false, mapEditEra = null, mapTool = "select", mapSelTerr = -1, mapSelCity = -1, mapDraw = null, mapEditRev = 0, mapBar = null, mapDragV = -1, mapDragCity = -1, mapDragging = false;
    function mapBump() { mapEditRev++; _htId = null; persistTimeline(); scheduleDraw(); }   // an edit changed the era → re-render + rebuild histTerr's bbox/matte caches (keyed by era.id, which doesn't change in-place) + persist
    function enterMapEdit(era) {
      // a merger-only era stores only a grouping (no editable geometry) — materialize world.js-derived rings (deep-copied so
      // edits never mutate GEO) so it can be hand-edited; it then becomes a normal geo-based era.
      if (era.groups && (!era.geo || !era.geo.length)) { era.geo = synthGroups(era).map((t) => ({ n: t.n, p: t.p.map((r) => r.map((pt) => [pt[0], pt[1]])), c: t.c.slice() })); delete era.groups; _htId = null; }
      mapEditEra = era; mapEdit = true; mapTool = "select"; mapSelTerr = -1; mapSelCity = -1; mapDraw = null;
      if (!era.cities) era.cities = [];
      if (WB.enabled) { WB.enabled = false; if (typeof applyWBState === "function") applyWBState(); }   // whiteboard + map-edit can't both own the pointer
      year = clamp(Math.round(era.year), MINY, MAXY); _lastEraId = "__edit"; hideCountryPopup(); selSet.clear(); hoverIdx = -1; paintYear();
      if (mapBar) { mapBar.hidden = false; const yl = mapBar.querySelector("#mebYear"); if (yl) yl.textContent = (era.n ? era.n + " · " : "") + eraYearLabel(era.year); }
      mapUpdateBar(); scheduleDraw();
    }
    function exitMapEdit() { mapEdit = false; mapEditEra = null; mapSelTerr = -1; mapSelCity = -1; mapDraw = null; _htId = null; if (mapBar) mapBar.hidden = true; scheduleDraw(); }
    function mapSetTool(t) { mapTool = t; if (t !== "draw") mapDraw = null; mapUpdateBar(); scheduleDraw(); }
    function mapUpdateBar() {
      if (!mapBar) return;
      mapBar.querySelectorAll(".meb-tool").forEach((b) => b.classList.toggle("sel", b.dataset.tool === mapTool));
      const del = mapBar.querySelector("#mebDelTerr"); if (del) { del.disabled = !(mapTool === "select" && (mapSelTerr >= 0 || mapSelCity >= 0)); del.textContent = mapSelCity >= 0 ? "Delete place" : "Delete territory"; }
      const fin = mapBar.querySelector("#mebFinish"); if (fin) fin.hidden = !(mapTool === "draw" && mapDraw && mapDraw.length >= 3);
      const tip = mapBar.querySelector("#mebTip");
      if (tip) tip.textContent = mapTool === "draw" ? "Tap to drop points, then Finish polygon" : (mapTool === "city" || mapTool === "capital") ? "Tap the globe to place a " + mapTool : "Tap a territory or place to select; drag the globe to rotate";
    }
    function mapTerrAt(px, py) {   // index of the era territory under a screen point (smallest bbox wins), or -1
      const ll = screenToLonLat(px, py); if (!ll || !mapEditEra) return -1; const lon = ll[0], lat = ll[1], eg = mapEditEra.geo || [];
      let best = -1, ba = Infinity;
      for (let i = 0; i < eg.length; i++) { const rings = eg[i].p || []; if (!pointInRings(rings, lon, lat)) continue;
        let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (let r = 0; r < rings.length; r++) { const ring = rings[r]; for (let k = 0; k < ring.length; k++) { const a = ring[k]; if (a[0] < x0) x0 = a[0]; if (a[0] > x1) x1 = a[0]; if (a[1] < y0) y0 = a[1]; if (a[1] > y1) y1 = a[1]; } }
        const ar = (x1 - x0) * (y1 - y0); if (ar < ba) { ba = ar; best = i; } }
      return best;
    }
    function mapCityAt(px, py) {   // index of the era city whose marker is within ~11px of the point, or -1
      if (!mapEditEra) return -1; const cs = mapEditEra.cities || []; let best = -1, bd = 11 * 11;
      for (let i = 0; i < cs.length; i++) { proj(cs[i].lon, cs[i].lat); if (PV < 0) continue; const dx = PX - px, dy = PY - py, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
      return best;
    }
    function mapTapSelect(px, py) {
      if (!mapEditEra) return;
      if (mapTool === "draw") { const ll = screenToLonLat(px, py); if (ll) { (mapDraw = mapDraw || []).push([ll[0], ll[1]]); mapUpdateBar(); scheduleDraw(); } return; }
      if (mapTool === "city" || mapTool === "capital") { const ll = screenToLonLat(px, py); if (!ll) return; const cap = mapTool === "capital";
        inlinePrompt(cap ? "Capital name:" : "City name:", "", (nm) => { nm = (nm || "").trim(); if (!nm) return; mapEditEra.cities = mapEditEra.cities || []; mapEditEra.cities.push({ n: nm, lon: +ll[0].toFixed(2), lat: +ll[1].toFixed(2), cap: cap }); mapBump(); }); return; }
      const ci = mapCityAt(px, py);   // select tool: pick a place (preferred) or a territory
      if (ci >= 0) { mapSelCity = ci; mapSelTerr = -1; } else { mapSelTerr = mapTerrAt(px, py); mapSelCity = -1; }
      mapUpdateBar(); scheduleDraw();
    }
    function mapDeleteSelected() {
      if (!mapEditEra) return;
      if (mapSelCity >= 0) { (mapEditEra.cities || []).splice(mapSelCity, 1); mapSelCity = -1; }
      else if (mapSelTerr >= 0) { (mapEditEra.geo || []).splice(mapSelTerr, 1); mapSelTerr = -1; }
      else return;
      mapUpdateBar(); mapBump();
    }
    function mapFinishDraw() {
      if (!mapDraw || mapDraw.length < 3) return;
      const ring = mapDraw.map((p) => [+p[0].toFixed(2), +p[1].toFixed(2)]); mapDraw = null;
      ring.push([ring[0][0], ring[0][1]]);   // close the ring (first == last) so the renderer's i+1<len loop strokes the closing edge

      inlinePrompt("Name this territory:", "", (nm) => {
        mapEditEra.geo = mapEditEra.geo || []; mapEditEra.geo.push({ n: (nm || "").trim(), p: [ring] });
        mapSelTerr = mapEditEra.geo.length - 1; mapSetTool("select"); mapBump();
      });
    }
    function mapVertexAt(px, py) {   // index of a vertex of the selected territory's outer ring near the point, or -1
      if (mapSelTerr < 0 || !mapEditEra) return -1; const eg = mapEditEra.geo || []; if (mapSelTerr >= eg.length) return -1;
      const ring = (eg[mapSelTerr].p || [])[0] || []; let best = -1, bd = 10 * 10;
      for (let k = 0; k < ring.length; k++) { proj(ring[k][0], ring[k][1]); if (PV < 0) continue; const dx = PX - px, dy = PY - py, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = k; } }
      return best;
    }
    function mapEditPointerDown(e) {   // start dragging a vertex (reshape) or a place (move); returns true if it consumed the event
      if (mapTool !== "select") return false;
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      const vi = mapVertexAt(px, py); if (vi >= 0) { mapDragV = vi; mapDragCity = -1; mapDragging = true; return true; }
      const ci = mapCityAt(px, py); if (ci >= 0) { mapSelCity = ci; mapSelTerr = -1; mapDragCity = ci; mapDragV = -1; mapDragging = true; mapUpdateBar(); scheduleDraw(); return true; }
      return false;
    }
    function mapEditPointerMove(e) {
      const r = canvas.getBoundingClientRect(), ll = screenToLonLat(e.clientX - r.left, e.clientY - r.top); if (!ll) return;
      if (mapDragV >= 0) { const ring = ((mapEditEra.geo[mapSelTerr] || {}).p || [])[0]; if (ring && ring[mapDragV]) { ring[mapDragV][0] = +ll[0].toFixed(2); ring[mapDragV][1] = +ll[1].toFixed(2); } }
      else if (mapDragCity >= 0) { const c = (mapEditEra.cities || [])[mapDragCity]; if (c) { c.lon = +ll[0].toFixed(2); c.lat = +ll[1].toFixed(2); } }
      scheduleDraw();
    }
    function mapEditPointerUp() { if (!mapDragging) return; mapDragging = false; mapDragV = -1; mapDragCity = -1; mapBump(); }
    function drawEraCities(era, editable) {   // place markers (+ labels when zoomed) for an era's capitals/cities
      const cs = era.cities || []; if (!cs.length) return;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
      const showLabels = zoom >= CAP_Z; const baseFs = clamp(10 + (zoom - 2) * 1.1, 10, 13.5); ctx.textAlign = "left"; ctx.textBaseline = "middle";   // same label sizing as the present-day map
      for (let i = 0; i < cs.length; i++) { const c = cs[i]; proj(c.lon, c.lat); if (PV < 0) continue; const sel = editable && i === mapSelCity;
        const tier = c.cap ? 0 : 1, dot = cityDot(tier);
        if (sel) { ctx.beginPath(); ctx.arc(PX, PY, dot + 0.6, 0, TAU); ctx.fillStyle = "rgba(255,176,38,1)"; ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = "rgba(0,0,0,0.55)"; ctx.stroke(); }
        else drawPin({ x: PX, y: PY, dot: dot, tier: tier });   // identical pin to the present-day map: vermilion CITY_DOT + white CITY_RING
        if (showLabels && c.n) { const fs = tier === 0 ? baseFs : baseFs - 1.5, g = dot + 4; ctx.font = (tier === 0 ? "600 " : "500 ") + fs + "px " + labelFont; ctx.fillStyle = LBL_TEXT; ctx.strokeStyle = LBL_HALO; ctx.lineWidth = 3; ctx.strokeText(c.n, PX + g, PY); ctx.fillText(c.n, PX + g, PY); }
      }
      ctx.restore();
    }
    function mapEditDraw() {
      if (!mapEditEra) return; const eg = mapEditEra.geo || [];
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); ctx.lineJoin = "round"; ctx.lineCap = "round";
      if (mapSelTerr >= 0 && mapSelTerr < eg.length) {   // selected territory: tinted fill + amber outline + vertex handles
        const rings = eg[mapSelTerr].p || [];
        ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], true); ctx.fillStyle = "rgba(255,176,38,0.20)"; ctx.fill("evenodd");
        ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], false); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,176,38,0.95)"; ctx.stroke();
        const ring = rings[0] || []; ctx.fillStyle = "#fff"; ctx.strokeStyle = "rgba(255,150,20,1)"; ctx.lineWidth = 1.4;
        for (let k = 0; k < ring.length; k++) { proj(ring[k][0], ring[k][1]); if (PV < 0) continue; ctx.beginPath(); ctx.arc(PX, PY, 3.4, 0, TAU); ctx.fill(); ctx.stroke(); }
      }
      if (mapDraw && mapDraw.length) {   // in-progress polygon
        ctx.beginPath(); for (let k = 0; k < mapDraw.length; k++) { proj(mapDraw[k][0], mapDraw[k][1]); if (k === 0) ctx.moveTo(PX, PY); else ctx.lineTo(PX, PY); } ctx.lineWidth = 2; ctx.strokeStyle = "rgba(110,200,255,0.95)"; ctx.stroke();
        ctx.fillStyle = "rgba(110,200,255,1)"; for (let k = 0; k < mapDraw.length; k++) { proj(mapDraw[k][0], mapDraw[k][1]); ctx.beginPath(); ctx.arc(PX, PY, 3, 0, TAU); ctx.fill(); }
      }
      ctx.restore();
      drawEraCities(mapEditEra, true);
    }
    let moving = false;                  // during drag / spin / zoom
    let bordersOn = true, citiesOn = true, majorCitiesOn = false, divCapsOn = false, riversOn = false, riverLabelsOn = false, waterOn = false, rangesOn = false, adminOn = false, countryNamesOn = false, forestsOn = false, heightmapOn = false;   // legend toggles (default: Borders + Capitals)
    // bounding cap (centroid unit vector + sin of max angular radius) of each country — robust to antimeridian / pole
    // spans (Russia, USA, Antarctica, Fiji) unlike a lon/lat bbox. Lets renderStatic skip fully off-view countries.
    function countryCap(c) {
      let sx = 0, sy = 0, sz = 0;
      for (let ri = 0; ri < c.p.length; ri++) { const ring = c.p[ri]; for (let pi = 0; pi < ring.length; pi++) { const pt = ring[pi], lo = pt[0] * DEG, la = pt[1] * DEG, cl = Math.cos(la); sx += cl * Math.cos(lo); sy += cl * Math.sin(lo); sz += Math.sin(la); } }
      const L = Math.hypot(sx, sy, sz) || 1, ux = sx / L, uy = sy / L, uz = sz / L;
      let minDot = 1;
      for (let ri = 0; ri < c.p.length; ri++) { const ring = c.p[ri]; for (let pi = 0; pi < ring.length; pi++) { const pt = ring[pi], lo = pt[0] * DEG, la = pt[1] * DEG, cl = Math.cos(la); const dt = ux * cl * Math.cos(lo) + uy * cl * Math.sin(lo) + uz * Math.sin(la); if (dt < minDot) minDot = dt; } }
      const ang = Math.acos(Math.max(-1, Math.min(1, minDot)));
      return [ux, uy, uz, Math.sin(Math.min(Math.PI / 2, ang))];
    }
    let _derived = GEO.__folioDerived;
    if (!_derived || !_derived.cap) {
      const bb = GEO.map((c) => { let a = 180, b = 90, d = -180, e = -90; for (let ri = 0; ri < c.p.length; ri++) { const ring = c.p[ri]; for (let pi = 0; pi < ring.length; pi++) { const pt = ring[pi]; if (pt[0] < a) a = pt[0]; if (pt[0] > d) d = pt[0]; if (pt[1] < b) b = pt[1]; if (pt[1] > e) e = pt[1]; } } return [a, b, d, e]; });
      _derived = GEO.__folioDerived = { bb, cap: GEO.map(countryCap) };
    }
    const BBOX = _derived.bb, CCAP = _derived.cap, VIS = new Uint8Array(GEO.length);
    // cull a country whose bounding cap is wholly behind the horizon, or wholly off one side of the viewport
    function cullHidden(p) {
      const o = CCAP[p], x = o[0], y = o[1], z = o[2], sr = o[3];
      if (x * Cx + y * Cy + z * Cz + sr < -0.1) return true;                  // cap entirely behind the horizon
      const px = cx + R * (x * Ex + y * Ey + z * Ez), py = cy - R * (x * Nx + y * Ny + z * Nz), rad = R * sr + 80;
      return px + rad < 0 || px - rad > W || py + rad < 0 || py - rad > H;     // cap entirely off-screen
    }
    const LAKES = window.LAKES || [];     // major inland seas & lakes (drawn as water on top of land — always shown)
    const RIVERS = window.RIVERS || [];   // [{ n, p:[ [ [lon,lat],... ] ] }] top rivers
    const RANGES = window.RANGES || [];   // [{ n, c:[lon,lat] label, k:[[lon,lat],...] peaks }] mountain ranges
    const FORESTS = window.FORESTS || []; // [{ n, c:[lon,lat] label, t:"conifer"|"broadleaf"|"tropical", k:[[lon,lat],...] land-only tree points }] the ~30 largest forests
    const WATER = window.WATER || [];     // [{ n, c:[lon,lat] label anchor, r:rank }] seas / oceans / straits / lakes
    // ===== Heightmap (terrain relief) — a physical layer, the SAME in every era. Reprojects a global equirectangular elevation
    // raster onto the orthographic globe, clipped to land, drawn SEMI-TRANSPARENT so it reads as relief shading over the map
    // (not a stark dark grayscale overlay). Two LOD levels, both LAZY-loaded: a base (z=5, 6144x3072, ~3.5 MB) fetched when the
    // layer is first enabled, and a sharper ULTRA (z=6, 10240x5120, ~8.9 MB) fetched only once zoomed in past HMULTRA_Z. The
    // per-pixel reprojection is expensive, so the caller runs it ONLY on the settled (!moving) static render, which is cached. =====
    const HM_LEVELS = {
      base: { src: "heightmap.js", vn: "HEIGHTMAP", gray: null, w: 0, h: 0, lo: 0, hi: 0, ready: false, loading: false },
      ultra: { src: "heightmap-ultra.js", vn: "HEIGHTMAP_ULTRA", gray: null, w: 0, h: 0, lo: 0, hi: 0, ready: false, loading: false },
    };
    const HMULTRA_Z = 4, HM_OPACITY = 0.82, HM_CONTRAST = 1.6;   // the sharper ultra level kicks in past this zoom; HM_OPACITY = strength of the relief, blended onto the map with an "overlay" composite (darks/lights modulate the map's colours); HM_CONTRAST expands the grey ramp around sea level so the relief reads with more punch
    let hmCv = null;
    function loadHeightmapLevel(L) {
      if (L.ready || L.loading) return; L.loading = true;
      const decode = () => { const HM = window[L.vn]; if (!HM || !HM.png) { L.loading = false; return; }
        L.w = HM.w; L.h = HM.h; L.lo = HM.lo; L.hi = HM.hi;
        const img = new Image();
        img.onload = function () { try { const c = document.createElement("canvas"); c.width = L.w; c.height = L.h; const x = c.getContext("2d"); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, L.w, L.h).data; L.gray = new Uint8Array(L.w * L.h); for (let i = 0; i < L.w * L.h; i++) L.gray[i] = d[i * 4]; L.ready = true; L.loading = false; if (heightmapOn) { baseValid = false; scheduleDraw(); } } catch (e) { L.loading = false; } };
        img.src = HM.png;
      };
      if (window[L.vn]) { decode(); return; }
      const s = document.createElement("script"); s.src = L.src; s.onload = decode; s.onerror = () => { L.loading = false; }; document.head.appendChild(s);
    }
    function loadHeightmap() { loadHeightmapLevel(HM_LEVELS.base); }   // called when the Heightmap layer is enabled
    function drawHeightmap() {
      if (zoom >= HMULTRA_Z) loadHeightmapLevel(HM_LEVELS.ultra);   // lazily fetch the sharper level the first time we're zoomed in
      const L = (zoom >= HMULTRA_Z && HM_LEVELS.ultra.ready) ? HM_LEVELS.ultra : HM_LEVELS.base;
      if (!L.ready) return;
      const gray = L.gray, hmW = L.w, hmH = L.h, lo = L.lo, span = L.hi - L.lo;
      // 1) reproject onto the disk into an offscreen buffer — low-res while moving (so it stays visible without lag), and up to
      // FULL canvas resolution when settled + zoomed in, so the ultra raster renders as crisply as the data allows at deep zoom
      const cap = moving ? 360 : clamp(800 + zoom * 200, 900, Math.max(W, H)), scale = Math.min(1, cap / Math.max(W, H)), hw = Math.max(2, Math.round(W * scale)), hh = Math.max(2, Math.round(H * scale));
      if (!hmCv) hmCv = document.createElement("canvas");
      if (hmCv.width !== hw || hmCv.height !== hh) { hmCv.width = hw; hmCv.height = hh; }
      const hx = hmCv.getContext("2d"), id = hx.createImageData(hw, hh), data = id.data;
      const SL = 128, HI = 250, aBase = (HM_OPACITY * 255) | 0;   // SL = mid-grey (128) so SEA LEVEL is neutral under the overlay blend (no colour shift); ocean floor < 128 darkens, peaks > 128 lighten
      for (let j = 0; j < hh; j++) {
        const v = (cy - (j + 0.5) / scale) / R;
        for (let i = 0; i < hw; i++) {
          const o = (j * hw + i) << 2, u = ((i + 0.5) / scale - cx) / R, s = u * u + v * v;
          if (s > 1) { data[o + 3] = 0; continue; }   // off the front hemisphere
          const w = Math.sqrt(1 - s);
          const gx = u * Ex + v * Nx + w * Cx, gy = u * Ey + v * Ny + w * Cy, gz = u * Ez + v * Nz + w * Cz;
          const lon = Math.atan2(gy, gx) / DEG; let la = gz < -1 ? -1 : gz > 1 ? 1 : gz; const lat = Math.asin(la) / DEG;
          let sx = ((lon + 180) / 360 * hmW) | 0; if (sx < 0) sx = 0; else if (sx >= hmW) sx = hmW - 1;
          let sy = ((90 - lat) / 180 * hmH) | 0; if (sy < 0) sy = 0; else if (sy >= hmH) sy = hmH - 1;
          const elev = lo + gray[sy * hmW + sx] / 255 * span;
          let g;   // continuous relief ramp across land AND ocean floor (bathymetry): deep sea dark → sea level mid → peaks light
          if (elev >= 0) { let n = elev / 4200; if (n > 1) n = 1; g = SL + ((Math.sqrt(n) * (HI - SL)) | 0); }
          else { let d = elev / -6000; if (d > 1) d = 1; g = SL - ((d * SL) | 0); }
          g = SL + (((g - SL) * HM_CONTRAST) | 0); if (g < 0) g = 0; else if (g > 255) g = 255;   // expand contrast around sea level (128) so lows go darker & highs lighter under the overlay blend
          // uniform alpha — the "overlay" blend below (not a flat paste) is what darkens the lows and lightens the highs of the
          // map's own colours, so no theme-specific alpha ramp is needed.
          data[o] = g; data[o + 1] = g; data[o + 2] = g; data[o + 3] = aBase;
        }
      }
      hx.putImageData(id, 0, 0);
      // 2) BLEND onto the globe over LAND and OCEAN (bathymetry), clipped to the disk. Composite mode "overlay" so the grey relief
      // MODULATES the map's own colours (lows / ocean-floor darken them, highs / peaks lighten them) instead of pasting a flat grey
      // image over them. Disk-only clip is cheap → can render live while moving. (globalCompositeOperation is reset by restore().)
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
      ctx.globalCompositeOperation = "overlay";
      ctx.imageSmoothingEnabled = true; ctx.globalAlpha = 1; ctx.drawImage(hmCv, 0, 0, hw, hh, 0, 0, W, H);
      ctx.restore();
    }
    const ADMIN1 = window.ADMIN1 || { b: [], l: [] };   // { b:[ring,...] province borders }
    // per-admin-ring cull data: centre unit vector + sin(angular radius), so back-facing province rings are skipped
    let _admc = window.__folioAdmCull;
    if ((!_admc || _admc.length !== ADMIN1.b.length * 4) && ADMIN1.b.length) {
      _admc = window.__folioAdmCull = new Float32Array(ADMIN1.b.length * 4);
      for (let i = 0; i < ADMIN1.b.length; i++) {
        const ring = ADMIN1.b[i]; let a = 180, b = 90, d = -180, e = -90;
        for (let j = 0; j < ring.length; j++) { const pt = ring[j]; if (pt[0] < a) a = pt[0]; if (pt[0] > d) d = pt[0]; if (pt[1] < b) b = pt[1]; if (pt[1] > e) e = pt[1]; }
        const rlo = (a + d) / 2 * DEG, rla = (b + e) / 2 * DEG, cl = Math.cos(rla), o = i * 4;
        _admc[o] = cl * Math.cos(rlo); _admc[o + 1] = cl * Math.sin(rlo); _admc[o + 2] = Math.sin(rla);
        _admc[o + 3] = Math.sin(Math.min(Math.PI / 2, 0.5 * Math.hypot(d - a, e - b) * DEG));   // conservative radius (no lon compression)
      }
    }
    const ADMC = _admc || new Float32Array(0);
    const CITIES = window.CITIES || [];   // cities { n, c:[lon,lat], r } — r:0 national cap, r:1 metro >=1M, r:2 admin cap
    // each country gets a stable matte (muted) colour, shown when it is hovered / selected
    const MATTE = GEO.map((_, i) => { const h = (Math.imul(i + 1, 2654435761) >>> 0); return "hsl(" + (h % 360) + "," + (34 + (h >> 9) % 16) + "%," + (58 + (h >> 17) % 12) + "%)"; });
    // rounded directed edge "a|b" → index of the present-day country that owns it (used to find a border's neighbour country)
    let _wOwner = null;
    function worldEdgeOwners() {
      if (_wOwner) return _wOwner;
      const rnd = (v) => Math.round(v * 1e3) / 1e3, pk = (p) => rnd(p[0]) + "," + rnd(p[1]);
      const m = new Map();
      for (let i = 0; i < GEO.length; i++) { const rings = GEO[i].p; for (let r = 0; r < rings.length; r++) { const ring = rings[r]; for (let k = 0; k + 1 < ring.length; k++) m.set(pk(ring[k]) + "|" + pk(ring[k + 1]), i); } }
      return (_wOwner = m);
    }
    // present-day world.js entities that did NOT exist as a distinct country/sub-country before a given year — their internal
    // (intra-group) border must NOT be drawn on a historical map earlier than that. Baikonur was leased to Russia only in 1994;
    // split-off states (S. Sudan 2011, Kosovo 2008, Timor-Leste 2002, Eritrea 1993, N. Cyprus 1983) likewise. Disputed / military /
    // uninhabited zones are never their own border on a historical map (1e4 = "never in range"). (External borders are unaffected:
    // e.g. the Sudan–Uganda line still draws in 2010 as an inter-group border; only the future Sudan/S.Sudan split line is hidden.)
    const ENTITY_SINCE = {
      "Baikonur": 1994, "S. Sudan": 2011, "Kosovo": 2008, "Timor-Leste": 2002, "Eritrea": 1993, "N. Cyprus": 1983,
      "Siachen Glacier": 1e4, "Bir Tawil": 1e4, "Brazilian I.": 1e4, "Southern Patagonian Ice Field": 1e4,
      "Dhekelia": 1e4, "Akrotiri": 1e4, "Cyprus U.N. Buffer Zone": 1e4,
    };
    // a "merger-only" era stores only a grouping (present-country name → era-territory name). Synthesize its territories from
    // world.js geometry so unchanged borders are pixel-identical to the present-day map (single source → no double borders). An
    // edge is an interior border iff its reverse is owned by a country in a DIFFERENT group; intra-group (merged) edges + coast are skipped.
    function synthGroups(era) {
      const owner = worldEdgeOwners();
      const rnd = (v) => Math.round(v * 1e3) / 1e3, pk = (p) => rnd(p[0]) + "," + rnd(p[1]);
      const groups = era.groups || {}, Y = era.year;
      const grpOf = (i) => (i == null ? null : (groups[GEO[i].n] || GEO[i].n));
      const since = (i) => (i == null ? -1 : (ENTITY_SINCE[GEO[i].n] || -1));   // year the entity became a distinct country/sub-country (-1 = always existed)
      const byName = new Map();
      for (let i = 0; i < GEO.length; i++) { const g = grpOf(i); let e = byName.get(g); if (!e) { e = { n: g, p: [] }; byName.set(g, e); } for (const ring of GEO[i].p) e.p.push(ring); }
      const out = [];
      for (const e of byName.values()) {
        // per edge: '0' inter-group border (drawn bold) · '1' coast (skipped, world.js coast draws it) · '2' intra-group
        // sub-country border (a present-day country INSIDE this merged entity — drawn light so the unit still reads as one)
        const masks = e.p.map((ring) => { let s = ""; for (let k = 0; k + 1 < ring.length; k++) {
          const own = owner.get(pk(ring[k]) + "|" + pk(ring[k + 1])), nb = owner.get(pk(ring[k + 1]) + "|" + pk(ring[k]));
          // '1' coast · '0' inter-group border · '2' intra-group sub-country border · '3' hidden sub-border (an entity that
          // did not exist yet in this era's year, e.g. Baikonur before 1994). The renderer draws only '0'+'2', so '1' and '3'
          // are both skipped on the map; the distinct '3' lets the selection outline skip it too (while still tracing the coast).
          s += (nb == null) ? "1" : (grpOf(nb) !== e.n) ? "0" : (since(own) > Y || since(nb) > Y) ? "3" : "2";
        } return s; });
        out.push({ n: e.n, p: e.p, c: masks });
      }
      return out;
    }
    // active historical-era territories (when the timeline is on a past era) — cached geo + bboxes + matte colours, parallel to GEO/BBOX/MATTE
    let _htId = null, _htTerr = null, _htBB = null, _htMatte = null;
    function histTerr() {
      const era = activeEra(year);
      if (!era || era.present) return null;
      if (era.id !== _htId) {
        _htId = era.id; _htTerr = (era.groups && (!era.geo || !era.geo.length)) ? synthGroups(era) : (era.geo || []);
        _htBB = _htTerr.map((t) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; (t.p || []).forEach((ring) => ring.forEach((p) => { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; })); return [x0, y0, x1, y1]; });
        _htMatte = _htTerr.map((_, i) => { const h = (Math.imul(i + 9, 2654435761) >>> 0); return "hsl(" + (h % 360) + "," + (34 + (h >> 9) % 16) + "%," + (58 + (h >> 17) % 12) + "%)"; });
      }
      return _htTerr;
    }
    // present-day coastline = GEO polygon edges that are NOT shared with another country (internal borders are shared, so the
    // remainder is the land/ocean boundary). Cached. Lets historical eras draw the exact present-day coast, crisp like the modern map.
    let _coastEdges = null, _presentBorders = null;
    function presentBorderEdges() { if (!_presentBorders) coastEdges(); return _presentBorders; }   // present-day inter-country borders world.js left un-shared (drawn only on groups eras — see coastEdges)
    function coastEdges() {
      if (_coastEdges) return _coastEdges;
      const rnd = (v) => Math.round(v * 1e3) / 1e3, pk = (p) => rnd(p[0]) + "," + rnd(p[1]);
      const dir = new Set();
      for (let g = 0; g < GEO.length; g++) { const rings = GEO[g].p; for (let r = 0; r < rings.length; r++) { const ring = rings[r]; for (let i = 0; i + 1 < ring.length; i++) dir.add(pk(ring[i]) + "|" + pk(ring[i + 1])); } }
      // collect unshared (coast) edges and chain them into connected polylines, so the render strokes runs (each shared
      // vertex projected once) instead of ~90k isolated 2-point segments (each endpoint re-projected per segment).
      const adj = new Map(), pt = {};
      for (let g = 0; g < GEO.length; g++) { const rings = GEO[g].p; for (let r = 0; r < rings.length; r++) { const ring = rings[r]; for (let i = 0; i + 1 < ring.length; i++) { const a = ring[i], b = ring[i + 1], ka = pk(a), kb = pk(b); if (dir.has(kb + "|" + ka)) continue; pt[ka] = a; pt[kb] = b; let L = adj.get(ka); if (!L) { L = []; adj.set(ka, L); } L.push({ b: b, k: kb, used: false }); } } }
      const out = [];
      for (const ent of adj) { const list = ent[1]; for (let j = 0; j < list.length; j++) { if (list[j].used) continue;
        const line = [pt[ent[0]]]; let cur = list[j];
        while (cur && !cur.used) { cur.used = true; line.push(cur.b); const nx = adj.get(cur.k); cur = nx && nx.find((x) => !x.used); }
        if (line.length >= 2) out.push(line); } }
      // Classify each chained loop into TWO sets. COASTS (`_coastEdges`, drawn on every historical era — coasts don't change):
      // continents, ocean coasts & islands, the Caspian/Aral sea outline. PRESENT-DAY BORDERS (`_presentBorders`): interior chains
      // with two different countries across them — world.js's non-tiling borders (e.g. the straight Saharan desert borders) that the
      // border classifier missed; these are present-day borders, so the renderer draws them ONLY on groups eras (whose borders ARE
      // present-day) and never on older eras (avoiding anachronistic-border "squiggles"). DROP the rest: interior lake / reservoir
      // shorelines and their islets (the grey strays). Blue lake FILLS (the LAKES layer) are unaffected.
      const gbb = GEO.map((g) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const r of g.p) for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1]; });
      const inRingPt = (lon, lat, ring) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1]; if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) c = !c; } return c; };
      const inLand = (lon, lat) => { for (let g = 0; g < GEO.length; g++) { const b = gbb[g]; if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue; const rings = GEO[g].p; let ins = false; for (let r = 0; r < rings.length; r++) if (inRingPt(lon, lat, rings[r])) ins = !ins; if (ins) return true; } return false; };
      // coarse 1° land/ocean grid, then flood-fill the OCEAN from open-sea seeds (incl. seas behind thin straits — Mediterranean,
      // Black, Baltic, Red, Persian Gulf, Hudson Bay…). A landlocked lake is never reached, so it can never count as ocean.
      const CS = 2, NX = 180, NY = 90, cellLand = new Uint8Array(NX * NY);
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) cellLand[j * NX + i] = inLand(-180 + (i + 0.5) * CS, -90 + (j + 0.5) * CS) ? 1 : 0;
      const oc = new Uint8Array(NX * NY), fs = [];
      for (const s of [[-150, 0], [-30, -20], [80, -20], [0, -55], [-160, 45], [150, 35], [-40, 50], [17, 37], [22, 38], [34, 43], [19, 58], [6, 54], [38, 20], [51, 27], [-85, 60], [135, 40], [120, 15], [88, 15], [-90, 25], [-75, 15], [-45, 60], [100, -5], [130, -5], [35, -30], [15, 43], [25, 38], [36, 46], [123, 36], [-5, 45], [10, 68]]) { const i = ((s[0] + 180) / CS) | 0, j = ((s[1] + 90) / CS) | 0, idx = j * NX + i; if (!cellLand[idx] && !oc[idx]) { oc[idx] = 1; fs.push(idx); } }
      while (fs.length) { const idx = fs.pop(), j = (idx / NX) | 0, i = idx % NX; const nb = [[i, j + 1], [i, j - 1], [(i + 1) % NX, j], [(i - 1 + NX) % NX, j]]; for (const nn of nb) { if (nn[1] < 0 || nn[1] >= NY) continue; const n = nn[1] * NX + nn[0]; if (!cellLand[n] && !oc[n]) { oc[n] = 1; fs.push(n); } } }
      const oceanAt = (lo, la) => { let i = ((lo + 180) / CS) | 0, j = ((la + 90) / CS) | 0; if (i < 0) i = 0; if (i >= NX) i = NX - 1; if (j < 0) j = 0; if (j >= NY) j = NY - 1; return oc[j * NX + i] === 1; };
      // lakes.js polygons (the blue-fill lakes) — a chain sitting ON one is that lake's grey outline (or an islet inside it).
      const LAKES = window.LAKES || [];
      const lbb = LAKES.map((poly) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const ring of poly) for (const p of ring) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1]; });
      const inLakesJs = (lo, la) => { for (let i = 0; i < LAKES.length; i++) { const b = lbb[i]; if (lo < b[0] || lo > b[2] || la < b[1] || la > b[3]) continue; for (const ring of LAKES[i]) if (inRingPt(lo, la, ring)) return true; } return false; };
      const onLake = (line, x0, y0, x1, y1, mx, my) => { let near = false; for (let i = 0; i < LAKES.length; i++) { const b = lbb[i]; if (x1 >= b[0] && x0 <= b[2] && y1 >= b[1] && y0 <= b[3]) { near = true; break; } } if (!near) return false; if (inLakesJs(mx, my)) return true; const w = x1 - x0, h = y1 - y0; let ins = 0, inL = 0; for (let s = 1; s < 10; s++) for (let t = 1; t < 10; t++) { const x = x0 + w * s / 10, y = y0 + h * t / 10; if (inRingPt(x, y, line)) { ins++; if (inLakesJs(x, y)) inL++; } } return ins > 0 && inL >= ins * 0.4; };
      // a chain with TWO DIFFERENT countries across it is an inter-country BORDER (world.js's non-tiling borders land here, not in the
      // border classifier). Probe ±0.15° along its normals: a coast / lake shore has water (no country) on one side; a same-country
      // gap has one country on both. Runs only for the few interior chains (after the cheap ocean test), so it stays fast.
      const countryAt = (lo, la) => { for (let g = 0; g < GEO.length; g++) { const b = gbb[g]; if (lo < b[0] || lo > b[2] || la < b[1] || la > b[3]) continue; const rings = GEO[g].p; let ins = false; for (let r = 0; r < rings.length; r++) if (inRingPt(lo, la, rings[r])) ins = !ins; if (ins) return g; } return -1; };
      const PROBE = 0.15;
      const borderFrac = (line) => { let pts = 0, bord = 0; const step = Math.max(1, Math.floor(line.length / 24)); for (let i = 1; i < line.length - 1; i += step) { const a = line[i - 1], b = line[i + 1], p = line[i]; let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L; const nx = -dy, ny = dx; const c1 = countryAt(p[0] + nx * PROBE, p[1] + ny * PROBE), c2 = countryAt(p[0] - nx * PROBE, p[1] - ny * PROBE); pts++; if (c1 !== -1 && c2 !== -1 && c1 !== c2) bord++; } return pts ? bord / pts : 0; };
      const coasts = [], borders = [];
      for (const line of out) {
        let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const p of line) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
        const span = Math.max(x1 - x0, y1 - y0), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        const sea = (mx >= 46 && mx <= 55 && my >= 36 && my <= 47) || (mx >= 56 && mx <= 63 && my >= 43 && my <= 47);   // Caspian / Aral region
        if (span >= 15 || (sea && span >= 2)) { coasts.push(line); continue; }         // a continent / the Caspian-Aral sea outline → coastline
        if (onLake(line, x0, y0, x1, y1, mx, my)) continue;                             // grey outline of a blue-fill lake, or an islet in one → drop
        const rx = (x1 - x0) / 2 + 1.2, ry = (y1 - y0) / 2 + 1.2; let ocean = oceanAt(mx, my);
        if (!ocean) for (let a = 0; a < 16 && !ocean; a++) { const g = a / 16 * 6.2832; if (oceanAt(mx + Math.cos(g) * rx, my + Math.sin(g) * ry)) ocean = true; }
        if (ocean) { coasts.push(line); continue; }                                     // borders the open sea → coastline
        if (span >= 0.3 && borderFrac(line) >= 0.4) { borders.push(line); continue; }   // interior, two countries across → a present-day border (drawn only on groups eras)
        // else an interior lake shore / islet / river → drop
      }
      _presentBorders = borders;
      return (_coastEdges = coasts);
    }
    // geo-anchored whiteboard ink: each stroke = { mode:'pen'|'hl', color, size, pts:[[lon,lat],...] }
    const strokes = []; let activeStroke = null, erasing = false;
    // whiteboard undo/redo: snapshots of the geo-anchored stroke list (deep-copied), pushed after each committed change (a
    // finished pen/highlighter stroke, an erase drag, a clear). The shared WB Undo/Redo buttons call WB.onUndo/onRedo (set below).
    const gUndo = [], gRedo = []; let wbChanged = false;
    const cloneStroke = (s) => ({ mode: s.mode, color: s.color, size: s.size, pts: s.pts.map((p) => [p[0], p[1]]) });
    function gSnapshot() { gUndo.push(strokes.map(cloneStroke)); while (gUndo.length > 60) gUndo.shift(); gRedo.length = 0; wbUpdateHistBtns(); }
    function applyStrokes(snap) { strokes.length = 0; for (const s of snap) strokes.push(cloneStroke(s)); activeStroke = null; erasing = false; draw(); }
    const GRAT = [];
    for (let lon = -180; lon < 180; lon += 30) { const L = []; for (let lat = -90; lat <= 90; lat += 3) L.push([lon, lat]); GRAT.push(L); }
    for (let lat = -60; lat <= 60; lat += 30) { const L = []; for (let lon = -180; lon <= 180; lon += 3) L.push([lon, lat]); GRAT.push(L); }
    const canvas = root.querySelector("#globe"), stage = root.querySelector("#globeStage");
    const ctx = canvas.getContext("2d");
    canvas.style.touchAction = "none";
    let dpr = 1, W = 0, H = 0, baseR = 0;
    let rotLon = atlasView.rotLon, rotLat = atlasView.rotLat, zoom = atlasView.zoom, year = MAXY;   // restore persisted view; `year` = the timeline year (declared early so renderStatic/viewKey + the initial draw can read it)
    if (atlasPendingYear != null) { year = Math.max(MINY, Math.min(MAXY, atlasPendingYear)); atlasPendingYear = null; }   // "View on globe" opens the Atlas at a chosen era's year
    const ZMIN = 0.82, ZMAX = 10;   // deeper max zoom so the higher-res heightmap + close detail are usable
    const CAP_Z = 1.8, MAJOR_Z = 2.4, CLOSE_Z = 4.5;   // hard cutoffs: capitals at CAP_Z; major cities (metros/admin caps) just above at MAJOR_Z; admin/province borders only when zoomed close at CLOSE_Z
    const RIVER_LABEL_Z = 1.55;   // river names only once zoomed in a little (1073 rivers would swamp the globe at world scale)
    // a legend row only appears once zoomed in far enough for that layer to matter — at full zoom-out only Borders shows
    const LEGEND_MINZOOM = { bordersToggle: 0, countryToggle: 0, heightmapToggle: 0, waterToggle: CAP_Z, rangesToggle: 1.2, riversToggle: 1.25, riverLabelsToggle: RIVER_LABEL_Z, citiesToggle: CAP_Z, majorToggle: MAJOR_Z };
    let _legendSig = "";
    // present-day-only layers (political) — hidden from the legend on historical / no-map years, which show only borders + physical layers
    const PRESENT_ONLY = { countryToggle: 1, citiesToggle: 1, majorToggle: 1 };
    function updateLegendVisibility() {
      // every legend layer is shown at ALL zoom levels (no per-layer min-zoom gate). The only thing still hidden is a present-day-
      // only layer (cities/divisions/…) on a HISTORICAL era, which genuinely has no data there.
      const ids = Object.keys(LEGEND_MINZOOM);
      const present = !!(activeEra(year) || {}).present;
      const sig = present ? "P" : "H";
      if (sig === _legendSig) return; _legendSig = sig;
      for (let i = 0; i < ids.length; i++) { const cb = document.getElementById(ids[i]); const row = cb && cb.closest(".legend-row"); if (row) row.style.display = (!present && PRESENT_ONLY[ids[i]]) ? "none" : ""; }
    }

    // orthographic projection through a 3D basis — lets us clip geometry exactly at the horizon
    let cx = 0, cy = 0, R = 0;
    let Cx = 0, Cy = 0, Cz = 0, Ex = 0, Ey = 0, Ez = 0, Nx = 0, Ny = 0, Nz = 0;
    let P3x = 0, P3y = 0, P3z = 0, PV = 0, PX = 0, PY = 0, ppx = 0, ppy = 0;
    const HP = { x: 0, y: 0 };
    function setBasis() {
      const lo = rotLon * DEG, la = rotLat * DEG, clo = Math.cos(lo), slo = Math.sin(lo), cla = Math.cos(la), sla = Math.sin(la);
      Cx = cla * clo; Cy = cla * slo; Cz = sla;
      Ex = -slo; Ey = clo; Ez = 0;
      Nx = -sla * clo; Ny = -sla * slo; Nz = cla;
    }
    function proj(lon, lat) {
      const lo = lon * DEG, la = lat * DEG, cla = Math.cos(la);
      const x = cla * Math.cos(lo), y = cla * Math.sin(lo), z = Math.sin(la);
      P3x = x; P3y = y; P3z = z;
      PV = x * Cx + y * Cy + z * Cz;
      PX = cx + R * (x * Ex + y * Ey + z * Ez);
      PY = cy - R * (x * Nx + y * Ny + z * Nz);
    }
    function crossing(ax, ay, az, av, bx, by, bz, bv) {
      const t = av / (av - bv);
      let x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = az + (bz - az) * t;
      const m = Math.hypot(x, y, z) || 1; x /= m; y /= m; z /= m;
      HP.x = cx + R * (x * Ex + y * Ey + z * Ez);
      HP.y = cy - R * (x * Nx + y * Ny + z * Nz);
    }
    // inverse orthographic: canvas point -> [lon,lat] on the front hemisphere (null if off-globe)
    function screenToLonLat(px, py) {
      const u = (px - cx) / R, v = (cy - py) / R, s = u * u + v * v;
      if (s > 1) return null;
      const w = Math.sqrt(1 - s); // component along the view axis (front)
      const gx = u * Ex + v * Nx + w * Cx, gy = u * Ey + v * Ny + w * Cy, gz = u * Ez + v * Nz + w * Cz;
      return [Math.atan2(gy, gx) / DEG, Math.asin(clamp(gz, -1, 1)) / DEG];
    }
    // even-odd ray cast over all of a country's rings (handles islands + holes)
    function pointInRings(rings, lon, lat) {
      let inside = false;
      for (let r = 0; r < rings.length; r++) {
        const ring = rings[r];
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const yi = ring[i][1], yj = ring[j][1];
          if ((yi > lat) !== (yj > lat)) {
            const xi = ring[i][0], xj = ring[j][0];
            if (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
          }
        }
      }
      return inside;
    }
    // which country (index) is under a canvas point, or -1 (ocean / off-globe / back side)
    function countryAt(px, py, forceGeo) {
      const ll = screenToLonLat(px, py); if (!ll) return -1;
      const era = activeEra(year); if (!era) return -1;   // no-map year → nothing clickable
      const lon = ll[0], lat = ll[1];
      const ht = forceGeo ? null : histTerr(), terr = ht || GEO, bb = ht ? _htBB : BBOX;   // historical era → click its territories; forceGeo (double-click drill) → always present-day countries
      let best = -1, bestArea = Infinity;
      for (let i = 0; i < terr.length; i++) {
        const nm = terr[i].n; if (!nm || !String(nm).trim()) continue;   // wilderness / stateless (unnamed) areas aren't clickable
        const b = bb[i];
        if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue;
        if (!pointInRings(terr[i].p, lon, lat)) continue;
        // smallest bbox wins so an enclave (Vatican in Italy, Macao in China) beats the country around it
        const area = (b[2] - b[0]) * (b[3] - b[1]);
        if (area < bestArea) { bestArea = area; best = i; }
      }
      return best;
    }
    const limbAng = (px, py) => Math.atan2(py - cy, px - cx);
    // sweep the limb circle the SHORT way from angle `a` to `b` (the hidden side of a country
    // almost always subtends < 180°, so the shorter arc is the correct boundary).
    function limbArc(a, b) { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; ctx.arc(cx, cy, R, a, b, d < 0); }
    // append a lon/lat ring to the path, split at the horizon. When `arc` is set (filled land),
    // exit→entry pairs are joined along the limb circle so the fill never chords across the disk;
    // for plain polylines (graticule) the visible spans are left open.
    function addClipped(coords, arc) {
      let started = false, pvv = 0, pvx = 0, pvy = 0, pvz = 0;
      let exitAng = null, firstAng = null;
      for (let i = 0; i < coords.length; i++) {
        proj(coords[i][0], coords[i][1]);
        const vx = P3x, vy = P3y, vz = P3z, vv = PV, sx = PX, sy = PY;
        if (i === 0) { if (vv >= 0) { ctx.moveTo(sx, sy); started = true; } }
        else if (pvv >= 0 && vv >= 0) { if (!started) { ctx.moveTo(ppx, ppy); started = true; } ctx.lineTo(sx, sy); }
        else if (pvv >= 0 && vv < 0) { // exit through the horizon
          crossing(pvx, pvy, pvz, pvv, vx, vy, vz, vv);
          if (started) ctx.lineTo(HP.x, HP.y); else { ctx.moveTo(HP.x, HP.y); started = true; }
          if (arc) exitAng = limbAng(HP.x, HP.y);
        }
        else if (pvv < 0 && vv >= 0) { // re-entry
          crossing(pvx, pvy, pvz, pvv, vx, vy, vz, vv);
          const ea = limbAng(HP.x, HP.y);
          if (arc && exitAng !== null) limbArc(exitAng, ea);
          else { if (arc && firstAng === null) firstAng = ea; ctx.moveTo(HP.x, HP.y); }
          ctx.lineTo(sx, sy); started = true; exitAng = null;
        }
        pvv = vv; pvx = vx; pvy = vy; pvz = vz; ppx = sx; ppy = sy;
      }
      // ring that began hidden and ends hidden: close the final span back to the first entry along the limb
      if (arc && exitAng !== null && firstAng !== null) limbArc(exitAng, firstAng);
    }
    function drawGraticule() {
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
      ctx.strokeStyle = grat; ctx.lineWidth = 1;
      for (let i = 0; i < GRAT.length; i++) { ctx.beginPath(); addClipped(GRAT[i], false); ctx.stroke(); }
      ctx.restore();
    }
    // paint a country with its stable matte colour (clipped to the country) when hovered / selected
    function paintFill(idx, selected) {
      const ht = histTerr(), terr = ht || GEO;
      if (idx < 0 || idx >= terr.length) return;
      paintFillRings(terr[idx].p, selected, terr[idx].c, null, !!ht);   // historical era → highlight the present-day coast (coastEdges), not the era geometry's own '1' edges
    }
    // The golden highlight must trace EXACTLY the edges the map draws for this entity: its political borders ('0' inter-group,
    // '2' sub-country) — NOT its own '1' coast (the map draws the present-day coastline via coastEdges) nor '3' hidden borders.
    // `hidden` (a directed-edge Set) lets the un-masked present-day drill skip borders the era omits (e.g. S. Sudan pre-2011).
    // `clipCoast` adds the present-day coastline clipped to the region, so the highlighted coast matches the drawn coast.
    function paintFillRings(rings, selected, masks, hidden, clipCoast) {
      // cohesive amber highlight: a subtle warm tint (lets the map read through) + a crisp bright outline, with a soft glow when selected
      ctx.save();
      // On a historical era, clip the FILL to the present-day world.js land so the gold follows the DRAWN coastline
      // instead of the low-res era polygon's offset coast (fixes the "overlay is slightly off the coast" mismatch).
      if (clipCoast) {
        let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const ring of rings) for (const p of ring) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
        ctx.beginPath(); for (let g = 0; g < GEO.length; g++) { const b = BBOX[g]; if (b[2] < x0 || b[0] > x1 || b[3] < y0 || b[1] > y1) continue; const gr = GEO[g].p; for (let r = 0; r < gr.length; r++) addClipped(gr[r], true); } ctx.clip("evenodd");
      }
      ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], true);
      ctx.fillStyle = selected ? "rgba(255,178,46,0.24)" : "rgba(255,178,46,0.12)"; ctx.fill("evenodd");
      ctx.restore();
      ctx.save();
      if (selected) { ctx.shadowColor = "rgba(255,184,60,0.75)"; ctx.shadowBlur = 9; }
      ctx.lineWidth = selected ? 2.6 : 1.5; ctx.strokeStyle = selected ? "rgba(255,192,74,1)" : "rgba(255,178,46,0.82)";
      ctx.beginPath();
      const seg = [0, 0];
      if (masks) {   // era / constituent geometry: draw EXACTLY the edges the base map strokes — the political borders '0' (48) + '2' (50); skip '1' coast (coastEdges draws it) + '3' hidden + anything else, so the gold overlay matches the drawn border 1:1
        for (let r = 0; r < rings.length; r++) { const ring = rings[r], m = masks[r] || ""; for (let i = 0; i + 1 < ring.length; i++) { const c = m.charCodeAt(i); if (c !== 48 && c !== 50) continue; seg[0] = ring[i]; seg[1] = ring[i + 1]; addClipped(seg, false); } }
      } else if (hidden) {   // un-masked present-day rings drilled within a merger era: draw every edge EXCEPT ones the era hides
        for (let r = 0; r < rings.length; r++) { const ring = rings[r]; for (let i = 0; i + 1 < ring.length; i++) { if (hidden.has(edgeKey(ring[i], ring[i + 1]))) continue; seg[0] = ring[i]; seg[1] = ring[i + 1]; addClipped(seg, false); } }
      } else { for (let r = 0; r < rings.length; r++) addClipped(rings[r], false); }   // present-day map: full outline (matches the map's full GEO stroke)
      ctx.stroke();
      ctx.restore();
      if (clipCoast && selected) strokeCoastClipped(rings, selected);   // gold coastline = present-day coastEdges clipped to the region (matches the drawn coast exactly)
    }
    const _rnd1e3 = (v) => Math.round(v * 1e3) / 1e3;
    const edgeKey = (a, b) => _rnd1e3(a[0]) + "," + _rnd1e3(a[1]) + "|" + _rnd1e3(b[0]) + "," + _rnd1e3(b[1]);
    let _coastBB = null;
    function coastBBoxes() { if (_coastBB) return _coastBB; const ce = coastEdges(); _coastBB = ce.map((line) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const p of line) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1]; }); return _coastBB; }
    function strokeCoastClipped(rings, selected) {   // stroke the present-day coastline (coastEdges), clipped to `rings`, in the gold highlight style
      let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const ring of rings) for (const p of ring) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
      const ce = coastEdges(), bb = coastBBoxes();
      ctx.save();
      if (selected) { ctx.shadowColor = "rgba(255,184,60,0.75)"; ctx.shadowBlur = 7; }
      ctx.lineWidth = selected ? 2.2 : 1.3; ctx.strokeStyle = selected ? "rgba(255,192,74,1)" : "rgba(255,178,46,0.82)";
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
      ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], true); ctx.clip("evenodd");
      ctx.beginPath(); for (let i = 0; i < ce.length; i++) { const b = bb[i]; if (b[2] < x0 || b[0] > x1 || b[3] < y0 || b[1] > y1) continue; addClipped(ce[i], false); } ctx.stroke();
      ctx.restore();
    }
    let _hiddenId = null, _hiddenSet = null;   // directed edges the current era HIDES ('3' sub-borders, e.g. S. Sudan pre-2011) — so a present-day drill never draws a border the map omits
    function hiddenEdgeSet() {
      const era = activeEra(year), id = era ? era.id : "";
      if (id !== _hiddenId) {
        _hiddenId = id; _hiddenSet = new Set(); const ht = histTerr();
        if (ht) for (const t of ht) { const cm = t.c || []; for (let r = 0; r < t.p.length; r++) { const ring = t.p[r], m = cm[r] || ""; for (let i = 0; i + 1 < ring.length; i++) if (m.charCodeAt(i) === 51) { _hiddenSet.add(edgeKey(ring[i], ring[i + 1])); _hiddenSet.add(edgeKey(ring[i + 1], ring[i])); } } }
      }
      return _hiddenSet;
    }
    // the UK constituent under a lon/lat, era-aware, or null. Before the 1922 partition the whole island of Ireland was part of
    // the UK (so any Irish point → the all-Ireland "Ireland"); from 1922 only Northern Ireland is, the Republic being separate.
    function constituentHit(lon, lat) {
      for (let i = 0; i < UK.length; i++) { const b = UKBB[i]; if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue; if (!pointInRings(UK[i].p, lon, lat)) continue;
        const n = UK[i].n, preWWI = year <= 1921;
        if (n === "England" || n === "Scotland" || n === "Wales") return { name: n, idxs: [i] };
        if (preWWI) { const idxs = []; for (let k = 0; k < UK.length; k++) if (UK[k].n === "Ireland" || UK[k].n === "Northern Ireland") idxs.push(k); return { name: "Ireland", idxs: idxs }; }
        if (n === "Northern Ireland") return { name: "Northern Ireland", idxs: [i] };
        return null;   // Republic of Ireland from 1922 on — not a UK constituent
      }
      return null;
    }
    // the UK's internal land borders (England–Scotland, England–Wales — the '0' mask edges) drawn light, like a '2' sub-country
    // border, so the constituent countries read within the single UK landmass on the present-day map and every era.
    function drawUKConstituents(bw) {
      if (!UK.length) return;
      ctx.save(); ctx.globalAlpha = 0.62; ctx.lineWidth = Math.max(0.6, bw * 0.72); ctx.strokeStyle = border; ctx.beginPath();
      const seg = [0, 0];
      for (let s = 0; s < UK.length; s++) { const rings = UK[s].p, cm = UK[s].c || []; for (let r = 0; r < rings.length; r++) { const ring = rings[r], m = cm[r] || ""; for (let i = 0; i + 1 < ring.length; i++) { if (m.charCodeAt(i) !== 48) continue; seg[0] = ring[i]; seg[1] = ring[i + 1]; addClipped(seg, false); } } }
      ctx.stroke(); ctx.restore();
    }
    // The geo-era USSR (1920/1938) is a single source polygon with NO internal republic borders. To show its union republics —
    // as the merger eras (1960+) already do, and the UK shows its constituents — overlay the present-day post-Soviet INTERNAL
    // borders (edges shared between two of the 15 successor states) CLIPPED to the era's USSR extent, drawn light like a '2'
    // sub-border. These approximate the union-republic boundaries (the Central-Asian/Caucasus borders were settled by 1936).
    const SOVIET = new Set(["russia", "ukraine", "belarus", "estonia", "latvia", "lithuania", "moldova", "georgia", "armenia", "azerbaijan", "kazakhstan", "uzbekistan", "turkmenistan", "tajikistan", "kyrgyzstan"]);
    let _sovietBorders = null;
    function sovietRepublicBorders() {
      if (_sovietBorders) return _sovietBorders;
      const owner = new Map(), inBloc = new Uint8Array(GEO.length);
      for (let g = 0; g < GEO.length; g++) if (SOVIET.has((GEO[g].n || "").toLowerCase())) { inBloc[g] = 1; for (const ring of GEO[g].p) for (let i = 0; i + 1 < ring.length; i++) owner.set(edgeKey(ring[i], ring[i + 1]), g); }
      const segs = [];
      for (let g = 0; g < GEO.length; g++) { if (!inBloc[g]) continue; for (const ring of GEO[g].p) for (let i = 0; i + 1 < ring.length; i++) { const rev = owner.get(edgeKey(ring[i + 1], ring[i])); if (rev !== undefined && rev > g) segs.push([ring[i], ring[i + 1]]); } }   // shared between two bloc states, counted once
      return (_sovietBorders = segs);
    }
    function drawSovietRepublics(bw) {
      const era = activeEra(year); if (!era || era.present || !era.geo) return;   // geo eras only (merger eras already show republics via synthGroups)
      const ht = histTerr(); if (!ht) return;
      let ussr = null; for (const t of ht) if (/^ussr$/i.test((t.n || "").trim())) { ussr = t; break; }
      if (!ussr) return;
      const segs = sovietRepublicBorders(); if (!segs.length) return;
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
      ctx.beginPath(); for (const ring of ussr.p) addClipped(ring, true); ctx.clip("evenodd");   // clip to the era's actual USSR extent (so e.g. the still-independent 1938 Baltics are excluded)
      ctx.globalAlpha = 0.5; ctx.lineWidth = Math.max(0.5, bw * 0.62); ctx.strokeStyle = border; ctx.beginPath();
      const seg = [0, 0]; for (let i = 0; i < segs.length; i++) { seg[0] = segs[i][0]; seg[1] = segs[i][1]; addClipped(seg, false); }
      ctx.stroke(); ctx.restore();
    }
    // geo-anchored whiteboard ink: re-project each stroke every frame so it stays fixed to the map
    function drawStrokes() {
      const list = activeStroke ? strokes.concat([activeStroke]) : strokes;
      if (!list.length) return;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      const zs = Math.min(2.4, zoom);
      for (let s = 0; s < list.length; s++) {
        const st = list[s], pts = st.pts; if (!pts.length) continue;
        const hl = st.mode === "hl";
        ctx.globalAlpha = hl ? 0.32 : 1;
        ctx.strokeStyle = st.color;
        ctx.lineWidth = Math.max(0.8, (hl ? Math.max(9, st.size * 4) : st.size) * zs);
        let pen = false;
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          proj(pts[i][0], pts[i][1]);
          if (PV < 0) { pen = false; continue; }            // behind the horizon → break the line
          if (!pen) { ctx.moveTo(PX, PY); pen = true; } else ctx.lineTo(PX, PY);
        }
        if (pts.length === 1) { proj(pts[0][0], pts[0][1]); if (PV >= 0) ctx.lineTo(PX + 0.01, PY); }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // pin size by tier (national capital > admin capital > metro), scaled by zoom
    function cityDot(r) { return r === 0 ? clamp(1.7 + zoom * 0.4, 2.2, 4.4) : r === 2 ? clamp(1.5 + zoom * 0.3, 2, 3.4) : clamp(1 + zoom * 0.22, 1.3, 2.4); }
    function rectsHit(a, b) { return a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1]; }
    // label widths cached at a 12px reference (width ∝ font size) so per-frame placement skips measureText
    let cityW = null;
    function ensureCityW() {
      if (cityW && cityW.length === CITIES.length) return;
      cityW = new Float32Array(CITIES.length);
      for (let i = 0; i < CITIES.length; i++) { ctx.font = (CITIES[i].r === 0 ? "600 " : "500 ") + "12px " + labelFont; cityW[i] = ctx.measureText(CITIES[i].n).width; }
    }
    // place EVERY visible city's label without overlap (right/left, then staggered up/down, with a leader line when
    // displaced). A spatial grid keeps the overlap test ~O(1) so the whole pass runs every frame, even while moving.
    let cityCache = null, cityCacheKey = "", countryLabelRects = [];   // country-name boxes (from drawCountryNames) so city labels can avoid them
    function computeCityLayout(showCap, showCities, showDiv) {
      ensureCityW();
      const baseFs = clamp(10 + (zoom - 2) * 1.1, 10, 13.5);
      const out = [], grid = new Map(), CELL = 22, gk = (gx, gy) => gx * 100000 + gy;   // numeric cell keys → no per-call allocation
      const free = (r) => { const x0 = Math.floor(r[0] / CELL), x1 = Math.floor((r[0] + r[2]) / CELL), y0 = Math.floor(r[1] / CELL), y1 = Math.floor((r[1] + r[3]) / CELL); for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) { const arr = grid.get(gk(gx, gy)); if (arr) for (let j = 0; j < arr.length; j++) if (rectsHit(r, arr[j])) return false; } return true; };
      const put = (r) => { const x0 = Math.floor(r[0] / CELL), x1 = Math.floor((r[0] + r[2]) / CELL), y0 = Math.floor(r[1] / CELL), y1 = Math.floor((r[1] + r[3]) / CELL); for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) { const key = gk(gx, gy); let arr = grid.get(key); if (!arr) grid.set(key, arr = []); arr.push(r); } };
      for (let i = 0; i < countryLabelRects.length; i++) put(countryLabelRects[i]);   // city labels yield to the persistent country names baked into the base
      for (let i = 0; i < CITIES.length; i++) {              // capitals first (priority), then by population
        const ci = CITIES[i], tier = ci.r;
        if (tier === 0 ? !showCap : tier === 1 ? !showCities : !showDiv) continue;   // r0 capitals, r1 cities >=1M, r2 division capitals
        proj(ci.c[0], ci.c[1]); if (PV < 0) continue;        // front hemisphere only
        const x = PX, y = PY;
        if (x < -90 || x > W + 90 || y < -40 || y > H + 40) continue;
        const fs = tier === 0 ? baseFs : baseFs - 1.5, dot = cityDot(tier), gap = dot + 3, lh = fs + 3, tw = cityW[i] * fs / 12;
        const cands = [[x + gap, y, false], [x - gap - tw, y, false]];   // right, left (no leader)
        for (let d = 1; d <= 16; d++) { const off = d * (lh - 1); cands.push([x + gap, y - off, true], [x + gap, y + off, true], [x - gap - tw, y - off, true], [x - gap - tw, y + off, true]); }
        let lx = cands[0][0], ly = cands[0][1], lead = false;
        for (let c = 0; c < cands.length; c++) { const r = [cands[c][0], cands[c][1] - lh / 2, tw, lh]; if (free(r) || c === cands.length - 1) { lx = cands[c][0]; ly = cands[c][1]; lead = cands[c][2]; put(r); break; } }
        out.push({ x, y, name: ci.n, lx, ly, tw, fs, dot, tier, lead });
      }
      return out;
    }
    // tier-specific pin: national capital / metro = filled dot + ring; admin-1 capital = hollow diamond
    function drawPin(e) {
      if (e.tier === 2) {
        const s = e.dot + 0.5; ctx.beginPath(); ctx.moveTo(e.x, e.y - s); ctx.lineTo(e.x + s, e.y); ctx.lineTo(e.x, e.y + s); ctx.lineTo(e.x - s, e.y); ctx.closePath();
        ctx.fillStyle = CITY_HOLLOW; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = CITY_DOT; ctx.stroke();
      } else {
        ctx.fillStyle = CITY_DOT; ctx.beginPath(); ctx.arc(e.x, e.y, e.dot, 0, TAU); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = CITY_RING; ctx.stroke();
      }
    }
    // pins + labels; tiers are hard on/off (no fade) and the layout is recomputed every view change (incl. while moving)
    function drawCities(showCap, showCities, showDiv) {
      ctx.save();
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      const key = rotLon.toFixed(2) + "," + rotLat.toFixed(2) + "," + zoom.toFixed(3) + "," + W + "," + H + "," + (showCap ? 1 : 0) + (showCities ? 1 : 0) + (showDiv ? 1 : 0) + (countryNamesOn ? "C" : "");
      if (key !== cityCacheKey) { cityCache = computeCityLayout(showCap, showCities, showDiv); cityCacheKey = key; }
      const L = cityCache;
      for (let i = 0; i < L.length; i++) {
        const e = L[i];
        if (e.lead) { ctx.strokeStyle = CITY_LEAD; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.lx < e.x ? e.lx + e.tw : e.lx, e.ly); ctx.stroke(); }
        drawPin(e);
        ctx.font = (e.tier === 0 ? "600 " : "500 ") + e.fs + "px " + labelFont;
        ctx.lineWidth = 3; ctx.strokeStyle = LBL_HALO; ctx.strokeText(e.name, e.lx, e.ly);
        ctx.fillStyle = LBL_TEXT; ctx.fillText(e.name, e.lx, e.ly);
      }
      ctx.restore();
    }
    // admin-1 (province/state) borders as dotted lines — drawn before the solid country borders so those cover the duplicated coastlines
    function drawAdmin(bw) {
      ctx.save(); ctx.setLineDash([1.6, 2.6]); ctx.lineWidth = Math.max(0.5, bw * 0.7); ctx.strokeStyle = adminCol;
      ctx.beginPath();
      for (let p = 0; p < ADMIN1.b.length; p++) {
        const o = p * 4, x = ADMC[o], y = ADMC[o + 1], z = ADMC[o + 2], sr = ADMC[o + 3];
        if (x * Cx + y * Cy + z * Cz + sr < -0.1) continue;   // back-facing ring
        const px = cx + R * (x * Ex + y * Ey + z * Ez), py = cy - R * (x * Nx + y * Ny + z * Nz), rad = R * sr + 8;
        if (px + rad < 0 || px - rad > W || py + rad < 0 || py - rad > H) continue;   // ring entirely off-screen
        addClipped(ADMIN1.b[p], false);
      }
      ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
    }
    // mountain ranges drawn onto the map: a field of small peak glyphs across each range's extent, plus one label
    function drawRanges() {
      ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round";
      const ph = clamp(2.6 + zoom * 0.7, 3, 8);            // peak height by zoom
      ctx.globalAlpha = 0.82; ctx.fillStyle = rangeCol;
      for (let i = 0; i < RANGES.length; i++) {
        const ks = RANGES[i].k; if (!ks) continue;
        for (let j = 0; j < ks.length; j++) {
          proj(ks[j][0], ks[j][1]); if (PV < 0) continue;
          const x = PX, y = PY; if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
          ctx.beginPath(); ctx.moveTo(x, y - ph); ctx.lineTo(x + ph * 0.82, y + ph * 0.72); ctx.lineTo(x - ph * 0.82, y + ph * 0.72); ctx.closePath(); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      // range names only from the capital-cities zoom level upward (peaks themselves show at any zoom)
      if (zoom >= CAP_Z) {
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = "italic 600 " + clamp(9 + zoom * 0.25, 9.5, 13) + "px " + labelFont;
        const placed = [];
        for (let i = 0; i < RANGES.length; i++) {
          const m = RANGES[i]; proj(m.c[0], m.c[1]); if (PV < 0) continue;
          const x = PX, y = PY; if (x < 0 || x > W || y < 0 || y > H) continue;
          const tw = ctx.measureText(m.n).width, r = [x - tw / 2 - 2, y - 8, tw + 4, 16];
          let hit = false; for (let k = 0; k < placed.length; k++) if (rectsHit(r, placed[k])) { hit = true; break; }
          if (hit) continue; placed.push(r);
          ctx.lineWidth = 2.6; ctx.strokeStyle = lblHaloSoft; ctx.strokeText(m.n, x, y);
          ctx.fillStyle = rangeCol; ctx.fillText(m.n, x, y);
        }
      }
      ctx.restore();
    }
    // one small tree glyph at (x,y); shape varies by forest type
    function drawTree(x, y, sz, type) {
      if (type === "conifer") {            // pine — slim pointed triangle + short trunk
        ctx.beginPath(); ctx.moveTo(x, y - sz * 1.5); ctx.lineTo(x + sz * 0.66, y + sz * 0.32); ctx.lineTo(x - sz * 0.66, y + sz * 0.32); ctx.closePath(); ctx.fill();
        ctx.fillRect(x - sz * 0.12, y + sz * 0.32, sz * 0.24, sz * 0.5);
      } else if (type === "tropical") {    // palm/rainforest — tall trunk + a broad flat crown
        ctx.fillRect(x - sz * 0.1, y - sz * 0.35, sz * 0.2, sz * 1.15);
        ctx.beginPath(); ctx.ellipse(x, y - sz * 0.55, sz * 1.05, sz * 0.5, 0, 0, TAU); ctx.fill();
      } else {                              // broadleaf — round canopy + short trunk
        ctx.fillRect(x - sz * 0.12, y - sz * 0.05, sz * 0.24, sz * 0.7);
        ctx.beginPath(); ctx.arc(x, y - sz * 0.5, sz * 0.8, 0, TAU); ctx.fill();
      }
    }
    // major forests drawn onto the map: a scatter of tree glyphs across each forest, plus one label (mirrors drawRanges)
    function drawForests() {
      ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round";
      const sz = clamp(1.6 + zoom * 0.5, 1.8, 5.5);
      ctx.globalAlpha = 0.92;
      for (let i = 0; i < FORESTS.length; i++) {
        const f = FORESTS[i], ks = f.k; if (!ks) continue;
        ctx.fillStyle = f.t === "conifer" ? forestColD : f.t === "tropical" ? forestColT : forestCol;
        for (let j = 0; j < ks.length; j++) {
          proj(ks[j][0], ks[j][1]); if (PV < 0) continue;
          const x = PX, y = PY; if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
          drawTree(x, y, sz, f.t);
        }
      }
      ctx.globalAlpha = 1;
      if (zoom >= CAP_Z) {   // forest names from the capitals' zoom upward (trees show at any zoom), de-collided
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = "italic 600 " + clamp(9 + zoom * 0.25, 9.5, 13) + "px " + labelFont;
        const placed = [];
        for (let i = 0; i < FORESTS.length; i++) {
          const f = FORESTS[i]; proj(f.c[0], f.c[1]); if (PV < 0) continue;
          const x = PX, y = PY; if (x < 0 || x > W || y < 0 || y > H) continue;
          const tw = ctx.measureText(f.n).width, r = [x - tw / 2 - 2, y - 8, tw + 4, 16];
          let hit = false; for (let k = 0; k < placed.length; k++) if (rectsHit(r, placed[k])) { hit = true; break; }
          if (hit) continue; placed.push(r);
          ctx.lineWidth = 2.6; ctx.strokeStyle = lblHaloSoft; ctx.strokeText(f.n, x, y);
          ctx.fillStyle = f.t === "conifer" ? forestColD : f.t === "tropical" ? forestColT : forestCol; ctx.fillText(f.n, x, y);
        }
      }
      ctx.restore();
    }
    // persistent country-name layer (the "Country names" toggle): every front-facing country, de-collided
    function drawCountryNames() {
      ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      ctx.font = "600 " + Math.round(clamp(10 + zoom * 0.6, 10.5, 16)) + "px " + labelFont;
      countryLabelRects.length = 0; const placed = countryLabelRects;   // remember boxes so city labels can avoid them
      for (let p = 0; p < GEO.length; p++) {
        if (!VIS[p]) continue; const c = GEO[p];
        proj(c.c[0], c.c[1]); if (PV < 0) continue;
        const x = PX, y = PY; if (x < 0 || x > W || y < 0 || y > H) continue;
        const tw = ctx.measureText(c.n).width, r = [x - tw / 2 - 3, y - 8, tw + 6, 16];
        let hit = false; for (let k = 0; k < placed.length; k++) if (rectsHit(r, placed[k])) { hit = true; break; }
        if (hit) continue; placed.push(r);
        ctx.lineWidth = 3.5; ctx.strokeStyle = LBL_HALO; ctx.strokeText(c.n, x, y);
        ctx.fillStyle = LBL_TEXT; ctx.fillText(c.n, x, y);
      }
      ctx.restore();
    }
    // river names, curved along each river, drawn with the Rivers layer once zoomed in a little (too many at low zoom)
    function drawRiverLabels() {
      if (zoom < RIVER_LABEL_Z) return;
      ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      ctx.font = "italic 500 " + clamp(8.5 + zoom * 0.22, 9, 12.5) + "px " + labelFont;
      const placed = [];
      for (let i = 0; i < RIVERS.length; i++) {            // RIVERS are importance-ordered, so big rivers win the de-collision
        const segs = RIVERS[i].p; let best = null, bestLen = -1;
        for (let s = 0; s < segs.length; s++) if (segs[s].length > bestLen) { bestLen = segs[s].length; best = segs[s]; }
        if (!best || best.length < 2) continue;
        const mi = best.length >> 1, mid = best[mi], a = best[Math.max(0, mi - 1)], b = best[Math.min(best.length - 1, mi + 1)];
        proj(mid[0], mid[1]); if (PV < 0) continue;
        const x = PX, y = PY; if (x < 0 || x > W || y < 0 || y > H) continue;
        // rotation from whichever neighbours are front-facing (a back-facing point folds onto the disk and skews the angle)
        proj(a[0], a[1]); const aok = PV >= 0, ax = PX, ay = PY;
        proj(b[0], b[1]); const bok = PV >= 0, bx = PX, by = PY;
        let ang = (aok && bok) ? Math.atan2(by - ay, bx - ax) : aok ? Math.atan2(y - ay, x - ax) : bok ? Math.atan2(by - y, bx - x) : 0;
        if (ang > Math.PI / 2) ang -= Math.PI; else if (ang < -Math.PI / 2) ang += Math.PI;   // keep text upright
        const nm = RIVERS[i].n, tw = ctx.measureText(nm).width;
        // collision box = AABB of the ROTATED label (tw wide × ~14 tall), so a near-vertical name tests its true footprint
        const ca = Math.abs(Math.cos(ang)), sa = Math.abs(Math.sin(ang)), hw = (tw / 2) * ca + 7 * sa, hh = (tw / 2) * sa + 7 * ca;
        const r = [x - hw - 2, y - hh - 1, hw * 2 + 4, hh * 2 + 2];
        let hit = false; for (let k = 0; k < placed.length; k++) if (rectsHit(r, placed[k])) { hit = true; break; }
        if (hit) continue; placed.push(r);
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
        ctx.lineWidth = 2.2; ctx.strokeStyle = LBL_HALO; ctx.strokeText(nm, 0, 0);   // white halo separates the small label from the like-coloured river line it sits on
        ctx.fillStyle = waterCol; ctx.fillText(nm, 0, 0);   // same colour as the Water (sea/lake) labels
        ctx.restore();
      }
      ctx.restore();
    }
    // the zoom at which a water label of rank r appears: oceans + great seas always, smaller waters only when closer
    function waterLabelZoom(r) { return r <= 2 ? CAP_Z : r === 3 ? MAJOR_Z : r === 4 ? 3.3 : CLOSE_Z; }   // water labels start at the capitals' zoom (CAP_Z), not when zoomed out
    // sea / ocean / strait / lake names, sized by rank (oceans largest), de-collided
    function drawWaterLabels() {
      ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      const placed = [];
      for (let i = 0; i < WATER.length; i++) {            // WATER is rank-ordered (0 = biggest), so oceans win de-collision
        const wt = WATER[i]; if (zoom < waterLabelZoom(wt.r)) continue;
        proj(wt.c[0], wt.c[1]); if (PV < 0) continue;
        const x = PX, y = PY; if (x < 0 || x > W || y < 0 || y > H) continue;
        const isOcean = wt.r <= 0, fs = clamp((isOcean ? 13.5 : 11.5 - wt.r * 0.5) + zoom * 0.5, 9, isOcean ? 20 : 14.5);
        ctx.font = "italic " + (isOcean ? "600 " : "500 ") + fs + "px " + labelFont;
        const tw = ctx.measureText(wt.n).width, r = [x - tw / 2 - 3, y - fs / 2 - 1, tw + 6, fs + 2];
        let hit = false; for (let k = 0; k < placed.length; k++) if (rectsHit(r, placed[k])) { hit = true; break; }
        if (hit) continue; placed.push(r);
        ctx.lineWidth = 2.6; ctx.strokeStyle = lblHaloSoft; ctx.strokeText(wt.n, x, y);
        ctx.fillStyle = waterCol; ctx.fillText(wt.n, x, y);
      }
      ctx.restore();
    }
    // cached "static" globe (ocean + graticule + land + lakes + borders + rim) for the settled view,
    // so hover/select/ink redraws only blit it + overlays instead of re-stroking ~117k points
    const baseCv = document.createElement("canvas");
    let baseKey = "", baseValid = false;
    // which map applies at a given timeline year: present-day at the present year, else the most recent historical era
    // whose year <= y; null when no era covers that year (the globe then shows the work-in-progress note).
    function activeEra(y) {
      if (y >= MAXY) return { present: true };
      const eras = window.TIMELINE || []; let best = null;
      for (let i = 0; i < eras.length; i++) { const e = eras[i]; if (e && e.year <= y && (!best || e.year > best.year)) best = e; }
      return best;
    }
    function eraKey(y) { const e = activeEra(y); return e ? (e.present ? "P" : "E" + (e.id || e.year)) : "none"; }
    function viewKey() { return rotLon.toFixed(2) + "," + rotLat.toFixed(2) + "," + zoom.toFixed(3) + "," + W + "," + H + "," + (bordersOn ? 1 : 0) + (riversOn ? 1 : 0) + (riverLabelsOn ? 1 : 0) + (waterOn ? 1 : 0) + (rangesOn ? 1 : 0) + (adminOn ? 1 : 0) + (forestsOn ? 1 : 0) + (countryNamesOn ? 1 : 0) + (heightmapOn ? 1 : 0) + "," + eraKey(year) + "," + mapEditRev + "," + land + "|" + ocean + "|" + border + "|" + rim + "|" + grat; }
    function renderStatic(bw) {
      ctx.clearRect(0, 0, W, H);
      countryLabelRects.length = 0;   // repopulated by drawCountryNames() below if the layer is on; empty otherwise so cities don't avoid stale boxes
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fillStyle = ocean; ctx.fill();   // ocean
      drawGraticule();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      const era = activeEra(year);
      if (!era) {   // no map for this year → empty ocean + graticule (the WIP note overlays it)
        ctx.restore();
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.lineWidth = 1.2; ctx.strokeStyle = rim; ctx.stroke();
        return;
      }
      if (!era.present) {
        // HISTORICAL ERA: the landmass outline, coastline, lakes, rivers and mountains stay present-day (world.js et al.)
        // at full resolution and exact position — only the political borders on land change.
        for (let p = 0; p < GEO.length; p++) VIS[p] = cullHidden(p) ? 0 : 1;
        // NON-CLICKABLE (unclaimed / wilderness) land renders DARKER than the clickable states: fill all land in the
        // darker shade + close its seams in that shade (so world.js country outlines never show as light lines over the
        // wilderness), then re-fill the CLICKABLE land (inside an era territory) in the normal colour + light seams,
        // clipped to the territories so the light region follows the world.js coastline. Always on (also while rotating).
        const _terr = histTerr() || era.geo || [];
        const _wild = _terr.length > 0;
        const _lw = Math.max(0.8, bw);
        const fillGEO = () => { for (let p = 0; p < GEO.length; p++) { if (!VIS[p]) continue; const rings = GEO[p].p; ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], true); ctx.fill("evenodd"); } };
        const strokeGEO = () => { for (let p = 0; p < GEO.length; p++) { if (!VIS[p]) continue; const rings = GEO[p].p; ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], false); ctx.stroke(); } };
        ctx.lineWidth = _lw;
        const _seams = !moving;                                                        // seam strokes (~half the added cost) only when settled; fills stay on so the darkening shows while rotating
        if (_wild) {
          ctx.fillStyle = landWild; fillGEO();
          if (_seams) { ctx.strokeStyle = landWild; strokeGEO(); }                     // dark seams — invisible over the dark wilderness (no modern borders show)
          ctx.save();
          ctx.beginPath(); for (let t = 0; t < _terr.length; t++) { const rings = _terr[t].p || []; for (let r = 0; r < rings.length; r++) addClipped(rings[r], true); } ctx.clip((era.geo && era.geo.length) ? "nonzero" : "evenodd");   // geo eras: CCW-normalized rings + NONZERO so OVERLAPPING territories fill as land (even-odd would punch a dark hole at every overlap); merger eras use raw world.js geometry → keep even-odd
          ctx.fillStyle = land; fillGEO();
          if (_seams) { ctx.strokeStyle = land; strokeGEO(); }                         // light seams, clipped to the clickable land
          ctx.restore();
        } else {
          ctx.fillStyle = land; fillGEO();
          ctx.strokeStyle = land; strokeGEO();                                         // close present-day coastline seams
        }
        if (heightmapOn) drawHeightmap();                                                // terrain + sea-floor relief (same in every era); low-res while moving, crisp + cached when settled
        ctx.fillStyle = ocean;                                                         // lakes (present-day)
        for (let p = 0; p < LAKES.length; p++) { const rings = LAKES[p]; ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], true); ctx.fill("evenodd"); }
        if (riversOn && RIVERS.length) { ctx.lineWidth = clamp(0.4 + zoom * 0.16, 0.5, 1.8); ctx.strokeStyle = riverCol; ctx.beginPath(); for (let p = 0; p < RIVERS.length; p++) { const segs = RIVERS[p].p; for (let s = 0; s < segs.length; s++) addClipped(segs[s], false); } ctx.stroke(); }
        if (rangesOn && RANGES.length) drawRanges();
        if (forestsOn && FORESTS.length) drawForests();
        if (bordersOn) {                                                               // era political borders — ONE geometry source per era (no source-mixing → no double borders):
          const terr = histTerr() || era.geo || [];                                    // merger-only eras synthesize from world.js (full 2026 res); older eras use their own (topology-preserving) geometry
          const seg = [0, 0];
          ctx.lineWidth = bw; ctx.strokeStyle = border; ctx.beginPath();                // '0' = main era political border (inter-group / interior), drawn bold
          for (let p = 0; p < terr.length; p++) { const rings = terr[p].p || [], cm = terr[p].c || []; for (let r = 0; r < rings.length; r++) { const ring = rings[r], mask = cm[r] || "", noMask = !mask; for (let i = 0; i + 1 < ring.length; i++) { if (!noMask && mask.charCodeAt(i) !== 48) continue; seg[0] = ring[i]; seg[1] = ring[i + 1]; addClipped(seg, false); } } }   // noMask = an editor-drawn territory → stroke its full outline
          ctx.stroke();
          // '2' = sub-country border (a present-day country INSIDE a merged era entity, e.g. a Soviet republic within the USSR) — drawn light so the merged unit still reads as one
          ctx.save(); ctx.globalAlpha = 0.5; ctx.lineWidth = Math.max(0.5, bw * 0.62); ctx.beginPath();
          for (let p = 0; p < terr.length; p++) { const rings = terr[p].p || [], cm = terr[p].c || []; for (let r = 0; r < rings.length; r++) { const ring = rings[r], mask = cm[r] || ""; for (let i = 0; i + 1 < ring.length; i++) { if (mask.charCodeAt(i) !== 50) continue; seg[0] = ring[i]; seg[1] = ring[i + 1]; addClipped(seg, false); } } }
          ctx.stroke(); ctx.restore();
          const ce = coastEdges(); ctx.beginPath(); for (let i = 0; i < ce.length; i++) addClipped(ce[i], false);   // exact present-day coastline → coasts look identical to the modern map
          if (era.groups && !(era.geo && era.geo.length)) { const pb = presentBorderEdges(); for (let i = 0; i < pb.length; i++) addClipped(pb[i], false); }   // + present-day inter-country borders world.js left un-shared — ONLY on groups eras (their borders ARE present-day); older eras get their borders from their own geo, so no anachronistic squiggles
          ctx.stroke();
          drawUKConstituents(bw);                                                      // England–Scotland / England–Wales internal borders, light
          drawSovietRepublics(bw);                                                     // union-republic borders inside the geo-era USSR, light (clipped to its extent)
        }
        if (riverLabelsOn && RIVERS.length) drawRiverLabels();
        if (waterOn && WATER.length) drawWaterLabels();
        ctx.restore();
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.lineWidth = 1.2; ctx.strokeStyle = rim; ctx.stroke();
        return;
      }
      const close = zoom >= CAP_Z;   // admin (province) borders appear at the same zoom as capitals
      for (let p = 0; p < GEO.length; p++) VIS[p] = cullHidden(p) ? 0 : 1;   // skip countries wholly behind the horizon / off-screen
      // land — always full detail, even while moving, so coastlines/borders never drop resolution
      ctx.fillStyle = land;
      for (let p = 0; p < GEO.length; p++) { if (!VIS[p]) continue; const rings = GEO[p].p; ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], true); ctx.fill("evenodd"); }
      // close inter-country seams (the Natural Earth polygons don't perfectly tile) by stroking each outline in the
      // land colour — only needed when borders are OFF; the solid border pass below covers the same seams when on
      if (!bordersOn) {
        ctx.lineWidth = Math.max(0.8, bw); ctx.strokeStyle = land;
        for (let p = 0; p < GEO.length; p++) { if (!VIS[p]) continue; const rings = GEO[p].p; ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], false); ctx.stroke(); }
      }
      if (heightmapOn) drawHeightmap();                                                // terrain + sea-floor relief; low-res while moving, crisp + cached when settled
      // major inland seas & lakes as water on top of the land
      ctx.fillStyle = ocean;
      for (let p = 0; p < LAKES.length; p++) { const rings = LAKES[p]; ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], true); ctx.fill("evenodd"); }
      // rivers (toggle) — thin blue lines on the land
      if (riversOn && RIVERS.length) {
        ctx.lineWidth = clamp(0.4 + zoom * 0.16, 0.5, 1.8); ctx.strokeStyle = riverCol; ctx.beginPath();
        for (let p = 0; p < RIVERS.length; p++) { const segs = RIVERS[p].p; for (let s = 0; s < segs.length; s++) addClipped(segs[s], false); }
        ctx.stroke();
      }
      // admin-1 province borders (dotted, toggle) at close zoom — before the solid country lines so those cover the duplicated coastlines
      if (adminOn && close && ADMIN1.b.length) drawAdmin(bw);
      // country borders (solid, toggle). Lakes are NOT outlined — they're covered by the country fill and just re-filled as
      // water (no shore stroke), so inland seas & lakes read clean like on the historical maps. When borders are OFF but
      // provinces are ON, re-stroke the country outlines in the land colour so the dotted province rings that trace coasts/national edges are hidden
      if (bordersOn) {
        ctx.lineWidth = bw; ctx.strokeStyle = border;
        for (let p = 0; p < GEO.length; p++) { if (!VIS[p]) continue; const rings = GEO[p].p; ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], false); ctx.stroke(); }
      } else if (adminOn && close && ADMIN1.b.length) {
        ctx.lineWidth = Math.max(0.8, bw); ctx.strokeStyle = land;
        for (let p = 0; p < GEO.length; p++) { if (!VIS[p]) continue; const rings = GEO[p].p; ctx.beginPath(); for (let r = 0; r < rings.length; r++) addClipped(rings[r], false); ctx.stroke(); }
      }
      if (bordersOn) drawUKConstituents(bw);                                            // England–Scotland / England–Wales internal borders, light
      // mountain ranges (peak field + labels) drawn onto the map (toggle)
      if (rangesOn && RANGES.length) drawRanges();
      if (forestsOn && FORESTS.length) drawForests();   // major forests (tree-glyph field + labels)
      // river names (part of the Rivers layer) and water-body names (Water layer)
      if (riverLabelsOn && RIVERS.length) drawRiverLabels();
      if (waterOn && WATER.length) drawWaterLabels();
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.lineWidth = 1.2; ctx.strokeStyle = rim; ctx.stroke();   // rim
      if (countryNamesOn) drawCountryNames();   // persistent country-name layer (unclipped so names aren't cut at the limb)
    }
    // coalesce high-frequency input (mouse move, wheel) to at most one render per animation frame. We back the rAF with a
    // setTimeout FALLBACK: an embedded host can pause/drop requestAnimationFrame under sustained input (e.g. a fast scroll),
    // and since the old guard only cleared inside the rAF callback, one dropped frame would leave `_drawReq` stuck forever and
    // silently skip EVERY later render — the zoom kept changing but the disk stopped growing. Now a draw always lands ≤48ms.
    let _drawReq = 0, _drawTimer = 0;
    function _flushDraw() { if (_drawReq) { cancelAnimationFrame(_drawReq); _drawReq = 0; } if (_drawTimer) { clearTimeout(_drawTimer); _drawTimer = 0; } draw(); }
    function scheduleDraw() { if (_drawReq || _drawTimer) return; _drawReq = requestAnimationFrame(_flushDraw); _drawTimer = setTimeout(_flushDraw, 48); }
    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);   // ALWAYS start from a fully clean canvas (device px). If any prior frame under-cleared (e.g. a transient bad W/H mid-gesture), its rim would otherwise persist as a stray ghost ring outside the disk.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2; R = baseR * zoom; setBasis();
      atlasView.rotLon = rotLon; atlasView.rotLat = rotLat; atlasView.zoom = zoom;   // persist so a re-render restores the view
      updateLegendVisibility();   // reveal legend rows progressively with zoom (cheap: only touches the DOM when the set changes)
      const bw = Math.max(0.5, 0.65 * Math.min(2.2, zoom));
      const key = viewKey();
      if (!moving && baseValid && baseKey === key) {                 // reuse cached static globe
        // clear first: baseCv is a disk on a TRANSPARENT background, so drawImage alone composites OVER whatever was on the
        // canvas and leaves stale pixels wherever the cache is transparent (outside the disk) — which can read as ghost rings.
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(baseCv, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else {
        renderStatic(bw);
        if (!moving) {                                               // cache the settled static globe
          if (baseCv.width !== canvas.width || baseCv.height !== canvas.height) { baseCv.width = canvas.width; baseCv.height = canvas.height; }
          const b = baseCv.getContext("2d"); b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, baseCv.width, baseCv.height); b.drawImage(canvas, 0, 0);
          baseValid = true; baseKey = key;
        } else baseValid = false;
      }
      // dynamic overlays (clipped to the disk): matte country fills + whiteboard ink. Present-day country fills + city pins
      // belong only to the present-day map — historical eras / empty years show their own borders (or nothing).
      if (mapEdit) { mapEditDraw(); return; }   // the map editor owns the dynamic overlay
      const eraNow = activeEra(year), onPresent = !!(eraNow && eraNow.present), fillsOn = onPresent || !!histTerr();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); ctx.lineJoin = "round"; ctx.lineCap = "round";
      if (fillsOn) {   // clickable countries (present-day) or era territories (historical) — hover + selection fills
        selSet.forEach((idx) => paintFill(idx, true));
        if (subSelGeo >= 0 && subSelGeo < GEO.length) paintFillRings(GEO[subSelGeo].p, true, null, hiddenEdgeSet(), false);   // double-click drill: present-day country within a merger era — its full outline minus any border the era hides
        for (let u = 0; u < subSelUK.length; u++) { const ui = subSelUK[u]; if (ui >= 0 && ui < UK.length) paintFillRings(UK[ui].p, true, UK[ui].c, null, true); }   // drilled UK constituent(s): internal '0' borders + present-day coast clipped to it
        if (hoverIdx >= 0 && !selSet.has(hoverIdx)) paintFill(hoverIdx, false);
      }
      drawStrokes();
      ctx.restore();
      // cities — hard zoom cutoffs (no fade), each tier independently toggled; present-day map only
      if (onPresent) {
        const showCap = zoom >= CAP_Z && citiesOn, showCities = zoom >= MAJOR_Z && majorCitiesOn, showDiv = zoom >= MAJOR_Z && divCapsOn;
        if (showCap || showCities || showDiv) drawCities(showCap, showCities, showDiv);
      } else if (zoom >= CAP_Z && eraNow && !eraNow.present && eraNow.cities && eraNow.cities.length) drawEraCities(eraNow, false);   // a historical era's capitals — same zoom cutoff (CAP_Z) as present-day capitals
      // country names are no longer tied to hover/selection — they're a persistent layer via the "Country names" legend toggle (drawn in renderStatic)
    }
    // Some embedded webviews (e.g. the Claude Code live preview) DON'T repaint the <canvas> after a preventDefault'd wheel gesture:
    // draw() updates the backing store but the screen never refreshes, so the disk looks frozen while it redraws every notch
    // (verified: the draw counter climbs but the pixels don't). Discrete events (a +/- click) and — the user's key clue — RESIZING
    // THE WINDOW do refresh it. A window resize reallocates the canvas backing store, so we mimic exactly that: while a wheel
    // gesture is active, each draw toggles the backing width by 1 device px, forcing the host to re-rasterize and composite the
    // canvas. (A CSS transform nudge also forced paint but onion-skinned old frames into ghost rings; reallocating is clean.) It's
    // gated to wheel gestures via `wheelActive` so drag/idle draws — which already paint — keep their fast path.
    let _cmp = 0, wheelActive = false, _lastComposite = 0;
    function forceComposite() {
      // Force the host to repaint the canvas (it doesn't after a preventDefault'd wheel — see below) by REALLOCATING the backing,
      // the same thing a window-resize does. Toggle the backing HEIGHT down by 1 device px and match canvas.style.height, so the
      // render SCALE stays exactly `dpr` and the disk's pixels are byte-identical every frame — only a 1px strip at the very BOTTOM
      // edge (behind the timeline bar) toggles. An earlier version toggled the WIDTH while leaving CSS width fixed, which changed
      // the backing:display scale each frame → zoomed coastlines rendered at slightly different sizes and the host onion-skinned
      // them into an amber ghost glow (and cities flickered). Fixing the scale kills the smear; toggling the size (vs re-assigning
      // the same value) still guarantees the realloc fires even if the host optimizes a same-value assignment away.
      _cmp ^= 1;
      const h = Math.max(2, Math.round(H * dpr) - _cmp);
      canvas.width = Math.round(W * dpr); canvas.height = h;
      canvas.style.width = W + "px"; canvas.style.height = (h / dpr) + "px";
    }
    function resize() {
      const r = stage.getBoundingClientRect();
      let w = r.width, h = r.height;
      // some hosts momentarily report a COLLAPSED rect for the fixed globe stage during a scroll/reflow; using it would bake a
      // tiny baseR and shrink the whole globe (disk stops filling, stray rings). Fall back to the viewport when the measurement
      // is implausibly small for a full-bleed element.
      if (w < window.innerWidth * 0.6) w = window.innerWidth;
      if (h < window.innerHeight * 0.4) h = Math.max(10, window.innerHeight - 152);   // ≈ viewport minus top nav + bottom timeline
      W = Math.max(10, w); H = Math.max(10, h);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      baseR = Math.min(W, H) * 0.46;
      draw();
    }

    // pointer interaction (drag to rotate, wheel + pinch to zoom)
    const ptrs = new Map(); let dragging = false, last = null, pinch = 0, downX = 0, downY = 0, moved = false, wbRotating = false;
    // spin momentum: on release keep turning with the drag's velocity, then ease out (Google-Earth feel)
    let spinRAF = 0, velLon = 0, velLat = 0, lastMoveT = 0;
    const SPIN_CAP = 2.4; // deg/ms ceiling so a hard flick spins fast but stays sane
    function stopSpin() { if (spinRAF) { cancelAnimationFrame(spinRAF); spinRAF = 0; } }
    // motion gate: mark `moving` during drag/spin/zoom (gates base-cache reuse); repaint + re-cache when settled
    let settleT = 0;
    function settle() { settleT = 0; if (moving) { moving = false; if (wheelActive) forceComposite(); draw(); } wheelActive = false; }   // ONE backing realloc per wheel gesture (only when it stops) → the host repaints the settled frame cleanly. Per-frame reallocs onion-skinned into a ghost glow, so we don't repaint mid-gesture (the disk snaps to size on release).
    function startMotion() { moving = true; if (settleT) { clearTimeout(settleT); settleT = 0; } }
    function endMotion(ms) { if (settleT) clearTimeout(settleT); settleT = setTimeout(settle, ms == null ? 130 : ms); }
    // geo-anchored whiteboard input (active only when WB draw-mode is on)
    const localXY = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    function eraseAt(lx, ly) {
      const rad = Math.max(12, WB.size * 5), r2 = rad * rad;
      for (let s = strokes.length - 1; s >= 0; s--) {
        const pts = strokes[s].pts;
        for (let i = 0; i < pts.length; i++) { proj(pts[i][0], pts[i][1]); if (PV < 0) continue; const a = PX - lx, b = PY - ly; if (a * a + b * b < r2) { strokes.splice(s, 1); wbChanged = true; break; } }
      }
    }
    function wbDown(e) {
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      stopSpin(); settle();
      const xy = localXY(e);
      if (WB.mode === "erase") { erasing = true; eraseAt(xy[0], xy[1]); draw(); return; }
      const ll = screenToLonLat(xy[0], xy[1]);
      activeStroke = { mode: WB.mode === "hl" ? "hl" : "pen", color: WB.color, size: WB.size, pts: ll ? [ll] : [] };
      draw();
    }
    function wbMove(e) {
      const xy = localXY(e);
      if (erasing) { eraseAt(xy[0], xy[1]); draw(); return; }
      if (!activeStroke) return;
      const ll = screenToLonLat(xy[0], xy[1]); if (ll) { activeStroke.pts.push(ll); draw(); }
    }
    function wbUp() {
      if (erasing) { erasing = false; if (wbChanged) { wbChanged = false; gSnapshot(); } return; }   // snapshot after an erase drag that removed something
      if (activeStroke) { const committed = activeStroke.pts.length > 0; if (committed) strokes.push(activeStroke); activeStroke = null; draw(); if (committed) gSnapshot(); }
    }
    function flingSpin(upT) {
      if (upT - lastMoveT > 90) return;                 // released after a pause → no throw
      if (Math.hypot(velLon, velLat) < 0.0025) return;  // too slow to bother
      let prevT = performance.now();
      const frame = (t) => {
        if (!canvas.isConnected) { spinRAF = 0; return; } // left the page — stop
        const dt = Math.min(40, t - prevT); prevT = t;
        rotLon = wrap(rotLon + velLon * dt);
        const nlat = clamp(rotLat + velLat * dt, -88, 88);
        if (nlat === rotLat) velLat = 0;                 // hit a pole — kill vertical drift
        rotLat = nlat;
        const decay = Math.pow(0.96, dt / 16.67);        // frame-rate-independent friction
        velLon *= decay; velLat *= decay;
        draw();
        if (Math.hypot(velLon, velLat) > 0.0009) spinRAF = requestAnimationFrame(frame);
        else { spinRAF = 0; settle(); }   // spin done → repaint at full detail
      };
      stopSpin(); startMotion(); spinRAF = requestAnimationFrame(frame);
    }
    const ptrDist = () => { const a = [...ptrs.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); };
    canvas.addEventListener("pointerdown", (e) => {
      const rotateBtn = e.button === 1 || e.button === 2;   // middle / right button: rotate even while the drawing tool is on
      if (WB.enabled && !mapEdit && !rotateBtn && !wbRotating) { wbDown(e); return; }   // draw-mode left button → ink (but not mid right/middle rotate, and not while map-editing)
      if (WB.enabled && !mapEdit) wbRotating = true;         // draw-mode right/middle → rotate the globe instead
      if (mapEdit && !rotateBtn && mapEditPointerDown(e)) { try { canvas.setPointerCapture(e.pointerId); } catch (x) {} return; }   // editor: grab a vertex / place to drag (else fall through to rotate)
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      stopSpin(); velLon = 0; velLat = 0;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 1) { dragging = true; last = { x: e.clientX, y: e.clientY }; lastMoveT = e.timeStamp; downX = e.clientX; downY = e.clientY; moved = false; }
      else if (ptrs.size === 2) { dragging = false; pinch = ptrDist(); moved = true; velLon = 0; velLat = 0; }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (WB.enabled && !mapEdit && !wbRotating) { wbMove(e); return; }   // draw-mode: extend the stroke — unless rotating via right/middle button
      if (mapEdit && mapDragging) { mapEditPointerMove(e); return; }   // editor: drag the grabbed vertex / place
      if (ptrs.size === 0) { // hover (no button down): highlight the country under the cursor
        if (spinRAF) return;                              // don't chase the globe while it coasts
        const r = canvas.getBoundingClientRect();
        const idx = countryAt(e.clientX - r.left, e.clientY - r.top);
        if (idx !== hoverIdx) { hoverIdx = idx; canvas.style.cursor = idx >= 0 ? "pointer" : "grab"; scheduleDraw(); }
        return;
      }
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size >= 2) { const d = ptrDist(); if (pinch) { startMotion(); zoom = clamp(zoom * (d / pinch), ZMIN, ZMAX); scheduleDraw(); } pinch = d; return; }
      if (dragging && last) {
        if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) { moved = true; startMotion(); } // only a real drag enters motion
        const k = 0.26 / zoom;
        const dLon = -(e.clientX - last.x) * k, dLat = (e.clientY - last.y) * k;
        rotLon = wrap(rotLon + dLon);
        rotLat = clamp(rotLat + dLat, -88, 88);
        const now = e.timeStamp || performance.now(), dt = Math.max(8, now - lastMoveT);
        velLon = velLon * 0.4 + (dLon / dt) * 0.6;       // EMA, weighted to the latest motion
        velLat = velLat * 0.4 + (dLat / dt) * 0.6;
        const sp = Math.hypot(velLon, velLat);
        if (sp > SPIN_CAP) { const s = SPIN_CAP / sp; velLon *= s; velLat *= s; }
        lastMoveT = now; last = { x: e.clientX, y: e.clientY }; scheduleDraw();
      }
    });
    function ptrUp(e) {
      if (WB.enabled && !mapEdit && !wbRotating) { wbUp(e); return; }
      if (mapEdit && mapDragging) { mapEditPointerUp(); try { canvas.releasePointerCapture(e.pointerId); } catch (x) {} return; }   // editor: finish a vertex / place drag
      const tap = ptrs.size === 1 && ptrs.has(e.pointerId) && !moved; // a click/tap, not a drag/pinch
      if (ptrs.has(e.pointerId)) ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinch = 0;
      if (ptrs.size === 0) {
        dragging = false; last = null; const wasRotating = wbRotating; wbRotating = false;
        if (tap && !wasRotating) { // click: in edit mode → editor action; else (de)select a country + its info popup
          const r = canvas.getBoundingClientRect(), tpx = e.clientX - r.left, tpy = e.clientY - r.top;
          if (mapEdit) { mapTapSelect(tpx, tpy); }
          else {
            const now = e.timeStamp || performance.now();
            const sameSpot = (now - lastTapT < 400) && Math.hypot(tpx - lastTapX, tpy - lastTapY) < 14;
            tapCount = sameSpot ? tapCount + 1 : 1;   // 1 = single, 2 = double, 3 = triple (same spot within 400ms)
            lastTapT = now; lastTapX = tpx; lastTapY = tpy;
            const isDbl = tapCount === 2, isTriple = tapCount >= 3;
            const ht = histTerr(), eraN = activeEra(year);
            const geoEra = !!(ht && eraN && eraN.geo && eraN.geo.length && !eraN.present);   // historical GEO era → territories carry a `.mother` (sovereign), so colonies group under their empire
            // UK constituent drill (England / Scotland / Wales / N. Ireland). The constituents are the DEEPEST level, so they're
            // reached by a TRIPLE-click in a geo era (empire → country → constituents) and a double-click elsewhere (country → constituents).
            if ((geoEra ? isTriple : isDbl) && UK.length) {
              const ll = screenToLonLat(tpx, tpy), ch = ll ? constituentHit(ll[0], ll[1]) : null;
              if (ch) { subSelUK = ch.idxs; subSelGeo = -1; selSet.clear(); showCountryPopupName(ch.name, true); hoverIdx = -1; draw(); return; }
            }
            if (geoEra) {
              const idx = countryAt(tpx, tpy);
              subSelGeo = -1; subSelUK = [];
              if (idx < 0) { selSet.clear(); hideCountryPopup(); hoverIdx = -1; draw(); }
              else if (isDbl || isTriple) { selSet.clear(); selSet.add(idx); showCountryPopup(idx); hoverIdx = idx; draw(); }   // 2nd/3rd click → the specific territory / home country (British Raj, or the UK metropole)
              else { const mother = ht[idx].mother || ht[idx].n; selSet.clear(); for (let i = 0; i < ht.length; i++) if ((ht[i].mother || ht[i].n) === mother) selSet.add(i); showCountryPopupName(empireName(mother)); hoverIdx = idx; draw(); }   // 1st click → the whole EMPIRE (mother + all its colonies), named as the empire (e.g. the British Empire)
              return;
            }
            // merger-only era / present-day map: double-click drills into the present-day country that the merged entity is "made of"
            if (isDbl && ht) {
              const g = countryAt(tpx, tpy, true);   // present-day country under the cursor (ignores the era grouping)
              const eraIdx = countryAt(tpx, tpy);
              const eraName = eraIdx >= 0 ? entityName(eraIdx) : "";
              if (g >= 0 && GEO[g].n && GEO[g].n !== eraName) { subSelGeo = g; selSet.clear(); showCountryPopupName(GEO[g].n); hoverIdx = -1; draw(); lastTapT = 0; return; }
            }
            subSelGeo = -1; subSelUK = [];
            const idx = countryAt(tpx, tpy);
            if (idx >= 0) { const was = selSet.has(idx); selSet.clear(); if (was) { hideCountryPopup(); } else { selSet.add(idx); showCountryPopup(idx); } }
            else { selSet.clear(); hideCountryPopup(); }
            hoverIdx = idx; draw();
          }
        } else { flingSpin(e.timeStamp || performance.now()); if (!spinRAF) settle(); }
      }
      else { const p = [...ptrs.values()][0]; last = { x: p.x, y: p.y }; dragging = true; lastMoveT = e.timeStamp || performance.now(); }
    }
    canvas.addEventListener("pointerup", ptrUp);
    canvas.addEventListener("pointercancel", ptrUp);
    canvas.addEventListener("pointerleave", () => { if (hoverIdx !== -1) { hoverIdx = -1; canvas.style.cursor = "grab"; draw(); } });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());   // right-drag rotates; don't pop the browser menu
    // Wheel-zoom. Bound to WINDOW in the CAPTURE phase (not just the canvas) so it fires whichever element the host routes the
    // wheel to — some embedded hosts (e.g. the Claude Code live preview) deliver `wheel` to a scroll container / parent rather
    // than the canvas, which made scroll-zoom look dead there even though the code was fine. We scope it to when the pointer is
    // over the globe stage so it never hijacks scrolling elsewhere, and stopPropagation so the host can't also scroll its pane.
    // (The on-screen +/− buttons + keyboard remain for any host that swallows wheel events entirely before the DOM sees them.)
    function onGlobeWheel(e) {
      if (!canvas.isConnected) { window.removeEventListener("wheel", onGlobeWheel, true); return; }
      const sr = stage.getBoundingClientRect();
      if (e.clientX < sr.left || e.clientX > sr.right || e.clientY < sr.top || e.clientY > sr.bottom) return;   // pointer isn't over the globe → let normal scrolling happen
      try { e.preventDefault(); e.stopPropagation(); } catch (_e) {}
      stopSpin(); startMotion(); wheelActive = true;   // wheelActive → draw() reallocates the backing so the host repaints (cleared by settle())
      const px = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? (H || 800) : 1);   // normalize lines/pages → pixels
      // zoom TOWARD the cursor: note the geo point under the pointer, zoom, then rotate so that same point stays under it.
      // Wrapped in try/catch so a projection hiccup can NEVER abort the redraw below.
      let mx = 0, my = 0, before = null;
      try { const rr = canvas.getBoundingClientRect(); mx = e.clientX - rr.left; my = e.clientY - rr.top; before = screenToLonLat(mx, my); } catch (_e) {}
      zoom = clamp(zoom * Math.exp(-px * 0.0019), ZMIN, ZMAX); R = baseR * zoom;   // punchy per-notch zoom so the globe fills the screen in a few notches
      try { if (before) { const after = screenToLonLat(mx, my); if (after) {
        let dLon = before[0] - after[0]; if (dLon > 180) dLon -= 360; else if (dLon < -180) dLon += 360;
        rotLon = wrap(rotLon + dLon); rotLat = clamp(rotLat + (before[1] - after[1]), -88, 88); setBasis();
      } } } catch (_e) {}
      // Repaint strategy for hosts that don't paint a canvas after a preventDefault'd wheel: a backing realloc forces a paint, but
      // doing it EVERY frame onion-skins into an amber ghost glow. So realloc at most ~every 130ms during a long scroll (spaced far
      // enough apart that each frame fully composites → no accumulation) plus once more when the gesture settles. draw() just
      // updates the backing between reallocs (invisible on such hosts until the next realloc); a normal browser paints every frame.
      const _now = e.timeStamp || performance.now();
      if (_now - _lastComposite > 130) { _lastComposite = _now; forceComposite(); }
      draw(); endMotion(130);
    }
    if (window.__globeWheel) { try { window.removeEventListener("wheel", window.__globeWheel, true); } catch (e) {} }   // never stack listeners across map setups
    window.__globeWheel = onGlobeWheel;
    window.addEventListener("wheel", onGlobeWheel, { passive: false, capture: true });

    // On-screen +/− zoom buttons and keyboard (+ = -) — a wheel-free way to zoom that works everywhere, incl. embedded
    // previews / touchpads / hosts that don't forward wheel events to the page. Zooms toward the disk centre (rotLon/rotLat,
    // which is always the centre) and draws immediately so the disk visibly grows on each press.
    function zoomStep(mult) { stopSpin(); startMotion(); zoom = clamp(zoom * mult, ZMIN, ZMAX); draw(); endMotion(150); }
    { const zi = root.querySelector("#gzIn"), zo = root.querySelector("#gzOut");
      if (zi) zi.addEventListener("click", () => zoomStep(1.45));
      if (zo) zo.addEventListener("click", () => zoomStep(1 / 1.45)); }
    function onGlobeKey(e) {
      if (!canvas.isConnected) { document.removeEventListener("keydown", onGlobeKey); return; }
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;   // don't hijack typing
      if (e.key === "+" || e.key === "=") { zoomStep(1.45); e.preventDefault(); }
      else if (e.key === "-" || e.key === "_") { zoomStep(1 / 1.45); e.preventDefault(); }
    }
    document.addEventListener("keydown", onGlobeKey);

    // tear everything down once the globe leaves the DOM (navigating away) so nothing leaks per visit
    function cleanupGlobe() { try { ro.disconnect(); } catch (e) {} try { themeObs.disconnect(); } catch (e) {} try { window.removeEventListener("blur", stopHold); } catch (e) {} try { if (dprMedia) dprMedia.removeEventListener("change", onDPRChange); } catch (e) {} try { document.removeEventListener("keydown", onGlobeKey); } catch (e) {} try { window.removeEventListener("wheel", onGlobeWheel, true); } catch (e) {} stopSpin(); if (settleT) { clearTimeout(settleT); settleT = 0; } if (_drawTimer) { clearTimeout(_drawTimer); _drawTimer = 0; } if (_drawReq) { cancelAnimationFrame(_drawReq); _drawReq = 0; } }
    const ro = new ResizeObserver(() => { if (!canvas.isConnected) { cleanupGlobe(); return; } resize(); });
    ro.observe(stage);
    resize();
    // devicePixelRatio can change WITHOUT the stage resizing: browser page-zoom (Ctrl+wheel, or a trackpad/touchpad pinch the
    // browser treats as page zoom) and dragging the window between monitors of different DPI both change it. resize() re-reads
    // dpr and re-sizes the backing store, so re-run it whenever dpr changes — otherwise the globe keeps rendering at a STALE
    // resolution (the disk looks like it won't grow / redraws with blurry, offset edge rings) even though `zoom` is updating.
    let dprMedia = null;
    function onDPRChange() { if (!canvas.isConnected) { cleanupGlobe(); return; } resize(); watchDPR(); }
    function watchDPR() {
      if (dprMedia) { try { dprMedia.removeEventListener("change", onDPRChange); } catch (e) {} }
      try { dprMedia = window.matchMedia("(resolution: " + (window.devicePixelRatio || 1) + "dppx)"); dprMedia.addEventListener("change", onDPRChange, { once: true }); } catch (e) { dprMedia = null; }
    }
    watchDPR();
    // re-read theme colours and repaint when the user toggles light/night (or switches theme)
    const themeObs = new MutationObserver(() => {
      if (!canvas.isConnected) { cleanupGlobe(); return; }
      readColors(); cityW = null; cityCacheKey = ""; baseValid = false; draw();   // font may change → rebuild label-width cache + layout
    });
    themeObs.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme"] });

    // whiteboard: reuse the study toolbar, but back it with geo-anchored strokes drawn into the globe
    WB.enabled = false;
    ensureWBTools().classList.add("on-atlas");
    showWBTools();
    WB.onToggle = () => { stopSpin(); moving = false; wbRotating = false; if (settleT) { clearTimeout(settleT); settleT = 0; } if (WB.enabled) hoverIdx = -1; else { activeStroke = null; erasing = false; } canvas.style.cursor = WB.enabled ? "crosshair" : "grab"; draw(); };
    WB.onClear = () => { strokes.length = 0; activeStroke = null; erasing = false; draw(); gSnapshot(); };
    WB.onUndo = () => { if (gUndo.length <= 1) return; gRedo.push(gUndo.pop()); applyStrokes(gUndo[gUndo.length - 1]); };
    WB.onRedo = () => { if (!gRedo.length) return; const s = gRedo.pop(); gUndo.push(s); applyStrokes(s); };
    WB.onCanUndo = () => gUndo.length > 1;
    WB.onCanRedo = () => gRedo.length > 0;
    gSnapshot();   // base (empty) state so Undo can return to a blank globe
    // legend toggles — borders/rivers/mountains/provinces affect the cached base (baseValid=false); cities are overlays
    const wire = (id, set, rebuild) => { const cb = root.querySelector(id); if (cb) cb.addEventListener("change", () => { set(cb.checked); if (rebuild) baseValid = false; draw(); }); };
    wire("#bordersToggle", (v) => bordersOn = v, true);
    wire("#riversToggle", (v) => riversOn = v, true);
    wire("#riverLabelsToggle", (v) => riverLabelsOn = v, true);
    wire("#waterToggle", (v) => waterOn = v, true);
    wire("#heightmapToggle", (v) => { heightmapOn = v; if (v) loadHeightmap(); }, true);
    wire("#countryToggle", (v) => countryNamesOn = v, true);
    wire("#citiesToggle", (v) => citiesOn = v, false);
    wire("#majorToggle", (v) => majorCitiesOn = v, false);
    // "Divisions" (adminToggle → adminOn/drawAdmin) and "Division capitals" (divToggle → divCapsOn) were removed from the legend;
    // adminOn/divCapsOn stay false with no way to enable them, so drawAdmin + the division-capital tier never render (inert).
    // legend window: collapse + drag-to-move
    const legendEl = root.querySelector("#globeLegend"), legendHead = root.querySelector("#legendHead"), legendCollapse = root.querySelector("#legendCollapse");
    if (legendCollapse) legendCollapse.addEventListener("click", (e) => { e.stopPropagation(); const c = legendEl.classList.toggle("collapsed"); legendCollapse.textContent = c ? "+" : "–"; legendCollapse.setAttribute("aria-expanded", c ? "false" : "true"); });
    if (legendHead && legendEl) {
      let ldrag = false, sCX = 0, sCY = 0, sL = 0, sT = 0;
      legendHead.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".legend-collapse")) return;   // let the collapse button handle its own click
        ldrag = true; sCX = e.clientX; sCY = e.clientY; sL = legendEl.offsetLeft; sT = legendEl.offsetTop;
        legendEl.style.left = sL + "px"; legendEl.style.top = sT + "px"; legendEl.style.right = "auto"; legendEl.style.bottom = "auto";
        try { legendHead.setPointerCapture(e.pointerId); } catch (x) {}
        e.preventDefault();
      });
      legendHead.addEventListener("pointermove", (e) => {
        if (!ldrag) return;
        const par = legendEl.offsetParent || document.body, maxL = par.clientWidth - legendEl.offsetWidth, maxT = par.clientHeight - legendEl.offsetHeight;
        legendEl.style.left = clamp(sL + (e.clientX - sCX), 0, Math.max(0, maxL)) + "px";
        legendEl.style.top = clamp(sT + (e.clientY - sCY), 0, Math.max(0, maxT)) + "px";
      });
      const lend = (e) => { ldrag = false; try { legendHead.releasePointerCapture(e.pointerId); } catch (x) {} };
      legendHead.addEventListener("pointerup", lend);
      legendHead.addEventListener("pointercancel", lend);
    }

    /* ---------- timeline + year ---------- */
    const track = root.querySelector("#tlTrack"), pin = root.querySelector("#tlPin"), fill = root.querySelector("#tlFill"), tip = root.querySelector("#tlTip");
    const ayNum = root.querySelector("#ayNum"), ayEra = root.querySelector("#ayEra");
    const wipEl = root.querySelector("#atlasWip");
    cpEl = root.querySelector("#countryPop"); cpNameEl = root.querySelector("#cpName"); cpSpanEl = root.querySelector("#cpSpan"); cpDescEl = root.querySelector("#cpDesc");
    cpYearNumEl = root.querySelector("#cpYearNum"); cpYearDescEl = root.querySelector("#cpYearDesc");
    cpPopEl = root.querySelector("#cpPop"); cpAreaEl = root.querySelector("#cpArea"); cpGdpEl = root.querySelector("#cpGdp"); cpGdppcEl = root.querySelector("#cpGdppc");
    { const cpClose = root.querySelector("#cpClose"); if (cpClose) cpClose.addEventListener("click", hideCountryPopup); }
    mapBar = root.querySelector("#mapEditBar");
    if (mapBar) {
      mapBar.querySelectorAll(".meb-tool").forEach((b) => b.addEventListener("click", () => mapSetTool(b.dataset.tool)));
      mapBar.querySelector("#mebDone").addEventListener("click", () => { exitMapEdit(); route("admin"); });
      mapBar.querySelector("#mebDelTerr").addEventListener("click", mapDeleteSelected);
      mapBar.querySelector("#mebFinish").addEventListener("click", mapFinishDraw);
    }
    // `year` was already set when the Atlas opened (present, or an era's year via "View on globe"); the timeline UI below drives it
    const fmt = (y) => (y < 0 ? { n: String(-y), e: "BCE" } : { n: String(y || 1), e: "CE" });
    function paintYear() {
      const f = (year - MINY) / (MAXY - MINY) * 100;
      pin.style.left = f + "%"; fill.style.width = f + "%";
      const ff = fmt(year); ayNum.textContent = ff.n; ayEra.textContent = ff.e; tip.textContent = ff.n + " " + ff.e;
      // show the work-in-progress note only when no map (present-day or a historical era) covers this year
      if (wipEl) wipEl.classList.toggle("show", activeEra(year) == null);
    }
    // years that have a map: each historical era's year + the present (world.js). Browsing snaps to these; blank years are skipped.
    function mapYears() {
      const ys = new Set([MAXY]);
      (window.TIMELINE || []).forEach((e) => { if (e && typeof e.year === "number") ys.add(clamp(Math.round(e.year), MINY, MAXY)); });
      return Array.from(ys).sort((a, b) => a - b);
    }
    function snapYear(y) { const ys = mapYears(); let best = ys[0], bd = Infinity; for (let i = 0; i < ys.length; i++) { const d = Math.abs(ys[i] - y); if (d < bd) { bd = d; best = ys[i]; } } return best; }
    function stepYear(dir) {   // jump to the adjacent mapped year, skipping every year with no map
      const ys = mapYears();
      if (dir > 0) { for (let i = 0; i < ys.length; i++) if (ys[i] > year) return setYear(ys[i]); return setYear(ys[ys.length - 1]); }
      for (let i = ys.length - 1; i >= 0; i--) if (ys[i] < year) return setYear(ys[i]);
      return setYear(ys[0]);
    }
    function renderMapYearMarks() {   // ticks on the rail marking the mapped years you can stop on
      if (!track) return;
      track.querySelectorAll(".tl-mark").forEach((m) => m.remove());
      mapYears().forEach((y) => { const mk = document.createElement("div"); mk.className = "tl-mark"; mk.style.left = ((y - MINY) / (MAXY - MINY) * 100) + "%"; if (pin) track.insertBefore(mk, pin); else track.appendChild(mk); });
    }
    let _lastEraId = "__init";
    function setYear(y) {
      if (mapEdit) return;   // while editing an era the year is pinned to it — the timeline/chevrons must not change it out from under the editor
      year = snapYear(Math.round(y));   // only mapped years are reachable when browsing — a raw year snaps to the nearest one
      const e = activeEra(year), eid = e ? (e.present ? "__present" : e.id) : "__none";   // crossing into a different era invalidates the selection (indices belong to the old era's territory set)
      if (eid !== _lastEraId) { _lastEraId = eid; if (selSet.size) selSet.clear(); subSelGeo = -1; subSelUK = []; hoverIdx = -1; hideCountryPopup(); }
      paintYear(); scheduleDraw();
    }
    function step(dir) { stepYear(dir); }   // chevrons / arrow keys move one mapped year at a time (amt arg from hold-repeat is ignored — there are only a few stops)
    const clientFrac = (clientX) => { const r = track.getBoundingClientRect(); return clamp((clientX - r.left) / r.width, 0, 1); };
    const frac2year = (fr) => { let y = Math.round(MINY + fr * (MAXY - MINY)); if (y === 0) y = 1; return clamp(y, MINY, MAXY); };

    let tlDrag = false;
    function tlStart(e) { tlDrag = true; pin.classList.add("dragging"); try { pin.setPointerCapture(e.pointerId); } catch (x) {} setYear(frac2year(clientFrac(e.clientX))); }
    pin.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); tlStart(e); });
    track.addEventListener("pointerdown", (e) => { if (e.target === pin || pin.contains(e.target)) return; tlStart(e); });
    pin.addEventListener("pointermove", (e) => { if (tlDrag) setYear(frac2year(clientFrac(e.clientX))); });
    const tlEnd = () => { tlDrag = false; pin.classList.remove("dragging"); };
    pin.addEventListener("pointerup", tlEnd);
    pin.addEventListener("pointercancel", tlEnd);
    pin.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") { e.preventDefault(); step(-1, 1); } else if (e.key === "ArrowRight") { e.preventDefault(); step(1, 1); } });

    // year chevrons: click = ±1, hold = accelerating
    const prev = root.querySelector("#ayPrev"), next = root.querySelector("#ayNext");
    let holdT = null, holdN = 0, pointerStepped = false;
    function holdStep(dir) { let amt = 1; if (holdN > 44) amt = 50; else if (holdN > 32) amt = 20; else if (holdN > 20) amt = 10; else if (holdN > 10) amt = 5; else if (holdN > 4) amt = 2; step(dir, amt); }
    function startHold(dir) { stopHold(); holdN = 0; holdStep(dir); holdT = setTimeout(function rep() { holdN++; holdStep(dir); holdT = setTimeout(rep, Math.max(24, 230 - holdN * 14)); }, 340); }
    function stopHold() { if (holdT) { clearTimeout(holdT); holdT = null; } }
    [[prev, -1], [next, 1]].forEach(([btn, dir]) => {
      btn.addEventListener("pointerdown", (e) => { e.preventDefault(); pointerStepped = true; startHold(dir); });
      ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, stopHold));
      btn.addEventListener("click", () => { if (pointerStepped) { pointerStepped = false; return; } step(dir, 1); });
    });
    window.addEventListener("blur", stopHold);

    year = snapYear(year); renderMapYearMarks();   // start on a mapped year and mark the stops on the rail
    paintYear();
    if (atlasEditEraId != null) { const _e = (window.TIMELINE || []).find((x) => x.id === atlasEditEraId); atlasEditEraId = null; if (_e) enterMapEdit(_e); }
  };

  /* ============================================================
     PAGE: ACCOUNT
     ============================================================ */
  /* ---------- shared account rendering ---------- */
  function statGridHTML(prog, dueN) {
    const cards = prog.cards || {};
    const seen = Object.keys(cards).length;
    const mature = Object.keys(cards).filter((id) => cards[id] && cards[id].interval >= 21).length;
    const streak = (prog.streak && prog.streak.count) || 0;
    const wins = (prog.daily && prog.daily.wins) || 0;
    const best = (prog.daily && prog.daily.best) || 0;
    const due = dueN != null ? '<div class="statcard"><b>' + dueN + '</b><span>Due now</span></div>' : "";
    return '<div class="statgrid">' +
      '<div class="statcard"><b>' + seen + '</b><span>Cards seen</span></div>' +
      '<div class="statcard zh"><b>' + streak + '</b><span>Day streak</span></div>' + due +
      '<div class="statcard"><b>' + mature + '</b><span>Mature (21d+)</span></div>' +
      '<div class="statcard"><b>' + wins + '</b><span>Challenge wins</span></div>' +
      '<div class="statcard"><b>' + best + '</b><span>Best score</span></div></div>';
  }
  function renderDeckProgress(container, cards) {
    LEAF_NODES.filter((n) => subtreeCardIds(n).length > 0).forEach((n) => {
      const total = subtreeCardIds(n).length;
      const studied = subtreeCardIds(n).filter((id) => !!(cards && cards[id])).length;
      if (studied === 0) return;   // only show decks with actual progress in them
      const row = document.createElement("div"); row.className = "dp-row";
      row.innerHTML = '<div class="dp-name">' + esc(n.title) + "<small>" + esc(nodeParentPath(n)) + "</small></div>" + '<div class="prog-slot" style="flex:1"></div>';
      row.querySelector(".prog-slot").appendChild(progressBar(studied, total, isComingSoon(n)));
      container.appendChild(row);
    });
    const n = container.querySelectorAll(".dp-row").length;
    if (!n) container.innerHTML = '<div class="dp-empty">No decks studied yet — progress appears here once you start reviewing.</div>';
    return n;
  }
  // the level a user holds in each collection (distinct cards studied within it → its XP level)
  function renderCollectionLevels(container, cards) {
    const cols = TREE.collections.filter((c) => subtreeCardIds(c).length > 0 && !isComingSoon(c));
    if (!cols.length) { container.innerHTML = '<div class="cl-empty">No collections studied yet — your level in each appears here as you study.</div>'; return 0; }
    container.innerHTML = cols.map((c) => {
      const xp = collectionXPFrom(c, cards);
      return '<div class="cl-row">' + levelBadgeMarkup(xp) +
        '<div class="cl-main"><div class="cl-name">' + esc(c.title) + '</div>' + xpBarMarkup(xp) + '</div></div>';
    }).join("");
    animateProgs(container);
    return cols.length;
  }
  function roleBadge(role) { return '<span class="role-badge ' + (role === "admin" ? "role-admin" : "role-user") + '">' + (role === "admin" ? "Admin" : "User") + '</span>'; }
  function afterAuthChange() { applyMode(); route("account"); }

  /* ---------- achievements ---------- */
  const ACHIEVEMENTS = [
    { id: "seen1", icon: "📖", name: "First Card", desc: "Study your first card", test: (s) => s.seen >= 1 },
    { id: "seen25", icon: "📚", name: "Bookworm", desc: "Study 25 cards", test: (s) => s.seen >= 25 },
    { id: "seen100", icon: "🎓", name: "Scholar", desc: "Study 100 cards", test: (s) => s.seen >= 100 },
    { id: "seen500", icon: "🏛️", name: "Sage", desc: "Study 500 cards", test: (s) => s.seen >= 500 },
    { id: "mature50", icon: "🧠", name: "Committed to Memory", desc: "Mature 50 cards (21 days +)", test: (s) => s.mature >= 50 },
    { id: "mature200", icon: "💎", name: "Deep Recall", desc: "Mature 200 cards", test: (s) => s.mature >= 200 },
    { id: "streak3", icon: "🔥", name: "On a Roll", desc: "Reach a 3-day streak", test: (s) => s.streak >= 3 },
    { id: "streak7", icon: "⚡", name: "Weeklong", desc: "Reach a 7-day streak", test: (s) => s.streak >= 7 },
    { id: "streak30", icon: "☄️", name: "Unstoppable", desc: "Reach a 30-day streak", test: (s) => s.streak >= 30 },
    { id: "deck1", icon: "✅", name: "Deck Complete", desc: "Finish every card in one deck", test: (s) => s.decksDone >= 1 },
    { id: "deck3", icon: "🗂️", name: "Polymath", desc: "Make progress in 3 decks", test: (s) => s.decksStarted >= 3 },
    { id: "friend1", icon: "🤝", name: "First Friend", desc: "Add your first friend", test: (s) => s.friends >= 1 },
    { id: "friend5", icon: "🌐", name: "Well Connected", desc: "Have 5 friends", test: (s) => s.friends >= 5 },
    { id: "win1", icon: "🏅", name: "Victor", desc: "Win a daily challenge", test: (s) => s.wins >= 1 },
    { id: "win10", icon: "👑", name: "Champion", desc: "Win 10 daily challenges", test: (s) => s.wins >= 10 },
    { id: "sweep", icon: "🎯", name: "Clean Sweep", desc: "Win all four daily games in one day", test: (s) => s.dailySweep },
  ];
  function progStats(prog, friendsCount) {
    const cards = prog.cards || {};
    const seen = Object.keys(cards).length;
    const mature = Object.keys(cards).filter((id) => cards[id] && cards[id].interval >= 21).length;
    let decksStarted = 0, decksDone = 0;
    LEAF_NODES.forEach((n) => { const ids = subtreeCardIds(n); if (!ids.length) return; const st = ids.filter((id) => cards[id]).length; if (st > 0) decksStarted++; if (st === ids.length) decksDone++; });
    return { seen, mature, streak: (prog.streak && prog.streak.count) || 0, wins: (prog.daily && prog.daily.wins) || 0, dailySweep: allGamesWonToday(prog), decksStarted, decksDone, friends: friendsCount || 0 };
  }
  // unlock any newly-earned achievements for the active (S) profile; toast each unless silent
  function checkAchievements(silent) {
    if (!S.achievements) S.achievements = {};
    const s = progStats(S, currentUser() ? (currentUser().friends || []).length : 0);
    const newly = [];
    ACHIEVEMENTS.forEach((a) => { if (!S.achievements[a.id] && a.test(s)) { S.achievements[a.id] = Date.now(); newly.push(a); } });
    if (newly.length) { save(); if (!silent) toast(newly.length === 1 ? newly[0].icon + " Achievement unlocked: " + newly[0].name : "🏆 " + newly.length + " achievements unlocked: " + newly.map((a) => a.name).join(", ")); }
    return newly;
  }
  function badgesHTML(achObj) {
    const got = (id) => achObj && achObj[id];
    const earned = ACHIEVEMENTS.filter((a) => got(a.id)).length;
    return '<div class="badges-head"><span class="badges-count">' + earned + ' of ' + ACHIEVEMENTS.length + ' unlocked</span></div>' +
      '<div class="badges">' + ACHIEVEMENTS.map((a) => {
        const has = got(a.id);
        return '<div class="badge ' + (has ? "got" : "locked") + '" title="' + esc(a.name + " — " + a.desc + (has ? "" : " (locked)")) + '"><span class="badge-ic">' + a.icon + '</span><span class="badge-name">' + esc(a.name) + '</span></div>';
      }).join("") + '</div>';
  }

  PAGES.account = function (root, params) {
    if (params && params.viewUser && supaLoggedIn()) return acctFriendView(root, params.viewUser);
    if (!supaLoggedIn()) return acctAuthView(root);
    return acctSelfView(root);
  };

  function acctAuthView(root) {
    root.innerHTML = `
      <div class="page-head"><span class="eyebrow">Your account</span><h1>Account</h1></div>
      <div class="auth-card">
        <div class="auth-tabs">
          <button class="auth-tab active" data-av="signin" type="button">Sign in</button>
          <button class="auth-tab" data-av="register" type="button">Create account</button>
          <button class="auth-tab" data-av="forgot" type="button">Forgot password</button>
        </div>
        <form class="auth-form" data-form="signin">
          <label>Email<input class="auth-in" name="u" type="email" autocomplete="email" required></label>
          <label>Password<input class="auth-in" name="p" type="password" autocomplete="current-password" required></label>
          <div class="auth-msg" data-msg></div>
          <button class="auth-btn" type="submit">Sign in</button>
        </form>
        <form class="auth-form" data-form="register" hidden>
          <label>Email<input class="auth-in" name="e" type="email" autocomplete="email" required></label>
          <label>Username<input class="auth-in" name="u" autocomplete="username" placeholder="letters, numbers, underscore" required></label>
          <label>Password<input class="auth-in" name="p" type="password" autocomplete="new-password" required></label>
          <label>Confirm password<input class="auth-in" name="p2" type="password" autocomplete="new-password" required></label>
          <div class="auth-msg" data-msg></div>
          <button class="auth-btn" type="submit">Create account</button>
        </form>
        <form class="auth-form" data-form="forgot" hidden>
          <p class="auth-note">Enter your account's email address — you'll receive a link to reset your password.</p>
          <label>Email<input class="auth-in" name="u" type="email" autocomplete="email" required></label>
          <div class="auth-msg" data-msg></div>
          <button class="auth-btn" type="submit">Send reset link</button>
        </form>
        <p class="auth-foot">Your account and study progress are stored online, so you can sign in from any device. You can also keep studying without an account — progress then stays on this device only.</p>
      </div>`;
    const tabs = root.querySelectorAll(".auth-tab"), forms = root.querySelectorAll(".auth-form");
    tabs.forEach((t) => t.addEventListener("click", () => {
      tabs.forEach((x) => x.classList.toggle("active", x === t));
      forms.forEach((f) => { f.hidden = f.dataset.form !== t.dataset.av; });
    }));
    const msg = (form, text, ok) => { const m = form.querySelector("[data-msg]"); m.textContent = text || ""; m.className = "auth-msg" + (text ? (ok ? " ok" : " err") : ""); };
    const busy = (f, on) => { const b = f.querySelector(".auth-btn"); if (b) { b.disabled = on; b.textContent = on ? "…" : b.dataset.lbl || b.textContent; if (!b.dataset.lbl) b.dataset.lbl = b.textContent; } };
    root.querySelector('[data-form="signin"]').addEventListener("submit", async (e) => {
      e.preventDefault(); const f = e.target;
      busy(f, true); const r = await supaSignIn(f.u.value.trim(), f.p.value); busy(f, false);
      if (r.error) return msg(f, r.error);
      toast("Signed in as " + ((SUPA_PROFILE && SUPA_PROFILE.name) || "you")); afterAuthChange();
    });
    root.querySelector('[data-form="register"]').addEventListener("submit", async (e) => {
      e.preventDefault(); const f = e.target;
      const uname = uKey(f.u.value);
      if (!/^[a-z0-9_]{3,24}$/.test(uname)) return msg(f, "Username: 3–24 characters — letters, numbers and underscores only.");
      if (f.p.value !== f.p2.value) return msg(f, "Passwords don't match.");
      if (f.p.value.length < 6) return msg(f, "Password must be at least 6 characters.");
      busy(f, true); const r = await supaSignUp(f.e.value.trim(), uname, f.u.value.trim(), f.p.value); busy(f, false);
      if (r.error) return msg(f, r.error);
      if (r.confirm) return msg(f, "Account created — check your email inbox for a confirmation link, then sign in.", true);
      toast("Account created — welcome!"); afterAuthChange();
    });
    root.querySelector('[data-form="forgot"]').addEventListener("submit", async (e) => {
      e.preventDefault(); const f = e.target;
      busy(f, true); const r = await supaRecover(f.u.value.trim()); busy(f, false);
      if (r.error) return msg(f, r.error);
      msg(f, "Reset link sent — check your email inbox.", true);
    });
  }

  function acctSelfView(root) {
    const me = SUPA_PROFILE || { username: ((SUPA.user && SUPA.user.email) || "account").split("@")[0], role: "user" };   // profile may still be loading right after boot
    const joined = new Date(S.user.joined).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    root.innerHTML = `
      <div class="page-head"><span class="eyebrow">Your record</span><h1>Account</h1></div>
      <div class="profile">
        <div class="monogram" id="mono">${initialOf(S.user.name)}</div>
        <div class="who">
          <input class="namefield" id="name" value="${esc(S.user.name)}" maxlength="28" aria-label="Display name" />
          <div class="since">@${esc(me.username)} · ${roleBadge(me.role)} · since ${joined}</div>
        </div>
        <button class="ghost-btn" id="signout" type="button">Sign out</button>
      </div>
      <div class="acct-tools">
        <button class="ghost-btn" id="pwToggle" type="button">Change password</button>
        <span class="auth-note">${S._supaTs ? "Progress synced to your account ✓" : "Progress will sync automatically as you study"}</span>
      </div>
      <div class="acct-panel" id="pwPanel" hidden>
        <label>New password<input class="auth-in" id="pwNew" type="password" autocomplete="new-password"></label>
        <label>Confirm<input class="auth-in" id="pwNew2" type="password" autocomplete="new-password"></label>
        <div class="auth-msg" id="pwMsg"></div>
        <button class="auth-btn sm" id="pwSave" type="button">Update password</button>
      </div>
      <div class="section-label">Friends</div>
      <div class="friends-box" id="friendsBox"></div>
      <div class="section-label">Badges</div>
      <div class="badges-box" id="badgesBox"></div>
      <div class="section-label">Collection levels</div>
      <div class="coll-levels" id="collLevels"></div>
      <div id="statWrap"></div>
      <div class="section-label">Progress by deck</div>
      <div class="suspbox">
        <button class="suspbox-head open" id="dpHead" type="button" aria-expanded="true"><span class="suspbox-title">By deck <span class="suspbox-count" id="dpCount"></span></span><span class="suspbox-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span></button>
        <div class="suspbox-collapse" id="dpCollapse"><div class="suspbox-collapse-inner"><div class="deckprog" id="deckprog"></div></div></div>
      </div>
      <div class="section-label">Suspended cards</div>
      <div class="suspbox">
        <button class="suspbox-head" id="suspHead" type="button" aria-expanded="false"><span class="suspbox-title">Set-aside cards <span class="suspbox-count" id="suspCount"></span></span><span class="suspbox-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span></button>
        <div class="suspbox-collapse collapsed" id="suspCollapse"><div class="suspbox-collapse-inner"><div class="susplist" id="susplist"></div></div></div>
      </div>`;
    root.querySelector("#statWrap").innerHTML = statGridHTML(S, dueCountNow());

    const nameInput = root.querySelector("#name");
    const sync = () => { const v = (nameInput.value.trim().replace(/[^a-z0-9_.\- ]/gi, "") || "Scholar").slice(0, 28); nameInput.value = v; S.user.name = v; root.querySelector("#mono").textContent = initialOf(v); save(); supaSetName(v); };
    nameInput.addEventListener("input", () => { root.querySelector("#mono").textContent = initialOf(nameInput.value || "S"); });
    nameInput.addEventListener("change", () => { sync(); toast("Name saved"); });
    nameInput.addEventListener("blur", sync);

    root.querySelector("#signout").addEventListener("click", async (e) => { e.target.disabled = true; await supaSignOut(); toast("Signed out"); afterAuthChange(); });
    root.querySelector("#pwToggle").addEventListener("click", () => { const p = root.querySelector("#pwPanel"); p.hidden = !p.hidden; });
    root.querySelector("#pwSave").addEventListener("click", async () => {
      const a = root.querySelector("#pwNew").value, b = root.querySelector("#pwNew2").value, m = root.querySelector("#pwMsg");
      if (a !== b) { m.textContent = "Passwords don't match."; m.className = "auth-msg err"; return; }
      const r = await supaSetPassword(a);
      if (r.error) { m.textContent = r.error; m.className = "auth-msg err"; return; }
      m.textContent = "Password updated."; m.className = "auth-msg ok";
      root.querySelector("#pwNew").value = ""; root.querySelector("#pwNew2").value = "";
    });

    renderFriends(root.querySelector("#friendsBox"));
    checkAchievements(true);
    root.querySelector("#badgesBox").innerHTML = badgesHTML(S.achievements);
    renderCollectionLevels(root.querySelector("#collLevels"), S.cards);

    const dp = root.querySelector("#deckprog");
    root.querySelector("#dpCount").textContent = "(" + renderDeckProgress(dp, S.cards) + ")";
    const dpHead = root.querySelector("#dpHead"), dpCollapse = root.querySelector("#dpCollapse");
    dpHead.addEventListener("click", () => { const c = dpCollapse.classList.toggle("collapsed"); dpHead.setAttribute("aria-expanded", c ? "false" : "true"); dpHead.classList.toggle("open", !c); });

    const suspHead = root.querySelector("#suspHead"), suspCollapse = root.querySelector("#suspCollapse"), suspList = root.querySelector("#susplist"), suspCount = root.querySelector("#suspCount");
    function renderSuspended() {
      const ids = Object.keys(S.suspended || {}).filter((id) => S.suspended[id] && CARD_BY_ID[id]);
      ids.sort((a, b) => (Number(S.suspended[b]) || 0) - (Number(S.suspended[a]) || 0));
      suspCount.textContent = "(" + ids.length + ")";
      if (!ids.length) { suspList.innerHTML = '<div class="susp-empty">No cards are set aside. Cards you suspend during review will appear here.</div>'; return; }
      suspList.innerHTML = ids.map((id) => {
        const c = CARD_BY_ID[id], ts = S.suspended[id];
        const when = (typeof ts === "number") ? new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "date unknown";
        return '<div class="susp-row" data-id="' + esc(id) + '"><div class="susp-info"><span class="susp-name">' + esc(c.answer || "(untitled)") + '</span><span class="susp-meta">' + esc(id) + ' &middot; suspended ' + esc(when) + '</span></div><button class="susp-restore" type="button" data-id="' + esc(id) + '" aria-label="Remove from suspension">Unsuspend</button></div>';
      }).join("");
      suspList.querySelectorAll(".susp-restore").forEach((b) => b.addEventListener("click", () => { delete S.suspended[b.dataset.id]; save(); toast("Card returned to your reviews"); renderSuspended(); }));
    }
    renderSuspended();
    suspHead.addEventListener("click", () => { const open = suspCollapse.classList.toggle("collapsed"); suspHead.setAttribute("aria-expanded", open ? "false" : "true"); suspHead.classList.toggle("open", !open); });
  }

  function renderFriends(box) {
    if (!supaLoggedIn()) { box.innerHTML = ""; return; }
    const me = SUPA.user.id;
    box.innerHTML = '<div class="friend-empty">Loading friends…</div>';
    const userRow = (id, profs, extra, viewable) => {
      const u = profs[id]; if (!u) return "";
      const inner = '<span class="monogram sm">' + initialOf(u.name) + '</span><span class="friend-name">' + esc(u.name) + ' <small>@' + esc(u.username) + '</small></span>';
      const link = viewable ? '<button class="friend-link" data-view="' + esc(id) + '">' + inner + '</button>' : '<div class="friend-link static">' + inner + '</div>';
      return '<div class="friend-row">' + link + (extra || "") + '</div>';
    };
    (async () => {
      const fr = await supaFetch("/rest/v1/friends?select=user_id,friend_id,status");   // RLS scopes this to rows involving me
      if (!fr.ok) { box.innerHTML = '<div class="friend-empty">Couldn’t load friends — check your connection, then reopen this page.</div>'; return; }
      const rows = Array.isArray(fr.data) ? fr.data : [];
      const others = [...new Set(rows.map((r) => (r.user_id === me ? r.friend_id : r.user_id)))];
      const profs = {};
      if (others.length) {
        const pr = await supaFetch("/rest/v1/profiles?id=in.(" + others.join(",") + ")&select=id,username,name,role");
        if (pr.ok && Array.isArray(pr.data)) pr.data.forEach((p) => { profs[p.id] = p; });
      }
      const incoming = rows.filter((r) => r.status === "pending" && r.friend_id === me).map((r) => r.user_id).filter((k) => profs[k]);
      const outgoing = rows.filter((r) => r.status === "pending" && r.user_id === me).map((r) => r.friend_id).filter((k) => profs[k]);
      const accepted = rows.filter((r) => r.status === "accepted").map((r) => (r.user_id === me ? r.friend_id : r.user_id)).filter((k) => profs[k]);
      let html = '<div class="friend-add"><input class="auth-in" id="friendAdd" placeholder="Add a friend by username" autocomplete="off"><button class="auth-btn sm" id="friendAddBtn" type="button">Add</button></div><div class="friend-msg" id="friendMsg"></div>';
      if (incoming.length) html += '<div class="friend-sub">Requests</div>' + incoming.map((k) => userRow(k, profs, '<span class="friend-acts"><button class="mini-btn ok" data-accept="' + esc(k) + '">Accept</button><button class="mini-btn" data-decline="' + esc(k) + '">Decline</button></span>', false)).join("");
      if (outgoing.length) html += '<div class="friend-sub">Pending</div>' + outgoing.map((k) => userRow(k, profs, '<span class="friend-acts"><button class="mini-btn" data-cancel="' + esc(k) + '">Cancel</button></span>', false)).join("");
      html += '<div class="friend-sub">Friends (' + accepted.length + ')</div>';
      html += accepted.length ? accepted.map((k) => userRow(k, profs, '<span class="friend-acts"><button class="mini-btn" data-remove="' + esc(k) + '">Remove</button></span>', true)).join("") : '<div class="friend-empty">No friends yet. Add someone by their username above.</div>';
      box.innerHTML = html;
      const refresh = () => renderFriends(box);
      const fmsg = (t, ok) => { const m = box.querySelector("#friendMsg"); m.textContent = t || ""; m.className = "friend-msg" + (t ? (ok ? " ok" : " err") : ""); };
      box.querySelector("#friendAddBtn").addEventListener("click", async () => {
        const name = uKey(box.querySelector("#friendAdd").value);
        if (!name) return;
        const pr = await supaFetch("/rest/v1/profiles?username=eq." + encodeURIComponent(name) + "&select=id,username,name");
        const t = pr.ok && Array.isArray(pr.data) ? pr.data[0] : null;
        if (!t) return fmsg("No account with that username.");
        if (t.id === me) return fmsg("You can't add yourself.");
        if (accepted.includes(t.id)) return fmsg("You're already friends.");
        if (outgoing.includes(t.id)) return fmsg("Request already sent.");
        if (incoming.includes(t.id)) {   // they already asked you → accept instead
          const a = await supaFetch("/rest/v1/friends?user_id=eq." + t.id + "&friend_id=eq." + me, { method: "PATCH", body: { status: "accepted" } });
          if (!a.ok) return fmsg(supaErrMsg(a, "Could not accept the request."));
          checkAchievements(); fmsg("You're now friends!", true); return refresh();
        }
        const r = await supaFetch("/rest/v1/friends", { method: "POST", body: { user_id: me, friend_id: t.id } });
        if (!r.ok) return fmsg(supaErrMsg(r, "Could not send the request."));
        box.querySelector("#friendAdd").value = "";
        fmsg("Request sent.", true); refresh();
      });
      box.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => route("account", { viewUser: b.dataset.view })));
      box.querySelectorAll("[data-accept]").forEach((b) => b.addEventListener("click", async () => { await supaFetch("/rest/v1/friends?user_id=eq." + b.dataset.accept + "&friend_id=eq." + me, { method: "PATCH", body: { status: "accepted" } }); checkAchievements(); refresh(); }));
      box.querySelectorAll("[data-decline]").forEach((b) => b.addEventListener("click", async () => { await supaFetch("/rest/v1/friends?user_id=eq." + b.dataset.decline + "&friend_id=eq." + me, { method: "DELETE" }); refresh(); }));
      box.querySelectorAll("[data-cancel]").forEach((b) => b.addEventListener("click", async () => { await supaFetch("/rest/v1/friends?user_id=eq." + me + "&friend_id=eq." + b.dataset.cancel, { method: "DELETE" }); refresh(); }));
      box.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", async () => { await supaFetch("/rest/v1/friends?or=(and(user_id.eq." + me + ",friend_id.eq." + b.dataset.remove + "),and(user_id.eq." + b.dataset.remove + ",friend_id.eq." + me + "))", { method: "DELETE" }); refresh(); }));
    })();
  }

  function acctFriendView(root, key) {   // key = the friend's user id (uuid)
    root.innerHTML = '<div class="page-head"><span class="eyebrow">Friends</span><h1>Loading…</h1></div>';
    (async () => {
      const me = SUPA.user.id;
      const pr = await supaFetch("/rest/v1/profiles?id=eq." + encodeURIComponent(key) + "&select=id,username,name,role");
      const u = pr.ok && Array.isArray(pr.data) ? pr.data[0] : null;
      const pg = await supaFetch("/rest/v1/progress?user_id=eq." + encodeURIComponent(key) + "&select=data");
      const row = pg.ok && Array.isArray(pg.data) ? pg.data[0] : null;   // RLS: readable only once you're accepted friends
      if (!u || !row) {
        root.innerHTML = '<div class="page-head"><span class="eyebrow">Friends</span><h1>Not available</h1></div><p class="auth-foot">You can only view the progress of people on your friends list. <button class="auth-btn sm" id="backBtn" type="button">Back to your account</button></p>';
        root.querySelector("#backBtn").addEventListener("click", () => route("account"));
        return;
      }
      const prog = Object.assign(emptyProgress(), row.data || {});
      root.innerHTML = `
        <button class="back-link" id="backBtn" type="button">← Back to your account</button>
        <div class="profile">
          <div class="monogram">${initialOf(u.name)}</div>
          <div class="who"><div class="friend-title">${esc(u.name)}</div><div class="since">@${esc(u.username)} · ${roleBadge(u.role)}</div></div>
          <button class="ghost-btn" id="rmFriend" type="button">Remove friend</button>
        </div>
        <div id="fStat"></div>
        <div class="section-label">Badges</div>
        <div class="badges-box" id="fBadges"></div>
        <div class="section-label">Progress by deck</div>
        <div class="suspbox"><div class="suspbox-collapse"><div class="suspbox-collapse-inner"><div class="deckprog" id="fDeck"></div></div></div></div>`;
      root.querySelector("#fStat").innerHTML = statGridHTML(prog, null);
      root.querySelector("#fBadges").innerHTML = badgesHTML(prog.achievements);
      renderDeckProgress(root.querySelector("#fDeck"), prog.cards || {});
      root.querySelector("#backBtn").addEventListener("click", () => route("account"));
      root.querySelector("#rmFriend").addEventListener("click", async () => {
        await supaFetch("/rest/v1/friends?or=(and(user_id.eq." + me + ",friend_id.eq." + key + "),and(user_id.eq." + key + ",friend_id.eq." + me + "))", { method: "DELETE" });
        toast("Removed friend"); route("account");
      });
    })();
  }

  /* ============================================================
     PAGE: SETTINGS
     ============================================================ */
  PAGES.settings = function (root) {
    const homeName = (S.settings.home && S.settings.home.name) || "Netherlands";
    const homeOpts = (window.WORLD_GEO || []).map((c) => c.n).filter((n) => n && n.trim()).sort((a, b) => a.localeCompare(b))
      .map((n) => `<option value="${n.replace(/"/g, "&quot;")}"${n === homeName ? " selected" : ""}>${n}</option>`).join("");
    root.innerHTML = `
      <div class="page-head"><span class="eyebrow">Preferences</span><h1>Settings</h1></div>
      <div class="settings">
        <div class="set-card">
          <div class="set-row set-row-block">
            <div class="info"><h3>Theme</h3><p>Each theme has its own colour scheme and typography. Night mode works within every theme.</p></div>
            <div class="theme-grid" id="themeGrid">
              <button class="theme-opt" data-theme="folio" type="button"><span class="theme-swatches"><i style="background:#36357A"></i><i style="background:#C8453C"></i><i style="background:#F6F5F1"></i></span><span class="theme-name">Folio</span><span class="theme-tag">Editorial serif</span></button>
              <button class="theme-opt" data-theme="atlas" type="button"><span class="theme-swatches"><i style="background:#1D5BFF"></i><i style="background:#F4365E"></i><i style="background:#EAF0FA"></i></span><span class="theme-name">Atlas</span><span class="theme-tag">Electric modern</span></button>
              <button class="theme-opt" data-theme="press" type="button"><span class="theme-swatches"><i style="background:#1C5D6B"></i><i style="background:#C0392B"></i><i style="background:#F3EBDA"></i></span><span class="theme-name">Press</span><span class="theme-tag">Vintage gazette</span></button>
              <button class="theme-opt" data-theme="bloom" type="button"><span class="theme-swatches"><i style="background:#7B3FF2"></i><i style="background:#FF4D8D"></i><i style="background:#F4F0FE"></i></span><span class="theme-name">Bloom</span><span class="theme-tag">Soft pastel</span></button>
              <button class="theme-opt" data-theme="tide" type="button"><span class="theme-swatches"><i style="background:#0E8AAD"></i><i style="background:#E63E5C"></i><i style="background:#E6F3F4"></i></span><span class="theme-name">Tide</span><span class="theme-tag">Marine serif</span></button>
              <button class="theme-opt" data-theme="clay" type="button"><span class="theme-swatches"><i style="background:#B5532A"></i><i style="background:#9A3324"></i><i style="background:#F5ECE0"></i></span><span class="theme-name">Clay</span><span class="theme-tag">Earthen</span></button>
              <button class="theme-opt" data-theme="garden" type="button"><span class="theme-swatches"><i style="background:#2F7D4F"></i><i style="background:#C0492E"></i><i style="background:#EBF2E8"></i></span><span class="theme-name">Garden</span><span class="theme-tag">Botanical</span></button>
              <button class="theme-opt" data-theme="synth" type="button"><span class="theme-swatches"><i style="background:#7C2DFF"></i><i style="background:#FF2D7A"></i><i style="background:#F2EEFB"></i></span><span class="theme-name">Synth</span><span class="theme-tag">Neon</span></button>
            </div>
          </div>
        </div>
        <div class="set-card">
          <div class="set-row">
            <div class="info"><h3>Night mode</h3><p>Switch to the deck's dark paper palette.</p></div>
            <div class="ctl"><div class="switch ${S.settings.night ? "on" : ""}" id="sw-night" role="switch" tabindex="0" aria-checked="${S.settings.night}"></div></div>
          </div>
          <div class="set-row">
            <div class="info"><h3>New cards per day</h3><p>How many unseen cards enter your review each day.</p></div>
            <div class="ctl"><div class="stepper"><button id="np-dn" aria-label="Fewer">−</button><span class="val" id="np-val">${S.settings.newPerDay}</span><button id="np-up" aria-label="More">+</button></div></div>
          </div>
          <div class="set-row">
            <div class="info"><h3>Home location</h3><p>The Atlas globe opens centred on this place.</p></div>
            <div class="ctl"><select class="set-sel" id="homeSel" aria-label="Atlas home location">${homeOpts}</select></div>
          </div>
          <div class="set-row">
            <div class="info"><h3>Text-to-speech</h3><p>Read cards aloud while you study — the question, answer, Chinese, and background. Turning this off hides the card's mute button and every play control.</p></div>
            <div class="ctl"><div class="switch ${S.settings.tts !== false ? "on" : ""}" id="sw-tts" role="switch" tabindex="0" aria-checked="${S.settings.tts !== false}"></div></div>
          </div>
          <div class="set-row">
            <div class="info"><h3>Reading voices</h3><p>Pick which of this device's voices read your cards. Quality depends on what the device offers — voices named “Natural”, “Neural” or “Enhanced” sound the most human; “Auto” prefers them when present.</p></div>
            <div class="ctl ctl-col">
              <div class="voice-row"><span class="voice-lab">English</span><select class="set-sel" id="voiceEn" aria-label="English reading voice"></select><button class="btn ghost" id="voiceEnTest" type="button">Test</button></div>
              <div class="voice-row"><span class="voice-lab">Chinese</span><select class="set-sel" id="voiceZh" aria-label="Chinese reading voice"></select><button class="btn ghost" id="voiceZhTest" type="button">Test</button></div>
            </div>
          </div>
        </div>

        <div class="set-card">
          <div class="set-row">
            <div class="info"><h3>Reset progress</h3><p>Clear every card's study history and start fresh. This can't be undone.</p></div>
            <div class="ctl"><button class="btn ghost" id="reset">Reset</button></div>
          </div>
          <div class="set-row">
            <div class="info"><h3>Export data</h3><p>Download your progress as a JSON backup.</p></div>
            <div class="ctl"><button class="btn ghost" id="export">Export</button></div>
          </div>
        </div>

        <div class="set-card">
          <div class="set-row">
            <div class="info"><h3>About Folio</h3><p>A study companion built around the China Modern History deck. Decks are fixed; cards come from the source collection. Daily Challenge opponents are practice bots — the structure is there for live play later.</p></div>
          </div>
        </div>
      </div>`;

    const sw = root.querySelector("#sw-night");
    const toggleNight = () => setNight(!S.settings.night);
    sw.addEventListener("click", toggleNight);

    const themeGrid = root.querySelector("#themeGrid");
    const markTheme = () => themeGrid.querySelectorAll(".theme-opt").forEach((b) => b.classList.toggle("active", b.dataset.theme === (S.settings.theme || "folio")));
    markTheme();
    themeGrid.querySelectorAll(".theme-opt").forEach((b) => b.addEventListener("click", () => { setTheme(b.dataset.theme); markTheme(); }));
    sw.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleNight();
      }
    });

    const swTts = root.querySelector("#sw-tts");
    const toggleTts = () => {
      S.settings.tts = S.settings.tts === false;   // flip: false -> true, anything else -> false
      save();
      if (!S.settings.tts) ttsStop();
      swTts.classList.toggle("on", S.settings.tts);
      swTts.setAttribute("aria-checked", String(S.settings.tts));
    };
    swTts.addEventListener("click", toggleTts);
    swTts.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTts(); } });

    // reading-voice pickers — populated from the device's voice list (arrives async on mobile -> _ttsVoicesHook refills)
    const fillVoices = () => {
      const build = (sel, list, cur) => {
        if (!sel) return;
        sel.innerHTML = ['<option value="">Auto — best available</option>'].concat(list.map((v) => {
          const id = v.voiceURI || v.name;
          return '<option value="' + esc(id).replace(/"/g, "&quot;") + '"' + (id === cur ? " selected" : "") + ">" +
            esc(v.name + " (" + v.lang + ")" + (v.localService === false ? " · online" : "")) + "</option>";
        })).join("");
      };
      build(root.querySelector("#voiceEn"), ttsEnVoices(), S.settings.ttsVoiceEn || "");
      build(root.querySelector("#voiceZh"), ttsZhVoices(), S.settings.ttsVoiceZh || "");
    };
    fillVoices();
    _ttsVoicesHook = fillVoices;
    const wireVoice = (selId, key, sample) => {
      const sel = root.querySelector(selId), test = root.querySelector(selId + "Test");
      const preview = () => {
        if (!ttsSupported()) { toast("Speech isn't available on this device"); return; }
        if (!ttsEnabled()) { toast("Text-to-speech is turned off"); return; }
        ttsSay([sample], 0);   // preview bypasses the card mute — choosing a voice is an explicit listen request
      };
      if (sel) sel.addEventListener("change", () => { S.settings[key] = sel.value; save(); preview(); });
      if (test) test.addEventListener("click", preview);
    };
    wireVoice("#voiceEn", "ttsVoiceEn", { text: "This is the voice that will read your cards aloud." });
    wireVoice("#voiceZh", "ttsVoiceZh", { text: "你好，我来朗读中文。", zh: true });

    const npVal = root.querySelector("#np-val");
    const setNp = (d) => {
      S.settings.newPerDay = Math.max(0, Math.min(50, S.settings.newPerDay + d));
      npVal.textContent = S.settings.newPerDay;
      save();
    };
    root.querySelector("#np-up").addEventListener("click", () => setNp(1));
    root.querySelector("#np-dn").addEventListener("click", () => setNp(-1));

    const homeSel = root.querySelector("#homeSel");
    if (homeSel) homeSel.addEventListener("change", () => {
      const name = homeSel.value, c = countryCenter(name);
      if (!c) return;
      S.settings.home = { name, lon: c.lon, lat: c.lat }; save();
      atlasView.rotLon = c.lon; atlasView.rotLat = c.lat; atlasView.zoom = 1;   // take effect next time the Atlas opens (this session + after reload)
      toast(name + " set as your Atlas home");
    });

    root.querySelector("#reset").addEventListener("click", () => {
      inlineConfirm("Reset all study progress? This cannot be undone.", () => {
        const keepName = S.user.name;
        S = defaultState();
        S.user.name = keepName;
        save();
        toast("Progress reset");
        render();
      }, "Reset");
    });

    root.querySelector("#export").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "folio-progress.json";
      a.click();
      URL.revokeObjectURL(url);
      toast("Backup downloaded");
    });
  };

  /* ============================================================
     ADMIN — back-end editor for all cards + the glossary
     ============================================================ */
  function hideAdminEditBtn() { const b = document.getElementById("admin-edit-fab"); if (b) b.remove(); }
  function showAdminEditBtn(cardId) {
    hideAdminEditBtn();
    const b = document.createElement("button");
    b.id = "admin-edit-fab"; b.className = "admin-edit-fab"; b.type = "button";
    b.setAttribute("aria-label", "Edit this card in the admin editor");
    b.title = "Edit this card";
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>Edit';
    b.addEventListener("click", () => route("admin", { card: cardId, tab: "cards" }));
    document.body.appendChild(b);
  }

  // Fields shown in the editor, stacked in the order they appear on the study card.
  // 'num' and 'category' are intentionally omitted; two labels are renamed per spec.
  const EDITOR_FIELDS = [
    { key: "question", label: "question" },
    { key: "answer", label: "answer" },
    { key: "answerDate", label: "answer date" },
    { key: "traditional", label: "traditional" },
    { key: "hanzi", label: "hanzi" },
    { key: "pinyin", label: "pinyin" },
    { key: "translations", label: "translations" },
    { key: "abstract", label: "background" },
    { key: "citation", label: "citation" },
    { key: "answerText", label: "answer text" },
  ];
  const EDITOR_LONG = { question: 3, answerDate: 3, translations: 3, abstract: 16 };
  function fmtYear(c) { const y = cardStartYear(c); if (!y) return "—"; return y < 0 ? -y + " BCE" : y + " CE"; }
  function adminSortIds(ids) {
    const mode = adminState.sort;
    const arr = ids.slice();
    if (mode === "name") arr.sort((a, b) => (CARD_BY_ID[a].answer || "").localeCompare(CARD_BY_ID[b].answer || ""));
    else if (mode === "added") arr.sort((a, b) => cardCreatedAt(a) - cardCreatedAt(b));
    else if (mode === "modified") arr.sort((a, b) => cardModifiedAt(b) - cardModifiedAt(a));
    else if (mode === "chronological") arr.sort((a, b) => cardStartYear(CARD_BY_ID[a]) - cardStartYear(CARD_BY_ID[b]));
    return arr; // "order" keeps natural order of appearance
  }

  const adminState = { tab: "cards", node: null, card: null, search: "", treeCollapsed: false, glossKey: null, glossTag: null, expanded: {}, selected: new Set(), sort: "order", glossSort: "az", lastSelId: null, preview: false };
  // Remember where the editor was (open card / deck / tab / search / scroll) across FULL page reloads. Auto-save-to-files can make a
  // file-watching dev server live-reload the page after every edit; without this you'd land back at the top of the deck each time.
  const ADMIN_UI_KEY = "folio_admin_ui_v1";
  function loadAdminUI() { try { return JSON.parse(localStorage.getItem(ADMIN_UI_KEY)); } catch (e) { return null; } }
  let _adminUIT = 0;
  function saveAdminUINow() {
    const s = adminState, li = document.getElementById("adminListItems");
    if (li) s._scroll = li.scrollTop;   // keep the latest admin scroll cached, so a save fired from another page still has it
    try { localStorage.setItem(ADMIN_UI_KEY, JSON.stringify({ tab: s.tab, node: s.node, card: s.card, glossKey: s.glossKey, glossTag: s.glossTag, search: s.search, sort: s.sort, glossSort: s.glossSort, preview: !!s.preview, expanded: s.expanded, scroll: s._scroll || 0 })); } catch (e) {}
  }
  function saveAdminUI() { clearTimeout(_adminUIT); _adminUIT = setTimeout(saveAdminUINow, 200); }   // debounced; also flushed on pagehide below
  (function restoreAdminUI() {   // seed adminState from the last session (card/node validity is re-checked at render, once the tree is built)
    const u = loadAdminUI(); if (!u || typeof u !== "object") return;
    if (typeof u.tab === "string") adminState.tab = u.tab;
    if (typeof u.search === "string") adminState.search = u.search;
    if (typeof u.sort === "string") adminState.sort = u.sort;
    if (typeof u.glossSort === "string") adminState.glossSort = u.glossSort;
    if (typeof u.preview === "boolean") adminState.preview = u.preview;
    if (u.expanded && typeof u.expanded === "object") adminState.expanded = u.expanded;
    adminState.node = u.node != null ? u.node : null;
    adminState.card = u.card || null;
    adminState.glossKey = u.glossKey || null;
    adminState.glossTag = u.glossTag || null;
    adminState._scroll = u.scroll || 0;
  })();
  try { window.addEventListener("pagehide", saveAdminUINow); } catch (e) {}   // flush the latest position right before an unload/reload
  const DECKLESS_ID = "__deckless__";   // virtual admin-only node listing cards in no deck (never shown in the library)
  // admin-only card colour marks (right-click a card row). Purely curatorial — never shown on the study page.
  const CARD_COLORS = [{ k: "red", h: "#d8453c" }, { k: "amber", h: "#e0982b" }, { k: "green", h: "#3a9d5b" }, { k: "blue", h: "#3a6ea8" }, { k: "purple", h: "#8a5cc4" }, { k: "slate", h: "#64748b" }];
  const COLOR_HEX = Object.fromEntries(CARD_COLORS.map((c) => [c.k, c.h]));
  function closeColorMenu() {
    const m = document.querySelector(".admin-colormenu"); if (m) m.remove();
    document.removeEventListener("mousedown", colorMenuOutside, true); document.removeEventListener("keydown", colorMenuEsc, true);
  }
  function colorMenuOutside(e) { if (!e.target.closest(".admin-colormenu")) closeColorMenu(); }
  function colorMenuEsc(e) { if (e.key === "Escape") closeColorMenu(); }
  // current = the currently-set colour key (""/none); onPick(name) applies the chosen colour ("" = clear)
  function showColorMenu(x, y, current, onPick) {
    closeColorMenu();
    const menu = document.createElement("div");
    menu.className = "admin-colormenu";
    menu.innerHTML = CARD_COLORS.map((c) => '<button type="button" class="acm-sw' + (current === c.k ? " on" : "") + '" data-col="' + c.k + '" title="' + c.k + '" style="background:' + c.h + '"></button>').join("") +
      '<button type="button" class="acm-clear" data-col="" title="No colour">✕</button>';
    document.body.appendChild(menu);
    menu.style.left = Math.max(6, Math.min(x, window.innerWidth - menu.offsetWidth - 8)) + "px";
    menu.style.top = Math.max(6, Math.min(y, window.innerHeight - menu.offsetHeight - 8)) + "px";
    menu.querySelectorAll("[data-col]").forEach((b) => b.addEventListener("click", () => { onPick(b.dataset.col); closeColorMenu(); }));
    setTimeout(() => { document.addEventListener("mousedown", colorMenuOutside, true); document.addEventListener("keydown", colorMenuEsc, true); }, 0);
  }
  // resizable admin panel widths + glossary title-column width, persisted across sessions
  const ADMIN_LAYOUT_KEY = "folio_admin_layout";
  function loadAdminLayout() { try { return JSON.parse(localStorage.getItem(ADMIN_LAYOUT_KEY)) || {}; } catch (e) { return {}; } }
  function saveAdminLayout(o) { try { localStorage.setItem(ADMIN_LAYOUT_KEY, JSON.stringify(o)); } catch (e) {} }
  // place the glossary column divider on the boundary between the title and description columns
  function positionGlossDivider() {
    const gd = document.getElementById("glossColDivider"); if (!gd) return;
    const adminList = document.querySelector(".admin-list"); if (!adminList) return;
    const items = document.getElementById("adminListItems"); if (items) gd.style.top = items.offsetTop + "px";   // start below the search/tools, not across them
    const row = adminList.querySelector(".gloss-row");
    if (!row || !row.firstElementChild) { gd.style.display = "none"; return; }   // nothing to align to (empty / filtered-empty list)
    gd.style.display = "";
    const lr = adminList.getBoundingClientRect(), cr = row.firstElementChild.getBoundingClientRect();
    gd.style.left = (cr.right - lr.left + 6) + "px";
  }
  // wire a divider in the editor that resizes the (right-hand) card/glossary preview; persists its width
  function wirePreviewDivider(divider, previewEl, cssVar, layoutKey) {
    if (!divider || !previewEl) return;
    const adminEl = document.querySelector(".admin"); if (!adminEl) return;
    const cl = (v) => (v < 180 ? 180 : v > 760 ? 760 : v);
    divider.addEventListener("pointerdown", (e) => {
      const sx = e.clientX, sw = previewEl.offsetWidth; divider.classList.add("dragging");   // preview is to the right → dragging left widens it
      const onMove = (ev) => adminEl.style.setProperty(cssVar, cl(sw - (ev.clientX - sx)) + "px");
      const onUp = () => { divider.classList.remove("dragging"); document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); document.removeEventListener("pointercancel", onUp); const o = loadAdminLayout(); o[layoutKey] = previewEl.offsetWidth; saveAdminLayout(o); };
      document.addEventListener("pointermove", onMove); document.addEventListener("pointerup", onUp); document.addEventListener("pointercancel", onUp); e.preventDefault();
    });
  }

  // ---- rich-text helpers for the card/glossary editor fields ----
  // wrap the field's selection (or insert at the cursor) in before/after, then fire input so the edit + preview update
  function wrapField(el, before, after) {
    const s = el.selectionStart, e = el.selectionEnd, v = el.value, sel = v.slice(s, e);
    el.value = v.slice(0, s) + before + sel + after + v.slice(e);
    el.focus();
    if (sel) { el.selectionStart = s + before.length; el.selectionEnd = e + before.length; }
    else { el.selectionStart = el.selectionEnd = s + before.length; }
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
  // read a field's current value: innerHTML for the WYSIWYG (contenteditable) fields, .value for inputs
  function fieldVal(el) {
    if (!el || !el.dataset || !el.dataset.rich) return el ? el.value : "";
    if (!el.textContent.trim() && !el.querySelector("img,hr")) return "";   // a field cleared to just a stray <br>/whitespace stores as truly empty
    if (el.querySelector('.ttip[data-auto]')) {   // strip the display-only auto gloss links so the saved source stays clean (hand-added links keep their span)
      const clone = el.cloneNode(true);
      clone.querySelectorAll('.ttip[data-auto]').forEach((sp) => { const p = sp.parentNode; while (sp.firstChild) p.insertBefore(sp.firstChild, sp); p.removeChild(sp); });
      clone.normalize();
      return clone.innerHTML;
    }
    return el.innerHTML;
  }
  function closeGlossPicker() {
    const p = document.querySelector(".gloss-picker"); if (p) p.remove();
    document.removeEventListener("mousedown", glossPickerOutside, true); document.removeEventListener("keydown", glossPickerEsc, true);
  }
  function glossPickerOutside(e) { if (!e.target.closest(".gloss-picker")) closeGlossPicker(); }
  function glossPickerEsc(e) { if (e.key === "Escape") closeGlossPicker(); }
  // searchable glossary-term picker; onPick(slug) gets the chosen term key
  function showGlossPicker(x, y, preFilter, onPick, excludeKey) {
    closeGlossPicker();
    const panel = document.createElement("div"); panel.className = "gloss-picker";
    panel.innerHTML = '<input class="gp-search" type="text" placeholder="Search glossary terms…" /><div class="gp-list"></div>';
    document.body.appendChild(panel);
    panel.style.left = Math.max(6, Math.min(x, window.innerWidth - panel.offsetWidth - 8)) + "px";
    panel.style.top = Math.max(6, Math.min(y, window.innerHeight - panel.offsetHeight - 8)) + "px";
    const search = panel.querySelector(".gp-search"), list = panel.querySelector(".gp-list");
    const fold = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");   // diacritic-insensitive: "nuwa" matches "Nuwa"
    function render() {
      const q = fold(search.value.trim());
      const items = Object.keys(window.GLOSSARY || {}).map((k) => ({ k: k, t: glossTitle(k), tg: glossTags(k) }))
        .filter((o) => o.k !== excludeKey && (!q || fold(o.t).includes(q) || fold(o.k).includes(q) || fold(o.tg.join(", ")).includes(q)))
        .sort((a, b) => a.t.localeCompare(b.t)).slice(0, 60);
      list.innerHTML = items.length ? items.map((o) => '<button type="button" class="gp-item" data-k="' + esc(o.k) + '">' + esc(o.t) + (o.tg.length ? '<span class="gp-tags">' + esc(o.tg.join(", ")) + '</span>' : '') + '</button>').join("") : '<div class="gp-empty">No glossary terms match.</div>';
      list.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("mousedown", (ev) => { ev.preventDefault(); onPick(b.dataset.k); closeGlossPicker(); }));
    }
    search.value = preFilter || ""; render();
    if (preFilter && !list.querySelector(".gp-item")) { search.value = ""; render(); }   // the selection wasn't a term name → just show all terms
    search.addEventListener("input", render);
    search.focus(); search.select();
    setTimeout(() => { document.addEventListener("mousedown", glossPickerOutside, true); document.addEventListener("keydown", glossPickerEsc, true); }, 0);
  }
  // background field: wrap the selected word(s) in a glossary-link span pointing at the chosen term
  function linkGlossInField(ta, btn) {
    const s = ta.selectionStart, e = ta.selectionEnd;
    if (s === e) { toast("Select the word(s) to link to a glossary term first."); return; }
    const sel = ta.value.slice(s, e), r = btn.getBoundingClientRect();
    showGlossPicker(r.left, r.bottom + 4, sel.length <= 32 ? sel : "", (slug) => {
      const wrapped = '<span class="ttip" data-k="' + slug + '">' + sel + "</span>";
      ta.value = ta.value.slice(0, s) + wrapped + ta.value.slice(e);
      ta.focus(); ta.selectionStart = s; ta.selectionEnd = s + wrapped.length;
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
  // background field: strip the glossary-link span around the cursor (keep its inner text)
  function unlinkGlossInField(ta) {
    const pos = ta.selectionStart, v = ta.value, re = /<span class="ttip"[^>]*>([\s\S]*?)<\/span>/gi;
    let m;
    while ((m = re.exec(v))) {
      const start = m.index, end = m.index + m[0].length;
      if (pos >= start && pos <= end) {
        ta.value = v.slice(0, start) + m[1] + v.slice(end);
        ta.focus(); ta.selectionStart = start; ta.selectionEnd = start + m[1].length;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }
    }
    toast("Put the cursor inside a linked term (a blue word) to unlink it.");
  }
  // add a bold/italic toolbar (+ Ctrl/Cmd+B / +I) to each rich textarea; the background field also gets link/unlink
  function addFieldToolbars(host) {
    host.querySelectorAll("textarea.af-input").forEach((ta) => {
      ta.addEventListener("keydown", (e) => {
        if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
        const k = e.key.toLowerCase();
        if (k === "b") { e.preventDefault(); wrapField(ta, "<b>", "</b>"); }
        else if (k === "i") { e.preventDefault(); wrapField(ta, "<i>", "</i>"); }
      });
      const isBg = ta.dataset.field === "abstract";
      const bar = document.createElement("div"); bar.className = "af-toolbar";
      bar.innerHTML = '<button type="button" class="af-tbtn" data-act="b" title="Bold (Ctrl+B)"><b>B</b></button>' +
        '<button type="button" class="af-tbtn" data-act="i" title="Italic (Ctrl+I)"><i>I</i></button>' +
        (isBg ? '<span class="af-tsep"></span><button type="button" class="af-tbtn af-twide" data-act="link" title="Link the selected word(s) to a glossary term">Link term</button><button type="button" class="af-tbtn af-twide" data-act="unlink" title="Remove the glossary link around the cursor">Unlink</button>' : "");
      ta.parentNode.insertBefore(bar, ta);
      bar.querySelectorAll("[data-act]").forEach((b) => {
        b.addEventListener("mousedown", (e) => e.preventDefault());   // keep the textarea focused + its selection intact
        b.addEventListener("click", (e) => {
        e.preventDefault();
        const a = b.dataset.act;
        if (a === "b") wrapField(ta, "<b>", "</b>");
        else if (a === "i") wrapField(ta, "<i>", "</i>");
        else if (a === "link") linkGlossInField(ta, b);
        else if (a === "unlink") unlinkGlossInField(ta);
        });
      });
    });
  }

  // ---- WYSIWYG rich editor: a shared formatting ribbon + bottom-left HTML-source window ----
  // markup for the formatting ribbon (acts on whichever rich field is focused)
  function rtRibbonHtml() {
    const btn = (cmd, title, label) => '<button type="button" class="rt-btn" data-cmd="' + cmd + '" title="' + title + '">' + label + "</button>";
    return '<div class="rt-ribbon" id="rtRibbon" role="toolbar" aria-label="Text formatting">' +
      btn("bold", "Bold (Ctrl+B)", "<b>B</b>") + btn("italic", "Italic (Ctrl+I)", "<i>I</i>") +
      btn("underline", "Underline (Ctrl+U)", "<u>U</u>") + btn("strikeThrough", "Strikethrough", "<s>S</s>") +
      '<span class="rt-sep"></span>' +
      btn("superscript", "Superscript", "x<sup>2</sup>") + btn("subscript", "Subscript", "x<sub>2</sub>") +
      '<span class="rt-sep"></span>' +
      btn("insertUnorderedList", "Bulleted list", "&#8226;&#8201;&#8226;") + btn("insertOrderedList", "Numbered list", "1.") +
      '<span class="rt-sep"></span>' +
      '<button type="button" class="rt-btn rt-color-btn" data-act="color" title="Text colour"><span class="rt-colA">A</span><span class="rt-colBar"></span></button>' +
      btn("removeFormat", "Clear formatting", "&#11199;") +
      '<span class="rt-sep rt-link-sep"></span>' +
      '<button type="button" class="rt-btn rt-link rt-wide" data-act="link" title="Link the selected word(s) to a glossary term">Link term</button>' +
      '<button type="button" class="rt-btn rt-link rt-wide" data-act="unlink" title="Remove the glossary link around the cursor">Unlink</button>' +
      "</div>";
  }
  // gloss-aware rich fields: the card "abstract" and the glossary "glossdesc" both auto-link terms + support the bubble/Link/Unlink
  function isGlossField(el) { return !!el && (el.dataset.field === "abstract" || el.dataset.field === "glossdesc"); }
  function richFieldOwner(el) { return el && el.dataset.field === "glossdesc" ? adminState.glossKey : adminState.card; }   // whose glossOff list a removal is remembered under
  function richSelfKey(el) { return el && el.dataset.field === "glossdesc" ? adminState.glossKey : null; }   // a glossary description must not link to its own term
  function richAutoLink(el) {   // show the auto gloss links inside a gloss-aware field (skipping the field's own term + removed ones)
    const f = el.dataset.field;
    if (f === "abstract") autoLinkGlossary(el, (CARD_BY_ID[adminState.card] || {}).answer, glossOffList(adminState.card));
    else if (f === "glossdesc") autoLinkGlossary(el, "", [adminState.glossKey].concat(glossOffList(adminState.glossKey)));
  }
  // render a glossary description into el: its HTML (styling + hand-added links) + auto-linked other terms (never itself / removed ones). Caller wires tooltips.
  function renderGlossDesc(el, key, descText) { el.innerHTML = descText || ""; autoLinkGlossary(el, "", [key].concat(glossOffList(key))); boldFirstTerm(el, glossTitle(key)); }
  // bold the term's first mention in its own gloss description (like the answer term opening a card background)
  function boldFirstTerm(el, title) {
    if (!el || !title) return;
    const rx = new RegExp("(?:^|\\W)(" + title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?:\\W|$)", "i");
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walk.nextNode())) {
      if (node.parentElement && node.parentElement.closest("a, b, strong, .ttip")) continue;   // skip linked / already-bold text
      const m = rx.exec(node.nodeValue); if (!m) continue;
      const start = m.index + m[0].indexOf(m[1]);
      const range = document.createRange(); range.setStart(node, start); range.setEnd(node, start + m[1].length);
      const b = document.createElement("b"); try { range.surroundContents(b); } catch (e) {}
      return;
    }
  }
  // ---- click a gloss word in a rich field → bubble to view / change / remove its glossary link ----
  function closeGlossBubble() {
    const b = document.querySelector(".gloss-bubble"); if (b) b.remove();
    document.removeEventListener("mousedown", glossBubbleOutside, true); document.removeEventListener("keydown", glossBubbleEsc, true);
  }
  function glossBubbleOutside(e) { if (!e.target.closest(".gloss-bubble") && !e.target.closest(".gloss-picker") && !e.target.closest(".ttip")) closeGlossBubble(); }
  function glossBubbleEsc(e) { if (e.key === "Escape") { closeGlossPicker(); closeGlossBubble(); } }
  function showGlossBubble(ttipEl, fieldEl) {
    closeGlossBubble();
    const bubble = document.createElement("div"); bubble.className = "gloss-bubble";
    const render = () => { bubble.innerHTML = '<span class="gb-arrow">linked to</span><button type="button" class="gb-term" title="Change which glossary term this links to">' + esc(glossTitle(ttipEl.getAttribute("data-k"))) + '</button><button type="button" class="gb-remove" title="Remove this glossary link">&#10005;</button>'; wire(); };
    const place = () => { const r = ttipEl.getBoundingClientRect(); bubble.style.left = Math.max(6, Math.min(r.left, window.innerWidth - bubble.offsetWidth - 8)) + "px"; bubble.style.top = Math.max(6, r.top - bubble.offsetHeight - 7) + "px"; };
    function wire() {
      bubble.querySelector(".gb-term").addEventListener("click", (e) => {
        e.stopPropagation(); const r = bubble.getBoundingClientRect();
        showGlossPicker(r.left, r.bottom + 4, "", (newSlug) => { ttipEl.setAttribute("data-k", newSlug); ttipEl.removeAttribute("data-auto"); setGlossOff(richFieldOwner(fieldEl), newSlug, false); fieldEl.dispatchEvent(new Event("input", { bubbles: true })); render(); place(); }, richSelfKey(fieldEl));
      });
      bubble.querySelector(".gb-remove").addEventListener("click", (e) => {
        e.stopPropagation();
        setGlossOff(richFieldOwner(fieldEl), ttipEl.getAttribute("data-k"), true);   // remember the removal so the term doesn't auto-re-link on reload
        const p = ttipEl.parentNode; while (ttipEl.firstChild) p.insertBefore(ttipEl.firstChild, ttipEl); p.removeChild(ttipEl); p.normalize();
        fieldEl.dispatchEvent(new Event("input", { bubbles: true })); closeGlossBubble();
      });
    }
    document.body.appendChild(bubble); render(); place();
    setTimeout(() => { document.addEventListener("mousedown", glossBubbleOutside, true); document.addEventListener("keydown", glossBubbleEsc, true); }, 0);
  }
  function closeRtColorMenu() { const m = document.querySelector(".rt-colormenu"); if (m) m.remove(); document.removeEventListener("mousedown", rtColorOutside, true); }
  function rtColorOutside(e) { if (!e.target.closest(".rt-colormenu") && !e.target.closest(".rt-color-btn")) closeRtColorMenu(); }
  function showTextColorMenu(x, y, onPick) {
    closeRtColorMenu();
    const cols = ["#1B1A17", "#5b5a57", "#9A3324", "#C0392B", "#B5532A", "#9A6A00", "#1C7C54", "#1C5D6B", "#2C5AA0", "#4E4CB0", "#7A3FB0", "#A23E8C"];
    const menu = document.createElement("div"); menu.className = "rt-colormenu";
    menu.innerHTML = cols.map((c) => '<button type="button" class="rt-sw" data-c="' + c + '" style="background:' + c + '" title="' + c + '"></button>').join("") +
      '<button type="button" class="rt-sw rt-sw-clear" data-c="" title="Remove colour">&#11199;</button>';
    document.body.appendChild(menu);
    menu.style.left = Math.max(6, Math.min(x, window.innerWidth - menu.offsetWidth - 8)) + "px";
    menu.style.top = Math.max(6, Math.min(y, window.innerHeight - menu.offsetHeight - 8)) + "px";
    menu.querySelectorAll(".rt-sw").forEach((b) => b.addEventListener("mousedown", (e) => { e.preventDefault(); onPick(b.dataset.c || null); closeRtColorMenu(); }));
    setTimeout(() => document.addEventListener("mousedown", rtColorOutside, true), 0);
  }
  // background field: wrap the current selection inside the contenteditable in a glossary-link span
  function linkGlossRich(el, btn) {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) { toast("Select the word(s) to link to a glossary term first."); return; }
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) { toast("Select the word(s) to link to a glossary term first."); return; }
    const text = range.toString(), saved = range.cloneRange(), r = btn.getBoundingClientRect();
    showGlossPicker(r.left, r.bottom + 4, text.length <= 32 ? text : "", (slug) => {
      const span = document.createElement("span"); span.className = "ttip"; span.setAttribute("data-k", slug);
      try { saved.surroundContents(span); }
      catch (e) { const frag = saved.extractContents(); span.appendChild(frag); saved.insertNode(span); }
      setGlossOff(richFieldOwner(el), slug, false);   // re-linking a term clears any earlier removal
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, richSelfKey(el));
  }
  // background field: unwrap the glossary-link span surrounding the cursor (keep its text)
  function unlinkGlossRich(el) {
    const sel = window.getSelection();
    if (!sel.rangeCount) { toast("Put the cursor inside a linked term (a blue word) to unlink it."); return; }
    let node = sel.getRangeAt(0).startContainer;
    while (node && node !== el) {
      if (node.nodeType === 1 && node.classList && node.classList.contains("ttip")) {
        const parent = node.parentNode;
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node); parent.normalize();
        el.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }
      node = node.parentNode;
    }
    toast("Put the cursor inside a linked term (a blue word) to unlink it.");
  }
  // remove inline text colour from elements intersecting the current selection (and unwrap now-bare spans)
  function stripSelectionColor(el) {
    const sel = window.getSelection(); if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    el.querySelectorAll('[style*="color"]').forEach((sp) => {
      if (!range.intersectsNode(sp)) return;
      sp.style.removeProperty("color");
      if (!sp.getAttribute("style")) {
        sp.removeAttribute("style");
        if (sp.tagName === "SPAN" && !sp.attributes.length) { const p = sp.parentNode; while (sp.firstChild) p.insertBefore(sp.firstChild, sp); p.removeChild(sp); p.normalize(); }
      }
    });
  }
  // wire the ribbon + source window to the card editor's contenteditable fields
  function wireRichEditor(host) {
    const ribbon = host.querySelector("#rtRibbon"); if (!ribbon) return;
    const richEls = [...host.querySelectorAll("[data-rich]")]; if (!richEls.length) return;
    let active = null;
    try { document.execCommand("styleWithCSS", false, false); } catch (e) {}
    try { document.execCommand("defaultParagraphSeparator", false, "br"); } catch (e) {}
    function setActive(el) { active = el; ribbon.classList.toggle("on-bg", isGlossField(el)); }
    function doCmd(cmd, val) {
      if (!active) return; active.focus();
      // colour as a clean <span style="color"> (styleWithCSS on); keep b/i/u/s as plain tags (off)
      if (cmd === "removeColor") { stripSelectionColor(active); }
      else if (cmd === "foreColor") { try { document.execCommand("styleWithCSS", false, true); } catch (e) {} document.execCommand(cmd, false, val); try { document.execCommand("styleWithCSS", false, false); } catch (e) {} }
      else if (cmd === "insertLineBreak") { if (!document.execCommand("insertLineBreak")) document.execCommand("insertHTML", false, "<br>"); }
      else document.execCommand(cmd, false, val);
      active.dispatchEvent(new Event("input", { bubbles: true }));
    }
    richEls.forEach((el) => {
      const f = el.dataset.field;
      const srcTa = host.querySelector('.af-src[data-src-for="' + f + '"]'), srcToggle = host.querySelector('[data-src-toggle="' + f + '"]');
      let syncing = false;   // per-field guard between the WYSIWYG and its HTML-source box
      el.addEventListener("focus", () => setActive(el));
      el.addEventListener("input", () => { if (!syncing && srcTa && !srcTa.hidden) { syncing = true; srcTa.value = fieldVal(el); syncing = false; } });
      el.addEventListener("paste", (e) => { e.preventDefault(); const t = ((e.clipboardData || window.clipboardData) || { getData: () => "" }).getData("text/plain"); document.execCommand("insertText", false, t); });   // paste as plain text — keep the shipped markup clean
      el.addEventListener("click", (e) => { const t = e.target.closest(".ttip"); if (t && el.contains(t) && isGlossField(el)) showGlossBubble(t, el); });   // click a gloss word → its editing bubble (gloss-aware fields only)
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {   // a plain Enter injects <div>/<br>/&nbsp;; insert a single <br> instead — but keep native behaviour inside a list
          let n = window.getSelection().anchorNode, inList = false;
          while (n && n !== el) { if (n.nodeName === "LI") { inList = true; break; } n = n.parentNode; }
          if (!inList) { e.preventDefault(); doCmd("insertLineBreak"); return; }
        }
        if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
        const k = e.key.toLowerCase();
        if (k === "b") { e.preventDefault(); doCmd("bold"); }
        else if (k === "i") { e.preventDefault(); doCmd("italic"); }
        else if (k === "u") { e.preventDefault(); doCmd("underline"); }
      });
      if (srcToggle && srcTa) {
        srcToggle.addEventListener("click", () => { const show = srcTa.hidden; srcTa.hidden = !show; srcToggle.classList.toggle("open", show); if (show) { syncing = true; srcTa.value = fieldVal(el); syncing = false; } });
        srcTa.addEventListener("input", () => { if (syncing) return; syncing = true; el.innerHTML = srcTa.value; if (isGlossField(el)) richAutoLink(el); try { el.dispatchEvent(new Event("input", { bubbles: true })); } finally { syncing = false; } });   // re-show the auto gloss links after a source edit
      }
    });
    ribbon.querySelectorAll(".rt-btn").forEach((b) => {
      b.addEventListener("mousedown", (e) => e.preventDefault());   // keep the focused field's selection
      b.addEventListener("click", (e) => {
        e.preventDefault();
        if (b.dataset.cmd) doCmd(b.dataset.cmd);
        else if (b.dataset.act === "color") { const r = b.getBoundingClientRect(); showTextColorMenu(r.left, r.bottom + 4, (col) => doCmd(col ? "foreColor" : "removeColor", col)); }
        else if (b.dataset.act === "link") { if (active && isGlossField(active)) linkGlossRich(active, b); }
        else if (b.dataset.act === "unlink") { if (active && isGlossField(active)) unlinkGlossRich(active); }
      });
    });
    setActive(richEls.find((el) => el.dataset.field === "abstract") || richEls[0]);
  }
  let _dragNodeId = null;

  function adminFindRow(attr, val) {
    const rows = document.querySelectorAll(".admin-card-row");
    for (let i = 0; i < rows.length; i++) if (rows[i].dataset[attr] === val) return rows[i];
    return null;
  }
  function adminFlashSaved() {
    const s = document.getElementById("adminSaved"); if (!s) return;
    s.textContent = "Saved"; s.classList.add("show");
    clearTimeout(adminFlashSaved._t); adminFlashSaved._t = setTimeout(() => s.classList.remove("show"), 1000);
  }
  function adminUpdateCount() { const el = document.getElementById("adminEditCount"); if (el) { const n = adminEditCount(); el.textContent = n ? n + (n === 1 ? " edit" : " edits") : "No edits"; } }
  function adminSetListCount(n, noun) { const el = document.getElementById("adminListCount"); if (el) el.textContent = n + " " + noun + (n === 1 ? "" : "s"); }
  // serialize the live (delta-applied) in-memory data back into data.js / glossary.js source text
  function serializeCardData() {
    const cards = CARDS.map((c) => { const o = { id: c.id }; CARD_FIELDS.forEach((f) => { o[f] = c[f] == null ? "" : c[f]; }); return o; });
    const countIds = (node) => { const s = new Set(); (function w(n) { (n.cardIds || []).forEach((i) => s.add(i)); (n.children || []).forEach(w); })(node); return s.size; };
    function ser(node, isTop) {
      const o = { id: node.id, title: node.title };
      if (node.hanzi) o.hanzi = node.hanzi;
      if (isTop) { const m = COLLECTION_META[node.id]; if (m && m.blurb != null) o.blurb = m.blurb; o.total = Math.max(countIds(node), (m && m.total) || 0); }   // total >= live card count
      o.placeholder = !!node.placeholder;
      const kids = (node.children || []).length ? node.children.map((ch) => ser(ch, false)) : null;
      if (kids) o.children = kids;
      if ((node.cardIds || []).length) o.cardIds = node.cardIds.slice();   // emit own cards even alongside children (defensive)
      else if (!kids) o.cardIds = [];                                      // a childless leaf always gets a cardIds array
      return o;
    }
    const tree = { collections: (TREE.collections || []).map((c) => ser(c, true)) };
    return "/* Card data + collection tree, saved from the in-app editor. */\n" +
      "window.CARD_DATA = [\n" + cards.map((c) => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
      "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n";
  }
  function serializeGlossary() {
    const ob = (o) => "{\n" + Object.keys(o).map((k) => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";
    const G = window.GLOSSARY || {}, D = window.GLOSSARY_DATES || {}, Tt = window.GLOSSARY_TITLES || {}, Al = window.GLOSSARY_ALIASES || {};
    let s = "/* Glossary, saved from the in-app editor (keyed by Wikipedia slug). */\n" +
      "window.GLOSSARY = " + ob(G) + ";\n\n" +
      "window.GLOSSARY_DATES = Object.assign(window.GLOSSARY_DATES || {}, " + ob(D) + ");\n";
    if (Object.keys(Tt).length) s += "\nwindow.GLOSSARY_TITLES = Object.assign(window.GLOSSARY_TITLES || {}, " + ob(Tt) + ");\n";
    if (Object.keys(Al).length) s += "\nwindow.GLOSSARY_ALIASES = Object.assign(window.GLOSSARY_ALIASES || {}, " + ob(Al) + ");\n";   // preserve aliases (shipped + edited) — they live only in the overlay otherwise
    const Cs = window.GLOSSARY_CASESENSITIVE || {};
    if (Object.keys(Cs).length) s += "\nwindow.GLOSSARY_CASESENSITIVE = Object.assign(window.GLOSSARY_CASESENSITIVE || {}, " + ob(Cs) + ");\n";   // preserve case-sensitive link flags (e.g. God/Heaven/Gun) — otherwise a Save-to-project silently strips them
    const Tg = window.GLOSSARY_TAGS || {};
    if (Object.keys(Tg).length) s += "\nwindow.GLOSSARY_TAGS = Object.assign(window.GLOSSARY_TAGS || {}, " + ob(Tg) + ");\n";   // preserve category tags (slug -> [tags]) — they power the admin tag filter
    return s;
  }
  function downloadText(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    const a = document.createElement("a"); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
  async function writeFileTo(dir, name, text) { const fh = await dir.getFileHandle(name, { create: true }); const w = await fh.createWritable(); await w.write(text); await w.close(); }
  // ---------- Auto-save to project files (Chrome + File System Access API, served over http://localhost) ----------
  // When ON, every admin edit is written straight into data.js / glossary.js / timeline.js (debounced ~20s) — no "Save to project"
  // click needed. The chosen folder handle is persisted in IndexedDB so it survives reloads; Chrome's WRITE permission is per-
  // session though, so after a reload the first save needs a user gesture — the toolbar shows a "Reconnect" state you click to re-
  // grant. The delta overlay is left UNTOUCHED (applyAdminEdits is idempotent — created cards guard on existence, everything else
  // is set-based), so the baked files + the overlay stay consistent and a later reload re-applies cleanly with no duplicates.
  const AUTOSAVE_KEY = "folio_autosave_v1";
  let autoSaveDir = null, autoSaveArmed = false, _autoWriteT = 0, _autoWriting = false, _autoState = "off";
  const _lastWritten = {};   // filename → last text written (skip re-writing unchanged files)
  function _idbDir(store) {   // store === undefined → READ the saved handle; else PERSIST it. Resolves to handle / true / null.
    return new Promise((resolve) => {
      let req; try { req = indexedDB.open("folio-fs", 1); } catch (e) { resolve(null); return; }
      req.onupgradeneeded = () => { try { req.result.createObjectStore("h"); } catch (e) {} };
      req.onerror = () => resolve(null);
      req.onsuccess = () => { const db = req.result; try {
        const write = store !== undefined, tx = db.transaction("h", write ? "readwrite" : "readonly"), os = tx.objectStore("h");
        if (write) { os.put(store, "dir"); tx.oncomplete = () => resolve(true); tx.onerror = () => resolve(null); }
        else { const g = os.get("dir"); g.onsuccess = () => resolve(g.result || null); g.onerror = () => resolve(null); }
      } catch (e) { resolve(null); } };
    });
  }
  async function _dirPerm(dir, request) {
    if (!dir || !dir.queryPermission) return "denied";
    try { let p = await dir.queryPermission({ mode: "readwrite" }); if (p !== "granted" && request) p = await dir.requestPermission({ mode: "readwrite" }); return p; } catch (e) { return "denied"; }
  }
  function setAutoSaveStatus(s) {   // off | on | saving | saved | reconnect | error
    _autoState = s;
    const b = document.getElementById("adminAutosave"); if (!b) return;
    b.textContent = { off: "Auto-save: off", on: "Auto-save: on", saving: "Auto-save: saving…", saved: "Auto-save: on ✓", reconnect: "Auto-save: reconnect", error: "Auto-save: error" }[s] || "Auto-save: off";
    b.classList.toggle("on", s === "on" || s === "saving" || s === "saved");
    b.classList.toggle("warn", s === "reconnect" || s === "error");
  }
  function autoSaveFiles() { const f = { "data.js": serializeCardData(), "glossary.js": serializeGlossary() }; if (Array.isArray(ADMIN_EDITS.timeline)) f["timeline.js"] = serializeTimeline(); return f; }
  async function autoSaveNow() {
    if (!autoSaveArmed || !autoSaveDir) return;
    if (_autoWriting) { autoSaveWrite(); return; }                                  // a write is in flight → coalesce into the next tick
    if ((await _dirPerm(autoSaveDir, false)) !== "granted") { autoSaveArmed = false; setAutoSaveStatus("reconnect"); return; }   // permission lapsed (new session) → needs a gesture
    _autoWriting = true; setAutoSaveStatus("saving");
    try {
      const files = autoSaveFiles();
      for (const name in files) { if (_lastWritten[name] === files[name]) continue; await writeFileTo(autoSaveDir, name, files[name]); _lastWritten[name] = files[name]; }
      setAutoSaveStatus("saved");
    } catch (e) { setAutoSaveStatus("error"); }
    _autoWriting = false;
  }
  function autoSaveWrite() { if (!autoSaveArmed) return; clearTimeout(_autoWriteT); _autoWriteT = setTimeout(autoSaveNow, 20000); }   // called on every edit — debounced 20s after you stop typing
  async function enableAutoSave() {   // from a user gesture (the toolbar toggle)
    if (location.protocol === "file:" || !window.showDirectoryPicker) { toast("Auto-save needs Chrome served over http://localhost — not a file:// page or this preview webview."); return; }
    let dir; try { dir = await window.showDirectoryPicker({ id: "folio-project", mode: "readwrite" }); }
    catch (e) { if (!(e && e.name === "AbortError")) toast("Couldn't open the folder picker."); return; }
    if ((await _dirPerm(dir, true)) !== "granted") { toast("Write permission wasn't granted for that folder."); return; }
    autoSaveDir = dir; autoSaveArmed = true; try { localStorage.setItem(AUTOSAVE_KEY, "1"); } catch (e) {}
    _idbDir(dir); for (const k in _lastWritten) delete _lastWritten[k];   // persist the handle + force a full write of the current state
    await autoSaveNow(); toast("Auto-save on — edits now write straight to the project files.");
  }
  function disableAutoSave() { autoSaveArmed = false; clearTimeout(_autoWriteT); try { localStorage.removeItem(AUTOSAVE_KEY); } catch (e) {} setAutoSaveStatus("off"); toast("Auto-save off."); }
  async function reconnectAutoSave() {   // new session: re-grant write permission on the persisted handle (needs this gesture)
    if (!autoSaveDir) autoSaveDir = await _idbDir();
    if (!autoSaveDir) { enableAutoSave(); return; }
    if ((await _dirPerm(autoSaveDir, true)) !== "granted") { toast("Folder access wasn't granted — auto-save stays paused."); return; }
    autoSaveArmed = true; for (const k in _lastWritten) delete _lastWritten[k]; await autoSaveNow(); toast("Auto-save reconnected.");
  }
  function toggleAutoSave() { if (_autoState === "reconnect") reconnectAutoSave(); else if (_autoState === "off") enableAutoSave(); else disableAutoSave(); }   // the toolbar button
  async function initAutoSave() {   // on admin-page entry: restore the saved handle; permission usually needs a reconnect gesture after a reload
    if (localStorage.getItem(AUTOSAVE_KEY) !== "1") { setAutoSaveStatus("off"); return; }
    autoSaveDir = await _idbDir();
    if ((await _dirPerm(autoSaveDir, false)) === "granted") { autoSaveArmed = true; setAutoSaveStatus("on"); }
    else setAutoSaveStatus("reconnect");
  }

  // "Save to project": write data.js + glossary.js directly (File System Access API), then clear the delta overlay and reload.
  // Fallback (file:// or unsupported browser): download the two generated files so they can be placed manually.
  async function adminExport() {
    const dataJs = serializeCardData(), glossJs = serializeGlossary();
    const hasTl = Array.isArray(ADMIN_EDITS.timeline);
    // fallback for any path where direct write isn't available: download the generated files so they can be placed manually.
    // stagger the fallback downloads: firing 2–3 a.click() downloads in one tight loop trips Chrome's "site is trying to
    // download multiple files" block, so only the first would actually save. Space them out so every file lands.
    const download = (msg) => {
      const files = [["data.js", dataJs], ["glossary.js", glossJs]];
      if (hasTl) files.push(["timeline.js", serializeTimeline()]);
      files.forEach(([n, t], i) => setTimeout(() => downloadText(n, t), i * 350));
      toast(msg);
    };
    // file:// is an opaque origin — showDirectoryPicker rejects there with SecurityError, so don't flash a doomed picker; go straight to download with a localhost tip.
    if (location.protocol === "file:" || !window.showDirectoryPicker) {
      download(location.protocol === "file:"
        ? "Browsers can't write to a folder from a file:// page — serve the folder over http://localhost for one-click save. For now the files were downloaded; place them in the project folder."
        : "This browser can't write files directly — downloaded the files to place in the project folder.");
      return;
    }
    let dir;
    try { dir = await window.showDirectoryPicker({ id: "folio-project", mode: "readwrite" }); }
    catch (e) { if (e && e.name === "AbortError") return; download("Couldn't open the folder picker — downloaded the files to place in the project folder instead."); return; }   // AbortError = user dismissed the picker (silent); any other picker error → download fallback
    // showDirectoryPicker({mode:"readwrite"}) usually grants write at pick time; query first, then request only if needed. requestPermission may not re-prompt without an active user gesture, so treat any non-"granted" result as "fall back to download" rather than a dead end.
    let perm = "denied";
    try { perm = await dir.queryPermission({ mode: "readwrite" }); if (perm !== "granted") perm = await dir.requestPermission({ mode: "readwrite" }); } catch (e) {}
    if (perm !== "granted") {
      download("Write permission wasn't granted for that folder — downloaded the files to place manually instead.");
      return;
    }
    try {
      await writeFileTo(dir, "data.js", dataJs);
      await writeFileTo(dir, "glossary.js", glossJs);
      if (hasTl) await writeFileTo(dir, "timeline.js", serializeTimeline());   // commit historical eras to timeline.js (then the overlay copy is dropped below)
      // deck date labels + coming-soon pins live only in the delta overlay (not encoded in the files) — keep them so a
      // save never loses them; everything else is now baked into data.js / glossary.js, so drop it.
      try {
        const dt = ADMIN_EDITS.tree.dates || {}, sn = ADMIN_EDITS.tree.soon || {}, ch = ADMIN_EDITS.chrono || {}, cc = ADMIN_EDITS.cardColor || {}, gc = ADMIN_EDITS.glossColor || {}, go = ADMIN_EDITS.glossOff || {};
        if (Object.keys(dt).length || Object.keys(sn).length || Object.keys(ch).length || Object.keys(cc).length || Object.keys(gc).length || Object.keys(go).length)
          localStorage.setItem(ADMIN_KEY, JSON.stringify({ cards: {}, glossary: {}, glossaryDates: {}, glossaryTitles: {}, created: {}, deleted: {}, membership: {}, meta: {}, chrono: ch, cardColor: cc, glossColor: gc, glossOff: go, tree: { renames: {}, created: {}, deleted: {}, moved: {}, order: {}, soon: sn, dates: dt } }));
        else localStorage.removeItem(ADMIN_KEY);
      } catch (e) {}
      toast("Saved to data.js + glossary.js — reloading…");
      setTimeout(() => location.reload(), 700);
    } catch (e) { download("Couldn't write to the folder (" + (e && e.message || e) + ") — downloaded the files to place manually instead."); }
  }

  // Save bridge for hosts where "Save to project" can't reach the disk — e.g. the Claude Code preview
  // webview, which blocks the File System Access folder picker AND file downloads, so the button's
  // write silently no-ops. Exposes the exact file text the editor would write, plus the post-save
  // overlay prune that adminExport performs, so a tool with disk access (Claude Code) can commit the
  // edits and reset the overlay. Read-only and inert for normal browser use, where the button works.
  window.folioSave = {
    files: function () {
      const out = { "data.js": serializeCardData(), "glossary.js": serializeGlossary() };
      if (Array.isArray(ADMIN_EDITS.timeline)) out["timeline.js"] = serializeTimeline();
      return out;
    },
    // the overlay to keep after files are written: only the overlay-only metadata (deck dates,
    // coming-soon pins, sort-year, colour marks, per-card gloss-off) survives; everything baked into
    // the files is dropped. Returns null when nothing metadata-only remains (caller removes the key).
    prunedOverlay: function () {
      const T = ADMIN_EDITS.tree || {};
      const dt = T.dates || {}, sn = T.soon || {}, ch = ADMIN_EDITS.chrono || {}, cc = ADMIN_EDITS.cardColor || {}, gc = ADMIN_EDITS.glossColor || {}, go = ADMIN_EDITS.glossOff || {};
      const keep = Object.keys(dt).length || Object.keys(sn).length || Object.keys(ch).length || Object.keys(cc).length || Object.keys(gc).length || Object.keys(go).length;
      return keep ? { cards: {}, glossary: {}, glossaryDates: {}, glossaryTitles: {}, created: {}, deleted: {}, membership: {}, meta: {}, chrono: ch, cardColor: cc, glossColor: gc, glossOff: go, tree: { renames: {}, created: {}, deleted: {}, moved: {}, order: {}, soon: sn, dates: dt } } : null;
    }
  };

  function adminTreeNodeHtml(node, depth) {
    const isBranch = nodeIsBranch(node);
    const expanded = !!adminState.expanded[node.id];
    const active = adminState.node === node.id;
    const count = subtreeCardIds(node).length;
    const isCol = !!COLLECTION_BY_ID[node.id];
    const canAddChild = isCol || isBranch || !(node.cardIds && node.cardIds.length);
    const ICON_ADD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    const ICON_REN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
    const ICON_DEL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    const ICON_DATE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>';
    let h = '<div class="admin-node-row" style="--depth:' + depth + '">';
    if (isBranch) {
      h += '<button class="an-twisty' + (expanded ? " open" : "") + '" type="button" data-twisty="' + esc(node.id) + '" aria-label="Expand or collapse"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg></button>';
    } else {
      h += '<span class="an-twisty-spacer"></span>';
    }
    h += '<button class="admin-node ' + (isBranch ? "branch" : "leaf") + (active ? " active" : "") + (nodeIsEdited(node.id) ? " node-edited" : "") + '" type="button" draggable="true" data-node="' + esc(node.id) + '" data-drag="' + esc(node.id) + '"><span class="an-label">' + esc(node.title) + '</span><span class="an-count">' + count + '</span></button>';
    h += '<span class="node-actions">';
    if (canAddChild) h += '<button class="na-btn" type="button" data-addchild="' + esc(node.id) + '" title="Add a subdeck inside this">' + ICON_ADD + '</button>';
    h += '<button class="na-btn' + (nodeDateOverride(node.id) != null ? " on" : "") + '" type="button" data-datenode="' + esc(node.id) + '" title="Set the dates shown behind the title">' + ICON_DATE + '</button>';
    h += '<button class="na-btn" type="button" data-rename="' + esc(node.id) + '" title="Rename">' + ICON_REN + '</button>';
    h += '<button class="na-btn danger" type="button" data-delnode="' + esc(node.id) + '" title="Delete">' + ICON_DEL + '</button>';
    h += '</span></div>';
    if (isBranch && expanded) nodeChildren(node).forEach((ch) => { h += adminTreeNodeHtml(ch, depth + 1); });
    return h;
  }
  function adminRenderTree() {
    const host = document.getElementById("adminTree"); if (!host) return;
    saveAdminUI();
    if (adminState.tab === "glossary") {
      // left bar on the glossary tab = tag filter: every tag with its term count; clicking one narrows the list
      const allKeys = Object.keys(window.GLOSSARY || {});
      const counts = {};
      allKeys.forEach((k) => glossTags(k).forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
      const tags = Object.keys(counts).sort((a, b) => a.localeCompare(b));
      const untagged = allKeys.filter((k) => !glossTags(k).length).length;
      if (adminState.glossTag && adminState.glossTag !== "__untagged__" && !counts[adminState.glossTag]) adminState.glossTag = null;   // stale filter (tag no longer exists)
      let h = '<div class="admin-tree-note">You are editing the <b>glossary</b> — pick a term from the list, or narrow it by tag.</div>';
      h += '<div class="admin-tag-list">';
      h += '<button class="admin-node admin-tag' + (!adminState.glossTag ? " active" : "") + '" type="button" data-gtag=""><span class="an-label">All terms</span><span class="an-count">' + allKeys.length + '</span></button>';
      tags.forEach((t) => { h += '<button class="admin-node admin-tag' + (adminState.glossTag === t ? " active" : "") + '" type="button" data-gtag="' + esc(t) + '"><span class="an-label">' + esc(t) + '</span><span class="an-count">' + counts[t] + '</span></button>'; });
      if (untagged) h += '<button class="admin-node admin-tag' + (adminState.glossTag === "__untagged__" ? " active" : "") + '" type="button" data-gtag="__untagged__" title="Terms that have no tags yet"><span class="an-label">(untagged)</span><span class="an-count">' + untagged + '</span></button>';
      h += '</div>';
      host.innerHTML = h;
      host.querySelectorAll("[data-gtag]").forEach((el) => el.addEventListener("click", () => {
        adminState.glossTag = el.dataset.gtag || null;
        adminRenderTree(); adminRenderList();
      }));
      return;
    }
    let html = '<button class="admin-node admin-node-all' + (adminState.node === null ? " active" : "") + '" type="button" data-node=""><span class="an-label">All cards</span><span class="an-count">' + everyCardId().length + '</span></button>';
    html += '<button class="admin-node admin-node-deckless' + (adminState.node === DECKLESS_ID ? " active" : "") + '" type="button" data-node="' + DECKLESS_ID + '" title="Cards that are in no deck — collected here automatically. Not shown in the library."><span class="an-label">Deckless cards</span><span class="an-count">' + decklessCardIds().length + '</span></button>';
    TREE.collections.forEach((col) => { html += adminTreeNodeHtml(col, 0); });
    html += '<button class="admin-newcol" id="adminNewCol" type="button">+ New collection</button>';
    host.innerHTML = html;
    host.querySelectorAll("[data-twisty]").forEach((el) => el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = el.dataset.twisty; adminState.expanded[id] = !adminState.expanded[id]; adminRenderTree();
    }));
    host.querySelectorAll("[data-node]").forEach((el) => el.addEventListener("click", () => {
      const nid = el.dataset.node || null;
      adminState.node = nid;
      if (nid) { const node = NODE_BY_ID[nid]; if (node && nodeIsBranch(node)) adminState.expanded[nid] = true; }
      adminRenderTree(); adminRenderList();
    }));
    const ncol = host.querySelector("#adminNewCol");
    if (ncol) ncol.addEventListener("click", () => {
      inlinePrompt("Name of the new collection:", "", (title) => {
        if (title == null || !title.trim()) return;
        const id = createNode(null, title);
        adminState.node = id;
        adminUpdateCount(); adminRenderTree(); adminRenderList(); adminRenderEditor();
        toast("Collection “" + title.trim() + "” created");
      });
    });
    host.querySelectorAll("[data-addchild]").forEach((el) => el.addEventListener("click", (e) => {
      e.stopPropagation();
      const pid = el.dataset.addchild; const p = NODE_BY_ID[pid];
      inlinePrompt("Name of the new deck inside “" + (p ? p.title : "") + "”:", "", (title) => {
        if (title == null || !title.trim()) return;
        const id = createNode(pid, title);
        adminState.expanded[pid] = true; adminState.node = id;
        adminUpdateCount(); adminRenderTree(); adminRenderList(); adminRenderEditor();
        toast("Deck “" + title.trim() + "” created");
      });
    }));
    host.querySelectorAll("[data-rename]").forEach((el) => el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = el.dataset.rename; const n = NODE_BY_ID[id]; if (!n) return;
      inlinePrompt("Rename to:", n.title, (title) => {
        if (title == null) return;
        if (!title.trim()) { toast("Name can't be empty"); return; }
        renameNode(id, title);
        adminUpdateCount(); adminRenderTree(); adminRenderList(); adminRenderEditor();
      });
    }));
    host.querySelectorAll("[data-datenode]").forEach((el) => el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = el.dataset.datenode; const n = NODE_BY_ID[id]; if (!n) return;
      const auto = (() => { const s = nodeYearSpan(n); return s ? fmtYearSpan(s.lo, s.hi) : ""; })();
      inlinePrompt(
        "Dates shown behind “" + n.title + "” in the library.\n\n" +
        "Type the text to display (e.g. 1644–1912 CE), or leave blank to use the automatic span" + (auto ? " (" + auto + ")" : "") + ".",
        nodeSpanText(n),
        (val) => {
          if (val == null) return;
          setNodeDate(id, val);
          adminUpdateCount(); adminRenderTree();
          toast(val.trim() ? "Dates set for “" + n.title + "”" : "Dates reset to automatic");
        }
      );
    }));
    host.querySelectorAll("[data-delnode]").forEach((el) => el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = el.dataset.delnode; const n = NODE_BY_ID[id]; if (!n) return;
      const cards = nodeCardCount(id);
      let msg = "Delete “" + n.title + "”?";
      if (nodeIsBranch(n)) msg += " Everything inside it is removed too.";
      if (cards) msg += " " + cards + (cards === 1 ? " card leaves" : " cards leave") + " this deck (the cards themselves are kept under All cards).";
      inlineConfirm(msg, () => {
        const wasSel = adminState.node === id;
        deleteNode(id);
        if (wasSel || (adminState.node !== DECKLESS_ID && !NODE_BY_ID[adminState.node])) adminState.node = null;   // keep the virtual Deckless node selected when an unrelated deck is removed
        adminUpdateCount(); adminRenderTree(); adminRenderList(); adminRenderEditor();
        toast("Deleted “" + n.title + "”");
      }, "Delete");
    }));
    // ----- drag & drop: drop a deck/collection onto another to nest it; onto "All cards" to promote -----
    function clearDropFx() { host.querySelectorAll(".drop-ok, .drop-top").forEach((x) => x.classList.remove("drop-ok", "drop-top")); }
    host.querySelectorAll("[data-drag]").forEach((el) => {
      el.addEventListener("dragstart", (e) => {
        _dragNodeId = el.dataset.drag;
        try { e.dataTransfer.setData("text/plain", _dragNodeId); e.dataTransfer.effectAllowed = "move"; } catch (x) {}
        el.classList.add("dragging");
      });
      el.addEventListener("dragend", () => { el.classList.remove("dragging"); _dragNodeId = null; clearDropFx(); });
      el.addEventListener("dragover", (e) => {
        if (!_dragNodeId) return;
        const target = el.dataset.node;
        if (canMoveNode(_dragNodeId, target)) { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = "move"; el.classList.add("drop-ok"); }
      });
      el.addEventListener("dragleave", () => el.classList.remove("drop-ok"));
      el.addEventListener("drop", (e) => {
        if (!_dragNodeId) return;
        const target = el.dataset.node;
        if (!canMoveNode(_dragNodeId, target)) return;
        e.preventDefault();
        const moved = _dragNodeId; _dragNodeId = null; clearDropFx();
        if (moveNode(moved, target)) {
          adminState.expanded[target] = true; adminState.node = moved;
          adminUpdateCount(); adminRenderTree(); adminRenderList(); adminRenderEditor();
          toast("Moved into “" + (NODE_BY_ID[target] ? NODE_BY_ID[target].title : "") + "”");
        }
      });
    });
    // "All cards" row promotes a dragged node to a top-level collection
    const allRow = host.querySelector(".admin-node-all");
    if (allRow) {
      allRow.addEventListener("dragover", (e) => { if (_dragNodeId && canMoveNode(_dragNodeId, null)) { e.preventDefault(); allRow.classList.add("drop-top"); } });
      allRow.addEventListener("dragleave", () => allRow.classList.remove("drop-top"));
      allRow.addEventListener("drop", (e) => {
        if (!_dragNodeId || !canMoveNode(_dragNodeId, null)) return;
        e.preventDefault();
        const moved = _dragNodeId; _dragNodeId = null; clearDropFx();
        if (moveNode(moved, null)) {
          adminState.node = moved;
          adminUpdateCount(); adminRenderTree(); adminRenderList(); adminRenderEditor();
          toast("Promoted to a top-level collection");
        }
      });
    }
  }

  // Up/Down arrow keys browse the admin edit list (cards or glossary) when not typing in a field
  function adminListKeyNav(e) {
    if ((e.key !== "ArrowDown" && e.key !== "ArrowUp") || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!document.querySelector(".admin")) return;                                              // admin page only
    const ae = document.activeElement;
    if (ae && (ae.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))) return;   // let focused fields keep their arrow keys
    if (document.querySelector(".gloss-picker,.rt-colormenu,.admin-colormenu,.gloss-bubble")) return; // a menu/picker owns the keys
    const gloss = adminState.tab === "glossary";
    const rows = [...document.querySelectorAll("#adminListItems " + (gloss ? "[data-gkey]" : "[data-open]"))];
    if (!rows.length) return;
    const key = gloss ? "gkey" : "open", cur = gloss ? adminState.glossKey : adminState.card, dir = e.key === "ArrowDown" ? 1 : -1;
    let i = rows.findIndex((r) => r.dataset[key] === cur);
    i = i < 0 ? (dir > 0 ? 0 : rows.length - 1) : Math.max(0, Math.min(rows.length - 1, i + dir));
    e.preventDefault();
    if (gloss) { adminState.glossKey = rows[i].dataset.gkey; adminRenderList(); adminRenderEditor(); }
    else { adminState.card = rows[i].dataset.open; adminRenderList(); if (adminState.preview) previewCard(adminState.card); else adminRenderEditor(); }
    const active = document.querySelector("#adminListItems .admin-card-row.active"); if (active) active.scrollIntoView({ block: "nearest" });
  }
  document.addEventListener("keydown", adminListKeyNav);

  function adminRenderList() {
    const host = document.getElementById("adminListItems"); if (!host) return;
    saveAdminUI();
    const al = document.querySelector(".admin-list"); if (al) al.classList.toggle("gloss-cols", adminState.tab === "glossary");   // two-column glossary rows only on the glossary tab
    const raw = adminState.search.trim();
    const q = raw.toLowerCase();
    if (adminState.tab === "glossary") {
      let keys = Object.keys(window.GLOSSARY || {});
      const gtag = adminState.glossTag;
      if (gtag) keys = keys.filter((k) => gtag === "__untagged__" ? !glossTags(k).length : glossTags(k).indexOf(gtag) !== -1);
      if (q) keys = keys.filter((k) => glossTitle(k).toLowerCase().includes(q) || k.toLowerCase().includes(q) || (window.GLOSSARY[k] || "").toLowerCase().includes(q) || glossTags(k).join(", ").includes(q));
      const gs = adminState.glossSort, az = (a, b) => glossTitle(a).localeCompare(glossTitle(b));
      if (gs === "za") keys.sort((a, b) => glossTitle(b).localeCompare(glossTitle(a)));
      else if (gs === "edited") keys.sort((a, b) => (glossIsEdited(b) ? 1 : 0) - (glossIsEdited(a) ? 1 : 0) || az(a, b));
      else if (gs === "date") keys.sort((a, b) => { const ya = glossStartYear(a), yb = glossStartYear(b); if (ya == null && yb == null) return az(a, b); if (ya == null) return 1; if (yb == null) return -1; return ya - yb || az(a, b); });
      else keys.sort(az);   // "az" (default)
      const gColorCount = {}; keys.forEach((k) => { const cc = glossColor(k); if (cc) gColorCount[cc] = (gColorCount[cc] || 0) + 1; });
      host.innerHTML = keys.length ? keys.map((k) => {
        const gcol = glossColor(k), colHex = COLOR_HEX[gcol] || "";
        return '<button class="admin-card-row gloss-row' + (adminState.glossKey === k ? " active" : "") + (glossIsEdited(k) ? " edited" : "") + (colHex ? " colored" : "") + '" type="button" data-gkey="' + esc(k) + '"' + (colHex ? ' style="--acr-col:' + colHex + '"' : '') + '>' + (colHex ? '<span class="acr-colortag" title="' + esc(gColorCount[gcol] + "/" + keys.length + " terms marked " + gcol) + '"></span>' : '') + '<span class="acr-title">' + esc(glossTitle(k)) + '</span><span class="acr-sub acr-tags">' + esc(glossTags(k).join(", ")) + '</span></button>';
      }).join("") : '<div class="admin-empty">No glossary terms match “' + esc(raw) + '”.</div>';
      host.querySelectorAll("[data-gkey]").forEach((el) => el.addEventListener("click", () => { adminState.glossKey = el.dataset.gkey; adminRenderList(); adminRenderEditor(); }));
      // right-click a glossary term → pick one of six admin-only colour marks (or clear)
      host.querySelectorAll("[data-gkey]").forEach((el) => el.addEventListener("contextmenu", (e) => {
        e.preventDefault(); const gk = el.dataset.gkey;
        showColorMenu(e.clientX, e.clientY, glossColor(gk), (name) => { setGlossColor(gk, name); adminUpdateCount(); adminRenderList(); });
      }));
      positionGlossDivider();
      adminSetListCount(keys.length, "term");
      return;
    }
    let ids = adminState.node === DECKLESS_ID ? decklessCardIds() : adminState.node ? subtreeCardIds(NODE_BY_ID[adminState.node]) : everyCardId();
    if (q) ids = ids.filter((id) => {
      const c = CARD_BY_ID[id]; if (!c) return false;
      return (c.answer || "").toLowerCase().includes(q) || (c.id || "").toLowerCase().includes(q) ||
        stripHtml(c.question || "").toLowerCase().includes(q) ||
        (c.hanzi || "").includes(raw) || (c.pinyin || "").toLowerCase().includes(q);
    });
    ids = adminSortIds(ids);
    const leafNode = adminState.node ? NODE_BY_ID[adminState.node] : null;
    // drag-reorder is only meaningful on a single deck shown in "Card order", unfiltered (otherwise the order is ambiguous)
    const reorderable = !!(leafNode && !nodeIsBranch(leafNode) && adminState.sort === "order" && !q);
    const colorCount = {}; ids.forEach((id) => { const cc = cardColor(id); if (cc) colorCount[cc] = (colorCount[cc] || 0) + 1; });
    host.innerHTML = ids.length ? ids.map((id) => {
      const c = CARD_BY_ID[id];
      const sel = adminState.selected.has(id);
      const col = cardColor(id), colHex = col ? COLOR_HEX[col] : "";
      return '<div class="admin-card-row' + (adminState.card === id ? " active" : "") + (cardIsEdited(id) ? " edited" : "") + (sel ? " selected" : "") + (reorderable ? " reorderable" : "") + (colHex ? " colored" : "") + '" data-card="' + esc(id) + '"' + (colHex ? ' style="--acr-col:' + colHex + '"' : '') + '>' +
        (colHex ? '<span class="acr-colortag" title="' + esc(colorCount[col] + "/" + ids.length + " cards marked " + col) + '"></span>' : '') +
        '<label class="acr-check" title="Select card"><input type="checkbox" data-check="' + esc(id) + '"' + (sel ? " checked" : "") + ' /><span class="acr-box"></span></label>' +
        '<button class="acr-open" type="button" data-open="' + esc(id) + '"><span class="acr-id">' + esc(id) + '</span><span class="acr-title">' + esc(c.answer || "(untitled)") + '</span><span class="acr-sub">' + esc(fmtYear(c)) + '</span></button>' +
        (reorderable ? '<span class="acr-grip acr-grip-r" draggable="true" title="Drag to reorder cards in this deck (the home “Chrono” order)" aria-hidden="true">⠿</span>' : '') +
        '</div>';
    }).join("") : '<div class="admin-empty">No cards match “' + esc(raw) + '”.</div>';
    host.querySelectorAll("[data-open]").forEach((el) => el.addEventListener("click", () => {
      adminState.card = el.dataset.open;
      adminRenderList();
      // stay in preview mode when one is open, so picking another card previews it too
      if (adminState.preview) previewCard(adminState.card); else adminRenderEditor();
    }));
    // right-click a card row → pick one of six admin-only colour marks (or clear)
    host.querySelectorAll(".admin-card-row").forEach((row) => row.addEventListener("contextmenu", (e) => {
      e.preventDefault(); const cid = row.dataset.card;
      showColorMenu(e.clientX, e.clientY, cardColor(cid), (name) => { setCardColor(cid, name); adminUpdateCount(); adminRenderList(); });
    }));
    // Handle selection on the LABEL (not the hidden input): a browser's forwarded click to a
    // label's control drops the Shift modifier, so Shift-range only works if we read the real click.
    host.querySelectorAll(".acr-check").forEach((label) => label.addEventListener("click", (e) => {
      e.preventDefault();   // we own the checkbox state (re-render reflects adminState.selected)
      e.stopPropagation();
      const input = label.querySelector("input[data-check]"); if (!input) return;
      const cid = input.dataset.check;
      const idx = ids.indexOf(cid);
      const lastIdx = adminState.lastSelId != null ? ids.indexOf(adminState.lastSelId) : -1;
      if (e.shiftKey && lastIdx >= 0 && idx >= 0) {
        // select the whole contiguous range from the anchor (last plain click) to here
        const a = Math.min(lastIdx, idx), b = Math.max(lastIdx, idx);
        for (let i = a; i <= b; i++) adminState.selected.add(ids[i]);
      } else {
        if (adminState.selected.has(cid)) adminState.selected.delete(cid); else adminState.selected.add(cid);
        adminState.lastSelId = cid; // a plain click (re)sets the anchor
      }
      adminRenderList();
    }));
    if (reorderable) {
      let dragId = null;
      const clearMarks = () => host.querySelectorAll(".drop-before,.drop-after").forEach((r) => r.classList.remove("drop-before", "drop-after"));
      host.querySelectorAll(".acr-grip").forEach((grip) => {
        const row = grip.closest(".admin-card-row");
        grip.addEventListener("dragstart", (e) => {
          dragId = row.dataset.card; row.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
          try { e.dataTransfer.setData("text/plain", dragId); e.dataTransfer.setDragImage(row, 14, row.offsetHeight / 2); } catch (_) {}
        });
        grip.addEventListener("dragend", () => { row.classList.remove("dragging"); clearMarks(); dragId = null; });
      });
      host.querySelectorAll(".admin-card-row").forEach((row) => {
        row.addEventListener("dragover", (e) => {
          if (dragId == null || row.dataset.card === dragId) { clearMarks(); return; }
          e.preventDefault(); e.dataTransfer.dropEffect = "move";
          const rect = row.getBoundingClientRect(), after = (e.clientY - rect.top) > rect.height / 2;
          clearMarks(); row.classList.add(after ? "drop-after" : "drop-before");
        });
        row.addEventListener("drop", (e) => {
          if (dragId == null) return;
          e.preventDefault();
          const targetId = row.dataset.card;
          if (targetId !== dragId) {
            const rect = row.getBoundingClientRect(), after = (e.clientY - rect.top) > rect.height / 2;
            const order = ids.slice();
            const from = order.indexOf(dragId); if (from >= 0) order.splice(from, 1);
            let to = order.indexOf(targetId); if (to < 0) to = order.length;
            if (after) to += 1;
            order.splice(to, 0, dragId);
            if (order.length !== ids.length || order.some((x, i) => x !== ids[i])) reorderLeafCards(adminState.node, order);   // skip no-op drags so they don't register a phantom edit
          }
          dragId = null; clearMarks(); adminRenderList(); adminUpdateCount();
        });
      });
    }
    const selAllBtn = document.getElementById("adminSelectAll");
    if (selAllBtn) { const all = ids.length && ids.every((id) => adminState.selected.has(id)); selAllBtn.textContent = all ? "Deselect all" : "Select all"; }
    const act = host.querySelector(".admin-card-row.active"); if (act) act.scrollIntoView({ block: "nearest" });
    adminSetListCount(ids.length, "card");
    adminRenderSelectionBar();
  }

  function adminRenderSelectionBar() {
    const bar = document.getElementById("adminSelBar"); if (!bar) return;
    const n = adminState.selected.size;
    if (!n || adminState.tab === "glossary") { bar.classList.remove("show"); bar.innerHTML = ""; return; }
    bar.classList.add("show");
    const opts = LEAF_NODES.slice().sort((a, b) => nodeWhere(a).localeCompare(nodeWhere(b)))
      .map((l) => '<option value="' + esc(l.id) + '">' + esc(nodeWhere(l)) + '</option>').join("");
    bar.innerHTML =
      '<span class="asb-count">' + n + (n === 1 ? " card" : " cards") + ' selected</span>' +
      '<div class="asb-actions">' +
        '<select class="asb-select" id="adminMoveTarget"><option value="">Move to deck…</option>' + opts + '</select>' +
        '<button class="asb-btn" id="adminMoveBtn" type="button">Move</button>' +
        '<button class="asb-btn danger" id="adminDelBtn" type="button">Delete</button>' +
        '<button class="asb-btn ghost" id="adminClearSel" type="button">Clear</button>' +
      '</div>';
    bar.querySelector("#adminClearSel").addEventListener("click", () => { adminState.selected.clear(); adminRenderList(); });
    bar.querySelector("#adminMoveBtn").addEventListener("click", () => {
      const target = bar.querySelector("#adminMoveTarget").value;
      if (!target) { toast("Pick a deck to move into"); return; }
      const ids = [...adminState.selected];
      ids.forEach((id) => { if (CARD_BY_ID[id]) setCardMembership(id, [target]); });
      adminState.selected.clear();
      adminUpdateCount(); adminRenderTree(); adminRenderList(); adminRenderEditor();
      toast("Moved " + ids.length + (ids.length === 1 ? " card" : " cards"));
    });
    bar.querySelector("#adminDelBtn").addEventListener("click", () => {
      const ids = [...adminState.selected];
      inlineConfirm("Delete " + ids.length + (ids.length === 1 ? " card" : " cards") + "? They are removed from every deck.", () => {
        ids.forEach((id) => { if (CARD_BY_ID[id]) deleteCard(id); });
        if (ids.includes(adminState.card)) adminState.card = null;
        adminState.selected.clear();
        adminUpdateCount(); adminRenderTree(); adminRenderList(); adminRenderEditor();
        toast("Deleted " + ids.length + (ids.length === 1 ? " card" : " cards"));
      }, "Delete");
    });
  }

  let adminPvTimer = 0;   // debounced card-preview re-render; cleared on every editor render so a pending one can't fire into a detached box
  function adminRenderEditor() {
    const host = document.getElementById("adminEditor"); if (!host) return;
    saveAdminUI();   // remember the open card/deck/tab across reloads
    closeGlossPicker();   // a term picker from a previous field can't outlive the editor it was opened from
    clearTimeout(adminPvTimer);
    adminState.preview = false; // rendering the edit form always leaves preview mode
    if (adminState.tab === "glossary") {
      const k = adminState.glossKey;
      if (!k || !window.GLOSSARY || !(k in window.GLOSSARY)) { host.innerHTML = '<div class="admin-editor-empty">Select a glossary term from the list to edit it.</div>'; return; }
      const closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
      host.innerHTML =
        '<div class="admin-ed-head"><div class="admin-ed-headinfo"><h2 class="admin-ed-title" id="adminGlossHead">' + esc(glossTitle(k)) + '</h2><div class="admin-ed-key">' + esc(k) + '</div></div>' +
        '<div class="admin-ed-actions"><span class="admin-saved" id="adminSaved"></span><button class="admin-revert" id="adminRevert" type="button"' + (glossIsEdited(k) ? "" : " hidden") + '>Revert</button><button class="admin-delete" id="adminGlossDelete" type="button">Delete term</button></div></div>' +
        '<div class="gloss-edit-cols">' +
          '<div class="gloss-edit-fields">' + rtRibbonHtml() +
            '<label class="admin-field"><span class="af-label">title</span><input class="af-input" id="adminGlossTitle" type="text" spellcheck="true" /></label>' +
            '<div class="admin-field-note">The popup heading. Leave blank to use the term key (<b>' + esc(glossKeyTitle(k)) + '</b>); the key itself never changes.</div>' +
            '<label class="admin-field"><span class="af-label">dates</span><input class="af-input" id="adminGlossDates" type="text" spellcheck="false" placeholder="e.g. c. 145–86 BCE" /></label>' +
            '<div class="admin-field-note">Optional. Shown under the title; leave blank for no date line.</div>' +
            '<div class="admin-field"><span class="af-label">description</span>' +
              '<div class="af-input af-rich af-rich-glossdesc" contenteditable="true" id="adminGlossField" data-field="glossdesc" data-rich="1" spellcheck="true"></div>' +
              '<button type="button" class="af-src-toggle" data-src-toggle="glossdesc"><span class="afs-chev">&#9656;</span> HTML source</button>' +
              '<textarea class="af-src" data-src-for="glossdesc" spellcheck="false" hidden></textarea></div>' +
            '<div class="admin-field-note">Appears in the popup. Other terms become clickable automatically — click a blue word to change or remove its link, or select text and use “Link term”.</div>' +
            '<label class="admin-field"><span class="af-label">aliases</span><input class="af-input" id="adminGlossAliases" type="text" spellcheck="false" placeholder="e.g. culture heroes, divine ancestors" /></label>' +
            '<div class="admin-field-note">Comma-separated alternative spellings in card backgrounds that open this same popup. Plural forms (e.g. dragons for dragon) are linked automatically.</div>' +
            '<label class="admin-field"><span class="af-label">tags</span><input class="af-input" id="adminGlossTags" type="text" spellcheck="false" placeholder="e.g. person, ruler, han dynasty" /></label>' +
            '<div class="admin-field-note">Comma-separated category tags, shown in the term list — the bar on the left filters by them. Aim for at least three per term.</div>' +
          '</div>' +
          '<div class="ed-resizer" id="glossPvResizer" title="Drag to resize the preview"></div>' +
          '<div class="gloss-edit-preview"><div class="gloss-preview-label">Popup preview</div>' +
            '<div class="gloss-win gloss-preview-win" id="adminGlossPreview"><div class="gloss-bar"><span class="gloss-title"></span><button class="gloss-close" type="button" tabindex="-1" aria-hidden="true">' + closeSvg + '</button></div><div class="gloss-body"><span class="gloss-dates"></span><p class="gloss-desc"></p></div></div>' +
          '</div>' +
        '</div>';
      wirePreviewDivider(host.querySelector("#glossPvResizer"), host.querySelector(".gloss-edit-preview"), "--gloss-preview-w", "glossPreviewW");
      const titleI = host.querySelector("#adminGlossTitle"), datesI = host.querySelector("#adminGlossDates"), ta = host.querySelector("#adminGlossField"), aliasesI = host.querySelector("#adminGlossAliases"), tagsI = host.querySelector("#adminGlossTags");
      const headEl = host.querySelector("#adminGlossHead"), rev = host.querySelector("#adminRevert"), pv = host.querySelector("#adminGlossPreview");
      const pvTitle = pv.querySelector(".gloss-title"), pvDates = pv.querySelector(".gloss-dates"), pvDesc = pv.querySelector(".gloss-desc");
      titleI.value = (window.GLOSSARY_TITLES && window.GLOSSARY_TITLES[k]) || "";
      datesI.value = (window.GLOSSARY_DATES && window.GLOSSARY_DATES[k]) || "";
      ta.innerHTML = window.GLOSSARY[k] || ""; richAutoLink(ta);   // show the auto gloss links in the description (clickable/editable; stripped on save)
      aliasesI.value = ((window.GLOSSARY_ALIASES && window.GLOSSARY_ALIASES[k]) || []).join(", ");
      tagsI.value = glossTags(k).join(", ");
      function renderPreview() {
        const dates = datesI.value.trim();
        let desc = fieldVal(ta); if (dates) desc = stripDupDates(desc, dates);
        pvTitle.textContent = titleI.value.trim() || glossKeyTitle(k);
        pvDates.textContent = dates; pvDates.style.display = dates ? "" : "none";
        renderGlossDesc(pvDesc, k, desc);
        setupTooltips(pvDesc);   // wire the linked terms so clicking one opens its own glossary popup
      }
      function afterEdit() {
        adminFlashSaved(); adminUpdateCount();
        const row = adminFindRow("gkey", k);
        if (row) { row.classList.toggle("edited", glossIsEdited(k)); const rt = row.querySelector(".acr-title"); if (rt) rt.textContent = glossTitle(k); const rs = row.querySelector(".acr-sub"); if (rs) rs.textContent = glossTags(k).join(", "); }
        if (rev) rev.hidden = !glossIsEdited(k);
        headEl.textContent = glossTitle(k);
        renderPreview();
      }
      titleI.addEventListener("input", () => { setGlossTitleEdit(k, titleI.value); afterEdit(); });
      datesI.addEventListener("input", () => { setGlossDateEdit(k, datesI.value); afterEdit(); });
      ta.addEventListener("input", () => { setGlossEdit(k, fieldVal(ta)); afterEdit(); });
      aliasesI.addEventListener("input", () => { setGlossAliasEdit(k, aliasesI.value); afterEdit(); });
      tagsI.addEventListener("input", () => { setGlossTagsEdit(k, tagsI.value); afterEdit(); adminRenderTree(); });   // tree = the tag filter; keep its counts current
      renderPreview();
      wireRichEditor(host);
      if (rev) rev.addEventListener("click", () => { revertGloss(k); adminUpdateCount(); adminRenderEditor(); adminRenderList(); });
      const gdel = host.querySelector("#adminGlossDelete");
      if (gdel) gdel.addEventListener("click", () => {
        inlineConfirm("Delete the glossary term “" + glossTitle(k) + "”? Its tooltip will no longer appear anywhere.", () => {
          deleteGloss(k); adminState.glossKey = null;
          adminUpdateCount(); adminRenderList(); adminRenderEditor();
          toast("Glossary term deleted");
        }, "Delete");
      });
      return;
    }
    const id = adminState.card;
    if (!id || !CARD_BY_ID[id]) { host.innerHTML = '<div class="admin-editor-empty">Select a card from the list to edit its fields, or create a new one.</div>'; return; }
    const c = CARD_BY_ID[id];
    const node = CARD_TO_NODE[id];
    const memberLeaves = new Set(cardLeaves(id).map((l) => l.id));
    // deck-picker: checkable subdecks grouped under their collection
    let deckHtml = '<div class="deck-pick"><div class="deck-pick-head">Appears in these decks / subdecks</div><div class="deck-pick-body">';
    TREE.collections.forEach((col) => {
      const leaves = LEAF_NODES.filter((l) => { let cur = l; while (cur) { if (cur.id === col.id) return true; cur = cur.parentId ? NODE_BY_ID[cur.parentId] : null; } return false; });
      if (!leaves.length) return;
      deckHtml += '<div class="deck-pick-group"><div class="dpg-title">' + esc(col.title) + '</div>';
      leaves.forEach((l) => {
        const path = nodeParentPath(l);
        deckHtml += '<label class="deck-pick-item' + (memberLeaves.has(l.id) ? " on" : "") + '"><input type="checkbox" data-leaf="' + esc(l.id) + '"' + (memberLeaves.has(l.id) ? " checked" : "") + ' /><span class="dpi-box"></span><span class="dpi-name">' + esc(l.title) + '</span>' + (path ? '<span class="dpi-path">' + esc(path) + '</span>' : "") + '</label>';
      });
      deckHtml += '</div>';
    });
    deckHtml += '</div></div>';

    const fieldsHtml = EDITOR_FIELDS.map((f) => {
      if (EDITOR_LONG[f.key]) {   // rich fields → WYSIWYG contenteditable that renders like the card
        const sp = (f.key === "abstract" || f.key === "question") ? "true" : "false";
        return '<div class="admin-field"><span class="af-label">' + esc(f.label) + '</span>' +
          '<div class="af-input af-rich af-rich-' + f.key + '" contenteditable="true" data-field="' + f.key + '" data-rich="1" spellcheck="' + sp + '"></div>' +
          '<button type="button" class="af-src-toggle" data-src-toggle="' + f.key + '"><span class="afs-chev">&#9656;</span> HTML source</button>' +
          '<textarea class="af-src" data-src-for="' + f.key + '" spellcheck="false" hidden></textarea></div>';
      }
      return '<label class="admin-field"><span class="af-label">' + esc(f.label) + '</span>' +
        '<input class="af-input" data-field="' + f.key + '" type="text" spellcheck="false" /></label>';
    }).join("");
    const autoYear = (() => { const y = cardYears(c); return y.length ? Math.min(...y) : null; })();
    const chronoHtml = '<label class="admin-field"><span class="af-label">chronology</span><input class="af-input" id="adminChrono" type="text" spellcheck="false" placeholder="' + esc("auto: " + (chronoLabel(autoYear) || "—")) + '" /></label>' +
      '<div class="admin-field-note">Sort / timeline year — overrides the date above for ordering. e.g. <b>200 BCE</b>, <b>618</b>, <b>1644</b>. Leave blank to use the automatic value, or type <b>none</b> for no year (kept out of the timeline).</div>';
    const whereTxt = node ? nodeWhere(node) : (memberLeaves.size ? "" : "no deck");
    host.innerHTML =
      '<div class="admin-ed-head"><div class="admin-ed-headinfo"><h2 class="admin-ed-title">' + esc(c.answer || "(untitled)") + '</h2><div class="admin-ed-key">' + esc(id) + (whereTxt ? ' &middot; ' + esc(whereTxt) : "") + '</div></div>' +
      '<div class="admin-ed-actions"><span class="admin-saved" id="adminSaved"></span><button class="admin-preview" id="adminPreview" type="button">Preview</button><button class="admin-revert" id="adminRevert" type="button"' + (cardIsEdited(id) ? "" : " hidden") + '>Revert card</button><button class="admin-delete" id="adminDelete" type="button">Delete card</button></div></div>' +
      '<div class="card-edit-cols">' +
        '<div class="card-edit-fields">' + rtRibbonHtml() + deckHtml +
          '<div class="admin-fields"><label class="admin-field"><span class="af-label">id</span><input class="af-input af-readonly" type="text" value="' + esc(id) + '" readonly /></label>' + chronoHtml + fieldsHtml + '</div>' +
        '</div>' +
        '<div class="ed-resizer" id="cardPvResizer" title="Drag to resize the preview"></div>' +
        '<div class="card-edit-preview"><div class="gloss-preview-label">Card preview</div><div class="admin-card-pvbox" id="adminCardPreview"></div></div>' +
      '</div>';
    wirePreviewDivider(host.querySelector("#cardPvResizer"), host.querySelector(".card-edit-preview"), "--card-preview-w", "cardPreviewW");
    // load each field's value: innerHTML for the WYSIWYG fields, .value for inputs
    EDITOR_FIELDS.forEach((f) => { const el = host.querySelector('[data-field="' + f.key + '"]'); if (!el) return; const v = c[f.key] == null ? "" : String(c[f.key]); if (el.dataset.rich) { el.innerHTML = v; if (f.key === "abstract") autoLinkGlossary(el, c.answer, glossOffList(c.id)); } else el.value = v; });   // show the auto gloss links in the background so they can be clicked/edited (stripped on save)
    const chronoI = host.querySelector("#adminChrono");
    if (chronoI) {
      const ov = (ADMIN_EDITS.chrono && id in ADMIN_EDITS.chrono) ? ADMIN_EDITS.chrono[id] : null;
      chronoI.value = ov == null ? "" : chronoLabel(ov);
      chronoI.addEventListener("input", () => {
        setCardChrono(id, chronoI.value);
        adminFlashSaved(); adminUpdateCount();
        const row = adminFindRow("card", id); if (row) { const rs = row.querySelector(".acr-sub"); if (rs) rs.textContent = fmtYear(c); }
      });
    }
    const pvBox = host.querySelector("#adminCardPreview");
    const refreshPreview = () => { clearTimeout(adminPvTimer); adminPvTimer = setTimeout(() => renderCardPreviewInto(pvBox, c), 160); };   // debounce the re-render
    renderCardPreviewInto(pvBox, c);
    host.querySelectorAll("[data-field]").forEach((el) => el.addEventListener("input", () => {
      const f = el.dataset.field;
      setCardEdit(id, f, fieldVal(el));
      adminFlashSaved(); adminUpdateCount(); refreshPreview();
      if (f === "answer") {
        const t = host.querySelector(".admin-ed-title"); if (t) t.textContent = el.value || "(untitled)";
        const row = adminFindRow("card", id); if (row) { const rt = row.querySelector(".acr-title"); if (rt) rt.textContent = el.value || "(untitled)"; }
      }
      if (f === "answerDate") { const row = adminFindRow("card", id); if (row) { const rs = row.querySelector(".acr-sub"); if (rs) rs.textContent = fmtYear(c); } }
      const row = adminFindRow("card", id); if (row) row.classList.toggle("edited", cardIsEdited(id));
      const rev = host.querySelector("#adminRevert"); if (rev) rev.hidden = !cardIsEdited(id);
    }));
    wireRichEditor(host);
    // deck-picker toggles
    host.querySelectorAll("[data-leaf]").forEach((el) => el.addEventListener("change", () => {
      const leaves = [...host.querySelectorAll("[data-leaf]")].filter((x) => x.checked).map((x) => x.dataset.leaf);
      setCardMembership(id, leaves);
      adminUpdateCount();
      const item = el.closest(".deck-pick-item"); if (item) item.classList.toggle("on", el.checked);
      const node2 = CARD_TO_NODE[id];
      const key = host.querySelector(".admin-ed-key");
      if (key) { const w = node2 ? nodeWhere(node2) : (leaves.length ? "" : "no deck"); key.innerHTML = esc(id) + (w ? " &middot; " + esc(w) : ""); }
      adminRenderTree();
    }));
    const rev = host.querySelector("#adminRevert");
    if (rev) rev.addEventListener("click", () => { revertCard(id); adminUpdateCount(); adminRenderEditor(); adminRenderList(); });
    const del = host.querySelector("#adminDelete");
    if (del) del.addEventListener("click", () => {
      inlineConfirm("Delete this card? It is removed from every deck.", () => {
        deleteCard(id); adminState.card = null; adminState.selected.delete(id);
        adminUpdateCount(); adminRenderTree(); adminRenderList(); adminRenderEditor();
        toast("Card deleted");
      }, "Delete");
    });
    const pv = host.querySelector("#adminPreview");
    if (pv) pv.addEventListener("click", () => previewCard(id));
  }

  // Render a card exactly as it appears on the study page; any grade button returns to its editor.
  // In-pane card preview: renders into the editor column so the tree and card list
  // stay visible — pick another card from the list and it previews that one.
  function previewCard(id) {
    const c = CARD_BY_ID[id]; if (!c) return;
    const host = document.getElementById("adminEditor"); if (!host) return;
    adminState.preview = true; adminState.card = id;
    closeAllGloss();
    hideGradeBar();
    let revealed = false;
    function back() { detachKeys(); adminRenderEditor(); }
    host.innerHTML =
      '<div class="admin-pv">' +
        '<div class="admin-pv-bar">' +
          '<button class="backbtn" id="pvExit"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Back to editor</button>' +
          '<span class="admin-pv-where">Preview · ' + esc(c.answer || "(untitled)") + '</span>' +
        '</div>' +
        '<div class="study-card admin-pv-card">' +
          '<span class="label">Question</span>' +
          '<div class="question">' + (c.question || '<em style="color:var(--ink-faint)">(no question)</em>') + '</div>' +
          '<div class="reveal" id="reveal"><div class="reveal-inner" id="revealInner"></div></div>' +
        '</div>' +
        '<div class="actions" id="actions"></div>' +
      '</div>';
    const cardRoot = host.querySelector(".study-card");
    openLinks(cardRoot);
    setupCloze(cardRoot.querySelector(".question"));
    host.querySelector("#pvExit").addEventListener("click", back);
    const actions = host.querySelector("#actions");
    actions.innerHTML = '<div class="reveal-cta"><button class="btn" id="reveal-btn">Reveal answer</button></div>';
    function showAnswer() {
      if (revealed) return; revealed = true;
      gradeCloze(cardRoot.querySelector(".question"), c.answer);
      const inner = host.querySelector("#revealInner");
      inner.innerHTML = buildBack(c);
      openLinks(inner); processAbstract(inner, c); setupTooltips(inner);
      const bgHead = inner.querySelector(".bg-head"), bgToggle = inner.querySelector(".bg-toggle"), bgCollapse = inner.querySelector(".bg-collapse");
      if (bgHead && bgCollapse) bgHead.addEventListener("click", () => { const col = bgCollapse.classList.toggle("collapsed"); if (bgToggle) bgToggle.classList.toggle("collapsed", col); bgHead.setAttribute("aria-expanded", col ? "false" : "true"); });
      const trToggle = inner.querySelector(".tr-toggle"), answerTr = inner.querySelector(".answer-tr");
      if (trToggle && answerTr) trToggle.addEventListener("click", () => { const col = answerTr.classList.toggle("collapsed"); trToggle.setAttribute("aria-expanded", col ? "false" : "true"); });
      inner.querySelectorAll(".tr-play").forEach((btn) => btn.addEventListener("click", () => speak(btn.dataset.say, btn)));
      wireTTS(inner, c);
      host.querySelector("#reveal").classList.add("show");
      const p = preview(id);
      // grades render inline in the pane (preview only — nothing is scheduled)
      actions.innerHTML =
        '<div class="grade-wrap admin-pv-grades">' +
          '<button class="grade-help" type="button" aria-label="What do these buttons do?">?<span class="grade-help-bubble"><span class="ghb-title">Preview mode</span><span class="ghb-row"><b>Any grade</b>returns you to the card editor — nothing is scheduled.</span></span></button>' +
          '<div class="grades">' +
            '<button class="grade again" data-g="again"><span class="gl">Again</span><span class="gi">' + fmtInterval(p.again) + '</span><span class="gk">1</span></button>' +
            '<button class="grade hard" data-g="hard"><span class="gl">Hard</span><span class="gi">' + fmtInterval(p.hard) + '</span><span class="gk">2</span></button>' +
            '<button class="grade good" data-g="good"><span class="gl">Good</span><span class="gi">' + fmtInterval(p.good) + '</span><span class="gk">3</span></button>' +
            '<button class="grade easy" data-g="easy"><span class="gl">Easy</span><span class="gi">' + fmtInterval(p.easy) + '</span><span class="gk">4</span></button>' +
          '</div>' +
        '</div>';
      actions.querySelectorAll(".grade").forEach((b) => b.addEventListener("click", back));
    }
    host.querySelector("#reveal-btn").addEventListener("click", showAnswer);
    cardRoot._keys = function (e) {
      const el = document.activeElement, tag = (el && el.tagName) || "";
      const clozeFocused = el && el.classList && el.classList.contains("blank-input");
      // allow Enter to reveal even while typing in the cloze field, but otherwise don't hijack typing
      if (!revealed && e.key === "Enter") { e.preventDefault(); showAnswer(); return; }
      if ((tag === "INPUT" || tag === "TEXTAREA") && !clozeFocused) return;
      if (clozeFocused) return; // let the cloze field receive other keys (space, letters, …)
      if (!revealed && e.key === " ") { e.preventDefault(); showAnswer(); }
      else if (revealed && ["1", "2", "3", "4"].includes(e.key)) { e.preventDefault(); back(); }
      else if (e.key === "Escape") { e.preventDefault(); back(); }
    };
    attachKeys(cardRoot._keys);
  }

  /* ============================================================
     TIMELINE MAPS — trace a world-map PNG into vector border eras
     ============================================================ */
  let atlasPendingYear = null;   // set by "View on globe" so the Atlas opens at a chosen era's year instead of the present
  let atlasEditEraId = null;     // set by "Edit on globe" → the Atlas opens in map-edit mode for this era
  let tlObjUrl = null;           // object URL of the map image being traced — module-level so it's revoked across editor re-renders

  // parse a year field: "1500" / "1500 CE" → 1500 ; "500 BCE" / "-500" → -500
  function parseEraYear(s) {
    s = String(s == null ? "" : s).trim(); if (!s) return null;
    let m = /^-?\d+/.exec(s.replace(/[,\s]/g, ""));   // tolerate spaces + thousands separators ("12,000 BCE")
    if (!m) return null;
    let y = parseInt(m[0], 10); if (isNaN(y)) return null;
    if (/bc/i.test(s) && y > 0) y = -y;               // "BC" / "BCE", with or without a space before it
    if (y === 0) y = 1;
    return Math.max(-1000, Math.min(new Date().getFullYear(), y));
  }
  function eraYearLabel(y) { return y < 0 ? (-y + " BCE") : (y + " CE"); }
  function newEraId() { return "era_" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
  function eraPointCount(era) { let n = 0; (era.geo || []).forEach((t) => (t.p || []).forEach((r) => { n += r.length; })); return n; }

  // persist the working set of eras into the admin overlay (so it survives reloads until "Save to project" commits timeline.js)
  function persistTimeline() {
    const prev = ADMIN_EDITS.timeline;
    ADMIN_EDITS.timeline = (window.TIMELINE || []).slice();
    try { localStorage.setItem(ADMIN_KEY, JSON.stringify(ADMIN_EDITS)); autoSaveWrite(); return true; }
    catch (e) { ADMIN_EDITS.timeline = prev; autoSaveWrite(); toast("These eras are too large for browser storage — use “Save to project” now to write timeline.js, or they'll be lost on reload."); return false; }
  }
  function serializeTimeline() {
    return "/* Historical border eras for the Atlas globe timeline (Edit → Timeline). Traced from world-map PNGs.\n" +
      "   Per-era: { id, year, n:label, geo:[ { n, col, p:[ [ [lon,lat],... ] rings ] } ] }. Built in-app; do not hand-edit geometry. */\n" +
      "window.TIMELINE = " + JSON.stringify(window.TIMELINE || []) + ";\n";
  }

  // ---- Douglas–Peucker simplification of a pixel-space ring ----
  function dpSimplify(pts, eps) {
    if (pts.length < 4) return pts.slice();
    const keep = new Uint8Array(pts.length); keep[0] = 1; keep[pts.length - 1] = 1;
    const stack = [[0, pts.length - 1]];
    while (stack.length) {
      const seg = stack.pop(), a = seg[0], b = seg[1];
      const ax = pts[a][0], ay = pts[a][1], bx = pts[b][0], by = pts[b][1], dx = bx - ax, dy = by - ay;
      const len = Math.hypot(dx, dy) || 1; let md = -1, mi = -1;
      for (let i = a + 1; i < b; i++) { const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len; if (d > md) { md = d; mi = i; } }
      if (md > eps && mi > a) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
    }
    const out = []; for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]); return out;
  }
  // simplify a CLOSED ring (open form, no repeated last point): anchor at p0 + the farthest point so the base segment isn't degenerate
  function simplifyClosed(pts, eps) {
    const n = pts.length; if (n < 5) return pts.slice();
    let far = 1, fd = -1;
    for (let i = 1; i < n; i++) { const dx = pts[i][0] - pts[0][0], dy = pts[i][1] - pts[0][1], d = dx * dx + dy * dy; if (d > fd) { fd = d; far = i; } }
    const a = dpSimplify(pts.slice(0, far + 1), eps), b = dpSimplify(pts.slice(far).concat([pts[0]]), eps);
    return a.concat(b.slice(1, -1));
  }
  // ---- trace every closed boundary loop of the pixels labelled `key` (pixel-grid edge following → watertight loops) ----
  function traceColorContours(lab, W, H, key, eps) {
    const is1 = (x, y) => (x >= 0 && x < W && y >= 0 && y < H && lab[y * W + x] === key);
    const Kp = (x, y) => x * 100003 + y;   // unique key for a grid corner point (x in [0,W], y in [0,H])
    const edges = [], startIdx = new Map();
    const add = (x1, y1, x2, y2) => { const id = edges.length; edges.push([x1, y1, x2, y2, false]); const k = Kp(x1, y1); let a = startIdx.get(k); if (!a) { a = []; startIdx.set(k, a); } a.push(id); };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!is1(x, y)) continue;                       // boundary edges oriented so the loop closes consistently
      if (!is1(x - 1, y)) add(x, y + 1, x, y);        // left edge → up
      if (!is1(x + 1, y)) add(x + 1, y, x + 1, y + 1); // right edge → down
      if (!is1(x, y - 1)) add(x, y, x + 1, y);         // top edge → right
      if (!is1(x, y + 1)) add(x + 1, y + 1, x, y + 1); // bottom edge → left
    }
    const loops = [];
    for (let s = 0; s < edges.length; s++) {
      if (edges[s][4]) continue;
      const loop = []; let id = s, guard = 0;
      while (id != null && !edges[id][4] && guard++ < edges.length + 4) {
        const e = edges[id]; e[4] = true; loop.push([e[0], e[1]]);
        const cand = startIdx.get(Kp(e[2], e[3])); let nid = null;
        if (cand) for (let c = 0; c < cand.length; c++) if (!edges[cand[c]][4]) { nid = cand[c]; break; }
        id = nid;
      }
      if (loop.length >= 4) loops.push(simplifyClosed(loop, eps));
    }
    return loops;
  }
  // ---- main: equirectangular (2:1) political-map PNG → geo [{n, col, p:[rings of [lon,lat]]}] ----
  function traceMapToGeo(img, opts) {
    opts = opts || {};
    const latTop = opts.latTop != null ? opts.latTop : 90, latBottom = opts.latBottom != null ? opts.latBottom : -90;
    const lonLeft = opts.lonLeft != null ? opts.lonLeft : -180, lonRight = opts.lonRight != null ? opts.lonRight : 180;
    const latSpan = latTop - latBottom, lonSpan = lonRight - lonLeft;
    const TW = opts.width || 1024, TH = Math.max(2, Math.round(TW * latSpan / lonSpan));   // match the map's geographic aspect (handles maps cropped at the poles, wider than 2:1)
    const cv = document.createElement("canvas"); cv.width = TW; cv.height = TH;
    const g = cv.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0, TW, TH);                    // stretch the image onto the lon/lat sampling grid
    const data = g.getImageData(0, 0, TW, TH).data, N = TW * TH;
    const tol = opts.colorTol || 28, q = (v) => Math.min(255, Math.round(v / tol) * tol);
    const OCEAN = -1, LINE = -2;
    const key = new Int32Array(N);
    for (let i = 0; i < N; i++) {
      const a = data[i * 4 + 3], r = data[i * 4], gg = data[i * 4 + 1], b = data[i * 4 + 2];
      if (a < 100) { key[i] = OCEAN; }                 // transparent → ocean
      else if (r + gg + b < 90) { key[i] = LINE; }     // near-black → a drawn border line
      else if (r > 242 && gg > 242 && b > 235) { key[i] = LINE; }   // near-white → label/text overlay; grow the territory over it
      else key[i] = (q(r) << 16) | (q(gg) << 8) | q(b);
    }
    // dilate the LINE mask (border lines + label text) a few px into adjacent fills, so the anti-alias halo around them is
    // absorbed into LINE (and later grown over) instead of surviving as its own sliver "territories"
    const dil = opts.dilate != null ? opts.dilate : 2;
    for (let d = 0; d < dil; d++) {
      const mark = [];
      for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) { const i = y * TW + x; if (key[i] < 0) continue;
        if ((x > 0 && key[i - 1] === LINE) || (x < TW - 1 && key[i + 1] === LINE) || (y > 0 && key[i - TW] === LINE) || (y < TH - 1 && key[i + TW] === LINE)) mark.push(i);
      }
      if (!mark.length) break;
      for (let m = 0; m < mark.length; m++) key[mark[m]] = LINE;
    }
    // ocean = flood-fill from the frame edges across the quantized sea shades (downscaled oceans have many blue tints):
    // follow a small colour step while staying within a wide band of the sea colour; stop at coastline outlines (LINE).
    // A land-locked same-colour country isn't reached. Seed only edge pixels near the dominant edge sea colour.
    const edgeHist = {}, eb = (i) => { const k = key[i]; if (k >= 0) edgeHist[k] = (edgeHist[k] || 0) + 1; };
    for (let x = 0; x < TW; x++) { eb(x); eb((TH - 1) * TW + x); }
    for (let y = 0; y < TH; y++) { eb(y * TW); eb(y * TW + TW - 1); }
    let seedK = -1, seedN = -1; for (const k in edgeHist) if (edgeHist[k] > seedN) { seedN = edgeHist[k]; seedK = +k; }
    if (opts.oceanKey != null) seedK = opts.oceanKey;
    const ocean = new Uint8Array(N);
    if (seedK >= 0) {
      const sr = (seedK >> 16) & 255, sg = (seedK >> 8) & 255, sb = seedK & 255, SEED2 = 95 * 95, STEP2 = 60 * 60, BAND2 = 215 * 215;
      const near = (k, r0, g0, b0, t2) => { const dr = ((k >> 16) & 255) - r0, dg = ((k >> 8) & 255) - g0, db = (k & 255) - b0; return dr * dr + dg * dg + db * db <= t2; };
      const stack = [];
      const seed = (i) => { if (ocean[i]) return; const k = key[i]; if (k === OCEAN || (k >= 0 && near(k, sr, sg, sb, SEED2))) { ocean[i] = 1; stack.push(i); } };
      for (let x = 0; x < TW; x++) { seed(x); seed((TH - 1) * TW + x); }
      for (let y = 0; y < TH; y++) { seed(y * TW); seed(y * TW + TW - 1); }
      while (stack.length) {
        const i = stack.pop(), ck = key[i], x = i % TW, y = (i / TW) | 0;
        const cr = ck >= 0 ? (ck >> 16) & 255 : sr, cg = ck >= 0 ? (ck >> 8) & 255 : sg, cb = ck >= 0 ? ck & 255 : sb;
        const nb = []; if (x > 0) nb.push(i - 1); if (x < TW - 1) nb.push(i + 1); if (y > 0) nb.push(i - TW); if (y < TH - 1) nb.push(i + TW);
        for (let n = 0; n < nb.length; n++) { const j = nb[n]; if (ocean[j]) continue; const k = key[j];
          if (k === OCEAN) { ocean[j] = 1; stack.push(j); }
          else if (k >= 0 && near(k, cr, cg, cb, STEP2) && near(k, sr, sg, sb, BAND2)) { ocean[j] = 1; stack.push(j); }   // step across sea shades, within a band of the sea colour
        }
      }
    }
    // land palette: dominant colours among the NON-ocean pixels (so no sea shade can become a territory)
    const hist = {};
    for (let i = 0; i < N; i++) { if (ocean[i]) continue; const k = key[i]; if (k >= 0) hist[k] = (hist[k] || 0) + 1; }
    const minArea = opts.minArea || Math.max(24, Math.round(N / 6000));
    const palette = [];
    for (const k in hist) if (hist[k] >= minArea) { const n = +k; palette.push({ k: n, r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }); }
    if (!palette.length) return [];
    const snapCache = {};
    const snapKey = (qk) => { if (qk in snapCache) return snapCache[qk]; const r = (qk >> 16) & 255, gg = (qk >> 8) & 255, b = qk & 255; let best = palette[0].k, bd = 1e12; for (let p = 0; p < palette.length; p++) { const o = palette[p], dr = r - o.r, dg = gg - o.g, db = b - o.b, d = dr * dr + dg * dg + db * db; if (d < bd) { bd = d; best = o.k; } } return (snapCache[qk] = best); };
    // labels: ocean → OCEAN; lines/labels → LINE (grown over); else snap to nearest land palette colour (absorbs anti-alias halos)
    const lab = new Int32Array(N);
    for (let i = 0; i < N; i++) { if (ocean[i]) { lab[i] = OCEAN; continue; } const k = key[i]; if (k === LINE) lab[i] = LINE; else if (k === OCEAN) lab[i] = OCEAN; else lab[i] = snapKey(k); }
    // grow territories over the LINE pixels (borders + labels) into a separate buffer each pass (no directional bleed), 4-connected and never wrapping across a row
    const grow = new Int32Array(N);
    for (let pass = 0; pass < 80; pass++) {
      grow.set(lab); let changed = 0;
      for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) { const i = y * TW + x; if (lab[i] !== LINE) continue;
        let v = -3;
        if (x > 0 && lab[i - 1] >= 0) v = lab[i - 1];
        else if (x < TW - 1 && lab[i + 1] >= 0) v = lab[i + 1];
        else if (y > 0 && lab[i - TW] >= 0) v = lab[i - TW];
        else if (y < TH - 1 && lab[i + TW] >= 0) v = lab[i + TW];
        if (v >= 0) { grow[i] = v; changed++; }
      }
      if (!changed) break; lab.set(grow);
    }
    for (let i = 0; i < N; i++) if (lab[i] === LINE) lab[i] = OCEAN;
    // trace each palette territory (not the ocean) → rings → lon/lat
    const eps = opts.epsilon != null ? opts.epsilon : 1.3, hx = (n) => (n & 255).toString(16).padStart(2, "0"), geo = [];
    for (let t = 0; t < palette.length; t++) {
      const tk = palette[t].k;
      const rings = traceColorContours(lab, TW, TH, tk, eps);
      const p = []; for (let r = 0; r < rings.length; r++) {
        if (rings[r].length < 3) continue;
        p.push(rings[r].map((pt) => [+(lonLeft + (pt[0] / TW) * lonSpan).toFixed(2), +(latTop - (pt[1] / TH) * latSpan).toFixed(2)]));
      }
      if (!p.length) continue;
      geo.push({ n: "", col: "#" + hx(tk >> 16) + hx(tk >> 8) + hx(tk), p: p });
    }
    return geo;
  }

  PAGES.admin = function (root, params) {
    if (params && params.card && CARD_BY_ID[params.card]) {
      adminState.tab = "cards";
      adminState.card = params.card;
      adminState.search = "";
      const n = CARD_TO_NODE[params.card];
      adminState.node = n ? n.id : null;
      if (n) { let cur = n; while (cur) { adminState.expanded[cur.id] = true; cur = cur.parentId ? NODE_BY_ID[cur.parentId] : null; } }
    }
    if (params && params.gloss) { adminState.tab = "glossary"; adminState.glossKey = params.gloss; adminState.search = ""; }   // deep-link to a glossary term's editor (from the gloss popup's edit button)
    if (params && params.tab) adminState.tab = params.tab;
    // drop a restored selection that no longer exists (a card/deck/term may have been deleted since the last session)
    if (adminState.card && !CARD_BY_ID[adminState.card]) adminState.card = null;
    if (adminState.node && adminState.node !== DECKLESS_ID && !NODE_BY_ID[adminState.node]) adminState.node = null;
    if (adminState.glossKey && window.GLOSSARY && !(adminState.glossKey in window.GLOSSARY)) adminState.glossKey = null;

    root.innerHTML =
      '<div class="admin">' +
        '<aside class="admin-side' + (adminState.treeCollapsed ? " collapsed" : "") + '" id="adminSide">' +
          '<div class="admin-tabs">' +
            '<button class="admin-tab" type="button" data-atab="cards">Cards</button>' +
            '<button class="admin-tab" type="button" data-atab="glossary">Glossary</button>' +
            '<button class="admin-tab" type="button" data-atab="timeline">Timeline</button>' +
            '<button class="admin-tab" type="button" data-atab="accounts">Accounts</button>' +
          '</div>' +
          '<div class="admin-tree" id="adminTree"></div>' +
          '<div class="admin-side-foot"><span class="admin-edit-count" id="adminEditCount"></span><button class="admin-autosave" id="adminAutosave" type="button" title="Automatically write every edit into the project files (Chrome, served over http://localhost). Click to turn on / off.">Auto-save: off</button><button class="admin-export" id="adminExport" type="button" title="Write data.js + glossary.js in the project folder">Save to project</button></div>' +
        '</aside>' +
        '<button class="admin-collapse" id="adminCollapse" type="button" aria-label="Collapse the sidebar"></button>' +
        '<div class="admin-resizer" data-rs="side" title="Drag to resize the decks panel"></div>' +
        '<section class="admin-list">' +
          '<div class="admin-search"><svg class="as-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><input id="adminSearch" type="search" autocomplete="off" /></div>' +
          '<div class="admin-list-tools">' +
            '<div class="admin-list-count" id="adminListCount"></div>' +
            '<div class="alt-right">' +
              '<button class="admin-new ghost" id="adminSelectAll" type="button" title="Select every card in the list (Shift-click a checkbox to select a range)">Select all</button>' +
              '<button class="admin-new" id="adminNew" type="button" title="Create a new blank card">+ New card</button>' +
              '<label class="admin-sort"><span>Sort</span><select id="adminSort">' +
                '<option value="order">Card order</option>' +
                '<option value="name">Name (A–Z)</option>' +
                '<option value="added">Date added</option>' +
                '<option value="modified">Date modified</option>' +
                '<option value="chronological">Chronological</option>' +
              '</select></label>' +
            '</div>' +
            '<div class="alt-right alt-right-gloss" style="display:none">' +
              '<label class="admin-sort"><span>Sort</span><select id="adminGlossSort">' +
                '<option value="az">Name (A–Z)</option>' +
                '<option value="za">Name (Z–A)</option>' +
                '<option value="edited">Edited first</option>' +
                '<option value="date">By date</option>' +
              '</select></label>' +
            '</div>' +
          '</div>' +
          '<div class="admin-sel-bar" id="adminSelBar"></div>' +
          '<div class="admin-list-items" id="adminListItems"></div>' +
          '<div class="gloss-col-divider" id="glossColDivider"><span class="gcd-grip" title="Drag to resize the title column"></span></div>' +
        '</section>' +
        '<div class="admin-resizer" data-rs="list" title="Drag to resize the list panel"></div>' +
        '<section class="admin-editor" id="adminEditor"></section>' +
      '</div>';

    const collapseBtn = root.querySelector("#adminCollapse");
    collapseBtn.classList.toggle("on", adminState.treeCollapsed);
    collapseBtn.addEventListener("click", () => {
      adminState.treeCollapsed = !adminState.treeCollapsed;
      root.querySelector("#adminSide").classList.toggle("collapsed", adminState.treeCollapsed);
      collapseBtn.classList.toggle("on", adminState.treeCollapsed);
    });
    root.querySelector("#adminExport").addEventListener("click", adminExport);
    root.querySelector("#adminAutosave").addEventListener("click", toggleAutoSave);
    initAutoSave();   // restore the auto-save state (armed if the folder handle + permission are still live, else "reconnect")

    // ---- draggable dividers: resize the side / list panels and the glossary title column (persisted) ----
    const adminEl = root.querySelector(".admin");
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const lay = loadAdminLayout();
    if (lay.side) adminEl.style.setProperty("--side-w", lay.side + "px");
    if (lay.list) adminEl.style.setProperty("--list-w", lay.list + "px");
    if (lay.glossCol) adminEl.style.setProperty("--gloss-col", lay.glossCol + "px");
    if (lay.cardPreviewW) adminEl.style.setProperty("--card-preview-w", lay.cardPreviewW + "px");
    if (lay.glossPreviewW) adminEl.style.setProperty("--gloss-preview-w", lay.glossPreviewW + "px");
    // teardown that also fires on pointercancel (touch-scroll / gesture takeover) so the document listeners never leak
    function dragSession(onMove, onEnd) {
      const up = () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", up); onEnd(); };
      document.addEventListener("pointermove", onMove); document.addEventListener("pointerup", up); document.addEventListener("pointercancel", up);
    }
    root.querySelectorAll(".admin-resizer").forEach((rz) => {
      const which = rz.dataset.rs, panel = root.querySelector(which === "side" ? ".admin-side" : ".admin-list"), cssVar = which === "side" ? "--side-w" : "--list-w";
      rz.addEventListener("pointerdown", (e) => {
        if (which === "side" && panel.classList.contains("collapsed")) return;   // don't resize a collapsed sidebar
        const sx = e.clientX, sw = panel.offsetWidth; rz.classList.add("dragging");
        dragSession(
          (ev) => { adminEl.style.setProperty(cssVar, clamp(sw + (ev.clientX - sx), 150, 680) + "px"); if (which === "list") positionGlossDivider(); },
          () => { rz.classList.remove("dragging"); const o = loadAdminLayout(); o[which] = panel.offsetWidth; saveAdminLayout(o); }
        );
        e.preventDefault();
      });
    });
    const glossGrip = root.querySelector("#glossColDivider .gcd-grip");
    if (glossGrip) glossGrip.addEventListener("pointerdown", (e) => {
      const row = adminEl.querySelector(".gloss-row"); if (!row) return;
      const colLeft = row.firstElementChild.getBoundingClientRect().left; glossGrip.classList.add("dragging");
      dragSession(
        (ev) => { adminEl.style.setProperty("--gloss-col", clamp(ev.clientX - colLeft, 70, 380) + "px"); positionGlossDivider(); },
        () => { glossGrip.classList.remove("dragging"); const o = loadAdminLayout(); o.glossCol = Math.round(parseFloat(getComputedStyle(adminEl).getPropertyValue("--gloss-col")) || 150); saveAdminLayout(o); }
      );
      e.preventDefault();
    });

    const search = root.querySelector("#adminSearch");
    search.value = adminState.search;
    search.addEventListener("input", () => { adminState.search = search.value; adminRenderList(); });

    const sortSel = root.querySelector("#adminSort");
    if (sortSel) { sortSel.value = adminState.sort; sortSel.addEventListener("change", () => { adminState.sort = sortSel.value; adminRenderList(); }); }
    const gsortSel = root.querySelector("#adminGlossSort");
    if (gsortSel) { gsortSel.value = adminState.glossSort; gsortSel.addEventListener("change", () => { adminState.glossSort = gsortSel.value; adminRenderList(); }); }
    const selAllBtn = root.querySelector("#adminSelectAll");
    if (selAllBtn) selAllBtn.addEventListener("click", () => {
      const checks = [...root.querySelectorAll("#adminListItems [data-check]")];
      if (!checks.length) return;
      const allSel = checks.every((c) => adminState.selected.has(c.dataset.check));
      checks.forEach((c) => { if (allSel) adminState.selected.delete(c.dataset.check); else adminState.selected.add(c.dataset.check); });
      adminRenderList();
    });
    const newBtn = root.querySelector("#adminNew");
    if (newBtn) newBtn.addEventListener("click", () => {
      const into = adminState.node && NODE_BY_ID[adminState.node] && !nodeIsBranch(NODE_BY_ID[adminState.node]) ? adminState.node : null;
      const id = createCard(into);
      adminState.card = id; adminState.sort = "order"; if (sortSel) sortSel.value = "order";
      adminUpdateCount(); adminRenderTree(); adminRenderList(); adminRenderEditor();
      const fld = root.querySelector('#adminEditor [data-field="answer"]'); if (fld) fld.focus();
      toast("New card created" + (into ? " in " + nodeWhere(NODE_BY_ID[into]) : ""));
    });

    root.querySelectorAll(".admin-tab").forEach((t) => t.addEventListener("click", () => {
      if (adminState.tab === t.dataset.atab) return;
      adminState.tab = t.dataset.atab;
      adminState.search = ""; search.value = "";
      adminRefresh();
    }));

    function adminRenderAccounts() {
      const items = root.querySelector("#adminListItems");
      const countEl = root.querySelector("#adminListCount");
      const keys = Object.keys(ACCT.users).sort((a, b) => (ACCT.users[a].created || 0) - (ACCT.users[b].created || 0));
      if (countEl) countEl.textContent = keys.length + (keys.length === 1 ? " account" : " accounts");
      if (!keys.length) { items.innerHTML = '<div class="acct-admin-empty">No accounts yet. People create accounts from the <b>Account</b> page — the first account becomes an Admin.</div>'; return; }
      const adminCount = keys.filter((x) => ACCT.users[x].role === "admin").length;
      items.innerHTML = '<div class="acct-admin-list">' + keys.map((k) => {
        const u = ACCT.users[k];
        const created = new Date(u.created || 0).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        const seen = Object.keys((u.progress && u.progress.cards) || {}).length;
        const youTag = ACCT.current === k ? ' <span class="acct-you">you</span>' : "";
        return '<div class="acct-admin-row">' +
          '<span class="monogram sm">' + initialOf(u.name) + '</span>' +
          '<span class="acct-admin-id"><b>' + esc(u.name) + '</b>' + youTag +
            '<small>@' + esc(u.username) + ' · ' + seen + ' cards seen · ' + (u.friends || []).length + ' friends · joined ' + created + '</small></span>' +
          '<span class="acct-admin-acts">' +
            '<select class="acct-role" data-role="' + esc(k) + '"><option value="user"' + (u.role !== "admin" ? " selected" : "") + '>User</option><option value="admin"' + (u.role === "admin" ? " selected" : "") + '>Admin</option></select>' +
            '<button class="mini-btn" data-reset="' + esc(k) + '" title="Issue a new recovery code">Reset code</button>' +
            '<button class="mini-btn danger" data-del="' + esc(k) + '">Delete</button>' +
          '</span></div>';
      }).join("") + '</div>';
      items.querySelectorAll(".acct-role").forEach((sel) => sel.addEventListener("change", () => {
        const k = sel.dataset.role;
        if (sel.value !== "admin" && ACCT.users[k].role === "admin" && adminCount <= 1) { toast("There must be at least one admin"); sel.value = "admin"; return; }
        acctSetRole(k, sel.value);
        toast(ACCT.users[k].name + " is now " + (sel.value === "admin" ? "an Admin" : "a User"));
        if (k === ACCT.current) { applyMode(); if (!isAdmin()) { route("home"); return; } }   // dropped my own rights
        adminRenderAccounts();
      }));
      items.querySelectorAll("[data-reset]").forEach((b) => b.addEventListener("click", () => {
        const code = acctRotateRecovery(b.dataset.reset);
        b.outerHTML = '<span class="acct-code" title="New recovery code — give this to the user">' + esc(code) + '</span>';
      }));
      items.querySelectorAll("[data-del]").forEach((b) => {
        let armed = false;
        b.addEventListener("click", () => {
          const k = b.dataset.del;
          if (ACCT.users[k].role === "admin" && adminCount <= 1) { toast("Can't delete the last admin"); return; }
          if (!armed) { armed = true; b.textContent = "Confirm?"; b.classList.add("armed"); setTimeout(() => { if (b.isConnected) { armed = false; b.textContent = "Delete"; b.classList.remove("armed"); } }, 2500); return; }
          const wasMe = k === ACCT.current;
          acctDelete(k);
          toast("Account deleted");
          if (wasMe) { applyMode(); if (!isAdmin()) { route("home"); return; } }   // deleted myself → leave admin
          adminRenderAccounts();
        });
      });
    }
    function adminRenderTimeline() {
      const items = root.querySelector("#adminListItems");
      const countEl = root.querySelector("#adminListCount");
      const eras = (window.TIMELINE || []).slice().sort((a, b) => a.year - b.year);
      if (countEl) countEl.textContent = eras.length + (eras.length === 1 ? " era" : " eras");
      const eraRow = (e) => {
        const terr = (e.geo || []).length, cities = (e.cities || []).length;
        return '<div class="tl-era" data-era="' + esc(e.id) + '">' +
          '<span class="tl-era-year">' + esc(eraYearLabel(e.year)) + '</span>' +
          '<span class="tl-era-meta"><b class="tl-era-name">' + esc(e.n || ("The world in " + eraYearLabel(e.year))) + '</b>' +
            '<small>' + terr + (terr === 1 ? " territory" : " territories") + (cities ? " · " + cities + (cities === 1 ? " place" : " places") : "") + " · " + eraPointCount(e).toLocaleString() + " points</small></span>" +
          '<span class="tl-era-acts">' +
            '<button class="mini-btn" data-edit="' + esc(e.id) + '">Edit on globe</button>' +
            '<button class="mini-btn danger" data-del="' + esc(e.id) + '">Delete</button>' +
          "</span></div>";
      };
      items.innerHTML =
        '<div class="tl-edit">' +
          '<div class="tl-intro">Build and edit the world’s borders for a moment in history right on the globe — <b>draw</b>, reshape and <b>delete</b> territories, and place <b>capitals &amp; cities</b>. Pick a year and open the editor. Past years show your borders + places; the present-day map is unchanged.</div>' +
          '<div class="tl-add"><div class="tl-add-row">' +
            '<label class="tl-field tl-field-sm"><span>Year</span><input type="text" id="tlYear" placeholder="1500 / 500 BCE" /></label>' +
            '<label class="tl-field tl-field-grow"><span>Label <small>(optional)</small></span><input type="text" id="tlLabel" placeholder="e.g. The world in 1500" /></label>' +
            '<button class="admin-new" id="tlOpen" type="button">Open globe editor</button>' +
          '</div></div>' +
          '<div class="tl-eras">' + (eras.length ? eras.map(eraRow).join("") : '<div class="tl-empty">No historical eras yet. Enter a year and open the editor to start drawing.</div>') + '</div>' +
        '</div>';

      const openEra = (e) => { atlasEditEraId = e.id; route("map"); };
      root.querySelector("#tlOpen").addEventListener("click", () => {
        const y = parseEraYear(items.querySelector("#tlYear").value);
        if (y == null) { toast("Enter a year first (e.g. 1500 or 500 BCE)."); return; }
        const label = items.querySelector("#tlLabel").value.trim();
        let e = (window.TIMELINE || []).find((x) => x.year === y);
        if (!e) { e = { id: newEraId(), year: y, n: label, geo: [], cities: [] }; window.TIMELINE = (window.TIMELINE || []).concat([e]); persistTimeline(); }
        else if (label) { e.n = label; persistTimeline(); }
        openEra(e);
      });
      items.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => { const e = (window.TIMELINE || []).find((x) => x.id === b.dataset.edit); if (e) openEra(e); }));
      items.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
        const e = (window.TIMELINE || []).find((x) => x.id === b.dataset.del); if (!e) return;
        inlineConfirm("Delete the era “" + (e.n || eraYearLabel(e.year)) + "”? Its borders will no longer appear on the timeline.", () => {
          window.TIMELINE = (window.TIMELINE || []).filter((x) => x.id !== b.dataset.del); persistTimeline(); adminRenderTimeline(); toast("Era deleted");
        }, "Delete");
      }));
    }
    function adminRefresh() {
      root.querySelectorAll(".admin-tab").forEach((t) => t.classList.toggle("active", t.dataset.atab === adminState.tab));
      const accounts = adminState.tab === "accounts", cards = adminState.tab === "cards", timeline = adminState.tab === "timeline";
      const admEl = root.querySelector(".admin"); if (admEl) { admEl.classList.toggle("accounts-mode", accounts); admEl.classList.toggle("timeline-mode", timeline); }
      if (accounts) { adminState.selected.clear(); adminRenderAccounts(); return; }
      if (timeline) { adminState.selected.clear(); adminRenderTimeline(); return; }
      search.placeholder = cards ? "Search cards by title, id, hanzi…" : "Search glossary terms…";
      const tools = root.querySelector(".alt-right:not(.alt-right-gloss)"); if (tools) tools.style.display = cards ? "" : "none";
      const gtools = root.querySelector(".alt-right-gloss"); if (gtools) gtools.style.display = adminState.tab === "glossary" ? "" : "none";
      if (!cards) adminState.selected.clear();
      adminUpdateCount();
      adminRenderTree();
      adminRenderList();
      adminRenderEditor();
    }
    adminRefresh();
    // after a reload, restore the list scroll and bring the previously-open card / term back into view (so you don't have to
    // re-browse to the card you were editing), and keep the saved scroll fresh as you browse.
    requestAnimationFrame(() => {
      const li = root.querySelector("#adminListItems");
      if (li && adminState._scroll) li.scrollTop = adminState._scroll;
      const esc2 = (v) => (window.CSS && CSS.escape ? CSS.escape(v) : String(v).replace(/["\\]/g, "\\$&"));
      const activeRow = root.querySelector(".admin-card-row.active") || (adminState.glossKey ? root.querySelector('[data-gkey="' + esc2(adminState.glossKey) + '"]') : null);
      if (activeRow) activeRow.scrollIntoView({ block: "center" });
      if (li) li.addEventListener("scroll", saveAdminUI, { passive: true });
    });
  };


  document.querySelectorAll(".tab").forEach((t) => {
    t.addEventListener("click", () => route(t.dataset.route));
  });
  { const _brand = document.querySelector(".brand"); if (_brand) _brand.addEventListener("click", () => route("home")); }   // brand/logo removed from the top bar; guard in case it's re-added
  const themeSwitch = document.getElementById("theme-switch");
  if (themeSwitch) {
    themeSwitch.addEventListener("click", () => setNight(!S.settings.night));
  }
  const modeSwitch = document.getElementById("mode-switch");
  if (modeSwitch) {
    modeSwitch.addEventListener("click", () => setMode(!isAdmin()));
  }

  // language switcher (top bar). Stores the choice in S.settings.lang; the site is not localised yet, so it's a no-op for now.
  const LANGS = [
    { code: "en", label: "English" }, { code: "es", label: "Español" }, { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" }, { code: "it", label: "Italiano" }, { code: "nl", label: "Nederlands" }, { code: "ru", label: "Русский" },
  ];
  (function setupLangSwitch() {
    const btn = document.getElementById("lang-switch"), codeEl = document.getElementById("lang-code");
    if (!btn || !codeEl) return;
    if (!S.settings.lang) S.settings.lang = "en";
    const cur = () => LANGS.find((l) => l.code === S.settings.lang) || LANGS[0];
    const refresh = () => { codeEl.textContent = cur().code.toUpperCase(); };
    refresh();
    let menu = null;
    function close() { if (menu) { menu.remove(); menu = null; } btn.setAttribute("aria-expanded", "false"); document.removeEventListener("pointerdown", onOutside, true); document.removeEventListener("keydown", onKey, true); }
    function onOutside(e) { if (!menu || e.target === btn || btn.contains(e.target) || menu.contains(e.target)) return; close(); }
    function onKey(e) { if (e.key === "Escape") close(); }
    function open() {
      menu = document.createElement("div");
      menu.className = "lang-menu"; menu.setAttribute("role", "listbox");
      menu.innerHTML = LANGS.map((l) => '<button class="lang-opt' + (l.code === S.settings.lang ? " on" : "") + '" type="button" role="option" data-lang="' + l.code + '"><span class="lo-code">' + l.code.toUpperCase() + '</span><span class="lo-label">' + esc(l.label) + '</span></button>').join("");
      document.body.appendChild(menu);
      const r = btn.getBoundingClientRect();
      menu.style.top = (r.bottom + 8) + "px";
      menu.style.right = Math.max(8, window.innerWidth - r.right) + "px";
      btn.setAttribute("aria-expanded", "true");
      menu.querySelectorAll(".lang-opt").forEach((o) => o.addEventListener("click", () => {
        S.settings.lang = o.dataset.lang; save(); refresh();
        toast((LANGS.find((l) => l.code === o.dataset.lang) || {}).label + " selected — localisation coming soon");
        close();
      }));
      setTimeout(() => { document.addEventListener("pointerdown", onOutside, true); document.addEventListener("keydown", onKey, true); }, 0);
    }
    btn.addEventListener("click", () => { menu ? close() : open(); });
  })();

  // initial route from hash
  const valid = ["home", "decks", "map", "account", "settings", "challenge", "chrono", "truefalse", "whosaid", "admin"];
  const h = (location.hash || "").replace("#", "");
  let initName = valid.includes(h) ? h : "home";
  if (initName === "admin" && !isAdmin()) initName = "home";
  current = { name: initName, params: {} };
  applyTheme();
  applyMode();
  const _glossToRestore = readGlossOpen();   // capture before render()'s closeAllGloss clears the record
  _adminLastSnapshot = JSON.stringify(ADMIN_EDITS);   // undo baseline (so the first edit after load is undoable)
  _adminUndoReady = true;
  render();
  checkAchievements(true);   // backfill any milestones already met by existing progress
  restoreGlossWins(_glossToRestore);   // re-open any gloss popups that were on screen before the reload
  supaBoot();   // async: restore the online session, handle emailed auth links, pull/reconcile synced progress

  // Ctrl/Cmd+Z on the editor page undoes the last admin edit (native undo still handles typing inside a field)
  document.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return;
    if (e.key !== "z" && e.key !== "Z") return;
    if (!current || current.name !== "admin") return;
    const ae = document.activeElement;
    if (ae && (ae.isContentEditable || ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.tagName === "SELECT")) return;
    e.preventDefault();
    adminUndo();
  });

  window.addEventListener("hashchange", () => {
    const hh = (location.hash || "").replace("#", "");
    if (hh === "admin" && !isAdmin()) { route("home"); return; }
    if (valid.includes(hh) && hh !== current.name) route(hh);
    else if (!hh && current.name !== "home") route("home");
  });
})();
