import Link from "next/link";
import { Icon } from "@/components/atoms/icon";
import { Logo } from "@/components/atoms/logo";

const NAV_LINKS = [
  { label: "About", href: "#" },
  { label: "Projects", href: "#" },
  { label: "What We Do", href: "#" },
  { label: "Press", href: "#" },
  { label: "Jobs", href: "#" },
] as const;

const SOCIAL_LINKS = [
  { label: "Facebook", src: "/icons/facebook-line.svg" },
  { label: "Twitter", src: "/icons/twitter-line.svg" },
  { label: "Instagram", src: "/icons/instagram-line.svg" },
  { label: "Dribbble", src: "/icons/dribbble-line.svg" },
  { label: "Behance", src: "/icons/behance-line.svg" },
] as const;

export function LandingFooter() {
  return (
    <footer className="relative z-20 w-full bg-neutrals-1 px-4 pb-8 pt-20 md:px-16 xl:px-40">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-12">
        <div className="flex w-full flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
            <Logo wordmark size={40} />
            <div className="hidden h-6 w-px bg-neutrals-3 sm:block" />
            <p className="max-w-[346px] font-body text-caption text-neutrals-6">
              Let’s make a great design togerther.
            </p>
          </div>
          <nav className="flex flex-wrap items-start gap-x-10 gap-y-4 font-display text-button-2 text-neutrals-4">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-neutrals-8">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex w-full flex-col gap-8">
          <div className="h-px w-full bg-neutrals-3" />
          <div className="flex w-full flex-col items-start justify-between gap-6 py-[11px] sm:flex-row sm:items-center">
            <div className="flex flex-col gap-4 font-body text-caption-2 text-neutrals-4 sm:flex-row sm:items-start sm:gap-7">
              <p>Copyright © 2021 UI8 LLC. All rights reserved</p>
              <div className="flex gap-7 font-semibold">
                <Link href="#" className="hover:text-neutrals-8">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-neutrals-8">
                  Terms of Use
                </Link>
              </div>
            </div>
            <div className="flex items-start gap-6">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="inline-flex size-5 items-center justify-center"
                >
                  <Icon src={social.src} size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
