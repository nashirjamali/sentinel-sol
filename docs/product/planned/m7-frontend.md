# M7 — Frontend

**Status:** planned (design system started ahead of schedule — see note)
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

## Note — design system (landing hero removed)

A Next.js app (`app/`) now holds a Tailwind + shadcn design system under atomic folders
(`ui/` / `atoms/` / `molecules/` / `organisms`). The static landing hero
(`Header` / `Hero` / `CoverageLedger`) has been removed; the home route is empty until that
shell is redesigned. No wallet connection, SDK integration, or live market data — see
`docs/features/design-system.md`. Treat the rest of M7 (market list, Protect flow,
positions/redeem, provide-liquidity) as still gated on M6.

## Scope

- [ ] Market list.
- [ ] "Protect" flow (mint + swap in one action, per `docs/PRD.md` functional requirement 3).
- [ ] Positions / redeem view.
- [ ] Provide-liquidity view.
- [ ] Landing / app shell (restructure; previous static hero removed).
- [x] Design system (Tailwind + shadcn, atomic folders) — see `docs/features/design-system.md`.

## Test coverage

None yet for the application flows. The design system has no automated tests and no visual
gallery page.

## References

- `docs/features/design-system.md`
- Wireframes referenced in `docs/PRD.md` §Scope OUT
