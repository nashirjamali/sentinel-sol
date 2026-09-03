import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Logo } from "@/components/atoms/logo";

export function LandingHeader() {
  return (
    <header className="relative z-20 w-full bg-neutrals-1 px-4 py-6 md:px-16 xl:px-40">
      <div className="relative mx-auto flex h-10 w-full min-w-0 max-w-[1440px] items-center justify-center md:justify-between">
        <nav className="hidden items-center gap-12 font-display text-button-2 text-neutrals-4 md:flex">
          <Link href="#how-it-works" className="hover:text-neutrals-8">
            How it works
          </Link>
          <Link href="#docs" className="hover:text-neutrals-8">
            Docs
          </Link>
        </nav>
        <Link
          href="/"
          aria-label="Sentinel home"
          className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
        >
          <Logo wordmark size={40} />
        </Link>
        <div className="hidden shrink-0 md:block">
          <Button href="#" variant="dark" size="small">
            Launch App
          </Button>
        </div>
      </div>
    </header>
  );
}
