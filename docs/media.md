# Pictures and clips on cards and glossary terms

**Read this before touching `cardImageHTML` / `cardVideoHTML` / `videoSource` / `openMediaViewer` /
`openImageViewer` / `openVideoViewer` / `retireOtherCardMedia` / `retireOtherGlossMedia` /
`renderGlossImage` / `glossImage` / `glossVideo` / `MEDIA_FIELDS` / `wireMediaSource` / `askMediaSource`,
the editors' media panel, or the `media-src` / `frame-src` CSP.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary — the shared five-field object, one
frame per card or term, links only with no upload path, `videoSource` as the single resolver and
security boundary, the alt-text field, the dead-link handling and the source gate. This file carries the
rest.

Six bullets, in the order they appeared in CLAUDE.md:

1. **Card image** — the 16:9 frame, the fullscreen viewer's zoom, pinch and pan, the pointer-capture
   retargeting that made a real finger unable to fire the tap toggle at all, the alt-text reasoning, and
   the dead-link treatment that differs for a reader and an author.
2. **Card video** — the accepted link shapes and why the regexes are the security boundary, the expand
   control at the top rather than the bottom, and why a video keeps its backdrop close.
3. **One media panel on the card surface** — the pasted URL deciding the store, and the three
   load-bearing details in what order things are settled.
4. **The media source gate** — staging, the `.af-reqnote`, the modal on `change`, and why the panels read
   `gate.staged()` rather than the store.
5. **Glossary video** — the shared frame, EN-view-only editing, and why the home tile stays image-only.
6. **Glossary image** — the float and why the slot must come first in `.gloss-body`, the max-not-shape
   sizing, the words waiting for the picture, and the home tile's profile plate.

- **Card image (optional):** `card.image = { src, title, desc, credit, alt }` — rendered by `buildBack` as a **16:9
  frame** (`.card-img`, `cardImageHTML`) at the top of the Background section, above the prose (the section now
  renders when a card has an image even without an abstract). Clicking it opens the **fullscreen viewer**
  (`openImageViewer`: wheel zoom toward the cursor 1–8×, **pinch zoom**, tap toggles 1↔2.5×, drag pans when
  zoomed, **only the × and Escape close**, `closeImageViewer()` runs in `render()`), with title/description/source
  in a bottom caption bar (a URL source becomes a link). One **delegated** document click/keydown listener opens
  it from any `.card-img` (study, previews, editor) via the figure's `data-img-*` attributes — no per-render wiring.
  **NOTHING INSIDE THE STAGE CLOSES IT** (Aug 2026, on request: "a click on the image itself should not close
  it; instead it should be possible to zoom in, especially on mobile, and only the X in the top right should
  close"). A click on the image toggled zoom and a click on the space around it CLOSED, which is the same
  gesture landing a few pixels apart doing opposite things — and a picture opened to be looked at is one a
  reader zooms and drags about, so a close-on-backdrop rule reads the end of every clumsy gesture as "done".
  **AND ON A REAL DEVICE THE TAP HALF COULD NOT FIRE AT ALL, WHICH IS WHY IT WAS REPORTED AS "A CLICK ON THE
  IMAGE CLOSES IT"** — the finding worth carrying furthest. `stage.setPointerCapture(e.pointerId)` on
  pointerdown **RETARGETS every later event for that pointer to the STAGE**, so the `e.target === im` the
  toggle tested at pointerup was false for a real finger or mouse even dead centre of the picture, and the
  close branch took every press. Whether the press landed on the picture is now recorded at POINTERDOWN,
  whose own target is resolved before the capture it sets. **A synthetic `PointerEvent` dispatched at an
  element bypasses that retargeting entirely**, so a test written with synthetic events passes on the broken
  code — which is why `test-video.js`'s ninth section drives real mouse and real touch, and why a gesture
  bug should be reproduced with real input before it is believed fixed.
  **A VIDEO KEEPS ITS BACKDROP CLOSE**, deliberately: the player owns every pointer inside its own frame
  (scrub, volume, fullscreen), so there is no zoom to protect and nothing but the frame to tap past.
  **PINCH IS THE HALF THAT MADE THE ZOOM REACHABLE AT ALL** — there was only a `wheel` handler, so on a phone
  the 1–8× range could not be reached and the tap toggle was the whole of it. Two pointers are tracked in a
  `Map`; the pinch holds whatever was under the fingers' midpoint under it (the wheel's zoom-to-cursor
  arithmetic, from a baseline captured when the second finger lands) and follows that midpoint as it moves.
  Three things it has to get right, and each fails quietly: a second finger **cancels the one-finger pan** or
  the two fight over `tx`/`ty`; **lifting either finger must not count as a tap**, or the end of every pinch
  toggles the zoom back (hence the `pinched` flag, which survives until the last pointer is up); and
  `.iv-live` **kills the `transform` transition while a gesture is in flight**, or the picture eases 180 ms
  behind the fingers. `.iv-stage` already carried `touch-action:none`, so the browser never takes the pinch
  for a page zoom.
  **`alt` is the text alternative, and it is a field of its own** (Aug 2026, on request: "add alt text for
  images, which can be added when editing/making cards"). Deliberately not a reuse of `title`: a title NAMES
  the picture for a reader who can already see it, where alt text has to DESCRIBE it to somebody who cannot,
  and folding the two together is the commonest way alt text ends up useless. `cardImageHTML` and the
  fullscreen viewer read `img.alt || img.title || "Card illustration"` — the generic string only where there
  is neither, since an image with no alternative at all is worse than a weak one. It rides in `MEDIA_FIELDS`,
  so the editor's one media panel, the source gate, the store and the clearing path all carry it with no
  special case; the row is hidden when the pasted URL is a VIDEO, which announces itself through its player.
  Carried through `uCardSanitize` / `uGlossSanitize`, and warned about (never refused) by `add-card.js` and
  `add-glossary.js` — most shipped images predate it.
  **A file that will not load is handled** (Aug 2026): there is deliberately no upload path, so every picture
  and clip anywhere in Folio is somebody else's URL and link rot is a certainty rather than an edge case.
  A delegated **capture-phase `error` listener** (`error` does not bubble) marks the figure `.media-dead`.
  A READER gets nothing — `display:none`, because a broken illustration is worse than none and there is
  nothing they can do about it — while an AUTHOR keeps the frame, labelled "This link doesn't load"
  (`.ces-img`/`.ces-vid`), being the one person who can fix it. The click and Enter handlers skip a dead
  figure so it can't open an empty viewer, a dead one inside a gloss popup hides the whole floated
  `.gloss-imgslot`, and the home page's Term-of-the-day plate (a bare `.term-img`, not a frame) is removed
  and gives the discovery row its 2:1 layout back. The editor's EN view has the
  four image fields (`data-imgfield` → `setCardImageEdit`), which — like i18n — deep-copies the object and stores it
  whole as an `image` delta (clearing every field stores a **null tombstone** that hides a shipped image);
  `serializeCardData` bakes `c.image` when it has a `src`, `revertCard` restores `p.image`. Image metadata is shared
  across languages (not in the i18n blocks).
- **Card video (optional):** `card.video = { src, title, desc, credit }` — the **same four fields and the same
  frame as the image** (`.card-img` plus a `.card-vid` modifier), rendered by `cardVideoHTML`.
  **ONE FRAME PER CARD: the image and the video are alternatives, never companions.** Every writer enforces
  it — `setCardImageEdit`/`setCardVideoEdit` (via `retireOtherCardMedia`), `uCardSetImage`/`uCardSetVideo`,
  the glossary pair (via `retireOtherGlossMedia`), and the deck-ingest sanitizers — and `buildBack`,
  `renderGlossImage`, `serializeCardData`, `serializeGlossary` and the publish payload all keep the rule as a
  backstop, **with the picture winning** so a hand-authored `data.js` carrying both renders as it always did.
  **`retireOtherCardMedia` asks `PRISTINE_CARDS`, not the live card**, when deciding whether to write a null
  tombstone: it runs on every keystroke, and by the second one the live field is already gone — reading it
  erased the tombstone the first keystroke wrote and the retired picture came back on the next reload.
  **Links only — there is deliberately no upload path**: the only place an
  uploaded file could live is inline as a data-URI, which for a curated card rides into `data.js` (eagerly
  downloaded by every visitor) and for a community deck into its published jsonb payload. Host it elsewhere,
  link it here. **`videoSource(src)`** is the single resolver → `{ kind: "youtube"|"vimeo"|"file", url }` or
  **null** for anything else, and null renders NOTHING (the editors show "Not a link Folio can play" rather
  than an empty box). YouTube (watch / youtu.be / embed / shorts / live, `?t=` carried over as `&start=`) and
  Vimeo become `<iframe>`s on **youtube-nocookie.com** / **player.vimeo.com**; a `.mp4/.m4v/.webm/.ogv/.ogg/.mov`
  URL becomes a `<video controls>`. **An iframe src is only ever built by `videoSource` from a matched video
  id — never from raw input**, which is what keeps a stranger's deck from framing an arbitrary page; the
  regexes are the security boundary, so don't loosen them to "anything that looks like an embed URL".
  The figure is **not** a `role="button"` like an image's (the player owns clicks inside it): the fullscreen
  viewer is reached by an explicit `.cv-expand` control, placed **top**-right because a `<video>`'s native
  control bar owns the bottom edge. `openImageViewer`/`openVideoViewer` both call **`openMediaViewer`**, which
  skips the zoom/pan wiring for video and just plays it big (`.iv-vid`). The delegated `.card-img` click
  listener returns early on a `.card-vid` unless the expand control was hit, and the Enter/Space handler skips
  it entirely (the control is a real `<button>`). Editing: `setCardVideoEdit` (curated, a `video` delta exactly
  like `image`, null tombstone and all) / `uCardSetVideo` (community); `serializeCardData` bakes `c.video`,
  `revertCard` restores `p.video`, publish sends `data.video`. `_headers` carries **`media-src 'self' https:`**
  and **`frame-src`** for the two embed hosts. `.ces-imgpanel[hidden]{display:none}` is
  **required** — the author `display:flex` beats the UA `[hidden]` rule, and without it the panel sits
  permanently open and the click-to-edit toggle does nothing. Guarded by `.claude/test-video.js` (89 assertions).

- **ONE media panel on the card surface** (Aug 2026, on request — it was two, with a `.ces-media-swap` pill
  between them). A card shows one frame, so the editor offers one slot (`#cesMediaSlot`) and one panel
  (`#cesMediaPanel`, fields `data-mediafield="src|title|desc|credit"`), and the pasted URL decides which of the
  two stores it lands in: **`videoSource(url)` already recognises every link the player can take, so anything it
  does not recognise is a picture.** Asking the author to classify a URL Folio can classify itself was the whole
  of the old two-box design. The stores stay separate underneath (`card.image` / `card.video`, and the one-frame
  rule the writers enforce) — only the editor stops making the distinction the author's problem.
  Three details are load-bearing. **`mediaKind` must be settled BEFORE the gate stages the value**, since the gate's
  own `input` listener is what calls `set()` — hence the listener `wireLiveCardEditor` installs on the URL box
  *ahead of* `wireMediaSource`. **Emptying the URL leaves `mediaKind` alone**, so the clear reaches whichever store
  actually holds the media instead of defaulting to the picture one. And **when the kind flips, the title,
  description and source are emptied first**, while `mediaKind` still names the old store: they described the old
  file, and a credit line silently re-attached to a new one is the same mistake as no credit at all (it also
  clears the old store, one frame per card, and the new URL then arrives uncredited and is held back). The gate's
  `kind` may now be a **getter** (`mediaKindLabel` unwraps it) so the "where does this come from?" modal words
  itself for whatever was just pasted. The glossary editors keep their own separate image/video panels.
- **Nothing is saved uncredited — the media source gate** (`wireMediaSource` / `askMediaSource`, beside
  `videoSourceLabel`). The editors save on every keystroke, so a picture URL pasted in and then forgotten
  about used to ship credited to nobody — the one mistake that stays invisible until someone else points it
  out. The gate sits **between a media panel's fields and the store**: while the source box is empty a typed
  URL is **staged only**, an `.af-reqnote` says so where it was typed (with an "Add the source" button), and
  a modal asks for the source the moment the URL field is left (`change`, not every keystroke). The whole
  staged object enters the store together as soon as a source exists; **clearing the source takes it back
  out**, so `src` and `credit` can never come apart in stored data. `render()` toasts on the way out if a
  panel is still pending, rather than losing the URL in silence. **All four surfaces use it**: the shared
  card surface's image + video panels (so the admin editor and the Studio both), the curated glossary
  editor, and the Studio's term form — each passing its own `get`/`set`/`after`, so the writers stay dumb.
  Because a staged picture is deliberately NOT in the store, the panels' meta rows, the slot renderers and
  `imgSet()`/`vidSet()` **read `gate.staged()`, never the store** (an author must see the picture they just
  pasted, flagged `.ces-media-pending`, not an "Add an image" box over a panel they have just filled in);
  the one-frame sync calls the *other* gate's `reload()`. It is **editor-side on purpose** — a hand-authored
  `data.js`, an imported deck file and an installed community deck are untouched, since this is a guard
  against forgetting while writing, not a validity rule imposed on other people's decks. `add-card.js` and
  `add-glossary.js` enforce the same rule at the content-pipeline end. Guarded by
  `.claude/test-media-source.js` (36 assertions).
- **Glossary video (optional):** `window.GLOSSARY_VIDEOS` (slug → the same object; `glossVideo(key)`,
  `ADMIN_EDITS.glossaryVideos`, baked by `serializeGlossary`), or `entry.video` inside `UGLOSS` for a
  community deck's own term. `renderGlossImage` puts it in the **same `.gloss-imgslot`** at the same fixed
  height — **one frame per term, like a card**, so setting one retires the other and the picture wins if a
  hand-authored `glossary.js` carries both. Edited in the curated glossary editor's **EN view only**
  (`data-gvidfield` → `setGlossVideoEdit`) and in the Studio's term form (`data-gvid` → `uGlossSetVideo`) —
  metadata is shared across languages, like an image's. The home page's Gloss-of-the-day plate stays
  image-only on purpose: it is a silhouette, not a player.
- **Glossary image (optional):** a term can carry the **same `{ src, title, desc, credit, alt }` object as a card**,
  read through `glossImage(key)` and rendered by `renderGlossImage` into the `.gloss-imgslot`, which is
  **floated to the TOP-RIGHT of the popup body** — so the opening sentences run down its left and the
  description resumes the popup's full width below it. It reuses `cardImageHTML`/`.card-img`, so the existing
  delegated
  listener opens the **shared** fullscreen viewer — no wiring of its own. The slot is therefore **first in
  `.gloss-body`, before `.gloss-dates`/`.gloss-desc`** — a float only wraps content that follows it, so don't
  move it back after the prose (both markup sites: `openGlossWin` and the admin glossary editor's preview).
  **In the popup the 150px height and the half-popup width are the picture's MAXIMUM, not its shape**
  (`.gloss-imgslot`, changed Aug 2026 on request): `max-height:150px` (170 on the mobile sheet),
  `max-width:50%` on the float, `object-fit:contain` — so within those limits the WHOLE picture is shown. It
  was a fixed height with `object-fit:cover`, which gave every popup one silhouette at the cost of cutting the
  sides off anything wider than half the popup — and a map, a diagram or a wide landscape is exactly the kind
  of picture a glossary term carries. A tall picture is now narrow and a wide one short, and both are whole.
  **THE WORDS WAIT FOR THE PICTURE** (`GLOSS_IMG_WAIT` / the `imgwait` block in `openGlossWin` /
  `.gloss-win[data-imgwait]`, Aug 2026, on a bug report: "the text loads before the image, so a split second
  after opening we see the text jump to make space for the picture"). That is exactly what a FLOAT of no
  intrinsic size does — the description lays out across the whole popup and re-wraps the instant the file
  arrives — and **nothing can reserve the right box in advance, because the box IS the picture's aspect
  ratio and no part of the entry records it**. So the body is held until the picture's size is known and
  released complete. Three things keep that from being a stall: a picture already in the browser's cache
  resolves SYNCHRONOUSLY (`img.complete`), which is the common case and where the attribute never reaches
  the DOM at all; the title bar is outside the held region, so the popup still answers the tap at once; and
  `GLOSS_IMG_WAIT` is a ceiling past which the words are worth more than the alignment. **The desktop
  placement waits with it** — `positionGlossBeside` measures the window, and measuring it before the
  picture has a size puts a too-short box on screen and then grows it, which is the same jump in another
  coat. A VIDEO needs none of this: its 16:9 box is stated in the stylesheet, so the slot has a size from
  the first frame.
  The **home page's Gloss-of-the-day tile**
  shows the same image to the right of the copy, but as a **profile-picture plate** — a 3:4 frame running the
  tile's full height and **bleeding to its top, bottom and right edges** (negative margins cancelling the
  `.exp-tile` padding, which is 18/20px in every theme; arcade's blanket `*{border-radius:0}` already flattens
  the plate's right corners), filled with `object-fit:cover` (crop biased to 40% so a portrait's subject isn't
  cut off), so the tile keeps one silhouette whatever shape the day's picture is (`.term-img`, a plain `<img>`
  — the tile is a `<button>`, so the `role="button"` figure can't be nested inside it); the discovery row
  splits **half and half** with the card of the day instead of 2:1 on days its term has one
  (`.explore-grid.has-term-img`) — at a third of the row the copy was down to four words a line. Curated terms live in
  `window.GLOSSARY_IMAGES` (slug → object, in `glossary.js`, baked by `serializeGlossary`); a community deck's
  terms carry `entry.image` inside `UGLOSS` and travel with the deck (the `user_gloss` `data` jsonb takes the
  whole term object, so publishing needed **no** schema change), re-sanitized on ingest by `uGlossSanitize` /
  written by `uGlossSetImage`. Editing: the curated glossary editor's **EN view only** (`data-gimgfield` →
  `setGlossImageEdit`, a whole-object `glossaryImages` delta with a null tombstone, exactly like the card image
  — image metadata is shared across languages), and the Studio's term form (`data-gimg`). **The viewer's
  `z-index` (9800) must stay above the gloss stack** — popups sit at 8000+ and the mobile sheet at 9600, and a
  gloss image opens the viewer *from inside* a popup; `focusGlossWin` renormalizes its counter at
  `GLOSS_Z_CAP` so a long session can't climb past it.
