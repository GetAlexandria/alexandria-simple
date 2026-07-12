/**
 * Print the canvas server's base URL by reading the .server file the canvas
 * server writes on startup. Lets skills construct API URLs without hardcoding
 * a port — the spike's port resolution cascade is allowed to roam.
 *
 * Usage:
 *   bun run scripts/canvas-url.ts                # uses CLAUDE_PROJECT_DIR or cwd
 *   bun run scripts/canvas-url.ts --project-root <path>
 *
 * Exits non-zero with a message on stderr if the .server file is missing —
 * which is the right signal that the canvas server isn't running.
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { projectRootFromArgs } from "./_canvas-paths";

const root = projectRootFromArgs(process.argv.slice(2));
const serverFile = join(root, "docs/alexandria/.canvas-state/.server");

if (!existsSync(serverFile)) {
  console.error(`canvas server .server file not found at ${serverFile}`);
  console.error("(start the canvas server with `bun run scripts/canvas-server.ts`)");
  process.exit(1);
}

try {
  const info = JSON.parse(readFileSync(serverFile, "utf-8")) as { port?: number };
  if (typeof info.port !== "number") {
    console.error(".server file has no port field");
    process.exit(1);
  }
  console.log(`http://127.0.0.1:${info.port}`);
} catch (e) {
  console.error(`failed to read .server: ${(e as Error).message}`);
  process.exit(1);
}
