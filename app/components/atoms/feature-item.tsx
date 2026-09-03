import type { ReactNode } from "react";
import { Icon } from "@/components/atoms/icon";

type FeatureItemProps = {
  children: ReactNode;
};

export function FeatureItem({ children }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon src="/icons/feature-check.svg" size={24} />
      <p className="m-0 font-body text-caption text-neutrals-4">{children}</p>
    </div>
  );
}
