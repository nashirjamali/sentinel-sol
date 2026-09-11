import { LandingCta } from "@/components/organisms/landing-cta";
import { LandingFooter } from "@/components/organisms/landing-footer";
import { LandingHeader } from "@/components/organisms/landing-header";
import { LandingHero } from "@/components/organisms/landing-hero";
import { LandingHowItWorks } from "@/components/organisms/landing-how-it-works";
import { LandingValues } from "@/components/organisms/landing-values";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-neutrals-1">
      <LandingHeader />
      <LandingHero />
      <LandingHowItWorks />
      <LandingValues />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
