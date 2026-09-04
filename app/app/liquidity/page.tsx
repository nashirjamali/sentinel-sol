"use client";

import { AppShell } from "@/components/organisms/app-shell";
import { LiquidityPoolFlow } from "@/components/organisms/liquidity-pool-flow";

export default function LiquidityPage() {
  return (
    <AppShell activeNav="liquidity">
      <LiquidityPoolFlow />
    </AppShell>
  );
}
