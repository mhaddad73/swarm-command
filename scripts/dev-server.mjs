import { createServer } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const base = join(root, process.argv[2] || ".");
const port = Number(process.env.PORT || 5173);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json"
};

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);
  const requested = normalize(url.pathname === "/" ? "/index.html" : url.pathname);
  const path = join(base, requested);
  try {
    const stat = statSync(path);
    const file = stat.isDirectory() ? join(path, "index.html") : path;
    response.writeHead(200, { "Content-Type": types[extname(file)] || "text/plain" });
    response.end(readFileSync(file));
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found");
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`SWARM Command running at http://localhost:${port}`);
});
