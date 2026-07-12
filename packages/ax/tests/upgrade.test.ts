import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Buffer } from "buffer";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { gzipSync } from "zlib";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const axBin = resolve(packageRoot, "src/cli/main.ts");

let testHome = "";
let testProject = "";
let testDownloads = "";

function resolveTestPlatform(): string {
  const os = process.platform === "darwin" ? "darwin" : "linux";
  const arch = process.arch === "x64" ? "x64" : process.arch === "arm64" ? "arm64" : process.arch;

  if (!["linux", "darwin"].includes(os)) {
    throw new Error(`Unsupported test platform: ${process.platform}`);
  }

  if (!["x64", "arm64"].includes(arch)) {
    throw new Error(`Unsupported test architecture: ${process.arch}`);
  }

  return `${os}-${arch}`;
}

function writeExecutable(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  chmodSync(path, 0o755);
}

function runTar(command: string[]): void {
  const proc = Bun.spawnSync(command, {
    stdout: "pipe",
    stderr: "pipe",
  });

  if ((proc.exitCode ?? 1) !== 0) {
    throw new Error(proc.stderr.toString());
  }
}

function buildPluginTarball(version: string): void {
  const stagingDir = mkdtempSync(join(tmpdir(), "ax-upgrade-plugin-"));
  const payloadRoot = join(stagingDir, `alexandria-plugin-v${version}`);
  mkdirSync(join(payloadRoot, ".claude-plugin"), { recursive: true });
  mkdirSync(join(payloadRoot, "skills", "ax-start"), {
    recursive: true,
  });
  mkdirSync(join(payloadRoot, "workflows", "source-assessment"), {
    recursive: true,
  });
  writeFileSync(join(payloadRoot, "VERSION"), `${version}\n`);
  writeFileSync(join(payloadRoot, "README.md"), "Alexandria\n");
  writeFileSync(join(payloadRoot, "LICENSE"), "MIT\n");
  writeFileSync(join(payloadRoot, "UPGRADED"), "new payload\n");
  writeFileSync(join(payloadRoot, "skills", "ax-start", "SKILL.md"), "# Start Alexandria\n");
  writeFileSync(
    join(payloadRoot, "workflows", "source-assessment", "workflow.fabro"),
    "root workflow\n",
  );
  writeFileSync(
    join(payloadRoot, ".claude-plugin", "plugin.json"),
    JSON.stringify({ name: "alexandria", version }, null, 2),
  );
  writeFileSync(
    join(payloadRoot, ".claude-plugin", "marketplace.json"),
    JSON.stringify(
      {
        name: "alexandria",
        plugins: [{ name: "alexandria", source: "./" }],
      },
      null,
      2,
    ),
  );

  try {
    runTar([
      "tar",
      "-czf",
      join(testDownloads, `alexandria-plugin-v${version}.tar.gz`),
      "-C",
      stagingDir,
      `alexandria-plugin-v${version}`,
    ]);
  } finally {
    rmSync(stagingDir, { recursive: true, force: true });
  }
}

function tarEntry(
  name: string,
  content: Buffer,
  options: { linkName?: string; typeFlag?: string } = {},
): Buffer {
  const header = Buffer.alloc(512);
  header.write(name, 0, 100, "utf8");
  header.write("0000644\0", 100, 8, "ascii");
  header.write("0000000\0", 108, 8, "ascii");
  header.write("0000000\0", 116, 8, "ascii");
  header.write(`${content.length.toString(8).padStart(11, "0")}\0`, 124, 12, "ascii");
  header.write("00000000000\0", 136, 12, "ascii");
  header.fill(0x20, 148, 156);
  header.write(options.typeFlag ?? "0", 156, 1, "ascii");
  if (options.linkName != null) {
    header.write(options.linkName, 157, 100, "utf8");
  }
  header.write("ustar\0", 257, 6, "ascii");
  header.write("00", 263, 2, "ascii");

  const checksum = header.reduce((total, byte) => total + byte, 0);
  header.write(checksum.toString(8).padStart(6, "0"), 148, 6, "ascii");
  header.write("\0 ", 154, 2, "ascii");

  const padding = Buffer.alloc((512 - (content.length % 512)) % 512);
  return Buffer.concat([header, content, padding]);
}

function buildUnsafePluginTarball(version: string): void {
  const archive = Buffer.concat([
    tarEntry("../escape", Buffer.from("unsafe\n")),
    Buffer.alloc(1024),
  ]);
  writeFileSync(join(testDownloads, `alexandria-plugin-v${version}.tar.gz`), gzipSync(archive));
}

function buildSymlinkPluginTarball(version: string): void {
  const archive = Buffer.concat([
    tarEntry(`alexandria-plugin-v${version}/safe-link`, Buffer.alloc(0), {
      linkName: "../../../escape",
      typeFlag: "2",
    }),
    Buffer.alloc(1024),
  ]);
  writeFileSync(join(testDownloads, `alexandria-plugin-v${version}.tar.gz`), gzipSync(archive));
}

function buildAxTarball(version: string): void {
  const stagingDir = mkdtempSync(join(tmpdir(), "ax-upgrade-binary-"));
  writeExecutable(join(stagingDir, "ax"), "#!/bin/sh\necho upgraded ax\n");
  mkdirSync(join(stagingDir, "dist", "viewer"), { recursive: true });
  writeFileSync(join(stagingDir, "dist", "viewer", "index.html"), "viewer\n");

  try {
    runTar([
      "tar",
      "-czf",
      join(testDownloads, `ax-v${version}-${resolveTestPlatform()}.tar.gz`),
      "-C",
      stagingDir,
      "ax",
      "dist",
    ]);
  } finally {
    rmSync(stagingDir, { recursive: true, force: true });
  }
}

function buildFabroTarball(version: string): void {
  const stagingDir = mkdtempSync(join(tmpdir(), "ax-upgrade-fabro-"));
  writeExecutable(join(stagingDir, "fabro"), "#!/bin/sh\necho upgraded fabro\n");

  try {
    runTar([
      "tar",
      "-czf",
      join(testDownloads, `fabro-v${version}-${resolveTestPlatform()}.tar.gz`),
      "-C",
      stagingDir,
      "fabro",
    ]);
  } finally {
    rmSync(stagingDir, { recursive: true, force: true });
  }
}

function buildCorruptAxTarball(version: string): void {
  writeFileSync(
    join(testDownloads, `ax-v${version}-${resolveTestPlatform()}.tar.gz`),
    "not a gzip tarball\n",
  );
}

function runAx(
  args: string[],
  env: Record<string, string> = {},
): { exitCode: number | null; stdout: string; stderr: string } {
  const result = Bun.spawnSync({
    cmd: ["bun", axBin, ...args],
    cwd: testProject,
    env: {
      ...process.env,
      HOME: testHome,
      PATH: `${join(testHome, "bin")}:${process.env.PATH ?? ""}`,
      ...env,
    },
    stdout: "pipe",
    stderr: "pipe",
  });

  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

beforeEach(() => {
  testHome = mkdtempSync(join(tmpdir(), "ax-upgrade-home-"));
  testProject = mkdtempSync(join(tmpdir(), "ax-upgrade-project-"));
  testDownloads = mkdtempSync(join(tmpdir(), "ax-upgrade-downloads-"));
  mkdirSync(join(testHome, "bin"), { recursive: true });

  const init = Bun.spawnSync(["git", "init"], {
    cwd: testProject,
    stdout: "pipe",
    stderr: "pipe",
  });
  if ((init.exitCode ?? 1) !== 0) {
    throw new Error(init.stderr.toString());
  }
});

afterEach(() => {
  for (const dir of [testHome, testProject, testDownloads]) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("ax upgrade", () => {
  test("prints an upgrade dry run without changing files", () => {
    const result = runAx(["upgrade", "--dry-run", "--version", "1.0.0"], {
      ALEXANDRIA_AX_INSTALL_DIR: join(testHome, "ax-bin"),
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Alexandria upgrade plan:");
    expect(result.stdout).toContain("Target:       1.0.0");
    expect(result.stdout).toContain("Fabro:");
    expect(result.stdout).toContain(join(realpathSync(testProject), ".claude/plugins/alexandria"));
  });

  test("reinstalls latest plugin payload and ax binary even when version is unchanged", () => {
    const version = "1.0.0";
    const pluginTarget = join(realpathSync(testProject), ".claude", "plugins", "alexandria");
    const axInstallDir = join(testHome, "ax-bin");
    const axTarget = join(axInstallDir, "ax");
    const fabroTarget = join(axInstallDir, "fabro");
    const claudeLog = join(testHome, "claude.log");
    mkdirSync(pluginTarget, { recursive: true });
    writeFileSync(join(pluginTarget, "VERSION"), `${version}\n`);
    writeFileSync(join(pluginTarget, "OLD"), "old payload\n");
    writeExecutable(axTarget, "#!/bin/sh\necho old ax\n");
    writeExecutable(fabroTarget, "#!/bin/sh\necho old fabro\n");
    writeExecutable(
      join(testHome, "bin", "claude"),
      `#!/bin/sh
echo "$@" >> "${claudeLog}"
exit 0
`,
    );
    writeFileSync(join(testDownloads, "latest-version.txt"), `${version}\n`);
    buildPluginTarball(version);
    buildFabroTarball(version);
    buildAxTarball(version);

    const result = runAx(["upgrade"], {
      ALEXANDRIA_AX_INSTALL_DIR: axInstallDir,
      ALEXANDRIA_DOWNLOADS_URL: `file://${testDownloads}`,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Alexandria upgrade complete.");
    expect(result.stdout).toContain("Current:      1.0.0");
    expect(result.stdout).toContain("Target:       1.0.0");
    expect(readFileSync(join(pluginTarget, "UPGRADED"), "utf8")).toBe("new payload\n");
    expect(readFileSync(join(pluginTarget, ".claude-plugin", "plugin.json"), "utf8")).toContain(
      `"version": "${version}"`,
    );
    expect(
      readFileSync(join(pluginTarget, ".claude-plugin", "marketplace.json"), "utf8"),
    ).toContain(`"source": "./"`);
    expect(readFileSync(join(pluginTarget, "skills", "ax-start", "SKILL.md"), "utf8")).toContain(
      "Start Alexandria",
    );
    expect(
      readFileSync(join(pluginTarget, "workflows", "source-assessment", "workflow.fabro"), "utf8"),
    ).toBe("root workflow\n");
    expect(existsSync(join(pluginTarget, "OLD"))).toBeFalse();
    expect(readFileSync(axTarget, "utf8")).toContain("upgraded ax");
    expect(readFileSync(fabroTarget, "utf8")).toContain("upgraded fabro");
    expect(readFileSync(join(axInstallDir, "dist", "viewer", "index.html"), "utf8")).toBe(
      "viewer\n",
    );
    expect(existsSync(join(pluginTarget, ".github"))).toBeFalse();
    expect(existsSync(join(pluginTarget, "alexandria"))).toBeFalse();
    expect(existsSync(join(pluginTarget, "install.sh"))).toBeFalse();
    expect(existsSync(join(pluginTarget, "install-next.sh"))).toBeFalse();

    const claudeCalls = readFileSync(claudeLog, "utf8");
    expect(claudeCalls).toContain(`plugin marketplace add ${pluginTarget} --scope project`);
    expect(claudeCalls).toContain("plugin install alexandria@alexandria --scope project");
  });

  test("rejects unsafe plugin archive entries before replacing the current plugin", () => {
    const version = "1.0.0";
    const pluginTarget = join(realpathSync(testProject), ".claude", "plugins", "alexandria");
    const axInstallDir = join(testHome, "ax-bin");
    mkdirSync(pluginTarget, { recursive: true });
    writeFileSync(join(pluginTarget, "VERSION"), `${version}\n`);
    writeFileSync(join(pluginTarget, "OLD"), "old payload\n");
    writeFileSync(join(testDownloads, "latest-version.txt"), `${version}\n`);
    buildUnsafePluginTarball(version);
    buildAxTarball(version);

    const result = runAx(["upgrade"], {
      ALEXANDRIA_AX_INSTALL_DIR: axInstallDir,
      ALEXANDRIA_DOWNLOADS_URL: `file://${testDownloads}`,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("unsafe archive entry: ../escape");
    expect(readFileSync(join(pluginTarget, "VERSION"), "utf8")).toBe(`${version}\n`);
    expect(readFileSync(join(pluginTarget, "OLD"), "utf8")).toBe("old payload\n");
  });

  test("rejects archive symlinks before extraction", () => {
    const version = "1.0.0";
    const pluginTarget = join(realpathSync(testProject), ".claude", "plugins", "alexandria");
    mkdirSync(pluginTarget, { recursive: true });
    writeFileSync(join(pluginTarget, "VERSION"), `${version}\n`);
    writeFileSync(join(pluginTarget, "OLD"), "old payload\n");
    writeFileSync(join(testDownloads, "latest-version.txt"), `${version}\n`);
    buildSymlinkPluginTarball(version);
    buildAxTarball(version);

    const result = runAx(["upgrade"], {
      ALEXANDRIA_AX_INSTALL_DIR: join(testHome, "ax-bin"),
      ALEXANDRIA_DOWNLOADS_URL: `file://${testDownloads}`,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("unsupported tar entry type 2");
    expect(readFileSync(join(pluginTarget, "OLD"), "utf8")).toBe("old payload\n");
  });

  test("reports partial upgrade when plugin install succeeds but ax binary install fails", () => {
    const currentVersion = "1.0.0";
    const targetVersion = "1.0.1";
    const pluginTarget = join(realpathSync(testProject), ".claude", "plugins", "alexandria");
    const axInstallDir = join(testHome, "ax-bin");
    const axTarget = join(axInstallDir, "ax");
    mkdirSync(pluginTarget, { recursive: true });
    writeFileSync(join(pluginTarget, "VERSION"), `${currentVersion}\n`);
    writeFileSync(join(pluginTarget, "OLD"), "old payload\n");
    writeExecutable(axTarget, "#!/bin/sh\necho old ax\n");
    writeFileSync(join(testDownloads, "latest-version.txt"), `${targetVersion}\n`);
    buildPluginTarball(targetVersion);
    buildFabroTarball(targetVersion);
    buildCorruptAxTarball(targetVersion);

    const result = runAx(["upgrade"], {
      ALEXANDRIA_AX_INSTALL_DIR: axInstallDir,
      ALEXANDRIA_DOWNLOADS_URL: `file://${testDownloads}`,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Partial upgrade");
    expect(result.stderr).toContain(targetVersion);
    expect(result.stderr).toContain(pluginTarget);
    expect(readFileSync(join(pluginTarget, "UPGRADED"), "utf8")).toBe("new payload\n");
    expect(existsSync(join(pluginTarget, "OLD"))).toBeFalse();
    expect(readFileSync(axTarget, "utf8")).toContain("old ax");
  });

  test("reports manual registration when Claude plugin registration fails", () => {
    const version = "1.0.0";
    const axInstallDir = join(testHome, "ax-bin");
    writeFileSync(join(testDownloads, "latest-version.txt"), `${version}\n`);
    buildPluginTarball(version);
    buildFabroTarball(version);
    buildAxTarball(version);
    writeExecutable(join(testHome, "bin", "claude"), "#!/bin/sh\nexit 1\n");

    const result = runAx(["upgrade"], {
      ALEXANDRIA_AX_INSTALL_DIR: axInstallDir,
      ALEXANDRIA_DOWNLOADS_URL: `file://${testDownloads}`,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Alexandria upgrade complete.");
    expect(result.stdout).toContain(
      "Claude marketplace registration failed; payloads were still installed.",
    );
    expect(result.stdout).toContain("Run manually: claude plugin install");
  });

  test("rejects removed update alias", () => {
    const result = runAx(["update", "--dry-run", "--version", "1.0.0"], {
      ALEXANDRIA_AX_INSTALL_DIR: join(testHome, "ax-bin"),
    });

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unknown subcommand: update");
  });
});
