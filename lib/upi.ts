/**
 * UPI deep-link builder — NPCI intent spec.
 * Client aur server dono side safe (no node APIs).
 */
export interface UpiParams {
  payeeAddress: string;
  payeeName: string;
  amount: number;
  note?: string;
  transactionRef?: string;
}

export function buildUpiUrl({
  payeeAddress,
  payeeName,
  amount,
  note,
  transactionRef,
}: UpiParams): string {
  const params = new URLSearchParams({
    pa: payeeAddress,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
  });
  if (note) params.set("tn", note);
  if (transactionRef) params.set("tr", transactionRef);
  return `upi://pay?${params.toString()}`;
}
