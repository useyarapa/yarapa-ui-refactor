# Yarapa UI — Publish Architecture Design

Date: 2026-09-03
Status: approved
Scope: rename to `@yarapa-ui/*`, introduce `@yarapa-ui/styles`, migrate to Base UI, tsdown build, Changesets + npm Trusted Publishing, agent DX (llms.txt). First deliverable is a 3-component vertical slice, not a bulk rewrite.

## Goal

Open-source UI library ecosystem for web and future platforms. Install once, works:

```sh
pnpm add @yarapa-ui/react
```

```ts
import "@yarapa-ui/react/styles.css";
import { Button } from "@yarapa-ui/react/button";
```

Plain HTML/CSS consumers, Astro, and future Vue use the same CSS contract without React. Native (future) consumes tokens, not CSS.

Guiding rule: do not invent Yarapa-specific conventions where an established web/React/CSS/Base UI convention exists. Precedent followed: HeroUI v3 (`@heroui/styles` BEM standalone CSS), Chakra UI (CSS variables, `llms.txt`/MCP), daisyUI (framework-agnostic semantic classes), Base UI (upstream state attributes). These are precedents, not universal mandates; each choice below is Yarapa's own decision backed by at least one precedent.

## Packages

| Package | Role | Depends on |
|---|---|---|
| `@yarapa-ui/tokens` | Design primitives: `dist/tokens.css` (`--yp-*` vars, all themes) + `dist/tokens.json`. No component behavior. | — |
| `@yarapa-ui/styles` | Framework-agnostic visual CSS: BEM classes, themes, cascade layers, selective imports. Plain CSS source, no Tailwind requirement. | `@yarapa-ui/tokens` (build-time) |
| `@yarapa-ui/react` | Ergonomic React API on Base UI. Maps props → BEM classes. Owns no visual CSS and no state protocol. | `@yarapa-ui/styles`, `@base-ui-components/react` |

Future: `@yarapa-ui/vue`, `@yarapa-ui/native`. Do not create `core`/`utils`/`theme`/`icons` until a proven shared responsibility appears.

Dependency chain: react → styles → tokens. One install pulls the chain.

### Plain-HTML boundary (precise wording for docs)

- Static/visual HTML (`<button class="yp-button yp-button--primary">`) works with `@yarapa-ui/styles` alone, 100%.
- Interactive components (dialog, select, menu): CSS provides visuals and state selectors, but behavior/a11y/state lifecycle must come from a framework implementation (React via Base UI today, Vue later). Never claim CSS alone delivers interactive behavior.
- This is why `@yarapa-ui/vue` cannot reuse Base UI (React runtime) — future Vue target needs its own behavior layer over the same `yp-*` class contract.

## Naming contract

- npm scope `@yarapa-ui` (must be created as npm org before first publish — user action, prerequisite).
- CSS class namespace `yp-*`, CSS custom properties `--yp-*`. Namespace only, not a new methodology.
- Component/element/modifier naming follows established BEM conventions (precedent: HeroUI v3):

```css
.yp-button {}
.yp-button--primary {}   /* visual variant  */
.yp-button--sm {}        /* visual size     */
.yp-dialog__popup {}     /* element/part    */
```

- Visual variants/sizes are BEM modifier classes chosen from React props. No `data-variant`, no `data-size`.
- Behavior/state attributes come from Base UI, used exactly as documented per primitive (e.g. Switch `[data-checked]`/`[data-unchecked]`, open/close animation `[data-open]`/`[data-closed]`/`[data-starting-style]`/`[data-ending-style]`). No translation layer (`data-yp-open`, custom `data-state`, `data-slot`), no duplication.
- Native HTML/ARIA stays native: `disabled`, `aria-busy`, `aria-invalid`, `aria-expanded`.
- `loading`: renders spinner child (`.yp-button__spinner`), sets `disabled` + `aria-busy`. No `data-loading`.
- React anatomy: where Base UI exposes an anatomy (Root/Trigger/Portal/Popup…), keep upstream names; do not rename to Yarapa vocabulary.

### React → class mapping

```tsx
<BaseButton
  className={cn(
    "yp-button",
    `yp-button--${variant}`,
    `yp-button--${size}`,
    className,
  )}
>
```

`cn()` = `clsx` only (drop `tailwind-merge`; Tailwind is no longer in the contract).

## CSS delivery

Consumer must NOT need: Tailwind installed, `@source` config, or compiling `@yarapa-ui/react` TSX from node_modules. No Tailwind preflight may leak into consumers.

Build-time flow, single source of truth, zero runtime package-CSS resolution:

```
packages/tokens/src/*.json
        ↓ build.mjs (existing)
@yarapa-ui/tokens/dist/tokens.css        ← canonical source, one copy
        ↓ inlined at styles build (merge, not copied source)
@yarapa-ui/styles/dist/index.css         ← tokens + all component CSS, one file
@yarapa-ui/styles/dist/<name>.css        ← selective, assume vars already loaded
        ↓ react ships one forwarding file, no copied bytes
@yarapa-ui/react/styles.css = @import "@yarapa-ui/styles";
```

### `@yarapa-ui/styles` exports map

| Specifier | Content |
|---|---|
| `@yarapa-ui/styles` / `./index.css` | tokens inlined + all components + themes, one self-contained file |
| `@yarapa-ui/styles/tokens.css` | `--yp-*` variables only (all themes) |
| `@yarapa-ui/styles/button.css`, `./dialog.css`, … | one file per component; requires tokens CSS loaded once |
| `@yarapa-ui/styles/themes/dark.css` | theme override block, optional |

Selective files never re-inline tokens (no duplicate `--yp-*` definitions anywhere).

### Cascade layers

Library CSS is layered so app styles win without `!important` (MDN: cascade layers exist for third-party/component-library styles):

```css
@layer yarapa-tokens, yarapa-components;
@layer yarapa-tokens    { /* --yp-* declarations */ }
@layer yarapa-components{ /* .yp-* rules */ }
```

No `!important` in library CSS. Themes = `[data-theme="dark"|"high-contrast"]` blocks + `@media (forced-colors)` + `prefers-reduced-motion` + `dir="rtl"`, same token pipeline as today.

## Build

- `@yarapa-ui/react`: tsdown → ESM + `.d.ts`. Curated public exports (API contract, explicit list, no wildcard `./src/*`):

```json
{
  ".":           "./dist/index.js",
  "./button":    "./dist/button.js",
  "./dialog":    "./dist/dialog.js",
  "./styles.css": "./dist/styles.css"
}
```

- `@yarapa-ui/tokens`: keep `build.mjs`, rename package, emit `dist/tokens.css` + `dist/tokens.json`, `publishConfig` added.
- `@yarapa-ui/styles`: plain CSS authored in `src/`, build = token-inline + bundle per-component files + `dist/index.css`.
- Legacy `packages/ui` (`@repo/ui`, 33 components, Radix + cva + Tailwind, raw-TSX exports): stays private/unpublished during migration; components move one at a time into the new architecture. When the last component migrates, `packages/ui` is deleted and Tailwind drops out of the react package.

## Testing / quality gates

- Storybook (react-vite) stays the component harness: every migrated component gets stories; axe a11y (`a11y: { test: "error" }`) + `play()` interaction tests via `@storybook/test-runner`. The Vite harness doubles as the Vite integration proof.
- `fixtures/plain-html`: static HTML + `styles/dist/index.css` via `<link>`/relative import, Playwright asserts computed styles (e.g. `.yp-button--primary` background = accent token). Proves framework-free usage.
- `apps/docs` (Next.js 16): consumer app, build must pass = Next.js integration proof.
- Package validation before publish: `publint` + `attw` on packed tarballs.

## Release

- npm public only. `publishConfig: { access: "public", registry: "https://registry.npmjs.org/" }` on all three packages.
- Changesets, fixed version group (tokens+styles+react bump together — the `yp-*`/`--yp-*` contract crosses package boundaries and must stay lock-step). Semver + generated CHANGELOGs.
- CI publish: GitHub Actions + npm Trusted Publishing (OIDC), provenance automatic. No long-lived npm token.
- CI order: lint → typecheck → unit tests → build → publint/attw → plain-html fixture → Next.js build → Vite (Storybook) tests → changesets publish.

## Agent DX (v1 requirement)

Docs are a first-class product output; never assume models know Yarapa UI from training data.

- Structured Markdown component docs, fixed schema per component:
  `# Name / ## Import / ## Usage / ## Props / ## Variants / ## Sizes / ## States / ## Anatomy / ## Accessibility / ## Styling / ## Examples`
  `## States` lists only real upstream Base UI attributes for that primitive.
- Source: component docs in `apps/docs`; build script generates machine-readable files (generated, never hand-maintained):
  - `llms.txt` — index, points at the rest
  - `llms-full.txt` — full reference in one file
  - `llms-components.txt` — every component doc concatenated
  - `llms-patterns.txt` — recipes (theming, RTL, forced-colors, form integration)
- Later (not v1): MCP server (Chakra-style `list_components`/`get_component_props`/`get_component_example`), agent skills. No proprietary manifest format first.

## Migration strategy — vertical slice first

Do not rewrite 33 components at once. Prove the whole contract on three, in this order:

1. **Button** — static/simple, variant+size BEM mapping, `loading` spinner pattern.
2. **Input** — form state, Base UI `[data-disabled]`/invalid via `aria-invalid`, focus styling.
3. **Select** — compound Base UI component: portal, positioning, overlay, open/close animation attributes, keyboard/a11y. (Chosen over Dialog: Base UI Select exercises more of the state contract surface in one component.)

Slice is done when all pass:
- class contract stable (`yp-button--*`, Base UI attrs untouched)
- plain-html fixture green (computed-style assertions)
- Next.js (`apps/docs`) + Vite (Storybook) builds green
- tokens defined in exactly one place
- `@yarapa-ui/{tokens,styles,react}` publishable (publint/attw clean, dry-run pack correct)
- llms.txt generated from docs

Only then migrate the remaining ~30 components, each as its own PR: stories + plain-html coverage + docs entry per component.

Implementation-plan scope: repo restructure (renames, new `packages/styles`, build/release tooling) + the 3-component slice. Bulk migration is follow-up work, each component its own plan-sized PR.

## Conventionality rules (freeze list)

1. Base UI = authoritative behavior, a11y, keyboard/focus, documented state attributes, documented dynamic CSS variables. Never translate or duplicate.
2. React props stay ergonomic (`variant`, `size`, `disabled`, `loading`); compound APIs follow upstream anatomy names.
3. Visual variants/sizes = BEM modifier classes (precedent: HeroUI v3), not data attributes.
4. Tokens = CSS custom properties `--yp-*` + JSON; single canonical source.
5. Styles = plain authored CSS, framework-agnostic visual layer, full + selective exports, cascade layers, no consumer Tailwind.
6. Avoid: custom state protocols, `data-slot`, `data-variant`/`data-size`, generated public class names, proprietary styling DSL, `!important` override strategy, custom abstractions where browser/React/Base UI already provide one.
7. No new packages beyond tokens/styles/react until a proven shared responsibility appears.

## Prerequisites / open items

- [ ] User creates npm org `@yarapa-ui` on npmjs.com (free; only possible via human login). Must happen before first publish; scope currently appears unused but unverified for ownership.
- [ ] Confirm `@base-ui-components/react` package name/version at plan time (upstream renamed scopes; verify against current docs before pinning).
- [ ] pnpm 11 + workspace config for new `packages/styles` dir; turbo task graph extension.
