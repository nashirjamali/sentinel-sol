# M7 — Frontend

**Status:** planned (landing hero prototype started ahead of schedule — see note)
**Phase:** 1 (MVP), originally deferred to Phase 2
**Depends on:** M6 — TypeScript SDK (for anything beyond static marketing content)

## What

The application frontend: market list, the "Protect" flow, positions/redeem, and
provide-liquidity, per the low-fidelity wireframes delivered separately (see
`docs/features/`).

## Why

`docs/IMPLEMENTATION_PLAN.md`'s original ordering deferred this milestone — interacting with
the protocol during Phase 1 was meant to happen through the SDK (M6), the CLI, and tests, not a
UI. The rationale: a frontend built against an unstable/unfinished on-chain surface is churn.

## Note — landing hero prototype

A Next.js app (`app/`) with a modular Header/Button/CoverageLedger/Hero component set was
scaffolded and built ahead of this milestone's original sequencing, at the user's explicit
direction. It is static marketing content only (no wallet connection, no SDK integration, no
live market data) — see `docs/features/landing-hero.md`. Treat the rest of M7 (market list,
Protect flow, positions/redeem, provide-liquidity) as still gated on M6.

## Scope

- [ ] Market list.
- [ ] "Protect" flow (mint + swap in one action, per `docs/PRD.md` functional requirement 3).
- [ ] Positions / redeem view.
- [ ] Provide-liquidity view.
- [x] Landing hero (static, pre-SDK) — see `docs/features/landing-hero.md`.

## Test coverage

None yet for the application flows. The landing hero has a manual browser verification pass
(see `docs/features/landing-hero.md`) but no automated tests.

## References

- `docs/features/landing-hero.md`
- Wireframes referenced in `docs/PRD.md` §Scope OUT
