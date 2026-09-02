"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type SearchFieldProps = {
  placeholder?: string;
  errorMessage?: string;
  invalid?: boolean;
  onSubmit?: (query: string) => void | Promise<void>;
};

export function SearchField({
  placeholder = "Search everything",
  errorMessage = "Display error message here.",
  invalid = false,
  onSubmit,
}: SearchFieldProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const showError = invalid;
  const searchIcon = showError
    ? "/icons/search-line-error.svg"
    : focused || value
      ? "/icons/search-line-active.svg"
      : "/icons/search-line.svg";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit?.(value);
  }

  return (
    <form className="flex w-full max-w-[409px] flex-col gap-1" onSubmit={handleSubmit} role="search">
      <div
        className={cn(
          "relative flex h-16 items-center rounded-pill border-2 border-neutrals-6 focus-within:border-primary-1",
          value && "border-primary-1",
          showError && "border-primary-3",
        )}
      >
        <span className="absolute left-[18px] top-1/2 -translate-y-1/2">
          <Icon src={searchIcon} size={24} />
        </span>
        <input
          className="h-full w-full border-none bg-transparent py-0 pl-[54px] pr-14 font-body text-caption text-neutrals-2 outline-none placeholder:text-neutrals-4 dark:text-neutrals-8 [&::-webkit-search-cancel-button]:appearance-none"
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={showError || undefined}
        />
        {showError ? (
          <button
            className="absolute right-[18px] top-1/2 flex -translate-y-1/2 border-none bg-transparent p-0"
            type="button"
            aria-label="Clear search"
            onClick={() => setValue("")}
          >
            <Icon src="/icons/close-circle-filled.svg" size={24} />
          </button>
        ) : value ? (
          <button
            className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-[100px] border-none bg-primary-1 p-2"
            type="submit"
            aria-label="Search"
          >
            <span className="rotate-180">
              <Icon src="/icons/arrow-left-16.svg" size={16} />
            </span>
          </button>
        ) : null}
      </div>
      {showError ? (
        <p className="m-0 px-4 py-2 font-body text-caption text-primary-3">{errorMessage}</p>
      ) : null}
    </form>
  );
}
