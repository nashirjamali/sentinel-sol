# Product

What Sentinels is, who it's for, and the order milestones ship in.

- `personas.md` — the two personas the MVP targets (Protection Buyer, Liquidity Provider).
- `_template.md` — copy this when adding a new milestone doc.
- `implemented/` — milestones that are done, one file per milestone. "Done" means the checklist
  in that file is fully checked and its test coverage exists — a partially-checked milestone
  (e.g. `m5-e2e-integration.md`) stays here with the outstanding item called out, not in
  `planned/`.
- `planned/` — milestones not yet started or not yet complete enough to move to `implemented/`.

Source scope/requirements: `docs/PRD.md`. Full technical work order:
`docs/IMPLEMENTATION_PLAN.md`. When a milestone's status changes, update both its file here and
the checkbox in `IMPLEMENTATION_PLAN.md` — the plan is the sequencing source of truth, these
files are the per-milestone detail.
