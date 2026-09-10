"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAppKit, useAppKitAccount, useAppKitState } from "@reown/appkit/react";
import { AppNav, type AppNavActive } from "@/components/organisms/app-nav";
import { Button as UiButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REOWN_PROJECT_ID } from "@/lib/wallet/appkit-config";

type AppShellProps = {
  activeNav?: AppNavActive;
  children: ReactNode;
  lockViewport?: boolean;
};

function resolveActiveNav(pathname: string | null, activeNav?: AppNavActive): AppNavActive | undefined {
  if (activeNav) return activeNav;
  if (
    pathname?.startsWith("/app/liquidity") ||
    pathname?.startsWith("/liquidity")
  ) {
    return "liquidity";
  }
  if (pathname?.startsWith("/app/market") || pathname?.startsWith("/market")) {
    return "market";
  }
  return undefined;
}

function ConnectPrompt() {
  const { open } = useAppKit();
  const { open: isModalOpen } = useAppKitState();
  const canConnect = Boolean(REOWN_PROJECT_ID);

  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-6 px-4 text-center">
      <h1 className="m-0 font-display text-[32px] font-bold leading-10 tracking-[-0.32px] text-neutrals-8">
        Connect your wallet
      </h1>
      <p className="m-0 max-w-[65ch] font-body text-caption-2 text-neutrals-5">
        Connect a Solana wallet to view markets and buy coverage.
      </p>
      <UiButton
        type="button"
        variant="neutral"
        size="medium"
        className="active:scale-[0.98]"
        disabled={!canConnect || isModalOpen}
        onClick={() => open({ view: "Connect" })}
      >
        {isModalOpen ? "Waiting for wallet" : "Connect wallet"}
      </UiButton>
      {!canConnect ? (
        <p className="m-0 font-body text-caption text-neutrals-5" role="alert">
          Wallet connect is not configured. Add a Reown project ID to continue.
        </p>
      ) : null}
    </main>
  );
}

export function AppShell({ activeNav, children, lockViewport = false }: AppShellProps) {
  const pathname = usePathname();
  const resolved = resolveActiveNav(pathname, activeNav);
  const { isConnected } = useAppKitAccount();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-neutrals-1">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-x-0 top-[-45px] h-[1380px]">
          <img
            src="/images/app/bg-glow.png"
            alt=""
            className="absolute left-0 top-[395px] h-[1046px] w-full max-w-none object-cover"
          />
          <div className="absolute inset-0 bg-neutrals-1/5 backdrop-blur-[100px]" />
        </div>
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <AppNav active={resolved} />
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            lockViewport ? "overflow-y-auto lg:overflow-hidden" : "overflow-y-auto",
          )}
        >
          <div
            className={cn(
              "m-auto w-full",
              lockViewport && "lg:flex lg:h-full lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-center",
            )}
          >
            {isConnected ? children : <ConnectPrompt />}
          </div>
        </div>
      </div>
    </div>
  );
}
