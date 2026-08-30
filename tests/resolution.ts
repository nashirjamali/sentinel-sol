import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { assert } from "chai";

describe("resolution", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const configProgram = anchor.workspace.Config as Program;
  const marketProgram = anchor.workspace.Market as Program;
  const resolutionProgram = anchor.workspace.Resolution as Program;

  const admin = provider.wallet as anchor.Wallet;
  const user = Keypair.generate();

  // Matches the feed_id baked into tests/fixtures/{valid_up,valid_down,wide_confidence}.json
  // (32 bytes of 0x07) via programs/resolution/src/fixture_gen.rs.
  const assetFeedId = new PublicKey(Buffer.alloc(32, 7));
  const strikePrice = new anchor.BN(3_000_00000000); // matches fixture price scale (expo -8)

  const VALID_UP = new PublicKey("7GcbJLYdV6FiSbbZCFB1qfLSVAJmFW7dk5hrDiP4a3fz");
  const WIDE_CONFIDENCE = new PublicKey("FZPMy9C4dzk5Kzv7FnYws27zXVkANbN7wpJ6K2hnkZ1j");
  const VALID_DOWN = new PublicKey("3XgUTEpMxv9UBNVhKdVp3k7vrgcnYXYTYgBVQrjW39YK");
  const MISMATCHED_FEED = new PublicKey("8Mom3bvxw2RCJZcaMUrakCJ2SHh1CLbQPt8bDzR8Ahav");

  const [globalConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    configProgram.programId
  );
  const [riskConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("risk"), assetFeedId.toBuffer()],
    configProgram.programId
  );
  const [resolverAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("resolver")],
    resolutionProgram.programId
  );

  let usdcMint: PublicKey;
  let userUsdcAccount: PublicKey;

  async function onchainUnixTime(): Promise<number> {
    const info = await provider.connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
    return Number(info.data.readBigInt64LE(8 + 8 + 8 + 8));
  }

  async function airdrop(pubkey: PublicKey, lamports = 2_000_000_000) {
    const sig = await provider.connection.requestAirdrop(pubkey, lamports);
    const latest = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature: sig,
      ...latest,
    });
  }

  async function setRiskConfig(maxStalenessSecs: number, maxConfidenceBps: number) {
    await configProgram.methods
      .upsertRiskConfig(
        assetFeedId,
        new anchor.BN(maxStalenessSecs),
        maxConfidenceBps,
        new anchor.BN(1), // trading_halt_secs, kept tiny
        new anchor.BN(1_000_000),
        true
      )
      .accounts({
        admin: admin.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  // Creates a fresh market with a short expiry, optionally mints a complete set to `mintFor`
  // while the market is still active (before the halt window), then waits (adaptively, since
  // the local validator's clock can lag wall time unpredictably) until it has actually expired.
  async function createExpiredMarket(mintFor?: {
    user: Keypair;
    userUsdcAccount: PublicKey;
    amount: number;
  }): Promise<{
    marketPda: PublicKey;
    vaultAuthorityPda: PublicKey;
    downMint: Keypair;
    upMint: Keypair;
    collateralTokenAccount: PublicKey;
  }> {
    const sampleStart = await onchainUnixTime();
    await new Promise((r) => setTimeout(r, 3000));
    const sampleEnd = await onchainUnixTime();
    const observedRate = Math.max((sampleEnd - sampleStart) / 3, 0.02);

    const onchainNow = await onchainUnixTime();
    const margin = 3; // trading_halt_secs=1, so expiry = now + 1 + margin clears creation's check
    const expiryTs = new anchor.BN(onchainNow + 1 + margin);

    const [marketPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        assetFeedId.toBuffer(),
        strikePrice.toArrayLike(Buffer, "le", 8),
        expiryTs.toArrayLike(Buffer, "le", 8),
      ],
      marketProgram.programId
    );
    const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), marketPda.toBuffer()],
      marketProgram.programId
    );
    const downMint = Keypair.generate();
    const upMint = Keypair.generate();
    const collateralTokenAccount = getAssociatedTokenAddressSync(
      usdcMint,
      vaultAuthorityPda,
      true
    );

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
        usdcMint: usdcMint,
        collateralTokenAccount: collateralTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([downMint, upMint])
      .rpc();

    if (mintFor) {
      const userDownAccount = getAssociatedTokenAddressSync(
        downMint.publicKey,
        mintFor.user.publicKey
      );
      const userUpAccount = getAssociatedTokenAddressSync(
        upMint.publicKey,
        mintFor.user.publicKey
      );
      await marketProgram.methods
        .mintCompleteSet(new anchor.BN(mintFor.amount))
        .accounts({
          user: mintFor.user.publicKey,
          globalConfig: globalConfigPda,
          riskConfig: riskConfigPda,
          market: marketPda,
          vaultAuthority: vaultAuthorityPda,
          downMint: downMint.publicKey,
          upMint: upMint.publicKey,
          collateralTokenAccount: collateralTokenAccount,
          userUsdcAccount: mintFor.userUsdcAccount,
          userDownAccount,
          userUpAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([mintFor.user])
        .rpc();
    }

    const deadlineMs = Date.now() + Math.max((margin / observedRate) * 1000 * 25, 30_000);
    let clockNow = await onchainUnixTime();
    while (clockNow < expiryTs.toNumber()) {
      if (Date.now() > deadlineMs) {
        throw new Error(
          `on-chain clock did not reach expiry=${expiryTs.toNumber()} in time (stuck at ${clockNow})`
        );
      }
      await new Promise((r) => setTimeout(r, 500));
      clockNow = await onchainUnixTime();
    }

    return { marketPda, vaultAuthorityPda, downMint, upMint, collateralTokenAccount };
  }

  before(async function () {
    this.timeout(1_500_000);
    await airdrop(user.publicKey);

    usdcMint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      null,
      6
    );

    userUsdcAccount = await createAssociatedTokenAccount(
      provider.connection,
      user,
      usdcMint,
      user.publicKey
    );
    await mintTo(
      provider.connection,
      admin.payer,
      usdcMint,
      userUsdcAccount,
      admin.payer,
      100_000_000
    );

    const existingConfig = await provider.connection.getAccountInfo(globalConfigPda);
    if (!existingConfig) {
      await configProgram.methods
        .initializeConfig(admin.publicKey)
        .accounts({
          payer: admin.publicKey,
          globalConfig: globalConfigPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    }
  });

  it("rejects resolve_market before expiry", async function () {
    this.timeout(30_000);
    await setRiskConfig(1_000_000_000, 100);

    const onchainNow = await onchainUnixTime();
    const farExpiry = new anchor.BN(onchainNow + 1000);
    const [marketPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        assetFeedId.toBuffer(),
        strikePrice.toArrayLike(Buffer, "le", 8),
        farExpiry.toArrayLike(Buffer, "le", 8),
      ],
      marketProgram.programId
    );
    const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), marketPda.toBuffer()],
      marketProgram.programId
    );
    const downMint = Keypair.generate();
    const upMint = Keypair.generate();
    const collateralTokenAccount = getAssociatedTokenAddressSync(
      usdcMint,
      vaultAuthorityPda,
      true
    );

    await marketProgram.methods
      .createMarket(assetFeedId, strikePrice, farExpiry)
      .accounts({
        admin: admin.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: marketPda,
        vaultAuthority: vaultAuthorityPda,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        usdcMint: usdcMint,
        collateralTokenAccount: collateralTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([downMint, upMint])
      .rpc();

    let threw = false;
    try {
      await resolutionProgram.methods
        .resolveMarket()
        .accounts({
          keeper: admin.publicKey,
          riskConfig: riskConfigPda,
          market: marketPda,
          priceUpdate: VALID_UP,
          resolverAuthority: resolverAuthorityPda,
          marketProgram: marketProgram.programId,
        })
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected resolve_market before expiry to revert");
  });

  // The next five tests (four failure-path checks, then the successful resolution) all share a
  // single expired market rather than each waiting out their own — the failure-path resolves
  // never mutate market state, and by the time the final test runs the market is still Active
  // and expired, ready to resolve. `user` is credited a complete set up front, while the market
  // is still tradeable, so redemption after resolution needs no further waiting either.
  let sharedExpiredMarketPda: PublicKey;
  let sharedDownMint: Keypair;
  let sharedUpMint: Keypair;
  let sharedVaultAuthorityPda: PublicKey;
  let sharedCollateralTokenAccount: PublicKey;
  const sharedMintAmount = 50_000_000;

  it("creates a shared expired market for the failure-path checks below", async function () {
    this.timeout(1_500_000);
    await setRiskConfig(1_000_000_000, 100);
    const { marketPda, downMint, upMint, vaultAuthorityPda, collateralTokenAccount } =
      await createExpiredMarket({ user, userUsdcAccount, amount: sharedMintAmount });
    sharedExpiredMarketPda = marketPda;
    sharedDownMint = downMint;
    sharedUpMint = upMint;
    sharedVaultAuthorityPda = vaultAuthorityPda;
    sharedCollateralTokenAccount = collateralTokenAccount;
  });

  it("rejects a price_update account not owned by the Pyth receiver program", async function () {
    this.timeout(30_000);
    const marketPda = sharedExpiredMarketPda;

    let threw = false;
    try {
      await resolutionProgram.methods
        .resolveMarket()
        .accounts({
          keeper: admin.publicKey,
          riskConfig: riskConfigPda,
          market: marketPda,
          priceUpdate: globalConfigPda, // owned by config_program, not the Pyth receiver
          resolverAuthority: resolverAuthorityPda,
          marketProgram: marketProgram.programId,
        })
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected a non-Pyth-owned account to be rejected");
  });

  it("rejects resolve_market when the price feed_id doesn't match the market", async function () {
    this.timeout(30_000);
    const marketPda = sharedExpiredMarketPda;

    let threw = false;
    try {
      await resolutionProgram.methods
        .resolveMarket()
        .accounts({
          keeper: admin.publicKey,
          riskConfig: riskConfigPda,
          market: marketPda,
          priceUpdate: MISMATCHED_FEED,
          resolverAuthority: resolverAuthorityPda,
          marketProgram: marketProgram.programId,
        })
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected feed_id mismatch to revert");
  });

  it("rejects a stale price update", async function () {
    this.timeout(30_000);
    // The fixture's publish_time is 2023-11-14 — stale under any sane threshold.
    await setRiskConfig(60, 100);
    const marketPda = sharedExpiredMarketPda;

    let threw = false;
    try {
      await resolutionProgram.methods
        .resolveMarket()
        .accounts({
          keeper: admin.publicKey,
          riskConfig: riskConfigPda,
          market: marketPda,
          priceUpdate: VALID_UP,
          resolverAuthority: resolverAuthorityPda,
          marketProgram: marketProgram.programId,
        })
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected a stale price to revert");
  });

  it("rejects a price update whose confidence interval is too wide", async function () {
    this.timeout(30_000);
    await setRiskConfig(1_000_000_000, 100); // staleness bypassed; confidence stays tight
    const marketPda = sharedExpiredMarketPda;

    let threw = false;
    try {
      await resolutionProgram.methods
        .resolveMarket()
        .accounts({
          keeper: admin.publicKey,
          riskConfig: riskConfigPda,
          market: marketPda,
          priceUpdate: WIDE_CONFIDENCE,
          resolverAuthority: resolverAuthorityPda,
          marketProgram: marketProgram.programId,
        })
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected a too-wide confidence interval to revert");
  });

  it("resolves Up, rejects a second resolution, and redeems the winning side", async function () {
    this.timeout(30_000);
    await setRiskConfig(1_000_000_000, 100);

    const marketPda = sharedExpiredMarketPda;
    const downMint = sharedDownMint;
    const upMint = sharedUpMint;
    const mintAmount = sharedMintAmount;

    const userDownAccount = getAssociatedTokenAddressSync(downMint.publicKey, user.publicKey);
    const userUpAccount = getAssociatedTokenAddressSync(upMint.publicKey, user.publicKey);

    await resolutionProgram.methods
      .resolveMarket()
      .accounts({
        keeper: admin.publicKey,
        riskConfig: riskConfigPda,
        market: marketPda,
        priceUpdate: VALID_UP,
        resolverAuthority: resolverAuthorityPda,
        marketProgram: marketProgram.programId,
      })
      .rpc();

    const market = await marketProgram.account.market.fetch(marketPda);
    assert.deepEqual(market.outcome, { up: {} });
    assert.deepEqual(market.status, { resolved: {} });
    assert.equal(market.resolvedPrice.toString(), "310000000000");

    let threw = false;
    try {
      await resolutionProgram.methods
        .resolveMarket()
        .accounts({
          keeper: admin.publicKey,
          riskConfig: riskConfigPda,
          market: marketPda,
          priceUpdate: VALID_UP,
          resolverAuthority: resolverAuthorityPda,
          marketProgram: marketProgram.programId,
        })
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected a second resolution to revert");

    // Outcome is Up: redeeming UP tokens succeeds and pays out USDC.
    const usdcBefore = await getAccount(provider.connection, userUsdcAccount);
    const upBefore = await getAccount(provider.connection, userUpAccount);

    await marketProgram.methods
      .redeem(new anchor.BN(mintAmount))
      .accounts({
        user: user.publicKey,
        market: marketPda,
        vaultAuthority: sharedVaultAuthorityPda,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        collateralTokenAccount: sharedCollateralTokenAccount,
        userUsdcAccount,
        userDownAccount,
        userUpAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const usdcAfter = await getAccount(provider.connection, userUsdcAccount);
    const upAfter = await getAccount(provider.connection, userUpAccount);
    assert.equal(
      (BigInt(usdcAfter.amount.toString()) - BigInt(usdcBefore.amount.toString())).toString(),
      mintAmount.toString()
    );
    assert.equal(
      (BigInt(upBefore.amount.toString()) - BigInt(upAfter.amount.toString())).toString(),
      mintAmount.toString()
    );

    // Outcome is Up: the DOWN side (the losing side) cannot be redeemed — the user still holds
    // DOWN tokens from the complete-set mint, and redeem() burns/pays out based on
    // market.outcome (UP here), so attempting to redeem against the losing balance fails since
    // there is nothing on the UP side left to draw beyond what was already redeemed, and no
    // separate instruction path exists to redeem DOWN post-Up-resolution.
    let losingRedeemThrew = false;
    try {
      await marketProgram.methods
        .redeem(new anchor.BN(mintAmount))
        .accounts({
          user: user.publicKey,
          market: marketPda,
          vaultAuthority: sharedVaultAuthorityPda,
          downMint: downMint.publicKey,
          upMint: upMint.publicKey,
          collateralTokenAccount: sharedCollateralTokenAccount,
          userUsdcAccount,
          userDownAccount,
          userUpAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();
    } catch (e) {
      losingRedeemThrew = true;
    }
    assert.isTrue(
      losingRedeemThrew,
      "expected a second redeem (beyond the user's UP balance) to revert"
    );
  });
});
