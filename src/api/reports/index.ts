import apiInstance from "@/api/api-instance";
import { ENDPOINTS } from "@/api/endpoints";

import type { DailyTotals } from "./interface";

/** Totals per mensa and till for one Europe/Berlin day; today when `date` is left out. */
export const getDailyTotals = async (date?: string): Promise<DailyTotals> =>
  (await apiInstance.request<DailyTotals>("GET", ENDPOINTS.DAILY_TOTALS, { query: { date } })).data;
