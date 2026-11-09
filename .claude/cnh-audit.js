#!/usr/bin/env node
/* cnh-audit.js — every MECHANICAL rule of the China refinement audit, per card. REPORT-ONLY.
 *
 *     node .claude/cnh-audit.js [--range=cnh-001:cnh-010] [--card=cnh-008] [--summary] [--all] [--worst]
 *
 *   --range / --card / --summary / --all   as in greece-audit.js
 *   --worst    one line per batch of ten (plan order), with its finding count, worst first — the list
 *              the batches are picked from
 *
 * THE RULES ARE THE GREECE AUDIT'S, AND SO IS THE CODE (Nov 2026). docs/china-refinement-audit.md adopts
 * the settled rules of docs/greece-refinement-audit.md unchanged, so this file hands greece-audit.js a
 * config (prefix, chronology file) and requires it, exactly as rm-audit.js and wh-audit.js do. A rule
 * changed there is changed here. What China adds is configured below:
 *
 *   L.missing  also a STATE (a kingdom or dynasty has somewhere to stand, as a battle does).
 *   G.none     the card's answer term has no glossary entry (key, display title or alias).
 *   G.date     the glossary entry's date and the card's date line share no year — a lead, read by eye.
 *   Z.none     the card carries no `hanzi` (the answer bubble shows nothing).
 *   Z.pinyin   the `pinyin` cannot be cut into as many syllables as `hanzi` has characters (each syllable a
 *              real Mandarin syllable carrying at most one tone mark), or a syllable that opens on a, o or
 *              e inside a word has no apostrophe before it (Xi'an, Chang'e).
 *   Z.trad     `traditional` is identical to `hanzi` where the standard conversion differs, or differs where
 *              it does not, or is a different word. NEEDS opencc-js on NODE_PATH (installed OUTSIDE the
 *              repo, as Playwright is); without it the check is skipped and one line says so.
 *   Z.reading? the dictionary reading of `hanzi` (pinyin-pro on NODE_PATH, the same way) differs from
 *              `pinyin` in a syllable or a tone — a LEAD, read by eye: a library's reading is a check,
 *              never a source, and polyphonic characters (the 长 of a name, the 和 of a text) trip it.
 *   P.protected  the card is one of the PROTECTED individuals (the `protected-cards` block of
 *              docs/china-refinement-audit.md): its date line is refined in another thread, so the date
 *              line's own findings (D.shape, D.rows, D.label, D.era, D.not-a-date, D.c-in-range,
 *              D.dangling, D.sort) are set aside and this one note counts them. D.not-in-prose and D.pin
 *              still run: the background must carry every year on the protected line.
 *
 * The AUC rule of rm-audit.js is not carried. Exits 0 whatever it finds: it is the batch's report, not a
 * gate. Zero dependencies in the repo (the two optional libraries above are reached through NODE_PATH and
 * never ship). Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path");
const { loadGlossary } = require("./gloss-io.js");

const PREFIX = "cnh";
const G = loadGlossary();
const norm = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/_/g, " ").replace(/\s*\([^)]*\)\s*$/, "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
const TERM = new Map();   // normalised surface → glossary key
for (const k of Object.keys(G.GLOSSARY || {})) {
  TERM.set(norm(k), k);
  const t = (G.GLOSSARY_TITLES || {})[k]; if (t) TERM.set(norm(t), k);
  ((G.GLOSSARY_ALIASES || {})[k] || []).forEach((a) => TERM.set(norm(a), k));
}
const years = (s) => new Set([...String(s || "").replace(/<[^>]*>/g, " ").matchAll(/\b\d+(?:\.\d+)?\b/g)].map((m) => m[0]));

/* ---------- the protected cards ---------- */
const AUDIT_DOC = path.join(__dirname, "..", "docs", "china-refinement-audit.md");
const PROTECTED = new Set();
if (fs.existsSync(AUDIT_DOC)) {
  const m = /```protected-cards\n([\s\S]*?)```/.exec(fs.readFileSync(AUDIT_DOC, "utf8"));
  if (m) m[1].split("\n").forEach((l) => { const r = /^(cnh-\d{3})\b/.exec(l.trim()); if (r) PROTECTED.add(r[1]); });
}
global.AUDIT_PROTECTED = PROTECTED;   // precheck.js reads it: a protected card's patch may not carry its date line
const SET_ASIDE = /^D\.(shape|rows|label|era|not-a-date|c-in-range|dangling|sort)$/;

/* ---------- the Chinese name ---------- */
const SYL = new Set(("a ai an ang ao ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu ca cai can cang cao ce cen ceng cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo ci cong cou cu cuan cui cun cuo da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo e ei en eng er fa fan fang fei fen feng fo fou fu ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun ka kai kan kang kao ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lv lve ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nv nve o ou pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo sa sai san sang sao se sen seng sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo si song sou su suan sui sun suo ta tai tan tang tao te tei teng ti tian tiao tie ting tong tou tu tuan tui tun tuo wa wai wan wang wei wen weng wo wu xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun za zai zan zang zao ze zei zen zeng zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo zi zong zou zu zuan zui zun zuo").split(" "));
const HAN = /[㐀-鿿豈-﫿]/g;
const TONED = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g;
const toneless = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, (m) => (m === "̈" ? "̈" : "")).normalize("NFC").replace(/ü/g, "v").toLowerCase();
/* All the ways one pinyin word (no spaces or apostrophes) cuts into real syllables, each carrying at most
   one tone mark; returns the set of possible syllable counts, and whether a cut needs an apostrophe. */
function cuts(word) {
  const raw = word.normalize("NFC"), plainW = toneless(raw), n = plainW.length;
  const memo = new Map();
  const go = (i) => {
    if (i === n) return [[]];
    if (memo.has(i)) return memo.get(i);
    const res = [];
    for (let j = Math.min(n, i + 6); j > i; j--) {
      if (!SYL.has(plainW.slice(i, j))) continue;
      if ((raw.slice(i, j).match(TONED) || []).length > 1) continue;
      go(j).forEach((rest) => res.push([plainW.slice(i, j)].concat(rest)));
      if (res.length > 64) break;
    }
    memo.set(i, res); return res;
  };
  return go(0);
}
function pinyinCheck(hz, py) {
  const nChars = (String(hz).match(HAN) || []).length;
  const words = String(py).replace(/<[^>]*>/g, "").split(/[\s\-–—·,;:.]+/).filter(Boolean);
  // an apostrophe separates syllables inside a word; each piece cuts alone
  let options = [{ n: 0, aposMissing: false }];
  for (const w of words) {
    const pieces = w.split(/['’]/).filter(Boolean);
    for (let p = 0; p < pieces.length; p++) {
      const cs = cuts(pieces[p]); if (!cs.length) return { ok: false, why: "\"" + pieces[p] + "\" is not pinyin" };
      const next = [];
      for (const o of options) for (const c of cs) {
        const apos = c.slice(1).some((s) => /^[aoe]/.test(s));
        next.push({ n: o.n + c.length, aposMissing: o.aposMissing || apos });
      }
      const seen = new Set(); options = next.filter((o) => { const k = o.n + "|" + o.aposMissing; if (seen.has(k)) return false; seen.add(k); return true; });
    }
  }
  const fit = options.filter((o) => o.n === nChars);
  if (!fit.length) return { ok: false, why: nChars + " character(s), but the pinyin cuts into " + [...new Set(options.map((o) => o.n))].join(" or ") + " syllable(s)" };
  if (fit.every((o) => o.aposMissing)) return { ok: false, why: "a syllable opening on a, o or e inside a word has no apostrophe before it" };
  return { ok: true };
}
const tryReq = (m) => { try { return require(m); } catch (e) { return null; } };
const OPENCC = tryReq("opencc-js"), PYPRO = tryReq("pinyin-pro");
const s2t = OPENCC ? OPENCC.Converter({ from: "cn", to: "tw" }) : null;
const t2s = OPENCC ? OPENCC.Converter({ from: "tw", to: "cn" }) : null;
let skipped = false;

function extraChecks(c, finding) {
  const key = TERM.get(norm(c.answerText || c.answer)) || TERM.get(norm(c.answer));
  if (!key) finding("G.none", "no glossary entry for \"" + norm(c.answer) + "\"");
  else {
    const gd = (G.GLOSSARY_DATES || {})[key];
    if (gd && c.answerDate) {
      const a = years(gd), b = years(c.answerDate);
      if (a.size && b.size && ![...a].some((y) => b.has(y))) finding("G.date", "glossary " + key + " dates it \"" + gd + "\"; the date line shares no figure");
    }
  }
  /* Z — the answer bubble */
  const hz = String(c.hanzi || "").trim(), tr = String(c.traditional || "").trim(), py = String(c.pinyin || "").trim();
  if (!hz) { finding("Z.none", "no hanzi: the answer bubble is empty"); return; }
  if (!py) finding("Z.pinyin", "hanzi " + hz + " but no pinyin");
  else { const r = pinyinCheck(hz, py); if (!r.ok) finding("Z.pinyin", hz + " / " + py + ": " + r.why); }
  if (s2t) {
    const want = s2t(hz);
    if (!tr) { if (want !== hz) finding("Z.trad", "no traditional, and " + hz + " is " + want + " in traditional characters"); }
    else if (tr === hz && want !== hz) finding("Z.trad", "traditional identical to the simplified " + hz + "; the standard form is " + want);
    else if (tr !== hz && t2s(tr) !== hz) finding("Z.trad", "traditional " + tr + " is not the simplified " + hz + " (it converts to " + t2s(tr) + ")");
    else if (tr !== hz && want === hz) finding("Z.trad", "traditional " + tr + " differs, but " + hz + " is written the same in both scripts");
  } else skipped = true;
  if (PYPRO && py) {
    const lib = PYPRO.pinyin(hz, { toneType: "symbol", type: "array", toneSandhi: false }).join("");
    const mine = py.normalize("NFC").toLowerCase().replace(/[^a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g, "");
    if (lib && lib !== mine) finding("Z.reading?", py + " against the dictionary's " + PYPRO.pinyin(hz, { toneType: "symbol", toneSandhi: false }) + " (a lead: polyphones)");
  }
}

function filter(c, out) {
  if (!PROTECTED.has(c.id)) return out;
  const kept = out.filter(([r]) => !SET_ASIDE.test(r));
  const n = out.length - kept.length;
  if (n) kept.push(["P.protected", "date line protected (another thread): " + n + " date-line finding(s) set aside"]);
  return kept;
}

global.AUDIT_CFG = {
  prefix: PREFIX, chronology: "china-chronology.md", name: "cnh-audit", max: 1000,
  extraPlaceKinds: ["state"],
  extraChecks, filter,
};

if (process.argv.includes("--worst")) {
  /* Run the audit quietly over the whole collection and rank the batches of ten by finding count. */
  const log = console.log; const lines = [];
  console.log = (...a) => lines.push(a.join(" "));
  process.argv = process.argv.filter((a) => a !== "--worst" && a !== "--summary");
  require("./greece-audit.js");
  console.log = log;
  const per = {}; let cur = null;
  const ID = new RegExp("^(" + PREFIX + "-\\d+)\\s");
  for (const l of lines) {
    const m = ID.exec(l); if (m) { cur = m[1]; per[cur] = 0; continue; }
    if (cur && /^\s{4}\S/.test(l) && !/^\s{4}P\.protected/.test(l)) per[cur]++;
  }
  const batches = {};
  Object.keys(per).forEach((id) => { const b = Math.ceil(+id.slice(PREFIX.length + 1) / 10); batches[b] = (batches[b] || 0) + per[id]; });
  Object.keys(batches).sort((a, b) => batches[b] - batches[a] || a - b).forEach((b) => {
    const lo = (b - 1) * 10 + 1, hi = b * 10, p = (n) => PREFIX + "-" + String(n).padStart(3, "0");
    log("B" + String(b).padEnd(4) + p(lo) + "–" + p(hi) + "  " + batches[b] + " finding(s)");
  });
} else {
  require("./greece-audit.js");
}
if (skipped) console.log("  (Z.trad and Z.reading? skipped: opencc-js / pinyin-pro not on NODE_PATH — install them outside the repo)");
