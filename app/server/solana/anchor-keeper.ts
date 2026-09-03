import "server-only";
import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import { AnchorProvider, Program, type Idl, type Wallet } from "@coral-xyz/anchor";
import { getConnection } from "@/server/solana/connection";
import resolutionIdl from "@/server/solana/idl/resolution.json";

/**
 * A minimal, self-contained `Wallet` implementation — deliberately NOT `new anchor.Wallet(kp)`.
 * Verified by hand (not just inferred from the build warning) that under Next.js's webpack
 * bundler in the RSC server runtime, `@coral-xyz/anchor`'s `Wallet` class resolves to
 * `undefined` at request time (`TypeError: ...Wallet is not a constructor`), even with a
 * namespace import — a real runtime bug, not a cosmetic build-time warning. The `Wallet`
 * interface itself is tiny, so implementing it directly sidesteps the bundler issue entirely
 * instead of fighting it.
 */
function keypairWallet(keypair: Keypair): Wallet {
  return {
    publicKey: keypair.publicKey,
    async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
      if (tx instanceof VersionedTransaction) {
        tx.sign([keypair]);
      } else {
        tx.partialSign(keypair);
      }
      return tx;
    },
    async signAllTransactions<T extends Transaction | VersionedTransaction>(
      txs: T[],
    ): Promise<T[]> {
      return Promise.all(txs.map((tx) => this.signTransaction(tx)));
    },
    payer: keypair,
  };
}

/**
 * The ONE place this backend signs anything server-side, and the ONE exception to the
 * "backend never holds a private key for a user action" rule — because `resolve_market` is
 * permissionless by protocol design (see programs/resolution/src/instructions/resolve_market.rs
 * — signer is `Signer<'info>` with no `has_one`/admin check), a compromised keeper key can only
 * ever do what any anonymous caller could already do, plus drain its own (intentionally small)
 * SOL balance. It can never move user funds — those still require the user's own wallet
 * signature on every mint/swap/redeem, built by tx-service.ts instead.
 *
 * `KEEPER_KEYPAIR_PATH` is a path to a Solana CLI-format JSON keypair file (relative to `app/`
 * or absolute). For devnet/production this MUST be a dedicated, low-balance keypair — never
 * the admin/deploy wallet — see the warning in `.env.local`.
 */
let resolutionProgram: Program | null = null;

function loadKeeperKeypair(): Keypair {
  const path = process.env.KEEPER_KEYPAIR_PATH;
  if (!path) {
    throw new Error(
      "Missing required environment variable: KEEPER_KEYPAIR_PATH (path to a keeper keypair JSON file)",
    );
  }
  const secretKey = JSON.parse(readFileSync(resolvePath(process.cwd(), path), "utf-8"));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

export function getResolutionProgramWithKeeper(): Program {
  if (!resolutionProgram) {
    const keeper = loadKeeperKeypair();
    const provider = new AnchorProvider(getConnection(), keypairWallet(keeper), {
      commitment: "confirmed",
    });
    resolutionProgram = new Program(resolutionIdl as Idl, provider);
  }
  return resolutionProgram;
}
