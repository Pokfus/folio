/* Place names translated into nl (English name -> local name): countries from world.js, plus
   era territories and era capitals from timeline.js. Lazy: fetched by the `placeI18n:nl` data bundle
   only when the site language is nl. The bundle's `after` hook in app.js drains window.PLACE_I18N_IN
   into window.PLACE_I18N, which placeName() reads — including at canvas draw time, where the DOM
   localisation walker cannot reach. Grown by .claude/add-lang.js. */
(function () {
  var d = {

};
  (window.PLACE_I18N_IN = window.PLACE_I18N_IN || []).push({ lang: "nl", data: d });
})();
