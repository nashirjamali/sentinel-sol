import { cn } from "@/lib/utils";

type RadioButtonProps = {
  checked?: boolean;
  className?: string;
};

export function RadioButton({ checked = false, className }: RadioButtonProps) {
  return (
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center overflow-clip rounded-full border-2 border-neutrals-6 bg-neutrals-8 p-1.5 peer-checked:[&_.tick]:block",
        className,
      )}
      data-checked={checked || undefined}
      aria-hidden="true"
    >
      <span className={cn("tick size-3 rounded-full bg-primary-1", checked ? "block" : "hidden")} />
    </span>
  );
}
