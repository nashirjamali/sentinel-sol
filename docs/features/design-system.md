# Design system

**Status:** prototype
**Owner milestone:** `docs/product/planned/m7-frontend.md`

## Problem

The frontend was styling Figma components with colocated CSS Modules, while the intended stack
is Tailwind CSS plus shadcn/ui. That duplicated tokens, made variants hard to compose, and kept
the kit from being a reusable design system. The original static landing hero (`Header`,
`Hero`, `CoverageLedger`) was removed as part of that cleanup; the landing page has since been
rebuilt from the Figma file out of the design system (see Component inventory).

## Solution

A Stacks-based design system in `app/`:

- **Tailwind CSS** for all component styling (no CSS Modules).
- **shadcn/ui** primitives under `app/components/ui/` (`button`, `badge`, `input`, `label`,
  `select`, `accordion`, `radio-group`, `slider`, `separator`).
- **Atomic design** for product components: `atoms/` → `molecules/` → `organisms/`.
- Tokens from the Stacks Figma kit (primary / secondary / neutrals, DM Sans + Poppins + IBM Plex
  Mono) live as CSS variables in `app/app/globals.css` and are mapped in `app/tailwind.config.js`.
- Icons are downloaded Figma assets in `app/public/icons/`, wrapped by `atoms/icon.tsx`.

Landing and static app shells live under `app/` (`/`, `/connect`, `/market`, `/liquidity`).
Do not add a component gallery page unless asked.

## Folder map

```
app/components/
  ui/           # shadcn primitives (cva + Radix). Import these only when composing a DS piece.
  atoms/        # smallest DS pieces (Button, Badge, Icon, …)
  molecules/    # compositions (fields, cards, menus, …)
  organisms/    # page-level sections (landing sections, app shells, flows)
app/lib/utils.ts          # cn()
app/lib/design-frame.ts   # scales landing background art with the viewport
app/components.json
```

Product code should import from `atoms/`, `molecules/`, and `organisms/` — not from `ui/`
directly, except when adding a new primitive.

## Tokens

| Tailwind | CSS variable / value |
| --- | --- |
| `primary-1` … `primary-4` | `--color-primary-1` … `--color-primary-4` |
| `secondary-1` … `secondary-4` | `--color-secondary-*` |
| `neutrals-1` … `neutrals-8` | `--color-neutrals-*` |
| `paper` / `ink` | `--paper` / `--ink` |
| `font-display` / `font-body` / `font-mono` | DM Sans / Poppins / IBM Plex Mono |
| `text-hairline-2`, `text-caption`, `text-caption-2`, `text-body-1`, `text-body-2`, `text-button-1`, `text-button-2` | Stacks type scale |
| `rounded-pill` / `rounded-card` | 90px / 16px |
| `shadow-depth1` … `shadow-depth4` | Stacks elevation |

Light/dark on most components is a `theme` prop (`"light"` \| `"dark"`), not a global class.
Form fields that originally followed `prefers-color-scheme` use Tailwind `dark:` with
`darkMode: "media"`.

## Component inventory

**Atoms:** `Icon`, `Button` (`href` required, variants `neutral` \| `light` \| `dark`, sizes
`small` \| `medium`, optional star `icon`), `Badge`, `TextButton`, `WishlistButton`,
`NotificationBell`, `RadioButton`, `SubNavItem`, `CircleButton`, `CoupleArrows`, `FeatureItem`,
`DropdownItem`, `Quantity`, `WidgetTitle`, `Checkbox`, `GradientGlow` (the blurred
angular-gradient ring behind the landing hero / CTA).

**Molecules:** `EmailField`, `TextField`, `LabeledInput`, `SearchField`, `SearchBox`,
`SmallSearchBox`, `Dropdown`, `SelectField`, `ColorSelect`, `ColorMenu`, `RadioField`,
`AccordionItem`, `PriceRange`, `MessageBar`, `MessageBarMobile`, `ProcessSteps`, `ProductCard`,
`CatalogCard`, `ProductCardWide`, `WidgetProductCard`, `WalletOption`, `PositionRow`,
`StatusPill`, `AssetChip`, `FilterDropdown`, `DetailRows`, `TokenMark`.

**Organisms:** `HorizontalFilter`, landing sections (`LandingHeader`, `LandingHero`,
`LandingHowItWorks`, `LandingValues`, `LandingCta`, `LandingFooter`), connect wallet
(`ConnectWalletShell`, `ConnectWalletFlow`), app shell (`AppShell`, `AppNav`),
`ConfirmTransactionModal`, `LiquidityPoolFlow`.

`Button` and `Badge` wrap the matching shadcn primitives. `PriceRange` uses shadcn `Slider`;
`AccordionItem` / `RadioField` keep the Figma APIs and compose `Separator` / the visual
`RadioButton` rather than forcing every variant onto Radix.

## Landing background art

The hero, values and CTA sections each sit on blurred gradient "rings" exported from Figma
(`app/public/images/landing/*-ellipse-*.svg`; the hero generates its own via `GradientGlow`).
They are positioned in the design's 1440px frame, which creates two recurring problems:

- **Wide screens.** Art narrower than the viewport ends inside the section and shows the edge
  of its own bounding box. `app/lib/design-frame.ts` re-expresses design pixels as fractions of
  `max(1440px, 100vw)` so the art always overshoots. Used by the values section. The CTA
  deliberately does *not* use it — its rings are ~2150px wide once blurred, so they already
  overshoot, and scaling them up would raise them far enough to wash out the heading.
- **Narrow screens.** The art is a fixed-width composition, so on mobile its bright centre
  lands behind the copy. Hero and values dim their rings (`opacity-40 md:opacity-100`), and
  values adds a radial scrim between the rings and the content.

Two constraints to preserve when editing these:

- Don't wrap a ring layer in a `transform` (including `-translate-x-1/2`) — it opens a stacking
  context and cuts `mix-blend-color-dodge` / `mix-blend-overlay` rings off from the background
  they blend against. Centre with `left: calc(50% - …)` instead.
- Converting a Figma `top` to a CSS `bottom` is `frameHeight - top - elementHeight`; dropping
  the element height silently drags the glow up over the copy.

## Deliberate deviations from Figma

The landing copy, the values sub-copy colour (`neutrals-6`) and the confirm-transaction modal
were reconciled in both directions — the Figma file now matches the code, so a design-to-code
pass should agree. One deviation remains on purpose:

- **Values scrim** has no Figma equivalent. It is a radial darkening between the rings and the
  content so the heading block stays legible; the Figma frame has the same contrast problem but
  no way to express the fix. Don't remove it to "match the design".

All buyer-facing copy follows the product-framing rule in `docs/PRD.md`: coverage language
only, no DOWN/UP tokens or mint/swap mechanics. LP-facing surfaces (`/liquidity`) still state
UP-side risk explicitly, which that rule allows.

## Implementation notes

- Lives in `app/` (Next.js 14, App Router, TypeScript). `app/app/` is the App Router directory.
- `cn()` (`clsx` + `tailwind-merge`) is the only class combiner.
- Do not add `.module.css` files for DS components.
- Static UI shells for Market / Liquidity are present as Figma prototypes; they are not wired
  to on-chain SDK flows until M6/M7.

## Verification

- `npm run build` in `app/` (typecheck + static generation).
- Routes: `/` (landing), `/connect`, `/market` (rewrites from `/app/market`), `/liquidity`
  (rewrites from `/app/liquidity`).
- Landing page checked for layout and text legibility at 375 / 768 / 1024 / 1440 (no
  horizontal overflow at any width).
- Not verified: a visual gallery of every variant (no showcase page), light/dark OS theme on
  every field, keyboard/accessibility pass, measured contrast ratios, pixel match against every
  Figma breakpoint.
