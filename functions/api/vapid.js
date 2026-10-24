/* GET /api/vapid — the public half of the reminder key pair, for `pushManager.subscribe` (Oct 2026,
   docs/reminders.md). Served from the Pages secret VAPID_PUBLIC_KEY rather than written into app.js, so the
   key is set in one place and can be rotated without a release. Not configured → 404 { key: null }, and
   Settings says reminders are not switched on for the site yet. */
export async function onRequestGet({ env }) {
  const key = env.VAPID_PUBLIC_KEY || null;
  return new Response(JSON.stringify({ key }), {
    status: key ? 200 : 404,
    headers: { "Content-Type": "application/json", "Cache-Control": key ? "public, max-age=300" : "no-store" },
  });
}
