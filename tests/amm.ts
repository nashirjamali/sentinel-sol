import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  ComputeBudgetProgram,
} from "@solana/web3.js";

// swap/add_liquidity evaluate the LMSR cost function (multiple checked exp/ln fixed-point
// evaluations) and can exceed Solana's default 200_000 CU transaction budget, so callers must
// request a higher limit — same as any other compute-heavy instruction (e.g. AMM swaps on other
// protocols). This is a client-side requirement, not a workaround for a bug.
const LMSR_COMPUTE_UNITS = ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 });
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

describe("amm", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const configProgram = anchor.workspace.Config as Program;
  const marketProgram = anchor.workspace.Market as Program;
  const ammProgram = anchor.workspace.Amm as Program;

  const admin = provider.wallet as anchor.Wallet;
  const lp = admin; // admin doubles as the first LP in this test
  const trader = Keypair.generate();
  const stranger = Keypair.generate();

  const assetFeedId = Keypair.generate().publicKey;
  const strikePrice = new anchor.BN(3_000_00000000);

  const [globalConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    configProgram.programId
  );
  const [riskConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("risk"), assetFeedId.toBuffer()],
    configProgram.programId
  );

  let usdcMint: PublicKey;
  let marketPda: PublicKey;
  let vaultAuthorityPda: PublicKey;
  let downMint: Keypair;
  let upMint: Keypair;
  let collateralTokenAccount: PublicKey;

  let ammPoolPda: PublicKey;
  let lpMint: Keypair;
  let poolDownAccount: PublicKey;
  let poolUpAccount: PublicKey;

  let adminUsdcAccount: PublicKey;
  let adminDownAccount: PublicKey;
  let adminUpAccount: PublicKey;
  let adminLpAccount: PublicKey;

  let traderUsdcAccount: PublicKey;
  let traderDownAccount: PublicKey;
  let traderUpAccount: PublicKey;

  const B = new anchor.BN(1_000_000_000); // 1000 tokens
  const FEE_BPS = 30; // 0.3%

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

  before(async () => {
    await airdrop(trader.publicKey);
    await airdrop(stranger.publicKey);

    usdcMint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      null,
      6
    );

    adminUsdcAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      usdcMint,
      admin.publicKey
    );
    await mintTo(
      provider.connection,
      admin.payer,
      usdcMint,
      adminUsdcAccount,
      admin.payer,
      1_000_000_000
    );

    traderUsdcAccount = await createAssociatedTokenAccount(
      provider.connection,
      trader,
      usdcMint,
      trader.publicKey
    );
    await mintTo(
      provider.connection,
      admin.payer,
      usdcMint,
      traderUsdcAccount,
      admin.payer,
      1_000_000_000
    );

    const existingConfig = await provider.connection.getAccountInfo(
      globalConfigPda
    );
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

    await configProgram.methods
      .upsertRiskConfig(
        assetFeedId,
        new anchor.BN(60),
        100,
        new anchor.BN(3), // trading_halt_secs
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

    const onchainNow = await onchainUnixTime();
    const expiryTs = new anchor.BN(onchainNow + 1000); // far expiry, halt window irrelevant here

    [marketPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        assetFeedId.toBuffer(),
        strikePrice.toArrayLike(Buffer, "le", 8),
        expiryTs.toArrayLike(Buffer, "le", 8),
      ],
      marketProgram.programId
    );
    [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), marketPda.toBuffer()],
      marketProgram.programId
    );

    downMint = Keypair.generate();
    upMint = Keypair.generate();
    collateralTokenAccount = getAssociatedTokenAddressSync(
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

    adminDownAccount = getAssociatedTokenAddressSync(
      downMint.publicKey,
      admin.publicKey
    );
    adminUpAccount = getAssociatedTokenAddressSync(
      upMint.publicKey,
      admin.publicKey
    );
    traderDownAccount = getAssociatedTokenAddressSync(
      downMint.publicKey,
      trader.publicKey
    );
    traderUpAccount = getAssociatedTokenAddressSync(
      upMint.publicKey,
      trader.publicKey
    );

    // Admin (LP) mints a complete set to seed the pool with inventory.
    await marketProgram.methods
      .mintCompleteSet(new anchor.BN(500_000_000))
      .accounts({
        user: admin.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: marketPda,
        vaultAuthority: vaultAuthorityPda,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        collateralTokenAccount: collateralTokenAccount,
        userUsdcAccount: adminUsdcAccount,
        userDownAccount: adminDownAccount,
        userUpAccount: adminUpAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Trader mints a complete set so it has DOWN/UP to trade with.
    await marketProgram.methods
      .mintCompleteSet(new anchor.BN(200_000_000))
      .accounts({
        user: trader.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: marketPda,
        vaultAuthority: vaultAuthorityPda,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        collateralTokenAccount: collateralTokenAccount,
        userUsdcAccount: traderUsdcAccount,
        userDownAccount: traderDownAccount,
        userUpAccount: traderUpAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([trader])
      .rpc();

    [ammPoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("amm"), marketPda.toBuffer()],
      ammProgram.programId
    );
    lpMint = Keypair.generate();
    poolDownAccount = getAssociatedTokenAddressSync(
      downMint.publicKey,
      ammPoolPda,
      true
    );
    poolUpAccount = getAssociatedTokenAddressSync(
      upMint.publicKey,
      ammPoolPda,
      true
    );
    adminLpAccount = getAssociatedTokenAddressSync(
      lpMint.publicKey,
      admin.publicKey
    );
  });

  it("rejects init_pool when b is below RiskConfig.lmsr_b_min", async () => {
    const tinyB = new anchor.BN(1); // lmsr_b_min was set to 1_000_000
    let threw = false;
    try {
      await ammProgram.methods
        .initPool(tinyB, FEE_BPS)
        .accounts({
          admin: admin.publicKey,
          globalConfig: globalConfigPda,
          riskConfig: riskConfigPda,
          market: marketPda,
          ammPool: ammPoolPda,
          lpMint: lpMint.publicKey,
          downMint: downMint.publicKey,
          upMint: upMint.publicKey,
          poolDownAccount,
          poolUpAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([lpMint])
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected init_pool with b < lmsr_b_min to revert");
  });

  it("rejects init_pool from a non-admin signer", async () => {
    let threw = false;
    try {
      await ammProgram.methods
        .initPool(B, FEE_BPS)
        .accounts({
          admin: stranger.publicKey,
          globalConfig: globalConfigPda,
          riskConfig: riskConfigPda,
          market: marketPda,
          ammPool: ammPoolPda,
          lpMint: lpMint.publicKey,
          downMint: downMint.publicKey,
          upMint: upMint.publicKey,
          poolDownAccount,
          poolUpAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([stranger, lpMint])
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected init_pool from a non-admin to revert");
  });

  it("initializes the AMM pool", async () => {
    await ammProgram.methods
      .initPool(B, FEE_BPS)
      .accounts({
        admin: admin.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: marketPda,
        ammPool: ammPoolPda,
        lpMint: lpMint.publicKey,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        poolDownAccount,
        poolUpAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([lpMint])
      .rpc();

    const pool = await ammProgram.account.ammPool.fetch(ammPoolPda);
    assert.equal(pool.b.toString(), B.toString());
    assert.equal(pool.qDown.toNumber(), 0);
    assert.equal(pool.qUp.toNumber(), 0);
    assert.equal(pool.feeBps, FEE_BPS);
  });

  it("rejects init_pool twice for the same market", async () => {
    let threw = false;
    try {
      await ammProgram.methods
        .initPool(B, FEE_BPS)
        .accounts({
          admin: admin.publicKey,
          globalConfig: globalConfigPda,
          riskConfig: riskConfigPda,
          market: marketPda,
          ammPool: ammPoolPda,
          lpMint: Keypair.generate().publicKey,
          downMint: downMint.publicKey,
          upMint: upMint.publicKey,
          poolDownAccount,
          poolUpAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected a second init_pool for the same market to revert");
  });

  it("add_liquidity (first LP) mints LP tokens proportional to contribution", async () => {
    const amount = new anchor.BN(400_000_000);

    await ammProgram.methods
      .addLiquidity(amount, amount)
      .accounts({
        user: admin.publicKey,
        market: marketPda,
        ammPool: ammPoolPda,
        lpMint: lpMint.publicKey,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        poolDownAccount,
        poolUpAccount,
        userDownAccount: adminDownAccount,
        userUpAccount: adminUpAccount,
        userLpAccount: adminLpAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .preInstructions([LMSR_COMPUTE_UNITS])
      .rpc();

    const lpAccount = await getAccount(provider.connection, adminLpAccount);
    // First LP into an empty, balanced pool: LP minted ~= amount (since price_down+price_up=1).
    assert.approximately(
      Number(lpAccount.amount.toString()),
      Number(amount.toString()),
      1000
    );

    const poolDown = await getAccount(provider.connection, poolDownAccount);
    const poolUp = await getAccount(provider.connection, poolUpAccount);
    assert.equal(poolDown.amount.toString(), amount.toString());
    assert.equal(poolUp.amount.toString(), amount.toString());
  });

  it("rejects add_liquidity with an unequal DOWN/UP ratio", async () => {
    let threw = false;
    try {
      await ammProgram.methods
        .addLiquidity(new anchor.BN(1_000_000), new anchor.BN(2_000_000))
        .accounts({
          user: admin.publicKey,
          market: marketPda,
          ammPool: ammPoolPda,
          lpMint: lpMint.publicKey,
          downMint: downMint.publicKey,
          upMint: upMint.publicKey,
          poolDownAccount,
          poolUpAccount,
          userDownAccount: adminDownAccount,
          userUpAccount: adminUpAccount,
          userLpAccount: adminLpAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions([LMSR_COMPUTE_UNITS])
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected add_liquidity with unequal amounts to revert");
  });

  it("swap moves the price and respects fee deduction", async () => {
    const amountIn = new anchor.BN(50_000_000); // 50 DOWN

    const poolBefore = await ammProgram.account.ammPool.fetch(ammPoolPda);
    const traderUpBefore = await getAccount(provider.connection, traderUpAccount);

    await ammProgram.methods
      .swap({ down: {} }, amountIn, new anchor.BN(1))
      .accounts({
        user: trader.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: marketPda,
        ammPool: ammPoolPda,
        poolDownAccount,
        poolUpAccount,
        userDownAccount: traderDownAccount,
        userUpAccount: traderUpAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions([LMSR_COMPUTE_UNITS])
      .signers([trader])
      .rpc();

    const poolAfter = await ammProgram.account.ammPool.fetch(ammPoolPda);
    const traderUpAfter = await getAccount(provider.connection, traderUpAccount);

    // q_down decreased by amount_in, q_up increased by the gross amount_out.
    assert.equal(
      poolAfter.qDown.toNumber(),
      poolBefore.qDown.toNumber() - amountIn.toNumber()
    );
    assert.isTrue(poolAfter.qUp.toNumber() > poolBefore.qUp.toNumber());

    const upReceived =
      Number(traderUpAfter.amount.toString()) -
      Number(traderUpBefore.amount.toString());
    assert.isTrue(upReceived > 0);

    // Net received must be strictly less than the gross q_up delta, since the fee is withheld.
    const grossUpDelta = poolAfter.qUp.toNumber() - poolBefore.qUp.toNumber();
    assert.isTrue(
      upReceived < grossUpDelta,
      `expected fee to reduce payout: received=${upReceived} gross=${grossUpDelta}`
    );
  });

  it("rejects swap when min_amount_out is not met (slippage protection)", async () => {
    let threw = false;
    try {
      await ammProgram.methods
        .swap({ down: {} }, new anchor.BN(1_000_000), new anchor.BN(1_000_000_000))
        .accounts({
          user: trader.publicKey,
          globalConfig: globalConfigPda,
          riskConfig: riskConfigPda,
          market: marketPda,
          ammPool: ammPoolPda,
          poolDownAccount,
          poolUpAccount,
          userDownAccount: traderDownAccount,
          userUpAccount: traderUpAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .preInstructions([LMSR_COMPUTE_UNITS])
        .signers([trader])
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected swap with unrealistic min_amount_out to revert");
  });

  it("remove_liquidity returns proportional DOWN/UP and burns LP tokens", async () => {
    const lpBefore = await getAccount(provider.connection, adminLpAccount);
    const lpAmount = new anchor.BN(lpBefore.amount.toString()).divn(4);

    const poolDownBefore = await getAccount(provider.connection, poolDownAccount);
    const poolUpBefore = await getAccount(provider.connection, poolUpAccount);
    const adminDownBefore = await getAccount(provider.connection, adminDownAccount);

    await ammProgram.methods
      .removeLiquidity(lpAmount)
      .accounts({
        user: admin.publicKey,
        market: marketPda,
        ammPool: ammPoolPda,
        lpMint: lpMint.publicKey,
        poolDownAccount,
        poolUpAccount,
        userDownAccount: adminDownAccount,
        userUpAccount: adminUpAccount,
        userLpAccount: adminLpAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const lpAfter = await getAccount(provider.connection, adminLpAccount);
    assert.equal(
      lpAfter.amount.toString(),
      (BigInt(lpBefore.amount.toString()) - BigInt(lpAmount.toString())).toString()
    );

    const adminDownAfter = await getAccount(provider.connection, adminDownAccount);
    assert.isTrue(
      Number(adminDownAfter.amount.toString()) >
        Number(adminDownBefore.amount.toString()),
      "LP should have received DOWN tokens back"
    );

    const poolDownAfter = await getAccount(provider.connection, poolDownAccount);
    const poolUpAfter = await getAccount(provider.connection, poolUpAccount);
    assert.isTrue(
      Number(poolDownAfter.amount.toString()) < Number(poolDownBefore.amount.toString())
    );
    assert.isTrue(
      Number(poolUpAfter.amount.toString()) < Number(poolUpBefore.amount.toString())
    );
  });
});
