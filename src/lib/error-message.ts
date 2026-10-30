import { ApiError } from "@/api/errors";
import type { MessageKey } from "@/core";

// Errors a retry cannot fix get their own words and no Retry button.
const FINAL: Record<string, MessageKey> = {
  not_found: "error.not_found",
  forbidden: "error.forbidden",
};

const CONNECTION = new Set(["network", "timeout", "connection_dropped", "unavailable"]);

export function errorMessage(error: unknown): { key: MessageKey; canRetry: boolean } {
  if (!(error instanceof ApiError)) return { key: "error.generic", canRetry: true };
  const final = FINAL[error.code];
  if (final) return { key: final, canRetry: false };
  return { key: CONNECTION.has(error.code) ? "error.network" : "error.generic", canRetry: true };
}
