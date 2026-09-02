"use client";

import { useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { WishlistButton } from "@/components/atoms/wishlist-button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type CartStatus = "idle" | "adding" | "added";

type CatalogCardProps = {
  title?: string;
  category?: string;
  price?: string;
  showBadge?: boolean;
  theme?: "light" | "dark";
  wished?: boolean;
  onAddToCart?: () => void | Promise<void>;
  onToggleWishlist?: (pressed: boolean) => void;
};

export function CatalogCard({
  title = "Product title",
  category = "Category",
  price = "$399.00",
  showBadge = true,
  theme = "light",
  wished = false,
  onAddToCart,
  onToggleWishlist,
}: CatalogCardProps) {
  const [cart, setCart] = useState<CartStatus>("idle");
  const [pressed, setPressed] = useState(wished);
  const swatches =
    theme === "dark" ? "/icons/catalog-colors-dark.svg" : "/icons/catalog-colors.svg";

  async function handleAdd() {
    if (cart !== "idle") {
      return;
    }
    setCart("adding");
    await onAddToCart?.();
    setCart("added");
  }

  return (
    <article className="group flex w-64 flex-col items-center">
      <div
        className={cn(
          "relative flex w-full flex-col overflow-clip rounded-card",
          theme === "light" ? "bg-secondary-4" : "bg-neutrals-6",
        )}
      >
        <div className="flex items-center justify-between p-2">
          {showBadge ? (
            <span
              className={cn(
                "inline-flex items-center justify-center rounded px-2 pb-1.5 pt-2 font-body text-hairline-2 font-bold uppercase",
                theme === "light"
                  ? "bg-neutrals-2 text-neutrals-8"
                  : "bg-neutrals-8 text-neutrals-2",
              )}
            >
              new
            </span>
          ) : (
            <span />
          )}
          <span className="opacity-0 group-hover:opacity-100">
            <WishlistButton
              pressed={pressed}
              dark={theme === "dark"}
              onToggle={(next) => {
                setPressed(next);
                onToggleWishlist?.(next);
              }}
            />
          </span>
        </div>
        <div className="flex h-[255px] items-end justify-center px-4 pb-4">
          <button
            className={cn(
              "inline-flex min-w-[137px] items-center justify-center gap-3 rounded-pill border-none px-4 py-3 font-display text-button-2 font-bold text-neutrals-8 opacity-0 group-hover:opacity-100 disabled:cursor-default",
              cart === "added" ? "bg-primary-4" : "bg-primary-1",
            )}
            type="button"
            onClick={handleAdd}
            disabled={cart !== "idle"}
          >
            {cart === "adding" ? (
              <span className="animate-spin">
                <Icon src="/icons/loading-line.svg" size={16} />
              </span>
            ) : cart === "added" ? (
              <>
                Added
                <Icon src="/icons/check-filled-16.svg" size={16} />
              </>
            ) : (
              <>
                Add to cart
                <Icon src="/icons/shopping-basket-16.svg" size={16} />
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3 py-5">
        <div className="flex w-full items-start justify-between gap-3">
          <p
            className={cn(
              "m-0 w-[185px] font-body text-body-2 font-bold",
              theme === "light" ? "text-neutrals-2" : "text-neutrals-8",
            )}
          >
            {title}
          </p>
          <Badge tone="price">{price}</Badge>
        </div>
        <Separator className={theme === "dark" ? "bg-neutrals-3" : undefined} />
        <div className="flex items-center gap-3">
          <p className="m-0 font-display text-button-2 font-bold text-neutrals-4">{category}</p>
          <span className="h-4 w-11 overflow-clip">
            <img src={swatches} alt="" width={44} height={16} className="block h-4 w-11" />
          </span>
        </div>
      </div>
    </article>
  );
}
