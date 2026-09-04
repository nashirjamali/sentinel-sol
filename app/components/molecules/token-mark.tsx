import { cn } from "@/lib/utils";

export type TokenSymbol = "SOL" | "BTC" | "ETH";

type TokenMarkProps = {
  symbol: TokenSymbol;
  size?: "sm" | "md";
  className?: string;
};

export function TokenMark({ symbol, size = "sm", className }: TokenMarkProps) {
  if (symbol === "SOL") {
    return (
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-clip",
          size === "sm" ? "h-[22px] w-6" : "size-9 bg-white",
          className,
        )}
      >
        <img
          src="/images/app/solana-mark.svg"
          alt=""
          width={size === "sm" ? 24 : 26}
          height={size === "sm" ? 22 : 24}
          className={size === "sm" ? "size-full" : "h-6 w-[26px]"}
        />
      </span>
    );
  }

  if (symbol === "BTC") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-[#f7931a] font-body font-semibold text-white",
          size === "sm" ? "size-9 text-lg leading-6" : "size-9 text-lg leading-6",
          className,
        )}
      >
        ₿
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#627eea] font-body font-semibold text-white",
        size === "sm" ? "size-9 text-lg leading-6" : "size-9 text-lg leading-6",
        className,
      )}
    >
      Ξ
    </span>
  );
}
