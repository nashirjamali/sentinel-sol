import { DropdownItem } from "@/components/atoms/dropdown-item";
import { cn } from "@/lib/utils";

export type ColorOption = {
  value: string;
  label: string;
  swatch: string;
  all?: boolean;
};

export const COLOR_OPTIONS: ColorOption[] = [
  { value: "all", label: "All colors", swatch: "/icons/circle-line.svg", all: true },
  { value: "black", label: "Black", swatch: "/icons/circle-black.svg" },
  { value: "green", label: "Green", swatch: "/icons/circle-green.svg" },
  { value: "pink", label: "Pink", swatch: "/icons/circle-pink.svg" },
  { value: "purple", label: "Purple", swatch: "/icons/circle-purple.svg" },
];

type ColorMenuProps = {
  id?: string;
  options?: ColorOption[];
  value?: string;
  theme?: "light" | "dark";
  className?: string;
  onSelect?: (value: string) => void;
};

export function ColorMenu({
  id,
  options = COLOR_OPTIONS,
  value = "green",
  theme = "light",
  className,
  onSelect,
}: ColorMenuProps) {
  return (
    <div
      id={id}
      className={cn(
        "flex w-64 flex-col gap-2.5 overflow-clip rounded-xl p-2 shadow-depth4",
        theme === "light"
          ? "border-2 border-neutrals-6 bg-neutrals-8"
          : "border-2 border-neutrals-3 bg-neutrals-2",
        className,
      )}
      role="listbox"
    >
      {options.map((option) => (
        <DropdownItem
          key={option.value}
          label={option.label}
          swatch={option.swatch}
          all={option.all}
          selected={option.value === value}
          theme={theme}
          onSelect={() => onSelect?.(option.value)}
        />
      ))}
    </div>
  );
}
