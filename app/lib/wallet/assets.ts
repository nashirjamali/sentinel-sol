export type WalletAsset = {
  id: string;
  mint: string;
  symbol: string;
  name: string;
  iconUrl: string | null;
  balance: number;
  price: number | null;
  change24h: number | null;
  supported: boolean;
};

export type WalletAssetsResponse = {
  assets: WalletAsset[];
  usdcBalance: number;
};

export type SolanaCluster = "devnet" | "mainnet";

export function parseWalletAddress(raw: string) {
  const parts = raw.split(":").filter(Boolean);
  return parts[parts.length - 1] ?? raw;
}

export async function fetchWalletAssets(
  owner: string,
  cluster: SolanaCluster,
): Promise<WalletAssetsResponse> {
  const address = parseWalletAddress(owner);
  const params = new URLSearchParams({ owner: address, cluster });
  const response = await fetch(`/api/wallet/assets?${params.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Couldn't load wallet assets.");
  }
  return (await response.json()) as WalletAssetsResponse;
}
