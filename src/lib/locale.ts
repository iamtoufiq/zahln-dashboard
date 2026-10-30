import { useCallback, useSyncExternalStore } from "react";

import { type Locale, type MessageKey, t as translate } from "@/core";

const KEY = "zahln.locale";
const listeners = new Set<() => void>();

function read(): Locale {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "de" || saved === "en") return saved;
  } catch {
    // Storage can be blocked; the default language is used.
  }
  return "en";
}

let current = read();
// The page starts with lang="en"; a German reader would otherwise get an English voice.
if (typeof document !== "undefined") document.documentElement.lang = current;

export function toggleLocale() {
  current = current === "de" ? "en" : "de";
  try {
    localStorage.setItem(KEY, current);
  } catch {
    // Not persisted, still switched for this visit.
  }
  document.documentElement.lang = current;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useT() {
  const locale = useSyncExternalStore(subscribe, () => current);
  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );
  return { t, locale };
}
