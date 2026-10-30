import { errorMessage } from "@/lib/error-message";
import { useT } from "@/lib/locale";

export function QueryError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { t } = useT();
  const { key, canRetry } = errorMessage(error);
  return (
    <p className="error" role="alert">
      {t(key)} {canRetry ? <button onClick={onRetry}>{t("common.retry")}</button> : null}
    </p>
  );
}
