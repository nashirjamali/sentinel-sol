"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sliderTrackVariants = cva("relative w-full grow overflow-hidden", {
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

const sliderRangeVariants = cva("absolute h-full", {
  variants: {
    variant: {
      default: "bg-primary-1",
      coverage: "bg-primary-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const sliderThumbVariants = cva(
  "block rounded-full transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-1 active:scale-95",
  {
    variants: {
      variant: {
        default: "size-6 border-4 border-neutrals-8 bg-primary-1 shadow-depth1",
        coverage: "h-3 w-3 border-0 bg-primary-4 shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
  VariantProps<typeof sliderTrackVariants>;

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className={sliderTrackVariants({ variant })}>
      <SliderPrimitive.Range className={sliderRangeVariants({ variant })} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={sliderThumbVariants({ variant })} />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
