# M3 — amm_program

**Status:** implemented
**Phase:** 1 (MVP)
**Depends on:** M2 — market_program

## What

Fixed-point LMSR pricing as a pure, Solana-runtime-free module, plus `init_pool`,
`add_liquidity`, `remove_liquidity`, `swap` per `docs/libs/PROGRAM_SPEC.md` §3.

## Why

This is the pricing/liquidity layer underwriting happens through in the MVP (there is no
separate Underwriting Vault — see `docs/product/planned/phase-2.md`). The LMSR math is the
easiest part of the system to get wrong, so it's unit-tested independent of the instructions
that call it.

## Scope

- [x] Implement the fixed-point LMSR math as a module separate from the instructions (unit-
      tested with no Solana runtime at all).
- [x] `init_pool`, `add_liquidity`, `remove_liquidity`, `swap` per `docs/libs/PROGRAM_SPEC.md` §3.
- [x] Test bounded loss: simulate repeated one-directional swaps and prove the pool never
      releases more than the theoretical LMSR bound for the `b` in use.
- [x] Test slippage protection (`min_amount_out`) and correct fee deduction.

## Test coverage

`tests/amm.ts` — bounded-loss simulation against the theoretical LMSR bound, satisfying the
**LMSR bounded loss** invariant in `CLAUDE.md` (including that `b` is rejected if changed after
`init_pool`), plus slippage/fee tests.

## References

- `docs/libs/PROGRAM_SPEC.md` §3
- `CLAUDE.md` — "LMSR bounded loss"
