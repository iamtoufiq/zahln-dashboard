import { expect, test } from "vitest";

import {
  activeFilters,
  appliedCount,
  draftFrom,
  EMPTY_DRAFT,
  filtersFrom,
  withDates,
  withDraft,
  withoutFilter,
  withSearch,
} from "../payment-filters";

const params = (query: string) => new URLSearchParams(query);

test("a draft reads every filter from the URL, and nothing else", () => {
  expect(draftFrom(params("q=pay_1&status=confirmed&mensa=m1&till=t1&from=2026-10-01"))).toEqual({
    status: "confirmed",
    mensa: "m1",
    till: "t1",
  });
});

test("applying a draft keeps the search text and dates and drops empty fields", () => {
  const next = withDraft(params("q=pay_1&status=declined&from=2026-10-01"), {
    ...EMPTY_DRAFT,
    mensa: "m1",
  });
  expect(next.toString()).toBe("q=pay_1&from=2026-10-01&mensa=m1");
});

test("a till without its mensa is dropped", () => {
  expect(withDraft(params(""), { ...EMPTY_DRAFT, till: "t1" }).toString()).toBe("");
});

test("searching keeps the filters and an empty search removes q", () => {
  expect(withSearch(params("status=confirmed"), " pay_1 ").toString()).toBe(
    "status=confirmed&q=pay_1",
  );
  expect(withSearch(params("q=pay_1&status=confirmed"), "  ").toString()).toBe("status=confirmed");
});

test("the filter count covers status, mensa and till; dates have their own control", () => {
  expect(appliedCount(params("q=x&from=2026-10-01"))).toBe(0);
  expect(appliedCount(params("status=confirmed&mensa=m1&till=t1&from=2026-10-01"))).toBe(3);
});

test("dates are set together and an empty range removes both", () => {
  expect(withDates(params("q=x"), { from: "2026-10-01", to: "2026-10-07" }).toString()).toBe(
    "q=x&from=2026-10-01&to=2026-10-07",
  );
  expect(
    withDates(params("from=2026-10-01&to=2026-10-07&q=x"), { from: "", to: "" }).toString(),
  ).toBe("q=x");
});

test("removing the mensa also removes its till", () => {
  expect(withoutFilter(params("mensa=m1&till=t1&status=pending"), "mensa").toString()).toBe(
    "status=pending",
  );
});

test("active filters list the menu filters in a stable order", () => {
  expect(activeFilters(params("to=2026-10-02&status=pending&till=t1&mensa=m1"))).toEqual([
    { key: "status", value: "pending" },
    { key: "mensa", value: "m1" },
    { key: "till", value: "t1" },
  ]);
});

test("API filters turn Berlin days into instants", () => {
  const api = filtersFrom(params("status=confirmed&from=2026-10-29&to=2026-10-29"));
  expect(api.status).toBe("confirmed");
  expect(api.from).toBe("2026-10-29T00:00:00+01:00");
  expect(api.to?.startsWith("2026-10-30T00:00:00")).toBe(true);
});
