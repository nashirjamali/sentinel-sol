"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type TokenIconProps = {
  src: string | null;
  symbol: string;
  size?: "sm" | "md";
  className?: string;
};

export function TokenIcon({ src, symbol, size = "sm", className }: TokenIconProps) {
  const [failed, setFailed] = useState(false);
  const proxied = src ? `/api/token-icon?src=${encodeURIComponent(src)}` : null;
  const box = size === "md" ? "size-9" : "size-6";

  if (!proxied || failed) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-clip bg-neutrals-3 font-body font-semibold leading-none text-neutrals-8",
          size === "md" ? "rounded-xl text-sm" : "rounded-full text-[10px]",
          box,
          className,
        )}
      >
        {symbol.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      src={proxied}
      alt={`${symbol} logo`}
      width={size === "md" ? 36 : 24}
      height={size === "md" ? 36 : 24}
      referrerPolicy="no-referrer"
      className={cn(
        "shrink-0 object-cover",
        size === "md" ? "rounded-xl" : "rounded-full",
        box,
        className,
      )}
      onError={() => setFailed(true)}
    />
  );
}
