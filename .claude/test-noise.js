/* WHAT A CONSOLE ERROR FROM OUTSIDE FOLIO LOOKS LIKE, in one place.
 *
 * Nearly every browser suite here ends on `check("no console/page errors", errs.length === 0)`, which is
 * the assertion that catches what no other assertion is looking for. It only works if it can tell Folio's
 * own faults from the room's, and each suite was left to spell that out for itself: 32 listeners in 17
 * different spellings, each grown by whoever last met a new kind of noise. So the same run had suites
 * that ignored a failed fetch and suites that failed on one, and CI -- a machine none of them was written
 * on -- turned that drift into six red suites at once, on two kinds of noise:
 *
 *   - "Failed to load resource: the server responded with a status of 400" -- the runner reaching the
 *     REAL Supabase project, which answers 400 to an anonymous call the tests never make an assertion
 *     about. On a developer's machine the same call is usually blocked outright and arrives as net::ERR_,
 *     which most of the filters already knew about; that is why this was invisible until CI existed.
 *   - "Permissions policy violation: compute-pressure is not allowed in this document" -- the RUNNER'S
 *     OWN CHROMIUM, complaining about a feature the page never asks for. Nothing in Folio can fix it and
 *     no version of Folio can trigger it.
 *
 * THE COST IS STATED RATHER THAN HIDDEN: filtering "Failed to load resource" also hides a 404 on one of
 * the site's own files. That is a trade the majority of these suites had already made by hand, and it is
 * a cheap one -- a missing data.js does not fail quietly here, it fails as every assertion in the suite.
 * A network REQUEST that must or must not happen is asserted on the request log (test-library watches for
 * a book on the eager path); this list is only about what is printed to the console.
 *
 * Not part of the site. */
const NOISE = [
  /net::|ERR_[A-Z_]/,                 // the machine's egress: a proxy, a tunnel, a refused connection
  /Failed to load resource/,          // a 400 from Supabase, a blocked webfont, a fixture's dead picture
  /CORS policy/,                      // file:// origins, and the same webfonts
  /favicon|manifest/,                 // furniture the suites never assert on
  /Permissions policy violation/,     // the runner's Chromium, not the page
];

// True when this console text is the room talking rather than Folio.
const isNoise = (t) => NOISE.some((r) => r.test(String(t || "")));

/* Wire a page's console and pageerror into one array of real errors. Suites that want their own extra
 * exemption pass `also`; everything else just calls watchErrors(page). */
function watchErrors(page, also) {
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e && e.message ? e.message : e)));
  page.on("console", (m) => {
    const t = m.text();
    if (m.type() !== "error") return;
    if (isNoise(t) || (also && also.test(t))) return;
    errs.push("console: " + t.slice(0, 300));
  });
  return errs;
}

module.exports = { NOISE, isNoise, watchErrors };
