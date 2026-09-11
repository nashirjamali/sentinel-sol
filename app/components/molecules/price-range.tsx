"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type PriceRangeProps = {
  min?: number;
  max?: number;
  defaultValue?: number;
  value?: number;
  theme?: "light" | "dark";
  onChange?: (value: number) => void;
};

export function PriceRange({
  min = 10,
  max = 399,
  defaultValue = 200,
  value,
  theme = "light",
  onChange,
}: PriceRangeProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const progress = ((current - min) / (max - min)) * 100;
  const caret =
    theme === "dark" ? "/icons/tooltip-caret-light.svg" : "/icons/tooltip-caret.svg";

  return (
    <div className="relative w-64">
      <p className="mb-4 mt-0 font-body text-hairline-2 font-bold uppercase text-neutrals-5">
        Price range
      </p>
      <div className="relative h-6">
        <span
          className="pointer-events-none absolute top-[-28px] flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${progress}%` }}
        >
          <span
            className={cn(
              "whitespace-nowrap rounded-lg px-2 py-1 font-body text-caption-2 font-bold",
              theme === "light"
                ? "bg-neutrals-1 text-neutrals-8"
                : "bg-neutrals-8 text-neutrals-2",
            )}
          >
            ${current}
          </span>
          <span className="h-1.5 w-3 overflow-clip">
            <img src={caret} alt="" width={12} height={6} className="block size-full" />
          </span>
        </span>
        <Slider
          className={cn("h-6", theme === "dark" && "[&>[data-orientation=horizontal]]:bg-neutrals-3")}
          min={min}
          max={max}
          value={[current]}
          aria-label="Price range"
          onValueChange={([next]) => {
            if (value === undefined) {
              setInternal(next);
            }
            onChange?.(next);
          }}
        />
      </div>
      <div
        className={cn(
          "mt-2 flex items-center justify-between font-body text-caption font-bold",
          theme === "light" ? "text-neutrals-2" : "text-neutrals-8",
        )}
      >
        <span>${min}</span>
        <span>${max}</span>
      </div>
    </div>
  );
}
