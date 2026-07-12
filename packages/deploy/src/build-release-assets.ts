import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { createHash } from "crypto";
import { basename, dirname, join, resolve } from "path";

const INTERNAL_ROOT = resolve(import.meta.dir, "../../..");
const DEFAULT_PUBLIC_REPO_DIR = resolve(INTERNAL_ROOT, "../alexandria");
const DEFAULT_OUTPUT_DIR = resolve(INTERNAL_ROOT, ".release-artifacts");
const PUBLIC_PLUGIN_DIR = "alexandria";
const PLUGIN_ARCHIVE_PREFIX = "alexandria-plugin";
const CLI_BINARY_NAME = "ax";
const CLI_ENTRYPOINT = "packages/ax/src/cli/main.ts";
const INSTALLER_REVISION_STAMP = "# __ALEXANDRIA_INSTALLER_REVISION_STAMP__";
const DEFAULT_FABRO_RELEASE_VERSION = "0.267.0-nightly.0";
const FABRO_RELEASE_REPOSITORY = "fabro-sh/fabro";
const FABRO_RELEASE_ASSETS: Record<string, string> = {
  "darwin-arm64": "fabro-aarch64-apple-darwin.tar.gz",
  "linux-arm64": "fabro-aarch64-unknown-linux-gnu.tar.gz",
  "linux-x64": "fabro-x86_64-unknown-linux-gnu.tar.gz",
};

type CommandRunner = (command: string[], cwd?: string, env?: NodeJS.ProcessEnv) => void;

interface BuildReleaseAssetsOptions {
  fabroBinary?: string;
  fabroReleaseVersion?: string;
  publicRepoDir?: string;
  outputDir?: string;
  platform?: string;
  target?: string;
  commandRunner?: CommandRunner;
  logger?: Pick<Console, "log">;
}

function assertCanonicalTarget(value: string | undefined): void {
  if (value == null || value.length === 0 || value === "alexandria") {
    return;
  }

  throw new Error(`Unsupported release target: ${value}`);
}

function runCommand(
  command: string[],
  cwd: string = INTERNAL_ROOT,
  env: NodeJS.ProcessEnv = process.env,
): void {
  const proc = Bun.spawnSync(command, {
    cwd,
    env,
    stdout: "inherit",
    stderr: "inherit",
  });

  if ((proc.exitCode ?? 1) !== 0) {
    throw new Error(`Command failed: ${command.join(" ")}`);
  }
}

function readVersionFile(path: string): string {
  const version = readFileSync(path, "utf8").trim();
  if (!version) {
    throw new Error(`Empty version file: ${path}`);
  }
  return version;
}

function readPluginManifestVersion(path: string): string {
  const manifest = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
  };
  if (!manifest.version) {
    throw new Error(`Missing plugin manifest version: ${path}`);
  }
  return manifest.version;
}

function readPluginVersion(pluginRoot: string): string {
  const version = readVersionFile(join(pluginRoot, "VERSION"));
  const manifestVersion = readPluginManifestVersion(
    join(pluginRoot, ".claude-plugin", "plugin.json"),
  );

  if (version !== manifestVersion) {
    throw new Error(
      `Version mismatch in ${pluginRoot}: VERSION=${version} plugin.json=${manifestVersion}`,
    );
  }

  return version;
}

function cleanDirectory(path: string): void {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
}

function downloadFile(options: {
  commandRunner: CommandRunner;
  outputPath: string;
  url: string;
}): void {
  mkdirSync(dirname(options.outputPath), { recursive: true });
  options.commandRunner(
    [
      "curl",
      "--fail",
      "--location",
      "--silent",
      "--show-error",
      "--output",
      options.outputPath,
      options.url,
    ],
    INTERNAL_ROOT,
  );
}

function copyTree(sourceRoot: string, destinationRoot: string): void {
  mkdirSync(destinationRoot, { recursive: true });

  for (const entry of readdirSync(sourceRoot)) {
    if (entry === ".git" || entry === ".tmp") {
      continue;
    }

    const sourcePath = join(sourceRoot, entry);
    const destinationPath = join(destinationRoot, entry);

    if (statSync(sourcePath).isDirectory()) {
      copyTree(sourcePath, destinationPath);
      continue;
    }

    mkdirSync(dirname(destinationPath), { recursive: true });
    cpSync(sourcePath, destinationPath, { dereference: true });
  }
}

function detectPlatform(): string {
  const os = process.platform === "darwin" ? "darwin" : process.platform;
  const arch = process.arch === "x64" ? "x64" : process.arch === "arm64" ? "arm64" : process.arch;

  if (!["darwin", "linux"].includes(os)) {
    throw new Error(`Unsupported release platform: ${os}`);
  }

  if (!["x64", "arm64"].includes(arch)) {
    throw new Error(`Unsupported release architecture: ${arch}`);
  }

  return `${os}-${arch}`;
}

function resolveBuildGitSha(): string {
  const githubSha = process.env.GITHUB_SHA?.trim();
  if (githubSha) {
    return githubSha.slice(0, 7);
  }

  const proc = Bun.spawnSync(["git", "rev-parse", "--short=7", "HEAD"], {
    cwd: INTERNAL_ROOT,
    stdout: "pipe",
    stderr: "ignore",
  });
  if ((proc.exitCode ?? 1) !== 0) {
    return "unknown";
  }

  const sha = proc.stdout.toString().trim();
  return sha.length > 0 ? sha : "unknown";
}

function resolveBuildDate(): string {
  const configuredDate = process.env.ALEXANDRIA_BUILD_DATE?.trim();
  return configuredDate && configuredDate.length > 0
    ? configuredDate
    : new Date().toISOString().slice(0, 10);
}

function createAxBuildEnv(version: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    AX_BUILD_VERSION: version,
    AX_BUILD_GIT_SHA: resolveBuildGitSha(),
    AX_BUILD_DATE: resolveBuildDate(),
  };
}

function normalizeFabroReleaseVersion(value: string | undefined): string {
  const version =
    value?.trim() ||
    process.env.ALEXANDRIA_FABRO_RELEASE_VERSION?.trim() ||
    DEFAULT_FABRO_RELEASE_VERSION;

  return version.startsWith("v") ? version.slice(1) : version;
}

function fabroReleaseAssetForPlatform(platform: string): string {
  const assetName = FABRO_RELEASE_ASSETS[platform];
  if (assetName == null) {
    throw new Error(
      `No pinned Fabro release asset mapping for platform ${platform}. Supported platforms: ${Object.keys(
        FABRO_RELEASE_ASSETS,
      )
        .sort()
        .join(", ")}`,
    );
  }
  return assetName;
}

function fabroReleaseAssetUrl(version: string, assetName: string): string {
  return `https://github.com/${FABRO_RELEASE_REPOSITORY}/releases/download/v${version}/${assetName}`;
}

function readExpectedSha256(checksumPath: string, assetName: string): string {
  const content = readFileSync(checksumPath, "utf8").trim();
  const [checksum, checksumAssetName] = content.split(/\s+/);
  if (checksum == null || !/^[a-fA-F0-9]{64}$/.test(checksum)) {
    throw new Error(`Invalid SHA-256 checksum file for Fabro asset: ${checksumPath}`);
  }
  if (checksumAssetName != null && checksumAssetName !== assetName) {
    throw new Error(
      `Fabro checksum asset mismatch: expected ${assetName}, got ${checksumAssetName}`,
    );
  }
  return checksum.toLowerCase();
}

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function downloadFabroReleaseArchive(options: {
  commandRunner: CommandRunner;
  platform: string;
  stagingDir: string;
  version: string;
}): string {
  const assetName = fabroReleaseAssetForPlatform(options.platform);
  const assetDir = join(
    options.stagingDir,
    "fabro-release",
    `v${options.version}`,
    options.platform,
  );
  const archivePath = join(assetDir, assetName);
  const checksumPath = `${archivePath}.sha256`;

  const assetUrl = fabroReleaseAssetUrl(options.version, assetName);
  downloadFile({
    commandRunner: options.commandRunner,
    outputPath: archivePath,
    url: assetUrl,
  });
  downloadFile({
    commandRunner: options.commandRunner,
    outputPath: checksumPath,
    url: `${assetUrl}.sha256`,
  });

  const expectedSha256 = readExpectedSha256(checksumPath, assetName);
  const actualSha256 = sha256File(archivePath);
  if (actualSha256 !== expectedSha256) {
    throw new Error(
      `Fabro release asset checksum mismatch for ${assetName}: expected ${expectedSha256}, got ${actualSha256}`,
    );
  }

  return archivePath;
}

function extractFabroReleaseBinary(options: {
  archivePath: string;
  commandRunner: CommandRunner;
  stagingDir: string;
}): string {
  const extractDir = join(options.stagingDir, "fabro-release-extract");
  cleanDirectory(extractDir);
  options.commandRunner(["tar", "-xzf", options.archivePath, "-C", extractDir], INTERNAL_ROOT);

  const archiveRoot = basename(options.archivePath).replace(/\.tar\.gz$/, "");
  const binaryPath = join(extractDir, archiveRoot, "fabro");
  if (!existsSync(binaryPath)) {
    throw new Error(`Expected Fabro binary in upstream release archive at ${binaryPath}`);
  }
  return binaryPath;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function writeScopedMarketplaceManifest(options: {
  marketplacePath: string;
  outputPath: string;
  selectedPluginName: string;
}): void {
  const manifest = JSON.parse(readFileSync(options.marketplacePath, "utf8")) as Record<
    string,
    unknown
  >;
  const plugins = manifest.plugins;
  if (!Array.isArray(plugins)) {
    throw new Error(`Missing plugins array in ${options.marketplacePath}`);
  }

  const selectedPlugin = plugins.find(
    (plugin): plugin is Record<string, unknown> =>
      isJsonObject(plugin) && plugin.name === options.selectedPluginName,
  );
  if (selectedPlugin == null) {
    throw new Error(`Missing plugin ${options.selectedPluginName} in ${options.marketplacePath}`);
  }

  const pluginMetadata = { ...selectedPlugin };
  delete pluginMetadata.path;
  delete pluginMetadata.source;
  mkdirSync(dirname(options.outputPath), { recursive: true });
  writeFileSync(
    options.outputPath,
    `${JSON.stringify(
      {
        ...manifest,
        plugins: [{ ...pluginMetadata, source: "./" }],
      },
      null,
      2,
    )}\n`,
  );
}

function writeScopedCodexMarketplaceManifest(options: {
  marketplacePath: string;
  outputPath: string;
  selectedPluginName: string;
}): void {
  const manifest = JSON.parse(readFileSync(options.marketplacePath, "utf8")) as Record<
    string,
    unknown
  >;
  const plugins = manifest.plugins;
  if (!Array.isArray(plugins)) {
    throw new Error(`Missing plugins array in ${options.marketplacePath}`);
  }

  const selectedPlugin = plugins.find(
    (plugin): plugin is Record<string, unknown> =>
      isJsonObject(plugin) && plugin.name === options.selectedPluginName,
  );
  if (selectedPlugin == null) {
    throw new Error(`Missing plugin ${options.selectedPluginName} in ${options.marketplacePath}`);
  }

  const pluginMetadata = { ...selectedPlugin };
  delete pluginMetadata.path;
  delete pluginMetadata.source;
  mkdirSync(dirname(options.outputPath), { recursive: true });
  writeFileSync(
    options.outputPath,
    `${JSON.stringify(
      {
        ...manifest,
        plugins: [
          {
            ...pluginMetadata,
            source: {
              source: "local",
              path: "./",
            },
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
}

function buildPluginArchive(options: {
  publicRepoDir: string;
  stagingDir: string;
  downloadsDir: string;
  version: string;
  commandRunner: CommandRunner;
}): void {
  const archiveRoot = `${PLUGIN_ARCHIVE_PREFIX}-v${options.version}`;
  const pluginStageRoot = join(options.stagingDir, archiveRoot);

  copyTree(join(options.publicRepoDir, PUBLIC_PLUGIN_DIR), pluginStageRoot);
  writeScopedMarketplaceManifest({
    marketplacePath: join(options.publicRepoDir, ".claude-plugin", "marketplace.json"),
    outputPath: join(pluginStageRoot, ".claude-plugin", "marketplace.json"),
    selectedPluginName: PUBLIC_PLUGIN_DIR,
  });
  writeScopedCodexMarketplaceManifest({
    marketplacePath: join(options.publicRepoDir, ".agents", "plugins", "marketplace.json"),
    outputPath: join(pluginStageRoot, ".agents", "plugins", "marketplace.json"),
    selectedPluginName: PUBLIC_PLUGIN_DIR,
  });

  options.commandRunner(
    [
      "tar",
      "-czf",
      join(options.downloadsDir, `${archiveRoot}.tar.gz`),
      "-C",
      options.stagingDir,
      archiveRoot,
    ],
    INTERNAL_ROOT,
  );
}

function buildBinaryArchive(options: {
  version: string;
  platform: string;
  stagingDir: string;
  downloadsDir: string;
  commandRunner: CommandRunner;
}): void {
  const binaryPath = join(options.stagingDir, CLI_BINARY_NAME);
  const buildCommand = [
    "bun",
    "build",
    "--compile",
    "--env=AX_BUILD_*",
    "--outfile",
    binaryPath,
    CLI_ENTRYPOINT,
  ];

  options.commandRunner(buildCommand, INTERNAL_ROOT, createAxBuildEnv(options.version));

  const binaryStageDir = join(options.stagingDir, `${CLI_BINARY_NAME}-${options.platform}`);
  mkdirSync(binaryStageDir, { recursive: true });
  cpSync(binaryPath, join(binaryStageDir, CLI_BINARY_NAME));

  options.commandRunner(["pnpm", "--filter", "@alexandria/viewer", "build"], INTERNAL_ROOT);
  const viewerDist = join(INTERNAL_ROOT, "packages", "viewer", "dist");
  if (!existsSync(join(viewerDist, "index.html"))) {
    throw new Error(`Expected built viewer assets at ${viewerDist}`);
  }
  copyTree(viewerDist, join(binaryStageDir, "dist", "viewer"));

  options.commandRunner(
    [
      "tar",
      "-czf",
      join(
        options.downloadsDir,
        `${CLI_BINARY_NAME}-v${options.version}-${options.platform}.tar.gz`,
      ),
      "-C",
      binaryStageDir,
      CLI_BINARY_NAME,
      "dist",
    ],
    INTERNAL_ROOT,
  );
}

function buildFabroArchive(options: {
  fabroBinary?: string;
  fabroReleaseVersion?: string;
  version: string;
  platform: string;
  stagingDir: string;
  downloadsDir: string;
  commandRunner: CommandRunner;
}): void {
  const configuredFabro = options.fabroBinary?.trim() || process.env.ALEXANDRIA_FABRO_BIN?.trim();
  const releaseVersion = normalizeFabroReleaseVersion(options.fabroReleaseVersion);
  const fabroBinary =
    configuredFabro && configuredFabro.length > 0
      ? resolve(configuredFabro)
      : extractFabroReleaseBinary({
          archivePath: downloadFabroReleaseArchive({
            commandRunner: options.commandRunner,
            platform: options.platform,
            stagingDir: options.stagingDir,
            version: releaseVersion,
          }),
          commandRunner: options.commandRunner,
          stagingDir: options.stagingDir,
        });

  if (!existsSync(fabroBinary)) {
    throw new Error(`Expected Fabro binary at ${fabroBinary}`);
  }

  const binaryStageDir = join(options.stagingDir, `fabro-${options.platform}`);
  mkdirSync(binaryStageDir, { recursive: true });
  cpSync(fabroBinary, join(binaryStageDir, "fabro"));
  options.commandRunner(
    [
      "tar",
      "-czf",
      join(options.downloadsDir, `fabro-v${options.version}-${options.platform}.tar.gz`),
      "-C",
      binaryStageDir,
      "fabro",
    ],
    INTERNAL_ROOT,
  );
}

function writeInstallerScript(outputDir: string): void {
  const source = readFileSync(join(INTERNAL_ROOT, "install.sh"), "utf8");
  const stamp = [
    'if [ -z "$ALEXANDRIA_INSTALLER_REVISION" ]; then',
    `\tALEXANDRIA_INSTALLER_REVISION="${resolveBuildGitSha()}"`,
    "fi",
  ].join("\n");
  writeFileSync(join(outputDir, "install.sh"), source.replace(INSTALLER_REVISION_STAMP, stamp));
}

export function buildReleaseAssets(options: BuildReleaseAssetsOptions = {}): void {
  assertCanonicalTarget(options.target ?? process.env.ALEXANDRIA_RELEASE_TARGET);

  const publicRepoDir = resolve(
    options.publicRepoDir ?? process.env.ALEXANDRIA_PUBLIC_REPO_DIR ?? DEFAULT_PUBLIC_REPO_DIR,
  );
  const outputDir = resolve(
    options.outputDir ?? process.env.ALEXANDRIA_RELEASE_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR,
  );
  const platform = options.platform ?? process.env.ALEXANDRIA_RELEASE_PLATFORM ?? detectPlatform();
  const commandRunner = options.commandRunner ?? runCommand;

  if (!existsSync(join(publicRepoDir, ".git"))) {
    throw new Error(`Expected public repo checkout at ${publicRepoDir}`);
  }

  const version = readPluginVersion(join(publicRepoDir, PUBLIC_PLUGIN_DIR));

  const stagingDir = join(outputDir, "staging");
  const downloadsDir = join(outputDir, "downloads");
  cleanDirectory(outputDir);
  mkdirSync(stagingDir, { recursive: true });
  mkdirSync(downloadsDir, { recursive: true });

  buildPluginArchive({
    publicRepoDir,
    stagingDir,
    downloadsDir,
    version,
    commandRunner,
  });

  buildBinaryArchive({
    version,
    platform,
    stagingDir,
    downloadsDir,
    commandRunner,
  });

  buildFabroArchive({
    version,
    platform,
    stagingDir,
    downloadsDir,
    ...(options.fabroBinary == null ? {} : { fabroBinary: options.fabroBinary }),
    ...(options.fabroReleaseVersion == null
      ? {}
      : { fabroReleaseVersion: options.fabroReleaseVersion }),
    commandRunner,
  });

  writeInstallerScript(outputDir);
  writeFileSync(join(downloadsDir, "latest-version.txt"), `${version}\n`);

  const logger = options.logger ?? console;
  logger.log(`Built Alexandria release assets in ${outputDir}`);
}

if (import.meta.main) {
  buildReleaseAssets();
}
