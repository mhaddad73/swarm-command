import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)).replace(/\/scripts$/, "");
const dist = join(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "src"), { recursive: true });
cpSync(join(root, "index.html"), join(dist, "index.html"));
cpSync(join(root, "src", "main.js"), join(dist, "src", "main.js"));
cpSync(join(root, "src", "styles.css"), join(dist, "src", "styles.css"));

console.log("Built SWARM Command static MVP to dist/");
