"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type SearchBoxProps = {
  caption?: string;
  placeholder?: string;
  theme?: "light" | "dark";
  onSubmit?: (query: string) => void | Promise<void>;
};

export function SearchBox({
  caption,
  placeholder = "Search everything",
  theme = "light",
  onSubmit,
}: SearchBoxProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit?.(value);
  }

  return (
    <form className="flex w-[312px] flex-col gap-[17px]" role="search" onSubmit={handleSubmit}>
      {caption ? (
        <span className="font-body text-hairline-2 font-bold uppercase text-neutrals-5">
          {caption}
        </span>
      ) : null}
      <div
        className={cn(
          "flex w-full items-center justify-between overflow-clip rounded-xl px-2 py-2 pl-4",
          theme === "light" ? "border-2 border-neutrals-6" : "border-2 border-neutrals-3",
        )}
      >
        <input
          className={cn(
            "h-5 min-w-0 flex-1 border-none bg-transparent font-body text-caption outline-none placeholder:text-neutrals-4 [&::-webkit-search-cancel-button]:appearance-none",
            theme === "light" ? "text-neutrals-2" : "text-neutrals-8",
          )}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
        />
        <button
          className="flex items-center justify-center rounded-[100px] border-none bg-primary-1 p-2"
          type="submit"
          aria-label="Search"
        >
          <Icon src="/icons/search-16-white.svg" size={16} />
        </button>
      </div>
    </form>
  );
}
