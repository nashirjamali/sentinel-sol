# M8 — Before any mainnet conversation

**Status:** planned
**Phase:** 1 (MVP)
**Depends on:** M5 — end-to-end integration (devnet repeat)

## What

The gating checklist before mainnet is even a conversation: internal self-review, multisig
admin, external audit.

## Why

The single-admin-key + unaudited state that's acceptable for devnet iteration is not
acceptable once real funds are involved.

## Scope

- [ ] Run the full self-review checklist in `docs/libs/PROGRAM_SPEC.md`.
- [ ] Replace the single `admin` key with a multisig (e.g. Squads) — never deploy to mainnet
      with a single-key admin.
- [ ] Independent external audit — outside the scope of the implementation plan, but a hard
      prerequisite before real funds are involved.

## Test coverage

N/A — this is a process/governance gate, not a code milestone.

## References

- `docs/libs/PROGRAM_SPEC.md` §Self-review checklist
