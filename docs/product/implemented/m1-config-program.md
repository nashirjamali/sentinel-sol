# M1 — config_program

**Status:** implemented
**Phase:** 1 (MVP)
**Depends on:** M0 — scaffolding

## What

`GlobalConfig` and `RiskConfig` accounts plus every admin instruction from
`docs/libs/PROGRAM_SPEC.md` §1: pause flag, risk parameters, two-step admin transfer.

## Why

Every other program reads `RiskConfig` (fees, staleness threshold, per-asset enablement) —
this has to exist and be trustworthy (timelocked, two-step admin transfer) before markets can
be created.

## Scope

- [x] Implement `GlobalConfig`, `RiskConfig`, and every instruction from
      `docs/libs/PROGRAM_SPEC.md` §1.
- [x] Tests: initialize, set_paused, upsert_risk_config, and the two-step admin transfer
      (set_pending_admin → accept_admin), including a test that a wrong signer is rejected.

## Test coverage

`tests/config.ts` — covers the two-step admin transfer and unauthorized-signer rejection,
satisfying the **Governance timelock** invariant in `CLAUDE.md`.

## References

- `docs/libs/PROGRAM_SPEC.md` §1
