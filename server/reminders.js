/* server/reminders.js — WHEN a reader is reminded and WHAT the reminder says (Oct 2026, docs/reminders.md).

   Pure arithmetic, so it is tested in Node (.claude/test-reminders.js) without a database, a clock or a
   push service. functions/api/remind.js asks the database for the rows not yet reminded today
   (push_candidates), keeps the ones `dueDay` says are due NOW, claims them (push_claim, which is what makes
   two overlapping runs send once), and sends `messageFor` to each.

   A row carries the reader's own clock: `tz` (IANA, from their browser), `remind_at` (minutes past local
   midnight; 1200, 8 p.m., unless they chose another time), `day_end` (Settings → Study → "the day ends at",
   minutes past midnight, 0–720 — the same boundary app.js's dayKey uses, so "today" means the same thing
   on the phone and here), `last_study` (the reader's day key, YYYY-MM-DD, of the last day they studied),
   `streak` (that run's length), `due` (cards due by the reminder, counted on the phone), `badge` and
   `sent_day` (the day key last reminded). */

export const REMIND_DEFAULT_AT = 20 * 60;   // 8 p.m., the owner's choice (2026-10-24)
export const LATE_LIMIT_MIN = 180;          // a reminder more than three hours late is not sent at all

const pad = (n) => String(n).padStart(2, "0");
const iso = (ms) => { const d = new Date(ms); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); };

// the wall-clock time in `tz` at `nowMs`, as a UTC millisecond count (so day arithmetic is plain sums)
export function wallClock(tz, nowMs) {
  let parts;
  try {
    parts = new Intl.DateTimeFormat("en-US", { timeZone: tz || "UTC", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(nowMs));
  } catch (e) {
    return wallClock("UTC", nowMs);   // an unknown zone is read as UTC rather than failing the run
  }
  const g = (t) => Number((parts.find((p) => p.type === t) || {}).value);
  return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"));
}
const clampInt = (v, lo, hi, dflt) => { if (v == null || v === "") return dflt; const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : dflt; };

/* The reader's study day at `nowMs`, and the moment within it they asked to be reminded. A day runs from
   `day_end` past one midnight to `day_end` past the next; the reminder sits `remind_at` past midnight, on
   the day it falls inside (so with the day ending at 2 a.m., a 1 a.m. reminder belongs to the day before). */
export function studyClock(row, nowMs) {
  const wall = wallClock(row.tz, nowMs);
  const dayEnd = clampInt(row.day_end, 0, 720, 0);
  const at = clampInt(row.remind_at, 0, 1439, REMIND_DEFAULT_AT);
  const day = iso(wall - dayEnd * 60000);
  const dayStart = Date.parse(day + "T00:00:00Z") + dayEnd * 60000;
  const remindWall = dayStart + ((at - dayEnd + 1440) % 1440) * 60000;
  return { wall, day, remindWall };
}

// the day key to remind for, or null: past the chosen time (by no more than LATE_LIMIT_MIN), not studied
// today, not already reminded today
export function dueDay(row, nowMs) {
  const { wall, day, remindWall } = studyClock(row, nowMs);
  if (wall < remindWall || wall - remindWall > LATE_LIMIT_MIN * 60000) return null;
  if (row.last_study && String(row.last_study) >= day) return null;
  if (row.sent_day && String(row.sent_day) >= day) return null;
  return day;
}

// the notification for one row on `day`: the sharpest true thing, in one sentence or two
export function messageFor(row, day) {
  const yesterday = iso(Date.parse(day + "T00:00:00Z") - 86400000);
  const streak = clampInt(row.streak, 0, 100000, 0);
  const live = streak >= 2 && row.last_study === yesterday;
  const n = clampInt(row.due, 0, 1000000, 0);
  const cards = n === 1 ? "1 card is due." : n.toLocaleString("en-GB") + " cards are due.";
  let body;
  if (live && n) body = "Your " + streak + "-day streak ends tonight. " + cards;
  else if (live) body = "Your " + streak + "-day streak ends tonight. A few minutes keeps it going.";
  else if (n) body = n === 1 ? "1 card is due for review." : n.toLocaleString("en-GB") + " cards are due for review.";
  else body = "Ready for today's study?";
  const msg = { title: "Folio", body, url: "./#decks", tag: "folio-remind" };
  if (row.badge !== false) msg.due = n;
  return msg;
}
