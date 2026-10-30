import { expect, test, vi } from "vitest";

import type { Payment, PaymentPage } from "@/api/payments/interface";

import { exportAll } from "../export-all";

const p = (id: string, version: number) => ({ id, version }) as Payment;

test("follows cursors until the last page", async () => {
  const pages: Record<string, PaymentPage> = {
    start: { items: [p("a", 1)], nextCursor: "c1" },
    c1: { items: [p("b", 1)], nextCursor: "c2" },
    c2: { items: [p("c", 1)], nextCursor: null },
  };
  const list = vi.fn(async (cursor?: string) => pages[cursor ?? "start"]!);

  const all = await exportAll(list);

  expect(all.map((x) => x.id)).toEqual(["a", "b", "c"]);
  expect(list).toHaveBeenCalledTimes(3);
});

test("a payment seen twice keeps its higher version", async () => {
  const pages: Record<string, PaymentPage> = {
    start: { items: [p("a", 3)], nextCursor: "c1" },
    c1: { items: [p("a", 2), p("b", 1)], nextCursor: null },
  };
  const all = await exportAll(async (cursor) => pages[cursor ?? "start"]!);
  expect(all).toEqual([p("a", 3), p("b", 1)]);
});

test("reports the running count after each page", async () => {
  const pages: Record<string, PaymentPage> = {
    start: { items: [p("a", 1), p("b", 1)], nextCursor: "c1" },
    c1: { items: [p("c", 1)], nextCursor: null },
  };
  const counts: number[] = [];
  await exportAll(
    async (cursor) => pages[cursor ?? "start"]!,
    (n) => counts.push(n),
  );
  expect(counts).toEqual([2, 3]);
});
