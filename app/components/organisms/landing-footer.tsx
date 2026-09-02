import { Icon } from "@/components/atoms/icon";
import { Logo } from "@/components/atoms/logo";

export function LandingFooter() {
  return (
    <footer className="relative z-20 w-full bg-neutrals-1 px-4 pt-20 md:px-16 xl:px-40">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10">
        <div className="flex flex-col items-center justify-center gap-8">
          <Logo size={64} />
          <div className="flex flex-col items-center justify-center gap-5">
            <p className="font-body text-sm font-normal leading-5 text-neutrals-4">Follow us</p>
            <div className="flex items-start gap-6">
              <a href="#" aria-label="Twitter" className="inline-flex size-5 items-center justify-center">
                <Icon src="/icons/twitter-line.svg" size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="inline-flex size-5 items-center justify-center">
                <Icon src="/icons/instagram-line.svg" size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-[1120px] flex-col items-center gap-6 pb-6">
          <div className="h-px w-full bg-neutrals-3" />
          <p className="font-body text-caption-2 text-neutrals-4">Sentinel</p>
        </div>
      </div>
    </footer>
  );
}
