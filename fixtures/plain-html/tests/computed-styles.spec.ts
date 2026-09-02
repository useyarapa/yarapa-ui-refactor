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
