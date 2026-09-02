import { defineConfig } from "@playwright/test";

// Playwright 1.62 ships no chromium build for macOS 13; channel "chrome"
// uses the system Chrome — same browser family GitHub's ubuntu runners ship.
export default defineConfig({
  testDir: "./tests",
  projects: [{ name: "chromium", use: { browserName: "chromium", channel: "chrome" } }],
  webServer: {
    command: "node server.mjs",
    url: "http://127.0.0.1:4173/fixtures/plain-html/index.html",
    reuseExistingServer: !process.env.CI,
  },
});
