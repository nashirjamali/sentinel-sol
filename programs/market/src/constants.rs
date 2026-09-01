use anchor_lang::prelude::*;

#[constant]
pub const MARKET_SEED: &[u8] = b"market";

#[constant]
pub const VAULT_SEED: &[u8] = b"vault";

#[constant]
pub const RESOLVER_SEED: &[u8] = b"resolver";

/// `resolution_program`'s declared program ID. Hardcoded (rather than a path dependency on the
/// `resolution` crate) to avoid a circular Cargo dependency, since `resolution_program` CPIs
/// into `market_program`. Only `resolution_program`'s own resolver PDA (derived from this ID)
/// may sign the `apply_resolution` instruction below.
pub const RESOLUTION_PROGRAM_ID: Pubkey = pubkey!("HsGLymsSrMZhPwjT6xGCmbubUSP4e96HjTqdqRwej9uA");
