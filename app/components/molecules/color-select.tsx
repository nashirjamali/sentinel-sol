"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/atoms/icon";
import {
  COLOR_OPTIONS,
  ColorMenu,
  type ColorOption,
} from "@/components/molecules/color-menu";
import { cn } from "@/lib/utils";

type ColorSelectProps = {
  caption?: string;
  options?: ColorOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  theme?: "light" | "dark";
  disabled?: boolean;
  className?: string;
  onChange?: (value: string | undefined) => void;
};

export function ColorSelect({
  caption,
  options = COLOR_OPTIONS,
  name,
  value,
  defaultValue,
  placeholder = "Colors",
  theme = "light",
  disabled = false,
  className,
  onChange,
}: ColorSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  const selectedValue = value ?? internal;
  const selected = options.find((option) => option.value === selectedValue);
  const chevron = disabled
    ? theme === "dark"
      ? "/icons/arrow-down-simple-muted-dark.svg"
      : "/icons/arrow-down-simple-muted.svg"
    : "/icons/arrow-down-simple-line.svg";

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [open]);

  function commit(next: string | undefined) {
    if (value === undefined) {
      setInternal(next);
    }
    onChange?.(next);
  }

  return (
    <div ref={rootRef} className={cn("flex w-64 flex-col gap-3", className)}>
      {caption ? (
        <span className="font-body text-hairline-2 font-bold uppercase text-neutrals-5">
          {caption}
        </span>
      ) : null}
      {name ? <input type="hidden" name={name} value={selectedValue ?? ""} /> : null}
      <div
        className={cn(
          "flex w-full items-center rounded-xl py-2 pl-4 pr-2",
          theme === "light" ? "border-2 border-neutrals-6" : "border-2 border-neutrals-3",
          (open || selected) && "border-neutrals-5",
          disabled && theme === "light" && "border-neutrals-7 bg-neutrals-7",
          disabled && theme === "dark" && "border-neutrals-3 bg-neutrals-2",
        )}
        data-disabled={disabled || undefined}
      >
        <button
          className="flex min-w-0 flex-1 items-center border-none bg-transparent p-0 text-left font-body text-caption font-bold disabled:cursor-default"
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-label={caption ?? placeholder}
          onClick={() => setOpen((next) => !next)}
        >
          {selected ? (
            <span className="flex items-center gap-1">
              <Icon src={selected.swatch} size={24} />
              <span
                className={cn(
                  "whitespace-nowrap font-body text-caption font-bold",
                  theme === "light" ? "text-neutrals-2" : "text-neutrals-8",
                )}
              >
                {selected.label}
              </span>
            </span>
          ) : (
            <span
              className={cn(
                theme === "light" ? "text-neutrals-2" : "text-neutrals-8",
                disabled && theme === "light" && "text-neutrals-5",
                disabled && theme === "dark" && "text-neutrals-3",
              )}
            >
              {placeholder}
            </span>
          )}
        </button>
        {selected && !disabled ? (
          <button
            className="mr-3 flex items-center justify-center border-none bg-transparent p-0"
            type="button"
            aria-label="Clear selection"
            onClick={() => {
              commit(undefined);
              setOpen(false);
            }}
          >
            <Icon src="/icons/close-16.svg" size={16} />
          </button>
        ) : null}
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-[100px] p-1",
            theme === "light" ? "border-2 border-neutrals-6" : "border-2 border-neutrals-3",
            (open || selected) && "border-neutrals-5",
            disabled && theme === "light" && "border-neutrals-7",
            disabled && theme === "dark" && "border-neutrals-3",
          )}
          aria-hidden="true"
        >
          <Icon src={chevron} size={24} />
        </span>
      </div>
      {open && !disabled ? (
        <ColorMenu
          id={listId}
          className="w-full"
          options={options}
          value={selectedValue ?? "green"}
          theme={theme}
          onSelect={(next) => {
            commit(next);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
