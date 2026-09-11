// One-off: creates GlobalConfig + a BTC RiskConfig with a SHORT trading_halt_secs (15s,
// vs the production default of 300s) + a market expiring ~20s from now — purely so we can
// validate resolve_market's happy path on devnet without waiting 5+ minutes. Throwaway test
// market, not the real weekly-expiry demo market (that gets seeded separately via
// seed-market.ts once RiskConfig is reset back to production values — see the note this
// script prints at the end).
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import feeds from "../config/pyth-feeds.json";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const configProgram = anchor.workspace.Config as Program;
  const marketProgram = anchor.workspace.Market as Program;
  const admin = provider.wallet as anchor.Wallet;

  const feedHex = feeds.feeds["BTC/USD"].feed_id.replace(/^0x/, "");
  const assetFeedId = new PublicKey(Buffer.from(feedHex, "hex"));

  const [globalConfigPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], configProgram.programId);
  const [riskConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("risk"), assetFeedId.toBuffer()],
    configProgram.programId,
  );

  if (await provider.connection.getAccountInfo(globalConfigPda)) {
    console.log("GlobalConfig: already exists");
  } else {
    await configProgram.methods
      .initializeConfig(admin.publicKey)
      .accounts({ payer: admin.publicKey, globalConfig: globalConfigPda, systemProgram: SystemProgram.programId })
      .rpc();
    console.log("GlobalConfig: initialized");
  }

  const TEST_HALT_SECS = 15;
  await configProgram.methods
    .upsertRiskConfig(
      assetFeedId,
      new anchor.BN(60), // max_staleness_secs (production value, unchanged)
      100, // max_confidence_bps (production value, unchanged)
      new anchor.BN(TEST_HALT_SECS), // SHORT for this test only
      new anchor.BN(1_000_000_000),
      true,
    )
    .accounts({ admin: admin.publicKey, globalConfig: globalConfigPda, riskConfig: riskConfigPda, systemProgram: SystemProgram.programId })
    .rpc();
  console.log(`RiskConfig(BTC): trading_halt_secs set to ${TEST_HALT_SECS}s (TEST VALUE, not production 300s)`);

  const usdcMint = await createMint(provider.connection, admin.payer, admin.publicKey, null, 6);
  const strikePrice = new anchor.BN(60_000 * 1e8);
  const expiryTs = new anchor.BN(Math.floor(Date.now() / 1000) + TEST_HALT_SECS + 5); // just past the halt window

  const [marketPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("market"), assetFeedId.toBuffer(), strikePrice.toArrayLike(Buffer, "le", 8), expiryTs.toArrayLike(Buffer, "le", 8)],
    marketProgram.programId,
  );
  const [vaultAuthorityPda] = PublicKey.findProgramAddressSync([Buffer.from("vault"), marketPda.toBuffer()], marketProgram.programId);
  const downMint = Keypair.generate();
  const upMint = Keypair.generate();
  const collateralTokenAccount = getAssociatedTokenAddressSync(usdcMint, vaultAuthorityPda, true);

  await marketProgram.methods
    .createMarket(assetFeedId, strikePrice, expiryTs)
    .accounts({
      admin: admin.publicKey,
      globalConfig: globalConfigPda,
      riskConfig: riskConfigPda,
      market: marketPda,
      vaultAuthority: vaultAuthorityPda,
      downMint: downMint.publicKey,
      upMint: upMint.publicKey,
      usdcMint,
      collateralTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([downMint, upMint])
    .rpc();

  console.log(`\nTest market created: ${marketPda.toBase58()}`);
  console.log(`Expires at: ${new Date(expiryTs.toNumber() * 1000).toISOString()} (in ~${TEST_HALT_SECS + 5}s)`);
  console.log(`\nIMPORTANT: after resolve testing is done, reset BTC's RiskConfig trading_halt_secs`);
  console.log(`back to 300 (production value) before seeding the real weekly-expiry demo market.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
