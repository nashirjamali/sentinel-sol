import type { CSSProperties } from "react";
import { Reveal } from "@/components/atoms/reveal";
import { FRAME, frameStyle, scaled } from "@/lib/design-frame";
import { cn } from "@/lib/utils";

const VALUES = [
  {
    title: "1:1 collateralized",
    description:
      "Every policy is backed by USDC locked in an on-chain vault. Your payout is funded before the coverage even starts.",
    image: "/images/landing/value-collateral.png",
    width: 141,
    height: 160,
  },
  {
    title: "Oracle-resolved",
    description:
      "Settlement reads a live Pyth price at expiry. Stale or low-confidence updates are rejected — never a cached fallback.",
    image: "/images/landing/value-oracle.png",
    width: 160,
    height: 160,
    /** Only the middle card is elevated in the design (Figma node 441:5336). */
    elevated: true,
  },
  {
    title: "Permissionless",
    description:
      "Anyone can trigger resolution once expiry passes, earning a small incentive. No party can block or delay settlement.",
    image: "/images/landing/value-permissionless.png",
    width: 157,
    height: 160,
  },
] as const;

type EllipseGlowProps = {
  src: string;
  /** Horizontal position inside the frame, as `[percent, pixelOffset]` from the design. */
  left: [percent: number, offset: number];
  /** Vertical position inside the frame, in design pixels. */
  top: number;
  width: number;
  height: number;
  transform?: string;
  inset: string;
  innerWidth: number;
  innerHeight: number;
  overlay?: boolean;
};

function EllipseGlow({
  src,
  left: [leftPercent, leftOffset],
  top,
  width,
  height,
  transform,
  inset,
  innerWidth,
  innerHeight,
  overlay,
}: EllipseGlowProps) {
  const style: CSSProperties = {
    left: `calc(${leftPercent}% + ${scaled(leftOffset)})`,
    top: scaled(top),
    width: scaled(width),
    height: scaled(height),
  };

  return (
    <div
      className={cn(
        "absolute flex items-center justify-center",
        overlay && "mix-blend-overlay",
      )}
      style={style}
    >
      <div className="flex-none" style={{ transform }}>
        <div
          className="relative"
          style={{ width: scaled(innerWidth), height: scaled(innerHeight) }}
        >
          <div className="absolute" style={{ inset }}>
            <img alt="" src={src} className="block size-full max-w-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ValuesBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 isolate overflow-hidden" aria-hidden>
      {/* Centred without a transform: one would open a stacking context and cut the
          `mix-blend-overlay` ring below off from the section background it blends with. */}
      {/* Dimmed below `md` for the same reason as the hero: at narrow widths the
          rings' bright centre sits behind the heading and sub-copy. */}
      <div
        className="absolute top-0 h-full opacity-40 md:opacity-100"
        style={{ ...frameStyle, width: FRAME, left: `calc(50% - ${FRAME} / 2)` }}
      >
        <EllipseGlow
          src="/images/landing/values-ellipse-166.svg"
          left={[58.33, -16.87]}
          top={-280}
          width={1399.033}
          height={1470.676}
          transform="rotate(143.76deg) scaleY(0.98) skewX(-11.78deg)"
          inset="-54.5% -29.46%"
          innerWidth={1357.757}
          innerHeight={733.954}
        />
        <EllipseGlow
          src="/images/landing/values-ellipse-167.svg"
          left={[58.33, -16.87]}
          top={-280}
          width={1399.033}
          height={1470.676}
          transform="rotate(143.76deg) scaleY(0.98) skewX(-11.78deg)"
          inset="-29.97% -16.2%"
          innerWidth={1357.757}
          innerHeight={733.954}
        />
        <EllipseGlow
          src="/images/landing/values-ellipse-165.svg"
          left={[50, -7.29]}
          top={237.46}
          width={1377.451}
          height={1423.227}
          transform="rotate(36.24deg) scaleY(0.98) skewX(11.78deg)"
          inset="-73.33% -36.83%"
          innerWidth={1357.757}
          innerHeight={681.828}
        />
        <EllipseGlow
          src="/images/landing/values-ellipse-168.svg"
          left={[41.67, 27]}
          top={-280}
          width={1399.033}
          height={1470.676}
          transform="rotate(143.76deg) scaleY(0.98) skewX(-11.78deg)"
          inset="-54.5% -29.46%"
          innerWidth={1357.757}
          innerHeight={733.954}
          overlay
        />
      </div>
    </div>
  );
}

export function LandingValues() {
  return (
    <section className="relative w-full overflow-hidden bg-neutrals-1 px-4 py-20 md:px-16 md:py-[136px] xl:px-40">
      <ValuesBackdrop />

      {/* The rings are brightest right where the heading sits, which leaves the
          sub-copy hard to read (the Figma frame has the same problem). This scrim
          sits between the rings and the content and only darkens behind the type. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[420px]"
        style={{
          background:
            "radial-gradient(55% 100% at 50% 32%, rgb(20 20 22 / 0.62) 0%, rgb(20 20 22 / 0.34) 50%, rgb(20 20 22 / 0) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-col items-center gap-16 md:gap-[64px]">
        <Reveal className="flex w-full max-w-[453px] flex-col items-center gap-5 text-center text-neutrals-8">
          <h2 className="font-display text-[32px] font-bold leading-9 tracking-[-0.02em] sm:text-[40px] sm:leading-[44px] md:text-[48px] md:leading-[56px]">
            Built to be trusted,
            <br />
            not taken on faith
          </h2>
          {/* Neutrals/6 rather than the heading's Neutrals/8: it keeps a step of
              hierarchy under the heading while staying legible over the glow. */}
          <p className="font-body text-body-2 text-neutrals-6">
            Every guarantee below is enforced by program logic, not a promise.
          </p>
        </Reveal>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 110} className="flex">
              <article
                className={cn(
                  "flex h-auto min-h-[460px] w-full flex-col items-center justify-center gap-8 overflow-hidden rounded-[20px] bg-neutrals-2 px-8 py-[85px] text-center",
                  "elevated" in value && value.elevated && "shadow-depth4",
                )}
              >
                <div className="flex h-40 w-40 items-center justify-center">
                  <img
                    src={value.image}
                    alt=""
                    width={value.width}
                    height={value.height}
                    className="max-h-40 max-w-40 object-contain"
                  />
                </div>
                <div className="flex w-full max-w-[293px] flex-col items-center gap-4">
                  <h3 className="font-body text-body-2 font-medium text-neutrals-8">
                    {value.title}
                  </h3>
                  <p className="font-body text-caption text-neutrals-4">{value.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
