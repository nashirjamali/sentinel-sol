import type { Metadata } from "next";
import { DM_Sans, Poppins, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AppKitProvider } from "@/components/providers/appkit-provider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Sentinels — On-chain price insurance",
  description:
    "Sentinels is a parametric price-insurance market for BTC, ETH, and SOL, fully collateralized in USDC and settled by the Pyth oracle.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${poppins.variable} ${plexMono.variable}`}>
        <AppKitProvider>{children}</AppKitProvider>
      </body>
    </html>
  );
}
