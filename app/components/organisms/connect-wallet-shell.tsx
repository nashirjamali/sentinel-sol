"use client";

import type { ReactNode } from "react";

type ConnectWalletShellProps = {
  onBack?: () => void;
  children: ReactNode;
};

export function ConnectWalletShell({ onBack, children }: ConnectWalletShellProps) {
  return (
    <div className="min-h-screen bg-neutrals-1 px-40 py-[136px]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border-none bg-transparent p-0"
            >
              <img
                src="/icons/arrow-left-2-line-on-dark.svg"
                alt=""
                width={24}
                height={24}
                className="size-6"
              />
            </button>
            <h1 className="m-0 font-display text-[32px] font-bold leading-10 tracking-[-0.32px] text-neutrals-8">
              Connect your wallet
            </h1>
          </div>
          <div className="h-px w-full bg-neutrals-3" />
        </div>
        {children}
      </div>
    </div>
  );
}
