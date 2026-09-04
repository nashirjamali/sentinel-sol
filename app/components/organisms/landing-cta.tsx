import { Button } from "@/components/atoms/button";
import { GradientGlow } from "@/components/atoms/gradient-glow";
import { cn } from "@/lib/utils";

type GlowProps = {
  id: string;
  left: number;
  bottom: number;
  transform?: string;
  dodge?: boolean;
};

const CTA_GLOWS: GlowProps[] = [
  { id: "cta-a", left: 255.03, bottom: -120 },
  { id: "cta-b", left: -18, bottom: -80, transform: "scaleY(-1)" },
  { id: "cta-c", left: 500.17, bottom: -100, transform: "rotate(180deg)", dodge: true },
  { id: "cta-d", left: 319.08, bottom: -40, dodge: true },
];

function CtaBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 isolate overflow-hidden bg-neutrals-1">
      <div className="absolute bottom-0 left-[calc(50%-720px)] h-0 w-[1440px]">
        {CTA_GLOWS.map(({ id, left, bottom, transform, dodge }) => (
          <div
            key={id}
            className={cn(
              "absolute h-[411.267px] w-[911.522px]",
              dodge && "mix-blend-color-dodge",
            )}
            style={{ left, bottom, transform }}
          >
            <div className="absolute inset-[-76.53%_-34.53%]">
              <GradientGlow id={id} className="block size-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingCta() {
  return (
    <section className="relative w-full overflow-hidden bg-neutrals-1 px-4 py-20 md:px-16 md:py-[165px] xl:px-40">
      <CtaBackdrop />
      <div className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-[188px]">
        <div className="flex w-full max-w-[548px] flex-col items-start gap-10">
          <div className="flex w-full flex-col gap-8">
            <h2 className="font-display text-[40px] font-bold leading-[44px] tracking-[-0.02em] text-neutrals-8 md:text-[64px] md:leading-[64px]">
              Ready to protect your asset?
            </h2>
            <p className="max-w-[452px] font-body text-body-2 text-neutrals-4">
              Deposit USDC, mint a complete set, and keep only the side you want in one transaction.
            </p>
          </div>
          <Button href="/connect" variant="neutral" size="medium">
            Join waitlist
          </Button>
        </div>
        <div className="relative h-[280px] w-[236px] shrink-0 sm:h-[401px] sm:w-[338px]">
          <img
            src="/images/landing/cta-brand.svg"
            alt=""
            width={338}
            height={401}
            className="absolute inset-0 size-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
