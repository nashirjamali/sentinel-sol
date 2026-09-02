import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-pill border-2 border-transparent font-display font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-primary-1 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  {
    variants: {
      variant: {
        neutral: "bg-primary-1 text-neutrals-8 hover:bg-primary-1/75",
        light:
          "border-neutrals-6 bg-transparent text-neutrals-2 hover:border-neutrals-2 hover:bg-neutrals-2 hover:text-neutrals-8",
        dark: "border-neutrals-4 bg-transparent text-neutrals-8 hover:border-neutrals-8 hover:bg-neutrals-8 hover:text-neutrals-2",
      },
      size: {
        small: "px-4 py-3 text-sm leading-4",
        medium: "px-6 py-4 text-base leading-4",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "small",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
