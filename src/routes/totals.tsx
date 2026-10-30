import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";

import { formatCents, formatTime } from "@/core";
import { DatePicker } from "@/components/date-picker";
import { QueryError } from "@/components/query-error";
import { StatsSkeleton } from "@/components/skeleton";
import { getDailyTotals } from "@/api/reports";
import { useT } from "@/lib/locale";
import { serverToday } from "@/lib/server-day";

type Sums = {
  paymentCount: number;
  grossCents: number;
  refundedCents: number;
  netCents: number;
  pendingCount: number;
  pendingCents: number;
};

function Cells({ sums, money }: { sums: Sums; money: (cents: number) => string }) {
  return (
    <>
      <td className="num">{sums.paymentCount}</td>
      <td className="num">{money(sums.grossCents)}</td>
      <td className="num">{money(sums.refundedCents)}</td>
      <td className="num">{money(sums.netCents)}</td>
      <td className="num">
        {sums.pendingCount} · {money(sums.pendingCents)}
      </td>
    </>
  );
}

const TODAY_REFRESH_MS = 60_000;

export function TotalsRoute() {
  const { t, locale } = useT();
  const [date, setDate] = useState(serverToday);
  const isToday = date === serverToday();
  const totals = useQuery({
    queryKey: ["totals", date],
    queryFn: () => getDailyTotals(date),
    // Today's numbers keep moving; past days are final.
    refetchInterval: isToday ? TODAY_REFRESH_MS : false,
  });
  const money = (cents: number) => formatCents(cents, locale);
  const d = totals.data;

  return (
    <>
      <h2>{t("totals.title")}</h2>
      <div className="row">
        <DatePicker value={date} max={serverToday()} onChange={setDate} />
      </div>
      {totals.isPending ? <StatsSkeleton /> : null}
      {totals.isError && !d ? (
        <QueryError error={totals.error} onRetry={() => totals.refetch()} />
      ) : null}
      {d ? (
        <>
          <section className="stats" aria-label={t("totals.all")}>
            <div className="card stat">
              <div className="label">{t("totals.gross")}</div>
              <div className="value">{money(d.grossCents)}</div>
            </div>
            <div className="card stat">
              <div className="label">{t("totals.refunded")}</div>
              <div className="value">{money(d.refundedCents)}</div>
            </div>
            <div className="card stat">
              <div className="label">{t("totals.net")}</div>
              <div className="value">{money(d.netCents)}</div>
            </div>
            <div className="card stat">
              <div className="label">{t("totals.count")}</div>
              <div className="value">{d.paymentCount}</div>
            </div>
            <div className="card stat">
              <div className="label">{t("totals.pending")}</div>
              <div className="value">
                {d.pendingCount} · {money(d.pendingCents)}
              </div>
            </div>
          </section>
          <div className="notes muted">
            <p>{t("totals.asOf", { time: formatTime(totals.dataUpdatedAt, locale) })}</p>
            <p>{t("totals.netNote")}</p>
            <p>{t("totals.pendingNote")}</p>
          </div>
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("totals.mensa")}</th>
                  <th className="num">{t("totals.count")}</th>
                  <th className="num">{t("totals.gross")}</th>
                  <th className="num">{t("totals.refunded")}</th>
                  <th className="num">{t("totals.net")}</th>
                  <th className="num">{t("totals.pending")}</th>
                </tr>
              </thead>
              <tbody>
                {d.mensas.map((m) => (
                  <Fragment key={m.mensa.id}>
                    <tr>
                      <th scope="row">{m.mensa.name}</th>
                      <Cells sums={m} money={money} />
                    </tr>
                    {m.tills.map((till) => (
                      <tr key={till.till.id} className="sub">
                        <td>{till.till.name}</td>
                        <Cells sums={till} money={money} />
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </>
  );
}
