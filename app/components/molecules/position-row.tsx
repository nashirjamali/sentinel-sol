import { AssetChip, type AssetSymbol } from "@/components/molecules/asset-chip";
import { StatusPill } from "@/components/molecules/status-pill";
import { cn } from "@/lib/utils";

type PositionRowProps = {
  symbol: AssetSymbol;
  name: string;
  strike: string;
  premium: string;
  status: string;
  statusVariant?: "success" | "muted";
  meta: string;
  metaClassName?: string;
  className?: string;
};

export function PositionRow({
  symbol,
  name,
  strike,
  premium,
  status,
  statusVariant = "success",
  meta,
  metaClassName,
  className,
}: PositionRowProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-4 overflow-clip rounded-[10px] border border-neutrals-3 bg-[#141517] p-5",
        className,
      )}
    >
      <div className="w-[150px] shrink-0">
        <AssetChip symbol={symbol} name={name} size="md" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-clip whitespace-nowrap font-body">
        <p className="m-0 text-sm leading-6 text-neutrals-7">{strike}</p>
        <p className="m-0 text-caption-2 text-neutrals-4">{premium}</p>
      </div>
      <div className="flex w-[150px] shrink-0 flex-col items-end gap-1.5 overflow-clip">
        <StatusPill variant={statusVariant}>{status}</StatusPill>
        <p
          className={cn(
            "m-0 whitespace-nowrap font-body text-caption-2 text-neutrals-4",
            metaClassName,
          )}
        >
          {meta}
        </p>
      </div>
    </div>
  );
}
