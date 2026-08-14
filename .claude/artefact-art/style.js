/* ============================================================
   THE ARTEFACT ART STYLE CONTRACT
   ============================================================
   One copy of the recipe, read by .claude/gen-artefact-art.js and by anything that re-runs a
   single piece later. It is a MODULE rather than a string inside the generator precisely so a
   piece regenerated in six months is generated the same way as its ninety-nine neighbours — a
   prompt pasted into a chat window is a recipe nobody can reproduce.

   WHAT THIS IS FOR. Folio's artefact pictures are photographs from Wikimedia Commons: a hundred
   objects shot by a hundred people in a hundred museums under a hundred lights, which on the
   plate reads as a scrapbook rather than as a collection. These are stylised illustrations in
   the visual language of a game inventory item, generated FROM those photographs so the object
   on the page is the object in the museum.

   FIVE RULES, and every one of them is here because the obvious alternative is worse.

   1. GENERATE FROM THE PHOTOGRAPH, NEVER FROM THE NAME. Text-to-image invents a gladius;
      image-to-image restyles the actual Mainz sword, with its proportions, its pommel and its
      corrosion. Folio already owns a hand-reviewed photograph for 99 of the 100, which is the
      whole reason this is possible at all. A piece with no reference is NOT generated.

   2. THE FRAME IS CSS AND MUST NOT BE PAINTED. `.ar-winart .card-img` puts a 2px border in the
      artefact's own rarity colour around the plate's picture, and `--rar-*` is re-toned for
      night and for high contrast. Bake an ornate surround or an orange legendary glow into the
      pixels and it fights the theme, freezes the rarity into the image, and cannot be re-toned
      when somebody adjusts the palette. So: no frame, no border, no aura. The image is the
      OBJECT on an empty ground, and the site dresses it.

   3. DO NOT LET IT RESTORE THE OBJECT. This is the failure mode that matters, and a model's
      instinct runs straight into it: handed a chipped beaker it returns a whole one, handed a
      worn coin it returns a crisp one, handed a broken stele it completes the inscription. A
      restored artefact is a fabricated historical record standing next to prose held to a
      three-source citation bar. Hence FIDELITY below, which is the longest clause in the prompt
      and the one to strengthen first if the pilot disappoints.

   4. SCRIPT IS THE HARD CASE AND IS EXPECTED TO FAIL. No image model writes real cuneiform,
      hieroglyphs or a coin legend; it writes a convincing texture that means nothing. That is
      why the pilot deliberately includes a cuneiform tablet, a stele and a coin — not in hope,
      but so the line gets drawn on evidence. If inscribed objects come back with invented
      writing, the honest outcome is stylised art for objects and photographs for inscribed
      things, and `photo` staying on the entry is what makes that mixture possible.

   5. STYLE CONSISTENCY COMES FROM AN EXEMPLAR, NOT FROM ADJECTIVES. Prose can describe a look;
      it cannot pin one across a hundred calls. The lever that actually works is passing an
      already-approved piece as a second input image on every subsequent call. Round 1 has no
      exemplar and will drift; you pick the best of it and every later round is generated
      against that one. See --exemplar in the generator.

   The output is SQUARE because both places it renders are square: `.ar-img` on the collection
   tile and `.ar-winart .card-img` on the plate are each `aspect-ratio:1/1`.
   ============================================================================================ */

"use strict";

/* The look. Kept as separate clauses rather than one paragraph so a single one can be tuned
   between rounds without rewriting the lot, and so the diff of a tuning run is readable. */
const LOOK = [
  "A stylised game-item icon: a single historical artefact rendered in the visual language of a high-fantasy RPG inventory item.",
  "Digital painting with visible painterly brushwork and crisp edge definition. Illustrative, not photographic. No cel shading, no black outline, no vector flatness.",
  "Three-quarter view from slightly above. The object is centred and upright and fills about 80 percent of the square frame.",
  "One hard key light from the upper left, a warm rim light along the opposite edge, and deep clean shadow falloff that models the form.",
  "The background is an empty flat dark desaturated radial vignette. Nothing else is in the frame.",
  "A rich but muted earth palette. Material reads at a glance: bronze reads as bronze, fired clay as fired clay, worked flint as worked flint.",
].join(" ");

/* The accuracy clause. This is the load-bearing paragraph — see rule 3 above. It is stated
   positively ("reproduce exactly") and then negatively ("do not restore"), because a model
   handed only the positive form still tidies the object up. */
const FIDELITY = [
  "Reproduce the object in the reference photograph exactly.",
  "Keep its true shape, proportions and construction, and keep its condition: every chip, crack, dent, corrosion patch, worn edge and missing piece stays exactly where it is and exactly as severe as it is.",
  "Do not restore it, do not complete it, do not clean it, do not straighten it, do not make it symmetrical.",
  "Reproduce only the ornament, inscription, relief and pattern actually present, in their real positions; invent none, and do not extend a pattern into an area where the real object has none.",
  "Change the lighting, the rendering style and the background. Change nothing about the object itself.",
].join(" ");

/* Everything that must not be in the frame. The first group is rule 2 (the site owns the frame),
   the second is furniture a museum photograph carries and an item icon must not, the third is
   the model's own habits. */
const EXCLUDE = [
  "no frame", "no border", "no ornamental surround", "no cartouche",
  "no rarity glow", "no coloured aura", "no magical particles", "no sparkles", "no lens flare",
  "no text", "no caption", "no title", "no watermark", "no signature", "no logo",
  "no user interface", "no inventory slot", "no tooltip", "no rarity gem",
  "no museum case", "no vitrine", "no display stand", "no mount", "no plinth", "no scale bar", "no accession label", "no ruler",
  "no hands", "no people", "no mannequin",
  "no landscape", "no scenery", "no room", "no table", "no ground plane", "no cast shadow on a surface",
  "no second object", "no duplicate of the object", "no exploded view", "no multiple angles",
].join(", ");

/* Silhouette hints. A square frame is kind to a jar and cruel to a sword, and left alone the
   model answers by shrinking a long object until it is a stripe in the middle of a lot of
   vignette. Set per artefact in PILOT below; SHAPES.default carries the ordinary case. */
const SHAPES = {
  default: "",
  tall:
    "The object is long and narrow. Lay it diagonally across the square, corner toward corner, so it fills the frame at its true proportions. Do not shorten it and do not shrink it to fit.",
  flat:
    "The object is a flat disc or plaque. Tilt it a little off face-on so the key light rakes across the relief and the depth of the carving reads. Do not present it perfectly flat and straight on.",
  small:
    "The object is small in life. Fill the frame with it as though it were being examined closely; render the surface at that scale, with the tool marks and wear visible. Do not add anything to the frame to suggest scale.",
  vessel:
    "The object is a vessel. Keep the profile of the body, the neck and the handles exactly as the reference has them, and keep any painted or incised decoration in its real position on the body.",
};

/* Build the prompt for one artefact. `hint` is a SHAPES key, `note` an optional per-object line
   for the handful of cases a rule cannot cover. */
function promptFor(artefact, hint, note) {
  const shape = SHAPES[hint || "default"] || "";
  return [
    LOOK,
    "",
    "THE OBJECT: " + artefact.name + " — " + artefact.origin + ", " + artefact.date + ".",
    FIDELITY,
    shape,
    note || "",
    "",
    "EXCLUDE: " + EXCLUDE + ".",
  ].filter(Boolean).join("\n");
}

/* Added to the prompt only when an approved exemplar is being passed as a second input image.
   Without this sentence the model has two references and no idea what either is for — it will
   cheerfully blend the exemplar's OBJECT into the output, which is the one thing it must never
   do. Naming which image is which is what makes the exemplar a style reference rather than a
   second subject. */
const EXEMPLAR_CLAUSE =
  "There are two reference images. The FIRST is the object: copy its form, its markings and its condition. " +
  "The SECOND is a finished illustration from this same set, supplied only as a style reference: match its " +
  "lighting, palette, brushwork, background and framing exactly. Do not copy any object, shape or detail from " +
  "the second image.";

/* ---------------------------------------------------------------------------------------------
   THE PILOT SET

   Eight objects chosen to BREAK the style rather than flatter it, since a pilot that only proves
   a bronze helmet looks good has proved nothing. Each is here for a named hazard:

     roman-denarius            a coin. Tiny, flat, low relief, with a legend around the rim.
     cuneiform-tablet          SCRIPT, the worst case. If this fails, inscribed objects keep photographs.
     ulfberht-sword            long and thin — the square-frame fight — plus an inlaid inscription.
     panathenaic-amphora       painted figures on a curved body, which a model will happily reinvent.
     mask-of-tutankhamun       specular gold, and the most recognisable object on the list; a bad
                               one is unmissable, which is exactly what a pilot wants.
     code-of-hammurabi-stele   tall stone, dense inscription AND relief, one of each hazard at once.
     bell-beaker-vessel        the ORDINARY case. If a plain pot comes back boring, the style is
                               carrying the interesting objects and nothing else.
     garnet-disc-brooch        small, intricate, geometric cloisonné — fine repeating detail.

   It also spans all four rarities (3 common, 3 rare, 1 epic, 1 legendary) so the contact sheet
   shows the CSS rarity border doing its job over real art.
   --------------------------------------------------------------------------------------------- */
const PILOT = [
  { id: "roman-denarius",          hint: "flat",    hazard: "coin: low relief, rim legend" },
  { id: "cuneiform-tablet",        hint: "small",   hazard: "SCRIPT — the decisive test" },
  { id: "ulfberht-sword",          hint: "tall",    hazard: "long thin object + inlaid inscription" },
  { id: "panathenaic-amphora",     hint: "vessel",  hazard: "painted figures on a curved body" },
  { id: "mask-of-tutankhamun",     hint: "default", hazard: "specular gold, instantly recognisable" },
  { id: "code-of-hammurabi-stele", hint: "tall",    hazard: "tall stone, inscription + relief" },
  { id: "bell-beaker-vessel",      hint: "vessel",  hazard: "the ordinary case" },
  { id: "garnet-disc-brooch",      hint: "flat",    hazard: "fine repeating geometric detail" },
];

module.exports = { LOOK, FIDELITY, EXCLUDE, SHAPES, PILOT, promptFor, EXEMPLAR_CLAUSE };
