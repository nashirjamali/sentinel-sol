import { LandingFooter } from "@/components/organisms/landing-footer";
import { LandingHeader } from "@/components/organisms/landing-header";
import { LandingHero } from "@/components/organisms/landing-hero";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-neutrals-1">
      <LandingHeader />
      <LandingHero />
      <LandingFooter />
    </div>
  );
}
