/**
 * Civil (calendar) date helpers that are independent of the server's or the
 * browser's local time zone. A civil date is a "YYYY-MM-DD" string that is
 * always interpreted in the club's time zone (Europe/Dublin).
 *
 * Internally a civil date is represented as a UTC-noon Date so that date-fns
 * day arithmetic never crosses a midnight because of DST or local offsets.
 */
import { addDays, startOfISOWeek } from "date-fns";
import { CLUB_TIME_ZONE, clubDayKey } from "./format";

export type CivilDate = string; // YYYY-MM-DD

export function civilToNoon(ymd: CivilDate): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function noonToCivil(date: Date): CivilDate {
  return date.toISOString().slice(0, 10);
}

export function civilAddDays(ymd: CivilDate, days: number): CivilDate {
  return noonToCivil(addDays(civilToNoon(ymd), days));
}

/** Monday of the ISO week containing `ymd`. */
export function civilWeekStart(ymd: CivilDate): CivilDate {
  // startOfISOWeek works in local time; UTC-noon keeps the calendar day intact
  // for every offset between UTC-11 and UTC+11.
  const noon = civilToNoon(ymd);
  const local = new Date(noon.getUTCFullYear(), noon.getUTCMonth(), noon.getUTCDate(), 12);
  const monday = startOfISOWeek(local);
  return noonToCivil(new Date(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate(), 12)));
}

/** ISO weekday: Monday = 1 … Sunday = 7. */
export function civilWeekday(ymd: CivilDate): number {
  const d = civilToNoon(ymd).getUTCDay();
  return d === 0 ? 7 : d;
}

export function civilDiffDays(a: CivilDate, b: CivilDate): number {
  return Math.round((civilToNoon(a).getTime() - civilToNoon(b).getTime()) / 86_400_000);
}

export function civilMonthStart(ymd: CivilDate): CivilDate {
  return `${ymd.slice(0, 8)}01`;
}

export function civilAddMonths(ymd: CivilDate, months: number): CivilDate {
  const [y, m] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + months, 1, 12));
  return noonToCivil(date);
}

export function civilMonthEnd(ymd: CivilDate): CivilDate {
  return civilAddDays(civilAddMonths(civilMonthStart(ymd), 1), -1);
}

/** Today's civil date in the club's time zone. */
export function clubToday(now: Date = new Date()): CivilDate {
  return clubDayKey(now);
}

/** Offset (minutes) of the club's time zone from UTC at a given instant. */
function clubOffsetMinutes(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLUB_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

/** Convert a club-local wall-clock time to a UTC instant. */
export function clubLocalToInstant(ymd: CivilDate, hhmm: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const offset = clubOffsetMinutes(new Date(guess));
  const first = guess - offset * 60_000;
  // Re-check once in case the guess straddled a DST change.
  const offset2 = clubOffsetMinutes(new Date(first));
  return new Date(guess - offset2 * 60_000);
}

/** Start of a civil day (00:00 club time) as an instant. */
export function clubDayStart(ymd: CivilDate): Date {
  return clubLocalToInstant(ymd, "00:00");
}
