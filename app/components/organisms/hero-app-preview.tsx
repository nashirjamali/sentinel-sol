"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { TokenIcon } from "@/components/atoms/token-icon";
import { DetailRows } from "@/components/molecules/detail-rows";
import { Button as UiButton } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { APP_ASSETS } from "@/lib/wallet/token-icons";

const APP_HREF = "/app/market";
const PREVIEW_WIDTH = 1120;
const PREVIEW_HEIGHT = 500;
const EXPIRY_DAYS = [1, 3, 7, 14, 30] as const;
const DEFAULT_EXPIRY_INDEX = 2;
const PREMIUM_RATE_PER_DAY = 195.42 / (150 * 142.85) / 7;
const USDC_BALANCE = 24983.21;
const DEFAULT_AMOUNT = "150";

const [SOL, CBBTC, WBTC] = APP_ASSETS;

const PREVIEW_ASSETS = [
  { ...SOL, id: "SOL", price: 142.85, change24h: 1.84 },
  { ...CBBTC, id: "cbBTC", price: 78114.6, change24h: -0.42 },
  { ...WBTC, id: "WBTC", price: 77920.15, change24h: 0.91 },
] as const;

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

function maxAmountFor(price: number) {
  if (!(price > 0)) return 0;
  return Math.floor((USDC_BALANCE / price) * 100) / 100;
}

export function HeroAppPreview() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [selectedId, setSelectedId] = useState<string>(PREVIEW_ASSETS[0].id);
  const [amountInput, setAmountInput] = useState(DEFAULT_AMOUNT);
  const [expiryIndex, setExpiryIndex] = useState(DEFAULT_EXPIRY_INDEX);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setScale(Math.min(width / PREVIEW_WIDTH, height / PREVIEW_HEIGHT));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const asset = PREVIEW_ASSETS.find((item) => item.id === selectedId) ?? PREVIEW_ASSETS[0];
  const expiryDays = EXPIRY_DAYS[expiryIndex] ?? EXPIRY_DAYS[DEFAULT_EXPIRY_INDEX];
  const amount = parseAmount(amountInput);
  const maxAmount = maxAmountFor(asset.price);
  const coverageUsd = amount === null ? 0 : amount * asset.price;
  const premium = coverageUsd * PREMIUM_RATE_PER_DAY * expiryDays;
  const expiryLabel = expiryDays === 1 ? "1 day" : `${expiryDays} days`;
  const coverageLabel =
    amount !== null && amount > 0
      ? `${formatTokenAmount(amount)} ${asset.symbol}`
      : `0 ${asset.symbol}`;

  const quoteRows = useMemo(
    () => [
      { label: "Strike", value: `$${formatUsd(asset.price)}` },
      { label: "Premium", value: `$${formatUsd(premium)}` },
      {
        label: "Max payout",
        value: `$${formatUsd(coverageUsd)}`,
        valueClassName: "text-primary-4",
      },
      { label: "Resolves", value: "Pyth, block-final" },
    ],
    [asset.price, coverageUsd, premium],
  );

  function applyAsset(nextId: string) {
    const nextAsset = PREVIEW_ASSETS.find((item) => item.id === nextId);
    if (!nextAsset) return;
    const current = parseAmount(amountInput);
    const nextMax = maxAmountFor(nextAsset.price);
    if (current === null || current * nextAsset.price > USDC_BALANCE) {
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
    <div
      ref={frameRef}
      className="absolute inset-0 overflow-hidden rounded-[20px] border border-neutrals-3 bg-neutrals-1 shadow-[0px_40px_80px_-24px_rgba(5,5,5,0.5)]"
      aria-label="App preview with sample quotes"
    >
      <div
        className="absolute left-1/2 top-1/2 flex w-[1120px] flex-col justify-center bg-neutrals-1 px-16 py-8"
        style={{
          height: PREVIEW_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <div className="grid min-h-0 flex-1 grid-cols-2 items-stretch gap-x-[49px]">
          <div className="flex flex-col gap-[25px]">
            <div className="flex min-h-12 w-full items-center justify-between gap-3">
              <Select value={asset.id} onValueChange={applyAsset}>
                <SelectTrigger
                  aria-label="Select asset"
                  className="group h-auto w-[217px] gap-[10px] rounded-pill border-0 bg-neutrals-2 px-4 py-2 text-neutrals-8 transition-colors duration-200 hover:bg-neutrals-3 focus-visible:border-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-1"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2.5">
                    <TokenIcon src={asset.iconUrl} symbol={asset.symbol} />
                    <span className="truncate font-body text-sm font-medium leading-6 text-neutrals-8">
                      {asset.symbol}
                    </span>
                    <span className="truncate font-body text-sm leading-6 text-neutrals-4">
                      {asset.name}
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
                  className="w-[min(360px,calc(100vw-2rem))] rounded-[10px] border-neutrals-3 bg-neutrals-2"
                >
                  {PREVIEW_ASSETS.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      className="w-full text-neutrals-8 focus:bg-neutrals-3"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <TokenIcon src={item.iconUrl} symbol={item.symbol} />
                        <span className="truncate font-body text-sm font-medium leading-6">
                          {item.symbol}
                        </span>
                        <span className="truncate font-body text-sm leading-6 text-neutrals-4">
                          {item.name}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-col items-end justify-center font-body text-sm font-medium leading-6 tabular-nums">
                <span className="text-neutrals-8">${formatUsd(asset.price)}</span>
                <span className={asset.change24h >= 0 ? "text-primary-4" : "text-primary-3"}>
                  24h {asset.change24h >= 0 ? "+" : "-"}
                  {Math.abs(asset.change24h).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 rounded-[10px] border border-neutrals-3 bg-neutrals-1 px-[33px] py-6 transition-colors duration-200 focus-within:border-primary-1">
              <div className="flex h-12 w-full items-center justify-between gap-4">
                <label className="sr-only" htmlFor="hero-coverage-amount">
                  Coverage amount in {asset.symbol}
                </label>
                <input
                  id="hero-coverage-amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={amountInput}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  className="min-w-0 flex-1 border-none bg-transparent p-0 font-display text-[40px] font-bold leading-[48px] tracking-[-0.4px] text-neutrals-8 caret-primary-1 tabular-nums outline-none placeholder:text-neutrals-4"
                  placeholder="0"
                />
                <span className="shrink-0 font-body text-base font-medium leading-6 text-neutrals-5 tabular-nums">
                  ≈ ${formatUsd(coverageUsd)} protected
                </span>
              </div>
              <div className="flex w-full items-center justify-between gap-4">
                <div className="font-body text-caption-2 tabular-nums text-neutrals-4">
                  <p className="m-0 leading-5">
                    Collateral required: {formatUsd(coverageUsd)} USDC
                  </p>
                  <p className="m-0 leading-5">
                    Available balance: {formatUsd(USDC_BALANCE)} USDC
                  </p>
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

            <div className="flex w-full flex-col justify-center gap-2.5 rounded-[10px] border border-neutrals-4 bg-neutrals-1 px-6 py-4">
              <div className="flex h-[33px] w-full items-center justify-between font-body font-medium text-neutrals-8">
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
              <div className="flex h-[33px] w-full items-center justify-between font-body text-caption-2 text-neutrals-8">
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
          </div>

          <aside className="flex h-full min-h-0 flex-col gap-6 rounded-[10px] bg-neutrals-2 px-8 py-4 shadow-[inset_0_1px_0_rgba(252,252,253,0.06)]">
            <div className="flex w-full flex-col gap-1">
              <p className="m-0 font-body text-body-2 text-neutrals-5">You pay</p>
              <p className="m-0 font-display text-[32px] font-bold leading-10 tracking-[-0.32px] text-neutrals-8 tabular-nums">
                ${formatUsd(premium)}
              </p>
              <p className="m-0 font-body text-body-2 text-neutrals-5">
                {expiryLabel} of coverage on {coverageLabel}
              </p>
            </div>
            <div className="h-px w-full bg-neutrals-3" />
            <DetailRows variant="flush" className="min-h-0 flex-1" rows={quoteRows} />
            <UiButton asChild variant="neutral" size="medium" className="mt-auto h-12 w-full">
              <Link href={APP_HREF}>
                Buy coverage for ${formatUsd(premium)} ({expiryLabel})
              </Link>
            </UiButton>
          </aside>
        </div>
      </div>
    </div>
  );
}
