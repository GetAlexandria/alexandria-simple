import { afterEach, describe, expect, test } from "bun:test";
import {
  cpSync,
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { createHash } from "crypto";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { buildReleaseAssets } from "./build-release-assets.ts";

const INTERNAL_ROOT = resolve(import.meta.dir, "../../..");
const tempDirs: string[] = [];

function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function writeFile(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function writeExecutable(path: string, contents: string): void {
  writeFile(path, contents);
  chmodSync(path, 0o755);
}

function runTar(command: string[], cwd?: string): void {
  const proc = Bun.spawnSync(command, {
    ...(cwd == null ? {} : { cwd }),
    stdout: "pipe",
    stderr: "pipe",
  });

  if ((proc.exitCode ?? 1) !== 0) {
    throw new Error(new TextDecoder().decode(proc.stderr));
  }
}

function listTarEntries(archivePath: string): string[] {
  const proc = Bun.spawnSync(["tar", "-tzf", archivePath], {
    stdout: "pipe",
    stderr: "pipe",
  });

  if ((proc.exitCode ?? 1) !== 0) {
    throw new Error(new TextDecoder().decode(proc.stderr));
  }

  return new TextDecoder().decode(proc.stdout).split("\n").filter(Boolean);
}

function readTarEntry(archivePath: string, entryPath: string): string {
  const proc = Bun.spawnSync(["tar", "-xOzf", archivePath, entryPath], {
    stdout: "pipe",
    stderr: "pipe",
  });

  if ((proc.exitCode ?? 1) !== 0) {
    throw new Error(new TextDecoder().decode(proc.stderr));
  }

  return new TextDecoder().decode(proc.stdout);
}

function hasEntryAtOrUnder(entries: string[], entryPath: string): boolean {
  return entries.some((entry) => entry === entryPath || entry.startsWith(`${entryPath}/`));
}

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
  rmSync(join(INTERNAL_ROOT, "packages", "viewer", "dist"), {
    recursive: true,
    force: true,
  });
});

describe("buildReleaseAssets", () => {
  function preparePublicRepo(publicRepoDir: string): void {
    mkdirSync(join(publicRepoDir, ".git"), { recursive: true });
    writeFile(join(publicRepoDir, "install.sh"), "#!/bin/sh\n");
    writeFile(
      join(publicRepoDir, ".claude-plugin", "marketplace.json"),
      JSON.stringify({
        name: "alexandria",
        plugins: [
          {
            name: "alexandria",
            description: "Alexandria",
            source: "./alexandria",
            category: "development",
          },
        ],
      }),
    );
    writeFile(
      join(publicRepoDir, ".agents", "plugins", "marketplace.json"),
      JSON.stringify({
        name: "alexandria",
        interface: {
          displayName: "Alexandria",
        },
        plugins: [
          {
            name: "alexandria",
            source: {
              source: "local",
              path: "./alexandria",
            },
            policy: {
              installation: "AVAILABLE",
              authentication: "ON_INSTALL",
            },
            category: "Coding",
          },
        ],
      }),
    );

    writeFile(join(publicRepoDir, "alexandria", "VERSION"), "0.12.0\n");
    writeFile(
      join(publicRepoDir, "alexandria", ".claude-plugin", "plugin.json"),
      JSON.stringify({ name: "alexandria", version: "0.12.0" }),
    );
    writeFile(
      join(publicRepoDir, "alexandria", ".codex-plugin", "plugin.json"),
      JSON.stringify({ name: "alexandria", version: "0.12.0" }),
    );
    writeFile(join(publicRepoDir, "alexandria", "README.md"), "plugin\n");
    writeFile(join(publicRepoDir, "alexandria", "LICENSE"), "license\n");
    writeFile(join(publicRepoDir, "alexandria", "agents", "openai.yaml"), "interface: {}\n");
    writeFile(join(publicRepoDir, "alexandria", "agents", "damien.md"), "agent\n");
    writeFile(join(publicRepoDir, "alexandria", "agents", "raven.md"), "agent\n");
    writeFile(
      join(publicRepoDir, "alexandria", "agents", "raven-resources", "library-model.md"),
      "resource\n",
    );
    writeFile(join(publicRepoDir, "alexandria", "skills", "ax-start", "SKILL.md"), "skill\n");
    writeFile(
      join(publicRepoDir, "alexandria", "workflows", "source-assessment", "workflow.fabro"),
      "workflow\n",
    );
  }

  function buildForTest(
    publicRepoDir: string,
    outputDir: string,
    target?: string,
  ): { buildEnvSnapshots: NodeJS.ProcessEnv[]; commands: string[][] } {
    const commands: string[][] = [];
    const buildEnvSnapshots: NodeJS.ProcessEnv[] = [];
    const fabroBinary = join(publicRepoDir, "fake-fabro");
    writeExecutable(fabroBinary, "#!/bin/sh\necho fake fabro\n");

    buildReleaseAssets({
      fabroBinary,
      publicRepoDir,
      outputDir,
      ...(target == null ? {} : { target }),
      platform: "linux-x64",
      commandRunner(command, cwd, env) {
        commands.push([...command]);

        if (command[0] === "bun" && command[1] === "build") {
          buildEnvSnapshots.push({ ...(env ?? {}) });
          const outfileIndex = command.indexOf("--outfile");
          const outfile = command[outfileIndex + 1];
          if (!outfile) {
            throw new Error("missing --outfile");
          }

          writeExecutable(outfile, "#!/bin/sh\necho fake cli\n");
          return;
        }

        if (
          command[0] === "pnpm" &&
          command.includes("@alexandria/viewer") &&
          command.includes("build")
        ) {
          writeFile(join(INTERNAL_ROOT, "packages", "viewer", "dist", "index.html"), "viewer\n");
          return;
        }

        if (command[0] === "tar") {
          runTar(command, cwd);
          return;
        }

        throw new Error(`unexpected command: ${command.join(" ")}`);
      },
      logger: { log() {} },
    });

    return { buildEnvSnapshots, commands };
  }

  function createUpstreamFabroArchive(root: string, assetName: string): string {
    const archiveRoot = assetName.replace(/\.tar\.gz$/, "");
    const sourceDir = join(root, "upstream-fabro");
    const archivePath = join(root, assetName);
    writeExecutable(join(sourceDir, archiveRoot, "fabro"), "#!/bin/sh\necho upstream fabro\n");
    runTar(["tar", "-czf", archivePath, "-C", sourceDir, archiveRoot]);
    return archivePath;
  }

  function buildWithDownloadedFabro(options: {
    checksum?: string;
    fabroReleaseVersion?: string;
    outputDir: string;
    publicRepoDir: string;
  }): { commands: string[][] } {
    const commands: string[][] = [];
    const assetName = "fabro-x86_64-unknown-linux-gnu.tar.gz";
    const upstreamArchive = createUpstreamFabroArchive(options.publicRepoDir, assetName);
    const checksum = options.checksum ?? sha256File(upstreamArchive);

    buildReleaseAssets({
      publicRepoDir: options.publicRepoDir,
      outputDir: options.outputDir,
      platform: "linux-x64",
      ...(options.fabroReleaseVersion == null
        ? {}
        : { fabroReleaseVersion: options.fabroReleaseVersion }),
      commandRunner(command, cwd) {
        commands.push([...command]);

        if (command[0] === "bun" && command[1] === "build") {
          const outfileIndex = command.indexOf("--outfile");
          const outfile = command[outfileIndex + 1];
          if (!outfile) {
            throw new Error("missing --outfile");
          }

          writeExecutable(outfile, "#!/bin/sh\necho fake cli\n");
          return;
        }

        if (
          command[0] === "pnpm" &&
          command.includes("@alexandria/viewer") &&
          command.includes("build")
        ) {
          writeFile(join(INTERNAL_ROOT, "packages", "viewer", "dist", "index.html"), "viewer\n");
          return;
        }

        if (command[0] === "curl") {
          const outputIndex = command.indexOf("--output");
          const outputPath = command[outputIndex + 1];
          const url = command[command.length - 1];
          if (outputPath == null || url == null) {
            throw new Error("malformed curl command");
          }

          if (url.endsWith(".sha256")) {
            writeFile(outputPath, `${checksum}  ${assetName}\n`);
            return;
          }

          cpSync(upstreamArchive, outputPath);
          return;
        }

        if (command[0] === "tar") {
          runTar(command, cwd);
          return;
        }

        throw new Error(`unexpected command: ${command.join(" ")}`);
      },
      logger: { log() {} },
    });

    return { commands };
  }

  test("builds canonical Alexandria plugin, ax, Fabro, installer, and latest version artifacts", () => {
    const publicRepoDir = makeTempDir("release-public-repo-");
    const outputDir = makeTempDir("release-output-");
    preparePublicRepo(publicRepoDir);
    const { buildEnvSnapshots, commands } = buildForTest(publicRepoDir, outputDir);

    expect(readFileSync(join(outputDir, "downloads", "latest-version.txt"), "utf8")).toBe(
      "0.12.0\n",
    );
    expect(existsSync(join(outputDir, "install.sh"))).toBeTrue();
    const installer = readFileSync(join(outputDir, "install.sh"), "utf8");
    expect(installer).toContain("ALEXANDRIA_INSTALLER_REVISION=");
    expect(installer).not.toContain("__ALEXANDRIA_INSTALLER_REVISION__");
    expect(installer).toContain("alexandria-cache=");

    const downloadsDir = join(outputDir, "downloads");
    const pluginArchive = join(downloadsDir, "alexandria-plugin-v0.12.0.tar.gz");
    const axArchive = join(downloadsDir, "ax-v0.12.0-linux-x64.tar.gz");
    const fabroArchive = join(downloadsDir, "fabro-v0.12.0-linux-x64.tar.gz");
    expect(existsSync(pluginArchive)).toBeTrue();
    expect(existsSync(axArchive)).toBeTrue();
    expect(existsSync(fabroArchive)).toBeTrue();

    const pluginEntries = listTarEntries(pluginArchive);
    expect(pluginEntries).toContain("alexandria-plugin-v0.12.0/.claude-plugin/plugin.json");
    expect(pluginEntries).toContain("alexandria-plugin-v0.12.0/.claude-plugin/marketplace.json");
    expect(pluginEntries).toContain("alexandria-plugin-v0.12.0/.codex-plugin/plugin.json");
    expect(pluginEntries).toContain("alexandria-plugin-v0.12.0/.agents/plugins/marketplace.json");
    expect(pluginEntries).toContain("alexandria-plugin-v0.12.0/VERSION");
    expect(pluginEntries).toContain("alexandria-plugin-v0.12.0/README.md");
    expect(pluginEntries).toContain("alexandria-plugin-v0.12.0/LICENSE");
    expect(pluginEntries).toContain("alexandria-plugin-v0.12.0/agents/openai.yaml");
    expect(pluginEntries).toContain("alexandria-plugin-v0.12.0/agents/damien.md");
    expect(pluginEntries).toContain("alexandria-plugin-v0.12.0/agents/raven.md");
    expect(pluginEntries).toContain(
      "alexandria-plugin-v0.12.0/agents/raven-resources/library-model.md",
    );
    expect(pluginEntries).toContain("alexandria-plugin-v0.12.0/skills/ax-start/SKILL.md");
    expect(pluginEntries).toContain(
      "alexandria-plugin-v0.12.0/workflows/source-assessment/workflow.fabro",
    );
    expect(hasEntryAtOrUnder(pluginEntries, "alexandria-plugin-v0.12.0/.github")).toBeFalse();
    expect(hasEntryAtOrUnder(pluginEntries, "alexandria-plugin-v0.12.0/alexandria")).toBeFalse();
    expect(pluginEntries).not.toContain("alexandria-plugin-v0.12.0/install.sh");

    const marketplace = JSON.parse(
      readTarEntry(pluginArchive, "alexandria-plugin-v0.12.0/.claude-plugin/marketplace.json"),
    );
    expect(marketplace.plugins).toEqual([
      {
        name: "alexandria",
        description: "Alexandria",
        category: "development",
        source: "./",
      },
    ]);

    const codexMarketplace = JSON.parse(
      readTarEntry(pluginArchive, "alexandria-plugin-v0.12.0/.agents/plugins/marketplace.json"),
    );
    expect(codexMarketplace).toEqual({
      name: "alexandria",
      interface: {
        displayName: "Alexandria",
      },
      plugins: [
        {
          name: "alexandria",
          source: {
            source: "local",
            path: "./",
          },
          policy: {
            installation: "AVAILABLE",
            authentication: "ON_INSTALL",
          },
          category: "Coding",
        },
      ],
    });

    expect(listTarEntries(axArchive)).toContain("ax");
    expect(listTarEntries(axArchive)).toContain("dist/viewer/index.html");
    expect(listTarEntries(fabroArchive)).toContain("fabro");

    const buildCommand = commands.find((command) => command[0] === "bun");
    expect(buildCommand).toBeDefined();
    expect(commands.some((command) => command[0] === "cargo")).toBeFalse();
    expect(buildCommand ?? []).toContain("--env=AX_BUILD_*");
    expect(buildEnvSnapshots[0]?.AX_BUILD_VERSION).toBe("0.12.0");
    expect(buildEnvSnapshots[0]?.AX_BUILD_GIT_SHA).toMatch(/^[a-f0-9]{7}$/);
    expect(buildEnvSnapshots[0]?.AX_BUILD_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(installer).toContain(buildEnvSnapshots[0]?.AX_BUILD_GIT_SHA ?? "");
  });

  test("downloads the pinned upstream Fabro release asset and repackages it", () => {
    const publicRepoDir = makeTempDir("release-public-repo-");
    const outputDir = makeTempDir("release-output-");
    preparePublicRepo(publicRepoDir);
    const { commands } = buildWithDownloadedFabro({ publicRepoDir, outputDir });

    const curlCommands = commands.filter((command) => command[0] === "curl");
    expect(curlCommands).toHaveLength(2);
    expect(curlCommands[0]).toContain(
      "https://github.com/fabro-sh/fabro/releases/download/v0.267.0-nightly.0/fabro-x86_64-unknown-linux-gnu.tar.gz",
    );
    expect(curlCommands[1]).toContain(
      "https://github.com/fabro-sh/fabro/releases/download/v0.267.0-nightly.0/fabro-x86_64-unknown-linux-gnu.tar.gz.sha256",
    );
    expect(commands.some((command) => command[0] === "cargo")).toBeFalse();

    const fabroArchive = join(outputDir, "downloads", "fabro-v0.12.0-linux-x64.tar.gz");
    expect(listTarEntries(fabroArchive)).toContain("fabro");
    expect(readTarEntry(fabroArchive, "fabro")).toContain("upstream fabro");
  });

  test("rejects upstream Fabro release assets with mismatched checksums", () => {
    const publicRepoDir = makeTempDir("release-public-repo-");
    const outputDir = makeTempDir("release-output-");
    preparePublicRepo(publicRepoDir);

    expect(() =>
      buildWithDownloadedFabro({
        checksum: "0".repeat(64),
        publicRepoDir,
        outputDir,
      }),
    ).toThrow("Fabro release asset checksum mismatch");
  });

  test("rejects the removed Alexandria Next release target", () => {
    const publicRepoDir = makeTempDir("release-public-repo-");
    const outputDir = makeTempDir("release-output-");
    preparePublicRepo(publicRepoDir);

    expect(() => buildForTest(publicRepoDir, outputDir, "alexandria-next")).toThrow(
      "Unsupported release target: alexandria-next",
    );
  });
});
