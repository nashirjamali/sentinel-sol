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

describe("market", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const configProgram = anchor.workspace.Config as Program;
  const marketProgram = anchor.workspace.Market as Program;

  const admin = provider.wallet as anchor.Wallet;
  const user = Keypair.generate();

  const assetFeedId = Keypair.generate().publicKey;
  const strikePrice = new anchor.BN(50_000_00000000);
  let expiryTs: anchor.BN;

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
  let userUsdcAccount: PublicKey;
  let userDownAccount: PublicKey;
  let userUpAccount: PublicKey;

  async function onchainUnixTime(): Promise<number> {
    const info = await provider.connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
    // Clock layout: slot(8) + epoch_start_timestamp(8) + epoch(8) + leader_schedule_epoch(8) + unix_timestamp(8)
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
      1_000_000_000 // 1000 USDC
    );

    // config: initialize (idempotent across test files sharing one validator) + risk config
    // with a short trading halt so tests run fast.
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
        new anchor.BN(3), // trading_halt_secs = 3s, so we can cross it quickly in a test
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

    const now = await onchainUnixTime();
    expiryTs = new anchor.BN(now + 20); // expiry is 20s out, halt kicks in 3s before that

    const [marketAddr] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        assetFeedId.toBuffer(),
        strikePrice.toArrayLike(Buffer, "le", 8),
        expiryTs.toArrayLike(Buffer, "le", 8),
      ],
      marketProgram.programId
    );
    marketPda = marketAddr;

    const [vaultAddr] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), marketPda.toBuffer()],
      marketProgram.programId
    );
    vaultAuthorityPda = vaultAddr;

    downMint = Keypair.generate();
    upMint = Keypair.generate();
    collateralTokenAccount = getAssociatedTokenAddressSync(
      usdcMint,
      vaultAuthorityPda,
      true
    );
    userDownAccount = getAssociatedTokenAddressSync(
      downMint.publicKey,
      user.publicKey
    );
    userUpAccount = getAssociatedTokenAddressSync(
      upMint.publicKey,
      user.publicKey
    );
  });

  it("creates a market", async () => {
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

    const market = await marketProgram.account.market.fetch(marketPda);
    assert.equal(market.totalCollateral.toNumber(), 0);
    assert.deepEqual(market.status, { active: {} });
  });

  it("rejects create_market when RiskConfig is disabled", async () => {
    const otherFeed = Keypair.generate().publicKey;
    const [disabledRiskPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("risk"), otherFeed.toBuffer()],
      configProgram.programId
    );
    await configProgram.methods
      .upsertRiskConfig(
        otherFeed,
        new anchor.BN(60),
        100,
        new anchor.BN(300),
        new anchor.BN(1_000_000),
        false // disabled
      )
      .accounts({
        admin: admin.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: disabledRiskPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const otherStrike = new anchor.BN(1000_00000000);
    const otherExpiry = new anchor.BN(Math.floor(Date.now() / 1000) + 1000);
    const [otherMarketPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        otherFeed.toBuffer(),
        otherStrike.toArrayLike(Buffer, "le", 8),
        otherExpiry.toArrayLike(Buffer, "le", 8),
      ],
      marketProgram.programId
    );
    const [otherVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), otherMarketPda.toBuffer()],
      marketProgram.programId
    );
    const otherDownMint = Keypair.generate();
    const otherUpMint = Keypair.generate();
    const otherCollateral = getAssociatedTokenAddressSync(
      usdcMint,
      otherVaultPda,
      true
    );

    let threw = false;
    try {
      await marketProgram.methods
        .createMarket(otherFeed, otherStrike, otherExpiry)
        .accounts({
          admin: admin.publicKey,
          globalConfig: globalConfigPda,
          riskConfig: disabledRiskPda,
          market: otherMarketPda,
          vaultAuthority: otherVaultPda,
          downMint: otherDownMint.publicKey,
          upMint: otherUpMint.publicKey,
          usdcMint: usdcMint,
          collateralTokenAccount: otherCollateral,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([otherDownMint, otherUpMint])
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected create_market with disabled RiskConfig to revert");
  });

  it("mint_complete_set preserves the 1:1 collateral invariant", async () => {
    const amount = new anchor.BN(100_000_000); // 100 USDC

    await marketProgram.methods
      .mintCompleteSet(amount)
      .accounts({
        user: user.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: marketPda,
        vaultAuthority: vaultAuthorityPda,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        collateralTokenAccount: collateralTokenAccount,
        userUsdcAccount: userUsdcAccount,
        userDownAccount: userDownAccount,
        userUpAccount: userUpAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const vault = await getAccount(provider.connection, collateralTokenAccount);
    const down = await getAccount(provider.connection, userDownAccount);
    const up = await getAccount(provider.connection, userUpAccount);
    const market = await marketProgram.account.market.fetch(marketPda);

    assert.equal(vault.amount.toString(), amount.toString());
    assert.equal(down.amount.toString(), amount.toString());
    assert.equal(up.amount.toString(), amount.toString());
    assert.equal(market.totalCollateral.toString(), amount.toString());
  });

  it("merge_complete_set preserves the 1:1 collateral invariant after mint -> merge -> mint", async () => {
    const mergeAmount = new anchor.BN(40_000_000);

    await marketProgram.methods
      .mergeCompleteSet(mergeAmount)
      .accounts({
        user: user.publicKey,
        market: marketPda,
        vaultAuthority: vaultAuthorityPda,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        collateralTokenAccount: collateralTokenAccount,
        userUsdcAccount: userUsdcAccount,
        userDownAccount: userDownAccount,
        userUpAccount: userUpAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    let vault = await getAccount(provider.connection, collateralTokenAccount);
    let down = await getAccount(provider.connection, userDownAccount);
    let up = await getAccount(provider.connection, userUpAccount);
    let market = await marketProgram.account.market.fetch(marketPda);

    assert.equal(vault.amount.toString(), "60000000");
    assert.equal(down.amount.toString(), "60000000");
    assert.equal(up.amount.toString(), "60000000");
    assert.equal(market.totalCollateral.toString(), "60000000");

    const mintAgain = new anchor.BN(10_000_000);
    await marketProgram.methods
      .mintCompleteSet(mintAgain)
      .accounts({
        user: user.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: marketPda,
        vaultAuthority: vaultAuthorityPda,
        downMint: downMint.publicKey,
        upMint: upMint.publicKey,
        collateralTokenAccount: collateralTokenAccount,
        userUsdcAccount: userUsdcAccount,
        userDownAccount: userDownAccount,
        userUpAccount: userUpAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    vault = await getAccount(provider.connection, collateralTokenAccount);
    down = await getAccount(provider.connection, userDownAccount);
    up = await getAccount(provider.connection, userUpAccount);
    market = await marketProgram.account.market.fetch(marketPda);

    assert.equal(vault.amount.toString(), "70000000");
    assert.equal(down.amount.toString(), "70000000");
    assert.equal(up.amount.toString(), "70000000");
    assert.equal(market.totalCollateral.toString(), "70000000");
  });

  it("rejects mint_complete_set once inside trading_halt_secs", async function () {
    this.timeout(650_000);
    // The local test validator's on-chain clock can run noticeably (and inconsistently) behind
    // wall time. Rather than guess a fixed real-time delay, measure the current onchain-time
    // advance rate live and size the wait to it, with a generous safety factor.
    const sampleStart = await onchainUnixTime();
    await new Promise((r) => setTimeout(r, 4000));
    const sampleEnd = await onchainUnixTime();
    const observedRate = Math.max((sampleEnd - sampleStart) / 4, 0.02); // onchain-sec per real-sec, floored

    const haltSecs = 1;
    await configProgram.methods
      .upsertRiskConfig(
        assetFeedId,
        new anchor.BN(60),
        100,
        new anchor.BN(haltSecs),
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
    // Need the clock to cross `onchainNow + margin` in onchain time; at `observedRate`
    // onchain-seconds per real-second, that takes margin/observedRate real seconds. Use a
    // small onchain margin (cheap to create the market for) and lean on the measured rate for
    // the real-time budget, capped well under the mocha timeout above.
    const margin = 3;
    const shortExpiry = new anchor.BN(onchainNow + haltSecs + margin);
    const haltBoundary = onchainNow + margin;
    // Budget 4x the naive estimate for real-time drift/jitter, with a floor so a fast clock
    // doesn't get an unreasonably short deadline.
    const deadlineMs = Date.now() + Math.max((margin / observedRate) * 1000 * 4, 15_000);

    const [shortMarketPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        assetFeedId.toBuffer(),
        strikePrice.toArrayLike(Buffer, "le", 8),
        shortExpiry.toArrayLike(Buffer, "le", 8),
      ],
      marketProgram.programId
    );
    const [shortVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), shortMarketPda.toBuffer()],
      marketProgram.programId
    );
    const shortDownMint = Keypair.generate();
    const shortUpMint = Keypair.generate();
    const shortCollateral = getAssociatedTokenAddressSync(
      usdcMint,
      shortVaultPda,
      true
    );

    await marketProgram.methods
      .createMarket(assetFeedId, strikePrice, shortExpiry)
      .accounts({
        admin: admin.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        market: shortMarketPda,
        vaultAuthority: shortVaultPda,
        downMint: shortDownMint.publicKey,
        upMint: shortUpMint.publicKey,
        usdcMint: usdcMint,
        collateralTokenAccount: shortCollateral,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([shortDownMint, shortUpMint])
      .rpc();

    let clockNow = await onchainUnixTime();
    while (clockNow < haltBoundary) {
      if (Date.now() > deadlineMs) {
        throw new Error(
          `on-chain clock did not reach haltBoundary=${haltBoundary} in time (stuck at ${clockNow}, observedRate=${observedRate})`
        );
      }
      await new Promise((r) => setTimeout(r, 500));
      clockNow = await onchainUnixTime();
    }

    const shortUserDown = getAssociatedTokenAddressSync(
      shortDownMint.publicKey,
      user.publicKey
    );
    const shortUserUp = getAssociatedTokenAddressSync(
      shortUpMint.publicKey,
      user.publicKey
    );

    let threw = false;
    try {
      await marketProgram.methods
        .mintCompleteSet(new anchor.BN(1_000_000))
        .accounts({
          user: user.publicKey,
          globalConfig: globalConfigPda,
          riskConfig: riskConfigPda,
          market: shortMarketPda,
          vaultAuthority: shortVaultPda,
          downMint: shortDownMint.publicKey,
          upMint: shortUpMint.publicKey,
          collateralTokenAccount: shortCollateral,
          userUsdcAccount: userUsdcAccount,
          userDownAccount: shortUserDown,
          userUpAccount: shortUserUp,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected mint_complete_set inside trading_halt_secs to revert");
  });
});
