import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

export type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  options: DropdownOption[];
  name?: string;
  defaultValue?: string;
  theme?: "light" | "dark";
  "aria-label"?: string;
};

export function Dropdown({
  options,
  name,
  defaultValue,
  theme = "light",
  "aria-label": ariaLabel,
}: DropdownProps) {
  const chevron =
    theme === "dark"
      ? "/icons/arrow-down-dropdown-dark.svg"
      : "/icons/arrow-down-dropdown-light.svg";

  return (
    <div
      className={cn(
        "relative flex w-full max-w-[191px] items-center overflow-clip rounded-xl",
        theme === "light"
          ? "border border-neutrals-6 bg-neutrals-8"
          : "border border-neutrals-3 bg-neutrals-2",
      )}
    >
      <select
        className={cn(
          "w-full cursor-pointer appearance-none border-none bg-transparent py-3 pl-3 pr-10 font-body text-caption font-bold outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-1",
          theme === "light" ? "text-neutrals-2" : "text-neutrals-8",
        )}
        name={name}
        defaultValue={defaultValue}
        aria-label={ariaLabel}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <Icon src={chevron} size={24} />
      </span>
    </div>
  );
}
