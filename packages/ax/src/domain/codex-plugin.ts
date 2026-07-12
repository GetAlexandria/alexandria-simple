import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { resolveCodexBinary } from "./codex-process.js";

const CODEX_MARKETPLACE_RELATIVE_PATH = ".agents/plugins/marketplace.json";
const CODEX_PLUGIN_MANIFEST_RELATIVE_PATH = ".codex-plugin/plugin.json";
const ALEXANDRIA_PLUGIN_NAME = "alexandria";

export interface AlexandriaCodexPluginInstallOptions {
  env?: NodeJS.ProcessEnv;
  projectRoot?: string;
}

interface ResolvedAlexandriaCodexMarketplace {
  marketplaceName: string;
  pluginName: string;
  pluginRoot: string;
  root: string;
}

export class MissingAlexandriaCodexMarketplaceError extends Error {
  constructor() {
    super(
      [
        "Could not locate the Alexandria Codex plugin marketplace.",
        "Expected marketplace metadata in an installed Alexandria plugin payload or Alexandria source checkout.",
        "Install or upgrade Alexandria, or run `ax start all --no-codex` to start without Codex.",
      ].join(" "),
    );
    this.name = "MissingAlexandriaCodexMarketplaceError";
  }
}

export class MissingCodexCliError extends Error {
  constructor(codexBinary: string) {
    super(
      [
        "Could not find the Codex CLI while starting the managed Codex substrate.",
        `Tried to run: ${codexBinary}.`,
        "Install Codex or set ALEXANDRIA_CODEX_BIN to the Codex executable.",
        "To start without Codex, run `ax start all --no-codex`.",
      ].join(" "),
    );
    this.name = "MissingCodexCliError";
  }
}

function ancestorDirs(start: string, maxDepth: number): string[] {
  const dirs: string[] = [];
  let current = resolve(start);

  for (let depth = 0; depth <= maxDepth; depth++) {
    dirs.push(current);
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return dirs;
}

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths)];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface ParsedSemverDirectory {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
}

function parseSemverDirectory(name: string): ParsedSemverDirectory | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$/.exec(name);
  if (match == null) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
  };
}

function comparePrereleaseDesc(a: string, b: string): number {
  const aIdentifiers = a.split(".");
  const bIdentifiers = b.split(".");
  const length = Math.max(aIdentifiers.length, bIdentifiers.length);

  for (let index = 0; index < length; index++) {
    const aIdentifier = aIdentifiers[index];
    const bIdentifier = bIdentifiers[index];
    if (aIdentifier == null) {
      return 1;
    }
    if (bIdentifier == null) {
      return -1;
    }

    const aNumeric = /^\d+$/.test(aIdentifier);
    const bNumeric = /^\d+$/.test(bIdentifier);
    if (aNumeric && bNumeric) {
      const numeric = Number(bIdentifier) - Number(aIdentifier);
      if (numeric !== 0) {
        return numeric;
      }
    } else if (aNumeric) {
      return 1;
    } else if (bNumeric) {
      return -1;
    } else if (aIdentifier !== bIdentifier) {
      return aIdentifier < bIdentifier ? 1 : -1;
    }
  }

  return 0;
}

function compareVersionDirectoryNamesDesc(a: string, b: string): number {
  const parsedA = parseSemverDirectory(a);
  const parsedB = parseSemverDirectory(b);

  if (parsedA != null && parsedB != null) {
    for (const key of ["major", "minor", "patch"] as const) {
      const diff = parsedB[key] - parsedA[key];
      if (diff !== 0) {
        return diff;
      }
    }

    if (parsedA.prerelease == null && parsedB.prerelease != null) {
      return -1;
    }
    if (parsedA.prerelease != null && parsedB.prerelease == null) {
      return 1;
    }
    if (parsedA.prerelease != null && parsedB.prerelease != null) {
      const prerelease = comparePrereleaseDesc(parsedA.prerelease, parsedB.prerelease);
      if (prerelease !== 0) {
        return prerelease;
      }
    }
    return b.localeCompare(a);
  }

  if (parsedA != null) {
    return -1;
  }
  if (parsedB != null) {
    return 1;
  }
  return b.localeCompare(a);
}

function pluginCacheRoots(home: string | undefined): string[] {
  if (home == null || home.length === 0) {
    return [];
  }

  const cacheRoot = join(home, ".claude", "plugins", "cache", "alexandria", "alexandria");

  try {
    return readdirSync(cacheRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(compareVersionDirectoryNamesDesc)
      .map((entry) => join(cacheRoot, entry));
  } catch {
    return [];
  }
}

function installedPluginRoots(options: AlexandriaCodexPluginInstallOptions): string[] {
  const env = options.env ?? process.env;
  const projectRoot = resolve(options.projectRoot ?? process.cwd());
  const home = env.HOME?.trim();
  const homePluginRoot =
    home == null || home.length === 0 ? [] : [join(home, ".claude", "plugins", "alexandria")];

  return uniquePaths([
    join(projectRoot, ".claude", "plugins", "alexandria"),
    ...homePluginRoot,
    ...pluginCacheRoots(home),
  ]);
}

function sourceMarketplaceRoots(options: AlexandriaCodexPluginInstallOptions): string[] {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const executableDir = dirname(process.execPath);
  const projectRoot = resolve(options.projectRoot ?? process.cwd());

  return uniquePaths([
    ...ancestorDirs(projectRoot, 5),
    ...ancestorDirs(moduleDir, 6),
    ...ancestorDirs(executableDir, 6),
  ]);
}

function sourcePathForPlugin(plugin: Record<string, unknown>): string | null {
  if (typeof plugin.source === "string") {
    return plugin.source;
  }

  if (isRecord(plugin.source) && typeof plugin.source.path === "string") {
    return plugin.source.path;
  }

  if (typeof plugin.path === "string") {
    return plugin.path;
  }

  return null;
}

function resolveMarketplaceCandidate(root: string): ResolvedAlexandriaCodexMarketplace | null {
  const marketplacePath = join(root, CODEX_MARKETPLACE_RELATIVE_PATH);
  if (!existsSync(marketplacePath)) {
    return null;
  }

  let manifest: unknown;
  try {
    manifest = JSON.parse(readFileSync(marketplacePath, "utf8"));
  } catch {
    return null;
  }

  if (
    !isRecord(manifest) ||
    typeof manifest.name !== "string" ||
    !Array.isArray(manifest.plugins)
  ) {
    return null;
  }

  const plugin = manifest.plugins.find(
    (candidate): candidate is Record<string, unknown> =>
      isRecord(candidate) && candidate.name === ALEXANDRIA_PLUGIN_NAME,
  );
  if (plugin == null) {
    return null;
  }

  const sourcePath = sourcePathForPlugin(plugin);
  if (sourcePath == null || sourcePath.length === 0) {
    return null;
  }

  const pluginRoot = resolve(root, sourcePath);
  if (!existsSync(join(pluginRoot, CODEX_PLUGIN_MANIFEST_RELATIVE_PATH))) {
    return null;
  }

  return {
    marketplaceName: manifest.name,
    pluginName: ALEXANDRIA_PLUGIN_NAME,
    pluginRoot,
    root,
  };
}

function resolveAlexandriaCodexMarketplace(
  options: AlexandriaCodexPluginInstallOptions = {},
): ResolvedAlexandriaCodexMarketplace | null {
  for (const candidate of installedPluginRoots(options)) {
    const resolved = resolveMarketplaceCandidate(candidate);
    if (resolved != null) {
      return resolved;
    }

    if (existsSync(candidate)) {
      return null;
    }
  }

  for (const candidate of sourceMarketplaceRoots(options)) {
    const resolved = resolveMarketplaceCandidate(candidate);
    if (resolved != null) {
      return resolved;
    }
  }

  return null;
}

export function resolveAlexandriaCodexMarketplaceRoot(
  options: AlexandriaCodexPluginInstallOptions = {},
): string | null {
  return resolveAlexandriaCodexMarketplace(options)?.root ?? null;
}

function isMissingExecutableError(error: unknown): boolean {
  return error != null && typeof error === "object" && "code" in error && error.code === "ENOENT";
}

async function runCodexPluginCommand(
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<Error | null> {
  const codexBinary = resolveCodexBinary(env);
  let proc: Bun.Subprocess<"ignore", "pipe", "pipe">;
  try {
    proc = Bun.spawn({
      cmd: [codexBinary, ...args],
      env,
      stdin: "ignore",
      stderr: "pipe",
      stdout: "pipe",
    });
  } catch (error) {
    if (isMissingExecutableError(error)) {
      return new MissingCodexCliError(codexBinary);
    }

    return new Error(
      `Failed to run codex ${args.join(" ")}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);

  if (exitCode === 0) {
    return null;
  }

  return new Error(
    [`Failed to run codex ${args.join(" ")}.`, stderr.trim(), stdout.trim()]
      .filter((line) => line.length > 0)
      .join("\n"),
  );
}

export async function ensureAlexandriaCodexPluginInstalled(
  options: AlexandriaCodexPluginInstallOptions = {},
): Promise<Error | null> {
  const env = options.env ?? process.env;
  const marketplace = resolveAlexandriaCodexMarketplace(options);
  if (marketplace == null) {
    return new MissingAlexandriaCodexMarketplaceError();
  }

  const marketplaceAdd = await runCodexPluginCommand(
    ["plugin", "marketplace", "add", marketplace.root],
    env,
  );
  if (marketplaceAdd != null) {
    // A marketplace named "alexandria" registered from another checkout or
    // project is not fatal: the plugin can still install from it. This is the
    // normal state on any machine that has used Alexandria in more than one
    // project.
    const alreadyAddedElsewhere = marketplaceAdd.message.includes(
      "already added from a different source",
    );
    if (!alreadyAddedElsewhere) {
      return marketplaceAdd;
    }
  }

  return runCodexPluginCommand(
    ["plugin", "add", marketplace.pluginName, "--marketplace", marketplace.marketplaceName],
    env,
  );
}
