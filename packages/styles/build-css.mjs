#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "src");
const dist = join(root, "dist");
const tokensDist = join(root, "../tokens/dist");

const LAYER_ORDER = "@layer yarapa-tokens, yarapa-components;\n";
const layer = (name, css) => `${LAYER_ORDER}@layer ${name} {\n${css.trimEnd()}\n}\n`;

mkdirSync(join(dist, "themes"), { recursive: true });

// 1. Compile each authored component file with the Tailwind CLI
//    (@reference inlines utilities; preflight never enters the output).
//    This script runs AFTER tsdown (whose clean empties dist), so
//    dist/themes creation above happens before any write.
const componentFiles = readdirSync(src).filter(
  (f) => f.endsWith(".css") && f !== "tailwind.css",
);
const compiled = {};
for (const file of componentFiles) {
  const name = file.replace(/\.css$/, "");
  execFileSync(
    "pnpm",
    ["exec", "tailwindcss", "-i", join(src, file), "-o", join(dist, `${name}.css`)],
    { cwd: root, stdio: "inherit" },
  );
  compiled[name] = readFileSync(join(dist, `${name}.css`), "utf8");
}

// 2. Selective component files: real cascade layer, same semantics as aggregate.
for (const [name, css] of Object.entries(compiled)) {
  writeFileSync(join(dist, `${name}.css`), layer("yarapa-components", css));
}

// 3. Token artifacts pass through from @yarapa-ui/tokens (build-time only),
//    wrapped in the token layer so selective users cascade identically.
writeFileSync(
  join(dist, "tokens.css"),
  layer("yarapa-tokens", readFileSync(join(tokensDist, "tokens.css"), "utf8")),
);
for (const theme of ["dark", "high-contrast"]) {
  writeFileSync(
    join(dist, "themes", `${theme}.css`),
    layer("yarapa-tokens", readFileSync(join(tokensDist, "themes", `${theme}.css`), "utf8")),
  );
}

// 4. Aggregate: one self-contained layered file.
const tokensBlock = [
  readFileSync(join(tokensDist, "tokens.css"), "utf8"),
  readFileSync(join(tokensDist, "themes", "dark.css"), "utf8"),
  readFileSync(join(tokensDist, "themes", "high-contrast.css"), "utf8"),
].join("\n");
const componentsBlock = Object.values(compiled).join("\n");
writeFileSync(
  join(dist, "index.css"),
  `${LAYER_ORDER}@layer yarapa-tokens {\n${tokensBlock}\n}\n@layer yarapa-components {\n${componentsBlock}\n}\n`,
);

console.log(`@yarapa-ui/styles: css build ok (${componentFiles.join(", ")})`);
