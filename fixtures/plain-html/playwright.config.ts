import { defineConfig } from "@playwright/test";

// Playwright 1.62 ships no chromium build for macOS 13 (local dev box), so
// outside CI we run the system Chrome. CI installs chromium via --with-deps.
export default defineConfig({
  testDir: "./tests",
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium", ...(process.env.CI ? {} : { channel: "chrome" as const }) },
    },
  ],
  webServer: {
    command: "node server.mjs",
    url: "http://127.0.0.1:4173/fixtures/plain-html/index.html",
    reuseExistingServer: !process.env.CI,
  },
});
