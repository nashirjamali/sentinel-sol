"use client";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type MessageBarProps = {
  variant?: "cart" | "wishlist";
  theme?: "light" | "dark";
  productTitle?: string;
  quantity?: number;
  href?: string;
  onClose?: () => void;
};

export function MessageBar({
  variant = "wishlist",
  theme = "light",
  productTitle = "Product Title",
  quantity = 2,
  href = "#",
  onClose,
}: MessageBarProps) {
  const isCart = variant === "cart";
  const ctaLabel = isCart ? "Go to Cart" : "Go to wishlist";
  const ctaIcon = isCart
    ? "/icons/shopping-cart-filled-16.svg"
    : "/icons/heart-filled-16.svg";

  return (
    <div className="flex items-center justify-center gap-4">
      <div
        className={cn(
          "flex items-center gap-8 rounded-[56px] p-2 shadow-depth2",
          theme === "light" ? "bg-neutrals-8" : "bg-neutrals-2",
        )}
      >
        <div className="flex items-center gap-2">
          <Icon src="/icons/check-filled.svg" size={32} />
          <p
            className={cn(
              "m-0 whitespace-nowrap font-body text-caption-2",
              theme === "light" ? "text-neutrals-2" : "text-neutrals-8",
            )}
          >
            {isCart ? (
              <>
                <span className="font-body text-caption-2 text-neutrals-4">{quantity} x</span>{" "}
                <strong className="font-body text-caption-2 font-bold">{productTitle}</strong>{" "}
                <span className="font-body text-caption-2 text-neutrals-4">has been added to</span>{" "}
                <strong className="font-body text-caption-2 font-bold">Your Cart</strong>
              </>
            ) : (
              <>
                <strong className="font-body text-caption-2 font-bold">{productTitle}</strong>{" "}
                <span className="font-body text-caption-2 text-neutrals-4">has been added to</span>{" "}
                <strong className="font-body text-caption-2 font-bold">Your Wishlist</strong>
              </>
            )}
          </p>
        </div>
        <Button href={href} variant="neutral" size="small">
          <Icon src={ctaIcon} size={16} />
          {ctaLabel}
        </Button>
      </div>
      <button
        className="flex border-none bg-transparent p-0"
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
      >
        <Icon src="/icons/close-circle-line.svg" size={24} />
      </button>
    </div>
  );
}
