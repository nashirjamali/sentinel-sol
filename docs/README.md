# Docs

- `architecture/` — system design and the reasoning behind it.
- `libs/` — accounts, instructions, and API reference for every on-chain program. Source of
  truth for implementation (`PROGRAM_SPEC.md` wins over any summary elsewhere, including
  `CLAUDE.md`).
- `product/` — what Sentinels is (`personas.md`), and one file per milestone split across
  `implemented/` and `planned/`. Start here to see what's actually done vs. what's next.
- `features/` — UI/product features that aren't program milestones (e.g. the design system).
  Use `feature-spec.md` as the template.
- `PRD.md` — MVP scope: what's IN and OUT for Phase 1.
- `IMPLEMENTATION_PLAN.md` — the technical work order; sequencing source of truth. Each
  milestone here links to its detail file under `product/`.

Read in this order before starting work: `PRD.md` → `architecture/ARCHITECTURE.md` →
`libs/PROGRAM_SPEC.md` → `IMPLEMENTATION_PLAN.md`.
