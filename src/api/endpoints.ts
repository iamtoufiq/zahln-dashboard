// Paths are relative to API_CONFIG.BASE_URL (VITE_API_BASE_URL).
export const ENDPOINTS = {
  // Auth
  SESSIONS: "/sessions",

  // Mensas
  MENSAS: "/mensas",

  // Payments
  PAYMENTS: "/payments",
  PAYMENT: (paymentId: string) => `/payments/${encodeURIComponent(paymentId)}`,

  // Reports
  DAILY_TOTALS: "/reports/daily-totals",
};
