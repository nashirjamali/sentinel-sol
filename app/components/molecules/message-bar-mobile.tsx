"use client";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type MessageBarMobileProps = {
  theme?: "light" | "dark";
  productTitle?: string;
  shopHref?: string;
  wishlistHref?: string;
  onClose?: () => void;
};

export function MessageBarMobile({
  theme = "light",
  productTitle = "Product Title",
  shopHref = "#",
  wishlistHref = "#",
  onClose,
}: MessageBarMobileProps) {
  return (
    <div
      className={cn(
        "flex w-[351px] flex-col items-center gap-4 rounded-lg p-4 shadow-depth2",
        theme === "light" ? "bg-neutrals-8" : "bg-neutrals-2",
      )}
    >
      <div className="flex w-full items-start gap-3">
        <Icon src="/icons/check-filled.svg" size={32} />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "m-0 font-body text-caption-2",
              theme === "light" ? "text-neutrals-2" : "text-neutrals-8",
            )}
          >
            <strong className="font-body text-caption-2 font-bold">{productTitle}</strong>{" "}
            <span className="font-body text-caption-2 text-neutrals-4">has been added to</span>
          </p>
          <p
            className={cn(
              "m-0 font-body text-caption-2",
              theme === "light" ? "text-neutrals-2" : "text-neutrals-8",
            )}
          >
            <strong className="font-body text-caption-2 font-bold">❤️ Your Wishlist</strong>
          </p>
        </div>
        <button
          className="flex shrink-0 border-none bg-transparent p-0"
          type="button"
          aria-label="Dismiss"
          onClick={onClose}
        >
          <Icon src="/icons/close-line.svg" size={24} />
        </button>
      </div>
      <Separator className={theme === "dark" ? "bg-neutrals-3" : undefined} />
      <div className="flex w-full items-center justify-between">
        <Button href={shopHref} variant={theme === "dark" ? "dark" : "light"} size="small">
          <Icon src="/icons/arrow-left-simple.svg" size={16} />
          Back to shop
        </Button>
        <Button href={wishlistHref} variant="neutral" size="small">
          <Icon src="/icons/heart-filled-16.svg" size={16} />
          Go to wishlist
        </Button>
      </div>
    </div>
  );
}
