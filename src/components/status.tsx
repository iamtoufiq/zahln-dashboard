import type { Payment, Refund } from "@/api/payments/interface";
import { useT } from "@/lib/locale";

const PAYMENT_TONE: Record<Payment["status"], string> = {
  pending: "pending",
  confirmed: "success",
  declined: "danger",
};
const REFUND_TONE: Record<Refund["status"], string> = {
  pending: "pending",
  completed: "success",
  failed: "danger",
};

export function PaymentStatus({ status }: { status: Payment["status"] }) {
  const { t } = useT();
  return <span className={`badge ${PAYMENT_TONE[status]}`}>{t(`status.${status}`)}</span>;
}

export function RefundStatus({ status }: { status: Refund["status"] }) {
  const { t } = useT();
  return <span className={`badge ${REFUND_TONE[status]}`}>{t(`refundStatus.${status}`)}</span>;
}
