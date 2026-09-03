import Link from "next/link";
import type { ReactNode } from "react";

type WidgetTitleProps = {
  href: string;
  children?: ReactNode;
};

export function WidgetTitle({ href, children = "Featured Products" }: WidgetTitleProps) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3 no-underline">
      <span className="font-body text-body-2 font-bold text-neutrals-4 group-hover:text-neutrals-2">
        {children}
      </span>
      <span className="relative size-6 shrink-0 overflow-clip">
        <img
          src="/icons/arrow-right-square-line.svg"
          alt=""
          width={24}
          height={24}
          className="absolute inset-0 size-6 group-hover:opacity-0"
        />
        <img
          src="/icons/arrow-right-square-filled.svg"
          alt=""
          width={24}
          height={24}
          className="absolute inset-0 size-6 opacity-0 group-hover:opacity-100"
        />
      </span>
    </Link>
  );
}
