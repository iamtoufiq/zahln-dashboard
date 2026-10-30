import { useT } from "@/lib/locale";
import { useOnline } from "@/lib/use-online";

export function ConnectionBanner() {
  const { t } = useT();
  const online = useOnline();
  return (
    <p className="banner" role="status" hidden={online}>
      {t("common.offline")}
    </p>
  );
}
