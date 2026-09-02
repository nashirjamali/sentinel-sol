"use client";

import { useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { WishlistButton } from "@/components/atoms/wishlist-button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ProductCardWideProps = {
  title?: string;
  subtitle?: string;
  category?: string;
  price?: string;
  compareAtPrice?: string;
  href?: string;
  theme?: "light" | "dark";
  wished?: boolean;
  onToggleWishlist?: (pressed: boolean) => void;
};

export function ProductCardWide({
  title = "High-class men's jackets from Japan",
  subtitle = "Limited collection",
  category = "Jackets",
  price = "$19.00",
  compareAtPrice = "$29.00",
  href = "#",
  theme = "light",
  wished = false,
  onToggleWishlist,
}: ProductCardWideProps) {
  const [pressed, setPressed] = useState(wished);
  const swatches = theme === "dark" ? "/icons/wide-colors.svg" : "/icons/wide-colors-alt.svg";

  return (
    <article className="flex h-[284px] w-[544px] items-stretch overflow-clip rounded-card shadow-depth4">
      <div
        className={cn(
          "flex min-w-0 flex-1 pb-0 pl-3 pt-3",
          theme === "light" ? "bg-primary-2" : "bg-neutrals-3",
        )}
      >
        <Badge tone="new">New</Badge>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between bg-neutrals-8 p-8">
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="m-0 w-[208px] font-body text-body-2 font-bold text-neutrals-2">
              {title}
            </p>
            <p className="m-0 w-[208px] font-body text-caption-2 text-neutrals-4">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1">
            {compareAtPrice ? <Badge tone="priceMuted">{compareAtPrice}</Badge> : null}
            <Badge tone="price">{price}</Badge>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <p className="m-0 font-body text-caption-2 text-neutrals-3">{category}</p>
            <span className="h-4 w-11 overflow-clip">
              <img src={swatches} alt="" width={44} height={16} className="block h-4 w-11" />
            </span>
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <Button href={href} variant={theme === "dark" ? "neutral" : "light"} size="small">
            Add to cart
            <Icon
              src={
                theme === "dark"
                  ? "/icons/shopping-basket-white.svg"
                  : "/icons/shopping-basket-dark.svg"
              }
              size={16}
            />
          </Button>
          <WishlistButton
            pressed={pressed}
            onToggle={(next) => {
              setPressed(next);
              onToggleWishlist?.(next);
            }}
          />
        </div>
      </div>
    </article>
  );
}
