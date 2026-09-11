"use client";

import { Button as UiButton } from "@/components/ui/button";
import { DetailRows } from "@/components/molecules/detail-rows";

export type ConfirmRow = {
  label: string;
  value: string;
  valueClassName?: string;
};

type ConfirmTransactionModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  action?: string;
  coverage?: string;
  youPay?: string;
  rows?: ConfirmRow[];
  note?: string;
};

const DEFAULT_NOTE =
  "Your premium buys coverage in a single transaction. The full payout is locked in an on-chain vault for the life of the policy, and settles automatically at expiry. There is no claim to file.";

export function ConfirmTransactionModal({
  open,
  onCancel,
  onConfirm,
  action = "Buy protection",
  coverage = "150 SOL",
  youPay = "195.42 USDC",
  rows,
  note = DEFAULT_NOTE,
}: ConfirmTransactionModalProps) {
  if (!open) return null;

  const detailRows = rows ?? [
    { label: "Action", value: action },
    { label: "Coverage", value: coverage },
    { label: "You pay", value: youPay, valueClassName: "text-primary-4" },
    { label: "Network fee", value: "~0.00025 SOL" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 pt-16 sm:items-start sm:pb-4 sm:pt-[120px]">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[rgba(20,20,22,0.9)]"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-tx-title"
        className="relative z-10 flex max-h-[min(90dvh,720px)] w-full max-w-[480px] flex-col gap-5 overflow-y-auto rounded-card border border-neutrals-3 bg-[#141517] p-5 shadow-[0px_24px_48px_-16px_rgba(15,15,15,0.4)] sm:p-7"
      >
        <h2
          id="confirm-tx-title"
          className="m-0 font-display text-[22px] font-bold leading-10 tracking-[-0.22px] text-neutrals-8"
        >
          Confirm transaction
        </h2>
        <p className="m-0 font-body text-caption-2 text-neutrals-5">
          Review the details below before signing in your wallet.
        </p>
        <div className="h-px w-full bg-neutrals-3" />
        <DetailRows rows={detailRows} />
        <p className="m-0 font-body text-[11px] leading-5 text-neutrals-5">{note}</p>
        <div className="flex w-full gap-3 overflow-clip">
          <UiButton
            type="button"
            variant="dark"
            size="medium"
            className="min-w-0 flex-1"
            onClick={onCancel}
          >
            Cancel
          </UiButton>
          <UiButton
            type="button"
            variant="neutral"
            size="medium"
            className="min-w-0 flex-1"
            onClick={onConfirm}
          >
            Confirm & sign
          </UiButton>
        </div>
      </div>
    </div>
  );
}
