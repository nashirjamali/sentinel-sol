# M4 — resolution_program

**Status:** implemented
**Phase:** 1 (MVP)
**Depends on:** M2 — market_program

## What

Pyth pull-oracle integration (`pyth-solana-receiver` / `pyth-sdk-solana`) and `resolve_market`
per `docs/libs/PROGRAM_SPEC.md` §4 — the only path that sets `Market.outcome`.

## Why

This is where the **resolution is permanent** and **resolution only from a valid oracle price**
invariants in `CLAUDE.md` are enforced. Getting staleness/confidence checks wrong here is the
single highest-blast-radius bug class in the system.

## Scope

- [x] Integrate `pyth-solana-receiver`/`pyth-sdk-solana`, verifying the price account is
      genuinely a Pyth account (not a look-alike account).
- [x] `resolve_market` per `docs/libs/PROGRAM_SPEC.md` §4.
- [x] Test staleness, confidence-interval rejection, and double-resolution.
- [x] Test post-resolution redemption for the winning side and rejection for the losing side.

## Test coverage

`tests/resolution.ts` — staleness rejection, confidence-interval rejection, double-resolution
rejection, and winning/losing-side redemption.

## References

- `docs/libs/PROGRAM_SPEC.md` §4
- `CLAUDE.md` — "Resolution is permanent", "Resolution only from a valid oracle price"
