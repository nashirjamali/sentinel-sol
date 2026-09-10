import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import { solana, solanaDevnet } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import {
  CoinbaseWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

export const REOWN_PROJECT_ID = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";

export const solanaNetworks: [AppKitNetwork, ...AppKitNetwork[]] =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet"
    ? [solana, solanaDevnet]
    : [solanaDevnet, solana];

export const solanaAdapter = new SolanaAdapter({
  wallets: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
  ],
});

export const appKitMetadata = {
  name: "Sentinels",
  description: "Parametric price insurance for BTC, ETH, and SOL, fully collateralized in USDC.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  icons: ["/favicon.ico"],
};
