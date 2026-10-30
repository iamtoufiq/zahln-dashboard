import { useT } from "@/lib/locale";

const ROWS = [0, 1, 2, 3, 4, 5];

export function StatsSkeleton({ cards = 5 }: { cards?: number }) {
  const { t } = useT();
  return (
    <section className="stats" aria-busy="true" aria-label={t("common.loading")}>
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="card stat">
          <span className="skeleton short" />
          <span className="skeleton tall" />
        </div>
      ))}
    </section>
  );
}

export function TableSkeleton() {
  const { t } = useT();
  return (
    <div className="card" aria-busy="true" aria-label={t("common.loading")}>
      {ROWS.map((row) => (
        <span key={row} className="skeleton line" />
      ))}
    </div>
  );
}
