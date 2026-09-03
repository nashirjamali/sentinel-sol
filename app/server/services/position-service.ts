import "server-only";
import { PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddressSync, TokenAccountNotFoundError } from "@solana/spl-token";
import { getConnection } from "@/server/solana/connection";
import { getAmmProgram } from "@/server/solana/anchor-client";
import { listMarkets, getMarket } from "@/server/services/market-service";
import { PROGRAM_IDS } from "@/server/solana/programs";
import { NotFoundError } from "@/server/lib/errors";
import type { Market } from "@/server/types/market";
import type { Position } from "@/server/types/position";

/**
 * `getAccount` throws `TokenAccountNotFoundError` when the ATA has never been created — that's
 * the common case (a wallet that's never touched this mint), not an error worth surfacing.
 * Zero balance either way.
 */
async function balanceOf(mint: PublicKey, owner: PublicKey): Promise<string> {
  const connection = getConnection();
  const ata = getAssociatedTokenAddressSync(mint, owner, true);
  try {
    const account = await getAccount(connection, ata);
    return account.amount.toString();
  } catch (error) {
    if (error instanceof TokenAccountNotFoundError) return "0";
    throw error;
  }
}

async function positionForMarket(market: Market, wallet: PublicKey): Promise<Position> {
  const marketPubkey = new PublicKey(market.address);
  const downMint = new PublicKey(market.downMint);
  const upMint = new PublicKey(market.upMint);

  const [downBalance, upBalance] = await Promise.all([
    balanceOf(downMint, wallet),
    balanceOf(upMint, wallet),
  ]);

  // LP balance needs the pool's lp_mint, which only exists once init_pool has run — no pool
  // yet for this market is a valid state (lpBalance "0", not an error).
  let lpBalance = "0";
  const [ammPoolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("amm"), marketPubkey.toBuffer()],
    PROGRAM_IDS.amm,
  );
  try {
    const pool = await (getAmmProgram().account as any).ammPool.fetch(ammPoolPda);
    lpBalance = await balanceOf(pool.lpMint as PublicKey, wallet);
  } catch {
    // no pool for this market yet
  }

  return {
    market: market.address,
    assetSymbol: market.assetSymbol,
    downBalance,
    upBalance,
    lpBalance,
    marketStatus: market.status,
    marketOutcome: market.outcome,
    resolvedPrice: market.resolvedPrice,
  };
}

export async function listPositions(walletAddress: string): Promise<Position[]> {
  let wallet: PublicKey;
  try {
    wallet = new PublicKey(walletAddress);
  } catch {
    throw new NotFoundError(`Invalid wallet address: ${walletAddress}`);
  }

  const markets = await listMarkets();
  return Promise.all(markets.map((market) => positionForMarket(market, wallet)));
}

export async function getPosition(walletAddress: string, marketAddress: string): Promise<Position> {
  let wallet: PublicKey;
  try {
    wallet = new PublicKey(walletAddress);
  } catch {
    throw new NotFoundError(`Invalid wallet address: ${walletAddress}`);
  }

  const market = await getMarket(marketAddress); // throws NotFoundError if it doesn't exist
  return positionForMarket(market, wallet);
}
