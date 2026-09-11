import "server-only";
import { PublicKey } from "@solana/web3.js";
import { getConfigProgram } from "@/server/solana/anchor-client";
import { PROGRAM_IDS } from "@/server/solana/programs";
import { KNOWN_ASSET_SYMBOLS, feedIdForSymbol } from "@/server/solana/assets";
import { NotFoundError } from "@/server/lib/errors";
import type { GlobalConfigView, AssetRiskConfig } from "@/server/types/config";

const [GLOBAL_CONFIG_PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("config")],
  PROGRAM_IDS.config,
);

export async function getGlobalConfig(): Promise<GlobalConfigView> {
  const program = getConfigProgram();
  let account: Record<string, any>;
  try {
    account = await (program.account as any).globalConfig.fetch(GLOBAL_CONFIG_PDA);
  } catch {
    // Not "not found" in the usual sense — this means initialize_config has never been run
    // against this cluster at all, which is a real operational gap worth a clear message.
    throw new NotFoundError(
      "GlobalConfig doesn't exist yet — initialize_config hasn't been run on this cluster",
    );
  }
  return {
    admin: (account.admin as PublicKey).toBase58(),
    pendingAdmin: account.pendingAdmin ? (account.pendingAdmin as PublicKey).toBase58() : null,
    paused: account.paused as boolean,
  };
}

async function getRiskConfig(symbol: "BTC" | "ETH" | "SOL"): Promise<AssetRiskConfig> {
  const feedId = feedIdForSymbol(symbol);
  const [riskConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("risk"), feedId.toBuffer()],
    PROGRAM_IDS.config,
  );
  const program = getConfigProgram();
  try {
    const account = await (program.account as any).riskConfig.fetch(riskConfigPda);
    return {
      symbol,
      assetFeedId: feedId.toBase58(),
      maxStalenessSecs: account.maxStalenessSecs.toNumber(),
      maxConfidenceBps: account.maxConfidenceBps,
      tradingHaltSecs: account.tradingHaltSecs.toNumber(),
      lmsrBMin: account.lmsrBMin.toString(),
      enabled: account.enabled as boolean,
    };
  } catch {
    return null; // upsert_risk_config hasn't been run for this asset yet — valid state.
  }
}

export async function listAssets(): Promise<AssetRiskConfig[]> {
  return Promise.all(KNOWN_ASSET_SYMBOLS.map(getRiskConfig));
}
