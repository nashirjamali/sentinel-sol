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

## Note — design system and static shells

A Next.js app (`app/`) now holds a Tailwind + shadcn design system under atomic folders
(`ui/` / `atoms/` / `molecules/` / `organisms`), plus static UI built from the Figma file:
a full landing page on `/` (header, hero, how-it-works, values, CTA, footer) and app shells on
`/connect`, `/market` and `/liquidity`.

None of it is wired to the chain — no wallet connection, no SDK integration, no live market
data. The screens hard-code their display values (they don't even read the `/api/markets`
fixture yet). See `docs/features/design-system.md`. Treat the *behaviour* behind the rest of
M7 (market list, Protect flow, positions/redeem, provide-liquidity) as still gated on M6.

## Scope

Each application flow below has a static UI shell built from the Figma file; the box stays
unchecked until it is wired to the SDK and real market data (M6).

- [ ] Market list. *(static shell: `/market`)*
- [ ] "Protect" flow (mint + swap in one action, per `docs/PRD.md` functional requirement 3).
      *(static shell: `/market`, Protect tab + confirm-transaction modal)*
- [ ] Positions / redeem view. *(static shell: `/market`, Positions and History tabs)*
- [ ] Provide-liquidity view. *(static shell: `/liquidity`)*
- [x] Landing / app shell — landing page matched to the Figma design; connect-wallet shell
      at `/connect`.
- [x] Design system (Tailwind + shadcn, atomic folders) — see `docs/features/design-system.md`.

## Test coverage

None yet for the application flows. The design system has no automated tests and no visual
gallery page.

## References

- `docs/features/design-system.md`
- Wireframes referenced in `docs/PRD.md` §Scope OUT
