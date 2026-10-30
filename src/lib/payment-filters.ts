import type { Payment, PaymentFilters } from "@/api/payments/interface";
import { berlinDayRange } from "@/core";

// The URL is the source of truth for the payments page: a link or a reload shows the same list.
// Search text and dates have their own controls; the filter menu owns status, mensa and till.
export type FilterDraft = { status: string; mensa: string; till: string };
export type FilterKey = keyof FilterDraft;
export type ActiveFilter = { key: FilterKey; value: string };
export type DayRange = { from: string; to: string };

export const STATUSES: Payment["status"][] = ["pending", "confirmed", "declined"];
export const EMPTY_DRAFT: FilterDraft = { status: "", mensa: "", till: "" };

const DRAFT_KEYS = Object.keys(EMPTY_DRAFT) as FilterKey[];

export function draftFrom(params: URLSearchParams): FilterDraft {
  const draft = { ...EMPTY_DRAFT };
  for (const key of DRAFT_KEYS) draft[key] = params.get(key) ?? "";
  return draft;
}

export function withDraft(params: URLSearchParams, draft: FilterDraft): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const key of DRAFT_KEYS) {
    const value = draft[key].trim();
    // A till belongs to a mensa; without one it would narrow to nothing.
    if (value && !(key === "till" && !draft.mensa)) next.set(key, value);
    else next.delete(key);
  }
  return next;
}

export function withSearch(params: URLSearchParams, text: string): URLSearchParams {
  const next = new URLSearchParams(params);
  const q = text.trim();
  if (q) next.set("q", q);
  else next.delete("q");
  return next;
}

export function withDates(params: URLSearchParams, range: DayRange): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const key of ["from", "to"] as const) {
    if (range[key]) next.set(key, range[key]);
    else next.delete(key);
  }
  return next;
}

export function activeFilters(params: URLSearchParams): ActiveFilter[] {
  return DRAFT_KEYS.flatMap((key) => {
    const value = params.get(key);
    return value ? [{ key, value }] : [];
  });
}

export const appliedCount = (params: URLSearchParams) => activeFilters(params).length;

export function withoutFilter(params: URLSearchParams, key: FilterKey): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete(key);
  if (key === "mensa") next.delete("till");
  return next;
}

export function filtersFrom(params: URLSearchParams): PaymentFilters {
  const from = params.get("from");
  const to = params.get("to");
  return {
    q: params.get("q") || undefined,
    status: (params.get("status") as Payment["status"]) || undefined,
    mensaId: params.get("mensa") || undefined,
    tillId: params.get("till") || undefined,
    from: from ? berlinDayRange(from).from : undefined,
    to: to ? berlinDayRange(to).to : undefined,
  };
}
