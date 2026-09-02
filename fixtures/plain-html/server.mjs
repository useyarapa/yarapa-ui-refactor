import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../..");
const port = process.env.PORT ?? 4173;

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = resolve(join(repoRoot, url));
  if (!normalize(file).startsWith(repoRoot)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": file.endsWith(".css")
        ? "text/css"
        : file.endsWith(".html")
          ? "text/html"
          : "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, "127.0.0.1", () => console.log(`fixture on http://127.0.0.1:${port}`));
