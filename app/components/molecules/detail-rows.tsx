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
};

export function DetailRows({ rows, className }: DetailRowsProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 rounded-[10px] bg-neutrals-2 px-8 py-4 text-caption-2",
        className,
      )}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex w-full items-center justify-between whitespace-nowrap"
        >
          <span className="font-body font-normal text-neutrals-8">{row.label}</span>
          <span
            className={cn(
              "font-body font-semibold text-neutrals-8",
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
