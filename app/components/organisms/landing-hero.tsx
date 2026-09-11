import { Button } from "@/components/atoms/button";
import { GradientGlow } from "@/components/atoms/gradient-glow";
import { HeroAppPreview } from "@/components/organisms/hero-app-preview";
import { cn } from "@/lib/utils";

type GlowProps = {
  id: string;
  /** Left offset inside the 1440px design frame. */
  left: number;
  /** Distance from the bottom of the hero, in design pixels. */
  bottom: number;
  transform?: string;
  dodge?: boolean;
};

/**
 * The four blurred gradient rings behind the hero (Figma node 201:28, layer `bg`).
 * Laid out in the design's 1440px frame and anchored to the bottom of the hero, since
 * every ring sits in its lower third.
 */
const HERO_GLOWS: GlowProps[] = [
  { id: "a", left: 255.03, bottom: 39.86 },
  { id: "b", left: -18, bottom: 82.98, transform: "scaleY(-1)" },
  { id: "c", left: 500.17, bottom: 64.08, transform: "rotate(180deg)", dodge: true },
  { id: "d", left: 319.08, bottom: 117.73, dodge: true },
];

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 isolate overflow-hidden bg-neutrals-1">
      {/* No transform here: it would open a stacking context and cut the rings below off
          from the `bg-neutrals-1` backdrop their color-dodge blend needs. */}
      {/* The rings are a fixed 1440px-wide composition, so on a narrow viewport their
          bright centre lands directly behind the copy. Dimmed below `md` to keep the
          heading, sub-copy and outline button readable; untouched at design width. */}
      <div className="absolute bottom-0 left-[calc(50%-720px)] h-0 w-[1440px] opacity-40 md:opacity-100">
        {HERO_GLOWS.map(({ id, left, bottom, transform, dodge }) => (
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

export function LandingHero() {
  return (
    <section className="relative flex min-h-[720px] w-full min-w-0 flex-col overflow-x-clip lg:h-[1112px] lg:overflow-hidden">
      <HeroBackdrop />
      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[1440px] flex-1 flex-col gap-10 lg:gap-16">
        {/* Entrance runs on load rather than on scroll — the hero is above the fold.
            The global reduced-motion guard collapses these to their end state. */}
        <div className="flex w-full min-w-0 flex-col items-center gap-8 px-6 pt-12 text-center md:px-16 lg:pt-[136px]">
          <div className="flex w-full max-w-[729px] flex-col items-center gap-4 text-neutrals-8">
            <h1 className="w-full animate-rise-in text-balance font-display text-[32px] font-bold leading-9 tracking-[-0.02em] sm:text-[40px] sm:leading-[44px] md:text-[64px] md:leading-[64px]">
              Insure your crypto against the fall
            </h1>
            <p className="max-w-full animate-rise-in font-body text-lg tracking-[-0.01em] [animation-delay:120ms] md:text-body-1">
              Fully backed protection for your crypto, powered by real-time market prices.
            </p>
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-4 animate-rise-in [animation-delay:240ms]">
            <Button href="/app/market" variant="neutral" size="medium">
              Launch App
            </Button>
            <Button href="#how-it-works" variant="dark" size="medium">
              How It Works
            </Button>
          </div>
        </div>
        <div className="relative mx-auto h-[320px] w-[calc(100%-32px)] max-w-[1120px] animate-rise-in [animation-delay:380ms] sm:h-[480px] lg:mb-[53px] lg:mt-auto lg:h-[648px] lg:w-full">
          <HeroAppPreview />
        </div>
      </div>
    </section>
  );
}
