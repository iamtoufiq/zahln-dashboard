import { expect, test } from "vitest";

import type { Payment } from "@/api/payments/interface";

import { toCsv } from "../to-csv";

const payment = (patch: Partial<Payment> = {}) =>
  ({
    id: "pay_1",
    orderId: "ord_1",
    createdAt: "2026-10-29T11:05:00Z",
    mensa: { id: "m", name: "Mensa am Campus" },
    till: { id: "t", name: "Kasse 1" },
    payer: { id: "usr_guest", displayName: "Test Guest" },
    priceGroup: "guest",
    status: "confirmed",
    amountCents: 490,
    refundedAmountCents: 100,
    refundableAmountCents: 390,
    pendingRefundAmountCents: 50,
    attentionReasons: ["refund_pending_too_long", "refund_failed"],
    ...patch,
  }) as Payment;

const BOM = "﻿";
const lines = (csv: string) => csv.replace(BOM, "").split("\r\n");

test("writes a header and one line per payment with amounts in euros", () => {
  const [header, line] = lines(toCsv([payment()], "en"));
  expect(header).toBe(
    "payment_id,order_id,created_at,mensa,till,payer_id,price_group,status,amount_eur,refunded_eur,refundable_eur,pending_refund_eur,attention_reasons",
  );
  expect(line).toBe(
    "pay_1,ord_1,2026-10-29 12:05:00,Mensa am Campus,Kasse 1,usr_guest,guest,confirmed,4.90,1.00,3.90,0.50,refund_pending_too_long|refund_failed",
  );
});

test("German files use semicolons and decimal commas so Excel splits the columns", () => {
  const [header, line] = lines(toCsv([payment()], "de"));
  expect(header!.split(";")).toHaveLength(13);
  expect(line).toBe(
    "pay_1;ord_1;2026-10-29 12:05:00;Mensa am Campus;Kasse 1;usr_guest;guest;confirmed;4,90;1,00;3,90;0,50;refund_pending_too_long|refund_failed",
  );
});

test("times are Berlin local time, including summer time", () => {
  const line = lines(toCsv([payment({ createdAt: "2026-07-01T22:30:00Z" })], "en"))[1];
  expect(line).toContain(",2026-07-02 00:30:00,");
});

test("starts with a BOM so Excel reads umlauts", () => {
  expect(toCsv([], "en").startsWith(BOM)).toBe(true);
});

test("quotes fields with commas, quotes or line breaks", () => {
  const line = lines(
    toCsv([payment({ mensa: { id: "m", name: 'Mensa "Nord", Haus 2' } })], "en"),
  )[1];
  expect(line).toContain('"Mensa ""Nord"", Haus 2"');
});

test("quotes fields with the German delimiter", () => {
  const line = lines(toCsv([payment({ mensa: { id: "m", name: "Mensa; Nord" } })], "de"))[1];
  expect(line).toContain('"Mensa; Nord"');
});

test("neutralises spreadsheet formulas, including a leading tab or carriage return", () => {
  for (const name of ["=HYPERLINK(1)", "\t=1+1", "\r=1+1"]) {
    const csv = toCsv([payment({ till: { id: "t", name } })], "en");
    expect(csv).toContain("'" + name);
  }
});
