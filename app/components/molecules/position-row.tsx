"use client";

import { TokenIcon } from "@/components/atoms/token-icon";
import { TOKEN_ICONS } from "@/lib/wallet/token-icons";
import { cn } from "@/lib/utils";

type PositionRowProps = {
  symbol: string;
  name: string;
  iconUrl?: string | null;
  strike: string;
  premium: string;
  status: string;
  statusVariant?: "success" | "muted";
  meta: string;
  metaClassName?: string;
  className?: string;
};

export function PositionRow({
  symbol,
  name,
  iconUrl = null,
  strike,
  premium,
  status,
  statusVariant = "success",
  meta,
  metaClassName,
  className,
}: PositionRowProps) {
  return (
    <article
      className={cn(
        "flex w-full items-center gap-4 rounded-[10px] bg-neutrals-2 px-4 py-4 transition-colors duration-200 hover:bg-neutrals-3",
        className,
      )}
    >
      <TokenIcon src={iconUrl ?? TOKEN_ICONS[symbol] ?? null} symbol={symbol} size="md" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate font-body text-sm font-semibold leading-6 text-neutrals-8">
            {symbol}
          </span>
          <span className="truncate font-body text-caption-2 text-neutrals-4">{name}</span>
        </div>
        <p className="m-0 truncate font-body text-sm leading-6 text-neutrals-8 tabular-nums">
          {strike}
        </p>
        <p className="m-0 truncate font-body text-caption-2 text-neutrals-4 tabular-nums">
          {premium}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            "rounded px-2 py-0.5 font-body text-[11px] font-medium leading-5",
            statusVariant === "success"
              ? "bg-primary-4/15 text-primary-4"
              : "bg-neutrals-3 text-neutrals-4",
          )}
        >
          {status}
        </span>
        <p
          className={cn(
            "m-0 font-body text-caption-2 tabular-nums text-neutrals-4",
            metaClassName,
          )}
        >
          {meta}
        </p>
      </div>
    </article>
  );
}
