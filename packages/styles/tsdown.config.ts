import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/button.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  fixedExtension: false,
  external: [/^@yarapa-ui\//, "class-variance-authority"],
});
