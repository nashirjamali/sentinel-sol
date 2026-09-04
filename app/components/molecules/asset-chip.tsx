import { cn } from "@/lib/utils";

export type AssetSymbol = "SOL" | "BTC" | "ETH";

type AssetChipProps = {
  symbol: AssetSymbol;
  name: string;
  size?: "sm" | "md";
  className?: string;
};

function AssetIcon({ symbol, size }: { symbol: AssetSymbol; size: "sm" | "md" }) {
  const box = size === "sm" ? "size-6" : "size-9";
  const mark = size === "sm" ? "h-[22px] w-6" : "h-6 w-[26px]";

  if (symbol === "SOL") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-clip",
          size === "md" && "bg-white",
          box,
        )}
      >
        <img
          src="/images/app/solana-mark.svg"
          alt=""
          width={size === "sm" ? 24 : 26}
          height={size === "sm" ? 22 : 24}
          className={mark}
        />
      </span>
    );
  }

  if (symbol === "BTC") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-clip rounded-full bg-[#f7931a]",
          box,
        )}
      >
        <span className="font-body text-lg font-semibold leading-6 text-white">₿</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-clip rounded-full bg-[#627eea]",
        box,
      )}
    >
      <span className="font-body text-lg font-semibold leading-6 text-white">Ξ</span>
    </span>
  );
}

export function AssetChip({ symbol, name, size = "md", className }: AssetChipProps) {
  return (
    <div className={cn("flex items-center gap-2.5 overflow-clip", className)}>
      <AssetIcon symbol={symbol} size={size} />
      <div className="flex flex-col gap-0.5 whitespace-nowrap">
        <span
          className={cn(
            "font-body",
            size === "md"
              ? "text-body-1 font-semibold tracking-[-0.02em] text-neutrals-7"
              : "text-sm font-medium leading-6 text-neutrals-8",
          )}
        >
          {symbol}
        </span>
        <span className="font-body text-sm leading-6 text-neutrals-4">{name}</span>
      </div>
    </div>
  );
}
