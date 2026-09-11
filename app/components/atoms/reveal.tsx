"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  /** Stagger, in ms, applied once the element enters the viewport. */
  delay?: number;
  className?: string;
};

/**
 * Fades and lifts its children in the first time they scroll into view.
 *
 * The hidden state is defined in `globals.css` behind `scripting: enabled` and
 * `prefers-reduced-motion: no-preference`, so with JS disabled or reduced motion
 * requested the content renders plainly instead of being stuck invisible. That
 * also means this component only ever *adds* `data-shown` — it never hides
 * anything itself.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    // Already on screen at mount (or no observer support): show straight away
    // rather than waiting for a callback that may never come.
    const isOnScreen = () => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    if (typeof IntersectionObserver === "undefined" || isOnScreen()) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      // Trigger slightly before the element is fully on screen.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );
    observer.observe(el);

    // Safety net: observer callbacks are throttled or suspended in background
    // tabs, and content must never be left invisible. A scroll listener catches
    // anything the observer misses.
    const onScroll = () => {
      if (isOnScreen()) {
        setShown(true);
        observer.disconnect();
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [shown]);

  return (
    <div
      ref={ref}
      data-reveal=""
      data-shown={shown ? "true" : undefined}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      className={cn(className)}
    >
      {children}
    </div>
  );
}
