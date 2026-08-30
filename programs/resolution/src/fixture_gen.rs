//! Not part of the program logic — a throwaway helper to generate raw account bytes for
//! `PriceUpdateV2` test fixtures, consumed by `tests/resolution.ts` via
//! `Anchor.toml`'s `[[test.validator.account]]` preload. Run with:
//!   cargo test -p resolution --lib fixture_gen -- --nocapture
#![cfg(test)]

use anchor_lang::prelude::*;
use anchor_lang::Discriminator;
use pyth_solana_receiver_sdk::price_update::{PriceFeedMessage, PriceUpdateV2, VerificationLevel};

fn serialize(update: &PriceUpdateV2) -> Vec<u8> {
    let mut buf = Vec::new();
    buf.extend_from_slice(&PriceUpdateV2::DISCRIMINATOR);
    update.serialize(&mut buf).unwrap();
    buf
}

fn print_fixture(label: &str, feed_id: [u8; 32], price: i64, conf: u64, expo: i32, publish_time: i64) {
    let update = PriceUpdateV2 {
        write_authority: Pubkey::default(),
        verification_level: VerificationLevel::Full,
        price_message: PriceFeedMessage {
            feed_id,
            price,
            conf,
            exponent: expo,
            publish_time,
            prev_publish_time: publish_time - 1,
            ema_price: price,
            ema_conf: conf,
        },
        posted_slot: 1,
    };
    let bytes = serialize(&update);
    use base64::Engine;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    println!("=== {label} ===\n{b64}\n");
}

#[test]
fn generate_fixtures() {
    // A fixed feed id used by the resolution test market — 32 bytes, deterministic.
    let feed_id: [u8; 32] = [7u8; 32];

    // Old publish_time (2023-11-14), so it is unconditionally "stale" under any reasonable
    // max_staleness_secs, and unconditionally "fine" under a deliberately huge one — this lets
    // the same fixture drive both the valid-resolution and staleness-rejection tests without
    // depending on the live validator clock.
    let old_publish_time: i64 = 1_700_000_000;

    // price = 3100.00000000 at expo -8, strike will be set to 3000.00000000 -> outcome Up.
    print_fixture("valid_up", feed_id, 3_100_00000000, 100_000, -8, old_publish_time);

    // Same price but with a confidence interval far too wide (conf/price > 1%: here ~1.6%).
    print_fixture("wide_confidence", feed_id, 3_100_00000000, 5_000_000_000, -8, old_publish_time);

    // price below strike -> outcome Down.
    print_fixture("valid_down", feed_id, 2_900_00000000, 100_000, -8, old_publish_time);

    // Mismatched feed id.
    let other_feed_id: [u8; 32] = [9u8; 32];
    print_fixture("mismatched_feed", other_feed_id, 3_100_00000000, 100_000, -8, old_publish_time);
}
