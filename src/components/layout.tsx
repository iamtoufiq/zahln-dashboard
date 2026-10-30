import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";

import { ConnectionBanner } from "@/components/connection-banner";
import { useAuth } from "@/lib/auth";
import { toggleLocale, useT } from "@/lib/locale";

export function Layout() {
  const { t } = useT();
  const { user, logout } = useAuth();
  const location = useLocation();

  // An expired session lands on sign-in and comes back to the same page and filters.
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return (
    <div className="shell">
      <nav className="side" aria-label={t("nav.label")}>
        <h1>Zahln</h1>
        <NavLink to="/" end>
          {t("nav.totals")}
        </NavLink>
        <NavLink to="/attention">{t("nav.attention")}</NavLink>
        <NavLink to="/payments">{t("nav.payments")}</NavLink>
        <div className="grow" />
        <button className="secondary" onClick={toggleLocale}>
          {t("common.language")}
        </button>
        <button className="secondary" onClick={logout}>
          {t("common.signOut")}
        </button>
      </nav>
      <main className="main">
        <ConnectionBanner />
        <Outlet />
      </main>
    </div>
  );
}
