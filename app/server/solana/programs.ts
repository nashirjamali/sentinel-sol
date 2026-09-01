import "server-only";
import { PublicKey } from "@solana/web3.js";

/**
 * Deployed program IDs. Kept in sync with `Anchor.toml` — that file is the
 * source of truth (per-cluster). This is the localnet set; devnet/mainnet
 * overrides should come from env vars once those deployments exist.
 */
export const PROGRAM_IDS = {
  config: new PublicKey("HczupjcktZTYtecWhmcCYnDnRM4KJRFZ23k9oSnSygku"),
  market: new PublicKey("9HXZJVGL4XwvKBWELccwWfj21Rv6JcA8wGiEZepfs6on"),
  amm: new PublicKey("rrajTt3BB1QP3avwnsfBCmjpR8EMgBSvKvDJhYHH1ip"),
  resolution: new PublicKey("HsGLymsSrMZhPwjT6xGCmbubUSP4e96HjTqdqRwej9uA"),
} as const;
