"use client";

import { useState } from "react";
import { SubNavItem } from "@/components/atoms/sub-nav-item";
import { PositionRow } from "@/components/molecules/position-row";
import { TokenMark, type TokenSymbol } from "@/components/molecules/token-mark";
import { Button as UiButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabId = "add" | "remove" | "position";

const TABS: { id: TabId; label: string }[] = [
  { id: "add", label: "Add" },
  { id: "remove", label: "Remove" },
  { id: "position", label: "My Position" },
];

const STATS = [
  { value: "$2,148,320", label: "Total value locked" },
  { value: "$184,660", label: "24h volume" },
  { value: "$1,700.00", label: "Your total deposits" },
];

const POOLS: {
  symbol: TokenSymbol;
  tvl: string;
  apr: string;
}[] = [
  { symbol: "SOL", tvl: "$482,940", apr: "18.4% APR" },
  { symbol: "BTC", tvl: "$1,082,110", apr: "12.1% APR" },
  { symbol: "ETH", tvl: "$583,270", apr: "15.7% APR" },
];

const SIDEBAR_POSITIONS: {
  symbol: TokenSymbol;
  amount: string;
  fees: string;
}[] = [
  { symbol: "SOL", amount: "$500.00", fees: "+$21.30 fees" },
  { symbol: "BTC", amount: "$1,200.00", fees: "+$48.60 fees" },
];

const MY_POSITIONS: {
  symbol: TokenSymbol;
  name: string;
  deposited: string;
  fees: string;
  share: string;
}[] = [
  {
    symbol: "SOL",
    name: "Solana",
    deposited: "Deposited $500.00",
    fees: "Fees earned +$21.30",
    share: "Share 3.2%",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    deposited: "Deposited $1,200.00",
    fees: "Fees earned +$48.60",
    share: "Share 1.8%",
  },
];

function UtilizationBar() {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex w-full items-center justify-between font-body font-medium text-neutrals-8">
        <span className="text-base leading-6">Pool utilization</span>
        <span className="text-sm leading-6">62%</span>
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
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex w-full items-center justify-between text-caption-2 text-neutrals-8">
      <span className="font-body font-normal">{label}</span>
      <span className={cn("font-body font-semibold", valueClassName)}>{value}</span>
    </div>
  );
}

function AssetSelector({
  metaValue,
  metaLabel,
}: {
  metaValue: string;
  metaLabel: string;
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <button
        type="button"
        className="flex w-[217px] items-center gap-[37px] rounded-pill bg-neutrals-2 px-4 py-2"
      >
        <span className="flex flex-1 items-center gap-2.5">
          <TokenMark symbol="SOL" />
          <span className="font-body text-sm font-medium leading-6 text-neutrals-8">SOL</span>
          <span className="font-body text-sm font-normal leading-6 text-neutrals-4">Solana</span>
        </span>
        <img
          src="/icons/arrow-down-simple-line.svg"
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0"
        />
      </button>
      <div className="flex flex-col items-end font-body text-sm font-medium leading-6">
        <span className="text-neutrals-8">{metaValue}</span>
        <span className="text-neutrals-5">{metaLabel}</span>
      </div>
    </div>
  );
}

function AmountBox({
  amount,
  conversion,
  helper,
  onMax,
}: {
  amount: string;
  conversion: string;
  helper: string;
  onMax: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-[10px] border border-neutrals-3 bg-neutrals-1 px-[33px] py-6">
      <div className="flex h-12 w-full items-center justify-between">
        <span className="font-display text-[40px] font-bold leading-[48px] tracking-[-0.4px] text-neutrals-8">
          {amount}
        </span>
        <span className="font-body text-base font-medium leading-6 text-neutrals-5">
          {conversion}
        </span>
      </div>
      <div className="flex w-full items-center justify-between">
        <span className="font-body text-caption-2 text-neutrals-4">{helper}</span>
        <UiButton type="button" variant="dark" size="small" onClick={onMax}>
          Max
        </UiButton>
      </div>
    </div>
  );
}

function LiquiditySidebar() {
  return (
    <aside className="flex h-full min-h-[717px] w-full flex-col gap-6 overflow-clip rounded-[10px] border border-neutrals-3 bg-[#141517] p-6 xl:w-[448px]">
      <h2 className="m-0 font-body text-base font-medium leading-6 text-neutrals-8">Pools</h2>
      {POOLS.map((pool) => (
        <div key={pool.symbol} className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TokenMark symbol={pool.symbol} />
            <span className="font-body text-sm font-medium leading-6 text-neutrals-8">
              {pool.symbol}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5 text-right font-body font-medium">
            <span className="text-[13px] leading-6 text-neutrals-8">{pool.tvl}</span>
            <span className="text-[11px] leading-6 text-[#8b5cf6]">{pool.apr}</span>
          </div>
        </div>
      ))}
      <div className="h-px w-full bg-neutrals-3" />
      <h2 className="m-0 font-body text-base font-medium leading-6 text-neutrals-8">
        Your positions
      </h2>
      {SIDEBAR_POSITIONS.map((position) => (
        <div key={position.symbol} className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TokenMark symbol={position.symbol} />
            <span className="font-body text-sm font-medium leading-6 text-neutrals-8">
              {position.symbol}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5 text-right font-body font-medium">
            <span className="text-[13px] leading-6 text-neutrals-8">{position.amount}</span>
            <span className="text-[11px] leading-6 text-primary-4">{position.fees}</span>
          </div>
        </div>
      ))}
    </aside>
  );
}

function AddTab({ amount, setAmount }: { amount: string; setAmount: (v: string) => void }) {
  return (
    <div className="flex w-full flex-col gap-[25px]">
      <AssetSelector metaValue="$482,940" metaLabel="Pool TVL" />
      <AmountBox
        amount={amount}
        conversion="≈ $500.00 USDC deposit"
        helper="Wallet balance: 24,983.21 USDC"
        onMax={() => setAmount("24983")}
      />
      <UtilizationBar />
      <div className="flex w-full flex-col gap-2 rounded-[10px] bg-neutrals-2 px-8 py-4">
        <SummaryRow label="Pool TVL" value="$482,940.00" />
        <SummaryRow label="Your APR (est.)" value="18.4%" />
        <SummaryRow
          label="LP tokens received"
          value="500.00 sLP-SOL"
          valueClassName="text-primary-4"
        />
        <SummaryRow label="Withdrawal" value="Anytime, subject to liquidity" />
      </div>
      <UiButton type="button" variant="neutral" size="medium" className="w-full">
        Add liquidity for 500 USDC
      </UiButton>
    </div>
  );
}

function RemoveTab({ amount, setAmount }: { amount: string; setAmount: (v: string) => void }) {
  return (
    <div className="flex w-full flex-col gap-[25px]">
      <AssetSelector metaValue="500.00" metaLabel="Your LP tokens" />
      <AmountBox
        amount={amount}
        conversion="≈ $521.30 USDC incl. fees"
        helper="Available to withdraw: 500.00 sLP-SOL"
        onMax={() => setAmount("500")}
      />
      <UtilizationBar />
      <div className="flex w-full flex-col gap-2 rounded-[10px] bg-neutrals-2 px-8 py-4">
        <SummaryRow label="Your deposit" value="$500.00" />
        <SummaryRow label="Fees earned" value="+$21.30" />
        <SummaryRow
          label="You'll receive"
          value="521.30 USDC"
          valueClassName="text-primary-4"
        />
        <SummaryRow label="Withdrawal" value="Instant · pool has liquidity" />
      </div>
      <UiButton type="button" variant="neutral" size="medium" className="w-full">
        Withdraw 500.00 sLP-SOL
      </UiButton>
    </div>
  );
}

function MyPositionTab() {
  return (
    <div className="flex w-full flex-col gap-[25px]">
      {MY_POSITIONS.map((position) => (
        <PositionRow
          key={position.symbol}
          symbol={position.symbol}
          name={position.name}
          strike={position.deposited}
          premium={position.fees}
          status="Earning"
          meta={position.share}
        />
      ))}
    </div>
  );
}

export function LiquidityPoolFlow() {
  const [tab, setTab] = useState<TabId>("add");
  const [amount, setAmount] = useState("500");

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-[29px] px-4 py-20 xl:px-0">
      <h1 className="m-0 font-display text-[32px] font-bold leading-10 tracking-[-0.32px] text-neutrals-8">
        Provide liquidity, earn the spread
      </h1>
      <p className="m-0 max-w-[1120px] font-body text-caption-2 text-neutrals-5">
        Underwrite the AMM pool and earn a share of trading fees for taking on UP-side risk. Add or
        withdraw at any time before expiry.
      </p>
      <div className="flex w-full gap-8 overflow-clip">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex h-24 min-w-0 flex-1 flex-col gap-1.5 overflow-clip rounded-[10px] border border-neutrals-3 bg-[#141517] px-6 py-5"
          >
            <span className="font-display text-[22px] font-bold leading-10 tracking-[-0.22px] text-neutrals-8">
              {stat.value}
            </span>
            <span className="font-body text-caption-2 text-neutrals-5">{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <section className="flex w-full flex-col rounded-[10px] bg-neutrals-1 shadow-depth4 xl:w-[640px]">
          <div className="flex h-[60px] items-center justify-center border-b border-neutrals-3 px-[46px] py-4">
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
          <div className="flex w-full flex-col items-end px-8 py-8 sm:px-16">
            {tab === "add" ? <AddTab amount={amount} setAmount={setAmount} /> : null}
            {tab === "remove" ? <RemoveTab amount={amount} setAmount={setAmount} /> : null}
            {tab === "position" ? <MyPositionTab /> : null}
          </div>
        </section>
        <LiquiditySidebar />
      </div>
    </div>
  );
}
