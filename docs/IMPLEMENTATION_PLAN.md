# IMPLEMENTATION_PLAN — Sentinels

Work through this in order. Don't start the next milestone before the previous one's tests are
green — each program genuinely depends on the one before it (e.g. `amm_program` needs valid
`down_mint`/`up_mint` accounts from `market_program`).

## Phase 1 — MVP (full scope in `PRD.md`)

### M0 — Scaffolding
- [x] Initialize the Anchor workspace (`anchor init`), 4 empty programs matching the layout in
      `CLAUDE.md`: `config`, `market`, `amm`, `resolution`.
- [ ] Set up `solana-program-test` / `bankrun` for fast unit tests, separate from the
      validator-based integration tests run by `anchor test`.
- [x] Record the devnet Pyth feed IDs for BTC/USD, ETH/USD, SOL/USD in a config file (e.g.
      `config/pyth-feeds.json`) — never hardcode them inside a program.
- [x] Minimal CI: `anchor build` + `anchor test` on every push.

### M1 — `config_program`
- [x] Implement `GlobalConfig`, `RiskConfig`, and every instruction from `PROGRAM_SPEC.md` §1.
- [x] Tests: initialize, set_paused, upsert_risk_config, and the two-step admin transfer
      (set_pending_admin → accept_admin), including a test that a wrong signer is rejected.

### M2 — `market_program`
- [x] `create_market`, `mint_complete_set`, `merge_complete_set`, `redeem` per
      `PROGRAM_SPEC.md` §2.
- [x] Test the 1:1 collateral invariant after a mint → merge → mint sequence.
- [x] Test `create_market` is rejected when `RiskConfig` for that asset is missing/disabled.
- [x] Test `mint_complete_set` is rejected once inside `trading_halt_secs`.

### M3 — `amm_program`
- [x] Implement the fixed-point LMSR math as a module separate from the instructions (a pure
      module that can be unit-tested with no Solana runtime at all — this is the easiest part
      to get wrong, so test it before wiring it into instructions).
- [x] `init_pool`, `add_liquidity`, `remove_liquidity`, `swap` per `PROGRAM_SPEC.md` §3.
- [x] Test bounded loss: simulate repeated one-directional swaps and prove the pool never
      releases more than the theoretical LMSR bound for the `b` in use.
- [x] Test slippage protection (`min_amount_out`) and correct fee deduction.

### M4 — `resolution_program`
- [x] Integrate `pyth-solana-receiver`/`pyth-sdk-solana`, verifying the price account is
      genuinely a Pyth account (not a look-alike account).
- [x] `resolve_market` per `PROGRAM_SPEC.md` §4.
- [x] Test staleness, confidence-interval rejection, and double-resolution.
- [x] Test post-resolution redemption for the winning side and rejection for the losing side.

### M5 — End-to-end integration
- [x] Full localnet scenario: create_market → mint_complete_set → add_liquidity → several swaps
      from different "traders" → cross into the trading-halt window → attempt a mint (must
      fail) → cross expiry → resolve_market with a simulated Pyth price → redeem succeeds on
      the winning side, fails on the losing side. See `tests/e2e.ts`.
- [ ] Repeat the same scenario on real devnet with real devnet Pyth feeds (not simulated).

### M6 — TypeScript SDK
- [ ] A client wrapper over the Anchor IDL: high-level functions (`protectAsset`,
      `provideLiquidity`, `redeem`) that combine several instructions (e.g. mint then swap)
      into one easy-to-call flow.
- [ ] Unit-test the SDK against localnet.

### M7 — Frontend: deferred, wireframes only

No working frontend is built during this phase. A set of black-and-white low-fidelity
wireframes has been delivered separately (see the wireframe file) covering: market list,
the "Protect" flow, positions/redeem, and provide-liquidity. Treat those as the UX reference
for the eventual build, but do not start implementing a Next.js app until this milestone is
explicitly reopened — interacting with the protocol during Phase 1 happens through the SDK
from M6, the CLI, and tests.

### M8 — Before any mainnet conversation
- [ ] Run the full self-review checklist in `PROGRAM_SPEC.md`.
- [ ] Replace the single `admin` key with a multisig (e.g. Squads) — never deploy to mainnet
      with a single-key admin.
- [ ] Independent external audit — outside the scope of this implementation plan, but a hard
      prerequisite before real funds are involved.

---

## Phase 2 (after the MVP is proven on devnet)

- Automated Underwriting Vault (cross-market allocation, per-asset exposure limits).
- Insurance Backstop Fund funded from a share of fees.
- CLOB / order matching for large sizes, alongside the LMSR pool.
- Multi-strike strips per asset (graduated payout, approximating a put-option curve).
- Switchboard as a second oracle cross-check.
- Governance transition to a DAO ($SNTL token, staking as backstop capital).
- Frontend build, using the wireframes from Phase 1 as the starting reference.

## Phase 3

- RWA / off-chain assets with third-party oracle attestation.
- Cross-chain integration (e.g. via Wormhole).

Design rationale for each phase lives in `docs/ARCHITECTURE.md` and the product design
document (the [Sentinels architecture artifact](https://claude.ai/code/artifact/9a840625-bf4d-4189-b327-57781a546a1b))
— this file is only the technical work order.