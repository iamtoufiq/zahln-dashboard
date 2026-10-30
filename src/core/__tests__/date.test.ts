import { expect, test } from "vitest";

import { berlinDay, berlinDayRange, formatDateTime, formatTime, formatDay } from "../date";

const plain = (s: string) => s.replace(/ | /g, " ");

test("shows mensa time in Berlin, whatever the device zone", () => {
  expect(plain(formatDateTime("2026-10-29T11:05:00Z", "de"))).toBe("29.10.2026, 12:05");
  expect(plain(formatDateTime("2026-10-29T11:05:00Z", "en"))).toBe("29 Oct 2026, 12:05");
});

test("berlinDay gives the calendar day in Berlin", () => {
  expect(berlinDay(new Date("2026-10-29T23:30:00Z"))).toBe("2026-10-30");
  expect(berlinDay(new Date("2026-10-29T10:00:00Z"))).toBe("2026-10-29");
});

test("berlinDayRange gives the UTC bounds of a Berlin day", () => {
  expect(berlinDayRange("2026-10-29")).toEqual({
    from: "2026-10-29T00:00:00+01:00",
    to: "2026-10-30T00:00:00+01:00",
  });
});

test("the day clocks go back starts in summer time and ends in winter time", () => {
  expect(berlinDayRange("2026-10-25")).toEqual({
    from: "2026-10-25T00:00:00+02:00",
    to: "2026-10-26T00:00:00+01:00",
  });
});

test("formatTime shows Berlin hours and minutes", () => {
  const ms = Date.parse("2026-07-01T10:05:00Z");
  expect(formatTime(ms, "de")).toBe("12:05");
  expect(formatTime(ms, "en")).toBe("12:05");
});

test("a Berlin day reads the same in both languages, with no time zone shift", () => {
  expect(formatDay("2026-10-25", "en")).toBe("25 Oct 2026");
  expect(formatDay("2026-10-25", "de")).toBe("25.10.2026");
});
