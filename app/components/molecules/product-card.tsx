"use client";

import { useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { WishlistButton } from "@/components/atoms/wishlist-button";
import { cn } from "@/lib/utils";

type CartStatus = "idle" | "adding" | "added";

type ProductCardProps = {
  title?: string;
  category?: string;
  price?: string;
  compareAtPrice?: string;
  badge?: "new" | "featured";
  theme?: "light" | "dark";
  wished?: boolean;
  onAddToCart?: () => void | Promise<void>;
  onToggleWishlist?: (pressed: boolean) => void;
};

export function ProductCard({
  title = "High-class men's jackets from Japan",
  category = "Jackets",
  price = "$19.00",
  compareAtPrice,
  badge = "new",
  theme = "light",
  wished = false,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const [cart, setCart] = useState<CartStatus>("idle");
  const [pressed, setPressed] = useState(wished);
  const swatches =
    theme === "dark" ? "/icons/product-colors-dark.svg" : "/icons/product-colors.svg";

  async function handleAdd() {
    if (cart !== "idle") {
      return;
    }
    setCart("adding");
    await onAddToCart?.();
    setCart("added");
  }

  return (
    <article className="group flex h-[370px] w-64 flex-col overflow-clip rounded-card shadow-depth4">
      <div
        className={cn(
          "relative min-h-0 flex-1",
          theme === "light" ? "bg-secondary-2" : "bg-neutrals-3",
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            className={cn(
              "inline-flex min-w-[137px] items-center justify-center gap-3 rounded-pill border-none px-4 py-3 font-display text-button-2 font-bold text-neutrals-8 disabled:cursor-default",
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
        <span className="absolute right-2 top-2 opacity-0 group-hover:opacity-100">
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
      <div
        className={cn(
          "flex flex-col gap-3 p-5",
          theme === "light" ? "bg-neutrals-8" : "bg-neutrals-2",
        )}
      >
        <p
          className={cn(
            "m-0 font-body text-body-2 font-bold",
            theme === "light" ? "text-neutrals-2" : "text-neutrals-8",
          )}
        >
          {title}
        </p>
        <div className="flex items-center gap-1">
          <Badge tone={badge}>{badge}</Badge>
          {compareAtPrice ? <Badge tone="priceMuted">{compareAtPrice}</Badge> : null}
          <Badge tone="price">{price}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <p
            className={cn(
              "m-0 font-body text-caption-2",
              theme === "light" ? "text-neutrals-3" : "text-neutrals-6",
            )}
          >
            {category}
          </p>
          <span className="h-4 w-[72px] overflow-clip">
            <img src={swatches} alt="" width={72} height={16} className="block h-4 w-[72px]" />
          </span>
        </div>
      </div>
    </article>
  );
}
