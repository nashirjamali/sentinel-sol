export const SOL_ICON =
  "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

export const CBBTC_ICON =
  "https://coin-images.coingecko.com/coins/images/40143/small/cbbtc.webp";

export const WBTC_ICON =
  "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh/logo.png";

export const ETH_ICON =
  "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png";

export const BTC_ICON =
  "https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png";

export const TOKEN_ICONS: Record<string, string> = {
  SOL: SOL_ICON,
  BTC: BTC_ICON,
  ETH: ETH_ICON,
  cbBTC: CBBTC_ICON,
  WBTC: WBTC_ICON,
};

export const APP_ASSETS = [
  { symbol: "SOL", name: "Solana", iconUrl: SOL_ICON },
  { symbol: "cbBTC", name: "Coinbase Wrapped BTC", iconUrl: CBBTC_ICON },
  { symbol: "WBTC", name: "Wrapped BTC", iconUrl: WBTC_ICON },
] as const;

export type AppAssetSymbol = (typeof APP_ASSETS)[number]["symbol"];

export const TOKEN_FILTER_OPTIONS = [
  { value: "all", label: "All tokens" },
  ...APP_ASSETS.map((item) => ({
    value: item.symbol,
    label: `${item.symbol} · ${item.name}`,
  })),
];
