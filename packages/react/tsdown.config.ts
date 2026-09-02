import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/button.tsx"],
  format: ["esm"],
  dts: true,
  clean: true,
  fixedExtension: false,
  external: [/^@yarapa-ui\//, /^react(-dom)?(\/.*)?$/],
});
