# Architecture — Sentinels Phase 1 (MVP)

A fuller product/investor-facing version of this design exists as a separate document (the
[Sentinels architecture artifact](https://claude.ai/code/artifact/9a840625-bf4d-4189-b327-57781a546a1b)).
This document is the technical version, trimmed to exactly what the MVP builds — see
`PRD.md` for the scope boundary.

## Design principles

1. **Solvency by construction.** No instruction changes DOWN/UP supply without locking or
   releasing the matching USDC in the same atomic instruction. This eliminates an entire class
   of "vault runs out of funds at redemption time" bugs.
2. **Resolution without humans.** A market's outcome is a pure function of the oracle price at
   expiry. No voting, no dispute window, no admin override on the outcome itself.
3. **Small programs, narrow responsibility.** Each program does one thing, so it's easy to
   audit and easy to test in isolation.

## Four MVP programs

```
config_program      → admin authority, pause flag, RiskConfig (per asset)
market_program        → create_market, mint_complete_set, merge_complete_set, redeem
amm_program            → LMSR pool: init_pool, add_liquidity, remove_liquidity, swap
resolution_program     → resolve_market (reads Pyth, sets outcome, permissionless)
```

An automated Underwriting Vault, an Insurance Backstop Fund, and DAO governance are
**deliberately absent** from the MVP — see the scope-OUT list in `PRD.md` and
`IMPLEMENTATION_PLAN.md` for when they arrive.

## System flow

```
                     ┌───────────────────────┐
                     │  TS client / CLI /     │
                     │  tests (no UI yet)     │
                     └───────────┬───────────┘
                                 │ tx: mint / swap / add-liq / redeem
                                 ▼
   ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
   │ config_program │───▶│ market_program │───▶│  amm_program  │
   │ (RiskConfig)   │    │ (vault, mints) │    │ (LMSR pool)   │
   └───────────────┘    └───────┬────────┘    └───────────────┘
                                 │ outcome
                                 ▼
                        ┌─────────────────────┐        ┌───────────────┐
                        │ resolution_program   │───────▶│ Pyth Network  │
                        │ (keeper-triggered)   │        │ (pull oracle) │
                        └─────────────────────┘        └───────────────┘
```

The keeper (a permissionless bot anyone can run) is the only off-chain component touching
critical state — its only job is calling `resolve_market` after expiry with a Pyth price
update. All decision logic stays on-chain in `resolution_program`.

## Price data flow (oracle)

- Source: Pyth pull oracle, BTC/USD, ETH/USD, SOL/USD feeds (devnet feed IDs recorded in
  `RiskConfig` per asset — see `PROGRAM_SPEC.md`).
- `resolve_market` validates two things before accepting a price: `publish_time` no older
  than `max_staleness_secs`, and `conf` (confidence interval) no wider than
  `max_confidence_bps` relative to `price`. If either check fails, the instruction reverts —
  the keeper must retry with a fresher update.
- The MVP does not use Switchboard as a second cross-check (that's a Phase 2 addition to
  reduce single-oracle risk) — this is a documented limitation, not a silently ignored one.

## User flows (summary)

**Buying protection:** the user mints a complete set (USDC → DOWN+UP), then swaps their UP
tokens into the AMM pool for more USDC/DOWN — net result: the user holds net DOWN, having paid
an implicit premium through the swap price.

**Providing liquidity:** the user deposits DOWN+UP (or mints a complete set first from USDC)
into the AMM pool, receives an LP share, and earns fees from swap volume while the market is
live.

**Resolution and redemption:** a keeper triggers resolution once expiry passes; holders of the
winning token can redeem at any time afterward. Holders of the losing token cannot redeem
anything (the token balance simply sits in the wallet, worthless — it doesn't need to be
force-burned).

## Known limitations of the MVP (documented, not hidden)

- Single oracle source (Pyth only) — downtime/manipulation risk isn't mitigated by a
  cross-check.
- A single admin key (not a multisig) in the initial implementation — fine for devnet,
  **must** be replaced with a multisig before any real funds touch mainnet.
- No insurance backstop fund — if a pool's UP side loses badly, LPs bear it in full (bounded by
  the `b` parameter, but still potentially significant).
- No frontend. Interaction is through the TypeScript client, CLI, and tests only during this
  phase — see `PRD.md` scope OUT.