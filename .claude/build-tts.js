#!/usr/bin/env node
/* build-tts.js — bake per-card narration MP3s with a local neural TTS (Piper), shipped as static files.
   The site plays these (audio/cards/) when present and falls back to the Web Speech API otherwise.

   Zero runtime deps for the SITE. Build-time, this script self-provisions into .claude/tts-cache/ (gitignored):
     - Piper (MIT)                 https://github.com/rhasspy/piper           (windows binary release)
     - Voice en_US-libritts_r     (model MIT; dataset LibriTTS-R, CC BY 4.0 — COMMERCIAL-SAFE with attribution.
                                    Do NOT switch to hfc_male / ryan / lessac: those are CC BY-NC / research-only.)
     - lamejs (LGPL, build-time only) — pure-JS MP3 encoder, fetched from jsdelivr, never shipped.

   Usage:
     node .claude/build-tts.js                       bake all cards for the default narrator (incremental)
     node .claude/build-tts.js --narrator=gb-male    bake another shipped narrator (see NARRATORS below)
     node .claude/build-tts.js --limit=3             bake only the first N cards (pipeline test)
     node .claude/build-tts.js --only=cnh-001,cnh-2  bake specific cards
     node .claude/build-tts.js --speaker=451         override the narrator's speaker id
     node .claude/build-tts.js --scan-speakers=40    synth a test line for speakers 0..39 of the narrator's
                                                     voice, estimate pitch (Hz), write WAVs to listen to
     node .claude/build-tts.js --rehash              update manifest hashes to the current text WITHOUT
                                                     re-synthesizing (after a canonicalization-only change)
     node .claude/build-tts.js --bitrate=32          smaller files (default 48 kbps mono)
     node .claude/build-tts.js --force               re-bake everything (ignore the manifest)

   Output: audio/cards/<narrator>/<id>-q.mp3 / -a.mp3 / -bg.mp3 + manifest.json + _sample.mp3
   Manifest hashes use the SAME FNV-1a as app.js hashStr(); the runtime skips a baked file whose card text
   changed since baking (falls back to Web Speech), so stale audio is never played. Windows-only (this dev
   machine); the Piper download URL is the only OS-specific bit. */
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const https = require("https");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CACHE = path.join(__dirname, "tts-cache");
const PIPER_ZIP_URL = "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip";
const HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main/";
// The narrators the site ships (audio/cards/<key>/). Each voice's dataset MUST allow commercial use —
// libritts_r + vctk are CC BY 4.0 (verified in their MODEL_CARDs). hfc_male / ryan / lessac are CC BY-NC: never use.
// Speakers were chosen by pitch-scanning (--scan-speakers) — male ≈ 85-135 Hz, female ≈ 160-255 Hz.
const NARRATORS = {
  "us-male":   { model: "en_US-libritts_r-medium", base: HF + "en/en_US/libritts_r/medium/", speaker: 5,   label: "American male" },
  "us-female": { model: "en_US-libritts_r-medium", base: HF + "en/en_US/libritts_r/medium/", speaker: 12,  label: "American female" },
  "gb-male":   { model: "en_GB-vctk-medium",       base: HF + "en/en_GB/vctk/medium/",       speaker: 13,  label: "British male" },
  "gb-female": { model: "en_GB-vctk-medium",       base: HF + "en/en_GB/vctk/medium/",       speaker: 14,  label: "British female" },
};
const LAME_URL = "https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.all.js";
const LENGTH_SCALE = "1.15";   // slightly slow, matching the app's unhurried reading style

/* ---------- args ---------- */
const args = {};
process.argv.slice(2).forEach((a) => { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); if (m) args[m[1]] = m[2] === undefined ? true : m[2]; });
const NARR_KEY = String(args.narrator || "us-male");
const NARR = NARRATORS[NARR_KEY];
if (!NARR) { console.error("Unknown --narrator=" + NARR_KEY + " (have: " + Object.keys(NARRATORS).join(", ") + ")"); process.exit(1); }
const OUT = path.join(ROOT, "audio", "cards", NARR_KEY);
const VOICE = NARR.model;
const VOICE_BASE = NARR.base;
const BITRATE = parseInt(args.bitrate || "48", 10);
const SPEAKER = parseInt(args.speaker || String(NARR.speaker), 10);

/* ---------- tiny fetch with redirects ---------- */
function fetchBin(url, redirects) {
  return new Promise((resolve, reject) => {
    if ((redirects || 0) > 6) return reject(new Error("too many redirects"));
    https.get(url, { headers: { "user-agent": "folio-build-tts" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(fetchBin(new URL(res.headers.location, url).href, (redirects || 0) + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error("HTTP " + res.statusCode + " for " + url)); }
      const chunks = [];
      let got = 0;
      const total = parseInt(res.headers["content-length"] || "0", 10);
      res.on("data", (c) => { chunks.push(c); got += c.length; if (total > 4e6) process.stdout.write("\r  " + (got / 1048576).toFixed(1) + " / " + (total / 1048576).toFixed(1) + " MB"); });
      res.on("end", () => { if (total > 4e6) process.stdout.write("\n"); resolve(Buffer.concat(chunks)); });
      res.on("error", reject);
    }).on("error", reject);
  });
}

/* ---------- minimal ZIP extractor (store + deflate entries) ---------- */
function unzip(buf, destDir) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65558); i--) { if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; } }
  if (eocd < 0) throw new Error("not a zip (no EOCD)");
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error("bad central directory");
    const method = buf.readUInt16LE(off + 10);
    const csize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28), extraLen = buf.readUInt16LE(off + 30), cmtLen = buf.readUInt16LE(off + 32);
    const lho = buf.readUInt32LE(off + 42);
    const name = buf.slice(off + 46, off + 46 + nameLen).toString("utf8");
    off += 46 + nameLen + extraLen + cmtLen;
    if (name.endsWith("/")) continue;
    const lNameLen = buf.readUInt16LE(lho + 26), lExtraLen = buf.readUInt16LE(lho + 28);
    const dataStart = lho + 30 + lNameLen + lExtraLen;
    const raw = buf.slice(dataStart, dataStart + csize);
    const data = method === 0 ? raw : zlib.inflateRawSync(raw);
    const dest = path.join(destDir, name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, data);
  }
}

/* ---------- provisioning ---------- */
async function ensureFile(dest, url, label) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return dest;
  console.log("Downloading " + label + " …");
  const buf = await fetchBin(url);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return dest;
}
async function ensurePiper() {
  const exe = path.join(CACHE, "piper", "piper.exe");
  if (fs.existsSync(exe)) return exe;
  console.log("Downloading Piper (Windows build) …");
  const zip = await fetchBin(PIPER_ZIP_URL);
  unzip(zip, CACHE);   // the zip contains a top-level piper/ folder
  if (!fs.existsSync(exe)) throw new Error("piper.exe missing after extract");
  return exe;
}
async function ensureVoice() {
  const onnx = await ensureFile(path.join(CACHE, VOICE + ".onnx"), VOICE_BASE + VOICE + ".onnx?download=true", "voice model " + VOICE + " (~75 MB)");
  const cfg = await ensureFile(path.join(CACHE, VOICE + ".onnx.json"), VOICE_BASE + VOICE + ".onnx.json?download=true", "voice config");
  return { onnx, cfg };
}
async function ensureLame() {
  const f = await ensureFile(path.join(CACHE, "lame.all.js"), LAME_URL, "lamejs MP3 encoder");
  // lame.all.js is a plain script (no module.exports): it defines function lamejs(){...}, self-runs it, and the
  // function OBJECT ends up carrying .Mp3Encoder — so evaluate the source and hand that object back
  const lamejs = new Function(fs.readFileSync(f, "utf8") + "\nreturn lamejs;")();
  if (!lamejs || !lamejs.Mp3Encoder) throw new Error("lamejs failed to load");
  return lamejs;
}

/* ---------- text extraction (mirrors app.js ttsStrip / ttsQuestionText / hashStr EXACTLY) ---------- */
function decodeEntities(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&middot;/g, "·").replace(/&mdash;/g, "—").replace(/&ndash;/g, "–");
}
// tags are removed WITHOUT inserting a space — matching DOM textContent, which is what the app hashes at runtime.
// (Replacing tags with " " once produced "…Liji , credited…" vs the DOM's "…Liji, credited…" — every background
// hash mismatched and the runtime silently fell back to the device voice. Don't reintroduce that.)
function strip(html) { return decodeEntities(String(html || "").replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim(); }
function qText(c) { return strip(String(c.question || "").replace(/<span class="blank"[^>]*>[\s\S]*?<\/span>/g, " blank ")); }
function aText(c) { return (c.answerText && String(c.answerText).trim()) || strip(c.answer); }
function bgText(c) { return strip(c.abstract); }
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ---------- WAV parse + MP3 encode ---------- */
function wavToPcm(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") throw new Error("not a WAV");
  let off = 12, fmt = null, data = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4), size = buf.readUInt32LE(off + 4);
    if (id === "fmt ") fmt = { channels: buf.readUInt16LE(off + 10), rate: buf.readUInt32LE(off + 12), bits: buf.readUInt16LE(off + 22) };
    if (id === "data") { data = buf.slice(off + 8, off + 8 + size); break; }
    off += 8 + size + (size % 2);
  }
  if (!fmt || !data || fmt.bits !== 16) throw new Error("unsupported WAV layout");
  return { fmt, samples: new Int16Array(data.buffer, data.byteOffset, Math.floor(data.length / 2)) };
}
function pcmToMp3(lamejs, pcm, rate, kbps) {
  const enc = new lamejs.Mp3Encoder(1, rate, kbps);
  const out = [];
  for (let i = 0; i < pcm.length; i += 1152) {
    const b = enc.encodeBuffer(pcm.subarray(i, Math.min(i + 1152, pcm.length)));
    if (b.length) out.push(Buffer.from(b));
  }
  const end = enc.flush();
  if (end.length) out.push(Buffer.from(end));
  return Buffer.concat(out);
}

/* ---------- synthesis ---------- */
function synthWav(piper, voice, text, speaker, wavPath) {
  const r = spawnSync(piper, ["-m", voice.onnx, "-c", voice.cfg, "-s", String(speaker), "-f", wavPath, "--length_scale", LENGTH_SCALE], {
    input: Buffer.from(text.replace(/\s+/g, " ").trim() + "\n", "utf8"), maxBuffer: 1 << 26,
  });
  if (r.status !== 0 || !fs.existsSync(wavPath)) throw new Error("piper failed: " + String(r.stderr || "").slice(-400));
}

/* ---------- crude pitch estimate (autocorrelation) — male ≈ 85-135 Hz, female ≈ 160-255 Hz ---------- */
function estimatePitch(pcm, rate) {
  const s = pcm.subarray(Math.floor(pcm.length * 0.2), Math.min(pcm.length, Math.floor(pcm.length * 0.2) + rate));  // ~1s from 20% in
  const lo = Math.floor(rate / 300), hi = Math.floor(rate / 70);
  let best = 0, bestLag = 0;
  for (let lag = lo; lag <= hi; lag++) {
    let sum = 0;
    for (let i = 0; i + lag < s.length; i += 2) sum += (s[i] * s[i + lag]);
    if (sum > best) { best = sum; bestLag = lag; }
  }
  return bestLag ? Math.round(rate / bestLag) : 0;
}

/* ---------- main ---------- */
(async function main() {
  fs.mkdirSync(CACHE, { recursive: true });
  const piper = await ensurePiper();
  const voice = await ensureVoice();

  if (args["scan-speakers"]) {
    const n = parseInt(args["scan-speakers"], 10) || 20;
    const line = "The Zhou dynasty ruled ancient China for nearly eight hundred years, longer than any other royal house.";
    const dir = path.join(CACHE, "speaker-samples");
    fs.mkdirSync(dir, { recursive: true });
    const rows = [];
    console.log("Scanning " + n + " speakers (writing WAV samples to " + dir + ") …");
    for (let sp = 0; sp < n; sp++) {
      const wav = path.join(dir, "speaker-" + sp + ".wav");
      try {
        synthWav(piper, voice, line, sp, wav);
        const { fmt, samples } = wavToPcm(fs.readFileSync(wav));
        rows.push({ sp, hz: estimatePitch(samples, fmt.rate), secs: (samples.length / fmt.rate).toFixed(1) });
      } catch (e) { rows.push({ sp, hz: -1, secs: "err" }); }
    }
    rows.sort((a, b) => a.hz - b.hz);
    console.log("\nspeaker  est.pitch  length   (male voices cluster ~85-135 Hz)");
    rows.forEach((r) => console.log(String(r.sp).padStart(7) + String(r.hz < 0 ? "err" : r.hz + " Hz").padStart(11) + String(r.secs + "s").padStart(9)));
    console.log("\nListen to the low-pitch candidates in " + dir + ", then bake with --speaker=<id> --force");
    return;
  }

  const lamejs = await ensureLame();
  global.window = {};
  require(path.join(ROOT, "data.js"));
  let cards = global.window.CARD_DATA || [];
  if (args.only) { const ids = new Set(String(args.only).split(",")); cards = cards.filter((c) => ids.has(c.id)); }
  if (args.limit) cards = cards.slice(0, parseInt(args.limit, 10));

  fs.mkdirSync(OUT, { recursive: true });
  const manifestPath = path.join(OUT, "manifest.json");
  let manifest = { version: 1, narrator: NARR_KEY, voice: VOICE, speaker: SPEAKER, bitrate: BITRATE, files: {} };
  if (fs.existsSync(manifestPath) && !args.force) {
    try { const old = JSON.parse(fs.readFileSync(manifestPath, "utf8")); if (old.voice === VOICE && old.speaker === SPEAKER && old.bitrate === BITRATE) { manifest = old; manifest.narrator = NARR_KEY; } } catch (e) {}
  }
  manifest.files = manifest.files || {};

  // --rehash: the text canonicalization changed but the spoken content didn't — update manifest hashes
  // to the current text WITHOUT re-synthesizing (existing audio stays valid).
  if (args.rehash) {
    let updated = 0;
    cards.forEach((c) => {
      const sections = { q: qText(c), a: aText(c), bg: bgText(c) };
      const entry = manifest.files[c.id];
      if (!entry) return;
      for (const sec of Object.keys(sections)) {
        const h = hashStr(sections[sec]);
        if (entry[sec] && entry[sec].h !== h && fs.existsSync(path.join(OUT, c.id + "-" + sec + ".mp3"))) { entry[sec].h = h; updated++; }
      }
    });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    console.log("Rehashed " + updated + " sections for " + NARR_KEY + " (audio unchanged — canonicalization update only).");
    return;
  }

  const tmpWav = path.join(CACHE, "work.wav");
  // every narrator dir carries a short _sample.mp3 — the Settings page's narrator Test button plays it
  const samplePath = path.join(OUT, "_sample.mp3");
  if (!fs.existsSync(samplePath) || args.force) {
    synthWav(piper, voice, "Hello — this is the voice that will read your cards aloud.", SPEAKER, tmpWav);
    const sw = wavToPcm(fs.readFileSync(tmpWav));
    fs.writeFileSync(samplePath, pcmToMp3(lamejs, sw.samples, sw.fmt.rate, BITRATE));
  }
  let baked = 0, skipped = 0, bytes = 0;
  const t0 = Date.now();
  for (let ci = 0; ci < cards.length; ci++) {
    const c = cards[ci];
    const sections = { q: qText(c), a: aText(c), bg: bgText(c) };
    const entry = manifest.files[c.id] || (manifest.files[c.id] = {});
    for (const sec of Object.keys(sections)) {
      const text = sections[sec];
      if (!text) { delete entry[sec]; continue; }
      const h = hashStr(text);
      const mp3Path = path.join(OUT, c.id + "-" + sec + ".mp3");
      if (!args.force && entry[sec] && entry[sec].h === h && fs.existsSync(mp3Path)) { skipped++; continue; }
      synthWav(piper, voice, text, SPEAKER, tmpWav);
      const { fmt, samples } = wavToPcm(fs.readFileSync(tmpWav));
      const mp3 = pcmToMp3(lamejs, samples, fmt.rate, BITRATE);
      fs.writeFileSync(mp3Path, mp3);
      entry[sec] = { h, b: mp3.length };
      baked++; bytes += mp3.length;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest));   // save progress as we go (resumable)
    }
    process.stdout.write("\r" + (ci + 1) + "/" + cards.length + " cards  (" + baked + " baked, " + skipped + " unchanged, " + (bytes / 1048576).toFixed(1) + " MB new)   ");
  }
  try { fs.unlinkSync(tmpWav); } catch (e) {}
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  const totalBytes = fs.readdirSync(OUT).reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0);
  console.log("\nDone in " + Math.round((Date.now() - t0) / 1000) + "s — " + baked + " sections baked, " + skipped + " unchanged.");
  console.log("audio/cards/ total: " + (totalBytes / 1048576).toFixed(1) + " MB (" + fs.readdirSync(OUT).length + " files)");
  console.log("Voice: " + VOICE + " speaker " + SPEAKER + " @ " + BITRATE + " kbps mono. Dataset CC BY 4.0 — keep the LibriTTS-R credit on the site's credits page for commercial use.");
})().catch((e) => { console.error("\nFAILED: " + (e && e.message || e)); process.exit(1); });
