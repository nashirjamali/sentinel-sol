import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("config", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Config as Program;

  const admin = provider.wallet as anchor.Wallet;
  const newAdmin = Keypair.generate();
  const stranger = Keypair.generate();

  const [globalConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );

  const assetFeedId = Keypair.generate().publicKey;
  const [riskConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("risk"), assetFeedId.toBuffer()],
    program.programId
  );

  async function airdrop(pubkey: PublicKey) {
    const sig = await provider.connection.requestAirdrop(
      pubkey,
      2_000_000_000
    );
    const latest = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature: sig,
      ...latest,
    });
  }

  before(async () => {
    await airdrop(newAdmin.publicKey);
    await airdrop(stranger.publicKey);
  });

  it("initializes GlobalConfig", async () => {
    // Other test files (e.g. amm.ts, market.ts) share this GlobalConfig singleton within the
    // same validator session and may have already initialized it, depending on mocha file
    // ordering.
    const existing = await provider.connection.getAccountInfo(globalConfigPda);
    if (!existing) {
      await program.methods
        .initializeConfig(admin.publicKey)
        .accounts({
          payer: admin.publicKey,
          globalConfig: globalConfigPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    }

    const cfg = await program.account.globalConfig.fetch(globalConfigPda);
    assert.isTrue(cfg.admin.equals(admin.publicKey));
    assert.isNull(cfg.pendingAdmin);
    assert.isFalse(cfg.paused);
  });

  it("rejects set_paused from a non-admin signer", async () => {
    let threw = false;
    try {
      await program.methods
        .setPaused(true)
        .accounts({
          globalConfig: globalConfigPda,
          admin: stranger.publicKey,
        })
        .signers([stranger])
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected set_paused from stranger to revert");
  });

  it("admin can set_paused", async () => {
    await program.methods
      .setPaused(true)
      .accounts({
        globalConfig: globalConfigPda,
        admin: admin.publicKey,
      })
      .rpc();
    let cfg = await program.account.globalConfig.fetch(globalConfigPda);
    assert.isTrue(cfg.paused);

    await program.methods
      .setPaused(false)
      .accounts({
        globalConfig: globalConfigPda,
        admin: admin.publicKey,
      })
      .rpc();
    cfg = await program.account.globalConfig.fetch(globalConfigPda);
    assert.isFalse(cfg.paused);
  });

  it("upserts a RiskConfig for an asset", async () => {
    await program.methods
      .upsertRiskConfig(assetFeedId, new anchor.BN(60), 100, new anchor.BN(300), new anchor.BN(1_000_000), true)
      .accounts({
        admin: admin.publicKey,
        globalConfig: globalConfigPda,
        riskConfig: riskConfigPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const risk = await program.account.riskConfig.fetch(riskConfigPda);
    assert.isTrue(risk.assetFeedId.equals(assetFeedId));
    assert.equal(risk.maxStalenessSecs.toNumber(), 60);
    assert.equal(risk.maxConfidenceBps, 100);
    assert.equal(risk.tradingHaltSecs.toNumber(), 300);
    assert.isTrue(risk.enabled);
  });

  it("rejects upsert_risk_config with invalid params", async () => {
    let threw = false;
    try {
      await program.methods
        .upsertRiskConfig(assetFeedId, new anchor.BN(60), 20_000, new anchor.BN(300), new anchor.BN(1_000_000), true)
        .accounts({
          admin: admin.publicKey,
          globalConfig: globalConfigPda,
          riskConfig: riskConfigPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected max_confidence_bps > 10_000 to revert");
  });

  it("rejects upsert_risk_config from a non-admin signer", async () => {
    let threw = false;
    try {
      await program.methods
        .upsertRiskConfig(assetFeedId, new anchor.BN(60), 100, new anchor.BN(300), new anchor.BN(1_000_000), true)
        .accounts({
          admin: stranger.publicKey,
          globalConfig: globalConfigPda,
          riskConfig: riskConfigPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([stranger])
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected upsert_risk_config from stranger to revert");
  });

  it("performs a two-step admin transfer", async () => {
    await program.methods
      .setPendingAdmin(newAdmin.publicKey)
      .accounts({
        globalConfig: globalConfigPda,
        admin: admin.publicKey,
      })
      .rpc();

    let cfg = await program.account.globalConfig.fetch(globalConfigPda);
    assert.isTrue(cfg.pendingAdmin.equals(newAdmin.publicKey));

    // wrong signer cannot accept
    let threw = false;
    try {
      await program.methods
        .acceptAdmin()
        .accounts({
          globalConfig: globalConfigPda,
          pendingAdmin: stranger.publicKey,
        })
        .signers([stranger])
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "expected accept_admin from wrong signer to revert");

    await program.methods
      .acceptAdmin()
      .accounts({
        globalConfig: globalConfigPda,
        pendingAdmin: newAdmin.publicKey,
      })
      .signers([newAdmin])
      .rpc();

    cfg = await program.account.globalConfig.fetch(globalConfigPda);
    assert.isTrue(cfg.admin.equals(newAdmin.publicKey));
    assert.isNull(cfg.pendingAdmin);
  });

  it("rejects set_pending_admin from the old (no longer current) admin", async () => {
    let threw = false;
    try {
      await program.methods
        .setPendingAdmin(admin.publicKey)
        .accounts({
          globalConfig: globalConfigPda,
          admin: admin.publicKey,
        })
        .rpc();
    } catch (e) {
      threw = true;
    }
    assert.isTrue(threw, "old admin should no longer be authorized");
  });

  after(async () => {
    // Other test files (e.g. market.ts) share this GlobalConfig singleton within the same
    // validator session and expect the original provider wallet to remain admin.
    await program.methods
      .setPendingAdmin(admin.publicKey)
      .accounts({
        globalConfig: globalConfigPda,
        admin: newAdmin.publicKey,
      })
      .signers([newAdmin])
      .rpc();
    await program.methods
      .acceptAdmin()
      .accounts({
        globalConfig: globalConfigPda,
        pendingAdmin: admin.publicKey,
      })
      .rpc();
  });
});
