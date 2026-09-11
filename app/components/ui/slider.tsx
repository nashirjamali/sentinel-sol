"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sliderTrackVariants = cva("relative w-full", {
  variants: {
    variant: {
      default: "h-4 rounded-lg bg-neutrals-6 dark:bg-neutrals-3",
      coverage: "h-[3px] rounded-none bg-neutrals-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const sliderRangeVariants = cva("absolute inset-y-0 left-0", {
  variants: {
    variant: {
      default: "rounded-lg bg-primary-1",
      coverage: "bg-primary-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const sliderThumbVariants = cva("pointer-events-none absolute top-1/2 rounded-full", {
  variants: {
    variant: {
      default: "size-6 -translate-x-1/2 -translate-y-1/2 border-4 border-neutrals-8 bg-primary-1 shadow-depth1",
      coverage: "size-3 -translate-x-1/2 -translate-y-1/2 bg-primary-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type SliderProps = VariantProps<typeof sliderTrackVariants> & {
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  defaultValue?: number[];
  disabled?: boolean;
  name?: string;
  "aria-label"?: string;
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
};

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      variant,
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      disabled,
      name,
      onValueChange,
      onValueCommit,
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue?.[0] ?? min);
    const current = isControlled ? (value[0] ?? min) : uncontrolled;
    const span = max - min;
    const pct = span === 0 ? 0 : ((current - min) / span) * 100;

    function commit(next: number) {
      if (!isControlled) setUncontrolled(next);
      onValueChange?.([next]);
    }

    return (
      <div
        className={cn(
          "relative flex w-full items-center",
          variant === "coverage" ? "h-3" : "h-6",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div data-orientation="horizontal" className={sliderTrackVariants({ variant })}>
            <div className={sliderRangeVariants({ variant })} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className={sliderThumbVariants({ variant })} style={{ left: `${pct}%` }} />
        <input
          ref={ref}
          type="range"
          name={name}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          value={current}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          onChange={(event) => commit(Number(event.target.value))}
          onMouseUp={(event) => onValueCommit?.([Number(event.currentTarget.value)])}
          onTouchEnd={(event) => onValueCommit?.([Number(event.currentTarget.value)])}
          className={cn(
            "absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none bg-transparent p-0 opacity-[0.01] touch-none disabled:cursor-not-allowed",
            "[&::-webkit-slider-runnable-track]:h-full [&::-webkit-slider-runnable-track]:appearance-none [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:h-full [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-moz-range-track]:h-full [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-full [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent",
          )}
        />
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider };
