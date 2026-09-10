"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { SubNavItem } from "@/components/atoms/sub-nav-item";
import { TokenIcon } from "@/components/atoms/token-icon";
import { DetailRows } from "@/components/molecules/detail-rows";
import { FilterDropdown } from "@/components/molecules/filter-dropdown";
import { PositionRow } from "@/components/molecules/position-row";
import { StatusPill } from "@/components/molecules/status-pill";
import { AppShell } from "@/components/organisms/app-shell";
import { ConfirmTransactionModal } from "@/components/organisms/confirm-transaction-modal";
import { Button as UiButton } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  fetchWalletAssets,
  parseWalletAddress,
  type SolanaCluster,
  type WalletAsset,
} from "@/lib/wallet/assets";
import { cn } from "@/lib/utils";
import { CBBTC_ICON, SOL_ICON, WBTC_ICON } from "@/lib/wallet/token-icons";

type MarketTab = "protect" | "positions" | "history";

type ProtectQuote = {
  coverage: string;
  youPay: string;
};

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

const EXPIRY_DAYS = [1, 3, 7, 14, 30] as const;
const DEFAULT_EXPIRY_INDEX = 2;
const PREMIUM_RATE_PER_DAY = 195.42 / (150 * 142.85) / 7;
const NATIVE_SOL_MINT = "So11111111111111111111111111111111111111112";

const POSITIONS = [
  {
    symbol: "SOL",
    name: "Solana",
    iconUrl: SOL_ICON,
    strike: "Strike $148.22",
    premium: "Premium paid $187.40",
    status: "Active",
    meta: "Expires in 4d",
  },
  {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    iconUrl: CBBTC_ICON,
    strike: "Strike $78,114.60",
    premium: "Premium paid $312.85",
    status: "Active",
    meta: "Expires in 6d",
  },
] as const;

const HISTORY = [
  {
    symbol: "WBTC",
    name: "Wrapped BTC",
    iconUrl: WBTC_ICON,
    strike: "Strike $76,420.00",
    premium: "Premium paid $241.10",
    status: "Paid out",
    statusVariant: "success" as const,
    outcome: "paid",
    meta: "+$14,550.00 · 21d ago",
    metaClassName: "text-primary-4",
  },
  {
    symbol: "SOL",
    name: "Solana",
    iconUrl: SOL_ICON,
    strike: "Strike $128.10",
    premium: "Premium paid $96.75",
    status: "No payout",
    statusVariant: "muted" as const,
    outcome: "expired",
    meta: "Expired 9d ago",
    metaClassName: undefined,
  },
  {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    iconUrl: CBBTC_ICON,
    strike: "Strike $74,880.00",
    premium: "Premium paid $268.40",
    status: "Paid out",
    statusVariant: "success" as const,
    outcome: "paid",
    meta: "+$2,140.00 · 2d ago",
    metaClassName: "text-primary-4",
  },
  {
    symbol: "SOL",
    name: "Solana",
    iconUrl: SOL_ICON,
    strike: "Strike $151.30",
    premium: "Premium paid $88.20",
    status: "No payout",
    statusVariant: "muted" as const,
    outcome: "expired",
    meta: "Expired 34d ago",
    metaClassName: undefined,
  },
];

function parseTab(value: string | null): MarketTab {
  if (value === "positions" || value === "history" || value === "protect") {
    return value;
  }
  return "protect";
}

function formatUsd(value: number, digits = 2) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatTokenAmount(value: number) {
  if (Number.isInteger(value)) return String(value);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/,/g, "").trim();
  if (cleaned === "" || cleaned === ".") return null;
  const next = Number(cleaned);
  if (!Number.isFinite(next) || next < 0) return null;
  return next;
}

function maxAmountFor(price: number, usdcBalance: number) {
  if (!(price > 0)) return 0;
  return Math.floor((usdcBalance / price) * 100) / 100;
}

function clusterFromNetwork(networkId: string | undefined): SolanaCluster {
  if (!networkId) {
    return process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet" ? "mainnet" : "devnet";
  }
  if (networkId.includes("EtWTRABZaYq6iMfeYKouRu166VU2xqa1") || networkId.includes("devnet")) {
    return "devnet";
  }
  return "mainnet";
}

export default function MarketPage() {
  return (
    <Suspense
      fallback={
        <AppShell lockViewport>
          <main className="mx-auto min-h-0 w-full max-w-[640px] px-4" />
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
  const [quote, setQuote] = useState<ProtectQuote>({
    coverage: "150 SOL",
    youPay: "195.42 USDC",
  });

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

  const openConfirm = useCallback(
    (next: ProtectQuote) => {
      setQuote(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set("confirm", "1");
      if (tab !== "protect") {
        params.set("tab", "protect");
      }
      setConfirmOpen(true);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, tab],
  );

  const closeConfirm = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("confirm");
    setConfirmOpen(false);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const copy = TAB_COPY[tab];

  return (
    <AppShell lockViewport>
      <main className="mx-auto flex w-full max-w-[640px] flex-col items-center justify-center gap-3 px-4 py-6 lg:h-full lg:gap-4 lg:overflow-hidden lg:py-0">
        <h1 className="m-0 w-full text-balance text-center font-display text-[28px] font-bold leading-9 tracking-[-0.28px] text-neutrals-8 xl:text-[32px] xl:leading-10 xl:tracking-[-0.32px]">
          {copy.title}
        </h1>
        <p className="m-0 w-full max-w-[65ch] text-pretty text-center font-body text-caption-2 text-neutrals-5">
          {copy.subtitle}
        </p>

        <div className="flex w-full min-h-0 flex-col items-start rounded-[10px] bg-neutrals-1 shadow-depth4">
          <div className="flex h-[60px] w-full shrink-0 items-center justify-center overflow-clip border-b border-neutrals-3 px-[46px] py-4">
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

          <div
            className={cn(
              "flex w-full min-h-0 flex-col items-end gap-4 px-8 py-5 sm:px-16 xl:gap-5 xl:py-6",
              tab === "protect" ? "lg:overflow-hidden" : "overflow-y-auto",
            )}
          >
            {tab === "protect" ? <ProtectPanel onBuy={openConfirm} /> : null}
            {tab === "positions" ? <PositionsPanel /> : null}
            {tab === "history" ? <HistoryPanel /> : null}
          </div>
        </div>
      </main>

      <ConfirmTransactionModal
        open={confirmOpen}
        coverage={quote.coverage}
        youPay={quote.youPay}
        onCancel={closeConfirm}
        onConfirm={closeConfirm}
      />
    </AppShell>
  );
}

function ProtectPanel({ onBuy }: { onBuy: (quote: ProtectQuote) => void }) {
  const { address } = useAppKitAccount();
  const { caipNetworkId } = useAppKitNetwork();
  const cluster = clusterFromNetwork(
    typeof caipNetworkId === "string" ? caipNetworkId : undefined,
  );
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(NATIVE_SOL_MINT);
  const [amountInput, setAmountInput] = useState("1");
  const [expiryIndex, setExpiryIndex] = useState(DEFAULT_EXPIRY_INDEX);

  useEffect(() => {
    if (!address) return;
    const owner = parseWalletAddress(address);
    let cancelled = false;
    setAssetsLoading(true);
    setAssetsError(null);
    fetchWalletAssets(owner, cluster)
      .then((payload) => {
        if (cancelled) return;
        setAssets(payload.assets);
        setUsdcBalance(payload.usdcBalance);
        setSelectedId((current) => {
          const stillThere = payload.assets.some(
            (item) => item.id === current && item.supported,
          );
          if (stillThere) return current;
          return payload.assets.find((item) => item.supported)?.id ?? NATIVE_SOL_MINT;
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setAssetsError(error instanceof Error ? error.message : "Couldn't load wallet assets.");
      })
      .finally(() => {
        if (!cancelled) setAssetsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address, cluster]);

  const asset = assets.find((item) => item.id === selectedId) ?? assets.find((item) => item.supported);
  const price = asset?.price ?? 0;
  const expiryDays = EXPIRY_DAYS[expiryIndex] ?? EXPIRY_DAYS[DEFAULT_EXPIRY_INDEX];
  const amount = parseAmount(amountInput);
  const maxAmount = maxAmountFor(price, usdcBalance);
  const coverageUsd = amount === null ? 0 : amount * price;
  const exceedsBalance = amount !== null && coverageUsd > usdcBalance + 0.0001;
  const canBuy =
    Boolean(asset?.supported) &&
    amount !== null &&
    amount > 0 &&
    price > 0 &&
    !exceedsBalance;
  const premium = coverageUsd * PREMIUM_RATE_PER_DAY * expiryDays;
  const expiryLabel = expiryDays === 1 ? "1 day" : `${expiryDays} days`;

  function applyAsset(nextId: string) {
    const nextAsset = assets.find((item) => item.id === nextId);
    if (!nextAsset?.supported) return;
    const current = parseAmount(amountInput);
    const nextMax = maxAmountFor(nextAsset.price ?? 0, usdcBalance);
    if (current === null || current * (nextAsset.price ?? 0) > usdcBalance) {
      setAmountInput(String(nextMax));
    }
    setSelectedId(nextId);
  }

  function handleAmountChange(value: string) {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmountInput(value);
    }
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-3">
        <Select value={asset?.id ?? selectedId} onValueChange={applyAsset} disabled={assetsLoading}>
          <SelectTrigger
            aria-label="Select asset"
            className="group h-auto min-w-[217px] max-w-[280px] gap-3 rounded-pill border-0 bg-neutrals-2 px-4 py-2 text-neutrals-8 transition-colors duration-200 hover:bg-neutrals-3 focus-visible:border-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-1"
          >
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              {assetsLoading ? (
                <span className="size-6 shrink-0 animate-pulse rounded-full bg-neutrals-3" />
              ) : (
                <TokenIcon src={asset?.iconUrl ?? null} symbol={asset?.symbol ?? "?"} />
              )}
              <span className="truncate font-body text-sm font-medium leading-6 text-neutrals-8">
                {asset?.symbol ?? "SOL"}
              </span>
              <span className="truncate font-body text-sm leading-6 text-neutrals-4">
                {asset?.name ?? "Solana"}
              </span>
            </span>
            <img
              src="/icons/arrow-down-simple-line.svg"
              alt=""
              width={24}
              height={24}
              className="size-6 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </SelectTrigger>
          <SelectContent
            align="start"
            className="min-w-[360px] rounded-[10px] border-neutrals-3 bg-neutrals-2"
          >
            {assets.map((item) => (
              <SelectItem
                key={item.id}
                value={item.id}
                disabled={!item.supported}
                className="w-full text-neutrals-8 focus:bg-neutrals-3 data-[disabled]:opacity-60"
              >
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <TokenIcon src={item.iconUrl} symbol={item.symbol} />
                    <span className="truncate font-body text-sm font-medium leading-6">
                      {item.symbol}
                    </span>
                    <span className="truncate font-body text-sm leading-6 text-neutrals-4">
                      {item.name}
                    </span>
                  </span>
                  <StatusPill variant={item.supported ? "success" : "muted"}>
                    {item.supported ? "Supported" : "Not supported"}
                  </StatusPill>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-col items-end justify-center font-body text-sm font-medium leading-6 tabular-nums">
          <span className="text-neutrals-8">
            {asset?.price != null ? `$${formatUsd(asset.price)}` : "—"}
          </span>
          {asset?.change24h != null ? (
            <span className={asset.change24h >= 0 ? "text-primary-4" : "text-primary-3"}>
              24h {asset.change24h >= 0 ? "+" : "−"}
              {Math.abs(asset.change24h).toFixed(2).replace(".", ",")}%
            </span>
          ) : (
            <span className="text-neutrals-4">24h —</span>
          )}
        </div>
      </div>
      {assetsError ? (
        <p className="m-0 w-full font-body text-caption-2 text-primary-3" role="alert">
          {assetsError}
        </p>
      ) : null}

      <div
        className={cn(
          "flex w-full flex-col gap-4 rounded-[10px] border bg-neutrals-1 px-[33px] py-5 transition-colors duration-200 focus-within:border-primary-1",
          exceedsBalance ? "border-primary-3" : "border-neutrals-3",
        )}
      >
        <div className="flex h-12 w-full items-center justify-between gap-4">
          <label className="sr-only" htmlFor="coverage-amount">
            Coverage amount in {asset?.symbol ?? "SOL"}
          </label>
          <input
            id="coverage-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={amountInput}
            onChange={(event) => handleAmountChange(event.target.value)}
            className="min-w-0 flex-1 border-none bg-transparent p-0 font-display text-[40px] font-bold leading-[48px] tracking-[-0.4px] text-neutrals-8 tabular-nums outline-none placeholder:text-neutrals-4"
            placeholder="0"
          />
          <span className="shrink-0 font-body text-base font-medium leading-6 text-neutrals-5 tabular-nums">
            ≈ ${formatUsd(coverageUsd)} protected
          </span>
        </div>
        <div className="flex w-full items-center justify-between gap-4">
          <div className="font-body text-caption-2 tabular-nums">
            <p
              className={cn(
                "m-0 leading-5",
                exceedsBalance ? "text-primary-3" : "text-neutrals-4",
              )}
            >
              Collateral required: {formatUsd(coverageUsd)} USDC
            </p>
            <p className="m-0 leading-5 text-neutrals-4">
              Available balance: {formatUsd(usdcBalance)} USDC
            </p>
            {exceedsBalance ? (
              <p className="m-0 leading-5 text-primary-3" role="alert">
                Amount exceeds available balance.
              </p>
            ) : null}
          </div>
          <UiButton
            type="button"
            variant="dark"
            size="small"
            onClick={() => setAmountInput(String(maxAmount))}
          >
            Max
          </UiButton>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <div className="flex w-full items-center justify-between font-body font-medium text-neutrals-8">
          <span className="text-base leading-6">Expiry</span>
          <span className="text-sm leading-6 tabular-nums">{expiryLabel}</span>
        </div>
        <Slider
          variant="coverage"
          className="h-3"
          min={0}
          max={EXPIRY_DAYS.length - 1}
          step={1}
          value={[expiryIndex]}
          aria-label="Expiry"
          onValueChange={([next]) => setExpiryIndex(next)}
        />
        <div className="flex w-full items-center justify-between font-body text-caption-2 text-neutrals-8">
          {EXPIRY_DAYS.map((days, index) => (
            <button
              key={days}
              type="button"
              className={cn(
                "rounded-sm leading-5 transition-colors duration-200 hover:text-neutrals-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-1",
                index === expiryIndex ? "font-medium text-neutrals-8" : "text-neutrals-4",
              )}
              onClick={() => setExpiryIndex(index)}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      <DetailRows
        rows={[
          { label: "Strike Price", value: asset?.price != null ? `$${formatUsd(asset.price)}` : "—" },
          { label: "Premium", value: `$${formatUsd(premium)}` },
          {
            label: "Max payout",
            value: `$${formatUsd(coverageUsd)}`,
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
        disabled={!canBuy}
        onClick={() =>
          onBuy({
            coverage: `${formatTokenAmount(amount ?? 0)} ${asset?.symbol ?? ""}`,
            youPay: `${formatUsd(premium)} USDC`,
          })
        }
      >
        {canBuy
          ? `Buy coverage for $${formatUsd(premium)} (${expiryLabel})`
          : asset && !asset.supported
            ? "This asset is not supported"
            : "Enter a coverage amount"}
      </UiButton>
    </>
  );
}

const TOKEN_FILTER_OPTIONS = [
  { value: "all", label: "All tokens" },
  { value: "SOL", label: "SOL · Solana" },
  { value: "cbBTC", label: "cbBTC · Coinbase Wrapped BTC" },
  { value: "WBTC", label: "WBTC · Wrapped BTC" },
];

function PositionsPanel() {
  const [token, setToken] = useState("all");

  const rows = POSITIONS.filter((row) => token === "all" || row.symbol === token);

  return (
    <>
      <FilterDropdown
        label="Token"
        aria-label="Filter by token"
        value={token}
        onChange={setToken}
        options={TOKEN_FILTER_OPTIONS}
      />
      {rows.length === 0 ? (
        <div className="flex w-full flex-col items-center gap-2 rounded-[12px] bg-neutrals-2 px-6 py-10 text-center">
          <p className="m-0 font-body text-sm font-medium leading-6 text-neutrals-8">
            No positions match this filter.
          </p>
          <p className="m-0 max-w-[42ch] font-body text-caption-2 text-neutrals-4">
            Choose another token or buy coverage to see a policy here.
          </p>
        </div>
      ) : (
        rows.map((row) => (
          <PositionRow
            key={`${row.symbol}-${row.meta}`}
            symbol={row.symbol}
            name={row.name}
            iconUrl={row.iconUrl}
            strike={row.strike}
            premium={row.premium}
            status={row.status}
            meta={row.meta}
          />
        ))
      )}
    </>
  );
}

function HistoryPanel() {
  const [outcome, setOutcome] = useState("all");
  const [token, setToken] = useState("all");

  const rows = HISTORY.filter((row) => {
    if (outcome !== "all" && row.outcome !== outcome) return false;
    if (token !== "all" && row.symbol !== token) return false;
    return true;
  });

  return (
    <>
      <div className="flex w-full gap-3">
        <FilterDropdown
          label="Outcome"
          aria-label="Filter by outcome"
          value={outcome}
          onChange={setOutcome}
          options={[
            { value: "all", label: "All outcomes" },
            { value: "paid", label: "Paid out" },
            { value: "expired", label: "No payout" },
          ]}
        />
        <FilterDropdown
          label="Token"
          aria-label="Filter by token"
          value={token}
          onChange={setToken}
          options={TOKEN_FILTER_OPTIONS}
        />
      </div>
      {rows.length === 0 ? (
        <div className="flex w-full flex-col items-center gap-2 rounded-[12px] bg-neutrals-2 px-6 py-10 text-center">
          <p className="m-0 font-body text-sm font-medium leading-6 text-neutrals-8">
            No history matches these filters.
          </p>
          <p className="m-0 max-w-[42ch] font-body text-caption-2 text-neutrals-4">
            Expired policies will show up here after settlement.
          </p>
        </div>
      ) : (
        rows.map((row) => (
          <PositionRow
            key={`${row.symbol}-${row.meta}`}
            symbol={row.symbol}
            name={row.name}
            iconUrl={row.iconUrl}
            strike={row.strike}
            premium={row.premium}
            status={row.status}
            statusVariant={row.statusVariant}
            meta={row.meta}
            metaClassName={row.metaClassName}
          />
        ))
      )}
    </>
  );
}
