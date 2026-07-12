import { Buffer } from "buffer";
import { Data, Effect, Either } from "effect";
import { basename, dirname, join, resolve } from "path";
import { gunzipSync } from "zlib";
import type { CliResult } from "../cli/result.js";
import {
  DownloadError,
  describeUpgradeRuntimeError,
  UpgradeRuntime,
  type UpgradeRuntimeError,
} from "../effects/upgrade-runtime.js";

type InstallScope = "project" | "user";

interface UpgradeOptions {
  axInstallDir?: string;
  cwd: string;
  downloadsUrl: string;
  dryRun: boolean;
  env: NodeJS.ProcessEnv;
  version?: string;
}

interface UpgradePlan {
  axTarget: string;
  currentVersion: string;
  downloadsUrl: string;
  fabroTarget: string;
  platform: string;
  pluginTarget: string;
  scope: InstallScope;
  targetVersion: string;
}

interface UpgradeSummary extends UpgradePlan {
  registrationMessages: string[];
}

class CommandExitError extends Data.TaggedError("CommandExitError")<{
  readonly command: readonly string[];
  readonly fallback: string;
  readonly stderr: string;
}> {}

class MissingHomeError extends Data.TaggedError("MissingHomeError")<{
  readonly detail: string;
}> {}

class MissingPathError extends Data.TaggedError("MissingPathError")<{
  readonly detail: string;
  readonly path: string;
}> {}

class PartialUpgradeError extends Data.TaggedError("PartialUpgradeError")<{
  readonly detail: string;
  readonly pluginTarget: string;
  readonly targetVersion: string;
}> {}

class UnsafeArchiveError extends Data.TaggedError("UnsafeArchiveError")<{
  readonly entry: string;
}> {}

class UnsupportedPlatformError extends Data.TaggedError("UnsupportedPlatformError")<{
  readonly detail: string;
}> {}

type UpgradeError =
  | CommandExitError
  | MissingHomeError
  | MissingPathError
  | PartialUpgradeError
  | UnsafeArchiveError
  | UnsupportedPlatformError
  | UpgradeRuntimeError;

export const UPGRADE_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

const DEFAULT_DOWNLOADS_URL = "https://downloads.getalexandria.ai";
const FETCH_TIMEOUT_MS = 30_000;
const PLUGIN_REF = "alexandria@alexandria";

export function formatUpgradeHelp(): string {
  return [
    "Usage: ax upgrade [options]",
    "",
    "Download and install the latest Alexandria plugin payload, ax binary, and Fabro sidecar.",
    "",
    "Options:",
    "  --version <version>       Install a specific Alexandria version.",
    "  --downloads-url <url>     Override the downloads base URL.",
    "  --ax-install-dir <path>   Override the directory that receives ax and Fabro.",
    "  --dry-run                 Resolve and print the plan without changing files.",
    "  --help, -h                Show this help message.",
    "",
    "Environment:",
    "  ALEXANDRIA_VERSION        Default version override.",
    "  ALEXANDRIA_DOWNLOADS_URL  Default downloads base URL override.",
    "  ALEXANDRIA_AX_INSTALL_DIR Default ax/Fabro install directory override.",
    "",
    "Exit codes:",
    "  0  Upgrade completed or dry run printed.",
    "  1  Upgrade failed.",
    "  2  Invalid input.",
    "",
    "Note: without --version, --dry-run still resolves the latest version from the downloads URL.",
  ].join("\n");
}

function invalidInput(message: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${formatUpgradeHelp()}`,
    exitCode: UPGRADE_EXIT_CODES.invalidInput,
  };
}

function readOptionValue(args: string[], index: number, option: string): string | CliResult {
  const value = args[index + 1];
  if (value == null || value.startsWith("-")) {
    return invalidInput(`Missing value for ${option}.`);
  }

  return value;
}

export function parseUpgradeArgs(
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv = process.env,
): CliResult | UpgradeOptions {
  let axInstallDir: string | undefined = env.ALEXANDRIA_AX_INSTALL_DIR?.trim() || undefined;
  let downloadsUrl = env.ALEXANDRIA_DOWNLOADS_URL?.trim() || DEFAULT_DOWNLOADS_URL;
  let dryRun = false;
  let version = env.ALEXANDRIA_VERSION?.trim() || undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--version") {
      const value = readOptionValue(args, index, "--version");
      if (typeof value !== "string") {
        return value;
      }
      version = value;
      index++;
      continue;
    }

    if (arg.startsWith("--version=")) {
      version = arg.slice("--version=".length);
      continue;
    }

    if (arg === "--downloads-url") {
      const value = readOptionValue(args, index, "--downloads-url");
      if (typeof value !== "string") {
        return value;
      }
      downloadsUrl = value;
      index++;
      continue;
    }

    if (arg.startsWith("--downloads-url=")) {
      downloadsUrl = arg.slice("--downloads-url=".length);
      continue;
    }

    if (arg === "--ax-install-dir") {
      const value = readOptionValue(args, index, "--ax-install-dir");
      if (typeof value !== "string") {
        return value;
      }
      axInstallDir = value;
      index++;
      continue;
    }

    if (arg.startsWith("--ax-install-dir=")) {
      axInstallDir = arg.slice("--ax-install-dir=".length);
      continue;
    }

    return invalidInput(`Unknown option for ax upgrade: ${arg}`);
  }

  if (version != null && version.length === 0) {
    return invalidInput("Version must not be empty.");
  }

  if (downloadsUrl.trim().length === 0) {
    return invalidInput("Downloads URL must not be empty.");
  }

  return {
    cwd,
    downloadsUrl: downloadsUrl.replace(/\/+$/, ""),
    dryRun,
    env,
    ...(axInstallDir == null ? {} : { axInstallDir }),
    ...(version == null ? {} : { version }),
  };
}

function describeUpgradeError(error: UpgradeError): string {
  switch (error._tag) {
    case "CommandExecutionError":
    case "DownloadError":
    case "FileSystemError":
      return describeUpgradeRuntimeError(error);
    case "CommandExitError":
      return error.stderr.length > 0 ? `${error.fallback}: ${error.stderr}` : error.fallback;
    case "MissingHomeError":
      return error.detail;
    case "MissingPathError":
      return `${error.detail}: ${error.path}`;
    case "PartialUpgradeError":
      return `${error.detail}\nPartial upgrade: plugin payload was updated to ${error.targetVersion} at ${error.pluginTarget}; runtime binary update did not complete`;
    case "UnsafeArchiveError":
      return `unsafe archive entry: ${error.entry}`;
    case "UnsupportedPlatformError":
      return error.detail;
  }
}

function resolveHome(env: NodeJS.ProcessEnv): Effect.Effect<string, MissingHomeError> {
  const home = env.HOME?.trim();
  return home == null || home.length === 0
    ? Effect.fail(
        new MissingHomeError({
          detail: "HOME is required to resolve Alexandria install paths",
        }),
      )
    : Effect.succeed(home);
}

function detectRepoRoot(
  cwd: string,
  env: NodeJS.ProcessEnv,
): Effect.Effect<string | null, never, UpgradeRuntime> {
  return Effect.gen(function* () {
    const runtime = yield* UpgradeRuntime;
    const result = yield* runtime
      .command(["git", "rev-parse", "--show-toplevel"], { cwd, env })
      .pipe(Effect.catchAll(() => Effect.succeed({ exitCode: 1, stdout: "", stderr: "" })));

    return result.exitCode === 0 && result.stdout.length > 0 ? result.stdout : null;
  });
}

function resolvePluginTarget(
  cwd: string,
  env: NodeJS.ProcessEnv,
): Effect.Effect<{ pluginTarget: string; scope: InstallScope }, UpgradeError, UpgradeRuntime> {
  return Effect.gen(function* () {
    const repoRoot = yield* detectRepoRoot(cwd, env);
    if (repoRoot != null) {
      return {
        pluginTarget: join(repoRoot, ".claude", "plugins", "alexandria"),
        scope: "project" as const,
      };
    }

    const home = yield* resolveHome(env);
    return {
      pluginTarget: join(home, ".claude", "plugins", "alexandria"),
      scope: "user" as const,
    };
  });
}

function resolveAxInstallDir(
  options: UpgradeOptions,
): Effect.Effect<string, UpgradeError, UpgradeRuntime> {
  if (options.axInstallDir != null && options.axInstallDir.length > 0) {
    return Effect.succeed(resolve(options.axInstallDir));
  }

  return Effect.gen(function* () {
    const runtime = yield* UpgradeRuntime;
    if (basename(runtime.execPath) === "ax") {
      return dirname(resolve(runtime.execPath));
    }

    const home = yield* resolveHome(options.env);
    const localBin = join(home, ".local", "bin");
    return yield* runtime.makeDirectory(localBin).pipe(
      Effect.as(localBin),
      Effect.catchAll(() => Effect.succeed(join(home, ".alexandria", "bin"))),
    );
  });
}

function detectPlatform(): Effect.Effect<string, UnsupportedPlatformError, UpgradeRuntime> {
  return Effect.gen(function* () {
    const runtime = yield* UpgradeRuntime;
    const os = runtime.platform;
    const arch = runtime.arch === "x64" ? "x64" : runtime.arch === "arm64" ? "arm64" : runtime.arch;

    if (!["darwin", "linux"].includes(os)) {
      return yield* Effect.fail(
        new UnsupportedPlatformError({
          detail: `Unsupported operating system: ${runtime.platform}`,
        }),
      );
    }

    if (!["x64", "arm64"].includes(arch)) {
      return yield* Effect.fail(
        new UnsupportedPlatformError({
          detail: `Unsupported architecture: ${runtime.arch}`,
        }),
      );
    }

    return `${os}-${arch}`;
  });
}

function readCurrentVersion(pluginTarget: string): Effect.Effect<string, never, UpgradeRuntime> {
  return Effect.gen(function* () {
    const runtime = yield* UpgradeRuntime;
    return yield* runtime.readText(join(pluginTarget, "VERSION")).pipe(
      Effect.map((content) => {
        const version = content.trim();
        return version.length > 0 ? version : "unknown";
      }),
      Effect.catchAll(() => Effect.succeed("unknown")),
    );
  });
}

function fetchTargetVersion(
  options: UpgradeOptions,
): Effect.Effect<string, UpgradeError, UpgradeRuntime> {
  if (options.version != null) {
    return Effect.succeed(options.version);
  }

  return Effect.gen(function* () {
    const runtime = yield* UpgradeRuntime;
    const url = `${options.downloadsUrl}/latest-version.txt`;
    const version = (yield* runtime.fetchText(url, FETCH_TIMEOUT_MS)).trim();
    if (version.length === 0) {
      return yield* Effect.fail(
        new DownloadError({
          detail: "response was empty",
          url,
        }),
      );
    }

    return version;
  });
}

function readTarString(block: Buffer, offset: number, length: number): string {
  const slice = block.subarray(offset, offset + length);
  const end = slice.indexOf(0);
  return slice.subarray(0, end === -1 ? slice.length : end).toString("utf8");
}

function readTarSize(block: Buffer): number {
  const rawSize = readTarString(block, 124, 12).trim();
  return rawSize.length === 0 ? 0 : Number.parseInt(rawSize, 8);
}

function readPaxHeaders(content: Buffer): Record<string, string> {
  const headers: Record<string, string> = {};
  let offset = 0;

  while (offset < content.length) {
    const spaceIndex = content.indexOf(0x20, offset);
    if (spaceIndex === -1) {
      break;
    }

    const length = Number.parseInt(content.subarray(offset, spaceIndex).toString("ascii"), 10);
    if (!Number.isFinite(length) || length <= 0) {
      break;
    }

    const record = content.subarray(spaceIndex + 1, offset + length - 1).toString("utf8");
    const equalsIndex = record.indexOf("=");
    if (equalsIndex > 0) {
      headers[record.slice(0, equalsIndex)] = record.slice(equalsIndex + 1);
    }

    offset += length;
  }

  return headers;
}

function isZeroBlock(block: Buffer): boolean {
  return block.every((byte) => byte === 0);
}

function unsafeArchiveEntry(name: string): string | null {
  if (name.length === 0 || name.startsWith("/")) {
    return name;
  }

  return name.split("/").some((segment) => segment === "..") ? name : null;
}

function inspectTarGzipArchive(
  archivePath: string,
  archiveBytes: Uint8Array,
): Effect.Effect<void, UnsafeArchiveError> {
  return Effect.try({
    try: () => gunzipSync(archiveBytes),
    catch: (cause) =>
      new UnsafeArchiveError({
        entry: `${archivePath} (could not read gzip payload: ${
          cause instanceof Error ? cause.message : String(cause)
        })`,
      }),
  }).pipe(
    Effect.flatMap((tarBytes) =>
      Effect.try({
        try: () => {
          let offset = 0;
          let nextPaxHeaders: Record<string, string> = {};
          while (offset < tarBytes.length) {
            const block = Buffer.from(tarBytes.subarray(offset, offset + 512));
            if (block.length < 512 || isZeroBlock(block)) {
              return;
            }

            const name = readTarString(block, 0, 100);
            const prefix = readTarString(block, 345, 155);
            const headerName = prefix.length > 0 ? `${prefix}/${name}` : name;
            const typeFlag = readTarString(block, 156, 1) || "0";
            const size = readTarSize(block);
            if (!Number.isFinite(size) || size < 0) {
              throw new UnsafeArchiveError({
                entry: `${headerName} (invalid tar size)`,
              });
            }

            const contentStart = offset + 512;
            const contentEnd = contentStart + size;
            if (contentEnd > tarBytes.length) {
              throw new UnsafeArchiveError({
                entry: `${headerName} (tar entry exceeds archive size)`,
              });
            }
            const content = Buffer.from(tarBytes.subarray(contentStart, contentEnd));
            offset += 512 + Math.ceil(size / 512) * 512;

            if (typeFlag === "x") {
              nextPaxHeaders = readPaxHeaders(content);
              const unsafePaxPath =
                nextPaxHeaders.path == null ? null : unsafeArchiveEntry(nextPaxHeaders.path);
              if (unsafePaxPath != null) {
                throw new UnsafeArchiveError({ entry: unsafePaxPath });
              }
              continue;
            }

            if (typeFlag === "g") {
              const globalPaxHeaders = readPaxHeaders(content);
              if (globalPaxHeaders.path != null || globalPaxHeaders.linkpath != null) {
                throw new UnsafeArchiveError({
                  entry: `${headerName} (unsupported global pax path metadata)`,
                });
              }
              continue;
            }

            const fullName = nextPaxHeaders.path ?? headerName;
            const linkName = nextPaxHeaders.linkpath ?? readTarString(block, 157, 100);
            nextPaxHeaders = {};
            const unsafeName = unsafeArchiveEntry(fullName);
            if (unsafeName != null) {
              throw new UnsafeArchiveError({ entry: unsafeName });
            }

            if (typeFlag !== "0" && typeFlag !== "5") {
              const target = linkName.length > 0 ? ` -> ${linkName}` : "";
              throw new UnsafeArchiveError({
                entry: `${fullName}${target} (unsupported tar entry type ${typeFlag})`,
              });
            }
          }
        },
        catch: (error) =>
          error instanceof UnsafeArchiveError
            ? error
            : new UnsafeArchiveError({
                entry: `${archivePath} (could not inspect tar payload: ${
                  error instanceof Error ? error.message : String(error)
                })`,
              }),
      }),
    ),
  );
}

function assertSafeArchiveEntries(
  archivePath: string,
): Effect.Effect<void, UpgradeError, UpgradeRuntime> {
  return Effect.gen(function* () {
    const runtime = yield* UpgradeRuntime;
    const archiveBytes = yield* runtime.readBytes(archivePath);
    yield* inspectTarGzipArchive(archivePath, archiveBytes);
  });
}

function extractArchive(
  archivePath: string,
  targetDir: string,
): Effect.Effect<void, UpgradeError, UpgradeRuntime> {
  return Effect.gen(function* () {
    const runtime = yield* UpgradeRuntime;
    yield* assertSafeArchiveEntries(archivePath);
    const command = [
      "tar",
      "--no-same-owner",
      "--no-same-permissions",
      "-xzf",
      archivePath,
      "-C",
      targetDir,
    ] as const;
    const result = yield* runtime.command(command);
    if (result.exitCode !== 0) {
      return yield* Effect.fail(
        new CommandExitError({
          command,
          fallback: "tar extraction failed",
          stderr: result.stderr,
        }),
      );
    }
  });
}

function installPluginPayload(
  plan: UpgradePlan,
  stagingDir: string,
): Effect.Effect<void, UpgradeError, UpgradeRuntime> {
  return Effect.scoped(
    Effect.gen(function* () {
      const runtime = yield* UpgradeRuntime;
      const archiveName = `alexandria-plugin-v${plan.targetVersion}.tar.gz`;
      const archivePath = join(stagingDir, archiveName);
      const extractedRoot = `alexandria-plugin-v${plan.targetVersion}`;
      const extractedPath = join(stagingDir, extractedRoot);

      yield* runtime.downloadFile(
        `${plan.downloadsUrl}/${archiveName}`,
        archivePath,
        FETCH_TIMEOUT_MS,
      );
      yield* extractArchive(archivePath, stagingDir);

      const extractedExists = yield* runtime.pathExists(extractedPath);
      if (!extractedExists) {
        return yield* Effect.fail(
          new MissingPathError({
            detail: `expected extracted directory ${extractedRoot}`,
            path: extractedPath,
          }),
        );
      }

      const pluginParent = dirname(plan.pluginTarget);
      yield* runtime.makeDirectory(pluginParent);

      const replacementParent = yield* runtime.makeTempDirectoryScoped(
        join(pluginParent, ".alexandria-plugin-"),
      );
      const replacementPath = join(replacementParent, basename(plan.pluginTarget));
      const backupParent = yield* runtime.makeTempDirectoryScoped(
        join(pluginParent, ".alexandria-plugin-backup-"),
      );
      const backupPath = join(backupParent, basename(plan.pluginTarget));
      let hasBackup = false;

      const install = Effect.gen(function* () {
        yield* runtime.copy(extractedPath, replacementPath, {
          recursive: true,
        });

        const targetExists = yield* runtime.pathExists(plan.pluginTarget);
        if (targetExists) {
          yield* runtime.rename(plan.pluginTarget, backupPath);
          hasBackup = true;
        }

        yield* runtime.rename(replacementPath, plan.pluginTarget);
        yield* runtime.remove(backupParent, { recursive: true, force: true });
        hasBackup = false;
      });

      yield* install.pipe(
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            const backupExists = hasBackup ? yield* runtime.pathExists(backupPath) : false;
            const targetExists = yield* runtime.pathExists(plan.pluginTarget);
            if (hasBackup && backupExists && !targetExists) {
              yield* runtime
                .rename(backupPath, plan.pluginTarget)
                .pipe(Effect.catchAll(() => Effect.void));
            }

            return yield* Effect.fail(error);
          }),
        ),
      );
    }),
  );
}

function installAxBinary(
  plan: UpgradePlan,
  stagingDir: string,
): Effect.Effect<void, UpgradeError, UpgradeRuntime> {
  return Effect.gen(function* () {
    const runtime = yield* UpgradeRuntime;
    const archiveName = `ax-v${plan.targetVersion}-${plan.platform}.tar.gz`;
    const archivePath = join(stagingDir, archiveName);
    const extractDir = join(stagingDir, "ax");
    const extractedBinary = join(extractDir, "ax");

    yield* runtime.downloadFile(
      `${plan.downloadsUrl}/${archiveName}`,
      archivePath,
      FETCH_TIMEOUT_MS,
    );
    yield* runtime.makeDirectory(extractDir);
    yield* extractArchive(archivePath, extractDir);

    const binaryExists = yield* runtime.pathExists(extractedBinary);
    if (!binaryExists) {
      return yield* Effect.fail(
        new MissingPathError({
          detail: `expected extracted ax binary in ${archiveName}`,
          path: extractedBinary,
        }),
      );
    }

    yield* runtime.makeDirectory(dirname(plan.axTarget));
    const replacementPath = join(
      dirname(plan.axTarget),
      `.ax-${runtime.processId}-${runtime.nowMs()}`,
    );

    yield* Effect.gen(function* () {
      yield* runtime.copy(extractedBinary, replacementPath);
      yield* runtime.chmod(replacementPath, 0o755);
      yield* runtime.rename(replacementPath, plan.axTarget);
      const extractedViewerAssets = join(extractDir, "dist", "viewer");
      const viewerAssetsTarget = join(dirname(plan.axTarget), "dist", "viewer");
      if (yield* runtime.pathExists(extractedViewerAssets)) {
        yield* runtime.remove(viewerAssetsTarget, {
          recursive: true,
          force: true,
        });
        yield* runtime.copy(extractedViewerAssets, viewerAssetsTarget, {
          recursive: true,
        });
      }
    }).pipe(
      Effect.ensuring(
        runtime.remove(replacementPath, { force: true }).pipe(Effect.catchAll(() => Effect.void)),
      ),
    );
  });
}

function installFabroBinary(
  plan: UpgradePlan,
  stagingDir: string,
): Effect.Effect<void, UpgradeError, UpgradeRuntime> {
  return Effect.gen(function* () {
    const runtime = yield* UpgradeRuntime;
    const archiveName = `fabro-v${plan.targetVersion}-${plan.platform}.tar.gz`;
    const archivePath = join(stagingDir, archiveName);
    const extractDir = join(stagingDir, "fabro");
    const extractedBinary = join(extractDir, "fabro");

    yield* runtime.downloadFile(
      `${plan.downloadsUrl}/${archiveName}`,
      archivePath,
      FETCH_TIMEOUT_MS,
    );
    yield* runtime.makeDirectory(extractDir);
    yield* extractArchive(archivePath, extractDir);

    const binaryExists = yield* runtime.pathExists(extractedBinary);
    if (!binaryExists) {
      return yield* Effect.fail(
        new MissingPathError({
          detail: `expected extracted Fabro binary in ${archiveName}`,
          path: extractedBinary,
        }),
      );
    }

    yield* runtime.makeDirectory(dirname(plan.fabroTarget));
    const replacementPath = join(
      dirname(plan.fabroTarget),
      `.fabro-${runtime.processId}-${runtime.nowMs()}`,
    );

    yield* Effect.gen(function* () {
      yield* runtime.copy(extractedBinary, replacementPath);
      yield* runtime.chmod(replacementPath, 0o755);
      yield* runtime.rename(replacementPath, plan.fabroTarget);
    }).pipe(
      Effect.ensuring(
        runtime.remove(replacementPath, { force: true }).pipe(Effect.catchAll(() => Effect.void)),
      ),
    );
  });
}

function commandExists(
  commandName: string,
  env: NodeJS.ProcessEnv,
): Effect.Effect<boolean, never, UpgradeRuntime> {
  return Effect.gen(function* () {
    const runtime = yield* UpgradeRuntime;
    const pathValue = env.PATH ?? process.env.PATH ?? "";
    for (const entry of pathValue.split(runtime.pathDelimiter)) {
      const candidate = join(entry.length > 0 ? entry : ".", commandName);
      if (yield* runtime.canExecute(candidate)) {
        return true;
      }
    }

    return false;
  });
}

function registerPlugin(
  plan: UpgradePlan,
  env: NodeJS.ProcessEnv,
): Effect.Effect<string[], never, UpgradeRuntime> {
  return Effect.gen(function* () {
    const runtime = yield* UpgradeRuntime;
    if (!(yield* commandExists("claude", env))) {
      return [
        "Claude Code CLI not found; skipping plugin registration.",
        `Register manually: claude plugin marketplace add ${plan.pluginTarget} --scope ${plan.scope}`,
        `Register manually: claude plugin install ${PLUGIN_REF} --scope ${plan.scope}`,
      ];
    }

    const marketplaceAdd = yield* Effect.either(
      runtime.command(
        ["claude", "plugin", "marketplace", "add", plan.pluginTarget, "--scope", plan.scope],
        { env },
      ),
    );
    if (Either.isLeft(marketplaceAdd) || marketplaceAdd.right.exitCode !== 0) {
      return [
        "Claude marketplace registration failed; payloads were still installed.",
        `Run manually: claude plugin marketplace add ${plan.pluginTarget} --scope ${plan.scope}`,
        `Run manually: claude plugin install ${PLUGIN_REF} --scope ${plan.scope}`,
      ];
    }

    const pluginInstall = yield* Effect.either(
      runtime.command(["claude", "plugin", "install", PLUGIN_REF, "--scope", plan.scope], { env }),
    );
    if (Either.isLeft(pluginInstall) || pluginInstall.right.exitCode !== 0) {
      return [
        "Claude plugin install failed after marketplace registration.",
        `Run manually: claude plugin install ${PLUGIN_REF} --scope ${plan.scope}`,
      ];
    }

    return [`Claude plugin registered (${plan.scope} scope).`];
  });
}

function formatField(label: string, value: string): string {
  return `${label.padEnd(14)}${value}`;
}

function formatPlan(plan: UpgradePlan): string {
  return [
    "Alexandria upgrade plan:",
    formatField("Current:", plan.currentVersion),
    formatField("Target:", plan.targetVersion),
    formatField("Plugin:", plan.pluginTarget),
    formatField("ax binary:", plan.axTarget),
    formatField("Fabro:", plan.fabroTarget),
    formatField("Downloads:", plan.downloadsUrl),
    formatField("Platform:", plan.platform),
  ].join("\n");
}

function formatSummary(summary: UpgradeSummary): string {
  return [
    "Alexandria upgrade complete.",
    formatField("Current:", summary.currentVersion),
    formatField("Target:", summary.targetVersion),
    formatField("Plugin:", summary.pluginTarget),
    formatField("ax binary:", summary.axTarget),
    formatField("Fabro:", summary.fabroTarget),
    formatField("Platform:", summary.platform),
    "",
    ...summary.registrationMessages,
  ].join("\n");
}

function createPlan(
  options: UpgradeOptions,
): Effect.Effect<UpgradePlan, UpgradeError, UpgradeRuntime> {
  return Effect.gen(function* () {
    const { pluginTarget, scope } = yield* resolvePluginTarget(options.cwd, options.env);
    const targetVersion = yield* fetchTargetVersion(options);
    const axInstallDir = yield* resolveAxInstallDir(options);
    const currentVersion = yield* readCurrentVersion(pluginTarget);
    const platform = yield* detectPlatform();

    return {
      axTarget: join(axInstallDir, "ax"),
      currentVersion,
      downloadsUrl: options.downloadsUrl,
      fabroTarget: join(axInstallDir, "fabro"),
      platform,
      pluginTarget,
      scope,
      targetVersion,
    };
  });
}

function runInstall(plan: UpgradePlan): Effect.Effect<void, UpgradeError, UpgradeRuntime> {
  return Effect.scoped(
    Effect.gen(function* () {
      const runtime = yield* UpgradeRuntime;
      const stagingDir = yield* runtime.makeTempDirectoryScoped(
        join(runtime.tempDirectory, "alexandria-upgrade-"),
      );
      let pluginInstalled = false;

      yield* Effect.gen(function* () {
        yield* installPluginPayload(plan, stagingDir);
        pluginInstalled = true;
        yield* installFabroBinary(plan, stagingDir);
        yield* installAxBinary(plan, stagingDir);
      }).pipe(
        Effect.catchAll((error) =>
          pluginInstalled
            ? Effect.fail(
                new PartialUpgradeError({
                  detail: describeUpgradeError(error),
                  pluginTarget: plan.pluginTarget,
                  targetVersion: plan.targetVersion,
                }),
              )
            : Effect.fail(error),
        ),
      );
    }),
  );
}

export function runUpgrade(
  options: UpgradeOptions,
): Effect.Effect<CliResult, never, UpgradeRuntime> {
  return Effect.gen(function* () {
    const plan = yield* createPlan(options);

    if (options.dryRun) {
      return {
        stdout: formatPlan(plan),
        stderr: "",
        exitCode: UPGRADE_EXIT_CODES.success,
      };
    }

    const installResult = yield* Effect.either(runInstall(plan));
    if (Either.isLeft(installResult)) {
      return {
        stdout: "",
        stderr: `ax upgrade failed: ${describeUpgradeError(installResult.left)}.`,
        exitCode: UPGRADE_EXIT_CODES.operationalFailure,
      };
    }

    const registrationMessages = yield* registerPlugin(plan, options.env);
    return {
      stdout: formatSummary({ ...plan, registrationMessages }),
      stderr: "",
      exitCode: UPGRADE_EXIT_CODES.success,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: `ax upgrade failed: ${describeUpgradeError(error)}`,
        exitCode: UPGRADE_EXIT_CODES.operationalFailure,
      }),
    ),
  );
}
