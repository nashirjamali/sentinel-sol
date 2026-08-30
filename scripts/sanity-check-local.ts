// One-shot manual sanity check against a persistent local validator with the 4 programs
// already deployed via `anchor deploy`. Not part of the automated test suite — run manually:
//   npx ts-node scripts/sanity-check-local.ts
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const configProgram = anchor.workspace.Config as anchor.Program;
  const admin = provider.wallet as anchor.Wallet;

  const [globalConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    configProgram.programId
  );

  const existing = await provider.connection.getAccountInfo(globalConfigPda);
  if (existing) {
    console.log("GlobalConfig already initialized at", globalConfigPda.toBase58());
  } else {
    await configProgram.methods
      .initializeConfig(admin.publicKey)
      .accounts({
        payer: admin.publicKey,
        globalConfig: globalConfigPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Initialized GlobalConfig at", globalConfigPda.toBase58());
  }

  const cfg = await (configProgram.account as any).globalConfig.fetch(globalConfigPda);
  console.log("GlobalConfig:", {
    admin: cfg.admin.toBase58(),
    paused: cfg.paused,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
