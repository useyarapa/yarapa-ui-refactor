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
  // Guard blocks may list theme selectors, but no standalone dark/hc block
  // may appear at the top level of the base artifact.
  assert.doesNotMatch(css, /^\[data-theme="dark"\]\s*\{/m);
  assert.doesNotMatch(css, /^\[data-theme="high-contrast"\]\s*\{/m);
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
