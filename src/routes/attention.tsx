import { PaymentsTable } from "@/components/payments-table";
import { QueryError } from "@/components/query-error";
import { TableSkeleton } from "@/components/skeleton";
import { useT } from "@/lib/locale";
import { usePaymentPages } from "@/lib/use-payment-pages";

const FILTERS = { needsAttention: true };

export function AttentionRoute() {
  const { t } = useT();
  const { query, payments } = usePaymentPages(FILTERS);

  return (
    <>
      <h2>{t("attention.title")}</h2>
      {query.isPending ? <TableSkeleton /> : null}
      {query.isError && payments.length === 0 ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : null}
      {query.isSuccess && payments.length === 0 ? (
        <p className="muted">{t("attention.empty")}</p>
      ) : null}
      {payments.length > 0 ? <PaymentsTable payments={payments} showReasons /> : null}
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
