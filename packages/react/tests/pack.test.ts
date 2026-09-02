import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expect, test } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

if (!existsSync(join(dist, "button.js"))) {
  throw new Error(
    "dist/button.js missing — run `pnpm --filter @yarapa-ui/react build` first (turbo test does this)",
  );
}

test("Button is exported from the built ESM", async () => {
  const mod = await import(pathToFileURL(join(dist, "button.js")).href);
  expect(typeof mod.Button).toBe("function");
});

test("forwarding stylesheet imports the styles aggregate, copies no bytes", () => {
  const css = readFileSync(join(dist, "styles.css"), "utf8");
  expect(css.trim()).toBe('@import "@yarapa-ui/styles/css";');
});
