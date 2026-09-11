import type { ReactNode } from "react";
import { RadioButton } from "@/components/atoms/radio-button";
import { cn } from "@/lib/utils";

type RadioFieldProps = {
  name: string;
  value: string;
  children?: ReactNode;
  align?: "left" | "right" | "between";
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: string) => void;
};

export function RadioField({
  name,
  value,
  children = "Value",
  align = "left",
  checked,
  defaultChecked,
  onChange,
}: RadioFieldProps) {
  return (
    <label
      className={cn(
        "relative inline-flex w-[169px] cursor-pointer items-center gap-3 rounded focus-within:outline focus-within:outline-2 focus-within:outline-offset-[3px] focus-within:outline-primary-1",
        align === "right" && "flex-row-reverse justify-end",
        align === "between" && "flex-row-reverse justify-between gap-0",
      )}
    >
      <input
        className="peer sr-only"
        type="radio"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={() => onChange?.(value)}
      />
      <RadioButton checked={checked} />
      <span
        className={cn(
          "whitespace-nowrap font-body text-body-2 text-neutrals-1",
          align === "right" && "text-right",
        )}
      >
        {children}
      </span>
    </label>
  );
}
