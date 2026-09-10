import { Reveal } from "@/components/atoms/reveal";

const STEPS = [
  {
    step: "Step 1",
    title: "Connect Wallet",
    description: "Connect a Solana wallet extension like Phantom or Solflare.",
    icon: "/images/landing/step-1.png",
    iconWidth: 87,
    iconHeight: 83,
  },
  {
    step: "Step 2",
    title: "Deposit USDC",
    description: "Your USDC is locked 1:1 in an on-chain vault — fully collateralized, no synthetic leverage.",
    icon: "/images/landing/step-2.png",
    iconWidth: 72,
    iconHeight: 96,
  },
  {
    step: "Step 3",
    title: "Choose your asset",
    description: "Pick the crypto asset you hold, then set your coverage amount and expiry.",
    icon: "/images/landing/step-3.png",
    iconWidth: 98,
    iconHeight: 96,
  },
  {
    step: "Step 4",
    title: "Automatic settlement",
    description: "If the price falls below your strike, your payout settles in USDC automatically — no claims to file.",
    icon: "/images/landing/step-4.png",
    iconWidth: 110,
    iconHeight: 96,
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="w-full bg-neutrals-1 px-4 py-20 md:px-16 md:py-[136px] xl:px-40">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-12 md:gap-20">
        <Reveal className="flex w-full max-w-[544px] flex-col items-center gap-5 text-center">
          <h2 className="font-display text-[32px] font-bold leading-9 tracking-[-0.02em] text-neutrals-8 sm:text-[40px] sm:leading-[44px] md:text-[48px] md:leading-[56px]">
            How it works
          </h2>
          <p className="font-body text-body-2 text-neutrals-4">
            Four steps from deposit to payout — fully on-chain, fully collateralized, no claims
            process.
          </p>
        </Reveal>

        <div className="flex w-full flex-col gap-10 md:gap-20">
          <div className="hidden w-full items-center justify-between md:flex">
            {STEPS.flatMap((item, index) => {
              const icon = (
                <div key={item.step} className="flex h-24 w-[110px] shrink-0 items-center justify-center">
                  <img
                    src={item.icon}
                    alt=""
                    width={item.iconWidth}
                    height={item.iconHeight}
                    className="max-h-24 w-auto object-contain"
                  />
                </div>
              );
              if (index === STEPS.length - 1) return [icon];
              return [
                icon,
                <img
                  key={`${item.step}-line`}
                  src="/icons/connect-line.svg"
                  alt=""
                  width={160}
                  height={12}
                  className="h-3 w-40 shrink-0"
                />,
              ];
            })}
          </div>

          <div className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
            {STEPS.map((item, index) => (
              <Reveal
                key={item.step}
                delay={index * 90}
                className="flex flex-col items-center gap-8 text-center md:gap-[52px]"
              >
                <div className="flex h-24 items-center justify-center md:hidden">
                  <img
                    src={item.icon}
                    alt=""
                    width={item.iconWidth}
                    height={item.iconHeight}
                    className="max-h-24 w-auto object-contain"
                  />
                </div>
                <div className="flex w-full max-w-[256px] flex-col items-center gap-3 md:gap-[52px]">
                  <p className="font-body text-caption-2 text-neutrals-4">{item.step}</p>
                  <div className="flex w-full flex-col gap-4">
                    <p className="font-body text-body-2 font-medium text-neutrals-8">{item.title}</p>
                    <p className="font-body text-caption text-neutrals-4">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
