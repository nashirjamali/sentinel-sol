# M2 — market_program

**Status:** implemented
**Phase:** 1 (MVP)
**Depends on:** M1 — config_program

## What

`create_market`, `mint_complete_set`, `merge_complete_set`, and `redeem`, per
`docs/libs/PROGRAM_SPEC.md` §2 — the collateral vault and DOWN/UP complete-set mechanics.

## Why

This is where the **1:1 collateral** and **no one-sided minting** invariants from `CLAUDE.md`
are enforced; every downstream program (`amm`, `resolution`) depends on these mints existing
correctly.

## Scope

- [x] `create_market`, `mint_complete_set`, `merge_complete_set`, `redeem` per
      `docs/libs/PROGRAM_SPEC.md` §2.
- [x] Test the 1:1 collateral invariant after a mint → merge → mint sequence.
- [x] Test `create_market` is rejected when `RiskConfig` for that asset is missing/disabled.
- [x] Test `mint_complete_set` is rejected once inside `trading_halt_secs`.

## Test coverage

`tests/market.ts` — proves the 1:1 collateral invariant across mint → merge → mint, and the
trading-halt / disabled-asset rejection paths.

## References

- `docs/libs/PROGRAM_SPEC.md` §2
- `CLAUDE.md` — "1:1 collateral", "No one-sided minting"
