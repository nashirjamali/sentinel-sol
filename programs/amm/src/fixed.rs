//! WAD (1e18) fixed-point arithmetic on `i128`, with `exp`/`ln` implemented from scratch via
//! range reduction + series expansion. No floating point anywhere — every operation is checked
//! integer arithmetic, matching the "never use floating point on-chain" rule in
//! `docs/libs/PROGRAM_SPEC.md`. This module has no Solana/Anchor dependency and is unit-tested on
//! its own (`cargo test -p amm`), independent of the instructions that use it.

use ethnum::I256;

pub const WAD: i128 = 1_000_000_000_000_000_000;

/// WAD-scaled ln(2), i.e. ln(2) * 1e18, rounded to the nearest integer.
const LN2: i128 = 693_147_180_559_945_309;

/// Domain bound for `exp`: `exp(46 * WAD)` is the largest input whose WAD-scaled result still
/// fits in i128 with headroom. Anything larger overflows and is rejected rather than silently
/// wrapping.
const EXP_MAX_INPUT: i128 = 46 * WAD;
/// Below this, `exp(x)` rounds to 0 in WAD fixed point; short-circuit instead of iterating.
const EXP_MIN_INPUT: i128 = -46 * WAD;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FixedError {
    Overflow,
    DivisionByZero,
    LnOfNonPositive,
}

pub type FixedResult<T> = Result<T, FixedError>;

/// Full-precision `a * b / denom`, using a 256-bit intermediate product so this never
/// overflows just because `a * b` alone would exceed `i128` (which happens well within the
/// legitimate range of amounts this module needs to handle — e.g. a large `b` liquidity
/// parameter times a WAD-scaled log). Only the final result needs to fit back into `i128`.
pub fn mul_div(a: i128, b: i128, denom: i128) -> FixedResult<i128> {
    if denom == 0 {
        return Err(FixedError::DivisionByZero);
    }
    let sign = a.signum() * b.signum() * denom.signum();
    let a256 = I256::from(a.unsigned_abs());
    let b256 = I256::from(b.unsigned_abs());
    let denom256 = I256::from(denom.unsigned_abs());
    let product = a256
        .checked_mul(b256)
        .ok_or(FixedError::Overflow)?;
    let result256 = product.checked_div(denom256).ok_or(FixedError::DivisionByZero)?;
    let result: i128 = result256.try_into().map_err(|_| FixedError::Overflow)?;
    if sign < 0 {
        result.checked_neg().ok_or(FixedError::Overflow)
    } else {
        Ok(result)
    }
}

pub fn wad_mul(a: i128, b: i128) -> FixedResult<i128> {
    mul_div(a, b, WAD)
}

pub fn wad_div(a: i128, b: i128) -> FixedResult<i128> {
    mul_div(a, WAD, b)
}

/// Natural exponential of a WAD fixed-point number. Domain: `[-46*WAD, 46*WAD]`.
pub fn exp_wad(x: i128) -> FixedResult<i128> {
    if x < EXP_MIN_INPUT {
        return Ok(0);
    }
    if x > EXP_MAX_INPUT {
        return Err(FixedError::Overflow);
    }

    // Range reduction: x = n*ln2 + r, r in [0, ln2).
    let n = x.div_euclid(LN2);
    let r = x.rem_euclid(LN2);

    // Taylor series for exp(r), r in [0, ln2) so this converges to i128 precision well
    // within 30 terms.
    let mut acc: i128 = WAD; // k = 0 term
    let mut term: i128 = WAD;
    for k in 1..=30i128 {
        term = wad_mul(term, r)?
            .checked_div(k)
            .ok_or(FixedError::DivisionByZero)?;
        if term == 0 {
            break;
        }
        acc = acc.checked_add(term).ok_or(FixedError::Overflow)?;
    }

    // Multiply by 2^n (exact for WAD-fixed representation: shifting the underlying integer by
    // n bits multiplies the represented real value by 2^n).
    if n >= 0 {
        let shift: u32 = n.try_into().map_err(|_| FixedError::Overflow)?;
        acc.checked_shl(shift).ok_or(FixedError::Overflow)
    } else {
        let shift: u32 = (-n).try_into().map_err(|_| FixedError::Overflow)?;
        Ok(acc.checked_shr(shift).ok_or(FixedError::Overflow)?)
    }
}

/// Natural log of a positive WAD fixed-point number.
pub fn ln_wad(x: i128) -> FixedResult<i128> {
    if x <= 0 {
        return Err(FixedError::LnOfNonPositive);
    }

    // Find e such that m = x / 2^e lies in [WAD, 2*WAD).
    let mut m = x;
    let mut e: i128 = 0;
    while m >= 2 * WAD {
        m = m.checked_div(2).ok_or(FixedError::DivisionByZero)?;
        e = e.checked_add(1).ok_or(FixedError::Overflow)?;
    }
    while m < WAD {
        m = m.checked_mul(2).ok_or(FixedError::Overflow)?;
        e = e.checked_sub(1).ok_or(FixedError::Overflow)?;
    }

    // ln(m) via atanh series: ln(m) = 2*atanh(y), y = (m-1)/(m+1), y in [0, 1/3] for m in [1,2).
    let y = wad_div(
        m.checked_sub(WAD).ok_or(FixedError::Overflow)?,
        m.checked_add(WAD).ok_or(FixedError::Overflow)?,
    )?;
    let y2 = wad_mul(y, y)?;

    let mut acc = y;
    let mut term = y;
    for k in 1..=15i128 {
        term = wad_mul(term, y2)?;
        let divisor = 2 * k + 1;
        let contribution = term
            .checked_div(divisor)
            .ok_or(FixedError::DivisionByZero)?;
        if contribution == 0 {
            break;
        }
        acc = acc.checked_add(contribution).ok_or(FixedError::Overflow)?;
    }
    let ln_m = acc.checked_mul(2).ok_or(FixedError::Overflow)?;

    e.checked_mul(LN2)
        .ok_or(FixedError::Overflow)?
        .checked_add(ln_m)
        .ok_or(FixedError::Overflow)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn approx_eq(a: i128, b: i128, tolerance: i128) -> bool {
        (a - b).abs() <= tolerance
    }

    const TOL: i128 = WAD / 1_000_000; // 1e-6 relative tolerance at WAD scale

    #[test]
    fn exp_of_zero_is_one() {
        assert_eq!(exp_wad(0).unwrap(), WAD);
    }

    #[test]
    fn ln_of_one_is_zero() {
        assert_eq!(ln_wad(WAD).unwrap(), 0);
    }

    #[test]
    fn exp_of_ln2_is_two() {
        let r = exp_wad(LN2).unwrap();
        assert!(approx_eq(r, 2 * WAD, TOL), "exp(ln2) = {r}, expected ~2e18");
    }

    #[test]
    fn ln_of_two_matches_ln2_constant() {
        let r = ln_wad(2 * WAD).unwrap();
        assert!(approx_eq(r, LN2, TOL), "ln(2) = {r}, expected ~{LN2}");
    }

    #[test]
    fn exp_of_one_matches_eulers_number() {
        // e = 2.718281828459045235...
        let expected: i128 = 2_718_281_828_459_045_235;
        let r = exp_wad(WAD).unwrap();
        assert!(approx_eq(r, expected, TOL), "exp(1) = {r}, expected ~{expected}");
    }

    #[test]
    fn ln_exp_roundtrip() {
        for x in [-20 * WAD, -5 * WAD, -WAD, 0, WAD, 5 * WAD, 20 * WAD, 40 * WAD] {
            let e = exp_wad(x).unwrap();
            let back = ln_wad(e).unwrap();
            assert!(
                approx_eq(back, x, WAD / 1_000_000_000 + 1),
                "ln(exp({x})) = {back}, expected ~{x}"
            );
        }
    }

    #[test]
    fn exp_is_monotonically_increasing() {
        let mut prev = exp_wad(-10 * WAD).unwrap();
        let mut x = -10 * WAD;
        while x < 10 * WAD {
            x += WAD / 4;
            let cur = exp_wad(x).unwrap();
            assert!(cur > prev, "exp not increasing at x={x}");
            prev = cur;
        }
    }

    #[test]
    fn ln_is_monotonically_increasing() {
        let mut prev = ln_wad(WAD / 1000).unwrap();
        let mut x = WAD / 1000;
        while x < 1000 * WAD {
            x += WAD;
            let cur = ln_wad(x).unwrap();
            assert!(cur > prev, "ln not increasing at x={x}");
            prev = cur;
        }
    }

    #[test]
    fn exp_rejects_out_of_domain_input() {
        assert_eq!(exp_wad(EXP_MAX_INPUT + WAD), Err(FixedError::Overflow));
    }

    #[test]
    fn exp_of_very_negative_input_is_zero() {
        assert_eq!(exp_wad(EXP_MIN_INPUT - WAD).unwrap(), 0);
    }

    #[test]
    fn ln_rejects_non_positive_input() {
        assert_eq!(ln_wad(0), Err(FixedError::LnOfNonPositive));
        assert_eq!(ln_wad(-WAD), Err(FixedError::LnOfNonPositive));
    }

    #[test]
    fn wad_mul_and_div_are_inverse() {
        let a = 3 * WAD;
        let b = 7 * WAD;
        let product = wad_mul(a, b).unwrap();
        let back = wad_div(product, b).unwrap();
        assert!(approx_eq(back, a, TOL));
    }

    #[test]
    fn wad_div_by_zero_errors() {
        assert_eq!(wad_div(WAD, 0), Err(FixedError::DivisionByZero));
    }
}
