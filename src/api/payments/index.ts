import apiInstance from "@/api/api-instance";
import { ENDPOINTS } from "@/api/endpoints";

import type { PaymentDetail, PaymentFilters, PaymentPage } from "./interface";

/** One page of payments across every mensa, newest first. */
export const listPayments = async (filters: PaymentFilters = {}): Promise<PaymentPage> =>
  (await apiInstance.request<PaymentPage>("GET", ENDPOINTS.PAYMENTS, { query: filters })).data;

/** A payment with its refunds and full event history. */
export const getPayment = async (paymentId: string): Promise<PaymentDetail> =>
  (await apiInstance.request<PaymentDetail>("GET", ENDPOINTS.PAYMENT(paymentId))).data;
