"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SubNavItem } from "@/components/atoms/sub-nav-item";
import { Button as UiButton } from "@/components/ui/button";
import { DetailRows } from "@/components/molecules/detail-rows";
import { FilterDropdown } from "@/components/molecules/filter-dropdown";
import { PositionRow } from "@/components/molecules/position-row";
import { AppShell } from "@/components/organisms/app-shell";
import { ConfirmTransactionModal } from "@/components/organisms/confirm-transaction-modal";

type MarketTab = "protect" | "positions" | "history";

const TABS: { id: MarketTab; label: string }[] = [
  { id: "protect", label: "Protect" },
  { id: "positions", label: "Positions" },
  { id: "history", label: "History" },
];

const TAB_COPY: Record<MarketTab, { title: string; subtitle: string }> = {
  protect: {
    title: "Downside protection, fully collateralized",
    subtitle:
      "Every policy is backed 1:1 by USDC held in a verifiable on-chain vault. Payouts settle automatically the moment Pyth confirms a decline — no claims process, no counterparty risk.",
  },
  positions: {
    title: "Your protection policies",
    subtitle:
      "Every policy you hold, in one place. Track strike price, premium paid, and payout status until it expires or settles.",
  },
  history: {
    title: "Policy history",
    subtitle:
      "Every policy that has reached expiry. Payouts settled automatically from the collateral vault — no claim was ever filed.",
  },
};

function parseTab(value: string | null): MarketTab {
  if (value === "positions" || value === "history" || value === "protect") {
    return value;
  }
  return "protect";
}

export default function MarketPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <main className="mx-auto min-h-[60vh] w-full max-w-[640px] px-4 py-20" />
        </AppShell>
      }
    >
      <MarketPageContent />
    </Suspense>
  );
}

function MarketPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = useMemo(() => parseTab(searchParams.get("tab")), [searchParams]);
  const [confirmOpen, setConfirmOpen] = useState(
    () => searchParams.get("confirm") === "1",
  );

  useEffect(() => {
    setConfirmOpen(searchParams.get("confirm") === "1");
  }, [searchParams]);

  const setTab = useCallback(
    (next: MarketTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "protect") {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      params.delete("confirm");
      setConfirmOpen(false);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openConfirm = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("confirm", "1");
    if (tab !== "protect") {
      params.set("tab", "protect");
    }
    setConfirmOpen(true);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, tab]);

  const closeConfirm = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("confirm");
    setConfirmOpen(false);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const copy = TAB_COPY[tab];

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-[29px] px-4 py-20">
        <h1 className="m-0 w-full text-center font-display text-[32px] font-bold leading-10 tracking-[-0.32px] text-neutrals-8">
          {copy.title}
        </h1>
        <p className="m-0 w-full text-center font-body text-caption-2 text-neutrals-5">
          {copy.subtitle}
        </p>

        <div className="flex w-full flex-col items-start rounded-[10px] bg-neutrals-1 shadow-depth4">
          <div className="flex h-[60px] w-full items-center justify-center overflow-clip border-b border-neutrals-3 px-[46px] py-4">
            <div className="flex items-start gap-3">
              {TABS.map((item) => (
                <SubNavItem
                  key={item.id}
                  theme="dark"
                  active={tab === item.id}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </SubNavItem>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col items-end gap-[25px] px-8 py-8 sm:px-16">
            {tab === "protect" ? <ProtectPanel onBuy={openConfirm} /> : null}
            {tab === "positions" ? <PositionsPanel /> : null}
            {tab === "history" ? <HistoryPanel /> : null}
          </div>
        </div>
      </main>

      <ConfirmTransactionModal
        open={confirmOpen}
        onCancel={closeConfirm}
        onConfirm={closeConfirm}
      />
    </AppShell>
  );
}

function ProtectPanel({ onBuy }: { onBuy: () => void }) {
  return (
    <>
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          className="flex w-[217px] items-center gap-[37px] rounded-pill bg-neutrals-2 px-4 py-2"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2.5">
            <img
              src="/images/app/solana-mark.svg"
              alt=""
              width={24}
              height={22}
              className="h-[22px] w-6 shrink-0"
            />
            <span className="font-body text-sm font-medium leading-6 text-neutrals-8">
              SOL
            </span>
            <span className="font-body text-sm leading-6 text-neutrals-4">
              Solana
            </span>
          </span>
          <img
            src="/icons/arrow-down-simple-line.svg"
            alt=""
            width={24}
            height={24}
            className="size-6 shrink-0"
          />
        </button>
        <div className="flex flex-col items-end justify-center font-body text-sm font-medium leading-6">
          <span className="text-neutrals-8">$142.85</span>
          <span className="text-primary-3">24h +1,84%</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-[10px] border border-neutrals-3 bg-neutrals-1 px-[33px] py-6">
        <div className="flex h-12 w-full items-center justify-between whitespace-nowrap">
          <span className="font-display text-[40px] font-bold leading-[48px] tracking-[-0.4px] text-neutrals-8">
            150
          </span>
          <span className="font-body text-base font-medium leading-6 text-neutrals-5">
            ≈ $21,427.50 protected
          </span>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="font-body text-caption-2 text-neutrals-4">
            <p className="m-0 leading-5">Collateral required: 21,427.50 USDC</p>
            <p className="m-0 leading-5">Available balance: 24,983.21 USDC</p>
          </div>
          <UiButton type="button" variant="dark" size="small">
            Max
          </UiButton>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <div className="flex w-full items-center justify-between font-body font-medium text-neutrals-8">
          <span className="text-base leading-6">Expiry</span>
          <span className="text-sm leading-6">7 days</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden">
          <img
            src="/icons/expiry-slider.svg"
            alt=""
            width={512}
            height={12}
            className="absolute inset-0 size-full max-w-none"
          />
        </div>
        <div className="flex w-full items-center justify-between font-body text-caption-2 text-neutrals-8">
          <span>1d</span>
          <span>3d</span>
          <span>7d</span>
          <span>14d</span>
          <span>30d</span>
        </div>
      </div>

      <DetailRows
        rows={[
          { label: "Strike Price", value: "$142.85" },
          { label: "Premium", value: "$195.42" },
          {
            label: "Max payout",
            value: "$21,427.50",
            valueClassName: "text-primary-4",
          },
          { label: "Resolves", value: "Pyth · block-final" },
        ]}
      />

      <UiButton
        type="button"
        variant="neutral"
        size="medium"
        className="w-full"
        onClick={onBuy}
      >
        Buy coverage for $195,42 (7 days)
      </UiButton>
    </>
  );
}

function PositionsPanel() {
  return (
    <>
      <div className="flex w-full gap-3 overflow-clip">
        <FilterDropdown label="All statuses" />
        <FilterDropdown label="All tokens" />
      </div>
      <PositionRow
        symbol="SOL"
        name="Solana"
        strike="Strike $142.85"
        premium="Premium paid $195.42"
        status="Active"
        meta="Expires in 4d"
      />
      <PositionRow
        symbol="BTC"
        name="Bitcoin"
        strike="Strike $61,900.00"
        premium="Premium paid $310.00"
        status="Active"
        meta="Expires in 6d"
      />
    </>
  );
}

function HistoryPanel() {
  return (
    <>
      <div className="flex w-full gap-3 overflow-clip">
        <FilterDropdown label="All outcomes" />
        <FilterDropdown label="All tokens" />
      </div>
      <PositionRow
        symbol="ETH"
        name="Ethereum"
        strike="Strike $3,420.00"
        premium="Premium paid $128.40"
        status="Paid out"
        meta="+$2,140.00 · 2d ago"
        metaClassName="text-primary-4"
      />
      <PositionRow
        symbol="SOL"
        name="Solana"
        strike="Strike $128.10"
        premium="Premium paid $96.75"
        status="No payout"
        statusVariant="muted"
        meta="Expired 9d ago"
      />
      <PositionRow
        symbol="BTC"
        name="Bitcoin"
        strike="Strike $58,200.00"
        premium="Premium paid $242.10"
        status="Paid out"
        meta="+$14,550.00 · 21d ago"
        metaClassName="text-primary-4"
      />
      <PositionRow
        symbol="SOL"
        name="Solana"
        strike="Strike $151.30"
        premium="Premium paid $88.20"
        status="No payout"
        statusVariant="muted"
        meta="Expired 34d ago"
      />
    </>
  );
}
