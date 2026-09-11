"use client";

import { Button as UiButton } from "@/components/ui/button";
import { DetailRows } from "@/components/molecules/detail-rows";

type ConfirmTransactionModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  coverage?: string;
  youPay?: string;
};

export function ConfirmTransactionModal({
  open,
  onCancel,
  onConfirm,
  coverage = "150 SOL",
  youPay = "195.42 USDC",
}: ConfirmTransactionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[120px]">
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
        className="relative z-10 flex w-full max-w-[480px] flex-col gap-5 overflow-clip rounded-card border border-neutrals-3 bg-[#141517] p-7 shadow-[0px_24px_48px_-16px_rgba(15,15,15,0.4)]"
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
        <DetailRows
          rows={[
            { label: "Action", value: "Buy protection" },
            { label: "Coverage", value: coverage },
            {
              label: "You pay",
              value: youPay,
              valueClassName: "text-primary-4",
            },
            { label: "Network fee", value: "~0.00025 SOL" },
          ]}
        />
        <p className="m-0 font-body text-[11px] leading-5 text-neutrals-5">
          Your premium buys coverage in a single transaction. The full payout is
          locked in an on-chain vault for the life of the policy, and settles
          automatically at expiry. There is no claim to file.
        </p>
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
