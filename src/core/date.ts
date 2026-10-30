import type { Locale } from "./i18n";

function perLocale(options: Intl.DateTimeFormatOptions, de: Intl.DateTimeFormatOptions = {}) {
  const cache = new Map<Locale, Intl.DateTimeFormat>();
  return (locale: Locale) => {
    let formatter = cache.get(locale);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", {
        timeZone: "Europe/Berlin",
        ...options,
        ...(locale === "de" ? de : {}),
      });
      cache.set(locale, formatter);
    }
    return formatter;
  };
}

const dateTime = perLocale(
  { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" },
  { month: "2-digit" },
);
const time = perLocale({ hour: "2-digit", minute: "2-digit" });
const day = perLocale(
  { day: "numeric", month: "short", year: "numeric" },
  { month: "2-digit", day: "2-digit" },
);

export const formatDateTime = (iso: string, locale: Locale): string =>
  dateTime(locale).format(new Date(iso));

export const formatTime = (ms: number, locale: Locale): string => time(locale).format(new Date(ms));

// A "YYYY-MM-DD" Berlin day; noon UTC sits inside that day in Berlin all year.
export const formatDay = (isoDay: string, locale: Locale): string =>
  day(locale).format(new Date(`${isoDay}T12:00:00Z`));

const BERLIN_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" });
const BERLIN_OFFSET = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  timeZoneName: "longOffset",
});

export const berlinDay = (date: Date): string => BERLIN_DAY.format(date);

// "2026-10-29 12:05:00": sortable, and read as a date by spreadsheets.
const BERLIN_DATE_TIME = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export const berlinDateTime = (iso: string): string => BERLIN_DATE_TIME.format(new Date(iso));

function berlinMidnightOffset(day: string): string {
  // DST switches at 02:00/03:00, so the offset two hours before UTC midnight is the one at Berlin midnight.
  const probe = new Date(Date.parse(`${day}T00:00:00Z`) - 2 * 3600_000);
  const name = BERLIN_OFFSET.formatToParts(probe).find((p) => p.type === "timeZoneName")?.value;
  return name?.replace("GMT", "") || "+00:00";
}

function nextDay(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function berlinDayRange(day: string): { from: string; to: string } {
  const next = nextDay(day);
  return {
    from: `${day}T00:00:00${berlinMidnightOffset(day)}`,
    to: `${next}T00:00:00${berlinMidnightOffset(next)}`,
  };
}
