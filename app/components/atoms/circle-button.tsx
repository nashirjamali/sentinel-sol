import Link from "next/link";
import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type CircleButtonProps = {
  size?: 80 | 48 | 64;
  tone?: "light" | "dark";
  href?: string;
  "aria-label"?: string;
  onClick?: () => void;
};

function PlayIcons({ size, tone }: { size: 48 | 80; tone: "light" | "dark" }) {
  const px = size === 80 ? 24 : 16;
  const idle =
    size === 48 && tone === "dark"
      ? "/icons/play-filled-16-on-dark.svg"
      : "/icons/play-filled.svg";
  const active =
    size === 80 ? "/icons/play-filled-active.svg" : "/icons/play-filled-16-active.svg";

  return (
    <span className="relative shrink-0 overflow-clip" style={{ width: px, height: px }}>
      <img src={idle} alt="" width={px} height={px} className="absolute inset-0 size-full group-hover:opacity-0" />
      <img src={active} alt="" width={px} height={px} className="absolute inset-0 size-full opacity-0 group-hover:opacity-100" />
    </span>
  );
}

export function CircleButton({
  size = 80,
  tone = "light",
  href,
  "aria-label": ariaLabel,
  onClick,
}: CircleButtonProps) {
  const className = cn(
    "group inline-flex items-center justify-center p-0",
    size === 80 && "size-20 rounded-full shadow-depth1 hover:shadow-depth3",
    size === 48 && "size-12 rounded-full shadow-depth1 hover:shadow-depth2",
    size === 64 && "size-16 rounded-full bg-transparent",
    size !== 64 && tone === "light" && "bg-neutrals-8",
    size !== 64 && tone === "dark" && "bg-neutrals-2",
    size === 64 && tone === "light" && "border-2 border-neutrals-3",
    size === 64 && tone === "dark" && "border-2 border-neutrals-6",
  );

  const inner =
    size === 64 ? (
      <Icon src="/icons/arrow-down-2-line.svg" size={24} />
    ) : (
      <PlayIcons size={size} tone={tone} />
    );

  if (href) {
    return (
      <Link className={className} href={href} aria-label={ariaLabel} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={className} type="button" aria-label={ariaLabel} onClick={onClick}>
      {inner}
    </button>
  );
}
