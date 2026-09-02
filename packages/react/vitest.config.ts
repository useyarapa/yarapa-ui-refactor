import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";

// Playwright 1.62 ships no chromium build for macOS 13 (local dev box);
// channel "chrome" runs the system Chrome — same browser family CI uses.
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
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions: { channel: "chrome" } }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
