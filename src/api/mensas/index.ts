import apiInstance from "@/api/api-instance";
import { ENDPOINTS } from "@/api/endpoints";

import type { Mensa } from "./interface";

/** Every mensa with its tills, for the filters and the totals table. */
export const getMensas = async (): Promise<Mensa[]> =>
  (await apiInstance.request<{ items: Mensa[] }>("GET", ENDPOINTS.MENSAS)).data.items;
