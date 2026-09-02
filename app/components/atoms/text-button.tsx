import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/atoms/icon";

type TextButtonProps = {
  href: string;
  children: ReactNode;
};

export function TextButton({ href, children }: TextButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-1 whitespace-nowrap font-body text-xs font-semibold leading-5 text-neutrals-2"
    >
      {children}
      <Icon src="/icons/arrow-down-simple-line.svg" size={24} />
    </Link>
  );
}
