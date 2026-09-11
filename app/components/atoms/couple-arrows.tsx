import Link from "next/link";
import { Icon } from "@/components/atoms/icon";

export type CoupleArrowsVariant = "light" | "dark" | "neutral";

type CoupleArrowsProps = {
  variant?: CoupleArrowsVariant;
  prevHref?: string;
  nextHref?: string;
  prevLabel?: string;
  nextLabel?: string;
};

export function CoupleArrows({
  variant = "light",
  prevHref = "#",
  nextHref = "#",
  prevLabel = "Previous",
  nextLabel = "Next",
}: CoupleArrowsProps) {
  const prevIcon =
    variant === "neutral"
      ? "/icons/arrow-left-2-line-on-dark.svg"
      : "/icons/arrow-left-2-line.svg";
  const nextIcon =
    variant === "light"
      ? "/icons/arrow-right-2-line-light.svg"
      : "/icons/arrow-right-2-line-on-dark.svg";

  return (
    <div className="inline-flex items-center gap-2">
      <Link href={prevHref} aria-label={prevLabel} className="inline-flex">
        <Icon src={prevIcon} size={24} />
      </Link>
      <Link href={nextHref} aria-label={nextLabel} className="inline-flex">
        <Icon src={nextIcon} size={24} />
      </Link>
    </div>
  );
}
