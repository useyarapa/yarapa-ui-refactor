# YARAPA UI

The YARAPA design-system foundation: semantic design tokens, a framework-agnostic visual CSS layer, and accessible React components built on Base UI — published as the `@yarapa-ui/*` ecosystem.

The architecture, package contracts, and release pipeline are specified in
[`docs/superpowers/specs/2026-09-03-yarapa-ui-publish-architecture-design.md`](docs/superpowers/specs/2026-09-03-yarapa-ui-publish-architecture-design.md).

## Target packages

- `@yarapa-ui/tokens` — DTCG-style token source of truth, built to CSS custom properties (`--yp-*`) + JSON.
- `@yarapa-ui/styles` — framework-agnostic visual CSS (BEM `yp-*` classes, themes, cascade layers).
- `@yarapa-ui/react` — ergonomic React components on Base UI.

## Current state

`packages/tokens` is live; the `@yarapa-ui/*` packages are being built per the spec. The legacy `packages/ui` / `apps/docs` prototypes were removed during the rename — the rebuild replaces them under the new architecture.

## Commands

```sh
pnpm install
pnpm build
pnpm lint && pnpm check-types
```

## CI

`.github/workflows/ci.yml` runs tokens build → lint → typecheck → build on every PR. Storybook/a11y and release jobs return as the new packages land (see spec).
