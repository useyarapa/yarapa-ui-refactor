# YARAPA UI

The YARAPA design-system foundation: semantic design tokens, accessible components built on Radix Primitives, and a Storybook-based quality pipeline.

See [`docs/ui-foundation.md`](docs/ui-foundation.md) for the architecture, token contract, theming, accessibility and performance governance (issue #1).

## Structure

- `packages/tokens` — DTCG-style token source of truth, built to CSS custom properties (light / dark / high-contrast + reduced-motion + forced-colors).
- `packages/ui` (`@repo/ui`) — component library styled via Tailwind v4 mapped onto the semantic tokens.
- `apps/web` — product app consuming `@repo/ui`.
- `apps/docs` — documentation entry point.

## Commands

```sh
pnpm install
pnpm build                                   # tokens, apps
pnpm lint && pnpm check-types

pnpm --filter @repo/ui storybook             # component workbench (theme + RTL toolbars)
pnpm --filter @repo/ui test:storybook        # axe a11y + interaction tests
```

## CI

`.github/workflows/ci.yml` runs tokens build → lint → typecheck → build, then builds Storybook and runs the test suite (accessibility + interaction) on every PR.
