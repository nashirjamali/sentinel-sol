/**
 * Mirrors `AmmPool` in `programs/amm/src/state.rs`, plus two derived fields (`priceDown`/
 * `priceUp`) that don't exist on-chain — they're computed from `qDown`/`qUp`/`b` via
 * `server/solana/lmsr.ts` so the frontend doesn't have to reimplement the LMSR formula itself.
 */
export type Pool = {
  address: string;
  market: string;
  b: string;
  /** LMSR's internal "net sold to traders" counters — NOT token balances, see lpSupply/pool*Balance below for those. */
  qDown: string;
  qUp: string;
  feeBps: number;
  lpMint: string;
  /** Total LP tokens minted so far. With `poolDownBalance`/`poolUpBalance`, enough to compute
   *  a wallet's % share of the pool, or preview a `remove_liquidity` payout, client-side. */
  lpSupply: string;
  /** The pool's actual DOWN/UP token account balances (what `remove_liquidity` pays out from —
   *  distinct from `qDown`/`qUp`, which are LMSR pricing counters, not balances). */
  poolDownBalance: string;
  poolUpBalance: string;
  /** Current marginal price of DOWN, in [0, 1] — display-only, see lmsr.ts. */
  priceDown: number;
  /** Current marginal price of UP, in [0, 1]. Always `1 - priceDown`. */
  priceUp: number;
};
