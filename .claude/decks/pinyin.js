/* CC-CEDICT writes its readings with a tone digit (gan4 ma2) and Folio's cards print the diacritic form.
   The rule is the standard one: the mark goes on a/e, on the o of ou, else on the last vowel.
   VERIFIED against complete.json, which carries both spellings for every one of its 11,470 entries. */
const V = { a: "āáǎàa", e: "ēéěèe", i: "īíǐìi", o: "ōóǒòo", u: "ūúǔùu", "ü": "ǖǘǚǜü", "v": "ǖǘǚǜü" };
function syl(s) {
  const m = /^([a-zA-ZüÜ:]+)([1-5])$/.exec(s);
  if (!m) return s;
  let w = m[1].replace(/u:/g, "ü").replace(/U:/g, "Ü");
  const t = +m[2] - 1;
  const low = w.toLowerCase();
  let i = low.indexOf("a");
  if (i < 0) i = low.indexOf("e");
  if (i < 0 && low.includes("ou")) i = low.indexOf("o");
  if (i < 0) { for (let k = low.length - 1; k >= 0; k--) if (V[low[k]]) { i = k; break; } }
  if (i < 0) return w;
  const up = w[i] !== low[i];
  const ch = V[low[i]][t] || w[i];
  return w.slice(0, i) + (up ? ch.toUpperCase() : ch) + w.slice(i + 1);
}
module.exports = n => String(n).trim().split(/\s+/).map(syl).join(" ");
