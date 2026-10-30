import { type FormEvent, useState } from "react";
import { type Location, Navigate, useLocation } from "react-router-dom";

import { ApiError } from "@/api/errors";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/error-message";
import { useT } from "@/lib/locale";

type Field = "username" | "password";

export function LoginRoute() {
  const { t } = useT();
  const { user, login, logout } = useAuth();
  const from = (useLocation().state as { from?: Location } | null)?.from;
  const [values, setValues] = useState({ username: "", password: "" });
  const [touched, setTouched] = useState({ username: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from ? from.pathname + from.search : "/"} replace />;

  const missing = (field: Field) => touched[field] && !values[field].trim();
  const update = (field: Field, value: string) => setValues((v) => ({ ...v, [field]: value }));
  const touch = (field: Field) => setTouched((v) => ({ ...v, [field]: true }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setTouched({ username: true, password: true });
    if (!values.username.trim() || !values.password) return;
    setBusy(true);
    setError(null);
    try {
      const signedIn = await login(values.username.trim(), values.password);
      if (signedIn.role !== "finance") {
        logout();
        setError(t("login.notFinance"));
      }
    } catch (e) {
      setError(
        e instanceof ApiError && e.code === "invalid_credentials"
          ? t("login.failed")
          : t(errorMessage(e).key),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <div className="login-head">
        <img src="/favicon.svg" alt="" width={40} height={40} />
        <h1>{t("login.title")}</h1>
        <p className="muted">{t("login.subtitle")}</p>
      </div>
      <form className="login-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="username" className="sr-only">
            {t("login.username")}
          </label>
          <input
            id="username"
            value={values.username}
            placeholder={t("login.username")}
            autoComplete="username"
            aria-invalid={missing("username")}
            aria-describedby={missing("username") ? "username-error" : undefined}
            onChange={(e) => update("username", e.target.value)}
            onBlur={() => touch("username")}
          />
          {missing("username") ? (
            <p id="username-error" className="field-error">
              {t("login.usernameRequired")}
            </p>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="password" className="sr-only">
            {t("login.password")}
          </label>
          <div className="password">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              placeholder={t("login.password")}
              autoComplete="current-password"
              aria-invalid={missing("password")}
              aria-describedby={missing("password") ? "password-error" : undefined}
              onChange={(e) => update("password", e.target.value)}
              onBlur={() => touch("password")}
            />
            <button
              type="button"
              className="icon-button"
              aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {missing("password") ? (
            <p id="password-error" className="field-error">
              {t("login.passwordRequired")}
            </p>
          ) : null}
        </div>
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="block" disabled={busy}>
          {t("login.submit")}
        </button>
      </form>
    </main>
  );
}
