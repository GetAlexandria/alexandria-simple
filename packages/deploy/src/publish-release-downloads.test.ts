import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { publishReleaseDownloads } from "./publish-release-downloads.ts";

const tempDirs: string[] = [];

function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("publishReleaseDownloads", () => {
  function writeReleaseFiles(downloadsDir: string, version = "0.12.0"): void {
    mkdirSync(downloadsDir, { recursive: true });
    writeFileSync(join(downloadsDir, "latest-version.txt"), `${version}\n`);
    writeFileSync(join(downloadsDir, `alexandria-plugin-v${version}.tar.gz`), "plugin");
    writeFileSync(join(downloadsDir, `ax-v${version}-linux-x64.tar.gz`), "ax");
    writeFileSync(join(downloadsDir, `fabro-v${version}-linux-x64.tar.gz`), "fabro");
  }

  test("uploads Alexandria release tarballs and latest-version.txt to R2", () => {
    const outputDir = makeTempDir("publish-release-downloads-");
    const downloadsDir = join(outputDir, "downloads");
    writeReleaseFiles(downloadsDir);
    writeFileSync(join(downloadsDir, "ignored.txt"), "ignored");

    const commands: string[][] = [];
    const envs: NodeJS.ProcessEnv[] = [];

    publishReleaseDownloads({
      outputDir,
      env: {
        ALEXANDRIA_R2_BUCKET: "alexandria-downloads",
        ALEXANDRIA_R2_ACCOUNT_ID: "account123",
        CLOUDFLARE_API_TOKEN: "token123",
      },
      commandRunner(command, env) {
        commands.push(command);
        envs.push(env);
      },
      logger: { log() {} },
    });

    expect(commands).toHaveLength(4);
    expect(
      commands.some((command) =>
        command.includes("alexandria-downloads/latest-version.txt"),
      ),
    ).toBeTrue();
    expect(
      commands.some((command) =>
        command.includes("alexandria-downloads/alexandria-plugin-v0.12.0.tar.gz"),
      ),
    ).toBeTrue();
    expect(
      commands.some((command) =>
        command.includes("alexandria-downloads/ax-v0.12.0-linux-x64.tar.gz"),
      ),
    ).toBeTrue();
    expect(
      commands.some((command) =>
        command.includes("alexandria-downloads/fabro-v0.12.0-linux-x64.tar.gz"),
      ),
    ).toBeTrue();
    expect(commands.some((command) => command.includes("ignored.txt"))).toBeFalse();

    const latestCommand = commands.find((command) =>
      command.includes("alexandria-downloads/latest-version.txt"),
    );
    expect(latestCommand).toContain("text/plain; charset=utf-8");
    expect(latestCommand).toContain("no-store, must-revalidate");
    expect(
      commands
        .filter((command) => command.some((part) => part.endsWith(".tar.gz")))
        .every((command) => command.includes("public, max-age=31536000, immutable")),
    ).toBeTrue();
    expect(envs[0]?.CLOUDFLARE_API_TOKEN).toBe("token123");
    expect(envs[0]?.CLOUDFLARE_ACCOUNT_ID).toBe("account123");
  });

  test("requires plugin, CLI, and Fabro tarballs", () => {
    const outputDir = makeTempDir("publish-release-downloads-missing-");
    const downloadsDir = join(outputDir, "downloads");
    mkdirSync(downloadsDir, { recursive: true });

    writeFileSync(join(downloadsDir, "latest-version.txt"), "0.12.0\n");
    writeFileSync(join(downloadsDir, "alexandria-plugin-v0.12.0.tar.gz"), "plugin");
    writeFileSync(join(downloadsDir, "ax-v0.12.0-linux-x64.tar.gz"), "ax");

    expect(() =>
      publishReleaseDownloads({
        outputDir,
        env: {
          ALEXANDRIA_R2_BUCKET: "alexandria-downloads",
          ALEXANDRIA_R2_ACCOUNT_ID: "account123",
          CLOUDFLARE_API_TOKEN: "token123",
        },
        commandRunner() {},
        logger: { log() {} },
      }),
    ).toThrow("Missing required release artifact: Fabro sidecar tarball");
  });

  test("rejects the removed Alexandria Next release target", () => {
    const outputDir = makeTempDir("publish-release-downloads-target-");
    writeReleaseFiles(join(outputDir, "downloads"));

    expect(() =>
      publishReleaseDownloads({
        outputDir,
        target: "alexandria-next",
        env: {
          ALEXANDRIA_R2_BUCKET: "alexandria-downloads",
          ALEXANDRIA_R2_ACCOUNT_ID: "account123",
          CLOUDFLARE_API_TOKEN: "token123",
        },
        commandRunner() {},
        logger: { log() {} },
      }),
    ).toThrow("Unsupported release target: alexandria-next");
  });

  test("release workflow consolidates Fabro sidecar tarballs", () => {
    const workflow = readFileSync(
      join(import.meta.dir, "../../../.github/workflows/release.yml"),
      "utf8",
    );
    const [, consolidateStep = ""] = workflow.split(
      "- name: Consolidate download artifacts",
    );
    const [stepBody = ""] = consolidateStep.split("- name: Install Wrangler");

    expect(stepBody).toContain("-name '*.tar.gz'");
  });

  test("dry-run mode logs uploads without requiring Cloudflare token", () => {
    const outputDir = makeTempDir("publish-release-downloads-dry-run-");
    const downloadsDir = join(outputDir, "downloads");
    writeReleaseFiles(downloadsDir);

    const logs: string[] = [];

    publishReleaseDownloads({
      outputDir,
      env: {
        ALEXANDRIA_R2_BUCKET: "alexandria-downloads",
        ALEXANDRIA_R2_ACCOUNT_ID: "account123",
        ALEXANDRIA_R2_DRY_RUN: "1",
      },
      commandRunner() {
        throw new Error("dry run should not invoke command runner");
      },
      logger: {
        log(message) {
          logs.push(message);
        },
      },
    });

    expect(logs).toHaveLength(4);
    expect(logs.every((log) => log.includes("[dry-run]"))).toBeTrue();
    expect(logs.some((log) => log.includes("latest-version.txt"))).toBeTrue();
    expect(logs.some((log) => log.includes("alexandria-plugin-v0.12.0.tar.gz"))).toBeTrue();
    expect(logs.some((log) => log.includes("ax-v0.12.0-linux-x64.tar.gz"))).toBeTrue();
    expect(logs.some((log) => log.includes("fabro-v0.12.0-linux-x64.tar.gz"))).toBeTrue();
  });
});
