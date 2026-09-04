import { cn } from "@/lib/utils";

type StatusPillVariant = "success" | "muted";

type StatusPillProps = {
  children: string;
  variant?: StatusPillVariant;
  className?: string;
};

export function StatusPill({
  children,
  variant = "success",
  className,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-start overflow-clip rounded-pill px-2.5 py-1 font-body text-sm font-medium leading-6",
        variant === "success" && "bg-[rgba(69,178,107,0.14)] text-primary-4",
        variant === "muted" && "bg-[rgba(119,126,144,0.14)] text-neutrals-4",
        className,
      )}
    >
      {children}
    </span>
  );
}
