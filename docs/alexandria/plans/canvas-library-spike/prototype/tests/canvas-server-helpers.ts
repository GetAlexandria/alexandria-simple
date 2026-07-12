/**
 * Lifecycle helper for canvas-server tests.
 *
 * Spawns scripts/canvas-server.ts with --project-root <temp> --port 0 so
 * each test gets an isolated state directory and an OS-picked port. Reads
 * the resolved port back from the .server file the server writes on
 * startup. Tears down via process.kill on dispose.
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const SERVER = join(REPO_ROOT, "scripts", "canvas-server.ts");

export interface CanvasServerHandle {
  baseUrl: string;
  projectRoot: string;
  stateDir: string;
  dispose(): Promise<void>;
}

export async function startCanvasServer(): Promise<CanvasServerHandle> {
  const projectRoot = mkdtempSync(join(tmpdir(), "canvas-server-test-"));
  const stateDir = join(projectRoot, "docs/alexandria/.canvas-state");
  mkdirSync(stateDir, { recursive: true });

  const proc = Bun.spawn(
    ["bun", "run", SERVER, "--project-root", projectRoot, "--port", "0"],
    { stdout: "pipe", stderr: "pipe" },
  );

  const serverFile = join(stateDir, ".server");
  const startedAt = Date.now();
  // Server writes .server synchronously after Bun.serve returns. Poll briefly
  // (typically ready in <200ms) before giving up.
  let port: number | undefined;
  while (Date.now() - startedAt < 5000) {
    if (existsSync(serverFile)) {
      try {
        const info = JSON.parse(readFileSync(serverFile, "utf-8")) as {
          port?: number;
        };
        if (typeof info.port === "number" && info.port > 0) {
          port = info.port;
          break;
        }
      } catch {
        // Mid-write; try again.
      }
    }
    await Bun.sleep(50);
  }
  if (port == null) {
    proc.kill();
    throw new Error("canvas server failed to write .server within 5s");
  }

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    projectRoot,
    stateDir,
    async dispose() {
      proc.kill();
      // Give the process a beat to release the port so back-to-back tests
      // don't race when the OS recycles file descriptors.
      await proc.exited;
      if (existsSync(projectRoot)) {
        rmSync(projectRoot, { recursive: true, force: true });
      }
    },
  };
}
