// Days travel as "YYYY-MM-DD" (Berlin days). The calendar works with local Date objects,
// so conversion goes through the date parts only and never through a time zone.
import type { DayRange } from "@/lib/payment-filters";

export type { DayRange };
export type Preset = "today" | "last7" | "month";

const pad = (n: number) => String(n).padStart(2, "0");

export const dateOf = (day: string): Date => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
};

export const dayOf = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function addDays(day: string, days: number): string {
  const date = dateOf(day);
  date.setDate(date.getDate() + days);
  return dayOf(date);
}

export function presetRange(preset: Preset, today: string): DayRange {
  if (preset === "today") return { from: today, to: today };
  if (preset === "last7") return { from: addDays(today, -6), to: today };
  return { from: `${today.slice(0, 8)}01`, to: today };
}
