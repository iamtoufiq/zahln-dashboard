import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Layout } from "./components/layout";
import { AuthProvider } from "./lib/auth";
import { AttentionRoute } from "./routes/attention";
import { LoginRoute } from "./routes/login";
import { PaymentRoute } from "./routes/payment";
import { PaymentsRoute } from "./routes/payments";
import { TotalsRoute } from "./routes/totals";
// Self-hosted, so no visitor IP goes to a font CDN.
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "react-day-picker/style.css";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false, staleTime: 30_000 } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route element={<Layout />}>
              <Route index element={<TotalsRoute />} />
              <Route path="attention" element={<AttentionRoute />} />
              <Route path="payments" element={<PaymentsRoute />} />
              <Route path="payments/:paymentId" element={<PaymentRoute />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
