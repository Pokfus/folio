/* Folio — the avatar scene: the figure, its six slots, and the scene it stands in (Sep 2026, on request)

   > "Every user should have a 2D full-body avatar … collected artefacts, instead of being displayed in
   > four tiles on the account page, can instead be equipped by the avatar … Scenes are history inspired
   > … The whole scene should be displayed in a large box at the top of the Account page."

   FIVE THINGS HERE FAIL WITHOUT ANYTHING LOOKING WRONG, which is why this is a suite rather than a look
   at the page.

   · **THE BOX'S RATIO AND THE ART'S RATIO ARE THE SAME FACT.** Every anchor in avatar.js is a percentage
     of the box, so the moment the box stops being 3:2 the scene is cropped and every anchor points at
     the wrong part of a cropped picture — the figure stands above a floor line that has been cut away.
     It shipped that way for an hour, because `max-height` beside `aspect-ratio` does not scale a box, it
     OVERRIDES the ratio. Nothing throws and the picture still looks like a picture.
   · **THE SLOT COLUMN CAN COLLAPSE TO A SLIVER.** `flex:1 1 0` plus `aspect-ratio:1` in a column is
     circular — the height comes from the flex line and the line's width comes from the items — so the six
     slots rendered as a 4px stripe of colour down the edge of the scene. A reader sees a scene with no
     controls, which reads as a feature that was never built.
   · **A GATE THAT STOPS REFUSING IS INVISIBLE.** `setEquip` is what keeps an artefact the reader does not
     own, or one tagged for another slot, out of a loadout that SYNCS to every device they have. The
     picker only offers what is legal, so a broken gate cannot be seen from the page at all.
   · **A MIGRATION RUNS ONCE OR IT UNDOES THE READER.** The showcase's first pin becomes what stands on
     the display object; running it again would put an artefact back every time the account page opened,
     so taking it off would look like the site refusing to be changed.
   · **AND RESET PROGRESS MEANS WHAT IT SAYS.** The LOOK is kept (a preference, like the theme) and the
     loadout and scenes go with the artefacts they were bought with. Getting the split backwards deletes
     something the dialog promised to keep, and it is found afterwards.

   THE LOGIC HALF IS REACHED THROUGH A PATCHED app.js, exactly as test-photo.js reaches the cropper: the
   account page's own controls live behind a Supabase sign-in, and mocking auth to reach them would test
   the mock. The patch appends ONE line inside the IIFE and the suite fails if the tail it appends to is
   not found, so a refactor cannot leave it quietly testing nothing.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-avatar.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */

const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.join(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const HOOK = "\n  window.__av = { setEquip, equipped, equipCandidates, artefactSlotOf, avatarLook, setAvatarLook, currentScene, lockedScenes, unlockScene, rollChestItem, avatarMigrateShowcase, resetProgress, isEquipped, avatarSceneHTML, S: () => S };\n";

let pass = 0, fail = 0, patched = false;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(ROOT, p);
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); res.end(""); return; }
    if (p === "/app.js") {
      const t = data.toString("utf8");
      const at = t.lastIndexOf("})();");
      if (at >= 0) { data = Buffer.from(t.slice(0, at) + HOOK + t.slice(at), "utf8"); patched = true; }
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
    res.end(data);
  });
});

/* Enough of a collection to fill every slot, plus one artefact deliberately in the WRONG slot's hands
   and one deliberately NOT owned — the two the gate exists to refuse. */
const SEED = {
  artefacts: { gladius: 1, "sutton-hoo-helmet": 1, "celtic-gold-torc": 1, "rosetta-stone": 1 },
  scenes: { rome: 1 },
  equip: {},
};

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM || undefined });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => { if (!isNoise(String(e.message || e))) errs.push(String(e.message || e)); });
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errs.push(m.text()); });

  /* ---------- 1. the manifest stays off the eager path ---------- */
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  check("avatar.js is NOT a <script> in index.html (it is the `avatar` lazy bundle)", !/avatar\.js/.test(html));
  check("app.js registers the avatar bundle", /avatar:\s*\{\s*files:\s*\["avatar\.js"\]/.test(fs.readFileSync(path.join(ROOT, "app.js"), "utf8")));

  await page.goto(base + "#home", { waitUntil: "load" });
  await page.waitForTimeout(800);
  check("the patched build exposes the avatar internals", patched && (await page.evaluate(() => typeof window.__av)) === "object");

  await page.evaluate((seed) => {
    const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    Object.assign(s, seed);
    localStorage.setItem("folio_v1", JSON.stringify(s));
  }, SEED);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__av && null);
  // the manifest is lazy, so ask for it before testing anything that reads a scene
  await page.evaluate(() => new Promise((r) => { const t = setInterval(() => { if (window.AVATAR_ART) { clearInterval(t); r(); } }, 40); document.querySelector("[data-route='account']") && null; setTimeout(r, 4000); }));
  await page.goto(base + "#account", { waitUntil: "load" });
  await page.waitForTimeout(1200);

  /* ---------- 2. the box, the figure and the six slots ---------- */
  const geo = await page.evaluate(() => {
    const box = document.querySelector(".avs-box");
    if (!box) return null;
    const r = box.getBoundingClientRect();
    const slots = [...document.querySelectorAll(".avs-slot")].map((e) => e.getBoundingClientRect());
    return {
      ratio: r.width / r.height,
      w: Math.round(r.width),
      slots: slots.length,
      minSlot: Math.round(Math.min(...slots.map((s) => Math.min(s.width, s.height)))),
      square: slots.every((s) => Math.abs(s.width - s.height) < 2),
      fig: !!document.querySelector(".avs-fig svg"),
      bg: !!document.querySelector(".avs-bg svg, .avs-bg img"),
      edit: !!document.querySelector("#avsEdit"),
      labels: [...document.querySelectorAll(".avs-slotlbl")].map((e) => e.textContent.trim()),
    };
  });
  check("the scene box is drawn on the account page", !!geo);
  check("its ratio is the art's own 3:2, so every anchor means what it says", geo && Math.abs(geo.ratio - 1.5) < 0.02, geo ? geo.ratio.toFixed(3) : "");
  check("the figure is drawn", geo && geo.fig);
  check("the scene backdrop is drawn", geo && geo.bg);
  check("six slots, and none of them collapsed", geo && geo.slots === 6 && geo.minSlot > 24, geo ? geo.minSlot + "px" : "");
  check("every slot is a square", geo && geo.square);
  check("the slots are named head / body / jewellery / hand / display / scene", geo &&
    JSON.stringify(geo.labels.map((s) => s.toLowerCase())) === JSON.stringify(["head", "body", "jewellery", "hand", "on display", "scene"]), geo ? geo.labels.join("|") : "");
  check("your own scene carries the appearance pencil", geo && geo.edit);

  /* ---------- 3. the gate ---------- */
  const gate = await page.evaluate(() => {
    const A = window.__av;
    const out = {};
    A.setEquip("hand", "");
    out.ownedOK = A.setEquip("hand", "gladius") && (A.equipped(A.S(), "hand") || {}).id === "gladius";
    out.unowned = A.setEquip("hand", "ulfberht-sword") === false;          // a real artefact this reader has not found
    out.wrongSlot = A.setEquip("head", "gladius") === false;               // tagged `hand`, offered nowhere else
    out.nonsense = A.setEquip("hand", "not-an-artefact") === false;
    out.badSlot = A.setEquip("elbow", "gladius") === false;
    // one artefact cannot be in two places at once
    A.setEquip("object", "gladius");
    out.moved = (A.equipped(A.S(), "object") || {}).id === "gladius" && A.equipped(A.S(), "hand") === null;
    out.cleared = A.setEquip("object", "") && A.equipped(A.S(), "object") === null;
    // the display object takes anything owned; a body slot takes only what is tagged for it
    out.displayAny = A.setEquip("object", "rosetta-stone") && (A.equipped(A.S(), "object") || {}).id === "rosetta-stone";
    out.handCands = A.equipCandidates(A.S(), "hand").map((a) => a.id);
    out.headCands = A.equipCandidates(A.S(), "head").map((a) => a.id);
    out.objCands = A.equipCandidates(A.S(), "object").length;
    return out;
  });
  check("an owned, correctly tagged artefact equips", gate.ownedOK);
  check("an artefact the reader does not own is refused", gate.unowned);
  check("an artefact tagged for another slot is refused", gate.wrongSlot);
  check("an id that is not an artefact at all is refused", gate.nonsense);
  check("a slot that does not exist is refused", gate.badSlot);
  check("equipping elsewhere takes it out of the slot it was in", gate.moved);
  check("a slot can be emptied", gate.cleared);
  check("the display object takes any owned artefact", gate.displayAny);
  check("the hand picker offers only hand-tagged artefacts", JSON.stringify(gate.handCands) === JSON.stringify(["gladius"]), gate.handCands.join("|"));
  check("the head picker offers only head-tagged artefacts", JSON.stringify(gate.headCands) === JSON.stringify(["sutton-hoo-helmet"]), gate.headCands.join("|"));
  check("the display picker offers everything owned", gate.objCands === 4, String(gate.objCands));

  /* ---------- 4. the scene falls back rather than being written ---------- */
  const sc = await page.evaluate(() => {
    const A = window.__av, S = A.S();
    const out = {};
    out.owned = A.setEquip("scene", "rome") && A.currentScene(S).id === "rome";
    S.equip.scene = "a-scene-that-does-not-exist";
    out.unknownFallsBack = A.currentScene(S).free === true;
    S.equip.scene = "";
    out.emptyFallsBack = A.currentScene(S).free === true;
    out.freeNeverStored = !(S.scenes || {})[A.currentScene(S).id];
    out.lockedRefused = A.setEquip("scene", "not-a-scene") === false;
    return out;
  });
  check("an owned scene is worn", sc.owned);
  check("an unknown scene falls back to the free one", sc.unknownFallsBack);
  check("an empty scene falls back to the free one", sc.emptyFallsBack);
  check("the free scene is never written into the owned register", sc.freeNeverStored);
  check("a scene that does not exist is refused", sc.lockedRefused);

  /* ---------- 5. a chest can hold a scene ---------- */
  const drop = await page.evaluate(() => {
    const A = window.__av, S = A.S();
    S.scenes = {};                       // nothing but the free one
    const kinds = {};
    for (let i = 0; i < 4000; i++) { const it = A.rollChestItem(); if (it) kinds[it.kind] = (kinds[it.kind] || 0) + 1; }
    const before = A.lockedScenes().length;
    A.unlockScene("rome");
    return { kinds, before, after: A.lockedScenes().length, twice: A.unlockScene("rome") === false, freeRefused: A.unlockScene(A.currentScene(S).id) === false };
  });
  check("a chest can roll a scene", (drop.kinds.scene || 0) > 0, JSON.stringify(drop.kinds));
  check("…and still rolls artefacts and themes", (drop.kinds.artefact || 0) > 0);
  check("unlocking a scene takes it out of the pool", drop.before > drop.after);
  check("a scene is never unlocked twice", drop.twice);
  check("the free scene is not a droppable one", drop.freeRefused);

  /* ---------- 6. the migration runs once ---------- */
  const mig = await page.evaluate(() => {
    const A = window.__av, S = A.S();
    S.showcase = ["rosetta-stone", "gladius"];
    S.equip = {};
    A.avatarMigrateShowcase();
    const first = (S.equip || {}).object;
    A.setEquip("object", "");                 // the reader takes it off again
    A.avatarMigrateShowcase();                // …and the page is opened a second time
    return { first, again: (S.equip || {}).object || "", kept: (S.showcase || []).length };
  });
  check("the showcase's first pin becomes what stands on the display object", mig.first === "rosetta-stone", mig.first);
  check("…and the migration does not put it back once taken off", mig.again === "", mig.again || "(empty)");
  check("S.showcase is left alone, for a device still on the previous build", mig.kept === 2);

  /* ---------- 7. reset progress keeps the look and clears the loadout ---------- */
  const reset = await page.evaluate(() => {
    const A = window.__av, S = A.S();
    A.setAvatarLook("skin", "s5");
    A.setAvatarLook("hair", "h3");
    S.artefacts = { gladius: 1 };
    A.setEquip("hand", "gladius");
    S.scenes = { rome: 1 };
    A.resetProgress();
    const look = A.avatarLook(S);
    return { skin: look.skin, hair: look.hair, equip: Object.keys(S.equip || {}).filter((k) => k !== "_sc").length, scenes: Object.keys(S.scenes || {}).length, artefacts: Object.keys(S.artefacts || {}).length };
  });
  check("Reset progress KEEPS the look — it is a preference, like the theme", reset.skin === "s5" && reset.hair === "h3", reset.skin + "/" + reset.hair);
  check("…and clears the loadout, which the artefacts paid for", reset.equip === 0, String(reset.equip));
  check("…and the scenes, with the artefacts they were drawn beside", reset.scenes === 0 && reset.artefacts === 0);

  /* ---------- 8. a friend's scene is read-only ----------
     The SAME builder draws your scene and theirs; one `own` flag decides whether a slot is a control.
     If that flag stopped reaching the markup nothing would look wrong — a friend's profile would simply
     offer buttons that write to YOUR loadout, which is the one failure here with a consequence. */
  const ro = await page.evaluate(() => {
    const A = window.__av, S = A.S();
    S.artefacts = { gladius: 1, "rosetta-stone": 1 };
    S.equip = { hand: "gladius", object: "rosetta-stone" };
    const mine = A.avatarSceneHTML(S, true), theirs = A.avatarSceneHTML(S, false);
    const box = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d; };
    const m = box(mine), t = box(theirs);
    return {
      mineButtons: m.querySelectorAll("button.avs-slot").length,
      minePencil: !!m.querySelector(".avs-edit"),
      theirsButtons: t.querySelectorAll("button").length,
      theirsSlots: t.querySelectorAll(".avs-slot").length,
      theirsFigure: !!t.querySelector(".avs-fig svg"),
      theirsItem: !!t.querySelector(".avs-item"),
    };
  });
  check("your own six slots are buttons", ro.mineButtons === 6, String(ro.mineButtons));
  check("…and your own scene has the pencil", ro.minePencil);
  check("a friend's scene carries no buttons at all — not a slot, not the pencil", ro.theirsButtons === 0, String(ro.theirsButtons));
  check("…but still shows all six slots and what is in them", ro.theirsSlots === 6 && ro.theirsFigure && ro.theirsItem);

  check("no console errors while the scene was drawn and driven", errs.length === 0, errs.slice(0, 3).join(" | "));

  /* ---------- 9. the phone lays the slots out as a row a thumb can hit ---------- */
  await page.setViewportSize({ width: 390, height: 840 });
  await page.waitForTimeout(600);
  const phone = await page.evaluate(() => {
    const slots = [...document.querySelectorAll(".avs-slot")].map((e) => e.getBoundingClientRect());
    const box = document.querySelector(".avs-box").getBoundingClientRect();
    if (!slots.length) return null;
    return {
      row: Math.abs(slots[0].y - slots[5].y) < 2,
      min: Math.round(Math.min(...slots.map((s) => s.width))),
      belowBox: slots[0].y >= box.bottom - 1,
      fits: slots[5].right <= document.documentElement.clientWidth + 1,
    };
  });
  check("on a phone the six slots are a row, not a column", phone && phone.row);
  check("…under the scene rather than over it", phone && phone.belowBox);
  check("…at a size a thumb can hit", phone && phone.min >= 40, phone ? phone.min + "px" : "");
  check("…and the row fits the screen", phone && phone.fits);

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
