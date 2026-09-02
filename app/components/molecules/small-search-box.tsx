"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

const FILTERS = ["Hot bids", "Collection", "Creator"] as const;

type SmallSearchBoxProps = {
  placeholder?: string;
  filters?: readonly string[];
  onSubmit?: (query: string) => void | Promise<void>;
  onFilter?: (filter: string) => void;
};

export function SmallSearchBox({
  placeholder = "Search",
  filters = FILTERS,
  onSubmit,
  onFilter,
}: SmallSearchBoxProps) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Collection");
  const searchIcon = value ? "/icons/search-20-active.svg" : "/icons/search-20.svg";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit?.(value);
  }

  return (
    <form
      className={cn(
        "flex w-64 flex-col overflow-clip rounded-lg border-2 border-neutrals-6 bg-neutrals-8",
        !open && !value && "hover:border-neutrals-7 hover:bg-neutrals-7",
        open && "gap-4 border-neutrals-7 p-2 shadow-depth3",
        value && "border-primary-1",
      )}
      role="search"
      onSubmit={handleSubmit}
    >
      <div
        className={cn(
          "flex w-full items-center justify-between gap-2 py-2.5 pl-4 pr-3",
          open && "px-2 py-0 pl-2",
        )}
      >
        <input
          className="min-w-0 flex-1 border-none bg-transparent font-body text-caption-2 text-neutrals-2 outline-none placeholder:text-neutrals-4 [&::-webkit-search-cancel-button]:appearance-none"
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />
        <Icon src={searchIcon} size={20} />
      </div>
      {open && !value ? (
        <div className="flex w-full flex-col">
          <div className="flex items-center gap-1 px-2 py-1.5 font-body text-caption-2 text-neutrals-4">
            <span>Sort and filter all</span>
            <Icon src="/icons/filter-line.svg" size={20} />
          </div>
          {filters.map((filter) => (
            <button
              key={filter}
              className={cn(
                "flex w-full items-center rounded-[32px] border-none bg-neutrals-8 py-2 pl-4 pr-2 text-left font-body text-caption-2 font-bold text-neutrals-4",
                filter === activeFilter && "bg-neutrals-7 text-neutrals-2",
              )}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setActiveFilter(filter);
                onFilter?.(filter);
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}
