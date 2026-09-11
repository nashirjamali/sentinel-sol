"use client";

import { TokenIcon } from "@/components/atoms/token-icon";
import { TOKEN_ICONS } from "@/lib/wallet/token-icons";

export type TokenSymbol = "SOL" | "cbBTC" | "WBTC";

type TokenMarkProps = {
  symbol: TokenSymbol | string;
  size?: "sm" | "md";
  className?: string;
};

export function TokenMark({ symbol, size = "sm", className }: TokenMarkProps) {
  return (
    <TokenIcon
      src={TOKEN_ICONS[symbol] ?? null}
      symbol={symbol}
      size={size}
      className={className}
    />
  );
}
