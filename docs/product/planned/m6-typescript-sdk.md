# M6 — TypeScript SDK

**Status:** planned
**Phase:** 1 (MVP)
**Depends on:** M5 — end-to-end integration

## What

A client wrapper over the Anchor IDL: high-level functions (`protectAsset`,
`provideLiquidity`, `redeem`) that combine several instructions (e.g. mint then swap) into one
easy-to-call flow.

## Why

`docs/PRD.md`'s definition of done requires the full protocol flow to be exercisable without a
working frontend. The SDK is that interface — it's also what the eventual frontend (M7) will be
built on.

## Scope

- [ ] A client wrapper over the Anchor IDL: `protectAsset`, `provideLiquidity`, `redeem`.
- [ ] Unit-test the SDK against localnet.

## Test coverage

Not started.

## References

- `docs/libs/API.md`
- `docs/product/planned/m7-frontend.md`
