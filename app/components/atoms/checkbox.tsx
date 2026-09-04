"use client";

import { cn } from "@/lib/utils";

type CheckboxProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label: string;
  className?: string;
  id?: string;
};

export function Checkbox({
  checked = false,
  onCheckedChange,
  label,
  className,
  id,
}: CheckboxProps) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 border-none bg-transparent p-0 text-left",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded border-2 transition-colors",
          checked
            ? "border-primary-4 bg-primary-4"
            : "border-neutrals-4 bg-transparent",
        )}
      >
        {checked ? (
          <img
            src="/icons/check-line-white.svg"
            alt=""
            width={16}
            height={16}
            className="size-4"
          />
        ) : null}
      </span>
      <span className="font-body text-caption text-neutrals-8">{label}</span>
    </button>
  );
}
