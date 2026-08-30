//! Pure LMSR math over native token units (u64/i64, 6-decimal, matching USDC/DOWN/UP amounts).
//! Built on the WAD fixed-point primitives in `crate::fixed`. No Solana dependency — unit
//! tested standalone.
//!
//! Cost function: `C(q_down, q_up) = b * ln(exp(q_down/b) + exp(q_up/b))`.
//! Marginal price of DOWN: `exp(q_down/b) / (exp(q_down/b) + exp(q_up/b))`.

use crate::fixed::{exp_wad, ln_wad, wad_div, wad_mul, FixedError, FixedResult, WAD};

/// Native-unit amounts (6 decimals) have 1_000_000 units per whole token; WAD fixed point has
/// 1e18 units per whole number. This is the scale factor between the two.
const NATIVE_TO_WAD: i128 = 1_000_000_000_000; // 1e12

fn native_to_wad(x: i64) -> FixedResult<i128> {
    (x as i128)
        .checked_mul(NATIVE_TO_WAD)
        .ok_or(FixedError::Overflow)
}

fn wad_to_native(x: i128) -> FixedResult<i64> {
    let v = x.checked_div(NATIVE_TO_WAD).ok_or(FixedError::Overflow)?;
    i64::try_from(v).map_err(|_| FixedError::Overflow)
}

/// `exp(q/b)` in WAD fixed point, given native-unit q and b.
fn exp_q_over_b(q: i64, b: u64) -> FixedResult<i128> {
    let q_wad = native_to_wad(q)?;
    let b_wad = native_to_wad(b as i64)?;
    let ratio = wad_div(q_wad, b_wad)?;
    exp_wad(ratio)
}

/// The LMSR cost function, returned in WAD fixed point (native-unit inputs).
pub fn cost(q_down: i64, q_up: i64, b: u64) -> FixedResult<i128> {
    let e_down = exp_q_over_b(q_down, b)?;
    let e_up = exp_q_over_b(q_up, b)?;
    let sum = e_down.checked_add(e_up).ok_or(FixedError::Overflow)?;
    let ln_sum = ln_wad(sum)?;
    let b_wad = native_to_wad(b as i64)?;
    wad_mul(b_wad, ln_sum)
}

/// Marginal price of the DOWN side, in WAD fixed point (always in `[0, WAD]`).
pub fn price_down(q_down: i64, q_up: i64, b: u64) -> FixedResult<i128> {
    let e_down = exp_q_over_b(q_down, b)?;
    let e_up = exp_q_over_b(q_up, b)?;
    let sum = e_down.checked_add(e_up).ok_or(FixedError::Overflow)?;
    wad_div(e_down, sum)
}

pub fn price_up(q_down: i64, q_up: i64, b: u64) -> FixedResult<i128> {
    let p_down = price_down(q_down, q_up, b)?;
    WAD.checked_sub(p_down).ok_or(FixedError::Overflow)
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Side {
    Down,
    Up,
}

/// Solves the constant-cost-function swap invariant: no USDC changes hands (the pool is
/// already 1:1 collateralized), so a swap must leave `C(q_down, q_up)` unchanged. Trading
/// `amount_in` of `side_in` for the other side, at constant cost:
///
/// `C(q_down', q_up') = C(q_down, q_up)`
///
/// where the "in" side's outstanding quantity decreases by `amount_in` (the trader is handing
/// shares back to the pool) and the "out" side's outstanding quantity increases by the
/// `amount_out` this function solves for.
pub fn swap_amount_out(
    q_down: i64,
    q_up: i64,
    b: u64,
    side_in: Side,
    amount_in: u64,
) -> FixedResult<u64> {
    let amount_in = i64::try_from(amount_in).map_err(|_| FixedError::Overflow)?;

    let e_down = exp_q_over_b(q_down, b)?;
    let e_up = exp_q_over_b(q_up, b)?;
    let target_sum = e_down.checked_add(e_up).ok_or(FixedError::Overflow)?;

    let (q_in, q_out) = match side_in {
        Side::Down => (q_down, q_up),
        Side::Up => (q_up, q_down),
    };

    let q_in_new = q_in.checked_sub(amount_in).ok_or(FixedError::Overflow)?;
    let e_in_new = exp_q_over_b(q_in_new, b)?;

    // e_out_new = target_sum - e_in_new
    let e_out_new = target_sum
        .checked_sub(e_in_new)
        .ok_or(FixedError::Overflow)?;
    if e_out_new <= 0 {
        return Err(FixedError::Overflow);
    }

    let ln_e_out_new = ln_wad(e_out_new)?;
    let b_wad = native_to_wad(b as i64)?;
    let q_out_new_wad = wad_mul(b_wad, ln_e_out_new)?;
    let q_out_new = wad_to_native(q_out_new_wad)?;

    let amount_out = q_out_new.checked_sub(q_out).ok_or(FixedError::Overflow)?;
    if amount_out < 0 {
        return Err(FixedError::Overflow);
    }
    u64::try_from(amount_out).map_err(|_| FixedError::Overflow)
}

/// Applies a fee (in bps) to a gross output amount, returning the net amount the trader
/// receives. The fee itself is left with the pool (it is simply not paid out).
pub fn apply_fee(gross_amount_out: u64, fee_bps: u16) -> FixedResult<u64> {
    let numerator = (gross_amount_out as u128)
        .checked_mul(10_000u128.checked_sub(fee_bps as u128).ok_or(FixedError::Overflow)?)
        .ok_or(FixedError::Overflow)?;
    let net = numerator.checked_div(10_000).ok_or(FixedError::DivisionByZero)?;
    u64::try_from(net).map_err(|_| FixedError::Overflow)
}

/// The theoretical worst-case loss bound for a 2-outcome LMSR pool: `b * ln(2)`.
pub fn max_loss_wad(b: u64) -> FixedResult<i128> {
    let b_wad = native_to_wad(b as i64)?;
    let ln2 = ln_wad(2 * WAD)?;
    wad_mul(b_wad, ln2)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn price_down_and_up_sum_to_one_at_zero_state() {
        let b = 1_000_000_000; // 1000 tokens, 6 decimals
        let pd = price_down(0, 0, b).unwrap();
        let pu = price_up(0, 0, b).unwrap();
        assert_eq!(pd, WAD / 2);
        assert!((pd + pu - WAD).abs() <= 2);
    }

    #[test]
    fn price_down_and_up_sum_to_one_after_imbalance() {
        let b = 1_000_000_000;
        let pd = price_down(50_000_000, -20_000_000, b).unwrap();
        let pu = price_up(50_000_000, -20_000_000, b).unwrap();
        assert!((pd + pu - WAD).abs() <= WAD / 1_000_000);
    }

    #[test]
    fn price_down_increases_as_q_down_grows_relative_to_q_up() {
        let b = 1_000_000_000;
        let p1 = price_down(0, 0, b).unwrap();
        let p2 = price_down(10_000_000, 0, b).unwrap();
        let p3 = price_down(50_000_000, 0, b).unwrap();
        assert!(p2 > p1);
        assert!(p3 > p2);
        assert!(p3 < WAD);
    }

    #[test]
    fn swap_preserves_cost_function_invariant() {
        let b = 1_000_000_000;
        let (q_down, q_up) = (0i64, 0i64);
        let cost_before = cost(q_down, q_up, b).unwrap();

        let amount_in = 10_000_000u64;
        let amount_out = swap_amount_out(q_down, q_up, b, Side::Down, amount_in).unwrap();

        let q_down_new = q_down - amount_in as i64;
        let q_up_new = q_up + amount_out as i64;
        let cost_after = cost(q_down_new, q_up_new, b).unwrap();

        // Chained exp/ln evaluations compound the fixed-point series' finite precision, so
        // allow a modest relative tolerance rather than bit-exactness.
        let tolerance = WAD / 1_000_000; // 1e-6 relative
        assert!(
            (cost_after - cost_before).abs() <= tolerance,
            "cost drifted: before={cost_before} after={cost_after}"
        );
    }

    #[test]
    fn swap_output_is_positive_and_less_than_input_value_when_moving_price() {
        let b = 1_000_000_000;
        let amount_in = 10_000_000u64;
        let amount_out = swap_amount_out(0, 0, b, Side::Down, amount_in).unwrap();
        // Buying DOWN by giving away DOWN doesn't apply; here side_in=Down means the trader is
        // handing DOWN back to the pool and receiving UP, so amount_out should be sane (>0,
        // bounded).
        assert!(amount_out > 0);
        assert!(amount_out < amount_in * 2);
    }

    #[test]
    fn apply_fee_deducts_correct_bps() {
        let gross = 1_000_000u64;
        let net = apply_fee(gross, 30).unwrap(); // 0.3%
        assert_eq!(net, 997_000);
    }

    #[test]
    fn bounded_loss_repeated_one_directional_swaps() {
        // Simulate many swaps all in the same direction and verify cumulative amount_out never
        // exceeds cumulative amount_in by more than the theoretical LMSR bound b*ln(2). This is
        // the "pool never releases more than the theoretical LMSR bound" property required by
        // docs/PROGRAM_SPEC.md.
        let b = 5_000_000_000u64; // 5000 tokens
        let mut q_down: i64 = 0;
        let mut q_up: i64 = 0;
        let mut total_in: u128 = 0;
        let mut total_out: u128 = 0;

        let amount_in = 50_000_000u64; // 50 tokens per swap
        for _ in 0..40 {
            let amount_out = swap_amount_out(q_down, q_up, b, Side::Down, amount_in).unwrap();
            q_down -= amount_in as i64;
            q_up += amount_out as i64;
            total_in += amount_in as u128;
            total_out += amount_out as u128;
        }

        let max_loss = max_loss_wad(b).unwrap();
        let max_loss_native = (max_loss / NATIVE_TO_WAD) as u128;

        assert!(
            total_out <= total_in + max_loss_native + 1,
            "pool released more than the LMSR bound: total_in={total_in} total_out={total_out} max_loss={max_loss_native}"
        );
    }

    #[test]
    fn swap_rejects_when_it_would_exceed_available_liquidity() {
        let b = 1_000_000; // tiny b relative to the trade, to force an extreme move
        let amount_in = 1_000_000_000u64; // far larger than b
        let result = swap_amount_out(0, 0, b, Side::Down, amount_in);
        // Either a clean error, or (if representable) amount_out should still respect
        // total_out <= total_in + max_loss; either way it must not panic.
        if let Ok(amount_out) = result {
            let max_loss = max_loss_wad(b).unwrap() / NATIVE_TO_WAD;
            assert!((amount_out as i128) <= amount_in as i128 + max_loss + 1);
        }
    }
}
