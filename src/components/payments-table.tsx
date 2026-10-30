import { Link } from "react-router-dom";

import type { Payment } from "@/api/payments/interface";
import { formatCents, formatDateTime } from "@/core";
import { useT } from "@/lib/locale";

import { PaymentStatus } from "./status";

export function PaymentsTable({
  payments,
  showReasons = false,
}: {
  payments: Payment[];
  showReasons?: boolean;
}) {
  const { t, locale } = useT();
  const money = (cents: number) => formatCents(cents, locale);

  if (payments.length === 0) return <p className="muted">{t("payments.empty")}</p>;

  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>{t("payments.date")}</th>
            <th>{t("payments.id")}</th>
            <th>{t("payments.mensa")}</th>
            <th>{t("payments.till")}</th>
            <th>{t("payments.payer")}</th>
            <th>{t("payments.status")}</th>
            {showReasons ? <th>{t("payments.reasons")}</th> : null}
            <th className="num">{t("payments.amount")}</th>
            <th className="num">{t("payments.refunded")}</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{formatDateTime(p.createdAt, locale)}</td>
              <td>
                <Link to={`/payments/${p.id}`}>{p.id}</Link>
              </td>
              <td>{p.mensa.name}</td>
              <td>{p.till.name}</td>
              <td>
                {p.payer.displayName} · {t(`group.${p.priceGroup}`)}
              </td>
              <td>
                <PaymentStatus status={p.status} />
              </td>
              {showReasons ? (
                <td>
                  {p.attentionReasons.map((reason) => (
                    <span key={reason} className="badge danger">
                      {t(`attention.${reason}`)}
                    </span>
                  ))}
                </td>
              ) : null}
              <td className="num">{money(p.amountCents)}</td>
              <td className="num">{p.refundedAmountCents ? money(p.refundedAmountCents) : "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
