import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { QueryError } from "@/components/query-error";
import { RefundStatus, PaymentStatus } from "@/components/status";
import { StatsSkeleton } from "@/components/skeleton";
import { formatCents, formatDateTime, itemName } from "@/core";
import { getPayment } from "@/api/payments";
import type { PaymentDetail } from "@/api/payments/interface";
import { paymentDetailVersions } from "@/lib/versions";
import { useT } from "@/lib/locale";

const PENDING_POLL_MS = 5000;

const stillMoving = (p: PaymentDetail | undefined) =>
  p?.status === "pending" || Boolean(p?.refunds.some((r) => r.status === "pending"));

export function PaymentRoute() {
  const { t, locale } = useT();
  const { paymentId = "" } = useParams();
  const query = useQuery({
    queryKey: ["payment", paymentId],
    queryFn: async () => paymentDetailVersions.keep(await getPayment(paymentId)),
    refetchInterval: (q) => (stillMoving(q.state.data) ? PENDING_POLL_MS : false),
  });
  const money = (cents: number) => formatCents(cents, locale);
  const p = query.data;

  return (
    <>
      <Link to="/payments">← {t("common.back")}</Link>
      <h2>{t("detail.title", { id: paymentId })}</h2>
      {query.isPending ? <StatsSkeleton cards={3} /> : null}
      {query.isError && !p ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : null}
      {p ? (
        <>
          <section className="stats">
            <div className="card stat">
              <div className="label">{t("payments.amount")}</div>
              <div className="value">{money(p.amountCents)}</div>
              <PaymentStatus status={p.status} />
            </div>
            <div className="card stat">
              <div className="label">{t("payments.refunded")}</div>
              <div className="value">{money(p.refundedAmountCents)}</div>
            </div>
            <div className="card stat">
              <div className="label">{t("detail.refundable")}</div>
              <div className="value">{money(p.refundableAmountCents)}</div>
            </div>
            {p.pendingRefundAmountCents > 0 ? (
              <div className="card stat">
                <div className="label">{t("detail.pendingRefund")}</div>
                <div className="value">{money(p.pendingRefundAmountCents)}</div>
              </div>
            ) : null}
          </section>
          <div className="card">
            <p>
              {formatDateTime(p.createdAt, locale)} · {p.mensa.name} · {p.till.name} ·{" "}
              {p.payer.displayName} ({p.payer.id}) · {t(`group.${p.priceGroup}`)}
            </p>
            <p className="muted">
              {t("detail.order")}: {p.orderId}
            </p>
            {p.attentionReasons.map((reason) => (
              <span key={reason} className="badge danger">
                {t(`attention.${reason}`)}
              </span>
            ))}
          </div>
          <div className="card table-wrap">
            <h3>{t("detail.items")}</h3>
            <table>
              <tbody>
                {p.items.map((item) => (
                  <tr key={item.itemId}>
                    <td>
                      {item.quantity} × {itemName(item.name, locale)}
                    </td>
                    <td className="num">{money(item.unitPriceCents * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card table-wrap">
            <h3>{t("detail.refunds")}</h3>
            {p.refunds.length === 0 ? <p className="muted">{t("detail.noRefunds")}</p> : null}
            <table>
              <tbody>
                {p.refunds.map((refund) => (
                  <tr key={refund.id}>
                    <td>{formatDateTime(refund.createdAt, locale)}</td>
                    <td>{refund.id}</td>
                    <td>{refund.reason ?? ""}</td>
                    <td>
                      <RefundStatus status={refund.status} />
                    </td>
                    <td className="num">{money(refund.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3>{t("detail.history")}</h3>
            <ol className="timeline">
              {p.history.map((event, i) => (
                <li key={i}>
                  <time dateTime={event.at}>{formatDateTime(event.at, locale)}</time>
                  <span>
                    {t(`event.${event.type}`)}
                    {event.amountCents != null ? ` · ${money(event.amountCents)}` : ""}
                    {event.refundId ? ` · ${event.refundId}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : null}
    </>
  );
}
