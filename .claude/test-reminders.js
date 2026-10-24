/* test-reminders.js — the study reminders' sender, without a browser, a database or the network (Oct 2026).

     node .claude/test-reminders.js

   Re-run after touching server/webpush.js, server/reminders.js or functions/api/remind.js (docs/reminders.md).

   1. ENCRYPTION is RFC 8291's own worked example (§5 and Appendix A), byte for byte: given the RFC's salt and
      both key pairs, encryptPayload must produce the RFC's message. Encryption that is subtly wrong is a push
      the browser silently drops, so nothing short of the published vector is a test of it.
   2. VAPID: the JWT verifies under the public key, names the push service's origin, expires within 24 h.
   3. The endpoint allowlist: the browsers' push services only.
   4. WHEN: the reminder moment in several zones (a half-hour offset, a DST change), a day that ends after
      midnight, studied today, already sent, too late, an unknown zone.
   5. WHAT: the message's wording in each case, and the badge count.
   6. functions/api/remind.js end to end against a fake Supabase and a fake push service. */
"use strict";
const path = require("path");
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) { passes++; } else { fails++; console.log("  \x1b[31mFAIL\x1b[0m  " + m); } };
const eq = (a, b, m) => ok(a === b, m + " — got " + JSON.stringify(a) + ", want " + JSON.stringify(b));

(async () => {
  const wp = await import(path.join(__dirname, "../server/webpush.js"));
  const rm = await import(path.join(__dirname, "../server/reminders.js"));

  console.log("\n1) RFC 8291's worked example");
  const te = new TextEncoder();
  const plaintext = wp.b64uDecode("V2hlbiBJIGdyb3cgdXAsIEkgd2FudCB0byBiZSBhIHdhdGVybWVsb24");
  eq(new TextDecoder().decode(plaintext), "When I grow up, I want to be a watermelon", "the vector's plaintext");
  const body = await wp.encryptPayload(plaintext,
    "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4",
    "BTBZMqHH6r4Tts7J_aSIgg",
    { salt: "DGv6ra1nlYgDCS1FRnbzlw",
      asPublic: "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8",
      asPrivate: "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw" });
  const want = "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27ml" +
    "mlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPT" +
    "pK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN";
  eq(wp.b64uEncode(body), want, "encryptPayload reproduces RFC 8291 §5");
  // 86-byte header + 41-byte plaintext + delimiter + 16-byte tag. (The RFC's sample request says
  // Content-Length: 145, but its own base64 body, matched above, decodes to 144.)
  eq(body.length, 144, "86 + 41 + 1 + 16 bytes");
  // a random encryption has the same shape and a fresh salt each time
  const a = await wp.encryptPayload(te.encode("x"), "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4", "BTBZMqHH6r4Tts7J_aSIgg");
  const b = await wp.encryptPayload(te.encode("x"), "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4", "BTBZMqHH6r4Tts7J_aSIgg");
  ok(a.length === 86 + 1 + 1 + 16 && wp.b64uEncode(a.slice(0, 16)) !== wp.b64uEncode(b.slice(0, 16)), "a real encryption: 86-byte header, one record, a fresh salt");
  let threw = false;
  try { await wp.encryptPayload(te.encode("x"), "BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "BTBZMqHH6r4Tts7J_aSIgg"); } catch (e) { threw = true; }
  ok(threw, "a public key that is not on P-256 is refused (RFC 8291 §8)");

  console.log("2) VAPID");
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const pubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  const vapid = { publicKey: wp.b64uEncode(pubRaw), privateKey: (await crypto.subtle.exportKey("jwk", kp.privateKey)).d, subject: "mailto:test@example.org" };
  const now = 1790000000;
  const auth = await wp.vapidAuthorization("https://fcm.googleapis.com/fcm/send/abc", vapid, now);
  const m = /^vapid t=([^.]+)\.([^.]+)\.([^,]+), k=(.+)$/.exec(auth);
  ok(!!m, "the header is `vapid t=<jwt>, k=<key>`");
  if (m) {
    const claims = JSON.parse(new TextDecoder().decode(wp.b64uDecode(m[2])));
    eq(claims.aud, "https://fcm.googleapis.com", "aud is the push service's origin");
    ok(claims.exp > now && claims.exp - now <= 86400, "exp is within 24 h");
    eq(claims.sub, "mailto:test@example.org", "sub is the contact");
    eq(m[4], vapid.publicKey, "k is the public key");
    const okSig = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, kp.publicKey, wp.b64uDecode(m[3]), te.encode(m[1] + "." + m[2]));
    ok(okSig, "the ES256 signature verifies under the public key");
  }

  console.log("3) the endpoint allowlist");
  for (const u of ["https://fcm.googleapis.com/fcm/send/x", "https://updates.push.services.mozilla.com/wpush/v2/x", "https://web.push.apple.com/x", "https://wns2-par02p.notify.windows.com/w/?token=x"]) ok(wp.pushEndpointAllowed(u), "allowed: " + u);
  for (const u of ["http://fcm.googleapis.com/x", "https://evil.example/x", "https://fcm.googleapis.com.evil.example/x", "https://localhost/x", "https://fcm.googleapis.com:8443/x", "javascript:alert(1)", "https://push.apple.com.evil.example/x"]) ok(!wp.pushEndpointAllowed(u), "refused: " + u);

  console.log("4) when");
  const T = (s) => Date.parse(s);   // an instant, written in UTC
  const row = (o) => Object.assign({ tz: "Europe/Amsterdam", remind_at: 1200, day_end: 0, last_study: null, sent_day: null, streak: 0, due: 0 }, o);
  // Amsterdam is UTC+2 on 2026-10-24 (summer time ends 2026-10-25)
  eq(rm.dueDay(row({}), T("2026-10-24T17:59:00Z")), null, "19:59 Amsterdam: not yet");
  eq(rm.dueDay(row({}), T("2026-10-24T18:00:00Z")), "2026-10-24", "20:00 Amsterdam: due");
  eq(rm.dueDay(row({}), T("2026-10-24T21:00:00Z")), "2026-10-24", "23:00 Amsterdam: still due (three hours late)");
  eq(rm.dueDay(row({}), T("2026-10-24T21:01:00Z")), null, "23:01 Amsterdam: too late, not sent");
  eq(rm.dueDay(row({}), T("2026-10-26T19:00:00Z")), "2026-10-26", "after the change to winter time, 20:00 is 19:00 UTC");
  eq(rm.dueDay(row({ last_study: "2026-10-24" }), T("2026-10-24T18:30:00Z")), null, "studied today: no reminder");
  eq(rm.dueDay(row({ last_study: "2026-10-23" }), T("2026-10-24T18:30:00Z")), "2026-10-24", "studied yesterday: reminded");
  eq(rm.dueDay(row({ sent_day: "2026-10-24" }), T("2026-10-24T18:30:00Z")), null, "already reminded today");
  eq(rm.dueDay(row({ tz: "Asia/Kolkata" }), T("2026-10-24T14:30:00Z")), "2026-10-24", "Kolkata (UTC+5:30): 20:00 is 14:30 UTC");
  eq(rm.dueDay(row({ tz: "Asia/Kolkata" }), T("2026-10-24T14:29:00Z")), null, "Kolkata: a minute early");
  eq(rm.dueDay(row({ tz: "America/Los_Angeles", remind_at: 7 * 60 + 30 }), T("2026-10-24T14:30:00Z")), "2026-10-24", "Los Angeles 07:30 (UTC-7)");
  // the day ends at 2 a.m.: at 01:00 on the 25th it is still the 24th; a 01:00 reminder belongs to the 24th
  const late = row({ day_end: 120, remind_at: 60 });
  eq(rm.dueDay(late, T("2026-10-24T23:00:00Z")), "2026-10-24", "day ends 02:00, reminder 01:00: due at 01:00 on the 25th, for the 24th");
  eq(rm.dueDay(row({ day_end: 120, last_study: "2026-10-24" }), T("2026-10-24T23:30:00Z")), null, "day ends 02:00: studied at 00:30 counts for the 24th");
  eq(rm.dueDay(row({ tz: "Not/AZone" }), T("2026-10-24T20:00:00Z")), "2026-10-24", "an unknown zone reads as UTC");
  eq(rm.dueDay(row({ remind_at: null }), T("2026-10-24T18:05:00Z")), "2026-10-24", "no time chosen: 8 p.m.");
  eq(rm.REMIND_DEFAULT_AT, 1200, "the default is 8 p.m.");

  console.log("5) what");
  eq(rm.messageFor(row({ due: 12 }), "2026-10-24").body, "12 cards are due for review.", "cards due");
  eq(rm.messageFor(row({ due: 1 }), "2026-10-24").body, "1 card is due for review.", "one card due");
  eq(rm.messageFor(row({ due: 0 }), "2026-10-24").body, "Ready for today's study?", "nothing due");
  eq(rm.messageFor(row({ due: 3, streak: 9, last_study: "2026-10-23" }), "2026-10-24").body, "Your 9-day streak ends tonight. 3 cards are due.", "a live streak and cards");
  eq(rm.messageFor(row({ due: 0, streak: 9, last_study: "2026-10-23" }), "2026-10-24").body, "Your 9-day streak ends tonight. A few minutes keeps it going.", "a live streak, nothing due");
  eq(rm.messageFor(row({ due: 3, streak: 9, last_study: "2026-10-20" }), "2026-10-24").body, "3 cards are due for review.", "a broken streak is not mentioned");
  eq(rm.messageFor(row({ due: 3, streak: 1, last_study: "2026-10-23" }), "2026-10-24").body, "3 cards are due for review.", "a one-day run is not a streak worth naming");
  eq(rm.messageFor(row({ due: 1400 }), "2026-10-24").body, "1,400 cards are due for review.", "a large count is grouped");
  eq(rm.messageFor(row({ due: 5 }), "2026-10-24").due, 5, "the badge count rides along");
  eq(rm.messageFor(row({ due: 5, badge: false }), "2026-10-24").due, undefined, "no badge count when the reader turned the badge off");
  eq(rm.messageFor(row({}), "2026-10-31").url, "./#decks", "a tap opens the decks");

  console.log("6) functions/api/remind.js end to end");
  const fn = await import(path.join(__dirname, "../functions/api/remind.js"));
  const sub = { p256dh: "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4", auth: "BTBZMqHH6r4Tts7J_aSIgg" };
  const nowIso = new Date().toISOString();
  // three rows due right now (remind_at = the current UTC minute, tz UTC), one studied today, one gone
  const nowD = new Date(), minute = nowD.getUTCHours() * 60 + nowD.getUTCMinutes();
  const today = nowIso.slice(0, 10);
  const rows = [
    Object.assign({ id: "a", endpoint: "https://fcm.googleapis.com/fcm/send/a", tz: "UTC", remind_at: minute, day_end: 0, due: 4 }, sub),
    Object.assign({ id: "b", endpoint: "https://updates.push.services.mozilla.com/wpush/v2/b", tz: "UTC", remind_at: minute, day_end: 0, last_study: today }, sub),
    Object.assign({ id: "c", endpoint: "https://web.push.apple.com/c", tz: "UTC", remind_at: minute, day_end: 0 }, sub),
  ];
  const calls = [];
  const realFetch = global.fetch;
  global.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    const u = String(url);
    const reply = (status, obj) => new Response(obj === undefined ? null : JSON.stringify(obj), { status });
    if (u.endsWith("/rest/v1/rpc/push_candidates")) return reply(200, rows);
    if (u.endsWith("/rest/v1/rpc/push_claim")) return reply(200, JSON.parse(init.body).p.map((x) => x.id));
    if (u.endsWith("/rest/v1/rpc/push_gone")) return reply(204);
    if (u.startsWith("https://web.push.apple.com/")) return reply(410);
    return reply(201);
  };
  const env = { REMIND_SECRET: "s3cret", VAPID_PUBLIC_KEY: vapid.publicKey, VAPID_PRIVATE_KEY: vapid.privateKey, VAPID_SUBJECT: vapid.subject, SUPABASE_SERVICE_KEY: "sb_secret_test" };
  const denied = await fn.onRequestPost({ request: new Request("https://folio.study/api/remind", { method: "POST" }), env });
  eq(denied.status, 401, "no secret: 401");
  const unset = await fn.onRequestPost({ request: new Request("https://folio.study/api/remind", { method: "POST", headers: { Authorization: "Bearer s3cret" } }), env: { REMIND_SECRET: "s3cret" } });
  eq(unset.status, 503, "keys not set: 503");
  calls.length = 0;
  const res = await fn.onRequestPost({ request: new Request("https://folio.study/api/remind", { method: "POST", headers: { Authorization: "Bearer s3cret" } }), env });
  const out = await res.json();
  eq(res.status, 200, "a run answers 200");
  eq(out.due, 2, "two rows due (the third studied today)");
  eq(out.sent, 1, "one delivered");
  eq(out.gone, 1, "one gone (410)");
  const claim = calls.find((c) => c.url.endsWith("push_claim"));
  ok(claim && JSON.parse(claim.init.body).p.every((x) => x.day === today), "claimed for today's day key");
  const pushes = calls.filter((c) => !/supabase\.co/.test(c.url));
  ok(pushes.length === 2 && pushes.every((c) => c.init.headers["Content-Encoding"] === "aes128gcm" && /^vapid t=/.test(c.init.headers.Authorization) && c.init.headers.TTL), "each push is aes128gcm with a VAPID header and a TTL");
  ok(calls.filter((c) => /supabase\.co/.test(c.url)).every((c) => c.init.headers.apikey === "sb_secret_test" && !c.init.headers.Authorization), "a new-style secret key goes in apikey alone");
  const gone = calls.find((c) => c.url.endsWith("push_gone"));
  ok(gone && JSON.stringify(JSON.parse(gone.init.body).ids) === '["c"]', "the 410 subscription is deleted");
  global.fetch = realFetch;

  console.log("\n" + passes + " passed, " + fails + " failed");
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
