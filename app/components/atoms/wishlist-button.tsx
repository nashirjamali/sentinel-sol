"use client";

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  pressed?: boolean;
  dark?: boolean;
  onToggle?: (pressed: boolean) => void;
};

export function WishlistButton({
  pressed = false,
  dark = false,
  onToggle,
}: WishlistButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-8 items-center justify-center rounded-full p-1.5 shadow-depth1",
        dark ? "bg-neutrals-2" : "bg-neutrals-8",
      )}
      aria-pressed={pressed}
      aria-label={pressed ? "Remove from wishlist" : "Add to wishlist"}
      onClick={() => onToggle?.(!pressed)}
    >
      <Icon src={pressed ? "/icons/heart-filled.svg" : "/icons/heart-line.svg"} size={20} />
    </button>
  );
}
