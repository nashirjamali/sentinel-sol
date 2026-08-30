import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  ComputeBudgetProgram,
} from "@solana/web3.js";

// swap/add_liquidity evaluate the LMSR cost function and can exceed Solana's default 200_000 CU
// transaction budget, so callers must request a higher limit — a client-side requirement, not a
// workaround for a bug. See tests/amm.ts for the same note.
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

// Full localnet scenario per docs/IMPLEMENTATION_PLAN.md M5: create_market -> mint_complete_set
// -> add_liquidity -> several swaps from different traders -> cross into the trading-halt
// window -> attempt a mint (must fail) -> cross expiry -> resolve_market with a (simulated)
// Pyth price -> redeem succeeds on the winning side, fails on the losing side.
describe("end-to-end scenario", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const configProgram = anchor.workspace.Config as Program;
  const marketProgram = anchor.workspace.Market as Program;
  const ammProgram = anchor.workspace.Amm as Program;
  const resolutionProgram = anchor.workspace.Resolution as Program;

  const admin = provider.wallet as anchor.Wallet;
  const lp = admin;
  const traderA = Keypair.generate();
  const traderB = Keypair.generate();

  // Same feed_id fixture used by resolution.ts's VALID_UP (32 bytes of 0x07), price
  // 3100.00000000 at expo -8. This test uses its own market (distinct strike) so it doesn't
  // collide with markets created by other test files sharing this feed_id.
  const assetFeedId = new PublicKey(Buffer.alloc(32, 7));
  const VALID_UP = new PublicKey("7GcbJLYdV6FiSbbZCFB1qfLSVAJmFW7dk5hrDiP4a3fz");
  const strikePrice = new anchor.BN(2_000_00000000); // well below the 3100 fixture price -> Up

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
  let marketPda: PublicKey;
  let vaultAuthorityPda: PublicKey;
  let downMint: Keypair;
  let upMint: Keypair;
  let collateralTokenAccount: PublicKey;
  let expiryTs: anchor.BN;

  let ammPoolPda: PublicKey;
  let lpMint: Keypair;
  let poolDownAccount: PublicKey;
  let poolUpAccount: PublicKey;

  const HALT_SECS = 3;
  const B = new anchor.BN(1_000_000_000);
  const FEE_BPS = 30;

  async function onchainUnixTime(): Promise<number> {
    const info = await provider.connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
    return Number(info.data.readBigInt64LE(8 + 8 + 8 + 8));
  }

  async function airdrop(pubkey: PublicKey, lamports = 2_000_000_000) {
    const sig = await provider.connection.requestAirdrop(pubkey, lamports);
    const latest = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({ signature: sig, ...latest });
  }

  async function waitUntilOnchain(targetTs: number, label: string) {
    const sampleStart = await onchainUnixTime();
    await new Promise((r) => setTimeout(r, 3000));
    const sampleEnd = await onchainUnixTime();
    const rate = Math.max((sampleEnd - sampleStart) / 3, 0.02);

    const now = await onchainUnixTime();
    const remaining = Math.max(targetTs - now, 0);
    const deadlineMs = Date.now() + Math.max((remaining / rate) * 1000 * 8, 20_000);

    let clockNow = await onchainUnixTime();
    while (clockNow < targetTs) {
      if (Date.now() > deadlineMs) {
        throw new Error(`[${label}] on-chain clock stuck at ${clockNow}, needed ${targetTs}`);
      }
      await new Promise((r) => setTimeout(r, 500));
      clockNow = await onchainUnixTime();
    }
  }

  async function mintCompleteSetFor(trader: Keypair, traderUsdcAccount: PublicKey, amount: number) {
    const traderDown = getAssociatedTokenAddressSync(downMint.publicKey, trader.publicKey);
    const traderUp = getAssociatedTokenAddressSync(upMint.publicKey, trader.publicKey);
    await marketProgram.methods
      .mintCompleteSet(new anchor.BN(amount))
      .accounts({
        user: trader.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: marketPda,
        vaultAuthority: vaultAuthorityPda,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        collateralTokenAccount,
        userUsdcAccount: traderUsdcAccount,
        userDownAccount: traderDown,
        userUpAccount: traderUp,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([trader])
      .rpc();
    return { traderDown, traderUp };
  }

  it("runs the full protect -> trade -> halt -> expire -> resolve -> redeem lifecycle", async function () {
    this.timeout(650_000);

    await airdrop(traderA.publicKey);
    await airdrop(traderB.publicKey);

    usdcMint = await createMint(provider.connection, admin.payer, admin.publicKey, null, 6);

    const traderAUsdc = await createAssociatedTokenAccount(
      provider.connection,
      traderA,
      usdcMint,
      traderA.publicKey
    );
    const traderBUsdc = await createAssociatedTokenAccount(
      provider.connection,
      traderB,
      usdcMint,
      traderB.publicKey
    );
    const adminUsdc = await createAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      usdcMint,
      admin.publicKey
    );
    for (const acc of [traderAUsdc, traderBUsdc, adminUsdc]) {
      await mintTo(provider.connection, admin.payer, usdcMint, acc, admin.payer, 1_000_000_000);
    }

    // --- config ---
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
    await configProgram.methods
      .upsertRiskConfig(
        assetFeedId,
        new anchor.BN(1_000_000_000), // staleness bypassed for this simulated-price scenario
        100,
        new anchor.BN(HALT_SECS),
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

    // --- create_market ---
    const onchainNow = await onchainUnixTime();
    expiryTs = new anchor.BN(onchainNow + HALT_SECS + 6);

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
    collateralTokenAccount = getAssociatedTokenAddressSync(usdcMint, vaultAuthorityPda, true);

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

    // --- mint_complete_set (LP + two traders "protect" against price moves) ---
    await mintCompleteSetFor(admin.payer, adminUsdc, 500_000_000);
    const { traderDown: aDown, traderUp: aUp } = await mintCompleteSetFor(
      traderA,
      traderAUsdc,
      100_000_000
    );
    const { traderDown: bDown, traderUp: bUp } = await mintCompleteSetFor(
      traderB,
      traderBUsdc,
      100_000_000
    );

    // --- init_pool + add_liquidity ---
    [ammPoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("amm"), marketPda.toBuffer()],
      ammProgram.programId
    );
    lpMint = Keypair.generate();
    poolDownAccount = getAssociatedTokenAddressSync(downMint.publicKey, ammPoolPda, true);
    poolUpAccount = getAssociatedTokenAddressSync(upMint.publicKey, ammPoolPda, true);
    const adminLpAccount = getAssociatedTokenAddressSync(lpMint.publicKey, admin.publicKey);
    const adminDown = getAssociatedTokenAddressSync(downMint.publicKey, admin.publicKey);
    const adminUp = getAssociatedTokenAddressSync(upMint.publicKey, admin.publicKey);

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

    await ammProgram.methods
      .addLiquidity(new anchor.BN(300_000_000), new anchor.BN(300_000_000))
      .accounts({
        user: admin.publicKey,
        market: marketPda,
        ammPool: ammPoolPda,
        lpMint: lpMint.publicKey,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        poolDownAccount,
        poolUpAccount,
        userDownAccount: adminDown,
        userUpAccount: adminUp,
        userLpAccount: adminLpAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .preInstructions([LMSR_COMPUTE_UNITS])
      .rpc();

    // --- several swaps from different traders ---
    await ammProgram.methods
      .swap({ down: {} }, new anchor.BN(20_000_000), new anchor.BN(1))
      .accounts({
        user: traderA.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: marketPda,
        ammPool: ammPoolPda,
        poolDownAccount,
        poolUpAccount,
        userDownAccount: aDown,
        userUpAccount: aUp,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions([LMSR_COMPUTE_UNITS])
      .signers([traderA])
      .rpc();

    await ammProgram.methods
      .swap({ up: {} }, new anchor.BN(15_000_000), new anchor.BN(1))
      .accounts({
        user: traderB.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: marketPda,
        ammPool: ammPoolPda,
        poolDownAccount,
        poolUpAccount,
        userDownAccount: bDown,
        userUpAccount: bUp,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions([LMSR_COMPUTE_UNITS])
      .signers([traderB])
      .rpc();

    await ammProgram.methods
      .swap({ down: {} }, new anchor.BN(5_000_000), new anchor.BN(1))
      .accounts({
        user: traderA.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: marketPda,
        ammPool: ammPoolPda,
        poolDownAccount,
        poolUpAccount,
        userDownAccount: aDown,
        userUpAccount: aUp,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions([LMSR_COMPUTE_UNITS])
      .signers([traderA])
      .rpc();

    const poolAfterSwaps = await ammProgram.account.ammPool.fetch(ammPoolPda);
    assert.notEqual(poolAfterSwaps.qDown.toNumber(), 0, "swaps should have moved q_down");

    // --- cross into the trading-halt window; a new mint must now fail ---
    await waitUntilOnchain(expiryTs.toNumber() - HALT_SECS + 1, "enter-halt-window");

    let mintDuringHaltThrew = false;
    try {
      await mintCompleteSetFor(traderA, traderAUsdc, 1_000_000);
    } catch (e) {
      mintDuringHaltThrew = true;
    }
    assert.isTrue(mintDuringHaltThrew, "expected mint_complete_set to fail inside the halt window");

    // A swap must also fail inside the halt window.
    let swapDuringHaltThrew = false;
    try {
      await ammProgram.methods
        .swap({ down: {} }, new anchor.BN(1_000_000), new anchor.BN(1))
        .accounts({
          user: traderA.publicKey,
          globalConfig: globalConfigPda,
          riskConfig: riskConfigPda,
          market: marketPda,
          ammPool: ammPoolPda,
          poolDownAccount,
          poolUpAccount,
          userDownAccount: aDown,
          userUpAccount: aUp,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([traderA])
        .rpc();
    } catch (e) {
      swapDuringHaltThrew = true;
    }
    assert.isTrue(swapDuringHaltThrew, "expected swap to fail inside the halt window");

    // --- cross expiry ---
    await waitUntilOnchain(expiryTs.toNumber(), "reach-expiry");

    // --- resolve_market with a simulated Pyth price (fixture: 3100.00000000 > strike 2000) ---
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

    // --- redeem: winning (UP) side succeeds ---
    const usdcBefore = await getAccount(provider.connection, traderAUsdc);
    const upBefore = await getAccount(provider.connection, aUp);
    const redeemAmount = Number(upBefore.amount.toString());
    assert.isTrue(redeemAmount > 0, "traderA should hold UP tokens to redeem");

    await marketProgram.methods
      .redeem(new anchor.BN(redeemAmount))
      .accounts({
        user: traderA.publicKey,
        market: marketPda,
        vaultAuthority: vaultAuthorityPda,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        collateralTokenAccount,
        userUsdcAccount: traderAUsdc,
        userDownAccount: aDown,
        userUpAccount: aUp,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions([LMSR_COMPUTE_UNITS])
      .signers([traderA])
      .rpc();

    const usdcAfter = await getAccount(provider.connection, traderAUsdc);
    const upAfter = await getAccount(provider.connection, aUp);
    assert.equal(
      (BigInt(usdcAfter.amount.toString()) - BigInt(usdcBefore.amount.toString())).toString(),
      redeemAmount.toString()
    );
    assert.equal(upAfter.amount.toString(), "0");

    // --- redeem: losing (DOWN) side cannot be redeemed for value ---
    const downBefore = await getAccount(provider.connection, aDown);
    assert.isTrue(
      Number(downBefore.amount.toString()) > 0,
      "traderA should still be holding worthless DOWN tokens"
    );

    let losingRedeemThrew = false;
    try {
      await marketProgram.methods
        .redeem(new anchor.BN(Number(downBefore.amount.toString())))
        .accounts({
          user: traderA.publicKey,
          market: marketPda,
          vaultAuthority: vaultAuthorityPda,
          downMint: downMint.publicKey,
          upMint: upMint.publicKey,
          collateralTokenAccount,
          userUsdcAccount: traderAUsdc,
          userDownAccount: aDown,
          userUpAccount: aUp,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([traderA])
        .rpc();
    } catch (e) {
      losingRedeemThrew = true;
    }
    assert.isTrue(
      losingRedeemThrew,
      "redeem should not pay out against the losing (DOWN) balance once outcome=Up"
    );

    // DOWN balance is untouched — it's simply worthless, never force-burned.
    const downAfter = await getAccount(provider.connection, aDown);
    assert.equal(downAfter.amount.toString(), downBefore.amount.toString());
  });
});
