import { type ReactNode, useState } from "react";

import type { Mensa } from "@/api/mensas/interface";
import { CloseIcon, FilterIcon } from "@/components/icons";
import { useT } from "@/lib/locale";
import { draftFrom, EMPTY_DRAFT, type FilterDraft, STATUSES } from "@/lib/payment-filters";
import { usePopover } from "@/lib/use-popover";

type Props = {
  params: URLSearchParams;
  mensas: Mensa[];
  applied: number;
  onApply: (draft: FilterDraft) => void;
};

type Option = { value: string; label: string };

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <fieldset className="filter-section">
      <legend>{count > 0 ? `${title} (${count})` : title}</legend>
      {children}
    </fieldset>
  );
}

function Choices({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="choices">
      {options.map((option) => (
        <label key={option.value} className="choice">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

// Changes are drafted in the panel and only reach the URL on Apply.
export function FilterMenu({ params, mensas, applied, onApply }: Props) {
  const { t } = useT();
  const { open, setOpen, close, rootRef, triggerRef } = usePopover();
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_DRAFT);

  function toggle() {
    if (!open) setDraft(draftFrom(params));
    setOpen(!open);
  }

  function apply(next: FilterDraft) {
    onApply(next);
    close();
  }

  const set = (patch: Partial<FilterDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const all = { value: "", label: t("common.all") };
  const tills = mensas.find((m) => m.id === draft.mensa)?.tills ?? [];

  return (
    <div className="filter-menu" ref={rootRef}>
      <div className={applied > 0 ? "filter-trigger active" : "filter-trigger"}>
        <button
          ref={triggerRef}
          type="button"
          className="filter-button"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={toggle}
        >
          {applied > 0 ? t("filters.buttonCount", { count: applied }) : t("filters.button")}
          {applied === 0 ? <FilterIcon /> : null}
        </button>
        {applied > 0 ? (
          <button
            type="button"
            className="icon-button"
            aria-label={t("filters.clearAll")}
            onClick={() => apply(EMPTY_DRAFT)}
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="filter-panel" role="dialog" aria-label={t("filters.button")}>
          <Section title={t("payments.status")} count={draft.status ? 1 : 0}>
            <Choices
              name="status"
              value={draft.status}
              onChange={(status) => set({ status })}
              options={[all, ...STATUSES.map((s) => ({ value: s, label: t(`status.${s}`) }))]}
            />
          </Section>
          <Section title={t("payments.mensa")} count={draft.mensa ? 1 : 0}>
            <Choices
              name="mensa"
              value={draft.mensa}
              onChange={(mensa) => set({ mensa, till: "" })}
              options={[all, ...mensas.map((m) => ({ value: m.id, label: m.name }))]}
            />
          </Section>
          {tills.length > 0 ? (
            <Section title={t("payments.till")} count={draft.till ? 1 : 0}>
              <Choices
                name="till"
                value={draft.till}
                onChange={(till) => set({ till })}
                options={[all, ...tills.map((till) => ({ value: till.id, label: till.name }))]}
              />
            </Section>
          ) : null}
          <div className="filter-footer">
            <button type="button" className="secondary" onClick={() => setDraft(EMPTY_DRAFT)}>
              {t("filters.reset")}
            </button>
            <button type="button" onClick={() => apply(draft)}>
              {t("filters.apply")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
