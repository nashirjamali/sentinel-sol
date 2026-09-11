import "server-only";
import { Connection } from "@solana/web3.js";
import { env } from "@/server/lib/env";

export type SolanaCluster = "devnet" | "mainnet";

const connections = new Map<string, Connection>();

export function getConnection(): Connection {
  return getClusterConnection(env.solanaCluster === "mainnet" ? "mainnet" : "devnet");
}

export function getClusterConnection(cluster: SolanaCluster): Connection {
  const url = cluster === "mainnet" ? env.solanaMainnetRpcUrl : env.solanaRpcUrl;
  const existing = connections.get(url);
  if (existing) return existing;
  const next = new Connection(url, "confirmed");
  connections.set(url, next);
  return next;
}
