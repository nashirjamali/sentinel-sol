import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DetailRow = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

type DetailRowsProps = {
  rows: DetailRow[];
  className?: string;
  variant?: "card" | "flush";
};

export function DetailRows({ rows, className, variant = "card" }: DetailRowsProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2",
        variant === "card" && "rounded-[10px] bg-neutrals-2 px-8 py-4 text-caption-2",
        variant === "flush" && "text-body-2",
        className,
      )}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex h-6 w-full items-center justify-between whitespace-nowrap"
        >
          <span
            className={cn(
              "font-body font-normal",
              variant === "flush" ? "text-neutrals-5" : "text-neutrals-8",
            )}
          >
            {row.label}
          </span>
          <span
            className={cn(
              "font-body tabular-nums text-neutrals-8",
              variant === "card" ? "font-semibold" : "font-medium",
              row.valueClassName,
            )}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
