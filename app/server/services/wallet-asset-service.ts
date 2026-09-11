import "server-only";
import { PublicKey } from "@solana/web3.js";
import {
  parseWalletAddress,
  type WalletAsset,
  type WalletAssetsResponse,
} from "@/lib/wallet/assets";
import { ApiError } from "@/server/lib/errors";
import { getClusterConnection, type SolanaCluster } from "@/server/solana/connection";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

const NATIVE_SOL_MINT = "So11111111111111111111111111111111111111112";
const SOL_ICON =
  "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

const WRAPPED_BTC: {
  mint: string;
  symbol: string;
  name: string;
  icon: string;
}[] = [
  {
    mint: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    icon: "https://coin-images.coingecko.com/coins/images/40143/small/cbbtc.webp",
  },
  {
    mint: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
    symbol: "WBTC",
    name: "Wrapped BTC (Wormhole)",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh/logo.png",
  },
  {
    mint: "5XZw2LKTyrfvfiskJ78AMpackRjPcyCif1WhUsPDuVqQ",
    symbol: "WBTC",
    name: "Wrapped BTC",
    icon: "https://j73gp4w27ucraqtyzsqa5th4fwldfvqgq576cnceekfactgk4fla.arweave.net/T_Zn8tr9BRBCeMygDsz8LZYy1gaHf-E0RCKKAUzK4VY",
  },
];

const WRAPPED_BTC_MINTS = new Set(WRAPPED_BTC.map((item) => item.mint));

const USDC_MINTS = new Set([
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "4zMMC9sst3DuUeA5e2mWkxYxbJdxfn1M9BxBSWapWdoX",
]);

type JupiterToken = {
  id: string;
  name?: string;
  symbol?: string;
  icon?: string;
  usdPrice?: number;
  stats24h?: { priceChange?: number };
};

type HeldToken = {
  mint: string;
  balance: number;
  decimals: number;
};

function parseOwner(raw: string) {
  try {
    return new PublicKey(raw);
  } catch {
    throw new ApiError(400, "Invalid wallet address");
  }
}

function isUsdc(mint: string, symbol: string) {
  if (USDC_MINTS.has(mint)) return true;
  return symbol.toUpperCase() === "USDC";
}

function isRemoteIconUsable(url: string | undefined): url is string {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.startsWith("ipfs://") || lower.includes("ipfs.io/")) return false;
  return lower.startsWith("https://");
}

function pickIcon(remote: string | undefined, fallback: string) {
  return isRemoteIconUsable(remote) ? remote : fallback;
}

function toChange(token: JupiterToken | undefined) {
  const change = token?.stats24h?.priceChange;
  return typeof change === "number" && Number.isFinite(change) ? change : null;
}

function toPrice(token: JupiterToken | undefined) {
  const price = token?.usdPrice;
  return typeof price === "number" && Number.isFinite(price) ? price : null;
}

async function fetchJupiterToken(mint: string): Promise<JupiterToken | undefined> {
  try {
    const response = await fetch(
      `https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(mint)}`,
      {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) return undefined;
    const results = (await response.json()) as JupiterToken[];
    if (!Array.isArray(results)) return undefined;
    return results.find((item) => item.id === mint) ?? results[0];
  } catch {
    return undefined;
  }
}

async function fetchJupiterTokens(mints: string[]) {
  const unique = [...new Set(mints.filter(Boolean))];
  const entries = await Promise.all(
    unique.map(async (mint) => [mint, await fetchJupiterToken(mint)] as const),
  );
  return new Map(entries);
}

async function loadHeldTokens(cluster: SolanaCluster, owner: PublicKey) {
  const connection = getClusterConnection(cluster);
  const [legacy, token2022] = await Promise.all([
    connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }),
    connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID }),
  ]);

  const held: HeldToken[] = [];
  for (const { account } of [...legacy.value, ...token2022.value]) {
    const data = account.data as {
      parsed?: {
        info?: { mint?: string; tokenAmount?: { uiAmount?: number | null; decimals?: number } };
      };
    };
    const info = data.parsed?.info;
    const mint = info?.mint;
    if (!mint) continue;
    held.push({
      mint,
      balance: info.tokenAmount?.uiAmount ?? 0,
      decimals: info.tokenAmount?.decimals ?? 0,
    });
  }
  return held;
}

export async function listWalletAssets(
  ownerRaw: string,
  cluster: SolanaCluster,
): Promise<WalletAssetsResponse> {
  const owner = parseOwner(parseWalletAddress(ownerRaw));
  const connection = getClusterConnection(cluster);

  const [lamports, held] = await Promise.all([
    connection.getBalance(owner).catch(() => 0),
    loadHeldTokens(cluster, owner).catch(() => [] as HeldToken[]),
  ]);

  const heldByMint = new Map<string, number>();
  for (const token of held) {
    heldByMint.set(token.mint, (heldByMint.get(token.mint) ?? 0) + token.balance);
  }

  let usdcBalance = held
    .filter((item) => USDC_MINTS.has(item.mint))
    .reduce((sum, item) => sum + item.balance, 0);

  const rest = held
    .filter(
      (item) =>
        item.mint !== NATIVE_SOL_MINT &&
        !USDC_MINTS.has(item.mint) &&
        !WRAPPED_BTC_MINTS.has(item.mint) &&
        item.decimals > 0 &&
        item.balance > 0,
    )
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 20);

  const lookupMints = [
    NATIVE_SOL_MINT,
    ...WRAPPED_BTC.map((item) => item.mint),
    ...rest.map((item) => item.mint),
  ];
  const metadata = await fetchJupiterTokens(lookupMints);

  const solMeta = metadata.get(NATIVE_SOL_MINT);
  const sol: WalletAsset = {
    id: NATIVE_SOL_MINT,
    mint: NATIVE_SOL_MINT,
    symbol: "SOL",
    name: "Solana",
    iconUrl: pickIcon(solMeta?.icon, SOL_ICON),
    balance: lamports / 1_000_000_000,
    price: toPrice(solMeta),
    change24h: toChange(solMeta),
    supported: true,
  };

  const btcAssets: WalletAsset[] = WRAPPED_BTC.map((item) => {
    const meta = metadata.get(item.mint);
    return {
      id: item.mint,
      mint: item.mint,
      symbol: meta?.symbol?.trim() || item.symbol,
      name: meta?.name?.trim() || item.name,
      iconUrl: pickIcon(meta?.icon, item.icon),
      balance: heldByMint.get(item.mint) ?? 0,
      price: toPrice(meta),
      change24h: toChange(meta),
      supported: true,
    };
  });

  const otherAssets: WalletAsset[] = [];
  for (const token of rest) {
    const meta = metadata.get(token.mint);
    const symbol = meta?.symbol?.trim() || token.mint.slice(0, 4);
    const name = meta?.name?.trim() || symbol;
    if (isUsdc(token.mint, symbol)) {
      if (!USDC_MINTS.has(token.mint)) {
        usdcBalance += token.balance;
      }
      continue;
    }
    otherAssets.push({
      id: token.mint,
      mint: token.mint,
      symbol,
      name,
      iconUrl: isRemoteIconUsable(meta?.icon) ? meta.icon : null,
      balance: token.balance,
      price: toPrice(meta),
      change24h: toChange(meta),
      supported: false,
    });
  }

  otherAssets.sort((a, b) => b.balance * (b.price ?? 0) - a.balance * (a.price ?? 0));

  return {
    assets: [sol, ...btcAssets, ...otherAssets],
    usdcBalance,
  };
}
