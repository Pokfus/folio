/* make-vapid-keys.js — prints a fresh VAPID key pair for the study reminders (docs/reminders.md).

     node .claude/make-vapid-keys.js

   Paste VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY into Cloudflare → the Pages project → Settings → Variables and
   secrets (as SECRETS, encrypted). Never commit them. Making a new pair later invalidates every reader's
   subscription: each re-subscribes the next time they open Folio with reminders on (app.js remindSync). */
"use strict";
(async () => {
  const { b64uEncode } = await import("../server/webpush.js");
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const pub = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  const jwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
  console.log("VAPID_PUBLIC_KEY=" + b64uEncode(pub));
  console.log("VAPID_PRIVATE_KEY=" + jwk.d);
})();
