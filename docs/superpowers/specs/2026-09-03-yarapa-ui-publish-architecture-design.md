# Yarapa UI — Publish Architecture Design

Date: 2026-09-03
Status: approved
Scope: rename to `@yarapa-ui/*`, introduce `@yarapa-ui/styles` (CSS + variant contract), adopt Base UI selectively, tsdown build, Changesets + npm Trusted Publishing, agent DX (llms.txt). First deliverable is a 3-component vertical slice, not a bulk rewrite.

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

Guiding rule: do not invent Yarapa-specific conventions where an established web/React/CSS/Base UI convention exists. Precedent followed: HeroUI v3 (`@heroui/styles` BEM CSS + exported `buttonVariants()` contract, React Aria primitives per component), Cloudflare Kumo (Base UI as selective dependency, standalone compiled CSS export alongside Tailwind entry), Chakra UI (CSS variables, `llms.txt`/MCP), daisyUI (framework-agnostic semantic classes), Base UI (upstream state attributes). These are precedents, not universal mandates; each choice below is Yarapa's own decision backed by at least one precedent.

## Packages

| Package | Role | Runtime deps | Build deps |
| --- | --- | --- | --- |
| `@yarapa-ui/tokens` | Design primitives: canonical token source; emits `dist/tokens.css` (base tokens) + `dist/themes/*.css` + `dist/tokens.json`. No component behavior. | none | — |
| `@yarapa-ui/styles` | Framework-agnostic styling **contract**: compiled standalone BEM CSS + variant resolver functions + variant TypeScript types (`buttonVariants`, `ButtonVariants`, …). Tailwind is an internal authoring/build tool only. | variant resolver lib (CVA vs `tailwind-variants`, decided in slice — shared by all platform wrappers) | `@yarapa-ui/tokens` |
| `@yarapa-ui/react` | Ergonomic React API. Uses native HTML where sufficient; Base UI primitives only where behavior/a11y/focus/positioning are required. Imports variant functions from styles — never reconstructs class strings. Owns no visual CSS and no state protocol. | `@yarapa-ui/styles`; `@base-ui/react` only if some component truly imports it (Button may not) | — |

Future: `@yarapa-ui/vue`, `@yarapa-ui/native`. Do not create `core`/`utils`/`theme`/`icons` until a proven shared responsibility appears.

Dependency model — Base UI is a primitive dependency, not an architectural layer under every component:

```text
SOURCE / BUILD
@yarapa-ui/tokens  ──build──▶  @yarapa-ui/styles
                                (CSS + variant contract)
                                      │
                                      ▼
                               @yarapa-ui/react
                                /            \
                       native HTML        Base UI
                       when enough        when behavior needed

PUBLISHED RUNTIME
@yarapa-ui/react
 ├── @yarapa-ui/styles        (CSS + variant contract)
 └── @base-ui/react           (where imported)
```

`@yarapa-ui/styles/dist/index.css` already inlines tokens, and selective CSS uses `@yarapa-ui/styles/tokens.css` — so styles does not runtime-depend on `@yarapa-ui/tokens`. `pnpm add @yarapa-ui/react` installs react + styles (+ variant resolver lib + Base UI where used). No package is installed that runtime never uses.

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
- Where a component uses a Base UI primitive, its documented state attributes are used exactly as upstream emits them (e.g. Switch `[data-checked]`/`[data-unchecked]`, open/close animation `[data-open]`/`[data-closed]`/`[data-starting-style]`/`[data-ending-style]`), styled from `@yarapa-ui/styles`. No translation layer (`data-yp-open`, custom `data-state`, `data-slot`), no duplication. Components that don't need a primitive use native HTML state (`:disabled`, `:focus-visible`) — no invented state attributes either.
- Native HTML/ARIA stays native: `disabled`, `aria-busy`, `aria-expanded`. Form validity: native `:invalid`/`aria-invalid` for plain inputs; where Base UI Field/Input is used, its documented attributes (`[data-invalid]`, `[data-disabled]`, `[data-focused]`, …) are styled directly — do not reproduce an attribute upstream already emits.
- `loading`: spinner child (`.yp-button__spinner`) + `disabled` + `aria-busy`. If focus retention while disabled is required, use Base UI Button `focusableWhenDisabled` (Base UI guidance); if Button stays native `<button>`, standard browser focus behavior applies. The Button slice decides. No `data-loading`.

- React anatomy: where Base UI exposes an anatomy (Root/Trigger/Portal/Popup…), keep upstream names; do not rename to Yarapa vocabulary.

### Variant contract lives in `@yarapa-ui/styles`

Class names and variant types are owned by styles. The resolver library is **evaluated during the slice, not frozen now**: `class-variance-authority` (officially supports BEM, Tailwind-optional) is the leading candidate; `tailwind-variants` is evaluated alongside it. Do not invent a proprietary Yarapa resolver, and do not copy Kumo's `resolveVariant` unless established libraries cannot satisfy the requirement. Example shape (CVA shown as candidate, not decision):

```ts
// @yarapa-ui/styles/button.ts
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva("yp-button", {
  variants: {
    variant: {
      primary: "yp-button--primary",
      secondary: "yp-button--secondary",
      outline: "yp-button--outline",
      ghost: "yp-button--ghost",
    },
    size: {
      sm: "yp-button--sm",
      md: "yp-button--md",
      lg: "yp-button--lg",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});
export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

React consumes it (native element when sufficient):

```tsx
import { buttonVariants, type ButtonVariants } from "@yarapa-ui/styles/button";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  loading?: boolean;
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant, size, className })} {...props} />;
}
```

Compound/Base UI components resolve per part:

```tsx
<SelectPrimitive.Trigger className={selectVariants.trigger({ size })} />
```

`cn()` = `clsx` (the resolver composes class lists; `tailwind-merge` is dropped — no Tailwind in the consumer contract).

## CSS delivery

Tailwind is an internal authoring/build tool of `@yarapa-ui/styles` (precedent: Kumo ships compiled standalone CSS while building with Tailwind internally). The Button/Input/Select slice must prove that internal Tailwind authoring + standalone CSS compilation preserves the legacy styles before migrating the rest — no hand-rewriting ~30 components to raw CSS unless the slice shows it fails.

Consumers get compiled, self-contained CSS:

```text
AUTHORING (internal only)
Tailwind utilities/@apply + plain CSS in packages/styles/src
        │ build: Tailwind v4 compile scoped to styles source,
        │        output namespaced under .yp-* rules — no preflight leak
        ▼
PUBLISHED
@yarapa-ui/styles CSS artifacts (below)
        ▼
consumer: NO Tailwind install, NO @source, NO node_modules TSX compilation
```

Build-time flow, single hand-maintained token source, zero runtime package-CSS resolution:

```text
packages/tokens/src/*.json               ← single hand-maintained source
        │ build.mjs
        ▼
@yarapa-ui/tokens/dist/tokens.css        ← base/default tokens only
@yarapa-ui/tokens/dist/themes/dark.css   ← [data-theme="dark"] overrides
@yarapa-ui/tokens/dist/themes/high-contrast.css
@yarapa-ui/tokens/dist/tokens.json
        │ consumed at styles build (generate, don't hand-copy)
        ▼
@yarapa-ui/styles/dist/index.css         ← generated aggregate: base + themes + all components
@yarapa-ui/styles/dist/tokens.css        ← generated base-token artifact
@yarapa-ui/styles/dist/themes/dark.css   ← generated theme artifact
@yarapa-ui/styles/dist/button.css        ← selective; assumes token CSS loaded once
@yarapa-ui/styles/dist/*.js + *.d.ts     ← compiled variant contract
        │ react ships one forwarding file, no copied bytes
        ▼
@yarapa-ui/react/styles.css = @import "@yarapa-ui/styles";
```

### `@yarapa-ui/styles` exports map

CSS:

| Specifier | Content |
| --- | --- |
| `@yarapa-ui/styles` / `./index.css` | generated aggregate: base + themes + all components, one self-contained file |
| `@yarapa-ui/styles/tokens.css` | `--yp-*` base variables |
| `@yarapa-ui/styles/themes/dark.css` | dark theme override block, optional |
| `@yarapa-ui/styles/button.css`, `./dialog.css`, … | one file per component; requires token CSS loaded once |

JS contract (framework-agnostic, same for future vue/native-web wrappers):

| Specifier | Content |
| --- | --- |
| `@yarapa-ui/styles/button` | `buttonVariants` resolver, `ButtonVariants` type |
| `@yarapa-ui/styles/input` | `inputVariants`, `InputVariants` |
| `@yarapa-ui/styles/select` | `selectVariants` (incl. `.trigger`/`.popup` part resolvers), `SelectVariants` |

Rule wording: **no duplicated hand-maintained token source.** Generated artifacts may legitimately contain overlapping `--yp-*` declarations because they exist for aggregation — e.g. a selective user imports `styles/tokens.css` + `styles/button.css`; the full user imports only `index.css`. The hand-authored JSON in `packages/tokens/src` is the only place any value is written. Likewise the `*Variants` definitions are the only hand-maintained class contract; CSS and React both consume them.

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

- `@yarapa-ui/tokens`: keep `build.mjs`, rename package; extend emit to base-only `dist/tokens.css` + per-theme `dist/themes/{dark,high-contrast}.css` + `dist/tokens.json`, `publishConfig` added.
- Base UI import: `@base-ui/react` (official current name; per-primitive subpath imports like `@base-ui/react/select`), **used per component only when behavior is needed**, not as a universal wrapper layer.
- `@yarapa-ui/styles`: two build outputs —
  - CSS: Tailwind-assisted authored CSS in `src/`, compiled to standalone per-component CSS + aggregated `dist/index.css` with token inline; no preflight in output.
  - JS: tsdown compiles variant modules to ESM + `.d.ts` (`dist/button.js` etc.).
- `@yarapa-ui/react`: tsdown as above; imports `@base-ui/react/*` only in components that need a primitive.
- Legacy components (the removed `packages/ui` prototypes) are reference material from git history during migration, not a compatibility constraint.

## Testing / quality gates

- Storybook (react-vite) returns as the component harness in `packages/react`: every migrated component gets stories; axe a11y (`a11y: { test: "error" }`) + `play()` interaction tests via `@storybook/test-runner`. The Vite harness doubles as the Vite integration proof.
- `fixtures/plain-html`: static HTML + `styles/dist/index.css` via `<link>`/relative import, Playwright asserts computed styles (e.g. `.yp-button--primary` background = accent token). Proves framework-free usage.
- `apps/docs` (Next.js 16, rebuilt): consumer app, build must pass = Next.js integration proof.
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

1. **Button** — tests the native-HTML path: `<button>` + `buttonVariants` (owned by styles) + `loading` spinner pattern. Decide here whether Base UI `Button` (`focusableWhenDisabled`) is needed or native suffices; requirement-driven, not architecture-driven.
2. **Input** — native `<input>` first; adopt Base UI Field/Input (and its `[data-disabled]`/`[data-invalid]`/`[data-focused]` attributes) only if a concrete form/validation behavior requirement justifies it. Either way, variant contract comes from styles.
3. **Select** — tests the compound Base UI path: portal, positioning, overlay, open/close animation attributes, keyboard/a11y, per-part variant resolvers (`selectVariants.trigger`, `.popup`). (Chosen over Dialog: Base UI Select exercises more of the state contract surface in one component.)

Together the slice proves all three paths: styles-only (BEM CSS), variant contract (props→classes, single source), primitive-selective (Base UI where behavior is required) — plus whether internal Tailwind authoring compiles to standalone CSS that preserves the legacy look (the bulk-migration cost question).

Slice is done when all pass:

- class contract stable (`yp-button--*` defined once in styles; Base UI attrs untouched)
- plain-html fixture green (computed-style assertions)
- Next.js (`apps/docs`) + Vite (Storybook) builds green
- tokens defined in exactly one place
- `@yarapa-ui/{tokens,styles,react}` publishable (publint/attw clean, dry-run pack correct)
- llms.txt generated from docs

The slice must also answer, before bulk migration:

- Can `@yarapa-ui/styles` own the variant contract cleanly?
- CVA or `tailwind-variants`?
- Do existing Tailwind-authored styles compile to standalone CSS without consumer Tailwind?
- Does native HTML work better for simple components (Button, Badge, Spinner, Separator, basic Input)?
- Does Base UI integration stay clean for complex components?
- Does React avoid owning duplicate styling contracts?
- Can future Vue consume the same visual/variant contract?

Only after these pass, migrate the remaining ~30 components, each as its own PR: stories + plain-html coverage + docs entry per component.

### Borrow / do not borrow

| Follow | Precedent | Do not copy |
| --- | --- | --- |
| styles package owns variant mappings; React consumes resolver functions | HeroUI v3 `buttonVariants` in `@heroui/styles` | HeroUI's consumer-Tailwind requirement |
| native elements for simple components; headless primitives selected per need | Kumo Button = native, Select/Popover = Base UI | Kumo's proprietary `resolveVariant` |
| ergonomic typed `size`/`variant` props; centralized recipe contract; llms.txt/MCP | Chakra UI | Chakra's runtime styled-system/Emotion architecture |

Implementation-plan scope: repo restructure (renames, new `packages/styles`, build/release tooling) + the 3-component slice. Bulk migration is follow-up work, each component its own plan-sized PR.

## Conventionality rules (freeze list)

1. Base UI = authoritative behavior/a11y/state attributes **where a component uses it**. It is a headless primitive dependency, not a layer under every component: simple components may use native HTML; complex interactive ones (Select, Popover, Dialog, Tabs, Tooltip, Combobox) use Base UI where it provides value.
2. Never translate or duplicate Base UI state attributes; never invent state where native HTML already provides it (`:disabled`, `:focus-visible`).
3. React props stay ergonomic (`variant`, `size`, `disabled`, `loading`); compound APIs follow upstream anatomy names.
4. Visual variants/sizes = BEM modifier classes from the **styles package's variant contract** (precedent: HeroUI v3 `buttonVariants` in `@heroui/styles`), not data attributes. React never reconstructs class strings.
5. Tokens = CSS custom properties `--yp-*` + JSON; single canonical source.
6. Styles = framework-agnostic contract package: compiled CSS + variant resolver functions + variant types; full + selective exports; cascade layers; consumer Tailwind not required (Tailwind internal authoring allowed, Kumo precedent).
7. Avoid: custom state protocols, `data-slot`, `data-variant`/`data-size`, custom variant resolvers when CVA/tailwind-variants exist, generated public class names, proprietary styling DSL, `!important` override strategy, custom abstractions where browser/React/Base UI already provide one.
8. No new packages beyond tokens/styles/react until a proven shared responsibility appears.

## Prerequisites / open items

- [ ] User creates npm org `@yarapa-ui` on npmjs.com (free; only possible via human login). Must happen before first publish; scope currently appears unused but unverified for ownership.
- [x] Base UI package confirmed: `@base-ui/react`, subpath imports (`@base-ui/react/button`).
- [ ] Trusted Publishing setup: GitHub OIDC, `id-token: write`, npm CLI ≥ 11.5.1, Node ≥ 22.14.0; provenance generated automatically with trusted publishing.
- [ ] pnpm 11 + workspace config for new `packages/styles` dir; turbo task graph extension.
