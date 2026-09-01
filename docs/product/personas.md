# Personas

Sourced from `docs/PRD.md` §Target users. The MVP targets two personas — it does not target
institutional users or high volume; the point of Phase 1 is mechanism correctness, not scale.

## Protection Buyer

A BTC/ETH/SOL holder who wants short-term (weekly) price protection without giving up custody
or taking on synthetic leverage. Mints a complete set (DOWN + UP) 1:1 against USDC, then sells
the side they don't want into the AMM pool — e.g. holding only DOWN is "buying protection."
Cares about: collateral safety, predictable weekly expiry, no manual claims process.

## Liquidity Provider

Supplies capital directly into an AMM pool (`add_liquidity`/`remove_liquidity`) and earns
trading fees in exchange for taking on the UP-side risk. In the MVP this *is* underwriting —
there is no separate Underwriting Vault (that's Phase 2). Cares about: bounded loss (the LMSR
`b` parameter locked at `init_pool`), fee income, ability to exit before expiry.
