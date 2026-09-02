import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { buttonVariants } from "../src/button.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

if (!existsSync(join(dist, "button.css"))) {
  throw new Error(
    "dist/button.css missing — run `pnpm --filter @yarapa-ui/styles build` first (turbo test does this via dependsOn)",
  );
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
