# PROGRAM_SPEC — Sentinels Phase 1 (MVP)

This is the source of truth for implementation. If another document conflicts with this one,
this one wins. Every instruction below must be implemented exactly to the stated
preconditions/postconditions, and each one needs a test proving both.

Units: prices and strikes use Pyth's own precision (typically 1e-8 per feed — read `expo`
from the price account, never hardcode it). USDC/DOWN/UP amounts are in base units (6
decimals, matching USDC).

---

## 1. `config_program`

### Account: `GlobalConfig` (PDA, seed `["config"]`, singleton)

| Field | Type | Notes |
|---|---|---|
| admin | Pubkey | The single MVP authority. Replace with a multisig before mainnet. |
| pending_admin | Option\<Pubkey\> | For two-step admin transfer, to avoid a mistyped address. |
| paused | bool | When true, `market_program` and `amm_program` reject new instructions (redemption still works). |
| bump | u8 | |

### Account: `RiskConfig` (PDA, seed `["risk", asset_feed_id]`, one per asset)

| Field | Type | Notes |
|---|---|---|
| asset_feed_id | Pubkey | Address of the Pyth price account for this asset. |
| max_staleness_secs | i64 | Default 60. |
| max_confidence_bps | u16 | Default 100 (1%). Max accepted confidence/price ratio. |
| trading_halt_secs | i64 | Default 300 (5 minutes before expiry, trading stops). |
| lmsr_b_min | u64 | Lower bound on the liquidity parameter accepted by `init_pool`. |
| enabled | bool | Lets the admin disable an asset without deleting historical data. |
| bump | u8 | |

### Instructions

**`initialize_config(admin: Pubkey)`**
- Precondition: `GlobalConfig` does not yet exist.
- Postcondition: `GlobalConfig` is created, `admin` set, `paused = false`.

**`set_pending_admin(new_admin: Pubkey)`** — signer must be the current `admin`.

**`accept_admin()`** — signer must be `pending_admin`; postcondition:
`admin = pending_admin`, `pending_admin = None`.

**`set_paused(paused: bool)`** — signer must be `admin`.

**`upsert_risk_config(asset_feed_id, params...)`** — signer must be `admin`. Precondition:
numeric values are sane (`max_staleness_secs > 0`, `max_confidence_bps <= 10_000`). This is
the only "governance action" in the MVP — note in the code with an explicit `TODO` that this
must go through a timelock; the MVP may call it directly but the debt must be visible in the
code, not just this doc.

---

## 2. `market_program`

### Account: `Market` (PDA, seed `["market", asset_feed_id, strike_price.to_le_bytes(), expiry_ts.to_le_bytes()]`)

| Field | Type | Notes |
|---|---|---|
| asset_feed_id | Pubkey | |
| strike_price | u64 | Strike price, same precision as the Pyth feed. |
| expiry_ts | i64 | Unix timestamp. |
| down_mint | Pubkey | SPL mint, authority = the `vault_authority` PDA. |
| up_mint | Pubkey | SPL mint, authority = the `vault_authority` PDA. |
| vault_authority | Pubkey | PDA, seed `["vault", market.key]`. |
| collateral_token_account | Pubkey | USDC ATA controlled by `vault_authority`. |
| total_collateral | u64 | Invariant: must equal `down_mint.supply` and `up_mint.supply` (always equal to each other, since minting is always paired). |
| status | enum { Active, Resolved } | |
| outcome | enum { Unresolved, Down, Up } | |
| resolved_price | Option\<u64\> | Recorded at resolution, for the audit trail. |
| resolved_at | Option\<i64\> | |
| bump | u8 | |

### Instructions

**`create_market(asset_feed_id, strike_price, expiry_ts)`**
- Signer: `admin` (read from `GlobalConfig`).
- Precondition: a `RiskConfig` for `asset_feed_id` exists and `enabled = true`; `expiry_ts` >
  `now + trading_halt_secs`; `!GlobalConfig.paused`.
- Postcondition: `Market` is created with status `Active`, outcome `Unresolved`; `down_mint`
  and `up_mint` are created with authority `vault_authority`; `collateral_token_account` is
  created.

**`mint_complete_set(market, amount)`**
- Signer: any user.
- Precondition: `market.status == Active`; `now < market.expiry_ts - trading_halt_secs`;
  `!GlobalConfig.paused`; the user holds ≥ `amount` USDC.
- Effect (atomic, single instruction): transfer `amount` USDC from the user to
  `collateral_token_account`; mint `amount` of `down_mint` to the user's ATA; mint `amount` of
  `up_mint` to the user's ATA; `market.total_collateral += amount`.
- Postcondition that MUST be tested: `collateral_token_account.amount ==
  down_mint.supply == up_mint.supply` after the instruction (preserving the 1:1 collateral
  invariant from `CLAUDE.md`).

**`merge_complete_set(market, amount)`** (the reverse of minting, pre-resolution)
- Precondition: `market.status == Active`; the user holds ≥ `amount` of both `down_mint` and
  `up_mint`.
- Effect: burn `amount` from both mints; transfer `amount` USDC from the vault to the user;
  `market.total_collateral -= amount`.

**`redeem(market, amount)`** (after resolution)
- Precondition: `market.status == Resolved`.
- If `outcome == Down`: burn `amount` of the user's `down_mint` tokens, transfer `amount` USDC
  to the user.
- If `outcome == Up`: burn `amount` of the user's `up_mint` tokens, transfer `amount` USDC to
  the user.
- There is no instruction to redeem tokens on the losing side — leave that balance in the
  user's wallet without value (don't force-burn it; it's unnecessary and adds complexity for
  no benefit).

---

## 3. `amm_program` (LMSR)

Reference formula: LMSR cost function `C(q_down, q_up) = b * ln(exp(q_down/b) +
exp(q_up/b))`. Marginal price of the DOWN side = `exp(q_down/b) / (exp(q_down/b) +
exp(q_up/b))`. Implementation must use fixed-point/checked math (e.g. the `rust_decimal`
crate, or a manual Q64.64 representation) — NEVER use floating point on-chain.

### Account: `AmmPool` (PDA, seed `["amm", market.key]`)

| Field | Type | Notes |
|---|---|---|
| market | Pubkey | |
| b | u64 | Liquidity parameter, locked forever after `init_pool`. |
| q_down | i64 | Net DOWN position that has "left" the pool to traders (used by the LMSR formula). |
| q_up | i64 | Same for UP. |
| fee_bps | u16 | Fee per swap, e.g. 30 (0.3%). |
| lp_mint | Pubkey | Represents an LP share of the pool. |
| bump | u8 | |

### Instructions

**`init_pool(market, b, fee_bps)`**
- Signer: `admin`.
- Precondition: `b >= RiskConfig.lmsr_b_min` for this market's asset; no `AmmPool` exists yet
  for this market.
- Postcondition: `AmmPool` is created with `q_down = q_up = 0`; `lp_mint` is created.

**`add_liquidity(market, down_amount, up_amount)`**
- Precondition: the user deposits DOWN and UP in the ratio the pool expects (in the MVP: 1:1 —
  keep it simple by requiring LPs to `mint_complete_set` first, then call `add_liquidity`).
- Postcondition: `lp_mint` is minted in proportion to the user's contribution to the pool's
  total value at that moment (valued using the current LMSR price, not just raw token count —
  so a later LP is neither unfairly diluted nor unfairly favored).

**`remove_liquidity(market, lp_amount)`**
- Precondition: `market.status == Active` (after resolution, LPs redeem their DOWN/UP through
  the regular `redeem` path in `market_program`, not through the AMM).
- Postcondition: burn `lp_amount` of `lp_mint`, return proportional DOWN+UP to the user.

**`swap(market, side_in, amount_in, min_amount_out)`**
- Precondition: `market.status == Active`; `now < market.expiry_ts - trading_halt_secs`;
  `!GlobalConfig.paused`.
- Effect: compute `amount_out` using the LMSR formula above over the current `q_down`/`q_up`,
  subtract the fee, update `q_down`/`q_up`, transfer the input token from the user, transfer
  the output token to the user.
- Postcondition that MUST be tested: `amount_out >= min_amount_out` or revert (slippage
  protection); the pool never releases more USDC-equivalent value than the bounded loss
  guaranteed by parameter `b` (test with extreme/repeated swaps to verify this bound holds).

---

## 4. `resolution_program`

### Instructions

**`resolve_market(market, price_update_account)`**
- Signer: anyone (permissionless keeper).
- Precondition:
  - `market.status == Active` and `now >= market.expiry_ts`.
  - `price_update_account` is a genuine Pyth account for `market.asset_feed_id` (verify via
    `pyth-solana-receiver` / `pyth-sdk-solana` — never trust a raw pubkey passed into the
    instruction without checking the account's owner/program).
  - `price_update.publish_time >= now - RiskConfig.max_staleness_secs`.
  - `price_update.conf * 10_000 / price_update.price <= RiskConfig.max_confidence_bps`.
- Effect: `market.outcome = if price < market.strike_price { Down } else { Up }`;
  `market.status = Resolved`; `market.resolved_price = Some(price)`;
  `market.resolved_at = Some(now)`.
- Postcondition: this instruction must be idempotent-safe — calling it again after resolution
  must revert (`market.status != Active`), never overwrite the outcome.

---

## Error codes (minimum set, extend as needed)

```
MarketNotActive
MarketNotYetExpired
MarketAlreadyResolved
TradingHalted            // inside trading_halt_secs before expiry
OraclePriceStale
OracleConfidenceTooWide
InsufficientCollateral
SlippageExceeded
Unauthorized             // not the appropriate admin/pending_admin
ProtocolPaused
InvalidRiskConfig
LiquidityBelowMinimum     // b < lmsr_b_min at init_pool
```

## Self-review checklist before public devnet

- [ ] Every instruction above has a happy-path test plus at least 2 failure-path tests.
- [ ] A test explicitly verifies the 1:1 collateral invariant after every combination of
      mint/merge/swap/redeem — not just per-instruction isolated tests.
- [ ] A test attempts to resolve a market twice (the second attempt must revert).
- [ ] A test uses a stale/wide-confidence oracle price (must revert).
- [ ] Overflow/underflow tests for the LMSR math with extreme values (very small `b`, very
      large swap volume) — checked arithmetic everywhere, no `unwrap()` on any math operation
      that can fail from user input.
- [ ] No `unsafe` block without a comment explaining why it's sound.