import "server-only";
import { PublicKey } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import { getConnection } from "@/server/solana/connection";
import { getMarketProgram } from "@/server/solana/anchor-client";
import { PROGRAM_IDS } from "@/server/solana/programs";
import { NotFoundError } from "@/server/lib/errors";

/**
 * Everything the `tx/*` builders need to assemble a market-scoped instruction, resolved once
 * from a market address: the decoded `Market` account, its config PDAs, and (since `Market`
 * doesn't store it directly — only `collateral_token_account`, an ATA of it) the USDC mint,
 * read off that token account.
 */
export type MarketContext = {
  marketPubkey: PublicKey;
  market: Record<string, any>;
  globalConfigPda: PublicKey;
  riskConfigPda: PublicKey;
  vaultAuthorityPda: PublicKey;
  usdcMint: PublicKey;
};

export async function resolveMarketContext(marketAddress: string): Promise<MarketContext> {
  let marketPubkey: PublicKey;
  try {
    marketPubkey = new PublicKey(marketAddress);
  } catch {
    throw new NotFoundError(`Invalid market address: ${marketAddress}`);
  }

  const program = getMarketProgram();
  let market: Record<string, any>;
  try {
    market = await (program.account as any).market.fetch(marketPubkey);
  } catch {
    throw new NotFoundError(`No market at address ${marketAddress}`);
  }

  const [globalConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    PROGRAM_IDS.config,
  );
  const [riskConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("risk"), (market.assetFeedId as PublicKey).toBuffer()],
    PROGRAM_IDS.config,
  );
  const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), marketPubkey.toBuffer()],
    PROGRAM_IDS.market,
  );

  const collateralAccount = await getAccount(
    getConnection(),
    market.collateralTokenAccount as PublicKey,
  );

  return {
    marketPubkey,
    market,
    globalConfigPda,
    riskConfigPda,
    vaultAuthorityPda,
    usdcMint: collateralAccount.mint,
  };
}
