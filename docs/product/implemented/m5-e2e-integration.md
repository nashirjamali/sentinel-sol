# M5 — End-to-end integration

**Status:** implemented on localnet; devnet repeat outstanding
**Phase:** 1 (MVP)
**Depends on:** M1–M4

## What

A full localnet scenario chaining every program together: create_market → mint_complete_set →
add_liquidity → several swaps from different "traders" → cross into the trading-halt window →
attempt a mint (must fail) → cross expiry → resolve_market with a simulated Pyth price →
redeem succeeds on the winning side, fails on the losing side.

## Why

Unit tests per program prove each invariant in isolation; this milestone proves the invariants
still hold when the programs are composed in the order a real user/keeper would drive them.

## Scope

- [x] Full localnet scenario — see `tests/e2e.ts`.
- [ ] Repeat the same scenario on real devnet with real devnet Pyth feeds (not simulated).

## Test coverage

`tests/e2e.ts` (localnet, simulated Pyth price). The devnet repeat with real Pyth feeds has not
run yet — do not consider the MVP's definition of done (per `docs/PRD.md`) satisfied until it
has.

## References

- `docs/PRD.md` §Definition of done for the MVP
