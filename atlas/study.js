/* ============================================================================
   atlas/study.js — THE STUDY INTEGRATION'S ARITHMETIC (Atlas v2 Phase 3b; docs/atlas-v2-design.md §2.8, §7 "Phase 3b — as built").

   A PURE module, loaded by the browser beside atlas.js and `require`d by the Node tests (the same trick atlas-format.js plays):
   no DOM, no Folio global, no clock. It turns three things the host hands over —
       the light card-to-places index  (window.ATLAS_CARD_PLACES, atlas/data/card-places.js: card id → registry ids),
       the reader's STUDIED cards       (host.study.studiedCards(): the ids of cards that have a record, see below),
       a card → collection function     (host.study.cardInfo(id).collId)
   — into what the globe draws: the Personal Atlas (the places of the studied cards), the Full Atlas (every place any card is
   about), the per-collection toggles, the stack counts, the place card's list of cards, and the honest sentences ("N places from
   M cards", "K of your cards have no place on the map yet", the empty state).

   WHAT "STUDIED" MEANS — the one definition, and it is v1's. The Personal Atlas of #map (`atlasRegisterAll`, app.js) asks of
   every key of `S.cards`: a card the reader has a RECORD for, which exists from the first grade and goes again when that first
   grade is undone — Q-P1 (a) in the design's §6 ("a card the reader has reviewed at least once, as today"). docs/reference.md
   calls the same set "XP: the number of distinct cards studied". Opening a card (#card/<id>) writes no record and so does not
   count; a card a reader has only SEEN does not count; a community-deck card is not in CARDS and names no place. This module
   does not decide that — the host hands over the ids — but it is the only reading of "studied" in 3b and it is not stored:
   everything here is COMPUTED from the ids, never written to the progress blob (docs/accounts-sync.md).

   Nothing in here guesses a place: a card the index does not carry has NO place, and the summary says how many of the reader's
   cards are in that state rather than hiding them.
   ============================================================================ */
(function (root) {
  "use strict";

  const LIST_CAP = 8;            // the cards a place card lists before "and N more"
  const POLITY = /^pol:/;

  /* the raw table → lookups. `raw` is window.ATLAS_CARD_PLACES: { ids: [registry ids], cards: { cardId: [indices into ids] } }.
     A malformed entry (an index outside `ids`) is ignored, never thrown: a half-loaded or stale file must not take the map down. */
  function parse(raw) {
    const out = { ids: [], cardIds: [], placesOfCard: new Map(), cardsOfPlace: new Map(), digest: "" };
    if (!raw || !Array.isArray(raw.ids) || !raw.cards || typeof raw.cards !== "object") return out;
    out.ids = raw.ids.slice(); out.digest = String(raw.digest || "");
    for (const cid of Object.keys(raw.cards)) {
      const list = raw.cards[cid]; if (!Array.isArray(list)) continue;
      const ids = []; for (const i of list) { const id = out.ids[i]; if (typeof id === "string" && !ids.includes(id)) ids.push(id); }
      if (!ids.length) continue;
      out.cardIds.push(cid); out.placesOfCard.set(cid, ids);
      for (const id of ids) { let l = out.cardsOfPlace.get(id); if (!l) out.cardsOfPlace.set(id, l = []); l.push(cid); }
    }
    return out;
  }

  /* THE STUDIED SET, computed. `studiedCards`: the ids of cards the reader has a record for (the host filters out what is not a
     shipped card). Returns the studied cards that carry a place, the places and polities they reach, and how many studied cards
     carry none — the figure the honest note is made of. */
  function studied(idx, studiedCards) {
    const cards = [], places = new Set(), polities = new Set(); let noPlace = 0, total = 0;
    const seen = new Set();
    for (const cid of studiedCards || []) {
      if (typeof cid !== "string" || seen.has(cid)) continue; seen.add(cid); total++;
      const ids = idx.placesOfCard.get(cid);
      if (!ids) { noPlace++; continue; }
      cards.push(cid);
      for (const id of ids) (POLITY.test(id) ? polities : places).add(id);
    }
    return { cards, cardSet: new Set(cards), places, polities, noPlace, total, all: new Set([...places, ...polities]) };
  }

  /* the collections that have places: [{ id, name, places, mine }] — `places` the distinct registry ids any of the collection's
     cards carries, `mine` how many of those the reader has studied. Only a collection with at least one place is listed. The order
     is by size, then name, so it is stable. `info(cardId)` → { collId, coll } or null. */
  function collections(idx, st, info) {
    const by = new Map();
    for (const [cid, ids] of idx.placesOfCard) {
      const i = info(cid); if (!i || !i.collId) continue;
      let c = by.get(i.collId); if (!c) by.set(i.collId, c = { id: i.collId, name: i.coll || i.collId, set: new Set(), mine: new Set() });
      for (const id of ids) { c.set.add(id); if (st && st.all.has(id) && st.cardSet && st.cardSet.has(cid)) c.mine.add(id); }
    }
    return [...by.values()].map((c) => ({ id: c.id, name: c.name, places: c.set.size, mine: c.mine.size })).sort((a, b) => b.places - a.places || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  }

  /* THE FLAGS THE WORKER DRAWS FROM: Map registry id → 0 (not shown) | 1 (a place of the Full Atlas the reader has not studied) |
     2 (a place the reader has studied). `mode` is "personal" (only the studied places, flag 2), "full" (every place any card is
     about, the studied ones flag 2) or anything else (nothing: the plain map). A collection the reader has switched off removes
     the cards it owns: a place stays only through a card of a collection that is on, and the studied flag only through a STUDIED
     card of a collection that is on. */
  function flags(idx, st, mode, hidden, info) {
    const out = new Map();
    if (mode !== "personal" && mode !== "full") return out;
    const off = hidden instanceof Set ? hidden : new Set(hidden || []);
    const mine = new Set(st ? st.cards : []);
    for (const [cid, ids] of idx.placesOfCard) {
      const i = info(cid); const coll = i ? i.collId : "";
      if (coll && off.has(coll)) continue;
      const isMine = mine.has(cid);
      if (mode === "personal" && !isMine) continue;
      for (const id of ids) { const f = isMine ? 2 : 1; if ((out.get(id) || 0) < f) out.set(id, f); }
    }
    return out;
  }

  /* the sentences. `mode` personal|full|map. Returns { text, note, empty } — `text` the count line ("N places from M cards"), `note` the
     honest second sentence (studied cards with no place yet), `empty` the empty-state sentence for the Personal Atlas, or "" */
  function summary(st, mode, flagMap) {
    const plural = (n, one, many) => n.toLocaleString("en-GB") + " " + (n === 1 ? one : many);
    // places and polities are counted apart: a polity is an entity drawn by its year, not a point on the map
    const count = (want, polity) => { let n = 0; if (flagMap) for (const [id, f] of flagMap) if ((want ? f === want : f > 0) && POLITY.test(id) === polity) n++; return n; };
    const both = (np, nq) => plural(np, "place", "places") + (nq ? " and " + plural(nq, "polity", "polities") : "");
    let text = "", note = "", empty = "";
    if (mode === "personal") {
      const n = count(2, false), q = count(2, true);
      if (!st.total) empty = "You haven’t studied any cards yet. The places in the cards you review will appear here — or switch to the Full Atlas to see every place.";
      else if (!st.cards.length) empty = (st.total === 1 ? "The card you have studied has no place on the map yet." : "None of your " + st.total + " studied cards has a place on the map yet.") + " The Full Atlas shows every place that does.";
      else if (!n && !q) empty = "Every collection with a place of yours is switched off. Switch one back on to see its places.";
      else text = both(n, q) + " from " + plural(st.cards.length, "card", "cards");
      if (st.cards.length && st.noPlace) note = st.noPlace + " of your cards " + (st.noPlace === 1 ? "has" : "have") + " no place on the map yet";
    } else if (mode === "full") {
      text = both(count(0, false), count(0, true)) + " on the Full Atlas";
      const mine = count(2, false) + count(2, true); if (mine) text += " · " + mine.toLocaleString("en-GB") + " yours";
      if (st.total && st.noPlace) note = st.noPlace + " of your cards " + (st.noPlace === 1 ? "has" : "have") + " no place on the map yet";
    }
    return { text, note, empty };
  }

  /* THE PLACE CARD'S LIST: the cards about one place. `mode` personal lists the reader's own cards (and counts the rest without
     naming them); full lists every card, the reader's first. `hidden` removes a switched-off collection's cards. Returns
     { shown: [{ id, mine }], more, others } — `more` the cards past the cap, `others` the cards a Personal listing keeps back. */
  function cardsFor(idx, id, st, mode, hidden, info, limit) {
    const all = idx.cardsOfPlace.get(id) || [], off = hidden instanceof Set ? hidden : new Set(hidden || []);
    const mine = new Set(st ? st.cards : []);
    const kept = all.filter((cid) => { const i = info(cid); return !(i && i.collId && off.has(i.collId)); });
    const own = kept.filter((c) => mine.has(c)), rest = kept.filter((c) => !mine.has(c));
    const list = (mode === "personal" ? own : own.concat(rest)).map((c) => ({ id: c, mine: mine.has(c) }));
    const cap = limit == null ? LIST_CAP : limit;
    return { shown: list.slice(0, cap), more: Math.max(0, list.length - cap), others: mode === "personal" ? rest.length : 0, total: list.length };
  }

  /* STACKS: greedy screen-space clustering, shared by the worker's study pass and the tests. `pts`: [{ id, x, y }] in order of
     importance (the first of a cluster is its top); a point within `radius` px of an earlier cluster's seed joins it, and then
     clusters whose CENTROIDS lie within `radius` of one another are merged, again and again, until none do. The last step is the
     guarantee the marks depend on: any two marks drawn — a stack, or a place alone — have centres more than `radius` apart, so one
     never lies under another and a mark is dropped only for a control or the frame's edge. Returns [{ x, y, ids, n }] with the
     centroid; a cluster of one is a plain mark. */
  function cluster(pts, radius) {
    let out = [];
    const r2 = radius * radius;
    for (const p of pts) {
      let hit = null;
      for (const c of out) { const dx = c.sx - p.x, dy = c.sy - p.y; if (dx * dx + dy * dy <= r2) { hit = c; break; } }
      if (hit) { hit.ids.push(p.id); hit.mx += p.x; hit.my += p.y; }
      else out.push({ sx: p.x, sy: p.y, mx: p.x, my: p.y, ids: [p.id] });
    }
    const cx = (c) => c.mx / c.ids.length, cy = (c) => c.my / c.ids.length;
    for (let again = true; again;) {
      again = false;
      for (let i = 0; i < out.length && !again; i++) for (let j = i + 1; j < out.length; j++) {
        const dx = cx(out[i]) - cx(out[j]), dy = cy(out[i]) - cy(out[j]);
        if (dx * dx + dy * dy <= r2) { out[i].ids = out[i].ids.concat(out[j].ids); out[i].mx += out[j].mx; out[i].my += out[j].my; out.splice(j, 1); again = true; break; }
      }
    }
    return out.map((c) => ({ x: cx(c), y: cy(c), ids: c.ids, n: c.ids.length }));
  }

  const api = { LIST_CAP, parse, studied, collections, flags, summary, cardsFor, cluster };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.AtlasStudy = api;
})(typeof window !== "undefined" ? window : globalThis);
