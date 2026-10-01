// Think-it-through footnote markers survive wireFootnotes (Sep 2026, out of the Greece refinement audit).
//
// A Think-it-through answer may carry markers into the card's own source list. The block is injected by
// showAnswer ABOVE the Background, so it comes FIRST in reading order — and wireFootnotes numbers a BARE
// marker by reading order. That is why the rule (card-links.js `checkWhyMarkers`) is that an answer's
// marker carries an explicit data-fn: this test proves, in a real browser DOM, that
//   1. explicit markers in the answers keep the numbers written on them,
//   2. the abstract's markers below are not shifted by them,
//   3. a marker pointing past the list is removed rather than shown,
//   4. and — the liveness half — a BARE marker in the block DOES shift the abstract, which is the fault the
//      rule exists to prevent. If that assertion ever stops failing the "bare" case, this test has stopped
//      measuring what it claims to.
// The functions are SLICED out of the real app.js by text, so the test cannot drift from what ships; the
// run stops if a slice fails.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-why-markers.js
"use strict";
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const APP = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};

function sliceFn(name) {
  const a = APP.indexOf("  function " + name + "(");
  if (a < 0) { console.error("ERROR: could not find function " + name + " in app.js"); process.exit(2); }
  let i = APP.indexOf("{", a), depth = 0;
  for (; i < APP.length; i++) { const ch = APP[i]; if (ch === "{") depth++; else if (ch === "}" && --depth === 0) break; }
  return APP.slice(a, i + 1);
}
function sliceConst(name) {
  const m = new RegExp("  const " + name + " = [^\\n]*;\\n").exec(APP);
  if (!m) { console.error("ERROR: could not find const " + name + " in app.js"); process.exit(2); }
  return m[0];
}
const LIB = [sliceConst("WHY_MAX"), sliceConst("ELAB_CHEV"), sliceFn("cardWhy"), sliceFn("elabPromptHTML"), sliceFn("wireFootnotes")].join("\n");

let pass = 0, fail = 0;
const check = (n, ok, x) => { if (ok) { pass++; console.log("ok    " + n + (x ? "  " + x : "")); } else { fail++; console.log("FAIL  " + n + (x ? "  " + x : "")); } };

(async () => {
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage();
  await page.setContent("<!doctype html><body><div id=root></div></body>");
  const run = (why) => page.evaluate(({ LIB, why }) => {
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sanitizeHTML = (s) => s, wireSourceLinks = () => {};
    // eslint-disable-next-line no-new-func
    const api = new Function("esc", "sanitizeHTML", "wireSourceLinks", LIB + "\nreturn { elabPromptHTML, wireFootnotes };")(esc, sanitizeHTML, wireSourceLinks);
    const root = document.getElementById("root");
    root.innerHTML =
      '<div class="bg-head">Background</div>' +
      '<p class="abstract">One.<sup class="fn" data-fn="1"></sup> Two.<sup class="fn" data-fn="2"></sup> Three.<sup class="fn" data-fn="3"></sup></p>' +
      '<div class="src-note"><ol><li class="src-item"><span class="src-n">1</span>a</li><li class="src-item"><span class="src-n">2</span>b</li><li class="src-item"><span class="src-n">3</span>c</li><li class="src-item"><span class="src-n">4</span>d</li></ol></div>';
    root.querySelector(".bg-head").insertAdjacentHTML("beforebegin", api.elabPromptHTML({ why }));
    api.wireFootnotes(root);
    return {
      why: [...root.querySelectorAll(".elab sup.fn")].map((e) => e.textContent),
      abs: [...root.querySelectorAll(".abstract sup.fn")].map((e) => e.textContent),
    };
  }, { LIB, why });

  const q = (a) => ({ q: "Why is this so?", a });
  const good = await run([
    q('Because of a claim.<sup class="fn" data-fn="4"></sup>'),
    q('Because of another.<sup class="fn" data-fn="2"></sup>'),
    q('Because of a third.<sup class="fn" data-fn="9"></sup>'),
  ]);
  check("explicit markers in the answers keep their numbers", JSON.stringify(good.why) === '["4","2"]', JSON.stringify(good.why));
  check("a marker past the list is removed, not shown", good.why.indexOf("9") < 0);
  check("the abstract's markers are not shifted by the block above them", JSON.stringify(good.abs) === '["1","2","3"]', JSON.stringify(good.abs));

  const bare = await run([q('Because of a claim.<sup class="fn"></sup>'), q("Plain."), q("Plain too.")]);
  // liveness: the abstract's markers are explicit so they survive, but the BARE marker is numbered by
  // reading order — it becomes 1, a citation the author never chose. That is the fault the rule refuses.
  check("liveness: a BARE marker in the block is numbered by reading order (why the rule exists)", JSON.stringify(bare.why) === '["1"]', JSON.stringify(bare.why));

  // and the writer-side rule: card-links.js refuses exactly that bare marker
  const { checkWhy } = require("./card-links.js");
  const long = "Because of a reason stated at enough length to pass the answer's floor of words";
  const e = checkWhy({ sources: ["a"], why: [q(long + '.<sup class="fn"></sup>'), q(long + "."), q(long + " again.")].map((w, i) => ({ q: w.q.replace("?", i + "?"), a: w.a })) });
  check("card-links.js refuses a bare marker in an answer", /no number/.test(String(e)), String(e).slice(0, 60));

  await browser.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
