import "server-only";
import { Connection } from "@solana/web3.js";
import { env } from "@/server/lib/env";

/**
 * A single shared RPC connection per server process. Route handlers should
 * import `getConnection()`, never construct their own `Connection`.
 */
let connection: Connection | null = null;

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(env.solanaRpcUrl, "confirmed");
  }
  return connection;
}
