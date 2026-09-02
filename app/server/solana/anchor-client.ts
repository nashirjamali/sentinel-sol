import "server-only";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, type Idl, type Wallet } from "@coral-xyz/anchor";
import { getConnection } from "@/server/solana/connection";
import marketIdl from "@/server/solana/idl/market.json";

/**
 * A no-op wallet, only so `AnchorProvider`'s constructor is satisfied — every read
 * (`program.account.<name>.all()` / `.fetch()`) only needs `provider.connection`, never
 * signing. If anything ever calls `signTransaction`, that's a bug (a write path leaking into
 * what should be a read-only service): fail loudly instead of silently doing nothing.
 */
const readOnlyWallet: Wallet = {
  publicKey: PublicKey.default,
  async signTransaction(): Promise<never> {
    throw new Error("readOnlyWallet cannot sign — this provider is for reads only");
  },
  async signAllTransactions(): Promise<never> {
    throw new Error("readOnlyWallet cannot sign — this provider is for reads only");
  },
  payer: undefined as never,
};

let marketProgram: Program | null = null;

/**
 * Read-only `market` program client. IDL spec 0.30+ embeds the program's own address
 * (`marketIdl.address`), so this doesn't need `PROGRAM_IDS.market` passed in separately —
 * but the two must still agree; see `programs.ts`'s own comment.
 */
export function getMarketProgram(): Program {
  if (!marketProgram) {
    const provider = new AnchorProvider(getConnection(), readOnlyWallet, {
      commitment: "confirmed",
    });
    marketProgram = new Program(marketIdl as Idl, provider);
  }
  return marketProgram;
}
