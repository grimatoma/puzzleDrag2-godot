import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const distDir = join(repoRoot, "dist");
const port = Number(process.env.PORT) || 4327;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".wasm": "application/wasm",
  ".pck": "application/octet-stream",
  ".data": "application/octet-stream",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".css": "text/css; charset=utf-8",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
};

function contentType(filePath) {
  return MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
}

const server = createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0].split("#")[0]);
  if (urlPath === "/" || urlPath === "") urlPath = "/index.html";

  const resolved = normalize(join(distDir, urlPath));
  if (resolved !== distDir && !resolved.startsWith(distDir + sep)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
    return;
  }

  if (!existsSync(resolved) || !statSync(resolved).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": contentType(resolved),
    "Cache-Control": "no-store",
  });
  createReadStream(resolved).pipe(res);
});

server.on("error", (err) => {
  console.error(`serve-dist: server error: ${err.message}`);
  process.exit(1);
});

server.listen(port, () => {
  if (!existsSync(distDir)) {
    console.warn(`serve-dist: WARNING — ${distDir} does not exist yet.`);
  }
  console.log(`serve-dist: serving ${distDir}`);
  console.log(`serve-dist: listening on http://localhost:${port}/`);
});
