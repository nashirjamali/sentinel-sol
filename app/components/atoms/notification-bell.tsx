import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type NotificationBellStatus = "default" | "error" | "new";

type NotificationBellProps = {
  status?: NotificationBellStatus;
};

export function NotificationBell({ status = "new" }: NotificationBellProps) {
  return (
    <span className="relative inline-block size-10">
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Icon src="/icons/bell-line.svg" size={24} />
      </span>
      <span
        className={cn(
          "absolute right-0 top-0 size-3 rounded-lg",
          status === "default" && "bg-primary-4",
          status === "error" && "bg-primary-3",
          status === "new" && "bg-neutrals-4",
        )}
      />
    </span>
  );
}
