import { useState } from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import { de, enGB } from "react-day-picker/locale";

import { CalendarIcon, CloseIcon } from "@/components/icons";
import { formatDay } from "@/core";
import { useT } from "@/lib/locale";
import { usePopover } from "@/lib/use-popover";

import { dateOf, dayOf, type DayRange, type Preset, presetRange } from "./day";

const LOCALES = { de, en: enGB };
const PRESETS: Preset[] = ["today", "last7", "month"];

type DatePickerProps = { value: string; max: string; onChange: (day: string) => void };

// One day, for the daily totals.
export function DatePicker({ value, max, onChange }: DatePickerProps) {
  const { t, locale } = useT();
  const { open, setOpen, close, rootRef, triggerRef } = usePopover();

  return (
    <div className="popover" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="picker-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${t("totals.date")}: ${formatDay(value, locale)}`}
        onClick={() => setOpen(!open)}
      >
        <CalendarIcon />
        {formatDay(value, locale)}
      </button>
      {open ? (
        <div className="popover-panel" role="dialog" aria-label={t("totals.date")}>
          <DayPicker
            mode="single"
            locale={LOCALES[locale]}
            weekStartsOn={1}
            selected={dateOf(value)}
            defaultMonth={dateOf(value)}
            disabled={{ after: dateOf(max) }}
            endMonth={dateOf(max)}
            required
            onSelect={(date) => {
              onChange(dayOf(date));
              close();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

type DateRangePickerProps = {
  value: DayRange;
  today: string;
  onChange: (range: DayRange) => void;
};

// A span of days for the payments search, with the common spans one tap away.
export function DateRangePicker({ value, today, onChange }: DateRangePickerProps) {
  const { t, locale } = useT();
  const { open, setOpen, close, rootRef, triggerRef } = usePopover();
  const [draft, setDraft] = useState<DateRange | undefined>();
  const hasValue = Boolean(value.from || value.to);
  const label = hasValue
    ? `${value.from ? formatDay(value.from, locale) : "…"} – ${value.to ? formatDay(value.to, locale) : "…"}`
    : t("dates.range");

  function toggle() {
    if (!open) {
      setDraft(
        hasValue
          ? {
              from: value.from ? dateOf(value.from) : undefined,
              to: value.to ? dateOf(value.to) : undefined,
            }
          : undefined,
      );
    }
    setOpen(!open);
  }

  function apply(range: DayRange) {
    onChange(range);
    close();
  }

  return (
    <div className="popover" ref={rootRef}>
      <div className={hasValue ? "filter-trigger active" : "filter-trigger"}>
        <button
          ref={triggerRef}
          type="button"
          className="filter-button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={toggle}
        >
          <CalendarIcon />
          {label}
        </button>
        {hasValue ? (
          <button
            type="button"
            className="icon-button"
            aria-label={t("filters.remove", { name: label })}
            onClick={() => onChange({ from: "", to: "" })}
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="popover-panel range" role="dialog" aria-label={t("dates.range")}>
          <div className="presets">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className="preset"
                onClick={() => apply(presetRange(preset, today))}
              >
                {t(`dates.${preset}`)}
              </button>
            ))}
          </div>
          <div>
            <DayPicker
              mode="range"
              locale={LOCALES[locale]}
              weekStartsOn={1}
              selected={draft}
              defaultMonth={draft?.from ?? dateOf(today)}
              disabled={{ after: dateOf(today) }}
              endMonth={dateOf(today)}
              onSelect={setDraft}
            />
            <div className="filter-footer">
              <button
                type="button"
                className="secondary"
                onClick={() => apply({ from: "", to: "" })}
              >
                {t("filters.reset")}
              </button>
              <button
                type="button"
                disabled={!draft?.from}
                onClick={() =>
                  apply({
                    from: draft?.from ? dayOf(draft.from) : "",
                    to: draft?.to ? dayOf(draft.to) : draft?.from ? dayOf(draft.from) : "",
                  })
                }
              >
                {t("filters.apply")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
