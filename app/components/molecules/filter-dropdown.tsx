"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FilterOption = {
  value: string;
  label: string;
};

type FilterDropdownProps = {
  label?: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  "aria-label": string;
  className?: string;
};

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
  className,
}: FilterDropdownProps) {
  return (
    <label className={cn("flex w-full flex-col gap-3", className)}>
      {label ? (
        <Label asChild>
          <span className="font-body text-hairline-2 font-bold uppercase text-neutrals-5">
            {label}
          </span>
        </Label>
      ) : null}
      <span className="relative flex w-full items-center overflow-clip rounded-xl border-2 border-neutrals-3 bg-neutrals-2 transition-colors duration-200 hover:border-neutrals-4 focus-within:border-primary-1">
        <select
          aria-label={ariaLabel}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full cursor-pointer appearance-none border-none bg-transparent py-3 pl-4 pr-10 font-body text-sm font-medium leading-6 text-neutrals-8 outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center">
          <img
            src="/icons/arrow-down-simple-line.svg"
            alt=""
            width={24}
            height={24}
            className="size-5"
          />
        </span>
      </span>
    </label>
  );
}
