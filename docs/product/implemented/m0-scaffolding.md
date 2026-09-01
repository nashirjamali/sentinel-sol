# M0 — Scaffolding

**Status:** implemented (one item outstanding)
**Phase:** 1 (MVP)
**Depends on:** none

## What

Anchor workspace with four empty programs (`config`, `market`, `amm`, `resolution`), devnet
Pyth feed IDs recorded outside program code, and minimal CI.

## Why

Every later milestone builds on this scaffold — `amm_program` needs valid `down_mint`/`up_mint`
accounts from `market_program`, which needs the workspace and CI to exist first.

## Scope

- [x] Initialize the Anchor workspace (`anchor init`), 4 empty programs matching the layout in
      `CLAUDE.md`: `config`, `market`, `amm`, `resolution`.
- [ ] Set up `solana-program-test` / `bankrun` for fast unit tests, separate from the
      validator-based integration tests run by `anchor test`.
- [x] Record the devnet Pyth feed IDs for BTC/USD, ETH/USD, SOL/USD in `config/pyth-feeds.json`
      — never hardcoded inside a program.
- [x] Minimal CI: `anchor build` + `anchor test` on every push.

## Test coverage

CI config (`.github/`) runs `anchor build` + `anchor test` on every push.

## References

- `docs/libs/PROGRAM_SPEC.md`
