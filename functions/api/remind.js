/* POST /api/remind — sends the study reminders that are due now (Oct 2026, docs/reminders.md).

   A Cloudflare Pages Function: it deploys with the site on every merge to main and is never served to a
   reader (`_routes.json` sends only /api/* here). Supabase's pg_cron calls it every fifteen minutes with
   `Authorization: Bearer <REMIND_SECRET>` (.claude/supabase-schema.sql, block 18). Each run:

     1. push_candidates()  the rows not yet reminded today (service role only)
     2. dueDay()           keep those whose chosen time has passed and who have not studied today
     3. push_claim()       mark them reminded FIRST, so two overlapping runs never send twice — a run that
                           dies half-way costs a reader one reminder, never a duplicate
     4. send               one encrypted push each (server/webpush.js)
     5. push_gone()        delete the subscriptions the push service says are gone (404 / 410)

   Secrets, set once in Cloudflare → the Pages project → Settings → Variables and secrets (docs/reminders.md
   has the steps): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (a mailto: or https: contact the push
   services may use), SUPABASE_SERVICE_KEY, REMIND_SECRET. SUPABASE_URL is optional (the project's URL is
   public and is the default). Missing secrets → 503 and a sentence, never a crash. */
import { sendWebPush } from "../../server/webpush.js";
import { dueDay, messageFor } from "../../server/reminders.js";

const DEFAULT_SUPABASE_URL = "https://qnrnjjcjeggzndgxtyqx.supabase.co";
const json = (obj, status) => new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export async function onRequestPost({ request, env }) {
  if (!env.REMIND_SECRET || request.headers.get("Authorization") !== "Bearer " + env.REMIND_SECRET) return json({ error: "unauthorised" }, 401);
  const missing = ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT", "SUPABASE_SERVICE_KEY"].filter((k) => !env[k]);
  if (missing.length) return json({ error: "not configured", missing }, 503);
  const base = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_KEY;
  const rpc = async (fn, body) => {
    const headers = { apikey: key, "Content-Type": "application/json" };
    if (/^eyJ/.test(key)) headers.Authorization = "Bearer " + key;   // a legacy JWT service_role key; a new sb_secret_ key goes in apikey alone
    const r = await fetch(base + "/rest/v1/rpc/" + fn, { method: "POST", headers, body: JSON.stringify(body || {}) });
    if (!r.ok) throw new Error(fn + ": HTTP " + r.status + " " + (await r.text()).slice(0, 200));
    return r.json();
  };
  const vapid = { publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY, subject: env.VAPID_SUBJECT };
  const now = Date.now();
  let rows;
  try { rows = await rpc("push_candidates"); } catch (e) { return json({ error: String(e.message || e) }, 502); }
  const due = (rows || []).map((row) => ({ row, day: dueDay(row, now) })).filter((x) => x.day);
  if (!due.length) return json({ candidates: (rows || []).length, due: 0, sent: 0 });
  let claimed;
  try { claimed = new Set((await rpc("push_claim", { p: due.map((x) => ({ id: x.row.id, day: x.day })) })).map((r) => (typeof r === "string" ? r : r.push_claim || r.id))); }
  catch (e) { return json({ error: String(e.message || e) }, 502); }
  const mine = due.filter((x) => claimed.has(x.row.id));
  let sent = 0, failed = 0, i = 0;
  const gone = [];
  const lane = async () => {
    while (i < mine.length) {
      const { row, day } = mine[i++];
      try {
        const status = await sendWebPush(row, messageFor(row, day), vapid);
        if (status >= 200 && status < 300) sent++;
        else if (status === 404 || status === 410 || status === 400) gone.push(row.id);
        else failed++;
      } catch (e) { failed++; }
    }
  };
  await Promise.all(Array.from({ length: Math.min(8, mine.length) }, lane));
  if (gone.length) { try { await rpc("push_gone", { ids: gone }); } catch (e) {} }
  return json({ candidates: rows.length, due: due.length, claimed: mine.length, sent, gone: gone.length, failed });
}
