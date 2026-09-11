import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded px-2 pb-1.5 pt-2 font-body text-xs font-bold uppercase leading-3",
  {
    variants: {
      variant: {
        solid: "",
        ghost: "bg-transparent",
      },
      tone: {
        new: "",
        featured: "",
        default: "",
        popular: "",
        comingSoon: "",
        price: "border-2 border-primary-4 text-primary-4",
        priceMuted: "border-2 border-neutrals-5 text-neutrals-5 line-through",
      },
    },
    compoundVariants: [
      { variant: "solid", tone: "new", class: "bg-primary-3 text-neutrals-8" },
      { variant: "ghost", tone: "new", class: "border-2 border-primary-3 text-primary-3" },
      { variant: "solid", tone: "featured", class: "bg-primary-1 text-neutrals-8" },
      { variant: "ghost", tone: "featured", class: "border-2 border-primary-1 text-primary-1" },
      { variant: "solid", tone: "default", class: "bg-neutrals-2 text-neutrals-8" },
      { variant: "ghost", tone: "default", class: "border-2 border-neutrals-2 text-neutrals-2" },
      { variant: "solid", tone: "popular", class: "bg-primary-4 text-neutrals-8" },
      { variant: "ghost", tone: "popular", class: "border-2 border-primary-4 text-primary-4" },
      { variant: "solid", tone: "comingSoon", class: "bg-primary-2 text-neutrals-8" },
      { variant: "ghost", tone: "comingSoon", class: "border-2 border-primary-2 text-primary-2" },
    ],
    defaultVariants: {
      variant: "solid",
      tone: "new",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
