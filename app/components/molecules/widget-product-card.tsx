"use client";

import { useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { WishlistButton } from "@/components/atoms/wishlist-button";
import { Separator } from "@/components/ui/separator";

type WidgetProductCardProps = {
  title?: string;
  price?: string;
  badge?: "new" | "featured";
  wished?: boolean;
  onAdd?: () => void;
  onToggleWishlist?: (pressed: boolean) => void;
};

export function WidgetProductCard({
  title = "High-class men's jackets from Japan",
  price = "$19.00",
  badge = "new",
  wished = false,
  onAdd,
  onToggleWishlist,
}: WidgetProductCardProps) {
  const [pressed, setPressed] = useState(wished);

  return (
    <article className="group flex w-[352px] flex-col gap-6">
      <div className="flex w-full items-stretch">
        <div className="relative min-h-[140px] w-[140px] shrink-0 overflow-clip rounded-card bg-secondary-2">
          <span className="absolute right-2 top-2 opacity-0 group-hover:opacity-100">
            <WishlistButton
              pressed={pressed}
              onToggle={(next) => {
                setPressed(next);
                onToggleWishlist?.(next);
              }}
            />
          </span>
          <button
            className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[256px] border-none bg-primary-1 p-0 opacity-0 shadow-depth1 group-hover:opacity-100"
            type="button"
            aria-label="Add product"
            onClick={onAdd}
          >
            <Icon src="/icons/plus-square-filled.svg" size={16} />
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-6">
          <p className="m-0 font-body text-body-2 font-bold text-neutrals-2">{title}</p>
          <div className="flex items-center gap-1">
            <Badge tone={badge}>{badge}</Badge>
            <Badge tone="price">{price}</Badge>
          </div>
        </div>
      </div>
      <Separator />
    </article>
  );
}
