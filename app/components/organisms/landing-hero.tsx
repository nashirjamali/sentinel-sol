import { Button } from "@/components/atoms/button";
import { CircleButton } from "@/components/atoms/circle-button";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[720px] w-full min-w-0 flex-col overflow-x-clip lg:h-[1112px] lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="relative h-full w-full rotate-180 opacity-80">
          <img
            src="/images/hero-grain.jpg"
            alt=""
            width={1920}
            height={1200}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </div>
      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[1440px] flex-1 flex-col">
        <div className="flex w-full min-w-0 flex-col items-center gap-8 px-6 pt-12 text-center md:px-16 lg:pt-[136px]">
          <div className="flex w-full max-w-[729px] flex-col items-center gap-4 text-neutrals-8">
            <h1 className="w-full text-balance font-display text-[32px] font-bold leading-9 tracking-[-0.02em] sm:text-[40px] sm:leading-[44px] md:text-[64px] md:leading-[64px]">
              Insure your crypto against the fall
            </h1>
            <p className="max-w-full font-body text-lg tracking-[-0.01em] md:text-body-1">
              Fully backed protection for your crypto, powered by real-time market prices.
            </p>
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-4">
            <Button href="#" variant="neutral" size="medium">
              Launch App
            </Button>
            <Button href="#how-it-works" variant="dark" size="medium">
              How It Works
            </Button>
          </div>
        </div>
        <div className="relative mx-auto mt-16 h-[320px] w-[calc(100%-32px)] max-w-[1120px] sm:h-[480px] lg:mt-auto lg:h-[648px] lg:w-full">
          <div className="absolute inset-0 rounded-t-[24px] bg-neutrals-8 lg:rounded-t-[40px]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <CircleButton size={80} tone="light" aria-label="Play video" />
          </div>
        </div>
      </div>
    </section>
  );
}
