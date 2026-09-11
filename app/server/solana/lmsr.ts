import "server-only";

/**
 * LMSR marginal price, ported from `programs/amm/src/lmsr.rs::price_down` — but in plain JS
 * floating point, not the on-chain fixed-point WAD implementation.
 *
 * This is deliberate, not a shortcut: the "never use floating point" rule in
 * `docs/libs/PROGRAM_SPEC.md` applies to the *on-chain* program, where every validator must
 * compute byte-identical results for consensus. This function only ever produces a
 * **display-only estimate** for the API response — nothing here is used to settle a trade or
 * move real funds (that still happens on-chain, in the actual `swap` instruction, using the
 * real fixed-point math). A few ULPs of floating-point imprecision here has zero on-chain
 * consequence.
 *
 * Numerically stable (log-sum-exp trick: subtract the max exponent before calling `Math.exp`)
 * so it doesn't overflow to `Infinity` the way a naive `exp(qDown/b) / (exp(qDown/b) +
 * exp(qUp/b))` would for large `q/b`.
 */
export function priceDown(qDown: number, qUp: number, b: number): number {
  const xDown = qDown / b;
  const xUp = qUp / b;
  const m = Math.max(xDown, xUp);
  const eDown = Math.exp(xDown - m);
  const eUp = Math.exp(xUp - m);
  return eDown / (eDown + eUp);
}

export function priceUp(qDown: number, qUp: number, b: number): number {
  return 1 - priceDown(qDown, qUp, b);
}
