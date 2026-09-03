# The avatar — a figure, a scene, and six slots

**Read this before touching the `THE AVATAR` block in app.js, `avatar.js`, the `.avs-*` styles, the
scene box on the account page, or an artefact's `slot`.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary — the three state fields, what
goes in each slot, and which of them survive a reset. This file carries the rest: why the art lives
outside the code, why every coordinate is a percentage, what the four-tile showcase left behind, and
the four faults that were found by looking at the page rather than by anything throwing.

---

## What it is

The account page opens on a scene. A drawn figure stands in a historical setting — a study, a Roman
colonnade — wearing the artefacts the reader has equipped, with one artefact set down on the scene's
own display object (a desk, an altar) and six square slots saying what is in each: **head, body,
jewellery, hand, on display, scene**. A pencil in the corner opens the appearance editor. The bottom
edge of the box fades into the page.

It replaces the **four-tile showcase**, which was the same idea with no picture: four artefacts a
reader had pinned to be seen holding, drawn as a row of tiles.

Asked for in Sep 2026:

> "I want every user to have a 2D full-body avatar which should be displayed at the top of the Account
> page. With an edit icon users can change the physical appearance of their avatar. Collected artefacts,
> instead of being displayed in four tiles on the account page, can instead be equipped by the avatar.
> Historical weapons can be carried, outfits and jewelry can be worn, and other items can be put on
> display on an object (e.g. an altar, desk, etc.). The object changes depending on the scene, which
> users can now also collect from chests."

---

## The art is not in the code, and that is the whole shape of it

Folio had no image assets at all before this: `icon.svg` and hand-written inline SVG were the whole of
its artwork, and the golden rule is that **a picture is a LINK, never an upload**. This is the first
thing on the site that wants drawn art of its own, and the decision taken with the reader was
**committed sprite files** — a real asset class, deliberately.

Which leaves a gap between the feature working and the art existing, and the gap is closed by
**`avatar.js` carrying both**. Every part declares a `src` (a sprite under `avatar/`) *and* an `svg`
(a flat placeholder drawn in the manifest); the renderer uses the file when there is one and the
placeholder when there is not. So:

- the feature is complete and looks deliberate before a single PNG is drawn;
- adding one is **dropping a file in a folder and setting `src`** — no code change, no layout change,
  nothing to keep in step;
- and the placeholders are drawn at the exact sizes and anchor points the final art uses, so a sprite
  that replaces one lands where it stood.

`avatar.js` is **lazy** (`DATA_BUNDLES.avatar`), fetched when the account page mounts and never
before. It is metadata plus line art — a few KB — because **the sprites are ordinary same-origin files
the browser fetches per layer**, so a reader only ever downloads the parts they are actually wearing.
`img-src 'self'` already covers them, so `_headers` needs no change; sw.js's stale-while-revalidate
caches them like any other same-origin asset.

### Recolouring a raster sprite

Skin and hair are reader-chosen colours, which flat art cannot be. A placeholder does it directly
(`fill="var(--avs-skin)"`); a sprite does it with a **mask**: the part carries `mask`, a
white-on-transparent PNG of the recolourable region, and the renderer paints a box of the chosen colour
through it with the fixed line art on top. **One file per region rather than one per colour** — six
skin tones × six hairstyles × six hair colours is 216 body sprites pre-rendered and 12 files masked.

The two techniques rejected: `filter: hue-rotate` on one base sprite (skin tones do not lie on a hue
circle — you get plausible hair and unconvincing skin, and it tints the outlines too), and
pre-rendered variants (the file count above).

---

## Every coordinate is a percentage

The box is fluid from a 390px phone to a wide stage, so **a position stated in pixels is right at
exactly one width**. There are two frames and each anchor names which it belongs to:

- a scene's `figure` and `object` anchors are percentages of the **scene box**;
- a slot anchor is a percentage of the **figure box**, so a sword stays in the hand holding it whatever
  scene is behind it and whatever size the box is.

The figure's parts all share one `viewBox` (`0 0 200 400`) and the scenes share another
(`0 0 600 400`). That is what lets them be stacked as plain layers with no per-part positioning: hair
drawn at the same scale as the head it sits on cannot drift from it.

**The box's ratio and the art's ratio are the same fact.** Every anchor is a percentage of the box, so
the moment the box stops being 3:2 the scene is cropped and every anchor points at the wrong part of a
cropped picture. See the faults below — this one shipped for an hour.

---

## The state: three fields, and the split is what makes Reset honest

| field | holds | kept on Reset progress? |
|---|---|---|
| `S.avatar` | the LOOK — skin, hair colour, hairstyle, face, build | **yes** (`RESET_KEEPS`) |
| `S.equip` | slot id → artefact id, and the scene in the `scene` slot | no |
| `S.scenes` | scene id → when it was drawn from a chest | no |

The look is a choice about how the reader wants to appear, exactly like the theme beside it in
`RESET_KEEPS`. The loadout and the scenes are what the *collection* bought, and they go with the
artefacts and chests they came from. One field could not have both semantics.

All three sync (they are in `PROGRESS_FIELDS`), which is what lets a friend's profile draw their
figure with no new request: an accepted friend may already read the progress blob.

**The scene falls back rather than being written.** `defaultState` stores no scene, and `currentScene`
resolves an empty or unknown one to whichever scene is `free`. A default written into the save would
sit in every existing reader's progress and shadow any later change to which scene is free.

---

## What can be equipped

`artefacts.js` gained an optional **`slot`** — `head`, `body`, `jewelry` or `hand` — validated in
`artefactSanitize` against the slot list rather than carried through as typed, because the field
decides what may appear on a profile and the admin overlay it can arrive through is a table any
signed-in admin can PATCH from a phone.

**Every artefact is eligible for the display object whatever its `slot` says.** That is not a
compromise: of the hundred, roughly twenty are wearable and eighty are pots, coins, tablets, sherds and
tools — and an altar is where a real object is set down, which is what most of this collection is.

Today: **8 head, 13 jewellery, 15 hand, 0 body, 64 display-only.** The body slot is deliberately empty
— there are no outfits in the artefact pool and there was never going to be one; it is the slot the
next collectible class fills. The picker's empty-state copy says so rather than reading as a broken
control: *"Nothing you have found belongs in this slot yet — what the figure is wearing turns up in
chests."*

Tagged in batches by `node .claude/add-artefact-slots.js <batch.json>`, which splices one line per
artefact rather than re-serialising the file (the lesson `add-card-tags.js` learned: a whole-file
rewrite normalises every entry's key order and turns a twenty-artefact change into a two-thousand-line
diff). `--report` prints the current tagging by slot. **The admin form carries the field too**, because
`draft()` there is a WHITELIST — a field the form does not offer is one the first admin edit silently
deletes.

### `setEquip` is the gate, and the picker is only a view

The picker offers what is legal and `setEquip` refuses everything else anyway: an unowned artefact, one
tagged for a different slot, an id that is not an artefact, a slot that does not exist, a scene that is
not owned. The loadout **syncs**, so a bad write would travel to every device the reader has, and the
picker cannot be the only thing standing between the two.

**An artefact cannot be in two places at once.** Equipping it anywhere takes it out of wherever it was
— a gladius worn in the hand *and* standing on the altar is one object drawn twice, which reads as a
bug rather than as a collection.

**And the slot is checked on the way OUT, not only on the way in** (`equipped`). An artefact retired
from the pool, or re-tagged into a different slot since it was equipped, would otherwise leave a slot
pointing at something that does not belong there — and the reader cannot fix what they cannot see. It
is the rule `showcaseIds` has always followed, for the same reason.

---

## Scenes are the third thing a chest holds

Beside an artefact and a theme, and built the same way: `lockedScenes()` is the pool, so a scene is
never a duplicate, and each kind is offered only while it still has something to give — so the three
cannot starve each other.

`SCENE_DROP` is **0.09**, deliberately below `THEME_DROP`'s 0.14. There are two scenes against a
hundred artefacts, and a chest is mostly for the Reliquary: a rate high enough to finish the set in a
week would make the artefacts the thing standing between a reader and the reward.

**A scene carries its own rarity**, where a theme does not — so the chest opening is sized by the
manifest rather than forced into the epic band a theme gets. The reveal offers **"Stand in it"** as the
primary action, for the theme's reason: a scene is a thing that *does* something, and leaving the
reader to find the Scene slot to use what they just won would make the reveal read as a certificate.

Adding a scene is an entry in `avatar.js` and nothing else — the drop, the picker and the slot follow.
A scene declaring `free: true` is the one everybody starts with.

Shipped: **the study** (common, free — shelves, daylight, a desk) and **Ancient Rome** (rare — a
colonnade above the hills, an altar of dressed stone).

---

## What the showcase left behind

`S.showcase` is still written and still synced, and it is **read exactly once**, by
`avatarMigrateShowcase`: the first pin becomes what stands on the display object, so a reader who chose
four artefacts to be seen holding does not arrive at an empty altar. It is deliberately **not cleared**
— a device still running the previous build reads that field, and clearing it here would empty that
device's profile.

The migration writes a marker (`S.equip._sc`) rather than testing whether the object slot is filled:
**a migration that runs every time the page opens undoes the reader**, putting the artefact back each
time they take it off, which looks like a site refusing to be changed.

`showcaseHTML` survives as **the head row alone** — the "See Reliquary" button. On a friend's profile
that is the only route to their collection: that page carries no inventory section and never had one.

The artefact **plate** now offers one button per slot ("Wear it" / "Put it on display" / "Take it
off") where it offered a single "Show on profile". Every button is re-read after any of them is
pressed, because of the one-place-at-a-time rule above.

---

## The four faults found by looking at the page

Each of these rendered perfectly while being wrong, which is what `.claude/test-avatar.js` exists for.

**1. `max-height` beside `aspect-ratio` does not scale a box — it overrides the ratio.** The box was
`aspect-ratio:3/2; max-height:420px`, so on a wide stage it became 800×420 (3:1.9) while the scene
inside it stayed 3:2. `object-fit:cover` cropped the difference, and every anchor — which is a
percentage of the *box* — pointed at the wrong part of a cropped picture: the figure stood above a
floor line that had been cut away, and the desk was half off the bottom. The fix is to cap the
**width** (`max-width:min(100%,640px)` on the wrap), which keeps the two ratios identical.

**2. `flex:1 1 0` plus `aspect-ratio:1` in a column is circular.** The item's height comes from the
flex line and the line's width comes from the items, so the six slots collapsed to a **4px stripe of
colour** down the edge of the scene. A reader sees a scene with no controls, which reads as a feature
that was never built. Stating each slot's height as a fraction of the column (`calc((100% - 20px)/6)`)
breaks the loop.

**3. The slots were inside the box, and the box carries the fade.** The bottom mask washed out the last
two slots into unreadable ghosts, and `overflow:hidden` clipped them. They are a **sibling** of the box
now — which is also what lets them leave the picture entirely on a phone, where six squares in a column
would be 29px each and cover a fifth of the only drawing on the page. Under it as a row they are 55px,
which a thumb can hit.

**4. A helmet drawn over the whole head is a mask.** The head placeholder covered the face, which on
the one drawing a reader has made their own is the difference between wearing something and being
replaced by it. It crowns the head and stops above the eyes.

One more that is not a fault but a certainty: **an artefact's picture is a link to somebody else's
file**, so a dead link would leave a broken-image glyph standing on the altar. A capture-phase `error`
listener on the host empties the slot instead — `error` does not bubble, and the listener is wired once
on the host rather than per image because the scene is rebuilt on every equip.

---

## The bottom fade is a mask, never a gradient overlay

An overlay fading to the page has to know what colour the page is, and there are sixteen themes, each
in light and dark, plus high contrast — so one of those thirty-odd combinations would always be wrong,
and the failure is a visible band across the reader's own avatar. A mask fades to **transparent**,
which is the paper whatever the paper happens to be, and needs no per-theme rule at all.

It fades over the last 16% of the box. It was 32% first, which washed out the whole lower third
including the altar and the figure's legs — a fade is an edge, not a vignette.

---

## Not built yet, and why the layers are separate anyway

**Idle animation.** Asked about and deliberately deferred. Every part is its own element rather than
one flat drawing precisely so it can be added without redrawing anything — a figure drawn as one image
can never breathe. When it lands it must go through `prefersReducedMotion()` like every other
JS-driven movement on the site.

**Outfits**, which is what the body slot is waiting for, and the natural second collectible class after
scenes.

**Drawn sprites.** Everything on screen today is a placeholder from `avatar.js`.
