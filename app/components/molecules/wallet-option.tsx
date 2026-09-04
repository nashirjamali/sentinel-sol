"use client";

import { cn } from "@/lib/utils";

export type WalletId = "phantom" | "coinbase" | "solflare" | "backpack";

type WalletOptionProps = {
  id: WalletId;
  name: string;
  iconBg: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function WalletOption({
  name,
  iconBg,
  selected = false,
  onSelect,
  className,
}: WalletOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors",
        selected
          ? "border border-neutrals-3 bg-transparent"
          : "border border-transparent hover:bg-neutrals-2/40",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex size-10 shrink-0 items-center justify-center overflow-clip rounded-full",
          iconBg,
        )}
      >
        <img
          src="/icons/wallet-line.svg"
          alt=""
          width={20}
          height={20}
          className="relative z-10 size-5"
        />
      </span>
      <span className="flex-1 font-body text-body-2 font-medium text-neutrals-8">
        {name}
      </span>
      {selected ? (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-primary-4">
          <img
            src="/icons/check-line-green.svg"
            alt=""
            width={20}
            height={20}
            className="size-5"
          />
        </span>
      ) : (
        <img
          src="/icons/arrow-right-2-line.svg"
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0"
        />
      )}
    </button>
  );
}
