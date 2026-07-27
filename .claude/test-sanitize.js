// Exercise app.js's sanitizer in a real browser. The functions live inside app.js's IIFE, so the
// block is sliced out of the real source by text and evaluated in the page — no test-only exports.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

// Repo root, resolved from this script so the test runs from anywhere.
const ROOT = path.resolve(__dirname, "..");
// This sandbox ships Chromium outside the playwright package; a normal `npx playwright install` needs neither.
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};

const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const start = src.indexOf("  const SANITIZE_DROP");
const endMark = "  // plain-text field (a title, an answerText, a deck description): no markup survives at all";
const end = src.indexOf("\n  }", src.indexOf("function sanitizePlain", src.indexOf(endMark))) + 4;
if (start < 0 || end < 4) { console.error("could not slice the sanitizer out of app.js"); process.exit(1); }
const block = src.slice(start, end);

const deps = `
  function escHtml(s){return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  function stripHtml(s){return (s||"").replace(/<[^>]*>/g," ").replace(/&[a-z]+;/gi," ").replace(/\\s+/g," ").trim();}
`;

const VECTORS = [
  // [name, input, mustNotContain[], mustContain[]]
  ["script tag", '<script>alert(1)</script>hello', ["<script", "alert(1)"], ["hello"]],
  ["img onerror", '<img src=x onerror=alert(1)>', ["onerror", "alert"], []],
  ["svg onload", '<svg/onload=alert(1)>', ["<svg", "onload"], []],
  ["body onload via unknown tag", '<body onload=alert(1)>hi</body>', ["onload"], ["hi"]],
  ["javascript: href", '<a href="javascript:alert(1)">x</a>', ["javascript:"], ["x"]],
  ["JaVaScRiPt: href", '<a href="JaVaScRiPt:alert(1)">x</a>', ["avaScrip", "alert"], ["x"]],
  ["tab-split scheme", '<a href="java\tscript:alert(1)">x</a>', ["script:"], ["x"]],
  ["newline-split scheme", '<a href="java\nscript:alert(1)">x</a>', ["script:"], ["x"]],
  ["entity-encoded scheme", '<a href="&#106;avascript:alert(1)">x</a>', ["javascript:"], ["x"]],
  ["leading-space scheme", '<a href="  javascript:alert(1)">x</a>', ["javascript:"], ["x"]],
  ["data: uri href", '<a href="data:text/html,<script>alert(1)</script>">x</a>', ["data:"], ["x"]],
  ["data: uri img", '<img src="data:image/svg+xml,<svg onload=alert(1)>">', ["data:"], []],
  ["iframe", '<iframe src="https://evil.test"></iframe>ok', ["<iframe"], ["ok"]],
  ["object/embed", '<object data="x"></object><embed src="y">ok', ["<object", "<embed"], ["ok"]],
  ["style tag", '<style>body{display:none}</style>ok', ["<style", "display:none"], ["ok"]],
  ["style attribute", '<p style="position:fixed;top:0">x</p>', ["style", "position:fixed"], ["x"]],
  ["form + input", '<form action="//evil.test"><input name="pw"></form>ok', ["<form", "<input"], ["ok"]],
  ["meta refresh", '<meta http-equiv="refresh" content="0;url=//evil.test">ok', ["<meta", "refresh"], ["ok"]],
  ["base tag", '<base href="//evil.test/">ok', ["<base"], ["ok"]],
  ["noscript smuggling", '<noscript><p title="</noscript><img src=x onerror=alert(1)>">', ["onerror"], []],
  ["comment smuggling", '<!--><script>alert(1)</script>-->ok', ["<script", "alert(1)"], ["ok"]],
  ["nested unwrap keeps text", '<marquee><blink>text</blink></marquee>', ["<marquee", "<blink"], ["text"]],
  ["arbitrary class dropped", '<span class="gloss-win">x</span>', ["gloss-win"], ["x"]],
  ["allowed class kept", '<span class="blank">_____</span>', [], ['class="blank"', "_____"]],
  ["uc- class kept", '<div class="uc-note">x</div>', [], ['class="uc-note"']],
  ["mixed classes filtered", '<span class="blank country-pop">x</span>', ["country-pop"], ["blank"]],
  ["ttip data-k kept", '<span class="ttip" data-k="Sima_Qian">Sima Qian</span>', [], ['data-k="Sima_Qian"', "ttip"]],
  ["bad data-k dropped", '<span class="ttip" data-k="<img src=x>">y</span>', ["data-k"], ["y"]],
  ["external link gets rel", '<a href="https://example.test">x</a>', [], ['rel="noopener noreferrer nofollow"', 'target="_blank"']],
  ["crafted target stripped", '<a href="https://a.test" target="x" rel="opener">y</a>', ['target="x"', 'rel="opener"'], ["noopener"]],
  ["relative img src kept", '<img src="images/a.jpg" alt="a">', [], ['src="images/a.jpg"']],
  ["https img src kept", '<img src="https://cdn.test/a.jpg">', [], ["https://cdn.test/a.jpg"]],
  ["card markup survives", '<div class="dt"><span class="dt-k">Date</span><span class="dt-v">202 BCE</span></div>', [], ["dt-k", "dt-v", "202 BCE"]],
  ["formatting survives", '<b>Bold</b> and <i>Italic</i> and <br> and <sub>2</sub>', [], ["<b>Bold</b>", "<i>Italic</i>", "<br>", "<sub>2</sub>"]],
  ["plain text untouched", "just words", [], ["just words"]],
  ["mXSS noscript/style", '<noscript><style></noscript><img src=x onerror=alert(1)>', ["onerror"], []],
  ["template smuggling", '<template><img src=x onerror=alert(1)></template>ok', ["onerror"], ["ok"]],
  // <xmp> is a raw-text element: its contents parse as TEXT, so the output is escaped, not live markup.
  // The DOM assertions below (no handlers, no dangerous nodes) are what actually prove it inert.
  ["xmp/plaintext", '<xmp><img src=x onerror=alert(1)></xmp>', ["<img"], ["&lt;img"]],
  ["deep nesting", "<div>".repeat(40) + "deep" + "</div>".repeat(40), [], ["deep"]],
];

const PLAIN = [
  ["strips tags", '<b>hi</b> <script>alert(1)</script>there', "hi there"],
  ["decodes entities", "a &amp; b", "a & b"],
  ["collapses space", "  a \n  b  ", "a b"],
];

(async () => {
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addScriptTag({ content: "(function(){\n" + deps + block + "\nwindow.__s = sanitizeHTML; window.__p = sanitizePlain;\n})();" });

  let pass = 0, fail = 0;
  for (const [name, input, mustNot, must] of VECTORS) {
    const out = await page.evaluate((i) => window.__s(i), input);
    // the real proof: inject the sanitized output and see whether the browser fires anything
    const fired = await page.evaluate((html) => {
      window.__hit = 0;
      const prev = window.alert;
      window.alert = () => { window.__hit++; };
      const d = document.createElement("div");
      d.innerHTML = html;
      document.body.appendChild(d);
      const bad = d.querySelectorAll("script,iframe,object,embed,style,form,svg,link,meta,base").length;
      let handlers = 0;
      d.querySelectorAll("*").forEach((el) => {
        for (const a of el.attributes) if (/^on/i.test(a.name)) handlers++;
      });
      d.remove();
      window.alert = prev;
      return { hit: window.__hit, bad, handlers };
    }, out);
    const problems = [];
    mustNot.forEach((n) => { if (out.toLowerCase().includes(n.toLowerCase())) problems.push("contains " + JSON.stringify(n)); });
    must.forEach((n) => { if (!out.includes(n)) problems.push("missing " + JSON.stringify(n)); });
    if (fired.hit) problems.push("alert fired");
    if (fired.bad) problems.push(fired.bad + " dangerous element(s) in DOM");
    if (fired.handlers) problems.push(fired.handlers + " on* handler(s) in DOM");
    if (problems.length) { fail++; console.log("FAIL  " + name + "\n      in:  " + JSON.stringify(input) + "\n      out: " + JSON.stringify(out) + "\n      " + problems.join("; ")); }
    else { pass++; }
  }
  for (const [name, input, expect] of PLAIN) {
    const out = await page.evaluate((i) => window.__p(i), input);
    if (out !== expect) { fail++; console.log("FAIL  plain/" + name + "\n      out: " + JSON.stringify(out) + " expected " + JSON.stringify(expect)); }
    else pass++;
  }
  if (pageErrors.length) { console.log("PAGE ERRORS:\n" + pageErrors.join("\n")); fail += pageErrors.length; }
  console.log("\n" + pass + " passed, " + fail + " failed");
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
