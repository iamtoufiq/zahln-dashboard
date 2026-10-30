import type { Schemas } from "@/api/interface";

export type Payment = Schemas["Payment"];
export type PaymentDetail = Schemas["PaymentDetail"];
export type PaymentEvent = Schemas["PaymentEvent"];
export type PaymentPage = Schemas["PaymentPage"];
export type Refund = Schemas["Refund"];

export type PaymentFilters = {
  mensaId?: string;
  tillId?: string;
  status?: Payment["status"];
  from?: string;
  to?: string;
  needsAttention?: boolean;
  q?: string;
  limit?: number;
  cursor?: string;
};
