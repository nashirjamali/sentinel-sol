# Design system

**Status:** prototype
**Owner milestone:** `docs/product/planned/m7-frontend.md`

## Problem

The frontend was styling Figma components with colocated CSS Modules, while the intended stack
is Tailwind CSS plus shadcn/ui. That duplicated tokens, made variants hard to compose, and kept
the kit from being a reusable design system. The static landing hero (`Header`, `Hero`,
`CoverageLedger`) is also out of the way — it will be restructured later, not carried forward
as the app shell.

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
  organisms/    # page-level sections (HorizontalFilter)
app/lib/utils.ts
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
- Not verified: a visual gallery of every variant (no showcase page), light/dark OS theme on
  every field, keyboard/accessibility pass, pixel match against every Figma breakpoint.
