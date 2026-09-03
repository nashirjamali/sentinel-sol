import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  caption?: string;
  options?: SelectOption[];
  name?: string;
  defaultValue?: string;
  theme?: "light" | "dark";
  className?: string;
  "aria-label"?: string;
};

const DEFAULT_OPTIONS: SelectOption[] = [{ value: "colors", label: "Colors" }];

export function SelectField({
  caption,
  options = DEFAULT_OPTIONS,
  name,
  defaultValue,
  theme = "light",
  className,
  "aria-label": ariaLabel,
}: SelectFieldProps) {
  return (
    <label className={cn("flex w-64 flex-col gap-3", className)}>
      {caption ? (
        <span className="font-body text-hairline-2 font-bold uppercase text-neutrals-5">
          {caption}
        </span>
      ) : null}
      <span
        className={cn(
          "relative flex w-full items-center overflow-clip rounded-xl",
          theme === "light" ? "border-2 border-neutrals-6" : "border-2 border-neutrals-3",
        )}
      >
        <select
          className={cn(
            "w-full cursor-pointer appearance-none border-none bg-transparent py-2 pl-4 pr-12 font-body text-caption font-bold outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-1",
            theme === "light" ? "text-neutrals-2" : "text-neutrals-8",
          )}
          name={name}
          defaultValue={defaultValue}
          aria-label={ariaLabel ?? caption}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          className={cn(
            "pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-[100px] p-1",
            theme === "light" ? "border-2 border-neutrals-6" : "border-2 border-neutrals-3",
          )}
          aria-hidden="true"
        >
          <Icon src="/icons/arrow-down-simple-line.svg" size={24} />
        </span>
      </span>
    </label>
  );
}
