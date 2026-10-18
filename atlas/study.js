/* ============================================================================
   atlas/study.js — THE STUDY INTEGRATION'S ARITHMETIC (Atlas v2 Phase 3b; docs/atlas-v2-design.md §2.8, §7 "Phase 3b — as built").

   A PURE module, loaded by the browser beside atlas.js and `require`d by the Node tests (the same trick atlas-format.js plays):
   no DOM, no Folio global, no clock. It turns three things the host hands over —
       the light card-to-places index  (window.ATLAS_CARD_PLACES, atlas/data/card-places.js: card id → registry ids),
       the reader's STUDIED cards       (host.study.studiedCards(): the ids of cards that have a record, see below),
       a card → collection function     (host.study.cardInfo(id).collId)
   — into what the globe draws: the Personal Atlas (the places of the studied cards), the Full Atlas (every place any card is
   about), the per-collection toggles, the marks' sizes, shapes and fan, the place card's list of cards, and the honest sentences ("N places from
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

  const D2R = Math.PI / 180, R_EARTH = 6371;
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

  /* THE TAP RULES (2026-10-17; the owner's phone, decision b): the registry ids a tap may open — those with at least one card. Personal: one of the
     reader's own (flag 2 is the only flag Personal sets); Full: any card of a collection that is on (flag > 0); the plain Map: any card at all
     (every id of the index). null before the index is read (nothing is tappable). A pure function of `flags()`'s result, so the page, the
     hidden list and the tests cannot disagree. */
  function tappableSet(idx, mode, flagMap) {
    if (!idx) return null;
    if (mode !== "personal" && mode !== "full") return new Set(idx.ids);
    const out = new Set(); if (flagMap) for (const [id, f] of flagMap) if (f > 0 && (mode === "full" || f === 2)) out.add(id);
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

  /* MARKS — EVERY FLAGGED PLACE IS ITS OWN MARK (stacks removed, 2026-10-14; docs/atlas-v2-design.md §7 "Stacks removed").
     The owner's decision: a number standing in for nearby places is gone for good — no clustering, no count, at any zoom, in the Personal
     or the Full Atlas, with no setting to bring it back. What replaced `cluster` is the arithmetic of a mark that is always one place:
       · its SIZE grows with the zoom — `markHalf` is the half-extent in CSS px (outline included): a dot about 4 px across at the widest
         view, 16 px by city scale — so a wide view of 1,300 places is dots, not a wall of diamonds; since 2026-10-18 (decision a) every
         glyph but the capital's square is DRAWN at half of that (`markScale`), the capital at the full size;
       · its SHAPE is `markShape` (the glyph classes below; a polity, a people, a culture or an authored extent has NO mark since 2026-10-18,
         decision b — it is named, and its face or its name is tapped) and its LAYER `markLayer` is the draw order, back to front:
         places not studied (0), places studied (1); the selected mark is drawn last of all;
       · a TAP picks the nearest mark within a finger (`nearMarks`), and where several lie within it they FAN OUT around the tap point
         (`fanOut`), each at its true position joined to its fanned copy — so the reader chooses, and nothing is ever hidden behind a count.
     All three are pure, shared by the worker (the sizes), the page (the drawing, the picking) and the Node tests. */
  const MARK_WIDE_KMPP = 16, MARK_NEAR_KMPP = 1.5, MARK_WIDE_PX = 2, MARK_NEAR_PX = 8;
  const POLITY_KIND = /^(polity|people|culture|extent|front|contested|nested)$/;
  function markHalf(kmpp) {
    const k = Math.max(0.001, kmpp || MARK_WIDE_KMPP);
    const t = Math.max(0, Math.min(1, (Math.log(MARK_WIDE_KMPP) - Math.log(k)) / (Math.log(MARK_WIDE_KMPP) - Math.log(MARK_NEAR_KMPP))));
    return MARK_WIDE_PX + (MARK_NEAR_PX - MARK_WIDE_PX) * t;
  }
  /* THE GLYPH CLASSES (2026-10-17; the owner's phone, decision e — "battles, hills and so on have the same icons as cities"). Every kind the
     card-linked places have in the registry falls into one of SEVEN classes (six glyphs and the ring; the polity's star of decision e is gone since
     2026-10-18, decision b), each its own SHAPE (not only a colour; a canvas path the page draws in one batch per class; the Legend lists them):
       settlement  capital, city, town                        disc
       site        site (an archaeological site), a cave      diamond
       battle      site/battle                                cross (a saltire)
       peak        mountain, hill, cape                       triangle
       building    site/building (a monument, a wall, a hall) house (a pointed-top pentagon)
       capital     a settlement that is or was the capital of a  square
                   state or polity of the registry (2026-10-17, decision b:
                   the gazetteer's present-day capitals, and every period
                   capital of polity-index.js joined to its registry row by
                   `capitalIds`); a site that was a capital is a capital
       stack       several places of one city                 ring, with the count inside
     A POLITY, A PEOPLE, A CULTURE OR AN EXTENT HAS NO MARK (2026-10-18; the owner's phone, decision b: "remove all star (state) icons"). It is still
     named (its name is laid at its flag's turn by the study pass when a card links it), still counted on the count line, still tappable through its
     FACE or its NAME where it has a card (the tap rules of 2026-10-17); the Legend no longer lists it. `markClass` returns null for it, as for an area.
     An AREA — a river, a lake, a sea, an ocean, a strait, a gulf, an island, a range, a region, a cultural area, a country, a province — has NO
     mark (class null): it is a name only. `markClass(kind, sub)` is the one classification; `markShape` its shape; MARK_CLASSES the Legend's rows. */
  const MARK_SHAPE = { capital: "square", settlement: "disc", site: "diamond", battle: "cross", peak: "triangle", building: "house", stack: "stack" };
  const MARK_CLASSES = [
    { cls: "capital", shape: "square", word: "Capital, present or past" },
    { cls: "settlement", shape: "disc", word: "City or town" },
    { cls: "site", shape: "diamond", word: "Archaeological site or cave" },
    { cls: "battle", shape: "cross", word: "Battle" },
    { cls: "peak", shape: "triangle", word: "Mountain, hill or cape" },
    { cls: "building", shape: "house", word: "Building, monument or wall" },
    { cls: "stack", shape: "stack", word: "Several places of one city, with their count" },
  ];
  /* `cap` (2026-10-17, decision b): the place is or was a capital (the gazetteer's kind, or a period capital joined by `capitalIds`). The
     capital square wins over a settlement's disc and a site's diamond, house or cave (a site that was a capital); never over a battle or a peak */
  function markClass(kind, sub, cap) {
    kind = kind || "";
    if (POLITY_KIND.test(kind)) return null;   // no mark for a state, a people, a culture or an extent (decision b, 2026-10-18): a name, a face
    if (kind === "stack") return "stack";
    if (kind === "capital") return "capital";
    if (kind === "city" || kind === "town") return cap ? "capital" : "settlement";
    if (kind === "mountain" || kind === "hill" || kind === "cape") return "peak";
    if (kind === "site") return sub === "battle" ? "battle" : cap ? "capital" : sub === "building" ? "building" : "site";
    return null;
  }
  function markShape(kind, sub, cap) { const c = markClass(kind, sub, cap); return c ? MARK_SHAPE[c] : null; }
  /* THE CAPITALS OF THE REGISTRY (2026-10-17, decision b). `capitals` are the registry's capital statements — polity-index.js's rows
     [entity, name, lon, lat, from, to] (history.bin's own header, from each state's P36 statements) — and `rows` the registry's places
     [{ id, kind, name, aliases, at: [lon, lat] }]. A statement names the registry row that bears its name (the name or an alias, folded:
     the period names are aliases of the one place) within CAP_NAME_KM, else the nearest capital, city or town within CAP_NEAR_KM (the
     same site under a spelling the registry lacks); a statement that matches nothing marks nothing (never a guess by distance alone past
     that). The gazetteer's own `capital` rows (the present-day capitals) are capitals by kind and need no statement. Returns the Set of ids. */
  const CAP_NAME_KM = 25, CAP_NEAR_KM = 2;
  const foldName = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const CAP_KINDS = { capital: 1, city: 1, town: 1, site: 1 };
  function capitalIds(rows, capitals) {
    const out = new Set(); if (!Array.isArray(rows) || !Array.isArray(capitals)) return out;
    const pts = [];
    for (const r of rows) {
      if (!r || !CAP_KINDS[r.kind] || r.sub === "battle" || !Array.isArray(r.at) || !isFinite(r.at[0]) || !isFinite(r.at[1])) continue;   // a battle is never a capital, whatever it is named
      if (r.kind === "capital") out.add(r.id);
      pts.push({ id: r.id, kind: r.kind, keys: [foldName(r.name)].concat((r.aliases || []).map(foldName)).filter(Boolean), u: unitOf({ at: r.at }) });
    }
    for (const c of capitals) {
      if (!Array.isArray(c) || !isFinite(c[2]) || !isFinite(c[3])) continue;
      const key = foldName(c[1]), u = unitOf({ at: [c[2], c[3]] }); if (!key) continue;
      const cosName = Math.cos(CAP_NAME_KM / R_EARTH), cosNear = Math.cos(CAP_NEAR_KM / R_EARTH);
      let named = false, nearest = null, nd = -2;
      for (const p of pts) {
        const d = p.u[0] * u[0] + p.u[1] * u[1] + p.u[2] * u[2];
        if (d >= cosName && p.keys.includes(key)) { out.add(p.id); named = true; }
        if (p.kind !== "site" && d >= cosNear && d > nd) { nd = d; nearest = p; }
      }
      if (!named && nearest) out.add(nearest.id);
    }
    return out;
  }
  /* THE DRAWN SIZES (2026-10-18; the owner's phone, decision a: "circles, diamonds and every other icon except the capital-city squares should be
     about 50 % smaller"). Every glyph but the capital's square is drawn at HALF the half-extent markHalf gives, at every zoom (linear ×0.5); the
     capital's square keeps its full size; a hill is still the smaller triangle (×0.75 of its class). `markScale(kind, cls)` is that factor, shared
     by the worker (the obstacle a mark is to the names) and the page (the sprite drawn). The HIT AREA is not the drawn size: the page's `markRadius`
     is 16 px with a mouse and 22 with a finger whatever is drawn, so a tap target stays at least 32 px. An outline scales with its glyph but never
     under MARK_LINE_MIN (1.25 px), so a 2 px disc at the widest view still reads. The city ring (`ringHalf`) is the one glyph that may stay larger
     than half: it must hold its count in a STACK_FONT_PX (9 px) bold figure of two digits — "88" at 9 px bold is 12 px wide and 7 px tall in
     Chromium's system face, its widest point on the centre line, so the ring's inner radius must be about 7 px; with a 2 px outline and the disc
     geometry's 0.92 that is a half-extent of 9.5 px (19 px across), where today's ring was 22 px across at city scale and 13 at the widest view
     (its 8 px figure touching the ring). Above that floor the ring follows the halved marks (1.4 × the halved half), which no zoom reaches. */
  const MARK_SMALL = 0.5, MARK_LINE_MIN = 1.25, RING_MIN_PX = 9.5, STACK_FONT_PX = 9;
  function markScale(kind, cls) { return (cls === "capital" ? 1 : MARK_SMALL) * (kind === "hill" ? 0.75 : 1); }   // a hill is the smaller triangle, as it was
  function ringHalf(half, scale) { return Math.max(half * 1.4 * MARK_SMALL, RING_MIN_PX * (scale > 0 ? scale : 1)); }   // `half` is markHalf × the text scale, `scale` the text scale
  const markLine = (half) => Math.max(MARK_LINE_MIN, half < 3 ? 1 : half < 6 ? 1.5 : 2);   // the outline's width for a glyph of that drawn half-extent
  function markLayer(kind, f) { return POLITY_KIND.test(kind || "") ? 2 : f === 2 ? 1 : 0; }   // a stack is a place's layer (its own or the reader's); layer 2 is kept for a polity, which has had no mark since 2026-10-18
  /* the marks within `radius` px of (x, y): `pts` [{ x, y }] → indices, nearest first (a tie keeps the order given) */
  function nearMarks(pts, x, y, radius) {
    const out = [], r2 = radius * radius;
    for (let i = 0; i < pts.length; i++) { const dx = pts[i].x - x, dy = pts[i].y - y, d = dx * dx + dy * dy; if (d <= r2) out.push({ i, d }); }
    out.sort((p, q) => p.d - q.d || p.i - q.i);
    return out.map((o) => o.i);
  }
  /* THE FAN. `items` [{ x, y, w }] are the marks of one tap, at their TRUE positions with the width in px of the name each is drawn with;
     `tap` the point tapped; `o` { W, H, chrome: [[x0, y0, x1, y1]], max, step, minR, half }. Each member gets a fanned copy on a circle
     round the tap point, in the order of the members' own bearings from it (so the joining lines do not cross), with its name on the
     outer side. A full circle is tried first, turned and widened until every copy and name lies wholly inside the frame, clear of every control and of one another; near an edge or under the study panel it narrows to three quarters, a half and a quarter of the circle, opening
     towards the free ground. If nothing is wholly clear, the arrangement with the fewest that are not. Returns { R, slots: [{ i, x, y,
     right, rect }], clear } — `slots[k].i` indexes `items`, `rect` the copy and its name together, `clear` whether all are clear. At
     most `max` (14) members are fanned. */
  function fanOut(items, tap, o) {
    o = o || {};
    const W = o.W || 1e9, H = o.H || 1e9, chrome = o.chrome || [], max = o.max || 14, step = o.step || 30, half = o.half || 9, gap = 4;
    const n = Math.min(items.length, max);
    const order = items.slice(0, n).map((m, i) => ({ i, a: Math.atan2(m.y - tap.y, m.x - tap.x) })).sort((p, q) => p.a - q.a || p.i - q.i);
    let best = null;
    for (const span of [2 * Math.PI, 1.5 * Math.PI, Math.PI, 0.5 * Math.PI]) {
      for (const mul of [1, 1.3, 1.7, 2.2]) {
        const R = Math.max(o.minR || 44, (span >= 2 * Math.PI - 1e-9 ? n : Math.max(1, n - 1)) * step / span) * mul;
        for (let k = 0; k < 24; k++) {
          const turn = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 12);   // 0, +15°, −15°, +30° … from straight up
          const slots = []; let bad = 0;
          for (let j = 0; j < n; j++) {
            const a = span >= 2 * Math.PI - 1e-9 ? -Math.PI / 2 + turn + (j * 2 * Math.PI) / n : -Math.PI / 2 + turn - span / 2 + (n > 1 ? (j * span) / (n - 1) : span / 2);
            const x = tap.x + R * Math.cos(a), y = tap.y + R * Math.sin(a), right = Math.cos(a) >= 0, w = items[order[j].i].w || 0;
            const rect = right ? [x - half, y - half - 3, x + half + gap + w, y + half + 3] : [x - half - gap - w, y - half - 3, x + half, y + half + 3];
            if (!(rect[0] >= 0 && rect[1] >= 0 && rect[2] <= W && rect[3] <= H) || chrome.some((c) => rect[0] < c[2] && rect[2] > c[0] && rect[1] < c[3] && rect[3] > c[1])) bad++;
            slots.push({ i: order[j].i, x, y, right, rect });
          }
          for (let a = 0; a < n && !bad; a++) for (let b = a + 1; b < n; b++) { const p = slots[a].rect, q = slots[b].rect; if (p[0] < q[2] + 2 && p[2] > q[0] - 2 && p[1] < q[3] + 2 && p[3] > q[1] - 2) { bad++; break; } }   // no copy or name over another
          if (!bad) return { R, slots, clear: true };
          if (!best || bad < best.bad) best = { R, slots, bad };
        }
      }
    }
    return { R: best.R, slots: best.slots, clear: false };
  }

  /* CITY STACKS (2026-10-17; the owner's phone, decision d — "Rome and similar places are cluttered with marks"). The places of ONE CITY that lie
     within STACK_PX of one another on screen are drawn as one mark with a count; zoomed in until they separate they are drawn singly. NEVER across
     cities and NEVER by raw screen proximity (the owner removed screen-proximity stacks on 2026-10-14): membership is by the city a place belongs to.
       `cityMembership(places, cities, o)` → { of: Map placeId → cityId, how: { parent, near, self } }:
         rule 1 — the registry's own parent (`within`, when it is a settlement: a capital, a city, a town or an ancient city kept as a site);
         rule 2 — a point place with no such parent belongs to the settlement (a capital, a city or a town; never a site) within `km` (3) of
                  its centre — the largest kind first (a capital before a city before a town: the Acropolis's sites are Athens's, not the
                  "Acropolis (neighbourhood)" row's), the nearest among equals (the registry has no city extents, so the centre is all there is);
         a settlement joins only a LARGER kind of settlement within `km` (a town or a neighbourhood row joins the capital it lies in; two towns
         3 km apart stay two), else it is its own city — so a stack can carry the city's own mark.
       `places` [{ id, kind, within, pk (the parent's kind), a (unit vector) | at ([lon, lat]) }], `cities` [{ id, kind, a | at }].
       `stackGroups(items, px)` → the groups of two or more among `items` [{ x, y }] whose members chain within `px` of one another (single
       linkage, so a group is what a reader sees as one cluster), each as an array of indices in the input order. */
  const STACK_PX = 28;
  const SETTLEMENT = /^(capital|city|town)$/, CITY_PARENT = /^(capital|city|town|site)$/, POINT_PLACE = /^(capital|city|town|site|mountain|hill|cape)$/;
  const unitOf = (p) => { if (p.a) return p.a; const lo = p.at[0] * D2R, la = p.at[1] * D2R, c = Math.cos(la); return [c * Math.cos(lo), c * Math.sin(lo), Math.sin(la)]; };
  function cityMembership(places, cities, o) {
    o = o || {}; const km = o.km == null ? 3 : o.km, cosMax = Math.cos(km / R_EARTH);
    const of = new Map(), how = { parent: 0, near: 0, self: 0 };
    const RANK = { capital: 0, city: 1, town: 2 };
    const cs = (cities || []).filter((c) => c && c.id && SETTLEMENT.test(c.kind || "") && (c.a || c.at)).map((c) => ({ id: c.id, u: unitOf(c), r: RANK[c.kind] }));
    for (const p of places || []) {
      if (!p || !p.id || !POINT_PLACE.test(p.kind || "")) continue;
      if (p.within && p.within !== p.id && CITY_PARENT.test(p.pk || "")) { of.set(p.id, p.within); how.parent++; continue; }
      const own = SETTLEMENT.test(p.kind) ? RANK[p.kind] : 9;   // a settlement joins only a larger kind
      if (!(p.a || p.at)) { if (own < 9) { of.set(p.id, p.id); how.self++; } continue; }
      const u = unitOf(p); let best = null, bd = cosMax, br = 9;
      for (const c of cs) { if (c.id === p.id || c.r >= own) continue; const d = u[0] * c.u[0] + u[1] * c.u[1] + u[2] * c.u[2]; if (d < cosMax) continue; if (c.r < br || (c.r === br && d > bd)) { bd = d; br = c.r; best = c.id; } }
      if (best) { of.set(p.id, best); how.near++; }
      else if (own < 9) { of.set(p.id, p.id); how.self++; }
    }
    return { of, how };
  }
  function stackGroups(items, px) {
    const n = (items || []).length, r2 = (px == null ? STACK_PX : px) ** 2, seen = new Array(n).fill(false), out = [];
    for (let i = 0; i < n; i++) {
      if (seen[i]) continue;
      const g = [i]; seen[i] = true;
      for (let k = 0; k < g.length; k++) for (let j = 0; j < n; j++) { if (seen[j]) continue; const dx = items[j].x - items[g[k]].x, dy = items[j].y - items[g[k]].y; if (dx * dx + dy * dy <= r2) { seen[j] = true; g.push(j); } }
      if (g.length >= 2) out.push(g.sort((a, b) => a - b));
    }
    return out;
  }

  /* THE LABEL'S TEXT (2026-10-17; the owner's phone, decision f — "labels are inconsistent or too long"). A label NEVER shows a parenthetical
     ("Malia (archaeological site)" is "Malia" on the map; the full name, with its disambiguation, is the popup's). A name longer than LABEL_WRAP (22)
     characters wraps onto two lines at the space nearest its middle (a tie: the split whose lines are most nearly equal, then the earlier); one still
     longer than LABEL_SHORT (28) uses the registry's SHORT NAME if it has one — an alias the full name begins with ("Boma" for "Boma, Democratic
     Republic of the Congo"; "Presidential Office Building" for "…, Taipei"), never a period name (an alias that is another name altogether).
     Returns { text, lines, full }: `text` the one-line text (the short name, or the stripped name), `lines` [a, b] when it wraps, else null. */
  const LABEL_WRAP = 22, LABEL_SHORT = 28;
  const stripParen = (s) => String(s || "").replace(/\s*\([^)]*\)/g, "").replace(/\s{2,}/g, " ").trim();
  function shortName(full, aliases) {
    const base = stripParen(full); let best = null;
    for (const a of aliases || []) { const t = stripParen(a); if (!t || t.length >= base.length) continue; if (base === t || base.startsWith(t + ",") || base.startsWith(t + " ")) { if (!best || t.length < best.length) best = t; } }
    return best;
  }
  function splitAtMiddle(text) {
    const mid = text.length / 2; let best = null;
    for (let i = 1; i < text.length - 1; i++) {
      if (text[i] !== " ") continue;
      const d = Math.abs(i - mid), eq = Math.abs(i - (text.length - 1 - i));
      if (!best || d < best.d - 1e-9 || (Math.abs(d - best.d) < 1e-9 && eq < best.eq)) best = { i, d, eq };
    }
    return best ? [text.slice(0, best.i), text.slice(best.i + 1)] : null;
  }
  /* THE BARE NAME (2026-10-17, decision d; the owner's phone: "Kirchberg, Luxembourg" should not name its country): a trailing ", <country>",
     ", <state or province>" or ", <region>" qualifier is not part of the name a label shows — "Kirchberg", "Folsom", "Cures". The popup and the
     search keep the full, qualified name. `o.qualified` keeps the qualifier: the worker sets it when two names on one layout share a bare name
     (two "Alexandria"s on screen at once keep "Alexandria, Egypt" and "Alexandria, Virginia"). */
  function bareName(text) { const t = stripParen(String(text || "")), i = t.indexOf(", "); return i > 0 ? t.slice(0, i) : t; }   // "Abydos, Egypt" and "Abydos (Hellespont)" share the bare name "Abydos"
  function labelText(name, aliases, o) {
    const full = String(name || ""); let text = stripParen(full);
    if (!(o && o.qualified)) text = bareName(text);
    if (text.length > LABEL_SHORT) { const s = shortName(full, aliases); if (s) text = s; }
    const lines = text.length > LABEL_WRAP ? splitAtMiddle(text) : null;
    return { text, lines, full };
  }

  /* THE YEARS A PLACE HAS (Phase 3c, search across years). `ranges` are the [from, to] year ranges a polity is on the map (its steps, joined
     — a gap between two is a real gap). Returns null when `y` lies in one, or when there are none (a place with no years on record is never
     said to be absent); else { ranges, go }, `go` the nearest year it IS on the map: the end of the range before `y` or the start of the
     range after it, whichever is nearer — the later on a tie. Only years the data holds are ever returned. */
  function yearsNote(ranges, y) {
    if (!Array.isArray(ranges) || !ranges.length) return null;
    if (ranges.some((r) => r[0] <= y && y <= r[1])) return null;
    let before = null, after = null;
    for (const r of ranges) { if (r[1] < y) before = r[1]; else if (r[0] > y && after == null) after = r[0]; }
    const go = before == null ? after : after == null ? before : (y - before < after - y ? before : after);
    return { ranges, go };
  }

  /* THE DEFAULT VIEW OF A READER WITH PLACES (Phase 3c). `points` [[lon, lat], …] are the places the reader has studied. The centre is the
     direction of the mean of their unit vectors; the radius the great-circle distance that holds `keep` (90 %) of them, so one far-off
     place does not stretch the frame over the globe; the scale is the km a pixel must span for that circle, with a margin, to fit half of
     `shortPx` (the frame's shorter side), clamped to [minKmpp, maxKmpp]. null when there are none, or when they spread right round the
     globe (the mean vector shorter than 0.25: no one direction frames them) — the caller then keeps its default. */
  function framing(points, o) {
    o = o || {};
    const pts = (points || []).filter((p) => p && isFinite(p[0]) && isFinite(p[1]));
    if (!pts.length) return null;
    const keep = o.keep == null ? 0.9 : o.keep, margin = o.margin == null ? 1.35 : o.margin, minK = o.minKmpp == null ? 3 : o.minKmpp, maxK = o.maxKmpp == null ? 24 : o.maxKmpp;
    const vec = pts.map((p) => { const lo = p[0] * D2R, la = p[1] * D2R; return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)]; });
    let mx = 0, my = 0, mz = 0; for (const v of vec) { mx += v[0]; my += v[1]; mz += v[2]; } mx /= vec.length; my /= vec.length; mz /= vec.length;
    const len = Math.hypot(mx, my, mz); if (len < 0.25) return null;
    const c = [mx / len, my / len, mz / len];
    const d = vec.map((v) => Math.acos(Math.max(-1, Math.min(1, v[0] * c[0] + v[1] * c[1] + v[2] * c[2]))) * R_EARTH).sort((a, b) => a - b);
    const radiusKm = d[Math.min(d.length - 1, Math.max(0, Math.ceil(keep * d.length) - 1))];
    const half = Math.max(1, (o.shortPx || 600) / 2);
    const kmpp = Math.max(minK, Math.min(maxK, radiusKm * margin / half));
    return { lon: Math.atan2(c[1], c[0]) / D2R, lat: Math.asin(Math.max(-1, Math.min(1, c[2]))) / D2R, kmpp, radiusKm, n: pts.length };
  }

  /* A NEW DISCOVERY (Phase 3c): a place the reader has studied (some card of theirs with a record is about it) and has not yet opened on the
     Atlas — the existing `placesSeen` register, read through `seen(name)`; nothing new is stored. `st` is `studied()`'s result. Polities are
     not places to discover (they are drawn by year). */
  function isNewDiscovery(st, id, name, seen) {
    if (!st || !st.places || !id || POLITY.test(id) || !name) return false;
    if (!st.places.has(id)) return false;
    return !(typeof seen === "function" ? seen(name) : false);
  }

  /* PEOPLES AND CULTURES (Phase 2c; design §2.5, §2.6, Q-C1 a, Q-C2 b). The history file's entity table says what an entity IS: a state
     ("polity", and the "contested" and "nested" faces made of states) is a TERRITORY — a border, a 30 % fill, a name in small capitals;
     a "people" or a "culture" is a PRESENCE — no border line, a soft stippled face, a name in spaced italic. The one place that
     decision is made is `layerOf`, so the renderer, the labels, the rail, the card and the tests cannot disagree. */
  const isPresence = (kind) => kind === "people" || kind === "culture";
  const isFront = (kind) => kind === "front";   // 2d: an event face — the Second World War front line, dated to the day
  const isExtent = (kind) => kind === "extent";   // 2d: a war side no series answers, kept as the card's own authored area — a soft wash in the side's tint, never a stipple
  const layerOf = (kind) => (isPresence(kind) ? "presence" : isExtent(kind) ? "war-extent" : isFront(kind) ? "front" : kind === "polity" || kind === "contested" || kind === "nested" ? "territory" : "other");
  const KIND_WORD = { polity: "state", contested: "contested land", nested: "state", people: "people", culture: "culture", extent: "authored extent", front: "front" };   // the word the stack chip and the card put after a name
  const kindWord = (kind) => KIND_WORD[kind] || kind;

  /* THE PEOPLES SWITCH (the legend's three positions; Q-C2 b). "off" hides every presence; "linked" (the default in the Full Atlas) shows
     the peoples and cultures a card links; "all" adds every one with a dated source, for discovery. The Personal Atlas shows a presence
     only when one of the reader's own cards links it, whatever the position (but "off"). Three readings of "a card links it":
       personal — the reader's studied cards (flag 2 of `flags`), full — any card of a collection that is on (flag 1 or 2),
       map (no study layer) — any card at all (`linked`, the polities the card index names).
     `id` is the entity's registry id ("pol:scythia"); `flagMap` is `flags()`'s result; `linked` a Set of the ids the index links. */
  const PEOPLES_POSITIONS = ["off", "linked", "all"];
  const PEOPLES_DEFAULT = "linked";
  const normalizePeoples = (v) => (PEOPLES_POSITIONS.includes(v) ? v : PEOPLES_DEFAULT);
  function peoplesShown(pos, mode, id, flagMap, linked) {
    pos = normalizePeoples(pos);
    if (pos === "off") return false;
    const f = flagMap && typeof flagMap.get === "function" ? flagMap.get(id) || 0 : 0;
    if (mode === "personal") return f === 2;
    if (mode === "full") return pos === "all" ? true : f > 0;
    return pos === "all" ? true : !!(linked && linked.has(id));   // the plain map: no reader, no collections
  }
  /* the polities (states, peoples, cultures) any card at all names: the `pol:` ids of the index */
  function linkedPolities(idx) { const out = new Set(); if (idx) for (const id of idx.cardsOfPlace.keys()) if (POLITY.test(id)) out.add(id); return out; }
  /* the legend's words for each position, and the one-line note under the switch (what the position shows right now) */
  const PEOPLES_LABEL = { off: "Off", linked: "Peoples a card links", all: "All with a dated source" };
  function peoplesNote(pos, mode, n) {
    pos = normalizePeoples(pos);
    if (pos === "off") return "Peoples and cultures are hidden.";
    const count = n == null ? "" : " " + fmtN(n) + (n === 1 ? " is" : " are") + " on the map in this year.";
    if (mode === "personal") return "The Personal Atlas shows a people only when one of your cards links it." + count;
    return (pos === "all" ? "Every people and culture with a dated source." : "The peoples and cultures a card links.") + count;
  }
  /* the layer tests: which of a year's alive faces are drawn as presences, in what order. `alive` [{ face, ent, … }], `kindOfEnt(ent)` →
     the entity's kind, `visible(ent)` → the switch's answer. Returns { territory: […], presence: […] }, each in the input order */
  function splitAlive(alive, kindOfEnt, visible) {
    const territory = [], presence = [];
    for (const a of alive || []) { const k = kindOfEnt(a.ent); if (isPresence(k)) { if (visible(a.ent)) presence.push(a); } else territory.push(a); }
    return { territory, presence };
  }



  /* THE FRONT LINE (Phase 2d; design §2.4 and §7): four entities of kind `front` (Axis-held, Axis-occupied, Allied-held, Allied-occupied ground), dated steps
     (YYYYMMDD, never interpolated). Whether they are drawn follows the cards that teach them: the Personal Atlas draws them only when the reader has studied
     the Second World War's card (flag 2 on a front entity), the Full Atlas when a collection that owns it is on (flag > 0), the plain Map always; and only
     while the legend's switch is on. */
  function frontsShown(on, mode, id, flagMap) {
    if (!on) return false;
    const f = flagMap && typeof flagMap.get === "function" ? flagMap.get(id) || 0 : 0;
    if (mode === "personal") return f === 2;
    if (mode === "full") return f > 0;
    return true;
  }
  const dateOf = (n) => { const s = String(n); return { y: Number(s.slice(0, -4)), m: Number(s.slice(-4, -2)), d: Number(s.slice(-2)) }; };
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = (n) => { const q = dateOf(n); return q.d + " " + MONTHS[q.m - 1] + " " + q.y; };
  /* Phase 4 / 0d: memoised — a year change asks for the same 138 plate dates again and again (autoFrontDate, platesAt), and the string work was the front's share of a year change's cost */
  const _dateInts = new Map();
  const dateInt = (iso) => { let v = _dateInts.get(iso); if (v === undefined) { v = Number(String(iso).replace(/-/g, "")); if (_dateInts.size < 4096) _dateInts.set(iso, v); } return v; };
  const _nf = typeof Intl !== "undefined" ? new Intl.NumberFormat("en-GB") : null;   // toLocaleString builds a formatter every call; a year change formats two counts
  const fmtN = (n) => (_nf ? _nf.format(n) : String(n));
  /* the date the front shows when the reader has only chosen a YEAR: the last day of it any plate stands for (31 December where one does; the end of the last plate's window
     in 1945), or null when no plate stands in the year. `plates`: [{ date: "YYYY-MM-DD", end: "YYYY-MM-DD" }] */
  function autoFrontDate(plates, year) {
    let best = null; const lo = year * 10000 + 101, hi = year * 10000 + 1231;
    for (const p of plates || []) { const a = dateInt(p.date), b = dateInt(p.end); if (b < lo || a > hi) continue; const d = Math.min(b, hi); if (best == null || d > best) best = d; }
    return best;
  }
  /* the plates standing on a date (one per theatre at most) and the dates a reader can step between: the distinct plate dates, in order */
  const platesAt = (plates, d) => (plates || []).filter((p) => dateInt(p.date) <= d && d <= dateInt(p.end));
  const plateDates = (plates) => [...new Set((plates || []).map((p) => dateInt(p.date)))].sort((a, b) => a - b);
  function stepPlate(plates, d, dir) {
    const l = plateDates(plates); if (!l.length) return null;
    if (dir > 0) { const n = l.find((x) => x > d); return n == null ? null : n; }
    const prev = l.filter((x) => x < d); if (!prev.length) return null;
    // from the middle of a plate's standing window, "previous" is that plate's own date first
    const cur = l.filter((x) => x <= d); const own = cur.length ? cur[cur.length - 1] : null;
    return own != null && own < d ? own : prev[prev.length - 1];
  }

  /* ================= WARS (Phase 2d; docs/atlas-v2-design.md §7 "Phase 2d — as built") =================
     atlas/data/wars.js (window.ATLAS_WARS.wars) says, for each war card, its two sides as the entities of the history file they name, with the years each
     is on its side: { t: term, y: [from, to], g: 1 if the card GROUPS other wars, v|l: { n: name, m: [[entityId, from, to]…], x: authored-extent entity id | "", u: [unresolved names] } }.
     Everything here is pure arithmetic over that table: which wars are drawn (the switch, the study mode, the card), which entities are tinted in a year
     and in which role, and the sentences the place card says. A year with no member alive draws nothing (a gap is a gap). */
  /* Phase 4, task 0a (owner's decision from 2d): the default is "auto" — wars are OFF on the plain Map (so the states keep their colours while a reader scrubs the rail)
     and ON in the Personal Atlas and for a war chosen from a card (`focus`, below, which no switch overrides). "off" and "on" are the reader's own choice and hold in every mode. */
  const WARS_POSITIONS = ["auto", "off", "on"], WARS_DEFAULT = "auto";
  const normalizeWars = (v) => (WARS_POSITIONS.includes(v) ? v : WARS_DEFAULT);
  const WARS_LABEL = { auto: "Automatic", off: "Off", on: "On" };
  /* what a position means in a mode: auto is on only in the Personal Atlas */
  const warsEffective = (pos, mode) => { const p = normalizeWars(pos); return p === "auto" ? (mode === "personal" ? "on" : "off") : p; };
  const ROLE = { victor: 1, loser: 2 };
  const fmtY = (y) => (y < 0 ? (-y) + " BCE" : y === 0 ? "1 BCE" : y + " CE");
  const fmtSpan = (a, b) => (a === b ? fmtY(a) : fmtY(a) + " – " + fmtY(b));
  /* the wars drawn, as a Set of card ids. o: { pos (the switch), mode (map|personal|full), cardSet (the studied cards that carry a place), hidden (collections switched off),
     info(cardId) → { collId }, focus (a war chosen from a place card or a deep link: drawn whatever the switch, the mode and the card's grouping say) }.
     A war that GROUPS others (war.group) is drawn only when chosen: the Personal and Full Atlas skip it so the same ground is not drawn twice in the same years. */
  function warsShown(wars, o) {
    o = o || {}; const out = new Set(); wars = wars || {};
    if (o.focus && wars[o.focus]) out.add(o.focus);
    if (warsEffective(o.pos, o.mode) === "off") return out;
    const off = o.hidden instanceof Set ? o.hidden : new Set(o.hidden || []);
    for (const id of Object.keys(wars)) {
      if (wars[id].g) continue;
      if (o.mode === "personal") { if (!o.cardSet || !o.cardSet.has(id)) continue; }
      else if (o.mode === "full") { const i = o.info ? o.info(id) : null; if (i && i.collId && off.has(i.collId)) continue; }
      out.add(id);
    }
    return out;
  }
  /* the entities tinted in a year: Map entityId → { role: 1 victor | 2 loser | 3 both, wars: [card ids] }. A member counts in the years of its window; an extent
     (`x`) in the war's own years. A year outside every shown war's years returns an empty map. */
  function warRoles(wars, shown, y) {
    const out = new Map();
    for (const id of shown || []) {
      const w = wars && wars[id]; if (!w || y < w.y[0] || y > w.y[1]) continue;
      for (const [k, flag] of [["v", 1], ["l", 2]]) {
        const side = w[k]; if (!side) continue;
        const ids = side.m.filter((m) => m[1] <= y && y <= m[2]).map((m) => m[0]); if (side.x) ids.push(side.x);
        for (const e of ids) { const cur = out.get(e); if (cur) { cur.role |= flag; if (!cur.wars.includes(id)) cur.wars.push(id); } else out.set(e, { role: flag, wars: [id] }); }
      }
    }
    return out;
  }
  const roleWord = (role) => (role === 3 ? "both sides" : role === 2 ? "loser" : role === 1 ? "victor" : "");
  /* the wars an entity fought in, for its place card: [{ id, term, y, role: "victor"|"loser", own, against: [names], mates: [names], authored }]. `authored`: the entity IS an
     authored extent (Folio's own approximation); `side.authored` below tells the card which of a war's two sides is one. */
  function warsOfEntity(wars, entityId) {
    const out = [];
    for (const id of Object.keys(wars || {}).sort()) {
      const w = wars[id];
      for (const [k, other, role] of [["v", "l", "victor"], ["l", "v", "loser"]]) {
        const side = w[k]; if (!side) continue;
        const win = side.m.filter((m) => m[0] === entityId).map((m) => [m[1], m[2]]);
        if (side.x === entityId) win.push(w.y.slice());
        if (!win.length) continue;
        out.push({ id, term: w.t, y: w.y.slice(), group: !!w.g, role, own: side.n, against: w[other].n, window: win, authored: side.x === entityId });
      }
    }
    return out;
  }
  /* the sentence a war says about itself, for a place card or a screen reader: who fought on which side, the years, which sides are authored extents.
     `nameOf(entityId)` is optional (the entity's own name); the side's `n` is the card's own name for it. */
  function warSentence(w) {
    if (!w) return "";
    const side = (s, word) => {
      const bits = [s.n + " (" + word + ")"];
      const ext = s.x ? " — drawn as an authored extent: Folio’s own approximation, not a surveyed border" : "";
      const part = s.m.length && s.m.some((m) => m[1] > w.y[0] || m[2] < w.y[1]) ? " (" + s.m.filter((m) => m[1] > w.y[0] || m[2] < w.y[1]).map((m) => m[0].replace(/^pol:/, "") + " " + fmtSpan(m[1], m[2])).join(", ") + ")" : "";
      const un = s.u && s.u.length ? "; not on the map, no entity for: " + s.u.join(", ") : "";
      return bits[0] + part + ext + un;
    };
    return (w.t || "") + " · " + fmtSpan(w.y[0], w.y[1]) + " · " + side(w.v, "victors") + " against " + side(w.l, "losers");
  }

  const api = { fmtN, LIST_CAP, parse, studied, collections, flags, tappableSet, STACK_PX, cityMembership, stackGroups, MARK_CLASSES, markClass, capitalIds, LABEL_WRAP, LABEL_SHORT, labelText, bareName, shortName, summary, cardsFor, markHalf, markShape, markScale, markLine, ringHalf, MARK_SMALL, MARK_LINE_MIN, RING_MIN_PX, STACK_FONT_PX, markLayer, nearMarks, fanOut, yearsNote, framing, isNewDiscovery, isPresence, layerOf, kindWord, PEOPLES_POSITIONS, PEOPLES_DEFAULT, PEOPLES_LABEL, normalizePeoples, peoplesShown, linkedPolities, peoplesNote, splitAlive, isExtent, isFront, frontsShown, fmtDate, dateInt, dateOf, autoFrontDate, platesAt, plateDates, stepPlate, WARS_POSITIONS, WARS_DEFAULT, WARS_LABEL, warsEffective, ROLE, normalizeWars, warsShown, warRoles, warsOfEntity, warSentence, roleWord, fmtSpan };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.AtlasStudy = api;
})(typeof window !== "undefined" ? window : globalThis);
