import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { Payment, PaymentFilters } from "@/api/payments/interface";
import { listPayments } from "@/api/payments";
import { paymentVersions } from "./versions";

const PAGE_SIZE = 50;

export function usePaymentPages(filters: PaymentFilters) {
  const query = useInfiniteQuery({
    queryKey: ["payments", filters],
    queryFn: ({ pageParam }) => listPayments({ ...filters, limit: PAGE_SIZE, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const payments = useMemo(() => {
    const byId = new Map<string, Payment>();
    for (const page of query.data?.pages ?? []) {
      for (const p of page.items) byId.set(p.id, paymentVersions.keep(p));
    }
    return [...byId.values()];
  }, [query.data]);

  return { query, payments };
}
