/* server/webpush.js — Web Push for the study reminders, on WebCrypto alone (Oct 2026, docs/reminders.md).

   Runs inside the Cloudflare Pages Function functions/api/remind.js, and under Node 22 for the tests
   (.claude/test-reminders.js). No library: the two standards are short, and a vendored push library would
   bring a Node `crypto` dependency the Workers runtime does not have.

     · RFC 8291 — Message Encryption for Web Push (the aes128gcm content coding of RFC 8188, one record).
       `encryptPayload` reproduces the RFC's own worked example byte for byte when given its salt and keys;
       the test proves it on every CI run.
     · RFC 8292 — VAPID: the application server signs a short-lived ES256 JWT naming the push service's
       origin, and sends its public key beside it, so the push service can tell our pushes from anyone's.

   The keys are base64url, as browsers and every push tool print them: the PUBLIC key is the 65-byte
   uncompressed P-256 point (it is also what the page passes to `pushManager.subscribe`), the PRIVATE key
   the 32-byte scalar `d`. `.claude/make-vapid-keys.js` makes a pair. Never commit the private key. */

const te = new TextEncoder();

export function b64uEncode(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function b64uDecode(str) {
  const s = String(str).replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s + "===".slice((s.length + 3) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function concat(...parts) {
  const n = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
async function hmac(key, data) {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}
// a P-256 key as a JWK from the raw uncompressed point (and the private scalar, when there is one)
function p256Jwk(pubRaw, dRaw) {
  if (pubRaw.length !== 65 || pubRaw[0] !== 4) throw new Error("not an uncompressed P-256 public key");
  const jwk = { kty: "EC", crv: "P-256", x: b64uEncode(pubRaw.slice(1, 33)), y: b64uEncode(pubRaw.slice(33, 65)), ext: true };
  if (dRaw) jwk.d = b64uEncode(dRaw);
  return jwk;
}

/* RFC 8291 §3–4: encrypt `plaintext` (bytes) for one subscription. `opts.salt`, `opts.asPublic`,
   `opts.asPrivate` (base64url) fix what is otherwise random — for the RFC's test vector only. */
export async function encryptPayload(plaintext, uaPublicB64u, authB64u, opts = {}) {
  const uaPub = b64uDecode(uaPublicB64u);
  const auth = b64uDecode(authB64u);
  if (auth.length !== 16) throw new Error("the auth secret is 16 bytes");
  let asPriv, asPub;
  if (opts.asPrivate) {
    asPub = b64uDecode(opts.asPublic);
    asPriv = await crypto.subtle.importKey("jwk", p256Jwk(asPub, b64uDecode(opts.asPrivate)), { name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
  } else {
    const kp = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
    asPriv = kp.privateKey;
    asPub = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  }
  // importing the user agent's key checks it is a point on P-256 (RFC 8291 §8)
  const uaKey = await crypto.subtle.importKey("raw", uaPub, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, asPriv, 256));
  // combine the ECDH secret with the auth secret: HKDF(salt = auth, IKM = ecdh, info = "WebPush: info" 0x00 ua as)
  const prkKey = await hmac(auth, ecdh);
  const ikm = await hmac(prkKey, concat(te.encode("WebPush: info\0"), uaPub, asPub, [1]));
  // RFC 8188: the content encryption key and nonce from the salt
  const salt = opts.salt ? b64uDecode(opts.salt) : crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, concat(te.encode("Content-Encoding: aes128gcm\0"), [1]))).slice(0, 16);
  const nonce = (await hmac(prk, concat(te.encode("Content-Encoding: nonce\0"), [1]))).slice(0, 12);
  const rs = 4096;
  if (plaintext.length > rs - 17) throw new Error("a push payload is one record: " + (rs - 17) + " bytes at most");
  const header = concat(salt, [(rs >>> 24) & 255, (rs >>> 16) & 255, (rs >>> 8) & 255, rs & 255], [asPub.length], asPub);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  // one record, so the padding delimiter is 0x02 (the last record) and there is no padding
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, concat(plaintext, [2])));
  return concat(header, ct);
}

/* RFC 8292: the Authorization header for one push service. The token lives 12 hours (the RFC's ceiling
   is 24). */
export async function vapidAuthorization(endpoint, vapid, nowSec) {
  const aud = new URL(endpoint).origin;
  const now = nowSec != null ? nowSec : Math.floor(Date.now() / 1000);
  const head = b64uEncode(te.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64uEncode(te.encode(JSON.stringify({ aud, exp: now + 12 * 3600, sub: vapid.subject })));
  const key = await crypto.subtle.importKey("jwk", p256Jwk(b64uDecode(vapid.publicKey), b64uDecode(vapid.privateKey)),
    { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  // WebCrypto's ECDSA signature is already r || s (IEEE P1363), which is what JWS ES256 wants
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, te.encode(head + "." + claims)));
  return "vapid t=" + head + "." + claims + "." + b64uEncode(sig) + ", k=" + vapid.publicKey;
}

/* Only the browsers' own push services. The endpoint is written by a reader's browser into a table any
   visitor can add a row to, so without this the sender would POST wherever a stranger pointed it. The
   database refuses other hosts too (push_save); this is the second lock. */
const PUSH_HOSTS = /^(fcm\.googleapis\.com|android\.googleapis\.com|updates\.push\.services\.mozilla\.com|([a-z0-9-]+\.)*push\.apple\.com|([a-z0-9-]+\.)*notify\.windows\.com)$/;
export function pushEndpointAllowed(endpoint) {
  try { const u = new URL(endpoint); return u.protocol === "https:" && !u.port && PUSH_HOSTS.test(u.hostname); }
  catch (e) { return false; }
}

/* Send one push. Resolves the push service's status: 201 delivered to the service, 404 / 410 the
   subscription is gone for good (delete it), anything else a failure to try again another day. */
export async function sendWebPush(sub, payload, vapid, opts = {}) {
  if (!pushEndpointAllowed(sub.endpoint)) return 400;
  const body = await encryptPayload(te.encode(JSON.stringify(payload)), sub.p256dh, sub.auth);
  const res = await (opts.fetch || fetch)(sub.endpoint, {
    method: "POST",
    headers: {
      TTL: String(opts.ttl != null ? opts.ttl : 4 * 3600),   // a reminder older than four hours is not worth delivering
      Urgency: "normal",
      Topic: "folio-remind",                               // a newer reminder replaces one still waiting at the service
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      Authorization: await vapidAuthorization(sub.endpoint, vapid),
    },
    body,
  });
  return res.status;
}
