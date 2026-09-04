const VALUES = [
  {
    title: "1:1 collateralized",
    description:
      "We realize ideas from simple to complex, everything becomes easy to use and reach the most potential customers.",
    image: "/images/landing/value-collateral.png",
    width: 141,
    height: 160,
  },
  {
    title: "Oracle-resolved",
    description:
      "We realize ideas from simple to complex, everything becomes easy to use and reach the most potential customers.",
    image: "/images/landing/value-oracle.jpeg",
    width: 160,
    height: 160,
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

export function LandingValues() {
  return (
    <section className="relative w-full overflow-hidden bg-neutrals-1 px-4 py-20 md:px-16 md:py-[136px] xl:px-40">
      <div className="pointer-events-none absolute inset-0 isolate overflow-hidden" aria-hidden>
        <div className="absolute left-[45%] top-[-10%] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-primary-4/35 blur-[120px]" />
        <div className="absolute right-[-5%] top-[15%] h-[560px] w-[720px] rounded-full bg-primary-1/40 blur-[140px]" />
        <div className="absolute bottom-[5%] left-[20%] h-[420px] w-[640px] rounded-full bg-[#8CFB82]/25 blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-col items-center gap-16 md:gap-[64px]">
        <div className="flex w-full max-w-[453px] flex-col items-center gap-5 text-center text-neutrals-8">
          <h2 className="font-display text-[32px] font-bold leading-9 tracking-[-0.02em] sm:text-[40px] sm:leading-[44px] md:text-[48px] md:leading-[56px]">
            Built to be trusted,
            <br />
            not taken on faith
          </h2>
          <p className="font-body text-body-2 text-neutrals-4">
            Every guarantee below is enforced by program logic, not a promise.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
          {VALUES.map((value) => (
            <article
              key={value.title}
              className="flex h-auto min-h-[460px] flex-col items-center justify-center gap-8 rounded-[20px] bg-neutrals-2 px-8 py-[85px] text-center"
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
                <h3 className="font-body text-body-2 font-medium text-neutrals-8">{value.title}</h3>
                <p className="font-body text-caption text-neutrals-4">{value.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
