/**
 * Formatting utilities. All display formatting goes through here so that
 * euro amounts, dates and times are consistent across the site, and identical
 * on server and client (explicit locale + time zone avoid hydration drift).
 */
import type { MetricFormat, PokerVariant, TournamentStatus, BuyIn } from "./schemas";

export const CLUB_TIME_ZONE = "Europe/Dublin";
export const LOCALE = "en-IE";

const euroWhole = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const euroExact = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});
const integer = new Intl.NumberFormat(LOCALE);
const decimal1 = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1, minimumFractionDigits: 1 });

/** €1,250 — drops cents when the amount is whole. */
export function formatEuro(cents: number): string {
  return cents % 100 === 0 ? euroWhole.format(cents / 100) : euroExact.format(cents / 100);
}

/** €50 + €10, or €40 + €20 bounty + €10 */
export function formatBuyIn(b: BuyIn): string {
  const parts = [formatEuro(b.entryCents)];
  if (b.bountyCents) parts.push(`${formatEuro(b.bountyCents)} bounty`);
  parts.push(formatEuro(b.feeCents));
  return parts.join(" + ");
}

export function buyInTotal(b: BuyIn): number {
  return b.entryCents + b.bountyCents + b.feeCents;
}

export function formatInteger(n: number): string {
  return integer.format(n);
}

/** 30,000 → "30k"; 1,500 → "1.5k" */
export function formatChipsShort(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return String(n);
}

export function formatMetric(value: number, format: MetricFormat): string {
  switch (format) {
    case "euro":
      return formatEuro(value);
    case "hours":
      return decimal1.format(value);
    case "points":
    case "integer":
    default:
      return integer.format(value);
  }
}

function dtf(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: CLUB_TIME_ZONE, ...options });
}

const fmt = {
  time: dtf({ hour: "2-digit", minute: "2-digit", hour12: false }),
  weekdayShort: dtf({ weekday: "short" }),
  weekdayLong: dtf({ weekday: "long" }),
  day: dtf({ day: "numeric" }),
  monthShort: dtf({ month: "short" }),
  monthLong: dtf({ month: "long" }),
  dayMonth: dtf({ day: "numeric", month: "short" }),
  full: dtf({ weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  medium: dtf({ weekday: "short", day: "numeric", month: "short" }),
  mediumYear: dtf({ day: "numeric", month: "short", year: "numeric" }),
  monthYear: dtf({ month: "long", year: "numeric" }),
  ymd: dtf({ year: "numeric", month: "2-digit", day: "2-digit" }),
};

const toDate = (v: string | Date) => (typeof v === "string" ? new Date(v) : v);

export const formatTime = (v: string | Date) => fmt.time.format(toDate(v));
export const formatWeekdayShort = (v: string | Date) => fmt.weekdayShort.format(toDate(v));
export const formatWeekdayLong = (v: string | Date) => fmt.weekdayLong.format(toDate(v));
export const formatDayOfMonth = (v: string | Date) => fmt.day.format(toDate(v));
export const formatMonthShort = (v: string | Date) => fmt.monthShort.format(toDate(v));
export const formatMonthLong = (v: string | Date) => fmt.monthLong.format(toDate(v));
export const formatDayMonth = (v: string | Date) => fmt.dayMonth.format(toDate(v));
export const formatFullDate = (v: string | Date) => fmt.full.format(toDate(v));
export const formatMediumDate = (v: string | Date) => fmt.medium.format(toDate(v));
export const formatMediumDateYear = (v: string | Date) => fmt.mediumYear.format(toDate(v));
export const formatMonthYear = (v: string | Date) => fmt.monthYear.format(toDate(v));

/** Calendar day key (YYYY-MM-DD) of an instant, in the club's time zone. */
export function clubDayKey(v: string | Date): string {
  const parts = fmt.ymd.formatToParts(toDate(v));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Format a calendar date string ("YYYY-MM-DD") without time-zone drift. */
export function formatCalendarDate(ymd: string, style: "medium" | "long" = "medium"): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: "UTC",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(date);
}

export const VARIANT_LABEL: Record<PokerVariant, string> = {
  NLHE: "No-Limit Hold'em",
  PLO: "Pot-Limit Omaha",
};
export const VARIANT_SHORT: Record<PokerVariant, string> = {
  NLHE: "NLH",
  PLO: "PLO",
};

export const STATUS_LABEL: Record<TournamentStatus, string> = {
  scheduled: "Scheduled",
  "registration-open": "Registration open",
  "late-registration": "Late registration",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
