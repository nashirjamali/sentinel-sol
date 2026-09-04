"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppNav, type AppNavActive } from "@/components/organisms/app-nav";

type AppShellProps = {
  activeNav?: AppNavActive;
  children: ReactNode;
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

export function AppShell({ activeNav, children }: AppShellProps) {
  const pathname = usePathname();
  const resolved = resolveActiveNav(pathname, activeNav);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-neutrals-1">
      <div className="pointer-events-none absolute inset-x-0 top-[-45px] z-0 h-[1380px] overflow-hidden">
        <img
          src="/images/app/bg-glow.png"
          alt=""
          className="absolute left-0 top-[395px] h-[1046px] w-full max-w-none object-cover"
        />
        <div className="absolute inset-0 bg-neutrals-1/5 backdrop-blur-[100px]" />
      </div>
      <div className="relative z-10">
        <AppNav active={resolved} />
        {children}
      </div>
    </div>
  );
}
