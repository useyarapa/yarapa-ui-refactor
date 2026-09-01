import { config } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: ["storybook-static/**", "dist/**", "node_modules/**"],
  },
  ...config,
];
