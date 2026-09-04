import { cn } from "@/lib/utils";

type FilterDropdownProps = {
  label: string;
  className?: string;
};

export function FilterDropdown({ label, className }: FilterDropdownProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-w-0 flex-1 items-center justify-between overflow-clip rounded-xl border-2 border-neutrals-3 py-2 pl-4 pr-2",
        className,
      )}
    >
      <span className="h-5 min-w-0 truncate font-body text-sm font-medium leading-6 text-neutrals-8">
        {label}
      </span>
      <span className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-neutrals-3 p-1">
        <img
          src="/icons/arrow-down-simple-line.svg"
          alt=""
          width={24}
          height={24}
          className="size-6"
        />
      </span>
    </button>
  );
}
