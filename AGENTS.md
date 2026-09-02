# YARAPA UI

pnpm + Turbo monorepo building the `@yarapa-ui/*` open-source UI ecosystem. Target architecture is fixed in `docs/superpowers/specs/2026-09-03-yarapa-ui-publish-architecture-design.md` — read it before implementing; it is the source of truth for package names, the token → styles → react layering, BEM/`yp-*` class contract, Base UI state-attribute rules, and the release pipeline.

## Current state

- `packages/tokens` — DTCG-style token source + builder (still named `@repo/tokens`; renames to `@yarapa-ui/tokens` happen in the migration).
- `packages/eslint-config`, `packages/typescript-config` — shared flat configs (`@repo/eslint-config/base`, `/next-js`, `/react-internal`).
- Legacy `packages/ui`, `apps/docs`, and the Storybook/Playwright CI job were removed — do not resurrect them; rebuild fresh under the spec.

## Toolchain

- Node 24 (`.nvmrc`), pnpm 11 (`packageManager` field). Install: `pnpm install`.
- Turbo orchestrates `build` / `dev` / `lint` / `check-types` across workspaces (`apps/*`, `packages/*`). Prettier: `pnpm format`.

## Commands

```sh
pnpm build                # all packages (turbo run build)
pnpm lint                 # eslint across workspaces, --max-warnings 0
pnpm check-types          # tsc --noEmit across workspaces

pnpm --filter @repo/tokens build        # regenerate dist/tokens.css (dist is gitignored)
```

Run one package's task with `pnpm --filter <pkg> <script>`.

## Commits

Husky `commit-msg` hook runs commitlint (conventional commits) with strict rules: type AND scope required, subject ≤ 50 chars, **body and footer must be empty** — commits are a single line, e.g. `docs(specs): fix dependency model`. Types: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test.

## Token pipeline (source of truth: `packages/tokens/src`)

DTCG-style JSON: `primitives.json` (raw scale) + `semantic.{light,dark,high-contrast}.json` (reference primitives via `{alias}` syntax). `build.mjs` flattens, resolves aliases, and emits `dist/tokens.css` as CSS custom properties (`--yp-*`), one theme block per selector: `:root` (light), `[data-theme="dark"]`, `[data-theme="high-contrast"]`. Theme switching is runtime attribute-based, not build-time.

The spec extends this to base-only `tokens.css` + per-theme `themes/{dark,high-contrast}.css` + `tokens.json` as `@yarapa-ui/tokens`.

## Architecture rules that bind all new code

- Base UI (`@base-ui/react`) owns behavior, a11y, and state attributes — use its documented `data-*` hooks exactly, never translate or duplicate.
- Visual variants/sizes are BEM modifier classes (`.yp-button--primary`), never `data-variant`/`data-size`.
- Plain authored CSS in `@yarapa-ui/styles`; no Tailwind in the consumer contract; cascade layers; no `!important`.
- Tokens are the single hand-maintained source; generated artifacts may overlap by aggregation, sources may not.
- See the spec's "Conventionality rules (freeze list)" section for the full list.
