import { useCallback, useState } from "react";

import type { PaymentFilters } from "@/api/payments/interface";
import { listPayments } from "@/api/payments";
import { useT } from "@/lib/locale";
import { serverToday } from "@/lib/server-day";

import { exportAll } from "./export-all";
import { toCsv } from "./to-csv";

type ExportState =
  { tag: "idle" } | { tag: "running"; count: number } | { tag: "failed"; error: unknown };

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  // Safari cancels the download if the URL is revoked in the same tick.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// All pages or nothing: a failed page throws, so a partial file never looks complete.
export function useExport(filters: PaymentFilters) {
  const { locale } = useT();
  const [state, setState] = useState<ExportState>({ tag: "idle" });

  const run = useCallback(async () => {
    setState({ tag: "running", count: 0 });
    try {
      const payments = await exportAll(
        (cursor) => listPayments({ ...filters, limit: 100, cursor }),
        (count) => setState({ tag: "running", count }),
      );
      download(`zahln-payments-${serverToday()}.csv`, toCsv(payments, locale));
      setState({ tag: "idle" });
    } catch (error) {
      setState({ tag: "failed", error });
    }
  }, [filters, locale]);

  const dismiss = useCallback(() => setState({ tag: "idle" }), []);

  return { state, run, dismiss };
}
