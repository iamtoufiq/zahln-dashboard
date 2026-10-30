import type { Payment, PaymentPage } from "@/api/payments/interface";
import { newer } from "@/core";

export async function exportAll(
  list: (cursor?: string) => Promise<PaymentPage>,
  onProgress?: (count: number) => void,
): Promise<Payment[]> {
  const byId = new Map<string, Payment>();
  let cursor: string | undefined;
  do {
    const page = await list(cursor);
    for (const p of page.items) byId.set(p.id, newer(byId.get(p.id), p));
    onProgress?.(byId.size);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return [...byId.values()];
}
