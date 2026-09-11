import { Button } from "@/components/atoms/button";
import { Reveal } from "@/components/atoms/reveal";
import { FRAME_WIDTH } from "@/lib/design-frame";
import { cn } from "@/lib/utils";

/** Height of the CTA frame in the design (Figma node 442:5669). */
const FRAME_HEIGHT = 780;

/** Size of each ring's box in the design; only its blur reaches up into the section. */
const GLOW_WIDTH = 1356.613;
const GLOW_HEIGHT = 711.62;

type GlowProps = {
  id: string;
  src: string;
  /** Horizontal position in the design frame, as `[percent, pixelOffset]`. */
  left: [percent: number, offset: number];
  /** The ring's `top` in the design frame; converted to a bottom offset when rendered. */
  top: number;
  transform?: string;
  dodge?: boolean;
};

/**
 * The four blurred rings behind the CTA (Figma node 442:5669, layer `bg`).
 * Anchored to the bottom of the section: in the design every ring sits at or
 * just past the frame's bottom edge, and only its blur reaches up into view.
 *
 * These keep the design's pixel sizes rather than scaling with the viewport —
 * each SVG is ~2150px wide once its blur is included, so it already overshoots a
 * wide screen, and scaling it up would raise it far enough into the section to
 * wash out the heading.
 */
const CTA_GLOWS: GlowProps[] = [
  {
    id: "cta-1472",
    src: "/images/landing/cta-ellipse-1472.svg",
    left: [16.67, 83.81],
    top: 833.12,
    transform: "rotate(-0.65deg)",
  },
  {
    id: "cta-1471",
    src: "/images/landing/cta-ellipse-1471.svg",
    left: [0, -81],
    top: 764.75,
    transform: "rotate(-0.65deg) scaleY(-1)",
  },
  {
    id: "cta-1469",
    src: "/images/landing/cta-ellipse-1469.svg",
    left: [41.67, 86.05],
    top: 788,
    transform: "rotate(179.35deg)",
    dodge: true,
  },
  {
    id: "cta-1473",
    src: "/images/landing/cta-ellipse-1473.svg",
    left: [8.33, 147.34],
    top: 792.77,
    transform: "rotate(-0.65deg)",
    dodge: true,
  },
];

function CtaBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 isolate overflow-hidden bg-neutrals-1"
      aria-hidden
    >
      {/* Centred without a transform: one would open a stacking context and cut the
          `mix-blend-color-dodge` rings off from the background they blend with. */}
      <div
        className="absolute bottom-0 h-0"
        style={{ width: FRAME_WIDTH, left: `calc(50% - ${FRAME_WIDTH / 2}px)` }}
      >
        {CTA_GLOWS.map(({ id, src, left: [leftPercent, leftOffset], top, transform, dodge }) => (
          <div
            key={id}
            className={cn(
              "absolute flex items-center justify-center",
              dodge && "mix-blend-color-dodge",
            )}
            style={{
              left: `calc(${leftPercent}% + ${leftOffset}px)`,
              // `top` in the design → a bottom offset: the box sits below the frame,
              // so only its upward blur bleeds into the section.
              bottom: FRAME_HEIGHT - top - GLOW_HEIGHT,
              width: GLOW_WIDTH,
              height: GLOW_HEIGHT,
            }}
          >
            <div className="flex-none" style={{ transform }}>
              <div className="relative" style={{ width: 1348.755, height: 696.274 }}>
                <div className="absolute" style={{ inset: "-57.45% -29.66%" }}>
                  <img alt="" src={src} className="block size-full max-w-none" />
                </div>
              </div>
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
        <Reveal className="flex w-full max-w-[548px] flex-col items-start gap-10">
          <div className="flex w-full flex-col gap-8">
            <h2 className="font-display text-[40px] font-bold leading-[44px] tracking-[-0.02em] text-neutrals-8 md:text-[64px] md:leading-[64px]">
              Ready to protect your asset?
            </h2>
            <p className="max-w-[452px] font-body text-body-2 text-neutrals-4">
              Deposit USDC, pick your coverage, and your protection is active in one transaction.
            </p>
          </div>
          <Button href="/app/market" variant="neutral" size="medium">
            Join waitlist
          </Button>
        </Reveal>
        <Reveal
          delay={140}
          className="relative h-[280px] w-[236px] shrink-0 sm:h-[401px] sm:w-[338px]"
        >
          <img
            src="/images/landing/cta-brand.svg"
            alt=""
            width={338}
            height={401}
            className="absolute inset-0 size-full object-contain"
          />
        </Reveal>
      </div>
    </section>
  );
}
