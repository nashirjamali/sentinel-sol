"use client";

import { useState } from "react";
import { Icon } from "@/components/atoms/icon";
import { SubNavItem } from "@/components/atoms/sub-nav-item";
import { PriceRange } from "@/components/molecules/price-range";
import { SelectField } from "@/components/molecules/select-field";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_ITEMS = ["All Products", "Jackets", "Overshirts", "Jeans"] as const;

const COLOR_OPTIONS = [{ value: "colors", label: "Colors" }];

type HorizontalFilterProps = {
  navItems?: readonly string[];
  defaultNav?: string;
  defaultOpen?: boolean;
};

export function HorizontalFilter({
  navItems = NAV_ITEMS,
  defaultNav = "All Products",
  defaultOpen = true,
}: HorizontalFilterProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [active, setActive] = useState(defaultNav);

  return (
    <div className="flex w-full max-w-[1120px] flex-col gap-8">
      <div className="relative flex min-h-12 items-center justify-between">
        <SelectField className="w-[180px]" options={COLOR_OPTIONS} aria-label="Colors" />
        <nav className="absolute left-1/2 flex -translate-x-1/2 items-start gap-3" aria-label="Product categories">
          {navItems.map((item) => (
            <SubNavItem
              key={item}
              active={item === active}
              onClick={() => setActive(item)}
            >
              {item}
            </SubNavItem>
          ))}
        </nav>
        <button
          className={cn(
            "inline-flex items-center justify-center gap-3 rounded-pill px-6 py-4 font-display text-button-1 font-bold",
            open
              ? "border-none bg-primary-1 text-neutrals-8"
              : "border-2 border-neutrals-6 bg-transparent text-neutrals-2",
          )}
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((next) => !next)}
        >
          Filter
          <Icon src={open ? "/icons/close-line.svg" : "/icons/filter-16.svg"} size={16} />
        </button>
      </div>
      <Separator />
      {open ? (
        <div className="flex items-start gap-8">
          <SelectField caption="Category" options={COLOR_OPTIONS} aria-label="Category" />
          <SelectField caption="tags" options={COLOR_OPTIONS} aria-label="Tags" />
          <SelectField caption="colors" options={COLOR_OPTIONS} aria-label="Colors" />
          <PriceRange />
        </div>
      ) : null}
    </div>
  );
}
