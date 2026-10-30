import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { getMensas } from "@/api/mensas";
import { DateRangePicker } from "@/components/date-picker";
import { FilterChips } from "@/components/filters/filter-chips";
import { FilterMenu } from "@/components/filters/filter-menu";
import { SearchField } from "@/components/filters/search-field";
import { PaymentsTable } from "@/components/payments-table";
import { QueryError } from "@/components/query-error";
import { TableSkeleton } from "@/components/skeleton";
import { useExport } from "@/features/csv/use-export";
import { errorMessage } from "@/lib/error-message";
import { serverToday } from "@/lib/server-day";
import { useT } from "@/lib/locale";
import {
  activeFilters,
  filtersFrom,
  withDates,
  withDraft,
  withoutFilter,
  withSearch,
} from "@/lib/payment-filters";
import { usePaymentPages } from "@/lib/use-payment-pages";

export function PaymentsRoute() {
  const { t } = useT();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFrom(params), [params]);
  const active = useMemo(() => activeFilters(params), [params]);
  const { query, payments } = usePaymentPages(filters);
  const mensas = useQuery({ queryKey: ["mensas"], queryFn: getMensas, staleTime: Infinity });
  const mensaList = mensas.data ?? [];
  const exporter = useExport(filters);

  return (
    <>
      <h2>{t("payments.title")}</h2>
      <div className="toolbar">
        <SearchField
          value={params.get("q") ?? ""}
          onSearch={(text) => setParams(withSearch(params, text))}
        />
        <FilterMenu
          params={params}
          mensas={mensaList}
          applied={active.length}
          onApply={(draft) => setParams(withDraft(params, draft))}
        />
        <DateRangePicker
          value={{ from: params.get("from") ?? "", to: params.get("to") ?? "" }}
          today={serverToday()}
          onChange={(range) => setParams(withDates(params, range))}
        />
        <div className="grow" />
        <button
          type="button"
          className="secondary"
          disabled={exporter.state.tag === "running"}
          onClick={exporter.run}
        >
          {exporter.state.tag === "running"
            ? t("payments.exporting", { count: exporter.state.count })
            : t("payments.export")}
        </button>
      </div>
      <FilterChips
        active={active}
        mensas={mensaList}
        onRemove={(key) => setParams(withoutFilter(params, key))}
      />
      {exporter.state.tag === "failed" ? (
        <p className="error" role="alert">
          {t(errorMessage(exporter.state.error).key)}{" "}
          <button onClick={exporter.run}>{t("common.retry")}</button>{" "}
          <button className="secondary" onClick={exporter.dismiss}>
            {t("common.close")}
          </button>
        </p>
      ) : null}
      {query.isPending ? <TableSkeleton /> : null}
      {query.isError && payments.length === 0 ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : null}
      {query.isSuccess ? <PaymentsTable payments={payments} /> : null}
      {query.hasNextPage ? (
        <button
          className="secondary"
          disabled={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          {t("payments.loadMore")}
        </button>
      ) : null}
    </>
  );
}
