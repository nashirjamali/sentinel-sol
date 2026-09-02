import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type DropdownItemProps = {
  label: string;
  swatch: string;
  all?: boolean;
  selected?: boolean;
  theme?: "light" | "dark";
  onSelect?: () => void;
};

export function DropdownItem({
  label,
  swatch,
  all = false,
  selected = false,
  theme = "light",
  onSelect,
}: DropdownItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border-none bg-transparent p-2 text-left font-body text-caption text-neutrals-2",
        theme === "light" && (selected ? "bg-neutrals-7" : "hover:bg-neutrals-7"),
        theme === "dark" && "text-neutrals-7",
        theme === "dark" && (selected ? "bg-neutrals-1 text-neutrals-8" : "hover:bg-neutrals-1 hover:text-neutrals-8"),
        all && "font-bold text-primary-1 hover:text-primary-1",
        all && theme === "dark" && "text-primary-1 hover:text-primary-1",
      )}
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
    >
      <Icon src={swatch} size={24} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
