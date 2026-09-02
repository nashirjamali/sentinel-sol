import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

const DEFAULT_STEPS = ["Shopping cart", "Checkout details", "Order complete"];

type ProcessStepsProps = {
  steps?: string[];
  current?: number;
};

export function ProcessSteps({
  steps = DEFAULT_STEPS,
  current = 1,
}: ProcessStepsProps) {
  return (
    <ol className="m-0 flex list-none items-start gap-8 p-0">
      {steps.map((label, index) => {
        const step = index + 1;
        const status =
          step < current ? "done" : step === current ? "active" : "upcoming";

        return (
          <li key={label} className="flex w-64 flex-col gap-[23px]">
            <div className="flex w-full items-center gap-[17px]">
              <span
                className={cn(
                  "flex min-w-10 items-center justify-center overflow-clip rounded-[40px] px-[15px] py-2 font-body text-body-2 font-bold text-neutrals-8",
                  status === "done" && "bg-primary-4 p-2",
                  status === "active" && "bg-neutrals-2",
                  status === "upcoming" && "bg-neutrals-5",
                )}
              >
                {status === "done" ? (
                  <Icon src="/icons/check-line-white.svg" size={24} />
                ) : (
                  step
                )}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 font-body text-body-2 font-bold",
                  status === "done" && "text-primary-4",
                  status === "active" && "text-neutrals-2",
                  status === "upcoming" && "text-neutrals-5",
                )}
              >
                {label}
              </span>
            </div>
            <span
              className={cn(
                "block h-0.5 w-full rounded-sm",
                status === "done" && "bg-primary-4",
                status === "active" && "bg-neutrals-2",
                status === "upcoming" && "bg-neutrals-6",
              )}
            />
          </li>
        );
      })}
    </ol>
  );
}
