import "server-only";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { getConnection } from "@/server/solana/connection";

/**
 * Assembles one or more instructions into an unsigned, base64-encoded transaction for the
 * frontend to hand to the connected wallet for signing (`signAndSendTransaction`). The backend
 * never signs this — see the security rule in docs/libs/API.md's REST API section.
 */
export async function buildUnsignedTransaction(
  feePayer: PublicKey,
  instructions: TransactionInstruction[],
): Promise<string> {
  const connection = getConnection();
  const { blockhash } = await connection.getLatestBlockhash("confirmed");

  const tx = new Transaction({ feePayer, recentBlockhash: blockhash });
  tx.add(...instructions);

  return tx
    .serialize({ requireAllSignatures: false, verifySignatures: false })
    .toString("base64");
}
