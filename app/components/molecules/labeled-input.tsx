import type { InputHTMLAttributes } from "react";
import { Icon } from "@/components/atoms/icon";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LabeledInputStatus = "default" | "error" | "success";

type LabeledInputProps = {
  label: string;
  status?: LabeledInputStatus;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function LabeledInput({
  label,
  status = "default",
  ...inputProps
}: LabeledInputProps) {
  const trailing =
    status === "success" ? (
      <Icon src="/icons/check-line-success.svg" size={24} />
    ) : status === "error" ? (
      <Icon src="/icons/close-circle-filled.svg" size={24} />
    ) : null;

  return (
    <label className="flex w-full max-w-[352px] flex-col gap-3">
      <Label asChild>
        <span className="font-body text-hairline-2 font-bold uppercase text-neutrals-5">
          {label}
        </span>
      </Label>
      <span
        className={cn(
          "flex w-full items-center gap-2.5 overflow-clip rounded-xl border-2 border-neutrals-6 px-4 py-3 hover:border-neutrals-5 focus-within:border-primary-1",
          status === "success" && "border-primary-4",
          status === "error" && "border-primary-3",
        )}
      >
        <input
          className={cn(
            "min-w-0 flex-1 border-none bg-transparent p-0 font-body text-caption font-bold text-neutrals-2 outline-none placeholder:font-bold placeholder:text-neutrals-4 dark:text-neutrals-8",
            status === "error" && "text-primary-3 placeholder:text-primary-3",
          )}
          {...inputProps}
          aria-invalid={status === "error" || undefined}
        />
        {trailing}
      </span>
    </label>
  );
}
