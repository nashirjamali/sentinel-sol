"use client";

import Link from "next/link";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Logo } from "@/components/atoms/logo";
import { Button as UiButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REOWN_PROJECT_ID } from "@/lib/wallet/appkit-config";

export type AppNavActive = "market" | "liquidity";

type AppNavProps = {
  active?: AppNavActive;
};

const NAV_ITEMS: {
  id: AppNavActive | "docs";
  label: string;
  href: string;
}[] = [
  { id: "market", label: "Market", href: "/app/market" },
  { id: "liquidity", label: "Liquidity Pool", href: "/app/liquidity" },
  { id: "docs", label: "Docs", href: "#" },
];

function shortenAddress(address: string) {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function AppNav({ active }: AppNavProps) {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();
  const canConnect = Boolean(REOWN_PROJECT_ID);

  return (
    <header className="sticky top-0 z-30 w-full bg-neutrals-1">
      <div className="mx-auto flex h-20 w-full max-w-[1120px] items-center justify-between px-4 xl:px-0">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-[81px]">
            <Link href="/" aria-label="Sentinel home">
              <Logo wordmark size={64} />
            </Link>
            <div className="hidden h-20 w-px bg-neutrals-3 md:block" />
          </div>
          <nav className="hidden items-center gap-[50px] md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === active;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "relative flex h-20 items-center font-display text-button-2",
                    isActive ? "text-neutrals-8" : "text-neutrals-4 hover:text-neutrals-8",
                  )}
                >
                  {item.label}
                  {isActive ? (
                    <span
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5 w-full rounded-[2px]",
                        item.id === "liquidity" ? "bg-[#8b5cf6]" : "bg-primary-1",
                      )}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <UiButton
          type="button"
          variant="dark"
          size="small"
          className="active:scale-[0.98]"
          disabled={!canConnect}
          onClick={() => open({ view: isConnected ? "Account" : "Connect" })}
        >
          {isConnected && address ? shortenAddress(address) : "Connect wallet"}
        </UiButton>
      </div>
      <div className="h-px w-full bg-neutrals-3" />
    </header>
  );
}
