/**
 * Server-only environment access. Never import this from a Client Component —
 * it's a thin wrapper, not a secrets boundary, but keeping the import server-only
 * makes accidental client bundling fail loudly instead of leaking silently.
 */
import "server-only";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  solanaRpcUrl: required("SOLANA_RPC_URL", "https://api.devnet.solana.com"),
  solanaCluster: required("SOLANA_CLUSTER", "devnet"),
};
