import "server-only";
import { PublicKey } from "@solana/web3.js";
import { getMarketProgram } from "@/server/solana/anchor-client";
import { getResolutionProgramWithKeeper } from "@/server/solana/anchor-keeper";
import { symbolForFeedId } from "@/server/solana/assets";
import { postFreshPriceUpdate } from "@/server/solana/pyth-updater";
import { PROGRAM_IDS } from "@/server/solana/programs";
import { BadRequestError, NotFoundError } from "@/server/lib/errors";

export async function resolveMarket(
  marketAddress: string,
): Promise<{ signature: string; market: string }> {
  let marketPubkey: PublicKey;
  try {
    marketPubkey = new PublicKey(marketAddress);
  } catch {
    throw new NotFoundError(`Invalid market address: ${marketAddress}`);
  }

  const readProgram = getMarketProgram();
  let market: Record<string, any>;
  try {
    market = await (readProgram.account as any).market.fetch(marketPubkey);
  } catch {
    throw new NotFoundError(`No market at address ${marketAddress}`);
  }

  // Mirrors resolve_market.rs's own checks — fail with a clear 400 here rather than let the
  // on-chain revert be the only signal (same "fail loudly, fail early" reasoning as
  // tx-service.ts's checks).
  if (!("active" in market.status)) {
    throw new BadRequestError(`Market ${marketAddress} is already resolved`);
  }
  const nowSecs = Math.floor(Date.now() / 1000);
  if (nowSecs < market.expiryTs.toNumber()) {
    throw new BadRequestError(
      `Market ${marketAddress} has not expired yet (expiry_ts=${market.expiryTs.toString()})`,
    );
  }

  const symbol = symbolForFeedId(market.assetFeedId as PublicKey);
  if (!symbol) {
    throw new BadRequestError(
      `No known Pyth feed for ${(market.assetFeedId as PublicKey).toBase58()}`,
    );
  }
  // Pull a fresh price from Hermes and post it on-chain ourselves — see pyth-updater.ts's
  // docblock for why a static, previously-posted account isn't good enough here.
  const feedIdHex = (market.assetFeedId as PublicKey).toBuffer().toString("hex");
  const priceUpdate = await postFreshPriceUpdate(feedIdHex);

  const [riskConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("risk"), (market.assetFeedId as PublicKey).toBuffer()],
    PROGRAM_IDS.config,
  );
  const [resolverAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("resolver")],
    PROGRAM_IDS.resolution,
  );

  const program = getResolutionProgramWithKeeper();
  const keeperPubkey = (program.provider as any).wallet.publicKey as PublicKey;

  const signature = await program.methods
    .resolveMarket()
    .accounts({
      keeper: keeperPubkey,
      riskConfig: riskConfigPda,
      market: marketPubkey,
      priceUpdate,
      resolverAuthority: resolverAuthorityPda,
      marketProgram: PROGRAM_IDS.market,
    })
    .rpc();

  return { signature, market: marketAddress };
}
