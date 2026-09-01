# Landing hero

**Status:** prototype
**Owner milestone:** `docs/product/planned/m7-frontend.md`

## Problem

Sentinels had no marketing/landing surface, and the one available Figma reference (a generic
"UI Base" component kit) doesn't fit the product — app-store badges for a web dApp, a star-
rating social-proof pattern, decorative abstract art with no connection to price data or the
insurance framing.

## Solution

A hero section that keeps the kit's layout/interaction bones (pill buttons, hairline-bordered
header, responsive breakpoints) but replaces the content with a "coverage ledger" — a
live-styled BTC/ETH/SOL table (price, 24h change, UP/DOWN odds, an oracle-pulse indicator)
standing in for the abstract art, plus copy built around the 1:1 collateralization and
parametric-resolution story instead of generic SaaS copy.

Visual direction (palette, type pairing, layout concept) was drafted first as a standalone
design artifact before implementation — see the conversation history for the design plan
(warm-stone/navy paper, copper accent, Fraunces/Manrope/IBM Plex Mono type roles collapsed to
Manrope + IBM Plex Mono in the shipped version).

## Scope

- In: `Header`, `Button`, `CoverageLedger`, `Hero` components; light/dark theming via
  `prefers-color-scheme`; responsive layout down to ~860px.
- Out (deferred to `m7-frontend.md`): wallet connection, live market data (the ledger is
  static/mock), the "Protect" flow, positions/redeem, provide-liquidity, market list.

## Implementation notes

- Lives in `app/` (Next.js 14, App Router, TypeScript, CSS Modules — no Tailwind).
- `app/` is the monorepo's frontend package; `app/app/` is the Next.js App Router directory
  (the naming collision is intentional — `app/` is the package root).
- Components: `components/Header/`, `components/Button/`, `components/CoverageLedger/`,
  `components/Hero/`, each with a colocated `.module.css`.
- Fonts: Manrope (from the Figma kit) + IBM Plex Mono (added for numeric/data display —
  prices, odds, timestamps), loaded via `next/font/google`.
- Icons: `lucide-react` (matches the kit's Feather icon set by name), not hand-copied SVGs.
- Design tokens (`app/app/globals.css`) diverge deliberately from the Figma kit's neutral
  grey palette — copper accent (`--accent`) plus semantic `--up`/`--down` colors kept distinct
  from the accent hue.

## Verification

- `npm run build` passes (typecheck + static generation).
- Manual screenshot verification via a local dev server (dark theme, since that's the system
  default) — header, headline, coverage ledger, and 1:1 collateral seal all render as designed.
- Not verified: light theme, mobile breakpoint, keyboard focus states, accessibility pass.
