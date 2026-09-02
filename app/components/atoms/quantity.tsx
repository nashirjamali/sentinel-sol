"use client";

import { useState } from "react";
import { Icon } from "@/components/atoms/icon";

type QuantityProps = {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
};

export function Quantity({
  value,
  defaultValue = 3,
  min = 1,
  max = 99,
  onChange,
}: QuantityProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  function commit(next: number) {
    const clamped = Math.min(max, Math.max(min, next));
    if (value === undefined) {
      setInternal(clamped);
    }
    onChange?.(clamped);
  }

  return (
    <div className="group inline-flex items-center justify-center gap-1 rounded px-[17px] py-2 hover:bg-neutrals-8 hover:shadow-depth1">
      <span className="font-body text-body-2 font-bold text-neutrals-2">{current}</span>
      <span className="flex flex-col opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          className="flex border-none bg-transparent p-0"
          type="button"
          aria-label="Increase quantity"
          onClick={() => commit(current + 1)}
        >
          <Icon src="/icons/arrow-up-16.svg" size={16} />
        </button>
        <button
          className="flex border-none bg-transparent p-0"
          type="button"
          aria-label="Decrease quantity"
          onClick={() => commit(current - 1)}
        >
          <Icon src="/icons/arrow-down-16.svg" size={16} />
        </button>
      </span>
    </div>
  );
}
