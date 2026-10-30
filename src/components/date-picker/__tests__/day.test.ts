import { expect, test } from "vitest";

import { addDays, dateOf, dayOf, presetRange } from "../day";

test("a day string and a calendar date convert both ways without shifting", () => {
  expect(dayOf(dateOf("2026-10-25"))).toBe("2026-10-25");
  expect(dateOf("2026-03-29").getDate()).toBe(29);
});

test("adding days crosses month and year ends", () => {
  expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
});

test("presets count back from the server's today", () => {
  expect(presetRange("today", "2026-10-30")).toEqual({ from: "2026-10-30", to: "2026-10-30" });
  expect(presetRange("last7", "2026-10-30")).toEqual({ from: "2026-10-24", to: "2026-10-30" });
  expect(presetRange("month", "2026-10-30")).toEqual({ from: "2026-10-01", to: "2026-10-30" });
});
