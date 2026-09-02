import { cn } from "@/lib/utils";

type IconProps = {
  src: string;
  size?: 12 | 16 | 20 | 24 | 32;
  className?: string;
};

export function Icon({ src, size = 24, className }: IconProps) {
  return (
    <span
      className={cn("inline-block shrink-0 overflow-clip", className)}
      style={{ width: size, height: size }}
    >
      <img src={src} alt="" width={size} height={size} className="block size-full" />
    </span>
  );
}
