import type { Mensa } from "@/api/mensas/interface";
import { CloseIcon } from "@/components/icons";
import { type ActiveFilter, type FilterKey } from "@/lib/payment-filters";
import { useT } from "@/lib/locale";

type Props = { active: ActiveFilter[]; mensas: Mensa[]; onRemove: (key: FilterKey) => void };

// One chip per applied filter, each removable on its own.
export function FilterChips({ active, mensas, onRemove }: Props) {
  const { t } = useT();
  if (active.length === 0) return null;

  const tills = mensas.flatMap((m) => m.tills.map((till) => ({ ...till, mensa: m.name })));

  function label({ key, value }: ActiveFilter): string {
    if (key === "status") return `${t("payments.status")}: ${t(`status.${value as "pending"}`)}`;
    if (key === "mensa")
      return `${t("payments.mensa")}: ${mensas.find((m) => m.id === value)?.name ?? value}`;
    const till = tills.find((x) => x.id === value);
    return `${t("payments.till")}: ${till ? `${till.mensa} · ${till.name}` : value}`;
  }

  return (
    <ul className="chips" aria-label={t("filters.button")}>
      {active.map((filter) => {
        const name = label(filter);
        return (
          <li key={filter.key} className="chip">
            {name}
            <button
              type="button"
              className="icon-button"
              aria-label={t("filters.remove", { name })}
              onClick={() => onRemove(filter.key)}
            >
              <CloseIcon size={14} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
