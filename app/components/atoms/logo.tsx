import { cn } from "@/lib/utils";

type LogoProps = {
  wordmark?: boolean;
  size?: 40 | 64;
  className?: string;
};

export function Logo({ wordmark = false, size = 64, className }: LogoProps) {
  const isCompact = size === 40;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn("relative shrink-0 overflow-clip", isCompact ? "size-10" : "size-16")}
      >
        <img
          src="/brand/logo-mark.svg"
          alt=""
          width={isCompact ? 20 : 32}
          height={isCompact ? 27 : 44}
          className={
            isCompact
              ? "absolute left-2.5 top-[6.4px] h-[27.285px] w-5"
              : "absolute left-4 top-[10.24px] h-[43.655px] w-8"
          }
        />
      </span>
      {wordmark ? (
        <span className="font-body text-body-1 font-semibold tracking-[-0.02em] text-neutrals-7">
          sentinel
        </span>
      ) : null}
    </span>
  );
}
