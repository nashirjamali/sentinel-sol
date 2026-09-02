import Link from "next/link";
import type { ReactNode } from "react";
import { Button as UiButton, type ButtonProps as UiButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ButtonVariant = NonNullable<UiButtonProps["variant"]>;
export type ButtonSize = NonNullable<UiButtonProps["size"]>;
export type ButtonIcon = "left" | "right";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ButtonIcon;
  disabled?: boolean;
  className?: string;
};

function StarIcon({ variant }: { variant: ButtonVariant }) {
  return (
    <span className="relative size-4 shrink-0 overflow-clip">
      <img
        src="/icons/star-filled-on-dark.svg"
        alt=""
        width={16}
        height={16}
        className={cn(
          "absolute inset-0 size-4",
          variant === "light" ? "opacity-0 group-hover:opacity-100" : "opacity-100",
          variant === "dark" && "group-hover:opacity-0",
        )}
      />
      <img
        src="/icons/star-filled-on-light.svg"
        alt=""
        width={16}
        height={16}
        className={cn(
          "absolute inset-0 size-4",
          variant === "light" ? "opacity-100 group-hover:opacity-0" : "opacity-0",
          variant === "dark" && "group-hover:opacity-100",
        )}
      />
    </span>
  );
}

export function Button({
  href,
  children,
  variant = "neutral",
  size = "small",
  icon,
  disabled = false,
  className,
}: ButtonProps) {
  return (
    <UiButton
      asChild
      variant={variant}
      size={size}
      className={cn("group", className)}
      aria-disabled={disabled || undefined}
    >
      <Link href={disabled ? "#" : href} tabIndex={disabled ? -1 : undefined}>
        {icon === "left" ? <StarIcon variant={variant} /> : null}
        {children}
        {icon === "right" ? <StarIcon variant={variant} /> : null}
      </Link>
    </UiButton>
  );
}
