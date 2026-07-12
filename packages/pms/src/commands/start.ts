import { existsSync, statSync } from "fs";
import { extname, join, normalize, resolve, sep } from "path";
import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import { handleAlexandriaProxyRequest } from "../server/alexandria-proxy.js";
import { handleStudioRequest } from "../server/studio-api.js";

// `pms start` — PlayMaker Studio's own local server (PMS/Alexandria boundary
// migration, Slice 2). Serves the /api/studio/* surface that used to ride
// Alexandria's runtime server, plus the studio viewer assets when present.

const START_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4322;

const ASSET_CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

export interface PmsStartOptions {
  assetRoot?: string | undefined;
  cwd: string;
  host: string;
  json: boolean;
  port: number;
}

export function formatStartHelp(): string {
  return [
    "Usage: pms start [--host <host>] [--port <port>] [--json]",
    "",
    "Start the PlayMaker Studio server for this project: the /api/studio/*",
    "API over the studio/ records, and the studio viewer when its assets are",
    "installed.",
    "",
    "Options:",
    `  --host <host>  Bind host. Default: ${DEFAULT_HOST}`,
    `  --port <port>  Bind port. Default: ${DEFAULT_PORT}`,
    "  --json         Emit machine-readable startup details.",
    "  --help, -h     Show this help message.",
    "",
    "Alexandria data (active runs, built-by provenance) is read from the",
    "Alexandria runtime's public API (PMS_ALEXANDRIA_ORIGIN, default",
    "http://127.0.0.1:4321); when it is not running those views degrade.",
    "",
    "Exit codes:",
    "  0  Server started.",
    "  1  Server failed to start.",
    "  2  Invalid input.",
  ].join("\n");
}

function invalidInput(message: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${formatStartHelp()}`,
    exitCode: START_EXIT_CODES.invalidInput,
  };
}

export function parseStartArgs(args: string[], cwd: string): PmsStartOptions | CliResult {
  if (args.some((arg) => arg === "--help" || arg === "-h")) {
    return { stdout: formatStartHelp(), stderr: "", exitCode: START_EXIT_CODES.success };
  }

  let host = DEFAULT_HOST;
  let port = DEFAULT_PORT;
  let json = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--json") {
      json = true;
      continue;
    }
    let flag = arg;
    let value: string | undefined;
    const equalsIndex = arg?.indexOf("=") ?? -1;
    if (arg != null && arg.startsWith("--") && equalsIndex > 0) {
      flag = arg.slice(0, equalsIndex);
      value = arg.slice(equalsIndex + 1);
    }
    if (flag !== "--host" && flag !== "--port") {
      return invalidInput(`Unknown argument: ${arg}`);
    }
    if (value == null) {
      value = args[index + 1];
      if (value == null) {
        return invalidInput(`${flag} expects a value.`);
      }
      index += 1;
    }
    if (flag === "--host") {
      if (value.length === 0) {
        return invalidInput("--host expects a non-empty value.");
      }
      host = value;
    } else {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 65535) {
        return invalidInput(`Invalid port: ${value}`);
      }
      port = parsed;
    }
  }

  return { cwd, host, json, port };
}

// The studio viewer's built assets, when installed next to this package
// (packages/pms/viewer/dist in the repo, or a bundled payload downstream).
export function resolveStudioAssetRoot(moduleDir: string): string | null {
  const candidates = [
    join(moduleDir, "..", "..", "viewer", "dist"),
    join(moduleDir, "..", "..", "..", "viewer-dist"),
  ];
  for (const candidate of candidates) {
    const resolved = resolve(candidate);
    if (existsSync(join(resolved, "index.html"))) {
      return resolved;
    }
  }
  return null;
}

function assetResponse(assetRoot: string, pathname: string): Response | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // Malformed percent-encoding is a 404, not an unhandled URIError.
    return null;
  }
  if (decoded.includes("\0")) {
    return null;
  }
  const requested = decoded === "/" ? "/index.html" : decoded;
  const candidatePath = normalize(join(assetRoot, requested));
  if (candidatePath !== assetRoot && !candidatePath.startsWith(assetRoot + sep)) {
    return null;
  }

  let filePath = candidatePath;
  if (!existsSync(filePath)) {
    // SPA-style fallback: directory index, then the app shell — but never
    // for API paths: an unproxied /api/* request must 404, not answer with
    // the HTML app shell and a 200.
    const indexCandidate = join(candidatePath, "index.html");
    if (existsSync(indexCandidate)) {
      filePath = indexCandidate;
    } else if (extname(requested) === "" && !requested.startsWith("/api/")) {
      filePath = join(assetRoot, "index.html");
      if (!existsSync(filePath)) {
        return null;
      }
    } else {
      return null;
    }
  } else if (statSync(filePath).isDirectory()) {
    const indexCandidate = join(filePath, "index.html");
    if (!existsSync(indexCandidate)) {
      return null;
    }
    filePath = indexCandidate;
  }

  const contentType = ASSET_CONTENT_TYPES[extname(filePath)] ?? "application/octet-stream";
  return new Response(Bun.file(filePath), { headers: { "content-type": contentType } });
}

export function runStart(options: PmsStartOptions): Effect.Effect<CliResult, never> {
  return Effect.sync(() => {
    const projectRoot = resolve(options.cwd);
    if (!existsSync(join(projectRoot, "studio"))) {
      return {
        stdout: "",
        stderr: `No studio/ directory at ${projectRoot} — pms start runs from a project with PMS records.`,
        exitCode: START_EXIT_CODES.invalidInput,
      };
    }

    const assetRoot = options.assetRoot ?? resolveStudioAssetRoot(import.meta.dir);

    let server: ReturnType<typeof Bun.serve>;
    try {
      server = Bun.serve({
        hostname: options.host,
        port: options.port,
        fetch: async (request) => {
          const url = new URL(request.url);
          const studioResponse = await handleStudioRequest(url, request, { projectRoot });
          if (studioResponse != null) {
            return studioResponse;
          }
          const proxied = await handleAlexandriaProxyRequest(url, request, { projectRoot });
          if (proxied != null) {
            return proxied;
          }
          if (assetRoot != null) {
            const asset = assetResponse(assetRoot, url.pathname);
            if (asset != null) {
              return asset;
            }
          }
          return new Response("Not found", { status: 404 });
        },
      });
    } catch (error) {
      return {
        stdout: "",
        stderr: `pms server failed to start on ${options.host}:${options.port}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        exitCode: START_EXIT_CODES.operationalFailure,
      };
    }

    const origin = `http://${options.host}:${server.port}`;
    if (options.json) {
      return {
        stdout: JSON.stringify(
          {
            api: `${origin}/api/studio/registry`,
            assetRoot,
            origin,
            projectRoot,
            status: "running",
          },
          null,
          2,
        ),
        stderr: "",
        exitCode: START_EXIT_CODES.success,
        keepsProcessAlive: true,
      };
    }

    return {
      stdout: [
        `PlayMaker Studio server: ${origin}`,
        `Project: ${projectRoot}`,
        assetRoot == null
          ? "Viewer assets: not installed (API only)"
          : `Viewer assets: ${assetRoot}`,
      ].join("\n"),
      stderr: "",
      exitCode: START_EXIT_CODES.success,
      keepsProcessAlive: true,
    };
  });
}
