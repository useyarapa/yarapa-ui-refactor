# YARAPA UI Foundation

This document describes the UI-system foundation behind `@repo/ui` and the quality bar that governs it (issue #1).

## Architecture

```
@repo/tokens (DTCG-style source of truth)
        │  build.mjs → dist/tokens.css (CSS custom properties)
        ▼
native platform element ── Radix primitive (complex interaction) ── YARAPA component API ── product
        │
        ▼
@repo/ui (Tailwind v4 theme mapped onto semantic tokens)
```

- **No hand-rolled interactive primitives.** Anything with focus management, keyboard semantics, or ARIA wiring (dialog, menu, select, tabs, tooltip, toast, …) is composed from [Radix Primitives](https://www.radix-ui.com/primitives).
- **No raw values in components.** Components style themselves through semantic token variables (`--yp-color-*`, `--yp-space-*`, …); app code styles itself through the Tailwind utilities that map onto the same tokens.

## Design tokens (`@repo/tokens`)

- Source format follows the [Design Tokens Community Group](https://www.designtokens.org/) draft (`$value` / `$type`, `{references}`), stored in `packages/tokens/src/*.json`.
- Domains: **color, spacing, typography, radius, border, elevation (shadow), motion (duration + easing), opacity, z-index, breakpoints**.
- `node build.mjs` resolves references and emits `dist/tokens.css` plus a resolved `dist/tokens.json` for tooling/tests. Unresolved or circular references fail the build.
- Semantic aliases are emitted per theme:
  - `:root` — light (also the fallback layer)
  - `[data-theme="dark"]`
  - `[data-theme="high-contrast"]` (overrides on top of light)
  - `@media (prefers-reduced-motion: reduce)` collapses motion durations to 0
  - `@media (forced-colors: active)` remaps structural colors and drops shadows so Windows High Contrast / forced-colors stay usable

### Theme switching

Set `data-theme` on `<html>` (or any subtree). Theme switching changes semantic token values only — components never duplicate styling per theme.

## Component API conventions

- All components forward native props through and use `forwardRef`; no app-specific props.
- `Button`/`IconButton`/`Link` support `asChild` (Radix Slot) for router integration.
- `Card` is a plain container — links/actions are composed by the caller (the starter's hard-coded tracking link is gone).
- Direction-sensitive styles use logical properties (`ps/pe`, `start/end`, `ms/me`) so Thai/English and any future RTL locale work without component changes. Icons that imply direction (chevrons) are flipped via `rtl:rotate-180`.

## Accessibility (WCAG 2.2 AA target)

- Keyboard operation and visible focus come from Radix behavior plus a single global `:focus-visible` ring contract.
- Forms: `FormField`/`FormLabel`/`FormHint`/`FormError` wire `htmlFor`, `aria-describedby`, and `aria-invalid`.
- Overlays: focus is trapped and restored by Radix dialogs/menus/popovers; scrim + z-index scale prevent focus landing under overlays.
- Target size: controls are ≥ 40px tall (`h-10`), icons `size-10`.
- `prefers-reduced-motion` disables all animated states.
- Storybook runs [axe-core](https://github.com/dequelabs/axe-core) on every story with `a11y: { test: "error" }` — violations fail CI.

## Component quality pipeline

`packages/ui` runs [Storybook](https://storybook.js.org/docs/writing-tests):

- `pnpm --filter @repo/ui storybook` — component workbench with theme + direction (LTR/RTL) toolbars.
- `pnpm --filter @repo/ui test:storybook` — the [test runner](https://storybook.js.org/docs/writing-tests/test-runner) executes:
  - **Accessibility checks** (axe assertions per story),
  - **Interaction tests** (play functions, e.g. dialog open/close and tabs arrow-key navigation).
- **Visual regression**: connect [Chromatic](https://www.chromatic.com/) (add `@chromatic-com/storybook` and run `chromatic --exit-zero-on-changes` in CI with a `CHROMATIC_PROJECT_TOKEN` secret). The pipeline is Chromatic-ready; the account token is deliberately not committed.

Every reusable component must have at least one story with its documented states before it is considered production-ready.

## Responsive & layout system

- `Box`, `Stack`, `Inline`, `Grid`, `Container` are token-backed: spacing props accept keys of the semantic spacing scale (`"2"`, `"4"`, …) and resolve to `var(--yp-space-*)`.
- `Grid` supports `minColumnWidth` for media-query-free auto-fit reflow; `Container` matches the token breakpoints.

## Performance governance

Reference targets (Core Web Vitals):

| Metric | Budget |
| ------ | ------ |
| LCP | ≤ 2.5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |

Practical rules for the foundation:

- No heavy runtime dependencies in `@repo/ui`; behavior primitives come from tree-shakeable Radix packages, styles are a single static CSS file.
- Animations are transform/opacity-only and token-duration bound, keeping them off the main thread and INP-safe.
- Skeletons and fixed-height rows prevent CLS while loading.
- Component additions must keep the Storybook build green; CI budget checks (bundle size) can be layered on via [size-limit](https://github.com/ai/size-limit) once product usage establishes a baseline. Field/RUM metrics belong to the product apps.

## Scope guard

This foundation does not redesign YARAPA product screens. Product-specific patterns (nav bars, page layouts, marketing visuals) are built **on top of** these primitives, never inside them.
