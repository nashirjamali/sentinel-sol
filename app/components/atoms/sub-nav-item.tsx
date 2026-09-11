import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SubNavItemProps = {
  children: ReactNode;
  theme?: "light" | "dark";
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function SubNavItem({
  children,
  theme = "light",
  active = false,
  disabled = false,
  onClick,
}: SubNavItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-pill px-3 py-1.5 font-display text-sm font-bold leading-4 transition-colors duration-200",
        theme === "light" && "text-neutrals-4 hover:text-neutrals-2 disabled:text-neutrals-5",
        theme === "light" && active && "bg-neutrals-3 text-neutrals-8 hover:text-neutrals-8",
        theme === "dark" && "text-neutrals-4 hover:text-neutrals-8 disabled:text-neutrals-3",
        theme === "dark" && active && "bg-neutrals-6 text-neutrals-2 hover:text-neutrals-2",
        disabled && "cursor-default",
      )}
    >
      {children}
    </button>
  );
}
