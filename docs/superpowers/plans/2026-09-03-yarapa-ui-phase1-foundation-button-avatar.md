# Yarapa UI Phase 1 Implementation Plan — Foundation + Button + Avatar

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove the `@yarapa-ui/{tokens,styles,react}` package/build architecture end-to-end using exactly two components — Button and Avatar — each gated by a user design review.

**Architecture:** Per `docs/superpowers/specs/2026-09-03-yarapa-ui-publish-architecture-design.md` (the spec is the source of truth; this plan implements it and does not restate rationale). Tokens emit base CSS + per-theme files; styles owns the BEM `yp-*` CSS and the variant resolver contract (Tailwind is internal authoring only); React consumes resolvers and uses native HTML unless a concrete requirement justifies a primitive. Phase 1 has NO Base UI-backed component: Button is native, Avatar's primitive choice is decided in its design-proposal checkpoint (Task 8) only if its real requirements need it.

**Tech Stack:** pnpm 11.23 workspace + Turbo, Node 24, TypeScript 7.0.2, tsdown (ESM + d.ts), Tailwind CSS 4.3.x (internal compiler only, `@reference` pattern), class-variance-authority (single-part contract for Phase 1; the multi-part CVA-vs-tailwind-variants slot decision stays deferred to the future Select phase — do NOT pin a multipart interface or build a Yarapa adapter to force two libraries to look alike), Storybook 10 + addon-vitest + addon-a11y (browser mode via Playwright), Vitest 4, Playwright 1.62, publint + attw.

## Scope — Phase 1 (hard boundary)

**In scope, nothing else:** `@yarapa-ui/tokens` + `@yarapa-ui/styles` + `@yarapa-ui/react` foundation (rename/scaffold, build outputs, variant contract mechanism, standalone CSS); Button; Avatar; tests/stories/docs for Button and Avatar only; local package validation (publint/attw); CI quality gates.

**Explicitly OUT of scope (do not implement, scaffold, or "prepare"):** Input, Select, Dialog, Popover, Tabs, Menu, the remaining ~30 components, bulk migration, npm org setup, Trusted Publishing configuration, release workflow, first changeset, `apps/docs`, llms.txt generation, any publish/deploy step, any visual work on non-Button/Avatar surfaces, any global token redesign to make a component easier.

**Component checkpoints (binding process rule):** UI is design-sensitive; never batch-generate, never infer the next component's visual design, never copy Button's visual decisions into Avatar beyond structural mechanics (how a resolver file is wired — not what it looks like). Each component: (1) inspect existing/reference implementation, (2) inspect upstream precedents if needed, (3) propose API + anatomy + states, (4) propose visual implementation, (5) implement ONLY after user approval, (6) Storybook visual review, (7) interaction/a11y tests, (8) user review, (9) freeze contract, (10) only then the next component. Execution order is therefore **foundation → Button → STOP for review → Avatar → STOP for review → done**. A plan executor MUST NOT continue past a STOP step on its own initiative.

## Global Constraints

Every task follows these, copied from the spec's freeze list and this phase's decisions:

- npm scope `@yarapa-ui`; class namespace `yp-*`; custom properties `--yp-*`; BEM (`yp-button--primary`, `yp-avatar__fallback`).
- Visual variants/sizes = BEM modifier classes. **Never** `data-variant`, `data-size`, `data-slot`, `data-loading`, or any custom state protocol.
- Native/ARIA state is NOT duplicated as a visual class: validity → `:invalid`/`[aria-invalid]`; disabled → `:disabled`; loading/busy → `[aria-busy]`. A component-own visual state class is added only when no native/ARIA/upstream selector can express it. If a component adopts Base UI, upstream state attributes (`[data-open]`, `[data-popup-open]`, `[data-highlighted]`, `[data-selected]`, `[data-disabled]`, `[data-placeholder]`, `[data-starting-style]`, `[data-ending-style]`, …) are styled exactly as upstream emits them — verified against the installed `@base-ui/react@1.7.x` types, never guessed, never translated.
- The variant resolver returns **only semantic `yp-*` classes** — never Tailwind utilities. Tailwind `@apply` exists only inside `.yp-*` rules in `packages/styles/src/`, compiled away before anyone else sees the file.
- Every library stylesheet — aggregate AND each selective file — uses the same real cascade layers: order statement first, declarations physically inside `@layer yarapa-tokens { … }` / `@layer yarapa-components { … }`. A bare `@layer` order statement without wrapped rules changes nothing.
- No `!important` in library CSS.
- Single hand-maintained token source: `packages/tokens/src/*.json`. Generated artifacts may overlap by aggregation; sources may not. The class name lives in two hand-maintained places **by design** — resolver = canonical prop→class mapping, CSS = canonical visual implementation; consistency is enforced by drift tests, not by "defined once" claims and not by codegen.
- `@yarapa-ui/styles` exports map: `.css` suffix = stylesheet, bare specifier = JS contract. No magic at the package root. Aggregate stylesheet is `@yarapa-ui/styles/css`. React's `styles.css` forwards: `@import "@yarapa-ui/styles/css";` — never copy CSS bytes into React.
- `styles` runtime-depends only on the resolver lib; tokens are consumed at **build** time only. `react` peers: `react`/`react-dom` `^19` — advertise only the range this repo's CI actually tests; widening to 17/18 requires a consumer matrix first, not Base UI's upstream claim.
- One test runner per package: Vitest owns all `*.test.*` in react and styles. No mixing `node:test` and Vitest in the same script/pattern set.
- Commits: conventional, type AND scope required, subject ≤ 50 chars, body/footer EMPTY (single line). Husky + commitlint enforce.
- Node 24, pnpm 11.23.0, `pnpm --filter <pkg> <script>`.
- No release work: no changeset is created this phase, no publish command is run, no Trusted Publishing setup (note for a future phase: npm can only configure a Trusted Publisher for a package that already exists on the registry — human 2FA publish first, OIDC releases after).

---

### Task 1: Rename and extend the tokens package (foundation)

Turn `@repo/tokens` into `@yarapa-ui/tokens` with split artifacts: base-only `dist/tokens.css` + `dist/themes/{dark,high-contrast}.css` + `dist/tokens.json`.

**Files:**

- Modify: `packages/tokens/package.json`
- Modify: `packages/tokens/build.mjs` (assembly/output section, lines ~61–131)
- Create: `packages/tokens/tests/build.test.mjs`
- Modify: `.github/workflows/ci.yml:29` (filter name)
- Modify: `AGENTS.md:7,23,32-36`, `README.md:16` (rename references)

**Interfaces:**

- Consumes: nothing (first task).
- Produces: `@yarapa-ui/tokens` (name used by `--filter`/exports). Files: `dist/tokens.css` (primitives + light semantics + `prefers-reduced-motion`/`forced-colors` guards), `dist/themes/dark.css`, `dist/themes/high-contrast.css`, `dist/tokens.json` (`{ primitives, semantic: { light, dark, "high-contrast" } }`). Task 2's `build-css.mjs` reads these exact paths from `packages/tokens/dist/`.

- [ ] **Step 1: Write the failing tests**

`packages/tokens/tests/build.test.mjs`:

```js
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

before(() => {
  execFileSync("node", ["build.mjs"], { cwd: root, stdio: "inherit" });
});

const read = (p) => readFileSync(join(root, "dist", p), "utf8");

test("tokens.css is base-only (light default, no theme selectors)", () => {
  const css = read("tokens.css");
  assert.match(css, /:root\s*\{/);
  assert.match(css, /--yp-color-brand-solid:/);
  assert.doesNotMatch(css, /\[data-theme="dark"\]/);
  assert.doesNotMatch(css, /\[data-theme="high-contrast"\]/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(forced-colors: active\)/);
});

test("dark theme ships separately and overrides semantics", () => {
  const css = read("themes/dark.css");
  assert.match(css, /\[data-theme="dark"\]\s*\{/);
  assert.match(css, /--yp-color-bg-canvas:/);
  assert.doesNotMatch(css, /:root\s*\{/);
});

test("high-contrast theme ships separately", () => {
  const css = read("themes/high-contrast.css");
  assert.match(css, /\[data-theme="high-contrast"\]\s*\{/);
});

test("tokens.json keeps primitives + all three resolved themes", () => {
  const json = JSON.parse(read("tokens.json"));
  assert.ok(json.primitives["color.brand.700"]);
  for (const theme of ["light", "dark", "high-contrast"]) {
    assert.ok(json.semantic[theme]["color.brand.solid"].resolved);
    assert.doesNotMatch(String(json.semantic[theme]["color.brand.solid"].resolved), /\{/);
  }
});
```

Note: `packages/tokens` keeps `node:test` (it is the plain-JS package with no Vitest setup); react/styles use Vitest. One runner per package, no mixing within a package.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/tokens && node --test tests/`
Expected: FAIL — current `build.mjs` emits one combined `tokens.css` containing `[data-theme="dark"]`, and `dist/themes/` does not exist.

- [ ] **Step 3: Rewrite the assembly/output section of build.mjs**

Keep lines 1–59 unchanged (flatten/resolveRef/substitute/cssVarName). Replace everything from `const cssChunks = [` to end of file with:

```js
function block(selector, lines) {
  return `${selector} {\n${lines.join("\n")}\n}`;
}

const header =
  "/* Generated by @yarapa-ui/tokens build. Source of truth: src/*.json. Do not edit by hand. */";

const baseLines = ["", "/* Primitives */"];
for (const [name, def] of Object.entries(primitiveTokens)) {
  const type = def.$type ? ` /* ${def.$type} */` : "";
  baseLines.push(`  ${cssVarName(name)}: ${def.$value};${type}`);
}

const resolved = {};
const themeBlocks = {};
for (const theme of THEMES) {
  const semantic = JSON.parse(readFileSync(join(src, theme.file), "utf8"));
  const tokens = flatten(semantic, "", {}, undefined);
  const lookup = { ...primitiveLookup, ...tokens };
  const lines = [``, `/* Semantic tokens — ${theme.name} */`];
  const themeResolved = {};
  for (const [name, def] of Object.entries(tokens)) {
    const value = resolveRef(name, lookup);
    themeResolved[name] = { ...def, $value: value.$value ?? value, resolved: value.$value ?? value };
    lines.push(`  ${cssVarName(name)}: ${value.$value ?? value};`);
  }
  resolved[theme.name] = themeResolved;
  themeBlocks[theme.name] = block(theme.selector, lines);
}

const baseCss = [
  header,
  block(":root", baseLines),
  themeBlocks.light,
  `/* Users with reduced-motion get near-instant transitions regardless of theme. */`,
  `@media (prefers-reduced-motion: reduce) {`,
  `  :root, [data-theme="dark"], [data-theme="high-contrast"] {`,
  `    --yp-motion-fast: 0ms;`,
  `    --yp-motion-base: 0ms;`,
  `    --yp-motion-slow: 0ms;`,
  `  }`,
  `}`,
  ``,
  `/* Forced-colors mode: keep structure legible, let the UA remap colors. */`,
  `@media (forced-colors: active) {`,
  `  :root, [data-theme="dark"], [data-theme="high-contrast"] {`,
  `    --yp-color-border-default: CanvasText;`,
  `    --yp-color-border-strong: CanvasText;`,
  `    --yp-color-border-focus: Highlight;`,
  `    --yp-color-brand-solid: ButtonText;`,
  `    --yp-color-brand-solid-text: ButtonFace;`,
  `    --yp-shadow-sm: none;`,
  `    --yp-shadow-md: none;`,
  `    --yp-shadow-lg: none;`,
  `    --yp-shadow-overlay: none;`,
  `  }`,
  `}`,
].join("\n");

mkdirSync(join(dist, "themes"), { recursive: true });
writeFileSync(join(dist, "tokens.css"), baseCss + "\n");
writeFileSync(join(dist, "themes", "dark.css"), `${header}\n${themeBlocks.dark}\n`);
writeFileSync(join(dist, "themes", "high-contrast.css"), `${header}\n${themeBlocks["high-contrast"]}\n`);
writeFileSync(
  join(dist, "tokens.json"),
  JSON.stringify({ primitives: primitiveTokens, semantic: resolved }, null, 2) + "\n",
);
console.log(
  `@yarapa-ui/tokens: wrote ${Object.keys(primitiveTokens).length} primitives + ` +
    `${Object.values(resolved).map((t) => Object.keys(t).length).join("/")} semantic tokens ` +
    `-> dist/tokens.css + dist/themes/*.css + dist/tokens.json`,
);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/tokens && node --test tests/`
Expected: PASS (4 tests).

- [ ] **Step 5: Rewrite package.json (rename, exports, metadata)**

```json
{
  "name": "@yarapa-ui/tokens",
  "version": "0.0.0",
  "description": "Canonical design tokens for Yarapa UI (DTCG-style source -> CSS custom properties + JSON).",
  "license": "MIT",
  "type": "module",
  "exports": {
    "./tokens.css": "./dist/tokens.css",
    "./themes/dark.css": "./dist/themes/dark.css",
    "./themes/high-contrast.css": "./dist/themes/high-contrast.css",
    "./tokens.json": "./dist/tokens.json",
    "./package.json": "./package.json"
  },
  "files": ["dist"],
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "scripts": {
    "build": "node build.mjs",
    "dev": "node --watch build.mjs",
    "test": "node --test tests/"
  }
}
```

(`publishConfig` is declarative metadata proving the package is publish-shaped; Phase 1 never publishes. No `lint`/`check-types` on this package — plain JS, no tsconfig; don't add churn.)

- [ ] **Step 6: Update references to the old name**

- `.github/workflows/ci.yml:29`: `pnpm --filter @repo/tokens build` → `pnpm --filter @yarapa-ui/tokens build`
- `AGENTS.md:7,23`: `@repo/tokens` → `@yarapa-ui/tokens` (Current state bullet: "DTCG-style token source + builder, published shape as `@yarapa-ui/tokens` — base + per-theme CSS artifacts + JSON")
- `AGENTS.md` "Token pipeline": describe `dist/tokens.css` (base) + `dist/themes/*.css` + `dist/tokens.json` as shipped behavior; drop the "spec extends this" sentence
- `README.md:16`: "`@yarapa-ui/tokens` is live (base + per-theme CSS + JSON)"

- [ ] **Step 7: Verify workspace resolves and full build passes**

Run: `pnpm install && pnpm build && pnpm --filter @yarapa-ui/tokens test`
Expected: install succeeds, `dist/` regenerated, 4 tests pass.

- [ ] **Step 8: Commit**

```bash
git add packages/tokens .github/workflows/ci.yml AGENTS.md README.md pnpm-lock.yaml
git commit -m "feat(tokens): publishable base + theme split"
```

---

### Task 2: `@yarapa-ui/styles` — foundation + Button variant contract

Scaffold styles: real-cascade-layer CSS build (`build-css.mjs` after `tsdown`, so `clean` can't eat fresh CSS), per-component selective files wrapped in `@layer yarapa-components`, token artifacts wrapped in `@layer yarapa-tokens`, Button resolver + Button CSS, drift test (reads `dist/`, never builds — the build race is eliminated by turbo's `test → build` edge).

**Files:**

- Create: `packages/styles/package.json`, `tsdown.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `build-css.mjs`
- Create: `packages/styles/src/tailwind.css`, `src/button.css`, `src/button.ts`, `src/index.ts`
- Create: `packages/styles/tests/button.drift.test.ts`
- Modify: `turbo.json` (add `test`/`publint`/`attw`), root `package.json` (add `"test"`)

**Interfaces:**

- Consumes: `packages/tokens/dist/{tokens.css,themes/dark.css,themes/high-contrast.css}` (Task 1 paths).
- Produces (consumed by Tasks 3-5, 9-10):
  - `@yarapa-ui/styles/button` → `buttonVariants` (callable: `buttonVariants({ variant, size, className })`) + `ButtonVariants`. Variants: `variant: "primary"|"secondary"|"outline"|"ghost"` (default `primary`), `size: "sm"|"md"|"lg"` (default `md`). Classes: `yp-button`, `yp-button--<variant>`, `yp-button--<size>`, part `yp-button__spinner`.
  - `@yarapa-ui/styles` re-exports `./button`.
  - CSS artifacts: `dist/index.css` (aggregate via `./css`), `dist/tokens.css`, `dist/themes/{dark,high-contrast}.css`, `dist/button.css` — all layer-wrapped.

- [ ] **Step 1: Write package.json**

```json
{
  "name": "@yarapa-ui/styles",
  "version": "0.0.0",
  "description": "Framework-agnostic styling contract for Yarapa UI: compiled BEM CSS + variant resolvers.",
  "license": "MIT",
  "type": "module",
  "sideEffects": ["*.css"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./button": { "types": "./dist/button.d.ts", "default": "./dist/button.js" },
    "./css": "./dist/index.css",
    "./tokens.css": "./dist/tokens.css",
    "./themes/dark.css": "./dist/themes/dark.css",
    "./themes/high-contrast.css": "./dist/themes/high-contrast.css",
    "./button.css": "./dist/button.css",
    "./package.json": "./package.json"
  },
  "files": ["dist"],
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "scripts": {
    "build": "tsdown && node build-css.mjs",
    "dev": "node build-css.mjs && tsdown --watch",
    "lint": "eslint . --max-warnings 0",
    "check-types": "tsc --noEmit",
    "test": "vitest run",
    "publint": "publint",
    "attw": "attw --pack ."
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1"
  },
  "devDependencies": {
    "@arethetypeswrong/cli": "^0.18.5",
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@tailwindcss/cli": "^4.3.3",
    "@yarapa-ui/tokens": "workspace:*",
    "publint": "^0.3.24",
    "tailwindcss": "^4.3.3",
    "tsdown": "^0.22.14",
    "typescript": "7.0.2",
    "vitest": "^4.1.11"
  }
}
```

Build order is deliberate: `tsdown` first (`clean: true` wipes `dist/`), then `build-css.mjs` writes CSS — the old order deleted freshly compiled CSS.

- [ ] **Step 2: Write configs**

`packages/styles/tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "include": ["src", "tests", "tsdown.config.ts", "vitest.config.ts"]
}
```

`packages/styles/eslint.config.mjs`:

```js
import { config } from "@repo/eslint-config/react-internal";

export default config;
```

`packages/styles/tsdown.config.ts`:

```ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/button.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: [/^@yarapa-ui\//, "class-variance-authority"],
});
```

`packages/styles/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Write the failing drift test**

`packages/styles/tests/button.drift.test.ts` — reads built `dist/`; it must NEVER invoke a build itself (parallel test files calling the same build would race on `tsdown`'s clean).

```ts
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { buttonVariants } from "../src/button.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

if (!existsSync(join(dist, "button.css"))) {
  throw new Error("dist/button.css missing — run `pnpm --filter @yarapa-ui/styles build` first (turbo test does this via dependsOn)");
}

const VARIANTS = ["primary", "secondary", "outline", "ghost"] as const;
const SIZES = ["sm", "md", "lg"] as const;

function emittedClasses(): Set<string> {
  const out = new Set<string>();
  out.add(buttonVariants());
  for (const variant of VARIANTS)
    for (const size of SIZES) out.add(buttonVariants({ variant, size }));
  out.add(buttonVariants({ className: "yp-button__spinner" }));
  return new Set([...out].flatMap((s) => s.split(/\s+/)));
}

describe("button resolver -> css drift", () => {
  test("every class emitted by buttonVariants() exists as a selector in button.css", () => {
    const css = readFileSync(join(dist, "button.css"), "utf8");
    for (const cls of emittedClasses()) {
      expect(css, `missing .${cls} in button.css`).toContain(`.${cls}`);
    }
  });

  test("every documented variant/size is emitted by the resolver", () => {
    for (const v of VARIANTS) expect(buttonVariants({ variant: v })).toContain(`yp-button--${v}`);
    for (const s of SIZES) expect(buttonVariants({ size: s })).toContain(`yp-button--${s}`);
    expect(buttonVariants()).toContain("yp-button--primary");
    expect(buttonVariants()).toContain("yp-button--md");
  });

  test("resolver never emits Tailwind utilities (BEM-only boundary)", () => {
    for (const cls of emittedClasses()) {
      expect(cls).toMatch(/^yp-[a-z0-9]+(__[a-z0-9-]+)?(--[a-z0-9-]+)?$/);
    }
  });

  test("selective file and aggregate share identical cascade semantics", () => {
    const selective = readFileSync(join(dist, "button.css"), "utf8");
    const aggregate = readFileSync(join(dist, "index.css"), "utf8");
    const tokens = readFileSync(join(dist, "tokens.css"), "utf8");
    for (const css of [selective, aggregate]) {
      expect(css).toMatch(/@layer yarapa-tokens, yarapa-components;/);
    }
    expect(selective).toMatch(/@layer yarapa-components\s*\{[\s\S]*\.yp-button--primary\s*\{/);
    expect(aggregate).toMatch(/@layer yarapa-tokens\s*\{[\s\S]*--yp-color-brand-solid:/);
    expect(aggregate).toMatch(/@layer yarapa-components\s*\{[\s\S]*\.yp-button--primary/);
    expect(aggregate).toContain('[data-theme="dark"]');
    expect(tokens).toMatch(/@layer yarapa-tokens\s*\{/);
    expect(aggregate).not.toMatch(/\.(inline-flex|items-center|justify-center)\s*\{/);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm install && pnpm --filter @yarapa-ui/styles test`
Expected: FAIL — no `src/button.ts` (type error) and the `throw` on missing `dist/button.css`.

- [ ] **Step 5: Write the variant module**

`packages/styles/src/button.ts` (CVA is the spec's leading candidate and fine for single-part contracts; multi-part/slots stays undecided until a multipart component exists — do not pre-shape that API):

```ts
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

`packages/styles/src/index.ts`:

```ts
export { buttonVariants, type ButtonVariants } from "./button.js";
```

- [ ] **Step 6: Write the authored CSS**

`packages/styles/src/tailwind.css` — reference source for `@apply`; never a compile entry, so preflight stays out:

```css
/* Tailwind reference for @apply. This file is NEVER an entry point —
   component files pull utilities via @reference. */
@import "tailwindcss";
```

`packages/styles/src/button.css` — everything a consumer sees is `.yp-*`; `aria-busy` drives the busy visual, no invented `data-loading`, no `.yp-button--loading`:

```css
@reference "./tailwind.css";

.yp-button {
  @apply inline-flex items-center justify-center;
  gap: var(--yp-space-2);
  border: 1px solid transparent;
  border-radius: var(--yp-radius-md);
  font-family: var(--yp-typography-font-family-sans);
  font-weight: var(--yp-typography-font-weight-medium);
  line-height: 1.2;
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--yp-motion-fast) ease,
    border-color var(--yp-motion-fast) ease,
    color var(--yp-motion-fast) ease;
}

.yp-button:focus-visible {
  outline: 2px solid var(--yp-color-border-focus);
  outline-offset: 2px;
}

.yp-button:disabled {
  opacity: 0.55;
  pointer-events: none;
}

.yp-button--primary {
  background-color: var(--yp-color-brand-solid);
  border-color: var(--yp-color-brand-solid);
  color: var(--yp-color-brand-solid-text);
}
.yp-button--primary:hover { background-color: var(--yp-color-brand-solid-hover); }

.yp-button--secondary {
  background-color: var(--yp-color-bg-raised);
  border-color: var(--yp-color-border-strong);
  color: var(--yp-color-text-default);
}
.yp-button--secondary:hover { background-color: var(--yp-color-interactive-hover); }

.yp-button--outline {
  background-color: transparent;
  border-color: var(--yp-color-border-strong);
  color: var(--yp-color-text-brand);
}
.yp-button--outline:hover { background-color: var(--yp-color-brand-subtle); }

.yp-button--ghost {
  background-color: transparent;
  color: var(--yp-color-text-default);
}
.yp-button--ghost:hover { background-color: var(--yp-color-interactive-hover); }

.yp-button--sm {
  block-size: 2rem;
  padding-inline: var(--yp-space-2);
  font-size: var(--yp-typography-font-size-xs);
}
.yp-button--md {
  block-size: 2.5rem;
  padding-inline: var(--yp-space-3);
  font-size: var(--yp-typography-font-size-sm);
}
.yp-button--lg {
  block-size: 3rem;
  padding-inline: var(--yp-space-4);
  font-size: var(--yp-typography-font-size-base);
}

.yp-button__spinner {
  inline-size: 1em;
  block-size: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--yp-radius-full);
  animation: yp-button-spin 700ms linear infinite;
}

@keyframes yp-button-spin {
  to { transform: rotate(1turn); }
}

@media (prefers-reduced-motion: reduce) {
  .yp-button { transition: none; }
  .yp-button__spinner { animation-duration: 1400ms; }
}
```

- [ ] **Step 7: Write build-css.mjs**

Layer-wrapped real cascade output for every artifact (selective and aggregate alike):

```js
#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "src");
const dist = join(root, "dist");
const tokensDist = join(root, "../tokens/dist");

const LAYER_ORDER = "@layer yarapa-tokens, yarapa-components;\n";
const layer = (name, css) => `${LAYER_ORDER}@layer ${name} {\n${css.trimEnd()}\n}\n`;

mkdirSync(join(dist, "themes"), { recursive: true });

// 1. Compile each authored component file with the Tailwind CLI
//    (@reference inlines utilities; preflight never enters the output).
//    This script runs AFTER tsdown (whose clean empties dist), so
//    dist/themes creation below happens before any write.
const componentFiles = readdirSync(src).filter(
  (f) => f.endsWith(".css") && f !== "tailwind.css",
);
const compiled = {};
for (const file of componentFiles) {
  const name = file.replace(/\.css$/, "");
  execFileSync(
    "pnpm",
    ["exec", "tailwindcss", "-i", join(src, file), "-o", join(dist, `${name}.css`)],
    { cwd: root, stdio: "inherit" },
  );
  compiled[name] = readFileSync(join(dist, `${name}.css`), "utf8");
}

// 2. Selective component files: real cascade layer, same semantics as aggregate.
for (const [name, css] of Object.entries(compiled)) {
  writeFileSync(join(dist, `${name}.css`), layer("yarapa-components", css));
}

// 3. Token artifacts pass through from @yarapa-ui/tokens (build-time only),
//    wrapped in the token layer so selective users cascade identically.
writeFileSync(
  join(dist, "tokens.css"),
  layer("yarapa-tokens", readFileSync(join(tokensDist, "tokens.css"), "utf8")),
);
for (const theme of ["dark", "high-contrast"]) {
  writeFileSync(
    join(dist, "themes", `${theme}.css`),
    layer("yarapa-tokens", readFileSync(join(tokensDist, "themes", `${theme}.css`), "utf8")),
  );
}

// 4. Aggregate: one self-contained layered file.
const tokensBlock = [
  readFileSync(join(tokensDist, "tokens.css"), "utf8"),
  readFileSync(join(tokensDist, "themes", "dark.css"), "utf8"),
  readFileSync(join(tokensDist, "themes", "high-contrast.css"), "utf8"),
].join("\n");
const componentsBlock = Object.values(compiled).join("\n");
writeFileSync(
  join(dist, "index.css"),
  `${LAYER_ORDER}@layer yarapa-tokens {\n${tokensBlock}\n}\n@layer yarapa-components {\n${componentsBlock}\n}\n`,
);

console.log(`@yarapa-ui/styles: css build ok (${componentFiles.join(", ")})`);
```

- [ ] **Step 8: Extend turbo.json and root scripts**

Add to `turbo.json` `tasks` (no test file ever runs a build itself — the graph guarantees each package's `dist/` exists before its tests: `build` covers the package's own build, `^build` covers upstream-build-only packages like the plain-html fixture which ships no build script):

```json
"test": { "dependsOn": ["build", "^build"] },
"publint": { "dependsOn": ["build"], "outputs": [] },
"attw": { "dependsOn": ["build"], "outputs": [] }
```

Root `package.json` `scripts` add `"test": "turbo run test"`.
If pnpm 11 prompts on install, add to `pnpm-workspace.yaml` `allowBuilds`: `"@tailwindcss/oxide": true` and `"rolldown": true`.

- [ ] **Step 9: Run the test to verify it passes**

Run: `pnpm test` (turbo builds styles first, then runs vitest)
Expected: PASS (4 tests). Then: `pnpm --filter @yarapa-ui/styles publint && pnpm --filter @yarapa-ui/styles attw` — zero findings.

- [ ] **Step 10: Verify repo-wide gates**

Run: `pnpm build && pnpm lint && pnpm check-types && pnpm test`
Expected: all green.

- [ ] **Step 11: Commit**

```bash
git add packages/styles turbo.json package.json pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "feat(styles): button variant contract + css build"
```

---

### Task 3: `@yarapa-ui/react` — scaffold + native Button

React package: tsdown ESM + d.ts, curated exports, `styles.css` forwarding file, native `<button>` Button. This checkpoint's finding: no Base UI dependency this phase — Button is sufficient as native HTML (`loading` = spinner + `disabled` + `aria-busy`; focus retention while disabled is not a requirement), so `@base-ui/react` is simply not added. A single Vitest config (node project) owns all react tests from day one — no `node:test`/Vitest mixing.

**Files:**

- Create: `packages/react/package.json`, `tsconfig.json`, `eslint.config.mjs`, `tsdown.config.ts`, `vitest.config.ts`
- Create: `packages/react/src/button.tsx`, `src/index.ts`, `src/styles.css`
- Create: `packages/react/tests/pack.test.ts`
- Modify: `AGENTS.md` "Current state"

**Interfaces:**

- Consumes: `@yarapa-ui/styles/button` → `buttonVariants`, `ButtonVariants` (Task 2).
- Produces: `@yarapa-ui/react` exports `.` (`Button`, `ButtonProps`), `./button`, `./styles.css` (forwards `@import "@yarapa-ui/styles/css"`).

- [ ] **Step 1: Write package.json**

```json
{
  "name": "@yarapa-ui/react",
  "version": "0.0.0",
  "description": "Accessible React components for Yarapa UI.",
  "license": "MIT",
  "type": "module",
  "sideEffects": ["*.css"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./button": { "types": "./dist/button.d.ts", "default": "./dist/button.js" },
    "./styles.css": "./dist/styles.css",
    "./package.json": "./package.json"
  },
  "files": ["dist"],
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "scripts": {
    "build": "tsdown && cp src/styles.css dist/styles.css",
    "dev": "tsdown --watch",
    "lint": "eslint . --max-warnings 0",
    "check-types": "tsc --noEmit",
    "test": "vitest run",
    "publint": "publint",
    "attw": "attw --pack ."
  },
  "dependencies": {
    "@yarapa-ui/styles": "workspace:*"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@arethetypeswrong/cli": "^0.18.5",
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "publint": "^0.3.24",
    "react": "^19",
    "react-dom": "^19",
    "tsdown": "^0.22.14",
    "typescript": "7.0.2",
    "vitest": "^4.1.11"
  }
}
```

Peer range `^19` = the version CI exercises. Widening to `^17 || ^18 || ^19` requires a React 18/19 consumer matrix in a later phase — upstream Base UI support is not our evidence. (If Task 8's Avatar proposal adopts a Base UI primitive, `@base-ui/react@^1.7.0` becomes a package-level runtime dependency at that point and the peer range is re-checked against what CI then tests.)

- [ ] **Step 2: Write the configs**

`packages/react/tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "include": ["src", "tests", "tsdown.config.ts", "vitest.config.ts"]
}
```

`packages/react/eslint.config.mjs`:

```js
import { config } from "@repo/eslint-config/react-internal";

export default config;
```

`packages/react/tsdown.config.ts`:

```ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/button.tsx"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: [/^@yarapa-ui\//, /^react(-dom)?(\/.*)?$/],
});
```

`packages/react/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
```

`packages/react/src/styles.css`:

```css
@import "@yarapa-ui/styles/css";
```

- [ ] **Step 3: Write the failing pack test**

`packages/react/tests/pack.test.ts`:

```ts
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expect, test } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

if (!existsSync(join(dist, "button.js"))) {
  throw new Error("dist/button.js missing — run `pnpm --filter @yarapa-ui/react build` first (turbo test does this)");
}

test("Button is exported from the built ESM", async () => {
  const mod = await import(pathToFileURL(join(dist, "button.js")).href);
  expect(typeof mod.Button).toBe("function");
});

test("forwarding stylesheet imports the styles aggregate, copies no bytes", () => {
  const css = readFileSync(join(dist, "styles.css"), "utf8");
  expect(css.trim()).toBe('@import "@yarapa-ui/styles/css";');
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm install && pnpm --filter @yarapa-ui/react build && pnpm --filter @yarapa-ui/react test`
Expected: build fails first (no `src/button.tsx`). After Step 5, re-run for PASS.

- [ ] **Step 5: Write the Button component**

`packages/react/src/button.tsx`:

```tsx
import type { ButtonHTMLAttributes } from "react";
import { buttonVariants, type ButtonVariants } from "@yarapa-ui/styles/button";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  loading?: boolean;
}

export function Button({
  variant,
  size,
  className,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span aria-hidden="true" className="yp-button__spinner" /> : null}
      {children}
    </button>
  );
}
```

`packages/react/src/index.ts`:

```ts
export { Button, type ButtonProps } from "./button.js";
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm build && pnpm --filter @yarapa-ui/react test && pnpm --filter @yarapa-ui/react publint && pnpm --filter @yarapa-ui/react attw`
Expected: PASS (2 tests), publint/attw zero findings.

- [ ] **Step 7: Verify repo-wide gates and update AGENTS.md**

Run: `pnpm build && pnpm lint && pnpm check-types && pnpm test` — green.
`AGENTS.md` "Current state": add that `packages/styles` (variant contract + compiled CSS) and `packages/react` (Button) now exist per the spec; no Base UI dependency yet.

- [ ] **Step 8: Commit**

```bash
git add packages/react AGENTS.md pnpm-lock.yaml
git commit -m "feat(react): scaffold with native Button slice"
```

---

### Task 4: Storybook + a11y browser harness, Button stories

Storybook (react-vite) as the component harness with `@storybook/addon-vitest` + `@storybook/addon-a11y`; `parameters.a11y.test = "error"` is the axe gate; play() interaction tests; Vite harness doubles as the Vite integration proof. Test API comes from `storybook/test` (no separate `@testing-library/user-event` dependency; do not add it).

**Files:**

- Create: `packages/react/.storybook/main.ts`, `.storybook/preview.ts`, `.storybook/vitest.setup.ts`
- Modify: `packages/react/vitest.config.ts` (add browser project), `packages/react/package.json` (deps + scripts), `tsconfig.json` include
- Create: `packages/react/src/button.stories.tsx`

**Interfaces:**

- Consumes: `Button` (Task 3), styles CSS (Task 2).
- Produces: `pnpm --filter @yarapa-ui/react test:storybook` (browser + a11y); Task 10 adds avatar stories against this harness.

- [ ] **Step 1: Install storybook deps**

`packages/react/package.json` `devDependencies` add:

```json
"@storybook/addon-a11y": "^10.6.0",
"@storybook/addon-vitest": "^10.6.0",
"@storybook/react-vite": "^10.6.0",
"@vitejs/plugin-react": "^6.1.1",
"@vitest/browser-playwright": "^4.1.11",
"playwright": "^1.62.1",
"storybook": "^10.6.0",
"vite": "^8.2.2"
```

(`vitest` from Task 3 stays.) Run: `pnpm install && pnpm exec playwright install chromium`
Expected: install + browser download succeed.

- [ ] **Step 2: Write `.storybook/main.ts`**

```ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts?(x)"],
  addons: ["@storybook/addon-vitest", "@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
};

export default config;
```

- [ ] **Step 3: Write `.storybook/preview.ts`**

```ts
import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";

const preview: Preview = {
  parameters: {
    a11y: { test: "error" },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
```

- [ ] **Step 4: Write `.storybook/vitest.setup.ts`**

```ts
import * as projectAnnotations from "./preview";
import { setProjectAnnotations } from "@storybook/react-vite";

setProjectAnnotations([projectAnnotations]);
```

- [ ] **Step 5: Rewrite `vitest.config.ts` with the browser project**

```ts
import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";

export default defineConfig({
  test: {
    projects: [
      {
        test: { name: "node", include: ["tests/**/*.test.ts"] },
      },
      {
        extends: true,
        plugins: [react(), storybookTest()],
        test: {
          name: "browser",
          include: ["src/**/*.stories.*"],
          setupFiles: ["./.storybook/vitest.setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
```

`packages/react/package.json` scripts add: `"test:storybook": "vitest run --project browser"`, `"storybook": "storybook dev -p 6006"`, `"build-storybook": "storybook build"`. `tsconfig.json` include: `["src", "tests", ".storybook", "vitest.config.ts", "tsdown.config.ts"]`.

(The existing `tests/pack.test.ts` runs inside the "node" project — same runner, both projects.)

- [ ] **Step 6: Write the Button stories**

`packages/react/src/button.stories.tsx`:

```tsx
import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button.js";

const meta: Meta<typeof Button> = {
  component: Button,
  args: { children: "Save changes" },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Save changes" });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector(".yp-button__spinner")).not.toBeNull();
  },
};
```

If `toBeDisabled`/`toHaveAttribute` error as "not a function" on the installed 10.x, add `@testing-library/jest-dom` as a devDependency and `import "@testing-library/jest-dom/vitest";` to `.storybook/vitest.setup.ts` — fix the setup, never delete the a11y gate or the assertions.

- [ ] **Step 7: Run the harness**

Run: `pnpm --filter @yarapa-ui/react test:storybook`
Expected: PASS — every story renders, axe reports zero violations, play() assertions pass.

- [ ] **Step 8: Verify gates + commit**

Run: `pnpm build && pnpm lint && pnpm check-types && pnpm test`
Expected: green (`pnpm test` now runs node + browser projects; CI needs `playwright install` — Task 6).

```bash
git add packages/react
git commit -m "test(react): storybook + a11y browser harness"
```

---

### Task 5: Plain-HTML fixture — framework-free Button proof

Static HTML links the built `styles` aggregate; Playwright asserts computed styles derive from `--yp-*` tokens. Button only.

**Files:**

- Create: `fixtures/plain-html/package.json`, `server.mjs`, `index.html`, `playwright.config.ts`, `tests/computed-styles.spec.ts`
- Modify: `pnpm-workspace.yaml` (add `"fixtures/*"`)

**Interfaces:**

- Consumes: `packages/styles/dist/index.css` (Task 2).
- Produces: `pnpm --filter @yarapa-ui/plain-html-fixture test` (Task 6 CI).

- [ ] **Step 1: Create the fixture package**

`fixtures/plain-html/package.json`:

```json
{
  "name": "@yarapa-ui/plain-html-fixture",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "^1.62.1",
    "@yarapa-ui/styles": "workspace:*"
  }
}
```

(`@yarapa-ui/styles` devDep exists so turbo's `test → ^build` graph styles-first; no `build` script — the fixture ships nothing.)
Add `"fixtures/*"` to `pnpm-workspace.yaml` `packages`.

`fixtures/plain-html/server.mjs`:

```js
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../..");
const port = process.env.PORT ?? 4173;

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = resolve(join(repoRoot, url));
  if (!normalize(file).startsWith(repoRoot)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": file.endsWith(".css")
        ? "text/css"
        : file.endsWith(".html")
          ? "text/html"
          : "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, "127.0.0.1", () => console.log(`fixture on http://127.0.0.1:${port}`));
```

`fixtures/plain-html/index.html` (classes hand-written — exactly what a plain-HTML consumer authors):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Yarapa plain-html fixture</title>
    <link rel="stylesheet" href="../../packages/styles/dist/index.css" />
  </head>
  <body style="background: var(--yp-color-bg-canvas)">
    <button class="yp-button yp-button--primary yp-button--md">Primary</button>
    <button class="yp-button yp-button--outline yp-button--sm">Outline sm</button>
    <button class="yp-button yp-button--ghost yp-button--lg" disabled>Ghost lg</button>
    <button class="yp-button yp-button--secondary yp-button--md" aria-busy="true" disabled>
      <span aria-hidden="true" class="yp-button__spinner"></span>Busy
    </button>
  </body>
</html>
```

`fixtures/plain-html/playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "node server.mjs",
    url: "http://127.0.0.1:4173/fixtures/plain-html/index.html",
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 2: Write the test**

`fixtures/plain-html/tests/computed-styles.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

function hexToRgb(hex: string): string {
  const v = hex.replace("#", "");
  const n = parseInt(v.length === 3 ? v.split("").map((c) => c + c).join("") : v, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

test.beforeEach(async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/fixtures/plain-html/index.html");
});

test("primary button background comes from the brand token", async ({ page }) => {
  const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return { solid: cs.getPropertyValue("--yp-color-brand-solid").trim() };
  });
  await expect(page.locator(".yp-button--primary")).toHaveCSS(
    "background-color",
    hexToRgb(tokens.solid),
  );
});

test("sizes produce distinct heights", async ({ page }) => {
  const sm = await page.locator(".yp-button--sm").evaluate((el) => getComputedStyle(el).height);
  const lg = await page.locator(".yp-button--lg").evaluate((el) => getComputedStyle(el).height);
  expect(parseFloat(sm)).toBeLessThan(parseFloat(lg));
});

test("public css is layered and tailwind utilities never leak", async ({ page }) => {
  const css = await page.evaluate(async () => {
    const res = await fetch("/packages/styles/dist/index.css");
    return res.text();
  });
  expect(css).not.toMatch(/\.(inline-flex|items-center|justify-center)\s*\{/);
  expect(css).toMatch(/@layer yarapa-tokens\s*\{/);
  expect(css).toMatch(/@layer yarapa-components\s*\{/);
});

test("spinner animates and disabled buttons ignore pointer events", async ({ page }) => {
  await expect(page.locator(".yp-button__spinner")).toHaveCSS("animation-name", "yp-button-spin");
  await expect(page.locator("button[disabled]").first()).toHaveCSS("pointer-events", "none");
});
```

- [ ] **Step 3: Run it**

Run: `pnpm install && pnpm --filter @yarapa-ui/styles build && pnpm --filter @yarapa-ui/plain-html-fixture test`
Expected: PASS (4 tests). If an assertion fails, fix `styles`, never the assertion.

- [ ] **Step 4: Commit**

```bash
git add fixtures pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "test(styles): plain-html computed-style fixture"
```

---

### Task 6: CI quality gates (no release workflow)

Extend the PR gate to the spec's test order for Phase 1 only: lint → typecheck → test (unit + Storybook browser/a11y) → build → publint/attw → plain-html fixture. `pnpm/action-setup@v6` throughout (v4 is outdated). **No release.yml, no publish job** — that is not this phase.

**Files:**

- Modify: `.github/workflows/ci.yml`
- Modify: root `package.json` (scripts `publint`, `attw`)

**Interfaces:**

- Consumes: turbo tasks `test`/`publint`/`attw` (Tasks 2-3), fixture (Task 5).
- Produces: green PR gate; nothing else.

- [ ] **Step 1: Add root scripts**

```json
"publint": "turbo run publint",
"attw": "turbo run attw"
```

(`test` present from Task 2 — verify.)

- [ ] **Step 2: Rewrite ci.yml**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Lint, typecheck, test, build, publish-readiness
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm lint
      - run: pnpm check-types
      - run: pnpm build
      - run: pnpm test
      - run: pnpm publint
      - run: pnpm attw

  fixture:
    name: Plain-html computed styles (framework-free)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm --filter @yarapa-ui/styles build
      - run: pnpm --filter @yarapa-ui/plain-html-fixture test
        env:
          CI: true
```

(`quality` runs `build` before `test`: the Storybook browser project imports compiled story sources through Vite — fine — but the pack/drift tests read `dist/`. Turbo would also guarantee the order via `test → build`; running build explicitly keeps logs legible.)

- [ ] **Step 3: Validate locally in CI order, then commit**

Run: `pnpm lint && pnpm check-types && pnpm build && pnpm test && pnpm publint && pnpm attw && pnpm --filter @yarapa-ui/plain-html-fixture test`
Expected: green.

```bash
git add .github/workflows/ci.yml package.json
git commit -m "ci(repo): quality gates with v6 action setup"
```

---

### Task 7: Button docs + contract freeze — ⛔ STOP FOR USER REVIEW

Author the Button docs entry (fixed schema — source material for a future llms build) and stop. Phase 2 work does not begin until the user reviews.

**Files:**

- Create: `packages/react/docs/button.md`

**Interfaces:**

- Consumes: Button contract (Tasks 2-3).
- Produces: approved Button contract, frozen.

- [ ] **Step 1: Write the docs entry in the spec's fixed schema**

`packages/react/docs/button.md`:

````md
# Button

## Import

```ts
import { Button } from "@yarapa-ui/react/button";
import "@yarapa-ui/react/styles.css"; // or @yarapa-ui/styles/css
```

## Usage

```tsx
<Button variant="primary" size="md">Save</Button>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| variant | "primary" \| "secondary" \| "outline" \| "ghost" | "primary" | BEM modifier class, not a data attribute |
| size | "sm" \| "md" \| "lg" | "md" | BEM modifier class, not a data attribute |
| loading | boolean | false | renders `.yp-button__spinner`, sets `disabled` + `aria-busy` |
| (native) | ButtonHTMLAttributes&lt;HTMLButtonElement&gt; | — | forwarded to the native `<button>` |

## Variants

primary, secondary, outline, ghost — the `buttonVariants()` resolver in `@yarapa-ui/styles` is the canonical prop→class mapping; `button.css` is the canonical visual implementation; the drift test enforces the two stay consistent.

## Sizes

sm (2rem), md (2.5rem), lg (3rem).

## States

`:hover`, `:focus-visible`, `:disabled`, `[aria-busy]` — native HTML only; this component uses no Base UI primitive.

## Anatomy

`.yp-button`, `.yp-button--primary` … `.yp-button--lg`, `.yp-button__spinner`.

## Accessibility

Native button semantics; `loading` sets `aria-busy` and `disabled`; spinner is `aria-hidden`.

## Styling

Append classes via `className` (applied after `buttonVariants()`); override tokens in your own cascade layer.

## Examples

```tsx
<Button variant="outline" size="sm">Cancel</Button>
<Button loading>Saving</Button>
```
````

- [ ] **Step 2: Commit**

```bash
git add packages/react/docs
git commit -m "docs(react): button contract docs entry"
```

- [ ] **Step 3: ⛔ STOP — present Button for user review**

Show the user: Storybook visual render (all 7 stories), test results, the docs entry, and the recorded checkpoint decision "Button stays native; no Base UI." Do not touch Task 8 until the user explicitly approves Button. If the user requests changes, apply → re-review → repeat.

---

### Task 8: Avatar design proposal — ⛔ STOP FOR USER APPROVAL (no code yet)

Avatar is a separate design checkpoint. Its problems are not Button's problems: image loading/error behavior, fallback rendering (initials vs icon), shape, sizing, decorative-vs-informative accessibility, and optional status indicator. Inspect precedents (e.g. Radix UI `Avatar`, HeroUI `Avatar`) for API shape, then propose — do not copy visuals.

**Files:**

- Create: `docs/superpowers/notes/2026-09-03-avatar-proposal.md`

**Interfaces:**

- Consumes: nothing.
- Produces: the approved Avatar contract that Tasks 9-10 implement verbatim.

- [ ] **Step 1: Inspect reference implementations**

Look at git history (`git show ffa6eca^:packages/ui/src/components/` paths if the legacy prototype had an Avatar) and, in the browser or via docs, Radix UI Avatar + HeroUI Avatar. Record in the proposal doc: what each exposes (props, DOM, states), and which parts Yarapa will and will not adopt. No code changes.

- [ ] **Step 2: Write the proposal doc** — `docs/superpowers/notes/2026-09-03-avatar-proposal.md`:

```md
# Avatar design proposal (awaiting approval)

## Primitive decision
- Proposed: native `<img>` + local error state. Base UI has no Avatar primitive;
  image-load state is not Base UI's domain. A `<span>` fallback + img `onError`
  covers loading/failure without any dependency. (If review wants a different
  behavior — e.g. network-level retry — that becomes its own decision.)

## API
- `<Avatar src alt fallback size shape />`
- props: src?: string; alt: string (required — "" when decorative);
  fallback?: ReactNode (initials text or icon);
  size: "sm" | "md" | "lg" (default "md");
  shape: "circle" | "square" (default "circle").

## Anatomy (proposed DOM)
<figure/span class="yp-avatar yp-avatar--md yp-avatar--circle">
  <img class="yp-avatar__image" src alt />        (when loaded successfully)
  <span class="yp-avatar__fallback" aria-hidden>   (when no src / on error)
</span>

## States
- no src / img error → `.yp-avatar__fallback` shows
- focusable? No — Avatar is not interactive; no focus states.
- status indicator (online/offline dot): DEFERRED unless the user asks —
  flagged as open question below.

## Visual proposal (tokens only, no raw values)
- sizes: sm 2rem / md 2.5rem / lg 3rem; circle uses border-radius
  var(--yp-radius-full), square var(--yp-radius-md); fallback background
  var(--yp-color-brand-subtle), text var(--yp-color-brand-subtle-text);
  object-fit cover on the image.

## Open questions for the reviewer
1. status dot in v1 or deferred?
2. initials auto-derived from alt, or caller-provided fallback text only?
3. group stacking (overlap offset) in v1 or deferred?
```

- [ ] **Step 3: ⛔ STOP — get explicit approval**

Do not implement Avatar until the user approves this doc (or amends it; re-submit). No scaffolding "in the meantime."

---

### Task 9: Avatar variant contract in styles (after Task 8 approval)

**Files:**

- Create: `packages/styles/src/avatar.ts`, `src/avatar.css`
- Create: `packages/styles/tests/avatar.drift.test.ts`
- Modify: `packages/styles/src/index.ts`, `package.json` (exports `./avatar`, `./avatar.css`), `tsdown.config.ts` (entry)

**Interfaces:**

- Consumes: Task 2 pipeline; Task 8 approved contract.
- Produces: `@yarapa-ui/styles/avatar` → `avatarVariants` + `AvatarVariants` (`size: "sm"|"md"|"lg"` default `md`; `shape: "circle"|"square"` default `circle`; parts `yp-avatar`, `yp-avatar__image`, `yp-avatar__fallback`, modifiers `yp-avatar--sm|md|lg|circle|square`).

- [ ] **Step 1: Write the failing drift test**

`packages/styles/tests/avatar.drift.test.ts`:

```ts
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { avatarVariants } from "../src/avatar.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

if (!existsSync(join(root, "dist", "avatar.css"))) {
  throw new Error("dist/avatar.css missing — run `pnpm --filter @yarapa-ui/styles build` first");
}

const SIZES = ["sm", "md", "lg"] as const;
const SHAPES = ["circle", "square"] as const;

describe("avatar resolver -> css drift", () => {
  test("every emitted class exists as a selector in avatar.css", () => {
    const css = readFileSync(join(root, "dist", "avatar.css"), "utf8");
    const classes = new Set(
      [
        avatarVariants(),
        ...SIZES.map((size) => avatarVariants({ size })),
        ...SHAPES.map((shape) => avatarVariants({ shape })),
      ]
        .flatMap((s) => s.split(/\s+/))
        .concat("yp-avatar__image", "yp-avatar__fallback"),
    );
    for (const cls of classes) expect(css, `missing .${cls}`).toContain(`.${cls}`);
  });

  test("documented sizes/shapes are emitted; classes stay yp-avatar-only", () => {
    for (const s of SIZES) expect(avatarVariants({ size: s })).toContain(`yp-avatar--${s}`);
    for (const h of SHAPES) expect(avatarVariants({ shape: h })).toContain(`yp-avatar--${h}`);
    for (const c of avatarVariants().split(/\s+/)) expect(c).toMatch(/^yp-avatar/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @yarapa-ui/styles test` — FAIL (no `src/avatar.ts`).

- [ ] **Step 3: Write the contract + CSS** (per Task 8's approved shape; deviations here need a new approval)

`packages/styles/src/avatar.ts`:

```ts
import { cva, type VariantProps } from "class-variance-authority";

export const avatarVariants = cva("yp-avatar", {
  variants: {
    size: {
      sm: "yp-avatar--sm",
      md: "yp-avatar--md",
      lg: "yp-avatar--lg",
    },
    shape: {
      circle: "yp-avatar--circle",
      square: "yp-avatar--square",
    },
  },
  defaultVariants: { size: "md", shape: "circle" },
});

export type AvatarVariants = VariantProps<typeof avatarVariants>;
```

`packages/styles/src/avatar.css`:

```css
@reference "./tailwind.css";

.yp-avatar {
  @apply inline-flex items-center justify-center;
  flex: none;
  overflow: hidden;
}

.yp-avatar--circle { border-radius: var(--yp-radius-full); }
.yp-avatar--square { border-radius: var(--yp-radius-md); }

.yp-avatar--sm { inline-size: 2rem; block-size: 2rem; }
.yp-avatar--md { inline-size: 2.5rem; block-size: 2.5rem; }
.yp-avatar--lg { inline-size: 3rem; block-size: 3rem; }

.yp-avatar__image {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
}

.yp-avatar__fallback {
  @apply inline-flex items-center justify-center;
  inline-size: 100%;
  block-size: 100%;
  background-color: var(--yp-color-brand-subtle);
  color: var(--yp-color-brand-subtle-text);
  font-family: var(--yp-typography-font-family-sans);
  font-weight: var(--yp-typography-font-weight-medium);
}

.yp-avatar--sm .yp-avatar__fallback { font-size: var(--yp-typography-font-size-xs); }
.yp-avatar--md .yp-avatar__fallback { font-size: var(--yp-typography-font-size-sm); }
.yp-avatar--lg .yp-avatar__fallback { font-size: var(--yp-typography-font-size-base); }
```

Wire `src/index.ts`, exports (`"./avatar"`, `"./avatar.css"`), tsdown entry `"src/avatar.ts"`.

- [ ] **Step 4: Run drift tests + validation**

Run: `pnpm --filter @yarapa-ui/styles test && pnpm --filter @yarapa-ui/styles publint && pnpm --filter @yarapa-ui/styles attw`
Expected: PASS + zero findings.

- [ ] **Step 5: Commit**

```bash
git add packages/styles
git commit -m "feat(styles): avatar variant contract + css"
```

---

### Task 10: Avatar React component + stories + docs + fixture extension

**Files:**

- Create: `packages/react/src/avatar.tsx`, `src/avatar.stories.tsx`
- Modify: `packages/react/src/index.ts`, `package.json` (exports), `tsdown.config.ts` (entry)
- Create: `packages/react/docs/avatar.md`
- Modify: `fixtures/plain-html/index.html`, `fixtures/plain-html/tests/computed-styles.spec.ts`

**Interfaces:**

- Consumes: `avatarVariants`, `AvatarVariants` (Task 9), Task 4 harness.
- Produces: `@yarapa-ui/react/avatar` → `Avatar`, `AvatarProps`.

- [ ] **Step 1: Write the component**

`packages/react/src/avatar.tsx`:

```tsx
import { useState, type ReactNode } from "react";
import { avatarVariants, type AvatarVariants } from "@yarapa-ui/styles/avatar";

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    AvatarVariants {
  src?: string;
  /** Required. Use "" when the name is already shown nearby (decorative). */
  alt: string;
  fallback?: ReactNode;
}

export function Avatar({ src, alt, fallback = "?", size, shape, className, ...props }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  return (
    <span className={avatarVariants({ size, shape, className })} {...props}>
      {showImage ? (
        <img
          className="yp-avatar__image"
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="yp-avatar__fallback" role={alt ? undefined : "presentation"} aria-hidden={alt ? true : undefined}>
          {fallback}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Stories**

`packages/react/src/avatar.stories.tsx`:

```tsx
import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./avatar.js";

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  args: { alt: "Ada Lovelace", fallback: "AL" },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = { args: { src: "https://i.pravatar.cc/96?img=9" } };
export const Fallback: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const Square: Story = { args: { shape: "square" } };

export const BrokenImageShowsFallback: Story = {
  args: { src: "/definitely-404.png" },
  play: async ({ canvasElement }) => {
    const fallback = within(canvasElement).getByText("AL");
    await expect(fallback).toBeVisible();
    expect(within(canvasElement).queryByRole("img")).toBeNull();
  },
};
```

- [ ] **Step 3: Wire exports + docs + fixture**

`src/index.ts` add `export { Avatar, type AvatarProps } from "./avatar.js";`; `package.json` exports `"./avatar": { "types": "./dist/avatar.d.ts", "default": "./dist/avatar.js" }`; tsdown entry `"src/avatar.tsx"`.

`packages/react/docs/avatar.md` — same fixed schema as button.md: Import/Usage/Props (`src?`, `alt` required, `fallback?`, `size`, `shape` + native span attrs)/Variants (resolver=prop→class mapping, CSS=visual implementation, drift test enforces)/Sizes/States (fallback swap on load failure — a render-branch, not a data attribute; no focus states, non-interactive)/Anatomy (`.yp-avatar`, `__image`, `__fallback`, modifiers)/Accessibility (`alt` required; decorative case `alt=""`; fallback text hidden from AT when the image carries the name)/Styling/Examples.

Fixture `index.html` — add:

```html
<span class="yp-avatar yp-avatar--md yp-avatar--circle"><span class="yp-avatar__fallback" aria-hidden="true">AL</span></span>
<span class="yp-avatar yp-avatar--sm yp-avatar--square"><span class="yp-avatar__fallback" aria-hidden="true">JD</span></span>
```

Fixture spec — add:

```ts
test("avatar fallback background derives from the brand token and square clips by radius", async ({ page }) => {
  const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return { subtle: cs.getPropertyValue("--yp-color-brand-subtle").trim() };
  });
  await expect(page.locator(".yp-avatar--circle .yp-avatar__fallback")).toHaveCSS(
    "background-color",
    hexToRgb(tokens.subtle),
  );
  const squareRadius = await page
    .locator(".yp-avatar--square")
    .evaluate((el) => getComputedStyle(el).borderRadius);
  expect(parseFloat(squareRadius)).toBeLessThan(parseFloat(await page
    .locator(".yp-avatar--circle")
    .evaluate((el) => getComputedStyle(el).borderRadius)));
});
```

- [ ] **Step 4: Run all gates**

Run: `pnpm build && pnpm lint && pnpm check-types && pnpm test && pnpm --filter @yarapa-ui/plain-html-fixture test && pnpm --filter @yarapa-ui/react test:storybook && pnpm publint && pnpm attw`
Expected: all green, zero findings.

- [ ] **Step 5: Commit**

```bash
git add packages/react fixtures
git commit -m "feat(react): avatar component + contract proof"
```

---

### Task 11: Avatar review + Phase 1 completion — ⛔ STOP

**Files:** none (verification).

- [ ] **Step 1: Run the Phase-1 completion checklist**

```bash
pnpm build                      # all three packages build
pnpm lint && pnpm check-types
pnpm test                       # tokens node:test; styles drift; react node+browser (Storybook a11y)
pnpm publint && pnpm attw       # local package validation passes
pnpm --filter @yarapa-ui/plain-html-fixture test
grep -rl -- "--yp-color-brand-solid:" --include="*.css" --include="*.mjs" . \
  | grep -vE "node_modules|/dist/|packages/tokens/src"   # expect: no output
for p in packages/tokens packages/styles packages/react; do
  (cd $p && npm pack --dry-run 2>&1 | tail -20)
done
```

Expected: every gate green; no hand-authored token value outside `packages/tokens/src` (generated pass-throughs live in gitignored `dist/`); packs contain only `dist/` artifacts (js + d.ts + CSS) — no `src/` leakage, no raw TSX shipped.

- [ ] **Step 2: ⛔ STOP — present Avatar for user review**

Storybook visual render (all 7 stories), broken-image interaction proof, a11y results, docs entry, primitive decision. Apply requested changes and re-review until approved.

- [ ] **Step 3: Record outcome and freeze Phase 1**

Append "Phase 1 outcome" to `docs/superpowers/notes/` (new file `2026-09-03-phase1-outcome.md`): Button stays native; Avatar primitive decision from Task 8; drift test pattern validated on two components; open items for Phase 2 (multi-part resolver/slot decision still deferred until a multipart component; Input `Omit<…, "size">` pattern to remember when it returns; peer-range widening needs a tested React matrix; publish flow = human 2FA first, then Trusted Publishing). Update `README.md` "Current state": tokens/styles/react exist, Button + Avatar approved, nothing published yet.

```bash
git add docs README.md
git commit -m "docs(repo): record phase 1 outcome"
```

**Phase 1 ends here. No third component, no Input, no Select, no release work.**

---

## After this plan (not in scope — future phases, each needs its own spec/plan)

- Phase 2+ components: one design checkpoint per component, never batch (Input: remember native `size?: number` collides with variant `size` — `Omit` required; Select: the CVA-vs-tailwind-variants slots decider, then Base UI's first appearance).
- Publishing: npm org `@yarapa-ui` (human), first 0.1.0 via human 2FA, then Trusted Publishing + changesets release workflow (Trusted Publishing requires the packages to already exist on the registry).
- `apps/docs` Next.js consumer, llms.txt generation, bulk migration of the legacy 30 components — all deferred, each its own review gate.
