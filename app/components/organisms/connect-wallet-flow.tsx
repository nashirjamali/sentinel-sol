"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { WalletOption, type WalletId } from "@/components/molecules/wallet-option";
import { ConnectWalletShell } from "@/components/organisms/connect-wallet-shell";
import { Button as UiButton } from "@/components/ui/button";

const WALLETS: {
  id: WalletId;
  name: string;
  iconBg: string;
}[] = [
  { id: "phantom", name: "Phantom", iconBg: "bg-primary-2" },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    iconBg: "bg-primary-1 relative after:absolute after:inset-0 after:rounded-full after:bg-black/25",
  },
  { id: "solflare", name: "Solflare", iconBg: "bg-primary-4" },
  { id: "backpack", name: "Backpack", iconBg: "bg-primary-3" },
];

type Step = 1 | 2 | 3;

export function ConnectWalletFlow() {
  const [step, setStep] = useState<Step>(1);
  const [selectedWallet, setSelectedWallet] = useState<WalletId | null>(null);
  const [ageChecked, setAgeChecked] = useState(true);
  const [tosChecked, setTosChecked] = useState(false);

  function handleBack() {
    if (step === 1) {
      window.history.back();
      return;
    }
    if (step === 2) {
      setStep(1);
      return;
    }
    setStep(2);
  }

  function handleSelectWallet(id: WalletId) {
    setSelectedWallet(id);
    setStep(2);
  }

  const selected = WALLETS.find((wallet) => wallet.id === selectedWallet);

  return (
    <ConnectWalletShell onBack={handleBack}>
      <div className="flex items-start gap-32">
        <div className="flex w-[544px] shrink-0 flex-col gap-2">
          {WALLETS.map((wallet) => (
            <WalletOption
              key={wallet.id}
              id={wallet.id}
              name={wallet.name}
              iconBg={wallet.iconBg}
              selected={wallet.id === selectedWallet}
              onSelect={() => handleSelectWallet(wallet.id)}
            />
          ))}
        </div>

        {step === 1 ? (
          <div className="h-[512px] w-[448px] shrink-0 rounded-[24px] bg-neutrals-3" />
        ) : null}

        {step === 2 && selected ? (
          <div className="flex w-[448px] shrink-0 flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="m-0 font-display text-body-1 font-bold text-neutrals-8">
                Scan to connect
              </h2>
              <p className="m-0 font-body text-caption-2 text-neutrals-5">
                Powered by Solana Wallet Standard
              </p>
            </div>
            <div className="flex size-[448px] items-center justify-center rounded-[24px] bg-neutrals-2">
              <img
                src="/icons/qr-code.svg"
                alt="QR code"
                width={280}
                height={280}
                className="size-[280px]"
              />
            </div>
            <UiButton
              type="button"
              variant="dark"
              size="medium"
              className="w-full"
              onClick={() => setStep(3)}
            >
              Don&apos;t have a wallet app?
            </UiButton>
          </div>
        ) : null}

        {step === 3 && selected ? (
          <div className="flex w-[448px] shrink-0 flex-col gap-6">
            <h2 className="m-0 font-display text-body-1 font-bold text-neutrals-8">
              Terms of service
            </h2>
            <div className="h-40 overflow-y-auto rounded-xl bg-neutrals-3 px-4 py-3">
              <p className="m-0 font-body text-caption-2 text-neutrals-5">
                By connecting your wallet and using Sentinel, you acknowledge that
                market positions are fully collateralized parametric contracts
                resolved by oracle price feeds. You are solely responsible for
                securing your wallet and private keys. Sentinel does not custody
                funds outside of on-chain vaults described in the protocol
                documentation.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Checkbox
                id="connect-age"
                checked={ageChecked}
                onCheckedChange={setAgeChecked}
                label="I certify that I am 18 years of age or older"
              />
              <Checkbox
                id="connect-tos"
                checked={tosChecked}
                onCheckedChange={setTosChecked}
                label="I agree to the Terms of Service"
              />
            </div>
            <div className="flex gap-3">
              <Button href="/" variant="dark" size="medium" className="flex-1">
                Cancel
              </Button>
              <Button
                href="/app/market"
                variant="neutral"
                size="medium"
                className="flex-1"
                disabled={!ageChecked || !tosChecked}
              >
                Get started now
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </ConnectWalletShell>
  );
}
