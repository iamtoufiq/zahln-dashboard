import type { Payment } from "@/api/payments/interface";
import { berlinDateTime, type Locale } from "@/core";

const BOM = "﻿";
const COLUMNS = [
  "payment_id",
  "order_id",
  "created_at",
  "mensa",
  "till",
  "payer_id",
  "price_group",
  "status",
  "amount_eur",
  "refunded_eur",
  "refundable_eur",
  "pending_refund_eur",
  "attention_reasons",
];

// German Excel splits on ";" and reads "12,50" as a number; English Excel expects "," and "12.50".
const FORMAT: Record<Locale, { separator: string; decimal: string }> = {
  en: { separator: ",", decimal: "." },
  de: { separator: ";", decimal: "," },
};

function cell(value: string, separator: string): string {
  // A leading = + - @ (or a tab or CR before one) would run as a formula when finance opens the file.
  const safe = /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
  const needsQuotes = safe.includes(separator) || /["\r\n]/.test(safe);
  return needsQuotes ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(payments: Payment[], locale: Locale): string {
  const { separator, decimal } = FORMAT[locale];
  const euros = (cents: number) => (cents / 100).toFixed(2).replace(".", decimal);
  const row = (p: Payment) =>
    [
      p.id,
      p.orderId,
      berlinDateTime(p.createdAt),
      p.mensa.name,
      p.till.name,
      p.payer.id,
      p.priceGroup,
      p.status,
      euros(p.amountCents),
      euros(p.refundedAmountCents),
      euros(p.refundableAmountCents),
      euros(p.pendingRefundAmountCents),
      p.attentionReasons.join("|"),
    ]
      .map((value) => cell(value, separator))
      .join(separator);
  return BOM + [COLUMNS.join(separator), ...payments.map(row)].join("\r\n");
}
