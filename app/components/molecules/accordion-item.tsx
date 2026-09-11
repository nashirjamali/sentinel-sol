"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AccordionItemProps = {
  title: string;
  children?: ReactNode;
  number?: string;
  open?: boolean;
  defaultOpen?: boolean;
  learnMoreHref?: string;
  onToggle?: (open: boolean) => void;
};

export function AccordionItem({
  title,
  children,
  number,
  open,
  defaultOpen = false,
  learnMoreHref,
  onToggle,
}: AccordionItemProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const expanded = open ?? internal;
  const chevron = expanded
    ? "/icons/arrow-up-simple-line.svg"
    : "/icons/arrow-down-simple-line.svg";

  function toggle() {
    const next = !expanded;
    if (open === undefined) {
      setInternal(next);
    }
    onToggle?.(next);
  }

  return (
    <div className={cn("flex w-[448px] flex-col", number ? "gap-6" : "gap-8")}>
      {number ? null : <Separator />}
      <button
        className="flex w-full items-center justify-between border-none bg-transparent p-0 text-left"
        type="button"
        aria-expanded={expanded}
        onClick={toggle}
      >
        <span className="flex min-w-0 flex-1 items-start gap-8">
          {number ? (
            <span
              className={cn(
                "shrink-0 font-body text-body-2 font-bold text-neutrals-4",
                expanded && "text-primary-1",
              )}
            >
              {number}
            </span>
          ) : null}
          <span className="min-w-0 flex-1 font-body text-body-2 font-bold text-neutrals-2">
            {title}
          </span>
        </span>
        <span className="ml-3">
          <Icon src={chevron} size={24} />
        </span>
      </button>
      {expanded && children ? (
        <div className={cn("flex flex-col items-start gap-6", number && "pl-12")}>
          <div
            className={cn(
              "font-body text-neutrals-4",
              number ? "text-caption" : "text-body-2",
            )}
          >
            {children}
          </div>
          {learnMoreHref ? (
            <Button href={learnMoreHref} variant="light" size="small">
              Learn more
            </Button>
          ) : null}
        </div>
      ) : null}
      {number ? <Separator /> : null}
    </div>
  );
}
